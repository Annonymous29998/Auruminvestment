import { useQuery } from '@tanstack/react-query'
import { ArrowRight, BarChart3, FileCheck2, ShieldCheck, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/features/auth/AuthProvider'
import { getBalanceUsd, getInvestments, getPaymentProofs } from '@/lib/api'
import { formatUsd } from '@/features/investments/calculator'

export function DashboardOverviewPage() {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  const balanceQ = useQuery({
    queryKey: ['balance', userId],
    queryFn: () => getBalanceUsd(userId),
    enabled: Boolean(userId),
    placeholderData: 0,
    retry: 0,
  })

  const investmentsQ = useQuery({
    queryKey: ['investments', userId],
    queryFn: () => getInvestments(userId),
    enabled: Boolean(userId),
    placeholderData: [],
    retry: 0,
  })

  const proofsQ = useQuery({
    queryKey: ['proofs', userId],
    queryFn: () => getPaymentProofs(userId),
    enabled: Boolean(userId),
    placeholderData: [],
    retry: 0,
  })

  const active = (investmentsQ.data ?? []).filter((i) => i.status === 'active').length
  const pendingInv = (investmentsQ.data ?? []).filter((i) => i.status === 'pending').length
  const pendingProofs = (proofsQ.data ?? []).filter((p) => p.status === 'pending').length

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Track balances, pending actions, and investment activity."
        right={
          <Link to="/app/plans">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,rgba(215,182,97,0.22),rgba(185,144,44,0.10))] px-4 py-2 text-sm font-semibold text-white ring-1 ring-[rgba(215,182,97,0.22)] transition hover:brightness-110">
              Explore Plans <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="ring-1 ring-white/10">
          <CardHeader className="flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm">Total Balance</CardTitle>
            <Wallet className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-white/90">
              {formatUsd(balanceQ.data ?? 0)}
            </div>
            <div className="mt-2 text-xs text-white/55">Balance reflects confirmed activity on your account.</div>
          </CardContent>
        </Card>

        <Card className="ring-1 ring-white/10">
          <CardHeader className="flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm">Active Investments</CardTitle>
            <BarChart3 className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-white/90">{active}</div>
            <div className="mt-2 text-xs text-white/55">Track ROI and investment status.</div>
          </CardContent>
        </Card>

        <Card className="ring-1 ring-white/10">
          <CardHeader className="flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm">Pending Requests</CardTitle>
            <ShieldCheck className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-white/90">{pendingInv}</div>
            <div className="mt-2 text-xs text-white/55">Awaiting verification.</div>
          </CardContent>
        </Card>

        <Card className="ring-1 ring-white/10">
          <CardHeader className="flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm">KYC Status</CardTitle>
            <FileCheck2 className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-white/90">
              {user?.kycStatus === 'approved'
                ? 'Approved'
                : user?.kycStatus === 'pending'
                  ? 'Pending'
                  : user?.kycStatus === 'rejected'
                    ? 'Rejected'
                    : 'Not submitted'}
            </div>
            <div className="mt-2 text-xs text-white/55">
              Pending proofs: {pendingProofs}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
          <div className="border-b border-white/10 p-6">
            <div className="text-sm font-semibold text-white/85">Recent Investments</div>
            <div className="mt-1 text-sm text-white/65">Latest activity and plan returns.</div>
          </div>
          <div className="p-6">
            {investmentsQ.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : investmentsQ.data?.length ? (
              <div className="space-y-3">
                {investmentsQ.data.slice(0, 4).map((i) => (
                  <div
                    key={i.id}
                    className="flex flex-col gap-2 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white/85">{i.planName}</div>
                      <div className="mt-0.5 text-xs text-white/55">
                        {new Date(i.createdAt).toLocaleString()} • {i.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-white/85">
                      {formatUsd(i.amountUsd)} → {formatUsd(i.projectedReturnUsd)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-white/65">
                No investments yet. Explore plans to start participating.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
          <div className="border-b border-white/10 p-6">
            <div className="text-sm font-semibold text-white/85">Next Steps</div>
            <div className="mt-1 text-sm text-white/65">Complete onboarding for full access.</div>
          </div>
          <div className="p-6 space-y-3">
            <Link
              to="/app/kyc"
              className="flex items-center justify-between rounded-2xl bg-white/5 p-4 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
            >
              Upload KYC documents
              <ArrowRight className="h-4 w-4 text-white/55" />
            </Link>
            <Link
              to="/app/payment-proofs"
              className="flex items-center justify-between rounded-2xl bg-white/5 p-4 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
            >
              Upload payment proof
              <ArrowRight className="h-4 w-4 text-white/55" />
            </Link>
            <Link
              to="/app/plans"
              className="flex items-center justify-between rounded-2xl bg-white/5 p-4 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
            >
              Choose an investment plan
              <ArrowRight className="h-4 w-4 text-white/55" />
            </Link>
            <div className="text-xs leading-relaxed text-white/55">
              Deposits and investments are activated after confirmation. Keep your account details consistent
              across payment references.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
