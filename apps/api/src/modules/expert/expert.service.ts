import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { db } from '../../db/client'
import {
  serviceOrders,
  serviceOrderMessages,
  serviceOrderMilestones,
  serviceOrderDeliveries,
  servicePackages,
  services,
  users,
  expertPayouts,
} from '../../db/schema'
import { AppError } from '../../lib/errors'
import type { AccessTokenPayload } from '../../lib/tokens'
import { emailServiceOrderDelivered, emailPayoutRecorded } from '../../lib/email'
import { notify } from '../../lib/notify'

// ─── Expert: list assigned orders ─────────────────────────────────────────────

export async function listAssignedOrders(auth: AccessTokenPayload) {
  return db
    .select({
      order: serviceOrders,
      serviceTitle: services.title,
      serviceSlug: services.slug,
      packageName: servicePackages.name,
      packageDeliveryDays: servicePackages.deliveryDays,
      clientName: users.name,
      clientEmail: users.email,
    })
    .from(serviceOrders)
    .innerJoin(services, eq(serviceOrders.serviceId, services.id))
    .innerJoin(servicePackages, eq(serviceOrders.packageId, servicePackages.id))
    .innerJoin(users, eq(serviceOrders.clientId, users.id))
    .where(eq(serviceOrders.assignedExpertId, auth.userId))
    .orderBy(desc(serviceOrders.updatedAt))
}

// ─── Expert: get order detail ─────────────────────────────────────────────────

export async function getAssignedOrder(auth: AccessTokenPayload, orderId: string) {
  const [row] = await db
    .select({
      order: serviceOrders,
      service: { title: services.title, slug: services.slug, category: services.category },
      pkg: { name: servicePackages.name, deliveryDays: servicePackages.deliveryDays, revisions: servicePackages.revisions },
      client: { name: users.name, email: users.email },
    })
    .from(serviceOrders)
    .innerJoin(services, eq(serviceOrders.serviceId, services.id))
    .innerJoin(servicePackages, eq(serviceOrders.packageId, servicePackages.id))
    .innerJoin(users, eq(serviceOrders.clientId, users.id))
    .where(and(eq(serviceOrders.id, orderId), eq(serviceOrders.assignedExpertId, auth.userId)))
    .limit(1)

  if (!row) throw new AppError('Order not found or not assigned to you', 404)

  const [messages, milestones, deliveries] = await Promise.all([
    db.select().from(serviceOrderMessages).where(eq(serviceOrderMessages.orderId, orderId)).orderBy(asc(serviceOrderMessages.createdAt)),
    db.select().from(serviceOrderMilestones).where(eq(serviceOrderMilestones.orderId, orderId)).orderBy(asc(serviceOrderMilestones.sortOrder)),
    db.select().from(serviceOrderDeliveries).where(eq(serviceOrderDeliveries.orderId, orderId)).orderBy(desc(serviceOrderDeliveries.createdAt)),
  ])

  return { ...row, messages, milestones, deliveries }
}

// ─── Expert: send message ─────────────────────────────────────────────────────

export async function expertSendMessage(
  auth: AccessTokenPayload,
  orderId: string,
  body: string,
  attachments: { key: string; name: string; size: number }[],
) {
  const [order] = await db
    .select()
    .from(serviceOrders)
    .where(and(eq(serviceOrders.id, orderId), eq(serviceOrders.assignedExpertId, auth.userId)))
    .limit(1)

  if (!order) throw new AppError('Order not found or not assigned to you', 404)

  const [msg] = await db
    .insert(serviceOrderMessages)
    .values({ orderId, senderId: auth.userId, type: 'message', body, attachments, isReadByExpert: true })
    .returning()

  return msg
}

// ─── Expert: mark in progress ─────────────────────────────────────────────────

