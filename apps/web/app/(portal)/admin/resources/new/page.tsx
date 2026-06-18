'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { ResourceForm, type ResourceFormData } from '../ResourceForm'

export default function NewResourcePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: ResourceFormData) {
    setSaving(true)
    setError(null)
    try {
      const r = await api.post<{ id: string }>('/cms/resources', data)
      router.push(`/admin/resources/${r.id}`)
    } catch {
      setError('Failed to create resource.')
      setSaving(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl">
        <div className="mb-6">
          <p className="text-xs text-muted mb-1">
            <Link href="/admin/resources" className="hover:text-brand transition-colors">Resources</Link>
            {' / '}New
          </p>
          <h1 className="text-xl font-semibold text-ink tracking-tight">New resource</h1>
        </div>
        {error && <p className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{error}</p>}
        <ResourceForm saving={saving} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
