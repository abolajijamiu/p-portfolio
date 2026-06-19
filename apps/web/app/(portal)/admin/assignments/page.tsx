'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'

type OrderRow = {
  order: {
    id: string
    orderNumber: string
    status: string
    priceCents: number
    assignedAt?: string | null
    dueDate?: string | null
    requirementsSubmittedAt?: string | null
    createdAt: string
  }
  serviceTitle: string
  packageName: string
  clientName: string
  clientEmail: string
}

type Expert = {
  id: string
  name: string
  email: string
  role: string
}

const STATUS_COLOR: Record<string, string> = {
  requirements_submitted: 'bg-sky-50 text-sky-700 border-sky-200',
  assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
  waiting_for_client: 'bg-amber-50 text-amber-700 border-amber-200',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function daysUntil(iso: string) {
  const d = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
  return d
}

export default function AssignmentsPage() {
  const { data: allOrders, mutate } = useSWR<OrderRow[]>('/cms/service-orders')
  const { data: users } = useSWR<{ users: Expert[] }>('/cms/users?role=expert&limit=50')

  const unassigned = (allOrders ?? []).filter((o) =>
    ['requirements_submitted', 'payment_received'].includes(o.order.status)
  )
  const active = (allOrders ?? []).filter((o) =>
    ['assigned', 'in_progress', 'waiting_for_client'].includes(o.order.status)
  )
  const experts = (users?.users ?? []).filter((u) => u.role === 'expert' || u.role === 'admin' || u.role === 'owner')

  return (
    <div className="px-4 pt-6 pb-12 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink tracking-tight">Assignments</h1>
        <p className="text-sm text-muted mt-1">Assign experts to orders and track active workload.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Needs assignment', value: unassigned.length, accent: unassigned.length > 0 ? 'text-amber-600' : 'text-ink' },
          { label: 'Assigned / active', value: active.length, accent: 'text-ink' },
          { label: 'Expert capacity', value: experts.length, accent: 'text-ink' },
          {
            label: 'Avg per expert',
            value: experts.length > 0 ? (active.length / experts.length).toFixed(1) : '—',
            accent: 'text-ink',
          },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-white border border-border rounded-xl p-4">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl font-bold ${accent}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Unassigned orders */}
      {unassigned.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-ink">Needs assignment ({unassigned.length})</h2>
          </div>
          <div className="space-y-2">
            {unassigned.map(({ order, serviceTitle, packageName, clientName }) => (
              <AssignmentRow
                key={order.id}
                order={order}
                serviceTitle={serviceTitle}
                packageName={packageName}
                clientName={clientName}
                experts={experts}
                onAssigned={mutate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active orders */}
      <div>
        <h2 className="text-sm font-semibold text-ink mb-3">Active orders ({active.length})</h2>
        {active.length === 0 ? (
          <div className="bg-white border border-border rounded-xl p-6 text-center text-sm text-muted">
            No active orders right now.
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  {['Order', 'Service', 'Client', 'Package', 'Status', 'Due', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {active.map(({ order, serviceTitle, packageName, clientName }) => {
                  const days = order.dueDate ? daysUntil(order.dueDate) : null
                  const overdue = days !== null && days < 0
                  return (
                    <tr key={order.id} className="hover:bg-surface/50">
                      <td className="px-4 py-3 font-mono text-xs text-muted">{order.orderNumber}</td>
                      <td className="px-4 py-3 font-medium text-ink max-w-xs truncate">{serviceTitle}</td>
                      <td className="px-4 py-3 text-muted">{clientName}</td>
                      <td className="px-4 py-3 text-muted">{packageName}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLOR[order.status] ?? 'bg-surface text-muted border-border'}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-xs ${overdue ? 'text-rose-600 font-semibold' : 'text-muted'}`}>
                        {days !== null ? (overdue ? `${Math.abs(days)}d overdue` : `${days}d left`) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <a href={`/admin/service-orders/${order.id}`} className="text-[11px] text-brand hover:underline">
                          View →
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function AssignmentRow({
  order,
  serviceTitle,
  packageName,
  clientName,
  experts,
  onAssigned,
}: {
  order: OrderRow['order']
  serviceTitle: string
  packageName: string
  clientName: string
  experts: Expert[]
  onAssigned: () => void
}) {
  const [expertId, setExpertId] = useState('')
  const [assigning, setAssigning] = useState(false)

  async function assign() {
    if (!expertId) return
    setAssigning(true)
    try {
      await api.post(`/cms/service-orders/${order.id}/assign`, { expertId })
      onAssigned()
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="bg-white border border-amber-200 rounded-xl p-4 flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-mono text-muted">{order.orderNumber}</span>
          {order.dueDate && (
            <span className="text-[10px] text-muted">· due {fmtDate(order.dueDate)}</span>
          )}
        </div>
        <p className="text-sm font-semibold text-ink">{serviceTitle}</p>
        <p className="text-xs text-muted">{clientName} · {packageName}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <select
          value={expertId}
          onChange={(e) => setExpertId(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand/30 bg-white"
        >
          <option value="">Select expert…</option>
          {experts.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
        <button
          onClick={assign}
          disabled={assigning || !expertId}
          className="bg-brand text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-brand-deep transition-colors disabled:opacity-50"
        >
          {assigning ? 'Assigning…' : 'Assign'}
        </button>
      </div>
    </div>
  )
}
