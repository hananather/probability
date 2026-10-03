import { applyCloudMutation } from '@/lib/progress/cloud/reducer';
import { createEmptyCloudDocument, validateCloudDocument } from '@/lib/progress/cloud/schema';
import { AUTH_HTTP_LIMITS, HttpError } from './http';
import { validateProgressBatch } from './progressProtocol';

export { validateProgressBatch } from './progressProtocol';

const columns = 'user_id,revision,document,updated_at';

function databaseError(result) {
  if (result.status === 429) throw new HttpError(429, 'progress-rate-limited');
  if (['42501', 'PGRST301', 'PGRST302', 'PGRST303'].includes(result.error?.code)) throw new HttpError(401, 'sign-in-required');
  throw new HttpError(503, 'progress-unavailable');
}

function validateRow(row, accountId) {
  const ownerScope = `account:${accountId}`;
  if (!row || row.user_id !== accountId || !Number.isSafeInteger(row.revision) || row.revision < 0 || typeof row.updated_at !== 'string' || !Number.isFinite(Date.parse(row.updated_at)) || !validateCloudDocument(row.document, { ownerScope }).valid) throw new HttpError(409, 'invalid-remote-progress');
  return row;
}

async function loadRow(client, accountId) {
  const result = await client.from('learning_progress').select(columns).eq('user_id', accountId).maybeSingle();
  if (result.error) databaseError(result);
  return result.data === null ? null : validateRow(result.data, accountId);
}

function response(row, accountId, outcomes = []) {
  return { accountId, ownerScope: `account:${accountId}`, revision: row.revision, document: row.document, updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null, outcomes };
}

export async function readAccountProgress(client, accountId) {
  const row = await loadRow(client, accountId);
  return response(row || { revision: 0, document: createEmptyCloudDocument({ ownerScope: `account:${accountId}` }) }, accountId);
}

export async function writeAccountProgress(client, accountId, originalMutations) {
  const ownerScope = `account:${accountId}`;
  const mutations = validateProgressBatch({ expectedAccountId: accountId, mutations: originalMutations }, ownerScope);
  for (let attempt = 0; attempt < AUTH_HTTP_LIMITS.casAttempts; attempt++) {
    const row = await loadRow(client, accountId);
    let document = row?.document || createEmptyCloudDocument({ ownerScope });
    const outcomes = [];
    try {
      for (const mutation of mutations) {
        const reduced = applyCloudMutation(document, mutation, { verifiedOwnerScope: ownerScope });
        document = reduced.document;
        outcomes.push({ id: mutation.id, digest: mutation.digest, ...reduced.outcome });
      }
    } catch (error) {
      if (error.code === 'cloud-capacity') throw new HttpError(413, 'progress-capacity');
      throw new HttpError(409, 'progress-mutation-conflict');
    }
    if (row?.revision === Number.MAX_SAFE_INTEGER) throw new HttpError(409, 'progress-revision-capacity');
    // Receipts are part of the document even when every outcome.changed is false.
    const result = row
      ? await client.from('learning_progress').update({ document, revision: row.revision + 1 }).eq('user_id', accountId).eq('revision', row.revision).select(columns).maybeSingle()
      : await client.from('learning_progress').insert({ user_id: accountId, revision: 0, document }).select(columns).maybeSingle();
    if (result.error) {
      if (!row && result.error.code === '23505') continue;
      databaseError(result);
    }
    if (result.data) return response(validateRow(result.data, accountId), accountId, outcomes);
  }
  throw new HttpError(409, 'progress-retry-conflict');
}
