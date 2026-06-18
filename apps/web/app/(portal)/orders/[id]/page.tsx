'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import {
  ArrowRightIcon, CheckIcon, MessageSquareIcon, CalendarIcon,
  DocumentIcon, ShieldCheckIcon, LayersIcon, XIcon,
} from '@/components/ui/Icons'
import { DeliveryFileList } from '@/components/ui/DeliveryFileList'

// ─── Types ───────────────────────────────────────────────────────────────────

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

type Order = {
  order: {
    id: string
    orderNumber: string
    status: OrderStatus
    priceCents: number
    currency: string
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
  client: { name: string; email: string }
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

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OrderWorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'inbox' | 'milestones' | 'deliveries' | 'requirements'>('inbox')

  // Detect Stripe redirect query param
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

  if (loading) return <OrderSkeleton />
  if (error || !order) return <OrderError message={error ?? 'Order not found'} />

  const currentWeight = STATUS_WEIGHT[order.order.status]
  const isCancelled = order.order.status === 'cancelled'

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
            <span className="text-sm font-semibold text-ink truncate">{order.order.orderNumber}</span>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.order.status]}`}>
            {STATUS_LABELS[order.order.status]}
          </span>
        </div>
      </div>

      {/* Payment feedback banner */}
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

        {/* ── Left: details + timeline ── */}
        <div className="lg:col-span-1 space-y-5">

          {/* Order card */}
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-muted mb-0.5">{order.service.category.replace('_', ' & ')}</p>
                <p className="text-[15px] font-semibold text-ink leading-snug">{order.service.title}</p>
                <p className="text-xs text-muted mt-0.5">{order.pkg.name} package</p>
              </div>
              <p className="text-lg font-bold text-ink shrink-0">
                ${(order.order.priceCents / 100).toLocaleString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs pt-4 border-t border-border">
              <div>
                <p className="text-muted mb-0.5">Order</p>
                <p className="font-mono font-semibold text-ink">{order.order.orderNumber}</p>
              </div>
              <div>
                <p className="text-muted mb-0.5">Placed</p>
                <p className="font-medium text-ink">{new Date(order.order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              {order.order.dueDate && (
                <div>
                  <p className="text-muted mb-0.5">Due</p>
                  <p className="font-medium text-ink">{new Date(order.order.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              )}
              <div>
                <p className="text-muted mb-0.5">Delivery</p>
                <p className="font-medium text-ink">{order.pkg.deliveryDays} days</p>
              </div>
              {order.order.revisionCount > 0 && (
                <div>
                  <p className="text-muted mb-0.5">Revisions</p>
                  <p className="font-medium text-ink">{order.order.revisionCount} / {order.pkg.revisions}</p>
                </div>
              )}
            </div>
            {order.order.status !== 'pending' && order.order.status !== 'cancelled' && (
              <div className="pt-4 border-t border-border mt-4">
                <Link
                  href={`/orders/${id}/invoice`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand/80 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  View Invoice
                </Link>
              </div>
            )}
          </div>

          {/* Progress tracker */}
          {!isCancelled && (
            <div className="bg-white rounded-xl border border-border p-5">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Progress</p>
              <div className="space-y-3">
                {STATUS_STEPS.map(({ key, label }, i) => {
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

          {/* Action buttons */}
          <ActionPanel order={order} onRefresh={load} />
        </div>

        {/* ── Right: tabbed workspace ── */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white rounded-xl border border-border overflow-hidden flex flex-col" style={{ minHeight: '600px' }}>
            {/* Tabs */}
            <div className="flex border-b border-border overflow-x-auto no-scrollbar">
              {[
                { key: 'inbox' as const, label: 'Inbox', icon: MessageSquareIcon, count: order.messages.filter((m) => m.type === 'message').length },
                { key: 'deliveries' as const, label: 'Deliveries', icon: DocumentIcon, count: order.deliveries.length },
                { key: 'milestones' as const, label: 'Milestones', icon: LayersIcon, count: order.milestones.length },
                { key: 'requirements' as const, label: 'Requirements', icon: ShieldCheckIcon },
              ].map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
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
              {activeTab === 'inbox' && <InboxTab order={order} onRefresh={load} />}
              {activeTab === 'deliveries' && <DeliveriesTab orderId={order.order.id} deliveries={order.deliveries} />}
              {activeTab === 'milestones' && <MilestonesTab milestones={order.milestones} />}
              {activeTab === 'requirements' && <RequirementsTab order={order} />}
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
        <p className="text-xs text-emerald-700 mt-1">
          Completed {order.order.completedAt ? new Date(order.order.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
        </p>
      </div>
    )
  }

  if (status === 'delivered') {
    return (
      <div className="bg-white rounded-xl border border-border p-5 space-y-3">
        <p className="text-sm font-semibold text-ink">Review delivery</p>
        <p className="text-xs text-muted leading-relaxed">
          Your delivery is ready. Review the files and either approve to complete the order, or request a revision.
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
        <p className="text-xs text-amber-700 mb-3">Please submit your project requirements so we can get started.</p>
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

function InboxTab({ order, onRefresh }: { order: Order; onRefresh: () => void }) {
  const orderId = order.order.id
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [order.messages.length])

  async function send() {
    if (!message.trim()) return
    setSending(true)
    try {
      await api.post(`/service-orders/${order.order.id}/messages`, { body: message, attachments: [] })
      setMessage('')
      onRefresh()
    } finally {
      setSending(false)
    }
  }

  const msgs = order.messages

  return (
    <div className="flex flex-col h-full" style={{ minHeight: '520px' }}>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.length === 0 && (
          <div className="text-center py-12 text-muted text-sm">No messages yet. Start the conversation below.</div>
        )}
        {msgs.map((msg) => {
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
            const matchedDelivery = order.deliveries.find((d) =>
              d.createdAt.slice(0, 16) === msg.createdAt.slice(0, 16) && d.files.length > 0
            )
            return (
              <div key={msg.id} className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Delivery</span>
                  <span className="text-[11px] text-muted">{fmt(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-ink">{msg.body}</p>
                {matchedDelivery && matchedDelivery.files.length > 0 && (
                  <DeliveryFileList orderId={orderId} files={matchedDelivery.files} />
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
          const isMe = msg.senderId === order.client?.name
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${isMe ? 'bg-brand text-white' : 'bg-surface border border-border text-ink'}`}>
                <p className="text-sm leading-relaxed">{msg.body}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-white/50' : 'text-muted'}`}>{fmt(msg.createdAt)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {order.order.status !== 'completed' && order.order.status !== 'cancelled' && (
        <div className="border-t border-border p-4 flex gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send() }}
            placeholder="Send a message... (Ctrl+Enter to send)"
            rows={2}
            className="flex-1 text-sm border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 placeholder-muted"
          />
          <button
            onClick={send}
            disabled={sending || !message.trim()}
            className="shrink-0 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-deep transition-colors disabled:opacity-50 self-end"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </button>
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
        No deliveries yet. Files will appear here when the expert delivers work.
      </div>
    )
  }

  return (
    <div className="p-5 space-y-5">
      {deliveries.map((d, i) => (
        <div key={d.id} className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-ink">Delivery #{deliveries.length - i}</span>
            <div className="flex items-center gap-2">
              {d.acceptedAt && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Accepted</span>
              )}
              <span className="text-[11px] text-muted">{fmt(d.createdAt)}</span>
            </div>
          </div>
          <p className="text-sm text-ink mb-3 leading-relaxed">{d.message}</p>
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
        No milestones set. Your expert may add milestones once work begins.
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
                Due {new Date(m.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
            {m.completedAt && (
              <p className="text-[11px] text-emerald-700 mt-1">
                Completed {new Date(m.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Requirements tab ─────────────────────────────────────────────────────────

function RequirementsTab({ order }: { order: Order }) {
  const [fields, setFields] = useState<Record<string, string>>(order.order.requirementsData ?? {})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(!!order.order.requirementsSubmittedAt)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post(`/service-orders/${order.order.id}/requirements`, { requirementsData: fields })
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted || order.order.requirementsSubmittedAt) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckIcon className="h-6 w-6 text-emerald-600" />
        </div>
        <p className="text-sm font-semibold text-ink mb-1">Requirements submitted</p>
        <p className="text-xs text-muted">Our team will review and assign an expert shortly.</p>
        {Object.keys(order.order.requirementsData ?? {}).length > 0 && (
          <div className="mt-6 text-left space-y-3">
            {Object.entries(order.order.requirementsData ?? {}).map(([key, val]) => (
              <div key={key} className="bg-surface border border-border rounded-lg p-3">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">{key}</p>
                <p className="text-sm text-ink">{val}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const placeholders: Record<string, string> = {
    text: 'Enter your answer...',
    url: 'https://',
    textarea: 'Provide as much detail as possible...',
    file: 'Paste a link or describe the file...',
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        Please fill in all required fields so we can assign the right expert and start work.
      </div>
      {[
        { label: 'Website URL', fieldType: 'url', required: true },
        { label: 'Project details', fieldType: 'textarea', required: true },
        { label: 'Brand assets or references', fieldType: 'text', required: false },
      ].map((req) => (
        <div key={req.label}>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {req.label}
            {req.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
          {req.fieldType === 'textarea' ? (
            <textarea
              rows={4}
              value={fields[req.label] ?? ''}
              onChange={(e) => setFields({ ...fields, [req.label]: e.target.value })}
              placeholder={placeholders.textarea}
              required={req.required}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
            />
          ) : (
            <input
              type={req.fieldType === 'url' ? 'url' : 'text'}
              value={fields[req.label] ?? ''}
              onChange={(e) => setFields({ ...fields, [req.label]: e.target.value })}
              placeholder={placeholders[req.fieldType] ?? ''}
              required={req.required}
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
        {submitting ? 'Submitting...' : 'Submit Requirements'}
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
        <p className="text-sm text-muted">Loading order...</p>
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
