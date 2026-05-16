import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRightIcon } from '@/components/ui/Icons'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Commerce design and build, conversion systems, SEO, integrations, and strategy. Each discipline practiced at senior level.',
  openGraph: {
    title: 'Services — E-Tech.',
    description: 'Commerce design, conversion, SEO, and systems integration. Done properly.',
  },
}

const SERVICES = [
  {
    number: '01',
    title: 'Commerce Design & Build',
    description:
      "We build Shopify stores, headless commerce experiences, and custom themes from scratch. Not from a template, not reskinned. We start with your category, your customer, and how they buy — and build the architecture around that. Every store we ship has the infrastructure to grow with the business.",
    deliverables: [
      'Custom Shopify theme development',
      'Headless / composable commerce',
      'Store migration and rebuild',
      'Checkout optimisation',
    ],
  },
  {
    number: '02',
    title: 'Conversion & Funnels',
    description:
      "The traffic is there. The product works. The gap is in what happens between the first visit and the repeat purchase. We build email flows, post-purchase sequences, subscription systems, and abandoned cart recovery — the full funnel, wired together and measured. Revenue from customers you already have.",
    deliverables: [
      'Email flow architecture (Klaviyo)',
      'Post-purchase and replenishment flows',
      'Subscription setup (Recharge)',
      'A/B testing and CRO',
    ],
  },
  {
    number: '03',
    title: 'Commerce SEO',
    description:
      "Most eCommerce SEO work is shallow. We go forensic — crawl budget, indexation, cannibalization, schema, Core Web Vitals, category architecture, internal linking. We find what's keeping you off page one and fix it systematically. The results compound over time because the structure is built correctly.",
    deliverables: [
      'Technical SEO audit',
      'Category architecture rebuild',
      'Schema and structured data',
      'Content strategy and buyer guides',
    ],
  },
  {
    number: '04',
    title: 'Systems & Integrations',
    description:
      "Growth breaks manual processes. We connect Shopify to the systems around it — ERPs, 3PLs, B2B portals, returns platforms, accounting software. Custom middleware where necessary. The goal is an operational infrastructure that doesn't require your team to intervene on things a computer should handle.",
    deliverables: [
      '3PL and ERP integration',
      'Custom B2B portal development',
      'Returns automation (Loop)',
      'Operational audit and documentation',
    ],
  },
  {
    number: '05',
    title: 'Strategy',
    description:
      "Before we write a line of code or design a single screen, we understand the business. Where the revenue comes from, where it's being lost, and what the right next move is. We work back from the number you need to hit, not the deliverable you came in asking for. Sometimes the brief is right. Often it isn't.",
    deliverables: [
      'Commerce audit and opportunity mapping',
      'Competitive and market research',
      'Technology stack advisory',
      'Go-to-market strategy',
    ],
  },
]

export default function ServicesPage() {
  return (
    <div className="px-5 md:px-12 lg:px-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pt-12 pb-10 md:pt-20 md:pb-16 border-b border-border">
        <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-4 md:mb-5">
          Services
        </p>
        <h1 className="font-display text-[clamp(2rem,4vw,3.75rem)] font-normal tracking-tight text-ink leading-tight max-w-2xl">
          Commerce work, done properly.
        </h1>
        <p className="text-muted text-[15px] mt-4 md:mt-5 max-w-lg leading-relaxed">
          We work across the full eCommerce stack — from store architecture
          to post-purchase retention. Each service is practiced at a senior
          level, grounded in evidence, and measured against actual revenue.
        </p>
      </div>

      {/* Services list */}
      <div className="divide-y divide-border">
        {SERVICES.map((service) => (
          <div key={service.number} className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <div className="md:col-span-4">
              <span className="text-[11px] font-medium text-muted/40 tabular-nums block mb-2.5 md:mb-3">
                {service.number}
              </span>
              <h2 className="text-xl font-semibold text-ink tracking-tight">{service.title}</h2>
            </div>
            <div className="md:col-span-8">
              <p className="text-[15px] text-muted leading-relaxed mb-7 md:mb-8">{service.description}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {service.deliverables.map((d) => (
                  <li key={d} className="flex items-center gap-2.5 text-sm text-ink">
                    <span className="h-px w-3 bg-muted/25 shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Themes CTA */}
      <div className="py-14 md:py-20 border-t border-border grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5">
          <h3 className="text-base font-semibold text-ink tracking-tight mb-2">
            Looking for a ready-made Shopify theme?
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            We sell five themes built for specific commerce categories.
            Each one is built from scratch for its category — not a generic
            template with a new colour palette.
          </p>
        </div>
        <div className="md:col-span-5 md:col-start-8 flex items-center gap-4">
          <Link
            href="/themes"
            className="inline-flex items-center gap-2 bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-[#222] transition-[background-color] duration-150"
          >
            Browse themes
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/contact"
            className="text-sm text-muted hover:text-ink transition-[color] duration-150"
          >
            Custom project
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="py-14 md:py-20 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 md:gap-6">
        <div>
          <h3 className="text-base font-semibold text-ink tracking-tight mb-1.5">
            Not sure which service you need?
          </h3>
          <p className="text-sm text-muted">
            Tell us what's not working. We'll identify where the problem actually is.
          </p>
        </div>
        <Link
          href="/contact"
          className="shrink-0 inline-flex items-center gap-2 bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-[#222] transition-[background-color] duration-150"
        >
          Get in touch
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
