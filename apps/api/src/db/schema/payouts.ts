import { index, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './common'
import { users } from './users'
import { serviceOrders } from './services'

export const payoutStatusEnum = pgEnum('payout_status', [
  'pending',
  'paid',
  'cancelled',
])

export const expertPayouts = pgTable(
  'expert_payouts',
  {
    ...id,
    expertId: uuid('expert_id')
      .notNull()
      .references(() => users.id),
    orderId: uuid('order_id').references(() => serviceOrders.id, { onDelete: 'set null' }),
    amountCents: integer('amount_cents').notNull(),
    currency: text('currency').notNull().default('USD'),
    status: payoutStatusEnum('status').notNull().default('pending'),
    description: text('description'),
    adminNotes: text('admin_notes'),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => ({
    expertIdx: index('expert_payouts_expert_idx').on(t.expertId),
    statusIdx: index('expert_payouts_status_idx').on(t.status),
    orderIdx: index('expert_payouts_order_idx').on(t.orderId),
  }),
)
