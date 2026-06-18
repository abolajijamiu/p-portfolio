import type { Request, Response } from 'express'
import Stripe from 'stripe'
import type { Session } from 'stripe/cjs/resources/Checkout/Sessions.js'
import {
  handleCheckoutComplete,
  handleResourceCheckoutComplete,
  handleBookingCheckoutComplete,
} from './stripe.service'

export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature']
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secret || !sig) {
    res.status(400).json({ error: 'Missing Stripe signature' })
    return
  }

  let event: ReturnType<InstanceType<typeof Stripe>['webhooks']['constructEvent']>

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' })
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig as string, secret)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Signature verification failed'
    res.status(400).json({ error: msg })
    return
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Session
      if (session.metadata?.type === 'resource_purchase') {
        await handleResourceCheckoutComplete(session)
      } else if (session.metadata?.type === 'booking') {
        await handleBookingCheckoutComplete(session)
      } else {
        await handleCheckoutComplete(session)
      }
    }
    res.json({ received: true })
  } catch (err) {
    console.error('Stripe webhook handler error', err)
    res.status(500).json({ error: 'Webhook handler failed' })
  }
}
