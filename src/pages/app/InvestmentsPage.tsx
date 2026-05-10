import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BarChart3, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/features/auth/AuthProvider'
import { formatUsd } from '@/features/investments/calculator'
import { cancelPendingInvestment, getInvestments } from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/env'
import { useToastStore } from '@/stores/toastStore'

export function InvestmentsPage() {
  const toast = useToastStore((s) => s.push)
  const qc = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id ?? ''

  const q = useQuery({
    queryKey: ['investments', userId],
    queryFn: () => getInvestments(userId),
    enabled: Boolean(userId),
    placeholderData: [],
    retry: 0,
  })

  const cancelM = useMutation({
    mutationFn: (investmentId: string) => cancelPendingInvestment({ investmentId }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['investments', userId] }),
        qc.invalidateQueries({ queryKey: ['admin', 'pending-investments'] }),
      ])
      toast({ tone: 'success', title: 'Request cancelled', message: 'Your pending investment request was withdrawn.' })
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Unable to cancel'
      toast({ tone: 'danger', title: 'Cancel failed', message: msg })
    },
  })

  function confirmCancel(investmentId: string) {
    if (
      !window.confirm(
        'Cancel this investment request? You can create a new one later from Investment Plans. This only applies before the request is approved.',
      )
    ) {
      return
    }
    cancelM.mutate(investmentId)
  }

  return (
    <div>
      <PageHeader
        title="Investments"
        subtitle="Track status, projected returns, and investment history."
        right={
          <Link to="/app/plans" className="hidden sm:block">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white/6 px-4 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white">
              Explore Plans <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        }
      />

      {q.isError ? (
        <EmptyState
          icon={<BarChart3 className="h-5 w-5 text-gold" />}
          title="Unable to load investments"
          description="Please refresh the page."
        />
      ) : q.data?.length ? (
        <div className="space-y-3">
          {q.data.map((i) => (
            <div
              key={i.id}
              className="rounded-3xl aurum-glass ring-1 ring-white/10"
            >
              <div className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="truncate font-display text-lg font-semibold text-white/90">
                      {i.planName}
                    </div>
                    <div className="mt-1 text-sm text-white/65">
                      Created {new Date(i.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={
                        i.status === 'active'
                          ? 'success'
                          : i.status === 'pending'
                            ? 'warning'
                            : i.status === 'completed'
                              ? 'neutral'
                              : i.status === 'cancelled'
                                ? 'neutral'
                                : 'danger'
                      }
                    >
                      {i.status.toUpperCase()}
                    </Badge>
                    <div className="rounded-2xl bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 ring-1 ring-white/10">
                      {formatUsd(i.amountUsd)} → {formatUsd(i.projectedReturnUsd)}
                    </div>
                    {i.status === 'pending' ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white"
                        disabled={cancelM.isPending || !isSupabaseConfigured}
                        onClick={() => confirmCancel(i.id)}
                      >
                        {cancelM.isPending ? 'Cancelling…' : 'Cancel request'}
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="text-xs text-white/55">Principal</div>
                    <div className="mt-1 text-sm font-semibold text-white/85">{formatUsd(i.amountUsd)}</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="text-xs text-white/55">Projected return</div>
                    <div className="mt-1 text-sm font-semibold text-white/85">{formatUsd(i.projectedReturnUsd)}</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="text-xs text-white/55">Timeline</div>
                    <div className="mt-1 text-sm font-semibold text-white/85">
                      {i.startedAt ? new Date(i.startedAt).toLocaleDateString() : '—'} →{' '}
                      {i.endsAt ? new Date(i.endsAt).toLocaleDateString() : '—'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-white/55">
                  Investments involve risk. Returns are estimates and not guaranteed. Activation occurs after your request is confirmed.
                  {i.status === 'pending'
                    ? ' You may cancel a pending request before it is approved (for example, if you have not completed payment yet).'
                    : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BarChart3 className="h-5 w-5 text-gold" />}
          title="No investments yet"
          description="Choose an investment plan to create your first request."
          action={
            <Link to="/app/plans">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--gold),var(--gold2))] px-5 py-3 text-sm font-semibold text-black">
                Explore Plans <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          }
        />
      )}
    </div>
  )
}
