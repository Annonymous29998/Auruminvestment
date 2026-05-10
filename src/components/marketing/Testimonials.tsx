import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const items = [
  {
    name: 'Amina K.',
    role: 'Portfolio Analyst',
    quote:
      'The dashboard is clean and the compliance flow is clear. I appreciate the clear payment confirmation process and the transparent risk disclosures.',
  },
  {
    name: 'Kwame A.',
    role: 'SME Founder',
    quote:
      'The plans are easy to understand and the support response is professional. It feels like a serious fintech product.',
  },
  {
    name: 'Lerato S.',
    role: 'Investor',
    quote:
      'I like seeing the stated ROI and the investment timeline. The KYC checklist made onboarding straightforward.',
  },
]

export function Testimonials() {
  return (
    <section className="py-14">
      <div className="aurum-container">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/55">
              Investor Feedback
            </div>
            <div className="mt-2 font-display text-2xl font-semibold text-white/90">
              Trust built through transparency
            </div>
            <div className="mt-2 max-w-2xl text-sm text-white/65">
              Testimonials reflect customer feedback and platform experience.
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white/6 px-4 py-2 text-sm font-semibold text-white/75 ring-1 ring-white/10">
            <Star className="h-4 w-4 text-gold" />
            4.8 average rating
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {items.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.22, delay: idx * 0.04 }}
              className="rounded-3xl aurum-glass ring-1 ring-white/10"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold" />
                  ))}
                </div>
                <div className="mt-4 text-sm leading-relaxed text-white/75">{t.quote}</div>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <div className="text-sm font-semibold text-white/85">{t.name}</div>
                  <div className="text-xs text-white/55">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
