"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SemanticGradientCard, SemanticGradientGrid } from '@/components/ui/patterns/SemanticGradientCard';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';
import { useMathJax } from '@/hooks/useMathJax';
import SharedNavigation from '../shared/SharedNavigation';

// Pebble Component - Simple circle with color and size
const Pebble = ({ color, label, size = 'normal', isSelected = false, onClick, className = '' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    normal: 'w-8 h-8', 
    large: 'w-10 h-10',
    'extra-large': 'w-12 h-12'
  };

  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500', 
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  };

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isSelected}
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]}
        rounded-full
        border-2
        ${isSelected ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-white/20'}
        transition-all duration-200
        cursor-pointer
        hover:scale-110
        flex items-center justify-center
        ${className}
      `}
      onClick={onClick}
    >
      {isSelected && <div className="w-2 h-2 bg-yellow-300 rounded-full" />}
    </button>
  );
};

// Container for pebbles - represents the "bag"
const PebbleBag = ({ children, title = "Probability Bag" }) => {
  return (
    <div className="bg-neutral-900/50 rounded-lg p-6 border-2 border-dashed border-neutral-600">
      <h4 className="text-center text-neutral-400 mb-4 font-medium">{title}</h4>
      <div className="min-h-32 flex flex-wrap gap-3 justify-center items-center">
        {children}
      </div>
    </div>
  );
};

// Probability display component
const ProbabilityDisplay = ({ title, probability, count, total, color, selectionWeight = false }) => {
  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  
  return (
    <div className="bg-neutral-800/50 rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-${color}-400 font-medium text-sm`}>{title}</span>
        <span className="text-white font-bold">{probability}</span>
      </div>
      <div className="text-xs text-neutral-400">
        {selectionWeight ? `Selection weight ${count} of ${total}` : `${count} out of ${total}`} ({percentage}%)
      </div>
    </div>
  );
};

