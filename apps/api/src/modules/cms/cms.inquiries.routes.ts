import { eq } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../db/client'
import { cmsInquiries } from '../../db/schema'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

export const cmsInquiriesRouter = Router()

const guard = [authenticate, authorize('admin')]

// GET /cms/inquiries?status=new
cmsInquiriesRouter.get('/', ...guard, async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined
    const inquiries = await db.query.cmsInquiries.findMany({
      where: status ? eq(cmsInquiries.status, status as 'new' | 'read' | 'replied' | 'archived') : undefined,
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    })
    res.json(inquiries)
  } catch (err) {
    next(err)
  }
})

// GET /cms/inquiries/:id
cmsInquiriesRouter.get('/:id', ...guard, async (req, res, next) => {
  try {
    const inquiry = await db.query.cmsInquiries.findFirst({
      where: eq(cmsInquiries.id, String(req.params.id)),
    })
    if (!inquiry) return res.status(404).json({ error: 'Not found' })
    // Auto-mark as read on open
    if (inquiry.status === 'new') {
      await db
        .update(cmsInquiries)
        .set({ status: 'read' })
        .where(eq(cmsInquiries.id, String(req.params.id)))
    }
    res.json({ ...inquiry, status: inquiry.status === 'new' ? 'read' : inquiry.status })
  } catch (err) {
    next(err)
  }
})

// PUT /cms/inquiries/:id/status
cmsInquiriesRouter.put('/:id/status', ...guard, async (req, res, next) => {
  try {
    const { status } = req.body as { status: 'new' | 'read' | 'replied' | 'archived' }
    const valid = ['new', 'read', 'replied', 'archived']
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' })

    const [inquiry] = await db
      .update(cmsInquiries)
      .set({ status })
      .where(eq(cmsInquiries.id, String(req.params.id)))
      .returning()
    if (!inquiry) return res.status(404).json({ error: 'Not found' })
    res.json(inquiry)
  } catch (err) {
    next(err)
  }
})

// DELETE /cms/inquiries/:id
cmsInquiriesRouter.delete('/:id', ...guard, async (req, res, next) => {
  try {
    await db.delete(cmsInquiries).where(eq(cmsInquiries.id, String(req.params.id)))
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
