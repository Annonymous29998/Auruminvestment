import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { useAuth } from '@/features/auth/AuthProvider'
import { getAdminEmailAllowList } from '@/lib/env'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen label="Verifying session…" />
  if (!user) return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
  const allowList = getAdminEmailAllowList()
  const allowedByEmail = allowList ? allowList.includes(user.email.toLowerCase()) : false
  if (location.pathname.startsWith('/app') && user.role === 'admin' && allowedByEmail) {
    return <Navigate to="/admin" replace />
  }
  return children
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen label="Verifying admin access…" />
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  const allowList = getAdminEmailAllowList()
  const allowedByEmail = allowList ? allowList.includes(user.email.toLowerCase()) : true
  if (user.role !== 'admin' || !allowedByEmail) return <Navigate to="/app" replace />
  return children
}
