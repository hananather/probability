"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { useSafeMathJax } from '../../utils/mathJaxFix';

// Single quiz question component (internal use)
function QuizQuestion({ question, options, correctIndex, explanation, onAnswer, showExplanation }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const questionRef = useRef(null);
  const optionsRef = useRef(null);
  
  // Use safe MathJax processing
  useSafeMathJax(questionRef, [question]);
  useSafeMathJax(optionsRef, [options]);
  
  const handleAnswerSelect = (index) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  };
  
  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setShowFeedback(true);
    setIsAnswered(true);
    
    const isCorrect = selectedAnswer === correctIndex;
    onAnswer(isCorrect);
  };
  
  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsAnswered(false);
  };
  
  const isCorrect = selectedAnswer === correctIndex;
  
  return (
    <div className="space-y-4">
      {/* Question */}
      <div ref={questionRef}>
        <p className="text-base text-neutral-200">{question}</p>
      </div>
      
      {/* Options */}
      <div ref={optionsRef} className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const showAsCorrect = showFeedback && index === correctIndex;
          const showAsIncorrect = showFeedback && isSelected && index !== correctIndex;
          
          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              className={`
                w-full p-4 rounded-lg border text-left transition-all duration-300 ease-out
                ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] hover:shadow-lg'}
                ${
                  showAsCorrect
                    ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/30 scale-[1.02]'
                    : showAsIncorrect
                    ? 'bg-red-500/20 border-red-500/50 shadow-lg shadow-red-500/30 scale-[1.02]'
                    : isSelected
                    ? 'bg-blue-500/20 border-blue-500/50 shadow-md'
                    : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800/50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ease-out
                      ${
                        showAsCorrect
                          ? 'border-green-500 bg-green-500 scale-110'
                          : showAsIncorrect
                          ? 'border-red-500 bg-red-500 scale-110'
                          : isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-neutral-600'
                      }
                    `}
                  >
                    {isSelected && !showFeedback && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                    {showAsCorrect && <CheckCircle className="w-3 h-3 text-white" />}
                    {showAsIncorrect && <XCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span
                    className={`
                      text-sm transition-colors duration-300
                      ${
                        showAsCorrect
                          ? 'text-green-300 font-medium'
                          : showAsIncorrect
                          ? 'text-red-300 font-medium'
                          : 'text-neutral-200'
                      }
                    `}
                  >
                    {option}
                  </span>
                </div>
                {showAsCorrect && !isSelected && (
                  <span className="text-xs text-green-400 animate-pulse">Correct answer</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Action Buttons and Feedback */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {!isAnswered ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              variant="primary"
              size="default"
              className="min-w-[120px] transition-all duration-300 hover:scale-105"
            >
              Submit
            </Button>
          ) : (
            <>
              {isCorrect ? (
                <div className="flex items-center gap-2 text-green-400 animate-pulse">
                  <CheckCircle className="w-5 h-5 " />
                  <span className="font-medium">Correct!</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-red-400 animate-pulse">
                    <XCircle className="w-5 h-5 " />
                    <span className="font-medium">Not quite right</span>
                  </div>
                  <Button
                    onClick={handleTryAgain}
                    variant="neutral"
                    size="sm"
                    className="transition-all duration-300 hover:scale-105"
                  >
                    Try Again
                  </Button>
                </>
              )}
            </>
          )}
        </div>
        
        {/* Explanation */}
        {showFeedback && showExplanation && explanation && (
          <div
            className={`
              p-3 rounded-lg text-sm transition-all duration-500 ease-out animate-in slide-in-from-top-2
              ${
                isCorrect
                  ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                  : 'bg-orange-500/10 border border-orange-500/30 text-orange-300'
              }
            `}
          >
            <p className="font-medium mb-1">Explanation:</p>
            <p>{explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * QuizBreak Component
 * 
 * A versatile quiz component that supports both single questions and multi-question quizzes.
 * Can be used in two ways:
 * 
 * 1. Single Question Mode:
 *    <QuizBreak
 *      question="What is 2 + 2?"
 *      options={["3", "4", "5", "6"]}
 *      correct={1}
 *      onComplete={() => console.log('Completed!')}
 *    />
 * 
 * 2. Multiple Questions Mode:
 *    <QuizBreak
 *      questions={[
 *        {
 *          question: "What is 2 + 2?",
 *          options: ["3", "4", "5", "6"],
 *          correctIndex: 1,
 *          explanation: "Basic addition"
 *        },
 *        // ... more questions
 *      ]}
 *      onComplete={() => console.log('All completed!')}
 *    />
 * 
 * Features:
 * - LaTeX support via MathJax
 * - Progress tracking for multiple questions
 * - Explanations (optional)
 * - Auto-advance to next question
 * - Gate functionality (blocks progression until all correct)
 */
export function QuizBreak({ 
  // Single question props
  question, 
  options, 
  correct,
  correctIndex, // Add support for correctIndex prop
  // Multiple questions props
  questions,
  // Common props
  onComplete,
  isCompleted 
}) {
  // Determine if we're in single or multiple question mode
  const isMultipleMode = questions && questions.length > 0;
  
  // Convert single question to array format for unified handling
  // Support both 'correct' and 'correctIndex' props for backward compatibility
  const correctAnswerIndex = correctIndex !== undefined ? correctIndex : correct;
  const allQuestions = isMultipleMode 
    ? questions 
    : [{ question, options, correctIndex: correctAnswerIndex }];
  
  const [answeredCorrectly, setAnsweredCorrectly] = useState(new Set());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Check if all questions are answered correctly
  const allQuestionsAnswered = answeredCorrectly.size === allQuestions.length;
  
  // Notify parent when completed
  useEffect(() => {
    if (allQuestionsAnswered && onComplete && !isCompleted) {
      onComplete();
    }
  }, [allQuestionsAnswered, onComplete, isCompleted]);
  
  const handleAnswer = (questionIndex, isCorrect) => {
    if (isCorrect) {
      setAnsweredCorrectly(prev => new Set([...prev, questionIndex]));
      
      // For single question mode, call onComplete immediately
      if (!isMultipleMode) {
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 1500);
      }
    }
  };
  
  if (!allQuestions || allQuestions.length === 0) {
    return null;
  }
  
  return (
    <div className="my-12 relative">
      {/* Quiz Card */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-[1px] rounded-lg">
        <div className="bg-[#0F0F10] rounded-lg p-8">
          {/* Quiz Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Quick Check</h3>
            </div>
            {isMultipleMode && (
              <div className="text-sm text-neutral-400">
                {answeredCorrectly.size} of {allQuestions.length} completed
              </div>
            )}
          </div>
          
          {/* Progress indicators for multiple questions */}
          {isMultipleMode && allQuestions.length > 1 && (
            <div className="flex gap-2 mb-6">
              {allQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`
                    flex-1 h-1.5 rounded-full transition-all duration-300 cursor-pointer
                    ${
                      answeredCorrectly.has(idx)
                        ? 'bg-green-500'
                        : idx === currentQuestion
                        ? 'bg-blue-500'
                        : 'bg-neutral-700'
                    }
                  `}
                  title={`Question ${idx + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* Current Question */}
          <QuizQuestion
            key={currentQuestion}  // Force new instance for each question to reset state
            {...allQuestions[currentQuestion]}
            onAnswer={(isCorrect) => handleAnswer(currentQuestion, isCorrect)}
            showExplanation={isMultipleMode}
          />
          
          {/* Next question indicator for multiple questions */}
          {isMultipleMode && answeredCorrectly.has(currentQuestion) && !allQuestionsAnswered && (
            <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30 transition-all duration-500 ease-out animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 " />
                <span className="text-sm text-green-300">Great! You got this one right.</span>
              </div>
              {currentQuestion < allQuestions.length - 1 && (
                <button
                  onClick={() => {
                    const nextUnanswered = allQuestions.findIndex(
                      (_, idx) => idx > currentQuestion && !answeredCorrectly.has(idx)
                    );
                    if (nextUnanswered !== -1) {
                      setCurrentQuestion(nextUnanswered);
                    }
                  }}
                  className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1 transition-all duration-300 hover:scale-105"
                >
                  Next question →
                </button>
              )}
            </div>
          )}
          
          {/* Single question feedback */}
          {!isMultipleMode && answeredCorrectly.has(0) && (
            <div className="mt-4 p-3 rounded-lg text-sm bg-green-500/10 border border-green-500/30 text-green-300 transition-all duration-500 ease-out animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 " />
                <span>Great job! You got it right. Let's continue to the next section.</span>
              </div>
            </div>
          )}
          
          {/* Multiple questions completion message */}
          {isMultipleMode && allQuestionsAnswered && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg transition-all duration-500 ease-out animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 " />
                <p className="text-sm text-green-400">
                  Excellent! You've completed all questions. Continue to the next section.
                </p>
              </div>
            </div>
          )}
          
          {/* Gate message for multiple questions */}
          {isMultipleMode && !allQuestionsAnswered && (
            <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg transition-all duration-500 ease-out animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 animate-pulse" />
                <p className="text-sm text-blue-400">
                  Answer all questions correctly to continue to the next section
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// SectionBreak component - exported from same file for easy imports
export function SectionBreak() {
  return null; // This component is just a marker for ProgressiveContent
}

/**
 * MultipleChoiceQuestion Component
 * 
 * A simplified standalone quiz component for use outside of MDX content.
 * For MDX content, use QuizBreak instead.
 * 
 * @param {Object} props
 * @param {string} props.question - The question text (supports LaTeX)
 * @param {string[]} props.options - Array of answer options (supports LaTeX)
 * @param {number} props.correct - Index of the correct answer (0-based)
 * @param {Function} props.onAnswer - Callback when answer is submitted (isCorrect, selectedIndex)
 * @param {boolean} props.showResult - Whether to show correct/incorrect feedback
 * @param {string} props.className - Additional CSS classes
 */
export function MultipleChoiceQuestion({
  question,
  options,
  correct,
  onAnswer,
  showResult = true,
  className = ''
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const questionRef = useRef(null);
  const optionsRef = useRef(null);
  
  // Use safe MathJax processing
  useSafeMathJax(questionRef, [question]);
  useSafeMathJax(optionsRef, [options]);
  
  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setIsAnswered(true);
    const isCorrect = selectedAnswer === correct;
    
    if (onAnswer) {
      onAnswer(isCorrect, selectedAnswer);
    }
  };
  
  const handleReset = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
  };
  
  return (
    <div className={`bg-neutral-900 rounded-lg p-6 ${className}`}>
      {/* Question */}
      <div ref={questionRef} className="mb-4">
        <p className="text-base text-neutral-200 font-medium">{question}</p>
      </div>
      
      {/* Options */}
      <div ref={optionsRef} className="space-y-2 mb-4">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const showAsCorrect = showResult && isAnswered && index === correct;
          const showAsIncorrect = showResult && isAnswered && isSelected && index !== correct;
          
          return (
            <button
              key={index}
              onClick={() => !isAnswered && setSelectedAnswer(index)}
              disabled={isAnswered}
              className={`
                w-full p-3 rounded border text-left transition-all text-sm
                ${
                  showAsCorrect
                    ? 'bg-green-500/20 border-green-500 text-green-300'
                    : showAsIncorrect
                    ? 'bg-red-500/20 border-red-500 text-red-300'
                    : isSelected
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                }
                ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${
                      showAsCorrect || showAsIncorrect || isSelected
                        ? 'border-current'
                        : 'border-neutral-600'
                    }
                  `}
                >
                  {isSelected && !isAnswered && (
                    <div className="w-2 h-2 bg-current rounded-full" />
                  )}
                  {showAsCorrect && <CheckCircle className="w-3 h-3" />}
                  {showAsIncorrect && <XCircle className="w-3 h-3" />}
                </div>
                <span>{option}</span>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-3">
        {!isAnswered ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            variant="primary"
            size="sm"
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={handleReset}
            variant="neutral"
            size="sm"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

// Backward compatibility alias
export { QuizBreak as QuizGate };

// Static markers for production builds (survive minification)
QuizBreak._isQuizBreak = true;
SectionBreak._isSectionBreak = true;
MultipleChoiceQuestion._isQuizBreak = true;