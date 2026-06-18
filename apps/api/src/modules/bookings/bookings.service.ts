import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../../db/client'
import { bookingServices, bookingSlots, bookings, users } from '../../db/schema'
import { AppError } from '../../lib/errors'
import type { AccessTokenPayload } from '../../lib/tokens'
import { emailBookingPlaced, emailBookingConfirmed } from '../../lib/email'
import { notify } from '../../lib/notify'

// ─── Public: list active booking services ────────────────────────────────────

export async function listServices() {
  return db
    .select()
    .from(bookingServices)
    .where(eq(bookingServices.active, true))
    .orderBy(asc(bookingServices.sortOrder), asc(bookingServices.title))
}

export async function getServiceBySlug(slug: string) {
  const [svc] = await db
    .select()
    .from(bookingServices)
    .where(and(eq(bookingServices.slug, slug), eq(bookingServices.active, true)))
    .limit(1)
  if (!svc) throw new AppError('Booking service not found', 404)
  return svc
}

// ─── Public: available slots for a service ───────────────────────────────────

export async function listAvailableSlots(serviceId: string, from?: string, to?: string) {
  const now = new Date()
  const fromDate = from ? new Date(from) : now
  const toDate = to ? new Date(to) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  return db
    .select()
    .from(bookingSlots)
    .where(
      and(
        eq(bookingSlots.bookingServiceId, serviceId),
        eq(bookingSlots.status, 'available'),
        gte(bookingSlots.startsAt, fromDate),
        lte(bookingSlots.startsAt, toDate),
      ),
    )
    .orderBy(asc(bookingSlots.startsAt))
}

// ─── Client: place booking ────────────────────────────────────────────────────

export async function placeBooking(
  auth: AccessTokenPayload,
  slotId: string,
  clientNotes?: string,
) {
  const [slot] = await db
    .select()
    .from(bookingSlots)
    .where(and(eq(bookingSlots.id, slotId), eq(bookingSlots.status, 'available')))
    .limit(1)

  if (!slot) throw new AppError('Slot not found or no longer available', 404)

  const [svc] = await db
    .select()
    .from(bookingServices)
    .where(eq(bookingServices.id, slot.bookingServiceId))
    .limit(1)

  if (!svc || !svc.active) throw new AppError('Booking service not found', 404)

  // Check min notice
  const hoursUntilSlot = (slot.startsAt.getTime() - Date.now()) / 3600000
  if (hoursUntilSlot < svc.minNoticeHours) {
    throw new AppError(`Bookings require at least ${svc.minNoticeHours} hours notice`, 400)
  }

  // Mark slot as booked atomically
  const [updatedSlot] = await db
    .update(bookingSlots)
    .set({ status: 'booked' })
    .where(and(eq(bookingSlots.id, slotId), eq(bookingSlots.status, 'available')))
    .returning()

  if (!updatedSlot) throw new AppError('Slot was just taken — please choose another', 409)

  const [booking] = await db
    .insert(bookings)
    .values({
      bookingServiceId: svc.id,
      slotId,
      clientId: auth.userId,
      status: 'pending',
      priceCents: svc.priceCents,
      currency: svc.currency,
      clientNotes: clientNotes ?? null,
    })
    .returning()

  // Email client + admin (fire-and-forget)
  ;(async () => {
    const [client] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, auth.userId)).limit(1)
    if (client) {
      await emailBookingPlaced({
        clientEmail: client.email,
        clientName: client.name,
        serviceTitle: svc.title,
        slotStartsAt: slot.startsAt,
        durationMinutes: svc.durationMinutes,
      })
    }
  })().catch(() => {})

  return { ...booking, service: svc, slot: updatedSlot }
}

// ─── Client: my bookings ──────────────────────────────────────────────────────

export async function listMyBookings(auth: AccessTokenPayload) {
  return db
    .select({
      booking: bookings,
      serviceTitle: bookingServices.title,
      serviceSlug: bookingServices.slug,
      serviceDuration: bookingServices.durationMinutes,
      serviceColor: bookingServices.color,
      slotStartsAt: bookingSlots.startsAt,
      slotEndsAt: bookingSlots.endsAt,
    })
    .from(bookings)
    .innerJoin(bookingServices, eq(bookings.bookingServiceId, bookingServices.id))
    .innerJoin(bookingSlots, eq(bookings.slotId, bookingSlots.id))
    .where(eq(bookings.clientId, auth.userId))
    .orderBy(desc(bookingSlots.startsAt))
}

