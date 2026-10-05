import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { SampleSizeLearningPage } from '@/components/05-estimation/5-3-SampleSizeCalculation';
import { ActiveProgressProvider } from '@/components/shared/ActiveProgressProvider';
import { MotionPreferenceContext } from '@/hooks/useReducedMotion';
import { createProgressStore } from '@/lib/progress/store';
import { createIndexedDbPersistence } from '@/lib/progress/persistence';
import { isActivityCompleted, selectChapterProgress, selectQuizProgress } from '@/lib/progress/selectors';
import { A, B, activeFixture, deferred } from '../progress/active/helpers';

// Progress, pinned mathematical children, controls, D3 and stores are real.
// Typesetting presentation and framework navigation are isolated here.
vi.mock('@/hooks/useMathJax', () => ({ useMathJax: () => React.useRef(null) }));
vi.mock('next/link', () => ({ default: React.forwardRef(function Link({ children, href, ...props }, ref) { return <a href={href} ref={ref} {...props}>{children}</a>; }) }));
const ID = 'chapter-5:sample-size';
const resources = [];
afterEach(() => resources.splice(0).reverse().forEach(resource => resource.dispose?.()));
const subject = options => { const f = activeFixture({ schedule: () => 1, cancel: () => {}, ...options }); resources.push(f); return f; };
const page = f => <MotionPreferenceContext.Provider value={{ reducedMotion: true }}><ActiveProgressProvider controller={f.controller}><SampleSizeLearningPage /></ActiveProgressProvider></MotionPreferenceContext.Provider>;
const click = async name => { await act(async () => fireEvent.click(screen.getByRole('button', { name }))); };
const practice = () => click(/Practice Calculators and examples/);
const applications = () => click(/Applications Real-world scenarios/);
const ready = f => waitFor(() => expect(f.controller.getSnapshot().state.loading).toBe(false));
const locator = f => f.controller.getSnapshot().state.data.resumeByDevice[f.controller.getSnapshot().state.data.deviceId]?.[ID];
async function mount(f, { strict = false } = {}) { const view = render(strict ? <StrictMode>{page(f)}</StrictMode> : page(f)); await ready(f); return view; }
async function account(f, id) { f.setAccount(id); await act(async () => { await f.controller.reconcile(); }); await waitFor(() => expect(f.controller.getSnapshot().account?.id).toBe(id)); }
const savedList = () => screen.queryByRole('heading', { name: 'Saved Calculations' });
function ownGuest({ factory = new IDBFactory(), databaseName = 'sample-study-reload', heldIdentity } = {}) {
  const persistence = createIndexedDbPersistence({ indexedDB: factory, databaseName });
  if (heldIdentity) { const getIdentity = persistence.getIdentity; persistence.getIdentity = async () => { await heldIdentity.promise; return getIdentity(); }; }
  const store = createProgressStore({ persistence, ownerScope: 'guest:sample-study-device', deviceId: 'sample-study-device', legacyStorage: null, importLegacy: false, pollInterval: 0, eventTarget: new EventTarget(), document: new EventTarget(), broadcastFactory: () => null });
  resources.push(store); return { store, persistence, factory, databaseName };
}

it('mounts in Strict Mode without studying hidden panels, changing a locator or recording quiz attainment; study is explicit', async () => {
  const f = subject(); await mount(f, { strict: true });
  expect(f.controller.getSnapshot().account).toBeNull();
  expect(f.guest.getSnapshot().data.activities).toEqual({}); expect(locator(f)).toBeUndefined();
  await practice(); await click('Save Result');
  fireEvent.change(screen.getByPlaceholderText('Enter your answer'), { target: { value: '82' } }); await click('Check Answer');
  expect(screen.getByText('Correct! Well done.')).toBeInTheDocument();
  await applications();
  expect(f.guest.getSnapshot().data.activities).toEqual({});
  expect(selectQuizProgress(f.guest.getSnapshot().data, 5)).toMatchObject({ attempted: false, passed: false });
  await click('Mark as studied');
  await screen.findByRole('button', { name: 'Lesson studied' });
  expect(f.guest.getSnapshot().data.activities[ID].evidence).toEqual([expect.objectContaining({ kind: 'study-completed', sourceKey: 'sample-size-explicit-study' })]);
  expect(selectChapterProgress(f.guest.getSnapshot().data, 5).primary.completed).toBe(1);
  expect(f.guest.getSnapshot().data.quizAttempts).toEqual({});
  expect(screen.getByRole('heading', { name: 'Continue learning' })).toBeInTheDocument();
});

it('keeps all three math panels mounted across modes and records only the selected device-private mode', async () => {
  const f = subject(); await mount(f); await practice(); await click('Save Result');
  await applications(); await click(/Foundations Core concepts and theory/); await practice();
  expect(savedList()).toBeInTheDocument(); expect(screen.getByText('σ=15, E=2, 95% → n=217')).toBeInTheDocument();
  await waitFor(() => expect(locator(f)).toMatchObject({ containerId: ID, activityId: null, kind: 'tab', positionId: 'practice' }));
  expect(f.guest.getSnapshot().data.activities).toEqual({});
});

