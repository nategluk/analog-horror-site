create table public.dossiers (
  owner_user_id uuid primary key references auth.users (id) on delete cascade,
  schema_version smallint not null default 1
    check (schema_version = 1),
  curator_id text not null default '0091-A'
    check (curator_id ~ '^[0-9]{4}-[A-Z]$'),
  status text not null default 'screening'
    check (status in ('screening', 'in_progress', 'completed')),
  role text
    check (role is null or role in ('animator', 'volunteer')),
  avatar_id text
    check (
      avatar_id is null
      or avatar_id in ('overexposed', 'drawing', 'mask', 'empty-chair')
    ),
  current_session_id text
    check (
      current_session_id is null
      or char_length(current_session_id) between 1 and 128
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'completed' or role is not null)
);

comment on table public.dossiers is
  'Закреплённые личные дела операторов; email хранится только в auth.users.';

create or replace function public.set_dossier_timestamps()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
  elsif old.status = 'completed' and new.status <> 'completed' then
    raise exception 'completed dossier status cannot regress';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_dossier_timestamps() from public;

create trigger dossiers_set_timestamps
before insert or update on public.dossiers
for each row execute function public.set_dossier_timestamps();

alter table public.dossiers enable row level security;

revoke all on table public.dossiers from public, anon, authenticated;
grant select, insert, update on table public.dossiers to authenticated;
grant all on table public.dossiers to service_role;

create policy "operators can read own dossier"
on public.dossiers
for select
to authenticated
using ((select auth.uid()) = owner_user_id);

create policy "operators can create own dossier"
on public.dossiers
for insert
to authenticated
with check ((select auth.uid()) = owner_user_id);

create policy "operators can update own dossier"
on public.dossiers
for update
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);
