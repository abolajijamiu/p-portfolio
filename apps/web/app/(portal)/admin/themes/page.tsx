'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import type { CmsTheme } from '@/types'

function statusClass(status: string) {
  if (status === 'published') return 'bg-green-50 text-green-700'
  if (status === 'archived') return 'bg-surface text-muted'
  return 'bg-amber-50 text-amber-700'
}

export default function AdminThemesPage() {
  const { data: themes, isLoading } = useSWR<CmsTheme[]>('/cms/themes')

  useEffect(() => {
    document.title = 'Themes — Content'
  }, [])

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Themes</h1>
            <p className="text-sm text-muted mt-0.5">
              {themes ? `${themes.length} total` : '—'}
            </p>
          </div>
          <Link href="/admin/themes/new">
            <Button size="sm">New theme</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : !themes?.length ? (
          <div className="py-14 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No themes yet.</p>
            <Link href="/admin/themes/new" className="mt-2 inline-block text-xs text-ink underline underline-offset-2">
              Add the first theme
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
            {themes.map((theme) => (
              <Link
                key={theme.id}
                href={`/admin/themes/${theme.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-surface transition-[background-color] duration-150 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {theme.accentColor && (
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{theme.name}</p>
                    <p className="text-[11px] text-muted truncate">{theme.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[11px] text-muted hidden sm:block">
                    {theme.priceCents ? `$${theme.priceCents / 100}` : 'Custom'}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusClass(theme.status)}`}>
                    {theme.status}
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
