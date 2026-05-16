'use client'

import { useEffect, useState } from 'react'
import { getTokenExpiry, setToken } from '@/lib/http'

const WARN_BEFORE_MS = 5 * 60 * 1000  // show banner when ≤5 min remain
const CHECK_INTERVAL_MS = 30 * 1000   // poll every 30s

export function SessionWarning() {
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null)
  const [extending, setExtending] = useState(false)

  useEffect(() => {
    function check() {
      const expiry = getTokenExpiry()
      if (!expiry) { setMinutesLeft(null); return }
      const remaining = expiry - Date.now()
      if (remaining <= 0 || remaining > WARN_BEFORE_MS) {
        setMinutesLeft(null)
      } else {
        setMinutesLeft(Math.max(1, Math.ceil(remaining / 60_000)))
      }
    }

    check()
    const id = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  if (minutesLeft === null) return null

  async function extend() {
    setExtending(true)
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
      const res = await fetch(`${BASE}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (res.ok) {
        const { accessToken } = await res.json() as { accessToken: string }
        setToken(accessToken)
        setMinutesLeft(null)
      }
    } finally {
      setExtending(false)
    }
  }

  return (
    <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-2.5 bg-amber-50 border-b border-amber-100 text-xs">
      <p className="text-amber-800">
        Your session expires in{' '}
        <span className="font-medium tabular-nums">{minutesLeft} min{minutesLeft !== 1 ? 's' : ''}</span>.
      </p>
      <button
        onClick={extend}
        disabled={extending}
        className="shrink-0 font-medium text-amber-900 underline underline-offset-2 hover:text-amber-700 disabled:opacity-50 transition-[color,opacity] duration-150"
      >
        {extending ? 'Extending…' : 'Extend session'}
      </button>
    </div>
  )
}
