import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Modal } from '@/components/ui/Modal'
import { CryptoPaymentPanel } from '@/features/payments/CryptoPaymentPanel'
import { estimateProjectedReturn, formatUsd } from '@/features/investments/calculator'
import { useAuth } from '@/features/auth/AuthProvider'
import { createInvestmentRequest, ensureUserProfile, getInvestmentPlans } from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/env'
import { useToastStore } from '@/stores/toastStore'
import type { InvestmentPlan } from '@/types/domain'

type Step = 'choose' | 'payment'

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  return 'Unable to create investment request'
}

export function PlansPage() {
  const toast = useToastStore((s) => s.push)
  const qc = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id ?? ''

  const plansQ = useQuery({
    queryKey: ['plans'],
    queryFn: getInvestmentPlans,
    staleTime: 5 * 60_000,
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: isSupabaseConfigured,
  })

  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null)
  const [amountUsd, setAmountUsd] = useState<number>(0)
  const [step, setStep] = useState<Step>('choose')

  const createInvM = useMutation({
    mutationFn: async (args: { plan: InvestmentPlan; amountUsd: number }) =>
      createInvestmentRequest({ userId, plan: args.plan, amountUsd: args.amountUsd }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['investments', userId] }),
        qc.invalidateQueries({ queryKey: ['transactions', userId] }),
        qc.invalidateQueries({ queryKey: ['balance', userId] }),
      ])
    },
  })

  const projected = useMemo(() => {
    if (!selectedPlan || !amountUsd) return 0
    return estimateProjectedReturn({ principalUsd: amountUsd, roiPercent: selectedPlan.estimatedRoiPercent })
  }, [amountUsd, selectedPlan])

  function openInvest(plan: InvestmentPlan) {
    setSelectedPlan(plan)
    setAmountUsd(plan.minInvestmentUsd)
    setStep('choose')
  }

  async function createInvestmentOrWarn() {
    if (!selectedPlan) return
    if (!userId) {
      toast({ tone: 'warning', title: 'Sign in required', message: 'Please sign in to start investing.' })
      return
    }
    if (user?.kycStatus !== 'approved') {
      toast({
        tone: 'warning',
        title: 'KYC required',
        message: 'Complete KYC verification before creating an investment request.',
      })
      return
    }
    if (amountUsd < selectedPlan.minInvestmentUsd) {
      toast({
        tone: 'warning',
        title: 'Amount too low',
        message: `Minimum for this plan is ${formatUsd(selectedPlan.minInvestmentUsd)}.`,
      })
      return
    }
    if (!user?.email) {
      toast({ tone: 'danger', title: 'Profile error', message: 'Missing account email. Please sign in again.' })
      return
    }
    try {
      await ensureUserProfile({ userId, email: user.email, fullName: user.fullName })
      await createInvM.mutateAsync({ plan: selectedPlan, amountUsd })
      toast({
        tone: 'success',
        title: 'Investment request created',
        message: 'Next, submit your payment proof below.',
      })
      setStep('payment')
    } catch (err) {
      const raw = getErrorMessage(err)
      let message = raw
      if (raw.includes('violates foreign key constraint') && raw.includes('investments_user_id_fkey')) {
        message =
          'Your profile is not ready yet. In Supabase, run the SQL that creates the user profile trigger + insert policy, then refresh and try again.'
      } else if (raw.toLowerCase().includes('row-level security')) {
        message = 'Your Supabase security rules blocked this action. Please apply the users insert policy + trigger, then try again.'
      } else if (raw.toLowerCase().includes('jwt') && raw.toLowerCase().includes('expired')) {
        message = 'Your session expired. Please sign in again and retry.'
      }
      toast({ tone: 'danger', title: 'Request failed', message })
    }
  }

  function closeAll() {
    setSelectedPlan(null)
    setAmountUsd(0)
    setStep('choose')
  }

  return (
    <div>
      <PageHeader
        title="Investment Plans"
        subtitle="Choose a tier, create an investment request, then submit your payment details from the dashboard."
      />

      {plansQ.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-52 rounded-3xl bg-white/6 ring-1 ring-white/10 animate-pulse" />
          <div className="h-52 rounded-3xl bg-white/6 ring-1 ring-white/10 animate-pulse" />
          <div className="h-52 rounded-3xl bg-white/6 ring-1 ring-white/10 animate-pulse" />
          <div className="h-52 rounded-3xl bg-white/6 ring-1 ring-white/10 animate-pulse" />
        </div>
      ) : plansQ.isError ? (
        <div className="rounded-3xl aurum-glass ring-1 ring-white/10 p-8 text-sm text-white/65">
          <div>Unable to load investment plans. {getErrorMessage(plansQ.error)}</div>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => plansQ.refetch()}>
              Retry
            </Button>
          </div>
        </div>
      ) : plansQ.data?.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {plansQ.data.map((p) => (
            <Card key={p.id} className="ring-1 ring-white/10">
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <div className="mt-1 text-sm text-white/65">{p.summary}</div>
                  </div>
                  <Badge tone="neutral">{p.durationDays} days</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="text-xs text-white/55">Minimum</div>
                    <div className="mt-1 text-sm font-semibold text-white/85">
                      {formatUsd(p.minInvestmentUsd)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="text-xs text-white/55">Estimated ROI</div>
                    <div className="mt-1 text-sm font-semibold text-white/85">{p.estimatedRoiPercent}%</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="text-xs text-white/55">Projected</div>
                    <div className="mt-1 text-sm font-semibold text-white/85">
                      {formatUsd(estimateProjectedReturn({ principalUsd: p.minInvestmentUsd, roiPercent: p.estimatedRoiPercent }))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {p.highlights.slice(0, 4).map((h) => (
                    <div key={h} className="flex items-center gap-2 rounded-2xl bg-white/4 px-3 py-2 text-sm text-white/70 ring-1 ring-white/10">
                      <ShieldCheck className="h-4 w-4 text-gold" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-white/55">
                    Returns are estimates and not guaranteed. KYC verification required before withdrawals.
                  </div>
                  <Button variant="primary" onClick={() => openInvest(p)}>
                    Invest <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl aurum-glass ring-1 ring-white/10 p-8 text-sm text-white/65">
          No investment plans configured yet.
        </div>
      )}

      <Modal
        open={Boolean(selectedPlan)}
        onClose={closeAll}
        title={selectedPlan ? `Invest — ${selectedPlan.name}` : 'Invest'}
        description="Create an investment request, then submit bank transfer or crypto proof from your account."
      >
        {selectedPlan ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Amount (USD)</Label>
                <Input
                  inputMode="decimal"
                  value={String(amountUsd || '')}
                  onChange={(e) => setAmountUsd(Number(e.target.value))}
                />
                <div className="text-xs text-white/55">
                  Minimum: {formatUsd(selectedPlan.minInvestmentUsd)}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-xs text-white/55">Estimated return</div>
                <div className="mt-2 text-lg font-semibold text-white/90">{formatUsd(projected)}</div>
                <div className="mt-1 text-xs text-white/55">
                  Based on projected ROI of {selectedPlan.estimatedRoiPercent}% over {selectedPlan.durationDays} days.
                </div>
              </div>
            </div>

            {step === 'choose' ? (
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  disabled={createInvM.isPending}
                  onClick={() => createInvestmentOrWarn()}
                >
                  {createInvM.isPending ? 'Creating request…' : 'Create investment request'}
                </Button>
                <div className="text-xs text-white/55">
                  After request creation, choose a payment method below.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <CryptoPaymentPanel
                  userId={userId}
                  initialAmountUsd={amountUsd}
                  defaultMethod="bank_transfer"
                  methodMode="bank_crypto"
                  onSubmitted={async () => {
                    await qc.invalidateQueries({ queryKey: ['proofs', userId] })
                  }}
                />
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
