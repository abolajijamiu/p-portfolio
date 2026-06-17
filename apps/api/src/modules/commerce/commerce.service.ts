import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../../db/client'
import {
  commerceCustomers,
  commerceOrderItems,
  commerceOrders,
  deliverableTypes,
  deliverables,
  memberships,
  notifications,
  productMappings,
  users,
} from '../../db/schema'
import { AppError } from '../../lib/errors'
import { sendOrderConfirmationEmail } from '../../lib/email'
import type { AccessTokenPayload } from '../../lib/tokens'
import type { CreateDeliverableTypeInput, UpsertMappingInput } from './commerce.schema'
import type { MappedOrder } from '../woocommerce/woocommerce.mapper'

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

  return db.transaction(async (tx) => {
    const [order] = await tx
      .insert(commerceOrders)
      .values({
        orgId,
        customerId,
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
// For each paid line item, find the matching product mapping and create a deliverable.

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

  return inserted
}

// ─── Operations Engine ────────────────────────────────────────────────────────
// Runs after deliverables are created: notifies admins, emails the customer.

export async function triggerOperations(
  orgId: string,
  order: { id: string; totalCents: number; currency: string },
  customer: { email: string; name: string },
  created: Awaited<ReturnType<typeof processDeliverables>>,
) {
  const adminMembers = await db.query.memberships.findMany({
    where: and(eq(memberships.orgId, orgId), inArray(memberships.role, ['owner', 'admin'])),
    columns: { userId: true },
  })

  if (adminMembers.length > 0) {
    const formattedTotal = `${(order.totalCents / 100).toFixed(2)} ${order.currency}`
    await db.insert(notifications).values(
      adminMembers.map(({ userId }) => ({
        orgId,
        userId,
        type: 'order_received' as const,
        title: 'New order received',
        body: `${customer.name} (${customer.email}) placed an order — ${formattedTotal}`,
        metadata: { resourceId: order.id },
      })),
    )
  }

  // Fire-and-forget — never let email failure block the webhook response
  sendOrderConfirmationEmail({
    to: customer.email,
    name: customer.name,
    orderId: order.id,
    totalCents: order.totalCents,
    currency: order.currency,
    deliverableCount: created.length,
  }).catch((err: unknown) => {
    console.error(
      JSON.stringify({ level: 'error', msg: 'Order confirmation email failed', error: String(err) }),
    )
  })
}

// ─── Admin reads ──────────────────────────────────────────────────────────────

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
