import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckIcon, DownloadIcon, ShieldCheckIcon, ZapIcon } from '@/components/ui/Icons'
import { PurchaseButton } from './PurchaseButton'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

type License = {
  id: string
  name: string
  description?: string
  priceCents: number
  currency: string
  permissions: Record<string, boolean>
  maxDownloads?: number | null
  sortOrder: number
}

type ResourceFile = {
  id: string
  name: string
  size: number
  mimeType?: string | null
}

type ResourceDetail = {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  category: string
  tags: string[]
  licenses: License[]
  files: ResourceFile[]
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

const PERMISSION_LABELS: Record<string, string> = {
  personal_use: 'Personal use',
  commercial_use: 'Commercial use',
  client_projects: 'Client projects',
  unlimited_projects: 'Unlimited projects',
  resell: 'Resell / redistribute',
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function fetchResource(slug: string): Promise<ResourceDetail | null> {
  try {
    const res = await fetch(`${API}/resources/${slug}`, { next: { revalidate: 3600 } })
    if (res.status === 404) return null
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const resource = await fetchResource(slug)
  if (!resource) return { title: 'Resource Not Found' }
  return {
    title: `${resource.title} — E-Tech OS Resources`,
    description: resource.tagline,
    openGraph: { title: resource.title, description: resource.tagline },
  }
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const resource = await fetchResource(slug)
  if (!resource) notFound()

  const sortedLicenses = [...resource.licenses].sort((a, b) => a.sortOrder - b.sortOrder)
  const allPermissions = [...new Set(sortedLicenses.flatMap((l) => Object.keys(l.permissions)))]
  const meta = CATEGORY_META[resource.category] ?? { label: resource.category, color: 'text-muted', bg: 'bg-surface border-border' }
  const primaryLicense = sortedLicenses[Math.floor(sortedLicenses.length / 2)] ?? sortedLicenses[0]

  return (
    <>
      {/* Header */}
      <section className="bg-white border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 pt-8 pb-14 md:pb-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-muted mb-8">
            <Link href="/resources" className="hover:text-brand transition-colors">Resources</Link>
            <span>/</span>
            <span className="text-ink font-medium">{resource.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
            <div className="lg:col-span-3">
              <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border mb-4 ${meta.bg} ${meta.color}`}>
                {meta.label}
              </span>
              <h1 className="font-display text-[clamp(1.75rem,3.5vw,3.25rem)] font-bold tracking-tight text-ink leading-[1.05] mb-4">
                {resource.title}
              </h1>
              <p className="text-lg text-brand font-medium mb-5">{resource.tagline}</p>
              <p className="text-base text-muted leading-relaxed mb-6">{resource.description}</p>

              {resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {resource.tags.map((tag) => (
                    <span key={tag} className="text-xs text-muted bg-surface border border-border px-2.5 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                {[
                  { icon: ShieldCheckIcon, text: 'Instant licence key' },
                  { icon: ZapIcon, text: 'Download after activation' },
                  { icon: CheckIcon, text: 'Secure payment' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-muted">
                    <Icon className="h-4 w-4 text-brand" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Primary CTA card */}
            {primaryLicense && (
              <div className="lg:col-span-2">
                <div className="bg-surface border border-border rounded-xl p-6">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1">
                    {primaryLicense.name} licence
                  </p>
                  <p className="text-2xl font-bold text-ink mb-0.5">
                    ${(primaryLicense.priceCents / 100).toLocaleString()}
                  </p>
                  {primaryLicense.description && (
                    <p className="text-sm text-muted mb-4 leading-snug">{primaryLicense.description}</p>
                  )}
                  <ul className="space-y-2 mb-5">
                    {Object.entries(primaryLicense.permissions)
                      .filter(([, v]) => v)
                      .map(([k]) => (
                        <li key={k} className="flex items-center gap-2 text-sm text-ink/80">
                          <CheckIcon className="h-4 w-4 text-emerald-500 shrink-0" />
                          {PERMISSION_LABELS[k] ?? k}
                        </li>
                      ))}
                  </ul>
                  <PurchaseButton
                    licenseId={primaryLicense.id}
                    licenseName={primaryLicense.name}
                    priceCents={primaryLicense.priceCents}
                    primary
                  />

                  {resource.files.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">Included files</p>
                      <ul className="space-y-1.5">
                        {resource.files.map((f) => (
                          <li key={f.id} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-ink/70 truncate">
                              <DownloadIcon className="h-3.5 w-3.5 text-muted shrink-0" />
                              {f.name}
                            </span>
                            <span className="text-muted shrink-0 ml-2">{fmtSize(f.size)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Licence comparison */}
      {sortedLicenses.length > 1 && (
        <section className="bg-surface border-b border-border">
          <div className="px-5 md:px-10 lg:px-16 py-14 md:py-20 max-w-7xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-10">Choose a licence</h2>

            <div className={`grid grid-cols-1 gap-5 ${sortedLicenses.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
              {sortedLicenses.map((lic, i) => {
                const isRecommended = i === Math.floor(sortedLicenses.length / 2)
                return (
                  <div
                    key={lic.id}
                    className={`relative flex flex-col bg-white rounded-xl border-2 p-6 transition-all duration-200 ${
                      isRecommended ? 'border-brand shadow-lg shadow-brand/[0.1]' : 'border-border hover:border-brand/30'
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-brand text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          Recommended
                        </span>
                      </div>
                    )}

                    <div className="mb-5">
                      <p className="text-lg font-bold text-ink mb-0.5">{lic.name}</p>
                      {lic.description && <p className="text-sm text-muted">{lic.description}</p>}
                    </div>

                    <p className="text-3xl font-bold text-ink mb-5">
                      ${(lic.priceCents / 100).toLocaleString()}
                    </p>

                    <ul className="space-y-2.5 flex-1 mb-6">
                      {allPermissions.map((perm) => {
                        const allowed = lic.permissions[perm] ?? false
                        return (
                          <li key={perm} className={`flex items-center gap-2.5 text-sm ${allowed ? 'text-ink/80' : 'text-muted/50'}`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${allowed ? 'bg-emerald-100' : 'bg-surface'}`}>
                              {allowed
                                ? <CheckIcon className="h-2.5 w-2.5 text-emerald-600" />
                                : <span className="text-muted/30 text-xs font-bold">×</span>
                              }
                            </span>
                            {PERMISSION_LABELS[perm] ?? perm}
                          </li>
                        )
                      })}
                    </ul>

                    <PurchaseButton
                      licenseId={lic.id}
                      licenseName={lic.name}
                      priceCents={lic.priceCents}
                      primary={isRecommended}
                    />
                  </div>
                )
              })}
            </div>

            <p className="text-xs text-muted text-center mt-8">
              Payment is confirmed manually. Download access is activated within a few hours.{' '}
              <Link href="/contact" className="text-brand hover:underline">Questions? Get in touch.</Link>
            </p>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-white border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-14 max-w-7xl mx-auto">
          <h2 className="font-display text-xl font-bold text-ink mb-8">How download access works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Place your order', body: 'Click "Get" on any licence. We\'ll receive your purchase request immediately.' },
              { step: '2', title: 'We confirm payment', body: 'Contact us via email or WhatsApp to arrange payment. We\'ll activate your download within hours.' },
              { step: '3', title: 'Download in your portal', body: 'Head to your Purchases page in the client portal. Your files and licence key are there.' },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand-dim border border-brand/20 flex items-center justify-center text-brand font-bold text-sm shrink-0">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink mb-1">{title}</p>
                  <p className="text-sm text-muted leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
