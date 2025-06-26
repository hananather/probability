"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { Play, RotateCcw, BarChart3 } from 'lucide-react';
import { useSafeMathJax } from '../../utils/mathJaxFix';
import { tutorial_1_7_3 } from '@/tutorials/chapter1';

// Use sampling color scheme
const colorScheme = createColorScheme('sampling');

// Convergence Chart Component
const ConvergenceChart = memo(function ConvergenceChart({ data, theoretical }) {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = 700;
    const height = 400;
    const margin = { top: 20, right: 80, bottom: 50, left: 60 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Scales - dynamic x-axis that extends as needed
    const maxTrials = Math.max(100, data[data.length - 1]?.trial || 100);
    const x = d3.scaleLinear()
      .domain([0, maxTrials])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);
    
    // Grid
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat("")
        .ticks(10)
      )
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.2);
    
    // Theoretical lines
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", y(theoretical.stay))
      .attr("y2", y(theoretical.stay))
      .attr("stroke", colorScheme.chart.secondary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.8);
    
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", y(theoretical.switch))
      .attr("y2", y(theoretical.switch))
      .attr("stroke", colorScheme.chart.primary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.8);
    
    // Add labels for theoretical values when no data
    if (data.length <= 1) {
      g.append("text")
        .attr("x", innerWidth - 5)
        .attr("y", y(theoretical.switch) - 5)
        .attr("text-anchor", "end")
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("66.7% (Theory)");
      
      g.append("text")
        .attr("x", innerWidth - 5)
        .attr("y", y(theoretical.stay) + 15)
        .attr("text-anchor", "end")
        .attr("fill", colorScheme.chart.secondary)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("33.3% (Theory)");
    }
    
    // Line generators
    const lineStay = d3.line()
      .x(d => x(d.trial))
      .y(d => y(d.stayRate))
      .curve(d3.curveMonotoneX);
    
    const lineSwitch = d3.line()
      .x(d => x(d.trial))
      .y(d => y(d.switchRate))
      .curve(d3.curveMonotoneX);
    
    // Confidence bands (only if enough data)
    if (data.length > 10) {
      const areaStay = d3.area()
        .x(d => x(d.trial))
        .y0(d => y(Math.max(0, d.stayRate - d.stayCI)))
        .y1(d => y(Math.min(1, d.stayRate + d.stayCI)))
        .curve(d3.curveMonotoneX);
      
      const areaSwitch = d3.area()
        .x(d => x(d.trial))
        .y0(d => y(Math.max(0, d.switchRate - d.switchCI)))
        .y1(d => y(Math.min(1, d.switchRate + d.switchCI)))
        .curve(d3.curveMonotoneX);
      
      g.append("path")
        .datum(data)
        .attr("d", areaStay)
        .attr("fill", colorScheme.chart.secondary)
        .attr("opacity", 0.1);
      
      g.append("path")
        .datum(data)
        .attr("d", areaSwitch)
        .attr("fill", colorScheme.chart.primary)
        .attr("opacity", 0.1);
    }
    
    // Draw lines (only if we have data)
    if (data.length > 0) {
      g.append("path")
        .datum(data)
        .attr("d", lineStay)
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 3)
        .attr("fill", "none")
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
      
      g.append("path")
        .datum(data)
        .attr("d", lineSwitch)
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 3)
        .attr("fill", "none")
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
    }
    
    // Current point markers
    if (data.length > 0) {
      const lastPoint = data[data.length - 1];
      
      g.append("circle")
        .attr("cx", x(lastPoint.trial))
        .attr("cy", y(lastPoint.stayRate))
        .attr("r", 5)
        .attr("fill", colorScheme.chart.secondary)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.5))");
      
      g.append("circle")
        .attr("cx", x(lastPoint.trial))
        .attr("cy", y(lastPoint.switchRate))
        .attr("r", 5)
        .attr("fill", colorScheme.chart.primary)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.5))");
    }
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(10))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "#e5e7eb")
      .style("text-anchor", "middle")
      .text("Number of Trials");
    
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `${(d * 100).toFixed(0)}%`))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#e5e7eb")
      .style("text-anchor", "middle")
      .text("Win Rate");
    
    // Styling
    g.selectAll(".domain, .tick line")
      .attr("stroke", "#6b7280");
    g.selectAll(".tick text")
      .attr("fill", "#e5e7eb");
    
    // Add "Start Simulation" message if no real data yet
    if (data.length <= 1) {
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#9ca3af")
        .style("font-size", "16px")
        .style("font-style", "italic")
        .text("Start the simulation to see convergence in action!");
    }
    
    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 120}, 20)`);
    
    legend.append("rect")
      .attr("x", -10)
      .attr("y", -10)
      .attr("width", 130)
      .attr("height", 90)
      .attr("fill", "#1a1a1a")
      .attr("stroke", "#374151")
      .attr("rx", 4);
    
    // Switch legend
    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 30)
      .attr("y1", 10)
      .attr("y2", 10)
      .attr("stroke", colorScheme.chart.primary)
      .attr("stroke-width", 3);
    
    legend.append("text")
      .attr("x", 35)
      .attr("y", 10)
      .attr("dy", "0.35em")
      .attr("fill", "#e5e7eb")
      .style("font-size", "12px")
      .text("Switch");
    
    // Stay legend
    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 30)
      .attr("y1", 35)
      .attr("y2", 35)
      .attr("stroke", colorScheme.chart.secondary)
      .attr("stroke-width", 3);
    
    legend.append("text")
      .attr("x", 35)
      .attr("y", 35)
      .attr("dy", "0.35em")
      .attr("fill", "#e5e7eb")
      .style("font-size", "12px")
      .text("Stay");
    
    // Theoretical markers
    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 30)
      .attr("y1", 60)
      .attr("y2", 60)
      .attr("stroke", "#9ca3af")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    legend.append("text")
      .attr("x", 35)
      .attr("y", 60)
      .attr("dy", "0.35em")
      .attr("fill", "#9ca3af")
      .style("font-size", "12px")
      .text("Theory");
    
  }, [data, theoretical]);
  
  return <svg ref={svgRef} style={{ width: "100%", height: "400px" }} />;
});

// Distribution Histogram Component
const DistributionHistogram = memo(function DistributionHistogram({ switchWins, stayWins, bins = 20 }) {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current || switchWins.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const width = 350;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create histogram data
    const histogram = d3.histogram()
      .domain([0, 1])
      .thresholds(bins);
    
    const switchBins = histogram(switchWins);
    const stayBins = histogram(stayWins);
    
    // Scales
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max([...switchBins, ...stayBins], d => d.length)])
      .range([innerHeight, 0]);
    
    // Draw stay histogram
    g.selectAll(".bar-stay")
      .data(stayBins)
      .enter().append("rect")
      .attr("class", "bar-stay")
      .attr("x", d => x(d.x0))
      .attr("width", d => x(d.x1) - x(d.x0) - 1)
      .attr("y", d => y(d.length))
      .attr("height", d => innerHeight - y(d.length))
      .attr("fill", colorScheme.chart.secondary)
      .attr("opacity", 0.6);
    
    // Draw switch histogram (offset slightly)
    g.selectAll(".bar-switch")
      .data(switchBins)
      .enter().append("rect")
      .attr("class", "bar-switch")
      .attr("x", d => x(d.x0) + 1)
      .attr("width", d => x(d.x1) - x(d.x0) - 1)
      .attr("y", d => y(d.length))
      .attr("height", d => innerHeight - y(d.length))
      .attr("fill", colorScheme.chart.primary)
      .attr("opacity", 0.6);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(d => `${(d * 100).toFixed(0)}%`));
    
    g.append("g")
      .call(d3.axisLeft(y).ticks(5));
    
    // Styling
    g.selectAll(".domain, .tick line")
      .attr("stroke", "#6b7280");
    g.selectAll(".tick text")
      .attr("fill", "#e5e7eb")
      .style("font-size", "10px");
    
    // Mean lines
    const switchMean = d3.mean(switchWins);
    const stayMean = d3.mean(stayWins);
    
    g.append("line")
      .attr("x1", x(switchMean))
      .attr("x2", x(switchMean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", colorScheme.chart.primary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3");
    
    g.append("line")
      .attr("x1", x(stayMean))
      .attr("x2", x(stayMean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", colorScheme.chart.secondary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3");
    
  }, [switchWins, stayWins, bins]);
  
  return <svg ref={svgRef} style={{ width: "100%", height: "250px" }} />;
});

// Main Simulation Component
function MontyHallSimulation() {
  // Simulation state
  const [totalGames, setTotalGames] = useState(0);
  const [convergenceData, setConvergenceData] = useState([
    // Initialize with theoretical values at trial 0
    {
      trial: 0,
      switchRate: 2/3,
      stayRate: 1/3,
      switchCI: 0,
      stayCI: 0
    }
  ]);
  const [recentResults, setRecentResults] = useState({ switch: [], stay: [] });
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Running statistics
  const [stats, setStats] = useState({
    switch: { wins: 0, total: 0 },
    stay: { wins: 0, total: 0 }
  });
  
  // Refs for maintaining state during animation
  const statsRef = useRef({ switch: { wins: 0, total: 0 }, stay: { wins: 0, total: 0 } });
  
  // Theoretical values
  const theoretical = { stay: 1/3, switch: 2/3 };
  
  // Run single game
  const runGame = useCallback((strategy) => {
    const carPosition = Math.floor(Math.random() * 3);
    const playerChoice = Math.floor(Math.random() * 3);
    
    // Monty reveals a door
    const availableDoors = [0, 1, 2].filter(d => d !== playerChoice && d !== carPosition);
    const montyReveals = availableDoors[Math.floor(Math.random() * availableDoors.length)];
    
    // Final choice based on strategy
    let finalChoice;
    if (strategy === 'stay') {
      finalChoice = playerChoice;
    } else {
      finalChoice = [0, 1, 2].find(d => d !== playerChoice && d !== montyReveals);
    }
    
    return finalChoice === carPosition;
  }, []);
  
  // Update statistics with proper confidence intervals
  const updateStats = useCallback((results, addToConvergence = true) => {
    const newStats = { ...statsRef.current };
    
    results.forEach(result => {
      newStats[result.strategy].total++;
      if (result.won) {
        newStats[result.strategy].wins++;
      }
    });
    
    statsRef.current = newStats;
    setStats(newStats);
    
    // Update convergence data
    const totalSoFar = newStats.switch.total + newStats.stay.total;
    
    if (addToConvergence && (totalSoFar % 5 === 0 || totalSoFar <= 20)) { // Record every 5 games or first 20
      const switchRate = newStats.switch.total > 0 ? newStats.switch.wins / newStats.switch.total : 0;
      const stayRate = newStats.stay.total > 0 ? newStats.stay.wins / newStats.stay.total : 0;
      
      // Calculate Wilson score confidence intervals (better for small samples)
      const wilsonCI = (successes, n, z = 1.96) => {
        if (n === 0) return 0;
        const p = successes / n;
        const denominator = 1 + z*z/n;
        const centre = (p + z*z/(2*n)) / denominator;
        const margin = (z / denominator) * Math.sqrt(p*(1-p)/n + z*z/(4*n*n));
        return margin;
      };
      
      const switchCI = wilsonCI(newStats.switch.wins, newStats.switch.total);
      const stayCI = wilsonCI(newStats.stay.wins, newStats.stay.total);
      
      setConvergenceData(prev => [...prev, {
        trial: totalSoFar,
        switchRate,
        stayRate,
        switchCI,
        stayCI
      }]);
    }
    
    // Update recent results for histogram
    const newRecentSwitch = results
      .filter(r => r.strategy === 'switch')
      .map(r => r.won ? 1 : 0);
    const newRecentStay = results
      .filter(r => r.strategy === 'stay')
      .map(r => r.won ? 1 : 0);
    
    setRecentResults(prev => ({
      switch: [...prev.switch, ...newRecentSwitch].slice(-1000),
      stay: [...prev.stay, ...newRecentStay].slice(-1000)
    }));
    
    setTotalGames(totalSoFar);
  }, []);
  
  // Run batch of simulations with animation
  const runBatch = useCallback((batchSize) => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    const results = [];
    const delay = Math.min(50, 2000 / batchSize); // Faster for larger batches
    
    // Collect all results first
    for (let i = 0; i < batchSize; i++) {
      results.push(
        { strategy: 'switch', won: runGame('switch') },
        { strategy: 'stay', won: runGame('stay') }
      );
    }
    
    // Animate the updates
    let processed = 0;
    const animationTimer = setInterval(() => {
      const batchEnd = Math.min(processed + 2, results.length);
      const batch = results.slice(processed, batchEnd);
      
      if (batch.length > 0) {
        updateStats(batch, batchEnd === results.length || batchEnd % 10 === 0);
        processed = batchEnd;
      }
      
      if (processed >= results.length) {
        clearInterval(animationTimer);
        setIsSimulating(false);
      }
    }, delay);
  }, [isSimulating, runGame, updateStats]);
  
  // Reset simulation
  const reset = useCallback(() => {
    setTotalGames(0);
    setConvergenceData([
      // Reset to initial theoretical values
      {
        trial: 0,
        switchRate: 2/3,
        stayRate: 1/3,
        switchCI: 0,
        stayCI: 0
      }
    ]);
    setRecentResults({ switch: [], stay: [] });
    setStats({ switch: { wins: 0, total: 0 }, stay: { wins: 0, total: 0 } });
    statsRef.current = { switch: { wins: 0, total: 0 }, stay: { wins: 0, total: 0 } };
  }, []);
  
  // Calculate current win rates
  const winRates = {
    switch: stats.switch.total > 0 ? stats.switch.wins / stats.switch.total : 0,
    stay: stats.stay.total > 0 ? stats.stay.wins / stats.stay.total : 0
  };
  
  // Calculate convergence metrics
  const convergenceMetrics = {
    switchError: Math.abs(winRates.switch - theoretical.switch),
    stayError: Math.abs(winRates.stay - theoretical.stay),
    isConverged: totalGames > 100 && 
                Math.abs(winRates.switch - theoretical.switch) < 0.05 &&
                Math.abs(winRates.stay - theoretical.stay) < 0.05
  };
  
  return (
    <VisualizationContainer
      title="Monty Hall Problem: Large-Scale Simulation"
      description={
        <p className={typography.description}>
          Watch the <span className="text-cyan-400">Law of Large Numbers</span> in action! 
          As we simulate thousands of games, the win rates converge to their 
          <span className="text-amber-400"> theoretical values</span>: 
          33.3% for staying and 66.7% for switching.
        </p>
      }
      tutorialSteps={tutorial_1_7_3}
      tutorialKey="monty-hall-simulation"
    >
      <div className="flex flex-col gap-6">
        {/* Control Panel */}
        <VisualizationSection className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Simulation Controls */}
            <div>
              <h4 className="text-base font-bold text-white mb-3">Simulation Controls</h4>
              <div className="space-y-3">
                {/* Staged sampling buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {totalGames === 0 && (
                    <Button
                      onClick={() => runBatch(10)}
                      variant="primary"
                      disabled={isSimulating}
                      className="col-span-2"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Run 10 Games
                    </Button>
                  )}
                  
                  {totalGames > 0 && totalGames < 30 && (
                    <Button
                      onClick={() => runBatch(20)}
                      variant="primary"
                      disabled={isSimulating}
                      className="col-span-2"
                    >
                      Add 20 More → 30 Total
                    </Button>
                  )}
                  
                  {totalGames >= 30 && totalGames < 100 && (
                    <Button
                      onClick={() => runBatch(70)}
                      variant="primary"
                      disabled={isSimulating}
                      className="col-span-2"
                    >
                      Add 70 More → 100 Total
                    </Button>
                  )}
                  
                  {totalGames >= 100 && totalGames < 500 && (
                    <Button
                      onClick={() => runBatch(400)}
                      variant="primary"
                      disabled={isSimulating}
                      className="col-span-2"
                    >
                      Add 400 More → 500 Total
                    </Button>
                  )}
                  
                  {totalGames >= 500 && (
                    <>
                      <Button
                        onClick={() => runBatch(100)}
                        variant="primary"
                        disabled={isSimulating}
                      >
                        Add 100
                      </Button>
                      <Button
                        onClick={() => runBatch(500)}
                        variant="primary"
                        disabled={isSimulating}
                      >
                        Add 500
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  onClick={reset}
                  variant="neutral"
                  className="w-full"
                  disabled={isSimulating}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Simulation
                </Button>
              </div>
            </div>
            
            {/* Current Statistics */}
            <div>
              <h4 className="text-base font-bold text-white mb-3">Current Statistics</h4>
              <div className="space-y-3">
                {/* Total Games */}
                <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Total Games</span>
                    <span className="text-xl font-mono text-white font-bold">
                      {totalGames.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Win Rates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-700">
                    <div className="text-xs text-neutral-400 mb-1">Switch Win Rate</div>
                    <div className="text-lg font-mono text-cyan-400 font-bold">
                      {(winRates.switch * 100).toFixed(2)}%
                    </div>
                    <div className="text-xs text-neutral-500">
                      {stats.switch.wins}/{stats.switch.total}
                    </div>
                    <div className="text-xs text-amber-400 mt-1">
                      Theory: 66.67%
                    </div>
                  </div>
                  
                  <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-700">
                    <div className="text-xs text-neutral-400 mb-1">Stay Win Rate</div>
                    <div className="text-lg font-mono text-purple-400 font-bold">
                      {(winRates.stay * 100).toFixed(2)}%
                    </div>
                    <div className="text-xs text-neutral-500">
                      {stats.stay.wins}/{stats.stay.total}
                    </div>
                    <div className="text-xs text-amber-400 mt-1">
                      Theory: 33.33%
                    </div>
                  </div>
                </div>
                
                {/* Convergence Status */}
                {totalGames > 0 && (
                  <div className={cn(
                    "rounded-lg p-3 border",
                    convergenceMetrics.isConverged 
                      ? "bg-green-900/20 border-green-600/50" 
                      : "bg-amber-900/20 border-amber-600/50"
                  )}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Convergence Status
                        </span>
                        <span className="text-xs font-mono text-neutral-400">
                          n = {totalGames}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-neutral-500">Switch error:</span>
                          <span className={cn(
                            "ml-1 font-mono",
                            convergenceMetrics.switchError < 0.05 ? "text-green-400" : "text-amber-400"
                          )}>
                            {(convergenceMetrics.switchError * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Stay error:</span>
                          <span className={cn(
                            "ml-1 font-mono",
                            convergenceMetrics.stayError < 0.05 ? "text-green-400" : "text-amber-400"
                          )}>
                            {(convergenceMetrics.stayError * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      {totalGames < 30 && (
                        <p className="text-xs text-neutral-500 italic">
                          Small sample - high variance expected
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </VisualizationSection>
        
        {/* Main Convergence Chart */}
        <GraphContainer height="400px">
          <div className="flex items-center justify-between px-4 pt-3">
            <h4 className="text-base font-bold text-white">
              Convergence to Theoretical Values
            </h4>
            <div className="text-xs text-neutral-400">
              <BarChart3 className="w-4 h-4 inline mr-1" />
              Showing win rate evolution over time
            </div>
          </div>
          <ConvergenceChart 
            data={convergenceData}
            theoretical={theoretical}
          />
        </GraphContainer>
        
        {/* Distribution Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Win Rate Distributions */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">
              Win Rate Distribution (Last 1000 Games)
            </h4>
            <DistributionHistogram
              switchWins={recentResults.switch}
              stayWins={recentResults.stay}
              bins={20}
            />
            <div className="mt-3 text-xs text-neutral-400">
              <p>This histogram shows the distribution of wins/losses.</p>
              <p>Notice how they cluster around their theoretical means.</p>
            </div>
          </VisualizationSection>
          
          {/* Statistical Analysis */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Statistical Analysis</h4>
            <div className="space-y-3">
              {/* Sample Statistics */}
              <div className="p-3 bg-neutral-900 rounded-lg text-sm">
                <h5 className="text-cyan-400 font-semibold mb-2">Sample Statistics</h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-neutral-400">Switch Strategy</div>
                    <div className="mt-1">
                      <span className="text-neutral-300">Mean: </span>
                      <span className="font-mono text-cyan-300">
                        {(winRates.switch * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-300">StdErr: </span>
                      <span className="font-mono text-cyan-300">
                        {stats.switch.total > 0 
                          ? (Math.sqrt(winRates.switch * (1 - winRates.switch) / stats.switch.total) * 100).toFixed(3)
                          : '—'}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Stay Strategy</div>
                    <div className="mt-1">
                      <span className="text-neutral-300">Mean: </span>
                      <span className="font-mono text-purple-300">
                        {(winRates.stay * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-300">StdErr: </span>
                      <span className="font-mono text-purple-300">
                        {stats.stay.total > 0 
                          ? (Math.sqrt(winRates.stay * (1 - winRates.stay) / stats.stay.total) * 100).toFixed(3)
                          : '—'}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Confidence Intervals */}
              <div className="p-3 bg-neutral-900 rounded-lg text-sm">
                <h5 className="text-amber-400 font-semibold mb-2">95% Confidence Intervals</h5>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-neutral-400">Switch: </span>
                    <span className="font-mono text-cyan-300">
                      {stats.switch.total > 0 
                        ? (() => {
                            const n = stats.switch.total;
                            const p = winRates.switch;
                            const z = 1.96;
                            const denominator = 1 + z*z/n;
                            const centre = (p + z*z/(2*n)) / denominator;
                            const margin = (z / denominator) * Math.sqrt(p*(1-p)/n + z*z/(4*n*n));
                            return `[${((centre - margin) * 100).toFixed(1)}%, ${((centre + margin) * 100).toFixed(1)}%]`;
                          })()
                        : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Stay: </span>
                    <span className="font-mono text-purple-300">
                      {stats.stay.total > 0 
                        ? (() => {
                            const n = stats.stay.total;
                            const p = winRates.stay;
                            const z = 1.96;
                            const denominator = 1 + z*z/n;
                            const centre = (p + z*z/(2*n)) / denominator;
                            const margin = (z / denominator) * Math.sqrt(p*(1-p)/n + z*z/(4*n*n));
                            return `[${((centre - margin) * 100).toFixed(1)}%, ${((centre + margin) * 100).toFixed(1)}%]`;
                          })()
                        : '—'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-neutral-500">
                  Wilson score intervals (robust for small samples)
                </div>
              </div>
              
              {/* Law of Large Numbers */}
              <div className="p-3 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-600/30 text-sm">
                <h5 className="text-blue-300 font-semibold mb-1">Convergence Analysis</h5>
                <div className="text-xs text-blue-200 space-y-1">
                  <div>
                    <span className="text-neutral-400">Theoretical (Weak LLN):</span>
                    <div className="font-mono text-blue-300 mt-0.5">
                      P(|X̄ₙ - μ| &gt; ε) → 0 as n → ∞
                    </div>
                  </div>
                  {totalGames >= 30 && (
                    <div className="mt-2 pt-2 border-t border-blue-600/20">
                      <span className="text-neutral-400">Current deviation from theory:</span>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="font-mono text-xs">
                          Switch: {(Math.abs(winRates.switch - theoretical.switch) * 100).toFixed(2)}%
                        </div>
                        <div className="font-mono text-xs">
                          Stay: {(Math.abs(winRates.stay - theoretical.stay) * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </VisualizationSection>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default MontyHallSimulation;