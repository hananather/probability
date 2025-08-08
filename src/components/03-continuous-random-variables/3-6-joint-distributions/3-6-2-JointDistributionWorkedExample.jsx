'use client';

import React, { useState, useRef } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { VisualizationContainer } from '../../ui/VisualizationContainer';
import { cn } from '../../../lib/utils';
import { useSafeMathJax } from '../../../utils/mathJaxFix';

// LaTeX formula component
const LaTeXFormula = React.memo(function LaTeXFormula({ formula, isBlock = false }) {
  const contentRef = useRef(null);
  useSafeMathJax(contentRef, [formula]);
  
  if (isBlock) {
    return (
      <div ref={contentRef} className="text-center my-2">
        <div dangerouslySetInnerHTML={{ __html: `\\[${formula}\\]` }} />
      </div>
    );
  }
  
  return (
    <span ref={contentRef}>
      <span dangerouslySetInnerHTML={{ __html: `\\(${formula}\\)` }} />
    </span>
  );
});

export const JointDistributionWorkedExample = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const contentRef = useRef(null);
  
  useSafeMathJax(contentRef, [currentStep, showAnswer]);

  const examples = [
    {
      title: "Example 1: Finding Marginal PDFs",
      problem: (
        <div>
          <p className="mb-2">Given the joint PDF:</p>
          <LaTeXFormula 
            formula={`f_{X,Y}(x,y) = \\begin{cases} 
              6xy & 0 \\leq x \\leq 1, 0 \\leq y \\leq 1-x \\\\
              0 & \\text{otherwise}
            \\end{cases}`} 
            isBlock={true}
          />
          <p className="mt-2">Find the marginal PDFs <LaTeXFormula formula={`f_X(x)`} /> and <LaTeXFormula formula={`f_Y(y)`} />.</p>
        </div>
      ),
      solution: (
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-blue-400 mb-2">Finding <LaTeXFormula formula={`f_X(x)`} />:</p>
            <p>For <LaTeXFormula formula={`0 \\leq x \\leq 1`} />:</p>
            <LaTeXFormula 
              formula={`f_X(x) = \\int_{0}^{1-x} 6xy \\, dy = 6x \\left[\\frac{y^2}{2}\\right]_0^{1-x} = 3x(1-x)^2`} 
              isBlock={true}
            />
          </div>
          <div>
            <p className="font-semibold text-green-400 mb-2">Finding <LaTeXFormula formula={`f_Y(y)`} />:</p>
            <p>For <LaTeXFormula formula={`0 \\leq y \\leq 1`} />:</p>
            <LaTeXFormula 
              formula={`f_Y(y) = \\int_{0}^{1-y} 6xy \\, dx = 6y \\left[\\frac{x^2}{2}\\right]_0^{1-y} = 3y(1-y)^2`} 
              isBlock={true}
            />
          </div>
          <div className="p-3 bg-neutral-800 rounded">
            <p className="text-yellow-400 text-sm">💡 Key insight:</p>
            <p className="text-xs">The integration limits depend on the region where the joint PDF is non-zero!</p>
          </div>
        </div>
      )
    },
    {
      title: "Example 2: Checking Independence",
      problem: (
        <div>
          <p className="mb-2">For random variables X and Y with joint PDF:</p>
          <LaTeXFormula 
            formula={`f_{X,Y}(x,y) = \\begin{cases} 
              4xy & 0 \\leq x \\leq 1, 0 \\leq y \\leq 1 \\\\
              0 & \\text{otherwise}
            \\end{cases}`} 
            isBlock={true}
          />
          <p className="mt-2">Are X and Y independent?</p>
        </div>
      ),
      solution: (
        <div className="space-y-4">
          <div>
            <p className="font-semibold mb-2">Step 1: Find marginal PDFs</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-blue-400 text-sm mb-1">For X:</p>
                <LaTeXFormula 
                  formula={`f_X(x) = \\int_0^1 4xy \\, dy = 2x`} 
                  isBlock={true}
                />
              </div>
              <div>
                <p className="text-green-400 text-sm mb-1">For Y:</p>
                <LaTeXFormula 
                  formula={`f_Y(y) = \\int_0^1 4xy \\, dx = 2y`} 
                  isBlock={true}
                />
              </div>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-2">Step 2: Check if <LaTeXFormula formula={`f_{X,Y}(x,y) = f_X(x) \\cdot f_Y(y)`} /></p>
            <LaTeXFormula 
              formula={`f_X(x) \\cdot f_Y(y) = 2x \\cdot 2y = 4xy = f_{X,Y}(x,y)`} 
              isBlock={true}
            />
            <p className="text-green-400 font-semibold mt-2">✓ Yes, X and Y are independent!</p>
          </div>
        </div>
      )
    },
    {
      title: "Example 3: Conditional Probability",
      problem: (
        <div>
          <p className="mb-2">Given the joint PDF from Example 1:</p>
          <LaTeXFormula 
            formula={`f_{X,Y}(x,y) = 6xy \\text{ for } 0 \\leq x \\leq 1, 0 \\leq y \\leq 1-x`} 
            isBlock={true}
          />
          <p className="mt-2">Find <LaTeXFormula formula={`P(Y > 0.5 | X = 0.3)`} />.</p>
        </div>
      ),
      solution: (
        <div className="space-y-4">
          <div>
            <p className="font-semibold mb-2">Step 1: Find the conditional PDF <LaTeXFormula formula={`f_{Y|X}(y|x=0.3)`} /></p>
            <p>We already found <LaTeXFormula formula={`f_X(0.3) = 3(0.3)(1-0.3)^2 = 0.441`} /></p>
            <LaTeXFormula 
              formula={`f_{Y|X}(y|0.3) = \\frac{f_{X,Y}(0.3,y)}{f_X(0.3)} = \\frac{6(0.3)y}{0.441} = \\frac{1.8y}{0.441}`} 
              isBlock={true}
            />
            <p className="text-sm text-neutral-400">for <LaTeXFormula formula={`0 \\leq y \\leq 0.7`} /></p>
          </div>
          <div>
            <p className="font-semibold mb-2">Step 2: Calculate the probability</p>
            <LaTeXFormula 
              formula={`P(Y > 0.5 | X = 0.3) = \\int_{0.5}^{0.7} \\frac{1.8y}{0.441} \\, dy`} 
              isBlock={true}
            />
            <LaTeXFormula 
              formula={`= \\frac{1.8}{0.441} \\left[\\frac{y^2}{2}\\right]_{0.5}^{0.7} = \\frac{1.8}{0.441} \\cdot \\frac{0.49 - 0.25}{2} = 0.490`} 
              isBlock={true}
            />
          </div>
        </div>
      )
    }
  ];

  const currentExample = examples[currentStep];

  return (
    <VisualizationContainer
      title="Joint Distribution Worked Examples"
      description="Step-by-step solutions for joint continuous distributions"
    >
      <div className="space-y-6" ref={contentRef}>
        {/* Example navigation */}
        <div className="flex gap-2 justify-center">
          {examples.map((_, index) => (
            <Button
              key={index}
              onClick={() => {
                setCurrentStep(index);
                setShowAnswer(false);
              }}
              variant={currentStep === index ? "default" : "outline"}
              size="sm"
            >
              Example {index + 1}
            </Button>
          ))}
        </div>

        {/* Current example */}
        <Card className="p-6 bg-neutral-900 border-neutral-700">
          <h3 className="text-lg font-semibold mb-4">{currentExample.title}</h3>
          
          {/* Problem statement */}
          <div className="mb-6">
            {currentExample.problem}
          </div>

          {/* Solution toggle */}
          <div className="text-center mb-4">
            <Button
              onClick={() => setShowAnswer(!showAnswer)}
              variant="outline"
              size="sm"
            >
              {showAnswer ? "Hide" : "Show"} Solution
            </Button>
          </div>

          {/* Solution */}
          {showAnswer && (
            <div className="border-t border-neutral-700 pt-4">
              {currentExample.solution}
            </div>
          )}
        </Card>

        {/* Tips card */}
        <Card className="p-4 bg-blue-900/20 border-blue-500/30">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">Problem-Solving Tips</h4>
          <ul className="space-y-1 text-xs text-neutral-300">
            <li>• Always identify the region where the joint PDF is non-zero</li>
            <li>• Draw the region of integration to determine correct limits</li>
            <li>• For independence, check if joint PDF = product of marginals</li>
            <li>• For conditional distributions, remember to normalize by the marginal</li>
          </ul>
        </Card>
      </div>
    </VisualizationContainer>
  );
};

export default JointDistributionWorkedExample;