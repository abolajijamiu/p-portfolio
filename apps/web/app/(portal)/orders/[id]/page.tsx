'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { FileUploader, type UploadedFile } from '@/components/ui/FileUploader'
import { DeliveryFileList } from '@/components/ui/DeliveryFileList'
import {
  CheckIcon, MessageSquareIcon, CalendarIcon,
  DocumentIcon, ShieldCheckIcon, LayersIcon, XIcon,
} from '@/components/ui/Icons'

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus =
  | 'pending' | 'payment_received' | 'requirements_needed' | 'requirements_submitted'
  | 'assigned' | 'in_progress' | 'waiting_for_client' | 'delivered'
  | 'revision_requested' | 'approved' | 'completed' | 'cancelled'

type Message = {
  id: string
  senderId: string
  type: 'message' | 'system' | 'delivery' | 'revision_request' | 'revision_delivery'
  body: string
  attachments?: { key: string; name: string; size: number }[]
  createdAt: string
}

type Milestone = {
  id: string
  title: string
  description?: string
  dueDate?: string
  completedAt?: string | null
}

type Delivery = {
  id: string
  message: string
  files: { key: string; name: string; size: number }[]
  acceptedAt?: string | null
  createdAt: string
}

type Requirement = { label: string; fieldType: string; required: boolean }

type Order = {
  order: {
    id: string
    orderNumber: string
    status: OrderStatus
    priceCents: number
    currency: string
    serviceId: string
    requirementsData?: Record<string, string>
    requirementsSubmittedAt?: string | null
    assignedAt?: string | null
    dueDate?: string | null
    deliveredAt?: string | null
    completedAt?: string | null
    cancelledAt?: string | null
    cancelReason?: string | null
    revisionCount: number
    createdAt: string
  }
  service: { title: string; slug: string; category: string }
  pkg: { name: string; deliveryDays: number; revisions: number }
  client: { id: string; name: string; email: string }
  expert: { name: string; avatarUrl?: string | null } | null
  requirements: Requirement[]
  messages: Message[]
  milestones: Milestone[]
  deliveries: Delivery[]
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'payment_received', label: 'Payment Confirmed' },
  { key: 'requirements_submitted', label: 'Requirements Sent' },
  { key: 'assigned', label: 'Expert Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
]

