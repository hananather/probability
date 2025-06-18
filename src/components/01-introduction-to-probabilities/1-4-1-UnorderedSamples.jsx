"use client";
import React, { useState, useRef, useEffect } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { RangeSlider } from '../ui/RangeSlider';
import { InfoIcon, ChevronRight, Calculator, Grid, BarChart3, Sparkles, Users, FileText } from 'lucide-react';
import { tutorial_1_4_unordered } from '@/tutorials/chapter1';

const colorScheme = createColorScheme('probability');

// Tab configuration
const TABS = [
  { id: 'lottery', label: 'Lottery', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'formula', label: 'Formula', icon: <Calculator className="w-3 h-3" /> },
  { id: 'pascal', label: "Pascal's", icon: <Grid className="w-3 h-3" /> },
  { id: 'builder', label: 'Builder', icon: <Grid className="w-3 h-3" /> },
  { id: 'applications', label: 'Applications', icon: <Users className="w-3 h-3" /> },
];

// Main Component
export default function UnorderedSamples() {
  const [n, setN] = useState(6);
  const [r, setR] = useState(3);
  const [activeTab, setActiveTab] = useState('lottery');
  
  // Calculate combination value
  const factorial = (num) => {
    if (num <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= num; i++) {
      result *= i;
    }
    return result;
  };
  
  const combination = (n, r) => {
    if (r > n) return 0;
    if (r === 0 || r === n) return 1;
    return factorial(n) / (factorial(r) * factorial(n - r));
  };
  
  const combinationValue = combination(n, r);
  const permutationValue = n >= r ? factorial(n) / factorial(n - r) : 0;

  return (
    <VisualizationContainer 
      title="Unordered Samples (Combinations)"
      tutorialSteps={tutorial_1_4_unordered}
      tutorialKey="unordered-samples-1-4-1"
      description={
        <p className={typography.description}>
          Explore combinations - counting selections where order doesn't matter. 
          Understand the relationship between permutations and combinations through interactive visualizations.
        </p>
      }
    >
      <div className="max-w-4xl mx-auto">
        {/* Tab Navigation */}
        <div className="mb-4">
          <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-1">
            <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            
            {/* Quick Settings */}
            <div className="flex items-center gap-3 ml-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">n:</label>
                <input
                  type="number"
                  value={n}
                  onChange={(e) => setN(Math.max(1, Math.min(49, parseInt(e.target.value) || 1)))}
                  className="w-12 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white text-center"
                  min="1"
                  max="49"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">r:</label>
                <input
                  type="number"
                  value={r}
                  onChange={(e) => setR(Math.max(0, Math.min(n, parseInt(e.target.value) || 0)))}
                  className="w-12 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white text-center"
                  min="0"
                  max={n}
                />
              </div>
              <div className="text-sm font-mono">
                <span className="text-gray-400">C(</span>
                <span className="text-cyan-400">{n}</span>
                <span className="text-gray-400">,</span>
                <span className="text-green-400">{r}</span>
                <span className="text-gray-400">) = </span>
                <span className="text-yellow-400 font-bold">{formatNumber(combinationValue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - Fixed Height */}
        <div className="bg-gray-900/50 rounded-lg relative" style={{ minHeight: '350px', height: 'calc(100vh - 380px)', maxHeight: '450px' }}>
          {/* Lottery Tab */}
          <div className={cn(
            "absolute inset-0 transition-all duration-300 overflow-y-auto",
            activeTab === 'lottery' 
              ? "opacity-100 transform translate-x-0 z-10" 
              : "opacity-0 transform -translate-x-4 pointer-events-none z-0"
          )}>
            <LotteryVisualization n={n} r={r} />
          </div>

          {/* Formula Tab */}
          <div className={cn(
            "absolute inset-0 transition-all duration-300 overflow-y-auto",
            activeTab === 'formula' 
              ? "opacity-100 transform translate-x-0 z-10" 
              : "opacity-0 transform translate-x-4 pointer-events-none z-0"
          )}>
            <FormulaDerivation n={n} r={r} />
          </div>

          {/* Pascal's Triangle Tab */}
          <div className={cn(
            "absolute inset-0 transition-all duration-300 p-4 overflow-y-auto",
            activeTab === 'pascal' 
              ? "opacity-100 transform translate-x-0 z-10" 
              : "opacity-0 transform -translate-x-4 pointer-events-none z-0"
          )}>
            <PascalTriangle 
              n={n} 
              r={r} 
              onCellClick={(newN, newR) => {
                setN(newN);
                setR(newR);
              }}
            />
          </div>

          {/* Builder Tab */}
          <div className={cn(
            "absolute inset-0 transition-all duration-300 p-4 overflow-y-auto",
            activeTab === 'builder' 
              ? "opacity-100 transform translate-x-0 z-10" 
              : "opacity-0 transform translate-x-4 pointer-events-none z-0"
          )}>
            <CombinationBuilder n={n} r={r} />
          </div>

          {/* Applications Tab */}
          <div className={cn(
            "absolute inset-0 transition-all duration-300 overflow-y-auto",
            activeTab === 'applications' 
              ? "opacity-100 transform translate-x-0 z-10" 
              : "opacity-0 transform -translate-x-4 pointer-events-none z-0"
          )}>
            <RealWorldApplications n={n} r={r} onSelect={(newN, newR) => {
              setN(newN);
              setR(newR);
            }} />
          </div>
        </div>

        {/* Info Bar */}
        <div className="mt-4 flex items-center justify-between bg-gray-800/30 rounded-lg p-3">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-400">Permutations: </span>
              <span className="font-mono text-green-400">{formatNumber(permutationValue)}</span>
            </div>
            <div>
              <span className="text-gray-400">Combinations: </span>
              <span className="font-mono text-cyan-400">{formatNumber(combinationValue)}</span>
            </div>
            <div>
              <span className="text-gray-400">Relationship: </span>
              <span className="font-mono text-purple-400">C = P/{r}!</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="neutral"
              size="xs"
              onClick={() => { setN(6); setR(3); }}
            >
              Simple (6,3)
            </Button>
            <Button
              variant="neutral"
              size="xs"
              onClick={() => { setN(49); setR(6); }}
            >
              Lottery 6/49
            </Button>
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}

// Lottery Visualization Component
const LotteryVisualization = React.memo(function LotteryVisualization({ n, r }) {
  const [selectedBalls, setSelectedBalls] = useState(new Set());
  const [showOrderMatters, setShowOrderMatters] = useState(false);
  const [selectionHistory, setSelectionHistory] = useState([]);
  const [highlightMilestone, setHighlightMilestone] = useState(null);
  const containerRef = useRef(null);

  // Reset when n or r changes
  useEffect(() => {
    setSelectedBalls(new Set());
    setSelectionHistory([]);
    setHighlightMilestone(null);
  }, [n, r]);

  // Check for milestones
  useEffect(() => {
    // Milestone 1: Selected r balls
    if (selectedBalls.size === r && highlightMilestone !== 'complete') {
      setHighlightMilestone('complete');
      setTimeout(() => setHighlightMilestone(null), 3000);
    }

    // Milestone 2: Discovered symmetry C(n,r) = C(n,n-r)
    if (selectedBalls.size === n - r && r !== n - r && highlightMilestone !== 'symmetry') {
      setHighlightMilestone('symmetry');
      setTimeout(() => setHighlightMilestone(null), 3000);
    }
  }, [selectedBalls, n, r, highlightMilestone]);

  const handleBallClick = (ballNumber) => {
    const newSelected = new Set(selectedBalls);
    
    if (newSelected.has(ballNumber)) {
      newSelected.delete(ballNumber);
      // Remove from history
      setSelectionHistory(prev => prev.filter(b => b !== ballNumber));
    } else if (newSelected.size < r) {
      newSelected.add(ballNumber);
      // Add to history to track order
      setSelectionHistory(prev => [...prev, ballNumber]);
    }
    
    setSelectedBalls(newSelected);
  };

  const resetSelection = () => {
    setSelectedBalls(new Set());
    setSelectionHistory([]);
    setHighlightMilestone(null);
  };

  // Calculate current combination value
  const currentCombinationValue = combination(n, selectedBalls.size);

  // Generate ball numbers
  const balls = Array.from({ length: n }, (_, i) => i + 1);

  // Helper function for factorial
  const factorial = (num) => {
    if (num <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= num; i++) {
      result *= i;
    }
    return result;
  };

  // Generate permutations for visualization
  const generatePermutations = (arr) => {
    if (arr.length <= 1) return [arr];
    const result = [];
    
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = arr.filter((_, idx) => idx !== i);
      const perms = generatePermutations(remaining);
      
      for (const perm of perms) {
        result.push([current, ...perm]);
      }
    }
    
    return result;
  };

  // Calculate permutations if showing order
  const permutationCount = showOrderMatters && selectedBalls.size > 0 
    ? factorial(selectedBalls.size) 
    : 1;

  return (
    <div className="p-4 space-y-4" ref={containerRef}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input 
            type="checkbox" 
            checked={showOrderMatters} 
            onChange={(e) => setShowOrderMatters(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-gray-300">Show order matters</span>
        </label>
        <Button
          variant="neutral"
          size="sm"
          onClick={resetSelection}
          disabled={selectedBalls.size === 0}
        >
          Reset Selection
        </Button>
      </div>

      {/* Lottery Ball Grid */}
      <div className="relative">
        <div 
          className={cn(
            "grid gap-2 p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl",
            n <= 10 ? "grid-cols-5" : 
            n <= 20 ? "grid-cols-6 sm:grid-cols-8" : 
            n <= 30 ? "grid-cols-7 sm:grid-cols-10" : 
            n <= 42 ? "grid-cols-8 sm:grid-cols-12" : 
            "grid-cols-10 sm:grid-cols-12"
          )}
        >
          {balls.map((ball) => {
            const isSelected = selectedBalls.has(ball);
            const selectionOrder = selectionHistory.indexOf(ball) + 1;
            
            return (
              <button
                key={ball}
                onClick={() => handleBallClick(ball)}
                className={cn(
                  "relative rounded-full transition-all duration-300 transform flex items-center justify-center",
                  "shadow-lg hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900",
                  n <= 20 ? "w-14 h-14" : n <= 30 ? "w-12 h-12" : "w-10 h-10",
                  isSelected 
                    ? "bg-gradient-to-br from-cyan-400 to-cyan-600 scale-105 shadow-cyan-500/50 focus:ring-cyan-500" 
                    : "bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 focus:ring-gray-500",
                  selectedBalls.size >= r && !isSelected && "opacity-50 cursor-not-allowed"
                )}
                disabled={selectedBalls.size >= r && !isSelected}
              >
                {/* Ball number */}
                <span className={cn(
                  "font-bold font-mono",
                  n <= 20 ? "text-lg" : n <= 30 ? "text-base" : "text-sm",
                  isSelected ? "text-white" : "text-gray-200"
                )}>
                  {ball}
                </span>
                
                {/* 3D effect highlight */}
                <div className={cn(
                  "absolute inset-0 rounded-full",
                  "bg-gradient-to-t from-transparent via-transparent to-white/20"
                )} />
                
                {/* Selection order badge */}
                {isSelected && showOrderMatters && (
                  <div className={cn(
                    "absolute -top-1 -right-1 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg",
                    n <= 30 ? "w-6 h-6" : "w-5 h-5"
                  )}>
                    <span className={cn(
                      "font-bold text-gray-900",
                      n <= 30 ? "text-xs" : "text-[10px]"
                    )}>{selectionOrder}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Milestone notifications */}
        {highlightMilestone && (
          <div className={cn(
            "absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          )}
          style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <div className={cn(
              "bg-gray-900/95 border-2 rounded-lg p-6 max-w-md shadow-2xl",
              "transition-all duration-300 animate-in fade-in zoom-in-95",
              highlightMilestone === 'complete' ? "border-cyan-500" : "border-purple-500"
            )}>
              {highlightMilestone === 'complete' && (
                <>
                  <h4 className="text-lg font-bold text-cyan-400 mb-2">
                    Selection Complete!
                  </h4>
                  <p className="text-sm text-gray-300">
                    You've selected {r} balls from {n}. This is one of{' '}
                    <span className="font-mono text-cyan-400">{combination(n, r)}</span> possible combinations.
                  </p>
                  {showOrderMatters && (
                    <p className="text-sm text-gray-400 mt-2">
                      With order mattering, this specific arrangement is 1 of{' '}
                      <span className="font-mono text-green-400">{factorial(r)}</span> ways to arrange these balls.
                    </p>
                  )}
                </>
              )}
              {highlightMilestone === 'symmetry' && (
                <>
                  <h4 className="text-lg font-bold text-purple-400 mb-2">
                    Symmetry Discovered!
                  </h4>
                  <p className="text-sm text-gray-300">
                    C({n},{n - r}) = C({n},{r}) = {combination(n, r)}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Choosing {n - r} balls to exclude is the same as choosing {r} balls to include!
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live calculation display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-gray-400 mb-2">Current Selection</h5>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Balls selected:</span>
              <span className="font-mono text-cyan-400">
                {selectedBalls.size} / {r}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Combinations so far:</span>
              <span className="font-mono text-cyan-400">
                C({n},{selectedBalls.size}) = {currentCombinationValue}
              </span>
            </div>
          </div>
        </div>

        {showOrderMatters && selectedBalls.size > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-sm font-semibold text-gray-400 mb-2">Order Information</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Selection order:</span>
                <span className="font-mono text-green-400 text-sm">
                  {selectionHistory.join(' → ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Arrangements:</span>
                <span className="font-mono text-green-400">
                  {selectedBalls.size}! = {permutationCount}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Educational insights */}
      {selectedBalls.size > 0 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-200 space-y-2">
              {selectedBalls.size < r && (
                <p>
                  Select {r - selectedBalls.size} more ball{r - selectedBalls.size !== 1 ? 's' : ''} to complete your combination.
                </p>
              )}
              {selectedBalls.size === r && !showOrderMatters && (
                <p>
                  Perfect! You've created 1 combination out of {combination(n, r)} possible. 
                  Try enabling "Show order matters" to see how many ways these same balls can be arranged.
                </p>
              )}
              {selectedBalls.size === r && showOrderMatters && (
                <p>
                  With order mattering, these {r} balls can be arranged in {factorial(r)} different ways. 
                  That's why C({n},{r}) × {r}! = P({n},{r}).
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Show some example permutations when complete and order matters */}
      {selectedBalls.size === r && showOrderMatters && r <= 4 && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-gray-400 mb-3">Sample Arrangements of Your Selection</h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {generatePermutations(Array.from(selectedBalls).sort((a, b) => a - b))
              .slice(0, 6)
              .map((perm, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-gray-700/50 rounded px-2 py-1">
                  {perm.map((num, i) => (
                    <span key={i} className="text-xs font-mono text-green-400">
                      {num}{i < perm.length - 1 && ' →'}
                    </span>
                  ))}
                </div>
              ))}
            {factorial(r) > 6 && (
              <div className="text-xs text-gray-500 italic">
                ... and {factorial(r) - 6} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

// Enhanced Pascal's Triangle Component
const PascalTriangle = React.memo(function PascalTriangle({ n, r, onCellClick }) {
  const [triangleRows, setTriangleRows] = useState(10);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [showPattern, setShowPattern] = useState('none');
  const [discoveredPatterns, setDiscoveredPatterns] = useState(new Set());
  const [showHints, setShowHints] = useState(false);
  const [animateRecursive, setAnimateRecursive] = useState(false);
  const triangleRef = useRef(null);

  // Pattern discovery milestones
  const patterns = {
    symmetry: { name: 'Symmetry', hint: 'Notice C(n,r) = C(n,n-r)' },
    hockey: { name: 'Hockey Stick', hint: 'Sum diagonals to find a pattern' },
    powers: { name: 'Powers of 2', hint: 'Sum each row' },
    recursive: { name: 'Recursive Formula', hint: 'Each value = sum of two above' }
  };

  // Check for pattern discovery
  const checkPatternDiscovery = (pattern) => {
    if (!discoveredPatterns.has(pattern)) {
      setDiscoveredPatterns(prev => new Set([...prev, pattern]));
      // Celebrate discovery
      setTimeout(() => {
        setShowPattern(pattern);
      }, 100);
    }
  };

  useEffect(() => {
    if (!triangleRef.current) return;

    const svg = d3.select(triangleRef.current);
    const width = triangleRef.current.clientWidth;
    const height = Math.min(350, triangleRows * 35 + 50);
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Generate Pascal's triangle data
    const triangleData = [];
    for (let i = 0; i < triangleRows; i++) {
      const row = [];
      for (let j = 0; j <= i; j++) {
        row.push({
          value: combination(i, j),
          row: i,
          col: j,
          isHighlighted: i === n && j === r,
          isSymmetric: hoveredCell && (i === hoveredCell.row && j === i - hoveredCell.col),
          isHockey: showPattern === 'hockey' && ((j === r && i >= n) || (i === n && j <= r)),
          isPowerRow: showPattern === 'powers' && i === hoveredCell?.row,
          isRecursive: animateRecursive && hoveredCell && 
            ((i === hoveredCell.row - 1 && (j === hoveredCell.col || j === hoveredCell.col - 1)))
        });
      }
      triangleData.push(row);
    }

    // Maximize space utilization
    const maxCells = Math.max(...triangleData.map(row => row.length));
    const cellSize = Math.min(50, (width - 40) / maxCells);
    const rowHeight = Math.min(35, (height - 50) / triangleRows);
    const startY = 30;

    // Row and column labels
    const labelsGroup = svg.append("g");
    
    // Row labels (n values)
    for (let i = 0; i < Math.min(triangleRows, 12); i++) {
      labelsGroup.append("text")
        .attr("x", 15)
        .attr("y", startY + i * rowHeight)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "#666")
        .attr("font-size", "11px")
        .attr("font-family", "monospace")
        .text(`n=${i}`);
    }

    // Column position indicators (r values) for first row
    const firstRowStartX = (width - cellSize) / 2;
    for (let j = 0; j <= Math.min(triangleRows - 1, 10); j++) {
      const x = firstRowStartX + j * cellSize;
      labelsGroup.append("text")
        .attr("x", x)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#666")
        .attr("font-size", "10px")
        .attr("font-family", "monospace")
        .text(`r=${j}`);
    }

    // Draw triangle cells
    triangleData.forEach((row, rowIndex) => {
      const rowWidth = row.length * cellSize;
      const startX = (width - rowWidth) / 2;

      row.forEach((cell, colIndex) => {
        const x = startX + colIndex * cellSize + cellSize / 2;
        const y = startY + rowIndex * rowHeight;

        const g = svg.append("g")
          .attr("transform", `translate(${x}, ${y})`)
          .style("cursor", "pointer");

        // Determine cell color based on patterns
        let fillColor = "#1a1a1a";
        let strokeColor = "#333";
        let strokeWidth = 1;
        let textColor = "#ccc";
        let fontWeight = "normal";

        if (cell.isHighlighted) {
          fillColor = colorScheme.chart.secondary;
          strokeColor = colorScheme.chart.secondary;
          strokeWidth = 2;
          textColor = "#000";
          fontWeight = "bold";
        } else if (hoveredCell && hoveredCell.row === rowIndex && hoveredCell.col === colIndex) {
          fillColor = colorScheme.chart.tertiary;
          strokeColor = colorScheme.chart.tertiary;
          strokeWidth = 2;
          textColor = "white";
          fontWeight = "bold";
        } else if (cell.isSymmetric && showPattern === 'symmetry') {
          fillColor = "#4c1d95";
          strokeColor = "#7c3aed";
          textColor = "white";
        } else if (cell.isHockey) {
          fillColor = "#064e3b";
          strokeColor = "#10b981";
          textColor = "white";
        } else if (cell.isPowerRow) {
          fillColor = "#7c2d12";
          strokeColor = "#f97316";
          textColor = "white";
        } else if (cell.isRecursive) {
          fillColor = "#1e3a8a";
          strokeColor = "#3b82f6";
          textColor = "white";
        }

        // Cell background rectangle
        const rect = g.append("rect")
          .attr("x", -cellSize/2 + 4)
          .attr("y", -rowHeight/2 + 8)
          .attr("width", cellSize - 8)
          .attr("height", rowHeight - 16)
          .attr("fill", fillColor)
          .attr("stroke", strokeColor)
          .attr("stroke-width", strokeWidth)
          .attr("rx", 6)
          .style("transition", "all 200ms ease-in-out");

        // Value text
        const valueStr = cell.value.toString();
        const fontSize = valueStr.length > 5 ? "10px" : 
                        valueStr.length > 4 ? "11px" : 
                        valueStr.length > 3 ? "12px" : "14px";
        
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", textColor)
          .attr("font-size", fontSize)
          .attr("font-weight", fontWeight)
          .attr("font-family", "monospace")
          .text(cell.value);

        // Hover and click handlers
        g.on("mouseenter", function() {
            setHoveredCell({ row: rowIndex, col: colIndex, value: cell.value });
            
            // Check for symmetry pattern discovery
            if (rowIndex === colIndex || rowIndex === triangleRows - 1 - colIndex) {
              checkPatternDiscovery('symmetry');
            }
            
            // Highlight animation for non-highlighted cells
            if (!cell.isHighlighted) {
              d3.select(this).select("rect")
                .attr("fill", "#2a2a2a")
                .attr("stroke", colorScheme.chart.primary)
                .attr("stroke-width", 2);
            }
          })
          .on("mouseleave", function() {
            setHoveredCell(null);
            if (!cell.isHighlighted) {
              d3.select(this).select("rect")
                .attr("fill", fillColor)
                .attr("stroke", strokeColor)
                .attr("stroke-width", strokeWidth);
            }
          })
          .on("click", function() {
            if (onCellClick) {
              onCellClick(rowIndex, colIndex);
            }
          });
      });
    });

    // Pattern visualization overlays
    if (showPattern === 'hockey' && n < triangleRows && r <= n) {
      // Draw hockey stick pattern
      const points = [];
      
      // Vertical part
      for (let i = n; i < triangleRows && i - n < 5; i++) {
        const x = (width - (i + 1) * cellSize) / 2 + r * cellSize + cellSize / 2;
        const y = startY + i * rowHeight;
        points.push([x, y]);
      }
      
      // Horizontal part
      for (let j = 0; j <= r; j++) {
        const x = (width - (n + 1) * cellSize) / 2 + j * cellSize + cellSize / 2;
        const y = startY + n * rowHeight;
        points.push([x, y]);
      }

      if (points.length > 2) {
        const line = d3.line()
          .x(d => d[0])
          .y(d => d[1])
          .curve(d3.curveCardinal.tension(0.5));

        svg.append("path")
          .attr("d", line(points))
          .attr("fill", "none")
          .attr("stroke", "#10b981")
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", "5,5")
          .style("opacity", 0.6);
      }
    }

    // Show formula animation
    if (animateRecursive && hoveredCell && hoveredCell.row > 0) {
      const hRow = hoveredCell.row;
      const hCol = hoveredCell.col;
      
      // Draw arrows from parent cells
      if (hCol > 0) {
        // Left parent
        const x1 = (width - hRow * cellSize) / 2 + (hCol - 1) * cellSize + cellSize / 2;
        const y1 = startY + (hRow - 1) * rowHeight + rowHeight/2 - 8;
        const x2 = (width - (hRow + 1) * cellSize) / 2 + hCol * cellSize + cellSize / 2;
        const y2 = startY + hRow * rowHeight - rowHeight/2 + 8;
        
        svg.append("line")
          .attr("x1", x1).attr("y1", y1)
          .attr("x2", x2).attr("y2", y2)
          .attr("stroke", "#3b82f6")
          .attr("stroke-width", 2)
          .attr("marker-end", "url(#arrowhead)")
          .style("opacity", 0)
          .transition()
          .duration(300)
          .style("opacity", 0.8);
      }
      
      if (hCol < hRow) {
        // Right parent
        const x1 = (width - hRow * cellSize) / 2 + hCol * cellSize + cellSize / 2;
        const y1 = startY + (hRow - 1) * rowHeight + rowHeight/2 - 8;
        const x2 = (width - (hRow + 1) * cellSize) / 2 + hCol * cellSize + cellSize / 2;
        const y2 = startY + hRow * rowHeight - rowHeight/2 + 8;
        
        svg.append("line")
          .attr("x1", x1).attr("y1", y1)
          .attr("x2", x2).attr("y2", y2)
          .attr("stroke", "#3b82f6")
          .attr("stroke-width", 2)
          .attr("marker-end", "url(#arrowhead)")
          .style("opacity", 0)
          .transition()
          .duration(300)
          .style("opacity", 0.8);
      }
    }

    // Arrow marker definition
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#3b82f6");

    // Display current value info
    if (hoveredCell || (n < triangleRows && r <= n)) {
      const displayRow = hoveredCell ? hoveredCell.row : n;
      const displayCol = hoveredCell ? hoveredCell.col : r;
      const displayValue = combination(displayRow, displayCol);
      
      const infoGroup = svg.append("g")
        .attr("transform", `translate(${width/2}, ${height - 40})`);
      
      infoGroup.append("rect")
        .attr("x", -100)
        .attr("y", -15)
        .attr("width", 200)
        .attr("height", 30)
        .attr("fill", "#1a1a1a")
        .attr("stroke", colorScheme.chart.primary)
        .attr("rx", 15);
      
      infoGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", colorScheme.chart.primary)
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("font-family", "monospace")
        .text(`C(${displayRow},${displayCol}) = ${displayValue}`);
    }

    // Cleanup function
    return () => {
      if (triangleRef.current) {
        d3.select(triangleRef.current).selectAll("*").remove();
      }
    };
  }, [n, r, triangleRows, hoveredCell, showPattern, animateRecursive, onCellClick]);

  // Calculate pattern sums for display
  const calculatePatternSum = () => {
    if (showPattern === 'hockey' && hoveredCell) {
      let sum = 0;
      for (let i = hoveredCell.row; i < triangleRows && i - hoveredCell.row < 5; i++) {
        sum += combination(i, hoveredCell.col);
      }
      return { type: 'hockey', sum, formula: `C(${hoveredCell.row + 5},${hoveredCell.col + 1})` };
    } else if (showPattern === 'powers' && hoveredCell) {
      const rowSum = Math.pow(2, hoveredCell.row);
      return { type: 'powers', sum: rowSum, formula: `2^${hoveredCell.row}` };
    }
    return null;
  };

  const patternSum = calculatePatternSum();

  return (
    <div className="space-y-4">
      {/* Pattern Discovery Controls */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-semibold text-gray-300">Pattern Discovery</h5>
          <Button
            variant="neutral"
            size="xs"
            onClick={() => setShowHints(!showHints)}
          >
            {showHints ? 'Hide Hints' : 'Show Hints'}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Button
            variant={showPattern === 'symmetry' ? 'info' : 'neutral'}
            size="xs"
            onClick={() => setShowPattern(showPattern === 'symmetry' ? 'none' : 'symmetry')}
            className={cn(!discoveredPatterns.has('symmetry') && "opacity-50")}
          >
            {discoveredPatterns.has('symmetry') ? '✓ ' : ''}Symmetry
          </Button>
          <Button
            variant={showPattern === 'hockey' ? 'success' : 'neutral'}
            size="xs"
            onClick={() => {
              setShowPattern(showPattern === 'hockey' ? 'none' : 'hockey');
              checkPatternDiscovery('hockey');
            }}
            className={cn(!discoveredPatterns.has('hockey') && "opacity-50")}
          >
            {discoveredPatterns.has('hockey') ? '✓ ' : ''}Hockey Stick
          </Button>
          <Button
            variant={showPattern === 'powers' ? 'warning' : 'neutral'}
            size="xs"
            onClick={() => {
              setShowPattern(showPattern === 'powers' ? 'none' : 'powers');
              checkPatternDiscovery('powers');
            }}
            className={cn(!discoveredPatterns.has('powers') && "opacity-50")}
          >
            {discoveredPatterns.has('powers') ? '✓ ' : ''}Row Sums
          </Button>
          <Button
            variant={animateRecursive ? 'primary' : 'neutral'}
            size="xs"
            onClick={() => {
              setAnimateRecursive(!animateRecursive);
              if (!animateRecursive) checkPatternDiscovery('recursive');
            }}
            className={cn(!discoveredPatterns.has('recursive') && "opacity-50")}
          >
            {discoveredPatterns.has('recursive') ? '✓ ' : ''}Recursive
          </Button>
        </div>

        {/* Hints */}
        {showHints && (
          <div className="space-y-1 text-xs text-gray-400">
            {Object.entries(patterns).map(([key, pattern]) => (
              <div key={key} className={cn(
                "flex items-center gap-2",
                discoveredPatterns.has(key) && "text-gray-300"
              )}>
                <span className="w-3 h-3 rounded-full bg-gray-600" />
                <span>{pattern.hint}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Triangle Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Rows:</label>
          <RangeSlider
            value={triangleRows}
            onChange={setTriangleRows}
            min={5}
            max={15}
            step={1}
            className="w-32"
          />
          <span className="text-sm font-mono text-cyan-400 w-8">{triangleRows}</span>
        </div>
        <div className="text-xs text-gray-400">
          Click any value to update lottery selection
        </div>
      </div>

      {/* Triangle Visualization */}
      <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl p-4">
        <svg ref={triangleRef} className="w-full" style={{ height: Math.min(350, triangleRows * 35 + 50) }} />
      </div>

      {/* Pattern Information */}
      {patternSum && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-200">
              {patternSum.type === 'hockey' && (
                <p>
                  Hockey stick sum: The sum of the highlighted values equals{' '}
                  <span className="font-mono text-blue-400">{patternSum.sum}</span> ={' '}
                  <span className="font-mono">{patternSum.formula}</span>
                </p>
              )}
              {patternSum.type === 'powers' && (
                <p>
                  Row {hoveredCell.row} sums to{' '}
                  <span className="font-mono text-blue-400">{patternSum.sum}</span> ={' '}
                  <span className="font-mono">{patternSum.formula}</span>
                  {' '}(all possible subsets!)
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recursive Formula Display */}
      {animateRecursive && hoveredCell && hoveredCell.row > 0 && (
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
          <p className="text-sm text-purple-300 font-mono text-center">
            C({hoveredCell.row},{hoveredCell.col}) = 
            {hoveredCell.col > 0 && ` C(${hoveredCell.row - 1},${hoveredCell.col - 1}) +`}
            {hoveredCell.col < hoveredCell.row && ` C(${hoveredCell.row - 1},${hoveredCell.col})`}
            {hoveredCell.col === 0 || hoveredCell.col === hoveredCell.row ? ' 1' : ''}
          </p>
        </div>
      )}

      {/* Discovery Progress */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Patterns discovered: {discoveredPatterns.size}/4</span>
        {discoveredPatterns.size === 4 && (
          <span className="text-green-400 font-semibold">All patterns found!</span>
        )}
      </div>
    </div>
  );
});

// Comparison Visualization Component
const ComparisonVisualization = React.memo(function ComparisonVisualization({ n, r }) {
  const vizRef = useRef(null);

  useEffect(() => {
    if (!vizRef.current || n < r) return;

    const container = d3.select(vizRef.current);
    container.selectAll("*").remove();

    // Create sample items
    const items = Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));
    
    // Generate all r-permutations
    const permutations = [];
    const generatePermutations = (arr, size, current = []) => {
      if (current.length === size) {
        permutations.push([...current]);
        return;
      }
      for (let i = 0; i < arr.length; i++) {
        if (!current.includes(arr[i])) {
          current.push(arr[i]);
          generatePermutations(arr, size, current);
          current.pop();
        }
      }
    };
    
    if (r <= 4 && n <= 6) { // Limit for performance
      generatePermutations(items.slice(0, n), r);
    }

    // Group permutations by their sorted version (combinations)
    const combinationGroups = {};
    permutations.forEach(perm => {
      const key = [...perm].sort().join('');
      if (!combinationGroups[key]) {
        combinationGroups[key] = [];
      }
      combinationGroups[key].push(perm.join(''));
    });

    // Display
    const html = `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h5 class="font-semibold text-green-400 mb-2">Permutations (${permutations.length})</h5>
            <div class="flex flex-wrap gap-2 text-xs font-mono">
              ${permutations.slice(0, 20).map(p => 
                `<span class="bg-green-900/50 px-2 py-1 rounded">${p.join('')}</span>`
              ).join('')}
              ${permutations.length > 20 ? `<span class="text-gray-500">... and ${permutations.length - 20} more</span>` : ''}
            </div>
          </div>
          
          <div class="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
            <h5 class="font-semibold text-cyan-400 mb-2">Combinations (${Object.keys(combinationGroups).length})</h5>
            <div class="flex flex-wrap gap-2 text-xs font-mono">
              ${Object.keys(combinationGroups).slice(0, 20).map(c => 
                `<span class="bg-cyan-900/50 px-2 py-1 rounded">{${c.split('').join(',')}}</span>`
              ).join('')}
              ${Object.keys(combinationGroups).length > 20 ? 
                `<span class="text-gray-500">... and ${Object.keys(combinationGroups).length - 20} more</span>` : ''}
            </div>
          </div>
        </div>
        
        ${Object.keys(combinationGroups).length <= 6 ? `
          <div class="bg-gray-800/50 rounded-lg p-4">
            <h5 class="text-sm font-semibold text-gray-300 mb-3">Grouping by Combination</h5>
            <div class="space-y-2">
              ${Object.entries(combinationGroups).map(([combo, perms]) => `
                <div class="flex items-center gap-3">
                  <span class="text-cyan-400 font-mono">{${combo.split('').join(',')}}</span>
                  <ChevronRight class="w-4 h-4 text-gray-500" />
                  <div class="flex flex-wrap gap-1">
                    ${perms.map(p => 
                      `<span class="text-xs font-mono bg-gray-700 px-1.5 py-0.5 rounded">${p}</span>`
                    ).join('')}
                  </div>
                  <span class="text-xs text-gray-500">(${perms.length} arrangements)</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    container.html(html);

  }, [n, r]);

  return <div ref={vizRef} />;
});

// Example Card Component
const ExampleCard = React.memo(function ExampleCard({ title, icon, calculation, description, color }) {
  const bgColor = {
    purple: 'bg-purple-900/20 border-purple-500/30',
    orange: 'bg-orange-900/20 border-orange-500/30',
    green: 'bg-green-900/20 border-green-500/30',
    blue: 'bg-blue-900/20 border-blue-500/30'
  }[color];

  const textColor = {
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    green: 'text-green-400',
    blue: 'text-blue-400'
  }[color];

  const iconColor = {
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    green: 'text-green-500',
    blue: 'text-blue-500'
  }[color];

  return (
    <div className={cn("border rounded-lg p-3", bgColor)}>
      <div className="flex items-start gap-3">
        <div className={cn("text-2xl font-bold", iconColor)}>{icon}</div>
        <div className="flex-1">
          <h5 className={cn("font-semibold text-sm mb-1", textColor)}>{title}</h5>
          <p className="text-xs text-gray-400 mb-2">{description}</p>
          <p className="font-mono text-xs text-gray-300">{calculation}</p>
        </div>
      </div>
    </div>
  );
});

// Interactive Formula Derivation Component
const FormulaDerivation = React.memo(function FormulaDerivation({ n, r }) {
  const [step, setStep] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const maxSteps = 5;

  const factorial = (num) => {
    if (num <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= num; i++) {
      result *= i;
    }
    return result;
  };

  const permutationValue = n >= r ? factorial(n) / factorial(n - r) : 0;
  const combinationValue = combination(n, r);

  const handleNext = () => {
    if (step < maxSteps - 1) {
      setStep(step + 1);
      if (step === 2) setShowAnimation(true);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const FormulaStep = React.memo(({ children, visible, highlight }) => (
    <div className={cn(
      "transition-all duration-500",
      visible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4",
      highlight && "bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mt-2"
    )}>
      {children}
    </div>
  ));

  return (
    <div className="p-4 space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-semibold text-gray-300">Derivation Steps</h5>
        <div className="flex items-center gap-2">
          {Array.from({ length: maxSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                i <= step ? "bg-cyan-400" : "bg-gray-600"
              )}
            />
          ))}
        </div>
      </div>

      {/* Step 0: The Problem */}
      <FormulaStep visible={step >= 0}>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h6 className="text-sm font-semibold text-cyan-400 mb-3">The Problem</h6>
          <p className="text-sm text-gray-300 mb-3">
            We want to count the number of ways to choose {r} items from {n} items where <strong>order doesn't matter</strong>.
          </p>
          <div className="bg-gray-900/50 rounded p-3 font-mono text-sm">
            <div className="text-cyan-400">Example: Choosing {r} from [{Array.from({length: Math.min(n, 6)}, (_, i) => i + 1).join(', ')}{n > 6 && ', ...'}]</div>
            <div className="text-gray-400 mt-1">
              {r === 3 && n >= 5 && "Sets like {1,2,3} and {3,2,1} are the same"}
              {r !== 3 && "Order of selection doesn't matter"}
            </div>
          </div>
        </div>
      </FormulaStep>

      {/* Step 1: Start with Permutations */}
      <FormulaStep visible={step >= 1}>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h6 className="text-sm font-semibold text-green-400 mb-3">Step 1: Count Ordered Arrangements (Permutations)</h6>
          <p className="text-sm text-gray-300 mb-3">
            First, let's count arrangements where order <strong>does matter</strong>:
          </p>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span className="text-green-400">P({n},{r})</span>
              <span className="text-gray-500"> = </span>
              <span className="text-gray-300">{n} × {n-1} × ... × {n-r+1}</span>
            </div>
            <div className="ml-8">
              <span className="text-gray-500">= </span>
              <span className="text-gray-300">{n}! / {n-r}!</span>
            </div>
            <div className="ml-8">
              <span className="text-gray-500">= </span>
              <span className="text-lg text-green-400 font-bold">{formatNumber(permutationValue)}</span>
            </div>
          </div>
        </div>
      </FormulaStep>

      {/* Step 2: Group by Combination */}
      <FormulaStep visible={step >= 2} highlight={step === 2}>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h6 className="text-sm font-semibold text-purple-400 mb-3">Step 2: Each Combination Appears r! Times</h6>
          <p className="text-sm text-gray-300 mb-3">
            Each unique combination of {r} items can be arranged in {r}! = {factorial(r)} different orders:
          </p>
          
          {/* Visual example for small r */}
          {r <= 4 && n >= r && (
            <PermutationGrouping n={Math.min(n, 6)} r={r} animate={showAnimation} />
          )}
          
          <div className="mt-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded">
            <p className="text-sm text-purple-300">
              Key insight: Each combination is counted {r}! times in the permutation count!
            </p>
          </div>
        </div>
      </FormulaStep>

      {/* Step 3: Derive the Formula */}
      <FormulaStep visible={step >= 3}>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h6 className="text-sm font-semibold text-cyan-400 mb-3">Step 3: Derive the Combination Formula</h6>
          <p className="text-sm text-gray-300 mb-3">
            Since each combination appears {r}! times in our permutation count:
          </p>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">C({n},{r})</span>
              <span className="text-gray-500"> = </span>
              <span className="text-gray-300">P({n},{r}) / {r}!</span>
            </div>
            <div className="flex items-center gap-2 ml-8">
              <span className="text-gray-500">= </span>
              <span className="text-gray-300">{n}! / ({n-r}! × {r}!)</span>
            </div>
            <div className="flex items-center gap-2 ml-8">
              <span className="text-gray-500">= </span>
              <span className="text-gray-300">{formatNumber(permutationValue)} / {factorial(r)}</span>
            </div>
            <div className="flex items-center gap-2 ml-8">
              <span className="text-gray-500">= </span>
              <span className="text-lg text-cyan-400 font-bold">{formatNumber(combinationValue)}</span>
            </div>
          </div>
        </div>
      </FormulaStep>

      {/* Step 4: Verify and Apply */}
      <FormulaStep visible={step >= 4}>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h6 className="text-sm font-semibold text-yellow-400 mb-3">Step 4: Verification & Properties</h6>
          <div className="space-y-3">
            <div className="p-3 bg-gray-900/50 rounded">
              <p className="text-sm font-semibold text-gray-300 mb-2">Symmetry Property:</p>
              <p className="font-mono text-sm">
                <span className="text-yellow-400">C({n},{r})</span> = 
                <span className="text-yellow-400"> C({n},{n-r})</span> = 
                <span className="text-gray-300"> {combinationValue}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Choosing {r} items to include = Choosing {n-r} items to exclude
              </p>
            </div>
            
            <div className="p-3 bg-gray-900/50 rounded">
              <p className="text-sm font-semibold text-gray-300 mb-2">Pascal's Triangle:</p>
              <p className="font-mono text-sm">
                <span className="text-yellow-400">C({n},{r})</span> = 
                <span className="text-gray-300"> C({n-1},{r-1}) + C({n-1},{r})</span>
              </p>
              {n > 1 && r > 0 && r < n && (
                <p className="font-mono text-xs text-gray-400 mt-1">
                  {combinationValue} = {combination(n-1, r-1)} + {combination(n-1, r)}
                </p>
              )}
            </div>
          </div>
        </div>
      </FormulaStep>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="neutral"
          size="sm"
          onClick={handlePrevious}
          disabled={step === 0}
        >
          Previous Step
        </Button>
        <span className="text-sm text-gray-400">Step {step + 1} of {maxSteps}</span>
        <Button
          variant="primary"
          size="sm"
          onClick={handleNext}
          disabled={step === maxSteps - 1}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
});

// Visual Permutation Grouping Component
const PermutationGrouping = React.memo(function PermutationGrouping({ n, r, animate }) {
  const [collapsed, setCollapsed] = useState(false);
  
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setCollapsed(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  // Generate a sample combination
  const items = Array.from({ length: n }, (_, i) => i + 1);
  const sampleCombination = items.slice(0, r);
  
  // Generate all permutations of the sample
  const generatePermutations = (arr) => {
    if (arr.length <= 1) return [arr];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = arr.filter((_, idx) => idx !== i);
      const perms = generatePermutations(remaining);
      for (const perm of perms) {
        result.push([current, ...perm]);
      }
    }
    return result;
  };
  
  const permutations = generatePermutations(sampleCombination);

  return (
    <div className="bg-gray-900/50 rounded-lg p-4">
      <p className="text-xs text-gray-400 mb-3">
        Example: The combination {'{' + sampleCombination.join(',') + '}'} appears in {r}! = {permutations.length} different orders:
      </p>
      <div className={cn(
        "grid gap-2 transition-all duration-1000",
        collapsed ? "grid-cols-1" : r <= 3 ? "grid-cols-3" : "grid-cols-2"
      )}>
        {collapsed ? (
          <div className="relative">
            <div className="bg-cyan-900/30 border border-cyan-500/50 rounded p-3 text-center">
              <span className="font-mono text-cyan-400">
                {'{' + sampleCombination.join(',') + '}'}
              </span>
              <div className="text-xs text-gray-400 mt-1">1 combination</div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                ÷{r}!
              </div>
            </div>
          </div>
        ) : (
          permutations.map((perm, idx) => (
            <div 
              key={idx} 
              className="bg-green-900/30 border border-green-500/50 rounded p-2 text-center transition-all duration-500"
              style={{ 
                animationDelay: `${idx * 100}ms`,
                animation: animate ? 'fadeIn 0.5s ease-out' : 'none'
              }}
            >
              <span className="font-mono text-green-400 text-sm">
                ({perm.join(',')})
              </span>
            </div>
          ))
        )}
      </div>
      {!collapsed && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          All these arrangements represent the same combination when order doesn't matter
        </p>
      )}
    </div>
  );
});

// Interactive Combination Builder Component
const CombinationBuilder = React.memo(function CombinationBuilder({ n, r }) {
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [itemType, setItemType] = useState('numbers');
  const [showComparison, setShowComparison] = useState(false);

  // Initialize items based on type
  useEffect(() => {
    let items = [];
    switch (itemType) {
      case 'letters':
        items = Array.from({ length: Math.min(n, 26) }, (_, i) => String.fromCharCode(65 + i));
        break;
      case 'colors':
        const colors = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🩷', '🩵', '🟩'];
        items = colors.slice(0, Math.min(n, colors.length));
        break;
      case 'shapes':
        const shapes = ['■', '●', '▲', '◆', '★', '♦', '♠', '♣', '♥', '◉', '◈', '◊'];
        items = shapes.slice(0, Math.min(n, shapes.length));
        break;
      default:
        items = Array.from({ length: n }, (_, i) => i + 1);
    }
    setAvailableItems(items);
    setSelectedItems([]);
  }, [n, itemType]);

  const handleDragStart = (e, item, fromSelected) => {
    setDraggedItem({ item, fromSelected });
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e, toSelected) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { item, fromSelected } = draggedItem;

    if (fromSelected && !toSelected) {
      // Moving from selected to available
      setSelectedItems(prev => prev.filter(i => i !== item));
    } else if (!fromSelected && toSelected && selectedItems.length < r) {
      // Moving from available to selected
      setSelectedItems(prev => [...prev, item]);
    }

    setDraggedItem(null);
  };

  const handleItemClick = (item, isSelected) => {
    if (isSelected) {
      setSelectedItems(prev => prev.filter(i => i !== item));
    } else if (selectedItems.length < r) {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const resetBuilder = () => {
    setSelectedItems([]);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-300">Item type:</label>
          <select 
            value={itemType} 
            onChange={(e) => setItemType(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm"
          >
            <option value="numbers">Numbers</option>
            <option value="letters">Letters</option>
            <option value="colors">Colors</option>
            <option value="shapes">Shapes</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input 
              type="checkbox" 
              checked={showComparison} 
              onChange={(e) => setShowComparison(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-gray-300">Compare with permutations</span>
          </label>
          <Button
            variant="neutral"
            size="sm"
            onClick={resetBuilder}
            disabled={selectedItems.length === 0}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Builder Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Items */}
        <div>
          <h6 className="text-sm font-semibold text-gray-300 mb-3">
            Available Items ({availableItems.length})
          </h6>
          <div 
            className="bg-gray-800/50 rounded-lg p-4 min-h-[200px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, false)}
          >
            <div className="grid grid-cols-6 gap-2">
              {availableItems.map((item) => {
                const isSelected = selectedItems.includes(item);
                return (
                  <div
                    key={item}
                    draggable={!isSelected}
                    onDragStart={(e) => handleDragStart(e, item, false)}
                    onTouchStart={() => setDraggedItem({ item, fromSelected: false })}
                    onTouchEnd={() => handleItemClick(item, false)}
                    onClick={() => handleItemClick(item, false)}
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200",
                      "hover:scale-105 hover:shadow-lg select-none touch-manipulation",
                      isSelected 
                        ? "bg-gray-700/50 opacity-30 cursor-not-allowed" 
                        : "bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600"
                    )}
                    style={{ 
                      opacity: isSelected ? 0.3 : 1,
                      pointerEvents: isSelected ? 'none' : 'auto'
                    }}
                  >
                    <span className={cn(
                      "font-bold",
                      itemType === 'numbers' ? "font-mono" : "",
                      itemType === 'colors' || itemType === 'shapes' ? "text-2xl" : "text-lg"
                    )}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Items */}
        <div>
          <h6 className="text-sm font-semibold text-gray-300 mb-3">
            Selected Combination ({selectedItems.length}/{r})
          </h6>
          <div 
            className="bg-cyan-900/20 border-2 border-dashed border-cyan-500/50 rounded-lg p-4 min-h-[200px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, true)}
          >
            {selectedItems.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[150px]">
                <p className="text-gray-500 text-sm">Drag items here or click to select</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((item) => (
                    <div
                      key={item}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item, true)}
                      onClick={() => handleItemClick(item, true)}
                      className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-all
                               bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500
                               hover:scale-105 select-none"
                    >
                      <span className={cn(
                        "font-bold text-white",
                        itemType === 'numbers' ? "font-mono" : "",
                        itemType === 'colors' || itemType === 'shapes' ? "text-2xl" : "text-lg"
                      )}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Combination notation */}
                <div className="bg-gray-800/50 rounded p-3 font-mono text-center">
                  <span className="text-cyan-400">
                    {'{' + selectedItems.sort((a, b) => {
                      if (typeof a === 'number') return a - b;
                      return a.localeCompare(b);
                    }).join(', ') + '}'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Progress */}
          {selectedItems.length > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(selectedItems.length / r) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {selectedItems.length === r 
                  ? `Complete! This is 1 of ${combination(n, r)} possible combinations.`
                  : `Select ${r - selectedItems.length} more item${r - selectedItems.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Comparison with Permutations */}
      {showComparison && selectedItems.length === r && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h6 className="text-sm font-semibold text-gray-300 mb-3">
            Permutations vs Combinations
          </h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded p-3">
              <p className="text-sm font-semibold text-green-400 mb-2">Permutations (order matters)</p>
              <p className="font-mono text-xs text-gray-300">
                P({n},{r}) = {formatNumber(factorial(n) / factorial(n - r))} arrangements
              </p>
              {r <= 3 && (
                <div className="mt-2 space-y-1">
                  {generatePermutations(selectedItems).slice(0, 6).map((perm, idx) => (
                    <div key={idx} className="text-xs font-mono text-green-400">
                      ({perm.join(', ')})
                    </div>
                  ))}
                  {factorial(r) > 6 && (
                    <div className="text-xs text-gray-500">... and {factorial(r) - 6} more</div>
                  )}
                </div>
              )}
            </div>
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded p-3">
              <p className="text-sm font-semibold text-cyan-400 mb-2">Combinations (order doesn't matter)</p>
              <p className="font-mono text-xs text-gray-300">
                C({n},{r}) = {formatNumber(combination(n, r))} selections
              </p>
              <div className="mt-2 font-mono text-sm text-cyan-400">
                {'{' + selectedItems.sort((a, b) => {
                  if (typeof a === 'number') return a - b;
                  return a.localeCompare(b);
                }).join(', ') + '}'}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                All {factorial(r)} arrangements count as 1 combination
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Real World Applications Component
const RealWorldApplications = React.memo(function RealWorldApplications({ n, r, onSelect }) {
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const applications = [
    {
      id: 'lottery',
      title: 'Lottery (6/49)',
      icon: '🎰',
      n: 49,
      r: 6,
      description: 'Choose 6 numbers from 49',
      details: 'In a typical 6/49 lottery, players select 6 numbers from 1 to 49. The order of selection doesn\'t matter - {1,2,3,4,5,6} is the same as {6,5,4,3,2,1}.',
      calculation: 'C(49,6) = 13,983,816',
      probability: '1 in 13,983,816',
      color: 'purple'
    },
    {
      id: 'team',
      title: 'Team Selection',
      icon: '⚽',
      n: 20,
      r: 11,
      description: 'Pick 11 players from 20',
      details: 'A soccer coach needs to select 11 starting players from a squad of 20. The order of selection doesn\'t determine positions.',
      calculation: 'C(20,11) = 167,960',
      variations: '167,960 possible teams',
      color: 'orange'
    },
    {
      id: 'menu',
      title: 'Restaurant Menu',
      icon: '🍽️',
      n: 12,
      r: 3,
      description: 'Choose 3 dishes from 12',
      details: 'A prix fixe menu allows customers to choose any 3 dishes from 12 options. The order of selection doesn\'t affect the meal.',
      calculation: 'C(12,3) = 220',
      variations: '220 possible meals',
      color: 'green'
    },
    {
      id: 'committee',
      title: 'Committee Formation',
      icon: '👥',
      n: 15,
      r: 5,
      description: 'Select 5 members from 15',
      details: 'Forming a committee of 5 people from 15 candidates. All committee members have equal status regardless of selection order.',
      calculation: 'C(15,5) = 3,003',
      variations: '3,003 possible committees',
      color: 'blue'
    },
    {
      id: 'pizza',
      title: 'Pizza Toppings',
      icon: '🍕',
      n: 10,
      r: 4,
      description: 'Pick 4 toppings from 10',
      details: 'A pizza shop offers 10 toppings and you can choose any 4. The order you pick them doesn\'t change the final pizza.',
      calculation: 'C(10,4) = 210',
      variations: '210 unique pizzas',
      color: 'red'
    },
    {
      id: 'cards',
      title: 'Card Hand',
      icon: '🃏',
      n: 52,
      r: 5,
      description: 'Deal 5 cards from 52',
      details: 'In poker, each player receives 5 cards from a standard 52-card deck. The order of dealing doesn\'t affect the hand.',
      calculation: 'C(52,5) = 2,598,960',
      variations: '2,598,960 possible hands',
      color: 'indigo'
    }
  ];

  const handleApplicationClick = (app) => {
    setSelectedApp(app);
    setShowDetails(true);
    if (onSelect) {
      onSelect(app.n, app.r);
    }
  };

  const colorClasses = {
    purple: 'bg-purple-900/20 border-purple-500/30 hover:bg-purple-900/30',
    orange: 'bg-orange-900/20 border-orange-500/30 hover:bg-orange-900/30',
    green: 'bg-green-900/20 border-green-500/30 hover:bg-green-900/30',
    blue: 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/30',
    red: 'bg-red-900/20 border-red-500/30 hover:bg-red-900/30',
    indigo: 'bg-indigo-900/20 border-indigo-500/30 hover:bg-indigo-900/30'
  };

  return (
    <div className="p-4 space-y-4">
      {/* Application Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {applications.map((app) => (
          <button
            key={app.id}
            onClick={() => handleApplicationClick(app)}
            className={cn(
              "border rounded-lg p-4 text-left transition-all duration-200",
              "hover:scale-105 hover:shadow-lg",
              colorClasses[app.color],
              selectedApp?.id === app.id && "ring-2 ring-offset-2 ring-offset-gray-900"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{app.icon}</div>
              <div className="flex-1">
                <h5 className="font-semibold text-sm mb-1">{app.title}</h5>
                <p className="text-xs text-gray-400 mb-2">{app.description}</p>
                <p className="font-mono text-xs text-gray-300">{app.calculation}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Application Details */}
      {showDetails && selectedApp && (
        <div className="bg-gray-800/50 rounded-lg p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">{selectedApp.icon}</div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">{selectedApp.title}</h4>
              <p className="text-sm text-gray-300 mb-3">{selectedApp.details}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">Formula</p>
                  <p className="font-mono text-sm text-cyan-400">
                    C({selectedApp.n},{selectedApp.r})
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">Calculation</p>
                  <p className="font-mono text-sm text-green-400">
                    {formatNumber(combination(selectedApp.n, selectedApp.r))}
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">Result</p>
                  <p className="text-sm text-yellow-400">
                    {selectedApp.variations || selectedApp.probability}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSelect(selectedApp.n, selectedApp.r)}
                >
                  Try This Example
                </Button>
                <p className="text-xs text-gray-400">
                  Updates the main visualization to n={selectedApp.n}, r={selectedApp.r}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Educational Insight */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <InfoIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-200">
            <p className="font-semibold mb-1">Why Combinations?</p>
            <p>
              All these real-world scenarios share a common feature: we're selecting a subset of items where 
              the order of selection doesn't matter. Whether picking lottery numbers, choosing team members, 
              or selecting pizza toppings, what matters is <em>which</em> items are chosen, not <em>when</em> they're chosen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

// Helper function for generating permutations
function generatePermutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = arr.filter((_, idx) => idx !== i);
    const perms = generatePermutations(remaining);
    for (const perm of perms) {
      result.push([current, ...perm]);
    }
  }
  return result;
}

// Helper function for combinations
function combination(n, r) {
  if (r > n) return 0;
  if (r === 0 || r === n) return 1;
  
  // Use the more efficient formula C(n,r) = n! / (r!(n-r)!)
  // But calculate it as n * (n-1) * ... * (n-r+1) / r!
  let numerator = 1;
  let denominator = 1;
  
  for (let i = 0; i < r; i++) {
    numerator *= (n - i);
    denominator *= (i + 1);
  }
  
  return numerator / denominator;
}