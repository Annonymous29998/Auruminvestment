import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

const styles: Record<Variant, string> = {
  primary:
    'text-black bg-[linear-gradient(135deg,var(--gold),var(--gold2))] hover:brightness-105 active:brightness-95',
  secondary:
    'text-white bg-white/8 hover:bg-white/12 active:bg-white/10 ring-1 ring-white/12',
  ghost: 'text-white/80 hover:text-white hover:bg-white/8',
  danger:
    'text-white bg-rose-500/80 hover:bg-rose-500/90 ring-1 ring-rose-300/25',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-xl',
  md: 'h-11 px-4 text-sm rounded-2xl',
  lg: 'h-12 px-5 text-base rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'secondary', size = 'md', disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(215,182,97,0.35)] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60',
        styles[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...props}
    />
  )
})

