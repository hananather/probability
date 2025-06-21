"use client";
import React from 'react';
import { cn } from '../../../lib/design-system';

const MontyDoor = ({ 
  doorNumber,
  state = 'closed', // closed, selected, revealed, disabled
  prize = 'goat', // car, goat
  onClick,
  size = 'large', // large, medium, small
  showNumber = true,
  animationDelay = 0
}) => {
  const sizeClasses = {
    large: 'w-48 h-64',
    medium: 'w-32 h-44',
    small: 'w-20 h-28'
  };

  const doorColors = {
    closed: 'bg-gradient-to-b from-amber-700 to-amber-900',
    selected: 'bg-gradient-to-b from-blue-600 to-blue-800',
    revealed: prize === 'car' 
      ? 'bg-gradient-to-b from-yellow-500 to-yellow-600' 
      : 'bg-gradient-to-b from-neutral-600 to-neutral-700',
    disabled: 'bg-gradient-to-b from-neutral-700 to-neutral-800'
  };

  const isRevealed = state === 'revealed';
  const isClickable = state === 'closed' || state === 'selected';

  return (
    <div 
      className={cn(
        "relative transition-all duration-300 rounded-lg shadow-xl",
        sizeClasses[size],
        isClickable && "cursor-pointer hover:scale-105",
        "transform-gpu"
      )}
      style={{ transitionDelay: `${animationDelay}ms` }}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Door Frame */}
      <div className={cn(
        "absolute inset-0 rounded-lg border-4",
        state === 'selected' ? 'border-blue-400 shadow-blue-400/50 shadow-lg' : 'border-amber-800',
        "transition-all duration-300"
      )}>
        {/* Door Panel */}
        <div className={cn(
          "absolute inset-1 rounded",
          doorColors[state],
          "transition-all duration-500",
          isRevealed && "opacity-20"
        )}>
          {/* Door Handle */}
          {!isRevealed && (
            <div className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 w-2 h-6 rounded-full",
              state === 'selected' ? 'bg-blue-300' : 'bg-amber-600',
              "shadow-inner transition-colors duration-300"
            )} />
          )}
        </div>

        {/* Prize Reveal */}
        {isRevealed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={cn(
              "text-6xl mb-2 animate-bounce",
              size === 'medium' && "text-4xl",
              size === 'small' && "text-2xl"
            )}>
              {prize === 'car' ? '🚗' : '🐐'}
            </div>
            <p className={cn(
              "text-sm font-semibold",
              prize === 'car' ? 'text-yellow-400' : 'text-neutral-400',
              size === 'small' && "text-xs"
            )}>
              {prize === 'car' ? 'CAR!' : 'Goat'}
            </p>
          </div>
        )}

        {/* Door Number */}
        {showNumber && !isRevealed && (
          <div className={cn(
            "absolute inset-0 flex items-center justify-center",
            "text-6xl font-bold",
            state === 'selected' ? 'text-blue-200' : 'text-amber-300',
            size === 'medium' && "text-4xl",
            size === 'small' && "text-2xl",
            "transition-colors duration-300"
          )}>
            {doorNumber}
          </div>
        )}

        {/* Selection Indicator */}
        {state === 'selected' && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="text-blue-400 text-2xl">▼</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MontyDoor;