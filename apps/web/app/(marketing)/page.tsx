import type { Metadata } from 'next'
import Link from 'next/link'
import { NewsletterForm } from '@/components/forms/NewsletterForm'
import { HomeFAQ } from '@/components/marketing/HomeFAQ'
import { OrderWorkspacePreview } from '@/components/marketing/PlatformPreview'
import {
  ArrowRightIcon, CheckIcon, StarIcon, PackageIcon,
  CodeIcon, PaletteIcon, MegaphoneIcon, RocketIcon, SparklesIcon,
  ShieldCheckIcon, ArrowUpRightIcon,
} from '@/components/ui/Icons'

export const metadata: Metadata = {
  title: {
    absolute: 'DeEmpireTech — Shopify Development, SEO, Analytics & Digital Services',
  },
  description:
    'DeEmpireTech delivers Shopify development, SEO strategy, analytics, and brand work as a managed service. Track every project through a dedicated client portal.',
  openGraph: {
    title: 'DeEmpireTech — Digital Agency',
    description: 'Real work. Managed service. Full portal access.',
  },
}

const METRICS = [
  { value: '247', label: 'Projects delivered since 2021' },
  { value: '9.4 days', label: 'Average project completion time' },
  { value: '4.91 / 5', label: 'Average review score across all services' },
  { value: '14', label: 'Industries served, from skincare to SaaS' },
]

