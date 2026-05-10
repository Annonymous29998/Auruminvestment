import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GoldChart } from '@/components/marketing/GoldChart'
import { GoldTicker } from '@/components/marketing/GoldTicker'
import { HeroScene } from '@/components/marketing/HeroScene'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { Testimonials } from '@/components/marketing/Testimonials'
import { Faq } from '@/components/marketing/Faq'
import { SupportPanel } from '@/components/support/SupportPanel'
import { Button } from '@/components/ui/Button'

export function HomePage() {
  return (
    <div>
      <section id="top" className="relative scroll-mt-28 overflow-hidden py-14 sm:py-18">
        <div className="aurum-container">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.26 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/75 ring-1 ring-white/10"
            >
              <Sparkles className="h-4 w-4 text-gold" />
              Smart Investing
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, delay: 0.05 }}
              className="mt-6 font-display text-4xl font-semibold leading-tight tracking-tight text-white/95 sm:text-5xl lg:text-6xl"
            >
              Invest in African Gold Opportunities
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, delay: 0.1 }}
              className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg"
            >
              Premium access to gold-backed opportunities with a compliance-first onboarding experience, manual payment
              verification, and professional investor reporting.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, delay: 0.15 }}
              className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center"
            >
              <Link to="/#how-it-works" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Start Investing <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/#contact" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Explore Plans
                </Button>
              </Link>
            </motion.div>

            <HeroScene />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <GoldTicker />
            <GoldChart />
          </div>
        </div>
      </section>

      <div id="how-it-works" className="scroll-mt-28">
        <HowItWorks />
      </div>

      <section id="about" className="scroll-mt-28 py-12">
        <div className="aurum-container">
          <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
            <div className="grid gap-8 p-6 lg:grid-cols-2 lg:items-start">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-white/55">About Aurum</div>
                <div className="mt-2 font-display text-2xl font-semibold text-white/90">
                  A premium, compliance-first gold investment experience
                </div>
                <div className="mt-3 text-sm leading-relaxed text-white/70">
                  Aurum Investment focuses on African gold-backed opportunities with careful disclosures,
                  manual payment verification, and KYC/AML-aligned onboarding. We prioritize transparency, auditability,
                  and investor-grade reporting.
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { k: 'Manual verification', v: 'All payments are reviewed by support/admin before activation.' },
                  { k: 'KYC required', v: 'KYC helps protect withdrawals and fraud prevention workflows.' },
                  { k: 'Transparent reporting', v: 'Investment history, receipts, and activity logs for clarity.' },
                  { k: 'Risk disclosure', v: 'Projected ROI is shown as estimates and not guaranteed.' },
                ].map((i) => (
                  <div key={i.k} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="text-sm font-semibold text-white/85">{i.k}</div>
                    <div className="mt-2 text-sm text-white/65">{i.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="testimonials" className="scroll-mt-28">
        <Testimonials />
      </div>

      <div id="faq" className="scroll-mt-28">
        <Faq />
      </div>

      <section id="contact" className="scroll-mt-28 py-14">
        <div className="aurum-container">
          <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            <SupportPanel />
            <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
              <div className="p-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/55">Investor Promise</div>
                <div className="mt-2 font-display text-xl font-semibold text-white/90">
                  Professional, transparent, and compliance-first
                </div>
                <div className="mt-3 text-sm leading-relaxed text-white/70">
                  Aurum Investment is built to look and behave like an enterprise fintech platform, with
                  clear disclosures, manual checks, and investor reporting. Avoid unrealistic wording and always
                  confirm details with the compliance team before publishing.
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link to="/auth/signup">
                    <Button variant="primary" className="w-full sm:w-auto">
                      Create Account <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/risk-disclosure">
                    <Button variant="secondary" className="w-full sm:w-auto">
                      Risk Disclosure
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
