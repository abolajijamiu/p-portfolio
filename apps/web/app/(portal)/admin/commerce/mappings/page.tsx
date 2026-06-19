'use client'

import { useEffect, useState } from 'react'
import useSWR, { mutate as globalMutate } from 'swr'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/api'
import type { DeliverableType, ProductMapping, WcProduct } from '@/types'

type ResourceLite = {
  id: string
  title: string
  category: string
  licenses: { id: string; name: string }[]
}

type ServiceLite = {
  id: string
  title: string
  category: string
  packages: { id: string; name: string; priceCents: number }[]
}

const CATEGORY_LABEL: Record<string, string> = {
  license: 'License / Resource',
  theme: 'Theme',
  service: 'Service',
  consultation: 'Consultation',
  analytics: 'Analytics',
  custom_project: 'Custom Project',
  support: 'Support',
}

const CATEGORY_COLOR: Record<string, string> = {
  license: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  theme: 'bg-purple-50 text-purple-700 border-purple-200',
  service: 'bg-blue-50 text-blue-700 border-blue-200',
  consultation: 'bg-sky-50 text-sky-700 border-sky-200',
  analytics: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  custom_project: 'bg-amber-50 text-amber-700 border-amber-200',
  support: 'bg-surface text-muted border-border',
}

function needsResourceConfig(category: string) {
  return category === 'license' || category === 'theme'
}

function needsServiceConfig(category: string) {
  return category === 'service' || category === 'consultation' || category === 'analytics'
}

function configComplete(category: string, config: Record<string, string>): boolean {
  if (needsResourceConfig(category)) return !!(config.resourceId && config.resourceLicenseId)
  if (needsServiceConfig(category)) return !!(config.serviceId && config.packageId)
  return true // custom_project, support don't need config
}

