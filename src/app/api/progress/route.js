import { authJson, createRequestAuth, requireVerifiedUser } from '@/lib/auth/server';
import { errorPayload, readJsonBody, requireExpectedAccount, requireSameOrigin } from '@/lib/auth/http';
import { readAccountProgress, validateProgressBatch, writeAccountProgress } from '@/lib/auth/progressAdapter';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = createRequestAuth(request);
  try {
    const user = await requireVerifiedUser(auth);
    requireExpectedAccount(new URL(request.url).searchParams.get('expectedAccountId'), user);
    return authJson(await readAccountProgress(auth.client, user.id), { auth });
  } catch (error) {
    const failure = errorPayload(error);
    return authJson(failure.body, { auth, status: failure.status, headers: failure.headers });
  }
}

export async function POST(request) {
  let auth;
  try {
    requireSameOrigin(request);
    const body = await readJsonBody(request);
    auth = createRequestAuth(request);
    const user = await requireVerifiedUser(auth);
    const ownerScope = requireExpectedAccount(body?.expectedAccountId, user);
    const mutations = validateProgressBatch(body, ownerScope);
    return authJson(await writeAccountProgress(auth.client, user.id, mutations), { auth });
  } catch (error) {
    const failure = errorPayload(error);
    return authJson(failure.body, { auth, status: failure.status, headers: failure.headers });
  }
}
