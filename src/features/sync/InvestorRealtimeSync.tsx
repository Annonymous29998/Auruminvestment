import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthProvider'
import { isSupabaseConfigured } from '@/lib/env'
import { getSupabase } from '@/lib/supabaseClient'

/**
 * Keeps TanStack Query + auth profile in sync when Supabase data changes (e.g. admin updates).
 * Requires tables to be part of the `supabase_realtime` publication (Supabase Dashboard → Database → Publications).
 */
export function InvestorRealtimeSync() {
  const qc = useQueryClient()
  const { session, refreshProfile } = useAuth()

  useEffect(() => {
    if (!isSupabaseConfigured || !session?.user?.id) return

    const supabase = getSupabase()
    const uid = session.user.id

    const channel = supabase
      .channel(`app-sync:${uid}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          void qc.invalidateQueries({ queryKey: ['admin', 'users'] })
          const row = (payload.new ?? payload.old) as { id?: string } | undefined
          const affected = row?.id
          if (affected) void qc.invalidateQueries({ queryKey: ['balance', affected] })
          if (affected === uid) void refreshProfile()
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'investments' },
        (payload) => {
          const row = (payload.new ?? payload.old) as { user_id?: string } | undefined
          const wid = row?.user_id
          if (wid) void qc.invalidateQueries({ queryKey: ['investments', wid] })
          void qc.invalidateQueries({ queryKey: ['admin', 'pending-investments'] })
          void qc.invalidateQueries({ queryKey: ['admin', 'overview-metrics'] })
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payment_proofs' },
        (payload) => {
          const row = (payload.new ?? payload.old) as { user_id?: string } | undefined
          const wid = row?.user_id
          if (wid) void qc.invalidateQueries({ queryKey: ['proofs', wid] })
          void qc.invalidateQueries({ queryKey: ['admin', 'payment-proofs'] })
          void qc.invalidateQueries({ queryKey: ['admin', 'pending-payment-proofs'] })
          void qc.invalidateQueries({ queryKey: ['admin', 'overview-metrics'] })
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          const row = (payload.new ?? payload.old) as { user_id?: string } | undefined
          const wid = row?.user_id
          if (wid) void qc.invalidateQueries({ queryKey: ['transactions', wid] })
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'withdrawals' },
        (payload) => {
          const row = (payload.new ?? payload.old) as { user_id?: string } | undefined
          const wid = row?.user_id
          if (wid) void qc.invalidateQueries({ queryKey: ['withdrawals', wid] })
          void qc.invalidateQueries({ queryKey: ['admin', 'pending-withdrawals'] })
          void qc.invalidateQueries({ queryKey: ['balance'] })
          void qc.invalidateQueries({ queryKey: ['admin', 'overview-metrics'] })
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          const row = (payload.new ?? payload.old) as { user_id?: string } | undefined
          const nid = row?.user_id
          if (nid) void qc.invalidateQueries({ queryKey: ['notifications', nid] })
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kyc_documents' },
        (payload) => {
          void qc.invalidateQueries({ queryKey: ['admin', 'kyc-pending'] })
          void qc.invalidateQueries({ queryKey: ['admin', 'overview-metrics'] })
          const row = (payload.new ?? payload.old) as { user_id?: string } | undefined
          if (row?.user_id === uid) void refreshProfile()
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payment_display_settings' },
        () => {
          void qc.invalidateQueries({ queryKey: ['paymentDisplaySettings'] })
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'investment_plans' },
        () => {
          void qc.invalidateQueries({ queryKey: ['plans'] })
          void qc.invalidateQueries({ queryKey: ['admin', 'plans'] })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [session, qc, refreshProfile, session?.user?.id])

  return null
}
