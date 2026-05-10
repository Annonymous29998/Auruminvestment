# Aurum Investment

Modern luxury gold investment platform UI built with React, Vite, TypeScript, Tailwind, Framer Motion, TanStack Query, Zustand, and Supabase (Auth/DB/Storage).

## Quick Start

```bash
npm install
npm run dev
```

## Supabase Setup

1. Create a Supabase project
2. Run the SQL schema in [schema.sql](supabase/schema.sql). If you already have the project DB, also run [support_card_columns.sql](supabase/support_card_columns.sql) once so the homepage support card title/subtitle columns exist.
3. To enable **admin user delete** from the dashboard, run [admin_delete_user.sql](supabase/admin_delete_user.sql) once in the SQL editor (creates RPC `admin_delete_user`).
4. Create Storage buckets:
   - `payment-proofs`
   - `kyc-documents`
5. Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Production domain (auruminvestment.online)

### Supabase → Authentication → URL Configuration

- **Site URL:** `https://auruminvestment.online`  
  (Use this as the default site URL after you connect the custom domain on Vercel.)

- **Additional Redirect URLs** — add each on its own line (wildcards allowed):

  - `https://auruminvestment.online/**`
  - `https://www.auruminvestment.online/**` (optional, if you ever point `www` at Vercel; `vercel.json` redirects `www` → apex)
  - `http://localhost:5173/**` (local Vite dev)
  - Optional — Vercel previews: `https://*.vercel.app/**`

Password reset uses `https://<your-origin>/auth/reset-password`, so the production origin must appear in the redirect allow list (the `/**` entries cover it).

### Vercel → Environment Variables

Set these for **Production** (and **Preview** if you want PR previews to talk to Supabase). Only `VITE_*` values are embedded in the client build.

| Name | Notes |
|------|--------|
| `VITE_SUPABASE_URL` | Project URL from Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `anon` `public` key (never the service role) |
| `VITE_ADMIN_EMAILS` | Comma-separated admin emails for `/admin/login` gate (optional) |
| `VITE_SUPPORT_EMAIL` | Shown in UI / contact flows |
| `VITE_SUPPORT_WHATSAPP` | Full `https://wa.me/...` link |
| `VITE_SUPPORT_TELEGRAM` | Full `https://t.me/...` link |
| `VITE_BANK_NAME` | Display |
| `VITE_BANK_ACCOUNT_NAME` | Display |
| `VITE_BANK_ACCOUNT_NUMBER` | Display |
| `VITE_BTC_ADDRESS` | Display |
| `VITE_USDT_ADDRESS` | Display |

**Do not** set `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, or `ADMIN_PASSWORD` on Vercel for this static app unless you add a **server-only** API — they are for local `npm run seed:admin` only and would be a security risk in the browser.

After connecting **auruminvestment.online** in Vercel → Domains, redeploy so the live URL matches what you configured in Supabase.

## Payment confirmation flow (important)

- Card payment / bank transfer: users see a modal with instructions to contact admin support to complete payment
- Crypto: users copy BTC/USDT address and upload a proof or tx hash; admins confirm deposits before crediting

## Pages

- Landing + marketing: `/`, `/about`, `/how-it-works`, `/faq`, `/contact`
- Legal: `/terms`, `/privacy`, `/aml-kyc`, `/risk-disclosure`
- Auth: `/auth/*`
- Investor dashboard: `/app/*`
- Admin panel: `/admin/*`
