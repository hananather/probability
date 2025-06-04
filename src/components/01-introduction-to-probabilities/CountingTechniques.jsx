"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import * as d3 from "d3";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer
} from '../ui/VisualizationContainer';
import { colors, typography, cn, createColorScheme } from '../../lib/design-system';
import { ProgressTracker } from '../ui/ProgressTracker';

// Use probability color scheme
const colorScheme = createColorScheme('probability');

// Worked Example Component
const PermCombWorkedExample = memo(function PermCombWorkedExample({ n, r, isPermutation }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    // MathJax timeout pattern
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
  }, [n, r, isPermutation]);
  
  const permCount = r > n ? 0 : Array.from({length: r}, (_, i) => n - i).reduce((a, b) => a * b, 1);
  const combCount = r > n ? 0 : permCount / Array.from({length: r}, (_, i) => i + 1).reduce((a, b) => a * b, 1);
  
  return (
    <div ref={contentRef} style={{
      backgroundColor: '#2A303C',
      padding: '1.5rem',
      borderRadius: '8px',
      color: '#e0e0e0',
      marginTop: '1rem'
    }}>
      <h4 style={{ fontSize: '1.125rem', fontWeight: '600', borderBottom: '1px solid #4A5568', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        {isPermutation ? 'Permutation' : 'Combination'} Example: Selecting {r} from {n} items
      </h4>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          Question: How many ways to {isPermutation ? 'arrange' : 'choose'} {r} items from {n} distinct items?
        </p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>Step-by-step calculation:</p>
        {isPermutation ? (
          <div>
            <div dangerouslySetInnerHTML={{ __html: `\\[P(${n},${r}) = \\frac{${n}!}{(${n}-${r})!}\\]` }} />
            <div dangerouslySetInnerHTML={{ __html: `\\[= \\frac{${n}!}{${n-r}!}\\]` }} />
            {r > 0 && r <= 5 && (
              <div dangerouslySetInnerHTML={{ __html: `\\[= ${Array.from({length: r}, (_, i) => n - i).join(' \\times ')}\\]` }} />
            )}
            <div dangerouslySetInnerHTML={{ __html: `\\[= ${permCount}\\]` }} />
          </div>
        ) : (
          <div>
            <div dangerouslySetInnerHTML={{ __html: `\\[C(${n},${r}) = \\frac{${n}!}{${r}!(${n}-${r})!}\\]` }} />
            <div dangerouslySetInnerHTML={{ __html: `\\[= \\frac{${n}!}{${r}! \\times ${n-r}!}\\]` }} />
            {r > 0 && r <= 5 && (
              <>
                <div dangerouslySetInnerHTML={{ __html: `\\[= \\frac{${Array.from({length: r}, (_, i) => n - i).join(' \\times ')}}{${Array.from({length: r}, (_, i) => i + 1).join(' \\times ')}}\\]` }} />
                <div dangerouslySetInnerHTML={{ __html: `\\[= \\frac{${permCount}}{${Array.from({length: r}, (_, i) => i + 1).reduce((a, b) => a * b, 1)}}\\]` }} />
              </>
            )}
            <div dangerouslySetInnerHTML={{ __html: `\\[= ${combCount}\\]` }} />
          </div>
        )}
      </div>
      
      <div style={{ backgroundColor: '#1A202C', padding: '1rem', borderRadius: '4px', fontSize: '0.875rem' }}>
        <p>💡 Key insight: {isPermutation ? 'Order matters! AB ≠ BA' : 'Order doesn\'t matter! AB = BA'}</p>
        {!isPermutation && r > 0 && (
          <p className="mt-2">Notice: C({n},{r}) = P({n},{r}) ÷ {r}! = {permCount} ÷ {Array.from({length: r}, (_, i) => i + 1).reduce((a, b) => a * b, 1)} = {combCount}</p>
        )}
      </div>
    </div>
  );
});

