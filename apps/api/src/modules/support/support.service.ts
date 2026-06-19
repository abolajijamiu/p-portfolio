import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '../../db/client'
import { supportTickets, supportTicketMessages } from '../../db/schema/support'
import { users } from '../../db/schema/users'
import type { AccessTokenPayload } from '../../lib/tokens'
import { log } from '../audit/audit.service'
import { emailSupportTicketNew, emailSupportTicketReply } from '../../lib/email'
import { notify } from '../../lib/notify'

type SupportCategory = 'general' | 'billing' | 'technical' | 'orders' | 'resources' | 'analytics' | 'consultations'

async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const [row] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(supportTickets)
  const seq = String((row?.count ?? 0) + 1).padStart(4, '0')
  return `SUP-${year}-${seq}`
}

// ─── Client ───────────────────────────────────────────────────────────────────

export async function createTicket(
  auth: AccessTokenPayload,
  body: { subject: string; message: string; category?: SupportCategory },
  ipAddress?: string,
) {
  const ticketNumber = await generateTicketNumber()

  const [ticket] = await db
    .insert(supportTickets)
    .values({ ticketNumber, userId: auth.userId, subject: body.subject, category: body.category ?? 'general' })
    .returning()

  await db.insert(supportTicketMessages).values({
    ticketId: ticket.id,
    senderId: auth.userId,
    body: body.message,
    isStaff: false,
  })

  await log({ actorId: auth.userId, action: 'support.ticket.create', entityType: 'support_ticket', entityId: ticket.id, ipAddress })

  // Notify admin (fire-and-forget)
  ;(async () => {
    const [client] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, auth.userId)).limit(1)
    if (client) {
      await emailSupportTicketNew({
        clientEmail: client.email,
        clientName: client.name,
        ticketSubject: body.subject,
        message: body.message,
      })
    }
  })().catch(() => {})

  return ticket
}

export async function listMyTickets(auth: AccessTokenPayload) {
  return db
    .select({ ticket: supportTickets })
    .from(supportTickets)
    .where(eq(supportTickets.userId, auth.userId))
    .orderBy(desc(supportTickets.updatedAt))
}

export async function getMyTicket(auth: AccessTokenPayload, ticketId: string) {
  const [row] = await db
    .select({ ticket: supportTickets })
    .from(supportTickets)
    .where(and(eq(supportTickets.id, ticketId), eq(supportTickets.userId, auth.userId)))

  if (!row) throw Object.assign(new Error('Ticket not found'), { status: 404 })

  const messages = await db
    .select({
      message: supportTicketMessages,
      senderName: users.name,
    })
    .from(supportTicketMessages)
    .innerJoin(users, eq(supportTicketMessages.senderId, users.id))
    .where(eq(supportTicketMessages.ticketId, ticketId))
    .orderBy(supportTicketMessages.createdAt)

  return { ticket: row.ticket, messages }
}

export async function replyToTicket(auth: AccessTokenPayload, ticketId: string, body: string) {
  const [row] = await db
    .select({ ticket: supportTickets })
    .from(supportTickets)
    .where(and(eq(supportTickets.id, ticketId), eq(supportTickets.userId, auth.userId)))

  if (!row) throw Object.assign(new Error('Ticket not found'), { status: 404 })
  if (row.ticket.status === 'closed') throw Object.assign(new Error('Ticket is closed'), { status: 400 })

  const [msg] = await db
    .insert(supportTicketMessages)
    .values({ ticketId, senderId: auth.userId, body, isStaff: false })
    .returning()

  await db
    .update(supportTickets)
    .set({ status: 'open', updatedAt: new Date() })
    .where(eq(supportTickets.id, ticketId))

  return msg
}

