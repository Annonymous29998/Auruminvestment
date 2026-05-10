import type { AppUser } from '@/features/auth/authTypes'
import { env, isSupabaseConfigured } from '@/lib/env'
import { getSupabase } from '@/lib/supabaseClient'
import type {
  Investment,
  InvestmentPlan,
  KycDocument,
  NotificationItem,
  PaymentProof,
  Transaction,
  Withdrawal,
} from '@/types/domain'

function assertSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return getSupabase()
}

async function withTimeout<T>(promise: PromiseLike<T>, ms: number, message: string): Promise<T> {
  let timer: number | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(message)), ms)
  })
  try {
    return await Promise.race([Promise.resolve(promise), timeout])
  } finally {
    if (timer) window.clearTimeout(timer)
  }
}

function getNestedNumber(value: unknown, key: string): number | null {
  if (!value) return null
  if (Array.isArray(value)) {
    const first = value[0]
    if (!first || typeof first !== 'object') return null
    const raw = (first as Record<string, unknown>)[key]
    if (typeof raw === 'number') return raw
    if (typeof raw === 'string' && raw.trim()) return Number(raw)
    return raw == null ? null : Number(raw)
  }
  if (typeof value === 'object') {
    const raw = (value as Record<string, unknown>)[key]
    if (typeof raw === 'number') return raw
    if (typeof raw === 'string' && raw.trim()) return Number(raw)
    return raw == null ? null : Number(raw)
  }
  return null
}

function getNestedString(value: unknown, key: string): string | null {
  if (!value) return null
  if (Array.isArray(value)) {
    const first = value[0]
    if (!first || typeof first !== 'object') return null
    const raw = (first as Record<string, unknown>)[key]
    if (typeof raw === 'string') return raw
    return raw == null ? null : String(raw)
  }
  if (typeof value === 'object') {
    const raw = (value as Record<string, unknown>)[key]
    if (typeof raw === 'string') return raw
    return raw == null ? null : String(raw)
  }
  return null
}

export type AdminOverviewMetrics = {
  usersCount: number
  pendingProofsCount: number
  pendingKycCount: number
  totalBalanceUsd: number
}

export async function adminGetOverviewMetrics(): Promise<AdminOverviewMetrics> {
  const supabase = assertSupabase()

  const [usersCountR, proofsCountR, kycCountR, balancesR] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('payment_proofs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('kyc_documents').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('users').select('balance_usd'),
  ])

  if (usersCountR.error) throw usersCountR.error
  if (proofsCountR.error) throw proofsCountR.error
  if (kycCountR.error) throw kycCountR.error
  if (balancesR.error) throw balancesR.error

  const totalBalanceUsd = (balancesR.data ?? []).reduce((sum, row) => sum + (row.balance_usd ?? 0), 0)

  return {
    usersCount: usersCountR.count ?? 0,
    pendingProofsCount: proofsCountR.count ?? 0,
    pendingKycCount: kycCountR.count ?? 0,
    totalBalanceUsd,
  }
}

export type PaymentDisplaySettings = {
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
  supportEmail: string
  whatsappLink: string
  telegramLink: string
  btcAddress: string
  usdtAddress: string
}

/** Per-field: non-empty DB value wins; otherwise Vite env defaults (marketing / .env). */
export function mergePaymentDisplayWithEnv(db: PaymentDisplaySettings | null | undefined) {
  const pick = (dbVal: string | null | undefined, envVal: string) => {
    const t = (dbVal ?? '').trim()
    return t.length ? t : envVal
  }
  return {
    bankName: pick(db?.bankName, env.bankName),
    bankAccountName: pick(db?.bankAccountName, env.bankAccountName),
    bankAccountNumber: pick(db?.bankAccountNumber, env.bankAccountNumber),
    supportEmail: pick(db?.supportEmail, env.supportEmail),
    whatsappLink: pick(db?.whatsappLink, env.whatsappLink),
    telegramLink: pick(db?.telegramLink, env.telegramLink),
    btcAddress: pick(db?.btcAddress, env.btcAddress),
    usdtAddress: pick(db?.usdtAddress, env.usdtAddress),
  }
}

