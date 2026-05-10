import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useAuth } from '@/features/auth/AuthProvider'
import { useToastStore } from '@/stores/toastStore'

export function SignupPage() {
  const toast = useToastStore((s) => s.push)
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await signUp({ email, password, fullName: fullName || undefined })
      toast({
        tone: 'success',
        title: 'Account created',
        message: 'If email verification is enabled, please verify before signing in.',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign up'
      toast({ tone: 'danger', title: 'Sign up failed', message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-semibold text-white/85">Create account</div>
        <div className="mt-1 text-sm text-white/65">
          Professional onboarding with KYC verification for withdrawals.
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
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
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Creating…' : 'Sign up'}
        </Button>
      </form>

      <div className="text-xs text-white/55">
        By continuing you acknowledge investment risk and agree to complete KYC verification where required.
      </div>

      <div className="text-sm text-white/65">
        Already have an account?{' '}
        <Link className="font-semibold text-gold hover:underline" to="/auth/login">
          Sign in
        </Link>
      </div>
    </div>
  )
}
