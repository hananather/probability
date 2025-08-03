"use client";

import React, { useState } from 'react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { StepByStepCalculation, CalculationStep, FormulaDisplay } from '@/components/ui/patterns/StepByStepCalculation';
import { ComparisonTable } from '@/components/ui/patterns/ComparisonTable';
import { InterpretationBox } from '@/components/ui/patterns/InterpretationBox';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';
import { useMathJax } from '@/hooks/useMathJax';

const SECTIONS = [
  {
    id: 'basic-operations',
    title: 'Basic Set Operations Example',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useMathJax([sectionIndex, isCompleted]);
      
      return (
        <div ref={contentRef} className="space-y-6">
          <StepByStepCalculation title="Working with Server Components" theme="blue">
            <CalculationStep title="The Setup" variant="default">
              <p className="text-neutral-300 mb-3">
                A web application has three main components. Let's define:
              </p>
              <div className="space-y-2">
                <div className="bg-neutral-800 rounded p-3">
                  <p className="text-sm"><strong>D</strong> = Database is working = {'{'} Server1, Server2, Server5 {'}'}</p>
                </div>
                <div className="bg-neutral-800 rounded p-3">
                  <p className="text-sm"><strong>A</strong> = API is working = {'{'} Server2, Server3, Server4 {'}'}</p>
                </div>
                <div className="bg-neutral-800 rounded p-3">
                  <p className="text-sm"><strong>S</strong> = All servers = {'{'} Server1, Server2, Server3, Server4, Server5 {'}'}</p>
                </div>
              </div>
            </CalculationStep>

            <CalculationStep title="Union: D ∪ A (Either component working)" variant="default">
              <p className="text-neutral-300 mb-3">
                Find all servers where <em>either</em> the database <em>or</em> API is working:
              </p>
              <FormulaDisplay formula={`D \\cup A = \\{\\text{Server1, Server2, Server5}\\} \\cup \\{\\text{Server2, Server3, Server4}\\}`} />
              <FormulaDisplay formula={`D \\cup A = \\{\\text{Server1, Server2, Server3, Server4, Server5}\\}`} />
              <InterpretationBox theme="blue">
                The union includes Server2 only once (no duplicates in sets)
              </InterpretationBox>
            </CalculationStep>

            <CalculationStep title="Intersection: D ∩ A (Both components working)" variant="default">
              <p className="text-neutral-300 mb-3">
                Find servers where <em>both</em> database <em>and</em> API are working:
              </p>
              <FormulaDisplay formula={`D \\cap A = \\{\\text{Server1, Server2, Server5}\\} \\cap \\{\\text{Server2, Server3, Server4}\\}`} />
              <FormulaDisplay formula={`D \\cap A = \\{\\text{Server2}\\}`} />
              <InterpretationBox theme="teal">
                Only Server2 appears in both sets
              </InterpretationBox>
            </CalculationStep>

            <CalculationStep title="Complement: Dᶜ (Database not working)" variant="highlight">
              <p className="text-neutral-300 mb-3">
                Find servers where the database is <em>not</em> working:
              </p>
              <FormulaDisplay formula={`D^c = S \\setminus D = \\{\\text{Server1, Server2, Server3, Server4, Server5}\\} \\setminus \\{\\text{Server1, Server2, Server5}\\}`} />
              <FormulaDisplay formula={`D^c = \\{\\text{Server3, Server4}\\}`} />
              <SimpleInsightBox theme="green" title="Complement Check">
                <span dangerouslySetInnerHTML={{ __html: `Notice: \\(D \\cup D^c = \\{\\text{Server1, Server2, Server5}\\} \\cup \\{\\text{Server3, Server4}\\} = S\\) ✓` }} />
              </SimpleInsightBox>
            </CalculationStep>
          </StepByStepCalculation>
        </div>
      );
    }
  },
  {
    id: 'demorgans-proof',
    title: "Proving De Morgan's Laws",
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useMathJax([sectionIndex, isCompleted]);
      
      return (
        <div ref={contentRef} className="space-y-6">
          <StepByStepCalculation title="De Morgan's First Law: (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ" theme="purple">
            <CalculationStep title="Using the Server Example" variant="default">
              <p className="text-neutral-300 mb-3">
                Let's prove this using our server data:
              </p>
              <div className="space-y-2 text-sm">
                <p>D = {'{'} Server1, Server2, Server5 {'}'}</p>
                <p>A = {'{'} Server2, Server3, Server4 {'}'}</p>
                <p>S = {'{'} Server1, Server2, Server3, Server4, Server5 {'}'}</p>
              </div>
            </CalculationStep>

            <CalculationStep title="Step 1: Calculate Left Side (D ∪ A)ᶜ" variant="default">
              <FormulaDisplay formula={`D \\cup A = \\{\\text{Server1, Server2, Server3, Server4, Server5}\\}`} />
              <FormulaDisplay formula={`(D \\cup A)^c = S \\setminus (D \\cup A) = \\{\\text{Server1, ..., Server5}\\} \\setminus \\{\\text{Server1, ..., Server5}\\}`} />
              <FormulaDisplay formula={`(D \\cup A)^c = \\emptyset`} />
            </CalculationStep>

            <CalculationStep title="Step 2: Calculate Right Side Dᶜ ∩ Aᶜ" variant="default">
              <FormulaDisplay formula={`D^c = \\{\\text{Server3, Server4}\\}`} />
              <FormulaDisplay formula={`A^c = \\{\\text{Server1, Server5}\\}`} />
              <FormulaDisplay formula={`D^c \\cap A^c = \\{\\text{Server3, Server4}\\} \\cap \\{\\text{Server1, Server5}\\} = \\emptyset`} />
            </CalculationStep>

            <CalculationStep title="Step 3: Compare Results" variant="highlight">
              <div className="bg-green-900/20 p-4 rounded border border-green-600/30">
                <p className="text-neutral-300">
                  Left side: <span dangerouslySetInnerHTML={{ __html: `\\((D \\cup A)^c = \\emptyset\\)` }} />
                </p>
                <p className="text-neutral-300">
                  Right side: <span dangerouslySetInnerHTML={{ __html: `\\(D^c \\cap A^c = \\emptyset\\)` }} />
                </p>
                <p className="text-green-400 font-semibold mt-2">✓ Both sides are equal! De Morgan's Law verified.</p>
              </div>
              
              <InterpretationBox theme="purple" title="Why This Works">
                <p>
                  In this case, D ∪ A = S (all servers), so (D ∪ A)ᶜ = ∅. 
                  And since Dᶜ and Aᶜ don't overlap, their intersection is also ∅.
                </p>
              </InterpretationBox>
            </CalculationStep>
          </StepByStepCalculation>
        </div>
      );
    }
  },
  {
    id: 'card-example',
    title: 'Real-World Example: Card Game',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useMathJax([sectionIndex, isCompleted]);
      
      return (
        <div ref={contentRef} className="space-y-6">
          <StepByStepCalculation title="Analyzing a Card Game with Set Operations" theme="teal">
            <CalculationStep title="The Setup" variant="default">
              <div className="bg-teal-900/20 p-4 rounded border border-teal-600/30">
                <p className="text-neutral-300 mb-3">
                  From a standard deck of 52 cards, let's define these events:
                </p>
                <div className="text-sm space-y-1">
                  <p><strong>F</strong> = Face cards (J, Q, K) = 12 cards</p>
                  <p><strong>R</strong> = Red cards (♥, ♦) = 26 cards</p>
                  <p><strong>H</strong> = Hearts (♥) = 13 cards</p>
                </div>
              </div>
            </CalculationStep>

            <CalculationStep title="Example 1: Face Card OR Red Card" variant="default">
              <p className="text-neutral-300 mb-3">
                Find: <span dangerouslySetInnerHTML={{ __html: `\\(F \\cup R\\)` }} /> - Cards that are face cards OR red cards
              </p>
              <div className="bg-neutral-800 rounded p-3 text-sm mb-3">
                <p>We need to count:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>All face cards: 12 cards</li>
                  <li>All red cards: 26 cards</li>
                  <li>But don't double-count red face cards!</li>
                </ul>
              </div>
              <FormulaDisplay formula={`|F \\cup R| = |F| + |R| - |F \\cap R|`} />
              <FormulaDisplay formula={`|F \\cup R| = 12 + 26 - 6 = 32`} />
              <InterpretationBox theme="teal">
                6 cards are both face cards AND red (J♥, Q♥, K♥, J♦, Q♦, K♦)
              </InterpretationBox>
            </CalculationStep>

            <CalculationStep title="Example 2: Hearts BUT NOT Face Cards" variant="default">
              <p className="text-neutral-300 mb-3">
                Find: <span dangerouslySetInnerHTML={{ __html: `\\(H \\setminus F\\)` }} /> - Hearts that are not face cards
              </p>
              <FormulaDisplay formula={`H \\setminus F = \\{A♥, 2♥, 3♥, 4♥, 5♥, 6♥, 7♥, 8♥, 9♥, 10♥\\}`} />
              <FormulaDisplay formula={`|H \\setminus F| = 13 - 3 = 10`} />
              <InterpretationBox theme="blue">
                We remove the 3 heart face cards (J♥, Q♥, K♥) from the 13 hearts
              </InterpretationBox>
            </CalculationStep>

            <CalculationStep title="Example 3: Using De Morgan's Law" variant="highlight">
              <p className="text-neutral-300 mb-3">
                Find: Cards that are NOT (Face card OR Heart)
              </p>
              <p className="text-neutral-300 mb-2">
                Using De Morgan's Law: <span dangerouslySetInnerHTML={{ __html: `\\((F \\cup H)^c = F^c \\cap H^c\\)` }} />
              </p>
              <div className="bg-neutral-800 rounded p-3 text-sm mb-3">
                <p>This means: NOT face card AND NOT heart</p>
                <p className="mt-2">These are the number cards (A-10) in spades, clubs, and diamonds:</p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Spades: A♠ through 10♠ (10 cards)</li>
                  <li>Clubs: A♣ through 10♣ (10 cards)</li>
                  <li>Diamonds: A♦ through 10♦ (10 cards)</li>
                </ul>
              </div>
              <FormulaDisplay formula={`|(F \\cup H)^c| = |F^c \\cap H^c| = 30`} />
              <SimpleInsightBox theme="green" title="Verification">
                <span dangerouslySetInnerHTML={{ __html: `Total cards = 52, \\(|F \\cup H| = 12 + 13 - 3 = 22\\), so \\(|(F \\cup H)^c| = 52 - 22 = 30\\) ✓` }} />
              </SimpleInsightBox>
            </CalculationStep>
          </StepByStepCalculation>
        </div>
      );
    }
  },
  {
    id: 'operation-properties',
    title: 'Key Properties and Laws',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useMathJax([sectionIndex, isCompleted]);
      
      const operationProperties = {
        title: "Important Set Operation Properties",
        columns: [
          { key: 'property', title: 'Property', color: 'text-blue-400' },
          { key: 'formula', title: 'Mathematical Form', color: 'text-green-400' },
          { key: 'description', title: 'Meaning', color: 'text-purple-400' }
        ],
        rows: [
          {
            aspect: "Commutative Laws",
            property: "Union Commutative",
            formula: "\\(A \\cup B = B \\cup A\\)",
            description: "Order doesn't matter for union"
          },
          {
            aspect: "",
            property: "Intersection Commutative",
            formula: "\\(A \\cap B = B \\cap A\\)",
            description: "Order doesn't matter for intersection"
          },
          {
            aspect: "Associative Laws",
            property: "Union Associative",
            formula: "\\((A \\cup B) \\cup C = A \\cup (B \\cup C)\\)",
            description: "Grouping doesn't matter for union"
          },
          {
            aspect: "",
            property: "Intersection Associative",
            formula: "\\((A \\cap B) \\cap C = A \\cap (B \\cap C)\\)",
            description: "Grouping doesn't matter for intersection"
          },
          {
            aspect: "Distributive Laws",
            property: "Union over Intersection",
            formula: "\\(A \\cup (B \\cap C) = (A \\cup B) \\cap (A \\cup C)\\)",
            description: "Union distributes over intersection"
          },
          {
            aspect: "",
            property: "Intersection over Union",
            formula: "\\(A \\cap (B \\cup C) = (A \\cap B) \\cup (A \\cap C)\\)",
            description: "Intersection distributes over union"
          },
          {
            aspect: "Identity Laws",
            property: "Union with Empty Set",
            formula: "\\(A \\cup \\emptyset = A\\)",
            description: "Empty set doesn't change union"
          },
          {
            aspect: "",
            property: "Intersection with Universal",
            formula: "\\(A \\cap S = A\\)",
            description: "Universal set doesn't change intersection"
          }
        ]
      };

      return (
        <div ref={contentRef} className="space-y-6">
          <ComparisonTable {...operationProperties} />
          
          <InterpretationBox theme="green" title="Why These Properties Matter">
            <p>
              These properties let you simplify complex expressions and are essential for:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm ml-4">
              <li><strong>Simplification:</strong> Rearrange expressions for easier calculation</li>
              <li><strong>Proof techniques:</strong> Show equivalence between different forms</li>
              <li><strong>Algorithm optimization:</strong> Find more efficient computation paths</li>
              <li><strong>Probability calculations:</strong> Transform complex events into simpler ones</li>
            </ul>
          </InterpretationBox>

          <SimpleInsightBox title="Master Strategy" theme="purple">
            <p>
              <strong>Practice identifying patterns:</strong> When you see complex expressions, 
              look for opportunities to apply these properties to simplify before calculating.
            </p>
          </SimpleInsightBox>
        </div>
      );
    }
  }
];

export default function Tab2WorkedExamplesTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Worked Examples"
      description="Step-by-step examples with set operations and De Morgan's laws"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="blue"
      showHeader={false}
    />
  );
}