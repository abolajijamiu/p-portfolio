'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

type Slot = {
  id: string
  startsAt: string
  endsAt: string
}

type BookingDetail = {
  booking: {
    id: string
    status: BookingStatus
    priceCents: number
    currency: string
    clientNotes?: string | null
    adminNotes?: string | null
    meetingUrl?: string | null
    cancelReason?: string | null
    sessionNotes?: string | null
    recordingUrl?: string | null
    rescheduledAt?: string | null
    confirmedAt?: string | null
    completedAt?: string | null
    cancelledAt?: string | null
    createdAt: string
  }
  serviceTitle: string
  serviceSlug: string
  serviceId: string
  serviceDuration: number
  serviceMeetingPlatform: string
  serviceColor: string
  slotStartsAt: string
  slotEndsAt: string
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Awaiting Payment',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
}

const STATUS_COLOR: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-slate-100 text-slate-600',
}

const TZ = typeof window !== 'undefined'
  ? Intl.DateTimeFormat().resolvedOptions().timeZone
  : 'UTC'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false })
}


function fmtPrice(cents: number, currency: string) {
  if (cents === 0) return 'Free'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(cents / 100)
}

function groupSlotsByDate(slots: Slot[]): Record<string, Slot[]> {
  const groups: Record<string, Slot[]> = {}
  for (const s of slots) {
    const k = s.startsAt.slice(0, 10)
    if (!groups[k]) groups[k] = []
    groups[k].push(s)
  }
  return groups
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [showCancel, setShowCancel] = useState(false)

  const [showReschedule, setShowReschedule] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [rescheduling, setRescheduling] = useState(false)
  const [rescheduleError, setRescheduleError] = useState('')

  const paymentResult =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('payment')
      : null

  const load = useCallback(async () => {
    try {
      const result = await api.get<BookingDetail>(`/bookings/${id}`)
      setData(result)
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status === 401) router.push('/login')
      else setError('Booking not found.')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { load() }, [load])

  async function handleCancel() {
    if (!cancelReason.trim()) return
    setCancelling(true)
    try {
      await api.post(`/bookings/${id}/cancel`, { reason: cancelReason })
      setShowCancel(false)
      load()
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Failed to cancel booking.')
    } finally {
      setCancelling(false)
    }
  }

  async function openReschedule() {
    if (!data) return
    setShowReschedule(true)
    setSlotsLoading(true)
    setSelectedDate('')
    setSelectedSlotId('')
    setRescheduleError('')
    try {
      const from = new Date().toISOString()
      const to = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      const slots = await api.get<Slot[]>(`/booking-services/${data.serviceId}/slots?from=${from}&to=${to}`)
      setAvailableSlots(slots)
    } catch {
      setRescheduleError('Failed to load available slots.')
    } finally {
      setSlotsLoading(false)
    }
  }

  async function handleReschedule() {
    if (!selectedSlotId) return
    setRescheduling(true)
    setRescheduleError('')
    try {
      await api.post(`/bookings/${id}/reschedule`, { slotId: selectedSlotId })
      setShowReschedule(false)
      load()
    } catch (err: unknown) {
      setRescheduleError((err as Error).message ?? 'Failed to reschedule booking.')
    } finally {
      setRescheduling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          <p className="text-sm text-muted">Loading booking…</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-semibold text-ink mb-1">{error ?? 'Booking not found'}</p>
          <Link href="/bookings" className="text-sm text-brand hover:underline">← Back to bookings</Link>
        </div>
      </div>
    )
  }

  const { booking } = data
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'
  const canReschedule = booking.status === 'confirmed'
  const isCancelled = booking.status === 'cancelled'
  const isCompleted = booking.status === 'completed'
  const isConfirmed = booking.status === 'confirmed'

  const slotGroups = groupSlotsByDate(availableSlots)
  const datesAvailable = Object.keys(slotGroups).sort()
  const slotsForDate = selectedDate ? (slotGroups[selectedDate] ?? []) : []

  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-border">
        <div className="px-4 md:px-8 h-14 flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/bookings" className="text-muted hover:text-ink transition-colors text-sm shrink-0">
              ← Bookings
            </Link>
            <span className="text-muted/40 shrink-0">/</span>
            <span className="text-sm font-semibold text-ink truncate">{data.serviceTitle}</span>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[booking.status]}`}>
            {STATUS_LABELS[booking.status]}
          </span>
        </div>
      </div>

      {/* Payment banners */}
      {paymentResult === 'success' && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3 text-center">
          <p className="text-sm font-medium text-emerald-800">
            Payment confirmed — your session is booked. We&apos;ll send a meeting link shortly.
          </p>
        </div>
      )}
      {paymentResult === 'cancelled' && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 text-center">
          <p className="text-sm font-medium text-amber-800">
            Payment was cancelled. Your booking is still pending — complete checkout to secure your slot.
          </p>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-5">

        {/* Session card */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-lg font-semibold text-ink">{data.serviceTitle}</p>
              <p className="text-sm text-muted mt-0.5">{data.serviceDuration} min · {data.serviceMeetingPlatform}</p>
            </div>
            <p className="text-lg font-bold text-ink shrink-0">
              {fmtPrice(booking.priceCents, booking.currency)}
            </p>
          </div>

          <div className="bg-surface rounded-xl p-4 mb-5 space-y-1">
            <p className="text-sm font-semibold text-ink">{fmtDate(data.slotStartsAt)}</p>
            <p className="text-sm text-muted">
              {fmtTime(data.slotStartsAt)} – {fmtTime(data.slotEndsAt)}
              {' '}<span className="text-[11px]">{new Date().toLocaleTimeString('en-GB', { timeZone: TZ, timeZoneName: 'short' }).split(' ').pop()}</span>
            </p>
            {booking.rescheduledAt && (
              <p className="text-[11px] text-amber-600 mt-1">
                Rescheduled on {new Date(booking.rescheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted mb-0.5">Booked</p>
              <p className="font-medium text-ink">
                {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            {booking.confirmedAt && (
              <div>
                <p className="text-muted mb-0.5">Confirmed</p>
                <p className="font-medium text-ink">
                  {new Date(booking.confirmedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Meeting link */}
        {isConfirmed && booking.meetingUrl && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-emerald-800 mb-2">Your meeting link is ready</p>
            <a
              href={booking.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-900 underline underline-offset-2 break-all"
            >
              {booking.meetingUrl}
            </a>
          </div>
        )}

        {isConfirmed && !booking.meetingUrl && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <p className="text-sm font-semibold text-blue-800 mb-1">Session confirmed</p>
            <p className="text-sm text-blue-700">
              Your meeting link will be sent to your email before the session.
            </p>
          </div>
        )}

        {/* Session summary (completed) */}
        {isCompleted && (booking.sessionNotes || booking.recordingUrl) && (
          <div className="bg-white rounded-xl border border-border p-5 space-y-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Session summary</p>
            {booking.sessionNotes && (
              <div>
                <p className="text-xs font-medium text-muted mb-1.5">Notes from your session</p>
                <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{booking.sessionNotes}</p>
              </div>
            )}
            {booking.recordingUrl && (
              <div>
                <p className="text-xs font-medium text-muted mb-1.5">Session recording</p>
                <a
                  href={booking.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-deep underline underline-offset-2"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Watch recording
                </a>
              </div>
            )}
          </div>
        )}

        {/* Admin notes */}
        {booking.adminNotes && (
          <div className="bg-white rounded-xl border border-border p-5">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Note from team</p>
            <p className="text-sm text-ink leading-relaxed">{booking.adminNotes}</p>
          </div>
        )}

        {/* Client notes */}
        {booking.clientNotes && (
          <div className="bg-white rounded-xl border border-border p-5">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Your notes</p>
            <p className="text-sm text-ink leading-relaxed">{booking.clientNotes}</p>
          </div>
        )}

        {/* Completed badge */}
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <svg className="h-8 w-8 text-green-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-green-800">Session completed</p>
            {booking.completedAt && (
              <p className="text-xs text-green-700 mt-1">
                {new Date(booking.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        )}

        {/* Cancelled */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-red-800 mb-1">Booking cancelled</p>
            {booking.cancelReason && (
              <p className="text-sm text-red-700">{booking.cancelReason}</p>
            )}
          </div>
        )}

        {/* Reschedule */}
        {canReschedule && (
          <div className="bg-white rounded-xl border border-border p-5">
            {showReschedule ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">Reschedule session</p>
                  <button onClick={() => setShowReschedule(false)} className="text-xs text-muted hover:text-ink transition-colors">
                    Cancel
                  </button>
                </div>

                {slotsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted py-4">
                    <div className="h-4 w-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                    Loading available slots…
                  </div>
                ) : rescheduleError ? (
                  <p className="text-sm text-rose-600 py-2">{rescheduleError}</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-muted py-2">No available slots in the next 60 days.</p>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">Select a date</label>
                      <select
                        value={selectedDate}
                        onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlotId('') }}
                        className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 bg-white"
                      >
                        <option value="">Choose a date…</option>
                        {datesAvailable.map((d) => (
                          <option key={d} value={d}>
                            {new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedDate && (
                      <div>
                        <label className="block text-xs font-medium text-muted mb-1.5">Select a time</label>
                        <div className="grid grid-cols-3 gap-2">
                          {slotsForDate.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => setSelectedSlotId(s.id)}
                              className={`py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
                                selectedSlotId === s.id
                                  ? 'bg-brand text-white border-brand'
                                  : 'border-border text-ink hover:border-brand/40 hover:bg-brand/5'
                              }`}
                            >
                              {fmtTime(s.startsAt)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleReschedule}
                      disabled={rescheduling || !selectedSlotId}
                      className="w-full bg-brand text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-deep transition-colors disabled:opacity-50"
                    >
                      {rescheduling ? 'Rescheduling…' : 'Confirm new time'}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={openReschedule}
                className="text-sm text-brand hover:text-brand-deep font-medium transition-colors"
              >
                Reschedule this booking
              </button>
            )}
          </div>
        )}

        {/* Cancel action */}
        {canCancel && (
          <div className="bg-white rounded-xl border border-border p-5">
            {showCancel ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-ink">Cancel this booking?</p>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Reason for cancellation (required)"
                  rows={3}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400"
                />
                {error && <p className="text-xs text-rose-600">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={cancelling || !cancelReason.trim()}
                    className="flex-1 bg-rose-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors"
                  >
                    {cancelling ? 'Cancelling…' : 'Confirm cancellation'}
                  </button>
                  <button
                    onClick={() => { setShowCancel(false); setCancelReason('') }}
                    className="px-4 py-2.5 border border-border rounded-lg text-sm text-muted hover:text-ink transition-colors"
                  >
                    Keep booking
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCancel(true)}
                className="text-sm text-rose-600 hover:text-rose-800 font-medium transition-colors"
              >
                Cancel this booking
              </button>
            )}
          </div>
        )}

        {/* Pending payment CTA */}
        {booking.status === 'pending' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-amber-800 mb-1">Payment required</p>
            <p className="text-sm text-amber-700 mb-4">
              Your slot is reserved but payment is needed to confirm the booking.
            </p>
            <Link
              href={`/book/${data.serviceSlug}`}
              className="inline-block bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Complete booking
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
