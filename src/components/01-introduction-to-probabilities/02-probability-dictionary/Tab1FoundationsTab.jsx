"use client";

import React from 'react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { ComparisonTable } from '@/components/ui/patterns/ComparisonTable';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';
import { InterpretationBox } from '@/components/ui/patterns/InterpretationBox';
import { useMathJax } from '../../../hooks/useMathJax';

const SECTIONS = [
  {
    id: 'challenge',
    title: 'Can You Translate This?',
    content: ({ sectionIndex, isCompleted }) => (
      <div className="space-y-6">
        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/30">
          <h4 className="font-semibold text-amber-400 mb-3">
            🔄 Translation Challenge:
          </h4>
          <p className="text-neutral-300 mb-3">
            Here are some everyday probability statements. Can you write them in mathematical notation?
          </p>
          <div className="mt-4 space-y-3">
            <div className="bg-neutral-800 rounded p-3">
              <p className="text-neutral-300">"The event that it rains OR snows tomorrow"</p>
              <p className="text-xs text-neutral-500 mt-1">Mathematical notation: ?</p>
            </div>
            <div className="bg-neutral-800 rounded p-3">
              <p className="text-neutral-300">"Something must happen when we flip a coin"</p>
              <p className="text-xs text-neutral-500 mt-1">Mathematical notation: ?</p>
            </div>
            <div className="bg-neutral-800 rounded p-3">
              <p className="text-neutral-300">"The probability that both A and B occur"</p>
              <p className="text-xs text-neutral-500 mt-1">Mathematical notation: ?</p>
            </div>
          </div>
        </div>
        <p className="text-neutral-400">
          Don't worry if this looks confusing! By the end of this section, 
          you'll be fluent in both languages of probability.
        </p>
      </div>
    )
  },
  {
    id: 'why-translation',
    title: 'Why Translation Matters',
    content: ({ sectionIndex, isCompleted }) => (
      <div className="space-y-6">
        <SimpleInsightBox title="Two Languages, Same Ideas" theme="teal">
          <p className="mb-3">
            Probability has two languages that describe the exact same concepts:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm ml-4">
            <li><strong>English:</strong> Natural, intuitive, how we think</li>
            <li><strong>Math notation:</strong> Precise, compact, universal</li>
          </ul>
          <p className="mt-3 text-xs text-neutral-400">
            Think of it like learning to speak French and English about the same topic!
          </p>
        </SimpleInsightBox>
        
        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
          <h4 className="font-semibold text-blue-400 mb-3">
            Real Example: Medical Testing
          </h4>
          <div className="space-y-2 text-sm">
            <p className="text-neutral-300">
              <strong>English:</strong> "What's the chance the test is positive given that the patient has the disease?"
            </p>
            <p className="text-neutral-300">
              <strong>Math:</strong> <span className="font-mono" dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Test}^+ | \\text{Disease})\\)` }} />
            </p>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            Same question, two ways to express it!
          </p>
        </div>

        <InterpretationBox theme="green" title="Your Superpower">
          <p>
            Once you can translate freely between English and math notation, 
            you can solve any probability problem by:
          </p>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm ml-4">
            <li>Reading the English problem</li>
            <li>Translating to math notation</li>
            <li>Applying mathematical rules</li>
            <li>Translating the answer back to English</li>
          </ol>
        </InterpretationBox>
      </div>
    )
  },
  {
    id: 'basic-dictionary',
    title: 'Your First Translation Dictionary',
    content: ({ sectionIndex, isCompleted }) => {
      const basicDictionary = {
        title: "Basic Probability Translation Dictionary",
        columns: [
          { key: 'english', title: 'English', color: 'text-blue-400' },
          { key: 'sets', title: 'Set Notation', color: 'text-green-400' },
          { key: 'example', title: 'Example', color: 'text-purple-400' }
        ],
        rows: [
          {
            aspect: "Basic concepts",
            english: "sample space",
            sets: `\\(S\\)`,
            example: `All possible coin flips: \\(\\{H, T\\}\\)`
          },
          {
            aspect: "",
            english: "an outcome happens",
            sets: `\\(s \\in S\\)`,
            example: `Heads occurs: \\(H \\in \\{H, T\\}\\)`
          },
          {
            aspect: "",
            english: "event A",
            sets: `\\(A \\subseteq S\\)`,
            example: `Getting heads: \\(A = \\{H\\}\\)`
          },
          {
            aspect: "",
            english: "event A occurred",
            sets: `\\(s_{\\text{actual}} \\in A\\)`,
            example: `We got heads: \\(H \\in \\{H\\}\\)`
          },
          {
            aspect: "",
            english: "something must happen",
            sets: `\\(s_{\\text{actual}} \\in S\\)`,
            example: "Coin must land somewhere"
          }
        ]
      };

      return (
        <div className="space-y-6">
          <ComparisonTable {...basicDictionary} />
          
          <SimpleInsightBox title="How to Use This Table" theme="orange">
            <p>
              This table is your reference guide. When you see English on the left, 
              you know how to write it mathematically on the right.
            </p>
            <p className="mt-2 text-sm">
              <strong>Practice:</strong> Cover one column and try to fill in the other!
            </p>
          </SimpleInsightBox>
        </div>
      );
    }
  },
  {
    id: 'building-complexity',
    title: 'Building Complex Expressions',
    content: ({ sectionIndex, isCompleted }) => {
      const complexDictionary = {
        title: "Complex Operations Translation",
        columns: [
          { key: 'english', title: 'English', color: 'text-blue-400' },
          { key: 'sets', title: 'Set Notation', color: 'text-green-400' }
        ],
        rows: [
          {
            aspect: "Combining events",
            english: "A or B (inclusive)",
            sets: `\\(A \\cup B\\)`
          },
          {
            aspect: "",
            english: "A and B",
            sets: `\\(A \\cap B\\)`
          },
          {
            aspect: "",
            english: "not A",
            sets: `\\(A^c\\) or \\(A'\\)`
          },
          {
            aspect: "",
            english: "A or B, but not both",
            sets: `\\((A \\cap B^c) \\cup (A^c \\cap B)\\)`
          },
          {
            aspect: "",
            english: "at least one of A₁, A₂, ..., Aₙ",
            sets: `\\(A_1 \\cup A_2 \\cup \\cdots \\cup A_n\\)`
          },
          {
            aspect: "",
            english: "all of A₁, A₂, ..., Aₙ",
            sets: `\\(A_1 \\cap A_2 \\cap \\cdots \\cap A_n\\)`
          }
        ]
      };

      return (
        <div className="space-y-6">
          <ComparisonTable {...complexDictionary} />
          
          <InterpretationBox theme="purple" title="Pattern Recognition">
            <p>
              Notice the patterns:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm ml-4">
              <li><strong>"or"</strong> usually becomes ∪ (union)</li>
              <li><strong>"and"</strong> usually becomes ∩ (intersection)</li>
              <li><strong>"not"</strong> becomes ᶜ or ' (complement)</li>
              <li><strong>"at least one"</strong> means union of all</li>
              <li><strong>"all"</strong> means intersection of all</li>
            </ul>
          </InterpretationBox>
        </div>
      );
    }
  }
];

export default function Tab1FoundationsTab({ onComplete }) {
  const contentRef = useMathJax([]);

  return (
    <div ref={contentRef}>
      <SectionBasedContent
        title="Foundations"
        description="Learning the translation between English and mathematical notation"
        sections={SECTIONS}
        onComplete={onComplete}
        chapter={1}
        progressVariant="green"
        showHeader={false}
      />
    </div>
  );
}