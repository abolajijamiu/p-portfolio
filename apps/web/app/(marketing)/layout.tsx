import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { ContactFloat } from '@/components/ui/ContactFloat'
import { CampaignRenderer } from '@/components/campaigns/CampaignRenderer'
import type { ReactNode } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

async function fetchNavCategories() {
  try {
    const [svcRes, resRes] = await Promise.all([
      fetch(`${API}/services`, { next: { revalidate: 3600 } }),
      fetch(`${API}/resources`, { next: { revalidate: 3600 } }),
    ])
    const svcs: { category: string }[] = svcRes.ok ? await svcRes.json() : []
    const ress: { category: string }[] = resRes.ok ? await resRes.json() : []
    const serviceCategories = [...new Set(svcs.map((s) => s.category))]
    const resourceCategories = [...new Set(ress.map((r) => r.category))]
    return { serviceCategories, resourceCategories }
  } catch {
    return { serviceCategories: [], resourceCategories: [] }
  }
}

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const { serviceCategories, resourceCategories } = await fetchNavCategories()
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Nav serviceCategories={serviceCategories} resourceCategories={resourceCategories} />
      <main className="flex-1">{children}</main>
      <Footer />
      <ContactFloat />
      <CampaignRenderer />
    </div>
  )
}
