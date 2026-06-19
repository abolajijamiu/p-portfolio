'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { SessionWarning } from '@/components/layout/SessionWarning'
import { Spinner } from '@/components/ui/Spinner'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

// Map notification types to the SWR key segments they should revalidate
function keysForType(type: string): ((key: unknown) => boolean) {
  const k = (s: string) => (key: unknown) => typeof key === 'string' && key.includes(s)
  if (/^order_|^message_/.test(type)) return (key) => typeof key === 'string' && (key.includes('service-orders') || key.includes('/expert/orders'))
  if (/^booking_/.test(type)) return k('booking')
  if (/^support_/.test(type)) return k('support')
  if (/^deliverable_/.test(type)) return k('deliverable')
  return () => true // unknown type: broad fallback
}

export default function PortalLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { mutate } = useSWRConfig()
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login')
  }, [isLoading, user, router])

  // SSE: receive notifications and revalidate only the affected SWR keys.
  // Uses short-lived tickets so the access token never appears in URLs/logs.
  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function connect() {
      if (cancelled) return
      try {
        const { ticket } = await api.get<{ ticket: string }>('/notifications/ticket')
        if (cancelled) return

        const es = new EventSource(`${API_BASE}/api/v1/notifications/stream?ticket=${encodeURIComponent(ticket)}`)
        esRef.current = es

        es.addEventListener('notification', (e) => {
          try {
            const { type } = JSON.parse((e as MessageEvent).data) as { type: string }
            mutate(keysForType(type))
          } catch {
            mutate(() => true)
          }
        })

        es.onerror = () => {
          es.close()
          esRef.current = null
          // Reconnect with a fresh ticket after a brief delay
          if (!cancelled) setTimeout(connect, 4_000)
        }
      } catch {
        // Ticket fetch failed (network error / not authenticated) — retry later
        if (!cancelled) setTimeout(connect, 10_000)
      }
    }

    connect()

    return () => {
      cancelled = true
      esRef.current?.close()
      esRef.current = null
    }
  }, [user, mutate])

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 lg:ml-60 min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <SessionWarning />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