function mapPaymentDisplayRow(row: Record<string, unknown>): PaymentDisplaySettings {
  return {
    bankName: String(row.bank_name ?? ''),
    bankAccountName: String(row.bank_account_name ?? ''),
    bankAccountNumber: String(row.bank_account_number ?? ''),
    supportEmail: String(row.support_email ?? ''),
    whatsappLink: String(row.whatsapp_link ?? ''),
    telegramLink: String(row.telegram_link ?? ''),
    btcAddress: String(row.btc_address ?? ''),
    usdtAddress: String(row.usdt_address ?? ''),
  }
}

/** Row in DB; empty strings fall back to Vite env in the UI via mergePaymentDisplayWithEnv. */
export async function getPaymentDisplaySettings(): Promise<PaymentDisplaySettings | null> {
  const supabase = assertSupabase()
  const { data, error } = await supabase.from('payment_display_settings').select('*').eq('id', 1).maybeSingle()
  if (error) {
    const msg = String(error.message ?? '').toLowerCase()
    if (msg.includes('relation') || msg.includes('does not exist') || error.code === '42P01') return null
    throw error
  }
  if (!data) return null
  return mapPaymentDisplayRow(data as Record<string, unknown>)
}

export async function adminUpsertPaymentDisplaySettings(args: PaymentDisplaySettings): Promise<void> {
  const supabase = assertSupabase()
  const { error } = await supabase.from('payment_display_settings').upsert(
    {
      id: 1,
      bank_name: args.bankName,
      bank_account_name: args.bankAccountName,
      bank_account_number: args.bankAccountNumber,
      support_email: args.supportEmail,
      whatsapp_link: args.whatsappLink,
      telegram_link: args.telegramLink,
      btc_address: args.btcAddress,
      usdt_address: args.usdtAddress,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )
  if (error) throw error
}

export async function getInvestmentPlans(): Promise<InvestmentPlan[]> {
  const supabase = assertSupabase()
  const queryWithActive = () =>
    supabase
      .from('investment_plans')
      .select('id,name,min_investment_usd,duration_days,estimated_roi_percent,summary,highlights,active')
      .eq('active', true)
      .order('min_investment_usd', { ascending: true })

  const queryWithoutActive = () =>
    supabase
      .from('investment_plans')
      .select('id,name,min_investment_usd,duration_days,estimated_roi_percent,summary,highlights')
      .order('min_investment_usd', { ascending: true })

  const result = await withTimeout(queryWithActive(), 10_000, 'Unable to load plans. Please check your connection.')
  if (result.error && String(result.error.message ?? '').toLowerCase().includes('active')) {
    const fallback = await withTimeout(
      queryWithoutActive(),
      10_000,
      'Unable to load plans. Please check your connection.',
    )
    if (fallback.error) throw fallback.error
    return (fallback.data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      minInvestmentUsd: p.min_investment_usd,
      durationDays: p.duration_days,
      estimatedRoiPercent: p.estimated_roi_percent,
      summary: p.summary,
      highlights: p.highlights ?? [],
    }))
  }
  const { data, error } = result
  if (error) throw error
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    minInvestmentUsd: p.min_investment_usd,
    durationDays: p.duration_days,
    estimatedRoiPercent: p.estimated_roi_percent,
    summary: p.summary,
    highlights: p.highlights ?? [],
  }))
}

export async function ensureUserProfile(args: { userId: string; email: string; fullName?: string | null }) {
  const supabase = assertSupabase()
  const { error } = await supabase
    .from('users')
    .upsert(
      {
        id: args.userId,
        email: args.email,
        full_name: args.fullName ?? null,
      },
      { onConflict: 'id' },
    )
  if (error) throw error
}

export async function getBalanceUsd(userId: string): Promise<number> {
  const supabase = assertSupabase()
  const { data, error } = await supabase.from('users').select('balance_usd').eq('id', userId).maybeSingle()
  if (error) throw error
  return data?.balance_usd ?? 0
}

