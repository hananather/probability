begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users (id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222'),
  ('33333333-3333-4333-8333-333333333333');
create function pg_temp.progress_document(owner uuid) returns jsonb language sql as $$
  select jsonb_build_object('schemaVersion', 1, 'ownerScope', 'account:' || owner::text,
    'curriculumRevision', 'test-revision', 'facts', '{}'::jsonb, 'checkpoints', '{}'::jsonb,
    'receipts', '{}'::jsonb, 'transferSources', '{}'::jsonb, 'transferredFacts', '{}'::jsonb)
$$;

select ok(not has_table_privilege('anon', 'public.learning_progress', 'SELECT'), 'anon has no read grant');
select ok(not has_table_privilege('anon', 'public.learning_progress', 'INSERT'), 'anon has no insert grant');
select ok(not has_table_privilege('anon', 'public.learning_progress', 'UPDATE'), 'anon has no update grant');
select ok(not has_table_privilege('anon', 'public.learning_progress', 'DELETE'), 'anon has no delete grant');
select ok(not has_table_privilege('authenticated', 'public.learning_progress', 'DELETE'), 'authenticated cannot delete reset receipts');
select ok(not has_function_privilege('authenticated', 'public.learning_progress_revision_guard()', 'EXECUTE'), 'revision trigger is not an authenticated RPC');

set local role anon;
select throws_ok('select * from public.learning_progress', '42501', 'permission denied for table learning_progress', 'anon cannot read rows');
select throws_ok($q$insert into public.learning_progress(user_id,document) values ('11111111-1111-4111-8111-111111111111', '{}')$q$, '42501', 'permission denied for table learning_progress', 'anon cannot insert');
select throws_ok('update public.learning_progress set revision=1', '42501', 'permission denied for table learning_progress', 'anon cannot update');
select throws_ok('delete from public.learning_progress', '42501', 'permission denied for table learning_progress', 'anon cannot delete');
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
select lives_ok($q$insert into public.learning_progress(user_id,document) values ('11111111-1111-4111-8111-111111111111',pg_temp.progress_document('11111111-1111-4111-8111-111111111111'))$q$, 'A inserts own row at revision zero');
select is((select count(*) from public.learning_progress), 1::bigint, 'A sees own row');
select throws_ok($q$insert into public.learning_progress(user_id,document) values ('22222222-2222-4222-8222-222222222222',pg_temp.progress_document('22222222-2222-4222-8222-222222222222'))$q$, '42501', 'new row violates row-level security policy for table "learning_progress"', 'A cannot insert B row');
select throws_ok($q$update public.learning_progress set user_id='22222222-2222-4222-8222-222222222222',revision=1$q$, '42501', 'permission denied for table learning_progress', 'owner column cannot be reassigned');
select throws_ok($q$update public.learning_progress set revision=1,document=jsonb_set(document,'{ownerScope}','"account:22222222-2222-4222-8222-222222222222"')$q$, '23514', null, 'document owner cannot be changed');
select throws_ok('update public.learning_progress set revision=1,document=null', '23502', null, 'null document rejected');
select throws_ok($q$update public.learning_progress set revision=1,document='{}'$q$, '23514', null, 'missing document identity rejected');
select throws_ok($q$update public.learning_progress set revision=1,document=jsonb_set(document,'{schemaVersion}','2')$q$, '23514', null, 'wrong schema rejected');
select throws_ok($q$update public.learning_progress set revision=1,document=jsonb_set(document,'{facts}','[]')$q$, '23514', null, 'array document facts rejected');
select throws_ok($q$update public.learning_progress set revision=1,document=jsonb_set(document,'{facts}',jsonb_build_object('payload',repeat('x',8388608)))$q$, '23514', null, 'oversized document rejected');
select throws_ok('update public.learning_progress set revision=2', '23514', 'Progress update must retain owner and advance one revision', 'revision cannot skip CAS generation');
select lives_ok('update public.learning_progress set revision=1 where revision=0', 'first CAS advances revision');
with changed as (update public.learning_progress set revision=1 where revision=0 returning *) select is(count(*), 0::bigint, 'stale CAS changes no row') from changed;
select throws_ok('delete from public.learning_progress', '42501', 'permission denied for table learning_progress', 'A cannot delete own reset history');

select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);
select is((select count(*) from public.learning_progress), 0::bigint, 'B cannot see A row');
with changed as (update public.learning_progress set revision=2 where user_id='11111111-1111-4111-8111-111111111111' returning *) select is(count(*), 0::bigint, 'B cannot update A row') from changed;
select lives_ok($q$insert into public.learning_progress(user_id,document) values ('22222222-2222-4222-8222-222222222222',pg_temp.progress_document('22222222-2222-4222-8222-222222222222'))$q$, 'B inserts isolated row');
select is((select count(*) from public.learning_progress), 1::bigint, 'B sees only B row');
select throws_ok($q$insert into public.learning_progress(user_id,document) values ('22222222-2222-4222-8222-222222222222',pg_temp.progress_document('22222222-2222-4222-8222-222222222222'))$q$, '23505', null, 'first-insert duplicate cannot overwrite');
select set_config('request.jwt.claims', '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}', true);
select throws_ok($q$insert into public.learning_progress(user_id,revision,document) values ('33333333-3333-4333-8333-333333333333',5,pg_temp.progress_document('33333333-3333-4333-8333-333333333333'))$q$, '23514', 'Initial progress revision must be zero', 'initial nonzero revision rejected');
reset role;
select * from finish();
rollback;
