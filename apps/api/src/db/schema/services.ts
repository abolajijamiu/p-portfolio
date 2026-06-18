import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { id, timestamps } from './common'
import {
  contentStatusEnum,
  serviceCategoryEnum,
  serviceOrderStatusEnum,
  orderMessageTypeEnum,
} from './enums'
import { users } from './users'

// ─── Service catalog ──────────────────────────────────────────────────────────

export const services = pgTable(
  'services',
  {
    ...id,
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    tagline: text('tagline').notNull(),
    description: text('description').notNull(),
    category: serviceCategoryEnum('category').notNull(),
    status: contentStatusEnum('status').notNull().default('draft'),
    featured: boolean('featured').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    coverImage: text('cover_image'),
    ...timestamps,
  },
  (t) => ({
    categoryIdx: index('services_category_idx').on(t.category),
    statusIdx: index('services_status_idx').on(t.status),
    slugUniq: uniqueIndex('services_slug_uniq').on(t.slug),
  }),
)

export const servicePackages = pgTable(
  'service_packages',
  {
    ...id,
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description').notNull(),
    priceCents: integer('price_cents').notNull(),
    currency: text('currency').notNull().default('USD'),
    deliveryDays: integer('delivery_days').notNull(),
    revisions: integer('revisions').notNull().default(1),
    includes: jsonb('includes').$type<string[]>().notNull().default([]),
    sortOrder: integer('sort_order').notNull().default(0),
    active: boolean('active').notNull().default(true),
    ...timestamps,
  },
  (t) => ({
    serviceIdx: index('service_packages_service_idx').on(t.serviceId),
  }),
)

export const serviceFaqs = pgTable('service_faqs', {
  ...id,
  serviceId: uuid('service_id')
    .notNull()
    .references(() => services.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const serviceRequirements = pgTable('service_requirements', {
  ...id,
  serviceId: uuid('service_id')
    .notNull()
    .references(() => services.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  description: text('description'),
  fieldType: text('field_type').notNull().default('text'),
  required: boolean('required').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
})

// ─── Service orders ───────────────────────────────────────────────────────────

export const serviceOrders = pgTable(
  'service_orders',
  {
    ...id,
    orderNumber: text('order_number').notNull().unique(),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id),
    packageId: uuid('package_id')
      .notNull()
      .references(() => servicePackages.id),
    clientId: uuid('client_id')
      .notNull()
      .references(() => users.id),
    assignedExpertId: uuid('assigned_expert_id').references(() => users.id, { onDelete: 'set null' }),
    status: serviceOrderStatusEnum('status').notNull().default('pending'),
    priceCents: integer('price_cents').notNull(),
    currency: text('currency').notNull().default('USD'),
    requirementsData: jsonb('requirements_data').$type<Record<string, string>>().default({}),
    requirementsSubmittedAt: timestamp('requirements_submitted_at', { withTimezone: true }),
    assignedAt: timestamp('assigned_at', { withTimezone: true }),
    dueDate: date('due_date'),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancelReason: text('cancel_reason'),
    internalNotes: text('internal_notes'),
    stripeSessionId: text('stripe_session_id'),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    revisionCount: integer('revision_count').notNull().default(0),
    ...timestamps,
  },
  (t) => ({
    clientIdx: index('service_orders_client_idx').on(t.clientId),
    statusIdx: index('service_orders_status_idx').on(t.status),
    expertIdx: index('service_orders_expert_idx').on(t.assignedExpertId),
    orderNumberUniq: uniqueIndex('service_orders_order_number_uniq').on(t.orderNumber),
  }),
)

export const serviceOrderMessages = pgTable(
  'service_order_messages',
  {
    ...id,
    orderId: uuid('order_id')
      .notNull()
      .references(() => serviceOrders.id, { onDelete: 'cascade' }),
    senderId: uuid('sender_id')
      .notNull()
      .references(() => users.id),
    type: orderMessageTypeEnum('type').notNull().default('message'),
    body: text('body'),
    attachments: jsonb('attachments').$type<{ key: string; name: string; size: number; url?: string }[]>().default([]),
    isReadByClient: boolean('is_read_by_client').notNull().default(false),
    isReadByExpert: boolean('is_read_by_expert').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    orderIdx: index('service_order_messages_order_idx').on(t.orderId),
    createdIdx: index('service_order_messages_created_idx').on(t.createdAt),
  }),
)

export const serviceOrderMilestones = pgTable(
  'service_order_milestones',
  {
    ...id,
    orderId: uuid('order_id')
      .notNull()
      .references(() => serviceOrders.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    dueDate: date('due_date'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    orderIdx: index('service_order_milestones_order_idx').on(t.orderId),
  }),
)

export const serviceOrderDeliveries = pgTable(
  'service_order_deliveries',
  {
    ...id,
    orderId: uuid('order_id')
      .notNull()
      .references(() => serviceOrders.id, { onDelete: 'cascade' }),
    deliveredBy: uuid('delivered_by')
      .notNull()
      .references(() => users.id),
    message: text('message').notNull(),
    files: jsonb('files').$type<{ key: string; name: string; size: number; url?: string }[]>().notNull().default([]),
    isRevisionDelivery: boolean('is_revision_delivery').notNull().default(false),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    orderIdx: index('service_order_deliveries_order_idx').on(t.orderId),
  }),
)
