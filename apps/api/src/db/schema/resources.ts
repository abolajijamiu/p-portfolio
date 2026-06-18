import {
  boolean,
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
import { contentStatusEnum, resourceCategoryEnum, resourcePurchaseStatusEnum } from './enums'
import { users } from './users'

// ─── Resource catalogue ───────────────────────────────────────────────────────

export const resources = pgTable(
  'resources',
  {
    ...id,
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    tagline: text('tagline').notNull(),
    description: text('description').notNull(),
    category: resourceCategoryEnum('category').notNull(),
    status: contentStatusEnum('status').notNull().default('draft'),
    featured: boolean('featured').notNull().default(false),
    coverImageUrl: text('cover_image_url'),
    previewImages: jsonb('preview_images').$type<string[]>().notNull().default([]),
    tags: text('tags').array().notNull().default([]),
    sortOrder: integer('sort_order').notNull().default(0),
    ...timestamps,
  },
  (t) => ({
    categoryIdx: index('resources_category_idx').on(t.category),
    statusIdx: index('resources_status_idx').on(t.status),
    slugUniq: uniqueIndex('resources_slug_uniq').on(t.slug),
  }),
)

export const resourceLicenses = pgTable(
  'resource_licenses',
  {
    ...id,
    resourceId: uuid('resource_id')
      .notNull()
      .references(() => resources.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    priceCents: integer('price_cents').notNull().default(0),
    currency: text('currency').notNull().default('USD'),
    permissions: jsonb('permissions').$type<Record<string, boolean>>().notNull().default({}),
    maxDownloads: integer('max_downloads'),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => ({
    resourceIdx: index('resource_licenses_resource_idx').on(t.resourceId),
  }),
)

export const resourceFiles = pgTable(
  'resource_files',
  {
    ...id,
    resourceId: uuid('resource_id')
      .notNull()
      .references(() => resources.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    key: text('key').notNull(),
    size: integer('size').notNull().default(0),
    mimeType: text('mime_type'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    resourceIdx: index('resource_files_resource_idx').on(t.resourceId),
  }),
)

export const resourcePurchases = pgTable(
  'resource_purchases',
  {
    ...id,
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    resourceId: uuid('resource_id')
      .notNull()
      .references(() => resources.id),
    licenseId: uuid('license_id')
      .notNull()
      .references(() => resourceLicenses.id),
    status: resourcePurchaseStatusEnum('status').notNull().default('pending_payment'),
    pricePaidCents: integer('price_paid_cents').notNull().default(0),
    currency: text('currency').notNull().default('USD'),
    downloadCount: integer('download_count').notNull().default(0),
    maxDownloads: integer('max_downloads'),
    downloadToken: text('download_token').notNull().unique(),
    licenseKey: text('license_key').notNull().unique(),
    stripeSessionId: text('stripe_session_id'),
    activatedAt: timestamp('activated_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => ({
    userIdx: index('resource_purchases_user_idx').on(t.userId),
    resourceIdx: index('resource_purchases_resource_idx').on(t.resourceId),
    tokenUniq: uniqueIndex('resource_purchases_token_uniq').on(t.downloadToken),
    licenseKeyUniq: uniqueIndex('resource_purchases_key_uniq').on(t.licenseKey),
  }),
)
