import { notFound } from 'next/navigation'
import BookingFlow from './BookingFlow'

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
  minNoticeHours: number
  maxAdvanceDays: number
}

async function fetchService(slug: string): Promise<BookingService | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking-services/${slug}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const svc = await fetchService(slug)
  if (!svc) return { title: 'Book a Session' }
  return {
    title: `Book: ${svc.title}`,
    description: svc.tagline,
  }
}

export default async function BookServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const svc = await fetchService(slug)
  if (!svc) notFound()

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

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">

        {/* Back */}
        <a href="/book" className="text-xs text-muted hover:text-brand transition-colors mb-8 inline-block">
          ← All sessions
        </a>

        <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-10">

          {/* Left — service info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: svc.color }} />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">{svc.category.replace('_', ' ')}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight leading-tight mb-3">
              {svc.title}
            </h1>
            <p className="text-sm text-muted leading-relaxed mb-6">{svc.description}</p>

            <div className="border border-border rounded-xl p-4 space-y-3">
              {[
                ['Duration', fmtDuration(svc.durationMinutes)],
                ['Price', fmtPrice(svc.priceCents, svc.currency)],
                ['Platform', svc.meetingPlatform],
                ['Notice required', `${svc.minNoticeHours}h`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-muted">{label}</span>
                  <span className="font-medium text-ink">{value}</span>
                </div>
              ))}
            </div>

            {svc.priceCents > 0 && (
              <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800">
                Payment instructions will be sent after booking. Your slot is reserved for 24 hours pending payment confirmation.
              </div>
            )}
          </div>

          {/* Right — slot picker (client component) */}
          <BookingFlow service={svc} />

        </div>
      </div>
    </main>
  )
}
