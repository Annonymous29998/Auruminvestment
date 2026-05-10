export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  adminEmailsRaw: import.meta.env.VITE_ADMIN_EMAILS as string | undefined,
  supportEmail: (import.meta.env.VITE_SUPPORT_EMAIL as string | undefined) ?? 'support@aurumafricainvestments.com',
  whatsappLink:
    (import.meta.env.VITE_SUPPORT_WHATSAPP as string | undefined) ??
    'https://wa.me/2340000000000?text=Hello%20Aurum%20Investment%20Support',
  telegramLink:
    (import.meta.env.VITE_SUPPORT_TELEGRAM as string | undefined) ??
    'https://t.me/aurumafrica_support',
  bankAccountName: (import.meta.env.VITE_BANK_ACCOUNT_NAME as string | undefined) ?? 'Aurum Investment',
  bankAccountNumber: (import.meta.env.VITE_BANK_ACCOUNT_NUMBER as string | undefined) ?? '0000000000',
  bankName: (import.meta.env.VITE_BANK_NAME as string | undefined) ?? 'African Gold Bank',
  btcAddress:
    (import.meta.env.VITE_BTC_ADDRESS as string | undefined) ??
    'bc1qexamplebtcaddress000000000000000000000000000',
  usdtAddress:
    (import.meta.env.VITE_USDT_ADDRESS as string | undefined) ??
    'TExampleUSDTAddress00000000000000000000000000',
} as const

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey)

export function getAdminEmailAllowList() {
  const raw = env.adminEmailsRaw?.trim()
  if (!raw) return null
  const list = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return list.length ? list : null
}
