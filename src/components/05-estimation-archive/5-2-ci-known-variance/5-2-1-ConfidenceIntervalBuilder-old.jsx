"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '../../ui/ProgressBar';
import { Button } from '../../ui/button';
import { tutorial_5_2_1 } from '@/tutorials/chapter5';
import { 
  ConfidenceIntervalVisualizer,
  StageProgressionWrapper,
  FormulaHighlighter,
  DiscoveryBadge,
  useStageProgression,
  useDiscoveryTracking
} from '../shared';

// Use inference color scheme
const colorScheme = createColorScheme('inference');

// Learning stages for 68-95-99.7 rule
const LEARNING_STAGES = [
  {
    id: 'explore-68',
    title: '68% Confidence',
    description: 'Most values fall within 1 standard deviation',
    confidenceLevel: 0.68,
    zScore: 1,
    unlocks: ['basic-controls']
  },
  {
    id: 'discover-95',
    title: '95% Confidence',
    description: 'The standard choice for research',
    confidenceLevel: 0.95,
    zScore: 1.96,
    unlocks: ['sample-size-control']
  },
  {
    id: 'master-997',
    title: '99.7% Confidence',
    description: 'Nearly all values within 3 standard deviations',
    confidenceLevel: 0.997,
    zScore: 2.576,
    unlocks: ['animation-controls', 'discoveries']
  }
];

// Simplified Worked Example Component
const CIWorkedExample = memo(function CIWorkedExample({ mean, std, sampleSize, confidenceLevel, zScore }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [mean, std, sampleSize, confidenceLevel, zScore]);
  
  // Calculate CI components
  const standardError = std / Math.sqrt(sampleSize);
  const marginOfError = zScore * standardError;
  const lowerBound = mean - marginOfError;
  const upperBound = mean + marginOfError;
  
  return (
    <div ref={contentRef} className="bg-neutral-800 p-4 rounded-lg text-neutral-200">
      <h4 className="text-base font-semibold text-white mb-3">
        The {(confidenceLevel * 100).toFixed(0)}% Rule in Action
      </h4>
      
      <div className="space-y-3">
        <div className="bg-neutral-900 p-3 rounded text-sm">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-neutral-400">Mean (μ):</span>
              <span className="font-mono text-cyan-400 ml-2">{mean}</span>
            </div>
            <div>
              <span className="text-neutral-400">Std Dev (σ):</span>
              <span className="font-mono text-cyan-400 ml-2">{std}</span>
            </div>
            <div>
              <span className="text-neutral-400">Sample Size (n):</span>
              <span className="font-mono text-cyan-400 ml-2">{sampleSize}</span>
            </div>
            <div>
              <span className="text-neutral-400">Z-Score:</span>
              <span className="font-mono text-yellow-400 ml-2">±{zScore}</span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div dangerouslySetInnerHTML={{ __html: `\[\text{CI} = \mu \pm ${zScore} \times \frac{\sigma}{\sqrt{n}}\]` }} />
          <div dangerouslySetInnerHTML={{ __html: `\[\text{CI} = ${mean} \pm ${zScore} \times \frac{${std}}{\sqrt{${sampleSize}}}\]` }} />
          <div dangerouslySetInnerHTML={{ __html: `\[\text{CI} = ${mean} \pm ${marginOfError.toFixed(2)}\]` }} />
        </div>
        
        <div className="bg-purple-900/20 border border-purple-600/30 rounded p-3">
          <p className="text-center text-purple-300 font-semibold text-sm">
            {(confidenceLevel * 100).toFixed(0)}% of sample means fall within:<br/>
            [{lowerBound.toFixed(2)}, {upperBound.toFixed(2)}]
          </p>
        </div>
      </div>
      
      <div className="bg-neutral-900 p-2 rounded text-xs mt-3">
        <p className="text-yellow-400">💡 Remember: {zScore}σ captures {(confidenceLevel * 100).toFixed(0)}% of the distribution!</p>
      </div>
    </div>
  );
});

