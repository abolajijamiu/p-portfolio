'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

type Props = {
  packageId: string
  packageName: string
  priceCents: number
  primary?: boolean
}

export function OrderButton({ packageId, packageName, priceCents, primary }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleOrder() {
    setLoading(true)
    setError(null)
    try {
      const { checkoutUrl } = await api.post<{ orderId: string; checkoutUrl: string }>(
        '/service-orders/checkout',
        { packageId },
      )
      window.location.href = checkoutUrl
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status === 401) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`)
        return
      }
      if (status === 503) {
        setError('Online checkout is temporarily unavailable. Please contact us directly.')
        return
      }
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleOrder}
        disabled={loading}
        className={[
          'w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-lg transition-colors duration-150 disabled:opacity-60',
          primary
            ? 'bg-brand text-white hover:bg-brand-deep'
            : 'bg-ink text-white hover:bg-ink/80',
        ].join(' ')}
      >
        {loading ? (
          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          `Order ${packageName} — $${(priceCents / 100).toLocaleString()}`
        )}
      </button>
      {error && <p className="text-xs text-rose-600 text-center mt-2">{error}</p>}
    </div>
  )
}
