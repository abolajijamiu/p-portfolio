import { and, eq, gte, isNull, lte, or, sql } from 'drizzle-orm'
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDateRange(from: unknown, to: unknown, defaultDays = 30) {
  const fromDate = from ? new Date(from as string) : new Date(Date.now() - defaultDays * 86_400_000)
  const toDate   = to   ? new Date(to   as string) : new Date()
  return { fromDate, toDate }
}

function csvEscape(v: string | number | null | undefined): string {
  const s = v == null ? '' : String(v)
  return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function buildCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  return [headers, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n')
}

// ─── Public ───────────────────────────────────────────────────────────────────

campaignsRouter.get('/active', async (_req, res, next) => {
  try {
    const now = new Date()
    const active = await db.query.campaigns.findMany({
      where: and(
        eq(campaigns.status, 'active'),
        or(isNull(campaigns.startAt), lte(campaigns.startAt, now)),
        or(isNull(campaigns.endAt),   gte(campaigns.endAt, now)),
      ),
      orderBy: (t, { asc }) => [asc(t.priority)],
    })
    res.json(active)
  } catch (err) {
    next(err)
  }
})

// ─── Analytics overview  (must stay above /:id) ───────────────────────────────

// GET /cms/campaigns/analytics/overview?from=ISO&to=ISO
campaignsRouter.get('/analytics/overview', ...guard, async (req, res, next) => {
  try {
    const { fromDate, toDate } = parseDateRange(req.query.from, req.query.to)

    const [allCampaigns, aggRows] = await Promise.all([
      db.query.campaigns.findMany({ orderBy: (t, { asc }) => [asc(t.priority)] }),
      db
        .select({
          campaignId:    campaignEvents.campaignId,
          impressions:   sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'impression')::int`,
          uniqueViewers: sql<number>`COUNT(DISTINCT ${campaignEvents.userKey}) FILTER (WHERE ${campaignEvents.eventType} = 'impression')::int`,
          clicks:        sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'click')::int`,
          conversions:   sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'convert')::int`,
        })
        .from(campaignEvents)
        .where(and(gte(campaignEvents.createdAt, fromDate), lte(campaignEvents.createdAt, toDate)))
        .groupBy(campaignEvents.campaignId),
    ])

    const statsMap = new Map(aggRows.map((r) => [r.campaignId, r]))

    const topCampaigns = allCampaigns.map((c) => {
      const s   = statsMap.get(c.id)
      const imp = s?.impressions ?? 0
      const clk = s?.clicks      ?? 0
      const con = s?.conversions ?? 0
      return {
        id:                c.id,
        name:              c.name,
        status:            c.status,
        placement:         c.placement,
        impressions:       imp,
        uniqueViewers:     s?.uniqueViewers ?? 0,
        clicks:            clk,
        conversions:       con,
        ctr:               imp ? Number((clk / imp).toFixed(4)) : 0,
        conversionRate:    imp ? Number((con / imp).toFixed(4)) : 0,
        attributedRevenue: c.conversionValue ? con * c.conversionValue : 0,
      }
    }).sort((a, b) => b.impressions - a.impressions)

    const totals = topCampaigns.reduce(
      (acc, c) => ({
        impressions:       acc.impressions       + c.impressions,
        clicks:            acc.clicks            + c.clicks,
        conversions:       acc.conversions       + c.conversions,
        attributedRevenue: acc.attributedRevenue + c.attributedRevenue,
      }),
      { impressions: 0, clicks: 0, conversions: 0, attributedRevenue: 0 },
    )

    res.json({ totals, topCampaigns })
  } catch (err) {
    next(err)
  }
})

// GET /cms/campaigns/analytics/export?from=ISO&to=ISO  → all-campaigns CSV
campaignsRouter.get('/analytics/export', ...guard, async (req, res, next) => {
  try {
    const { fromDate, toDate } = parseDateRange(req.query.from, req.query.to)

    const [allCampaigns, aggRows] = await Promise.all([
      db.query.campaigns.findMany({ orderBy: (t, { asc }) => [asc(t.priority)] }),
      db
        .select({
          campaignId:    campaignEvents.campaignId,
          impressions:   sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'impression')::int`,
          uniqueViewers: sql<number>`COUNT(DISTINCT ${campaignEvents.userKey}) FILTER (WHERE ${campaignEvents.eventType} = 'impression')::int`,
          clicks:        sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'click')::int`,
          dismissals:    sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'dismiss')::int`,
          conversions:   sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'convert')::int`,
        })
        .from(campaignEvents)
        .where(and(gte(campaignEvents.createdAt, fromDate), lte(campaignEvents.createdAt, toDate)))
        .groupBy(campaignEvents.campaignId),
    ])

    const statsMap = new Map(aggRows.map((r) => [r.campaignId, r]))

    const rows = allCampaigns.map((c) => {
      const s   = statsMap.get(c.id)
      const imp = s?.impressions ?? 0
      const clk = s?.clicks      ?? 0
      const dis = s?.dismissals  ?? 0
      const con = s?.conversions ?? 0
      return [
        c.name, c.status, c.placement,
        imp, s?.uniqueViewers ?? 0, clk, dis, con,
        imp ? `${(clk / imp * 100).toFixed(1)}%` : '0.0%',
        imp ? `${(con / imp * 100).toFixed(1)}%` : '0.0%',
        c.conversionValue ? (con * c.conversionValue / 100).toFixed(2) : '',
      ]
    })

    const csv = buildCSV(
      ['Campaign', 'Status', 'Placement', 'Impressions', 'Unique Viewers', 'Clicks', 'Dismissals', 'Conversions', 'CTR', 'Conversion Rate', 'Attributed Revenue (£)'],
      rows,
    )

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="campaigns-${fromDate.toISOString().slice(0,10)}-to-${toDate.toISOString().slice(0,10)}.csv"`)
    res.send(csv)
  } catch (err) {
    next(err)
  }
})

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
      where: eq(campaigns.id, req.params.id as string),
    })
    if (!campaign) return res.status(404).json({ error: 'Not found' })
    res.json(campaign)
  } catch (err) {
    next(err)
  }
})

