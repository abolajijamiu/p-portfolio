import crypto from 'crypto'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../../db/client'
import {
  commerceCustomers,
  commerceEvents,
  commerceOrderItems,
  commerceOrders,
  deliverableTypes,
  deliverables,
  memberships,
  notifications,
  productMappings,
  resourceLicenses,
  resourcePurchases,
  resources,
  serviceDeliverables,
  serviceOrderMessages,
  serviceOrders,
  servicePackages,
  wcWebhookEvents,
  users,
} from '../../db/schema'
import { AppError } from '../../lib/errors'
import {
  emailCommerceOrderConfirmed,
  emailLicenseIssued,
  emailInvoiceGenerated,
  emailServiceOrderPlaced,
} from '../../lib/email'
import { notify } from '../../lib/notify'
import type { AccessTokenPayload } from '../../lib/tokens'
import type { CreateDeliverableTypeInput, UpsertMappingInput } from './commerce.schema'
import type { MappedOrder } from '../woocommerce/woocommerce.mapper'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function logEvent(
  orgId: string,
  orderId: string,
  event: string,
  detail?: Record<string, unknown>,
  status: 'ok' | 'error' | 'skipped' = 'ok',
) {
  await db.insert(commerceEvents).values({ orgId, orderId, event, status, detail: detail ?? null }).catch(() => {})
}

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `INV-${year}-`
  const result = await db.execute(
    sql`SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM ${prefix.length + 1}) AS INTEGER)), 0) + 1 AS next_seq
        FROM commerce_orders WHERE invoice_number LIKE ${prefix + '%'}`,
  )
  const next = (result.rows[0] as { next_seq: number } | undefined)?.next_seq ?? 1
  return `${prefix}${String(next).padStart(4, '0')}`
}

async function generateDeliverableNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `DEL-${year}-`
  const result = await db.execute(
    sql`SELECT COALESCE(MAX(CAST(SUBSTRING(deliverable_number FROM ${prefix.length + 1}) AS INTEGER)), 0) + 1 AS next_seq
        FROM service_deliverables WHERE deliverable_number LIKE ${prefix + '%'}`,
  )
  const next = (result.rows[0] as { next_seq: number } | undefined)?.next_seq ?? 1
  return `${prefix}${String(next).padStart(4, '0')}`
}

