import crypto from 'crypto'
import { eq, and, desc, asc, sql } from 'drizzle-orm'
import { db } from '../../db/client'
import {
  serviceOrders,
  serviceOrderMessages,
  serviceOrderMilestones,
  serviceOrderDeliveries,
  servicePackages,
  services,
  serviceRequirements,
  users,
} from '../../db/schema'

import { AppError } from '../../lib/errors'
import type { AccessTokenPayload } from '../../lib/tokens'
import { emailServiceOrderPlaced, emailServiceOrderDelivered, emailServiceOrderCompleted, emailExpertAssigned, emailServiceOrderAssignedClient } from '../../lib/email'
import { notify } from '../../lib/notify'
import { getPresignedUploadUrl, getPresignedDownloadUrl } from '../../lib/storage'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const [row] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(serviceOrders)
  const seq = String((row?.count ?? 0) + 1).padStart(4, '0')
  return `SO-${year}-${seq}`
}

function assertOwnerOrAdmin(auth: AccessTokenPayload, clientId: string) {
  if (auth.role !== 'admin' && auth.role !== 'owner' && auth.userId !== clientId) {
    throw new AppError('Forbidden', 403)
  }
}

// ─── Client: place order ──────────────────────────────────────────────────────

export async function placeOrder(auth: AccessTokenPayload, packageId: string) {
  const [pkg] = await db
    .select({ id: servicePackages.id, serviceId: servicePackages.serviceId, name: servicePackages.name, priceCents: servicePackages.priceCents, currency: servicePackages.currency, revisions: servicePackages.revisions })
    .from(servicePackages)
    .where(and(eq(servicePackages.id, packageId), eq(servicePackages.active, true)))
    .limit(1)

  if (!pkg) throw new AppError('Package not found', 404)

  const orderNumber = await generateOrderNumber()

  const [order] = await db
    .insert(serviceOrders)
    .values({
      orderNumber,
      serviceId: pkg.serviceId,
      packageId: pkg.id,
      clientId: auth.userId,
      status: 'pending',
      priceCents: pkg.priceCents,
      currency: pkg.currency,
    })
    .returning()

  await db.insert(serviceOrderMessages).values({
    orderId: order.id,
    senderId: auth.userId,
    type: 'system',
    body: `Order ${orderNumber} placed. Awaiting payment confirmation.`,
    isReadByClient: true,
  })

  // In-app notification (fire-and-forget)
  notify({
    userId: auth.userId,
    orgId: auth.orgId,
    type: 'order_placed',
    title: `Order ${orderNumber} received`,
    body: 'We\'ve received your order and will process it shortly.',
    metadata: { orderId: order.id, orderNumber },
  }).catch(() => {})

  // Email (fire-and-forget)
  ;(async () => {
    const [[client], [svc]] = await Promise.all([
      db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, auth.userId)).limit(1),
      db.select({ title: services.title }).from(services).where(eq(services.id, pkg.serviceId)).limit(1),
    ])
    if (client && svc) {
      await emailServiceOrderPlaced({
        clientEmail: client.email,
        clientName: client.name,
        orderNumber,
        serviceTitle: svc.title,
        packageName: pkg.name,
        priceCents: pkg.priceCents,
        currency: pkg.currency,
      })
    }
  })().catch(() => {})

  return order
}

// ─── Get order detail ─────────────────────────────────────────────────────────