function MappingRow({
  product,
  mapping,
  deliverableTypes,
  resources,
  services,
  onSaved,
}: {
  product: WcProduct
  mapping: ProductMapping | undefined
  deliverableTypes: DeliverableType[]
  resources: ResourceLite[]
  services: ServiceLite[]
  onSaved: () => void
}) {
  const [typeId, setTypeId] = useState(mapping?.deliverableTypeId ?? '')
  const [config, setConfig] = useState<Record<string, string>>(
    (mapping?.config as Record<string, string>) ?? {}
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedType = deliverableTypes.find((t) => t.id === typeId)
  const category = selectedType?.category ?? ''

  // Reset config when type changes
  function handleTypeChange(newId: string) {
    setTypeId(newId)
    setConfig({})
    setError(null)
  }

  function setConfigField(key: string, value: string) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  // If resource changes, clear the license selection
  function handleResourceChange(resourceId: string) {
    setConfig({ resourceId })
  }

  const selectedResource = resources.find((r) => r.id === config.resourceId)
  const selectedService = services.find((s) => s.id === config.serviceId)

  const isDirty =
    typeId !== (mapping?.deliverableTypeId ?? '') ||
    JSON.stringify(config) !== JSON.stringify((mapping?.config as Record<string, string>) ?? {})

  const isConfigComplete = !typeId || configComplete(category, config)

  async function handleSave() {
    if (!typeId) return
    if (!isConfigComplete) {
      setError('Please complete the configuration for this workflow type.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await api.post('/cms/commerce/mappings', {
        provider: 'woocommerce',
        externalProductId: String(product.id),
        productName: product.name,
        deliverableTypeId: typeId,
        config,
        active: true,
      })
      onSaved()
    } catch {
      setError('Save failed. Try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!mapping) return
    setDeleting(true)
    try {
      await api.delete(`/cms/commerce/mappings/${mapping.id}`)
      setTypeId('')
      setConfig({})
      onSaved()
    } finally {
      setDeleting(false)
    }
  }

  const isConfigured = mapping && configComplete(mapping.deliverableType?.category ?? '', (mapping.config as Record<string, string>) ?? {})

  return (
    <div className="px-5 py-4 border-b border-border last:border-0">
      {/* Product row */}
      <div className="flex items-start gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">{product.name}</p>
          <p className="text-[11px] text-muted">
            ID: {product.id}
            {product.price && ` · £${product.price}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {mapping && !isDirty && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              isConfigured ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isConfigured ? 'Configured' : 'Config incomplete'}
            </span>
          )}
          <select
            value={typeId}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 max-w-[200px]"
          >
            <option value="">— No mapping —</option>
            {deliverableTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {selectedType && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLOR[category] ?? 'bg-surface text-muted border-border'}`}>
              {CATEGORY_LABEL[category] ?? category}
            </span>
          )}
        </div>
      </div>

      {/* Config panel — shown when type requires it */}
      {typeId && needsResourceConfig(category) && (
        <div className="mt-3 ml-0 pl-4 border-l-2 border-brand/20 space-y-2">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Resource config</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-muted mb-1 block">Resource</label>
              <select
                value={config.resourceId ?? ''}
                onChange={(e) => handleResourceChange(e.target.value)}
                className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="">Select resource…</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-muted mb-1 block">License tier</label>
              <select
                value={config.resourceLicenseId ?? ''}
                onChange={(e) => setConfigField('resourceLicenseId', e.target.value)}
                disabled={!selectedResource}
                className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50"
              >
                <option value="">Select license…</option>
                {(selectedResource?.licenses ?? []).map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {typeId && needsServiceConfig(category) && (
        <div className="mt-3 pl-4 border-l-2 border-brand/20 space-y-2">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
            {category === 'consultation' ? 'Consultation config' : category === 'analytics' ? 'Analytics config' : 'Service config'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-muted mb-1 block">Service</label>
              <select
                value={config.serviceId ?? ''}
                onChange={(e) => { setConfigField('serviceId', e.target.value); setConfigField('packageId', '') }}
                className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="">Select service…</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-muted mb-1 block">Package</label>
              <select
                value={config.packageId ?? ''}
                onChange={(e) => setConfigField('packageId', e.target.value)}
                disabled={!selectedService}
                className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50"
              >
                <option value="">Select package…</option>
                {(selectedService?.packages ?? []).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — ${(p.priceCents / 100).toFixed(2)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {(isDirty || error) && (
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <div className="flex gap-2 ml-auto">
            {mapping && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-muted hover:text-rose-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Removing…' : 'Remove'}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !typeId}
              className="text-xs font-semibold bg-brand text-white px-4 py-1.5 rounded-lg hover:bg-brand-deep transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save mapping'}
            </button>
          </div>
        </div>
      )}
      {mapping && !isDirty && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-[11px] text-muted hover:text-rose-600 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Removing…' : 'Remove mapping'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminMappingsPage() {
  const { data: products, isLoading: loadingProducts } = useSWR<WcProduct[]>('/cms/commerce/wc-products')
  const { data: mappings, isLoading: loadingMappings } = useSWR<ProductMapping[]>('/cms/commerce/mappings')
  const { data: deliverableTypes, isLoading: loadingTypes } = useSWR<DeliverableType[]>('/cms/commerce/deliverable-types')
  const { data: resources } = useSWR<ResourceLite[]>('/cms/commerce/resources-lite')
  const { data: services } = useSWR<ServiceLite[]>('/cms/commerce/services-lite')

  useEffect(() => { document.title = 'Product Mappings — Commerce' }, [])

  function onSaved() {
    globalMutate('/cms/commerce/mappings')
  }

  const isLoading = loadingProducts || loadingMappings || loadingTypes
  const mappingByProduct = new Map(mappings?.map((m) => [m.externalProductId, m]))

  const configured = (mappings ?? []).filter((m) =>
    configComplete(m.deliverableType?.category ?? '', (m.config as Record<string, string>) ?? {})
  ).length
  const total = (mappings ?? []).length

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin/commerce" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink mb-2">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Orders
            </Link>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Product Mappings</h1>
            <p className="text-sm text-muted mt-0.5">
              Map each WooCommerce product to a workflow type and configure what gets created on purchase.
            </p>
          </div>
          {total > 0 && (
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-ink">{configured}/{total}</p>
              <p className="text-[11px] text-muted">fully configured</p>
            </div>
          )}
        </div>

        {!deliverableTypes?.length && !loadingTypes && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            No workflow types exist yet. Create at least one deliverable type before mapping products.
          </div>
        )}

        {/* Legend */}
        <div className="mb-5 flex flex-wrap gap-2 items-center">
          <p className="text-[11px] text-muted font-medium">Workflow types:</p>
          {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
            <span key={k} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLOR[k] ?? 'bg-surface text-muted border-border'}`}>
              {v}
            </span>
          ))}
        </div>

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
            <p className="mt-1 text-[11px] text-muted/60">Check that WOOCOMMERCE_STORE_URL and credentials are configured.</p>
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden bg-white">
            {products.map((product) => (
              <MappingRow
                key={product.id}
                product={product}
                mapping={mappingByProduct.get(String(product.id))}
                deliverableTypes={deliverableTypes ?? []}
                resources={resources ?? []}
                services={services ?? []}
                onSaved={onSaved}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
