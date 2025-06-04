import React from 'react';
import { cn } from '../../lib/design-system';

export function ProgressTracker({ 
  current, 
  goal, 
  label = "Progress",
  showMilestones = true,
  color = "purple" 
}) {
  const percentage = Math.min((current / goal) * 100, 100);
  const milestones = [25, 50, 75, 100];
  
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-neutral-300 mb-1">
        <span>{label}</span>
        <span>{current} / {goal}</span>
      </div>
      
      <div className="relative w-full bg-neutral-700 rounded-full h-3">
        <div
          className={cn(
            `h-3 rounded-full transition-all duration-500`,
            color === "purple" ? "bg-purple-600" : "bg-green-600"
          )}
          style={{ width: `${percentage}%` }}
        />
        
        {showMilestones && milestones.map(milestone => (
          <div
            key={milestone}
            className={cn(
              "absolute top-0 h-3 w-0.5",
              percentage >= milestone ? "bg-neutral-800" : "bg-neutral-600"
            )}
            style={{ left: `${milestone}%` }}
          />
        ))}
      </div>
      
      {showMilestones && percentage < 100 && (
        <div className="text-xs text-neutral-400 mt-1">
          {percentage < 25 && "🎯 Keep going! First milestone at 25%"}
          {percentage >= 25 && percentage < 50 && "📊 Great progress! Halfway at 50%"}
          {percentage >= 50 && percentage < 75 && "🎓 Over halfway! Push to 75%"}
          {percentage >= 75 && percentage < 100 && "✨ Almost there! Final push to 100%"}
        </div>
      )}
      
      {percentage === 100 && (
        <div className="text-xs text-green-400 mt-1 font-semibold">
          🎉 Goal achieved! Well done!
        </div>
      )}
    </div>
  );
}