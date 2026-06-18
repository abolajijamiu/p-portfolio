'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'sent'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setError('')
    setState('loading')
    try {
      await axios.post(`${BASE}/api/v1/auth/forgot-password`, { email: email.trim() })
      setState('sent')
    } catch {
      // Generic message — server always 200s, so this only fires on network errors
      setError('Something went wrong. Please try again.')
      setState('idle')
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-xl font-bold text-ink">E</span>
            <span className="text-xl font-bold text-brand">-Tech.</span>
          </Link>
        </div>

        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
          {state === 'sent' ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h1 className="text-lg font-semibold text-ink mb-2">Check your email</h1>
              <p className="text-sm text-muted leading-relaxed">
                If <span className="font-medium text-ink">{email}</span> has an account, we've sent a password reset link. It expires in 1 hour.
              </p>
              <p className="text-xs text-muted mt-4">Didn't get it? Check your spam folder.</p>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-ink mb-1">Forgot your password?</h1>
              <p className="text-sm text-muted mb-6">Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-[border-color,box-shadow] duration-150 placeholder:text-muted/50"
                  />
                </div>

                {error && (
                  <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={state === 'loading'}
                  className="w-full h-10 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 disabled:opacity-50 transition-[opacity,background-color] duration-150"
                >
                  {state === 'loading' ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-6">
          <Link href="/login" className="text-brand hover:underline font-medium">← Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
