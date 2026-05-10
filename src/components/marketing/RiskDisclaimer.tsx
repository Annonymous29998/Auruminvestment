import { ShieldAlert } from 'lucide-react'

export function RiskDisclaimer() {
  return (
    <section className="py-12">
      <div className="aurum-container">
        <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-400/15">
                <ShieldAlert className="h-6 w-6 text-rose-300" />
              </div>
              <div>
                <div className="font-display text-lg font-semibold text-white/90">
                  Risk Disclosure
                </div>
                <div className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
                  Commodity and gold-backed participation involves risk, including price volatility, liquidity
                  constraints, operational factors, and regulatory changes. Returns shown on this platform are
                  estimates and projections and are not guaranteed.
                </div>
                <div className="mt-3 text-sm text-white/65">
                  Users must complete KYC verification. Aurum Investment operates AML compliance checks and
                  manually verifies payments for fraud prevention and auditability.
                </div>
              </div>
            </div>
            <div className="text-sm font-semibold text-white/70">
              Read full policy: <a className="aurum-gold hover:underline" href="/risk-disclosure">Risk Disclosure</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

