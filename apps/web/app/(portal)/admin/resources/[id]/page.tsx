'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { ResourceForm, type ResourceFormData } from '../ResourceForm'

type ResourceDetail = {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  category: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  coverImageUrl?: string | null
  tags: string[]
  sortOrder: number
  licenses: {
    id: string
    name: string
    description?: string | null
    priceCents: number
    permissions: Record<string, boolean>
    maxDownloads?: number | null
    sortOrder: number
  }[]
  files: {
    id: string
    name: string
    key: string
    size: number
    mimeType?: string | null
    sortOrder: number
  }[]
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function EditResourcePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: resource, isLoading, mutate } = useSWR<ResourceDetail>(`/cms/resources/${id}`)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: ResourceFormData) {
    setSaving(true)
    setError(null)
    try {
      await api.patch(`/cms/resources/${id}`, {
        ...data,
        tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
        coverImageUrl: data.coverImageUrl || undefined,
      })
      router.push('/admin/resources')
    } catch {
      setError('Failed to update resource.')
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl animate-pulse space-y-4">
          <div className="h-5 w-40 bg-surface rounded" />
          <div className="h-8 w-60 bg-surface rounded" />
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-surface rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted mb-2">Resource not found.</p>
          <Link href="/admin/resources" className="text-sm text-brand hover:underline">← Back</Link>
        </div>
      </div>
    )
  }

  const defaults: ResourceFormData = {
    title: resource.title,
    slug: resource.slug,
    tagline: resource.tagline,
    description: resource.description,
    category: resource.category,
    status: resource.status,
    featured: resource.featured,
    coverImageUrl: resource.coverImageUrl ?? '',
    tags: resource.tags.join(', '),
    sortOrder: resource.sortOrder,
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl">
        <div className="mb-6">
          <p className="text-xs text-muted mb-1">
            <Link href="/admin/resources" className="hover:text-brand transition-colors">Resources</Link>
            {' / '}Edit
          </p>
          <h1 className="text-xl font-semibold text-ink tracking-tight">{resource.title}</h1>
        </div>
        {error && <p className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{error}</p>}
        <ResourceForm defaults={defaults} saving={saving} onSubmit={handleSubmit} />

        <LicensesSection resourceId={id} licenses={resource.licenses} onRefresh={mutate} />
        <FilesSection resourceId={id} files={resource.files} onRefresh={mutate} />
      </div>
    </div>
  )
}

// ─── Licences ─────────────────────────────────────────────────────────────────

function LicensesSection({
  resourceId, licenses, onRefresh,
}: {
  resourceId: string
  licenses: ResourceDetail['licenses']
  onRefresh: () => void
}) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', priceCents: 0, sortOrder: licenses.length })

  async function add() {
    await api.post(`/cms/resources/${resourceId}/licenses`, {
      ...form,
      priceCents: Math.round(form.priceCents * 100),
      permissions: {},
    })
    setAdding(false)
    setForm({ name: '', description: '', priceCents: 0, sortOrder: licenses.length + 1 })
    onRefresh()
  }

  async function remove(licenseId: string) {
    if (!confirm('Delete this licence?')) return
    await api.delete(`/cms/resources/${resourceId}/licenses/${licenseId}`)
    onRefresh()
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-ink">Licences</h2>
        <button onClick={() => setAdding(!adding)} className="text-sm font-medium text-brand hover:underline">
          {adding ? 'Cancel' : '+ Add licence'}
        </button>
      </div>

      {adding && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Personal" className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Price ($)</label>
              <input type="number" value={form.priceCents} onChange={(e) => setForm({ ...form, priceCents: Number(e.target.value) })} className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Who this licence is for..." className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
          <button onClick={add} className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-deep transition-colors">
            Add licence
          </button>
        </div>
      )}

      {licenses.length === 0 ? (
        <p className="text-sm text-muted py-4 text-center border border-border rounded-xl bg-white">No licences yet. Add at least one so clients can purchase.</p>
      ) : (
        <div className="space-y-2">
          {[...licenses].sort((a, b) => a.sortOrder - b.sortOrder).map((lic) => (
            <div key={lic.id} className="flex items-center justify-between gap-4 bg-white border border-border rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-ink">{lic.name}</p>
                <p className="text-xs text-muted">${(lic.priceCents / 100).toLocaleString()}{lic.description ? ` · ${lic.description}` : ''}</p>
              </div>
              <button onClick={() => remove(lic.id)} className="text-xs text-rose-500 hover:text-rose-700 transition-colors shrink-0">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Files ────────────────────────────────────────────────────────────────────

function FilesSection({
  resourceId, files, onRefresh,
}: {
  resourceId: string
  files: ResourceDetail['files']
  onRefresh: () => void
}) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', key: '', size: 0, mimeType: '' })

  async function add() {
    await api.post(`/cms/resources/${resourceId}/files`, {
      name: form.name,
      key: form.key,
      size: form.size,
      mimeType: form.mimeType || undefined,
      sortOrder: files.length,
    })
    setAdding(false)
    setForm({ name: '', key: '', size: 0, mimeType: '' })
    onRefresh()
  }

  async function remove(fileId: string) {
    if (!confirm('Remove this file entry?')) return
    await api.delete(`/cms/resources/${resourceId}/files/${fileId}`)
    onRefresh()
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-ink">Files</h2>
        <button onClick={() => setAdding(!adding)} className="text-sm font-medium text-brand hover:underline">
          {adding ? 'Cancel' : '+ Add file'}
        </button>
      </div>

      {adding && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Display name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="starter-kit.zip" className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Storage key</label>
              <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="starters/kit-v1.zip" className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30 font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Size (bytes)</label>
              <input type="number" value={form.size} onChange={(e) => setForm({ ...form, size: Number(e.target.value) })} className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">MIME type</label>
              <input value={form.mimeType} onChange={(e) => setForm({ ...form, mimeType: e.target.value })} placeholder="application/zip" className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
          </div>
          <button onClick={add} disabled={!form.name || !form.key} className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-deep transition-colors disabled:opacity-50">
            Add file
          </button>
        </div>
      )}

      {files.length === 0 ? (
        <p className="text-sm text-muted py-4 text-center border border-border rounded-xl bg-white">No files added yet.</p>
      ) : (
        <div className="space-y-2">
          {[...files].sort((a, b) => a.sortOrder - b.sortOrder).map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-4 bg-white border border-border rounded-xl px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{f.name}</p>
                <p className="text-xs text-muted font-mono truncate">{f.key} · {fmtSize(f.size)}</p>
              </div>
              <button onClick={() => remove(f.id)} className="text-xs text-rose-500 hover:text-rose-700 transition-colors shrink-0">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
