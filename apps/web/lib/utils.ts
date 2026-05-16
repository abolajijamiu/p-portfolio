export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatBytes(bytes?: number | null): string {
  if (bytes == null) return '—'
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Relative time for notifications and activity feeds
export function formatRelativeDate(iso: string): string {
  const now = new Date()
  const date = new Date(iso)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(iso)
}

// For message threads: time-only if today, short date if older
export function formatMessageTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Human-readable file type from MIME
export function fileTypeLabel(mimeType?: string | null): string {
  if (!mimeType) return 'File'
  if (mimeType === 'application/pdf') return 'PDF'
  if (mimeType.startsWith('image/')) return mimeType.split('/')[1].toUpperCase()
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Excel'
  if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) return 'Word'
  if (mimeType.includes('presentationml') || mimeType.includes('powerpoint')) return 'Slides'
  if (mimeType === 'text/plain') return 'Text'
  if (mimeType === 'text/csv') return 'CSV'
  if (mimeType.startsWith('video/')) return 'Video'
  if (mimeType.startsWith('audio/')) return 'Audio'
  if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed') return 'ZIP'
  return 'File'
}
