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
            Real Interview Question:
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
                  <h5 className="font-semibold text-blue-400 mb-3">Deep Real-World Applications:</h5>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-blue-300 text-sm">Supply Chain Optimization</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Manufacturing sequences determine product quality. Toyota's assembly line: 50+ stations 
                        in specific order. Wrong sequence = $100K+ in defects per batch.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-300 text-sm">Clinical Trial Phases</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Drug testing order is critical: Phase I (safety) → Phase II (efficacy) → Phase III (comparison).
                        Reordering could risk lives and waste billions in R&D.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-300 text-sm">Financial Trading Sequences</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        High-frequency trading: order execution sequence affects prices. 
                        Microsecond differences in trade order can mean millions in profit/loss.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-300 text-sm">Emergency Response Dispatch</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        911 dispatch order saves lives: nearest unit → specialized equipment → backup.
                        Optimal ordering reduces response time by 40% on average.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-400 mb-3">Production Tech/ML Systems:</h5>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-green-300 text-sm">ML Pipeline Architecture</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Netflix recommendation: Data cleaning → Feature extraction → Model inference → Post-processing.
                        Reordering breaks dependencies, causing 70% accuracy drop.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-green-300 text-sm">Database Query Optimization</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        JOIN order in SQL affects performance exponentially. Poor ordering: 
                        10s query → 10min. Query optimizers evaluate n! possible orders.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-green-300 text-sm">Microservices Orchestration</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Uber's ride request: User auth → Location → Driver match → Pricing → Confirmation.
                        Wrong order = failed requests, lost revenue ($1M+/hour during peak).
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-green-300 text-sm">A/B Test Rollout Strategy</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Facebook feature rollout: Internal → 0.1% users → 1% → 10% → Global.
                        Each stage informs the next. Wrong order = potential billion-user outage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-purple-900/20 p-4 rounded-lg border border-purple-600/30">
              <h5 className="font-semibold text-purple-400 mb-2">Why These Examples Matter</h5>
              <p className="text-sm text-neutral-300">
                In each case, the order isn't arbitrary—it's <span className="text-purple-300 font-medium">fundamentally tied to system behavior</span>:
              </p>
              <ul className="list-disc list-inside text-sm text-neutral-400 mt-2 space-y-1">
                <li>Dependencies cascade (one step enables the next)</li>
                <li>Order affects outcomes measurably (performance, safety, revenue)</li>
                <li>The cost of wrong ordering is quantifiable and significant</li>
                <li>Real systems must evaluate many possible orderings to find optimal sequences</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="p-3 rounded border text-sm bg-blue-900/20 border-blue-600/30">
          Key Insight: "Replacement" is about whether items go back into the pool of choices. 
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