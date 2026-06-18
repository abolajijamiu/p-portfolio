'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { api } from '@/lib/api'

type BookingRow = {
  booking: {
    id: string
    status: string
    priceCents: number
    currency: string
    clientNotes?: string | null
    meetingUrl?: string | null
    cancelReason?: string | null
    confirmedAt?: string | null
    createdAt: string
  }
  serviceTitle: string
  serviceSlug: string
  serviceDuration: number
  serviceColor: string
  slotStartsAt: string
  slotEndsAt: string
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-surface text-muted',
  completed: 'bg-blue-50 text-blue-700',
  no_show: 'bg-rose-50 text-rose-700',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending confirmation',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No-show',
}

function fmtSlot(startsAt: string, endsAt: string) {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  return (
    start.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
    ' · ' +
    start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) +
    '–' +
    end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  )
}

function isUpcoming(startsAt: string) {
  return new Date(startsAt) > new Date()
}

export default function BookingsPage() {
  const { data: rows, isLoading, mutate } = useSWR<BookingRow[]>('/bookings/mine')
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => { document.title = 'My Bookings — E-Tech OS' }, [])

  const upcoming = rows?.filter((r) => isUpcoming(r.slotStartsAt) && !['cancelled', 'completed', 'no_show'].includes(r.booking.status)) ?? []
  const past = rows?.filter((r) => !isUpcoming(r.slotStartsAt) || ['cancelled', 'completed', 'no_show'].includes(r.booking.status)) ?? []

  async function cancel(id: string) {
    if (!cancelReason.trim()) return
    setCancelling(id)
    try {
      await api.post(`/bookings/${id}/cancel`, { reason: cancelReason })
      mutate()
      setCancelId(null)
      setCancelReason('')
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-3xl">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">My Bookings</h1>
            <p className="text-sm text-muted mt-0.5">Upcoming sessions and past calls</p>
          </div>
          <Link
            href="/book"
            className="text-xs font-semibold bg-brand text-white px-3 py-2 rounded-lg hover:bg-brand/90 transition-colors"
          >
            Book a session
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white border border-border rounded-xl animate-pulse" />)}
          </div>
        ) : rows?.length === 0 ? (
          <div className="py-20 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted mb-3">No bookings yet.</p>
            <Link href="/book" className="text-sm font-semibold text-brand hover:underline">Book a session →</Link>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="mb-8">
                <h2 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Upcoming</h2>
                <div className="space-y-3">
                  {upcoming.map((r) => (
                    <BookingCard
                      key={r.booking.id}
                      row={r}
                      onCancel={() => { setCancelId(r.booking.id); setCancelReason('') }}
                    />
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h2 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Past</h2>
                <div className="space-y-3">
                  {past.map((r) => <BookingCard key={r.booking.id} row={r} />)}
                </div>
              </section>
            )}
          </>
        )}

        {/* Cancel modal */}
        {cancelId && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-border p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-sm font-semibold text-ink mb-3">Cancel booking</h3>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancelling…"
                rows={3}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setCancelId(null); setCancelReason('') }}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-ink"
                >
                  Keep it
                </button>
                <button
                  onClick={() => cancel(cancelId)}
                  disabled={!cancelReason.trim() || cancelling === cancelId}
                  className="flex-1 py-2.5 rounded-lg bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 disabled:opacity-50"
                >
                  {cancelling === cancelId ? 'Cancelling…' : 'Cancel booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BookingCard({ row, onCancel }: { row: BookingRow; onCancel?: () => void }) {
  const { booking, serviceTitle, serviceColor, slotStartsAt, slotEndsAt } = row
  const upcoming = isUpcoming(slotStartsAt)

  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/bookings/${booking.id}`} className="flex items-start gap-3 min-w-0 flex-1 group">
          <span className="mt-1 h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: serviceColor }} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink leading-tight truncate group-hover:text-brand transition-colors">{serviceTitle}</p>
            <p className="text-xs text-muted mt-0.5">{fmtSlot(slotStartsAt, slotEndsAt)}</p>
          </div>
        </Link>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[booking.status]}`}>
          {STATUS_LABEL[booking.status]}
        </span>
      </div>

      {booking.meetingUrl && booking.status === 'confirmed' && (
        <a
          href={booking.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-2 text-xs font-semibold text-brand hover:underline"
        >
          Join meeting →
        </a>
      )}

      {upcoming && booking.status === 'pending' && (
        <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-800">
          Awaiting confirmation. We'll send a meeting link once confirmed.
        </div>
      )}

      {booking.cancelReason && (
        <p className="mt-3 text-xs text-muted">Reason: {booking.cancelReason}</p>
      )}

      {upcoming && ['pending', 'confirmed'].includes(booking.status) && onCancel && (
        <div className="mt-3 pt-3 border-t border-border">
          <button onClick={onCancel} className="text-xs text-rose-500 hover:underline">
            Cancel booking
          </button>
        </div>
      )}
    </div>
  )
}
