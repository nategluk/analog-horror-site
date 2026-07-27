create table public.dossier_claims (
  id uuid primary key default gen_random_uuid(),
  secret_hash text not null unique
    check (secret_hash ~ '^[a-f0-9]{64}$'),
  email_hash text not null
    check (email_hash ~ '^[a-f0-9]{64}$'),
  payload jsonb not null
    check (
      jsonb_typeof(payload) = 'object'
      and octet_length(payload::text) <= 131072
    ),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  claimed_at timestamptz,
  claimed_by uuid references auth.users (id) on delete set null
);

comment on table public.dossier_claims is
  'Одноразовые временные передачи локального дела до подтверждения email.';

create index dossier_claims_email_created_idx
on public.dossier_claims (email_hash, created_at desc);

create index dossier_claims_expires_idx
on public.dossier_claims (expires_at)
where claimed_at is null;

alter table public.dossier_claims enable row level security;

revoke all on table public.dossier_claims from public, anon, authenticated;
grant all on table public.dossier_claims to service_role;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create or replace function private.delete_expired_dossier_claims()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count bigint;
begin
  delete from public.dossier_claims
  where expires_at < now()
     or claimed_at < now() - interval '24 hours';

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function private.delete_expired_dossier_claims() from public;
grant execute on function private.delete_expired_dossier_claims()
to service_role;
