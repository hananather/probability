import { isOwnerScope, isRecord, isSafeId } from './schema';

export const PROGRESS_DATABASE = 'probability-learning-progress';
const RECORDS = 'records';
const METADATA = 'metadata';

export function createProgressId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (!globalThis.crypto?.getRandomValues) throw new Error('Browser identity generation is unavailable');
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function createIndexedDbPersistence({ indexedDB: factory, databaseName = PROGRESS_DATABASE, createId = createProgressId, openTimeout = 2000 } = {}) {
  let connection = null;
  let opening = null;

  function open() {
    if (connection) return Promise.resolve(connection);
    if (opening) return opening;
    opening = new Promise((resolve, reject) => {
      const indexedDB = factory || globalThis.indexedDB;
      if (!indexedDB) { reject(new Error('Browser progress storage is unavailable')); return; }
      let finished = false;
      const request = indexedDB.open(databaseName, 1);
      const timeout = setTimeout(() => fail(new Error('Browser progress storage is blocked')), openTimeout);
      const fail = error => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        reject(error);
      };
      request.onupgradeneeded = () => {
        for (const name of [RECORDS, METADATA]) if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name);
      };
      request.onerror = () => fail(request.error || new Error('Unable to open browser progress storage'));
      request.onblocked = () => fail(new Error('Browser progress storage is blocked'));
      request.onsuccess = () => {
        if (finished) { request.result.close(); return; }
        finished = true;
        clearTimeout(timeout);
        connection = request.result;
        connection.onversionchange = () => { connection?.close(); connection = null; opening = null; };
        resolve(connection);
      };
    }).catch(error => { opening = null; throw error; });
    return opening;
  }

  async function access(table, key, reducer) {
    const database = await open();
    return new Promise((resolve, reject) => {
      let transaction;
      try {
        transaction = database.transaction(table, reducer ? 'readwrite' : 'readonly', reducer ? { durability: 'strict' } : undefined);
      } catch (error) { reject(error); return; }
      let result;
      let failure;
      transaction.oncomplete = () => resolve(result);
      transaction.onabort = () => reject(failure || transaction.error || new Error('Progress transaction was aborted'));
      transaction.onerror = () => { failure ||= transaction.error || new Error('Progress transaction failed'); };
      const store = transaction.objectStore(table);
      const request = store.get(key);
      request.onsuccess = () => {
        try {
          result = reducer ? reducer(request.result) : request.result;
          if (result && typeof result.then === 'function') throw new TypeError('Progress transaction reducers must be synchronous');
          if (reducer && result !== undefined && result !== request.result) store.put(result, key);
        } catch (error) {
          failure = error;
          transaction.abort();
        }
      };
    });
  }

  function guardScope(ownerScope) {
    if (!isOwnerScope(ownerScope)) throw new TypeError('Invalid progress owner scope');
  }

  return {
    async getIdentity() {
      return access(METADATA, 'guest-identity', existing => {
        if (isRecord(existing) && isOwnerScope(existing.ownerScope) && existing.ownerScope.startsWith('guest:') && isSafeId(existing.deviceId)) return existing;
        const deviceId = createId();
        if (!isSafeId(deviceId) || !isOwnerScope(`guest:${deviceId}`)) throw new TypeError('Invalid generated device identity');
        return { ownerScope: `guest:${deviceId}`, deviceId, ...(existing === undefined ? {} : { recoveredIdentity: existing }) };
      });
    },
    async claimLegacyOwner(ownerScope) {
      guardScope(ownerScope);
      if (!ownerScope.startsWith('guest:')) return false;
      const owner = await access(METADATA, 'legacy-owner', existing => existing || ownerScope);
      return owner === ownerScope;
    },
    read(ownerScope) { guardScope(ownerScope); return access(RECORDS, ownerScope); },
    update(ownerScope, reducer) { guardScope(ownerScope); return access(RECORDS, ownerScope, reducer); },
    close() { connection?.close(); connection = null; opening = null; },
  };
}
