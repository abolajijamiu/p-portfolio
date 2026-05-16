import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import * as notificationsService from './notifications.service'

export const notificationsRouter = Router()

notificationsRouter.use(authenticate)

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
