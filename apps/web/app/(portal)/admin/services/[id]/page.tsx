'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { ServiceForm, type ServiceFormData } from '../ServiceForm'

type ServiceDetail = {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  category: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  sortOrder: number
  packages: {
    id: string
    name: string
    description: string
    priceCents: number
    deliveryDays: number
    revisions: number
    includes: string[]
    sortOrder: number
  }[]
  faqs: { id: string; question: string; answer: string; sortOrder: number }[]
  requirements: {
    id: string
    label: string
    description?: string
    fieldType: string
    required: boolean
    sortOrder: number
  }[]
}

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: service, isLoading } = useSWR<ServiceDetail>(`/cms/services/${id}`)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: ServiceFormData) {
    setSaving(true)
    setError(null)
    try {
      await api.patch(`/cms/services/${id}`, data)
      router.push('/admin/services')
    } catch {
      setError('Failed to update service.')
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-40 bg-surface rounded" />
            <div className="h-8 w-60 bg-surface rounded" />
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-surface rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted mb-2">Service not found.</p>
          <Link href="/admin/services" className="text-sm text-brand hover:underline">← Back</Link>
        </div>
      </div>
    )
  }

  const defaults: ServiceFormData = {
    title: service.title,
    slug: service.slug,
    tagline: service.tagline,
    description: service.description,
    category: service.category,
    status: service.status,
    featured: service.featured,
    sortOrder: service.sortOrder,
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl">
        <div className="mb-6">
          <p className="text-xs text-muted mb-1">
            <Link href="/admin/services" className="hover:text-brand transition-colors">Services</Link>
            {' / '}Edit
          </p>
          <h1 className="text-xl font-semibold text-ink tracking-tight">{service.title}</h1>
        </div>
        {error && <p className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{error}</p>}
        <ServiceForm defaults={defaults} saving={saving} onSubmit={handleSubmit} />

        {/* Packages section */}
        <PackagesSection serviceId={id} packages={service.packages} />
      </div>
    </div>
  )
}

function PackagesSection({
  serviceId,
  packages,
}: {
  serviceId: string
  packages: ServiceDetail['packages']
}) {
  const { mutate } = useSWR<ServiceDetail>(`/cms/services/${serviceId}`)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', priceCents: 0, deliveryDays: 7, revisions: 2,
    includes: '', sortOrder: packages.length,
  })

  async function addPackage() {
    await api.post(`/cms/services/${serviceId}/packages`, {
      ...form,
      priceCents: Math.round(form.priceCents * 100),
      includes: form.includes.split('\n').map((s) => s.trim()).filter(Boolean),
    })
    setAdding(false)
    setForm({ name: '', description: '', priceCents: 0, deliveryDays: 7, revisions: 2, includes: '', sortOrder: packages.length + 1 })
    mutate()
  }

  async function removePackage(pkgId: string) {
    if (!confirm('Delete this package?')) return
    await api.delete(`/cms/services/${serviceId}/packages/${pkgId}`)
    mutate()
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-ink">Packages</h2>
        <button
          onClick={() => setAdding(!adding)}
          className="text-sm font-medium text-brand hover:underline"
        >
          {adding ? 'Cancel' : '+ Add package'}
        </button>
      </div>

      {adding && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Input label="Price ($)" type="number" value={String(form.priceCents)} onChange={(v) => setForm({ ...form, priceCents: Number(v) })} />
          </div>
          <Textarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Delivery (days)" type="number" value={String(form.deliveryDays)} onChange={(v) => setForm({ ...form, deliveryDays: Number(v) })} />
            <Input label="Revisions" type="number" value={String(form.revisions)} onChange={(v) => setForm({ ...form, revisions: Number(v) })} />
            <Input label="Sort order" type="number" value={String(form.sortOrder)} onChange={(v) => setForm({ ...form, sortOrder: Number(v) })} />
          </div>
          <Textarea label="Includes (one per line)" value={form.includes} onChange={(v) => setForm({ ...form, includes: v })} rows={4} />
          <button
            onClick={addPackage}
            className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-deep transition-colors"
          >
            Add package
          </button>
        </div>
      )}

      {packages.length === 0 ? (
        <p className="text-sm text-muted py-4 text-center border border-border rounded-xl bg-white">No packages yet.</p>
      ) : (
        <div className="space-y-2">
          {[...packages].sort((a, b) => a.sortOrder - b.sortOrder).map((pkg) => (
            <div key={pkg.id} className="flex items-start justify-between gap-4 bg-white border border-border rounded-xl px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{pkg.name}</p>
                <p className="text-xs text-muted">${(pkg.priceCents / 100).toLocaleString()} · {pkg.deliveryDays}d · {pkg.revisions} rev</p>
              </div>
              <button
                onClick={() => removePackage(pkg.id)}
                className="text-xs text-rose-500 hover:text-rose-700 transition-colors shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Input({
  label, value, onChange, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
      />
    </div>
  )
}

function Textarea({
  label, value, onChange, rows = 3,
}: {
  label: string; value: string; onChange: (v: string) => void; rows?: number
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
      />
    </div>
  )
}
