import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './common'
import { serviceDeliverableStatusEnum } from './enums'
import { serviceOrders } from './services'
import { users } from './users'

export const serviceDeliverables = pgTable(
  'service_deliverables',
  {
    ...id,
    deliverableNumber: text('deliverable_number').notNull().unique(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => serviceOrders.id, { onDelete: 'cascade' }),
    assignedExpertId: uuid('assigned_expert_id').references(() => users.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description'),
    status: serviceDeliverableStatusEnum('status').notNull().default('pending'),
    version: integer('version').notNull().default(1),
    files: jsonb('files').$type<{ key: string; name: string; size: number }[]>().notNull().default([]),
    notes: text('notes'),
    internalNotes: text('internal_notes'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => ({
    orderIdx: index('service_deliverables_order_idx').on(t.orderId),
    expertIdx: index('service_deliverables_expert_idx').on(t.assignedExpertId),
    statusIdx: index('service_deliverables_status_idx').on(t.status),
    numberUniq: index('service_deliverables_number_uniq').on(t.deliverableNumber),
  }),
)

export const serviceDeliverableRevisions = pgTable(
  'service_deliverable_revisions',
  {
    ...id,
    deliverableId: uuid('deliverable_id')
      .notNull()
      .references(() => serviceDeliverables.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    submittedBy: uuid('submitted_by')
      .notNull()
      .references(() => users.id),
    message: text('message').notNull(),
    files: jsonb('files').$type<{ key: string; name: string; size: number }[]>().notNull().default([]),
    clientFeedback: text('client_feedback'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    deliverableIdx: index('service_deliverable_revisions_del_idx').on(t.deliverableId),
  }),
)