export async function getOrder(auth: AccessTokenPayload, id: string) {
  const [row] = await db
    .select({
      order: serviceOrders,
      service: { title: services.title, slug: services.slug, category: services.category },
      pkg: { name: servicePackages.name, deliveryDays: servicePackages.deliveryDays, revisions: servicePackages.revisions },
      client: { id: users.id, name: users.name, email: users.email },
    })
    .from(serviceOrders)
    .innerJoin(services, eq(serviceOrders.serviceId, services.id))
    .innerJoin(servicePackages, eq(serviceOrders.packageId, servicePackages.id))
    .innerJoin(users, eq(serviceOrders.clientId, users.id))
    .where(eq(serviceOrders.id, id))
    .limit(1)

  if (!row) throw new AppError('Order not found', 404)
  assertOwnerOrAdmin(auth, row.order.clientId)

  const isAdmin = auth.role === 'admin' || auth.role === 'owner'
  if (isAdmin) {
    db.update(serviceOrderMessages)
      .set({ isReadByExpert: true })
      .where(and(eq(serviceOrderMessages.orderId, id), eq(serviceOrderMessages.isReadByExpert, false)))
      .then(() => {}).catch(() => {})
  } else {
    db.update(serviceOrderMessages)
      .set({ isReadByClient: true })
      .where(and(eq(serviceOrderMessages.orderId, id), eq(serviceOrderMessages.isReadByClient, false)))
      .then(() => {}).catch(() => {})
  }

  const expertId = row.order.assignedExpertId

  const [messages, milestones, deliveries, requirements, expertRows] = await Promise.all([
    db
      .select()
      .from(serviceOrderMessages)
      .where(eq(serviceOrderMessages.orderId, id))
      .orderBy(asc(serviceOrderMessages.createdAt)),
    db
      .select()
      .from(serviceOrderMilestones)
      .where(eq(serviceOrderMilestones.orderId, id))
      .orderBy(asc(serviceOrderMilestones.sortOrder)),
    db
      .select()
      .from(serviceOrderDeliveries)
      .where(eq(serviceOrderDeliveries.orderId, id))
      .orderBy(desc(serviceOrderDeliveries.createdAt)),
    db
      .select({ label: serviceRequirements.label, fieldType: serviceRequirements.fieldType, required: serviceRequirements.required })
      .from(serviceRequirements)
      .where(eq(serviceRequirements.serviceId, row.order.serviceId))
      .orderBy(asc(serviceRequirements.sortOrder)),
    expertId
      ? db.select({ name: users.name, avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, expertId)).limit(1)
      : Promise.resolve([] as { name: string; avatarUrl: string | null }[]),
  ])

  const expert = expertRows[0] ?? null
  return { ...row, expert, messages, milestones, deliveries, requirements }
}

// ─── List: client's own orders ────────────────────────────────────────────────

export async function listMyOrders(auth: AccessTokenPayload) {
  return db
    .select({
      order: serviceOrders,
      serviceTitle: services.title,
      serviceSlug: services.slug,
      serviceCategory: services.category,
      packageName: servicePackages.name,
    })
    .from(serviceOrders)
    .innerJoin(services, eq(serviceOrders.serviceId, services.id))
    .innerJoin(servicePackages, eq(serviceOrders.packageId, servicePackages.id))
    .where(eq(serviceOrders.clientId, auth.userId))
    .orderBy(desc(serviceOrders.createdAt))
}

// ─── List: admin all orders ───────────────────────────────────────────────────

export async function listAllOrders(_auth: AccessTokenPayload) {
  return db
    .select({
      order: serviceOrders,
      serviceTitle: services.title,
      packageName: servicePackages.name,
      clientName: users.name,
      clientEmail: users.email,
    })
    .from(serviceOrders)
    .innerJoin(services, eq(serviceOrders.serviceId, services.id))
    .innerJoin(servicePackages, eq(serviceOrders.packageId, servicePackages.id))
    .innerJoin(users, eq(serviceOrders.clientId, users.id))
    .orderBy(desc(serviceOrders.createdAt))
}

// ─── Submit requirements ──────────────────────────────────────────────────────

