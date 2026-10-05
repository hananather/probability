import { HttpError, isAccountId, readJsonBody } from '@/lib/auth/http';
import { createAuthSessionHints } from '@/lib/auth/sessionHints';
import { createProgressTransport } from '@/lib/auth/transport';
import { createEmptyProgress } from './schema';
import { createAccountProgressStore, getLocalProgressStore } from './store';
import { createAccountSyncCoordinator } from './cloud/sync';
import { setActiveProgressBinding } from './activeBinding';

export const ACTIVE_PROGRESS_SERVER_SNAPSHOT = Object.freeze({
  store: null, generation: 0, account: null, configured: false,
  sessionStatus: 'checking', sessionError: null,
  signingOut: false,
  state: Object.freeze({ data: createEmptyProgress({ ownerScope: 'guest:loading', deviceId: 'loading' }), loading: true, error: null, persistenceStatus: 'loading', pendingLocalWrites: 0 }),
});

const sessionMessage = 'Account verification is unavailable. Your account data and queued changes are retained.';
const needsConnection = 'Reconnect to your account to continue saving account progress. Your queued changes are retained.';
let browserModule;
function loadBrowserAuthFactory() {
  if (!browserModule) browserModule = import('@/lib/auth/browser').catch(error => { browserModule = undefined; throw error; });
  return browserModule.then(module => module.getBrowserAuthClient);
}

