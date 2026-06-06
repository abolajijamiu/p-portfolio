import { and, eq } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../db/client'
import { cmsThemes, type NewCmsTheme } from '../../db/schema'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

export const cmsThemesRouter = Router()

const guard = [authenticate, authorize('admin')]

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// GET /cms/themes
cmsThemesRouter.get('/', authenticate, async (_req, res, next) => {
  try {
    const themes = await db.query.cmsThemes.findMany({
      orderBy: (t, { desc }) => [desc(t.updatedAt)],
    })
    res.json(themes)
  } catch (err) {
    next(err)
  }
})

// GET /cms/themes/published — public, used by the marketing site
cmsThemesRouter.get('/published', async (_req, res, next) => {
  try {
    const themes = await db.query.cmsThemes.findMany({
      where: eq(cmsThemes.status, 'published'),
      orderBy: (t, { asc }) => [asc(t.name)],
    })
    res.json(themes)
  } catch (err) {
    next(err)
  }
})

// GET /cms/themes/published/:slug — public, used by the marketing site
cmsThemesRouter.get('/published/:slug', async (req, res, next) => {
  try {
    const theme = await db.query.cmsThemes.findFirst({
      where: and(eq(cmsThemes.slug, req.params.slug), eq(cmsThemes.status, 'published')),
    })
    if (!theme) return res.status(404).json({ error: 'Not found' })
    res.json(theme)
  } catch (err) {
    next(err)
  }
})

// GET /cms/themes/:id
cmsThemesRouter.get('/:id', authenticate, async (req, res, next) => {
  try {
    const theme = await db.query.cmsThemes.findFirst({
      where: eq(cmsThemes.id, String(req.params.id)),
    })
    if (!theme) return res.status(404).json({ error: 'Not found' })
    res.json(theme)
  } catch (err) {
    next(err)
  }
})

// POST /cms/themes
cmsThemesRouter.post('/', ...guard, async (req, res, next) => {
  try {
    const body = req.body as Partial<NewCmsTheme>
    const name = body.name?.trim()
    if (!name) return res.status(400).json({ error: 'name is required' })

    const slug = body.slug?.trim() || slugify(name)

    const [theme] = await db
      .insert(cmsThemes)
      .values({
        slug,
        name,
        tagline: body.tagline ?? null,
        description: body.description ?? null,
        category: body.category ?? 'fashion',
        priceCents: body.priceCents ?? null,
        highlights: body.highlights ?? [],
        features: body.features ?? [],
        licenses: body.licenses ?? [],
        deliveryNotes: body.deliveryNotes ?? [],
        bgClass: body.bgClass ?? null,
        accentColor: body.accentColor ?? null,
        demoStoreUrl: body.demoStoreUrl ?? null,
        demoStoreNote: body.demoStoreNote ?? null,
        videoId: body.videoId ?? null,
        videoPlatform: body.videoPlatform ?? null,
        heroMediaId: body.heroMediaId ?? null,
        seoTitle: body.seoTitle ?? null,
        seoDescription: body.seoDescription ?? null,
        status: 'draft',
      })
      .returning()

    res.status(201).json(theme)
  } catch (err) {
    next(err)
  }
})

// PATCH /cms/themes/:id
cmsThemesRouter.patch('/:id', ...guard, async (req, res, next) => {
  try {
    const body = req.body as Partial<NewCmsTheme>

    const [theme] = await db
      .update(cmsThemes)
      .set({
        ...body,
        slug: body.slug?.trim() || undefined,
        name: body.name?.trim() || undefined,
        updatedAt: new Date(),
      })
      .where(eq(cmsThemes.id, String(req.params.id)))
      .returning()

    if (!theme) return res.status(404).json({ error: 'Not found' })
    res.json(theme)
  } catch (err) {
    next(err)
  }
})

// PUT /cms/themes/:id/publish
cmsThemesRouter.put('/:id/publish', ...guard, async (req, res, next) => {
  try {
    const [theme] = await db
      .update(cmsThemes)
      .set({ status: 'published', updatedAt: new Date() })
      .where(eq(cmsThemes.id, String(req.params.id)))
      .returning()
    if (!theme) return res.status(404).json({ error: 'Not found' })
    res.json(theme)
  } catch (err) {
    next(err)
  }
})

// PUT /cms/themes/:id/archive
cmsThemesRouter.put('/:id/archive', ...guard, async (req, res, next) => {
  try {
    const [theme] = await db
      .update(cmsThemes)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(cmsThemes.id, String(req.params.id)))
      .returning()
    if (!theme) return res.status(404).json({ error: 'Not found' })
    res.json(theme)
  } catch (err) {
    next(err)
  }
})

// DELETE /cms/themes/:id
cmsThemesRouter.delete('/:id', ...guard, async (req, res, next) => {
  try {
    await db.delete(cmsThemes).where(eq(cmsThemes.id, String(req.params.id)))
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
