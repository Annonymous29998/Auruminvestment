import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatUsd } from '@/features/investments/calculator'
import {
  adminApproveInvestment,
  adminApprovePaymentProof,
  adminListPendingInvestments,
  adminListPaymentProofs,
  adminRejectInvestment,
  adminRejectPaymentProof,
} from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/env'
import { useToastStore } from '@/stores/toastStore'

export function AdminApprovalsPage() {
  const toast = useToastStore((s) => s.push)
  const qc = useQueryClient()

  const invQ = useQuery({
    queryKey: ['admin', 'pending-investments'],
    queryFn: adminListPendingInvestments,
    enabled: isSupabaseConfigured,
  })

  const proofsQ = useQuery({
    queryKey: ['admin', 'pending-payment-proofs'],
    queryFn: () => adminListPaymentProofs({ status: 'pending' }),
    enabled: isSupabaseConfigured,
  })

  const approveInvestmentM = useMutation({
    mutationFn: (investmentId: string) => adminApproveInvestment({ investmentId }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin', 'pending-investments'] }),
        qc.invalidateQueries({ queryKey: ['admin', 'overview-metrics'] }),
      ])
      toast({ tone: 'success', title: 'Approved', message: 'Investment request approved.' })
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Unable to approve'
      toast({ tone: 'danger', title: 'Failed', message: msg })
    },
  })

  const rejectInvestmentM = useMutation({
    mutationFn: (investmentId: string) => adminRejectInvestment({ investmentId }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin', 'pending-investments'] }),
        qc.invalidateQueries({ queryKey: ['admin', 'overview-metrics'] }),
      ])
      toast({ tone: 'success', title: 'Rejected', message: 'Investment request rejected.' })
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Unable to reject'
      toast({ tone: 'danger', title: 'Failed', message: msg })
    },
  })

  const approveProofM = useMutation({
    mutationFn: (proofId: string) => adminApprovePaymentProof({ proofId }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin', 'pending-payment-proofs'] }),
        qc.invalidateQueries({ queryKey: ['admin', 'overview-metrics'] }),
        qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
      ])
      toast({ tone: 'success', title: 'Approved', message: 'Payment proof approved and balance updated.' })
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Unable to approve'
      toast({ tone: 'danger', title: 'Failed', message: msg })
    },
  })

  const rejectProofM = useMutation({
    mutationFn: (proofId: string) => adminRejectPaymentProof({ proofId }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin', 'pending-payment-proofs'] }),
        qc.invalidateQueries({ queryKey: ['admin', 'overview-metrics'] }),
      ])
      toast({ tone: 'success', title: 'Rejected', message: 'Payment proof rejected.' })
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Unable to reject'
      toast({ tone: 'danger', title: 'Failed', message: msg })
    },
  })

  return (
    <div>
      <PageHeader
        title="Approvals"
        subtitle="Approve investments and deposits after manual review."
      />

      {!isSupabaseConfigured ? (
        <EmptyState
          icon={<ShieldCheck className="h-5 w-5 text-gold" />}
          title="Supabase required"
          description="Configure Supabase to load pending approvals."
        />
      ) : (
        <div className="space-y-4">
          <Card className="ring-1 ring-white/10">
            <CardHeader className="flex-row items-center justify-between pb-0">
              <div>
                <CardTitle className="text-base">Pending investments</CardTitle>
                <div className="mt-1 text-sm text-white/65">Approve or reject new investment requests.</div>
              </div>
              <Badge tone="warning">{invQ.data?.length ?? 0}</Badge>
            </CardHeader>
            <CardContent className="pt-6">
              {invQ.isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : invQ.isError ? (
                <EmptyState
                  title="Unable to load investments"
                  description={invQ.error instanceof Error ? invQ.error.message : 'Check your admin access policies.'}
                />
              ) : invQ.data?.length ? (
                <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
                  <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/55">
                    <div className="col-span-5">User</div>
                    <div className="col-span-3">Plan</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-2 text-right">Action</div>
                  </div>
                  <div className="divide-y divide-white/10">
                    {invQ.data.map((inv) => (
                      <div key={inv.id} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm">
                        <div className="col-span-5 min-w-0">
                          <div className="truncate font-semibold text-white/85">{inv.userEmail || inv.userId}</div>
                          <div className="mt-1 truncate text-xs text-white/55">{inv.userFullName ?? '—'}</div>
                        </div>
                        <div className="col-span-3 text-white/80">{inv.planName}</div>
                        <div className="col-span-2 text-white/80">{formatUsd(inv.amountUsd)}</div>
                        <div className="col-span-2 flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => approveInvestmentM.mutate(inv.id)}
                            disabled={approveInvestmentM.isPending || rejectInvestmentM.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rejectInvestmentM.mutate(inv.id)}
                            disabled={approveInvestmentM.isPending || rejectInvestmentM.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-white/65">No pending investment requests.</div>
              )}
            </CardContent>
          </Card>

          <Card className="ring-1 ring-white/10">
            <CardHeader className="flex-row items-center justify-between pb-0">
              <div>
                <CardTitle className="text-base">Pending payment proofs</CardTitle>
                <div className="mt-1 text-sm text-white/65">Approve deposits and update balances.</div>
              </div>
              <Badge tone="warning">{proofsQ.data?.length ?? 0}</Badge>
            </CardHeader>
            <CardContent className="pt-6">
              {proofsQ.isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : proofsQ.isError ? (
                <EmptyState
                  title="Unable to load payment proofs"
                  description={proofsQ.error instanceof Error ? proofsQ.error.message : 'Check your admin access policies.'}
                />
              ) : proofsQ.data?.length ? (
                <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
                  <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/55">
                    <div className="col-span-5">User</div>
                    <div className="col-span-3">Method</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-2 text-right">Action</div>
                  </div>
                  <div className="divide-y divide-white/10">
                    {proofsQ.data.map((p) => (
                      <div key={p.id} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm">
                        <div className="col-span-5 min-w-0">
                          <div className="truncate font-semibold text-white/85">{p.userEmail || p.userId}</div>
                          <div className="mt-1 truncate text-xs text-white/55">{p.userFullName ?? '—'}</div>
                        </div>
                        <div className="col-span-3 text-white/80">
                          <Badge tone="neutral">{String(p.method).toUpperCase()}</Badge>
                        </div>
                        <div className="col-span-2 text-white/80">{formatUsd(p.amountUsd)}</div>
                        <div className="col-span-2 flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => approveProofM.mutate(p.id)}
                            disabled={approveProofM.isPending || rejectProofM.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rejectProofM.mutate(p.id)}
                            disabled={approveProofM.isPending || rejectProofM.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-white/65">No pending payment proofs.</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
