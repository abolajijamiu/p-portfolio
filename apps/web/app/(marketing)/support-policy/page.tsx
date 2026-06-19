import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Support Policy',
  description: 'How E-Tech OS provides client support, response times, and escalation paths.',
}

const LAST_UPDATED = '19 June 2026'

export default function SupportPolicyPage() {
  return (
    <div className="px-5 md:px-10 lg:px-16 max-w-4xl mx-auto py-14 md:py-20">
      <div className="mb-10">
        <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-3">Legal</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight mb-3">Support Policy</h1>
        <p className="text-sm text-muted">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-8">
        <Section title="1. Support Channels">
          <p>
            E-Tech OS client support is available through the following channels:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-ink">Client Portal Support Tickets:</strong> The primary support channel. Log in to E-Tech OS and open a ticket via <strong className="text-ink">Support → New Ticket</strong>. Tickets are tracked, prioritised, and resolved within our stated response times.</li>
            <li><strong className="text-ink">Order Workspace Messaging:</strong> For questions related to an active service order, use the messaging thread inside your order workspace. Your assigned expert receives these directly.</li>
            <li><strong className="text-ink">Email:</strong> <a href="mailto:hello@deempiretech.com" className="text-brand hover:underline">hello@deempiretech.com</a> for general enquiries. Support tickets via the portal receive faster responses.</li>
          </ul>
        </Section>

        <Section title="2. Support Scope">
          <p>Our support team assists with:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Questions and status updates on active service orders.</li>
            <li>Billing, invoicing, and payment queries.</li>
            <li>Technical issues with the E-Tech OS platform itself (login, portal features, file access).</li>
            <li>Resource and download issues (defective files, license key problems).</li>
            <li>Booking and consultation scheduling queries.</li>
            <li>General enquiries about our services, process, and packages.</li>
          </ul>
          <p>
            <strong className="text-ink">Not in scope:</strong> General technical support for your own website or
            business systems beyond what is included in a purchased service package. For ongoing technical
            support, please see our maintenance and retainer service offerings.
          </p>
        </Section>

        <Section title="3. Priority Levels">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-4 text-xs font-semibold text-ink">Priority</th>
                  <th className="py-2 pr-4 text-xs font-semibold text-ink">Description</th>
                  <th className="py-2 text-xs font-semibold text-ink">First Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 pr-4 text-xs font-semibold text-rose-600">Urgent</td>
                  <td className="py-2 pr-4 text-xs text-muted">Live site down, security breach, payment failure</td>
                  <td className="py-2 text-xs text-muted">4 business hours</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-semibold text-amber-600">High</td>
                  <td className="py-2 pr-4 text-xs text-muted">Critical feature broken, licence key invalid, overdue deliverable</td>
                  <td className="py-2 text-xs text-muted">8 business hours</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-semibold text-blue-600">Normal</td>
                  <td className="py-2 pr-4 text-xs text-muted">Order queries, billing questions, general questions</td>
                  <td className="py-2 text-xs text-muted">1 business day</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-semibold text-muted">Low</td>
                  <td className="py-2 pr-4 text-xs text-muted">General feedback, feature requests, non-urgent enquiries</td>
                  <td className="py-2 text-xs text-muted">2 business days</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted/70">
            Business hours: Monday–Friday, 09:00–18:00 GMT. Priority is set by you when opening a ticket and
            may be adjusted by our team based on impact.
          </p>
        </Section>

        <Section title="4. Escalation">
          <p>
            If you feel your issue has not been resolved to a satisfactory standard, you may escalate by:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Replying to the existing ticket and marking it as requiring escalation.</li>
            <li>Emailing <a href="mailto:hello@deempiretech.com" className="text-brand hover:underline">hello@deempiretech.com</a> with the subject line <strong className="text-ink">ESCALATION: [Ticket Number]</strong>.</li>
          </ul>
          <p>
            Escalated tickets are reviewed by a senior team member within 4 business hours.
          </p>
        </Section>

        <Section title="5. Resolution and Closure">
          <p>
            Tickets are marked as resolved once a solution has been provided. If you do not respond to a
            resolution within 5 business days, the ticket will be automatically closed. Closed tickets can
            be reopened by replying to the original thread within 30 days.
          </p>
        </Section>

        <Section title="6. Policy Updates">
          <p>
            We review this Support Policy periodically. Changes are reflected in the &quot;last updated&quot; date.
            Material changes that affect response time commitments will be communicated to registered clients.
          </p>
        </Section>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex items-center justify-between flex-wrap gap-4">
        <Link href="/contact" className="text-sm font-medium text-brand hover:underline">
          Open a support ticket →
        </Link>
        <div className="flex gap-5 text-xs text-muted">
          <Link href="/sla" className="hover:text-ink transition-colors">SLA Policy</Link>
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
