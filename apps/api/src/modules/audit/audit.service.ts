import { desc, eq, and, gte } from 'drizzle-orm'
import { db } from '../../db/client'
import { auditLogs } from '../../db/schema/audit'
import { users } from '../../db/schema/users'

export async function log(opts: {
  actorId?: string | null
  action: string
  entityType?: string
  entityId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}) {
  await db.insert(auditLogs).values({
    actorId: opts.actorId ?? null,
    action: opts.action,
    entityType: opts.entityType ?? null,
    entityId: opts.entityId ?? null,
    details: opts.details ?? null,
    ipAddress: opts.ipAddress ?? null,
  })
}

export async function listLogs(opts: {
  limit?: number
  offset?: number
  action?: string
  entityType?: string
  since?: Date
}) {
  const { limit = 50, offset = 0, action, entityType, since } = opts

  const conditions = []
  if (action) conditions.push(eq(auditLogs.action, action))
  if (entityType) conditions.push(eq(auditLogs.entityType, entityType))
  if (since) conditions.push(gte(auditLogs.createdAt, since))

  const rows = await db
    .select({
      log: auditLogs,
      actorName: users.name,
      actorEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset)

  return rows
}
