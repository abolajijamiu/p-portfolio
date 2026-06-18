'use client'

import { useEffect } from 'react'
import useSWR from 'swr'

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
  orderNumber?: string | null
  serviceTitle?: string | null
}

const STATUS_COLOR = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-surface text-muted',
}

const STATUS_LABEL = {
  pending: 'Pending',
  paid: 'Paid',
  cancelled: 'Cancelled',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ExpertPayoutsPage() {
  const { data: rows, isLoading } = useSWR<PayoutRow[]>('/expert/payouts')

  useEffect(() => { document.title = 'My Earnings — Expert' }, [])

  const totalPaid = rows?.filter((r) => r.payout.status === 'paid').reduce((acc, r) => acc + r.payout.amountCents, 0) ?? 0
  const totalPending = rows?.filter((r) => r.payout.status === 'pending').reduce((acc, r) => acc + r.payout.amountCents, 0) ?? 0

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink tracking-tight">Earnings</h1>
          <p className="text-sm text-muted mt-0.5">Your payout history from E-Tech</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white border border-border rounded-xl px-4 py-4">
            <p className="text-2xl font-bold text-ink tracking-tight leading-none mb-1">
              ${(totalPaid / 100).toLocaleString()}
            </p>
            <p className="text-xs text-muted">Total paid out</p>
          </div>
          <div className="bg-white border border-border rounded-xl px-4 py-4">
            <p className="text-2xl font-bold text-ink tracking-tight leading-none mb-1">
              ${(totalPending / 100).toLocaleString()}
            </p>
            <p className="text-xs text-muted">Pending payment</p>
          </div>
        </div>

        {/* Payout list */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-white border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !rows || rows.length === 0 ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No payout records yet.</p>
            <p className="text-xs text-muted mt-1">Payouts are recorded by the admin once orders are completed.</p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
            {rows.map((r) => (
              <div key={r.payout.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink leading-tight">
                      ${(r.payout.amountCents / 100).toLocaleString()} {r.payout.currency}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {r.payout.description ?? (r.serviceTitle ? `${r.serviceTitle}` : 'Payout')}
                      {r.orderNumber && <span className="font-mono ml-1.5 text-[11px]">· {r.orderNumber}</span>}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">{fmtDate(r.payout.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[r.payout.status]}`}>
                      {STATUS_LABEL[r.payout.status]}
                    </span>
                    {r.payout.paidAt && (
                      <p className="text-[11px] text-muted mt-1">Paid {fmtDate(r.payout.paidAt)}</p>
                    )}
                  </div>
                </div>
                {r.payout.adminNotes && (
                  <p className="mt-2 text-xs text-muted">{r.payout.adminNotes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
