'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'

type PurchaseRow = {
  id: string
  status: 'pending_payment' | 'active' | 'expired' | 'refunded'
  pricePaidCents: number
  currency: string
  downloadCount: number
  licenseKey: string
  createdAt: string
  activatedAt?: string | null
  resource: { title: string; slug: string }
  license: { name: string }
}

const STATUS_STYLE: Record<string, string> = {
  pending_payment: 'bg-amber-50 text-amber-700 border-amber-100',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  expired: 'bg-surface text-muted border-border',
  refunded: 'bg-surface text-muted border-border',
}

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Pending payment',
  active: 'Active',
  expired: 'Expired',
  refunded: 'Refunded',
}

export default function AdminResourcePurchasesPage() {
  const { data: purchases, isLoading, mutate } = useSWR<PurchaseRow[]>('/cms/resource-purchases')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [busy, setBusy] = useState<string | null>(null)

  const filtered = purchases?.filter((p) => statusFilter === 'all' || p.status === statusFilter) ?? []

  async function activate(id: string) {
    setBusy(id)
    try {
      await api.post(`/cms/resource-purchases/${id}/activate`)
      mutate()
    } finally {
      setBusy(null)
    }
  }

  async function refund(id: string) {
    if (!confirm('Mark as refunded?')) return
    setBusy(id)
    try {
      await api.post(`/cms/resource-purchases/${id}/refund`)
      mutate()
    } finally {
      setBusy(null)
    }
  }

  const pendingCount = purchases?.filter((p) => p.status === 'pending_payment').length ?? 0

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink tracking-tight">Resource Purchases</h1>
          <p className="text-sm text-muted mt-0.5">Activate downloads once payment is confirmed</p>
          {pendingCount > 0 && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 font-medium">
              {pendingCount} purchase{pendingCount !== 1 ? 's' : ''} awaiting activation
            </div>
          )}
        </div>

        {/* Filter strip */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
          {['all', 'pending_payment', 'active', 'refunded'].map((s) => {
            const count = s === 'all' ? (purchases?.length ?? 0) : (purchases?.filter((p) => p.status === s).length ?? 0)
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                  statusFilter === s ? 'bg-ink text-white border-ink' : 'border-border text-muted hover:text-ink'
                }`}
              >
                {s === 'all' ? 'All' : STATUS_LABEL[s]} ({count})
              </button>
            )
          })}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white border border-border rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No purchases{statusFilter !== 'all' ? ` with status "${STATUS_LABEL[statusFilter] ?? statusFilter}"` : ' yet'}.</p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3">Resource / Licence</th>
                  <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">Licence key</th>
                  <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">Value</th>
                  <th className="text-right text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-ink text-xs leading-tight truncate max-w-[200px]">{p.resource.title}</p>
                      <p className="text-[11px] text-muted mt-0.5">
                        {p.license.name} · {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {p.downloadCount > 0 && ` · ${p.downloadCount} download${p.downloadCount !== 1 ? 's' : ''}`}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="font-mono text-[11px] text-muted truncate max-w-[180px]">{p.licenseKey}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden md:table-cell">
                      <span className="text-xs font-semibold text-ink">${(p.pricePaidCents / 100).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === 'pending_payment' && (
                          <button
                            onClick={() => activate(p.id)}
                            disabled={busy === p.id}
                            className="text-xs font-semibold text-emerald-600 hover:underline disabled:opacity-50"
                          >
                            Activate
                          </button>
                        )}
                        {p.status === 'active' && (
                          <button
                            onClick={() => refund(p.id)}
                            disabled={busy === p.id}
                            className="text-xs text-rose-500 hover:underline disabled:opacity-50"
                          >
                            Refund
                          </button>
                        )}
                        {(p.status === 'expired' || p.status === 'refunded') && (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </div>
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
