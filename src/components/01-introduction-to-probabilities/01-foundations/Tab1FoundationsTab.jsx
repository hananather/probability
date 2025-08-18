"use client";

import React, { useRef } from 'react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';
import { useMathJax } from '@/hooks/useMathJax';

// Section components
const PhysicalIntuitionSection = () => {
  const contentRef = useRef(null);
  useMathJax(contentRef);
  
  return (
    <div ref={contentRef} className="space-y-4">
      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-3">Physical Intuition with Pebbles</h3>
        <p className="text-neutral-300 mb-4">
          Imagine a world where everything is made of tiny pebbles. Each pebble represents a possible outcome, 
          and probability is simply counting pebbles.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="font-medium text-teal-300 mb-2">Sample Space</h4>
            <p className="text-sm text-neutral-300">
              All possible outcomes = All pebbles in the world
            </p>
            <div className="mt-2 text-xs text-neutral-400">
              <span dangerouslySetInnerHTML={{ __html: `\\(S = \\{\\text{all pebbles}\\}\\)` }} />
            </div>
          </div>
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="font-medium text-teal-300 mb-2">Event</h4>
            <p className="text-sm text-neutral-300">
              A specific outcome = A subset of pebbles
            </p>
            <div className="mt-2 text-xs text-neutral-400">
              <span dangerouslySetInnerHTML={{ __html: `\\(A \\subseteq S\\)` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CountingPrincipleSection = () => {
  const contentRef = useRef(null);
  useMathJax(contentRef);
  
  return (
    <div ref={contentRef} className="space-y-4">
      <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-300 mb-3">The Counting Principle</h3>
        <p className="text-neutral-300 mb-4">
          Probability is fundamentally about counting. When all outcomes are equally likely, 
          it's just a ratio of favorable outcomes to total outcomes.
        </p>
        
        <div className="bg-neutral-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-yellow-300 mb-2">Core Formula</h4>
          <div className="text-center py-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(A) = \\frac{\\text{Number of favorable outcomes}}{\\text{Total number of outcomes}}\\]` 
            }} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-green-900/20 rounded p-3 text-center">
            <p className="text-xs text-green-400 mb-1">Coin Flip</p>
            <span dangerouslySetInnerHTML={{ __html: `\\(P(H) = \\frac{1}{2}\\)` }} />
          </div>
          <div className="bg-blue-900/20 rounded p-3 text-center">
            <p className="text-xs text-blue-400 mb-1">Die Roll</p>
            <span dangerouslySetInnerHTML={{ __html: `\\(P(6) = \\frac{1}{6}\\)` }} />
          </div>
          <div className="bg-purple-900/20 rounded p-3 text-center">
            <p className="text-xs text-purple-400 mb-1">Card Draw</p>
            <span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Ace}) = \\frac{4}{52}\\)` }} />
          </div>
        </div>
      </div>
      
      <SimpleInsightBox title="Key Insight" theme="purple">
        <p>This only works when all outcomes are <strong>equally likely</strong>. 
        Like having identical pebbles that are equally likely to be picked.</p>
      </SimpleInsightBox>
    </div>
  );
};

const SetOperationsSection = () => {
  const contentRef = useRef(null);
  useMathJax(contentRef);
  
  return (
    <div ref={contentRef} className="space-y-4">
      <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-orange-300 mb-3">Set Operations: Building Complex Events</h3>
        <p className="text-neutral-300 mb-4">
          We can combine simple events to create complex ones using set operations. 
          Think of it as combining different groups of pebbles.
        </p>
        
        <div className="space-y-3">
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="font-medium text-cyan-300 mb-2">Union (OR)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-300 mb-2">
                  "A or B" = All pebbles in either A or B (or both)
                </p>
                <div className="text-xs text-neutral-400">
                  <span dangerouslySetInnerHTML={{ __html: `\\(A \\cup B\\)` }} />
                </div>
              </div>
              <div className="text-xs text-neutral-400">
                Example: "Rain OR Snow" includes days with rain, snow, or both
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="font-medium text-green-300 mb-2">Intersection (AND)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-300 mb-2">
                  "A and B" = Only pebbles in both A and B
                </p>
                <div className="text-xs text-neutral-400">
                  <span dangerouslySetInnerHTML={{ __html: `\\(A \\cap B\\)` }} />
                </div>
              </div>
              <div className="text-xs text-neutral-400">
                Example: "Rain AND Cold" only includes days that are both rainy and cold
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="font-medium text-red-300 mb-2">Complement (NOT)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-300 mb-2">
                  "Not A" = All pebbles except those in A
                </p>
                <div className="text-xs text-neutral-400">
                  <span dangerouslySetInnerHTML={{ __html: `\\(A^c\\)` }} />
                </div>
              </div>
              <div className="text-xs text-neutral-400">
                Example: "Not Rain" includes all days without rain
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CompleteExampleSection = () => {
  const contentRef = useRef(null);
  useMathJax(contentRef);
  
  return (
    <div ref={contentRef} className="space-y-4">
      <div className="bg-gradient-to-br from-teal-900/20 to-green-900/20 border border-teal-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-teal-300 mb-3">Complete Example: Two Coin Flips</h3>
        <p className="text-neutral-300 mb-4">
          Let's apply everything we've learned to a simple problem: flipping a coin twice.
        </p>
        
        <div className="space-y-4">
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="font-medium text-yellow-300 mb-2">Step 1: Define Sample Space</h4>
            <p className="text-sm text-neutral-300 mb-2">
              All possible outcomes when flipping twice:
            </p>
            <div className="text-center">
              <span dangerouslySetInnerHTML={{ __html: `\\[S = \\{HH, HT, TH, TT\\}\\]` }} />
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              4 equally likely pebbles, each with probability 1/4
            </p>
          </div>
          
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="font-medium text-cyan-300 mb-2">Step 2: Define Events</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-green-400">A:</span> "First flip is heads" = 
                <span dangerouslySetInnerHTML={{ __html: ` \\(\\{HH, HT\\}\\)` }} />
              </div>
              <div>
                <span className="text-blue-400">B:</span> "Second flip is heads" = 
                <span dangerouslySetInnerHTML={{ __html: ` \\(\\{HH, TH\\}\\)` }} />
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="font-medium text-purple-300 mb-2">Step 3: Calculate Probabilities</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span dangerouslySetInnerHTML={{ __html: `\\(P(A) = \\frac{2}{4} = \\frac{1}{2}\\)` }} />
                <span className="text-neutral-400 ml-2">(2 favorable out of 4 total)</span>
              </div>
              <div>
                <span dangerouslySetInnerHTML={{ __html: `\\(P(B) = \\frac{2}{4} = \\frac{1}{2}\\)` }} />
                <span className="text-neutral-400 ml-2">(2 favorable out of 4 total)</span>
              </div>
              <div>
                <span dangerouslySetInnerHTML={{ __html: `\\(P(A \\cap B) = \\frac{1}{4}\\)` }} />
                <span className="text-neutral-400 ml-2">(only HH is in both)</span>
              </div>
              <div>
                <span dangerouslySetInnerHTML={{ __html: `\\(P(A \\cup B) = \\frac{3}{4}\\)` }} />
                <span className="text-neutral-400 ml-2">(HH, HT, TH)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SimpleInsightBox title="The Power of the Pebble Model" theme="teal">
        <p>
          Every probability problem can be reduced to counting pebbles. This physical intuition 
          will guide us through even the most complex scenarios.
        </p>
      </SimpleInsightBox>
    </div>
  );
};

const SECTIONS = [
  {
    id: 'physical-intuition',
    title: 'Physical Intuition',
    content: PhysicalIntuitionSection
  },
  {
    id: 'counting-principle',
    title: 'The Counting Principle',
    content: CountingPrincipleSection
  },
  {
    id: 'set-operations',
    title: 'Set Operations',
    content: SetOperationsSection
  },
  {
    id: 'complete-example',
    title: 'Complete Example',
    content: CompleteExampleSection
  }
];

export default function Tab1FoundationsTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Foundations"
      description="Build intuitive understanding through physical models"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="green"
      showHeader={false}
    />
  );
}