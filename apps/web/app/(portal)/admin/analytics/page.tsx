'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { StatCard } from '@/components/dashboard/StatCard'
import { Button } from '@/components/ui/Button'
import type { CampaignOverview, CampaignOverviewRow } from '@/types'

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

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  draft:     'bg-amber-50 text-amber-700',
  scheduled: 'bg-blue-50 text-blue-700',
  active:    'bg-green-50 text-green-700',
  paused:    'bg-orange-50 text-orange-700',
  archived:  'bg-surface text-muted',
}

// ─── Sort config ──────────────────────────────────────────────────────────────

type SortKey = 'impressions' | 'clicks' | 'conversions' | 'ctr' | 'conversionRate' | 'attributedRevenue'

const SORT_LABELS: Record<SortKey, string> = {
  impressions:       'Impr.',
  clicks:            'Clicks',
  conversions:       'Conv.',
  ctr:               'CTR',
  conversionRate:    'CR',
  attributedRevenue: 'Revenue',
}

// ─── Top campaigns table ──────────────────────────────────────────────────────

function CampaignTable({ rows, sortKey, onSort }: {
  rows: CampaignOverviewRow[]
  sortKey: SortKey
  onSort: (k: SortKey) => void
}) {
  const sorted = [...rows].sort((a, b) => b[sortKey] - a[sortKey])

  return (
    <div className="border border-border rounded-xl bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Top campaigns</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-medium text-muted uppercase tracking-wider">Campaign</th>
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <th
                  key={k}
                  onClick={() => onSort(k)}
                  className={[
                    'px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap',
                    sortKey === k ? 'text-ink' : 'text-muted hover:text-ink',
                    'transition-[color] duration-150',
                  ].join(' ')}
                >
                  {SORT_LABELS[k]} {sortKey === k ? '↓' : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-sm text-muted text-center">
                  No campaigns yet.
                </td>
              </tr>
            ) : sorted.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface/40 transition-[background-color] duration-100">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Link
                      href={`/admin/campaigns/${c.id}/analytics`}
                      className="text-sm font-medium text-ink hover:text-brand transition-[color] duration-150 truncate max-w-[200px]"
                    >
                      {c.name}
                    </Link>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[c.status] ?? 'bg-surface text-muted'}`}>
                      {c.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-ink">{fmt(c.impressions)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink">{fmt(c.clicks)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink">{fmt(c.conversions)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted">{pct(c.ctr)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted">{pct(c.conversionRate)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted">{money(c.attributedRevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

export default function CampaignsAnalyticsPage() {
  const [preset, setPreset]    = useState('30d')
  const [sortKey, setSortKey]  = useState<SortKey>('impressions')
  const [exporting, setExport] = useState(false)

  const range = buildDateRange(preset)
  const qs    = `from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`

  const { data, isLoading } = useSWR<CampaignOverview>(`/cms/campaigns/analytics/overview?${qs}`)

  const downloadCSV = useCallback(async () => {
    setExport(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      const res   = await fetch(`${API_BASE}/api/v1/cms/campaigns/analytics/export?${qs}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) return
      const blob = await res.blob()
      const href = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = href
      a.download = `campaigns-export.csv`
      a.click()
      URL.revokeObjectURL(href)
    } finally {
      setExport(false)
    }
  }, [qs])

  const totals = data?.totals

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-16 md:p-8 max-w-5xl">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Campaign Analytics</h1>
            <p className="text-sm text-muted mt-0.5">Aggregate performance across all campaigns</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/campaigns">
              <Button variant="ghost" size="sm">← Campaigns</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={downloadCSV} loading={exporting}>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Date range selector */}
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

        {/* Totals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total impressions" value={fmt(totals?.impressions ?? 0)} loading={isLoading} />
          <StatCard label="Total clicks"      value={fmt(totals?.clicks      ?? 0)} loading={isLoading}
            sub={totals && totals.impressions > 0 ? `CTR ${pct(totals.clicks / totals.impressions)}` : undefined} />
          <StatCard label="Total conversions" value={fmt(totals?.conversions ?? 0)} loading={isLoading}
            sub={totals && totals.impressions > 0 ? pct(totals.conversions / totals.impressions) : undefined} />
          <StatCard label="Total revenue"     value={money(totals?.attributedRevenue ?? 0)} loading={isLoading} />
        </div>

        {/* Top campaigns table */}
        {isLoading ? (
          <div className="border border-border rounded-xl bg-white h-40 animate-pulse" />
        ) : (
          <CampaignTable
            rows={data?.topCampaigns ?? []}
            sortKey={sortKey}
            onSort={setSortKey}
          />
        )}

        <p className="text-[11px] text-muted mt-4 text-center">
          Click any column header to sort. Click a campaign name to see its full analytics.
        </p>
      </div>
    </div>
  )
}