/** Only the verified session endpoint can activate an account namespace. */
export function createActiveProgressController({
  fetchImpl = (...args) => fetch(...args),
  getGuestStore = () => getLocalProgressStore(),
  createAccountStore = accountId => createAccountProgressStore({ accountId }),
  getAuthClient,
  loadAuthClient = loadBrowserAuthFactory,
  listenAuthHints = createAuthSessionHints,
  createTransport = () => createProgressTransport({ fetchImpl }),
  createCoordinator = createAccountSyncCoordinator,
  eventTarget = typeof window === 'undefined' ? null : window,
  now = () => Date.now(),
  schedule = (callback, delay) => setTimeout(callback, delay),
  cancel = timer => clearTimeout(timer),
} = {}) {
  let snapshot = ACTIVE_PROGRESS_SERVER_SNAPSHOT;
  let started = false;
  let lifecycle = 0;
  let generation = 0;
  let checkSequence = 0;
  let authority = null;
  let store = null;
  let guest = null;
  let coordinator = null;
  let authClient = null;
  let unsubscribeStore;
  let authSubscription;
  let stopAuthHints;
  let authLoad;
  let releaseBinding;
  let sessionAbort;
  let expiryTimer;
  let retryTimer;
  let retries = 0;
  let localSignOut = false;
  let signOutPending = false;
  let queuedCheck = false;
  let queuedSync = false;
  let transferPreview = null;
  let syncFailure = null;
  const accounts = new Map();
  const listeners = new Set();
  const knownExpiredAuthority = () => authority && Number.isSafeInteger(authority.expiresAt) && authority.expiresAt <= now();
  function validAuthority() {
    if (!knownExpiredAuthority()) return true;
    detach('reconnect', needsConnection);
    queueCheck();
    return false;
  }
  const current = (capturedStore, capturedGeneration) => started && validAuthority() && store === capturedStore && generation === capturedGeneration;
  const hasUnexpiredAuthority = () => authority && Number.isSafeInteger(authority.expiresAt) && authority.expiresAt > now();
  const isAccountCurrent = ({ accountId, generation: expectedGeneration }) => started && validAuthority() && generation === expectedGeneration && authority?.id === accountId && !localSignOut;

  function publish(patch = {}) {
    snapshot = Object.freeze({ ...snapshot, ...patch, store, generation, signingOut: signOutPending, state: store?.getSnapshot() || ACTIVE_PROGRESS_SERVER_SNAPSHOT.state });
    const selectedStore = store;
    const selectedGeneration = generation;
    releaseBinding?.();
    releaseBinding = setActiveProgressBinding({ store, generation, isCurrent: () => current(selectedStore, selectedGeneration), retrySync: () => current(selectedStore, selectedGeneration) ? sync() : false });
    listeners.forEach(listener => listener());
  }
  function subscribeStore(next, patch = {}) {
    if (store === next && unsubscribeStore) { publish(patch); return; }
    unsubscribeStore?.();
    store = next;
    snapshot = { ...snapshot, ...patch };
    const selected = next;
    unsubscribeStore = next.subscribe(() => {
      if (!started || store !== selected) return;
      publish();
      const cloud = selected.getSnapshot().cloud;
      if (authority && coordinator && !syncFailure && cloud?.pendingMutations && (cloud.status === 'pending' || cloud.pendingSyncAllowed) && !queuedSync) {
        queuedSync = true;
        queueMicrotask(() => { queuedSync = false; if (started && store === selected) void sync({ automatic: true }); });
      }
    });
    publish();
  }
  function clearTimers() {
    cancel(expiryTimer); cancel(retryTimer); expiryTimer = undefined; retryTimer = undefined;
  }
  function detach(sessionStatus = 'guest', sessionError = null) {
    checkSequence++; generation++;
    sessionAbort?.abort(); coordinator?.detach(); coordinator = null;
    authority = null; transferPreview = null; syncFailure = null; clearTimers(); retries = 0;
    if (guest) subscribeStore(guest, { account: null, sessionStatus, sessionError });
    else publish({ account: null, sessionStatus, sessionError });
  }
  function setExpiry() {
    cancel(expiryTimer);
    if (!Number.isSafeInteger(authority?.expiresAt)) return;
    const capturedGeneration = generation;
    expiryTimer = schedule(() => {
      if (!started || generation !== capturedGeneration) return;
      if (hasUnexpiredAuthority()) { setExpiry(); return; }
      detach('reconnect', needsConnection);
      queueCheck();
    }, Math.max(0, Math.min(2147483647, authority.expiresAt - now())));
  }
  function retryLater(error, capturedGeneration) {
    if (!started || capturedGeneration !== generation || !hasUnexpiredAuthority() || retries >= 6 || error?.status && ![429, 500, 502, 503, 504].includes(error.status)) return;
    cancel(retryTimer);
    const delay = Math.max(error?.retryAfterMs || 0, Math.min(300000, 30000 * 2 ** retries++));
    retryTimer = schedule(() => { if (started && generation === capturedGeneration) void sync({ automatic: true }); }, delay);
  }
  function ownerTransport(capturedGeneration) {
    const transport = createTransport();
    const wrap = method => async options => {
      if (!isAccountCurrent({ accountId: options.expectedAccountId, generation: capturedGeneration })) throw new DOMException('Account binding changed', 'AbortError');
      try { return await transport[method](options); }
      catch (error) {
        if (generation === capturedGeneration && started) {
          syncFailure = error;
          if (error?.status === 401 || error?.code === 'account-mismatch') {
            detach('reconnect', needsConnection);
          } else if ((!error?.status || [429, 500, 502, 503, 504].includes(error.status)) && !hasUnexpiredAuthority()) {
            detach('reconnect', needsConnection);
          } else retryLater(error, capturedGeneration);
        }
        throw error;
      }
    };
    return { read: wrap('read'), write: wrap('write') };
  }
  async function sync(options) {
    if (!validAuthority()) return false;
    const selected = coordinator;
    const selectedStore = store;
    const selectedGeneration = generation;
    if (!selected || !authority || localSignOut) return false;
    if (!hasUnexpiredAuthority() && snapshot.sessionStatus === 'offline') { detach('reconnect', needsConnection); return false; }
    const result = await selected.sync(options);
    if (!current(selectedStore, selectedGeneration)) return false;
    if (result) { syncFailure = null; retries = 0; cancel(retryTimer); retryTimer = undefined; }
    if (!result && syncFailure?.status === 409) selectedStore.setCloudSyncState({ status: 'conflict', error: 'Account progress requires review. Export a backup of retained records before retrying.' });
    publish({ sessionStatus: result || ['capacity', 'conflict'].includes(selectedStore.getSnapshot().cloud?.status) ? 'authenticated' : 'offline' });
    return result;
  }
  function queueCheck() {
    if (queuedCheck || !started || localSignOut) return;
    queuedCheck = true;
    queueMicrotask(() => { queuedCheck = false; if (started && !localSignOut) void reconcile(); });
  }
  function ensureAuthSubscription() {
    if (authSubscription || !authority || signOutPending || !isAccountCurrent({ accountId: authority.id, generation })) return;
    const selected = { lifecycle, generation, accountId: authority.id };
    const isCurrent = () => lifecycle === selected.lifecycle && !signOutPending && isAccountCurrent(selected);
    if (authLoad?.lifecycle === selected.lifecycle && authLoad.generation === selected.generation) return;
    const install = factory => {
      if (authSubscription || !isCurrent()) return;
      const client = factory();
      if (!isCurrent()) return;
      const subscription = client?.auth.onAuthStateChange(authChanged)?.data?.subscription;
      if (!subscription) return;
      if (!isCurrent()) { subscription.unsubscribe(); return; }
      authClient = client; authSubscription = subscription;
      stopAuthHints?.(); stopAuthHints = undefined;
    };
    if (getAuthClient) { try { install(getAuthClient); } catch { /* Passive hints and server verification remain available. */ } return; }
    authLoad = selected;
    try {
      void Promise.resolve(loadAuthClient()).then(install).catch(() => {}).finally(() => { if (authLoad === selected) authLoad = undefined; });
    } catch { authLoad = undefined; }
  }
  async function reconcile() {
    if (!started || localSignOut) return false;
    if (knownExpiredAuthority()) detach('reconnect', needsConnection);
    const check = ++checkSequence;
    sessionAbort?.abort(); sessionAbort = new AbortController();
    let session;
    try {
      const response = await fetchImpl('/api/auth/session', { credentials: 'same-origin', cache: 'no-store', signal: sessionAbort.signal });
      if (!response.ok) throw new HttpError(response.status, 'session-unavailable');
      session = await readJsonBody(response, 16384);
      if (!session || typeof session.configured !== 'boolean' || !['guest', 'authenticated'].includes(session.status)) throw new Error('Invalid session response');
      if (session.status === 'authenticated' && (!session.configured || !isAccountId(session.account?.id) || (session.account.expiresAt !== null && (!Number.isSafeInteger(session.account.expiresAt) || session.account.expiresAt <= now())))) throw new Error('Invalid verified account');
    } catch (error) {
      if (!started || check !== checkSequence || error?.name === 'AbortError') return false;
      if (authority && store?.getSnapshot().data.ownerScope === `account:${authority.id}` && hasUnexpiredAuthority()) {
        store.setCloudSyncState({ status: 'offline', error: sessionMessage });
        publish({ sessionStatus: 'offline', sessionError: sessionMessage });
      } else detach('unavailable', sessionMessage);
      return false;
    }
    if (!started || check !== checkSequence || localSignOut) return false;
    publish({ configured: session.configured });
    if (session.status !== 'authenticated') { detach('guest'); return true; }
    const account = { id: session.account.id, email: typeof session.account.email === 'string' ? session.account.email : null, expiresAt: session.account.expiresAt };
    if (authority?.id === account.id && store?.getSnapshot().data.ownerScope === `account:${account.id}`) {
      authority = account; setExpiry(); publish({ account, sessionStatus: 'authenticated', sessionError: null });
      ensureAuthSubscription();
      void sync({ automatic: true }); return true;
    }
    coordinator?.detach(); clearTimers(); generation++; transferPreview = null;
    authority = account; syncFailure = null;
    const selectedGeneration = generation;
    if (guest) subscribeStore(guest, { account: null, sessionStatus: 'connecting', sessionError: null });
    setExpiry();
    ensureAuthSubscription();
    if (!accounts.has(account.id)) accounts.set(account.id, createAccountStore(account.id));
    const candidate = accounts.get(account.id);
    const selectedCoordinator = createCoordinator({ store: candidate, transport: ownerTransport(selectedGeneration), accountId: account.id, generation: selectedGeneration, isCurrent: isAccountCurrent });
    coordinator = selectedCoordinator;
    try {
      await candidate.hydrate();
      if (!isAccountCurrent({ accountId: account.id, generation: selectedGeneration })) return false;
      const hydrated = await selectedCoordinator.sync();
      if (!isAccountCurrent({ accountId: account.id, generation: selectedGeneration })) return false;
      const cached = Number.isSafeInteger(candidate.getSnapshot().cloud?.remoteRevision);
      if (!hydrated && !(cached && hasUnexpiredAuthority())) { detach('unavailable', sessionMessage); return false; }
      subscribeStore(candidate, { account, sessionStatus: hydrated ? 'authenticated' : 'offline', sessionError: hydrated ? null : sessionMessage });
      return true;
    } catch {
      if (isAccountCurrent({ accountId: account.id, generation: selectedGeneration })) detach('unavailable', sessionMessage);
      return false;
    }
  }
  function authChanged(event, rawSession) {
    if (!started || signOutPending || localSignOut) return;
    if (event === 'SIGNED_OUT') { localSignOut = true; detach('guest'); return; }
    if (authority && rawSession?.user?.id && rawSession.user.id !== authority.id) detach('checking');
    queueCheck();
  }
  const onFocus = () => { queueCheck(); if (!localSignOut) void sync({ automatic: true }); };

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => ACTIVE_PROGRESS_SERVER_SNAPSHOT,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    isCurrentBinding: current,
    async start() {
      if (started) return;
      started = true; localSignOut = false; generation++; lifecycle++;
      guest = getGuestStore(); subscribeStore(guest, { account: null, sessionStatus: 'checking', sessionError: null });
      try { stopAuthHints = listenAuthHints(authChanged); } catch { stopAuthHints = undefined; }
      eventTarget?.addEventListener('focus', onFocus); eventTarget?.addEventListener('online', onFocus);
      await reconcile();
    },
    stop() {
      started = false; generation++; checkSequence++; lifecycle++;
      sessionAbort?.abort(); coordinator?.detach(); coordinator = null; clearTimers();
      unsubscribeStore?.(); unsubscribeStore = undefined; authSubscription?.unsubscribe(); authSubscription = undefined;
      stopAuthHints?.(); stopAuthHints = undefined; authLoad = undefined; authClient = null;
      eventTarget?.removeEventListener('focus', onFocus); eventTarget?.removeEventListener('online', onFocus);
      releaseBinding?.(); releaseBinding = undefined; authority = null; transferPreview = null;
    },
    reconcile,
    async reconnect() { if (signOutPending) return false; localSignOut = false; return reconcile(); },
    sync,
    async retryRetainedQuizUpdates() {
      const selected = store; const selectedGeneration = generation;
      const isCurrent = () => !!snapshot.account && current(selected, selectedGeneration);
      if (!isCurrent()) return false;
      const result = await selected.retryRetainedQuizUpdates({ isCurrent });
      if (!isCurrent() || !result.persisted || !result.queued) return false;
      void sync();
      return true;
    },
    async signOut() {
      const account = snapshot.account;
      if (!account) return false;
      localSignOut = true; signOutPending = true;
      detach('guest');
      const detachedGeneration = generation;
      try {
        await authClient?.auth.stopAutoRefresh?.();
        const response = await fetchImpl('/api/auth/signout', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expectedAccountId: account.id }) });
        const body = await readJsonBody(response, 16384);
        if (!response.ok || body?.signedOut !== true || body.accountId !== account.id) throw new Error('Sign-out failed');
        return true;
      } catch {
        if (started && generation === detachedGeneration) publish({ sessionError: 'Sign-out could not be confirmed. You are using guest progress here; reconnect to retry before refreshing this page.' });
        return false;
      } finally { signOutPending = false; if (started && generation === detachedGeneration) publish(); }
    },
    async previewGuestTransfer() {
      const selected = store; const selectedGeneration = generation;
      if (!snapshot.account || !selected) throw new Error('Sign in before choosing guest progress to transfer');
      const context = selected.captureWriteContext();
      const exported = await guest.exportProgress();
      if (!current(selected, selectedGeneration)) throw new Error('The account changed; review the transfer again');
      const preview = await selected.previewGuestTransfer(exported);
      if (!current(selected, selectedGeneration)) throw new Error('The account changed; review the transfer again');
      transferPreview = { ...preview, exported, context, store: selected, generation: selectedGeneration };
      return { ...preview, accountId: snapshot.account.id, generation: selectedGeneration };
    },
    async confirmGuestTransfer(expectedDigest) {
      const preview = transferPreview;
      if (!preview || preview.digest !== expectedDigest || !current(preview.store, preview.generation)) throw new Error('Review guest progress again before transferring');
      const latest = await guest.exportProgress();
      const fresh = await preview.store.previewGuestTransfer(latest);
      if (!current(preview.store, preview.generation) || fresh.digest !== expectedDigest) { transferPreview = null; throw new Error('Guest progress changed; review the transfer again'); }
      const result = await preview.store.queueGuestTransfer(preview.exported, { expectedDigest, context: preview.context });
      if (!current(preview.store, preview.generation)) return false;
      transferPreview = null;
      if (!result.applied || !result.persisted) throw new Error('The transfer was not saved. Your guest progress remains available; export a backup and retry.');
      void sync({ automatic: true });
      return true;
    },
  };
}
