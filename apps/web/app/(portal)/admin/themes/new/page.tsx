'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { CmsTheme } from '@/types'

const CATEGORIES = ['fashion', 'electronics', 'luxury', 'food', 'dtc']

export default function NewThemePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    category: 'fashion',
    priceCents: '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'name' && !prev.slug
        ? { slug: value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') }
        : {}),
    }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const theme = await api.post<CmsTheme>('/cms/themes', {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        tagline: form.tagline.trim() || undefined,
        category: form.category,
        priceCents: form.priceCents ? Math.round(parseFloat(form.priceCents) * 100) : null,
      })
      router.push(`/admin/themes/${theme.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create theme')
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink tracking-tight">New theme</h1>
          <p className="text-sm text-muted mt-0.5">Fill in the basics — you can edit everything else in the editor.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-xl bg-white p-5">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Cascade"
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="cascade"
          />
          <Input
            label="Tagline"
            value={form.tagline}
            onChange={(e) => set('tagline', e.target.value)}
            placeholder="Minimal. Editorial. Built to sell."
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink">Category</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full h-9 px-3 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <Input
            label="Price (USD) — leave blank for custom"
            type="number"
            value={form.priceCents}
            onChange={(e) => set('priceCents', e.target.value)}
            placeholder="280"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" loading={loading}>Create theme</Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
