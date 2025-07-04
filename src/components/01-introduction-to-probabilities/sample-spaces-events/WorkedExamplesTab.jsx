"use client";

import React, { useState, useRef, useEffect } from 'react';
import SectionBasedContent, { 
  SectionContent, 
  MathFormula, 
  InteractiveElement 
} from '@/components/ui/SectionBasedContent';
import { WorkedExample, ExampleSection, CalculationSteps, InsightBox } from '@/components/ui/WorkedExample';
import { Button } from '@/components/ui/button';
import * as d3 from "@/utils/d3-utils";
import VennDiagramSection from './VennDiagramSection';

const SECTIONS = [
  {
    id: 'basic-example',
    title: 'Basic Example: Coin Flips',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <WorkedExample title="Two Coin Flips - Complete Analysis">
          <CalculationSteps
            steps={[
              { 
                label: "Step 1: Define the experiment",
                content: "Flip a fair coin twice and record the results",
                explanation: "Always start by clearly stating what we're doing"
              },
              {
                label: "Step 2: List the sample space",
                content: "\\(S = \\{\\text{HH}, \\text{HT}, \\text{TH}, \\text{TT}\\}\\)",
                explanation: "List ALL possible outcomes systematically"
              },
              {
                label: "Step 3: Define events of interest",
                content: "A = 'at least one head' = \\{\\text{HH}, \\text{HT}, \\text{TH}\\}",
                explanation: "Convert words to specific outcomes"
              },
              {
                label: "Step 4: Calculate probability",
                content: "\\(P(A) = \\frac{|A|}{|S|} = \\frac{3}{4} = 0.75\\)",
                explanation: "Count favorable outcomes ÷ total outcomes"
              }
            ]}
          />
          
          <InsightBox variant="warning">
            ⚠️ Common Mistake: Students often write S = {"{H, T}"} forgetting we need 
            ORDERED pairs for two flips!
          </InsightBox>
        </WorkedExample>
      </SectionContent>
    )
  },
  {
    id: 'exam-level',
    title: 'Exam-Level: Quality Control',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <WorkedExample title="Circuit Board Testing (From Opening Question)">
          <ExampleSection title="Problem">
            <p className="text-neutral-300">
              Quality control test has 40% failure rate. Testing 3 boards, 
              find P(at least one passes).
            </p>
          </ExampleSection>
          
          <CalculationSteps
            steps={[
              { 
                label: "Step 1: Define outcomes",
                content: "P = Pass (60%), F = Fail (40%)",
                explanation: "Convert percentages to probabilities"
              },
              {
                label: "Step 2: Sample space for 3 tests",
                content: "\\(S = \\{\\text{PPP}, \\text{PPF}, \\text{PFP}, \\text{PFF}, \\text{FPP}, \\text{FPF}, \\text{FFP}, \\text{FFF}\\}\\)",
                explanation: "2³ = 8 total outcomes"
              },
              {
                label: "Step 3: Event 'at least one passes'",
                content: "A = all outcomes except FFF",
                explanation: "Complement is often easier!"
              },
              {
                label: "Step 4: Use complement",
                content: "\\(P(A) = 1 - P(FFF) = 1 - (0.4)^3 = 1 - 0.064 = 0.936\\)",
                explanation: "P(all fail) = 0.4 × 0.4 × 0.4"
              }
            ]}
          />
          
          <div className="mt-4 bg-green-900/20 p-3 rounded-lg border border-green-600/30">
            <p className="text-sm font-semibold text-green-400">
              ✅ Answer: 93.6% chance at least one board passes
            </p>
          </div>
        </WorkedExample>
      </SectionContent>
    )
  },
  {
    id: 'variations',
    title: 'Variations You\'ll See',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="space-y-6">
          <WorkedExample title="Type 1: Discrete with Replacement">
            <ExampleSection title="Draw 2 cards with replacement from {A♠, K♥, Q♦}">
              <p className="text-neutral-300 mb-2">Sample space has 3² = 9 outcomes:</p>
              <div className="bg-neutral-800 p-3 rounded font-mono text-sm">
                {`S = {(A♠,A♠), (A♠,K♥), (A♠,Q♦), (K♥,A♠), (K♥,K♥), (K♥,Q♦), (Q♦,A♠), (Q♦,K♥), (Q♦,Q♦)}`}
              </div>
            </ExampleSection>
          </WorkedExample>
          
          <WorkedExample title="Type 2: Discrete without Replacement">
            <ExampleSection title="Same cards, but WITHOUT replacement">
              <p className="text-neutral-300 mb-2">Now only 3×2 = 6 outcomes:</p>
              <div className="bg-neutral-800 p-3 rounded font-mono text-sm">
                {`S = {(A♠,K♥), (A♠,Q♦), (K♥,A♠), (K♥,Q♦), (Q♦,A♠), (Q♦,K♥)}`}
              </div>
              <p className="text-xs text-neutral-400 mt-2">Note: Can't draw same card twice!</p>
            </ExampleSection>
          </WorkedExample>
          
          <WorkedExample title="Type 3: Continuous Sample Space">
            <ExampleSection title="Measure weight of chemical sample">
              <MathFormula>
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\(S = (0, \\infty)\\) (all positive real numbers)` 
                }} />
              </MathFormula>
              <p className="text-neutral-300 mt-2">Events like:</p>
              <ul className="list-disc list-inside text-sm text-neutral-400 ml-4">
                <li>A = "weight less than 5g" = (0, 5)</li>
                <li>B = "weight between 3g and 7g" = [3, 7]</li>
              </ul>
            </ExampleSection>
          </WorkedExample>
        </div>
      </SectionContent>
    )
  },
  {
    id: 'practice',
    title: 'Practice Time',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <InteractiveElement title="Interactive Venn Diagram Explorer">
          <div className="mb-4 bg-purple-900/20 p-3 rounded-lg">
            <p className="text-sm text-purple-300">
              🎯 Use the existing Venn diagram tool to practice set operations!
            </p>
          </div>
          
          {/* Integrate the existing Venn diagram component */}
          <VennDiagramSection />
          
          <div className="mt-4 space-y-2">
            <h5 className="font-semibold text-neutral-300">Try these:</h5>
            <ol className="list-decimal list-inside text-sm text-neutral-400 ml-4 space-y-1">
              <li>Create A ∪ B (union)</li>
              <li>Create A ∩ B (intersection)</li>
              <li>Create A' (complement)</li>
              <li>Verify De Morgan's Law: (A∪B)' = A'∩B'</li>
            </ol>
          </div>
        </InteractiveElement>
      </SectionContent>
    )
  }
];

export default function WorkedExamplesTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Worked Examples"
      description="Step-by-step solutions to build your skills"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="blue"
    />
  );
}