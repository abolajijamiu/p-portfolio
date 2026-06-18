import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import { validate } from '../../middleware/validate'
import * as svc from './services.service'
import {
  createServiceSchema,
  updateServiceSchema,
  createPackageSchema,
  createFaqSchema,
  createRequirementSchema,
} from './services.schema'

export const servicesRouter = Router()
const guard = [authenticate, authorize('admin')]

// ── Public endpoints ──────────────────────────────────────────────────────────

// GET /services — published catalogue
servicesRouter.get('/', async (_req, res, next) => {
  try {
    res.json(await svc.listPublished())
  } catch (err) {
    next(err)
  }
})

// GET /services/pricing — all published services with their packages
servicesRouter.get('/pricing', async (_req, res, next) => {
  try {
    res.json(await svc.listPublishedWithPackages())
  } catch (err) {
    next(err)
  }
})

// GET /services/:slug — service detail with packages + faqs
servicesRouter.get('/:slug', async (req, res, next) => {
  try {
    res.json(await svc.getBySlug(req.params.slug))
  } catch (err) {
    next(err)
  }
})

// ── Admin endpoints ───────────────────────────────────────────────────────────

export const cmsServicesRouter = Router()

// GET /cms/services
cmsServicesRouter.get('/', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.listAll(req.auth))
  } catch (err) {
    next(err)
  }
})

// POST /cms/services
cmsServicesRouter.post('/', ...guard, validate(createServiceSchema), async (req, res, next) => {
  try {
    res.status(201).json(await svc.create(req.auth, req.body))
  } catch (err) {
    next(err)
  }
})

// PATCH /cms/services/:id
cmsServicesRouter.patch('/:id', ...guard, validate(updateServiceSchema), async (req, res, next) => {
  try {
    res.json(await svc.update(req.auth, req.params.id as string, req.body))
  } catch (err) {
    next(err)
  }
})

// DELETE /cms/services/:id
cmsServicesRouter.delete('/:id', ...guard, async (req, res, next) => {
  try {
    await svc.remove(req.auth, req.params.id as string)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ── Package management ────────────────────────────────────────────────────────

// GET /cms/services/:id/packages
cmsServicesRouter.get('/:id/packages', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.listPackages(req.params.id as string))
  } catch (err) {
    next(err)
  }
})

// POST /cms/services/:id/packages
cmsServicesRouter.post(
  '/:id/packages',
  ...guard,
  validate(createPackageSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await svc.createPackage(req.params.id as string, req.body))
    } catch (err) {
      next(err)
    }
  },
)

// PATCH /cms/services/packages/:pkgId
cmsServicesRouter.patch('/packages/:pkgId', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.updatePackage(req.params.pkgId as string, req.body))
  } catch (err) {
    next(err)
  }
})

// DELETE /cms/services/packages/:pkgId
cmsServicesRouter.delete('/packages/:pkgId', ...guard, async (req, res, next) => {
  try {
    await svc.removePackage(req.params.pkgId as string)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ── FAQ management ────────────────────────────────────────────────────────────

cmsServicesRouter.post(
  '/:id/faqs',
  ...guard,
  validate(createFaqSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await svc.createFaq(req.params.id as string, req.body))
    } catch (err) {
      next(err)
    }
  },
)

cmsServicesRouter.delete('/faqs/:faqId', ...guard, async (req, res, next) => {
  try {
    await svc.removeFaq(req.params.faqId as string)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ── Requirement management ────────────────────────────────────────────────────

cmsServicesRouter.post(
  '/:id/requirements',
  ...guard,
  validate(createRequirementSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await svc.createRequirement(req.params.id as string, req.body))
    } catch (err) {
      next(err)
    }
  },
)

cmsServicesRouter.delete('/requirements/:reqId', ...guard, async (req, res, next) => {
  try {
    await svc.removeRequirement(req.params.reqId as string)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
