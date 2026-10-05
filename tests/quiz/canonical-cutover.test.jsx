import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChapterQuiz } from '@/components/quiz/ChapterQuiz';
import { quizStorage } from '@/lib/quiz/quizStorage';
import { useProgress } from '@/hooks/useProgress';
import { MotionPreferenceContext } from '@/hooks/useReducedMotion';
import { selectQuizProgress } from '@/lib/progress/selectors';
import progressService from '@/services/progressService';
import { createProgressStore } from '@/lib/progress/store';
import { environment, memoryPersistence } from '../progress/store/helpers';

vi.mock('@/hooks/useMathJax', () => ({ useMathJax: () => React.useRef(null) }));
vi.mock('@/lib/quiz/questionBank', () => ({
  isQuizVersion: version => ['engineering', 'biostats', 'social'].includes(version),
  getChapterQuestions: (chapter, version = 'engineering') => ({ title: `Test chapter ${chapter}`, timeLimit: 1, passingScore: 50, bankRevision: 'bank-test-1', requestedVersion: version, effectiveVersion: 'engineering', questions }),
}));
const originalQuestions = [
  { id: 'question-one', type: 'multiple-choice', topic: 'Basics', question: 'Choose A', options: ['A', 'B'], correct: 0, explanation: 'A is correct.' },
  { id: 'question-two', type: 'multi-select', topic: 'Events', question: 'Choose C and D', options: ['C', 'D', 'E'], correct: [0, 1], explanation: 'C and D are correct.' },
];
let questions;
let persistence;
let store;
let storeSpy;
const flush = () => act(async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); });
const click = async button => { await act(async () => { fireEvent.click(button); }); await flush(); };
const session = (chapter = 1) => store.getSnapshot().data.resumeByDevice['device-one']?.[`chapter-${chapter}:quiz`]?.session;
function instance(db = persistence) { return createProgressStore(environment(db, { legacyStorage: window.localStorage, now: () => new Date().toISOString() })); }
beforeEach(() => {
  questions = JSON.parse(JSON.stringify(originalQuestions)); persistence = memoryPersistence(); store = instance();
  storeSpy = vi.spyOn(progressService, 'getStore').mockImplementation(() => store);
});
afterEach(() => { store.dispose(); storeSpy.mockRestore(); vi.useRealTimers(); });
async function start(chapter = 1, version = 'engineering') {
  const view = render(<ChapterQuiz chapterId={chapter} version={version} />); await flush();
  await click(screen.getByRole('button', { name: 'Start Quiz' })); return view;
}
async function partialFinish() {
  await click(screen.getByRole('button', { name: 'Finish and review' }));
  await click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Finish and review' }));
}
function SharedSummary() {
  const { learningData } = useProgress();
  const summary = selectQuizProgress(learningData, 1);
  return <output aria-label="Shared quiz summary">{summary.attemptCount} attempts; {summary.bestScore}% best; {summary.passed ? 'passed' : 'not passed'}</output>;
}

