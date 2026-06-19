import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Service Agreement',
  description: 'The standard service agreement governing professional engagements with E-Tech OS.',
}

const LAST_UPDATED = '19 June 2026'

export default function ServiceAgreementPage() {
  return (
    <div className="px-5 md:px-10 lg:px-16 max-w-4xl mx-auto py-14 md:py-20">
      <div className="mb-10">
        <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-3">Legal</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight mb-3">Service Agreement</h1>
        <p className="text-sm text-muted">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-8">
        <Section title="1. Parties">
          <p>
            This Service Agreement (&quot;Agreement&quot;) is between DeEmpireTech (&quot;E-Tech&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;),
            operating the E-Tech OS platform, and the client (&quot;you&quot;, &quot;Client&quot;) who places an order for
            professional services through the platform. By placing an order you accept this Agreement in full.
          </p>
        </Section>

        <Section title="2. Scope of Services">
          <p>
            Each order is defined by the service package selected at checkout. The scope, deliverables,
            revision allowance, and estimated delivery timeline are as described in the package at the time of
            purchase. Any additional scope requested after order placement will be quoted separately as a
            new order or change request.
          </p>
          <p>
            Services may include web development, Shopify/WooCommerce work, marketing strategy, branding,
            SEO, analytics, AI automation, consulting, and related professional work as listed on our services
            pages. Each engagement is staffed by one or more verified expert team members.
          </p>
        </Section>

        <Section title="3. Client Responsibilities">
          <p>Timely delivery of high-quality work depends on your cooperation. You agree to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Submit a complete project brief and all required assets within 5 business days of payment.</li>
            <li>Provide timely feedback on deliverables — typically within 5 business days of submission.</li>
            <li>Make yourself (or a designated decision-maker) available for questions during the engagement.</li>
            <li>Ensure all assets, content, and credentials you provide are owned by you or properly licensed.</li>
            <li>Not share access credentials or deliverables with third parties without our consent.</li>
          </ul>
          <p>
            Delays caused by late brief submission, slow feedback, or unavailability may extend delivery
            timelines proportionally. We will communicate any such delays promptly.
          </p>
        </Section>

        <Section title="4. Delivery and Revisions">
          <p>
            Deliverables are submitted through your E-Tech OS portal. You will receive email and in-portal
            notifications when a deliverable is ready for review.
          </p>
          <p>
            Each package includes a stated number of revision rounds. A revision round covers changes that
            fall within the original agreed scope — it does not constitute approval for new scope.
            Revision requests must be specific, consolidated, and submitted within 7 days of deliverable
            submission. After approval or after the revision allowance is exhausted, additional changes
            are quoted separately.
          </p>
        </Section>

        <Section title="5. Payment Terms">
          <p>
            Payment is collected in full at the time of order via Stripe. Work begins only after
            payment is confirmed. Prices are in USD unless otherwise stated and exclude local taxes.
          </p>
          <p>
            For multi-milestone engagements (where applicable), a payment schedule will be agreed and
            documented in the order workspace before work commences.
          </p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            Upon receipt of full payment, you receive full ownership of the custom deliverables created
            specifically for your engagement — including custom code, designs, written copy, and strategy
            documents — subject to any third-party component licences.
          </p>
          <p>
            E-Tech retains ownership of all pre-existing tools, templates, frameworks, methods, and
            platform IP. We may include open-source or third-party components in deliverables; their
            respective licences apply. We will disclose any material third-party dependencies.
          </p>
          <p>
            You grant us a non-exclusive licence to reference the completed work in our portfolio and
            marketing materials unless you notify us in writing otherwise.
          </p>
        </Section>

        <Section title="7. Confidentiality">
          <p>
            Both parties agree to treat confidential information shared during the engagement as
            strictly confidential and not to disclose it to third parties without prior written consent,
            except as required by law. This obligation survives termination of this Agreement for
            3 years.
          </p>
        </Section>

        <Section title="8. Warranties and Liability">
          <p>
            We warrant that services will be performed with reasonable skill and care, and that
            deliverables will materially conform to the agreed brief. We do not warrant specific
            business outcomes (e.g., search rankings, revenue uplift, conversion rates).
          </p>
          <p>
            Our total liability under this Agreement is limited to the fees paid by you for the
            specific service giving rise to a claim. We are not liable for indirect, incidental,
            or consequential loss.
          </p>
        </Section>

        <Section title="9. Termination">
          <p>
            Either party may terminate an engagement by written notice. On termination, you will
            receive all completed work to date. Fees for work completed are non-refundable. Any
            outstanding balance for completed milestones remains due.
          </p>
        </Section>

        <Section title="10. Governing Law">
          <p>
            This Agreement is governed by the laws of England and Wales. Any dispute shall be
            referred first to good-faith negotiation, and if unresolved, to the courts of
            England and Wales.
          </p>
        </Section>

        <Section title="11. Entire Agreement">
          <p>
            This Agreement, together with the order details and our{' '}
            <Link href="/terms" className="text-brand hover:underline">Terms of Service</Link>,{' '}
            <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>, and{' '}
            <Link href="/refund" className="text-brand hover:underline">Refund Policy</Link>,
            constitute the entire agreement between the parties. It supersedes all prior
            discussions, representations, or agreements.
          </p>
        </Section>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex items-center justify-between flex-wrap gap-4">
        <Link href="/contact" className="text-sm font-medium text-brand hover:underline">
          Questions? Contact us →
        </Link>
        <div className="flex gap-5 text-xs text-muted">
          <Link href="/terms" className="hover:text-ink transition-colors">Terms of Service</Link>
          <Link href="/refund" className="hover:text-ink transition-colors">Refund Policy</Link>
          <Link href="/sla" className="hover:text-ink transition-colors">SLA Policy</Link>
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
