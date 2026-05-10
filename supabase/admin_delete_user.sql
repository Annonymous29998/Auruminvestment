-- Allow admins to remove a non-admin user from Auth + public profile (CASCADE).
-- Run in Supabase SQL editor (once). Requires function owner with rights on auth.users (default when run as postgres).

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

  select u.role
  into target_role
  from public.users u
  where u.id = target_user_id;

  if target_role is null then
    raise exception 'User not found';
  end if;

  if target_role = 'admin'::public.user_role then
    raise exception 'Admin accounts cannot be deleted from this screen';
  end if;

  delete from auth.users
  where id = target_user_id;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_delete_user(uuid) to authenticated;
