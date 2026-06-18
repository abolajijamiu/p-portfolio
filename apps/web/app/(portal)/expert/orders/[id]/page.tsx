'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { FileUploader, type UploadedFile } from '@/components/ui/FileUploader'
import { DeliveryFileList } from '@/components/ui/DeliveryFileList'

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderDetail = {
  order: {
    id: string; orderNumber: string; status: string
    priceCents: number; dueDate?: string | null
    requirementsData?: Record<string, string> | null
    revisionCount: number; createdAt: string
  }
  service: { title: string; slug: string; category: string }
  pkg: { name: string; deliveryDays: number; revisions: number }
  client: { name: string; email: string }
  messages: { id: string; type: string; body?: string | null; senderId: string; createdAt: string }[]
  milestones: { id: string; title: string; description?: string | null; dueDate?: string | null; completedAt?: string | null }[]
  deliveries: { id: string; message: string; isRevisionDelivery: boolean; createdAt: string; files: { name: string; key: string }[] }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  assigned: 'bg-indigo-50 text-indigo-700',
  in_progress: 'bg-purple-50 text-purple-700',
  waiting_for_client: 'bg-amber-50 text-amber-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  revision_requested: 'bg-rose-50 text-rose-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-surface text-muted',
}

const STATUS_LABEL: Record<string, string> = {
  requirements_submitted: 'Requirements received',
  assigned: 'Assigned',
  in_progress: 'In progress',
  waiting_for_client: 'Waiting for client',
  delivered: 'Delivered',
  revision_requested: 'Revision requested',
  approved: 'Approved',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'messages' | 'deliver' | 'requirements'

export default function ExpertOrderPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { data, isLoading, mutate } = useSWR<OrderDetail>(`/expert/orders/${id}`)
  const [tab, setTab] = useState<Tab>('messages')
  const [msgText, setMsgText] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const [deliveryMsg, setDeliveryMsg] = useState('')
  const [deliveryFiles, setDeliveryFiles] = useState<UploadedFile[]>([])
  const [delivering, setDelivering] = useState(false)
  const [markingProgress, setMarkingProgress] = useState(false)
  const msgEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (data) document.title = `${data.service.title} — Expert Workspace`
  }, [data])

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages.length])

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="space-y-2 w-72">
          <div className="h-5 bg-surface rounded animate-pulse" />
          <div className="h-3 w-40 bg-surface rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const { order, service, pkg, client, messages, milestones, deliveries } = data
  const isRevision = order.status === 'revision_requested'
  const canDeliver = ['in_progress', 'assigned', 'revision_requested'].includes(order.status)
  const canMarkProgress = ['assigned', 'requirements_submitted'].includes(order.status)
  const isDone = ['completed', 'cancelled'].includes(order.status)

  async function sendMessage() {
    if (!msgText.trim()) return
    setSendingMsg(true)
    try {
      await api.post(`/expert/orders/${id}/messages`, { body: msgText, attachments: [] })
      setMsgText('')
      mutate()
    } finally {
      setSendingMsg(false)
    }
  }

  async function markInProgress() {
    setMarkingProgress(true)
    try {
      await api.post(`/expert/orders/${id}/in-progress`)
      mutate()
    } finally {
      setMarkingProgress(false)
    }
  }

  async function deliver() {
    if (!deliveryMsg.trim()) return
    setDelivering(true)
    try {
      await api.post(`/expert/orders/${id}/deliver`, {
        message: deliveryMsg,
        files: deliveryFiles,
        isRevisionDelivery: isRevision,
      })
      setDeliveryMsg('')
      setDeliveryFiles([])
      mutate()
      setTab('messages')
    } finally {
      setDelivering(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-4xl">

        {/* Back + header */}
        <div className="mb-6">
          <button onClick={() => router.push('/expert/orders')} className="text-xs text-muted hover:text-brand transition-colors mb-3 inline-block">
            ← My orders
          </button>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-ink tracking-tight">{service.title}</h1>
              <p className="text-xs text-muted mt-1 font-mono">{order.orderNumber}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLOR[order.status] ?? 'bg-surface text-muted'}`}>
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
          </div>
        </div>

        {/* Info bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            ['Client', client.name],
            ['Package', pkg.name],
            ['Due', order.dueDate ? fmtDate(order.dueDate) : '—'],
            ['Revisions', `${order.revisionCount} / ${pkg.revisions}`],
          ].map(([label, value]) => (
            <div key={label as string} className="bg-white border border-border rounded-xl px-3 py-3">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-0.5">{label}</p>
              <p className="text-sm font-medium text-ink">{value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        {!isDone && (
          <div className="flex flex-wrap gap-2 mb-6">
            {canMarkProgress && (
              <button
                onClick={markInProgress}
                disabled={markingProgress}
                className="text-xs font-semibold bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {markingProgress ? 'Updating…' : 'Mark in progress'}
              </button>
            )}
            {canDeliver && (
              <button
                onClick={() => setTab('deliver')}
                className="text-xs font-semibold bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700"
              >
                {isRevision ? 'Submit revision' : 'Deliver order'}
              </button>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5 border-b border-border">
          {([
            ['messages', `Messages (${messages.length})`],
            ['deliver', isRevision ? 'Submit revision' : 'Deliver'],
            ['requirements', 'Requirements'],
          ] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'messages' && (
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted">No messages yet.</div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user?.id
                  const isSystem = msg.type === 'system'
                  if (isSystem) {
                    return (
                      <div key={msg.id} className="px-4 py-2.5 flex justify-center">
                        <span className="text-[11px] text-muted bg-surface px-3 py-1 rounded-full">{msg.body}</span>
                      </div>
                    )
                  }
                  return (
                    <div key={msg.id} className={`px-4 py-3 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-brand text-white' : 'bg-surface text-ink'}`}>
                        {msg.type === 'delivery' && (
                          <p className="text-[10px] font-semibold opacity-70 mb-1 uppercase tracking-wider">
                            {isMe ? 'You delivered' : 'Delivery'}
                          </p>
                        )}
                        {msg.type === 'revision_request' && (
                          <p className="text-[10px] font-semibold opacity-70 mb-1 uppercase tracking-wider">Revision requested</p>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-muted'}`}>{fmtTime(msg.createdAt)}</p>
                        {msg.type === 'delivery' && (() => {
                          const matched = deliveries.find((d) =>
                            d.createdAt.slice(0, 16) === msg.createdAt.slice(0, 16) && d.files.length > 0
                          )
                          return matched ? (
                            <div className="mt-2">
                              <DeliveryFileList
                                orderId={id}
                                files={matched.files}
                                downloadUrlBase={`/expert/orders/${id}/files/download-url`}
                              />
                            </div>
                          ) : null
                        })()}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={msgEndRef} />
            </div>
            {!isDone && (
              <div className="border-t border-border p-3 flex gap-2">
                <textarea
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  rows={2}
                  placeholder="Message the client…"
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={sendingMsg || !msgText.trim()}
                  className="self-end px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand/90 disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'deliver' && (
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-ink mb-4">
              {isRevision ? 'Submit revision delivery' : 'Deliver this order'}
            </h3>
            {isRevision && (
              <div className="mb-4 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 text-xs text-rose-700">
                Client requested a revision. Revisions used: {order.revisionCount} / {pkg.revisions}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Delivery message</label>
                <textarea
                  value={deliveryMsg}
                  onChange={(e) => setDeliveryMsg(e.target.value)}
                  placeholder="Describe what you've delivered, any important notes for the client…"
                  rows={4}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Attach files</label>
                <FileUploader
                  uploadUrlEndpoint={`/expert/orders/${id}/upload-url`}
                  files={deliveryFiles}
                  onChange={setDeliveryFiles}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setTab('messages'); setDeliveryFiles([]) }} className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-ink">
                Cancel
              </button>
              <button
                onClick={deliver}
                disabled={delivering || !deliveryMsg.trim()}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                {delivering ? 'Delivering…' : isRevision ? 'Submit revision' : 'Deliver'}
              </button>
            </div>
          </div>
        )}

        {tab === 'requirements' && (
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-ink mb-4">Client requirements</h3>
            {!order.requirementsData || Object.keys(order.requirementsData).length === 0 ? (
              <p className="text-sm text-muted">No requirements submitted yet.</p>
            ) : (
              <dl className="space-y-4">
                {Object.entries(order.requirementsData).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">{key}</dt>
                    <dd className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
