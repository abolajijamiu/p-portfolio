// ─── Brand constants ──────────────────────────────────────────────────────────

const BRAND = '#1E3A8A'
const BRAND_LIGHT = '#EFF3FF'
const INK = '#0F172A'
const MUTED = '#64748B'
const BORDER = '#E2E8F0'
const SURFACE = '#F8FAFC'
const WEB_URL = process.env.WEB_URL ?? 'http://localhost:3002'
const FROM_NAME = process.env.EMAIL_FROM_NAME ?? 'E-Tech'

// ─── Base template ────────────────────────────────────────────────────────────

export function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${FROM_NAME}</title>
</head>
<body style="margin:0;padding:0;background:${SURFACE};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${SURFACE};">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${BORDER};">

        <!-- Header -->
        <tr>
          <td style="padding:22px 32px;border-bottom:1px solid ${BORDER};">
            <a href="${WEB_URL}" style="text-decoration:none;">
              <span style="font-size:17px;font-weight:700;color:${INK};letter-spacing:-0.3px;">E</span><span style="font-size:17px;font-weight:700;color:${BRAND};letter-spacing:-0.3px;">-Tech.</span>
            </a>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid ${BORDER};background:${SURFACE};">
            <p style="margin:0;font-size:11px;color:${MUTED};line-height:1.6;">
              © ${new Date().getFullYear()} ${FROM_NAME} Digital Services. This is an automated message.<br/>
              Questions? Reply to this email or visit <a href="${WEB_URL}/support" style="color:${BRAND};text-decoration:none;">${WEB_URL.replace(/^https?:\/\//, '')}/support</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

// ─── Primitive helpers ────────────────────────────────────────────────────────

function h1(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${INK};letter-spacing:-0.3px;">${esc(text)}</h1>`
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:14px;color:${MUTED};line-height:1.65;">${text}</p>`
}

function strong(text: string): string {
  return `<strong style="color:${INK};">${esc(text)}</strong>`
}

function ctaButton(label: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;">
    <tr>
      <td style="border-radius:8px;background:${BRAND};">
        <a href="${href}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:0.1px;">${esc(label)}</a>
      </td>
    </tr>
  </table>`
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid ${BORDER};">
      <span style="font-size:11px;font-weight:600;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;">${esc(label)}</span>
    </td>
    <td style="padding:8px 0 8px 16px;border-bottom:1px solid ${BORDER};text-align:right;">
      <span style="font-size:13px;color:${INK};font-weight:500;">${esc(value)}</span>
    </td>
  </tr>`
}

function infoTable(rows: [string, string][]): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
    ${rows.map(([l, v]) => infoRow(l, v)).join('')}
  </table>`
}

function callout(text: string, color = BRAND_LIGHT, textColor = BRAND): string {
  return `<div style="margin:16px 0;padding:12px 16px;background:${color};border-radius:8px;border-left:3px solid ${textColor};">
    <p style="margin:0;font-size:13px;color:${textColor};line-height:1.55;">${text}</p>
  </div>`
}

function divider(): string {
  return `<div style="margin:20px 0;border-top:1px solid ${BORDER};"></div>`
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function fmtMoney(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100)
}

function fmtDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

// ─── Email templates ──────────────────────────────────────────────────────────

export function serviceOrderPlacedClient(params: {
  clientName: string
  orderNumber: string
  serviceTitle: string
  packageName: string
  priceCents: number
  currency: string
}): { subject: string; html: string } {
  const subject = `Order confirmed — ${params.orderNumber}`
  const html = baseTemplate(`
    ${h1('Your order has been received')}
    ${p(`Hi ${strong(params.clientName)}, thanks for placing an order with E-Tech. We'll review it and get back to you shortly.`)}
    ${infoTable([
      ['Order number', params.orderNumber],
      ['Service', params.serviceTitle],
      ['Package', params.packageName],
      ['Total', fmtMoney(params.priceCents, params.currency)],
    ])}
    ${callout('Your order is under review. You\'ll receive another email once payment is confirmed and your order is assigned.')}
    ${ctaButton('View your order', `${WEB_URL}/orders`)}
    ${p('Questions? Reply to this email or use the support centre inside your portal.')}
  `)
  return { subject, html }
}

export function serviceOrderDeliveredClient(params: {
  clientName: string
  orderNumber: string
  serviceTitle: string
  deliveryMessage: string
}): { subject: string; html: string } {
  const subject = `Your order has been delivered — ${params.orderNumber}`
  const html = baseTemplate(`
    ${h1('Your delivery is ready')}
    ${p(`Hi ${strong(params.clientName)}, great news — your ${strong(params.serviceTitle)} order has been delivered.`)}
    ${callout(`<strong>Delivery note:</strong> ${esc(params.deliveryMessage.slice(0, 300))}${params.deliveryMessage.length > 300 ? '…' : ''}`)}
    ${infoTable([
      ['Order number', params.orderNumber],
    ])}
    ${p('Please review the delivery in your portal. You can request a revision or approve the delivery.')}
    ${ctaButton('Review delivery', `${WEB_URL}/orders`)}
  `)
  return { subject, html }
}

export function serviceOrderCompletedClient(params: {
  clientName: string
  orderNumber: string
  serviceTitle: string
}): { subject: string; html: string } {
  const subject = `Order completed — ${params.orderNumber}`
  const html = baseTemplate(`
    ${h1('Order completed')}
    ${p(`Hi ${strong(params.clientName)}, your ${strong(params.serviceTitle)} order has been marked as complete. Thank you for working with E-Tech.`)}
    ${infoTable([
      ['Order number', params.orderNumber],
    ])}
    ${divider()}
    ${p('If you have any further needs, we\'d love to help. Browse our services or get in touch.')}
    ${ctaButton('Browse services', `${WEB_URL}/services`)}
  `)
  return { subject, html }
}

export function newServiceOrderAdmin(params: {
  adminEmail: string
  orderNumber: string
  clientName: string
  clientEmail: string
  serviceTitle: string
  packageName: string
  priceCents: number
  currency: string
}): { subject: string; html: string; to: string } {
  const subject = `New order: ${params.orderNumber} — ${params.clientName}`
  const html = baseTemplate(`
    ${h1('New service order')}
    ${p(`A new service order has been placed and is waiting for your review.`)}
    ${infoTable([
      ['Order number', params.orderNumber],
      ['Client', `${params.clientName} (${params.clientEmail})`],
      ['Service', params.serviceTitle],
      ['Package', params.packageName],
      ['Value', fmtMoney(params.priceCents, params.currency)],
    ])}
    ${ctaButton('Review in admin', `${WEB_URL}/admin/service-orders`)}
  `)
  return { subject, html, to: params.adminEmail }
}

export function bookingPlacedClient(params: {
  clientName: string
  serviceTitle: string
  slotStartsAt: Date
  durationMinutes: number
}): { subject: string; html: string } {
  const subject = `Booking request received — ${params.serviceTitle}`
  const html = baseTemplate(`
    ${h1('Booking request received')}
    ${p(`Hi ${strong(params.clientName)}, we've received your booking request. Our team will confirm it shortly.`)}
    ${infoTable([
      ['Session', params.serviceTitle],
      ['Date & time', fmtDateTime(params.slotStartsAt)],
      ['Duration', `${params.durationMinutes} minutes`],
    ])}
    ${callout('Your booking is pending confirmation. You\'ll receive another email with your meeting details once confirmed.')}
    ${ctaButton('View booking', `${WEB_URL}/bookings`)}
  `)
  return { subject, html }
}

export function bookingConfirmedClient(params: {
  clientName: string
  serviceTitle: string
  slotStartsAt: Date
  durationMinutes: number
  meetingUrl?: string | null
}): { subject: string; html: string } {
  const subject = `Your booking is confirmed — ${params.serviceTitle}`
  const html = baseTemplate(`
    ${h1('Your booking is confirmed')}
    ${p(`Hi ${strong(params.clientName)}, your booking has been confirmed. We look forward to speaking with you.`)}
    ${infoTable([
      ['Session', params.serviceTitle],
      ['Date & time', fmtDateTime(params.slotStartsAt)],
      ['Duration', `${params.durationMinutes} minutes`],
      ...(params.meetingUrl ? [['Meeting link', params.meetingUrl] as [string, string]] : []),
    ])}
    ${params.meetingUrl
      ? callout(`Join at the scheduled time: <a href="${params.meetingUrl}" style="color:${BRAND};font-weight:600;">${esc(params.meetingUrl)}</a>`)
      : callout('Meeting details will be sent closer to the time.')}
    ${ctaButton('View booking', `${WEB_URL}/bookings`)}
  `)
  return { subject, html }
}

export function newBookingAdmin(params: {
  adminEmail: string
  clientName: string
  clientEmail: string
  serviceTitle: string
  slotStartsAt: Date
  durationMinutes: number
}): { subject: string; html: string; to: string } {
  const subject = `New booking: ${params.serviceTitle} — ${params.clientName}`
  const html = baseTemplate(`
    ${h1('New booking request')}
    ${p(`A client has requested a booking and is waiting for confirmation.`)}
    ${infoTable([
      ['Client', `${params.clientName} (${params.clientEmail})`],
      ['Session', params.serviceTitle],
      ['Date & time', fmtDateTime(params.slotStartsAt)],
      ['Duration', `${params.durationMinutes} minutes`],
    ])}
    ${ctaButton('Confirm in admin', `${WEB_URL}/admin/bookings`)}
  `)
  return { subject, html, to: params.adminEmail }
}

export function supportTicketNewAdmin(params: {
  adminEmail: string
  clientName: string
  clientEmail: string
  ticketSubject: string
  message: string
}): { subject: string; html: string; to: string } {
  const subject = `New support ticket: ${params.ticketSubject}`
  const html = baseTemplate(`
    ${h1('New support ticket')}
    ${p(`${strong(params.clientName)} (${esc(params.clientEmail)}) opened a new support ticket.`)}
    ${infoTable([
      ['Subject', params.ticketSubject],
    ])}
    ${callout(`<strong>Message:</strong><br/>${esc(params.message.slice(0, 400))}${params.message.length > 400 ? '…' : ''}`)}
    ${ctaButton('Reply in admin', `${WEB_URL}/admin/support`)}
  `)
  return { subject, html, to: params.adminEmail }
}

export function supportTicketReplyClient(params: {
  clientEmail: string
  clientName: string
  ticketSubject: string
  replyBody: string
  ticketId: string
}): { subject: string; html: string } {
  const subject = `Re: ${params.ticketSubject}`
  const html = baseTemplate(`
    ${h1('Reply to your support ticket')}
    ${p(`Hi ${strong(params.clientName)}, the E-Tech support team has replied to your ticket.`)}
    ${infoTable([
      ['Ticket', params.ticketSubject],
    ])}
    ${callout(`<strong>Reply:</strong><br/>${esc(params.replyBody.slice(0, 400))}${params.replyBody.length > 400 ? '…' : ''}`)}
    ${ctaButton('View full conversation', `${WEB_URL}/support/${params.ticketId}`)}
  `)
  return { subject, html }
}

export function inviteUser(params: {
  name: string
  orgName: string
  inviteUrl: string
}): { subject: string; html: string } {
  const subject = `You've been invited to ${params.orgName}`
  const html = baseTemplate(`
    ${h1(`You've been invited`)}
    ${p(`Hi ${strong(params.name)}, you've been invited to join <strong>${esc(params.orgName)}</strong> on E-Tech.`)}
    ${p('Click the button below to set up your account and get started. The link expires in <strong>72 hours</strong>.')}
    ${ctaButton('Accept invitation', params.inviteUrl)}
    ${callout('If you weren\'t expecting this invitation, you can safely ignore this email.')}
  `)
  return { subject, html }
}

export function passwordResetRequest(params: {
  name: string
  resetUrl: string
}): { subject: string; html: string } {
  const subject = 'Reset your E-Tech password'
  const html = baseTemplate(`
    ${h1('Reset your password')}
    ${p(`Hi ${strong(params.name)}, we received a request to reset the password for your E-Tech account.`)}
    ${ctaButton('Reset password', params.resetUrl)}
    ${callout('This link expires in <strong>1 hour</strong>. If you didn\'t request a password reset, you can safely ignore this email — your password will not change.')}
    ${divider()}
    ${p('For security, this link can only be used once.')}
  `)
  return { subject, html }
}

export function payoutRecordedExpert(params: {
  expertEmail: string
  expertName: string
  amountCents: number
  currency: string
  description?: string | null
  status: 'pending' | 'paid'
}): { subject: string; html: string } {
  const isPaid = params.status === 'paid'
  const subject = isPaid
    ? `Payment sent — ${fmtMoney(params.amountCents, params.currency)}`
    : `Payout recorded — ${fmtMoney(params.amountCents, params.currency)}`
  const html = baseTemplate(`
    ${h1(isPaid ? 'Payment sent' : 'Payout recorded')}
    ${p(`Hi ${strong(params.expertName)}, ${isPaid ? 'a payment has been sent to you' : 'a payout has been recorded for you'}.`)}
    ${infoTable([
      ['Amount', fmtMoney(params.amountCents, params.currency)],
      ['Status', isPaid ? 'Paid' : 'Pending'],
      ...(params.description ? [['For', params.description] as [string, string]] : []),
    ])}
    ${isPaid
      ? callout('This payment has been processed. Please allow 1–3 business days for funds to arrive depending on your bank.')
      : callout('This payout is pending. You\'ll receive another email when payment is sent.')}
    ${ctaButton('View earnings', `${WEB_URL}/expert/payouts`)}
  `)
  return { subject, html }
}

// ─── Testimonial request ──────────────────────────────────────────────────────

export function testimonialRequestClient(params: {
  clientName: string
  serviceTitle: string
  submitUrl: string
}): { subject: string; html: string } {
  const subject = `How did we do? Share your experience with E-Tech`
  const html = baseTemplate(`
    ${h1('We\'d love your feedback')}
    ${p(`Hi ${strong(params.clientName)}, thank you for working with us on ${strong(params.serviceTitle)}.`)}
    ${p('Your experience matters to us. Taking a moment to share your thoughts helps us improve and helps other businesses find the right support.')}
    ${callout('This takes less than 60 seconds — just a star rating and a few words.')}
    ${ctaButton('Leave a review', params.submitUrl)}
    ${divider()}
    ${p(`If the button above doesn't work, copy and paste this link into your browser:<br/><a href="${params.submitUrl}" style="color:${BRAND};word-break:break-all;">${params.submitUrl}</a>`)}
    ${p('This link is unique to you and expires in 30 days.')}
  `)
  return { subject, html }
}
