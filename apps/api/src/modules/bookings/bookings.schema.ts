import { z } from 'zod'

export const createBookingServiceSchema = z.object({
  slug: z.string().min(2).max(80),
  title: z.string().min(2).max(120),
  tagline: z.string().min(2).max(200),
  description: z.string().min(10),
  category: z.enum(['consultation', 'strategy', 'design_review', 'technical', 'onboarding', 'other']),
  durationMinutes: z.number().int().min(15).max(480),
  priceCents: z.number().int().min(0),
  color: z.string().default('#6366f1'),
  active: z.boolean().default(true),
  maxAdvanceDays: z.number().int().min(1).max(365).default(30),
  minNoticeHours: z.number().int().min(0).max(168).default(24),
  meetingPlatform: z.string().default('Google Meet'),
  sortOrder: z.number().int().default(0),
})

export const updateBookingServiceSchema = createBookingServiceSchema.partial()

export const createSlotSchema = z.object({
  bookingServiceId: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
})

export const bulkCreateSlotsSchema = z.object({
  bookingServiceId: z.string().uuid(),
  slots: z.array(
    z.object({
      startsAt: z.string().datetime(),
      endsAt: z.string().datetime(),
    }),
  ).min(1).max(50),
})

export const placeBookingSchema = z.object({
  slotId: z.string().uuid(),
  clientNotes: z.string().max(1000).optional(),
})

export const confirmBookingSchema = z.object({
  meetingUrl: z.string().url().optional(),
  adminNotes: z.string().max(1000).optional(),
})

export const cancelBookingSchema = z.object({
  reason: z.string().min(1).max(500),
})
