"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Square, CheckSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { useMathJax } from '@/hooks/useMathJax';

export function MultiSelectQuestion({
  question,
  options,
  correctIndices,
  explanation,
  onAnswer,
  showExplanation = false,
  disabled = false,
  reviewMode = false,
  questionId,
  questionHeadingRef,
  savedAnswer
}) {
  const [selectedAnswers, setSelectedAnswers] = useState(new Set(savedAnswer?.answer || []));
  const [showFeedback, setShowFeedback] = useState(Boolean(savedAnswer) || reviewMode);
  const [isAnswered, setIsAnswered] = useState(Boolean(savedAnswer) || reviewMode);
  const questionIdentity = questionId ?? JSON.stringify([question, options, correctIndices]);
  const savedAnswerIdentity = JSON.stringify([Boolean(savedAnswer), savedAnswer?.answer ?? null, savedAnswer?.timestamp ?? null, savedAnswer?.isCorrect ?? null]);
  
  // Use safe MathJax processing - useMathJax returns a ref
  const questionRef = useMathJax([question]);
  const optionsRef = useMathJax(options); // options is already an array
  const explanationRef = useMathJax([explanation]);
  
  // Preserve drafts when unrelated session updates clone the pinned options or saved answer.
  useEffect(() => {
    const [hasSavedAnswer, answer] = JSON.parse(savedAnswerIdentity);
    setSelectedAnswers(new Set(answer || []));
    setShowFeedback(hasSavedAnswer || reviewMode);
    setIsAnswered(hasSavedAnswer || reviewMode);
  }, [questionIdentity, savedAnswerIdentity, reviewMode]);
  
  const handleToggleOption = (index) => {
    if (isAnswered || disabled || reviewMode) return;
    
    const newSelected = new Set(selectedAnswers);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedAnswers(newSelected);
  };
  
  const handleSubmit = () => {
    if (isAnswered || disabled || reviewMode) return;
    if (selectedAnswers.size === 0) return;
    
    setShowFeedback(true);
    setIsAnswered(true);
    
    // Check if answer is correct
    const correctSet = new Set(correctIndices);
    const isCorrect = 
      selectedAnswers.size === correctSet.size &&
      [...selectedAnswers].every(ans => correctSet.has(ans));
    
    if (onAnswer) {
      onAnswer(isCorrect, Array.from(selectedAnswers));
    }
  };
  
  const handleTryAgain = () => {
    setSelectedAnswers(new Set());
    setShowFeedback(false);
    setIsAnswered(false);
  };
  
  // Check correctness for feedback
  const correctSet = new Set(correctIndices);
  const isCorrect = 
    selectedAnswers.size === correctSet.size &&
    [...selectedAnswers].every(ans => correctSet.has(ans));
  
  return (
    <div className="space-y-4">
      {/* Question */}
      <div ref={questionRef}>
        <h2 ref={questionHeadingRef} tabIndex={-1} className="text-base text-neutral-200 font-medium scroll-mt-24">{question}</h2>
        <p className="text-sm text-teal-400 mt-2">Select all that apply:</p>
      </div>
      
      {/* Options */}
      <div ref={optionsRef} role="group" aria-label="Answer choices; select all that apply" className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedAnswers.has(index);
          const isCorrectOption = correctSet.has(index);
          const showAsCorrect = showFeedback && isCorrectOption;
          const showAsIncorrect = showFeedback && isSelected && !isCorrectOption;
          const showAsMissed = showFeedback && !isSelected && isCorrectOption;
          
          return (
            <button
              key={index}
              onClick={() => handleToggleOption(index)}
              disabled={isAnswered || disabled || reviewMode}
              aria-pressed={isSelected}
              className={`
                w-full p-4 rounded-lg border text-left transition-all duration-300
                ${(isAnswered || disabled) ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] hover:shadow-lg'}
                ${
                  showAsCorrect && isSelected
                    ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/30'
                    : showAsIncorrect
                    ? 'bg-red-500/20 border-red-500/50 shadow-lg shadow-red-500/30'
                    : showAsMissed
                    ? 'bg-orange-500/20 border-orange-500/50 shadow-lg shadow-orange-500/30'
                    : isSelected
                    ? 'bg-blue-500/20 border-blue-500/50 shadow-md'
                    : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800/50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {/* Checkbox Icon */}
                    {showFeedback ? (
                      showAsCorrect && isSelected ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : showAsIncorrect ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : showAsMissed ? (
                        <div className="relative">
                          <Square className="w-5 h-5 text-orange-500" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-orange-500 text-xs font-bold">!</span>
                          </div>
                        </div>
                      ) : (
                        <Square className="w-5 h-5 text-neutral-600" />
                      )
                    ) : isSelected ? (
                      <CheckSquare className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Square className="w-5 h-5 text-neutral-600" />
                    )}
                  </div>
                  
                  <span
                    className={`
                      text-sm transition-colors duration-300
                      ${
                        showAsCorrect && isSelected
                          ? 'text-green-300 font-medium'
                          : showAsIncorrect
                          ? 'text-red-300 font-medium'
                          : showAsMissed
                          ? 'text-orange-300 font-medium'
                          : 'text-neutral-200'
                      }
                    `}
                  >
                    {option}
                  </span>
                </div>
                
                {/* Feedback labels */}
                {showFeedback && (
                  <span className="text-xs">
                    {showAsCorrect && isSelected && (
                      <span className="text-green-400">Correct</span>
                    )}
                    {showAsIncorrect && (
                      <span className="text-red-400">Incorrect</span>
                    )}
                    {showAsMissed && (
                      <span className="text-orange-400 animate-pulse">Should be selected</span>
                    )}
                  </span>
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
            <>
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswers.size === 0 || disabled || reviewMode}
                variant="primary"
                size="default"
                className="min-w-[120px]"
              >
                Submit
              </Button>
              <span className="text-sm text-neutral-400">
                {selectedAnswers.size} selected
              </span>
            </>
          ) : (
            <>
              {isCorrect ? (
                <div role="status" className="flex items-center gap-2 text-green-400 animate-pulse">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">All correct!</span>
                </div>
              ) : (
                <>
                  <div role="status" className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">{savedAnswer || !reviewMode ? 'Not quite right' : 'Not answered'}</span>
                  </div>
                  {!disabled && !reviewMode && <Button
                    onClick={handleTryAgain}
                    variant="neutral"
                    size="sm"
                  >
                    Try Again
                  </Button>}
                </>
              )}
            </>
          )}
        </div>
        
        {/* Explanation */}
        {showFeedback && showExplanation && explanation && (
          <div
            ref={explanationRef}
            className={`
              p-3 rounded-lg text-sm transition-all duration-500 animate-in slide-in-from-top-2
              ${
                isCorrect
                  ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                  : 'bg-orange-500/10 border border-orange-500/30 text-orange-300'
              }
            `}
          >
            <p className="font-medium mb-1">Explanation:</p>
            <p>{explanation}</p>
            {!isCorrect && (
              <p className="mt-2 text-xs opacity-80">
                The correct answers were: {correctIndices.map(i => options[i]).join(', ')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
