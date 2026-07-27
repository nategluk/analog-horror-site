create or replace function public.consume_dossier_claim(
  p_claim_id uuid,
  p_secret_hash text,
  p_owner_user_id uuid,
  p_email_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  claim_record public.dossier_claims%rowtype;
  dossier_payload jsonb;
  current_session_payload jsonb;
  session_summary jsonb;
  artifact_record jsonb;
  linked_session_id text;
  session_count integer;
  artifact_count integer;
begin
  if p_claim_id is null
    or p_owner_user_id is null
    or p_secret_hash !~ '^[a-f0-9]{64}$'
    or p_email_hash !~ '^[a-f0-9]{64}$'
  then
    return jsonb_build_object('status', 'invalid');
  end if;

  select *
  into claim_record
  from public.dossier_claims
  where id = p_claim_id
  for update;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  if claim_record.secret_hash <> p_secret_hash then
    return jsonb_build_object('status', 'invalid');
  end if;

  if claim_record.email_hash <> p_email_hash then
    return jsonb_build_object('status', 'email_mismatch');
  end if;

  if claim_record.claimed_at is not null then
    if claim_record.claimed_by = p_owner_user_id then
      return jsonb_build_object('status', 'already_claimed');
    end if;

    return jsonb_build_object('status', 'invalid');
  end if;

  if claim_record.expires_at <= now() then
    return jsonb_build_object('status', 'expired');
  end if;

  dossier_payload := claim_record.payload -> 'dossier';
  current_session_payload := claim_record.payload -> 'currentSession';

  if jsonb_typeof(dossier_payload) <> 'object'
    or dossier_payload ->> 'status' <> 'completed'
    or dossier_payload ->> 'role' not in ('animator', 'volunteer')
  then
    return jsonb_build_object('status', 'invalid');
  end if;

  insert into public.dossiers (
    owner_user_id,
    schema_version,
    curator_id,
    status,
    role,
    avatar_id,
    current_session_id
  )
  values (
    p_owner_user_id,
    (dossier_payload ->> 'version')::smallint,
    dossier_payload ->> 'curatorId',
    dossier_payload ->> 'status',
    dossier_payload ->> 'role',
    dossier_payload ->> 'avatarId',
    case
      when jsonb_typeof(current_session_payload) = 'object'
      then current_session_payload ->> 'sessionId'
      else null
    end
  )
  on conflict (owner_user_id) do update
  set
    schema_version = excluded.schema_version,
    curator_id = excluded.curator_id,
    status = excluded.status,
    role = excluded.role,
    avatar_id = coalesce(excluded.avatar_id, public.dossiers.avatar_id),
    current_session_id = coalesce(
      excluded.current_session_id,
      public.dossiers.current_session_id
    );

  if jsonb_typeof(current_session_payload) = 'object' then
    insert into public.dossier_sessions (
      owner_user_id,
      id,
      curator_id,
      number,
      status,
      role,
      route_marks,
      progress_version,
      progress,
      client_updated_at
    )
    values (
      p_owner_user_id,
      current_session_payload ->> 'sessionId',
      current_session_payload ->> 'curatorId',
      (current_session_payload ->> 'sessionNumber')::integer,
      current_session_payload ->> 'status',
      current_session_payload ->> 'role',
      jsonb_array_length(current_session_payload -> 'routeMarks'),
      (current_session_payload ->> 'version')::smallint,
      current_session_payload,
      (current_session_payload ->> 'updatedAt')::bigint
    )
    on conflict (owner_user_id, id) do update
    set
      number = excluded.number,
      status = case
        when public.dossier_sessions.status = 'completed'
          and excluded.status <> 'completed'
        then public.dossier_sessions.status
        else excluded.status
      end,
      role = coalesce(excluded.role, public.dossier_sessions.role),
      route_marks = greatest(
        public.dossier_sessions.route_marks,
        excluded.route_marks
      ),
      progress_version = greatest(
        public.dossier_sessions.progress_version,
        excluded.progress_version
      ),
      progress = case
        when public.dossier_sessions.status = 'completed'
          and excluded.status <> 'completed'
        then public.dossier_sessions.progress
        else excluded.progress
      end,
      client_updated_at = greatest(
        public.dossier_sessions.client_updated_at,
        excluded.client_updated_at
      );
  end if;

  for session_summary in
    select value
    from jsonb_array_elements(
      coalesce(dossier_payload -> 'sessions', '[]'::jsonb)
    )
  loop
    if coalesce(session_summary ->> 'role', '') not in (
      'animator',
      'volunteer'
    ) then
      continue;
    end if;

    insert into public.dossier_sessions (
      owner_user_id,
      id,
      curator_id,
      number,
      status,
      role,
      route_marks,
      progress_version,
      progress,
      client_updated_at
    )
    values (
      p_owner_user_id,
      session_summary ->> 'id',
      dossier_payload ->> 'curatorId',
      (session_summary ->> 'number')::integer,
      'completed',
      session_summary ->> 'role',
      (session_summary ->> 'routeMarks')::smallint,
      4,
      jsonb_build_object(
        'summary', true,
        'completedAt', (session_summary ->> 'completedAt')::bigint
      ),
      (session_summary ->> 'completedAt')::bigint
    )
    on conflict (owner_user_id, id) do update
    set
      number = excluded.number,
      status = 'completed',
      role = excluded.role,
      route_marks = greatest(
        public.dossier_sessions.route_marks,
        excluded.route_marks
      ),
      client_updated_at = greatest(
        public.dossier_sessions.client_updated_at,
        excluded.client_updated_at
      );
  end loop;

  for artifact_record in
    select value
    from jsonb_array_elements(
      coalesce(dossier_payload -> 'artifacts', '[]'::jsonb)
    )
  loop
    select id
    into linked_session_id
    from public.dossier_sessions
    where owner_user_id = p_owner_user_id
      and number = (artifact_record ->> 'sessionNumber')::integer
    order by server_updated_at desc
    limit 1;

    insert into public.dossier_artifacts (
      owner_user_id,
      artifact_id,
      session_id,
      acquisition
    )
    values (
      p_owner_user_id,
      artifact_record ->> 'id',
      linked_session_id,
      case
        when artifact_record ->> 'id' = 'irina-private-photo'
        then 'accepted'
        else 'unlocked'
      end
    )
    on conflict (owner_user_id, artifact_id) do nothing;

    linked_session_id := null;
  end loop;

  update public.dossier_claims
  set
    claimed_at = now(),
    claimed_by = p_owner_user_id
  where id = p_claim_id;

  select count(*)
  into session_count
  from public.dossier_sessions
  where owner_user_id = p_owner_user_id;

  select count(*)
  into artifact_count
  from public.dossier_artifacts
  where owner_user_id = p_owner_user_id;

  return jsonb_build_object(
    'status', 'claimed',
    'dossierStatus', dossier_payload ->> 'status',
    'role', dossier_payload ->> 'role',
    'sessionCount', session_count,
    'artifactCount', artifact_count
  );
end;
$$;

comment on function public.consume_dossier_claim(uuid, text, uuid, text) is
  'Атомарно закрепляет подтверждённую временную передачу за auth-пользователем.';

revoke all on function public.consume_dossier_claim(uuid, text, uuid, text)
from public, anon, authenticated;

grant execute on function public.consume_dossier_claim(uuid, text, uuid, text)
to service_role;
