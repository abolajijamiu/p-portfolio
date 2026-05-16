import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { validate } from '../../middleware/validate'
import * as filesService from './files.service'
import { getUploadUrlSchema, registerFileSchema } from './files.schema'

// mergeParams: true exposes :projectId from the parent router
export const filesRouter = Router({ mergeParams: true })

filesRouter.use(authenticate)

// GET /api/v1/projects/:projectId/files
filesRouter.get('/', async (req, res, next) => {
  try {
    const { projectId } = req.params as { projectId: string }
    res.json(await filesService.list(req.auth, projectId))
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/projects/:projectId/files/upload-url
// Returns a presigned S3 PUT URL. Client uploads directly to S3, then calls /files to register.
filesRouter.post('/upload-url', validate(getUploadUrlSchema), async (req, res, next) => {
  try {
    const { projectId } = req.params as { projectId: string }
    res.json(await filesService.getUploadUrl(req.auth, projectId, req.body))
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/projects/:projectId/files/:fileId/download-url
filesRouter.get('/:fileId/download-url', async (req, res, next) => {
  try {
    const { projectId, fileId } = req.params as { projectId: string; fileId: string }
    res.json(await filesService.getDownloadUrl(req.auth, projectId, fileId))
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/projects/:projectId/files
// Registers file metadata after the client-side S3 upload completes.
filesRouter.post('/', validate(registerFileSchema), async (req, res, next) => {
  try {
    const { projectId } = req.params as { projectId: string }
    res.status(201).json(await filesService.register(req.auth, projectId, req.body))
  } catch (err) {
    next(err)
  }
})
