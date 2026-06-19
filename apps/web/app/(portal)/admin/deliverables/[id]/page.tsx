'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { api } from '@/lib/api'

type Revision = {
  revision: {
    id: string
    version: number
    message: string
    files: { key: string; name: string; size: number }[]
    clientFeedback?: string | null
    createdAt: string
  }
  submitterName?: string | null
}

type DeliverableDetail = {
  deliverable: {
    id: string
    deliverableNumber: string
    title: string
    description?: string | null
    status: string
    version: number
    files: { key: string; name: string; size: number }[]
    internalNotes?: string | null
    assignedExpertId?: string | null
    submittedAt?: string | null
    approvedAt?: string | null
    createdAt: string
    updatedAt: string
  }
  orderId: string
  orderNumber: string
  clientId: string
  serviceTitle: string
  expertName?: string | null
  expertAvatar?: string | null
  revisions: Revision[]
}

type Expert = {
  id: string
  name: string
  email: string
  role: string
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-surface text-muted border-border',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
  submitted: 'bg-sky-50 text-sky-700 border-sky-200',
  revision_requested: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
}

const ADMIN_STATUSES = ['pending', 'in_progress', 'submitted', 'revision_requested', 'approved', 'completed']

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminDeliverableDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, mutate } = useSWR<DeliverableDetail>(`/cms/deliverables/${id}`)
  const { data: usersData } = useSWR<{ users: Expert[] }>('/cms/users?role=expert&limit=50')

  const [expertId, setExpertId] = useState('')
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const experts = (usersData?.users ?? []).filter(
    (u) => u.role === 'expert' || u.role === 'admin' || u.role === 'owner'
  )

  if (!data) {
    return (
      <div className="px-4 pt-6 pb-12 md:p-8">
        <div className="h-8 w-48 bg-border rounded animate-pulse mb-4" />
        <div className="h-40 bg-border/40 rounded-xl animate-pulse" />
      </div>
    )
  }

  const { deliverable, orderId, orderNumber, serviceTitle, clientId, expertName, revisions } = data

  async function save() {
    const patch: Record<string, string> = {}
    if (status && status !== deliverable.status) patch.status = status
    if (expertId) patch.assignedExpertId = expertId
    if (notes !== (deliverable.internalNotes ?? '')) patch.internalNotes = notes
    if (!Object.keys(patch).length) return

    setSaving(true)
    setError(null)
    try {
      await api.patch(`/cms/deliverables/${id}`, patch)
      await mutate()
      setExpertId('')
      setStatus('')
    } catch {
      setError('Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function downloadFile(key: string, name: string) {
    try {
      const res = await api.get<{ url: string }>(
        `/cms/deliverables/${id}/download-url?key=${encodeURIComponent(key)}&name=${encodeURIComponent(name)}`
      )
      window.open(res.url, '_blank')
    } catch {
      alert('Could not generate download link.')
    }
  }

  const currentNotes = notes !== '' ? notes : (deliverable.internalNotes ?? '')

  return (
    <div className="px-4 pt-6 pb-12 md:p-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted mb-6">
        <Link href="/admin/deliverables" className="hover:text-ink">Deliverables</Link>
        <span>/</span>
        <span className="text-ink font-medium">{deliverable.deliverableNumber}</span>
      </div>

      <div className="flex items-start gap-4 flex-wrap mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-ink tracking-tight">{deliverable.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs text-muted font-mono">{deliverable.deliverableNumber}</span>
            <span className="text-muted">·</span>
            <span className="text-xs text-muted">{serviceTitle}</span>
            <span className="text-muted">·</span>
            <span className="text-xs text-muted">Order {orderNumber}</span>
          </div>
        </div>
        <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${STATUS_COLOR[deliverable.status] ?? 'bg-surface text-muted border-border'}`}>
          {deliverable.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Current files */}
          {deliverable.files.length > 0 && (
            <section className="bg-white border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-ink mb-3">
                Current delivery — v{deliverable.version}
              </h2>
              <div className="space-y-2">
                {deliverable.files.map((f) => (
                  <div key={f.key} className="flex items-center justify-between gap-3 bg-surface rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm text-ink truncate">{f.name}</p>
                      <p className="text-xs text-muted">{fmtSize(f.size)}</p>
                    </div>
                    <button
                      onClick={() => downloadFile(f.key, f.name)}
                      className="text-xs text-brand hover:underline shrink-0"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
              {deliverable.submittedAt && (
                <p className="text-xs text-muted mt-3">Submitted {fmt(deliverable.submittedAt)}</p>
              )}
            </section>
          )}

          {/* Revision history / activity timeline */}
          <section className="bg-white border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-ink mb-4">Version history</h2>
            {revisions.length === 0 ? (
              <p className="text-sm text-muted">No submissions yet.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-5">
                  {[...revisions].reverse().map(({ revision, submitterName }) => (
                    <div key={revision.id} className="relative pl-9">
                      <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-brand" />
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="text-sm font-medium text-ink">
                            v{revision.version}
                            {revision.clientFeedback ? ' — Revision request' : ' — Submission'}
                          </p>
                          <p className="text-xs text-muted mt-0.5">{submitterName ?? 'Unknown'} · {fmt(revision.createdAt)}</p>
                        </div>
                      </div>
                      {revision.message && (
                        <p className="text-sm text-ink mt-2 bg-surface rounded-lg px-3 py-2">{revision.message}</p>
                      )}
                      {revision.clientFeedback && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                          <span className="font-semibold">Client feedback: </span>{revision.clientFeedback}
                        </p>
                      )}
                      {revision.files.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {revision.files.map((f) => (
                            <div key={f.key} className="flex items-center justify-between gap-3 bg-white border border-border rounded-lg px-3 py-1.5">
                              <p className="text-xs text-ink truncate">{f.name}</p>
                              <button
                                onClick={() => downloadFile(f.key, f.name)}
                                className="text-xs text-brand hover:underline shrink-0"
                              >
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right: management panel */}
        <div className="space-y-4">
          {/* Status change */}
          <section className="bg-white border border-border rounded-xl p-4">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Change status</h2>
            <select
              value={status || deliverable.status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30 bg-white"
            >
              {ADMIN_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </section>

          {/* Expert assignment */}
          <section className="bg-white border border-border rounded-xl p-4">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Expert</h2>
            {expertName && !expertId && (
              <p className="text-sm text-ink mb-2">{expertName}</p>
            )}
            <select
              value={expertId}
              onChange={(e) => setExpertId(e.target.value)}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30 bg-white"
            >
              <option value="">{expertName ? 'Reassign expert…' : 'Assign expert…'}</option>
              {experts.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </section>

          {/* Internal notes */}
          <section className="bg-white border border-border rounded-xl p-4">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Internal notes</h2>
            <textarea
              rows={4}
              value={currentNotes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes visible only to admins…"
              className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30 bg-white resize-none"
            />
          </section>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-brand text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-brand-deep transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>

          {/* Meta */}
          <section className="bg-white border border-border rounded-xl p-4 space-y-2">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Details</h2>
            <div className="text-xs space-y-1.5 text-muted">
              <div className="flex justify-between"><span>Version</span><span className="text-ink">v{deliverable.version}</span></div>
              <div className="flex justify-between"><span>Created</span><span className="text-ink">{fmt(deliverable.createdAt)}</span></div>
              {deliverable.submittedAt && (
                <div className="flex justify-between"><span>Submitted</span><span className="text-ink">{fmt(deliverable.submittedAt)}</span></div>
              )}
              {deliverable.approvedAt && (
                <div className="flex justify-between"><span>Approved</span><span className="text-ink">{fmt(deliverable.approvedAt)}</span></div>
              )}
            </div>
          </section>

          {/* Description */}
          {deliverable.description && (
            <section className="bg-white border border-border rounded-xl p-4">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Description</h2>
              <p className="text-sm text-ink leading-relaxed">{deliverable.description}</p>
            </section>
          )}

          <Link href={`/admin/service-orders/${orderId}`} className="block text-center text-xs text-brand hover:underline">
            View parent order →
          </Link>
        </div>
      </div>
    </div>
  )
}
