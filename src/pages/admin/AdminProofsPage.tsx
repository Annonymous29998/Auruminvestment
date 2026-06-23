import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreditCard } from 'lucide-react'
import { StorageFilePreviewModal, type StorageFilePreviewTarget } from '@/components/admin/StorageFilePreviewModal'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatUsd } from '@/features/investments/calculator'
import { adminApprovePaymentProof, adminListPaymentProofs, adminRejectPaymentProof } from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/env'
import { uiCopy } from '@/lib/uiCopy'
import { useToastStore } from '@/stores/toastStore'

export function AdminProofsPage() {
  const toast = useToastStore((s) => s.push)
  const qc = useQueryClient()
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [preview, setPreview] = useState<StorageFilePreviewTarget | null>(null)

  const status = useMemo(() => (filter === 'all' ? undefined : filter), [filter])
  const q = useQuery({
    queryKey: ['admin', 'payment-proofs', filter],
    queryFn: () => adminListPaymentProofs(status ? { status } : undefined),
    enabled: isSupabaseConfigured,
  })

  const approveM = useMutation({
    mutationFn: (proofId: string) => adminApprovePaymentProof({ proofId }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin', 'payment-proofs'] }),
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

  const rejectM = useMutation({
    mutationFn: (proofId: string) => adminRejectPaymentProof({ proofId }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin', 'payment-proofs'] }),
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

  function openPreview(p: { storagePath: string; userEmail: string; method: string; amountUsd: number }) {
    setPreview({
      bucket: 'payment-proofs',
      path: p.storagePath,
      title: 'Payment proof',
      subtitle: `${p.userEmail} · ${String(p.method).toUpperCase()} · ${formatUsd(p.amountUsd)}`,
    })
  }

  return (
    <div>
      <PageHeader
        title="Payment Proofs"
        subtitle="Review uploaded proofs and confirm deposits."
      />

      <StorageFilePreviewModal target={preview} onClose={() => setPreview(null)} />

      {!isSupabaseConfigured ? (
        <EmptyState
          icon={<CreditCard className="h-5 w-5 text-gold" />}
          title={uiCopy.emptyStateBackendTitle}
          description="File storage and the database must be connected before you can manage proofs here."
        />
      ) : (
        <Card className="ring-1 ring-white/10">
          <CardHeader className="flex flex-col gap-3 pb-0 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base">Proofs</CardTitle>
              <div className="mt-1 text-sm text-white/65">Review and approve deposits.</div>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <Button variant={filter === 'pending' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('pending')}>
                Pending
              </Button>
              <Button variant={filter === 'approved' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('approved')}>
                Approved
              </Button>
              <Button variant={filter === 'rejected' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('rejected')}>
                Rejected
              </Button>
              <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>
                All
              </Button>
              <Badge tone="neutral">{q.data?.length ?? 0}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {q.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : q.isError ? (
              <EmptyState
                title="Unable to load proofs"
                description={q.error instanceof Error ? q.error.message : 'Check your admin access policies.'}
              />
            ) : q.data?.length ? (
              <>
                <div className="hidden overflow-hidden rounded-2xl ring-1 ring-white/10 md:block">
                  <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/55">
                    <div className="col-span-4">User</div>
                    <div className="col-span-2">Method</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Action</div>
                  </div>
                  <div className="divide-y divide-white/10">
                    {q.data.map((p) => (
                      <div key={p.id} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm">
                        <div className="col-span-4 min-w-0">
                          <div className="truncate font-semibold text-white/85">{p.userEmail || p.userId}</div>
                          <div className="mt-1 truncate text-xs text-white/55">{p.userFullName ?? '—'}</div>
                        </div>
                        <div className="col-span-2">
                          <Badge tone="neutral">{String(p.method).toUpperCase()}</Badge>
                        </div>
                        <div className="col-span-2 text-white/80">{formatUsd(p.amountUsd)}</div>
                        <div className="col-span-2">
                          <Badge
                            tone={p.status === 'approved' ? 'success' : p.status === 'rejected' ? 'danger' : 'warning'}
                          >
                            {String(p.status).toUpperCase()}
                          </Badge>
                        </div>
                        <div className="col-span-2 flex flex-wrap justify-end gap-2">
                          {p.storagePath ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openPreview({
                                  storagePath: p.storagePath!,
                                  userEmail: p.userEmail || p.userId,
                                  method: String(p.method),
                                  amountUsd: p.amountUsd,
                                })
                              }
                            >
                              View
                            </Button>
                          ) : null}
                          {p.status === 'pending' ? (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => approveM.mutate(p.id)}
                                disabled={approveM.isPending || rejectM.isPending}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => rejectM.mutate(p.id)}
                                disabled={approveM.isPending || rejectM.isPending}
                              >
                                Reject
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 md:hidden">
                  {q.data.map((p) => (
                    <div key={p.id} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                      <div className="wrap-break-word font-semibold text-white/85">{p.userEmail || p.userId}</div>
                      <div className="mt-1 text-sm text-white/55">{p.userFullName ?? '—'}</div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">{String(p.method).toUpperCase()}</Badge>
                        <span className="font-semibold text-white/85">{formatUsd(p.amountUsd)}</span>
                        <Badge
                          tone={p.status === 'approved' ? 'success' : p.status === 'rejected' ? 'danger' : 'warning'}
                        >
                          {String(p.status).toUpperCase()}
                        </Badge>
                      </div>
                      <div className="mt-4 flex flex-col gap-2">
                        {p.storagePath ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              openPreview({
                                storagePath: p.storagePath!,
                                userEmail: p.userEmail || p.userId,
                                method: String(p.method),
                                amountUsd: p.amountUsd,
                              })
                            }
                          >
                            View proof
                          </Button>
                        ) : null}
                        {p.status === 'pending' ? (
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="flex-1"
                              onClick={() => approveM.mutate(p.id)}
                              disabled={approveM.isPending || rejectM.isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1"
                              onClick={() => rejectM.mutate(p.id)}
                              disabled={approveM.isPending || rejectM.isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-sm text-white/65">No proofs found for this filter.</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
