"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import * as d3 from "d3";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';

// Use probability color scheme
const colorScheme = createColorScheme('probability');

// Learning challenges - defined outside component
const challenges = [
  {
    id: 1,
    title: "First Combination",
    description: "Create a combination where C(n,r) = 10",
    hint: "Try C(5,2) or C(10,1)",
    check: (n, r, nCr) => nCr(n, r) === 10
  },
  {
    id: 2,
    title: "Find Symmetry",
    description: "Set n and r where C(n,r) = C(n,n-r) and both equal 20",
    hint: "Try n=6, r=3",
    check: (n, r, nCr) => n !== r && nCr(n, r) === 20 && nCr(n, n-r) === 20
  },
  {
    id: 3,
    title: "Pascal's Pattern",
    description: "Find where C(n,r) = 35",
    hint: "Look at Pascal's triangle row 7",
    check: (n, r, nCr) => nCr(n, r) === 35
  },
  {
    id: 4,
    title: "Equal Results",
    description: "Find two different (n,r) pairs that both give 15",
    hint: "One is C(6,2), find another",
    check: (n, r, nCr) => nCr(n, r) === 15
  }
];

// Pascal's Triangle Component
const PascalsTriangle = memo(function PascalsTriangle({ rows = 8, highlightN = -1, highlightR = -1 }) {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = 400;
    const height = 300;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${width/2}, 20)`);
    
    // Generate Pascal's triangle values with overflow protection
    const triangle = [];
    const MAX_SAFE_VALUE = Number.MAX_SAFE_INTEGER;
    
    for (let n = 0; n < rows; n++) {
      triangle[n] = [];
      for (let r = 0; r <= n; r++) {
        if (r === 0 || r === n) {
          triangle[n][r] = 1;
        } else {
          const sum = triangle[n-1][r-1] + triangle[n-1][r];
          // Check for overflow
          if (sum > MAX_SAFE_VALUE) {
            triangle[n][r] = "∞"; // Display infinity symbol for overflow
          } else {
            triangle[n][r] = sum;
          }
        }
      }
    }
    
    // Draw triangle
    const cellSize = 35;
    const verticalSpacing = 30;
    
    triangle.forEach((row, n) => {
      row.forEach((value, r) => {
        const x = (r - n/2) * cellSize;
        const y = n * verticalSpacing;
        
        const isHighlighted = n === highlightN && r === highlightR;
        
        // Cell background
        g.append("rect")
          .attr("x", x - cellSize/2 + 2)
          .attr("y", y - 12)
          .attr("width", cellSize - 4)
          .attr("height", 24)
          .attr("fill", isHighlighted ? colorScheme.chart.secondary : "#1a1a1a")
          .attr("stroke", isHighlighted ? colorScheme.chart.secondary : colors.chart.grid)
          .attr("stroke-width", isHighlighted ? 2 : 1)
          .attr("rx", 4);
        
        // Value
        g.append("text")
          .attr("x", x)
          .attr("y", y)
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", isHighlighted ? "#0a0a0a" : colors.chart.text)
          .style("font-size", "12px")
          .style("font-weight", isHighlighted ? "600" : "400")
          .text(value);
      });
    });
    
    // Row labels
    for (let n = 0; n < Math.min(rows, 5); n++) {
      g.append("text")
        .attr("x", -(n/2 + 0.8) * cellSize)
        .attr("y", n * verticalSpacing)
        .attr("text-anchor", "end")
        .attr("dy", "0.35em")
        .attr("fill", colors.chart.text)
        .style("font-size", "11px")
        .style("opacity", 0.7)
        .text(`n=${n}`);
    }
    
  }, [rows, highlightN, highlightR]);
  
  return <svg ref={svgRef} style={{ width: "100%", maxWidth: "400px", height: "300px" }} />;
});

function UnorderedSamples() {
  const [n, setN] = useState(6);
  const [r, setR] = useState(3);
  const [showPascal, setShowPascal] = useState(true);
  const [visualMode, setVisualMode] = useState('selection'); // 'selection', 'identity', 'permutations'
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(new Set());
  const [showPermutations, setShowPermutations] = useState(false);
  const [animateReordering, setAnimateReordering] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  const svgRef = useRef(null);
  
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
  
  // Calculate nPr (permutations)
  function nPr(n, r) {
    if (r > n || r < 0) return 0;
    let result = 1;
    for (let i = 0; i < r; i++) {
      result *= (n - i);
    }
    return result;
  }

  // Generate all permutations of selected items
  function getPermutations(items) {
    if (items.length === 0) return [[]];
    if (items.length === 1) return [[items[0]]];
    
    const result = [];
    for (let i = 0; i < items.length; i++) {
      const current = items[i];
      const remaining = items.slice(0, i).concat(items.slice(i + 1));
      const perms = getPermutations(remaining);
      for (const perm of perms) {
        result.push([current, ...perm]);
      }
    }
    return result;
  }

  // Main visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 500; // Increased to accommodate bottom text area
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${width/2}, ${height/2})`);
    
    if (visualMode === 'selection') {
      // Draw items in a circle - use much more space
      const radius = Math.min(width, height) * 0.42; // Increased from 0.35
      const itemRadius = Math.min(40, radius / n * 2); // Increased from 30 and 1.5
      const items = Array.from({length: n}, (_, i) => i + 1);
      
      items.forEach((item, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const isSelected = selectedItems.has(item);
        
        const group = g.append("g")
          .attr("transform", `translate(${x}, ${y})`);
        
        group.append("circle")
          .attr("r", itemRadius)
          .attr("fill", isSelected ? colorScheme.chart.primary : "#1a1a1a")
          .attr("stroke", isSelected ? colorScheme.chart.primary : colors.chart.grid)
          .attr("stroke-width", 2)
          .attr("cursor", "pointer")
          .on("click", () => {
            const newSelected = new Set(selectedItems);
            if (newSelected.has(item)) {
              newSelected.delete(item);
            } else if (newSelected.size < r) {
              newSelected.add(item);
            }
            setSelectedItems(newSelected);
          });
        
        group.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", isSelected ? "white" : colors.chart.text)
          .style("font-size", "18px") // Slightly larger for better visibility
          .style("font-weight", "600")
          .style("font-family", "monospace") // Numbers should be monospace
          .style("pointer-events", "none")
          .text(item);
      });
      
      // Center text
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-1em")
        .attr("fill", colors.chart.text)
        .style("font-size", "16px") // Reduced from 18px per typography system
        .style("font-weight", "600")
        .text(`Select ${r} items`);
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1em")
        .attr("fill", colorScheme.chart.secondary)
        .style("font-size", "14px") // Reduced from 16px
        .style("font-family", "monospace") // Numbers should be monospace
        .text(`${selectedItems.size} / ${r} selected`);
      
      // Show selected combination at bottom
      if (selectedItems.size === r) {
        const selectedArray = Array.from(selectedItems).sort((a, b) => a - b);
        
        // Create a separate area below the circle for combination display
        const bottomArea = svg.append("g")
          .attr("transform", `translate(${width/2}, ${height - 80})`);
        
        bottomArea.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0")
          .attr("fill", colorScheme.chart.primary)
          .style("font-size", "18px") // Reduced from 20px
          .style("font-weight", "600")
          .style("font-family", "monospace") // Set notation with monospace
          .text(`{${selectedArray.join(', ')}}`);
          
        // Show that order doesn't matter
        if (animateReordering && r >= 2) {
          const permutations = getPermutations(selectedArray);
          const sampledPerms = permutations.slice(0, Math.min(4, permutations.length));
          
          sampledPerms.forEach((perm, i) => {
            bottomArea.append("text")
              .attr("text-anchor", "middle")
              .attr("y", 25 + i * 18)
              .attr("fill", colors.chart.text)
              .style("font-size", "14px")
              .style("opacity", 0)
              .text(`{${perm.join(', ')}}`)
              .transition()
              .delay(i * 200)
              .duration(500)
              .style("opacity", 0.6);
          });
          
          // Equal sign
          bottomArea.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 25 + sampledPerms.length * 18)
            .attr("fill", colorScheme.chart.secondary)
            .style("font-size", "14px")
            .style("font-weight", "600")
            .style("opacity", 0)
            .text("= 1 combination!")
            .transition()
            .delay(sampledPerms.length * 200)
            .duration(500)
            .style("opacity", 1);
        }
      }
      
    } else if (visualMode === 'permutations') {
      // Show how permutations collapse into combinations
      const selectedArray = Array.from(selectedItems).sort((a, b) => a - b);
      
      if (selectedArray.length === r && r <= 4) {
        const permutations = getPermutations(selectedArray);
        const cellSize = 60;
        const cols = Math.ceil(Math.sqrt(permutations.length));
        const rows = Math.ceil(permutations.length / cols);
        
        // Title
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("y", -height/2 + 30)
          .attr("fill", colors.chart.text)
          .style("font-size", "18px")
          .style("font-weight", "600")
          .text(`${permutations.length} permutations → 1 combination`);
        
        // Draw all permutations
        permutations.forEach((perm, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const x = (col - cols/2 + 0.5) * cellSize;
          const y = (row - rows/2 + 0.5) * cellSize + 20;
          
          // Box
          g.append("rect")
            .attr("x", x - cellSize/2 + 5)
            .attr("y", y - 15)
            .attr("width", cellSize - 10)
            .attr("height", 30)
            .attr("fill", "#1a1a1a")
            .attr("stroke", colorScheme.chart.primary)
            .attr("stroke-width", 1)
            .attr("rx", 4)
            .style("opacity", 0)
            .transition()
            .delay(i * 50)
            .duration(300)
            .style("opacity", 1);
          
          // Permutation text
          g.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", colors.chart.text)
            .style("font-size", "12px")
            .style("font-family", "monospace")
            .style("opacity", 0)
            .text(perm.join(','))
            .transition()
            .delay(i * 50)
            .duration(300)
            .style("opacity", 1);
        });
        
        // Arrow and result
        const arrowY = (rows/2 + 1) * cellSize;
        g.append("path")
          .attr("d", `M -30,${arrowY} L 0,${arrowY + 20} L 30,${arrowY}`)
          .attr("fill", "none")
          .attr("stroke", colorScheme.chart.secondary)
          .attr("stroke-width", 2)
          .style("opacity", 0)
          .transition()
          .delay(permutations.length * 50 + 300)
          .duration(500)
          .style("opacity", 1);
        
        // Final combination
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("y", arrowY + 50)
          .attr("fill", colorScheme.chart.primary)
          .style("font-size", "18px") // Reduced from 24px
          .style("font-weight", "600")
          .style("font-family", "monospace") // Set notation in monospace
          .style("opacity", 0)
          .text(`{${selectedArray.join(', ')}}`)
          .transition()
          .delay(permutations.length * 50 + 800)
          .duration(500)
          .style("opacity", 1);
          
      } else {
        // Prompt to select items
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("fill", colors.chart.text)
          .style("font-size", "18px")
          .text(selectedArray.length === r ? 
            "Too many permutations to display!" : 
            `Select exactly ${r} items to see permutations`);
      }
      
    } else {
      // Show binomial coefficient identity
      const fontSize = 18; // Reduced from 24 per typography system
      const spacing = 40;
      
      // C(n,r) = C(n,n-r)
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -spacing)
        .attr("fill", colors.chart.text)
        .style("font-size", "18px") // Consistent with typography system
        .style("font-weight", "600")
        .style("font-family", "monospace") // Math notation in monospace
        .text(`C(${n},${r}) = C(${n},${n-r})`);
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 0)
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "18px")
        .style("font-family", "monospace") // Numbers in monospace
        .text(`${nCr(n, r)} = ${nCr(n, n-r)}`);
      
      // Visual explanation
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", spacing * 1.5)
        .attr("fill", colors.chart.text)
        .style("font-size", "14px")
        .text(`Choosing ${r} items to include`);
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", spacing * 2)
        .attr("fill", colors.chart.text)
        .style("font-size", "14px")
        .text(`= Choosing ${n-r} items to exclude`);
    }
    
  }, [n, r, visualMode, selectedItems, animateReordering]);
  
  // Generate all combinations
  function getAllCombinations() {
    const result = [];
    const items = Array.from({length: n}, (_, i) => i + 1);
    
    function generateCombinations(start, current) {
      if (current.length === r) {
        result.push([...current]);
        return;
      }
      
      for (let i = start; i < items.length; i++) {
        current.push(items[i]);
        generateCombinations(i + 1, current);
        current.pop();
      }
    }
    
    generateCombinations(0, []);
    return result;
  }

  return (
    <VisualizationContainer title="Unordered Samples (Combinations)" className="p-2">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              When order doesn&apos;t matter, we count combinations. The binomial 
              coefficient <span dangerouslySetInnerHTML={{ __html: `\\(C(n,r)\\)` }} /> or <span dangerouslySetInnerHTML={{ __html: `\\(\\binom{n}{r}\\)` }} /> counts the number of ways to 
              choose r items from n distinct items.
            </p>
          </VisualizationSection>

          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Parameters</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-neutral-300">Total items (n)</label>
                  <span className="text-sm font-mono text-yellow-400">{n}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={n}
                  onChange={(e) => {
                    const newN = Number(e.target.value);
                    setN(newN);
                    setR(Math.min(r, newN));
                    setSelectedItems(new Set());
                  }}
                  className="w-full"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-neutral-300">Items to choose (r)</label>
                  <span className="text-sm font-mono text-purple-400">{r}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={n}
                  value={r}
                  onChange={(e) => {
                    setR(Number(e.target.value));
                    setSelectedItems(new Set());
                  }}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Visual mode toggle */}
            <div className="mt-4">
              <label className="text-sm text-neutral-300 mb-2 block">Visualization Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setVisualMode('selection');
                  }}
                  className={cn(
                    "flex-1 px-3 py-2 rounded text-xs font-medium transition-colors",
                    visualMode === 'selection'
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  Selection
                </button>
                <button
                  onClick={() => {
                    setVisualMode('permutations');
                  }}
                  className={cn(
                    "flex-1 px-3 py-2 rounded text-xs font-medium transition-colors",
                    visualMode === 'permutations'
                      ? "bg-purple-600 text-white"
                      : "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  Permutations
                </button>
                <button
                  onClick={() => {
                    setVisualMode('identity');
                  }}
                  className={cn(
                    "flex-1 px-3 py-2 rounded text-xs font-medium transition-colors",
                    visualMode === 'identity'
                      ? "bg-green-600 text-white"
                      : "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  Identity
                </button>
              </div>
            </div>
            
            {visualMode === 'selection' && (
              <div className="mt-3">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={animateReordering} 
                    onChange={e => setAnimateReordering(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-neutral-300">Show order doesn't matter</span>
                </label>
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-3">
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={showPascal} 
                  onChange={e => setShowPascal(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-neutral-300">Show Pascal&apos;s Triangle</span>
              </label>
            </div>
          </VisualizationSection>

          {/* Calculation */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Calculation</h4>
            
            <div className="bg-neutral-800 rounded-lg p-3 border border-yellow-600/50">
              <div className="text-center">
                <div className="text-lg font-mono font-bold text-yellow-400 mb-2">
                  <span dangerouslySetInnerHTML={{ __html: `C(${n},${r}) = ${nCr(n, r)}` }} />
                </div>
                <div className="text-sm text-neutral-300 space-y-1">
                  <div className="font-mono">{n}! / ({r}! × {n-r}!) = {nCr(n, r)}</div>
                  {r <= 3 && (
                    <div className="text-xs font-mono">
                      = {Array.from({length: r}, (_, i) => n-i).join(' × ')} / {Array.from({length: r}, (_, i) => r-i).join(' × ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Compare to permutations */}
            {selectedItems.size === r && r > 0 && (
              <div className="mt-3 bg-neutral-800 rounded-lg p-3 border border-purple-600/50">
                <div className="text-sm">
                  <div className="text-purple-400 font-semibold mb-1">
                    Permutations vs Combinations:
                  </div>
                  <div className="text-neutral-300 space-y-1">
                    <div><span dangerouslySetInnerHTML={{ __html: `P(${n},${r}) = ${nPr(n, r)}` }} /> arrangements</div>
                    <div><span dangerouslySetInnerHTML={{ __html: `C(${n},${r}) = ${nCr(n, r)}` }} /> selections</div>
                    <div className="text-xs text-neutral-400 font-mono">
                      Factor of {r}! = {Array.from({length: r}, (_, i) => r-i).join('×')} = {nPr(n, r) / nCr(n, r)}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show some combinations */}
            {n <= 6 && r <= 3 && r > 0 && (
              <div className="mt-3">
                <h5 className="text-sm font-semibold text-neutral-300 mb-2">
                  All <span className="font-mono">{nCr(n, r)}</span> combinations:
                </h5>
                <div className="grid grid-cols-3 gap-1 text-xs font-mono text-neutral-400">
                  {getAllCombinations().map((combo, i) => (
                    <div key={i}>{`{${combo.join(',')}}`}</div>
                  ))}
                </div>
              </div>
            )}
          </VisualizationSection>

          {/* Learning Challenges */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Learning Challenges</h4>
            
            {currentChallenge < challenges.length ? (
              <div>
                <div className="bg-neutral-800 rounded-lg p-3 border border-purple-600/50 mb-3">
                  <div className="text-sm font-semibold text-purple-400 mb-1">
                    Challenge {currentChallenge + 1}: {challenges[currentChallenge].title}
                  </div>
                  <div className="text-sm text-neutral-300">
                    {challenges[currentChallenge].description}
                  </div>
                  {showHint && (
                    <div className="text-xs text-yellow-400 mt-2">
                      💡 Hint: {challenges[currentChallenge].hint}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-neutral-400 hover:text-neutral-300 mb-2"
                >
                  {showHint ? "Hide" : "Show"} hint
                </button>
                
                {/* Check if challenge is completed */}
                {challenges[currentChallenge].check(n, r, nCr) && (
                  <div className="bg-green-900/50 rounded p-2 mb-3">
                    <div className="text-sm text-green-400">✅ Challenge Complete!</div>
                    <button
                      onClick={() => {
                        setCurrentChallenge(prev => prev + 1);
                        setShowHint(false);
                      }}
                      className="text-xs text-green-400 hover:text-green-300 mt-1"
                    >
                      Next Challenge →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="text-green-400 font-semibold mb-2">🎉 All Challenges Complete!</div>
                <div className="text-sm text-neutral-300">
                  You've mastered combinations! Try the interactive lottery below.
                </div>
                <button
                  onClick={() => {
                    setCurrentChallenge(0);
                    setCompletedChallenges(new Set());
                  }}
                  className="text-xs text-neutral-400 hover:text-neutral-300 mt-2"
                >
                  Restart Challenges
                </button>
              </div>
            )}
            
            {/* Progress indicator */}
            <div className="mt-3">
              <div className="flex gap-1">
                {challenges.map((challenge, idx) => (
                  <div
                    key={challenge.id}
                    className={cn(
                      "flex-1 h-2 rounded",
                      completedChallenges.has(challenge.id)
                        ? "bg-green-600"
                        : idx === currentChallenge
                        ? "bg-purple-600"
                        : "bg-neutral-700"
                    )}
                  />
                ))}
              </div>
              <div className="text-xs text-neutral-400 mt-1 font-mono">
                {completedChallenges.size} / {challenges.length} completed
              </div>
            </div>
          </VisualizationSection>
        </div>

        {/* Right Panel */}
        <div className="lg:w-2/3 space-y-4">
          <GraphContainer height="500px">
            <svg ref={svgRef} style={{ width: "100%", height: 500 }} />
          </GraphContainer>
          
          {showPascal && (
            <div className="bg-neutral-800 rounded-lg p-4">
              <h4 className="text-base font-bold text-white mb-3">Pascal&apos;s Triangle</h4>
              <PascalsTriangle rows={8} highlightN={n} highlightR={r} />
              <p className="text-xs text-neutral-400 mt-2">
                <span dangerouslySetInnerHTML={{ __html: `C(${n},${r})` }} /> is highlighted in row {n}, position {r}
              </p>
            </div>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default UnorderedSamples;