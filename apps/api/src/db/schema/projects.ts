import { date, index, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './common'
import { projectStatusEnum } from './enums'
import { organizations } from './organizations'
import { users } from './users'

export const projects = pgTable(
  'projects',
  {
    ...id,
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    name: text('name').notNull(),
    description: text('description'),
    status: projectStatusEnum('status').notNull().default('draft'),
    dueDate: date('due_date'),
    ...timestamps,
  },
  (t) => ({
    orgIdx: index('projects_org_idx').on(t.orgId),
    orgStatusIdx: index('projects_org_status_idx').on(t.orgId, t.status),
  }),
)

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
