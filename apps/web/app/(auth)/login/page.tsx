'use client'

import { useState, useEffect, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '@/lib/auth'
import { setToken } from '@/lib/http'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { User } from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [resetSuccess, setResetSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setResetSuccess(new URLSearchParams(window.location.search).get('reset') === '1')
  }, [])

  // 2FA challenge state
  const [pendingToken, setPendingToken] = useState<string | null>(null)
  const [totpCode, setTotpCode] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setError('')
    setLoading(true)
    try {
      const { data } = await axios.post<
        { accessToken: string; user: User } | { requires2FA: true; pendingToken: string }
      >(
        `${BASE}/api/v1/auth/login`,
        { email: email.trim(), password },
        { withCredentials: true },
      )

      if ('requires2FA' in data) {
        setPendingToken(data.pendingToken)
        return
      }

      setToken(data.accessToken)
      router.push('/dashboard')
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Login failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleTotpVerify(e: FormEvent) {
    e.preventDefault()
    if (!totpCode || totpCode.length < 6) return
    setError('')
    setLoading(true)
    try {
      const { data } = await axios.post<{ accessToken: string; user: User }>(
        `${BASE}/api/v1/auth/2fa/verify`,
        { pendingToken, code: totpCode },
        { withCredentials: true },
      )
      setToken(data.accessToken)
      router.push('/dashboard')
    } catch {
      setError('Invalid authenticator code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── 2FA challenge step ────────────────────────────────────────────────────
  if (pendingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              <span className="text-ink">E</span><span className="text-brand">-Tech.</span>
            </Link>
            <p className="mt-1.5 text-sm text-muted">Two-factor authentication</p>
          </div>

          <div className="bg-white border border-border rounded-xl p-6 md:p-8">
            <p className="text-sm text-muted mb-5 text-center">
              Enter the 6-digit code from your authenticator app.
            </p>
            <form onSubmit={handleTotpVerify} className="space-y-4" noValidate>
              <input
                value={totpCode}
                onChange={(e) => { setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                placeholder="000000"
                maxLength={6}
                autoFocus
                className="w-full rounded-lg border border-border px-3 py-3 text-center font-mono text-xl text-ink tracking-[0.4em] placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />

              {error && (
                <div className="rounded-md bg-red-50 border border-red-100 px-3 py-2.5">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                loading={loading}
                disabled={totpCode.length < 6}
                className="w-full"
              >
                Verify
              </Button>

              <button
                type="button"
                onClick={() => { setPendingToken(null); setTotpCode(''); setError('') }}
                className="w-full text-xs text-muted hover:text-ink text-center"
              >
                ← Back to login
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── Normal login step ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            <span className="text-ink">E</span><span className="text-brand">-Tech.</span>
          </Link>
          <p className="mt-1.5 text-sm text-muted">Sign in to your workspace</p>
        </div>

        <div className="bg-white border border-border rounded-xl p-6 md:p-8">
          {resetSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
              <p className="text-sm text-emerald-700 font-medium">Password updated. You can now sign in.</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="you@company.com"
              autoComplete="email"
              autoFocus
              required
            />
            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <div className="mt-1.5 text-right">
                <Link href="/forgot-password" className="text-xs text-muted hover:text-brand transition-[color] duration-150">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-100 px-3 py-2.5">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={!email.trim() || !password}
              className="w-full mt-1"
            >
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          New client?{' '}
          <Link href="/register" className="text-ink underline underline-offset-2 hover:text-muted transition-[color] duration-150">
            Create an account
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-muted">
          Having trouble?{' '}
          <a href="mailto:hello@deempiretech.com" className="text-ink underline underline-offset-2 hover:text-muted transition-[color] duration-150">
            Contact support
          </a>
        </p>
      </div>
    </div>
  )
}
