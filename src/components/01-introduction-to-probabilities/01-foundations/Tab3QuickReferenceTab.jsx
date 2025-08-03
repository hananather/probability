"use client";

import React from 'react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { SimpleFormulaCard, SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';
import { ComparisonTable } from '@/components/ui/patterns/ComparisonTable';

const SECTIONS = [
  {
    id: 'formula-sheet',
    title: 'Essential Formulas',
    content: ({ sectionIndex, isCompleted }) => (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <SimpleFormulaCard 
            title="Equal Mass Pebbles" 
            formula={`P(A) = \\frac{\\text{Number in event}}{\\text{Total number}}`}
            description="When all outcomes are equally likely"
            theme="purple"
          />
          <SimpleFormulaCard 
            title="Unequal Mass Pebbles" 
            formula={`P(A) = \\frac{\\text{Mass of event}}{\\text{Total mass}}`}
            description="When outcomes have different probabilities"
            theme="purple"
          />
        </div>

        <SimpleFormulaCard 
          title="Complement Rule" 
          formula={`P(A^c) = 1 - P(A)`}
          description="Probability of 'not A' = 1 minus probability of A"
          theme="teal"
        />

        <SimpleInsightBox title="Memory Aid" theme="blue">
          <p>
            <strong>Equal Mass:</strong> Count favorable pebbles ÷ Count total pebbles
          </p>
          <p>
            <strong>Unequal Mass:</strong> Weight of favorable ÷ Total weight
          </p>
        </SimpleInsightBox>
      </div>
    )
  },
  {
    id: 'decision-guide',
    title: 'When to Use What',
    content: ({ sectionIndex, isCompleted }) => {
      const decisionData = {
        title: "Probability Decision Guide",
        columns: [
          { key: 'scenario', title: 'Scenario Type', color: 'text-blue-400' },
          { key: 'approach', title: 'Which Model?', color: 'text-green-400' },
          { key: 'formula', title: 'Formula to Use', color: 'text-purple-400' }
        ],
        rows: [
          {
            scenario: "Fair coin flip",
            approach: "Equal mass pebbles",
            formula: "\\(P(H) = \\frac{1}{2}\\)"
          },
          {
            scenario: "Rolling a standard die",
            approach: "Equal mass pebbles",
            formula: "\\(P(6) = \\frac{1}{6}\\)"
          },
          {
            scenario: "Weather forecast (30% rain)",
            approach: "Unequal mass pebbles",
            formula: "\\(P(\\text{rain}) = 0.30\\)"
          },
          {
            scenario: "Quality control (5% defect rate)",
            approach: "Unequal mass pebbles",
            formula: "\\(P(\\text{defect}) = 0.05\\)"
          },
          {
            scenario: "Drawing from shuffled deck",
            approach: "Equal mass pebbles",
            formula: "\\(P(\\text{ace}) = \\frac{4}{52}\\)"
          }
        ]
      };

      return (
        <div className="space-y-6">
          <ComparisonTable {...decisionData} />
          
          <SimpleInsightBox title="Quick Test" theme="orange">
            <p>
              <strong>Ask yourself:</strong> "Are all outcomes equally likely to happen?"
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm ml-4">
              <li><strong>Yes:</strong> Use equal mass (count/total)</li>
              <li><strong>No:</strong> Use unequal mass (given probabilities)</li>
            </ul>
          </SimpleInsightBox>
        </div>
      );
    }
  },
  {
    id: 'common-mistakes',
    title: 'What to Avoid',
    content: ({ sectionIndex, isCompleted }) => (
      <div className="space-y-6">
        <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
          <h4 className="font-semibold text-red-400 mb-3">Common Mistake #1</h4>
          <p className="text-neutral-300 mb-2">
            <strong>Forgetting to check if outcomes are equally likely</strong>
          </p>
          <p className="text-sm text-neutral-400">
            Example: Assuming P(rain tomorrow) = 1/2 because "either it rains or it doesn't"
          </p>
        </div>

        <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
          <h4 className="font-semibold text-red-400 mb-3">Common Mistake #2</h4>
          <p className="text-neutral-300 mb-2">
            <strong>Confusing "or" with "and"</strong>
          </p>
          <p className="text-sm text-neutral-400">
            "Red or Blue" means count BOTH red AND blue pebbles, not choose one
          </p>
        </div>

        <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
          <h4 className="font-semibold text-red-400 mb-3">Common Mistake #3</h4>
          <p className="text-neutral-300 mb-2">
            <strong>Forgetting probabilities must sum to 1</strong>
          </p>
          <p className="text-sm text-neutral-400">
            If you have 3 outcomes with probabilities 0.6, 0.3, 0.2 - something's wrong!
          </p>
        </div>

        <SimpleInsightBox title="Success Strategy" theme="green">
          <p>
            Always return to the physical intuition: "What would happen if I actually had this bag of pebbles?"
          </p>
        </SimpleInsightBox>
      </div>
    )
  },
  {
    id: 'practice-problems',
    title: 'Quick Practice',
    content: ({ sectionIndex, isCompleted }) => (
      <div className="space-y-6">
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Practice Set A: Equal Mass</h4>
          <div className="space-y-2 text-sm">
            <p>1. Bag has 12 red, 8 blue pebbles. Find P(red).</p>
            <p>2. Standard die. Find P(even number).</p>
            <p>3. Deck of cards. Find P(heart or spade).</p>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Practice Set B: Unequal Mass</h4>
          <div className="space-y-2 text-sm">
            <p>1. Medical test: 85% accurate. Find P(correct result).</p>
            <p>2. Website: 60% mobile, 40% desktop. Find P(mobile).</p>
            <p>3. Survey: 70% agree, 20% disagree, 10% undecided. Find P(not agree).</p>
          </div>
        </div>

        <SimpleInsightBox title="Answer Hints" theme="purple">
          <p className="text-xs">
            Set A: 12/20=0.6, 3/6=0.5, 26/52=0.5<br/>
            Set B: 0.85, 0.6, 1-0.7=0.3
          </p>
        </SimpleInsightBox>
      </div>
    )
  }
];

export default function Tab3QuickReferenceTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Quick Reference"
      description="Formulas, decision guides, and practice problems"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="purple"
      showHeader={false}
    />
  );
}