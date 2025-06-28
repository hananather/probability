"use client";

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { GraphContainer } from "@/components/ui/VisualizationContainer";
import { Button } from "@/components/ui/button";
import { useSafeMathJax } from "@/utils/mathJaxFix";
import { colorSchemes } from "@/lib/design-system";
import { Factory, Package, BarChart, Play, RotateCcw } from "lucide-react";

const WhatAreSamplingDistributions = () => {
  const [stage, setStage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [samples, setSamples] = useState([]);
  const [sampleMeans, setSampleMeans] = useState([]);
  const factoryRef = useRef(null);
  const sampleRef = useRef(null);
  const distributionRef = useRef(null);

  // Factory parameters
  const populationMean = 100; // Target widget weight
  const populationStd = 10;   // Natural variation
  
  // Generate a widget weight from the population
  const generateWidget = () => {
    const normal = d3.randomNormal(populationMean, populationStd);
    return normal();
  };

  // Take a sample of widgets
  const takeSample = (sampleSize = 5) => {
    const newSample = Array.from({ length: sampleSize }, generateWidget);
    const mean = d3.mean(newSample);
    
    setSamples(prev => [...prev, newSample]);
    setSampleMeans(prev => [...prev, mean]);
    
    return { sample: newSample, mean };
  };

  // Animate taking a single sample
  const animateSingleSample = async () => {
    setIsAnimating(true);
    const { sample, mean } = takeSample();
    
    // Animate widgets coming off production line
    if (factoryRef.current) {
      const svg = d3.select(factoryRef.current);
      const widgets = svg.selectAll(".widget")
        .data(sample)
        .enter()
        .append("g")
        .attr("class", "widget")
        .attr("transform", (d, i) => `translate(${50 + i * 60}, -50)`);
      
      widgets.append("rect")
        .attr("width", 40)
        .attr("height", 40)
        .attr("rx", 8)
        .attr("fill", colorSchemes.probability.primary);
      
      widgets.append("text")
        .attr("x", 20)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text(d => d.toFixed(0));
      
      // Animate widgets moving down
      await widgets.transition()
        .duration(1000)
        .attr("transform", (d, i) => `translate(${50 + i * 60}, 150)`)
        .end();
      
      // Show the mean
      const meanGroup = svg.append("g")
        .attr("class", "sample-mean")
        .attr("transform", "translate(200, 250)")
        .attr("opacity", 0);
      
      meanGroup.append("rect")
        .attr("x", -40)
        .attr("y", -20)
        .attr("width", 80)
        .attr("height", 40)
        .attr("rx", 20)
        .attr("fill", colorSchemes.inference.primary);
      
      meanGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 5)
        .attr("fill", "white")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(`x̄ = ${mean.toFixed(1)}`);
      
      await meanGroup.transition()
        .duration(500)
        .attr("opacity", 1)
        .end();
      
      // Clean up after delay
      setTimeout(() => {
        widgets.transition()
          .duration(500)
          .attr("opacity", 0)
          .remove();
        meanGroup.transition()
          .duration(500)
          .attr("opacity", 0)
          .remove();
      }, 2000);
    }
    
    setIsAnimating(false);
  };

  // Animate taking multiple samples
  const animateMultipleSamples = async () => {
    setIsAnimating(true);
    
    for (let i = 0; i < 20; i++) {
      await animateSingleSample();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsAnimating(false);
  };

  // Update sampling distribution visualization
  useEffect(() => {
    if (!distributionRef.current || sampleMeans.length === 0) return;

    const svg = d3.select(distributionRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create histogram
    const bins = d3.histogram()
      .domain([80, 120])
      .thresholds(15)(sampleMeans);

    const x = d3.scaleLinear()
      .domain([80, 120])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height, 0]);

    // Draw bars
    g.selectAll(".bar")
      .data(bins)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.x0))
      .attr("y", height)
      .attr("width", d => x(d.x1) - x(d.x0) - 1)
      .attr("fill", colorSchemes.inference.primary)
      .attr("opacity", 0.8)
      .transition()
      .duration(500)
      .attr("y", d => y(d.length))
      .attr("height", d => height - y(d.length));

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

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
      .text("Sample Mean");

    // Add theoretical curve if enough samples
    if (sampleMeans.length >= 10) {
      const standardError = populationStd / Math.sqrt(5); // sample size = 5
      const normalCurve = d3.range(80, 120, 0.5).map(x => ({
        x: x,
        y: (1 / (standardError * Math.sqrt(2 * Math.PI))) * 
           Math.exp(-0.5 * Math.pow((x - populationMean) / standardError, 2))
      }));

      const yScale = height / (d3.max(bins, d => d.length) / sampleMeans.length * 40);

      const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y * yScale * sampleMeans.length))
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
    }
  }, [sampleMeans]);

  const mathJaxRef = useRef(null);
  useSafeMathJax(mathJaxRef, [stage]);

  const reset = () => {
    setSamples([]);
    setSampleMeans([]);
    setStage(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">What Are Sampling Distributions?</h2>
        
        {/* Stage-based content */}
        <div className="space-y-6">
          {stage >= 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Factory className="w-8 h-8 text-blue-400" />
                <h3 className="text-lg font-semibold">Stage 1: The Widget Factory Problem</h3>
              </div>
              <p className="text-gray-300">
                Imagine a factory that produces widgets. Each widget should weigh exactly 100g, 
                but due to natural variation, some weigh a bit more, some a bit less. The weights 
                follow a normal distribution with mean μ = 100g and standard deviation σ = 10g.
              </p>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400">
                  <strong className="text-gray-200">The Challenge:</strong> Quality control can't 
                  weigh every single widget. Instead, they take samples and measure the average 
                  weight of each sample. But how reliable are these sample averages?
                </p>
              </div>
            </div>
          )}

          {stage >= 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-8 h-8 text-yellow-400" />
                <h3 className="text-lg font-semibold">Stage 2: Taking One Sample</h3>
              </div>
              <p className="text-gray-300">
                Let's take a sample of 5 widgets and calculate their average weight. 
                Watch as widgets come off the production line:
              </p>
              
              <GraphContainer height="350px">
                <svg ref={factoryRef} className="w-full h-full" />
              </GraphContainer>

              <div className="flex gap-4">
                <Button 
                  onClick={animateSingleSample}
                  disabled={isAnimating}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Take One Sample
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
                <BarChart className="w-8 h-8 text-green-400" />
                <h3 className="text-lg font-semibold">Stage 3: The Pattern Emerges</h3>
              </div>
              <p className="text-gray-300">
                Now let's take many samples and plot all the sample means. 
                Watch what happens to the distribution of these averages:
              </p>
              
              <GraphContainer height="350px">
                <svg ref={distributionRef} className="w-full h-full" />
              </GraphContainer>

              <div className="flex gap-4">
                <Button 
                  onClick={animateMultipleSamples}
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

              {sampleMeans.length >= 10 && (
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-300">
                    <strong className="text-blue-400">🎯 Key Insight:</strong> The sample means 
                    form their own distribution! This bell-shaped curve is called the 
                    <strong> sampling distribution of the mean</strong>. Notice how it centers 
                    around the true population mean (100g).
                  </p>
                </div>
              )}
            </div>
          )}

          {stage >= 4 && (
            <div className="space-y-4" ref={mathJaxRef}>
              <h3 className="text-lg font-semibold">Stage 4: The Mathematical Magic</h3>
              <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                <p className="text-gray-300">The sampling distribution has remarkable properties:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">1.</span>
                    <div>
                      <strong>Center:</strong> {`\\(E[\\bar{X}] = \\mu\\)`} 
                      <span className="text-gray-400 ml-2">(Sample means center around the population mean)</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">2.</span>
                    <div>
                      <strong>Spread:</strong> {`\\(\\text{SE} = \\frac{\\sigma}{\\sqrt{n}}\\)`}
                      <span className="text-gray-400 ml-2">(Larger samples → less variable means)</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">3.</span>
                    <div>
                      <strong>Shape:</strong> Approximately normal (even if population isn't!)
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {stage >= 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Stage 5: Why This Matters</h3>
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-600/30">
                <p className="text-gray-300 mb-3">
                  Sampling distributions are the foundation of statistical inference:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span><strong>Confidence Intervals:</strong> We can say "we're 95% confident the true mean is within this range"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span><strong>Hypothesis Testing:</strong> We can test if a sample likely came from a certain population</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span><strong>Quality Control:</strong> We can detect when a process goes out of control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span><strong>Survey Accuracy:</strong> We can calculate margins of error for polls</span>
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

export default WhatAreSamplingDistributions;