import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/design-system';
import { useMathJax } from '@/utils/latex';

/**
 * FormulaHighlighter - Interactive formula component that highlights parts as user interacts
 * Shows current values below each component of the formula
 * 
 * @param {Object} props
 * @param {string} props.formula - LaTeX formula string
 * @param {Array} props.highlights - Array of highlight configurations:
 *   {
 *     id: string,
 *     pattern: string, // Part of formula to highlight
 *     color: string, // Highlight color
 *     label: string, // Label for this part
 *     value: number | string, // Current value
 *     description?: string // Optional description
 *   }
 * @param {Object} props.values - Current values for formula variables
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.interactive=true] - Whether highlighting is interactive
 */
export function FormulaHighlighter({
  formula,
  highlights = [],
  values = {},
  className,
  interactive = true
}) {
  const containerRef = useRef(null);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [hoveredHighlight, setHoveredHighlight] = useState(null);
  
  // Process MathJax
  useMathJax(containerRef, [formula, highlights]);
  
  // Build the highlighted formula
  const buildHighlightedFormula = () => {
    let highlightedFormula = formula;
    
    // Sort highlights by pattern length (longest first) to avoid partial replacements
    const sortedHighlights = [...highlights].sort((a, b) => 
      b.pattern.length - a.pattern.length
    );
    
    // Apply highlights
    sortedHighlights.forEach((highlight) => {
      const { id, pattern, color } = highlight;
      const isActive = activeHighlight === id || hoveredHighlight === id;
      
      // Create a span with appropriate styling
      const replacement = `\\htmlClass{formula-highlight-${id}}{\\color{${isActive ? color : 'inherit'}}{${pattern}}}`;
      
      // Replace all occurrences
      highlightedFormula = highlightedFormula.replace(
        new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        replacement
      );
    });
    
    return highlightedFormula;
  };
  
  // Set up event listeners after MathJax renders
  useEffect(() => {
    if (!containerRef.current || !interactive) return;
    
    const setupHighlightListeners = () => {
      highlights.forEach(({ id }) => {
        const elements = containerRef.current.querySelectorAll(`.formula-highlight-${id}`);
        
        elements.forEach(element => {
          element.style.cursor = 'pointer';
          element.style.transition = 'all 0.2s ease';
          
          element.addEventListener('mouseenter', () => {
            setHoveredHighlight(id);
            element.style.transform = 'scale(1.1)';
          });
          
          element.addEventListener('mouseleave', () => {
            setHoveredHighlight(null);
            element.style.transform = 'scale(1)';
          });
          
          element.addEventListener('click', () => {
            setActiveHighlight(prev => prev === id ? null : id);
          });
        });
      });
    };
    
    // Wait for MathJax to render
    const timer = setTimeout(setupHighlightListeners, 100);
    
    return () => {
      clearTimeout(timer);
      // Clean up event listeners
      highlights.forEach(({ id }) => {
        const elements = containerRef.current?.querySelectorAll(`.formula-highlight-${id}`);
        elements?.forEach(element => {
          element.replaceWith(element.cloneNode(true));
        });
      });
    };
  }, [highlights, interactive]);
  
  const currentHighlight = highlights.find(h => h.id === (activeHighlight || hoveredHighlight));
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Formula Display */}
      <div 
        ref={containerRef}
        className="bg-neutral-800/50 rounded-lg p-6 border border-neutral-700"
      >
        <div 
          className="text-xl text-center text-white"
          dangerouslySetInnerHTML={{ 
            __html: `\\[${buildHighlightedFormula()}\\]` 
          }}
        />
      </div>
      
      {/* Value Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {highlights.map((highlight) => {
          const isActive = activeHighlight === highlight.id;
          const isHovered = hoveredHighlight === highlight.id;
          
          return (
            <div
              key={highlight.id}
              className={cn(
                "bg-neutral-800/30 rounded-lg p-3 border transition-all duration-200 cursor-pointer",
                isActive && "border-teal-500 bg-neutral-800/60 shadow-lg shadow-teal-500/20",
                isHovered && !isActive && "border-neutral-600 bg-neutral-800/50",
                !isActive && !isHovered && "border-neutral-700"
              )}
              onClick={() => setActiveHighlight(prev => prev === highlight.id ? null : highlight.id)}
              onMouseEnter={() => setHoveredHighlight(highlight.id)}
              onMouseLeave={() => setHoveredHighlight(null)}
            >
              <div className="flex items-start justify-between mb-1">
                <span 
                  className={cn(
                    "text-xs font-medium",
                    isActive || isHovered ? highlight.color : "text-neutral-400"
                  )}
                  style={{ color: isActive || isHovered ? highlight.color : undefined }}
                >
                  {highlight.label}
                </span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: highlight.color }}
                />
              </div>
              <div className="font-mono text-lg text-white">
                {highlight.value}
              </div>
              {highlight.description && (
                <p className="text-xs text-neutral-400 mt-1">
                  {highlight.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Active Highlight Details */}
      {currentHighlight && interactive && (
        <div 
          className="bg-neutral-800/50 rounded-lg p-4 border transition-all duration-300"
          style={{ borderColor: currentHighlight.color }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: currentHighlight.color }}
            />
            <h4 className="text-sm font-semibold text-white">
              {currentHighlight.label}
            </h4>
          </div>
          <p className="text-sm text-neutral-300">
            {currentHighlight.description || `Current value: ${currentHighlight.value}`}
          </p>
        </div>
      )}
      
      {/* Instructions */}
      {interactive && highlights.length > 0 && (
        <p className="text-xs text-neutral-500 text-center italic">
          Click on formula components or value cards to explore
        </p>
      )}
    </div>
  );
}

