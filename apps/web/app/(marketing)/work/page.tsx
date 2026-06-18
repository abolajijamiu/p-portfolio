import type { Metadata } from 'next'
import Link from 'next/link'
import { WORK, ECOMMERCE_CATEGORIES } from '@/lib/content/work'
import { ArrowRightIcon } from '@/components/ui/Icons'
import type { CmsWorkItem } from '@/types'

export const metadata: Metadata = {
  title: 'Work',
  description:
    'eCommerce redesigns, Shopify themes, SEO, funnels, and platform builds — all with documented results. Proof, not promises.',
  openGraph: {
    title: 'Work — E-Tech.',
    description: 'eCommerce and digital work with documented results.',
  },
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

const CATEGORY_LABEL: Record<string, string> = {
  redesign: 'Store Redesign',
  theme: 'Theme Development',
  seo: 'Commerce SEO',
  funnel: 'Funnel Systems',
  management: 'Store Management',
  addon: 'Custom Add-on',
  performance: 'Performance',
  platform: 'Platform Build',
  brand: 'Brand & Digital',
  shopify: 'Shopify',
}

const CATEGORY_FILTERS = [
  { label: 'All work', value: 'all' },
  { label: 'eCommerce', value: 'ecommerce' },
  { label: 'Redesign', value: 'redesign' },
  { label: 'Themes', value: 'theme' },
  { label: 'SEO', value: 'seo' },
  { label: 'Funnels', value: 'funnel' },
  { label: 'Performance', value: 'performance' },
  { label: 'Platform', value: 'platform' },
]

async function fetchPublished(): Promise<CmsWorkItem[]> {
  try {
    const res = await fetch(`${API}/cms/work/published`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

// Adapt the static WorkItem shape to the CmsWorkItem shape for fallback rendering
function staticToDisplay(w: typeof WORK[number]): CmsWorkItem {
  const hexMatch = w.accent.match(/#([0-9a-fA-F]{3,8})/)
  return {
    id: w.slug,
    slug: w.slug,
    client: w.client,
    headline: w.headline,
    situation: w.situation,
    category: w.category,
    industry: w.industry,
    year: typeof w.year === 'string' ? parseInt(w.year) : null,
    duration: w.duration ?? null,
    featured: w.featured ?? false,
    accentColor: hexMatch ? `#${hexMatch[1]}` : '#f0f0ef',
    scope: w.scope,
    stack: w.stack ?? [],
    proof: w.proof.map((p) => ({ metric: p.metric, label: p.label, ...(p.period ? { period: p.period } : {}) })),
    proofNote: w.proofNote ?? null,
    actions: w.actions,
    comparisons: w.comparisons ?? [],
    hasComparison: w.hasComparison ?? false,
    auditFindings: w.auditFindings ?? [],
    videoId: w.videoId ?? null,
    videoPlatform: w.videoPlatform ?? null,
    heroMediaId: null,
    seoTitle: null,
    seoDescription: null,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export default async function WorkPage() {
  const cmsItems = await fetchPublished()
  const items: CmsWorkItem[] = cmsItems.length > 0 ? cmsItems : WORK.map(staticToDisplay)

  const featured = items.filter((w) => w.featured)
  const rest = items.filter((w) => !w.featured)

  return (
    <div className="px-5 md:px-12 lg:px-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pt-12 pb-10 md:pt-20 md:pb-16">
        <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-4 md:mb-5">
          Client work
        </p>
        <h1 className="font-display text-[clamp(2rem,4vw,3.75rem)] font-normal tracking-tight text-ink leading-tight max-w-2xl">
          Results, not renders.
        </h1>
        <p className="text-muted text-[15px] mt-4 md:mt-5 max-w-lg leading-relaxed">
          Every engagement below includes the situation, what we did, and what changed. Numbers
          are real — drawn from analytics, Shopify reports, or client-reported data.
        </p>
      </div>

      {/* Filter strip */}
      <div className="flex items-center gap-2 flex-wrap pb-10 md:pb-12 border-b border-border">
        {CATEGORY_FILTERS.map((f) => (
          <span
            key={f.value}
            className={[
              'px-3 py-1.5 text-xs rounded-full border transition-[background-color,border-color,color] duration-150',
              f.value === 'all'
                ? 'bg-ink text-white border-ink'
                : 'border-border text-muted hover:border-ink/40 hover:text-ink cursor-pointer',
            ].join(' ')}
          >
            {f.label}
          </span>
        ))}
      </div>

      {/* Featured work */}
      {featured.length > 0 && (
        <div className="py-12 md:py-16">
          <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-8 md:mb-10">
            Featured
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden">
            {featured.map((item) => (
              <Link
                key={item.slug}
                href={`/work/${item.slug}`}
                className="group bg-white p-7 md:p-8 flex flex-col hover:bg-[#fafafa] transition-[background-color] duration-200"
              >
                {/* Visual */}
                <div
                  className="w-full aspect-[16/8] rounded-lg mb-6 relative overflow-hidden flex items-end"
                  style={{ backgroundColor: item.accentColor ?? '#f0f0ef' }}
                >
                  <div className="absolute inset-x-6 top-5 bottom-0 bg-white/60 rounded-t-md border border-black/[0.06] p-4">
                    <p className="text-[11px] font-medium text-ink/50 mb-1">{item.client}</p>
                    <p className="text-[13px] font-semibold text-ink leading-snug">{item.headline}</p>
                  </div>
                  {item.hasComparison && (
                    <div className="absolute top-3 right-3 bg-white/80 text-[10px] font-medium text-ink px-2 py-0.5 rounded">
                      Before / After
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-medium text-muted uppercase tracking-wider bg-surface border border-border px-2 py-0.5 rounded">
                    {CATEGORY_LABEL[item.category] ?? item.category}
                  </span>
                  {item.industry && (
                    <>
                      <span className="text-muted/30 text-[11px]">·</span>
                      <span className="text-[11px] text-muted">{item.industry.split(' · ')[0]}</span>
                    </>
                  )}
                  {item.year && (
                    <>
                      <span className="text-muted/30 text-[11px]">·</span>
                      <span className="text-[11px] text-muted">{item.year}</span>
                    </>
                  )}
                </div>

                <h2 className="text-lg font-semibold text-ink tracking-tight mb-2">{item.client}</h2>
                <p className="text-sm text-muted leading-relaxed mb-5 flex-1">{item.headline}</p>

                {/* Proof */}
                {item.proof.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                    {item.proof.slice(0, 3).map((p) => (
                      <div key={p.label}>
                        <p className="text-base font-semibold text-ink tracking-tight">{p.metric}</p>
                        <p className="text-[10px] text-muted/70 leading-tight mt-0.5">{p.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All other work */}
      <div className="border-t border-border py-12 md:py-16">
        <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-8 md:mb-10">
          All engagements
        </p>
        <div className="divide-y divide-border">
          {rest.map((item) => (
            <Link
              key={item.slug}
              href={`/work/${item.slug}`}
              className="group flex flex-col md:flex-row md:items-start gap-5 md:gap-8 py-7 md:py-8 hover:bg-[#fafafa] -mx-3 px-3 rounded-lg transition-[background-color] duration-200"
            >
              {/* Color swatch */}
              <div
                className="w-full md:w-48 shrink-0 aspect-[3/2] md:aspect-auto md:h-24 rounded-lg"
                style={{ backgroundColor: item.accentColor ?? '#f0f0ef' }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-medium text-muted uppercase tracking-wider bg-surface border border-border px-2 py-0.5 rounded">
                    {CATEGORY_LABEL[item.category] ?? item.category}
                  </span>
                  {item.year && (
                    <>
                      <span className="text-muted/30 text-[11px]">·</span>
                      <span className="text-[11px] text-muted">{item.year}</span>
                    </>
                  )}
                </div>
                <h3 className="text-base font-semibold text-ink tracking-tight mb-1">{item.client}</h3>
                <p className="text-sm text-muted leading-relaxed mb-4">{item.headline}</p>

                {/* Compact proof */}
                {item.proof.length > 0 && (
                  <div className="flex flex-wrap gap-4">
                    {item.proof.slice(0, 2).map((p) => (
                      <div key={p.label} className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-ink">{p.metric}</span>
                        <span className="text-[11px] text-muted/70">{p.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="shrink-0 self-center">
                <ArrowRightIcon className="h-4 w-4 text-muted/30 group-hover:text-ink group-hover:translate-x-0.5 transition-all duration-150" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Themes CTA */}
      <div className="py-14 md:py-20 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-5">
            <h3 className="text-base font-semibold text-ink tracking-tight mb-2">
              Looking for a Shopify theme?
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              We sell five commerce themes built for specific categories — fashion, electronics,
              luxury, food &amp; wellness, and D2C. Each one is built from scratch for its
              category, not reskinned from a generic base.
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
              Custom build
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
