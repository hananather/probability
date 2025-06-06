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

function InteractiveLottery() {
  const [totalBalls, setTotalBalls] = useState(49);
  const [pickCount, setPickCount] = useState(6);
  const [selectedNumbers, setSelectedNumbers] = useState(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [showDerivation, setShowDerivation] = useState(true);
  const [derivationStep, setDerivationStep] = useState(0);
  const svgRef = useRef(null);
  const derivationRef = useRef(null);
  
  // Calculate combinations
  function nCr(n, r) {
    if (r > n || r < 0) return 0;
    if (r === 0 || r === n) return 1;
    
    let result = 1;
    for (let i = 0; i < r; i++) {
      result = result * (n - i) / (i + 1);
    }
    return Math.round(result);
  }
  
  const totalCombinations = nCr(totalBalls, pickCount);
  const odds = 1 / totalCombinations;
  const costToGuaranteeWin = totalCombinations * 2; // Assuming $2 per ticket
  
  // Comparison data
  const comparisons = [
    { event: "Lightning Strike (yearly)", odds: 1/500000, color: colorScheme.chart.secondary },
    { event: "Shark Attack", odds: 1/3700000, color: colorScheme.chart.tertiary },
    { event: `Lottery (${pickCount}/${totalBalls})`, odds: odds, color: colorScheme.chart.primary },
    { event: "Meteor Hit", odds: 1/700000, color: colorScheme.chart.quaternary },
  ].sort((a, b) => b.odds - a.odds);
  
  // Main lottery visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 700;
    const height = 300;
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // Draw lottery balls
    const ballRadius = Math.min(25, width / (Math.min(totalBalls, 20) * 2.5));
    const cols = Math.min(totalBalls, 10);
    const rows = Math.ceil(Math.min(totalBalls, 50) / cols);
    
    const g = svg.append("g")
      .attr("transform", `translate(${width/2}, ${height/2})`);
    
    // Title
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -height/2 + 30)
      .attr("fill", colors.chart.text)
      .style("font-size", "20px")
      .style("font-weight", "600")
      .text(`Pick ${pickCount} Numbers from ${totalBalls}`);
    
    // Draw balls
    const ballsToShow = Math.min(totalBalls, 50);
    for (let i = 1; i <= ballsToShow; i++) {
      const row = Math.floor((i - 1) / cols);
      const col = (i - 1) % cols;
      const x = (col - cols/2 + 0.5) * (ballRadius * 2.2);
      const y = (row - rows/2 + 0.5) * (ballRadius * 2.2);
      
      const isSelected = selectedNumbers.has(i);
      
      const ball = g.append("g")
        .attr("transform", `translate(${x}, ${y})`);
      
      // Ball circle
      ball.append("circle")
        .attr("r", ballRadius)
        .attr("fill", isSelected ? colorScheme.chart.primary : "#1a1a1a")
        .attr("stroke", isSelected ? colorScheme.chart.primary : colors.chart.grid)
        .attr("stroke-width", 2)
        .attr("cursor", "pointer")
        .on("click", () => {
          const newSelected = new Set(selectedNumbers);
          if (newSelected.has(i)) {
            newSelected.delete(i);
          } else if (newSelected.size < pickCount) {
            newSelected.add(i);
          }
          setSelectedNumbers(newSelected);
        })
        .on("mouseover", function() {
          if (!isSelected) {
            d3.select(this)
              .attr("fill", "#2a2a2a")
              .attr("stroke", colorScheme.chart.primary);
          }
        })
        .on("mouseout", function() {
          if (!isSelected) {
            d3.select(this)
              .attr("fill", "#1a1a1a")
              .attr("stroke", colors.chart.grid);
          }
        });
      
      // Ball number
      ball.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", isSelected ? "white" : colors.chart.text)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("pointer-events", "none")
        .text(i);
    }
    
    if (totalBalls > 50) {
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", height/2 - 30)
        .attr("fill", colors.chart.text)
        .style("font-size", "14px")
        .text(`(Showing first 50 of ${totalBalls} balls)`);
    }
    
    // Selected numbers display
    if (selectedNumbers.size > 0) {
      const selectedArray = Array.from(selectedNumbers).sort((a, b) => a - b);
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", height/2 - 10)
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "18px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .text(`Your numbers: ${selectedArray.join(', ')}`);
    }
    
  }, [totalBalls, pickCount, selectedNumbers]);
  
  // Odds comparison visualization
  const comparisonRef = useRef(null);
  
  useEffect(() => {
    if (!comparisonRef.current || !showComparison) return;
    
    const svg = d3.select(comparisonRef.current);
    svg.selectAll("*").remove();
    
    const width = 700;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 150 };
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // Scales
    const x = d3.scaleLog()
      .domain([1e-8, 1e-3])
      .range([margin.left, width - margin.right]);
    
    const y = d3.scaleBand()
      .domain(comparisons.map(d => d.event))
      .range([margin.top, height - margin.bottom])
      .padding(0.3);
    
    // Bars
    svg.selectAll(".bar")
      .data(comparisons)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", margin.left)
      .attr("y", d => y(d.event))
      .attr("width", 0)
      .attr("height", y.bandwidth())
      .attr("fill", d => d.color)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr("width", d => x(d.odds) - margin.left);
    
    // Labels
    svg.selectAll(".label")
      .data(comparisons)
      .enter().append("text")
      .attr("class", "label")
      .attr("x", margin.left - 10)
      .attr("y", d => y(d.event) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px")
      .text(d => d.event);
    
    // Odds text
    svg.selectAll(".odds")
      .data(comparisons)
      .enter().append("text")
      .attr("class", "odds")
      .attr("x", d => x(d.odds) + 5)
      .attr("y", d => y(d.event) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("fill", colors.chart.text)
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .style("opacity", 0)
      .text(d => `1 in ${formatNumber(Math.round(1/d.odds))}`)
      .transition()
      .delay(1000)
      .duration(500)
      .style("opacity", 1);
    
  }, [showComparison, comparisons]);
  
  // Derivation visualization
  useEffect(() => {
    if (!derivationRef.current || !showDerivation) return;
    
    const svg = d3.select(derivationRef.current);
    svg.selectAll("*").remove();
    
    const width = 700;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${width/2}, ${margin.top})`);
    
    // Title
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 0)
      .attr("fill", colors.chart.text)
      .style("font-size", "16px")
      .style("font-weight", "600")
      .text(`Deriving C(${totalBalls}, ${pickCount})`);
    
    const stepY = 50;
    
    if (derivationStep === 0) {
      // Step 1: First choice
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", stepY)
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "18px")
        .style("font-weight", "600")
        .text("Step 1: First Number");
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", stepY + 30)
        .attr("fill", colors.chart.text)
        .style("font-size", "14px")
        .text(`You have ${totalBalls} choices for your first number`);
      
      // Visual representation
      const circleY = stepY + 70;
      for (let i = 0; i < Math.min(totalBalls, 10); i++) {
        g.append("circle")
          .attr("cx", (i - 4.5) * 40)
          .attr("cy", circleY)
          .attr("r", 15)
          .attr("fill", i === 0 ? colorScheme.chart.primary : "#1a1a1a")
          .attr("stroke", colorScheme.chart.primary)
          .attr("stroke-width", 2);
        
        g.append("text")
          .attr("x", (i - 4.5) * 40)
          .attr("y", circleY)
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", i === 0 ? "white" : colors.chart.text)
          .style("font-size", "12px")
          .style("font-family", "monospace")
          .text(i + 1);
      }
      
      if (totalBalls > 10) {
        g.append("text")
          .attr("x", 5.5 * 40)
          .attr("y", circleY)
          .attr("text-anchor", "middle")
          .attr("fill", colors.chart.text)
          .style("font-size", "14px")
          .text(`... ${totalBalls}`);
      }
      
      // Formula
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", circleY + 50)
        .attr("fill", colorScheme.chart.secondary)
        .style("font-size", "16px")
        .style("font-family", "monospace")
        .text(`Choices: ${totalBalls}`);
        
    } else if (derivationStep === 1) {
      // Step 2: Second choice
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", stepY)
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "18px")
        .style("font-weight", "600")
        .text("Step 2: Second Number");
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", stepY + 30)
        .attr("fill", colors.chart.text)
        .style("font-size", "14px")
        .text(`After picking one, you have ${totalBalls - 1} choices left`);
      
      // Show progression
      const formulaY = stepY + 70;
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", formulaY)
        .attr("fill", colors.chart.text)
        .style("font-size", "14px")
        .text("Continuing this pattern:");
      
      const choices = [];
      for (let i = 0; i < pickCount; i++) {
        choices.push(totalBalls - i);
      }
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", formulaY + 30)
        .attr("fill", colorScheme.chart.secondary)
        .style("font-size", "16px")
        .style("font-family", "monospace")
        .text(choices.join(" × ") + ` = ${choices.reduce((a, b) => a * b, 1).toLocaleString()}`);
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", formulaY + 60)
        .attr("fill", colors.chart.text)
        .style("font-size", "12px")
        .text("This gives us the number of permutations (order matters)");
        
    } else if (derivationStep === 2) {
      // Step 3: Order doesn't matter
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", stepY)
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "18px")
        .style("font-weight", "600")
        .text("Step 3: Order Doesn't Matter!");
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", stepY + 30)
        .attr("fill", colors.chart.text)
        .style("font-size", "14px")
        .text(`Each set of ${pickCount} numbers can be arranged in ${pickCount}! ways`);
      
      // Visual example
      const exampleY = stepY + 70;
      const example = [1, 2, 3].slice(0, Math.min(pickCount, 3));
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", exampleY)
        .attr("fill", colors.chart.text)
        .style("font-size", "14px")
        .text(`Example with {${example.join(",")}}: `);
      
      // Show different arrangements
      const arrangements = [
        [1, 2, 3], [1, 3, 2], [2, 1, 3], 
        [2, 3, 1], [3, 1, 2], [3, 2, 1]
      ].slice(0, Math.min(6, factorial(Math.min(pickCount, 3))));
      
      arrangements.forEach((arr, i) => {
        g.append("text")
          .attr("x", (i - 2.5) * 80)
          .attr("y", exampleY + 30)
          .attr("text-anchor", "middle")
          .attr("fill", colorScheme.chart.tertiary)
          .style("font-size", "12px")
          .style("font-family", "monospace")
          .text(`{${arr.join(",")}}`);
      });
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", exampleY + 60)
        .attr("fill", colorScheme.chart.secondary)
        .style("font-size", "14px")
        .text(`All ${factorial(Math.min(pickCount, 3))} arrangements = 1 combination`);
        
    } else if (derivationStep === 3) {
      // Step 4: Final formula
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", stepY)
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "18px")
        .style("font-weight", "600")
        .text("Step 4: The Formula");
      
      // Show division
      const formulaY = stepY + 50;
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", formulaY)
        .attr("fill", colors.chart.text)
        .style("font-size", "14px")
        .text("Total combinations = Permutations ÷ Redundant orderings");
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", formulaY + 35)
        .attr("fill", colorScheme.chart.secondary)
        .style("font-size", "16px")
        .style("font-family", "monospace")
        .text(`C(${totalBalls},${pickCount}) = ${totalBalls}×${totalBalls-1}×...×${totalBalls-pickCount+1} ÷ ${pickCount}!`);
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", formulaY + 70)
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "18px")
        .style("font-family", "monospace")
        .style("font-weight", "600")
        .text(`= ${formatNumber(totalCombinations)} combinations`);
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", formulaY + 100)
        .attr("fill", colors.chart.text)
        .style("font-size", "12px")
        .text(`That's why your odds are 1 in ${formatNumber(totalCombinations)}!`);
    }
    
  }, [showDerivation, derivationStep, totalBalls, pickCount, totalCombinations]);
  
  // Helper function for factorial
  function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  }
  
  return (
    <VisualizationContainer title="Interactive Lottery Simulator" className="mt-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Lottery Settings</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-neutral-300">Total balls (n)</label>
                  <span className="text-sm font-mono text-yellow-400">{totalBalls}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={totalBalls}
                  onChange={(e) => {
                    const newTotal = Number(e.target.value);
                    setTotalBalls(newTotal);
                    setPickCount(Math.min(pickCount, Math.floor(newTotal / 2)));
                    setSelectedNumbers(new Set());
                  }}
                  className="w-full"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-neutral-300">Numbers to pick (r)</label>
                  <span className="text-sm font-mono text-purple-400">{pickCount}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={Math.min(10, Math.floor(totalBalls / 2))}
                  value={pickCount}
                  onChange={(e) => {
                    setPickCount(Number(e.target.value));
                    setSelectedNumbers(new Set());
                  }}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={cn(
                  "w-full px-4 py-2 rounded font-medium transition-colors",
                  showComparison
                    ? "bg-green-600 text-white"
                    : "bg-neutral-700 hover:bg-neutral-600 text-white"
                )}
              >
                {showComparison ? "Hide" : "Show"} Odds Comparison
              </button>
            </div>
          </VisualizationSection>
          
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Understanding the Math</h4>
            
            <div className="mb-3">
              <button
                onClick={() => setShowDerivation(!showDerivation)}
                className={cn(
                  "w-full px-3 py-2 rounded text-sm font-medium transition-colors",
                  showDerivation
                    ? "bg-purple-600 text-white"
                    : "bg-neutral-700 hover:bg-neutral-600 text-white"
                )}
              >
                {showDerivation ? "Hide" : "Show"} Formula Derivation
              </button>
            </div>
            
            {showDerivation && (
              <div className="space-y-2 mb-4">
                <div className="text-sm text-neutral-300">
                  <p className="mb-2">Why <span className="font-mono">C({totalBalls},{pickCount})</span>?</p>
                  <button
                    onClick={() => setDerivationStep((prev) => (prev + 1) % 4)}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    Step {derivationStep + 1} of 4 →
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="bg-neutral-800 rounded-lg p-3 border border-red-600/50">
                <div className="text-center">
                  <div className="text-lg font-mono font-bold text-red-400">
                    1 in {formatNumber(totalCombinations)}
                  </div>
                  <div className="text-sm text-neutral-300 mt-1 font-mono">
                    {(odds * 100).toExponential(2)}% chance
                  </div>
                </div>
              </div>
              
              <div className="bg-neutral-800 rounded-lg p-3 border border-yellow-600/50">
                <div className="text-sm text-neutral-300">
                  <div className="text-yellow-400 font-semibold mb-1">To guarantee a win:</div>
                  <div className="font-mono">Buy all {formatNumber(totalCombinations)} combinations</div>
                  <div className="text-xl font-bold font-mono text-yellow-400 mt-1">
                    ${formatNumber(costToGuaranteeWin)}
                  </div>
                </div>
              </div>
              
              {selectedNumbers.size === pickCount && (
                <div className="bg-neutral-800 rounded-lg p-3 border border-purple-600/50">
                  <div className="text-sm">
                    <div className="text-purple-400 font-semibold mb-1">
                      Key insight:
                    </div>
                    <div className="text-neutral-300">
                      Your specific combination {`{${Array.from(selectedNumbers).sort((a,b) => a-b).join(',')}}`} has the same {(odds * 100).toExponential(2)}% chance as any other!
                    </div>
                  </div>
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>
        
        {/* Right Panel */}
        <div className="lg:w-2/3 space-y-4">
          {showDerivation ? (
            <GraphContainer height="320px">
              <svg ref={derivationRef} style={{ width: "100%", height: "100%" }} />
            </GraphContainer>
          ) : (
            <GraphContainer height="320px">
              <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
            </GraphContainer>
          )}
          
          {showComparison && !showDerivation && (
            <GraphContainer height="220px">
              <svg ref={comparisonRef} style={{ width: "100%", height: "100%" }} />
            </GraphContainer>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default InteractiveLottery;