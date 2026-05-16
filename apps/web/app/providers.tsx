'use client'

import { SWRConfig } from 'swr'
import { AuthProvider } from '@/lib/auth'
import { api } from '@/lib/api'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ fetcher: (path: string) => api.get(path) }}>
      <AuthProvider>{children}</AuthProvider>
    </SWRConfig>
  )
}
