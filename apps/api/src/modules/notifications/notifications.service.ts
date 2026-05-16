import { and, asc, desc, eq, isNull } from 'drizzle-orm'
import { db } from '../../db/client'
import { notifications } from '../../db/schema'
import type { AccessTokenPayload } from '../../lib/tokens'
import { AppError } from '../../lib/errors'

export async function list(ctx: AccessTokenPayload) {
  const rows = await db.query.notifications.findMany({
    where: and(eq(notifications.userId, ctx.sub), eq(notifications.orgId, ctx.orgId)),
    columns: {
      id: true,
      type: true,
      title: true,
      body: true,
      metadata: true,
      readAt: true,
      createdAt: true,
    },
    // Unread (readAt = null) sorts first in Postgres ASC NULLS FIRST; then newest first within each group
    orderBy: [asc(notifications.readAt), desc(notifications.createdAt)],
    limit: 20,
  })

  return rows.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    createdAt: n.createdAt,
    read: n.readAt !== null,
    link: n.metadata?.projectId ? `/projects/${n.metadata.projectId}` : null,
  }))
}

export async function markRead(ctx: AccessTokenPayload, notificationId: string) {
  const result = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, ctx.sub),
        eq(notifications.orgId, ctx.orgId),
        isNull(notifications.readAt),
      ),
    )
    .returning({ id: notifications.id })

  if (!result.length) throw new AppError('Notification not found', 404)
}
