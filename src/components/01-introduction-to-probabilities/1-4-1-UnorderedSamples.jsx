"use client";
import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { ProgressBar, ProgressNavigation } from '../ui/ProgressBar';
import { InfoIcon } from 'lucide-react';

const colorScheme = createColorScheme('probability');

// Import the existing components that we'll use as stages
import { OrderedVsUnordered } from './1-4-1-OrderedVsUnordered';
import { CombinationBuilder } from './1-4-1-CombinationBuilder';
import { PascalsTriangleExplorer } from './1-4-1-PascalsTriangleExplorer';
import { CombinationApplications } from './1-4-1-CombinationApplications';

// Simplified Lottery Example Component
const LotteryIntro = () => {
  return (
    <VisualizationSection className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h3 className="text-xl font-semibold text-white">The Lottery Problem</h3>
        
        <p className={cn(typography.body, "text-gray-300")}>
          Imagine you're playing Lotto 6/49. You need to choose 6 numbers from 1 to 49. 
          When the lottery officials announce the results, they always list them in increasing order:
        </p>
        
        <div className="bg-gray-900/80 rounded-lg p-4 my-4">
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5, 6].map(num => (
              <div key={num} className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-mono font-bold">
                {num}
              </div>
            ))}
          </div>
        </div>
        
        <p className={cn(typography.body, "text-gray-300")}>
          But wait – does this mean ball #1 was drawn first? Not necessarily! 
          The balls could have been drawn in any order. When we look at the results, 
          we have no way of knowing which ball came out first, second, or last.
        </p>
        
        <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-200">
              <strong>Key Insight:</strong> When order doesn't matter, we're dealing with <strong>combinations</strong>, not permutations.
            </p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
};

// Formula Derivation Component
const FormulaDerivation = () => {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <VisualizationSection className="p-6">
      <div ref={contentRef} className="max-w-2xl mx-auto space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Deriving the Combination Formula</h3>
        
        <p className={cn(typography.body, "text-gray-300")}>
          How many ways can we choose 6 numbers from 49? Let's think about this step by step:
        </p>
        
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
          <p className="text-sm text-gray-300">We can derive the formula by recognizing that these two processes are equivalent:</p>
          
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
            <li>
              <strong>Take an ordered sample of size r</strong> (there are P(n,r) ways)
            </li>
            <li>
              <strong>Take an unordered sample of size r</strong> (there are C(n,r) ways) 
              <strong> then rearrange the objects</strong> (there are r! ways)
            </li>
          </ol>
          
          <div className="text-center space-y-2 pt-4">
            <div className="text-base">
              <span dangerouslySetInnerHTML={{ __html: `\\(P(n,r) = C(n,r) \\times r!\\)` }} />
            </div>
            <div className="text-sm text-gray-400">Therefore:</div>
            <div className="text-lg font-semibold text-blue-400">
              <span dangerouslySetInnerHTML={{ __html: `\\(C(n,r) = \\frac{P(n,r)}{r!} = \\frac{n!}{r!(n-r)!} = \\binom{n}{r}\\)` }} />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4 mt-4">
          <p className="text-sm text-center text-gray-400">
            For Lotto 6/49: C(49,6) = 13,983,816 possible combinations!
          </p>
        </div>
      </div>
    </VisualizationSection>
  );
};

// Main Component
export default function UnorderedSamples() {
  const [stage, setStage] = useState(1);
  const totalStages = 6;
  
  const stages = [
    {
      id: 1,
      title: "The Lottery Problem",
      component: <LotteryIntro />
    },
    {
      id: 2,
      title: "Ordered vs Unordered",
      component: <OrderedVsUnordered />
    },
    {
      id: 3,
      title: "The Combination Formula",
      component: <FormulaDerivation />
    },
    {
      id: 4,
      title: "Interactive Builder",
      component: <CombinationBuilder />
    },
    {
      id: 5,
      title: "Pascal's Triangle",
      component: <PascalsTriangleExplorer />
    },
    {
      id: 6,
      title: "Real-World Applications",
      component: <CombinationApplications />
    }
  ];
  
  const currentStage = stages.find(s => s.id === stage);
  
  return (
    <VisualizationContainer 
      title="Unordered Samples (Combinations)"
      className="max-w-7xl mx-auto"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="px-4">
          <ProgressBar
            current={stage}
            total={totalStages}
            label={`Stage ${stage}: ${currentStage.title}`}
            variant="emerald"
          />
        </div>
        
        {/* Stage Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center px-4">
          {stages.map((s) => (
            <Button
              key={s.id}
              variant={stage === s.id ? "primary" : "neutral"}
              size="sm"
              onClick={() => setStage(s.id)}
              className="text-xs"
            >
              {s.title}
            </Button>
          ))}
        </div>
        
        {/* Current Stage Content */}
        <div className="min-h-[500px]">
          {currentStage.component}
        </div>
        
        {/* Navigation Controls */}
        <div className="px-4 pb-4">
          <ProgressNavigation
            current={stage}
            total={totalStages}
            onPrevious={() => setStage(Math.max(1, stage - 1))}
            onNext={() => setStage(Math.min(totalStages, stage + 1))}
            variant="emerald"
          />
        </div>
        
        {/* Key Takeaways */}
        {stage === totalStages && (
          <VisualizationSection className="p-6 bg-gradient-to-br from-emerald-900/20 to-blue-900/20 border border-emerald-600/30">
            <h3 className="text-lg font-semibold text-white mb-4">Key Takeaways</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• <strong>Combinations count selections where order doesn't matter</strong></li>
              <li>• <strong>Formula:</strong> C(n,r) = n! / (r!(n-r)!)</li>
              <li>• <strong>Relationship to permutations:</strong> C(n,r) = P(n,r) / r!</li>
              <li>• <strong>Symmetry:</strong> Choosing r items = choosing (n-r) items to exclude</li>
              <li>• <strong>Pascal's Triangle</strong> provides a visual way to compute combinations</li>
              <li>• <strong>Applications</strong> include team selection, quality control, network design</li>
            </ul>
          </VisualizationSection>
        )}
      </div>
    </VisualizationContainer>
  );
}