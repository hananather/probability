"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { VisualizationContainer } from "../../ui/VisualizationContainer";
import { RangeSlider } from "../../ui/RangeSlider";
import { createColorScheme, typography } from "../../../lib/design-system";
import { useSafeMathJax } from '../../../utils/mathJaxFix';
import ExponentialDistributionWorkedExample from "./3-4-2-ExponentialDistributionWorkedExample";
import { ProgressBar, ProgressNavigation } from "../../ui/ProgressBar";
import { Button } from "../../ui/button";
import { tutorial_3_4_1 } from '@/tutorials/chapter3';
import BackToHub from '../../ui/BackToHub';
import { Chapter3ReferenceSheet } from '../../reference-sheets/Chapter3ReferenceSheet';

// Define learning stages
const learningStages = [
  {
    id: 1,
    title: "Introduction to Exponential Distribution",
    description: "Understanding the basics of exponential distribution"
  },
  {
    id: 2,
    title: "Understanding λ (Rate Parameter)",
    description: "Explore how the rate parameter affects the distribution"
  },
  {
    id: 3,
    title: "Discovering the Memoryless Property",
    description: "Learn about the unique memoryless property"
  },
  {
    id: 4,
    title: "Applications & Mastery",
    description: "Real-world applications and advanced concepts"
  }
];

// Memoized component for LaTeX formulas to prevent re-rendering
const MemorylessFormula = React.memo(function MemorylessFormula() {
  const ref = useRef(null);
  
  // Use safe MathJax processing with error handling
  useSafeMathJax(ref, []);
  
  return (
    <p ref={ref} className="text-xs text-neutral-300 mt-2 font-mono">
      <span dangerouslySetInnerHTML={{ __html: `\\(P(T > t_1 + t_2 | T > t_1) = P(T > t_2)\\)` }} />
    </p>
  );
});

// Memoized component for stage content
const StageContent = React.memo(function StageContent({ stage, lambda }) {
  const contentRef = useRef(null);
  
  // Use safe MathJax processing with error handling
  useSafeMathJax(contentRef, [stage, lambda]);
  
  if (stage === 1) {
    return (
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white">
          Exponential Distribution
        </h3>
        <p className={typography.description}>
          The exponential distribution models the time between events in a Poisson process. 
          It's the continuous analog of the geometric distribution and has a unique "memoryless" property!
        </p>
        <div className="mt-3 p-3 bg-neutral-900 border border-neutral-700 rounded">
          <div className="text-xs text-neutral-300">
            📊 Key features: Models waiting times, always positive values, characterized by rate parameter λ
          </div>
        </div>
      </div>
    );
  } else if (stage === 2) {
    return (
      <div ref={contentRef} className="space-y-3">
        <h3 className="text-base font-bold text-white">
          Understanding λ (Rate Parameter)
        </h3>
        <p className={typography.description}>
          Try different values of λ:
        </p>
        <ul className="text-xs text-neutral-300 space-y-1 mt-2">
          <li>• λ = 0.5: Events occur slowly (mean time = 2)</li>
          <li>• λ = 1: Standard rate (mean time = 1)</li>
          <li>• λ = 2: Events occur quickly (mean time = 0.5)</li>
        </ul>
        <div className="mt-3 p-3 bg-neutral-900 border border-neutral-700 rounded">
          <div className="text-xs text-neutral-300">
            💡 Tip: The mean <span dangerouslySetInnerHTML={{ __html: `\\(\\mu = 1/\\lambda\\)` }} />, so larger λ means shorter average wait times!
          </div>
        </div>
      </div>
    );
  } else if (stage === 3) {
    return (
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white">
          Discovering the Memoryless Property
        </h3>
        <p className={typography.description}>
          Enable "Show Memoryless Property" to see something amazing:
        </p>
        <MemorylessFormula />
        <p className="text-sm text-neutral-300 mt-2">
          This means if you've already waited t₁ time, the probability of waiting 
          an additional t₂ time is the same as starting fresh!
        </p>
        <div className="mt-3 p-3 bg-neutral-900 border border-neutral-700 rounded">
          <div className="text-xs text-neutral-300">
            🔍 Try adjusting t₁ and t₂ values to verify the memoryless property holds for any values!
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div ref={contentRef} className="space-y-3">
        <h3 className="text-base font-bold text-white">
          Applications in Real World
        </h3>
        <p className={typography.description}>
          The exponential distribution is used in:
        </p>
        <ul className="text-xs text-neutral-300 space-y-1 mt-2">
          <li>• Reliability engineering (component lifetimes)</li>
          <li>• Queueing theory (service times)</li>
          <li>• Network analysis (packet arrival times)</li>
        </ul>
        <div className="mt-3 p-3 bg-neutral-900 border border-neutral-700 rounded">
          <p className="text-xs text-neutral-300">
            <strong>Example:</strong> A server receives requests at rate λ = 10/hour. The probability of waiting 
            more than 6 minutes (0.1 hour) for the next request is <span dangerouslySetInnerHTML={{ __html: `\\(e^{-10 \\times 0.1} = e^{-1} \\approx 0.368\\)` }} />. 
            This is crucial for capacity planning!
          </p>
        </div>
      </div>
    );
  }
});

