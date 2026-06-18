'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { api } from '@/lib/api'

type Purchase = {
  id: string
  status: 'pending_payment' | 'active' | 'expired' | 'refunded'
  pricePaidCents: number
  currency: string
  downloadCount: number
  maxDownloads?: number | null
  licenseKey: string
  activatedAt?: string | null
  createdAt: string
  resource: {
    id: string
    title: string
    slug: string
    category: string
    coverImageUrl?: string | null
  }
  license: { name: string }
}

type DownloadResult = {
  licenseKey: string
  files: { name: string; size: number; url: string }[]
}

const STATUS_STYLE: Record<string, string> = {
  pending_payment: 'bg-amber-50 text-amber-700 border-amber-100',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  expired: 'bg-surface text-muted border-border',
  refunded: 'bg-surface text-muted border-border',
}

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Awaiting activation',
  active: 'Active',
  expired: 'Expired',
  refunded: 'Refunded',
}

const CATEGORY_LABEL: Record<string, string> = {
  template: 'Template', plugin: 'Plugin', guide: 'Guide', tool: 'Tool',
  starter_kit: 'Starter Kit', design_asset: 'Design Asset', course: 'Course', font: 'Font',
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function PurchasesPage() {
  const { data: purchases, isLoading } = useSWR<Purchase[]>('/resource-purchases/mine')
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloads, setDownloads] = useState<Record<string, DownloadResult>>({})

  const paymentResult =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('payment')
      : null

  useEffect(() => {
    document.title = 'My Downloads — E-Tech OS'
  }, [])

  async function handleDownload(purchaseId: string) {
    setDownloading(purchaseId)
    try {
      const result = await api.get<DownloadResult>(`/resource-purchases/${purchaseId}/download`)
      setDownloads((prev) => ({ ...prev, [purchaseId]: result }))
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Download failed.'
      alert(msg)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      {paymentResult === 'success' && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3 text-center">
          <p className="text-sm font-medium text-emerald-800">
            Payment confirmed — your download is now active. Find it below.
          </p>
        </div>
      )}
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Downloads</h1>
            <p className="text-sm text-muted mt-0.5">Your purchased resources and licence keys</p>
          </div>
          <Link
            href="/resources"
            className="shrink-0 inline-flex items-center gap-1.5 bg-brand text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-brand-deep transition-colors"
          >
            Browse resources
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-border rounded-xl p-5 bg-white animate-pulse">
                <div className="h-4 w-40 bg-surface rounded mb-3" />
                <div className="h-3 w-28 bg-surface rounded" />
              </div>
            ))}
          </div>
        ) : !purchases?.length ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm font-medium text-ink mb-1">No purchases yet</p>
            <p className="text-xs text-muted mb-5">Browse our resource library and pick something useful.</p>
            <Link
              href="/resources"
              className="inline-flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-deep transition-colors"
            >
              Explore resources
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((p) => {
              const dl = downloads[p.id]
              return (
                <div key={p.id} className="bg-white border border-border rounded-xl overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <Link
                          href={`/resources/${p.resource.slug}`}
                          className="text-sm font-semibold text-ink hover:text-brand transition-colors truncate block"
                        >
                          {p.resource.title}
                        </Link>
                        <p className="text-xs text-muted mt-0.5">
                          {CATEGORY_LABEL[p.resource.category] ?? p.resource.category}
                          {' · '}
                          {p.license.name} licence
                          {' · '}
                          ${(p.pricePaidCents / 100).toLocaleString()}
                        </p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLE[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </div>

                    {p.status === 'pending_payment' && (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 text-xs text-amber-800 leading-relaxed">
                        Payment confirmation pending. Contact us at{' '}
                        <a href="mailto:hello@deempiretech.com" className="underline">hello@deempiretech.com</a>{' '}
                        or{' '}
                        <a href="https://wa.me/message/XXXXXXXXX" className="underline">WhatsApp</a>{' '}
                        to arrange payment. Access will be activated within a few hours.
                      </div>
                    )}

                    {p.status === 'active' && (
                      <>
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs text-muted">
                            {p.downloadCount} download{p.downloadCount !== 1 ? 's' : ''}
                            {p.maxDownloads ? ` of ${p.maxDownloads}` : ''}
                          </div>
                          <button
                            onClick={() => handleDownload(p.id)}
                            disabled={downloading === p.id}
                            className="text-xs font-semibold text-brand hover:underline disabled:opacity-50 transition-colors"
                          >
                            {downloading === p.id ? 'Loading...' : 'Get download links →'}
                          </button>
                        </div>

                        {dl && (
                          <div className="mt-3 border-t border-border pt-3 space-y-2">
                            <div className="bg-surface border border-border rounded-lg px-3 py-2">
                              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-0.5">Licence key</p>
                              <p className="font-mono text-xs text-ink select-all">{dl.licenseKey}</p>
                            </div>
                            {dl.files.map((f) => (
                              <a
                                key={f.url}
                                href={f.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-3 bg-brand-dim border border-brand/10 rounded-lg px-3 py-2 hover:bg-brand-dim/70 transition-colors group"
                              >
                                <span className="text-xs font-medium text-ink truncate">{f.name}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-xs text-muted">{fmtSize(f.size)}</span>
                                  <span className="text-xs font-semibold text-brand group-hover:underline">Download</span>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {(p.status === 'expired' || p.status === 'refunded') && (
                      <p className="text-xs text-muted mt-1">
                        This licence is {p.status}. Contact us if you have questions.
                      </p>
                    )}
                  </div>

                  <div className="px-5 py-2.5 border-t border-border bg-surface/50 flex items-center justify-between">
                    <p className="text-[11px] text-muted">
                      Purchased {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {p.status === 'active' && (
                      <p className="font-mono text-[10px] text-muted">{p.licenseKey}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
