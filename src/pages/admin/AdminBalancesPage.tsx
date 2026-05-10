import { useState } from 'react'
import { Wallet } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatUsd } from '@/features/investments/calculator'
import { adminAdjustUserBalance, adminListUsers } from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/env'
import { uiCopy } from '@/lib/uiCopy'
import { useToastStore } from '@/stores/toastStore'

type RowDraft = { newTotal: string; deduct: string }

function parseUsd(s: string): number | null {
  const n = Number(String(s).replace(/,/g, '').trim())
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n * 100) / 100
}

function shortId(id: string) {
  return id.length > 12 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id
}

export function AdminBalancesPage() {
  const toast = useToastStore((s) => s.push)
  const qc = useQueryClient()
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({})

  const usersQ = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminListUsers,
    enabled: isSupabaseConfigured,
  })

  const adjustM = useMutation({
    mutationFn: (args: { userId: string; newBalanceUsd: number }) => adminAdjustUserBalance(args),
    onSuccess: async (_, { userId }) => {
      await qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      await qc.invalidateQueries({ queryKey: ['balance'] })
      setDrafts((d) => {
        const next = { ...d }
        delete next[userId]
        return next
      })
      toast({ tone: 'success', title: 'Balance updated' })
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Unable to update balance'
      toast({ tone: 'danger', title: 'Update failed', message })
    },
  })

  function draftFor(id: string): RowDraft {
    return drafts[id] ?? { newTotal: '', deduct: '' }
  }

  function setDraft(id: string, patch: Partial<RowDraft>) {
    setDrafts((d) => ({
      ...d,
      [id]: { ...draftFor(id), ...patch },
    }))
  }

  function applySet(userId: string) {
    if (!isSupabaseConfigured) {
      toast({ tone: 'warning', title: uiCopy.toastBackendTitle, message: uiCopy.toastBackendMessage })
      return
    }
    const v = parseUsd(draftFor(userId).newTotal)
    if (v === null) {
      toast({ tone: 'warning', title: 'Invalid amount', message: 'Enter a valid new balance (0 or greater).' })
      return
    }
    adjustM.mutate({ userId, newBalanceUsd: v })
  }

  function applyRemove(userId: string, currentUsd: number) {
    if (!isSupabaseConfigured) {
      toast({ tone: 'warning', title: uiCopy.toastBackendTitle, message: uiCopy.toastBackendMessage })
      return
    }
    const amt = parseUsd(draftFor(userId).deduct)
    if (amt === null || amt <= 0) {
      toast({ tone: 'warning', title: 'Invalid amount', message: 'Enter an amount greater than zero to remove.' })
      return
    }
    const next = Math.max(0, Math.round((currentUsd - amt) * 100) / 100)
    adjustM.mutate({ userId, newBalanceUsd: next })
  }

  const busy = (userId: string) => adjustM.isPending && adjustM.variables?.userId === userId

  return (
    <div>
      <PageHeader
        title="Balances"
        subtitle="View each user’s balance and set a new total or remove funds (deducts from the current balance, never below zero)."
      />

      {!isSupabaseConfigured ? (
        <EmptyState
          icon={<Wallet className="h-5 w-5 text-gold" />}
          title={uiCopy.emptyStateBackendTitle}
          description={uiCopy.emptyStateBackendDescription}
        />
      ) : usersQ.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : usersQ.isError ? (
        <Card className="ring-1 ring-white/10">
          <CardContent className="py-8 text-sm text-white/70">Unable to load users. Refresh and try again.</CardContent>
        </Card>
      ) : usersQ.data?.length ? (
        <Card className="ring-1 ring-white/10">
          <CardHeader className="flex-row items-center justify-between pb-0">
            <CardTitle className="text-base">Users & balances</CardTitle>
            <Wallet className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-white/55">
                    <th className="py-3 pr-4">User</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3 pr-4">Balance</th>
                    <th className="py-3 pr-4">Set new total</th>
                    <th className="py-3">Remove from balance</th>
                  </tr>
                </thead>
                <tbody>
                  {usersQ.data.map((u) => {
                    const d = draftFor(u.id)
                    return (
                      <tr key={u.id} className="border-b border-white/8 align-top last:border-0">
                        <td className="py-4 pr-4">
                          <div className="font-medium text-white/90">{u.email}</div>
                          <div className="mt-0.5 text-xs text-white/55">{u.fullName ?? '—'}</div>
                          <div className="mt-1 font-mono text-[11px] text-white/40" title={u.id}>
                            {shortId(u.id)}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge tone={u.role === 'admin' ? 'warning' : 'neutral'}>{u.role.toUpperCase()}</Badge>
                        </td>
                        <td className="py-4 pr-4 whitespace-nowrap font-semibold text-white/90">
                          {formatUsd(u.balanceUsd)}
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                            <div className="min-w-28 flex-1 space-y-1">
                              <Label className="text-xs text-white/55">USD</Label>
                              <Input
                                inputMode="decimal"
                                placeholder={String(u.balanceUsd)}
                                value={d.newTotal}
                                onChange={(e) => setDraft(u.id, { newTotal: e.target.value })}
                                disabled={busy(u.id)}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              className="shrink-0"
                              disabled={busy(u.id)}
                              onClick={() => applySet(u.id)}
                            >
                              Set
                            </Button>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                            <div className="min-w-28 flex-1 space-y-1">
                              <Label className="text-xs text-white/55">Amount</Label>
                              <Input
                                inputMode="decimal"
                                placeholder="0"
                                value={d.deduct}
                                onChange={(e) => setDraft(u.id, { deduct: e.target.value })}
                                disabled={busy(u.id)}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="shrink-0"
                              disabled={busy(u.id)}
                              onClick={() => applyRemove(u.id, u.balanceUsd)}
                            >
                              Remove
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 md:hidden">
              {usersQ.data.map((u) => {
                const d = draftFor(u.id)
                return (
                  <div key={u.id} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="break-words font-medium text-white/90">{u.email}</div>
                    <div className="mt-1 text-xs text-white/55">{u.fullName ?? '—'}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone={u.role === 'admin' ? 'warning' : 'neutral'}>{u.role.toUpperCase()}</Badge>
                      <span className="font-semibold text-white/90">{formatUsd(u.balanceUsd)}</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label className="text-xs text-white/55">Set new total (USD)</Label>
                      <div className="flex gap-2">
                        <Input
                          inputMode="decimal"
                          className="min-w-0 flex-1"
                          placeholder={String(u.balanceUsd)}
                          value={d.newTotal}
                          onChange={(e) => setDraft(u.id, { newTotal: e.target.value })}
                          disabled={busy(u.id)}
                        />
                        <Button type="button" variant="primary" size="sm" disabled={busy(u.id)} onClick={() => applySet(u.id)}>
                          Set
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label className="text-xs text-white/55">Remove from balance</Label>
                      <div className="flex gap-2">
                        <Input
                          inputMode="decimal"
                          className="min-w-0 flex-1"
                          placeholder="0"
                          value={d.deduct}
                          onChange={(e) => setDraft(u.id, { deduct: e.target.value })}
                          disabled={busy(u.id)}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={busy(u.id)}
                          onClick={() => applyRemove(u.id, u.balanceUsd)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 text-xs text-white/55">
              Set replaces the entire balance. Remove subtracts from the current balance (floors at $0). Use only with proper
              approvals and audit records.
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={<Wallet className="h-5 w-5 text-gold" />}
          title="No users"
          description="No rows in public.users yet."
        />
      )}
    </div>
  )
}
