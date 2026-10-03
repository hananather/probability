"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { QuizTimer } from './QuizTimer';
import { QuizProgress } from './QuizProgress';
import { QuizResults } from './QuizResults';
import { MultiSelectQuestion } from './MultiSelectQuestion';
import { Button } from '../ui/button';
import { AlertCircle, BookOpen, Settings, ChevronRight } from 'lucide-react';
import { getChapterQuestions, isQuizVersion } from '@/lib/quiz/questionBank';
import { quizStorage, createQuizId, DEFAULT_QUIZ_PREFERENCES } from '@/lib/quiz/quizStorage';
import { mergeQuizSession } from '@/lib/progress/quizContract';
import { resolveChapterId } from '@/lib/curriculum/manifest';
import { useProgress } from '@/hooks/useProgress';
import { useMathJax } from '@/hooks/useMathJax';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Single question component that handles both types
export function QuizQuestionWrapper({
  question, 
  onAnswer, 
  showExplanation = false,
  disabled = false,
  reviewMode = false,
  questionHeadingRef,
  savedAnswer
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(savedAnswer?.answer ?? null);
  const [selectedMultiple, setSelectedMultiple] = useState([]);
  const [showFeedback, setShowFeedback] = useState(Boolean(savedAnswer) || reviewMode);
  const [isAnswered, setIsAnswered] = useState(Boolean(savedAnswer) || reviewMode);
  const questionIdentity = question.id ?? JSON.stringify([question.question, question.options, question.correct]);
  const savedAnswerIdentity = JSON.stringify([Boolean(savedAnswer), savedAnswer?.answer ?? null, savedAnswer?.timestamp ?? null, savedAnswer?.isCorrect ?? null]);
  const contentRef = useMathJax([question, savedAnswer, showExplanation, showFeedback]);
  
  const isMultiSelect = question.type === 'multi-select';
  
  // Canonical session patches clone the bank; reset only for a new question or submitted answer.
  useEffect(() => {
    const [hasSavedAnswer, answer] = JSON.parse(savedAnswerIdentity);
    setSelectedAnswer(answer);
    setSelectedMultiple([]);
    setShowFeedback(hasSavedAnswer || reviewMode);
    setIsAnswered(hasSavedAnswer || reviewMode);
  }, [questionIdentity, savedAnswerIdentity, reviewMode]);
  
  const handleSingleAnswer = (index) => {
    if (isAnswered || disabled || reviewMode) return;
    setSelectedAnswer(index);
  };
  
  const handleSubmit = () => {
    if (isAnswered || disabled || reviewMode) return;
    if (!isMultiSelect && selectedAnswer === null) return;
    if (isMultiSelect && selectedMultiple.length === 0) return;
    
    setShowFeedback(true);
    setIsAnswered(true);
    
    const isCorrect = isMultiSelect
      ? selectedMultiple.length === question.correct.length &&
        selectedMultiple.every(ans => question.correct.includes(ans))
      : selectedAnswer === question.correct;
    
    if (onAnswer) {
      onAnswer(isCorrect, isMultiSelect ? selectedMultiple : selectedAnswer);
    }
  };
  
  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setSelectedMultiple([]);
    setShowFeedback(false);
    setIsAnswered(false);
  };
  
  // Use MultiSelectQuestion for multi-select
  if (isMultiSelect) {
    return (
      <div ref={contentRef}><MultiSelectQuestion
        question={question.question}
        options={question.options}
        correctIndices={question.correct}
        explanation={question.explanation}
        onAnswer={onAnswer}
        showExplanation={showExplanation}
        disabled={disabled}
        reviewMode={reviewMode}
        questionId={questionIdentity}
        questionHeadingRef={questionHeadingRef}
        savedAnswer={savedAnswer}
      /></div>
    );
  }
  
  // Regular multiple choice rendering
  const isCorrect = selectedAnswer === question.correct;
  
  return (
    <div ref={contentRef} className="space-y-4">
      {/* Question */}
      <div>
        <h2 ref={questionHeadingRef} tabIndex={-1} className="text-lg text-neutral-200 font-medium scroll-mt-24">{question.question}</h2>
      </div>
      
      {/* Options */}
      <div role="group" aria-label="Answer choices" className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const showAsCorrect = showFeedback && index === question.correct;
          const showAsIncorrect = showFeedback && isSelected && index !== question.correct;
          
          return (
            <button
              key={index}
              onClick={() => handleSingleAnswer(index)}
              disabled={isAnswered || disabled || reviewMode}
              aria-pressed={isSelected}
              className={`
                w-full p-4 rounded-lg border text-left transition-all duration-300
                ${(isAnswered || disabled) ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] hover:shadow-lg'}
                ${
                  showAsCorrect
                    ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/30'
                    : showAsIncorrect
                    ? 'bg-red-500/20 border-red-500/50 shadow-lg shadow-red-500/30'
                    : isSelected
                    ? 'bg-blue-500/20 border-blue-500/50 shadow-md'
                    : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800/50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${
                      showAsCorrect
                        ? 'border-green-500 bg-green-500'
                        : showAsIncorrect
                        ? 'border-red-500 bg-red-500'
                        : isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-neutral-600'
                    }
                  `}
                >
                  {isSelected && !showFeedback && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className={`
                  text-sm
                  ${
                    showAsCorrect
                      ? 'text-green-300'
                      : showAsIncorrect
                      ? 'text-red-300'
                      : 'text-neutral-200'
                  }
                `}>
                  {option}
                  {showAsCorrect && <span className="sr-only"> — Correct answer</span>}
                  {showAsIncorrect && <span className="sr-only"> — Your incorrect answer</span>}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Submit/Try Again */}
      <div className="flex items-center gap-3">
        {!isAnswered ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null || disabled || reviewMode}
            variant="primary"
            size="default"
          >
            Submit
          </Button>
        ) : (
          <>
            <span role="status" className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? 'Correct!' : selectedAnswer === null ? 'Not answered' : 'Incorrect'}
            </span>
            {!isCorrect && !disabled && !reviewMode && (
              <Button
                onClick={handleTryAgain}
                variant="neutral"
                size="sm"
              >
                Try Again
              </Button>
            )}
          </>
        )}
      </div>
      
      {/* Explanation */}
      {showFeedback && showExplanation && question.explanation && (
        <div className={`
          p-3 rounded-lg text-sm
          ${isCorrect ? 'bg-green-500/10 border border-green-500/30 text-green-300' : 'bg-orange-500/10 border border-orange-500/30 text-orange-300'}
        `}>
          <p className="font-medium mb-1">Explanation:</p>
          <p>{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

function PersistenceNotice({ progress, actionError }) {
  const sessionOnly = progress.persistenceStatus === 'session-only';
  const pending = progress.pendingLocalWrites > 0 || sessionOnly;
  if (!pending && !actionError) return null;
  return (
    <div role="status" aria-label="Quiz saving" className="rounded-lg border border-amber-700 bg-amber-950 p-4 text-sm text-amber-100">
      {actionError && <p>{actionError}</p>}
      {pending && <>
        <p>{sessionOnly ? 'This quiz is saved in this tab only while local storage is unavailable. Reloading may lose pending changes.' : 'Saving quiz changes to this device…'}</p>
        {sessionOnly && <Button variant="neutral" size="sm" className="mt-2" onClick={progress.retryLocalPersistence}>Retry saving</Button>}
      </>}
    </div>
  );
}

function BankNotice({ bank, selectedVersion }) {
  const names = { engineering: 'Engineering', biostats: 'Biostats', social: 'Social Science' };
  return <p className="text-sm text-neutral-400">
    {bank.requestedVersion !== bank.effectiveVersion
      ? `Requested ${names[bank.requestedVersion]}; using Engineering questions because this chapter has no ${names[bank.requestedVersion]} bank.`
      : `${names[bank.effectiveVersion]} questions.`}
    {selectedVersion !== bank.requestedVersion && ' This saved session keeps its original questions; a new attempt uses your selected version.'}
  </p>;
}

export function ChapterQuiz({ chapterId = 1, version = 'engineering' }) {
  const progress = useProgress();
  const { learningData, loading } = progress;
  const store = typeof window === 'undefined' ? null : quizStorage.getStore();
  const chapter = resolveChapterId(chapterId);
  const quizId = `${chapter}:quiz`;
  const freshData = useMemo(() => isQuizVersion(version) ? getChapterQuestions(chapterId, version) : null, [chapterId, version]);
  const locator = learningData.resumeByDevice[learningData.deviceId]?.[quizId];
  const savedSession = locator?.session;
  const [activeSession, setActiveSession] = useState(null);
  const [resultAttempt, setResultAttempt] = useState(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [quizState, setQuizState] = useState('intro');
  const [previousBest, setPreviousBest] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [busy, setBusy] = useState(false);
  const finishButtonRef = useRef(null);
  const questionHeadingRef = useRef(null);
  const resultsHeadingRef = useRef(null);
  const navigationFocus = useRef(null);
  const resultsFocus = useRef(false);
  const finishReturnFocus = useRef(null);
  const reducedMotion = useReducedMotion();
  const work = useRef(null);
  const mounted = useRef(false);
  const scope = `${chapter}:${version}`;
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const stats = quizStorage.getChapterStats(chapterId, learningData);
  const attempts = quizStorage.getAttempts(chapterId, learningData);
  const latestPinned = [...attempts].reverse().find(attempt => attempt.legacy === false);
  const legacyAttempts = attempts.filter(attempt => attempt.legacy);
  const preferences = { ...DEFAULT_QUIZ_PREFERENCES, ...learningData.preferences.quiz };
  const displayBank = (quizState === 'results' || quizState === 'review') ? resultAttempt?.bank : activeSession?.bank;
  const quizData = freshData && { ...freshData, questions: displayBank?.questions || freshData.questions };
  const bank = displayBank || (freshData && { revision: freshData.bankRevision, requestedVersion: freshData.requestedVersion, effectiveVersion: freshData.effectiveVersion, questions: freshData.questions });
  const answerMap = (quizState === 'results' || quizState === 'review') ? (resultAttempt?.answersByQuestionId || {}) : (activeSession?.answersByQuestionId || {});
  const answers = Object.fromEntries((quizData?.questions || []).flatMap((question, index) => answerMap[question.id] ? [[index, answerMap[question.id]]] : []));
  const currentQuestion = quizState === 'review' ? reviewIndex : Math.max(0, quizData?.questions.findIndex(question => question.id === activeSession?.currentQuestionId) ?? 0);
  const flaggedQuestions = (activeSession?.flaggedQuestionIds || []).map(id => quizData?.questions.findIndex(question => question.id === id)).filter(index => index >= 0);
  const isPaused = activeSession?.isPaused || false;
  const deadline = activeSession?.deadline;
  const pausedRemaining = activeSession?.pausedRemaining;
  const timeSpent = resultAttempt?.timeSpent || 0;
  const currentQuestionId = quizData?.questions[currentQuestion]?.id;

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    work.current = null;
    navigationFocus.current = null;
    resultsFocus.current = false;
    finishReturnFocus.current = null;
    setActiveSession(null); setResultAttempt(null); setQuizState('intro'); setReviewIndex(0); setActionError(null);
    setBusy(false); setShowFinishConfirmation(false); setShowSettings(false); setPreviousBest(null);
  }, [scope]);
  useEffect(() => {
    const requested = navigationFocus.current;
    if (!requested || requested.scope !== scope || requested.questionId !== currentQuestionId) return;
    navigationFocus.current = null;
    questionHeadingRef.current?.focus({ preventScroll: true });
    questionHeadingRef.current?.scrollIntoView?.({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
  }, [currentQuestionId, quizState, scope, reducedMotion]);
  useEffect(() => {
    if (quizState !== 'results' || !resultsFocus.current) return;
    resultsFocus.current = false;
    resultsHeadingRef.current?.focus({ preventScroll: true });
    resultsHeadingRef.current?.scrollIntoView?.({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
  }, [quizState, reducedMotion]);
  useEffect(() => {
    if (loading || !store || !freshData) return;
    if (savedSession) {
      if (work.current?.sessionId !== savedSession.sessionId) {
        work.current = { sessionId: savedSession.sessionId, context: store.captureWriteContext(quizId), attemptId: createQuizId(), scope };
        setPreviousBest(stats.attempted ? stats.bestScore : null);
      }
      setActiveSession(savedSession);
      setQuizState('quiz');
    } else if (work.current && !work.current.finishing && !work.current.starting && quizState === 'quiz') {
      const finished = Object.values(learningData.quizAttempts).find(attempt => !attempt.legacy && attempt.sessionId === work.current.sessionId);
      if (finished) { setResultAttempt(finished); setQuizState('results'); }
      else { setActiveSession(null); setQuizState('intro'); setActionError('This quiz was cleared or reset in another tab. Start a new attempt to continue.'); }
      work.current = null;
    }
  }, [loading, savedSession, scope, learningData.quizAttempts, store, freshData, quizId, quizState, stats.attempted, stats.bestScore]);

  const handleStartQuiz = async () => {
    if (loading || !store || !quizData || work.current?.starting || busy) return;
    const captured = { sessionId: createQuizId(), context: store.captureWriteContext(quizId), attemptId: createQuizId(), scope, starting: true };
    const now = Date.now();
    const session = {
      sessionId: captured.sessionId, chapterId: chapter,
      bank: JSON.parse(JSON.stringify({ revision: freshData.bankRevision, requestedVersion: freshData.requestedVersion, effectiveVersion: freshData.effectiveVersion, questions: freshData.questions })),
      currentQuestionId: freshData.questions[0].id, answersByQuestionId: {}, flaggedQuestionIds: [],
      startTime: now, deadline: now + freshData.timeLimit * 60000, isPaused: false, pausedRemaining: null,
    };
    work.current = captured;
    finishReturnFocus.current = null;
    navigationFocus.current = { scope, questionId: freshData.questions[0].id };
    setPreviousBest(stats.attempted ? stats.bestScore : null); setActionError(null); setBusy(true); setShowFinishConfirmation(false);
    try {
      const result = await store.beginQuizSession(chapterId, session, { context: captured.context });
      if (!mounted.current || scopeRef.current !== captured.scope || work.current !== captured) return;
      if (!result.applied) {
        setActionError('The saved quiz changed or was reset. Start a new attempt.');
        setActiveSession(null); setResultAttempt(null); setQuizState('intro'); work.current = null;
        navigationFocus.current = null;
        return;
      }
      setActiveSession(store.getSnapshot().data.resumeByDevice[store.getSnapshot().data.deviceId]?.[quizId]?.session || session);
      setResultAttempt(null); setQuizState('quiz');
    } catch (error) {
      if (mounted.current && scopeRef.current === captured.scope && work.current === captured) {
        navigationFocus.current = null;
        work.current = null;
        setActionError(error.message);
      }
    }
    finally { captured.starting = false; if (mounted.current && scopeRef.current === captured.scope) setBusy(false); }
  };

  const persistPatch = async patch => {
    const captured = work.current;
    const session = activeSession;
    if (!captured || !session || captured.sessionId !== session.sessionId || captured.finishing || quizState !== 'quiz') return;
    setActiveSession(mergeQuizSession(session, patch));
    try {
      const result = await store.updateQuizSession(chapterId, captured.sessionId, patch, { context: captured.context });
      if (mounted.current && work.current === captured && !result.applied) setActionError('This quiz changed or was reset. Your late change was not applied.');
    } catch (error) { if (mounted.current && work.current === captured) setActionError(error.message); }
  };
  const handleAnswer = (index, _isCorrect, answer) => {
    const question = quizData.questions[index];
    void persistPatch({ answersByQuestionId: { [question.id]: { answer, timestamp: Math.max(Date.now(), activeSession.startTime) } } });
  };
  const handleNavigate = index => {
    if (index < 0 || index >= quizData.questions.length) return;
    finishReturnFocus.current = null;
    if (index !== currentQuestion) navigationFocus.current = { scope, questionId: quizData.questions[index].id };
    if (quizState === 'review') setReviewIndex(index);
    else void persistPatch({ currentQuestionId: quizData.questions[index].id });
  };
  const handleFlag = index => {
    if (quizState !== 'quiz') return;
    const id = quizData.questions[index].id;
    const flags = activeSession.flaggedQuestionIds;
    void persistPatch({ flaggedQuestionIds: flags.includes(id) ? flags.filter(value => value !== id) : [...flags, id] });
  };
  const handleSubmitQuiz = useCallback(async () => {
    const captured = work.current;
    if (quizState !== 'quiz' || !captured || captured.scope !== scope || captured.finishing || captured.starting || captured.sessionId !== activeSession?.sessionId) return;
    captured.finishing = true; setBusy(true); setShowFinishConfirmation(false); setActionError(null);
    try {
      const result = await store.finishQuizAttempt(chapterId, { sessionId: captured.sessionId, attemptId: captured.attemptId, answersByQuestionId: activeSession.answersByQuestionId }, { context: captured.context });
      if (!mounted.current || work.current !== captured || scopeRef.current !== captured.scope) return;
      if (!result.applied || !result.attempt) { setActionError('This quiz changed or was reset. No new attempt was recorded.'); setQuizState('intro'); setActiveSession(null); return; }
      resultsFocus.current = true;
      finishReturnFocus.current = null;
      setResultAttempt(result.attempt); setQuizState('results');
    } catch (error) { if (mounted.current && work.current === captured) setActionError(error.message); }
    finally { captured.finishing = false; if (mounted.current && scopeRef.current === captured.scope) setBusy(false); }
  }, [activeSession, chapterId, quizState, scope, store]);
  useEffect(() => {
    // A timer may expire while begin is awaiting storage; recheck the settled matching session.
    const captured = work.current;
    if (!busy && quizState === 'quiz' && activeSession && !activeSession.isPaused && activeSession.deadline <= Date.now()
      && captured?.sessionId === activeSession.sessionId && captured.scope === scope && !captured.starting && !captured.finishing) {
      void handleSubmitQuiz();
    }
  }, [busy, quizState, activeSession, scope, handleSubmitQuiz]);
  const handleRequestFinish = () => {
    if (busy || quizState !== 'quiz') return;
    if (quizData.questions.some(question => !answerMap[question.id])) {
      finishReturnFocus.current = { scope, target: finishButtonRef.current };
      setShowFinishConfirmation(true);
    }
    else void handleSubmitQuiz();
  };
  const handlePauseToggle = () => {
    void persistPatch(isPaused ? { deadline: Date.now() + pausedRemaining * 1000, isPaused: false, pausedRemaining: null }
      : { pausedRemaining: Math.max(0, Math.ceil((deadline - Date.now()) / 1000)), isPaused: true });
  };
  const handleReview = () => {
    finishReturnFocus.current = null;
    navigationFocus.current = { scope, questionId: resultAttempt.bank.questions[0].id };
    setQuizState('review'); setReviewIndex(0);
  };
  const handleSavedReview = () => {
    finishReturnFocus.current = null;
    navigationFocus.current = { scope, questionId: latestPinned.bank.questions[0].id };
    setResultAttempt(latestPinned); setPreviousBest(null); setQuizState('review'); setReviewIndex(0);
  };
  const savePreference = async patch => {
    try { await store.setQuizPreferences(patch, { context: store.captureWriteContext() }); }
    catch (error) { if (mounted.current) setActionError(error.message); }
  };
  const savingNotice = <PersistenceNotice progress={progress} actionError={actionError} />;

  if (loading) return <p role="status" className="p-6 text-neutral-300">Loading saved quiz progress…</p>;
  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <p className="text-neutral-400">This quiz or version is unavailable. Choose Engineering, Biostats, or Social Science.</p>
        </div>
      </div>
    );
  }

  const answeredQuestions = Object.keys(answers).map(index => Number(index));
  const correctAnswers = answeredQuestions.filter(index => answers[index].isCorrect);
  const incorrectAnswers = answeredQuestions.filter(index => !answers[index].isCorrect);
  const unansweredQuestions = quizData.questions.map((_, index) => index).filter(index => !answers[index]);
  
  // Render based on quiz state
  if (quizState === 'intro') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {savingNotice}
        <BankNotice bank={bank} selectedVersion={version} />
        {/* Quiz Introduction */}
        <div className="text-center space-y-4">
          <BookOpen className="w-16 h-16 text-teal-500 mx-auto" />
          <h1 className="text-3xl font-bold text-white">{quizData.title}</h1>
          <p className="text-neutral-400">End of Chapter Quiz</p>
        </div>
        
        {/* Quiz Info */}
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-400">Questions</p>
              <p className="text-2xl font-bold text-white">{quizData.questions.length}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Time Limit</p>
              <p className="text-2xl font-bold text-white">{quizData.timeLimit} min</p>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Passing Score</p>
              <p className="text-2xl font-bold text-white">{quizData.passingScore}%</p>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Your Best</p>
              <p className="text-2xl font-bold text-white">
                {stats.attempted ? `${stats.bestScore}%` : 'Not attempted'}
              </p>
            </div>
          </div>
          
          {stats.attempted && (
            <div className="pt-4 border-t border-neutral-800">
              <p className="text-sm text-neutral-400">
                {stats.totalAttempts > 0 ? `You've recorded ${stats.totalAttempts} attempt${stats.totalAttempts > 1 ? 's' : ''}.` : 'A historical best score is retained without an attempt record.'}
                {stats.passed && ' You have passed this quiz!'}
              </p>
            </div>
          )}
        </div>
        
        {/* Settings */}
        <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Quiz Settings</span>
          </button>
          
          {showSettings && (
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.showTimer}
                  onChange={(e) => {
                    void savePreference({ showTimer: e.target.checked });
                  }}
                  className="rounded"
                />
                <span className="text-sm text-neutral-300">Show timer</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.immediateFeedback}
                  onChange={(e) => {
                    void savePreference({ immediateFeedback: e.target.checked });
                  }}
                  className="rounded"
                />
                <span className="text-sm text-neutral-300">Show explanations after each answer</span>
              </label>
              
              <div className="pt-2">
                <label className="text-sm text-neutral-400">Version:</label>
                <select
                  aria-label="Quiz version"
                  value={version}
                  onChange={(e) => { if (isQuizVersion(e.target.value)) window.location.assign(`?version=${e.target.value}`); }}
                  className="ml-2 bg-neutral-800 text-neutral-300 rounded px-2 py-1"
                >
                  <option value="engineering">Engineering</option>
                  <option value="biostats">Biostats</option>
                  <option value="social">Social Science</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        {locator?.legacySession && <div role="status" aria-label="Historical quiz session" className="rounded-lg border border-amber-700 p-4 text-sm text-amber-100">
          <p>An older saved session has indexed answers and no verified question bank. Its original data is retained for recovery. Start a new quiz to use the current questions.</p>
          <details className="mt-2"><summary>View historical session data</summary><pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(locator.legacySession, null, 2)}</pre></details>
        </div>}
        {legacyAttempts.length > 0 && <details className="rounded-lg border border-neutral-700 p-4 text-sm text-neutral-300">
          <summary>Historical attempts ({legacyAttempts.length}; question bank unverified)</summary>
          <p className="mt-2">Original scores and indexed answers are retained. They are not matched to current questions.</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(legacyAttempts.map(({ date, percentage, originalId, answersByIndex }) => ({ date, percentage, originalId, answersByIndex })), null, 2)}</pre>
        </details>}
        {latestPinned && <Button variant="neutral" onClick={handleSavedReview}>Review latest saved attempt</Button>}
        {/* Start Button */}
        <Button
          onClick={handleStartQuiz}
          disabled={busy}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Start Quiz
        </Button>
      </div>
    );
  }
  
  if (quizState === 'results') {
    return (
      <div className="space-y-4">{savingNotice}<BankNotice bank={bank} selectedVersion={version} /><QuizResults
        score={correctAnswers.length}
        totalQuestions={quizData.questions.length}
        timeSpent={timeSpent}
        correctAnswers={correctAnswers}
        incorrectAnswers={incorrectAnswers}
        unansweredQuestions={unansweredQuestions}
        passingScore={quizData.passingScore}
        previousBest={previousBest}
        onRetake={handleStartQuiz}
        onReview={handleReview}
        chapterId={chapterId}
        chapterTitle={quizData.title}
        headingRef={resultsHeadingRef}
      /></div>
    );
  }
  
  // Main quiz interface
  const question = quizData.questions[currentQuestion];
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {savingNotice}
      <BankNotice bank={bank} selectedVersion={version} />
      {/* Header */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">{quizData.title}</h1>
        {quizState === 'quiz' && (
          <QuizTimer
            key={activeSession.sessionId}
            timeLimit={quizData.timeLimit}
            onTimeUp={handleSubmitQuiz}
            isPaused={isPaused}
            onPauseToggle={handlePauseToggle}
            deadline={deadline}
            pausedRemaining={pausedRemaining}
            hidden={!preferences.showTimer}
          />
        )}
      </div>
      
      {/* Progress */}
      <QuizProgress
        currentQuestion={currentQuestion}
        totalQuestions={quizData.questions.length}
        answeredQuestions={answeredQuestions}
        flaggedQuestions={flaggedQuestions}
        correctAnswers={quizState === 'review' ? correctAnswers : []}
        incorrectAnswers={quizState === 'review' ? incorrectAnswers : []}
        onNavigate={handleNavigate}
        onFlag={handleFlag}
        showReview={quizState === 'review'}
      />
      
      {/* Question */}
      <div className="bg-neutral-900 rounded-lg p-4 sm:p-8 border border-neutral-700">
        {/* Topic Badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-400 text-sm rounded-full border border-teal-500/30">
            {question.topic}
          </span>
        </div>
        
        {/* Question Content */}
        <QuizQuestionWrapper
          key={`${resultAttempt?.id || activeSession?.sessionId}:${question.id}`} // Force remount when question changes
          question={question}
          onAnswer={(isCorrect, answer) => handleAnswer(currentQuestion, isCorrect, answer)}
          showExplanation={preferences.immediateFeedback || quizState === 'review'}
          disabled={quizState === 'review' || busy}
          reviewMode={quizState === 'review'}
          questionHeadingRef={questionHeadingRef}
          savedAnswer={answers[currentQuestion]}
        />
        
        {/* Next Question Button - Shows after answering */}
        {quizState === 'quiz' && answers[currentQuestion] && currentQuestion < quizData.questions.length - 1 && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => handleNavigate(currentQuestion + 1)}
              variant="primary"
              size="lg"
              className="min-w-[200px] flex items-center gap-2"
            >
              Next Question
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Finish practice */}
      {quizState === 'quiz' && (
        <Dialog.Root open={showFinishConfirmation} onOpenChange={setShowFinishConfirmation}>
          <div className="flex justify-center">
            <Button
              ref={finishButtonRef}
              onClick={handleRequestFinish}
              disabled={busy}
              variant="success"
              size="lg"
              className="min-w-[200px]"
            >
              Finish and review
            </Button>
          </div>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/60" />
            <Dialog.Content
              aria-modal="true"
              className="fixed left-1/2 top-1/2 z-[80] w-[calc(100%_-_2rem)] max-w-lg max-h-[calc(100dvh_-_2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-900 p-6 text-white shadow-xl"
              onCloseAutoFocus={event => {
                event.preventDefault();
                const restore = finishReturnFocus.current;
                finishReturnFocus.current = null;
                const focused = document.activeElement;
                const focusWasRemoved = !focused?.isConnected || focused === document.body || event.target?.contains(focused);
                if (restore?.scope === scopeRef.current && restore.target?.isConnected && focusWasRemoved) {
                  restore.target.focus();
                }
              }}
            >
              <Dialog.Title className="text-xl font-semibold">Finish this quiz?</Dialog.Title>
              <Dialog.Description className="mt-3 text-sm text-neutral-300">
                {answeredQuestions.length} of {quizData.questions.length} questions answered. Only submitted answers are saved for review. Unanswered questions earn no credit.
              </Dialog.Description>
              <p className="mt-3 text-sm text-neutral-400">
                Unanswered questions: {unansweredQuestions.map(index => index + 1).join(', ')}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Dialog.Close asChild>
                  <Button variant="neutral">Keep practicing</Button>
                </Dialog.Close>
                <Button variant="success" disabled={busy} onClick={handleSubmitQuiz}>Finish and review</Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
      
      {/* Back to Results (in review mode) */}
      {quizState === 'review' && (
        <div className="flex justify-center">
          <Button
            onClick={() => { resultsFocus.current = true; setQuizState('results'); }}
            variant="neutral"
            size="default"
          >
            Back to Results
          </Button>
        </div>
      )}
    </div>
  );
}
