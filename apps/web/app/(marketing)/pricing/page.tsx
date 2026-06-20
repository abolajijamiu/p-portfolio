import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckIcon, ArrowRightIcon, CalendarIcon } from '@/components/ui/Icons'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Transparent service pricing with no hidden fees. Browse packages for development, marketing, branding, AI, and e-commerce — or get a custom quote.',
  openGraph: {
    title: 'Pricing — E-Tech OS',
    description: 'Clear pricing for every service. No surprises.',
  },
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

type Package = {
  id: string
  name: string
  description: string
  priceCents: number
  currency: string
  deliveryDays: number
  revisions: number
  includes: string[]
  sortOrder: number
}

type ServiceWithPackages = {
  id: string
  slug: string
  title: string
  tagline: string
  category: string
  packages: Package[]
}

const CATEGORY_META: Record<string, { label: string; color: string; dot: string }> = {
  development:  { label: 'Development',    color: 'text-blue-700',    dot: 'bg-blue-500' },
  marketing:    { label: 'Marketing',      color: 'text-purple-700',  dot: 'bg-purple-500' },
  branding:     { label: 'Branding',       color: 'text-rose-700',    dot: 'bg-rose-500' },
  ai_analytics: { label: 'AI & Analytics', color: 'text-emerald-700', dot: 'bg-emerald-500' },
  ecommerce:    { label: 'E-commerce',     color: 'text-orange-700',  dot: 'bg-orange-500' },
  consulting:   { label: 'Consulting',     color: 'text-sky-700',     dot: 'bg-sky-500' },
  publishing:   { label: 'Publishing',     color: 'text-indigo-700',  dot: 'bg-indigo-500' },
  technical:    { label: 'Technical',      color: 'text-slate-700',   dot: 'bg-slate-500' },
  premium:      { label: 'Premium',        color: 'text-amber-700',   dot: 'bg-amber-500' },
}

async function fetchPricing(): Promise<ServiceWithPackages[]> {
  try {
    const res = await fetch(`${API}/services/pricing`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) return data
    }
  } catch { /* fall through */ }
  return []
}

function fmtPrice(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function PackageCard({ pkg, serviceSlug }: { pkg: Package; serviceSlug: string }) {
  return (
    <div className="flex flex-col bg-white border border-border rounded-xl p-5 min-w-[220px] flex-1">
      <p className="text-[10px] font-bold text-muted uppercase tracking-[0.16em] mb-1">{pkg.name}</p>
      <p className="text-2xl font-bold text-ink tracking-tight">{fmtPrice(pkg.priceCents)}</p>
      <p className="text-xs text-muted mt-0.5 mb-3">{pkg.description}</p>

      <div className="flex items-center gap-3 mb-4 text-[11px] text-muted font-medium">
        <span>{pkg.deliveryDays}d delivery</span>
        <span className="text-border">·</span>
        <span>{pkg.revisions === 0 ? 'No revisions' : `${pkg.revisions} revision${pkg.revisions > 1 ? 's' : ''}`}</span>
      </div>

      {pkg.includes.length > 0 && (
        <ul className="space-y-1.5 mb-5 flex-1">
          {pkg.includes.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckIcon className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />
              <span className="text-xs text-muted leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={`/services/${serviceSlug}`}
        className="mt-auto w-full py-2 rounded-lg bg-ink text-white text-xs font-semibold text-center hover:bg-ink/90 transition-colors"
      >
        Order now
      </Link>
    </div>
  )
}

export default async function PricingPage() {
  const services = await fetchPricing()

  const byCategory = services.reduce<Record<string, ServiceWithPackages[]>>((acc, s) => {
    ;(acc[s.category] ||= []).push(s)
    return acc
  }, {})

  const categories = Object.keys(byCategory).sort((a, b) => {
    const order = ['development', 'marketing', 'branding', 'ecommerce', 'ai_analytics', 'consulting', 'publishing', 'technical', 'premium']
    return (order.indexOf(a) ?? 99) - (order.indexOf(b) ?? 99)
  })

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-white border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-28 max-w-5xl mx-auto text-center">
          <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Pricing</p>
          <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-tight text-ink leading-[1.08] mb-5">
            Transparent pricing.<br />No surprises.
          </h1>
          <p className="text-base md:text-lg text-muted max-w-xl mx-auto leading-relaxed">
            Every service has a clear price, defined scope, and set delivery timeline. Pick the package that fits your goals — or book a call and we&apos;ll build a custom quote.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-semibold text-ink hover:border-ink/30 transition-colors"
            >
              <CalendarIcon className="h-4 w-4 text-muted" />
              Book a strategy call
            </Link>
          </div>
        </div>
      </section>

      {/* ── Category anchors ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 max-w-6xl mx-auto overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 py-3 min-w-max">
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat]
              return (
                <a
                  key={cat}
                  href={`#${cat}`}
                  className="text-xs font-medium px-3 py-1.5 rounded-full text-muted hover:text-ink hover:bg-surface transition-colors whitespace-nowrap"
                >
                  {meta?.label ?? cat}
                </a>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Service groups ── */}
      <div className="bg-surface">
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat]
          const svcs = byCategory[cat]

          return (
            <section key={cat} id={cat} className="border-b border-border last:border-b-0">
              <div className="px-5 md:px-10 lg:px-16 py-14 md:py-20 max-w-6xl mx-auto">
                {/* Category header */}
                <div className="flex items-center gap-2 mb-10">
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${meta?.dot ?? 'bg-ink'}`} />
                  <h2 className={`text-[11px] font-bold uppercase tracking-[0.18em] ${meta?.color ?? 'text-ink'}`}>
                    {meta?.label ?? cat}
                  </h2>
                </div>

                {/* Services in this category */}
                <div className="space-y-12">
                  {svcs.map((service) => (
                    <div key={service.id}>
                      <div className="mb-5">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold text-ink">{service.title}</h3>
                          <Link
                            href={`/services/${service.slug}`}
                            className="text-xs text-muted hover:text-brand transition-colors inline-flex items-center gap-1"
                          >
                            View details
                            <ArrowRightIcon className="h-3 w-3" />
                          </Link>
                        </div>
                        <p className="text-sm text-muted mt-0.5">{service.tagline}</p>
                      </div>

                      {service.packages.length === 0 ? (
                        <div className="bg-white border border-border rounded-xl px-5 py-4 text-sm text-muted">
                          Packages coming soon —{' '}
                          <Link href="/contact" className="text-brand hover:underline">
                            contact us for pricing
                          </Link>
                          .
                        </div>
                      ) : (
                        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(service.packages.length, 3)}, minmax(0, 1fr))` }}>
                          {service.packages.map((pkg) => (
                            <PackageCard key={pkg.id} pkg={pkg} serviceSlug={service.slug} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )
        })}
      </div>

      {/* ── Custom quote CTA ── */}
      <section className="bg-ink text-white">
        <div className="px-5 md:px-10 lg:px-16 py-20 md:py-24 max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.18em] mb-4">Need something custom?</p>
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold tracking-tight leading-tight mb-5">
            Every project is different.<br />We&apos;ll price yours fairly.
          </h2>
          <p className="text-base text-white/60 leading-relaxed max-w-lg mx-auto mb-8">
            If your project doesn&apos;t fit a standard package — scale, complexity, or ongoing retainer — book a call and we&apos;ll scope it out together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-ink text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              <CalendarIcon className="h-4 w-4" />
              Book a strategy call
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-white text-sm font-semibold hover:border-white/40 transition-colors"
            >
              Send an inquiry
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
