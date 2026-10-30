-- 28 Oct 2026 (#199 age check at sign-up, #75 consent records; Playbook 10.1 "Children and age",
-- "Marketing messages" and "Lawful basis"). Apply to STAGING first; production only after
-- Olamide's review.
--
-- 1. profiles gets the date of birth given at sign-up and how the 18+ check was passed.
-- 2. consent_records keeps every consent decision (terms, marketing, 18+ declaration, and later
--    analytics and opt-outs): who, what, granted or not, which wording they saw, when, from where.
--    It is append-only: a change of mind is a NEW row, never an edit, so the history is evidence.
--    Only the server (service role, /api/account/consents) writes; customers can read their own.

-- 1. Age check fields -----------------------------------------------------------------------
alter table if exists public.profiles
  add column if not exists date_of_birth date,
  add column if not exists age_check_method text
    check (age_check_method is null or age_check_method in ('declared', 'id_record')),
  add column if not exists age_checked_at timestamptz;

-- A date of birth on a profile must make the person 18 or over (Terms s.3: accounts are for adults).
alter table if exists public.profiles drop constraint if exists profiles_adult_only;
alter table if exists public.profiles add constraint profiles_adult_only
  check (date_of_birth is null or date_of_birth <= (current_date - interval '18 years')::date) not valid;

-- Customers must not be able to set or change their own age check from the browser. A column
-- REVOKE would not work while the table-level UPDATE grant exists, so a trigger enforces it:
-- only the server (service_role, /api/account/consents) or a staff tool running as postgres may
-- write these three columns.
create or replace function public.profiles_protect_age_check() returns trigger
language plpgsql as $$
begin
  if current_user not in ('service_role', 'postgres', 'supabase_admin')
     and (new.date_of_birth is distinct from old.date_of_birth
          or new.age_check_method is distinct from old.age_check_method
          or new.age_checked_at is distinct from old.age_checked_at) then
    raise exception 'The age check can only be recorded by Docufast';
  end if;
  return new;
end $$;

drop trigger if exists profiles_protect_age_check on public.profiles;
create trigger profiles_protect_age_check before update on public.profiles
  for each row execute function public.profiles_protect_age_check();

-- 2. Consent records ------------------------------------------------------------------------
create table if not exists public.consent_records (
  id bigserial primary key,
  -- No foreign key on purpose: the record must survive as evidence if an account is closed.
  -- How long it is kept after closure is set in the ROPA (#202, Sheriff).
  user_id uuid not null,
  kind text not null check (kind in ('terms_privacy', 'marketing', 'age_18_plus', 'analytics')),
  granted boolean not null,
  wording_version text not null check (char_length(wording_version) between 1 and 80),
  source text not null check (source in ('sign_up', 'privacy_choices', 'unsubscribe_link', 'whatsapp_stop', 'staff')),
  recorded_at timestamptz not null default now(),
  ip text,
  user_agent text check (user_agent is null or char_length(user_agent) <= 300)
);

create index if not exists consent_records_user_kind_idx
  on public.consent_records (user_id, kind, recorded_at desc);

-- The server sets the time; nobody can backdate a consent.
create or replace function public.consent_records_set_time() returns trigger
language plpgsql as $$
begin
  new.recorded_at := now();
  return new;
end $$;

drop trigger if exists consent_records_set_time on public.consent_records;
create trigger consent_records_set_time before insert on public.consent_records
  for each row execute function public.consent_records_set_time();

-- Append-only, for every role including service_role.
create or replace function public.consent_records_block_changes() returns trigger
language plpgsql as $$
begin
  raise exception 'consent_records is append-only: % is not allowed', tg_op;
end $$;

drop trigger if exists consent_records_no_update on public.consent_records;
create trigger consent_records_no_update before update or delete on public.consent_records
  for each row execute function public.consent_records_block_changes();
drop trigger if exists consent_records_no_truncate on public.consent_records;
create trigger consent_records_no_truncate before truncate on public.consent_records
  for each statement execute function public.consent_records_block_changes();

alter table public.consent_records enable row level security;
revoke all on public.consent_records from anon, authenticated;
grant select on public.consent_records to authenticated;
drop policy if exists "Customers can see their own consent history" on public.consent_records;
create policy "Customers can see their own consent history" on public.consent_records
  for select to authenticated using (user_id = auth.uid());

-- Latest decision per person and kind (what Privacy choices shows, and what a marketing send
-- must check before sending, #201).
create or replace view public.current_consents
with (security_invoker = true) as
select distinct on (user_id, kind)
  user_id, kind, granted, wording_version, source, recorded_at
from public.consent_records
order by user_id, kind, recorded_at desc, id desc;

grant select on public.current_consents to authenticated;
