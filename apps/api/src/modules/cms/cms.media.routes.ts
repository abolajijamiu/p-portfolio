import { eq } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../db/client'
import { cmsMedia, type NewCmsMedia } from '../../db/schema'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import { getPresignedUploadUrl } from '../../lib/storage'
import { AppError } from '../../lib/errors'

export const cmsMediaRouter = Router()

const guard = [authenticate, authorize('admin')]

// GET /cms/media — list all assets
cmsMediaRouter.get('/', ...guard, async (req, res, next) => {
  try {
    const assetType = req.query.type as string | undefined
    const assets = await db.query.cmsMedia.findMany({
      where: assetType
        ? eq(cmsMedia.assetType, assetType as 'screenshot' | 'thumbnail' | 'before' | 'after' | 'logo' | 'video-thumbnail')
        : undefined,
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    })
    res.json(assets)
  } catch (err) {
    next(err)
  }
})

// POST /cms/media/upload-url — request a presigned PUT URL
// Returns { uploadUrl, storageKey } — client uploads directly to S3, then calls /confirm
cmsMediaRouter.post('/upload-url', ...guard, async (req, res, next) => {
  try {
    const { filename, contentType } = req.body as {
      filename?: string
      contentType?: string
    }
    if (!filename) throw new AppError('filename is required', 400)

    const ext = filename.split('.').pop() ?? 'bin'
    const key = `cms/media/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const url = await getPresignedUploadUrl(key, contentType ?? 'application/octet-stream')

    res.json({ uploadUrl: url, storageKey: key })
  } catch (err) {
    next(err)
  }
})

// POST /cms/media/confirm — record the asset after a successful S3 upload
cmsMediaRouter.post('/confirm', ...guard, async (req, res, next) => {
  try {
    const body = req.body as {
      storageKey: string
      originalName?: string
      alt?: string
      caption?: string
      assetType?: NewCmsMedia['assetType']
      mimeType?: string
      sizeBytes?: number
      width?: number
      height?: number
    }
    if (!body.storageKey) throw new AppError('storageKey is required', 400)

    const [asset] = await db
      .insert(cmsMedia)
      .values({
        storageKey: body.storageKey,
        originalName: body.originalName ?? null,
        alt: body.alt ?? null,
        caption: body.caption ?? null,
        assetType: body.assetType ?? 'screenshot',
        mimeType: body.mimeType ?? null,
        sizeBytes: body.sizeBytes ?? null,
        width: body.width ?? null,
        height: body.height ?? null,
        uploadedBy: req.auth.sub,
      })
      .returning()

    res.status(201).json(asset)
  } catch (err) {
    next(err)
  }
})

// PATCH /cms/media/:id — update alt, caption, assetType
cmsMediaRouter.patch('/:id', ...guard, async (req, res, next) => {
  try {
    const { alt, caption, assetType } = req.body as Partial<NewCmsMedia>
    const [asset] = await db
      .update(cmsMedia)
      .set({ alt, caption, assetType })
      .where(eq(cmsMedia.id, String(req.params.id)))
      .returning()
    if (!asset) return res.status(404).json({ error: 'Not found' })
    res.json(asset)
  } catch (err) {
    next(err)
  }
})

// DELETE /cms/media/:id
// Note: does not delete from S3 — storage cleanup is a separate maintenance task
cmsMediaRouter.delete('/:id', ...guard, async (req, res, next) => {
  try {
    await db.delete(cmsMedia).where(eq(cmsMedia.id, String(req.params.id)))
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
