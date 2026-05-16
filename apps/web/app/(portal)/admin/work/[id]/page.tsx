'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import type { CmsWorkItem, CmsProofMetric, CmsWorkComparison, CmsAuditFinding } from '@/types'

type Params = { id: string }

const CATEGORIES = ['shopify', 'seo', 'funnels', 'systems', 'strategy']
const VIDEO_PLATFORMS = ['youtube', 'loom', 'vimeo']
const SEVERITIES = ['critical', 'high', 'medium'] as const

function TagEditor({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-ink">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2.5 border border-border rounded-md bg-white min-h-[38px]">
        {values.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-surface border border-border text-xs text-ink px-2 py-0.5 rounded">
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="text-muted/50 hover:text-red-500 transition-[color] duration-100 ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ',') && draft.trim()) {
              e.preventDefault()
              onChange([...values, draft.trim()])
              setDraft('')
            }
            if (e.key === 'Backspace' && !draft && values.length) {
              onChange(values.slice(0, -1))
            }
          }}
          placeholder={values.length ? '' : placeholder}
          className="flex-1 min-w-[80px] text-xs outline-none placeholder:text-muted/50 bg-transparent"
        />
      </div>
      <p className="text-[10px] text-muted/50">Press Enter or comma to add</p>
    </div>
  )
}

function OrderedListEditor({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-ink">{label}</label>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-[10px] text-muted/40 tabular-nums shrink-0 mt-2.5 w-4">{i + 1}</span>
            <textarea
              value={v}
              onChange={(e) => {
                const next = [...values]
                next[i] = e.target.value
                onChange(next)
              }}
              rows={2}
              className="flex-1 px-2.5 py-2 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none"
              placeholder={placeholder}
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="text-muted/40 hover:text-red-500 transition-[color] duration-100 mt-2 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...values, ''])}
          className="text-xs text-muted hover:text-ink transition-[color] duration-150"
        >
          + Add item
        </button>
      </div>
    </div>
  )
}

function ProofEditor({
  proof,
  onChange,
}: {
  proof: CmsProofMetric[]
  onChange: (v: CmsProofMetric[]) => void
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-ink">Proof metrics</label>
      {proof.map((p, i) => (
        <div key={i} className="grid grid-cols-[120px_1fr_120px_auto] gap-2 items-start">
          <input
            value={p.metric}
            onChange={(e) => {
              const next = [...proof]; next[i] = { ...p, metric: e.target.value }; onChange(next)
            }}
            placeholder="+142%"
            className="h-9 px-2.5 text-sm border border-border rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
          />
          <input
            value={p.label}
            onChange={(e) => {
              const next = [...proof]; next[i] = { ...p, label: e.target.value }; onChange(next)
            }}
            placeholder="Conversion rate"
            className="h-9 px-2.5 text-sm border border-border rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
          />
          <input
            value={p.period ?? ''}
            onChange={(e) => {
              const next = [...proof]; next[i] = { ...p, period: e.target.value || undefined }; onChange(next)
            }}
            placeholder="90-day avg."
            className="h-9 px-2.5 text-sm border border-border rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
          />
          <button
            type="button"
            onClick={() => onChange(proof.filter((_, j) => j !== i))}
            className="h-9 w-9 flex items-center justify-center text-muted/40 hover:text-red-500 transition-[color] duration-100"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...proof, { metric: '', label: '', period: undefined }])}
        className="text-xs text-muted hover:text-ink transition-[color] duration-150"
      >
        + Add metric
      </button>
    </div>
  )
}

