import { fetchGoldHistory, type GoldHistoryPoint } from '@/lib/goldHistory'

/** Mid-market USD→currency; updated daily. https://github.com/fawazahmed0/currency-api */
const USD_RATES_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'

export type GoldTickerQuote = {
  symbol: string
  price: number
  /** Day-over-day % from last two daily gold closes (same % on FX crosses as gold move). */
  changePct: number
}

export type GoldSpotTickerResult = {
  quotes: GoldTickerQuote[]
  /** ISO date from FX feed or gold series. */
  asOfDate: string | null
}

function lastTradingPoints(points: GoldHistoryPoint[], count: number): GoldHistoryPoint[] {
  const yahoo = points.filter((p) => (p.source ?? '').toLowerCase().includes('yahoo'))
  const series = yahoo.length >= count ? yahoo : points
  return series.slice(-count)
}

export async function fetchGoldSpotTicker(): Promise<GoldSpotTickerResult> {
  const [history, fxRes] = await Promise.all([
    fetchGoldHistory(),
    fetch(USD_RATES_URL, { headers: { Accept: 'application/json' } }),
  ])

  if (!fxRes.ok) throw new Error('FX rates unavailable')

  const pts = lastTradingPoints(history, 2)
  if (pts.length < 1) throw new Error('No gold price data')

  const latest = pts[pts.length - 1]!
  const prev = pts.length >= 2 ? pts[pts.length - 2]! : latest
  const spotUsdOz = latest.price
  const changePct = prev.price > 0 ? ((spotUsdOz - prev.price) / prev.price) * 100 : 0

  const fxJson = (await fxRes.json()) as { date?: string; usd?: Record<string, number> }
  const usd = fxJson.usd ?? {}
  const ngn = usd.ngn
  const zar = usd.zar
  const ghs = usd.ghs

  if (typeof ngn !== 'number' || typeof zar !== 'number' || typeof ghs !== 'number') {
    throw new Error('Incomplete FX crosses (NGN/ZAR/GHS)')
  }

  const quotes: GoldTickerQuote[] = [
    { symbol: 'XAU/USD', price: spotUsdOz, changePct },
    { symbol: 'XAU/NGN', price: spotUsdOz * ngn, changePct },
    { symbol: 'XAU/ZAR', price: spotUsdOz * zar, changePct },
    { symbol: 'XAU/GHS', price: spotUsdOz * ghs, changePct },
  ]

  return {
    quotes,
    asOfDate: typeof fxJson.date === 'string' ? fxJson.date : latest.date,
  }
}
