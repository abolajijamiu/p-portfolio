import Stripe from 'stripe'
import type { Session } from 'stripe/cjs/resources/Checkout/Sessions.js'
import { and, eq } from 'drizzle-orm'
import { db } from '../../db/client'
import {
  serviceOrders, servicePackages, services, users,
  resourcePurchases, resourceLicenses, resources,
  bookings, bookingSlots, bookingServices,
} from '../../db/schema'
import { AppError } from '../../lib/errors'
import type { AccessTokenPayload } from '../../lib/tokens'
import { notify } from '../../lib/notify'
import { emailServiceOrderPlaced } from '../../lib/email'
import crypto from 'node:crypto'

function generateDownloadToken() {
  return crypto.randomBytes(32).toString('hex')
}
function generateLicenseKey() {
  const seg = () => crypto.randomBytes(2).toString('hex').toUpperCase()
  return `ETECH-${seg()}${seg()}-${seg()}${seg()}-${seg()}${seg()}-${seg()}${seg()}`
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new AppError('Stripe is not configured', 503)
  return new Stripe(key, { apiVersion: '2026-05-27.dahlia' })
}

const SITE_URL = process.env.WEB_URL?.split(',')[0]?.trim() ?? 'http://localhost:3002'

// ─── Create Stripe Checkout session for a service-order ─────────────────────

export async function createCheckout(auth: AccessTokenPayload, packageId: string) {
  const stripe = getStripe()

  // Validate package + service
  const [pkgRow] = await db
    .select({
      id: servicePackages.id,
      serviceId: servicePackages.serviceId,
      name: servicePackages.name,
      priceCents: servicePackages.priceCents,
      currency: servicePackages.currency,
      serviceTitle: services.title,
    })
    .from(servicePackages)
    .innerJoin(services, eq(services.id, servicePackages.serviceId))
    .where(eq(servicePackages.id, packageId))
    .limit(1)

  if (!pkgRow) throw new AppError('Package not found', 404)

  // Generate order number
  const year = new Date().getFullYear()
  const existing = await db.select({ id: serviceOrders.id }).from(serviceOrders)
  const seq = String(existing.length + 1).padStart(4, '0')
  const orderNumber = `SO-${year}-${seq}`

  // Create order in pending state before sending to Stripe
  const [order] = await db
    .insert(serviceOrders)
    .values({
      orderNumber,
      serviceId: pkgRow.serviceId,
      packageId: pkgRow.id,
      clientId: auth.userId,
      status: 'pending',
      priceCents: pkgRow.priceCents,
      currency: pkgRow.currency,
    })
    .returning()

  // Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: pkgRow.currency.toLowerCase(),
          unit_amount: pkgRow.priceCents,
          product_data: {
            name: `${pkgRow.serviceTitle} — ${pkgRow.name}`,
            description: `Order ${orderNumber}`,
          },
        },
      },
    ],
    client_reference_id: order.id,
    customer_email: auth.sub,
    success_url: `${SITE_URL}/orders/${order.id}?payment=success`,
    cancel_url: `${SITE_URL}/orders/${order.id}?payment=cancelled`,
    metadata: {
      orderId: order.id,
      orderNumber,
      packageId: pkgRow.id,
      serviceId: pkgRow.serviceId,
    },
  })

  // Persist Stripe session ID
  await db
    .update(serviceOrders)
    .set({ stripeSessionId: session.id })
    .where(eq(serviceOrders.id, order.id))

  return { orderId: order.id, checkoutUrl: session.url! }
}

// ─── Handle checkout.session.completed webhook ───────────────────────────────

