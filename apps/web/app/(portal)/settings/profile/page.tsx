'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'

type FieldState = { value: string; error: string }
type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function Field({
  label,
  type = 'text',
  value,
  error,
  onChange,
  autoComplete,
}: {
  label: string
  type?: string
  value: string
  error: string
  onChange: (v: string) => void
  autoComplete?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-[border-color,box-shadow] duration-150 placeholder:text-muted/50"
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  )
}

function SaveButton({ state, label = 'Save changes' }: { state: SaveState; label?: string }) {
  return (
    <button
      type="submit"
      disabled={state === 'saving'}
      className="h-9 px-4 text-sm font-semibold bg-ink text-white rounded-lg hover:bg-ink/90 disabled:opacity-50 transition-[opacity,background-color] duration-150"
    >
      {state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved' : label}
    </button>
  )
}

export default function ProfileSettingsPage() {
  const { user, refetch } = useAuth()

  // Profile form
  const [name, setName] = useState<FieldState>({ value: '', error: '' })
  const [email, setEmail] = useState<FieldState>({ value: '', error: '' })
  const [profileState, setProfileState] = useState<SaveState>('idle')
  const [profileMsg, setProfileMsg] = useState('')

  // Password form
  const [currentPw, setCurrentPw] = useState<FieldState>({ value: '', error: '' })
  const [newPw, setNewPw] = useState<FieldState>({ value: '', error: '' })
  const [confirmPw, setConfirmPw] = useState<FieldState>({ value: '', error: '' })
  const [pwState, setPwState] = useState<SaveState>('idle')
  const [pwMsg, setPwMsg] = useState('')

  useEffect(() => {
    if (user) {
      setName((s) => ({ ...s, value: s.value || user.name }))
      setEmail((s) => ({ ...s, value: s.value || user.email }))
    }
  }, [user])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    const n = name.value.trim()
    const em = email.value.trim()

    let hasError = false
    if (n.length < 2) {
      setName((s) => ({ ...s, error: 'Name must be at least 2 characters' }))
      hasError = true
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setEmail((s) => ({ ...s, error: 'Enter a valid email address' }))
      hasError = true
    }
    if (hasError) return

    setProfileState('saving')
    setProfileMsg('')
    try {
      await api.patch('/users/me', { name: n, email: em })
      await refetch()
      setProfileState('saved')
      setProfileMsg('Profile updated.')
      setTimeout(() => setProfileState('idle'), 2500)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to save'
      setProfileMsg(msg)
      setProfileState('error')
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    const cur = currentPw.value
    const nw = newPw.value
    const conf = confirmPw.value

    let hasError = false
    if (!cur) {
      setCurrentPw((s) => ({ ...s, error: 'Enter your current password' }))
      hasError = true
    }
    if (nw.length < 8) {
      setNewPw((s) => ({ ...s, error: 'Must be at least 8 characters' }))
      hasError = true
    }
    if (nw !== conf) {
      setConfirmPw((s) => ({ ...s, error: 'Passwords do not match' }))
      hasError = true
    }
    if (hasError) return

    setPwState('saving')
    setPwMsg('')
    try {
      await api.patch('/users/me/password', { currentPassword: cur, newPassword: nw })
      setPwState('saved')
      setPwMsg('Password updated.')
      setCurrentPw({ value: '', error: '' })
      setNewPw({ value: '', error: '' })
      setConfirmPw({ value: '', error: '' })
      setTimeout(() => setPwState('idle'), 2500)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to update password'
      setPwMsg(msg)
      setPwState('error')
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-xl">
        <div className="mb-7">
          <h1 className="text-xl font-semibold text-ink tracking-tight">Profile</h1>
          <p className="text-sm text-muted mt-0.5">Update your name, email, and password.</p>
        </div>

        {/* Profile */}
        <section className="bg-white border border-border rounded-xl p-6 mb-5">
          <h2 className="text-sm font-semibold text-ink mb-5">Personal information</h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <Field
              label="Full name"
              value={name.value}
              error={name.error}
              onChange={(v) => setName({ value: v, error: '' })}
              autoComplete="name"
            />
            <Field
              label="Email address"
              type="email"
              value={email.value}
              error={email.error}
              onChange={(v) => setEmail({ value: v, error: '' })}
              autoComplete="email"
            />
            <div className="flex items-center gap-3 pt-1">
              <SaveButton state={profileState} />
              {profileMsg && (
                <p className={`text-sm ${profileState === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {profileMsg}
                </p>
              )}
            </div>
          </form>
        </section>

        {/* Password */}
        <section className="bg-white border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-ink mb-5">Change password</h2>
          <form onSubmit={savePassword} className="space-y-4">
            <Field
              label="Current password"
              type="password"
              value={currentPw.value}
              error={currentPw.error}
              onChange={(v) => setCurrentPw({ value: v, error: '' })}
              autoComplete="current-password"
            />
            <Field
              label="New password"
              type="password"
              value={newPw.value}
              error={newPw.error}
              onChange={(v) => setNewPw({ value: v, error: '' })}
              autoComplete="new-password"
            />
            <Field
              label="Confirm new password"
              type="password"
              value={confirmPw.value}
              error={confirmPw.error}
              onChange={(v) => setConfirmPw({ value: v, error: '' })}
              autoComplete="new-password"
            />
            <div className="flex items-center gap-3 pt-1">
              <SaveButton state={pwState} label="Update password" />
              {pwMsg && (
                <p className={`text-sm ${pwState === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {pwMsg}
                </p>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
