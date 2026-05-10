export type GoldHistoryPoint = {
  date: string
  price: number
  source?: string
}

const GOLD_HISTORY_URL = 'https://freegoldapi.com/data/latest.json'

function parsePoints(data: unknown): GoldHistoryPoint[] {
  if (!Array.isArray(data)) return []
  const out: GoldHistoryPoint[] = []
  for (const item of data) {
    if (!item || typeof item !== 'object') continue
    const rec = item as Record<string, unknown>
    const date = rec.date
    const price = rec.price
    const source = rec.source
    if (typeof date !== 'string') continue
    if (typeof price !== 'number' || !Number.isFinite(price)) continue
    out.push({
      date,
      price,
      source: typeof source === 'string' ? source : undefined,
    })
  }
  return out
}

export async function fetchGoldHistory(): Promise<GoldHistoryPoint[]> {
  const res = await fetch(GOLD_HISTORY_URL, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('Unable to load gold history')
  const data = (await res.json()) as unknown
  return parsePoints(data)
}
