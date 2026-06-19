import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import { validate } from '../../middleware/validate'
import * as commerceService from './commerce.service'
import { createDeliverableTypeSchema, upsertMappingSchema } from './commerce.schema'
import { fetchProducts } from '../woocommerce/woocommerce.client'

// ─── Admin routes — /cms/commerce ─────────────────────────────────────────────

export const cmsCommerceRouter = Router()

const guard = [authenticate, authorize('admin')]

// Orders
cmsCommerceRouter.get('/orders', ...guard, async (req, res, next) => {
  try {
    res.json(await commerceService.listOrders(req.auth))
  } catch (err) {
    next(err)
  }
})

cmsCommerceRouter.get('/orders/:id', ...guard, async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    res.json(await commerceService.getOrder(req.auth, id))
  } catch (err) {
    next(err)
  }
})

// Deliverable types
cmsCommerceRouter.get('/deliverable-types', ...guard, async (req, res, next) => {
  try {
    res.json(await commerceService.listDeliverableTypes(req.auth))
  } catch (err) {
    next(err)
  }
})

cmsCommerceRouter.post(
  '/deliverable-types',
  ...guard,
  validate(createDeliverableTypeSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await commerceService.createDeliverableType(req.auth, req.body))
    } catch (err) {
      next(err)
    }
  },
)

// Product → deliverable mappings
cmsCommerceRouter.get('/mappings', ...guard, async (req, res, next) => {
  try {
    res.json(await commerceService.listMappings(req.auth))
  } catch (err) {
    next(err)
  }
})

cmsCommerceRouter.post(
  '/mappings',
  ...guard,
  validate(upsertMappingSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await commerceService.upsertMapping(req.auth, req.body))
    } catch (err) {
      next(err)
    }
  },
)

cmsCommerceRouter.delete('/mappings/:id', ...guard, async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    await commerceService.deleteMapping(req.auth, id)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// Deliverable status advancement
cmsCommerceRouter.patch('/deliverables/:id/status', ...guard, async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    const { status } = req.body as { status: 'in_progress' | 'completed' | 'cancelled' }
    res.json(await commerceService.updateDeliverableStatus(req.auth, id, status))
  } catch (err) {
    next(err)
  }
})

// WooCommerce product list — proxied from WC REST API
cmsCommerceRouter.get('/wc-products', ...guard, async (_req, res, next) => {
  try {
    const products = await fetchProducts()
    res.json(products)
  } catch (err) {
    next(err)
  }
})

// Resource + service pickers for mapping config
cmsCommerceRouter.get('/resources-lite', ...guard, async (req, res, next) => {
  try { res.json(await commerceService.listResourcesLite(req.auth)) } catch (err) { next(err) }
})

cmsCommerceRouter.get('/services-lite', ...guard, async (req, res, next) => {
  try { res.json(await commerceService.listServicesLite(req.auth)) } catch (err) { next(err) }
})

// Per-order automation timeline
cmsCommerceRouter.get('/orders/:id/events', ...guard, async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    res.json(await commerceService.getOrderEvents(req.auth, id))
  } catch (err) { next(err) }
})

// Failed webhook deliveries
cmsCommerceRouter.get('/webhook-failures', ...guard, async (req, res, next) => {
  try { res.json(await commerceService.listWebhookFailures(req.auth)) } catch (err) { next(err) }
})

// ─── Portal routes — /orders ──────────────────────────────────────────────────

export const ordersRouter = Router()

ordersRouter.use(authenticate)

ordersRouter.get('/mine', async (req, res, next) => {
  try {
    res.json(await commerceService.listMyOrders(req.auth))
  } catch (err) {
    next(err)
  }
})
