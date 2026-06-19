'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Skeleton } from '@/components/ui/Skeleton'
import type { CommerceOrder, WcWebhookEvent } from '@/types'

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  processing: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-surface text-muted',
  refunded: 'bg-surface text-muted',
  failed: 'bg-red-50 text-red-700',
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(cents / 100)
}

function WebhookFailures() {
  const { data: failures, isLoading } = useSWR<WcWebhookEvent[]>('/cms/commerce/webhook-failures')

  if (isLoading) {
    return (
      <div className="border border-border rounded-xl overflow-hidden bg-white">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-400 shrink-0" />
          <h2 className="text-xs font-medium text-muted uppercase tracking-wide">Webhook Failures</h2>
        </div>
        <div className="px-5 py-4 space-y-2">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    )
  }

  if (!failures?.length) return null

  return (
    <div className="border border-rose-200 rounded-xl overflow-hidden bg-white">
      <div className="px-5 py-3.5 border-b border-rose-100 flex items-center justify-between bg-rose-50/50">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
          <h2 className="text-xs font-semibold text-rose-800 uppercase tracking-wide">
            Webhook Failures — {failures.length} unprocessed
          </h2>
        </div>
        <p className="text-[11px] text-rose-600">These webhooks failed to process and need attention.</p>
      </div>
      <div className="divide-y divide-border">
        {failures.map((ev) => (
          <div key={ev.id} className="px-5 py-3.5 flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{ev.topic}</p>
              {ev.externalId && (
                <p className="text-[11px] text-muted">WC Order: {ev.externalId}</p>
              )}
              {ev.error && (
                <p className="text-[11px] text-rose-600 mt-0.5 font-mono break-all">{ev.error}</p>
              )}
            </div>
            <p className="text-[11px] text-muted shrink-0">
              {new Date(ev.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminCommerceOrdersPage() {
  const { data: orders, isLoading } = useSWR<CommerceOrder[]>('/cms/commerce/orders')

  useEffect(() => {
    document.title = 'Orders — Commerce'
  }, [])

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Orders</h1>
            <p className="text-sm text-muted mt-0.5">
              {orders ? `${orders.length} total` : '—'}
            </p>
          </div>
          <Link
            href="/admin/commerce/mappings"
            className="text-xs text-muted hover:text-ink transition-[color] duration-150 underline underline-offset-2"
          >
            Product mappings
          </Link>
        </div>

        {/* Webhook failures — shown only when there are failures */}
        <WebhookFailures />

        {/* Orders list */}
        {isLoading ? (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : !orders?.length ? (
          <div className="py-14 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No orders yet.</p>
            <p className="mt-1 text-xs text-muted/60">
              Orders appear here once WooCommerce webhooks are configured.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/commerce/${order.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-surface transition-[background-color] duration-150 group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{order.customer.name}</p>
                  <p className="text-[11px] text-muted truncate">
                    {order.customer.email}
                    <span className="mx-1.5 text-border">·</span>
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    <span className="mx-1.5 text-border">·</span>
                    {formatMoney(order.totalCents, order.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[order.status] ?? 'bg-surface text-muted'}`}
                  >
                    {order.status}
                  </span>
                  <svg
                    className="h-4 w-4 text-muted/30 group-hover:text-muted transition-[color] duration-150"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
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
