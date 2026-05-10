-- Aurum Investment (Supabase) — database schema

create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('user', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.kyc_status as enum ('not_submitted', 'pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.investment_status as enum ('pending', 'active', 'completed', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.deposit_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.withdrawal_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_method as enum ('card', 'bank_transfer', 'btc', 'usdt');
exception when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'user',
  balance_usd numeric not null default 0,
  kyc_status public.kyc_status not null default 'not_submitted',
  referral_code text unique,
  referred_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.investment_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  min_investment_usd numeric not null,
  duration_days int not null,
  estimated_roi_percent numeric not null,
  summary text not null,
  highlights text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_id uuid not null references public.investment_plans(id),
  plan_name text not null,
  amount_usd numeric not null,
  projected_return_usd numeric not null,
  status public.investment_status not null default 'pending',
  started_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('deposit','investment','withdrawal','profit','adjustment')),
  amount_usd numeric not null,
  status text not null check (status in ('pending','confirmed','rejected')),
  reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  method public.payment_method not null,
  amount_usd numeric not null,
  status public.deposit_status not null default 'pending',
  reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount_usd numeric not null,
  destination text not null,
  status public.withdrawal_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  message text not null,
  tone text not null check (tone in ('neutral','success','warning','danger')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  document_type text not null check (document_type in ('government_id','proof_of_address','selfie')),
  storage_path text not null,
  status public.deposit_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  method public.payment_method not null,
  amount_usd numeric not null,
  tx_hash text,
  storage_path text,
  status public.deposit_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  created_at timestamptz not null default now()
);

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
  support_card_title text not null default '',
  support_card_subtitle text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.investments enable row level security;
alter table public.transactions enable row level security;
alter table public.deposits enable row level security;
alter table public.withdrawals enable row level security;
alter table public.notifications enable row level security;
alter table public.kyc_documents enable row level security;
alter table public.payment_proofs enable row level security;
alter table public.investment_plans enable row level security;
alter table public.announcements enable row level security;
alter table public.payment_display_settings enable row level security;

create policy "users can insert own profile"
on public.users for insert
with check (auth.uid() = id);

create policy "users can read own profile"
on public.users for select
using (auth.uid() = id);

create policy "users can update own profile"
on public.users for update
using (auth.uid() = id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', null)
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.users.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'::public.user_role
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to service_role;

create policy "plans are readable"
on public.investment_plans for select
using (true);

create policy "users can read own investments"
on public.investments for select
using (auth.uid() = user_id);

create policy "users can insert own investments"
on public.investments for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.kyc_status = 'approved'
  )
);

create policy "users can read own transactions"
on public.transactions for select
using (auth.uid() = user_id);

create policy "users can read own withdrawals"
on public.withdrawals for select
using (auth.uid() = user_id);

create policy "users can insert own withdrawals"
on public.withdrawals for insert
with check (auth.uid() = user_id);

create policy "users can read own notifications"
on public.notifications for select
using (auth.uid() = user_id);

create policy "users can read own kyc documents"
on public.kyc_documents for select
using (auth.uid() = user_id);

create policy "users can insert own kyc documents"
on public.kyc_documents for insert
with check (auth.uid() = user_id);

create policy "users can read own payment proofs"
on public.payment_proofs for select
using (auth.uid() = user_id);

create policy "users can insert own payment proofs"
on public.payment_proofs for insert
with check (auth.uid() = user_id);

create policy "announcements readable"
on public.announcements for select
using (true);

create policy "admins can read users"
on public.users for select
using (public.is_admin());

create policy "admins can update users"
on public.users for update
using (public.is_admin())
with check (public.is_admin());

create policy "admins can read investments"
on public.investments for select
using (public.is_admin());

create policy "admins can update investments"
on public.investments for update
using (public.is_admin())
with check (public.is_admin());

create policy "admins can read transactions"
on public.transactions for select
using (public.is_admin());

create policy "admins can insert transactions"
on public.transactions for insert
with check (public.is_admin());

create policy "admins can read deposits"
on public.deposits for select
using (public.is_admin());

create policy "admins can update deposits"
on public.deposits for update
using (public.is_admin())
with check (public.is_admin());

create policy "admins can read withdrawals"
on public.withdrawals for select
using (public.is_admin());

create policy "admins can update withdrawals"
on public.withdrawals for update
using (public.is_admin())
with check (public.is_admin());

create policy "admins can read notifications"
on public.notifications for select
using (public.is_admin());

create policy "admins can insert notifications"
on public.notifications for insert
with check (public.is_admin());

create policy "admins can read kyc documents"
on public.kyc_documents for select
using (public.is_admin());

create policy "admins can update kyc documents"
on public.kyc_documents for update
using (public.is_admin())
with check (public.is_admin());

create policy "admins can read payment proofs"
on public.payment_proofs for select
using (public.is_admin());

create policy "admins can update payment proofs"
on public.payment_proofs for update
using (public.is_admin())
with check (public.is_admin());

create policy "admins can insert plans"
on public.investment_plans for insert
with check (public.is_admin());

create policy "admins can update plans"
on public.investment_plans for update
using (public.is_admin())
with check (public.is_admin());

create policy "admins can insert announcements"
on public.announcements for insert
with check (public.is_admin());

create policy "payment_display_settings read authenticated"
on public.payment_display_settings for select
to authenticated
using (true);

create policy "payment_display_settings admin upsert"
on public.payment_display_settings for insert
to authenticated
with check (public.is_admin());

create policy "payment_display_settings admin update"
on public.payment_display_settings for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.payment_display_settings (id)
values (1)
on conflict (id) do nothing;

-- Investor can cancel own pending investment (RPC; see cancel_pending_investment.sql for standalone migration).
do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on e.enumtypid = t.oid
    join pg_namespace n on t.typnamespace = n.oid
    where n.nspname = 'public'
      and t.typname = 'investment_status'
      and e.enumlabel = 'cancelled'
  ) then
    alter type public.investment_status add value 'cancelled';
  end if;
end $$;

create or replace function public.cancel_pending_investment(p_investment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  update public.investments
  set
    status = 'cancelled'::public.investment_status,
    updated_at = now()
  where id = p_investment_id
    and user_id = auth.uid()
    and status = 'pending'::public.investment_status;

  get diagnostics n = row_count;
  if n = 0 then
    raise exception 'Investment not found or cannot be cancelled' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function public.cancel_pending_investment(uuid) from public;
grant execute on function public.cancel_pending_investment(uuid) to authenticated;

-- Admin deletes investor: removes auth.users row; public.users + related rows CASCADE (see admin_delete_user.sql).
create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_role public.user_role;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;
  if target_user_id = auth.uid() then
    raise exception 'You cannot delete your own account';
  end if;
  select u.role into target_role from public.users u where u.id = target_user_id;
  if target_role is null then
    raise exception 'User not found';
  end if;
  if target_role = 'admin'::public.user_role then
    raise exception 'Admin accounts cannot be deleted from this screen';
  end if;
  delete from auth.users where id = target_user_id;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_delete_user(uuid) to authenticated;
