import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Mail, MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getPaymentDisplaySettings, mergePaymentDisplayWithEnv } from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/env'
import { hrefForTelegram, hrefForWhatsApp } from '@/lib/supportLinks'

export function SupportPanel() {
  const q = useQuery({
    queryKey: ['paymentDisplaySettings'],
    queryFn: getPaymentDisplaySettings,
    enabled: isSupabaseConfigured,
    staleTime: 60_000,
  })

  const display = useMemo(
    () => mergePaymentDisplayWithEnv(isSupabaseConfigured ? q.data ?? undefined : null),
    [q.data],
  )

  const wa = hrefForWhatsApp(display.whatsappLink)
  const tg = hrefForTelegram(display.telegramLink)
  const mail = display.supportEmail.trim()

  return (
    <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/55">Support</div>
            <div className="mt-2 font-display text-lg font-semibold text-white/90">{display.supportCardTitle}</div>
            <div className="mt-2 text-sm text-white/65">{display.supportCardSubtitle}</div>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <a href={wa} target="_blank" rel="noreferrer">
            <Button variant="primary" className="w-full">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </a>
          <a href={tg} target="_blank" rel="noreferrer">
            <Button variant="secondary" className="w-full">
              <Send className="h-4 w-4" />
              Telegram
            </Button>
          </a>
          <a href={mail ? `mailto:${mail}` : '#'}>
            <Button variant="secondary" className="w-full" disabled={!mail}>
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
