import { useQuery } from '@tanstack/react-query'
import { fetchGoldSpotTicker } from '@/lib/goldSpotTicker'

function formatTickerPrice(symbol: string, price: number) {
  if (symbol === 'XAU/USD') {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function TickerCard({
  symbol,
  price,
  changePct,
}: {
  symbol: string
  price: number
  changePct: number
}) {
  return (
    <div className="min-w-[220px] shrink-0 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/55">{symbol}</div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="text-lg font-semibold text-white/90">{formatTickerPrice(symbol, price)}</div>
        <div className={`text-sm font-semibold ${changePct >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
          {changePct >= 0 ? '+' : ''}
          {changePct.toFixed(2)}%
        </div>
      </div>
    </div>
  )
}

export function GoldTicker() {
  const q = useQuery({
    queryKey: ['gold-spot-ticker'],
    queryFn: fetchGoldSpotTicker,
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: 1,
  })

  const quotes = q.data?.quotes ?? []
  const doubled = quotes.length ? [...quotes, ...quotes] : []

  return (
    <div className="overflow-hidden rounded-3xl aurum-glass ring-1 ring-white/10">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/8 px-5 py-4 sm:gap-3">
        <div className="h-2 w-2 shrink-0 rounded-full bg-gold" />
        <div className="text-sm font-semibold text-white/85">Live Gold Snapshot</div>
        {q.data?.asOfDate ? (
          <div className="ml-auto text-xs text-white/55">As of {q.data.asOfDate}</div>
        ) : null}
      </div>

      <div className="relative py-4">
        {q.isLoading ? (
          <div className="flex gap-3 overflow-hidden px-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="min-w-[220px] shrink-0 animate-pulse rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
              >
                <div className="h-3 w-20 rounded bg-white/10" />
                <div className="mt-4 h-6 w-32 rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : q.isError || !doubled.length ? (
          <div className="px-5 py-2 text-sm text-white/60">
            Live prices are temporarily unavailable. The gold chart below may still load from cache.
          </div>
        ) : (
          <div className="aurum-gold-marquee-mask">
            <div className="aurum-gold-marquee-track flex gap-3 px-4">
              {doubled.map((item, i) => (
                <TickerCard key={`${item.symbol}-${i}`} {...item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
