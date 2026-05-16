'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error reporting service when integrated
    console.error('[app error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-5">
      <div className="max-w-sm w-full">
        <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-5">
          Error
        </p>
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-normal text-ink tracking-tight leading-tight mb-4">
          Something went wrong.
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-8">
          An unexpected error occurred. If this continues, please{' '}
          <a href="/contact" className="text-ink underline underline-offset-2">
            get in touch
          </a>
          .
        </p>
        <button
          onClick={reset}
          className="text-sm font-medium text-ink underline underline-offset-4 decoration-border hover:decoration-ink transition-[text-decoration-color] duration-150"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
