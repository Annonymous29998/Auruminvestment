/** Build a usable `href` from admin-entered WhatsApp URL or raw phone digits. */
export function hrefForWhatsApp(input: string): string {
  const t = input.trim()
  if (!t) return '#'
  if (/^https?:\/\//i.test(t)) return t
  const digits = t.replace(/\D/g, '')
  if (digits.length >= 8) return `https://wa.me/${digits}`
  return `https://wa.me/${encodeURIComponent(t)}`
}

/** Build a usable `href` from admin-entered Telegram URL, @handle, or handle. */
export function hrefForTelegram(input: string): string {
  const t = input.trim()
  if (!t) return '#'
  if (/^https?:\/\//i.test(t)) return t
  const h = t.startsWith('@') ? t.slice(1) : t
  return `https://t.me/${encodeURIComponent(h)}`
}
