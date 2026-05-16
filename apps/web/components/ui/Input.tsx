import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-10 md:h-9 px-3 text-sm rounded-md bg-white text-ink placeholder:text-[#9ca3af]',
            'border transition-[border-color,box-shadow] duration-150',
            'focus:outline-none focus-visible:ring-1 focus-visible:ring-ink focus-visible:border-ink',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-red-400' : 'border-border',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
