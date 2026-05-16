import Image from 'next/image'
import { initials } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Size = 'xs' | 'sm' | 'md'

const sizes: Record<Size, string> = {
  xs: 'h-6 w-6 text-[9px]',
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-xs',
}

interface AvatarProps {
  name: string
  src?: string | null
  size?: Size
  className?: string
}

export function Avatar({ name, src, size = 'sm', className }: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={`${name}'s avatar`}
        width={36}
        height={36}
        className={cn('rounded-full object-cover shrink-0', sizes[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-ink flex items-center justify-center shrink-0',
        sizes[size],
        className,
      )}
    >
      <span className="font-semibold text-white leading-none">{initials(name)}</span>
    </div>
  )
}
