import { NextResponse } from 'next/server';
import { applyAuthResponse, createRequestAuth } from '@/lib/auth/server';

export async function middleware(request) {
  const auth = createRequestAuth(request);
  if (auth.client) {
    try { await auth.client.auth.getUser(); }
    catch { /* Account routes report availability; public lessons remain independent. */ }
  }
  return applyAuthResponse(NextResponse.next({ request }), auth);
}

export const config = { matcher: ['/auth/:path*', '/api/auth/:path*', '/api/progress/:path*'] };
