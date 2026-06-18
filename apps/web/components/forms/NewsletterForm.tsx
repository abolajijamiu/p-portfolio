'use client'

import { useState, type FormEvent } from 'react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setState('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (res.ok) {
        setState('done')
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="flex items-center justify-center gap-2 py-2 text-sm text-emerald-700">
        <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        You&apos;re subscribed — thanks for joining!
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Enter your email address"
        className="flex-1 text-sm text-ink bg-white border border-border rounded-lg px-4 py-2.5 placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 transition-all duration-150"
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        className="shrink-0 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-deep disabled:opacity-60 transition-colors duration-150"
      >
        {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </button>
      {state === 'error' && (
        <p className="text-xs text-rose-500 mt-1 sm:col-span-2">Something went wrong. Please try again.</p>
      )}
    </form>
  )
}
