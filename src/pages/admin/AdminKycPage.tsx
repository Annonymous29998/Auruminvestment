import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileCheck2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { adminListPendingKycDocuments, adminSetUserKycStatus } from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/env'
import { uiCopy } from '@/lib/uiCopy'
import { getSupabase } from '@/lib/supabaseClient'
import { useToastStore } from '@/stores/toastStore'

export function AdminKycPage() {
  const toast = useToastStore((s) => s.push)
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ['admin', 'kyc-pending'],
    queryFn: adminListPendingKycDocuments,
    enabled: isSupabaseConfigured,
  })

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { userId: string; email: string; fullName: string | null; docs: Array<{ id: string; type: string; path: string }> }
    >()
    for (const d of q.data ?? []) {
      const existing = map.get(d.userId) ?? {
        userId: d.userId,
        email: d.userEmail || d.userId,
        fullName: d.userFullName ?? null,
        docs: [],
      }
      existing.docs.push({ id: d.id, type: d.documentType, path: d.storagePath })
      map.set(d.userId, existing)
    }
    return Array.from(map.values())
  }, [q.data])

  const setStatusM = useMutation({
    mutationFn: (args: { userId: string; status: 'approved' | 'rejected' }) => adminSetUserKycStatus(args),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin', 'kyc-pending'] }),
        qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
        qc.invalidateQueries({ queryKey: ['admin', 'overview-metrics'] }),
      ])
      toast({ tone: 'success', title: 'Updated', message: 'KYC status updated.' })
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Unable to update'
      toast({ tone: 'danger', title: 'Failed', message: msg })
    },
  })

  async function viewDoc(path: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase.storage.from('kyc-documents').createSignedUrl(path, 120)
    if (error) throw error
    if (!data?.signedUrl) throw new Error('Unable to generate preview link.')
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div>
      <PageHeader title="KYC Review" subtitle="Review KYC uploads and approve or reject." />
      {!isSupabaseConfigured ? (
        <EmptyState
          icon={<FileCheck2 className="h-5 w-5 text-gold" />}
          title={uiCopy.emptyStateBackendTitle}
          description="File storage and the database must be connected before you can review KYC uploads."
        />
      ) : q.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : q.isError ? (
        <EmptyState
          icon={<FileCheck2 className="h-5 w-5 text-gold" />}
          title="Unable to load KYC"
          description={q.error instanceof Error ? q.error.message : 'Check your admin access policies.'}
        />
      ) : grouped.length ? (
        <div className="space-y-4">
          {grouped.map((u) => (
            <Card key={u.userId} className="ring-1 ring-white/10">
              <CardHeader className="flex flex-col gap-3 pb-0 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <CardTitle className="wrap-break-word text-base">{u.email}</CardTitle>
                  <div className="mt-1 text-sm text-white/65">{u.fullName ?? '—'}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Badge tone="warning">{u.docs.length}</Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => setStatusM.mutate({ userId: u.userId, status: 'approved' })}
                    disabled={setStatusM.isPending}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => setStatusM.mutate({ userId: u.userId, status: 'rejected' })}
                    disabled={setStatusM.isPending}
                  >
                    Reject
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {u.docs.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white/85">{String(d.type).toUpperCase()}</div>
                        <div className="mt-1 truncate text-xs text-white/55">{d.path}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          viewDoc(d.path).catch((err) => {
                            const msg = err instanceof Error ? err.message : 'Unable to preview'
                            toast({ tone: 'danger', title: 'Preview failed', message: msg })
                          })
                        }
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileCheck2 className="h-5 w-5 text-gold" />}
          title="No pending KYC"
          description="No KYC documents are awaiting review."
        />
      )}
    </div>
  )
}
