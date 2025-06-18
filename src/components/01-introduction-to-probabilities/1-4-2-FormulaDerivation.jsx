"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import { colors, typography, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { ProgressBar, ProgressNavigation } from '../ui/ProgressBar';
import { ChevronRight, Calculator } from 'lucide-react';

const colorScheme = createColorScheme('probability');

function FormulaDerivation({ n = 6, r = 3 }) {
  const [stage, setStage] = useState(0);
  const visualRef = useRef(null);
  const maxStages = 5;
  
  // Helper functions
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
  
  const permutationValue = n >= r ? factorial(n) / factorial(n - r) : 0;
  const combinationValue = combination(n, r);
  
  // Generate sample items for visualization
  const items = Array.from({ length: Math.min(n, 8) }, (_, i) => i + 1);
  const sampleSet = items.slice(0, Math.min(r, 4));
  
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
  
  const samplePermutations = r <= 4 ? generatePermutations(sampleSet) : [];
  
  // Visualization effect
  useEffect(() => {
    if (!visualRef.current) return;
    
    const svg = d3.select(visualRef.current);
    svg.selectAll("*").remove();
    
    const width = visualRef.current.clientWidth;
    const height = 200;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent");
    
    const g = svg.append("g")
      .attr("transform", `translate(${width/2}, ${height/2})`);
    
    // Stage-specific visualizations
    if (stage === 1 && r <= 4) {
      // Show all permutations
      const cols = Math.min(samplePermutations.length, 6);
      const rows = Math.ceil(samplePermutations.length / cols);
      const boxWidth = 60;
      const boxHeight = 30;
      const spacing = 10;
      
      samplePermutations.forEach((perm, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = (col - cols/2 + 0.5) * (boxWidth + spacing);
        const y = (row - rows/2 + 0.5) * (boxHeight + spacing);
        
        const group = g.append("g")
          .attr("transform", `translate(${x}, ${y})`);
        
        group.append("rect")
          .attr("x", -boxWidth/2)
          .attr("y", -boxHeight/2)
          .attr("width", boxWidth)
          .attr("height", boxHeight)
          .attr("fill", "#1f2937")
          .attr("stroke", colorScheme.chart.secondary)
          .attr("stroke-width", 1)
          .attr("rx", 4);
        
        group.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", colorScheme.chart.secondary)
          .style("font-size", "14px")
          .style("font-family", "monospace")
          .text(perm.join(','));
      });
      
      // Label
      g.append("text")
        .attr("y", -height/2 + 20)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.text)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .text(`All ${samplePermutations.length} permutations of {${sampleSet.join(',')}}`);
        
    } else if (stage === 2 && r <= 4) {
      // Group by combination
      const groupWidth = 120;
      const groupHeight = 80;
      const itemHeight = 20;
      
      const combinationGroup = g.append("g");
      
      // Combination box
      combinationGroup.append("rect")
        .attr("x", -groupWidth/2)
        .attr("y", -groupHeight/2)
        .attr("width", groupWidth)
        .attr("height", groupHeight)
        .attr("fill", "#1e3a8a")
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 2)
        .attr("rx", 8);
      
      // Combination label
      combinationGroup.append("text")
        .attr("y", -groupHeight/2 + 20)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font-family", "monospace")
        .text(`{${sampleSet.join(',')}}`);
      
      // Show collapsed permutations
      combinationGroup.append("text")
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.tertiary)
        .style("font-size", "12px")
        .text(`${samplePermutations.length} arrangements`);
      
      combinationGroup.append("text")
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.text)
        .style("font-size", "12px")
        .text(`= ${r}!`);
      
      // Animation
      combinationGroup
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", 1);
        
    } else if (stage === 3) {
      // Show division
      const formulaY = -30;
      
      g.append("text")
        .attr("y", formulaY)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.secondary)
        .style("font-size", "18px")
        .style("font-family", "monospace")
        .text(`${permutationValue}`);
      
      g.append("line")
        .attr("x1", -40)
        .attr("x2", 40)
        .attr("y1", formulaY + 15)
        .attr("y2", formulaY + 15)
        .attr("stroke", colors.chart.text)
        .attr("stroke-width", 2);
      
      g.append("text")
        .attr("y", formulaY + 35)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.tertiary)
        .style("font-size", "18px")
        .style("font-family", "monospace")
        .text(`${factorial(r)}`);
      
      g.append("text")
        .attr("y", formulaY + 65)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "24px")
        .style("font-family", "monospace")
        .style("font-weight", "bold")
        .text(`= ${combinationValue}`);
        
    } else if (stage === 4) {
      // Properties visualization
      const propertyBoxWidth = 150;
      const propertyBoxHeight = 60;
      const spacing = 20;
      
      // Symmetry property
      const symmetryGroup = g.append("g")
        .attr("transform", `translate(${-propertyBoxWidth/2 - spacing/2}, 0)`);
      
      symmetryGroup.append("rect")
        .attr("x", -propertyBoxWidth/2)
        .attr("y", -propertyBoxHeight/2)
        .attr("width", propertyBoxWidth)
        .attr("height", propertyBoxHeight)
        .attr("fill", "#4c1d95")
        .attr("stroke", "#7c3aed")
        .attr("stroke-width", 2)
        .attr("rx", 8);
      
      symmetryGroup.append("text")
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Symmetry");
      
      symmetryGroup.append("text")
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .attr("fill", "#e9d5ff")
        .style("font-size", "11px")
        .style("font-family", "monospace")
        .text(`C(${n},${r}) = C(${n},${n-r})`);
      
      // Pascal's property
      const pascalGroup = g.append("g")
        .attr("transform", `translate(${propertyBoxWidth/2 + spacing/2}, 0)`);
      
      pascalGroup.append("rect")
        .attr("x", -propertyBoxWidth/2)
        .attr("y", -propertyBoxHeight/2)
        .attr("width", propertyBoxWidth)
        .attr("height", propertyBoxHeight)
        .attr("fill", "#064e3b")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 2)
        .attr("rx", 8);
      
      pascalGroup.append("text")
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Pascal's Triangle");
      
      pascalGroup.append("text")
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .attr("fill", "#d1fae5")
        .style("font-size", "10px")
        .style("font-family", "monospace")
        .text(`C(${n-1},${r-1})+C(${n-1},${r})`);
    }
    
  }, [stage, n, r, sampleSet, samplePermutations, permutationValue, combinationValue]);
  
  return (
    <div className="h-full flex flex-col p-4">
      {/* Progress Bar */}
      <div className="mb-4">
        <ProgressBar
          current={stage + 1}
          total={maxStages}
          label="Formula Derivation"
          variant="purple"
        />
      </div>
      
      {/* Content Area - Split View */}
      <div className="flex-1 flex gap-4">
        {/* Left: Visual (40%) */}
        <div className="w-2/5 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl p-4">
          <svg ref={visualRef} className="w-full h-full" />
        </div>
        
        {/* Right: Mathematical Content (60%) */}
        <div className="flex-1 overflow-y-auto pr-2">
          {/* Stage 0: Problem Setup */}
          {stage === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400">The Problem</h3>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-300 mb-3">
                  Count the number of ways to choose <span className="font-mono text-green-400">{r}</span> items 
                  from <span className="font-mono text-cyan-400">{n}</span> items where 
                  <span className="font-bold text-yellow-400"> order doesn't matter</span>.
                </p>
                <div className="bg-gray-900/50 rounded p-3">
                  <p className="text-xs text-gray-400 mb-2">Example with n={n}, r={r}:</p>
                  <p className="font-mono text-sm text-gray-300">
                    Choosing {r} from [{items.slice(0, Math.min(n, 6)).join(', ')}{n > 6 && ', ...'}]
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Sets like {`{1,2,3}`} and {`{3,2,1}`} are considered the same
                  </p>
                </div>
              </div>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-blue-300">
                  <span className="font-semibold">Goal:</span> Derive the formula C(n,r) = n!/(r!(n-r)!)
                </p>
              </div>
            </div>
          )}
          
          {/* Stage 1: Show All Permutations */}
          {stage === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400">Step 1: Count All Arrangements</h3>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-300 mb-3">
                  First, let's count arrangements where order <span className="font-bold text-green-400">does matter</span> (permutations):
                </p>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">P({n},{r})</span>
                    <span className="text-gray-500">=</span>
                    <span className="text-gray-300">{n} × {n-1} × ... × {n-r+1}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-12">
                    <span className="text-gray-500">=</span>
                    <span className="text-gray-300">{n}! / {n-r}!</span>
                  </div>
                  <div className="flex items-center gap-2 ml-12">
                    <span className="text-gray-500">=</span>
                    <span className="text-lg text-green-400 font-bold">{formatNumber(permutationValue)}</span>
                  </div>
                </div>
              </div>
              {r <= 4 && (
                <div className="bg-gray-900/50 rounded p-3">
                  <p className="text-xs text-gray-400">
                    Visual shows all {samplePermutations.length} permutations of the set {`{${sampleSet.join(',')}}`}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Stage 2: Group by Combination */}
          {stage === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-400">Step 2: Identify Duplicates</h3>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-300 mb-3">
                  Each unique combination appears <span className="font-mono text-purple-400">{r}!</span> times 
                  in our permutation count:
                </p>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
                  <p className="text-sm text-purple-300 mb-2">
                    <span className="font-semibold">Key insight:</span> The {r} items can be arranged in {r}! = {factorial(r)} ways
                  </p>
                  <p className="font-mono text-xs text-gray-400">
                    {r}! = {Array.from({length: r}, (_, i) => r - i).join(' × ')} = {factorial(r)}
                  </p>
                </div>
              </div>
              {r <= 4 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Example permutations that represent the same combination:</p>
                  <div className="flex flex-wrap gap-2">
                    {samplePermutations.slice(0, Math.min(6, factorial(r))).map((perm, idx) => (
                      <span key={idx} className="font-mono text-xs bg-gray-700/50 px-2 py-1 rounded">
                        ({perm.join(',')})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Stage 3: Derive Formula */}
          {stage === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400">Step 3: The Formula</h3>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-300 mb-3">
                  Since each combination is counted {r}! times:
                </p>
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400">C({n},{r})</span>
                    <span className="text-gray-500">=</span>
                    <span className="text-gray-300">P({n},{r}) / {r}!</span>
                  </div>
                  <div className="flex items-center gap-2 ml-12">
                    <span className="text-gray-500">=</span>
                    <span className="text-gray-300">{n}! / ({n-r}! × {r}!)</span>
                  </div>
                  <div className="flex items-center gap-2 ml-12">
                    <span className="text-gray-500">=</span>
                    <span className="text-gray-300">{formatNumber(permutationValue)} / {factorial(r)}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-12">
                    <span className="text-gray-500">=</span>
                    <span className="text-xl text-cyan-400 font-bold">{formatNumber(combinationValue)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-sm text-yellow-300">
                  This is the binomial coefficient, often written as 
                  <span className="font-mono mx-1">C(n,r)</span>, 
                  <span className="font-mono mx-1">nCr</span>, or 
                  <span className="font-mono mx-1">(n choose r)</span>
                </p>
              </div>
            </div>
          )}
          
          {/* Stage 4: Properties */}
          {stage === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-yellow-400">Step 4: Key Properties</h3>
              <div className="space-y-3">
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-purple-400 mb-2">Symmetry Property</h4>
                  <p className="font-mono text-sm">
                    C({n},{r}) = C({n},{n-r}) = {combinationValue}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Choosing {r} to include = Choosing {n-r} to exclude
                  </p>
                </div>
                
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-green-400 mb-2">Pascal's Triangle</h4>
                  <p className="font-mono text-sm">
                    C({n},{r}) = C({n-1},{r-1}) + C({n-1},{r})
                  </p>
                  {n > 1 && r > 0 && r < n && (
                    <p className="font-mono text-xs text-gray-400 mt-1">
                      {combinationValue} = {combination(n-1, r-1)} + {combination(n-1, r)}
                    </p>
                  )}
                </div>
                
                <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-orange-400 mb-2">Boundary Cases</h4>
                  <div className="font-mono text-xs space-y-1">
                    <p>C(n,0) = 1 (one way to choose nothing)</p>
                    <p>C(n,n) = 1 (one way to choose everything)</p>
                    <p>C(n,r) = 0 when r {'>'} n</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="mt-4">
        <ProgressNavigation
          current={stage + 1}
          total={maxStages}
          onPrevious={() => setStage(Math.max(0, stage - 1))}
          onNext={() => setStage(Math.min(maxStages - 1, stage + 1))}
          variant="purple"
        />
      </div>
    </div>
  );
}

export default FormulaDerivation;