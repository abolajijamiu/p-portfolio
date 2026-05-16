'use client'

import { useState, useEffect, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ARTICLE_CATEGORY_LABELS, type CmsArticle, type ArticleCategory, type CmsProofMetric, type CmsWorkComparison } from '@/types'

type Params = { id: string }

const CATEGORIES = Object.keys(ARTICLE_CATEGORY_LABELS) as ArticleCategory[]

const TEMPLATES: Record<ArticleCategory, string> = {
  audit: `## Summary\n\nBrief overview of what we audited and the headline finding.\n\n## What we found\n\nDetailed findings from the audit. Be specific — name the exact friction points, revenue leaks, or UX failures.\n\n## What we changed\n\nDescribe each change made. Link changes to findings above.\n\n## Results\n\nDocument outcomes. Use exact figures where possible.\n\n## Key takeaways\n\nThree or four principles a reader can apply to their own store.`,
  ux: `## The store\n\nContext: what the store sells, who it targets, what the goal of the teardown is.\n\n## UX issues identified\n\nList and explain each issue. Be specific about the pattern and why it causes friction.\n\n## The fixes\n\nFor each issue: what we changed and why.\n\n## Impact\n\nMeasured or estimated outcomes.`,
  seo: `## Audit scope\n\nWhat we looked at: technical SEO, on-page, content gaps, backlink profile.\n\n## Critical issues\n\nHigh-priority findings that directly limit organic visibility.\n\n## Quick wins\n\nLow-effort changes with meaningful impact.\n\n## Long-term recommendations\n\nStructural or content investments worth making.\n\n## Expected outcomes\n\nPrioritised by impact.`,
  funnel: `## The funnel\n\nDescribe the full acquisition → conversion → retention path.\n\n## Where it breaks\n\nIdentify each drop-off point and the evidence for it.\n\n## Fixes applied\n\nFor each break: the intervention and the reasoning.\n\n## Funnel metrics before / after\n\nDocument the delta at each stage.`,
  commerce: `## Context\n\nWhat kind of store, what market, what constraint we were solving for.\n\n## The problem\n\nSpecific, measurable description of the commercial problem.\n\n## Our approach\n\nHow we framed the solution and why.\n\n## Implementation\n\nWhat we built or changed.\n\n## Outcomes\n\nMeasured results, timelines, attribution methodology.`,
}

function TagEditor({ label, values, onChange, placeholder }: {
  label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string
}) {
  const [draft, setDraft] = useState('')
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-ink">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2.5 border border-border rounded-md bg-white min-h-[38px]">
        {values.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-surface border border-border text-xs text-ink px-2 py-0.5 rounded">
            {v}
            <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="text-muted/50 hover:text-red-500 transition-[color] duration-100 ml-0.5">×</button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ',') && draft.trim()) {
              e.preventDefault(); onChange([...values, draft.trim()]); setDraft('')
            }
            if (e.key === 'Backspace' && !draft && values.length) onChange(values.slice(0, -1))
          }}
          placeholder={values.length ? '' : placeholder}
          className="flex-1 min-w-[80px] text-xs outline-none placeholder:text-muted/50 bg-transparent"
        />
      </div>
      <p className="text-[10px] text-muted/50">Press Enter or comma to add</p>
    </div>
  )
}

function ProofEditor({ proof, onChange }: { proof: CmsProofMetric[]; onChange: (v: CmsProofMetric[]) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-ink">Proof metrics</label>
      {proof.length > 0 && (
        <div className="text-[10px] text-muted/60 grid grid-cols-[120px_1fr_120px_auto] gap-2 px-1 mb-1">
          <span>Value</span><span>Label</span><span>Period</span><span />
        </div>
      )}
      {proof.map((p, i) => (
        <div key={i} className="grid grid-cols-[120px_1fr_120px_auto] gap-2 items-center">
          <input value={p.metric} onChange={(e) => { const n = [...proof]; n[i] = { ...p, metric: e.target.value }; onChange(n) }} placeholder="+142%" className="h-9 px-2.5 text-sm border border-border rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ink font-medium" />
          <input value={p.label} onChange={(e) => { const n = [...proof]; n[i] = { ...p, label: e.target.value }; onChange(n) }} placeholder="Conversion rate" className="h-9 px-2.5 text-sm border border-border rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ink" />
          <input value={p.period ?? ''} onChange={(e) => { const n = [...proof]; n[i] = { ...p, period: e.target.value || undefined }; onChange(n) }} placeholder="90-day avg." className="h-9 px-2.5 text-sm border border-border rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ink" />
          <button type="button" onClick={() => onChange(proof.filter((_, j) => j !== i))} className="h-9 w-9 flex items-center justify-center text-muted/40 hover:text-red-500 transition-[color] duration-100">×</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...proof, { metric: '', label: '', period: undefined }])} className="text-xs text-muted hover:text-ink transition-[color] duration-150">
        + Add metric
      </button>
    </div>
  )
}

