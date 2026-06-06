import { and, eq, sql } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../db/client'
import { campaignEvents, campaigns, type NewCampaign } from '../../db/schema'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

export const campaignsRouter = Router()

const guard = [authenticate, authorize('admin')]

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft:     ['active', 'scheduled', 'archived'],
  scheduled: ['active', 'archived'],
  active:    ['paused', 'archived'],
  paused:    ['active', 'archived'],
  archived:  [],
}

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

// GET /cms/campaigns
campaignsRouter.get('/', ...guard, async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined
    const rows = await db.query.campaigns.findMany({
      where: status ? eq(campaigns.status, status as any) : undefined,
      orderBy: (t, { asc, desc }) => [asc(t.priority), desc(t.updatedAt)],
    })
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// GET /cms/campaigns/:id
campaignsRouter.get('/:id', ...guard, async (req, res, next) => {
  try {
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, req.params.id),
    })
    if (!campaign) return res.status(404).json({ error: 'Not found' })
    res.json(campaign)
  } catch (err) {
    next(err)
  }
})

// GET /cms/campaigns/:id/analytics
campaignsRouter.get('/:id/analytics', ...guard, async (req, res, next) => {
  try {
    const stats = await db
      .select({
        eventType:   campaignEvents.eventType,
        total:       sql<number>`COUNT(*)::int`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${campaignEvents.userKey})::int`,
      })
      .from(campaignEvents)
      .where(eq(campaignEvents.campaignId, req.params.id))
      .groupBy(campaignEvents.eventType)

    const get = (type: string) => stats.find((s) => s.eventType === type)

    const impressions = get('impression')?.total ?? 0
    const unique      = get('impression')?.uniqueUsers ?? 0
    const clicks      = get('click')?.total ?? 0
    const dismissals  = get('dismiss')?.total ?? 0
    const conversions = get('convert')?.total ?? 0

    res.json({
      impressions,
      uniqueViewers:   unique,
      clicks,
      dismissals,
      conversions,
      clickRate:       impressions ? Number((clicks / impressions).toFixed(4)) : 0,
      dismissRate:     impressions ? Number((dismissals / impressions).toFixed(4)) : 0,
      conversionRate:  impressions ? Number((conversions / impressions).toFixed(4)) : 0,
    })
  } catch (err) {
    next(err)
  }
})

// POST /cms/campaigns
campaignsRouter.post('/', ...guard, async (req, res, next) => {
  try {
    const body = req.body as Partial<NewCampaign>
    if (!body.name?.trim()) return res.status(400).json({ error: 'name is required' })

    const [campaign] = await db
      .insert(campaigns)
      .values({
        name:      body.name.trim(),
        placement: body.placement ?? 'announcement_bar',
        priority:  body.priority ?? 50,
        status:    'draft',
      })
      .returning()

    res.status(201).json(campaign)
  } catch (err) {
    next(err)
  }
})

// PATCH /cms/campaigns/:id
campaignsRouter.patch('/:id', ...guard, async (req, res, next) => {
  try {
    const body = req.body as Partial<NewCampaign>

    const [campaign] = await db
      .update(campaigns)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(campaigns.id, req.params.id))
      .returning()

    if (!campaign) return res.status(404).json({ error: 'Not found' })
    res.json(campaign)
  } catch (err) {
    next(err)
  }
})

// PUT /cms/campaigns/:id/status
campaignsRouter.put('/:id/status', ...guard, async (req, res, next) => {
  try {
    const { status } = req.body as { status: string }

    const current = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, req.params.id),
    })
    if (!current) return res.status(404).json({ error: 'Not found' })

    const allowed = VALID_TRANSITIONS[current.status] ?? []
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Cannot transition from ${current.status} to ${status}` })
    }

    const [updated] = await db
      .update(campaigns)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(campaigns.id, req.params.id))
      .returning()

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// DELETE /cms/campaigns/:id  (draft + archived only)
campaignsRouter.delete('/:id', ...guard, async (req, res, next) => {
  try {
    const current = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, req.params.id),
    })
    if (!current) return res.status(404).json({ error: 'Not found' })
    if (!['draft', 'archived'].includes(current.status)) {
      return res.status(400).json({ error: 'Only draft or archived campaigns can be deleted' })
    }

    await db.delete(campaigns).where(eq(campaigns.id, req.params.id))
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ─── Public ───────────────────────────────────────────────────────────────────

// POST /campaigns/:id/events
campaignsRouter.post('/:id/events', async (req, res, next) => {
  try {
    const { eventType, userKey, page, device } = req.body as {
      eventType: string
      userKey: string
      page?: string
      device?: string
    }
    const valid = ['impression', 'click', 'dismiss', 'convert']
    if (!valid.includes(eventType) || !userKey) {
      return res.status(400).json({ error: 'Invalid payload' })
    }

    await db.insert(campaignEvents).values({
      campaignId: req.params.id,
      eventType: eventType as any,
      userKey,
      page: page ?? null,
      device: device ?? null,
    })

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
