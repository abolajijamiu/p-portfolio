'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { CheckIcon, DocumentIcon, LayersIcon, ShieldCheckIcon } from '@/components/ui/Icons'

type Deliverable = {
  deliverable: {
    id: string
    deliverableNumber: string
    title: string
    description?: string | null
    status: 'pending' | 'in_progress' | 'submitted' | 'revision_requested' | 'approved' | 'completed'
    version: number
    files: { key: string; name: string; size: number }[]
    submittedAt?: string | null
    approvedAt?: string | null
    createdAt: string
  }
  orderNumber: string
  serviceTitle: string
  expertName?: string | null
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  submitted: 'Ready for Review',
  revision_requested: 'Revision Requested',
  approved: 'Approved',
  completed: 'Completed',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-surface text-muted border-border',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
  submitted: 'bg-amber-50 text-amber-700 border-amber-200',
  revision_requested: 'bg-rose-50 text-rose-700 border-rose-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DeliverablesPage() {
  const { data, isLoading } = useSWR<Deliverable[]>('/deliverables')
  const [filter, setFilter] = useState<string>('all')

  const filtered = (data ?? []).filter((d) => filter === 'all' || d.deliverable.status === filter)
  const actionNeeded = (data ?? []).filter((d) => d.deliverable.status === 'submitted').length

  return (
    <div className="px-4 pt-6 pb-12 md:p-8 max-w-4xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">Deliverables</h1>
          <p className="text-sm text-muted mt-1">Review, approve, and download work delivered by your expert team.</p>
        </div>
        {actionNeeded > 0 && (
          <span className="shrink-0 text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-full">
            {actionNeeded} need review
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto no-scrollbar">
        {['all', 'submitted', 'in_progress', 'revision_requested', 'approved', 'completed'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === s ? 'bg-brand text-white' : 'bg-white border border-border text-muted hover:text-ink'
            }`}
          >
            {s === 'all' ? 'All' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-border rounded-xl p-5 animate-pulse">
              <div className="h-4 w-48 bg-surface rounded mb-2" />
              <div className="h-3 w-32 bg-surface rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="bg-white border border-border rounded-xl p-10 text-center">
          <LayersIcon className="h-10 w-10 text-muted/30 mx-auto mb-4" />
          <p className="text-sm font-semibold text-ink mb-1">No deliverables yet</p>
          <p className="text-xs text-muted">Deliverables appear here once your expert submits work for review.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(({ deliverable: d, orderNumber, serviceTitle, expertName }) => (
          <Link
            key={d.id}
            href={`/deliverables/${d.id}`}
            className="block bg-white border border-border rounded-xl p-5 hover:border-brand/30 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-semibold text-muted">{d.deliverableNumber}</span>
                  {d.version > 1 && (
                    <span className="text-[10px] font-semibold bg-surface border border-border text-muted px-1.5 py-0.5 rounded">
                      v{d.version}
                    </span>
                  )}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLOR[d.status]}`}>
                    {STATUS_LABEL[d.status]}
                  </span>
                </div>
                <p className="text-[15px] font-semibold text-ink group-hover:text-brand transition-colors leading-snug">{d.title}</p>
                {d.description && (
                  <p className="text-xs text-muted mt-0.5 line-clamp-1">{d.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted">
                  <span>{serviceTitle}</span>
                  <span className="text-muted/30">·</span>
                  <span className="font-mono">{orderNumber}</span>
                  {expertName && (
                    <>
                      <span className="text-muted/30">·</span>
                      <span>{expertName}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                {d.files.length > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-muted mb-1">
                    <DocumentIcon className="h-3 w-3" />
                    {d.files.length} {d.files.length === 1 ? 'file' : 'files'}
                  </div>
                )}
                <p className="text-[11px] text-muted">{fmtDate(d.createdAt)}</p>
              </div>
            </div>

            {d.status === 'submitted' && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-xs font-medium text-amber-700">Awaiting your review — approve or request a revision</p>
              </div>
            )}
            {d.status === 'approved' && d.approvedAt && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                <p className="text-xs text-emerald-700">Approved {fmtDate(d.approvedAt)}</p>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