export async function expertMarkInProgress(auth: AccessTokenPayload, orderId: string) {
  const [order] = await db
    .select()
    .from(serviceOrders)
    .where(and(eq(serviceOrders.id, orderId), eq(serviceOrders.assignedExpertId, auth.userId)))
    .limit(1)

  if (!order) throw new AppError('Order not found or not assigned to you', 404)
  if (!['assigned', 'requirements_submitted'].includes(order.status)) {
    throw new AppError('Cannot mark this order as in progress', 400)
  }

  const [updated] = await db
    .update(serviceOrders)
    .set({ status: 'in_progress', updatedAt: new Date() })
    .where(eq(serviceOrders.id, orderId))
    .returning()

  await db.insert(serviceOrderMessages).values({
    orderId,
    senderId: auth.userId,
    type: 'system',
    body: 'Work has begun on your order.',
  })

  return updated
}

// ─── Expert: deliver order ────────────────────────────────────────────────────

export async function expertDeliverOrder(
  auth: AccessTokenPayload,
  orderId: string,
  message: string,
  files: { key: string; name: string; size: number }[],
  isRevisionDelivery: boolean,
) {
  const [order] = await db
    .select()
    .from(serviceOrders)
    .where(and(eq(serviceOrders.id, orderId), eq(serviceOrders.assignedExpertId, auth.userId)))
    .limit(1)

  if (!order) throw new AppError('Order not found or not assigned to you', 404)

  const allowed = isRevisionDelivery
    ? ['revision_requested'].includes(order.status)
    : ['in_progress', 'assigned'].includes(order.status)

  if (!allowed) throw new AppError('Cannot deliver in current order status', 400)

  const [delivery] = await db
    .insert(serviceOrderDeliveries)
    .values({ orderId, deliveredBy: auth.userId, message, files, isRevisionDelivery })
    .returning()

  await db.update(serviceOrders).set({ status: 'delivered', deliveredAt: new Date(), updatedAt: new Date() }).where(eq(serviceOrders.id, orderId))

  await db.insert(serviceOrderMessages).values({
    orderId,
    senderId: auth.userId,
    type: 'delivery',
    body: message,
    attachments: files,
  })

  // Notify client (fire-and-forget)
  notify({
    userId: order.clientId,
    orgId: auth.orgId,
    type: 'order_delivered',
    title: 'Your delivery is ready',
    body: `Order ${order.orderNumber} has been delivered. Please review and approve.`,
    metadata: { orderId: orderId, orderNumber: order.orderNumber },
  }).catch(() => {})

  // Email client about delivery (fire-and-forget)
  ;(async () => {
    const [[client], [svc]] = await Promise.all([
      db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, order.clientId)).limit(1),
      db.select({ title: services.title }).from(services).where(eq(services.id, order.serviceId)).limit(1),
    ])
    if (client && svc) {
      await emailServiceOrderDelivered({
        clientEmail: client.email,
        clientName: client.name,
        orderNumber: order.orderNumber,
        serviceTitle: svc.title,
        deliveryMessage: message,
      })
    }
  })().catch(() => {})

  return delivery
}

// ─── Expert: stats ────────────────────────────────────────────────────────────

export async function expertStats(auth: AccessTokenPayload) {
  const [orderStats] = await db
    .select({
      total: sql<number>`cast(count(*) as int)`,
      active: sql<number>`cast(sum(case when status not in ('completed','cancelled') then 1 else 0 end) as int)`,
      completed: sql<number>`cast(sum(case when status = 'completed' then 1 else 0 end) as int)`,
      delivering: sql<number>`cast(sum(case when status in ('in_progress','assigned') then 1 else 0 end) as int)`,
    })
    .from(serviceOrders)
    .where(eq(serviceOrders.assignedExpertId, auth.userId))

  const [payoutStats] = await db
    .select({
      totalEarned: sql<number>`cast(coalesce(sum(case when status = 'paid' then amount_cents else 0 end), 0) as int)`,
      pendingPayout: sql<number>`cast(coalesce(sum(case when status = 'pending' then amount_cents else 0 end), 0) as int)`,
    })
    .from(expertPayouts)
    .where(eq(expertPayouts.expertId, auth.userId))

  return { orders: orderStats, payouts: payoutStats }
}

