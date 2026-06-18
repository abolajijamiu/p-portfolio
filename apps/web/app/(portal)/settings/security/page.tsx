'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'

type Status = { enabled: boolean }
type SetupData = { secret: string; otpauthUrl: string; qrDataUrl: string }

export default function SecuritySettingsPage() {
  const { data: status, isLoading, mutate } = useSWR<Status>('/auth/2fa/status')
  const [setupData, setSetupData] = useState<SetupData | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [showDisable, setShowDisable] = useState(false)

  useEffect(() => { document.title = 'Security — Settings' }, [])

  async function startSetup() {
    setBusy(true)
    setError('')
    try {
      const data = await api.post<SetupData>('/auth/2fa/setup')
      setSetupData(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  async function confirmEnable() {
    if (!code.trim()) return
    setBusy(true)
    setError('')
    try {
      await api.post('/auth/2fa/enable', { code })
      setSetupData(null)
      setCode('')
      setSuccess('Two-factor authentication is now active.')
      mutate({ enabled: true })
    } catch (e: unknown) {
      setError('Invalid code. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function confirmDisable() {
    if (!disableCode.trim()) return
    setBusy(true)
    setError('')
    try {
      await api.post('/auth/2fa/disable', { code: disableCode })
      setShowDisable(false)
      setDisableCode('')
      setSuccess('Two-factor authentication has been disabled.')
      mutate({ enabled: false })
    } catch (e: unknown) {
      setError('Invalid code. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const inputCls = 'w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand tracking-[0.3em] text-center font-mono text-lg'

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-xl">

        <div className="mb-8">
          <h1 className="text-xl font-semibold text-ink tracking-tight">Security</h1>
          <p className="text-sm text-muted mt-0.5">Manage two-factor authentication for your account</p>
        </div>

        {success && (
          <div className="mb-5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* 2FA status card */}
        <div className="bg-white border border-border rounded-xl p-5 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">Authenticator app (TOTP)</h2>
              <p className="text-xs text-muted mt-1">
                Use an authenticator app like Google Authenticator or Authy to generate one-time codes when you sign in.
              </p>
            </div>
            {!isLoading && (
              <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${status?.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-surface text-muted'}`}>
                {status?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            )}
          </div>

          {!isLoading && !status?.enabled && !setupData && (
            <button
              onClick={startSetup}
              disabled={busy}
              className="mt-4 text-xs font-semibold text-brand hover:underline disabled:opacity-50"
            >
              {busy ? 'Loading…' : 'Set up 2FA →'}
            </button>
          )}

          {!isLoading && status?.enabled && !showDisable && (
            <button
              onClick={() => setShowDisable(true)}
              className="mt-4 text-xs text-rose-500 hover:underline"
            >
              Disable 2FA
            </button>
          )}
        </div>

        {/* Setup flow */}
        {setupData && (
          <div className="bg-white border border-border rounded-xl p-5 mb-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Step 1 — Scan this QR code</h3>
            <div className="flex justify-center mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={setupData.qrDataUrl} alt="2FA QR code" className="h-40 w-40 rounded-lg border border-border" />
            </div>
            <p className="text-xs text-muted text-center mb-5">
              Can&apos;t scan? Enter this code manually in your app:
              <span className="block mt-1 font-mono text-xs text-ink bg-surface rounded px-2 py-1 tracking-widest">{setupData.secret}</span>
            </p>

            <h3 className="text-sm font-semibold text-ink mb-3">Step 2 — Enter the 6-digit code</h3>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className={inputCls}
            />
            {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setSetupData(null); setCode('') }} className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-ink">
                Cancel
              </button>
              <button
                onClick={confirmEnable}
                disabled={busy || code.length < 6}
                className="flex-1 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand/90 disabled:opacity-50"
              >
                {busy ? 'Verifying…' : 'Enable 2FA'}
              </button>
            </div>
          </div>
        )}

        {/* Disable flow */}
        {showDisable && (
          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">Confirm with authenticator code</h3>
            <input
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className={inputCls}
            />
            {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowDisable(false); setDisableCode('') }} className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-ink">
                Cancel
              </button>
              <button
                onClick={confirmDisable}
                disabled={busy || disableCode.length < 6}
                className="flex-1 py-2.5 rounded-lg bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 disabled:opacity-50"
              >
                {busy ? 'Disabling…' : 'Disable 2FA'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
