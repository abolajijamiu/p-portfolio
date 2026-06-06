'use client'

import { use, useState, useCallback } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/dashboard/StatCard'
import type { Campaign, CampaignAnalytics, CampaignAnalyticsTrendPoint } from '@/types'

type Params = { id: string }

// ─── Utils ────────────────────────────────────────────────────────────────────

function pct(n: number) { return `${(n * 100).toFixed(1)}%` }
function fmt(n: number) { return n.toLocaleString() }
function money(cents: number) { return cents === 0 ? '—' : `£${(cents / 100).toFixed(2)}` }

function buildDateRange(preset: string) {
  const to   = new Date()
  const from = new Date()
  if (preset === '7d')    from.setDate(from.getDate() - 7)
  else if (preset === '30d') from.setDate(from.getDate() - 30)
  else if (preset === '90d') from.setDate(from.getDate() - 90)
  else if (preset === 'all') from.setFullYear(2020)
  else from.setHours(0, 0, 0, 0) // today
  return { from: from.toISOString(), to: to.toISOString() }
}

// ─── Trend chart ──────────────────────────────────────────────────────────────

type ChartMetric = 'impressions' | 'clicks' | 'conversions'

const METRIC_LABELS: Record<ChartMetric, string> = {
  impressions: 'Impressions',
  clicks:      'Clicks',
  conversions: 'Conversions',
}

const METRIC_COLOR: Record<ChartMetric, string> = {
  impressions: 'bg-ink/20',
  clicks:      'bg-sky-400/60',
  conversions: 'bg-emerald-400/70',
}

