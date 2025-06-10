import React, { useState, useEffect, useMemo } from 'react';
import { MathJaxContent } from '../../MathJaxProvider';
import { cn } from '../../../lib/design-system';

/**
 * FormulaVisualizer Component
 * Displays real-time LaTeX formulas and step-by-step breakdowns
 * Updates dynamically as users build set expressions
 */
export function FormulaVisualizer({ 
  expression, 
  evaluatedSet, 
  sets,
  showSteps = true,
  className = "" 
}) {
  const [steps, setSteps] = useState([]);
  
  // Generate LaTeX representation of the expression
  const formulaLatex = useMemo(() => {
    if (!expression) return "";
    
    // Convert expression to LaTeX format
    let latex = expression
      .replace(/∪/g, ' \\cup ')
      .replace(/∩/g, ' \\cap ')
      .replace(/'/g, '^c')
      .replace(/∅/g, '\\emptyset');
    
    // Add result if available
    if (evaluatedSet && evaluatedSet.length >= 0) {
      const setNotation = evaluatedSet.length === 0 
        ? '\\emptyset' 
        : `\\{${evaluatedSet.join(', ')}\\}`;
      latex = `${latex} = ${setNotation}`;
    }
    
    return `$$${latex}$$`;
  }, [expression, evaluatedSet]);
  
  // Generate step-by-step breakdown
  useEffect(() => {
    if (!expression || !showSteps) {
      setSteps([]);
      return;
    }
    
    const breakdownSteps = generateStepBreakdown(expression);
    setSteps(breakdownSteps);
  }, [expression, showSteps]);
  
  // Generate step-by-step breakdown of the expression
  function generateStepBreakdown(expr) {
    const steps = [];
    
    // Step 1: Identify the sets involved
    const setsInvolved = [];
    if (expr.includes('A')) setsInvolved.push('A');
    if (expr.includes('B')) setsInvolved.push('B');
    if (expr.includes('C')) setsInvolved.push('C');
    
    if (setsInvolved.length > 0) {
      steps.push({
        description: "Sets involved:",
        latex: `$$${setsInvolved.map(s => `${s} = \\{${getSetElements(s).join(', ')}\\}`).join(', \\ ')}$$`
      });
    }
    
    // Step 2: Identify operations
    const operations = [];
    if (expr.includes('∪')) operations.push('Union (∪): Combines all elements from both sets');
    if (expr.includes('∩')) operations.push('Intersection (∩): Only elements in both sets');
    if (expr.includes("'")) operations.push('Complement (\'): Elements NOT in the set');
    
    if (operations.length > 0) {
      steps.push({
        description: "Operations used:",
        list: operations
      });
    }
    
    // Step 3: Show evaluation order for complex expressions
    if (expr.includes('(') || operations.length > 1) {
      steps.push({
        description: "Evaluation order:",
        latex: generateEvaluationOrder(expr)
      });
    }
    
    // Step 4: Show intermediate results for complex expressions
    if (operations.length > 1) {
      const intermediates = generateIntermediateResults(expr);
      if (intermediates.length > 0) {
        steps.push({
          description: "Step-by-step evaluation:",
          intermediates: intermediates
        });
      }
    }
    
    return steps;
  }
  
  // Get elements of a basic set
  function getSetElements(setName) {
    const setMappings = {
      'A': [1, 4, 5, 7],
      'B': [2, 5, 6, 7],
      'C': [3, 4, 6, 7],
      'U': [1, 2, 3, 4, 5, 6, 7, 8]
    };
    return setMappings[setName] || [];
  }
  
  // Generate LaTeX for evaluation order
  function generateEvaluationOrder(expr) {
    // Simplified for demo - would implement full parsing
    if (expr.includes('(')) {
      return `$$\\text{1. Evaluate parentheses first} \\rightarrow \\text{2. Apply remaining operations}$$`;
    }
    return `$$\\text{Operations evaluated left to right}$$`;
  }
  
  // Generate intermediate results
  function generateIntermediateResults(expr) {
    const results = [];
    
    // Simplified example for A∪B∩C
    if (expr === 'A∪B∩C') {
      results.push({
        step: "First: B∩C",
        latex: "$$B \\cap C = \\{6, 7\\}$$"
      });
      results.push({
        step: "Then: A∪(B∩C)",
        latex: "$$A \\cup \\{6, 7\\} = \\{1, 4, 5, 6, 7\\}$$"
      });
    }
    
    return results;
  }
  
  return (
    <div className={cn("formula-visualizer", className)}>
      {/* Main Formula Display */}
      {formulaLatex && (
        <div className="formula-display bg-neutral-800 rounded-lg p-4 mb-4">
          <MathJaxContent
            content={formulaLatex}
            className="text-xl text-white text-center"
          />
        </div>
      )}
      
      {/* Step-by-step Breakdown */}
      {showSteps && steps.length > 0 && (
        <div className="steps-breakdown space-y-3">
          <h5 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide">
            Understanding the Expression
          </h5>
          
          {steps.map((step, index) => (
            <div key={index} className="step bg-neutral-900 rounded p-3">
              <p className="text-sm font-medium text-neutral-300 mb-2">
                {step.description}
              </p>
              
              {step.latex && (
                <MathJaxContent
                  content={step.latex}
                  className="text-sm text-neutral-100"
                />
              )}
              
              {step.list && (
                <ul className="list-disc list-inside space-y-1 text-xs text-neutral-400">
                  {step.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
              
              {step.intermediates && (
                <div className="space-y-2">
                  {step.intermediates.map((intermediate, i) => (
                    <div key={i} className="pl-4 border-l-2 border-neutral-700">
                      <p className="text-xs text-neutral-400 mb-1">{intermediate.step}</p>
                      <MathJaxContent
                        content={intermediate.latex}
                        className="text-sm text-neutral-200"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Visual Connection Indicator */}
      {expression && (
        <div className="visual-connection mt-4 p-3 bg-blue-900/20 rounded border border-blue-800/50">
          <p className="text-xs text-blue-300 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            The highlighted regions in the diagram show {evaluatedSet.length > 0 
              ? `the ${evaluatedSet.length} element(s) in the result set`
              : 'an empty set (no elements)'}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Simplified Formula Display Component
 * For contexts where only the formula is needed without breakdown
 */
export function SimpleFormulaDisplay({ expression, evaluatedSet, className = "" }) {
  const formulaLatex = useMemo(() => {
    if (!expression) return "";
    
    let latex = expression
      .replace(/∪/g, ' \\cup ')
      .replace(/∩/g, ' \\cap ')
      .replace(/'/g, '^c')
      .replace(/∅/g, '\\emptyset');
    
    if (evaluatedSet && evaluatedSet.length >= 0) {
      const setNotation = evaluatedSet.length === 0 
        ? '\\emptyset' 
        : `\\{${evaluatedSet.join(', ')}\\}`;
      latex = `${latex} = ${setNotation}`;
    }
    
    return `$$${latex}$$`;
  }, [expression, evaluatedSet]);
  
  if (!formulaLatex) return null;
  
  return (
    <div className={cn("simple-formula bg-neutral-800 rounded p-3", className)}>
      <MathJaxContent
        content={formulaLatex}
        className="text-lg text-white text-center"
      />
    </div>
  );
}