function ComparisonsEditor({
  comparisons,
  onChange,
}: {
  comparisons: CmsWorkComparison[]
  onChange: (v: CmsWorkComparison[]) => void
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-ink">Before / After comparisons</label>
      {comparisons.map((c, i) => (
        <div key={i} className="border border-border rounded-lg p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <input
              value={c.label}
              onChange={(e) => {
                const next = [...comparisons]; next[i] = { ...c, label: e.target.value }; onChange(next)
              }}
              placeholder="Checkout flow"
              className="flex-1 h-8 px-2.5 text-sm border border-border rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ink mr-3"
            />
            <button type="button" onClick={() => onChange(comparisons.filter((_, j) => j !== i))} className="text-xs text-muted/50 hover:text-red-500 transition-[color] shrink-0">
              Remove
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider mb-1">Before</p>
              <textarea value={c.before} onChange={(e) => { const next = [...comparisons]; next[i] = { ...c, before: e.target.value }; onChange(next) }} rows={3} className="w-full px-2.5 py-2 text-sm border border-border rounded-md bg-white focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none" placeholder="Dawn-based theme with…" />
            </div>
            <div>
              <p className="text-[10px] text-green-600 font-medium uppercase tracking-wider mb-1">After</p>
              <textarea value={c.after} onChange={(e) => { const next = [...comparisons]; next[i] = { ...c, after: e.target.value }; onChange(next) }} rows={3} className="w-full px-2.5 py-2 text-sm border border-border rounded-md bg-white focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none" placeholder="Custom Liquid architecture…" />
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

function AuditEditor({
  findings,
  onChange,
}: {
  findings: CmsAuditFinding[]
  onChange: (v: CmsAuditFinding[]) => void
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-ink">Audit findings</label>
      <div className="text-[10px] text-muted/60 grid grid-cols-[1fr_1fr_1fr_80px_auto] gap-2 px-1">
        <span>Issue</span><span>Before</span><span>After</span><span>Severity</span><span />
      </div>
      {findings.map((f, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_80px_auto] gap-2 items-start">
          <input value={f.item} onChange={(e) => { const n = [...findings]; n[i] = { ...f, item: e.target.value }; onChange(n) }} placeholder="LCP > 4s" className="h-9 px-2.5 text-sm border border-border rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ink" />
          <input value={f.before} onChange={(e) => { const n = [...findings]; n[i] = { ...f, before: e.target.value }; onChange(n) }} placeholder="7.2s" className="h-9 px-2.5 text-sm border border-border rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ink" />
          <input value={f.after} onChange={(e) => { const n = [...findings]; n[i] = { ...f, after: e.target.value }; onChange(n) }} placeholder="1.8s" className="h-9 px-2.5 text-sm border border-border rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ink" />
          <select value={f.severity} onChange={(e) => { const n = [...findings]; n[i] = { ...f, severity: e.target.value as CmsAuditFinding['severity'] }; onChange(n) }} className="h-9 px-2 text-sm border border-border rounded-md bg-white focus:outline-none focus-visible:ring-1 focus-visible:ring-ink">
            {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="button" onClick={() => onChange(findings.filter((_, j) => j !== i))} className="h-9 w-9 flex items-center justify-center text-muted/40 hover:text-red-500 transition-[color] duration-100">×</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...findings, { item: '', before: '', after: '', severity: 'high' }])} className="text-xs text-muted hover:text-ink transition-[color] duration-150">
        + Add finding
      </button>
    </div>
  )
}

export default function WorkEditorPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: item, mutate } = useSWR<CmsWorkItem>(id ? `/cms/work/${id}` : null)

  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

  const [form, setForm] = useState({
    client: '', slug: '', headline: '', situation: '', category: 'shopify',
    industry: '', year: '', duration: '', accentColor: '',
    featured: false, hasComparison: false,
    scope: [] as string[], stack: [] as string[],
    proof: [] as CmsProofMetric[], proofNote: '',
    actions: [] as string[],
    comparisons: [] as CmsWorkComparison[],
    auditFindings: [] as CmsAuditFinding[],
    videoId: '', videoPlatform: '',
    seoTitle: '', seoDescription: '',
  })

  useEffect(() => {
    if (!item) return
    setForm({
      client: item.client ?? '', slug: item.slug ?? '', headline: item.headline ?? '',
      situation: item.situation ?? '', category: item.category ?? 'shopify',
      industry: item.industry ?? '', year: item.year?.toString() ?? '',
      duration: item.duration ?? '', accentColor: item.accentColor ?? '',
      featured: item.featured ?? false, hasComparison: item.hasComparison ?? false,
      scope: item.scope ?? [], stack: item.stack ?? [],
      proof: item.proof ?? [], proofNote: item.proofNote ?? '',
      actions: item.actions ?? [],
      comparisons: item.comparisons ?? [],
      auditFindings: item.auditFindings ?? [],
      videoId: item.videoId ?? '', videoPlatform: item.videoPlatform ?? '',
      seoTitle: item.seoTitle ?? '', seoDescription: item.seoDescription ?? '',
    })
    setDirty(false)
  }, [item])

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await api.patch<CmsWorkItem>(`/cms/work/${id}`, {
        client: form.client.trim(), slug: form.slug.trim(), headline: form.headline.trim(),
        situation: form.situation.trim() || null, category: form.category,
        industry: form.industry.trim() || null,
        year: form.year ? parseInt(form.year) : null,
        duration: form.duration.trim() || null, accentColor: form.accentColor.trim() || null,
        featured: form.featured, hasComparison: form.hasComparison,
        scope: form.scope, stack: form.stack,
        proof: form.proof, proofNote: form.proofNote.trim() || null,
        actions: form.actions, comparisons: form.comparisons, auditFindings: form.auditFindings,
        videoId: form.videoId.trim() || null, videoPlatform: form.videoPlatform || null,
        seoTitle: form.seoTitle.trim() || null, seoDescription: form.seoDescription.trim() || null,
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
      const updated = await api.put<CmsWorkItem>(`/cms/work/${id}/publish`, {})
      mutate(updated, false)
    } finally {
      setPublishing(false)
    }
  }

  async function archive() {
    if (!confirm('Archive this case study?')) return
    await api.put(`/cms/work/${id}/archive`, {})
    router.push('/admin/work')
  }

  if (!item) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-4 pt-6 pb-10 md:p-8 max-w-2xl space-y-4">
          <Skeleton className="h-7 w-40" />
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-16 md:p-8 max-w-2xl">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">{item.client}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                item.status === 'published' ? 'bg-green-50 text-green-700' :
                item.status === 'archived' ? 'bg-surface text-muted' :
                'bg-amber-50 text-amber-700'
              }`}>{item.status}</span>
              {dirty && <span className="text-[10px] text-muted">Unsaved changes</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {item.status !== 'archived' && (
              <Button variant="ghost" size="sm" onClick={archive}>Archive</Button>
            )}
            {item.status !== 'published' && (
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
            <div className="grid grid-cols-2 gap-4">
              <Input label="Client" value={form.client} onChange={(e) => update('client', e.target.value)} />
              <Input label="Slug" value={form.slug} onChange={(e) => update('slug', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink">Headline</label>
              <textarea value={form.headline} onChange={(e) => update('headline', e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none" placeholder="Rebuilt the checkout flow and tripled conversion" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink">Category</label>
                <select value={form.category} onChange={(e) => update('category', e.target.value)} className="w-full h-9 px-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Input label="Industry" value={form.industry} onChange={(e) => update('industry', e.target.value)} placeholder="Outdoor / sporting goods" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Year" type="number" value={form.year} onChange={(e) => update('year', e.target.value)} />
              <Input label="Duration" value={form.duration} onChange={(e) => update('duration', e.target.value)} placeholder="6 weeks" />
            </div>
            <Input label="Accent colour (hex)" value={form.accentColor} onChange={(e) => update('accentColor', e.target.value)} placeholder="#c8a882" />
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} className="rounded border-border" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input type="checkbox" checked={form.hasComparison} onChange={(e) => update('hasComparison', e.target.checked)} className="rounded border-border" />
                Has before/after
              </label>
            </div>
          </section>

          {/* Scope + Stack */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Scope & Stack</p>
            <TagEditor label="Scope tags" values={form.scope} onChange={(v) => update('scope', v)} placeholder="Theme redesign, SEO…" />
            <TagEditor label="Tech stack" values={form.stack} onChange={(v) => update('stack', v)} placeholder="Shopify Plus, Klaviyo…" />
          </section>

          {/* Situation */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Narrative</p>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink">Situation</label>
              <textarea value={form.situation} onChange={(e) => update('situation', e.target.value)} rows={4} className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none" placeholder="The site was converting at 0.8% with a 4.1-second LCP…" />
            </div>
            <OrderedListEditor label="What we did" values={form.actions} onChange={(v) => update('actions', v)} placeholder="Replaced the Dawn-based theme with a custom Liquid architecture…" />
          </section>

          {/* Proof */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Results</p>
            <ProofEditor proof={form.proof} onChange={(v) => update('proof', v)} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink">Proof methodology note</label>
              <textarea value={form.proofNote} onChange={(e) => update('proofNote', e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none" placeholder="Measured via Shopify Analytics. Compared 90-day average before and after go-live…" />
            </div>
          </section>

          {/* Before / After */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Before / After</p>
            <ComparisonsEditor comparisons={form.comparisons} onChange={(v) => update('comparisons', v)} />
          </section>

          {/* Audit */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Technical audit</p>
            <AuditEditor findings={form.auditFindings} onChange={(v) => update('auditFindings', v)} />
          </section>

          {/* Video */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Video walkthrough</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Video ID" value={form.videoId} onChange={(e) => update('videoId', e.target.value)} placeholder="dQw4w9WgXcQ" />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink">Platform</label>
                <select value={form.videoPlatform} onChange={(e) => update('videoPlatform', e.target.value)} className="w-full h-9 px-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink">
                  <option value="">None</option>
                  {VIDEO_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* SEO */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">SEO</p>
            <Input label="SEO title" value={form.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} placeholder="Carve Boards — Case Study" />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink">SEO description</label>
              <textarea value={form.seoDescription} onChange={(e) => update('seoDescription', e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none" />
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
