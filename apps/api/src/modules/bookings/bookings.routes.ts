import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import { validate } from '../../middleware/validate'
import * as svc from './bookings.service'
import { createBookingCheckout } from '../stripe/stripe.service'
import {
  placeBookingSchema,
  confirmBookingSchema,
  cancelBookingSchema,
  createBookingServiceSchema,
  updateBookingServiceSchema,
  bulkCreateSlotsSchema,
} from './bookings.schema'

// ─── Public routes — /booking-services ───────────────────────────────────────

export const bookingServicesRouter = Router()

// GET /booking-services
bookingServicesRouter.get('/', async (_req, res, next) => {
  try {
    res.json(await svc.listServices())
  } catch (err) {
    next(err)
  }
})

// GET /booking-services/:slug
bookingServicesRouter.get('/:slug', async (req, res, next) => {
  try {
    res.json(await svc.getServiceBySlug(req.params.slug))
  } catch (err) {
    next(err)
  }
})

// GET /booking-services/:id/slots?from=&to=
bookingServicesRouter.get('/:id/slots', async (req, res, next) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string }
    res.json(await svc.listAvailableSlots(req.params.id as string, from, to))
  } catch (err) {
    next(err)
  }
})

// ─── Client portal routes — /bookings ────────────────────────────────────────

export const bookingsRouter = Router()
bookingsRouter.use(authenticate)

// GET /bookings/mine
bookingsRouter.get('/mine', async (req, res, next) => {
  try {
    res.json(await svc.listMyBookings(req.auth))
  } catch (err) {
    next(err)
  }
})

// GET /bookings/:id
bookingsRouter.get('/:id', async (req, res, next) => {
  try {
    res.json(await svc.getMyBookingById(req.auth, req.params.id as string))
  } catch (err) {
    next(err)
  }
})

// POST /bookings/checkout — create booking + Stripe Checkout session
bookingsRouter.post('/checkout', async (req, res, next) => {
  try {
    const { slotId, clientNotes } = req.body as { slotId: string; clientNotes?: string }
    if (!slotId) { res.status(400).json({ error: 'slotId required' }); return }
    res.json(await createBookingCheckout(req.auth, slotId, clientNotes))
  } catch (err) {
    next(err)
  }
})

// POST /bookings — direct booking (free slots or admin/legacy)
bookingsRouter.post('/', validate(placeBookingSchema), async (req, res, next) => {
  try {
    const { slotId, clientNotes } = req.body
    res.status(201).json(await svc.placeBooking(req.auth, slotId, clientNotes))
  } catch (err) {
    next(err)
  }
})

// POST /bookings/:id/cancel
bookingsRouter.post('/:id/cancel', validate(cancelBookingSchema), async (req, res, next) => {
  try {
    res.json(await svc.cancelMyBooking(req.auth, req.params.id as string, req.body.reason))
  } catch (err) {
    next(err)
  }
})

// POST /bookings/:id/reschedule
bookingsRouter.post('/:id/reschedule', async (req, res, next) => {
  try {
    res.json(await svc.rescheduleMyBooking(req.auth, req.params.id as string, req.body.slotId))
  } catch (err) {
    next(err)
  }
})

// ─── Admin routes — /cms/bookings ─────────────────────────────────────────────

export const cmsBookingsRouter = Router()
const guard = [authenticate, authorize('admin')]

// GET /cms/bookings
cmsBookingsRouter.get('/', ...guard, async (req, res, next) => {
  try {
    const { status } = req.query as { status?: string }
    res.json(await svc.adminListBookings(status))
  } catch (err) {
    next(err)
  }
})

// GET /cms/bookings/stats
cmsBookingsRouter.get('/stats', ...guard, async (_req, res, next) => {
  try {
    res.json(await svc.adminBookingStats())
  } catch (err) {
    next(err)
  }
})

