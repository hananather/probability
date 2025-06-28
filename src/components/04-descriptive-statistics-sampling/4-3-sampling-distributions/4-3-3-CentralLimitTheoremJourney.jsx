"use client";

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { GraphContainer } from "@/components/ui/VisualizationContainer";
import { Button } from "@/components/ui/button";
import { useSafeMathJax } from "@/utils/mathJaxFix";
import { colorSchemes } from "@/lib/design-system";
import { TrendingUp, Shuffle, Play, RotateCcw, Sparkles } from "lucide-react";
import { RangeSlider } from "@/components/ui/RangeSlider";

const CentralLimitTheoremJourney = () => {
  const [stage, setStage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [distributionType, setDistributionType] = useState('exponential');
  const [sampleSize, setSampleSize] = useState(5);
  const [samples, setSamples] = useState([]);
  const [sampleMeans, setSampleMeans] = useState([]);
  
  const populationRef = useRef(null);
  const samplingRef = useRef(null);
  const transformationRef = useRef(null);
  const comparisonRef = useRef(null);

  // Different population distributions
  const distributions = {
    exponential: {
      name: 'Exponential (Highly Skewed)',
      color: colorSchemes.probability.primary,
      generate: () => -Math.log(1 - Math.random()) * 50,
      range: [0, 200],
      mean: 50,
      std: 50
    },
    uniform: {
      name: 'Uniform (Flat)',
      color: colorSchemes.inference.primary,
      generate: () => Math.random() * 100,
      range: [0, 100],
      mean: 50,
      std: 28.87
    },
    bimodal: {
      name: 'Bimodal (Two Peaks)',
      color: colorSchemes.descriptive.primary,
      generate: () => {
        if (Math.random() < 0.5) {
          return d3.randomNormal(30, 10)();
        } else {
          return d3.randomNormal(70, 10)();
        }
      },
      range: [0, 100],
      mean: 50,
      std: 24
    },
    beta: {
      name: 'Beta (Moderately Skewed)',
      color: colorSchemes.probability.secondary,
      generate: () => {
        // Beta(2,5) scaled to [0,100]
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        const x = Math.pow(u, 1/2);
        const y = Math.pow(v, 1/5);
        return (x / (x + y)) * 100;
      },
      range: [0, 100],
      mean: 28.57,
      std: 16.1
    }
  };

  const currentDist = distributions[distributionType];

  // Generate population data for visualization
  const generatePopulationData = (n = 1000) => {
    return Array.from({ length: n }, () => currentDist.generate());
  };

  // Take a sample and calculate mean
  const takeSample = () => {
    const sample = Array.from({ length: sampleSize }, () => currentDist.generate());
    const mean = d3.mean(sample);
    setSamples(prev => [...prev, sample]);
    setSampleMeans(prev => [...prev, mean]);
    return { sample, mean };
  };

  // Animate the transformation
  const animateTransformation = async () => {
    setIsAnimating(true);
    
    // Take multiple samples quickly
    for (let i = 0; i < 50; i++) {
      takeSample();
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    setIsAnimating(false);
  };

  // Draw population distribution
  useEffect(() => {
    if (!populationRef.current || stage < 1) return;

    const svg = d3.select(populationRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Generate population data
    const data = generatePopulationData();

    // Create histogram
    const x = d3.scaleLinear()
      .domain(currentDist.range)
      .range([0, width]);

    const bins = d3.histogram()
      .domain(currentDist.range)
      .thresholds(30)(data);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height, 0]);

    // Draw bars
    g.selectAll(".bar")
      .data(bins)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.x0))
      .attr("y", d => y(d.length))
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("height", d => height - y(d.length))
      .attr("fill", currentDist.color)
      .attr("opacity", 0.7);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5));

    g.append("g")
      .call(d3.axisLeft(y).ticks(5));

    // Add mean line
    g.append("line")
      .attr("x1", x(currentDist.mean))
      .attr("x2", x(currentDist.mean))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "white")
      .text("Population Distribution");
  }, [distributionType, stage]);

  // Draw sampling distribution
  useEffect(() => {
    if (!samplingRef.current || sampleMeans.length === 0) return;

    const svg = d3.select(samplingRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Determine x domain based on theoretical standard error
    const theoreticalSE = currentDist.std / Math.sqrt(sampleSize);
    const xMin = currentDist.mean - 4 * theoreticalSE;
    const xMax = currentDist.mean + 4 * theoreticalSE;

    const x = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, width]);

    // Create histogram
    const bins = d3.histogram()
      .domain([xMin, xMax])
      .thresholds(20)(sampleMeans);

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
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("fill", colorSchemes.inference.primary)
      .attr("opacity", 0.7);

    bars.transition()
      .duration(300)
      .attr("y", d => y(d.length))
      .attr("height", d => height - y(d.length));

    // Add theoretical normal curve
    if (sampleMeans.length >= 20) {
      const normalCurve = d3.range(xMin, xMax, (xMax - xMin) / 100).map(x => ({
        x: x,
        y: (1 / (theoreticalSE * Math.sqrt(2 * Math.PI))) * 
           Math.exp(-0.5 * Math.pow((x - currentDist.mean) / theoreticalSE, 2))
      }));

      const yScale = height / (d3.max(bins, d => d.length) / sampleMeans.length * (xMax - xMin) / 20);

      const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y * yScale * sampleMeans.length))
        .curve(d3.curveBasis);

      g.append("path")
        .datum(normalCurve)
        .attr("fill", "none")
        .attr("stroke", colorSchemes.inference.secondary)
        .attr("stroke-width", 3)
        .attr("d", line)
        .attr("opacity", 0)
        .transition()
        .delay(300)
        .duration(700)
        .attr("opacity", 1);
    }

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5));

    g.append("g")
      .call(d3.axisLeft(y).ticks(5));

    // Add mean line
    g.append("line")
      .attr("x1", x(currentDist.mean))
      .attr("x2", x(currentDist.mean))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "white")
      .text("Sampling Distribution of Means");

    // Stats display
    if (sampleMeans.length > 0) {
      const observedMean = d3.mean(sampleMeans);
      const observedSD = d3.deviation(sampleMeans);
      
      const stats = g.append("g")
        .attr("transform", `translate(${width - 100}, 20)`);

      stats.append("rect")
        .attr("x", -10)
        .attr("y", -10)
        .attr("width", 110)
        .attr("height", 60)
        .attr("fill", "rgba(0,0,0,0.7)")
        .attr("rx", 5);

      stats.append("text")
        .attr("y", 10)
        .attr("font-size", "11px")
        .attr("fill", "white")
        .text(`n = ${sampleSize}`);

      stats.append("text")
        .attr("y", 25)
        .attr("font-size", "11px")
        .attr("fill", "white")
        .text(`μ̂ = ${observedMean.toFixed(1)}`);

      stats.append("text")
        .attr("y", 40)
        .attr("font-size", "11px")
        .attr("fill", "white")
        .text(`SE = ${observedSD?.toFixed(1) || '...'}`);
    }
  }, [sampleMeans, sampleSize, currentDist]);

  // Visual transformation animation
  useEffect(() => {
    if (!transformationRef.current || stage < 3) return;

    const svg = d3.select(transformationRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 150;
    const sampleSizes = [1, 5, 30, 100];

    sampleSizes.forEach((n, i) => {
      const g = svg.append("g")
        .attr("transform", `translate(${i * 150 + 25}, 20)`);

      // Mini histogram showing shape
      const theoreticalSE = n === 1 ? currentDist.std : currentDist.std / Math.sqrt(n);
      const spread = 3 * theoreticalSE;
      
      const x = d3.scaleLinear()
        .domain([currentDist.mean - spread, currentDist.mean + spread])
        .range([0, 100]);

      const y = d3.scaleLinear()
        .domain([0, 1])
        .range([100, 0]);

      // Draw approximate shape
      if (n === 1) {
        // Show original distribution shape (simplified)
        g.append("path")
          .attr("d", "M 0 100 Q 20 20 30 60 Q 50 100 100 100")
          .attr("fill", currentDist.color)
          .attr("opacity", 0.5);
      } else {
        // Show normal curve
        const normalPath = d3.range(0, 101, 2).map(px => {
          const xVal = x.invert(px);
          const yVal = Math.exp(-0.5 * Math.pow((xVal - currentDist.mean) / theoreticalSE, 2));
          return [px, y(yVal)];
        });

        g.append("path")
          .datum(normalPath)
          .attr("d", d3.line())
          .attr("fill", colorSchemes.inference.primary)
          .attr("opacity", 0.5);
      }

      // Label
      g.append("text")
        .attr("x", 50)
        .attr("y", 120)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "white")
        .text(`n = ${n}`);

      // Arrow
      if (i < sampleSizes.length - 1) {
        svg.append("path")
          .attr("d", `M ${i * 150 + 130} 70 L ${i * 150 + 165} 70`)
          .attr("stroke", "white")
          .attr("stroke-width", 2)
          .attr("marker-end", "url(#arrowhead)");
      }
    });

    // Arrow marker
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("markerWidth", 10)
      .attr("markerHeight", 7)
      .attr("refX", 9)
      .attr("refY", 3.5)
      .attr("orient", "auto")
      .append("polygon")
      .attr("points", "0 0, 10 3.5, 0 7")
      .attr("fill", "white");
  }, [stage, currentDist]);

  const mathJaxRef = useRef(null);
  useSafeMathJax(mathJaxRef, [stage]);

  const reset = () => {
    setSamples([]);
    setSampleMeans([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Central Limit Theorem Journey</h2>
        
        {/* Stage-based content */}
        <div className="space-y-6">
          {stage >= 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-violet-400" />
                <h3 className="text-lg font-semibold">Stage 1: Start with a Weird Distribution</h3>
              </div>
              
              <p className="text-gray-300">
                The Central Limit Theorem works its magic on ANY distribution. Let's start with 
                something that's definitely not normal. Choose a distribution:
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(distributions).map(([key, dist]) => (
                  <Button
                    key={key}
                    onClick={() => {
                      setDistributionType(key);
                      reset();
                    }}
                    variant={distributionType === key ? "default" : "outline"}
                    size="sm"
                  >
                    {dist.name}
                  </Button>
                ))}
              </div>

              <GraphContainer height="300px">
                <svg ref={populationRef} className="w-full h-full" />
              </GraphContainer>

              <div className="bg-violet-900/20 border border-violet-600/30 rounded-lg p-4">
                <p className="text-sm text-violet-300">
                  <strong className="text-violet-400">📊 Notice:</strong> This {currentDist.name.toLowerCase()} distribution 
                  is definitely not bell-shaped! It has a mean of {currentDist.mean.toFixed(1)} and 
                  standard deviation of {currentDist.std.toFixed(1)}.
                </p>
              </div>
            </div>
          )}

          {stage >= 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Shuffle className="w-8 h-8 text-blue-400" />
                <h3 className="text-lg font-semibold">Stage 2: Take Samples and Calculate Means</h3>
              </div>
              
              <p className="text-gray-300">
                Now let's take samples of size {sampleSize} from this distribution and calculate 
                the mean of each sample. Watch what happens to the distribution of these means:
              </p>

              <div className="mb-4">
                <label className="text-sm text-gray-400 block mb-2">
                  Sample size (n): {sampleSize}
                </label>
                <RangeSlider
                  value={[sampleSize]}
                  onValueChange={(value) => {
                    setSampleSize(value[0]);
                    reset();
                  }}
                  min={1}
                  max={100}
                  step={1}
                  className="w-64"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GraphContainer height="300px">
                  <svg ref={populationRef} className="w-full h-full" />
                </GraphContainer>
                <GraphContainer height="300px">
                  <svg ref={samplingRef} className="w-full h-full" />
                </GraphContainer>
              </div>

              <div className="flex gap-4 items-center">
                <Button 
                  onClick={animateTransformation}
                  disabled={isAnimating}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Take 50 Samples
                </Button>
                <Button 
                  onClick={reset}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
                <div className="text-sm text-gray-400">
                  Samples taken: {samples.length}
                </div>
              </div>

              {sampleMeans.length >= 30 && sampleSize >= 30 && (
                <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 mt-4">
                  <p className="text-sm text-green-300">
                    <strong className="text-green-400">✨ The Magic!</strong> With n ≥ 30, the sampling 
                    distribution looks normal even though the population is {currentDist.name.toLowerCase()}! 
                    The orange curve is the theoretical normal distribution.
                  </p>
                </div>
              )}
            </div>
          )}

          {stage >= 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-emerald-400" />
                <h3 className="text-lg font-semibold">Stage 3: The Transformation Visualized</h3>
              </div>
              
              <p className="text-gray-300">
                Here's how the shape transforms as sample size increases:
              </p>

              <GraphContainer height="180px">
                <svg ref={transformationRef} className="w-full h-full" />
              </GraphContainer>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  <strong>Key observations:</strong>
                </p>
                <ul className="text-sm text-gray-400 mt-2 space-y-1">
                  <li>• n = 1: The sampling distribution equals the population distribution</li>
                  <li>• n = 5: Starting to become more symmetric</li>
                  <li>• n = 30: Nearly perfect bell curve (the "magic number")</li>
                  <li>• n = 100: Virtually indistinguishable from normal</li>
                </ul>
              </div>
            </div>
          )}

          {stage >= 4 && (
            <div className="space-y-4" ref={mathJaxRef}>
              <h3 className="text-lg font-semibold">Stage 4: The Mathematical Statement</h3>
              
              <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                <p className="text-gray-300 font-semibold">Central Limit Theorem:</p>
                <div className="bg-black/30 p-3 rounded">
                  <p className="text-center">
                    {`\\(\\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}} \\xrightarrow{d} N(0, 1)\\)`} as {`\\(n \\to \\infty\\)`}
                  </p>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  In words: As sample size increases, the standardized sample mean approaches 
                  a standard normal distribution, regardless of the population distribution.
                </p>
                
                <div className="mt-4 space-y-2">
                  <p className="text-sm">For our {currentDist.name.toLowerCase()} distribution:</p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Population mean: μ = {currentDist.mean.toFixed(1)}</li>
                    <li>• Population SD: σ = {currentDist.std.toFixed(1)}</li>
                    <li>• With n = {sampleSize}: SE = σ/√n = {(currentDist.std / Math.sqrt(sampleSize)).toFixed(2)}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {stage >= 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Stage 5: Why This Changes Everything</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-600/30">
                  <h4 className="font-semibold text-blue-400 mb-2">🎯 Universal Applicability</h4>
                  <p className="text-sm text-gray-300">
                    Works for ANY population distribution - exponential, uniform, bimodal, 
                    or even distributions we've never seen before!
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-green-900/20 to-teal-900/20 rounded-lg p-4 border border-green-600/30">
                  <h4 className="font-semibold text-green-400 mb-2">📊 Predictable Behavior</h4>
                  <p className="text-sm text-gray-300">
                    Sample means always cluster around μ with spread σ/√n, following a 
                    predictable bell curve pattern.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg p-4 border border-orange-600/30">
                  <h4 className="font-semibold text-orange-400 mb-2">🔬 Foundation of Inference</h4>
                  <p className="text-sm text-gray-300">
                    Enables confidence intervals, hypothesis testing, and all of modern 
                    statistical inference.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-600/30">
                  <h4 className="font-semibold text-purple-400 mb-2">💡 Practical Power</h4>
                  <p className="text-sm text-gray-300">
                    With just n ≥ 30, we can make normal-based inferences about almost 
                    any population!
                  </p>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-300">
                  <strong className="text-yellow-400">⚡ Remember:</strong> The CLT doesn't say the 
                  population becomes normal. It says the <em>sampling distribution of means</em> becomes 
                  normal. This subtle distinction is the key to all of statistics!
                </p>
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

export default CentralLimitTheoremJourney;