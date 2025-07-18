"use client";

import React, { useState } from 'react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { ComparisonTable } from '@/components/ui/patterns/ComparisonTable';
import { SimpleInsightBox, SimpleFormulaCard } from '@/components/ui/patterns/SimpleComponents';
import { InterpretationBox } from '@/components/ui/patterns/InterpretationBox';

const SECTIONS = [
  {
    id: 'complete-dictionary',
    title: 'Complete Translation Dictionary',
    content: ({ sectionIndex, isCompleted }) => {
      // This is the complete table from the textbook image
      const completeDictionary = {
        title: "Complete English ↔ Set Notation Dictionary",
        columns: [
          { key: 'english', title: 'English', color: 'text-blue-400' },
          { key: 'sets', title: 'Set Notation', color: 'text-green-400' }
        ],
        rows: [
          {
            category: "Events and occurrences",
            english: "sample space",
            sets: "\\(S\\)"
          },
          {
            category: "",
            english: "s is a possible outcome",
            sets: "\\(s \\in S\\)"
          },
          {
            category: "",
            english: "A is an event",
            sets: "\\(A \\subseteq S\\)"
          },
          {
            category: "",
            english: "A occurred",
            sets: "\\(s_{\\text{actual}} \\in A\\)"
          },
          {
            category: "",
            english: "something must happen",
            sets: "\\(s_{\\text{actual}} \\in S\\)"
          },
          {
            category: "New events from old events",
            english: "A or B (inclusive)",
            sets: "\\(A \\cup B\\)"
          },
          {
            category: "",
            english: "A and B",
            sets: "\\(A \\cap B\\)"
          },
          {
            category: "",
            english: "not A",
            sets: "\\(A^c\\)"
          },
          {
            category: "",
            english: "A or B, but not both",
            sets: "\\((A \\cap B^c) \\cup (A^c \\cap B)\\)"
          },
          {
            category: "",
            english: "at least one of A₁, ..., Aₙ",
            sets: "\\(A_1 \\cup \\cdots \\cup A_n\\)"
          },
          {
            category: "",
            english: "all of A₁, ..., Aₙ",
            sets: "\\(A_1 \\cap \\cdots \\cap A_n\\)"
          },
          {
            category: "Relationships between events",
            english: "A implies B",
            sets: "\\(A \\subseteq B\\)"
          },
          {
            category: "",
            english: "A and B are mutually exclusive",
            sets: "\\(A \\cap B = \\emptyset\\)"
          },
          {
            category: "",
            english: "A₁, ..., Aₙ are a partition of S",
            sets: "\\(A_1 \\cup \\cdots \\cup A_n = S, A_i \\cap A_j = \\emptyset\\) for \\(i \\neq j\\)"
          }
        ]
      };

      return (
        <div className="space-y-6">
          <ComparisonTable {...completeDictionary} />
          
          <SimpleInsightBox title="How to Use This Dictionary" theme="purple">
            <p>
              This is your complete reference. When you see English on the left, 
              you immediately know the mathematical notation on the right.
            </p>
            <p className="mt-2 text-sm">
              <strong>Pro tip:</strong> Bookmark this page - you'll use it constantly!
            </p>
          </SimpleInsightBox>
        </div>
      );
    }
  },
  {
    id: 'decision-flowchart',
    title: 'Translation Decision Guide',
    content: ({ sectionIndex, isCompleted }) => {
      const decisionGuide = {
        title: "Translation Decision Flowchart",
        columns: [
          { key: 'question', title: 'Ask Yourself', color: 'text-blue-400' },
          { key: 'keywords', title: 'Key Words to Look For', color: 'text-yellow-400' },
          { key: 'notation', title: 'Use This Notation', color: 'text-green-400' }
        ],
        rows: [
          {
            category: "Basic identification",
            question: "What's the full set of possibilities?",
            keywords: "sample space, all possible outcomes",
            notation: "\\(S\\)"
          },
          {
            category: "",
            question: "What specific outcomes am I interested in?",
            keywords: "event, happens, occurs",
            notation: "\\(A, B, C\\) (subsets of \\(S\\))"
          },
          {
            category: "Combinations",
            question: "Do I want EITHER outcome?",
            keywords: "or, at least one, any of",
            notation: "\\(A \\cup B\\) (union)"
          },
          {
            category: "",
            question: "Do I want BOTH outcomes?",
            keywords: "and, all of, both",
            notation: "\\(A \\cap B\\) (intersection)"
          },
          {
            category: "",
            question: "Do I want the OPPOSITE?",
            keywords: "not, doesn't happen, fails",
            notation: "\\(A^c\\) (complement)"
          },
          {
            category: "Conditional",
            question: "Am I given some information?",
            keywords: "given that, if, provided that, knowing",
            notation: "\\(P(A|B)\\) (conditional)"
          },
          {
            category: "Relationships",
            question: "Does one event guarantee another?",
            keywords: "implies, if...then, always leads to",
            notation: "\\(A \\subseteq B\\) (subset)"
          },
          {
            category: "",
            question: "Can both events happen together?",
            keywords: "mutually exclusive, can't both occur",
            notation: "\\(A \\cap B = \\emptyset\\)"
          }
        ]
      };

      return (
        <div className="space-y-6">
          <ComparisonTable {...decisionGuide} />
          
          <InterpretationBox theme="teal" title="Decision Strategy">
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Read the problem completely first</li>
              <li>Identify the sample space S</li>
              <li>Look for key words that signal specific operations</li>
              <li>Work from inside out for complex expressions</li>
              <li>Check your answer by translating back to English</li>
            </ol>
          </InterpretationBox>
        </div>
      );
    }
  },
  {
    id: 'common-mistakes',
    title: 'Translation Pitfalls',
    content: ({ sectionIndex, isCompleted }) => (
      <div className="space-y-6">
        <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
          <h4 className="font-semibold text-red-400 mb-3">❌ Mistake #1: "Or" vs "And" Confusion</h4>
          <div className="text-sm space-y-2">
            <p className="text-neutral-300">
              <strong>Wrong:</strong> "A or B" → A ∩ B
            </p>
            <p className="text-neutral-300">
              <strong>Right:</strong> "A or B" → A ∪ B
            </p>
            <p className="text-neutral-400 text-xs">
              Remember: "or" in English usually means inclusive OR (union)
            </p>
          </div>
        </div>

        <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
          <h4 className="font-semibold text-red-400 mb-3">❌ Mistake #2: Conditional Direction</h4>
          <div className="text-sm space-y-2">
            <p className="text-neutral-300">
              <strong>Problem:</strong> "Probability of disease given positive test"
            </p>
            <p className="text-neutral-300">
              <strong>Wrong:</strong> P(Test⁺ | Disease)
            </p>
            <p className="text-neutral-300">
              <strong>Right:</strong> P(Disease | Test⁺)
            </p>
            <p className="text-neutral-400 text-xs">
              The condition comes after "given"
            </p>
          </div>
        </div>

        <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
          <h4 className="font-semibold text-red-400 mb-3">❌ Mistake #3: "At Least One" vs "All"</h4>
          <div className="text-sm space-y-2">
            <p className="text-neutral-300">
              <strong>"At least one of A, B, C":</strong> A ∪ B ∪ C
            </p>
            <p className="text-neutral-300">
              <strong>"All of A, B, C":</strong> A ∩ B ∩ C
            </p>
            <p className="text-neutral-400 text-xs">
              These are opposites - be very careful!
            </p>
          </div>
        </div>

        <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
          <h4 className="font-semibold text-red-400 mb-3">❌ Mistake #4: Forgetting Complements</h4>
          <div className="text-sm space-y-2">
            <p className="text-neutral-300">
              <strong>"Not (A and B)":</strong> (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ
            </p>
            <p className="text-neutral-300">
              <strong>Wrong:</strong> Aᶜ ∩ Bᶜ
            </p>
            <p className="text-neutral-400 text-xs">
              Use De Morgan's laws for "not" with multiple events
            </p>
          </div>
        </div>

        <SimpleInsightBox title="Avoiding Mistakes" theme="green">
          <p>
            <strong>Best strategy:</strong> Always translate your final answer back to English 
            and check if it makes sense with the original problem.
          </p>
        </SimpleInsightBox>
      </div>
    )
  },
  {
    id: 'quick-practice',
    title: 'Quick Reference Practice',
    content: ({ sectionIndex, isCompleted }) => {
      const [showAnswers, setShowAnswers] = useState(false);

      const quickProblems = [
        {
          english: "The coin lands heads and the die shows an even number",
          answer: "H ∩ Even"
        },
        {
          english: "At least one of the three tests fails",
          answer: "F₁ ∪ F₂ ∪ F₃"
        },
        {
          english: "The patient doesn't have the disease",
          answer: "Dᶜ"
        },
        {
          english: "Given that it's raining, the probability of traffic",
          answer: "P(Traffic | Rain)"
        },
        {
          english: "Either success or failure, but not both",
          answer: "(S ∩ Fᶜ) ∪ (Sᶜ ∩ F)"
        },
        {
          english: "All three machines are working",
          answer: "M₁ ∩ M₂ ∩ M₃"
        }
      ];

      return (
        <div className="space-y-6">
          <div className="bg-neutral-900/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-white">Quick Translation Practice</h4>
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
              >
                {showAnswers ? 'Hide Answers' : 'Show Answers'}
              </button>
            </div>
            
            <div className="space-y-4">
              {quickProblems.map((problem, index) => (
                <div key={index} className="bg-neutral-800 rounded-lg p-4">
                  <p className="text-neutral-300 mb-2">
                    <strong>{index + 1}.</strong> "{problem.english}"
                  </p>
                  {showAnswers && (
                    <p className="text-green-400 font-mono text-sm">
                      Answer: {problem.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <SimpleInsightBox title="Master the Dictionary" theme="purple">
            <p>
              The goal is to make translation automatic. With practice, you'll see English 
              and immediately think in mathematical notation - and vice versa!
            </p>
          </SimpleInsightBox>
        </div>
      );
    }
  }
];

export default function Tab3QuickReferenceTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Quick Reference"
      description="Complete translation dictionary and common pitfalls"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="purple"
      showHeader={false}
    />
  );
}