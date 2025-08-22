"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { QuizTimer } from './QuizTimer';
import { QuizProgress } from './QuizProgress';
import { QuizResults } from './QuizResults';
import { MultiSelectQuestion } from './MultiSelectQuestion';
import { Button } from '../ui/button';
import { AlertCircle, BookOpen, Settings, ChevronRight } from 'lucide-react';
import { getChapterQuestions } from '@/lib/quiz/questionBank';
import { quizStorage } from '@/lib/quiz/quizStorage';
import { useMathJax } from '@/hooks/useMathJax';

// Single question component that handles both types
function QuizQuestionWrapper({ 
  question, 
  onAnswer, 
  showExplanation = false,
  disabled = false 
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedMultiple, setSelectedMultiple] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const questionRef = useMathJax([question.question]);
  const optionsRef = useMathJax(question.options); // options is already an array
  
  const isMultiSelect = question.type === 'multi-select';
  
  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setSelectedMultiple([]);
    setShowFeedback(false);
    setIsAnswered(false);
  }, [question]);
  
  const handleSingleAnswer = (index) => {
    if (isAnswered || disabled) return;
    setSelectedAnswer(index);
  };
  
  const handleSubmit = () => {
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
      <MultiSelectQuestion
        question={question.question}
        options={question.options}
        correctIndices={question.correct}
        explanation={question.explanation}
        onAnswer={onAnswer}
        showExplanation={showExplanation}
        disabled={disabled}
      />
    );
  }
  
  // Regular multiple choice rendering
  const isCorrect = selectedAnswer === question.correct;
  
  return (
    <div className="space-y-4">
      {/* Question */}
      <div ref={questionRef}>
        <p className="text-lg text-neutral-200 font-medium">{question.question}</p>
      </div>
      
      {/* Options */}
      <div ref={optionsRef} className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const showAsCorrect = showFeedback && index === question.correct;
          const showAsIncorrect = showFeedback && isSelected && index !== question.correct;
          
          return (
            <button
              key={index}
              onClick={() => handleSingleAnswer(index)}
              disabled={isAnswered || disabled}
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
            disabled={selectedAnswer === null}
            variant="primary"
            size="default"
          >
            Submit
          </Button>
        ) : (
          <>
            <span className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
            {!isCorrect && (
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

// Main Quiz Component
export function ChapterQuiz({ chapterId = 1, version = 'engineering' }) {
  // Quiz state
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [quizState, setQuizState] = useState('intro'); // intro, quiz, results, review
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Preferences
  const [preferences, setPreferences] = useState(quizStorage.getPreferences());
  const [showSettings, setShowSettings] = useState(false);
  
  // Load quiz questions
  useEffect(() => {
    const data = getChapterQuestions(chapterId, version);
    if (data) {
      setQuizData(data);
      
      // Check for existing session
      const existingSession = quizStorage.getCurrentSession(chapterId);
      if (existingSession && existingSession.version === version) {
        // Resume existing session
        setCurrentQuestion(existingSession.currentQuestion || 0);
        setAnswers(existingSession.answers || {});
        setFlaggedQuestions(existingSession.flaggedQuestions || []);
        setQuizState('quiz');
        setStartTime(existingSession.startTime);
      }
    }
  }, [chapterId, version]);
  
  // Start quiz
  const handleStartQuiz = () => {
    setQuizState('quiz');
    setStartTime(Date.now());
    setCurrentQuestion(0);
    setAnswers({});
    setFlaggedQuestions([]);
    quizStorage.clearCurrentSession();
  };
  
  // Handle answer submission
  const handleAnswer = (questionIndex, isCorrect, answer) => {
    const newAnswers = {
      ...answers,
      [questionIndex]: {
        answer,
        isCorrect,
        timestamp: Date.now()
      }
    };
    setAnswers(newAnswers);
    
    // Save session
    quizStorage.saveCurrentSession(chapterId, {
      currentQuestion,
      answers: newAnswers,
      timeRemaining: null, // Calculate from timer
      startTime,
      flaggedQuestions,
      version
    });
    
    // No auto-advance - user must click Next button
  };
  
  // Navigate between questions
  const handleNavigate = (index) => {
    if (index >= 0 && index < quizData.questions.length) {
      setCurrentQuestion(index);
    }
  };
  
  // Flag question for review
  const handleFlag = (index) => {
    setFlaggedQuestions(prev => 
      prev.includes(index) 
        ? prev.filter(q => q !== index)
        : [...prev, index]
    );
  };
  
  // Submit quiz
  const handleSubmitQuiz = () => {
    const endTime = Date.now();
    const totalTime = Math.floor((endTime - startTime) / 1000);
    setTimeSpent(totalTime);
    
    // Calculate results
    const correctAnswers = Object.entries(answers)
      .filter(([_, data]) => data.isCorrect)
      .map(([index]) => parseInt(index));
    
    const incorrectAnswers = Object.entries(answers)
      .filter(([_, data]) => !data.isCorrect)
      .map(([index]) => parseInt(index));
    
    // Save attempt
    const attemptData = {
      score: correctAnswers.length,
      percentage: Math.round((correctAnswers.length / quizData.questions.length) * 100),
      timeSpent: totalTime,
      totalQuestions: quizData.questions.length,
      correctAnswers: correctAnswers.length,
      answers,
      version
    };
    
    quizStorage.saveAttempt(chapterId, attemptData);
    quizStorage.clearCurrentSession();
    
    setQuizState('results');
  };
  
  // Handle timer expiry
  const handleTimeUp = () => {
    handleSubmitQuiz();
  };
  
  // Retake quiz
  const handleRetake = () => {
    handleStartQuiz();
  };
  
  // Review answers
  const handleReview = () => {
    setQuizState('review');
    setCurrentQuestion(0);
  };
  
  // Get quiz statistics
  const stats = quizStorage.getChapterStats(chapterId);
  const previousBest = stats.bestScore;
  
  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <p className="text-neutral-400">Loading quiz questions...</p>
        </div>
      </div>
    );
  }
  
  // Render based on quiz state
  if (quizState === 'intro') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
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
                {previousBest > 0 ? `${previousBest}%` : 'Not attempted'}
              </p>
            </div>
          </div>
          
          {stats.totalAttempts > 0 && (
            <div className="pt-4 border-t border-neutral-800">
              <p className="text-sm text-neutral-400">
                You've attempted this quiz {stats.totalAttempts} time{stats.totalAttempts > 1 ? 's' : ''}.
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
                    const newPrefs = { ...preferences, showTimer: e.target.checked };
                    setPreferences(newPrefs);
                    quizStorage.savePreferences(newPrefs);
                  }}
                  className="rounded"
                />
                <span className="text-sm text-neutral-300">Show timer</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.immediateFeeback}
                  onChange={(e) => {
                    const newPrefs = { ...preferences, immediateFeeback: e.target.checked };
                    setPreferences(newPrefs);
                    quizStorage.savePreferences(newPrefs);
                  }}
                  className="rounded"
                />
                <span className="text-sm text-neutral-300">Show immediate feedback</span>
              </label>
              
              <div className="pt-2">
                <label className="text-sm text-neutral-400">Version:</label>
                <select
                  value={version}
                  onChange={(e) => window.location.href = `?version=${e.target.value}`}
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
        
        {/* Start Button */}
        <Button
          onClick={handleStartQuiz}
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
    const correctAnswers = Object.entries(answers)
      .filter(([_, data]) => data.isCorrect)
      .map(([index]) => parseInt(index));
    
    const incorrectAnswers = Object.entries(answers)
      .filter(([_, data]) => !data.isCorrect)
      .map(([index]) => parseInt(index));
    
    return (
      <QuizResults
        score={correctAnswers.length}
        totalQuestions={quizData.questions.length}
        timeSpent={timeSpent}
        correctAnswers={correctAnswers}
        incorrectAnswers={incorrectAnswers}
        passingScore={quizData.passingScore}
        previousBest={previousBest}
        onRetake={handleRetake}
        onReview={handleReview}
        chapterId={chapterId}
        chapterTitle={quizData.title}
      />
    );
  }
  
  // Main quiz interface
  const question = quizData.questions[currentQuestion];
  const answeredQuestions = Object.keys(answers).map(k => parseInt(k));
  const allAnswered = answeredQuestions.length === quizData.questions.length;
  
  const correctAnswers = Object.entries(answers)
    .filter(([_, data]) => data.isCorrect)
    .map(([index]) => parseInt(index));
  
  const incorrectAnswers = Object.entries(answers)
    .filter(([_, data]) => !data.isCorrect)
    .map(([index]) => parseInt(index));
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{quizData.title}</h1>
        {preferences.showTimer && quizState === 'quiz' && (
          <QuizTimer
            timeLimit={quizData.timeLimit}
            onTimeUp={handleTimeUp}
            isPaused={isPaused}
            onPauseToggle={() => setIsPaused(!isPaused)}
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
      <div className="bg-neutral-900 rounded-lg p-8 border border-neutral-700">
        {/* Topic Badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-400 text-sm rounded-full border border-teal-500/30">
            {question.topic}
          </span>
        </div>
        
        {/* Question Content */}
        <QuizQuestionWrapper
          key={currentQuestion} // Force remount when question changes
          question={question}
          onAnswer={(isCorrect, answer) => handleAnswer(currentQuestion, isCorrect, answer)}
          showExplanation={preferences.immediateFeeback || quizState === 'review'}
          disabled={quizState === 'review'}
        />
        
        {/* Next Question Button - Shows after answering */}
        {quizState === 'quiz' && answers[currentQuestion] && currentQuestion < quizData.questions.length - 1 && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
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
      
      {/* Submit Button */}
      {quizState === 'quiz' && allAnswered && (
        <div className="flex justify-center">
          <Button
            onClick={handleSubmitQuiz}
            variant="success"
            size="lg"
            className="min-w-[200px]"
          >
            Submit Quiz
          </Button>
        </div>
      )}
      
      {/* Back to Results (in review mode) */}
      {quizState === 'review' && (
        <div className="flex justify-center">
          <Button
            onClick={() => setQuizState('results')}
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