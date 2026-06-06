'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeMockup } from '@/components/marketing/ThemeMockup'
import type { CmsTheme } from '@/types'

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All themes',      value: 'all'         },
  { label: 'Fashion',         value: 'fashion'      },
  { label: 'Electronics',     value: 'electronics'  },
  { label: 'Luxury',          value: 'luxury'       },
  { label: 'Food & Wellness', value: 'food'         },
  { label: 'D2C',             value: 'dtc'          },
]

function formatPrice(priceCents: number | null | undefined): string {
  if (priceCents == null) return 'Custom pricing'
  return `$${(priceCents / 100).toFixed(0)}`
}

export function ThemesClient({ themes }: { themes: CmsTheme[] }) {
  const [active, setActive] = useState('all')

  const visible = active === 'all' ? themes : themes.filter((t) => t.category === active)

  return (
    <>
      {/* Category filter strip */}
      <div className="flex items-center gap-2 flex-wrap pb-10 md:pb-12 border-b border-border">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setActive(c.value)}
            className={[
              'px-3 py-1.5 text-xs rounded-full border transition-[background-color,border-color,color] duration-150',
              active === c.value
                ? 'bg-ink text-white border-ink'
                : 'border-border text-muted hover:border-ink/40 hover:text-ink',
            ].join(' ')}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Theme grid */}
      {visible.length === 0 ? (
        <div className="py-24 text-center text-sm text-muted">
          No themes in this category yet.
        </div>
      ) : (
        <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden">
          {visible.map((theme) => (
            <div key={theme.slug} className="bg-white p-7 md:p-8 flex flex-col">
              <div className={`w-full aspect-[16/9] rounded-lg mb-6 md:mb-7 relative overflow-hidden ${theme.bgClass ?? 'bg-surface'}`}>
                {(theme.screenshotUrls ?? [])[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={theme.screenshotUrls[0]}
                    alt={`${theme.name} preview`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ThemeMockup theme={{
                    slug:     theme.slug,
                    category: theme.category,
                    accent:   theme.accentColor ?? '#888888',
                  }} />
                )}
              </div>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[10px] font-medium text-muted/60 uppercase tracking-wider capitalize">
                  {theme.category}
                </span>
              </div>

              <Link href={`/themes/${theme.slug}`} className="group/title">
                <h2 className="text-xl font-semibold text-ink tracking-tight mb-1 group-hover/title:text-brand transition-[color] duration-150">{theme.name}</h2>
              </Link>
              <p className="text-sm text-muted mb-4 leading-snug">{theme.tagline}</p>

              <div className="flex flex-wrap gap-1.5 mb-6 flex-1">
                {(theme.highlights ?? []).map((h) => (
                  <span key={h} className="text-[11px] text-muted/70 bg-surface border border-border px-2 py-0.5 rounded">
                    {h}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-border">
                <div>
                  <p className="text-[10px] font-medium text-muted/50 uppercase tracking-wider mb-0.5">From</p>
                  <p className="text-lg font-semibold text-ink tracking-tight">{formatPrice(theme.priceCents)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={theme.demoStoreUrl ?? `/contact?theme=${theme.slug}&intent=demo`}
                    target={theme.demoStoreUrl ? '_blank' : undefined}
                    rel={theme.demoStoreUrl ? 'noopener noreferrer' : undefined}
                    className="text-xs text-muted hover:text-ink transition-[color] duration-150 underline underline-offset-2"
                  >
                    Live demo
                  </a>
                  <a
                    href={theme.checkoutUrl ?? `/contact?theme=${theme.slug}&intent=purchase`}
                    target={theme.checkoutUrl ? '_blank' : undefined}
                    rel={theme.checkoutUrl ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-1.5 bg-ink text-white text-xs font-medium px-4 py-2 rounded-md hover:bg-[#222] transition-[background-color] duration-150"
                  >
                    Get this theme
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
