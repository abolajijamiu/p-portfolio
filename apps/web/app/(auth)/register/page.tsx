'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { setToken } from '@/lib/http'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { User } from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (name.trim().length < 2) { setError('Enter your full name.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const { data } = await axios.post<{ accessToken: string; user: User }>(
        `${BASE}/api/v1/auth/client-register`,
        { name: name.trim(), email: email.trim().toLowerCase(), password },
        { withCredentials: true },
      )
      setToken(data.accessToken)
      router.push('/dashboard')
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Registration failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            <span className="text-ink">E</span><span className="text-brand">-Tech.</span>
          </Link>
          <p className="mt-1.5 text-sm text-muted">Create your client account</p>
        </div>

        <div className="bg-white border border-border rounded-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="Jane Smith"
              autoComplete="name"
              autoFocus
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError('') }}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />

            {error && (
              <div className="rounded-md bg-red-50 border border-red-100 px-3 py-2.5">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={!name.trim() || !email.trim() || !password || !confirm}
              className="w-full mt-1"
            >
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-ink underline underline-offset-2 hover:text-muted transition-[color] duration-150">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
