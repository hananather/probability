"use client";

import React from 'react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { SimpleFormulaCard, SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';
import { ComparisonTable } from '@/components/ui/patterns/ComparisonTable';
import { useMathJax } from '@/hooks/useMathJax';
import { AlertTriangle } from 'lucide-react';

const SECTIONS = [
  {
    id: 'formula-sheet',
    title: 'Essential Formulas',
    content: ({ sectionIndex, isCompleted }) => <FormulaSheetSection />
  },
  {
    id: 'decision-guide',
    title: 'When to Use What',
    content: ({ sectionIndex, isCompleted }) => <DecisionGuideSection />
  },
  {
    id: 'common-mistakes',
    title: 'Common Mistakes',
    content: ({ sectionIndex, isCompleted }) => <CommonMistakesSection />
  },
  {
    id: 'speed-practice',
    title: 'Speed Tips',
    content: ({ sectionIndex, isCompleted }) => <SpeedTipsSection />
  }
];

export default function Tab3QuickReferenceTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Quick Reference Guide"
      description="Everything you need for exams in one place"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="purple"
      showHeader={false}
    />
  );
}

// Section 1: Formula Sheet
const FormulaSheetSection = React.memo(function FormulaSheetSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SimpleFormulaCard 
          title="Basic Bayes' Theorem" 
          formula={`P(H|D) = \\frac{P(D|H) \\cdot P(H)}{P(D)}`}
          description="Single hypothesis, single evidence"
          theme="purple"
        />
        
        <SimpleFormulaCard 
          title="Expanded Form (Binary)" 
          formula={`P(H|D) = \\frac{P(D|H) \\cdot P(H)}{P(D|H) \\cdot P(H) + P(D|\\neg H) \\cdot P(\\neg H)}`}
          description="Two hypotheses: positive and negative"
          theme="purple"
        />
        
        <SimpleFormulaCard 
          title="Multiple Hypotheses" 
          formula={`P(H_i|D) = \\frac{P(D|H_i) \\cdot P(H_i)}{\\sum_j P(D|H_j) \\cdot P(H_j)}`}
          description="More than 2 hypotheses"
          theme="purple"
        />
        
        <SimpleFormulaCard 
          title="Odds Form" 
          formula={`\\frac{P(H|D)}{P(\\neg H|D)} = \\frac{P(D|H)}{P(D|\\neg H)} \\cdot \\frac{P(H)}{P(\\neg H)}`}
          description="Quick mental math: multiply likelihood ratio by prior odds"
          theme="purple"
        />
      </div>

      <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-600/30">
        <h4 className="font-semibold text-neutral-300 mb-3">Quick Conversion Reference</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-purple-400 font-semibold">Probability → Odds</p>
            <p className="font-mono text-neutral-300">0.5 → 1:1</p>
            <p className="font-mono text-neutral-300">0.25 → 1:3</p>
            <p className="font-mono text-neutral-300">0.1 → 1:9</p>
          </div>
          <div>
            <p className="text-purple-400 font-semibold">Odds → Probability</p>
            <p className="font-mono text-neutral-300">1:1 → 0.5</p>
            <p className="font-mono text-neutral-300">1:4 → 0.2</p>
            <p className="font-mono text-neutral-300">2:3 → 0.4</p>
          </div>
          <div>
            <p className="text-purple-400 font-semibold">Common Percentages</p>
            <p className="font-mono text-neutral-300">1% = 0.01</p>
            <p className="font-mono text-neutral-300">5% = 0.05</p>
            <p className="font-mono text-neutral-300">10% = 0.1</p>
          </div>
          <div>
            <p className="text-purple-400 font-semibold">Likelihood Ratios</p>
            <p className="font-mono text-neutral-300">Strong: 10+</p>
            <p className="font-mono text-neutral-300">Moderate: 3-10</p>
            <p className="font-mono text-neutral-300">Weak: 1-3</p>
          </div>
        </div>
      </div>
    </div>
  );
});

// Section 2: Decision Guide
const DecisionGuideSection = React.memo(function DecisionGuideSection() {
  const decisionData = {
    title: "Bayes' Theorem Decision Matrix",
    columns: [
      { key: 'formula', title: 'Which Formula?', color: 'text-blue-400' },
      { key: 'tip', title: 'Key Strategy', color: 'text-green-400' }
    ],
    rows: [
      {
        aspect: "Medical test result",
        formula: "Basic or Expanded form",
        tip: "Watch for base rate fallacy"
      },
      {
        aspect: "Multiple test results",
        formula: "Sequential updates",
        tip: "Use odds form for speed"
      },
      {
        aspect: "Classification (>2 categories)",
        formula: "Multiple hypotheses form",
        tip: "Check posteriors sum to 1"
      },
      {
        aspect: "Quality control",
        formula: "Basic form",
        tip: "Calculate P(Evidence) carefully"
      },
      {
        aspect: "A/B testing",
        formula: "Basic form",
        tip: "Define clear hypotheses first"
      }
    ]
  };

  return (
    <div className="space-y-6">
      <ComparisonTable {...decisionData} />
      
      <SimpleInsightBox variant="info" className="border-purple-700/50">
        <h4 className="font-semibold text-purple-400 mb-2">Quick Decision Guide</h4>
        <ul className="space-y-1 text-neutral-300">
          <li><strong>1 hypothesis:</strong> Use basic form</li>
          <li><strong>2 hypotheses:</strong> Use expanded form (easier calculation)</li>
          <li><strong>3+ hypotheses:</strong> Use multiple hypotheses form</li>
          <li><strong>Mental math:</strong> Use odds form</li>
        </ul>
      </SimpleInsightBox>
    </div>
  );
});

