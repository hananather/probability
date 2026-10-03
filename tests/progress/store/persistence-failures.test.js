import { afterEach, describe, expect, it, vi } from 'vitest';
import { createIndexedDbPersistence } from '@/lib/progress/persistence';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('IndexedDB opening failure boundaries', () => {
  it('rejects missing browser storage without creating a fictional persisted identity', async () => {
    vi.stubGlobal('indexedDB', undefined);
    const persistence = createIndexedDbPersistence();
    await expect(persistence.getIdentity()).rejects.toThrow('unavailable');
  });

  it('rejects blocked opening and closes a late successful connection', async () => {
    const request = {};
    const persistence = createIndexedDbPersistence({ indexedDB: { open: () => request } });
    const pending = persistence.getIdentity();
    request.onblocked();
    await expect(pending).rejects.toThrow('blocked');
    request.result = { close: vi.fn() }; request.onsuccess();
    expect(request.result.close).toHaveBeenCalledTimes(1);
  });

  it('bounds an unresponsive open request and permits a later retry', async () => {
    vi.useFakeTimers();
    const requests = [];
    const persistence = createIndexedDbPersistence({ indexedDB: { open() { const request = {}; requests.push(request); return request; } }, openTimeout: 10 });
    const pending = persistence.getIdentity(); const rejected = expect(pending).rejects.toThrow('blocked');
    await vi.advanceTimersByTimeAsync(10); await rejected;
    const next = persistence.getIdentity(); requests[1].error = new Error('Browser denied storage'); requests[1].onerror();
    await expect(next).rejects.toThrow('denied storage');
  });

  it('rejects invalid owner scopes before accessing browser storage', async () => {
    const open = vi.fn(); const persistence = createIndexedDbPersistence({ indexedDB: { open } });
    expect(() => persistence.read('other-owner')).toThrow('Invalid progress owner');
    expect(() => persistence.update('__proto__', () => ({}))).toThrow('Invalid progress owner');
    expect(open).not.toHaveBeenCalled();
  });
});
