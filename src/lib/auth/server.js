import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { authCookieOptions, getAuthConfig } from './config';
import { HttpError, PRIVATE_HEADERS } from './http';

export function createRequestAuth(request, { config = getAuthConfig(), createClient = createServerClient } = {}) {
  const writes = new Map();
  const cacheHeaders = {};
  const cookies = new Map(request.cookies.getAll().map(cookie => [cookie.name, cookie.value]));
  const client = config.available ? createClient(config.url, config.publishableKey, {
    cookieOptions: authCookieOptions(request.url),
    global: { fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store', signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000) }) },
    cookies: {
      getAll: () => Array.from(cookies, ([name, value]) => ({ name, value })),
      setAll: (values, headers = {}) => {
        for (const cookie of values) {
          cookies.set(cookie.name, cookie.value);
          writes.set(cookie.name, cookie);
          request.cookies.set(cookie.name, cookie.value);
        }
        Object.assign(cacheHeaders, headers);
      },
    },
  }) : null;
  return { client, config, writes, cacheHeaders };
}

export function applyAuthResponse(response, auth) {
  for (const cookie of auth?.writes?.values() || []) response.cookies.set(cookie.name, cookie.value, cookie.options);
  for (const [name, value] of Object.entries(auth?.cacheHeaders || {})) response.headers.set(name, value);
  for (const [name, value] of Object.entries(PRIVATE_HEADERS)) response.headers.set(name, value);
  return response;
}

export function authJson(body, { status = 200, auth, headers } = {}) {
  return applyAuthResponse(NextResponse.json(body, { status, headers }), auth);
}

export function authRedirect(path, auth) {
  return applyAuthResponse(new NextResponse(null, { status: 303, headers: { Location: path } }), auth);
}

export async function requireVerifiedUser(auth) {
  if (!auth.client) throw new HttpError(503, 'accounts-not-configured');
  const { data, error } = await auth.client.auth.getUser();
  if (error || !data?.user) {
    if (error?.status === 429) throw new HttpError(429, 'auth-rate-limited');
    if (error && (!error.status || error.status >= 500)) throw new HttpError(503, 'auth-unavailable');
    throw new HttpError(401, 'sign-in-required');
  }
  const user = data.user;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(user.id) || user.is_anonymous || !user.email_confirmed_at) throw new HttpError(401, 'confirmed-account-required');
  return user;
}
