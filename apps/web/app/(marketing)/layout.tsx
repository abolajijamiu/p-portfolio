import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { ContactFloat } from '@/components/ui/ContactFloat'
import { AiChat } from '@/components/ui/AiChat'
import type { ReactNode } from 'react'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
      <ContactFloat />
      <AiChat />
    </div>
  )
}
