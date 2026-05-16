import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`

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

export async function sendInviteEmail(params: {
  to: string
  name: string
  token: string
  orgName: string
}) {
  const url = `${process.env.WEB_URL}/invite/${params.token}`

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `You've been invited to ${params.orgName}`,
    html: [
      `<p>Hi ${params.name},</p>`,
      `<p>You've been invited to join <strong>${params.orgName}</strong>.</p>`,
      `<p><a href="${url}">Accept your invitation</a></p>`,
      `<p>This link expires in 72 hours.</p>`,
    ].join(''),
  })
}
