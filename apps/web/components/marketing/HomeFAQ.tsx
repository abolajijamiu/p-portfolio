'use client'

import { useState } from 'react'

const HOME_FAQS = [
  {
    q: 'How does E-Tech OS work?',
    a: 'You browse our service catalogue, choose a package, and place an order. We handle expert assignment, project management, and delivery — all tracked through your client portal. You get a dedicated workspace with a live inbox, milestone tracker, and file sharing.',
  },
  {
    q: 'How quickly can work start?',
    a: 'Most orders kick off within 24–48 hours. Once you place an order and submit your project requirements, we assign the right expert from our vetted team and send you an introduction. For complex engagements, we recommend booking a strategy call first.',
  },
  {
    q: 'What if I need revisions?',
    a: "Every service package includes a defined number of revisions. We'll revise the work until it meets the agreed brief. If you need additional rounds beyond what your package includes, we'll quote fairly and transparently.",
  },
  {
    q: 'Do I pay you or the individual experts?',
    a: 'You pay E-Tech OS directly. We handle expert compensation separately. This means a single invoice, a single point of contact, and no freelancer coordination on your end.',
  },
  {
    q: 'Can I speak with someone before ordering?',
    a: "Absolutely. Book a free 30-minute strategy call through the Bookings page and we'll help you identify the right service, package, and starting point for your goals.",
  },
  {
    q: 'How do digital resource licences work?',
    a: 'Resources (themes, templates, guides) are sold under Personal, Commercial, or Standard licences. Personal licences cover a single personal project; Commercial licences cover client work and multi-project use. See the Licenses page for full details.',
  },
  {
    q: 'Is there a minimum commitment?',
    a: "No long-term contract is required for individual service packages — each order is self-contained. For ongoing retainer arrangements, we'll agree terms upfront and document them in your portal.",
  },
  {
    q: 'What happens after an order is delivered?',
    a: 'You review the delivery in your client portal. If the work meets the brief, you mark it as accepted and the order completes. You retain full ownership of the custom deliverables produced for you.',
  },
]

export function HomeFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
      {HOME_FAQS.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-surface/50 transition-colors duration-150 group"
          >
            <span className="text-sm font-semibold text-ink leading-snug">{faq.q}</span>
            <span
              className={[
                'shrink-0 h-5 w-5 flex items-center justify-center rounded-full border transition-all duration-200',
                open === i
                  ? 'rotate-45 border-brand/30 text-brand bg-brand/5'
                  : 'border-border text-muted group-hover:border-brand/20',
              ].join(' ')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </button>
          {open === i && (
            <div className="px-6 pb-5">
              <p className="text-sm text-muted leading-relaxed">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
