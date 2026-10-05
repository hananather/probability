// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { authCookieOptions, getAuthConfig } from '@/lib/auth/config';
import { applyAuthResponse, createRequestAuth, requireVerifiedUser } from '@/lib/auth/server';
import { readJsonBody, requireSameOrigin } from '@/lib/auth/http';
import { GET as session } from '@/app/api/auth/session/route';
import { GET as callback } from '@/app/auth/callback/route';
import { POST as signout } from '@/app/api/auth/signout/route';
import { GET as progressGet, POST as progressPost } from '@/app/api/progress/route';
import { config as matcher, middleware } from '@/middleware';
import { complete, copy, document } from '../progress/cloud/helpers';

const sdk = vi.hoisted(() => ({ client: null, options: [] }));
vi.mock('@supabase/ssr', () => ({ createServerClient: vi.fn((url, key, options) => { sdk.options.push(options); return sdk.client; }) }));
const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const origin = 'http://127.0.0.1:3000';
const user = { id: A, email: 'learner@example.test', email_confirmed_at: '2026-10-03T12:00:00Z', is_anonymous: false };
const request = (path, body, headers = {}) => new NextRequest(`${origin}${path}`, { ...(body !== undefined ? { method: 'POST', body: JSON.stringify(body), headers: { host: '127.0.0.1:3000', origin, 'content-type': 'application/json', ...headers } } : { headers }) });

beforeEach(() => {
  vi.stubGlobal('window', { localStorage: { clear() {} } });
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_testingOnly123456789');
  sdk.options = [];
  sdk.client = { auth: {
    getUser: vi.fn(async () => ({ data: { user }, error: null })),
    getSession: vi.fn(async () => ({ data: { session: { user, expires_at: 1791028800, access_token: 'never-return-token', refresh_token: 'never-return-refresh' } } })),
    getClaims: vi.fn(async () => ({ data: { claims: { sub: A, exp: 1791028800 } }, error: null })),
    exchangeCodeForSession: vi.fn(async () => ({ error: null })),
    signOut: vi.fn(async () => ({ error: null })),
  }, from: vi.fn(() => { throw new Error('unexpected database access'); }) };
});

