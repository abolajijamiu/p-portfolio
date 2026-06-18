import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions governing use of E-Tech OS and its services.',
}

const LAST_UPDATED = '17 June 2025'

export default function TermsPage() {
  return (
    <div className="px-5 md:px-10 lg:px-16 max-w-4xl mx-auto py-14 md:py-20">
      <div className="mb-10">
        <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-3">Legal</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight mb-3">Terms of Service</h1>
        <p className="text-sm text-muted">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-8">
        <Section title="1. Agreement">
          <p>
            By accessing or using E-Tech OS (the &quot;Platform&quot;), provided by DeEmpireTech (&quot;we&quot;, &quot;us&quot;), you agree
            to be bound by these Terms of Service. If you do not agree, do not use the Platform.
          </p>
        </Section>

        <Section title="2. Services">
          <p>
            E-Tech OS provides a managed platform through which clients engage professional expert teams for digital
            services including web development, marketing, branding, analytics, and related work
            (&quot;Services&quot;). Clients pay E-Tech directly. Expert compensation is handled separately by us.
          </p>
          <p>
            Services are described in individual service packages. Delivery timelines, revision counts, and
            inclusions are as stated at the time of order. We reserve the right to update package details for
            future orders.
          </p>
        </Section>

        <Section title="3. Accounts">
          <p>
            You must provide accurate information when creating an account. You are responsible for maintaining the
            security of your credentials. Notify us immediately at{' '}
            <a href="mailto:hello@deempiretech.com" className="text-brand hover:underline">
              hello@deempiretech.com
            </a>{' '}
            if you suspect unauthorised access.
          </p>
          <p>
            We may suspend or terminate accounts that breach these terms, engage in fraudulent activity, or are
            reasonably suspected of doing so.
          </p>
        </Section>

        <Section title="4. Payments and Refunds">
          <p>
            All payments are processed securely through Stripe. Prices are shown in USD and are exclusive of any
            applicable local taxes unless stated otherwise.
          </p>
          <p>
            <strong className="text-ink">Refund policy:</strong> Refunds may be issued at our discretion before work
            commences on an order. Once delivery has begun, we operate on a revision-based model — we will revise
            the work to meet the agreed brief rather than issue refunds. Contact us at{' '}
            <a href="mailto:hello@deempiretech.com" className="text-brand hover:underline">
              hello@deempiretech.com
            </a>{' '}
            with any billing queries.
          </p>
          <p>
            <strong className="text-ink">Booking sessions:</strong> Cancellations made with at least 24 hours notice
            may be rescheduled at no charge. Cancellations inside 24 hours are non-refundable.
          </p>
        </Section>

        <Section title="5. Intellectual Property">
          <p>
            Upon full payment, you receive ownership of the custom deliverables produced specifically for you
            (e.g., custom code, designs, written copy), subject to any third-party licences for components
            incorporated in the work.
          </p>
          <p>
            We retain ownership of our platform, tools, templates, methodologies, and any pre-existing intellectual
            property. Digital resources (themes, templates, guides) are licensed, not sold, under the terms
            specified at purchase — see our{' '}
            <Link href="/licenses" className="text-brand hover:underline">Licenses page</Link> for details.
          </p>
          <p>
            We may reference completed projects in our portfolio unless you request otherwise in writing.
          </p>
        </Section>

        <Section title="6. Client Obligations">
          <p>You agree to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Provide accurate project briefs, assets, and timely feedback.</li>
            <li>Not use our services for unlawful, harmful, or misleading purposes.</li>
            <li>Not attempt to reverse-engineer, copy, or redistribute our platform or resources beyond licence terms.</li>
            <li>Ensure you have the rights to any content you provide to us for incorporation into deliverables.</li>
          </ul>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, our liability to you for any claim arising from these terms or
            our services is limited to the amount paid by you for the specific service giving rise to the claim in
            the 12 months preceding the claim. We are not liable for indirect, consequential, or loss of profits damages.
          </p>
        </Section>

        <Section title="8. Governing Law">
          <p>
            These terms are governed by the laws of England and Wales. Disputes shall be submitted to the exclusive
            jurisdiction of the courts of England and Wales, unless we agree otherwise in writing.
          </p>
        </Section>

        <Section title="9. Changes">
          <p>
            We may revise these terms. Material changes will be communicated to registered users by email with at
            least 14 days notice before taking effect. Continued use after the effective date constitutes acceptance.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            Questions about these terms:{' '}
            <a href="mailto:hello@deempiretech.com" className="text-brand hover:underline">
              hello@deempiretech.com
            </a>{' '}
            or via our{' '}
            <Link href="/contact" className="text-brand hover:underline">contact page</Link>.
          </p>
        </Section>
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <Link href="/contact" className="text-sm font-medium text-brand hover:underline">
          Questions? Contact us →
        </Link>
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
