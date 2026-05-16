import type { Metadata } from 'next'
import Link from 'next/link'
import { THEMES, type ThemeCategory } from '@/lib/content/themes'
import { ThemeMockup } from '@/components/marketing/ThemeMockup'

export const metadata: Metadata = {
  title: 'Commerce Themes',
  description:
    'Shopify themes built for conversion. Fashion, electronics, luxury, food, and D2C — each one engineered for its category.',
  openGraph: {
    title: 'Commerce Themes — E-Tech.',
    description: 'Shopify themes built for conversion. Category-specific, performance-first.',
  },
}

const CATEGORIES: { label: string; value: ThemeCategory | 'all' }[] = [
  { label: 'All themes', value: 'all' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Luxury', value: 'luxury' },
  { label: 'Food & Wellness', value: 'food' },
  { label: 'D2C', value: 'dtc' },
]

export default function ThemesPage() {
  return (
    <div className="px-5 md:px-12 lg:px-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pt-12 pb-10 md:pt-20 md:pb-16">
        <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-4 md:mb-5">
          Commerce themes
        </p>
        <h1 className="font-display text-[clamp(2rem,4vw,3.75rem)] font-normal tracking-tight text-ink leading-tight max-w-2xl">
          Themes built for how commerce actually works.
        </h1>
        <p className="text-muted text-[15px] mt-4 md:mt-5 max-w-lg leading-relaxed">
          Each theme is built for a specific commerce category — not reskinned from a generic base.
          Performance-first, conversion-tested, and built to extend.
        </p>
      </div>

      {/* Category strip */}
      <div className="flex items-center gap-2 flex-wrap pb-10 md:pb-12 border-b border-border">
        {CATEGORIES.map((c) => (
          <span
            key={c.value}
            className={[
              'px-3 py-1.5 text-xs rounded-full border transition-[background-color,border-color,color] duration-150',
              c.value === 'all'
                ? 'bg-ink text-white border-ink'
                : 'border-border text-muted hover:border-ink/40 hover:text-ink cursor-pointer',
            ].join(' ')}
          >
            {c.label}
          </span>
        ))}
      </div>

      {/* Theme grid */}
      <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden">
        {THEMES.map((theme) => (
          <div key={theme.slug} className="bg-white p-7 md:p-8 flex flex-col">
            {/* Preview area */}
            <div
              className={`w-full aspect-[16/9] rounded-lg mb-6 md:mb-7 relative overflow-hidden ${theme.bg}`}
            >
              <ThemeMockup theme={theme} />
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {theme.industries.map((ind) => (
                <span
                  key={ind}
                  className="text-[10px] font-medium text-muted/60 uppercase tracking-wider"
                >
                  {ind}
                </span>
              ))}
            </div>

            {/* Name + tagline */}
            <h2 className="text-xl font-semibold text-ink tracking-tight mb-1">{theme.name}</h2>
            <p className="text-sm text-muted mb-4 leading-snug">{theme.tagline}</p>

            {/* Highlights */}
            <div className="flex flex-wrap gap-1.5 mb-6 flex-1">
              {theme.highlights.map((h) => (
                <span
                  key={h}
                  className="text-[11px] text-muted/70 bg-surface border border-border px-2 py-0.5 rounded"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Price + CTA */}
            <div className="flex items-center justify-between pt-5 border-t border-border">
              <div>
                <p className="text-[10px] font-medium text-muted/50 uppercase tracking-wider mb-0.5">
                  From
                </p>
                <p className="text-lg font-semibold text-ink tracking-tight">
                  {theme.price === 'custom' ? 'Custom pricing' : `$${theme.price}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/contact"
                  className="text-xs text-muted hover:text-ink transition-[color] duration-150 underline underline-offset-2"
                >
                  Request demo
                </Link>
                <Link
                  href={`/themes/${theme.slug}`}
                  className="inline-flex items-center gap-1.5 bg-ink text-white text-xs font-medium px-4 py-2 rounded-md hover:bg-[#222] transition-[background-color] duration-150"
                >
                  View theme
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom theme CTA */}
      <div className="py-14 md:py-20 border-t border-border mt-px">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-5">
            <h3 className="text-base font-semibold text-ink tracking-tight mb-2">
              Need something built from scratch?
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Most of our best theme work doesn't fit a template. If your brand has specific
              requirements — unusual navigation, bespoke product types, custom checkout extensions
              — we scope and build from first principles.
            </p>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <div className="grid grid-cols-2 gap-6 mb-7">
              {[
                { label: 'Typical timeline', value: '6–10 weeks' },
                { label: 'Starting from', value: '$8,000' },
                { label: 'Includes', value: 'Full QA + documentation' },
                { label: 'Post-launch', value: '60-day support window' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-medium text-muted/50 uppercase tracking-wider mb-1">
                    {label}
                  </p>
                  <p className="text-sm font-medium text-ink">{value}</p>
                </div>
              ))}
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-[#222] transition-[background-color] duration-150"
            >
              Start a conversation
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