describe('auth configuration and HTTP boundaries', () => {
  it('keeps missing configuration guest-capable and rejects secret/malformed/nonlocal HTTP configuration', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    const response = await session(request('/api/auth/session'));
    expect(await response.json()).toMatchObject({ configured: false, account: null, status: 'guest' });
    expect(sdk.options).toHaveLength(0);
    expect(response.headers.get('cache-control')).toContain('no-store');
    for (const config of [
      { url: 'http://example.org', publishableKey: 'sb_publishable_testingOnly123456789' },
      { url: 'https://example.org', publishableKey: 'sb_secret_doNotExpose' },
      { url: 'https://person:password@example.org', publishableKey: 'sb_publishable_testingOnly123456789' },
      { url: 'https://example.org?return=https://evil.test', publishableKey: 'sb_publishable_testingOnly123456789' },
    ]) expect(getAuthConfig(config).available).toBe(false);
    const token = role => `header.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.signature`;
    expect(getAuthConfig({ url: 'https://example.org', publishableKey: token('anon') }).available).toBe(true);
    expect(getAuthConfig({ url: 'https://example.org', publishableKey: token('service_role') }).available).toBe(false);
    expect(authCookieOptions(origin)).toMatchObject({ sameSite: 'lax', secure: false });
    expect(authCookieOptions('https://learn.example')).toMatchObject({ secure: true });
  });

  it('verifies fresh identity before reading session metadata and never returns tokens', async () => {
    const response = await session(request('/api/auth/session'));
    expect(await response.json()).toEqual({ configured: true, status: 'authenticated', account: { id: A, email: user.email, expiresAt: 1791028800000 } });
    expect(sdk.client.auth.getUser).toHaveBeenCalledOnce();
    expect(sdk.client.auth.getUser.mock.invocationCallOrder[0]).toBeLessThan(sdk.client.auth.getClaims.mock.invocationCallOrder[0]);
    const getClaims = sdk.client.auth.getClaims;
    getClaims.mockClear();
    sdk.client.auth.getUser.mockResolvedValue({ data: { user: null }, error: { status: 401 } });
    const invalid = await session(request('/api/auth/session', undefined, { cookie: 'sb-forged=made-up' }));
    expect(await invalid.json()).toMatchObject({ account: null, status: 'guest' });
    expect(getClaims).not.toHaveBeenCalled();
    expect(sdk.client.auth.getSession).not.toHaveBeenCalled();
  });

  it('rejects anonymous/unconfirmed accounts and reports Auth outage rather than inventing a guest save', async () => {
    for (const override of [{ is_anonymous: true }, { email_confirmed_at: null }]) {
      sdk.client.auth.getUser.mockResolvedValue({ data: { user: { ...user, ...override } }, error: null });
      await expect(requireVerifiedUser(createRequestAuth(request('/api/auth/session')))).rejects.toMatchObject({ status: 401 });
    }
    sdk.client.auth.getUser.mockResolvedValue({ data: { user: null }, error: { status: 503 } });
    expect((await session(request('/api/auth/session'))).status).toBe(503);
    sdk.client.auth.getUser.mockResolvedValue({ data: { user: null }, error: { status: 429 } });
    const limited = await session(request('/api/auth/session'));
    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toBe('60');
  });

  it('uses only verified matching JWT expiry for offline metadata', async () => {
    sdk.client.auth.getClaims.mockResolvedValue({ data: { claims: { sub: B, exp: 9999999999 } }, error: null });
    const mismatch = await session(request('/api/auth/session'));
    expect((await mismatch.json()).account).toMatchObject({ id: A, expiresAt: null });
    expect(sdk.client.auth.getSession).not.toHaveBeenCalled();
  });

  it('returns all updated cookies including expiry and forwards the latest request cookie through scoped middleware', async () => {
    sdk.client.auth.getUser.mockImplementation(async () => {
      const options = sdk.options.at(-1);
      options.cookies.setAll([{ name: 'sb-old', value: '', options: { maxAge: 0, path: '/' } }], { 'Cache-Control': 'private, no-store' });
      options.cookies.setAll([{ name: 'sb-new', value: 'refreshed', options: { path: '/', sameSite: 'lax' } }], {});
      expect(options.cookies.getAll()).toContainEqual({ name: 'sb-new', value: 'refreshed' });
      return { data: { user }, error: null };
    });
    const response = await middleware(request('/api/auth/session', undefined, { cookie: 'sb-old=stale' }));
    expect(response.cookies.get('sb-new')?.value).toBe('refreshed');
    expect(response.cookies.get('sb-old')?.value).toBe('');
    expect(response.headers.get('x-middleware-request-cookie')).toContain('sb-new=refreshed');
    expect(response.headers.get('cache-control')).toContain('private');
    expect(response.headers.get('cdn-cache-control')).toBe('no-store');
    expect(matcher.matcher).toEqual(['/auth/:path*', '/api/auth/:path*', '/api/progress/:path*']);
    const auth = createRequestAuth(request('/api/auth/session'));
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'));
    await sdk.options.at(-1).global.fetch('https://example.org/auth/v1/user', { cache: 'force-cache' });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ cache: 'no-store' });
    expect(applyAuthResponse(NextResponse.json({}), auth).headers.get('vary')).toBe('Cookie');
  });

  it('fixes callback destination and carries exchanged session cookies through success and failure', async () => {
    sdk.client.auth.exchangeCodeForSession.mockImplementation(async () => {
      sdk.options.at(-1).cookies.setAll([{ name: 'sb-auth', value: 'session-cookie', options: { path: '/' } }], {});
      return { error: null };
    });
    const response = await callback(request('/auth/callback?code=one-use-code&next=https://evil.test&returnTo=//evil.test'));
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/progress');
    expect(response.cookies.get('sb-auth')?.value).toBe('session-cookie');
    sdk.client.auth.exchangeCodeForSession.mockResolvedValue({ error: { code: 'flow_state_not_found' } });
    const reused = await callback(request('/auth/callback?code=one-use-code'));
    expect(reused.headers.get('location')).toBe('/auth/sign-in?error=callback_failed');
    const count = sdk.client.auth.exchangeCodeForSession.mock.calls.length;
    expect((await callback(request('/auth/callback?error=access_denied&code=ignored'))).headers.get('location')).toContain('callback_failed');
    expect(sdk.client.auth.exchangeCodeForSession).toHaveBeenCalledTimes(count);
  });

  it('checks same-origin and expected owner before progress access or local sign-out', async () => {
    for (const headers of [{ origin: 'https://evil.test', 'x-forwarded-host': 'evil.test' }, { origin: 'null' }, { origin, 'sec-fetch-site': 'cross-site' }]) {
      expect((await progressPost(request('/api/progress', { expectedAccountId: A, mutations: [] }, headers))).status).toBe(403);
      expect((await signout(request('/api/auth/signout', { expectedAccountId: A }, headers))).status).toBe(403);
    }
    expect(() => requireSameOrigin(new Request(`${origin}/api/progress`, { method: 'POST' }))).toThrow();
    expect((await progressGet(request(`/api/progress?expectedAccountId=${B}`))).status).toBe(409);
    expect((await progressPost(request('/api/progress', { expectedAccountId: B, mutations: [] }))).status).toBe(409);
    expect((await signout(request('/api/auth/signout', { expectedAccountId: B }))).status).toBe(409);
    expect(sdk.client.from).not.toHaveBeenCalled();
    expect(sdk.client.auth.signOut).not.toHaveBeenCalled();
    const response = await signout(request('/api/auth/signout', { expectedAccountId: A }));
    expect(await response.json()).toEqual({ accountId: A, signedOut: true });
    expect(sdk.client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('bounds streamed bodies without trusting content-length and rejects malformed UTF-8/JSON/media types', async () => {
    const large = new Request(`${origin}/api/progress`, { method: 'POST', headers: { 'content-type': 'application/json', 'content-length': '1' }, body: '"' + 'é'.repeat(100) + '"' });
    await expect(readJsonBody(large, 20)).rejects.toMatchObject({ status: 413 });
    await expect(readJsonBody(new Request(`${origin}/api/progress`, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}' }))).rejects.toMatchObject({ status: 415 });
    for (const body of ['{broken', new Uint8Array([0xff, 0xfe])]) await expect(readJsonBody(new Request(`${origin}/api/progress`, { method: 'POST', headers: { 'content-type': 'application/json' }, body }))).rejects.toMatchObject({ status: 400 });
  });

  it('round-trips a validated mutation through the actual HTTP handler with owner-bound evidence and cookies', async () => {
    let stored = null;
    sdk.client.from.mockImplementation(() => {
      let operation = 'read';
      let payload;
      const query = {
        select: () => query, eq: () => query,
        insert: value => { operation = 'insert'; payload = value; return query; },
        update: value => { operation = 'update'; payload = value; return query; },
        maybeSingle: async () => {
          if (operation !== 'read') stored = { ...stored, ...copy(payload), updated_at: '2026-10-03T12:00:00Z' };
          return { data: stored ? copy(stored) : null, error: null };
        },
      };
      return query;
    });
    sdk.client.auth.getUser.mockImplementation(async () => {
      sdk.options.at(-1).cookies.setAll([{ name: 'sb-refreshed', value: 'verified-cookie', options: { path: '/' } }], {});
      return { data: { user }, error: null };
    });
    const op = complete(document());
    const response = await progressPost(request('/api/progress', { expectedAccountId: A, mutations: [op] }));
    expect(response.status).toBe(200);
    expect(response.cookies.get('sb-refreshed')?.value).toBe('verified-cookie');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
    const body = await response.json();
    expect(body).toMatchObject({ accountId: A, ownerScope: `account:${A}`, revision: 0, outcomes: [{ id: op.id, status: 'applied' }] });
    expect(body.document.receipts[op.id].digest).toBe(op.digest);
    const reloaded = await progressGet(request(`/api/progress?expectedAccountId=${A}`));
    expect((await reloaded.json()).document).toEqual(body.document);
    expect(sdk.client.auth.getSession).not.toHaveBeenCalled();
  });
});