// Memoized component for probability calculations display
const ProbabilityCalculations = React.memo(function ProbabilityCalculations({ t, pdfAtT, cdfAtT, memorylessT1, memorylessT2, showMemoryless, pGreaterThanT1, pGreaterThanT1PlusT2, pGreaterThanT1PlusT2GivenT1 }) {
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
  }, [t, pdfAtT, cdfAtT, memorylessT1, memorylessT2, showMemoryless]);
  
  return (
    <div ref={contentRef}>
      <div className="p-3 bg-neutral-900 rounded-lg space-y-3">
        <h3 className="text-sm font-semibold text-white">Probability Calculations</h3>
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-neutral-400">f({t.toFixed(1)}):</span>
            <span className="ml-2 font-mono text-emerald-400">{pdfAtT.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-neutral-400">
              <span dangerouslySetInnerHTML={{ __html: `\\(P(T \\leq ${t.toFixed(1)})\\)` }} />:
            </span>
            <span className="ml-2 font-mono text-purple-400">{cdfAtT.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-neutral-400">
              <span dangerouslySetInnerHTML={{ __html: `\\(P(T > ${t.toFixed(1)})\\)` }} />:
            </span>
            <span className="ml-2 font-mono text-amber-400">{(1 - cdfAtT).toFixed(4)}</span>
          </div>
        </div>
      </div>
      
      {showMemoryless && (
        <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg space-y-3 mt-4">
          <h4 className="text-xs font-semibold text-neutral-300">Memoryless Property Verification</h4>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-neutral-400">
                <span dangerouslySetInnerHTML={{ __html: `\\(P(T > ${memorylessT1.toFixed(1)})\\)` }} />:
              </span>
              <span className="ml-2 font-mono text-purple-400">{pGreaterThanT1.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-neutral-400">
                <span dangerouslySetInnerHTML={{ __html: `\\(P(T > ${(memorylessT1 + memorylessT2).toFixed(1)})\\)` }} />:
              </span>
              <span className="ml-2 font-mono text-emerald-400">{pGreaterThanT1PlusT2.toFixed(4)}</span>
            </div>
            <div className="pt-2 border-t border-neutral-700">
              <span className="text-neutral-400">
                <span dangerouslySetInnerHTML={{ __html: `\\(P(T > ${(memorylessT1 + memorylessT2).toFixed(1)} | T > ${memorylessT1.toFixed(1)})\\)` }} />:
              </span>
              <span className="ml-2 font-mono text-purple-400">{pGreaterThanT1PlusT2GivenT1.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-neutral-400">
                <span dangerouslySetInnerHTML={{ __html: `\\(P(T > ${memorylessT2.toFixed(1)})\\)` }} />:
              </span>
              <span className="ml-2 font-mono text-purple-400">{pGreaterThanT1PlusT2GivenT1.toFixed(4)}</span>
            </div>
            <div className="mt-2 text-emerald-400 font-semibold">
              ✓ They're equal! The memoryless property holds.
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const ExponentialDistribution = React.memo(function ExponentialDistribution() {
  // Core parameter states
  const [lambda, setLambda] = useState(1);
  const [showCDF, setShowCDF] = useState(false);
  const [t, setT] = useState(1); // Time for probability calculation
  const [memorylessT1, setMemorylessT1] = useState(1);
  const [memorylessT2, setMemorylessT2] = useState(2);
  const [showMemoryless, setShowMemoryless] = useState(false);
  const [stage, setStage] = useState(1); // Sequential stage instead of interaction count
  
  // Chart ref
  const pdfChartRef = useRef(null);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft' && stage > 1) {
      e.preventDefault();
      setStage(Math.max(1, stage - 1));
    } else if (e.key === 'ArrowRight' && stage < learningStages.length) {
      e.preventDefault();
      setStage(Math.min(learningStages.length, stage + 1));
    }
  }, [stage]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Create color scheme - using 'probability' scheme for Chapter 3
  const colors = createColorScheme('probability');
  
  // Calculate mean
  const meanValue = 1/lambda;
  
  // Calculate probability values
  const pdfAtT = lambda * Math.exp(-lambda * t);
  const cdfAtT = 1 - Math.exp(-lambda * t);
  const pGreaterThanT1 = Math.exp(-lambda * memorylessT1);
  const pGreaterThanT1PlusT2 = Math.exp(-lambda * (memorylessT1 + memorylessT2));
  const pGreaterThanT1PlusT2GivenT1 = memorylessT1 > 0 ? pGreaterThanT1PlusT2 / pGreaterThanT1 : 0;
  
  // Update chart when parameters change
  useEffect(() => {
    if (!pdfChartRef.current) return;
    
    const containerWidth = pdfChartRef.current.getBoundingClientRect().width;
    const containerHeight = Math.min(500, window.innerHeight * 0.5);
    const margin = { top: 20, right: 60, bottom: 60, left: 70 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(pdfChartRef.current).selectAll("*").remove();
    
    const svg = d3.select(pdfChartRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    // Remove white background for dark theme
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Set up scales
    const xMax = Math.min(10, 5/lambda);
    const x = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, width]);
    
    const yMax = showCDF ? 1.1 : Math.min(2, lambda * 1.2);
    const y = d3.scaleLinear()
      .domain([0, yMax])
      .range([height, 0]);
    
    // Generate data points
    const data = [];
    for (let i = 0; i <= 200; i++) {
      const xValue = (i / 200) * xMax;
      const yValue = showCDF ? 
        1 - Math.exp(-lambda * xValue) :
        lambda * Math.exp(-lambda * xValue);
      data.push({ x: xValue, y: yValue });
    }
    
    // Add grid lines - using lighter colors like Chapter 2
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .style("stroke", "#374151");
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .style("stroke", "#374151");
    
    // Add axes with dark text for contrast
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .style("font-size", "12px")
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    g.append("g")
      .call(d3.axisLeft(y))
      .style("font-size", "12px")
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .attr("fill", "#f3f4f6")
      .text(showCDF ? "F(t) - Cumulative Probability" : "f(t) - Probability Density");
    
    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .attr("fill", "#f3f4f6")
      .text("Time (t)");
    
    // Draw the curve - using primary color from color scheme
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX);
    
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", colors.chart.primary)
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Add point at t with better visibility
    if (t <= xMax) {
      const yValue = showCDF ? 
        1 - Math.exp(-lambda * t) :
        lambda * Math.exp(-lambda * t);
      
      // Vertical line at t
      g.append("line")
        .attr("x1", x(t))
        .attr("x2", x(t))
        .attr("y1", height)
        .attr("y2", y(yValue))
        .attr("stroke", colors.chart.primary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
      
      // Point on curve
      g.append("circle")
        .attr("cx", x(t))
        .attr("cy", y(yValue))
        .attr("r", 6)
        .attr("fill", colors.chart.primary)
        .attr("stroke", "#f3f4f6")
        .attr("stroke-width", 2);
      
      // Label
      g.append("text")
        .attr("x", x(t))
        .attr("y", y(yValue) - 10)
        .attr("text-anchor", "middle")
        .attr("fill", "#f3f4f6")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(`(${t.toFixed(1)}, ${yValue.toFixed(3)})`);
      
      // Shade area under PDF up to t
      if (!showCDF && stage >= 2) {
        const areaData = data.filter(d => d.x <= t);
        const area = d3.area()
          .x(d => x(d.x))
          .y0(height)
          .y1(d => y(d.y));
        
        g.append("path")
          .datum(areaData)
          .attr("fill", colors.chart.secondary)
          .attr("opacity", 0.3)
          .attr("d", area);
      }
    }
    
    // Add mean line
    if (meanValue <= xMax && stage >= 2) {
      g.append("line")
        .attr("x1", x(meanValue))
        .attr("x2", x(meanValue))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", colors.chart.tertiary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "10,5");
      
      g.append("text")
        .attr("x", x(meanValue))
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.tertiary)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(`μ = ${meanValue.toFixed(2)}`);
    }
  }, [lambda, showCDF, t, meanValue, colors, stage]);
  
  return (
    <>
      <Chapter3ReferenceSheet mode="floating" />
      <VisualizationContainer 
      title="Understanding the Exponential Distribution"
      subtitle="Modeling time between events in continuous processes"
      tutorialSteps={tutorial_3_4_1}
      tutorialKey="exponential-distribution-3-4-1"
    >
      <BackToHub />
      <div className="space-y-6">
        {/* Progress Bar */}
        <ProgressBar 
          current={stage}
          total={learningStages.length}
          label="Learning Progress"
          variant="purple"
        />
        
        {/* Navigation Buttons */}
        <ProgressNavigation
          current={stage}
          total={learningStages.length}
          onPrevious={() => setStage(Math.max(1, stage - 1))}
          onNext={() => setStage(Math.min(learningStages.length, stage + 1))}
          variant="purple"
        />
        
        {/* Keyboard Hint */}
        <div className="mt-2 text-center">
          <p className="text-xs text-neutral-500">
            Tip: Use <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-300">←</kbd> and{' '}
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-300">→</kbd> arrow keys to navigate
          </p>
        </div>
        
        {/* Full Width Visualization */}
        <div className="w-full mb-8">
          <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <svg ref={pdfChartRef} style={{ width: '100%', height: 'auto' }}></svg>
          </div>
        </div>
        
        {/* Controls and Content Below */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stage Content and Controls */}
          <div className="space-y-6">
            {/* Stage Content */}
            <StageContent stage={stage} lambda={lambda} />
            
            {/* Parameters */}
            <div className="p-4 bg-neutral-900 rounded-lg space-y-4">
              <h3 className="text-sm font-semibold text-white">Parameters</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-neutral-300">
                    Rate Parameter (λ): {lambda.toFixed(1)}
                  </label>
                  <RangeSlider
                    value={lambda}
                    onChange={setLambda}
                    min={0.1}
                    max={5}
                    step={0.1}
                    className="mt-1"
                  />
                  <p className="text-xs text-neutral-400 mt-1">
                    Mean waiting time: {meanValue.toFixed(2)}
                  </p>
                </div>
                
                {stage >= 2 && (
                  <div>
                    <label className="text-xs font-medium text-neutral-300">
                      Time t: {t.toFixed(1)}
                    </label>
                    <RangeSlider
                      value={t}
                      onChange={setT}
                      min={0}
                      max={Math.min(10, 5/lambda)}
                      step={0.1}
                      className="mt-1"
                    />
                  </div>
                )}
                
                {stage >= 3 && (
                  <>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showMemoryless"
                        checked={showMemoryless}
                        onChange={(e) => setShowMemoryless(e.target.checked)}
                        className="rounded border-neutral-600 bg-neutral-700 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="showMemoryless" className="text-xs text-neutral-300">
                        Show Memoryless Property
                      </label>
                    </div>
                    
                    {showMemoryless && (
                      <>
                        <div>
                          <label className="text-xs font-medium text-neutral-300">
                            t₁: {memorylessT1.toFixed(1)}
                          </label>
                          <RangeSlider
                            value={memorylessT1}
                            onChange={setMemorylessT1}
                            min={0}
                            max={5}
                            step={0.1}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-neutral-300">
                            t₂: {memorylessT2.toFixed(1)}
                          </label>
                          <RangeSlider
                            value={memorylessT2}
                            onChange={setMemorylessT2}
                            min={0}
                            max={5}
                            step={0.1}
                            className="mt-1"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showCDF"
                    checked={showCDF}
                    onChange={(e) => setShowCDF(e.target.checked)}
                    className="rounded border-neutral-600 bg-neutral-700 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="showCDF" className="text-xs text-neutral-300">
                    Show CDF instead of PDF
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Probability Calculations in second column */}
          {stage >= 2 && (
            <div>
              <ProbabilityCalculations 
                t={t}
                pdfAtT={pdfAtT}
                cdfAtT={cdfAtT}
                memorylessT1={memorylessT1}
                memorylessT2={memorylessT2}
                showMemoryless={showMemoryless && stage >= 3}
                pGreaterThanT1={pGreaterThanT1}
                pGreaterThanT1PlusT2={pGreaterThanT1PlusT2}
                pGreaterThanT1PlusT2GivenT1={pGreaterThanT1PlusT2GivenT1}
              />
            </div>
          )}
        </div>
        
        {/* Show worked example as a separate section in stage 4 */}
        {stage === 4 && (
          <div className="mt-8">
            <ExponentialDistributionWorkedExample 
              lambda={lambda}
              t={t}
              className="w-full"
            />
          </div>
        )}
      </div>
    </VisualizationContainer>
    </>
  );
});

export default ExponentialDistribution;