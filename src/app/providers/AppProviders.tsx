import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { queryClient } from '@/app/queryClient'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { InvestorRealtimeSync } from '@/features/sync/InvestorRealtimeSync'
import { ToastHost } from '@/components/ui/ToastHost'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InvestorRealtimeSync />
        {children}
        <ToastHost />
      </AuthProvider>
    </QueryClientProvider>
  )
}
