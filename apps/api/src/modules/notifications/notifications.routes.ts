import crypto from 'crypto'
import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { registerSSE } from '../../lib/notify'
import * as notificationsService from './notifications.service'

export const notificationsRouter = Router()

// ─── SSE ticket store ─────────────────────────────────────────────────────────
// Short-lived opaque tickets issued to authenticated clients so access tokens
// never appear in SSE URLs, server logs, or browser history.

type SseTicket = { userId: string; orgId: string; role: string; expiresAt: number }
const sseTickets = new Map<string, SseTicket>()

setInterval(() => {
  const now = Date.now()
  for (const [k, v] of sseTickets) if (v.expiresAt < now) sseTickets.delete(k)
}, 30_000)

// GET /api/v1/notifications/stream — MUST be registered BEFORE authenticate middleware.
// EventSource cannot send Authorization headers; auth is done via the ?ticket= query param.
notificationsRouter.get('/stream', (req, res) => {
  const ticket = req.query.ticket as string | undefined
  if (!ticket) { res.status(401).json({ error: 'Unauthorized' }); return }

  const session = sseTickets.get(ticket)
  if (!session || session.expiresAt < Date.now()) {
    sseTickets.delete(ticket)
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  sseTickets.delete(ticket) // one-time use — client fetches a new ticket on reconnect

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  res.write(': connected\n\n')

  const keepAlive = setInterval(() => res.write(': ping\n\n'), 25_000)
  const unregister = registerSSE(session.userId, res)

  req.on('close', () => {
    clearInterval(keepAlive)
    unregister()
  })
})

// All routes below require a valid Bearer access token
notificationsRouter.use(authenticate)

// GET /api/v1/notifications/ticket — issue a 60-second SSE ticket (requires auth)
notificationsRouter.get('/ticket', (req, res) => {
  const ticket = crypto.randomUUID()
  sseTickets.set(ticket, {
    userId: req.auth.userId,
    orgId: req.auth.orgId,
    role: req.auth.role,
    expiresAt: Date.now() + 60_000,
  })
  res.json({ ticket })
})

// GET /api/v1/notifications
notificationsRouter.get('/', async (req, res, next) => {
  try {
    res.json(await notificationsService.list(req.auth))
  } catch (err) {
    next(err)
  }
})

// PATCH /api/v1/notifications/:id/read
notificationsRouter.patch('/:id/read', async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    await notificationsService.markRead(req.auth, id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/notifications/read-all
notificationsRouter.post('/read-all', async (req, res, next) => {
  try {
    await notificationsService.markAllRead(req.auth)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
