'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'

type LogRow = {
  log: {
    id: string
    action: string
    entityType?: string | null
    entityId?: string | null
    details?: Record<string, unknown> | null
    ipAddress?: string | null
    createdAt: string
  }
  actorName?: string | null
  actorEmail?: string | null
}

const ACTION_COLOR: Record<string, string> = {
  'auth.2fa.enable': 'text-emerald-600',
  'auth.2fa.disable': 'text-rose-500',
  'support.ticket.create': 'text-sky-600',
  'support.ticket.reply': 'text-purple-600',
  'support.ticket.close': 'text-muted',
  'support.ticket.reopen': 'text-amber-600',
  'support.ticket.priority': 'text-amber-600',
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
}

const ENTITY_TYPE_FILTER_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'user', label: 'User' },
  { value: 'support_ticket', label: 'Support' },
  { value: 'service_order', label: 'Service order' },
  { value: 'expert_payout', label: 'Payout' },
]

export default function AdminAuditLogsPage() {
  const [entityType, setEntityType] = useState('')
  const [action, setAction] = useState('')

  const params = new URLSearchParams()
  if (entityType) params.set('entityType', entityType)
  if (action) params.set('action', action)
  const url = `/cms/audit-logs?${params.toString()}`

  const { data: rows, isLoading } = useSWR<LogRow[]>(url)

  useEffect(() => { document.title = 'Audit Logs — Admin' }, [])

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-5xl">

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted mt-0.5">System and admin action history</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="text-xs border border-border rounded-lg px-2.5 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            {ENTITY_TYPE_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Filter by action…"
            className="text-xs border border-border rounded-lg px-2.5 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 w-48"
          />
          {(entityType || action) && (
            <button onClick={() => { setEntityType(''); setAction('') }} className="text-xs text-muted hover:text-ink">
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-1">
            {[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-white border border-border rounded-lg animate-pulse" />)}
          </div>
        ) : !rows || rows.length === 0 ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No log entries.</p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
            {rows.map(({ log, actorName, actorEmail }) => (
              <div key={log.id} className="px-4 py-3 flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-mono font-semibold ${ACTION_COLOR[log.action] ?? 'text-ink'}`}>
                      {log.action}
                    </span>
                    {log.entityType && (
                      <span className="text-[10px] bg-surface text-muted px-1.5 py-0.5 rounded font-mono">
                        {log.entityType}
                      </span>
                    )}
                    {log.entityId && (
                      <span className="text-[10px] text-muted font-mono truncate max-w-[120px]" title={log.entityId}>
                        {log.entityId.slice(0, 8)}…
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-[11px] text-muted">
                      {actorName ?? 'System'}{actorEmail ? ` · ${actorEmail}` : ''}
                    </p>
                    {log.ipAddress && (
                      <p className="text-[11px] text-muted font-mono">{log.ipAddress}</p>
                    )}
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <p className="text-[10px] text-muted font-mono mt-0.5">
                      {JSON.stringify(log.details)}
                    </p>
                  )}
                </div>
                <p className="text-[11px] text-muted shrink-0">{fmtDateTime(log.createdAt)}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
