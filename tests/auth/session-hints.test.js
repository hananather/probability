import { afterEach, expect, it, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { createAuthSessionHints } from '@/lib/auth/sessionHints';
import { A, B, activeFixture } from '../progress/active/helpers';
import { waitFor } from '@testing-library/react';

const config = { available: true, url: 'https://hint-project.supabase.co' };
const stops = [];
const clients = [];
afterEach(() => { stops.splice(0).forEach(stop => stop()); clients.splice(0).forEach(client => client.auth.dispose()); vi.unstubAllGlobals(); });
function subject() {
  const channel = new EventTarget(); channel.close = vi.fn();
  const callback = vi.fn(); const factory = vi.fn(() => channel);
  const stop = createAuthSessionHints(callback, { config, broadcastFactory: factory }); stops.push(stop);
  return { channel, callback, factory, stop, send: data => channel.dispatchEvent(new MessageEvent('message', { data })) };
}

it('opens only the configured pinned-SDK channel and strips session tokens from recognized hints', () => {
  const f = subject();
  expect(f.factory).toHaveBeenCalledWith('sb-hint-project-auth-token');
  const session = { user: { id: A, email: 'private@example.test' }, access_token: 'private-test-token', refresh_token: 'private-test-refresh', expires_at: 9999999999 };
  f.send({ event: 'SIGNED_IN', session });
  f.send({ event: 'TOKEN_REFRESHED', session });
  f.send({ event: 'SIGNED_OUT', session: null });
  expect(f.callback.mock.calls).toEqual([['SIGNED_IN', { user: { id: A } }], ['TOKEN_REFRESHED', { user: { id: A } }], ['SIGNED_OUT', null]]);
});

it('ignores malformed and unknown hints, invalid account IDs and accessors without evaluating them', () => {
  const f = subject(); const getter = vi.fn(() => 'SIGNED_IN');
  for (const data of [null, [], 'SIGNED_IN', {}, { event: 'UNKNOWN', session: { user: { id: A } } }, { event: 'SIGNED_IN', session: null }, { event: 'SIGNED_IN', session: { user: { id: 'invalid' } } }, { event: 'TOKEN_REFRESHED', session: { user: {} } }, Object.defineProperty({}, 'event', { get: getter }), { event: 'SIGNED_IN', session: { user: Object.defineProperty({}, 'id', { get: getter }) } }]) f.send(data);
  expect(f.callback).not.toHaveBeenCalled(); expect(getter).not.toHaveBeenCalled();
});

it('closes and removes its listener exactly once and never forwards after cleanup', () => {
  const f = subject(); f.stop(); f.stop();
  f.send({ event: 'SIGNED_IN', session: { user: { id: A } } });
  expect(f.channel.close).toHaveBeenCalledTimes(1); expect(f.callback).not.toHaveBeenCalled();
});

it('does not create a channel for missing configuration or SSR', () => {
  const callback = vi.fn(), factory = vi.fn();
  createAuthSessionHints(callback, { config: { available: false }, broadcastFactory: factory })();
  const currentWindow = globalThis.window;
  try {
    vi.stubGlobal('window', undefined);
    createAuthSessionHints(callback, { config, broadcastFactory: factory })();
  } finally { vi.stubGlobal('window', currentWindow); }
  expect(factory).not.toHaveBeenCalled(); expect(callback).not.toHaveBeenCalled();
});

it('permits focus/reconnect fallback when BroadcastChannel is absent or construction fails', () => {
  const callback = vi.fn();
  vi.stubGlobal('BroadcastChannel', undefined);
  expect(() => createAuthSessionHints(callback, { config })()).not.toThrow();
  expect(() => createAuthSessionHints(callback, { config, broadcastFactory: () => { throw new Error('unsupported'); } })()).not.toThrow();
  expect(callback).not.toHaveBeenCalled();
});

it('consumes actual pinned-SDK SIGNED_IN and SIGNED_OUT broadcasts through public auth operations and ignores other projects', async () => {
  const channels = new Set();
  class Channel extends EventTarget {
    constructor(name) { super(); this.name = name; channels.add(this); }
    postMessage(data) { for (const peer of channels) if (peer !== this && peer.name === this.name) queueMicrotask(() => peer.dispatchEvent(new MessageEvent('message', { data }))); }
    close() { channels.delete(this); }
  }
  vi.stubGlobal('BroadcastChannel', Channel);
  const callback = vi.fn(); const stop = createAuthSessionHints(callback, { config }); stops.push(stop);
  const wrong = new Channel('sb-other-project-auth-token');
  wrong.postMessage({ event: 'SIGNED_IN', session: { user: { id: A } } }); await Promise.resolve();
  expect(callback).not.toHaveBeenCalled(); wrong.close();
  const factory = vi.fn();
  const controller = activeFixture({ getAuthClient: factory, listenAuthHints: hint => createAuthSessionHints(hint, { config }) });
  stops.push(() => controller.dispose()); factory.mockReturnValue(controller.authClient);
  await controller.controller.start();
  expect(controller.controller.getSnapshot().account).toBeNull(); expect(factory).not.toHaveBeenCalled();
  controller.setAccount(B);
  const data = new Map();
  const requests = [];
  const client = createClient(config.url, 'sb_publishable_testingOnly123456789', {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, storage: { getItem: key => data.get(key) ?? null, setItem: (key, entry) => data.set(key, entry), removeItem: key => data.delete(key) } },
    global: { fetch: async (url, options) => { requests.push({ url: String(url), options }); return new Response(JSON.stringify(String(url).includes('/user') ? { id: A, aud: 'authenticated', email: 'private@example.test' } : {}), { status: 200, headers: { 'content-type': 'application/json' } }); } },
  }); clients.push(client);
  const encoded = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const access_token = `${encoded({ alg: 'HS256', typ: 'JWT' })}.${encoded({ sub: A, aud: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })}.${Buffer.from('testing-signature').toString('base64url')}`;
  expect((await client.auth.setSession({ access_token, refresh_token: 'private-test-refresh' })).error).toBeNull();
  await Promise.resolve();
  const signedIn = callback.mock.calls.filter(([event]) => event === 'SIGNED_IN');
  expect(signedIn).toEqual([['SIGNED_IN', { user: { id: A } }]]);
  await waitFor(() => expect(controller.controller.getSnapshot().account?.id).toBe(B));
  expect(controller.accounts.has(A)).toBe(false);
  expect(controller.requests.filter(request => request.path === '/api/auth/session')).toHaveLength(2);
  expect(factory).toHaveBeenCalledTimes(1);
  expect(requests.some(request => request.url.endsWith('/auth/v1/user'))).toBe(true);
  expect([...channels].map(channel => channel.name)).toEqual(['sb-hint-project-auth-token', 'sb-hint-project-auth-token']);
  expect((await client.auth.signOut({ scope: 'local' })).error).toBeNull(); await Promise.resolve();
  expect(callback.mock.calls.filter(([event]) => event === 'SIGNED_OUT')).toEqual([['SIGNED_OUT', null]]);
  expect(JSON.stringify(callback.mock.calls)).not.toContain(access_token);
  expect(JSON.stringify(callback.mock.calls)).not.toContain('private-test-refresh');
});
