import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { WORK } from '@/lib/content/work'
import { ArrowRightIcon } from '@/components/ui/Icons'
import { VideoEmbed } from '@/components/marketing/VideoEmbed'
import { AuditBlock } from '@/components/marketing/AuditBlock'
import type { CmsWorkItem } from '@/types'

type Props = { params: Promise<{ slug: string }> }

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

async function fetchAllPublished(): Promise<CmsWorkItem[]> {
  try {
    const res = await fetch(`${API}/cms/work/published`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

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

export async function generateStaticParams() {
  return WORK.map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cmsItems = await fetchAllPublished()
  const cmsItem = cmsItems.find((w) => w.slug === slug)
  const staticItem = WORK.find((w) => w.slug === slug)
  const item = cmsItem ?? (staticItem ? staticToDisplay(staticItem) : null)
  if (!item) return {}
  return {
    title: item.seoTitle ?? `${item.client} — Case Study`,
    description: item.seoDescription ?? item.headline,
    openGraph: { title: `${item.client} — E-Tech.`, description: item.headline },
  }
}

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params
  const cmsItems = await fetchAllPublished()
  const cmsItem = cmsItems.find((w) => w.slug === slug)
  const staticItem = WORK.find((w) => w.slug === slug)
  const item = cmsItem ?? (staticItem ? staticToDisplay(staticItem) : null)
  if (!item) notFound()

  const allItems = cmsItems.length > 0 ? cmsItems : WORK.map(staticToDisplay)
  const related = allItems
    .filter((w) => w.slug !== slug && (w.category === item.category || w.featured))
    .slice(0, 2)

  return (
    <div className="px-5 md:px-12 lg:px-20 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="pt-8 md:pt-10">
        <Link
          href="/work"
          className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] hover:text-ink transition-[color] duration-150"
        >
          ← Work
        </Link>
      </div>

      {/* Header */}
      <div className="pt-8 pb-10 md:pt-10 md:pb-14 border-b border-border">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-[10px] font-medium text-muted uppercase tracking-wider bg-surface border border-border px-2.5 py-1 rounded">
            {CATEGORY_LABEL[item.category] ?? item.category}
          </span>
          {item.industry && (
            <>
              <span className="text-muted/30 text-[11px]">·</span>
              <span className="text-[11px] text-muted">{item.industry}</span>
            </>
          )}
          {item.year && (
            <>
              <span className="text-muted/30 text-[11px]">·</span>
              <span className="text-[11px] text-muted">{item.year}</span>
            </>
          )}
          {item.duration && (
            <>
              <span className="text-muted/30 text-[11px]">·</span>
              <span className="text-[11px] text-muted">{item.duration}</span>
            </>
          )}
        </div>

        <h1 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-normal tracking-tight text-ink leading-tight max-w-3xl mb-5">
          {item.headline}
        </h1>

        {item.scope.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.scope.map((s) => (
              <span key={s} className="text-[11px] text-muted/70 bg-surface border border-border px-2.5 py-1 rounded">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Visual hero */}
      <div className="py-10 md:py-12">
        <div
          className="w-full aspect-[16/7] rounded-xl relative overflow-hidden"
          style={{ backgroundColor: item.accentColor ?? '#f0f0ef' }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[13px] font-medium text-ink/30 tracking-wide">
              {item.client} — visual walkthrough available on request
            </p>
          </div>
        </div>
      </div>

      {/* Proof metrics */}
      {item.proof.length > 0 && (
        <div className="py-10 md:py-12 border-t border-border">
          <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
            <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em]">
              Results
            </p>
            {item.proofNote && (
              <p className="text-[11px] text-muted/60 max-w-md leading-relaxed text-right hidden md:block">
                {item.proofNote}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
            {item.proof.map((p) => (
              <div key={p.label} className="bg-white px-6 md:px-8 py-7 md:py-8">
                <p className="text-3xl md:text-4xl font-semibold text-ink tracking-tight mb-1.5">
                  {p.metric}
                </p>
                <p className="text-sm text-muted leading-snug">{p.label}</p>
                {p.period && <p className="text-[11px] text-muted/50 mt-1">{p.period}</p>}
              </div>
            ))}
          </div>
          {item.proofNote && (
            <p className="text-[11px] text-muted/50 mt-4 leading-relaxed md:hidden">{item.proofNote}</p>
          )}
        </div>
      )}

      {/* Situation */}
      {item.situation && (
        <div className="py-12 md:py-16 border-t border-border grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em]">Situation</p>
          </div>
          <div className="md:col-span-8 md:col-start-5">
            <p className="text-[15px] md:text-base text-ink/80 leading-[1.8]">{item.situation}</p>
          </div>
        </div>
      )}

      {/* What we did */}
      {item.actions.length > 0 && (
        <div className="py-12 md:py-16 border-t border-border grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em]">What we did</p>
          </div>
          <div className="md:col-span-8 md:col-start-5">
            <ol className="space-y-5">
              {item.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-5">
                  <span className="text-[11px] font-medium text-muted/40 tabular-nums w-5 shrink-0 mt-[0.25em]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[15px] text-ink/80 leading-relaxed">{action}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Before / After */}
      {item.hasComparison && item.comparisons.length > 0 && (
        <div className="py-12 md:py-16 border-t border-border">
          <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-8 md:mb-10">
            Before / After
          </p>
          <div className="space-y-3">
            {item.comparisons.map((c) => (
              <div
                key={c.label}
                className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden"
              >
                <div className="bg-white p-6 md:p-7">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] font-medium text-muted/50 bg-red-50 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Before
                    </span>
                    <span className="text-[10px] text-muted/50">{c.label}</span>
                  </div>
                  <p className="text-sm text-ink/60 leading-relaxed">{c.before}</p>
                </div>
                <div className="bg-[#f8faf8] p-6 md:p-7">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] font-medium bg-green-50 text-green-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      After
                    </span>
                    <span className="text-[10px] text-muted/50">{c.label}</span>
                  </div>
                  <p className="text-sm text-ink leading-relaxed font-medium">{c.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tech stack */}
      {item.stack.length > 0 && (
        <div className="py-12 md:py-14 border-t border-border grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em]">
              Tech stack
            </p>
          </div>
          <div className="md:col-span-8 md:col-start-5">
            <div className="flex flex-wrap gap-2">
              {item.stack.map((tool) => (
                <span
                  key={tool}
                  className="text-[11px] font-medium text-ink/70 bg-surface border border-border px-3 py-1.5 rounded"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audit findings */}
      {item.auditFindings.length > 0 && (
        <div className="py-12 md:py-16 border-t border-border grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em]">
              Technical audit
            </p>
            <p className="text-[11px] text-muted/50 mt-1 leading-relaxed">
              Findings from the pre-engagement audit. All resolved before handoff.
            </p>
          </div>
          <div className="md:col-span-9 md:col-start-4">
            <AuditBlock findings={item.auditFindings} />
          </div>
        </div>
      )}

      {/* Video walkthrough */}
      <div className="py-12 md:py-16 border-t border-border grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-3">
          <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-1">
            Walkthrough
          </p>
          <p className="text-[11px] text-muted/50 leading-relaxed">
            Full build teardown and before/after demo
          </p>
        </div>
        <div className="md:col-span-8 md:col-start-5">
          {item.videoId && item.videoPlatform ? (
            <VideoEmbed
              id={item.videoId}
              platform={item.videoPlatform as 'youtube' | 'loom' | 'vimeo'}
              title={`${item.client} — Full walkthrough`}
              caption={`${item.client} — build process, decisions, and before/after demonstration`}
            />
          ) : (
            <div className="aspect-video bg-[#0a0a0a] rounded-xl relative overflow-hidden flex items-center justify-center">
              <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                  backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
              <div className="relative flex flex-col items-center gap-3 text-center px-6">
                <div className="h-14 w-14 rounded-full border border-white/15 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 ml-0.5" fill="white" opacity="0.4" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-white/40 text-[11px] font-medium uppercase tracking-[0.2em]">
                  Video walkthrough
                </p>
                <p className="text-white/20 text-xs max-w-xs leading-relaxed">
                  Full build teardown available on request
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="py-12 md:py-16 border-t border-border">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <h3 className="text-base font-semibold text-ink tracking-tight mb-1.5">
              Working on something similar?
            </h3>
            <p className="text-sm text-muted">
              We take on a small number of new engagements each year. Tell us about your project.
            </p>
          </div>
          <a
            href="https://wa.me/447478034171"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-[#222] transition-[background-color] duration-150"
          >
            Start a conversation
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Related work */}
      {related.length > 0 && (
        <div className="py-12 md:py-16 border-t border-border">
          <div className="flex items-center justify-between mb-8">
            <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em]">
              Related work
            </p>
            <Link
              href="/work"
              className="text-xs text-muted hover:text-ink transition-[color] duration-150 flex items-center gap-1.5"
            >
              All work
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden">
            {related.map((w) => (
              <Link
                key={w.slug}
                href={`/work/${w.slug}`}
                className="group bg-white p-6 md:p-7 flex flex-col hover:bg-[#fafafa] transition-[background-color] duration-200"
              >
                <div
                  className="w-full aspect-[16/7] rounded-lg mb-5"
                  style={{ backgroundColor: w.accentColor ?? '#f0f0ef' }}
                />
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
                    {CATEGORY_LABEL[w.category] ?? w.category}
                  </span>
                  {w.year && (
                    <>
                      <span className="text-muted/30 text-[11px]">·</span>
                      <span className="text-[11px] text-muted">{w.year}</span>
                    </>
                  )}
                </div>
                <h4 className="text-base font-semibold text-ink tracking-tight mb-1">{w.client}</h4>
                <p className="text-sm text-muted leading-relaxed">{w.headline}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
