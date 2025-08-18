"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../../lib/design-system';
import { Button } from '../../ui/button';
import { ProgressBar } from '../../ui/ProgressBar';
import { Chapter1ReferenceSheet } from '../../reference-sheets/Chapter1ReferenceSheet';

// Use probability color scheme
const colorScheme = createColorScheme('probability');

// Animation timing constants
const ANIMATION_CONSTANTS = {
  COIN_FLIP_INTERVAL: 500, // Interval for auto coin flipping
  TRANSITION_DURATION: 300, // Duration for D3 transitions
};

// Gambler's Fallacy Simulator
const GamblersFallacy = memo(function GamblersFallacy() {
  const [history, setHistory] = useState([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [autoFlip, setAutoFlip] = useState(false);
  const svgRef = useRef(null);

  const flipCoin = () => {
    const result = Math.random() < 0.5 ? 'H' : 'T';
    setHistory(prev => [...(prev || []).slice(-19), result]);
  };

  useEffect(() => {
    if (autoFlip) {
      const interval = setInterval(flipCoin, ANIMATION_CONSTANTS.COIN_FLIP_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [autoFlip]);

  // Calculate streaks
  const currentStreak = (history && history.length > 0) ? 
    history.slice().reverse().findIndex(flip => {
      const lastFlip = (history && history.length > 0) ? history[history.length - 1] : null;
      return lastFlip ? flip !== lastFlip : false;
    }) : 0;
  const streakType = (history && history.length > 0) ? history[history.length - 1] : null;

  // Count heads and tails
  const headsCount = (history || []).filter(f => f === 'H').length;
  const tailsCount = (history || []).filter(f => f === 'T').length;
  const total = (history || []).length;

  useEffect(() => {
    if (!svgRef.current || !history || history.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 100;
    const coinSize = 25;
    const spacing = 5;

    // Set SVG dimensions
    svg.attr("width", width).attr("height", height);

    // Get or create main container
    let g = svg.select("g.coin-container");
    if (g.empty()) {
      g = svg.append("g")
        .attr("class", "coin-container")
        .attr("transform", "translate(10, 25)");
    }

    // Update coins using proper D3 data join
    const coins = g.selectAll("g.coin")
      .data((history || []).slice(-20), (d, i) => `${d}-${i}`);

    // Remove exiting coins
    coins.exit()
      .transition()
      .duration(ANIMATION_CONSTANTS.TRANSITION_DURATION)
      .style("opacity", 0)
      .remove();

    // Enter new coins
    const coinsEnter = coins.enter()
      .append("g")
      .attr("class", "coin")
      .attr("transform", (d, i) => `translate(${i * (coinSize + spacing)}, 0)`)
      .style("opacity", 0);

    coinsEnter.append("circle")
      .attr("cx", coinSize / 2)
      .attr("cy", coinSize / 2)
      .attr("r", coinSize / 2)
      .attr("fill", d => d === 'H' ? colorScheme.primary : colorScheme.secondary)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    coinsEnter.append("text")
      .attr("x", coinSize / 2)
      .attr("y", coinSize / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#fff")
      .attr("font-weight", "bold")
      .attr("font-size", "14px")
      .text(d => d);

    // Update all coins (enter + existing)
    coins.merge(coinsEnter)
      .transition()
      .duration(ANIMATION_CONSTANTS.TRANSITION_DURATION)
      .style("opacity", 1)
      .attr("transform", (d, i) => `translate(${i * (coinSize + spacing)}, 0)`);

    // Cleanup function for D3
    return () => {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").interrupt();
      }
    };
  }, [history]);

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-lg p-6 transition-all duration-200 hover:border-gray-600/50">
      <h3 className="text-xl font-bold text-teal-400 mb-4">Gambler's Fallacy</h3>
      
      <p className="text-neutral-300 text-sm mb-6">
        The false belief that past results affect future probabilities in independent events.
      </p>

      {/* Coin history */}
      <div className="mb-4">
        <svg ref={svgRef} className="w-full" />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-neutral-300 text-sm">Heads</span>
            <span className="text-teal-400 font-mono">
              {headsCount} ({total > 0 ? formatNumber(headsCount / total * 100, 1) : 0}%)
            </span>
          </div>
          <ProgressBar 
            progress={total > 0 ? headsCount / total : 0.5} 
            color={colorScheme.primary}
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-neutral-300 text-sm">Tails</span>
            <span className="text-purple-400 font-mono">
              {tailsCount} ({total > 0 ? formatNumber(tailsCount / total * 100, 1) : 0}%)
            </span>
          </div>
          <ProgressBar 
            progress={total > 0 ? tailsCount / total : 0.5} 
            color={colorScheme.secondary}
          />
        </div>
      </div>

      {/* Current streak */}
      {currentStreak > 2 && (
        <div className={cn("p-4 rounded-lg mb-4 border transition-all duration-200", 
          streakType === 'H' ? "bg-blue-900/30 border-blue-600/50" : "bg-purple-900/30 border-purple-600/50"
        )}>
          <p className="text-white text-sm">
            Current streak: {currentStreak} {streakType === 'H' ? 'heads' : 'tails'} in a row!
          </p>
          <p className="text-yellow-400 text-sm font-semibold mt-2">
            The probability of the next flip being {streakType === 'H' ? 'heads' : 'tails'} is still 50%!
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={flipCoin}
          disabled={autoFlip}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Flip Coin
        </Button>
        <Button
          onClick={() => setAutoFlip(!autoFlip)}
          className={cn(
            "px-4 py-2 rounded transition-all duration-200 hover:scale-105",
            autoFlip 
              ? "bg-red-600 hover:bg-red-700 text-white" 
              : "bg-blue-600 hover:bg-blue-700 text-white"
          )}
        >
          {autoFlip ? "Stop" : "Auto Flip"}
        </Button>
        <Button
          onClick={() => setHistory([])}
          className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded transition-all duration-200 hover:scale-105"
        >
          Reset
        </Button>
      </div>
    </div>
  );
});

// Simpson's Paradox Visualizer
const SimpsonsParadox = memo(function SimpsonsParadox() {
  const [showSeparated, setShowSeparated] = useState(false);
  const svgRef = useRef(null);

  // Example: Treatment success rates
  const data = {
    combined: {
      treatmentA: { success: 273, total: 350 },
      treatmentB: { success: 289, total: 350 }
    },
    separated: {
      mild: {
        treatmentA: { success: 81, total: 87 },
        treatmentB: { success: 234, total: 270 }
      },
      severe: {
        treatmentA: { success: 192, total: 263 },
        treatmentB: { success: 55, total: 80 }
      }
    }
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 320;
    const margin = { top: 40, right: 60, bottom: 80, left: 60 };
    
    // Set up SVG with proper attributes for visibility
    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible");
    
    // Get or create background
    let background = svg.select("rect.chart-background");
    if (background.empty()) {
      background = svg.append("rect")
        .attr("class", "chart-background")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#1f2937")
        .attr("opacity", 0.8);
    }

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Get or create main container
    let g = svg.select("g.chart-container");
    if (g.empty()) {
      g = svg.append("g")
        .attr("class", "chart-container")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    }

    if (!showSeparated) {
      // Combined view
      const treatments = ['A', 'B'];
      const successRates = [
        data.combined.treatmentA.success / data.combined.treatmentA.total,
        data.combined.treatmentB.success / data.combined.treatmentB.total
      ];

      const xScale = d3.scaleBand()
        .domain(treatments)
        .range([0, innerWidth])
        .padding(0.3);

      const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);

      // Bars
      g.selectAll("rect")
        .data(successRates)
        .enter()
        .append("rect")
        .attr("x", (d, i) => xScale(treatments[i]))
        .attr("y", d => yScale(d))
        .attr("width", xScale.bandwidth())
        .attr("height", d => innerHeight - yScale(d))
        .attr("fill", (d, i) => i === 0 ? '#60a5fa' : '#34d399')
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1);

      // Labels
      g.selectAll("text.value")
        .data(successRates)
        .enter()
        .append("text")
        .attr("class", "value")
        .attr("x", (d, i) => xScale(treatments[i]) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d) - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .text(d => `${formatNumber(d * 100, 1)}%`);

      // X-axis
      const xAxis = g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));
      
      // Style axis text and lines
      xAxis.selectAll("text")
        .attr("fill", "#f3f4f6");
      xAxis.selectAll(".domain, .tick line")
        .attr("stroke", "#ffffff");
      
      xAxis
        .append("text")
        .attr("x", innerWidth / 2)
        .attr("y", 40)
        .attr("fill", "#f3f4f6")
        .attr("text-anchor", "middle")
        .text("Treatment");

      // Title
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .text("Overall Success Rates");

    } else {
      // Separated view
      const groups = ['Mild Cases', 'Severe Cases'];
      const groupWidth = innerWidth / 2 - 20;

      groups.forEach((group, groupIndex) => {
        const groupG = g.append("g")
          .attr("transform", `translate(${groupIndex * (groupWidth + 40)}, 0)`);

        const groupData = groupIndex === 0 ? data.separated.mild : data.separated.severe;
        const successRates = [
          groupData.treatmentA.success / groupData.treatmentA.total,
          groupData.treatmentB.success / groupData.treatmentB.total
        ];

        const xScale = d3.scaleBand()
          .domain(['A', 'B'])
          .range([0, groupWidth])
          .padding(0.3);

        const yScale = d3.scaleLinear()
          .domain([0, 1])
          .range([innerHeight, 0]);

        // Bars
        groupG.selectAll("rect")
          .data(successRates)
          .enter()
          .append("rect")
          .attr("x", (d, i) => xScale(['A', 'B'][i]))
          .attr("y", d => yScale(d))
          .attr("width", xScale.bandwidth())
          .attr("height", d => innerHeight - yScale(d))
          .attr("fill", (d, i) => i === 0 ? '#60a5fa' : '#34d399')
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1);

        // Labels
        groupG.selectAll("text.value")
          .data(successRates)
          .enter()
          .append("text")
          .attr("class", "value")
          .attr("x", (d, i) => xScale(['A', 'B'][i]) + xScale.bandwidth() / 2)
          .attr("y", d => yScale(d) - 5)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .attr("fill", "white")
          .text(d => `${formatNumber(d * 100, 1)}%`);

        // Group title
        groupG.append("text")
          .attr("x", groupWidth / 2)
          .attr("y", innerHeight + 30)
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .attr("fill", "white")
          .text(group);

        // Sample sizes
        groupG.append("text")
          .attr("x", groupWidth / 2)
          .attr("y", innerHeight + 45)
          .attr("text-anchor", "middle")
          .attr("font-size", "11px")
          .attr("fill", "#cccccc")
          .text(`(n = ${groupData.treatmentA.total + groupData.treatmentB.total})`);
      });

      // Title
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .text("Success Rates by Severity");
    }

    // Cleanup function for D3
    return () => {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").interrupt();
      }
    };
  }, [showSeparated]);

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-lg p-6 transition-all duration-200 hover:border-gray-600/50">
      <h3 className="text-xl font-bold text-teal-400 mb-4">Simpson's Paradox</h3>
      
      <p className="text-neutral-300 text-sm mb-6">
        A phenomenon where a trend appears in several groups but disappears or reverses when combined.
      </p>

      <div className="bg-neutral-900/50 rounded-lg p-4 mb-4">
        <svg 
          ref={svgRef} 
          className="w-full" 
          style={{ height: "320px", display: "block", margin: "0 auto" }}
        />
      </div>

      <div className={cn("p-4 rounded-lg mb-4 border transition-all duration-200", 
        showSeparated ? "bg-green-900/30 border-green-600/50" : "bg-amber-900/30 border-amber-600/50"
      )}>
        <p className="text-white text-sm">
          {showSeparated ? (
            <>
              <strong className="text-green-400">Separated view:</strong> Treatment A is better for both mild cases (93% vs 87%) 
              and severe cases (73% vs 69%).
            </>
          ) : (
            <>
              <strong className="text-amber-400">Combined view:</strong> Treatment B appears better overall (83% vs 78%), 
              but this is misleading!
            </>
          )}
        </p>
      </div>

      <Button
        onClick={() => setShowSeparated(!showSeparated)}
        variant="primary"
        className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-all duration-200 hover:scale-105"
      >
        {showSeparated ? "Show Combined Data" : "Show Separated Data"}
      </Button>
    </div>
  );
});

