import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRightIcon, CheckIcon, DownloadIcon } from '@/components/ui/Icons'

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Download templates, starter kits, guides, and design systems built by the E-Tech OS team. Licensed for personal and commercial use.',
  openGraph: {
    title: 'Resources — E-Tech OS',
    description: 'Premium digital resources: templates, starter kits, and playbooks.',
  },
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

type License = { id: string; name: string; priceCents: number; sortOrder: number }

type Resource = {
  id: string
  slug: string
  title: string
  tagline: string
  category: string
  featured: boolean
  coverImageUrl?: string | null
  tags: string[]
  licenses: License[]
}

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  template:     { label: 'Template',     color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-100' },
  plugin:       { label: 'Plugin',       color: 'text-violet-700', bg: 'bg-violet-50 border-violet-100' },
  guide:        { label: 'Guide',        color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-100' },
  tool:         { label: 'Tool',         color: 'text-sky-700',    bg: 'bg-sky-50 border-sky-100' },
  starter_kit:  { label: 'Starter Kit',  color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
  design_asset: { label: 'Design Asset', color: 'text-rose-700',   bg: 'bg-rose-50 border-rose-100' },
  course:       { label: 'Course',       color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-100' },
  font:         { label: 'Font',         color: 'text-slate-700',  bg: 'bg-slate-50 border-slate-100' },
}

async function fetchResources(): Promise<Resource[]> {
  try {
    const res = await fetch(`${API}/resources`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) return data
    }
  } catch { /* fall through */ }
  return []
}

function priceFrom(resource: Resource) {
  if (!resource.licenses?.length) return null
  const min = Math.min(...resource.licenses.map((l) => l.priceCents))
  return min === 0 ? 'Free' : `From $${(min / 100).toLocaleString()}`
}

export default async function ResourcesPage() {
  const resources = await fetchResources()
  const featured = resources.filter((r) => r.featured)
  const byCategory = resources.reduce<Record<string, Resource[]>>((acc, r) => {
    ;(acc[r.category] ||= []).push(r)
    return acc
  }, {})

  return (
    <>
      {/* Header */}
      <section className="bg-white border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-16 md:py-24 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Resources Marketplace</p>
            <h1 className="font-display text-[clamp(2rem,4.5vw,4rem)] font-bold tracking-tight text-ink leading-[1.05] mb-5">
              Tools built by the<br />team that uses them.
            </h1>
            <p className="text-base md:text-lg text-muted leading-relaxed max-w-2xl">
              Templates, starter kits, guides, and design systems we created for our own client work —
              now available for you to use. Instant download after activation.
            </p>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="bg-surface border-b border-border">
          <div className="px-5 md:px-10 lg:px-16 py-14 md:py-20 max-w-7xl mx-auto">
            <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-10">Featured</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((r) => <ResourceCard key={r.id} resource={r} />)}
            </div>
          </div>
        </section>
      )}

      {/* By category */}
      <section className="bg-white">
        <div className="px-5 md:px-10 lg:px-16 py-14 md:py-20 max-w-7xl mx-auto space-y-16">
          {Object.keys(byCategory).length === 0 && (
            <div className="py-20 text-center">
              <p className="text-sm text-muted">No resources available yet. Check back soon.</p>
            </div>
          )}
          {Object.entries(byCategory).map(([cat, items]) => {
            const meta = CATEGORY_META[cat] ?? { label: cat, color: 'text-muted', bg: 'bg-surface border-border' }
            return (
              <div key={cat} id={cat}>
                <div className="flex items-center gap-3 mb-8">
                  <span className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${meta.bg} ${meta.color}`}>
                    {meta.label}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map((r) => <ResourceCard key={r.id} resource={r} />)}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink border-t border-ink/80">
        <div className="px-5 md:px-10 lg:px-16 py-16 md:py-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
                Need something custom?
              </h2>
              <p className="text-white/50 text-sm md:text-base leading-relaxed">
                Our services team builds bespoke tools, templates, and systems for agencies and brands.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 bg-brand text-white text-sm font-bold px-6 py-3 rounded-lg hover:bg-brand-deep transition-colors duration-150"
              >
                Browse services <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-white/20 text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition-colors duration-150"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function ResourceCard({ resource }: { resource: Resource }) {
  const meta = CATEGORY_META[resource.category] ?? { label: resource.category, color: 'text-muted', bg: 'bg-surface border-border' }
  const price = priceFrom(resource)

  return (
    <Link
      href={`/resources/${resource.slug}`}
      className="group flex flex-col bg-white border border-border rounded-xl p-6 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/[0.06] transition-all duration-200"
    >
      {/* Cover placeholder */}
      <div className="w-full h-36 bg-surface rounded-lg mb-5 flex items-center justify-center border border-border group-hover:border-brand/20 transition-colors duration-200 overflow-hidden">
        {resource.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resource.coverImageUrl} alt={resource.title} className="w-full h-full object-cover" />
        ) : (
          <DownloadIcon className="h-8 w-8 text-muted/30" />
        )}
      </div>

      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${meta.bg} ${meta.color}`}>
          {meta.label}
        </span>
        {price && <span className="text-xs font-semibold text-ink/70 shrink-0">{price}</span>}
      </div>

      <h3 className="text-[15px] font-semibold text-ink tracking-tight mb-2 leading-snug group-hover:text-brand transition-colors duration-150">
        {resource.title}
      </h3>
      <p className="text-sm text-muted leading-relaxed flex-1 mb-5">{resource.tagline}</p>

      {resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {resource.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] font-medium text-muted bg-surface border border-border px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted">
          <CheckIcon className="h-3 w-3 text-emerald-500" />
          {resource.licenses?.length ?? 0} license{(resource.licenses?.length ?? 0) !== 1 ? 's' : ''}
        </div>
        <span className="text-xs font-semibold text-brand flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          View <ArrowRightIcon className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}
