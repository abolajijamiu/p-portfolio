import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../../middleware/authenticate'
import { validate } from '../../middleware/validate'
import * as svc from './expert.service'
import { getOrderUploadUrl, getOrderFileDownloadUrl } from '../service-orders/service-orders.service'

const deliverSchema = z.object({
  message: z.string().min(1),
  files: z.array(z.object({ key: z.string(), name: z.string(), size: z.number() })).default([]),
  isRevisionDelivery: z.boolean().default(false),
})

const messageSchema = z.object({
  body: z.string().min(1),
  attachments: z.array(z.object({ key: z.string(), name: z.string(), size: z.number() })).default([]),
})

const createPayoutSchema = z.object({
  expertId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  amountCents: z.number().int().positive(),
  description: z.string().optional(),
  adminNotes: z.string().optional(),
})

// ─── Expert portal routes — /expert ──────────────────────────────────────────

export const expertRouter = Router()
expertRouter.use(authenticate)

// GET /expert/stats
expertRouter.get('/stats', async (req, res, next) => {
  try {
    res.json(await svc.expertStats(req.auth))
  } catch (err) {
    next(err)
  }
})

// GET /expert/orders
expertRouter.get('/orders', async (req, res, next) => {
  try {
    res.json(await svc.listAssignedOrders(req.auth))
  } catch (err) {
    next(err)
  }
})

// GET /expert/orders/:id
expertRouter.get('/orders/:id', async (req, res, next) => {
  try {
    res.json(await svc.getAssignedOrder(req.auth, req.params.id as string))
  } catch (err) {
    next(err)
  }
})

// POST /expert/orders/:id/messages
expertRouter.post('/orders/:id/messages', validate(messageSchema), async (req, res, next) => {
  try {
    const { body, attachments } = req.body
    res.status(201).json(await svc.expertSendMessage(req.auth, req.params.id as string, body, attachments))
  } catch (err) {
    next(err)
  }
})

// POST /expert/orders/:id/in-progress
expertRouter.post('/orders/:id/in-progress', async (req, res, next) => {
  try {
    res.json(await svc.expertMarkInProgress(req.auth, req.params.id as string))
  } catch (err) {
    next(err)
  }
})

// POST /expert/orders/:id/deliver
expertRouter.post('/orders/:id/deliver', validate(deliverSchema), async (req, res, next) => {
  try {
    const { message, files, isRevisionDelivery } = req.body
    res.status(201).json(await svc.expertDeliverOrder(req.auth, req.params.id as string, message, files, isRevisionDelivery))
  } catch (err) {
    next(err)
  }
})

// POST /expert/orders/:id/upload-url — presigned S3 upload URL
expertRouter.post('/orders/:id/upload-url', async (req, res, next) => {
  try {
    const { name, mimeType } = req.body as { name: string; mimeType?: string }
    res.json(await getOrderUploadUrl(req.auth, req.params.id as string, name, mimeType ?? 'application/octet-stream'))
  } catch (err) {
    next(err)
  }
})

// GET /expert/orders/:id/files/download-url — presigned S3 download URL
expertRouter.get('/orders/:id/files/download-url', async (req, res, next) => {
  try {
    const { key, name } = req.query as { key: string; name: string }
    res.json(await getOrderFileDownloadUrl(req.auth, req.params.id as string, key, name))
  } catch (err) {
    next(err)
  }
})

// GET /expert/payouts
expertRouter.get('/payouts', async (req, res, next) => {
  try {
    res.json(await svc.expertListPayouts(req.auth))
  } catch (err) {
    next(err)
  }
})

// ─── Admin payout routes — /cms/payouts ──────────────────────────────────────

import { authorize } from '../../middleware/authorize'

export const cmsPayoutsRouter = Router()
const guard = [authenticate, authorize('admin')]

// GET /cms/payouts/stats
cmsPayoutsRouter.get('/stats', ...guard, async (_req, res, next) => {
  try {
    res.json(await svc.adminPayoutStats())
  } catch (err) {
    next(err)
  }
})

// GET /cms/payouts/experts
cmsPayoutsRouter.get('/experts', ...guard, async (_req, res, next) => {
  try {
    res.json(await svc.adminListExperts())
  } catch (err) {
    next(err)
  }
})

// GET /cms/payouts
cmsPayoutsRouter.get('/', ...guard, async (req, res, next) => {
  try {
    const { status } = req.query as { status?: string }
    res.json(await svc.adminListPayouts(status))
  } catch (err) {
    next(err)
  }
})

// POST /cms/payouts
cmsPayoutsRouter.post('/', ...guard, validate(createPayoutSchema), async (req, res, next) => {
  try {
    res.status(201).json(await svc.adminCreatePayout(req.body))
  } catch (err) {
    next(err)
  }
})

// POST /cms/payouts/:id/mark-paid
cmsPayoutsRouter.post('/:id/mark-paid', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.adminMarkPayoutPaid(req.params.id as string))
  } catch (err) {
    next(err)
  }
})

// POST /cms/payouts/:id/cancel
cmsPayoutsRouter.post('/:id/cancel', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.adminCancelPayout(req.params.id as string))
  } catch (err) {
    next(err)
  }
})
