import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { env, isSupabaseConfigured } from '@/lib/env'

let client: SupabaseClient | null = null

function getProjectRef(url: string) {
  try {
    const host = new URL(url).host
    return host.split('.')[0] ?? 'project'
  } catch {
    return 'project'
  }
}

/** Copy auth bundle from pre-unification admin-only storage so refresh keeps working. */
function migrateLegacyAdminSession(ref: string) {
  if (typeof window === 'undefined') return
  try {
    const canonical = `sb-${ref}-app`
    const legacyAdmin = `sb-${ref}-admin`
    if (window.localStorage.getItem(canonical)) return
    const payload = window.localStorage.getItem(legacyAdmin)
    if (payload) window.localStorage.setItem(canonical, payload)
  } catch {
    // private mode / quota
  }
}

/**
 * Single Supabase client for the whole SPA.
 *
 * Previously we used two clients (`/app` vs `/admin`) with different auth
 * `storageKey`s. A login from `/auth/login` only persisted on the app key, so
 * on `/admin` routes `getSession()` read the admin key, saw no session, and
 * redirects sent users to login after refresh. One client + one storage key
 * fixes that.
 *
 * Key stays `sb-<ref>-app` so existing sessions from the user app login still work.
 */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  if (!client) {
    const ref = getProjectRef(env.supabaseUrl!)
    migrateLegacyAdminSession(ref)
    client = createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Boolean `true` treats any `#access_token=…` as an OAuth callback. That can skip
        // recovering the session from localStorage on normal pages (e.g. /app) if the hash
        // ever looks auth-like. Only treat known auth routes as URL-based sessions.
        detectSessionInUrl: (url, params) => {
          if (params.access_token || params.error_description) {
            const p = url.pathname
            return p === '/' || p.startsWith('/auth/') || p.startsWith('/app') || p.startsWith('/admin')
          }
          return false
        },
        storageKey: `sb-${ref}-app`,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  }
  return client
}
