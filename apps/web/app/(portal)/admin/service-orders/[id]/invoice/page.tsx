'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

type OrderDetail = {
  order: {
    id: string
    orderNumber: string
    status: string
    priceCents: number
    currency: string
    createdAt: string
    assignedAt?: string | null
    completedAt?: string | null
    revisionCount: number
  }
  service: { title: string; category: string }
  pkg: { name: string; deliveryDays: number; priceCents: number }
  client: { name: string; email: string }
}

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$', GBP: '£', EUR: '€', NGN: '₦',
}

function fmtMoney(cents: number, currency: string) {
  const sym = CURRENCY_SYMBOL[currency] ?? currency + ' '
  return `${sym}${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

const STATUS_PAID = ['payment_received', 'requirements_needed', 'requirements_submitted',
  'assigned', 'in_progress', 'waiting_for_client', 'delivered',
  'revision_requested', 'approved', 'completed']

const CATEGORY_LABEL: Record<string, string> = {
  development: 'Web Development',
  marketing: 'Digital Marketing',
  branding: 'Brand Design',
  ai_analytics: 'AI & Analytics',
  ecommerce: 'E-commerce',
  consulting: 'Consulting',
  publishing: 'Digital Publishing',
  technical: 'Technical Services',
  premium: 'Premium Services',
}

export default function AdminInvoicePage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<OrderDetail>(`/cms/service-orders/${id}`)
      .then(setData)
      .catch(() => setError('Invoice not available.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="h-8 w-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted">{error || 'Order not found.'}</p>
        <Link href={`/admin/service-orders/${id}`} className="text-xs text-brand hover:underline">← Back to order</Link>
      </div>
    )
  }

  const { order, service, pkg, client } = data
  const isPaid = STATUS_PAID.includes(order.status)
  const issueDate = fmtDate(order.assignedAt ?? order.createdAt)
  const subTotal = pkg.priceCents
  const total = order.priceCents

  return (
    <>
      <div className="print:hidden bg-surface border-b border-border px-6 py-3 flex items-center justify-between gap-4">
        <Link href={`/admin/service-orders/${id}`} className="text-xs text-muted hover:text-brand transition-colors">
          ← Back to order
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-brand text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          Print / Save PDF
        </button>
      </div>

      <div className="bg-white min-h-screen print:min-h-0">
        <div className="max-w-[720px] mx-auto px-8 py-12 print:px-0 print:py-0 print:max-w-none">

          <div className="flex items-start justify-between mb-10">
            <div>
              <p className="text-xl font-bold text-[#0F172A] tracking-tight">
                E<span className="text-[#1E3A8A]">-Tech.</span>
              </p>
              <p className="text-xs text-[#64748B] mt-1">E-Tech Digital Services</p>
              <p className="text-xs text-[#64748B]">hello@deempiretech.com</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#0F172A] tracking-tight mb-1">INVOICE</p>
              <p className="text-sm font-mono font-semibold text-[#1E3A8A]">{order.orderNumber}</p>
              <div className="mt-2">
                <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  isPaid ? 'bg-emerald-100 text-emerald-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {isPaid ? 'Paid' : order.status === 'cancelled' ? 'Cancelled' : 'Pending Payment'}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#E2E8F0] mb-8" />

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.1em] mb-2">Billed To</p>
              <p className="text-sm font-semibold text-[#0F172A]">{client.name}</p>
              <p className="text-sm text-[#64748B]">{client.email}</p>
            </div>
            <div className="text-right">
              <div className="mb-3">
                <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.1em] mb-0.5">Issue Date</p>
                <p className="text-sm text-[#0F172A]">{issueDate}</p>
              </div>
              {order.completedAt && (
                <div>
                  <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.1em] mb-0.5">Completed</p>
                  <p className="text-sm text-[#0F172A]">{fmtDate(order.completedAt)}</p>
                </div>
              )}
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-[#0F172A]">
                <th className="text-left text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.1em] pb-3 pr-4">Description</th>
                <th className="text-right text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.1em] pb-3 pl-4 w-32">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#E2E8F0]">
                <td className="py-4 pr-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{service.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {CATEGORY_LABEL[service.category] ?? service.category} · {pkg.name} Package
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {pkg.deliveryDays}-day delivery · {order.revisionCount} revision{order.revisionCount !== 1 ? 's' : ''} used
                  </p>
                </td>
                <td className="py-4 pl-4 text-right">
                  <p className="text-sm font-semibold text-[#0F172A]">{fmtMoney(subTotal, order.currency)}</p>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mb-10">
            <div className="w-56">
              <div className="flex items-center justify-between py-2 border-b border-[#E2E8F0]">
                <span className="text-xs text-[#64748B]">Subtotal</span>
                <span className="text-sm text-[#0F172A]">{fmtMoney(subTotal, order.currency)}</span>
              </div>
              {total !== subTotal && (
                <div className="flex items-center justify-between py-2 border-b border-[#E2E8F0]">
                  <span className="text-xs text-[#64748B]">Adjustment</span>
                  <span className="text-sm text-[#0F172A]">{fmtMoney(total - subTotal, order.currency)}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-3 mt-1">
                <span className="text-sm font-bold text-[#0F172A]">Total</span>
                <span className="text-lg font-bold text-[#1E3A8A]">{fmtMoney(total, order.currency)}</span>
              </div>
            </div>
          </div>

          {isPaid && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 mb-8">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm font-semibold text-emerald-800">Payment received</p>
              </div>
              <p className="text-xs text-emerald-700 mt-1 ml-6">
                Thank you for your payment. This invoice is for your records.
              </p>
            </div>
          )}

          <div className="h-px bg-[#E2E8F0] mb-6" />
          <div className="text-center">
            <p className="text-xs text-[#64748B]">
              Thank you for working with E-Tech. For questions, contact us at{' '}
              <a href="mailto:hello@deempiretech.com" className="text-[#1E3A8A]">hello@deempiretech.com</a>
            </p>
            <p className="text-[10px] text-[#94A3B8] mt-2">
              E-Tech Digital Services · Invoice {order.orderNumber} · {issueDate}
            </p>
          </div>

        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
        @page {
          size: A4;
          margin: 20mm 15mm;
        }
      `}</style>
    </>
  )
}
