'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import type { CmsTheme, CmsWorkItem, CmsInquiry, CmsArticle } from '@/types'

const SECTIONS = [
  { label: 'Themes', href: '/admin/themes', description: 'Shopify theme showcase and licensing' },
  { label: 'Work', href: '/admin/work', description: 'Case studies, proof metrics, audit findings' },
  { label: 'Articles', href: '/admin/articles', description: 'Audits, teardowns, and commerce analyses' },
  { label: 'Media', href: '/admin/media', description: 'Screenshots, thumbnails, before/after assets' },
  { label: 'Testimonials', href: '/admin/testimonials', description: 'Client quotes and attribution' },
  { label: 'Inquiries', href: '/admin/inquiries', description: 'Contact form submissions and theme enquiries' },
]

export default function AdminHubPage() {
  const { data: themes } = useSWR<CmsTheme[]>('/cms/themes')
  const { data: work } = useSWR<CmsWorkItem[]>('/cms/work')
  const { data: articles } = useSWR<CmsArticle[]>('/cms/articles')
  const { data: inquiries } = useSWR<CmsInquiry[]>('/cms/inquiries')

  useEffect(() => {
    document.title = 'Content — E-Tech.'
  }, [])

  const published = (items: { status: string }[] | undefined) =>
    items?.filter((i) => i.status === 'published').length ?? 0
  const newInquiries = inquiries?.filter((i) => i.status === 'new').length ?? 0

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl">
        <div className="mb-7">
          <h1 className="text-xl md:text-2xl font-semibold text-ink tracking-tight">Content</h1>
          <p className="mt-1 text-sm text-muted">Platform editorial and CMS administration.</p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-px bg-border border border-border rounded-xl overflow-hidden mb-8">
          {[
            { label: 'Themes published', value: published(themes) },
            { label: 'Work published', value: published(work) },
            { label: 'Articles published', value: published(articles) },
            { label: 'New inquiries', value: newInquiries },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white px-4 py-4">
              <p className="text-2xl font-semibold text-ink tracking-tight">{value}</p>
              <p className="text-[11px] text-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Section links */}
        <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
          {SECTIONS.map(({ label, href, description }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between px-5 py-4 hover:bg-surface transition-[background-color] duration-150 group"
            >
              <div>
                <p className="text-sm font-medium text-ink">{label}</p>
                <p className="text-[11px] text-muted mt-0.5">{description}</p>
              </div>
              <svg className="h-4 w-4 text-muted/40 group-hover:text-muted transition-[color] duration-150 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
