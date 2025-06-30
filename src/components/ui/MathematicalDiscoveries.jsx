import React, { useMemo, useRef } from 'react';
import { cn } from '../../lib/design-system';
import { CheckCircle2, Circle, Lightbulb, TrendingUp, Brain, Sparkles } from 'lucide-react';
import { useMathJax, inlineMath } from '../../utils/latex';

/**
 * Reusable component for displaying mathematical discoveries and insights
 * Used across all probability and statistics components to track learning progress
 * 
 * @param {Object} props
 * @param {Array} props.discoveries - Array of discovery objects with structure:
 *   {
 *     id: string,
 *     title: string,
 *     description: string,
 *     formula?: string (optional LaTeX formula),
 *     discovered: boolean,
 *     category?: 'concept' | 'pattern' | 'formula' | 'relationship'
 *   }
 * @param {string} [props.title="Mathematical Discoveries"] - Section title
 * @param {string} [props.className] - Additional CSS classes
 */
// Memoized component to prevent LaTeX from re-rendering unnecessarily
export const MathematicalDiscoveries = React.memo(function MathematicalDiscoveries({ 
  discoveries = [], 
  title = "Mathematical Discoveries",
  className 
}) {
  const containerRef = useRef(null);
  const discoveredCount = discoveries.filter(d => d.discovered).length;
  const totalCount = discoveries.length;
  
  // Use MathJax to process LaTeX formulas
  useMathJax(containerRef, [discoveries]);
  
  // Group discoveries by category if specified
  const groupedDiscoveries = useMemo(() => {
    return discoveries.reduce((acc, discovery) => {
      const category = discovery.category || 'uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(discovery);
      return acc;
    }, {});
  }, [discoveries]);
  
  // Category icons and labels
  const categoryConfig = {
    concept: { icon: Brain, label: 'Core Concepts', color: 'text-blue-400' },
    pattern: { icon: TrendingUp, label: 'Patterns', color: 'text-green-400' },
    formula: { icon: Lightbulb, label: 'Formulas', color: 'text-yellow-400' },
    relationship: { icon: Sparkles, label: 'Relationships', color: 'text-purple-400' },
    uncategorized: { icon: Circle, label: 'Discoveries', color: 'text-neutral-400' }
  };
  
  return (
    <div ref={containerRef} className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-purple-400">{title}</h4>
        {totalCount > 0 && (
          <span className="text-xs text-neutral-400">
            {discoveredCount}/{totalCount} discovered
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        {totalCount === 0 ? (
          <p className="text-xs text-neutral-400 italic">
            Interact with the visualization to make discoveries...
          </p>
        ) : Object.entries(groupedDiscoveries).map(([category, items]) => {
          const config = categoryConfig[category] || { icon: Sparkles, label: category, color: 'text-gray-400' };
          const Icon = config.icon;
          const hasDiscoveries = items.some(item => item.discovered);
          
          return (
            <div key={category} className="space-y-2">
              {Object.keys(groupedDiscoveries).length > 1 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Icon className={cn("w-3 h-3", config.color)} />
                  <span className={cn("font-medium", config.color)}>
                    {config.label}
                  </span>
                </div>
              )}
              
              <div className="space-y-2">
                {items.map((discovery) => (
                  <div
                    key={discovery.id}
                    className={cn(
                      "p-2 rounded transition-all duration-300",
                      discovery.discovered
                        ? "bg-purple-900/20 border border-purple-600/30"
                        : "bg-neutral-800/50 border border-neutral-700/50 opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {discovery.discovered ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                      )}
                      
                      <div className="flex-1 space-y-1">
                        <p className={cn(
                          "text-sm font-medium",
                          discovery.discovered ? "text-white" : "text-neutral-400"
                        )}>
                          {discovery.title}
                        </p>
                        
                        {discovery.discovered && (
                          <>
                            <p className="text-xs text-neutral-300">
                              {discovery.description}
                            </p>
                            
                            {discovery.formula && (
                              <div 
                                className="text-xs font-mono text-yellow-400 mt-1"
                                dangerouslySetInnerHTML={{ 
                                  __html: inlineMath(discovery.formula) 
                                }}
                              />
                            )}
                          </>
                        )}
                        
                        {!discovery.discovered && (
                          <p className="text-xs text-neutral-500 italic">
                            Not yet discovered...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {discoveredCount === totalCount && totalCount > 0 && (
        <div className="text-xs text-green-400 text-center font-medium p-2 bg-green-900/20 border border-green-600/30 rounded">
          ✨ All discoveries made! Well done exploring the mathematics.
        </div>
      )}
    </div>
  );
});

/**
 * Helper hook for managing discovery state
 * 
 * @param {Array} initialDiscoveries - Initial discovery definitions
 * @returns {Object} - { discoveries, markDiscovered, resetDiscoveries }
 */
export function useDiscoveries(initialDiscoveries) {
  const [discoveries, setDiscoveries] = React.useState(
    initialDiscoveries.map(d => ({ ...d, discovered: false }))
  );
  
  const markDiscovered = React.useCallback((id) => {
    setDiscoveries(prev => 
      prev.map(d => 
        d.id === id ? { ...d, discovered: true } : d
      )
    );
  }, []);
  
  const resetDiscoveries = React.useCallback(() => {
    setDiscoveries(
      initialDiscoveries.map(d => ({ ...d, discovered: false }))
    );
  }, [initialDiscoveries]);
  
  return { discoveries, markDiscovered, resetDiscoveries };
}

export default MathematicalDiscoveries;