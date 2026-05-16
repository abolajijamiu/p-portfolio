'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'
import type { Project } from '@/types'

export default function ProjectsPage() {
  const { data: projects, isLoading, error, mutate } = useSWR<Project[]>('/projects')

  useEffect(() => { document.title = 'Projects — E-Tech.' }, [])

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-10 md:p-8 max-w-3xl">
        <div className="mb-7 md:mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-ink tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted">All projects in your workspace.</p>
        </div>

        {isLoading ? (
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Name', 'Status', 'Due date'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3.5"><Skeleton className="h-4 w-44" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-4 w-24" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">Couldn't load projects.</p>
            <button
              onClick={() => mutate()}
              className="mt-2 text-xs text-ink underline underline-offset-2 hover:text-muted transition-[color] duration-150"
            >
              Try again
            </button>
          </div>
        ) : projects?.length === 0 ? (
          <div className="py-16 text-center border border-border rounded-xl bg-white">
            <p className="text-sm text-muted">No projects yet.</p>
            <p className="text-xs text-muted/60 mt-1">Projects you're added to will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-white -mx-px">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-border">
                  {['Name', 'Status', 'Due date'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects?.map((project) => (
                  <tr key={project.id} className="hover:bg-surface transition-[background-color] duration-150">
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-sm font-medium text-ink hover:underline underline-offset-2"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5"><Badge status={project.status} /></td>
                    <td className="px-4 py-3.5 text-sm text-muted whitespace-nowrap">
                      {project.dueDate ? formatDate(project.dueDate) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
