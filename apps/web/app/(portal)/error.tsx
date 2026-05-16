'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[portal error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] px-5 text-center">
      <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-4">
        Error
      </p>
      <h2 className="text-lg font-semibold text-ink tracking-tight mb-2">
        Something went wrong.
      </h2>
      <p className="text-sm text-muted mb-8 max-w-xs">
        This section couldn't load. Your data is safe.
      </p>
      <div className="flex items-center gap-5">
        <button
          onClick={reset}
          className="text-sm font-medium text-ink underline underline-offset-4 decoration-border hover:decoration-ink transition-[text-decoration-color] duration-150"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-ink transition-[color] duration-150"
        >
          Dashboard
        </Link>
      </div>
    </div>
  )
}
