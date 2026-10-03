import { IDBFactory } from 'fake-indexeddb';
import { afterEach, describe, expect, it } from 'vitest';
import { LEGACY_SECTION_SOURCE_BY_CONTAINER, LEGACY_SOURCE_BY_KEY } from '@/lib/curriculum/manifest';
import { migrateLegacyProgress, readLegacySectionResume } from '@/lib/progress/legacyMigration';
import { validateProgressSnapshot } from '@/lib/progress/schema';
import { createIndexedDbPersistence } from '@/lib/progress/persistence';
import { createProgressStore } from '@/lib/progress/store';
import { environment, memoryPersistence, storageWith } from './helpers';
import { SECTION_CHILD, SECTION_KEY, SECTION_RAW, withArchivedSection } from './section-fixtures';

const active = [];
const create = (db, overrides = {}) => { const store = createProgressStore(environment(db, overrides)); active.push(store); return store; };
const position = store => store.getSnapshot().data.resumeByDevice['device-one']?.[SECTION_CHILD];
const checkpoint = store => store.getSnapshot().data.legacySectionResumeByDevice?.['device-one']?.[SECTION_KEY];
afterEach(() => active.splice(0).forEach(store => store.dispose()));

async function oldArchive(db = memoryPersistence()) {
  const seeded = create(db); await seeded.hydrate();
  const record = (await db.read(seeded.getSnapshot().data.ownerScope));
  await db.update(record.ownerScope, () => withArchivedSection(record));
  seeded.dispose();
  return { db, rawStorage: storageWith({ [SECTION_KEY]: SECTION_RAW }) };
}