// Equal Mass Scenario Component
const EqualMassScenario = () => {
  const [selectedPebble, setSelectedPebble] = useState(null);
  const [results, setResults] = useState({ red: 0, blue: 0, green: 0, total: 0 });
  const contentRef = useMathJax([selectedPebble?.id, results.total]);

  const pebbles = [
    { id: 1, color: 'red', type: 'Red' },
    { id: 2, color: 'red', type: 'Red' },
    { id: 3, color: 'red', type: 'Red' },
    { id: 4, color: 'blue', type: 'Blue' },
    { id: 5, color: 'blue', type: 'Blue' },
    { id: 6, color: 'green', type: 'Green' }
  ];

  const pickRandomPebble = () => {
    const randomIndex = Math.floor(Math.random() * pebbles.length);
    const picked = pebbles[randomIndex];
    setSelectedPebble(picked);
    setResults(prev => ({
      ...prev,
      [picked.color]: prev[picked.color] + 1,
      total: prev.total + 1
    }));
  };

  const resetExperiment = () => {
    setResults({ red: 0, blue: 0, green: 0, total: 0 });
    setSelectedPebble(null);
  };

  const redCount = pebbles.filter(p => p.color === 'red').length;
  const blueCount = pebbles.filter(p => p.color === 'blue').length;
  const greenCount = pebbles.filter(p => p.color === 'green').length;
  const totalCount = pebbles.length;

  return (
    <div ref={contentRef} className="space-y-6">
      <SemanticGradientCard
        title="Scenario 1: Equal Selection Weights"
        description="The random selection rule gives each of the six pebbles probability 1/6 on every draw, with replacement."
        theme="teal"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visual Display */}
        <div className="space-y-4">
          <PebbleBag title="Equal Selection Weights">
            {pebbles.map((pebble) => (
              <Pebble
                key={pebble.id}
                label={`Inspect ${pebble.type} pebble ${pebble.id}`}
                color={pebble.color}
                size="normal"
                isSelected={selectedPebble?.id === pebble.id}
                onClick={() => setSelectedPebble(pebble)}
              />
            ))}
          </PebbleBag>

          <div className="flex gap-3">
            <Button onClick={pickRandomPebble} variant="primary" className="flex-1">
              Pick Random Pebble
            </Button>
            <Button onClick={resetExperiment} variant="neutral">
              Reset
            </Button>
          </div>

          <div role="status" aria-live="polite" aria-atomic="true">
            <SimpleInsightBox title="Selected Pebble" theme="yellow">
              <p>
                {selectedPebble ? `Selected: ${selectedPebble.type} pebble.` : 'No pebble selected.'}
                {' '}Random draws: {results.total}.
              </p>
            </SimpleInsightBox>
          </div>
          <p className="text-xs text-neutral-400">Select a pebble to inspect it. Use Pick Random Pebble to record a draw.</p>
        </div>

        {/* Probability Analysis */}
        <div className="space-y-4">
          <div className="bg-neutral-800/30 rounded-lg p-4">
            <h4 className="text-white font-bold mb-3">Theoretical Probabilities</h4>
            <div className="space-y-3">
              <ProbabilityDisplay
                title="P(Red)"
                probability={`${redCount}/${totalCount} ≈ ${(redCount/totalCount).toFixed(3)}`}
                count={redCount}
                total={totalCount}
                color="red"
              />
              <ProbabilityDisplay
                title="P(Blue)"
                probability={`${blueCount}/${totalCount} ≈ ${(blueCount/totalCount).toFixed(3)}`}
                count={blueCount}
                total={totalCount}
                color="blue"
              />
              <ProbabilityDisplay
                title="P(Green)"
                probability={`${greenCount}/${totalCount} ≈ ${(greenCount/totalCount).toFixed(3)}`}
                count={greenCount}
                total={totalCount}
                color="green"
              />
            </div>
          </div>

          {results.total > 0 && (
            <div className="bg-neutral-800/30 rounded-lg p-4">
              <h4 className="text-white font-bold mb-3">Your Experimental Results</h4>
              <div className="space-y-3">
                <ProbabilityDisplay
                  title="Red Picked"
                  probability={`${results.red}/${results.total}`}
                  count={results.red}
                  total={results.total}
                  color="red"
                />
                <ProbabilityDisplay
                  title="Blue Picked"
                  probability={`${results.blue}/${results.total}`}
                  count={results.blue}
                  total={results.total}
                  color="blue"
                />
                <ProbabilityDisplay
                  title="Green Picked"
                  probability={`${results.green}/${results.total}`}
                  count={results.green}
                  total={results.total}
                  color="green"
                />
              </div>
              
              {results.total >= 10 && (
                <div className="mt-3 p-3 bg-blue-900/20 border border-blue-600/30 rounded">
                  <p className="text-blue-300 text-xs">
                    Experimental percentages can fluctuate after each draw. Over many independent
                    draws, they tend toward the theoretical probabilities (Law of Large Numbers).
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="text-center text-xs text-neutral-400">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(\\text{chosen color}) = \\frac{\\text{count of that color}}{\\text{total pebbles}}\\]`
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Unequal Mass Scenario Component  
const UnequalMassScenario = () => {
  const [selectedPebble, setSelectedPebble] = useState(null);
  const [results, setResults] = useState({ red: 0, blue: 0, green: 0, total: 0 });
  const contentRef = useMathJax([selectedPebble?.id, results.total]);

  // Selection weights per pebble: Red=2, Blue=1, Green=0.5.
  const pebbles = [
    { id: 1, color: 'red', type: 'Red', weight: 2, size: 'large' },
    { id: 2, color: 'red', type: 'Red', weight: 2, size: 'large' },
    { id: 3, color: 'blue', type: 'Blue', weight: 1, size: 'normal' },
    { id: 4, color: 'blue', type: 'Blue', weight: 1, size: 'normal' },
    { id: 5, color: 'green', type: 'Green', weight: 0.5, size: 'small' },
    { id: 6, color: 'green', type: 'Green', weight: 0.5, size: 'small' }
  ];

  const totalWeight = pebbles.reduce((sum, p) => sum + p.weight, 0);

  const pickRandomPebble = () => {
    // A uniform draw from the total weight selects a cumulative-weight interval.
    const random = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    
    for (const pebble of pebbles) {
      cumulativeWeight += pebble.weight;
      if (random <= cumulativeWeight) {
        setSelectedPebble(pebble);
        setResults(prev => ({
          ...prev,
          [pebble.color]: prev[pebble.color] + 1,
          total: prev.total + 1
        }));
        break;
      }
    }
  };

  const resetExperiment = () => {
    setResults({ red: 0, blue: 0, green: 0, total: 0 });
    setSelectedPebble(null);
  };

  const redWeight = pebbles.filter(p => p.color === 'red').reduce((sum, p) => sum + p.weight, 0);
  const blueWeight = pebbles.filter(p => p.color === 'blue').reduce((sum, p) => sum + p.weight, 0);
  const greenWeight = pebbles.filter(p => p.color === 'green').reduce((sum, p) => sum + p.weight, 0);

  return (
    <div ref={contentRef} className="space-y-6">
      <SemanticGradientCard
        title="Scenario 2: Weighted Selection"
        description="Size encodes a numeric selection weight. This algorithm picks each pebble with probability equal to its weight divided by the total weight, with replacement."
        theme="purple"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visual Display */}
        <div className="space-y-4">
          <PebbleBag title="Weighted Selection">
            {pebbles.map((pebble) => (
              <Pebble
                key={pebble.id}
                label={`Inspect ${pebble.type} pebble ${pebble.id}, selection weight ${pebble.weight}`}
                color={pebble.color}
                size={pebble.size}
                isSelected={selectedPebble?.id === pebble.id}
                onClick={() => setSelectedPebble(pebble)}
              />
            ))}
          </PebbleBag>

          <div className="bg-neutral-800/50 rounded-lg p-3">
            <h5 className="text-sm font-medium text-white mb-2">Selection Weight per Pebble</h5>
            <div className="flex justify-between text-xs">
              <span className="text-red-400">Red: weight = 2</span>
              <span className="text-blue-400">Blue: weight = 1</span>
              <span className="text-green-400">Green: weight = 0.5</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={pickRandomPebble} variant="primary" className="flex-1">
              Pick Weighted Random
            </Button>
            <Button onClick={resetExperiment} variant="neutral">
              Reset
            </Button>
          </div>

          <div role="status" aria-live="polite" aria-atomic="true">
            <SimpleInsightBox title="Selected Pebble" theme="purple">
              <p>
                {selectedPebble ? `Selected: ${selectedPebble.type} pebble, selection weight ${selectedPebble.weight}.` : 'No pebble selected.'}
                {' '}Random draws: {results.total}.
              </p>
            </SimpleInsightBox>
          </div>
          <p className="text-xs text-neutral-400">Select a pebble to inspect it. Use Pick Weighted Random to record a draw. Physical mass alone does not specify a selection probability.</p>
        </div>

        {/* Probability Analysis */}
        <div className="space-y-4">
          <div className="bg-neutral-800/30 rounded-lg p-4">
            <h4 className="text-white font-bold mb-3">Theoretical Probabilities</h4>
            <div className="space-y-3">
              <ProbabilityDisplay
                title="P(Red)"
                probability={`${redWeight}/${totalWeight} ≈ ${(redWeight/totalWeight).toFixed(3)}`}
                count={redWeight}
                total={totalWeight}
                color="red"
                selectionWeight
              />
              <ProbabilityDisplay
                title="P(Blue)"
                probability={`${blueWeight}/${totalWeight} ≈ ${(blueWeight/totalWeight).toFixed(3)}`}
                count={blueWeight}
                total={totalWeight}
                color="blue"
                selectionWeight
              />
              <ProbabilityDisplay
                title="P(Green)"
                probability={`${greenWeight}/${totalWeight} ≈ ${(greenWeight/totalWeight).toFixed(3)}`}
                count={greenWeight}
                total={totalWeight}
                color="green"
                selectionWeight
              />
            </div>
          </div>

          {results.total > 0 && (
            <div className="bg-neutral-800/30 rounded-lg p-4">
              <h4 className="text-white font-bold mb-3">Your Experimental Results</h4>
              <div className="space-y-3">
                <ProbabilityDisplay
                  title="Red Picked"
                  probability={`${results.red}/${results.total}`}
                  count={results.red}
                  total={results.total}
                  color="red"
                />
                <ProbabilityDisplay
                  title="Blue Picked"
                  probability={`${results.blue}/${results.total}`}
                  count={results.blue}
                  total={results.total}
                  color="blue"
                />
                <ProbabilityDisplay
                  title="Green Picked"
                  probability={`${results.green}/${results.total}`}
                  count={results.green}
                  total={results.total}
                  color="green"
                />
              </div>
            </div>
          )}

          <div className="text-center text-xs text-neutral-400">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(\\text{color}) = \\frac{\\text{sum of selection weights for that color}}{\\text{sum of all selection weights}}\\]`
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Conceptual Understanding Section
const ConceptualSection = () => {
  const contentRef = useMathJax([]);

  return (
    <div ref={contentRef} className="space-y-6">
      <SemanticGradientGrid title="Key Probability Concepts" theme="blue">
        <SemanticGradientCard
          title="Sample Space"
          description="The complete set of all possible outcomes"
          formula="\[S = \{\text{all possible pebbles}\}\]"
          note="In our bag, this is every single pebble regardless of color"
          theme="teal"
        />
        
        <SemanticGradientCard
          title="Event"
          description="A subset of the sample space"
          formula="\[A = \{\text{red pebbles}\} \subseteq S\]"
          note="An event is any collection of outcomes we're interested in"
          theme="green"
        />
        
        <SemanticGradientCard
          title="Probability Function"
          description="For finite, equally likely outcomes, probability is the fraction belonging to the event"
          formula="\[P(A) = \frac{\text{favorable outcomes}}{\text{total outcomes}}\]"
          note="Must satisfy: \(P(S) = 1\) and \(P(A) \geq 0\) for all events \(A\)"
          theme="purple"
        />
        
        <SemanticGradientCard
          title="Complement Rule"
          description="Probability of 'not A'"
          formula="\[P(A^c) = 1 - P(A)\]"
          note="The probability of not getting red equals 1 minus probability of red"
          theme="yellow"
        />
      </SemanticGradientGrid>

      <SimpleInsightBox title="Why the Pebble Model Works" theme="blue">
        <div className="space-y-3">
          <p>
            The pebble model gives us physical intuition for abstract probability concepts:
          </p>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Equal likelihood:</strong> The selection rule gives every pebble the same chance</li>
            <li>• <strong>Weighted selection:</strong> The algorithm assigns each pebble probability w ÷ sum of all weights; displayed size represents w</li>
            <li>• <strong>Sample space:</strong> The bag contains all possible outcomes</li>
            <li>• <strong>Events:</strong> Selecting specific colors represents different events</li>
          </ul>
          <p className="text-xs text-neutral-400 mt-3">
            This physical model helps build intuition that applies to cards, dice, coin flips, and more complex scenarios.
          </p>
        </div>
      </SimpleInsightBox>
    </div>
  );
};

// Main Interactive Tab Component
export default function Tab4InteractiveTabStaticVisual({ onComplete }) {
  const [activeScenario, setActiveScenario] = useState('equal');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Interactive Pebble World</h2>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          Explore probability through visual experiments with colored pebbles. 
          Compare uniform draws with draws proportional to assigned selection weights.
        </p>
      </div>

      {/* Scenario Selector */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          onClick={() => setActiveScenario('equal')}
          aria-pressed={activeScenario === 'equal'}
          variant={activeScenario === 'equal' ? 'primary' : 'neutral'}
        >
          Equal Selection Weights
        </Button>
        <Button
          onClick={() => setActiveScenario('unequal')}
          aria-pressed={activeScenario === 'unequal'}
          variant={activeScenario === 'unequal' ? 'primary' : 'neutral'}
        >
          Weighted Selection
        </Button>
        <Button
          onClick={() => setActiveScenario('concepts')}
          aria-pressed={activeScenario === 'concepts'}
          variant={activeScenario === 'concepts' ? 'primary' : 'neutral'}
        >
          Key Concepts
        </Button>
      </div>
      <p className="text-center text-xs text-neutral-400">Changing scenarios starts a new experiment.</p>

      {/* Content */}
      <div className="min-h-96">
        {activeScenario === 'equal' && <EqualMassScenario />}
        {activeScenario === 'unequal' && <UnequalMassScenario />}
        {activeScenario === 'concepts' && <ConceptualSection />}
      </div>

      {/* Bottom Navigation */}
      <SharedNavigation
        currentStep={activeScenario === 'equal' ? 0 : activeScenario === 'unequal' ? 1 : 2}
        totalSteps={3}
        onNavigate={(index) => {
          const scenarios = ['equal', 'unequal', 'concepts'];
          setActiveScenario(scenarios[index]);
        }}
        onComplete={onComplete}
        showProgress={true}
        nextLabel="Next Scenario"
        previousLabel="Previous Scenario"
      />
    </div>
  );
}
