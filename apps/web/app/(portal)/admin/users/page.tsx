'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { initials } from '@/lib/utils'

type UserRow = {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  role: string
  createdAt: string
}

const ROLE_STYLE: Record<string, string> = {
  owner: 'bg-violet-50 text-violet-700 border-violet-100',
  admin: 'bg-blue-50 text-blue-700 border-blue-100',
  expert: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  member: 'bg-surface text-muted border-border',
  client: 'bg-emerald-50 text-emerald-700 border-emerald-100',
}

const ASSIGNABLE_ROLES = ['admin', 'expert', 'member', 'client'] as const

// ─── Invite modal ─────────────────────────────────────────────────────────────

function InviteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<(typeof ASSIGNABLE_ROLES)[number]>('client')
  const [error, setError] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) { setError('Enter the person\'s full name.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address.'); return }

    setState('sending')
    try {
      await api.post('/auth/invite', { name: name.trim(), email: email.trim().toLowerCase(), role })
      setState('sent')
      onSuccess()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to send invite'
      setError(msg)
      setState('idle')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl border border-border shadow-xl w-full max-w-sm p-6">
        {state === 'sent' ? (
          <div className="text-center py-4">
            <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-ink mb-0.5">Invite sent</p>
            <p className="text-xs text-muted mb-5">
              {name} will receive an email with a link to set up their account.
            </p>
            <button onClick={onClose} className="w-full h-9 text-sm font-semibold bg-ink text-white rounded-lg hover:bg-ink/90 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-ink">Invite team member</h2>
              <button onClick={onClose} className="text-muted hover:text-ink transition-colors" aria-label="Close">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={send} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-[border-color,box-shadow] duration-150 placeholder:text-muted/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-[border-color,box-shadow] duration-150 placeholder:text-muted/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as typeof role)}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white transition-[border-color,box-shadow] duration-150"
                >
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
                <p className="text-[11px] text-muted mt-1.5">
                  {role === 'client' && 'Can place orders and book sessions.'}
                  {role === 'expert' && 'Can receive and work on assigned orders.'}
                  {role === 'member' && 'Has access to projects and the portal.'}
                  {role === 'admin' && 'Full access to manage the workspace.'}
                </p>
              </div>

              {error && (
                <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-9 text-sm font-medium border border-border rounded-lg text-muted hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={state === 'sending'}
                  className="flex-1 h-9 text-sm font-semibold bg-ink text-white rounded-lg hover:bg-ink/90 disabled:opacity-50 transition-colors"
                >
                  {state === 'sending' ? 'Sending…' : 'Send invite'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const { user: self } = useAuth()
  const { data: users, isLoading, mutate } = useSWR<UserRow[]>('/users')
  const [changing, setChanging] = useState<string | null>(null)
  const [showInvite, setShowInvite] = useState(false)

  async function changeRole(userId: string, role: string) {
    setChanging(userId)
    try {
      await api.patch(`/users/${userId}/role`, { role })
      mutate(users?.map((u) => u.id === userId ? { ...u, role } : u), false)
    } catch {
      // row reverts automatically
    } finally {
      setChanging(null)
    }
  }

  const sorted = [...(users ?? [])].sort((a, b) => {
    const rank = { owner: 4, admin: 3, expert: 2, member: 2, client: 1 }
    return (rank[b.role as keyof typeof rank] ?? 0) - (rank[a.role as keyof typeof rank] ?? 0)
  })

  return (
    <>
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={() => { mutate(); }}
        />
      )}

      <div className="h-full overflow-y-auto">
        <div className="px-4 pt-6 pb-10 md:p-8 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-ink tracking-tight">Users</h1>
              <p className="text-sm text-muted mt-0.5">{users?.length ?? '—'} members in this workspace</p>
            </div>
            <button
              onClick={() => setShowInvite(true)}
              className="h-9 px-4 text-sm font-semibold bg-ink text-white rounded-lg hover:bg-ink/90 transition-colors"
            >
              + Invite
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-white border border-border rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3">User</th>
                    <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">Email</th>
                    <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3">Role</th>
                    <th className="text-left text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Joined</th>
                    <th className="text-right text-[10px] font-semibold text-muted uppercase tracking-wider px-4 py-3">Change role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sorted.map((u) => {
                    const isSelf = u.id === self?.id
                    return (
                      <tr key={u.id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                              <span className="text-[11px] font-semibold text-brand">{initials(u.name)}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-ink leading-tight">
                                {u.name}
                                {isSelf && <span className="ml-1.5 text-[10px] font-medium text-muted">(you)</span>}
                              </p>
                              <p className="text-[11px] text-muted md:hidden">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <p className="text-sm text-muted">{u.email}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${ROLE_STYLE[u.role] ?? 'bg-surface text-muted border-border'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <p className="text-xs text-muted">
                            {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {isSelf || u.role === 'owner' ? (
                            <span className="text-xs text-muted/50">—</span>
                          ) : (
                            <select
                              value={u.role}
                              disabled={changing === u.id}
                              onChange={(e) => changeRole(u.id, e.target.value)}
                              className="text-xs text-ink bg-surface border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:opacity-50 transition-[border-color,box-shadow] duration-150"
                            >
                              {ASSIGNABLE_ROLES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
