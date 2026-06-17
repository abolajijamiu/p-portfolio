'use client'

import { useEffect, useState } from 'react'
import useSWR, { mutate } from 'swr'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { http } from '@/lib/http'
import type { DeliverableType, ProductMapping, WcProduct } from '@/types'

function MappingRow({
  product,
  mapping,
  deliverableTypes,
  onSave,
  onDelete,
}: {
  product: WcProduct
  mapping: ProductMapping | undefined
  deliverableTypes: DeliverableType[]
  onSave: (productId: string, deliverableTypeId: string) => Promise<void>
  onDelete: (mappingId: string) => Promise<void>
}) {
  const [selected, setSelected] = useState(mapping?.deliverableTypeId ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isDirty = selected !== (mapping?.deliverableTypeId ?? '')

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    try {
      await onSave(String(product.id), selected)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!mapping) return
    setDeleting(true)
    try {
      await onDelete(mapping.id)
      setSelected('')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink truncate">{product.name}</p>
        <p className="text-[11px] text-muted">
          ID: {product.id}
          {product.price && ` · £${product.price}`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          <option value="">— No mapping —</option>
          {deliverableTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {isDirty && selected && (
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        )}
        {mapping && !isDirty && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-red-500 hover:text-red-700 transition-[color] duration-150 disabled:opacity-50"
          >
            {deleting ? 'Removing…' : 'Remove'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function AdminMappingsPage() {
  const { data: products, isLoading: loadingProducts } = useSWR<WcProduct[]>('/cms/commerce/wc-products')
  const { data: mappings, isLoading: loadingMappings } = useSWR<ProductMapping[]>('/cms/commerce/mappings')
  const { data: deliverableTypes, isLoading: loadingTypes } = useSWR<DeliverableType[]>('/cms/commerce/deliverable-types')

  useEffect(() => {
    document.title = 'Product Mappings — Commerce'
  }, [])

  async function handleSave(externalProductId: string, deliverableTypeId: string) {
    await http.post('/cms/commerce/mappings', {
      provider: 'woocommerce',
      externalProductId,
      deliverableTypeId,
    })
    mutate('/cms/commerce/mappings')
  }

  async function handleDelete(mappingId: string) {
    await http.delete(`/cms/commerce/mappings/${mappingId}`)
    mutate('/cms/commerce/mappings')
  }

  const isLoading = loadingProducts || loadingMappings || loadingTypes
  const mappingByProduct = new Map(mappings?.map((m) => [m.externalProductId, m]))

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/admin/commerce"
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-[color] duration-150 mb-2"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Orders
            </Link>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Product Mappings</h1>
            <p className="text-sm text-muted mt-0.5">
              Map WooCommerce products to deliverable types.
            </p>
          </div>
        </div>

        {!deliverableTypes?.length && !loadingTypes && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            No deliverable types exist yet. Create at least one before mapping products.
          </div>
        )}

        {isLoading ? (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-44 rounded-lg" />
              </div>
            ))}
          </div>
        ) : !products?.length ? (
          <div className="py-14 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No products found in your WooCommerce store.</p>
            <p className="mt-1 text-[11px] text-muted/60">
              Check that WOOCOMMERCE_STORE_URL and credentials are configured.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
            {products.map((product) => (
              <MappingRow
                key={product.id}
                product={product}
                mapping={mappingByProduct.get(String(product.id))}
                deliverableTypes={deliverableTypes ?? []}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
