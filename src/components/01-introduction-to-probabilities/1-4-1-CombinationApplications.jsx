"use client";
import React, { useState } from "react";
import { 
  VisualizationContainer, 
  VisualizationSection
} from '../ui/VisualizationContainer';
import { colors, typography, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';

const colorScheme = createColorScheme('probability');

// Calculate nCr
function nCr(n, r) {
  if (r > n || r < 0) return 0;
  if (r === 0 || r === n) return 1;
  
  let result = 1;
  for (let i = 0; i < r; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
}

// Format large numbers with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const applications = [
  {
    id: 'committee',
    title: 'Committee Selection',
    icon: '👥',
    scenario: 'A company has 15 engineers and needs to select 4 for a safety committee.',
    n: 15,
    r: 4,
    question: 'How many different committees can be formed?',
    followUp: 'If 2 specific engineers must be included, how many committees are possible?',
    followUpCalc: (n, r) => nCr(n - 2, r - 2),
    unit: 'committees'
  },
  {
    id: 'quality',
    title: 'Quality Control',
    icon: '🔍',
    scenario: 'From a batch of 100 products, an inspector randomly selects 5 for testing.',
    n: 100,
    r: 5,
    question: 'How many different samples can be selected?',
    followUp: 'If the batch has 3 defective items, how many samples contain at least 1 defect?',
    followUpCalc: (n, r) => nCr(n, r) - nCr(n - 3, r),
    unit: 'samples'
  },
  {
    id: 'poker',
    title: 'Poker Hands',
    icon: '🃏',
    scenario: 'In poker, you receive 5 cards from a standard 52-card deck.',
    n: 52,
    r: 5,
    question: 'How many different 5-card hands are possible?',
    followUp: 'How many hands contain exactly one pair?',
    followUpCalc: () => 13 * nCr(4, 2) * nCr(12, 3) * Math.pow(4, 3),
    unit: 'hands'
  },
  {
    id: 'network',
    title: 'Network Connections',
    icon: '🌐',
    scenario: 'A network has 20 nodes. You need to establish direct connections between some pairs.',
    n: 20,
    r: 2,
    question: 'How many possible connections exist between all pairs of nodes?',
    followUp: 'If you can only afford 15 connections, how many ways can you choose which to build?',
    followUpCalc: (n, r) => nCr(nCr(n, r), 15),
    unit: 'ways'
  },
  {
    id: 'pizza',
    title: 'Pizza Toppings',
    icon: '🍕',
    scenario: 'A pizza shop offers 12 different toppings. You want exactly 3 toppings.',
    n: 12,
    r: 3,
    question: 'How many different 3-topping pizzas can you order?',
    followUp: 'If you must include pepperoni, how many options remain?',
    followUpCalc: (n, r) => nCr(n - 1, r - 1),
    unit: 'pizzas'
  },
  {
    id: 'team',
    title: 'Sports Team',
    icon: '⚽',
    scenario: 'A soccer coach has 18 players and needs to select 11 for the starting lineup.',
    n: 18,
    r: 11,
    question: 'How many different starting lineups are possible?',
    followUp: 'If 3 players are injured, how many lineups can be formed?',
    followUpCalc: (n, r) => nCr(n - 3, r),
    unit: 'lineups'
  }
];

export function CombinationApplications() {
  const [selectedApp, setSelectedApp] = useState(applications[0]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);

  const mainAnswer = nCr(selectedApp.n, selectedApp.r);
  const followUpAnswer = selectedApp.followUpCalc(selectedApp.n, selectedApp.r);

  return (
    <VisualizationContainer 
      title="Real-World Applications of Combinations"
      className="p-2"
    >
      <div className="space-y-4">
        {/* Application selector */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          {applications.map(app => (
            <Button
              key={app.id}
              variant={selectedApp.id === app.id ? 'primary' : 'neutral'}
              size="sm"
              onClick={() => {
                setSelectedApp(app);
                setShowAnswer(false);
                setShowFollowUp(false);
              }}
              className="flex flex-col items-center py-3"
            >
              <span className="text-2xl mb-1">{app.icon}</span>
              <span className="text-xs">{app.title}</span>
            </Button>
          ))}
        </div>
        
        {/* Scenario */}
        <VisualizationSection className="p-4">
          <h3 className="text-lg font-semibold text-white mb-3">
            {selectedApp.title}
          </h3>
          <p className={cn(typography.description, "mb-4")}>
            {selectedApp.scenario}
          </p>
          
          {/* Main question */}
          <div className="bg-neutral-800 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-purple-400 mb-3">
              {selectedApp.question}
            </p>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-neutral-300">
                Formula: <span className="font-mono">C({selectedApp.n},{selectedApp.r})</span>
              </div>
              <Button
                variant="primary"
                size="xs"
                onClick={() => setShowAnswer(!showAnswer)}
              >
                {showAnswer ? 'Hide' : 'Show'} Answer
              </Button>
            </div>
            
            {showAnswer && (
              <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-600/50">
                <div className="text-2xl font-mono font-bold text-yellow-400 mb-2">
                  {formatNumber(mainAnswer)} {selectedApp.unit}
                </div>
                <div className="text-sm font-mono text-neutral-300">
                  = {selectedApp.n}! / ({selectedApp.r}! × {selectedApp.n - selectedApp.r}!)
                </div>
              </div>
            )}
          </div>
          
          {/* Follow-up question */}
          {showAnswer && (
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-400 mb-3">
                Follow-up: {selectedApp.followUp}
              </p>
              
              <Button
                variant="info"
                size="xs"
                onClick={() => setShowFollowUp(!showFollowUp)}
              >
                {showFollowUp ? 'Hide' : 'Show'} Solution
              </Button>
              
              {showFollowUp && (
                <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-600/50">
                  <div className="text-xl font-mono font-bold text-yellow-400 mb-2">
                    {formatNumber(followUpAnswer)} {selectedApp.unit}
                  </div>
                  <div className="text-xs text-neutral-400">
                    {selectedApp.id === 'committee' && 'Choose 2 from remaining 13 engineers'}
                    {selectedApp.id === 'quality' && 'Total samples minus samples with no defects'}
                    {selectedApp.id === 'poker' && '13 ranks × C(4,2) pairs × C(12,3) × 4³ for other cards'}
                    {selectedApp.id === 'network' && 'Choose 15 connections from 190 possible'}
                    {selectedApp.id === 'pizza' && 'Choose 2 more toppings from remaining 11'}
                    {selectedApp.id === 'team' && 'Choose 11 from 15 available players'}
                  </div>
                </div>
              )}
            </div>
          )}
        </VisualizationSection>
        
        {/* General tips */}
        <VisualizationSection className="p-3">
          <h4 className="text-sm font-semibold text-neutral-300 mb-2">When to Use Combinations</h4>
          <ul className="text-xs text-neutral-400 space-y-1">
            <li>✓ Order doesn't matter (committee member A, B, C = C, B, A)</li>
            <li>✓ Selecting a subset from a larger set</li>
            <li>✓ No repetition allowed (can't select the same item twice)</li>
            <li>✓ Examples: lottery numbers, team selection, sampling</li>
          </ul>
        </VisualizationSection>
      </div>
    </VisualizationContainer>
  );
}