/**
 * Preset formula configurations for common statistical formulas
 */
export const formulaPresets = {
  confidenceInterval: {
    formula: "\\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}",
    highlights: [
      {
        id: 'mean',
        pattern: '\\bar{x}',
        color: '#fbbf24',
        label: 'Sample Mean',
        description: 'The average of your sample data'
      },
      {
        id: 'z-score',
        pattern: 'z_{\\alpha/2}',
        color: '#ef4444',
        label: 'Z-Score',
        description: 'Critical value for confidence level'
      },
      {
        id: 'std-error',
        pattern: '\\frac{\\sigma}{\\sqrt{n}}',
        color: '#14b8a6',
        label: 'Standard Error',
        description: 'Standard deviation of the sampling distribution'
      }
    ]
  },
  
  tStatistic: {
    formula: "t = \\frac{\\bar{x} - \\mu}{s / \\sqrt{n}}",
    highlights: [
      {
        id: 'sample-mean',
        pattern: '\\bar{x}',
        color: '#fbbf24',
        label: 'Sample Mean'
      },
      {
        id: 'population-mean',
        pattern: '\\mu',
        color: '#8b5cf6',
        label: 'Population Mean'
      },
      {
        id: 'sample-std',
        pattern: 's',
        color: '#3b82f6',
        label: 'Sample Std Dev'
      },
      {
        id: 'sample-size',
        pattern: 'n',
        color: '#10b981',
        label: 'Sample Size'
      }
    ]
  },
  
  marginOfError: {
    formula: "E = z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}",
    highlights: [
      {
        id: 'margin',
        pattern: 'E',
        color: '#ef4444',
        label: 'Margin of Error'
      },
      {
        id: 'z-critical',
        pattern: 'z_{\\alpha/2}',
        color: '#f97316',
        label: 'Critical Value'
      },
      {
        id: 'population-std',
        pattern: '\\sigma',
        color: '#3b82f6',
        label: 'Population Std'
      },
      {
        id: 'n',
        pattern: 'n',
        color: '#10b981',
        label: 'Sample Size'
      }
    ]
  }
};

export default FormulaHighlighter;