'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { useAuth } from '@/lib/auth'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatCard } from '@/components/dashboard/StatCard'
import { formatDate } from '@/lib/utils'
import type { Project } from '@/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: projects, isLoading, error, mutate } = useSWR<Project[]>('/projects')

  useEffect(() => { document.title = 'Dashboard — E-Tech.' }, [])

  const active = error ? '—' : (projects?.filter((p) => p.status === 'active').length ?? 0)
  const total = error ? '—' : (projects?.length ?? 0)

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl">
        <div className="mb-7 md:mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-ink tracking-tight">
            {user ? `Good to see you, ${user.name.split(' ')[0]}.` : 'Dashboard'}
          </h1>
          <p className="mt-1 text-sm text-muted">Here's an overview of your workspace.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8 md:mb-10">
          <StatCard label="Active projects" value={active} loading={isLoading} />
          <StatCard label="Total projects" value={total} loading={isLoading} />
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-medium text-muted uppercase tracking-wider">
              Recent projects
            </h2>
            <Link
              href="/projects"
              className="text-xs text-muted hover:text-ink transition-[color] duration-150"
            >
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3.5">
                  <Skeleton className="h-4 w-36" />
                  <div className="flex items-center gap-3 md:gap-4">
                    <Skeleton className="hidden sm:block h-3.5 w-20" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center border border-border rounded-xl bg-white">
              <p className="text-sm text-muted">Couldn't load projects.</p>
              <button
                onClick={() => mutate()}
                className="mt-2 text-xs text-ink underline underline-offset-2 hover:text-muted transition-[color] duration-150"
              >
                Try again
              </button>
            </div>
          ) : projects?.length === 0 ? (
            <div className="py-14 text-center border border-border rounded-xl bg-white">
              <p className="text-sm text-muted">No projects yet.</p>
              <p className="text-xs text-muted/60 mt-1">Projects you're added to will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
              {projects?.slice(0, 6).map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-surface transition-[background-color] duration-150"
                >
                  <span className="text-sm font-medium text-ink truncate mr-4">{project.name}</span>
                  <div className="flex items-center gap-3 md:gap-4 shrink-0">
                    {project.dueDate && (
                      <span className="hidden sm:block text-xs text-muted">
                        {formatDate(project.dueDate)}
                      </span>
                    )}
                    <Badge status={project.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
