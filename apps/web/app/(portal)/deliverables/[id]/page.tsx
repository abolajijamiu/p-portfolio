'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { CheckIcon, DocumentIcon, LayersIcon, XIcon } from '@/components/ui/Icons'

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
    notes?: string | null
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

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  submitted: 'Ready for Review',
  revision_requested: 'Revision Requested',
  approved: 'Approved',
  completed: 'Completed',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-surface text-muted border-border',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
  submitted: 'bg-amber-50 text-amber-700 border-amber-200',
  revision_requested: 'bg-rose-50 text-rose-700 border-rose-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}

export default function DeliverableDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading, mutate } = useSWR<DeliverableDetail>(`/deliverables/${id}`)
  const [showRevision, setShowRevision] = useState(false)
  const [revisionFeedback, setRevisionFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="h-7 w-7 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null
  const { deliverable: d } = data

  async function handleApprove() {
    if (!confirm('Approve this deliverable?')) return
    setSubmitting(true)
    try {
      await api.post(`/deliverables/${id}/approve`)
      mutate()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRevision() {
    if (!revisionFeedback.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/deliverables/${id}/revision`, { feedback: revisionFeedback })
      setRevisionFeedback('')
      setShowRevision(false)
      mutate()
    } finally {
      setSubmitting(false)
    }
  }

  async function download(key: string, name: string) {
    setDownloading(key)
    try {
      const { url } = await api.get<{ url: string }>(
        `/deliverables/${id}/download-url?key=${encodeURIComponent(key)}&name=${encodeURIComponent(name)}`
      )
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="px-4 pt-6 pb-12 md:p-8 max-w-3xl">
      {/* Back */}
      <Link href="/deliverables" className="text-xs text-muted hover:text-ink transition-colors mb-4 inline-block">
        ← Deliverables
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-semibold text-muted">{d.deliverableNumber}</span>
            {d.version > 1 && (
              <span className="text-[10px] font-semibold bg-surface border border-border text-muted px-1.5 py-0.5 rounded">
                v{d.version}
              </span>
            )}
          </div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">{d.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted">{data.serviceTitle}</span>
            <span className="text-muted/30">·</span>
            <Link href={`/orders/${data.orderId}`} className="text-xs font-mono text-muted hover:text-brand transition-colors">
              {data.orderNumber}
            </Link>
          </div>
        </div>
        <span className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full border ${STATUS_COLOR[d.status] ?? 'bg-surface text-muted border-border'}`}>
          {STATUS_LABEL[d.status] ?? d.status}
        </span>
      </div>

      {/* Expert */}
      {data.expertName && (
        <div className="bg-white border border-border rounded-xl p-4 mb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-dim border border-brand/20 flex items-center justify-center shrink-0">
            {data.expertAvatar ? (
              <img src={data.expertAvatar} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-brand">
                {data.expertName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{data.expertName}</p>
            <p className="text-xs text-muted">Assigned expert</p>
          </div>
        </div>
      )}

      {/* Description */}
      {d.description && (
        <div className="bg-white border border-border rounded-xl p-5 mb-5">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">Description</p>
          <p className="text-sm text-ink leading-relaxed">{d.description}</p>
        </div>
      )}

      {/* Files */}
      {d.files.length > 0 && (
        <div className="bg-white border border-border rounded-xl p-5 mb-5">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">
            Delivered files — v{d.version}
            {d.submittedAt && <span className="text-muted ml-2 normal-case font-normal">submitted {fmtDate(d.submittedAt)}</span>}
          </p>
          <div className="space-y-2">
            {d.files.map((file) => (
              <div key={file.key} className="flex items-center gap-3 border border-border rounded-lg px-4 py-3">
                <DocumentIcon className="h-4 w-4 text-brand shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{file.name}</p>
                  {file.size > 0 && <p className="text-[11px] text-muted">{fmtSize(file.size)}</p>}
                </div>
                <button
                  onClick={() => download(file.key, file.name)}
                  disabled={downloading === file.key}
                  className="shrink-0 text-xs font-semibold text-brand hover:text-brand-deep transition-colors disabled:opacity-50"
                >
                  {downloading === file.key ? 'Downloading…' : '↓ Download'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {d.notes && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-5">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">Expert notes</p>
          <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{d.notes}</p>
        </div>
      )}

      {/* Approval actions */}
      {d.status === 'submitted' && (
        <div className="bg-white border border-border rounded-xl p-5 mb-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-sm font-semibold text-ink">This deliverable is ready for your review</p>
          </div>
          <p className="text-xs text-muted">Download the files above, review the work, then approve or request changes.</p>
          {showRevision ? (
            <div className="space-y-3">
              <textarea
                value={revisionFeedback}
                onChange={(e) => setRevisionFeedback(e.target.value)}
                placeholder="Describe what needs to be changed..."
                rows={4}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleRevision}
                  disabled={submitting || !revisionFeedback.trim()}
                  className="flex-1 bg-rose-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  Submit revision request
                </button>
                <button
                  onClick={() => setShowRevision(false)}
                  className="px-3 border border-border rounded-lg text-muted hover:text-ink transition-colors"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="flex-1 bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                Approve deliverable
              </button>
              <button
                onClick={() => setShowRevision(true)}
                className="flex-1 border border-border text-ink text-sm font-medium py-2.5 rounded-lg hover:bg-surface transition-colors"
              >
                Request changes
              </button>
            </div>
          )}
        </div>
      )}

      {d.status === 'approved' && d.approvedAt && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-5 flex items-center gap-3">
          <CheckIcon className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Approved</p>
            <p className="text-xs text-emerald-700">{fmtDate(d.approvedAt)}</p>
          </div>
        </div>
      )}

      {/* Revision history */}
      {data.revisions.length > 0 && (
        <div className="bg-white border border-border rounded-xl p-5">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-4">Revision history</p>
          <div className="space-y-4">
            {data.revisions.map(({ revision: r, submitterName }) => (
              <div key={r.id} className="relative pl-5 border-l-2 border-border">
                <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-border" />
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink">{submitterName ?? 'Unknown'}</span>
                  <span className="text-[10px] font-medium bg-surface border border-border text-muted px-1.5 py-0.5 rounded">v{r.version}</span>
                  <span className="text-[11px] text-muted">{fmtDate(r.createdAt)}</span>
                </div>
                <p className="text-sm text-ink leading-relaxed">{r.message}</p>
                {r.clientFeedback && (
                  <div className="mt-2 pl-3 border-l-2 border-rose-200">
                    <p className="text-xs text-rose-700 italic">{r.clientFeedback}</p>
                  </div>
                )}
                {r.files.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {r.files.map((f) => (
                      <span key={f.key} className="inline-flex items-center gap-1 text-[11px] text-muted bg-surface border border-border px-2 py-1 rounded">
                        <DocumentIcon className="h-3 w-3" />
                        {f.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
