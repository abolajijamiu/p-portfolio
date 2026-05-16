import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { id } from './common'
import { memberRoleEnum } from './enums'
import { organizations } from './organizations'
import { users } from './users'

// Stores refresh token hashes — never the raw token.
// Role is cached here so token refresh requires no joins.
export const sessions = pgTable(
  'sessions',
  {
    ...id,
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    role: memberRoleEnum('role').notNull(),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('sessions_user_idx').on(t.userId),
    // Supports periodic cleanup of expired sessions
    expiryIdx: index('sessions_expiry_idx').on(t.expiresAt),
  }),
)

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