describe('canonical quiz writer integration', () => {
  it('waits for hydration before presenting a writable quiz', async () => {
    let release;
    const read = persistence.read.bind(persistence); let held = true;
    persistence.read = async scope => { if (held) await new Promise(resolve => { release = resolve; }); return read(scope); };
    render(<ChapterQuiz />); await flush();
    expect(screen.getByRole('status')).toHaveTextContent('Loading saved quiz progress');
    expect(screen.queryByRole('button', { name: 'Start Quiz' })).toBeNull();
    expect(persistence.writes).toBe(0);
    held = false; await act(async () => { release(); }); await flush();
    expect(screen.getByRole('button', { name: 'Start Quiz' })).toBeEnabled();
  });

  it('pins fallback identity and full question text independently of later bank edits and reloads', async () => {
    const view = await start(2, 'biostats');
    expect(screen.getByText(/Requested Biostats; using Engineering/)).toBeInTheDocument();
    expect(session(2).bank).toMatchObject({ revision: 'bank-test-1', requestedVersion: 'biostats', effectiveVersion: 'engineering' });
    questions[0].question = 'Changed current bank'; questions[0].correct = 1;
    view.unmount(); store.dispose(); store = instance();
    render(<ChapterQuiz chapterId={2} version="social" />); await flush();
    expect(screen.getByText('Choose A')).toBeInTheDocument();
    expect(screen.queryByText('Changed current bank')).toBeNull();
    expect(screen.getByText(/saved session keeps its original questions/)).toBeInTheDocument();
    expect(session(2).bank.questions[0].correct).toBe(0);
  });

  it('preserves current question, flags, pause and deadline across a real store reload', async () => {
    const view = await start();
    await click(screen.getByRole('button', { name: 'Next' }));
    await click(screen.getByRole('button', { name: 'Flag for Review' }));
    await click(screen.getByRole('button', { name: 'Pause quiz timer' }));
    const saved = JSON.parse(JSON.stringify(session()));
    view.unmount(); store.dispose(); store = instance();
    render(<ChapterQuiz />); await flush();
    expect(screen.getByText('Choose C and D')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resume quiz timer' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Flagged' })).toBeInTheDocument();
    expect(session()).toEqual(saved);
    await click(screen.getByRole('button', { name: 'Resume quiz timer' }));
    expect(session().deadline).toBeGreaterThanOrEqual(saved.deadline);
    expect(session().isPaused).toBe(false);
  });

  it('keeps active chapter saves independent', async () => {
    const one = await start(1); const saved = JSON.parse(JSON.stringify(session(1))); one.unmount();
    await start(2);
    expect(session(1)).toEqual(saved);
    expect(session(2).sessionId).not.toBe(saved.sessionId);
  });

  it.each([
    ['single', 'Flag for Review'], ['single', 'Pause quiz timer'],
    ['multi', 'Flag for Review'], ['multi', 'Pause quiz timer'],
  ])('keeps an unsubmitted %s draft through %s without inventing a submitted answer', async (type, action) => {
    await start();
    if (type === 'multi') await click(screen.getByRole('button', { name: 'Next' }));
    const selected = type === 'single' ? ['A'] : ['C', 'D'];
    for (const name of selected) await click(screen.getByRole('button', { name }));
    await click(screen.getByRole('button', { name: action }));
    for (const name of selected) expect(screen.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'true');
    expect(session().answersByQuestionId).toEqual({});
    await click(screen.getByRole('button', { name: 'Submit' }));
    expect(session().answersByQuestionId[type === 'single' ? 'question-one' : 'question-two'].isCorrect).toBe(true);
  });

  it.each([
    ['single', 'Flag for Review'], ['single', 'Pause quiz timer'],
    ['multi', 'Flag for Review'], ['multi', 'Pause quiz timer'],
  ])('keeps a %s Try Again draft through %s while retaining only the prior submitted answer', async (type, action) => {
    await start();
    if (type === 'multi') await click(screen.getByRole('button', { name: 'Next' }));
    await click(screen.getByRole('button', { name: type === 'single' ? 'B' : 'E' }));
    await click(screen.getByRole('button', { name: 'Submit' }));
    const questionId = type === 'single' ? 'question-one' : 'question-two';
    const submitted = JSON.parse(JSON.stringify(session().answersByQuestionId[questionId]));
    await click(screen.getByRole('button', { name: 'Try Again' }));
    const selected = type === 'single' ? ['A'] : ['C', 'D'];
    for (const name of selected) await click(screen.getByRole('button', { name }));
    await click(screen.getByRole('button', { name: action }));
    for (const name of selected) expect(screen.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
    expect(session().answersByQuestionId[questionId]).toEqual(submitted);
    await click(screen.getByRole('button', { name: 'Submit' }));
    expect(session().answersByQuestionId[questionId].isCorrect).toBe(true);
  });

  it.each(['single', 'multi'])('does not reveal %s answers while initial persistence temporarily locks interaction', async type => {
    if (type === 'multi') questions = [questions[1]];
    await store.hydrate();
    const update = persistence.update.bind(persistence); let release;
    persistence.update = async (...args) => {
      await new Promise(resolve => { release = resolve; });
      return update(...args);
    };
    render(<ChapterQuiz />); await flush();
    try {
      await click(screen.getByRole('button', { name: 'Start Quiz' }));
      expect(screen.getByText(type === 'single' ? 'Choose A' : 'Choose C and D')).toBeInTheDocument();
      expect(screen.getByRole('status', { name: 'Quiz saving' })).toHaveTextContent('Saving');
      expect(screen.queryByRole('button', { name: /Correct answer/ })).toBeNull();
      expect(screen.queryByText('Should be selected')).toBeNull();
      expect(screen.queryByText('Explanation:')).toBeNull();
      expect(screen.getByRole('button', { name: type === 'single' ? 'A' : 'C' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    } finally {
      persistence.update = update;
      await act(async () => { release?.(); }); await flush();
    }
    expect(screen.getByRole('button', { name: type === 'single' ? 'A' : 'C' })).toBeEnabled();
    expect(session().answersByQuestionId).toEqual({});
  });

  it('starts a new chapter while an old chapter start settles without leaking its busy state', async () => {
    await store.hydrate();
    const begin = store.beginQuizSession; let release; let first = true;
    vi.spyOn(store, 'beginQuizSession').mockImplementation(async (...args) => {
      if (first) { first = false; await new Promise(resolve => { release = resolve; }); }
      return begin(...args);
    });
    const view = render(<ChapterQuiz chapterId={1} />); await flush();
    await click(screen.getByRole('button', { name: 'Start Quiz' }));
    expect(screen.getByRole('button', { name: 'Start Quiz' })).toBeDisabled();
    view.rerender(<ChapterQuiz chapterId={2} />); await flush();
    expect(screen.getByRole('button', { name: 'Start Quiz' })).toBeEnabled();
    await click(screen.getByRole('button', { name: 'Start Quiz' }));
    const chapterTwoSessionId = session(2).sessionId;
    await act(async () => { release(); }); await flush();
    expect(screen.getByRole('heading', { name: 'Test chapter 2' })).toBeInTheDocument();
    expect(session(2).sessionId).toBe(chapterTwoSessionId);
    expect(screen.getByRole('button', { name: 'A' })).toBeEnabled();
    expect(session(1)).toBeDefined();
  });

  it('closes the previous chapter finish confirmation on a scope change', async () => {
    const view = await start(1);
    await click(screen.getByRole('button', { name: 'Finish and review' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    view.rerender(<ChapterQuiz chapterId={2} />); await flush();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Start Quiz' })).toBeEnabled();
    await click(screen.getByRole('button', { name: 'Start Quiz' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps hidden timer Pause and Resume controls usable across a paused store reload', async () => {
    await store.hydrate(); await quizStorage.savePreferences({ showTimer: false });
    const view = await start();
    expect(screen.getByText('Timer hidden · Running')).toBeInTheDocument();
    expect(screen.queryByText(/\d{2}:\d{2}/)).toBeNull();
    await click(screen.getByRole('button', { name: 'Pause quiz timer' }));
    const paused = JSON.parse(JSON.stringify(session()));
    view.unmount(); store.dispose(); store = instance();
    render(<ChapterQuiz />); await flush();
    expect(screen.getByText('Timer hidden · Paused')).toBeInTheDocument();
    expect(session()).toEqual(paused);
    await click(screen.getByRole('button', { name: 'Resume quiz timer' }));
    expect(screen.getByRole('button', { name: 'Pause quiz timer' })).toBeInTheDocument();
    expect(session().isPaused).toBe(false);
    expect(session().deadline).toBeGreaterThanOrEqual(paused.deadline);
  });

  it.each([false, true])('focuses and scrolls the question heading only after deliberate navigation (reduced motion: %s)', async reducedMotion => {
    const scroll = vi.fn();
    const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scroll });
    try {
      const view = render(<MotionPreferenceContext.Provider value={{ reducedMotion }}><ChapterQuiz /></MotionPreferenceContext.Provider>);
      await flush();
      const startButton = screen.getByRole('button', { name: 'Start Quiz' }); startButton.focus();
      await click(startButton);
      const heading = screen.getByRole('heading', { name: 'Choose A' });
      expect(heading).toHaveFocus();
      await click(screen.getByRole('button', { name: 'A' })); await click(screen.getByRole('button', { name: 'Submit' }));
      const next = screen.getByRole('button', { name: 'Next Question' }); next.focus();
      await click(next);
      expect(screen.getByRole('heading', { name: 'Choose C and D' })).toHaveFocus();
      expect(scroll).toHaveBeenCalledTimes(2);
      expect(scroll).toHaveBeenLastCalledWith({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
      await click(screen.getByRole('button', { name: 'Flag for Review' }));
      expect(scroll).toHaveBeenCalledTimes(2);
      view.unmount();
      render(<MotionPreferenceContext.Provider value={{ reducedMotion }}><ChapterQuiz /></MotionPreferenceContext.Provider>); await flush();
      expect(screen.getByRole('heading', { name: 'Choose C and D' })).not.toHaveFocus();
    } finally {
      if (originalScroll) Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalScroll);
      else delete HTMLElement.prototype.scrollIntoView;
    }
  });

  it('focuses completed results and saved review after explicit actions without focusing background reloads', async () => {
    const view = await start();
    await click(screen.getByRole('button', { name: 'A' }));
    await click(screen.getByRole('button', { name: 'Submit' }));
    await partialFinish();
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Quiz Complete' })).toHaveFocus());
    await click(screen.getByRole('button', { name: 'Review Answers' }));
    expect(screen.getByRole('heading', { name: 'Choose A' })).toHaveFocus();
    await click(screen.getByRole('button', { name: 'Back to Results' }));
    expect(screen.getByRole('heading', { name: 'Quiz Complete' })).toHaveFocus();
    await click(screen.getByRole('button', { name: 'Retake Quiz' }));
    expect(screen.getByRole('heading', { name: 'Choose A' })).toHaveFocus();
    await partialFinish();
    view.unmount();
    render(<ChapterQuiz />); await flush();
    expect(screen.getByRole('button', { name: 'Start Quiz' })).not.toHaveFocus();
    await click(screen.getByRole('button', { name: 'Review latest saved attempt' }));
    expect(screen.getByRole('heading', { name: 'Choose A' })).toHaveFocus();
  });

  it('returns focus to the finishing control when the student keeps practicing', async () => {
    await start();
    const finish = screen.getByRole('button', { name: 'Finish and review' }); finish.focus();
    await click(finish);
    await click(screen.getByRole('button', { name: 'Keep practicing' }));
    await waitFor(() => expect(finish).toHaveFocus());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(store.getSnapshot().data.quizAttempts).toEqual({});
  });

  it('preserves the new chapter heading when an older dialog finishes closing', async () => {
    vi.useFakeTimers();
    const view = await start();
    await click(screen.getByRole('button', { name: 'Finish and review' }));
    view.rerender(<ChapterQuiz chapterId={2} />); await flush();
    await click(screen.getByRole('button', { name: 'Start Quiz' }));
    expect(screen.getByRole('heading', { name: 'Choose A' })).toHaveFocus();
    await act(async () => { await vi.advanceTimersByTimeAsync(1); }); await flush();
    expect(screen.getByRole('heading', { name: 'Choose A' })).toHaveFocus();
  });

  it('preserves deliberate navigation after cancelling a finish dialog', async () => {
    vi.useFakeTimers(); await start();
    await click(screen.getByRole('button', { name: 'Finish and review' }));
    await click(screen.getByRole('button', { name: 'Keep practicing' }));
    await click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'Choose C and D' })).toHaveFocus();
    await act(async () => { await vi.advanceTimersByTimeAsync(1); }); await flush();
    expect(screen.getByRole('heading', { name: 'Choose C and D' })).toHaveFocus();
  });

  it('discards a rejected Start focus request before a background session appears', async () => {
    render(<ChapterQuiz />); await flush();
    vi.spyOn(store, 'beginQuizSession').mockRejectedValueOnce(new Error('Start rejected'));
    const startButton = screen.getByRole('button', { name: 'Start Quiz' }); startButton.focus();
    await click(startButton);
    expect(startButton).toHaveFocus();
    const now = Date.now();
    await act(async () => { await store.beginQuizSession(1, {
      sessionId: 'background-session', chapterId: 'chapter-1',
      bank: { revision: 'bank-test-1', requestedVersion: 'engineering', effectiveVersion: 'engineering', questions },
      currentQuestionId: questions[0].id, answersByQuestionId: {}, flaggedQuestionIds: [],
      startTime: now, deadline: now + 60000, isPaused: false, pausedRemaining: null,
    }, { context: store.captureWriteContext('chapter-1:quiz') }); }); await flush();
    expect(screen.getByRole('heading', { name: 'Choose A' })).not.toHaveFocus();
  });

  it('archives old indexed answers without resuming or mapping them to current questions', async () => {
    const raw = JSON.stringify({ chapterId: 1, version: 'engineering', currentQuestion: 1, answers: { 0: { answer: 1, isCorrect: true } }, startTime: Date.now() });
    localStorage.setItem('quiz_current_session', raw);
    render(<ChapterQuiz />); await flush();
    expect(screen.getByRole('status', { name: 'Historical quiz session' })).toHaveTextContent('no verified question bank');
    expect(screen.queryByText('Choose C and D')).toBeNull();
    await click(screen.getByRole('button', { name: 'Start Quiz' }));
    expect(session().answersByQuestionId).toEqual({});
    expect(localStorage.getItem('quiz_current_session')).toBe(raw);
    expect(store.getSnapshot().data.migration.sources.quiz_current_session.raw).toBe(raw);
  });

  it.each(['{broken', 'null', '[]'])('retains corrupt legacy input and keeps current practice usable (%s)', async raw => {
    localStorage.setItem('quiz_current_session', raw);
    await start();
    expect(session().bank.questions).toHaveLength(2);
    expect(store.getSnapshot().data.migration.sources.quiz_current_session.raw).toBe(raw);
    expect(localStorage.getItem('quiz_current_session')).toBe(raw);
  });

  it('shares a 50% finish reactively and reports quota failure without a false saved claim', async () => {
    await start(); render(<SharedSummary />); await flush();
    await click(screen.getByRole('button', { name: 'A' })); await click(screen.getByRole('button', { name: 'Submit' }));
    expect(Object.keys(session().answersByQuestionId)).toEqual(['question-one']);
    persistence.failures.write = true;
    await partialFinish();
    expect(screen.getByText('Quiz Complete')).toBeInTheDocument();
    expect(screen.getByLabelText('Shared quiz summary')).toHaveTextContent('1 attempts; 50% best; passed');
    expect(screen.getByRole('status', { name: 'Quiz saving' })).toHaveTextContent('saved in this tab only');
    expect(store.getSnapshot().pendingLocalWrites).toBe(1);
    expect(session()).toBeUndefined();
    persistence.failures.write = false; await click(screen.getByRole('button', { name: 'Retry saving' }));
    expect(screen.queryByRole('status', { name: 'Quiz saving' })).toBeNull();
    expect(quizStorage.getAttempts(1)).toHaveLength(1);
    expect(store.getSnapshot().data.activities).toEqual({});
  });

  it('reviews the saved pinned bank after reload and distinguishes an unanswered question', async () => {
    const view = await start();
    await click(screen.getByRole('button', { name: 'A' })); await click(screen.getByRole('button', { name: 'Submit' }));
    await partialFinish();
    const attempt = quizStorage.getLastAttempt(1); view.unmount();
    questions[0].question = 'Changed question'; questions[0].correct = 1;
    render(<ChapterQuiz />); await flush();
    await click(screen.getByRole('button', { name: 'Review latest saved attempt' }));
    expect(screen.getByText('Choose A')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /A.*Correct answer/ })).toHaveAttribute('aria-pressed', 'true');
    await click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('status')).toHaveTextContent('Not answered');
    expect(quizStorage.getLastAttempt(1)).toEqual(attempt);
  });

  it('rejects late save/clear callbacks after a retake without changing the new bank or answers', async () => {
    await start(); const old = JSON.parse(JSON.stringify(session())); const context = store.captureWriteContext('chapter-1:quiz');
    await partialFinish(); await click(screen.getByRole('button', { name: 'Retake Quiz' }));
    const retake = JSON.parse(JSON.stringify(session()));
    expect(await quizStorage.saveCurrentSession(1, old, { context })).toMatchObject({ applied: false });
    expect(await quizStorage.clearCurrentSession(1, old.sessionId, { context })).toMatchObject([{ applied: false }]);
    expect(session()).toEqual(retake);
    expect(quizStorage.getAttempts(1)).toHaveLength(1);
  });

  it('captures a compatibility clear before its asynchronous work so a simultaneous retake survives', async () => {
    await start(); const old = JSON.parse(JSON.stringify(session()));
    await act(async () => {
      const clearing = quizStorage.clearCurrentSession(1);
      await store.beginQuizSession(1, { ...old, sessionId: 'new-retake' }, { context: store.captureWriteContext('chapter-1:quiz') });
      await clearing;
    }); await flush();
    expect(session().sessionId).toBe('new-retake');
  });

  it('archives delayed legacy session saves without overwriting a pinned retake', async () => {
    await store.hydrate(); const context = store.captureWriteContext('chapter-1:quiz');
    await start(); const current = JSON.parse(JSON.stringify(session()));
    await act(async () => {
      expect(await quizStorage.saveCurrentSession(1, { currentQuestion: 1, answers: { 0: { answer: 1 } }, startTime: 1234 }, { context })).toBe(true);
    }); await flush();
    expect(session()).toEqual(current);
    expect(store.getSnapshot().data.migration.sources.quiz_current_session.raw).toContain('1234');
  });

  it('clears an unverified old session while keeping its score and raw archive', async () => {
    const raw = JSON.stringify({ chapterId: 1, currentQuestion: 1, answers: { 0: { answer: 1 } }, startTime: 1234 });
    localStorage.setItem('quiz_current_session', raw); localStorage.setItem('quiz_best_scores', '{"1":90}');
    await quizStorage.hydrate(); const context = store.captureWriteContext('chapter-1:quiz');
    expect(await quizStorage.clearCurrentSession(1, undefined, { context })).toMatchObject([{ applied: true }]);
    expect(quizStorage.getCurrentSession(1)).toBeNull();
    expect(quizStorage.getBestScore(1)).toBe(90);
    expect(localStorage.getItem('quiz_current_session')).toBe(raw);
    expect(store.getSnapshot().data.migration.sources.quiz_current_session.raw).toBe(raw);
    expect(await quizStorage.saveCurrentSession(1, { currentQuestion: 0, answers: {} }, { context })).toBe(false);
    expect(quizStorage.getCurrentSession(1)).toBeNull();
  });

  it('reacts to a quiz reset and rejects delayed indexed compatibility writes instead of resurrecting them', async () => {
    await start(); const old = JSON.parse(JSON.stringify(session())); const context = store.captureWriteContext('chapter-1:quiz');
    await act(async () => { await store.resetQuiz(1, { context }); }); await flush();
    expect(screen.getByRole('button', { name: 'Start Quiz' })).toBeInTheDocument();
    expect(await quizStorage.saveAttempt(1, { percentage: 100, answers: { 0: { answer: 0 } } }, { context })).toBeNull();
    expect(await quizStorage.saveCurrentSession(1, { currentQuestion: 0, answers: { 0: { answer: 0 } } }, { context })).toBe(false);
    expect(await quizStorage.saveCurrentSession(1, old, { context })).toMatchObject({ applied: false });
    expect(quizStorage.getAttempts(1)).toEqual([]);
    expect(session()).toBeUndefined();
  });

  it('clears quiz-only data while preserving study/device facts and read-only raw recovery', async () => {
    const raw = '{"1":90}'; localStorage.setItem('quiz_best_scores', raw);
    await quizStorage.hydrate();
    await store.completeActivity('chapter-1:foundations'); await store.setDevicePreference('sidebarOpen', true);
    await quizStorage.savePreferences({ version: 'social', showTimer: false });
    await start(); await partialFinish();
    await act(async () => { await quizStorage.clearAllData(); }); await flush();
    expect(quizStorage.getAttempts(1)).toEqual([]); expect(quizStorage.getBestScore(1)).toBe(0);
    expect(quizStorage.getPreferences().showTimer).toBe(true);
    expect(store.getSnapshot().data.activities['chapter-1:foundations']).toBeDefined();
    expect(store.getSnapshot().data.preferences.device.sidebarOpen).toBe(true);
    await store.refreshLegacy(); expect(quizStorage.getBestScore(1)).toBe(0);
    expect(localStorage.getItem('quiz_best_scores')).toBe(raw);
  });

  it('uses canonical preference patches and keeps legacy writer input as unverified raw history', async () => {
    await quizStorage.savePreferences({ immediateFeeback: true });
    expect(store.getSnapshot().data.preferences.quiz).toEqual({ immediateFeedback: true });
    const original = { id: 'historical-one', date: '2025-02-14T15:00:00Z', percentage: 90, score: 9, totalQuestions: 10, correctAnswers: 9, timeSpent: 40, answers: { 0: { answer: 1, isCorrect: true, timestamp: 100 } } };
    await quizStorage.saveAttempt(1, original);
    expect(quizStorage.getAttempts(1)[0]).toMatchObject({ legacy: true, originalId: 'historical-one', percentage: 90, effectiveVersion: null, bankRevision: null, answers: original.answers });
    expect(localStorage.getItem('quiz_attempts')).toBeNull();
    const exported = await quizStorage.exportData();
    expect(exported.snapshot.migration.sources.quiz_attempts.raw).toContain('2025-02-14T15:00:00Z');
  });

  it('does not reinterpret an unsupported client variant as a requested bank', async () => {
    render(<ChapterQuiz version="unexpected" />); await flush();
    expect(screen.getByText(/quiz or version is unavailable/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start Quiz' })).toBeNull();
    expect(store.getSnapshot().data.quizAttempts).toEqual({});
    expect(session()).toBeUndefined();
  });

  it('finishes exactly once after initial persistence settles beyond the session deadline', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-03T12:00:00Z'));
    await store.hydrate();
    const update = persistence.update.bind(persistence); let release; let held = true;
    persistence.update = async (...args) => {
      if (held) await new Promise(resolve => { release = resolve; });
      return update(...args);
    };
    render(<ChapterQuiz />); await flush();
    try {
      await click(screen.getByRole('button', { name: 'Start Quiz' }));
      const startedSessionId = session().sessionId;
      await act(async () => { vi.advanceTimersByTime(61000); }); await flush();
      expect(quizStorage.getAttempts(1)).toHaveLength(0);
      held = false; await act(async () => { release(); }); await flush();
      expect(screen.getByText('Quiz Complete')).toBeInTheDocument();
      expect(quizStorage.getAttempts(1)).toHaveLength(1);
      expect(quizStorage.getLastAttempt(1).sessionId).toBe(startedSessionId);
      expect(session()).toBeUndefined();
      await act(async () => { vi.advanceTimersByTime(5000); }); await flush();
      expect(quizStorage.getAttempts(1)).toHaveLength(1);
    } finally { held = false; release?.(); await flush(); }
  });

  it('returns to a fresh writable intro when another actual store resets during a held start write', async () => {
    await store.hydrate(); const other = instance(); await other.hydrate();
    const update = persistence.update.bind(persistence); let release; let first = true;
    persistence.update = async (...args) => {
      if (first) { first = false; await new Promise(resolve => { release = resolve; }); }
      return update(...args);
    };
    render(<ChapterQuiz />); await flush();
    try {
      await click(screen.getByRole('button', { name: 'Start Quiz' }));
      const oldSessionId = session().sessionId;
      await act(async () => { await other.resetQuiz(1, { context: other.captureWriteContext('chapter-1:quiz') }); });
      await act(async () => { release(); }); await flush();
      expect(session()).toBeUndefined();
      expect(screen.queryByText('Choose A')).toBeNull();
      expect(screen.getByRole('status', { name: 'Quiz saving' })).toHaveTextContent('reset');
      expect(screen.getByRole('button', { name: 'Start Quiz' })).toBeEnabled();
      await click(screen.getByRole('button', { name: 'Start Quiz' }));
      expect(session().sessionId).not.toBe(oldSessionId);
      expect(screen.getByRole('button', { name: 'A' })).toBeEnabled();
      expect(quizStorage.getAttempts(1)).toHaveLength(0);
    } finally { release?.(); await flush(); other.dispose(); }
  });

  it.each(['pause', 'reset', 'scope'])('does not finish stale pending-start work after %s when persistence settles past the old deadline', async control => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-03T12:00:00Z'));
    await store.hydrate();
    const update = persistence.update.bind(persistence); let release; let held = true; let resetting;
    persistence.update = async (...args) => {
      if (held) await new Promise(resolve => { release = resolve; });
      return update(...args);
    };
    const view = render(<ChapterQuiz />); await flush();
    try {
      await click(screen.getByRole('button', { name: 'Start Quiz' }));
      if (control === 'pause') await click(screen.getByRole('button', { name: 'Pause quiz timer' }));
      if (control === 'reset') { resetting = store.resetQuiz(1, { context: store.captureWriteContext('chapter-1:quiz') }); await flush(); }
      if (control === 'scope') { view.rerender(<ChapterQuiz chapterId={2} />); await flush(); }
      await act(async () => { vi.advanceTimersByTime(61000); }); await flush();
      held = false; await act(async () => { release(); await resetting; }); await flush();
      expect(quizStorage.getAttempts(1)).toHaveLength(0);
      expect(quizStorage.getAttempts(2)).toHaveLength(0);
      if (control === 'pause') {
        expect(session().isPaused).toBe(true);
        await click(screen.getByRole('button', { name: 'Resume quiz timer' }));
        expect(session().deadline).toBeGreaterThan(Date.now());
        await act(async () => { vi.advanceTimersByTime(61000); }); await flush();
        expect(quizStorage.getAttempts(1)).toHaveLength(1);
      } else {
        expect(screen.getByRole('button', { name: 'Start Quiz' })).toBeEnabled();
        if (control === 'reset') expect(session()).toBeUndefined();
        await act(async () => { vi.advanceTimersByTime(10000); }); await flush();
        expect(quizStorage.getAttempts(1)).toHaveLength(0);
      }
    } finally { held = false; release?.(); await flush(); }
  });

  it('finishes an expired hidden timer exactly once under StrictMode and preserves the tombstone on export', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-03T12:00:00Z'));
    await store.hydrate(); await quizStorage.savePreferences({ showTimer: false });
    const startTime = Date.now() - 60000;
    await store.beginQuizSession(1, { sessionId: 'expired-one', chapterId: 'chapter-1', bank: { revision: 'test', requestedVersion: 'engineering', effectiveVersion: 'engineering', questions }, currentQuestionId: 'question-one', answersByQuestionId: {}, flaggedQuestionIds: [], startTime, deadline: Date.now() - 1, isPaused: false, pausedRemaining: null }, { context: store.captureWriteContext('chapter-1:quiz') });
    render(<StrictMode><ChapterQuiz /></StrictMode>); await flush();
    expect(screen.getByText('Quiz Complete')).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(5000); }); await flush();
    expect(quizStorage.getAttempts(1)).toHaveLength(1);
    expect((await quizStorage.exportData()).checkpoint.closedQuizSessions['expired-one'].reason).toBe('finished');
    expect(session()).toBeUndefined();
  });
});
