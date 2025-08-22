"use client";
import React from 'react';
import { ChevronLeft, ChevronRight, Flag, Check, X } from 'lucide-react';
import { Button } from '../ui/button';

export function QuizProgress({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
  flaggedQuestions = [],
  correctAnswers = [],
  incorrectAnswers = [],
  onNavigate,
  onFlag,
  showReview = false
}) {
  // Generate question status array
  const getQuestionStatus = (index) => {
    if (showReview) {
      if (correctAnswers.includes(index)) return 'correct';
      if (incorrectAnswers.includes(index)) return 'incorrect';
    }
    if (flaggedQuestions.includes(index)) return 'flagged';
    if (answeredQuestions.includes(index)) return 'answered';
    return 'unanswered';
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'correct': return 'bg-green-500 border-green-400';
      case 'incorrect': return 'bg-red-500 border-red-400';
      case 'flagged': return 'bg-orange-500 border-orange-400';
      case 'answered': return 'bg-teal-500 border-teal-400';
      case 'current': return 'bg-blue-500 border-blue-400 ring-2 ring-blue-400 ring-offset-2 ring-offset-neutral-900';
      default: return 'bg-neutral-700 border-neutral-600';
    }
  };
  
  const getStatusIcon = (status, index) => {
    if (status === 'correct') return <Check className="w-3 h-3 text-white" />;
    if (status === 'incorrect') return <X className="w-3 h-3 text-white" />;
    if (status === 'flagged' && index !== currentQuestion) return <Flag className="w-3 h-3 text-white" />;
    return null;
  };
  
  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">
            Question {currentQuestion + 1} of {totalQuestions}
          </h3>
          {!showReview && (
            <button
              onClick={() => onFlag && onFlag(currentQuestion)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                flaggedQuestions.includes(currentQuestion)
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border border-neutral-700'
              }`}
            >
              <Flag className="w-4 h-4" />
              {flaggedQuestions.includes(currentQuestion) ? 'Flagged' : 'Flag for Review'}
            </button>
          )}
        </div>
        
        {/* Statistics */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-neutral-400">
            Answered: <span className="text-teal-400 font-semibold">{answeredQuestions.length}</span>/{totalQuestions}
          </span>
          {flaggedQuestions.length > 0 && (
            <span className="text-neutral-400">
              Flagged: <span className="text-orange-400 font-semibold">{flaggedQuestions.length}</span>
            </span>
          )}
        </div>
      </div>
      
      {/* Question Grid */}
      <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700">
        <div className="grid grid-cols-10 gap-2 mb-4">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const status = getQuestionStatus(i);
            const isCurrent = i === currentQuestion;
            
            return (
              <button
                key={i}
                onClick={() => onNavigate(i)}
                className={`
                  relative w-10 h-10 rounded-lg border-2 flex items-center justify-center
                  font-semibold text-sm transition-all transform hover:scale-110
                  ${isCurrent ? getStatusColor('current') : getStatusColor(status)}
                  ${!isCurrent && 'hover:ring-2 hover:ring-neutral-500 hover:ring-offset-1 hover:ring-offset-neutral-900'}
                `}
                title={`Question ${i + 1}${status === 'flagged' ? ' (Flagged)' : ''}`}
              >
                {getStatusIcon(status, i) || (
                  <span className={isCurrent ? 'text-white' : 'text-neutral-300'}>
                    {i + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-neutral-700 rounded border-2 border-neutral-600" />
            <span className="text-neutral-400">Not answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-500 rounded border-2 border-teal-400" />
            <span className="text-neutral-400">Answered</span>
          </div>
          {flaggedQuestions.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded border-2 border-orange-400" />
              <span className="text-neutral-400">Flagged</span>
            </div>
          )}
          {showReview && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-400" />
                <span className="text-neutral-400">Correct</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded border-2 border-red-400" />
                <span className="text-neutral-400">Incorrect</span>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => onNavigate(currentQuestion - 1)}
          disabled={currentQuestion === 0}
          variant="neutral"
          size="sm"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        {/* Quick Jump to Flagged */}
        {!showReview && flaggedQuestions.length > 0 && (
          <button
            onClick={() => {
              const nextFlagged = flaggedQuestions.find(q => q > currentQuestion) || flaggedQuestions[0];
              onNavigate(nextFlagged);
            }}
            className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            Jump to next flagged →
          </button>
        )}
        
        <Button
          onClick={() => onNavigate(currentQuestion + 1)}
          disabled={currentQuestion === totalQuestions - 1}
          variant="neutral"
          size="sm"
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}