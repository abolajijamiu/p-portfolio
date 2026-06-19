import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Service Level Agreement (SLA)',
  description: 'Delivery commitments, quality standards, and guarantees for E-Tech OS engagements.',
}

const LAST_UPDATED = '19 June 2026'

export default function SlaPage() {
  return (
    <div className="px-5 md:px-10 lg:px-16 max-w-4xl mx-auto py-14 md:py-20">
      <div className="mb-10">
        <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-3">Legal</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight mb-3">Service Level Agreement</h1>
        <p className="text-sm text-muted">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-8">
        <Section title="1. Purpose">
          <p>
            This Service Level Agreement (&quot;SLA&quot;) defines the delivery commitments, quality standards, and
            remedies that E-Tech OS provides to clients for professional service engagements. It supplements
            our{' '}
            <Link href="/service-agreement" className="text-brand hover:underline">Service Agreement</Link>{' '}
            and{' '}
            <Link href="/support-policy" className="text-brand hover:underline">Support Policy</Link>.
          </p>
        </Section>

        <Section title="2. Delivery Commitments">
          <p>
            Each service package specifies an estimated delivery timeframe in business days. These estimates
            assume timely submission of the project brief and required assets by the client.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-6 text-xs font-semibold text-ink">Service Type</th>
                  <th className="py-2 pr-6 text-xs font-semibold text-ink">Expert Assignment</th>
                  <th className="py-2 text-xs font-semibold text-ink">First Deliverable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 pr-6 text-xs text-muted">Audits &amp; Reports</td>
                  <td className="py-2 pr-6 text-xs text-muted">1 business day</td>
                  <td className="py-2 text-xs text-muted">Per package (typically 3–7 days)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-6 text-xs text-muted">Strategy &amp; Planning</td>
                  <td className="py-2 pr-6 text-xs text-muted">1 business day</td>
                  <td className="py-2 text-xs text-muted">Per package (typically 5–10 days)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-6 text-xs text-muted">Development &amp; Design</td>
                  <td className="py-2 pr-6 text-xs text-muted">2 business days</td>
                  <td className="py-2 text-xs text-muted">Per package (typically 7–21 days)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-6 text-xs text-muted">Consultation Sessions</td>
                  <td className="py-2 pr-6 text-xs text-muted">Immediate on booking</td>
                  <td className="py-2 text-xs text-muted">Per scheduled slot</td>
                </tr>
                <tr>
                  <td className="py-2 pr-6 text-xs text-muted">Analytics &amp; AI</td>
                  <td className="py-2 pr-6 text-xs text-muted">2 business days</td>
                  <td className="py-2 text-xs text-muted">Per package (typically 5–14 days)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted/70">
            All timeframes are business day estimates from brief submission (not from order date).
          </p>
        </Section>

        <Section title="3. Quality Standards">
          <p>All deliverables are held to the following standards before submission:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-ink">Completeness:</strong> All items listed in the package scope are included and functional.</li>
            <li><strong className="text-ink">Accuracy:</strong> Data, analysis, and recommendations are based on verified sources and sound methodology.</li>
            <li><strong className="text-ink">Presentation:</strong> Written work is professional, proofread, and clearly structured. Design work meets accessibility standards.</li>
            <li><strong className="text-ink">Technical quality:</strong> Code deliverables are tested, documented, and deploy-ready. Performance benchmarks (where applicable) are met.</li>
            <li><strong className="text-ink">Alignment:</strong> Deliverables align with the brief as submitted, any clarifications agreed during the engagement, and the package description.</li>
          </ul>
        </Section>

        <Section title="4. Revision Commitments">
          <p>
            We respond to revision requests within <strong className="text-ink">2 business days</strong> of receipt.
            Revision deliveries are submitted within the timeframe agreed at the start of the revision round,
            typically matching the original delivery window for the scope of changes requested.
          </p>
          <p>
            Revisions are limited to changes within the original agreed scope. Scope expansion is handled as
            a new order or change request.
          </p>
        </Section>

        <Section title="5. Platform Availability">
          <p>
            The E-Tech OS client portal targets <strong className="text-ink">99.5% monthly uptime</strong>{' '}
            (excluding scheduled maintenance). Scheduled maintenance is communicated at least 24 hours in
            advance via email and in-platform notification.
          </p>
          <p>
            Portal downtime does not pause active service order timelines unless it directly prevents us
            from delivering work. In such cases, timelines will be extended by the duration of the outage.
          </p>
        </Section>

        <Section title="6. SLA Remedies">
          <p>
            If we fail to meet a delivery commitment and it is not due to client delays or force majeure:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-ink">1–3 business days late:</strong> We will provide a written explanation and revised delivery date.</li>
            <li><strong className="text-ink">4–7 business days late:</strong> You are entitled to a 10% fee credit on the affected service, applied to a future order.</li>
            <li><strong className="text-ink">8+ business days late:</strong> You may request a full refund for the undelivered service, or a 20% fee credit applied to a future order at your choice.</li>
          </ul>
          <p>
            Remedies are applied upon written request via a support ticket referencing this SLA.
          </p>
        </Section>

        <Section title="7. Exclusions">
          <p>SLA commitments do not apply where delays are caused by:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Client failure to submit required materials or feedback within 5 business days.</li>
            <li>Scope changes requested after brief submission.</li>
            <li>Third-party failures (Stripe, hosting providers, domain registrars).</li>
            <li>Force majeure events (natural disasters, government actions, internet infrastructure failures).</li>
          </ul>
        </Section>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex items-center justify-between flex-wrap gap-4">
        <Link href="/contact" className="text-sm font-medium text-brand hover:underline">
          Questions? Contact us →
        </Link>
        <div className="flex gap-5 text-xs text-muted">
          <Link href="/service-agreement" className="hover:text-ink transition-colors">Service Agreement</Link>
          <Link href="/support-policy" className="hover:text-ink transition-colors">Support Policy</Link>
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
