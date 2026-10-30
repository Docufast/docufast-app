-- Express affidavits and the late Express refund (Terms section 7).
-- Apply to STAGING first, after 20261023_payments.sql.
--
-- Terms: "If you paid for Express and the same-day time is missed for any reason other than a
-- delay on your side, we refund the Express fee automatically."
--
-- The customer chooses the speed when ordering. Everything else on these columns is set by the
-- server (service role) when payment is confirmed or when staff act; a trigger stops customers
-- from setting them through the public API.

alter table public.orders
  add column if not exists speed text not null default 'standard',
  add column if not exists delivered_at timestamptz,
  add column if not exists express_due_at timestamptz,
  add column if not exists express_fee_kobo integer,
  add column if not exists express_refund_status text,
  add column if not exists express_refund_note text,
  add column if not exists express_refund_reference text,
  add column if not exists express_refunded_at timestamptz;

alter table public.orders drop constraint if exists orders_speed_check;
alter table public.orders add constraint orders_speed_check check (speed in ('standard', 'express'));

alter table public.orders drop constraint if exists orders_express_fee_check;
alter table public.orders add constraint orders_express_fee_check
  check (express_fee_kobo is null or express_fee_kobo >= 0);

-- processing: a refund call is in flight (claimed by one caller only)
-- refunded: Paystack accepted the refund
-- refund_needed: the Paystack call failed; staff must retry
-- not_due: staff recorded that the delay was on the customer's side (note required)
alter table public.orders drop constraint if exists orders_express_refund_status_check;
alter table public.orders add constraint orders_express_refund_status_check
  check (express_refund_status is null or express_refund_status in ('processing', 'refunded', 'refund_needed', 'not_due'));

alter table public.orders drop constraint if exists orders_express_not_due_note_check;
alter table public.orders add constraint orders_express_not_due_note_check
  check (express_refund_status is distinct from 'not_due' or coalesce(btrim(express_refund_note), '') <> '');

create index if not exists orders_express_due_idx
  on public.orders (express_due_at)
  where speed = 'express' and express_refund_status is null;

-- Customers (anon, authenticated) may choose speed on a new order, but never set the server
-- fields, and never change speed after the order is placed.
create or replace function public.orders_protect_server_fields()
returns trigger
language plpgsql
as $$
declare
  jwt_role text := coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::json ->> 'role',
    nullif(current_setting('request.jwt.claim.role', true), '')
  );
begin
  if jwt_role is null or jwt_role not in ('anon', 'authenticated') then
    return new; -- service role, migrations, SQL editor
  end if;

  if tg_op = 'INSERT' then
    new.delivered_at := null;
    new.express_due_at := null;
    new.express_fee_kobo := null;
    new.express_refund_status := null;
    new.express_refund_note := null;
    new.express_refund_reference := null;
    new.express_refunded_at := null;
  else
    new.speed := old.speed;
    new.delivered_at := old.delivered_at;
    new.express_due_at := old.express_due_at;
    new.express_fee_kobo := old.express_fee_kobo;
    new.express_refund_status := old.express_refund_status;
    new.express_refund_note := old.express_refund_note;
    new.express_refund_reference := old.express_refund_reference;
    new.express_refunded_at := old.express_refunded_at;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_protect_server_fields on public.orders;
create trigger orders_protect_server_fields
  before insert or update on public.orders
  for each row execute function public.orders_protect_server_fields();
