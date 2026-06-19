import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Understand our refund and cancellation terms for services, resources, and bookings.',
}

const LAST_UPDATED = '19 June 2026'

export default function RefundPage() {
  return (
    <div className="px-5 md:px-10 lg:px-16 max-w-4xl mx-auto py-14 md:py-20">
      <div className="mb-10">
        <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-3">Legal</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight mb-3">Refund Policy</h1>
        <p className="text-sm text-muted">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-8">
        <Section title="1. Our Commitment">
          <p>
            We want every client to be genuinely satisfied with the work we deliver. Our refund policy is designed to
            be fair — protecting your investment while allowing our expert team to do their best work without
            uncertainty. If something goes wrong, we will always try to resolve it before considering a refund.
          </p>
        </Section>

        <Section title="2. Service Orders">
          <p>
            <strong className="text-ink">Before work commences:</strong> A full refund is available if you cancel
            your order before an expert has been assigned and work has begun. Contact us at{' '}
            <a href="mailto:hello@deempiretech.com" className="text-brand hover:underline">hello@deempiretech.com</a>{' '}
            with your order number as soon as possible.
          </p>
          <p>
            <strong className="text-ink">After work commences:</strong> Once an expert has been assigned and work
            has started, we operate a revision-first policy. Rather than refunding, we will revise the deliverable
            to meet the agreed brief — this is usually faster and more effective for both parties. The number of
            included revisions is stated in your service package.
          </p>
          <p>
            <strong className="text-ink">Exceptional circumstances:</strong> If we are unable to deliver the
            agreed scope due to our own failure after exhausting revisions, we will offer a partial or full refund
            at our discretion, proportional to the work completed. We do not issue refunds for change-of-mind
            after work has commenced.
          </p>
        </Section>

        <Section title="3. Consultation Bookings">
          <p>
            <strong className="text-ink">Cancellation with 24+ hours notice:</strong> You may cancel or reschedule
            at no charge by contacting us at least 24 hours before your scheduled session.
          </p>
          <p>
            <strong className="text-ink">Cancellation inside 24 hours:</strong> Cancellations made within 24 hours
            of the scheduled session are non-refundable. We may, at our discretion, offer a one-time reschedule
            if you contact us promptly.
          </p>
          <p>
            <strong className="text-ink">No-shows:</strong> Sessions where the client does not attend without
            prior notice are non-refundable. A brief recording or summary of preparation materials may be
            provided where applicable.
          </p>
        </Section>

        <Section title="4. Digital Resources">
          <p>
            Due to the digital nature of our resources (themes, templates, guides, prompt packs, toolkits), all
            sales are <strong className="text-ink">final once the download token has been issued</strong> or the
            resource has been downloaded. We do not offer refunds for change-of-mind on digital product purchases.
          </p>
          <p>
            If a resource is defective, significantly misrepresented, or fails to deliver as described, please
            contact us within 14 days of purchase. We will either provide a corrected version, a working
            replacement, or a full refund.
          </p>
        </Section>

        <Section title="5. How to Request a Refund">
          <p>To request a refund or discuss a billing issue:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Email <a href="mailto:hello@deempiretech.com" className="text-brand hover:underline">hello@deempiretech.com</a> with your order number and the reason for your request.</li>
            <li>Open a support ticket from your client portal under <strong className="text-ink">Support → New Ticket → Billing</strong>.</li>
            <li>We aim to respond to all refund requests within 2 business days.</li>
            <li>Approved refunds are processed back to your original payment method within 5–10 business days.</li>
          </ul>
        </Section>

        <Section title="6. Disputes">
          <p>
            If you are not satisfied with our response to a refund request, you may raise a dispute with your
            payment provider (Stripe). We are committed to resolving disputes fairly and will cooperate fully
            with any chargeback investigation. However, we reserve the right to dispute chargebacks where work
            was completed as agreed.
          </p>
        </Section>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex items-center justify-between flex-wrap gap-4">
        <Link href="/contact" className="text-sm font-medium text-brand hover:underline">
          Questions? Contact us →
        </Link>
        <div className="flex gap-5 text-xs text-muted">
          <Link href="/terms" className="hover:text-ink transition-colors">Terms of Service</Link>
          <Link href="/service-agreement" className="hover:text-ink transition-colors">Service Agreement</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-ink mb-3">{title}</h2>
      <div className="text-sm text-muted leading-relaxed space-y-3">{children}</div>
    </div>
  )
}
