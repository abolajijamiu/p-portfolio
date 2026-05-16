'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { CmsWorkItem } from '@/types'

const CATEGORIES = ['shopify', 'seo', 'funnels', 'systems', 'strategy']

export default function NewWorkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    client: '',
    slug: '',
    headline: '',
    category: 'shopify',
    industry: '',
    year: new Date().getFullYear().toString(),
  })

  function set(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'client' && !prev.slug
        ? { slug: value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') }
        : {}),
    }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.client.trim() || !form.headline.trim()) return
    setLoading(true)
    setError(null)
    try {
      const item = await api.post<CmsWorkItem>('/cms/work', {
        client: form.client.trim(),
        slug: form.slug.trim() || undefined,
        headline: form.headline.trim(),
        category: form.category,
        industry: form.industry.trim() || undefined,
        year: parseInt(form.year) || new Date().getFullYear(),
      })
      router.push(`/admin/work/${item.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create case study')
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink tracking-tight">New case study</h1>
          <p className="text-sm text-muted mt-0.5">Fill in the basics — add proof metrics, actions, and comparisons in the editor.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-xl bg-white p-5">
          <Input
            label="Client name"
            value={form.client}
            onChange={(e) => set('client', e.target.value)}
            placeholder="Carve Boards"
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="carve-boards"
          />
          <Input
            label="Headline"
            value={form.headline}
            onChange={(e) => set('headline', e.target.value)}
            placeholder="Rebuilt the checkout flow for an outdoor brand and tripled conversion"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink">Category</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full h-9 px-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Year" type="number" value={form.year} onChange={(e) => set('year', e.target.value)} />
          </div>
          <Input label="Industry" value={form.industry} onChange={(e) => set('industry', e.target.value)} placeholder="Outdoor / sporting goods" />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">{error}</p>
          )}
          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" loading={loading}>Create case study</Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
