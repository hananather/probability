"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StepByStepCalculation, CalculationStep, NestedCalculation, FormulaDisplay } from '@/components/ui/patterns/StepByStepCalculation';
import { ComparisonTable, SimpleComparisonTable } from '@/components/ui/patterns/ComparisonTable';
import { InterpretationBox } from '@/components/ui/patterns/InterpretationBox';
import { SimpleInsightBox, SimpleFormulaCard } from '@/components/ui/patterns/SimpleComponents';
import { useMathJax } from '@/hooks/useMathJax';
import { RefreshCw, Calculator, PlayCircle } from 'lucide-react';
import SharedNavigation from '../shared/SharedNavigation';

export default function Tab4InteractiveTabStepByStep({ onComplete }) {
  const [currentScenario, setCurrentScenario] = useState('equal-mass');
  const [selectedBag, setSelectedBag] = useState('bag-a');
  const [currentStep, setCurrentStep] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const contentRef = useMathJax([currentScenario, selectedBag, currentStep]);

  // Scenario definitions
  const scenarios = {
    'equal-mass': {
      title: 'Equal Mass Pebbles',
      description: 'All pebbles have the same weight - classical probability',
      bags: {
        'bag-a': {
          name: 'Bag A: Simple Colors',
          red: 3,
          blue: 2,
          total: 5,
          description: '3 red pebbles, 2 blue pebbles'
        },
        'bag-b': {
          name: 'Bag B: Card Suits',
          hearts: 13,
          diamonds: 13,
          spades: 13,
          clubs: 13,
          total: 52,
          description: 'Standard deck as pebbles'
        }
      }
    },
    'weighted-mass': {
      title: 'Weighted Mass Pebbles',
      description: 'Pebbles have different weights - weighted probability',
      bags: {
        'bag-a': {
          name: 'Bag A: Light vs Heavy',
          light: { count: 4, weight: 1 },
          heavy: { count: 2, weight: 3 },
          total: 6,
          totalWeight: 10,
          description: '4 light pebbles (weight 1), 2 heavy pebbles (weight 3)'
        }
      }
    },
    'multiple-picks': {
      title: 'Multiple Picks',
      description: 'Drawing multiple pebbles with or without replacement',
      bags: {
        'bag-a': {
          name: 'Bag A: Two Draws',
          red: 3,
          blue: 2,
          total: 5,
          description: 'Draw 2 pebbles from 3 red, 2 blue'
        }
      }
    }
  };

  const currentBag = scenarios[currentScenario].bags[selectedBag];

  const startCalculation = () => {
    setIsCalculating(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    const maxSteps = currentScenario === 'equal-mass' ? 4 : 
                   currentScenario === 'weighted-mass' ? 5 : 6;
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const resetCalculation = () => {
    setIsCalculating(false);
    setCurrentStep(0);
  };

  const renderEqualMassCalculation = () => {
    if (!isCalculating) return null;

    return (
      <StepByStepCalculation title={`Step-by-Step: ${currentBag.name}`} theme="blue">
        {/* Step 0: Setup */}
        {currentStep >= 0 && (
          <CalculationStep title="Step 1: Define the Sample Space" variant="default">
            <div className="space-y-3">
              <p className="text-neutral-300">
                <strong>Physical Model:</strong> {currentBag.description}
              </p>
              <div className="bg-neutral-800/50 p-4 rounded">
                <p className="text-neutral-200 mb-2">
                  Sample Space: <span dangerouslySetInnerHTML={{ __html: `\\(S = \\{\\text{all pebbles in bag}\\}\\)` }} />
                </p>
                <p className="text-sm text-neutral-400">
                  Total outcomes: <span dangerouslySetInnerHTML={{ __html: `\\(|S| = ${currentBag.total}\\)` }} />
                </p>
              </div>
              
              {selectedBag === 'bag-a' && (
                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300">
                  <div className="bg-red-900/30 p-2 rounded text-center">Red Pebbles: {currentBag.red}</div>
                  <div className="bg-blue-900/30 p-2 rounded text-center">Blue Pebbles: {currentBag.blue}</div>
                </div>
              )}
              
              {selectedBag === 'bag-b' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-neutral-300">
                  <div className="bg-red-900/30 p-2 rounded text-center">♥ Hearts: {currentBag.hearts}</div>
                  <div className="bg-red-900/30 p-2 rounded text-center">♦ Diamonds: {currentBag.diamonds}</div>
                  <div className="bg-gray-800 p-2 rounded text-center">♠ Spades: {currentBag.spades}</div>
                  <div className="bg-gray-800 p-2 rounded text-center">♣ Clubs: {currentBag.clubs}</div>
                </div>
              )}
            </div>
          </CalculationStep>
        )}

        {/* Step 1: Define Events */}
        {currentStep >= 1 && (
          <CalculationStep title="Step 2: Define Events of Interest" variant="default">
            <p className="text-neutral-300 mb-3">
              <strong>Key Principle:</strong> Events are collections of pebbles (subsets of sample space)
            </p>
            
            {selectedBag === 'bag-a' && (
              <div className="space-y-3">
                <div className="bg-red-900/20 p-3 rounded border border-red-600/30">
                  <p className="text-red-400 font-semibold">Event A: Draw a Red Pebble</p>
                  <p className="text-sm text-neutral-300">
                    <span dangerouslySetInnerHTML={{ __html: `\\(A = \\{\\text{red pebble 1, red pebble 2, red pebble 3}\\}\\)` }} />
                  </p>
                  <p className="text-xs text-neutral-400">Physical: 3 red pebbles out of 5 total</p>
                </div>
                
                <div className="bg-blue-900/20 p-3 rounded border border-blue-600/30">
                  <p className="text-blue-400 font-semibold">Event B: Draw a Blue Pebble</p>
                  <p className="text-sm text-neutral-300">
                    <span dangerouslySetInnerHTML={{ __html: `\\(B = \\{\\text{blue pebble 1, blue pebble 2}\\}\\)` }} />
                  </p>
                  <p className="text-xs text-neutral-400">Physical: 2 blue pebbles out of 5 total</p>
                </div>
              </div>
            )}
            
            {selectedBag === 'bag-b' && (
              <div className="space-y-3">
                <div className="bg-red-900/20 p-3 rounded border border-red-600/30">
                  <p className="text-red-400 font-semibold">Event R: Draw a Red Card</p>
                  <p className="text-sm text-neutral-300">
                    <span dangerouslySetInnerHTML={{ __html: `\\(R = \\{\\text{all hearts and diamonds}\\}\\)` }} />
                  </p>
                  <p className="text-xs text-neutral-400">Physical: 26 red card pebbles</p>
                </div>
                
                <div className="bg-yellow-900/20 p-3 rounded border border-yellow-600/30">
                  <p className="text-yellow-400 font-semibold">Event A: Draw an Ace</p>
                  <p className="text-sm text-neutral-300">
                    <span dangerouslySetInnerHTML={{ __html: `\\(A = \\{A♥, A♦, A♠, A♣\\}\\)` }} />
                  </p>
                  <p className="text-xs text-neutral-400">Physical: 4 ace pebbles</p>
                </div>
              </div>
            )}
          </CalculationStep>
        )}

        {/* Step 2: Basic Probability Calculation */}
        {currentStep >= 2 && (
          <CalculationStep title="Step 3: Calculate Basic Probabilities" variant="highlight">
            <div className="space-y-4">
              <p className="text-neutral-300 mb-3">
                <strong>Fundamental Formula:</strong> For equally likely outcomes
              </p>
              <FormulaDisplay formula={`P(\\text{Event}) = \\frac{\\text{Number of favorable outcomes}}{\\text{Total number of outcomes}} = \\frac{|\\text{Event}|}{|S|}`} />
              
              {selectedBag === 'bag-a' && (
                <div className="space-y-4">
                  <NestedCalculation label="P(Red):">
                    <FormulaDisplay formula={`P(A) = \\frac{|A|}{|S|} = \\frac{3}{5} = 0.6`} />
                    <p className="text-sm text-neutral-400 mt-1">60% chance of drawing red</p>
                  </NestedCalculation>
                  
                  <NestedCalculation label="P(Blue):">
                    <FormulaDisplay formula={`P(B) = \\frac{|B|}{|S|} = \\frac{2}{5} = 0.4`} />
                    <p className="text-sm text-neutral-400 mt-1">40% chance of drawing blue</p>
                  </NestedCalculation>
                  
                  <div className="bg-green-900/20 p-3 rounded border border-green-600/30">
                    <p className="text-green-400 font-semibold">Verification Check:</p>
                    <FormulaDisplay formula={`P(A) + P(B) = 0.6 + 0.4 = 1.0 \\checkmark`} />
                    <p className="text-xs text-neutral-400">All probabilities sum to 1 - perfect!</p>
                  </div>
                </div>
              )}
              
              {selectedBag === 'bag-b' && (
                <div className="space-y-4">
                  <NestedCalculation label="P(Red Card):">
                    <FormulaDisplay formula={`P(R) = \\frac{|R|}{|S|} = \\frac{26}{52} = \\frac{1}{2} = 0.5`} />
                    <p className="text-sm text-neutral-400 mt-1">Exactly 50% chance</p>
                  </NestedCalculation>
                  
                  <NestedCalculation label="P(Ace):">
                    <FormulaDisplay formula={`P(A) = \\frac{|A|}{|S|} = \\frac{4}{52} = \\frac{1}{13} \\approx 0.077`} />
                    <p className="text-sm text-neutral-400 mt-1">About 7.7% chance</p>
                  </NestedCalculation>
                </div>
              )}
            </div>
          </CalculationStep>
        )}

        {/* Step 3: Set Operations */}
        {currentStep >= 3 && (
          <CalculationStep title="Step 4: Advanced Set Operations" variant="default">
            <p className="text-neutral-300 mb-3">
              <strong>Challenge:</strong> Calculate complex event probabilities
            </p>
            
            {selectedBag === 'bag-a' && (
              <div className="space-y-4">
                <div className="bg-orange-900/20 p-4 rounded border border-orange-600/30">
                  <p className="text-orange-400 font-semibold mb-2">Complement: P(Not Red)</p>
                  <p className="text-neutral-300 text-sm mb-2">
                    "Not red" means "blue" in this bag
                  </p>
                  <FormulaDisplay formula={`P(A^c) = 1 - P(A) = 1 - 0.6 = 0.4`} />
                  <p className="text-xs text-neutral-400">
                    Alternative: <span dangerouslySetInnerHTML={{ __html: `\\(P(A^c) = P(B) = \\frac{2}{5} = 0.4\\)` }} />
                  </p>
                </div>
              </div>
            )}
            
            {selectedBag === 'bag-b' && (
              <div className="space-y-4">
                <div className="bg-purple-900/20 p-4 rounded border border-purple-600/30">
                  <p className="text-purple-400 font-semibold mb-2">Intersection: P(Red AND Ace)</p>
                  <p className="text-neutral-300 text-sm mb-2">
                    Cards that are both red AND ace: A♥, A♦
                  </p>
                  <FormulaDisplay formula={`P(R \\cap A) = \\frac{|R \\cap A|}{|S|} = \\frac{2}{52} = \\frac{1}{26} \\approx 0.038`} />
                </div>
                
                <div className="bg-cyan-900/20 p-4 rounded border border-cyan-600/30">
                  <p className="text-cyan-400 font-semibold mb-2">Union: P(Red OR Ace)</p>
                  <p className="text-neutral-300 text-sm mb-2">
                    Inclusion-Exclusion: P(A ∪ B) = P(A) + P(B) - P(A ∩ B)
                  </p>
                  <FormulaDisplay formula={`P(R \\cup A) = P(R) + P(A) - P(R \\cap A)`} />
                  <FormulaDisplay formula={`= \\frac{1}{2} + \\frac{1}{13} - \\frac{1}{26} = \\frac{13 + 2 - 1}{26} = \\frac{14}{26} = \\frac{7}{13}`} />
                </div>
              </div>
            )}
          </CalculationStep>
        )}

        {/* Step 4: Summary and Interpretation */}
        {currentStep >= 4 && (
          <CalculationStep title="Step 5: Summary and Verification" variant="highlight">
            <InterpretationBox theme="blue">
              <p>
                <strong>Physical Model Success:</strong> All our calculations make perfect sense when we think 
                of the pebble-drawing process.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Each pebble has equal chance of being drawn</li>
                <li>Probabilities are simple counting ratios</li>
                <li>All probabilities sum to 1</li>
                <li>Set operations follow logical rules</li>
              </ul>
            </InterpretationBox>
            
            <SimpleInsightBox title="Key Insights" theme="green">
              <p className="mb-2">
                <strong>Why this foundation matters:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Equal mass pebbles → Classical probability</li>
                <li>Counting favorable outcomes → Probability values</li>
                <li>Set operations → Complex event probabilities</li>
                <li>Physical intuition → Mathematical confidence</li>
              </ul>
            </SimpleInsightBox>
          </CalculationStep>
        )}
      </StepByStepCalculation>
    );
  };

  const renderWeightedMassCalculation = () => {
    if (!isCalculating) return null;

    return (
      <StepByStepCalculation title={`Step-by-Step: ${currentBag.name}`} theme="purple">
        {/* Step 0: Setup */}
        {currentStep >= 0 && (
          <CalculationStep title="Step 1: Define the Weighted Sample Space" variant="default">
            <div className="space-y-3">
              <p className="text-neutral-300">
                <strong>Physical Model:</strong> {currentBag.description}
              </p>
              <div className="bg-neutral-800/50 p-4 rounded">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-yellow-400 font-semibold">Light Pebbles</p>
                    <p>Count: {currentBag.light.count}</p>
                    <p>Weight each: {currentBag.light.weight}</p>
                    <p>Total weight: {currentBag.light.count * currentBag.light.weight}</p>
                  </div>
                  <div>
                    <p className="text-red-400 font-semibold">Heavy Pebbles</p>
                    <p>Count: {currentBag.heavy.count}</p>
                    <p>Weight each: {currentBag.heavy.weight}</p>
                    <p>Total weight: {currentBag.heavy.count * currentBag.heavy.weight}</p>
                  </div>
                </div>
                <p className="text-neutral-300 mt-3 pt-3 border-t border-neutral-700">
                  <strong>Total weight in bag:</strong> {currentBag.totalWeight}
                </p>
              </div>
            </div>
          </CalculationStep>
        )}

        {/* Step 1: Weight Formula */}
        {currentStep >= 1 && (
          <CalculationStep title="Step 2: Weighted Probability Formula" variant="highlight">
            <div className="space-y-4">
              <p className="text-neutral-300">
                <strong>Key Insight:</strong> Heavier pebbles are more likely to be selected
              </p>
              <FormulaDisplay formula={`P(\\text{Event}) = \\frac{\\text{Total weight of favorable outcomes}}{\\text{Total weight in bag}}`} />
              
              <div className="bg-purple-900/20 p-4 rounded border border-purple-600/30">
                <p className="text-purple-400 font-semibold mb-2">Why weights matter:</p>
                <p className="text-neutral-300 text-sm">
                  Imagine reaching into the bag blindfolded. Your hand is more likely to grab a heavy pebble 
                  than a light one because heavy pebbles take up more "selection space."
                </p>
              </div>
            </div>
          </CalculationStep>
        )}

        {/* Step 2: Calculate Light Probability */}
        {currentStep >= 2 && (
          <CalculationStep title="Step 3: Calculate P(Light Pebble)" variant="default">
            <div className="space-y-3">
              <NestedCalculation label="Identify favorable outcomes:">
                <p className="text-neutral-300 text-sm mb-2">
                  Light pebbles: {currentBag.light.count} pebbles, each weighing {currentBag.light.weight}
                </p>
                <FormulaDisplay formula={`\\text{Total weight of light pebbles} = ${currentBag.light.count} \\times ${currentBag.light.weight} = ${currentBag.light.count * currentBag.light.weight}`} />
              </NestedCalculation>
              
              <NestedCalculation label="Apply formula:">
                <FormulaDisplay formula={`P(\\text{Light}) = \\frac{${currentBag.light.count * currentBag.light.weight}}{${currentBag.totalWeight}} = \\frac{4}{10} = 0.4`} />
                <p className="text-sm text-neutral-400 mt-1">40% chance of drawing a light pebble</p>
              </NestedCalculation>
            </div>
          </CalculationStep>
        )}

        {/* Step 3: Calculate Heavy Probability */}
        {currentStep >= 3 && (
          <CalculationStep title="Step 4: Calculate P(Heavy Pebble)" variant="default">
            <div className="space-y-3">
              <NestedCalculation label="Identify favorable outcomes:">
                <p className="text-neutral-300 text-sm mb-2">
                  Heavy pebbles: {currentBag.heavy.count} pebbles, each weighing {currentBag.heavy.weight}
                </p>
                <FormulaDisplay formula={`\\text{Total weight of heavy pebbles} = ${currentBag.heavy.count} \\times ${currentBag.heavy.weight} = ${currentBag.heavy.count * currentBag.heavy.weight}`} />
              </NestedCalculation>
              
              <NestedCalculation label="Apply formula:">
                <FormulaDisplay formula={`P(\\text{Heavy}) = \\frac{${currentBag.heavy.count * currentBag.heavy.weight}}{${currentBag.totalWeight}} = \\frac{6}{10} = 0.6`} />
                <p className="text-sm text-neutral-400 mt-1">60% chance of drawing a heavy pebble</p>
              </NestedCalculation>
            </div>
          </CalculationStep>
        )}

        {/* Step 4: Comparison */}
        {currentStep >= 4 && (
          <CalculationStep title="Step 5: Compare with Equal Mass Case" variant="highlight">
            <SimpleComparisonTable
              title="Equal Mass vs Weighted Mass"
              headers={{ left: "Equal Mass", right: "Weighted Mass" }}
              colors={{ left: "text-blue-400", right: "text-purple-400" }}
              data={[
                { 
                  aspect: "P(Light Pebble)", 
                  left: `\\(\\frac{4}{6} = 0.667\\)`, 
                  right: `\\(\\frac{4}{10} = 0.4\\)` 
                },
                { 
                  aspect: "P(Heavy Pebble)", 
                  left: `\\(\\frac{2}{6} = 0.333\\)`, 
                  right: `\\(\\frac{6}{10} = 0.6\\)` 
                },
                { 
                  aspect: "Most likely", 
                  left: "Light (more numerous)", 
                  right: "Heavy (more weight)" 
                }
              ]}
            />
            
            <InterpretationBox theme="purple">
              <p>
                <strong>Key Insight:</strong> Weight dramatically changes probabilities! Even though there are 
                more light pebbles (4 vs 2), the heavy pebbles are more likely to be drawn because 
                their total weight (6) exceeds the light pebbles' total weight (4).
              </p>
            </InterpretationBox>
          </CalculationStep>
        )}

        {/* Step 5: Verification */}
        {currentStep >= 5 && (
          <CalculationStep title="Step 6: Verification and Applications" variant="highlight">
            <div className="bg-green-900/20 p-4 rounded border border-green-600/30 mb-4">
              <p className="text-green-400 font-semibold mb-2">Probability Check:</p>
              <FormulaDisplay formula={`P(\\text{Light}) + P(\\text{Heavy}) = 0.4 + 0.6 = 1.0 \\checkmark`} />
              <p className="text-xs text-neutral-400">Perfect! All probabilities sum to 1.</p>
            </div>
            
            <SimpleInsightBox title="Real-World Applications" theme="orange">
              <p className="mb-2">
                <strong>Weighted probability appears everywhere:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Elections:</strong> Weighted voting systems</li>
                <li><strong>Economics:</strong> Market capitalization-weighted indices</li>
                <li><strong>Quality control:</strong> Defect severity weighting</li>
                <li><strong>Gaming:</strong> Rare item drop rates</li>
                <li><strong>Medicine:</strong> Treatment effectiveness weighting</li>
              </ul>
            </SimpleInsightBox>
          </CalculationStep>
        )}
      </StepByStepCalculation>
    );
  };

  const renderMultiplePicksCalculation = () => {
    if (!isCalculating) return null;

    return (
      <StepByStepCalculation title={`Step-by-Step: Multiple Draws from ${currentBag.name}`} theme="green">
        {/* Step 0: Setup */}
        {currentStep >= 0 && (
          <CalculationStep title="Step 1: Define the Two-Draw Scenario" variant="default">
            <div className="space-y-3">
              <p className="text-neutral-300">
                <strong>Scenario:</strong> Draw 2 pebbles from bag with {currentBag.red} red and {currentBag.blue} blue pebbles
              </p>
              <div className="bg-neutral-800/50 p-4 rounded">
                <p className="text-neutral-200 mb-3">
                  <strong>Two approaches:</strong>
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-900/20 p-3 rounded border border-blue-600/30">
                    <p className="text-blue-400 font-semibold">With Replacement</p>
                    <p className="text-neutral-300">Put the first pebble back before drawing the second</p>
                    <p className="text-xs text-neutral-400">Draws are independent</p>
                  </div>
                  <div className="bg-green-900/20 p-3 rounded border border-green-600/30">
                    <p className="text-green-400 font-semibold">Without Replacement</p>
                    <p className="text-neutral-300">Keep the first pebble out when drawing the second</p>
                    <p className="text-xs text-neutral-400">Draws are dependent</p>
                  </div>
                </div>
              </div>
            </div>
          </CalculationStep>
        )}

        {/* Step 1: With Replacement */}
        {currentStep >= 1 && (
          <CalculationStep title="Step 2: With Replacement Calculations" variant="default">
            <div className="space-y-4">
              <p className="text-neutral-300 mb-3">
                <strong>Key Principle:</strong> Each draw is independent (bag unchanged)
              </p>
              
              <NestedCalculation label="P(Red on first draw):">
                <FormulaDisplay formula={`P(R_1) = \\frac{3}{5} = 0.6`} />
              </NestedCalculation>
              
              <NestedCalculation label="P(Red on second draw | Red on first):">
                <p className="text-neutral-300 text-sm mb-2">
                  Since we replaced the first pebble, the bag is unchanged
                </p>
                <FormulaDisplay formula={`P(R_2|R_1) = \\frac{3}{5} = 0.6`} />
              </NestedCalculation>
              
              <NestedCalculation label="P(Two Reds):">
                <FormulaDisplay formula={`P(R_1 \\cap R_2) = P(R_1) \\times P(R_2|R_1) = 0.6 \\times 0.6 = 0.36`} />
                <p className="text-sm text-neutral-400 mt-1">36% chance of two red pebbles</p>
              </NestedCalculation>
            </div>
          </CalculationStep>
        )}

        {/* Step 2: Without Replacement */}
        {currentStep >= 2 && (
          <CalculationStep title="Step 3: Without Replacement Calculations" variant="default">
            <div className="space-y-4">
              <p className="text-neutral-300 mb-3">
                <strong>Key Principle:</strong> First draw affects the second (bag changes)
              </p>
              
              <NestedCalculation label="P(Red on first draw):">
                <FormulaDisplay formula={`P(R_1) = \\frac{3}{5} = 0.6`} />
                <p className="text-xs text-neutral-400">Same as before - bag unchanged for first draw</p>
              </NestedCalculation>
              
              <NestedCalculation label="P(Red on second draw | Red on first):">
                <p className="text-neutral-300 text-sm mb-2">
                  After drawing one red pebble: 2 red, 2 blue remain (4 total)
                </p>
                <FormulaDisplay formula={`P(R_2|R_1) = \\frac{2}{4} = 0.5`} />
              </NestedCalculation>
              
              <NestedCalculation label="P(Two Reds):">
                <FormulaDisplay formula={`P(R_1 \\cap R_2) = P(R_1) \\times P(R_2|R_1) = 0.6 \\times 0.5 = 0.3`} />
                <p className="text-sm text-neutral-400 mt-1">30% chance of two red pebbles</p>
              </NestedCalculation>
            </div>
          </CalculationStep>
        )}

        {/* Step 3: All Possible Outcomes */}
        {currentStep >= 3 && (
          <CalculationStep title="Step 4: Complete Outcome Analysis" variant="highlight">
            <p className="text-neutral-300 mb-4">
              <strong>Without Replacement:</strong> Let's calculate all possible two-draw outcomes
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-red-900/20 p-3 rounded border border-red-600/30">
                  <p className="text-red-400 font-semibold">P(Red, Red)</p>
                  <FormulaDisplay formula={`\\frac{3}{5} \\times \\frac{2}{4} = \\frac{6}{20} = 0.3`} />
                </div>
                
                <div className="bg-purple-900/20 p-3 rounded border border-purple-600/30">
                  <p className="text-purple-400 font-semibold">P(Red, Blue)</p>
                  <FormulaDisplay formula={`\\frac{3}{5} \\times \\frac{2}{4} = \\frac{6}{20} = 0.3`} />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-purple-900/20 p-3 rounded border border-purple-600/30">
                  <p className="text-purple-400 font-semibold">P(Blue, Red)</p>
                  <FormulaDisplay formula={`\\frac{2}{5} \\times \\frac{3}{4} = \\frac{6}{20} = 0.3`} />
                </div>
                
                <div className="bg-blue-900/20 p-3 rounded border border-blue-600/30">
                  <p className="text-blue-400 font-semibold">P(Blue, Blue)</p>
                  <FormulaDisplay formula={`\\frac{2}{5} \\times \\frac{1}{4} = \\frac{2}{20} = 0.1`} />
                </div>
              </div>
            </div>
            
            <div className="bg-green-900/20 p-3 rounded border border-green-600/30 mt-4">
              <p className="text-green-400 font-semibold">Verification:</p>
              <FormulaDisplay formula={`0.3 + 0.3 + 0.3 + 0.1 = 1.0 \\checkmark`} />
            </div>
          </CalculationStep>
        )}

        {/* Step 4: Event Combinations */}
        {currentStep >= 4 && (
          <CalculationStep title="Step 5: Complex Event Probabilities" variant="default">
            <div className="space-y-4">
              <p className="text-neutral-300 mb-3">
                <strong>Question:</strong> What's P(at least one red)?
              </p>
              
              <NestedCalculation label="Method 1: Direct Addition">
                <p className="text-neutral-300 text-sm mb-2">
                  P(at least one red) = P(RR) + P(RB) + P(BR)
                </p>
                <FormulaDisplay formula={`P(\\text{at least one red}) = 0.3 + 0.3 + 0.3 = 0.9`} />
              </NestedCalculation>
              
              <NestedCalculation label="Method 2: Complement">
                <p className="text-neutral-300 text-sm mb-2">
                  P(at least one red) = 1 - P(no reds) = 1 - P(BB)
                </p>
                <FormulaDisplay formula={`P(\\text{at least one red}) = 1 - 0.1 = 0.9`} />
              </NestedCalculation>
              
              <SimpleInsightBox title="Which Method is Better?" theme="cyan">
                <p>
                  The complement method is often easier when dealing with "at least one" problems. 
                  It's usually simpler to calculate "none" than "at least one."
                </p>
              </SimpleInsightBox>
            </div>
          </CalculationStep>
        )}

        {/* Step 5: Comparison */}
        {currentStep >= 5 && (
          <CalculationStep title="Step 6: With vs Without Replacement" variant="highlight">
            <SimpleComparisonTable
              title="Replacement Effects on Probability"
              headers={{ left: "With Replacement", right: "Without Replacement" }}
              colors={{ left: "text-blue-400", right: "text-green-400" }}
              data={[
                { 
                  aspect: "P(Two Reds)", 
                  left: "\\(0.6 \\times 0.6 = 0.36\\)", 
                  right: "\\(0.6 \\times 0.5 = 0.30\\)" 
                },
                { 
                  aspect: "P(At least one Red)", 
                  left: "\\(1 - 0.4^2 = 0.84\\)", 
                  right: "\\(1 - 0.1 = 0.90\\)" 
                },
                { 
                  aspect: "Independence", 
                  left: "Draws are independent", 
                  right: "Draws are dependent" 
                },
                { 
                  aspect: "Calculation", 
                  left: "Multiply original probabilities", 
                  right: "Adjust probabilities after each draw" 
                }
              ]}
            />
            
            <InterpretationBox theme="green">
              <p>
                <strong>Surprising Result:</strong> Without replacement gives higher probability of "at least one red" 
                because removing a blue pebble improves the chances for subsequent draws.
              </p>
              <p className="mt-2">
                This illustrates how dependence between events can dramatically affect outcomes!
              </p>
            </InterpretationBox>
          </CalculationStep>
        )}

        {/* Step 6: Summary */}
        {currentStep >= 6 && (
          <CalculationStep title="Step 7: Summary of Multiple Draws" variant="highlight">
            <SimpleInsightBox title="Key Lessons from Multiple Draws" theme="teal">
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>
                  <strong>With replacement:</strong> Draws are independent, use original probabilities for each draw
                </li>
                <li>
                  <strong>Without replacement:</strong> Draws are dependent, adjust probabilities based on previous outcomes
                </li>
                <li>
                  <strong>Complement method:</strong> Often easier for "at least one" problems
                </li>
                <li>
                  <strong>Verification:</strong> All outcome probabilities must sum to 1
                </li>
                <li>
                  <strong>Real insight:</strong> Dependence can increase or decrease probabilities in surprising ways
                </li>
              </ul>
            </SimpleInsightBox>
            
            <div className="bg-purple-900/20 p-4 rounded border border-purple-600/30 mt-4">
              <h5 className="font-semibold text-purple-400 mb-2">Ready for Advanced Topics</h5>
              <p className="text-neutral-300 text-sm">
                You now understand the foundations of probability through physical models. These concepts 
                extend to complex scenarios like conditional probability, Bayes' theorem, and random variables.
              </p>
            </div>
          </CalculationStep>
        )}
      </StepByStepCalculation>
    );
  };

  return (
    <div ref={contentRef} className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Interactive Step-by-Step Calculations</h2>
        <p className="text-neutral-300 max-w-3xl mx-auto">
          Master probability through guided calculations. Each scenario builds understanding 
          step-by-step using the pebble bag model.
        </p>
      </div>

      {/* Scenario Selection */}
      <div className="bg-neutral-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Choose Your Learning Path</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(scenarios).map(([key, scenario]) => (
            <button
              key={key}
              onClick={() => {
                setCurrentScenario(key);
                setSelectedBag('bag-a');
                resetCalculation();
              }}
              className={`p-4 rounded-lg border transition-all ${
                currentScenario === key
                  ? 'bg-blue-900/30 border-blue-500/50 text-blue-300'
                  : 'bg-neutral-700/30 border-neutral-600/30 text-neutral-300 hover:bg-neutral-700/50'
              }`}
            >
              <h4 className="font-semibold mb-2">{scenario.title}</h4>
              <p className="text-sm opacity-80">{scenario.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Bag Selection */}
      {scenarios[currentScenario].bags && Object.keys(scenarios[currentScenario].bags).length > 1 && (
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">Select Bag Configuration</h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(scenarios[currentScenario].bags).map(([bagKey, bag]) => (
              <button
                key={bagKey}
                onClick={() => {
                  setSelectedBag(bagKey);
                  resetCalculation();
                }}
                className={`px-4 py-2 rounded border transition-all ${
                  selectedBag === bagKey
                    ? 'bg-green-900/30 border-green-500/50 text-green-300'
                    : 'bg-neutral-700/30 border-neutral-600/30 text-neutral-300 hover:bg-neutral-700/50'
                }`}
              >
                <span className="font-medium">{bag.name}</span>
                <br />
                <span className="text-xs opacity-80">{bag.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons and Navigation */}
      {!isCalculating ? (
        <div className="flex justify-center">
          <Button 
            onClick={startCalculation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Start Step-by-Step Calculation
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <SharedNavigation
            currentStep={currentStep}
            totalSteps={currentScenario === 'equal-mass' ? 5 : 
                        currentScenario === 'weighted-mass' ? 6 : 7}
            onNavigate={(step) => setCurrentStep(step)}
            onComplete={() => {
              if (currentStep >= (currentScenario === 'equal-mass' ? 4 : 
                                 currentScenario === 'weighted-mass' ? 5 : 6)) {
                resetCalculation();
                onComplete?.();
              } else {
                nextStep();
              }
            }}
            showProgress={true}
            nextLabel="Next Step"
            previousLabel="Previous Step"
            disabled={false}
          />
          <div className="text-center">
            <Button 
              onClick={resetCalculation}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Calculation
            </Button>
          </div>
        </div>
      )}

      {/* Calculation Content */}
      {currentScenario === 'equal-mass' && renderEqualMassCalculation()}
      {currentScenario === 'weighted-mass' && renderWeightedMassCalculation()}
      {currentScenario === 'multiple-picks' && renderMultiplePicksCalculation()}

      {/* Completion Message */}
      {isCalculating && currentStep >= (currentScenario === 'equal-mass' ? 4 : 
                                       currentScenario === 'weighted-mass' ? 5 : 6) && (
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-800/20 border border-green-600/30 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-green-400 mb-3">🎉 Calculation Complete!</h3>
          <p className="text-neutral-200 mb-4">
            You've mastered the step-by-step approach for this scenario. Try another scenario 
            or move on to the next topic to continue building your probability foundation.
          </p>
          {onComplete && (
            <Button 
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
            >
              Mark as Complete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}