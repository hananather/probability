"use client";

import React from 'react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { SimpleFormulaCard, SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';
import { ComparisonTable } from '@/components/ui/patterns/ComparisonTable';

function PracticeProblem({ id, question, children }) {
  return (
    <div className="space-y-2">
      <p>{question}</p>
      <details className="rounded border border-neutral-700 p-3">
        <summary className="cursor-pointer text-purple-300 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400">
          Reveal solution {id}
        </summary>
        <p className="mt-3 text-neutral-300">{children}</p>
      </details>
    </div>
  );
}

const SECTIONS = [
  {
    id: 'formula-sheet',
    title: 'Essential Formulas',
    content: ({ sectionIndex, isCompleted }) => (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <SimpleFormulaCard 
            title="Equally Likely Outcomes"
            formula={`P(A) = \\frac{\\text{Number in event}}{\\text{Total number}}`}
            description="For a finite sample space with equally likely outcomes"
            theme="purple"
          />
          <SimpleFormulaCard 
            title="Weighted Selection"
            formula={`P(A) = \\frac{\\text{Sum of selection weights in event}}{\\text{Sum of all selection weights}}`}
            description="When the sampling algorithm selects each outcome in proportion to its assigned weight"
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
            <strong>Equal likelihood:</strong> Count favorable outcomes ÷ Count total outcomes
          </p>
          <p>
            <strong>Weighted selection:</strong> Sum of favorable selection weights ÷ Sum of all selection weights.
            Displayed pebble size represents this numeric weight.
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
            approach: "Equally likely outcomes",
            formula: "\\(P(H) = \\frac{1}{2}\\)"
          },
          {
            scenario: "Rolling a fair six-sided die",
            approach: "Equally likely outcomes",
            formula: "\\(P(6) = \\frac{1}{6}\\)"
          },
          {
            scenario: "Weather forecast (30% rain)",
            approach: "Given probability",
            formula: "\\(P(\\text{rain}) = 0.30\\)"
          },
          {
            scenario: "Quality control (5% defect rate)",
            approach: "Given probability",
            formula: "\\(P(\\text{defect}) = 0.05\\)"
          },
          {
            scenario: "Drawing uniformly from a shuffled 52-card deck",
            approach: "Equally likely outcomes",
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
              <li><strong>Yes, in a finite sample space:</strong> Count the event's outcomes and divide by the total.</li>
              <li><strong>No:</strong> Use the given probabilities, or normalize selection weights if the sampling rule uses them.</li>
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
            "Red or Blue" includes every red pebble and every blue pebble. A single draw needs either color.
          </p>
        </div>

        <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
          <h4 className="font-semibold text-red-400 mb-3">Common Mistake #3</h4>
          <p className="text-neutral-300 mb-2">
            <strong>Forgetting probabilities of all disjoint outcomes must sum to 1</strong>
          </p>
          <p className="text-sm text-neutral-400">
            If your complete list has 3 distinct outcomes with probabilities 0.6, 0.3, 0.2 - something's wrong!
          </p>
        </div>

        <SimpleInsightBox title="Success Strategy" theme="green">
          <p>
            Name the outcomes, state the selection rule, and check whether equal likelihood is justified.
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
        <p className="text-neutral-300">Predict each answer and explain your selection rule before revealing its solution.</p>
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Practice Set A: Equally Likely Outcomes</h4>
          <div className="space-y-4 text-sm">
            <PracticeProblem id="A1" question="1. Select uniformly from 12 red and 8 blue pebbles. Find P(red).">
              P(red) = 12/20 = 0.6. Every pebble has the same selection probability, so count the 12 favorable outcomes among 20 total.
            </PracticeProblem>
            <PracticeProblem id="A2" question="2. Roll a fair six-sided die. Find P(even number).">
              The even outcomes are {'{2, 4, 6}'}. P(even) = 3/6 = 0.5 because all six faces are equally likely.
            </PracticeProblem>
            <PracticeProblem id="A3" question="3. Draw uniformly from a standard 52-card deck. Find P(heart or spade).">
              Hearts and spades are disjoint suits with 13 cards each. P(heart or spade) = (13 + 13)/52 = 26/52 = 0.5.
            </PracticeProblem>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Practice Set B: Given Probabilities</h4>
          <div className="space-y-4 text-sm">
            <PracticeProblem id="B1" question="1. A test gives the correct result in 85% of cases in the stated population. For a randomly selected case from that population, find P(correct result).">
              P(correct result) = 0.85. This is the supplied overall probability for this population; there is no reason to assign correct and incorrect equal probabilities.
            </PracticeProblem>
            <PracticeProblem id="B2" question="2. Website visits are 60% mobile and 40% desktop. For a randomly selected visit, find P(mobile).">
              P(mobile) = 0.6, the given proportion of mobile visits.
            </PracticeProblem>
            <PracticeProblem id="B3" question="3. Survey responses are 70% agree, 20% disagree, 10% undecided. For a randomly selected response, find P(not agree).">
              P(not agree) = 1 − 0.7 = 0.3. Both disagree and undecided belong to the complement: 0.2 + 0.1 = 0.3.
            </PracticeProblem>
          </div>
        </div>
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
