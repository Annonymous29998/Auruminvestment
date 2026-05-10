import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuth } from '@/features/auth/AuthProvider'
import { useToastStore } from '@/stores/toastStore'

export function ForgotPasswordPage() {
  const toast = useToastStore((s) => s.push)
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await requestPasswordReset(email)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to request reset'
      toast({ tone: 'danger', title: 'Request failed', message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-semibold text-white/85">Forgot password</div>
        <div className="mt-1 text-sm text-white/65">Request a reset link to update your password.</div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <div className="text-sm text-white/65">
        Back to{' '}
        <Link className="font-semibold text-gold hover:underline" to="/auth/login">
          Sign in
        </Link>
      </div>
    </div>
  )
}

