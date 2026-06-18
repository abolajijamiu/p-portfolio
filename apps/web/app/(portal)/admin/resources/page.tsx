'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { api } from '@/lib/api'

type Resource = {
  id: string
  slug: string
  title: string
  category: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  sortOrder: number
}

const CATEGORY_LABEL: Record<string, string> = {
  template: 'Template', plugin: 'Plugin', guide: 'Guide', tool: 'Tool',
  starter_kit: 'Starter Kit', design_asset: 'Design Asset', course: 'Course', font: 'Font',
}

const STATUS_STYLE: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  draft: 'bg-amber-50 text-amber-700 border-amber-100',
  archived: 'bg-surface text-muted border-border',
}

export default function AdminResourcesPage() {
  const { data: resources, isLoading, mutate } = useSWR<Resource[]>('/cms/resources')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function togglePublish(r: Resource) {
    const newStatus = r.status === 'published' ? 'draft' : 'published'
    await api.patch(`/cms/resources/${r.id}`, { status: newStatus })
    mutate()
  }

  async function remove(id: string) {
    if (!confirm('Delete this resource? This cannot be undone.')) return
    setDeleting(id)
    try {
      await api.delete(`/cms/resources/${id}`)
      mutate()
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Resources</h1>
            <p className="text-sm text-muted mt-0.5">Manage the resources catalogue</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/resource-purchases"
              className="inline-flex items-center gap-1.5 border border-border text-muted text-sm font-medium px-4 py-2 rounded-lg hover:text-ink hover:border-ink/30 transition-colors"
            >
              Purchases
            </Link>
            <Link
              href="/admin/resources/new"
              className="inline-flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-deep transition-colors"
            >
              + New resource
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white border border-border rounded-xl animate-pulse" />)}
          </div>
        ) : !resources?.length ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted mb-4">No resources yet.</p>
            <Link href="/admin/resources/new" className="text-sm font-semibold text-brand hover:underline">
              Create your first resource →
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3">Resource</th>
                  <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {resources.map((r) => (
                  <tr key={r.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {r.featured && (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">★</span>
                        )}
                        <div>
                          <p className="font-medium text-ink leading-tight">{r.title}</p>
                          <p className="text-[11px] text-muted font-mono mt-0.5">{r.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-muted">{CATEGORY_LABEL[r.category] ?? r.category}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => togglePublish(r)}
                          className="text-xs text-muted hover:text-ink transition-colors"
                        >
                          {r.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <Link href={`/admin/resources/${r.id}`} className="text-xs text-brand hover:underline">
                          Edit
                        </Link>
                        <button
                          onClick={() => remove(r.id)}
                          disabled={deleting === r.id}
                          className="text-xs text-rose-500 hover:text-rose-700 transition-colors disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
