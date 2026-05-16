import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { id, timestamps } from './common'

export const users = pgTable(
  'users',
  {
    ...id,
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    passwordHash: text('password_hash'),
    avatarUrl: text('avatar_url'),
    invitedAt: timestamp('invited_at', { withTimezone: true }),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => ({
    emailIdx: index('users_email_idx').on(t.email),
  }),
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
