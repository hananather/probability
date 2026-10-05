// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readAccountProgress, validateProgressBatch, writeAccountProgress } from '@/lib/auth/progressAdapter';
import { createCloudMutation, validateCloudDocument } from '@/lib/progress/cloud/schema';
import { ACCOUNT_A, ACCOUNT_B, ACTIVITY, OTHER_ACTIVITY, complete, copy, document, mutation, reduce, reset, uuid } from '../progress/cloud/helpers';

const A = ACCOUNT_A.slice(8);
const B = ACCOUNT_B.slice(8);
beforeEach(() => { vi.stubGlobal('window', { localStorage: { clear() {} } }); });
const row = (doc = document(), revision = 0) => ({ user_id: doc.ownerScope.slice(8), revision, document: copy(doc), updated_at: '2026-10-03T12:00:00.000Z' });

function database(initial, hooks = {}) {
  const rows = new Map(initial ? [[initial.user_id, copy(initial)]] : []);
  const calls = [];
  const client = { from: vi.fn(table => {
    const query = { op: 'read', filters: {}, value: null };
    const builder = {
      select: () => builder,
      eq: (key, value) => { query.filters[key] = value; return builder; },
      insert: value => { query.op = 'insert'; query.value = copy(value); return builder; },
      update: value => { query.op = 'update'; query.value = copy(value); return builder; },
      maybeSingle: async () => {
        calls.push({ table, ...copy(query) });
        await hooks[query.op]?.(query, rows);
        if (hooks.error) return { data: null, ...hooks.error };
        const id = query.op === 'insert' ? query.value.user_id : query.filters.user_id;
        const current = rows.get(id);
        if (query.op === 'read') return { data: current ? copy(current) : null, error: null };
        if (query.op === 'insert' && current) return { data: null, error: { code: '23505' } };
        if (query.op === 'update' && (!current || current.revision !== query.filters.revision)) return { data: null, error: null };
        const next = query.op === 'insert' ? { ...query.value, updated_at: '2026-10-03T12:00:01Z' } : { ...current, ...query.value, updated_at: '2026-10-03T12:00:02Z' };
        rows.set(id, next);
        return { data: copy(next), error: null };
      },
    };
    return builder;
  }) };
  return { client, rows, calls };
}

