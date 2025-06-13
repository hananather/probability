import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable ProgressBar component based on the gold standard from ContinuousExpectationVariance
 * 
 * @param {Object} props
 * @param {number} props.current - Current step/value
 * @param {number} props.total - Total steps/value
 * @param {string} [props.label="Learning Progress"] - Label text
 * @param {string} [props.variant="emerald"] - Color variant: "emerald", "purple", "teal", "blue"
 * @param {string} [props.className] - Additional classes for the container
 * @param {boolean} [props.showCounter=true] - Whether to show the counter (e.g., "1/4")
 * @param {boolean} [props.animated=true] - Whether to animate the progress bar
 */
export function ProgressBar({ 
  current, 
  total, 
  label = "Learning Progress",
  variant = "emerald",
  className,
  showCounter = true,
  animated = true
}) {
  const percentage = (current / total) * 100;
  
  // Define color gradients for different variants
  const variants = {
    emerald: "from-emerald-500 to-emerald-400",
    purple: "from-purple-500 to-purple-400",
    teal: "from-teal-500 to-teal-400",
    blue: "from-blue-500 to-blue-400",
    orange: "from-orange-500 to-orange-400",
    pink: "from-pink-500 to-pink-400"
  };
  
  // Ensure valid variant
  const gradientClass = variants[variant] || variants.emerald;
  
  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        {showCounter && (
          <span className="text-sm font-mono text-gray-300">
            {current}/{total}
          </span>
        )}
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div 
          className={cn(
            "bg-gradient-to-r h-2 rounded-full",
            gradientClass,
            animated && "transition-all duration-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Navigation buttons that work with ProgressBar
 * Styled to match the progress bar color
 * 
 * @param {Object} props
 * @param {number} props.current - Current step
 * @param {number} props.total - Total steps
 * @param {function} props.onPrevious - Previous button click handler
 * @param {function} props.onNext - Next button click handler
 * @param {string} [props.variant="emerald"] - Color variant to match ProgressBar
 * @param {string} [props.nextLabel="Next"] - Label for next button
 * @param {string} [props.previousLabel="Previous"] - Label for previous button
 * @param {string} [props.completeLabel="Complete!"] - Label when at final step
 */
export function ProgressNavigation({
  current,
  total,
  onPrevious,
  onNext,
  variant = "emerald",
  nextLabel = "Next",
  previousLabel = "Previous",
  completeLabel = "Complete!"
}) {
  const isFirst = current === 1;
  const isLast = current === total;
  
  // Define button colors for different variants
  const buttonColors = {
    emerald: "bg-emerald-600 hover:bg-emerald-500",
    purple: "bg-purple-600 hover:bg-purple-500",
    teal: "bg-teal-600 hover:bg-teal-500",
    blue: "bg-blue-600 hover:bg-blue-500",
    orange: "bg-orange-600 hover:bg-orange-500",
    pink: "bg-pink-600 hover:bg-pink-500"
  };
  
  const activeColor = buttonColors[variant] || buttonColors.emerald;
  
  return (
    <div className="flex gap-2">
      <button
        onClick={onPrevious}
        disabled={isFirst}
        className={cn(
          "flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors",
          isFirst 
            ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
            : "bg-neutral-700 hover:bg-neutral-600 text-white"
        )}
      >
        {previousLabel}
      </button>
      <button
        onClick={onNext}
        disabled={isLast}
        className={cn(
          "flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors",
          isLast 
            ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
            : `${activeColor} text-white`
        )}
      >
        {isLast ? completeLabel : nextLabel}
      </button>
    </div>
  );
}

/**
 * Combined ProgressBar with Navigation
 * Use this when you want the progress bar and navigation buttons together
 */
export function ProgressBarWithNavigation({
  current,
  total,
  onPrevious,
  onNext,
  label = "Learning Progress",
  variant = "emerald",
  ...props
}) {
  return (
    <div className="space-y-3">
      <ProgressBar 
        current={current}
        total={total}
        label={label}
        variant={variant}
      />
      <ProgressNavigation
        current={current}
        total={total}
        onPrevious={onPrevious}
        onNext={onNext}
        variant={variant}
        {...props}
      />
    </div>
  );
}

// Export default as ProgressBar for convenience
export default ProgressBar;