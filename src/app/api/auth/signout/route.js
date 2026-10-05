import { authJson, createRequestAuth, requireVerifiedUser } from '@/lib/auth/server';
import { errorPayload, readJsonBody, requireExpectedAccount, requireSameOrigin } from '@/lib/auth/http';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let auth;
  try {
    requireSameOrigin(request);
    const body = await readJsonBody(request, 1024);
    auth = createRequestAuth(request);
    const user = await requireVerifiedUser(auth);
    requireExpectedAccount(body?.expectedAccountId, user);
    const { error } = await auth.client.auth.signOut({ scope: 'local' });
    if (error) throw error;
    return authJson({ accountId: user.id, signedOut: true }, { auth });
  } catch (error) {
    const failure = errorPayload(error);
    return authJson(failure.body, { auth, status: failure.status, headers: failure.headers });
  }
}
