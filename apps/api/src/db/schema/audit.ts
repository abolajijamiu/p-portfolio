import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { id } from './common'
import { users } from './users'

export const auditLogs = pgTable(
  'audit_logs',
  {
    ...id,
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    entityType: text('entity_type'),
    entityId: text('entity_id'),
    details: jsonb('details').$type<Record<string, unknown>>(),
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    actorIdx: index('audit_logs_actor_idx').on(t.actorId),
    actionIdx: index('audit_logs_action_idx').on(t.action),
    createdIdx: index('audit_logs_created_idx').on(t.createdAt),
    entityIdx: index('audit_logs_entity_idx').on(t.entityType, t.entityId),
  }),
)
