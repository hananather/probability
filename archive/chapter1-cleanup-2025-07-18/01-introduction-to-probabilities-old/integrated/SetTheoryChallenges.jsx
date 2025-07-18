import React, { useState, useEffect } from 'react';
import { VennDiagram } from './VennDiagram';
import { VisualizationContainer, VisualizationSection } from '../../ui/VisualizationContainer';
import { Button } from '../../ui/button';
import { ProgressBar, ProgressNavigation } from '../../ui/ProgressBar';
import { cn, createColorScheme, formatNumber } from '../../../lib/design-system';
import { BlockMath, InlineMath } from 'react-katex';
import { parseSetExpression, elementsToRegions, areExpressionsEquivalent } from './setExpressionParser';
import 'katex/dist/katex.min.css';

// Use probability color scheme for set theory
const colorScheme = createColorScheme('probability');

// Define challenge levels with educational progression
const CHALLENGE_LEVELS = [
  {
    id: 'basics',
    name: 'Basic Set Operations',
    description: 'Master fundamental set operations',
    challenges: [
      {
        id: 'union-intro',
        title: 'Introduction to Union',
        instruction: 'Create the expression for the union of sets A and B',
        targetExpression: 'A∪B',
        hint: 'Union means "or" - elements in A OR B',
        explanation: 'The union A∪B contains all elements that are in set A, set B, or both.',
        targetRegions: [1, 2, 5, 7] // Regions in the Venn diagram
      },
      {
        id: 'intersection-intro',
        title: 'Introduction to Intersection',
        instruction: 'Create the expression for the intersection of sets A and B',
        targetExpression: 'A∩B',
        hint: 'Intersection means "and" - elements in both A AND B',
        explanation: 'The intersection A∩B contains only elements that are in both set A and set B.',
        targetRegions: [5, 7]
      },
      {
        id: 'complement-intro',
        title: 'Introduction to Complement',
        instruction: 'Create the expression for the complement of set A',
        targetExpression: "A'",
        hint: 'Complement means "not" - everything NOT in A',
        explanation: "The complement A' contains all elements in the universal set that are not in A.",
        targetRegions: [2, 3, 6, 8]
      },
      {
        id: 'triple-intersection',
        title: 'Triple Intersection',
        instruction: 'Find the expression for elements in all three sets',
        targetExpression: 'A∩B∩C',
        hint: 'What region is common to all three sets?',
        explanation: 'The triple intersection contains only elements that are in all three sets.',
        targetRegions: [7]
      }
    ]
  },
  {
    id: 'laws',
    name: 'Fundamental Laws',
    description: 'Prove important set theory laws visually',
    challenges: [
      {
        id: 'demorgan1',
        title: "De Morgan's First Law",
        instruction: "Prove that (A∪B)' = A'∩B'",
        targetExpression: "(A∪B)'",
        alternativeExpression: "A'∩B'",
        hint: 'The complement of a union equals the intersection of complements',
        explanation: "De Morgan's law shows how complement distributes over union/intersection.",
        targetRegions: [3, 8]
      },
      {
        id: 'demorgan2',
        title: "De Morgan's Second Law",
        instruction: "Prove that (A∩B)' = A'∪B'",
        targetExpression: "(A∩B)'",
        alternativeExpression: "A'∪B'",
        hint: 'The complement of an intersection equals the union of complements',
        explanation: "This is the dual of De Morgan's first law.",
        targetRegions: [1, 2, 3, 4, 6, 8]
      },
      {
        id: 'distributive1',
        title: 'Distributive Law (∩ over ∪)',
        instruction: 'Prove that A∩(B∪C) = (A∩B)∪(A∩C)',
        targetExpression: 'A∩(B∪C)',
        alternativeExpression: '(A∩B)∪(A∩C)',
        hint: 'Intersection distributes over union',
        explanation: 'This law shows how intersection distributes over union operations.',
        targetRegions: [4, 5, 7]
      },
      {
        id: 'identity1',
        title: 'Identity Law',
        instruction: 'Show that A∪∅ = A',
        targetExpression: 'A∪∅',
        alternativeExpression: 'A',
        hint: 'Union with empty set leaves the set unchanged',
        explanation: 'The empty set is the identity element for union.',
        targetRegions: [1, 4, 5, 7]
      }
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced Challenges',
    description: 'Complex expressions and problem solving',
    challenges: [
      {
        id: 'region-isolation',
        title: 'Region Isolation',
        instruction: 'Find an expression that highlights ONLY the region where A and B overlap but not C',
        targetExpression: '(A∩B)∩C\'',
        alternativeExpression: 'A∩B∩C\'',
        hint: 'You need elements in both A and B, but not in C',
        explanation: 'This type of expression is useful for finding specific combinations.',
        targetRegions: [5]
      },
      {
        id: 'symmetric-difference',
        title: 'Symmetric Difference',
        instruction: 'Create the symmetric difference of A and B: (A∪B)∖(A∩B)',
        targetExpression: '(A∪B)∩(A∩B)\'',
        alternativeExpression: '(A∩B\')∪(A\'∩B)',
        hint: 'Elements in A or B, but not both',
        explanation: 'Symmetric difference finds elements in exactly one of the two sets.',
        targetRegions: [1, 2]
      },
      {
        id: 'complex-expression',
        title: 'Complex Expression',
        instruction: 'Find elements that are in exactly two of the three sets',
        targetExpression: '((A∩B)∩C\')∪((A∩C)∩B\')∪((B∩C)∩A\')',
        hint: 'Think about all possible pairs without the third',
        explanation: 'This requires understanding how to combine multiple conditions.',
        targetRegions: [4, 5, 6]
      },
      {
        id: 'counting-challenge',
        title: 'Counting Challenge',
        instruction: 'Find an expression that results in exactly 3 elements',
        targetExpression: 'A∩C',
        hint: 'Look for regions with the right number of elements',
        explanation: 'Understanding cardinality helps in probability calculations.',
        targetRegions: [4, 7],
        checkCardinality: 3
      }
    ]
  }
];

// Region to element mapping for validation
const REGION_ELEMENTS = {
  1: [1],      // Only A
  2: [2],      // Only B
  3: [3],      // Only C
  4: [4],      // A and C, not B
  5: [5],      // A and B, not C
  6: [6],      // B and C, not A
  7: [7],      // All three
  8: [8]       // None (universe minus all sets)
};

export function SetTheoryChallenges() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [userExpression, setUserExpression] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState(new Set());
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [showSolution, setShowSolution] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);
  
  // Set data for Venn diagram
  const [sets] = useState([
    { name: 'A', cx: 0.35, cy: 0.4, r: 0.25 },
    { name: 'B', cx: 0.65, cy: 0.4, r: 0.25 },
    { name: 'C', cx: 0.5, cy: 0.65, r: 0.25 }
  ]);
  
  const level = CHALLENGE_LEVELS[currentLevel];
  const challenge = level?.challenges[currentChallenge];
  const totalChallenges = CHALLENGE_LEVELS.reduce((sum, level) => sum + level.challenges.length, 0);
  const completedCount = completedChallenges.size;
  
  
  // Check if user's answer is correct
  function checkAnswer() {
    const userResult = parseSetExpression(userExpression);
    
    if (!userResult) {
      setFeedback('Invalid expression. Please check your syntax.');
      return;
    }
    
    // Check cardinality if specified
    if (challenge.checkCardinality && userResult.length !== challenge.checkCardinality) {
      setFeedback(`Your expression has ${userResult.length} elements, but we need exactly ${challenge.checkCardinality}.`);
      return;
    }
    
    // Check if it matches target regions
    const userRegions = elementsToRegions(userResult);
    const targetRegions = challenge.targetRegions.sort();
    const userRegionsSorted = userRegions.sort();
    
    const isCorrect = JSON.stringify(userRegionsSorted) === JSON.stringify(targetRegions);
    
    // Also check alternative expression if provided
    let isAlternativeCorrect = false;
    if (challenge.alternativeExpression) {
      isAlternativeCorrect = areExpressionsEquivalent(userExpression, challenge.alternativeExpression);
    }
    
    if (isCorrect || isAlternativeCorrect) {
      setFeedback('✓ Correct! ' + challenge.explanation);
      setCompletedChallenges(prev => new Set([...prev, `${level.id}-${challenge.id}`]));
      setShowSolution(true);
    } else {
      setFeedback('Not quite right. The highlighted regions don\'t match the target.');
    }
  }
  
  // Handle expression input
  function handleExpressionChange(expr) {
    setUserExpression(expr);
    setShowSolution(false);
    
    // Update highlighted regions in real-time
    const result = parseSetExpression(expr);
    if (result) {
      setSelectedRegions(elementsToRegions(result));
    } else {
      setSelectedRegions([]);
    }
  }
  
  // Navigate challenges
  function nextChallenge() {
    if (currentChallenge < level.challenges.length - 1) {
      setCurrentChallenge(currentChallenge + 1);
    } else if (currentLevel < CHALLENGE_LEVELS.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setCurrentChallenge(0);
    }
    resetChallenge();
  }
  
  function previousChallenge() {
    if (currentChallenge > 0) {
      setCurrentChallenge(currentChallenge - 1);
    } else if (currentLevel > 0) {
      setCurrentLevel(currentLevel - 1);
      setCurrentChallenge(CHALLENGE_LEVELS[currentLevel - 1].challenges.length - 1);
    }
    resetChallenge();
  }
  
  function resetChallenge() {
    setUserExpression('');
    setFeedback('');
    setShowHint(false);
    setSelectedRegions([]);
    setShowSolution(false);
  }
  
  // Notation buttons
  const notationButtons = ['A', 'B', 'C', '∅', 'U', '∪', '∩', "'", '(', ')'];
  
  return (
    <VisualizationContainer title="Set Theory Challenges" className="p-2">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel - Challenges */}
        <div className="lg:w-1/3 space-y-3">
          {/* Level Progress */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">
              {level?.name || 'Set Theory Challenges'}
            </h4>
            <p className="text-sm text-gray-400 mb-3">{level?.description}</p>
            
            <ProgressBar
              current={completedCount}
              total={totalChallenges}
              label="Overall Progress"
              variant="teal"
            />
            
            <div className="text-xs text-gray-400 mt-2">
              Level {currentLevel + 1} of {CHALLENGE_LEVELS.length} • 
              Challenge {currentChallenge + 1} of {level?.challenges.length || 0}
            </div>
          </VisualizationSection>
          
          {/* Current Challenge */}
          <VisualizationSection className="p-3">
            <h4 className="text-lg font-bold text-yellow-400 mb-2">
              {challenge?.title}
            </h4>
            
            <p className="text-sm text-gray-300 mb-4">
              {challenge?.instruction}
            </p>
            
            {challenge?.targetExpression && (
              <div className="bg-gray-800 rounded p-2 mb-3">
                <div className="text-xs text-gray-400 mb-1">Target:</div>
                <InlineMath math={challenge.targetExpression} />
                {challenge?.alternativeExpression && (
                  <div className="text-xs text-gray-400 mt-2">
                    Prove it equals: <InlineMath math={challenge.alternativeExpression} />
                  </div>
                )}
              </div>
            )}
            
            {/* Expression Builder */}
            <div className="space-y-3">
              <div className="bg-neutral-900 rounded p-3 min-h-[50px] font-mono text-lg text-white">
                {userExpression || <span className="text-neutral-500">Build your expression...</span>}
              </div>
              
              {/* Notation buttons */}
              <div className="grid grid-cols-5 gap-1.5">
                {notationButtons.map(symbol => (
                  <button
                    key={symbol}
                    onClick={() => handleExpressionChange(userExpression + symbol)}
                    className="px-2 py-1.5 rounded text-sm font-medium bg-neutral-700 hover:bg-neutral-600 text-white transition-colors"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="success"
                  size="sm"
                  onClick={checkAnswer}
                  className="flex-1"
                >
                  Check Answer
                </Button>
                <Button
                  variant="neutral"
                  size="sm"
                  onClick={() => handleExpressionChange(userExpression.slice(0, -1))}
                >
                  Delete
                </Button>
                <Button
                  variant="neutral"
                  size="sm"
                  onClick={resetChallenge}
                >
                  Clear
                </Button>
              </div>
              
              {/* Hint button */}
              {!showHint && (
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => setShowHint(true)}
                  className="w-full"
                >
                  Show Hint
                </Button>
              )}
              
              {showHint && (
                <div className="bg-blue-900/30 border border-blue-700 rounded p-2 text-sm text-blue-300">
                  💡 {challenge?.hint}
                </div>
              )}
            </div>
          </VisualizationSection>
          
          {/* Feedback */}
          {feedback && (
            <VisualizationSection className="p-3">
              <div className={cn(
                "text-sm",
                feedback.startsWith('✓') ? "text-green-400" : "text-orange-400"
              )}>
                {feedback}
              </div>
              
              {showSolution && challenge?.alternativeExpression && (
                <div className="mt-3 bg-gray-800 rounded p-3">
                  <div className="text-xs text-gray-400 mb-2">Equivalent expressions:</div>
                  <div className="space-y-1">
                    <InlineMath math={`${challenge.targetExpression} = ${challenge.alternativeExpression}`} />
                  </div>
                </div>
              )}
            </VisualizationSection>
          )}
          
          {/* Navigation */}
          <VisualizationSection className="p-3">
            <ProgressNavigation
              current={currentChallenge + 1}
              total={level?.challenges.length || 1}
              onPrevious={previousChallenge}
              onNext={nextChallenge}
              variant="teal"
              nextLabel={showSolution ? "Next Challenge" : "Skip"}
            />
            
            {/* Drag toggle */}
            <label className="flex items-center gap-2 text-sm mt-3">
              <input 
                type="checkbox" 
                checked={dragEnabled} 
                onChange={e => setDragEnabled(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-neutral-300">Enable set dragging</span>
            </label>
          </VisualizationSection>
        </div>
        
        {/* Right Panel - Venn Diagram */}
        <div className="lg:w-2/3">
          <div className="bg-gray-900 rounded-lg p-4" style={{ height: '600px' }}>
            <VennDiagram
              sets={sets}
              selectedSections={selectedRegions}
              onSetDrag={(name, pos) => {
                // Handle drag if needed
              }}
              dragEnabled={dragEnabled}
              colorScheme={colorScheme}
              width={800}
              height={550}
            />
          </div>
          
          {/* Region reference */}
          <div className="mt-3 bg-gray-800 rounded p-3">
            <div className="text-xs text-gray-400 mb-2">Region Reference:</div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>Region 1: Only A</div>
              <div>Region 2: Only B</div>
              <div>Region 3: Only C</div>
              <div>Region 4: A∩C only</div>
              <div>Region 5: A∩B only</div>
              <div>Region 6: B∩C only</div>
              <div>Region 7: A∩B∩C</div>
              <div>Region 8: Outside all</div>
            </div>
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default SetTheoryChallenges;