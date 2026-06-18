import type { Metadata } from 'next'
import Link from 'next/link'
import { THEMES } from '@/lib/content/themes'
import { ContactForm, type InquiryType } from '@/components/forms/ContactForm'
import type { CmsTheme } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type ThemeContext = { slug: string; name: string; tagline?: string | null; priceCents?: number | null }

async function findThemeBySlug(slug: string): Promise<ThemeContext | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/cms/themes/published`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const items: CmsTheme[] = await res.json()
      const found = items.find((t) => t.slug === slug)
      if (found) return { slug: found.slug, name: found.name, tagline: found.tagline, priceCents: found.priceCents }
    }
  } catch {}
  // Fall back to static content file
  const staticTheme = THEMES.find((t) => t.slug === slug)
  if (staticTheme) {
    return {
      slug: staticTheme.slug,
      name: staticTheme.name,
      tagline: staticTheme.tagline,
      priceCents: typeof staticTheme.price === 'number' ? staticTheme.price * 100 : null,
    }
  }
  return null
}

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Tell us about your project. We take on a small number of engagements each year — if it sounds like a fit, we want to hear about it.',
  openGraph: {
    title: 'Contact — E-Tech.',
    description: 'Tell us about your project. We take on a small number of engagements each year.',
  },
}

const DETAILS = [
  { label: 'Response time', value: 'Within 24 hours' },
  { label: 'Availability', value: 'Currently accepting projects' },
  { label: 'Minimum engagement', value: '$10,000' },
]

type Props = {
  searchParams: Promise<{ theme?: string; intent?: string }>
}

export default async function ContactPage({ searchParams }: Props) {
  const { theme: themeSlug, intent } = await searchParams

  const theme = themeSlug ? await findThemeBySlug(themeSlug) : null

  const inquiryType: InquiryType =
    theme && intent === 'purchase'
      ? 'theme-purchase'
      : theme && intent === 'demo'
      ? 'theme-demo'
      : 'project'

  const initialMessage =
    inquiryType === 'theme-purchase' && theme
      ? `I'm interested in the ${theme.name} theme. My Shopify store is at [url] and I'm looking at the [license] license.`
      : inquiryType === 'theme-demo' && theme
      ? `I'd like to see the ${theme.name} theme on a development store. We sell [category] and are currently using [current theme].`
      : ''

  return (
    <div className="px-5 md:px-12 lg:px-20 max-w-7xl mx-auto">
      <div className="pt-12 pb-10 md:pt-20 md:pb-16">
        <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-4 md:mb-5">
          Contact
        </p>
        <h1 className="font-display text-[clamp(2rem,4vw,3.75rem)] font-normal tracking-tight text-ink leading-tight max-w-xl">
          {theme && intent === 'purchase'
            ? 'Purchase enquiry.'
            : theme && intent === 'demo'
            ? 'Request a demo store.'
            : "Tell us what you're building."}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 pb-16 md:pb-24 border-t border-border pt-10 md:pt-16">
        {/* Details column */}
        <div className="md:col-span-4">
          {theme ? (
            <>
              <h2 className="text-sm font-semibold text-ink mb-4 tracking-tight">
                {intent === 'purchase' ? 'You are enquiring about' : 'Requesting a demo of'}
              </h2>
              <div className="mb-6">
                <p className="text-base font-semibold text-ink tracking-tight">{theme.name}</p>
                <p className="text-[11px] text-muted mt-0.5 leading-relaxed">{theme.tagline}</p>
                {intent === 'purchase' && (
                  <p className="text-[11px] text-muted/60 mt-2">
                    {theme.priceCents == null ? 'Custom pricing' : `From $${(theme.priceCents / 100).toFixed(0)}`}
                  </p>
                )}
                <Link
                  href={`/themes/${theme.slug}`}
                  className="inline-block mt-3 text-[11px] text-muted underline underline-offset-2 hover:text-ink transition-[color] duration-150"
                >
                  View theme details
                </Link>
              </div>
              <div className="pt-6 border-t border-border">
                <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-4">
                  What happens next
                </p>
                <ol className="space-y-3">
                  {(intent === 'purchase'
                    ? [
                        "We confirm the theme fits your category",
                        "Invoice sent — card or bank transfer",
                        "Theme delivered within 1 business day",
                        "60-minute onboarding call included",
                      ]
                    : [
                        "We set up a password-protected development store",
                        "Configured with a sample catalogue for your category",
                        "Ready within 2 business days of your request",
                      ]
                  ).map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[10px] font-medium text-muted/40 tabular-nums shrink-0 mt-[0.2em]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-[11px] text-muted leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-sm font-semibold text-ink mb-4 md:mb-5 tracking-tight">
                Who we work with
              </h2>
              <p className="text-sm text-muted leading-relaxed mb-8 md:mb-10">
                {"We're not right for every project. We take on work where the outcome genuinely matters — where the client wants a thinking partner, not just a team to execute a brief."}
              </p>

              <div className="flex flex-row md:flex-col gap-6 md:gap-6 flex-wrap">
                {DETAILS.map(({ label, value }) => (
                  <div key={label} className="min-w-[140px]">
                    <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-1">
                      {label}
                    </p>
                    <p className="text-sm text-ink">{value}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Form column */}
        <div className="md:col-span-7 md:col-start-6">
          <ContactForm
            initialInquiryType={inquiryType}
            initialTheme={theme?.slug}
            initialIntent={intent}
            initialMessage={initialMessage}
          />
        </div>
      </div>
    </div>
  )
}