const ACTIVITY_FEED = [
  { id: 'ORD-2026-0184', event: 'Shopify Store Redesign', client: 'Luminary Skincare', detail: 'Assigned to Alex M. · Day 4 of 10 · Growth package', status: 'In Progress', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200', time: 'Today, 14:22', dot: 'bg-emerald-500' },
  { id: 'ORD-2026-0181', event: 'SEO Audit & Strategy', client: 'PeakForm', detail: 'Senior QA review by Priya K. · Awaiting client sign-off', status: 'In Review', statusColor: 'text-amber-700 bg-amber-50 border-amber-200', time: 'Today, 09:47', dot: 'bg-amber-500' },
  { id: 'RES-2026-0041', event: 'Prestige Commerce Theme v1.3', client: 'Direct sale', detail: 'Downloaded · INV-2026-0041 issued · Licence key delivered', status: 'Delivered', statusColor: 'text-blue-700 bg-blue-50 border-blue-200', time: 'Yesterday, 18:03', dot: 'bg-blue-500' },
  { id: 'ORD-2026-0178', event: 'Brand Identity — Full Kit', client: 'Holloway & Co.', detail: 'Brief submitted · Assigning specialist · Est. start 19 Jun', status: 'Brief Pending', statusColor: 'text-purple-700 bg-purple-50 border-purple-200', time: 'Yesterday, 11:22', dot: 'bg-purple-500' },
  { id: 'BOOK-2026-0017', event: 'Strategy Call — 45 min', client: 'New Enquiry', detail: 'Thu 19 Jun · 15:00 BST · Video link confirmed', status: 'Confirmed', statusColor: 'text-ink bg-surface border-border', time: '2 Jun, 16:05', dot: 'bg-brand' },
]

const DISCIPLINES = [
  { category: 'Development', services: ['Shopify Stores', 'Web Applications', 'Custom Integrations'], icon: CodeIcon, color: 'text-blue-600', href: '/services#development' },
  { category: 'Marketing', services: ['SEO Strategy', 'Paid Advertising', 'Email Systems'], icon: MegaphoneIcon, color: 'text-purple-600', href: '/services#marketing' },
  { category: 'Branding', services: ['Brand Identity', 'Design Systems', 'Packaging'], icon: PaletteIcon, color: 'text-rose-600', href: '/services#branding' },
  { category: 'AI & Analytics', services: ['Analytics Dashboards', 'Performance Reports', 'Automation'], icon: SparklesIcon, color: 'text-emerald-600', href: '/services#ai_analytics' },
  { category: 'E-commerce', services: ['Conversion Optimisation', 'WooCommerce Builds', 'Post-Purchase Flows'], icon: RocketIcon, color: 'text-orange-600', href: '/services#ecommerce' },
]

const ANALYTICS_PLATFORMS = [
  'Google Analytics', 'Google Ads', 'Meta Ads', 'Shopify Analytics',
  'TikTok Ads', 'SEO Tracking', 'Email Marketing', 'Google Business Profile',
]

const FEATURED_RESOURCES = [
  { name: 'Prestige Commerce Theme', type: 'Shopify Theme', price: '$149', desc: 'High-converting Shopify theme for premium D2C brands. Built for speed and trust.', tags: ['Shopify', 'Commerce'], href: '/themes/prestige' },
  { name: 'AI Prompt Toolkit — Marketing', type: 'Prompt Pack', price: '$29', desc: '500+ GPT-4 prompts for content, ads, emails, and social. Practitioner-tested.', tags: ['AI', 'Marketing'], href: '/resources/prompts/marketing' },
  { name: 'Analytics Report Template', type: 'Template', price: '$49', desc: 'Monthly client-ready analytics report in Notion + PDF. Covers GA4, Ads, SEO.', tags: ['Analytics', 'Template'], href: '/resources/templates/analytics-report' },
]

const TESTIMONIALS_STATIC = [
  {
    quote: 'E-Tech completely transformed our Shopify store. Within 60 days of launch our conversion rate went from 1.2% to 3.1%. The team is meticulous and genuinely invested in the outcome.',
    author: 'Sarah Chen',
    role: 'Founder, Luminary Skincare',
    rating: 5,
  },
  {
    quote: 'We hired them for an analytics audit and ended up discovering €40k in monthly revenue we were leaving on the table. The report was surgical — every recommendation was actionable.',
    author: 'Marcus Osei',
    role: 'Head of Growth, Volta Digital',
    rating: 5,
  },
  {
    quote: 'The client portal is outstanding. Full visibility on every order, direct messaging with the team, and deliverables always landed on time. This is what managed services should feel like.',
    author: 'Priya Nair',
    role: 'Marketing Director, PeakForm',
    rating: 5,
  },
  {
    quote: 'Bought the Prestige theme and had it live in under a day. The quality is exceptional — feels custom-built, not like a template. Worth every cent.',
    author: 'James Holloway',
    role: 'Owner, Holloway & Co.',
    rating: 5,
  },
]

export default function HomePage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="px-5 md:px-10 lg:px-16 max-w-7xl mx-auto pt-16 pb-12 md:pt-24 md:pb-16 lg:pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-end">
            <div className="lg:pb-20">
              <p className="text-xs font-medium text-muted mb-7 tracking-wide">
                Digital agency · E-commerce · Marketing · Analytics
              </p>

              <h1 className="font-display text-[clamp(2.4rem,5.5vw,5rem)] font-bold tracking-tight text-ink leading-[1.02] mb-6">
                Shopify builds.<br />
                SEO campaigns.<br />
                Analytics that<br />
                actually answer<br />
                questions.
              </h1>

              <p className="text-base md:text-[17px] text-muted max-w-xl mb-9 leading-relaxed">
                We run digital operations as a managed service — development, marketing, brand design, and e-commerce. Every project tracked through a client portal where you see the work, the files, and the progress in real time.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-10">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 bg-ink text-white text-sm font-semibold px-5 py-3 rounded-lg hover:bg-[#1a1a1a] transition-colors duration-150"
                >
                  Browse services
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/work"
                  className="inline-flex items-center gap-2 text-sm font-medium text-ink border border-border px-5 py-3 rounded-lg hover:bg-surface transition-colors duration-150"
                >
                  See our work
                </Link>
                <Link
                  href="/book"
                  className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors duration-150"
                >
                  Book a strategy call <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-border">
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-3.5 w-3.5 text-amber-400" />
                  ))}
                  <span className="text-xs text-muted ml-1">4.9 / 5 — 200+ clients</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
                  Expert assigned within 48 hours
                </div>
              </div>
            </div>

            {/* Live order card */}
            <div className="lg:self-end">
              <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="border-b border-border px-4 py-3 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-medium text-muted">Client portal</span>
                  </div>
                  <span className="text-[10px] text-muted/60 font-mono">portal.deempiretech.com</span>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">Active Order</p>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      In Progress
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-ink mb-0.5">Shopify Store Redesign</h4>
                  <p className="text-xs text-muted mb-4">Luminary Skincare · Started 4 days ago</p>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">Progress</span>
                      <span className="font-medium text-ink">Day 4 of 10</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full w-[40%] bg-brand rounded-full" />
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    {[
                      { label: 'Requirements brief', done: true },
                      { label: 'Expert assigned — Alex M.', done: true },
                      { label: 'Homepage draft delivered', done: true },
                      { label: 'Mobile responsive pass', done: false },
                      { label: 'Final handoff & source files', done: false },
                    ].map(({ label, done }) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-100' : 'border border-border bg-white'}`}>
                          {done && <CheckIcon className="h-2.5 w-2.5 text-emerald-600" />}
                        </div>
                        <span className={`text-[12px] ${done ? 'text-muted line-through' : 'text-ink'}`}>{label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-white">AM</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-ink">Alex Morgan left a note</p>
                      <p className="text-[10px] text-muted truncate">Mobile pass starts tomorrow morning</p>
                    </div>
                    <span className="text-[10px] text-muted shrink-0">2h ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Disciplines strip ─────────────────────────────────────────────── */}
      <section className="border-y border-border bg-surface overflow-x-auto no-scrollbar">
        <div className="px-5 md:px-10 lg:px-16 max-w-7xl mx-auto">
          <div className="flex min-w-max md:min-w-0 md:grid md:grid-cols-5">
            {DISCIPLINES.map(({ category, services, icon: Icon, color, href }, i) => (
              <Link
                key={category}
                href={href}
                className={[
                  'group px-5 py-6 hover:bg-white transition-colors duration-150',
                  i < DISCIPLINES.length - 1 ? 'border-r border-border' : '',
                ].join(' ')}
              >
                <div className={`mb-3 ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-[12px] font-semibold text-ink mb-2">{category}</p>
                {services.map((s) => (
                  <p key={s} className="text-[11px] text-muted leading-relaxed">{s}</p>
                ))}
                <div className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-brand opacity-0 group-hover:opacity-100 transition-opacity duration-150 uppercase tracking-wider">
                  View <ArrowRightIcon className="h-2.5 w-2.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent platform activity ──────────────────────────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="text-xs font-semibold text-ink">Recent platform activity</p>
            </div>
            <p className="text-[10px] text-muted">Demo data — indicative of real platform volume</p>
          </div>

          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {ACTIVITY_FEED.map(({ id, event, client, detail, status, statusColor, time, dot }) => (
              <div key={id} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-surface transition-colors duration-100">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                <span className="font-mono text-[10px] text-muted/70 shrink-0 w-28 hidden sm:inline">{id}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-ink block leading-none mb-0.5">{event}</span>
                  <span className="text-[10px] text-muted hidden md:block truncate">{client} · {detail}</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 hidden sm:inline ${statusColor}`}>{status}</span>
                <span className="text-[10px] text-muted shrink-0 w-28 text-right hidden lg:block">{time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What happens after you order ──────────────────────────────────── */}
      <section className="bg-white">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-12 lg:gap-24">
            <div>
              <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Order Process</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1] mb-5">
                What happens<br />after you order.
              </h2>
              <p className="text-sm text-muted leading-relaxed mb-6">
                Most agencies keep you guessing. We don&apos;t. Every engagement follows the same sequence — and you track every step from your portal.
              </p>

              <div className="mb-6">
                <p className="text-[9px] font-bold text-muted/50 uppercase tracking-widest mb-3">Order status lifecycle</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: 'Brief Pending', active: false, done: true },
                    { label: 'Assigning', active: false, done: true },
                    { label: 'In Progress', active: true, done: false },
                    { label: 'In Review', active: false, done: false },
                    { label: 'Pending Approval', active: false, done: false },
                    { label: 'Closed', active: false, done: false },
                  ].map(({ label, active, done }, i, arr) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                        done ? 'bg-brand border-brand' : active ? 'bg-white border-brand' : 'bg-white border-border'
                      }`}>
                        {done && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        {active && <div className="w-1.5 h-1.5 rounded-full bg-brand" />}
                      </div>
                      <span className={`text-[11px] font-medium ${done || active ? 'text-ink' : 'text-muted'}`}>{label}</span>
                      {i < arr.length - 1 && (
                        <div className={`ml-1.5 w-px h-3 ${done ? 'bg-brand/40' : 'bg-border'} mt-auto -mb-1.5 ml-[7px] absolute translate-y-3`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-deep transition-colors duration-150"
              >
                View your portal <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute left-[17px] top-6 bottom-0 w-px bg-border" />
              <div className="space-y-8">
                {[
                  {
                    time: '0 – 60 min',
                    title: 'Order confirmed. Brief sent.',
                    desc: 'You receive a requirements brief via email and inside your portal. Fill it in at your pace — most take under 10 minutes.',
                    done: true,
                  },
                  {
                    time: 'Within 24 h',
                    title: 'Expert matched. Kickoff scheduled.',
                    desc: 'We assign the right specialist from our vetted network. You see their profile and availability before work begins.',
                    done: true,
                  },
                  {
                    time: 'Days 1 – 3',
                    title: 'First deliverable posted to your workspace.',
                    desc: 'A draft, plan, or initial output is uploaded to your portal. You review it with inline comments — no email chains.',
                    done: false,
                  },
                  {
                    time: 'Days 3 – 10',
                    title: 'Revision rounds. Threaded feedback.',
                    desc: 'Request changes directly in the portal. The expert responds and re-delivers. Up to 3 rounds included in most packages.',
                    done: false,
                  },
                  {
                    time: 'Final delivery',
                    title: 'Files in your dashboard. Done.',
                    desc: 'Final assets land in your delivery inbox. Download any time, indefinitely. No expiring links, no chasing anyone.',
                    done: false,
                  },
                ].map(({ time, title, desc, done }) => (
                  <div key={time} className="flex gap-5">
                    <div className="relative shrink-0 mt-1">
                      <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${done ? 'bg-brand border-brand' : 'bg-white border-border'}`}>
                        {done
                          ? <CheckIcon className="h-4 w-4 text-white" />
                          : <div className="w-2 h-2 rounded-full bg-border" />
                        }
                      </div>
                    </div>
                    <div>
                      <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${done ? 'text-brand' : 'text-muted'}`}>{time}</p>
                      <h3 className="text-[15px] font-semibold text-ink mb-1.5 tracking-tight leading-snug">{title}</h3>
                      <p className="text-sm text-muted leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Inside the portal ─────────────────────────────────────────────── */}
      <section className="bg-ink overflow-hidden">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Client Portal</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-white leading-[1.1] mb-5">
                Inside your<br />workspace.
              </h2>
              <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-sm">
                The portal is where every order lives, every file lands, and every conversation happens. No pinging us on WhatsApp to ask for an update.
              </p>
              <div className="space-y-5">
                {[
                  { label: 'Order tracking', desc: 'See exactly where your project is, day by day.' },
                  { label: 'File delivery inbox', desc: 'Deliverables land here with version history intact.' },
                  { label: 'Threaded messaging', desc: 'Talk directly to your expert, all in one thread.' },
                  { label: 'Analytics reports', desc: 'Monthly reports delivered to your account on schedule.' },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                    <div>
                      <span className="text-sm font-semibold text-white">{label}</span>
                      <span className="text-sm text-white/40"> — {desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-8 bg-white text-ink text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-surface transition-colors duration-150"
              >
                Access your portal <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            {/* Portal workspace mockup */}
            <OrderWorkspacePreview />
          </div>
        </div>
      </section>

      {/* ── Metrics ───────────────────────────────────────────────────────── */}
      <section className="bg-brand">
        <div className="px-5 md:px-10 lg:px-16 py-16 md:py-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {METRICS.map(({ value, label }) => (
              <div key={label} className="text-center md:text-left">
                <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-2">{value}</p>
                <p className="text-sm text-white/60 leading-snug max-w-[180px] md:max-w-none mx-auto md:mx-0">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Client wins — editorial layout ────────────────────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Recent Results</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1]">
                Recent client wins.
              </h2>
            </div>
            <Link
              href="/work"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-deep transition-colors duration-150 shrink-0"
            >
              All case studies <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
            <Link
              href="/work/luminary-skincare"
              className="group bg-surface border border-border rounded-2xl p-8 md:p-10 hover:border-ink/20 transition-colors duration-200"
            >
              <div className="flex items-start justify-between gap-4 mb-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-100 px-2 py-1 rounded-md">
                  E-commerce CRO
                </span>
                <span className="text-[11px] text-muted">60 days</span>
              </div>
              <p className="font-display text-[clamp(2.5rem,5vw,4rem)] font-bold text-ink leading-none tracking-tight mb-2">
                1.2% → 3.1%
              </p>
              <p className="text-sm font-medium text-muted mb-1">Conversion rate · Shopify store</p>
              <p className="text-[11px] text-muted/60 mb-8">Luminary Skincare</p>
              <p className="text-sm text-muted leading-relaxed max-w-prose">
                Full Shopify redesign with CRO-first architecture. Restructured product pages, rebuilt checkout flow, implemented trust signals. Conversion rate increased 2.4× within 60 days of launch.
              </p>
              <div className="mt-8 pt-6 border-t border-border flex items-center gap-1.5 text-sm font-medium text-ink group-hover:text-brand transition-colors duration-150">
                Read case study <ArrowRightIcon className="h-4 w-4" />
              </div>
            </Link>

            <div className="flex flex-col gap-5">
              <Link
                href="/work/volta-digital"
                className="group bg-surface border border-border rounded-2xl p-6 hover:border-ink/20 transition-colors duration-200 flex-1 flex flex-col"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md self-start">
                  Analytics Audit
                </span>
                <p className="font-display text-4xl font-bold text-ink tracking-tight mt-6 mb-1">€40k/mo</p>
                <p className="text-xs text-muted mb-1">Revenue gap identified</p>
                <p className="text-[11px] text-muted/60 mb-4">Volta Digital</p>
                <p className="text-xs text-muted leading-relaxed flex-1">
                  Analytics audit revealed a €40k monthly gap from underperforming ad sets and missed cart recovery flows.
                </p>
              </Link>

              <Link
                href="/work/peakform"
                className="group bg-surface border border-border rounded-2xl p-6 hover:border-ink/20 transition-colors duration-200 flex-1 flex flex-col"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md self-start">
                  SEO Strategy
                </span>
                <p className="font-display text-4xl font-bold text-ink tracking-tight mt-6 mb-1">+31%</p>
                <p className="text-xs text-muted mb-1">Organic traffic, Q1 2025</p>
                <p className="text-[11px] text-muted/60 mb-4">PeakForm</p>
                <p className="text-xs text-muted leading-relaxed flex-1">
                  Technical audit, Core Web Vitals improvements, and content targeting 48 high-intent keywords.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="bg-surface border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Client Testimonials</p>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1] max-w-xl">
              What clients say when the work is done.
            </h2>
          </div>
          <TestimonialsGrid />
        </div>
      </section>

      {/* ── Analytics preview ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Analytics Delivery</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1] mb-5">
                Data that drives<br />real decisions.
              </h2>
              <p className="text-base text-muted leading-relaxed mb-8">
                Order an analytics service and we connect to your platforms, build dashboards, generate reports, and deliver AI-powered recommendations — on a schedule you control.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Full-funnel reporting across all channels',
                  'AI-generated insights and recommendations',
                  'Scheduled monthly or weekly delivery',
                  'Live dashboard access through your portal',
                  'Competitor analysis and benchmark tracking',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckIcon className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-sm text-ink/80">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/services/ai-analytics"
                className="inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-deep transition-colors duration-150"
              >
                View analytics services <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative">
              <div className="bg-ink rounded-2xl p-6 shadow-2xl shadow-ink/20">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  <span className="text-[11px] text-white/30 ml-2 font-mono">analytics-dashboard.deempiretech</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Revenue MTD', value: '$84,320', change: '+23%', up: true },
                    { label: 'Conv. Rate', value: '3.7%', change: '+1.2pp', up: true },
                    { label: 'Organic Traffic', value: '12,840', change: '+31%', up: true },
                    { label: 'ROAS (Meta)', value: '4.2×', change: '+0.8×', up: true },
                  ].map(({ label, value, change, up }) => (
                    <div key={label} className="bg-white/[0.06] rounded-xl p-4">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">{label}</p>
                      <p className="text-xl font-bold text-white mb-1">{value}</p>
                      <p className={`text-[11px] font-semibold ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {up ? '↑' : '↓'} {change}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-white/[0.06] rounded-xl p-4">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3">Connected Platforms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ANALYTICS_PLATFORMS.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-medium text-white/60 bg-white/[0.07] px-2 py-0.5 rounded border border-white/10"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand rounded-xl opacity-10 blur-2xl pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Resources ─────────────────────────────────────────────────────── */}
      <section className="bg-surface border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Resources</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1]">
                Built by the team.<br />Sold separately.
              </h2>
            </div>
            <Link
              href="/themes"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-deep transition-colors duration-150 shrink-0"
            >
              Browse all resources <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {FEATURED_RESOURCES.map(({ name, type, price, desc, tags, href }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col bg-white border border-border rounded-xl overflow-hidden hover:border-brand/30 hover:shadow-lg hover:shadow-brand/[0.06] transition-all duration-200"
              >
                <div className="aspect-[16/10] bg-surface flex items-center justify-center border-b border-border relative">
                  <PackageIcon className="h-8 w-8 text-muted/30" />
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-bold text-ink bg-white border border-border px-2 py-0.5 rounded-md shadow-sm">
                      {price}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">{type}</span>
                  <h3 className="text-[14px] font-semibold text-ink tracking-tight mb-2 leading-snug">{name}</h3>
                  <p className="text-xs text-muted leading-relaxed flex-1">{desc}</p>
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {tags.map((t) => (
                        <span key={t} className="text-[10px] font-medium text-ink/60 bg-surface px-2 py-0.5 rounded border border-border">
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-medium text-brand group-hover:text-brand-deep transition-colors">
                      Get it →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder + comparison ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-12 lg:gap-20">
            <div>
              <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">From the Founder</p>
              <blockquote className="font-display text-[clamp(1.25rem,2.5vw,2rem)] font-medium text-ink leading-[1.35] tracking-tight mb-8">
                &ldquo;I built DeEmpireTech because I couldn&apos;t find an agency that worked the way I wanted to buy from one. You couldn&apos;t see what was being built. You couldn&apos;t talk to the person actually doing it. Invoices came before results did.&rdquo;
              </blockquote>
              <p className="text-sm text-muted leading-relaxed mb-5">
                Every project at DeEmpireTech runs through the portal. Every expert is vetted and reviewed. Every deliverable is tracked. You know what&apos;s happening — not because we send a weekly status email, but because you can log in and see it yourself.
              </p>
              <p className="text-sm text-muted leading-relaxed">
                We&apos;re not a content mill or a freelancer marketplace. We&apos;re building a team-as-a-service model where the quality is consistent, the process is transparent, and the results are what you hired us for.
              </p>
              <div className="mt-8 pt-6 border-t border-border flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-white">JA</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Jamiu A.</p>
                  <p className="text-xs text-muted">Founder, DeEmpireTech</p>
                </div>
                <Link
                  href="/contact"
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-deep transition-colors duration-150"
                >
                  Get in touch <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Comparison table */}
            <div className="border border-border rounded-2xl overflow-hidden self-start">
              <div className="grid grid-cols-2">
                <div className="p-5 border-r border-border">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-rose-600 mb-5">Typical agency</p>
                  {[
                    'Opaque timelines',
                    'Hard to reach mid-project',
                    'Deliverables by email',
                    'Weekly status calls',
                    'Revision requests get lost',
                    'Invoice before delivery',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5 mb-3.5">
                      <span className="text-rose-400 text-sm leading-none mt-0.5">✕</span>
                      <span className="text-xs text-muted leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="p-5 bg-surface">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-5">DeEmpireTech</p>
                  {[
                    'Day-by-day progress view',
                    'Portal messaging always on',
                    'Files in your dashboard',
                    'Always visible, no calls needed',
                    'Inline comments, tracked',
                    'Milestone-based payment',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5 mb-3.5">
                      <CheckIcon className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-ink leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How we operate ────────────────────────────────────────────────── */}
      <section className="bg-surface border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Operational Standards</p>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1] max-w-2xl">
              How we actually operate.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border rounded-2xl overflow-hidden">
            {[
              { label: 'Response time', value: '< 4 hours', detail: 'Business hours Mon–Fri, 09:00–18:00 GMT. Urgent escalations acknowledged within 1 hour.' },
              { label: 'Expert assignment', value: '≤ 24 hours', detail: "Post-brief submission. You see the expert's profile and review score before work begins." },
              { label: 'Revision policy', value: '3 rounds', detail: 'Included in most packages. Additional rounds scoped and priced separately after round 3.' },
              { label: 'QA before delivery', value: 'Required', detail: 'Every deliverable passes a senior review pass before client visibility. QA log attached to order record.' },
              { label: 'File retention', value: '2 years', detail: 'All project files remain accessible in your portal dashboard and are downloadable at any time.' },
              { label: 'Ownership transfer', value: 'On closure', detail: 'Full IP transfers to the client on payment confirmation. Source files included unless stated otherwise.' },
              { label: 'Escalation path', value: 'Direct to founder', detail: 'If a project stalls or a quality issue persists beyond 48 hours, it escalates to the founding team.' },
              { label: 'Delivery format', value: 'Portal + email', detail: 'Files delivered to your order workspace. Email confirmation sent on every upload.' },
              { label: 'Post-delivery support', value: '14 days', detail: 'Minor amendments and clarification requests handled without a new order within 14 days of delivery.' },
            ].map(({ label, value, detail }) => (
              <div key={label} className="bg-white p-6">
                <p className="text-[9px] font-bold text-muted/60 uppercase tracking-widest mb-2">{label}</p>
                <p className="text-lg font-bold text-ink mb-2 tracking-tight">{value}</p>
                <p className="text-xs text-muted leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Articles ──────────────────────────────────────────────────────── */}
      <section className="bg-surface border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">From the Blog</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1]">
                How we think<br />about the work.
              </h2>
            </div>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-deep transition-colors duration-150 shrink-0"
            >
              All articles <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <ArticlesFeed />
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Common Questions</p>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1]">
              Before you order.
            </h2>
          </div>
          <HomeFAQ />
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-ink relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_110%,rgba(30,58,138,0.4),transparent)] pointer-events-none" />
        <div className="relative px-5 md:px-10 lg:px-16 py-20 md:py-36 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h2 className="font-display text-[clamp(2rem,4.5vw,4.5rem)] font-bold tracking-tight text-white leading-[1.05] mb-6">
              Ready to start a project?
            </h2>
            <p className="text-white/50 text-base md:text-xl mb-12 leading-relaxed max-w-xl">
              Browse services, book a call, or send us a message. Projects start within 48 hours of confirmation.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 bg-white text-ink text-sm font-bold px-7 py-3.5 rounded-lg hover:bg-surface transition-colors duration-150"
              >
                Browse services <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 border border-white/20 text-white text-sm font-medium px-7 py-3.5 rounded-lg hover:bg-white/[0.06] transition-colors duration-150"
              >
                Book a strategy call
              </Link>
              <a
                href="https://wa.me/447478034171"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/40 text-sm font-medium hover:text-white transition-colors duration-150"
              >
                WhatsApp us <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────────────────────── */}
      <section className="bg-surface border-t border-border">
        <div className="px-5 md:px-10 lg:px-16 py-16 max-w-7xl mx-auto">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-display text-xl font-bold text-ink mb-2">Stay sharp. Subscribe free.</h3>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              Weekly insights on digital strategy, marketing, and the tools actually worth your time.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  )
}

// ─── Server components ────────────────────────────────────────────────────────

type TestimonialItem = { quote: string; author: string; role: string; rating: number }

async function TestimonialsGrid() {
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  let items: TestimonialItem[] = TESTIMONIALS_STATIC

  try {
    const res = await fetch(`${API}/cms/testimonials/published`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        items = data.map((t: { client: string; role?: string | null; company?: string | null; quote: string; rating?: number | null }) => ({
          author: t.client,
          role: [t.role, t.company].filter(Boolean).join(', '),
          quote: t.quote,
          rating: t.rating ?? 5,
        }))
      }
    }
  } catch { /* fall through */ }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {items.map(({ quote, author, role, rating }) => (
        <div
          key={author}
          className="bg-white border border-border rounded-xl p-7 flex flex-col hover:shadow-md hover:shadow-ink/[0.04] transition-shadow duration-200"
        >
          {rating > 0 && (
            <div className="flex gap-0.5 mb-5">
              {[...Array(rating)].map((_, i) => (
                <StarIcon key={i} className="h-4 w-4 text-amber-400" />
              ))}
            </div>
          )}
          <p className="text-[15px] text-ink leading-relaxed flex-1 mb-6">&ldquo;{quote}&rdquo;</p>
          <div className="flex items-center gap-3 pt-5 border-t border-border">
            <div className="w-9 h-9 rounded-full bg-brand-dim flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-brand">
                {author.split(' ').map((n: string) => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{author}</p>
              <p className="text-xs text-muted">{role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

async function ArticlesFeed() {
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

  const PLACEHOLDER_ARTICLES = [
    { id: '1', title: 'How We Increased Shopify Conversions by 2.4× in 90 Days', excerpt: 'A detailed breakdown of the CRO process we used on a premium D2C skincare brand.', category: 'ecommerce', slug: 'shopify-conversion-rate-optimisation', readingMinutes: 8 },
    { id: '2', title: 'The Analytics Stack Every Growing Business Needs in 2025', excerpt: 'Stop drowning in dashboards. Here\'s the lean reporting setup that actually drives decisions.', category: 'analytics', slug: 'analytics-stack-2025', readingMinutes: 6 },
    { id: '3', title: 'Why Most Brand Redesigns Fail (And What To Do Instead)', excerpt: 'The uncomfortable truth about rebrands — and the process we follow to make them land.', category: 'branding', slug: 'why-brand-redesigns-fail', readingMinutes: 5 },
  ]

  let articles = PLACEHOLDER_ARTICLES

  try {
    const res = await fetch(`${API}/cms/articles/published?limit=3`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) articles = data
    }
  } catch { /* fall through */ }

  const CATEGORY_LABELS: Record<string, string> = {
    ecommerce: 'E-commerce', analytics: 'Analytics', branding: 'Branding',
    marketing: 'Marketing', development: 'Development', strategy: 'Strategy', ai: 'AI',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {articles.map((a) => (
        <Link
          key={a.id ?? a.slug}
          href={`/articles/${a.slug}`}
          className="group flex flex-col bg-white border border-border rounded-xl p-6 hover:border-brand/30 hover:shadow-md hover:shadow-brand/[0.06] transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold text-brand uppercase tracking-wider bg-brand-dim px-2.5 py-1 rounded-md">
              {CATEGORY_LABELS[a.category] ?? a.category}
            </span>
            <span className="text-[11px] text-muted">{a.readingMinutes ?? 5} min read</span>
          </div>
          <h3 className="text-[15px] font-semibold text-ink leading-snug tracking-tight mb-3 flex-1 group-hover:text-brand transition-colors duration-150">
            {a.title}
          </h3>
          <p className="text-sm text-muted leading-relaxed mb-5 line-clamp-2">{a.excerpt}</p>
          <div className="flex items-center gap-1 text-xs font-medium text-brand opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Read article <ArrowRightIcon className="h-3.5 w-3.5" />
          </div>
        </Link>
      ))}
    </div>
  )
}
