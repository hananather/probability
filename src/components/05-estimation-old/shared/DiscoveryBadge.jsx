import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/design-system';
import { Sparkles, Trophy, Star, Zap, Award } from 'lucide-react';

/**
 * DiscoveryBadge - Component for tracking and celebrating mathematical discoveries
 * Shows animated celebration when discoveries are unlocked
 * 
 * @param {Object} props
 * @param {Array} props.discoveries - Array of discovery objects:
 *   {
 *     id: string,
 *     title: string,
 *     description: string,
 *     icon?: React.Component,
 *     unlocked: boolean,
 *     timestamp?: Date
 *   }
 * @param {string} [props.variant="compact"] - Display variant: "compact" | "expanded" | "minimal"
 * @param {function} [props.onDiscoveryClick] - Callback when a discovery is clicked
 * @param {string} [props.className] - Additional CSS classes
 */
export function DiscoveryBadge({
  discoveries = [],
  variant = "compact",
  onDiscoveryClick,
  className
}) {
  const [recentlyUnlocked, setRecentlyUnlocked] = useState(new Set());
  const [celebratingId, setCelebratingId] = useState(null);
  
  // Track newly unlocked discoveries
  useEffect(() => {
    const newlyUnlocked = discoveries
      .filter(d => d.unlocked && !recentlyUnlocked.has(d.id))
      .map(d => d.id);
    
    if (newlyUnlocked.length > 0) {
      setRecentlyUnlocked(prev => new Set([...prev, ...newlyUnlocked]));
      // Trigger celebration for the most recent
      setCelebratingId(newlyUnlocked[newlyUnlocked.length - 1]);
      
      // Clear celebration after animation
      setTimeout(() => {
        setCelebratingId(null);
      }, 3000);
    }
  }, [discoveries, recentlyUnlocked]);
  
  const unlockedCount = discoveries.filter(d => d.unlocked).length;
  const totalCount = discoveries.length;
  const percentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
  
  // Default icons based on achievement level
  const getDefaultIcon = (index) => {
    const icons = [Star, Zap, Award, Trophy, Sparkles];
    return icons[index % icons.length];
  };
  
  if (variant === "minimal") {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <div className="relative">
          <Trophy className="w-5 h-5 text-yellow-500" />
          {unlockedCount > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-[8px] text-black font-bold">{unlockedCount}</span>
            </div>
          )}
        </div>
        <span className="text-sm text-neutral-400">
          {unlockedCount}/{totalCount}
        </span>
      </div>
    );
  }
  
  if (variant === "compact") {
    return (
      <div className={cn("bg-neutral-800/50 rounded-lg p-3 border border-neutral-700", className)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-white">Discoveries</span>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            {unlockedCount}/{totalCount}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-neutral-700 rounded-full h-1.5 mb-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Discovery Icons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {discoveries.map((discovery, index) => {
            const Icon = discovery.icon || getDefaultIcon(index);
            const isUnlocked = discovery.unlocked;
            const isCelebrating = celebratingId === discovery.id;
            
            return (
              <button
                key={discovery.id}
                onClick={() => onDiscoveryClick?.(discovery)}
                disabled={!isUnlocked}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                  isUnlocked 
                    ? "bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50" 
                    : "bg-neutral-700/50 border border-neutral-600 opacity-50 cursor-not-allowed",
                  isCelebrating && "animate-bounce scale-125 shadow-lg shadow-yellow-500/50"
                )}
                title={discovery.title}
              >
                <Icon className={cn(
                  "w-4 h-4",
                  isUnlocked ? "text-yellow-500" : "text-neutral-500"
                )} />
              </button>
            );
          })}
        </div>
        
        {/* Celebration Message */}
        {celebratingId && (
          <div className="mt-3 text-xs text-center text-yellow-400 animate-pulse">
            New discovery unlocked!
          </div>
        )}
      </div>
    );
  }
  
  // Expanded variant
  return (
    <div className={cn("bg-neutral-800/50 rounded-lg p-4 border border-neutral-700 space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Mathematical Discoveries
        </h3>
        <div className="text-sm">
          <span className="text-neutral-400">Progress: </span>
          <span className="text-yellow-400 font-mono">{percentage.toFixed(0)}%</span>
        </div>
      </div>
      
      {/* Discovery List */}
      <div className="space-y-2">
        {discoveries.map((discovery, index) => {
          const Icon = discovery.icon || getDefaultIcon(index);
          const isUnlocked = discovery.unlocked;
          const isCelebrating = celebratingId === discovery.id;
          
          return (
            <div
              key={discovery.id}
              className={cn(
                "relative p-3 rounded-lg border transition-all duration-300 cursor-pointer",
                isUnlocked
                  ? "bg-neutral-800/70 border-yellow-500/30 hover:border-yellow-500/50"
                  : "bg-neutral-800/30 border-neutral-700 opacity-60",
                isCelebrating && "animate-pulse shadow-lg shadow-yellow-500/30"
              )}
              onClick={() => isUnlocked && onDiscoveryClick?.(discovery)}
            >
              {/* Celebration Particles */}
              {isCelebrating && (
                <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-float-up"
                      style={{
                        left: `${20 + i * 15}%`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  isUnlocked
                    ? "bg-yellow-500/20 text-yellow-500"
                    : "bg-neutral-700 text-neutral-500"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <h4 className={cn(
                    "text-sm font-medium mb-1",
                    isUnlocked ? "text-white" : "text-neutral-400"
                  )}>
                    {discovery.title}
                  </h4>
                  <p className={cn(
                    "text-xs",
                    isUnlocked ? "text-neutral-300" : "text-neutral-500"
                  )}>
                    {isUnlocked ? discovery.description : "Keep exploring to unlock..."}
                  </p>
                  {isUnlocked && discovery.timestamp && (
                    <p className="text-xs text-neutral-500 mt-1">
                      Discovered {new Date(discovery.timestamp).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Completion Message */}
      {unlockedCount === totalCount && totalCount > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
          <p className="text-sm text-yellow-400 font-medium">
            🎉 All discoveries unlocked! You've mastered this concept.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Hook for managing discovery state
 */
export function useDiscoveryTracking(initialDiscoveries) {
  const [discoveries, setDiscoveries] = useState(
    initialDiscoveries.map(d => ({ 
      ...d, 
      unlocked: false,
      timestamp: null 
    }))
  );
  
  const unlockDiscovery = (id) => {
    setDiscoveries(prev => 
      prev.map(d => 
        d.id === id 
          ? { ...d, unlocked: true, timestamp: new Date() }
          : d
      )
    );
  };
  
  const resetDiscoveries = () => {
    setDiscoveries(
      initialDiscoveries.map(d => ({ 
        ...d, 
        unlocked: false,
        timestamp: null 
      }))
    );
  };
  
  const isDiscoveryUnlocked = (id) => {
    return discoveries.find(d => d.id === id)?.unlocked || false;
  };
  
  return {
    discoveries,
    unlockDiscovery,
    resetDiscoveries,
    isDiscoveryUnlocked
  };
}

// Add CSS for floating animation
const floatUpAnimation = `
  @keyframes float-up {
    0% {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translateY(-40px) scale(0);
      opacity: 0;
    }
  }
  
  .animate-float-up {
    animation: float-up 1s ease-out forwards;
  }
`;

// Inject animation styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = floatUpAnimation;
  document.head.appendChild(styleElement);
}

export default DiscoveryBadge;