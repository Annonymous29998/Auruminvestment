import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const items = [
  {
    q: 'Are returns guaranteed?',
    a: 'No. All investments involve risk. Figures displayed are estimated or projected and may change based on market conditions, execution, and operational factors.',
  },
  {
    q: 'Why is payment processing manual?',
    a: 'Aurum Investment uses manual verification to support compliance checks, reduce fraud, and ensure accurate reconciliation for bank and crypto payments.',
  },
  {
    q: 'Do I need to complete KYC?',
    a: 'Yes. KYC verification is required before withdrawals and may be required before certain investment tiers. Upload documents directly from your dashboard.',
  },
  {
    q: 'Can I invest with crypto?',
    a: 'Yes. You can send BTC or USDT to the provided wallet addresses and upload a transaction hash or proof. A compliance admin verifies deposits manually.',
  },
]

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-14">
      <div className="aurum-container">
        <div className="text-xs font-semibold uppercase tracking-wider text-white/55">FAQ</div>
        <div className="mt-2 font-display text-2xl font-semibold text-white/90">
          Answers investors expect
        </div>

        <div className="mt-8 space-y-3">
          {items.map((it, idx) => {
            const open = openIndex === idx
            return (
              <div key={it.q} className="rounded-3xl aurum-glass ring-1 ring-white/10">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <div className="text-sm font-semibold text-white/85">{it.q}</div>
                  <ChevronDown className={cn('h-5 w-5 text-white/55 transition', open ? 'rotate-180' : '')} />
                </button>
                {open ? (
                  <div className="border-t border-white/10 px-6 py-5 text-sm leading-relaxed text-white/70">
                    {it.a}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

