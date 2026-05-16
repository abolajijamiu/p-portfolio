'use client'

import { useEffect, useRef, useState, type FormEvent, type ChangeEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import axios from 'axios'
import { api } from '@/lib/api'
import { http } from '@/lib/http'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate, formatBytes, formatMessageTime, fileTypeLabel } from '@/lib/utils'
import type { Message, Project, ProjectFile } from '@/types'

const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25 MB
const MAX_MESSAGE_LENGTH = 4000

type Tab = 'messages' | 'files'

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('messages')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: project, isLoading: loadingProject, error: projectError } = useSWR<Project>(`/projects/${id}`)
  const {
    data: messages,
    isLoading: loadingMessages,
    error: messagesError,
    mutate: reloadMessages,
  } = useSWR<Message[]>(`/projects/${id}/messages`, { refreshInterval: 5000 })
  const {
    data: files,
    isLoading: loadingFiles,
    error: filesError,
    mutate: reloadFiles,
  } = useSWR<ProjectFile[]>(`/projects/${id}/files`)

  useEffect(() => {
    if (project?.name) document.title = `${project.name} — E-Tech.`
    return () => { document.title = 'Projects — E-Tech.' }
  }, [project?.name])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    setSending(true)
    setSendError(null)
    try {
      await api.post(`/projects/${id}/messages`, { body: trimmed })
      setBody('')
      await reloadMessages()
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send. Please try again.')
    } finally {
      setSending(false)
    }
  }

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    if (file.size > MAX_FILE_BYTES) {
      setUploadError(`File exceeds 25 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB)`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setUploading(true)
    try {
      // 1. Request presigned upload URL
      const { uploadUrl, storageKey } = await api.post<{ uploadUrl: string; storageKey: string }>(
        `/projects/${id}/files/upload-url`,
        { name: file.name, mimeType: file.type, sizeBytes: file.size },
      )

      // 2. PUT directly to storage (S3 / R2 presigned URL)
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        // Strip auth header — presigned URL is self-authenticating
        transformRequest: [(data) => data],
      })

      // 3. Notify API that upload completed
      await api.post(`/projects/${id}/files`, {
        name: file.name,
        storageKey,
        mimeType: file.type,
        sizeBytes: file.size,
      })

      await reloadFiles()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDownload(fileId: string, fileName: string) {
    setDownloading((prev) => new Set(prev).add(fileId))
    try {
      const { url } = await api.get<{ url: string }>(`/projects/${id}/files/${fileId}/download-url`)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } finally {
      setDownloading((prev) => { const next = new Set(prev); next.delete(fileId); return next })
    }
  }

  // Project-level loading skeleton
  if (loadingProject) {
    return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 px-4 py-4 md:px-8 md:py-5 bg-white border-b border-border">
          <div className="flex items-center gap-2.5 mb-1.5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="shrink-0 px-4 md:px-8 bg-white border-b border-border flex gap-6">
          <div className="py-3"><Skeleton className="h-4 w-20" /></div>
        </div>
        <div className="flex-1 px-4 py-5 md:px-8 md:py-6 space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-4 w-full max-w-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Project not found or access error
  if (projectError || !project) {
    const isNotFound = (projectError as { status?: number })?.status === 404
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[320px] px-5 text-center">
        <h2 className="text-base font-semibold text-ink mb-2">
          {isNotFound ? 'Project not found.' : "Couldn't load this project."}
        </h2>
        <p className="text-sm text-muted mb-6 max-w-xs">
          {isNotFound
            ? "This project doesn't exist or you don't have access to it."
            : 'An error occurred. Please try again.'}
        </p>
        <button
          onClick={() => router.push('/projects')}
          className="text-sm font-medium text-ink underline underline-offset-4 decoration-border hover:decoration-ink transition-[text-decoration-color] duration-150"
        >
          Back to projects
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-4 py-4 md:px-8 md:py-5 bg-white border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
              <h1 className="text-lg md:text-xl font-semibold text-ink tracking-tight">{project.name}</h1>
              <Badge status={project.status} />
            </div>
            {project.description && (
              <p className="text-sm text-muted truncate">{project.description}</p>
            )}
          </div>
          {project.dueDate && (
            <p className="text-xs md:text-sm text-muted shrink-0 pt-0.5">
              Due {formatDate(project.dueDate)}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="shrink-0 px-4 md:px-8 bg-white border-b border-border flex gap-5 md:gap-6">
        {(['messages', 'files'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'py-3 text-sm font-medium border-b-2 capitalize transition-[color,border-color] duration-150',
              tab === t
                ? 'border-ink text-ink'
                : 'border-transparent text-muted hover:text-ink hover:border-muted/30',
            ].join(' ')}
          >
            {t}
            {t === 'files' && files && files.length > 0 && (
              <span className="ml-1.5 text-[10px] text-muted/70 tabular-nums">{files.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Messages tab */}
      {tab === 'messages' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-6 space-y-5">
            {loadingMessages ? (
              <div className="space-y-5 pt-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-4 w-64 max-w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : messagesError ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
                <p className="text-sm text-muted">Couldn't load messages.</p>
                <button
                  onClick={() => reloadMessages()}
                  className="mt-1.5 text-xs text-ink underline underline-offset-2"
                >
                  Try again
                </button>
              </div>
            ) : messages?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center px-4">
                <p className="text-sm text-muted">No messages yet.</p>
                <p className="text-xs text-muted/60 mt-1">Start the conversation below.</p>
              </div>
            ) : (
              messages?.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <Avatar name={msg.sender.name} src={msg.sender.avatarUrl} />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-medium text-ink">{msg.sender.name}</span>
                      <span className="text-xs text-muted/70 shrink-0">
                        {formatMessageTime(msg.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-[#374151] leading-relaxed break-words">{msg.body}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Compose */}
          <div className="shrink-0 px-4 py-3 md:px-8 md:py-4 bg-white border-t border-border">
            {sendError && (
              <p className="text-xs text-red-500 mb-2">{sendError}</p>
            )}
            <form onSubmit={handleSend} className="flex gap-2.5 md:gap-3">
              <div className="relative flex-1">
                <input
                  value={body}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                      setBody(e.target.value)
                      setSendError(null)
                    }
                  }}
                  onKeyDown={(e) => {
                    // Cmd/Ctrl+Enter to send
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault()
                      if (body.trim() && !sending) {
                        handleSend(e as unknown as FormEvent)
                      }
                    }
                  }}
                  placeholder="Write a message…"
                  disabled={sending}
                  className="w-full h-10 md:h-9 px-3 text-sm border border-border rounded-md bg-white placeholder:text-[#9ca3af] transition-[border-color,box-shadow] duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink focus-visible:border-ink disabled:opacity-50"
                />
                {body.length > MAX_MESSAGE_LENGTH * 0.85 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted/60 tabular-nums pointer-events-none">
                    {MAX_MESSAGE_LENGTH - body.length}
                  </span>
                )}
              </div>
              <Button
                type="submit"
                loading={sending}
                disabled={!body.trim()}
                className="h-10 md:h-9 px-4 shrink-0"
              >
                Send
              </Button>
            </form>
            <p className="text-[10px] text-muted/40 mt-1.5 hidden md:block">
              ⌘ Return to send
            </p>
          </div>
        </div>
      )}

      {/* Files tab */}
      {tab === 'files' && (
        <div className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-6">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <h2 className="text-[11px] font-medium text-muted uppercase tracking-wider">Files</h2>
            <div className="flex items-center gap-3">
              {uploadError && (
                <p className="text-xs text-red-500 max-w-[200px] text-right">{uploadError}</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleUpload}
                // Accepted types — adjust to match backend validation
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
              />
              <Button
                size="sm"
                variant="secondary"
                loading={uploading}
                onClick={() => { setUploadError(null); fileInputRef.current?.click() }}
              >
                Upload file
              </Button>
            </div>
          </div>

          {loadingFiles ? (
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Name', 'Type', 'Size', 'Uploaded by', 'Date', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-muted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-10" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-14" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-3" />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filesError ? (
            <div className="py-14 text-center border border-border rounded-xl bg-white">
              <p className="text-sm text-muted">Couldn't load files.</p>
              <button
                onClick={() => reloadFiles()}
                className="mt-2 text-xs text-ink underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          ) : files?.length === 0 ? (
            <div className="py-14 text-center border border-border rounded-xl bg-white">
              <p className="text-sm text-muted">No files yet.</p>
              <p className="text-xs text-muted/60 mt-1">Upload a file to share it with the team.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-white -mx-px">
              <table className="w-full min-w-[620px]">
                <thead>
                  <tr className="border-b border-border">
                    {['Name', 'Type', 'Size', 'Uploaded by', 'Date', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {files?.map((file) => (
                    <tr key={file.id} className="hover:bg-surface transition-[background-color] duration-150">
                      <td className="px-4 py-3 text-sm font-medium text-ink max-w-[200px] truncate">
                        {file.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-medium text-muted/80 bg-surface border border-border px-1.5 py-0.5 rounded whitespace-nowrap">
                          {fileTypeLabel(file.mimeType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted whitespace-nowrap">
                        {formatBytes(file.sizeBytes)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted whitespace-nowrap">
                        {file.uploadedBy.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted whitespace-nowrap">
                        {formatDate(file.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDownload(file.id, file.name)}
                          disabled={downloading.has(file.id)}
                          className="text-xs text-muted hover:text-ink underline underline-offset-2 disabled:opacity-40 transition-[color,opacity] duration-150 whitespace-nowrap"
                        >
                          {downloading.has(file.id) ? 'Getting link…' : 'Download'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
