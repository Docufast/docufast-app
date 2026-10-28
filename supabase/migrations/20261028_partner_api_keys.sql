-- 28 Oct 2026 (#41, Playbook 10.1): partner and agent API keys, IP-allowlisted with no exceptions.
-- Apply to STAGING first; production only after Olamide's review.
-- Only the server (service role) reads or writes this table. A key's secret is never stored:
-- only its SHA-256 hash. Issue keys with services/docufast-api/scripts/issue-partner-key.js.

create table if not exists public.partner_api_keys (
  key_id text primary key check (key_id ~ '^[a-z0-9]{12}$'),
  partner_name text not null check (char_length(partner_name) between 2 and 120),
  environment text not null check (environment in ('sandbox', 'live')),
  secret_hash text not null check (secret_hash ~ '^[0-9a-f]{64}$'),
  scopes text[] not null default '{}',
  -- Single addresses or CIDR ranges. An empty list means the key works from nowhere.
  allowed_ips text[] not null check (cardinality(allowed_ips) between 1 and 20),
  rate_limit_per_minute integer not null default 60 check (rate_limit_per_minute between 1 and 6000),
  dpa_signed boolean not null default false,
  created_by text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_reason text,
  last_used_at timestamptz,
  last_used_ip text,
  notes text
);

-- Live keys only for partners with a signed data processing agreement (Playbook 8.2, #20).
alter table public.partner_api_keys drop constraint if exists partner_api_keys_live_needs_dpa;
alter table public.partner_api_keys add constraint partner_api_keys_live_needs_dpa
  check (environment = 'sandbox' or dpa_signed);

-- Every allowlist entry must be a valid address or range (no 0.0.0.0/0 or ::/0 "allow all").
create or replace function public.partner_api_keys_check_ips() returns trigger
language plpgsql as $$
declare
  entry text;
  net_value inet;
  narrowest integer;
begin
  foreach entry in array new.allowed_ips loop
    begin
      net_value := entry::inet;
    exception when others then
      raise exception 'allowed_ips: "%" is not a valid IP address or range', entry;
    end;
    narrowest := case when family(net_value) = 4 then 24 else 48 end;
    if masklen(net_value) < narrowest then
      raise exception 'allowed_ips: "%" is too wide; use the partner''s exact server addresses', entry;
    end if;
  end loop;
  return new;
end $$;

drop trigger if exists partner_api_keys_check_ips on public.partner_api_keys;
create trigger partner_api_keys_check_ips before insert or update on public.partner_api_keys
  for each row execute function public.partner_api_keys_check_ips();

alter table public.partner_api_keys enable row level security;
revoke all on public.partner_api_keys from anon, authenticated;
