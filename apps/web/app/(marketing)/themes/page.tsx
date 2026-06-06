import type { Metadata } from 'next'
import Link from 'next/link'
import { ThemesClient } from './ThemesClient'
import type { CmsTheme } from '@/types'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Commerce Themes',
  description:
    'Shopify themes built for conversion. Fashion, electronics, luxury, food, and D2C — each one engineered for its category.',
  openGraph: {
    title: 'Commerce Themes — E-Tech.',
    description: 'Shopify themes built for conversion. Category-specific, performance-first.',
  },
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function getPublishedThemes(): Promise<CmsTheme[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/cms/themes/published`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function ThemesPage() {
  const themes = await getPublishedThemes()

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

      {/* Category filter + theme grid (client — needs filter state) */}
      <ThemesClient themes={themes} />

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
                { label: 'Starting from',   value: '$8,000'      },
                { label: 'Includes',        value: 'Full QA + documentation' },
                { label: 'Post-launch',     value: '60-day support window'   },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-medium text-muted/50 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm font-medium text-ink">{value}</p>
                </div>
              ))}
            </div>
            <a
              href="https://wa.me/447478034171"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-[#222] transition-[background-color] duration-150"
            >
              Start a conversation
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
