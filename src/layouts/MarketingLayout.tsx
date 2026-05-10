import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { MarketingNav } from '@/components/marketing/MarketingNav'

export function MarketingLayout() {
  const location = useLocation()

  useEffect(() => {
    const hash = location.hash
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const id = decodeURIComponent(hash.replace('#', ''))
    let cancelled = false

    const attemptScroll = (attempt: number) => {
      if (cancelled) return
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      if (attempt < 20) window.setTimeout(() => attemptScroll(attempt + 1), 50)
    }

    attemptScroll(0)
    return () => {
      cancelled = true
    }
  }, [location.hash, location.pathname])

  return (
    <div className="min-h-dvh overflow-x-hidden">
      <MarketingNav />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.22 }}
        className="pb-10 pt-16"
      >
        <Outlet />
      </motion.main>
      <MarketingFooter />
    </div>
  )
}
