import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import * as svc from './support.service'

export const supportRouter = Router()
export const cmsSupportRouter = Router()

const auth = [authenticate]
const guard = [authenticate, authorize('admin')]

// ─── Client routes ────────────────────────────────────────────────────────────

supportRouter.get('/', ...auth, async (req, res, next) => {
  try { res.json(await svc.listMyTickets(req.auth)) } catch (err) { next(err) }
})

supportRouter.post('/', ...auth, async (req, res, next) => {
  try {
    const ticket = await svc.createTicket(req.auth, req.body, req.ip)
    res.status(201).json(ticket)
  } catch (err) { next(err) }
})

supportRouter.get('/:id', ...auth, async (req, res, next) => {
  try { res.json(await svc.getMyTicket(req.auth, req.params.id as string)) } catch (err) { next(err) }
})

supportRouter.post('/:id/messages', ...auth, async (req, res, next) => {
  try {
    const msg = await svc.replyToTicket(req.auth, req.params.id as string, req.body.body)
    res.status(201).json(msg)
  } catch (err) { next(err) }
})

supportRouter.post('/:id/close', ...auth, async (req, res, next) => {
  try {
    await svc.closeMyTicket(req.auth, req.params.id as string)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ─── Admin routes ─────────────────────────────────────────────────────────────

cmsSupportRouter.get('/', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.adminListTickets(req.query.status as string | undefined))
  } catch (err) { next(err) }
})

cmsSupportRouter.get('/:id', ...guard, async (req, res, next) => {
  try { res.json(await svc.adminGetTicket(req.params.id as string)) } catch (err) { next(err) }
})

cmsSupportRouter.post('/:id/reply', ...guard, async (req, res, next) => {
  try {
    const msg = await svc.adminReply(req.auth, req.params.id as string, req.body.body)
    res.status(201).json(msg)
  } catch (err) { next(err) }
})

cmsSupportRouter.post('/:id/close', ...guard, async (req, res, next) => {
  try {
    await svc.adminCloseTicket(req.auth, req.params.id as string)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

cmsSupportRouter.post('/:id/reopen', ...guard, async (req, res, next) => {
  try {
    await svc.adminReopenTicket(req.auth, req.params.id as string)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

cmsSupportRouter.patch('/:id/priority', ...guard, async (req, res, next) => {
  try {
    await svc.adminSetPriority(req.auth, req.params.id as string, req.body.priority)
    res.json({ ok: true })
  } catch (err) { next(err) }
})
