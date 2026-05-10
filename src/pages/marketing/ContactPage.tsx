import { useState } from 'react'
import type { FormEvent } from 'react'
import { PageHero } from '@/components/marketing/PageHero'
import { SupportPanel } from '@/components/support/SupportPanel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { env } from '@/lib/env'
import { useToastStore } from '@/stores/toastStore'

export function ContactPage() {
  const toast = useToastStore((s) => s.push)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    toast({
      tone: 'neutral',
      title: 'Opening email',
      message: 'Your email client will open so you can contact support securely.',
    })
    const subject = encodeURIComponent('Aurum Support Request')
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`)
    window.location.href = `mailto:${env.supportEmail}?subject=${subject}&body=${body}`
    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <div>
      <PageHero
        eyebrow="Support"
        title="Contact Aurum"
        subtitle="Get help with onboarding, KYC uploads, payment verification, and investment questions. Use WhatsApp, Telegram, or email for fastest response."
      />

      <section className="py-10">
        <div className="aurum-container">
          <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            <SupportPanel />

            <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
              <div className="p-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/55">Contact Form</div>
                <div className="mt-2 font-display text-lg font-semibold text-white/90">
                  Send a message
                </div>

                <form onSubmit={submit} className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="min-h-32 w-full rounded-2xl bg-white/6 px-4 py-3 text-sm text-white/90 ring-1 ring-white/12 placeholder:text-white/45 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(215,182,97,0.35)]"
                    />
                  </div>
                  <Button type="submit" variant="primary" className="w-full">
                    Submit
                  </Button>
                  <div className="text-xs text-white/55">
                    For fastest response, use WhatsApp, Telegram, or email from the Support panel.
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
