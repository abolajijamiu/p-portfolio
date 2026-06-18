'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

type Props = {
  licenseId: string
  licenseName: string
  priceCents: number
  primary?: boolean
}

export function PurchaseButton({ licenseId, licenseName, priceCents, primary }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePurchase() {
    setLoading(true)
    setError(null)
    try {
      const { checkoutUrl } = await api.post<{ purchaseId: string; checkoutUrl: string }>(
        '/resource-purchases/checkout',
        { licenseId },
      )
      window.location.href = checkoutUrl
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status === 401) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`)
        return
      }
      if (status === 409) {
        setError('You already own this license.')
      } else if (status === 503) {
        setError('Online checkout is temporarily unavailable. Please contact us.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handlePurchase}
        disabled={loading}
        className={[
          'w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-lg transition-colors duration-150 disabled:opacity-60',
          primary
            ? 'bg-brand text-white hover:bg-brand-deep'
            : 'bg-surface border border-border text-ink hover:bg-white',
        ].join(' ')}
      >
        {loading ? (
          <span className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : (
          `Get ${licenseName} — $${(priceCents / 100).toLocaleString()}`
        )}
      </button>
      {error && <p className="text-xs text-rose-600 text-center mt-2">{error}</p>}
    </div>
  )
}
