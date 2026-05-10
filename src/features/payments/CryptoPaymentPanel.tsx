import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CopyField } from '@/components/ui/CopyField'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { createPaymentProof, getPaymentDisplaySettings, mergePaymentDisplayWithEnv } from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/env'
import { uploadToBucket } from '@/lib/storage'
import { useToastStore } from '@/stores/toastStore'
import type { PaymentMethod } from '@/types/domain'

export type PaymentPanelMode = 'bank_crypto' | 'full'

type CryptoKind = 'btc' | 'usdt'

export function CryptoPaymentPanel({
  userId,
  initialAmountUsd,
  defaultMethod = 'usdt',
  allowedMethods,
  methodMode = 'full',
  onSubmitted,
}: {
  userId: string
  initialAmountUsd?: number
  defaultMethod?: PaymentMethod
  allowedMethods?: PaymentMethod[]
  methodMode?: PaymentPanelMode
  onSubmitted?: () => void
}) {
  const toast = useToastStore((s) => s.push)
  const settingsQ = useQuery({
    queryKey: ['paymentDisplaySettings'],
    queryFn: getPaymentDisplaySettings,
    enabled: isSupabaseConfigured,
    staleTime: 60_000,
  })

  const display = useMemo(
    () => mergePaymentDisplayWithEnv(settingsQ.data ?? undefined),
    [settingsQ.data],
  )

  const legacyMethods = useMemo<PaymentMethod[]>(
    () => (allowedMethods?.length ? allowedMethods : ['btc', 'usdt']),
    [allowedMethods],
  )
  const safeLegacyDefault = legacyMethods.includes(defaultMethod) ? defaultMethod : legacyMethods[0] ?? 'usdt'
  const [legacyMethod, setLegacyMethod] = useState<PaymentMethod>(safeLegacyDefault)

  const [payChannel, setPayChannel] = useState<'bank' | 'crypto'>(() =>
    defaultMethod === 'bank_transfer' ? 'bank' : 'crypto',
  )
  const [cryptoKind, setCryptoKind] = useState<CryptoKind>(() => (defaultMethod === 'btc' ? 'btc' : 'usdt'))

  const [amountUsd, setAmountUsd] = useState<number>(initialAmountUsd ?? 0)
  const [txHash, setTxHash] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const resolvedMethod: PaymentMethod = useMemo(() => {
    if (methodMode === 'bank_crypto') {
      return payChannel === 'bank' ? 'bank_transfer' : cryptoKind
    }
    return legacyMethod
  }, [methodMode, payChannel, cryptoKind, legacyMethod])

  const title =
    resolvedMethod === 'btc' || resolvedMethod === 'usdt'
      ? `Send ${resolvedMethod.toUpperCase()} and upload proof`
      : resolvedMethod === 'bank_transfer'
        ? 'Bank transfer proof'
        : 'Card payment proof'

  const description =
    resolvedMethod === 'btc' || resolvedMethod === 'usdt'
      ? 'Copy the wallet address, complete the transfer, then upload a receipt or paste the transaction hash.'
      : 'Complete your payment, then upload a receipt/screenshot and add a reference if available.'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitted) return
    if (!isSupabaseConfigured) {
      toast({
        tone: 'warning',
        title: 'Configuration required',
        message: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      })
      return
    }
    if (!amountUsd || amountUsd <= 0) {
      toast({ tone: 'warning', title: 'Enter an amount', message: 'Amount must be greater than zero.' })
      return
    }
    if (!txHash && !file) {
      toast({
        tone: 'warning',
        title: 'Provide proof',
        message: 'Add a transaction hash or upload a proof image/PDF.',
      })
      return
    }

    setLoading(true)
    try {
      let storagePath: string | undefined
      if (file) {
        const safeName = file.name.replace(/[^\w.-]+/g, '_')
        const path = `${userId}/${Date.now()}-${safeName}`
        const uploaded = await uploadToBucket({ bucket: 'payment-proofs', path, file })
        storagePath = uploaded.path
      }

      await createPaymentProof({
        userId,
        method: resolvedMethod,
        amountUsd,
        txHash: txHash || undefined,
        storagePath,
      })

      toast({
        tone: 'success',
        title: 'Submitted',
        message: 'We received your proof.',
      })
      setTxHash('')
      setFile(null)
      setSubmitted(true)
      onSubmitted?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to submit proof'
      toast({ tone: 'danger', title: 'Submission failed', message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/55">Payment</div>
            <div className="mt-2 font-display text-lg font-semibold text-white/90">{title}</div>
            <div className="mt-2 text-sm text-white/65">{description}</div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {methodMode === 'bank_crypto' ? (
            <>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select
                  value={payChannel}
                  onChange={(e) => {
                    const v = e.target.value as 'bank' | 'crypto'
                    setPayChannel(v)
                  }}
                >
                  <option value="bank">Bank transfer</option>
                  <option value="crypto">Crypto</option>
                </Select>
              </div>
              {payChannel === 'crypto' ? (
                <div className="space-y-2">
                  <Label>Network</Label>
                  <Select
                    value={cryptoKind}
                    onChange={(e) => setCryptoKind(e.target.value as CryptoKind)}
                  >
                    <option value="btc">Bitcoin (BTC)</option>
                    <option value="usdt">USDT</option>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Amount (USD)</Label>
                  <Input
                    inputMode="decimal"
                    value={String(amountUsd || '')}
                    onChange={(e) => setAmountUsd(Number(e.target.value))}
                    placeholder="0"
                    disabled={submitted}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select
                  value={legacyMethod}
                  onChange={(e) => {
                    const next = e.target.value as PaymentMethod
                    if (legacyMethods.includes(next)) setLegacyMethod(next)
                  }}
                >
                  {legacyMethods.map((m) => (
                    <option key={m} value={m}>
                      {m === 'bank_transfer' ? 'Bank Transfer' : m === 'card' ? 'Card Payment' : m.toUpperCase()}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (USD)</Label>
                <Input
                  inputMode="decimal"
                  value={String(amountUsd || '')}
                  onChange={(e) => setAmountUsd(Number(e.target.value))}
                  placeholder="0"
                  disabled={submitted}
                />
              </div>
            </>
          )}
        </div>

        {methodMode === 'bank_crypto' && payChannel === 'crypto' ? (
          <div className="mt-4 space-y-2">
            <Label>Amount (USD)</Label>
            <Input
              inputMode="decimal"
              value={String(amountUsd || '')}
              onChange={(e) => setAmountUsd(Number(e.target.value))}
              placeholder="0"
              disabled={submitted}
            />
          </div>
        ) : null}

        {resolvedMethod === 'btc' || resolvedMethod === 'usdt' ? (
          <div className="mt-4">
            <CopyField
              label={`${resolvedMethod.toUpperCase()} wallet address`}
              value={resolvedMethod === 'btc' ? display.btcAddress : display.usdtAddress}
            />
          </div>
        ) : resolvedMethod === 'bank_transfer' ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <CopyField label="Bank name" value={display.bankName} monospace={false} />
            <CopyField label="Account name" value={display.bankAccountName} monospace={false} />
            <CopyField label="Account number" value={display.bankAccountNumber} monospace={false} />
            <CopyField label="Support email" value={display.supportEmail} monospace={false} />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <CopyField label="Support email" value={display.supportEmail} monospace={false} />
            <CopyField label="Support WhatsApp" value={display.whatsappLink} monospace={false} />
          </div>
        )}

        {!isSupabaseConfigured ? (
          <div className="mt-5 rounded-2xl bg-white/5 p-4 text-sm text-white/70 ring-1 ring-white/10">
            Supabase is required to submit proofs. Please configure your environment variables and refresh.
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label>Reference / transaction hash (optional)</Label>
            <Input
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Paste reference or TX hash"
              disabled={submitted}
            />
          </div>
          <div className="space-y-2">
            <Label>Upload receipt (optional)</Label>
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/6 px-4 py-3 ring-1 ring-white/12">
              <div className="min-w-0 text-sm text-white/70">
                {file ? <span className="truncate">{file.name}</span> : 'PNG, JPG, PDF supported'}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/12 transition hover:bg-white/12 hover:text-white">
                <Upload className="h-4 w-4" />
                Choose file
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  disabled={submitted}
                />
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={submitted || loading || !isSupabaseConfigured}
          >
            {submitted ? 'Submitted' : loading ? 'Submitting…' : 'Submit proof'}
          </Button>
        </form>
      </div>
    </div>
  )
}
