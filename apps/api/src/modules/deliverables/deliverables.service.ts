import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { db } from '../../db/client'
import { serviceDeliverables, serviceDeliverableRevisions } from '../../db/schema/deliverables'
import { serviceOrders } from '../../db/schema/services'
import { users } from '../../db/schema/users'
import { AppError } from '../../lib/errors'
import type { AccessTokenPayload } from '../../lib/tokens'
import { log } from '../audit/audit.service'
import { getPresignedUploadUrl, getPresignedDownloadUrl } from '../../lib/storage'
import {
  emailDeliverableSubmitted,
  emailRevisionRequested,
  emailDeliverableApproved,
} from '../../lib/email'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function generateDeliverableNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const [row] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(serviceDeliverables)
  const seq = String((row?.count ?? 0) + 1).padStart(4, '0')
  return `DEL-${year}-${seq}`
}

function assertClientOrAdminForOrder(auth: AccessTokenPayload, order: { clientId: string }) {
  const isAdmin = auth.role === 'admin' || auth.role === 'owner'
  if (!isAdmin && auth.userId !== order.clientId) throw new AppError('Forbidden', 403)
}

// ─── Client ───────────────────────────────────────────────────────────────────

export async function listMyDeliverables(auth: AccessTokenPayload) {
  return db
    .select({
      deliverable: serviceDeliverables,
      orderNumber: serviceOrders.orderNumber,
      serviceTitle: sql<string>`(SELECT title FROM services WHERE id = ${serviceOrders.serviceId})`,
      expertName: users.name,
    })
    .from(serviceDeliverables)
    .innerJoin(serviceOrders, eq(serviceDeliverables.orderId, serviceOrders.id))
    .leftJoin(users, eq(serviceDeliverables.assignedExpertId, users.id))
    .where(eq(serviceOrders.clientId, auth.userId))
    .orderBy(desc(serviceDeliverables.createdAt))
}

export async function getDeliverable(auth: AccessTokenPayload, id: string) {
  const [row] = await db
    .select({
      deliverable: serviceDeliverables,
      orderId: serviceOrders.id,
      orderNumber: serviceOrders.orderNumber,
      clientId: serviceOrders.clientId,
      serviceTitle: sql<string>`(SELECT title FROM services WHERE id = ${serviceOrders.serviceId})`,
      expertName: users.name,
      expertAvatar: users.avatarUrl,
    })
    .from(serviceDeliverables)
    .innerJoin(serviceOrders, eq(serviceDeliverables.orderId, serviceOrders.id))
    .leftJoin(users, eq(serviceDeliverables.assignedExpertId, users.id))
    .where(eq(serviceDeliverables.id, id))
    .limit(1)

  if (!row) throw new AppError('Deliverable not found', 404)

  const isAdmin = auth.role === 'admin' || auth.role === 'owner'
  const isExpert = auth.userId === row.deliverable.assignedExpertId
  const isClient = auth.userId === row.clientId
  if (!isAdmin && !isExpert && !isClient) throw new AppError('Forbidden', 403)

  const revisions = await db
    .select({
      revision: serviceDeliverableRevisions,
      submitterName: users.name,
    })
    .from(serviceDeliverableRevisions)
    .leftJoin(users, eq(serviceDeliverableRevisions.submittedBy, users.id))
    .where(eq(serviceDeliverableRevisions.deliverableId, id))
    .orderBy(asc(serviceDeliverableRevisions.createdAt))

  return { ...row, revisions }
}

export async function approveDeliverable(auth: AccessTokenPayload, id: string) {
  const [row] = await db
    .select({
      deliverable: serviceDeliverables,
      clientId: serviceOrders.clientId,
      orderNumber: serviceOrders.orderNumber,
    })
    .from(serviceDeliverables)
    .innerJoin(serviceOrders, eq(serviceDeliverables.orderId, serviceOrders.id))
    .where(eq(serviceDeliverables.id, id))
    .limit(1)

  if (!row) throw new AppError('Deliverable not found', 404)
  if (auth.userId !== row.clientId) throw new AppError('Forbidden', 403)
  if (row.deliverable.status !== 'submitted') throw new AppError('Deliverable is not in submitted state', 400)

  const [updated] = await db
    .update(serviceDeliverables)
    .set({ status: 'approved', approvedAt: new Date(), updatedAt: new Date() })
    .where(eq(serviceDeliverables.id, id))
    .returning()

  await log({ actorId: auth.userId, action: 'deliverable.approve', entityType: 'service_deliverable', entityId: id })

  // Notify expert
  if (row.deliverable.assignedExpertId) {
    const [client, expert] = await Promise.all([
      db.select({ name: users.name }).from(users).where(eq(users.id, row.clientId)).limit(1),
      db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, row.deliverable.assignedExpertId)).limit(1),
    ])
    if (expert[0] && client[0]) {
      emailDeliverableApproved({
        expertEmail: expert[0].email,
        expertName: expert[0].name,
        clientName: client[0].name,
        deliverableTitle: row.deliverable.title,
        deliverableNumber: row.deliverable.deliverableNumber,
      }).catch(() => {})
    }
  }

  return updated
}

