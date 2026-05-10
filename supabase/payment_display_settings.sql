-- Payment instructions shown in the app (bank + crypto). Admins edit via Admin → Payment methods.
-- Run in Supabase SQL after public.is_admin() exists (e.g. after fix_admin_users_rls.sql).

create table if not exists public.payment_display_settings (
  id smallint primary key default 1 check (id = 1),
  bank_name text not null default '',
  bank_account_name text not null default '',
  bank_account_number text not null default '',
  support_email text not null default '',
  whatsapp_link text not null default '',
  telegram_link text not null default '',
  btc_address text not null default '',
  usdt_address text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.payment_display_settings enable row level security;

drop policy if exists "payment_display_settings read authenticated" on public.payment_display_settings;
create policy "payment_display_settings read authenticated"
  on public.payment_display_settings for select
  to authenticated
  using (true);

drop policy if exists "payment_display_settings admin upsert" on public.payment_display_settings;
create policy "payment_display_settings admin upsert"
  on public.payment_display_settings for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "payment_display_settings admin update" on public.payment_display_settings;
create policy "payment_display_settings admin update"
  on public.payment_display_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.payment_display_settings (id)
values (1)
on conflict (id) do nothing;
