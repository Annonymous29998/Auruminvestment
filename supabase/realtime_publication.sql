-- Live UI updates (no manual refresh) use Supabase Realtime + React Query invalidation.
-- Adds public tables to the `supabase_realtime` publication if they are not already members.
-- Safe to run multiple times (42710 / duplicate_object is ignored).

do $body$
begin
  begin
    alter publication supabase_realtime add table public.users;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.investments;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.payment_proofs;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.transactions;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.notifications;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.kyc_documents;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.payment_display_settings;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.investment_plans;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.withdrawals;
  exception
    when duplicate_object then null;
  end;
end $body$;