function ComparisonsEditor({ comparisons, onChange }: { comparisons: CmsWorkComparison[]; onChange: (v: CmsWorkComparison[]) => void }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-ink">Before / After comparisons</label>
      {comparisons.map((c, i) => (
        <div key={i} className="border border-border rounded-lg p-4 space-y-3 bg-white">
          <div className="flex items-center gap-3">
            <input value={c.label} onChange={(e) => { const n = [...comparisons]; n[i] = { ...c, label: e.target.value }; onChange(n) }} placeholder="Checkout flow" className="flex-1 h-8 px-2.5 text-sm border border-border rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ink" />
            <button type="button" onClick={() => onChange(comparisons.filter((_, j) => j !== i))} className="text-xs text-muted/50 hover:text-red-500 transition-[color] shrink-0">Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider mb-1">Before</p>
              <textarea value={c.before} onChange={(e) => { const n = [...comparisons]; n[i] = { ...c, before: e.target.value }; onChange(n) }} rows={3} className="w-full px-2.5 py-2 text-sm border border-border rounded-md bg-white focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none" placeholder="Dawn theme with 6-step checkout…" />
            </div>
            <div>
              <p className="text-[10px] text-green-600 font-medium uppercase tracking-wider mb-1">After</p>
              <textarea value={c.after} onChange={(e) => { const n = [...comparisons]; n[i] = { ...c, after: e.target.value }; onChange(n) }} rows={3} className="w-full px-2.5 py-2 text-sm border border-border rounded-md bg-white focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none" placeholder="Single-page checkout with address autocomplete…" />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...comparisons, { label: '', before: '', after: '' }])} className="text-xs text-muted hover:text-ink transition-[color] duration-150 border border-dashed border-border rounded-lg px-4 py-3 w-full text-center">
        + Add comparison
      </button>
    </div>
  )
}

