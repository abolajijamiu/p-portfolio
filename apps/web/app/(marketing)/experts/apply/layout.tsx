import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Join as an Expert',
  description: 'Apply to join the E-Tech OS network of vetted experts and work on real client projects — on your terms.',
}

export default function ExpertsApplyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
