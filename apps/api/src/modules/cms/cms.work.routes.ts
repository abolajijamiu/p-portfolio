import { eq } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../db/client'
import { cmsWork, type NewCmsWorkItem } from '../../db/schema'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

export const cmsWorkRouter = Router()

const guard = [authenticate, authorize('admin')]

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// GET /cms/work
cmsWorkRouter.get('/', authenticate, async (_req, res, next) => {
  try {
    const items = await db.query.cmsWork.findMany({
      orderBy: (t, { desc }) => [desc(t.updatedAt)],
    })
    res.json(items)
  } catch (err) {
    next(err)
  }
})

// GET /cms/work/published — public
cmsWorkRouter.get('/published', async (_req, res, next) => {
  try {
    const items = await db.query.cmsWork.findMany({
      where: eq(cmsWork.status, 'published'),
      orderBy: (t, { desc }) => [desc(t.year)],
    })
    res.json(items)
  } catch (err) {
    next(err)
  }
})

// GET /cms/work/:id
cmsWorkRouter.get('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await db.query.cmsWork.findFirst({
      where: eq(cmsWork.id, String(req.params.id)),
    })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (err) {
    next(err)
  }
})

// POST /cms/work
cmsWorkRouter.post('/', ...guard, async (req, res, next) => {
  try {
    const body = req.body as Partial<NewCmsWorkItem>
    const client = body.client?.trim()
    const headline = body.headline?.trim()
    if (!client) return res.status(400).json({ error: 'client is required' })
    if (!headline) return res.status(400).json({ error: 'headline is required' })

    const slug = body.slug?.trim() || slugify(client)

    const [item] = await db
      .insert(cmsWork)
      .values({
        slug,
        client,
        headline,
        situation: body.situation ?? null,
        category: body.category ?? 'shopify',
        industry: body.industry ?? null,
        year: body.year ?? new Date().getFullYear(),
        duration: body.duration ?? null,
        featured: body.featured ?? false,
        accentColor: body.accentColor ?? null,
        scope: body.scope ?? [],
        stack: body.stack ?? [],
        proof: body.proof ?? [],
        proofNote: body.proofNote ?? null,
        actions: body.actions ?? [],
        comparisons: body.comparisons ?? [],
        hasComparison: body.hasComparison ?? false,
        auditFindings: body.auditFindings ?? [],
        videoId: body.videoId ?? null,
        videoPlatform: body.videoPlatform ?? null,
        heroMediaId: body.heroMediaId ?? null,
        seoTitle: body.seoTitle ?? null,
        seoDescription: body.seoDescription ?? null,
        status: 'draft',
      })
      .returning()

    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
})

// PATCH /cms/work/:id
cmsWorkRouter.patch('/:id', ...guard, async (req, res, next) => {
  try {
    const body = req.body as Partial<NewCmsWorkItem>

    const [item] = await db
      .update(cmsWork)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(cmsWork.id, String(req.params.id)))
      .returning()

    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (err) {
    next(err)
  }
})

// PUT /cms/work/:id/publish
cmsWorkRouter.put('/:id/publish', ...guard, async (req, res, next) => {
  try {
    const [item] = await db
      .update(cmsWork)
      .set({ status: 'published', updatedAt: new Date() })
      .where(eq(cmsWork.id, String(req.params.id)))
      .returning()
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (err) {
    next(err)
  }
})

// PUT /cms/work/:id/archive
cmsWorkRouter.put('/:id/archive', ...guard, async (req, res, next) => {
  try {
    const [item] = await db
      .update(cmsWork)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(cmsWork.id, String(req.params.id)))
      .returning()
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (err) {
    next(err)
  }
})

// DELETE /cms/work/:id
cmsWorkRouter.delete('/:id', ...guard, async (req, res, next) => {
  try {
    await db.delete(cmsWork).where(eq(cmsWork.id, String(req.params.id)))
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
