'use client'

import { useEffect, useState } from 'react'
import useSWR, { mutate as globalMutate } from 'swr'
import { api } from '@/lib/api'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'
import type { CmsInquiry, InquiryStatus } from '@/types'

const STATUS_TABS: { label: string; value: InquiryStatus | 'all' }[] = [
  { label: 'New', value: 'new' },
  { label: 'Read', value: 'read' },
  { label: 'Replied', value: 'replied' },
  { label: 'Archived', value: 'archived' },
  { label: 'All', value: 'all' },
]

const STATUS_STYLES: Record<InquiryStatus, string> = {
  new: 'bg-brand/10 text-brand',
  read: 'bg-surface text-muted',
  replied: 'bg-green-50 text-green-700',
  archived: 'bg-surface text-muted/50',
}

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  project: 'New project',
  'theme-purchase': 'Theme purchase',
  'theme-demo': 'Theme demo',
  other: 'Other',
}

function InquiryDetail({ inquiry, onClose, onStatusChange }: {
  inquiry: CmsInquiry
  onClose: () => void
  onStatusChange: () => void
}) {
  async function setStatus(status: InquiryStatus) {
    await api.put(`/cms/inquiries/${inquiry.id}/status`, { status })
    onStatusChange()
  }

  const nextStatus: Record<InquiryStatus, InquiryStatus | null> = {
    new: 'replied',
    read: 'replied',
    replied: 'archived',
    archived: null,
  }

  const next = nextStatus[inquiry.status]

  return (
    <div className="border border-border rounded-xl bg-white divide-y divide-border">
      {/* Meta */}
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-ink">{inquiry.name}</p>
            {inquiry.inquiryType && (
              <span className="text-[10px] font-medium text-muted bg-surface border border-border px-1.5 py-0.5 rounded">
                {INQUIRY_TYPE_LABELS[inquiry.inquiryType] ?? inquiry.inquiryType}
              </span>
            )}
            {inquiry.themeSlug && (
              <span className="text-[10px] font-medium text-muted bg-surface border border-border px-1.5 py-0.5 rounded">
                {inquiry.themeSlug}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted">
            <a href={`mailto:${inquiry.email}`} className="hover:text-ink transition-[color] duration-150 underline underline-offset-2">
              {inquiry.email}
            </a>
            {inquiry.company && ` · ${inquiry.company}`}
            {inquiry.budget && ` · ${inquiry.budget}`}
          </p>
          <p className="text-[10px] text-muted/50 mt-0.5">{formatDate(inquiry.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[inquiry.status]}`}>
            {inquiry.status}
          </span>
          {next && (
            <button
              onClick={() => setStatus(next)}
              className="text-xs text-muted hover:text-ink border border-border rounded px-2 py-1 transition-[color,border-color] duration-150 hover:border-ink/40"
            >
              Mark {next}
            </button>
          )}
          {inquiry.status !== 'archived' && (
            <button
              onClick={() => setStatus('archived')}
              className="text-xs text-muted/50 hover:text-muted border border-border rounded px-2 py-1 transition-[color] duration-150"
            >
              Archive
            </button>
          )}
          <button onClick={onClose} className="text-muted/40 hover:text-muted transition-[color] duration-150 text-lg leading-none px-1">×</button>
        </div>
      </div>
      {/* Message */}
      <div className="px-5 py-4">
        <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
      </div>
      {/* Reply shortcut */}
      <div className="px-5 py-3">
        <a
          href={`mailto:${inquiry.email}?subject=Re: your ${inquiry.inquiryType === 'theme-purchase' ? `${inquiry.themeSlug ?? 'theme'} purchase enquiry` : 'enquiry'}`}
          className="text-xs text-muted hover:text-ink transition-[color] duration-150 underline underline-offset-2"
        >
          Open in email client
        </a>
      </div>
    </div>
  )
}

export default function AdminInquiriesPage() {
  const [tab, setTab] = useState<InquiryStatus | 'all'>('new')
  const [selected, setSelected] = useState<string | null>(null)

  const swrKey = tab === 'all' ? '/cms/inquiries' : `/cms/inquiries?status=${tab}`
  const { data: inquiries, isLoading, mutate } = useSWR<CmsInquiry[]>(swrKey)

  const selectedInquiry = inquiries?.find((i) => i.id === selected)

  useEffect(() => {
    document.title = 'Inquiries — Content'
  }, [])

  function refresh() {
    mutate()
    globalMutate('/cms/inquiries')
    STATUS_TABS.forEach(({ value }) => {
      if (value !== 'all') globalMutate(`/cms/inquiries?status=${value}`)
    })
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-ink tracking-tight">Inquiries</h1>
          <p className="text-sm text-muted mt-0.5">Contact form submissions and theme enquiries.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5">
          {STATUS_TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => { setTab(value); setSelected(null) }}
              className={[
                'px-3 py-1.5 text-xs rounded-md border transition-[background-color,color,border-color] duration-150',
                tab === value
                  ? 'bg-ink text-white border-ink'
                  : 'border-border text-muted hover:text-ink hover:border-ink/40',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Selected detail */}
        {selected && selectedInquiry && (
          <div className="mb-4">
            <InquiryDetail
              inquiry={selectedInquiry}
              onClose={() => setSelected(null)}
              onStatusChange={refresh}
            />
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : !inquiries?.length ? (
          <div className="py-12 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No {tab === 'all' ? '' : tab} inquiries.</p>
          </div>
        ) : (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
            {inquiries.map((inquiry) => (
              <button
                key={inquiry.id}
                onClick={() => setSelected(inquiry.id === selected ? null : inquiry.id)}
                className={[
                  'w-full flex items-center justify-between px-5 py-4 text-left',
                  'hover:bg-surface transition-[background-color] duration-150',
                  selected === inquiry.id ? 'bg-surface' : '',
                ].join(' ')}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm font-medium ${inquiry.status === 'new' ? 'text-ink' : 'text-ink/70'}`}>
                      {inquiry.name}
                    </p>
                    {inquiry.themeSlug && (
                      <span className="text-[10px] text-muted bg-surface border border-border px-1.5 py-0.5 rounded">
                        {inquiry.themeSlug}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted truncate">{inquiry.message.slice(0, 80)}{inquiry.message.length > 80 ? '…' : ''}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-[10px] text-muted/60 hidden sm:block">{formatDate(inquiry.createdAt)}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[inquiry.status]}`}>
                    {inquiry.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