describe('owner-bound progress CAS with real pure account reducer', () => {
  it('reads an empty owner projection without inserting, and first insert commits fact and receipt together', async () => {
    const db = database();
    const empty = await readAccountProgress(db.client, A);
    expect(empty).toMatchObject({ accountId: A, ownerScope: ACCOUNT_A, revision: 0, outcomes: [] });
    expect(validateCloudDocument(empty.document, { ownerScope: ACCOUNT_A }).valid).toBe(true);
    expect(db.rows.size).toBe(0);
    const op = complete(empty.document);
    const result = await writeAccountProgress(db.client, A, [op]);
    expect(result.revision).toBe(0);
    expect(result.document.facts.activities[ACTIVITY].evidence).toHaveLength(1);
    expect(result.document.receipts[op.id].status).toBe('applied');
    expect(db.calls.every(call => call.table === 'learning_progress')).toBe(true);
    expect(db.calls.filter(call => call.op !== 'insert').every(call => call.filters.user_id === A)).toBe(true);
  });

  it('persists applied no-op and rejected receipts despite outcome.changed=false', async () => {
    const original = document();
    const resetOp = reset(original, 'global');
    const current = reduce(original, resetOp).document;
    const stale = complete(original);
    const noop = mutation(current, 'quiz-preferences', { patch: {} });
    const db = database(row(current, 7));
    const result = await writeAccountProgress(db.client, A, [stale, noop]);
    expect(result.revision).toBe(8);
    expect(result.outcomes).toMatchObject([{ id: stale.id, status: 'rejected', reason: 'write-predates-reset', changed: false }, { id: noop.id, status: 'applied', changed: false }]);
    expect(Object.keys(result.document.receipts)).toContain(stale.id);
    expect(Object.keys(result.document.receipts)).toContain(noop.id);
    const replay = await writeAccountProgress(db.client, A, [stale, noop]);
    expect(replay.outcomes.every(outcome => outcome.duplicate)).toBe(true);
    expect(replay.document.facts.activities).toEqual({});
    expect(Object.keys(replay.document.receipts)).toHaveLength(3);
  });

  it('handles a first-insert race without unconditional upsert or losing either device fact', async () => {
    const base = document();
    const competing = complete(base, OTHER_ACTIVITY, { deviceId: 'device-two' });
    let inserted = false;
    const db = database(null, { insert: (query, rows) => {
      if (!inserted) { inserted = true; rows.set(A, row(reduce(base, competing).document)); }
    } });
    const own = complete(base);
    const result = await writeAccountProgress(db.client, A, [own]);
    expect(result.revision).toBe(1);
    expect(Object.keys(result.document.facts.activities).sort()).toEqual([ACTIVITY, OTHER_ACTIVITY].sort());
    expect(Object.keys(result.document.receipts).sort()).toEqual([own.id, competing.id].sort());
    expect(db.calls.map(call => call.op)).toEqual(['read', 'insert', 'read', 'update']);
  });

  it('merges a disjoint competing CAS and retains the original mutation context on retry', async () => {
    const base = document();
    const own = complete(base);
    const originalWire = copy(own);
    const competing = complete(base, OTHER_ACTIVITY, { deviceId: 'device-two' });
    let updated = false;
    const db = database(row(base), { update: (query, rows) => {
      if (!updated) { updated = true; rows.set(A, row(reduce(base, competing).document, 1)); }
    } });
    const result = await writeAccountProgress(db.client, A, [own]);
    expect(result.revision).toBe(2);
    expect(result.document.facts.activities[ACTIVITY].evidence[0].id).toBe(own.id);
    expect(result.document.facts.activities[OTHER_ACTIVITY].evidence[0].id).toBe(competing.id);
    expect(own).toEqual(originalWire);
    expect(db.calls.filter(call => call.op === 'update').map(call => call.filters.revision)).toEqual([0, 1]);
  });

  it('rejects independent reset lineage and its dependent completion after a CAS race', async () => {
    const base = document();
    const resetA = reset(base, 'global', null, { deviceId: 'device-a' });
    const resetB = reset(base, 'global', null, { deviceId: 'device-b' });
    const dependentB = complete(reduce(base, resetB).document, ACTIVITY, { deviceId: 'device-b' });
    let resetArrived = false;
    const db = database(row(base), { update: (query, rows) => {
      if (!resetArrived) { resetArrived = true; rows.set(A, row(reduce(base, resetA).document, 1)); }
    } });
    const result = await writeAccountProgress(db.client, A, [resetB, dependentB]);
    expect(result.document.checkpoints.global).toBe(resetA.id);
    expect(result.outcomes.every(outcome => outcome.status === 'rejected' && outcome.reason === 'write-predates-reset')).toBe(true);
    expect(result.document.facts.activities).toEqual({});
    expect(result.document.receipts[dependentB.id].status).toBe('rejected');
  });

  it('bounds conflicts to three attempts and does not fabricate acknowledgement', async () => {
    const base = document();
    const db = database(row(base), { update: (query, rows) => { rows.get(A).revision++; } });
    await expect(writeAccountProgress(db.client, A, [complete(base)])).rejects.toMatchObject({ status: 409, code: 'progress-retry-conflict' });
    expect(db.calls.filter(call => call.op === 'update')).toHaveLength(3);
    expect(db.rows.get(A).document.receipts).toEqual({});
  });

  it('rejects invalid or foreign own-row documents without silently replacing them', async () => {
    for (const invalid of [{ ...row(), document: { schemaVersion: 1 } }, row(document(ACCOUNT_B)), { ...row(), revision: Number.MAX_SAFE_INTEGER + 1 }, { ...row(), updated_at: 'invalid-date' }]) {
      const db = database({ ...invalid, user_id: A });
      await expect(readAccountProgress(db.client, A)).rejects.toMatchObject({ status: 409, code: 'invalid-remote-progress' });
      await expect(writeAccountProgress(db.client, A, [complete(document())])).rejects.toMatchObject({ status: 409 });
      expect(db.calls.every(call => call.op === 'read')).toBe(true);
    }
    const databaseTimestamp = database({ ...row(), updated_at: '2026-10-03T12:00:00.123456+00:00' });
    expect((await readAccountProgress(databaseTimestamp.client, A)).updatedAt).toBe('2026-10-03T12:00:00.123Z');
  });

  it('keeps a batch atomic on ID conflict and leaves capacity-bound facts/receipts untouched', async () => {
    const base = document();
    const existing = complete(base, ACTIVITY, { id: uuid(9000) });
    const stored = reduce(base, existing).document;
    const different = complete(base, OTHER_ACTIVITY, { id: existing.id });
    const fresh = complete(base, OTHER_ACTIVITY);
    const db = database(row(stored));
    await expect(writeAccountProgress(db.client, A, [fresh, different])).rejects.toMatchObject({ status: 409, code: 'progress-mutation-conflict' });
    expect(db.rows.get(A).document).toEqual(stored);
    expect(db.calls.filter(call => call.op !== 'read')).toHaveLength(0);
    const full = document();
    full.facts.activities[ACTIVITY] = { activityId: ACTIVITY, evidence: Array.from({ length: 256 }, (_, index) => ({ id: `evidence-${index}`, kind: 'study-completed', sourceKey: 'lesson', completedAt: null })) };
    expect(validateCloudDocument(full).valid).toBe(true);
    const capped = database(row(full));
    await expect(writeAccountProgress(capped.client, A, [complete(full)])).rejects.toMatchObject({ status: 413, code: 'progress-capacity' });
    expect(capped.rows.get(A).document).toEqual(full);
  });

  it('validates bounded original wire data before accessing accessor fields, IDs or foreign payloads', () => {
    const base = document();
    const op = complete(base);
    expect(() => validateProgressBatch({ expectedAccountId: A, mutations: [op, op] }, ACCOUNT_A)).toThrow();
    expect(() => validateProgressBatch({ expectedAccountId: A, mutations: Array.from({ length: 17 }, () => op) }, ACCOUNT_A)).toThrow();
    expect(() => validateProgressBatch({ expectedAccountId: A, mutations: [complete(document(ACCOUNT_B))] }, ACCOUNT_A)).toThrow();
    const getter = vi.fn(() => { throw new Error('getter executed'); });
    const body = { expectedAccountId: A };
    Object.defineProperty(body, 'mutations', { enumerable: true, get: getter });
    expect(() => validateProgressBatch(body, ACCOUNT_A)).toThrow();
    expect(getter).not.toHaveBeenCalled();
    const forged = copy(op); forged.payload.completedAt = '2000-01-01T00:00:00Z';
    expect(() => validateProgressBatch({ expectedAccountId: A, mutations: [forged] }, ACCOUNT_A)).toThrow();
    const original = createCloudMutation({ id: uuid(9001), deviceId: 'device', context: op.context, type: 'complete', payload: op.payload });
    expect(validateProgressBatch({ expectedAccountId: A, mutations: [original] }, ACCOUNT_A)[0]).toEqual(original);
  });

  it('maps provider throttling and authorization errors without acknowledging writes', async () => {
    for (const [failure, expected] of [[{ error: { code: '42501' }, status: 403 }, 401], [{ error: { code: 'too_many_requests' }, status: 429 }, 429], [{ error: { code: 'database_down' }, status: 500 }, 503]]) {
      const db = database(row(), { error: failure });
      await expect(writeAccountProgress(db.client, A, [complete(document())])).rejects.toMatchObject({ status: expected });
      expect(db.calls.filter(call => call.op !== 'read')).toHaveLength(0);
    }
    const db = database(row(document(ACCOUNT_B)));
    expect((await readAccountProgress(db.client, B)).accountId).toBe(B);
  });
});
