-- Allow investors to cancel their own investment request before it is activated.
-- Run once in Supabase SQL (after public.investment_status exists).

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
