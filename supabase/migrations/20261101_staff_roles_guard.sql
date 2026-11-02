-- Team access (JSB, 1 Nov 2026, #224): staff roles in profiles.role are founder, filer, support.
-- Guard: nobody can give themselves (or anyone) a staff role, or change a role, through the
-- public API. Only the server (service_role) or a database admin can. Safe to run twice.
--
-- After running this, assign roles in the Supabase SQL editor (by email, never by sharing logins):
--   update public.profiles set role = 'filer'   where id = (select id from auth.users where email = '<sheriff sign-in email>');
--   update public.profiles set role = 'support' where id = (select id from auth.users where email = '<emmanuel sign-in email>');
-- Both must have two-step sign-in (authenticator app) on, like every staff account (#220).

create or replace function public.profiles_role_guard() returns trigger
language plpgsql as $$
begin
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;
  if tg_op = 'INSERT' and new.role in ('founder', 'filer', 'support') then
    raise exception 'staff roles can only be set by an administrator';
  end if;
  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    raise exception 'roles can only be changed by an administrator';
  end if;
  return new;
end $$;

drop trigger if exists profiles_role_guard on public.profiles;
create trigger profiles_role_guard before insert or update on public.profiles
  for each row execute function public.profiles_role_guard();
