import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

type Quote = {
  symbol: string
  price: number
  changePct: number
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function jitter(n: number, pct: number, rnd: () => number) {
  const amp = n * pct
  return n + (rnd() * 2 - 1) * amp
}

export function GoldTicker() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 2200)
    return () => window.clearInterval(id)
  }, [])

  const quotes = useMemo<Quote[]>(() => {
    const rnd = mulberry32(0xA11CE ^ (tick + 1) * 2654435761)
    const base = [
      { symbol: 'XAU/USD', price: 2368.4, changePct: 0.62 },
      { symbol: 'XAU/NGN', price: 3689120, changePct: -0.28 },
      { symbol: 'XAU/ZAR', price: 44055, changePct: 0.41 },
      { symbol: 'XAU/GHS', price: 33345, changePct: 0.15 },
    ]
    return base.map((q, idx) => {
      const localRnd = mulberry32(Math.floor(rnd() * 1_000_000) + idx * 97)
      return {
      symbol: q.symbol,
      price:
        q.symbol === 'XAU/USD' ? jitter(q.price, 0.002, localRnd) : jitter(q.price, 0.003, localRnd),
      changePct: jitter(q.changePct, 0.18, localRnd),
      }
    })
  }, [tick])

  return (
    <div className="overflow-hidden rounded-3xl aurum-glass ring-1 ring-white/10">
      <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
        <div className="h-2 w-2 rounded-full bg-gold" />
        <div className="text-sm font-semibold text-white/85">Live Gold Snapshot</div>
        <div className="ml-auto text-xs text-white/55">Indicative market snapshot</div>
      </div>
      <div className="flex gap-3 p-4">
        {quotes.map((q) => (
          <motion.div
            key={q.symbol}
            layout
            transition={{ duration: 0.35, type: 'spring', bounce: 0.18 }}
            className="min-w-[220px] flex-1 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-white/55">{q.symbol}</div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div className="text-lg font-semibold text-white/90">
                {q.symbol === 'XAU/USD'
                  ? `$${q.price.toFixed(2)}`
                  : q.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div
                className={`text-sm font-semibold ${
                  q.changePct >= 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {q.changePct >= 0 ? '+' : ''}
                {q.changePct.toFixed(2)}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
