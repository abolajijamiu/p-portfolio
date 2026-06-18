import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How E-Tech OS collects, uses, and protects your personal data.',
}

const LAST_UPDATED = '17 June 2025'

export default function PrivacyPage() {
  return (
    <div className="px-5 md:px-10 lg:px-16 max-w-4xl mx-auto py-14 md:py-20">
      <div className="mb-10">
        <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-3">Legal</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight mb-3">Privacy Policy</h1>
        <p className="text-sm text-muted">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="prose prose-sm max-w-none text-ink leading-relaxed space-y-8">
        <Section title="1. Who We Are">
          <p>
            E-Tech OS is operated by DeEmpireTech (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). We provide digital services
            including web development, marketing, branding, analytics, and related professional services to clients
            through our platform at this website.
          </p>
          <p>
            If you have questions about this policy, contact us at{' '}
            <a href="mailto:hello@deempiretech.com" className="text-brand hover:underline">
              hello@deempiretech.com
            </a>
            .
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect the following categories of personal data:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted">
            <li><strong className="text-ink">Account information:</strong> name, email address, password (hashed), and role when you register or are invited to the platform.</li>
            <li><strong className="text-ink">Order and billing data:</strong> service order details, payment amounts, and Stripe payment references (we do not store full card numbers).</li>
            <li><strong className="text-ink">Booking data:</strong> session dates, notes, and meeting information when you book a consultation.</li>
            <li><strong className="text-ink">Support and communications:</strong> messages, support tickets, and contact form submissions.</li>
            <li><strong className="text-ink">Usage data:</strong> pages visited, feature interactions, and browser or device information collected automatically.</li>
            <li><strong className="text-ink">Marketing data:</strong> email address if you subscribe to our newsletter.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc pl-5 space-y-1.5 text-muted">
            <li>To deliver the services you have ordered and manage your client portal account.</li>
            <li>To process payments and issue invoices via Stripe.</li>
            <li>To send transactional emails (booking confirmations, order updates, password resets).</li>
            <li>To respond to your enquiries and provide support.</li>
            <li>To send marketing communications if you have opted in, with an easy opt-out at any time.</li>
            <li>To improve our platform through aggregated, anonymised usage analysis.</li>
          </ul>
        </Section>

        <Section title="4. Legal Basis for Processing">
          <p>
            Where applicable under the UK GDPR and similar regulations, our legal bases for processing your data are:
            <strong className="text-ink"> contract performance</strong> (delivering services you purchased),
            <strong className="text-ink"> legitimate interests</strong> (platform security, fraud prevention, service improvement), and
            <strong className="text-ink"> consent</strong> (marketing emails, non-essential cookies).
          </p>
        </Section>

        <Section title="5. Data Sharing">
          <p>We do not sell your personal data. We share data only with:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted">
            <li><strong className="text-ink">Stripe</strong> — payment processing. Their privacy policy governs data they handle.</li>
            <li><strong className="text-ink">Cloud infrastructure providers</strong> (database, object storage) under strict data processing agreements.</li>
            <li><strong className="text-ink">Email delivery services</strong> used to send transactional and marketing emails.</li>
            <li><strong className="text-ink">Expert team members</strong> assigned to your project — only the information necessary to complete your order.</li>
          </ul>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We retain your account data for as long as your account is active and for up to 3 years after account closure
            to fulfil legal, tax, and dispute-resolution obligations. Support correspondence is retained for 2 years.
            You may request earlier deletion subject to any outstanding contractual obligations.
          </p>
        </Section>

        <Section title="7. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted">
            <li>Access a copy of the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request erasure where no overriding legal obligation requires retention.</li>
            <li>Object to processing based on legitimate interests.</li>
            <li>Data portability in a machine-readable format.</li>
            <li>Withdraw consent for marketing at any time.</li>
          </ul>
          <p>
            To exercise any right, email{' '}
            <a href="mailto:hello@deempiretech.com" className="text-brand hover:underline">
              hello@deempiretech.com
            </a>
            . We will respond within 30 days.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            We use essential cookies to keep you signed in and to protect against CSRF attacks. We may use analytics
            cookies to understand how visitors use our site — these are only set with your consent. You can clear
            cookies in your browser settings at any time.
          </p>
        </Section>

        <Section title="9. Security">
          <p>
            We implement industry-standard security measures including encrypted connections (TLS), hashed passwords
            (bcrypt), and access controls. No internet transmission is completely secure; we cannot guarantee the
            security of information transmitted to us but take all reasonable steps to protect it.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this policy from time to time. We will notify registered users of material changes by email.
            The &quot;last updated&quot; date at the top reflects the current version.
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