export async function getInvestments(userId: string): Promise<Investment[]> {
  const supabase = assertSupabase()
  const { data, error } = await supabase
    .from('investments')
    .select('id,user_id,plan_id,plan_name,amount_usd,status,projected_return_usd,created_at,started_at,ends_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((i) => ({
    id: i.id,
    userId: i.user_id,
    planId: i.plan_id,
    planName: i.plan_name,
    amountUsd: i.amount_usd,
    status: i.status,
    projectedReturnUsd: i.projected_return_usd,
    createdAt: i.created_at,
    startedAt: i.started_at,
    endsAt: i.ends_at,
  }))
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const supabase = assertSupabase()
  const { data, error } = await supabase
    .from('transactions')
    .select('id,user_id,type,amount_usd,status,reference,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((t) => ({
    id: t.id,
    userId: t.user_id,
    type: t.type,
    amountUsd: t.amount_usd,
    status: t.status,
    reference: t.reference,
    createdAt: t.created_at,
  }))
}

export async function getNotifications(userId: string): Promise<NotificationItem[]> {
  const supabase = assertSupabase()
  const { data, error } = await supabase
    .from('notifications')
    .select('id,user_id,title,message,tone,created_at,read')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((n) => ({
    id: n.id,
    userId: n.user_id,
    title: n.title,
    message: n.message,
    tone: n.tone,
    createdAt: n.created_at,
    read: n.read,
  }))
}

export async function getPaymentProofs(userId: string): Promise<PaymentProof[]> {
  const supabase = assertSupabase()
  const { data, error } = await supabase
    .from('payment_proofs')
    .select('id,user_id,method,amount_usd,tx_hash,storage_path,status,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((p) => ({
    id: p.id,
    userId: p.user_id,
    method: p.method,
    amountUsd: p.amount_usd,
    txHash: p.tx_hash,
    storagePath: p.storage_path,
    status: p.status,
    createdAt: p.created_at,
  }))
}

export async function getWithdrawals(userId: string): Promise<Withdrawal[]> {
  const supabase = assertSupabase()
  const { data, error } = await supabase
    .from('withdrawals')
    .select('id,user_id,amount_usd,destination,status,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((w) => ({
    id: w.id,
    userId: w.user_id,
    amountUsd: Number(w.amount_usd ?? 0),
    destination: w.destination,
    status: w.status,
    createdAt: w.created_at,
  }))
}

export async function createWithdrawalRequest(args: {
  userId: string
  amountUsd: number
  destination: string
  kycApproved: boolean
}): Promise<Withdrawal> {
  if (!args.kycApproved) {
    throw new Error('KYC must be approved before requesting a withdrawal.')
  }
  const amt = Number(args.amountUsd)
  if (!Number.isFinite(amt) || amt <= 0) {
    throw new Error('Enter a valid withdrawal amount.')
  }
  const dest = args.destination.trim()
  if (!dest) {
    throw new Error('Add destination details for your payout.')
  }
  const balance = await getBalanceUsd(args.userId)
  if (balance < amt) {
    throw new Error('Insufficient balance for this withdrawal.')
  }

  const supabase = assertSupabase()
  const { data, error } = await supabase
    .from('withdrawals')
    .insert({
      user_id: args.userId,
      amount_usd: amt,
      destination: dest,
      status: 'pending',
    })
    .select('id,user_id,amount_usd,destination,status,created_at')
    .single()
  if (error) throw error
  return {
    id: data.id,
    userId: data.user_id,
    amountUsd: Number(data.amount_usd ?? 0),
    destination: data.destination,
    status: data.status,
    createdAt: data.created_at,
  }
}

export type AdminPendingWithdrawal = Withdrawal & {
  userEmail: string
  userFullName: string | null
}

