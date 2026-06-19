'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { FileUploader, type UploadedFile } from '@/components/ui/FileUploader'
import { DeliveryFileList } from '@/components/ui/DeliveryFileList'

type OrderDetail = {
  order: {
    id: string
    orderNumber: string
    status: string
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
    internalNotes?: string | null
    createdAt: string
  }
  service: { title: string; slug: string; category: string }
  pkg: { name: string; deliveryDays: number; revisions: number; priceCents: number }
  client: { id: string; name: string; email: string }
  messages: {
    id: string
    senderId: string
    type: string
    body: string
    attachments?: { key: string; name: string; size: number }[]
    createdAt: string
  }[]
  milestones: {
    id: string
    title: string
    description?: string
    dueDate?: string
    completedAt?: string | null
  }[]
  deliveries: {
    id: string
    message: string
    files: { key: string; name: string; size: number }[]
    acceptedAt?: string | null
    createdAt: string
  }[]
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending', payment_received: 'Payment Received',
  requirements_needed: 'Requirements Needed', requirements_submitted: 'Requirements Submitted',
  assigned: 'Assigned', in_progress: 'In Progress', waiting_for_client: 'Waiting for Client',
  delivered: 'Delivered', revision_requested: 'Revision Requested',
  approved: 'Approved', completed: 'Completed', cancelled: 'Cancelled',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800', payment_received: 'bg-blue-100 text-blue-800',
  requirements_needed: 'bg-orange-100 text-orange-800', requirements_submitted: 'bg-sky-100 text-sky-800',
  assigned: 'bg-indigo-100 text-indigo-800', in_progress: 'bg-purple-100 text-purple-800',
  waiting_for_client: 'bg-amber-100 text-amber-800', delivered: 'bg-emerald-100 text-emerald-800',
  revision_requested: 'bg-rose-100 text-rose-800', approved: 'bg-teal-100 text-teal-800',
  completed: 'bg-green-100 text-green-800', cancelled: 'bg-surface text-muted',
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, mutate } = useSWR<OrderDetail>(`/cms/service-orders/${id}`)

  if (isLoading) return <LoadingState />
  if (!data) return (
    <div className="h-full flex items-center justify-center">
      <p className="text-sm text-muted">Order not found. <Link href="/admin/service-orders" className="text-brand hover:underline">← Back</Link></p>
    </div>
  )

  const { order, service, pkg, client, messages, milestones, deliveries } = data

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs text-muted mb-1">
            <Link href="/admin/service-orders" className="hover:text-brand transition-colors">Service Orders</Link>
            {' / '}{order.orderNumber}
          </p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-ink">{service.title}</h1>
              <p className="text-sm text-muted mt-0.5">{pkg.name} · {client.name}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLOR[order.status] ?? 'bg-surface text-muted'}`}>
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left sidebar: info + actions */}
          <div className="space-y-5">
            {/* Order info */}
            <div className="bg-white border border-border rounded-xl p-5">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">Order details</p>
              <dl className="space-y-2 text-xs">
                {[
                  ['Order #', order.orderNumber],
                  ['Value', `$${(order.priceCents / 100).toLocaleString()}`],
                  ['Package', pkg.name],
                  ['Delivery', `${pkg.deliveryDays} days`],
                  ['Revisions', `${order.revisionCount} / ${pkg.revisions}`],
                  ['Placed', fmt(order.createdAt)],
                  order.dueDate ? ['Due', fmt(order.dueDate)] : null,
                  order.assignedAt ? ['Assigned', fmt(order.assignedAt)] : null,
                  order.deliveredAt ? ['Delivered', fmt(order.deliveredAt)] : null,
                  order.completedAt ? ['Completed', fmt(order.completedAt)] : null,
                ].filter((row): row is [string, string] => Boolean(row)).map(([k, v]) => (
                  <div key={k as string} className="flex justify-between gap-3">
                    <dt className="text-muted shrink-0">{k}</dt>
                    <dd className="text-ink font-medium text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Client info */}
            <div className="bg-white border border-border rounded-xl p-5">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">Client</p>
              <p className="text-sm font-semibold text-ink">{client.name}</p>
              <p className="text-xs text-muted">{client.email}</p>
              {order.status !== 'pending' && order.status !== 'cancelled' && (
                <div className="mt-3 pt-3 border-t border-border">
                  <Link
                    href={`/admin/service-orders/${order.id}/invoice`}
                    target="_blank"
                    rel="noopener noreferrer"
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

            {/* Admin actions */}
            <AdminActions order={order} onRefresh={mutate} />
          </div>

          {/* Right: tabs */}
          <div className="lg:col-span-2">
            <AdminTabs
              orderId={id}
              status={order.status}
              messages={messages}
              milestones={milestones}
              deliveries={deliveries}
              requirements={order.requirementsData}
              internalNotes={order.internalNotes}
              onRefresh={mutate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Admin action panel ───────────────────────────────────────────────────────

function AdminActions({
  order,
  onRefresh,
}: {
  order: OrderDetail['order']
  onRefresh: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [showDeliver, setShowDeliver] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [testimonialSent, setTestimonialSent] = useState(false)
  const [assignForm, setAssignForm] = useState({ expertId: '', dueDate: '', internalNotes: '' })
  const [experts, setExperts] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    if (!showAssign || experts.length > 0) return
    api.get<{ id: string; name: string; role: string }[]>('/users')
      .then((rows) => setExperts(rows.filter((u) => u.role === 'expert')))
      .catch(() => {})
  }, [showAssign, experts.length])
  const [deliverForm, setDeliverForm] = useState({ message: '', isRevisionDelivery: false })
  const [deliverFiles, setDeliverFiles] = useState<UploadedFile[]>([])
  const [cancelReason, setCancelReason] = useState('')

  async function act(endpoint: string, body?: object) {
    setBusy(true)
    try {
      await api.post(`/cms/service-orders/${order.id}/${endpoint}`, body)
      onRefresh()
    } finally {
      setBusy(false)
    }
  }

  const { status } = order

  return (
    <div className="bg-white border border-border rounded-xl p-5 space-y-3">
      <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">Admin actions</p>

      {status === 'pending' && (
        <ActionButton onClick={() => act('payment-received')} busy={busy} label="Mark payment received" color="blue" />
      )}

      {(status === 'payment_received' || status === 'requirements_needed' || status === 'requirements_submitted') && (
        <>
          {!showAssign ? (
            <ActionButton onClick={() => setShowAssign(true)} busy={false} label="Assign expert & set due date" color="indigo" />
          ) : (
            <div className="space-y-2">
              <select
                value={assignForm.expertId}
                onChange={(e) => setAssignForm({ ...assignForm, expertId: e.target.value })}
                className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand/30"
              >
                <option value="">— Unassigned —</option>
                {experts.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
                {experts.length === 0 && <option disabled>Loading experts…</option>}
              </select>
              <input
                type="date"
                value={assignForm.dueDate}
                onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })}
                className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/30"
              />
              <textarea
                placeholder="Internal notes..."
                rows={2}
                value={assignForm.internalNotes}
                onChange={(e) => setAssignForm({ ...assignForm, internalNotes: e.target.value })}
                className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-brand/30"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => act('assign', { expertId: assignForm.expertId || undefined, dueDate: assignForm.dueDate || undefined, internalNotes: assignForm.internalNotes || undefined })}
                  disabled={busy}
                  className="flex-1 bg-indigo-600 text-white text-xs font-semibold py-1.5 rounded-lg disabled:opacity-50"
                >Assign</button>
                <button onClick={() => setShowAssign(false)} className="text-xs text-muted hover:text-ink">Cancel</button>
              </div>
            </div>
          )}
        </>
      )}

      {status === 'assigned' && (
        <ActionButton onClick={() => act('in-progress')} busy={busy} label="Mark in progress" color="purple" />
      )}

      {(status === 'in_progress' || status === 'revision_requested' || status === 'waiting_for_client') && (
        <>
          {!showDeliver ? (
            <ActionButton onClick={() => setShowDeliver(true)} busy={false} label="Submit delivery" color="emerald" />
          ) : (
            <div className="space-y-2">
              <textarea
                placeholder="Delivery message for client..."
                rows={3}
                value={deliverForm.message}
                onChange={(e) => setDeliverForm({ ...deliverForm, message: e.target.value })}
                className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-brand/30"
              />
              <FileUploader
                uploadUrlEndpoint={`/cms/service-orders/${order.id}/upload-url`}
                files={deliverFiles}
                onChange={setDeliverFiles}
              />
              <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={deliverForm.isRevisionDelivery}
                  onChange={(e) => setDeliverForm({ ...deliverForm, isRevisionDelivery: e.target.checked })}
                  className="accent-brand"
                />
                Revision delivery
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => act('deliver', { message: deliverForm.message, files: deliverFiles, isRevisionDelivery: deliverForm.isRevisionDelivery })}
                  disabled={busy || !deliverForm.message.trim()}
                  className="flex-1 bg-emerald-600 text-white text-xs font-semibold py-1.5 rounded-lg disabled:opacity-50"
                >Submit delivery</button>
                <button onClick={() => { setShowDeliver(false); setDeliverFiles([]) }} className="text-xs text-muted hover:text-ink">Cancel</button>
              </div>
            </div>
          )}
        </>
      )}

      {!showCancel ? (
        status !== 'completed' && status !== 'cancelled' && (
          <button
            onClick={() => setShowCancel(true)}
            className="w-full text-xs font-medium text-rose-600 border border-rose-100 bg-rose-50 py-1.5 rounded-lg hover:bg-rose-100 transition-colors"
          >
            Cancel order
          </button>
        )
      ) : (
        <div className="space-y-2">
          <textarea
            placeholder="Cancellation reason..."
            rows={2}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full text-xs border border-rose-200 rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-rose-300"
          />
          <div className="flex gap-2">
            <button
              onClick={() => act('cancel', { reason: cancelReason })}
              disabled={busy || !cancelReason.trim()}
              className="flex-1 bg-rose-600 text-white text-xs font-semibold py-1.5 rounded-lg disabled:opacity-50"
            >Confirm cancel</button>
            <button onClick={() => setShowCancel(false)} className="text-xs text-muted hover:text-ink">Cancel</button>
          </div>
        </div>
      )}

      {status === 'completed' && (
        <div className="pt-1 border-t border-border">
          {testimonialSent ? (
            <p className="text-xs text-center text-emerald-700 py-2 font-medium">Review request sent ✓</p>
          ) : (
            <button
              onClick={async () => {
                setBusy(true)
                try {
                  await api.post(`/cms/service-orders/${order.id}/request-testimonial`)
                  setTestimonialSent(true)
                } finally {
                  setBusy(false)
                }
              }}
              disabled={busy}
              className="w-full text-xs font-semibold text-[#1E3A8A] border border-[#1E3A8A]/20 bg-[#EFF3FF] py-2 rounded-lg hover:bg-[#E0E8FF] transition-colors disabled:opacity-50"
            >
              {busy ? 'Sending…' : 'Request testimonial'}
            </button>
          )}
        </div>
      )}

      {status === 'cancelled' && (
        <p className="text-xs text-center text-muted py-2">Order is cancelled.</p>
      )}
    </div>
  )
}

function ActionButton({
  onClick, busy, label, color,
}: {
  onClick: () => void; busy: boolean; label: string; color: string
}) {
  const classes: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
  }
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`w-full text-xs font-semibold text-white py-2 rounded-lg transition-colors disabled:opacity-50 ${classes[color]}`}
    >
      {label}
    </button>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function AdminTabs({
  orderId, status, messages, milestones, deliveries, requirements, internalNotes, onRefresh,
}: {
  orderId: string
  status: string
  messages: OrderDetail['messages']
  milestones: OrderDetail['milestones']
  deliveries: OrderDetail['deliveries']
  requirements?: Record<string, string>
  internalNotes?: string | null
  onRefresh: () => void
}) {
  const [tab, setTab] = useState<'messages' | 'milestones' | 'deliveries' | 'requirements'>('messages')

  const tabs = [
    { key: 'messages' as const, label: 'Messages', count: messages.filter((m) => m.type === 'message').length },
    { key: 'deliveries' as const, label: 'Deliveries', count: deliveries.length },
    { key: 'milestones' as const, label: 'Milestones', count: milestones.length },
    { key: 'requirements' as const, label: 'Requirements' },
  ]

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden" style={{ minHeight: 480 }}>
      <div className="flex border-b border-border overflow-x-auto no-scrollbar">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === key ? 'border-brand text-brand bg-brand-dim/20' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span className="text-[9px] bg-brand/10 text-brand px-1.5 rounded-full">{count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 520 }}>
        {tab === 'messages' && <AdminMessagesTab orderId={orderId} status={status} messages={messages} onRefresh={onRefresh} />}
        {tab === 'deliveries' && <DeliveriesReadonly orderId={orderId} deliveries={deliveries} />}
        {tab === 'milestones' && <AdminMilestonesTab orderId={orderId} milestones={milestones} onRefresh={onRefresh} />}
        {tab === 'requirements' && (
          <div className="p-5">
            {!requirements || Object.keys(requirements).length === 0 ? (
              <p className="text-sm text-muted text-center py-8">No requirements submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(requirements).map(([key, val]) => (
                  <div key={key} className="bg-surface border border-border rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">{key}</p>
                    <p className="text-sm text-ink">{val}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function AdminMessagesTab({
  orderId, status, messages, onRefresh,
}: {
  orderId: string; status: string; messages: OrderDetail['messages']; onRefresh: () => void
}) {
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)

  async function send() {
    if (!msg.trim()) return
    setSending(true)
    try {
      await api.post(`/cms/service-orders/${orderId}/messages`, { body: msg, attachments: [] })
      setMsg('')
      onRefresh()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 300 }}>
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted py-8">No messages yet.</p>
        )}
        {messages.map((m) => {
          if (m.type === 'system') {
            return (
              <div key={m.id} className="text-center">
                <span className="text-[10px] bg-surface border border-border px-2 py-0.5 rounded-full text-muted">{m.body}</span>
              </div>
            )
          }
          return (
            <div key={m.id} className="bg-surface border border-border rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-ink uppercase tracking-wider">
                  {m.type === 'delivery' ? 'Delivery' : m.type === 'revision_request' ? 'Revision request' : 'Message'}
                </span>
                <span className="text-[10px] text-muted">{fmt(m.createdAt)}</span>
              </div>
              <p className="text-xs text-ink">{m.body}</p>
            </div>
          )
        })}
      </div>
      {status !== 'completed' && status !== 'cancelled' && (
        <div className="border-t border-border p-3 flex gap-2">
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={2}
            placeholder="Message to client..."
            className="flex-1 text-xs border border-border rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-brand/30"
          />
          <button
            onClick={send}
            disabled={sending || !msg.trim()}
            className="shrink-0 bg-brand text-white text-xs font-semibold px-3 rounded-lg disabled:opacity-50 self-end py-1.5"
          >
            Send
          </button>
        </div>
      )}
    </div>
  )
}

function AdminMilestonesTab({
  orderId, milestones, onRefresh,
}: {
  orderId: string; milestones: OrderDetail['milestones']; onRefresh: () => void
}) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' })
  const [busy, setBusy] = useState(false)

  async function add() {
    setBusy(true)
    try {
      await api.post(`/cms/service-orders/${orderId}/milestones`, {
        title: form.title,
        description: form.description || undefined,
        dueDate: form.dueDate || undefined,
      })
      setForm({ title: '', description: '', dueDate: '' })
      setAdding(false)
      onRefresh()
    } finally {
      setBusy(false)
    }
  }

  async function complete(milestoneId: string) {
    await api.patch(`/cms/service-orders/milestones/${milestoneId}/complete`)
    onRefresh()
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">{milestones.length} milestone{milestones.length !== 1 ? 's' : ''}</span>
        <button onClick={() => setAdding(!adding)} className="text-xs text-brand hover:underline">
          {adding ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {adding && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
          <input
            placeholder="Milestone title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/30"
          />
          <input
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/30"
          />
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/30"
          />
          <button
            onClick={add}
            disabled={busy || !form.title.trim()}
            className="bg-brand text-white text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            Add milestone
          </button>
        </div>
      )}

      {milestones.length === 0 ? (
        <p className="text-center text-xs text-muted py-6">No milestones set.</p>
      ) : (
        milestones.map((m) => (
          <div key={m.id} className={`flex items-start justify-between gap-3 p-3 rounded-xl border ${m.completedAt ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-border'}`}>
            <div className="min-w-0">
              <p className={`text-xs font-semibold ${m.completedAt ? 'line-through text-muted' : 'text-ink'}`}>{m.title}</p>
              {m.description && <p className="text-[11px] text-muted mt-0.5">{m.description}</p>}
              {m.dueDate && <p className="text-[10px] text-muted mt-0.5">Due {new Date(m.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>}
            </div>
            {!m.completedAt && (
              <button
                onClick={() => complete(m.id)}
                className="text-[10px] font-semibold text-emerald-700 shrink-0 hover:underline"
              >
                Complete
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}

function DeliveriesReadonly({ orderId, deliveries }: { orderId: string; deliveries: OrderDetail['deliveries'] }) {
  if (deliveries.length === 0) {
    return <p className="text-center text-xs text-muted py-8">No deliveries yet.</p>
  }
  return (
    <div className="p-4 space-y-3">
      {deliveries.map((d, i) => (
        <div key={d.id} className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-ink">Delivery #{deliveries.length - i}</span>
            <div className="flex items-center gap-2">
              {d.acceptedAt && <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">Accepted</span>}
              <span className="text-[10px] text-muted">{fmt(d.createdAt)}</span>
            </div>
          </div>
          <p className="text-xs text-ink">{d.message}</p>
          {d.files.length > 0 && (
            <DeliveryFileList
              orderId={orderId}
              files={d.files}
              downloadUrlBase={`/cms/service-orders/${orderId}/files/download-url`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-5xl animate-pulse space-y-5">
        <div className="h-4 w-40 bg-surface rounded" />
        <div className="h-8 w-64 bg-surface rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-surface rounded-xl" />)}
        </div>
      </div>
    </div>
  )
}
