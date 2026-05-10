-- =============================================================================
-- Fix admin not seeing all rows in public.users (and other admin reads).
-- Self-referential EXISTS(...) on public.users under RLS often only allows
-- "own row" checks. Use SECURITY DEFINER is_admin() instead.
-- Run once in Supabase → SQL.
-- =============================================================================

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

-- users
drop policy if exists "admins can read users" on public.users;
drop policy if exists "admins can update users" on public.users;
create policy "admins can read users"
  on public.users for select
  using (public.is_admin());
create policy "admins can update users"
  on public.users for update
  using (public.is_admin())
  with check (public.is_admin());

-- investments
drop policy if exists "admins can read investments" on public.investments;
drop policy if exists "admins can update investments" on public.investments;
create policy "admins can read investments"
  on public.investments for select
  using (public.is_admin());
create policy "admins can update investments"
  on public.investments for update
  using (public.is_admin())
  with check (public.is_admin());

-- transactions
drop policy if exists "admins can read transactions" on public.transactions;
drop policy if exists "admins can insert transactions" on public.transactions;
create policy "admins can read transactions"
  on public.transactions for select
  using (public.is_admin());
create policy "admins can insert transactions"
  on public.transactions for insert
  with check (public.is_admin());

-- deposits
drop policy if exists "admins can read deposits" on public.deposits;
drop policy if exists "admins can update deposits" on public.deposits;
create policy "admins can read deposits"
  on public.deposits for select
  using (public.is_admin());
create policy "admins can update deposits"
  on public.deposits for update
  using (public.is_admin())
  with check (public.is_admin());

-- withdrawals
drop policy if exists "admins can read withdrawals" on public.withdrawals;
drop policy if exists "admins can update withdrawals" on public.withdrawals;
create policy "admins can read withdrawals"
  on public.withdrawals for select
  using (public.is_admin());
create policy "admins can update withdrawals"
  on public.withdrawals for update
  using (public.is_admin())
  with check (public.is_admin());

-- notifications
drop policy if exists "admins can read notifications" on public.notifications;
drop policy if exists "admins can insert notifications" on public.notifications;
create policy "admins can read notifications"
  on public.notifications for select
  using (public.is_admin());
create policy "admins can insert notifications"
  on public.notifications for insert
  with check (public.is_admin());

-- kyc_documents
drop policy if exists "admins can read kyc documents" on public.kyc_documents;
drop policy if exists "admins can update kyc documents" on public.kyc_documents;
create policy "admins can read kyc documents"
  on public.kyc_documents for select
  using (public.is_admin());
create policy "admins can update kyc documents"
  on public.kyc_documents for update
  using (public.is_admin())
  with check (public.is_admin());

-- payment_proofs
drop policy if exists "admins can read payment proofs" on public.payment_proofs;
drop policy if exists "admins can update payment proofs" on public.payment_proofs;
create policy "admins can read payment proofs"
  on public.payment_proofs for select
  using (public.is_admin());
create policy "admins can update payment proofs"
  on public.payment_proofs for update
  using (public.is_admin())
  with check (public.is_admin());

-- investment_plans
drop policy if exists "admins can insert plans" on public.investment_plans;
drop policy if exists "admins can update plans" on public.investment_plans;
create policy "admins can insert plans"
  on public.investment_plans for insert
  with check (public.is_admin());
create policy "admins can update plans"
  on public.investment_plans for update
  using (public.is_admin())
  with check (public.is_admin());

-- announcements
drop policy if exists "admins can insert announcements" on public.announcements;
create policy "admins can insert announcements"
  on public.announcements for insert
  with check (public.is_admin());
