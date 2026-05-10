import { Bell, Menu, UserCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/AuthProvider'
import { useUiStore } from '@/stores/uiStore'

export function DashboardTopbar({ admin }: { admin?: boolean }) {
  const { user } = useAuth()
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={[
        'sticky top-0 z-40 border-b backdrop-blur-xl transition',
        scrolled ? 'border-white/12 bg-black/55 shadow-[0_18px_50px_rgba(0,0,0,0.55)]' : 'border-white/10 bg-black/25',
      ].join(' ')}
    >
      <div className="aurum-container">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSidebar}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/6 text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <div className="font-display text-sm font-semibold text-white/90">
                {admin ? 'Admin Dashboard' : 'Investor Dashboard'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to={admin ? '/admin/announcements' : '/app/notifications'}>
              <button
                type="button"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/6 text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold" />
              </button>
            </Link>
            <Link to={admin ? '/admin' : '/app/profile'} className="hidden sm:block">
              <Button variant="secondary" className="gap-2">
                <UserCircle2 className="h-4 w-4" />
                <span className="max-w-[180px] truncate">{user?.fullName ?? user?.email}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
