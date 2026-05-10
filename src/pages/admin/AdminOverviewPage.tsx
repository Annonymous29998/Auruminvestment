import { useQuery } from '@tanstack/react-query'
import { Activity, ShieldCheck, Users, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatUsd } from '@/features/investments/calculator'
import { isSupabaseConfigured } from '@/lib/env'
import { adminGetOverviewMetrics } from '@/lib/api'

export function AdminOverviewPage() {
  const q = useQuery({
    queryKey: ['admin', 'overview-metrics'],
    queryFn: adminGetOverviewMetrics,
    enabled: isSupabaseConfigured,
  })

  return (
    <div>
      <PageHeader
        title="Admin Overview"
        subtitle="Monitor users, approvals, proofs, and platform activity."
      />

      {!isSupabaseConfigured ? (
        <div className="rounded-3xl aurum-glass ring-1 ring-white/10 p-6 text-sm text-white/70">
          Supabase is not configured. Connect Supabase to enable admin operations (users, approvals, proofs, analytics).
        </div>
      ) : q.isError ? (
        <EmptyState
          icon={<Activity className="h-5 w-5 text-gold" />}
          title="Unable to load admin metrics"
          description={q.error instanceof Error ? q.error.message : 'Check your Supabase admin access policies.'}
        />
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        <Card className="ring-1 ring-white/10">
          <CardHeader className="flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm">Users</CardTitle>
            <Users className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-white/90">{q.data?.usersCount ?? '—'}</div>
            <div className="mt-2 text-xs text-white/55">Total registered accounts.</div>
          </CardContent>
        </Card>
        <Card className="ring-1 ring-white/10">
          <CardHeader className="flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm">Pending proofs</CardTitle>
            <ShieldCheck className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-white/90">{q.data?.pendingProofsCount ?? '—'}</div>
            <div className="mt-2 text-xs text-white/55">Waiting for manual review.</div>
          </CardContent>
        </Card>
        <Card className="ring-1 ring-white/10">
          <CardHeader className="flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm">Balances</CardTitle>
            <Wallet className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-white/90">
              {q.data ? formatUsd(q.data.totalBalanceUsd) : '—'}
            </div>
            <div className="mt-2 text-xs text-white/55">Total user balances.</div>
          </CardContent>
        </Card>
        <Card className="ring-1 ring-white/10">
          <CardHeader className="flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm">KYC pending</CardTitle>
            <Activity className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold text-white/90">{q.data?.pendingKycCount ?? '—'}</div>
            <div className="mt-2 text-xs text-white/55">Documents waiting for review.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
