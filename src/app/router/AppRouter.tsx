import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { RequireAdmin, RequireAuth } from '@/features/auth/RouteGuards'
import { HomePage } from '@/pages/marketing/HomePage'
import { AboutPage } from '@/pages/marketing/AboutPage'
import { HowItWorksPage } from '@/pages/marketing/HowItWorksPage'
import { FaqPage } from '@/pages/marketing/FaqPage'
import { ContactPage } from '@/pages/marketing/ContactPage'
import { TermsPage } from '@/pages/legal/TermsPage'
import { PrivacyPage } from '@/pages/legal/PrivacyPage'
import { AmlKycPage } from '@/pages/legal/AmlKycPage'
import { RiskDisclosurePage } from '@/pages/legal/RiskDisclosurePage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage'
import { DashboardOverviewPage } from '@/pages/app/DashboardOverviewPage'
import { PlansPage } from '@/pages/app/PlansPage'
import { InvestmentsPage } from '@/pages/app/InvestmentsPage'
import { TransactionsPage } from '@/pages/app/TransactionsPage'
import { WithdrawalsPage } from '@/pages/app/WithdrawalsPage'
import { NotificationsPage } from '@/pages/app/NotificationsPage'
import { ProfilePage } from '@/pages/app/ProfilePage'
import { KycPage } from '@/pages/app/KycPage'
import { PaymentProofsPage } from '@/pages/app/PaymentProofsPage'
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminApprovalsPage } from '@/pages/admin/AdminApprovalsPage'
import { AdminProofsPage } from '@/pages/admin/AdminProofsPage'
import { AdminPlansPage } from '@/pages/admin/AdminPlansPage'
import { AdminBalancesPage } from '@/pages/admin/AdminBalancesPage'
import { AdminAnnouncementsPage } from '@/pages/admin/AdminAnnouncementsPage'
import { AdminWithdrawalsPage } from '@/pages/admin/AdminWithdrawalsPage'
import { AdminKycPage } from '@/pages/admin/AdminKycPage'
import { AdminPaymentSettingsPage } from '@/pages/admin/AdminPaymentSettingsPage'
import { NotFoundPage } from '@/pages/misc/NotFoundPage'

export function AppRouter() {
  const location = useLocation()

  return (
    <Routes location={location}>
      <Route element={<MarketingLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/aml-kyc" element={<AmlKycPage />} />
        <Route path="/risk-disclosure" element={<RiskDisclosurePage />} />
      </Route>

      <Route path="/auth" element={<AuthLayout />}>
        <Route index element={<Navigate to="/auth/login" replace />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
      </Route>

      <Route path="/admin/login" element={<AuthLayout />}>
        <Route index element={<LoginPage />} />
      </Route>

      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardOverviewPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="investments" element={<InvestmentsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="withdrawals" element={<WithdrawalsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="kyc" element={<KycPage />} />
        <Route path="payment-proofs" element={<PaymentProofsPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="approvals" element={<AdminApprovalsPage />} />
        <Route path="proofs" element={<AdminProofsPage />} />
        <Route path="plans" element={<AdminPlansPage />} />
        <Route path="balances" element={<AdminBalancesPage />} />
        <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
        <Route path="announcements" element={<AdminAnnouncementsPage />} />
        <Route path="payment-methods" element={<AdminPaymentSettingsPage />} />
        <Route path="kyc" element={<AdminKycPage />} />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
