"use client";

import React, { useEffect, useRef } from 'react';
import SectionBasedContent, { 
  SectionContent, 
  MathFormula, 
  InteractiveElement 
} from '@/components/ui/SectionBasedContent';
import MathJaxSection from '@/components/ui/MathJaxSection';
import { WorkedExample, ExampleSection, InsightBox, Formula } from '@/components/ui/WorkedExample';
import { createColorScheme } from '@/lib/design-system';

const colorScheme = createColorScheme('probability');

const SECTIONS = [
  {
    id: 'basic-example',
    title: 'Basic Example',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <MathJaxSection>
            <WorkedExample title="Dice Roll Example">
              <ExampleSection title="Problem">
                <p className="text-neutral-300">
                  You roll a fair six-sided die. Given that the result is even, 
                  what's the probability that it's greater than 3?
                </p>
              </ExampleSection>
              
              <ExampleSection title="Step 1: Identify Events">
                <div className="space-y-2">
                  <p className="text-neutral-300">Let's define:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-neutral-300">
                    <li>A = "Roll is greater than 3" = {4, 5, 6}</li>
                    <li>B = "Roll is even" = {2, 4, 6}</li>
                    <li>We want P(A|B)</li>
                  </ul>
                </div>
              </ExampleSection>
              
              <ExampleSection title="Step 2: Find Intersection">
                <div className="bg-neutral-800 p-3 rounded">
                  <p className="text-neutral-300">
                    A ∩ B = "Even AND greater than 3" = {4, 6}
                  </p>
                </div>
              </ExampleSection>
              
              <ExampleSection title="Step 3: Apply Formula">
                <Formula>
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[P(A|B) = \\frac{P(A \\cap B)}{P(B)} = \\frac{|\\{4, 6\\}|/6}{|\\{2, 4, 6\\}|/6} = \\frac{2/6}{3/6} = \\frac{2}{3}\\]` 
                  }} />
                </Formula>
              </ExampleSection>
              
              <ExampleSection title="Answer">
                <div className="bg-green-900/20 p-3 rounded border border-green-600/30">
                  <p className="text-neutral-300">
                    The probability is <span className="font-bold font-mono text-green-400">2/3</span>
                  </p>
                  <p className="text-sm text-neutral-400 mt-1">
                    Makes sense: Of the 3 even numbers {2, 4, 6}, exactly 2 are greater than 3
                  </p>
                </div>
              </ExampleSection>
            </WorkedExample>
            
            <InsightBox variant="tip">
              Quick Check: When working with finite sample spaces, you can often 
              verify by counting directly within the conditional space!
            </InsightBox>
        </MathJaxSection>
      </SectionContent>
    )
  },
  {
    id: 'exam-level',
    title: 'Exam-Level Example',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <MathJaxSection>
            <WorkedExample title="Medical Testing Problem">
              <ExampleSection title="Problem">
                <p className="text-neutral-300">
                  A rare disease affects 0.1% of the population. A test for this disease has:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-neutral-300">
                  <li>95% sensitivity (correctly identifies sick people)</li>
                  <li>98% specificity (correctly identifies healthy people)</li>
                </ul>
                <p className="text-neutral-300 mt-2">
                  If someone tests positive, what's the probability they have the disease?
                </p>
              </ExampleSection>
              
              <ExampleSection title="Step 1: Define Events">
                <div className="space-y-2">
                  <p className="text-neutral-300">Let:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-neutral-300">
                    <li>D = "Has disease"</li>
                    <li>+ = "Tests positive"</li>
                  </ul>
                  <p className="text-neutral-300 mt-2">Given information:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-neutral-300">
                    <li><span dangerouslySetInnerHTML={{ __html: `\(P(D) = 0.001\)` }} /></li>
                    <li><span dangerouslySetInnerHTML={{ __html: `\(P(+|D) = 0.95\)` }} /> (sensitivity)</li>
                    <li><span dangerouslySetInnerHTML={{ __html: `\(P(-|D^c) = 0.98 \rightarrow P(+|D^c) = 0.02\)` }} /></li>
                  </ul>
                </div>
              </ExampleSection>
              
              <ExampleSection title="Step 2: Find P(+) using Total Probability">
                <Formula>
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[P(+) = P(+|D)P(D) + P(+|D^c)P(D^c)\\]` 
                  }} />
                </Formula>
                <div className="mt-2" dangerouslySetInnerHTML={{ 
                  __html: `\\[P(+) = (0.95)(0.001) + (0.02)(0.999)\\]` 
                }} />
                <div className="mt-2" dangerouslySetInnerHTML={{ 
                  __html: `\\[P(+) = 0.00095 + 0.01998 = 0.02093\\]` 
                }} />
              </ExampleSection>
              
              <ExampleSection title="Step 3: Apply Bayes' Theorem">
                <Formula>
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[P(D|+) = \\frac{P(+|D) \\cdot P(D)}{P(+)}\\]` 
                  }} />
                </Formula>
                <div className="mt-2" dangerouslySetInnerHTML={{ 
                  __html: `\\[P(D|+) = \\frac{(0.95)(0.001)}{0.02093} = \\frac{0.00095}{0.02093} \\approx 0.0454\\]` 
                }} />
              </ExampleSection>
              
              <ExampleSection title="Answer & Interpretation">
                <div className="bg-amber-900/20 p-4 rounded border border-amber-600/30">
                  <p className="text-neutral-300">
                    Only <span className="font-bold font-mono text-amber-400">4.54%</span> chance of having the disease!
                  </p>
                  <p className="text-sm text-neutral-400 mt-2">
                    Despite the test being 95% accurate for sick people, most positive tests are false positives 
                    because the disease is so rare.
                  </p>
                </div>
              </ExampleSection>
            </WorkedExample>
            
            <InsightBox variant="warning">
              This is why doctors order follow-up tests! A single positive result for a rare 
              condition is often a false alarm.
            </InsightBox>
        </MathJaxSection>
      </SectionContent>
    )
  },
  {
    id: 'variations',
    title: 'Variations',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <MathJaxSection>
            <WorkedExample title="Common Problem Types">
              <ExampleSection title="Type 1: Multiple Conditions">
                <div className="bg-neutral-800 p-3 rounded mb-3">
                  <p className="text-neutral-300 font-semibold">Problem Pattern:</p>
                  <p className="text-sm text-neutral-300 mt-1">
                    Find P(A|B∩C) - probability given multiple conditions
                  </p>
                </div>
                <Formula>
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[P(A|B \\cap C) = \\frac{P(A \\cap B \\cap C)}{P(B \\cap C)}\\]` 
                  }} />
                </Formula>
                <p className="text-sm text-neutral-400 mt-2">
                  Example: <span dangerouslySetInnerHTML={{ __html: `\(P(\text{Rain}|\text{Cloudy} \cap \text{Humid})\)` }} />
                </p>
              </ExampleSection>
              
              <ExampleSection title="Type 2: Chain Rule">
                <div className="bg-neutral-800 p-3 rounded mb-3">
                  <p className="text-neutral-300 font-semibold">Problem Pattern:</p>
                  <p className="text-sm text-neutral-300 mt-1">
                    Find joint probability using conditional probabilities
                  </p>
                </div>
                <Formula>
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[P(A \\cap B \\cap C) = P(A) \\cdot P(B|A) \\cdot P(C|A \\cap B)\\]` 
                  }} />
                </Formula>
                <p className="text-sm text-neutral-400 mt-2">
                  Example: Drawing cards without replacement
                </p>
              </ExampleSection>
              
              <ExampleSection title="Type 3: Independence Testing">
                <div className="bg-neutral-800 p-3 rounded mb-3">
                  <p className="text-neutral-300 font-semibold">Problem Pattern:</p>
                  <p className="text-sm text-neutral-300 mt-1">
                    Check if events are independent
                  </p>
                </div>
                <div className="space-y-2 mt-3">
                  <p className="text-neutral-300">A and B are independent if:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-neutral-300">
                    <li><span dangerouslySetInnerHTML={{ __html: `\(P(A|B) = P(A)\)` }} /></li>
                    <li><span dangerouslySetInnerHTML={{ __html: `\(P(B|A) = P(B)\)` }} /></li>
                    <li><span dangerouslySetInnerHTML={{ __html: `\(P(A \cap B) = P(A) \cdot P(B)\)` }} /></li>
                  </ul>
                </div>
              </ExampleSection>
              
              <ExampleSection title="Type 4: Partition Problems">
                <div className="bg-neutral-800 p-3 rounded mb-3">
                  <p className="text-neutral-300 font-semibold">Problem Pattern:</p>
                  <p className="text-sm text-neutral-300 mt-1">
                    Events form a partition, use law of total probability
                  </p>
                </div>
                <Formula>
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[P(A) = \\sum_{i=1}^{n} P(A|B_i)P(B_i)\\]` 
                  }} />
                </Formula>
                <p className="text-sm text-neutral-400 mt-2">
                  Example: Product defects from multiple factories
                </p>
              </ExampleSection>
            </WorkedExample>
        </MathJaxSection>
      </SectionContent>
    )
  },
  {
    id: 'practice',
    title: 'Practice Time',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-neutral-200 mb-2">Practice Problems</h3>
          <p className="text-neutral-400">Practice content will be populated dynamically...</p>
        </div>
      </SectionContent>
    )
  }
];

