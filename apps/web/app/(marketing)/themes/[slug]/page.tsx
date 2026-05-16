import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { THEMES } from '@/lib/content/themes'
import { ArrowRightIcon } from '@/components/ui/Icons'
import { ThemeMockup } from '@/components/marketing/ThemeMockup'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return THEMES.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const theme = THEMES.find((t) => t.slug === slug)
  if (!theme) return {}
  return {
    title: `${theme.name} — Shopify Theme`,
    description: theme.description,
    openGraph: {
      title: `${theme.name} — E-Tech. Shopify Themes`,
      description: theme.description,
    },
  }
}

export default async function ThemeDetailPage({ params }: Props) {
  const { slug } = await params
  const theme = THEMES.find((t) => t.slug === slug)
  if (!theme) notFound()

  const related = THEMES.filter((t) => t.slug !== slug).slice(0, 2)

  return (
    <div className="px-5 md:px-12 lg:px-20 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="pt-8 md:pt-10 pb-0">
        <Link
          href="/themes"
          className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] hover:text-ink transition-[color] duration-150 inline-flex items-center gap-1.5"
        >
          ← Themes
        </Link>
      </div>

      {/* Header */}
      <div className="pt-8 pb-10 md:pt-10 md:pb-14 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 border-b border-border">
        <div className="md:col-span-7">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {theme.industries.map((ind) => (
              <span
                key={ind}
                className="text-[10px] font-medium text-muted/60 uppercase tracking-wider bg-surface border border-border px-2 py-0.5 rounded"
              >
                {ind}
              </span>
            ))}
          </div>
          <h1 className="font-display text-[clamp(2.25rem,4.5vw,4rem)] font-normal tracking-tight text-ink leading-tight mb-4">
            {theme.name}
          </h1>
          <p className="text-base text-muted leading-relaxed max-w-lg">{theme.description}</p>
        </div>
        <div className="md:col-span-5 md:col-start-8 flex flex-col justify-end gap-5">
          <div className="flex flex-wrap gap-1.5">
            {theme.highlights.map((h) => (
              <span
                key={h}
                className="text-[11px] text-muted/70 bg-surface border border-border px-2.5 py-1 rounded"
              >
                {h}
              </span>
            ))}
          </div>
          <div className="flex items-end justify-between pt-5 border-t border-border">
            <div>
              <p className="text-[10px] font-medium text-muted/50 uppercase tracking-wider mb-0.5">
                Starting from
              </p>
              <p className="text-2xl font-semibold text-ink tracking-tight">
                {theme.price === 'custom' ? 'Custom pricing' : `$${theme.price}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="text-xs text-muted hover:text-ink transition-[color] duration-150 underline underline-offset-2"
              >
                Request demo
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 bg-ink text-white text-xs font-medium px-4 py-2 rounded-md hover:bg-[#222] transition-[background-color] duration-150"
              >
                Get this theme
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Preview mockup */}
      <div className="py-12 md:py-16">
        <div className={`w-full aspect-[16/7] rounded-xl ${theme.bg} relative overflow-hidden`}>
          <ThemeMockup theme={theme} />
        </div>
        <p className="text-[11px] text-muted/50 mt-3 text-center">
          Wireframe representation — live preview on a development store available on request
        </p>
      </div>

      {/* Features */}
      <div className="py-12 md:py-16 border-t border-border">
        <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-10 md:mb-12">
          What's included
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
          {theme.features.map((section) => (
            <div key={section.category} className="bg-white p-6 md:p-8">
              <p className="text-[11px] font-medium text-muted uppercase tracking-[0.15em] mb-5">
                {section.category}
              </p>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                    <span className="h-px w-3 bg-muted/25 shrink-0 mt-[0.6em]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Licensing */}
      {theme.licenses && (
        <div className="py-12 md:py-16 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-3">
                Licensing
              </p>
              <p className="text-sm text-muted leading-relaxed">
                All licenses include lifetime access to the version purchased, full source code, and
                the delivery package below. Updates and new features are available as separate purchases.
              </p>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                {theme.licenses.map((lic, i) => (
                  <div key={lic.type} className={`flex items-center justify-between px-5 py-4 gap-4 ${i === 0 ? 'bg-[#fafafa]' : 'bg-white'}`}>
                    <div>
                      <p className="text-sm font-semibold text-ink tracking-tight">{lic.type}</p>
                      <p className="text-[11px] text-muted mt-0.5">{lic.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-base font-semibold text-ink">
                        {lic.price === 'custom' ? 'On request' : `$${lic.price}`}
                      </p>
                      {lic.price !== 'custom' && (
                        <p className="text-[10px] text-muted/50">one-time</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compatibility + delivery */}
      <div className="py-12 md:py-14 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-5">
            Platform compatibility
          </p>
          <ul className="space-y-2.5">
            {[
              'Shopify Online Store 2.0',
              'Dawn architecture',
              'Shopify Markets (multi-currency)',
              'Shopify Payments',
              'Metafields & Metaobjects',
              'Theme Editor — all sections customisable',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                <span className="h-px w-3 bg-muted/25 shrink-0 mt-[0.6em]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        {theme.deliveryNotes && (
          <div>
            <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-5">
              What you receive
            </p>
            <ul className="space-y-2.5">
              {theme.deliveryNotes.map((note) => (
                <li key={note} className="flex items-start gap-2.5 text-sm text-ink">
                  <span className="h-px w-3 bg-muted/25 shrink-0 mt-[0.6em]" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Demo store note */}
      {theme.demoStoreNote && (
        <div className="py-8 md:py-10 border-t border-border">
          <div className="bg-surface border border-border rounded-xl px-6 py-5 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8">
            <div className="flex-1">
              <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1.5">
                Development store demo
              </p>
              <p className="text-sm text-ink/80 leading-relaxed">{theme.demoStoreNote}</p>
            </div>
            <Link
              href={`/contact?theme=${theme.slug}&intent=demo`}
              className="shrink-0 inline-flex items-center gap-2 bg-ink text-white text-xs font-medium px-4 py-2 rounded-md hover:bg-[#222] transition-[background-color] duration-150"
            >
              Request demo store
            </Link>
          </div>
        </div>
      )}

      {/* How to purchase */}
      <div className="py-12 md:py-16 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-3">
              Purchase process
            </p>
            <p className="text-sm text-muted leading-relaxed">
              No checkout flow. We handle theme sales directly — it keeps things
              clean and gives us a chance to confirm the theme is the right fit.
            </p>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <ol className="space-y-4">
              {[
                { step: '01', text: 'Send us a message — tell us which license and your store URL' },
                { step: '02', text: 'We confirm the theme fits your category and answer any questions' },
                { step: '03', text: 'Invoice sent — bank transfer or card, paid on receipt' },
                { step: '04', text: 'Theme delivered within 1 business day of payment' },
                { step: '05', text: 'Onboarding call booked — 60 minutes to walk through setup' },
              ].map(({ step, text }) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="text-[11px] font-medium text-muted/40 tabular-nums w-5 shrink-0 mt-[0.15em]">
                    {step}
                  </span>
                  <p className="text-sm text-ink/80 leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8 pt-6 border-t border-border flex items-center gap-3">
              <Link
                href={`/contact?theme=${theme.slug}&intent=purchase`}
                className="inline-flex items-center gap-2 bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-[#222] transition-[background-color] duration-150"
              >
                Purchase {theme.name}
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={`/contact?theme=${theme.slug}&intent=demo`}
                className="text-sm text-muted hover:text-ink transition-[color] duration-150"
              >
                Request demo first
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Other themes */}
      {related.length > 0 && (
        <div className="py-12 md:py-16 border-t border-border">
          <div className="flex items-center justify-between mb-8">
            <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em]">
              Other themes
            </p>
            <Link
              href="/themes"
              className="text-xs text-muted hover:text-ink transition-[color] duration-150 flex items-center gap-1.5"
            >
              All themes
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden">
            {related.map((t) => (
              <Link
                key={t.slug}
                href={`/themes/${t.slug}`}
                className="group bg-white p-6 md:p-7 flex flex-col hover:bg-[#fafafa] transition-[background-color] duration-200"
              >
                <div className={`w-full aspect-[16/7] rounded-lg mb-5 relative overflow-hidden ${t.bg}`}>
                  <ThemeMockup theme={t} />
                </div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {t.industries.slice(0, 2).map((ind) => (
                    <span key={ind} className="text-[10px] font-medium text-muted/60 uppercase tracking-wider">
                      {ind}
                    </span>
                  ))}
                </div>
                <h4 className="text-base font-semibold text-ink tracking-tight mb-1">{t.name}</h4>
                <p className="text-sm text-muted leading-snug">{t.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
