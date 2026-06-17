'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Skeleton } from '@/components/ui/Skeleton'
import type { CommerceOrder } from '@/types'

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

export default function AdminCommerceOrdersPage() {
  const { data: orders, isLoading } = useSWR<CommerceOrder[]>('/cms/commerce/orders')

  useEffect(() => {
    document.title = 'Orders — Commerce'
  }, [])

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
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
