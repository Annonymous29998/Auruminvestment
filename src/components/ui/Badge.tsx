import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
  className?: string
  children: ReactNode
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-white/6 text-white/75 ring-white/10',
    success: 'bg-emerald-400/10 text-emerald-200 ring-emerald-400/15',
    warning: 'bg-amber-300/10 text-amber-200 ring-amber-300/15',
    danger: 'bg-rose-400/10 text-rose-200 ring-rose-400/15',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold ring-1',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
