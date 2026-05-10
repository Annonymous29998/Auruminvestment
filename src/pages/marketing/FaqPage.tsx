import { Faq } from '@/components/marketing/Faq'
import { PageHero } from '@/components/marketing/PageHero'

export function FaqPage() {
  return (
    <div>
      <PageHero
        eyebrow="Help"
        title="Frequently Asked Questions"
        subtitle="Quick answers about manual payment verification, KYC requirements, and how projected returns are displayed on the platform."
      />
      <Faq />
    </div>
  )
}

