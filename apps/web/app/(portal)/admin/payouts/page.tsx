'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'

type Expert = { id: string; name: string; email: string }

type PayoutRow = {
  payout: {
    id: string
    amountCents: number
    currency: string
    status: 'pending' | 'paid' | 'cancelled'
    description?: string | null
    adminNotes?: string | null
    paidAt?: string | null
    createdAt: string
  }
  expertName: string
  expertEmail: string
  orderNumber?: string | null
  serviceTitle?: string | null
}

type Stats = { totalPaid: number; totalPending: number; countPending: number }

const STATUS_COLOR = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelled: 'bg-surface text-muted border-border',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminPayoutsPage() {
  const { data: stats } = useSWR<Stats>('/cms/payouts/stats')
  const { data: experts } = useSWR<Expert[]>('/cms/payouts/experts')
  const [statusFilter, setStatusFilter] = useState('all')
  const url = statusFilter === 'all' ? '/cms/payouts' : `/cms/payouts?status=${statusFilter}`
  const { data: rows, isLoading, mutate } = useSWR<PayoutRow[]>(url)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ expertId: '', orderId: '', amountUsd: '', description: '', adminNotes: '' })
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => { document.title = 'Payouts — Admin' }, [])
  useEffect(() => {
    if (experts?.length && !form.expertId) setForm((f) => ({ ...f, expertId: experts[0].id }))
  }, [experts, form.expertId])

  async function createPayout() {
    if (!form.expertId || !form.amountUsd) return
    setSaving(true)
    try {
      await api.post('/cms/payouts', {
        expertId: form.expertId,
        orderId: form.orderId || undefined,
        amountCents: Math.round(parseFloat(form.amountUsd) * 100),
        description: form.description || undefined,
        adminNotes: form.adminNotes || undefined,
      })
      mutate()
      setShowForm(false)
      setForm({ expertId: experts?.[0]?.id ?? '', orderId: '', amountUsd: '', description: '', adminNotes: '' })
    } finally {
      setSaving(false)
    }
  }

  async function markPaid(id: string) {
    setBusy(id)
    try {
      await api.post(`/cms/payouts/${id}/mark-paid`)
      mutate()
    } finally {
      setBusy(null)
    }
  }

  async function cancelPayout(id: string) {
    if (!confirm('Cancel this payout?')) return
    setBusy(id)
    try {
      await api.post(`/cms/payouts/${id}/cancel`)
      mutate()
    } finally {
      setBusy(null)
    }
  }

  const counts: Record<string, number> = {}
  rows?.forEach((r) => { counts[r.payout.status] = (counts[r.payout.status] ?? 0) + 1 })

  const inputCls = 'w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand'

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-5xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Expert Payouts</h1>
            <p className="text-sm text-muted mt-0.5">Track and record manual payments to experts</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-semibold bg-brand text-white px-3 py-2 rounded-lg hover:bg-brand/90"
          >
            Record payout
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white border border-border rounded-xl px-4 py-4">
              <p className="text-xl font-bold text-ink">${(stats.totalPaid / 100).toLocaleString()}</p>
              <p className="text-xs text-muted mt-0.5">Total paid out</p>
            </div>
            <div className="bg-white border border-border rounded-xl px-4 py-4">
              <p className="text-xl font-bold text-ink">${(stats.totalPending / 100).toLocaleString()}</p>
              <p className="text-xs text-muted mt-0.5">Pending</p>
            </div>
            <div className="bg-white border border-border rounded-xl px-4 py-4">
              <p className="text-xl font-bold text-ink">{stats.countPending}</p>
              <p className="text-xs text-muted mt-0.5">Unpaid records</p>
            </div>
          </div>
        )}

        {stats && stats.countPending > 0 && (
          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 font-medium">
            {stats.countPending} payout{stats.countPending !== 1 ? 's' : ''} awaiting payment
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 mb-5">
          {['all', 'pending', 'paid', 'cancelled'].map((s) => {
            const count = s === 'all' ? (rows?.length ?? 0) : (counts[s] ?? 0)
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border capitalize whitespace-nowrap transition-colors ${
                  statusFilter === s ? 'bg-ink text-white border-ink' : 'border-border text-muted hover:text-ink'
                }`}
              >
                {s} ({count})
              </button>
            )
          })}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white border border-border rounded-xl animate-pulse" />)}
          </div>
        ) : !rows || rows.length === 0 ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No payout records yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
            {rows.map((r) => (
              <div key={r.payout.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      ${(r.payout.amountCents / 100).toLocaleString()} {r.payout.currency}
                      <span className="font-normal text-muted ml-2">→ {r.expertName}</span>
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {r.payout.description ?? (r.serviceTitle ?? 'Manual payout')}
                      {r.orderNumber && <span className="font-mono ml-1.5 text-[11px]">· {r.orderNumber}</span>}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">{fmtDate(r.payout.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLOR[r.payout.status]}`}>
                      {r.payout.status}
                    </span>
                    {r.payout.paidAt && (
                      <p className="text-[11px] text-muted mt-1">Paid {fmtDate(r.payout.paidAt)}</p>
                    )}
                  </div>
                </div>
                {r.payout.adminNotes && <p className="mt-2 text-xs text-muted">{r.payout.adminNotes}</p>}
                <div className="mt-3 flex items-center gap-3">
                  {r.payout.status === 'pending' && (
                    <button
                      onClick={() => markPaid(r.payout.id)}
                      disabled={busy === r.payout.id}
                      className="text-xs font-semibold text-emerald-600 hover:underline disabled:opacity-50"
                    >
                      Mark paid
                    </button>
                  )}
                  {r.payout.status === 'pending' && (
                    <button
                      onClick={() => cancelPayout(r.payout.id)}
                      disabled={busy === r.payout.id}
                      className="text-xs text-rose-500 hover:underline disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create payout modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-end md:items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-border p-6 w-full max-w-md shadow-xl">
              <h3 className="text-sm font-semibold text-ink mb-5">Record payout</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Expert</label>
                  <select
                    value={form.expertId}
                    onChange={(e) => setForm((f) => ({ ...f, expertId: e.target.value }))}
                    className={inputCls}
                  >
                    {!experts || experts.length === 0 ? (
                      <option value="">No experts found</option>
                    ) : (
                      experts.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.email})</option>)
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Amount (USD)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.amountUsd}
                    onChange={(e) => setForm((f) => ({ ...f, amountUsd: e.target.value }))}
                    placeholder="0.00"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Description</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="e.g. Shopify store delivery — June"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Admin notes (internal)</label>
                  <textarea
                    value={form.adminNotes}
                    onChange={(e) => setForm((f) => ({ ...f, adminNotes: e.target.value }))}
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-ink">
                  Cancel
                </button>
                <button
                  onClick={createPayout}
                  disabled={saving || !form.expertId || !form.amountUsd}
                  className="flex-1 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand/90 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Record payout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
