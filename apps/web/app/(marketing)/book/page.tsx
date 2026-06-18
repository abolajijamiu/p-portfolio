import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingService = {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  category: string
  durationMinutes: number
  priceCents: number
  currency: string
  color: string
  meetingPlatform: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  consultation: 'Consultation',
  strategy: 'Strategy',
  design_review: 'Design Review',
  technical: 'Technical',
  onboarding: 'Onboarding',
  other: 'Session',
}

function fmtDuration(mins: number) {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

function fmtPrice(cents: number, currency: string) {
  if (cents === 0) return 'Free'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(cents / 100)
}

async function fetchServices(): Promise<BookingService[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking-services`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Book a Strategy Call',
  description: 'Book a consultation or strategy session directly with the E-Tech OS team.',
}

export default async function BookPage() {
  const services = await fetchServices()

  return (
    <main className="min-h-screen bg-white">

      {/* Hero */}
      <section className="border-b border-border bg-white px-4 py-14 md:py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-4">Book a session</p>
        <h1 className="text-3xl md:text-5xl font-bold text-ink tracking-tight max-w-2xl mx-auto leading-[1.1]">
          Talk to the team
        </h1>
        <p className="text-base md:text-lg text-muted mt-4 max-w-xl mx-auto leading-relaxed">
          Pick a session type and choose a time that works for you. All sessions are held via video call.
        </p>
      </section>

      {/* Cards */}
      <section className="px-4 py-12 md:py-16 max-w-5xl mx-auto">
        {services.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted text-sm">No sessions available right now. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc) => (
              <Link
                key={svc.id}
                href={`/book/${svc.slug}`}
                className="group flex flex-col bg-white border border-border rounded-2xl p-6 hover:border-brand/30 hover:shadow-md transition-all duration-200"
              >
                {/* Color dot + category */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: svc.color }}
                  />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {CATEGORY_LABEL[svc.category] ?? svc.category}
                  </span>
                </div>

                <h2 className="text-base font-semibold text-ink leading-snug mb-1 group-hover:text-brand transition-colors">
                  {svc.title}
                </h2>
                <p className="text-sm text-muted leading-relaxed mb-5 flex-1">{svc.tagline}</p>

                {/* Meta row */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>{fmtDuration(svc.durationMinutes)}</span>
                    <span>·</span>
                    <span>{svc.meetingPlatform}</span>
                  </div>
                  <span className="text-sm font-semibold text-ink">{fmtPrice(svc.priceCents, svc.currency)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FAQ strip */}
      <section className="border-t border-border bg-surface px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-ink mb-8 text-center">Before you book</h2>
          <div className="space-y-6">
            {[
              ['How do I pay?', 'After booking you\'ll receive payment instructions via email. Paid sessions are confirmed once payment is received.'],
              ['What platform do you use?', 'Most sessions are held on Google Meet. You\'ll receive a link in your confirmation email.'],
              ['Can I reschedule?', 'Yes — contact us at least 24 hours before your session and we\'ll find a new time.'],
              ['What happens after the session?', 'We\'ll send a summary of what was discussed and any agreed next steps within 24 hours.'],
            ].map(([q, a]) => (
              <div key={q}>
                <p className="text-sm font-semibold text-ink mb-1">{q}</p>
                <p className="text-sm text-muted leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
