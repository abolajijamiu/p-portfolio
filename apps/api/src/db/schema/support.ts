import { boolean, index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './common'
import { supportTicketStatusEnum, supportTicketPriorityEnum, supportTicketCategoryEnum } from './enums'
import { users } from './users'

export const supportTickets = pgTable(
  'support_tickets',
  {
    ...id,
    ticketNumber: text('ticket_number').notNull().unique(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    subject: text('subject').notNull(),
    category: supportTicketCategoryEnum('category').notNull().default('general'),
    status: supportTicketStatusEnum('status').notNull().default('open'),
    priority: supportTicketPriorityEnum('priority').notNull().default('normal'),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => ({
    userIdx: index('support_tickets_user_idx').on(t.userId),
    statusIdx: index('support_tickets_status_idx').on(t.status),
    categoryIdx: index('support_tickets_category_idx').on(t.category),
    createdIdx: index('support_tickets_created_idx').on(t.createdAt),
    numberUniq: index('support_tickets_number_uniq').on(t.ticketNumber),
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
    attachments: jsonb('attachments').$type<{ key: string; name: string; size: number }[]>().notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    ticketIdx: index('support_ticket_messages_ticket_idx').on(t.ticketId),
    createdIdx: index('support_ticket_messages_created_idx').on(t.createdAt),
  }),
)
