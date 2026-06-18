import type { Metadata } from 'next'
import Link from 'next/link'
import { NewsletterForm } from '@/components/forms/NewsletterForm'
import { HomeFAQ } from '@/components/marketing/HomeFAQ'
import {
  ArrowRightIcon, CheckIcon, StarIcon, UsersIcon,
  LayersIcon, PackageIcon, CalendarIcon, MessageSquareIcon, TrendingUpIcon,
  CodeIcon, PaletteIcon, MegaphoneIcon, RocketIcon, SparklesIcon, ZapIcon,
  ShieldCheckIcon, ArrowUpRightIcon,
} from '@/components/ui/Icons'

export const metadata: Metadata = {
  title: {
    absolute: 'E-Tech OS — Expert Digital Services for Development, Marketing & E-commerce',
  },
  description:
    'Hire vetted expert teams for development, marketing, branding, AI, and e-commerce. Order, track, and receive work through a single managed platform.',
  openGraph: {
    title: 'E-Tech OS — Expert Digital Services',
    description: 'Hire experts, access resources, and manage every project — all in one place.',
  },
}

// ─── Static data ──────────────────────────────────────────────────────────────

const TRUSTED_BY = [
  'Shopify Merchants', 'SaaS Startups', 'D2C Brands', 'Marketing Agencies',
  'Creative Studios', 'Enterprise Teams', 'E-commerce Operators', 'Growth Teams',
]

const PILLARS = [
  {
    icon: BriefcaseIconSvg,
    label: 'Portfolio & Authority',
    desc: 'Proven case studies, results metrics, and published articles that demonstrate what real expertise looks like.',
    href: '/work',
  },
  {
    icon: LayersIcon,
    label: 'Services Marketplace',
    desc: 'From development and marketing to AI and analytics — hire experts across any discipline with full order management.',
    href: '/services',
  },
  {
    icon: PackageIcon,
    label: 'Resources Marketplace',
    desc: 'Instant-download themes, templates, prompt packs, and AI toolkits built by practitioners for practitioners.',
    href: '/themes',
  },
  {
    icon: CalendarIcon,
    label: 'Booking Marketplace',
    desc: 'Book consultations, audits, workshops, and strategy sessions directly with senior experts.',
    href: '/book',
  },
  {
    icon: MessageSquareIcon,
    label: 'Client Portal',
    desc: 'Track orders, exchange files, review deliverables, and manage every project from a unified dashboard.',
    href: '/login',
  },
  {
    icon: UsersIcon,
    label: 'Expert Workspace',
    desc: 'A dedicated workspace for vetted experts to manage assignments, deliver work, and track performance.',
    href: '/experts/apply',
  },
]

