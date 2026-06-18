'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'

type AdminTicketRow = {
  ticket: {
    id: string
    subject: string
    status: 'open' | 'in_progress' | 'closed'
    priority: 'low' | 'normal' | 'high' | 'urgent'
    createdAt: string
    updatedAt: string
  }
  userName: string
  userEmail: string
  lastMessageAt: number
}

const STATUS_COLOR = {
  open: 'bg-sky-50 text-sky-700 border-sky-100',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-100',
  closed: 'bg-surface text-muted border-border',
}

const PRIORITY_DOT = {
  low: 'bg-neutral-300',
  normal: 'bg-neutral-400',
  high: 'bg-amber-400',
  urgent: 'bg-rose-500',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function AdminSupportPage() {
  const [statusFilter, setStatusFilter] = useState('open')
  const url = statusFilter === 'all' ? '/cms/support' : `/cms/support?status=${statusFilter}`
  const { data: rows, isLoading } = useSWR<AdminTicketRow[]>(url)

  useEffect(() => { document.title = 'Support Tickets — Admin' }, [])

  const counts: Record<string, number> = {}
  rows?.forEach((r) => { counts[r.ticket.status] = (counts[r.ticket.status] ?? 0) + 1 })

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-4xl">

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink tracking-tight">Support Tickets</h1>
          <p className="text-sm text-muted mt-0.5">Client support requests</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-5">
          {['open', 'in_progress', 'closed', 'all'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border capitalize whitespace-nowrap transition-colors ${
                statusFilter === s ? 'bg-ink text-white border-ink' : 'border-border text-muted hover:text-ink'
              }`}
            >
              {s.replace('_', ' ')} ({s === 'all' ? (rows?.length ?? 0) : (counts[s] ?? 0)})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white border border-border rounded-xl animate-pulse" />)}
          </div>
        ) : !rows || rows.length === 0 ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No tickets.</p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
            {rows.map(({ ticket, userName, userEmail }) => (
              <Link
                key={ticket.id}
                href={`/admin/support/${ticket.id}`}
                className="flex items-start justify-between gap-3 px-4 py-4 hover:bg-surface transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${PRIORITY_DOT[ticket.priority]}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{ticket.subject}</p>
                    <p className="text-[11px] text-muted mt-0.5 truncate">{userName} · {userEmail}</p>
                    <p className="text-[11px] text-muted mt-0.5">Updated {fmtDate(ticket.updatedAt)}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 capitalize ${STATUS_COLOR[ticket.status]}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
