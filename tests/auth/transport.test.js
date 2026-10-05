// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
import { createProgressTransport } from '@/lib/auth/transport';
import { ACCOUNT_A, ACCOUNT_B, complete, document, guest, mutation, reduce } from '../progress/cloud/helpers';
import { createGuestTransferPayload } from '@/lib/progress/cloud/projection';

beforeEach(() => { vi.stubGlobal('window', { localStorage: { clear() {} } }); });
const A = ACCOUNT_A.slice(8);
const snapshot = (ownerScope = ACCOUNT_A) => ({ accountId: ownerScope.slice(8), ownerScope, revision: 0, document: document(ownerScope), outcomes: [], updatedAt: null });
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

it('sends original immutable owner-bound payloads to fixed relative paths and propagates abort without rebasing', async () => {
  const fetchImpl = vi.fn(async () => json(snapshot()));
  const transport = createProgressTransport({ fetchImpl });
  const signal = new AbortController().signal;
  await transport.read({ expectedAccountId: A, signal });
  const op = complete(document());
  const before = JSON.stringify(op);
  const result = reduce(document(), op);
  fetchImpl.mockResolvedValueOnce(json({ ...snapshot(), document: result.document, outcomes: [{ id: op.id, digest: op.digest, ...result.outcome }] }));
  await transport.write({ expectedAccountId: A, mutations: [op], signal });
  expect(fetchImpl.mock.calls[0]).toMatchObject([`/api/progress?expectedAccountId=${A}`, { method: 'GET', signal, credentials: 'same-origin', cache: 'no-store' }]);
  expect(fetchImpl.mock.calls[1][0]).toBe('/api/progress');
  expect(JSON.parse(fetchImpl.mock.calls[1][1].body)).toEqual({ expectedAccountId: A, mutations: [op] });
  expect(JSON.stringify(op)).toBe(before);
  const aborted = new DOMException('Aborted', 'AbortError');
  fetchImpl.mockRejectedValue(aborted);
  await expect(transport.read({ expectedAccountId: A, signal })).rejects.toBe(aborted);
});

it('accepts real reducer skipped-transfer records and rejects missing/mismatched acknowledgement receipts', async () => {
  const base = document();
  const payload = createGuestTransferPayload(guest());
  const first = mutation(base, 'guest-transfer', payload);
  const current = reduce(base, first).document;
  const replay = mutation(current, 'guest-transfer', payload);
  const reduced = reduce(current, replay);
  expect(reduced.outcome.skipped[0]).toMatchObject({ group: 'transfer', reason: 'already-transferred' });
  const body = { ...snapshot(), document: reduced.document, outcomes: [{ id: replay.id, digest: replay.digest, ...reduced.outcome }] };
  const fetchImpl = vi.fn(async () => json(body));
  const transport = createProgressTransport({ fetchImpl });
  expect((await transport.write({ expectedAccountId: A, mutations: [replay] })).outcomes[0].skipped).toEqual(reduced.outcome.skipped);
  for (const invalid of [{ ...body, outcomes: [] }, { ...body, outcomes: [{ ...body.outcomes[0], id: first.id }] }, { ...body, outcomes: [{ ...body.outcomes[0], status: 'rejected', reason: 'fabricated' }] }]) {
    fetchImpl.mockResolvedValueOnce(json(invalid));
    await expect(transport.write({ expectedAccountId: A, mutations: [replay] })).rejects.toMatchObject({ status: 502 });
  }
});

it('rejects foreign/corrupt responses and preserves reconnect/retry status without materializing or acknowledging them', async () => {
  const fetchImpl = vi.fn();
  const transport = createProgressTransport({ fetchImpl });
  for (const body of [snapshot(ACCOUNT_B), { ...snapshot(), document: {} }, { ...snapshot(), revision: -1 }, { ...snapshot(), outcomes: [{}] }, { ...snapshot(), updatedAt: '2026-10-03T12:00:00+00:00' }]) {
    fetchImpl.mockResolvedValueOnce(json(body));
    await expect(transport.read({ expectedAccountId: A })).rejects.toMatchObject({ status: 502, code: 'invalid-progress-response' });
  }
  fetchImpl.mockResolvedValueOnce(json({ error: 'sign-in-required' }, 401));
  await expect(transport.read({ expectedAccountId: A })).rejects.toMatchObject({ status: 401, code: 'sign-in-required' });
  fetchImpl.mockResolvedValueOnce(json({ error: 'progress-rate-limited' }, 429, { 'Retry-After': '120' }));
  await expect(transport.read({ expectedAccountId: A })).rejects.toMatchObject({ status: 429, retryAfterMs: 120000 });
  fetchImpl.mockResolvedValueOnce(new Response('<html>failure</html>', { status: 503 }));
  await expect(transport.read({ expectedAccountId: A })).rejects.toMatchObject({ status: 503 });
  const requests = fetchImpl.mock.calls.length;
  await expect(transport.read({ expectedAccountId: 'https://evil.test' })).rejects.toMatchObject({ status: 400 });
  expect(fetchImpl).toHaveBeenCalledTimes(requests);
});
