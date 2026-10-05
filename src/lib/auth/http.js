export const PRIVATE_HEADERS = Object.freeze({
  'Cache-Control': 'private, no-store, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
  Vary: 'Cookie',
});
export const AUTH_HTTP_LIMITS = Object.freeze({ bodyBytes: 2 * 1024 * 1024, batchSize: 16, casAttempts: 3 });
export const isAccountId = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);

export class HttpError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}

export function requireSameOrigin(request) {
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  const url = new URL(request.url);
  const host = request.headers.get('host');
  // Next normalizes loopback URL names; Host retains the browser's actual authority.
  if (host) {
    if (!/^[a-zA-Z0-9.\[\]:-]+$/.test(host)) throw new HttpError(403, 'origin-mismatch');
    try { url.host = new URL(`${url.protocol}//${host}`).host; }
    catch { throw new HttpError(403, 'origin-mismatch'); }
  }
  if (!origin || origin !== url.origin || (fetchSite && !['same-origin', 'none'].includes(fetchSite))) throw new HttpError(403, 'origin-mismatch');
}

export async function readJsonBody(request, limit = AUTH_HTTP_LIMITS.bodyBytes) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) throw new HttpError(415, 'json-required');
  const declared = request.headers.get('content-length');
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > limit)) throw new HttpError(413, 'payload-too-large');
  if (!request.body) throw new HttpError(400, 'invalid-json');
  const reader = request.body.getReader();
  const chunks = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > limit) { await reader.cancel(); throw new HttpError(413, 'payload-too-large'); }
      chunks.push(value);
    }
    const combined = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(combined));
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, 'invalid-json');
  } finally { reader.releaseLock(); }
}

export function requireExpectedAccount(value, user) {
  if (!isAccountId(value)) throw new HttpError(400, 'expected-account-required');
  if (value !== user.id) throw new HttpError(409, 'account-mismatch');
  return `account:${value}`;
}

export function errorPayload(error) {
  if (error instanceof HttpError) return { status: error.status, body: { error: error.code }, ...(error.status === 429 ? { headers: { 'Retry-After': '60' } } : {}) };
  return { status: 503, body: { error: 'temporarily-unavailable' } };
}