// ─── Expert: payout history ───────────────────────────────────────────────────

export async function expertListPayouts(auth: AccessTokenPayload) {
  return db
    .select({
      payout: expertPayouts,
      orderNumber: serviceOrders.orderNumber,
      serviceTitle: services.title,
    })
    .from(expertPayouts)
    .leftJoin(serviceOrders, eq(expertPayouts.orderId, serviceOrders.id))
    .leftJoin(services, eq(serviceOrders.serviceId, services.id))
    .where(eq(expertPayouts.expertId, auth.userId))
    .orderBy(desc(expertPayouts.createdAt))
}

// ─── Admin: list all payouts ──────────────────────────────────────────────────

export async function adminListPayouts(status?: string) {
  return db
    .select({
      payout: expertPayouts,
      expertName: users.name,
      expertEmail: users.email,
      orderNumber: serviceOrders.orderNumber,
      serviceTitle: services.title,
    })
    .from(expertPayouts)
    .innerJoin(users, eq(expertPayouts.expertId, users.id))
    .leftJoin(serviceOrders, eq(expertPayouts.orderId, serviceOrders.id))
    .leftJoin(services, eq(serviceOrders.serviceId, services.id))
    .where(status ? eq(expertPayouts.status, status as 'pending' | 'paid' | 'cancelled') : undefined)
    .orderBy(desc(expertPayouts.createdAt))
}

export async function adminCreatePayout(data: {
  expertId: string
  orderId?: string
  amountCents: number
  description?: string
  adminNotes?: string
}) {
  const [row] = await db.insert(expertPayouts).values(data).returning()

  // Notify expert (fire-and-forget)
  ;(async () => {
    const [expert] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, data.expertId)).limit(1)
    if (expert) {
      await emailPayoutRecorded({
        expertEmail: expert.email,
        expertName: expert.name,
        amountCents: data.amountCents,
        currency: row.currency,
        description: data.description,
        status: 'pending',
      })
    }
  })().catch(() => {})

  return row
}

export async function adminMarkPayoutPaid(id: string) {
  const [row] = await db
    .update(expertPayouts)
    .set({ status: 'paid', paidAt: new Date(), updatedAt: new Date() })
    .where(eq(expertPayouts.id, id))
    .returning()
  if (!row) throw new AppError('Payout not found', 404)

  // Notify expert of payment (fire-and-forget)
  ;(async () => {
    const [expert] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, row.expertId)).limit(1)
    if (expert) {
      await emailPayoutRecorded({
        expertEmail: expert.email,
        expertName: expert.name,
        amountCents: row.amountCents,
        currency: row.currency,
        description: row.description,
        status: 'paid',
      })
    }
  })().catch(() => {})

  return row
}

export async function adminCancelPayout(id: string) {
  const [row] = await db
    .update(expertPayouts)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(expertPayouts.id, id))
    .returning()
  if (!row) throw new AppError('Payout not found', 404)
  return row
}

export async function adminPayoutStats() {
  const [row] = await db.select({
    totalPaid: sql<number>`cast(coalesce(sum(case when status='paid' then amount_cents else 0 end),0) as int)`,
    totalPending: sql<number>`cast(coalesce(sum(case when status='pending' then amount_cents else 0 end),0) as int)`,
    countPending: sql<number>`cast(sum(case when status='pending' then 1 else 0 end) as int)`,
  }).from(expertPayouts)
  return row
}

// ─── Admin: list experts ──────────────────────────────────────────────────────

export async function adminListExperts() {
  const { memberships } = await import('../../db/schema')
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .innerJoin(memberships, eq(users.id, memberships.userId))
    .where(eq(memberships.role, 'expert'))
    .orderBy(asc(users.name))
}
