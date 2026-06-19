'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { api } from '@/lib/api'

type Message = {
  message: {
    id: string
    body: string
    isStaff: boolean
    attachments: { key: string; name: string; size: number }[]
    createdAt: string
  }
  senderName: string
}

type TicketDetail = {
  ticket: {
    id: string
    ticketNumber: string
    subject: string
    category: string
    status: 'open' | 'in_progress' | 'closed'
    priority: 'low' | 'normal' | 'high' | 'urgent'
    createdAt: string
    updatedAt: string
    closedAt?: string | null
  }
  messages: Message[]
}

const STATUS_COLOR = {
  open: 'bg-sky-50 text-sky-700 border-sky-200',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
  closed: 'bg-surface text-muted border-border',
}
const STATUS_LABEL = { open: 'Open', in_progress: 'In progress', closed: 'Closed' }

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function SupportTicketPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, mutate } = useSWR<TicketDetail>(`/support/${id}`)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [closing, setClosing] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages.length])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-6 w-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null
  const { ticket, messages } = data

  async function sendReply() {
    if (!reply.trim()) return
    setSending(true)
    try {
      await api.post(`/support/${id}/messages`, { body: reply })
      setReply('')
      mutate()
    } finally {
      setSending(false)
    }
  }

  async function closeTicket() {
    if (!confirm('Close this support ticket?')) return
    setClosing(true)
    try {
      await api.post(`/support/${id}/close`)
      mutate()
    } finally {
      setClosing(false)
    }
  }

  return (
    <div className="px-4 pt-6 pb-12 md:p-8 max-w-3xl">
      <Link href="/support" className="text-xs text-muted hover:text-ink transition-colors mb-4 inline-block">
        ← Support
      </Link>

      {/* Ticket header */}
      <div className="bg-white border border-border rounded-xl p-5 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-semibold text-muted">{ticket.ticketNumber}</span>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_COLOR[ticket.status]}`}>
                {STATUS_LABEL[ticket.status]}
              </span>
              <span className="text-[10px] bg-surface border border-border text-muted px-2 py-0.5 rounded-full capitalize">
                {ticket.category}
              </span>
            </div>
            <h1 className="text-[15px] font-semibold text-ink">{ticket.subject}</h1>
            <p className="text-xs text-muted mt-1">Opened {fmtDateTime(ticket.createdAt)}</p>
          </div>
          {ticket.status !== 'closed' && (
            <button
              onClick={closeTicket}
              disabled={closing}
              className="shrink-0 text-xs font-medium border border-border text-muted hover:text-ink px-3 py-1.5 rounded-lg transition-colors"
            >
              Close ticket
            </button>
          )}
        </div>
      </div>

      {/* Message thread */}
      <div className="space-y-4 mb-5">
        {messages.map(({ message: m, senderName }) => {
          const isStaff = m.isStaff
          return (
            <div key={m.id} className={`flex ${isStaff ? 'justify-start' : 'justify-end'}`}>
              <div className="max-w-[80%]">
                {isStaff && (
                  <div className="flex items-center gap-1.5 mb-1 ml-1">
                    <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white">{(senderName?.[0] ?? 'S').toUpperCase()}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-ink">{senderName}</span>
                    <span className="text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-medium">Support</span>
                  </div>
                )}
                <div className={`rounded-xl px-4 py-3 ${!isStaff ? 'bg-brand text-white' : 'bg-white border border-border text-ink'}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>
                  <p className={`text-[10px] mt-1.5 ${!isStaff ? 'text-white/50' : 'text-muted'}`}>
                    {fmtDateTime(m.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply */}
      {ticket.status !== 'closed' ? (
        <div className="bg-white border border-border rounded-xl p-4 space-y-3">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendReply() }}
            placeholder="Add a reply… (Ctrl+Enter to send)"
            rows={3}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 placeholder-muted"
          />
          <button
            onClick={sendReply}
            disabled={sending || !reply.trim()}
            className="bg-brand text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-brand-deep transition-colors disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send reply'}
          </button>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl p-4 text-center text-sm text-muted">
          This ticket is closed.
          <Link href="/support" className="ml-1 text-brand hover:underline">
            Open a new ticket
          </Link>
        </div>
      )}
    </div>
  )
}