function MarkdownBody({ value, onChange, category }: { value: string; onChange: (v: string) => void; category: ArticleCategory }) {
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [preview, setPreview] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function generatePreview(md: string) {
    const { marked } = await import('marked')
    marked.setOptions({ async: false })
    const html = marked.parse(md) as string
    setPreview(html)
  }

  useEffect(() => {
    if (tab === 'preview') generatePreview(value)
  }, [tab, value])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.currentTarget
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = value.substring(0, start) + '  ' + value.substring(end)
      onChange(next)
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2
      })
    }
  }

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
  const estimatedMinutes = Math.max(1, Math.round(wordCount / 200))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-ink">Body</label>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted/50">
            {wordCount > 0 ? `~${estimatedMinutes} min · ${wordCount} words` : ''}
          </span>
          <div className="flex border border-border rounded-md overflow-hidden">
            {(['write', 'preview'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={[
                  'px-3 py-1 text-xs transition-[background-color,color] duration-150',
                  tab === t ? 'bg-ink text-white' : 'text-muted hover:text-ink hover:bg-surface',
                ].join(' ')}
              >
                {t === 'write' ? 'Write' : 'Preview'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === 'write' ? (
        <div className="relative">
          {!value && (
            <div className="absolute top-2 right-2 z-10">
              <button
                type="button"
                onClick={() => onChange(TEMPLATES[category])}
                className="text-[10px] text-muted/60 hover:text-ink bg-surface border border-border px-2 py-1 rounded transition-[color] duration-150"
              >
                Use template
              </button>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={28}
            spellCheck
            placeholder="Start writing, or click 'Use template' above…"
            className="w-full px-4 py-3.5 text-sm font-mono leading-relaxed border border-border rounded-md bg-white text-ink placeholder:text-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-y"
          />
        </div>
      ) : (
        <div
          className="min-h-[400px] px-4 py-3.5 border border-border rounded-md bg-white article-preview overflow-auto"
          dangerouslySetInnerHTML={{ __html: preview || '<p class="text-muted text-sm">Nothing to preview.</p>' }}
        />
      )}
    </div>
  )
}

export default function ArticleEditorPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: article, mutate } = useSWR<CmsArticle>(id ? `/cms/articles/${id}` : null)

  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

  const [form, setForm] = useState({
    title: '', slug: '', subtitle: '', category: 'audit' as ArticleCategory,
    client: '', workSlug: '', featured: false,
    tags: [] as string[], excerpt: '', body: '',
    proof: [] as CmsProofMetric[], comparisons: [] as CmsWorkComparison[],
    readingMinutes: '',
    seoTitle: '', seoDescription: '',
  })

  useEffect(() => {
    if (!article) return
    setForm({
      title: article.title ?? '', slug: article.slug ?? '',
      subtitle: article.subtitle ?? '', category: article.category,
      client: article.client ?? '', workSlug: article.workSlug ?? '',
      featured: article.featured ?? false,
      tags: article.tags ?? [], excerpt: article.excerpt ?? '', body: article.body ?? '',
      proof: article.proof ?? [], comparisons: article.comparisons ?? [],
      readingMinutes: article.readingMinutes ? String(article.readingMinutes) : '',
      seoTitle: article.seoTitle ?? '', seoDescription: article.seoDescription ?? '',
    })
    setDirty(false)
  }, [article])

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'body' && !prev.readingMinutes) {
        const words = (value as string).trim().split(/\s+/).filter(Boolean).length
        if (words > 0) next.readingMinutes = String(Math.max(1, Math.round(words / 200)))
      }
      return next
    })
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await api.patch<CmsArticle>(`/cms/articles/${id}`, {
        title: form.title.trim(), slug: form.slug.trim(),
        subtitle: form.subtitle.trim() || null, category: form.category,
        client: form.client.trim() || null, workSlug: form.workSlug.trim() || null,
        featured: form.featured, tags: form.tags,
        excerpt: form.excerpt.trim() || null, body: form.body || null,
        proof: form.proof, comparisons: form.comparisons,
        readingMinutes: form.readingMinutes ? parseInt(form.readingMinutes) : null,
        seoTitle: form.seoTitle.trim() || null,
        seoDescription: form.seoDescription.trim() || null,
      })
      mutate(updated, false)
      setDirty(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function publish() {
    setPublishing(true)
    try {
      if (dirty) await save()
      const updated = await api.put<CmsArticle>(`/cms/articles/${id}/publish`, {})
      mutate(updated, false)
    } finally {
      setPublishing(false)
    }
  }

  async function archive() {
    if (!confirm('Archive this article?')) return
    await api.put(`/cms/articles/${id}/archive`, {})
    router.push('/admin/articles')
  }

  if (!article) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl space-y-4">
          <Skeleton className="h-7 w-56" />
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-16 md:p-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight line-clamp-1">{article.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-medium text-muted bg-surface border border-border px-1.5 py-0.5 rounded">
                {ARTICLE_CATEGORY_LABELS[article.category]}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                article.status === 'published' ? 'bg-green-50 text-green-700' :
                article.status === 'archived' ? 'bg-surface text-muted' : 'bg-amber-50 text-amber-700'
              }`}>
                {article.status}
              </span>
              {dirty && <span className="text-[10px] text-muted">Unsaved changes</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {article.status !== 'archived' && (
              <Button variant="ghost" size="sm" onClick={archive}>Archive</Button>
            )}
            {article.status !== 'published' && (
              <Button size="sm" onClick={publish} loading={publishing}>Publish</Button>
            )}
            <Button size="sm" variant="secondary" onClick={save} loading={saving} disabled={!dirty}>Save</Button>
          </div>
        </div>

        {saveError && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-md">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Core */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Core</p>
            <Input label="Title" value={form.title} onChange={(e) => update('title', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Slug" value={form.slug} onChange={(e) => update('slug', e.target.value)} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value as ArticleCategory)}
                  className="w-full h-9 px-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{ARTICLE_CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
            </div>
            <Input
              label="Subtitle"
              value={form.subtitle}
              onChange={(e) => update('subtitle', e.target.value)}
              placeholder="A 14-point audit of the checkout experience"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Client (optional)" value={form.client} onChange={(e) => update('client', e.target.value)} placeholder="Carve Boards" />
              <Input label="Work slug (optional)" value={form.workSlug} onChange={(e) => update('workSlug', e.target.value)} placeholder="carve-boards" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} className="rounded border-border" />
                Featured
              </label>
              <div className="flex items-center gap-2">
                <Input
                  label="Reading time (min)"
                  type="number"
                  value={form.readingMinutes}
                  onChange={(e) => update('readingMinutes', e.target.value)}
                  placeholder="auto"
                />
              </div>
            </div>
            <TagEditor label="Tags" values={form.tags} onChange={(v) => update('tags', v)} placeholder="checkout, conversion, CRO…" />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-ink">Excerpt</label>
                <span className={[
                  'text-[10px] tabular-nums',
                  form.excerpt.length > 160 ? 'text-red-500' : form.excerpt.length >= 120 ? 'text-green-600' : 'text-muted/40',
                ].join(' ')}>
                  {form.excerpt.length}/160
                </span>
              </div>
              <textarea
                value={form.excerpt}
                onChange={(e) => update('excerpt', e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-white text-ink placeholder:text-muted/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none"
                placeholder="Appears in article listings and meta descriptions. Aim for 120–160 characters."
              />
            </div>
          </section>

          {/* Body */}
          <section className="border border-border rounded-xl bg-white p-5">
            <MarkdownBody value={form.body} onChange={(v) => update('body', v)} category={form.category} />
          </section>

          {/* Results */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Results</p>
            <ProofEditor proof={form.proof} onChange={(v) => update('proof', v)} />
          </section>

          {/* Comparisons */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Before / After</p>
            <ComparisonsEditor comparisons={form.comparisons} onChange={(v) => update('comparisons', v)} />
          </section>

          {/* SEO */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">SEO</p>
            <Input label="SEO title" value={form.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} placeholder="Shopify Checkout Audit — E-Tech." />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink">SEO description</label>
              <textarea
                value={form.seoDescription}
                onChange={(e) => update('seoDescription', e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-white text-ink placeholder:text-muted/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none"
              />
            </div>
          </section>
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
          <p className="text-[11px] text-muted">{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</p>
          <Button onClick={save} loading={saving} disabled={!dirty}>Save changes</Button>
        </div>
      </div>
    </div>
  )
}
