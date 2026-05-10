import { Eye, EyeOff } from 'lucide-react'
import { forwardRef, useId, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  buttonLabel?: { show: string; hide: string }
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { className, id, buttonLabel = { show: 'Show password', hide: 'Hide password' }, ...props },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        ref={ref}
        id={inputId}
        type={visible ? 'text' : 'password'}
        className={cn(
          'h-11 w-full rounded-2xl bg-white/6 px-4 pr-12 text-sm text-white/90 ring-1 ring-white/12 placeholder:text-white/45 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(215,182,97,0.35)]',
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-white/6 text-white/70 ring-1 ring-white/12 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(215,182,97,0.35)]"
        aria-label={visible ? buttonLabel.hide : buttonLabel.show}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
})
