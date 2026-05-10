import { PageHero } from '@/components/marketing/PageHero'

export function RiskDisclosurePage() {
  return (
    <div>
      <PageHero
        eyebrow="Disclosure"
        title="Risk Disclosure"
        subtitle="This is a template risk disclosure page. Replace with legally reviewed disclosures for your product structure and jurisdiction."
      />
      <section className="py-10">
        <div className="aurum-container">
          <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
            <div className="p-6 text-sm text-white/70">
              <div className="font-semibold text-white/90">Market risk</div>
              <div className="mt-2 leading-relaxed">
                Gold prices can fluctuate due to macroeconomic factors, currency movements, and market sentiment.
                Payouts and return schedules follow the investment plan you select; returns are guaranteed as described
                in each plan’s terms and disclosures.
              </div>
              <div className="mt-5 font-semibold text-white/90">Liquidity risk</div>
              <div className="mt-2 leading-relaxed">
                Liquidity may vary by investment plan and operational conditions. Withdrawal requests may require review
                and processing time.
              </div>
              <div className="mt-5 font-semibold text-white/90">Operational risk</div>
              <div className="mt-2 leading-relaxed">
                Payment confirmation, compliance review, and administrative processes can introduce delays. Ensure you
                provide accurate payment references and proof uploads.
              </div>
              <div className="mt-5 font-semibold text-white/90">Regulatory risk</div>
              <div className="mt-2 leading-relaxed">
                Regulations may change and could affect access, onboarding, or product availability in some regions.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

