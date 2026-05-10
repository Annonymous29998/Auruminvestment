import { Mail, MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { env } from '@/lib/env'

export function SupportPanel() {
  return (
    <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/55">Support</div>
            <div className="mt-2 font-display text-lg font-semibold text-white/90">
              Contact our admin team
            </div>
            <div className="mt-2 text-sm text-white/65">
              Manual payment verification and KYC review are handled by support.
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <a href={env.whatsappLink} target="_blank" rel="noreferrer">
            <Button variant="primary" className="w-full">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </a>
          <a href={env.telegramLink} target="_blank" rel="noreferrer">
            <Button variant="secondary" className="w-full">
              <Send className="h-4 w-4" />
              Telegram
            </Button>
          </a>
          <a href={`mailto:${env.supportEmail}`}>
            <Button variant="secondary" className="w-full">
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
