import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function CopyField({
  label,
  value,
  monospace = true,
  className,
}: {
  label: string
  value: string
  monospace?: boolean
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1300)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className={cn('rounded-2xl bg-white/5 p-4 ring-1 ring-white/10', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-white/55">{label}</div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-white/6 px-3 text-sm font-semibold text-white/75 ring-1 ring-white/12 transition hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div
        className={cn(
          'mt-2 text-sm text-white/85',
          monospace ? 'font-mono' : '',
          'overflow-hidden text-ellipsis whitespace-nowrap',
          'md:overflow-visible md:text-clip md:whitespace-normal md:break-words',
          monospace ? 'md:break-all' : '',
        )}
        title={value}
      >
        {value}
      </div>
    </div>
  )
}