// ─── Client: get single booking ──────────────────────────────────────────────

export async function getMyBookingById(auth: AccessTokenPayload, bookingId: string) {
  const [row] = await db
    .select({
      booking: bookings,
      serviceTitle: bookingServices.title,
      serviceSlug: bookingServices.slug,
      serviceDuration: bookingServices.durationMinutes,
      serviceMeetingPlatform: bookingServices.meetingPlatform,
      serviceColor: bookingServices.color,
      slotStartsAt: bookingSlots.startsAt,
      slotEndsAt: bookingSlots.endsAt,
    })
    .from(bookings)
    .innerJoin(bookingServices, eq(bookings.bookingServiceId, bookingServices.id))
    .innerJoin(bookingSlots, eq(bookings.slotId, bookingSlots.id))
    .where(and(eq(bookings.id, bookingId), eq(bookings.clientId, auth.userId)))
    .limit(1)

  if (!row) throw new AppError('Booking not found', 404)
  return row
}

// ─── Client: cancel booking ───────────────────────────────────────────────────

export async function cancelMyBooking(auth: AccessTokenPayload, bookingId: string, reason: string) {
  const [booking] = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.clientId, auth.userId)))
    .limit(1)

  if (!booking) throw new AppError('Booking not found', 404)
  if (['cancelled', 'completed'].includes(booking.status)) {
    throw new AppError('Booking cannot be cancelled in its current status', 400)
  }

  const [updated] = await db
    .update(bookings)
    .set({ status: 'cancelled', cancelReason: reason, cancelledAt: new Date(), updatedAt: new Date() })
    .where(eq(bookings.id, bookingId))
    .returning()

  await db
    .update(bookingSlots)
    .set({ status: 'available' })
    .where(eq(bookingSlots.id, booking.slotId))

  return updated
}

// ─── Admin: CRUD booking services ────────────────────────────────────────────

export async function adminListServices() {
  return db.select().from(bookingServices).orderBy(asc(bookingServices.sortOrder))
}

export async function adminCreateService(data: typeof bookingServices.$inferInsert) {
  const [row] = await db.insert(bookingServices).values(data).returning()
  return row
}

export async function adminUpdateService(id: string, data: Partial<typeof bookingServices.$inferInsert>) {
  const [row] = await db
    .update(bookingServices)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(bookingServices.id, id))
    .returning()
  if (!row) throw new AppError('Booking service not found', 404)
  return row
}

export async function adminDeleteService(id: string) {
  await db.delete(bookingServices).where(eq(bookingServices.id, id))
}

// ─── Admin: slot management ───────────────────────────────────────────────────

export async function adminListSlots(serviceId?: string) {
  const conditions = []
  if (serviceId) conditions.push(eq(bookingSlots.bookingServiceId, serviceId))

  return db
    .select({
      slot: bookingSlots,
      serviceTitle: bookingServices.title,
      serviceColor: bookingServices.color,
    })
    .from(bookingSlots)
    .innerJoin(bookingServices, eq(bookingSlots.bookingServiceId, bookingServices.id))
    .where(conditions.length ? and(...(conditions as [ReturnType<typeof eq>])) : undefined)
    .orderBy(asc(bookingSlots.startsAt))
}

export async function adminBulkCreateSlots(
  serviceId: string,
  slots: { startsAt: string; endsAt: string }[],
) {
  const values = slots.map((s) => ({
    bookingServiceId: serviceId,
    startsAt: new Date(s.startsAt),
    endsAt: new Date(s.endsAt),
    status: 'available' as const,
  }))
  return db.insert(bookingSlots).values(values).returning()
}

export async function adminDeleteSlot(id: string) {
  const [slot] = await db.select().from(bookingSlots).where(eq(bookingSlots.id, id)).limit(1)
  if (!slot) throw new AppError('Slot not found', 404)
  if (slot.status === 'booked') throw new AppError('Cannot delete a booked slot', 400)
  await db.delete(bookingSlots).where(eq(bookingSlots.id, id))
}

// ─── Admin: booking management ────────────────────────────────────────────────

