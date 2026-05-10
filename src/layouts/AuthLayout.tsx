import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AurumMark } from '@/components/marketing/AurumMark'

export function AuthLayout() {
  return (
    <div className="min-h-dvh">
      <div className="aurum-container py-8 sm:py-10">
        <div className="flex items-center justify-between">
          <AurumMark />
          <div className="text-sm text-white/60">Secure investor access</div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
          transition={{ duration: 0.22 }}
          className="mx-auto mt-8 max-w-md rounded-3xl aurum-glass-strong ring-1 ring-white/10"
        >
          <div className="border-b border-white/10 px-6 py-6">
            <div className="font-display text-xl font-semibold text-white/90">
              Aurum Investment
            </div>
            <div className="mt-1 text-sm text-white/65">
              Gold-backed opportunities with compliance-first onboarding and payment confirmation by our team.
            </div>
          </div>
          <div className="px-6 py-6">
            <Outlet />
          </div>
        </motion.div>
        <div className="mx-auto mt-6 max-w-md text-xs text-white/55">
          Returns are defined by each plan’s terms. KYC verification is required before withdrawals.
        </div>
      </div>
    </div>
  )
}
