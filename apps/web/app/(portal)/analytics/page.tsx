'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { api } from '@/lib/api'
import { BarChartIcon, DocumentIcon, CheckIcon, CalendarIcon, LayersIcon } from '@/components/ui/Icons'

// ─── Types ────────────────────────────────────────────────────────────────────

type AnalyticsOrder = {
  order: {
    id: string
    orderNumber: string
    status: string
    priceCents: number
    currency: string
    dueDate?: string | null
    deliveredAt?: string | null
    completedAt?: string | null
    createdAt: string
  }
  serviceTitle: string
  serviceSlug: string
  serviceCategory: string
  packageName: string
}

type OrderDetail = {
  order: { id: string; orderNumber: string; status: string }
  service: { title: string }
  deliveries: {
    id: string
    message: string
    files: { key: string; name: string; size: number }[]
    acceptedAt?: string | null
    createdAt: string
  }[]
  milestones: {
    id: string
    title: string
    description?: string | null
    completedAt?: string | null
  }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting payment',
  payment_received: 'Payment received',
  requirements_needed: 'Requirements needed',
  requirements_submitted: 'Brief submitted',
  assigned: 'Analyst assigned',
  in_progress: 'Analysis in progress',
  waiting_for_client: 'Awaiting your input',
  delivered: 'Report delivered',
  revision_requested: 'Revision requested',
  approved: 'Approved',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  payment_received: 'bg-blue-50 text-blue-700 border-blue-200',
  requirements_needed: 'bg-orange-50 text-orange-700 border-orange-200',
  requirements_submitted: 'bg-sky-50 text-sky-700 border-sky-200',
  assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
  waiting_for_client: 'bg-amber-50 text-amber-700 border-amber-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  revision_requested: 'bg-rose-50 text-rose-700 border-rose-200',
  approved: 'bg-teal-50 text-teal-700 border-teal-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-surface text-muted border-border',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { data, isLoading } = useSWR<AnalyticsOrder[]>('/service-orders/mine')
  const analyticsOrders = (data ?? []).filter((o) => o.serviceCategory === 'ai_analytics')

  const activeCount = analyticsOrders.filter((o) =>
    ['assigned', 'in_progress', 'waiting_for_client'].includes(o.order.status)
  ).length
  const deliveredCount = analyticsOrders.filter((o) =>
    ['delivered', 'completed', 'approved'].includes(o.order.status)
  ).length

  return (
    <div className="px-4 pt-6 pb-12 md:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-ink tracking-tight">Analytics</h1>
        <p className="text-sm text-muted mt-1">Your AI &amp; analytics engagements, reports, and delivered insights.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total engagements', value: analyticsOrders.length, icon: BarChartIcon },
          { label: 'In progress', value: activeCount, icon: LayersIcon },
          { label: 'Reports delivered', value: deliveredCount, icon: DocumentIcon },
          {
            label: 'Total invested',
            value: `$${(analyticsOrders.reduce((s, o) => s + o.order.priceCents, 0) / 100).toLocaleString()}`,
            icon: CheckIcon,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-3.5 w-3.5 text-muted" />
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-xl font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-border rounded-xl p-5 animate-pulse">
              <div className="h-4 w-48 bg-surface rounded mb-3" />
              <div className="h-3 w-32 bg-surface rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && analyticsOrders.length === 0 && (
        <div className="bg-white border border-border rounded-xl p-10 text-center">
          <BarChartIcon className="h-10 w-10 text-muted/30 mx-auto mb-4" />
          <p className="text-sm font-semibold text-ink mb-1">No analytics engagements yet</p>
          <p className="text-xs text-muted mb-5">Order an AI &amp; analytics service to see reports and insights here.</p>
          <Link
            href="/services?category=ai_analytics"
            className="inline-flex px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-deep transition-colors"
          >
            Browse analytics services
          </Link>
        </div>
      )}

      <div className="space-y-5">
        {analyticsOrders.map((o) => (
          <AnalyticsEngagementCard key={o.order.id} engagement={o} />
        ))}
      </div>
    </div>
  )
}

// ─── Engagement card ──────────────────────────────────────────────────────────

