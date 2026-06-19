'use client'

import useSWR from 'swr'
import { useAuth } from '@/lib/auth'
import { BarChartIcon, CheckIcon, StarIcon, CalendarIcon } from '@/components/ui/Icons'

type ExpertStats = {
  totalCompleted: number
  totalActive: number
  totalRevisions: number
  totalRevisionOrders: number
  onTimeCount: number
  onTimePossible: number
  avgRevisionRate: number
  totalEarningsCents: number
}

type RecentOrder = {
  order: {
    id: string
    orderNumber: string
    status: string
    priceCents: number
    dueDate?: string | null
    completedAt?: string | null
    revisionCount: number
    createdAt: string
  }
  serviceTitle: string
  clientName: string
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function pct(n: number, d: number) {
  if (d === 0) return '—'
  return `${Math.round((n / d) * 100)}%`
}

export default function ExpertPerformancePage() {
  const { user } = useAuth()
  const { data: orders } = useSWR<RecentOrder[]>('/expert/orders')

  const completed = (orders ?? []).filter((o) => o.order.status === 'completed')
  const active = (orders ?? []).filter((o) => ['assigned', 'in_progress', 'waiting_for_client'].includes(o.order.status))
  const delivered = (orders ?? []).filter((o) => ['delivered', 'approved', 'completed'].includes(o.order.status))

  const totalRevisions = (orders ?? []).reduce((s, o) => s + o.order.revisionCount, 0)
  const revisionOrders = (orders ?? []).filter((o) => o.order.revisionCount > 0).length
  const onTime = completed.filter((o) =>
    o.order.dueDate && o.order.completedAt && new Date(o.order.completedAt) <= new Date(o.order.dueDate)
  ).length

  const totalEarned = completed.reduce((s, o) => s + o.order.priceCents, 0)

  return (
    <div className="px-4 pt-6 pb-12 md:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-ink tracking-tight">Performance</h1>
        <p className="text-sm text-muted mt-1">Your metrics, delivery record, and order history.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Orders completed', value: completed.length, icon: CheckIcon, color: 'text-ink' },
          { label: 'Active orders', value: active.length, icon: BarChartIcon, color: 'text-purple-600' },
          { label: 'On-time delivery', value: pct(onTime, completed.length), icon: CalendarIcon, color: onTime / Math.max(completed.length, 1) >= 0.9 ? 'text-emerald-600' : 'text-amber-600' },
          { label: 'Revenue generated', value: `$${(totalEarned / 100).toLocaleString()}`, icon: StarIcon, color: 'text-ink' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-3.5 w-3.5 text-muted" />
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">{label}</p>
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-border rounded-xl p-5">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">Delivery quality</p>
          <div className="space-y-3">
            <Metric label="Total delivered" value={String(delivered.length)} />
            <Metric label="Revision orders" value={String(revisionOrders)} />
            <Metric label="Total revisions" value={String(totalRevisions)} />
            <Metric label="Revision rate" value={pct(revisionOrders, (orders ?? []).length)} />
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-5">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">Timeline</p>
          <div className="space-y-3">
            <Metric label="On time" value={String(onTime)} />
            <Metric label="From total" value={String(completed.length)} />
            <Metric label="On-time rate" value={pct(onTime, completed.length)} />
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-5">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">Volume</p>
          <div className="space-y-3">
            <Metric label="All orders" value={String((orders ?? []).length)} />
            <Metric label="In progress" value={String(active.length)} />
            <Metric label="Completed" value={String(completed.length)} />
          </div>
        </div>
      </div>

      {/* Recent completed */}
      <div>
        <h2 className="text-sm font-semibold text-ink mb-3">Recent completed orders</h2>
        {completed.length === 0 ? (
          <div className="bg-white border border-border rounded-xl p-6 text-center text-sm text-muted">
            No completed orders yet.
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  {['Order', 'Service', 'Client', 'Revisions', 'Completed', 'Revenue'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {completed.slice(0, 20).map(({ order, serviceTitle, clientName }) => (
                  <tr key={order.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3 font-mono text-xs text-muted">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-ink max-w-[180px] truncate">{serviceTitle}</td>
                    <td className="px-4 py-3 text-muted">{clientName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${order.revisionCount > 0 ? 'text-amber-600' : 'text-muted'}`}>
                        {order.revisionCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{order.completedAt ? fmtDate(order.completedAt) : '—'}</td>
                    <td className="px-4 py-3 font-semibold text-ink">${(order.priceCents / 100).toLocaleString()}</td>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-xs font-semibold text-ink">{value}</span>
    </div>
  )
}