export async function requestRevision(
  auth: AccessTokenPayload,
  id: string,
  body: { feedback: string },
) {
  const [row] = await db
    .select({ deliverable: serviceDeliverables, clientId: serviceOrders.clientId })
    .from(serviceDeliverables)
    .innerJoin(serviceOrders, eq(serviceDeliverables.orderId, serviceOrders.id))
    .where(eq(serviceDeliverables.id, id))
    .limit(1)

  if (!row) throw new AppError('Deliverable not found', 404)
  if (auth.userId !== row.clientId) throw new AppError('Forbidden', 403)

  await db
    .update(serviceDeliverables)
    .set({ status: 'revision_requested', updatedAt: new Date() })
    .where(eq(serviceDeliverables.id, id))

  await db.insert(serviceDeliverableRevisions).values({
    deliverableId: id,
    version: row.deliverable.version,
    submittedBy: auth.userId,
    message: body.feedback,
    files: [],
    clientFeedback: body.feedback,
  })

  await log({ actorId: auth.userId, action: 'deliverable.revision_request', entityType: 'service_deliverable', entityId: id })

  // Notify expert
  if (row.deliverable.assignedExpertId) {
    const [client, expert] = await Promise.all([
      db.select({ name: users.name }).from(users).where(eq(users.id, row.clientId)).limit(1),
      db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, row.deliverable.assignedExpertId)).limit(1),
    ])
    if (expert[0] && client[0]) {
      emailRevisionRequested({
        expertEmail: expert[0].email,
        expertName: expert[0].name,
        clientName: client[0].name,
        deliverableTitle: row.deliverable.title,
        deliverableNumber: row.deliverable.deliverableNumber,
        deliverableId: id,
        feedback: body.feedback,
      }).catch(() => {})
    }
  }
}

export async function getDeliverableDownloadUrl(auth: AccessTokenPayload, id: string, key: string, name: string) {
  const [row] = await db
    .select({ deliverable: serviceDeliverables, clientId: serviceOrders.clientId })
    .from(serviceDeliverables)
    .innerJoin(serviceOrders, eq(serviceDeliverables.orderId, serviceOrders.id))
    .where(eq(serviceDeliverables.id, id))
    .limit(1)

  if (!row) throw new AppError('Deliverable not found', 404)
  const isAdmin = auth.role === 'admin' || auth.role === 'owner'
  const isExpert = auth.userId === row.deliverable.assignedExpertId
  const isClient = auth.userId === row.clientId
  if (!isAdmin && !isExpert && !isClient) throw new AppError('Forbidden', 403)

  const url = await getPresignedDownloadUrl(key, name)
  return { url }
}

// ─── Expert ───────────────────────────────────────────────────────────────────

export async function listExpertDeliverables(auth: AccessTokenPayload) {
  return db
    .select({
      deliverable: serviceDeliverables,
      orderNumber: serviceOrders.orderNumber,
      serviceTitle: sql<string>`(SELECT title FROM services WHERE id = ${serviceOrders.serviceId})`,
      clientName: users.name,
    })
    .from(serviceDeliverables)
    .innerJoin(serviceOrders, eq(serviceDeliverables.orderId, serviceOrders.id))
    .leftJoin(users, eq(serviceOrders.clientId, users.id))
    .where(eq(serviceDeliverables.assignedExpertId, auth.userId))
    .orderBy(desc(serviceDeliverables.createdAt))
}

