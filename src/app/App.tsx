import { AnimatePresence } from 'framer-motion'
import { AppRouter } from '@/app/router/AppRouter'

export default function App() {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {/* Stable key: pathname as key remounted the whole router on every navigation and could
          interact badly with auth/layout. Route-level transitions stay inside AppRouter. */}
      <AppRouter key="routes" />
    </AnimatePresence>
  )
}

