'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Campaign, CampaignStatus } from '@/types'

type Params = { id: string }

const PLACEMENTS = [
  { value: 'announcement_bar', label: 'Announcement bar' },
  { value: 'inline',           label: 'Inline block' },
  { value: 'sticky_footer',    label: 'Sticky footer' },
  { value: 'exit_intent',      label: 'Exit intent' },
]

const THEME_STYLES  = ['default', 'minimal', 'emphasis']
const ANIMATIONS    = ['none', 'fade', 'slide']
const AUDIENCES     = [{ value: 'all', label: 'Everyone' }, { value: 'authenticated', label: 'Signed-in users' }, { value: 'anonymous', label: 'Visitors only' }]
const DEVICES       = [{ value: 'all', label: 'All devices' }, { value: 'mobile', label: 'Mobile only' }, { value: 'desktop', label: 'Desktop only' }]
const TRIGGER_TYPES = [
  { value: 'immediate',        label: 'Immediate (on page load)' },
  { value: 'time_delay',       label: 'Time delay' },
  { value: 'scroll_depth',     label: 'Scroll depth' },
  { value: 'exit_intent',      label: 'Exit intent' },
  { value: 'returning_visitor', label: 'Returning visitor' },
]
const POSITIONS = [
  { value: 'bottom-right',  label: 'Bottom right' },
  { value: 'bottom-left',   label: 'Bottom left' },
  { value: 'bottom-center', label: 'Bottom center' },
  { value: 'top',           label: 'Top bar' },
]
const SEQUENCE_CONDITIONS = [
  { value: 'seen',          label: 'Has seen previous campaign' },
  { value: 'dismissed',     label: 'Dismissed previous campaign' },
  { value: 'clicked',       label: 'Clicked previous campaign' },
  { value: 'converted',     label: 'Converted on previous campaign' },
  { value: 'not_converted', label: 'Seen but not converted' },
]

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft:     'bg-amber-50 text-amber-700',
  scheduled: 'bg-blue-50 text-blue-700',
  active:    'bg-green-50 text-green-700',
  paused:    'bg-orange-50 text-orange-700',
  archived:  'bg-surface text-muted',
}

function toLocalDatetime(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toISOString().slice(0, 16)
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-ink">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted/60">{hint}</p>}
    </div>
  )
}

function Select({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 px-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border text-ink focus:ring-ink"
      />
      <span className="text-sm text-ink">{label}</span>
    </label>
  )
}