describe('registered historical section positions', () => {
  it('maps all 21 exact route/title sources to stable renderer positions without creating study facts', () => {
    const sources = Object.values(LEGACY_SECTION_SOURCE_BY_CONTAINER);
    expect(sources).toHaveLength(21);
    for (const source of sources) {
      expect(LEGACY_SOURCE_BY_KEY[source.key]).toBe(source);
      const raw = JSON.stringify({ index: 0, sectionId: source.positionIds.at(-1) });
      const result = migrateLegacyProgress({ [source.key]: raw });
      expect(result.resumeByDevice.local[source.containerId]).toMatchObject({ positionId: source.positionIds.at(-1), legacyIndex: source.positionIds.length - 1, activityId: null, kind: 'section' });
      expect(result.activities).toEqual({});
      expect(result.migration.sources[source.key].raw).toBe(raw);
      expect(validateProgressSnapshot(result).valid).toBe(true);
    }
  });

  it('prefers recognized stable IDs, accepts bounded older indices, and archives invalid or unknown inputs exactly', () => {
    expect(readLegacySectionResume(SECTION_KEY, SECTION_RAW)).toMatchObject({ positionId: 'set-operations', legacyIndex: 2 });
    expect(readLegacySectionResume(SECTION_KEY, '3')).toMatchObject({ positionId: 'complete-example', legacyIndex: 3 });
    expect(readLegacySectionResume(SECTION_KEY, '{"index":1,"sectionId":"obsolete"}')).toMatchObject({ positionId: 'counting-principle', legacyIndex: 1 });
    for (const raw of ['-1', '4', '1.5', '"2"', 'null', '{broken', '{"sectionId":"constructor"}']) {
      expect(readLegacySectionResume(SECTION_KEY, raw)).toBeNull();
      const result = migrateLegacyProgress({ [SECTION_KEY]: raw });
      expect(result.unattributedLegacy[SECTION_KEY].raw).toBe(raw);
      expect(result.resumeByDevice).toEqual({});
      expect(result.activities).toEqual({});
    }
    const unknown = `${SECTION_KEY}-unknown`;
    const result = migrateLegacyProgress({ [unknown]: SECTION_RAW });
    expect(result.unattributedLegacy[unknown]).toEqual({ raw: SECTION_RAW, issues: ['unattributed-source'] });
    expect(result.resumeByDevice).toEqual({});
  });

  it('automatically migrates a newly observed source once and preserves the current canonical locator', async () => {
    const db = memoryPersistence(); const rawStorage = storageWith({ [SECTION_KEY]: SECTION_RAW });
    const subject = create(db, { legacyStorage: rawStorage }); await subject.hydrate();
    expect(position(subject)).toMatchObject({ positionId: 'set-operations' });
    expect(checkpoint(subject).status).toBe('adopted');
    await subject.setResume(SECTION_CHILD, { kind: 'section', activityId: null, positionId: 'counting-principle', legacyIndex: 1 });
    rawStorage.setItem(SECTION_KEY, '3'); await subject.refreshLegacy();
    expect(position(subject).positionId).toBe('counting-principle');
    expect(subject.getSnapshot().data.activities).toEqual({});
    expect(subject.getSnapshot().data.migration.sources[SECTION_KEY].previous[0].raw).toBe(SECTION_RAW);
  });

  it('requires an explicit one-time action for already-observed old archives and retains their raw provenance', async () => {
    const { db, rawStorage } = await oldArchive();
    const subject = create(db, { legacyStorage: rawStorage }); await subject.hydrate();
    expect(position(subject)).toBeUndefined();
    expect(subject.getLegacySectionResume(SECTION_CHILD)).toMatchObject({ sourceKey: SECTION_KEY, positionId: 'set-operations' });
    const context = subject.captureWriteContext(SECTION_CHILD);
    expect(await subject.restoreLegacySectionResume(SECTION_CHILD, SECTION_KEY, { context })).toMatchObject({ applied: true, persisted: true });
    expect(position(subject).positionId).toBe('set-operations');
    expect(subject.getLegacySectionResume(SECTION_CHILD)).toBeNull();
    expect(subject.getSnapshot().data.unattributedLegacy[SECTION_KEY].raw).toBe(SECTION_RAW);
    expect(subject.getSnapshot().data.activities).toEqual({});
    expect(await subject.restoreLegacySectionResume(SECTION_CHILD, SECTION_KEY, { context })).toMatchObject({ applied: false, reason: 'section-resume-already-consumed' });
  });

  it('does not automatically backfill an older archive when a later legacy write changes its raw position', async () => {
    const { db, rawStorage } = await oldArchive();
    const subject = create(db, { legacyStorage: rawStorage }); await subject.hydrate();
    rawStorage.setItem(SECTION_KEY, '3'); await subject.refreshLegacy();
    expect(position(subject)).toBeUndefined(); expect(checkpoint(subject)).toBeUndefined();
    expect(subject.getLegacySectionResume(SECTION_CHILD)).toMatchObject({ positionId: 'complete-example' });
    expect(subject.getSnapshot().data.migration.sources[SECTION_KEY].previous[0].raw).toBe(SECTION_RAW);
  });

  it.each(['clear', 'global', 'chapter', 'ancestor', 'child'])('keeps an old archive suppressed after %s, remount, and later raw-source changes', async action => {
    const { db, rawStorage } = await oldArchive();
    const subject = create(db, { legacyStorage: rawStorage }); await subject.hydrate();
    const context = subject.captureWriteContext(SECTION_CHILD);
    if (action === 'clear') await subject.clearResume(SECTION_CHILD, { context });
    else if (action === 'global') await subject.resetAll();
    else if (action === 'chapter') await subject.resetChapter(1);
    else await subject.resetActivity(action === 'ancestor' ? 'chapter-1:foundations' : SECTION_CHILD, { context: subject.captureWriteContext(action === 'ancestor' ? 'chapter-1:foundations' : SECTION_CHILD) });
    expect(checkpoint(subject).status).toBe('cleared');
    expect(subject.getLegacySectionResume(SECTION_CHILD)).toBeNull();
    expect(await subject.restoreLegacySectionResume(SECTION_CHILD, SECTION_KEY, { context: subject.captureWriteContext(SECTION_CHILD) })).toMatchObject({ applied: false, reason: 'section-resume-already-consumed' });
    subject.dispose(); const reloaded = create(db, { legacyStorage: rawStorage }); await reloaded.hydrate();
    rawStorage.setItem(SECTION_KEY, '3'); await reloaded.refreshLegacy();
    expect(position(reloaded)).toBeUndefined();
    expect(reloaded.getLegacySectionResume(SECTION_CHILD)).toBeNull();
    expect(reloaded.getSnapshot().data.migration.sources[SECTION_KEY].raw).toBe('3');
  });

  it('retains an optimistic restoration checkpoint on quota failure and commits it once on retry', async () => {
    const { db, rawStorage } = await oldArchive(); const subject = create(db, { legacyStorage: rawStorage }); await subject.hydrate();
    db.failures.write = true;
    expect(await subject.restoreLegacySectionResume(SECTION_CHILD, SECTION_KEY, { context: subject.captureWriteContext(SECTION_CHILD) })).toMatchObject({ applied: true, persisted: false });
    expect(position(subject).positionId).toBe('set-operations');
    expect(checkpoint(subject).status).toBe('adopted');
    expect(subject.getSnapshot().persistenceStatus).toBe('session-only');
    expect((await subject.exportProgress()).pendingLocalOperations).toHaveLength(1);
    db.failures.write = false; expect(await subject.retryPersistence()).toBe(true);
    subject.dispose(); const reloaded = create(db, { legacyStorage: rawStorage }); await reloaded.hydrate();
    expect(position(reloaded).positionId).toBe('set-operations'); expect(reloaded.getLegacySectionResume(SECTION_CHILD)).toBeNull();
  });

  it('exports and imports clear checkpoints conservatively without overriding a current canonical position', async () => {
    const { db, rawStorage } = await oldArchive(); const subject = create(db, { legacyStorage: rawStorage }); await subject.hydrate();
    await subject.restoreLegacySectionResume(SECTION_CHILD, SECTION_KEY, { context: subject.captureWriteContext(SECTION_CHILD) });
    const prior = await subject.exportProgress();
    await subject.clearResume(SECTION_CHILD, { context: subject.captureWriteContext(SECTION_CHILD) });
    await subject.importProgress(prior); expect(position(subject)).toBeUndefined(); expect(checkpoint(subject).status).toBe('cleared');
    const cleared = await subject.exportProgress();
    const other = memoryPersistence(); other.identity.ownerScope = 'guest:device-two'; other.identity.deviceId = 'device-two';
    const target = create(other); await target.hydrate();
    await target.setResume(SECTION_CHILD, { kind: 'section', positionId: 'complete-example', legacyIndex: 3 });
    await target.importProgress(cleared, { allowGuestTransfer: true });
    expect(target.getSnapshot().data.resumeByDevice['device-two'][SECTION_CHILD].positionId).toBe('complete-example');
    expect(target.getSnapshot().data.legacySectionResumeByDevice['device-two'][SECTION_KEY].status).toBe('cleared');
    const broken = JSON.parse(JSON.stringify(cleared)); broken.snapshot.legacySectionResumeByDevice['device-one'][SECTION_KEY].containerId = 'chapter-2:binomial-distribution';
    await expect(target.importProgress(broken, { allowGuestTransfer: true })).rejects.toThrow('Invalid imported');
  });

  it.each([false, true])('transfers a later canonical position into an empty guest after legacy recovery clear=%s', async cleared => {
    const source = create(memoryPersistence()); await source.hydrate();
    if (cleared) await source.clearResume(SECTION_CHILD, { context: source.captureWriteContext(SECTION_CHILD) });
    await source.setResume(SECTION_CHILD, { kind: 'section', positionId: 'set-operations', legacyIndex: 2 });
    const backup = await source.exportProgress();
    expect(backup.pendingLocalOperations).toEqual([]);
    if (cleared) expect(checkpoint(source).status).toBe('cleared');
    const targetDb = memoryPersistence(); targetDb.identity.ownerScope = 'guest:device-two'; targetDb.identity.deviceId = 'device-two';
    const target = create(targetDb); await target.hydrate();
    await target.importProgress(backup, { allowGuestTransfer: true });
    expect(target.getSnapshot().data.resumeByDevice['device-two'][SECTION_CHILD]).toMatchObject({ positionId: 'set-operations', legacyIndex: 2 });
    if (cleared) {
      expect(target.getSnapshot().data.legacySectionResumeByDevice['device-two'][SECTION_KEY].status).toBe('cleared');
      expect(target.getLegacySectionResume(SECTION_CHILD)).toBeNull();
    }
  });

  it('rejects unrelated sources, uncaptured/foreign contexts, and delayed restoration after reset', async () => {
    const { db, rawStorage } = await oldArchive(); const subject = create(db, { legacyStorage: rawStorage }); await subject.hydrate();
    const context = subject.captureWriteContext(SECTION_CHILD); const writes = db.writes;
    await expect(subject.restoreLegacySectionResume(SECTION_CHILD, `${SECTION_KEY}-unknown`, { context })).rejects.toThrow('Invalid legacy');
    await expect(subject.restoreLegacySectionResume(SECTION_CHILD, SECTION_KEY)).rejects.toThrow('Capture');
    await expect(subject.restoreLegacySectionResume(SECTION_CHILD, SECTION_KEY, { context: { ...context, ownerScope: 'guest:other' } })).rejects.toThrow('another owner');
    expect(db.writes).toBe(writes);
    await subject.resetActivity(SECTION_CHILD, { context });
    expect(await subject.restoreLegacySectionResume(SECTION_CHILD, SECTION_KEY, { context })).toMatchObject({ applied: false, reason: 'write-predates-reset' });
  });

  it('makes clear versus delayed restore atomic across independent IndexedDB connections', async () => {
    const factory = new IDBFactory();
    const aAdapter = createIndexedDbPersistence({ indexedDB: factory, createId: () => 'device-one' });
    const { rawStorage } = await oldArchive(aAdapter);
    const a = create(createIndexedDbPersistence({ indexedDB: factory, createId: () => 'device-one' }), { legacyStorage: rawStorage }); await a.hydrate();
    const b = create(createIndexedDbPersistence({ indexedDB: factory, createId: () => 'device-one' }), { legacyStorage: rawStorage }); await b.hydrate();
    const context = a.captureWriteContext(SECTION_CHILD);
    await b.clearResume(SECTION_CHILD, { context: b.captureWriteContext(SECTION_CHILD) });
    expect(await a.restoreLegacySectionResume(SECTION_CHILD, SECTION_KEY, { context })).toMatchObject({ applied: false, persisted: true, reason: 'section-resume-already-consumed' });
    await a.refresh(); expect(position(a)).toBeUndefined(); expect(checkpoint(a).status).toBe('cleared');
  });
});
