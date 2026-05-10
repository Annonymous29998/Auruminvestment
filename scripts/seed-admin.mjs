/**
 * Recreates the admin Auth user + public.users row (service role).
 * Reads ../.env (no VITE_* for service_role — keep secrets server-side only).
 *
 * Run: npm run seed:admin
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Prefer cwd (npm run) — import.meta.url can point at a temp copy on some setups.
const envPath = [path.join(process.cwd(), '.env'), path.join(__dirname, '..', '.env')].find((p) =>
  fs.existsSync(p),
)
if (envPath) {
  const raw = fs.readFileSync(envPath, 'utf8').replace(/^\uFEFF/, '')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
}

const url = (process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL)?.trim()
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const email = (process.env.ADMIN_EMAIL ?? 'admin@aurum.com').trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD

if (!url || !serviceKey) {
  console.error('Missing Supabase URL or service role key.')
  console.error('  .env path:', envPath ?? '(not found)')
  console.error('  VITE_SUPABASE_URL set:', Boolean(url))
  console.error('  SUPABASE_SERVICE_ROLE_KEY set:', Boolean(serviceKey))
  if (process.env.SUPABASE_SERVICE_ROLE_KEY !== undefined && !serviceKey) {
    console.error(
      '  SUPABASE_SERVICE_ROLE_KEY is empty: paste the full service_role JWT on the SAME line (no newline after =).',
    )
  }
  process.exit(1)
}
if (!password) {
  console.error('Missing ADMIN_PASSWORD in .env')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (listErr) throw listErr

  const existing = list.users.find((u) => (u.email ?? '').toLowerCase() === email)
  if (existing) {
    const { error: delErr } = await admin.auth.admin.deleteUser(existing.id)
    if (delErr) throw delErr
    console.log('Removed existing Auth user:', email)
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Administrator' },
  })
  if (createErr) throw createErr
  const id = created.user.id

  const { error: upErr } = await admin.from('users').upsert(
    {
      id,
      email,
      full_name: 'Administrator',
      role: 'admin',
      kyc_status: 'approved',
    },
    { onConflict: 'id' },
  )
  if (upErr) throw upErr

  console.log('Admin ready:', email, '— sign in at /admin/login')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
