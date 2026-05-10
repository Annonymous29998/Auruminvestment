import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-2xl bg-white/6 px-4 text-sm text-white/90 ring-1 ring-white/12 placeholder:text-white/45 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(215,182,97,0.35)]',
        className,
      )}
      {...props}
    />
  )
})

