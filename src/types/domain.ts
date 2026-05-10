export type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected'
export type InvestmentStatus = 'pending' | 'active' | 'completed' | 'rejected' | 'cancelled'
export type DepositStatus = 'pending' | 'approved' | 'rejected'
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected'
export type PaymentMethod = 'card' | 'bank_transfer' | 'btc' | 'usdt'

export type InvestmentPlan = {
  id: string
  name: string
  minInvestmentUsd: number
  durationDays: number
  estimatedRoiPercent: number
  summary: string
  highlights: string[]
}

export type Investment = {
  id: string
  userId: string
  planId: string
  planName: InvestmentPlan['name']
  amountUsd: number
  status: InvestmentStatus
  projectedReturnUsd: number
  createdAt: string
  startedAt?: string | null
  endsAt?: string | null
}

export type Transaction = {
  id: string
  userId: string
  type: 'deposit' | 'investment' | 'withdrawal' | 'profit' | 'adjustment'
  amountUsd: number
  status: 'pending' | 'confirmed' | 'rejected'
  reference?: string | null
  createdAt: string
}

export type NotificationItem = {
  id: string
  userId: string
  title: string
  message: string
  tone: 'neutral' | 'success' | 'warning' | 'danger'
  createdAt: string
  read: boolean
}

export type PaymentProof = {
  id: string
  userId: string
  method: PaymentMethod
  amountUsd: number
  txHash?: string | null
  storagePath?: string | null
  status: DepositStatus
  createdAt: string
}

export type KycDocument = {
  id: string
  userId: string
  documentType: 'government_id' | 'proof_of_address' | 'selfie'
  storagePath: string
  status: DepositStatus
  createdAt: string
}

export type Withdrawal = {
  id: string
  userId: string
  amountUsd: number
  destination: string
  status: WithdrawalStatus
  createdAt: string
}
