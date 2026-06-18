import crypto from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { testimonialRequests, cmsTestimonials } from '../../db/schema/cms'
import { serviceOrders, services } from '../../db/schema/services'
import { users } from '../../db/schema/users'
import { AppError } from '../../lib/errors'
import { emailTestimonialRequest } from '../../lib/email'
import type { AccessTokenPayload } from '../../lib/tokens'

// ─── Admin: send a testimonial request for a completed order ──────────────────

export async function requestTestimonial(
  ctx: AccessTokenPayload,
  orderId: string,
): Promise<{ id: string; token: string; expiresAt: Date }> {
  const order = await db.query.serviceOrders.findFirst({
    where: eq(serviceOrders.id, orderId),
    columns: { id: true, status: true, clientId: true, serviceId: true },
  })
  if (!order) throw new AppError('Order not found', 404)
  if (order.status !== 'completed') throw new AppError('Testimonial requests can only be sent for completed orders', 400)

  const [client, service] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, order.clientId), columns: { name: true, email: true } }),
    db.query.services.findFirst({ where: eq(services.id, order.serviceId), columns: { title: true } }),
  ])
  if (!client || !service) throw new AppError('Order data incomplete', 500)

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const [req] = await db
    .insert(testimonialRequests)
    .values({
      orderId,
      clientId: order.clientId,
      clientName: client.name,
      clientEmail: client.email,
      serviceTitle: service.title,
      token,
      expiresAt,
    })
    .returning({ id: testimonialRequests.id, token: testimonialRequests.token, expiresAt: testimonialRequests.expiresAt })

  ;(async () => {
    await emailTestimonialRequest({
      clientEmail: client.email,
      clientName: client.name,
      serviceTitle: service.title,
      token,
    })
  })().catch(() => {})

  return req
}

// ─── Public: get request info by token ───────────────────────────────────────

export async function getTestimonialRequest(token: string): Promise<{
  clientName: string
  serviceTitle: string
  isValid: boolean
  reason?: string
}> {
  const req = await db.query.testimonialRequests.findFirst({
    where: eq(testimonialRequests.token, token),
    columns: { clientName: true, serviceTitle: true, usedAt: true, expiresAt: true },
  })
  if (!req) return { clientName: '', serviceTitle: '', isValid: false, reason: 'not_found' }
  if (req.usedAt) return { clientName: req.clientName, serviceTitle: req.serviceTitle, isValid: false, reason: 'already_used' }
  if (new Date() > req.expiresAt) return { clientName: req.clientName, serviceTitle: req.serviceTitle, isValid: false, reason: 'expired' }
  return { clientName: req.clientName, serviceTitle: req.serviceTitle, isValid: true }
}

// ─── Public: submit a testimonial ─────────────────────────────────────────────

export async function submitTestimonial(
  token: string,
  data: { rating: number; quote: string; role?: string },
): Promise<{ id: string }> {
  const req = await db.query.testimonialRequests.findFirst({
    where: eq(testimonialRequests.token, token),
  })
  if (!req) throw new AppError('Invalid or expired link', 404)
  if (req.usedAt) throw new AppError('This link has already been used', 400)
  if (new Date() > req.expiresAt) throw new AppError('This link has expired', 400)

  if (data.rating < 1 || data.rating > 5) throw new AppError('Rating must be between 1 and 5', 400)
  if (!data.quote.trim()) throw new AppError('Please share a few words about your experience', 400)

  const [testimonial] = await db
    .insert(cmsTestimonials)
    .values({
      client: req.clientName,
      role: data.role?.trim() || null,
      quote: data.quote.trim(),
      rating: data.rating,
      status: 'draft',
    })
    .returning({ id: cmsTestimonials.id })

  await db
    .update(testimonialRequests)
    .set({ usedAt: new Date() })
    .where(eq(testimonialRequests.token, token))

  return { id: testimonial.id }
}
