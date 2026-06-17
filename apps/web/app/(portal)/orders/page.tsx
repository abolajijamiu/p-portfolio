'use client'

import { useEffect } from 'react'
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

const STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting payment',
  processing: 'In progress',
  completed: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  failed: 'Payment failed',
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(cents / 100)
}

export default function MyOrdersPage() {
  const { data: orders, isLoading } = useSWR<CommerceOrder[]>('/orders/mine')

  useEffect(() => {
    document.title = 'My Orders'
  }, [])

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink tracking-tight">Orders</h1>
          <p className="text-sm text-muted mt-0.5">Your purchase history</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="border border-border rounded-xl p-5 bg-white space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-48" />
              </div>
            ))}
          </div>
        ) : !orders?.length ? (
          <div className="py-14 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="border border-border rounded-xl p-5 bg-white">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {formatMoney(order.totalCents, order.currency)}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[order.status] ?? 'bg-surface text-muted'}`}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>
                <ul className="space-y-1">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between">
                      <span className="text-xs text-ink">
                        {item.productName}
                        {item.quantity > 1 && (
                          <span className="text-muted ml-1">×{item.quantity}</span>
                        )}
                      </span>
                      <span className="text-xs text-muted">
                        {formatMoney(item.priceCents, order.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
