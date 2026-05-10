import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useAuth } from '@/features/auth/AuthProvider'
import { useToastStore } from '@/stores/toastStore'

export function ResetPasswordPage() {
  const toast = useToastStore((s) => s.push)
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await updatePassword(password)
      toast({ tone: 'success', title: 'Password updated', message: 'You can now sign in with your new password.' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update password'
      toast({ tone: 'danger', title: 'Update failed', message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-semibold text-white/85">Reset password</div>
        <div className="mt-1 text-sm text-white/65">Set a new password for your account.</div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </div>
  )
}
