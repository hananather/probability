import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgressiveContent } from '@/components/mdx/ProgressiveContent';
import { QuizBreak } from '@/components/mdx/QuizBreak';
import { SectionBreak } from '@/components/mdx/SectionBreak';
import progressService from '@/services/progressService';
import { LEGACY_SOURCE_BY_KEY } from '@/lib/curriculum/manifest';
import { createProgressStore } from '@/lib/progress/store';
import { isActivityCompleted } from '@/lib/progress/selectors';
import { environment, memoryPersistence, storageWith } from '../progress/store/helpers';

vi.mock('next/navigation', () => ({ usePathname: () => '/lesson-based-approach' }));
vi.mock('@/hooks/useMathJax', () => ({ useMathJax: () => React.useRef(null) }));
const SOURCE = LEGACY_SOURCE_BY_KEY['progressive-content-/lesson-based-approach'];
const resources = [];
const originalName = Object.getOwnPropertyDescriptor(SectionBreak, 'name');
beforeEach(() => { Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() }); });
afterEach(() => { cleanup(); resources.splice(0).forEach(store => store.dispose()); Object.defineProperty(SectionBreak, 'name', originalName); vi.useRealTimers(); });
function setup({ persistence = memoryPersistence(), legacyStorage = storageWith() } = {}) {
  const store = createProgressStore(environment(persistence, { legacyStorage })); resources.push(store);
  vi.spyOn(progressService, 'getStore').mockReturnValue(store);
  return { store, persistence, legacyStorage };
}
function lesson(Quiz = QuizBreak, progressKey) {
  return <ProgressiveContent progressKey={progressKey} onAnalytics={vi.fn()}>
    <h2>Introduction</h2><SectionBreak />
    <h2>Sample spaces</h2><Quiz question="Question 1" options={['Wrong 1', 'Right 1']} correct={1} /><SectionBreak />
    <h2>Events</h2><Quiz question="Question 2" options={['Wrong 2', 'Right 2']} correct={1} /><SectionBreak />
    <h2>Probability</h2><Quiz question="Question 3" options={['Wrong 3', 'Right 3']} correct={1} /><SectionBreak />
    <h2>Complements</h2><Quiz question="Question 4" options={['Wrong 4', 'Right 4']} correct={1} /><SectionBreak />
    <h2>Summary</h2>
  </ProgressiveContent>;
}
const ready = () => waitFor(() => expect(screen.getByText('Section 1 of 10')).toBeInTheDocument());
const continueLesson = async index => {
  fireEvent.click(screen.getByRole('button', { name: 'Continue →' }));
  await waitFor(() => expect(screen.getByText(`Section ${index + 1} of 10`)).toBeInTheDocument());
};
const settle = store => waitFor(() => expect(store.getSnapshot().pendingLocalWrites).toBe(0));

