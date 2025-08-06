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

export default function PValueMeaning() {
  // State
  const [currentPValue, setCurrentPValue] = useState(null);
  const [showConceptualIntro, setShowConceptualIntro] = useState(true);
  const [pValues, setPValues] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [highlightRejected, setHighlightRejected] = useState(false);
  const [currentTestData, setCurrentTestData] = useState(null);
  
  // Refs for D3 visualizations
  const scaleRef = useRef(null);
  const histogramRef = useRef(null);
  
  // Constants
  const SAMPLES_PER_TEST = 100;
  const BINS_COUNT = 20;
  const SIGNIFICANCE_LEVEL = 0.05;
  
  // Test if random numbers are uniformly distributed
  const testUniformity = () => {
    const bins = new Array(10).fill(0);
    const samples = [];
    
    // Generate random samples
    for (let i = 0; i < SAMPLES_PER_TEST; i++) {
      const value = Math.random();
      samples.push(value);
      // Ensure bin index is within bounds [0-9]
      const bin = Math.min(9, Math.floor(value * 10));
      bins[bin]++;
    }
    
    // Chi-square test for uniformity
    const expected = SAMPLES_PER_TEST / 10;
    const chiSquare = bins.reduce((sum, observed) => {
      const diff = observed - expected;
      return sum + (diff * diff) / expected;
    }, 0);
    
    // Calculate p-value (9 degrees of freedom for 10 bins)
    const pValue = 1 - jStat.chisquare.cdf(chiSquare, 9);
    
    return { pValue, bins, samples, chiSquare };
  };
  
  // Run a single test
  const runSingleTest = () => {
    if (isRunning) return;
    
    const result = testUniformity();
    setCurrentPValue(result.pValue);
    setCurrentTestData(result);
    setPValues([result.pValue]); // Reset to show just this test
    
    updatePValueScale(result.pValue);
    updateHistogram([result.pValue]);
  };
  
  // Run multiple tests
  const runMultipleTests = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setPValues([]); // Clear previous results
    setCurrentPValue(null);
    setCurrentTestData(null);
    
    const newPValues = [];
    
    // Run tests in batches for visual effect
    for (let batch = 0; batch < 10; batch++) {
      const batchPValues = [];
      
      for (let i = 0; i < 10; i++) {
        const result = testUniformity();
        batchPValues.push(result.pValue);
      }
      
      newPValues.push(...batchPValues);
      setPValues([...newPValues]);
      updateHistogram(newPValues);
      
      // Pause between batches for visual effect
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsRunning(false);
  };
  
  // Get insight based on current state
  const getInsight = () => {
    if (pValues.length === 0) {
      return {
        title: "Test Random Number Generator",
        content: "We'll test if Math.random() produces truly uniform random numbers.",
        color: "#14b8a6"
      };
    }
    
    if (pValues.length === 1 && currentPValue !== null) {
      if (currentPValue < 0.01) {
        return {
          title: "Very Surprising Result!",
          content: `P-value of ${currentPValue.toFixed(4)} means less than ${(currentPValue * 100).toFixed(2)}% chance of seeing this if truly random. But wait...`,
          color: "#ef4444"
        };
      }
      if (currentPValue < 0.05) {
        return {
          title: "Statistically Significant!",
          content: `P-value of ${currentPValue.toFixed(4)}. We'd reject the null hypothesis at α=0.05. But is the generator really broken?`,
          color: "#f59e0b"
        };
      }
      if (currentPValue < 0.1) {
        return {
          title: "Borderline Result",
          content: `P-value of ${currentPValue.toFixed(4)}. Some might call this "marginally significant" but it's likely just chance.`,
          color: "#eab308"
        };
      }
      return {
        title: "Nothing Unusual",
        content: `P-value of ${currentPValue.toFixed(4)}. This is exactly what we'd expect from a fair random number generator.`,
          color: "#10b981"
      };
    }
    
    const rejectedCount = pValues.filter(p => p < SIGNIFICANCE_LEVEL).length;
    const rejectionRate = pValues.length > 0 ? rejectedCount / pValues.length : 0;
    
    if (pValues.length < 50) {
      return {
        title: "Building Evidence...",
        content: `${rejectedCount} out of ${pValues.length} tests rejected (${(rejectionRate * 100).toFixed(1)}%). Watch the pattern emerge!`,
        color: "#8b5cf6"
      };
    }
    
    if (pValues.length === 100) {
      if (Math.abs(rejectionRate - 0.05) < 0.02) {
        return {
          title: "Perfect Demonstration!",
          content: `${(rejectionRate * 100).toFixed(1)}% false positives - almost exactly 5%! This is what "p < 0.05" really means.`,
          color: "#10b981"
        };
      }
      return {
        title: "Natural Variation",
        content: `${(rejectionRate * 100).toFixed(1)}% rejected. We expect ~5% false positives, but random variation means it won't be exactly 5%.`,
        color: "#14b8a6"
      };
    }
    
    return {
      title: "Insight",
      content: "Observing the distribution of p-values...",
      color: "#14b8a6"
    };
  };
  
  const insight = getInsight();
  const rejectedCount = pValues.filter(p => p < SIGNIFICANCE_LEVEL).length;
  const rejectionRate = pValues.length > 0 ? (rejectedCount / pValues.length * 100).toFixed(1) : 0;
  
  // Initialize p-value scale visualization
  useEffect(() => {
    if (!scaleRef.current) return;
    
    const svg = d3.select(scaleRef.current);
    svg.selectAll("*").remove();
    
    const width = scaleRef.current.clientWidth;
    const height = 50;
    const margin = { top: 15, right: 10, bottom: 20, left: 10 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const scaleWidth = width - margin.left - margin.right;
    
    // P-value scale
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, scaleWidth]);
    
    // Background gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "pvalue-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ef4444");
    
    gradient.append("stop")
      .attr("offset", "5%")
      .attr("stop-color", "#f59e0b");
    
    gradient.append("stop")
      .attr("offset", "10%")
      .attr("stop-color", "#eab308");
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#10b981");
    
    // Scale bar
    g.append("rect")
      .attr("width", scaleWidth)
      .attr("height", 12)
      .attr("fill", "url(#pvalue-gradient)")
      .attr("opacity", 0.8)
      .attr("rx", 2);
    
    // Significance threshold
    g.append("line")
      .attr("x1", x(SIGNIFICANCE_LEVEL))
      .attr("x2", x(SIGNIFICANCE_LEVEL))
      .attr("y1", -5)
      .attr("y2", 15)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3");
    
    g.append("text")
      .attr("x", x(SIGNIFICANCE_LEVEL))
      .attr("y", -8)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .style("font-size", "10px")
      .style("font-weight", "600")
      .text("α = 0.05");
    
    // Labels
    const labels = [
      { value: 0.01, text: "Very Strong" },
      { value: 0.05, text: "Strong" },
      { value: 0.1, text: "Weak" },
      { value: 0.5, text: "No Evidence" }
    ];
    
    labels.forEach(label => {
      g.append("text")
        .attr("x", x(label.value))
        .attr("y", 25)
        .attr("text-anchor", label.value < 0.2 ? "start" : "middle")
        .attr("fill", "#ffffff")
        .style("font-size", "9px")
        .text(label.text);
    });
    
    // Current p-value pointer
    g.append("polygon")
      .attr("class", "pvalue-pointer")
      .attr("points", "-6,0 6,0 0,8")
      .attr("fill", "#ffffff")
      .style("opacity", 0);
    
  }, []);
  
  // Update p-value pointer
  function updatePValueScale(pValue) {
    if (!scaleRef.current || pValue === null) return;
    
    const svg = d3.select(scaleRef.current);
    const width = scaleRef.current.clientWidth;
    const margin = { left: 20, right: 20 };
    const scaleWidth = width - margin.left - margin.right;
    
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, scaleWidth]);
    
    svg.select(".pvalue-pointer")
      .style("opacity", 1)
      .transition()
      .duration(500)
      .attr("transform", `translate(${margin.left + x(pValue)}, 20)`);
  }
  
  // Initialize histogram
  useEffect(() => {
    if (!histogramRef.current) return;
    
    const svg = d3.select(histogramRef.current);
    svg.selectAll("*").remove();
    
    const width = histogramRef.current.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Scales
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, 20])
      .range([innerHeight, 0]);
    
    // X axis
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(10))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", "#ffffff")
      .style("text-anchor", "middle")
      .text("P-Value");
    
    // Y axis
    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#ffffff")
      .style("text-anchor", "middle")
      .text("Count");
    
    // Create expected line elements (hidden initially)
    g.append("line")
      .attr("class", "expected-line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#8b5cf6")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .style("opacity", 0);
    
    g.append("text")
      .attr("class", "expected-label")
      .attr("x", innerWidth - 5)
      .attr("y", 0)
      .attr("text-anchor", "end")
      .attr("fill", "#8b5cf6")
      .style("font-size", "11px")
      .style("opacity", 0)
      .text("Expected if uniform");
    
    // Container for bars
    g.append("g").attr("class", "bars-container");
    
  }, []); // Only create once on mount
  
  // Update histogram
  function updateHistogram(values) {
    if (!histogramRef.current || values.length === 0) return;
    
    const svg = d3.select(histogramRef.current);
    const g = svg.select("g");
    const barsContainer = g.select(".bars-container");
    
    // Update expected line if we have enough data
    if (values.length > 20) {
      const expectedHeight = values.length / BINS_COUNT;
      const innerHeight = 300 - 20 - 40; // height - margin.top - margin.bottom
      
      const y = d3.scaleLinear()
        .domain([0, Math.max(20, d3.max(values, () => values.length / BINS_COUNT) * 1.5)])
        .range([innerHeight, 0]);
      
      g.select(".expected-line")
        .transition()
        .duration(300)
        .attr("y1", y(expectedHeight))
        .attr("y2", y(expectedHeight))
        .style("opacity", 0.8);
      
      g.select(".expected-label")
        .transition()
        .duration(300)
        .attr("y", y(expectedHeight) - 5)
        .style("opacity", 1);
    } else {
      // Hide expected line if not enough data
      g.select(".expected-line").style("opacity", 0);
      g.select(".expected-label").style("opacity", 0);
    }
    
    const width = histogramRef.current.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create histogram
    const histogram = d3.histogram()
      .domain([0, 1])
      .thresholds(BINS_COUNT);
    
    const bins = histogram(values);
    
    // Update scales
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, innerWidth]);
    
    const maxCount = d3.max(bins, d => d.length);
    const y = d3.scaleLinear()
      .domain([0, Math.max(20, maxCount * 1.1)])
      .range([innerHeight, 0]);
    
    // Update y axis
    g.select(".y-axis")
      .transition()
      .duration(300)
      .call(d3.axisLeft(y));
    
    // Update bars
    const bars = barsContainer.selectAll(".bar")
      .data(bins, d => d.x0);
    
    // Enter
    const barsEnter = bars.enter()
      .append("g")
      .attr("class", "bar");
    
    barsEnter.append("rect")
      .attr("x", d => x(d.x0) + 1)
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 2))
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("fill", d => d.x0 < SIGNIFICANCE_LEVEL ? "#ef4444" : "#3b82f6")
      .attr("opacity", 0.8);
    
    barsEnter.append("text")
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .style("font-size", "11px")
      .style("font-weight", "600");
    
    // Update
    const allBars = bars.merge(barsEnter);
    
    allBars.select("rect")
      .transition()
      .duration(300)
      .attr("x", d => x(d.x0) + 1)
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 2))
      .attr("y", d => y(d.length))
      .attr("height", d => innerHeight - y(d.length))
      .attr("fill", d => d.x0 < SIGNIFICANCE_LEVEL ? "#ef4444" : "#3b82f6")
      .attr("opacity", d => {
        if (!highlightRejected) return 0.8;
        return d.x0 < SIGNIFICANCE_LEVEL ? 1 : 0.3;
      });
    
    allBars.select("text")
      .attr("x", d => x(d.x0 + (d.x1 - d.x0) / 2))
      .attr("y", d => y(d.length) - 5)
      .text(d => d.length > 0 ? d.length : "")
      .style("opacity", d => d.length > 0 ? 1 : 0);
    
    // Exit
    bars.exit().remove();
  }
  
  // Reset function
  const reset = () => {
    setPValues([]);
    setCurrentPValue(null);
    setCurrentTestData(null);
    setHighlightRejected(false);
    updateHistogram([]);
    
    // Hide pointer
    if (scaleRef.current) {
      d3.select(scaleRef.current)
        .select(".pvalue-pointer")
        .style("opacity", 0);
    }
  };
  
  return (
    <VisualizationContainer
      title="P-Values: What They Really Mean"
      description="Test a perfectly good random number generator and see how often it looks 'broken'"
    >
      {/* Conceptual Foundation Section */}
      {showConceptualIntro && (
        <div className="mb-6 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-lg p-6 border border-teal-500/20">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-teal-400">Understanding P-Values: The Foundation</h3>
            <Button
              onClick={() => setShowConceptualIntro(false)}
              variant="ghost"
              size="sm"
              className="text-neutral-400 hover:text-neutral-200"
            >
              ✕
            </Button>
          </div>
          
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-neutral-200 mb-2">What is a P-Value?</h4>
              <p className="text-neutral-300 leading-relaxed">
                A p-value answers one specific question: <span className="font-semibold text-teal-300">"If the null hypothesis were true, 
                how surprising would our observed data be?"</span> It's the probability of getting results at least as extreme as what we observed, 
                assuming the null hypothesis is correct.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-200 mb-2">The Logic: Proof by Contradiction</h4>
              <p className="text-neutral-300 leading-relaxed mb-2">
                Hypothesis testing uses the same logic as proof by contradiction in mathematics:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-neutral-300 ml-2">
                <li>Assume the null hypothesis is true (e.g., "this coin is fair")</li>
                <li>Calculate how surprising our data would be under this assumption</li>
                <li>If the data would be very surprising (p &lt; 0.05), we reject our assumption</li>
                <li>Conclude the alternative hypothesis is more plausible</li>
              </ol>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
              <h4 className="font-semibold text-red-400 mb-2">⚠️ Common Misconceptions</h4>
              <ul className="text-xs text-neutral-300 space-y-1">
                <li>• <span className="text-red-300">Wrong:</span> "P = 0.03 means 3% chance the null hypothesis is true"</li>
                <li>• <span className="text-green-300">Right:</span> "P = 0.03 means if the null were true, we'd see data this extreme only 3% of the time"</li>
                <li className="mt-2">• <span className="text-red-300">Wrong:</span> "P = 0.03 means 97% chance our alternative hypothesis is correct"</li>
                <li>• <span className="text-green-300">Right:</span> "P = 0.03 means our data is surprising under the null hypothesis"</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-200 mb-2">Why 0.05?</h4>
              <p className="text-neutral-300 leading-relaxed">
                The 0.05 threshold is a convention, not a law of nature. It means we're willing to falsely reject a true null hypothesis 
                5% of the time. This 5% false positive rate (Type I error) was chosen as a reasonable balance, but different fields and 
                situations may require different thresholds.
              </p>
            </div>
            
            <div className="bg-teal-500/10 border border-teal-500/30 rounded p-3">
              <p className="text-sm text-teal-300 font-semibold mb-1">🎯 Interactive Demo Below</p>
              <p className="text-xs text-neutral-300">
                We'll test a perfectly good random number generator repeatedly. Even though it's truly random, 
                about 5% of tests will show p &lt; 0.05 - these are false positives!
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls Section */}
        <div className="lg:col-span-1 space-y-4">
          <ControlGroup title="Random Number Test">
            <div className="space-y-3">
              <p className="text-sm text-neutral-300 leading-relaxed">
                We're testing if Math.random() produces truly uniform random numbers using a 
                <span className="font-semibold text-cyan-300"> chi-square goodness-of-fit test</span>.
              </p>
              
              <div className="bg-neutral-700/50 rounded p-3 text-xs space-y-2">
                <p className="text-neutral-300">
                  <span className="font-semibold">How it works:</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-neutral-400 ml-1">
                  <li>Generate 100 random numbers between 0 and 1</li>
                  <li>Count how many fall into each of 10 equal bins</li>
                  <li>Compare observed counts to expected (10 per bin)</li>
                  <li>Calculate chi-square statistic: measures total deviation</li>
                  <li>Convert to p-value: probability of this deviation by chance</li>
                </ol>
                <p className="text-neutral-300 mt-2">
                  <span className="font-semibold">The twist:</span> Math.random() IS truly random, 
                  so any "significant" results are false positives!
                </p>
              </div>
              
              <Button
                onClick={runSingleTest}
                disabled={isRunning}
                className="w-full"
                variant="default"
              >
                Test Once
              </Button>
              
              <Button
                onClick={runMultipleTests}
                disabled={isRunning}
                className="w-full"
                variant="secondary"
              >
                {isRunning ? "Running..." : "Test 100 Times"}
              </Button>
              
              {pValues.length > 1 && (
                <Button
                  onClick={() => setHighlightRejected(!highlightRejected)}
                  className="w-full"
                  variant={highlightRejected ? "destructive" : "outline"}
                >
                  {highlightRejected ? "Show All" : "Highlight p < 0.05"}
                </Button>
              )}
              
              <Button
                onClick={reset}
                className="w-full"
                variant="outline"
              >
                Reset
              </Button>
            </div>
          </ControlGroup>
          
          {pValues.length > 0 && (
            <ControlGroup title="Results Summary">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Tests run:</span>
                  <span className="font-mono font-semibold">{pValues.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Rejected (p &lt; 0.05):</span>
                  <span className="font-mono font-semibold text-red-400">
                    {rejectedCount} ({rejectionRate}%)
                  </span>
                </div>
                {currentPValue !== null && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Last p-value:</span>
                    <span className={cn(
                      "font-mono font-semibold",
                      currentPValue < 0.05 ? "text-red-400" : "text-green-400"
                    )}>
                      {currentPValue.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
              
              {pValues.length >= 50 && (
                <div className="mt-3 p-3 bg-neutral-700/50 rounded text-xs">
                  <p className="text-neutral-300">
                    Expected ~5% false positives, got {rejectionRate}%. 
                    {Math.abs(parseFloat(rejectionRate) - 5) < 2 
                      ? " That's perfectly normal variation!" 
                      : " Random variation means it won't always be exactly 5%."}
                  </p>
                </div>
              )}
            </ControlGroup>
          )}
          
          {currentTestData && (
            <ControlGroup title="Last Test Details">
              <div className="text-xs space-y-1">
                <div className="grid grid-cols-5 gap-1">
                  {currentTestData.bins.map((count, i) => (
                    <div key={i} className="text-center">
                      <div className="text-neutral-400">Bin {i + 1}</div>
                      <div className={cn(
                        "font-mono",
                        Math.abs(count - 10) > 5 ? "text-red-400" : "text-neutral-300"
                      )}>
                        {count}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-neutral-400 mt-2">
                  Chi-square: <span className="font-mono text-neutral-300">
                    {currentTestData.chiSquare.toFixed(2)}
                  </span>
                </div>
              </div>
            </ControlGroup>
          )}
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
          
          {/* P-Value Scale - Compact */}
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-neutral-300">P-Value Interpretation</span>
              {currentPValue !== null && (
                <span className={cn(
                  "text-sm font-mono font-bold",
                  currentPValue < 0.05 ? "text-red-400" : "text-green-400"
                )}>
                  p = {currentPValue.toFixed(4)}
                </span>
              )}
            </div>
            <svg ref={scaleRef} className="w-full"></svg>
          </div>
          
          {/* Histogram */}
          {pValues.length > 0 && (
            <GraphContainer title="Distribution of P-Values">
              <svg ref={histogramRef} className="w-full"></svg>
              {pValues.length > 20 && (
                <p className="text-xs text-neutral-400 mt-2">
                  Under the null hypothesis (generator is truly random), p-values should be uniformly distributed.
                </p>
              )}
            </GraphContainer>
          )}
          
          {/* Key Takeaways */}
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 text-teal-400">Key Takeaways</h4>
            <ul className="text-xs text-neutral-300 space-y-1">
              <li>• P-values measure surprise under the null hypothesis, not truth</li>
              <li>• Even perfectly fair systems produce "significant" results ~5% of the time</li>
              <li>• A single p &lt; 0.05 doesn't prove anything is wrong - it's just evidence</li>
              <li>• The p-value is NOT the probability that the null hypothesis is true</li>
              <li>• Multiple testing increases false positive rates dramatically</li>
              <li>• Statistical significance ≠ practical importance</li>
              <li>• P-values don't measure effect size - a tiny effect can have p &lt; 0.001</li>
            </ul>
          </div>
          
          {/* Why This Matters */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
            <h4 className="font-semibold text-sm mb-2 text-purple-400">Why This Matters</h4>
            <div className="text-xs text-neutral-300 space-y-2">
              <p className="leading-relaxed">
                Understanding p-values correctly is crucial for making sound decisions based on data. Misinterpreting them can lead to:
              </p>
              <ul className="space-y-1 ml-2">
                <li>• <span className="text-purple-300">False alarms:</span> Thinking something is wrong when it isn't</li>
                <li>• <span className="text-purple-300">Publication bias:</span> Only publishing "significant" results</li>
                <li>• <span className="text-purple-300">P-hacking:</span> Testing until you find p &lt; 0.05</li>
                <li>• <span className="text-purple-300">Poor decisions:</span> Acting on statistical noise rather than real effects</li>
              </ul>
              <p className="mt-2 leading-relaxed">
                Remember: Statistical significance ≠ practical importance. A very small effect can be statistically significant 
                with large samples, while a large effect might not reach significance with small samples.
              </p>
            </div>
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}