export default function CampaignEditorPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: campaign, mutate } = useSWR<Campaign>(id ? `/cms/campaigns/${id}` : null)

  const [saving, setSaving]         = useState(false)
  const [saveError, setSaveError]   = useState<string | null>(null)
  const [transitioning, setTrans]   = useState(false)
  const [dirty, setDirty]           = useState(false)

  const [form, setForm] = useState({
    name:              '',
    priority:          '50',
    placement:         'announcement_bar',
    inlineHook:        '',
    heading:           '',
    body:              '',
    ctaLabel:          '',
    ctaUrl:            '',
    ctaNewTab:         false,
    secondaryCtaLabel: '',
    secondaryCtaUrl:   '',
    dismissible:       true,
    themeStyle:        'default',
    animation:         'none',
    bgColor:           '',
    textColor:         '',
    audience:          'all',
    pagePattern:       '',
    deviceTarget:      'all',
    startAt:           '',
    endAt:             '',
    impressionCap:     '',
    frequencyCapHours: '',
    // Trigger
    triggerType:        'immediate',
    triggerDelay:       '',
    triggerScrollDepth: '',
    // Behavior
    duration:           '',
    collapseToWidget:   false,
    position:           'bottom-right',
    oncePerSession:     false,
    untilConversion:    false,
    // Sequence condition
    sequenceCondition:  'seen',
    // Analytics
    conversionValue: '',
  })

  useEffect(() => {
    if (!campaign) return
    setForm({
      name:              campaign.name ?? '',
      priority:          String(campaign.priority ?? 50),
      placement:         campaign.placement ?? 'announcement_bar',
      inlineHook:        campaign.inlineHook ?? '',
      heading:           campaign.heading ?? '',
      body:              campaign.body ?? '',
      ctaLabel:          campaign.ctaLabel ?? '',
      ctaUrl:            campaign.ctaUrl ?? '',
      ctaNewTab:         campaign.ctaNewTab ?? false,
      secondaryCtaLabel: campaign.secondaryCtaLabel ?? '',
      secondaryCtaUrl:   campaign.secondaryCtaUrl ?? '',
      dismissible:       campaign.dismissible ?? true,
      themeStyle:        campaign.themeStyle ?? 'default',
      animation:         campaign.animation ?? 'none',
      bgColor:           campaign.bgColor ?? '',
      textColor:         campaign.textColor ?? '',
      audience:          campaign.audience ?? 'all',
      pagePattern:       campaign.pagePattern ?? '',
      deviceTarget:      campaign.deviceTarget ?? 'all',
      startAt:           toLocalDatetime(campaign.startAt),
      endAt:             toLocalDatetime(campaign.endAt),
      impressionCap:     campaign.impressionCap != null ? String(campaign.impressionCap) : '',
      frequencyCapHours: campaign.frequencyCapHours != null ? String(campaign.frequencyCapHours) : '',
      triggerType:        campaign.triggerType ?? 'immediate',
      triggerDelay:       campaign.triggerDelay != null ? String(campaign.triggerDelay) : '',
      triggerScrollDepth: campaign.triggerScrollDepth != null ? String(campaign.triggerScrollDepth) : '',
      duration:           campaign.duration != null ? String(campaign.duration) : '',
      collapseToWidget:   campaign.collapseToWidget ?? false,
      position:           campaign.position ?? 'bottom-right',
      oncePerSession:     campaign.oncePerSession ?? false,
      untilConversion:    campaign.untilConversion ?? false,
      sequenceCondition:  campaign.sequenceCondition ?? 'seen',
      conversionValue:    campaign.conversionValue != null ? String(campaign.conversionValue) : '',
    })
    setDirty(false)
  }, [campaign])

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await api.patch<Campaign>(`/cms/campaigns/${id}`, {
        name:              form.name.trim(),
        priority:          parseInt(form.priority, 10) || 50,
        placement:         form.placement,
        inlineHook:        form.inlineHook.trim() || null,
        heading:           form.heading.trim() || null,
        body:              form.body.trim() || null,
        ctaLabel:          form.ctaLabel.trim() || null,
        ctaUrl:            form.ctaUrl.trim() || null,
        ctaNewTab:         form.ctaNewTab,
        secondaryCtaLabel: form.secondaryCtaLabel.trim() || null,
        secondaryCtaUrl:   form.secondaryCtaUrl.trim() || null,
        dismissible:       form.dismissible,
        themeStyle:        form.themeStyle,
        animation:         form.animation,
        bgColor:           form.bgColor.trim() || null,
        textColor:         form.textColor.trim() || null,
        audience:          form.audience,
        pagePattern:       form.pagePattern.trim() || null,
        deviceTarget:      form.deviceTarget,
        startAt:           form.startAt ? new Date(form.startAt).toISOString() : null,
        endAt:             form.endAt   ? new Date(form.endAt).toISOString()   : null,
        impressionCap:     form.impressionCap     ? parseInt(form.impressionCap, 10)     : null,
        frequencyCapHours: form.frequencyCapHours ? parseInt(form.frequencyCapHours, 10) : null,
        triggerType:        form.triggerType,
        triggerDelay:       form.triggerDelay       ? parseInt(form.triggerDelay, 10)       : null,
        triggerScrollDepth: form.triggerScrollDepth ? parseInt(form.triggerScrollDepth, 10) : null,
        duration:           form.duration           ? parseInt(form.duration, 10)           : null,
        collapseToWidget:   form.collapseToWidget,
        position:           form.position,
        oncePerSession:     form.oncePerSession,
        untilConversion:    form.untilConversion,
        sequenceCondition:  form.sequenceCondition,
        conversionValue:    form.conversionValue ? parseInt(form.conversionValue, 10) : null,
      })
      mutate(updated, false)
      setDirty(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function transition(status: CampaignStatus) {
    setTrans(true)
    try {
      if (dirty) await save()
      const updated = await api.put<Campaign>(`/cms/campaigns/${id}/status`, { status })
      mutate(updated, false)
    } finally {
      setTrans(false)
    }
  }

  async function deleteCampaign() {
    if (!confirm('Delete this campaign? This cannot be undone.')) return
    await api.delete(`/cms/campaigns/${id}`)
    router.push('/admin/campaigns')
  }

  if (!campaign) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-4 pt-6 pb-10 md:p-8 max-w-2xl space-y-4">
          <Skeleton className="h-7 w-48" />
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </div>
    )
  }

  const status = campaign.status as CampaignStatus

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-16 md:p-8 max-w-2xl">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">{campaign.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
                {status}
              </span>
              {dirty && <span className="text-[10px] text-muted">Unsaved changes</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <Link href={`/admin/campaigns/${id}/analytics`}>
              <Button variant="ghost" size="sm">Analytics</Button>
            </Link>
            {status === 'draft' && (
              <>
                <Button variant="ghost" size="sm" onClick={() => transition('scheduled')} loading={transitioning}>Schedule</Button>
                <Button size="sm" onClick={() => transition('active')} loading={transitioning}>Activate</Button>
              </>
            )}
            {status === 'scheduled' && (
              <Button size="sm" onClick={() => transition('active')} loading={transitioning}>Activate now</Button>
            )}
            {status === 'active' && (
              <Button variant="secondary" size="sm" onClick={() => transition('paused')} loading={transitioning}>Pause</Button>
            )}
            {status === 'paused' && (
              <Button size="sm" onClick={() => transition('active')} loading={transitioning}>Resume</Button>
            )}
            {status !== 'archived' && (
              <Button variant="ghost" size="sm" onClick={() => transition('archived')}>Archive</Button>
            )}
            {['draft', 'archived'].includes(status) && (
              <Button variant="ghost" size="sm" onClick={deleteCampaign} className="text-red-500 hover:text-red-600">Delete</Button>
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
              <Input label="Name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Summer sale — themes" />
              <Input label="Priority (1 = highest)" type="number" value={form.priority} onChange={(e) => update('priority', e.target.value)} placeholder="50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start date">
                <input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(e) => update('startAt', e.target.value)}
                  className="w-full h-9 px-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
                />
              </Field>
              <Field label="End date">
                <input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(e) => update('endAt', e.target.value)}
                  className="w-full h-9 px-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
                />
              </Field>
            </div>
          </section>

          {/* Content */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Content</p>
            <Input label="Headline" value={form.heading} onChange={(e) => update('heading', e.target.value)} placeholder="Free shipping on orders over $75" />
            <Field label="Description">
              <textarea
                value={form.body}
                onChange={(e) => update('body', e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-white text-ink placeholder:text-muted/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink resize-none"
                placeholder="Optional supporting text — keep it short."
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Input label="CTA label" value={form.ctaLabel} onChange={(e) => update('ctaLabel', e.target.value)} placeholder="Shop themes" />
              <Input label="CTA URL" value={form.ctaUrl} onChange={(e) => update('ctaUrl', e.target.value)} placeholder="/themes" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Secondary CTA label" value={form.secondaryCtaLabel} onChange={(e) => update('secondaryCtaLabel', e.target.value)} placeholder="Learn more" />
              <Input label="Secondary CTA URL" value={form.secondaryCtaUrl} onChange={(e) => update('secondaryCtaUrl', e.target.value)} placeholder="/about" />
            </div>
            <div className="flex items-center gap-6 pt-1">
              <Checkbox label="Open CTA in new tab" checked={form.ctaNewTab} onChange={(v) => update('ctaNewTab', v)} />
              <Checkbox label="Dismissible" checked={form.dismissible} onChange={(v) => update('dismissible', v)} />
            </div>
          </section>

          {/* Display */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Display</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Placement">
                <Select value={form.placement} onChange={(v) => update('placement', v)} options={PLACEMENTS} />
              </Field>
              {form.placement === 'inline' && (
                <Input
                  label="Inline hook ID"
                  value={form.inlineHook}
                  onChange={(e) => update('inlineHook', e.target.value)}
                  placeholder="below-hero"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Style">
                <Select
                  value={form.themeStyle}
                  onChange={(v) => update('themeStyle', v)}
                  options={THEME_STYLES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                />
              </Field>
              <Field label="Animation">
                <Select
                  value={form.animation}
                  onChange={(v) => update('animation', v)}
                  options={ANIMATIONS.map((a) => ({ value: a, label: a.charAt(0).toUpperCase() + a.slice(1) }))}
                />
              </Field>
            </div>

            {/* Brand colours */}
            <div className="pt-1 border-t border-border space-y-3">
              <p className="text-[11px] text-muted/70">Brand colours — overrides the default dark style</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Background colour">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.bgColor || '#111111'}
                      onChange={(e) => update('bgColor', e.target.value)}
                      className="h-9 w-10 rounded-md border border-border cursor-pointer p-0.5 bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={form.bgColor}
                      onChange={(e) => update('bgColor', e.target.value)}
                      placeholder="#111111"
                      maxLength={7}
                      className="flex-1 h-9 px-2.5 text-sm border border-border rounded-md bg-white text-ink font-mono focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
                    />
                  </div>
                </Field>
                <Field label="Text colour">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.textColor || '#ffffff'}
                      onChange={(e) => update('textColor', e.target.value)}
                      className="h-9 w-10 rounded-md border border-border cursor-pointer p-0.5 bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={form.textColor}
                      onChange={(e) => update('textColor', e.target.value)}
                      placeholder="#ffffff"
                      maxLength={7}
                      className="flex-1 h-9 px-2.5 text-sm border border-border rounded-md bg-white text-ink font-mono focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
                    />
                  </div>
                </Field>
              </div>

              {/* Live preview */}
              <div
                className="rounded-lg px-4 py-3 flex items-center justify-between gap-4 transition-colors duration-150"
                style={{
                  background: form.bgColor || '#111111',
                  color:      form.textColor || '#ffffff',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{ background: (form.textColor || '#ffffff') + '22', color: form.textColor || '#ffffff' }}
                  >
                    ET
                  </span>
                  <p className="text-sm font-medium truncate">
                    {form.heading || 'Headline preview'}
                  </p>
                </div>
                {form.ctaLabel && (
                  <span
                    className="text-xs font-medium shrink-0 px-2.5 py-1 rounded"
                    style={{ background: (form.textColor || '#ffffff') + '22', color: form.textColor || '#ffffff' }}
                  >
                    {form.ctaLabel}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted/50">Live preview — leave blank to use the default dark style</p>
            </div>
          </section>

          {/* Trigger & Behavior */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Trigger</p>
            <Field label="Trigger type">
              <Select value={form.triggerType} onChange={(v) => update('triggerType', v)} options={TRIGGER_TYPES} />
            </Field>
            {form.triggerType === 'time_delay' && (
              <Input label="Delay (seconds)" type="number" value={form.triggerDelay} onChange={(e) => update('triggerDelay', e.target.value)} placeholder="12" />
            )}
            {form.triggerType === 'scroll_depth' && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Scroll depth (%)" type="number" value={form.triggerScrollDepth} onChange={(e) => update('triggerScrollDepth', e.target.value)} placeholder="70" />
                <Input label="Additional delay after scroll (seconds)" type="number" value={form.triggerDelay} onChange={(e) => update('triggerDelay', e.target.value)} placeholder="30" />
              </div>
            )}
            {form.triggerType === 'returning_visitor' && (
              <Input label="Delay on return visit (seconds)" type="number" value={form.triggerDelay} onChange={(e) => update('triggerDelay', e.target.value)} placeholder="0" />
            )}
          </section>

          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Behavior</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Position on screen">
                <Select value={form.position} onChange={(v) => update('position', v)} options={POSITIONS} />
              </Field>
              <Input
                label="Auto-dismiss after (seconds)"
                type="number"
                value={form.duration}
                onChange={(e) => update('duration', e.target.value)}
                placeholder="Never"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 pt-1">
              <Checkbox label="Collapse to widget after timer expires" checked={form.collapseToWidget} onChange={(v) => update('collapseToWidget', v)} />
              <Checkbox label="Show once per session" checked={form.oncePerSession} onChange={(v) => update('oncePerSession', v)} />
              <Checkbox label="Stop showing after user converts" checked={form.untilConversion} onChange={(v) => update('untilConversion', v)} />
            </div>
          </section>

          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Sequence</p>
            <Field label="Required state of previous campaign in sequence" hint="Only applies if this campaign is part of a sequence (position 2+).">
              <Select value={form.sequenceCondition} onChange={(v) => update('sequenceCondition', v)} options={SEQUENCE_CONDITIONS} />
            </Field>
          </section>

          {/* Targeting */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Targeting</p>
            <Input
              label="Page pattern"
              value={form.pagePattern}
              onChange={(e) => update('pagePattern', e.target.value)}
              placeholder="/themes/* (leave blank to show everywhere)"
            />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Audience">
                <Select value={form.audience} onChange={(v) => update('audience', v)} options={AUDIENCES} />
              </Field>
              <Field label="Device">
                <Select value={form.deviceTarget} onChange={(v) => update('deviceTarget', v)} options={DEVICES} />
              </Field>
            </div>
          </section>

          {/* Frequency */}
          <section className="border border-border rounded-xl bg-white p-5 space-y-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Frequency</p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Max impressions per user"
                type="number"
                value={form.impressionCap}
                onChange={(e) => update('impressionCap', e.target.value)}
                placeholder="Unlimited"
              />
              <Input
                label="Cooldown between impressions (hours)"
                type="number"
                value={form.frequencyCapHours}
                onChange={(e) => update('frequencyCapHours', e.target.value)}
                placeholder="None"
              />
            </div>
            <p className="text-[11px] text-muted/60">
              Leave blank to show without limits. Set max impressions to 1 for once-only display.
            </p>
            <Input
              label="Conversion value (pence)"
              type="number"
              value={form.conversionValue}
              onChange={(e) => update('conversionValue', e.target.value)}
              placeholder="e.g. 9900 = £99 — leave blank if not tracking revenue"
            />
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
