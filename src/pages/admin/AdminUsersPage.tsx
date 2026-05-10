import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { adminListUsers } from '@/lib/api'
import { formatUsd } from '@/features/investments/calculator'
import { isSupabaseConfigured } from '@/lib/env'

export function AdminUsersPage() {
  const q = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminListUsers,
    enabled: isSupabaseConfigured,
  })

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Lists public.users (app profiles). Users only in Supabase Auth need a profile row—run backfill_public_users_from_auth.sql if someone is missing."
      />

      {!isSupabaseConfigured ? (
        <EmptyState
          icon={<Users className="h-5 w-5 text-gold" />}
          title="Supabase required"
          description="Configure Supabase to enable user management."
        />
      ) : q.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : q.data?.length ? (
        <div className="overflow-hidden rounded-3xl aurum-glass ring-1 ring-white/10">
          <div className="grid grid-cols-12 gap-3 border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/55">
            <div className="col-span-5">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-3">Balance</div>
            <div className="col-span-2 text-right">KYC</div>
          </div>
          <div className="divide-y divide-white/10">
            {q.data.map((u) => (
              <div key={u.id} className="grid grid-cols-12 gap-3 px-6 py-4 text-sm">
                <div className="col-span-5 min-w-0">
                  <div className="truncate font-semibold text-white/85">{u.email}</div>
                  <div className="mt-1 truncate text-xs text-white/55">{u.fullName ?? '—'}</div>
                </div>
                <div className="col-span-2">
                  <Badge tone={u.role === 'admin' ? 'warning' : 'neutral'}>{u.role.toUpperCase()}</Badge>
                </div>
                <div className="col-span-3 text-white/80">{formatUsd(u.balanceUsd)}</div>
                <div className="col-span-2 text-right">
                  <Badge
                    tone={
                      u.kycStatus === 'approved'
                        ? 'success'
                        : u.kycStatus === 'pending'
                          ? 'warning'
                          : u.kycStatus === 'rejected'
                            ? 'danger'
                            : 'neutral'
                    }
                  >
                    {String(u.kycStatus).toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Users className="h-5 w-5 text-gold" />}
          title="No users"
          description="Create users via Supabase Auth to see them listed here."
        />
      )}
    </div>
  )
}