// Base Rate Fallacy Calculator
const BaseRateFallacy = memo(function BaseRateFallacy() {
  const [prevalence, setPrevalence] = useState(0.001);
  const [sensitivity, setSensitivity] = useState(0.99);
  const [specificity, setSpecificity] = useState(0.99);

  // Calculate probabilities
  const population = 100000;
  const actualPositive = Math.round(population * prevalence);
  const actualNegative = population - actualPositive;
  
  const truePositive = Math.round(actualPositive * sensitivity);
  const falseNegative = actualPositive - truePositive;
  const trueNegative = Math.round(actualNegative * specificity);
  const falsePositive = actualNegative - trueNegative;
  
  const totalPositiveTests = truePositive + falsePositive;
  const ppv = totalPositiveTests > 0 ? truePositive / totalPositiveTests : 0;

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-lg p-6 transition-all duration-200 hover:border-gray-600/50">
      <h3 className="text-xl font-bold text-teal-400 mb-4">Base Rate Fallacy</h3>
      
      <p className="text-neutral-300 text-sm mb-6">
        Ignoring base rates when evaluating probabilities, especially with rare conditions.
      </p>

      {/* Controls */}
      <div className="space-y-3 mb-4">
        <ControlGroup>
          <label className="text-neutral-300 text-sm block mb-2">
            Condition Prevalence: <span className="text-teal-400 font-mono">{formatNumber(prevalence * 100, 2)}%</span>
          </label>
          <input
            type="range"
            min="0.0001"
            max="0.1"
            step="0.0001"
            value={prevalence}
            onChange={(e) => setPrevalence(parseFloat(e.target.value))}
            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider:bg-teal-500"
          />
        </ControlGroup>

        <ControlGroup>
          <label className="text-neutral-300 text-sm block mb-2">
            Test Sensitivity: <span className="text-blue-400 font-mono">{formatNumber(sensitivity * 100, 1)}%</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.01"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider:bg-blue-500"
          />
        </ControlGroup>

        <ControlGroup>
          <label className="text-neutral-300 text-sm block mb-2">
            Test Specificity: <span className="text-purple-400 font-mono">{formatNumber(specificity * 100, 1)}%</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.01"
            value={specificity}
            onChange={(e) => setSpecificity(parseFloat(e.target.value))}
            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider:bg-purple-500"
          />
        </ControlGroup>
      </div>

      {/* Results */}
      <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-neutral-300">True Positives:</span>
            <span className="ml-2 font-mono text-green-400">{truePositive.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-neutral-300">False Positives:</span>
            <span className="ml-2 font-mono text-red-400">{falsePositive.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-neutral-300">True Negatives:</span>
            <span className="ml-2 font-mono text-blue-400">{trueNegative.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-neutral-300">False Negatives:</span>
            <span className="ml-2 font-mono text-red-400">{falseNegative.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className={cn("p-4 rounded-lg border transition-all duration-200", ppv > 0.5 ? "bg-green-900/30 border-green-600/50" : "bg-red-900/30 border-red-600/50")}>
        <p className="text-white text-sm font-semibold">
          If you test positive, the probability you actually have the condition is only{" "}
          <span className="text-yellow-400 text-lg font-mono">{formatNumber(ppv * 100, 1)}%</span>
        </p>
        {ppv < 0.5 && (
          <p className="text-neutral-300 text-sm mt-2">
            Despite the test being {formatNumber(sensitivity * 100, 0)}% accurate, 
            most positive results are false positives due to the low base rate!
          </p>
        )}
      </div>
    </div>
  );
});

// Prosecutor's Fallacy Example
const ProsecutorsFallacy = memo(function ProsecutorsFallacy() {
  const [populationSize, setPopulationSize] = useState(1000000);
  const [matchProbability, setMatchProbability] = useState(0.000001);

  const expectedMatches = populationSize * matchProbability;
  const probabilityGivenMatch = expectedMatches > 0 ? 1 / Math.max(1, Math.round(expectedMatches)) : 0;

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-lg p-6 transition-all duration-200 hover:border-gray-600/50">
      <h3 className="text-xl font-bold text-teal-400 mb-4">Prosecutor's Fallacy</h3>
      
      <p className="text-neutral-300 text-sm mb-6">
        Confusing P(evidence|innocent) with P(innocent|evidence).
      </p>

      <div className="space-y-3 mb-4">
        <ControlGroup>
          <label className="text-neutral-300 text-sm block mb-2">
            Population Size: <span className="text-cyan-400 font-mono">{populationSize.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min="10000"
            max="10000000"
            step="10000"
            value={populationSize}
            onChange={(e) => setPopulationSize(parseInt(e.target.value))}
            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider:bg-cyan-500"
          />
        </ControlGroup>

        <ControlGroup>
          <label className="text-neutral-300 text-sm block mb-2">
            Match Probability: <span className="text-orange-400 font-mono">1 in {matchProbability > 0 ? Math.round(1/matchProbability).toLocaleString() : '∞'}</span>
          </label>
          <input
            type="range"
            min="-7"
            max="-3"
            step="0.1"
            value={Math.log10(matchProbability)}
            onChange={(e) => setMatchProbability(Math.pow(10, parseFloat(e.target.value)))}
            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider:bg-orange-500"
          />
        </ControlGroup>
      </div>

      <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4 mb-4">
        <p className="text-white text-sm">
          <strong className="text-orange-400">Scenario:</strong> DNA evidence matches with probability 1 in {matchProbability > 0 ? Math.round(1/matchProbability).toLocaleString() : '∞'}
        </p>
        <p className="text-white text-sm mt-2">
          <strong className="text-cyan-400">Expected matches in population:</strong> <span className="font-mono text-yellow-400">{formatNumber(expectedMatches, 1)}</span>
        </p>
      </div>

      <div className={cn("p-4 rounded-lg border transition-all duration-200", expectedMatches > 1 ? "bg-amber-900/30 border-amber-600/50" : "bg-green-900/30 border-green-600/50")}>
        <p className="text-white text-sm font-semibold">
          P(guilty|match) ≈ <span className="text-yellow-400 font-mono text-lg">{formatNumber(probabilityGivenMatch * 100, 1)}%</span>
        </p>
        <p className="text-neutral-300 text-sm mt-2">
          {expectedMatches > 1 
            ? "Multiple people in the population would match - the evidence alone is not conclusive!"
            : "The match is likely unique in this population."
          }
        </p>
      </div>
    </div>
  );
});

export default function ProbabilisticFallacies() {
  const [selectedFallacy, setSelectedFallacy] = useState('gamblers');

  const fallacies = {
    gamblers: {
      title: "Gambler's Fallacy",
      component: <GamblersFallacy />
    },
    simpsons: {
      title: "Simpson's Paradox",
      component: <SimpsonsParadox />
    },
    baseRate: {
      title: "Base Rate Fallacy",
      component: <BaseRateFallacy />
    },
    prosecutors: {
      title: "Prosecutor's Fallacy",
      component: <ProsecutorsFallacy />
    }
  };

  return (
    <>
      <Chapter1ReferenceSheet mode="floating" />
      <VisualizationContainer
      title="Probabilistic Fallacies Explorer"
      description="Understand common mistakes in probabilistic reasoning and how to avoid them"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Fallacy selector */}
        <div>
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-lg p-6 mb-8 transition-all duration-200 hover:border-gray-600/50">
            <h3 className="text-xl font-bold text-teal-400 mb-4">Select a Fallacy</h3>
            <div className="space-y-2">
              {Object.entries(fallacies).map(([key, fallacy]) => (
                <button
                  key={key}
                  onClick={() => setSelectedFallacy(key)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg transition-all duration-200",
                    selectedFallacy === key
                      ? "bg-teal-900/50 border-2 border-teal-500/70 transform scale-105"
                      : "bg-neutral-800/50 border-2 border-neutral-700/50 hover:bg-neutral-700/50 hover:border-neutral-600/50 hover:transform hover:scale-102"
                  )}
                >
                  <span className={cn("font-semibold text-white")}>
                    {fallacy.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* General advice */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-lg p-6 transition-all duration-200 hover:border-gray-600/50">
            <h3 className="text-xl font-bold text-teal-400 mb-4">How to Avoid These Fallacies</h3>
            <ul className="space-y-3">
              <li className="text-neutral-300 text-sm flex items-start">
                <span className="mr-3 text-teal-400 font-bold">•</span>
                Always consider base rates and prior probabilities
              </li>
              <li className="text-neutral-300 text-sm flex items-start">
                <span className="mr-3 text-teal-400 font-bold">•</span>
                Remember that independent events don't affect each other
              </li>
              <li className="text-neutral-300 text-sm flex items-start">
                <span className="mr-3 text-teal-400 font-bold">•</span>
                Look at data from multiple perspectives before drawing conclusions
              </li>
              <li className="text-neutral-300 text-sm flex items-start">
                <span className="mr-3 text-teal-400 font-bold">•</span>
                Be careful not to confuse P(A|B) with P(B|A)
              </li>
              <li className="text-neutral-300 text-sm flex items-start">
                <span className="mr-3 text-teal-400 font-bold">•</span>
                Consider the size of the population when evaluating evidence
              </li>
            </ul>
          </div>
        </div>

        {/* Selected fallacy demonstration */}
        <div>
          {fallacies[selectedFallacy].component}
        </div>
      </div>
    </VisualizationContainer>
    </>
  );
}