export async function submitDeliverable(
  auth: AccessTokenPayload,
  id: string,
  body: { message: string; files: { key: string; name: string; size: number }[] },
) {
  const [row] = await db
    .select({
      deliverable: serviceDeliverables,
      clientId: serviceOrders.clientId,
      orderNumber: serviceOrders.orderNumber,
    })
    .from(serviceDeliverables)
    .innerJoin(serviceOrders, eq(serviceDeliverables.orderId, serviceOrders.id))
    .where(and(eq(serviceDeliverables.id, id), eq(serviceDeliverables.assignedExpertId, auth.userId)))
    .limit(1)

  if (!row) throw new AppError('Deliverable not found', 404)

  const newVersion = row.deliverable.version + (row.deliverable.status === 'revision_requested' ? 1 : 0)

  await db
    .update(serviceDeliverables)
    .set({ status: 'submitted', files: body.files, version: newVersion, submittedAt: new Date(), updatedAt: new Date() })
    .where(eq(serviceDeliverables.id, id))

  await db.insert(serviceDeliverableRevisions).values({
    deliverableId: id,
    version: newVersion,
    submittedBy: auth.userId,
    message: body.message,
    files: body.files,
  })

  await log({ actorId: auth.userId, action: 'deliverable.submit', entityType: 'service_deliverable', entityId: id })

  // Notify client
  const [client] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, row.clientId))
    .limit(1)
  if (client) {
    emailDeliverableSubmitted({
      clientEmail: client.email,
      clientName: client.name,
      deliverableTitle: row.deliverable.title,
      deliverableNumber: row.deliverable.deliverableNumber,
      orderNumber: row.orderNumber,
      deliverableId: id,
      expertNote: body.message,
    }).catch(() => {})
  }
}

export async function getDeliverableUploadUrl(auth: AccessTokenPayload, id: string, name: string, mimeType: string) {
  const [row] = await db
    .select({ deliverable: serviceDeliverables })
    .from(serviceDeliverables)
    .where(and(eq(serviceDeliverables.id, id), eq(serviceDeliverables.assignedExpertId, auth.userId)))
    .limit(1)

  if (!row) throw new AppError('Deliverable not found', 404)

  const storageKey = `deliverables/${id}/${Date.now()}-${name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const uploadUrl = await getPresignedUploadUrl(storageKey, mimeType)
  return { uploadUrl, storageKey }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function adminListDeliverables(statusFilter?: string) {
  return db
    .select({
      deliverable: serviceDeliverables,
      orderNumber: serviceOrders.orderNumber,
      serviceTitle: sql<string>`(SELECT title FROM services WHERE id = ${serviceOrders.serviceId})`,
      clientName: users.name,
    })
    .from(serviceDeliverables)
    .innerJoin(serviceOrders, eq(serviceDeliverables.orderId, serviceOrders.id))
    .leftJoin(users, eq(serviceOrders.clientId, users.id))
    .where(
      statusFilter && statusFilter !== 'all'
        ? eq(serviceDeliverables.status, statusFilter as 'pending' | 'in_progress' | 'submitted' | 'revision_requested' | 'approved' | 'completed')
        : undefined
    )
    .orderBy(desc(serviceDeliverables.createdAt))
}

export async function adminCreateDeliverable(
  auth: AccessTokenPayload,
  body: { orderId: string; title: string; description?: string; assignedExpertId?: string },
) {
  const [order] = await db.select({ id: serviceOrders.id }).from(serviceOrders).where(eq(serviceOrders.id, body.orderId)).limit(1)
  if (!order) throw new AppError('Order not found', 404)

  const deliverableNumber = await generateDeliverableNumber()

  const [deliverable] = await db.insert(serviceDeliverables).values({
    deliverableNumber,
    orderId: body.orderId,
    title: body.title,
    description: body.description,
    assignedExpertId: body.assignedExpertId ?? null,
    status: 'pending',
  }).returning()

  await log({ actorId: auth.userId, action: 'deliverable.create', entityType: 'service_deliverable', entityId: deliverable.id })
  return deliverable
}

export async function adminUpdateDeliverable(
  auth: AccessTokenPayload,
  id: string,
  body: { status?: string; internalNotes?: string; assignedExpertId?: string },
) {
  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (body.status) updates.status = body.status
  if (body.internalNotes !== undefined) updates.internalNotes = body.internalNotes
  if (body.assignedExpertId !== undefined) updates.assignedExpertId = body.assignedExpertId

  const [updated] = await db.update(serviceDeliverables).set(updates).where(eq(serviceDeliverables.id, id)).returning()
  await log({ actorId: auth.userId, action: 'deliverable.update', entityType: 'service_deliverable', entityId: id, details: body })
  return updated
}
