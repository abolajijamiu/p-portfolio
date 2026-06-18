'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { useAuth } from '@/lib/auth'

type Stats = {
  orders: { total: number; active: number; completed: number; delivering: number }
  payouts: { totalEarned: number; pendingPayout: number }
}

type AssignedOrder = {
  order: { id: string; orderNumber: string; status: string; dueDate?: string | null; createdAt: string; updatedAt: string }
  serviceTitle: string
  packageName: string
  clientName: string
}

const STATUS_COLOR: Record<string, string> = {
  assigned: 'bg-indigo-50 text-indigo-700',
  in_progress: 'bg-purple-50 text-purple-700',
  waiting_for_client: 'bg-amber-50 text-amber-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  revision_requested: 'bg-rose-50 text-rose-700',
  completed: 'bg-surface text-muted',
}

const STATUS_LABEL: Record<string, string> = {
  assigned: 'Assigned',
  in_progress: 'In progress',
  waiting_for_client: 'Waiting for client',
  delivered: 'Delivered',
  revision_requested: 'Revision requested',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function ExpertDashboard() {
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading } = useSWR<Stats>('/expert/stats')
  const { data: orders, isLoading: ordersLoading } = useSWR<AssignedOrder[]>('/expert/orders')

  useEffect(() => { document.title = 'Expert Dashboard — E-Tech OS' }, [])

  const firstName = user?.name.split(' ')[0] ?? 'there'
  const activeOrders = orders?.filter((o) => !['completed', 'cancelled'].includes(o.order.status)) ?? []
  const needsAction = orders?.filter((o) => ['assigned', 'revision_requested'].includes(o.order.status)) ?? []

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-4xl">

        {/* Greeting */}
        <div className="mb-7">
          <h1 className="text-xl md:text-2xl font-semibold text-ink tracking-tight">
            Your workspace, {firstName}.
          </h1>
          <p className="text-sm text-muted mt-1">Orders assigned to you and your earnings.</p>
        </div>

        {/* Action needed */}
        {!ordersLoading && needsAction.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-900 mb-2">
              {needsAction.length === 1 ? '1 order needs your attention' : `${needsAction.length} orders need your attention`}
            </p>
            <div className="space-y-1">
              {needsAction.map((o) => (
                <Link
                  key={o.order.id}
                  href={`/expert/orders/${o.order.id}`}
                  className="flex items-center justify-between text-xs text-amber-800 hover:text-amber-900 py-0.5"
                >
                  <span className="font-medium truncate">{o.serviceTitle}</span>
                  <span className="shrink-0 ml-3">{STATUS_LABEL[o.order.status]} →</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Active orders', value: statsLoading ? '—' : (stats?.orders.active ?? 0), href: '/expert/orders' },
            { label: 'In delivery', value: statsLoading ? '—' : (stats?.orders.delivering ?? 0), href: '/expert/orders' },
            { label: 'Completed', value: statsLoading ? '—' : (stats?.orders.completed ?? 0) },
            { label: 'Pending payout', value: statsLoading ? '—' : `$${((stats?.payouts.pendingPayout ?? 0) / 100).toLocaleString()}`, href: '/expert/payouts' },
          ].map(({ label, value, href }) => {
            const card = (
              <div className="bg-white border border-border rounded-xl px-4 py-4">
                {statsLoading ? (
                  <>
                    <div className="h-7 w-10 bg-surface rounded animate-pulse mb-1" />
                    <div className="h-3 w-20 bg-surface rounded animate-pulse" />
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-ink tracking-tight leading-none mb-1">{value}</p>
                    <p className="text-xs text-muted">{label}</p>
                  </>
                )}
              </div>
            )
            return href ? (
              <Link key={label} href={href} className="block hover:shadow-sm transition-shadow">{card}</Link>
            ) : (
              <div key={label}>{card}</div>
            )
          })}
        </div>

        {/* Active orders list */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-semibold text-muted uppercase tracking-wider">Active orders</h2>
            <Link href="/expert/orders" className="text-xs text-muted hover:text-brand transition-colors">View all</Link>
          </div>

          {ordersLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-white border border-border rounded-xl animate-pulse" />
              ))}
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="py-10 text-center border border-border rounded-xl bg-white">
              <p className="text-sm text-muted">No active orders assigned to you.</p>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
              {activeOrders.map((o) => (
                <Link
                  key={o.order.id}
                  href={`/expert/orders/${o.order.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-surface transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate leading-tight">{o.serviceTitle}</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      <span className="font-mono">{o.order.orderNumber}</span>
                      <span className="mx-1.5">·</span>
                      <span>{o.clientName}</span>
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

        {/* Earnings summary */}
        {!statsLoading && stats && (
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-semibold text-muted uppercase tracking-wider">Earnings</h2>
              <Link href="/expert/payouts" className="text-xs text-muted hover:text-brand transition-colors">View history</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xl font-bold text-ink">${(stats.payouts.totalEarned / 100).toLocaleString()}</p>
                <p className="text-xs text-muted mt-0.5">Total earned (paid out)</p>
              </div>
              <div>
                <p className="text-xl font-bold text-ink">${(stats.payouts.pendingPayout / 100).toLocaleString()}</p>
                <p className="text-xs text-muted mt-0.5">Pending payout</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
