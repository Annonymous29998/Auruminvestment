import { PageHero } from '@/components/marketing/PageHero'

export function TermsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        subtitle="This is a template policy page. Replace with legally reviewed terms for your jurisdiction and product structure."
      />
      <section className="py-10">
        <div className="aurum-container">
          <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
            <div className="p-6 text-sm text-white/70">
              <div className="font-semibold text-white/90">1. Nature of service</div>
              <div className="mt-2 leading-relaxed">
                Aurum Investment provides a software platform for participating in gold-backed opportunities.
                Information presented is for general purposes and does not constitute financial advice.
              </div>
              <div className="mt-5 font-semibold text-white/90">2. Risk</div>
              <div className="mt-2 leading-relaxed">
                Investments involve risk, including loss of capital. Any projected ROI is an estimate and may vary
                based on market and operational factors.
              </div>
              <div className="mt-5 font-semibold text-white/90">3. Verification</div>
              <div className="mt-2 leading-relaxed">
                Users must complete KYC verification and AML screening as required. Payments may be verified manually
                before activation of investments.
              </div>
              <div className="mt-5 font-semibold text-white/90">4. Withdrawals</div>
              <div className="mt-2 leading-relaxed">
                Withdrawals are subject to verification checks, processing rules, and compliance review.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
