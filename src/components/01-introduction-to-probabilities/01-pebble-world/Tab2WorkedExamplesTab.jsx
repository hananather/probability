"use client";

import React, { useState, useEffect, useRef } from 'react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { StepByStepCalculation, CalculationStep, FormulaDisplay } from '@/components/ui/patterns/StepByStepCalculation';
import { ComparisonTable } from '@/components/ui/patterns/ComparisonTable';
import { InterpretationBox } from '@/components/ui/patterns/InterpretationBox';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';

const SECTIONS = [
  {
    id: 'card-deck-foundation',
    title: 'Card Deck: A Complete Example',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useRef(null);
      
      useEffect(() => {
        const processMathJax = () => {
          if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
            if (window.MathJax.typesetClear) {
              window.MathJax.typesetClear([contentRef.current]);
            }
            window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
          }
        };
        
        processMathJax();
        const timeoutId = setTimeout(processMathJax, 100);
        return () => clearTimeout(timeoutId);
      }, []);
      
      return (
        <div ref={contentRef} className="space-y-6">
          <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-600/30">
            <h4 className="font-semibold text-blue-400 mb-4 text-lg">
              🂠 The Perfect Pebble World Example
            </h4>
            <p className="text-neutral-200 mb-4">
              A standard deck of 52 playing cards is the ideal example for understanding sample spaces, 
              events, and set operations. Let's build this step by step.
            </p>
          </div>
          
          <StepByStepCalculation title="Setting Up the Card Deck Model" theme="blue">
            <CalculationStep title="Step 1: Define the Sample Space" variant="default">
              <p className="text-neutral-300 mb-3">
                <strong>Physical Model:</strong> 52 pebbles in a bag, each representing one card
              </p>
              <div className="bg-neutral-800/50 p-4 rounded mb-3">
                <p className="text-neutral-200 mb-2">
                  <strong>Sample Space:</strong> <span dangerouslySetInnerHTML={{ __html: `\(S = \text{all 52 cards}\)` }} />
                </p>
                <p className="text-sm text-neutral-400">
                  Each card is equally likely to be drawn (equal mass pebbles)
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-neutral-300">
                <div className="bg-red-900/30 p-2 rounded text-center">♥️ Hearts (13)</div>
                <div className="bg-red-900/30 p-2 rounded text-center">♦️ Diamonds (13)</div>
                <div className="bg-gray-800 p-2 rounded text-center">♠️ Spades (13)</div>
                <div className="bg-gray-800 p-2 rounded text-center">♣️ Clubs (13)</div>
              </div>
            </CalculationStep>

            <CalculationStep title="Step 2: Define Key Events" variant="default">
              <p className="text-neutral-300 mb-3">
                Now let's define some important events (collections of pebbles):
              </p>
              <div className="space-y-3">
                <div className="bg-red-900/20 p-3 rounded border border-red-600/30">
                  <p className="text-red-400 font-semibold">Event A: Card is an Ace</p>
                  <p className="text-sm text-neutral-300">
                    <span dangerouslySetInnerHTML={{ __html: `\(A = \{A\heartsuit, A\diamondsuit, A\spadesuit, A\clubsuit\}\)` }} />
                  </p>
                  <p className="text-xs text-neutral-400">Physical: 4 pebbles labeled "Ace"</p>
                </div>
                
                <div className="bg-gray-800/50 p-3 rounded border border-gray-600/30">
                  <p className="text-gray-300 font-semibold">Event B: Card has a Black Suit</p>
                  <p className="text-sm text-neutral-300">
                    <span dangerouslySetInnerHTML={{ __html: `\(B = \{\text{all spades and clubs}\}\)` }} />
                  </p>
                  <p className="text-xs text-neutral-400">Physical: 26 black pebbles (spades + clubs)</p>
                </div>
                
                <div className="bg-red-900/20 p-3 rounded border border-red-600/30">
                  <p className="text-red-400 font-semibold">Event H: Card is a Heart</p>
                  <p className="text-sm text-neutral-300">
                    <span dangerouslySetInnerHTML={{ __html: `\(H = \{\text{all 13 hearts}\}\)` }} />
                  </p>
                  <p className="text-xs text-neutral-400">Physical: 13 red pebbles with heart symbols</p>
                </div>
              </div>
            </CalculationStep>

            <CalculationStep title="Step 3: Calculate Basic Probabilities" variant="highlight">
              <div className="space-y-4">
                <div>
                  <FormulaDisplay formula="P(A) = \frac{|A|}{|S|} = \frac{4}{52} = \frac{1}{13} \approx 0.077" />
                  <p className="text-sm text-neutral-400 mt-1">About 7.7% chance of drawing an ace</p>
                </div>
                
                <div>
                  <FormulaDisplay formula="P(B) = \frac{|B|}{|S|} = \frac{26}{52} = \frac{1}{2} = 0.5" />
                  <p className="text-sm text-neutral-400 mt-1">Exactly 50% chance of drawing a black card</p>
                </div>
                
                <div>
                  <FormulaDisplay formula="P(H) = \frac{|H|}{|S|} = \frac{13}{52} = \frac{1}{4} = 0.25" />
                  <p className="text-sm text-neutral-400 mt-1">Exactly 25% chance of drawing a heart</p>
                </div>
              </div>
              
              <InterpretationBox theme="blue">
                <p>
                  <strong>Physical Check:</strong> These probabilities make intuitive sense. 
                  Black cards are half the deck, hearts are one-quarter, and aces are rare (only 4 out of 52).
                </p>
              </InterpretationBox>
            </CalculationStep>
          </StepByStepCalculation>
        </div>
      );
    }
  },
  {
    id: 'set-operations-detailed',
    title: 'Set Operations with Cards',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useRef(null);
      
      useEffect(() => {
        const processMathJax = () => {
          if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
            if (window.MathJax.typesetClear) {
              window.MathJax.typesetClear([contentRef.current]);
            }
            window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
          }
        };
        
        processMathJax();
        const timeoutId = setTimeout(processMathJax, 100);
        return () => clearTimeout(timeoutId);
      }, []);
      
      return (
        <div ref={contentRef} className="space-y-6">
          <StepByStepCalculation title="Building Complex Events" theme="green">
            <CalculationStep title="Intersection: A ∩ H (Ace AND Heart)" variant="default">
              <p className="text-neutral-300 mb-3">
                <strong>Question:</strong> What's the probability of drawing the Ace of Hearts?
              </p>
              <div className="bg-red-900/20 p-4 rounded border border-red-600/30 mb-3">
                <p className="text-red-400 font-semibold mb-2">Physical Model:</p>
                <p className="text-neutral-300 text-sm">
                  Look for pebbles that are BOTH "Ace" AND "Heart" - there's only one such pebble!
                </p>
              </div>
              
              <FormulaDisplay formula="A \cap H = \{A\heartsuit\}" />
              <FormulaDisplay formula="P(A \cap H) = \frac{|A \cap H|}{|S|} = \frac{1}{52} \approx 0.019" />
              
              <InterpretationBox theme="green">
                <p>
                  <strong>Physical Check:</strong> Out of 52 equally-weighted pebbles, 
                  only 1 satisfies both conditions. Makes perfect sense!
                </p>
              </InterpretationBox>
            </CalculationStep>

            <CalculationStep title="Union: A ∪ H (Ace OR Heart)" variant="default">
              <p className="text-neutral-300 mb-3">
                <strong>Question:</strong> What's the probability of drawing either an Ace or a Heart (or both)?
              </p>
              
              <div className="bg-orange-900/20 p-4 rounded border border-orange-600/30 mb-3">
                <p className="text-orange-400 font-semibold mb-2">Physical Model:</p>
                <p className="text-neutral-300 text-sm mb-2">
                  Count all pebbles that are "Ace" OR "Heart" (or both). But be careful not to double-count!
                </p>
                <ul className="list-disc list-inside text-xs text-neutral-400 ml-4">
                  <li>4 Ace pebbles (including A♥️)</li>
                  <li>13 Heart pebbles (including A♥️)</li>
                  <li>Total unique pebbles: 4 + 13 - 1 = 16</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <FormulaDisplay formula="A \cup H = \{A\heartsuit, A\diamondsuit, A\spadesuit, A\clubsuit, 2\heartsuit, 3\heartsuit, \ldots, K\heartsuit\}" />
                <FormulaDisplay formula="|A \cup H| = |A| + |H| - |A \cap H| = 4 + 13 - 1 = 16" />
                <FormulaDisplay formula="P(A \cup H) = \frac{16}{52} = \frac{4}{13} \approx 0.308" />
              </div>
              
              <SimpleInsightBox theme="orange" title="Why We Subtract">
                <p>
                  The Ace of Hearts was counted in both A and H, so we subtract 1 to avoid double-counting. 
                  This is the inclusion-exclusion principle in action!
                </p>
              </SimpleInsightBox>
            </CalculationStep>

            <CalculationStep title="Complement: Bᶜ (Not Black)" variant="highlight">
              <p className="text-neutral-300 mb-3">
                <strong>Question:</strong> What's the probability of drawing a red card?
              </p>
              
              <div className="bg-red-900/20 p-4 rounded border border-red-600/30 mb-3">
                <p className="text-red-400 font-semibold mb-2">Physical Model:</p>
                <p className="text-neutral-300 text-sm">
                  "Not black" means "red" - count all pebbles that are NOT in the black collection.
                </p>
              </div>
              
              <div className="space-y-2">
                <FormulaDisplay formula="B^c = S \setminus B = \text{all red cards (hearts and diamonds)}" />
                <FormulaDisplay formula="|B^c| = |S| - |B| = 52 - 26 = 26" />
                <FormulaDisplay formula="P(B^c) = 1 - P(B) = 1 - 0.5 = 0.5" />
              </div>
              
              <InterpretationBox theme="purple">
                <p>
                  <strong>Complement Rule:</strong> Sometimes it's easier to calculate what you DON'T want 
                  and subtract from 1. Here, P(red) = 1 - P(black) = 1 - 0.5 = 0.5.
                </p>
              </InterpretationBox>
            </CalculationStep>
          </StepByStepCalculation>
        </div>
      );
    }
  },
  {
    id: 'multiple-methods',
    title: 'Multiple Solution Approaches',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useRef(null);
      
      useEffect(() => {
        const processMathJax = () => {
          if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
            if (window.MathJax.typesetClear) {
              window.MathJax.typesetClear([contentRef.current]);
            }
            window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
          }
        };
        
        processMathJax();
        const timeoutId = setTimeout(processMathJax, 100);
        return () => clearTimeout(timeoutId);
      }, []);
      
      return (
        <div ref={contentRef} className="space-y-6">
          <div className="bg-purple-900/20 p-6 rounded-lg border border-purple-600/30">
            <h4 className="font-semibold text-purple-400 mb-4 text-lg">
              🔄 The Power of Multiple Approaches
            </h4>
            <p className="text-neutral-200">
              Let's solve the same problem using different methods to build flexibility and confidence.
            </p>
          </div>
          
          <StepByStepCalculation title="Problem: P(Red card or Ace)" theme="purple">
            <CalculationStep title="Method 1: Direct Counting" variant="default">
              <p className="text-neutral-300 mb-3">
                <strong>Strategy:</strong> Count all cards that are either red OR ace
              </p>
              <div className="bg-neutral-800/50 p-4 rounded mb-3">
                <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
                  <li>Red cards: 26 (all hearts and diamonds)</li>
                  <li>Black aces: 2 (A♠️ and A♣️ - not counted yet)</li>
                  <li>Total favorable: 26 + 2 = 28</li>
                </ul>
              </div>
              <FormulaDisplay formula="P(\text{Red or Ace}) = \frac{28}{52} = \frac{7}{13} \approx 0.538" />
            </CalculationStep>

            <CalculationStep title="Method 2: Inclusion-Exclusion" variant="default">
              <p className="text-neutral-300 mb-3">
                <strong>Strategy:</strong> Use the formula P(A ∪ B) = P(A) + P(B) - P(A ∩ B)
              </p>
              <div className="space-y-2">
                <p className="text-sm text-neutral-400">Let R = red cards, A = aces</p>
                <FormulaDisplay formula="P(R) = \frac{26}{52} = \frac{1}{2}" />
                <FormulaDisplay formula="P(A) = \frac{4}{52} = \frac{1}{13}" />
                <FormulaDisplay formula="P(R \cap A) = \frac{2}{52} = \frac{1}{26}" />
                <FormulaDisplay formula="P(R \cup A) = \frac{1}{2} + \frac{1}{13} - \frac{1}{26} = \frac{13 + 2 - 1}{26} = \frac{14}{26} = \frac{7}{13}" />
              </div>
            </CalculationStep>

            <CalculationStep title="Method 3: Complement Approach" variant="highlight">
              <p className="text-neutral-300 mb-3">
                <strong>Strategy:</strong> Calculate P(not red and not ace) and subtract from 1
              </p>
              <div className="bg-neutral-800/50 p-4 rounded mb-3">
                <p className="text-neutral-300 text-sm mb-2">
                  "Not red and not ace" = black non-aces
                </p>
                <ul className="list-disc list-inside text-xs text-neutral-400 ml-4">
                  <li>Black cards: 26</li>
                  <li>Black aces: 2</li>
                  <li>Black non-aces: 26 - 2 = 24</li>
                </ul>
              </div>
              <div className="space-y-2">
                <FormulaDisplay formula="P(\text{Black non-ace}) = \frac{24}{52} = \frac{6}{13}" />
                <FormulaDisplay formula="P(\text{Red or Ace}) = 1 - \frac{6}{13} = \frac{7}{13}" />
              </div>
            </CalculationStep>
            
            <div className="bg-green-900/20 p-4 rounded border border-green-600/30">
              <h5 className="font-semibold text-green-400 mb-2">✅ All Methods Give Same Answer!</h5>
              <p className="text-neutral-300 text-sm">
                <span dangerouslySetInnerHTML={{ __html: `\(P(\text{Red or Ace}) = \frac{7}{13} \approx 0.538\)` }} /> 
                in all three approaches. This validates our understanding and builds confidence.
              </p>
            </div>
          </StepByStepCalculation>
          
          <SimpleInsightBox title="Strategic Problem-Solving" theme="cyan">
            <p className="mb-2">
              <strong>When to use each method:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li><strong>Direct counting:</strong> When you can easily visualize and count outcomes</li>
              <li><strong>Inclusion-exclusion:</strong> When events have significant overlap</li>
              <li><strong>Complement:</strong> When the "opposite" is easier to count</li>
            </ul>
            <p className="mt-3 text-cyan-300 font-medium">
              Master all three approaches - they'll serve you well in complex probability problems!
            </p>
          </SimpleInsightBox>
        </div>
      );
    }
  },
  {
    id: 'why-cards-matter',
    title: 'Why This Example Is Perfect',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useRef(null);
      
      useEffect(() => {
        const processMathJax = () => {
          if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
            if (window.MathJax.typesetClear) {
              window.MathJax.typesetClear([contentRef.current]);
            }
            window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
          }
        };
        
        processMathJax();
        const timeoutId = setTimeout(processMathJax, 100);
        return () => clearTimeout(timeoutId);
      }, []);
      
      return (
        <div ref={contentRef} className="space-y-6">
          <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-6 rounded-lg border border-cyan-600/30">
            <h4 className="font-semibold text-cyan-400 mb-4 text-lg">
              🎯 Why Cards Are the Perfect Teaching Tool
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-green-400 mb-3">✅ Perfect Mathematical Properties</h5>
                <ul className="list-disc list-inside space-y-2 text-sm text-neutral-300 ml-4">
                  <li><strong>Finite sample space:</strong> Exactly 52 outcomes</li>
                  <li><strong>Equal probability:</strong> Each card equally likely</li>
                  <li><strong>Natural events:</strong> Suits, ranks, colors</li>
                  <li><strong>Rich structure:</strong> Multiple ways to categorize</li>
                  <li><strong>Familiar context:</strong> Everyone knows cards</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold text-purple-400 mb-3">💪 Builds Essential Skills</h5>
                <ul className="list-disc list-inside space-y-2 text-sm text-neutral-300 ml-4">
                  <li><strong>Set operations:</strong> Unions, intersections, complements</li>
                  <li><strong>Multiple approaches:</strong> Different solution methods</li>
                  <li><strong>Inclusion-exclusion:</strong> Avoiding double counting</li>
                  <li><strong>Verification:</strong> Cross-checking answers</li>
                  <li><strong>Physical intuition:</strong> Concrete mental models</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-900/20 p-6 rounded-lg border border-orange-600/30">
            <h4 className="font-semibold text-orange-400 mb-4 text-lg">
              🔢 The Magic Number: 2⁵²
            </h4>
            <div className="space-y-3">
              <p className="text-neutral-200">
                With 52 cards, there are <span dangerouslySetInnerHTML={{ __html: `\(2^{52}\)` }} /> possible events 
                (subsets of the sample space). That's:
              </p>
              <div className="bg-neutral-800/50 p-4 rounded text-center">
                <span className="text-orange-400 font-mono text-lg" dangerouslySetInnerHTML={{ __html: `\(2^{52} \approx 4.5 \times 10^{15}\)` }} />
              </div>
              <p className="text-neutral-300 text-sm">
                That's about 4.5 quadrillion possible events! Yet we can understand them all 
                through combinations of basic operations like union, intersection, and complement.
              </p>
            </div>
          </div>
          
          <div className="bg-purple-900/20 p-6 rounded-lg border border-purple-600/30">
            <h4 className="font-semibold text-purple-400 mb-4 text-lg">
              🚀 Your Probability Foundation
            </h4>
            <p className="text-neutral-200 mb-4">
              You now have a rock-solid foundation in probability thinking:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neutral-800/50 p-4 rounded">
                <h5 className="font-semibold text-cyan-400 mb-2">🧠 Mental Model</h5>
                <ul className="list-disc list-inside text-xs text-neutral-300 space-y-1">
                  <li>Physical pebble selection process</li>
                  <li>Sample spaces as complete inventories</li>
                  <li>Events as collections of outcomes</li>
                </ul>
              </div>
              
              <div className="bg-neutral-800/50 p-4 rounded">
                <h5 className="font-semibold text-cyan-400 mb-2">⚙️ Mathematical Tools</h5>
                <ul className="list-disc list-inside text-xs text-neutral-300 space-y-1">
                  <li>Set operations and their meanings</li>
                  <li>Multiple solution approaches</li>
                  <li>Verification through cross-checking</li>
                </ul>
              </div>
            </div>
          </div>
          
          <SimpleInsightBox title="Next: The Translation Dictionary" theme="teal">
            <p>
              Now you're ready to learn how to translate between everyday English and mathematical notation. 
              This "dictionary" will be your key to solving any probability problem you encounter.
            </p>
            <p className="mt-2 text-teal-300 font-medium">
              Think of it as learning to speak two languages about the same simple idea: picking pebbles from a bag.
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
      description="Complete card deck example with step-by-step set operations"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="blue"
      showHeader={false}
    />
  );
}