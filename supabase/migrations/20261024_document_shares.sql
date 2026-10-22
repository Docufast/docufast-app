-- Share links (Terms section 10): "Share links you create can expire and be cancelled, and
-- every opening is logged." Apply to STAGING first, after 20261023_document_access_log.sql.
--
-- How a share works (the Vault stays zero-knowledge):
-- 1. In the customer's browser, the document is decrypted with their own key, then encrypted
--    again with a new random key made only for this share.
-- 2. That encrypted copy is uploaded. The random key goes only in the link after the "#", which
--    browsers never send to any server. Docufast never sees it.
-- 3. We store a SHA-256 hash of the link token, never the token itself.
-- 4. Each opening is written to document_access_log (channel share_link) before the file is
--    released. No log entry, no file.
-- 5. Cancelling or expiry stops the link at once; the encrypted copy is then deleted.

create table if not exists public.document_shares (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  document_id uuid not null,
  order_id uuid,
  owner_user_id uuid not null,
  r2_key text not null,
  encryption_iv text not null,
  file_name text,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  copy_deleted_at timestamptz,
  open_count integer not null default 0 check (open_count >= 0),
  last_opened_at timestamptz,
  created_at timestamptz not null default now(),
  constraint document_shares_expiry_check
    check (expires_at > created_at and expires_at <= created_at + interval '30 days 1 minute')
);

create index if not exists document_shares_document_idx on public.document_shares (document_id);
create index if not exists document_shares_owner_idx on public.document_shares (owner_user_id, created_at desc);
create index if not exists document_shares_cleanup_idx on public.document_shares (expires_at)
  where copy_deleted_at is null;

alter table public.document_shares enable row level security;

-- Owners can see their own shares. All changes go through the API (service role).
revoke all on public.document_shares from anon, authenticated;
grant select (id, document_id, file_name, expires_at, revoked_at, open_count, last_opened_at, created_at)
  on public.document_shares to authenticated;

drop policy if exists document_shares_owner_select on public.document_shares;
create policy document_shares_owner_select on public.document_shares
  for select to authenticated
  using (owner_user_id = auth.uid());

-- Counts an opening atomically, only while the link is live. Returns the row, or nothing.
create or replace function public.document_share_open(p_token_hash text)
returns setof public.document_shares
language sql
security definer
set search_path = public
as $$
  update public.document_shares
     set open_count = open_count + 1,
         last_opened_at = now()
   where token_hash = p_token_hash
     and revoked_at is null
     and expires_at > now()
  returning *;
$$;

revoke all on function public.document_share_open(text) from public, anon, authenticated;
