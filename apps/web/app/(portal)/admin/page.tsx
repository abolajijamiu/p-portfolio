'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardStats = {
  orders: {
    total: number
    active: number
    completed: number
    cancelled: number
    byStatus: Record<string, number>
    revenueCents: number
  }
  resources: { sold: number; revenueCents: number }
  bookings: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
    revenueCents: number
  }
  payouts: { pendingCents: number; paidCents: number; totalRecords: number }
  inquiries: { newCount: number; total: number }
  revenue: { totalCents: number }
}

type ActivityEvent = {
  type: 'order' | 'booking' | 'purchase' | 'inquiry'
  id: string
  label: string
  sub: string
  status: string
  href: string
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(cents: number) {
  if (cents >= 100_000_00) return `$${(cents / 100_000_00).toFixed(1)}M`
  if (cents >= 1_000_00) return `$${(cents / 1_000_00).toFixed(1)}k`
  return `$${(cents / 100).toLocaleString()}`
}

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const EVENT_TYPE_COLOR: Record<ActivityEvent['type'], string> = {
  order: 'bg-indigo-100 text-indigo-600',
  booking: 'bg-purple-100 text-purple-600',
  purchase: 'bg-emerald-100 text-emerald-600',
  inquiry: 'bg-amber-100 text-amber-600',
}

const EVENT_TYPE_LABEL: Record<ActivityEvent['type'], string> = {
  order: 'Order',
  booking: 'Booking',
  purchase: 'Purchase',
  inquiry: 'Inquiry',
}

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-amber-400',
  confirmed: 'bg-emerald-400',
  completed: 'bg-emerald-600',
  in_progress: 'bg-purple-400',
  delivered: 'bg-emerald-400',
  revision_requested: 'bg-rose-400',
  cancelled: 'bg-neutral-300',
  new: 'bg-sky-400',
  read: 'bg-neutral-300',
  active: 'bg-emerald-400',
  payment_received: 'bg-sky-400',
  assigned: 'bg-indigo-400',
}

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-surface rounded animate-pulse ${className}`} />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: 'Service Orders', href: '/admin/service-orders', desc: 'All client orders' },
  { label: 'Inbox', href: '/admin/inbox', desc: 'Order messages' },
  { label: 'Bookings', href: '/admin/bookings', desc: 'Consultation calendar' },
  { label: 'Payouts', href: '/admin/payouts', desc: 'Expert payments' },
  { label: 'Resources', href: '/admin/resources', desc: 'Digital downloads' },
  { label: 'Inquiries', href: '/admin/inquiries', desc: 'Contact submissions' },
]

const CONTENT_LINKS = [
  { label: 'Themes', href: '/admin/themes' },
  { label: 'Work', href: '/admin/work' },
  { label: 'Articles', href: '/admin/articles' },
  { label: 'Media', href: '/admin/media' },
  { label: 'Testimonials', href: '/admin/testimonials' },
  { label: 'Commerce', href: '/admin/commerce' },
  { label: 'Campaigns', href: '/admin/campaigns' },
  { label: 'Analytics', href: '/admin/analytics' },
]

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useSWR<DashboardStats>('/cms/dashboard/stats')
  const { data: activity, isLoading: activityLoading } = useSWR<ActivityEvent[]>('/cms/dashboard/activity')

  useEffect(() => { document.title = 'Admin — E-Tech OS' }, [])

  const totalRevenue = stats?.revenue.totalCents ?? 0
  const orderPipeline = stats
    ? [
        { label: 'Payment received', count: stats.orders.byStatus['payment_received'] ?? 0, color: 'bg-sky-400' },
        { label: 'Needs requirements', count: stats.orders.byStatus['requirements_needed'] ?? 0, color: 'bg-amber-400' },
        { label: 'Requirements in', count: stats.orders.byStatus['requirements_submitted'] ?? 0, color: 'bg-amber-300' },
        { label: 'Assigned', count: stats.orders.byStatus['assigned'] ?? 0, color: 'bg-indigo-400' },
        { label: 'In progress', count: stats.orders.byStatus['in_progress'] ?? 0, color: 'bg-purple-400' },
        { label: 'Delivered', count: stats.orders.byStatus['delivered'] ?? 0, color: 'bg-emerald-400' },
        { label: 'Revision needed', count: stats.orders.byStatus['revision_requested'] ?? 0, color: 'bg-rose-400' },
        { label: 'Completed', count: stats.orders.byStatus['completed'] ?? 0, color: 'bg-emerald-600' },
      ]
    : []

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-14 md:p-8 max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-ink tracking-tight">Overview</h1>
          <p className="text-sm text-muted mt-1">E-Tech OS — platform health at a glance.</p>
        </div>

        {/* Revenue row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            {
              label: 'Total revenue',
              value: statsLoading ? null : fmtMoney(totalRevenue),
              sub: 'orders + resources + bookings',
              href: undefined,
            },
            {
              label: 'Service revenue',
              value: statsLoading ? null : fmtMoney(stats?.orders.revenueCents ?? 0),
              sub: `${stats?.orders.total ?? 0} orders`,
              href: '/admin/service-orders',
            },
            {
              label: 'Resource revenue',
              value: statsLoading ? null : fmtMoney(stats?.resources.revenueCents ?? 0),
              sub: `${stats?.resources.sold ?? 0} sold`,
              href: '/admin/resources',
            },
            {
              label: 'Booking revenue',
              value: statsLoading ? null : fmtMoney(stats?.bookings.revenueCents ?? 0),
              sub: `${stats?.bookings.total ?? 0} total`,
              href: '/admin/bookings',
            },
          ].map(({ label, value, sub, href }) => {
            const card = (
              <div className="bg-white border border-border rounded-xl px-4 py-4 h-full">
                {statsLoading ? (
                  <>
                    <Skeleton className="h-7 w-20 mb-1.5" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-ink tracking-tight leading-none mb-1">{value}</p>
                    <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">{label}</p>
                    <p className="text-[11px] text-muted mt-0.5">{sub}</p>
                  </>
                )}
              </div>
            )
            return href ? (
              <Link key={label} href={href} className="block hover:shadow-sm transition-shadow">{card}</Link>
            ) : (
              <div key={label}>{card}</div>
            )
          })}
        </div>

        {/* Middle row: order pipeline + activity */}
        <div className="grid md:grid-cols-[1fr_320px] gap-6 mb-8">

          {/* Order pipeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-semibold text-muted uppercase tracking-wider">Order pipeline</h2>
              <Link href="/admin/service-orders" className="text-xs text-muted hover:text-brand transition-colors">View all</Link>
            </div>
            {statsLoading ? (
              <div className="bg-white border border-border rounded-xl divide-y divide-border overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-5 w-8 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-border rounded-xl divide-y divide-border overflow-hidden">
                {orderPipeline.map(({ label, count, color }) => (
                  count > 0 || label === 'In progress' ? (
                    <div key={label} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${color}`} />
                        <p className="text-sm text-ink">{label}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${count > 0 ? 'bg-ink text-white' : 'bg-surface text-muted'}`}>
                        {count}
                      </span>
                    </div>
                  ) : null
                ))}
                <div className="px-4 py-3 flex items-center justify-between bg-surface/50">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">Active total</p>
                  <span className="text-xs font-bold text-ink">{stats?.orders.active ?? 0}</span>
                </div>
              </div>
            )}

            {/* Second row of cards */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: 'Pending payouts', value: fmtMoney(stats?.payouts.pendingCents ?? 0), href: '/admin/payouts', color: 'text-amber-600' },
                { label: 'Bookings confirmed', value: stats?.bookings.confirmed ?? 0, href: '/admin/bookings', color: 'text-ink' },
                { label: 'New inquiries', value: stats?.inquiries.newCount ?? 0, href: '/admin/inquiries', color: (stats?.inquiries.newCount ?? 0) > 0 ? 'text-rose-600' : 'text-ink' },
              ].map(({ label, value, href, color }) => (
                <Link key={label} href={href} className="bg-white border border-border rounded-xl px-3 py-3 hover:shadow-sm transition-shadow">
                  {statsLoading ? (
                    <>
                      <Skeleton className="h-6 w-12 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </>
                  ) : (
                    <>
                      <p className={`text-xl font-bold tracking-tight leading-none mb-1 ${color}`}>{value}</p>
                      <p className="text-[11px] text-muted">{label}</p>
                    </>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-semibold text-muted uppercase tracking-wider">Recent activity</h2>
            </div>
            <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
              {activityLoading ? (
                [...Array(8)].map((_, i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-3">
                    <Skeleton className="h-6 w-16 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))
              ) : !activity || activity.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted">No activity yet.</div>
              ) : (
                activity.map((event) => (
                  <Link
                    key={`${event.type}-${event.id}`}
                    href={event.href}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-surface transition-colors"
                  >
                    <span className={`mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${EVENT_TYPE_COLOR[event.type]}`}>
                      {EVENT_TYPE_LABEL[event.type]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-ink truncate">{event.label}</p>
                      <p className="text-[11px] text-muted truncate">{event.sub}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[event.status] ?? 'bg-neutral-300'}`} />
                      </div>
                      <p className="text-[10px] text-muted mt-0.5">{fmtRelative(event.createdAt)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="mb-8">
          <h2 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Operations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {QUICK_LINKS.map(({ label, href, desc }) => (
              <Link
                key={href}
                href={href}
                className="bg-white border border-border rounded-xl px-4 py-3.5 hover:shadow-sm transition-shadow group"
              >
                <p className="text-sm font-semibold text-ink group-hover:text-brand transition-colors">{label}</p>
                <p className="text-[11px] text-muted mt-0.5">{desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Content section */}
        <div>
          <h2 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Content</h2>
          <div className="flex flex-wrap gap-2">
            {CONTENT_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-border text-muted hover:text-ink hover:border-ink/20 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
