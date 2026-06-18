'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'

type BookingService = {
  id: string
  slug: string
  title: string
  tagline: string
  category: string
  durationMinutes: number
  priceCents: number
  color: string
  active: boolean
  meetingPlatform: string
  sortOrder: number
}

const CATEGORIES = ['consultation', 'strategy', 'design_review', 'technical', 'onboarding', 'other']
const COLOR_PRESETS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

function fmtDuration(mins: number) {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

const EMPTY: Partial<BookingService> = {
  title: '', slug: '', tagline: '', category: 'consultation',
  durationMinutes: 30, priceCents: 0, color: '#6366f1',
  active: true, meetingPlatform: 'Google Meet', sortOrder: 0,
}

export default function AdminBookingServicesPage() {
  const { data: services, isLoading, mutate } = useSWR<BookingService[]>('/cms/booking-services')
  const [form, setForm] = useState<Partial<BookingService> | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { document.title = 'Booking Services — Admin' }, [])

  function slugify(v: string) {
    return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function save() {
    if (!form) return
    setSaving(true)
    try {
      const payload = { ...form, priceCents: Number(form.priceCents ?? 0) * 100 }
      if (form.id) {
        await api.patch(`/cms/booking-services/${form.id}`, payload)
      } else {
        await api.post('/cms/booking-services', payload)
      }
      mutate()
      setForm(null)
    } finally {
      setSaving(false)
    }
  }

  async function deleteService(id: string) {
    if (!confirm('Delete this booking service? All slots will be removed.')) return
    setDeleting(id)
    try {
      await api.delete(`/cms/booking-services/${id}`)
      mutate()
    } finally {
      setDeleting(null)
    }
  }

  async function toggle(svc: BookingService) {
    await api.patch(`/cms/booking-services/${svc.id}`, { active: !svc.active })
    mutate()
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Booking Services</h1>
            <p className="text-sm text-muted mt-0.5">Manage what clients can book</p>
          </div>
          <button
            onClick={() => setForm({ ...EMPTY })}
            className="text-xs font-semibold bg-brand text-white px-3 py-2 rounded-lg hover:bg-brand/90"
          >
            Add service
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white border border-border rounded-xl animate-pulse" />)}
          </div>
        ) : !services || services.length === 0 ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No booking services yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
            {services.map((svc) => (
              <div key={svc.id} className="flex items-center gap-4 px-4 py-3.5">
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: svc.color }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{svc.title}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {fmtDuration(svc.durationMinutes)} · {svc.category.replace('_', ' ')} · {svc.priceCents === 0 ? 'Free' : `$${svc.priceCents / 100}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${svc.active ? 'bg-emerald-50 text-emerald-700' : 'bg-surface text-muted'}`}>
                    {svc.active ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={() => toggle(svc)} className="text-xs text-muted hover:text-ink">
                    {svc.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => setForm({ ...svc, priceCents: svc.priceCents / 100 })} className="text-xs text-brand hover:underline">
                    Edit
                  </button>
                  <button
                    onClick={() => deleteService(svc.id)}
                    disabled={deleting === svc.id}
                    className="text-xs text-rose-500 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Drawer / modal form */}
        {form !== null && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-end md:items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-border p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-sm font-semibold text-ink mb-5">
                {form.id ? 'Edit booking service' : 'New booking service'}
              </h3>

              <div className="space-y-4">
                <Field label="Title">
                  <input
                    value={form.title ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: f?.id ? f.slug : slugify(e.target.value) }))}
                    className={inputCls}
                    placeholder="30-min Strategy Call"
                  />
                </Field>

                <Field label="Slug">
                  <input
                    value={form.slug ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                    className={inputCls}
                    placeholder="strategy-call-30"
                  />
                </Field>

                <Field label="Tagline">
                  <input
                    value={form.tagline ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                    className={inputCls}
                    placeholder="Short description for the booking page"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Category">
                    <select
                      value={form.category ?? 'consultation'}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className={inputCls}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Duration (minutes)">
                    <input
                      type="number"
                      min={15}
                      step={15}
                      value={form.durationMinutes ?? 30}
                      onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
                      className={inputCls}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Price (USD)">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={form.priceCents ?? 0}
                      onChange={(e) => setForm((f) => ({ ...f, priceCents: Number(e.target.value) }))}
                      className={inputCls}
                      placeholder="0 for free"
                    />
                  </Field>

                  <Field label="Meeting platform">
                    <input
                      value={form.meetingPlatform ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, meetingPlatform: e.target.value }))}
                      className={inputCls}
                      placeholder="Google Meet"
                    />
                  </Field>
                </div>

                <Field label="Colour">
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm((f) => ({ ...f, color: c }))}
                        className={`h-7 w-7 rounded-full border-2 transition-all ${form.color === c ? 'border-ink scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Min notice (hours)">
                    <input
                      type="number"
                      min={0}
                      value={(form as Record<string, unknown>).minNoticeHours as number ?? 24}
                      onChange={(e) => setForm((f) => ({ ...f, minNoticeHours: Number(e.target.value) }))}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Max advance (days)">
                    <input
                      type="number"
                      min={1}
                      value={(form as Record<string, unknown>).maxAdvanceDays as number ?? 30}
                      onChange={(e) => setForm((f) => ({ ...f, maxAdvanceDays: Number(e.target.value) }))}
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setForm(null)} className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-ink">
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving || !form.title || !form.slug}
                  className="flex-1 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand/90 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : form.id ? 'Save changes' : 'Create service'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}
