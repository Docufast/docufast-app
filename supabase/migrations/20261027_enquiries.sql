-- 27 Oct 2026 (JSB). Questions typed into the website help chat are saved here so the team
-- can answer them from the admin dashboard.
-- Apply to STAGING first; production only after Olamide's review.
-- Only the server (service role, /api/enquiries and /api/admin/enquiries) reads or writes this
-- table: RLS is on and anon and authenticated have no rights and no policies.

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text check (name is null or char_length(name) <= 120),
  email text check (email is null or char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 32),
  question text not null check (char_length(question) between 2 and 2000),
  page text check (page is null or char_length(page) <= 200),
  status text not null default 'new' check (status in ('new', 'answered')),
  answered_at timestamptz,
  answered_by uuid,
  created_at timestamptz not null default now(),
  constraint enquiries_contact_present check (email is not null or phone is not null)
);

create index if not exists enquiries_status_created_idx on public.enquiries (status, created_at desc);

alter table public.enquiries enable row level security;
revoke all on public.enquiries from anon, authenticated;
