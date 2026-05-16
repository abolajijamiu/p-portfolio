import type { Metadata } from 'next'
import Link from 'next/link'
import { ARTICLE_CATEGORY_LABELS, type CmsArticle, type ArticleCategory } from '@/types'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Articles',
  description:
    'Shopify audits, UX teardowns, SEO analyses, and commerce optimisation deep-dives — with documented findings and real results.',
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function getArticles(): Promise<CmsArticle[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/cms/articles/published`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

const CATEGORY_FILTERS: { label: string; value: ArticleCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Shopify Audit', value: 'audit' },
  { label: 'UX Teardown', value: 'ux' },
  { label: 'SEO Analysis', value: 'seo' },
  { label: 'Funnel Breakdown', value: 'funnel' },
  { label: 'Commerce Optimization', value: 'commerce' },
]

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const articles = await getArticles()

  const activeCategory = category as ArticleCategory | undefined
  const filtered = activeCategory
    ? articles.filter((a) => a.category === activeCategory)
    : articles

  const featured = filtered.filter((a) => a.featured)
  const rest = filtered.filter((a) => !a.featured)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#e8e8e8]">
        <div className="max-w-5xl mx-auto px-5 md:px-8 pt-16 pb-10">
          <p className="text-[11px] font-medium text-muted/60 uppercase tracking-[0.15em] mb-4">Editorial</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-ink">Articles</h1>
          <p className="mt-3 text-base text-muted max-w-xl leading-relaxed">
            Shopify audits, UX teardowns, and commerce analyses — findings with documented results, not advice from someone who read a blog.
          </p>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mt-7">
            {CATEGORY_FILTERS.map(({ label, value }) => {
              const isActive = value === 'all' ? !activeCategory : activeCategory === value
              return (
                <Link
                  key={value}
                  href={value === 'all' ? '/articles' : `/articles?category=${value}`}
                  className={[
                    'px-3 py-1.5 text-xs rounded-full border transition-[background-color,color,border-color] duration-150',
                    isActive
                      ? 'bg-ink text-white border-ink'
                      : 'border-[#e0e0e0] text-muted hover:text-ink hover:border-ink/40',
                  ].join(' ')}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-12">
        {!articles.length ? (
          <div className="py-20 text-center">
            <p className="text-muted text-sm">No articles published yet.</p>
          </div>
        ) : !filtered.length ? (
          <div className="py-20 text-center">
            <p className="text-muted text-sm">No {activeCategory ? ARTICLE_CATEGORY_LABELS[activeCategory] : ''} articles yet.</p>
          </div>
        ) : (
          <>
            {/* Featured grid */}
            {featured.length > 0 && (
              <div className={`grid gap-5 mb-10 ${featured.length === 1 ? 'grid-cols-1 max-w-2xl' : 'md:grid-cols-2'}`}>
                {featured.map((article) => (
                  <FeaturedCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {/* All other articles */}
            {rest.length > 0 && (
              <div className="divide-y divide-[#f0f0f0]">
                {featured.length > 0 && (
                  <div className="pb-4">
                    <p className="text-[11px] font-medium text-muted/50 uppercase tracking-[0.12em]">
                      {activeCategory ? ARTICLE_CATEGORY_LABELS[activeCategory] : 'All articles'}
                    </p>
                  </div>
                )}
                {rest.map((article) => (
                  <ArticleRow key={article.id} article={article} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function FeaturedCard({ article }: { article: CmsArticle }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group block border border-[#e8e8e8] rounded-xl p-6 hover:border-ink/20 transition-[border-color] duration-200 bg-white"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted/60">
          {ARTICLE_CATEGORY_LABELS[article.category]}
        </span>
        {article.client && (
          <>
            <span className="text-muted/30">·</span>
            <span className="text-[10px] text-muted/60">{article.client}</span>
          </>
        )}
      </div>
      <h2 className="text-lg font-semibold text-ink tracking-tight leading-snug group-hover:text-ink/80 transition-[color] duration-150 mb-2">
        {article.title}
      </h2>
      {article.subtitle && (
        <p className="text-sm text-muted mb-3">{article.subtitle}</p>
      )}
      {article.excerpt && (
        <p className="text-[13px] text-muted/80 leading-relaxed line-clamp-3 mb-4">{article.excerpt}</p>
      )}
      {/* Proof preview */}
      {article.proof.length > 0 && (
        <div className="flex gap-5 pt-4 border-t border-[#f0f0f0]">
          {article.proof.slice(0, 3).map((p, i) => (
            <div key={i}>
              <p className="text-base font-semibold text-ink tracking-tight">{p.metric}</p>
              <p className="text-[10px] text-muted/70">{p.label}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-[11px] text-muted/50">
          {article.publishedAt ? formatDate(article.publishedAt) : ''}
          {article.readingMinutes ? ` · ${article.readingMinutes} min` : ''}
        </span>
      </div>
    </Link>
  )
}

function ArticleRow({ article }: { article: CmsArticle }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex items-baseline justify-between py-5 hover:bg-[#fafafa] -mx-3 px-3 rounded-lg transition-[background-color] duration-150"
    >
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted/50">
            {ARTICLE_CATEGORY_LABELS[article.category]}
          </span>
          {article.client && (
            <span className="text-[10px] text-muted/40">· {article.client}</span>
          )}
        </div>
        <p className="text-sm font-medium text-ink group-hover:text-ink/70 transition-[color] duration-150 leading-snug">
          {article.title}
        </p>
        {article.excerpt && (
          <p className="text-[12px] text-muted/70 mt-0.5 line-clamp-1">{article.excerpt}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-[11px] text-muted/50 tabular-nums">
          {article.publishedAt ? formatDate(article.publishedAt) : '—'}
        </p>
        {article.readingMinutes && (
          <p className="text-[10px] text-muted/40">{article.readingMinutes} min</p>
        )}
      </div>
    </Link>
  )
}
