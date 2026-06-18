import { Resend } from 'resend'
import * as tmpl from './email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`

async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({ from: FROM, to, subject, html })
}

// ─── Service orders ───────────────────────────────────────────────────────────

export async function emailServiceOrderPlaced(params: {
  clientEmail: string
  clientName: string
  orderNumber: string
  serviceTitle: string
  packageName: string
  priceCents: number
  currency: string
}) {
  const { subject, html } = tmpl.serviceOrderPlacedClient(params)
  const adminEmail = process.env.CONTACT_EMAIL ?? process.env.EMAIL_FROM_ADDRESS!
  const { subject: as, html: ah, to: at } = tmpl.newServiceOrderAdmin({
    adminEmail,
    orderNumber: params.orderNumber,
    clientName: params.clientName,
    clientEmail: params.clientEmail,
    serviceTitle: params.serviceTitle,
    packageName: params.packageName,
    priceCents: params.priceCents,
    currency: params.currency,
  })
  await Promise.all([
    send(params.clientEmail, subject, html),
    send(at, as, ah),
  ])
}

export async function emailServiceOrderDelivered(params: {
  clientEmail: string
  clientName: string
  orderNumber: string
  serviceTitle: string
  deliveryMessage: string
}) {
  const { subject, html } = tmpl.serviceOrderDeliveredClient(params)
  await send(params.clientEmail, subject, html)
}

export async function emailServiceOrderCompleted(params: {
  clientEmail: string
  clientName: string
  orderNumber: string
  serviceTitle: string
}) {
  const { subject, html } = tmpl.serviceOrderCompletedClient(params)
  await send(params.clientEmail, subject, html)
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function emailBookingPlaced(params: {
  clientEmail: string
  clientName: string
  serviceTitle: string
  slotStartsAt: Date
  durationMinutes: number
}) {
  const { subject, html } = tmpl.bookingPlacedClient(params)
  const adminEmail = process.env.CONTACT_EMAIL ?? process.env.EMAIL_FROM_ADDRESS!
  const { subject: as, html: ah, to: at } = tmpl.newBookingAdmin({
    adminEmail,
    clientName: params.clientName,
    clientEmail: params.clientEmail,
    serviceTitle: params.serviceTitle,
    slotStartsAt: params.slotStartsAt,
    durationMinutes: params.durationMinutes,
  })
  await Promise.all([
    send(params.clientEmail, subject, html),
    send(at, as, ah),
  ])
}

export async function emailBookingConfirmed(params: {
  clientEmail: string
  clientName: string
  serviceTitle: string
  slotStartsAt: Date
  durationMinutes: number
  meetingUrl?: string | null
}) {
  const { subject, html } = tmpl.bookingConfirmedClient(params)
  await send(params.clientEmail, subject, html)
}

// ─── Support ──────────────────────────────────────────────────────────────────

export async function emailSupportTicketNew(params: {
  clientEmail: string
  clientName: string
  ticketSubject: string
  message: string
}) {
  const adminEmail = process.env.CONTACT_EMAIL ?? process.env.EMAIL_FROM_ADDRESS!
  const { subject, html, to } = tmpl.supportTicketNewAdmin({
    adminEmail,
    clientName: params.clientName,
    clientEmail: params.clientEmail,
    ticketSubject: params.ticketSubject,
    message: params.message,
  })
  await send(to, subject, html)
}

export async function emailSupportTicketReply(params: {
  clientEmail: string
  clientName: string
  ticketSubject: string
  replyBody: string
  ticketId: string
}) {
  const { subject, html } = tmpl.supportTicketReplyClient(params)
  await send(params.clientEmail, subject, html)
}

// ─── Expert payouts ───────────────────────────────────────────────────────────

export async function emailPayoutRecorded(params: {
  expertEmail: string
  expertName: string
  amountCents: number
  currency: string
  description?: string | null
  status: 'pending' | 'paid'
}) {
  const { subject, html } = tmpl.payoutRecordedExpert(params)
  await send(params.expertEmail, subject, html)
}

export async function sendContactEmail(params: {
  name: string
  email: string
  company?: string
  budget?: string
  message: string
  inquiryType?: string
  theme?: string
  intent?: string
}) {
  const to = process.env.CONTACT_EMAIL ?? process.env.EMAIL_FROM_ADDRESS!

  const subjectPrefix =
    params.inquiryType === 'theme-purchase' && params.theme
      ? `Theme purchase (${params.theme})`
      : params.inquiryType === 'theme-demo' && params.theme
      ? `Theme demo request (${params.theme})`
      : 'New enquiry'

  const subject = `${subjectPrefix} — ${params.name}${params.company ? ` at ${params.company}` : ''}`

  await resend.emails.send({
    from: FROM,
    to,
    replyTo: params.email,
    subject,
    html: [
      params.inquiryType
        ? `<p><strong>Inquiry type:</strong> ${params.inquiryType}</p>`
        : '',
      params.theme
        ? `<p><strong>Theme:</strong> ${params.theme}${params.intent ? ` (${params.intent})` : ''}</p>`
        : '',
      `<p><strong>Name:</strong> ${params.name}</p>`,
      `<p><strong>Email:</strong> ${params.email}</p>`,
      params.company ? `<p><strong>Company:</strong> ${params.company}</p>` : '',
      params.budget ? `<p><strong>Budget:</strong> ${params.budget}</p>` : '',
      `<p><strong>Message:</strong></p>`,
      `<p style="white-space:pre-wrap">${params.message}</p>`,
    ]
      .filter(Boolean)
      .join(''),
  })
}

export async function sendOrderConfirmationEmail(params: {
  to: string
  name: string
  orderId: string
  totalCents: number
  currency: string
  deliverableCount: number
}) {
  const formattedTotal = `${(params.totalCents / 100).toFixed(2)} ${params.currency}`
  const subject = `Your order has been received — ${formattedTotal}`

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject,
    html: [
      `<p>Hi ${params.name},</p>`,
      `<p>We've received your order of <strong>${formattedTotal}</strong>. Our team will be in touch shortly.</p>`,
      params.deliverableCount > 0
        ? `<p>We'll deliver your ${params.deliverableCount === 1 ? 'item' : `${params.deliverableCount} items`} as soon as possible.</p>`
        : '',
      `<p>Your order reference: <code>${params.orderId}</code></p>`,
      `<p>— ${process.env.EMAIL_FROM_NAME}</p>`,
    ]
      .filter(Boolean)
      .join(''),
  })
}

export async function sendInviteEmail(params: {
  to: string
  name: string
  token: string
  orgName: string
}) {
  const url = `${process.env.WEB_URL}/invite/${params.token}`
  const { subject, html } = tmpl.inviteUser({ name: params.name, orgName: params.orgName, inviteUrl: url })
  await send(params.to, subject, html)
}

export async function sendPasswordResetEmail(params: {
  to: string
  name: string
  token: string
}) {
  const url = `${process.env.WEB_URL}/reset-password/${params.token}`
  const { subject, html } = tmpl.passwordResetRequest({ name: params.name, resetUrl: url })
  await send(params.to, subject, html)
}

export async function emailTestimonialRequest(params: {
  clientEmail: string
  clientName: string
  serviceTitle: string
  token: string
}) {
  const url = `${process.env.WEB_URL}/testimonials/submit/${params.token}`
  const { subject, html } = tmpl.testimonialRequestClient({
    clientName: params.clientName,
    serviceTitle: params.serviceTitle,
    submitUrl: url,
  })
  await send(params.clientEmail, subject, html)
}
