"use client";

import React, { useState, useRef, useEffect } from 'react';
import SectionBasedContent, { 
  SectionContent, 
  MathFormula, 
  InteractiveElement 
} from '@/components/ui/SectionBasedContent';
import { WorkedExample, ExampleSection, InsightBox, Formula } from '@/components/ui/WorkedExample';
import { Button } from '@/components/ui/button';

// MathJax processing helper
const processMathJax = (ref) => {
  if (typeof window !== "undefined" && window.MathJax?.typesetPromise && ref.current) {
    if (window.MathJax.typesetClear) {
      window.MathJax.typesetClear([ref.current]);
    }
    window.MathJax.typesetPromise([ref.current]).catch(console.error);
  }
};

const SECTIONS = [
  {
    id: 'challenge',
    title: 'Can You Solve This?',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/30">
          <h4 className="font-semibold text-amber-400 mb-3">
            📝 A Real Exam Problem:
          </h4>
          <p className="text-neutral-300 mb-3">
            A data science team of 5 people needs to be selected from 12 qualified candidates for a special project at Google. 
            How many different teams can be formed?
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-neutral-400">Quick: Can you figure out...</p>
            <ul className="list-disc list-inside text-sm text-neutral-400 ml-4">
              <li>Does the order of selection matter here?</li>
              <li>Is this a permutation or combination problem?</li>
              <li>What's the formula you should use?</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-neutral-400">
          If you're unsure whether to use permutations or combinations, you're not alone! 
          This section will make the distinction crystal clear.
        </p>
      </SectionContent>
    )
  },
  {
    id: 'intuition',
    title: 'Building Intuition',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <WorkedExample title="Order Matters vs. Order Doesn't Matter">
          <ExampleSection title="The Key Question">
            <p className="mb-4 text-neutral-300">
              Before solving any counting problem, ask yourself:
            </p>
            <div className="bg-blue-900/20 p-4 rounded-lg mb-4">
              <p className="font-semibold text-blue-400 text-center text-lg">
                "Does changing the order create a different outcome?"
              </p>
            </div>
          </ExampleSection>
          
          <ExampleSection title="Real-World Examples">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-900/20 p-4 rounded-lg border border-green-600/30">
                <h5 className="font-semibold text-green-400 mb-2">✓ Order DOESN'T Matter (Combinations)</h5>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li>• Selecting a committee of 3 from 10 people</li>
                  <li>• Choosing 6 lottery numbers from 49</li>
                  <li>• Picking 4 pizza toppings from 10 options</li>
                  <li>• Forming a study group of 5 students</li>
                </ul>
              </div>
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
                <h5 className="font-semibold text-red-400 mb-2">✗ Order DOES Matter (Permutations)</h5>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li>• Assigning President, VP, Secretary roles</li>
                  <li>• Creating a 4-digit PIN code</li>
                  <li>• Ranking top 3 contestants</li>
                  <li>• Arranging books on a shelf</li>
                </ul>
              </div>
            </div>
          </ExampleSection>
        </WorkedExample>
        
        <InsightBox variant="info">
          💡 Key Insight: Combinations count unique groups. If {"{Alice, Bob, Charlie}"} is the same as 
          {"{Charlie, Alice, Bob}"} for your problem, you need combinations!
        </InsightBox>
      </SectionContent>
    )
  },
  {
    id: 'formal-definition',
    title: 'Formal Definition',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <WorkedExample title="The Combination Formula">
          <ExampleSection title="Mathematical Definition">
            <Formula>
              <div className="text-center">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[C(n,r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}\\]` 
                }} />
              </div>
            </Formula>
            <p className="mt-2 text-sm text-neutral-400 text-center">
              Choose r items from n items (order doesn't matter)
            </p>
          </ExampleSection>
          
          <ExampleSection title="Why This Formula Works">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-purple-900/20 p-3 rounded-lg flex-shrink-0">
                  <span className="text-2xl">1️⃣</span>
                </div>
                <div>
                  <p className="font-semibold text-purple-400">Start with permutations</p>
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\(P(n,r) = \\frac{n!}{(n-r)!}\\)` 
                  }} />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-purple-900/20 p-3 rounded-lg flex-shrink-0">
                  <span className="text-2xl">2️⃣</span>
                </div>
                <div>
                  <p className="font-semibold text-purple-400">Each group counted r! times</p>
                  <p className="text-sm text-neutral-400">Because r items can be arranged in r! ways</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-purple-900/20 p-3 rounded-lg flex-shrink-0">
                  <span className="text-2xl">3️⃣</span>
                </div>
                <div>
                  <p className="font-semibold text-purple-400">Divide by r!</p>
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\(C(n,r) = \\frac{P(n,r)}{r!} = \\frac{n!}{r!(n-r)!}\\)` 
                  }} />
                </div>
              </div>
            </div>
          </ExampleSection>
          
          <ExampleSection title="Important Properties">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-neutral-800 p-3 rounded">
                <p className="text-sm font-semibold text-cyan-400 mb-1">Symmetry</p>
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\(C(n,r) = C(n,n-r)\\)` 
                }} />
              </div>
              <div className="bg-neutral-800 p-3 rounded">
                <p className="text-sm font-semibold text-cyan-400 mb-1">Pascal's Identity</p>
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\(C(n,r) = C(n-1,r-1) + C(n-1,r)\\)` 
                }} />
              </div>
            </div>
          </ExampleSection>
        </WorkedExample>
      </SectionContent>
    )
  },
  {
    id: 'why-matters',
    title: 'Why This Matters',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-4 rounded-lg border border-indigo-600/30">
            <h4 className="font-semibold text-indigo-400 mb-3">
              🚀 Applications in Tech & AI
            </h4>
            <div className="space-y-3">
              <div className="border-l-4 border-indigo-500 pl-4">
                <p className="font-semibold text-neutral-200">Machine Learning</p>
                <p className="text-sm text-neutral-400">
                  Feature selection: Choosing k features from n total features for model training
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="font-semibold text-neutral-200">A/B Testing</p>
                <p className="text-sm text-neutral-400">
                  Selecting test groups: How many ways to choose control groups from user population
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-semibold text-neutral-200">Data Science Teams</p>
                <p className="text-sm text-neutral-400">
                  Team formation at companies like Google, Meta, Amazon for cross-functional projects
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-900/20 p-4 rounded-lg border border-green-600/30">
            <h4 className="font-semibold text-green-400 mb-2">
              ✅ Career Relevance
            </h4>
            <p className="text-neutral-300 mb-2">
              Combinations appear in technical interviews at top tech companies:
            </p>
            <ul className="list-disc list-inside text-sm text-neutral-300 ml-4 space-y-1">
              <li>Algorithm complexity analysis (choosing k elements from n)</li>
              <li>Database query optimization (index selection)</li>
              <li>Network reliability (choosing backup servers)</li>
              <li>Distributed systems (quorum selection)</li>
            </ul>
          </div>
          
          <InsightBox variant="success">
            🎯 Master combinations now → Excel in probability theory → 
            Ace statistics courses → Land data science roles at top companies
          </InsightBox>
        </div>
      </SectionContent>
    )
  }
];

export default function FoundationsTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Foundations of Combinations"
      description="Master the art of counting when order doesn't matter"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="green"
      showBackToHub={false}
      showHeader={false}
    />
  );
}