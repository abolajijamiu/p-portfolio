import { bigint, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { id } from './common'
import { organizations } from './organizations'
import { projects } from './projects'
import { users } from './users'

export const files = pgTable(
  'files',
  {
    ...id,
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    uploadedBy: uuid('uploaded_by')
      .notNull()
      .references(() => users.id),
    name: text('name').notNull(),
    storageKey: text('storage_key').notNull().unique(),
    mimeType: text('mime_type'),
    sizeBytes: bigint('size_bytes', { mode: 'number' }),
    // No updatedAt — files are immutable after upload
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    projectIdx: index('files_project_idx').on(t.projectId),
    orgIdx: index('files_org_idx').on(t.orgId),
  }),
)

export type File = typeof files.$inferSelect
export type NewFile = typeof files.$inferInsert
