import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { id, timestamps } from './common'
import { bookingStatusEnum, bookingSlotStatusEnum, bookingCategoryEnum } from './enums'
import { users } from './users'

// ─── Booking services ─────────────────────────────────────────────────────────

export const bookingServices = pgTable(
  'booking_services',
  {
    ...id,
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    tagline: text('tagline').notNull(),
    description: text('description').notNull(),
    category: bookingCategoryEnum('category').notNull().default('consultation'),
    durationMinutes: integer('duration_minutes').notNull().default(30),
    priceCents: integer('price_cents').notNull().default(0),
    currency: text('currency').notNull().default('USD'),
    color: text('color').notNull().default('#6366f1'),
    active: boolean('active').notNull().default(true),
    maxAdvanceDays: integer('max_advance_days').notNull().default(30),
    minNoticeHours: integer('min_notice_hours').notNull().default(24),
    meetingPlatform: text('meeting_platform').notNull().default('Google Meet'),
    sortOrder: integer('sort_order').notNull().default(0),
    ...timestamps,
  },
  (t) => ({
    slugUniq: uniqueIndex('booking_services_slug_uniq').on(t.slug),
    activeIdx: index('booking_services_active_idx').on(t.active),
  }),
)

// ─── Booking slots — admin-created available windows ─────────────────────────

export const bookingSlots = pgTable(
  'booking_slots',
  {
    ...id,
    bookingServiceId: uuid('booking_service_id')
      .notNull()
      .references(() => bookingServices.id, { onDelete: 'cascade' }),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    status: bookingSlotStatusEnum('status').notNull().default('available'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    serviceIdx: index('booking_slots_service_idx').on(t.bookingServiceId),
    startsIdx: index('booking_slots_starts_idx').on(t.startsAt),
    statusIdx: index('booking_slots_status_idx').on(t.status),
  }),
)

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookings = pgTable(
  'bookings',
  {
    ...id,
    bookingServiceId: uuid('booking_service_id')
      .notNull()
      .references(() => bookingServices.id),
    slotId: uuid('slot_id')
      .notNull()
      .references(() => bookingSlots.id),
    clientId: uuid('client_id')
      .notNull()
      .references(() => users.id),
    status: bookingStatusEnum('status').notNull().default('pending'),
    priceCents: integer('price_cents').notNull().default(0),
    currency: text('currency').notNull().default('USD'),
    clientNotes: text('client_notes'),
    adminNotes: text('admin_notes'),
    stripeSessionId: text('stripe_session_id'),
    meetingUrl: text('meeting_url'),
    cancelReason: text('cancel_reason'),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => ({
    clientIdx: index('bookings_client_idx').on(t.clientId),
    statusIdx: index('bookings_status_idx').on(t.status),
    slotUniq: uniqueIndex('bookings_slot_uniq').on(t.slotId),
  }),
)
