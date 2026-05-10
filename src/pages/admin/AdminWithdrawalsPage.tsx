import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Wallet } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatUsd } from '@/features/investments/calculator'
import { formatWithdrawalDestinationDisplay } from '@/features/withdrawals/withdrawalDestination'
import {
  adminApproveWithdrawal,
  adminListPendingWithdrawals,
  adminRejectWithdrawal,
} from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/env'
import { uiCopy } from '@/lib/uiCopy'
import { useToastStore } from '@/stores/toastStore'

export function AdminWithdrawalsPage() {
  const toast = useToastStore((s) => s.push)
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ['admin', 'pending-withdrawals'],
    queryFn: adminListPendingWithdrawals,
    enabled: isSupabaseConfigured,
  })

  const approveM = useMutation({
    mutationFn: (id: string) => adminApproveWithdrawal({ withdrawalId: id }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin', 'pending-withdrawals'] }),
        qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
        qc.invalidateQueries({ queryKey: ['balance'] }),
        qc.invalidateQueries({ queryKey: ['withdrawals'] }),
        qc.invalidateQueries({ queryKey: ['transactions'] }),
        qc.invalidateQueries({ queryKey: ['admin', 'overview-metrics'] }),
      ])
      toast({ tone: 'success', title: 'Approved', message: 'Withdrawal completed and balance updated.' })
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Unable to approve'
      toast({ tone: 'danger', title: 'Failed', message: msg })
    },
  })

  const rejectM = useMutation({
    mutationFn: (id: string) => adminRejectWithdrawal({ withdrawalId: id }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin', 'pending-withdrawals'] }),
        qc.invalidateQueries({ queryKey: ['withdrawals'] }),
        qc.invalidateQueries({ queryKey: ['admin', 'overview-metrics'] }),
      ])
      toast({ tone: 'success', title: 'Rejected', message: 'Withdrawal request was rejected.' })
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Unable to reject'
      toast({ tone: 'danger', title: 'Failed', message: msg })
    },
  })

  return (
    <div>
      <PageHeader title="Withdrawals" subtitle="Review payout requests and approve or reject them." />

      {!isSupabaseConfigured ? (
        <EmptyState
          icon={<Wallet className="h-5 w-5 text-gold" />}
          title={uiCopy.emptyStateBackendTitle}
          description={uiCopy.emptyStateBackendDescription}
        />
      ) : (
        <Card className="ring-1 ring-white/10">
          <CardHeader className="flex-row items-center justify-between pb-0">
            <div>
              <CardTitle className="text-base">Pending withdrawal requests</CardTitle>
              <div className="mt-1 text-sm text-white/65">Amount is deducted from the user balance only when you approve.</div>
            </div>
            <Badge tone="warning">{q.data?.length ?? 0}</Badge>
          </CardHeader>
          <CardContent className="pt-6">
            {q.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : q.isError ? (
              <EmptyState
                title="Unable to load withdrawals"
                description={q.error instanceof Error ? q.error.message : 'Check your admin access policies.'}
              />
            ) : q.data?.length ? (
              <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
                <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/55">
                  <div className="col-span-3">User</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-4">Destination</div>
                  <div className="col-span-3 text-right">Action</div>
                </div>
                <div className="divide-y divide-white/10">
                  {q.data.map((w) => (
                    <div key={w.id} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm">
                      <div className="col-span-3 min-w-0">
                        <div className="truncate font-semibold text-white/85">{w.userEmail || w.userId}</div>
                        <div className="mt-1 truncate text-xs text-white/55">{w.userFullName ?? '—'}</div>
                      </div>
                      <div className="col-span-2 text-white/80">{formatUsd(w.amountUsd)}</div>
                      <div className="col-span-4 min-w-0">
                        <div
                          className="line-clamp-4 whitespace-pre-line wrap-break-word text-xs text-white/70"
                          title={formatWithdrawalDestinationDisplay(w.destination)}
                        >
                          {formatWithdrawalDestinationDisplay(w.destination)}
                        </div>
                      </div>
                      <div className="col-span-3 flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => approveM.mutate(w.id)}
                          disabled={approveM.isPending || rejectM.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => rejectM.mutate(w.id)}
                          disabled={approveM.isPending || rejectM.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-white/65">No pending withdrawal requests.</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
