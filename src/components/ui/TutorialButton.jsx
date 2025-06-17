"use client";
import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/design-system';

/**
 * Standardized tutorial button component
 * Consistent appearance and behavior across all visualizations
 */
export function TutorialButton({ 
  onClick,
  className = '',
  position = 'top-right', // 'top-right', 'top-left', 'inline'
  variant = 'tutorial'
}) {
  const positionClasses = {
    'top-right': 'absolute top-4 right-4 z-10',
    'top-left': 'absolute top-4 left-4 z-10',
    'inline': ''
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      className={cn(
        positionClasses[position],
        'shadow-lg',
        className
      )}
      title="View tutorial for this component"
    >
      <svg 
        className="w-4 h-4 mr-1.5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
        />
      </svg>
      Tutorial
    </Button>
  );
}