import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Wallet } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { formatUsd } from '@/features/investments/calculator'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  buildWithdrawalDestinationJson,
  formatWithdrawalDestinationDisplay,
  type WithdrawalMethod,
} from '@/features/withdrawals/withdrawalDestination'
import { createWithdrawalRequest, getWithdrawals } from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/env'
import { useToastStore } from '@/stores/toastStore'

const WALLET_NETWORKS = ['BTC', 'ETH', 'USDT (TRC20)', 'USDT (ERC20)', 'USDC', 'Other'] as const

export function WithdrawalsPage() {
  const toast = useToastStore((s) => s.push)
  const qc = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const [amountUsd, setAmountUsd] = useState<number>(0)
  const [method, setMethod] = useState<WithdrawalMethod>('bank_us')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [bankName, setBankName] = useState('')
  const [routingNumber, setRoutingNumber] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking')
  const [walletNetwork, setWalletNetwork] = useState<string>(WALLET_NETWORKS[0])
  const [walletAddress, setWalletAddress] = useState('')

  const listQ = useQuery({
    queryKey: ['withdrawals', userId],
    queryFn: () => getWithdrawals(userId),
    enabled: Boolean(userId),
    placeholderData: [],
    retry: 0,
  })

  const createM = useMutation({
    mutationFn: (destinationJson: string) =>
      createWithdrawalRequest({
        userId,
        amountUsd,
        destination: destinationJson,
        kycApproved: user?.kycStatus === 'approved',
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['withdrawals', userId] }),
        qc.invalidateQueries({ queryKey: ['balance', userId] }),
        qc.invalidateQueries({ queryKey: ['admin', 'pending-withdrawals'] }),
      ])
      setAmountUsd(0)
      setMethod('bank_us')
      setAccountHolderName('')
      setBankName('')
      setRoutingNumber('')
      setAccountNumber('')
      setAccountType('checking')
      setWalletNetwork(WALLET_NETWORKS[0])
      setWalletAddress('')
      toast({
        tone: 'success',
        title: 'Request submitted',
        message: 'We received your withdrawal request.',
      })
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Unable to submit'
      toast({ tone: 'danger', title: 'Request failed', message: msg })
    },
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      toast({ tone: 'warning', title: 'Configuration required', message: 'Supabase is not configured.' })
      return
    }
    if (!userId) {
      toast({ tone: 'warning', title: 'Sign in required', message: 'Please sign in again.' })
      return
    }
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      toast({ tone: 'warning', title: 'Invalid amount', message: 'Enter a withdrawal amount greater than zero.' })
      return
    }

    let destinationJson = ''
    if (method === 'bank_us') {
      const holder = accountHolderName.trim()
      const bank = bankName.trim()
      const routing = routingNumber.replace(/\s/g, '')
      const acct = accountNumber.replace(/\s/g, '')
      if (!holder || !bank) {
        toast({
          tone: 'warning',
          title: 'Missing details',
          message: 'Enter the legal account holder name and bank name as they appear on your US account.',
        })
        return
      }
      if (!/^\d{9}$/.test(routing)) {
        toast({
          tone: 'warning',
          title: 'Routing number',
          message: 'US ABA routing numbers are exactly 9 digits (no letters).',
        })
        return
      }
      if (!/^\d{4,17}$/.test(acct)) {
        toast({
          tone: 'warning',
          title: 'Account number',
          message: 'Enter a valid US bank account number (digits only, typically 4–17 digits).',
        })
        return
      }
      destinationJson = buildWithdrawalDestinationJson({
        v: 1,
        method: 'bank_us',
        accountHolderName: holder,
        bankName: bank,
        routingNumber: routing,
        accountNumber: acct,
        accountType,
      })
    } else {
      const net = walletNetwork.trim()
      const addr = walletAddress.trim()
      if (!net || !addr) {
        toast({ tone: 'warning', title: 'Missing details', message: 'Choose a network and enter your wallet address.' })
        return
      }
      destinationJson = buildWithdrawalDestinationJson({
        v: 1,
        method: 'wallet',
        network: net,
        address: addr,
      })
    }

    createM.mutate(destinationJson)
  }

  return (
    <div>
      <PageHeader
        title="Withdrawals"
        subtitle="Request a payout to your bank or wallet. KYC must be approved and your balance must cover the amount."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <Card className="ring-1 ring-white/10">
          <CardHeader className="flex-row items-center justify-between pb-0">
            <CardTitle className="text-base">Request withdrawal</CardTitle>
            <Wallet className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={submit} className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>Amount (USD)</Label>
                <Input
                  inputMode="decimal"
                  value={String(amountUsd || '')}
                  onChange={(e) => setAmountUsd(Number(e.target.value))}
                  placeholder="0"
                />
                <div className="text-xs text-white/55">Enter the amount you want sent to your destination.</div>
              </div>
              <div className="space-y-2">
                <Label>Payout method</Label>
                <Select value={method} onChange={(e) => setMethod(e.target.value as WithdrawalMethod)}>
                  <option value="bank_us">US bank transfer (ACH)</option>
                  <option value="wallet">Crypto wallet</option>
                </Select>
                <div className="text-xs text-white/55">
                  {method === 'bank_us'
                    ? 'For US domestic payouts we collect standard ACH details (ABA routing + account number).'
                    : 'Send crypto to the address you provide. Double-check the network matches your wallet.'}
                </div>
              </div>

              {method === 'bank_us' ? (
                <div className="contents">
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Legal name on the account</Label>
                    <Input
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Exactly as on your bank statement / KYC"
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank name</Label>
                    <Input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. Chase, Bank of America"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account type</Label>
                    <Select value={accountType} onChange={(e) => setAccountType(e.target.value as 'checking' | 'savings')}>
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ABA routing number (9 digits)</Label>
                    <Input
                      inputMode="numeric"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      placeholder="021000021"
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account number</Label>
                    <Input
                      inputMode="numeric"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 17))}
                      placeholder="Your account number"
                      autoComplete="off"
                    />
                  </div>
                </div>
              ) : (
                <div className="contents">
                  <div className="space-y-2">
                    <Label>Network / asset</Label>
                    <Select value={walletNetwork} onChange={(e) => setWalletNetwork(e.target.value)}>
                      {WALLET_NETWORKS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Wallet address</Label>
                    <Input
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Paste your receiving address"
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}

              <div className="lg:col-span-2">
                <Button type="submit" variant="primary" className="w-full" disabled={createM.isPending}>
                  {createM.isPending ? 'Submitting…' : 'Submit withdrawal request'}
                </Button>
                <div className="mt-3 text-xs leading-relaxed text-white/55">
                  Investments involve risk and returns are not guaranteed. Withdrawals may be subject to compliance checks.
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="ring-1 ring-white/10">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-base">Your requests</CardTitle>
            <div className="mt-1 text-sm text-white/65">Status updates here when your request is processed.</div>
          </CardHeader>
          <CardContent className="pt-6">
            {listQ.isError ? (
              <EmptyState title="Unable to load" description="Refresh the page and try again." />
            ) : listQ.data?.length ? (
              <div className="space-y-3">
                {listQ.data.map((w) => (
                  <div key={w.id} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white/85">{formatUsd(w.amountUsd)}</div>
                        <div className="mt-1 text-xs text-white/55">{new Date(w.createdAt).toLocaleString()}</div>
                      </div>
                      <Badge
                        tone={
                          w.status === 'approved' ? 'success' : w.status === 'pending' ? 'warning' : 'danger'
                        }
                      >
                        {w.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div
                      className="mt-2 line-clamp-4 whitespace-pre-line wrap-break-word text-xs text-white/65"
                      title={formatWithdrawalDestinationDisplay(w.destination)}
                    >
                      {formatWithdrawalDestinationDisplay(w.destination)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Wallet className="h-5 w-5 text-gold" />}
                title="No withdrawals yet"
                description="Submit a request using the form. It will appear in this list."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
