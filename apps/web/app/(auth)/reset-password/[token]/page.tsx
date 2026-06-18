'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [error, setError] = useState('')

  const mismatch = confirm.length > 0 && password !== confirm
  const tooShort = password.length > 0 && password.length < 8

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!password || password !== confirm || password.length < 8) return
    setError('')
    setState('loading')
    try {
      await axios.post(`${BASE}/api/v1/auth/reset-password`, { token, password })
      setState('done')
      setTimeout(() => router.push('/login?reset=1'), 3000)
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'This reset link is invalid or has expired.'
      setError(msg)
      setState('idle')
    }
  }

  const inputCls =
    'w-full px-3 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-[border-color,box-shadow] duration-150 placeholder:text-muted/50'

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-xl font-bold text-ink">E</span>
            <span className="text-xl font-bold text-brand">-Tech.</span>
          </Link>
        </div>

        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
          {state === 'done' ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h1 className="text-lg font-semibold text-ink mb-2">Password updated</h1>
              <p className="text-sm text-muted">Your password has been changed. Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-ink mb-1">Set a new password</h1>
              <p className="text-sm text-muted mb-6">Choose a strong password — at least 8 characters.</p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    required
                    className={`${inputCls} ${tooShort ? 'border-rose-300' : 'border-border'}`}
                  />
                  {tooShort && <p className="text-xs text-rose-500 mt-1">Must be at least 8 characters</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your new password"
                    autoComplete="new-password"
                    required
                    className={`${inputCls} ${mismatch ? 'border-rose-300' : 'border-border'}`}
                  />
                  {mismatch && <p className="text-xs text-rose-500 mt-1">Passwords do not match</p>}
                </div>

                {error && (
                  <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={state === 'loading' || tooShort || mismatch || !password || !confirm}
                  className="w-full h-10 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 disabled:opacity-50 transition-[opacity,background-color] duration-150"
                >
                  {state === 'loading' ? 'Updating…' : 'Set new password'}
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