const SERVICES = [
  {
    category: 'Development',
    icon: CodeIcon,
    services: ['Web Applications', 'Shopify Stores', 'Custom Integrations', 'API Development', 'Mobile Apps'],
    color: 'bg-blue-50 text-blue-700 border-blue-100',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    category: 'Marketing',
    icon: MegaphoneIcon,
    services: ['SEO Strategy', 'Paid Advertising', 'Email Marketing', 'Content Strategy', 'Social Media'],
    color: 'bg-purple-50 text-purple-700 border-purple-100',
    badge: 'bg-purple-100 text-purple-700',
  },
  {
    category: 'Branding',
    icon: PaletteIcon,
    services: ['Brand Identity', 'Logo Design', 'Design Systems', 'Packaging', 'Visual Strategy'],
    color: 'bg-rose-50 text-rose-700 border-rose-100',
    badge: 'bg-rose-100 text-rose-700',
  },
  {
    category: 'AI & Analytics',
    icon: SparklesIcon,
    services: ['Analytics Dashboards', 'AI Integrations', 'Data Strategy', 'Performance Reports', 'Automation'],
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  {
    category: 'E-commerce',
    icon: RocketIcon,
    services: ['Store Design', 'Conversion Optimisation', 'Theme Development', 'WooCommerce', 'Post-Purchase Flows'],
    color: 'bg-orange-50 text-orange-700 border-orange-100',
    badge: 'bg-orange-100 text-orange-700',
  },
]

const FEATURED_RESOURCES = [
  {
    name: 'Prestige Commerce Theme',
    type: 'Shopify Theme',
    price: '$149',
    desc: 'High-converting Shopify theme for premium D2C brands. Built for speed and trust.',
    tags: ['Shopify', 'Commerce'],
    href: '/themes/prestige',
  },
  {
    name: 'AI Prompt Toolkit — Marketing',
    type: 'Prompt Pack',
    price: '$29',
    desc: '500+ GPT-4 prompts for content, ads, emails, and social. Practitioner-tested.',
    tags: ['AI', 'Marketing'],
    href: '/resources/prompts/marketing',
  },
  {
    name: 'Analytics Report Template',
    type: 'Template',
    price: '$49',
    desc: 'Monthly client-ready analytics report in Notion + PDF. Covers GA4, Ads, SEO.',
    tags: ['Analytics', 'Template'],
    href: '/resources/templates/analytics-report',
  },
  {
    name: 'Brand Identity Starter Kit',
    type: 'Design Kit',
    price: '$79',
    desc: 'Full Figma brand kit with logo system, typography, colour palette, and usage guidelines.',
    tags: ['Branding', 'Figma'],
    href: '/resources/templates/brand-kit',
  },
]

const METRICS = [
  { value: '200+', label: 'Businesses served across 12 countries' },
  { value: '2.4×', label: 'Average revenue uplift within 90 days' },
  { value: '48h', label: 'Average time from order to assignment' },
  { value: '98%', label: 'Client satisfaction rate on completed orders' },
]

const TESTIMONIALS = [
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

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Choose a Service or Resource',
    desc: 'Browse our service catalogue or resource marketplace. Find exactly what your business needs — from a quick theme purchase to a full development engagement.',
  },
  {
    step: '02',
    title: 'Place Your Order',
    desc: 'Pay securely. Your order is confirmed instantly and funds are held safely with E-Tech until the work is complete.',
  },
  {
    step: '03',
    title: 'Submit Requirements',
    desc: 'Complete a simple onboarding form to give us what we need to get started. The more context, the better the outcome.',
  },
  {
    step: '04',
    title: 'Expert Gets Assigned',
    desc: 'We match your project with the right specialist from our vetted expert network. You\'re notified the moment they\'re assigned.',
  },
  {
    step: '05',
    title: 'Work Delivered via Dashboard',
    desc: 'Track progress in real time, exchange files, request revisions, and approve final deliverables — all from your client portal.',
  },
]

const EXPERTS = [
  { name: 'Alex Morgan', role: 'Lead Developer', spec: 'Shopify & React', initials: 'AM', color: 'bg-blue-600' },
  { name: 'Zara Williams', role: 'Brand Strategist', spec: 'Identity & Positioning', initials: 'ZW', color: 'bg-rose-600' },
  { name: 'David Park', role: 'Growth Analyst', spec: 'SEO & Paid Media', initials: 'DP', color: 'bg-emerald-600' },
  { name: 'Laila Okonkwo', role: 'AI Specialist', spec: 'Automation & Data', initials: 'LO', color: 'bg-purple-600' },
  { name: 'Tom Reeves', role: 'E-commerce Lead', spec: 'Conversion & CRO', initials: 'TR', color: 'bg-orange-600' },
  { name: 'Yemi Adeyemi', role: 'Marketing Director', spec: 'Strategy & Campaigns', initials: 'YA', color: 'bg-sky-600' },
]

const ANALYTICS_PLATFORMS = [
  'Google Analytics', 'Google Ads', 'Meta Ads', 'Shopify Analytics',
  'TikTok Ads', 'SEO Tracking', 'Email Marketing', 'Google Business Profile',
]

// ─── Icon helper (not exported, for local use) ─────────────────────────────────

