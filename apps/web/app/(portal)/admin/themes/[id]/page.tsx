'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import type { CmsTheme, CmsThemeFeature, CmsThemeLicense } from '@/types'

const CATEGORIES = ['fashion', 'electronics', 'luxury', 'food', 'dtc']
const VIDEO_PLATFORMS = ['youtube', 'loom', 'vimeo']

type Params = { id: string }

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

function FeaturesEditor({
  features,
  onChange,
}: {
  features: CmsThemeFeature[]
  onChange: (v: CmsThemeFeature[]) => void
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-ink">Feature sections</label>
      {features.map((section, si) => (
        <div key={si} className="border border-border rounded-lg p-4 space-y-3 bg-white">
          <div className="flex items-center gap-3">
            <input
              value={section.category}
              onChange={(e) => {
                const next = [...features]
                next[si] = { ...section, category: e.target.value }
                onChange(next)
              }}
              placeholder="Commerce"
              className="flex-1 h-8 px-2.5 text-sm border border-border rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
            />
            <button
              type="button"
              onClick={() => onChange(features.filter((_, i) => i !== si))}
              className="text-xs text-muted/50 hover:text-red-500 transition-[color] duration-100 shrink-0"
            >
              Remove section
            </button>
          </div>
          <div className="space-y-1.5">
            {section.items.map((item, ii) => (
              <div key={ii} className="flex items-center gap-2">
                <input
                  value={item}
                  onChange={(e) => {
                    const next = features.map((s, si2) =>
                      si2 === si
                        ? { ...s, items: s.items.map((it, ii2) => (ii2 === ii ? e.target.value : it)) }
                        : s,
                    )
                    onChange(next)
                  }}
                  className="flex-1 h-8 px-2.5 text-sm border border-border rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
                  placeholder="Feature item"
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      features.map((s, si2) =>
                        si2 === si
                          ? { ...s, items: s.items.filter((_, ii2) => ii2 !== ii) }
                          : s,
                      ),
                    )
                  }
                  className="text-muted/40 hover:text-red-500 transition-[color] duration-100 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                onChange(
                  features.map((s, si2) =>
                    si2 === si ? { ...s, items: [...s.items, ''] } : s,
                  ),
                )
              }
              className="text-xs text-muted hover:text-ink transition-[color] duration-150"
            >
              + Add item
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...features, { category: '', items: [''] }])}
        className="text-xs text-muted hover:text-ink transition-[color] duration-150 border border-dashed border-border rounded-lg px-4 py-3 w-full text-center"
      >
        + Add section
      </button>
    </div>
  )
}

function LicensesEditor({
  licenses,
  onChange,
}: {
  licenses: CmsThemeLicense[]
  onChange: (v: CmsThemeLicense[]) => void
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-ink">License tiers</label>
      {licenses.map((lic, i) => (
        <div key={i} className="grid grid-cols-[1fr_100px_1fr_auto] gap-2 items-start">
          <input
            value={lic.type}
            onChange={(e) => {
              const next = [...licenses]
              next[i] = { ...lic, type: e.target.value }
              onChange(next)
            }}
            placeholder="Single store"
            className="h-9 px-2.5 text-sm border border-border rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
          />
          <input
            type="number"
            value={lic.priceCents !== null ? lic.priceCents / 100 : ''}
            onChange={(e) => {
              const next = [...licenses]
              next[i] = {
                ...lic,
                priceCents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null,
              }
              onChange(next)
            }}
            placeholder="Custom"
            className="h-9 px-2.5 text-sm border border-border rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
          />
          <input
            value={lic.description}
            onChange={(e) => {
              const next = [...licenses]
              next[i] = { ...lic, description: e.target.value }
              onChange(next)
            }}
            placeholder="One Shopify store. Unlimited use."
            className="h-9 px-2.5 text-sm border border-border rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
          />
          <button
            type="button"
            onClick={() => onChange(licenses.filter((_, j) => j !== i))}
            className="h-9 w-9 flex items-center justify-center text-muted/40 hover:text-red-500 transition-[color] duration-100"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...licenses, { type: '', priceCents: null, description: '' }])}
        className="text-xs text-muted hover:text-ink transition-[color] duration-150"
      >
        + Add tier
      </button>
    </div>
  )
}

