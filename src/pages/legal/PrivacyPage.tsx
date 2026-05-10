import { PageHero } from '@/components/marketing/PageHero'

export function PrivacyPage() {
  return (
    <div>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="This is a template policy page. Replace with a legally reviewed privacy policy that matches your data processing practices and jurisdiction."
      />
      <section className="py-10">
        <div className="aurum-container">
          <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
            <div className="p-6 text-sm text-white/70">
              <div className="font-semibold text-white/90">Data collected</div>
              <div className="mt-2 leading-relaxed">
                Account information, KYC documents, payment proofs, and usage analytics may be collected to operate the
                platform and meet compliance obligations.
              </div>
              <div className="mt-5 font-semibold text-white/90">KYC documents</div>
              <div className="mt-2 leading-relaxed">
                KYC documents are stored securely and accessed by authorized staff for verification purposes. Retention
                periods should be defined in your compliance policy.
              </div>
              <div className="mt-5 font-semibold text-white/90">Security</div>
              <div className="mt-2 leading-relaxed">
                We employ access controls and secure storage mechanisms. No system is completely secure, and users
                should use strong passwords and enable additional protections where available.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

