'use client'

import { use } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { StatCard } from '@/components/dashboard/StatCard'
import { Button } from '@/components/ui/Button'
import type { Campaign, CampaignAnalytics } from '@/types'

type Params = { id: string }

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`
}

export default function CampaignAnalyticsPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params)
  const { data: campaign } = useSWR<Campaign>(`/cms/campaigns/${id}`)
  const { data: analytics, isLoading } = useSWR<CampaignAnalytics>(`/cms/campaigns/${id}/analytics`)

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">
              {campaign?.name ?? 'Campaign'} — Analytics
            </h1>
            <p className="text-sm text-muted mt-0.5">All-time totals</p>
          </div>
          <Link href={`/admin/campaigns/${id}`}>
            <Button variant="ghost" size="sm">← Editor</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Impressions"    value={analytics?.impressions  ?? 0} loading={isLoading} />
          <StatCard label="Unique viewers" value={analytics?.uniqueViewers ?? 0} loading={isLoading} />
          <StatCard label="Clicks"         value={analytics?.clicks        ?? 0} loading={isLoading} sub={analytics ? `CTR ${pct(analytics.clickRate)}` : undefined} />
          <StatCard label="Conversions"    value={analytics?.conversions   ?? 0} loading={isLoading} sub={analytics ? pct(analytics.conversionRate) : undefined} />
        </div>

        <div className="border border-border rounded-xl bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Breakdown</p>
          </div>
          {[
            { label: 'Impressions',     value: analytics?.impressions,   sub: null },
            { label: 'Unique viewers',  value: analytics?.uniqueViewers, sub: null },
            { label: 'Clicks',          value: analytics?.clicks,        sub: analytics ? `CTR ${pct(analytics.clickRate)}` : null },
            { label: 'Dismissals',      value: analytics?.dismissals,    sub: analytics ? pct(analytics.dismissRate) : null },
            { label: 'Conversions',     value: analytics?.conversions,   sub: analytics ? pct(analytics.conversionRate) : null },
          ].map(({ label, value, sub }) => (
            <div key={label} className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-0">
              <p className="text-sm text-ink">{label}</p>
              <div className="text-right">
                {isLoading ? (
                  <div className="h-4 w-10 rounded bg-border/60 animate-pulse" />
                ) : (
                  <>
                    <p className="text-sm font-semibold text-ink tabular-nums">{value ?? 0}</p>
                    {sub && <p className="text-[11px] text-muted">{sub}</p>}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {analytics?.impressions === 0 && !isLoading && (
          <p className="text-sm text-muted text-center mt-8">
            No data yet. Impressions appear once the campaign is active and users see it.
          </p>
        )}
      </div>
    </div>
  )
}
