'use client'

import { useRef, useState } from 'react'
import { api } from '@/lib/api'

const STORAGE_URL = (process.env.NEXT_PUBLIC_S3_PUBLIC_URL ?? '').replace(/\/$/, '')

interface Props {
  label: string
  accept: string       // 'image/*' | 'video/*'
  multiple?: boolean
  values: string[]     // public URLs already stored
  onChange: (urls: string[]) => void
  hint?: string
}

export function MediaUploader({ label, accept, multiple = false, values, onChange, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isImage = accept.startsWith('image')

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    setError(null)

    const added: string[] = []

    for (const file of Array.from(files)) {
      try {
        // 1. Get presigned S3 upload URL
        const { uploadUrl, storageKey } = await api.post<{
          uploadUrl: string
          storageKey: string
        }>('/cms/media/upload-url', { filename: file.name, contentType: file.type })

        // 2. PUT the file directly to S3 — no auth header, the presigned URL handles it
        const res = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        })
        if (!res.ok) throw new Error(`Storage upload failed (${res.status})`)

        // 3. Record images in the media library; skip for video (no video asset type in enum)
        if (isImage) {
          await api.post('/cms/media/confirm', {
            storageKey,
            originalName: file.name,
            mimeType: file.type,
            assetType: 'screenshot',
            sizeBytes: file.size,
          })
        }

        if (!STORAGE_URL) throw new Error('NEXT_PUBLIC_S3_PUBLIC_URL is not configured')
        added.push(`${STORAGE_URL}/${storageKey}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
        break
      }
    }

    if (added.length) onChange([...values, ...added])
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-ink">{label}</label>

      {values.length > 0 && (
        <div className={isImage ? 'grid grid-cols-3 gap-2' : 'space-y-1.5'}>
          {values.map((url, i) => (
            <div key={i} className="relative group">
              {isImage ? (
                <div className="aspect-video rounded-md overflow-hidden bg-surface border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="flex items-center gap-2 px-2.5 py-2 border border-border rounded-md bg-white">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-muted/50 shrink-0" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-muted truncate flex-1 font-mono">
                    {decodeURIComponent(url.split('/').pop() ?? url)}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => onChange(values.filter((_, j) => j !== i))}
                aria-label="Remove"
                className={[
                  'absolute top-1 right-1 h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center transition-opacity duration-150',
                  isImage
                    ? 'bg-black/60 text-white opacity-0 group-hover:opacity-100'
                    : 'bg-red-50 text-red-500 hover:bg-red-100',
                ].join(' ')}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center gap-2 w-full border border-dashed border-border rounded-lg py-5 text-sm text-muted hover:border-ink/30 hover:text-ink transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <span className="h-3.5 w-3.5 border-2 border-muted/30 border-t-muted rounded-full animate-spin" />
            Uploading…
          </>
        ) : (
          `${values.length > 0 && !multiple ? 'Replace' : '+ Upload'} ${isImage ? 'image' : 'video'}`
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => upload(e.target.files)}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && <p className="text-[10px] text-muted/50">{hint}</p>}
    </div>
  )
}
