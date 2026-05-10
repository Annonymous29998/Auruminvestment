import { Faq } from '@/components/marketing/Faq'
import { PageHero } from '@/components/marketing/PageHero'

export function FaqPage() {
  return (
    <div>
      <PageHero
        eyebrow="Help"
        title="Frequently Asked Questions"
        subtitle="Quick answers about payment confirmation, KYC requirements, and how plan returns are shown on the platform."
      />
      <Faq />
    </div>
  )
}

