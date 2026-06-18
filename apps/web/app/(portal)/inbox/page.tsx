'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'

// ─── Types ────────────────────────────────────────────────────────────────────

type InboxRow = {
  order: {
    id: string
    orderNumber: string
    status: string
    priceCents: number
    currency: string
    createdAt: string
    updatedAt: string
  }
  serviceTitle: string
  packageName: string
  lastMessageAt: string | null
  lastMessageBody: string | null
  lastMessageType: string | null
  unreadCount: number
}

// ─── Status helpers ───────────────────────────────────────────────────────────

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
  approved: 'bg-green-50 text-green-700',
  completed: 'bg-surface text-muted',
  cancelled: 'bg-surface text-muted',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting payment',
  payment_received: 'Payment received',
  requirements_needed: 'Needs requirements',
  requirements_submitted: 'Requirements sent',
  assigned: 'Expert assigned',
  in_progress: 'In progress',
  waiting_for_client: 'Waiting for you',
  delivered: 'Delivered',
  revision_requested: 'Revision requested',
  approved: 'Approved',
  completed: 'Completed',
  cancelled: 'Cancelled',
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
  if (!body && !type) return 'No messages yet'
  if (type === 'system') return `System: ${body ?? ''}`
  if (type === 'delivery') return `Delivery: ${body ?? ''}`
  if (type === 'revision_request') return `Revision: ${body ?? ''}`
  return body ?? ''
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InboxPage() {
  const { data: rows, isLoading } = useSWR<InboxRow[]>('/service-orders/mine/inbox')

  useEffect(() => { document.title = 'Inbox — E-Tech OS' }, [])

  const totalUnread = rows?.reduce((acc, r) => acc + (r.unreadCount ?? 0), 0) ?? 0

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-3xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Inbox</h1>
            <p className="text-sm text-muted mt-0.5">All conversations across your orders</p>
          </div>
          {totalUnread > 0 && (
            <span className="bg-brand text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {totalUnread} unread
            </span>
          )}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : !rows || rows.length === 0 ? (
          <div className="py-20 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No orders yet.</p>
            <Link href="/services" className="text-xs text-brand hover:underline mt-2 inline-block">
              Browse services →
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
            {rows.map((row) => {
              const hasUnread = row.unreadCount > 0
              const activityAt = row.lastMessageAt ?? row.order.updatedAt
              const preview = messagePreview(row.lastMessageType, row.lastMessageBody)

              return (
                <Link
                  key={row.order.id}
                  href={`/orders/${row.order.id}`}
                  className="flex items-start gap-4 px-4 py-4 hover:bg-surface transition-colors relative"
                >
                  {/* Unread dot */}
                  <div className="mt-1 shrink-0">
                    {hasUnread ? (
                      <span className="block h-2.5 w-2.5 rounded-full bg-brand" />
                    ) : (
                      <span className="block h-2.5 w-2.5 rounded-full bg-border" />
                    )}
                  </div>

                  {/* Main content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`text-sm leading-tight truncate ${hasUnread ? 'font-semibold text-ink' : 'font-medium text-ink'}`}>
                          {row.serviceTitle}
                        </p>
                        <p className="text-[11px] text-muted mt-0.5 font-mono">{row.order.orderNumber}</p>
                      </div>
                      <div className="shrink-0 text-right space-y-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[row.order.status] ?? 'bg-surface text-muted'}`}>
                          {STATUS_LABEL[row.order.status] ?? row.order.status}
                        </span>
                        <p className="text-[11px] text-muted">{fmtRelative(activityAt)}</p>
                      </div>
                    </div>

                    {/* Message preview */}
                    <p className={`text-xs mt-1.5 line-clamp-2 ${hasUnread ? 'text-ink/80' : 'text-muted'}`}>
                      {preview}
                    </p>

                    {/* Footer meta */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-muted">{row.packageName}</span>
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

        {/* Footer link to all orders */}
        {rows && rows.length > 0 && (
          <div className="mt-4 text-center">
            <Link href="/orders" className="text-xs text-muted hover:text-brand transition-colors">
              View all orders →
            </Link>
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
          <div className="h-3.5 w-40 bg-surface rounded" />
          <div className="h-4 w-20 bg-surface rounded-full" />
        </div>
        <div className="h-3 w-24 bg-surface rounded" />
        <div className="h-3 w-full bg-surface rounded" />
        <div className="h-3 w-2/3 bg-surface rounded" />
      </div>
    </div>
  )
}
