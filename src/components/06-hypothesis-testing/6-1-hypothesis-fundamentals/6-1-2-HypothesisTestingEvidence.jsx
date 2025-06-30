"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../../lib/design-system';
import { Button } from '../../ui/button';

// Use hypothesis color scheme for consistency
const colorScheme = createColorScheme('hypothesis');

export default function HypothesisTestingEvidence() {
  // Core state
  const [rolls, setRolls] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [autoRoll, setAutoRoll] = useState(false);
  const [currentFace, setCurrentFace] = useState(null);
  
  // Refs for D3 visualizations
  const barsRef = useRef(null);
  const meterRef = useRef(null);
  
  // Constants
  const MAX_ROLLS = 100;
  const EXPECTED_FREQ = 1/6;
  
  // Calculate derived values
  const counts = rolls.reduce((acc, val) => {
    acc[val - 1]++;
    return acc;
  }, [0, 0, 0, 0, 0, 0]);
  
  const chiSquare = rolls.length > 0 ? calculateChiSquare(counts, rolls.length) : 0;
  const pValue = rolls.length > 0 ? 1 - jStat.chisquare.cdf(chiSquare, 5) : 1;
  const stage = getStage(rolls.length);
  const insight = getInsight(rolls.length, pValue);
  
  // Unicode die faces
  const dieFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  
  // Calculate chi-square statistic
  function calculateChiSquare(counts, totalRolls) {
    if (totalRolls === 0) return 0;
    const expected = totalRolls * EXPECTED_FREQ;
    return counts.reduce((sum, observed) => {
      const diff = observed - expected;
      return sum + (diff * diff) / expected;
    }, 0);
  }
  
  // Get current stage based on roll count
  function getStage(rollCount) {
    if (rollCount === 0) return 0;
    if (rollCount < 10) return 1;
    if (rollCount < 30) return 2;
    if (rollCount < 60) return 3;
    return 4;
  }
  
  // Get contextual insight based on state
  function getInsight(rollCount, pValue) {
    if (rollCount === 0) {
      return {
        title: "Test the Die",
        content: "Roll the die to test if it's fair. A fair die should show each face about 1/6 of the time.",
        color: "#14b8a6" // teal
      };
    }
    
    if (rollCount < 10) {
      return {
        title: "Too Early to Tell",
        content: "With few rolls, even a fair die looks unfair. Randomness is lumpy!",
        color: "#8b5cf6" // purple
      };
    }
    
    if (rollCount < 30) {
      if (pValue < 0.1) {
        return {
          title: "Something Seems Off...",
          content: `P-value: ${pValue.toFixed(3)}. Pattern emerging, but need more data to be sure.`,
          color: "#f59e0b" // amber
        };
      }
      return {
        title: "Looking Normal So Far",
        content: `P-value: ${pValue.toFixed(3)}. No strong evidence against fairness yet.`,
        color: "#14b8a6" // teal
      };
    }
    
    if (rollCount < 60) {
      if (pValue < 0.05) {
        return {
          title: "Evidence Building",
          content: `P-value: ${pValue.toFixed(3)}. Statistical evidence suggests this die might be loaded.`,
          color: "#f59e0b" // amber
        };
      }
      if (pValue < 0.1) {
        return {
          title: "Borderline Case",
          content: `P-value: ${pValue.toFixed(3)}. On the edge - collect more data!`,
          color: "#eab308" // yellow
        };
      }
      return {
        title: "Die Appears Fair",
        content: `P-value: ${pValue.toFixed(3)}. No significant deviation from expected frequencies.`,
        color: "#14b8a6" // teal
      };
    }
    
    // 60+ rolls
    if (pValue < 0.01) {
      return {
        title: "Strong Evidence - Loaded Die!",
        content: `P-value: ${pValue.toFixed(4)}. Very unlikely these results came from a fair die.`,
        color: "#ef4444" // red
      };
    }
    if (pValue < 0.05) {
      return {
        title: "Likely Loaded",
        content: `P-value: ${pValue.toFixed(3)}. Significant evidence (p < 0.05) against fairness.`,
        color: "#f59e0b" // amber
      };
    }
    return {
      title: "Die is Fair",
      content: `P-value: ${pValue.toFixed(3)}. After ${rollCount} rolls, deviations appear to be just chance.`,
      color: "#10b981" // green
    };
  }
  
  // Roll the die
  const rollDie = async () => {
    if (isRolling || rolls.length >= MAX_ROLLS) return;
    
    setIsRolling(true);
    
    // Animate die roll
    setCurrentFace('rolling');
    
    // Quick animation through faces
    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setCurrentFace(Math.floor(Math.random() * 6));
    }
    
    // Final result (slightly loaded die - face 6 is twice as likely)
    // This creates a testable scenario where the die is actually unfair
    const rand = Math.random();
    let result;
    if (rand < 5/7) {
      // Faces 1-5 each have 1/7 probability
      result = Math.floor(rand * 5 / (5/7)) + 1;
    } else {
      // Face 6 has 2/7 probability
      result = 6;
    }
    setCurrentFace(result - 1);
    
    // Add to rolls
    const newRolls = [...rolls, result];
    setRolls(newRolls);
    
    // Update visualizations
    updateFrequencyBars(newRolls);
    updateEvidenceMeter(newRolls);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsRolling(false);
  };
  
  // Auto-roll functionality
  useEffect(() => {
    if (autoRoll && !isRolling && rolls.length < MAX_ROLLS) {
      const timer = setTimeout(() => {
        rollDie();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [autoRoll, isRolling, rolls.length]);
  
  // Initialize frequency bars
  useEffect(() => {
    if (!barsRef.current) return;
    
    const svg = d3.select(barsRef.current);
    svg.selectAll("*").remove();
    
    const width = barsRef.current.clientWidth;
    const height = 220;
    const margin = { top: 10, right: 20, bottom: 70, left: 40 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleBand()
      .domain([1, 2, 3, 4, 5, 6])
      .range([0, width - margin.left - margin.right])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, 40])
      .range([height - margin.top - margin.bottom, 0]);
    
    // X axis
    g.append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x))
      .attr("class", "axis");
    
    // Y axis
    g.append("g")
      .call(d3.axisLeft(y))
      .attr("class", "axis");
    
    // Expected frequency line
    const expectedY = y((rolls.length || 0) * EXPECTED_FREQ);
    g.append("line")
      .attr("class", "expected-line")
      .attr("x1", 0)
      .attr("x2", width - margin.left - margin.right)
      .attr("y1", expectedY)
      .attr("y2", expectedY)
      .attr("stroke", "#8b5cf6")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    // Initialize bars
    g.selectAll(".bar")
      .data([1, 2, 3, 4, 5, 6])
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d))
      .attr("width", x.bandwidth())
      .attr("y", y(0))
      .attr("height", 0)
      .attr("fill", "#14b8a6");
    
    // Deviation labels
    g.selectAll(".deviation")
      .data([1, 2, 3, 4, 5, 6])
      .enter()
      .append("text")
      .attr("class", "deviation")
      .attr("x", d => x(d) + x.bandwidth() / 2)
      .attr("y", y(0) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .style("font-size", "12px")
      .style("font-weight", "600");
    
  }, []);
  
  // Update frequency bars
  function updateFrequencyBars(currentRolls) {
    if (!barsRef.current) return;
    
    const svg = d3.select(barsRef.current);
    const g = svg.select("g");
    
    const width = barsRef.current.clientWidth;
    const height = 220;
    const margin = { top: 10, right: 20, bottom: 70, left: 40 };
    
    const currentCounts = currentRolls.reduce((acc, val) => {
      acc[val - 1]++;
      return acc;
    }, [0, 0, 0, 0, 0, 0]);
    
    const y = d3.scaleLinear()
      .domain([0, Math.max(40, d3.max(currentCounts) * 1.2)])
      .range([height - margin.top - margin.bottom, 0]);
    
    // Update y axis (select the second axis element which is the y-axis)
    g.select("g:nth-of-type(2)").transition().duration(300).call(d3.axisLeft(y));
    
    // Update expected line
    const expectedCount = currentRolls.length * EXPECTED_FREQ;
    g.select(".expected-line")
      .transition()
      .duration(300)
      .attr("y1", y(expectedCount))
      .attr("y2", y(expectedCount));
    
    // Update bars
    g.selectAll(".bar")
      .data(currentCounts)
      .transition()
      .duration(300)
      .attr("y", d => y(d))
      .attr("height", d => height - margin.top - margin.bottom - y(d))
      .attr("fill", (d, i) => {
        const deviation = Math.abs(d - expectedCount);
        const relativeDeviation = deviation / (expectedCount || 1);
        if (relativeDeviation > 0.5) return "#ef4444";
        if (relativeDeviation > 0.3) return "#f59e0b";
        return "#14b8a6";
      });
    
    // Update deviation labels
    g.selectAll(".deviation")
      .data(currentCounts)
      .text((d, i) => {
        if (currentRolls.length === 0) return "";
        const expected = expectedCount;
        const diff = d - expected;
        if (Math.abs(diff) < 0.5) return "";
        return diff > 0 ? `+${Math.round(diff)}` : `${Math.round(diff)}`;
      })
      .transition()
      .duration(300)
      .attr("y", d => y(d) - 5);
  }
  
  // Initialize evidence meter
  useEffect(() => {
    if (!meterRef.current) return;
    
    const svg = d3.select(meterRef.current);
    svg.selectAll("*").remove();
    
    const width = meterRef.current.clientWidth;
    const height = 40;
    const margin = { top: 5, right: 0, bottom: 5, left: 0 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const meterWidth = width - margin.left - margin.right;
    const meterHeight = 16;
    
    // Background gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "evidence-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#10b981");
    
    gradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#eab308");
    
    gradient.append("stop")
      .attr("offset", "95%")
      .attr("stop-color", "#f59e0b");
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ef4444");
    
    // Meter background
    g.append("rect")
      .attr("width", meterWidth)
      .attr("height", meterHeight)
      .attr("fill", "url(#evidence-gradient)")
      .attr("opacity", 0.3)
      .attr("rx", 8);
    
    // Meter fill
    g.append("rect")
      .attr("class", "meter-fill")
      .attr("width", 0)
      .attr("height", meterHeight)
      .attr("fill", "url(#evidence-gradient)")
      .attr("rx", 8);
    
    // Scale
    const pScale = d3.scaleLinear()
      .domain([1, 0])
      .range([0, meterWidth]);
    
    // Single threshold line at 0.05
    g.append("line")
      .attr("x1", pScale(0.05))
      .attr("x2", pScale(0.05))
      .attr("y1", 0)
      .attr("y2", meterHeight)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.7)
      .attr("stroke-dasharray", "2,2");
    
    // Pointer
    g.append("polygon")
      .attr("class", "pointer")
      .attr("points", "-5,0 5,0 0,6")
      .attr("fill", "#ffffff")
      .attr("transform", `translate(0,${meterHeight + 2})`);
    
  }, []);
  
  // Update evidence meter
  function updateEvidenceMeter(currentRolls) {
    if (!meterRef.current || currentRolls.length === 0) return;
    
    const svg = d3.select(meterRef.current);
    const g = svg.select("g");
    
    const width = meterRef.current.clientWidth;
    const margin = { left: 20, right: 20 };
    const meterWidth = width - margin.left - margin.right;
    
    const currentCounts = currentRolls.reduce((acc, val) => {
      acc[val - 1]++;
      return acc;
    }, [0, 0, 0, 0, 0, 0]);
    
    const chi2 = calculateChiSquare(currentCounts, currentRolls.length);
    const p = 1 - jStat.chisquare.cdf(chi2, 5);
    
    const pScale = d3.scaleLinear()
      .domain([1, 0])
      .range([0, meterWidth]);
    
    // Update meter fill
    g.select(".meter-fill")
      .transition()
      .duration(500)
      .attr("width", pScale(p));
    
    // Update pointer
    g.select(".pointer")
      .transition()
      .duration(500)
      .attr("transform", `translate(${pScale(p)},18)`);
  }
  
  // Reset function
  const reset = () => {
    setRolls([]);
    setAutoRoll(false);
    setCurrentFace(null);
    updateFrequencyBars([]);
    updateEvidenceMeter([]);
  };
  
  return (
    <VisualizationContainer
      title="Evidence Accumulation: Testing a Die"
      description="Roll the die to gather evidence. Is it fair or loaded?"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls Section */}
        <div className="lg:col-span-1 space-y-4">
          <ControlGroup title="Die Controls">
            <div className="space-y-3">
              {/* Die Display */}
              <div className="flex justify-center mb-4">
                <div className={cn(
                  "text-8xl transition-all duration-300",
                  isRolling && "animate-spin",
                  currentFace === 'rolling' && "opacity-50"
                )}>
                  {currentFace !== null && currentFace !== 'rolling' 
                    ? dieFaces[currentFace] 
                    : '⚄'}
                </div>
              </div>
              
              <Button
                onClick={rollDie}
                disabled={isRolling || rolls.length >= MAX_ROLLS}
                className="w-full"
                variant="default"
              >
                {isRolling ? "Rolling..." : "Roll Die"}
              </Button>
              
              <Button
                onClick={() => setAutoRoll(!autoRoll)}
                disabled={rolls.length >= MAX_ROLLS}
                className="w-full"
                variant={autoRoll ? "destructive" : "secondary"}
              >
                {autoRoll ? "Stop Auto-Roll" : "Start Auto-Roll"}
              </Button>
              
              <Button
                onClick={reset}
                className="w-full"
                variant="outline"
              >
                Reset
              </Button>
            </div>
          </ControlGroup>
          
          <ControlGroup title="Statistics">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Rolls:</span>
                <span className="font-mono font-semibold">{rolls.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Chi-Square:</span>
                <span className="font-mono font-semibold">{chiSquare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">P-Value:</span>
                <span className={cn(
                  "font-mono font-semibold",
                  pValue < 0.01 && "text-red-400",
                  pValue < 0.05 && pValue >= 0.01 && "text-orange-400",
                  pValue < 0.1 && pValue >= 0.05 && "text-yellow-400",
                  pValue >= 0.1 && "text-green-400"
                )}>
                  {pValue.toFixed(4)}
                </span>
              </div>
            </div>
          </ControlGroup>
          
          {/* Progress Indicator */}
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <div className="text-xs text-neutral-400 mb-2">Progress</div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-all duration-500",
                    i <= stage ? "bg-teal-400" : "bg-neutral-700"
                  )}
                />
              ))}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              {stage === 0 && "Start rolling"}
              {stage === 1 && "Early evidence"}
              {stage === 2 && "Pattern emerging"}
              {stage === 3 && "Clear picture"}
              {stage === 4 && "Conclusion reached"}
            </div>
          </div>
        </div>
        
        {/* Visualization Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Insight Panel */}
          <div className={cn(
            "rounded-lg p-4 transition-all duration-500",
            "bg-gradient-to-r",
            insight.color === "#ef4444" && "from-red-500/20 to-red-600/10",
            insight.color === "#f59e0b" && "from-orange-500/20 to-orange-600/10",
            insight.color === "#eab308" && "from-yellow-500/20 to-yellow-600/10",
            insight.color === "#10b981" && "from-green-500/20 to-green-600/10",
            insight.color === "#14b8a6" && "from-teal-500/20 to-teal-600/10",
            insight.color === "#8b5cf6" && "from-purple-500/20 to-purple-600/10"
          )}>
            <h4 className="font-semibold mb-1" style={{ color: insight.color }}>
              {insight.title}
            </h4>
            <p className="text-sm text-neutral-300">{insight.content}</p>
          </div>
          
          {/* Combined Frequency Bars and Evidence Meter */}
          <GraphContainer title="Observed vs Expected Frequencies">
            <svg ref={barsRef} className="w-full"></svg>
            
            {/* Inline Evidence Meter */}
            <div className="mt-3 border-t border-neutral-700 pt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-neutral-400">Evidence (P-Value)</span>
                <span className="text-xs font-mono text-neutral-300">
                  {pValue < 0.001 ? "< 0.001" : pValue.toFixed(3)}
                </span>
              </div>
              <svg ref={meterRef} className="w-full"></svg>
              <div className="mt-1 flex justify-between text-xs text-neutral-500">
                <span>No Evidence</span>
                <span className="text-center">α = 0.05</span>
                <span>Strong Evidence</span>
              </div>
            </div>
          </GraphContainer>
          
          {/* Roll History */}
          {rolls.length > 0 && (
            <div className="bg-neutral-800/30 rounded-lg p-3">
              <div className="text-xs text-neutral-400 mb-2">Recent Rolls (last 20)</div>
              <div className="flex gap-1 flex-wrap">
                {rolls.slice(-20).map((value, i) => (
                  <div 
                    key={i} 
                    className="text-2xl transition-all duration-300"
                    style={{ 
                      opacity: 0.3 + (i / 20) * 0.7,
                      transform: `scale(${0.8 + (i / 20) * 0.2})`
                    }}
                  >
                    {dieFaces[value - 1]}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}