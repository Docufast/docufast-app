-- Pause-orders switch. Built and left OFF.
create table if not exists public.site_flags (
  key text primary key,
  value boolean not null default false,
  message text,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

insert into public.site_flags (key, value)
values ('orders_paused', false)
on conflict (key) do nothing;

alter table public.site_flags enable row level security;

drop policy if exists "Anyone can read site flags" on public.site_flags;
create policy "Anyone can read site flags"
  on public.site_flags for select using (true);
-- No insert/update/delete policy: only the service role can change a flag.

create or replace function public.orders_open()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not coalesce(
    (select value from public.site_flags where key = 'orders_paused'),
    false
  );
$$;

grant execute on function public.orders_open() to anon, authenticated;

drop policy if exists "Orders paused blocks new orders" on public.orders;
create policy "Orders paused blocks new orders"
  on public.orders
  as restrictive
  for insert
  to authenticated
  with check (public.orders_open());