export async function submitRequirements(
  auth: AccessTokenPayload,
  id: string,
  data: Record<string, string>,
) {
  const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, id)).limit(1)
  if (!order) throw new AppError('Order not found', 404)
  assertOwnerOrAdmin(auth, order.clientId)

  if (!['payment_received', 'requirements_needed'].includes(order.status)) {
    throw new AppError('Requirements cannot be submitted in current status', 400)
  }

  const [updated] = await db
    .update(serviceOrders)
    .set({
      requirementsData: data,
      requirementsSubmittedAt: new Date(),
      status: 'requirements_submitted',
      updatedAt: new Date(),
    })
    .where(eq(serviceOrders.id, id))
    .returning()

  await db.insert(serviceOrderMessages).values({
    orderId: id,
    senderId: auth.userId,
    type: 'system',
    body: 'Requirements submitted. Our team will review and assign an expert shortly.',
    isReadByClient: true,
  })

  return updated
}

// ─── Send message ─────────────────────────────────────────────────────────────

export async function sendMessage(
  auth: AccessTokenPayload,
  orderId: string,
  body: string,
  attachments: { key: string; name: string; size: number }[],
) {
  const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, orderId)).limit(1)
  if (!order) throw new AppError('Order not found', 404)
  assertOwnerOrAdmin(auth, order.clientId)

  const isAdmin = auth.role === 'admin' || auth.role === 'owner'

  const [msg] = await db
    .insert(serviceOrderMessages)
    .values({
      orderId,
      senderId: auth.userId,
      type: 'message',
      body,
      attachments,
      isReadByClient: isAdmin,
      isReadByExpert: !isAdmin,
    })
    .returning()

  if (!isAdmin && order.status === 'waiting_for_client') {
    await db
      .update(serviceOrders)
      .set({ status: 'in_progress', updatedAt: new Date() })
      .where(eq(serviceOrders.id, orderId))
  }

  return msg
}

// ─── Admin: assign order ──────────────────────────────────────────────────────

export async function assignOrder(
  auth: AccessTokenPayload,
  id: string,
  expertId: string,
  dueDate?: string,
  notes?: string,
) {
  const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, id)).limit(1)
  if (!order) throw new AppError('Order not found', 404)

  const [updated] = await db
    .update(serviceOrders)
    .set({
      assignedExpertId: expertId,
      status: 'assigned',
      assignedAt: new Date(),
      dueDate: dueDate ?? null,
      internalNotes: notes ?? order.internalNotes,
      updatedAt: new Date(),
    })
    .where(eq(serviceOrders.id, id))
    .returning()

  await db.insert(serviceOrderMessages).values({
    orderId: id,
    senderId: auth.userId,
    type: 'system',
    body: 'Your order has been assigned to an expert. Work will begin shortly.',
  })

  // Notify expert and client (fire-and-forget)
  notify({
    userId: expertId,
    orgId: auth.orgId,
    type: 'order_assigned',
    title: 'New order assigned to you',
    body: `Order ${order.orderNumber} has been assigned. Check your workspace.`,
    metadata: { orderId: id, orderNumber: order.orderNumber },
  }).catch(() => {})
  notify({
    userId: order.clientId,
    orgId: auth.orgId,
    type: 'order_assigned',
    title: 'Expert assigned to your order',
    body: `Order ${order.orderNumber} — an expert is now working on your project.`,
    metadata: { orderId: id, orderNumber: order.orderNumber },
  }).catch(() => {})

  // Email expert and client
  Promise.all([
    db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, expertId)).limit(1),
    db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, order.clientId)).limit(1),
    db.select({ title: services.title }).from(services).where(eq(services.id, order.serviceId)).limit(1),
  ]).then(([expertRows, clientRows, serviceRows]) => {
    const expert = expertRows[0]
    const client = clientRows[0]
    const serviceTitle = serviceRows[0]?.title ?? 'Your order'
    if (expert) {
      emailExpertAssigned({
        expertEmail: expert.email,
        expertName: expert.name,
        orderNumber: order.orderNumber,
        serviceTitle,
        clientName: client?.name ?? 'Client',
        dueDate: dueDate ?? null,
        orderId: id,
      }).catch(() => {})
    }
    if (client) {
      emailServiceOrderAssignedClient({
        clientEmail: client.email,
        clientName: client.name,
        orderNumber: order.orderNumber,
        serviceTitle,
        expertName: expert?.name ?? 'Our expert',
        orderId: id,
      }).catch(() => {})
    }
  }).catch(() => {})

  return updated
}