function BriefcaseIconSvg({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(30,58,138,0.06),transparent)] pointer-events-none" />
        <div className="relative px-5 md:px-10 lg:px-16 max-w-7xl mx-auto pt-20 pb-24 md:pt-32 md:pb-40">
          <div className="inline-flex items-center gap-2 bg-brand-dim border border-brand/20 text-brand text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
            <ZapIcon className="h-3.5 w-3.5" />
            The All-In-One Digital Agency Operating System
          </div>

          <h1 className="font-display text-[clamp(2.4rem,5.5vw,5rem)] font-bold tracking-tight text-ink leading-[1.05] mb-6 max-w-4xl">
            Your Business Deserves
            <br />
            <span className="text-brand">Results, Not Just Deliverables.</span>
          </h1>

          <p className="text-base md:text-xl text-muted max-w-2xl mb-10 leading-relaxed">
            Strategy, design, development, marketing, and analytics — unified under E-Tech OS.
            Managed by a vetted expert team. Tracked through a premium client dashboard.
          </p>

          <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-14">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-brand-deep transition-colors duration-150 shadow-sm shadow-brand/25"
            >
              Hire Experts
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/themes"
              className="inline-flex items-center gap-2 bg-white text-ink text-sm font-semibold px-6 py-3 rounded-lg border border-border hover:bg-surface transition-colors duration-150"
            >
              Explore Resources
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand transition-colors duration-150 font-medium"
            >
              Book a Strategy Call
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Social proof strip */}
          <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-border">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="h-3.5 w-3.5 text-amber-400" />
              ))}
              <span className="text-xs text-muted ml-1.5">4.9 / 5 from 200+ clients</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
              Secure payments · Expert-managed · Full portal access
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted By ── */}
      <section className="border-y border-border bg-surface overflow-hidden">
        <div className="px-5 md:px-10 lg:px-16 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-widest shrink-0">
              Trusted by
            </span>
            <div className="flex items-center gap-8 md:gap-12">
              {TRUSTED_BY.map((name) => (
                <span
                  key={name}
                  className="text-[13px] font-medium text-ink/30 hover:text-ink/60 transition-colors duration-200 shrink-0 cursor-default"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What We Do (6 Pillars) ── */}
      <section className="bg-white">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14 md:mb-16">
            <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">What We Do</p>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1] mb-4">
              Six pillars. One platform.
            </h2>
            <p className="text-base text-muted leading-relaxed">
              E-Tech OS brings together everything a business needs to grow — portfolio authority, expert services, digital resources, bookings, a client portal, and an expert workspace — under one roof.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PILLARS.map(({ icon: Icon, label, desc, href }) => (
              <Link
                key={href}
                href={href}
                className="group relative flex flex-col bg-white border border-border rounded-xl p-6 hover:border-brand/40 hover:shadow-md hover:shadow-brand/[0.06] transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-dim flex items-center justify-center mb-4 group-hover:bg-brand group-hover:text-white transition-colors duration-200">
                  <Icon className="h-5 w-5 text-brand group-hover:text-white" />
                </div>
                <h3 className="text-[15px] font-semibold text-ink mb-2 tracking-tight">{label}</h3>
                <p className="text-sm text-muted leading-relaxed flex-1">{desc}</p>
                <div className="flex items-center gap-1 mt-4 text-xs text-brand font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Explore <ArrowRightIcon className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Services ── */}
      <section className="bg-surface border-y border-border">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Services Marketplace</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1]">
                Every discipline.<br />One expert team.
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-deep transition-colors duration-150 shrink-0"
            >
              Browse all services <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {SERVICES.map(({ category, icon: Icon, services, color }) => (
              <div
                key={category}
                className="bg-white border border-border rounded-xl p-5 hover:shadow-md hover:shadow-ink/[0.04] hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 border ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-ink mb-3">{category}</h3>
                <ul className="space-y-2 flex-1">
                  {services.map((s) => (
                    <li key={s} className="flex items-start gap-2">
                      <CheckIcon className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-xs text-muted leading-snug">{s}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/services/${category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '')}`}
                  className="mt-4 pt-4 border-t border-border text-xs font-medium text-brand hover:text-brand-deep transition-colors duration-150 flex items-center gap-1"
                >
                  View packages <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Resources ── */}
      <section className="bg-white">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Resources Marketplace</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1]">
                Ship faster with<br />expert-built resources.
              </h2>
            </div>
            <Link
              href="/themes"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-deep transition-colors duration-150 shrink-0"
            >
              Browse all resources <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED_RESOURCES.map(({ name, type, price, desc, tags, href }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col bg-white border border-border rounded-xl overflow-hidden hover:border-brand/30 hover:shadow-lg hover:shadow-brand/[0.06] transition-all duration-200"
              >
                <div className="aspect-[16/10] bg-surface flex items-center justify-center border-b border-border relative overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-brand-dim flex items-center justify-center">
                    <PackageIcon className="h-6 w-6 text-brand" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-bold text-ink bg-white border border-border px-2 py-0.5 rounded-md shadow-sm">
                      {price}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">{type}</span>
                  </div>
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

      {/* ── Metrics ── */}
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

      {/* ── Testimonials ── */}
      <section className="bg-surface border-y border-border">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Client Testimonials</p>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1] max-w-xl">
              Results that speak for themselves.
            </h2>
          </div>

          <TestimonialsGrid />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">How It Works</p>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1] mb-4">
              Order to delivery.<br />No guesswork.
            </h2>
            <p className="text-base text-muted leading-relaxed">
              Every engagement follows a transparent, structured process — so you always know where your project stands.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute left-7 top-8 bottom-8 w-px bg-border" />
            <div className="space-y-6">
              {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
                <div key={step} className="flex gap-6 lg:gap-10 items-start group">
                  <div className="relative shrink-0">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-colors duration-200 ${i < 2 ? 'bg-brand border-brand text-white' : 'bg-white border-border text-muted group-hover:border-brand/40 group-hover:text-brand'}`}>
                      <span className="text-[13px] font-bold font-mono">{step}</span>
                    </div>
                  </div>
                  <div className="flex-1 pt-3 pb-6 border-b border-border last:border-0">
                    <h3 className="text-[15px] font-semibold text-ink mb-1.5 tracking-tight">{title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Meet the Experts ── */}
      <section className="bg-surface border-y border-border">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Meet the Experts</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1]">
                Vetted specialists.<br />Real results.
              </h2>
            </div>
            <Link
              href="/experts/apply"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-deep transition-colors duration-150 shrink-0"
            >
              Join as an expert <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {EXPERTS.map(({ name, role, spec, initials, color }) => (
              <div
                key={name}
                className="flex flex-col items-center text-center p-5 bg-white rounded-xl border border-border hover:shadow-md hover:shadow-ink/[0.04] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mb-3 shrink-0`}>
                  <span className="text-sm font-bold text-white">{initials}</span>
                </div>
                <p className="text-[13px] font-semibold text-ink leading-tight mb-0.5">{name}</p>
                <p className="text-[11px] text-muted mb-1">{role}</p>
                <p className="text-[10px] font-medium text-brand/70 uppercase tracking-wider">{spec}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Analytics Preview ── */}
      <section className="bg-white">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Analytics Delivery</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1] mb-5">
                Data that drives<br />real decisions.
              </h2>
              <p className="text-base text-muted leading-relaxed mb-8">
                Purchase an analytics service and we connect to your platforms, build dashboards, generate reports, and deliver AI-powered recommendations — on a schedule you control.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Full-funnel reporting across all channels',
                  'AI-generated insights and recommendations',
                  'Scheduled monthly or weekly delivery',
                  'Live dashboard access through your portal',
                  'Competitor analysis & benchmark tracking',
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
                View Analytics Services <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative">
              <div className="bg-ink rounded-2xl p-6 shadow-2xl shadow-ink/20">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  <span className="text-[11px] text-white/30 ml-2 font-mono">analytics-dashboard.etech</span>
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
                      <span key={p} className="text-[10px] font-medium text-white/60 bg-white/[0.07] px-2 py-0.5 rounded border border-white/10">
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

      {/* ── Featured Articles ── */}
      <section className="bg-surface border-y border-border">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">From the Blog</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1]">
                Insights that move<br />the needle.
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

      {/* ── FAQ ── */}
      <section className="bg-white border-y border-border">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Common Questions</p>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold tracking-tight text-ink leading-[1.1]">
              Everything you need to know.
            </h2>
          </div>
          <HomeFAQ />
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-ink relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_110%,rgba(30,58,138,0.5),transparent)] pointer-events-none" />
        <div className="relative px-5 md:px-10 lg:px-16 py-20 md:py-36 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.12] text-white/60 text-xs font-medium px-3.5 py-1.5 rounded-full mb-8">
            <TrendingUpIcon className="h-3.5 w-3.5 text-emerald-400" />
            Join 200+ businesses scaling with E-Tech OS
          </div>

          <h2 className="font-display text-[clamp(2rem,4.5vw,4.5rem)] font-bold tracking-tight text-white leading-[1.05] mb-6 max-w-3xl mx-auto">
            Ready to build something that actually works?
          </h2>
          <p className="text-white/50 text-base md:text-xl mb-12 max-w-xl mx-auto leading-relaxed">
            Whether you need an expert for a week or a long-term growth partner, E-Tech OS has you covered.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-white text-ink text-sm font-bold px-7 py-3.5 rounded-lg hover:bg-surface transition-colors duration-150"
            >
              Hire Experts Now
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 border border-white/20 text-white text-sm font-medium px-7 py-3.5 rounded-lg hover:bg-white/[0.06] transition-colors duration-150"
            >
              Book a Free Strategy Call
            </Link>
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="bg-surface border-t border-border">
        <div className="px-5 md:px-10 lg:px-16 py-16 max-w-7xl mx-auto">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-display text-xl font-bold text-ink mb-2">Stay sharp. Subscribe free.</h3>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              Weekly insights on digital strategy, marketing, and the tools that are actually worth your time.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  )
}

// ─── Server-side testimonials grid ────────────────────────────────────────────

type TestimonialItem = { quote: string; author: string; role: string; rating: number }

async function TestimonialsGrid() {
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

  let items: TestimonialItem[] = TESTIMONIALS

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
  } catch {
    // fall through to static
  }

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
          <p className="text-[15px] text-ink leading-relaxed flex-1 mb-6">
            &ldquo;{quote}&rdquo;
          </p>
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

// ─── Server-side articles feed ─────────────────────────────────────────────────

async function ArticlesFeed() {
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

  const PLACEHOLDER_ARTICLES = [
    {
      id: '1',
      title: 'How We Increased Shopify Conversions by 2.4× in 90 Days',
      excerpt: 'A detailed breakdown of the CRO process we used on a premium D2C skincare brand.',
      category: 'ecommerce',
      slug: 'shopify-conversion-rate-optimisation',
      readingMinutes: 8,
    },
    {
      id: '2',
      title: 'The Analytics Stack Every Growing Business Needs in 2025',
      excerpt: 'Stop drowning in dashboards. Here\'s the lean reporting setup that actually drives decisions.',
      category: 'analytics',
      slug: 'analytics-stack-2025',
      readingMinutes: 6,
    },
    {
      id: '3',
      title: 'Why Most Brand Redesigns Fail (And What To Do Instead)',
      excerpt: 'The uncomfortable truth about rebrands — and the process we follow to make them land.',
      category: 'branding',
      slug: 'why-brand-redesigns-fail',
      readingMinutes: 5,
    },
  ]

  let articles = PLACEHOLDER_ARTICLES

  try {
    const res = await fetch(`${API}/cms/articles/published?limit=3`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) articles = data
    }
  } catch {
    // fall through to placeholder
  }

  const CATEGORY_LABELS: Record<string, string> = {
    ecommerce: 'E-commerce',
    analytics: 'Analytics',
    branding: 'Branding',
    marketing: 'Marketing',
    development: 'Development',
    strategy: 'Strategy',
    ai: 'AI',
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


