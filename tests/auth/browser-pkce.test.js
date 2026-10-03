import { beforeEach, expect, it, vi } from 'vitest';
import { getBrowserAuthClient, sendSignInLink } from '@/lib/auth/browser';

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_testingOnly123456789');
});

it('uses the actual pinned SDK PKCE request and browser verifier cookie with a fixed callback', async () => {
  const requests = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, options) => {
    requests.push({ url: String(url), options });
    return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
  });
  const client = getBrowserAuthClient();
  const result = await sendSignInLink('learner@example.test', { client, origin: 'http://127.0.0.1:3000' });
  expect(result.error).toBeNull();
  const otp = requests.find(item => item.url.includes('/auth/v1/otp'));
  const body = JSON.parse(otp.options.body);
  expect(body).toMatchObject({ email: 'learner@example.test', create_user: true, code_challenge_method: 's256' });
  expect(body.code_challenge).toMatch(/^[a-zA-Z0-9_-]{43}$/);
  expect(new URL(otp.url).searchParams.get('redirect_to')).toBe('http://127.0.0.1:3000/auth/callback');
  expect(document.cookie).toContain('code-verifier=');
  expect(getBrowserAuthClient()).toBe(client);
  await client.auth.stopAutoRefresh();
});
