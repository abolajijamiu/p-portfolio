import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import * as svc from './audit.service'

export const cmsAuditRouter = Router()

const guard = [authenticate, authorize('admin')]

cmsAuditRouter.get('/', ...guard, async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 50), 200)
    const offset = Number(req.query.offset ?? 0)
    const action = req.query.action as string | undefined
    const entityType = req.query.entityType as string | undefined
    const since = req.query.since ? new Date(req.query.since as string) : undefined
    res.json(await svc.listLogs({ limit, offset, action, entityType, since }))
  } catch (err) {
    next(err)
  }
})
