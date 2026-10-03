import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BookOpen } from 'lucide-react';
import { InteractiveJourneyNavigation } from '@/components/ui/InteractiveJourneyNavigation';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import ChapterHub from '@/components/shared/ChapterHub';
import { ChapterQuiz, QuizQuestionWrapper } from '@/components/quiz/ChapterQuiz';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import { quizStorage } from '@/lib/quiz/quizStorage';
import progressService from '@/services/progressService';
import { createProgressStore } from '@/lib/progress/store';
import { environment, memoryPersistence } from '../progress/store/helpers';

vi.mock('@/hooks/useMathJax', () => ({ useMathJax: () => React.useRef(null) }));
vi.mock('@/lib/quiz/questionBank', () => ({
  isQuizVersion: value => ['engineering', 'biostats', 'social'].includes(value),
  getChapterQuestions: (chapterId, version = 'engineering') => ({
    bankRevision: 'test-bank-1', requestedVersion: version, effectiveVersion: 'engineering',
    title: 'Test chapter', timeLimit: 1, passingScore: 50,
    questions: [
      { id: 'one', type: 'multiple-choice', topic: 'Basics', question: 'Choose one', options: ['A', 'B'], correct: 0, explanation: 'A is correct.' },
      { id: 'two', type: 'multi-select', topic: 'Events', question: 'Choose two', options: ['C', 'D', 'E'], correct: [0, 1], explanation: 'C and D are correct.' },
      ...(chapterId === 2 ? [{ id: 'three', type: 'multiple-choice', topic: 'Bounds', question: 'Choose G', options: ['F', 'G'], correct: 1, explanation: 'G is correct.' }] : [])
    ]
  })
}));

afterEach(() => vi.useRealTimers());

