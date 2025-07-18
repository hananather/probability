"use client";

import React from 'react';
import SectionBasedContent, { 
  SectionContent, 
  InteractiveElement 
} from '@/components/ui/SectionBasedContent';

const SECTIONS = [
  {
    id: 'challenge',
    title: 'Can You Solve This?',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/30">
          <h4 className="text-lg font-semibold text-amber-400 mb-3">
            📝 Real Interview Question:
          </h4>
          <p className="text-neutral-300 mb-3">
            You have 10 unique ML models that need to be deployed in a specific order to 3 different 
            cloud servers. Each server runs one model. How many different deployment configurations 
            are possible if:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-neutral-300 ml-4">
            <li>You can reuse the same model on multiple servers?</li>
            <li>Each model can only be deployed once?</li>
          </ol>
          <div className="mt-4 bg-neutral-800 p-3 rounded">
            <p className="text-sm text-neutral-400">Think about:</p>
            <ul className="list-disc list-inside text-sm text-neutral-400 ml-4 mt-2">
              <li>Does the order of deployment matter?</li>
              <li>What changes when models can't be reused?</li>
              <li>How would you calculate each scenario?</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-neutral-400">
          This is a classic ordered sampling (permutation) problem. Let's build the intuition 
          to solve it quickly and confidently.
        </p>
      </SectionContent>
    )
  },
  {
    id: 'intuition',
    title: 'Building Intuition',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="bg-neutral-800 p-6 rounded-lg">
          <h4 className="text-lg font-semibold border-b border-neutral-600 pb-2 mb-4 text-white">
            Understanding Ordered Sampling
          </h4>
          <div className="text-neutral-200">
            <div className="mb-4">
              <p className="mb-2 font-medium text-purple-400">When Order Matters</p>
              <p className="mb-4 text-neutral-300">
                Ordered sampling (permutations) is about arranging items where position matters:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold text-blue-400 mb-2">Real-world Examples:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300">
                    <li>Password combinations</li>
                    <li>Race finishing positions</li>
                    <li>Task scheduling order</li>
                    <li>DNA sequences</li>
                  </ul>
                </div>
                <div className="bg-green-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-400 mb-2">In Tech/ML:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300">
                    <li>Model pipeline order</li>
                    <li>A/B test sequences</li>
                    <li>Server deployment order</li>
                    <li>Feature extraction steps</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-3 rounded border text-sm bg-blue-900/20 border-blue-600/30">
          💡 Key Insight: "Replacement" is about whether items go back into the pool of choices. 
          With replacement = infinite copies. Without = limited supply.
        </div>
      </SectionContent>
    )
  },
  {
    id: 'formal-definition',
    title: 'Formal Definition',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="bg-neutral-800 p-6 rounded-lg">
          <h4 className="text-lg font-semibold border-b border-neutral-600 pb-2 mb-4 text-white">
            Mathematical Framework
          </h4>
          <div className="text-neutral-200">
            <div className="mb-4">
              <p className="mb-2 font-medium text-purple-400">Ordered Sampling With Replacement</p>
              <div className="my-2 text-center">
                <div className="text-xl font-mono text-blue-400">n^r</div>
              </div>
              <p className="mt-2 text-neutral-300">
                Where:
              </p>
              <ul className="list-disc list-inside text-sm text-neutral-400 ml-4">
                <li>n = total number of items</li>
                <li>r = positions to fill</li>
              </ul>
              <div className="mt-3 bg-blue-900/20 p-3 rounded">
                <p className="text-sm text-neutral-300">
                  <strong>Logic:</strong> Each of the r positions has n choices
                </p>
                <p className="text-sm font-mono text-blue-400 mt-1">
                  n × n × n × ... (r times) = n^r
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="mb-2 font-medium text-purple-400">Ordered Sampling Without Replacement (Permutations)</p>
              <div className="my-2 text-center">
                <div className="text-xl font-mono text-green-400">P(n,r) = n!/(n-r)!</div>
              </div>
              <p className="mt-2 text-neutral-300">
                Where:
              </p>
              <ul className="list-disc list-inside text-sm text-neutral-400 ml-4">
                <li>n = total number of items</li>
                <li>r = positions to fill</li>
                <li>n! = factorial of n</li>
              </ul>
              <div className="mt-3 bg-green-900/20 p-3 rounded">
                <p className="text-sm text-neutral-300">
                  <strong>Logic:</strong> First position has n choices, second has (n-1), etc.
                </p>
                <p className="text-sm font-mono text-green-400 mt-1">
                  n × (n-1) × (n-2) × ... × (n-r+1) = n!/(n-r)!
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionContent>
    )
  }
];

export default function Tab1FoundationsTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Foundations - Ordered Sampling"
      description="Build intuition and understand the mathematical framework"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="green"
      showBackToHub={false}
      showHeader={false}
    />
  );
}