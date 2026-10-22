-- 23 Oct 2026 (#185). The staff filing record for each affidavit order: which court form was
-- used, the court's filing ID, and when it was filed and commissioned. Staff file by hand on
-- LagosCoMiS (no API), so this is the record of what they did. Service role only.
-- Apply to STAGING first.

create table if not exists public.affidavit_filings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  court_route text not null default 'lagoscomis' check (court_route in ('lagoscomis', 'oguncomis', 'varms', 'fhc', 'commissioner')),
  court_form text check (court_form is null or char_length(court_form) <= 120),
  court_division text check (court_division is null or char_length(court_division) <= 120),
  filing_id text check (filing_id is null or char_length(filing_id) <= 80),
  filed_at timestamptz,
  commissioned_at timestamptz,
  video_requested boolean not null default false,
  notes text check (notes is null or char_length(notes) <= 2000),
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (commissioned_at is null or filed_at is null or commissioned_at >= filed_at)
);

create or replace function public.affidavit_filings_touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists affidavit_filings_touch_updated_at on public.affidavit_filings;
create trigger affidavit_filings_touch_updated_at before update on public.affidavit_filings
  for each row execute function public.affidavit_filings_touch_updated_at();

alter table public.affidavit_filings enable row level security;
revoke all on public.affidavit_filings from anon, authenticated;