describe('lesson keyboard navigation', () => {
  it('keeps input, contenteditable, and button keys inside the focused control', () => {
    const navigate = vi.fn();
    const complete = vi.fn();
    render(<>
      <input aria-label="Probability" type="range" />
      <textarea aria-label="Answer" />
      <div role="tabpanel" tabIndex={0}><h3 tabIndex={-1} data-testid="lesson-heading">Lesson heading</h3></div>
      <div contentEditable suppressContentEditableWarning data-testid="editable">Notes</div>
      <InteractiveJourneyNavigation currentSection={0} totalSections={2} onNavigate={navigate} onComplete={complete} />
    </>);
    fireEvent.keyDown(screen.getByLabelText('Probability'), { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getByLabelText('Answer'), { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getByTestId('editable'), { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getByRole('button', { name: /Next/ }), { key: 'ArrowRight' });
    expect(navigate).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
    fireEvent.keyDown(document.body, { key: 'ArrowRight' });
    expect(navigate).toHaveBeenCalledExactlyOnceWith(1);
    navigate.mockClear();
    fireEvent.keyDown(screen.getByTestId('lesson-heading'), { key: 'ArrowRight' });
    expect(navigate).toHaveBeenCalledExactlyOnceWith(1);
  });

  it('does not complete a lesson when Enter belongs to another button', () => {
    const complete = vi.fn();
    render(<><button>Check answer</button><InteractiveJourneyNavigation currentSection={1} totalSections={2} onNavigate={vi.fn()} onComplete={complete} /></>);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Check answer' }), { key: 'Enter' });
    expect(complete).not.toHaveBeenCalled();
  });

  it.each(['Enter', ' ', 'ArrowLeft', 'ArrowRight'])('leaves native solution disclosures in control of %s', key => {
    const complete = vi.fn();
    const navigate = vi.fn();
    render(<><details><summary>Reveal solution</summary><p>Solution</p></details><InteractiveJourneyNavigation currentSection={1} totalSections={2} onNavigate={navigate} onComplete={complete} /></>);
    const allowedDefault = fireEvent.keyDown(screen.getByText('Reveal solution'), { key });
    expect(allowedDefault).toBe(true);
    expect(complete).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('makes hub cards reachable and operable with Enter and Space', () => {
    const open = vi.fn();
    render(<ChapterHub chapterNumber={1} chapterTitle="Probability" storageKey="hub" onSectionClick={open} sections={[{
      id: 'first', title: 'First lesson', subtitle: 'Basics', description: 'An introduction', icon: BookOpen,
      color: '#14b8a6', difficulty: 'Beginner', estimatedTime: '5 min', learningGoals: ['Events'], prerequisites: []
    }]} />);
    const card = screen.getByRole('button', { name: 'First lesson' });
    expect(card).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });
    expect(open).toHaveBeenCalledTimes(2);
  });
});

const tabs = [
  { id: 'foundations', label: 'First', icon: BookOpen, color: '#14b8a6', component: () => <p>First content</p> },
  { id: 'worked-examples', label: 'Second', icon: BookOpen, color: '#3b82f6', component: () => <p>Second content</p> }
];
const renderTabs = () => render(<TabbedLearningPage title="Lesson" chapter={1} tabs={tabs} storageKey="chapter1-foundations-progress" />);

describe('lesson tabs and saved progress', () => {
  let store;
  beforeEach(() => {
    store = createProgressStore(environment(memoryPersistence(), { legacyStorage: window.localStorage }));
    vi.spyOn(progressService, 'getStore').mockReturnValue(store);
  });
  afterEach(() => store.dispose());
  const ready = () => waitFor(() => expect(screen.getByRole('tab', { name: /^First/ })).toBeEnabled());
  it('exposes tab semantics and wraps keyboard navigation', async () => {
    renderTabs(); await ready();
    const first = screen.getByRole('tab', { name: 'First' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    const second = screen.getByRole('tab', { name: 'Second' });
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', second.id);
    fireEvent.keyDown(second, { key: 'ArrowRight' });
    expect(first).toHaveFocus();
  });

  it('imports the last tab and known unique completion IDs without replacing legacy input', async () => {
    localStorage.setItem('chapter1-foundations-progress', '["foundations","foundations","removed"]');
    localStorage.setItem('chapter1-foundations-progress:active-tab', 'worked-examples');
    renderTabs(); await ready();
    expect(screen.getByRole('tab', { name: 'Second' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('1/2 (50%)')).toBeInTheDocument();
  });

  it.each(['{broken', '{}', 'null'])('keeps the lesson usable with invalid saved progress %s', async saved => {
    localStorage.setItem('chapter1-foundations-progress', saved);
    renderTabs(); await ready();
    expect(screen.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('0/2 (0%)')).toBeInTheDocument();
  });

  it('keeps tab switching usable when browser storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    renderTabs(); await ready();
    fireEvent.click(screen.getByRole('tab', { name: 'Second' }));
    expect(screen.getByText('Second content')).toBeInTheDocument();
  });

  it('does not overwrite retained input when its registered source key changes', async () => {
    localStorage.setItem('chapter1-probability-dictionary-progress', '["worked-examples"]');
    localStorage.setItem('chapter1-probability-dictionary-progress:active-tab', 'worked-examples');
    const view = renderTabs(); await ready();
    view.rerender(<TabbedLearningPage title="Other lesson" chapter={1} tabs={tabs} storageKey="chapter1-probability-dictionary-progress" />);
    expect(screen.getByRole('tab', { name: 'Second Completed' })).toHaveAttribute('aria-selected', 'true');
    expect(JSON.parse(localStorage.getItem('chapter1-probability-dictionary-progress'))).toEqual(['worked-examples']);
  });
});

describe('saved quiz answers', () => {
  let store;
  beforeEach(() => {
    store = createProgressStore(environment(memoryPersistence(), { legacyStorage: window.localStorage, now: () => new Date().toISOString() }));
    vi.spyOn(progressService, 'getStore').mockReturnValue(store);
  });
  afterEach(() => store.dispose());
  const flush = () => act(async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); });
  const click = async button => { await act(async () => { fireEvent.click(button); }); await flush(); };
  async function seedSession(chapterId, old) {
    await store.hydrate();
    const { getChapterQuestions } = await import('@/lib/quiz/questionBank');
    const data = getChapterQuestions(chapterId);
    const startTime = old.startTime;
    const session = { sessionId: 'seed-session', chapterId: `chapter-${chapterId}`,
      bank: { revision: data.bankRevision, requestedVersion: 'engineering', effectiveVersion: 'engineering', questions: data.questions },
      currentQuestionId: data.questions[old.currentQuestion].id,
      answersByQuestionId: Object.fromEntries(Object.entries(old.answers).map(([index, answer]) => [data.questions[Number(index)].id, { ...answer, timestamp: startTime }])),
      flaggedQuestionIds: (old.flaggedQuestions || []).map(index => data.questions[index].id),
      startTime, deadline: old.deadline ?? startTime + data.timeLimit * 60000,
      isPaused: old.isPaused || false, pausedRemaining: old.isPaused ? old.pausedRemaining : null };
    await store.beginQuizSession(chapterId, session, { context: store.captureWriteContext(`chapter-${chapterId}:quiz`) });
  }

  const single = { type: 'multiple-choice', question: 'Pick A', options: ['A', 'B'], correct: 0, explanation: 'A is correct.' };

  it('shows a saved incorrect answer and its explanation in read-only review', () => {
    render(<QuizQuestionWrapper question={single} savedAnswer={{ answer: 1, isCorrect: false }} showExplanation disabled reviewMode />);
    expect(screen.getByRole('button', { name: /B.*Your incorrect answer/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('A is correct.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try Again' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
  });

  it('shows the correct explanation for an unanswered review question', () => {
    render(<QuizQuestionWrapper question={single} showExplanation disabled reviewMode />);
    expect(screen.getByRole('status')).toHaveTextContent('Not answered');
    expect(screen.getByText('A is correct.')).toBeInTheDocument();
  });

  it('restores multi-select choices without allowing a review to change the score', () => {
    const answer = vi.fn();
    render(<QuizQuestionWrapper question={{ ...single, type: 'multi-select', correct: [0, 1] }} savedAnswer={{ answer: [1], isCorrect: false }} showExplanation disabled reviewMode onAnswer={answer} />);
    const option = screen.getByRole('button', { name: /B.*Correct/ });
    expect(option).toHaveAttribute('aria-pressed', 'true');
    expect(option).toBeDisabled();
    expect(screen.getByText('A is correct.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try Again' })).not.toBeInTheDocument();
    expect(answer).not.toHaveBeenCalled();
  });

  it('persists navigation and paused deadlines, for verified sessions', async () => {
    const startTime = Date.now() - 10000;
    await seedSession(1, { chapterId: 1, version: 'engineering', currentQuestion: 0, answers: { 0: { answer: 0, isCorrect: true } }, flaggedQuestions: [], startTime, timeRemaining: null });
    const view = render(<ChapterQuiz chapterId={1} />); await flush();
    expect(quizStorage.getCurrentSession(1).deadline).toBe(startTime + 60000);
    await click(screen.getByRole('button', { name: 'Next Question' }));
    expect(quizStorage.getCurrentSession(1).currentQuestion).toBe(1);
    await click(screen.getByRole('button', { name: 'Pause quiz timer' }));
    expect(quizStorage.getCurrentSession(1).isPaused).toBe(true);
    expect(quizStorage.getCurrentSession(1).pausedRemaining).toBeGreaterThan(0);
    view.unmount();
    render(<ChapterQuiz chapterId={1} />); await flush();
    expect(screen.getByRole('button', { name: 'Resume quiz timer' })).toHaveAttribute('aria-pressed', 'true');
    expect(quizStorage.getCurrentSession(1).currentQuestion).toBe(1);
  });

  it('shows stored answers through the complete results-to-review flow', async () => {
    const startTime = Date.now();
    await seedSession(1, { chapterId: 1, version: 'engineering', currentQuestion: 1,
      answers: { 0: { answer: 1, isCorrect: false }, 1: { answer: [0, 1], isCorrect: true } }, startTime });
    render(<ChapterQuiz chapterId={1} />); await flush();
    await click(screen.getByRole('button', { name: 'Finish and review' }));
    expect(screen.getByRole('link', { name: 'Back to Chapter' })).toHaveAttribute('href', '/chapter1');
    expect(screen.getByRole('link', { name: 'Back to Chapter' }).querySelector('button')).toBeNull();
    expect(screen.getByRole('link', { name: 'Next Chapter' })).toHaveAttribute('href', '/chapter2');
    expect(screen.getByRole('link', { name: 'Next Chapter' }).querySelector('button')).toBeNull();
    await click(screen.getByRole('button', { name: 'Review Answers' }));
    expect(screen.getByRole('button', { name: /B.*Your incorrect answer/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('A is correct.')).toBeInTheDocument();
    await click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('C and D are correct.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
    expect(quizStorage.getAttempts(1)).toHaveLength(1);
  });

  it('can cancel a partial finish, then retain correct, wrong, and unanswered evidence through review', async () => {
    render(<ChapterQuiz chapterId={2} />); await flush();
    await click(screen.getByRole('button', { name: 'Start Quiz' }));
    await click(screen.getByRole('button', { name: 'A' }));
    await click(screen.getByRole('button', { name: 'Submit' }));
    await click(screen.getByRole('button', { name: 'Next Question' }));
    await click(screen.getByRole('button', { name: 'D' }));
    await click(screen.getByRole('button', { name: 'Submit' }));
    await click(screen.getByRole('button', { name: 'Next Question' }));
    const savedAnswers = quizStorage.getCurrentSession(2).answers;
    const finish = screen.getByRole('button', { name: 'Finish and review' });
    finish.focus();
    await click(finish);
    let confirmation = screen.getByRole('dialog', { name: 'Finish this quiz?' });
    expect(confirmation).toHaveTextContent('2 of 3 questions answered');
    expect(confirmation).toHaveTextContent('Unanswered questions: 3');
    expect(confirmation).toHaveTextContent('Unanswered questions earn no credit');
    await click(within(confirmation).getByRole('button', { name: 'Keep practicing' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(finish).toHaveFocus());
    expect(screen.getByText('Choose G')).toBeInTheDocument();
    expect(quizStorage.getCurrentSession(2).answers).toEqual(savedAnswers);
    expect(quizStorage.getAttempts(2)).toHaveLength(0);

    await click(finish);
    confirmation = screen.getByRole('dialog', { name: 'Finish this quiz?' });
    const confirmFinish = within(confirmation).getByRole('button', { name: 'Finish and review' });
    await act(async () => {
      await click(confirmFinish);
      await click(confirmFinish);
    });
    await flush();
    const summary = screen.getByRole('group', { name: 'Quiz summary' });
    ['Correct', 'Incorrect', 'Unanswered'].forEach(label => {
      expect(within(summary).getByText(label).parentElement).toHaveTextContent(`1${label}`);
    });
    expect(screen.getByText('33%')).toBeInTheDocument();
    expect(screen.getByText('Incorrect answers:').parentElement).toHaveTextContent('2');
    expect(screen.getByText('Unanswered questions:').parentElement).toHaveTextContent('3');
    expect(quizStorage.getAttempts(2)).toHaveLength(1);
    expect(quizStorage.getAttempts(2)[0].answers).toEqual(savedAnswers);
    expect(quizStorage.getAttempts(2)[0].answers).not.toHaveProperty('2');
    expect(quizStorage.getCurrentSession(2)).toBeNull();

    await click(screen.getByRole('button', { name: 'Review Answers' }));
    expect(screen.getByRole('button', { name: /A.*Correct answer/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('A is correct.')).toBeInTheDocument();
    await click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('button', { name: /D.*Correct/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /C.*Should be selected/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('Not quite right');
    expect(screen.getByText('C and D are correct.')).toBeInTheDocument();
    await click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('button', { name: /G.*Correct answer/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('Not answered');
    expect(screen.getByText('G is correct.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
    expect(quizStorage.getAttempts(2)).toHaveLength(1);
  });

  it('offers a confirmed finish before answering any questions', async () => {
    render(<ChapterQuiz chapterId={2} />); await flush();
    await click(screen.getByRole('button', { name: 'Start Quiz' }));
    await click(screen.getByRole('button', { name: 'Finish and review' }));
    const confirmation = screen.getByRole('dialog', { name: 'Finish this quiz?' });
    expect(confirmation).toHaveTextContent('0 of 3 questions answered');
    expect(confirmation).toHaveTextContent('Unanswered questions: 1, 2, 3');
    await click(within(confirmation).getByRole('button', { name: 'Finish and review' }));
    expect(screen.getByText('0%')).toBeInTheDocument();
    await flush();
    const summary = screen.getByRole('group', { name: 'Quiz summary' });
    expect(within(summary).getByText('Incorrect').parentElement).toHaveTextContent('0Incorrect');
    expect(within(summary).getByText('Unanswered').parentElement).toHaveTextContent('3Unanswered');
    expect(quizStorage.getAttempts(2)[0].answers).toEqual({});
  });

  it('expires exactly once while partial-finish confirmation is open', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-03T12:00:00Z'));
    localStorage.setItem('quiz_preferences', JSON.stringify({ showTimer: false }));
    await seedSession(2, { chapterId: 2, version: 'engineering', currentQuestion: 2,
      answers: { 0: { answer: 0, isCorrect: true } }, startTime: Date.now(), deadline: Date.now() + 1000 });
    render(<StrictMode><ChapterQuiz chapterId={2} /></StrictMode>); await flush();
    await click(screen.getByRole('button', { name: 'Finish and review' }));
    const confirmFinish = within(screen.getByRole('dialog')).getByRole('button', { name: 'Finish and review' });
    await act(async () => { vi.advanceTimersByTime(1000); }); await flush();
    expect(screen.getByText('Quiz Complete')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await click(confirmFinish);
    await act(async () => { vi.advanceTimersByTime(3000); }); await flush();
    expect(quizStorage.getAttempts(2)).toHaveLength(1);
    expect(quizStorage.getAttempts(2)[0].answers).toMatchObject({ 0: { answer: 0, isCorrect: true } });
    expect(quizStorage.getCurrentSession(2)).toBeNull();
  });

  it('submits an expired hidden-timer session once and keeps it cleared', async () => {
    localStorage.setItem('quiz_preferences', JSON.stringify({ showTimer: false }));
    await seedSession(1, { chapterId: 1, version: 'engineering', currentQuestion: 0,
      answers: {}, startTime: Date.now() - 61000, timeRemaining: null });
    render(<StrictMode><ChapterQuiz chapterId={1} /></StrictMode>); await flush();
    expect(screen.getByText('Quiz Complete')).toBeInTheDocument();
    expect(quizStorage.getAttempts(1)).toHaveLength(1);
    expect(quizStorage.getCurrentSession(1)).toBeNull();
  });
});

describe('quiz deadlines', () => {
  it.each([false, true])('expires once at the same deadline with hidden=%s', hidden => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-03T12:00:00Z'));
    const expired = vi.fn();
    render(<StrictMode><QuizTimer deadline={Date.now() + 2000} hidden={hidden} onTimeUp={expired} /></StrictMode>);
    act(() => vi.advanceTimersByTime(2000));
    expect(expired).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(3000));
    expect(expired).toHaveBeenCalledTimes(1);
  });

  it('preserves the paused remaining time and resumes from the supplied deadline', () => {
    vi.useFakeTimers();
    const expired = vi.fn();
    const view = render(<QuizTimer deadline={Date.now() + 2000} isPaused pausedRemaining={2} onTimeUp={expired} />);
    act(() => vi.advanceTimersByTime(10000));
    expect(expired).not.toHaveBeenCalled();
    expect(screen.getByText('00:02')).toBeInTheDocument();
    view.rerender(<QuizTimer deadline={Date.now() + 2000} onTimeUp={expired} />);
    act(() => vi.advanceTimersByTime(2000));
    expect(expired).toHaveBeenCalledTimes(1);
  });

  it('keeps the original pause behavior when no external deadline is supplied', () => {
    vi.useFakeTimers();
    const expired = vi.fn();
    const view = render(<QuizTimer timeLimit={0.05} onTimeUp={expired} />);
    act(() => vi.advanceTimersByTime(1000));
    view.rerender(<QuizTimer timeLimit={0.05} isPaused onTimeUp={expired} />);
    act(() => vi.advanceTimersByTime(10000));
    view.rerender(<QuizTimer timeLimit={0.05} onTimeUp={expired} />);
    expect(screen.getByText('00:02')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2000));
    expect(expired).toHaveBeenCalledTimes(1);
  });
});
