import { useQuery } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { CryptoPaymentPanel } from '@/features/payments/CryptoPaymentPanel'
import { useAuth } from '@/features/auth/AuthProvider'
import { formatUsd } from '@/features/investments/calculator'
import { getPaymentProofs } from '@/lib/api'

function formatProofMethod(method: string) {
  const m: Record<string, string> = {
    bank_transfer: 'Bank transfer',
    btc: 'BTC',
    usdt: 'USDT',
    card: 'Card',
  }
  return m[method] ?? method.toUpperCase()
}

export function PaymentProofsPage() {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  const q = useQuery({
    queryKey: ['proofs', userId],
    queryFn: () => getPaymentProofs(userId),
    enabled: Boolean(userId),
    placeholderData: [],
    retry: 0,
  })

  return (
    <div>
      <PageHeader
        title="Payment Proofs"
        subtitle="Submit bank transfer or crypto proof with a reference or receipt when you fund your account."
        right={<Badge tone="neutral">Verification</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
          <div className="border-b border-white/10 p-6">
            <div className="text-sm font-semibold text-white/85">Submitted proofs</div>
            <div className="mt-1 text-sm text-white/65">Proofs are reviewed and verified after checks.</div>
          </div>
          <div className="p-6">
            {q.isError ? (
              <EmptyState
                icon={<ShieldCheck className="h-5 w-5 text-gold" />}
                title="Unable to load proofs"
                description="Please refresh the page."
              />
            ) : q.data?.length ? (
              <div className="space-y-3">
                {q.data.map((p) => (
                  <div key={p.id} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white/85">
                          {formatProofMethod(p.method)} • {formatUsd(p.amountUsd)}
                        </div>
                        <div className="mt-1 text-xs text-white/55">{new Date(p.createdAt).toLocaleString()}</div>
                        {p.txHash ? (
                          <div className="mt-2 text-xs text-white/65">
                            TX: <span className="font-mono text-white/80">{p.txHash}</span>
                          </div>
                        ) : null}
                        {p.storagePath ? (
                          <div className="mt-1 text-xs text-white/55">Proof: {p.storagePath}</div>
                        ) : null}
                      </div>
                      <Badge tone={p.status === 'approved' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}>
                        {p.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<ShieldCheck className="h-5 w-5 text-gold" />}
                title="No proofs submitted"
                description="Submit a bank or crypto payment proof so we can credit your account."
              />
            )}
          </div>
        </div>

        <CryptoPaymentPanel userId={userId} methodMode="bank_crypto" defaultMethod="bank_transfer" />
      </div>
    </div>
  )
}
