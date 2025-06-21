"use client";
import React from 'react';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/design-system';

const MontyControls = ({
  onReset,
  onAutoPlay,
  onSpeedChange,
  isAutoPlaying = false,
  speed = 500,
  showSpeedControl = true,
  disabled = false
}) => {
  return (
    <div className="flex flex-col gap-3 p-4 bg-neutral-800 rounded-lg">
      <div className="flex gap-2">
        <Button
          onClick={onAutoPlay}
          variant={isAutoPlaying ? "danger" : "success"}
          size="sm"
          disabled={disabled}
          className="flex-1"
        >
          {isAutoPlaying ? "Stop" : "Auto Play"}
        </Button>
        <Button
          onClick={onReset}
          variant="neutral"
          size="sm"
          disabled={disabled || isAutoPlaying}
        >
          Reset
        </Button>
      </div>

      {showSpeedControl && (
        <div className="space-y-2">
          <label className="text-xs text-neutral-400 flex justify-between">
            <span>Animation Speed</span>
            <span className="font-mono">{speed}ms</span>
          </label>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            disabled={disabled}
            className={cn(
              "w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer",
              "accent-teal-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          <div className="flex justify-between text-xs text-neutral-500">
            <span>Fast</span>
            <span>Slow</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MontyControls;