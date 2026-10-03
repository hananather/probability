"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, Pause, Play, AlertTriangle } from 'lucide-react';

export function QuizTimer({ 
  timeLimit = 30, // minutes
  onTimeUp,
  isPaused = false,
  onPauseToggle,
  showWarning = true,
  warningTime = 5, // minutes
  deadline,
  pausedRemaining,
  hidden = false
}) {
  const defaultDeadline = useRef(Date.now() + timeLimit * 60 * 1000);
  const defaultPausedAt = useRef(null);
  const effectiveDeadline = deadline ?? defaultDeadline.current;
  const getRemaining = () => Math.max(0, Math.ceil((effectiveDeadline - Date.now()) / 1000));
  const [timeRemaining, setTimeRemaining] = useState(getRemaining);
  const expiryHandled = useRef(false);
  const onTimeUpRef = useRef(onTimeUp);
  const isWarning = showWarning && timeRemaining <= warningTime * 60;

  useEffect(() => { onTimeUpRef.current = onTimeUp; }, [onTimeUp]);
  
  useEffect(() => {
    if (isPaused) {
      if (deadline == null && defaultPausedAt.current === null) defaultPausedAt.current = Date.now();
      if (typeof pausedRemaining === 'number') setTimeRemaining(Math.max(0, pausedRemaining));
      return;
    }
    let runningDeadline = effectiveDeadline;
    if (deadline == null && defaultPausedAt.current !== null) {
      defaultDeadline.current += Date.now() - defaultPausedAt.current;
      runningDeadline = defaultDeadline.current;
      defaultPausedAt.current = null;
    }
    const updateRemaining = () => setTimeRemaining(Math.max(0, Math.ceil((runningDeadline - Date.now()) / 1000)));
    updateRemaining();
    const timer = setInterval(updateRemaining, 1000);
    return () => clearInterval(timer);
  }, [effectiveDeadline, deadline, isPaused, pausedRemaining]);

  useEffect(() => {
    if (timeRemaining === 0 && !isPaused && !expiryHandled.current) {
      expiryHandled.current = true;
      onTimeUpRef.current?.();
    }
  }, [timeRemaining, isPaused]);
  
  // Format time for display
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  // Calculate progress percentage
  const progressPercentage = ((timeLimit * 60 - timeRemaining) / (timeLimit * 60)) * 100;
  
  // Determine color based on time remaining
  const getTimerColor = () => {
    if (timeRemaining <= 60) return 'text-red-500';
    if (timeRemaining <= warningTime * 60) return 'text-orange-500';
    return 'text-neutral-400';
  };

  if (hidden) return null;
  
  return (
    <div className="flex items-center gap-4 bg-neutral-900 rounded-lg px-4 py-3 border border-neutral-700">
      {/* Timer Display */}
      <div className="flex items-center gap-2">
        {isWarning ? (
          <AlertTriangle className="w-5 h-5 text-orange-500 animate-pulse" />
        ) : (
          <Clock className={`w-5 h-5 ${getTimerColor()}`} />
        )}
        <span className={`text-lg font-mono font-semibold ${getTimerColor()}`}>
          {formatTime(timeRemaining)}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="flex-1 max-w-[200px]">
        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${
              timeRemaining <= 60 ? 'bg-red-500' : 
              timeRemaining <= warningTime * 60 ? 'bg-orange-500' : 
              'bg-teal-500'
            }`}
            style={{ width: `${100 - progressPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Pause/Play Button */}
      {onPauseToggle && (
        <button
          onClick={onPauseToggle}
          className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
          title={isPaused ? "Resume" : "Pause"}
          aria-label={isPaused ? 'Resume quiz timer' : 'Pause quiz timer'}
          aria-pressed={isPaused}
        >
          {isPaused ? (
            <Play className="w-4 h-4 text-neutral-400" />
          ) : (
            <Pause className="w-4 h-4 text-neutral-400" />
          )}
        </button>
      )}
      
      {/* Warning Message */}
      {isWarning && timeRemaining > 60 && (
        <span className="text-xs text-orange-500 animate-pulse">
          {Math.ceil(timeRemaining / 60)} min remaining
        </span>
      )}
      
      {/* Critical Warning */}
      {timeRemaining <= 60 && timeRemaining > 0 && (
        <span className="text-xs text-red-500 font-semibold animate-pulse">
          Last minute!
        </span>
      )}
    </div>
  );
}
