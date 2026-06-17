import type { WcOrder } from './woocommerce.types'

// Maps WooCommerce order statuses to our canonical set
const STATUS_MAP: Record<string, string> = {
  pending: 'pending',
  processing: 'processing',
  'on-hold': 'pending',
  completed: 'completed',
  cancelled: 'cancelled',
  refunded: 'refunded',
  failed: 'failed',
  trash: 'cancelled',
}

export type MappedOrder = {
  externalId: string
  status: string
  currency: string
  totalCents: number
  customerEmail: string
  customerName: string
  lineItems: Array<{
    externalProductId: string
    productName: string
    priceCents: number
    quantity: number
  }>
  metadata: Record<string, unknown>
}

export function mapWcOrder(wc: WcOrder): MappedOrder {
  return {
    externalId: String(wc.id),
    status: STATUS_MAP[wc.status] ?? 'pending',
    currency: wc.currency.toUpperCase(),
    totalCents: Math.round(parseFloat(wc.total) * 100),
    customerEmail: wc.billing.email,
    customerName: [wc.billing.first_name, wc.billing.last_name].filter(Boolean).join(' '),
    lineItems: wc.line_items.map((item) => ({
      externalProductId: String(item.product_id),
      productName: item.name,
      priceCents: Math.round(parseFloat(item.total) * 100),
      quantity: item.quantity,
    })),
    metadata: {
      wcOrderNumber: wc.number,
      paymentMethod: wc.payment_method,
      paymentMethodTitle: wc.payment_method_title,
    },
  }
}

export function isPaidStatus(status: string): boolean {
  return status === 'processing' || status === 'completed'
}
