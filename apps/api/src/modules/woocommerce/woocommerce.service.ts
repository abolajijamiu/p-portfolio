import crypto from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { wcWebhookEvents } from '../../db/schema'
import * as commerceService from '../commerce/commerce.service'
import { mapWcOrder, isPaidStatus } from './woocommerce.mapper'
import type { WcOrder } from './woocommerce.types'

// ─── Signature verification ───────────────────────────────────────────────────

export function verifySignature(rawBody: Buffer, signature: string): boolean {
  const secret = process.env.WC_WEBHOOK_SECRET
  if (!secret) {
    console.error(JSON.stringify({ level: 'error', msg: 'WC_WEBHOOK_SECRET not configured — rejecting webhook' }))
    return false
  }
  if (!Buffer.isBuffer(rawBody) || rawBody.length === 0) {
    console.error(JSON.stringify({ level: 'error', msg: 'Webhook raw body missing or empty — check express.raw() middleware order' }))
    return false
  }
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('base64')
  try {
    const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    if (!ok) {
      console.error(JSON.stringify({
        level: 'error',
        msg: 'Webhook signature mismatch',
        expectedLen: expected.length,
        receivedLen: signature.length,
        receivedPrefix: signature.slice(0, 8),
      }))
    }
    return ok
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', msg: 'Webhook signature comparison threw', error: String(err) }))
    return false
  }
}

// ─── Webhook processing ───────────────────────────────────────────────────────

export async function processWebhook(params: {
  deliveryId: string
  webhookId: string | undefined
  topic: string
  payload: WcOrder
  orgId: string
}): Promise<void> {
  const { deliveryId, webhookId, topic, payload, orgId } = params
  const externalOrderId = String(payload.id)

  // Write the event record first — duplicate deliveryId means we already processed it
  let eventId: string
  try {
    const [event] = await db
      .insert(wcWebhookEvents)
      .values({
        deliveryId,
        webhookId: webhookId ?? null,
        topic,
        externalOrderId,
        status: 'pending',
        payload: payload as unknown as Record<string, unknown>,
      })
      .returning({ id: wcWebhookEvents.id })
    eventId = event.id
  } catch (err: unknown) {
    // Unique constraint violation = duplicate delivery, safe to ignore
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('wc_webhook_events_delivery_id_uniq')) return
    throw err
  }

  try {
    await handleOrderEvent(orgId, topic, payload)

    await db
      .update(wcWebhookEvents)
      .set({ status: 'processed', processedAt: new Date() })
      .where(eq(wcWebhookEvents.id, eventId))
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ level: 'error', msg: 'Webhook processing failed', deliveryId, error }))
    await db
      .update(wcWebhookEvents)
      .set({ status: 'failed', error })
      .where(eq(wcWebhookEvents.id, eventId))
  }
}

async function handleOrderEvent(orgId: string, topic: string, wc: WcOrder): Promise<void> {
  const mapped = mapWcOrder(wc)

  const customer = await commerceService.upsertCustomer(orgId, mapped.customerEmail, mapped.customerName)
  const { order, previousStatus, isNew } = await commerceService.upsertOrder(orgId, customer.id, mapped)

  // Only trigger deliverables + operations on the transition into a paid state
  const nowPaid = isPaidStatus(mapped.status)
  const wasPaid = previousStatus ? isPaidStatus(previousStatus) : false
  const shouldTrigger = nowPaid && (isNew || !wasPaid)

  if (shouldTrigger) {
    const created = await commerceService.processDeliverables(
      orgId,
      order.id,
      customer.id,
      mapped.lineItems,
    )
    await commerceService.triggerOperations(
      orgId,
      { id: order.id, invoiceNumber: order.invoiceNumber, totalCents: order.totalCents, currency: order.currency },
      { email: customer.email, name: customer.name },
      created,
    )
  }
}