const STATUS_WEIGHT: Record<OrderStatus, number> = {
  pending: 0, payment_received: 1, requirements_needed: 1,
  requirements_submitted: 2, assigned: 3, in_progress: 4,
  waiting_for_client: 4, delivered: 5, revision_requested: 5,
  approved: 6, completed: 6, cancelled: -1,
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Awaiting Payment',
  payment_received: 'Payment Received',
  requirements_needed: 'Requirements Needed',
  requirements_submitted: 'Requirements Submitted',
  assigned: 'Expert Assigned',
  in_progress: 'In Progress',
  waiting_for_client: 'Waiting for You',
  delivered: 'Delivered — Review Required',
  revision_requested: 'Revision Requested',
  approved: 'Approved',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  payment_received: 'bg-blue-100 text-blue-800',
  requirements_needed: 'bg-orange-100 text-orange-800',
  requirements_submitted: 'bg-sky-100 text-sky-800',
  assigned: 'bg-indigo-100 text-indigo-800',
  in_progress: 'bg-purple-100 text-purple-800',
  waiting_for_client: 'bg-amber-100 text-amber-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  revision_requested: 'bg-rose-100 text-rose-800',
  approved: 'bg-teal-100 text-teal-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OrderWorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'inbox' | 'milestones' | 'deliveries' | 'requirements'>('inbox')

  const searchParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null
  const paymentResult = searchParams?.get('payment')

  const load = useCallback(async () => {
    try {
      const data = await api.get<Order>(`/service-orders/${id}`)
      setOrder(data)
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status === 401) router.push('/login')
      else setError('Failed to load order.')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (order) document.title = `${order.order.orderNumber} — ${order.service.title}`
  }, [order])

  if (loading) return <OrderSkeleton />
  if (error || !order) return <OrderError message={error ?? 'Order not found'} />

  const currentWeight = STATUS_WEIGHT[order.order.status]
  const isCancelled = order.order.status === 'cancelled'
  const isExpertAssigned = ['assigned', 'in_progress', 'waiting_for_client', 'delivered', 'revision_requested', 'approved', 'completed'].includes(order.order.status)

  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-border">
        <div className="px-4 md:px-8 h-14 flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/orders" className="text-muted hover:text-ink transition-colors text-sm shrink-0">
              ← Orders
            </Link>
            <span className="text-muted/40 shrink-0">/</span>
            <span className="text-sm font-semibold text-ink font-mono truncate">{order.order.orderNumber}</span>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.order.status]}`}>
            {STATUS_LABELS[order.order.status]}
          </span>
        </div>
      </div>

      {/* Payment feedback banners */}
      {paymentResult === 'success' && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3 text-center">
          <p className="text-sm font-medium text-emerald-800">
            Payment confirmed — we have your order and will assign an expert shortly.
          </p>
        </div>
      )}
      {paymentResult === 'cancelled' && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 text-center">
          <p className="text-sm font-medium text-amber-800">
            Payment was cancelled. Your order is still pending — complete checkout to proceed.
          </p>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left sidebar ── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Order card */}
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-0.5">
                  {order.service.category.replace('_', ' & ')}
                </p>
                <p className="text-[15px] font-semibold text-ink leading-snug">{order.service.title}</p>
                <p className="text-xs text-muted mt-0.5">{order.pkg.name} package</p>
              </div>
              <p className="text-lg font-bold text-ink shrink-0">
                ${(order.order.priceCents / 100).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs pt-4 border-t border-border">
              <div>
                <p className="text-muted mb-0.5">Order</p>
                <p className="font-mono font-semibold text-ink">{order.order.orderNumber}</p>
              </div>
              <div>
                <p className="text-muted mb-0.5">Placed</p>
                <p className="font-medium text-ink">{fmtDate(order.order.createdAt)}</p>
              </div>
              {order.order.dueDate && (
                <div>
                  <p className="text-muted mb-0.5">Due date</p>
                  <p className="font-medium text-ink">{fmtDate(order.order.dueDate)}</p>
                </div>
              )}
              <div>
                <p className="text-muted mb-0.5">Delivery</p>
                <p className="font-medium text-ink">{order.pkg.deliveryDays} days</p>
              </div>
              <div>
                <p className="text-muted mb-0.5">Revisions</p>
                <p className="font-medium text-ink">{order.order.revisionCount} / {order.pkg.revisions} used</p>
              </div>
            </div>

            {order.order.status !== 'pending' && order.order.status !== 'cancelled' && (
              <div className="pt-4 border-t border-border mt-4">
                <Link
                  href={`/orders/${id}/invoice`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand/80 transition-colors"
                >
                  <DocumentIcon className="h-3.5 w-3.5" />
                  View invoice
                </Link>
              </div>
            )}
          </div>

          {/* Expert card — shown once assigned */}
          {isExpertAssigned && (
            <div className="bg-white rounded-xl border border-border p-5">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">Your expert</p>
              {order.expert ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-dim border border-brand/20 flex items-center justify-center shrink-0">
                    {order.expert.avatarUrl ? (
                      <img src={order.expert.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-brand">
                        {order.expert.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{order.expert.name}</p>
                    <p className="text-xs text-muted">Assigned {order.order.assignedAt ? fmtDate(order.order.assignedAt) : ''}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Active
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface border border-border" />
                  <div>
                    <p className="text-sm font-medium text-ink">Expert assigned</p>
                    <p className="text-xs text-muted">Profile loading…</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress tracker */}
          {!isCancelled && (
            <div className="bg-white rounded-xl border border-border p-5">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-4">Progress</p>
              <div className="space-y-3">
                {STATUS_STEPS.map(({ key, label }) => {
                  const stepWeight = STATUS_WEIGHT[key]
                  const done = currentWeight > stepWeight
                  const active = currentWeight === stepWeight
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        done ? 'bg-brand border-brand' : active ? 'border-brand bg-brand-dim' : 'border-border bg-white'
                      }`}>
                        {done && <CheckIcon className="h-3 w-3 text-white" />}
                        {active && <div className="w-2 h-2 rounded-full bg-brand" />}
                      </div>
                      <span className={`text-xs ${done || active ? 'text-ink font-medium' : 'text-muted'}`}>{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Cancelled notice */}
          {isCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-red-800 mb-1">Order Cancelled</p>
              {order.order.cancelReason && (
                <p className="text-sm text-red-700">{order.order.cancelReason}</p>
              )}
            </div>
          )}

          {/* Action panel */}
          <ActionPanel order={order} onRefresh={load} />
        </div>

        {/* ── Right: tabbed workspace ── */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white rounded-xl border border-border overflow-hidden flex flex-col" style={{ minHeight: '600px' }}>
            {/* Tabs */}
            <div className="flex border-b border-border overflow-x-auto no-scrollbar">
              {[
                { key: 'inbox' as const, label: 'Inbox', icon: MessageSquareIcon, count: order.messages.filter((m) => !m.type.startsWith('system')).length },
                { key: 'deliveries' as const, label: 'Deliveries', icon: DocumentIcon, count: order.deliveries.length },
                { key: 'milestones' as const, label: 'Milestones', icon: LayersIcon, count: order.milestones.length },
                { key: 'requirements' as const, label: 'Requirements', icon: ShieldCheckIcon },
              ].map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  data-tab={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-150 ${
                    activeTab === key
                      ? 'border-brand text-brand bg-brand-dim/30'
                      : 'border-transparent text-muted hover:text-ink hover:bg-surface'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {count !== undefined && count > 0 && (
                    <span className="text-[10px] font-bold bg-brand/10 text-brand px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === 'inbox' && (
                <InboxTab order={order} currentUserId={user?.id ?? ''} onRefresh={load} />
              )}
              {activeTab === 'deliveries' && (
                <DeliveriesTab orderId={order.order.id} deliveries={order.deliveries} />
              )}
              {activeTab === 'milestones' && (
                <MilestonesTab milestones={order.milestones} />
              )}
              {activeTab === 'requirements' && (
                <RequirementsTab order={order} onSwitch={() => setActiveTab('requirements')} />
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Action panel ─────────────────────────────────────────────────────────────

function ActionPanel({ order, onRefresh }: { order: Order; onRefresh: () => void }) {
  const [showRevision, setShowRevision] = useState(false)
  const [revisionReason, setRevisionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleApprove() {
    if (!confirm('Approve the delivery and complete this order?')) return
    setSubmitting(true)
    try {
      await api.post(`/service-orders/${order.order.id}/approve`)
      onRefresh()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRevision() {
    if (!revisionReason.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/service-orders/${order.order.id}/revision`, { reason: revisionReason })
      setRevisionReason('')
      setShowRevision(false)
      onRefresh()
    } finally {
      setSubmitting(false)
    }
  }

  const { status } = order.order

  if (status === 'completed') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
        <CheckIcon className="h-7 w-7 text-emerald-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-emerald-800">Order Completed</p>
        {order.order.completedAt && (
          <p className="text-xs text-emerald-700 mt-1">
            {fmtDate(order.order.completedAt)}
          </p>
        )}
        <Link
          href="/services"
          className="inline-flex mt-4 text-xs font-medium text-brand hover:text-brand-deep transition-colors"
        >
          Order another service →
        </Link>
      </div>
    )
  }

  if (status === 'delivered') {
    return (
      <div className="bg-white rounded-xl border border-border p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <p className="text-sm font-semibold text-ink">Delivery ready for review</p>
        </div>
        <p className="text-xs text-muted leading-relaxed">
          Review the files in the Deliveries tab. Approve to complete, or request a revision if changes are needed.
        </p>
        {showRevision ? (
          <>
            <textarea
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="Describe what needs to be changed..."
              rows={3}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
            />
            <div className="flex gap-2">
              <button
                onClick={handleRevision}
                disabled={submitting || !revisionReason.trim()}
                className="flex-1 bg-rose-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                Submit Revision
              </button>
              <button onClick={() => setShowRevision(false)} className="px-3 py-2.5 border border-border rounded-lg text-muted hover:text-ink transition-colors">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={submitting}
              className="flex-1 bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              Approve &amp; Complete
            </button>
            {order.order.revisionCount < order.pkg.revisions && (
              <button
                onClick={() => setShowRevision(true)}
                className="flex-1 border border-border text-ink text-sm font-medium py-2.5 rounded-lg hover:bg-surface transition-colors"
              >
                Request Revision
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  if (status === 'requirements_needed') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-amber-800 mb-1">Action required</p>
        <p className="text-xs text-amber-700 mb-3">Submit your project requirements so we can assign an expert and begin.</p>
        <button
          onClick={() => {
            const el = document.querySelector('[data-tab="requirements"]') as HTMLButtonElement | null
            el?.click()
          }}
          className="w-full bg-amber-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-amber-700 transition-colors"
        >
          Submit Requirements
        </button>
      </div>
    )
  }

  return null
}

// ─── Inbox tab ────────────────────────────────────────────────────────────────

function InboxTab({ order, currentUserId, onRefresh }: { order: Order; currentUserId: string; onRefresh: () => void }) {
  const orderId = order.order.id
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<UploadedFile[]>([])
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [order.messages.length])

  async function send() {
    if (!message.trim()) return
    setSending(true)
    try {
      await api.post(`/service-orders/${orderId}/messages`, {
        body: message,
        attachments: attachments.map((f) => ({ key: f.key, name: f.name, size: f.size })),
      })
      setMessage('')
      setAttachments([])
      onRefresh()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ minHeight: '520px' }}>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {order.messages.length === 0 && (
          <div className="text-center py-12 text-muted text-sm">No messages yet. Start the conversation below.</div>
        )}
        {order.messages.map((msg) => {
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="text-center py-1">
                <span className="text-[11px] text-muted bg-surface border border-border px-3 py-1 rounded-full inline-block">
                  {msg.body}
                </span>
              </div>
            )
          }

          if (msg.type === 'delivery') {
            const matched = order.deliveries.find((d) =>
              d.createdAt.slice(0, 16) === msg.createdAt.slice(0, 16)
            )
            return (
              <div key={msg.id} className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Delivery</span>
                  <span className="text-[11px] text-muted">{fmt(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-ink">{msg.body}</p>
                {matched && matched.files.length > 0 && (
                  <div className="mt-3">
                    <DeliveryFileList orderId={orderId} files={matched.files} />
                  </div>
                )}
              </div>
            )
          }

          if (msg.type === 'revision_request') {
            return (
              <div key={msg.id} className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Revision Request</span>
                  <span className="text-[11px] text-muted">{fmt(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-ink">{msg.body}</p>
              </div>
            )
          }

          const isMe = msg.senderId === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${isMe ? 'bg-brand text-white' : 'bg-surface border border-border text-ink'}`}>
                <p className="text-sm leading-relaxed">{msg.body}</p>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map((att) => (
                      <a
                        key={att.key}
                        href={`/api/service-orders/${orderId}/files/download-url?key=${encodeURIComponent(att.key)}&name=${encodeURIComponent(att.name)}`}
                        className={`flex items-center gap-2 text-[11px] font-medium underline underline-offset-2 ${isMe ? 'text-white/80' : 'text-brand'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <DocumentIcon className="h-3 w-3 shrink-0" />
                        {att.name}
                      </a>
                    ))}
                  </div>
                )}
                <p className={`text-[10px] mt-1 ${isMe ? 'text-white/50' : 'text-muted'}`}>{fmt(msg.createdAt)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {order.order.status !== 'completed' && order.order.status !== 'cancelled' && (
        <div className="border-t border-border p-4 space-y-3">
          <FileUploader
            uploadUrlEndpoint={`/service-orders/${orderId}/upload-url`}
            files={attachments}
            onChange={setAttachments}
            maxFiles={5}
          />
          <div className="flex gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send() }}
              placeholder="Send a message… (Ctrl+Enter to send)"
              rows={2}
              className="flex-1 text-sm border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 placeholder-muted"
            />
            <button
              onClick={send}
              disabled={sending || !message.trim()}
              className="shrink-0 self-end bg-brand text-white px-5 py-2 rounded-lg hover:bg-brand-deep transition-colors disabled:opacity-50 text-sm font-medium"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Deliveries tab ───────────────────────────────────────────────────────────

function DeliveriesTab({ orderId, deliveries }: { orderId: string; deliveries: Delivery[] }) {
  if (deliveries.length === 0) {
    return (
      <div className="p-8 text-center text-muted text-sm">
        <DocumentIcon className="h-8 w-8 mx-auto mb-3 text-muted/40" />
        <p>No deliveries yet. Files will appear here when the expert delivers work.</p>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-5">
      {deliveries.map((d, i) => (
        <div key={d.id} className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink">Delivery #{deliveries.length - i}</span>
              {d.acceptedAt && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Accepted</span>
              )}
            </div>
            <span className="text-[11px] text-muted">{fmt(d.createdAt)}</span>
          </div>
          <p className="text-sm text-ink mb-4 leading-relaxed">{d.message}</p>
          {d.files.length > 0 && (
            <DeliveryFileList orderId={orderId} files={d.files} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Milestones tab ───────────────────────────────────────────────────────────

function MilestonesTab({ milestones }: { milestones: Milestone[] }) {
  if (milestones.length === 0) {
    return (
      <div className="p-8 text-center text-muted text-sm">
        <CalendarIcon className="h-8 w-8 mx-auto mb-3 text-muted/40" />
        <p>No milestones set. Your expert may add milestones once work begins.</p>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-3">
      {milestones.map((m) => (
        <div
          key={m.id}
          className={`flex items-start gap-4 p-4 rounded-xl border ${m.completedAt ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-border'}`}
        >
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${m.completedAt ? 'bg-emerald-600 border-emerald-600' : 'border-border'}`}>
            {m.completedAt && <CheckIcon className="h-3.5 w-3.5 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${m.completedAt ? 'text-emerald-800 line-through' : 'text-ink'}`}>{m.title}</p>
            {m.description && <p className="text-xs text-muted mt-0.5">{m.description}</p>}
            {m.dueDate && (
              <p className="text-[11px] text-muted mt-1 flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                Due {fmtDate(m.dueDate)}
              </p>
            )}
            {m.completedAt && (
              <p className="text-[11px] text-emerald-700 mt-1">
                Completed {fmtDate(m.completedAt)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Requirements tab ─────────────────────────────────────────────────────────

function RequirementsTab({ order, onSwitch }: { order: Order; onSwitch: () => void }) {
  const fields: Requirement[] = order.requirements.length > 0
    ? order.requirements
    : [
        { label: 'Website URL', fieldType: 'url', required: true },
        { label: 'Project details', fieldType: 'textarea', required: true },
        { label: 'Brand assets or references', fieldType: 'text', required: false },
      ]

  const [values, setValues] = useState<Record<string, string>>(order.order.requirementsData ?? {})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(!!order.order.requirementsSubmittedAt)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post(`/service-orders/${order.order.id}/requirements`, { requirementsData: values })
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted || order.order.requirementsSubmittedAt) {
    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-ink mb-1">Requirements submitted</p>
          <p className="text-xs text-muted">Our team will review and assign an expert shortly.</p>
        </div>
        {Object.keys(order.order.requirementsData ?? {}).length > 0 && (
          <div className="space-y-3">
            {Object.entries(order.order.requirementsData ?? {}).map(([key, val]) => (
              <div key={key} className="bg-surface border border-border rounded-lg p-3">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">{key}</p>
                <p className="text-sm text-ink leading-relaxed">{val}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        Fill in all required fields so we can assign the right expert and start work.
      </div>
      {fields.map((field) => (
        <div key={field.label}>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {field.label}
            {field.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
          {field.fieldType === 'textarea' ? (
            <textarea
              rows={4}
              value={values[field.label] ?? ''}
              onChange={(e) => setValues({ ...values, [field.label]: e.target.value })}
              placeholder="Provide as much detail as possible..."
              required={field.required}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
            />
          ) : (
            <input
              type={field.fieldType === 'url' ? 'url' : 'text'}
              value={values[field.label] ?? ''}
              onChange={(e) => setValues({ ...values, [field.label]: e.target.value })}
              placeholder={field.fieldType === 'url' ? 'https://' : 'Enter your answer…'}
              required={field.required}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand text-white text-sm font-semibold py-3 rounded-lg hover:bg-brand-deep transition-colors disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit Requirements'}
      </button>
    </form>
  )
}

// ─── Skeletons / error ────────────────────────────────────────────────────────

function OrderSkeleton() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        <p className="text-sm text-muted">Loading order…</p>
      </div>
    </div>
  )
}

function OrderError({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <p className="text-sm font-semibold text-ink mb-1">{message}</p>
        <Link href="/orders" className="text-sm text-brand hover:underline">← Back to orders</Link>
      </div>
    </div>
  )
}
