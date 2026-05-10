-- =============================================================================
-- FIX: Admin dashboard lists public.users — new Auth users need a row here.
-- If the admin Users page only shows yourself, run fix_admin_users_rls.sql first.
-- Run the whole script once in Supabase → SQL → New query → Run.
-- =============================================================================

-- 1) Auto-create public.users whenever someone is added to auth.users
--    (Dashboard "Add user", sign-up, invite, etc.)
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
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.users.full_name, excluded.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

-- 2) Backfill anyone who already exists in Auth but never got a profile row
insert into public.users (id, email, full_name)
select
  u.id,
  coalesce(u.email, ''),
  nullif(trim(coalesce(u.raw_user_meta_data->>'full_name', '')), '')
from auth.users u
where not exists (select 1 from public.users p where p.id = u.id)
on conflict (id) do update
set
  email = excluded.email,
  full_name = coalesce(public.users.full_name, excluded.full_name);
