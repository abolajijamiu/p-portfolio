'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { api } from '@/lib/api'

type TicketRow = {
  ticket: {
    id: string
    subject: string
    status: 'open' | 'in_progress' | 'closed'
    priority: 'low' | 'normal' | 'high' | 'urgent'
    createdAt: string
    updatedAt: string
  }
}

const STATUS_COLOR = {
  open: 'bg-sky-50 text-sky-700 border-sky-100',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-100',
  closed: 'bg-surface text-muted border-border',
}

const STATUS_LABEL = { open: 'Open', in_progress: 'In progress', closed: 'Closed' }

const PRIORITY_COLOR = {
  low: 'text-muted',
  normal: 'text-muted',
  high: 'text-amber-600',
  urgent: 'text-rose-600 font-semibold',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SupportPage() {
  const { data: rows, isLoading, mutate } = useSWR<TicketRow[]>('/support')
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { document.title = 'Support — E-Tech' }, [])

  async function submit() {
    if (!subject.trim() || !message.trim()) return
    setSaving(true)
    try {
      await api.post('/support', { subject, message })
      mutate()
      setShowForm(false)
      setSubject('')
      setMessage('')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand'

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-3xl">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Support</h1>
            <p className="text-sm text-muted mt-0.5">Get help from the E-Tech team</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-semibold bg-brand text-white px-3 py-2 rounded-lg hover:bg-brand/90"
          >
            New ticket
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white border border-border rounded-xl animate-pulse" />)}
          </div>
        ) : !rows || rows.length === 0 ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No support tickets yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-xs font-semibold text-brand hover:underline"
            >
              Open your first ticket →
            </button>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
            {rows.map(({ ticket }) => (
              <Link
                key={ticket.id}
                href={`/support/${ticket.id}`}
                className="flex items-start justify-between gap-3 px-4 py-4 hover:bg-surface transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{ticket.subject}</p>
                  <p className={`text-[11px] mt-0.5 capitalize ${PRIORITY_COLOR[ticket.priority]}`}>
                    {ticket.priority} priority · {fmtDate(ticket.updatedAt)}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_COLOR[ticket.status]}`}>
                  {STATUS_LABEL[ticket.status]}
                </span>
              </Link>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-end md:items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-border p-6 w-full max-w-md shadow-xl">
              <h3 className="text-sm font-semibold text-ink mb-5">Open a support ticket</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Subject</label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of the issue"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Describe your issue in detail…"
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-ink">
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={saving || !subject.trim() || !message.trim()}
                  className="flex-1 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand/90 disabled:opacity-50"
                >
                  {saving ? 'Submitting…' : 'Submit ticket'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
