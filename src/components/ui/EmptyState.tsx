import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('rounded-3xl aurum-glass ring-1 ring-white/10', className)}>
      <div className="p-8 text-center">
        {icon ? <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/6 ring-1 ring-white/10">{icon}</div> : null}
        <div className="font-display text-lg font-semibold text-white/90">{title}</div>
        {description ? <div className="mt-2 text-sm leading-relaxed text-white/65">{description}</div> : null}
        {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
      </div>
    </div>
  )
}

