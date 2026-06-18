import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import { validate } from '../../middleware/validate'
import * as svc from './service-orders.service'
import { createCheckout } from '../stripe/stripe.service'
import { requestTestimonial } from '../testimonials/testimonials.service'
import {
  placeOrderSchema,
  submitRequirementsSchema,
  sendMessageSchema,
  createDeliverySchema,
  requestRevisionSchema,
  createMilestoneSchema,
  assignOrderSchema,
  cancelOrderSchema,
} from './service-orders.schema'

// ─── Client portal routes — /service-orders ───────────────────────────────────

export const serviceOrdersRouter = Router()
serviceOrdersRouter.use(authenticate)

// GET /service-orders/mine
serviceOrdersRouter.get('/mine', async (req, res, next) => {
  try {
    res.json(await svc.listMyOrders(req.auth))
  } catch (err) {
    next(err)
  }
})

// GET /service-orders/mine/inbox
serviceOrdersRouter.get('/mine/inbox', async (req, res, next) => {
  try {
    res.json(await svc.listInbox(req.auth))
  } catch (err) {
    next(err)
  }
})

// GET /service-orders/:id
serviceOrdersRouter.get('/:id', async (req, res, next) => {
  try {
    res.json(await svc.getOrder(req.auth, req.params.id as string))
  } catch (err) {
    next(err)
  }
})

// POST /service-orders/checkout — create order + Stripe Checkout session
serviceOrdersRouter.post('/checkout', async (req, res, next) => {
  try {
    const { packageId } = req.body as { packageId: string }
    if (!packageId) { res.status(400).json({ error: 'packageId required' }); return }
    res.json(await createCheckout(req.auth, packageId))
  } catch (err) {
    next(err)
  }
})

// POST /service-orders — place order directly (no payment — admin/legacy)
serviceOrdersRouter.post('/', validate(placeOrderSchema), async (req, res, next) => {
  try {
    res.status(201).json(await svc.placeOrder(req.auth, req.body.packageId))
  } catch (err) {
    next(err)
  }
})

// POST /service-orders/:id/requirements
serviceOrdersRouter.post(
  '/:id/requirements',
  validate(submitRequirementsSchema),
  async (req, res, next) => {
    try {
      res.json(await svc.submitRequirements(req.auth, req.params.id as string, req.body.requirementsData))
    } catch (err) {
      next(err)
    }
  },
)

// POST /service-orders/:id/messages
serviceOrdersRouter.post(
  '/:id/messages',
  validate(sendMessageSchema),
  async (req, res, next) => {
    try {
      const { body, attachments } = req.body
      res.status(201).json(await svc.sendMessage(req.auth, req.params.id as string, body, attachments))
    } catch (err) {
      next(err)
    }
  },
)

// POST /service-orders/:id/revision
serviceOrdersRouter.post(
  '/:id/revision',
  validate(requestRevisionSchema),
  async (req, res, next) => {
    try {
      res.json(await svc.requestRevision(req.auth, req.params.id as string, req.body.reason))
    } catch (err) {
      next(err)
    }
  },
)

// POST /service-orders/:id/approve
serviceOrdersRouter.post('/:id/approve', async (req, res, next) => {
  try {
    res.json(await svc.approveDelivery(req.auth, req.params.id as string))
  } catch (err) {
    next(err)
  }
})

// POST /service-orders/:id/upload-url — presigned S3 upload URL (expert or admin)
serviceOrdersRouter.post('/:id/upload-url', async (req, res, next) => {
  try {
    const { name, mimeType } = req.body as { name: string; mimeType?: string }
    res.json(await svc.getOrderUploadUrl(req.auth, req.params.id as string, name, mimeType ?? 'application/octet-stream'))
  } catch (err) {
    next(err)
  }
})

// GET /service-orders/:id/files/download-url — presigned S3 download URL
serviceOrdersRouter.get('/:id/files/download-url', async (req, res, next) => {
  try {
    const { key, name } = req.query as { key: string; name: string }
    res.json(await svc.getOrderFileDownloadUrl(req.auth, req.params.id as string, key, name))
  } catch (err) {
    next(err)
  }
})

// ─── Admin routes — /cms/service-orders ──────────────────────────────────────

export const cmsServiceOrdersRouter = Router()
const guard = [authenticate, authorize('admin')]

