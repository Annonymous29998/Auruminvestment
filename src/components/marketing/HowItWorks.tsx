import { motion } from 'framer-motion'
import { FileCheck2, ShieldCheck, TrendingUp } from 'lucide-react'

const steps = [
  {
    icon: FileCheck2,
    title: 'Create your account',
    desc: 'Sign up, verify your email, and complete your profile details to access the investor dashboard.',
  },
  {
    icon: ShieldCheck,
    title: 'Complete KYC & add funds',
    desc: 'Upload KYC documents and fund via bank transfer, card assistance, or crypto. Payments go through compliance review before they are credited to your account.',
  },
  {
    icon: TrendingUp,
    title: 'Track your investment',
    desc: 'Monitor status, plan returns, history, and notifications in a premium dashboard built for clarity and trust.',
  },
]

export function HowItWorks() {
  return (
    <section className="py-14">
      <div className="aurum-container">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/55">How It Works</div>
            <div className="mt-2 font-display text-2xl font-semibold text-white/90">
              A compliance-first flow
            </div>
            <div className="mt-2 max-w-2xl text-sm text-white/65">
              Designed for payment confirmation, audit trails, and professional investor reporting.
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {steps.map((s, idx) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.22, delay: idx * 0.04 }}
                className="rounded-3xl aurum-glass ring-1 ring-white/10"
              >
                <div className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(215,182,97,0.25),rgba(185,144,44,0.10))] ring-1 ring-[rgba(215,182,97,0.18)]">
                    <Icon className="h-6 w-6 text-gold" />
                  </div>
                  <div className="mt-4 text-base font-semibold text-white/90">{s.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-white/65">{s.desc}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

