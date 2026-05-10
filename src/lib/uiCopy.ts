/**
 * Owner- and investor-facing strings. Avoid vendor names, env var names,
 * and implementation details in UI and thrown errors meant for users.
 */

export const uiCopy = {
  emptyStateBackendTitle: 'Service unavailable',
  emptyStateBackendDescription:
    'This deployment is not linked to its data service yet. Ask your administrator to finish setup, then refresh.',
  toastBackendTitle: 'Not fully configured',
  toastBackendMessage:
    'The app cannot reach its data service. Your administrator needs to finish deployment configuration.',
  genericError: 'Something went wrong. Please try again. If it keeps happening, contact support.',
  loadMetricsFailed: 'We could not load this information. Refresh the page, or ask your administrator to check access settings.',
} as const

/** Thrown when API calls run without URL + anon key configured. */
export const ERR_BACKEND_NOT_CONFIGURED =
  'The app is not connected to its data service yet. Ask your administrator to finish deployment setup.'

const TECH =
  /supabase|vite_|postgres|pgrst|rpc\b|row-level security|violates foreign key|violates check|permission denied|jwt expired|invalid jwt|fetch failed|network\s*error|failed to fetch|unique constraint|duplicate key|42p01|42703|information_schema|relation ["']|storage\.object|bucket not found|invalid api key/i

function rawMessage(err: unknown): string {
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  return String(err)
}

/** Maps API / network errors to safe text for toasts and inline messages. */
export function userFacingErrorMessage(err: unknown): string {
  const t = rawMessage(err).trim()
  if (!t) return uiCopy.genericError
  if (t === ERR_BACKEND_NOT_CONFIGURED) return t
  if (t.length > 220) return uiCopy.genericError
  if (TECH.test(t)) return uiCopy.genericError
  return t
}
