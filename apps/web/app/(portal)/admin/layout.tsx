'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Spinner } from '@/components/ui/Spinner'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const hasAccess = user?.role === 'admin' || user?.role === 'owner'

  useEffect(() => {
    if (!isLoading && user && !hasAccess) {
      router.replace('/dashboard')
    }
  }, [isLoading, user, hasAccess, router])

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!hasAccess) return null

  return <>{children}</>
}
