import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { memberRoleEnum } from './enums'
import { organizations } from './organizations'
import { users } from './users'

// Token is stored as SHA-256 hash. Raw token lives only in the invite email.
export const invites = pgTable('invites', {
  tokenHash: text('token_hash').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => users.id),
  role: memberRoleEnum('role').notNull().default('client'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
})

export type Invite = typeof invites.$inferSelect
export type NewInvite = typeof invites.$inferInsert