// GET /cms/campaigns/:id/analytics?from=ISO&to=ISO
campaignsRouter.get('/:id/analytics', ...guard, async (req, res, next) => {
  try {
    const id = req.params.id as string
    const { fromDate, toDate } = parseDateRange(req.query.from, req.query.to)

    const whereBase = and(
      eq(campaignEvents.campaignId, id),
      gte(campaignEvents.createdAt, fromDate),
      lte(campaignEvents.createdAt, toDate),
    )

    const [campaign, summaryRows, trendRows, deviceRows, pageRows] = await Promise.all([
      db.query.campaigns.findFirst({ where: eq(campaigns.id, id) }),

      db
        .select({
          eventType:   campaignEvents.eventType,
          total:       sql<number>`COUNT(*)::int`,
          uniqueUsers: sql<number>`COUNT(DISTINCT ${campaignEvents.userKey})::int`,
        })
        .from(campaignEvents)
        .where(whereBase)
        .groupBy(campaignEvents.eventType),

      db
        .select({
          date:        sql<string>`DATE(${campaignEvents.createdAt})::text`,
          impressions: sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'impression')::int`,
          clicks:      sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'click')::int`,
          conversions: sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'convert')::int`,
        })
        .from(campaignEvents)
        .where(whereBase)
        .groupBy(sql`DATE(${campaignEvents.createdAt})`)
        .orderBy(sql`DATE(${campaignEvents.createdAt}) ASC`),

      db
        .select({
          device:      sql<string>`COALESCE(${campaignEvents.device}, 'unknown')`,
          impressions: sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'impression')::int`,
          clicks:      sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'click')::int`,
          conversions: sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'convert')::int`,
        })
        .from(campaignEvents)
        .where(whereBase)
        .groupBy(sql`COALESCE(${campaignEvents.device}, 'unknown')`)
        .orderBy(sql`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'impression') DESC`),

      db
        .select({
          page:        sql<string>`COALESCE(${campaignEvents.page}, '(unknown)')`,
          impressions: sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'impression')::int`,
          clicks:      sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'click')::int`,
          conversions: sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'convert')::int`,
        })
        .from(campaignEvents)
        .where(whereBase)
        .groupBy(sql`COALESCE(${campaignEvents.page}, '(unknown)')`)
        .orderBy(sql`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'impression') DESC`)
        .limit(10),
    ])

    const get = (type: string) => summaryRows.find((s) => s.eventType === type)

    const impressions = get('impression')?.total       ?? 0
    const unique      = get('impression')?.uniqueUsers ?? 0
    const clicks      = get('click')?.total            ?? 0
    const dismissals  = get('dismiss')?.total          ?? 0
    const conversions = get('convert')?.total          ?? 0

    res.json({
      impressions,
      uniqueViewers:     unique,
      clicks,
      dismissals,
      conversions,
      clickRate:         impressions ? Number((clicks      / impressions).toFixed(4)) : 0,
      dismissRate:       impressions ? Number((dismissals  / impressions).toFixed(4)) : 0,
      conversionRate:    impressions ? Number((conversions / impressions).toFixed(4)) : 0,
      attributedRevenue: campaign?.conversionValue ? conversions * campaign.conversionValue : 0,
      trend:   trendRows,
      devices: deviceRows,
      pages:   pageRows,
    })
  } catch (err) {
    next(err)
  }
})

// GET /cms/campaigns/:id/analytics/export?from=ISO&to=ISO  → per-campaign CSV (daily)
campaignsRouter.get('/:id/analytics/export', ...guard, async (req, res, next) => {
  try {
    const id = req.params.id as string
    const { fromDate, toDate } = parseDateRange(req.query.from, req.query.to)

    const [campaign, trendRows] = await Promise.all([
      db.query.campaigns.findFirst({ where: eq(campaigns.id, id) }),
      db
        .select({
          date:          sql<string>`DATE(${campaignEvents.createdAt})::text`,
          impressions:   sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'impression')::int`,
          uniqueViewers: sql<number>`COUNT(DISTINCT ${campaignEvents.userKey}) FILTER (WHERE ${campaignEvents.eventType} = 'impression')::int`,
          clicks:        sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'click')::int`,
          dismissals:    sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'dismiss')::int`,
          conversions:   sql<number>`COUNT(*) FILTER (WHERE ${campaignEvents.eventType} = 'convert')::int`,
        })
        .from(campaignEvents)
        .where(and(
          eq(campaignEvents.campaignId, id),
          gte(campaignEvents.createdAt, fromDate),
          lte(campaignEvents.createdAt, toDate),
        ))
        .groupBy(sql`DATE(${campaignEvents.createdAt})`)
        .orderBy(sql`DATE(${campaignEvents.createdAt}) ASC`),
    ])

    if (!campaign) return res.status(404).json({ error: 'Not found' })

    const rows = trendRows.map((r) => {
      const imp = r.impressions ?? 0
      const clk = r.clicks      ?? 0
      const con = r.conversions ?? 0
      return [
        r.date, imp, r.uniqueViewers ?? 0, clk, r.dismissals ?? 0, con,
        imp ? `${(clk / imp * 100).toFixed(1)}%` : '0.0%',
        imp ? `${(con / imp * 100).toFixed(1)}%` : '0.0%',
      ]
    })

    const csv = buildCSV(
      ['Date', 'Impressions', 'Unique Viewers', 'Clicks', 'Dismissals', 'Conversions', 'CTR', 'Conversion Rate'],
      rows,
    )

    const slug = campaign.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${slug}-analytics.csv"`)
    res.send(csv)
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
    const b = req.body as any

    const [campaign] = await db
      .update(campaigns)
      .set({
        ...b,
        // JSON dates arrive as strings; Drizzle's timestamp columns expect Date objects
        startAt:   b.startAt != null ? new Date(b.startAt) : null,
        endAt:     b.endAt   != null ? new Date(b.endAt)   : null,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, req.params.id as string))
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
      where: eq(campaigns.id, req.params.id as string),
    })
    if (!current) return res.status(404).json({ error: 'Not found' })

    const allowed = VALID_TRANSITIONS[current.status] ?? []
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Cannot transition from ${current.status} to ${status}` })
    }

    const [updated] = await db
      .update(campaigns)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(campaigns.id, req.params.id as string))
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
      where: eq(campaigns.id, req.params.id as string),
    })
    if (!current) return res.status(404).json({ error: 'Not found' })
    if (!['draft', 'archived'].includes(current.status)) {
      return res.status(400).json({ error: 'Only draft or archived campaigns can be deleted' })
    }

    await db.delete(campaigns).where(eq(campaigns.id, req.params.id as string))
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
      campaignId: req.params.id as string,
      eventType:  eventType as any,
      userKey,
      page:   page   ?? null,
      device: device ?? null,
    })

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
