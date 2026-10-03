// @vitest-environment node
import { readFileSync, statSync } from 'node:fs';
import { beforeEach, expect, it, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { getAuthConfig } from '@/lib/auth/config';
import { readAccountProgress, writeAccountProgress } from '@/lib/auth/progressAdapter';
import { createCloudMutation, captureCloudWriteContext, createEmptyCloudDocument } from '@/lib/progress/cloud/schema';

beforeEach(() => { vi.stubGlobal('window', { localStorage: { clear() {} } }); });
const fixturePath = process.env.PROBABILITY_AUTH_TEST_FILE;

it.skipIf(!fixturePath)('uses ordinary verified local Auth tokens for real REST RLS, first-insert CAS, and corrupt-own-row rejection', async () => {
  if ((statSync(fixturePath).mode & 0o077) !== 0) throw new Error('Account test fixture must be mode 0600');
  const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
  const config = getAuthConfig(fixture);
  if (!config.available || !['localhost', '127.0.0.1', '[::1]'].includes(new URL(config.url).hostname)) throw new Error('Real account gate requires the isolated local runtime');
  const { accountA, accountB } = fixture;
  const client = account => createClient(config.url, config.publishableKey, { global: { headers: { Authorization: `Bearer ${account.accessToken}` } }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const a = client(accountA);
  const b = client(accountB);
  const aSecond = client(accountA);
  for (const [sdk, account] of [[a, accountA], [b, accountB]]) {
    const verified = await sdk.auth.getUser(account.accessToken);
    if (verified.error || verified.data.user?.id !== account.id || !verified.data.user?.email_confirmed_at) throw new Error('Real account gate requires confirmed fresh local actors');
    const initial = await sdk.from('learning_progress').select('user_id');
    if (initial.error || initial.data.length) throw new Error('Real account gate requires separate fresh test actors; no existing records will be deleted');
  }
  const empty = createEmptyCloudDocument({ ownerScope: `account:${accountA.id}` });
  const make = (deviceId, activityId) => createCloudMutation({ id: crypto.randomUUID(), deviceId, type: 'complete', context: captureCloudWriteContext(empty), payload: { activityId, kind: 'study-completed', sourceKey: 'real-local-gate', completedAt: '2026-10-03T12:00:00Z' } });
  const one = make('real-device-one', 'chapter-1:foundations:foundations');
  const two = make('real-device-two', 'chapter-2:random-variables');
  await Promise.all([writeAccountProgress(a, accountA.id, [one]), writeAccountProgress(aSecond, accountA.id, [two])]);
  const healthy = await readAccountProgress(a, accountA.id);
  expect(Object.keys(healthy.document.facts.activities).sort()).toEqual([one.payload.activityId, two.payload.activityId].sort());
  expect(healthy.document.receipts[one.id].status).toBe('applied');
  expect(healthy.document.receipts[two.id].status).toBe('applied');
  const replay = await writeAccountProgress(a, accountA.id, [one, two]);
  expect(replay.outcomes.every(outcome => outcome.duplicate)).toBe(true);
  expect(Object.keys(replay.document.receipts)).toHaveLength(2);

  const anonymous = createClient(config.url, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
  expect((await anonymous.from('learning_progress').select('*')).error?.code).toBe('42501');
  expect((await b.from('learning_progress').select('*').eq('user_id', accountA.id)).data).toEqual([]);
  expect((await b.from('learning_progress').update({ revision: replay.revision + 1 }).eq('user_id', accountA.id).select('user_id')).data).toEqual([]);
  expect((await b.from('learning_progress').insert({ user_id: accountA.id, document: empty })).error?.code).toBe('42501');
  expect((await a.from('learning_progress').update({ user_id: accountB.id, revision: replay.revision + 1 }).eq('user_id', accountA.id)).error?.code).toBe('42501');
  expect((await a.from('learning_progress').delete().eq('user_id', accountA.id)).error?.code).toBe('42501');
  const invalidSchema = await a.from('learning_progress').update({ revision: replay.revision + 1, document: { ...replay.document, schemaVersion: 2 } }).eq('user_id', accountA.id);
  expect(invalidSchema.error?.code).toBe('23514');

  // Own-row grants deliberately permit self-assessment edits; application validation
  // must reject corrupt domain data rather than certify it or overwrite recovery.
  const corrupted = { ...replay.document, facts: {} };
  const write = await a.from('learning_progress').update({ revision: replay.revision + 1, document: corrupted }).eq('user_id', accountA.id);
  expect(write.error).toBeNull();
  try {
    await expect(readAccountProgress(a, accountA.id)).rejects.toMatchObject({ status: 409, code: 'invalid-remote-progress' });
    await expect(writeAccountProgress(a, accountA.id, [make('real-device-one', one.payload.activityId)])).rejects.toMatchObject({ status: 409 });
  } finally {
    const restored = await a.from('learning_progress').update({ revision: replay.revision + 2, document: replay.document }).eq('user_id', accountA.id).eq('revision', replay.revision + 1);
    if (restored.error) throw new Error('Isolated local actor record could not be restored after corruption control');
  }
}, 30000);
