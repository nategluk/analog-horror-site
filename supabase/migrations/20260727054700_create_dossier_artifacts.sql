create table public.artifact_catalog (
  id text primary key
    check (
      char_length(id) between 1 and 64
      and id ~ '^[a-z0-9-]+$'
    )
);

comment on table public.artifact_catalog is
  'Публичные стабильные ID известных артефактов без секретного содержимого.';

insert into public.artifact_catalog (id)
values
  ('memory-drawing'),
  ('recognition-card'),
  ('service-route-map'),
  ('blue-key-evidence'),
  ('assigned-toy-polaroid'),
  ('post-aroma-dessert'),
  ('ulybarych-broadcast'),
  ('operator-empty-chair'),
  ('damaged-child-file'),
  ('lost-child-route-ticket'),
  ('preserved-child-file'),
  ('irina-private-photo'),
  ('animator-postcard'),
  ('volunteer-leaflet'),
  ('biometric-record'),
  ('assignment'),
  ('lora-night-receipt'),
  ('lora-nevalyashka'),
  ('lora-quiet-sleep-page'),
  ('pavel-lora-cassette');

alter table public.artifact_catalog enable row level security;

revoke all on table public.artifact_catalog from public, anon, authenticated;
grant select on table public.artifact_catalog to authenticated;
grant all on table public.artifact_catalog to service_role;

create policy "authenticated operators can read artifact ids"
on public.artifact_catalog
for select
to authenticated
using (true);

create table public.dossier_artifacts (
  owner_user_id uuid not null
    references public.dossiers (owner_user_id) on delete cascade,
  artifact_id text not null
    references public.artifact_catalog (id),
  session_id text
    check (
      session_id is null
      or (
        char_length(session_id) between 1 and 128
        and session_id ~ '^[A-Za-z0-9_-]+$'
      )
    ),
  acquisition text not null default 'unlocked'
    check (acquisition in ('accepted', 'declined_backup', 'unlocked')),
  obtained_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_user_id, artifact_id)
);

comment on table public.dossier_artifacts is
  'Факты получения артефактов; разметка и пути остаются в доверенном каталоге.';

create index dossier_artifacts_owner_obtained_idx
on public.dossier_artifacts (owner_user_id, obtained_at);

create or replace function public.set_dossier_artifact_timestamps()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.obtained_at := now();
  else
    new.obtained_at := old.obtained_at;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_dossier_artifact_timestamps() from public;

create trigger dossier_artifacts_set_timestamps
before insert or update on public.dossier_artifacts
for each row execute function public.set_dossier_artifact_timestamps();

alter table public.dossier_artifacts enable row level security;

revoke all on table public.dossier_artifacts from public, anon, authenticated;
grant select, insert, update on table public.dossier_artifacts to authenticated;
grant all on table public.dossier_artifacts to service_role;

create policy "operators can read own artifacts"
on public.dossier_artifacts
for select
to authenticated
using ((select auth.uid()) = owner_user_id);

create policy "operators can create own artifacts"
on public.dossier_artifacts
for insert
to authenticated
with check ((select auth.uid()) = owner_user_id);

create policy "operators can update own artifacts"
on public.dossier_artifacts
for update
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);
