'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { Skeleton } from '@/components/ui/Skeleton'
import { http } from '@/lib/http'
import type { CommerceOrder, DeliverableStatus } from '@/types'

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  processing: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-surface text-muted',
  refunded: 'bg-surface text-muted',
  failed: 'bg-red-50 text-red-700',
}

const DELIVERABLE_STYLE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  in_progress: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-surface text-muted',
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(cents / 100)
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] text-muted uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  )
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading, mutate } = useSWR<CommerceOrder>(id ? `/cms/commerce/orders/${id}` : null)
  const [advancing, setAdvancing] = useState<string | null>(null)

  async function advanceDeliverable(deliverableId: string, status: DeliverableStatus) {
    setAdvancing(deliverableId)
    try {
      await http.patch(`/cms/commerce/deliverables/${deliverableId}/status`, { status })
      await mutate()
    } finally {
      setAdvancing(null)
    }
  }

  useEffect(() => {
    document.title = order ? `Order — ${order.customer.name}` : 'Order Detail'
  }, [order])

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl">
        <Link
          href="/admin/commerce"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-[color] duration-150 mb-6"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Orders
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="mt-6 border border-border rounded-xl p-5 space-y-4 bg-white">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          </div>
        ) : !order ? (
          <p className="text-sm text-muted">Order not found.</p>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-ink tracking-tight">
                  {order.customer.name}
                </h1>
                <p className="text-sm text-muted mt-0.5">{order.customer.email}</p>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLE[order.status] ?? 'bg-surface text-muted'}`}
              >
                {order.status}
              </span>
            </div>

            {/* Order details */}
            <div className="border border-border rounded-xl p-5 bg-white">
              <h2 className="text-xs font-medium text-muted uppercase tracking-wide mb-4">Order</h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <Field label="Total" value={formatMoney(order.totalCents, order.currency)} />
                <Field label="Provider" value={order.provider} />
                <Field label="External ID" value={order.externalId} />
                <Field label="Placed" value={new Date(order.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })} />
              </dl>
            </div>

            {/* Line items */}
            <div className="border border-border rounded-xl overflow-hidden bg-white">
              <div className="px-5 py-3.5 border-b border-border">
                <h2 className="text-xs font-medium text-muted uppercase tracking-wide">Items</h2>
              </div>
              {order.items.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted">No items recorded.</p>
              ) : (
                <div className="divide-y divide-border">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <p className="text-sm text-ink">{item.productName}</p>
                        <p className="text-[11px] text-muted">
                          Product ID: {item.externalProductId}
                          {item.quantity > 1 && ` · ×${item.quantity}`}
                        </p>
                      </div>
                      <p className="text-sm text-ink shrink-0">
                        {formatMoney(item.priceCents, order.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deliverables */}
            {order.deliverables && order.deliverables.length > 0 && (
              <div className="border border-border rounded-xl overflow-hidden bg-white">
                <div className="px-5 py-3.5 border-b border-border">
                  <h2 className="text-xs font-medium text-muted uppercase tracking-wide">Deliverables</h2>
                </div>
                <div className="divide-y divide-border">
                  {order.deliverables.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="text-sm text-ink">{d.deliverableType.name}</p>
                        <p className="text-[11px] text-muted capitalize">{d.deliverableType.category.replace('_', ' ')}</p>
                        {d.completedAt && (
                          <p className="text-[11px] text-emerald-600 mt-0.5">
                            Completed {new Date(d.completedAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${DELIVERABLE_STYLE[d.status] ?? 'bg-surface text-muted'}`}
                        >
                          {d.status.replace('_', ' ')}
                        </span>
                        {d.status === 'pending' && (
                          <button
                            onClick={() => advanceDeliverable(d.id, 'in_progress')}
                            disabled={advancing === d.id}
                            className="text-[11px] font-semibold text-brand border border-brand/20 rounded-lg px-2.5 py-1 hover:bg-brand/5 disabled:opacity-50 transition-colors"
                          >
                            {advancing === d.id ? '…' : 'Start'}
                          </button>
                        )}
                        {d.status === 'in_progress' && (
                          <button
                            onClick={() => advanceDeliverable(d.id, 'completed')}
                            disabled={advancing === d.id}
                            className="text-[11px] font-semibold text-emerald-700 border border-emerald-200 rounded-lg px-2.5 py-1 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
                          >
                            {advancing === d.id ? '…' : 'Complete'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