export async function handleCheckoutComplete(session: Session) {
  const orderId = session.metadata?.orderId ?? session.client_reference_id
  if (!orderId) return

  const [order] = await db
    .select({
      id: serviceOrders.id,
      status: serviceOrders.status,
      clientId: serviceOrders.clientId,
      orderNumber: serviceOrders.orderNumber,
      serviceId: serviceOrders.serviceId,
      packageId: serviceOrders.packageId,
      priceCents: serviceOrders.priceCents,
      currency: serviceOrders.currency,
    })
    .from(serviceOrders)
    .where(eq(serviceOrders.id, orderId))
    .limit(1)

  if (!order || order.status !== 'pending') return

  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : null

  await db
    .update(serviceOrders)
    .set({ status: 'payment_received', stripePaymentIntentId: paymentIntentId })
    .where(eq(serviceOrders.id, order.id))

  // Fetch client + service info for email
  const [client] = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, order.clientId))
    .limit(1)

  const [pkgRow] = await db
    .select({ name: servicePackages.name, serviceTitle: services.title })
    .from(servicePackages)
    .innerJoin(services, eq(services.id, servicePackages.serviceId))
    .where(eq(servicePackages.id, order.packageId))
    .limit(1)

  notify({
    userId: order.clientId,
    orgId: '',
    type: 'order_placed',
    title: `Payment confirmed — ${order.orderNumber}`,
    body: "Your payment was received. We'll assign an expert shortly.",
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
  }).catch(() => {})

  if (client && pkgRow) {
    emailServiceOrderPlaced({
      clientEmail: client.email,
      clientName: client.name,
      orderNumber: order.orderNumber,
      serviceTitle: pkgRow.serviceTitle,
      packageName: pkgRow.name,
      priceCents: order.priceCents,
      currency: order.currency,
    }).catch(() => {})
  }
}

// ─── Resource purchase checkout ───────────────────────────────────────────────

export async function createResourceCheckout(auth: AccessTokenPayload, licenseId: string) {
  const stripe = getStripe()

  const [license] = await db
    .select({
      id: resourceLicenses.id,
      name: resourceLicenses.name,
      priceCents: resourceLicenses.priceCents,
      currency: resourceLicenses.currency,
      resourceId: resourceLicenses.resourceId,
      resourceTitle: resources.title,
      maxDownloads: resourceLicenses.maxDownloads,
    })
    .from(resourceLicenses)
    .innerJoin(resources, eq(resources.id, resourceLicenses.resourceId))
    .where(eq(resourceLicenses.id, licenseId))
    .limit(1)

  if (!license) throw new AppError('License not found', 404)

  // Check for existing active purchase
  const [existing] = await db
    .select({ id: resourcePurchases.id, status: resourcePurchases.status })
    .from(resourcePurchases)
    .where(
      and(
        eq(resourcePurchases.userId, auth.userId),
        eq(resourcePurchases.licenseId, licenseId),
      ),
    )
    .limit(1)

  if (existing?.status === 'active') throw new AppError('You already own this license', 409)

  // Create a pending purchase record
  const [purchase] = await db
    .insert(resourcePurchases)
    .values({
      userId: auth.userId,
      resourceId: license.resourceId,
      licenseId: license.id,
      pricePaidCents: license.priceCents,
      currency: license.currency,
      maxDownloads: license.maxDownloads,
      downloadToken: generateDownloadToken(),
      licenseKey: generateLicenseKey(),
    })
    .returning()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: license.currency.toLowerCase(),
          unit_amount: license.priceCents,
          product_data: {
            name: `${license.resourceTitle} — ${license.name} License`,
          },
        },
      },
    ],
    client_reference_id: purchase.id,
    customer_email: auth.sub,
    success_url: `${SITE_URL}/purchases?payment=success`,
    cancel_url: `${SITE_URL}/resources/${license.resourceId}?payment=cancelled`,
    metadata: {
      type: 'resource_purchase',
      purchaseId: purchase.id,
      licenseId: license.id,
      resourceId: license.resourceId,
    },
  })

  await db
    .update(resourcePurchases)
    .set({ stripeSessionId: session.id })
    .where(eq(resourcePurchases.id, purchase.id))

  return { purchaseId: purchase.id, checkoutUrl: session.url! }
}