function AnalyticsEngagementCard({ engagement }: { engagement: AnalyticsOrder }) {
  const { order } = engagement
  const [expanded, setExpanded] = useState(false)
  const { data: detail, isLoading: loadingDetail } = useSWR<OrderDetail>(
    expanded ? `/service-orders/${order.id}` : null
  )

  const isActive = ['assigned', 'in_progress', 'waiting_for_client', 'requirements_submitted', 'requirements_needed'].includes(order.status)
  const hasDeliveries = ['delivered', 'completed', 'approved', 'revision_requested'].includes(order.status)

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      {/* Header row */}
      <div
        className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-surface/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted">{order.orderNumber}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLOR[order.status] ?? 'bg-surface text-muted border-border'}`}>
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
          </div>
          <p className="text-[15px] font-semibold text-ink leading-snug">{engagement.serviceTitle}</p>
          <p className="text-xs text-muted mt-0.5">{engagement.packageName}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-ink">${(order.priceCents / 100).toLocaleString()}</p>
          <p className="text-[11px] text-muted mt-0.5">{fmtDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Quick action row */}
      <div className="px-5 pb-4 flex items-center gap-3 -mt-1">
        {order.dueDate && isActive && (
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <CalendarIcon className="h-3 w-3" />
            Due {fmtDate(order.dueDate)}
          </span>
        )}
        {order.deliveredAt && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-600">
            <CheckIcon className="h-3 w-3" />
            Delivered {fmtDate(order.deliveredAt)}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {hasDeliveries && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(true) }}
              className="text-[11px] font-semibold text-brand hover:text-brand-deep transition-colors"
            >
              View reports →
            </button>
          )}
          <Link
            href={`/orders/${order.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] font-medium text-muted hover:text-ink transition-colors"
          >
            Full workspace
          </Link>
        </div>
      </div>

      {/* Expanded deliveries */}
      {expanded && (
        <div className="border-t border-border">
          {loadingDetail && (
            <div className="p-6 text-center text-sm text-muted">Loading reports…</div>
          )}
          {detail && detail.deliveries.length === 0 && (
            <div className="p-6 text-center text-sm text-muted">
              No reports delivered yet. Check back when status moves to "Report delivered".
            </div>
          )}
          {detail && detail.deliveries.length > 0 && (
            <div className="p-5 space-y-4">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">Delivered reports</p>
              {detail.deliveries.map((d, i) => (
                <DeliveryBlock key={d.id} orderId={order.id} delivery={d} index={detail.deliveries.length - i} />
              ))}
            </div>
          )}
          {detail && detail.milestones.length > 0 && (
            <div className="border-t border-border p-5 space-y-3">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">Project milestones</p>
              {detail.milestones.map((m) => (
                <div key={m.id} className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${m.completedAt ? 'bg-brand border-brand' : 'border-border'}`}>
                    {m.completedAt && <CheckIcon className="h-2.5 w-2.5 text-white" />}
                  </div>
                  <div>
                    <p className={`text-sm ${m.completedAt ? 'line-through text-muted' : 'text-ink font-medium'}`}>{m.title}</p>
                    {m.description && <p className="text-xs text-muted">{m.description}</p>}
                    {m.completedAt && <p className="text-[11px] text-emerald-600 mt-0.5">Done {fmtDate(m.completedAt)}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Delivery block ───────────────────────────────────────────────────────────

function DeliveryBlock({
  orderId,
  delivery,
  index,
}: {
  orderId: string
  delivery: { id: string; message: string; files: { key: string; name: string; size: number }[]; acceptedAt?: string | null; createdAt: string }
  index: number
}) {
  const [downloading, setDownloading] = useState<string | null>(null)

  async function download(key: string, name: string) {
    setDownloading(key)
    try {
      const { url } = await api.get<{ url: string }>(
        `/service-orders/${orderId}/files/download-url?key=${encodeURIComponent(key)}&name=${encodeURIComponent(name)}`
      )
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ink">Report #{index}</span>
          {delivery.acceptedAt && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Accepted
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted">{fmtDate(delivery.createdAt)}</span>
      </div>
      <p className="text-sm text-ink leading-relaxed mb-3">{delivery.message}</p>
      {delivery.files.length > 0 && (
        <div className="space-y-2">
          {delivery.files.map((file) => (
            <div
              key={file.key}
              className="flex items-center gap-3 bg-white border border-border rounded-lg px-3 py-2.5"
            >
              <DocumentIcon className="h-4 w-4 text-brand shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{file.name}</p>
                {file.size > 0 && <p className="text-[11px] text-muted">{fmtSize(file.size)}</p>}
              </div>
              <button
                onClick={() => download(file.key, file.name)}
                disabled={downloading === file.key}
                className="shrink-0 text-[11px] font-semibold text-brand hover:text-brand-deep transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {downloading === file.key ? 'Downloading…' : '↓ Download'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
