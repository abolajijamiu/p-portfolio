import { db } from '../db/client'
import { notifications } from '../db/schema'

type NotificationType = typeof notifications.$inferInsert['type']

type NotifyOpts = {
  userId: string
  orgId: string
  type: NotificationType
  title: string
  body?: string
  metadata?: Record<string, unknown>
}

export async function notify(opts: NotifyOpts): Promise<void> {
  await db.insert(notifications).values({
    userId: opts.userId,
    orgId: opts.orgId,
    type: opts.type,
    title: opts.title,
    body: opts.body ?? null,
    metadata: opts.metadata ?? null,
  })
}
