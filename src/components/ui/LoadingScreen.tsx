import { motion } from 'framer-motion'

export function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-dvh">
      <div className="aurum-container py-20">
        <div className="mx-auto max-w-lg rounded-3xl aurum-glass ring-1 ring-white/10">
          <div className="p-8">
            <div className="flex items-center gap-4">
              <motion.div
                className="h-10 w-10 rounded-2xl bg-[linear-gradient(135deg,var(--gold),var(--gold2))]"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
              <div>
                <div className="font-display text-lg font-semibold text-white/90">
                  Aurum Investment
                </div>
                <div className="mt-1 text-sm text-white/65">{label}</div>
              </div>
            </div>
            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/6 ring-1 ring-white/10">
              <motion.div
                className="h-full w-1/3 rounded-full bg-[linear-gradient(135deg,var(--gold),var(--gold2))]"
                animate={{ x: ['-120%', '320%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