// ─── Admin: mark payment received ─────────────────────────────────────────────

export async function markPaymentReceived(auth: AccessTokenPayload, id: string) {
  const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, id)).limit(1)
  if (!order) throw new AppError('Order not found', 404)
  if (order.status !== 'pending') throw new AppError('Order is not pending', 400)

  const [updated] = await db
    .update(serviceOrders)
    .set({ status: 'requirements_needed', updatedAt: new Date() })
    .where(eq(serviceOrders.id, id))
    .returning()

  await db.insert(serviceOrderMessages).values({
    orderId: id,
    senderId: auth.userId,
    type: 'system',
    body: 'Payment confirmed. Please submit your project requirements to get started.',
  })

  return updated
}

// ─── Admin: mark in progress ──────────────────────────────────────────────────

export async function markInProgress(auth: AccessTokenPayload, id: string) {
  const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, id)).limit(1)
  if (!order) throw new AppError('Order not found', 404)

  const [updated] = await db
    .update(serviceOrders)
    .set({ status: 'in_progress', updatedAt: new Date() })
    .where(eq(serviceOrders.id, id))
    .returning()

  await db.insert(serviceOrderMessages).values({
    orderId: id,
    senderId: auth.userId,
    type: 'system',
    body: 'Work has begun on your order.',
  })

  return updated
}

// ─── Expert/Admin: deliver order ──────────────────────────────────────────────

export async function deliverOrder(
  auth: AccessTokenPayload,
  orderId: string,
  message: string,
  files: { key: string; name: string; size: number }[],
  isRevisionDelivery: boolean,
) {
  const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, orderId)).limit(1)
  if (!order) throw new AppError('Order not found', 404)

  const [delivery] = await db
    .insert(serviceOrderDeliveries)
    .values({ orderId, deliveredBy: auth.userId, message, files, isRevisionDelivery })
    .returning()

  await db
    .update(serviceOrders)
    .set({ status: 'delivered', deliveredAt: new Date(), updatedAt: new Date() })
    .where(eq(serviceOrders.id, orderId))

  await db.insert(serviceOrderMessages).values({
    orderId,
    senderId: auth.userId,
    type: 'delivery',
    body: message,
    attachments: files,
  })

  return delivery
}

// ─── Client: request revision ─────────────────────────────────────────────────

export async function requestRevision(
  auth: AccessTokenPayload,
  orderId: string,
  reason: string,
) {
  const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, orderId)).limit(1)
  if (!order) throw new AppError('Order not found', 404)
  assertOwnerOrAdmin(auth, order.clientId)
  if (order.status !== 'delivered') throw new AppError('Order has not been delivered', 400)

  const [pkg] = await db
    .select({ revisions: servicePackages.revisions })
    .from(servicePackages)
    .where(eq(servicePackages.id, order.packageId))
    .limit(1)

  if (pkg && order.revisionCount >= pkg.revisions) {
    throw new AppError(
      `This package includes ${pkg.revisions} revision${pkg.revisions === 1 ? '' : 's'} and all have been used.`,
      400,
    )
  }

  await db
    .update(serviceOrders)
    .set({
      status: 'revision_requested',
      revisionCount: order.revisionCount + 1,
      updatedAt: new Date(),
    })
    .where(eq(serviceOrders.id, orderId))

  await db.insert(serviceOrderMessages).values({
    orderId,
    senderId: auth.userId,
    type: 'revision_request',
    body: reason,
  })

  return { ok: true }
}

// ─── Client: approve delivery ─────────────────────────────────────────────────

