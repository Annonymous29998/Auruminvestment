import { Link } from 'react-router-dom'
import { AurumMark } from '@/components/marketing/AurumMark'

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/8 bg-black/25">
      <div className="aurum-container py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <AurumMark />
            <div className="mt-4 max-w-sm text-sm text-white/60">
              A premium fintech experience for participating in African gold-backed opportunities.
              Payment confirmation by our team and compliance-first onboarding.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="flex flex-col">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/55">
                Platform
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <Link className="block text-white/70 hover:text-white" to="/#how-it-works">
                  How It Works
                </Link>
                <Link className="block text-white/70 hover:text-white" to="/#about">
                  About Us
                </Link>
                <Link className="block text-white/70 hover:text-white" to="/#faq">
                  FAQ
                </Link>
                <Link className="block text-white/70 hover:text-white" to="/#contact">
                  Contact
                </Link>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/55">
                Legal
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <Link className="block text-white/70 hover:text-white" to="/terms">
                  Terms & Conditions
                </Link>
                <Link className="block text-white/70 hover:text-white" to="/privacy">
                  Privacy Policy
                </Link>
                <Link className="block text-white/70 hover:text-white" to="/aml-kyc">
                  AML/KYC Policy
                </Link>
                <Link className="block text-white/70 hover:text-white" to="/risk-disclosure">
                  Risk Disclosure
                </Link>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/55">
                Trust
              </div>
              <div className="mt-4 space-y-2 text-sm text-white/60">
                <div>Returns follow published plan terms.</div>
                <div>KYC verification required.</div>
                <div>Payments confirmed before crediting.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/8 pt-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Aurum Investment. All rights reserved.</div>
          <div>Payouts follow each plan’s published terms; operational factors may affect timing.</div>
        </div>
      </div>
    </footer>
  )
}
