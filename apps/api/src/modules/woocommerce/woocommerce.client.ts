import type { WcCustomer, WcOrder, WcProduct } from './woocommerce.types'

function base(): string {
  const url = process.env.WOOCOMMERCE_STORE_URL
  if (!url) throw new Error('WOOCOMMERCE_STORE_URL is not configured')
  return url.replace(/\/$/, '') + '/wp-json/wc/v3'
}

function authHeader(): string {
  const key = process.env.WC_CONSUMER_KEY
  const secret = process.env.WC_CONSUMER_SECRET
  if (!key || !secret) throw new Error('WooCommerce credentials are not configured')
  return `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    headers: { Authorization: authHeader() },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`WooCommerce API ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

export async function fetchProducts(): Promise<WcProduct[]> {
  return get<WcProduct[]>('/products?per_page=100&status=publish')
}

export async function fetchOrders(page = 1): Promise<WcOrder[]> {
  return get<WcOrder[]>(`/orders?per_page=100&page=${page}`)
}

export async function fetchOrder(orderId: number): Promise<WcOrder> {
  return get<WcOrder>(`/orders/${orderId}`)
}

export async function fetchCustomers(page = 1): Promise<WcCustomer[]> {
  return get<WcCustomer[]>(`/customers?per_page=100&page=${page}`)
}
