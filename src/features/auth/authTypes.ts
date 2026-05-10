export type UserRole = 'user' | 'admin'

export type AppUser = {
  id: string
  email: string
  fullName?: string | null
  role: UserRole
  kycStatus?: 'not_submitted' | 'pending' | 'approved' | 'rejected'
}

