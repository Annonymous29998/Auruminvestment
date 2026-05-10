import { useQuery } from '@tanstack/react-query'
import { CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/features/auth/AuthProvider'
import { formatUsd } from '@/features/investments/calculator'
import { getTransactions } from '@/lib/api'

export function TransactionsPage() {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  const q = useQuery({
    queryKey: ['transactions', userId],
    queryFn: () => getTransactions(userId),
    enabled: Boolean(userId),
    placeholderData: [],
    retry: 0,
  })

  return (
    <div>
      <PageHeader title="Transactions" subtitle="Deposits, investments, withdrawals, and adjustments." />

      {q.isError ? (
        <EmptyState
          icon={<CreditCard className="h-5 w-5 text-gold" />}
          title="Unable to load transactions"
          description="Please refresh the page."
        />
      ) : q.data?.length ? (
        <div className="overflow-hidden rounded-3xl aurum-glass ring-1 ring-white/10">
          <div className="grid grid-cols-12 gap-3 border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/55">
            <div className="col-span-4">Type</div>
            <div className="col-span-3">Amount</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2 text-right">Date</div>
          </div>
          <div className="divide-y divide-white/10">
            {q.data.map((t) => (
              <div key={t.id} className="grid grid-cols-12 gap-3 px-6 py-4 text-sm">
                <div className="col-span-4 font-semibold text-white/85">{t.type.toUpperCase()}</div>
                <div className="col-span-3 text-white/80">{formatUsd(t.amountUsd)}</div>
                <div className="col-span-3">
                  <Badge
                    tone={
                      t.status === 'confirmed'
                        ? 'success'
                        : t.status === 'pending'
                          ? 'warning'
                          : 'danger'
                    }
                  >
                    {t.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="col-span-2 text-right text-white/60">
                  {new Date(t.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<CreditCard className="h-5 w-5 text-gold" />}
          title="No transactions yet"
          description="When you create investments or upload payment proofs, transactions will appear here."
        />
      )}
    </div>
  )
}
