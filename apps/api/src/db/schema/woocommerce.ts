import { index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { id } from './common'

// One row per WooCommerce delivery attempt.
// delivery_id (X-WC-Webhook-Delivery-ID) is the idempotency key.
export const wcWebhookEvents = pgTable(
  'wc_webhook_events',
  {
    ...id,
    deliveryId: text('delivery_id').notNull(),
    webhookId: text('webhook_id'),
    topic: text('topic').notNull(), // 'order.created' | 'order.updated' | etc.
    externalOrderId: text('external_order_id'),
    status: text('status').notNull().default('pending'), // 'pending' | 'processed' | 'failed'
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    error: text('error'),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    deliveryIdUniq: uniqueIndex('wc_webhook_events_delivery_id_uniq').on(t.deliveryId),
    orderIdx: index('wc_webhook_events_order_idx').on(t.externalOrderId),
    statusIdx: index('wc_webhook_events_status_idx').on(t.status),
  }),
)
