import { CLOUD_LIMITS, isCloudJson, validateCloudDocument } from '@/lib/progress/cloud/schema';
import { HttpError, isAccountId, readJsonBody } from './http';
import { validateProgressBatch } from './progressProtocol';

function validateResponse(body, accountId, mutations) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => !['accountId', 'ownerScope', 'revision', 'document', 'updatedAt', 'outcomes'].includes(key)) || body.accountId !== accountId || body.ownerScope !== `account:${accountId}` || !Number.isSafeInteger(body.revision) || body.revision < 0 || !validateCloudDocument(body.document, { ownerScope: body.ownerScope }).valid || !isCloudJson(body.outcomes) || !Array.isArray(body.outcomes) || body.outcomes.length !== (mutations?.length || 0) || body.outcomes.length > CLOUD_LIMITS.batchMutations) throw new HttpError(502, 'invalid-progress-response');
  if (body.updatedAt !== null && (typeof body.updatedAt !== 'string' || !Number.isFinite(Date.parse(body.updatedAt)) || new Date(body.updatedAt).toISOString() !== body.updatedAt)) throw new HttpError(502, 'invalid-progress-response');
  for (let index = 0; index < body.outcomes.length; index++) {
    const item = body.outcomes[index];
    const original = mutations[index];
    const receipt = body.document.receipts[original.id];
    if (!item || item.id !== original.id || item.digest !== original.digest || !receipt || receipt.digest !== item.digest || receipt.status !== item.status || receipt.reason !== item.reason || typeof item.duplicate !== 'boolean' || typeof item.changed !== 'boolean' || !Array.isArray(item.skipped) || item.skipped.some(value => !value || Object.keys(value).sort().join(',') !== 'group,key,reason' || ['group', 'key', 'reason'].some(key => typeof value[key] !== 'string'))) throw new HttpError(502, 'invalid-progress-response');
  }
  return body;
}

export function createProgressTransport({ fetchImpl = fetch } = {}) {
  async function request(accountId, options, mutations) {
    if (!isAccountId(accountId)) throw new HttpError(400, 'expected-account-required');
    const response = await fetchImpl(options.body ? '/api/progress' : `/api/progress?expectedAccountId=${accountId}`, {
      credentials: 'same-origin', cache: 'no-store', ...options,
    });
    let body;
    try { body = await readJsonBody(response, CLOUD_LIMITS.documentBytes + CLOUD_LIMITS.batchBytes); }
    catch { throw new HttpError(response.ok ? 502 : response.status, response.ok ? 'invalid-progress-response' : 'progress-request-failed'); }
    if (!response.ok) {
      const error = new HttpError(response.status, typeof body?.error === 'string' ? body.error : 'progress-request-failed');
      const retry = response.headers.get('retry-after');
      const delay = /^\d+$/.test(retry || '') ? Number(retry) * 1000 : Date.parse(retry) - Date.now();
      if (Number.isFinite(delay)) error.retryAfterMs = Math.max(1000, Math.min(300000, delay));
      throw error;
    }
    return validateResponse(body, accountId, mutations);
  }
  return {
    read: ({ expectedAccountId, signal }) => request(expectedAccountId, { method: 'GET', signal }),
    write: ({ expectedAccountId, mutations, signal }) => {
      const original = validateProgressBatch({ expectedAccountId, mutations }, `account:${expectedAccountId}`);
      return request(expectedAccountId, { method: 'POST', signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expectedAccountId, mutations: original }) }, original);
    },
  };
}
