import { getAuthConfig } from './config';
import { isAccountId } from './http';

const events = new Set(['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'USER_UPDATED', 'PASSWORD_RECOVERY', 'MFA_CHALLENGE_VERIFIED']);
const value = (object, key) => object && typeof object === 'object' && !Array.isArray(object) ? Object.getOwnPropertyDescriptor(object, key)?.value : undefined;

/** Passive pinned-SDK notifications; account activation still requires server verification. */
export function createAuthSessionHints(onHint, { config = getAuthConfig(), broadcastFactory = name => new globalThis.BroadcastChannel(name) } = {}) {
  if (typeof window === 'undefined' || !config.available || typeof onHint !== 'function') return () => {};
  let channel;
  try { channel = broadcastFactory(`sb-${new URL(config.url).hostname.split('.')[0]}-auth-token`); } catch { return () => {}; }
  let closed = false;
  const onMessage = message => {
    if (closed) return;
    const event = value(message.data, 'event');
    if (!events.has(event)) return;
    const session = value(message.data, 'session');
    if (session === null && ['INITIAL_SESSION', 'SIGNED_OUT'].includes(event)) { onHint(event, null); return; }
    const id = value(value(session, 'user'), 'id');
    if (isAccountId(id)) onHint(event, { user: { id } });
  };
  try { channel.addEventListener('message', onMessage); } catch { channel?.close?.(); return () => {}; }
  return () => { if (closed) return; closed = true; channel.removeEventListener('message', onMessage); channel.close(); };
}
