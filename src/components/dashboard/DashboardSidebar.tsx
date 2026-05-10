import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileCheck2,
  Gem,
  Landmark,
  LayoutDashboard,
  LogOut,
  Send,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import { useUiStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'
import { useToastStore } from '@/stores/toastStore'

type Mode = 'app' | 'admin'

type NavItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
}

const appLinks: NavItem[] = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/plans', label: 'Investment Plans', icon: Gem },
  { to: '/app/investments', label: 'Investments', icon: BarChart3 },
  { to: '/app/transactions', label: 'Transactions', icon: CreditCard },
  { to: '/app/withdrawals', label: 'Withdrawals', icon: Wallet },
  { to: '/app/payment-proofs', label: 'Payment Proofs', icon: ShieldCheck },
  { to: '/app/kyc', label: 'KYC Verification', icon: FileCheck2 },
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
  { to: '/app/profile', label: 'Profile Settings', icon: Settings },
]

const adminLinks: NavItem[] = [
  { to: '/admin', label: 'Admin Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/approvals', label: 'Approvals', icon: ShieldCheck },
  { to: '/admin/proofs', label: 'Payment Proofs', icon: CreditCard },
  { to: '/admin/payment-methods', label: 'Payment methods', icon: Landmark },
  { to: '/admin/kyc', label: 'KYC Review', icon: FileCheck2 },
  { to: '/admin/plans', label: 'Manage Plans', icon: Gem },
  { to: '/admin/balances', label: 'Balances', icon: Wallet },
  { to: '/admin/withdrawals', label: 'Withdrawals', icon: Send },
  { to: '/admin/announcements', label: 'Announcements', icon: Bell },
]

export function DashboardSidebar({ mode }: { mode: Mode }) {
  const toast = useToastStore((s) => s.push)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const closeSidebar = useUiStore((s) => s.closeSidebar)
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed)

  const links = mode === 'admin' ? adminLinks : appLinks

  const displayName = user?.fullName ?? user?.email ?? ''

  const renderNav = (collapsed: boolean, showCollapseToggle: boolean) => {
    const onNavigate = () => {
      if (sidebarOpen) closeSidebar()
    }
    const onSignOut = async () => {
      if (sidebarOpen) closeSidebar()
      try {
        await signOut()
        navigate(mode === 'admin' ? '/admin/login' : '/auth/login', { replace: true })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to sign out'
        toast({ tone: 'danger', title: 'Sign out failed', message })
      }
    }

    return (
      <div className="flex h-full flex-col">
        <div className={cn('px-4 py-4', collapsed && 'px-3')}>
          <div className={cn('flex items-center', collapsed ? 'flex-col gap-3' : 'justify-between')}>
            <Link to="/" className={cn('group inline-flex items-center gap-3', collapsed && 'flex-col')}>
              <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--gold),var(--gold2))] text-black shadow-[0_18px_40px_rgba(215,182,97,0.25)]">
                <div className="font-display text-sm font-bold tracking-tight">Au</div>
              </div>
              {collapsed ? null : (
                <div className="leading-tight">
                  <div className="font-display text-sm font-semibold tracking-tight text-white/90">Aurum</div>
                  <div className="text-xs text-white/55">Investment</div>
                </div>
              )}
            </Link>
            {showCollapseToggle ? (
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6 text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            ) : null}
          </div>
        </div>

        {collapsed ? null : (
          <div className="px-4">
            <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/55">Signed in as</div>
              <div className="mt-1 truncate text-sm font-semibold text-white/85">{displayName}</div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-white/6 px-3 py-1.5 text-xs font-semibold text-white/70 ring-1 ring-white/10">
                {mode === 'admin' ? 'Admin Console' : 'Investor Dashboard'}
              </div>
            </div>
          </div>
        )}

        <nav className={cn('mt-5 flex-1 overflow-y-auto pb-4', collapsed ? 'px-2' : 'px-3')}>
          <div className={cn('space-y-1', collapsed && 'space-y-2')}>
            {links.map((l) => {
              const Icon = l.icon
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  title={l.label}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group flex h-11 items-center rounded-2xl text-sm font-semibold transition',
                      collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                      isActive
                        ? 'bg-[linear-gradient(135deg,rgba(215,182,97,0.22),rgba(185,144,44,0.10))] text-white ring-1 ring-[rgba(215,182,97,0.22)]'
                        : 'text-white/70 hover:bg-white/6 hover:text-white',
                    )
                  }
                >
                  <Icon className="h-5 w-5 text-white/70 group-hover:text-white" />
                  <span className={cn(collapsed && 'sr-only')}>{l.label}</span>
                </NavLink>
              )
            })}
          </div>
        </nav>

        <div className={cn('border-t border-white/10 p-4', collapsed && 'px-3')}>
          {collapsed ? (
            <button
              type="button"
              onClick={onSignOut}
              title="Sign out"
              aria-label="Sign out"
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-white/6 text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignOut}
              className="flex h-11 w-full items-center justify-between rounded-2xl bg-white/6 px-4 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
            >
              <span className="inline-flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign out
              </span>
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <aside
        className={cn(
          'sticky top-0 hidden h-dvh shrink-0 border-r border-white/10 bg-black/25 backdrop-blur-xl transition-[width] duration-200 md:block',
          sidebarCollapsed ? 'w-[86px]' : 'w-[300px]',
        )}
      >
        {renderNav(sidebarCollapsed, true)}
      </aside>
      <AnimatePresence>
        {sidebarOpen ? (
          <motion.div
            className="fixed inset-0 z-70 bg-black/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeSidebar()}
          >
            <motion.aside
              initial={{ x: -18, opacity: 0, filter: 'blur(10px)' }}
              animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ x: -18, opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              className="h-dvh w-[min(320px,calc(100vw-3rem))] border-r border-white/10 bg-black/35 backdrop-blur-xl"
            >
              {renderNav(false, false)}
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
