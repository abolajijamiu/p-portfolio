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
import { commerceOrderStatusEnum, deliverableCategoryEnum, deliverableStatusEnum } from './enums'
import { organizations } from './organizations'
import { users } from './users'

export const commerceCustomers = pgTable(
  'commerce_customers',
  {
    ...id,
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    name: text('name').notNull(),
    // Linked if they create a portal account with the same email
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    ...timestamps,
  },
  (t) => ({
    orgEmailUniq: uniqueIndex('commerce_customers_org_email_uniq').on(t.orgId, t.email),
  }),
)

export const commerceOrders = pgTable(
  'commerce_orders',
  {
    ...id,
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => commerceCustomers.id),
    invoiceNumber: text('invoice_number').unique(),
    status: commerceOrderStatusEnum('status').notNull(),
    totalCents: integer('total_cents').notNull(),
    currency: text('currency').notNull().default('USD'),
    provider: text('provider').notNull(), // 'woocommerce' | future providers
    externalId: text('external_id').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    ...timestamps,
  },
  (t) => ({
    providerExternalUniq: uniqueIndex('commerce_orders_provider_external_uniq').on(
      t.orgId,
      t.provider,
      t.externalId,
    ),
    statusIdx: index('commerce_orders_status_idx').on(t.status),
    customerIdx: index('commerce_orders_customer_idx').on(t.customerId),
  }),
)

export const commerceOrderItems = pgTable('commerce_order_items', {
  ...id,
  orderId: uuid('order_id')
    .notNull()
    .references(() => commerceOrders.id, { onDelete: 'cascade' }),
  externalProductId: text('external_product_id').notNull(),
  productName: text('product_name').notNull(),
  priceCents: integer('price_cents').notNull(),
  quantity: integer('quantity').notNull().default(1),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
})

export const deliverableTypes = pgTable(
  'deliverable_types',
  {
    ...id,
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    category: deliverableCategoryEnum('category').notNull(),
    autoTrigger: boolean('auto_trigger').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    orgSlugUniq: uniqueIndex('deliverable_types_org_slug_uniq').on(t.orgId, t.slug),
  }),
)

export const productMappings = pgTable(
  'product_mappings',
  {
    ...id,
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    externalProductId: text('external_product_id').notNull(),
    productName: text('product_name'),
    deliverableTypeId: uuid('deliverable_type_id')
      .notNull()
      .references(() => deliverableTypes.id, { onDelete: 'cascade' }),
    config: jsonb('config').$type<Record<string, unknown>>().default({}),
    active: boolean('active').notNull().default(true),
    ...timestamps,
  },
  (t) => ({
    providerProductUniq: uniqueIndex('product_mappings_provider_product_uniq').on(
      t.orgId,
      t.provider,
      t.externalProductId,
    ),
  }),
)

export const commerceEvents = pgTable(
  'commerce_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    orderId: uuid('order_id')
      .notNull()
      .references(() => commerceOrders.id, { onDelete: 'cascade' }),
    event: text('event').notNull(),
    status: text('status').notNull().default('ok'),
    detail: jsonb('detail').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    orderIdx: index('commerce_events_order_idx').on(t.orderId),
    createdIdx: index('commerce_events_created_idx').on(t.createdAt),
  }),
)

export const deliverables = pgTable(
  'deliverables',
  {
    ...id,
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    orderId: uuid('order_id')
      .notNull()
      .references(() => commerceOrders.id, { onDelete: 'cascade' }),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => commerceCustomers.id),
    deliverableTypeId: uuid('deliverable_type_id')
      .notNull()
      .references(() => deliverableTypes.id),
    status: deliverableStatusEnum('status').notNull().default('pending'),
    assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
    dueDate: date('due_date'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    ...timestamps,
  },
  (t) => ({
    orderIdx: index('deliverables_order_idx').on(t.orderId),
    customerIdx: index('deliverables_customer_idx').on(t.customerId),
    statusIdx: index('deliverables_status_idx').on(t.status),
  }),
)
