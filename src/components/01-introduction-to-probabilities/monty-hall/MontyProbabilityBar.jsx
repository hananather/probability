"use client";
import React from 'react';
import { cn } from '../../../lib/design-system';

const MontyProbabilityBar = ({
  switchProb = 0.667,
  stayProb = 0.333,
  animated = true,
  showLabels = true,
  height = 'h-12'
}) => {
  const switchPercent = (switchProb * 100).toFixed(1);
  const stayPercent = (stayProb * 100).toFixed(1);

  return (
    <div className="space-y-2">
      {showLabels && (
        <div className="flex justify-between text-sm">
          <span className="text-green-400 font-medium">Switch: {switchPercent}%</span>
          <span className="text-red-400 font-medium">Stay: {stayPercent}%</span>
        </div>
      )}
      
      <div className={cn("relative w-full bg-neutral-800 rounded-full overflow-hidden", height)}>
        {/* Switch probability */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400",
            animated && "transition-all duration-500 ease-out"
          )}
          style={{ width: `${switchPercent}%` }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm drop-shadow-lg">
              {switchPercent}%
            </span>
          </div>
        </div>
        
        {/* Stay probability */}
        <div
          className={cn(
            "absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-400",
            animated && "transition-all duration-500 ease-out"
          )}
          style={{ width: `${stayPercent}%` }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm drop-shadow-lg">
              {stayPercent}%
            </span>
          </div>
        </div>
        
        {/* Center divider */}
        <div className="absolute left-1/2 top-0 w-1 h-full bg-neutral-900 -translate-x-1/2" />
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full" />
          <span>Switch wins</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-full" />
          <span>Stay wins</span>
        </div>
      </div>
    </div>
  );
};

export default MontyProbabilityBar;