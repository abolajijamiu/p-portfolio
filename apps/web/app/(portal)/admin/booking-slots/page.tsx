'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'

type BookingService = { id: string; title: string; color: string; durationMinutes: number }
type Slot = {
  slot: { id: string; startsAt: string; endsAt: string; status: string }
  serviceTitle: string
  serviceColor: string
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

const STATUS_COLOR: Record<string, string> = {
  available: 'bg-emerald-50 text-emerald-700',
  booked: 'bg-blue-50 text-blue-700',
  blocked: 'bg-surface text-muted',
}

// Generate time options in 15-min increments
function timeOptions() {
  const opts: string[] = []
  for (let h = 7; h <= 21; h++) {
    for (const m of [0, 15, 30, 45]) {
      opts.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return opts
}

const TIMES = timeOptions()

export default function AdminBookingSlotsPage() {
  const { data: services } = useSWR<BookingService[]>('/cms/booking-services')
  const [serviceFilter, setServiceFilter] = useState<string>('all')

  const slotsUrl = serviceFilter === 'all' ? '/cms/booking-slots' : `/cms/booking-slots?serviceId=${serviceFilter}`
  const { data: slots, isLoading, mutate } = useSWR<Slot[]>(slotsUrl)

  const [showForm, setShowForm] = useState(false)
  const [bulkServiceId, setBulkServiceId] = useState('')
  const [bulkDate, setBulkDate] = useState('')
  const [bulkTimes, setBulkTimes] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { document.title = 'Booking Slots — Admin' }, [])
  useEffect(() => {
    if (services?.length && !bulkServiceId) setBulkServiceId(services[0].id)
  }, [services, bulkServiceId])

  function toggleTime(t: string) {
    setBulkTimes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }

  async function createSlots() {
    if (!bulkServiceId || !bulkDate || bulkTimes.length === 0) return
    const svc = services?.find((s) => s.id === bulkServiceId)
    if (!svc) return

    setCreating(true)
    try {
      const bulkSlots = bulkTimes.map((t) => {
        const [h, m] = t.split(':').map(Number)
        const start = new Date(`${bulkDate}T${t}:00`)
        const end = new Date(start.getTime() + svc.durationMinutes * 60000)
        return {
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
        }
      })
      await api.post('/cms/booking-slots/bulk', { bookingServiceId: bulkServiceId, slots: bulkSlots })
      mutate()
      setShowForm(false)
      setBulkTimes([])
      setBulkDate('')
    } finally {
      setCreating(false)
    }
  }

  async function deleteSlot(id: string) {
    setDeleting(id)
    try {
      await api.delete(`/cms/booking-slots/${id}`)
      mutate()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Cannot delete slot')
    } finally {
      setDeleting(null)
    }
  }

  const upcomingSlots = slots?.filter((s) => new Date(s.slot.startsAt) > new Date()) ?? []
  const pastSlots = slots?.filter((s) => new Date(s.slot.startsAt) <= new Date()) ?? []

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Booking Slots</h1>
            <p className="text-sm text-muted mt-0.5">Create and manage available time slots</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-semibold bg-brand text-white px-3 py-2 rounded-lg hover:bg-brand/90"
          >
            Add slots
          </button>
        </div>

        {/* Service filter */}
        {services && services.length > 0 && (
          <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setServiceFilter('all')}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${serviceFilter === 'all' ? 'bg-ink text-white border-ink' : 'border-border text-muted hover:text-ink'}`}
            >
              All services
            </button>
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => setServiceFilter(s.id)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${serviceFilter === s.id ? 'bg-ink text-white border-ink' : 'border-border text-muted hover:text-ink'}`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.title}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-white border border-border rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            {upcomingSlots.length > 0 && (
              <section className="mb-6">
                <h2 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Upcoming ({upcomingSlots.length})</h2>
                <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
                  {upcomingSlots.map((s) => (
                    <div key={s.slot.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.serviceColor }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-ink">{fmtSlot(s.slot.startsAt, s.slot.endsAt)}</p>
                        <p className="text-[11px] text-muted mt-0.5">{s.serviceTitle}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[s.slot.status]}`}>
                        {s.slot.status}
                      </span>
                      {s.slot.status !== 'booked' && (
                        <button
                          onClick={() => deleteSlot(s.slot.id)}
                          disabled={deleting === s.slot.id}
                          className="text-xs text-rose-500 hover:underline disabled:opacity-50 shrink-0"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {pastSlots.length > 0 && (
              <section>
                <h2 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Past ({pastSlots.length})</h2>
                <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border opacity-60">
                  {pastSlots.slice(0, 10).map((s) => (
                    <div key={s.slot.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.serviceColor }} />
                      <p className="text-xs text-muted flex-1">{fmtSlot(s.slot.startsAt, s.slot.endsAt)} · {s.serviceTitle}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[s.slot.status]}`}>
                        {s.slot.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {upcomingSlots.length === 0 && pastSlots.length === 0 && (
              <div className="py-16 text-center border border-border rounded-xl bg-white">
                <p className="text-sm text-muted">No slots yet. Add some to open up availability.</p>
              </div>
            )}
          </>
        )}

        {/* Bulk create modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-end md:items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-border p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-sm font-semibold text-ink mb-5">Create slots</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Service</label>
                  <select
                    value={bulkServiceId}
                    onChange={(e) => setBulkServiceId(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  >
                    {services?.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Date</label>
                  <input
                    type="date"
                    value={bulkDate}
                    min={new Date().toLocaleDateString('en-CA')}
                    onChange={(e) => setBulkDate(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">
                    Start times ({bulkTimes.length} selected)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
                    {TIMES.map((t) => (
                      <button
                        key={t}
                        onClick={() => toggleTime(t)}
                        className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          bulkTimes.includes(t)
                            ? 'bg-brand text-white border-brand'
                            : 'border-border text-muted hover:text-ink'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowForm(false); setBulkTimes([]) }} className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-ink">
                  Cancel
                </button>
                <button
                  onClick={createSlots}
                  disabled={creating || !bulkServiceId || !bulkDate || bulkTimes.length === 0}
                  className="flex-1 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand/90 disabled:opacity-50"
                >
                  {creating ? 'Creating…' : `Create ${bulkTimes.length} slot${bulkTimes.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
