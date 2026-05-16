import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'h-5 w-5 rounded-full border-2 border-border border-t-ink animate-spin',
        className,
      )}
    />
  )
}
