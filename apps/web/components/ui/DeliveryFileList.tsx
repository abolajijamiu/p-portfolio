'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

type FileEntry = { key: string; name: string; size?: number }

interface DeliveryFileListProps {
  orderId: string
  files: FileEntry[]
  downloadUrlBase?: string // defaults to '/service-orders/:orderId/files/download-url'
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DeliveryFileList({ orderId, files, downloadUrlBase }: DeliveryFileListProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const base = downloadUrlBase ?? `/service-orders/${orderId}/files/download-url`

  async function download(file: FileEntry) {
    setLoading(file.key)
    try {
      const { url } = await api.get<{ url: string }>(
        `${base}?key=${encodeURIComponent(file.key)}&name=${encodeURIComponent(file.name)}`,
      )
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      // silently ignore — user can retry
    } finally {
      setLoading(null)
    }
  }

  if (files.length === 0) return null

  return (
    <div className="space-y-1.5 mt-3">
      {files.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => download(f)}
          disabled={loading === f.key}
          className="w-full flex items-center gap-3 bg-white border border-border rounded-lg px-3 py-2 hover:border-brand/30 hover:bg-surface transition-all duration-150 group disabled:opacity-60"
        >
          <svg className="h-4 w-4 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span className="text-sm font-medium text-ink truncate flex-1 text-left">{f.name}</span>
          {f.size !== undefined && <span className="text-xs text-muted shrink-0">{fmtSize(f.size)}</span>}
          <span className="text-xs font-semibold text-brand shrink-0 group-hover:underline">
            {loading === f.key ? 'Loading…' : 'Download ↓'}
          </span>
        </button>
      ))}
    </div>
  )
}
