'use client'

import { useEffect, useState } from 'react'
import useSWR, { mutate as globalMutate } from 'swr'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import type { CmsTestimonial } from '@/types'

function statusClass(status: string) {
  if (status === 'published') return 'bg-green-50 text-green-700'
  if (status === 'archived') return 'bg-surface text-muted'
  return 'bg-amber-50 text-amber-700'
}

function Stars({ value }: { value: number | null | undefined }) {
  if (!value) return null
  return (
    <span className="inline-flex items-center gap-0.5 shrink-0" title={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`h-3 w-3 ${s <= value ? 'text-amber-400' : 'text-[#E2E8F0]'}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354l-4.543 2.826c-.998.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433L10.788 3.21z" />
        </svg>
      ))}
    </span>
  )
}

function RatingSelect({ value, onChange }: { value: number | string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2 py-1.5 text-xs border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
    >
      <option value="">No rating</option>
      {[1, 2, 3, 4, 5].map((n) => (
        <option key={n} value={n}>{n} star{n !== 1 ? 's' : ''}</option>
      ))}
    </select>
  )
}

function TestimonialRow({ item, onRefresh }: { item: CmsTestimonial; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    client: item.client,
    role: item.role ?? '',
    company: item.company ?? '',
    quote: item.quote,
    rating: item.rating?.toString() ?? '',
    workSlug: item.workSlug ?? '',
    featured: item.featured,
  })

  async function save() {
    setSaving(true)
    await api.patch(`/cms/testimonials/${item.id}`, {
      ...form,
      rating: form.rating ? Number(form.rating) : null,
    })
    setSaving(false)
    setEditing(false)
    onRefresh()
  }

  async function publish() {
    await api.put(`/cms/testimonials/${item.id}/publish`, {})
    onRefresh()
  }

  async function remove() {
    if (!confirm('Delete this testimonial?')) return
    await api.delete(`/cms/testimonials/${item.id}`)
    onRefresh()
  }

  if (editing) {
    return (
      <div className="bg-surface border-b border-border p-5 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <Input label="Client" value={form.client} onChange={(e) => setForm((p) => ({ ...p, client: e.target.value }))} />
          <Input label="Role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} placeholder="Founder" />
          <Input label="Company" value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-ink">Quote</label>
          <textarea
            value={form.quote}
            onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none"
          />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <Input label="Work slug" value={form.workSlug} onChange={(e) => setForm((p) => ({ ...p, workSlug: e.target.value }))} placeholder="carve-boards" />
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Rating</label>
            <RatingSelect value={form.rating} onChange={(v) => setForm((p) => ({ ...p, rating: v }))} />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer mt-5">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} />
            Featured
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={save} loading={saving}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between px-5 py-4 bg-white border-b border-border last:border-0">
      <div className="min-w-0 flex-1 mr-4">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-sm font-medium text-ink">{item.client}</p>
          {item.role && <span className="text-[11px] text-muted">{item.role}{item.company && `, ${item.company}`}</span>}
          {item.rating && <Stars value={item.rating} />}
          {item.featured && <span className="text-[10px] font-medium text-brand bg-brand/10 px-1.5 py-0.5 rounded-full">Featured</span>}
        </div>
        <p className="text-[11px] text-muted/80 leading-relaxed line-clamp-2">"{item.quote}"</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusClass(item.status)}`}>{item.status}</span>
        {item.status !== 'published' && (
          <Button size="sm" variant="ghost" onClick={publish}>Publish</Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
        <button onClick={remove} className="text-muted/40 hover:text-red-500 transition-[color] duration-150 text-sm px-1">×</button>
      </div>
    </div>
  )
}

function NewTestimonialForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ client: '', role: '', company: '', quote: '', rating: '', workSlug: '' })

  async function submit() {
    if (!form.client.trim() || !form.quote.trim()) return
    setSaving(true)
    await api.post('/cms/testimonials', { ...form, rating: form.rating ? Number(form.rating) : null })
    setSaving(false)
    setOpen(false)
    setForm({ client: '', role: '', company: '', quote: '', rating: '', workSlug: '' })
    onCreated()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border border-dashed border-border rounded-xl py-4 text-sm text-muted hover:text-ink hover:border-ink/30 transition-[color,border-color] duration-150 text-center"
      >
        + Add testimonial
      </button>
    )
  }

  return (
    <div className="border border-border rounded-xl bg-surface p-5 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Input label="Client" value={form.client} onChange={(e) => setForm((p) => ({ ...p, client: e.target.value }))} required />
        <Input label="Role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} placeholder="Founder" />
        <Input label="Company" value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-ink">Quote</label>
        <textarea value={form.quote} onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))} rows={3} className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none" required />
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <Input label="Work slug (optional)" value={form.workSlug} onChange={(e) => setForm((p) => ({ ...p, workSlug: e.target.value }))} placeholder="carve-boards" />
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Rating</label>
          <RatingSelect value={form.rating} onChange={(v) => setForm((p) => ({ ...p, rating: v }))} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={submit} loading={saving}>Add</Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  )
}

export default function AdminTestimonialsPage() {
  const { data: items, isLoading, mutate } = useSWR<CmsTestimonial[]>('/cms/testimonials')

  useEffect(() => {
    document.title = 'Testimonials — Content'
  }, [])

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink tracking-tight">Testimonials</h1>
          <p className="text-sm text-muted mt-0.5">{items ? `${items.length} total` : '—'}</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {items && items.length > 0 && (
              <div className="border border-border rounded-xl overflow-hidden">
                {items.map((item) => (
                  <TestimonialRow key={item.id} item={item} onRefresh={() => { mutate(); globalMutate('/cms/testimonials') }} />
                ))}
              </div>
            )}
            <NewTestimonialForm onCreated={() => { mutate(); globalMutate('/cms/testimonials') }} />
          </div>
        )}
      </div>
    </div>
  )
}
