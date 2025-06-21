"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { ProgressBar } from '../ui/ProgressBar';

// Use probability color scheme
const colorScheme = createColorScheme('probability');

// Gambler's Fallacy Simulator
const GamblersFallacy = memo(function GamblersFallacy() {
  const [history, setHistory] = useState([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [autoFlip, setAutoFlip] = useState(false);
  const svgRef = useRef(null);

  const flipCoin = () => {
    const result = Math.random() < 0.5 ? 'H' : 'T';
    setHistory(prev => [...prev.slice(-19), result]);
  };

  useEffect(() => {
    if (autoFlip) {
      const interval = setInterval(flipCoin, 500);
      return () => clearInterval(interval);
    }
  }, [autoFlip]);

  // Calculate streaks
  const currentStreak = history.length > 0 ? 
    history.slice().reverse().findIndex(flip => flip !== history[history.length - 1]) : 0;
  const streakType = history.length > 0 ? history[history.length - 1] : null;

  // Count heads and tails
  const headsCount = history.filter(f => f === 'H').length;
  const tailsCount = history.filter(f => f === 'T').length;
  const total = history.length;

  useEffect(() => {
    if (!svgRef.current || history.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 100;
    const coinSize = 25;
    const spacing = 5;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(10, 25)");

    // Draw coins
    const coins = g.selectAll("g.coin")
      .data(history.slice(-20))
      .enter()
      .append("g")
      .attr("class", "coin")
      .attr("transform", (d, i) => `translate(${i * (coinSize + spacing)}, 0)`);

    coins.append("circle")
      .attr("cx", coinSize / 2)
      .attr("cy", coinSize / 2)
      .attr("r", coinSize / 2)
      .attr("fill", d => d === 'H' ? colorScheme.primary : colorScheme.secondary)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    coins.append("text")
      .attr("x", coinSize / 2)
      .attr("y", coinSize / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#fff")
      .attr("font-weight", "bold")
      .attr("font-size", "14px")
      .text(d => d);

  }, [history]);

  return (
    <div className={cn(components.card, "p-4")}>
      <h3 className={cn(typography.h3, "mb-3")}>Gambler's Fallacy</h3>
      
      <p className={cn(typography.body, "text-sm mb-4")}>
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
            <span className={typography.label}>Heads</span>
            <span className={cn(typography.body, "font-mono")}>
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
            <span className={typography.label}>Tails</span>
            <span className={cn(typography.body, "font-mono")}>
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
        <div className={cn("p-3 rounded-lg mb-4", 
          streakType === 'H' ? "bg-blue-50" : "bg-purple-50"
        )}>
          <p className={cn(typography.body, "text-sm")}>
            Current streak: {currentStreak} {streakType === 'H' ? 'heads' : 'tails'} in a row!
          </p>
          <p className={cn(typography.body, "text-sm font-semibold mt-1")}>
            The probability of the next flip being {streakType === 'H' ? 'heads' : 'tails'} is still 50%!
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          onClick={flipCoin}
          disabled={autoFlip}
          variant="primary"
          size="sm"
        >
          Flip Coin
        </Button>
        <Button
          onClick={() => setAutoFlip(!autoFlip)}
          variant={autoFlip ? "secondary" : "primary"}
          size="sm"
        >
          {autoFlip ? "Stop" : "Auto Flip"}
        </Button>
        <Button
          onClick={() => setHistory([])}
          variant="secondary"
          size="sm"
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
    svg.selectAll("*").remove();

    const width = 600;
    const height = 300;
    const margin = { top: 40, right: 60, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

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
        .attr("fill", (d, i) => i === 0 ? colorScheme.primary : colorScheme.secondary);

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
        .text(d => `${formatNumber(d * 100, 1)}%`);

      // X-axis
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", innerWidth / 2)
        .attr("y", 40)
        .attr("fill", colors.text.primary)
        .attr("text-anchor", "middle")
        .text("Treatment");

      // Title
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", colors.text.primary)
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
          .attr("fill", (d, i) => i === 0 ? colorScheme.primary : colorScheme.secondary);

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
          .text(d => `${formatNumber(d * 100, 1)}%`);

        // Group title
        groupG.append("text")
          .attr("x", groupWidth / 2)
          .attr("y", innerHeight + 30)
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .attr("fill", colors.text.primary)
          .text(group);

        // Sample sizes
        groupG.append("text")
          .attr("x", groupWidth / 2)
          .attr("y", innerHeight + 45)
          .attr("text-anchor", "middle")
          .attr("font-size", "11px")
          .attr("fill", colors.text.secondary)
          .text(`(n = ${groupData.treatmentA.total + groupData.treatmentB.total})`);
      });

      // Title
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", colors.text.primary)
        .text("Success Rates by Severity");
    }

  }, [showSeparated]);

  return (
    <div className={cn(components.card, "p-4")}>
      <h3 className={cn(typography.h3, "mb-3")}>Simpson's Paradox</h3>
      
      <p className={cn(typography.body, "text-sm mb-4")}>
        A phenomenon where a trend appears in several groups but disappears or reverses when combined.
      </p>

      <svg ref={svgRef} className="w-full mb-4" />

      <div className={cn("p-3 rounded-lg mb-4", 
        showSeparated ? "bg-green-50" : "bg-amber-50"
      )}>
        <p className={cn(typography.body, "text-sm")}>
          {showSeparated ? (
            <>
              <strong>Separated view:</strong> Treatment A is better for both mild cases (93% vs 87%) 
              and severe cases (73% vs 69%).
            </>
          ) : (
            <>
              <strong>Combined view:</strong> Treatment B appears better overall (83% vs 78%), 
              but this is misleading!
            </>
          )}
        </p>
      </div>

      <Button
        onClick={() => setShowSeparated(!showSeparated)}
        variant="primary"
        className="w-full"
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
    <div className={cn(components.card, "p-4")}>
      <h3 className={cn(typography.h3, "mb-3")}>Base Rate Fallacy</h3>
      
      <p className={cn(typography.body, "text-sm mb-4")}>
        Ignoring base rates when evaluating probabilities, especially with rare conditions.
      </p>

      {/* Controls */}
      <div className="space-y-3 mb-4">
        <ControlGroup>
          <label className={typography.label}>
            Condition Prevalence: {formatNumber(prevalence * 100, 2)}%
          </label>
          <input
            type="range"
            min="0.0001"
            max="0.1"
            step="0.0001"
            value={prevalence}
            onChange={(e) => setPrevalence(parseFloat(e.target.value))}
            className="w-full"
          />
        </ControlGroup>

        <ControlGroup>
          <label className={typography.label}>
            Test Sensitivity: {formatNumber(sensitivity * 100, 1)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.01"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            className="w-full"
          />
        </ControlGroup>

        <ControlGroup>
          <label className={typography.label}>
            Test Specificity: {formatNumber(specificity * 100, 1)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.01"
            value={specificity}
            onChange={(e) => setSpecificity(parseFloat(e.target.value))}
            className="w-full"
          />
        </ControlGroup>
      </div>

      {/* Results */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className={typography.label}>True Positives:</span>
            <span className="ml-2 font-mono">{truePositive.toLocaleString()}</span>
          </div>
          <div>
            <span className={typography.label}>False Positives:</span>
            <span className="ml-2 font-mono text-red-600">{falsePositive.toLocaleString()}</span>
          </div>
          <div>
            <span className={typography.label}>True Negatives:</span>
            <span className="ml-2 font-mono">{trueNegative.toLocaleString()}</span>
          </div>
          <div>
            <span className={typography.label}>False Negatives:</span>
            <span className="ml-2 font-mono text-red-600">{falseNegative.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className={cn("p-3 rounded-lg", ppv > 0.5 ? "bg-green-50" : "bg-red-50")}>
        <p className={cn(typography.body, "text-sm font-semibold")}>
          If you test positive, the probability you actually have the condition is only{" "}
          <span className="text-lg">{formatNumber(ppv * 100, 1)}%</span>
        </p>
        {ppv < 0.5 && (
          <p className={cn(typography.body, "text-sm mt-1")}>
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
  const probabilityGivenMatch = 1 / Math.max(1, Math.round(expectedMatches));

  return (
    <div className={cn(components.card, "p-4")}>
      <h3 className={cn(typography.h3, "mb-3")}>Prosecutor's Fallacy</h3>
      
      <p className={cn(typography.body, "text-sm mb-4")}>
        Confusing P(evidence|innocent) with P(innocent|evidence).
      </p>

      <div className="space-y-3 mb-4">
        <ControlGroup>
          <label className={typography.label}>
            Population Size: {populationSize.toLocaleString()}
          </label>
          <input
            type="range"
            min="10000"
            max="10000000"
            step="10000"
            value={populationSize}
            onChange={(e) => setPopulationSize(parseInt(e.target.value))}
            className="w-full"
          />
        </ControlGroup>

        <ControlGroup>
          <label className={typography.label}>
            Match Probability: 1 in {Math.round(1/matchProbability).toLocaleString()}
          </label>
          <input
            type="range"
            min="-7"
            max="-3"
            step="0.1"
            value={Math.log10(matchProbability)}
            onChange={(e) => setMatchProbability(Math.pow(10, parseFloat(e.target.value)))}
            className="w-full"
          />
        </ControlGroup>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <p className={cn(typography.body, "text-sm")}>
          <strong>Scenario:</strong> DNA evidence matches with probability 1 in {Math.round(1/matchProbability).toLocaleString()}
        </p>
        <p className={cn(typography.body, "text-sm mt-2")}>
          <strong>Expected matches in population:</strong> {formatNumber(expectedMatches, 1)}
        </p>
      </div>

      <div className={cn("p-3 rounded-lg", expectedMatches > 1 ? "bg-amber-50" : "bg-green-50")}>
        <p className={cn(typography.body, "text-sm font-semibold")}>
          P(guilty|match) ≈ {formatNumber(probabilityGivenMatch * 100, 1)}%
        </p>
        <p className={cn(typography.body, "text-sm mt-1")}>
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
    <VisualizationContainer
      title="Probabilistic Fallacies Explorer"
      description="Understand common mistakes in probabilistic reasoning and how to avoid them"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fallacy selector */}
        <div>
          <div className={cn(components.card, "p-4 mb-6")}>
            <h3 className={cn(typography.h3, "mb-3")}>Select a Fallacy</h3>
            <div className="space-y-2">
              {Object.entries(fallacies).map(([key, fallacy]) => (
                <button
                  key={key}
                  onClick={() => setSelectedFallacy(key)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors",
                    selectedFallacy === key
                      ? "bg-blue-50 border-2 border-blue-300"
                      : "bg-gray-50 border-2 border-gray-200 hover:bg-gray-100"
                  )}
                >
                  <span className={cn(typography.body, "font-semibold")}>
                    {fallacy.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* General advice */}
          <div className={cn(components.card, "p-4")}>
            <h3 className={cn(typography.h3, "mb-3")}>How to Avoid These Fallacies</h3>
            <ul className="space-y-2">
              <li className={cn(typography.body, "text-sm flex items-start")}>
                <span className="mr-2">•</span>
                Always consider base rates and prior probabilities
              </li>
              <li className={cn(typography.body, "text-sm flex items-start")}>
                <span className="mr-2">•</span>
                Remember that independent events don't affect each other
              </li>
              <li className={cn(typography.body, "text-sm flex items-start")}>
                <span className="mr-2">•</span>
                Look at data from multiple perspectives before drawing conclusions
              </li>
              <li className={cn(typography.body, "text-sm flex items-start")}>
                <span className="mr-2">•</span>
                Be careful not to confuse P(A|B) with P(B|A)
              </li>
              <li className={cn(typography.body, "text-sm flex items-start")}>
                <span className="mr-2">•</span>
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
  );
}