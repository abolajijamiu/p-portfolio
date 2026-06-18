'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { ServiceForm, type ServiceFormData } from '../ServiceForm'

export default function NewServicePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: ServiceFormData) {
    setSaving(true)
    setError(null)
    try {
      const svc = await api.post<{ id: string }>('/cms/services', data)
      router.push(`/admin/services/${svc.id}`)
    } catch {
      setError('Failed to create service.')
      setSaving(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl">
        <div className="mb-6">
          <p className="text-xs text-muted mb-1">
            <a href="/admin/services" className="hover:text-brand transition-colors">Services</a>
            {' / '}New
          </p>
          <h1 className="text-xl font-semibold text-ink tracking-tight">New service</h1>
        </div>
        {error && <p className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{error}</p>}
        <ServiceForm saving={saving} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
