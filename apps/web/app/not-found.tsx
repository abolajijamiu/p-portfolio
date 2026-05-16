import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page not found',
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-5">
      <div className="max-w-sm w-full">
        <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-5">
          404
        </p>
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-normal text-ink tracking-tight leading-tight mb-4">
          Page not found.
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-8">
          This page doesn't exist or has been moved. If you followed a link, it may be outdated.
        </p>
        <Link
          href="/"
          className="text-sm font-medium text-ink underline underline-offset-4 decoration-border hover:decoration-ink transition-[text-decoration-color] duration-150"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
