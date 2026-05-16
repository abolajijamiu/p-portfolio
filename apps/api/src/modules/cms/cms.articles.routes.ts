import { eq, desc } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../db/client'
import { cmsArticles, type NewCmsArticle } from '../../db/schema'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import { AppError } from '../../lib/errors'

export const cmsArticlesRouter = Router()

const guard = [authenticate, authorize('admin')]

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// GET /cms/articles — authenticated, list all
cmsArticlesRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const category = req.query.category as string | undefined
    const articles = await db.query.cmsArticles.findMany({
      where: category
        ? eq(cmsArticles.category, category as 'audit' | 'ux' | 'seo' | 'funnel' | 'commerce')
        : undefined,
      orderBy: [desc(cmsArticles.updatedAt)],
    })
    res.json(articles)
  } catch (err) {
    next(err)
  }
})

// GET /cms/articles/published — public, all published
cmsArticlesRouter.get('/published', async (req, res, next) => {
  try {
    const category = req.query.category as string | undefined
    const articles = await db.query.cmsArticles.findMany({
      where: eq(cmsArticles.status, 'published'),
      orderBy: [desc(cmsArticles.publishedAt)],
    })
    const filtered = category ? articles.filter((a) => a.category === category) : articles
    res.json(filtered)
  } catch (err) {
    next(err)
  }
})

// GET /cms/articles/published/:slug — public, single by slug
cmsArticlesRouter.get('/published/:slug', async (req, res, next) => {
  try {
    const article = await db.query.cmsArticles.findFirst({
      where: eq(cmsArticles.slug, req.params.slug),
    })
    if (!article || article.status !== 'published') {
      return res.status(404).json({ error: 'Not found' })
    }
    res.json(article)
  } catch (err) {
    next(err)
  }
})

// GET /cms/articles/:id — authenticated, by ID
cmsArticlesRouter.get('/:id', authenticate, async (req, res, next) => {
  try {
    const article = await db.query.cmsArticles.findFirst({
      where: eq(cmsArticles.id, String(req.params.id)),
    })
    if (!article) return res.status(404).json({ error: 'Not found' })
    res.json(article)
  } catch (err) {
    next(err)
  }
})

// POST /cms/articles — admin
cmsArticlesRouter.post('/', ...guard, async (req, res, next) => {
  try {
    const body = req.body as Partial<NewCmsArticle>
    const title = body.title?.trim()
    if (!title) throw new AppError('title is required', 400)

    const slug = body.slug?.trim() || slugify(title)

    const [article] = await db
      .insert(cmsArticles)
      .values({
        slug,
        title,
        subtitle: body.subtitle ?? null,
        category: body.category ?? 'audit',
        tags: body.tags ?? [],
        body: body.body ?? null,
        excerpt: body.excerpt ?? null,
        client: body.client ?? null,
        workSlug: body.workSlug ?? null,
        featured: body.featured ?? false,
        proof: body.proof ?? [],
        comparisons: body.comparisons ?? [],
        heroMediaId: body.heroMediaId ?? null,
        readingMinutes: body.readingMinutes ?? null,
        seoTitle: body.seoTitle ?? null,
        seoDescription: body.seoDescription ?? null,
        status: 'draft',
      })
      .returning()

    res.status(201).json(article)
  } catch (err) {
    next(err)
  }
})

// PATCH /cms/articles/:id — admin
cmsArticlesRouter.patch('/:id', ...guard, async (req, res, next) => {
  try {
    const body = req.body as Partial<NewCmsArticle>

    const [article] = await db
      .update(cmsArticles)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(cmsArticles.id, String(req.params.id)))
      .returning()

    if (!article) return res.status(404).json({ error: 'Not found' })
    res.json(article)
  } catch (err) {
    next(err)
  }
})

// PUT /cms/articles/:id/publish — admin
cmsArticlesRouter.put('/:id/publish', ...guard, async (req, res, next) => {
  try {
    const [article] = await db
      .update(cmsArticles)
      .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(cmsArticles.id, String(req.params.id)))
      .returning()
    if (!article) return res.status(404).json({ error: 'Not found' })
    res.json(article)
  } catch (err) {
    next(err)
  }
})

// PUT /cms/articles/:id/archive — admin
cmsArticlesRouter.put('/:id/archive', ...guard, async (req, res, next) => {
  try {
    const [article] = await db
      .update(cmsArticles)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(cmsArticles.id, String(req.params.id)))
      .returning()
    if (!article) return res.status(404).json({ error: 'Not found' })
    res.json(article)
  } catch (err) {
    next(err)
  }
})

// DELETE /cms/articles/:id — admin
cmsArticlesRouter.delete('/:id', ...guard, async (req, res, next) => {
  try {
    await db.delete(cmsArticles).where(eq(cmsArticles.id, String(req.params.id)))
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