export async function handleResourceCheckoutComplete(session: Session) {
  const purchaseId = session.metadata?.purchaseId ?? session.client_reference_id
  if (!purchaseId) return

  const [purchase] = await db
    .select({ id: resourcePurchases.id, status: resourcePurchases.status, userId: resourcePurchases.userId })
    .from(resourcePurchases)
    .where(eq(resourcePurchases.id, purchaseId))
    .limit(1)

  if (!purchase || purchase.status !== 'pending_payment') return

  await db
    .update(resourcePurchases)
    .set({ status: 'active', activatedAt: new Date() })
    .where(eq(resourcePurchases.id, purchase.id))

  notify({
    userId: purchase.userId,
    orgId: '',
    type: 'order_received',
    title: 'Purchase confirmed — ready to download',
    body: 'Your download is now available in your purchases.',
    metadata: { purchaseId: purchase.id },
  }).catch(() => {})
}

// ─── Booking checkout ─────────────────────────────────────────────────────────

export async function createBookingCheckout(auth: AccessTokenPayload, slotId: string, clientNotes?: string) {
  const stripe = getStripe()

  // Validate slot + service
  const [slotRow] = await db
    .select({
      id: bookingSlots.id,
      status: bookingSlots.status,
      startsAt: bookingSlots.startsAt,
      serviceId: bookingSlots.bookingServiceId,
      serviceTitle: bookingServices.title,
      priceCents: bookingServices.priceCents,
      currency: bookingServices.currency,
      durationMinutes: bookingServices.durationMinutes,
    })
    .from(bookingSlots)
    .innerJoin(bookingServices, eq(bookingServices.id, bookingSlots.bookingServiceId))
    .where(eq(bookingSlots.id, slotId))
    .limit(1)

  if (!slotRow) throw new AppError('Slot not found', 404)
  if (slotRow.status !== 'available') throw new AppError('Slot is no longer available', 409)

  // Create pending booking
  const [booking] = await db
    .insert(bookings)
    .values({
      bookingServiceId: slotRow.serviceId,
      slotId: slotRow.id,
      clientId: auth.userId,
      status: 'pending',
      priceCents: slotRow.priceCents,
      currency: slotRow.currency,
      clientNotes: clientNotes ?? null,
    })
    .returning()

  // Mark slot as booked to prevent double-booking
  await db.update(bookingSlots).set({ status: 'booked' }).where(eq(bookingSlots.id, slotId))

  const slotDate = new Date(slotRow.startsAt).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: slotRow.currency.toLowerCase(),
          unit_amount: slotRow.priceCents,
          product_data: {
            name: `${slotRow.serviceTitle} — ${slotRow.durationMinutes} min`,
            description: slotDate,
          },
        },
      },
    ],
    client_reference_id: booking.id,
    customer_email: auth.sub,
    success_url: `${SITE_URL}/bookings/${booking.id}?payment=success`,
    cancel_url: `${SITE_URL}/book?payment=cancelled`,
    metadata: {
      type: 'booking',
      bookingId: booking.id,
      slotId,
      serviceId: slotRow.serviceId,
    },
  })

  await db
    .update(bookings)
    .set({ stripeSessionId: session.id })
    .where(eq(bookings.id, booking.id))

  return { bookingId: booking.id, checkoutUrl: session.url! }
}

export async function handleBookingCheckoutComplete(session: Session) {
  const bookingId = session.metadata?.bookingId ?? session.client_reference_id
  if (!bookingId) return

  const [booking] = await db
    .select({ id: bookings.id, status: bookings.status, clientId: bookings.clientId })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (!booking || booking.status !== 'pending') return

  await db
    .update(bookings)
    .set({ status: 'confirmed', confirmedAt: new Date() })
    .where(eq(bookings.id, booking.id))

  notify({
    userId: booking.clientId,
    orgId: '',
    type: 'booking_confirmed',
    title: 'Booking confirmed',
    body: 'Your session is confirmed. We\'ll send the meeting link shortly.',
    metadata: { bookingId: booking.id },
  }).catch(() => {})
}
