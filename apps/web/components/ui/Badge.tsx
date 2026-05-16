import type { ProjectStatus } from '@/types'

const config: Record<ProjectStatus, { label: string; className: string }> = {
  draft:    { label: 'Draft',     className: 'bg-gray-100 text-gray-500' },
  active:   { label: 'Active',    className: 'bg-blue-50 text-blue-600' },
  review:   { label: 'In Review', className: 'bg-amber-50 text-amber-600' },
  complete: { label: 'Complete',  className: 'bg-green-50 text-green-700' },
  archived: { label: 'Archived',  className: 'bg-gray-100 text-gray-400' },
}

export function Badge({ status }: { status: ProjectStatus }) {
  const { label, className } = config[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
