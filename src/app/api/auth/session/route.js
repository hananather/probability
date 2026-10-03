import { authJson, createRequestAuth, requireVerifiedUser } from '@/lib/auth/server';
import { errorPayload, HttpError } from '@/lib/auth/http';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = createRequestAuth(request);
  if (!auth.client) return authJson({ configured: false, account: null, status: 'guest', reason: auth.config.reason }, { auth });
  try {
    const user = await requireVerifiedUser(auth);
    const { data } = await auth.client.auth.getClaims();
    const claims = data?.claims;
    const expiresAt = claims?.sub === user.id && Number.isSafeInteger(claims.exp) ? claims.exp * 1000 : null;
    return authJson({ configured: true, account: { id: user.id, email: user.email || null, expiresAt }, status: 'authenticated' }, { auth });
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) return authJson({ configured: true, account: null, status: 'guest' }, { auth });
    const failure = errorPayload(error);
    return authJson({ ...failure.body, configured: true, account: null, status: 'unavailable' }, { auth, status: failure.status, headers: failure.headers });
  }
}