it('restores mode and study from a fresh IndexedDB store while leaving calculations and practice visit-only', async () => {
  const local = ownGuest(); const f = subject({ getGuestStore: () => local.store }); const view = await mount(f);
  await practice(); await click('Save Result'); await click('Mark as studied'); await screen.findByRole('button', { name: 'Lesson studied' });
  view.unmount(); local.store.dispose();
  const restored = ownGuest({ factory: local.factory, databaseName: local.databaseName }); const next = subject({ getGuestStore: () => restored.store }); await mount(next);
  expect(screen.getByRole('heading', { name: 'Sample Size Calculator' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Lesson studied' })).toBeDisabled();
  expect(savedList()).not.toBeInTheDocument();
  expect(screen.getByText(/Calculations and practice answers stay in this visit/)).toBeInTheDocument();
  expect(restored.store.getSnapshot().data.quizAttempts).toEqual({});
});

it('does not send a mode locator to the cloud and keeps local study save separate from remote acknowledgement', async () => {
  const f = subject(); f.setAccount(A); await mount(f); await waitFor(() => expect(f.controller.getSnapshot().account?.id).toBe(A));
  await practice();
  expect(f.accounts.get(A).getSnapshot().cloud.pendingMutations).toBe(0);
  expect(f.remote.get(A).document.facts.activities).toEqual({});
  const held = f.holdRemote(A); await click('Mark as studied'); await held.entered.promise;
  expect(screen.getByRole('button', { name: 'Lesson studied' })).toBeDisabled();
  expect(screen.getByText('Study saved in this browser.')).toBeInTheDocument();
  expect(screen.queryByText(/synchronized|cloud.*acknowledged/i)).not.toBeInTheDocument();
  expect(f.accounts.get(A).getSnapshot().cloud.pendingMutations).toBe(1);
  await act(async () => { held.gate.resolve(); });
  await waitFor(() => expect(f.accounts.get(A).getSnapshot().cloud.pendingMutations).toBe(0));
  expect(f.remote.get(A).document.facts.activities[ID]).toBeDefined();
  expect(f.remote.get(A).document.facts).not.toHaveProperty('resumeByDevice');
  expect(f.remote.get(A).document.facts.quizAttempts).toEqual({});
});

it('isolates mode, saved calculations and study on A→B and restores only A own mode/study when A returns', async () => {
  const f = subject(); f.setAccount(A); await mount(f); await waitFor(() => expect(f.controller.getSnapshot().account?.id).toBe(A));
  await practice(); await click('Save Result'); await click('Mark as studied'); await screen.findByRole('button', { name: 'Lesson studied' }); await applications();
  await account(f, B);
  expect(screen.getByRole('heading', { name: 'The Fundamental Question' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Mark as studied' })).toBeEnabled();
  await practice(); expect(savedList()).not.toBeInTheDocument();
  expect(f.accounts.get(B).getSnapshot().data.activities).toEqual({});
  await account(f, A);
  expect(screen.getByRole('heading', { name: 'Real-World Applications' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Lesson studied' })).toBeDisabled();
  await practice(); expect(savedList()).not.toBeInTheDocument();
});

it.each(['lesson', 'chapter', 'global'])('a %s reset clears mode/study/private local work and does not automatically recreate a locator', async scope => {
  const f = subject(); await mount(f); await practice(); await click('Save Result'); await click('Mark as studied'); await screen.findByRole('button', { name: 'Lesson studied' });
  await act(async () => {
    if(scope === 'lesson') await f.guest.resetActivity(ID, { context: f.guest.captureWriteContext(ID) });
    if(scope === 'chapter') await f.guest.resetChapter(5, { context: f.guest.captureWriteContext('chapter-5') });
    if(scope === 'global') await f.guest.resetAll({ context: f.guest.captureWriteContext() });
  });
  expect(screen.getByRole('heading', { name: 'The Fundamental Question' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Mark as studied' })).toBeEnabled();
  expect(locator(f)).toBeUndefined(); expect(f.guest.getSnapshot().data.activities).toEqual({});
  await practice(); expect(savedList()).not.toBeInTheDocument();
});

it('keeps math work and mode when an unrelated chapter resets', async () => {
  const f = subject(); await mount(f); await practice(); await click('Save Result');
  await act(async () => { await f.guest.resetChapter(4, { context: f.guest.captureWriteContext('chapter-4') }); });
  expect(screen.getByRole('heading', { name: 'Sample Size Calculator' })).toBeVisible(); expect(savedList()).toBeInTheDocument();
  expect(locator(f).positionId).toBe('practice');
});

it.each(['mode', 'study'])('a held %s write stays in A and cannot report success or change private work in B', async kind => {
  const f = subject(); f.setAccount(A); await mount(f); await waitFor(() => expect(f.controller.getSnapshot().account?.id).toBe(A));
  const held = f.holdWrite(A); await click(kind === 'mode' ? /Practice Calculators and examples/ : 'Mark as studied'); await held.entered.promise;
  await account(f, B); await act(async () => { held.gate.resolve(); });
  await waitFor(() => expect(f.accounts.get(A).getSnapshot().pendingLocalWrites).toBe(0));
  expect(screen.getByRole('heading', { name: 'The Fundamental Question' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Mark as studied' })).toBeEnabled();
  expect(screen.queryByText('Study saved in this browser.')).not.toBeInTheDocument();
  expect(f.accounts.get(B).getSnapshot().data.activities).toEqual({}); expect(locator(f)).toBeUndefined();
});

it.each(['mode', 'study'])('a held postcommit %s outcome is ignored after the lesson reset changes generation', async kind => {
  const f = subject(); await mount(f); const method = kind === 'mode' ? 'setResume' : 'completeActivity';
  const original = f.guest[method]; const held = deferred(); const entered = deferred();
  vi.spyOn(f.guest, method).mockImplementationOnce(async (...args) => { const result = await original(...args); entered.resolve(); await held.promise; return result; });
  await click(kind === 'mode' ? /Practice Calculators and examples/ : 'Mark as studied'); await entered.promise;
  await act(async () => { await f.guest.resetActivity(ID, { context: f.guest.captureWriteContext(ID) }); });
  await act(async () => { held.resolve(); });
  expect(screen.getByRole('heading', { name: 'The Fundamental Question' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Mark as studied' })).toBeEnabled();
  expect(screen.queryByText('Study saved in this browser.')).not.toBeInTheDocument();
  expect(locator(f)).toBeUndefined(); expect(f.guest.getSnapshot().data.activities).toEqual({});
});

it('keeps mode and study visit-only on quota failure, then verifies the retained writes when local saving is retried', async () => {
  const local = ownGuest(); const f = subject({ getGuestStore: () => local.store }); await mount(f);
  const update = local.persistence.update; let quota = true;
  local.persistence.update = (...args) => quota ? Promise.reject(new Error('Controlled quota failure')) : update(...args);
  await practice(); await waitFor(() => expect(local.store.getSnapshot().persistenceStatus).toBe('session-only'));
  expect(screen.getByRole('heading', { name: 'Sample Size Calculator' })).toBeVisible();
  await click('Mark as studied'); await screen.findByText('The study record could not be saved. Your existing records are retained.');
  expect(screen.getByRole('button', { name: 'Studied for this visit' })).toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Lesson studied' })).not.toBeInTheDocument();
  expect(screen.queryByText('Study saved in this browser.')).not.toBeInTheDocument();
  quota = false; await click('Try saving again'); await screen.findByRole('button', { name: 'Lesson studied' });
  const stored = await local.persistence.read('guest:sample-study-device');
  expect(isActivityCompleted(stored.data, ID)).toBe(true);
  expect(stored.data.resumeByDevice['sample-study-device'][ID].positionId).toBe('practice');
});

it('keeps learning readable while hydration disables scoped controls and never turns hydration into a study/resume write', async () => {
  const held = deferred(); const local = ownGuest({ heldIdentity: held }); const f = subject({ getGuestStore: () => local.store });
  render(page(f));
  expect(screen.getByRole('heading', { name: 'The Fundamental Question' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Mark as studied' })).toBeDisabled();
  expect(screen.getByRole('button', { name: /Practice Calculators and examples/ })).toBeDisabled();
  await act(async () => held.resolve()); await ready(f);
  expect(screen.getByRole('button', { name: 'Mark as studied' })).toBeEnabled();
  expect(local.store.getSnapshot().data.activities).toEqual({}); expect(locator(f)).toBeUndefined();
});

it('ignores unsupported or foreign-device saved positions without marking completion or rewriting them on mount', async () => {
  const local = ownGuest(); await local.store.hydrate();
  await local.store.setResume(ID, { activityId: null, kind: 'tab', positionId: 'practice' }, { context: local.store.captureWriteContext(ID) });
  await local.persistence.update('guest:sample-study-device', record => {
    record = structuredClone(record);
    record.data.resumeByDevice['foreign-device'] = { [ID]: { containerId: ID, kind: 'tab', activityId: null, positionId: 'practice' } };
    record.data.resumeByDevice['sample-study-device'] = { [ID]: { containerId: ID, kind: 'tab', activityId: null, positionId: 'unsupported-mode' } };
    return record;
  }); await local.store.refresh();
  const f = subject({ getGuestStore: () => local.store }); await mount(f);
  expect(screen.getByRole('heading', { name: 'The Fundamental Question' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Mark as studied' })).toBeEnabled();
  expect(locator(f).positionId).toBe('unsupported-mode');
  expect(local.store.getSnapshot().data.activities).toEqual({});
});
