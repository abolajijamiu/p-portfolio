'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { api } from '@/lib/api'

type Ticket = {
  ticket: {
    id: string
    ticketNumber: string
    subject: string
    category: string
    status: 'open' | 'in_progress' | 'closed'
    priority: 'low' | 'normal' | 'high' | 'urgent'
    createdAt: string
    updatedAt: string
  }
}

const STATUS_COLOR = {
  open: 'bg-sky-50 text-sky-700 border-sky-200',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
  closed: 'bg-surface text-muted border-border',
}
const STATUS_LABEL = { open: 'Open', in_progress: 'In progress', closed: 'Closed' }

const PRIORITY_COLOR = {
  low: 'text-muted',
  normal: 'text-muted',
  high: 'text-amber-600 font-semibold',
  urgent: 'text-rose-600 font-bold',
}
const PRIORITY_LABEL = { low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' }

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'billing', label: 'Billing' },
  { value: 'technical', label: 'Technical' },
  { value: 'orders', label: 'Orders' },
  { value: 'resources', label: 'Resources' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'consultations', label: 'Consultations' },
]

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]))

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SupportPage() {
  const { data, isLoading, mutate } = useSWR<Ticket[]>('/support')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ subject: '', category: 'general', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const open = (data ?? []).filter((t) => t.ticket.status !== 'closed')
  const closed = (data ?? []).filter((t) => t.ticket.status === 'closed')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await api.post('/support', form)
      setForm({ subject: '', category: 'general', message: '' })
      setShowNew(false)
      mutate()
    } catch {
      setError('Failed to submit ticket. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="px-4 pt-6 pb-12 md:p-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">Support</h1>
          <p className="text-sm text-muted mt-1">Submit a request and track responses from our team.</p>
        </div>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="shrink-0 bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-deep transition-colors"
        >
          + New ticket
        </button>
      </div>

      {/* New ticket form */}
      {showNew && (
        <form onSubmit={submit} className="bg-white border border-border rounded-xl p-6 mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-ink">New support ticket</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief description of your issue"
                required
                className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Provide as much detail as possible..."
              rows={5}
              required
              className="w-full text-sm border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
            />
          </div>
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-brand text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-deep transition-colors disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit ticket'}
            </button>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="px-4 border border-border rounded-lg text-muted hover:text-ink text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-border rounded-xl p-5 animate-pulse">
              <div className="h-4 w-48 bg-surface rounded mb-2" />
              <div className="h-3 w-32 bg-surface rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (data ?? []).length === 0 && !showNew && (
        <div className="bg-white border border-border rounded-xl p-10 text-center">
          <p className="text-sm font-semibold text-ink mb-1">No support tickets yet</p>
          <p className="text-xs text-muted mb-4">Have a question or issue? Open a ticket and our team will respond within 24 hours.</p>
          <button onClick={() => setShowNew(true)} className="text-sm font-medium text-brand hover:underline">
            Open your first ticket →
          </button>
        </div>
      )}

      {open.length > 0 && (
        <div className="space-y-3 mb-6">
          {open.map(({ ticket: t }) => (
            <TicketRow key={t.id} ticket={t} />
          ))}
        </div>
      )}

      {closed.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3 mt-6">Closed tickets</p>
          <div className="space-y-2">
            {closed.map(({ ticket: t }) => (
              <TicketRow key={t.id} ticket={t} dimmed />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TicketRow({ ticket: t, dimmed = false }: { ticket: Ticket['ticket']; dimmed?: boolean }) {
  return (
    <Link
      href={`/support/${t.id}`}
      className={`block bg-white border border-border rounded-xl p-4 hover:border-brand/30 transition-all group ${dimmed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono font-semibold text-muted">{t.ticketNumber}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLOR[t.status]}`}>
              {STATUS_LABEL[t.status]}
            </span>
            <span className="text-[10px] bg-surface border border-border text-muted px-2 py-0.5 rounded-full capitalize">
              {t.category}
            </span>
          </div>
          <p className="text-sm font-semibold text-ink group-hover:text-brand transition-colors">{t.subject}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-[11px] ${PRIORITY_COLOR[t.priority]}`}>{PRIORITY_LABEL[t.priority]}</p>
          <p className="text-[11px] text-muted mt-0.5">{fmtDate(t.updatedAt)}</p>
        </div>
      </div>
    </Link>
  )
}
