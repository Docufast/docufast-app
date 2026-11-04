-- When a quote was sent, so the 48-hour quote promise can be enforced (test report D6, 4 Nov 2026).
-- Run this BEFORE deploying the API change that reads it.
alter table public.orders add column if not exists quote_sent_at timestamptz;

-- Orders already waiting for payment get a fresh 48 hours from today, so nobody is caught out.
update public.orders set quote_sent_at = now() where status = 'quote_sent' and quote_sent_at is null;

-- Only the API (service role) writes it; customers already cannot update orders (RLS hardening).
