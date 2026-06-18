'use client'

import { useRef, useState } from 'react'
import axios from 'axios'
import { api } from '@/lib/api'

export type UploadedFile = { key: string; name: string; size: number }

interface FileUploaderProps {
  uploadUrlEndpoint: string // e.g. '/service-orders/:id/upload-url'
  files: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  maxFiles?: number
  accept?: string
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUploader({
  uploadUrlEndpoint,
  files,
  onChange,
  maxFiles = 10,
  accept,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [error, setError] = useState('')

  async function handleFiles(selected: FileList | null) {
    if (!selected || selected.length === 0) return
    setError('')
    setUploading(true)
    const toAdd: UploadedFile[] = []

    for (const file of Array.from(selected)) {
      if (files.length + toAdd.length >= maxFiles) break
      try {
        const { uploadUrl, storageKey } = await api.post<{ uploadUrl: string; storageKey: string }>(
          uploadUrlEndpoint,
          { name: file.name, mimeType: file.type || 'application/octet-stream' },
        )
        setProgress((p) => ({ ...p, [file.name]: 0 }))
        await axios.put(uploadUrl, file, {
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          onUploadProgress: (e) => {
            const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 0
            setProgress((p) => ({ ...p, [file.name]: pct }))
          },
        })
        toAdd.push({ key: storageKey, name: file.name, size: file.size })
      } catch {
        setError(`Failed to upload ${file.name}. Please try again.`)
      } finally {
        setProgress((p) => { const next = { ...p }; delete next[file.name]; return next })
      }
    }

    if (toAdd.length > 0) onChange([...files, ...toAdd])
    setUploading(false)
  }

  function remove(key: string) {
    onChange(files.filter((f) => f.key !== key))
  }

  const activeUploads = Object.entries(progress)

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        className={`border-2 border-dashed rounded-xl px-4 py-5 text-center transition-colors duration-150 ${
          uploading ? 'border-brand/30 bg-brand-dim/20' : 'border-border hover:border-brand/30 hover:bg-surface cursor-pointer'
        }`}
      >
        <svg className="h-6 w-6 text-muted mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-xs text-muted">
          {uploading ? 'Uploading…' : (
            <>
              <span className="font-semibold text-brand">Click to attach files</span>
              {' '}or drag and drop
            </>
          )}
        </p>
        {files.length < maxFiles && (
          <p className="text-[10px] text-muted/60 mt-0.5">Max {maxFiles} files</p>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Active upload progress */}
      {activeUploads.map(([name, pct]) => (
        <div key={name} className="flex items-center gap-3 bg-surface border border-border rounded-lg px-3 py-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-ink truncate">{name}</p>
            <div className="mt-1 h-1 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-brand transition-all duration-150" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span className="text-[10px] text-muted shrink-0">{pct}%</span>
        </div>
      ))}

      {/* Attached files */}
      {files.map((f) => (
        <div key={f.key} className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2">
          <svg className="h-3.5 w-3.5 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span className="text-xs text-ink truncate flex-1">{f.name}</span>
          <span className="text-[10px] text-muted shrink-0">{fmtSize(f.size)}</span>
          <button
            type="button"
            onClick={() => remove(f.key)}
            className="text-muted hover:text-rose-500 transition-colors shrink-0"
            aria-label="Remove file"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      {error && (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  )
}
