import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { isSupabaseConfigured } from '@/lib/env'
import { getSupabase } from '@/lib/supabaseClient'
import { ERR_BACKEND_NOT_CONFIGURED, uiCopy } from '@/lib/uiCopy'
import type { AppUser, UserRole } from '@/features/auth/authTypes'
import { useToastStore } from '@/stores/toastStore'

type AuthContextValue = {
  user: AppUser | null
  session: Session | null
  loading: boolean
  /** Refetch role / KYC / name from public.users (e.g. after admin updates your profile). */
  refreshProfile: () => Promise<void>
  signUp: (args: { email: string; password: string; fullName?: string }) => Promise<{ hasSession: boolean }>
  signIn: (args: { email: string; password: string }) => Promise<void>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timeoutId: number | null = null
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), ms)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    if (timeoutId !== null) window.clearTimeout(timeoutId)
  }
}

async function fetchProfile(userId: string): Promise<Pick<AppUser, 'fullName' | 'role' | 'kycStatus'>> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('users')
    .select('full_name, role, kyc_status')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return {
    fullName: data?.full_name ?? null,
    role: (data?.role ?? 'user') as UserRole,
    kycStatus: (data?.kyc_status ?? 'not_submitted') as AppUser['kycStatus'],
  }
}

async function ensureUserRow(args: { id: string; email: string; fullName?: string | null }) {
  const supabase = getSupabase()
  await supabase
    .from('users')
    .upsert(
      {
        id: args.id,
        email: args.email,
        full_name: args.fullName ?? null,
      },
      { onConflict: 'id' },
    )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToastStore((s) => s.push)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(() => isSupabaseConfigured)

  const refreshProfile = useCallback(async () => {
    const uid = session?.user?.id
    if (!uid || !isSupabaseConfigured) return
    try {
      const profile = await fetchProfile(uid)
      setUser((prev) => {
        if (!prev || prev.id !== uid) return prev
        return {
          ...prev,
          fullName: profile.fullName ?? prev.fullName,
          role: profile.role,
          kycStatus: profile.kycStatus,
        }
      })
    } catch {
      /* ignore */
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const t = window.setTimeout(() => {
        useToastStore.getState().push({
          tone: 'warning',
          title: uiCopy.toastBackendTitle,
          message: uiCopy.toastBackendMessage,
        })
      }, 0)
      return () => window.clearTimeout(t)
    }

    let cancelled = false
    const supabase = getSupabase()

    const applyAuthEvent = async (_event: AuthChangeEvent, next: Session | null) => {
      if (cancelled) return
      setSession(next)
      if (!next?.user) {
        setUser(null)
        setLoading(false)
        return
      }

      // Do not call other Supabase APIs synchronously inside the auth callback; it can deadlock
      // or delay INITIAL_SESSION. Yield first, then load profile.
      await new Promise<void>((resolve) => {
        queueMicrotask(resolve)
      })
      if (cancelled) return

      const metaFullName = (next.user.user_metadata?.full_name as string | undefined) ?? null
      const baseUser: AppUser = {
        id: next.user.id,
        email: next.user.email ?? '',
        fullName: metaFullName,
        role: 'user',
        kycStatus: 'not_submitted',
      }

      ensureUserRow({ id: baseUser.id, email: baseUser.email, fullName: baseUser.fullName }).catch(() => {})

      const needsAdminRole = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
      if (!needsAdminRole) setUser(baseUser)

      try {
        if (cancelled) return
        const profile = await fetchProfile(next.user.id)
        if (cancelled) return
        setUser({
          ...baseUser,
          fullName: profile.fullName ?? baseUser.fullName,
          role: profile.role,
          kycStatus: profile.kycStatus,
        })
      } catch {
        if (!cancelled && needsAdminRole) setUser(baseUser)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      // INITIAL_SESSION is delivered async; React Strict Mode can unsubscribe before it runs,
      // so the callback never fires. `getSession()` below always awaits full client init + storage.
      if (event === 'INITIAL_SESSION') return
      void applyAuthEvent(event, session)
    })

    void (async () => {
      try {
        const { data: sessionData, error } = await supabase.auth.getSession()
        if (cancelled) return
        if (error) {
          setSession(null)
          setUser(null)
          setLoading(false)
          return
        }
        await applyAuthEvent('INITIAL_SESSION', sessionData.session)
      } catch {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      refreshProfile,
      signUp: async ({ email, password, fullName }) => {
        if (!isSupabaseConfigured) throw new Error(ERR_BACKEND_NOT_CONFIGURED)
        const supabase = getSupabase()
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName ?? null },
          },
        })
        if (error) throw error
        const signedUser = signUpData.user
        const hasSession = Boolean(signUpData.session)
        // With email confirmation off, you get a session immediately — upsert profile for admin list.
        // With confirmation on, session is null until verify; the DB trigger (see supabase SQL) must create public.users.
        if (signedUser && signUpData.session) {
          try {
            await ensureUserRow({
              id: signedUser.id,
              email: signedUser.email ?? email,
              fullName: fullName ?? (signedUser.user_metadata?.full_name as string | undefined) ?? null,
            })
          } catch {
            /* trigger may have inserted; ignore */
          }
        }
        return { hasSession }
      },
      signIn: async ({ email, password }) => {
        if (!isSupabaseConfigured) throw new Error(ERR_BACKEND_NOT_CONFIGURED)
        const supabase = getSupabase()
        const { data, error } = await withTimeout(
          supabase.auth.signInWithPassword({ email, password }),
          20000,
          'Sign in timed out. Please try again.',
        )
        if (error) throw error
        const next = data.session
        setSession(next ?? null)
        if (!next?.user) {
          setUser(null)
          return
        }
        const metaFullName = (next.user.user_metadata?.full_name as string | undefined) ?? null
        const baseUser: AppUser = {
          id: next.user.id,
          email: next.user.email ?? email,
          fullName: metaFullName,
          role: 'user',
          kycStatus: 'not_submitted',
        }
        setUser(baseUser)
        await supabase.auth.getSession()
        ensureUserRow({ id: baseUser.id, email: baseUser.email, fullName: baseUser.fullName }).catch(() => {})
        const needsAdminRole = window.location.pathname.startsWith('/admin')
        if (needsAdminRole) {
          try {
            const profile = await withTimeout(fetchProfile(next.user.id), 12000, 'Unable to verify admin access. Please try again.')
            setUser({
              ...baseUser,
              fullName: profile.fullName ?? baseUser.fullName,
              role: profile.role,
              kycStatus: profile.kycStatus,
            })
          } catch {
            setUser(baseUser)
          }
          toast({ tone: 'success', title: 'Welcome back', message: 'You are signed in.' })
          return
        }
        toast({ tone: 'success', title: 'Welcome back', message: 'You are signed in.' })
        fetchProfile(next.user.id)
          .then((profile) => {
            setUser((prev) => {
              if (!prev) return prev
              if (prev.id !== baseUser.id) return prev
              return {
                ...prev,
                fullName: profile.fullName ?? prev.fullName,
                role: profile.role,
                kycStatus: profile.kycStatus,
              }
            })
          })
          .catch(() => {})
      },
      signOut: async () => {
        if (!isSupabaseConfigured) throw new Error(ERR_BACKEND_NOT_CONFIGURED)
        const supabase = getSupabase()
        setSession(null)
        setUser(null)
        try {
          const { error } = await supabase.auth.signOut({ scope: 'local' })
          if (error) throw error
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unable to sign out'
          if (!message.toLowerCase().includes('auth session missing')) throw err
        }
      },
      requestPasswordReset: async (email) => {
        if (!isSupabaseConfigured) throw new Error(ERR_BACKEND_NOT_CONFIGURED)
        const supabase = getSupabase()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })
        if (error) throw error
        toast({ tone: 'neutral', title: 'Reset email sent', message: 'Check your inbox to continue.' })
      },
      updatePassword: async (newPassword) => {
        if (!isSupabaseConfigured) throw new Error(ERR_BACKEND_NOT_CONFIGURED)
        const supabase = getSupabase()
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) throw error
        toast({ tone: 'success', title: 'Password updated' })
      },
    }),
    [loading, refreshProfile, session, toast, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
