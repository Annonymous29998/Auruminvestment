import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useAuth } from '@/features/auth/AuthProvider'
import { userFacingErrorMessage } from '@/lib/uiCopy'
import { useToastStore } from '@/stores/toastStore'

function readAuthRedirectError(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const hash = window.location.hash.replace(/^#/, '')
    const search = window.location.search.replace(/^\?/, '')
    const params = new URLSearchParams(hash || search)
    const desc = params.get('error_description') ?? params.get('error')
    if (!desc) return null
    return decodeURIComponent(desc.replace(/\+/g, ' '))
  } catch {
    return null
  }
}

function hasRecoveryTokenInUrl(): boolean {
  if (typeof window === 'undefined') return false
  const hash = window.location.hash.replace(/^#/, '')
  const search = window.location.search.replace(/^\?/, '')
  const params = new URLSearchParams(hash || search)
  return params.get('type') === 'recovery' || Boolean(params.get('access_token') || params.get('code'))
}

export function ResetPasswordPage() {
  const toast = useToastStore((s) => s.push)
  const navigate = useNavigate()
  const { session, loading, passwordRecoveryActive, updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const redirectError = useMemo(() => readAuthRedirectError(), [])
  const recoveryLinkOpened = useMemo(() => hasRecoveryTokenInUrl(), [])
  // Session is established from the email link before Supabase clears the URL hash.
  const canReset = Boolean(session) || passwordRecoveryActive || recoveryLinkOpened

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!session) {
      toast({
        tone: 'danger',
        title: 'Reset link expired',
        message: 'Request a new password reset email and open the latest link.',
      })
      return
    }
    if (password.length < 8) {
      toast({ tone: 'warning', title: 'Password too short', message: 'Use at least 8 characters.' })
      return
    }

    setSubmitting(true)
    try {
      await updatePassword(password)
      toast({
        tone: 'success',
        title: 'Password updated',
        message: 'You can now sign in with your new password.',
      })
      navigate('/auth/login', { replace: true })
    } catch (err) {
      toast({ tone: 'danger', title: 'Update failed', message: userFacingErrorMessage(err) })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingScreen label="Verifying your reset link…" />
  }

  if (redirectError) {
    return (
      <div className="space-y-5">
        <div>
          <div className="text-sm font-semibold text-white/85">Reset link invalid</div>
          <div className="mt-1 text-sm text-white/65">
            {redirectError.includes('redirect')
              ? 'This site is not fully configured for password reset yet. Contact support or try again later.'
              : redirectError}
          </div>
        </div>
        <Link to="/auth/forgot-password">
          <Button variant="primary" className="w-full">
            Request a new reset link
          </Button>
        </Link>
      </div>
    )
  }

  if (!canReset) {
    return (
      <div className="space-y-5">
        <div>
          <div className="text-sm font-semibold text-white/85">Reset link expired</div>
          <div className="mt-1 text-sm text-white/65">
            Open the link from your latest password reset email, or request a new one below.
          </div>
        </div>
        <Link to="/auth/forgot-password">
          <Button variant="primary" className="w-full">
            Request a new reset link
          </Button>
        </Link>
        <div className="text-sm text-white/65">
          Back to{' '}
          <Link className="font-semibold text-gold hover:underline" to="/auth/login">
            Sign in
          </Link>
        </div>
      </div>
    )
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
            minLength={8}
            required
          />
          <div className="text-xs text-white/55">At least 8 characters.</div>
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </div>
  )
}
