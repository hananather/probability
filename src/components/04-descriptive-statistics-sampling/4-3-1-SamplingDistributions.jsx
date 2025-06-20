"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';
import { tutorial_4_3_1 } from '@/tutorials/chapter4';

// Use sampling color scheme
const colorScheme = createColorScheme('sampling');

// Worked Example Component
const SamplingWorkedExample = memo(function SamplingWorkedExample({ sampleSize, populationStd }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    // MathJax timeout pattern
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          // Silent error: MathJax error
        });
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [sampleSize, populationStd]);
  
  const standardError = populationStd / Math.sqrt(sampleSize);
  
  return (
    <div ref={contentRef} className="bg-neutral-800 p-6 rounded-lg text-neutral-200">
      <h4 className="text-lg font-semibold border-b border-neutral-600 pb-2 mb-4 text-white">
        Standard Error Calculation
      </h4>
      
      <div className="mb-4">
        <p className="mb-2 font-medium text-purple-400">Formula & Calculation:</p>
        <div>
          <div dangerouslySetInnerHTML={{ __html: `\\[SE = \\frac{\\sigma}{\\sqrt{n}} = \\frac{${populationStd}}{\\sqrt{${sampleSize}}} = ${standardError.toFixed(3)}\\]` }} />
        </div>
      </div>
      
      <div className="bg-neutral-900 p-3 rounded text-sm">
        <p className="text-yellow-400 font-medium mb-2">💡 What this means:</p>
        <p className="text-neutral-300">
          Sample means typically vary by about {standardError.toFixed(2)} points from the population mean.
          {sampleSize > 30 ? " With n > 30, the Central Limit Theorem ensures normality!" : " Increase sample size for more precision."}
        </p>
      </div>
    </div>
  );
});

