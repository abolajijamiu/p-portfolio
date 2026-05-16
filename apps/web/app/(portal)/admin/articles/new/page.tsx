'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ARTICLE_CATEGORY_LABELS, type CmsArticle, type ArticleCategory } from '@/types'

const CATEGORIES = Object.keys(ARTICLE_CATEGORY_LABELS) as ArticleCategory[]

export default function NewArticlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: 'audit' as ArticleCategory,
    client: '',
    excerpt: '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'title' && !prev.slug
        ? { slug: value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') }
        : {}),
    }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)
    setError(null)
    try {
      const article = await api.post<CmsArticle>('/cms/articles', {
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        category: form.category,
        client: form.client.trim() || undefined,
        excerpt: form.excerpt.trim() || undefined,
      })
      router.push(`/admin/articles/${article.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create article')
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink tracking-tight">New article</h1>
          <p className="text-sm text-muted mt-0.5">Set the basics — write the body in the editor.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-xl bg-white p-5">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Shopify checkout audit: how a 4-step flow killed conversion"
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="shopify-checkout-audit-4-step-flow"
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink">Category</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full h-9 px-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{ARTICLE_CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>

          <Input
            label="Client (optional)"
            value={form.client}
            onChange={(e) => set('client', e.target.value)}
            placeholder="Carve Boards"
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
              rows={2}
              placeholder="A short summary that appears in listings and meta descriptions."
              className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-white text-ink placeholder:text-muted/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" loading={loading}>Create article</Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
