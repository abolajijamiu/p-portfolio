'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import useSWR, { mutate as globalMutate } from 'swr'
import { api } from '@/lib/api'
import { formatBytes } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import type { CmsMedia } from '@/types'

const ASSET_TYPE_OPTIONS = ['screenshot', 'thumbnail', 'before', 'after', 'logo', 'video-thumbnail'] as const
const FILTER_OPTIONS = ['all', ...ASSET_TYPE_OPTIONS]

const S3_PUBLIC_BASE = process.env.NEXT_PUBLIC_S3_PUBLIC_URL ?? ''

type UploadAssetType = typeof ASSET_TYPE_OPTIONS[number]

function AssetCard({ asset, onDelete, onTypeChange }: {
  asset: CmsMedia
  onDelete: (id: string) => void
  onTypeChange: (id: string, type: UploadAssetType) => void
}) {
  const [copied, setCopied] = useState(false)
  const [editingType, setEditingType] = useState(false)

  const publicUrl = S3_PUBLIC_BASE ? `${S3_PUBLIC_BASE}/${asset.storageKey}` : null

  function copyUrl() {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="group relative">
      <div className="aspect-square bg-surface border border-border rounded-lg overflow-hidden flex items-center justify-center">
        {asset.mimeType?.startsWith('image/') && publicUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={publicUrl}
            alt={asset.alt ?? asset.originalName ?? ''}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center px-2">
            <p className="text-[10px] text-muted truncate">{asset.originalName ?? asset.storageKey.split('/').pop()}</p>
            <p className="text-[10px] text-muted/50 mt-0.5">{asset.mimeType ?? 'file'}</p>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-[opacity] duration-150 flex flex-col items-center justify-center gap-1.5 bg-ink/40 rounded-lg">
          {publicUrl && (
            <button
              onClick={copyUrl}
              className="h-7 px-2.5 bg-white rounded text-[11px] font-medium text-ink hover:bg-white/90 transition-[background-color] duration-100"
            >
              {copied ? 'Copied' : 'Copy URL'}
            </button>
          )}
          <button
            onClick={() => onDelete(asset.id)}
            className="h-7 px-2.5 bg-white/10 border border-white/20 rounded text-[11px] text-white hover:bg-red-500/60 hover:border-transparent transition-[background-color,border-color] duration-100"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-1.5 px-0.5">
        <p className="text-[10px] text-ink truncate">{asset.originalName ?? '—'}</p>
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] text-muted/60">{formatBytes(asset.sizeBytes ?? undefined)}</p>
          {editingType ? (
            <select
              autoFocus
              defaultValue={asset.assetType}
              onBlur={() => setEditingType(false)}
              onChange={(e) => {
                onTypeChange(asset.id, e.target.value as UploadAssetType)
                setEditingType(false)
              }}
              className="text-[10px] border border-border rounded bg-white text-ink focus:outline-none max-w-[80px]"
            >
              {ASSET_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setEditingType(true)}
              className="text-[10px] text-muted/60 hover:text-ink transition-[color] duration-100 truncate max-w-[70px]"
              title="Click to change type"
            >
              {asset.assetType}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminMediaPage() {
  const [filter, setFilter] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const swrKey = filter === 'all' ? '/cms/media' : `/cms/media?type=${filter}`
  const { data: assets, isLoading } = useSWR<CmsMedia[]>(swrKey)

  useEffect(() => {
    document.title = 'Media — Content'
  }, [])

  async function uploadFiles(files: File[]) {
    if (!files.length) return
    setUploading(true)
    setUploadError(null)

    for (const file of files) {
      try {
        const { uploadUrl, storageKey } = await api.post<{ uploadUrl: string; storageKey: string }>(
          '/cms/media/upload-url',
          { filename: file.name, contentType: file.type },
        )

        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        })

        await api.post('/cms/media/confirm', {
          storageKey,
          originalName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        })
      } catch {
        setUploadError(`Failed to upload ${file.name}`)
      }
    }

    setUploading(false)
    globalMutate('/cms/media')
    globalMutate(swrKey)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
    if (files.length) uploadFiles(files)
  }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  async function deleteAsset(id: string) {
    if (!confirm('Delete this media asset? This cannot be undone.')) return
    await api.delete(`/cms/media/${id}`)
    globalMutate('/cms/media')
    globalMutate(swrKey)
  }

  async function changeType(id: string, assetType: UploadAssetType) {
    await api.patch(`/cms/media/${id}`, { assetType })
    globalMutate('/cms/media')
    globalMutate(swrKey)
  }

  return (
    <div
      className="h-full overflow-y-auto"
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false) }}
      onDrop={onDrop}
    >
      {dragOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/10 pointer-events-none">
          <div className="bg-white border-2 border-dashed border-ink/30 rounded-2xl px-12 py-8 text-center">
            <p className="text-sm font-medium text-ink">Drop to upload</p>
          </div>
        </div>
      )}

      <div className="px-4 pt-6 pb-10 md:p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Media</h1>
            <p className="text-sm text-muted mt-0.5">
              {assets ? `${assets.length} assets` : '—'}
              {!uploading && <span className="ml-2 text-muted/50">· drag files to upload</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => uploadFiles(Array.from(e.target.files ?? []))}
            />
            <Button size="sm" loading={uploading} onClick={() => fileInputRef.current?.click()}>
              Upload
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex gap-1.5 flex-wrap mb-5">
          {FILTER_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={[
                'px-2.5 py-1 text-xs rounded-md border transition-[background-color,color,border-color] duration-150',
                filter === t
                  ? 'bg-ink text-white border-ink'
                  : 'border-border text-muted hover:text-ink hover:border-ink/40',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>

        {uploadError && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-md flex items-center justify-between">
            <p className="text-sm text-red-600">{uploadError}</p>
            <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-600 ml-3">×</button>
          </div>
        )}

        {!isLoading && !assets?.length && (
          <div
            className="border-2 border-dashed border-border rounded-xl py-16 text-center cursor-pointer hover:border-ink/30 transition-[border-color] duration-150"
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-sm text-muted">No media assets.</p>
            <p className="text-xs text-muted/60 mt-1">Click or drag files to upload</p>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        )}

        {assets && assets.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onDelete={deleteAsset}
                onTypeChange={changeType}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
