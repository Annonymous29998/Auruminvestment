import { motion } from 'framer-motion'
import { ShieldCheck, TrendingUp, Users } from 'lucide-react'
import type { ReactNode } from 'react'

function StatCard({
  title,
  value,
  sub,
  icon,
}: {
  title: string
  value: string
  sub: string
  icon: ReactNode
}) {
  return (
    <div className="aurum-glass-strong rounded-3xl ring-1 ring-white/10">
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/55">{title}</div>
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white/6 ring-1 ring-white/10">
            {icon}
          </div>
        </div>
        <div className="mt-3 text-lg font-semibold text-white/90">{value}</div>
        <div className="mt-1 text-xs text-white/55">{sub}</div>
      </div>
    </div>
  )
}

function FloatingCard({
  title,
  value,
  sub,
  icon,
  className,
}: {
  title: string
  value: string
  sub: string
  icon: ReactNode
  className: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.25 }}
      className={`aurum-glass-strong absolute hidden rounded-3xl ring-1 ring-white/10 sm:block ${className}`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/55">{title}</div>
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white/6 ring-1 ring-white/10">
            {icon}
          </div>
        </div>
        <div className="mt-3 text-lg font-semibold text-white/90">{value}</div>
        <div className="mt-1 text-xs text-white/55">{sub}</div>
      </div>
    </motion.div>
  )
}

export function HeroScene() {
  return (
    <div className="relative mt-10 overflow-hidden rounded-[28px] aurum-glass ring-1 ring-white/10">
      <div className="relative px-5 pb-10 pt-8 sm:px-8 sm:pt-10">
        <div className="absolute inset-0">
          <div className="absolute -left-40 -top-32 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(174,90,255,0.35),transparent_60%)] blur-2xl" />
          <div className="absolute -right-48 -top-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(215,182,97,0.22),transparent_60%)] blur-2xl" />
          <div className="absolute inset-x-0 bottom-[-260px] mx-auto h-[620px] w-[920px] rounded-full bg-[radial-gradient(circle_at_center,rgba(174,90,255,0.42),rgba(0,0,0,0)_62%)] blur-2xl" />
        </div>

        <div className="relative">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-3 sm:hidden">
              <StatCard
                title="Verified onboarding"
                value="KYC + AML"
                sub="Compliance-first workflow"
                icon={<ShieldCheck className="h-5 w-5 text-gold" />}
              />
              <StatCard
                title="Investor coverage"
                value="Pan-African"
                sub="Opportunity visibility"
                icon={<Users className="h-5 w-5 text-gold" />}
              />
              <StatCard
                title="Plan ROI"
                value="Stated returns"
                sub="Guaranteed per plan terms"
                icon={<TrendingUp className="h-5 w-5 text-gold" />}
              />
            </div>
            <div className="relative mt-6 sm:mt-10">
              <div className="pointer-events-none absolute inset-x-0 -bottom-8 mx-auto h-[420px] w-[min(920px,100%)]">
                <svg viewBox="0 0 1200 520" className="h-full w-full">
                  <defs>
                    <radialGradient id="glow" cx="50%" cy="50%" r="60%">
                      <stop offset="0%" stopColor="rgba(174,90,255,0.55)" />
                      <stop offset="55%" stopColor="rgba(174,90,255,0.20)" />
                      <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                    </radialGradient>
                    <linearGradient id="rim" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0" stopColor="rgba(215,182,97,0.9)" />
                      <stop offset="1" stopColor="rgba(174,90,255,0.85)" />
                    </linearGradient>
                    <clipPath id="half">
                      <path d="M 80 520 C 220 260, 420 120, 600 120 C 780 120, 980 260, 1120 520 Z" />
                    </clipPath>
                  </defs>

                  <rect width="1200" height="520" fill="url(#glow)" opacity="0.9" />
                  <g clipPath="url(#half)">
                    <circle cx="600" cy="600" r="520" fill="rgba(0,0,0,0.35)" />
                    <circle cx="600" cy="600" r="510" fill="rgba(255,255,255,0.03)" />
                    <circle cx="600" cy="600" r="505" fill="none" stroke="url(#rim)" strokeWidth="2" opacity="0.7" />
                    <g opacity="0.25">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <circle
                          key={i}
                          cx={170 + i * 95}
                          cy={360 + (i % 2) * 22}
                          r={2 + (i % 3)}
                          fill="rgba(215,182,97,0.9)"
                        />
                      ))}
                      {Array.from({ length: 10 }).map((_, i) => (
                        <circle
                          key={`b-${i}`}
                          cx={220 + i * 90}
                          cy={430 + (i % 3) * 14}
                          r={2}
                          fill="rgba(174,90,255,0.9)"
                        />
                      ))}
                    </g>
                    <path
                      d="M 260 440 C 420 360, 520 340, 650 340 C 820 340, 900 380, 980 430"
                      fill="none"
                      stroke="rgba(174,90,255,0.35)"
                      strokeWidth="2"
                    />
                    <path
                      d="M 200 470 C 380 410, 520 400, 680 400 C 860 400, 960 440, 1020 470"
                      fill="none"
                      stroke="rgba(215,182,97,0.28)"
                      strokeWidth="2"
                    />
                  </g>
                </svg>
              </div>

              <FloatingCard
                title="Verified onboarding"
                value="KYC + AML"
                sub="Compliance-first workflow"
                icon={<ShieldCheck className="h-5 w-5 text-gold" />}
                className="left-3 top-2 w-[230px] sm:left-6 sm:top-8"
              />
              <FloatingCard
                title="Investor coverage"
                value="Pan-African"
                sub="Opportunity visibility"
                icon={<Users className="h-5 w-5 text-gold" />}
                className="right-3 top-6 w-[230px] sm:right-8 sm:top-14"
              />
              <FloatingCard
                title="Plan ROI"
                value="Stated returns"
                sub="Guaranteed per plan terms"
                icon={<TrendingUp className="h-5 w-5 text-gold" />}
                className="bottom-3 right-4 w-[240px] sm:bottom-8 sm:right-10"
              />

              <div className="relative h-[360px] sm:h-[420px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
