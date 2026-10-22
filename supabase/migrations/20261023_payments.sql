-- 23 Oct 2026 (#109). Payment attempts through Paystack. Apply to STAGING first.
-- Written only by docufast-api (service role). Customers can read their own rows.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  user_id uuid not null,
  provider text not null default 'paystack',
  reference text not null unique,
  amount_kobo bigint not null check (amount_kobo > 0),
  currency text not null default 'NGN',
  status text not null default 'initialized' check (status in (
    'initialized', 'failed', 'success', 'amount_mismatch',
    'duplicate_refunded', 'duplicate_refund_needed'
  )),
  paystack_transaction_id bigint,
  channel text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_order_id_idx on public.payments (order_id);

create or replace function public.payments_touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists payments_touch_updated_at on public.payments;
create trigger payments_touch_updated_at before update on public.payments
  for each row execute function public.payments_touch_updated_at();

alter table public.payments enable row level security;
revoke all on public.payments from anon, authenticated;
grant select on public.payments to authenticated;
drop policy if exists "Customers can see their own payments" on public.payments;
create policy "Customers can see their own payments" on public.payments
  for select to authenticated using (user_id = auth.uid());