export async function adminListPendingWithdrawals(): Promise<AdminPendingWithdrawal[]> {
  const supabase = assertSupabase()
  const { data, error } = await supabase
    .from('withdrawals')
    .select('id,user_id,amount_usd,destination,status,created_at,users(email,full_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    amountUsd: Number(row.amount_usd ?? 0),
    destination: row.destination,
    status: row.status,
    createdAt: row.created_at,
    userEmail: getNestedString(row.users as unknown, 'email') ?? '',
    userFullName: getNestedString(row.users as unknown, 'full_name'),
  }))
}

export async function adminApproveWithdrawal(args: { withdrawalId: string }): Promise<void> {
  const supabase = assertSupabase()
  const { data: w, error: wErr } = await supabase
    .from('withdrawals')
    .select('id,user_id,amount_usd,status')
    .eq('id', args.withdrawalId)
    .single()
  if (wErr) throw wErr
  if (w.status !== 'pending') throw new Error('Withdrawal is no longer pending.')

  const amt = Number(w.amount_usd ?? 0)
  if (amt <= 0) throw new Error('Invalid withdrawal amount.')

  const { data: u, error: uErr } = await supabase.from('users').select('balance_usd').eq('id', w.user_id).single()
  if (uErr) throw uErr
  const bal = Number(u.balance_usd ?? 0)
  if (bal < amt) throw new Error('User has insufficient balance.')

  const newBal = Math.round((bal - amt) * 100) / 100
  const { data: balRow, error: bErr } = await supabase
    .from('users')
    .update({ balance_usd: newBal })
    .eq('id', w.user_id)
    .eq('balance_usd', bal)
    .select('id')
    .maybeSingle()
  if (bErr) throw bErr
  if (!balRow) throw new Error('Balance changed; please retry approval.')

  const { data: wDone, error: wuErr } = await supabase
    .from('withdrawals')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', args.withdrawalId)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()
  if (wuErr) {
    await supabase.from('users').update({ balance_usd: bal }).eq('id', w.user_id)
    throw wuErr
  }
  if (!wDone) {
    await supabase.from('users').update({ balance_usd: bal }).eq('id', w.user_id)
    throw new Error('Withdrawal could not be approved (it may have been processed already).')
  }

  const { error: txErr } = await supabase.from('transactions').insert({
    user_id: w.user_id,
    type: 'withdrawal',
    amount_usd: amt,
    status: 'confirmed',
    reference: w.id,
  })
  if (txErr) throw txErr
}

export async function adminRejectWithdrawal(args: { withdrawalId: string }): Promise<void> {
  const supabase = assertSupabase()
  const { data, error } = await supabase
    .from('withdrawals')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', args.withdrawalId)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error('Withdrawal is no longer pending (it may have been processed already).')
}

export async function cancelPendingInvestment(args: { investmentId: string }): Promise<void> {
  const supabase = assertSupabase()
  const { error } = await supabase.rpc('cancel_pending_investment', {
    p_investment_id: args.investmentId,
  })
  if (error) throw error
}

export async function createInvestmentRequest(args: {
  userId: string
  plan: InvestmentPlan
  amountUsd: number
}): Promise<Investment> {
  const supabase = assertSupabase()
  const projectedReturnUsd = Math.round(args.amountUsd * (1 + args.plan.estimatedRoiPercent / 100))
  const result = await withTimeout(
    supabase
      .from('investments')
      .insert({
        user_id: args.userId,
        plan_id: args.plan.id,
        plan_name: args.plan.name,
        amount_usd: args.amountUsd,
        status: 'pending',
        projected_return_usd: projectedReturnUsd,
      })
      .select(
        'id,user_id,plan_id,plan_name,amount_usd,status,projected_return_usd,created_at,started_at,ends_at',
      )
      .single(),
    10_000,
    'Request timed out. Please check your connection and try again.',
  )
  const { data, error } = result
  if (error) throw error
  return {
    id: data.id,
    userId: data.user_id,
    planId: data.plan_id,
    planName: data.plan_name,
    amountUsd: data.amount_usd,
    status: data.status,
    projectedReturnUsd: data.projected_return_usd,
    createdAt: data.created_at,
    startedAt: data.started_at,
    endsAt: data.ends_at,
  }
}

