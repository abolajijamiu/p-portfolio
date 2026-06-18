import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRightIcon, CheckIcon, CalendarIcon, ShieldCheckIcon, ZapIcon } from '@/components/ui/Icons'
import { OrderButton } from './OrderButton'

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

type Faq = { id: string; question: string; answer: string }

type Requirement = {
  id: string
  label: string
  description?: string
  fieldType: string
  required: boolean
}

type ServiceDetail = {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  category: string
  packages: Package[]
  faqs: Faq[]
  requirements: Requirement[]
}

async function fetchService(slug: string): Promise<ServiceDetail | null> {
  try {
    const res = await fetch(`${API}/services/${slug}`, { next: { revalidate: 3600 } })
    if (res.status === 404) return null
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const service = await fetchService(slug)
  if (!service) return { title: 'Service Not Found' }
  return {
    title: `${service.title} — E-Tech OS`,
    description: service.tagline,
    openGraph: { title: service.title, description: service.tagline },
  }
}

const CATEGORY_SLUGS = new Set(['development', 'marketing', 'branding', 'ai-analytics', 'ecommerce', 'consulting', 'publishing', 'technical', 'premium'])

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (CATEGORY_SLUGS.has(slug)) {
    const anchor = slug === 'ai-analytics' ? 'ai_analytics' : slug
    redirect(`/services#${anchor}`)
  }

  const service = await fetchService(slug)
  if (!service) notFound()

  const sortedPackages = [...service.packages].sort((a, b) => a.sortOrder - b.sortOrder)
  const midPackage = sortedPackages[Math.floor(sortedPackages.length / 2)]

  return (
    <>
      {/* Breadcrumb + header */}
      <section className="bg-white border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 pt-8 pb-14 md:pb-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-muted mb-8">
            <Link href="/services" className="hover:text-brand transition-colors">Services</Link>
            <span>/</span>
            <span className="text-ink font-medium">{service.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
            <div className="lg:col-span-3">
              <h1 className="font-display text-[clamp(1.75rem,3.5vw,3.25rem)] font-bold tracking-tight text-ink leading-[1.05] mb-4">
                {service.title}
              </h1>
              <p className="text-lg text-brand font-medium mb-5">{service.tagline}</p>
              <p className="text-base text-muted leading-relaxed mb-8">{service.description}</p>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: ShieldCheckIcon, text: 'Secure payment' },
                  { icon: ZapIcon, text: 'Expert assigned within 48h' },
                  { icon: CalendarIcon, text: 'Tracked in your portal' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-muted">
                    <Icon className="h-4 w-4 text-brand" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick package preview */}
            {midPackage && (
              <div className="lg:col-span-2">
                <div className="bg-surface border border-border rounded-xl p-6">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1">Most Popular</p>
                  <p className="text-xl font-bold text-ink mb-0.5">
                    ${(midPackage.priceCents / 100).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted mb-4">{midPackage.name} package · {midPackage.deliveryDays}-day delivery</p>
                  <ul className="space-y-2 mb-5">
                    {midPackage.includes.slice(0, 4).map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-ink/80">
                        <CheckIcon className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                    {midPackage.includes.length > 4 && (
                      <li className="text-xs text-muted pl-6">+{midPackage.includes.length - 4} more included</li>
                    )}
                  </ul>
                  <OrderButton packageId={midPackage.id} packageName={midPackage.name} priceCents={midPackage.priceCents} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="bg-surface border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-14 md:py-20 max-w-7xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-10">Choose a package</h2>
          <div className={`grid grid-cols-1 gap-5 ${sortedPackages.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {sortedPackages.map((pkg, i) => {
              const isRecommended = i === Math.floor(sortedPackages.length / 2)
              return (
                <div
                  key={pkg.id}
                  className={`relative flex flex-col bg-white rounded-xl border-2 p-6 transition-all duration-200 ${
                    isRecommended ? 'border-brand shadow-lg shadow-brand/[0.1]' : 'border-border hover:border-brand/30'
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-brand text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Recommended
                      </span>
                    </div>
                  )}

                  <div className="mb-5">
                    <p className="text-lg font-bold text-ink mb-0.5">{pkg.name}</p>
                    <p className="text-sm text-muted">{pkg.description}</p>
                  </div>

                  <div className="mb-5">
                    <p className="text-3xl font-bold text-ink">
                      ${(pkg.priceCents / 100).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted mt-0.5">One-time payment</p>
                  </div>

                  <div className="flex gap-4 text-xs text-muted mb-5 pb-5 border-b border-border">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {pkg.deliveryDays}-day delivery
                    </span>
                    <span>{pkg.revisions} revision{pkg.revisions !== 1 ? 's' : ''}</span>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    {pkg.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-ink/80">
                        <CheckIcon className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <OrderButton
                    packageId={pkg.id}
                    packageName={pkg.name}
                    priceCents={pkg.priceCents}
                    primary={isRecommended}
                  />
                </div>
              )
            })}
          </div>

          <p className="text-xs text-muted text-center mt-8">
            Payment is processed securely. You&apos;ll submit requirements after checkout.{' '}
            <Link href="/contact" className="text-brand hover:underline">Questions? Get in touch.</Link>
          </p>
        </div>
      </section>

      {/* Requirements preview */}
      {service.requirements.length > 0 && (
        <section className="bg-white border-b border-border">
          <div className="px-5 md:px-10 lg:px-16 py-14 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-ink mb-3">What we&apos;ll need from you</h2>
                <p className="text-sm text-muted leading-relaxed">
                  After placing your order you&apos;ll complete a short requirements form. The more detail you provide, the faster we can assign the right expert and start work.
                </p>
              </div>
              <ul className="space-y-3">
                {service.requirements.map((req) => (
                  <li key={req.id} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-dim flex items-center justify-center shrink-0 mt-0.5">
                      <CheckIcon className="h-3 w-3 text-brand" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {req.label}
                        {!req.required && <span className="ml-1.5 text-[10px] text-muted font-normal">(optional)</span>}
                      </p>
                      {req.description && <p className="text-xs text-muted mt-0.5">{req.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {service.faqs.length > 0 && (
        <section className="bg-surface border-b border-border">
          <div className="px-5 md:px-10 lg:px-16 py-14 max-w-7xl mx-auto">
            <h2 className="font-display text-xl md:text-2xl font-bold text-ink mb-8">Frequently asked questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {service.faqs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-xl border border-border p-6">
                  <p className="text-sm font-semibold text-ink mb-2">{faq.question}</p>
                  <p className="text-sm text-muted leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="bg-white">
        <div className="px-5 md:px-10 lg:px-16 py-14 md:py-20 max-w-7xl mx-auto text-center">
          <h3 className="font-display text-xl md:text-2xl font-bold text-ink mb-3">Ready to get started?</h3>
          <p className="text-sm text-muted mb-6 max-w-md mx-auto">
            Choose a package above, place your order, and we&apos;ll have an expert assigned within 48 hours.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="#packages"
              className="inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-brand-deep transition-colors duration-150"
            >
              Choose a Package <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 border border-border text-ink text-sm font-medium px-6 py-3 rounded-lg hover:bg-surface transition-colors duration-150"
            >
              Book a call first
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
