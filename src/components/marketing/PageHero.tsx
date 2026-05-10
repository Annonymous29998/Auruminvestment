import { motion } from 'framer-motion'

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle: string
}) {
  return (
    <section className="py-12">
      <div className="aurum-container">
        <motion.div
          initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.24 }}
          className="rounded-3xl aurum-glass ring-1 ring-white/10"
        >
          <div className="p-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/55">{eyebrow}</div>
            <div className="mt-2 font-display text-3xl font-semibold tracking-tight text-white/90">
              {title}
            </div>
            <div className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">{subtitle}</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

