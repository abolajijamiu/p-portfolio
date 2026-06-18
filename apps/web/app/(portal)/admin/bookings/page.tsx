'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'

type BookingRow = {
  booking: {
    id: string
    status: string
    priceCents: number
    currency: string
    clientNotes?: string | null
    adminNotes?: string | null
    meetingUrl?: string | null
    cancelReason?: string | null
    confirmedAt?: string | null
    createdAt: string
  }
  serviceTitle: string
  serviceColor: string
  slotStartsAt: string
  slotEndsAt: string
  clientName: string
  clientEmail: string
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelled: 'bg-surface text-muted border-border',
  completed: 'bg-blue-50 text-blue-700 border-blue-100',
  no_show: 'bg-rose-50 text-rose-700 border-rose-100',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No-show',
}

function fmtSlot(startsAt: string, endsAt: string) {
  const s = new Date(startsAt)
  const e = new Date(endsAt)
  return (
    s.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' +
    s.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) +
    '–' +
    e.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  )
}

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [meetingUrl, setMeetingUrl] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editUrl, setEditUrl] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const url = statusFilter === 'all' ? '/cms/bookings' : `/cms/bookings?status=${statusFilter}`
  const { data: rows, isLoading, mutate } = useSWR<BookingRow[]>(url)

  useEffect(() => { document.title = 'Bookings — Admin' }, [])

  const counts: Record<string, number> = {}
  rows?.forEach((r) => { counts[r.booking.status] = (counts[r.booking.status] ?? 0) + 1 })

  async function confirm(id: string) {
    setBusy(id)
    try {
      await api.post(`/cms/bookings/${id}/confirm`, {
        meetingUrl: meetingUrl || undefined,
        adminNotes: adminNotes || undefined,
      })
      mutate()
      setConfirmId(null)
      setMeetingUrl('')
      setAdminNotes('')
    } finally {
      setBusy(null)
    }
  }

  async function update(id: string) {
    setBusy(id)
    try {
      await api.patch(`/cms/bookings/${id}`, {
        meetingUrl: editUrl || null,
        adminNotes: editNotes || null,
      })
      mutate()
      setEditId(null)
      setEditUrl('')
      setEditNotes('')
    } finally {
      setBusy(null)
    }
  }

  async function complete(id: string) {
    setBusy(id)
    try {
      await api.post(`/cms/bookings/${id}/complete`)
      mutate()
    } finally {
      setBusy(null)
    }
  }

  async function noShow(id: string) {
    setBusy(id)
    try {
      await api.post(`/cms/bookings/${id}/no-show`)
      mutate()
    } finally {
      setBusy(null)
    }
  }

  async function cancel(id: string) {
    if (!cancelReason.trim()) return
    setBusy(id)
    try {
      await api.post(`/cms/bookings/${id}/cancel`, { reason: cancelReason })
      mutate()
      setCancelId(null)
      setCancelReason('')
    } finally {
      setBusy(null)
    }
  }

  const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show']

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink tracking-tight">Bookings</h1>
          <p className="text-sm text-muted mt-0.5">Manage client session bookings</p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
          {filters.map((s) => {
            const count = s === 'all' ? (rows?.length ?? 0) : (counts[s] ?? 0)
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                  statusFilter === s ? 'bg-ink text-white border-ink' : 'border-border text-muted hover:text-ink'
                }`}
              >
                {STATUS_LABEL[s] ?? 'All'} ({count})
              </button>
            )
          })}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white border border-border rounded-xl animate-pulse" />)}
          </div>
        ) : !rows || rows.length === 0 ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No bookings{statusFilter !== 'all' ? ` with status "${STATUS_LABEL[statusFilter] ?? statusFilter}"` : ' yet'}.</p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
            {rows.map((r) => (
              <div key={r.booking.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: r.serviceColor }} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink leading-tight">{r.serviceTitle}</p>
                      <p className="text-xs text-muted mt-0.5">{fmtSlot(r.slotStartsAt, r.slotEndsAt)}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_COLOR[r.booking.status]}`}>
                    {STATUS_LABEL[r.booking.status]}
                  </span>
                </div>

                <div className="ml-5 text-xs text-muted mb-3">
                  <span className="font-medium text-ink">{r.clientName}</span>
                  <span className="mx-1.5">·</span>
                  <span>{r.clientEmail}</span>
                  {r.booking.priceCents > 0 && (
                    <>
                      <span className="mx-1.5">·</span>
                      <span className="font-semibold text-ink">
                        ${(r.booking.priceCents / 100).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>

                {r.booking.clientNotes && (
                  <div className="ml-5 mb-3 bg-surface rounded-lg px-3 py-2 text-xs text-muted">
                    <span className="font-medium text-ink">Client note:</span> {r.booking.clientNotes}
                  </div>
                )}

                {r.booking.meetingUrl && (
                  <div className="ml-5 mb-3 text-xs">
                    <a href={r.booking.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline font-medium">
                      {r.booking.meetingUrl}
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="ml-5 flex items-center gap-3 flex-wrap">
                  {r.booking.status === 'pending' && (
                    <button
                      onClick={() => { setConfirmId(r.booking.id); setMeetingUrl('') }}
                      className="text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      Confirm
                    </button>
                  )}
                  {r.booking.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => complete(r.booking.id)}
                        disabled={busy === r.booking.id}
                        className="text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50"
                      >
                        Mark complete
                      </button>
                      <button
                        onClick={() => noShow(r.booking.id)}
                        disabled={busy === r.booking.id}
                        className="text-xs text-muted hover:text-rose-600 hover:underline disabled:opacity-50"
                      >
                        No-show
                      </button>
                      <button
                        onClick={() => {
                          setEditId(r.booking.id)
                          setEditUrl(r.booking.meetingUrl ?? '')
                          setEditNotes(r.booking.adminNotes ?? '')
                        }}
                        className="text-xs text-brand hover:underline"
                      >
                        Update link
                      </button>
                    </>
                  )}
                  {['pending', 'confirmed'].includes(r.booking.status) && (
                    <button
                      onClick={() => { setCancelId(r.booking.id); setCancelReason('') }}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirm modal */}
        {confirmId && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-border p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-sm font-semibold text-ink mb-4">Confirm booking</h3>
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Meeting URL</label>
                  <input
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/…"
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Admin notes (internal)</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Internal notes visible only to admins…"
                    rows={2}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setConfirmId(null); setMeetingUrl(''); setAdminNotes('') }}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-ink"
                >
                  Back
                </button>
                <button
                  onClick={() => confirm(confirmId)}
                  disabled={busy === confirmId}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {busy === confirmId ? 'Confirming…' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update meeting URL / notes modal */}
        {editId && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-border p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-sm font-semibold text-ink mb-4">Update booking</h3>
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Meeting URL</label>
                  <input
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="https://meet.google.com/…"
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Admin notes (internal)</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Internal notes visible only to admins…"
                    rows={2}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setEditId(null); setEditUrl(''); setEditNotes('') }}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  onClick={() => update(editId)}
                  disabled={busy === editId}
                  className="flex-1 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand/90 disabled:opacity-50"
                >
                  {busy === editId ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel modal */}
        {cancelId && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-border p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-sm font-semibold text-ink mb-3">Cancel booking</h3>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation…"
                rows={3}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setCancelId(null)} className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-ink">
                  Back
                </button>
                <button
                  onClick={() => cancel(cancelId)}
                  disabled={!cancelReason.trim() || busy === cancelId}
                  className="flex-1 py-2.5 rounded-lg bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 disabled:opacity-50"
                >
                  {busy === cancelId ? 'Cancelling…' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
