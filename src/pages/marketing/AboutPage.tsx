import { ShieldCheck, TrendingUp, Users } from 'lucide-react'
import { PageHero } from '@/components/marketing/PageHero'

export function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="About Us"
        title="Aurum Investment"
        subtitle="A premium fintech product concept focused on African gold investment opportunities, with a compliance-first onboarding experience and enterprise-level dashboards."
      />

      <section className="py-10">
        <div className="aurum-container">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
              <div className="p-6">
                <ShieldCheck className="h-6 w-6 text-gold" />
                <div className="mt-3 text-base font-semibold text-white/90">Trust & Compliance</div>
                <div className="mt-2 text-sm leading-relaxed text-white/70">
                  KYC verification, AML checks, and manual payment review are designed to support fraud prevention and
                  auditability.
                </div>
              </div>
            </div>
            <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
              <div className="p-6">
                <TrendingUp className="h-6 w-6 text-gold" />
                <div className="mt-3 text-base font-semibold text-white/90">Investor Reporting</div>
                <div className="mt-2 text-sm leading-relaxed text-white/70">
                  A dashboard aesthetic inspired by modern fintech startups with balance, ROI tracking, receipts, and
                  activity logs.
                </div>
              </div>
            </div>
            <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
              <div className="p-6">
                <Users className="h-6 w-6 text-gold" />
                <div className="mt-3 text-base font-semibold text-white/90">Human Verification</div>
                <div className="mt-2 text-sm leading-relaxed text-white/70">
                  Card and bank transfer payments are completed via support, and crypto deposits are verified by an
                  admin team.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl aurum-glass ring-1 ring-white/10">
            <div className="p-6 text-sm leading-relaxed text-white/70">
              This project template is built to avoid unrealistic claims. All ROI and statistics shown are examples.
              Replace with audited disclosures and region-specific compliance guidance before launching any live
              service.
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