export async function approveDelivery(auth: AccessTokenPayload, orderId: string) {
  const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, orderId)).limit(1)
  if (!order) throw new AppError('Order not found', 404)
  assertOwnerOrAdmin(auth, order.clientId)
  if (order.status !== 'delivered') throw new AppError('Order has not been delivered', 400)

  // Accept latest delivery
  const [latest] = await db
    .select()
    .from(serviceOrderDeliveries)
    .where(eq(serviceOrderDeliveries.orderId, orderId))
    .orderBy(desc(serviceOrderDeliveries.createdAt))
    .limit(1)

  if (latest) {
    await db
      .update(serviceOrderDeliveries)
      .set({ acceptedAt: new Date() })
      .where(eq(serviceOrderDeliveries.id, latest.id))
  }

  const [updated] = await db
    .update(serviceOrders)
    .set({ status: 'completed', completedAt: new Date(), updatedAt: new Date() })
    .where(eq(serviceOrders.id, orderId))
    .returning()

  await db.insert(serviceOrderMessages).values({
    orderId,
    senderId: auth.userId,
    type: 'system',
    body: 'Delivery approved. Order completed. Thank you for working with E-Tech!',
    isReadByClient: true,
  })

  // Email client (fire-and-forget)
  ;(async () => {
    const [[client], [svc]] = await Promise.all([
      db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, order.clientId)).limit(1),
      db.select({ title: services.title }).from(services).where(eq(services.id, order.serviceId)).limit(1),
    ])
    if (client && svc) {
      await emailServiceOrderCompleted({
        clientEmail: client.email,
        clientName: client.name,
        orderNumber: order.orderNumber,
        serviceTitle: svc.title,
      })
    }
  })().catch(() => {})

  return updated
}

// ─── Admin: cancel order ──────────────────────────────────────────────────────

export async function cancelOrder(auth: AccessTokenPayload, id: string, reason: string) {
  const [updated] = await db
    .update(serviceOrders)
    .set({ status: 'cancelled', cancelledAt: new Date(), cancelReason: reason, updatedAt: new Date() })
    .where(eq(serviceOrders.id, id))
    .returning()
  if (!updated) throw new AppError('Order not found', 404)

  await db.insert(serviceOrderMessages).values({
    orderId: id,
    senderId: auth.userId,
    type: 'system',
    body: `Order cancelled. Reason: ${reason}`,
  })

  return updated
}

// ─── Inbox: aggregated conversation list ─────────────────────────────────────

export async function listInbox(auth: AccessTokenPayload) {
  const rows = await db
    .select({
      order: serviceOrders,
      serviceTitle: services.title,
      packageName: servicePackages.name,
      lastMessageAt: sql<string | null>`(
        SELECT created_at FROM service_order_messages
        WHERE order_id = service_orders.id
        ORDER BY created_at DESC LIMIT 1
      )`,
      lastMessageBody: sql<string | null>`(
        SELECT body FROM service_order_messages
        WHERE order_id = service_orders.id
        ORDER BY created_at DESC LIMIT 1
      )`,
      lastMessageType: sql<string | null>`(
        SELECT type FROM service_order_messages
        WHERE order_id = service_orders.id
        ORDER BY created_at DESC LIMIT 1
      )`,
      unreadCount: sql<number>`(
        SELECT cast(count(*) as int) FROM service_order_messages
        WHERE order_id = service_orders.id AND is_read_by_client = false
      )`,
    })
    .from(serviceOrders)
    .innerJoin(services, eq(serviceOrders.serviceId, services.id))
    .innerJoin(servicePackages, eq(serviceOrders.packageId, servicePackages.id))
    .where(eq(serviceOrders.clientId, auth.userId))
    .orderBy(
      desc(
        sql`COALESCE(
          (SELECT created_at FROM service_order_messages WHERE order_id = service_orders.id ORDER BY created_at DESC LIMIT 1),
          service_orders.created_at
        )`,
      ),
    )

  return rows
}

