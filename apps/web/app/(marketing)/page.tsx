import type { Metadata } from 'next'
import Link from 'next/link'
import { WORK, CATEGORY_LABEL } from '@/lib/content/work'
import { THEMES } from '@/lib/content/themes'
import { ArrowRightIcon } from '@/components/ui/Icons'
import { ThemeMockup } from '@/components/marketing/ThemeMockup'

export const metadata: Metadata = {
  title: 'E-Tech. — eCommerce Design & Engineering',
  description:
    'Shopify themes, store redesigns, conversion systems, and commerce engineering — built by a small senior team that cares about outcomes, not outputs.',
  openGraph: {
    title: 'E-Tech. — eCommerce Design & Engineering',
    description: 'Shopify themes, store redesigns, and commerce engineering. Built for results.',
  },
}

const FEATURED_WORK = WORK.filter((w) => w.featured).slice(0, 3)
const FEATURED_THEMES = THEMES.slice(0, 3)

const CAPABILITIES = [
  {
    title: 'Commerce Design & Build',
    description:
      'Shopify stores, headless commerce, and custom themes — built to convert. Architecture that holds up when traffic spikes and catalogues grow.',
  },
  {
    title: 'Conversion & Funnels',
    description:
      'Post-purchase flows, email sequences, abandoned cart recovery, and subscription systems. Revenue from customers you already have.',
  },
  {
    title: 'Commerce SEO',
    description:
      'Category architecture, technical audits, schema markup, and content systems. Organic revenue that compounds.',
  },
  {
    title: 'Systems & Integrations',
    description:
      'ERPs, 3PLs, B2B portals, fulfilment middleware. Operational infrastructure that scales with the business.',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="px-5 md:px-12 lg:px-20 max-w-7xl mx-auto pt-16 pb-20 md:pt-28 md:pb-36">
        <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-6 md:mb-7">
          Commerce studio
        </p>
        <h1 className="font-display text-[clamp(2.25rem,5.5vw,5rem)] font-normal tracking-tight text-ink leading-[1.05] mb-6 md:mb-8 max-w-3xl">
          Built for brands
          <br />
          that sell online.
        </h1>
        <p className="text-base md:text-lg text-muted max-w-sm md:max-w-md mb-8 md:mb-11 leading-relaxed">
          Shopify themes, store redesigns, conversion systems, and
          commerce engineering — done properly.
        </p>
        <div className="flex items-center gap-5 md:gap-6">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-[#222] transition-[background-color] duration-150"
          >
            See the work
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/themes"
            className="text-sm text-muted hover:text-ink transition-[color] duration-150"
          >
            Browse themes
          </Link>
        </div>
      </section>

      {/* Themes strip */}
      <section className="border-t border-border">
        <div className="px-5 md:px-12 lg:px-20 py-12 md:py-16 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em]">
              Shopify themes
            </p>
            <Link
              href="/themes"
              className="text-xs text-muted hover:text-ink transition-[color] duration-150 flex items-center gap-1.5"
            >
              All themes
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
            {FEATURED_THEMES.map((theme) => (
              <Link
                key={theme.slug}
                href={`/themes/${theme.slug}`}
                className="group bg-white p-6 md:p-7 flex flex-col hover:bg-[#fafafa] transition-[background-color] duration-200"
              >
                <div className={`w-full aspect-[4/3] rounded-lg mb-5 relative overflow-hidden ${theme.bg}`}>
                  <ThemeMockup theme={theme} />
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {theme.industries.slice(0, 2).map((ind) => (
                    <span
                      key={ind}
                      className="text-[10px] font-medium text-muted/60 uppercase tracking-wider"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
                <h3 className="text-base font-semibold text-ink tracking-tight mb-1">{theme.name}</h3>
                <p className="text-sm text-muted leading-snug flex-1">{theme.tagline}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-ink">
                    {theme.price === 'custom' ? 'Custom' : `$${theme.price}`}
                  </p>
                  <span className="text-xs text-muted group-hover:text-ink transition-[color] duration-150 flex items-center gap-1">
                    View theme <ArrowRightIcon className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Selected work */}
      <section className="border-t border-border">
        <div className="px-5 md:px-12 lg:px-20 py-12 md:py-20 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em]">
              Selected work
            </p>
            <Link
              href="/work"
              className="text-xs text-muted hover:text-ink transition-[color] duration-150 flex items-center gap-1.5"
            >
              All engagements
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
            {FEATURED_WORK.map((item) => (
              <Link
                key={item.slug}
                href={`/work/${item.slug}`}
                className="group bg-white p-6 md:p-7 hover:bg-[#fafafa] transition-[background-color] duration-200 flex flex-col"
              >
                <div
                  className={`aspect-[4/3] rounded-lg mb-5 md:mb-6 ${item.accent} relative overflow-hidden`}
                >
                  {item.hasComparison && (
                    <div className="absolute top-3 right-3 bg-white/80 text-[10px] font-medium text-ink px-2 py-0.5 rounded">
                      Before / After
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/[0.03] group-hover:to-black/[0.06] transition-all" />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <p className="text-[10px] font-medium text-muted uppercase tracking-wider bg-surface border border-border px-2 py-0.5 rounded">
                    {CATEGORY_LABEL[item.category]}
                  </p>
                  <span className="text-muted/30 text-[11px]">·</span>
                  <p className="text-[11px] text-muted">{item.year}</p>
                </div>

                <h3 className="text-base font-semibold text-ink tracking-tight mb-1">{item.client}</h3>
                <p className="text-sm text-muted leading-relaxed flex-1 mb-4">{item.headline}</p>

                <div className="pt-4 border-t border-border flex flex-wrap gap-4">
                  {item.proof.slice(0, 2).map((p) => (
                    <div key={p.label}>
                      <p className="text-sm font-semibold text-ink">{p.metric}</p>
                      <p className="text-[10px] text-muted/70 leading-tight">{p.label}</p>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-t border-border">
        <div className="px-5 md:px-12 lg:px-20 py-12 md:py-20 max-w-7xl mx-auto">
          <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-10 md:mb-12">
            What we do
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {CAPABILITIES.map((c) => (
              <div key={c.title}>
                <h3 className="text-sm font-semibold text-ink mb-2.5 md:mb-3">{c.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 md:mt-12">
            <Link
              href="/services"
              className="text-sm text-muted hover:text-ink transition-[color] duration-150 inline-flex items-center gap-1.5"
            >
              Full services
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border">
        <div className="px-5 md:px-12 lg:px-20 py-12 md:py-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
            {[
              { value: '70%', label: "Of our work is eCommerce — it's what we're best at" },
              { value: '2.1×', label: 'Average conversion rate improvement across store redesigns' },
              { value: '< 4', label: 'Active client engagements at any time' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white px-6 md:px-8 py-8 md:py-10">
                <p className="text-3xl md:text-4xl font-semibold text-ink tracking-tight mb-2">{value}</p>
                <p className="text-sm text-muted leading-snug max-w-[200px]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink">
        <div className="px-5 md:px-12 lg:px-20 py-16 md:py-28 max-w-7xl mx-auto">
          <p className="text-[11px] font-medium text-white/30 uppercase tracking-[0.2em] mb-6 md:mb-7">
            Working together
          </p>
          <h2 className="font-display text-[clamp(1.75rem,4vw,3.5rem)] font-normal tracking-tight text-white leading-[1.1] mb-5 md:mb-6 max-w-2xl">
            Your store should be working
            <br className="hidden sm:block" />
            harder than it is.
          </h2>
          <p className="text-white/50 text-base md:text-lg mb-8 md:mb-11 max-w-md leading-relaxed">
            If you're leaving revenue on the table — from conversion,
            SEO, or post-purchase — we'd like to hear about it.
          </p>
          <div className="flex items-center gap-5">
            <a
              href="https://wa.me/447478034171"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-ink text-sm font-medium px-5 py-2.5 rounded-md hover:bg-surface transition-[background-color] duration-150"
            >
              Start a conversation
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </a>
            <Link
              href="/themes"
              className="text-sm text-white/50 hover:text-white transition-[color] duration-150"
            >
              Browse themes
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
