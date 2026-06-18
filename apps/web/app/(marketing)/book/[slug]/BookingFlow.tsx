'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

type Slot = {
  id: string
  startsAt: string
  endsAt: string
  status: string
}

type BookingService = {
  id: string
  slug: string
  title: string
  durationMinutes: number
  priceCents: number
  currency: string
  maxAdvanceDays: number
}

function fmtPrice(cents: number, currency: string) {
  if (cents === 0) return 'Free'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(cents / 100)
}

function groupByDate(slots: Slot[]): Record<string, Slot[]> {
  return slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const date = new Date(slot.startsAt).toLocaleDateString('en-CA') // YYYY-MM-DD
    if (!acc[date]) acc[date] = []
    acc[date].push(slot)
    return acc
  }, {})
}

function fmtDayLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function BookingFlow({ service }: { service: BookingService }) {
  const router = useRouter()
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState<'pick' | 'confirm' | 'done'>('pick')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const from = new Date().toISOString()
        const to = new Date(Date.now() + service.maxAdvanceDays * 86400000).toISOString()
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/booking-services/${service.id}/slots?from=${from}&to=${to}`,
        )
        if (res.ok) {
          const data: Slot[] = await res.json()
          setSlots(data)
          const grouped = groupByDate(data)
          const firstDate = Object.keys(grouped).sort()[0]
          if (firstDate) setSelectedDate(firstDate)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [service.id, service.maxAdvanceDays])

  const grouped = groupByDate(slots)
  const availableDates = Object.keys(grouped).sort()
  const slotsForDate = selectedDate ? (grouped[selectedDate] ?? []) : []

  async function handleBook() {
    if (!selectedSlot) return
    setSubmitting(true)
    setError(null)
    try {
      if (service.priceCents > 0) {
        // Paid booking — go through Stripe
        const { checkoutUrl } = await api.post<{ bookingId: string; checkoutUrl: string }>(
          '/bookings/checkout',
          { slotId: selectedSlot.id, clientNotes: notes || undefined },
        )
        window.location.href = checkoutUrl
      } else {
        // Free session — direct booking
        await api.post('/bookings', { slotId: selectedSlot.id, clientNotes: notes || undefined })
        setStep('done')
      }
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status === 401) {
        router.push(`/login?redirect=/book/${service.slug}`)
        return
      }
      if (status === 503) {
        setError('Online payment is temporarily unavailable. Please contact us.')
        return
      }
      setError((err as Error).message ?? 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5">
          <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-ink mb-2">Booking requested</h2>
        <p className="text-sm text-muted max-w-xs mb-6">
          {service.priceCents > 0
            ? 'We\'ll send payment instructions to your email. Your slot is reserved for 24 hours.'
            : 'We\'ll confirm your session and send a meeting link shortly.'}
        </p>
        <a href="/bookings" className="text-sm font-medium text-brand hover:underline">View my bookings →</a>
      </div>
    )
  }

  if (step === 'confirm' && selectedSlot) {
    return (
      <div className="border border-border rounded-2xl p-6 bg-white">
        <h2 className="text-base font-semibold text-ink mb-5">Confirm booking</h2>

        <div className="bg-surface rounded-xl p-4 mb-5 space-y-2 text-sm">
          <p className="font-medium text-ink">{service.title}</p>
          <p className="text-muted">
            {new Date(selectedSlot.startsAt).toLocaleDateString('en-GB', {
              weekday: 'long', day: 'numeric', month: 'long',
            })} at {fmtTime(selectedSlot.startsAt)} — {fmtTime(selectedSlot.endsAt)}
          </p>
          <p className="text-muted">{fmtPrice(service.priceCents, service.currency)}</p>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything we should know before the call…"
            rows={3}
            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none"
          />
        </div>

        {error && <p className="text-xs text-rose-600 mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => { setStep('pick'); setSelectedSlot(null) }}
            className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-ink transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleBook}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand/90 disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Booking…' : 'Confirm booking'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-ink mb-4">Choose a date &amp; time</h2>

      {loading ? (
        <div className="space-y-3">
          <div className="h-9 w-full bg-surface rounded-lg animate-pulse" />
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-surface rounded-lg animate-pulse" />)}
          </div>
        </div>
      ) : availableDates.length === 0 ? (
        <div className="py-12 text-center border border-border rounded-xl">
          <p className="text-sm text-muted">No available slots at the moment.</p>
          <p className="text-xs text-muted mt-1">Check back soon or contact us directly.</p>
        </div>
      ) : (
        <>
          {/* Date tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-5">
            {availableDates.map((date) => (
              <button
                key={date}
                onClick={() => { setSelectedDate(date); setSelectedSlot(null) }}
                className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                  selectedDate === date
                    ? 'bg-ink text-white border-ink'
                    : 'border-border text-muted hover:text-ink'
                }`}
              >
                {fmtDayLabel(date)}
                <span className="ml-1.5 text-[10px] opacity-60">({grouped[date].length})</span>
              </button>
            ))}
          </div>

          {/* Time grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
            {slotsForDate.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  selectedSlot?.id === slot.id
                    ? 'bg-brand text-white border-brand'
                    : 'border-border text-ink hover:border-brand/40'
                }`}
              >
                {fmtTime(slot.startsAt)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep('confirm')}
            disabled={!selectedSlot}
            className="w-full py-3 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {selectedSlot ? `Book ${fmtTime(selectedSlot.startsAt)}` : 'Select a time'}
          </button>
        </>
      )}
    </div>
  )
}
