import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function VerifyEmailPage() {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-semibold text-white/85">Verify your email</div>
        <div className="mt-1 text-sm text-white/65">
          Check your inbox for a verification link. After verification, sign in to access the dashboard.
        </div>
      </div>

      <Link to="/auth/login">
        <Button variant="primary" className="w-full">
          Go to Login
        </Button>
      </Link>
    </div>
  )
}
