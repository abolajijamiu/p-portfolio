import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import * as svc from './deliverables.service'

export const deliverablesRouter = Router()
export const expertDeliverablesRouter = Router()
export const cmsDeliverablesRouter = Router()

const auth = [authenticate]
const guard = [authenticate, authorize('admin')]

// ─── Client routes ────────────────────────────────────────────────────────────

deliverablesRouter.get('/', ...auth, async (req, res, next) => {
  try { res.json(await svc.listMyDeliverables(req.auth)) } catch (e) { next(e) }
})

deliverablesRouter.get('/:id', ...auth, async (req, res, next) => {
  try { res.json(await svc.getDeliverable(req.auth, req.params.id as string)) } catch (e) { next(e) }
})

deliverablesRouter.post('/:id/approve', ...auth, async (req, res, next) => {
  try { res.json(await svc.approveDeliverable(req.auth, req.params.id as string)) } catch (e) { next(e) }
})

deliverablesRouter.post('/:id/revision', ...auth, async (req, res, next) => {
  try { res.json(await svc.requestRevision(req.auth, req.params.id as string, req.body)) } catch (e) { next(e) }
})

deliverablesRouter.get('/:id/download-url', ...auth, async (req, res, next) => {
  try {
    const { key, name } = req.query as { key: string; name: string }
    res.json(await svc.getDeliverableDownloadUrl(req.auth, req.params.id as string, key, name))
  } catch (e) { next(e) }
})

// ─── Expert routes ────────────────────────────────────────────────────────────

expertDeliverablesRouter.get('/', ...auth, async (req, res, next) => {
  try { res.json(await svc.listExpertDeliverables(req.auth)) } catch (e) { next(e) }
})

expertDeliverablesRouter.post('/:id/submit', ...auth, async (req, res, next) => {
  try { res.json(await svc.submitDeliverable(req.auth, req.params.id as string, req.body)) } catch (e) { next(e) }
})

expertDeliverablesRouter.post('/:id/upload-url', ...auth, async (req, res, next) => {
  try {
    const { name, mimeType } = req.body as { name: string; mimeType: string }
    res.json(await svc.getDeliverableUploadUrl(req.auth, req.params.id as string, name, mimeType))
  } catch (e) { next(e) }
})

expertDeliverablesRouter.get('/:id/download-url', ...auth, async (req, res, next) => {
  try {
    const { key, name } = req.query as { key: string; name: string }
    res.json(await svc.getDeliverableDownloadUrl(req.auth, req.params.id as string, key, name))
  } catch (e) { next(e) }
})

// ─── Admin routes ─────────────────────────────────────────────────────────────

cmsDeliverablesRouter.get('/', ...guard, async (req, res, next) => {
  try { res.json(await svc.adminListDeliverables(req.query.status as string)) } catch (e) { next(e) }
})

cmsDeliverablesRouter.post('/', ...guard, async (req, res, next) => {
  try { res.status(201).json(await svc.adminCreateDeliverable(req.auth, req.body)) } catch (e) { next(e) }
})

cmsDeliverablesRouter.get('/:id', ...guard, async (req, res, next) => {
  try { res.json(await svc.getDeliverable(req.auth, req.params.id as string)) } catch (e) { next(e) }
})

cmsDeliverablesRouter.patch('/:id', ...guard, async (req, res, next) => {
  try { res.json(await svc.adminUpdateDeliverable(req.auth, req.params.id as string, req.body)) } catch (e) { next(e) }
})

cmsDeliverablesRouter.get('/:id/download-url', ...guard, async (req, res, next) => {
  try {
    const { key, name } = req.query as { key: string; name: string }
    res.json(await svc.getDeliverableDownloadUrl(req.auth, req.params.id as string, key, name))
  } catch (e) { next(e) }
})
