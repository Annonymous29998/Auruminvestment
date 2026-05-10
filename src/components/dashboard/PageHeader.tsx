import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  right,
  className,
}: {
  title: string
  subtitle?: string
  right?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0 flex-1">
        <div className="font-display text-2xl font-semibold tracking-tight text-white/90">
          {title}
        </div>
        {subtitle ? (
          <div className="mt-1 max-w-full text-pretty text-sm leading-relaxed text-white/65">{subtitle}</div>
        ) : null}
      </div>
      {right ? (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">{right}</div>
      ) : null}
    </div>
  )
}