// PATCH /cms/bookings/:id
const updateBookingSchema = z.object({
  meetingUrl: z.string().url().nullish(),
  adminNotes: z.string().nullish(),
}).refine((d) => d.meetingUrl !== undefined || d.adminNotes !== undefined, {
  message: 'At least one field required',
})
cmsBookingsRouter.patch('/:id', ...guard, validate(updateBookingSchema), async (req, res, next) => {
  try {
    const { meetingUrl, adminNotes } = req.body
    res.json(await svc.adminUpdateBooking(req.params.id as string, { meetingUrl, adminNotes }))
  } catch (err) {
    next(err)
  }
})

// POST /cms/bookings/:id/session-notes
cmsBookingsRouter.post('/:id/session-notes', ...guard, async (req, res, next) => {
  try {
    const { sessionNotes, recordingUrl } = req.body as { sessionNotes?: string; recordingUrl?: string }
    res.json(await svc.adminAddSessionNotes(req.params.id as string, { sessionNotes, recordingUrl }))
  } catch (err) {
    next(err)
  }
})

// POST /cms/bookings/:id/confirm
cmsBookingsRouter.post('/:id/confirm', ...guard, validate(confirmBookingSchema), async (req, res, next) => {
  try {
    const { meetingUrl, adminNotes } = req.body
    res.json(await svc.adminConfirmBooking(req.auth, req.params.id as string, meetingUrl, adminNotes))
  } catch (err) {
    next(err)
  }
})

// POST /cms/bookings/:id/complete
cmsBookingsRouter.post('/:id/complete', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.adminCompleteBooking(req.params.id as string))
  } catch (err) {
    next(err)
  }
})

// POST /cms/bookings/:id/no-show
cmsBookingsRouter.post('/:id/no-show', ...guard, async (req, res, next) => {
  try {
    res.json(await svc.adminMarkNoShow(req.params.id as string))
  } catch (err) {
    next(err)
  }
})

// POST /cms/bookings/:id/cancel
cmsBookingsRouter.post('/:id/cancel', ...guard, validate(cancelBookingSchema), async (req, res, next) => {
  try {
    res.json(await svc.adminCancelBooking(req.params.id as string, req.body.reason))
  } catch (err) {
    next(err)
  }
})

// ─── Admin routes — /cms/booking-services ────────────────────────────────────

export const cmsBookingServicesRouter = Router()

// GET /cms/booking-services
cmsBookingServicesRouter.get('/', ...guard, async (_req, res, next) => {
  try {
    res.json(await svc.adminListServices())
  } catch (err) {
    next(err)
  }
})

// POST /cms/booking-services
cmsBookingServicesRouter.post('/', ...guard, validate(createBookingServiceSchema), async (req, res, next) => {
  try {
    res.status(201).json(await svc.adminCreateService(req.body))
  } catch (err) {
    next(err)
  }
})

// PATCH /cms/booking-services/:id
cmsBookingServicesRouter.patch('/:id', ...guard, validate(updateBookingServiceSchema), async (req, res, next) => {
  try {
    res.json(await svc.adminUpdateService(req.params.id as string, req.body))
  } catch (err) {
    next(err)
  }
})

// DELETE /cms/booking-services/:id
cmsBookingServicesRouter.delete('/:id', ...guard, async (req, res, next) => {
  try {
    await svc.adminDeleteService(req.params.id as string)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ─── Admin routes — /cms/booking-slots ───────────────────────────────────────

export const cmsBookingSlotsRouter = Router()

// GET /cms/booking-slots?serviceId=
cmsBookingSlotsRouter.get('/', ...guard, async (req, res, next) => {
  try {
    const { serviceId } = req.query as { serviceId?: string }
    res.json(await svc.adminListSlots(serviceId))
  } catch (err) {
    next(err)
  }
})

// POST /cms/booking-slots/bulk
cmsBookingSlotsRouter.post('/bulk', ...guard, validate(bulkCreateSlotsSchema), async (req, res, next) => {
  try {
    const { bookingServiceId, slots } = req.body
    res.status(201).json(await svc.adminBulkCreateSlots(bookingServiceId, slots))
  } catch (err) {
    next(err)
  }
})

// DELETE /cms/booking-slots/:id
cmsBookingSlotsRouter.delete('/:id', ...guard, async (req, res, next) => {
  try {
    await svc.adminDeleteSlot(req.params.id as string)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
