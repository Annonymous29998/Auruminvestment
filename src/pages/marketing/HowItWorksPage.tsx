import { HowItWorks } from '@/components/marketing/HowItWorks'
import { PageHero } from '@/components/marketing/PageHero'
import { RiskDisclaimer } from '@/components/marketing/RiskDisclaimer'

export function HowItWorksPage() {
  return (
    <div>
      <PageHero
        eyebrow="Process"
        title="How Aurum Works"
        subtitle="A professional flow designed for payment confirmation, clear audit trails, and an investor-first dashboard experience."
      />
      <HowItWorks />
      <RiskDisclaimer />
    </div>
  )
}

