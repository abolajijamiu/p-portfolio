'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { api } from '@/lib/api'

type AdminTicketDetail = {
  ticket: {
    id: string
    subject: string
    status: 'open' | 'in_progress' | 'closed'
    priority: 'low' | 'normal' | 'high' | 'urgent'
    createdAt: string
    closedAt?: string | null
  }
  userName: string
  userEmail: string
  messages: {
    message: { id: string; body: string; isStaff: boolean; createdAt: string }
    senderName: string
  }[]
}

const STATUS_COLOR = {
  open: 'bg-sky-50 text-sky-700',
  in_progress: 'bg-purple-50 text-purple-700',
  closed: 'bg-surface text-muted',
}

const PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

export default function AdminSupportTicketPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading, mutate } = useSWR<AdminTicketDetail>(`/cms/support/${id}`)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (data) document.title = `${data.ticket.subject} — Admin Support`
  }, [data])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages.length])

  async function sendReply() {
    if (!replyText.trim()) return
    setSending(true)
    try {
      await api.post(`/cms/support/${id}/reply`, { body: replyText })
      setReplyText('')
      mutate()
    } finally {
      setSending(false)
    }
  }

  async function action(path: string) {
    setBusy(true)
    try {
      await api.post(`/cms/support/${id}/${path}`)
      mutate()
    } finally {
      setBusy(false)
    }
  }

  async function setPriority(priority: string) {
    setBusy(true)
    try {
      await api.patch(`/cms/support/${id}/priority`, { priority })
      mutate()
    } finally {
      setBusy(false)
    }
  }

  if (isLoading) return <div className="h-full flex items-center justify-center"><div className="h-4 w-40 bg-surface rounded animate-pulse" /></div>
  if (!data) return null

  const { ticket, userName, userEmail, messages } = data
  const isClosed = ticket.status === 'closed'

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-4xl">

        <button onClick={() => router.push('/admin/support')} className="text-xs text-muted hover:text-brand mb-4 inline-block">
          ← Support tickets
        </button>

        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">{ticket.subject}</h1>
            <p className="text-xs text-muted mt-1">{userName} · {userEmail} · {fmtTime(ticket.createdAt)}</p>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${STATUS_COLOR[ticket.status]}`}>
            {ticket.status.replace('_', ' ')}
          </span>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {!isClosed ? (
            <button onClick={() => action('close')} disabled={busy} className="text-xs text-muted border border-border rounded-lg px-2.5 py-1 hover:text-ink disabled:opacity-50">
              Close ticket
            </button>
          ) : (
            <button onClick={() => action('reopen')} disabled={busy} className="text-xs text-sky-600 border border-sky-200 rounded-lg px-2.5 py-1 hover:bg-sky-50 disabled:opacity-50">
              Reopen
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted">Priority:</span>
            {PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                disabled={busy || ticket.priority === p}
                className={`text-[11px] capitalize px-2 py-0.5 rounded border transition-colors ${
                  ticket.priority === p
                    ? 'bg-ink text-white border-ink'
                    : 'border-border text-muted hover:text-ink'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted">No messages.</div>
            ) : (
              messages.map(({ message, senderName }) => (
                <div key={message.id} className={`px-4 py-4 ${message.isStaff ? 'bg-brand/[0.03]' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${message.isStaff ? 'text-brand' : 'text-muted'}`}>
                      {message.isStaff ? `${senderName} (Staff)` : senderName}
                    </span>
                    <span className="text-[11px] text-muted ml-auto">{fmtTime(message.createdAt)}</span>
                  </div>
                  <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{message.body}</p>
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>

          {!isClosed && (
            <div className="border-t border-border p-3 flex gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }}
                rows={3}
                placeholder="Reply to client…"
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none"
              />
              <button
                onClick={sendReply}
                disabled={sending || !replyText.trim()}
                className="self-end px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand/90 disabled:opacity-40"
              >
                Reply
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
