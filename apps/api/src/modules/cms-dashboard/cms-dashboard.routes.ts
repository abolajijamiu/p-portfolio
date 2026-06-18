import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import * as svc from './cms-dashboard.service'

export const cmsDashboardRouter = Router()

const guard = [authenticate, authorize('admin')]

cmsDashboardRouter.get('/stats', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.getDashboardStats())
  } catch (err) {
    next(err)
  }
})

cmsDashboardRouter.get('/activity', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.getDashboardActivity())
  } catch (err) {
    next(err)
  }
})
