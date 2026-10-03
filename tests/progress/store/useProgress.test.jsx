import React from 'react';
import { renderToString } from 'react-dom/server';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useChapterProgress, useProgress } from '@/hooks/useProgress';
import progressService from '@/services/progressService';
import { createProgressStore } from '@/lib/progress/store';
import { createEmptyProgress } from '@/lib/progress/schema';
import { environment, memoryPersistence } from './helpers';

const resources = [];
afterEach(() => { resources.splice(0).forEach(store => store.dispose()); vi.unstubAllGlobals(); });
function setup() {
  const persistence = memoryPersistence(); const eventTarget = new EventTarget();
  const store = createProgressStore(environment(persistence, { eventTarget })); resources.push(store);
  vi.spyOn(progressService, 'getStore').mockReturnValue(store);
  return { persistence, store, eventTarget };
}

describe('shared progress hooks', () => {
  it('uses one subscription surface for multiple readers and updates every reader after completion', async () => {
    const { store, eventTarget } = setup(); const add = vi.spyOn(eventTarget, 'addEventListener'); const remove = vi.spyOn(eventTarget, 'removeEventListener');
    const a = renderHook(() => useProgress()); const b = renderHook(() => useChapterProgress(1));
    await waitFor(() => expect(a.result.current.loading).toBe(false));
    expect(a.result.current.overallStats).toMatchObject({ totalChapters: 7, notStartedChapters: 7, totalProgress: 0 });
    expect(add).toHaveBeenCalledTimes(2);
    await act(async () => { await a.result.current.completeSection(1, 'foundations'); });
    expect(b.result.current.chapterProgress.completedSections).toEqual(['foundations']);
    expect(b.result.current.progressPercentage).toBe(8);
    expect(a.result.current.overallStats.completedLessons).toBe(1);
    expect(store.getSnapshot().pendingLocalWrites).toBe(0);
    a.unmount(); expect(remove).not.toHaveBeenCalled(); b.unmount(); expect(remove).toHaveBeenCalledTimes(2);
  });

  it('supports public whole-chapter completion and start/reset without treating a historical flag as proof', async () => {
    setup(); const value = renderHook(() => useChapterProgress(1)); await waitFor(() => expect(value.result.current.loading).toBe(false));
    await act(async () => { await value.result.current.complete(); });
    expect(value.result.current.isCompleted).toBe(true); expect(value.result.current.progressPercentage).toBe(100);
    expect(value.result.current.chapterProgress.completedSections).toHaveLength(12);
    await act(async () => { await value.result.current.start(); }); expect(value.result.current.isCompleted).toBe(true);
    await act(async () => { expect(await value.result.current.reset()).toBe(true); });
    expect(value.result.current.isNotStarted).toBe(true); expect(value.result.current.progressPercentage).toBe(0);
  });

  it('reports a quota failure with exportable progress and successful local retry, without a sync claim', async () => {
    const { persistence } = setup(); const value = renderHook(() => useProgress()); await waitFor(() => expect(value.result.current.loading).toBe(false));
    persistence.failures.write = true;
    await act(async () => { await value.result.current.completeSection(1, 'foundations'); });
    expect(value.result.current).toMatchObject({ error: 'Quota exceeded', persistenceStatus: 'session-only', pendingLocalWrites: 1, hasPendingSync: false });
    expect(value.result.current.progress['chapter-1'].completedSections).toEqual(['foundations']);
    persistence.failures.write = false;
    await act(async () => { expect(await value.result.current.retryLocalPersistence()).toBe(true); });
    expect(value.result.current).toMatchObject({ error: null, persistenceStatus: 'persisted', pendingLocalWrites: 0 });
    await act(async () => { expect(await value.result.current.syncProgress()).toBe(false); });
    expect(value.result.current.syncing).toBe(false);
  });

  it('isolates profile data and late action errors when a reader switches profiles', async () => {
    const persistence = memoryPersistence();
    const alice = createProgressStore(environment(persistence));
    const bob = createProgressStore(environment(persistence, { ownerScope: 'guest:bob', deviceId: 'device-one', importLegacy: false }));
    resources.push(alice, bob);
    vi.spyOn(progressService, 'getStore').mockImplementation(profile => profile === 'alice' ? alice : bob);
    await Promise.all([alice.hydrate(), bob.hydrate()]);
    const value = renderHook(({ profile }) => useProgress(profile), { initialProps: { profile: 'alice' } });
    await act(async () => { await value.result.current.completeSection(1, 'foundations'); });
    const oldAction = value.result.current.completeSection;
    value.rerender({ profile: 'bob' });
    await act(async () => { expect(await oldAction(1, '1-0')).toBeNull(); });
    expect(value.result.current.error).toBeNull();
    expect(value.result.current.progress['chapter-1'].completedSections).toEqual([]);
    await act(async () => { await value.result.current.completeSection(2, 'random-variables'); });
    value.rerender({ profile: 'alice' });
    expect(value.result.current.progress['chapter-1'].completedSections).toEqual(['foundations']);
    expect(value.result.current.progress['chapter-2'].completedSections).toEqual([]);
    expect(value.result.current.error).toBe('Unrecognized completed section');
  });

  it('returns public failure values for invalid actions and invalid file content', async () => {
    setup(); const value = renderHook(() => useProgress()); await waitFor(() => expect(value.result.current.loading).toBe(false));
    await act(async () => { expect(await value.result.current.completeSection(1, '1-0')).toBeNull(); });
    expect(value.result.current.error).toBe('Unrecognized completed section');
    await act(async () => { expect(await value.result.current.importProgress({ text: async () => '{broken' })).toBe(false); });
    expect(value.result.current.error).toBeTruthy();
    await act(async () => { expect(await value.result.current.importProgress({ text: async () => '{"invalid":true}' })).toBe(false); });
    expect(value.result.current.error).toBe('Progress file could not be imported into this local profile');
  });

  it('treats an explicitly chosen guest file as a transfer and keeps account files isolated', async () => {
    setup(); const value = renderHook(() => useProgress()); await waitFor(() => expect(value.result.current.loading).toBe(false));
    const snapshot = createEmptyProgress({ ownerScope: 'guest:other-device', deviceId: 'other-device' });
    snapshot.activities['chapter-2:random-variables'] = { activityId: 'chapter-2:random-variables', generation: 0, evidence: [{ kind: 'study-completed', sourceKey: 'manual-import', completedAt: null }] };
    await act(async () => { expect(await value.result.current.importProgress({ text: async () => JSON.stringify({ snapshot }) })).toBe(true); });
    expect(value.result.current.progress['chapter-2'].completedSections).toEqual(['random-variables']);
    snapshot.ownerScope = 'account:00000000-0000-0000-0000-000000000001';
    await act(async () => { expect(await value.result.current.importProgress({ text: async () => JSON.stringify({ snapshot }) })).toBe(false); });
  });

  it('downloads normalized/raw recovery data with the existing export filename and revokes its URL', async () => {
    setup(); const createObjectURL = vi.fn(() => 'blob:test-progress'); const revokeObjectURL = vi.fn();
    const OriginalURL = URL;
    vi.stubGlobal('URL', class extends OriginalURL { static createObjectURL = createObjectURL; static revokeObjectURL = revokeObjectURL; });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const value = renderHook(() => useProgress()); await waitFor(() => expect(value.result.current.loading).toBe(false));
    await act(async () => { expect(await value.result.current.exportProgress()).toBe(true); });
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob)); expect(click).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-progress'));
    expect(document.querySelector('a[download]')).toBeNull();
  });

  it('renders a deterministic empty seven-chapter SSR snapshot without reading or writing browser progress', () => {
    const { persistence } = setup();
    function Summary() { const value = useProgress(); return <p>{value.loading ? 'loading' : 'ready'}:{value.overallStats.totalChapters}:{value.overallStats.totalProgress}</p>; }
    expect(renderToString(<Summary />)).toContain('loading<!-- -->:<!-- -->7<!-- -->:<!-- -->0');
    expect(persistence.reads).toBe(0); expect(persistence.writes).toBe(0);
  });
});
