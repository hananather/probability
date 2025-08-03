"use client";

import React, { useState } from 'react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { ComparisonTable } from '@/components/ui/patterns/ComparisonTable';
import { SimpleInsightBox, SimpleFormulaCard } from '@/components/ui/patterns/SimpleComponents';
import { InterpretationBox } from '@/components/ui/patterns/InterpretationBox';
import { SideBySideFormulas } from '@/components/ui/patterns/SideBySideFormulas';

const SECTIONS = [
  {
    id: 'operation-reference',
    title: 'Set Operations Quick Reference',
    content: ({ sectionIndex, isCompleted }) => {
      const operationsReference = {
        title: "Complete Set Operations Reference",
        columns: [
          { key: 'operation', title: 'Operation', color: 'text-blue-400' },
          { key: 'symbol', title: 'Symbol', color: 'text-green-400' },
          { key: 'english', title: 'English', color: 'text-yellow-400' },
          { key: 'formula', title: 'Set Definition', color: 'text-purple-400' }
        ],
        rows: [
          {
            aspect: "Basic Operations",
            operation: "Union",
            symbol: "\\(A \\cup B\\)",
            english: "A or B",
            formula: "\\(\\{x : x \\in A \\text{ or } x \\in B\\}\\)"
          },
          {
            aspect: "",
            operation: "Intersection",
            symbol: "\\(A \\cap B\\)",
            english: "A and B",
            formula: "\\(\\{x : x \\in A \\text{ and } x \\in B\\}\\)"
          },
          {
            aspect: "",
            operation: "Complement",
            symbol: "\\(A^c\\) or \\(A'\\)",
            english: "Not A",
            formula: "\\(\\{x \\in S : x \\notin A\\}\\)"
          },
          {
            aspect: "",
            operation: "Difference",
            symbol: "\\(A \\setminus B\\)",
            english: "A but not B",
            formula: "\\(\\{x : x \\in A \\text{ and } x \\notin B\\}\\)"
          },
          {
            aspect: "Special Sets",
            operation: "Empty Set",
            symbol: "\\(\\emptyset\\)",
            english: "Nothing",
            formula: "\\(\\{\\}\\)"
          },
          {
            aspect: "",
            operation: "Universal Set",
            symbol: "\\(S\\) or \\(\\Omega\\)",
            english: "Everything",
            formula: "Set of all possible outcomes"
          },
          {
            aspect: "Advanced",
            operation: "Symmetric Difference",
            symbol: "\\(A \\triangle B\\)",
            english: "A or B but not both",
            formula: "\\((A \\setminus B) \\cup (B \\setminus A)\\)"
          },
          {
            aspect: "",
            operation: "Cartesian Product",
            symbol: "\\(A \\times B\\)",
            english: "All pairs (a,b)",
            formula: "\\(\\{(a,b) : a \\in A, b \\in B\\}\\)"
          }
        ]
      };

      return (
        <div className="space-y-6">
          <ComparisonTable {...operationsReference} />
          
          <SimpleInsightBox title="Quick Memory Tips" theme="teal">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>∪ looks like U:</strong> "Union" (combine)</p>
                <p><strong>∩ looks like ∧:</strong> "And" (overlap)</p>
                <p><strong>ᶜ stands for:</strong> "Complement" (opposite)</p>
              </div>
              <div>
                <p><strong>∅ is empty:</strong> Like an empty bag</p>
                <p><strong>S is everything:</strong> The whole sample space</p>
                <p><strong>\\ means subtract:</strong> Remove the second set</p>
              </div>
            </div>
          </SimpleInsightBox>
        </div>
      );
    }
  },
  {
    id: 'demorgans-reference',
    title: "De Morgan's Laws & Key Identities",
    content: ({ sectionIndex, isCompleted }) => {
      const demorganReference = {
        title: "Essential Identities for Set Operations",
        formulas: [
          {
            title: "De Morgan's First Law",
            formula: "(A \\cup B)^c = A^c \\cap B^c",
            description: "NOT (A OR B) = (NOT A) AND (NOT B)"
          },
          {
            title: "De Morgan's Second Law",
            formula: "(A \\cap B)^c = A^c \\cup B^c", 
            description: "NOT (A AND B) = (NOT A) OR (NOT B)"
          },
          {
            title: "Double Complement",
            formula: "(A^c)^c = A",
            description: "NOT NOT A = A"
          },
          {
            title: "Complement Laws",
            formula: "A \\cup A^c = S \\text{ and } A \\cap A^c = \\emptyset",
            description: "A plus its opposite covers everything and overlaps nothing"
          }
        ],
        theme: "purple"
      };

      return (
        <div className="space-y-6">
          <SideBySideFormulas {...demorganReference} defaultExpanded={true} />
          
          <div className="grid md:grid-cols-2 gap-4">
            <SimpleFormulaCard 
              title="Absorption Laws" 
              formula={`A \\cup (A \\cap B) = A \\\\ A \\cap (A \\cup B) = A`}
              description="A absorbs combinations with itself"
              theme="blue"
            />
            <SimpleFormulaCard 
              title="Distributive Laws" 
              formula={`A \\cap (B \\cup C) = (A \\cap B) \\cup (A \\cap C) \\\\ A \\cup (B \\cap C) = (A \\cup B) \\cap (A \\cup C)`}
              description="Operations distribute over each other"
              theme="blue"
            />
          </div>

          <InterpretationBox theme="purple" title="When to Use De Morgan's Laws">
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Simplifying negations:</strong> When you see "NOT (A OR B)" or "NOT (A AND B)"</li>
              <li><strong>Programming logic:</strong> Converting between AND/OR in conditional statements</li>
              <li><strong>Probability calculations:</strong> Finding complements of compound events</li>
              <li><strong>Boolean algebra:</strong> Optimizing logical expressions</li>
            </ul>
          </InterpretationBox>
        </div>
      );
    }
  },
  {
    id: 'decision-flowchart',
    title: 'Operation Decision Guide',
    content: ({ sectionIndex, isCompleted }) => {
      const decisionGuide = {
        title: "Which Operation Should I Use?",
        columns: [
          { key: 'scenario', title: 'If You Want...', color: 'text-blue-400' },
          { key: 'operation', title: 'Use This Operation', color: 'text-green-400' },
          { key: 'example', title: 'Example', color: 'text-purple-400' }
        ],
        rows: [
          {
            aspect: "Combining",
            scenario: "Elements that are in either set",
            operation: "Union (∪)",
            example: "Students in Math OR Physics"
          },
          {
            aspect: "",
            scenario: "Elements that are in both sets",
            operation: "Intersection (∩)",
            example: "Students in Math AND Physics"
          },
          {
            aspect: "",
            scenario: "Elements NOT in a set",
            operation: "Complement (ᶜ)",
            example: "Students NOT in Math"
          },
          {
            aspect: "",
            scenario: "Elements in first set but not second",
            operation: "Difference (\\)",
            example: "Students in Math but NOT Physics"
          },
          {
            aspect: "Complex",
            scenario: "At least one condition true",
            operation: "Union (∪)",
            example: "Pass exam1 OR exam2 OR exam3"
          },
          {
            aspect: "",
            scenario: "All conditions true",
            operation: "Intersection (∩)",
            example: "Pass exam1 AND exam2 AND exam3"
          },
          {
            aspect: "",
            scenario: "Exactly one condition true",
            operation: "Symmetric Difference (△)",
            example: "Pass exam1 OR exam2 but not both"
          },
          {
            aspect: "",
            scenario: "None of the conditions true",
            operation: "Complement of Union",
            example: "(Pass exam1 OR exam2)ᶜ"
          }
        ]
      };

      return (
        <div className="space-y-6">
          <ComparisonTable {...decisionGuide} />
          
          <InterpretationBox theme="teal" title="Decision Process">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><strong>Identify the English phrase:</strong> Look for "or", "and", "not", "but not"</li>
              <li><strong>Determine combination type:</strong> Are you combining, intersecting, or negating?</li>
              <li><strong>Check for complexity:</strong> Multiple operations? Work inside-out</li>
              <li><strong>Apply the operation:</strong> Use the appropriate symbol</li>
              <li><strong>Verify with Venn diagram:</strong> Does your answer make visual sense?</li>
            </ol>
          </InterpretationBox>
        </div>
      );
    }
  },
  {
    id: 'common-mistakes',
    title: 'Common Mistakes & How to Avoid Them',
    content: ({ sectionIndex, isCompleted }) => (
      <div className="space-y-6">
        <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
          <h4 className="font-semibold text-red-400 mb-3">Mistake #1: Confusing AND/OR with ∩/∪</h4>
          <div className="text-sm space-y-2">
            <p className="text-neutral-300">
              <strong>Wrong:</strong> "A and B" → A ∪ B
            </p>
            <p className="text-neutral-300">
              <strong>Right:</strong> "A and B" → A ∩ B
            </p>
            <p className="text-neutral-400 text-xs">
              Remember: AND = intersection (∩), OR = union (∪)
            </p>
          </div>
        </div>

        <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
          <h4 className="font-semibold text-red-400 mb-3">Mistake #2: Incorrect De Morgan's Application</h4>
          <div className="text-sm space-y-2">
            <p className="text-neutral-300">
              <strong>Wrong:</strong> (A ∪ B)ᶜ = Aᶜ ∪ Bᶜ
            </p>
            <p className="text-neutral-300">
              <strong>Right:</strong> (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ
            </p>
            <p className="text-neutral-400 text-xs">
              De Morgan flips the operation: OR becomes AND, AND becomes OR
            </p>
          </div>
        </div>

        <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
          <h4 className="font-semibold text-red-400 mb-3">Mistake #3: Forgetting the Universal Set</h4>
          <div className="text-sm space-y-2">
            <p className="text-neutral-300">
              <strong>Wrong:</strong> Aᶜ = "everything not in A"
            </p>
            <p className="text-neutral-300">
              <strong>Right:</strong> Aᶜ = "everything in S that's not in A"
            </p>
            <p className="text-neutral-400 text-xs">
              Complements are always relative to the sample space S
            </p>
          </div>
        </div>

        <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
          <h4 className="font-semibold text-red-400 mb-3">Mistake #4: Order of Operations</h4>
          <div className="text-sm space-y-2">
            <p className="text-neutral-300">
              <strong>Ambiguous:</strong> A ∪ B ∩ C
            </p>
            <p className="text-neutral-300">
              <strong>Clear:</strong> A ∪ (B ∩ C) or (A ∪ B) ∩ C
            </p>
            <p className="text-neutral-400 text-xs">
              Always use parentheses to make the order clear
            </p>
          </div>
        </div>

        <SimpleInsightBox title="Mistake Prevention Strategy" theme="green">
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li><strong>Draw Venn diagrams:</strong> Visualize to check your work</li>
            <li><strong>Use small examples:</strong> Test with simple sets first</li>
            <li><strong>Check extreme cases:</strong> What if A = ∅ or A = S?</li>
            <li><strong>Verify with complements:</strong> Does A ∪ Aᶜ = S?</li>
          </ol>
        </SimpleInsightBox>
      </div>
    )
  }
];

export default function Tab3QuickReferenceTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Quick Reference"
      description="Complete operations reference, decision guides, and common pitfalls"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="purple"
      showHeader={false}
    />
  );
}