export async function adminListBookings(status?: string) {
  const conditions: ReturnType<typeof eq>[] = []
  if (status) conditions.push(eq(bookings.status, status as typeof bookings.$inferSelect['status']))

  return db
    .select({
      booking: bookings,
      serviceTitle: bookingServices.title,
      serviceColor: bookingServices.color,
      slotStartsAt: bookingSlots.startsAt,
      slotEndsAt: bookingSlots.endsAt,
      clientName: users.name,
      clientEmail: users.email,
    })
    .from(bookings)
    .innerJoin(bookingServices, eq(bookings.bookingServiceId, bookingServices.id))
    .innerJoin(bookingSlots, eq(bookings.slotId, bookingSlots.id))
    .innerJoin(users, eq(bookings.clientId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(bookingSlots.startsAt))
}

export async function adminConfirmBooking(
  auth: AccessTokenPayload,
  id: string,
  meetingUrl?: string,
  adminNotes?: string,
) {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1)
  if (!booking) throw new AppError('Booking not found', 404)
  if (booking.status !== 'pending') throw new AppError('Booking is not pending', 400)

  const [updated] = await db
    .update(bookings)
    .set({
      status: 'confirmed',
      meetingUrl: meetingUrl ?? null,
      adminNotes: adminNotes ?? booking.adminNotes,
      confirmedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, id))
    .returning()

  // Notify client (fire-and-forget)
  notify({
    userId: booking.clientId,
    orgId: auth.orgId,
    type: 'booking_confirmed',
    title: 'Booking confirmed',
    body: 'Your booking has been confirmed. Check your email for details.',
    metadata: { bookingId: id },
  }).catch(() => {})

  // Email client (fire-and-forget)
  ;(async () => {
    const [[client], [svc], [slot]] = await Promise.all([
      db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, booking.clientId)).limit(1),
      db.select({ title: bookingServices.title, durationMinutes: bookingServices.durationMinutes }).from(bookingServices).where(eq(bookingServices.id, booking.bookingServiceId)).limit(1),
      db.select({ startsAt: bookingSlots.startsAt }).from(bookingSlots).where(eq(bookingSlots.id, booking.slotId)).limit(1),
    ])
    if (client && svc && slot) {
      await emailBookingConfirmed({
        clientEmail: client.email,
        clientName: client.name,
        serviceTitle: svc.title,
        slotStartsAt: slot.startsAt,
        durationMinutes: svc.durationMinutes,
        meetingUrl: meetingUrl ?? null,
      })
    }
  })().catch(() => {})

  return updated
}

export async function adminCompleteBooking(id: string) {
  const [updated] = await db
    .update(bookings)
    .set({ status: 'completed', completedAt: new Date(), updatedAt: new Date() })
    .where(eq(bookings.id, id))
    .returning()
  if (!updated) throw new AppError('Booking not found', 404)
  return updated
}

export async function adminMarkNoShow(id: string) {
  const [updated] = await db
    .update(bookings)
    .set({ status: 'no_show', updatedAt: new Date() })
    .where(eq(bookings.id, id))
    .returning()
  if (!updated) throw new AppError('Booking not found', 404)
  return updated
}

export async function adminCancelBooking(id: string, reason: string) {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1)
  if (!booking) throw new AppError('Booking not found', 404)

  const [updated] = await db
    .update(bookings)
    .set({ status: 'cancelled', cancelReason: reason, cancelledAt: new Date(), updatedAt: new Date() })
    .where(eq(bookings.id, id))
    .returning()

  await db
    .update(bookingSlots)
    .set({ status: 'available' })
    .where(eq(bookingSlots.id, booking.slotId))

  return updated
}

export async function adminUpdateBooking(id: string, fields: { meetingUrl?: string | null; adminNotes?: string | null }) {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1)
  if (!booking) throw new AppError('Booking not found', 404)

  const [updated] = await db
    .update(bookings)
    .set({
      ...(fields.meetingUrl !== undefined && { meetingUrl: fields.meetingUrl || null }),
      ...(fields.adminNotes !== undefined && { adminNotes: fields.adminNotes || null }),
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, id))
    .returning()
  return updated
}

// ─── Admin: stats ─────────────────────────────────────────────────────────────

export async function adminBookingStats() {
  const [row] = await db
    .select({
      total: sql<number>`cast(count(*) as int)`,
      pending: sql<number>`cast(sum(case when status = 'pending' then 1 else 0 end) as int)`,
      confirmed: sql<number>`cast(sum(case when status = 'confirmed' then 1 else 0 end) as int)`,
      completed: sql<number>`cast(sum(case when status = 'completed' then 1 else 0 end) as int)`,
    })
    .from(bookings)
  return row
}
