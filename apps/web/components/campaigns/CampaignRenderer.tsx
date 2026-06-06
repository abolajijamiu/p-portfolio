'use client'

import { useEffect, useRef, useState } from 'react'
import { CampaignEngine } from '@/lib/campaigns/engine'
import { CampaignWidget } from './CampaignWidget'
import type { Campaign } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export function CampaignRenderer() {
  const [active, setActive] = useState<Campaign | null>(null)
  const engineRef = useRef<CampaignEngine | null>(null)

  useEffect(() => {
    const engine = new CampaignEngine(
      {
        onShow: (campaign) => setActive(campaign),
        onHide: ()         => setActive(null),
      },
      API_BASE,
    )

    engineRef.current = engine
    engine.init()

    return () => engine.destroy()
  }, [])

  if (!active) return null

  return (
    <CampaignWidget
      campaign={active}
      onDismiss={() => engineRef.current?.dismiss(active.id)}
      onClick={()   => engineRef.current?.click(active.id)}
      onConvert={()  => engineRef.current?.convert(active.id)}
    />
  )
}