describe('canonical progressive resource', () => {
  it('uses the actual imported static marker after name minification and preserves all ten positions', async () => {
    Object.defineProperty(SectionBreak, 'name', { configurable: true, value: 'a' });
    const { store, legacyStorage } = setup(); render(lesson()); await ready();
    expect(SectionBreak._isSectionBreak).toBe(true);
    await continueLesson(1);
    expect(screen.getByRole('button', { name: 'Complete Quiz to Continue' })).toBeDisabled();
    expect(store.getSnapshot().data.activities).toEqual({});
    fireEvent.click(screen.getByRole('button', { name: /Wrong 1/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.getByRole('button', { name: 'Complete Quiz to Continue' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    fireEvent.click(screen.getByRole('button', { name: /Right 1/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue →' })).toBeEnabled());
    expect(store.getSnapshot().data.activities[SOURCE.legacyPositions[1]].evidence[0].kind).toBe('knowledge-check-completed');
    expect(store.getSnapshot().data.activities[SOURCE.legacyPositions[0]]).toBeUndefined();
    await continueLesson(2); await settle(store);
    expect(store.getSnapshot().data.resumeByDevice[store.getSnapshot().data.deviceId][SOURCE.containerId]).toMatchObject({ activityId: null, positionId: 'position-2', legacyIndex: 2 });
    expect(screen.getByLabelText('Section 3 of 10')).toHaveFocus();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' });
    expect(legacyStorage.getItem(SOURCE.key)).toBeNull();
  });

  it('reloads a spacer position and never restores retained legacy completion after a canonical reset', async () => {
    const raw = JSON.stringify({ currentSection: 7, quizCompletions: { 'section-1': true } });
    const { store, persistence, legacyStorage } = setup({ legacyStorage: storageWith({ [SOURCE.key]: raw }) });
    await store.hydrate();
    await store.setResume(SOURCE.containerId, { activityId: null, kind: 'section', positionId: 'position-2', legacyIndex: 2 }, { context: store.captureWriteContext(SOURCE.containerId) });
    const view = render(lesson());
    await waitFor(() => expect(screen.getByText('Section 3 of 10')).toBeInTheDocument());
    expect(isActivityCompleted(store.getSnapshot().data, SOURCE.legacyPositions[1])).toBe(true);
    view.unmount(); store.dispose(); const restored = setup({ persistence, legacyStorage }).store; render(lesson());
    await waitFor(() => expect(screen.getByText('Section 3 of 10')).toBeInTheDocument());
    await act(async () => { await restored.resetActivity(SOURCE.containerId, { context: restored.captureWriteContext(SOURCE.containerId) }); });
    await ready(); expect(restored.getSnapshot().data.activities).toEqual({});
    expect(legacyStorage.getItem(SOURCE.key)).toBe(raw);
    cleanup(); restored.dispose(); const reloaded = setup({ persistence, legacyStorage }).store; render(lesson()); await ready();
    expect(reloaded.getSnapshot().data.activities).toEqual({});
  });

  it('ignores a delayed pre-reset quiz callback and merges independent current quiz callbacks', async () => {
    const callbacks = [];
    function DeferredQuiz({ question, onComplete }) { return <button onClick={() => callbacks.push(onComplete)}>Finish {question} later</button>; }
    DeferredQuiz._isQuizBreak = true;
    const { store } = setup(); render(lesson(DeferredQuiz)); await ready();
    await continueLesson(1); fireEvent.click(screen.getByRole('button', { name: 'Finish Question 1 later' }));
    await act(async () => { await store.resetActivity(SOURCE.containerId, { context: store.captureWriteContext(SOURCE.containerId) }); callbacks[0](); });
    expect(store.getSnapshot().data.activities).toEqual({});
    await act(async () => { await store.setResume(SOURCE.containerId, { activityId: SOURCE.legacyPositions[3], kind: 'section', legacyIndex: 3 }, { context: store.captureWriteContext(SOURCE.containerId) }); });
    fireEvent.click(screen.getByRole('button', { name: 'Finish Question 1 later' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finish Question 2 later' }));
    await act(async () => { callbacks[1](); callbacks[2](); }); await settle(store);
    expect(isActivityCompleted(store.getSnapshot().data, SOURCE.legacyPositions[1])).toBe(true);
    expect(isActivityCompleted(store.getSnapshot().data, SOURCE.legacyPositions[3])).toBe(true);
    expect(store.getSnapshot().data.activities[SOURCE.containerId]).toBeUndefined();
  });

  it('shows session truth after a failed correct-answer save and persists it on retry', async () => {
    const { store, persistence } = setup(); render(lesson()); await ready(); await continueLesson(1); await settle(store);
    persistence.failures.write = true;
    fireEvent.click(screen.getByRole('button', { name: /Right 1/ })); fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue →' })).toBeEnabled());
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('only kept for this visit'));
    persistence.failures.write = false;
    fireEvent.click(screen.getByRole('button', { name: 'Try saving again' })); await settle(store);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(isActivityCompleted(store.getSnapshot().data, SOURCE.legacyPositions[1])).toBe(true);
  });

  it('does not claim the entire resource is studied from visiting its summary or completing only quizzes', async () => {
    const { store } = setup(); await store.hydrate();
    await store.setResume(SOURCE.containerId, { activityId: SOURCE.legacyPositions[9], kind: 'section', legacyIndex: 9 }, { context: store.captureWriteContext(SOURCE.containerId) });
    render(lesson());
    expect(screen.getByText('Section 10 of 10')).toBeInTheDocument();
    expect(screen.getByText('Final section')).toBeInTheDocument();
    expect(store.getSnapshot().data.activities).toEqual({});
    for (let index = 1; index <= 4; index++) {
      const question = screen.getByText(`Question ${index}`).closest('div.my-12');
      fireEvent.click(within(question).getByRole('button', { name: new RegExp(`Right ${index}`) }));
      fireEvent.click(within(question).getByRole('button', { name: 'Submit' }));
    }
    await settle(store); expect(screen.getByText('Final section')).toBeInTheDocument();
    for (const button of screen.getAllByRole('button', { name: 'Mark section as studied' })) fireEvent.click(button);
    await waitFor(() => expect(screen.getByText('Lesson studied')).toBeInTheDocument());
    expect(store.getSnapshot().data.activities[SOURCE.containerId]).toBeUndefined();
  });

  it('keeps unknown keys and incompatible content layouts visibly session-only without arbitrary writes', async () => {
    setup(); localStorage.setItem('progressive-content-unknown', '{broken');
    const view = render(lesson(QuizBreak, 'progressive-content-unknown'));
    expect(screen.getByRole('status')).toHaveTextContent('only in this session');
    await continueLesson(1);
    expect(localStorage.getItem('progressive-content-unknown')).toBe('{broken');
    view.rerender(<ProgressiveContent><p>A different structure</p><SectionBreak /><p>Another section</p></ProgressiveContent>);
    expect(screen.getByRole('status')).toHaveTextContent('only in this session');
    expect(screen.getByText('Section 1 of 2')).toBeInTheDocument();
  });
});
