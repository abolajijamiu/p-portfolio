'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { api } from '@/lib/api'

type Service = {
  id: string
  slug: string
  title: string
  tagline: string
  category: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  sortOrder: number
}

const CATEGORY_LABEL: Record<string, string> = {
  development: 'Dev', marketing: 'Marketing', branding: 'Branding',
  ai_analytics: 'AI & Analytics', ecommerce: 'E-comm', consulting: 'Consulting',
  publishing: 'Publishing', technical: 'Technical', premium: 'Premium',
}

const STATUS_STYLE: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  draft: 'bg-amber-50 text-amber-700 border-amber-100',
  archived: 'bg-surface text-muted border-border',
}

export default function AdminServicesPage() {
  const { data: services, isLoading, mutate } = useSWR<Service[]>('/cms/services')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function togglePublish(svc: Service) {
    const newStatus = svc.status === 'published' ? 'draft' : 'published'
    await api.patch(`/cms/services/${svc.id}`, { status: newStatus })
    mutate()
  }

  async function remove(id: string) {
    if (!confirm('Delete this service? This cannot be undone.')) return
    setDeleting(id)
    try {
      await api.delete(`/cms/services/${id}`)
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
            <h1 className="text-xl font-semibold text-ink tracking-tight">Services</h1>
            <p className="text-sm text-muted mt-0.5">Manage the services catalogue</p>
          </div>
          <Link
            href="/admin/services/new"
            className="inline-flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-deep transition-colors"
          >
            + New service
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !services?.length ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted mb-4">No services yet.</p>
            <Link href="/admin/services/new" className="text-sm font-semibold text-brand hover:underline">
              Create your first service →
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3">Service</th>
                  <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {services.map((svc) => (
                  <tr key={svc.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {svc.featured && (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">★</span>
                        )}
                        <div>
                          <p className="font-medium text-ink leading-tight">{svc.title}</p>
                          <p className="text-[11px] text-muted font-mono mt-0.5">{svc.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-muted">{CATEGORY_LABEL[svc.category] ?? svc.category}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[svc.status]}`}>
                        {svc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => togglePublish(svc)}
                          className="text-xs text-muted hover:text-ink transition-colors"
                        >
                          {svc.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <Link href={`/admin/services/${svc.id}`} className="text-xs text-brand hover:underline">
                          Edit
                        </Link>
                        <button
                          onClick={() => remove(svc.id)}
                          disabled={deleting === svc.id}
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
