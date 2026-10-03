import { authRedirect, createRequestAuth, requireVerifiedUser } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = createRequestAuth(request);
  if (!auth.client) return authRedirect('/auth/sign-in?error=not_configured', auth);
  const params = new URL(request.url).searchParams;
  const code = params.get('code');
  if (params.has('error') || !code || code.length > 2048) return authRedirect('/auth/sign-in?error=callback_failed', auth);
  try {
    const { error } = await auth.client.auth.exchangeCodeForSession(code);
    if (error) throw error;
    await requireVerifiedUser(auth);
    return authRedirect('/progress', auth);
  } catch { return authRedirect('/auth/sign-in?error=callback_failed', auth); }
}