export default function ThemeEditorPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: theme, mutate } = useSWR<CmsTheme>(id ? `/cms/themes/${id}` : null)

  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    category: 'fashion',
    priceCents: '',
    bgClass: '',
    accentColor: '',
    highlights: [] as string[],
    features: [] as CmsThemeFeature[],
    licenses: [] as CmsThemeLicense[],
    deliveryNotes: [] as string[],
    checkoutUrl: '',
    demoStoreUrl: '',
    demoStoreNote: '',
    videoId: '',
    videoPlatform: '',
    seoTitle: '',
    seoDescription: '',
  })

  useEffect(() => {
    if (!theme) return
    setForm({
      name: theme.name ?? '',
      slug: theme.slug ?? '',
      tagline: theme.tagline ?? '',
      description: theme.description ?? '',
      category: theme.category ?? 'fashion',
      priceCents: theme.priceCents ? String(theme.priceCents / 100) : '',
      bgClass: theme.bgClass ?? '',
      accentColor: theme.accentColor ?? '',
      highlights: theme.highlights ?? [],
      features: theme.features ?? [],
      licenses: theme.licenses ?? [],
      deliveryNotes: theme.deliveryNotes ?? [],
      checkoutUrl: theme.checkoutUrl ?? '',
      demoStoreUrl: theme.demoStoreUrl ?? '',
      demoStoreNote: theme.demoStoreNote ?? '',
      videoId: theme.videoId ?? '',
      videoPlatform: theme.videoPlatform ?? '',
      seoTitle: theme.seoTitle ?? '',
      seoDescription: theme.seoDescription ?? '',
    })
    setDirty(false)
  }, [theme])

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await api.patch<CmsTheme>(`/cms/themes/${id}`, {
        name: form.name.trim(),
        slug: form.slug.trim(),
        tagline: form.tagline.trim() || null,
        description: form.description.trim() || null,
        category: form.category,
        priceCents: form.priceCents ? Math.round(parseFloat(form.priceCents) * 100) : null,
        bgClass: form.bgClass.trim() || null,
        accentColor: form.accentColor.trim() || null,
        highlights: form.highlights,
        features: form.features,
        licenses: form.licenses,
        deliveryNotes: form.deliveryNotes,
        checkoutUrl: form.checkoutUrl.trim() || null,
        demoStoreUrl: form.demoStoreUrl.trim() || null,
        demoStoreNote: form.demoStoreNote.trim() || null,
        videoId: form.videoId.trim() || null,
        videoPlatform: form.videoPlatform || null,
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
      const updated = await api.put<CmsTheme>(`/cms/themes/${id}/publish`, {})
      mutate(updated, false)
    } finally {
      setPublishing(false)
    }
  }

  async function archive() {
    if (!confirm('Archive this theme? It will be hidden from the public site.')) return
    await api.put(`/cms/themes/${id}/archive`, {})
    router.push('/admin/themes')
  }

  if (!theme) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-4 pt-6 pb-10 md:p-8 max-w-2xl space-y-4">
          <Skeleton className="h-7 w-40" />
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-16 md:p-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">{theme.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                theme.status === 'published' ? 'bg-green-50 text-green-700' :
                theme.status === 'archived' ? 'bg-surface text-muted' :
                'bg-amber-50 text-amber-700'
              }`}>
                {theme.status}
              </span>
              {dirty && <span className="text-[10px] text-muted">Unsaved changes</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {theme.status !== 'archived' && (
              <Button variant="ghost" size="sm" onClick={archive}>Archive</Button>
            )}
            {theme.status !== 'published' && (
              <Button size="sm" onClick={publish} loading={publishing}>Publish</Button>
            )}
            <Button size="sm" variant="secondary" onClick={save} loading={saving} disabled={!dirty}>
              Save
            </Button>
          </div>
        </div>

        {saveError && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-md">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Core fields */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Core</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name" value={form.name} onChange={(e) => update('name', e.target.value)} />
              <Input label="Slug" value={form.slug} onChange={(e) => update('slug', e.target.value)} />
            </div>
            <Input label="Tagline" value={form.tagline} onChange={(e) => update('tagline', e.target.value)} placeholder="Minimal. Editorial. Built to sell." />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-white text-ink placeholder:text-muted/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none"
                placeholder="A lean Shopify theme for…"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="w-full h-9 px-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Input
                label="Price (USD) — blank = custom"
                type="number"
                value={form.priceCents}
                onChange={(e) => update('priceCents', e.target.value)}
                placeholder="280"
              />
            </div>
          </section>

          {/* Visuals */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Visual</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Accent colour (hex)" value={form.accentColor} onChange={(e) => update('accentColor', e.target.value)} placeholder="#b5a898" />
              <Input label="Background class (Tailwind)" value={form.bgClass} onChange={(e) => update('bgClass', e.target.value)} placeholder="bg-[#f0eeeb]" />
            </div>
          </section>

          {/* Commerce features */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Features</p>
            <TagEditor
              label="Highlights (pill tags)"
              values={form.highlights}
              onChange={(v) => update('highlights', v)}
              placeholder="Quick buy, Bundles…"
            />
            <FeaturesEditor features={form.features} onChange={(v) => update('features', v)} />
          </section>

          {/* Licensing */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Licensing</p>
            <LicensesEditor licenses={form.licenses} onChange={(v) => update('licenses', v)} />
            <TagEditor
              label="Delivery notes"
              values={form.deliveryNotes}
              onChange={(v) => update('deliveryNotes', v)}
              placeholder="Shopify .zip + full source…"
            />
          </section>

          {/* Purchase */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Purchase</p>
            <Input label="Checkout URL" value={form.checkoutUrl} onChange={(e) => update('checkoutUrl', e.target.value)} placeholder="https://buy.stripe.com/..." />
            <p className="text-[11px] text-muted/60">Paste your Stripe, Gumroad, Lemon Squeezy, or Paystack link. The "Get this theme" button will link directly to it.</p>
          </section>

          {/* Demo store */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Demo store</p>
            <Input label="Demo store URL" value={form.demoStoreUrl} onChange={(e) => update('demoStoreUrl', e.target.value)} placeholder="https://cascade-demo.myshopify.com" />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink">Demo store note</label>
              <textarea
                value={form.demoStoreNote}
                onChange={(e) => update('demoStoreNote', e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-white text-ink placeholder:text-muted/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none"
                placeholder="Development store preview available — typically set up within 2 business days of request."
              />
            </div>
          </section>

          {/* Video */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Video walkthrough</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Video ID" value={form.videoId} onChange={(e) => update('videoId', e.target.value)} placeholder="dQw4w9WgXcQ" />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink">Platform</label>
                <select
                  value={form.videoPlatform}
                  onChange={(e) => update('videoPlatform', e.target.value)}
                  className="w-full h-9 px-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
                >
                  <option value="">None</option>
                  {VIDEO_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* SEO */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">SEO</p>
            <Input label="SEO title" value={form.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} placeholder="Cascade — Shopify Theme" />
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

        {/* Bottom save bar */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
          <p className="text-[11px] text-muted">
            {dirty ? 'You have unsaved changes.' : 'All changes saved.'}
          </p>
          <Button onClick={save} loading={saving} disabled={!dirty}>Save changes</Button>
        </div>
      </div>
    </div>
  )
}
