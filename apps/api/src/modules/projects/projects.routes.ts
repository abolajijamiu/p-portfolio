import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import { validate } from '../../middleware/validate'
import * as projectsService from './projects.service'
import { createProjectSchema, updateProjectStatusSchema } from './projects.schema'

export const projectsRouter = Router()

projectsRouter.use(authenticate)

// GET /api/v1/projects
projectsRouter.get('/', async (req, res, next) => {
  try {
    res.json(await projectsService.list(req.auth))
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/projects/:id
projectsRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    res.json(await projectsService.getById(req.auth, id))
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/projects  —  admin+
projectsRouter.post('/', authorize('admin'), validate(createProjectSchema), async (req, res, next) => {
  try {
    res.status(201).json(await projectsService.create(req.auth, req.body))
  } catch (err) {
    next(err)
  }
})

// PATCH /api/v1/projects/:id/status  —  admin+
projectsRouter.patch(
  '/:id/status',
  authorize('admin'),
  validate(updateProjectStatusSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params as { id: string }
      res.json(await projectsService.updateStatus(req.auth, id, req.body))
    } catch (err) {
      next(err)
    }
  },
)
