import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRightIcon, CheckIcon, CalendarIcon, ShieldCheckIcon, ZapIcon } from '@/components/ui/Icons'
import { OrderButton } from './OrderButton'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

type Package = {
  id: string
  name: string
  description: string
  priceCents: number
  currency: string
  deliveryDays: number
  revisions: number
  includes: string[]
  sortOrder: number
}

type Faq = { id: string; question: string; answer: string }

type Requirement = {
  id: string
  label: string
  description?: string
  fieldType: string
  required: boolean
}

type ServiceDetail = {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  category: string
  packages: Package[]
  faqs: Faq[]
  requirements: Requirement[]
}

// ─── Category-specific operational content ─────────────────────────────────────

type DeliverableFile = { file: string; format: string; desc: string }
type ProcessPhase = { phase: string; title: string; days: string; desc: string }
type CategoryExtra = { deliverables: DeliverableFile[]; process: ProcessPhase[] }

const CATEGORY_EXTRA: Record<string, CategoryExtra> = {
  development: {
    deliverables: [
      { file: 'Project specification', format: 'PDF', desc: 'Scope, architecture, tech stack, and page breakdown agreed in writing before build begins.' },
      { file: 'Completed website / application', format: 'Live URL', desc: 'Deployed to staging for review, then migrated to your domain with zero downtime.' },
      { file: 'Source code repository', format: 'ZIP / GitHub', desc: 'Full codebase with setup instructions and README. You own it outright on delivery.' },
      { file: 'Device & browser test report', format: 'PDF', desc: 'Pass/fail screenshots across Chrome, Safari, Firefox, and iOS/Android mobile.' },
      { file: 'Deployment & maintenance guide', format: 'PDF', desc: 'Step-by-step guide to manage, update, and extend the build going forward.' },
    ],
    process: [
      { phase: 'Phase 1', title: 'Discovery & spec', days: 'Days 1–2', desc: 'We review your requirements, ask follow-up questions, and confirm the full scope in a signed spec before any code is written.' },
      { phase: 'Phase 2', title: 'Design & architecture', days: 'Days 2–4', desc: 'Wireframes and technical architecture agreed. You sign off before development starts — no surprises mid-build.' },
      { phase: 'Phase 3', title: 'Build & review', days: 'Days 4–N', desc: 'Development against the agreed spec. First draft typically arrives on day 4–5. Progress updates in your portal each day.' },
      { phase: 'Phase 4', title: 'QA & handoff', days: 'Final 2 days', desc: 'Device testing, final fixes, deployment. Source files and guides deposited to your portal before closure.' },
    ],
  },
  marketing: {
    deliverables: [
      { file: 'Technical SEO audit report', format: 'PDF · 12–20 pages', desc: 'Full site crawl findings, issue severity ratings, and a prioritised fix list generated using Screaming Frog + manual review.' },
      { file: 'Keyword research report', format: 'Spreadsheet', desc: 'Target keywords by search intent, volume, and difficulty. Includes competitor gap analysis and quick-win opportunities.' },
      { file: 'Priority fix checklist', format: 'Notion / PDF', desc: 'Top 20 actions ordered by expected impact. Each item is assignable with an estimated effort rating.' },
      { file: '90-day content roadmap', format: 'Google Slides', desc: 'Editorial calendar mapping content topics to target keywords, funnel stages, and publishing cadence.' },
      { file: 'Monthly progress report', format: 'PDF · per cycle', desc: 'Rankings, traffic trends, and campaign metrics compared to your pre-engagement baseline.' },
    ],
    process: [
      { phase: 'Phase 1', title: 'Baseline audit', days: 'Days 1–3', desc: 'Full technical crawl, backlink profile, Core Web Vitals scoring, and keyword position baseline before any work begins.' },
      { phase: 'Phase 2', title: 'Strategy', days: 'Days 3–5', desc: 'Audit findings reviewed. Roadmap drafted. Priorities confirmed with you before execution starts.' },
      { phase: 'Phase 3', title: 'Execution', days: 'Days 5–N', desc: 'On-page fixes, content briefs, link outreach — delivered in batches to your portal with progress notes.' },
      { phase: 'Phase 4', title: 'Reporting', days: 'Final day', desc: 'Progress report vs. baseline metrics. Next-period recommendations included before engagement closes.' },
    ],
  },
  branding: {
    deliverables: [
      { file: 'Logo — all variants', format: 'SVG, PNG, PDF', desc: 'Primary, secondary, icon-only, and wordmark. Light and dark versions. Print and digital formats.' },
      { file: 'Brand guidelines document', format: 'PDF · 30–50 pages', desc: 'Colour values (HEX, RGB, CMYK, Pantone), typography pairing rules, logo usage, examples, and don\'ts.' },
      { file: 'Colour palette file', format: 'ASE swatch', desc: 'Adobe, Sketch, and Figma-compatible swatches. Import directly into any design tool.' },
      { file: 'Typography specimen + font files', format: 'PDF + OTF/TTF', desc: 'Licensed font files with a specimen showing heading, body, and caption hierarchy.' },
      { file: 'Social media templates', format: 'Figma', desc: 'Sized and branded for Instagram, LinkedIn, and Twitter. Editable by your team.' },
    ],
    process: [
      { phase: 'Phase 1', title: 'Discovery & mood board', days: 'Days 1–2', desc: 'Brand brief, competitor reference, and mood board submitted for your approval before any design begins.' },
      { phase: 'Phase 2', title: 'Logo concepts', days: 'Days 2–6', desc: '3 distinct logo directions presented. You choose one direction or combine elements from multiple concepts.' },
      { phase: 'Phase 3', title: 'System development', days: 'Days 6–9', desc: 'Chosen concept built into a full brand system — colour, typography, and supporting assets refined based on feedback.' },
      { phase: 'Phase 4', title: 'Final files & guidelines', days: 'Days 9–14', desc: 'All files exported in every format. Brand guidelines document compiled and deposited to your portal.' },
    ],
  },
  ai_analytics: {
    deliverables: [
      { file: 'Analytics audit report', format: 'PDF · 10–15 pages', desc: 'Current tracking accuracy, data gaps, goal completion issues, attribution problems, and a remediation plan.' },
      { file: 'GA4 / platform configuration', format: 'Live setup', desc: 'Cleaned, configured, and verified tracking across all key conversion points. Tested end-to-end before handoff.' },
      { file: 'Custom reporting dashboard', format: 'Looker Studio', desc: 'Branded, shareable dashboard updating in real time from your connected data sources.' },
      { file: 'Monthly analytics report', format: 'PDF · per cycle', desc: 'Revenue, traffic, ad performance, SEO, and AI-generated recommendations. Delivered on your chosen date each month.' },
      { file: 'Anomaly alert system', format: 'Email / Slack', desc: 'Automated alerts when key metrics deviate unexpectedly. Thresholds set with you during setup.' },
    ],
    process: [
      { phase: 'Phase 1', title: 'Data quality audit', days: 'Days 1–2', desc: 'Tracking gap analysis, duplicate event detection, attribution mismatch identification, and baseline capture.' },
      { phase: 'Phase 2', title: 'Configuration', days: 'Days 2–4', desc: 'GA4 cleanup, goal tracking, dashboard build, and platform connections (Ads, Meta, Shopify).' },
      { phase: 'Phase 3', title: 'Validation', days: 'Days 4–5', desc: 'End-to-end testing of all tracked events. Every conversion path verified before reporting begins.' },
      { phase: 'Phase 4', title: 'First report + cadence', days: 'Day 5+', desc: 'Initial report delivered to your portal. Monthly cadence begins on your agreed delivery date.' },
    ],
  },
  ecommerce: {
    deliverables: [
      { file: 'Conversion audit report', format: 'PDF · 10–15 pages', desc: 'Heatmap analysis, funnel drop-off breakdown, checkout friction points, and trust signal gaps.' },
      { file: 'CRO experiment roadmap', format: 'Notion', desc: 'Prioritised test ideas with hypothesis, expected revenue lift, and minimum test duration.' },
      { file: 'A/B test results', format: 'PDF · per test', desc: 'Statistical significance report, variant screenshots, winner recommendation, and implementation notes.' },
      { file: 'Implemented changes', format: 'Live on your store', desc: 'All agreed changes deployed and smoke-tested across mobile and desktop before handoff.' },
      { file: 'Revenue impact summary', format: 'PDF', desc: 'Before/after metrics comparing conversion rate, revenue, and AOV over a consistent comparable period.' },
    ],
    process: [
      { phase: 'Phase 1', title: 'Baseline audit', days: 'Days 1–3', desc: 'Heatmaps, session recordings, funnel analysis, checkout review, and benchmark KPI capture.' },
      { phase: 'Phase 2', title: 'Hypothesis & roadmap', days: 'Days 3–5', desc: 'Experiment backlog agreed. Top 3 opportunities prioritised by expected revenue impact, not gut feel.' },
      { phase: 'Phase 3', title: 'Testing', days: 'Days 5–N', desc: 'A/B tests running with a minimum 7-day window for statistical significance. Results reported as they complete.' },
      { phase: 'Phase 4', title: 'Implementation & iteration', days: 'Ongoing', desc: 'Winners deployed. Losers documented with learnings. Next experiment round begins without restart.' },
    ],
  },
  consulting: {
    deliverables: [
      { file: 'Strategy document', format: 'PDF · 15–25 pages', desc: 'Situation analysis, strategic options, recommended approach, and 90-day action plan.' },
      { file: 'Call recording + transcript', format: 'MP4 / PDF', desc: 'Full recording of all sessions with timestamped transcript and highlighted key decisions.' },
      { file: 'Action items tracker', format: 'Notion', desc: 'Every recommendation turned into an assignable task with owner, deadline, and success criteria.' },
      { file: 'Resource package', format: 'PDF + templates', desc: 'Supporting frameworks, templates, and reference materials relevant to your situation.' },
    ],
    process: [
      { phase: 'Phase 1', title: 'Brief & context', days: 'Before session', desc: 'Pre-call questionnaire completed. We review your situation, goals, and current state before we meet.' },
      { phase: 'Phase 2', title: 'Strategy session', days: 'Session day', desc: 'Deep-dive working session with recorded output. No pitch, no upsell — just direct strategic input.' },
      { phase: 'Phase 3', title: 'Documentation', days: '24–48h after', desc: 'Full strategy document, transcript, and action items compiled and deposited to your portal.' },
      { phase: 'Phase 4', title: 'Follow-up', days: '7 days later', desc: 'Optional 30-minute check-in to answer questions that came up implementing the recommendations.' },
    ],
  },
  _default: {
    deliverables: [
      { file: 'Primary deliverable', format: 'PDF / file', desc: 'The main output of the service, specific to your brief and agreed scope.' },
      { file: 'Supporting documentation', format: 'PDF', desc: 'Process notes, decisions made, and rationale behind key choices.' },
      { file: 'Source files', format: 'Varies', desc: 'All working files handed over at delivery. You own everything.' },
      { file: 'Handoff guide', format: 'PDF', desc: 'How to use, maintain, or extend the deliverable going forward.' },
    ],
    process: [
      { phase: 'Phase 1', title: 'Scope agreement', days: 'Days 1–2', desc: 'Requirements confirmed, expert matched, and kickoff scheduled before any work begins.' },
      { phase: 'Phase 2', title: 'Execution', days: 'Days 2–N', desc: 'Work delivered in stages to your portal. Progress visible from your dashboard throughout.' },
      { phase: 'Phase 3', title: 'Review & revisions', days: 'Day N–N+3', desc: 'You review the draft, submit feedback in the portal, and the expert refines based on your notes.' },
      { phase: 'Phase 4', title: 'Final delivery', days: 'Final day', desc: 'Approved files deposited to your portal. Download any time — no expiry.' },
    ],
  },
}

