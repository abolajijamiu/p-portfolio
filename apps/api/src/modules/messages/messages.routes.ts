import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { validate } from '../../middleware/validate'
import * as messagesService from './messages.service'
import { sendMessageSchema } from './messages.schema'

// mergeParams: true exposes :projectId from the parent router
export const messagesRouter = Router({ mergeParams: true })

messagesRouter.use(authenticate)

// GET /api/v1/projects/:projectId/messages
messagesRouter.get('/', async (req, res, next) => {
  try {
    const { projectId } = req.params as { projectId: string }
    res.json(await messagesService.list(req.auth, projectId))
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/projects/:projectId/messages
messagesRouter.post('/', validate(sendMessageSchema), async (req, res, next) => {
  try {
    const { projectId } = req.params as { projectId: string }
    res.status(201).json(await messagesService.send(req.auth, projectId, req.body))
  } catch (err) {
    next(err)
  }
})
