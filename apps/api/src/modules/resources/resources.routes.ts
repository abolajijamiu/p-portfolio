import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import { validate } from '../../middleware/validate'
import * as svc from './resources.service'
import { createResourceCheckout } from '../stripe/stripe.service'
import {
  createResourceSchema,
  updateResourceSchema,
  createLicenseSchema,
  addFileSchema,
  placePurchaseSchema,
} from './resources.schema'

// ─── Public routes — /resources ───────────────────────────────────────────────

export const resourcesRouter = Router()

resourcesRouter.get('/', async (_req, res, next) => {
  try {
    res.json(await svc.listPublished())
  } catch (err) {
    next(err)
  }
})

resourcesRouter.get('/:slug', async (req, res, next) => {
  try {
    res.json(await svc.getBySlug(req.params.slug))
  } catch (err) {
    next(err)
  }
})

// ─── Portal routes — /resource-purchases ─────────────────────────────────────

export const resourcePurchasesRouter = Router()
resourcePurchasesRouter.use(authenticate)

resourcePurchasesRouter.get('/mine', async (req, res, next) => {
  try {
    res.json(await svc.listMyPurchases(req.auth))
  } catch (err) {
    next(err)
  }
})

// POST /resource-purchases/checkout — create purchase + Stripe Checkout session
resourcePurchasesRouter.post('/checkout', async (req, res, next) => {
  try {
    const { licenseId } = req.body as { licenseId: string }
    if (!licenseId) { res.status(400).json({ error: 'licenseId required' }); return }
    res.json(await createResourceCheckout(req.auth, licenseId))
  } catch (err) {
    next(err)
  }
})

// POST /resource-purchases — direct purchase (admin/legacy)
resourcePurchasesRouter.post(
  '/',
  validate(placePurchaseSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await svc.placePurchase(req.auth, req.body.licenseId))
    } catch (err) {
      next(err)
    }
  },
)

resourcePurchasesRouter.get('/:id/download', async (req, res, next) => {
  try {
    res.json(await svc.downloadPurchase(req.auth, req.params.id as string))
  } catch (err) {
    next(err)
  }
})

// ─── Admin routes — /cms/resources ───────────────────────────────────────────

export const cmsResourcesRouter = Router()
const guard = [authenticate, authorize('admin')]

cmsResourcesRouter.get('/', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.listAll(req.auth))
  } catch (err) {
    next(err)
  }
})

cmsResourcesRouter.get('/:id', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.getById(req.auth, req.params.id as string))
  } catch (err) {
    next(err)
  }
})

cmsResourcesRouter.post('/', ...guard, validate(createResourceSchema), async (req, res, next) => {
  try {
    res.status(201).json(await svc.create(req.auth, req.body))
  } catch (err) {
    next(err)
  }
})

cmsResourcesRouter.patch('/:id', ...guard, validate(updateResourceSchema), async (req, res, next) => {
  try {
    res.json(await svc.update(req.auth, req.params.id as string, req.body))
  } catch (err) {
    next(err)
  }
})

cmsResourcesRouter.delete('/:id', ...guard, async (req, res, next) => {
  try {
    await svc.remove(req.auth, req.params.id as string)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

cmsResourcesRouter.post('/:id/licenses', ...guard, validate(createLicenseSchema), async (req, res, next) => {
  try {
    res.status(201).json(await svc.addLicense(req.auth, req.params.id as string, req.body))
  } catch (err) {
    next(err)
  }
})

cmsResourcesRouter.delete('/:id/licenses/:licenseId', ...guard, async (req, res, next) => {
  try {
    await svc.removeLicense(req.auth, req.params.licenseId as string)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

cmsResourcesRouter.post('/:id/files', ...guard, validate(addFileSchema), async (req, res, next) => {
  try {
    res.status(201).json(await svc.addFile(req.auth, req.params.id as string, req.body))
  } catch (err) {
    next(err)
  }
})

cmsResourcesRouter.delete('/:id/files/:fileId', ...guard, async (req, res, next) => {
  try {
    await svc.removeFile(req.auth, req.params.fileId as string)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// ─── Admin purchase routes — /cms/resource-purchases ─────────────────────────

export const cmsResourcePurchasesRouter = Router()

cmsResourcePurchasesRouter.get('/', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.listAllPurchases(req.auth))
  } catch (err) {
    next(err)
  }
})

cmsResourcePurchasesRouter.post('/:id/activate', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.activatePurchase(req.auth, req.params.id as string))
  } catch (err) {
    next(err)
  }
})

cmsResourcePurchasesRouter.post('/:id/refund', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.refundPurchase(req.auth, req.params.id as string))
  } catch (err) {
    next(err)
  }
})