export async function createPaymentProof(args: {
  userId: string
  method: PaymentProof['method']
  amountUsd: number
  txHash?: string
  storagePath?: string
}): Promise<PaymentProof> {
  const supabase = assertSupabase()
  const { data, error } = await supabase
    .from('payment_proofs')
    .insert({
      user_id: args.userId,
      method: args.method,
      amount_usd: args.amountUsd,
      tx_hash: args.txHash ?? null,
      storage_path: args.storagePath ?? null,
      status: 'pending',
    })
    .select('id,user_id,method,amount_usd,tx_hash,storage_path,status,created_at')
    .single()
  if (error) throw error
  return {
    id: data.id,
    userId: data.user_id,
    method: data.method,
    amountUsd: data.amount_usd,
    txHash: data.tx_hash,
    storagePath: data.storage_path,
    status: data.status,
    createdAt: data.created_at,
  }
}

export async function createKycDocument(args: {
  userId: string
  documentType: KycDocument['documentType']
  storagePath: string
}): Promise<KycDocument> {
  const supabase = assertSupabase()
  const { data, error } = await supabase
    .from('kyc_documents')
    .insert({
      user_id: args.userId,
      document_type: args.documentType,
      storage_path: args.storagePath,
      status: 'pending',
    })
    .select('id,user_id,document_type,storage_path,status,created_at')
    .single()
  if (error) throw error
  return {
    id: data.id,
    userId: data.user_id,
    documentType: data.document_type,
    storagePath: data.storage_path,
    status: data.status,
    createdAt: data.created_at,
  }
}

export async function markOwnKycPending(args: { userId: string }): Promise<void> {
  const supabase = assertSupabase()
  const { error } = await supabase.from('users').update({ kyc_status: 'pending' }).eq('id', args.userId)
  if (error) throw error
}

export async function adminListUsers(): Promise<
  Array<{ id: string; email: string; fullName: string | null; role: string; balanceUsd: number; kycStatus: string }>
> {
  const supabase = assertSupabase()
  const { data, error } = await supabase
    .from('users')
    .select('id,email,full_name,role,balance_usd,kyc_status')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    fullName: u.full_name ?? null,
    role: u.role,
    balanceUsd: u.balance_usd ?? 0,
    kycStatus: u.kyc_status ?? 'not_submitted',
  }))
}

export async function adminAdjustUserBalance(args: { userId: string; newBalanceUsd: number }): Promise<void> {
  const supabase = assertSupabase()
  const { error } = await supabase.from('users').update({ balance_usd: args.newBalanceUsd }).eq('id', args.userId)
  if (error) throw error
}

export type AdminPendingInvestment = {
  id: string
  userId: string
  userEmail: string
  userFullName: string | null
  planName: string
  amountUsd: number
  durationDays: number | null
  createdAt: string
}

export async function adminListPendingInvestments(): Promise<AdminPendingInvestment[]> {
  const supabase = assertSupabase()
  const { data, error } = await supabase
    .from('investments')
    .select(
      'id,user_id,plan_name,amount_usd,created_at,investment_plans(duration_days),users(email,full_name)',
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    userEmail: getNestedString(row.users as unknown, 'email') ?? '',
    userFullName: getNestedString(row.users as unknown, 'full_name'),
    planName: row.plan_name,
    amountUsd: Number(row.amount_usd ?? 0),
    durationDays: getNestedNumber(row.investment_plans as unknown, 'duration_days'),
    createdAt: row.created_at,
  }))
}

