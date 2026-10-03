'use client';

import { createBrowserClient } from '@supabase/ssr';
import { authCookieOptions, getAuthConfig } from './config';

export function getBrowserAuthClient() {
  const config = getAuthConfig();
  if (!config.available || typeof window === 'undefined') return null;
  return createBrowserClient(config.url, config.publishableKey, { cookieOptions: authCookieOptions(window.location.origin) });
}

export async function sendSignInLink(email, { client = getBrowserAuthClient(), origin = typeof window === 'undefined' ? null : window.location.origin } = {}) {
  if (!client) return { error: { code: 'not-configured' } };
  return client.auth.signInWithOtp({ email, options: { emailRedirectTo: new URL('/auth/callback', origin).href, shouldCreateUser: true } });
}