// GET /cms/service-orders
cmsServiceOrdersRouter.get('/', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.listAllOrders(req.auth))
  } catch (err) {
    next(err)
  }
})

// GET /cms/service-orders/inbox
cmsServiceOrdersRouter.get('/inbox', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.listAdminInbox(req.auth))
  } catch (err) {
    next(err)
  }
})

// GET /cms/service-orders/:id
cmsServiceOrdersRouter.get('/:id', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.getOrder(req.auth, req.params.id as string))
  } catch (err) {
    next(err)
  }
})

// POST /cms/service-orders/:id/payment-received
cmsServiceOrdersRouter.post('/:id/payment-received', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.markPaymentReceived(req.auth, req.params.id as string))
  } catch (err) {
    next(err)
  }
})

// POST /cms/service-orders/:id/assign
cmsServiceOrdersRouter.post(
  '/:id/assign',
  ...guard,
  validate(assignOrderSchema),
  async (req, res, next) => {
    try {
      const { expertId, dueDate, internalNotes } = req.body
      res.json(await svc.assignOrder(req.auth, req.params.id as string, expertId, dueDate, internalNotes))
    } catch (err) {
      next(err)
    }
  },
)

// POST /cms/service-orders/:id/in-progress
cmsServiceOrdersRouter.post('/:id/in-progress', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.markInProgress(req.auth, req.params.id as string))
  } catch (err) {
    next(err)
  }
})

// POST /cms/service-orders/:id/deliver
cmsServiceOrdersRouter.post(
  '/:id/deliver',
  ...guard,
  validate(createDeliverySchema),
  async (req, res, next) => {
    try {
      const { message, files, isRevisionDelivery } = req.body
      res.status(201).json(
        await svc.deliverOrder(req.auth, req.params.id as string, message, files, isRevisionDelivery),
      )
    } catch (err) {
      next(err)
    }
  },
)

// POST /cms/service-orders/:id/messages
cmsServiceOrdersRouter.post(
  '/:id/messages',
  ...guard,
  validate(sendMessageSchema),
  async (req, res, next) => {
    try {
      const { body, attachments } = req.body
      res.status(201).json(await svc.sendMessage(req.auth, req.params.id as string, body, attachments))
    } catch (err) {
      next(err)
    }
  },
)

// POST /cms/service-orders/:id/milestones
cmsServiceOrdersRouter.post(
  '/:id/milestones',
  ...guard,
  validate(createMilestoneSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await svc.createMilestone(req.auth, req.params.id as string, req.body))
    } catch (err) {
      next(err)
    }
  },
)

// PATCH /cms/service-orders/milestones/:milestoneId/complete
cmsServiceOrdersRouter.patch(
  '/milestones/:milestoneId/complete',
  ...guard,
  async (req, res, next) => {
    try {
      res.json(await svc.completeMilestone(req.auth, req.params.milestoneId as string))
    } catch (err) {
      next(err)
    }
  },
)

// POST /cms/service-orders/:id/upload-url — admin presigned upload URL
cmsServiceOrdersRouter.post('/:id/upload-url', ...guard, async (req, res, next) => {
  try {
    const { name, mimeType } = req.body as { name: string; mimeType?: string }
    res.json(await svc.getOrderUploadUrl(req.auth, req.params.id as string, name, mimeType ?? 'application/octet-stream'))
  } catch (err) {
    next(err)
  }
})

// GET /cms/service-orders/:id/files/download-url — admin presigned download URL
cmsServiceOrdersRouter.get('/:id/files/download-url', ...guard, async (req, res, next) => {
  try {
    const { key, name } = req.query as { key: string; name: string }
    res.json(await svc.getOrderFileDownloadUrl(req.auth, req.params.id as string, key, name))
  } catch (err) {
    next(err)
  }
})

// POST /cms/service-orders/:id/request-testimonial
cmsServiceOrdersRouter.post('/:id/request-testimonial', ...guard, async (req, res, next) => {
  try {
    res.status(201).json(await requestTestimonial(req.auth, req.params.id as string))
  } catch (err) {
    next(err)
  }
})

// POST /cms/service-orders/:id/cancel
cmsServiceOrdersRouter.post(
  '/:id/cancel',
  ...guard,
  validate(cancelOrderSchema),
  async (req, res, next) => {
    try {
      res.json(await svc.cancelOrder(req.auth, req.params.id as string, req.body.reason))
    } catch (err) {
      next(err)
    }
  },
)
