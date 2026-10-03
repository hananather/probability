const loopback = new Set(['localhost', '127.0.0.1', '[::1]']);

function isPublishableKey(key) {
  if (/^sb_publishable_[a-zA-Z0-9_-]{16,}$/.test(key)) return true;
  try {
    const payload = key.split('.')[1];
    if (!payload) return false;
    const encoded = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(encoded)).role === 'anon';
  } catch { return false; }
}

export function getAuthConfig({
  url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
} = {}) {
  if (!url || !publishableKey) return { available: false, reason: 'not-configured' };
  try {
    const parsed = new URL(url);
    if ((parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && loopback.has(parsed.hostname))) || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/' || publishableKey.length > 8192 || !isPublishableKey(publishableKey)) {
      return { available: false, reason: 'invalid-configuration' };
    }
    return { available: true, url: parsed.origin, publishableKey };
  } catch { return { available: false, reason: 'invalid-configuration' }; }
}

export function authCookieOptions(origin) {
  return { path: '/', sameSite: 'lax', secure: new URL(origin).protocol === 'https:' };
}
