"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Pause, Play, AlertTriangle } from 'lucide-react';

export function QuizTimer({ 
  timeLimit = 30, // minutes
  onTimeUp,
  isPaused = false,
  onPauseToggle,
  showWarning = true,
  warningTime = 5 // minutes
}) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // Convert to seconds
  const [isWarning, setIsWarning] = useState(false);
  
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        
        const newTime = prev - 1;
        
        // Check for warning threshold
        if (showWarning && newTime === warningTime * 60) {
          setIsWarning(true);
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPaused, onTimeUp, showWarning, warningTime]);
  
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