function SamplingDistributions() {
  // State management
  const [sampleSize, setSampleSize] = useState(10);
  const [numSamples, setNumSamples] = useState(0);
  const [sampleMeans, setSampleMeans] = useState([]);
  const [populationMean] = useState(100);
  const [populationStd] = useState(15);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTheoretical, setShowTheoretical] = useState(false);
  const [currentSample, setCurrentSample] = useState([]);
  const [showWorkedExample, setShowWorkedExample] = useState(true);
  const [totalInteractions, setTotalInteractions] = useState(0);
  
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  // Generate a sample from the population
  const generateSample = useCallback(() => {
    const sample = [];
    for (let i = 0; i < sampleSize; i++) {
      // Generate from normal distribution
      sample.push(jStat.normal.sample(populationMean, populationStd));
    }
    return sample;
  }, [sampleSize, populationMean, populationStd]);
  
  // Take one sample and calculate its mean
  const takeSingleSample = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const sample = generateSample();
    const sampleMean = jStat.mean(sample);
    
    setCurrentSample(sample);
    setSampleMeans(prev => [...prev, sampleMean]);
    setNumSamples(prev => prev + 1);
    setTotalInteractions(prev => prev + 1);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  }, [generateSample, isAnimating]);
  
  // Take many samples
  const takeManySamples = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newMeans = [];
    const samplesToTake = 100;
    setTotalInteractions(prev => prev + 1);
    
    const animateAddition = (index) => {
      if (index >= samplesToTake) {
        setIsAnimating(false);
        return;
      }
      
      const sample = generateSample();
      const sampleMean = jStat.mean(sample);
      newMeans.push(sampleMean);
      
      setSampleMeans(prev => [...prev, sampleMean]);
      setNumSamples(prev => prev + 1);
      
      if (index === 0) setCurrentSample(sample);
      
      animationRef.current = setTimeout(() => {
        animateAddition(index + 1);
      }, Math.max(10, 100 / Math.sqrt(index + 1)));
    };
    
    animateAddition(0);
  }, [generateSample, isAnimating]);
  
  // Reset everything
  const reset = () => {
    setSampleMeans([]);
    setNumSamples(0);
    setCurrentSample([]);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIsAnimating(false);
  };
  
  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);
  
  // Calculate statistics for the sampling distribution
  const samplingStats = {
    mean: sampleMeans.length > 0 ? jStat.mean(sampleMeans) : 0,
    std: sampleMeans.length > 1 ? jStat.stdev(sampleMeans, true) : 0,
    theoreticalMean: populationMean,
    theoreticalStd: populationStd / Math.sqrt(sampleSize)
  };
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 500;
    const margin = { top: 60, right: 40, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Sampling Distribution of Sample Means");
    
    if (sampleMeans.length === 0) {
      // Show instruction text
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .attr("fill", colors.chart.text)
        .attr("opacity", 0.5)
        .text("Click 'Take Sample' to start building the sampling distribution");
      return;
    }
    
    // Create scales
    const xExtent = d3.extent(sampleMeans);
    const xPadding = 10;
    const xScale = d3.scaleLinear()
      .domain([
        Math.min(xExtent[0], populationMean - 3 * samplingStats.theoreticalStd) - xPadding,
        Math.max(xExtent[1], populationMean + 3 * samplingStats.theoreticalStd) + xPadding
      ])
      .range([0, innerWidth]);
    
    // Create histogram
    const numBins = Math.min(30, Math.max(10, Math.floor(Math.sqrt(sampleMeans.length))));
    const histogram = d3.histogram()
      .domain(xScale.domain())
      .thresholds(xScale.ticks(numBins));
    
    const bins = histogram(sampleMeans);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([innerHeight, 0]);
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);
    
    // Draw histogram bars
    g.selectAll("rect.bar")
      .data(bins)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.x0))
      .attr("y", innerHeight)
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr("height", 0)
      .attr("fill", colorScheme.chart.primary)
      .attr("opacity", 0.7)
      .attr("rx", 2)
      .transition()
      .duration(300)
      .attr("y", d => yScale(d.length))
      .attr("height", d => innerHeight - yScale(d.length));
    
    // Draw theoretical normal curve if enabled
    if (showTheoretical && sampleMeans.length > 5) {
      const xValues = d3.range(xScale.domain()[0], xScale.domain()[1], 
        (xScale.domain()[1] - xScale.domain()[0]) / 200);
      
      const normalData = xValues.map(x => ({
        x: x,
        y: jStat.normal.pdf(x, populationMean, samplingStats.theoreticalStd) * 
           sampleMeans.length * (bins[0] ? bins[0].x1 - bins[0].x0 : 1)
      }));
      
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveMonotoneX);
      
      g.append("path")
        .datum(normalData)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5")
        .attr("d", line)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 0.8);
    }
    
    // Draw mean lines
    // Population mean
    g.append("line")
      .attr("x1", xScale(populationMean))
      .attr("x2", xScale(populationMean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", colorScheme.chart.tertiary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    g.append("text")
      .attr("x", xScale(populationMean))
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.tertiary)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(`μ = ${populationMean}`);
    
    // Sample mean of means
    if (sampleMeans.length > 0) {
      g.append("line")
        .attr("x1", xScale(samplingStats.mean))
        .attr("x2", xScale(samplingStats.mean))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 2);
      
      g.append("text")
        .attr("x", xScale(samplingStats.mean))
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(`x̄̄ = ${samplingStats.mean.toFixed(2)}`);
    }
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    // Y axis
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(5));
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    // Axis labels
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 50})`)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Sample Mean");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (innerHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Frequency");
    
  }, [sampleMeans, populationMean, populationStd, samplingStats, showTheoretical]);
  
  return (
    <VisualizationContainer 
      title="Sampling Distribution of the Mean"
      className="p-2"
      tutorialSteps={tutorial_4_3_1}
      tutorialKey="sampling-distributions-4-3-1"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Explore how sample means form a predictable pattern. This demonstrates the Central Limit Theorem in action.
            </p>
            
            <div className="mt-3 space-y-2 text-xs">
              <div className="p-2 bg-blue-900/20 border border-blue-600/30 rounded">
                <p className="font-semibold text-blue-400 mb-1">Central Limit Theorem</p>
                <p className="text-neutral-300">
                  Sample means follow a normal distribution with mean μ and standard error σ/√n
                </p>
              </div>
              
              <div className="p-2 bg-green-900/20 border border-green-600/30 rounded">
                <p className="font-semibold text-green-400 mb-1">Standard Error Formula</p>
                <p className="text-neutral-300">
                  SE = σ/√n decreases as sample size increases
                </p>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-neutral-400">
              <span className="font-semibold">Tip:</span> Take many samples to see the bell curve emerge!
            </div>
          </VisualizationSection>

          {/* Controls */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Controls</h4>
            
            <div className="space-y-3">
              {/* Sample size control */}
              <div data-tutorial="sample-size">
                <label className="text-sm text-neutral-300 mb-1.5 block">
                  Sample Size (n = {sampleSize})
                </label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={sampleSize}
                  onChange={(e) => {
                    setSampleSize(Number(e.target.value));
                    reset();
                  }}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>5</span>
                  <span>50</span>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="space-y-2">
                <button
                  onClick={takeSingleSample}
                  disabled={isAnimating}
                  data-tutorial="take-sample"
                  className={cn(
                    "w-full px-3 py-2 rounded text-sm font-medium transition-colors",
                    isAnimating
                      ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                      : "bg-cyan-600 hover:bg-cyan-700 text-white"
                  )}
                >
                  Take Single Sample
                </button>
                
                <button
                  onClick={takeManySamples}
                  disabled={isAnimating}
                  data-tutorial="take-many"
                  className={cn(
                    "w-full px-3 py-2 rounded text-sm font-medium transition-colors",
                    isAnimating
                      ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  )}
                >
                  Take 100 Samples
                </button>
                
                <button
                  onClick={reset}
                  disabled={isAnimating}
                  className={cn(
                    "w-full px-3 py-2 rounded text-sm font-medium transition-colors",
                    "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  Reset
                </button>
              </div>
              
              {/* Show theoretical toggle */}
              <label className="flex items-center gap-2 text-sm mt-3">
                <input 
                  type="checkbox" 
                  checked={showTheoretical} 
                  onChange={e => setShowTheoretical(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-neutral-300">Show theoretical normal curve</span>
              </label>
              
              {/* Show worked example toggle */}
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={showWorkedExample} 
                  onChange={e => setShowWorkedExample(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-neutral-300">Show worked example</span>
              </label>
            </div>
          </VisualizationSection>

          {/* Statistics Display */}
          <VisualizationSection className="p-4" data-tutorial="statistics">
            <h4 className="text-base font-bold text-white mb-3">Statistics</h4>
            
            <div className="space-y-3">
              {/* Population parameters */}
              <div className="bg-neutral-800 rounded p-3">
                <h5 className="text-sm font-semibold text-purple-400 mb-2">Population Parameters</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Mean (μ)</span>
                    <span className="font-mono text-white">{populationMean}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Std Dev (σ)</span>
                    <span className="font-mono text-white">{populationStd}</span>
                  </div>
                </div>
              </div>
              
              {/* Sampling distribution stats */}
              {numSamples > 0 && (
                <div className="bg-neutral-800 rounded p-3">
                  <h5 className="text-sm font-semibold text-cyan-400 mb-2">Sampling Distribution</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-300">Mean of Means</span>
                      <span className="font-mono text-cyan-400">{samplingStats.mean.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">Observed SE</span>
                      <span className="font-mono text-cyan-400">{samplingStats.std.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">Theoretical SE</span>
                      <span className="font-mono text-yellow-400">{samplingStats.theoreticalStd.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">Samples Taken</span>
                      <span className="font-mono text-white">{numSamples}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </VisualizationSection>

          {/* Learning Insights */}
          <VisualizationSection className="p-4 flex-1 flex flex-col">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Sampling Insights</h4>
            <div className="space-y-2 text-xs text-neutral-300">
              {totalInteractions === 0 && (
                <div>
                  <p>🎯 Ready to explore sampling distributions?</p>
                  <p className="text-purple-300 mt-1">
                    Start by taking a single sample to see how it works!
                  </p>
                </div>
              )}
              {totalInteractions > 0 && numSamples < 10 && (
                <div>
                  <p>📊 Building the distribution:</p>
                  <ul className="ml-3 mt-1 space-y-1">
                    <li>• Each sample mean is one point in the histogram</li>
                    <li>• Take more samples to see the pattern</li>
                  </ul>
                </div>
              )}
              {numSamples >= 10 && numSamples < 100 && (
                <div>
                  <p>🎓 Pattern emerging!</p>
                  <p className="mt-1">
                    Notice how sample means cluster around μ = {populationMean}. The bell shape is starting to appear!
                  </p>
                </div>
              )}
              {numSamples >= 100 && (
                <div>
                  <p className="text-green-400 font-semibold mb-1">
                    ✨ Central Limit Theorem demonstrated! {numSamples} samples taken.
                  </p>
                  <p>The sampling distribution is clearly normal with SE ≈ {samplingStats.theoreticalStd.toFixed(2)}</p>
                  {numSamples < 500 && (
                    <p className="text-blue-400 mt-2">
                      💡 Try different sample sizes to see how SE changes!
                    </p>
                  )}
                </div>
              )}
              
              {/* Progress bar */}
              {numSamples > 0 && (
                <div className="mt-3">
                  <ProgressBar 
                    current={Math.min(numSamples, 500)} 
                    total={500} 
                    label="Sampling Progress"
                    variant="cyan"
                  />
                </div>
              )}
              
              {/* Current sample preview */}
              {currentSample.length > 0 && (
                <div className="mt-3 p-2 bg-neutral-800/50 rounded">
                  <div className="text-neutral-400">Last sample:</div>
                  <div className="font-mono text-neutral-300 mt-1">
                    [{currentSample.slice(0, 3).map(v => v.toFixed(1)).join(', ')}...] → x̄ = {jStat.mean(currentSample).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>

        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          <GraphContainer height="600px" data-tutorial="visualization">
            <svg ref={svgRef} style={{ width: "100%", height: 600 }} />
          </GraphContainer>
          
          {/* Worked Example */}
          {showWorkedExample && (
            <SamplingWorkedExample 
              sampleSize={sampleSize} 
              populationStd={populationStd}
            />
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default SamplingDistributions;