export async function adminApproveInvestment(args: { investmentId: string }): Promise<void> {
  const supabase = assertSupabase()
  const { data: inv, error: invErr } = await supabase
    .from('investments')
    .select('id,user_id,plan_id,amount_usd,investment_plans(duration_days)')
    .eq('id', args.investmentId)
    .eq('status', 'pending')
    .single()
  if (invErr) throw invErr

  const durationDays = getNestedNumber(inv.investment_plans as unknown, 'duration_days')
  const startedAt = new Date()
  const endsAt =
    typeof durationDays === 'number' && Number.isFinite(durationDays)
      ? new Date(startedAt.getTime() + durationDays * 24 * 60 * 60 * 1000)
      : null

  const { data: updated, error: updateErr } = await supabase
    .from('investments')
    .update({
      status: 'active',
      started_at: startedAt.toISOString(),
      ends_at: endsAt ? endsAt.toISOString() : null,
    })
    .eq('id', args.investmentId)
    .eq('status', 'pending')
    .select('id')
    .single()
  if (updateErr) throw updateErr
  if (!updated) throw new Error('Investment is no longer pending (it may have been cancelled).')

  const { error: txErr } = await supabase.from('transactions').insert({
    user_id: inv.user_id,
    type: 'investment',
    amount_usd: inv.amount_usd,
    status: 'confirmed',
    reference: inv.id,
  })
  if (txErr) throw txErr
}

export async function adminRejectInvestment(args: { investmentId: string }): Promise<void> {
  const supabase = assertSupabase()
  const { data, error } = await supabase
    .from('investments')
    .update({ status: 'rejected' })
    .eq('id', args.investmentId)
    .eq('status', 'pending')
    .select('id')
    .single()
  if (error) throw error
  if (!data) throw new Error('Investment is no longer pending (it may have been cancelled).')
}

export type AdminPaymentProofItem = PaymentProof & {
  userEmail: string
  userFullName: string | null
}

export async function adminListPaymentProofs(args?: {
  status?: PaymentProof['status']
}): Promise<AdminPaymentProofItem[]> {
  const supabase = assertSupabase()
  let q = supabase
    .from('payment_proofs')
    .select('id,user_id,method,amount_usd,tx_hash,storage_path,status,created_at,users(email,full_name)')
    .order('created_at', { ascending: false })
    .limit(200)
  if (args?.status) q = q.eq('status', args.status)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map((p) => ({
    id: p.id,
    userId: p.user_id,
    method: p.method,
    amountUsd: Number(p.amount_usd ?? 0),
    txHash: p.tx_hash,
    storagePath: p.storage_path,
    status: p.status,
    createdAt: p.created_at,
    userEmail: getNestedString(p.users as unknown, 'email') ?? '',
    userFullName: getNestedString(p.users as unknown, 'full_name'),
  }))
}

export async function adminApprovePaymentProof(args: { proofId: string }): Promise<void> {
  const supabase = assertSupabase()

  const { data: proof, error: proofErr } = await supabase
    .from('payment_proofs')
    .update({ status: 'approved' })
    .eq('id', args.proofId)
    .select('id,user_id,amount_usd,method,tx_hash')
    .single()
  if (proofErr) throw proofErr

  const { data: userRow, error: balErr } = await supabase
    .from('users')
    .select('balance_usd')
    .eq('id', proof.user_id)
    .maybeSingle()
  if (balErr) throw balErr

  const nextBalance = Number(userRow?.balance_usd ?? 0) + Number(proof.amount_usd ?? 0)
  const { error: updErr } = await supabase.from('users').update({ balance_usd: nextBalance }).eq('id', proof.user_id)
  if (updErr) throw updErr

  const { error: txErr } = await supabase.from('transactions').insert({
    user_id: proof.user_id,
    type: 'deposit',
    amount_usd: proof.amount_usd,
    status: 'confirmed',
    reference: proof.tx_hash ?? proof.id,
  })
  if (txErr) throw txErr
}

export async function adminRejectPaymentProof(args: { proofId: string }): Promise<void> {
  const supabase = assertSupabase()
  const { error } = await supabase.from('payment_proofs').update({ status: 'rejected' }).eq('id', args.proofId)
  if (error) throw error
}

export type AdminPendingKycItem = KycDocument & {
  userEmail: string
  userFullName: string | null
}