function TrendChart({ data, metric }: { data: CampaignAnalyticsTrendPoint[]; metric: ChartMetric }) {
  const values = data.map((d) => d[metric])
  const max    = Math.max(...values, 1)

  if (!data.length) {
    return (
      <div className="h-24 flex items-center justify-center">
        <p className="text-sm text-muted">No activity in this period</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-end gap-px h-24">
        {data.map((d, i) => (
          <div
            key={i}
            title={`${d.date}: ${fmt(d[metric])}`}
            className={`flex-1 rounded-t-[1px] cursor-default hover:opacity-70 transition-opacity duration-100 ${METRIC_COLOR[metric]}`}
            style={{ height: `${Math.max(2, (d[metric] / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-muted">{data[0]?.date}</span>
        <span className="text-[10px] text-muted">{data[data.length - 1]?.date}</span>
      </div>
    </div>
  )
}

// ─── Breakdown table ──────────────────────────────────────────────────────────

function BreakdownTable({
  title,
  labelKey,
  rows,
}: {
  title: string
  labelKey: 'device' | 'page'
  rows: Array<Record<string, string | number>>
}) {
  const totalImpressions = rows.reduce((a, r) => a + (r.impressions as number), 0) || 1

  return (
    <div className="border border-border rounded-xl bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <p className="text-[11px] font-medium text-muted uppercase tracking-wider">{title}</p>
      </div>
      {!rows.length ? (
        <p className="text-sm text-muted px-5 py-4">No data</p>
      ) : (
        rows.map((r, i) => {
          const label = (r[labelKey] as string) ?? '—'
          const imp   = r.impressions as number
          const clk   = r.clicks as number
          const con   = r.conversions as number
          const share = imp / totalImpressions
          return (
            <div key={i} className="px-5 py-3 border-b border-border last:border-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-ink truncate max-w-[180px]" title={label}>{label}</p>
                <div className="flex items-center gap-4 text-[11px] text-muted shrink-0 tabular-nums">
                  <span>{fmt(imp)} imp</span>
                  <span>{imp ? pct(clk / imp) : '—'} CTR</span>
                  <span>{con} conv</span>
                </div>
              </div>
              <div className="h-1 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full rounded-full bg-ink/25"
                  style={{ width: `${Math.max(2, share * 100)}%` }}
                />
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: 'Today', value: 'today' },
  { label: '7d',    value: '7d'    },
  { label: '30d',   value: '30d'   },
  { label: '90d',   value: '90d'   },
  { label: 'All',   value: 'all'   },
]

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function CampaignAnalyticsPage({ params }: { params: Promise<Params> }) {
  const { id }  = use(params)
  const [preset, setPreset]    = useState('30d')
  const [metric, setMetric]    = useState<ChartMetric>('impressions')
  const [exporting, setExport] = useState(false)

  const range = buildDateRange(preset)
  const qs    = `from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`

  const { data: campaign }               = useSWR<Campaign>(`/cms/campaigns/${id}`)
  const { data: analytics, isLoading }   = useSWR<CampaignAnalytics>(`/cms/campaigns/${id}/analytics?${qs}`)

  const downloadCSV = useCallback(async () => {
    setExport(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      const res   = await fetch(`${API_BASE}/api/v1/cms/campaigns/${id}/analytics/export?${qs}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) return
      const blob  = await res.blob()
      const href  = URL.createObjectURL(blob)
      const a     = document.createElement('a')
      a.href      = href
      a.download  = `campaign-analytics.csv`
      a.click()
      URL.revokeObjectURL(href)
    } finally {
      setExport(false)
    }
  }, [id, qs])

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-16 md:p-8 max-w-4xl">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">
              {campaign?.name ?? 'Campaign'} — Analytics
            </h1>
            <p className="text-sm text-muted mt-0.5">Performance breakdown by date range</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Link href={`/admin/campaigns/${id}`}>
              <Button variant="ghost" size="sm">← Editor</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={downloadCSV} loading={exporting}>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Date range presets */}
        <div className="flex items-center gap-1 mb-6 bg-surface rounded-lg p-1 w-fit">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={[
                'px-3 py-1.5 text-xs font-medium rounded-md transition-[background-color,color] duration-150',
                preset === p.value
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-muted hover:text-ink',
              ].join(' ')}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <StatCard label="Impressions"    value={fmt(analytics?.impressions   ?? 0)} loading={isLoading} />
          <StatCard label="Unique viewers" value={fmt(analytics?.uniqueViewers ?? 0)} loading={isLoading} />
          <StatCard label="Clicks"         value={fmt(analytics?.clicks        ?? 0)} loading={isLoading}
            sub={analytics && analytics.impressions > 0 ? `CTR ${pct(analytics.clickRate)}` : undefined} />
          <StatCard label="Conversions"    value={fmt(analytics?.conversions   ?? 0)} loading={isLoading}
            sub={analytics && analytics.impressions > 0 ? pct(analytics.conversionRate) : undefined} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Dismissals"    value={fmt(analytics?.dismissals    ?? 0)} loading={isLoading}
            sub={analytics && analytics.impressions > 0 ? pct(analytics.dismissRate) : undefined} />
          <StatCard label="CTR"           value={analytics ? pct(analytics.clickRate) : '—'} loading={isLoading} />
          <StatCard label="Conv. rate"    value={analytics ? pct(analytics.conversionRate) : '—'} loading={isLoading} />
          <StatCard label="Revenue attr." value={analytics ? money(analytics.attributedRevenue) : '—'} loading={isLoading} />
        </div>

        {/* Trend chart */}
        <div className="border border-border rounded-xl bg-white p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Daily trend</p>
            <div className="flex items-center gap-1">
              {(Object.keys(METRIC_LABELS) as ChartMetric[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={[
                    'px-2.5 py-1 text-[11px] font-medium rounded transition-[background-color,color] duration-150',
                    metric === m
                      ? 'bg-ink text-white'
                      : 'text-muted hover:text-ink',
                  ].join(' ')}
                >
                  {METRIC_LABELS[m]}
                </button>
              ))}
            </div>
          </div>
          {isLoading ? (
            <div className="h-24 bg-surface animate-pulse rounded" />
          ) : (
            <TrendChart data={analytics?.trend ?? []} metric={metric} />
          )}
        </div>

        {/* Device + page breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BreakdownTable
            title="Device breakdown"
            labelKey="device"
            rows={(analytics?.devices ?? []) as Record<string, string | number>[]}
          />
          <BreakdownTable
            title="Top pages"
            labelKey="page"
            rows={(analytics?.pages ?? []) as Record<string, string | number>[]}
          />
        </div>

        {analytics?.impressions === 0 && !isLoading && (
          <p className="text-sm text-muted text-center mt-8">
            No activity in this date range.
          </p>
        )}
      </div>
    </div>
  )
}
