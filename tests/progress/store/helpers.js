const copy = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));

/** Transactional double; real IndexedDB behavior has a separate adapter suite. */
export function memoryPersistence() {
  const records = new Map();
  const identity = { ownerScope: 'guest:device-one', deviceId: 'device-one' };
  let legacyOwner;
  let sequence = Promise.resolve();
  const failures = { read: false, write: false, identity: false, staleRead: false };
  let reads = 0;
  let writes = 0;
  return {
    identity, records, failures,
    get reads() { return reads; }, get writes() { return writes; },
    async getIdentity() { if (failures.identity) throw new Error('Identity blocked'); return copy(identity); },
    async claimLegacyOwner(scope) { legacyOwner ||= scope; return legacyOwner === scope; },
    async read(scope) { reads++; if (failures.read) throw new Error('Read blocked'); return failures.staleRead ? undefined : copy(records.get(scope)); },
    update(scope, reduce) {
      const transaction = sequence.catch(() => {}).then(() => {
        if (failures.write) throw new Error('Quota exceeded');
        const next = reduce(copy(records.get(scope)));
        records.set(scope, copy(next)); writes++;
        return copy(next);
      });
      sequence = transaction;
      return transaction;
    },
    close() {},
  };
}

export function storageWith(values = {}) {
  const map = new Map(Object.entries(values));
  return {
    get length() { return map.size; },
    key(index) { return [...map.keys()][index] ?? null; },
    getItem(key) { return map.get(key) ?? null; },
    setItem(key, value) { map.set(key, String(value)); },
    removeItem(key) { map.delete(key); },
  };
}

let nextOperation = 0;
export function environment(persistence, overrides = {}) {
  return {
    persistence, legacyStorage: storageWith(), eventTarget: new EventTarget(), document: new EventTarget(), broadcastFactory: () => null,
    createId: () => `operation-${++nextOperation}`, now: () => '2026-10-03T12:00:00.000Z', pollInterval: 0,
    ...overrides,
  };
}
