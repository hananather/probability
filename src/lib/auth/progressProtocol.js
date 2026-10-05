import { CLOUD_LIMITS, canonicalJson, cloneCloudValue, isCloudJson, validateCloudMutation } from '@/lib/progress/cloud/schema';
import { HttpError } from './http';

export function validateProgressBatch(body, ownerScope) {
  if (!isCloudJson(body) || !body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => !['expectedAccountId', 'mutations'].includes(key)) || !Array.isArray(body.mutations) || body.mutations.length === 0 || body.mutations.length > CLOUD_LIMITS.batchMutations) throw new HttpError(400, 'invalid-progress-batch');
  if (new TextEncoder().encode(canonicalJson(body)).byteLength > CLOUD_LIMITS.batchBytes) throw new HttpError(413, 'payload-too-large');
  const ids = new Set();
  for (const mutation of body.mutations) {
    if (!validateCloudMutation(mutation).valid || mutation.ownerScope !== ownerScope || ids.has(mutation.id)) throw new HttpError(400, 'invalid-progress-mutation');
    ids.add(mutation.id);
  }
  return cloneCloudValue(body.mutations);
}
