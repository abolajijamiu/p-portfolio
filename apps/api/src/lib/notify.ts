import type { Response } from 'express'
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

// ─── SSE connection registry ──────────────────────────────────────────────────

const connections = new Map<string, Set<Response>>()

export function registerSSE(userId: string, res: Response): () => void {
  if (!connections.has(userId)) connections.set(userId, new Set())
  connections.get(userId)!.add(res)
  return () => {
    const set = connections.get(userId)
    if (set) {
      set.delete(res)
      if (set.size === 0) connections.delete(userId)
    }
  }
}

function pushSSE(userId: string, data: Record<string, unknown>) {
  const set = connections.get(userId)
  if (!set) return
  const payload = `event: notification\ndata: ${JSON.stringify(data)}\n\n`
  for (const res of set) {
    try { res.write(payload) } catch { /* connection dropped */ }
  }
}

// ─── Notify ───────────────────────────────────────────────────────────────────

export async function notify(opts: NotifyOpts): Promise<void> {
  const [row] = await db.insert(notifications).values({
    userId: opts.userId,
    orgId: opts.orgId,
    type: opts.type,
    title: opts.title,
    body: opts.body ?? null,
    metadata: opts.metadata ?? null,
  }).returning({ id: notifications.id })

  pushSSE(opts.userId, {
    id: row.id,
    type: opts.type,
    title: opts.title,
    body: opts.body ?? null,
  })
}
