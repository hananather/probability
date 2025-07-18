"use client";

import React, { useState } from 'react';
import SectionBasedContent, { 
  SectionContent, 
  MathFormula 
} from '@/components/ui/SectionBasedContent';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const SECTIONS = [
  {
    id: 'formula-sheet',
    title: 'Formula Cheat Sheet',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="space-y-4">
          <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-600/30">
            <h4 className="font-semibold text-purple-400 mb-3">
              📐 Essential Set Operations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-900 p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-neutral-300">Union (OR)</span>
                  <MathFormula block={false}>
                    <span dangerouslySetInnerHTML={{ __html: `\\(A \\cup B\\)` }} />
                  </MathFormula>
                </div>
                <p className="text-xs text-neutral-400">Elements in A OR B (or both)</p>
              </div>
              
              <div className="bg-neutral-900 p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-neutral-300">Intersection (AND)</span>
                  <MathFormula block={false}>
                    <span dangerouslySetInnerHTML={{ __html: `\\(A \\cap B\\)` }} />
                  </MathFormula>
                </div>
                <p className="text-xs text-neutral-400">Elements in BOTH A and B</p>
              </div>
              
              <div className="bg-neutral-900 p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-neutral-300">Complement (NOT)</span>
                  <MathFormula block={false}>
                    <span dangerouslySetInnerHTML={{ __html: `\\(A^c\\)` }} />
                  </MathFormula>
                </div>
                <p className="text-xs text-neutral-400">Everything NOT in A</p>
              </div>
              
              <div className="bg-neutral-900 p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-neutral-300">Difference</span>
                  <MathFormula block={false}>
                    <span dangerouslySetInnerHTML={{ __html: `\\(A - B\\)` }} />
                  </MathFormula>
                </div>
                <p className="text-xs text-neutral-400">In A but NOT in B</p>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/30">
            <h4 className="font-semibold text-amber-400 mb-3">
              🎯 De Morgan's Laws (MEMORIZE THESE!)
            </h4>
            <div className="space-y-2">
              <div className="bg-neutral-900 p-3 rounded">
                <MathFormula>
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\((A \\cup B)^c = A^c \\cap B^c\\)` 
                  }} />
                </MathFormula>
                <p className="text-xs text-neutral-400 mt-1">NOT (A or B) = (NOT A) and (NOT B)</p>
              </div>
              <div className="bg-neutral-900 p-3 rounded">
                <MathFormula>
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\((A \\cap B)^c = A^c \\cup B^c\\)` 
                  }} />
                </MathFormula>
                <p className="text-xs text-neutral-400 mt-1">NOT (A and B) = (NOT A) or (NOT B)</p>
              </div>
            </div>
          </div>
        </div>
      </SectionContent>
    )
  },
  {
    id: 'decision-guide',
    title: 'Decision Guide',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
          <h4 className="font-semibold text-blue-400 mb-3">
            🔍 When to Use What
          </h4>
          <div className="space-y-3">
            <div className="border-l-4 border-green-500 pl-3">
              <p className="font-semibold text-green-400">See "at least one"?</p>
              <p className="text-sm text-neutral-300">→ Use complement! P(at least one) = 1 - P(none)</p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-3">
              <p className="font-semibold text-yellow-400">See "or"?</p>
              <p className="text-sm text-neutral-300">→ Use union: A ∪ B</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-3">
              <p className="font-semibold text-purple-400">See "and"?</p>
              <p className="text-sm text-neutral-300">→ Use intersection: A ∩ B</p>
            </div>
            
            <div className="border-l-4 border-red-500 pl-3">
              <p className="font-semibold text-red-400">See "not" or "except"?</p>
              <p className="text-sm text-neutral-300">→ Use complement: A^c</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-3">
              <p className="font-semibold text-blue-400">See "exactly one"?</p>
              <p className="text-sm text-neutral-300">→ Use (A ∩ B^c) ∪ (A^c ∩ B)</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 bg-neutral-800 p-4 rounded-lg">
          <h5 className="font-semibold text-neutral-300 mb-2">Quick Translation Guide:</h5>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-neutral-400">"A but not B"</div>
            <div className="font-mono">A ∩ B^c</div>
            <div className="text-neutral-400">"Neither A nor B"</div>
            <div className="font-mono">(A ∪ B)^c</div>
            <div className="text-neutral-400">"Not both"</div>
            <div className="font-mono">(A ∩ B)^c</div>
            <div className="text-neutral-400">"At most one"</div>
            <div className="font-mono">(A ∩ B)^c</div>
          </div>
        </div>
      </SectionContent>
    )
  },
  {
    id: 'common-mistakes',
    title: 'Avoid These Mistakes',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="space-y-4">
          <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
            <h4 className="font-semibold text-red-400 mb-3">
              ❌ Top 5 Exam Mistakes
            </h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-red-400 font-bold">1.</span>
                <div>
                  <p className="font-semibold text-neutral-300">Forgetting order matters</p>
                  <p className="text-sm text-neutral-400">
                    {`(H,T) ≠ (T,H) when order is important!`}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-red-400 font-bold">2.</span>
                <div>
                  <p className="font-semibold text-neutral-300">Wrong sample space size</p>
                  <p className="text-sm text-neutral-400">
                    3 coins = 2³ = 8 outcomes, not 3!
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-red-400 font-bold">3.</span>
                <div>
                  <p className="font-semibold text-neutral-300">Mixing AND/OR</p>
                  <p className="text-sm text-neutral-400">
                    "A and B" → intersection (∩), not union (∪)
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-red-400 font-bold">4.</span>
                <div>
                  <p className="font-semibold text-neutral-300">Complement confusion</p>
                  <p className="text-sm text-neutral-400">
                    A^c includes EVERYTHING not in A, not just B
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-red-400 font-bold">5.</span>
                <div>
                  <p className="font-semibold text-neutral-300">Missing "at least one" trick</p>
                  <p className="text-sm text-neutral-400">
                    Always use 1 - P(none) for "at least one"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionContent>
    )
  },
  {
    id: 'speed-practice',
    title: 'Speed Practice',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="space-y-4">
          <div className="bg-purple-900/20 p-3 rounded-lg">
            <p className="text-sm text-purple-300">
              ⏱️ Try to solve each in under 1 minute!
            </p>
          </div>
          
          {[
            {
              q: "Roll two dice. P(sum = 7)?",
              a: "6/36 = 1/6",
              hint: "Favorable: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1)"
            },
            {
              q: "Draw 2 cards from {A,2,3,4}. P(at least one ace)?",
              a: "With replacement: 7/16, Without: 1/2",
              hint: "Use complement: 1 - P(no aces)"
            },
            {
              q: "S = {1,2,3,4,5}, A = {1,2,3}, B = {3,4}. Find (A∪B)^c",
              a: "{5}",
              hint: "First find A∪B = {1,2,3,4}, then complement"
            },
            {
              q: "3 components tested. P(all work) = ?",
              a: "If P(work) = 0.9: (0.9)³ = 0.729",
              hint: "Independent events multiply"
            },
            {
              q: "Prove: A∩(B∪C) = (A∩B)∪(A∩C)",
              a: "Draw Venn diagram - both shade same region",
              hint: "This is the distributive law"
            }
          ].map((problem, idx) => (
            <PracticeCard key={idx} number={idx + 1} {...problem} />
          ))}
        </div>
      </SectionContent>
    )
  }
];

function PracticeCard({ number, q, a, hint }) {
  const [showAnswer, setShowAnswer] = useState(false);
  
  return (
    <div className="bg-neutral-900 p-4 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h5 className="font-semibold text-neutral-300">Problem {number}</h5>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          {showAnswer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showAnswer ? 'Hide' : 'Show'} Answer
        </Button>
      </div>
      <p className="text-neutral-300 mb-2">{q}</p>
      {showAnswer && (
        <div className="mt-3 space-y-2 border-t border-neutral-700 pt-3">
          <div className="bg-green-900/20 p-2 rounded">
            <p className="text-sm text-green-400 font-semibold">Answer: {a}</p>
          </div>
          <p className="text-xs text-neutral-400">Hint: {hint}</p>
        </div>
      )}
    </div>
  );
}

export default function QuickReferenceTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Quick Reference"
      description="Everything you need for the exam in one place"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="violet"
    />
  );
}