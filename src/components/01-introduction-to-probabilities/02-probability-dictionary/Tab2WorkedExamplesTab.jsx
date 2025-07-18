"use client";

import React, { useState } from 'react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { StepByStepCalculation, CalculationStep, FormulaDisplay } from '@/components/ui/patterns/StepByStepCalculation';
import { ComparisonTable } from '@/components/ui/patterns/ComparisonTable';
import { InterpretationBox } from '@/components/ui/patterns/InterpretationBox';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';

// Extract the practice component to avoid hooks in section content
const PracticeTranslationSection = () => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState({});

  const practiceProblems = [
    {
      id: 1,
      english: "The probability that it rains tomorrow AND it's sunny today",
      options: [
        "P(Rain ∪ Sunny)",
        "P(Rain ∩ Sunny)",
        "P(Rain | Sunny)",
        "P(Rain) × P(Sunny)"
      ],
      correct: 1,
      explanation: "'AND' translates to intersection (∩)"
    },
    {
      id: 2,
      english: "Given that the patient has symptoms, what's the probability they have the disease?",
      options: [
        "P(Disease ∩ Symptoms)",
        "P(Disease ∪ Symptoms)",
        "P(Disease | Symptoms)",
        "P(Symptoms | Disease)"
      ],
      correct: 2,
      explanation: "'Given that' indicates conditional probability with symptoms as the condition"
    },
    {
      id: 3,
      english: "At least one of the three machines is working",
      options: [
        "P(M₁ ∩ M₂ ∩ M₃)",
        "P(M₁ ∪ M₂ ∪ M₃)",
        "P(M₁) + P(M₂) + P(M₃)",
        "1 - P(M₁ᶜ ∩ M₂ᶜ ∩ M₃ᶜ)"
      ],
      correct: 1,
      explanation: "'At least one' means union (∪). Option 4 is also correct using complement rule!"
    }
  ];

  const handleAnswer = (problemId, answerIndex) => {
    setSelectedAnswers(prev => ({ ...prev, [problemId]: answerIndex }));
    setShowFeedback(prev => ({ ...prev, [problemId]: true }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/50 rounded-lg p-6">
        <h4 className="font-bold text-white mb-6">Practice Translation Problems</h4>
        
        {practiceProblems.map((problem) => (
          <div key={problem.id} className="mb-8 last:mb-0">
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-600/30 mb-4">
              <p className="text-neutral-300 font-medium">
                Problem {problem.id}: "{problem.english}"
              </p>
            </div>
            
            <div className="space-y-2">
              {problem.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(problem.id, index)}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    selectedAnswers[problem.id] === index
                      ? index === problem.correct 
                        ? 'bg-green-900/30 border-green-500 text-green-400'
                        : 'bg-red-900/30 border-red-500 text-red-400'
                      : 'bg-neutral-800 border-neutral-600 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <span dangerouslySetInnerHTML={{ __html: option }} />
                </button>
              ))}
            </div>

            {showFeedback[problem.id] && (
              <div className="mt-4">
                {selectedAnswers[problem.id] === problem.correct ? (
                  <InterpretationBox theme="green" title="Correct! 🎉">
                    <p>{problem.explanation}</p>
                  </InterpretationBox>
                ) : (
                  <InterpretationBox theme="red" title="Not quite...">
                    <p>{problem.explanation}</p>
                    <p className="mt-2 text-sm">
                      Correct answer: {problem.options[problem.correct]}
                    </p>
                  </InterpretationBox>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <SimpleInsightBox title="Keep Practicing!" theme="purple">
        <p>
          Translation is a skill that improves with practice. The more you work with 
          both languages, the more natural the conversion becomes.
        </p>
      </SimpleInsightBox>
    </div>
  );
};

const SECTIONS = [
  {
    id: 'basic-translation',
    title: 'Basic Translation Example',
    content: ({ sectionIndex, isCompleted }) => (
      <div className="space-y-6">
        <StepByStepCalculation title="From English to Math: Step by Step" theme="blue">
          <CalculationStep title="Start with English" variant="default">
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
              <p className="text-neutral-300 text-lg">
                "A coin is flipped twice. What's the probability that we get heads on the first flip OR heads on the second flip?"
              </p>
            </div>
          </CalculationStep>

          <CalculationStep title="Step 1: Identify the Sample Space" variant="default">
            <p className="text-neutral-300 mb-3">
              First, list all possible outcomes:
            </p>
            <FormulaDisplay formula="S = \{HH, HT, TH, TT\}" />
            <p className="text-sm text-neutral-400">
              Each outcome is equally likely with probability 1/4
            </p>
          </CalculationStep>

          <CalculationStep title="Step 2: Translate Events to Set Notation" variant="default">
            <div className="space-y-3">
              <p className="text-neutral-300">Let's define our events:</p>
              <div className="bg-neutral-800 rounded p-3">
                <p className="text-sm"><strong>A:</strong> "heads on first flip" = <span dangerouslySetInnerHTML={{ __html: `\\(\\{HH, HT\\}\\)` }} /></p>
              </div>
              <div className="bg-neutral-800 rounded p-3">
                <p className="text-sm"><strong>B:</strong> "heads on second flip" = <span dangerouslySetInnerHTML={{ __html: `\\(\\{HH, TH\\}\\)` }} /></p>
              </div>
            </div>
          </CalculationStep>

          <CalculationStep title="Step 3: Translate 'OR' to Union" variant="highlight">
            <p className="text-neutral-300 mb-3">
              "A OR B" translates to <span dangerouslySetInnerHTML={{ __html: `\\(A \\cup B\\)` }} />
            </p>
            <FormulaDisplay formula="A \cup B = \{HH, HT\} \cup \{HH, TH\} = \{HH, HT, TH\}" />
            <FormulaDisplay formula="P(A \cup B) = \frac{3}{4} = 0.75" />
            
            <InterpretationBox theme="blue">
              75% chance of getting heads on at least one flip
            </InterpretationBox>
          </CalculationStep>
        </StepByStepCalculation>
      </div>
    )
  },
  {
    id: 'complex-translation',
    title: 'Complex Translation Challenge',
    content: ({ sectionIndex, isCompleted }) => (
      <div className="space-y-6">
        <StepByStepCalculation title="Advanced Translation: Medical Testing" theme="purple">
          <CalculationStep title="The Scenario" variant="default">
            <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-600/30">
              <p className="text-neutral-300 text-lg mb-3">
                "A medical test is 95% accurate for people WITH the disease and 90% accurate for people WITHOUT the disease. 
                What's the probability that someone tests positive AND actually has the disease?"
              </p>
            </div>
          </CalculationStep>

          <CalculationStep title="Step 1: Define Events in English" variant="default">
            <div className="space-y-2">
              <div className="bg-neutral-800 rounded p-3">
                <p className="text-sm"><strong>D:</strong> "Person has the disease"</p>
              </div>
              <div className="bg-neutral-800 rounded p-3">
                <p className="text-sm"><strong>T⁺:</strong> "Test result is positive"</p>
              </div>
              <div className="bg-neutral-800 rounded p-3">
                <p className="text-sm"><strong>Question:</strong> "Tests positive AND has disease"</p>
              </div>
            </div>
          </CalculationStep>

          <CalculationStep title="Step 2: Translate to Mathematical Notation" variant="default">
            <div className="space-y-3">
              <p className="text-neutral-300">Given information:</p>
              <FormulaDisplay formula="P(T^+ | D) = 0.95 \text{ (95% accurate if has disease)}" />
              <FormulaDisplay formula="P(T^- | D^c) = 0.90 \text{ (90% accurate if no disease)}" />
              <p className="text-neutral-300 mt-3">Question asks for:</p>
              <FormulaDisplay formula="P(D \cap T^+) \text{ ('AND' becomes intersection)}" />
            </div>
          </CalculationStep>

          <CalculationStep title="Step 3: Apply Translation Rules" variant="highlight">
            <p className="text-neutral-300 mb-3">
              This is actually asking for conditional probability in reverse:
            </p>
            <FormulaDisplay formula="P(D | T^+) = \frac{P(T^+ | D) \cdot P(D)}{P(T^+)}" />
            
            <SimpleInsightBox theme="orange" title="Translation Insight">
              The English question "tests positive AND has disease" often means 
              "given that they tested positive, what's the chance they have the disease?" 
              - This is P(D|T⁺), not P(D∩T⁺)!
            </SimpleInsightBox>
          </CalculationStep>
        </StepByStepCalculation>
      </div>
    )
  },
  {
    id: 'common-translations',
    title: 'Common Translation Patterns',
    content: ({ sectionIndex, isCompleted }) => {
      const translationPatterns = {
        title: "Common English-to-Math Translation Patterns",
        columns: [
          { key: 'english', title: 'English Phrase', color: 'text-blue-400' },
          { key: 'math', title: 'Mathematical Notation', color: 'text-green-400' },
          { key: 'trap', title: 'Common Mistake', color: 'text-red-400' }
        ],
        rows: [
          {
            aspect: "Logical combinations",
            english: "at least one of A, B, C",
            math: "\\(A \\cup B \\cup C\\)",
            trap: "Using \\(A \\cap B \\cap C\\) (means ALL)"
          },
          {
            aspect: "",
            english: "all of A, B, C happen",
            math: "\\(A \\cap B \\cap C\\)",
            trap: "Using \\(A \\cup B \\cup C\\) (means ANY)"
          },
          {
            aspect: "",
            english: "A or B but not both",
            math: "\\((A \\cap B^c) \\cup (A^c \\cap B)\\)",
            trap: "Using \\(A \\cup B\\) (includes both)"
          },
          {
            aspect: "Conditional statements",
            english: "A given that B occurred",
            math: "\\(P(A|B)\\)",
            trap: "Using \\(P(A \\cap B)\\)"
          },
          {
            aspect: "",
            english: "if B then A",
            math: "\\(B \\subseteq A\\) or \\(P(A|B) = 1\\)",
            trap: "Using \\(A \\subseteq B\\) (backwards)"
          },
          {
            aspect: "Negations",
            english: "it's not the case that A",
            math: "\\(A^c\\) or \\(\\neg A\\)",
            trap: "Forgetting to apply to whole expression"
          }
        ]
      };

      return (
        <div className="space-y-6">
          <ComparisonTable {...translationPatterns} />
          
          <InterpretationBox theme="teal" title="Translation Strategy">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Read the English carefully - identify key logical words</li>
              <li>Look for "or" (usually ∪), "and" (usually ∩), "not" (usually ᶜ)</li>
              <li>Watch for conditional language: "given", "if...then", "provided that"</li>
              <li>Be careful with "both" vs "at least one" - very different meanings!</li>
              <li>When in doubt, write out all possibilities first</li>
            </ol>
          </InterpretationBox>
        </div>
      );
    }
  },
  {
    id: 'practice-translation',
    title: 'Translation Practice',
    content: ({ sectionIndex, isCompleted }) => (
      <PracticeTranslationSection />
    )
  }
];

export default function Tab2WorkedExamplesTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Worked Examples"
      description="Step-by-step translation between English and mathematical notation"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="blue"
      showHeader={false}
    />
  );
}