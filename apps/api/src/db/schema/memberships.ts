import { index, pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core'
import { memberRoleEnum } from './enums'
import { organizations } from './organizations'
import { users } from './users'

export const memberships = pgTable(
  'memberships',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    role: memberRoleEnum('role').notNull().default('member'),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.orgId] }),
    orgIdx: index('memberships_org_idx').on(t.orgId),
    userIdx: index('memberships_user_idx').on(t.userId),
  }),
)

export type Membership = typeof memberships.$inferSelect
export type NewMembership = typeof memberships.$inferInsert