export async function closeMyTicket(auth: AccessTokenPayload, ticketId: string) {
  const [row] = await db
    .select({ ticket: supportTickets })
    .from(supportTickets)
    .where(and(eq(supportTickets.id, ticketId), eq(supportTickets.userId, auth.userId)))

  if (!row) throw Object.assign(new Error('Ticket not found'), { status: 404 })

  await db
    .update(supportTickets)
    .set({ status: 'closed', closedAt: new Date(), updatedAt: new Date() })
    .where(eq(supportTickets.id, ticketId))
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function adminListTickets(statusFilter?: string) {
  const rows = await db
    .select({
      ticket: supportTickets,
      userName: users.name,
      userEmail: users.email,
    })
    .from(supportTickets)
    .innerJoin(users, eq(supportTickets.userId, users.id))
    .where(statusFilter && statusFilter !== 'all' ? eq(supportTickets.status, statusFilter as 'open' | 'in_progress' | 'closed') : undefined)
    .orderBy(desc(supportTickets.updatedAt))

  return rows
}

export async function adminGetTicket(ticketId: string) {
  const [row] = await db
    .select({
      ticket: supportTickets,
      userName: users.name,
      userEmail: users.email,
    })
    .from(supportTickets)
    .innerJoin(users, eq(supportTickets.userId, users.id))
    .where(eq(supportTickets.id, ticketId))

  if (!row) throw Object.assign(new Error('Ticket not found'), { status: 404 })

  const messages = await db
    .select({
      message: supportTicketMessages,
      senderName: users.name,
    })
    .from(supportTicketMessages)
    .innerJoin(users, eq(supportTicketMessages.senderId, users.id))
    .where(eq(supportTicketMessages.ticketId, ticketId))
    .orderBy(supportTicketMessages.createdAt)

  return { ...row, messages }
}

export async function adminReply(
  auth: AccessTokenPayload,
  ticketId: string,
  body: string,
) {
  const [row] = await db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.id, ticketId))

  if (!row) throw Object.assign(new Error('Ticket not found'), { status: 404 })

  const [msg] = await db
    .insert(supportTicketMessages)
    .values({ ticketId, senderId: auth.userId, body, isStaff: true })
    .returning()

  await db
    .update(supportTickets)
    .set({ status: 'in_progress', updatedAt: new Date() })
    .where(eq(supportTickets.id, ticketId))

  await log({ actorId: auth.userId, action: 'support.ticket.reply', entityType: 'support_ticket', entityId: ticketId })

  // In-app notification (fire-and-forget)
  notify({
    userId: row.userId,
    orgId: auth.orgId,
    type: 'support_reply',
    title: 'Support ticket reply',
    body: `Re: ${row.subject}`,
    metadata: { ticketId },
  }).catch(() => {})

  // Email client (fire-and-forget)
  ;(async () => {
    const [client] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, row.userId)).limit(1)
    if (client) {
      await emailSupportTicketReply({
        clientEmail: client.email,
        clientName: client.name,
        ticketSubject: row.subject,
        replyBody: body,
        ticketId,
      })
    }
  })().catch(() => {})

  return msg
}

export async function adminCloseTicket(auth: AccessTokenPayload, ticketId: string) {
  await db
    .update(supportTickets)
    .set({ status: 'closed', closedAt: new Date(), updatedAt: new Date() })
    .where(eq(supportTickets.id, ticketId))

  await log({ actorId: auth.userId, action: 'support.ticket.close', entityType: 'support_ticket', entityId: ticketId })
}

export async function adminReopenTicket(auth: AccessTokenPayload, ticketId: string) {
  await db
    .update(supportTickets)
    .set({ status: 'open', closedAt: null, updatedAt: new Date() })
    .where(eq(supportTickets.id, ticketId))

  await log({ actorId: auth.userId, action: 'support.ticket.reopen', entityType: 'support_ticket', entityId: ticketId })
}

export async function adminSetPriority(auth: AccessTokenPayload, ticketId: string, priority: 'low' | 'normal' | 'high' | 'urgent') {
  await db
    .update(supportTickets)
    .set({ priority, updatedAt: new Date() })
    .where(eq(supportTickets.id, ticketId))

  await log({ actorId: auth.userId, action: 'support.ticket.priority', entityType: 'support_ticket', entityId: ticketId, details: { priority } })
}
