'use client'

import { useState } from 'react'

export type ResourceFormData = {
  title: string
  slug: string
  tagline: string
  description: string
  category: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  coverImageUrl: string
  tags: string
  sortOrder: number
}

const CATEGORIES = [
  { value: 'template', label: 'Template' },
  { value: 'plugin', label: 'Plugin' },
  { value: 'guide', label: 'Guide' },
  { value: 'tool', label: 'Tool' },
  { value: 'starter_kit', label: 'Starter Kit' },
  { value: 'design_asset', label: 'Design Asset' },
  { value: 'course', label: 'Course' },
  { value: 'font', label: 'Font' },
]

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function ResourceForm({
  defaults,
  saving,
  onSubmit,
}: {
  defaults?: Partial<ResourceFormData>
  saving: boolean
  onSubmit: (data: ResourceFormData) => void
}) {
  const [form, setForm] = useState<ResourceFormData>({
    title: '',
    slug: '',
    tagline: '',
    description: '',
    category: 'template',
    status: 'draft',
    featured: false,
    coverImageUrl: '',
    tags: '',
    sortOrder: 0,
    ...defaults,
  })

  function field<K extends keyof ResourceFormData>(key: K, value: ResourceFormData[K]) {
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
      <Field label="Title" required>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => field('title', e.target.value)}
          className={INPUT}
          placeholder="e.g. Next.js E-commerce Starter Kit"
        />
      </Field>

      <Field label="Slug" required>
        <input
          type="text"
          required
          value={form.slug}
          onChange={(e) => field('slug', slugify(e.target.value))}
          className={`${INPUT} font-mono`}
          placeholder="nextjs-ecommerce-starter-kit"
        />
      </Field>

      <Field label="Tagline" required>
        <input
          type="text"
          required
          value={form.tagline}
          onChange={(e) => field('tagline', e.target.value)}
          className={INPUT}
          placeholder="One compelling sentence"
        />
      </Field>

      <Field label="Description" required>
        <textarea
          required
          value={form.description}
          onChange={(e) => field('description', e.target.value)}
          rows={4}
          className={`${INPUT} resize-none`}
          placeholder="Full description shown on the resource detail page..."
        />
      </Field>

      <Field label="Cover image URL">
        <input
          type="url"
          value={form.coverImageUrl}
          onChange={(e) => field('coverImageUrl', e.target.value)}
          className={INPUT}
          placeholder="https://..."
        />
      </Field>

      <Field label="Tags (comma-separated)">
        <input
          type="text"
          value={form.tags}
          onChange={(e) => field('tags', e.target.value)}
          className={INPUT}
          placeholder="Next.js, TypeScript, Tailwind"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Category" required>
          <select
            value={form.category}
            onChange={(e) => field('category', e.target.value)}
            className={`${INPUT} bg-white`}
          >
            {CATEGORIES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>

        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => field('status', e.target.value as ResourceFormData['status'])}
            className={`${INPUT} bg-white`}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Sort order">
          <input
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => field('sortOrder', Number(e.target.value))}
            className={INPUT}
          />
        </Field>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => field('featured', e.target.checked)}
              className="w-4 h-4 rounded border-border accent-brand"
            />
            <span className="text-sm text-ink">Featured on homepage</span>
          </label>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-brand-deep transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving...' : defaults ? 'Save changes' : 'Create resource'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1.5">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

const INPUT = 'w-full text-sm border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40'
