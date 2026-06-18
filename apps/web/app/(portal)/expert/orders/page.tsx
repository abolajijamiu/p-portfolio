'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'

type AssignedOrder = {
  order: {
    id: string
    orderNumber: string
    status: string
    priceCents: number
    dueDate?: string | null
    createdAt: string
    updatedAt: string
  }
  serviceTitle: string
  packageName: string
  clientName: string
  clientEmail: string
}

const STATUS_COLOR: Record<string, string> = {
  requirements_submitted: 'bg-sky-50 text-sky-700',
  assigned: 'bg-indigo-50 text-indigo-700',
  in_progress: 'bg-purple-50 text-purple-700',
  waiting_for_client: 'bg-amber-50 text-amber-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  revision_requested: 'bg-rose-50 text-rose-700',
  approved: 'bg-green-50 text-green-700',
  completed: 'bg-surface text-muted',
  cancelled: 'bg-surface text-muted',
}

const STATUS_LABEL: Record<string, string> = {
  requirements_submitted: 'Requirements in',
  assigned: 'Assigned — start work',
  in_progress: 'In progress',
  waiting_for_client: 'Waiting for client',
  delivered: 'Delivered',
  revision_requested: 'Revision needed',
  approved: 'Approved',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

type Filter = 'active' | 'completed' | 'all'

export default function ExpertOrdersPage() {
  const { data: orders, isLoading } = useSWR<AssignedOrder[]>('/expert/orders')
  const [filter, setFilter] = useState<Filter>('active')

  useEffect(() => { document.title = 'My Orders — Expert' }, [])

  const filtered = (orders ?? []).filter((o) => {
    if (filter === 'active') return !['completed', 'cancelled'].includes(o.order.status)
    if (filter === 'completed') return ['completed', 'cancelled'].includes(o.order.status)
    return true
  })

  const counts = {
    active: orders?.filter((o) => !['completed', 'cancelled'].includes(o.order.status)).length ?? 0,
    completed: orders?.filter((o) => ['completed', 'cancelled'].includes(o.order.status)).length ?? 0,
    all: orders?.length ?? 0,
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink tracking-tight">My Orders</h1>
          <p className="text-sm text-muted mt-0.5">Orders assigned to you</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-5">
          {(['active', 'completed', 'all'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border capitalize transition-colors ${
                filter === f ? 'bg-ink text-white border-ink' : 'border-border text-muted hover:text-ink'
              }`}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">
              {filter === 'active' ? 'No active orders right now.' : 'No orders here.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
            {filtered.map((o) => (
              <Link
                key={o.order.id}
                href={`/expert/orders/${o.order.id}`}
                className="flex items-start justify-between gap-3 px-4 py-4 hover:bg-surface transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate leading-tight">{o.serviceTitle}</p>
                  <p className="text-xs text-muted mt-0.5">
                    <span className="font-mono">{o.order.orderNumber}</span>
                    <span className="mx-1.5">·</span>
                    <span>{o.clientName}</span>
                    <span className="mx-1.5">·</span>
                    <span>{o.packageName}</span>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[o.order.status] ?? 'bg-surface text-muted'}`}>
                    {STATUS_LABEL[o.order.status] ?? o.order.status}
                  </span>
                  {o.order.dueDate && (
                    <p className="text-[11px] text-muted mt-1">Due {fmtDate(o.order.dueDate)}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
