-- 22 Oct 2026 (#38). Waitlist on Docufast's own database, replacing the Formspree placeholder.
-- Apply to STAGING first; production only after Olamide's review.
-- Only the server (service role, /api/waitlist) reads or writes this table: RLS is on and
-- anon and authenticated have no rights and no policies.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) <= 254),
  name text check (name is null or char_length(name) <= 120),
  source text check (source is null or char_length(source) <= 60),
  marketing_consent boolean not null default false,
  consent_wording_version text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_lower_key on public.waitlist (lower(email));

alter table public.waitlist enable row level security;
revoke all on public.waitlist from anon, authenticated;
