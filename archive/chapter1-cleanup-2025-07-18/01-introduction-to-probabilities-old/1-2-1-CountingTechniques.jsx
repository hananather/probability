"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer
} from '../ui/VisualizationContainer';
import { colors, typography, cn, createColorScheme } from '../../lib/design-system';
import { tutorial_1_2_1 } from '@/tutorials/chapter1';

// Use probability color scheme
const colorScheme = createColorScheme('probability');

// Helper functions for calculations
function nCr(n, r) {
  if (r > n) return 0;
  let result = 1;
  for (let i = 0; i < r; i++) {
    result = result * (n - i) / (i + 1);
  }
  return result;
}

function nPr(n, r) {
  if (r > n) return 0;
  let result = 1;
  for (let i = 0; i < r; i++) {
    result = result * (n - i);
  }
  return result;
}

// Worked Example Component (Simplified)
const PermCombWorkedExample = memo(function PermCombWorkedExample({ n, r, isPermutation }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    // MathJax timeout pattern
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          // Silent error: MathJax error
        });
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [n, r, isPermutation]);
  
  const permCount = nPr(n, r);
  const combCount = nCr(n, r);
  
  return (
    <div ref={contentRef} className="bg-neutral-800 p-6 rounded-lg text-neutral-200">
      <h4 className="text-lg font-semibold border-b border-neutral-600 pb-2 mb-4 text-white">
        {isPermutation ? 'Permutation' : 'Combination'} Calculation
      </h4>
      
      <div className="mb-4">
        <p className="mb-2 font-medium text-purple-400">Formula & Calculation:</p>
        {isPermutation ? (
          <div>
            <div dangerouslySetInnerHTML={{ __html: `\\[P(${n},${r}) = \\frac{${n}!}{(${n}-${r})!} = ${permCount}\\]` }} />
          </div>
        ) : (
          <div>
            <div dangerouslySetInnerHTML={{ __html: `\\[C(${n},${r}) = \\binom{${n}}{${r}} = \\frac{${n}!}{${r}!(${n}-${r})!} = ${combCount}\\]` }} />
          </div>
        )}
      </div>
      
      <div className="bg-neutral-900 p-3 rounded text-sm">
        <p className="text-yellow-400 font-medium mb-2">💡 Real-world Example:</p>
        {isPermutation ? (
          <p className="text-neutral-300">
            Arranging {r} people in a line from {n} total people: {permCount} ways
          </p>
        ) : (
          <p className="text-neutral-300">
            Choosing a team of {r} people from {n} candidates: {combCount} ways
          </p>
        )}
      </div>
    </div>
  );
});

