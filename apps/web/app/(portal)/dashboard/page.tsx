'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { useAuth } from '@/lib/auth'

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceOrder = {
  id: string
  orderNumber: string
  status: string
  priceCents: number
  createdAt: string
  dueDate?: string | null
  service?: { title: string; category: string } | null
  pkg?: { name: string } | null
}

type Purchase = {
  id: string
  status: string
  pricePaidCents: number
  createdAt: string
  resource: { title: string; slug: string }
  license: { name: string }
}

type Project = {
  id: string
  name: string
  status: string
  dueDate?: string | null
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const ORDER_STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  payment_received: 'bg-blue-50 text-blue-700',
  requirements_needed: 'bg-orange-50 text-orange-700',
  requirements_submitted: 'bg-sky-50 text-sky-700',
  assigned: 'bg-indigo-50 text-indigo-700',
  in_progress: 'bg-purple-50 text-purple-700',
  waiting_for_client: 'bg-amber-50 text-amber-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  revision_requested: 'bg-rose-50 text-rose-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-surface text-muted',
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting payment',
  payment_received: 'Payment received',
  requirements_needed: 'Needs requirements',
  requirements_submitted: 'Requirements sent',
  assigned: 'Expert assigned',
  in_progress: 'In progress',
  waiting_for_client: 'Waiting for you',
  delivered: 'Delivered — review',
  revision_requested: 'Revision requested',
  approved: 'Approved',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const PROJECT_STATUS_COLOR: Record<string, string> = {
  draft: 'bg-surface text-muted',
  active: 'bg-blue-50 text-blue-700',
  review: 'bg-amber-50 text-amber-700',
  complete: 'bg-green-50 text-green-700',
  archived: 'bg-surface text-muted',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBlock({ label, value, sub, href, loading }: {
  label: string
  value: string | number
  sub?: string
  href?: string
  loading?: boolean
}) {
  const inner = (
    <div className="bg-white border border-border rounded-xl px-4 py-4">
      {loading ? (
        <>
          <div className="h-7 w-12 bg-surface rounded animate-pulse mb-1" />
          <div className="h-3 w-20 bg-surface rounded animate-pulse" />
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-ink tracking-tight leading-none mb-1">{value}</p>
          <p className="text-xs text-muted">{label}</p>
          {sub && <p className="text-[10px] text-muted/60 mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  )
  return href ? <Link href={href} className="block hover:shadow-sm transition-shadow">{inner}</Link> : inner
}

function SectionHeader({ title, href, linkLabel = 'View all' }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[11px] font-semibold text-muted uppercase tracking-wider">{title}</h2>
      {href && (
        <Link href={href} className="text-xs text-muted hover:text-brand transition-colors">{linkLabel}</Link>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: orders, isLoading: ordersLoading } = useSWR<ServiceOrder[]>('/service-orders/mine')
  const { data: purchases, isLoading: purchasesLoading } = useSWR<Purchase[]>('/resource-purchases/mine')
  const { data: projects, isLoading: projectsLoading } = useSWR<Project[]>('/projects')

  useEffect(() => { document.title = 'Dashboard — E-Tech OS' }, [])

  const firstName = user?.name.split(' ')[0] ?? 'there'

  // Computed stats
  const activeOrders = orders?.filter((o) => !['completed', 'cancelled'].includes(o.status)) ?? []
  const actionNeeded = orders?.filter((o) => ['requirements_needed', 'delivered', 'waiting_for_client'].includes(o.status)) ?? []
  const activeDownloads = purchases?.filter((p) => p.status === 'active') ?? []
  const pendingDownloads = purchases?.filter((p) => p.status === 'pending_payment') ?? []
  const totalSpent = [
    ...(orders?.filter((o) => o.status !== 'cancelled').map((o) => o.priceCents) ?? []),
    ...(purchases?.filter((p) => p.status !== 'refunded').map((p) => p.pricePaidCents) ?? []),
  ].reduce((a, b) => a + b, 0)

  const recentOrders = [...(orders ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  const recentPurchases = [...(purchases ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3)
  const activeProjects = projects?.filter((p) => p.status === 'active').slice(0, 4) ?? []

  const loading = ordersLoading || purchasesLoading || projectsLoading

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-12 md:p-8 max-w-4xl">

        {/* Greeting */}
        <div className="mb-7">
          <h1 className="text-xl md:text-2xl font-semibold text-ink tracking-tight">
            Good to see you, {firstName}.
          </h1>
          <p className="text-sm text-muted mt-1">Here&apos;s everything across your workspace.</p>
        </div>

        {/* Action needed callout */}
        {!loading && actionNeeded.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-900 mb-2">
              {actionNeeded.length === 1 ? '1 order needs your attention' : `${actionNeeded.length} orders need your attention`}
            </p>
            <div className="space-y-1">
              {actionNeeded.map((o) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  className="flex items-center justify-between text-xs text-amber-800 hover:text-amber-900 py-0.5"
                >
                  <span className="font-medium truncate">{o.service?.title ?? 'Service Order'}</span>
                  <span className="shrink-0 ml-3">{ORDER_STATUS_LABEL[o.status] ?? o.status} →</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatBlock
            label="Active orders"
            value={loading ? '—' : activeOrders.length}
            sub={actionNeeded.length > 0 ? `${actionNeeded.length} need action` : undefined}
            href="/orders"
            loading={loading}
          />
          <StatBlock
            label="Downloads"
            value={loading ? '—' : activeDownloads.length}
            sub={pendingDownloads.length > 0 ? `${pendingDownloads.length} pending` : undefined}
            href="/purchases"
            loading={loading}
          />
          <StatBlock
            label="Projects"
            value={loading ? '—' : (activeProjects.length)}
            sub="active"
            href="/projects"
            loading={loading}
          />
          <StatBlock
            label="Total spent"
            value={loading ? '—' : `$${(totalSpent / 100).toLocaleString()}`}
            loading={loading}
          />
        </div>

        {/* Two-column layout for md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Recent service orders */}
          <div>
            <SectionHeader title="Recent orders" href="/orders" />
            {ordersLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <RowSkeleton key={i} />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <EmptyCard
                message="No orders yet."
                cta="Browse services"
                href="/services"
              />
            ) : (
              <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
                {recentOrders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/orders/${o.id}`}
                    className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-surface transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate leading-tight">{o.service?.title ?? 'Service Order'}</p>
                      <p className="text-[11px] text-muted mt-0.5 font-mono">{o.orderNumber}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ORDER_STATUS_COLOR[o.status] ?? 'bg-surface text-muted'}`}>
                        {ORDER_STATUS_LABEL[o.status] ?? o.status}
                      </span>
                      <p className="text-[11px] text-muted mt-1">{fmtDate(o.createdAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right column: purchases + projects */}
          <div className="space-y-6">

            {/* Recent downloads */}
            <div>
              <SectionHeader title="Downloads" href="/purchases" />
              {purchasesLoading ? (
                <div className="space-y-2">{[...Array(2)].map((_, i) => <RowSkeleton key={i} />)}</div>
              ) : recentPurchases.length === 0 ? (
                <EmptyCard message="No purchases yet." cta="Browse resources" href="/resources" />
              ) : (
                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
                  {recentPurchases.map((p) => (
                    <Link
                      key={p.id}
                      href="/purchases"
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate leading-tight">{p.resource.title}</p>
                        <p className="text-[11px] text-muted mt-0.5">{p.license.name} licence</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${p.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {p.status === 'active' ? 'Active' : 'Pending'}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Active projects */}
            <div>
              <SectionHeader title="Active projects" href="/projects" />
              {projectsLoading ? (
                <div className="space-y-2">{[...Array(2)].map((_, i) => <RowSkeleton key={i} />)}</div>
              ) : activeProjects.length === 0 ? (
                <EmptyCard message="No active projects." />
              ) : (
                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
                  {activeProjects.map((p) => (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface transition-colors"
                    >
                      <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {p.dueDate && <span className="text-[11px] text-muted">{fmtDate(p.dueDate)}</span>}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PROJECT_STATUS_COLOR[p.status] ?? 'bg-surface text-muted'}`}>
                          {p.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-8">
          <SectionHeader title="Quick actions" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Browse services', href: '/services', desc: 'Hire an expert' },
              { label: 'Browse resources', href: '/resources', desc: 'Templates & tools' },
              { label: 'My orders', href: '/orders', desc: 'Track deliveries' },
              { label: 'My downloads', href: '/purchases', desc: 'Licence keys & files' },
            ].map(({ label, href, desc }) => (
              <Link
                key={href}
                href={href}
                className="bg-white border border-border rounded-xl px-4 py-3.5 hover:border-brand/30 hover:shadow-sm transition-all duration-150"
              >
                <p className="text-sm font-semibold text-ink mb-0.5">{label}</p>
                <p className="text-xs text-muted">{desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border border-border rounded-xl bg-white animate-pulse">
      <div className="space-y-1.5">
        <div className="h-3.5 w-36 bg-surface rounded" />
        <div className="h-2.5 w-20 bg-surface rounded" />
      </div>
      <div className="h-5 w-16 bg-surface rounded-full" />
    </div>
  )
}

function EmptyCard({ message, cta, href }: { message: string; cta?: string; href?: string }) {
  return (
    <div className="py-8 text-center border border-border rounded-xl bg-white">
      <p className="text-xs text-muted">{message}</p>
      {cta && href && (
        <Link href={href} className="text-xs text-brand hover:underline mt-1 inline-block">{cta} →</Link>
      )}
    </div>
  )
}
