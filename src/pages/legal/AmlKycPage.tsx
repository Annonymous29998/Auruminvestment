import { PageHero } from '@/components/marketing/PageHero'

export function AmlKycPage() {
  return (
    <div>
      <PageHero
        eyebrow="Compliance"
        title="AML/KYC Policy"
        subtitle="This is a template policy page. Replace with a compliance-reviewed AML/KYC policy tailored to your jurisdiction and onboarding requirements."
      />
      <section className="py-10">
        <div className="aurum-container">
          <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
            <div className="p-6 text-sm text-white/70">
              <div className="font-semibold text-white/90">KYC requirement</div>
              <div className="mt-2 leading-relaxed">
                Users must provide identity verification documents and may be asked for additional information depending
                on risk assessment and transaction history.
              </div>
              <div className="mt-5 font-semibold text-white/90">AML screening</div>
              <div className="mt-2 leading-relaxed">
                We may screen users and transactions to detect suspicious activity. Manual payment verification supports
                reconciliation and compliance checks.
              </div>
              <div className="mt-5 font-semibold text-white/90">Source of funds</div>
              <div className="mt-2 leading-relaxed">
                Additional documentation may be requested for higher tiers or when required by regulation, including
                source-of-funds verification.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

