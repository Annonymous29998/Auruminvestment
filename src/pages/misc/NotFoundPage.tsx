import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="min-h-dvh">
      <div className="aurum-container py-20">
        <div className="mx-auto max-w-xl rounded-3xl aurum-glass ring-1 ring-white/10">
          <div className="p-8 text-center">
            <div className="font-display text-3xl font-semibold text-white/90">404</div>
            <div className="mt-2 text-sm text-white/65">The page you requested could not be found.</div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Back to Home
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="primary" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

