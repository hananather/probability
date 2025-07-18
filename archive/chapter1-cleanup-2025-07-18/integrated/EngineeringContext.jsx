import React, { useState, useMemo } from 'react';
import { cn } from '../../../lib/design-system';
import { MathJaxContent } from '../../MathJaxProvider';

/**
 * EngineeringContext Component
 * Shows real-world engineering applications of set operations
 * Contextualizes abstract concepts with practical examples
 */
export function EngineeringContext({ 
  currentExpression,
  evaluatedSet,
  className = "" 
}) {
  const [selectedExample, setSelectedExample] = useState('quality');
  
  // Engineering examples with set theory applications
  const examples = {
    quality: {
      title: "Quality Control & Defect Analysis",
      icon: "🏭",
      sets: {
        A: "Surface defects",
        B: "Dimensional errors",
        C: "Material flaws"
      },
      scenarios: [
        {
          expression: "A∪B∪C",
          meaning: "Products with ANY defect",
          application: "Total defect rate calculation"
        },
        {
          expression: "A∩B",
          meaning: "Products with BOTH surface AND dimensional issues",
          application: "Identify systematic manufacturing problems"
        },
        {
          expression: "(A∪B∪C)'",
          meaning: "Products with NO defects",
          application: "Calculate yield rate"
        }
      ]
    },
    reliability: {
      title: "System Reliability Engineering",
      icon: "⚡",
      sets: {
        A: "Component A failures",
        B: "Component B failures",
        C: "Component C failures"
      },
      scenarios: [
        {
          expression: "A'∩B'∩C'",
          meaning: "System operates (no failures)",
          application: "System reliability calculation"
        },
        {
          expression: "A∪B",
          meaning: "System fails (series configuration)",
          application: "Failure probability for non-redundant systems"
        },
        {
          expression: "A∩B∩C",
          meaning: "Complete system failure (parallel redundancy)",
          application: "Catastrophic failure analysis"
        }
      ]
    },
    safety: {
      title: "Safety & Risk Assessment",
      icon: "🛡️",
      sets: {
        A: "Human errors",
        B: "Equipment failures",
        C: "Environmental hazards"
      },
      scenarios: [
        {
          expression: "A∪B∪C",
          meaning: "Any safety incident",
          application: "Total incident rate"
        },
        {
          expression: "A∩(B∪C)",
          meaning: "Human error combined with other factors",
          application: "Critical incident analysis"
        },
        {
          expression: "B'∩C'",
          meaning: "Only human factors involved",
          application: "Training effectiveness assessment"
        }
      ]
    }
  };
  
  const currentExample = examples[selectedExample];
  
  // Match current expression to example scenarios
  const matchingScenario = useMemo(() => {
    if (!currentExpression) return null;
    
    return Object.values(examples).flatMap(ex => ex.scenarios)
      .find(scenario => scenario.expression === currentExpression);
  }, [currentExpression]);
  
  return (
    <div className={cn("engineering-context space-y-4", className)}>
      {/* Example Selector */}
      <div className="flex gap-2 mb-4">
        {Object.entries(examples).map(([key, example]) => (
          <button
            key={key}
            onClick={() => setSelectedExample(key)}
            className={cn(
              "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              selectedExample === key
                ? "bg-teal-600 text-white"
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
            )}
          >
            <span className="mr-2">{example.icon}</span>
            <span className="hidden sm:inline">{example.title.split(' ')[0]}</span>
          </button>
        ))}
      </div>
      
      {/* Current Example Details */}
      <div className="bg-neutral-800 rounded-lg p-4">
        <h5 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <span className="text-xl">{currentExample.icon}</span>
          {currentExample.title}
        </h5>
        
        {/* Set Definitions */}
        <div className="mb-4 space-y-2">
          <p className="text-xs text-neutral-400 uppercase tracking-wide">
            In this context:
          </p>
          {Object.entries(currentExample.sets).map(([set, meaning]) => (
            <div key={set} className="flex items-center gap-2 text-sm">
              <span className="font-mono bg-neutral-700 px-2 py-1 rounded">
                {set}
              </span>
              <span className="text-neutral-300">= {meaning}</span>
            </div>
          ))}
        </div>
        
        {/* Scenarios */}
        <div className="space-y-3">
          <p className="text-xs text-neutral-400 uppercase tracking-wide">
            Common Applications:
          </p>
          {currentExample.scenarios.map((scenario, index) => (
            <div 
              key={index}
              className={cn(
                "p-3 rounded-lg transition-all",
                matchingScenario === scenario
                  ? "bg-teal-900/50 border border-teal-700"
                  : "bg-neutral-900"
              )}
            >
              <div className="font-mono text-sm text-yellow-400 mb-1">
                {scenario.expression}
              </div>
              <div className="text-sm text-neutral-300 mb-1">
                {scenario.meaning}
              </div>
              <div className="text-xs text-neutral-500">
                <span className="text-neutral-400">Use case:</span> {scenario.application}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Current Expression Context */}
      {currentExpression && matchingScenario && (
        <div className="bg-teal-900/30 border border-teal-800 rounded-lg p-4">
          <h6 className="text-sm font-semibold text-teal-300 mb-2">
            Your Current Expression in Practice:
          </h6>
          <div className="space-y-2">
            <p className="text-sm text-neutral-300">
              <span className="font-mono text-yellow-400">{currentExpression}</span> represents{' '}
              <span className="font-medium">{matchingScenario.meaning.toLowerCase()}</span>
            </p>
            <p className="text-xs text-neutral-400">
              This is commonly used for: {matchingScenario.application}
            </p>
            {evaluatedSet.length > 0 && (
              <p className="text-xs text-teal-400">
                In this case, {evaluatedSet.length} out of 8 possible outcomes match this criteria.
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Probability Connection */}
      <ProbabilityInsight 
        expression={currentExpression}
        evaluatedSet={evaluatedSet}
        context={selectedExample}
      />
    </div>
  );
}

/**
 * ProbabilityInsight Component
 * Shows how set operations relate to probability calculations
 */
function ProbabilityInsight({ expression, evaluatedSet, context }) {
  if (!expression || !evaluatedSet) return null;
  
  const probability = evaluatedSet.length / 8; // Assuming 8 total outcomes
  const percentage = (probability * 100).toFixed(1);
  
  const insights = {
    quality: {
      high: "High defect rate - investigate manufacturing process",
      medium: "Moderate defect rate - monitor for trends",
      low: "Low defect rate - maintain current standards"
    },
    reliability: {
      high: "High failure probability - consider redundancy",
      medium: "Moderate reliability - regular maintenance needed",
      low: "High reliability - system performing well"
    },
    safety: {
      high: "High risk level - immediate intervention required",
      medium: "Moderate risk - implement preventive measures",
      low: "Low risk - continue monitoring"
    }
  };
  
  const level = probability > 0.5 ? 'high' : probability > 0.2 ? 'medium' : 'low';
  const insight = insights[context]?.[level] || "";
  
  return (
    <div className="bg-purple-900/20 border border-purple-800/50 rounded-lg p-4">
      <h6 className="text-sm font-semibold text-purple-300 mb-2">
        Probability Interpretation:
      </h6>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-300">Probability:</span>
          <span className="font-mono text-purple-400">
            P({expression}) = {evaluatedSet.length}/8 = {probability.toFixed(3)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-300">Percentage:</span>
          <span className="font-mono text-purple-400">{percentage}%</span>
        </div>
        
        {insight && (
          <div className="mt-3 pt-3 border-t border-purple-800/50">
            <p className="text-xs text-purple-300">
              <span className="font-medium">Engineering insight:</span> {insight}
            </p>
          </div>
        )}
      </div>
      
      {/* Visual probability bar */}
      <div className="mt-3">
        <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * QuickExample Component
 * Provides quick interactive examples for common engineering scenarios
 */
export function QuickExample({ onSelectExpression }) {
  const quickExamples = [
    {
      category: "Quality Control",
      examples: [
        { expr: "A∪B∪C", desc: "Any defect" },
        { expr: "(A∪B∪C)'", desc: "No defects (yield)" },
        { expr: "A∩B", desc: "Multiple defects" }
      ]
    },
    {
      category: "Reliability",
      examples: [
        { expr: "A'∩B'∩C'", desc: "System works" },
        { expr: "A∪B∪C", desc: "System fails" },
        { expr: "A∩B∩C", desc: "Total failure" }
      ]
    }
  ];
  
  return (
    <div className="quick-examples space-y-3">
      <h6 className="text-xs text-neutral-400 uppercase tracking-wide">
        Try These Examples:
      </h6>
      {quickExamples.map((category, idx) => (
        <div key={idx} className="space-y-1">
          <p className="text-xs text-neutral-500">{category.category}:</p>
          <div className="flex flex-wrap gap-2">
            {category.examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => onSelectExpression(ex.expr)}
                className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 
                         rounded text-xs text-neutral-300 transition-colors"
                title={ex.desc}
              >
                <span className="font-mono">{ex.expr}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}