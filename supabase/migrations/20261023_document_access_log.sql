-- 23 Oct 2026 (#153, JSB decision 13 Oct 2026). Every view, download, delivery, share and
-- print of a client document is logged, for everyone including the Founder. Nobody can edit
-- or delete an entry: UPDATE, DELETE and TRUNCATE are blocked by triggers, which also stop
-- the service role. Each row carries a hash of the previous row, so a removed or altered
-- entry breaks the chain and shows up in a check. Apply to STAGING first.

create extension if not exists pgcrypto;

create table if not exists public.document_access_log (
  id bigserial primary key,
  occurred_at timestamptz not null default now(),
  -- No foreign keys on purpose: entries must survive if a document or order is deleted.
  document_id uuid,
  order_id uuid,
  owner_user_id uuid,          -- the customer whose document it is
  actor_user_id uuid,          -- who opened it (null only for a system action)
  actor_role text not null,    -- customer, founder, staff, system
  action text not null check (action in ('view', 'download', 'deliver', 'upload', 'share', 'print', 'delete')),
  channel text not null check (channel in ('vault', 'admin_panel', 'staff_qa', 'api', 'share_link', 'system')),
  ip text,
  user_agent text check (user_agent is null or char_length(user_agent) <= 300),
  prev_hash text,
  row_hash text
);

create index if not exists document_access_log_owner_idx on public.document_access_log (owner_user_id, occurred_at desc);
create index if not exists document_access_log_document_idx on public.document_access_log (document_id, occurred_at desc);

-- Hash chain, computed in the database so no application can forge it.
create or replace function public.document_access_log_chain() returns trigger
language plpgsql as $$
declare
  last_hash text;
begin
  perform pg_advisory_xact_lock(hashtext('public.document_access_log'));
  select row_hash into last_hash from public.document_access_log order by id desc limit 1;
  new.occurred_at := now();
  new.prev_hash := coalesce(last_hash, 'GENESIS');
  new.row_hash := encode(digest(
    concat_ws('|', new.prev_hash, new.occurred_at::text, coalesce(new.document_id::text, ''),
      coalesce(new.order_id::text, ''), coalesce(new.owner_user_id::text, ''),
      coalesce(new.actor_user_id::text, ''), new.actor_role, new.action, new.channel,
      coalesce(new.ip, ''), coalesce(new.user_agent, '')),
    'sha256'), 'hex');
  return new;
end $$;

drop trigger if exists document_access_log_chain on public.document_access_log;
create trigger document_access_log_chain before insert on public.document_access_log
  for each row execute function public.document_access_log_chain();

-- Append-only, for every role including service_role.
create or replace function public.document_access_log_block_changes() returns trigger
language plpgsql as $$
begin
  raise exception 'document_access_log is append-only: % is not allowed', tg_op;
end $$;

drop trigger if exists document_access_log_no_update on public.document_access_log;
create trigger document_access_log_no_update before update or delete on public.document_access_log
  for each row execute function public.document_access_log_block_changes();
drop trigger if exists document_access_log_no_truncate on public.document_access_log;
create trigger document_access_log_no_truncate before truncate on public.document_access_log
  for each statement execute function public.document_access_log_block_changes();

-- Customers can see who opened their own documents; nobody can write from the browser.
alter table public.document_access_log enable row level security;
revoke all on public.document_access_log from anon, authenticated;
grant select on public.document_access_log to authenticated;
drop policy if exists "Customers can see access to their own documents" on public.document_access_log;
create policy "Customers can see access to their own documents" on public.document_access_log
  for select to authenticated using (owner_user_id = auth.uid());

-- Check the chain: returns the first broken row id, or null if the chain is intact.
create or replace function public.document_access_log_verify() returns bigint
language plpgsql security definer set search_path = public as $$
declare
  r record;
  expected_prev text := 'GENESIS';
  expected_hash text;
begin
  for r in select * from public.document_access_log order by id loop
    expected_hash := encode(digest(
      concat_ws('|', r.prev_hash, r.occurred_at::text, coalesce(r.document_id::text, ''),
        coalesce(r.order_id::text, ''), coalesce(r.owner_user_id::text, ''),
        coalesce(r.actor_user_id::text, ''), r.actor_role, r.action, r.channel,
        coalesce(r.ip, ''), coalesce(r.user_agent, '')),
      'sha256'), 'hex');
    if r.prev_hash is distinct from expected_prev or r.row_hash is distinct from expected_hash then
      return r.id;
    end if;
    expected_prev := r.row_hash;
  end loop;
  return null;
end $$;
revoke all on function public.document_access_log_verify() from public, anon, authenticated;