function CountingTechniques() {
  const [size, setSize] = useState(4); // Number of available items
  const [number, setNumber] = useState(2); // Number to select
  const [combinations, setCombinations] = useState(false); // false = permutations, true = combinations
  const [totalCalculations, setTotalCalculations] = useState(0);
  const [showWorkedExample, setShowWorkedExample] = useState(true);
  const [selectedNodes, setSelectedNodes] = useState([]); // Track selected nodes for interactive selection
  const [showSelectionMode, setShowSelectionMode] = useState(false);
  
  const svgRef = useRef(null);
  const treeDataRef = useRef(null);
  
  // Calculate nPr and nCr
  function nPr(n, r) {
    if (r > n) return 0;
    let result = 1;
    for (let i = 0; i < r; i++) {
      result = result * (n - i);
    }
    return result;
  }
  
  function nCr(n, r) {
    if (r > n) return 0;
    let result = 1;
    for (let i = 0; i < r; i++) {
      result = result * (n - i) / (i + 1);
    }
    return result;
  }
  
  // Get current count
  function getCount() {
    return combinations ? nCr(size, number) : nPr(size, number);
  }
  
  // Create tree data
  function createTreeData(level) {
    const source = { name: "", children: [] };
    const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, size);
    
    // Recursive function to build permutation tree
    function buildPermutations(node, remainingItems, depth) {
      if (depth >= number) return;
      
      for (let i = 0; i < remainingItems.length; i++) {
        const childNode = {
          name: node.name + remainingItems[i],
          children: []
        };
        node.children.push(childNode);
        
        const newRemaining = remainingItems.slice();
        newRemaining.splice(i, 1);
        buildPermutations(childNode, newRemaining, depth + 1);
      }
    }
    
    buildPermutations(source, items, 0);
    
    // Mark nodes for display/hiding based on depth
    function markNodes(node, depth) {
      if (depth >= level) {
        if (node.children && node.children.length > 0) {
          node._children = node.children;
          node.children = null;
        }
      } else if (node._children) {
        node.children = node._children;
        node._children = null;
      }
      
      node._top = true;
      
      if (node.children) {
        node.children.forEach(child => markNodes(child, depth + 1));
      }
    }
    
    markNodes(source, 0);
    return source;
  }
  
  // Hash function for anagrams (for combinations)
  function hashAnagram(s) {
    return s.split("").sort().join("");
  }
  
  // Main visualization effect
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width: containerWidth } = svgRef.current.getBoundingClientRect();
    svg.selectAll("*").remove();
    
    const margin = { top: 20, right: 80, bottom: 20, left: 20 };
    const width = containerWidth - margin.left - margin.right;
    const height = 380;
    
    // Set viewBox
    svg.attr("viewBox", `0 0 ${containerWidth} 420`);
    
    // Dark background
    svg.append("rect")
      .attr("width", containerWidth)
      .attr("height", 420)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create tree layout
    const tree = d3.tree()
      .size([height, width]);
    
    // Create tree data
    const root = d3.hierarchy(createTreeData(number + 1));
    root.x0 = height / 2;
    root.y0 = 0;
    
    treeDataRef.current = root;
    
    
    function update(source, duration = 750) {
      // Compute tree layout
      const treeData = tree(root);
      const nodes = treeData.descendants();
      const links = treeData.links();
      
      // Normalize for fixed-depth
      nodes.forEach(d => {
        d.y = d.depth * (width / Math.max(1, number));
      });
      
      // Handle combinations - group nodes with same letters
      if (combinations) {
        const groups = new Map();
        
        nodes.forEach(node => {
          if (node.data.name) {
            const key = hashAnagram(node.data.name);
            if (!groups.has(key)) {
              groups.set(key, []);
            }
            groups.get(key).push(node);
          }
        });
        
        // Average positions for grouped nodes
        groups.forEach((groupNodes) => {
          if (groupNodes.length > 1) {
            const avgX = groupNodes.reduce((sum, n) => sum + n.x, 0) / groupNodes.length;
            const avgX0 = groupNodes.reduce((sum, n) => sum + (n.x0 || n.x), 0) / groupNodes.length;
            
            groupNodes.forEach((node, i) => {
              node._originalX = node.x;
              node.x = avgX;
              node.x0 = avgX0;
              node._top = i === 0; // Only first node in group shows label
            });
          }
        });
      } else {
        // Reset positions for permutations
        nodes.forEach(node => {
          if (node._originalX !== undefined) {
            node.x = node._originalX;
          }
          node._top = true;
        });
      }
      
      // Update nodes
      const node = g.selectAll("g.node")
        .data(nodes, d => d.data.name || Math.random());
      
      // Enter new nodes
      const nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", d => {
          const parent = d.parent || source;
          return `translate(${parent.y0},${parent.x0})`;
        });
      
      // Add circles for each letter
      nodeEnter.each(function(d) {
        const letters = d.data.name.split('');
        const nodeColors = [
          colorScheme.chart.primary,
          colorScheme.chart.secondary,
          colorScheme.chart.tertiary,
          '#f59e42',
          '#38bdf8',
          '#f472b6',
          '#a3e635',
          '#facc15'
        ];
        
        letters.forEach((letter, i) => {
          d3.select(this).append("circle")
            .attr("r", 1e-6)
            .attr("cx", i * 10)
            .attr("fill", nodeColors[letter.charCodeAt(0) - 65])
            .attr("stroke", "white")
            .attr("stroke-width", 1);
        });
      });
      
      // Add click handler for selection mode
      if (showSelectionMode) {
        nodeEnter
          .style("cursor", "pointer")
          .on("click", function(_, d) {
            if (d.data.name.length === number) { // Only allow selecting complete permutations
              const nodeId = d.data.name;
              const newSelected = selectedNodes.includes(nodeId)
                ? selectedNodes.filter(n => n !== nodeId)
                : [...selectedNodes, nodeId];
              setSelectedNodes(newSelected);
              
              // Update visual feedback
              d3.select(this).select("circle")
                .attr("stroke", newSelected.includes(nodeId) ? "#facc15" : "white")
                .attr("stroke-width", newSelected.includes(nodeId) ? 3 : 1);
            }
          });
      }
      
      // Add text labels
      nodeEnter.append("text")
        .attr("x", -10)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(d => d.data.name)
        .style("fill", colors.chart.text)
        .style("font-size", "12px")
        .style("font-weight", "500")
        .style("fill-opacity", 1e-6);
      
      // Transition nodes to new position
      const nodeUpdate = node.merge(nodeEnter).transition()
        .duration(duration)
        .attr("transform", d => `translate(${d.y},${d.x})`);
      
      nodeUpdate.selectAll("circle")
        .attr("r", 5)
        .attr("stroke", d => selectedNodes.includes(d.data.name) ? "#facc15" : "white")
        .attr("stroke-width", d => selectedNodes.includes(d.data.name) ? 3 : 1);
      
      nodeUpdate.select("text")
        .style("fill-opacity", d => d._top ? 1 : 1e-6);
      
      // Remove exiting nodes
      const nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", d => {
          const parent = d.parent || source;
          return `translate(${parent.y},${parent.x})`;
        })
        .remove();
      
      nodeExit.selectAll("circle")
        .attr("r", 1e-6);
      
      nodeExit.select("text")
        .style("fill-opacity", 1e-6);
      
      // Update links
      const link = g.selectAll("path.link")
        .data(links, d => d.target.data.name);
      
      // Enter new links
      const linkEnter = link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", colors.chart.grid)
        .attr("stroke-width", 2)
        .attr("d", () => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal(o, o);
        });
      
      // Transition links
      link.merge(linkEnter).transition()
        .duration(duration)
        .attr("d", d => diagonal(d.source, d.target));
      
      // Remove exiting links
      link.exit().transition()
        .duration(duration)
        .attr("d", () => {
          const o = { x: source.x, y: source.y };
          return diagonal(o, o);
        })
        .remove();
      
      // Store positions for next transition
      nodes.forEach(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }
    
    // Diagonal link generator
    function diagonal(s, d) {
      return `M ${s.y} ${s.x}
              C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`;
    }
    
    // Initial render
    update(root, 0);
    
  }, [size, number, combinations, showSelectionMode, selectedNodes]);
  
  // Update number of selected items
  function updateNumber(newNumber) {
    if (newNumber === number || newNumber < 0 || newNumber > size) return;
    
    setNumber(newNumber);
    setTotalCalculations(prev => prev + 1);
  }

  return (
    <VisualizationContainer title="Counting Techniques: Permutations and Combinations" className="p-2">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Explore how permutations and combinations work through interactive tree diagrams. 
              See how order matters in permutations but not in combinations.
            </p>
            <div className="mt-2 p-2 bg-neutral-800 rounded text-xs">
              <div className="text-neutral-300 mb-1">
                <strong>Permutations:</strong> Order matters (AB ≠ BA)
              </div>
              <div className="text-neutral-300">
                <strong>Combinations:</strong> Order doesn't matter (AB = BA)
              </div>
            </div>
          </VisualizationSection>

          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Controls</h4>
            
            {/* Mode selection */}
            <div className="mb-4">
              <label className="text-sm text-neutral-300 mb-2 block">Counting Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCombinations(false)}
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
                  onClick={() => setCombinations(true)}
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
            <div className="mb-4">
              <label className="text-sm text-neutral-300 mb-2 block">Total Items (n)</label>
              <div className="flex gap-2">
                {[3, 4, 5, 6].map(n => (
                  <button
                    key={n}
                    onClick={() => {
                      setSize(n);
                      setNumber(Math.min(number, n));
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
          </VisualizationSection>

          {/* Calculation Display */}
          <VisualizationSection className="p-3">
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
            <div className="mt-3">
              <label className="text-sm text-neutral-300 mb-2 block">Select r (click row):</label>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-neutral-400">
                    <th className="text-left p-2">r</th>
                    <th className="text-right p-2">{combinations ? 'C' : 'P'}({size}, r)</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3, 4].filter(r => r <= size).map(r => (
                    <tr
                      key={r}
                      onClick={() => updateNumber(r)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        r === number
                          ? "bg-yellow-600/20 text-white"
                          : "hover:bg-neutral-700 text-neutral-300"
                      )}
                    >
                      <td className="p-2">{r}</td>
                      <td className="text-right p-2 font-mono">
                        {combinations ? nCr(size, r) : nPr(size, r)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

          {/* Interactive Selection Mode */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Interactive Mode</h4>
            
            <label className="flex items-center gap-2 text-sm mb-3">
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
              <div className="space-y-2">
                <div className="text-xs text-neutral-300">
                  Click on leaf nodes to select/deselect {combinations ? 'combinations' : 'permutations'}.
                </div>
                
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
              </div>
            )}
          </VisualizationSection>

          {/* Learning Insights */}
          <VisualizationSection className="p-3">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Counting Insights</h4>
            <div className="space-y-2 text-xs text-neutral-300">
              {totalCalculations === 0 && (
                <div>
                  <p>🎯 Ready to explore counting techniques?</p>
                  <p className="text-purple-300 mt-1">
                    Click on the table rows to see how the tree expands!
                  </p>
                </div>
              )}
              {totalCalculations > 0 && totalCalculations < 5 && (
                <div>
                  <p>📊Notice how the tree branches represent choices:</p>
                  <ul className="ml-3 mt-1 space-y-1">
                    <li>• Each level represents selecting one more item</li>
                    <li>• Branches show all possible selections</li>
                  </ul>
                </div>
              )}
              {totalCalculations >= 5 && totalCalculations < 10 && (
                <div>
                  <p>🎓 Compare permutations vs combinations:</p>
                  <ul className="ml-3 mt-1 space-y-1">
                    <li>• Permutations: Each path is unique (AB ≠ BA)</li>
                    <li>• Combinations: Paths with same letters merge</li>
                    <li>• C(n,r) ≤ P(n,r) always!</li>
                  </ul>
                </div>
              )}
              {totalCalculations >= 10 && (
                <div>
                  <p className="text-green-400 font-semibold mb-1">
                    ✨ Counting Expert! You've explored {totalCalculations} calculations.
                  </p>
                  <p>Key insight: P(n,r) = r! × C(n,r) - Can you see why from the tree?</p>
                </div>
              )}
              
              {/* Progress tracker */}
              {totalCalculations > 0 && (
                <ProgressTracker 
                  current={totalCalculations} 
                  goal={15} 
                  label="Exploration Progress"
                  color="purple"
                />
              )}
              
              {combinations && number === 2 && (
                <p className="text-blue-400 mt-2">
                  💡 Notice how AB and BA merge into one branch in combinations mode!
                </p>
              )}
            </div>
          </VisualizationSection>
        </div>

        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3">
          <GraphContainer height="450px">
            <h4 className="text-sm font-semibold text-white mb-2 px-4 pt-3">
              {combinations ? 'Combination' : 'Permutation'} Tree
              <span className="text-xs font-normal text-gray-400 ml-2">
                ({getCount()} {combinations ? 'combinations' : 'permutations'})
              </span>
            </h4>
            <svg ref={svgRef} style={{ width: "100%", height: 420 }} />
          </GraphContainer>
        </div>
      </div>
      
      {/* Worked Example */}
      {showWorkedExample && (
        <VisualizationSection divider className="mt-4">
          <PermCombWorkedExample n={size} r={number} isPermutation={!combinations} />
        </VisualizationSection>
      )}
    </VisualizationContainer>
  );
}

export default CountingTechniques;