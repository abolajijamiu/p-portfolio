export type WcProduct = {
  id: number
  name: string
  slug: string
  status: string
  price: string
  regular_price: string
  sale_price: string
  categories: Array<{ id: number; name: string; slug: string }>
}

export type WcOrderLineItem = {
  id: number
  name: string
  product_id: number
  quantity: number
  total: string
}

export type WcBillingAddress = {
  first_name: string
  last_name: string
  email: string
  company: string
  address_1: string
  address_2: string
  city: string
  state: string
  postcode: string
  country: string
}

export type WcOrder = {
  id: number
  number: string
  status: string
  currency: string
  total: string
  billing: WcBillingAddress
  line_items: WcOrderLineItem[]
  date_created: string
  customer_id: number
  payment_method: string
  payment_method_title: string
}

export type WcCustomer = {
  id: number
  email: string
  first_name: string
  last_name: string
}