function generateLicenseKey(): string {
  return `LIC-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
}

function generateDownloadToken(): string {
  return `tok_${crypto.randomBytes(16).toString('hex')}`
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export async function upsertCustomer(orgId: string, email: string, name: string) {
  const portalUser = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  })

  const existing = await db.query.commerceCustomers.findFirst({
    where: and(eq(commerceCustomers.orgId, orgId), eq(commerceCustomers.email, email)),
  })

  if (existing) {
    const [updated] = await db
      .update(commerceCustomers)
      .set({ name, userId: portalUser?.id ?? existing.userId, updatedAt: new Date() })
      .where(eq(commerceCustomers.id, existing.id))
      .returning()
    return updated
  }

  const [customer] = await db
    .insert(commerceCustomers)
    .values({ orgId, email, name, userId: portalUser?.id ?? null })
    .returning()
  return customer
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function upsertOrder(orgId: string, customerId: string, mapped: MappedOrder) {
  const existing = await db.query.commerceOrders.findFirst({
    where: and(
      eq(commerceOrders.orgId, orgId),
      eq(commerceOrders.provider, 'woocommerce'),
      eq(commerceOrders.externalId, mapped.externalId),
    ),
    columns: { id: true, status: true },
  })

  if (existing) {
    const [updated] = await db
      .update(commerceOrders)
      .set({
        status: mapped.status as any,
        totalCents: mapped.totalCents,
        currency: mapped.currency,
        metadata: mapped.metadata,
        updatedAt: new Date(),
      })
      .where(eq(commerceOrders.id, existing.id))
      .returning()
    return { order: updated, previousStatus: existing.status, isNew: false }
  }

  const invoiceNumber = await generateInvoiceNumber()

  return db.transaction(async (tx) => {
    const [order] = await tx
      .insert(commerceOrders)
      .values({
        orgId,
        customerId,
        invoiceNumber,
        status: mapped.status as any,
        totalCents: mapped.totalCents,
        currency: mapped.currency,
        provider: 'woocommerce',
        externalId: mapped.externalId,
        metadata: mapped.metadata,
      })
      .returning()

    if (mapped.lineItems.length > 0) {
      await tx.insert(commerceOrderItems).values(
        mapped.lineItems.map((item) => ({
          orderId: order.id,
          externalProductId: item.externalProductId,
          productName: item.productName,
          priceCents: item.priceCents,
          quantity: item.quantity,
        })),
      )
    }

    return { order, previousStatus: null as string | null, isNew: true }
  })
}

// ─── Deliverables Engine ──────────────────────────────────────────────────────

export async function processDeliverables(
  orgId: string,
  orderId: string,
  customerId: string,
  lineItems: MappedOrder['lineItems'],
) {
  if (lineItems.length === 0) return []

  const externalProductIds = lineItems.map((i) => i.externalProductId)

  const mappings = await db.query.productMappings.findMany({
    where: and(
      eq(productMappings.orgId, orgId),
      eq(productMappings.provider, 'woocommerce'),
      eq(productMappings.active, true),
      inArray(productMappings.externalProductId, externalProductIds),
    ),
    with: { deliverableType: true },
  })

  if (mappings.length === 0) return []

  const inserted = await db
    .insert(deliverables)
    .values(
      mappings.map((m) => ({
        orgId,
        orderId,
        customerId,
        deliverableTypeId: m.deliverableTypeId,
      })),
    )
    .returning()

  return inserted.map((d, i) => ({
    ...d,
    deliverableType: mappings[i]?.deliverableType,
    mapping: mappings[i],
    lineItem: lineItems.find((li) => li.externalProductId === mappings[i]?.externalProductId),
  }))
}

// ─── Operations Engine ────────────────────────────────────────────────────────

export async function triggerOperations(
  orgId: string,
  order: { id: string; invoiceNumber?: string | null; totalCents: number; currency: string },
  customer: { email: string; name: string },
  created: Awaited<ReturnType<typeof processDeliverables>>,
) {
  const adminMembers = await db.query.memberships.findMany({
    where: and(eq(memberships.orgId, orgId), inArray(memberships.role, ['owner', 'admin'])),
    columns: { userId: true },
  })

  const adminUserIds = adminMembers.map((m) => m.userId)

  if (adminUserIds.length > 0) {
    const formattedTotal = `${(order.totalCents / 100).toFixed(2)} ${order.currency}`
    await db.insert(notifications).values(
      adminUserIds.map((userId) => ({
        orgId,
        userId,
        type: 'order_received' as const,
        title: 'New commerce order',
        body: `${customer.name} (${customer.email}) — ${formattedTotal}`,
        metadata: { resourceId: order.id },
      })),
    )
  }

  // Find portal user linked to this customer email
  const portalUser = await db.query.users.findFirst({
    where: eq(users.email, customer.email),
    columns: { id: true },
  })

  // Log order received event
  await logEvent(orgId, order.id, 'order.received', { invoiceNumber: order.invoiceNumber, totalCents: order.totalCents, currency: order.currency })

  if (order.invoiceNumber) {
    await logEvent(orgId, order.id, 'invoice.generated', { invoiceNumber: order.invoiceNumber })
  }

  // Run category-specific fulfillment for each deliverable
  for (const del of created) {
    const category = del.deliverableType?.category
    const config = del.mapping?.config as Record<string, string> | undefined

    if ((category === 'license' || category === 'theme') && config?.resourceId && config?.resourceLicenseId) {
      await fulfillLicense({
        orgId,
        userId: portalUser?.id ?? null,
        resourceId: config.resourceId,
        licenseId: config.resourceLicenseId,
        customer,
        order,
        deliverable: del,
      })
    } else if ((category === 'license' || category === 'theme') && (!config?.resourceId || !config?.resourceLicenseId)) {
      await logEvent(orgId, order.id, 'license.skipped', { reason: 'config_missing', category, config }, 'error')
    }

    if (category === 'service' && config?.serviceId && config?.packageId) {
      await fulfillServiceOrder({
        orgId,
        orderId: order.id,
        userId: portalUser?.id ?? null,
        serviceId: config.serviceId,
        packageId: config.packageId,
        customer,
        order,
        deliverable: del,
      })
    } else if (category === 'service' && (!config?.serviceId || !config?.packageId)) {
      await logEvent(orgId, order.id, 'service_order.skipped', { reason: 'config_missing', config }, 'error')
    }

    if (category === 'consultation' && config?.serviceId && config?.packageId) {
      await fulfillConsultation({
        orgId,
        orderId: order.id,
        userId: portalUser?.id ?? null,
        serviceId: config.serviceId,
        packageId: config.packageId,
        customer,
        order,
        deliverable: del,
      })
    } else if (category === 'consultation' && (!config?.serviceId || !config?.packageId)) {
      await logEvent(orgId, order.id, 'consultation.skipped', { reason: 'config_missing', config }, 'error')
    }

    if (category === 'analytics' && config?.serviceId && config?.packageId) {
      await fulfillAnalytics({
        orgId,
        orderId: order.id,
        userId: portalUser?.id ?? null,
        serviceId: config.serviceId,
        packageId: config.packageId,
        customer,
        order,
        deliverable: del,
      })
    } else if (category === 'analytics' && (!config?.serviceId || !config?.packageId)) {
      await logEvent(orgId, order.id, 'analytics.skipped', { reason: 'config_missing', config }, 'error')
    }

    if (category === 'custom_project') {
      await fulfillCustomProject({
        orgId,
        orderId: order.id,
        userId: portalUser?.id ?? null,
        customer,
        deliverable: del,
      })
    }
  }

  // Order confirmation email
  emailCommerceOrderConfirmed({
    to: customer.email,
    name: customer.name,
    orderId: order.id,
    invoiceNumber: order.invoiceNumber ?? undefined,
    totalCents: order.totalCents,
    currency: order.currency,
    deliverableCount: created.length,
    items: created.map((d) => ({
      name: d.deliverableType?.name ?? d.lineItem?.productName ?? 'Item',
      priceCents: d.lineItem?.priceCents ?? 0,
    })),
  })
    .then(() => logEvent(orgId, order.id, 'email.order_confirmed'))
    .catch((err: unknown) => {
      console.error(JSON.stringify({ level: 'error', msg: 'Order confirmation email failed', error: String(err) }))
      logEvent(orgId, order.id, 'email.order_confirmed', { error: String(err) }, 'error')
    })

  if (order.invoiceNumber) {
    emailInvoiceGenerated({
      to: customer.email,
      name: customer.name,
      invoiceNumber: order.invoiceNumber,
      orderId: order.id,
      totalCents: order.totalCents,
      currency: order.currency,
      items: created.map((d) => ({
        name: d.deliverableType?.name ?? d.lineItem?.productName ?? 'Item',
        priceCents: d.lineItem?.priceCents ?? 0,
      })),
    })
      .then(() => logEvent(orgId, order.id, 'email.invoice_sent'))
      .catch((err: unknown) => {
        console.error(JSON.stringify({ level: 'error', msg: 'Invoice email failed', error: String(err) }))
        logEvent(orgId, order.id, 'email.invoice_sent', { error: String(err) }, 'error')
      })
  }
}

// ─── License fulfillment ──────────────────────────────────────────────────────

async function fulfillLicense(params: {
  orgId: string
  userId: string | null
  resourceId: string
  licenseId: string
  customer: { email: string; name: string }
  order: { id: string; invoiceNumber?: string | null; totalCents: number; currency: string }
  deliverable: { lineItem?: { priceCents: number } | null }
}) {
  const { orgId, userId, resourceId, licenseId, customer, order, deliverable } = params

  const resource = await db.query.resources.findFirst({
    where: eq(resources.id, resourceId),
    columns: { id: true, title: true },
  })

  const license = await db.query.resourceLicenses.findFirst({
    where: eq(resourceLicenses.id, licenseId),
    columns: { id: true, name: true, maxDownloads: true, priceCents: true },
  })

  if (!resource || !license) return

  const licenseKey = generateLicenseKey()
  const downloadToken = generateDownloadToken()

  const [purchase] = await db
    .insert(resourcePurchases)
    .values({
      userId: userId ?? undefined as any,
      resourceId,
      licenseId,
      status: 'active',
      pricePaidCents: deliverable.lineItem?.priceCents ?? license.priceCents,
      currency: order.currency,
      downloadCount: 0,
      maxDownloads: license.maxDownloads ?? null,
      downloadToken,
      licenseKey,
      activatedAt: new Date(),
    })
    .onConflictDoNothing()
    .returning()

  if (!purchase) {
    await logEvent(orgId, order.id, 'license.skipped', { reason: 'conflict', resourceId, licenseId }, 'skipped' as any)
    return
  }

  await logEvent(orgId, order.id, 'license.issued', { purchaseId: purchase.id, licenseKey: licenseKey.slice(0, 12) + '…' })

  emailLicenseIssued({
    to: customer.email,
    name: customer.name,
    resourceTitle: resource.title,
    licenseName: license.name,
    licenseKey,
    purchaseId: purchase.id,
  })
    .then(() => logEvent(orgId, order.id, 'email.license_sent'))
    .catch((err: unknown) => {
      console.error(JSON.stringify({ level: 'error', msg: 'License email failed', error: String(err) }))
      logEvent(orgId, order.id, 'email.license_sent', { error: String(err) }, 'error')
    })
}

// ─── Service order fulfillment ────────────────────────────────────────────────

async function generateOrderNumber() {
  const year = new Date().getFullYear()
  const [row] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(serviceOrders)
  return `ORD-${year}-${String((row?.count ?? 0) + 1).padStart(4, '0')}`
}

async function createServiceOrder(params: {
  orgId: string
  orderId: string
  userId: string
  serviceId: string
  packageId: string
  priceCents: number
  currency: string
  customer: { email: string; name: string }
  systemMessage: string
  adminNotificationBody: string
}) {
  const [pkg, serviceRow] = await Promise.all([
    db.select({ priceCents: servicePackages.priceCents, currency: servicePackages.currency })
      .from(servicePackages).where(eq(servicePackages.id, params.packageId)).limit(1),
    db.select({ title: resources }).from(serviceOrders).limit(0), // unused — just for serviceTitle below
  ])

  const [svcRow] = await db.select({ title: sql<string>`title` }).from(serviceOrders)
    .where(eq(serviceOrders.id, params.serviceId)).limit(0) // intentional no-op; fetch below

  // Fetch service title separately (serviceOrders doesn't have title — services does)
  const actualPkg = pkg[0]
  const orderNumber = await generateOrderNumber()

  const [order] = await db.insert(serviceOrders).values({
    orderNumber,
    serviceId: params.serviceId,
    packageId: params.packageId,
    clientId: params.userId,
    status: 'requirements_needed',
    priceCents: params.priceCents,
    currency: actualPkg?.currency ?? params.currency,
  }).returning()

  // System message for the client workspace
  await db.insert(serviceOrderMessages).values({
    orderId: order.id,
    senderId: params.userId, // system messages use client as sender placeholder
    type: 'system',
    body: params.systemMessage,
  })

  // Notify admin members
  const admins = await db.query.memberships.findMany({
    where: and(eq(memberships.orgId, params.orgId), inArray(memberships.role, ['owner', 'admin'])),
    columns: { userId: true },
  })
  if (admins.length > 0) {
    await db.insert(notifications).values(
      admins.map((m) => ({
        orgId: params.orgId,
        userId: m.userId,
        type: 'order_received' as const,
        title: 'New order from WooCommerce',
        body: params.adminNotificationBody,
        metadata: { orderId: order.id, orderNumber },
      })),
    )
  }

  return order
}

async function fulfillServiceOrder(params: {
  orgId: string
  orderId: string
  userId: string | null
  serviceId: string
  packageId: string
  customer: { email: string; name: string }
  order: { id: string; totalCents: number; currency: string }
  deliverable: { lineItem?: { priceCents: number } | null; deliverableType?: { name?: string } | null }
}) {
  if (!params.userId) {
    await logEvent(params.orgId, params.orderId, 'service_order.skipped', { reason: 'no_portal_account', customerEmail: params.customer.email })
    return
  }

  const [pkg] = await db.select({ priceCents: servicePackages.priceCents, currency: servicePackages.currency })
    .from(servicePackages).where(eq(servicePackages.id, params.packageId)).limit(1)
  if (!pkg) {
    await logEvent(params.orgId, params.orderId, 'service_order.skipped', { reason: 'package_not_found', packageId: params.packageId }, 'error')
    return
  }

  const order = await createServiceOrder({
    orgId: params.orgId,
    orderId: params.orderId,
    userId: params.userId,
    serviceId: params.serviceId,
    packageId: params.packageId,
    priceCents: params.deliverable.lineItem?.priceCents ?? pkg.priceCents,
    currency: pkg.currency,
    customer: params.customer,
    systemMessage: 'Your order has been created. Please submit your project requirements to get started.',
    adminNotificationBody: `${params.customer.name} (${params.customer.email}) — service order created via WooCommerce`,
  })

  await logEvent(params.orgId, params.orderId, 'service_order.created', { serviceOrderId: order.id, orderNumber: order.orderNumber })
}

// ─── Consultation fulfillment ─────────────────────────────────────────────────

async function fulfillConsultation(params: {
  orgId: string
  orderId: string
  userId: string | null
  serviceId: string
  packageId: string
  customer: { email: string; name: string }
  order: { id: string; totalCents: number; currency: string }
  deliverable: { lineItem?: { priceCents: number } | null }
}) {
  if (!params.userId) {
    await logEvent(params.orgId, params.orderId, 'consultation.skipped', { reason: 'no_portal_account', customerEmail: params.customer.email })
    return
  }

  const [pkg] = await db.select({ priceCents: servicePackages.priceCents, currency: servicePackages.currency })
    .from(servicePackages).where(eq(servicePackages.id, params.packageId)).limit(1)
  if (!pkg) {
    await logEvent(params.orgId, params.orderId, 'consultation.skipped', { reason: 'package_not_found' }, 'error')
    return
  }

  const order = await createServiceOrder({
    orgId: params.orgId,
    orderId: params.orderId,
    userId: params.userId,
    serviceId: params.serviceId,
    packageId: params.packageId,
    priceCents: params.deliverable.lineItem?.priceCents ?? pkg.priceCents,
    currency: pkg.currency,
    customer: params.customer,
    systemMessage: 'Your consultation has been booked. Please visit the Bookings section in your dashboard to schedule your session.',
    adminNotificationBody: `${params.customer.name} (${params.customer.email}) — consultation purchased via WooCommerce`,
  })

  await logEvent(params.orgId, params.orderId, 'consultation.created', { serviceOrderId: order.id, orderNumber: order.orderNumber })
}

// ─── Analytics fulfillment ────────────────────────────────────────────────────

async function fulfillAnalytics(params: {
  orgId: string
  orderId: string
  userId: string | null
  serviceId: string
  packageId: string
  customer: { email: string; name: string }
  order: { id: string; totalCents: number; currency: string }
  deliverable: { lineItem?: { priceCents: number } | null }
}) {
  if (!params.userId) {
    await logEvent(params.orgId, params.orderId, 'analytics.skipped', { reason: 'no_portal_account', customerEmail: params.customer.email })
    return
  }

  const [pkg] = await db.select({ priceCents: servicePackages.priceCents, currency: servicePackages.currency })
    .from(servicePackages).where(eq(servicePackages.id, params.packageId)).limit(1)
  if (!pkg) {
    await logEvent(params.orgId, params.orderId, 'analytics.skipped', { reason: 'package_not_found' }, 'error')
    return
  }

  const order = await createServiceOrder({
    orgId: params.orgId,
    orderId: params.orderId,
    userId: params.userId,
    serviceId: params.serviceId,
    packageId: params.packageId,
    priceCents: params.deliverable.lineItem?.priceCents ?? pkg.priceCents,
    currency: pkg.currency,
    customer: params.customer,
    systemMessage: 'Your analytics project has been created. Our team will be in touch to collect access credentials and begin setup.',
    adminNotificationBody: `${params.customer.name} (${params.customer.email}) — analytics project purchased via WooCommerce`,
  })

  await logEvent(params.orgId, params.orderId, 'analytics.created', { serviceOrderId: order.id, orderNumber: order.orderNumber })
}

// ─── Custom project fulfillment ───────────────────────────────────────────────

async function fulfillCustomProject(params: {
  orgId: string
  orderId: string
  userId: string | null
  customer: { email: string; name: string }
  deliverable: { deliverableType?: { name?: string } | null }
}) {
  const deliverableNumber = await generateDeliverableNumber()

  await db.insert(serviceDeliverables).values({
    deliverableNumber,
    orderId: params.orderId,
    title: params.deliverable.deliverableType?.name ?? 'Custom Project',
    status: 'pending',
    version: 1,
    files: [],
  })

  await logEvent(params.orgId, params.orderId, 'custom_project.created', { deliverableNumber })
}

// ─── Admin reads ──────────────────────────────────────────────────────────────

export async function listWebhookFailures(ctx: AccessTokenPayload) {
  return db.query.wcWebhookEvents.findMany({
    where: eq(wcWebhookEvents.status, 'failed'),
    columns: {
      id: true,
      deliveryId: true,
      topic: true,
      externalOrderId: true,
      error: true,
      createdAt: true,
    },
    orderBy: (t, { desc }) => desc(t.createdAt),
    limit: 50,
  })
}

export async function getOrderEvents(ctx: AccessTokenPayload, orderId: string) {
  return db.query.commerceEvents.findMany({
    where: and(eq(commerceEvents.orgId, ctx.orgId), eq(commerceEvents.orderId, orderId)),
    orderBy: (t, { asc }) => asc(t.createdAt),
  })
}

export async function listResourcesLite(_ctx: AccessTokenPayload) {
  return db.query.resources.findMany({
    columns: { id: true, title: true, category: true },
    with: { licenses: { columns: { id: true, name: true } } },
    orderBy: (t, { asc }) => asc(t.title),
  })
}

export async function listServicesLite(_ctx: AccessTokenPayload) {
  return db.query.services.findMany({
    columns: { id: true, title: true, category: true },
    with: { packages: { columns: { id: true, name: true, priceCents: true } } },
    orderBy: (t, { asc }) => asc(t.title),
  })
}

export async function listOrders(ctx: AccessTokenPayload) {
  return db.query.commerceOrders.findMany({
    where: eq(commerceOrders.orgId, ctx.orgId),
    with: { customer: true, items: true },
    orderBy: (o, { desc }) => desc(o.createdAt),
  })
}

export async function getOrder(ctx: AccessTokenPayload, id: string) {
  const order = await db.query.commerceOrders.findFirst({
    where: and(eq(commerceOrders.id, id), eq(commerceOrders.orgId, ctx.orgId)),
    with: {
      customer: true,
      items: true,
      deliverables: { with: { deliverableType: true } },
    },
  })
  if (!order) throw new AppError('Order not found', 404)
  return order
}

// ─── Portal reads ─────────────────────────────────────────────────────────────

export async function listMyOrders(ctx: AccessTokenPayload) {
  const me = await db.query.users.findFirst({
    where: eq(users.id, ctx.sub),
    columns: { email: true },
  })
  if (!me) throw new AppError('User not found', 404)

  const customer = await db.query.commerceCustomers.findFirst({
    where: and(
      eq(commerceCustomers.orgId, ctx.orgId),
      eq(commerceCustomers.email, me.email),
    ),
    columns: { id: true },
  })
  if (!customer) return []

  return db.query.commerceOrders.findMany({
    where: and(
      eq(commerceOrders.orgId, ctx.orgId),
      eq(commerceOrders.customerId, customer.id),
    ),
    with: { items: true },
    orderBy: (o, { desc }) => desc(o.createdAt),
  })
}

// ─── Deliverable types ────────────────────────────────────────────────────────

export async function listDeliverableTypes(ctx: AccessTokenPayload) {
  return db.query.deliverableTypes.findMany({
    where: eq(deliverableTypes.orgId, ctx.orgId),
    orderBy: (t, { asc }) => asc(t.name),
  })
}

export async function createDeliverableType(
  ctx: AccessTokenPayload,
  input: CreateDeliverableTypeInput,
) {
  const [type] = await db
    .insert(deliverableTypes)
    .values({ orgId: ctx.orgId, ...input })
    .returning()
  return type
}

// ─── Product mappings ─────────────────────────────────────────────────────────

export async function listMappings(ctx: AccessTokenPayload) {
  return db.query.productMappings.findMany({
    where: and(
      eq(productMappings.orgId, ctx.orgId),
      eq(productMappings.provider, 'woocommerce'),
    ),
    with: { deliverableType: true },
  })
}

export async function upsertMapping(ctx: AccessTokenPayload, input: UpsertMappingInput) {
  const existing = await db.query.productMappings.findFirst({
    where: and(
      eq(productMappings.orgId, ctx.orgId),
      eq(productMappings.provider, input.provider),
      eq(productMappings.externalProductId, input.externalProductId),
    ),
    columns: { id: true },
  })

  if (existing) {
    const [updated] = await db
      .update(productMappings)
      .set({
        deliverableTypeId: input.deliverableTypeId,
        config: input.config,
        active: input.active,
        updatedAt: new Date(),
      })
      .where(eq(productMappings.id, existing.id))
      .returning()
    return updated
  }

  const [mapping] = await db
    .insert(productMappings)
    .values({ orgId: ctx.orgId, ...input })
    .returning()
  return mapping
}

export async function deleteMapping(ctx: AccessTokenPayload, id: string) {
  const [deleted] = await db
    .delete(productMappings)
    .where(and(eq(productMappings.id, id), eq(productMappings.orgId, ctx.orgId)))
    .returning({ id: productMappings.id })
  if (!deleted) throw new AppError('Mapping not found', 404)
}

// ─── Deliverable fulfillment ──────────────────────────────────────────────────

export async function updateDeliverableStatus(
  ctx: AccessTokenPayload,
  id: string,
  status: 'in_progress' | 'completed' | 'cancelled',
) {
  const existing = await db.query.deliverables.findFirst({
    where: and(eq(deliverables.id, id), eq(deliverables.orgId, ctx.orgId)),
    columns: { id: true },
  })
  if (!existing) throw new AppError('Deliverable not found', 404)

  const [updated] = await db
    .update(deliverables)
    .set({
      status,
      completedAt: status === 'completed' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(deliverables.id, id))
    .returning()
  return updated
}
