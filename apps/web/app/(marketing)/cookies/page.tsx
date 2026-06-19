import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How E-Tech OS uses cookies and how to manage your preferences.',
}

const LAST_UPDATED = '19 June 2026'

export default function CookiesPage() {
  return (
    <div className="px-5 md:px-10 lg:px-16 max-w-4xl mx-auto py-14 md:py-20">
      <div className="mb-10">
        <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-3">Legal</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight mb-3">Cookie Policy</h1>
        <p className="text-sm text-muted">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-8">
        <Section title="1. What Are Cookies">
          <p>
            Cookies are small text files stored in your browser when you visit a website. They are
            widely used to make websites work, to remember your preferences, and to help us understand
            how visitors interact with our site.
          </p>
        </Section>

        <Section title="2. Cookies We Use">
          <p>We use the following categories of cookies on E-Tech OS:</p>

          <div className="space-y-4">
            <div className="p-4 bg-surface border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Essential</span>
                <p className="text-sm font-semibold text-ink">Always active</p>
              </div>
              <p className="text-sm text-muted">
                These cookies are required for the platform to function. They include session tokens
                (to keep you signed in), CSRF protection tokens, and load-balancing cookies. Without
                them, features like the client portal, checkout, and bookings cannot work.
              </p>
              <p className="text-xs text-muted/70 mt-2">Examples: <code className="font-mono text-ink/70">auth_token</code>, <code className="font-mono text-ink/70">csrf_token</code>, <code className="font-mono text-ink/70">session_id</code></p>
            </div>

            <div className="p-4 bg-surface border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">Analytics</span>
                <p className="text-sm font-semibold text-ink">Requires consent</p>
              </div>
              <p className="text-sm text-muted">
                We may use anonymised analytics cookies to understand how visitors navigate our
                marketing site — which pages are most visited, where visitors come from, and
                what content is most useful. This data is aggregated and never tied to individual
                identities.
              </p>
              <p className="text-xs text-muted/70 mt-2">These are only set with your explicit consent via our cookie banner.</p>
            </div>

            <div className="p-4 bg-surface border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">Preferences</span>
                <p className="text-sm font-semibold text-ink">Requires consent</p>
              </div>
              <p className="text-sm text-muted">
                Preference cookies remember settings you have chosen — such as dismissing banners,
                campaign preferences, and display options — so you do not see the same prompts
                repeatedly.
              </p>
            </div>
          </div>
        </Section>

        <Section title="3. Third-Party Cookies">
          <p>
            Certain third-party services we integrate may set their own cookies. These include:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-ink">Stripe:</strong> Payment processing. Stripe sets cookies to prevent fraud and improve checkout security. See <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Stripe&apos;s Privacy Policy</a>.</li>
            <li><strong className="text-ink">Google Meet / Calendar:</strong> If you book a consultation, the meeting link may be hosted via Google services subject to Google&apos;s cookie policy.</li>
          </ul>
          <p>We have no control over third-party cookies set by these services.</p>
        </Section>

        <Section title="4. How to Manage Cookies">
          <p>
            You can manage or delete cookies through your browser settings. All major browsers provide
            tools to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>View and delete individual cookies.</li>
            <li>Block all or certain categories of cookies.</li>
            <li>Set preferences for specific websites.</li>
          </ul>
          <p>
            Note that blocking essential cookies will prevent the client portal from functioning
            correctly — you will be unable to stay signed in or complete checkout.
          </p>
          <p>
            For help managing cookies in your specific browser, visit your browser&apos;s help
            documentation or <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">aboutcookies.org</a>.
          </p>
        </Section>

        <Section title="5. Changes to This Policy">
          <p>
            We may update this Cookie Policy as we add new features or third-party integrations.
            The &quot;last updated&quot; date at the top reflects the current version.
          </p>
        </Section>

        <Section title="6. Contact">
          <p>
            Questions about cookies or your data:{' '}
            <a href="mailto:hello@deempiretech.com" className="text-brand hover:underline">hello@deempiretech.com</a>{' '}
            or see our <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>.
          </p>
        </Section>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex items-center justify-between flex-wrap gap-4">
        <Link href="/privacy" className="text-sm font-medium text-brand hover:underline">
          Privacy Policy →
        </Link>
        <div className="flex gap-5 text-xs text-muted">
          <Link href="/terms" className="hover:text-ink transition-colors">Terms</Link>
          <Link href="/legal" className="hover:text-ink transition-colors">All policies</Link>
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
