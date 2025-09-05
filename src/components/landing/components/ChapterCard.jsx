'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Circle, Clock, Lock, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useChapterProgress } from '@/hooks/useProgress';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

// Predefined color classes to ensure they're included in the build
const colorStyles = {
  teal: {
    text: 'text-teal-400',
    bg: 'bg-teal-600',
    bgHover: 'hover:bg-teal-700',
    progressBg: 'bg-teal-500',
    progressTrack: 'bg-teal-900'
  },
  blue: {
    text: 'text-blue-400',
    bg: 'bg-blue-600',
    bgHover: 'hover:bg-blue-700',
    progressBg: 'bg-blue-500',
    progressTrack: 'bg-blue-900'
  },
  purple: {
    text: 'text-purple-400',
    bg: 'bg-purple-600',
    bgHover: 'hover:bg-purple-700',
    progressBg: 'bg-purple-500',
    progressTrack: 'bg-purple-900'
  },
  emerald: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-700',
    progressBg: 'bg-emerald-500',
    progressTrack: 'bg-emerald-900'
  },
  orange: {
    text: 'text-orange-400',
    bg: 'bg-orange-600',
    bgHover: 'hover:bg-orange-700',
    progressBg: 'bg-orange-500',
    progressTrack: 'bg-orange-900'
  },
  pink: {
    text: 'text-pink-400',
    bg: 'bg-pink-600',
    bgHover: 'hover:bg-pink-700',
    progressBg: 'bg-pink-500',
    progressTrack: 'bg-pink-900'
  },
  indigo: {
    text: 'text-indigo-400',
    bg: 'bg-indigo-600',
    bgHover: 'hover:bg-indigo-700',
    progressBg: 'bg-indigo-500',
    progressTrack: 'bg-indigo-900'
  },
  violet: {
    text: 'text-violet-400',
    bg: 'bg-violet-600',
    bgHover: 'hover:bg-violet-700',
    progressBg: 'bg-violet-500',
    progressTrack: 'bg-violet-900'
  }
};

const ChapterCard = React.memo(({ chapter, index, visualization: Visualization, isLocked = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const chapterId = `chapter-${index + 1}`;
  
  // Get progress data for this chapter
  const {
    chapterProgress,
    isCompleted,
    isInProgress,
    isNotStarted,
    progressPercentage,
    start,
    loading
  } = useChapterProgress(chapterId);
  
  // Handle client-side mounting for hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const colorKeys = ['teal', 'blue', 'purple', 'emerald', 'orange', 'pink', 'indigo', 'violet'];
  const colorKey = colorKeys[index];
  const colorClasses = colorStyles[colorKey];
  
  // Handle chapter start and navigate when clicking the button
  const handleBeginLearning = async (e) => {
    e.stopPropagation(); // Prevent bubbling to outer Link
    try {
      if (isNotStarted) {
        await start();
      }
    } finally {
      // Always navigate to the same destination as the card
      navigateToChapter();
    }
  };
  
  // Navigate to chapter
  const navigateToChapter = () => {
    if (!isLocked) {
      window.location.href = `/chapter${index + 1}`;
    }
  };
  
  // Get status badge
  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-900/50 rounded-full">
          <CheckCircle className="w-3 h-3 text-green-400" />
          <span className="text-xs text-green-400 font-medium">Completed</span>
        </div>
      );
    }
    if (isInProgress) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-900/50 rounded-full">
          <Clock className="w-3 h-3 text-yellow-400" />
          <span className="text-xs text-yellow-400 font-medium">In Progress</span>
        </div>
      );
    }
    if (isLocked) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-neutral-700/50 rounded-full">
          <Lock className="w-3 h-3 text-neutral-400" />
          <span className="text-xs text-neutral-400 font-medium">Locked</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-blue-900/50 rounded-full">
        <BookOpen className="w-3 h-3 text-blue-400" />
        <span className="text-xs text-blue-400 font-medium">New</span>
      </div>
    );
  };
  
  // Get button text based on status
  const getButtonText = () => {
    if (isCompleted) return 'Review Chapter';
    if (isInProgress) return 'Continue Learning';
    if (isLocked) return 'Unlock Required';
    return 'Begin Learning';
  };
  
  // Format last visited date
  const formatLastVisited = () => {
    if (!chapterProgress.lastVisited) return null;
    const date = new Date(chapterProgress.lastVisited);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };
  
  return (
    <Link 
      href={isLocked ? '#' : `/chapter${index + 1}`}
      className={`block ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={(e) => {
        if (isLocked) {
          e.preventDefault();
        } else if (isNotStarted) {
          start();
        }
      }}
    >
      <div
        className={`bg-neutral-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group ${
          isLocked ? 'opacity-75' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      <div className="h-48 bg-gradient-to-br from-neutral-900 to-neutral-800 relative overflow-hidden">
        <ErrorBoundary fallbackType="visualization">
          <Suspense fallback={<div className="w-full h-full bg-neutral-900" />}>
            <Visualization isActive={isHovered && !isLocked} />
          </Suspense>
        </ErrorBoundary>
        
        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3">
          {getStatusBadge()}
        </div>
        
        {/* Progress Bar Overlay */}
        {!loading && mounted && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-900/50 backdrop-blur-sm">
            <div 
              className={`h-full ${colorClasses.progressBg} transition-all duration-500`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">
            Chapter {index + 1}
          </h3>
          <span className="text-sm text-neutral-400">
            {chapter.duration}
          </span>
        </div>
        
        <h4 className={`text-xl font-bold mb-3 ${colorClasses.text}`}>
          {chapter.title}
        </h4>
        
        <p className="text-sm text-neutral-300 leading-relaxed">
          {chapter.description}
        </p>
        
        {/* Progress Section */}
        {!loading && mounted && (
          <div className="mt-3 pt-3 border-t border-neutral-700/50">
            {/* Progress Info Text - conditional */}
            {(progressPercentage > 0 || isInProgress || isCompleted || chapterProgress.completedSections?.length > 0) && (
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-neutral-400">
                  {isCompleted ? 'Completed' : `${progressPercentage}% Complete`}
                </span>
                {chapterProgress.lastVisited && (
                  <span className="text-neutral-500">
                    {formatLastVisited()}
                  </span>
                )}
              </div>
            )}
            
            {/* Detailed Progress Bar - always visible */}
            <div>
              <div className={`h-1.5 ${colorClasses.progressTrack} rounded-full overflow-hidden`}>
                <div 
                  className={`h-full ${colorClasses.progressBg} rounded-full transition-all duration-500`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              {chapterProgress.completedSections && chapterProgress.completedSections.length > 0 && (
                <p className="text-xs text-neutral-500 mt-1">
                  {chapterProgress.completedSections.length} sections completed
                </p>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-neutral-700">
          <Button 
            variant="primary" 
            size="sm" 
            className={`w-full ${
              isLocked 
                ? 'bg-neutral-600 hover:bg-neutral-600 cursor-not-allowed' 
                : `${colorClasses.bg} ${colorClasses.bgHover}`
            } group`}
            onClick={(e) => {
              e.preventDefault(); // Prevent Link navigation
              e.stopPropagation(); // Stop event bubbling
              if (!isLocked) {
                // Begin tracking and then navigate to the chapter
                handleBeginLearning(e);
              }
            }}
            disabled={isLocked}
          >
            {getButtonText()}
            {!isLocked && (
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            )}
            {isLocked && (
              <Lock className="ml-2 h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
    </Link>
  );
});

ChapterCard.displayName = 'ChapterCard';

export default ChapterCard;
