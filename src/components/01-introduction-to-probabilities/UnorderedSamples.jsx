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
import { ProgressTracker } from '../ui/ProgressTracker';

// Use probability color scheme
const colorScheme = createColorScheme('probability');

// Worked Example Component
const LottoWorkedExample = memo(function LottoWorkedExample() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    // MathJax timeout pattern
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          console.error('MathJax error:', err);
        });
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <div ref={contentRef} style={{
      backgroundColor: '#2A303C',
      padding: '1.5rem',
      borderRadius: '8px',
      color: '#e0e0e0',
      marginTop: '1rem'
    }}>
      <h4 style={{ fontSize: '1.125rem', fontWeight: '600', borderBottom: '1px solid #4A5568', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        Example: Lotto 6/49
      </h4>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>Problem:</p>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
          In how many ways can 6 balls be drawn from 49 numbered balls?
        </p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>Key insight:</p>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
          Order doesn&apos;t matter in lottery! {`{1,2,3,4,5,6}`} = {`{6,5,4,3,2,1}`}
        </p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>Solution:</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[
          C_{49}^6 = \\binom{49}{6} = \\frac{49!}{6! \\times 43!}
        \\]` }} />
        <div dangerouslySetInnerHTML={{ __html: `\\[
          = \\frac{49 \\times 48 \\times 47 \\times 46 \\times 45 \\times 44}{6 \\times 5 \\times 4 \\times 3 \\times 2 \\times 1}
        \\]` }} />
        <div dangerouslySetInnerHTML={{ __html: `\\[
          = \\frac{10,068,347,520}{720} = 13,983,816
        \\]` }} />
      </div>
      
      <div style={{ backgroundColor: '#1A202C', padding: '1rem', borderRadius: '4px', fontSize: '0.875rem' }}>
        <strong>Interpretation:</strong> There are 13,983,816 different ways to choose 6 numbers from 49.
        <div style={{ marginTop: '0.5rem' }}>
          Your chance of winning with one ticket: \(\frac{1}{13,983,816} \approx 0.0000071\%\)
        </div>
      </div>
    </div>
  );
});

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
    
    // Generate Pascal's triangle values
    const triangle = [];
    for (let n = 0; n < rows; n++) {
      triangle[n] = [];
      for (let r = 0; r <= n; r++) {
        if (r === 0 || r === n) {
          triangle[n][r] = 1;
        } else {
          triangle[n][r] = triangle[n-1][r-1] + triangle[n-1][r];
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
  const [showLottoExample, setShowLottoExample] = useState(false);
  const [visualMode, setVisualMode] = useState('selection'); // 'selection' or 'identity'
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [calculationSteps, setCalculationSteps] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  
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
      .attr("transform", `translate(${width/2}, ${height/2})`);
    
    if (visualMode === 'selection') {
      // Draw items in a circle
      const radius = Math.min(width, height) * 0.35;
      const itemRadius = Math.min(30, radius / n * 1.5);
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
            setCalculationSteps(prev => prev + 1);
            setInteractionCount(prev => prev + 1);
          });
        
        group.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", isSelected ? "white" : colors.chart.text)
          .style("font-size", "16px")
          .style("font-weight", "600")
          .style("pointer-events", "none")
          .text(item);
      });
      
      // Center text
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-1em")
        .attr("fill", colors.chart.text)
        .style("font-size", "18px")
        .style("font-weight", "600")
        .text(`Select ${r} items`);
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1em")
        .attr("fill", colorScheme.chart.secondary)
        .style("font-size", "16px")
        .text(`${selectedItems.size} / ${r} selected`);
      
    } else {
      // Show binomial coefficient identity
      const fontSize = 24;
      const spacing = 40;
      
      // C(n,r) = C(n,n-r)
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -spacing)
        .attr("fill", colors.chart.text)
        .style("font-size", fontSize + "px")
        .style("font-weight", "600")
        .text(`C(${n},${r}) = C(${n},${n-r})`);
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 0)
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", fontSize + "px")
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
    
  }, [n, r, visualMode, selectedItems]);
  
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
              coefficient C(n,r) or \(\binom{`{n}`}{`{r}`}\) counts the number of ways to 
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
                    setInteractionCount(prev => prev + 1);
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
                    setInteractionCount(prev => prev + 1);
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
                    setInteractionCount(prev => prev + 1);
                  }}
                  className={cn(
                    "flex-1 px-3 py-2 rounded text-sm font-medium transition-colors",
                    visualMode === 'selection'
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  Selection
                </button>
                <button
                  onClick={() => {
                    setVisualMode('identity');
                    setInteractionCount(prev => prev + 1);
                  }}
                  className={cn(
                    "flex-1 px-3 py-2 rounded text-sm font-medium transition-colors",
                    visualMode === 'identity'
                      ? "bg-green-600 text-white"
                      : "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  Identity
                </button>
              </div>
            </div>
            
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
            
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={showLottoExample} 
                onChange={e => setShowLottoExample(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-neutral-300">Show Lotto 6/49 example</span>
            </label>
          </VisualizationSection>

          {/* Calculation */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Calculation</h4>
            
            <div className="bg-neutral-800 rounded-lg p-3 border border-yellow-600/50">
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-yellow-400 mb-2">
                  C({n},{r}) = {nCr(n, r)}
                </div>
                <div className="text-sm text-neutral-300 space-y-1">
                  <div>{n}! / ({r}! × {n-r}!) = {nCr(n, r)}</div>
                  {r <= 3 && (
                    <div className="text-xs">
                      = {Array.from({length: r}, (_, i) => n-i).join(' × ')} / {Array.from({length: r}, (_, i) => r-i).join(' × ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Show some combinations */}
            {n <= 6 && r <= 3 && r > 0 && (
              <div className="mt-3">
                <h5 className="text-sm font-semibold text-neutral-300 mb-2">
                  All {nCr(n, r)} combinations:
                </h5>
                <div className="grid grid-cols-3 gap-1 text-xs font-mono text-neutral-400">
                  {getAllCombinations().map((combo, i) => (
                    <div key={i}>{`{${combo.join(',')}}`}</div>
                  ))}
                </div>
              </div>
            )}
          </VisualizationSection>

          {/* Learning Progress */}
          <VisualizationSection className="p-3">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Combination Insights</h4>
            
            <ProgressTracker 
              current={interactionCount} 
              goal={25} 
              label="Total Interactions"
              color="purple"
            />
            
            <div className="space-y-2 text-xs text-neutral-300 mt-3">
              {interactionCount === 0 && (
                <div>
                  <p>🎯 Ready to explore combinations?</p>
                  <p className="text-purple-300 mt-1">
                    Try clicking items in selection mode to see combinations in action!
                  </p>
                </div>
              )}
              {interactionCount > 0 && interactionCount < 5 && (
                <div>
                  <p>📊 Key difference from permutations:</p>
                  <ul className="ml-3 mt-1 space-y-1">
                    <li>• {`{1,2,3}`} = {`{3,2,1}`} = {`{2,1,3}`} (all the same)</li>
                    <li>• Only the items matter, not their order</li>
                  </ul>
                </div>
              )}
              {interactionCount >= 5 && interactionCount < 10 && (
                <div>
                  <p>🎓 Pascal&apos;s Triangle connection:</p>
                  <p className="mt-1">
                    Row n of Pascal&apos;s Triangle contains all C(n,r) values!
                    {showPascal && " See it highlighted below."}
                  </p>
                </div>
              )}
              {interactionCount >= 10 && interactionCount < 25 && (
                <div>
                  <p>🔥 Great progress! Notice these patterns:</p>
                  <ul className="ml-3 mt-1 space-y-1">
                    <li>• C(n,0) = C(n,n) = 1 always</li>
                    <li>• C(n,r) = C(n,n-r) symmetry</li>
                    <li>• When r {">"} n/2, use C(n,n-r) for easier calculation</li>
                  </ul>
                </div>
              )}
              {interactionCount >= 25 && (
                <div>
                  <p className="text-green-400 font-semibold mb-1">
                    ✨ Combination Master! {interactionCount} interactions.
                  </p>
                  <p>Fun fact: C(n,r) = C(n,n-r) - choosing what to include = choosing what to exclude!</p>
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>

        {/* Right Panel */}
        <div className="lg:w-2/3 space-y-4">
          <GraphContainer height="450px">
            <svg ref={svgRef} style={{ width: "100%", height: 450 }} />
          </GraphContainer>
          
          {showPascal && (
            <div className="bg-neutral-800 rounded-lg p-4">
              <h4 className="text-base font-bold text-white mb-3">Pascal&apos;s Triangle</h4>
              <PascalsTriangle rows={8} highlightN={n} highlightR={r} />
              <p className="text-xs text-neutral-400 mt-2">
                C({n},{r}) is highlighted in row {n}, position {r}
              </p>
            </div>
          )}
          
          {showLottoExample && <LottoWorkedExample />}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default UnorderedSamples;