import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './common'
import { supportTicketStatusEnum, supportTicketPriorityEnum } from './enums'
import { users } from './users'

export const supportTickets = pgTable(
  'support_tickets',
  {
    ...id,
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    subject: text('subject').notNull(),
    status: supportTicketStatusEnum('status').notNull().default('open'),
    priority: supportTicketPriorityEnum('priority').notNull().default('normal'),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => ({
    userIdx: index('support_tickets_user_idx').on(t.userId),
    statusIdx: index('support_tickets_status_idx').on(t.status),
    createdIdx: index('support_tickets_created_idx').on(t.createdAt),
  }),
)

export const supportTicketMessages = pgTable(
  'support_ticket_messages',
  {
    ...id,
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => supportTickets.id, { onDelete: 'cascade' }),
    senderId: uuid('sender_id')
      .notNull()
      .references(() => users.id),
    body: text('body').notNull(),
    isStaff: boolean('is_staff').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    ticketIdx: index('support_ticket_messages_ticket_idx').on(t.ticketId),
    createdIdx: index('support_ticket_messages_created_idx').on(t.createdAt),
  }),
)
