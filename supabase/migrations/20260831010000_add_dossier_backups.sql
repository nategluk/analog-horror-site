insert into public.artifact_catalog (id)
values
  ('lora-night-receipt'),
  ('lora-nevalyashka'),
  ('lora-quiet-sleep-page'),
  ('pavel-lora-cassette')
on conflict (id) do nothing;

create table public.dossier_backups (
  owner_user_id uuid primary key
    references public.dossiers (owner_user_id) on delete cascade,
  schema_version smallint not null default 2
    check (schema_version between 1 and 32767),
  payload jsonb not null
    check (
      jsonb_typeof(payload) = 'object'
      and octet_length(payload::text) <= 262144
    ),
  client_updated_at bigint not null default 0
    check (client_updated_at >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.dossier_backups is
  'Версионированный восстановимый снимок досье и локальных сюжетных игр.';

create or replace function public.set_dossier_backup_timestamp()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
    and new.client_updated_at < old.client_updated_at
  then
    raise exception 'stale dossier backup';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_dossier_backup_timestamp() from public;

create trigger dossier_backups_set_timestamp
before insert or update on public.dossier_backups
for each row execute function public.set_dossier_backup_timestamp();

alter table public.dossier_backups enable row level security;

revoke all on table public.dossier_backups from public, anon, authenticated;
grant select, insert, update on table public.dossier_backups to authenticated;
grant all on table public.dossier_backups to service_role;

create policy "operators can read own backup"
on public.dossier_backups
for select
to authenticated
using ((select auth.uid()) = owner_user_id);

create policy "operators can create own backup"
on public.dossier_backups
for insert
to authenticated
with check ((select auth.uid()) = owner_user_id);

create policy "operators can update own backup"
on public.dossier_backups
for update
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);
