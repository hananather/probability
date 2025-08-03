"use client";

import React, { useState, useRef, useEffect } from 'react';
import SectionBasedContent, { 
  SectionContent, 
  MathFormula, 
  InteractiveElement 
} from '@/components/ui/SectionBasedContent';
import { WorkedExample, ExampleSection, InsightBox, Formula } from '@/components/ui/WorkedExample';
import { Button } from '@/components/ui/button';
import { VisualizationSection } from '@/components/ui/VisualizationContainer';
import { useMathJax } from '@/hooks/useMathJax';

// Practice section component - extracted to use hooks properly
const PracticeSection = ({ showSolutions, toggleSolution }) => {
  const contentRef = useRef(null);
  
  // Process MathJax when solutions are toggled
  useEffect(() => {
    if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
      window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
    }
  }, [showSolutions.p1, showSolutions.p2, showSolutions.p3]);
  
  return (
    <SectionContent>
      <div ref={contentRef} className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-neutral-200">Test Your Skills!</h3>
          <p className="text-neutral-400">Try these problems, then check your answers</p>
        </div>
      
        {/* Problem 1 */}
        <div className="bg-neutral-800 p-4 rounded-lg">
          <p className="font-semibold text-amber-400 mb-2">Problem 1: Lottery Selection</p>
          <p className="text-neutral-300 mb-3">
            In a 6/49 lottery, you choose 6 numbers from 1 to 49. What's the probability of winning the jackpot?
          </p>
          <Button 
            variant="info" 
            size="sm"
            onClick={() => toggleSolution('p1')}
          >
            {showSolutions.p1 ? 'Hide' : 'Show'} Solution
          </Button>
          
          {showSolutions.p1 && (
            <div className="mt-4 bg-neutral-900 p-4 rounded">
              <div className="text-center">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[C(49,6) = \\frac{49!}{6!43!} = 13,983,816\\]` 
                }} />
              </div>
              <p className="text-sm text-neutral-300 mt-2">
                Probability = 1/13,983,816 ≈ 0.0000000715
              </p>
            </div>
          )}
        </div>
        
        {/* Problem 2 */}
        <div className="bg-neutral-800 p-4 rounded-lg">
          <p className="font-semibold text-amber-400 mb-2">Problem 2: Pizza Toppings</p>
          <p className="text-neutral-300 mb-3">
            A pizza shop offers 12 toppings. How many different 4-topping pizzas can you make?
          </p>
          <Button 
            variant="info" 
            size="sm"
            onClick={() => toggleSolution('p2')}
          >
            {showSolutions.p2 ? 'Hide' : 'Show'} Solution
          </Button>
          
          {showSolutions.p2 && (
            <div className="mt-4 bg-neutral-900 p-4 rounded">
              <div className="text-center">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[C(12,4) = \\frac{12!}{4!8!} = \\frac{12 \\times 11 \\times 10 \\times 9}{4 \\times 3 \\times 2 \\times 1} = 495\\]` 
                }} />
              </div>
            </div>
          )}
        </div>
        
        {/* Problem 3 */}
        <div className="bg-neutral-800 p-4 rounded-lg">
          <p className="font-semibold text-amber-400 mb-2">Problem 3: Scientific Peer Review</p>
          <p className="text-neutral-300 mb-3">
            A journal has 20 submitted papers and can only publish 5 in their special issue. 
            If your paper is among the submissions, what's the probability it gets selected?
          </p>
          <Button 
            variant="info" 
            size="sm"
            onClick={() => toggleSolution('p3')}
          >
            {showSolutions.p3 ? 'Hide' : 'Show'} Solution
          </Button>
          
          {showSolutions.p3 && (
            <div className="mt-4 bg-neutral-900 p-4 rounded">
              <p className="text-sm text-neutral-300 mb-2">
                Ways your paper is selected: C(19,4) = 3,876<br/>
                Total ways to select 5 papers: C(20,5) = 15,504
              </p>
              <div className="text-center">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[P(\\text{selected}) = \\frac{C(19,4)}{C(20,5)} = \\frac{3,876}{15,504} = \\frac{5}{20} = 0.25\\]` 
                }} />
              </div>
              <p className="text-sm text-neutral-400 mt-2">
                The probability equals 5/20, which makes intuitive sense: 5 slots for 20 papers.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <InsightBox variant="info" className="mt-6">
        These examples demonstrate how combinations appear naturally when order doesn't matter. 
        The key insight: C(n,r) counts selections, not arrangements.
      </InsightBox>
    </SectionContent>
  );
};

const SECTIONS = [
  {
    id: 'basic-example',
    title: 'Basic Example',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useMathJax([]);
      
      return (
        <SectionContent>
          <div ref={contentRef}>
            <WorkedExample title="Team Selection Problem">
          <ExampleSection title="Problem">
            <div className="bg-blue-900/20 p-4 rounded-lg">
              <p className="text-neutral-300">
                From a class of 8 students, how many ways can we form a study group of 3 students?
              </p>
            </div>
          </ExampleSection>
          
          <ExampleSection title="Solution Steps">
            <div className="space-y-4">
              <div className="border-l-4 border-cyan-500 pl-4">
                <p className="font-semibold text-cyan-400">Step 1: Identify the type</p>
                <p className="text-sm text-neutral-300">
                  Does order matter? No - {"{Alice, Bob, Charlie}"} is the same group as {"{Charlie, Alice, Bob}"}
                </p>
                <p className="text-sm text-green-400 mt-1">→ Use combinations!</p>
              </div>
              
              <div className="border-l-4 border-cyan-500 pl-4">
                <p className="font-semibold text-cyan-400">Step 2: Identify n and r</p>
                <p className="text-sm text-neutral-300">
                  • n = 8 (total students)<br/>
                  • r = 3 (students to select)
                </p>
              </div>
              
              <div className="border-l-4 border-cyan-500 pl-4">
                <p className="font-semibold text-cyan-400">Step 3: Apply the formula</p>
                <div className="text-center">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[C(8,3) = \\frac{8!}{3!(8-3)!} = \\frac{8!}{3! \\cdot 5!}\\]` 
                  }} />
                </div>
              </div>
              
              <div className="border-l-4 border-cyan-500 pl-4">
                <p className="font-semibold text-cyan-400">Step 4: Calculate</p>
                <div className="bg-neutral-800 p-3 rounded mt-2 font-mono text-sm">
                  <div className="text-center">
                    <span dangerouslySetInnerHTML={{ 
                      __html: `\\begin{align}
                      C(8,3) &= \\frac{8 \\times 7 \\times 6 \\times 5!}{3! \\times 5!} \\\\
                      &= \\frac{8 \\times 7 \\times 6}{3 \\times 2 \\times 1} \\\\
                      &= \\frac{336}{6} \\\\
                      &= 56
                      \\end{align}` 
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </ExampleSection>
          
          <ExampleSection title="Answer">
            <div className="bg-green-900/20 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-400">56 different study groups</p>
            </div>
          </ExampleSection>
        </WorkedExample>
        
            <InsightBox variant="tip">
              Pro Tip: Cancel out factorials early! Notice how 5! canceled out immediately, 
              saving us from calculating large numbers.
            </InsightBox>
          </div>
        </SectionContent>
      );
    }
  },
  {
    id: 'exam-level',
    title: 'Exam-Level Example',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useMathJax([]);
      
      return (
        <SectionContent>
          <div ref={contentRef}>
            <WorkedExample title="Complex Selection with Constraints">
          <ExampleSection title="Problem">
            <div className="bg-amber-900/20 p-4 rounded-lg">
              <p className="text-neutral-300 mb-2">
                A tech company needs to form a diversity committee from its employees:
              </p>
              <ul className="list-disc list-inside text-sm text-neutral-300 ml-4">
                <li>10 engineers</li>
                <li>8 designers</li>
                <li>6 product managers</li>
              </ul>
              <p className="text-neutral-300 mt-2">
                The committee must have exactly 2 people from each department. How many ways can this be done?
              </p>
            </div>
          </ExampleSection>
          
          <ExampleSection title="Solution Strategy">
            <div className="bg-purple-900/20 p-4 rounded-lg">
              <p className="font-semibold text-purple-400 mb-2">Key Insight:</p>
              <p className="text-neutral-300">
                When selecting from multiple groups, multiply the number of ways for each group!
              </p>
            </div>
          </ExampleSection>
          
          <ExampleSection title="Detailed Solution">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-neutral-800 p-3 rounded">
                  <p className="text-sm font-semibold text-cyan-400 mb-2">Engineers</p>
                  <div className="text-center">
                    <span dangerouslySetInnerHTML={{ 
                      __html: `\\[C(10,2) = \\frac{10!}{2!8!} = 45\\]` 
                    }} />
                  </div>
                </div>
                <div className="bg-neutral-800 p-3 rounded">
                  <p className="text-sm font-semibold text-green-400 mb-2">Designers</p>
                  <div className="text-center">
                    <span dangerouslySetInnerHTML={{ 
                      __html: `\\[C(8,2) = \\frac{8!}{2!6!} = 28\\]` 
                    }} />
                  </div>
                </div>
                <div className="bg-neutral-800 p-3 rounded">
                  <p className="text-sm font-semibold text-orange-400 mb-2">Product Managers</p>
                  <div className="text-center">
                    <span dangerouslySetInnerHTML={{ 
                      __html: `\\[C(6,2) = \\frac{6!}{2!4!} = 15\\]` 
                    }} />
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-900/20 p-4 rounded-lg">
                <p className="font-semibold text-indigo-400 mb-2">Final Calculation:</p>
                <div className="text-center">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[\\text{Total ways} = C(10,2) \\times C(8,2) \\times C(6,2) = 45 \\times 28 \\times 15 = 18,900\\]` 
                  }} />
                </div>
              </div>
            </div>
          </ExampleSection>
          
          <ExampleSection title="Answer">
            <div className="bg-green-900/20 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-400">18,900 different committees</p>
            </div>
          </ExampleSection>
        </WorkedExample>
        
        <InsightBox variant="warning">
          Common Mistake: Don't add the combinations - multiply them! 
          This is the multiplication principle in action.
        </InsightBox>
          </div>
        </SectionContent>
      );
    }
  },
  {
    id: 'variations',
    title: 'Variations',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useMathJax([]);
      
      return (
        <SectionContent>
          <div ref={contentRef}>
            <WorkedExample title="Common Variations You'll Encounter">
          <ExampleSection title="Type 1: At Least / At Most">
            <div className="bg-blue-900/20 p-4 rounded-lg mb-4">
              <p className="font-semibold text-blue-400">Problem:</p>
              <p className="text-neutral-300">
                From 10 items, choose at least 2 but at most 4 items.
              </p>
            </div>
            <div className="bg-neutral-800 p-3 rounded">
              <p className="text-sm font-semibold text-cyan-400 mb-2">Solution:</p>
              <div className="text-center">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[C(10,2) + C(10,3) + C(10,4) = 45 + 120 + 210 = 375\\]` 
                }} />
              </div>
            </div>
          </ExampleSection>
          
          <ExampleSection title="Type 2: Complementary Counting">
            <div className="bg-purple-900/20 p-4 rounded-lg mb-4">
              <p className="font-semibold text-purple-400">Problem:</p>
              <p className="text-neutral-300">
                From 12 people, form a committee with at least 1 person.
              </p>
            </div>
            <div className="bg-neutral-800 p-3 rounded">
              <p className="text-sm font-semibold text-cyan-400 mb-2">Smart Solution:</p>
              <p className="text-sm text-neutral-300 mb-2">
                Total ways to select any number - Ways to select 0:
              </p>
              <div className="text-center">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[2^{12} - 1 = 4096 - 1 = 4095\\]` 
                }} />
              </div>
            </div>
          </ExampleSection>
          
          <ExampleSection title="Type 3: Special Positions">
            <div className="bg-green-900/20 p-4 rounded-lg mb-4">
              <p className="font-semibold text-green-400">Problem:</p>
              <p className="text-neutral-300">
                From 15 students, select 5 for a team where Alice must be included.
              </p>
            </div>
            <div className="bg-neutral-800 p-3 rounded">
              <p className="text-sm font-semibold text-cyan-400 mb-2">Solution:</p>
              <p className="text-sm text-neutral-300 mb-2">
                Alice is already selected, choose 4 more from remaining 14:
              </p>
              <div className="text-center">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[C(14,4) = \\frac{14!}{4!10!} = 1001\\]` 
                }} />
              </div>
            </div>
          </ExampleSection>
        </WorkedExample>
        
        <VisualizationSection className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-semibold text-neutral-200 mb-3">Quick Reference Pattern</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-neutral-800 p-3 rounded">
              <p className="font-mono text-cyan-400">"at least k"</p>
              <p className="text-neutral-400">= Sum from k to n</p>
            </div>
            <div className="bg-neutral-800 p-3 rounded">
              <p className="font-mono text-cyan-400">"at most k"</p>
              <p className="text-neutral-400">= Sum from 0 to k</p>
            </div>
            <div className="bg-neutral-800 p-3 rounded">
              <p className="font-mono text-cyan-400">"exactly k"</p>
              <p className="text-neutral-400">= Just C(n,k)</p>
            </div>
            <div className="bg-neutral-800 p-3 rounded">
              <p className="font-mono text-cyan-400">"not including X"</p>
              <p className="text-neutral-400">= C(n-1,r)</p>
            </div>
          </div>
        </VisualizationSection>
          </div>
        </SectionContent>
      );
    }
  },
  {
    id: 'practice',
    title: 'Practice Time',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-neutral-200">Test Your Skills!</h3>
          <p className="text-neutral-400">Try these problems, then check your answers</p>
        </div>
        <p className="text-neutral-400">Practice content will be populated dynamically...</p>
      </SectionContent>
    )
  }
];

export default function WorkedExamplesTab({ onComplete }) {
  // Move the useState hook to component top level
  const [showSolutions, setShowSolutions] = useState({
    p1: false,
    p2: false,
    p3: false
  });
  
  const toggleSolution = (problem) => {
    setShowSolutions(prev => ({ ...prev, [problem]: !prev[problem] }));
  };

  // Create sections with state passed down
  const sectionsWithState = SECTIONS.map((section, index) => {
    if (index === 3) { // Practice section
      return {
        ...section,
        content: ({ sectionIndex, isCompleted }) => (
          <PracticeSection 
            showSolutions={showSolutions}
            toggleSolution={toggleSolution}
          />
        )
      };
    }
    return section;
  });

  return (
    <SectionBasedContent
      title="Worked Examples"
      description="Step-by-step solutions to build your problem-solving skills"
      sections={sectionsWithState}
      onComplete={onComplete}
      chapter={1}
      progressVariant="blue"
      showBackToHub={false}
    />
  );
}