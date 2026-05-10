import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Landmark } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  type PaymentDisplaySettings,
  adminUpsertPaymentDisplaySettings,
  getPaymentDisplaySettings,
  mergePaymentDisplayWithEnv,
} from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/env'
import { useToastStore } from '@/stores/toastStore'

function emptyForm(): PaymentDisplaySettings {
  return mergePaymentDisplayWithEnv(null)
}

export function AdminPaymentSettingsPage() {
  const toast = useToastStore((s) => s.push)
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['paymentDisplaySettings'],
    queryFn: getPaymentDisplaySettings,
    enabled: isSupabaseConfigured,
  })

  const [form, setForm] = useState<PaymentDisplaySettings>(emptyForm)

  useEffect(() => {
    if (!q.isSuccess) return
    const t = window.setTimeout(() => {
      setForm(mergePaymentDisplayWithEnv(q.data ?? undefined))
    }, 0)
    return () => window.clearTimeout(t)
  }, [q.isSuccess, q.data])

  const saveM = useMutation({
    mutationFn: () => adminUpsertPaymentDisplaySettings(form),
    onSuccess: async () => {
      toast({ tone: 'success', title: 'Saved', message: 'Investors will see these details in payment flows.' })
      await qc.invalidateQueries({ queryKey: ['paymentDisplaySettings'] })
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Unable to save'
      toast({ tone: 'danger', title: 'Save failed', message: msg })
    },
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      toast({ tone: 'warning', title: 'Supabase required', message: 'Configure Supabase before saving.' })
      return
    }
    saveM.mutate()
  }

  return (
    <div>
      <PageHeader
        title="Payment methods"
        subtitle="Bank transfer and crypto addresses shown to investors. Empty fields fall back to Vite env defaults."
      />

      <Card className="ring-1 ring-white/10">
        <CardHeader className="flex-row items-center justify-between pb-0">
          <CardTitle className="text-base">Displayed instructions</CardTitle>
          <Landmark className="h-5 w-5 text-gold" />
        </CardHeader>
        <CardContent className="pt-6">
          {q.isError ? (
            <div className="mb-4 rounded-2xl bg-white/5 p-4 text-sm text-amber-200/90 ring-1 ring-white/10">
              Could not load saved settings. If the table is missing, run{' '}
              <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">supabase/payment_display_settings.sql</code>{' '}
              in the Supabase SQL editor, then refresh.
            </div>
          ) : null}
          <form onSubmit={submit} className="space-y-6">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/55">Bank transfer</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Bank name</Label>
                  <Input value={form.bankName} onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Account name</Label>
                  <Input
                    value={form.bankAccountName}
                    onChange={(e) => setForm((f) => ({ ...f, bankAccountName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account number</Label>
                  <Input
                    value={form.bankAccountNumber}
                    onChange={(e) => setForm((f) => ({ ...f, bankAccountNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Support email</Label>
                  <Input
                    value={form.supportEmail}
                    onChange={(e) => setForm((f) => ({ ...f, supportEmail: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/55">Crypto</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Bitcoin (BTC) address</Label>
                  <Input
                    value={form.btcAddress}
                    onChange={(e) => setForm((f) => ({ ...f, btcAddress: e.target.value }))}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>USDT address</Label>
                  <Input
                    value={form.usdtAddress}
                    onChange={(e) => setForm((f) => ({ ...f, usdtAddress: e.target.value }))}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/55">Optional links</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>WhatsApp link</Label>
                  <Input
                    value={form.whatsappLink}
                    onChange={(e) => setForm((f) => ({ ...f, whatsappLink: e.target.value }))}
                    placeholder="https://wa.me/..."
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Telegram link</Label>
                  <Input
                    value={form.telegramLink}
                    onChange={(e) => setForm((f) => ({ ...f, telegramLink: e.target.value }))}
                    placeholder="https://t.me/..."
                  />
                </div>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={saveM.isPending || q.isLoading}>
              {saveM.isPending ? 'Saving…' : 'Save payment details'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
