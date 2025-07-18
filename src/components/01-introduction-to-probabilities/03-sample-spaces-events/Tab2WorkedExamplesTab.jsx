"use client";

import React, { useState } from 'react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { StepByStepCalculation, CalculationStep, FormulaDisplay } from '@/components/ui/patterns/StepByStepCalculation';
import { ComparisonTable } from '@/components/ui/patterns/ComparisonTable';
import { InterpretationBox } from '@/components/ui/patterns/InterpretationBox';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';

const SECTIONS = [
  {
    id: 'basic-operations',
    title: 'Basic Set Operations Example',
    content: ({ sectionIndex, isCompleted }) => (
      <div className="space-y-6">
        <StepByStepCalculation title="Working with Server Components" theme="blue">
          <CalculationStep title="The Setup" variant="default">
            <p className="text-neutral-300 mb-3">
              A web application has three main components. Let's define:
            </p>
            <div className="space-y-2">
              <div className="bg-neutral-800 rounded p-3">
                <p className="text-sm"><strong>D</strong> = Database is working = {Server1, Server2, Server5}</p>
              </div>
              <div className="bg-neutral-800 rounded p-3">
                <p className="text-sm"><strong>A</strong> = API is working = {Server2, Server3, Server4}</p>
              </div>
              <div className="bg-neutral-800 rounded p-3">
                <p className="text-sm"><strong>S</strong> = All servers = {Server1, Server2, Server3, Server4, Server5}</p>
              </div>
            </div>
          </CalculationStep>

          <CalculationStep title="Union: D ∪ A (Either component working)" variant="default">
            <p className="text-neutral-300 mb-3">
              Find all servers where <em>either</em> the database <em>or</em> API is working:
            </p>
            <FormulaDisplay formula="D \cup A = \{Server1, Server2, Server5\} \cup \{Server2, Server3, Server4\}" />
            <FormulaDisplay formula="D \cup A = \{Server1, Server2, Server3, Server4, Server5\}" />
            <InterpretationBox theme="blue">
              The union includes Server2 only once (no duplicates in sets)
            </InterpretationBox>
          </CalculationStep>

          <CalculationStep title="Intersection: D ∩ A (Both components working)" variant="default">
            <p className="text-neutral-300 mb-3">
              Find servers where <em>both</em> database <em>and</em> API are working:
            </p>
            <FormulaDisplay formula="D \cap A = \{Server1, Server2, Server5\} \cap \{Server2, Server3, Server4\}" />
            <FormulaDisplay formula="D \cap A = \{Server2\}" />
            <InterpretationBox theme="teal">
              Only Server2 appears in both sets
            </InterpretationBox>
          </CalculationStep>

          <CalculationStep title="Complement: Dᶜ (Database not working)" variant="highlight">
            <p className="text-neutral-300 mb-3">
              Find servers where the database is <em>not</em> working:
            </p>
            <FormulaDisplay formula="D^c = S \setminus D = \{Server1, Server2, Server3, Server4, Server5\} \setminus \{Server1, Server2, Server5\}" />
            <FormulaDisplay formula="D^c = \{Server3, Server4\}" />
            <SimpleInsightBox theme="green" title="Complement Check">
              Notice: D ∪ Dᶜ = {Server1, Server2, Server5} ∪ {Server3, Server4} = S ✓
            </SimpleInsightBox>
          </CalculationStep>
        </StepByStepCalculation>
      </div>
    )
  },
  {
    id: 'demorgans-proof',
    title: "Proving De Morgan's Laws",
    content: ({ sectionIndex, isCompleted }) => (
      <div className="space-y-6">
        <StepByStepCalculation title="De Morgan's First Law: (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ" theme="purple">
          <CalculationStep title="Using the Server Example" variant="default">
            <p className="text-neutral-300 mb-3">
              Let's prove this using our server data:
            </p>
            <div className="space-y-2 text-sm">
              <p>D = {Server1, Server2, Server5}</p>
              <p>A = {Server2, Server3, Server4}</p>
              <p>S = {Server1, Server2, Server3, Server4, Server5}</p>
            </div>
          </CalculationStep>

          <CalculationStep title="Step 1: Calculate Left Side (A ∪ B)ᶜ" variant="default">
            <FormulaDisplay formula="D \cup A = \{Server1, Server2, Server3, Server4, Server5\}" />
            <FormulaDisplay formula="(D \cup A)^c = S \setminus (D \cup A) = \{Server1, Server2, Server3, Server4, Server5\} \setminus \{Server1, Server2, Server3, Server4, Server5\}" />
            <FormulaDisplay formula="(D \cup A)^c = \emptyset" />
          </CalculationStep>

          <CalculationStep title="Step 2: Calculate Right Side Aᶜ ∩ Bᶜ" variant="default">
            <FormulaDisplay formula="D^c = \{Server3, Server4\}" />
            <FormulaDisplay formula="A^c = \{Server1, Server5\}" />
            <FormulaDisplay formula="D^c \cap A^c = \{Server3, Server4\} \cap \{Server1, Server5\} = \emptyset" />
          </CalculationStep>

          <CalculationStep title="Step 3: Compare Results" variant="highlight">
            <div className="bg-green-900/20 p-4 rounded border border-green-600/30">
              <p className="text-neutral-300">Left side: (D ∪ A)ᶜ = ∅</p>
              <p className="text-neutral-300">Right side: Dᶜ ∩ Aᶜ = ∅</p>
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
    )
  },
  {
    id: 'complex-expressions',
    title: 'Building Complex Expressions',
    content: ({ sectionIndex, isCompleted }) => (
      <div className="space-y-6">
        <StepByStepCalculation title="Multi-Component System Analysis" theme="teal">
          <CalculationStep title="The Scenario" variant="default">
            <div className="bg-teal-900/20 p-4 rounded border border-teal-600/30">
              <p className="text-neutral-300 mb-3">
                A cloud system has three services: Authentication (A), Database (D), and Cache (C). 
                We want to analyze different failure scenarios.
              </p>
              <div className="text-sm space-y-1">
                <p>A = {Server1, Server3, Server5}</p>
                <p>D = {Server2, Server3, Server4}</p>
                <p>C = {Server1, Server4, Server5}</p>
              </div>
            </div>
          </CalculationStep>

          <CalculationStep title="Scenario 1: 'At least one service fails'" variant="default">
            <p className="text-neutral-300 mb-3">
              Translation: NOT(all services working) = (A ∩ D ∩ C)ᶜ
            </p>
            <FormulaDisplay formula="A \cap D \cap C = \{Server1, Server3, Server5\} \cap \{Server2, Server3, Server4\} \cap \{Server1, Server4, Server5\}" />
            <FormulaDisplay formula="A \cap D \cap C = \{Server3\} \cap \{Server1, Server4, Server5\} = \emptyset" />
            <FormulaDisplay formula="(A \cap D \cap C)^c = S \setminus \emptyset = S" />
            <InterpretationBox theme="teal">
              Since no server runs all three services, "at least one service fails" is always true (probability = 1)
            </InterpretationBox>
          </CalculationStep>

          <CalculationStep title="Scenario 2: 'Authentication works but database fails'" variant="default">
            <p className="text-neutral-300 mb-3">
              Translation: A ∩ Dᶜ (A AND NOT D)
            </p>
            <FormulaDisplay formula="D^c = S \setminus D = \{Server1, Server5\}" />
            <FormulaDisplay formula="A \cap D^c = \{Server1, Server3, Server5\} \cap \{Server1, Server5\}" />
            <FormulaDisplay formula="A \cap D^c = \{Server1, Server5\}" />
            <InterpretationBox theme="blue">
              Servers 1 and 5 have authentication but no database service
            </InterpretationBox>
          </CalculationStep>

          <CalculationStep title="Scenario 3: 'Exactly two services work'" variant="highlight">
            <p className="text-neutral-300 mb-3">
              This is more complex - we need servers where exactly 2 of the 3 services work:
            </p>
            <div className="space-y-2 text-sm">
              <FormulaDisplay formula="(A \cap D \cap C^c) \cup (A \cap D^c \cap C) \cup (A^c \cap D \cap C)" />
            </div>
            <div className="bg-neutral-800 rounded p-3 text-sm space-y-1">
              <p>A ∩ D ∩ Cᶜ = {Server3} ∩ {Server2, Server3, Server4} = ∅</p>
              <p>A ∩ Dᶜ ∩ C = {Server1, Server5} ∩ {Server1, Server4, Server5} = {Server1, Server5}</p>
              <p>Aᶜ ∩ D ∩ C = {Server2, Server4} ∩ {Server2, Server3, Server4} ∩ {Server1, Server4, Server5} = {Server4}</p>
            </div>
            <FormulaDisplay formula="\text{Result: } \{Server1, Server4, Server5\}" />
          </CalculationStep>
        </StepByStepCalculation>
      </div>
    )
  },
  {
    id: 'operation-properties',
    title: 'Key Properties and Laws',
    content: ({ sectionIndex, isCompleted }) => {
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
        <div className="space-y-6">
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