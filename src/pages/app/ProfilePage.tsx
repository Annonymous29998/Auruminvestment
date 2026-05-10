import { useState } from 'react'
import type { FormEvent } from 'react'
import { UserCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuth } from '@/features/auth/AuthProvider'
import { updateUserProfile } from '@/lib/api'
import { useToastStore } from '@/stores/toastStore'

export function ProfilePage() {
  const toast = useToastStore((s) => s.push)
  const { user } = useAuth()
  const [fullName, setFullName] = useState(user?.fullName ?? '')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    try {
      await updateUserProfile({ userId: user.id, fullName })
      toast({ tone: 'success', title: 'Profile updated', message: 'Your profile details have been saved.' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update profile'
      toast({ tone: 'danger', title: 'Update failed', message })
    }
  }

  return (
    <div>
      <PageHeader title="Profile Settings" subtitle="Update your profile details and keep KYC information consistent." />

      <Card className="ring-1 ring-white/10">
        <CardHeader className="flex-row items-center justify-between pb-0">
          <CardTitle className="text-base">Profile</CardTitle>
          <UserCircle2 className="h-5 w-5 text-gold" />
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={submit} className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your legal name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ''} disabled />
            </div>
            <div className="lg:col-span-2">
              <Button type="submit" variant="primary" className="w-full">
                Save changes
              </Button>
              <div className="mt-3 text-xs text-white/55">
                Ensure your profile name matches your KYC documents to avoid delays.
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
