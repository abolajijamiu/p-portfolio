import { eq } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../db/client'
import { cmsTestimonials, type NewCmsTestimonial } from '../../db/schema'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

export const cmsTestimonialsRouter = Router()

const guard = [authenticate, authorize('admin')]

// GET /cms/testimonials
cmsTestimonialsRouter.get('/', ...guard, async (_req, res, next) => {
  try {
    const items = await db.query.cmsTestimonials.findMany({
      orderBy: (t, { desc }) => [desc(t.updatedAt)],
    })
    res.json(items)
  } catch (err) {
    next(err)
  }
})

// GET /cms/testimonials/published — public
cmsTestimonialsRouter.get('/published', async (_req, res, next) => {
  try {
    const items = await db.query.cmsTestimonials.findMany({
      where: eq(cmsTestimonials.status, 'published'),
      orderBy: (t, { desc }) => [desc(t.updatedAt)],
    })
    res.json(items)
  } catch (err) {
    next(err)
  }
})

// POST /cms/testimonials
cmsTestimonialsRouter.post('/', ...guard, async (req, res, next) => {
  try {
    const body = req.body as Partial<NewCmsTestimonial>
    if (!body.client?.trim()) return res.status(400).json({ error: 'client is required' })
    if (!body.quote?.trim()) return res.status(400).json({ error: 'quote is required' })

    const [item] = await db
      .insert(cmsTestimonials)
      .values({
        client: body.client.trim(),
        role: body.role ?? null,
        company: body.company ?? null,
        quote: body.quote.trim(),
        rating: body.rating ?? null,
        workSlug: body.workSlug ?? null,
        featured: body.featured ?? false,
        status: 'draft',
      })
      .returning()

    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
})

// PATCH /cms/testimonials/:id
cmsTestimonialsRouter.patch('/:id', ...guard, async (req, res, next) => {
  try {
    const body = req.body as Partial<NewCmsTestimonial>
    const [item] = await db
      .update(cmsTestimonials)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(cmsTestimonials.id, String(req.params.id)))
      .returning()
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (err) {
    next(err)
  }
})

// PUT /cms/testimonials/:id/publish
cmsTestimonialsRouter.put('/:id/publish', ...guard, async (req, res, next) => {
  try {
    const [item] = await db
      .update(cmsTestimonials)
      .set({ status: 'published', updatedAt: new Date() })
      .where(eq(cmsTestimonials.id, String(req.params.id)))
      .returning()
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (err) {
    next(err)
  }
})

// DELETE /cms/testimonials/:id
cmsTestimonialsRouter.delete('/:id', ...guard, async (req, res, next) => {
  try {
    await db.delete(cmsTestimonials).where(eq(cmsTestimonials.id, String(req.params.id)))
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
