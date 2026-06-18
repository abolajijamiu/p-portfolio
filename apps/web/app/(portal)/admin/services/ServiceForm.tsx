'use client'

import { useState } from 'react'

export type ServiceFormData = {
  title: string
  slug: string
  tagline: string
  description: string
  category: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  sortOrder: number
}

const CATEGORIES = [
  { value: 'development', label: 'Development' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'branding', label: 'Branding' },
  { value: 'ai_analytics', label: 'AI & Analytics' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'publishing', label: 'Publishing' },
  { value: 'technical', label: 'Technical' },
  { value: 'premium', label: 'Premium' },
]

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function ServiceForm({
  defaults,
  saving,
  onSubmit,
}: {
  defaults?: Partial<ServiceFormData>
  saving: boolean
  onSubmit: (data: ServiceFormData) => void
}) {
  const [form, setForm] = useState<ServiceFormData>({
    title: '',
    slug: '',
    tagline: '',
    description: '',
    category: 'development',
    status: 'draft',
    featured: false,
    sortOrder: 0,
    ...defaults,
  })

  function field<K extends keyof ServiceFormData>(key: K, value: ServiceFormData[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value }
      if (key === 'title' && !defaults?.slug) next.slug = slugify(value as string)
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Title <span className="text-rose-500">*</span></label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => field('title', e.target.value)}
          className="w-full text-sm border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
          placeholder="e.g. Shopify Store Development"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Slug <span className="text-rose-500">*</span></label>
        <input
          type="text"
          required
          value={form.slug}
          onChange={(e) => field('slug', slugify(e.target.value))}
          className="w-full text-sm font-mono border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
          placeholder="shopify-store-development"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Tagline <span className="text-rose-500">*</span></label>
        <input
          type="text"
          required
          value={form.tagline}
          onChange={(e) => field('tagline', e.target.value)}
          className="w-full text-sm border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
          placeholder="One compelling sentence about this service"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Description <span className="text-rose-500">*</span></label>
        <textarea
          required
          value={form.description}
          onChange={(e) => field('description', e.target.value)}
          rows={4}
          className="w-full text-sm border border-border rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
          placeholder="Full description shown on the service detail page..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Category <span className="text-rose-500">*</span></label>
          <select
            value={form.category}
            onChange={(e) => field('category', e.target.value)}
            className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
          >
            {CATEGORIES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Status</label>
          <select
            value={form.status}
            onChange={(e) => field('status', e.target.value as ServiceFormData['status'])}
            className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Sort order</label>
          <input
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => field('sortOrder', Number(e.target.value))}
            className="w-full text-sm border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
          />
        </div>

        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => field('featured', e.target.checked)}
              className="w-4 h-4 rounded border-border accent-brand"
            />
            <span className="text-sm text-ink">Featured (shown on homepage)</span>
          </label>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-brand-deep transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving...' : defaults ? 'Save changes' : 'Create service'}
        </button>
      </div>
    </form>
  )
}
