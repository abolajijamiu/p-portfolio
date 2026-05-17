import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { id, timestamps } from './common'
import { articleCategoryEnum, contentStatusEnum, inquiryStatusEnum, mediaAssetTypeEnum } from './enums'
import { users } from './users'

// ─── Shared JSON sub-types ────────────────────────────────────────────────────

export type ThemeFeature = { category: string; items: string[] }
export type ThemeLicense = { type: string; priceCents: number | null; description: string }
export type ProofMetric = { metric: string; label: string; period?: string }
export type WorkComparison = { label: string; before: string; after: string }
export type AuditFinding = {
  item: string
  before: string
  after: string
  severity: 'critical' | 'high' | 'medium'
}

// ─── Media library ────────────────────────────────────────────────────────────

export const cmsMedia = pgTable(
  'cms_media',
  {
    ...id,
    storageKey: text('storage_key').notNull().unique(),
    originalName: text('original_name'),
    alt: text('alt'),
    caption: text('caption'),
    assetType: mediaAssetTypeEnum('asset_type').notNull().default('screenshot'),
    mimeType: text('mime_type'),
    sizeBytes: bigint('size_bytes', { mode: 'number' }),
    width: integer('width'),
    height: integer('height'),
    uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    assetTypeIdx: index('cms_media_asset_type_idx').on(t.assetType),
  }),
)

export type CmsMedia = typeof cmsMedia.$inferSelect
export type NewCmsMedia = typeof cmsMedia.$inferInsert

// ─── Themes ───────────────────────────────────────────────────────────────────

export const cmsThemes = pgTable(
  'cms_themes',
  {
    ...id,
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    tagline: text('tagline'),
    description: text('description'),
    category: text('category').notNull().default('fashion'),
    priceCents: integer('price_cents'),         // null = custom
    highlights: jsonb('highlights').$type<string[]>().default([]),
    features: jsonb('features').$type<ThemeFeature[]>().default([]),
    licenses: jsonb('licenses').$type<ThemeLicense[]>().default([]),
    deliveryNotes: jsonb('delivery_notes').$type<string[]>().default([]),
    bgClass: text('bg_class'),
    accentColor: text('accent_color'),
    checkoutUrl: text('checkout_url'),
    demoStoreUrl: text('demo_store_url'),
    demoStoreNote: text('demo_store_note'),
    videoId: text('video_id'),
    videoPlatform: text('video_platform'),
    heroMediaId: uuid('hero_media_id').references(() => cmsMedia.id, { onDelete: 'set null' }),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    status: contentStatusEnum('status').notNull().default('draft'),
    ...timestamps,
  },
  (t) => ({
    statusIdx: index('cms_themes_status_idx').on(t.status),
  }),
)

export type CmsTheme = typeof cmsThemes.$inferSelect
export type NewCmsTheme = typeof cmsThemes.$inferInsert

// ─── Work / Case Studies ──────────────────────────────────────────────────────

export const cmsWork = pgTable(
  'cms_work',
  {
    ...id,
    slug: text('slug').notNull().unique(),
    client: text('client').notNull(),
    headline: text('headline').notNull(),
    situation: text('situation'),
    category: text('category').notNull().default('shopify'),
    industry: text('industry'),
    year: integer('year'),
    duration: text('duration'),
    featured: boolean('featured').notNull().default(false),
    accentColor: text('accent_color'),
    scope: jsonb('scope').$type<string[]>().default([]),
    stack: jsonb('stack').$type<string[]>().default([]),
    proof: jsonb('proof').$type<ProofMetric[]>().default([]),
    proofNote: text('proof_note'),
    actions: jsonb('actions').$type<string[]>().default([]),
    comparisons: jsonb('comparisons').$type<WorkComparison[]>().default([]),
    hasComparison: boolean('has_comparison').notNull().default(false),
    auditFindings: jsonb('audit_findings').$type<AuditFinding[]>().default([]),
    videoId: text('video_id'),
    videoPlatform: text('video_platform'),
    heroMediaId: uuid('hero_media_id').references(() => cmsMedia.id, { onDelete: 'set null' }),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    status: contentStatusEnum('status').notNull().default('draft'),
    ...timestamps,
  },
  (t) => ({
    statusIdx: index('cms_work_status_idx').on(t.status),
    categoryIdx: index('cms_work_category_idx').on(t.category),
    featuredIdx: index('cms_work_featured_idx').on(t.featured),
  }),
)

export type CmsWorkItem = typeof cmsWork.$inferSelect
export type NewCmsWorkItem = typeof cmsWork.$inferInsert

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const cmsTestimonials = pgTable(
  'cms_testimonials',
  {
    ...id,
    client: text('client').notNull(),
    role: text('role'),
    company: text('company'),
    quote: text('quote').notNull(),
    workSlug: text('work_slug'),               // loose reference — no FK to allow deletion
    featured: boolean('featured').notNull().default(false),
    status: contentStatusEnum('status').notNull().default('draft'),
    ...timestamps,
  },
  (t) => ({
    statusIdx: index('cms_testimonials_status_idx').on(t.status),
  }),
)

export type CmsTestimonial = typeof cmsTestimonials.$inferSelect
export type NewCmsTestimonial = typeof cmsTestimonials.$inferInsert

// ─── Inquiries (contact form submissions) ─────────────────────────────────────

export const cmsInquiries = pgTable(
  'cms_inquiries',
  {
    ...id,
    name: text('name').notNull(),
    email: text('email').notNull(),
    company: text('company'),
    budget: text('budget'),
    message: text('message').notNull(),
    inquiryType: text('inquiry_type'),
    themeSlug: text('theme_slug'),
    intent: text('intent'),
    status: inquiryStatusEnum('status').notNull().default('new'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index('cms_inquiries_status_idx').on(t.status),
    createdIdx: index('cms_inquiries_created_idx').on(t.createdAt),
  }),
)

export type CmsInquiry = typeof cmsInquiries.$inferSelect
export type NewCmsInquiry = typeof cmsInquiries.$inferInsert

// ─── Articles (audits, teardowns, analyses) ───────────────────────────────────

export const cmsArticles = pgTable(
  'cms_articles',
  {
    ...id,
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    category: articleCategoryEnum('category').notNull().default('audit'),
    tags: jsonb('tags').$type<string[]>().default([]),
    body: text('body'),
    excerpt: text('excerpt'),
    client: text('client'),
    workSlug: text('work_slug'),
    featured: boolean('featured').notNull().default(false),
    proof: jsonb('proof').$type<ProofMetric[]>().default([]),
    comparisons: jsonb('comparisons').$type<WorkComparison[]>().default([]),
    heroMediaId: uuid('hero_media_id').references(() => cmsMedia.id, { onDelete: 'set null' }),
    readingMinutes: integer('reading_minutes'),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    status: contentStatusEnum('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => ({
    statusIdx: index('cms_articles_status_idx').on(t.status),
    categoryIdx: index('cms_articles_category_idx').on(t.category),
    featuredIdx: index('cms_articles_featured_idx').on(t.featured),
  }),
)

export type CmsArticle = typeof cmsArticles.$inferSelect
export type NewCmsArticle = typeof cmsArticles.$inferInsert
