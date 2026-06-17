import type { Request, Response } from 'express'
import { verifySignature, processWebhook } from './woocommerce.service'
import type { WcOrder } from './woocommerce.types'

const HANDLED_TOPICS = new Set(['order.created', 'order.updated', 'subscription.updated'])

// Mounted in server.ts with express.raw({ type: 'application/json' })
// so req.body is a raw Buffer — not parsed JSON.
export async function wcWebhookHandler(req: Request, res: Response): Promise<void> {
  const rawBody = req.body as Buffer

  const signature = req.headers['x-wc-webhook-signature'] as string | undefined
  const topic    = req.headers['x-wc-webhook-topic'] as string | undefined
  const delivId  = req.headers['x-wc-webhook-delivery-id'] as string | undefined

  if (!signature || !verifySignature(rawBody, signature)) {
    console.error(JSON.stringify({
      level: 'error',
      msg: 'Webhook rejected — 401',
      topic,
      deliveryId: delivId,
      hasSignature: !!signature,
      bodyBytes: Buffer.isBuffer(rawBody) ? rawBody.length : typeof rawBody,
      wcHeaders: Object.fromEntries(
        Object.entries(req.headers).filter(([k]) => k.startsWith('x-wc-'))
      ),
    }))
    res.status(401).json({ error: 'Invalid signature' })
    return
  }

  if (!topic || !HANDLED_TOPICS.has(topic)) {
    res.status(200).json({ ok: true }) // Unrecognised topic — acknowledge without processing
    return
  }

  if (!delivId) {
    res.status(400).json({ error: 'Missing X-WC-Webhook-Delivery-ID' })
    return
  }

  const orgId = process.env.COMMERCE_ORG_ID
  if (!orgId) {
    console.error(JSON.stringify({ level: 'error', msg: 'COMMERCE_ORG_ID is not configured' }))
    res.status(200).json({ ok: true }) // Acknowledge so WC does not retry endlessly
    return
  }

  let payload: WcOrder
  try {
    payload = JSON.parse(rawBody.toString('utf8')) as WcOrder
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' })
    return
  }

  // Process async — respond immediately so WooCommerce does not time out and retry
  res.status(200).json({ ok: true })

  processWebhook({
    deliveryId: delivId,
    webhookId: req.headers['x-wc-webhook-id'] as string | undefined,
    topic,
    payload,
    orgId,
  }).catch((err: unknown) => {
    console.error(
      JSON.stringify({ level: 'error', msg: 'Unhandled webhook error', error: String(err) }),
    )
  })
}
