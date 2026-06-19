import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Legal',
  description: 'All E-Tech OS policies, agreements, and legal documents in one place.',
}

const POLICIES = [
  {
    title: 'Terms of Service',
    description: 'The rules governing your use of the E-Tech OS platform and services.',
    href: '/terms',
    updated: '17 June 2025',
  },
  {
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal data under GDPR and UK data law.',
    href: '/privacy',
    updated: '17 June 2025',
  },
  {
    title: 'Service Agreement',
    description: 'Contractual terms for professional service engagements — scope, delivery, IP, and payment.',
    href: '/service-agreement',
    updated: '19 June 2026',
  },
  {
    title: 'Refund Policy',
    description: 'Cancellation terms and refund eligibility for service orders, bookings, and digital resources.',
    href: '/refund',
    updated: '19 June 2026',
  },
  {
    title: 'Service Level Agreement',
    description: 'Delivery commitments, quality standards, and SLA remedies for all engagements.',
    href: '/sla',
    updated: '19 June 2026',
  },
  {
    title: 'Support Policy',
    description: 'Support channels, response time targets, priority levels, and escalation paths.',
    href: '/support-policy',
    updated: '19 June 2026',
  },
  {
    title: 'Licensing Agreement',
    description: 'Terms governing the use of digital resources — themes, templates, and assets — purchased from us.',
    href: '/licenses',
    updated: '17 June 2025',
  },
  {
    title: 'Cookie Policy',
    description: 'Which cookies we use, why, and how to manage your preferences.',
    href: '/cookies',
    updated: '19 June 2026',
  },
]

export default function LegalPage() {
  return (
    <div className="px-5 md:px-10 lg:px-16 max-w-4xl mx-auto py-14 md:py-20">
      <div className="mb-12">
        <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-3">Legal</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight mb-4">Policies &amp; Agreements</h1>
        <p className="text-base text-muted max-w-xl">
          All legal documents governing your relationship with E-Tech OS and DeEmpireTech.
          We have tried to write these in plain language — but if anything is unclear,{' '}
          <Link href="/contact" className="text-brand hover:underline">please ask</Link>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {POLICIES.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group block border border-border rounded-xl p-5 bg-white hover:border-brand/30 hover:shadow-sm transition-[border-color,box-shadow] duration-150"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="text-sm font-semibold text-ink group-hover:text-brand transition-colors duration-150">{p.title}</h2>
              <svg className="h-4 w-4 text-muted/30 group-hover:text-brand/50 transition-colors duration-150 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
            <p className="text-xs text-muted leading-relaxed">{p.description}</p>
            <p className="text-[10px] text-muted/50 mt-3">Updated {p.updated}</p>
          </Link>
        ))}
      </div>

      <div className="mt-14 p-6 bg-surface border border-border rounded-xl">
        <h2 className="text-sm font-semibold text-ink mb-2">Questions about our policies?</h2>
        <p className="text-sm text-muted mb-4">
          If any of our policies are unclear, you disagree with something, or you need a custom
          agreement for an enterprise engagement, please get in touch.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-deep transition-colors"
        >
          Contact us
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
