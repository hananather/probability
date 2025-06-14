"use client";
import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, cn, createColorScheme } from '../../lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';
import { Tutorial } from '../ui/Tutorial';

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

// Calculate nPr
function nPr(n, r) {
  if (r > n || r < 0) return 0;
  let result = 1;
  for (let i = 0; i < r; i++) {
    result *= (n - i);
  }
  return result;
}

// Tutorial steps
const tutorialSteps = [
  {
    target: '.selection-circle',
    title: 'Interactive Selection',
    content: 'Click on the numbered items to select them. Notice how the order of selection doesn\'t affect the final combination.',
    position: 'bottom'
  },
  {
    target: '.parameter-controls',
    title: 'Adjust Parameters',
    content: 'Use these sliders to change n (total items) and r (items to choose). Watch how the formula updates!',
    position: 'top'
  },
  {
    target: '.calculation-display',
    title: 'Live Calculation',
    content: 'This shows the binomial coefficient formula and its calculation. For small values, you can see the step-by-step computation.',
    position: 'left'
  },
  {
    target: '.milestone-insights',
    title: 'Learning Milestones',
    content: 'As you explore different combinations, you\'ll unlock insights about the mathematics behind combinations.',
    position: 'top'
  }
];

export function CombinationBuilder() {
  const [n, setN] = useState(5);
  const [r, setR] = useState(3);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [totalCombinationsExplored, setTotalCombinationsExplored] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [discoveredInsights, setDiscoveredInsights] = useState(new Set());
  const svgRef = useRef(null);

  // Learning milestones
  const milestones = [
    { 
      threshold: 1, 
      title: "First Combination",
      insight: "You've created your first combination! Notice how the items form a set where order doesn't matter."
    },
    {
      threshold: 5,
      title: "Pattern Recognition",
      insight: "Try changing r while keeping n fixed. See how C(n,r) changes? There's a pattern here!"
    },
    {
      threshold: 10,
      title: "Symmetry Discovery",
      insight: "Have you noticed that C(n,r) = C(n,n-r)? Choosing items to include is the same as choosing items to exclude!"
    },
    {
      threshold: 20,
      title: "Combinatorial Master",
      insight: "You're getting the hang of it! Combinations are fundamental to probability calculations."
    }
  ];

  // Check for new milestones
  useEffect(() => {
    milestones.forEach(milestone => {
      if (totalCombinationsExplored >= milestone.threshold && !discoveredInsights.has(milestone.threshold)) {
        setDiscoveredInsights(prev => new Set([...prev, milestone.threshold]));
      }
    });
  }, [totalCombinationsExplored]);

  // Track when a complete combination is selected
  useEffect(() => {
    if (selectedItems.size === r && r > 0) {
      setTotalCombinationsExplored(prev => prev + 1);
    }
  }, [selectedItems, r]);

  // Main visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 400;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${width/2}, ${height/2})`)
      .attr("class", "selection-circle");
    
    // Draw items in a circle - maximizing space usage (80-90% principle)
    const radius = Math.min(width, height) * 0.4;
    const itemRadius = Math.min(35, radius / n * 1.8);
    const items = Array.from({length: n}, (_, i) => i + 1);
    
    items.forEach((item, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const isSelected = selectedItems.has(item);
      
      const group = g.append("g")
        .attr("transform", `translate(${x}, ${y})`);
      
      // Circle with hover effect
      const circle = group.append("circle")
        .attr("r", itemRadius)
        .attr("fill", isSelected ? colorScheme.chart.primary : "#1a1a1a")
        .attr("stroke", isSelected ? colorScheme.chart.primary : colors.chart.grid)
        .attr("stroke-width", 2)
        .attr("cursor", "pointer")
        .style("transition", "all 200ms ease-in-out");
      
      // Number (monospace as per design system)
      group.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", isSelected ? "white" : colors.chart.text)
        .style("font-size", "18px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .style("pointer-events", "none")
        .text(item);
      
      // Hover effects
      group.on("mouseenter", function() {
        if (!isSelected) {
          circle.attr("fill", "#2a2a2a")
               .attr("stroke", colorScheme.chart.secondary);
        }
      })
      .on("mouseleave", function() {
        if (!isSelected) {
          circle.attr("fill", "#1a1a1a")
               .attr("stroke", colors.chart.grid);
        }
      })
      .on("click", () => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(item)) {
          newSelected.delete(item);
        } else if (newSelected.size < r) {
          newSelected.add(item);
        }
        setSelectedItems(newSelected);
      });
    });
    
    // Center information
    const centerGroup = g.append("g");
    
    centerGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .attr("fill", colors.chart.text)
      .style("font-size", "16px")
      .style("font-weight", "600")
      .text(`Select ${r} items`);
    
    centerGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .attr("fill", colorScheme.chart.secondary)
      .style("font-size", "14px")
      .style("font-family", "monospace")
      .text(`${selectedItems.size} / ${r} selected`);
    
    // Show selected combination
    if (selectedItems.size === r && r > 0) {
      const selectedArray = Array.from(selectedItems).sort((a, b) => a - b);
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", height/2 - 40)
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "20px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .text(`{${selectedArray.join(', ')}}`);
    }
    
  }, [n, r, selectedItems]);

  // Generate all combinations for display
  function getAllCombinations() {
    if (n > 8 || r > 5 || nCr(n, r) > 35) return null; // Too many to display
    
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

  const allCombinations = getAllCombinations();
  const currentMilestone = milestones.filter(m => totalCombinationsExplored >= m.threshold).pop();

  return (
    <VisualizationContainer 
      title="Interactive Combination Builder"
      className="p-2"
    >
      <Tutorial
        steps={tutorialSteps}
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        persistKey="combination-builder"
      />
      
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3 parameter-controls">
            <h4 className="text-base font-bold text-white mb-3">Parameters</h4>
            
            <ControlGroup>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-neutral-300">Total items (n)</label>
                  <span className="text-sm font-mono text-yellow-400">{n}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
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
            </ControlGroup>
          </VisualizationSection>

          <VisualizationSection className="p-3 calculation-display">
            <h4 className="text-base font-bold text-white mb-3">Calculation</h4>
            
            <div className="bg-neutral-800 rounded-lg p-3 border border-yellow-600/50">
              <div className="text-center">
                <div className="text-lg font-mono font-bold text-yellow-400 mb-2">
                  C({n},{r}) = {nCr(n, r)}
                </div>
                <div className="text-sm text-neutral-300 space-y-1">
                  <div className="font-mono">
                    {n}! / ({r}! × {n-r}!) = {nCr(n, r)}
                  </div>
                  {r <= 3 && r > 0 && (
                    <div className="text-xs font-mono text-neutral-400">
                      = {Array.from({length: r}, (_, i) => n-i).join(' × ')} / {Array.from({length: r}, (_, i) => r-i).join(' × ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Comparison with permutations */}
            <div className="mt-3 p-3 bg-neutral-800 rounded-lg border border-purple-600/50">
              <div className="text-sm">
                <div className="text-purple-400 font-semibold mb-1">
                  Permutations vs Combinations
                </div>
                <div className="text-neutral-300 space-y-1 font-mono text-xs">
                  <div>P({n},{r}) = {nPr(n, r)} arrangements</div>
                  <div>C({n},{r}) = {nCr(n, r)} selections</div>
                  {r > 0 && (
                    <div className="text-neutral-400">
                      Factor: {r}! = {Array.from({length: r}, (_, i) => r-i).join('×')} = {nPr(n, r) / nCr(n, r)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </VisualizationSection>

          <VisualizationSection className="p-3 milestone-insights">
            <h4 className="text-base font-bold text-white mb-3">Learning Progress</h4>
            
            <ProgressBar
              current={totalCombinationsExplored}
              total={20}
              label="Combinations Explored"
              variant="emerald"
            />
            
            {currentMilestone && (
              <div className="mt-3 p-3 bg-emerald-900/30 rounded-lg border border-emerald-600/50">
                <div className="text-sm font-semibold text-emerald-400 mb-1">
                  {currentMilestone.title}
                </div>
                <div className="text-xs text-neutral-300">
                  {currentMilestone.insight}
                </div>
              </div>
            )}
            
            {/* Show all combinations if not too many */}
            {allCombinations && (
              <div className="mt-3">
                <h5 className="text-sm font-semibold text-neutral-300 mb-2">
                  All {nCr(n, r)} combinations:
                </h5>
                <div className="grid grid-cols-3 gap-1 text-xs font-mono text-neutral-400 max-h-32 overflow-y-auto">
                  {allCombinations.map((combo, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "transition-colors",
                        JSON.stringify(combo) === JSON.stringify(Array.from(selectedItems).sort((a, b) => a - b))
                          ? "text-yellow-400 font-semibold"
                          : ""
                      )}
                    >
                      {`{${combo.join(',')}}`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </VisualizationSection>
        </div>

        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3">
          <GraphContainer height="400px">
            <svg ref={svgRef} style={{ width: "100%", height: 400 }} />
          </GraphContainer>
          
          {/* Quick facts */}
          <VisualizationSection className="p-3 mt-4">
            <h4 className="text-sm font-semibold text-neutral-300 mb-2">Key Properties</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-neutral-800 rounded p-2">
                <div className="text-blue-400 font-semibold mb-1">Symmetry</div>
                <div className="font-mono">C({n},{r}) = C({n},{n-r}) = {nCr(n, r)}</div>
              </div>
              <div className="bg-neutral-800 rounded p-2">
                <div className="text-purple-400 font-semibold mb-1">Edge Cases</div>
                <div className="font-mono">C({n},0) = C({n},{n}) = 1</div>
              </div>
            </div>
          </VisualizationSection>
        </div>
      </div>
    </VisualizationContainer>
  );
}