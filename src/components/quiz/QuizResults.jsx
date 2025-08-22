"use client";
import React from 'react';
import { Trophy, Target, Clock, TrendingUp, RefreshCcw, Home, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

export function QuizResults({
  score,
  totalQuestions,
  timeSpent,
  correctAnswers,
  incorrectAnswers,
  passingScore = 50,
  previousBest = null,
  onRetake,
  onReview,
  chapterId,
  chapterTitle
}) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= passingScore;
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;
  const improvement = previousBest ? percentage - previousBest : null;
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">
          Quiz Complete
        </h2>
        <p className="text-neutral-400">
          {chapterTitle}
        </p>
      </div>
      
      {/* Score Card */}
      <div className={`relative bg-gradient-to-br ${
        passed 
          ? 'from-green-900/20 to-teal-900/20 border-green-500/30' 
          : 'from-orange-900/20 to-red-900/20 border-orange-500/30'
      } rounded-xl p-8 border`}>
        {/* Main Score */}
        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-white mb-2">
            {percentage}%
          </div>
          <p className="text-neutral-400">
            {score} out of {totalQuestions} questions correct
          </p>
          
          {/* Pass/Fail Badge */}
          <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full ${
            passed 
              ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
              : 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
          }`}>
            {passed ? (
              <>
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">PASSED</span>
              </>
            ) : (
              <>
                <Target className="w-5 h-5" />
                <span className="font-semibold">
                  Need {passingScore}% to pass ({Math.ceil(totalQuestions * passingScore / 100)} correct answers)
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Time Spent */}
          <div className="bg-neutral-900/50 rounded-lg p-4 text-center">
            <Clock className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-neutral-400">Time Spent</p>
          </div>
          
          {/* Correct Answers */}
          <div className="bg-green-900/20 rounded-lg p-4 text-center border border-green-500/30">
            <div className="w-5 h-5 rounded-full bg-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-400">{correctAnswers.length}</p>
            <p className="text-xs text-green-400">Correct</p>
          </div>
          
          {/* Incorrect Answers */}
          <div className="bg-red-900/20 rounded-lg p-4 text-center border border-red-500/30">
            <div className="w-5 h-5 rounded-full bg-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-400">{incorrectAnswers.length}</p>
            <p className="text-xs text-red-400">Incorrect</p>
          </div>
        </div>
        
        {/* Improvement Indicator */}
        {improvement !== null && (
          <div className="mt-6 p-4 bg-neutral-900/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Previous Best: {previousBest}%</span>
              {improvement > 0 ? (
                <div className="flex items-center gap-2 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-semibold">+{improvement}% improvement!</span>
                </div>
              ) : improvement < 0 ? (
                <span className="text-orange-400">-{Math.abs(improvement)}% from best</span>
              ) : (
                <span className="text-neutral-400">Same as best</span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Topic Performance (if available) */}
      {incorrectAnswers.length > 0 && (
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700">
          <h3 className="text-lg font-semibold text-white mb-4">Areas for Review</h3>
          <p className="text-sm text-neutral-400 mb-3">
            Consider reviewing these topics:
          </p>
          <div className="space-y-2">
            {/* This would be populated with actual topic data */}
            <div className="flex items-center justify-between p-2 bg-neutral-800 rounded">
              <span className="text-sm text-neutral-300">Questions to review:</span>
              <span className="text-sm text-orange-400 font-mono">
                {incorrectAnswers.map(q => q + 1).join(', ')}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {onReview && (
          <Button
            onClick={onReview}
            variant="primary"
            size="lg"
            className="flex-1 flex items-center justify-center gap-2"
          >
            Review Answers
          </Button>
        )}
        
        <Button
          onClick={onRetake}
          variant={passed ? "neutral" : "warning"}
          size="lg"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          Retake Quiz
        </Button>
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
        <Link href={`/chapter${chapterId}`}>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Back to Chapter
          </Button>
        </Link>
        
        {passed && chapterId < 7 && (
          <Link href={`/chapter${chapterId + 1}`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              Next Chapter
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
      
      {/* Motivational Message */}
      {!passed && (
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <p className="text-sm text-blue-300">
            <strong>Study Tip:</strong> Review the incorrect answers and try the chapter's practice problems 
            before retaking the quiz. You can do this!
          </p>
        </div>
      )}
      
      {passed && percentage < 100 && (
        <div className="bg-teal-900/20 rounded-lg p-4 border border-teal-500/30">
          <p className="text-sm text-teal-300">
            <strong>Great job!</strong> You passed the quiz! Consider reviewing the questions you missed 
            to achieve mastery of the material.
          </p>
        </div>
      )}
      
      {percentage === 100 && (
        <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-lg p-4 border border-yellow-500/30">
          <p className="text-sm text-yellow-300 text-center font-semibold">
            🌟 Perfect Score! You've mastered {chapterTitle}! 🌟
          </p>
        </div>
      )}
    </div>
  );
}