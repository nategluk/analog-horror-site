create table public.dossier_sessions (
  owner_user_id uuid not null
    references public.dossiers (owner_user_id) on delete cascade,
  id text not null
    check (
      char_length(id) between 1 and 128
      and id ~ '^[A-Za-z0-9_-]+$'
    ),
  curator_id text not null default '0091-A'
    check (curator_id ~ '^[0-9]{4}-[A-Z]$'),
  number integer not null
    check (number between 1 and 999),
  status text not null
    check (status in ('in_progress', 'completed')),
  role text
    check (role is null or role in ('animator', 'volunteer')),
  route_marks smallint not null default 0
    check (route_marks between 0 and 9),
  progress_version smallint not null
    check (progress_version between 1 and 32767),
  progress jsonb not null default '{}'::jsonb
    check (
      jsonb_typeof(progress) = 'object'
      and octet_length(progress::text) <= 131072
    ),
  client_updated_at bigint not null default 0
    check (client_updated_at >= 0),
  server_updated_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (owner_user_id, id),
  check (status <> 'completed' or role is not null)
);

comment on table public.dossier_sessions is
  'Отдельные прохождения кураторской классификации и нормализованный прогресс.';

create index dossier_sessions_owner_number_idx
on public.dossier_sessions (owner_user_id, number);

create index dossier_sessions_owner_updated_idx
on public.dossier_sessions (owner_user_id, server_updated_at desc);

create or replace function public.set_dossier_session_timestamps()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
    and old.status = 'completed'
    and new.status <> 'completed'
  then
    raise exception 'completed session status cannot regress';
  end if;

  if new.status = 'completed' then
    if tg_op = 'INSERT' or old.status <> 'completed' then
      new.completed_at := now();
    else
      new.completed_at := old.completed_at;
    end if;
  else
    new.completed_at := null;
  end if;

  new.server_updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_dossier_session_timestamps() from public;

create trigger dossier_sessions_set_timestamps
before insert or update on public.dossier_sessions
for each row execute function public.set_dossier_session_timestamps();

alter table public.dossier_sessions enable row level security;

revoke all on table public.dossier_sessions from public, anon, authenticated;
grant select, insert, update on table public.dossier_sessions to authenticated;
grant all on table public.dossier_sessions to service_role;

create policy "operators can read own sessions"
on public.dossier_sessions
for select
to authenticated
using ((select auth.uid()) = owner_user_id);

create policy "operators can create own sessions"
on public.dossier_sessions
for insert
to authenticated
with check ((select auth.uid()) = owner_user_id);

create policy "operators can update own sessions"
on public.dossier_sessions
for update
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

