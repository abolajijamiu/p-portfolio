'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { api } from '@/lib/api'

type DeliverableRow = {
  deliverable: {
    id: string
    deliverableNumber: string
    title: string
    status: string
    version: number
    assignedExpertId?: string | null
    dueDate?: string | null
    submittedAt?: string | null
    approvedAt?: string | null
    createdAt: string
  }
  orderNumber: string
  serviceTitle: string
  clientName: string
  expertName?: string | null
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-surface text-muted border-border',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
  submitted: 'bg-sky-50 text-sky-700 border-sky-200',
  revision_requested: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
}

const ALL_STATUSES = ['all', 'pending', 'in_progress', 'submitted', 'revision_requested', 'approved', 'completed']

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminDeliverablesPage() {
  const [status, setStatus] = useState('all')
  const url = status === 'all' ? '/cms/deliverables' : `/cms/deliverables?status=${status}`
  const { data, mutate } = useSWR<DeliverableRow[]>(url)

  const rows = data ?? []
  const needsAction = rows.filter((r) =>
    ['submitted', 'revision_requested'].includes(r.deliverable.status)
  ).length

  return (
    <div className="px-4 pt-6 pb-12 md:p-8 max-w-6xl">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">Deliverables</h1>
          <p className="text-sm text-muted mt-1">Manage deliverables, assign experts, review submissions.</p>
        </div>
      </div>

      {needsAction > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <p className="text-sm text-amber-700">
            <strong>{needsAction}</strong> {needsAction === 1 ? 'deliverable requires' : 'deliverables require'} your attention.
          </p>
        </div>
      )}

      {/* Status filter */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
              status === s
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-muted border-border hover:text-ink'
            }`}
          >
            {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-10 text-center">
          <p className="text-sm text-muted">No deliverables found.</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                {['Number', 'Title', 'Order', 'Client', 'Expert', 'Status', 'Submitted', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(({ deliverable, orderNumber, serviceTitle, clientName, expertName }) => (
                <tr key={deliverable.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3 font-mono text-xs text-muted whitespace-nowrap">{deliverable.deliverableNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink max-w-[180px] truncate">{deliverable.title}</p>
                    <p className="text-xs text-muted">{serviceTitle}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted font-mono whitespace-nowrap">{orderNumber}</td>
                  <td className="px-4 py-3 text-sm text-ink">{clientName}</td>
                  <td className="px-4 py-3 text-sm text-muted">{expertName ?? <span className="italic text-muted">Unassigned</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLOR[deliverable.status] ?? 'bg-surface text-muted border-border'}`}>
                      {deliverable.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                    {deliverable.submittedAt ? fmtDate(deliverable.submittedAt) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/deliverables/${deliverable.id}`} className="text-[11px] text-brand hover:underline whitespace-nowrap">
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
