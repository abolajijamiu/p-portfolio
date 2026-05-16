import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { type AnyPgColumn } from 'drizzle-orm/pg-core'
import { id, timestamps } from './common'
import { organizations } from './organizations'
import { projects } from './projects'
import { users } from './users'

export const messages = pgTable(
  'messages',
  {
    ...id,
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    senderId: uuid('sender_id')
      .notNull()
      .references(() => users.id),
    // Lazy self-reference for threaded replies
    parentId: uuid('parent_id').references((): AnyPgColumn => messages.id, {
      onDelete: 'cascade',
    }),
    body: text('body').notNull(),
    ...timestamps,
  },
  (t) => ({
    projectIdx: index('messages_project_idx').on(t.projectId),
    orgIdx: index('messages_org_idx').on(t.orgId),
    // Supports efficient "load thread" queries
    threadIdx: index('messages_thread_idx').on(t.projectId, t.parentId, t.createdAt),
  }),
)

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
