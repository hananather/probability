import { afterEach, describe, expect, it } from 'vitest';
import { ProgressService } from '@/services/progressService';
import { createProgressStore } from '@/lib/progress/store';
import { RAW_FIXTURES } from '../migration/fixtures';
import { environment, memoryPersistence, storageWith } from './helpers';

const resources = [];
afterEach(() => resources.splice(0).forEach(store => store.dispose()));
function setup(values = {}) {
  const persistence = memoryPersistence(); const legacyStorage = storageWith(values);
  const store = createProgressStore(environment(persistence, { legacyStorage })); resources.push(store);
  const service = new ProgressService({ storeProvider: () => store });
  return { persistence, store, service, legacyStorage };
}

describe('progress service compatibility', () => {
  it('projects documented legacy data with current chapter counts while retaining raw history', async () => {
    const { service, legacyStorage } = setup(RAW_FIXTURES);
    const progress = await service.getProgress(); const summary = await service.getOverallProgress();
    expect(progress['chapter-1']).toMatchObject({ status: 'completed', progress: 100, timeSpent: 80, legacyStatus: 'completed' });
    expect(summary).toMatchObject({ completedChapters: 7, totalChapters: 7, completedLessons: 66, totalLessons: 66, overallProgress: 100 });
    const exported = await service.exportProgress();
    expect(exported.meta.version).toBe('2.0.0');
    expect(exported.progress['chapter-1'].completedSections).toHaveLength(12);
    expect(exported.snapshot.migration.sources.chapter1Progress.raw).toBe(RAW_FIXTURES.chapter1Progress);
    expect(legacyStorage.getItem('probLabProgress')).toBe(RAW_FIXTURES.probLabProgress);
  });

  it('keeps completion and chapter APIs readable without rewriting the original browser keys', async () => {
    const { service, legacyStorage } = setup({ chapter1Progress: '[]' });
    await service.updateChapterProgress('local', 1, { status: 'in_progress', timeSpent: 4 });
    const completed = await service.completeSection('chapter-1', 'foundations');
    expect(completed['chapter-1']).toMatchObject({ completedSections: ['foundations'], progress: 8, status: 'in_progress' });
    expect(await service.getChapterProgress(1)).toMatchObject({ completedSections: ['foundations'], timeSpent: 4 });
    expect((await service.getOverallProgress()).lastActivity).toBeTruthy();
    expect(legacyStorage.getItem('chapter1Progress')).toBe('[]');
    expect(legacyStorage.getItem('probLabProgress')).toBeNull();
    await expect(service.completeSection(1, '1-0')).rejects.toThrow('Unrecognized');
    expect(service.calculateProgress(1, ['foundations', 'foundations', 'unknown'])).toBe(8);
    expect(service.calculateProgress(2, ['random-variables'])).toBe(11);
    expect(service.calculateProgress(6, ['hypothesis-game'])).toBe(0);
  });

  it('retains historical chapter flags and scores without inventing current completion', async () => {
    const { service } = setup({ probLabProgress: JSON.stringify({ 'chapter-1': { status: 'completed', progress: 100, score: 0, completedSections: ['1-0'] }, 'chapter-8': { status: 'completed', timeSpent: 99 } }) });
    expect(await service.getChapterProgress(1)).toMatchObject({ status: 'in_progress', legacyStatus: 'completed', progress: 0, score: 0, completedSections: [] });
    expect(await service.getOverallProgress()).toMatchObject({ totalChapters: 7, completedChapters: 0, totalTimeSpent: 0 });
    expect((await service.exportProgress()).snapshot.chaptersLegacy['chapter-8'].timeSpent).toBe(99);
  });

  it('keeps quota-failed updates readable/exportable and exposes local retry without claiming cloud sync', async () => {
    const { service, store, persistence } = setup(); await store.hydrate(); persistence.failures.write = true;
    const progress = await service.completeSection(1, 'foundations');
    expect(progress['chapter-1'].completedSections).toEqual(['foundations']);
    expect(progress['chapter-1'].lastUpdated).toBe('2026-10-03T12:00:00.000Z');
    expect((await service.exportProgress()).pendingLocalOperations).toHaveLength(1);
    expect(store.getSnapshot().persistenceStatus).toBe('session-only');
    expect(service.queueSync('local', progress)).toBe(false);
    expect(service.hasPendingSync()).toBe(false); expect(await service.syncWithDatabase()).toBe(false);
    persistence.failures.write = false; expect(await service.retryLocalPersistence()).toBe(true);
    expect(store.getSnapshot().persistenceStatus).toBe('persisted');
  });

  it('keeps reset checkpoint recovery and supports validated old and new file imports', async () => {
    const { service } = setup({ chapter1Progress: '["foundations"]' }); await service.getProgress();
    const exported = await service.exportProgress();
    expect((await service.resetChapterProgress(1))['chapter-1'].completedSections).toEqual([]);
    expect((await service.getProgress())['chapter-1'].completedSections).toEqual([]);
    expect(await service.importProgress(exported)).toBe(true);
    expect((await service.getChapterProgress(1)).completedSections).toEqual(['foundations']);
    expect(await service.importProgress({ invalid: true })).toBe(false);
    await service.resetAllProgress();
    expect((await service.getOverallProgress()).overallProgress).toBe(0);
    expect((await service.exportProgress()).snapshot.migration.sources.chapter1Progress.raw).toBe('["foundations"]');
    expect(await service.importProgress({ meta: { userId: 'foreign-user' }, progress: { 'chapter-2': { status: 'in_progress', completedSections: ['random-variables'] } } })).toBe(true);
    expect((await service.getChapterProgress(2)).progress).toBe(11);
  });
});
