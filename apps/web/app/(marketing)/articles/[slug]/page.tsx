import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { marked } from 'marked'
import { ARTICLE_CATEGORY_LABELS, type CmsArticle } from '@/types'
import { formatDate } from '@/lib/utils'
import { ReadingProgress } from '@/components/articles/ReadingProgress'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function getArticle(slug: string): Promise<CmsArticle | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/cms/articles/published/${slug}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getRelatedArticles(current: CmsArticle): Promise<CmsArticle[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/cms/articles/published?category=${current.category}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const all: CmsArticle[] = await res.json()
    return all.filter((a) => a.id !== current.id).slice(0, 3)
  } catch {
    return []
  }
}

type Heading = { id: string; text: string; level: 2 | 3 }

function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = []
  const lines = markdown.split('\n')
  for (const line of lines) {
    const m2 = line.match(/^##\s+(.+)/)
    const m3 = line.match(/^###\s+(.+)/)
    if (m2) {
      const text = m2[1].trim()
      headings.push({ id: slugifyHeading(text), text, level: 2 })
    } else if (m3) {
      const text = m3[1].trim()
      headings.push({ id: slugifyHeading(text), text, level: 3 })
    }
  }
  return headings
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function addHeadingIds(html: string): string {
  return html
    .replace(/<h2>([^<]+)<\/h2>/g, (_, text) => {
      const id = slugifyHeading(text)
      return `<h2 id="${id}">${text}</h2>`
    })
    .replace(/<h3>([^<]+)<\/h3>/g, (_, text) => {
      const id = slugifyHeading(text)
      return `<h3 id="${id}">${text}</h3>`
    })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: 'Not found' }

  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt ?? undefined,
    openGraph: {
      title: article.seoTitle ?? article.title,
      description: article.seoDescription ?? article.excerpt ?? undefined,
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const related = await getRelatedArticles(article)

  const bodyHtml = article.body
    ? addHeadingIds(marked.parse(article.body) as string)
    : null
  const headings = article.body ? extractHeadings(article.body) : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt ?? undefined,
    datePublished: article.publishedAt ?? article.createdAt,
    dateModified: article.updatedAt,
    author: { '@type': 'Organization', name: 'E-Tech' },
    publisher: { '@type': 'Organization', name: 'E-Tech' },
  }

  return (
    <>
      <ReadingProgress />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-[#e8e8e8]">
          <div className="max-w-2xl mx-auto px-5 md:px-8 pt-14 pb-10">
            <div className="flex items-center gap-2 mb-6">
              <Link
                href="/articles"
                className="text-[11px] text-muted/50 hover:text-muted transition-[color] duration-150 uppercase tracking-[0.12em] font-medium"
              >
                Articles
              </Link>
              <span className="text-muted/30">›</span>
              <span className="text-[11px] text-muted/60 uppercase tracking-[0.12em] font-medium">
                {ARTICLE_CATEGORY_LABELS[article.category]}
              </span>
            </div>

            <h1 className="font-display text-[2rem] md:text-[2.4rem] leading-[1.15] tracking-tight text-ink mb-4">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="text-lg text-muted leading-relaxed mb-6">{article.subtitle}</p>
            )}

            <div className="flex items-center gap-3 text-[12px] text-muted/60">
              {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
              {article.readingMinutes && (
                <>
                  <span className="text-muted/30">·</span>
                  <span>{article.readingMinutes} min read</span>
                </>
              )}
              {article.client && (
                <>
                  <span className="text-muted/30">·</span>
                  <span>{article.client}</span>
                </>
              )}
            </div>

            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-5">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium text-muted/60 bg-surface border border-[#e8e8e8] px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Proof metrics */}
        {article.proof.length > 0 && (
          <div className="border-b border-[#e8e8e8] bg-[#fafafa]">
            <div className="max-w-2xl mx-auto px-5 md:px-8 py-8">
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted/40 mb-6">Results</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-6">
                {article.proof.map((p, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-[1.75rem] font-semibold text-ink tracking-tight leading-none">{p.metric}</p>
                    <p className="text-[12px] text-muted font-medium mt-1.5">{p.label}</p>
                    {p.period && <p className="text-[11px] text-muted/50">{p.period}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Body + TOC layout */}
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-10 pb-12">
          {headings.length > 2 ? (
            <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-16">
              <div
                className="article-body"
                dangerouslySetInnerHTML={{ __html: bodyHtml! }}
              />

              {/* TOC — desktop sticky sidebar */}
              <aside className="hidden lg:block">
                <div className="sticky top-24 space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted/40 mb-3">
                    Contents
                  </p>
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={[
                        'block text-[12px] leading-snug py-0.5 transition-[color] duration-150 hover:text-ink',
                        h.level === 2 ? 'text-muted' : 'text-muted/50 pl-3',
                      ].join(' ')}
                    >
                      {h.text}
                    </a>
                  ))}
                </div>
              </aside>
            </div>
          ) : bodyHtml ? (
            <div className="max-w-2xl article-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          ) : null}
        </div>

        {/* Before / After comparisons */}
        {article.comparisons.length > 0 && (
          <div className="border-t border-[#e8e8e8] bg-[#fafafa]">
            <div className="max-w-2xl mx-auto px-5 md:px-8 py-10">
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted/40 mb-7">Before / After</p>
              <div className="space-y-5">
                {article.comparisons.map((c, i) => (
                  <div key={i} className="border border-[#e8e8e8] rounded-xl overflow-hidden bg-white">
                    {c.label && (
                      <div className="px-5 py-3 border-b border-[#f0f0f0] bg-[#fafafa]">
                        <p className="text-[12px] font-semibold text-ink tracking-tight">{c.label}</p>
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#f0f0f0]">
                      <div className="px-5 py-5">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-red-400 mb-3">Before</p>
                        <p className="text-[13px] text-ink/80 leading-relaxed whitespace-pre-line">{c.before}</p>
                      </div>
                      <div className="px-5 py-5 bg-[#fdfffe]">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-green-600 mb-3">After</p>
                        <p className="text-[13px] text-ink/80 leading-relaxed whitespace-pre-line">{c.after}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="border-t border-[#e8e8e8]">
          <div className="max-w-2xl mx-auto px-5 md:px-8 py-10 flex items-center justify-between gap-6">
            <div>
              {article.workSlug && (
                <Link
                  href={`/work/${article.workSlug}`}
                  className="inline-flex items-center gap-1.5 text-sm text-ink/70 hover:text-ink transition-[color] duration-150 underline underline-offset-2 decoration-muted/30 hover:decoration-ink/60"
                >
                  See the full case study
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              )}
            </div>
            <Link
              href="/articles"
              className="text-sm text-muted/60 hover:text-muted transition-[color] duration-150"
            >
              ← All articles
            </Link>
          </div>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="border-t border-[#e8e8e8] bg-[#fafafa]">
            <div className="max-w-2xl mx-auto px-5 md:px-8 py-10">
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted/40 mb-6">
                More {ARTICLE_CATEGORY_LABELS[article.category]}
              </p>
              <div className="divide-y divide-[#f0f0f0]">
                {related.map((a) => (
                  <Link
                    key={a.id}
                    href={`/articles/${a.slug}`}
                    className="flex items-baseline justify-between py-4 group"
                  >
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-sm font-medium text-ink group-hover:text-ink/70 transition-[color] duration-150 leading-snug">
                        {a.title}
                      </p>
                      {a.client && (
                        <p className="text-[11px] text-muted/50 mt-0.5">{a.client}</p>
                      )}
                    </div>
                    <p className="text-[11px] text-muted/40 shrink-0 tabular-nums">
                      {a.publishedAt ? formatDate(a.publishedAt) : '—'}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </article>
    </>
  )
}
