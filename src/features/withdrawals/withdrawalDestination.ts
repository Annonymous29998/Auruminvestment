/** Stored in `public.withdrawals.destination` as JSON (v1) or legacy plain text. */

export type WithdrawalMethod = 'bank_us' | 'wallet'

export type WithdrawalDestinationV1Bank = {
  v: 1
  method: 'bank_us'
  accountHolderName: string
  bankName: string
  routingNumber: string
  accountNumber: string
  accountType: 'checking' | 'savings'
}

export type WithdrawalDestinationV1Wallet = {
  v: 1
  method: 'wallet'
  network: string
  address: string
}

export type WithdrawalDestinationV1 = WithdrawalDestinationV1Bank | WithdrawalDestinationV1Wallet

export function buildWithdrawalDestinationJson(payload: WithdrawalDestinationV1): string {
  return JSON.stringify(payload)
}

export function formatWithdrawalDestinationDisplay(raw: string): string {
  const t = raw.trim()
  if (!t.startsWith('{')) return raw
  try {
    const o = JSON.parse(t) as Partial<WithdrawalDestinationV1> & { method?: string }
    if (o.v !== 1 || !o.method) return raw
    if (o.method === 'bank_us') {
      const b = o as WithdrawalDestinationV1Bank
      const last4 =
        b.accountNumber && b.accountNumber.length >= 4 ? b.accountNumber.slice(-4) : '••••'
      return [
        'Bank transfer (US)',
        `Account holder: ${b.accountHolderName || '—'}`,
        `Bank: ${b.bankName || '—'}`,
        `Routing (ABA): ${b.routingNumber || '—'}`,
        `Account (${b.accountType || '—'}): …${last4}`,
      ].join('\n')
    }
    if (o.method === 'wallet') {
      const w = o as WithdrawalDestinationV1Wallet
      return ['Crypto wallet', `Network: ${w.network || '—'}`, `Address: ${w.address || '—'}`].join('\n')
    }
  } catch {
    return raw
  }
  return raw
}
