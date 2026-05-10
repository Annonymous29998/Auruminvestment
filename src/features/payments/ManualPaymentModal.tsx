import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Mail, MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CopyField } from '@/components/ui/CopyField'
import { Modal } from '@/components/ui/Modal'
import { getPaymentDisplaySettings, mergePaymentDisplayWithEnv } from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/env'
import { hrefForTelegram, hrefForWhatsApp } from '@/lib/supportLinks'

export function ManualPaymentModal({
  open,
  onClose,
  amountUsd,
  context,
}: {
  open: boolean
  onClose: () => void
  amountUsd?: number
  context?: string
}) {
  const settingsQ = useQuery({
    queryKey: ['paymentDisplaySettings'],
    queryFn: getPaymentDisplaySettings,
    enabled: open && isSupabaseConfigured,
    staleTime: 60_000,
  })

  const display = useMemo(
    () => mergePaymentDisplayWithEnv(isSupabaseConfigured ? settingsQ.data ?? undefined : null),
    [settingsQ.data],
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Complete your payment"
      description="Please contact support to complete this investment payment."
    >
      <div className="space-y-4">
        {context ? (
          <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/70 ring-1 ring-white/10">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/55">Context</div>
            <div className="mt-2">{context}</div>
          </div>
        ) : null}

        {amountUsd ? (
          <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/70 ring-1 ring-white/10">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/55">Amount</div>
            <div className="mt-2 text-base font-semibold text-white/90">
              {amountUsd.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <CopyField label="Bank Name" value={display.bankName} monospace={false} />
          <CopyField label="Account Name" value={display.bankAccountName} monospace={false} />
          <CopyField label="Account Number" value={display.bankAccountNumber} monospace={false} />
          <CopyField label="Support Email" value={display.supportEmail} monospace={false} />
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <a href={hrefForWhatsApp(display.whatsappLink)} target="_blank" rel="noreferrer">
            <Button variant="primary" className="w-full">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </a>
          <a href={hrefForTelegram(display.telegramLink)} target="_blank" rel="noreferrer">
            <Button variant="secondary" className="w-full">
              <Send className="h-4 w-4" />
              Telegram
            </Button>
          </a>
          <a href={display.supportEmail.trim() ? `mailto:${display.supportEmail.trim()}` : '#'}>
            <Button variant="secondary" className="w-full" disabled={!display.supportEmail.trim()}>
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </a>
        </div>

        <div className="text-xs leading-relaxed text-white/55">
          Payments are confirmed by our team before activation. Do not send sensitive information via chat. Provide
          your account email and a payment reference if available.
        </div>
      </div>
    </Modal>
  )
}
