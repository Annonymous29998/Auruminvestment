import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Gem, Plus, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatUsd } from '@/features/investments/calculator'
import {
  adminListInvestmentPlans,
  adminSetInvestmentPlanActive,
  adminUpsertInvestmentPlan,
  type AdminInvestmentPlan,
} from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/env'
import { uiCopy } from '@/lib/uiCopy'
import { useToastStore } from '@/stores/toastStore'

export function AdminPlansPage() {
  const toast = useToastStore((s) => s.push)
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: adminListInvestmentPlans,
    enabled: isSupabaseConfigured,
  })

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AdminInvestmentPlan | null>(null)
  const [name, setName] = useState('')
  const [minInvestmentUsd, setMinInvestmentUsd] = useState<number>(5000)
  const [durationDays, setDurationDays] = useState<number>(90)
  const [estimatedRoiPercent, setEstimatedRoiPercent] = useState<number>(12)
  const [summary, setSummary] = useState('')
  const [highlightsText, setHighlightsText] = useState('')
  const [active, setActive] = useState(true)

  const parsedHighlights = useMemo(
    () =>
      highlightsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    [highlightsText],
  )

  const upsertM = useMutation({
    mutationFn: () =>
      adminUpsertInvestmentPlan({
        id: editing?.id,
        name: name.trim(),
        minInvestmentUsd,
        durationDays,
        estimatedRoiPercent,
        summary: summary.trim(),
        highlights: parsedHighlights,
        active,
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin', 'plans'] }),
        qc.invalidateQueries({ queryKey: ['plans'] }),
      ])
      toast({ tone: 'success', title: 'Saved', message: 'Plan saved successfully.' })
      close()
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Unable to save plan'
      toast({ tone: 'danger', title: 'Failed', message: msg })
    },
  })

  const toggleM = useMutation({
    mutationFn: (args: { planId: string; active: boolean }) => adminSetInvestmentPlanActive(args),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin', 'plans'] }),
        qc.invalidateQueries({ queryKey: ['plans'] }),
      ])
      toast({ tone: 'success', title: 'Updated', message: 'Plan status updated.' })
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Unable to update'
      toast({ tone: 'danger', title: 'Failed', message: msg })
    },
  })

  function openNew() {
    setEditing(null)
    setName('')
    setMinInvestmentUsd(5000)
    setDurationDays(90)
    setEstimatedRoiPercent(12)
    setSummary('')
    setHighlightsText('')
    setActive(true)
    setOpen(true)
  }

  function openEdit(p: AdminInvestmentPlan) {
    setEditing(p)
    setName(p.name)
    setMinInvestmentUsd(Number(p.minInvestmentUsd ?? 0))
    setDurationDays(Number(p.durationDays ?? 0))
    setEstimatedRoiPercent(Number(p.estimatedRoiPercent ?? 0))
    setSummary(p.summary ?? '')
    setHighlightsText((p.highlights ?? []).join('\n'))
    setActive(Boolean(p.active))
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setEditing(null)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast({ tone: 'warning', title: 'Missing name', message: 'Add a plan name.' })
      return
    }
    if (!summary.trim()) {
      toast({ tone: 'warning', title: 'Missing summary', message: 'Add a short summary.' })
      return
    }
    if (!minInvestmentUsd || minInvestmentUsd < 0) {
      toast({ tone: 'warning', title: 'Invalid minimum', message: 'Minimum investment must be valid.' })
      return
    }
    if (!durationDays || durationDays <= 0) {
      toast({ tone: 'warning', title: 'Invalid duration', message: 'Duration must be greater than zero.' })
      return
    }
    upsertM.mutate()
  }

  return (
    <div>
      <PageHeader title="Manage Plans" subtitle="Create and update investment plans displayed to users." />

      {!isSupabaseConfigured ? (
        <EmptyState
          icon={<Gem className="h-5 w-5 text-gold" />}
          title={uiCopy.emptyStateBackendTitle}
          description={uiCopy.emptyStateBackendDescription}
        />
      ) : (
        <Card className="ring-1 ring-white/10">
          <CardHeader className="flex flex-col gap-3 pb-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base">Investment plans</CardTitle>
              <div className="mt-1 text-sm text-white/65">Create, edit, and activate plans.</div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Badge tone="neutral">{q.data?.length ?? 0}</Badge>
              <Button variant="secondary" onClick={openNew}>
                <Plus className="h-4 w-4" />
                New plan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {q.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : q.isError ? (
              <EmptyState
                title="Unable to load plans"
                description={q.error instanceof Error ? q.error.message : 'Check your admin access policies.'}
              />
            ) : q.data?.length ? (
              <>
                <div className="hidden overflow-hidden rounded-2xl ring-1 ring-white/10 md:block">
                  <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/55">
                    <div className="col-span-5">Plan</div>
                    <div className="col-span-2">Minimum</div>
                    <div className="col-span-2">Duration</div>
                    <div className="col-span-1">ROI</div>
                    <div className="col-span-2 text-right">Action</div>
                  </div>
                  <div className="divide-y divide-white/10">
                    {q.data.map((p) => (
                      <div key={p.id} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm">
                        <div className="col-span-5 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="truncate font-semibold text-white/85">{p.name}</div>
                            <Badge tone={p.active ? 'success' : 'neutral'}>{p.active ? 'ACTIVE' : 'INACTIVE'}</Badge>
                          </div>
                          <div className="mt-1 truncate text-xs text-white/55">{p.summary}</div>
                        </div>
                        <div className="col-span-2 text-white/80">{formatUsd(Number(p.minInvestmentUsd ?? 0))}</div>
                        <div className="col-span-2 text-white/80">{Number(p.durationDays ?? 0)} days</div>
                        <div className="col-span-1 text-white/80">{Number(p.estimatedRoiPercent ?? 0)}%</div>
                        <div className="col-span-2 flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => toggleM.mutate({ planId: p.id, active: !p.active })}
                            disabled={toggleM.isPending}
                          >
                            {p.active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 md:hidden">
                  {q.data.map((p) => (
                    <div key={p.id} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 font-semibold text-white/85">{p.name}</div>
                        <Badge tone={p.active ? 'success' : 'neutral'}>{p.active ? 'ACTIVE' : 'INACTIVE'}</Badge>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm text-white/60">{p.summary}</p>
                      <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wider text-white/50">Min</dt>
                          <dd className="mt-0.5 text-white/85">{formatUsd(Number(p.minInvestmentUsd ?? 0))}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wider text-white/50">Term</dt>
                          <dd className="mt-0.5 text-white/85">{Number(p.durationDays ?? 0)}d</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wider text-white/50">ROI</dt>
                          <dd className="mt-0.5 text-white/85">{Number(p.estimatedRoiPercent ?? 0)}%</dd>
                        </div>
                      </dl>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <Button variant="ghost" size="sm" className="w-full sm:flex-1" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full sm:flex-1"
                          onClick={() => toggleM.mutate({ planId: p.id, active: !p.active })}
                          disabled={toggleM.isPending}
                        >
                          {p.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={<Gem className="h-5 w-5 text-gold" />}
                title="No plans"
                description="Create your first investment plan."
                action={
                  <Button variant="secondary" onClick={openNew}>
                    <Plus className="h-4 w-4" />
                    New plan
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      )}

      <Modal
        open={open}
        onClose={close}
        title={editing ? 'Edit plan' : 'New plan'}
        description="Plans appear on the user dashboard when active."
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Gold Growth 90" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Minimum (USD)</Label>
              <Input
                inputMode="decimal"
                value={String(minInvestmentUsd || '')}
                onChange={(e) => setMinInvestmentUsd(Number(e.target.value))}
                placeholder="5000"
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <Input value={String(durationDays || '')} onChange={(e) => setDurationDays(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>ROI (%)</Label>
              <Input
                inputMode="decimal"
                value={String(estimatedRoiPercent || '')}
                onChange={(e) => setEstimatedRoiPercent(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Summary</Label>
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Short description shown to users"
            />
          </div>

          <div className="space-y-2">
            <Label>Highlights (one per line)</Label>
            <textarea
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              className="min-h-28 w-full rounded-2xl bg-white/6 px-4 py-3 text-sm text-white/90 ring-1 ring-white/12 placeholder:text-white/45 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(215,182,97,0.35)]"
              placeholder={`Example:\nInsured vault storage\nQuarterly reporting\nDedicated support`}
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
            <div className="text-sm text-white/75">Active</div>
            <button
              type="button"
              onClick={() => setActive((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/12 transition hover:bg-white/12 hover:text-white"
            >
              {active ? 'Yes' : 'No'}
            </button>
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={upsertM.isPending}>
            {upsertM.isPending ? 'Saving…' : 'Save plan'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