export default function Tab2WorkedExamplesTab({ onComplete }) {
  // Move useState hook to component top level
  const [showSolutions, setShowSolutions] = React.useState(false);

  // Create sections with state passed down
  const sectionsWithState = SECTIONS.map((section, index) => {
    if (index === 3) { // Practice section
      return {
        ...section,
        content: ({ sectionIndex, isCompleted }) => (
          <SectionContent>
            <MathJaxSection>
              <WorkedExample title="Practice Problems">
                <ExampleSection title="Problem 1: Card Drawing">
                  <p className="text-neutral-300">
                    From a standard deck, you draw a card. Given that it's a face card (J, Q, K), 
                    what's the probability it's a heart?
                  </p>
                  {showSolutions && (
                    <div className="mt-3 bg-green-900/20 p-3 rounded">
                      <p className="text-sm text-neutral-300">
                        Solution: There are 12 face cards total, 3 are hearts.
                      </p>
                      <div className="mt-2" dangerouslySetInnerHTML={{ 
                        __html: `\\[P(\\text{Heart}|\\text{Face}) = \\frac{3}{12} = \\frac{1}{4}\\]` 
                      }} />
                    </div>
                  )}
                </ExampleSection>
                
                <ExampleSection title="Problem 2: Quality Control">
                  <p className="text-neutral-300">
                    A factory has two machines: A produces 60% of output with 5% defect rate, 
                    B produces 40% with 3% defect rate. If a product is defective, what's the 
                    probability it came from machine A?
                  </p>
                  {showSolutions && (
                    <div className="mt-3 bg-green-900/20 p-3 rounded">
                      <p className="text-sm text-neutral-300">Solution:</p>
                      <div className="mt-2" dangerouslySetInnerHTML={{ 
                        __html: `\\[P(A|\\text{Defect}) = \\frac{(0.05)(0.6)}{(0.05)(0.6) + (0.03)(0.4)} = \\frac{0.03}{0.042} \\approx 0.714\\]` 
                      }} />
                    </div>
                  )}
                </ExampleSection>
                
                <ExampleSection title="Problem 3: Independence Check">
                  <p className="text-neutral-300">
                    In a class, 40% study math, 30% study physics, and 20% study both. 
                    Are studying math and physics independent?
                  </p>
                  {showSolutions && (
                    <div className="mt-3 bg-green-900/20 p-3 rounded">
                      <p className="text-sm text-neutral-300">
                        Solution: Check if <span className="font-mono" dangerouslySetInnerHTML={{ __html: `\\(P(M \\cap P) = P(M) \\cdot P(P)\\)` }} />
                      </p>
                      <p className="text-sm text-neutral-300 mt-1">
                        <span className="font-mono" dangerouslySetInnerHTML={{ __html: `\\(0.20 \\neq (0.40)(0.30) = 0.12\\)` }} />
                      </p>
                      <p className="text-sm text-neutral-300 mt-1">
                        <strong>Not independent!</strong> Students who study one are more likely to study the other.
                      </p>
                    </div>
                  )}
                </ExampleSection>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowSolutions(!showSolutions)}
                    className="px-6 py-2 bg-[#3b82f6] hover:bg-[#3b82f6]/80 text-white rounded-lg transition-all duration-1500"
                  >
                    {showSolutions ? 'Hide Solutions' : 'Show Solutions'}
                  </button>
                </div>
              </WorkedExample>
              
              <InsightBox variant="success">
                Practice Tip: Try solving each problem before checking the solution. 
                Focus on identifying the given information and what you're looking for!
              </InsightBox>
            </MathJaxSection>
          </SectionContent>
        )
      };
    }
    return section;
  });

  return (
    <SectionBasedContent
      title="Worked Examples"
      description="Step-by-step solutions to exam problems"
      sections={sectionsWithState}
      onComplete={onComplete}
      chapter={1}
      progressVariant="blue"
      showBackToHub={false}
    />
  );
}