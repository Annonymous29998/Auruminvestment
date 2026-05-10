import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { useAuth } from '@/features/auth/AuthProvider'
import { getAdminEmailAllowList } from '@/lib/env'
import { useToastStore } from '@/stores/toastStore'

export function LoginPage() {
  const toast = useToastStore((s) => s.push)
  const { user, signIn, loading: authBooting } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [adminLoginPending, setAdminLoginPending] = useState(false)

  useEffect(() => {
    if (authBooting) return
    if (!user) return
    const from = (location.state as { from?: string } | null)?.from
    const adminMode = location.pathname === '/admin/login' || Boolean(from?.startsWith('/admin'))
    if (adminMode) {
      if (user.role === 'admin') {
        window.setTimeout(() => setAdminLoginPending(false), 0)
        navigate('/admin', { replace: true })
        return
      }
      if (!adminLoginPending) {
        toast({ tone: 'danger', title: 'Admin access required', message: 'This account is not an admin.' })
        navigate('/app', { replace: true })
      }
      return
    }

    const next = from?.startsWith('/admin') ? '/admin' : from ?? '/app'
    navigate(next, { replace: true })
  }, [adminLoginPending, authBooting, location.pathname, location.state, navigate, toast, user])

  useEffect(() => {
    if (!adminLoginPending) return
    if (!user) return
    let cancelled = false
    let attempt = 0
    const tick = () => {
      if (cancelled) return
      if (user.role === 'admin') {
        window.setTimeout(() => setAdminLoginPending(false), 0)
        navigate('/admin', { replace: true })
        return
      }
      attempt += 1
      if (attempt >= 30) {
        window.setTimeout(() => setAdminLoginPending(false), 0)
        toast({
          tone: 'danger',
          title: 'Admin access required',
          message:
            'This account does not have administrator access. Sign in with an admin account, or ask your platform owner to grant access.',
        })
        navigate('/app', { replace: true })
        return
      }
      window.setTimeout(tick, 200)
    }
    window.setTimeout(tick, 0)
    return () => {
      cancelled = true
    }
  }, [adminLoginPending, navigate, toast, user])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    let ok = false
    try {
      const from = (location.state as { from?: string } | null)?.from
      const adminMode = location.pathname === '/admin/login' || Boolean(from?.startsWith('/admin'))
      if (adminMode) {
        const allowList = getAdminEmailAllowList()
        if (allowList && !allowList.includes(email.trim().toLowerCase())) {
          toast({
            tone: 'danger',
            title: 'Admin access required',
            message: 'This email is not allowed to access the admin console.',
          })
          return
        }
        setAdminLoginPending(true)
      } else {
        const allowList = getAdminEmailAllowList()
        if (allowList && allowList.includes(email.trim().toLowerCase())) {
          toast({
            tone: 'danger',
            title: 'Use admin login',
            message: 'Please sign in from the admin login page.',
          })
          return
        }
      }
      await signIn({ email, password })
      ok = true
      if (adminMode) {
        navigate('/admin', { replace: true })
        return
      }
      const next = from?.startsWith('/admin') ? '/admin' : from ?? '/app'
      navigate(next, { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in'
      toast({ tone: 'danger', title: 'Sign in failed', message })
    } finally {
      setLoading(false)
      if (!ok && location.pathname === '/admin/login') setAdminLoginPending(false)
    }
  }

  const adminMode = location.pathname === '/admin/login'

  if (authBooting) {
    return <LoadingScreen label="Checking your session…" />
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-semibold text-white/85">{adminMode ? 'Admin sign in' : 'Sign in'}</div>
        <div className="mt-1 text-sm text-white/65">
          {adminMode ? 'Sign in to the admin console.' : 'Access your investor dashboard securely.'}
        </div>
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link className="text-xs font-semibold text-gold hover:underline" to="/auth/forgot-password">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={loading || adminLoginPending}>
          {loading ? 'Signing in…' : adminLoginPending ? 'Checking access…' : 'Login'}
        </Button>
      </form>

      {adminMode ? null : (
        <div className="text-sm text-white/65">
          New here?{' '}
          <Link className="font-semibold text-gold hover:underline" to="/auth/signup">
            Create an account
          </Link>
        </div>
      )}
    </div>
  )
}
