"use client";

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { GraphContainer } from "@/components/ui/VisualizationContainer";
import { Button } from "@/components/ui/button";
import { useSafeMathJax } from "@/utils/mathJaxFix";
import { colorSchemes } from "@/lib/design-system";
import { Coins, BarChart2, Play, RotateCcw, TrendingUp } from "lucide-react";
import { RangeSlider } from "@/components/ui/RangeSlider";

const BuildingIntuition = () => {
  const [stage, setStage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [singleCoinFlips, setSingleCoinFlips] = useState([]);
  const [sampleSize, setSampleSize] = useState(10);
  const [samples, setSamples] = useState([]);
  const [sampleProportions, setSampleProportions] = useState([]);
  
  const coinRef = useRef(null);
  const multiCoinRef = useRef(null);
  const distributionRef = useRef(null);
  const comparisonRef = useRef(null);

  // Flip a single coin
  const flipCoin = () => Math.random() < 0.5 ? 0 : 1;

  // Animate a single coin flip
  const animateSingleCoin = async () => {
    setIsAnimating(true);
    const result = flipCoin();
    setSingleCoinFlips(prev => [...prev, result]);

    if (coinRef.current) {
      const svg = d3.select(coinRef.current);
      svg.selectAll("*").remove();

      const coin = svg.append("g")
        .attr("transform", "translate(200, 150)");

      // Create coin
      coin.append("circle")
        .attr("r", 60)
        .attr("fill", result ? colorSchemes.probability.primary : colorSchemes.probability.secondary)
        .attr("stroke", "white")
        .attr("stroke-width", 3);

      coin.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 10)
        .attr("font-size", "36px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .text(result ? "H" : "T");

      // Flip animation
      await coin.transition()
        .duration(300)
        .attr("transform", "translate(200, 150) scaleX(0)")
        .transition()
        .duration(300)
        .attr("transform", "translate(200, 150) scaleX(1)")
        .end();

      // Pulse effect
      coin.transition()
        .duration(200)
        .attr("transform", "translate(200, 150) scale(1.1)")
        .transition()
        .duration(200)
        .attr("transform", "translate(200, 150) scale(1)");
    }

    setIsAnimating(false);
  };

  // Animate multiple coin flips
  const animateMultipleCoins = async () => {
    setIsAnimating(true);
    const results = Array.from({ length: sampleSize }, flipCoin);
    const headsCount = results.reduce((sum, coin) => sum + coin, 0);
    const proportion = headsCount / sampleSize;
    
    setSamples(prev => [...prev, results]);
    setSampleProportions(prev => [...prev, proportion]);

    if (multiCoinRef.current) {
      const svg = d3.select(multiCoinRef.current);
      svg.selectAll("*").remove();

      const width = 400;
      const height = 300;
      const coinRadius = Math.min(30, width / (2 * Math.ceil(Math.sqrt(sampleSize))));
      const cols = Math.ceil(Math.sqrt(sampleSize));
      const rows = Math.ceil(sampleSize / cols);
      
      const coins = svg.selectAll(".coin")
        .data(results)
        .enter()
        .append("g")
        .attr("class", "coin")
        .attr("transform", (d, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = (width / (cols + 1)) * (col + 1);
          const y = (height / (rows + 1)) * (row + 1);
          return `translate(${x}, ${y})`;
        });

      // Initial state (all gray)
      coins.append("circle")
        .attr("r", coinRadius * 0.8)
        .attr("fill", "#374151")
        .attr("stroke", "white")
        .attr("stroke-width", 2);

      // Flip animation
      for (let i = 0; i < results.length; i++) {
        const coin = coins.filter((d, idx) => idx === i);
        
        await coin.select("circle")
          .transition()
          .duration(100)
          .attr("transform", "scaleX(0)")
          .transition()
          .duration(100)
          .attr("transform", "scaleX(1)")
          .attr("fill", results[i] ? colorSchemes.probability.primary : colorSchemes.probability.secondary)
          .end();

        coin.append("text")
          .attr("text-anchor", "middle")
          .attr("y", 5)
          .attr("font-size", `${coinRadius * 0.8}px`)
          .attr("font-weight", "bold")
          .attr("fill", "white")
          .text(results[i] ? "H" : "T")
          .attr("opacity", 0)
          .transition()
          .duration(200)
          .attr("opacity", 1);
      }

      // Show summary
      const summary = svg.append("g")
        .attr("transform", `translate(${width/2}, ${height - 20})`)
        .attr("opacity", 0);

      summary.append("rect")
        .attr("x", -60)
        .attr("y", -15)
        .attr("width", 120)
        .attr("height", 30)
        .attr("rx", 15)
        .attr("fill", colorSchemes.inference.primary);

      summary.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 5)
        .attr("fill", "white")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(`${headsCount} heads (${(proportion * 100).toFixed(0)}%)`);

      await summary.transition()
        .delay(500)
        .duration(500)
        .attr("opacity", 1)
        .end();
    }

    setIsAnimating(false);
  };

  // Update distribution visualization
  useEffect(() => {
    if (!distributionRef.current || sampleProportions.length === 0) return;

    const svg = d3.select(distributionRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create histogram
    const bins = d3.histogram()
      .domain([0, 1])
      .thresholds(d3.range(0, 1.1, 0.1))(sampleProportions);

    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height, 0]);

    // Draw bars with animation
    const bars = g.selectAll(".bar")
      .data(bins)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.x0))
      .attr("y", height)
      .attr("width", d => x(d.x1) - x(d.x0) - 1)
      .attr("fill", colorSchemes.inference.primary)
      .attr("opacity", 0.8);

    bars.transition()
      .duration(500)
      .attr("y", d => y(d.length))
      .attr("height", d => height - y(d.length));

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => `${(d * 100).toFixed(0)}%`));

    g.append("g")
      .call(d3.axisLeft(y).ticks(5));

    // Add labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text("Frequency");

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom})`)
      .style("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text("Proportion of Heads");

    // Add theoretical curve if enough samples
    if (sampleProportions.length >= 10) {
      const p = 0.5;
      const standardError = Math.sqrt(p * (1 - p) / sampleSize);
      
      const normalCurve = d3.range(0, 1, 0.01).map(x => ({
        x: x,
        y: (1 / (standardError * Math.sqrt(2 * Math.PI))) * 
           Math.exp(-0.5 * Math.pow((x - p) / standardError, 2))
      }));

      const yScale = height / (d3.max(bins, d => d.length) / sampleProportions.length);

      const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y * yScale * sampleProportions.length * 0.1))
        .curve(d3.curveBasis);

      g.append("path")
        .datum(normalCurve)
        .attr("fill", "none")
        .attr("stroke", colorSchemes.inference.secondary)
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("opacity", 0)
        .transition()
        .delay(500)
        .duration(1000)
        .attr("opacity", 1);

      // Add vertical line at 0.5
      g.append("line")
        .attr("x1", x(0.5))
        .attr("x2", x(0.5))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0.5);
    }
  }, [sampleProportions, sampleSize]);

  // Compare different sample sizes
  useEffect(() => {
    if (!comparisonRef.current || stage < 5) return;

    const svg = d3.select(comparisonRef.current);
    svg.selectAll("*").remove();

    const sampleSizes = [5, 20, 100];
    const width = 600;
    const height = 200;
    const chartWidth = width / 3 - 20;

    sampleSizes.forEach((n, i) => {
      const g = svg.append("g")
        .attr("transform", `translate(${i * (chartWidth + 20) + 10}, 10)`);

      // Generate theoretical distribution
      const p = 0.5;
      const se = Math.sqrt(p * (1 - p) / n);
      
      const x = d3.scaleLinear()
        .domain([0, 1])
        .range([0, chartWidth]);

      const y = d3.scaleLinear()
        .domain([0, 1 / (se * Math.sqrt(2 * Math.PI))])
        .range([height - 40, 10]);

      const normalCurve = d3.range(0, 1, 0.01).map(x => ({
        x: x,
        y: (1 / (se * Math.sqrt(2 * Math.PI))) * 
           Math.exp(-0.5 * Math.pow((x - p) / se, 2))
      }));

      const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y))
        .curve(d3.curveBasis);

      // Draw curve
      g.append("path")
        .datum(normalCurve)
        .attr("fill", colorSchemes.probability.primary)
        .attr("fill-opacity", 0.3)
        .attr("stroke", colorSchemes.probability.primary)
        .attr("stroke-width", 2)
        .attr("d", line);

      // Add axis
      g.append("g")
        .attr("transform", `translate(0,${height - 40})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${(d * 100).toFixed(0)}%`))
        .selectAll("text")
        .style("font-size", "10px");

      // Add label
      g.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "white")
        .text(`n = ${n}`);

      // Add SE label
      g.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", colorSchemes.probability.secondary)
        .text(`SE = ${se.toFixed(3)}`);
    });
  }, [stage]);

  const mathJaxRef = useRef(null);
  useSafeMathJax(mathJaxRef, [stage]);

  const reset = () => {
    setSingleCoinFlips([]);
    setSamples([]);
    setSampleProportions([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Building Intuition with Coins</h2>
        
        {/* Stage-based content */}
        <div className="space-y-6">
          {stage >= 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Coins className="w-8 h-8 text-yellow-400" />
                <h3 className="text-lg font-semibold">Stage 1: A Single Fair Coin</h3>
              </div>
              <p className="text-gray-300">
                Let's start simple. A fair coin has a 50% chance of landing heads. 
                Flip it many times and you'll see roughly half heads, half tails.
              </p>
              
              <GraphContainer height="300px">
                <svg ref={coinRef} className="w-full h-full" />
              </GraphContainer>

              <div className="flex gap-4 items-center">
                <Button 
                  onClick={animateSingleCoin}
                  disabled={isAnimating}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Flip Once
                </Button>
                <div className="text-sm text-gray-400">
                  Results: {singleCoinFlips.filter(f => f === 1).length} heads, 
                  {singleCoinFlips.filter(f => f === 0).length} tails
                  {singleCoinFlips.length > 0 && 
                    ` (${((singleCoinFlips.filter(f => f === 1).length / singleCoinFlips.length) * 100).toFixed(1)}% heads)`
                  }
                </div>
              </div>
            </div>
          )}

          {stage >= 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Coins className="w-8 h-8 text-amber-400" />
                <h3 className="text-lg font-semibold">Stage 2: Multiple Coins at Once</h3>
              </div>
              <p className="text-gray-300">
                Now let's flip {sampleSize} coins at once and count the proportion of heads. 
                This is one sample. What happens when we repeat this many times?
              </p>
              
              <div className="mb-4">
                <label className="text-sm text-gray-400 block mb-2">
                  Number of coins per sample: {sampleSize}
                </label>
                <RangeSlider
                  value={[sampleSize]}
                  onValueChange={(value) => setSampleSize(value[0])}
                  min={5}
                  max={50}
                  step={5}
                  className="w-64"
                />
              </div>

              <GraphContainer height="300px">
                <svg ref={multiCoinRef} className="w-full h-full" />
              </GraphContainer>

              <div className="flex gap-4">
                <Button 
                  onClick={animateMultipleCoins}
                  disabled={isAnimating}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Flip {sampleSize} Coins
                </Button>
                <div className="text-sm text-gray-400 flex items-center">
                  Samples taken: {samples.length}
                </div>
              </div>
            </div>
          )}

          {stage >= 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <BarChart2 className="w-8 h-8 text-green-400" />
                <h3 className="text-lg font-semibold">Stage 3: The Pattern Emerges</h3>
              </div>
              <p className="text-gray-300">
                Each sample gives us a proportion of heads. Let's plot all these proportions 
                and see what pattern emerges:
              </p>
              
              <GraphContainer height="350px">
                <svg ref={distributionRef} className="w-full h-full" />
              </GraphContainer>

              <div className="flex gap-4">
                <Button 
                  onClick={() => {
                    for (let i = 0; i < 20; i++) {
                      setTimeout(() => animateMultipleCoins(), i * 100);
                    }
                  }}
                  disabled={isAnimating}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Take 20 Samples
                </Button>
                <Button 
                  onClick={reset}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>

              {sampleProportions.length >= 10 && (
                <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4 mt-4">
                  <p className="text-sm text-amber-300">
                    <strong className="text-amber-400">🎯 Key Insight:</strong> The proportions 
                    cluster around 50%! The orange curve shows the theoretical sampling distribution. 
                    Notice how most samples give proportions close to the true value of 0.5.
                  </p>
                </div>
              )}
            </div>
          )}

          {stage >= 4 && (
            <div className="space-y-4" ref={mathJaxRef}>
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-blue-400" />
                <h3 className="text-lg font-semibold">Stage 4: The Mathematics</h3>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                <p className="text-gray-300">For coin flips (or any proportion):</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <div>
                      <strong>Expected value:</strong> {`\\(E[\\hat{p}] = p = 0.5\\)`}
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <div>
                      <strong>Standard error:</strong> {`\\(SE = \\sqrt{\\frac{p(1-p)}{n}} = \\sqrt{\\frac{0.5 \\times 0.5}{n}}\\)`}
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <div>
                      <strong>For n = {sampleSize}:</strong> {`\\(SE = ${Math.sqrt(0.25 / sampleSize).toFixed(3)}\\)`}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {stage >= 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Stage 5: Sample Size Matters!</h3>
              <p className="text-gray-300">
                Larger samples give more precise estimates. Compare the sampling distributions 
                for different sample sizes:
              </p>
              
              <GraphContainer height="250px">
                <svg ref={comparisonRef} className="w-full h-full" />
              </GraphContainer>

              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-600/30">
                <p className="text-sm text-blue-300 mb-3">
                  <strong className="text-blue-400">💡 Key Takeaways:</strong>
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Larger samples → Narrower distribution → More precise estimates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>The √n in the denominator is why we need 4× more data for 2× precision</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>This principle applies to all sampling situations, not just coins!</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-gray-400">
            Stage {stage} of 5
          </div>
          <div className="flex gap-4">
            {stage > 1 && (
              <Button 
                onClick={() => setStage(stage - 1)}
                variant="outline"
              >
                Previous
              </Button>
            )}
            {stage < 5 && (
              <Button 
                onClick={() => setStage(stage + 1)}
              >
                Next Stage
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingIntuition;