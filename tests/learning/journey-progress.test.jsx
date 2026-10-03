import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MontyHallJourney from '@/components/01-introduction-to-probabilities/11-monty-hall-masterclass';
import CentralTendencyHub from '@/components/04-descriptive-statistics-sampling/4-2-central-tendency/4-2-0-CentralTendencyHub';
import DescriptiveStatsJourney from '@/components/04-descriptive-statistics-sampling/4-2-central-tendency/4-2-2-DescriptiveStatsJourney';
import progressService from '@/services/progressService';
import { LEGACY_SOURCE_BY_KEY } from '@/lib/curriculum/manifest';
import { createProgressStore } from '@/lib/progress/store';
import { isActivityCompleted } from '@/lib/progress/selectors';
import { environment, memoryPersistence, storageWith } from '../progress/store/helpers';

const deferred = vi.hoisted(() => ({ callbacks: [] }));
vi.mock('next/navigation', () => ({ usePathname: () => '/chapter4/central-tendency' }));
vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));
vi.mock('@/components/reference-sheets/Chapter1ReferenceSheet', () => ({ Chapter1ReferenceSheet: () => null }));
vi.mock('@/components/01-introduction-to-probabilities/11-monty-hall-masterclass/MontyHallIntro', () => ({ default: ({ onStageComplete }) => <><h3>Intro stage widget</h3><button onClick={onStageComplete}>Intro learning complete</button><button onClick={() => deferred.callbacks.push(onStageComplete)}>Finish intro later</button></> }));
vi.mock('@/components/01-introduction-to-probabilities/11-monty-hall-masterclass/MontyHallGame', () => ({ default: ({ onGameComplete }) => <><h3>Play stage widget</h3><input aria-label="Game draft" /><button onClick={onGameComplete}>Finish one game</button></> }));
vi.mock('@/components/01-introduction-to-probabilities/11-monty-hall-masterclass/MontyHallBayesProof', () => ({ default: () => <h3>Proof stage widget</h3> }));
vi.mock('@/components/01-introduction-to-probabilities/11-monty-hall-masterclass/MontyHallSimulation', () => ({ default: () => <h3>Simulation stage widget</h3> }));
vi.mock('@/components/04-descriptive-statistics-sampling/4-2-central-tendency/4-2-1-CentralTendencyIntro', () => ({ default: ({ onComplete }) => <><h3>Numerical introduction widget</h3><button onClick={() => deferred.callbacks.push(onComplete)}>Finish introduction later</button></> }));
vi.mock('@/components/04-descriptive-statistics-sampling/4-2-central-tendency/4-2-4-MathematicalFoundations', () => ({ default: ({ onComplete }) => <><h3>Mathematical foundation widget</h3><button onClick={() => deferred.callbacks.push(onComplete)}>Finish mathematics later</button></> }));

const stores = [];
beforeEach(() => { deferred.callbacks.length = 0; vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); });
afterEach(() => { cleanup(); stores.splice(0).forEach(store => store.dispose()); });
function setup({ persistence = memoryPersistence(), legacyStorage = storageWith() } = {}) {
  const store = createProgressStore(environment(persistence, { legacyStorage })); stores.push(store);
  vi.spyOn(progressService, 'getStore').mockReturnValue(store);
  return { store, persistence, legacyStorage };
}
const monty = LEGACY_SOURCE_BY_KEY['monty-hall-journey-progress'];
const central = LEGACY_SOURCE_BY_KEY.dataDescriptionsProgress;
const descriptive = LEGACY_SOURCE_BY_KEY['descriptive-stats-journey-progress'];
const settle = store => waitFor(() => expect(store.getSnapshot().pendingLocalWrites).toBe(0));
async function montyStage(title, heading) {
  fireEvent.click(screen.getByRole('button', { name: 'View All Stages' }));
  fireEvent.click(screen.getByRole('button', { name: new RegExp(title) }));
  await screen.findByRole('heading', { name: heading });
}
async function descriptiveStage(title) {
  fireEvent.click(screen.getByRole('button', { name: 'View All Stages' }));
  fireEvent.click(screen.getByRole('button', { name: title }));
  await waitFor(() => expect(screen.getByRole('heading', { name: new RegExp(`Stage \\d: ${title}`) })).toBeInTheDocument());
}