function ConfidenceIntervalBuilder() {
  // Use course example values: IQ scores with μ=100, σ=15
  const populationMean = 100;
  const populationStd = 15;
  
  // Stage progression for 68-95-99.7 rule
  const { currentStage, completeStage, isStageUnlocked } = useStageProgression(LEARNING_STAGES);
  
  // Discovery tracking
  const { trackDiscovery, discoveries, celebrate } = useDiscoveryTracking([
    { id: 'empirical-rule', name: '68-95-99.7 Rule', description: 'The three key confidence levels' },
    { id: 'z-scores', name: 'Critical Z-Scores', description: '1, 1.96, and 2.576' },
    { id: 'interval-width', name: 'Interval Width Pattern', description: 'Higher confidence = wider interval' },
    { id: 'sample-size-effect', name: 'Sample Size Effect', description: 'Larger n = narrower interval' }
  ]);
  
  // Simplified state
  const [sampleSize, setSampleSize] = useState(25);
  const [selectedLevel, setSelectedLevel] = useState(LEARNING_STAGES[0]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [interactions, setInteractions] = useState(0);
  
  const svgRef = useRef(null);
  
  // Handle confidence level selection
  const selectConfidenceLevel = useCallback((stage) => {
    if (!isStageUnlocked(stage.id)) return;
    
    setSelectedLevel(stage);
    setShowAnimation(true);
    setInteractions(prev => prev + 1);
    
    // Track discoveries
    if (interactions === 0) {
      trackDiscovery('empirical-rule');
    }
    if (interactions === 2) {
      trackDiscovery('z-scores');
    }
    if (stage.id === 'master-997') {
      completeStage(stage.id);
      trackDiscovery('interval-width');
    }
    
    setTimeout(() => setShowAnimation(false), 1500);
  }, [interactions, isStageUnlocked, completeStage, trackDiscovery]);
  
  // Handle sample size change
  const handleSampleSizeChange = useCallback((newSize) => {
    setSampleSize(newSize);
    if (newSize >= 50 && !discoveries.includes('sample-size-effect')) {
      trackDiscovery('sample-size-effect');
    }
  }, [discoveries, trackDiscovery]);
  
  // Simplified 68-95-99.7 visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 350;
    const margin = { top: 30, right: 30, bottom: 60, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Confidence Interval Construction");
    
    // Create scales
    const xExtent = [
      populationMean - 4 * populationStd,
      populationMean + 4 * populationStd
    ];
    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.03])
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
    
    // Draw population distribution if enabled
    if (showPopulation) {
      const xValues = d3.range(xExtent[0], xExtent[1], (xExtent[1] - xExtent[0]) / 200);
      const normalData = xValues.map(x => ({
        x: x,
        y: jStat.normal.pdf(x, populationMean, populationStd)
      }));
      
      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(innerHeight)
        .y1(d => yScale(d.y))
        .curve(d3.curveMonotoneX);
      
      g.append("path")
        .datum(normalData)
        .attr("fill", colorScheme.chart.secondary)
        .attr("opacity", 0.2)
        .attr("d", area);
      
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveMonotoneX);
      
      g.append("path")
        .datum(normalData)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 2)
        .attr("opacity", 0.5)
        .attr("d", line);
    }
    
    // Draw true mean line
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
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text(`μ = ${populationMean}`);
    
    // Draw sample points
    const sampleY = innerHeight * 0.7;
    
    g.selectAll("circle.sample")
      .data(currentSample)
      .enter().append("circle")
      .attr("class", "sample")
      .attr("cx", d => xScale(d))
      .attr("cy", sampleY)
      .attr("r", 0)
      .attr("fill", colorScheme.chart.primary)
      .attr("opacity", 0.6)
      .transition()
      .duration(500)
      .attr("r", 4);
    
    // Draw sample mean
    const sampleMeanGroup = g.append("g")
      .attr("transform", `translate(${xScale(sampleMean)}, 0)`);
    
    sampleMeanGroup.append("line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", colorScheme.chart.primary)
      .attr("stroke-width", 2)
      .attr("opacity", 0)
      .transition()
      .delay(300)
      .duration(500)
      .attr("opacity", 1);
    
    sampleMeanGroup.append("text")
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.primary)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text(`x̄ = ${sampleMean.toFixed(2)}`)
      .attr("opacity", 0)
      .transition()
      .delay(300)
      .duration(500)
      .attr("opacity", 1);
    
    // Draw confidence interval
    const lowerBound = sampleMean - marginOfError;
    const upperBound = sampleMean + marginOfError;
    const ciY = innerHeight * 0.5;
    
    // CI bracket
    const ciGroup = g.append("g")
      .attr("class", "confidence-interval");
    
    // Horizontal line
    ciGroup.append("line")
      .attr("x1", xScale(sampleMean))
      .attr("x2", xScale(sampleMean))
      .attr("y1", ciY)
      .attr("y2", ciY)
      .attr("stroke", colorScheme.chart.accent)
      .attr("stroke-width", 4)
      .transition()
      .delay(600)
      .duration(800)
      .attr("x1", xScale(lowerBound))
      .attr("x2", xScale(upperBound));
    
    // Vertical brackets
    const bracketHeight = 15;
    
    [-1, 1].forEach((side, i) => {
      const x = side === -1 ? lowerBound : upperBound;
      ciGroup.append("line")
        .attr("x1", xScale(sampleMean))
        .attr("x2", xScale(sampleMean))
        .attr("y1", ciY - bracketHeight/2)
        .attr("y2", ciY + bracketHeight/2)
        .attr("stroke", colorScheme.chart.accent)
        .attr("stroke-width", 3)
        .attr("opacity", 0)
        .transition()
        .delay(600 + i * 200)
        .duration(500)
        .attr("x1", xScale(x))
        .attr("x2", xScale(x))
        .attr("opacity", 1);
    });
    
    // CI labels
    ciGroup.append("text")
      .attr("x", xScale(lowerBound))
      .attr("y", ciY + 30)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.accent)
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .text(lowerBound.toFixed(2))
      .attr("opacity", 0)
      .transition()
      .delay(1000)
      .duration(500)
      .attr("opacity", 1);
    
    ciGroup.append("text")
      .attr("x", xScale(upperBound))
      .attr("y", ciY + 30)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.accent)
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .text(upperBound.toFixed(2))
      .attr("opacity", 0)
      .transition()
      .delay(1000)
      .duration(500)
      .attr("opacity", 1);
    
    // CI label
    ciGroup.append("text")
      .attr("x", xScale(sampleMean))
      .attr("y", ciY - 25)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.accent)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text(`${(confidenceLevel * 100).toFixed(0)}% CI`)
      .attr("opacity", 0)
      .transition()
      .delay(800)
      .duration(500)
      .attr("opacity", 1);
    
    // Check if CI contains true mean
    const containsMu = lowerBound <= populationMean && populationMean <= upperBound;
    
    // Add indicator
    if (animateCI) {
      const indicator = g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 50)
        .attr("text-anchor", "middle")
        .attr("fill", containsMu ? "#10b981" : "#ef4444")
        .style("font-size", "16px")
        .style("font-weight", "600")
        .text(containsMu ? "✓ Contains μ" : "✗ Misses μ")
        .attr("opacity", 0)
        .transition()
        .delay(1200)
        .duration(500)
        .attr("opacity", 1)
        .transition()
        .delay(3000)
        .duration(500)
        .attr("opacity", 0);
    }
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    // X axis label
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Value");
    
  }, [sampleMean, currentSample, populationMean, populationStd, confidenceLevel, 
      marginOfError, showPopulation, animateCI]);
  
  // Initialize with a sample on mount
  useEffect(() => {
    generateNewSample();
  }, []);
  
  return (
    <VisualizationContainer 
      title="Confidence Interval Builder (σ Known)"
      className="p-2"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Build confidence intervals when the population standard deviation σ is known. 
              This demonstrates the fundamental concept before moving to the more realistic case where σ is unknown.
            </p>
            
            <div className="mt-3 space-y-2 text-xs">
              <div className="p-2 bg-blue-900/20 border border-blue-600/30 rounded">
                <p className="font-semibold text-blue-400 mb-1">Key Formula</p>
                <p className="text-neutral-300">
                  CI = x̄ ± z<sub>α/2</sub> × (σ/√n)
                </p>
              </div>
              
              <div className="p-2 bg-green-900/20 border border-green-600/30 rounded">
                <p className="font-semibold text-green-400 mb-1">Interpretation</p>
                <p className="text-neutral-300">
                  We are (1-α)×100% confident that μ lies within the interval
                </p>
              </div>
            </div>
          </VisualizationSection>

          {/* Controls */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Controls</h4>
            
            <div className="space-y-3">
              {/* Sample size control */}
              <div>
                <label className="text-sm text-neutral-300 mb-1.5 block">
                  Sample Size (n = {sampleSize})
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>5</span>
                  <span>100</span>
                </div>
              </div>
              
              {/* Confidence level control */}
              <div>
                <label className="text-sm text-neutral-300 mb-1.5 block">
                  Confidence Level ({(confidenceLevel * 100).toFixed(0)}%)
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[0.90, 0.95, 0.99].map(level => (
                    <button
                      key={level}
                      onClick={() => setConfidenceLevel(level)}
                      className={cn(
                        "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                        confidenceLevel === level
                          ? "bg-cyan-600 text-white"
                          : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                      )}
                    >
                      {(level * 100).toFixed(0)}%
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="space-y-2">
                <button
                  onClick={generateNewSample}
                  className={cn(
                    "w-full px-3 py-2 rounded text-sm font-medium transition-colors",
                    "bg-purple-600 hover:bg-purple-700 text-white"
                  )}
                >
                  Generate New Sample
                </button>
              </div>
              
              {/* View options */}
              <div className="space-y-2 pt-2 border-t border-neutral-700">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={showPopulation} 
                    onChange={e => setShowPopulation(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-neutral-300">Show population distribution</span>
                </label>
                
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
            </div>
          </VisualizationSection>

          {/* Statistics Display */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Current Statistics</h4>
            
            <div className="space-y-3">
              {/* Population parameters */}
              <div className="bg-neutral-800 rounded p-3">
                <h5 className="text-sm font-semibold text-purple-400 mb-2">Known Parameters</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-300">μ (population mean)</span>
                    <span className="font-mono text-white">{populationMean}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">σ (population std)</span>
                    <span className="font-mono text-white">{populationStd}</span>
                  </div>
                </div>
              </div>
              
              {/* Sample statistics */}
              {sampleMean !== null && (
                <div className="bg-neutral-800 rounded p-3">
                  <h5 className="text-sm font-semibold text-cyan-400 mb-2">Sample Statistics</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-300">x̄ (sample mean)</span>
                      <span className="font-mono text-cyan-400">{sampleMean.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">n (sample size)</span>
                      <span className="font-mono text-cyan-400">{sampleSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">SE (standard error)</span>
                      <span className="font-mono text-yellow-400">{standardError.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">ME (margin of error)</span>
                      <span className="font-mono text-yellow-400">{marginOfError.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* CI details */}
              {sampleMean !== null && (
                <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded p-3">
                  <h5 className="text-sm font-semibold text-purple-400 mb-2">Confidence Interval</h5>
                  <div className="text-center">
                    <div className="text-lg font-mono text-purple-300">
                      [{(sampleMean - marginOfError).toFixed(2)}, {(sampleMean + marginOfError).toFixed(2)}]
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">
                      Width: {(2 * marginOfError).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </VisualizationSection>

          {/* Progress indicator */}
          <VisualizationSection className="p-4">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Learning Progress</h4>
            <div className="space-y-2 text-xs text-neutral-300">
              <p>Samples generated: {totalSamples}</p>
              {totalSamples > 0 && totalSamples < 5 && (
                <p className="text-yellow-400">
                  Try different sample sizes to see how n affects the CI width!
                </p>
              )}
              {totalSamples >= 5 && totalSamples < 10 && (
                <p className="text-green-400">
                  Notice: Larger n → Smaller SE → Narrower CI → More precision!
                </p>
              )}
              {totalSamples >= 10 && (
                <p className="text-purple-400">
                  🎓 Expert tip: Try changing the confidence level to see the trade-off between confidence and precision.
                </p>
              )}
            </div>
          </VisualizationSection>
        </div>

        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          <GraphContainer height="400px">
            <svg ref={svgRef} style={{ width: "100%", height: 400 }} />
          </GraphContainer>
          
          {/* Worked Example */}
          {showWorkedExample && sampleMean !== null && (
            <CIWorkedExample 
              sampleMean={sampleMean}
              sampleSize={sampleSize}
              populationStd={populationStd}
              confidenceLevel={confidenceLevel}
            />
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default ConfidenceIntervalBuilder;