import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useToastStore } from '@/stores/toastStore'

const tones = {
  neutral: { icon: Info, ring: 'ring-white/10', bg: 'bg-white/8' },
  success: { icon: CheckCircle2, ring: 'ring-emerald-400/20', bg: 'bg-emerald-400/8' },
  warning: { icon: TriangleAlert, ring: 'ring-amber-300/20', bg: 'bg-amber-300/8' },
  danger: { icon: XCircle, ring: 'ring-rose-400/20', bg: 'bg-rose-400/8' },
} as const

const TOAST_MS = 3200

export function ToastHost() {
  const items = useToastStore((s) => s.items)
  const remove = useToastStore((s) => s.remove)

  useEffect(() => {
    if (!items.length) return
    const t = items[0]
    const timer = window.setTimeout(() => remove(t.id), TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [items, remove])

  return (
    <div className="fixed right-4 top-4 z-100 w-[min(420px,calc(100vw-2rem))]">
      <AnimatePresence initial={false}>
        {items.map((t) => {
          const def = tones[t.tone]
          const Icon = def.icon
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.12 }}
              className={`aurum-glass-strong ring-1 ${def.ring} ${def.bg} rounded-2xl px-4 py-3`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 ring-1 ring-white/12">
                  <Icon className="h-5 w-5 text-white/80" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-white/90">{t.title}</div>
                      {t.message ? (
                        <div className="mt-0.5 text-sm leading-relaxed text-white/70">
                          {t.message}
                        </div>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(t.id)}
                      className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-white/70 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
                      aria-label="Dismiss notification"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