describe('canonical journey completion and resume', () => {
  it('keeps Monty navigation separate from explicit study and preserves the three-game completion callback', async () => {
    const { store, legacyStorage } = setup(); render(<MontyHallJourney />);
    await screen.findByRole('heading', { name: 'Intro stage widget' });
    fireEvent.click(screen.getByRole('button', { name: 'Next Stage →' }));
    await screen.findByRole('heading', { name: 'Play stage widget' });
    expect(store.getSnapshot().data.activities).toEqual({});
    for (let count = 0; count < 2; count++) fireEvent.click(screen.getByRole('button', { name: 'Finish one game' }));
    expect(store.getSnapshot().data.activities).toEqual({});
    fireEvent.click(screen.getByRole('button', { name: 'Finish one game' }));
    await screen.findByRole('heading', { name: 'Proof stage widget' }); await settle(store);
    expect(isActivityCompleted(store.getSnapshot().data, monty.targetIds[1])).toBe(true);
    expect(isActivityCompleted(store.getSnapshot().data, monty.targetIds[0])).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Mark stage as studied' }));
    await screen.findByRole('heading', { name: 'Simulation stage widget' });
    fireEvent.click(screen.getByRole('button', { name: 'Mark stage as studied' })); await settle(store);
    expect(isActivityCompleted(store.getSnapshot().data, monty.containerId)).toBe(false);
    await montyStage('The Paradox', 'Intro stage widget');
    fireEvent.click(screen.getByRole('button', { name: 'Intro learning complete' })); await settle(store);
    expect(isActivityCompleted(store.getSnapshot().data, monty.containerId)).toBe(true);
    expect(legacyStorage.getItem(monty.key)).toBeNull();
  });

  it('restores Monty stage facts/resume and rejects a delayed callback after reset without legacy resurrection', async () => {
    const raw = JSON.stringify({ stage: 0, completed: [1] });
    const { store, persistence, legacyStorage } = setup({ legacyStorage: storageWith({ [monty.key]: raw }) });
    const view = render(<MontyHallJourney />); await screen.findByRole('heading', { name: 'Intro stage widget' });
    fireEvent.click(screen.getByRole('button', { name: 'Finish intro later' }));
    await montyStage('Mathematical Proof', 'Proof stage widget'); await settle(store);
    view.unmount(); store.dispose(); const restored = setup({ persistence, legacyStorage }).store; render(<MontyHallJourney />);
    await screen.findByRole('heading', { name: 'Proof stage widget' });
    expect(isActivityCompleted(restored.getSnapshot().data, monty.targetIds[1])).toBe(true);
    await act(async () => { await restored.resetActivity(monty.containerId, { context: restored.captureWriteContext(monty.containerId) }); deferred.callbacks[0](); });
    await screen.findByRole('heading', { name: 'Intro stage widget' });
    expect(restored.getSnapshot().data.activities).toEqual({}); expect(legacyStorage.getItem(monty.key)).toBe(raw);
  });

  it('merges separate Central Tendency child callbacks, restores selection, and rejects an old reset callback', async () => {
    const { store, persistence, legacyStorage } = setup(); const view = render(<CentralTendencyHub />);
    const first = await screen.findByRole('button', { name: '1. Numerical Summaries Introduction' });
    fireEvent.keyDown(first, { key: 'Enter' });
    await screen.findByRole('heading', { name: 'Numerical introduction widget' });
    expect(store.getSnapshot().data.activities).toEqual({});
    fireEvent.click(screen.getByRole('button', { name: 'Finish introduction later' }));
    fireEvent.click(screen.getByRole('button', { name: '← Back to Learning Hub' }));
    fireEvent.click(await screen.findByRole('button', { name: '4. Mathematical Foundations' }));
    await screen.findByRole('heading', { name: 'Mathematical foundation widget' });
    fireEvent.click(screen.getByRole('button', { name: 'Finish mathematics later' }));
    await act(async () => { deferred.callbacks[0](); deferred.callbacks[1](); }); await settle(store);
    expect(isActivityCompleted(store.getSnapshot().data, central.targetIds[0])).toBe(true);
    expect(isActivityCompleted(store.getSnapshot().data, central.targetIds[3])).toBe(true);
    view.unmount(); store.dispose(); const restored = setup({ persistence, legacyStorage }).store; render(<CentralTendencyHub />);
    await screen.findByRole('heading', { name: 'Mathematical foundation widget' });
    fireEvent.click(screen.getByRole('button', { name: 'Finish mathematics later' }));
    await act(async () => { await restored.resetActivity(central.containerId, { context: restored.captureWriteContext(central.containerId) }); deferred.callbacks[2](); });
    await screen.findByRole('button', { name: '1. Numerical Summaries Introduction' });
    expect(restored.getSnapshot().data.activities).toEqual({});
    expect(legacyStorage.getItem('dataDescriptionsProgress')).toBeNull();
  });

  it('reuses the Central Tendency subscription inside its real descriptive journey and does not complete skipped stages', async () => {
    const { store } = setup(); const subscribe = vi.spyOn(store, 'subscribe');
    render(<CentralTendencyHub />);
    fireEvent.click(await screen.findByRole('button', { name: '2. Descriptive Stats Journey' }));
    await screen.findByRole('heading', { name: 'Data Descriptions Journey' });
    expect(subscribe).toHaveBeenCalledOnce();
    await descriptiveStage('Outlier Detection');
    fireEvent.click(screen.getByRole('button', { name: 'Complete Section' })); await settle(store);
    expect(isActivityCompleted(store.getSnapshot().data, descriptive.targetIds[3])).toBe(true);
    expect(isActivityCompleted(store.getSnapshot().data, descriptive.containerId)).toBe(false);
    await act(async () => { await store.resetActivity(descriptive.targetIds[3], { context: store.captureWriteContext(descriptive.targetIds[3]) }); });
    await screen.findByRole('heading', { name: 'Stage 4: Outlier Detection' });
    expect(isActivityCompleted(store.getSnapshot().data, descriptive.targetIds[3])).toBe(false);
    await screen.findByRole('button', { name: 'Mark stage as studied' });
    fireEvent.click(screen.getByRole('button', { name: 'Mark stage as studied' })); await settle(store);
    expect(isActivityCompleted(store.getSnapshot().data, descriptive.targetIds[3])).toBe(true);
    expect(isActivityCompleted(store.getSnapshot().data, descriptive.containerId)).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: '← Back to Learning Hub' }));
    await screen.findByRole('button', { name: '2. Descriptive Stats Journey' });
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('notifies once when all four actual descriptive stages are studied and keeps failure/retry truth', async () => {
    const { store, persistence, legacyStorage } = setup(); const complete = vi.fn(); render(<DescriptiveStatsJourney onComplete={complete} />);
    await screen.findByRole('heading', { name: 'Stage 1: Central Tendency Analysis' });
    persistence.failures.write = true;
    fireEvent.click(screen.getByRole('button', { name: 'Mark stage as studied' }));
    await waitFor(() => expect(screen.getByRole('button', { name: '✓ Stage studied' })).toBeDisabled());
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('only kept for this visit'));
    persistence.failures.write = false; fireEvent.click(screen.getByRole('button', { name: 'Try saving again' })); await settle(store);
    for (const title of ['Measuring Spread', 'Quartiles & IQR', 'Outlier Detection']) {
      await descriptiveStage(title); fireEvent.click(screen.getByRole('button', { name: 'Mark stage as studied' })); await settle(store);
    }
    await waitFor(() => expect(complete).toHaveBeenCalledOnce());
    expect(screen.getByText('All four journey stages are studied.')).toBeInTheDocument();
    expect(isActivityCompleted(store.getSnapshot().data, descriptive.containerId)).toBe(true);
    expect(store.getSnapshot().data.activities[descriptive.containerId]).toBeUndefined();
    expect(legacyStorage.getItem(descriptive.key)).toBeNull();
  });

  it('retains the actual fourth-interaction data-drag study rule while Reset Data changes no completion', async () => {
    const { store } = setup(); const { container } = render(<DescriptiveStatsJourney />);
    await screen.findByRole('heading', { name: 'Stage 1: Central Tendency Analysis' });
    for (let count = 0; count < 3; count++) fireEvent.click(screen.getByRole('button', { name: 'Add Outlier' }));
    expect(store.getSnapshot().data.activities).toEqual({});
    const point = container.querySelector('circle.point');
    const mouse = (target, type, x, buttons) => {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: 30, buttons });
      Object.defineProperty(event, 'view', { value: window });
      fireEvent(target, event);
    };
    mouse(point, 'mousedown', 25, 1); mouse(window, 'mousemove', 50, 1); mouse(window, 'mouseup', 50, 0);
    await waitFor(() => expect(isActivityCompleted(store.getSnapshot().data, descriptive.targetIds[0])).toBe(true));
    fireEvent.click(screen.getByRole('button', { name: 'Reset Data' }));
    expect(screen.getByText('Current values: 5.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 14.0, 15.0, 18.0')).toBeInTheDocument();
    expect(isActivityCompleted(store.getSnapshot().data, descriptive.targetIds[0])).toBe(true);
  });
});
