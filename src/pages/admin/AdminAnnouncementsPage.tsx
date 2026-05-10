import { useState } from 'react'
import type { FormEvent } from 'react'
import { Bell } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { adminSendAnnouncement } from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/env'
import { useToastStore } from '@/stores/toastStore'

export function AdminAnnouncementsPage() {
  const toast = useToastStore((s) => s.push)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  const m = useMutation({
    mutationFn: () => adminSendAnnouncement({ title, message }),
    onSuccess: () => {
      toast({ tone: 'success', title: 'Announcement sent' })
      setTitle('')
      setMessage('')
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Unable to send'
      toast({ tone: 'danger', title: 'Failed', message: msg })
    },
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      toast({ tone: 'warning', title: 'Supabase required', message: 'Configure Supabase to send announcements.' })
      return
    }
    if (!title.trim() || !message.trim()) {
      toast({ tone: 'warning', title: 'Missing fields', message: 'Add a title and message.' })
      return
    }
    m.mutate()
  }

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Send platform-wide notifications to users." />
      <Card className="ring-1 ring-white/10">
        <CardHeader className="flex-row items-center justify-between pb-0">
          <CardTitle className="text-base">New announcement</CardTitle>
          <Bell className="h-5 w-5 text-gold" />
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Maintenance update" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-32 w-full rounded-2xl bg-white/6 px-4 py-3 text-sm text-white/90 ring-1 ring-white/12 placeholder:text-white/45 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(215,182,97,0.35)]"
                placeholder="Write a clear, compliant message."
              />
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={m.isPending}>
              {m.isPending ? 'Sending…' : 'Send announcement'}
            </Button>
            <div className="text-xs text-white/55">
              Avoid guaranteed returns language. Use professional, compliance-approved messaging.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

