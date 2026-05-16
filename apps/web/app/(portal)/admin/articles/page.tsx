'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ARTICLE_CATEGORY_LABELS, type CmsArticle } from '@/types'
import { formatDate } from '@/lib/utils'

function statusClass(status: string) {
  if (status === 'published') return 'bg-green-50 text-green-700'
  if (status === 'archived') return 'bg-surface text-muted'
  return 'bg-amber-50 text-amber-700'
}

export default function AdminArticlesPage() {
  const { data: articles, isLoading } = useSWR<CmsArticle[]>('/cms/articles')

  useEffect(() => {
    document.title = 'Articles — Content'
  }, [])

  const published = articles?.filter((a) => a.status === 'published').length ?? 0
  const drafts = articles?.filter((a) => a.status === 'draft').length ?? 0

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Articles</h1>
            <p className="text-sm text-muted mt-0.5">
              {articles
                ? `${published} published · ${drafts} draft`
                : '—'}
            </p>
          </div>
          <Link href="/admin/articles/new">
            <Button size="sm">New article</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : !articles?.length ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No articles yet.</p>
            <p className="text-xs text-muted/60 mt-1 mb-4">
              Write Shopify audits, UX teardowns, and commerce analyses here.
            </p>
            <Link href="/admin/articles/new">
              <Button size="sm" variant="secondary">Write the first article</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/admin/articles/${article.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-surface transition-[background-color] duration-150 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 mb-0.5">
                    {article.featured && (
                      <span className="text-[10px] font-medium text-brand bg-brand/10 px-1.5 py-0.5 rounded-full shrink-0">
                        Featured
                      </span>
                    )}
                    <p className="text-sm font-medium text-ink truncate">{article.title}</p>
                  </div>
                  <p className="text-[11px] text-muted">
                    {ARTICLE_CATEGORY_LABELS[article.category]}
                    {article.client && ` · ${article.client}`}
                    {article.publishedAt
                      ? ` · ${formatDate(article.publishedAt)}`
                      : ` · updated ${formatDate(article.updatedAt)}`}
                    {article.readingMinutes && ` · ${article.readingMinutes} min`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusClass(article.status)}`}>
                    {article.status}
                  </span>
                  <svg className="h-4 w-4 text-muted/30 group-hover:text-muted transition-[color] duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
