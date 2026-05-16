'use client'

import { useEffect } from 'react'

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[marketing error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
      <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-4">
        Error
      </p>
      <h2 className="font-display text-3xl font-normal text-ink tracking-tight mb-4">
        Something went wrong.
      </h2>
      <p className="text-sm text-muted mb-8 max-w-sm">
        This page couldn't load. Please try again or{' '}
        <a href="/contact" className="text-ink underline underline-offset-2">
          contact us
        </a>{' '}
        if the problem persists.
      </p>
      <button
        onClick={reset}
        className="text-sm font-medium text-ink underline underline-offset-4 decoration-border hover:decoration-ink transition-[text-decoration-color] duration-150"
      >
        Try again
      </button>
    </div>
  )
}