export async function adminListPendingKycDocuments(): Promise<AdminPendingKycItem[]> {
  const supabase = assertSupabase()
  const { data, error } = await supabase
    .from('kyc_documents')
    .select('id,user_id,document_type,storage_path,status,created_at,users(email,full_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(300)
  if (error) throw error
  return (data ?? []).map((d) => ({
    id: d.id,
    userId: d.user_id,
    documentType: d.document_type,
    storagePath: d.storage_path,
    status: d.status,
    createdAt: d.created_at,
    userEmail: getNestedString(d.users as unknown, 'email') ?? '',
    userFullName: getNestedString(d.users as unknown, 'full_name'),
  }))
}

export async function adminSetUserKycStatus(args: { userId: string; status: 'approved' | 'rejected' }): Promise<void> {
  const supabase = assertSupabase()
  const { error: uErr } = await supabase.from('users').update({ kyc_status: args.status }).eq('id', args.userId)
  if (uErr) throw uErr
  const { error: dErr } = await supabase
    .from('kyc_documents')
    .update({ status: args.status })
    .eq('user_id', args.userId)
    .eq('status', 'pending')
  if (dErr) throw dErr
}

export type AdminInvestmentPlan = InvestmentPlan & { active: boolean }

export async function adminListInvestmentPlans(): Promise<AdminInvestmentPlan[]> {
  const supabase = assertSupabase()
  const { data, error } = await supabase
    .from('investment_plans')
    .select('id,name,min_investment_usd,duration_days,estimated_roi_percent,summary,highlights,active')
    .order('min_investment_usd', { ascending: true })
  if (error) throw error
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    minInvestmentUsd: p.min_investment_usd,
    durationDays: p.duration_days,
    estimatedRoiPercent: p.estimated_roi_percent,
    summary: p.summary,
    highlights: p.highlights ?? [],
    active: p.active ?? true,
  }))
}

export async function adminUpsertInvestmentPlan(args: {
  id?: string
  name: string
  minInvestmentUsd: number
  durationDays: number
  estimatedRoiPercent: number
  summary: string
  highlights: string[]
  active: boolean
}): Promise<AdminInvestmentPlan> {
  const supabase = assertSupabase()
  const { data, error } = await supabase
    .from('investment_plans')
    .upsert(
      {
        id: args.id ?? undefined,
        name: args.name,
        min_investment_usd: args.minInvestmentUsd,
        duration_days: args.durationDays,
        estimated_roi_percent: args.estimatedRoiPercent,
        summary: args.summary,
        highlights: args.highlights,
        active: args.active,
      },
      { onConflict: 'id' },
    )
    .select('id,name,min_investment_usd,duration_days,estimated_roi_percent,summary,highlights,active')
    .single()
  if (error) throw error
  return {
    id: data.id,
    name: data.name,
    minInvestmentUsd: data.min_investment_usd,
    durationDays: data.duration_days,
    estimatedRoiPercent: data.estimated_roi_percent,
    summary: data.summary,
    highlights: data.highlights ?? [],
    active: data.active ?? true,
  }
}

export async function adminSetInvestmentPlanActive(args: { planId: string; active: boolean }): Promise<void> {
  const supabase = assertSupabase()
  const { error } = await supabase.from('investment_plans').update({ active: args.active }).eq('id', args.planId)
  if (error) throw error
}

export async function adminSendAnnouncement(args: { title: string; message: string }): Promise<void> {
  const supabase = assertSupabase()
  const { error } = await supabase.from('announcements').insert({ title: args.title, message: args.message })
  if (error) throw error
}

export async function updateUserProfile(args: { userId: string; fullName: string }): Promise<void> {
  const supabase = assertSupabase()
  const { error } = await supabase.from('users').update({ full_name: args.fullName }).eq('id', args.userId)
  if (error) throw error
}

export function getUserDisplayName(user: AppUser | null) {
  if (!user) return ''
  return user.fullName?.trim() ? user.fullName.trim() : user.email
}
