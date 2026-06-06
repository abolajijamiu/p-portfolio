'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Campaign } from '@/types'

const PLACEMENTS = [
  { value: 'announcement_bar', label: 'Announcement bar' },
  { value: 'inline',           label: 'Inline block' },
  { value: 'sticky_footer',    label: 'Sticky footer' },
  { value: 'exit_intent',      label: 'Exit intent' },
]

export default function NewCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', placement: 'announcement_bar', priority: '50' })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const campaign = await api.post<Campaign>('/cms/campaigns', {
        name:      form.name.trim(),
        placement: form.placement,
        priority:  parseInt(form.priority, 10) || 50,
      })
      router.push(`/admin/campaigns/${campaign.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink tracking-tight">New campaign</h1>
          <p className="text-sm text-muted mt-0.5">Set the basics — configure content and targeting in the editor.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-xl bg-white p-5">
          <Input
            label="Internal name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Summer sale — themes"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink">Placement</label>
            <select
              value={form.placement}
              onChange={(e) => set('placement', e.target.value)}
              className="w-full h-9 px-2.5 text-sm border border-border rounded-md bg-white text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
            >
              {PLACEMENTS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <Input
            label="Priority (1 = highest)"
            type="number"
            value={form.priority}
            onChange={(e) => set('priority', e.target.value)}
            placeholder="50"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" loading={loading}>Create campaign</Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