export async function listAdminInbox(_auth: AccessTokenPayload) {
  const rows = await db
    .select({
      order: serviceOrders,
      serviceTitle: services.title,
      packageName: servicePackages.name,
      clientName: users.name,
      clientEmail: users.email,
      lastMessageAt: sql<string | null>`(
        SELECT created_at FROM service_order_messages
        WHERE order_id = service_orders.id
        ORDER BY created_at DESC LIMIT 1
      )`,
      lastMessageBody: sql<string | null>`(
        SELECT body FROM service_order_messages
        WHERE order_id = service_orders.id
        ORDER BY created_at DESC LIMIT 1
      )`,
      lastMessageType: sql<string | null>`(
        SELECT type FROM service_order_messages
        WHERE order_id = service_orders.id
        ORDER BY created_at DESC LIMIT 1
      )`,
      unreadCount: sql<number>`(
        SELECT cast(count(*) as int) FROM service_order_messages
        WHERE order_id = service_orders.id AND is_read_by_expert = false
      )`,
    })
    .from(serviceOrders)
    .innerJoin(services, eq(serviceOrders.serviceId, services.id))
    .innerJoin(servicePackages, eq(serviceOrders.packageId, servicePackages.id))
    .innerJoin(users, eq(serviceOrders.clientId, users.id))
    .where(sql`status NOT IN ('completed', 'cancelled')`)
    .orderBy(
      desc(sql`unread_count`),
      desc(
        sql`COALESCE(
          (SELECT created_at FROM service_order_messages WHERE order_id = service_orders.id ORDER BY created_at DESC LIMIT 1),
          service_orders.created_at
        )`,
      ),
    )

  return rows
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export async function createMilestone(
  auth: AccessTokenPayload,
  orderId: string,
  data: { title: string; description?: string; dueDate?: string; sortOrder?: number },
) {
  const [row] = await db
    .insert(serviceOrderMilestones)
    .values({ orderId, ...data })
    .returning()
  return row
}

export async function completeMilestone(_auth: AccessTokenPayload, milestoneId: string) {
  const [row] = await db
    .update(serviceOrderMilestones)
    .set({ completedAt: new Date() })
    .where(eq(serviceOrderMilestones.id, milestoneId))
    .returning()
  if (!row) throw new AppError('Milestone not found', 404)
  return row
}

// ─── File delivery: presigned upload / download URLs ─────────────────────────

export async function getOrderUploadUrl(
  ctx: AccessTokenPayload,
  orderId: string,
  name: string,
  mimeType: string,
): Promise<{ uploadUrl: string; storageKey: string }> {
  const order = await db.query.serviceOrders.findFirst({
    where: eq(serviceOrders.id, orderId),
    columns: { id: true, clientId: true, assignedExpertId: true },
  })
  if (!order) throw new AppError('Order not found', 404)

  const isAdmin = ctx.role === 'admin' || ctx.role === 'owner'
  const isExpert = ctx.userId === order.assignedExpertId
  const isClient = ctx.userId === order.clientId

  if (!isAdmin && !isExpert && !isClient) throw new AppError('Forbidden', 403)

  const parts = name.split('.')
  const ext = parts.length > 1 ? parts.pop()! : ''
  const key = `service-orders/${orderId}/${crypto.randomUUID()}${ext ? `.${ext}` : ''}`
  const uploadUrl = await getPresignedUploadUrl(key, mimeType)
  return { uploadUrl, storageKey: key }
}

export async function getOrderFileDownloadUrl(
  ctx: AccessTokenPayload,
  orderId: string,
  key: string,
  name: string,
): Promise<{ url: string }> {
  const order = await db.query.serviceOrders.findFirst({
    where: eq(serviceOrders.id, orderId),
    columns: { id: true, clientId: true, assignedExpertId: true },
  })
  if (!order) throw new AppError('Order not found', 404)

  const isAdmin = ctx.role === 'admin' || ctx.role === 'owner'
  const isClient = ctx.userId === order.clientId
  const isExpert = ctx.userId === order.assignedExpertId

  if (!isAdmin && !isClient && !isExpert) throw new AppError('Forbidden', 403)

  if (!key.startsWith(`service-orders/${orderId}/`)) {
    throw new AppError('Invalid file key', 400)
  }

  const url = await getPresignedDownloadUrl(key, name)
  return { url }
}
