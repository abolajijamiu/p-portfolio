'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'

type ServiceOrder = {
  id: string
  orderNumber: string
  status: string
  priceCents: number
  currency: string
  createdAt: string
  dueDate?: string | null
  service?: { title: string; category: string } | null
  pkg?: { name: string; deliveryDays: number } | null
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  payment_received: 'bg-blue-50 text-blue-700 border-blue-100',
  requirements_needed: 'bg-orange-50 text-orange-700 border-orange-100',
  requirements_submitted: 'bg-sky-50 text-sky-700 border-sky-100',
  assigned: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-100',
  waiting_for_client: 'bg-amber-50 text-amber-700 border-amber-100',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  revision_requested: 'bg-rose-50 text-rose-700 border-rose-100',
  approved: 'bg-teal-50 text-teal-700 border-teal-100',
  completed: 'bg-green-50 text-green-700 border-green-100',
  cancelled: 'bg-surface text-muted border-border',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting payment',
  payment_received: 'Payment received',
  requirements_needed: 'Requirements needed',
  requirements_submitted: 'Requirements submitted',
  assigned: 'Expert assigned',
  in_progress: 'In progress',
  waiting_for_client: 'Waiting for you',
  delivered: 'Delivered — review',
  revision_requested: 'Revision requested',
  approved: 'Approved',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const CATEGORY_LABEL: Record<string, string> = {
  development: 'Development',
  marketing: 'Marketing',
  branding: 'Branding',
  ai_analytics: 'AI & Analytics',
  ecommerce: 'E-commerce',
  consulting: 'Consulting',
  publishing: 'Publishing',
  technical: 'Technical',
  premium: 'Premium',
}

export default function MyOrdersPage() {
  const { data: orders, isLoading } = useSWR<ServiceOrder[]>('/service-orders/mine')

  useEffect(() => {
    document.title = 'My Orders — E-Tech OS'
  }, [])

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Orders</h1>
            <p className="text-sm text-muted mt-0.5">Your service orders and delivery status</p>
          </div>
          <Link
            href="/services"
            className="shrink-0 inline-flex items-center gap-1.5 bg-brand text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-brand-deep transition-colors"
          >
            Browse services
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-border rounded-xl p-5 bg-white animate-pulse">
                <div className="h-4 w-32 bg-surface rounded mb-3" />
                <div className="h-3 w-48 bg-surface rounded mb-2" />
                <div className="h-3 w-24 bg-surface rounded" />
              </div>
            ))}
          </div>
        ) : !orders?.length ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm font-medium text-ink mb-1">No orders yet</p>
            <p className="text-xs text-muted mb-5">Browse our services and place your first order.</p>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-deep transition-colors"
            >
              Explore services
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="group flex flex-col bg-white border border-border rounded-xl p-5 hover:border-brand/30 hover:shadow-sm transition-all duration-150"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate group-hover:text-brand transition-colors">
                      {order.service?.title ?? 'Service Order'}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5 font-mono">{order.orderNumber}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLE[order.status] ?? 'bg-surface text-muted border-border'}`}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                  {order.pkg && (
                    <span>{order.pkg.name} package</span>
                  )}
                  {order.service?.category && (
                    <span>{CATEGORY_LABEL[order.service.category] ?? order.service.category}</span>
                  )}
                  <span>
                    ${(order.priceCents / 100).toLocaleString()}
                  </span>
                  <span>
                    Placed {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {order.dueDate && (
                    <span>Due {new Date(order.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  )}
                </div>

                {order.status === 'delivered' && (
                  <div className="mt-3 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                    Delivery ready — open to review and approve
                  </div>
                )}
                {order.status === 'requirements_needed' && (
                  <div className="mt-3 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    Action required: submit your project requirements
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
