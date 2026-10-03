begin;

create table public.learning_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null default 0 check (revision between 0 and 9007199254740991),
  document jsonb not null,
  updated_at timestamptz not null default now(),
  constraint learning_progress_document_identity check (coalesce(
    jsonb_typeof(document) = 'object'
    and document ?& array['schemaVersion', 'ownerScope', 'curriculumRevision', 'facts', 'checkpoints', 'receipts', 'transferSources', 'transferredFacts']
    and document - array['schemaVersion', 'ownerScope', 'curriculumRevision', 'facts', 'checkpoints', 'receipts', 'transferSources', 'transferredFacts'] = '{}'::jsonb
    and document -> 'schemaVersion' = '1'::jsonb
    and document ->> 'ownerScope' = 'account:' || user_id::text
    and jsonb_typeof(document -> 'curriculumRevision') = 'string'
    and length(document ->> 'curriculumRevision') between 1 and 256
    and jsonb_typeof(document -> 'facts') = 'object'
    and jsonb_typeof(document -> 'checkpoints') = 'object'
    and jsonb_typeof(document -> 'receipts') = 'object'
    and jsonb_typeof(document -> 'transferSources') = 'object'
    and jsonb_typeof(document -> 'transferredFacts') = 'object', false)),
  -- PostgreSQL's JSON text adds whitespace; the API enforces the 4 MiB canonical bound.
  constraint learning_progress_document_size check (octet_length(document::text) <= 8388608)
);

alter table public.learning_progress enable row level security;
revoke all on public.learning_progress from public, anon, authenticated;
grant select on public.learning_progress to authenticated;
grant insert (user_id, revision, document) on public.learning_progress to authenticated;
grant update (revision, document) on public.learning_progress to authenticated;

create policy learning_progress_select_owner on public.learning_progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy learning_progress_insert_owner on public.learning_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy learning_progress_update_owner on public.learning_progress
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create function public.learning_progress_revision_guard() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    if NEW.revision <> 0 then
      raise exception 'Initial progress revision must be zero' using errcode = '23514';
    end if;
  elsif NEW.user_id <> OLD.user_id or NEW.revision <> OLD.revision + 1 then
    raise exception 'Progress update must retain owner and advance one revision' using errcode = '23514';
  end if;
  NEW.updated_at := pg_catalog.clock_timestamp();
  return NEW;
end;
$$;
revoke all on function public.learning_progress_revision_guard() from public, anon, authenticated;
create trigger learning_progress_revision_guard
  before insert or update on public.learning_progress
  for each row execute function public.learning_progress_revision_guard();

comment on table public.learning_progress is 'Owner-isolated self-assessed learning history. Domain validation and mutation reduction run in the application; own-row access is not exam certification.';

commit;
