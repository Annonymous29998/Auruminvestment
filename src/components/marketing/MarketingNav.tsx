import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { AurumMark } from '@/components/marketing/AurumMark'
import { useAuth } from '@/features/auth/AuthProvider'

const links = [
  { to: '/#how-it-works', label: 'How It Works', hash: '#how-it-works' },
  { to: '/#faq', label: 'FAQ', hash: '#faq' },
  { to: '/#about', label: 'About', hash: '#about' },
  { to: '/#contact', label: 'Contact', hash: '#contact' },
]

export function MarketingNav() {
  const { user } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const cta = useMemo(() => {
    if (user?.role === 'admin') return { to: '/admin', label: 'Admin Console' }
    if (user) return { to: '/app', label: 'Dashboard' }
    return { to: '/auth/login', label: 'Log in' }
  }, [user])

  return (
    <header
      className={[
        'fixed left-0 top-0 z-50 w-full border-b backdrop-blur-xl transition',
        scrolled ? 'border-white/10 bg-black/55 shadow-[0_18px_50px_rgba(0,0,0,0.55)]' : 'border-white/8 bg-black/35',
      ].join(' ')}
    >
      <div className="aurum-container">
        <div className="relative flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AurumMark />
          </div>

          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <div className="inline-flex items-center gap-1 rounded-full bg-white/6 p-1 ring-1 ring-white/12">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  aria-current={location.pathname === '/' && location.hash === l.hash ? 'page' : undefined}
                  className={[
                    'inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-semibold transition',
                    location.pathname === '/' && location.hash === l.hash
                      ? 'bg-white/10 text-white ring-1 ring-white/12'
                      : 'text-white/70 hover:bg-white/8 hover:text-white',
                  ].join(' ')}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <Link to={cta.to} className="hidden sm:block">
              <Button
                variant={user ? 'primary' : 'secondary'}
                className={
                  user
                    ? 'shadow-[0_18px_40px_rgba(215,182,97,0.18)]'
                    : 'bg-transparent ring-1 ring-[rgba(215,182,97,0.45)] text-white/85 hover:bg-[rgba(215,182,97,0.08)]'
                }
              >
                {cta.label} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/6 text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-60 bg-black/90 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ x: 24, opacity: 0, filter: 'blur(10px)' }}
              animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ x: 24, opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.22 }}
              className="absolute right-3 top-3 w-[min(380px,calc(100vw-1.5rem))] rounded-3xl bg-black/85 backdrop-blur-2xl ring-1 ring-white/10"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="text-sm font-semibold text-white/85">Menu</div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6 text-white/80 ring-1 ring-white/10"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-5 py-5">
                <div className="space-y-1">
                  {links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="flex h-12 items-center justify-between rounded-2xl bg-white/5 px-4 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
                    >
                      {l.label}
                      <ArrowRight className="h-4 w-4 text-white/55" />
                    </Link>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2">
                  <Link to={cta.to} onClick={() => setOpen(false)}>
                    <Button variant="primary" className="w-full">
                      {cta.label}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
