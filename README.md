# Aurum Investment

Modern luxury gold investment platform UI built with React, Vite, TypeScript, Tailwind, Framer Motion, TanStack Query, Zustand, and Supabase (Auth/DB/Storage).

## Quick Start

```bash
npm install
npm run dev
```

## Supabase Setup

1. Create a Supabase project
2. Run the SQL schema in [schema.sql](supabase/schema.sql)
3. Create Storage buckets:
   - `payment-proofs`
   - `kyc-documents`
4. Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Manual Payment Flow (Important)

- Card payment / Bank transfer: users are shown a modal instructing them to contact admin support to complete payment
- Crypto: users copy BTC/USDT address and upload a proof or tx hash; admins verify manually

## Pages

- Landing + marketing: `/`, `/about`, `/how-it-works`, `/faq`, `/contact`
- Legal: `/terms`, `/privacy`, `/aml-kyc`, `/risk-disclosure`
- Auth: `/auth/*`
- Investor dashboard: `/app/*`
- Admin panel: `/admin/*`
