import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Trash2, Users } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/features/auth/AuthProvider'
import { adminDeleteUser, adminListUsers } from '@/lib/api'
import { formatUsd } from '@/features/investments/calculator'
import { isSupabaseConfigured } from '@/lib/env'
import { userFacingErrorMessage, uiCopy } from '@/lib/uiCopy'
import { useToastStore } from '@/stores/toastStore'

export function AdminUsersPage() {
  const toast = useToastStore((s) => s.push)
  const qc = useQueryClient()
  const { user: currentUser } = useAuth()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null)

  const q = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminListUsers,
    enabled: isSupabaseConfigured,
  })

  const deleteM = useMutation({
    mutationFn: (userId: string) => adminDeleteUser({ userId }),
    onSuccess: async () => {
      setDeleteTarget(null)
      await qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      await qc.invalidateQueries({ queryKey: ['admin', 'overview-metrics'] })
      toast({ tone: 'success', title: 'User deleted', message: 'Their login and profile data were removed.' })
    },
    onError: (err) => {
      setDeleteTarget(null)
      toast({ tone: 'danger', title: 'Delete failed', message: userFacingErrorMessage(err) })
    },
  })

  function requestDeleteUser(u: { id: string; email: string; role: string }) {
    if (u.role === 'admin') return
    if (u.id === currentUser?.id) return
    setDeleteTarget({ id: u.id, email: u.email })
  }

  function confirmDeleteUser() {
    if (!deleteTarget) return
    deleteM.mutate(deleteTarget.id)
  }

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Delete permanently removes the account and related records. You cannot delete yourself or other administrators. If removal fails, your developer may need to update server-side permissions."
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (deleteM.isPending) return
          setDeleteTarget(null)
        }}
        title="Delete user permanently?"
        description={
          deleteTarget
            ? `This will remove ${deleteTarget.email} from the platform. They will not be able to sign in again. This cannot be undone.`
            : ''
        }
        cancelLabel="Cancel"
        confirmLabel="Delete user"
        pending={deleteM.isPending}
        onConfirm={confirmDeleteUser}
      />

      {!isSupabaseConfigured ? (
        <EmptyState
          icon={<Users className="h-5 w-5 text-gold" />}
          title={uiCopy.emptyStateBackendTitle}
          description={uiCopy.emptyStateBackendDescription}
        />
      ) : q.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : q.data?.length ? (
        <>
          <div className="hidden overflow-hidden rounded-3xl aurum-glass ring-1 ring-white/10 md:block">
            <div className="grid grid-cols-12 gap-3 border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/55">
              <div className="col-span-4">User</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Balance</div>
              <div className="col-span-2">KYC</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y divide-white/10">
              {q.data.map((u) => {
                const canDelete = u.role !== 'admin' && u.id !== currentUser?.id
                return (
                  <div key={u.id} className="grid grid-cols-12 items-center gap-3 px-6 py-4 text-sm">
                    <div className="col-span-4 min-w-0">
                      <div className="truncate font-semibold text-white/85">{u.email}</div>
                      <div className="mt-1 truncate text-xs text-white/55">{u.fullName ?? '—'}</div>
                    </div>
                    <div className="col-span-2">
                      <Badge tone={u.role === 'admin' ? 'warning' : 'neutral'}>{u.role.toUpperCase()}</Badge>
                    </div>
                    <div className="col-span-2 text-white/80">{formatUsd(u.balanceUsd)}</div>
                    <div className="col-span-2">
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
                    <div className="col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        className="gap-1.5"
                        disabled={!canDelete || deleteM.isPending}
                        onClick={() => requestDeleteUser(u)}
                        title={!canDelete ? 'Cannot delete admin accounts or your own user' : 'Delete user'}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {q.data.map((u) => {
              const canDelete = u.role !== 'admin' && u.id !== currentUser?.id
              return (
                <div key={u.id} className="rounded-2xl aurum-glass px-4 py-4 ring-1 ring-white/10">
                  <div className="min-w-0 break-words">
                    <div className="font-semibold text-white/85">{u.email}</div>
                    <div className="mt-1 text-sm text-white/55">{u.fullName ?? '—'}</div>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-white/50">Role</dt>
                      <dd className="mt-1">
                        <Badge tone={u.role === 'admin' ? 'warning' : 'neutral'}>{u.role.toUpperCase()}</Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-white/50">Balance</dt>
                      <dd className="mt-1 font-semibold text-white/85">{formatUsd(u.balanceUsd)}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-white/50">KYC</dt>
                      <dd className="mt-1">
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
                      </dd>
                    </div>
                  </dl>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    className="mt-4 w-full gap-1.5"
                    disabled={!canDelete || deleteM.isPending}
                    onClick={() => requestDeleteUser(u)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete user
                  </Button>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<Users className="h-5 w-5 text-gold" />}
          title="No users"
          description="New accounts appear here after people sign up."
        />
      )}
    </div>
  )
}
