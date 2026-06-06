'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Campaign, CampaignStatus } from '@/types'

const PLACEMENT_LABELS: Record<string, string> = {
  announcement_bar: 'Announcement bar',
  inline:           'Inline',
  sticky_footer:    'Sticky footer',
  exit_intent:      'Exit intent',
}

function statusStyle(status: CampaignStatus) {
  switch (status) {
    case 'active':    return 'bg-green-50 text-green-700'
    case 'scheduled': return 'bg-blue-50 text-blue-700'
    case 'paused':    return 'bg-orange-50 text-orange-700'
    case 'archived':  return 'bg-surface text-muted'
    default:          return 'bg-amber-50 text-amber-700' // draft
  }
}

function formatSchedule(c: Campaign) {
  if (c.startAt) {
    const start = new Date(c.startAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    if (c.endAt) {
      const end = new Date(c.endAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      return `${start} – ${end}`
    }
    return `From ${start}`
  }
  return 'No schedule'
}

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useSWR<Campaign[]>('/cms/campaigns')

  useEffect(() => { document.title = 'Campaigns — Content' }, [])

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Campaigns</h1>
            <p className="text-sm text-muted mt-0.5">
              {campaigns ? `${campaigns.length} total` : '—'}
            </p>
          </div>
          <Link href="/admin/campaigns/new">
            <Button size="sm">New campaign</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : !campaigns?.length ? (
          <div className="py-14 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No campaigns yet.</p>
            <Link href="/admin/campaigns/new" className="mt-2 inline-block text-xs text-ink underline underline-offset-2">
              Create the first campaign
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/admin/campaigns/${campaign.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-surface transition-[background-color] duration-150 group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{campaign.name}</p>
                  <p className="text-[11px] text-muted mt-0.5">
                    {PLACEMENT_LABELS[campaign.placement] ?? campaign.placement}
                    {' · '}
                    {formatSchedule(campaign)}
                    {' · '}
                    Priority {campaign.priority}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyle(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  <svg className="h-4 w-4 text-muted/30 group-hover:text-muted transition-[color] duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