function CountingTechniques() {
  const [size, setSize] = useState(3); // Start with 3 items
  const [number, setNumber] = useState(2); // Start with r=2
  const [combinations, setCombinations] = useState(false);
  const [hasExploredPermutations, setHasExploredPermutations] = useState(false);
  const [hasExploredCombinations, setHasExploredCombinations] = useState(false);
  const [hasComparedBoth, setHasComparedBoth] = useState(false);
  const [showWorkedExample, setShowWorkedExample] = useState(true);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [showSelectionMode, setShowSelectionMode] = useState(false);
  
  const svgRef = useRef(null);
  const nodesRef = useRef([]);
  const treeRef = useRef(null); // Store the full tree
  const rootRef = useRef(null); // Store root hierarchy
  
  // Update number with animation
  const updateNumber = (newNumber) => {
    if (newNumber === number || newNumber < 0 || newNumber > size) return;
    setNumber(newNumber);
    setSelectedNodes([]); // Clear selection when changing depth
  };
  
  // Keyboard shortcuts with left/right arrows
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'p' || e.key === 'P') {
        setCombinations(false);
        setHasExploredPermutations(true);
      } else if (e.key === 'c' || e.key === 'C') {
        setCombinations(true);
        setHasExploredCombinations(true);
      } else if (e.key === 'ArrowRight') {
        updateNumber(Math.min(number + 1, size));
      } else if (e.key === 'ArrowLeft') {
        updateNumber(Math.max(number - 1, 0));
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [number, size]);
  
  // Update hasComparedBoth when both modes have been explored
  useEffect(() => {
    if (hasExploredPermutations && hasExploredCombinations) {
      setHasComparedBoth(true);
    }
  }, [hasExploredPermutations, hasExploredCombinations]);
  
  // Get current count
  function getCount() {
    return combinations ? nCr(size, number) : nPr(size, number);
  }
  
  // Hash function for anagrams (for combinations)
  function hashAnagram(s) {
    return s.split("").sort().join("");
  }
  
  // Create full tree data structure (like original)
  function createFullTree() {
    const colors = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, size);
    
    function permutationCalc(obj, num, availableColors) {
      if (num === 0) return obj;
      
      obj.children = [];
      for (let i = 0; i < availableColors.length; i++) {
        const child = { 
          name: obj.name + availableColors[i], 
          children: [],
          id: obj.name + availableColors[i]
        };
        obj.children.push(child);
        
        const remainingColors = [...availableColors];
        remainingColors.splice(i, 1);
        permutationCalc(child, num - 1, remainingColors);
      }
      return obj;
    }
    
    // Create full tree up to max depth
    const root = permutationCalc({ name: "", children: [] }, size, colors);
    return root;
  }
  
  // Collapse nodes beyond current depth
  function collapseNodes(d, depth, targetDepth) {
    if (d.children && depth >= targetDepth) {
      d._children = d.children;
      d.children = null;
    } else if (d._children && depth < targetDepth) {
      d.children = d._children;
      d._children = null;
    }
    
    const childrenToProcess = d.children || d._children || [];
    childrenToProcess.forEach(child => collapseNodes(child, depth + 1, targetDepth));
  }
  
  // Initialize tree on mount or size change
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width: containerWidth } = svgRef.current.getBoundingClientRect();
    svg.selectAll("*").remove();
    
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const width = containerWidth - margin.left - margin.right;
    const height = 500;
    
    // Set viewBox
    svg.attr("viewBox", `0 0 ${containerWidth} 580`);
    
    // Dark background
    svg.append("rect")
      .attr("width", containerWidth)
      .attr("height", 580)
      .attr("fill", "#0a0a0a");
    
    // Create tree layout
    treeRef.current = d3.tree().size([height, width]);
    
    // Create container
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Store container reference
    svg.node().__container = g;
    
    // Create full tree
    const treeData = createFullTree();
    rootRef.current = d3.hierarchy(treeData);
    rootRef.current.x0 = height / 2;
    rootRef.current.y0 = 0;
    
    // Store all positions
    rootRef.current.descendants().forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
    
    // Collapse to initial depth using the same approach
    rootRef.current.each(d => {
      if (d.depth >= number) {
        if (d.data.children) {
          d.data._children = d.data.children;
          d.data.children = null;
        }
      }
    });
    
    // Rebuild hierarchy after initial collapse
    const rootData = rootRef.current.data;
    rootRef.current = d3.hierarchy(rootData);
    rootRef.current.x0 = height / 2;
    rootRef.current.y0 = 0;
    
    // Initial render
    updateVisualization(0);
  }, [size]); // Only recreate tree when size changes
  
  // Handle number (depth) changes
  useEffect(() => {
    if (rootRef.current && treeRef.current) {
      // Re-traverse the hierarchy after collapsing
      rootRef.current.each(d => {
        if (d.depth >= number) {
          if (d.data.children) {
            d.data._children = d.data.children;
            d.data.children = null;
          }
        } else {
          if (d.data._children) {
            d.data.children = d.data._children;
            d.data._children = null;
          }
        }
      });
      
      // Rebuild hierarchy with updated children
      const updatedData = rootRef.current.data;
      rootRef.current = d3.hierarchy(updatedData);
      rootRef.current.x0 = 250;
      rootRef.current.y0 = 0;
      
      updateVisualization(750);
    }
  }, [number]);
  
  // Update visualization function
  const updateVisualization = (duration = 750) => {
    if (!svgRef.current || !rootRef.current || !treeRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const g = svg.node().__container;
    if (!g) return;
    
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const { width: containerWidth } = svgRef.current.getBoundingClientRect();
    const width = containerWidth - margin.left - margin.right;
    const height = 500;
    
    // Compute tree layout
    const treeData = treeRef.current(rootRef.current);
    const nodes = treeData.descendants();
    const links = treeData.links();
    
    // Store nodes for selection
    nodesRef.current = nodes;
    
    // Normalize for fixed-depth
    const distNodes = width / Math.max(1, size);
    nodes.forEach(d => {
      d.y = d.depth * distNodes;
    });
    
    // Create diagonal path generator
    const diagonal = d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x);
    
    // Handle combinations - merge nodes with same letters (like original)
    if (combinations) {
      const hashmap = new Map();
      
      // Group nodes by anagram hash
      nodes.forEach(node => {
        if (node.data.name) {
          const key = hashAnagram(node.data.name);
          if (!hashmap.has(key)) {
            hashmap.set(key, []);
          }
          hashmap.get(key).push(node);
        }
      });
      
      // Process groups (like original removeRepeats function)
      hashmap.forEach((groupNodes, key) => {
        const len = groupNodes.length;
        const avgX = groupNodes.reduce((sum, n) => sum + n.x, 0) / len;
        const avgX0 = groupNodes.reduce((sum, n) => sum + (n.x0 || n.x), 0) / len;
        
        groupNodes.forEach((node, i) => {
          // Hide labels for all but last node in group (like original)
          node._top = (i === len - 1);
          node.x = avgX;
          node.x0 = avgX0;
          
          // Special positioning for specific combinations
          if (key === hashAnagram('AD')) node.x -= 10;
          if (key === hashAnagram('BC')) node.x += 10;
        });
      });
    } else {
      // Reset for permutations - all labels visible
      nodes.forEach(node => {
        node._top = true;
      });
    }
    
    // Ensure all nodes have _top defined
    nodes.forEach(node => {
      if (node._top === undefined) node._top = true;
    });
    
    // Update links with enter/update/exit pattern
    const link = g.selectAll("path.link")
      .data(links, d => d.target.data.name);
    
    // Enter new links
    const linkEnter = link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", colors.chart.grid)
      .attr("stroke-width", 1.5)
      .attr("d", d => {
        const o = { x: rootRef.current.x0, y: rootRef.current.y0 };
        return diagonal({ source: o, target: o });
      });
    
    // Update existing + new links
    link.merge(linkEnter).transition()
      .duration(duration)
      .attr("d", diagonal);
    
    // Remove exiting links
    link.exit().transition()
      .duration(duration)
      .attr("d", d => {
        const o = { x: d.source.x, y: d.source.y };
        return diagonal({ source: o, target: o });
      })
      .remove();
    
    // Update nodes with enter/update/exit pattern
    const node = g.selectAll("g.node")
      .data(nodes, d => d.data.name);
    
    // Enter new nodes
    const nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", d => {
        const source = d.parent || rootRef.current;
        return `translate(${source.y0 || 0},${source.x0 || 0})`;
      });
    
    // Add circles on enter (like original)
    nodeEnter.each(function(d) {
      const letters = d.data.name.split('');
      const nodeColors = [
        colorScheme.chart.primary,
        colorScheme.chart.secondary,
        colorScheme.chart.tertiary,
        '#f59e0b'
      ];
      
      // Adjust spacing based on size
      const letterSpacing = size <= 2 ? 9 : (size === 3 ? 8 : 7);
      const circleRadius = size <= 2 ? 4.5 : (size === 3 ? 4 : 3.5);
      
      // Add circles for each letter
      for (let j = letters.length - 1; j >= 0; j--) {
        d3.select(this).append("circle")
          .attr("r", 1e-6)
          .attr("cx", j * letterSpacing)
          .attr("fill", nodeColors[letters[j].charCodeAt(0) - 'A'.charCodeAt(0)] || '#666')
          .attr("stroke", "white")
          .attr("stroke-width", 0.5)
          .attr("class", letters[j])
          .attr("data-radius", circleRadius);
      }
    });
    
    // Add text labels on enter
    nodeEnter.append("text")
      .attr("x", -10)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(d => d.data.name)
      .style("fill", colors.chart.text)
      .style("fill-opacity", 1e-6)
      .style("font-size", size <= 2 ? "12px" : (size === 3 ? "11px" : "10px"));
    
    // Update nodes - transition to new position
    const nodeUpdate = node.merge(nodeEnter).transition()
      .duration(duration)
      .attr("transform", d => `translate(${d.y},${d.x})`);
    
    nodeUpdate.selectAll("circle")
      .attr("r", function() { return d3.select(this).attr("data-radius") || 4.5; });
    
    nodeUpdate.select("text")
      .style("fill-opacity", d => d._top !== false ? 1 : 1e-6);
    
    // Exit nodes - transition to parent position
    const nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", d => {
        const parent = d.parent || rootRef.current;
        return `translate(${parent.y},${parent.x})`;
      })
      .remove();
    
    nodeExit.selectAll("circle")
      .attr("r", 1e-6);
    
    nodeExit.select("text")
      .style("fill-opacity", 1e-6);
    
    // Stash positions for next transition
    nodes.forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  };
  
  // Trigger visualization update when dependencies change
  useEffect(() => {
    if (rootRef.current) {
      updateVisualization(750);
    }
  }, [combinations]);
  
  
  return (
    <VisualizationContainer 
      title="Counting Techniques: Permutations and Combinations" 
      className="p-2"
      tutorialSteps={tutorial_1_2_1}
      tutorialKey="counting-techniques-1-2-1"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3 flex flex-col">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Visualize the difference between permutations and combinations through tree diagrams.
            </p>
            
            <div className="mt-3 space-y-2 text-xs">
              <div className="p-2 bg-blue-900/20 border border-blue-600/30 rounded">
                <p className="font-semibold text-blue-400 mb-1">Example: n=3, r=2</p>
                <p className="text-neutral-300">
                  <span className="font-medium">Permutations:</span> AB, AC, BA, BC, CA, CB (6 total)
                </p>
                <p className="text-neutral-400 mt-1">Each branch shows a unique arrangement</p>
              </div>
              
              <div className="p-2 bg-green-900/20 border border-green-600/30 rounded">
                <p className="font-semibold text-green-400 mb-1">Same example with combinations</p>
                <p className="text-neutral-300">
                  <span className="font-medium">Combinations:</span> {"{A,B}"}, {"{A,C}"}, {"{B,C}"} (3 total)
                </p>
                <p className="text-neutral-400 mt-1">AB and BA merge to one branch (same selection)</p>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-neutral-400">
              <span className="font-semibold">Keyboard shortcuts:</span> P/C to switch modes, ←/→ to change r
            </div>
          </VisualizationSection>

          {/* Controls */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Controls</h4>
            
            <div className="space-y-3">
              {/* Mode toggle */}
              <div>
                <label className="text-sm text-neutral-300 mb-1.5 block">Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCombinations(false);
                      setHasExploredPermutations(true);
                    }}
                    className={cn(
                      "flex-1 px-2 py-1.5 rounded text-sm font-medium transition-colors",
                      !combinations
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-700 hover:bg-neutral-600 text-white"
                    )}
                  >
                    Permutations
                  </button>
                  <button
                    onClick={() => {
                      setCombinations(true);
                      setHasExploredCombinations(true);
                    }}
                    className={cn(
                      "flex-1 px-2 py-1.5 rounded text-sm font-medium transition-colors",
                      combinations
                        ? "bg-green-600 text-white"
                        : "bg-neutral-700 hover:bg-neutral-600 text-white"
                    )}
                  >
                    Combinations
                  </button>
                </div>
              </div>
              
              {/* Size selection */}
              <div>
                <label className="text-sm text-neutral-300 mb-1.5 block">Total Items (n)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <button
                      key={n}
                      onClick={() => {
                        setSize(n);
                        setNumber(Math.min(number, n));
                        setSelectedNodes([]);
                      }}
                      className={cn(
                        "flex-1 px-2 py-1.5 rounded text-sm font-medium transition-colors",
                        size === n
                          ? "bg-purple-600 text-white"
                          : "bg-neutral-700 hover:bg-neutral-600 text-white"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </VisualizationSection>

          {/* Calculation Display */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Calculation</h4>
            
            <div className="bg-neutral-800 rounded-lg p-2.5 border border-yellow-600/50">
              <div className="text-center">
                <div className="text-xl font-mono font-bold text-yellow-400 mb-1">
                  {combinations ? 'C' : 'P'}({size}, {number}) = {getCount()}
                </div>
                <div className="text-xs text-neutral-300">
                  {combinations ? (
                    <span>
                      {size}! / ({number}! × {size - number}!) = {getCount()}
                    </span>
                  ) : (
                    <span>
                      {size}! / {size - number}! = {getCount()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Interactive table */}
            <div className="mt-4">
              <label className="text-sm text-neutral-300 mb-2 block">
                Select r (click row to change selection size):
              </label>
              <div className="text-xs text-neutral-400 mb-2 p-2 bg-neutral-800/50 rounded">
                <p className="font-medium text-yellow-400">What does r control?</p>
                <p className="mt-1">• r = how many items to select/arrange</p>
                <p>• Tree shows r levels deep</p>
                <p>• Final nodes show all possible {combinations ? 'selections' : 'arrangements'}</p>
              </div>
              <div className="bg-neutral-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="text-left p-2.5 text-neutral-400 font-normal">r</th>
                      <th className="text-right p-2.5 text-neutral-400 font-normal">
                        {combinations ? 'C' : 'P'}({size}, r)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({length: size + 1}, (_, r) => {
                      const count = combinations ? nCr(size, r) : nPr(size, r);
                      return (
                        <tr
                          key={r}
                          onClick={() => updateNumber(r)}
                          className={cn(
                            "cursor-pointer transition-all duration-200",
                            r === number
                              ? "bg-yellow-600/20 text-yellow-400"
                              : "hover:bg-neutral-700/50 text-neutral-300"
                          )}
                        >
                          <td className="p-2.5">
                            {r}
                            {r === number && (
                              <span className="ml-2 text-xs">●</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right font-mono">
                            {count}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {getCount() > 100 && (
                <div className="mt-2 text-xs text-neutral-400">
                  Note: Large trees are simplified for performance
                </div>
              )}
            </div>
            
            <label className="flex items-center gap-2 text-sm mt-3">
              <input 
                type="checkbox" 
                checked={showWorkedExample} 
                onChange={e => setShowWorkedExample(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-neutral-300">Show worked example</span>
            </label>
          </VisualizationSection>

          {/* Interactive Mode */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Interactive Mode</h4>
            
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={showSelectionMode} 
                onChange={e => {
                  setShowSelectionMode(e.target.checked);
                  setSelectedNodes([]);
                }}
                className="w-4 h-4"
              />
              <span className="text-neutral-300">Enable node selection</span>
            </label>
            
            {showSelectionMode && (
              <div className="space-y-2 mt-3">
                <div className="text-xs text-neutral-300">
                  {number === size ? (
                    `Selection mode is currently disabled in this version.`
                  ) : (
                    `Set r = ${size} to enable selection mode.`
                  )}
                </div>
                
                {number === size && (
                  <>
                    <div className="bg-neutral-800 rounded p-2 text-xs">
                      <div className="text-neutral-300">Selected: {selectedNodes.length} / {getCount()}</div>
                      {selectedNodes.length > 0 && (
                        <div className="mt-1 font-mono text-yellow-400">
                          {selectedNodes.slice(0, 5).join(', ')}
                          {selectedNodes.length > 5 && ` ... +${selectedNodes.length - 5} more`}
                        </div>
                      )}
                    </div>
                    
                    {selectedNodes.length === getCount() && (
                      <div className="text-green-400 text-xs font-semibold">
                        ✨ Perfect! You've selected all possible {combinations ? 'combinations' : 'permutations'}!
                      </div>
                    )}
                    
                    {selectedNodes.length > 0 && (
                      <button
                        onClick={() => setSelectedNodes([])}
                        className="w-full px-2 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-xs text-white transition-colors"
                      >
                        Clear Selection
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </VisualizationSection>

          {/* Mathematical Insights */}
          <VisualizationSection className="p-4 flex-1 flex flex-col">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Mathematical Discoveries</h4>
            <div className="space-y-3 text-xs text-neutral-300">
              {!hasExploredPermutations && !hasExploredCombinations && (
                <div>
                  <p className="text-neutral-400">Switch between Permutations and Combinations to discover key differences.</p>
                  <p className="text-purple-300 mt-1">
                    Try changing r values to see how the tree structure evolves.
                  </p>
                </div>
              )}
              
              {hasExploredPermutations && !hasExploredCombinations && (
                <div className="p-2 bg-blue-900/20 border border-blue-600/30 rounded">
                  <p className="font-medium text-blue-400">Permutations Discovered!</p>
                  <p className="mt-1">Each arrangement is unique - order matters.</p>
                  <p className="mt-1">Formula: P(n,r) = n!/(n-r)!</p>
                </div>
              )}
              
              {hasExploredCombinations && !hasExploredPermutations && (
                <div className="p-2 bg-green-900/20 border border-green-600/30 rounded">
                  <p className="font-medium text-green-400">Combinations Discovered!</p>
                  <p className="mt-1">Branches merge when order doesn't matter.</p>
                  <p className="mt-1">Formula: C(n,r) = n!/(r!(n-r)!)</p>
                </div>
              )}
              
              {hasComparedBoth && (
                <>
                  <div className="p-2 bg-purple-900/20 border border-purple-600/30 rounded">
                    <p className="font-medium text-purple-400">Key Relationship Found!</p>
                    <p className="mt-1">P(n,r) = C(n,r) × r!</p>
                    <p className="mt-1 text-xs">Permutations = Combinations × ways to arrange r items</p>
                  </div>
                  
                  {size === 4 && number === 2 && (
                    <div className="text-yellow-400">
                      <p>Example with current values:</p>
                      <p className="font-mono text-xs">P(4,2) = 12 = C(4,2) × 2! = 6 × 2</p>
                    </div>
                  )}
                </>
              )}
              
              {number === size && (
                <div className="text-neutral-400 italic">
                  <p>When r = n:</p>
                  <p>• Permutations: n! ways to arrange all items</p>
                  <p>• Combinations: Only 1 way to select all items</p>
                </div>
              )}
              
              {number === 0 && (
                <div className="text-neutral-400 italic">
                  <p>When r = 0:</p>
                  <p>Both equal 1 (the empty selection)</p>
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>

        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          <GraphContainer height="600px">
            <div className="px-4 pt-4 pb-2">
              <h4 className="text-base font-bold text-white">
                {combinations ? 'Combination' : 'Permutation'} Tree
                <span className="text-sm font-normal text-gray-400 ml-2">
                  (depth r={number}, {getCount()} {combinations ? 'unique selections' : 'arrangements'})
                </span>
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                {combinations 
                  ? `Shows ${getCount()} ways to select ${number} items from ${size} (order doesn't matter - branches merge)`
                  : `Shows ${getCount()} ways to arrange ${number} items from ${size} (order matters - all branches unique)`}
              </p>
            </div>
            <svg ref={svgRef} style={{ width: "100%", height: 560 }} />
          </GraphContainer>
          
          {/* Worked Example */}
          {showWorkedExample && (
            <PermCombWorkedExample n={size} r={number} isPermutation={!combinations} />
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default CountingTechniques;