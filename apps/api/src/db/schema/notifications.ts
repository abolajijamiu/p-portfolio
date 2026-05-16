import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { id } from './common'
import { notificationTypeEnum } from './enums'
import { organizations } from './organizations'
import { users } from './users'

// Flexible metadata payload — shape varies per notification type.
// Typed at the application layer, not enforced in DB at MVP.
type NotificationMeta = {
  projectId?: string
  messageId?: string
  fileId?: string
  actorId?: string
  actorName?: string
  [key: string]: unknown
}

export const notifications = pgTable(
  'notifications',
  {
    ...id,
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    metadata: jsonb('metadata').$type<NotificationMeta>(),
    readAt: timestamp('read_at', { withTimezone: true }),
    // No updatedAt — notifications are append-only
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    // Primary read pattern: unread notifications for a user, newest first
    userUnreadIdx: index('notifications_user_unread_idx').on(t.userId, t.readAt, t.createdAt),
    orgIdx: index('notifications_org_idx').on(t.orgId),
  }),
)

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
