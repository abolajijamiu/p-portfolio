'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { BellIcon, MenuIcon } from '@/components/ui/Icons'
import { cn, formatRelativeDate } from '@/lib/utils'
import type { Notification } from '@/types'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data: notifications, mutate } = useSWR<Notification[]>('/notifications', {
    refreshInterval: 30000,
    onErrorRetry: (err, _key, _config, revalidate, { retryCount }) => {
      if ((err as { status?: number }).status === 404) return
      if (retryCount >= 2) return
      setTimeout(() => revalidate({ retryCount }), 5000)
    },
  })

  const unread = notifications?.filter((n) => !n.read).length ?? 0

  async function markRead(id: string) {
    await api.patch(`/notifications/${id}/read`, {}).catch(() => {})
    mutate(notifications?.map((n) => n.id === id ? { ...n, read: true } : n), false)
  }

  async function markAllRead() {
    await api.post('/notifications/read-all', {}).catch(() => {})
    mutate(notifications?.map((n) => ({ ...n, read: true })), false)
  }

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-20 h-14 bg-white border-b border-border flex items-center justify-between px-4 md:px-8 shrink-0">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="lg:hidden h-8 w-8 flex items-center justify-center rounded-md text-muted hover:text-ink hover:bg-surface active:bg-border transition-[background-color,color] duration-150"
      >
        <MenuIcon className="h-[18px] w-[18px]" />
      </button>

      {/* Spacer on desktop */}
      <div className="hidden lg:block" />

      {/* Right: notifications */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Notifications"
          className="relative h-8 w-8 flex items-center justify-center rounded-md text-muted hover:text-ink hover:bg-surface active:bg-border transition-[background-color,color] duration-150"
        >
          <BellIcon className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-ink" />
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-border rounded-xl shadow-lg overflow-hidden z-30 animate-dropdown">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Notifications
              </span>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-medium text-brand hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {!notifications?.length ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-muted">You're all caught up.</p>
              </div>
            ) : (
              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onRead={() => markRead(n.id)}
                    onClose={() => setOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

function NotificationItem({
  notification: n,
  onRead,
  onClose,
}: {
  notification: Notification
  onRead: () => void
  onClose: () => void
}) {
  function handleClick() {
    if (!n.read) onRead()
    onClose()
  }

  const content = (
    <div className={cn('px-4 py-3.5 transition-[background-color] duration-150 cursor-pointer', !n.read ? 'bg-surface' : 'hover:bg-surface')}>
      <div className="flex items-start gap-2">
        {!n.read && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />}
        <div className={cn('min-w-0', !n.read ? '' : 'pl-3.5')}>
          <p className="text-sm font-medium text-ink leading-snug">{n.title}</p>
          {n.body && <p className="text-xs text-muted mt-0.5 leading-snug">{n.body}</p>}
          <p className="text-[11px] text-muted/70 mt-1">{formatRelativeDate(n.createdAt)}</p>
        </div>
      </div>
    </div>
  )

  if (n.link) {
    return (
      <Link href={n.link} onClick={handleClick}>
        {content}
      </Link>
    )
  }

  return <div onClick={handleClick}>{content}</div>
}
