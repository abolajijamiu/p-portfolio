import { index, pgTable, text } from 'drizzle-orm/pg-core'
import { id, timestamps } from './common'

export const organizations = pgTable(
  'organizations',
  {
    ...id,
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    logoUrl: text('logo_url'),
    ...timestamps,
  },
  (t) => ({
    slugIdx: index('organizations_slug_idx').on(t.slug),
  }),
)

export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