// Section 3: Common Mistakes
const CommonMistakesSection = React.memo(function CommonMistakesSection() {
  const contentRef = useMathJax([
    'P(H)', 'P(\\text{positive test | disease}) \\neq P(\\text{disease | positive test})',
    'P(\\text{Evidence})', 'P(\\text{Evidence}) = P(\\text{Evidence}|H_1) \\times P(H_1) + P(\\text{Evidence}|H_2) \\times P(H_2) + \\ldots',
    'P(\\text{Hypothesis | Evidence})', 'P(\\text{Evidence})'
  ]);

  return (
    <div ref={contentRef} className="space-y-6 font-mono">
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
          <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Base Rate Neglect
          </h4>
          <p className="text-neutral-300 mb-2">
            <strong>Mistake:</strong> Ignoring the prior probability <span dangerouslySetInnerHTML={{ __html: '\\(P(H)\\)' }} />
          </p>
          <p className="text-sm text-neutral-400">
            Even with a 99% accurate test, if the disease is rare (1% prevalence), 
            most positive results are false positives!
          </p>
        </div>

        <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-600/30">
          <h4 className="font-semibold text-orange-400 mb-3">Confusing P(A|B) with P(B|A)</h4>
          <p className="text-neutral-300 mb-2">
            <strong>Mistake:</strong> <span dangerouslySetInnerHTML={{ __html: '\\(P(\\text{positive test | disease}) \\neq P(\\text{disease | positive test})\\)' }} />
          </p>
          <p className="text-sm text-neutral-400">
            The probability of a positive test given disease is NOT the same as 
            the probability of disease given a positive test.
          </p>
        </div>

        <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-600/30">
          <h4 className="font-semibold text-yellow-400 mb-3">Forgetting to Calculate <span dangerouslySetInnerHTML={{ __html: '\\(P(\\text{Evidence})\\)' }} /></h4>
          <p className="text-neutral-300 mb-2">
            <strong>Mistake:</strong> Not using law of total probability for denominator
          </p>
          <p className="text-sm text-neutral-400">
            <span dangerouslySetInnerHTML={{ __html: '\\(P(\\text{Evidence}) = P(\\text{Evidence}|H_1) \\times P(H_1) + P(\\text{Evidence}|H_2) \\times P(H_2) + \\ldots\\)' }} />
          </p>
        </div>
      </div>

      <SimpleInsightBox variant="warning" className="border-red-700/50">
        <h4 className="font-semibold text-red-400 mb-2">Verification Checklist</h4>
        <ul className="space-y-1 text-neutral-300 text-sm">
          <li>□ Did I identify what I'm looking for? <span dangerouslySetInnerHTML={{ __html: '\\(P(\\text{Hypothesis | Evidence})\\)' }} /></li>
          <li>□ Did I write down all given probabilities?</li>
          <li>□ Did I calculate <span dangerouslySetInnerHTML={{ __html: '\\(P(\\text{Evidence})\\)' }} /> using total probability?</li>
          <li>□ Do my posterior probabilities sum to 1? (for multiple hypotheses)</li>
          <li>□ Does my answer make intuitive sense?</li>
        </ul>
      </SimpleInsightBox>
    </div>
  );
});

// Section 4: Speed Tips
const SpeedTipsSection = React.memo(function SpeedTipsSection() {
  const contentRef = useMathJax([
    'P(H|D) \\approx \\frac{P(D|H) \\times P(H)}{P(D|\\neg H) \\times P(\\neg H)}',
    'P(\\neg H) \\approx 1',
    'P(\\text{Evidence})'
  ]);

  return (
    <div ref={contentRef} className="space-y-6 font-mono">
      <div className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-300 mb-4">Speed Calculation Tips</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-800/50 p-4 rounded border border-neutral-600/30">
            <h4 className="font-semibold text-teal-400 mb-2">Use Odds Form</h4>
            <p className="text-sm text-neutral-300">
              Convert to odds, multiply by likelihood ratio, convert back to probability.
              Much faster for mental math!
            </p>
          </div>

          <div className="bg-neutral-800/50 p-4 rounded border border-neutral-600/30">
            <h4 className="font-semibold text-blue-400 mb-2">Memorize Common Values</h4>
            <p className="text-sm text-neutral-300">
              1% = 1:99 odds, 5% = 1:19 odds, 10% = 1:9 odds.
              Practice converting quickly!
            </p>
          </div>

          <div className="bg-neutral-800/50 p-4 rounded border border-neutral-600/30">
            <h4 className="font-semibold text-purple-400 mb-2">Approximation Tricks</h4>
            <p className="text-sm text-neutral-300">
              For rare events, <span dangerouslySetInnerHTML={{ __html: '\\(P(H|D) \\approx \\frac{P(D|H) \\times P(H)}{P(D|\\neg H) \\times P(\\neg H)}\\)' }} /> when <span dangerouslySetInnerHTML={{ __html: '\\(P(\\neg H) \\approx 1\\)' }} />
            </p>
          </div>

          <div className="bg-neutral-800/50 p-4 rounded border border-neutral-600/30">
            <h4 className="font-semibold text-orange-400 mb-2">Pattern Recognition</h4>
            <p className="text-sm text-neutral-300">
              Medical tests, quality control, spam filters - they all follow the same pattern.
              Practice the template!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
});