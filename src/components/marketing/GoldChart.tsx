import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { fetchGoldHistory } from '@/lib/goldHistory'

function toPath(values: number[], w: number, h: number, pad = 14) {
  if (values.length < 2) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const dx = w / (values.length - 1)
  const range = Math.max(0.000001, max - min)
  const yFor = (v: number) => {
    const t = (v - min) / range
    return pad + (1 - t) * (h - pad * 2)
  }
  return values
    .map((v, i) => {
      const x = i * dx
      const y = yFor(v)
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

function formatUsd(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)
}

export function GoldChart({ height = 160 }: { height?: number }) {
  const w = 520
  const h = height

  const q = useQuery({
    queryKey: ['gold-history'],
    queryFn: fetchGoldHistory,
    staleTime: 1000 * 60 * 60,
    refetchInterval: 1000 * 60 * 30,
  })

  const { series, latest, changePct } = useMemo(() => {
    const points = (q.data ?? []).slice(-60)
    const series = points.map((p) => p.price)
    const latest = series.at(-1) ?? null
    const first = series.at(0) ?? null
    const changePct = latest != null && first != null ? ((latest - first) / first) * 100 : null
    return { series, latest, changePct }
  }, [q.data])

  const d = useMemo(() => toPath(series, w, h), [series, w, h])
  const lastX = series.length > 1 ? w : 0
  const lastY = useMemo(() => {
    if (series.length < 2) return h / 2
    const min = Math.min(...series)
    const max = Math.max(...series)
    const range = Math.max(0.000001, max - min)
    const t = ((series.at(-1) ?? min) - min) / range
    const pad = 14
    return pad + (1 - t) * (h - pad * 2)
  }, [h, series])

  return (
    <div className="rounded-3xl aurum-glass ring-1 ring-white/10">
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
        <div className="text-sm font-semibold text-white/85">Gold Trend</div>
        <div className="text-xs text-white/55">
          {latest != null ? `${formatUsd(latest)} / oz` : 'Loading prices…'}
        </div>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/55">
            {q.isError ? 'Market feed unavailable' : 'Last 60 points'}
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-1 ring-1 ring-white/10">
              <span className="text-white/70">Change</span>
              <span className={changePct != null && changePct >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                {changePct == null ? '—' : `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`}
              </span>
            </div>
          </div>
        </div>

        <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
          <defs>
            <linearGradient id="aurumLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="rgba(215,182,97,0.9)" />
              <stop offset="1" stopColor="rgba(185,144,44,0.9)" />
            </linearGradient>
            <linearGradient id="aurumFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="rgba(215,182,97,0.22)" />
              <stop offset="1" stopColor="rgba(215,182,97,0.02)" />
            </linearGradient>
          </defs>

          {d ? (
            <>
              <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill="url(#aurumFill)" />
              <motion.path
                d={d}
                fill="none"
                stroke="url(#aurumLine)"
                strokeWidth="3"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
              <circle cx={lastX} cy={lastY} r="4.5" fill="rgba(215,182,97,0.95)" />
              <circle cx={lastX} cy={lastY} r="9.5" fill="rgba(215,182,97,0.12)" />
            </>
          ) : (
            <text x="18" y={h / 2} fill="rgba(255,255,255,0.65)" fontSize="14">
              {q.isError ? 'Unable to load market history.' : 'Loading chart…'}
            </text>
          )}
          <g opacity="0.35">
            {[0.25, 0.5, 0.75].map((p) => (
              <line
                key={p}
                x1="0"
                x2={w}
                y1={h * p}
                y2={h * p}
                stroke="rgba(255,255,255,0.12)"
                strokeDasharray="6 6"
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
