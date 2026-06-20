import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRightIcon, CheckIcon, CalendarIcon } from '@/components/ui/Icons'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Hire expert teams for development, marketing, branding, AI, and e-commerce. Browse service packages, select what you need, and track delivery through your dashboard.',
  openGraph: {
    title: 'Services — E-Tech OS',
    description: 'Expert teams for every digital discipline. Browse packages and get started today.',
  },
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

type Service = {
  id: string
  slug: string
  title: string
  tagline: string
  category: string
  featured: boolean
  packages?: { priceCents: number; name: string; deliveryDays: number }[]
}

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  development:  { label: 'Development',  color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-100' },
  marketing:    { label: 'Marketing',    color: 'text-purple-700', bg: 'bg-purple-50 border-purple-100' },
  branding:     { label: 'Branding',     color: 'text-rose-700',   bg: 'bg-rose-50 border-rose-100' },
  ai_analytics: { label: 'AI & Analytics', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
  ecommerce:    { label: 'E-commerce',   color: 'text-orange-700', bg: 'bg-orange-50 border-orange-100' },
  consulting:   { label: 'Consulting',   color: 'text-sky-700',    bg: 'bg-sky-50 border-sky-100' },
  publishing:   { label: 'Publishing',   color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-100' },
  technical:    { label: 'Technical',    color: 'text-slate-700',  bg: 'bg-slate-50 border-slate-100' },
  premium:      { label: 'Premium',      color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-100' },
}

async function fetchServices(): Promise<Service[]> {
  try {
    const res = await fetch(`${API}/services/pricing`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) return data
    }
  } catch { /* fall through */ }
  return []
}

function priceFrom(service: Service) {
  if (!service.packages?.length) return null
  const min = Math.min(...service.packages.map((p) => p.priceCents))
  return `From $${(min / 100).toLocaleString()}`
}

function fastestDelivery(service: Service) {
  if (!service.packages?.length) return null
  const min = Math.min(...service.packages.map((p) => p.deliveryDays))
  return `${min} days`
}

export default async function ServicesPage() {
  const services = await fetchServices()
  const featured = services.filter((s) => s.featured)
  const byCategory = services.reduce<Record<string, Service[]>>((acc, s) => {
    ;(acc[s.category] ||= []).push(s)
    return acc
  }, {})

  return (
    <>
      {/* Header */}
      <section className="bg-white border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-16 md:py-24 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Services Marketplace</p>
            <h1 className="font-display text-[clamp(2rem,4.5vw,4rem)] font-bold tracking-tight text-ink leading-[1.05] mb-5">
              Every discipline.<br />One expert team.
            </h1>
            <p className="text-base md:text-lg text-muted leading-relaxed mb-8 max-w-2xl">
              Browse our service catalogue, choose a package that fits your scope, and place your order.
              We handle expert assignment, delivery tracking, and revisions — all through your client portal.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 border border-border text-ink text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-surface transition-colors duration-150"
              >
                <CalendarIcon className="h-4 w-4 text-brand" />
                Book a strategy call first
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="bg-surface border-b border-border">
          <div className="px-5 md:px-10 lg:px-16 py-14 md:py-20 max-w-7xl mx-auto">
            <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-10">Most Popular</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* By category */}
      <section className="bg-white">
        <div className="px-5 md:px-10 lg:px-16 py-14 md:py-20 max-w-7xl mx-auto space-y-16">
          {Object.keys(byCategory).length === 0 && (
            <div className="py-20 text-center">
              <p className="text-sm text-muted">No services available yet. Check back soon.</p>
            </div>
          )}
          {Object.entries(byCategory).map(([cat, catServices]) => {
            const meta = CATEGORY_META[cat] ?? { label: cat, color: 'text-muted', bg: 'bg-surface border-border' }
            return (
              <div key={cat} id={cat}>
                <div className="flex items-center gap-3 mb-8">
                  <span className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${meta.bg} ${meta.color}`}>
                    {meta.label}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {catServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand border-t border-brand-deep">
        <div className="px-5 md:px-10 lg:px-16 py-16 md:py-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
                Not sure what you need?
              </h2>
              <p className="text-white/60 text-sm md:text-base leading-relaxed">
                Book a free 30-minute strategy call. We&apos;ll identify the right service, right package, and right starting point for your goals.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 bg-white text-ink text-sm font-bold px-6 py-3 rounded-lg hover:bg-surface transition-colors duration-150"
              >
                Book Free Call <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-white/25 text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition-colors duration-150"
              >
                Send a message
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function ServiceCard({ service }: { service: Service }) {
  const meta = CATEGORY_META[service.category] ?? { label: service.category, color: 'text-muted', bg: 'bg-surface border-border' }
  const price = priceFrom(service)
  const delivery = fastestDelivery(service)

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col bg-white border border-border rounded-xl p-6 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/[0.06] transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${meta.bg} ${meta.color}`}>
          {meta.label}
        </span>
        {price && (
          <span className="text-xs font-semibold text-ink/70 shrink-0">{price}</span>
        )}
      </div>

      <h3 className="text-[15px] font-semibold text-ink tracking-tight mb-2 leading-snug group-hover:text-brand transition-colors duration-150">
        {service.title}
      </h3>
      <p className="text-sm text-muted leading-relaxed flex-1 mb-5">{service.tagline}</p>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-muted">
          {delivery && (
            <span className="flex items-center gap-1">
              <CheckIcon className="h-3 w-3 text-emerald-500" />
              From {delivery}
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-brand flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          View packages <ArrowRightIcon className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}
