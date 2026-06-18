'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'

type OrderRow = {
  id: string
  orderNumber: string
  status: string
  priceCents: number
  currency: string
  createdAt: string
  dueDate?: string | null
  service?: { title: string; category: string } | null
  pkg?: { name: string } | null
  client?: { name: string; email: string } | null
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
  pending: 'Pending',
  payment_received: 'Payment rcvd',
  requirements_needed: 'Req. needed',
  requirements_submitted: 'Req. submitted',
  assigned: 'Assigned',
  in_progress: 'In progress',
  waiting_for_client: 'Waiting client',
  delivered: 'Delivered',
  revision_requested: 'Revision req.',
  approved: 'Approved',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const ALL_STATUSES = Object.keys(STATUS_LABEL)

export default function AdminServiceOrdersPage() {
  const { data: orders, isLoading } = useSWR<OrderRow[]>('/cms/service-orders')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = orders?.filter((o) =>
    statusFilter === 'all' ? true : o.status === statusFilter,
  ) ?? []

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink tracking-tight">Service Orders</h1>
          <p className="text-sm text-muted mt-0.5">Manage and track all client service orders</p>
        </div>

        {/* Filter strip */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
              statusFilter === 'all' ? 'bg-ink text-white border-ink' : 'border-border text-muted hover:text-ink'
            }`}
          >
            All ({orders?.length ?? 0})
          </button>
          {ALL_STATUSES.map((s) => {
            const count = orders?.filter((o) => o.status === s).length ?? 0
            if (count === 0) return null
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                  statusFilter === s ? 'bg-ink text-white border-ink' : 'border-border text-muted hover:text-ink'
                }`}
              >
                {STATUS_LABEL[s]} ({count})
              </button>
            )
          })}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-white border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No orders{statusFilter !== 'all' ? ` with status "${STATUS_LABEL[statusFilter]}"` : ' yet'}.</p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3">Order</th>
                  <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Client</th>
                  <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">Service</th>
                  <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">Value</th>
                  <th className="text-right text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-mono text-xs font-semibold text-ink">{order.orderNumber}</p>
                      <p className="text-[11px] text-muted mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {order.dueDate && ` · due ${new Date(order.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      {order.client ? (
                        <>
                          <p className="text-xs font-medium text-ink">{order.client.name}</p>
                          <p className="text-[11px] text-muted">{order.client.email}</p>
                        </>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-xs text-ink truncate max-w-[200px]">{order.service?.title ?? '—'}</p>
                      <p className="text-[11px] text-muted">{order.pkg?.name ?? ''}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[order.status] ?? 'bg-surface text-muted border-border'}`}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden md:table-cell">
                      <span className="text-xs font-semibold text-ink">
                        ${(order.priceCents / 100).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/admin/service-orders/${order.id}`}
                        className="text-xs font-semibold text-brand hover:underline"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
