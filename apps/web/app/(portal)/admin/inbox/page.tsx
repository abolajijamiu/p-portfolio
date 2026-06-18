'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminInboxRow = {
  order: {
    id: string
    orderNumber: string
    status: string
    priceCents: number
    currency: string
    createdAt: string
    updatedAt: string
    dueDate?: string | null
  }
  serviceTitle: string
  packageName: string
  clientName: string
  clientEmail: string
  lastMessageAt: string | null
  lastMessageBody: string | null
  lastMessageType: string | null
  unreadCount: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  payment_received: 'bg-blue-50 text-blue-700',
  requirements_needed: 'bg-orange-50 text-orange-700',
  requirements_submitted: 'bg-sky-50 text-sky-700',
  assigned: 'bg-indigo-50 text-indigo-700',
  in_progress: 'bg-purple-50 text-purple-700',
  waiting_for_client: 'bg-amber-50 text-amber-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  revision_requested: 'bg-rose-50 text-rose-700',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting payment',
  payment_received: 'Payment received',
  requirements_needed: 'Needs requirements',
  requirements_submitted: 'Requirements sent',
  assigned: 'Expert assigned',
  in_progress: 'In progress',
  waiting_for_client: 'Waiting for client',
  delivered: 'Delivered',
  revision_requested: 'Revision requested',
}

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function messagePreview(type: string | null, body: string | null) {
  if (!body) return 'No messages yet'
  if (type === 'system') return `System: ${body}`
  if (type === 'delivery') return `Delivery: ${body}`
  if (type === 'revision_request') return `Revision: ${body}`
  return body
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Filter = 'all' | 'unread' | 'needs_action'

export default function AdminInboxPage() {
  const { data: rows, isLoading } = useSWR<AdminInboxRow[]>('/cms/service-orders/inbox')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => { document.title = 'Inbox — Admin' }, [])

  const filtered = (rows ?? []).filter((r) => {
    if (filter === 'unread') return r.unreadCount > 0
    if (filter === 'needs_action') return ['requirements_submitted', 'revision_requested'].includes(r.order.status)
    return true
  })

  const totalUnread = rows?.reduce((acc, r) => acc + (r.unreadCount ?? 0), 0) ?? 0
  const needsAction = rows?.filter((r) => ['requirements_submitted', 'revision_requested'].includes(r.order.status)).length ?? 0

  const filterConfig: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: rows?.length ?? 0 },
    { key: 'unread', label: 'Unread', count: totalUnread },
    { key: 'needs_action', label: 'Needs action', count: needsAction },
  ]

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-4xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Order Inbox</h1>
            <p className="text-sm text-muted mt-0.5">Active order conversations across all clients</p>
          </div>
          {totalUnread > 0 && (
            <span className="bg-brand text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {totalUnread} unread
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5">
          {filterConfig.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                filter === key ? 'bg-ink text-white border-ink' : 'border-border text-muted hover:text-ink'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Conversation list */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">
              {filter === 'unread' ? 'All caught up — no unread messages.' :
               filter === 'needs_action' ? 'Nothing needs action right now.' :
               'No active orders.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
            {filtered.map((row) => {
              const hasUnread = row.unreadCount > 0
              const activityAt = row.lastMessageAt ?? row.order.updatedAt
              const preview = messagePreview(row.lastMessageType, row.lastMessageBody)

              return (
                <Link
                  key={row.order.id}
                  href={`/admin/service-orders/${row.order.id}`}
                  className="flex items-start gap-4 px-4 py-4 hover:bg-surface transition-colors"
                >
                  {/* Unread dot */}
                  <div className="mt-1 shrink-0">
                    {hasUnread ? (
                      <span className="block h-2.5 w-2.5 rounded-full bg-brand" />
                    ) : (
                      <span className="block h-2.5 w-2.5 rounded-full bg-border" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`text-sm leading-tight truncate ${hasUnread ? 'font-semibold text-ink' : 'font-medium text-ink'}`}>
                          {row.serviceTitle}
                        </p>
                        <p className="text-[11px] text-muted mt-0.5">
                          <span className="font-mono">{row.order.orderNumber}</span>
                          <span className="mx-1.5">·</span>
                          <span>{row.clientName}</span>
                        </p>
                      </div>
                      <div className="shrink-0 text-right space-y-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[row.order.status] ?? 'bg-surface text-muted'}`}>
                          {STATUS_LABEL[row.order.status] ?? row.order.status}
                        </span>
                        <p className="text-[11px] text-muted">{fmtRelative(activityAt)}</p>
                      </div>
                    </div>

                    <p className={`text-xs mt-1.5 line-clamp-1 ${hasUnread ? 'text-ink/80' : 'text-muted'}`}>
                      {preview}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-muted">{row.packageName}</span>
                      {row.order.dueDate && (
                        <span className="text-[11px] text-muted">
                          Due {new Date(row.order.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      {hasUnread && (
                        <span className="text-[10px] font-semibold bg-brand/10 text-brand px-1.5 py-0.5 rounded">
                          {row.unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-4 px-4 py-4 border border-border rounded-xl bg-white animate-pulse">
      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-surface shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between gap-3">
          <div className="h-3.5 w-48 bg-surface rounded" />
          <div className="h-4 w-24 bg-surface rounded-full" />
        </div>
        <div className="h-3 w-32 bg-surface rounded" />
        <div className="h-3 w-full bg-surface rounded" />
        <div className="h-3 w-1/2 bg-surface rounded" />
      </div>
    </div>
  )
}