// ─── API ───────────────────────────────────────────────────────────────────────

async function fetchService(slug: string): Promise<ServiceDetail | null> {
  try {
    const res = await fetch(`${API}/services/${slug}`, { next: { revalidate: 3600 } })
    if (res.status === 404) return null
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const service = await fetchService(slug)
  if (!service) return { title: 'Service Not Found' }
  return {
    title: `${service.title} — DeEmpireTech`,
    description: service.tagline,
    openGraph: { title: service.title, description: service.tagline },
  }
}

const CATEGORY_SLUGS = new Set(['development', 'marketing', 'branding', 'ai-analytics', 'ecommerce', 'consulting', 'publishing', 'technical', 'premium'])

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (CATEGORY_SLUGS.has(slug)) {
    const anchor = slug === 'ai-analytics' ? 'ai_analytics' : slug
    redirect(`/services#${anchor}`)
  }

  const service = await fetchService(slug)
  if (!service) notFound()

  const sortedPackages = [...service.packages].sort((a, b) => a.sortOrder - b.sortOrder)
  const midPackage = sortedPackages[Math.floor(sortedPackages.length / 2)]
  const extra = CATEGORY_EXTRA[service.category] ?? CATEGORY_EXTRA._default

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 pt-8 pb-14 md:pb-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-muted mb-8">
            <Link href="/services" className="hover:text-brand transition-colors">Services</Link>
            <span>/</span>
            <span className="text-ink font-medium">{service.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
            <div className="lg:col-span-3">
              <h1 className="font-display text-[clamp(1.75rem,3.5vw,3.25rem)] font-bold tracking-tight text-ink leading-[1.05] mb-4">
                {service.title}
              </h1>
              <p className="text-lg text-brand font-medium mb-5">{service.tagline}</p>
              <p className="text-base text-muted leading-relaxed mb-8">{service.description}</p>

              <div className="flex flex-wrap gap-4">
                {[
                  { icon: ShieldCheckIcon, text: 'Secure payment' },
                  { icon: ZapIcon, text: 'Expert assigned within 48h' },
                  { icon: CalendarIcon, text: 'Tracked in your portal' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-muted">
                    <Icon className="h-4 w-4 text-brand" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {midPackage && (
              <div className="lg:col-span-2">
                <div className="bg-surface border border-border rounded-xl p-6">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1">Most Popular</p>
                  <p className="text-xl font-bold text-ink mb-0.5">
                    ${(midPackage.priceCents / 100).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted mb-4">
                    {midPackage.name} package · {midPackage.deliveryDays}-day delivery
                  </p>
                  <ul className="space-y-2 mb-5">
                    {midPackage.includes.slice(0, 4).map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-ink/80">
                        <CheckIcon className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                    {midPackage.includes.length > 4 && (
                      <li className="text-xs text-muted pl-6">+{midPackage.includes.length - 4} more included</li>
                    )}
                  </ul>
                  <OrderButton packageId={midPackage.id} packageName={midPackage.name} priceCents={midPackage.priceCents} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Packages ───────────────────────────────────────────────────── */}
      <section id="packages" className="bg-surface border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-14 md:py-20 max-w-7xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-10">Choose a package</h2>
          <div className={`grid grid-cols-1 gap-5 ${sortedPackages.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {sortedPackages.map((pkg, i) => {
              const isRecommended = i === Math.floor(sortedPackages.length / 2)
              return (
                <div
                  key={pkg.id}
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
                    <p className="text-lg font-bold text-ink mb-0.5">{pkg.name}</p>
                    <p className="text-sm text-muted">{pkg.description}</p>
                  </div>

                  <div className="mb-5">
                    <p className="text-3xl font-bold text-ink">
                      ${(pkg.priceCents / 100).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted mt-0.5">One-time payment</p>
                  </div>

                  <div className="flex gap-4 text-xs text-muted mb-5 pb-5 border-b border-border">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {pkg.deliveryDays}-day delivery
                    </span>
                    <span>{pkg.revisions} revision{pkg.revisions !== 1 ? 's' : ''}</span>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    {pkg.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-ink/80">
                        <CheckIcon className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <OrderButton
                    packageId={pkg.id}
                    packageName={pkg.name}
                    priceCents={pkg.priceCents}
                    primary={isRecommended}
                  />
                </div>
              )
            })}
          </div>

          <p className="text-xs text-muted text-center mt-8">
            Payment is processed securely. You&apos;ll submit requirements after checkout.{' '}
            <Link href="/contact" className="text-brand hover:underline">Questions? Get in touch.</Link>
          </p>
        </div>
      </section>

      {/* ── What you receive ───────────────────────────────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-14 md:py-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 lg:gap-20">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-ink mb-4">What you receive</h2>
              <p className="text-sm text-muted leading-relaxed mb-5">
                Every deliverable is uploaded to your portal workspace. You download final files directly — no email attachments, no expiring Drive links. Files are retained for 12 months after delivery.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted">
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckIcon className="h-2.5 w-2.5 text-emerald-600" />
                </div>
                You own all files outright on delivery
              </div>
            </div>

            <div className="space-y-3">
              {extra.deliverables.map(({ file, format, desc }) => (
                <div key={file} className="flex items-start gap-4 p-4 bg-surface border border-border rounded-xl">
                  <div className="w-12 h-10 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-muted text-center leading-tight px-1">{format.split(' ')[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{file}</p>
                    <p className="text-[10px] font-medium text-muted uppercase tracking-wider mt-0.5 mb-1">{format}</p>
                    <p className="text-xs text-muted leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── The process ────────────────────────────────────────────────── */}
      <section className="bg-surface border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-14 md:py-20 max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-6 mb-10">
            <h2 className="font-display text-xl md:text-2xl font-bold text-ink">The process</h2>
            <p className="text-xs text-muted hidden md:block">Every engagement, every time — no exceptions.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {extra.process.map(({ phase, title, days, desc }, i) => (
              <div key={phase} className="relative bg-white border border-border rounded-xl p-5">
                {i < extra.process.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(100%)] w-4 h-px bg-border" style={{ width: 'calc(100% - 100% + 16px)' }} />
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-brand uppercase tracking-widest">{phase}</span>
                  <span className="text-[10px] text-muted font-mono">{days}</span>
                </div>
                <h3 className="text-sm font-semibold text-ink mb-2 leading-snug">{title}</h3>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
                <div className="absolute bottom-5 right-5 w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center">
                  <span className="text-[10px] font-bold text-muted">{i + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample deliverable ─────────────────────────────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-14 md:py-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-4">Sample Output</p>
              <h2 className="font-display text-xl md:text-2xl font-bold text-ink mb-4">What a deliverable looks like.</h2>
              <p className="text-sm text-muted leading-relaxed mb-5">
                This is an example of the type of output you&apos;ll receive for this service. Actual depth, length, and format will be tailored to your project requirements.
              </p>
              <p className="text-xs text-muted leading-relaxed">
                All final files are deposited to your client portal on the last day of your engagement. You can download them indefinitely — we retain client files for 12 months post-delivery.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  'Delivered to your portal workspace',
                  'Not sent via email — no inbox clutter',
                  'Versioned — all drafts retained',
                  'Downloaded with one click, any time',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-muted">
                    <div className="w-3.5 h-3.5 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                      <CheckIcon className="h-2 w-2 text-brand" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <SampleDeliverablePreview category={service.category} />
          </div>
        </div>
      </section>

      {/* ── Requirements ───────────────────────────────────────────────── */}
      {service.requirements.length > 0 && (
        <section className="bg-surface border-b border-border">
          <div className="px-5 md:px-10 lg:px-16 py-14 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-ink mb-3">What we&apos;ll need from you</h2>
                <p className="text-sm text-muted leading-relaxed">
                  After placing your order you&apos;ll complete a short requirements form in your portal. The more context you provide, the faster we assign the right expert and begin work.
                </p>
              </div>
              <ul className="space-y-3">
                {service.requirements.map((req) => (
                  <li key={req.id} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-dim flex items-center justify-center shrink-0 mt-0.5">
                      <CheckIcon className="h-3 w-3 text-brand" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {req.label}
                        {!req.required && <span className="ml-1.5 text-[10px] text-muted font-normal">(optional)</span>}
                      </p>
                      {req.description && <p className="text-xs text-muted mt-0.5">{req.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ── After delivery ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="px-5 md:px-10 lg:px-16 py-14 max-w-7xl mx-auto">
          <h2 className="font-display text-xl md:text-2xl font-bold text-ink mb-8">After delivery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: 'Revision window',
                body: 'Revision rounds are included in your package. Submit feedback via threaded comments in your portal. Turnaround is typically 24–48 hours per round.',
              },
              {
                title: 'File access',
                body: 'All deliverables stay in your portal workspace for 12 months. Download any time. No expiring links.',
              },
              {
                title: 'Support window',
                body: 'We include 5 business days of post-delivery support. Have a question about the work? Ask via portal message — we respond within 24 hours.',
              },
              {
                title: 'What you own',
                body: 'Full ownership of all deliverables transfers to you on final payment. No usage restrictions, no licensing fees. The work is yours.',
              },
            ].map(({ title, body }) => (
              <div key={title} className="p-5 bg-surface border border-border rounded-xl">
                <p className="text-sm font-semibold text-ink mb-2">{title}</p>
                <p className="text-xs text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs ───────────────────────────────────────────────────────── */}
      {service.faqs.length > 0 && (
        <section className="bg-surface border-b border-border">
          <div className="px-5 md:px-10 lg:px-16 py-14 max-w-7xl mx-auto">
            <h2 className="font-display text-xl md:text-2xl font-bold text-ink mb-8">Frequently asked questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {service.faqs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-xl border border-border p-6">
                  <p className="text-sm font-semibold text-ink mb-2">{faq.question}</p>
                  <p className="text-sm text-muted leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="px-5 md:px-10 lg:px-16 py-14 md:py-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display text-xl md:text-2xl font-bold text-ink mb-3">Ready to get started?</h3>
              <p className="text-sm text-muted leading-relaxed">
                Choose a package above, place your order, and we&apos;ll have an expert assigned within 48 hours. You&apos;ll get access to your portal workspace the same day.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                href="#packages"
                className="inline-flex items-center gap-2 bg-ink text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#1a1a1a] transition-colors duration-150"
              >
                Choose a Package <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 border border-border text-ink text-sm font-medium px-6 py-3 rounded-lg hover:bg-surface transition-colors duration-150"
              >
                Book a call first
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// ─── Sample deliverable preview — coded mockups per category ──────────────────

function SampleDeliverablePreview({ category }: { category: string }) {
  if (category === 'marketing' || category === 'technical') {
    return (
      <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="bg-ink px-5 py-4">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1">Technical SEO Audit</p>
          <p className="text-sm font-bold text-white">Sample Client · example.com</p>
          <p className="text-[10px] text-white/40 mt-1">847 pages crawled · Screaming Frog + manual review</p>
        </div>

        <div className="grid grid-cols-3 border-b border-border">
          {[
            { count: '12', label: 'Critical', color: 'text-rose-600' },
            { count: '28', label: 'Warnings', color: 'text-amber-600' },
            { count: '63%', label: 'Health score', color: 'text-emerald-600' },
          ].map(({ count, label, color }) => (
            <div key={label} className="p-4 text-center border-r border-border last:border-0">
              <p className={`text-xl font-bold ${color}`}>{count}</p>
              <p className="text-[10px] text-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="p-5 space-y-2">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">Priority Issues</p>
          {[
            { issue: 'Missing meta descriptions', count: '47 pages', severity: 'critical' as const },
            { issue: 'Page load &gt; 3.5s (Core Web Vitals)', count: '23 pages', severity: 'critical' as const },
            { issue: 'Duplicate H1 tags', count: '8 instances', severity: 'critical' as const },
            { issue: 'LCP 4.1s — target: 2.5s', count: 'homepage', severity: 'warning' as const },
            { issue: 'Schema markup missing', count: 'product pages', severity: 'warning' as const },
          ].map(({ issue, count, severity }) => (
            <div key={issue} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                <span className="text-xs text-ink" dangerouslySetInnerHTML={{ __html: issue }} />
              </div>
              <span className="text-[10px] text-muted font-mono shrink-0 ml-4">{count}</span>
            </div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <div className="bg-brand-dim border border-brand/20 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-brand mb-1">Top recommendation</p>
            <p className="text-xs text-ink/70 leading-relaxed">Fix missing meta descriptions on category pages first — estimated +8% CTR improvement in 6–8 weeks based on comparable site data.</p>
          </div>
        </div>
      </div>
    )
  }

  if (category === 'ai_analytics') {
    return (
      <div className="bg-ink rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <span className="text-[10px] text-white/30 font-mono">Analytics Report — May 2025</span>
          <span className="text-[10px] text-white/20">PDF · 14 pages</span>
        </div>

        <div className="p-5">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Key Metrics vs. Last Month</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: 'Revenue MTD', value: '$84,320', change: '+23%', up: true },
              { label: 'Conv. Rate', value: '3.7%', change: '+1.2pp', up: true },
              { label: 'Sessions', value: '12,840', change: '+31%', up: true },
              { label: 'ROAS (Meta)', value: '4.2×', change: '+0.8×', up: true },
            ].map(({ label, value, change, up }) => (
              <div key={label} className="bg-white/[0.06] rounded-lg p-3">
                <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1.5">{label}</p>
                <p className="text-lg font-bold text-white leading-none mb-1">{value}</p>
                <p className={`text-[10px] font-semibold ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {up ? '↑' : '↓'} {change} vs. April
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-3">
            <p className="text-[9px] font-semibold text-white/30 uppercase tracking-wider mb-2">AI Insight</p>
            <p className="text-[11px] text-white/60 leading-relaxed">
              Meta ad spend efficiency dropped 12% in week 3. Recommend pausing top-funnel audiences and reallocating budget to retargeting — estimated +0.4× ROAS based on historical cohort data.
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <p className="text-[9px] text-white/20 uppercase tracking-widest w-full mb-1">Connected platforms</p>
            {['GA4', 'Google Ads', 'Meta Ads', 'Shopify'].map((p) => (
              <span key={p} className="text-[9px] text-white/40 bg-white/[0.06] px-2 py-0.5 rounded border border-white/10">{p}</span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (category === 'branding') {
    return (
      <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="px-5 py-4 border-b border-border bg-surface flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted uppercase tracking-widest mb-0.5">Brand Guidelines</p>
            <p className="text-sm font-bold text-ink">Sample Brand · v1.0</p>
          </div>
          <span className="text-[10px] text-muted">34 pages</span>
        </div>

        <div className="p-5 border-b border-border">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">Colour System</p>
          <div className="flex gap-2">
            {[
              { name: 'Ink', hex: '#0a0a0a', light: false },
              { name: 'Brand', hex: '#1e3a8a', light: false },
              { name: 'Muted', hex: '#6b7280', light: false },
              { name: 'Surface', hex: '#f8f8f8', light: true },
              { name: 'Accent', hex: '#f59e0b', light: false },
            ].map(({ name, hex, light }) => (
              <div key={name} className="flex-1 min-w-0">
                <div
                  className={`h-10 rounded-md mb-1.5 ${light ? 'border border-border' : ''}`}
                  style={{ backgroundColor: hex }}
                />
                <p className="text-[9px] font-semibold text-ink truncate">{name}</p>
                <p className="text-[9px] text-muted font-mono">{hex}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 border-b border-border">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">Typography</p>
          <div className="space-y-2">
            <div>
              <p className="text-2xl font-bold text-ink leading-tight">Display Heading</p>
              <p className="text-[9px] text-muted">Display · Bold · 48px / 52px</p>
            </div>
            <div>
              <p className="text-sm text-ink">Body copy at 16px regular weight.</p>
              <p className="text-[9px] text-muted">Body · Regular · 16px / 26px</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted font-semibold">CAPTION — 11PX SEMIBOLD</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">Files included</p>
          <div className="flex flex-wrap gap-1.5">
            {['Logo.SVG', 'Logo.PNG', 'Logo-dark.SVG', 'Guidelines.PDF', 'Swatches.ASE', 'Social Kit.FIG'].map((f) => (
              <span key={f} className="text-[10px] font-mono text-ink/60 bg-surface border border-border px-2 py-0.5 rounded">{f}</span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // development / ecommerce / default
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="px-5 py-4 border-b border-border bg-surface flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted uppercase tracking-widest mb-0.5">Project Specification</p>
          <p className="text-sm font-bold text-ink">Sample Client · Shopify Build</p>
        </div>
        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          Approved
        </span>
      </div>

      <div className="p-5 border-b border-border">
        <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">Agreed Deliverables</p>
        <div className="space-y-1.5">
          {[
            { item: 'Homepage — custom layout + mobile', status: 'Done' },
            { item: 'Product page — trust signals + upsell', status: 'Done' },
            { item: 'Collection page — filter & sort', status: 'Done' },
            { item: 'Optimised checkout flow', status: 'Done' },
            { item: 'Post-purchase thank-you page', status: 'In review' },
            { item: 'About page', status: 'Pending' },
          ].map(({ item, status }) => (
            <div key={item} className="flex items-center gap-3 py-1.5 border-b border-border/40 last:border-0">
              <div className={`w-2 h-2 rounded-full shrink-0 ${status === 'Done' ? 'bg-emerald-500' : status === 'In review' ? 'bg-amber-500' : 'bg-border'}`} />
              <span className="flex-1 text-xs text-ink">{item}</span>
              <span className={`text-[10px] font-medium shrink-0 ${status === 'Done' ? 'text-emerald-600' : status === 'In review' ? 'text-amber-600' : 'text-muted'}`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5">
        <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">Technical Stack</p>
        <div className="flex flex-wrap gap-1.5">
          {['Shopify 2.0', 'Liquid', 'Tailwind CSS', 'JavaScript', 'GA4', 'Klaviyo'].map((t) => (
            <span key={t} className="text-[10px] font-medium text-ink/60 bg-surface border border-border px-2 py-0.5 rounded">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
