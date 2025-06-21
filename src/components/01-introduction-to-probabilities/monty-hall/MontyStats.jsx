"use client";
import React from 'react';
import { cn } from '../../../lib/design-system';

const MontyStats = ({ 
  gamesPlayed = 0,
  switchWins = 0,
  stayWins = 0,
  currentStreak = 0,
  showPercentages = true,
  variant = 'compact' // compact, detailed
}) => {
  const switchRate = gamesPlayed > 0 ? (switchWins / gamesPlayed * 100).toFixed(1) : 0;
  const stayRate = gamesPlayed > 0 ? (stayWins / gamesPlayed * 100).toFixed(1) : 0;

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-800 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-neutral-400 mb-1">Switch Wins</p>
          <p className="text-2xl font-bold text-green-400">
            {showPercentages ? `${switchRate}%` : switchWins}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-neutral-400 mb-1">Stay Wins</p>
          <p className="text-2xl font-bold text-red-400">
            {showPercentages ? `${stayRate}%` : stayWins}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-neutral-800 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-sm text-neutral-400">Games Played</span>
        <span className="font-mono text-lg text-white">{gamesPlayed}</span>
      </div>
      
      <div className="space-y-3">
        {/* Switch Strategy */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-neutral-300">Switch Strategy</span>
            <span className="text-sm font-bold text-green-400">{switchRate}%</span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${switchRate}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-1">{switchWins} wins</p>
        </div>

        {/* Stay Strategy */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-neutral-300">Stay Strategy</span>
            <span className="text-sm font-bold text-red-400">{stayRate}%</span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div 
              className="bg-red-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stayRate}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-1">{stayWins} wins</p>
        </div>
      </div>

      {/* Theoretical Values */}
      <div className="pt-3 border-t border-neutral-700">
        <p className="text-xs text-neutral-500 mb-2">Theoretical Probabilities</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-neutral-400">Switch: </span>
            <span className="text-green-400 font-mono">66.7%</span>
          </div>
          <div>
            <span className="text-neutral-400">Stay: </span>
            <span className="text-red-400 font-mono">33.3%</span>
          </div>
        </div>
      </div>

      {/* Current Streak */}
      {currentStreak > 2 && (
        <div className="pt-3 border-t border-neutral-700 text-center">
          <p className="text-xs text-neutral-500">Current Streak</p>
          <p className="text-xl font-bold text-yellow-400">{currentStreak} 🔥</p>
        </div>
      )}
    </div>
  );
};

export default MontyStats;