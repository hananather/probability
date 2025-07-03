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
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '../../ui/ProgressBar';
import { tutorial_5_5_1 } from '@/tutorials/chapter5';

// Use inference color scheme
const colorScheme = createColorScheme('inference');

function ProportionConfidenceIntervals() {
  // Fixed values from the course
  const SAMPLE_SIZE = 1000;
  const CANDIDATE_A = 0.52;
  const CANDIDATE_B = 0.48;
  const CONFIDENCE_LEVEL = 0.95;
  
  // Story stages
  const [stage, setStage] = useState(0);
  const [showCalculation, setShowCalculation] = useState(false);
  const [showIntervals, setShowIntervals] = useState(false);
  const [showOverlap, setShowOverlap] = useState(false);
  const [showNewHeadline, setShowNewHeadline] = useState(false);
  
  const svgRef = useRef(null);
  const mathContentRef = useRef(null);
  
  // Calculate confidence intervals
  const zCritical = jStat.normal.inv(1 - (1 - CONFIDENCE_LEVEL)/2, 0, 1);
  const standardErrorA = Math.sqrt((CANDIDATE_A * (1 - CANDIDATE_A)) / SAMPLE_SIZE);
  const standardErrorB = Math.sqrt((CANDIDATE_B * (1 - CANDIDATE_B)) / SAMPLE_SIZE);
  const marginOfErrorA = zCritical * standardErrorA;
  const marginOfErrorB = zCritical * standardErrorB;
  const lowerBoundA = CANDIDATE_A - marginOfErrorA;
  const upperBoundA = CANDIDATE_A + marginOfErrorA;
  const lowerBoundB = CANDIDATE_B - marginOfErrorB;
  const upperBoundB = CANDIDATE_B + marginOfErrorB;
  
  // Progress through story
  const nextStage = () => {
    if (stage === 0) {
      setStage(1);
    } else if (stage === 1) {
      setShowCalculation(true);
      setStage(2);
    } else if (stage === 2) {
      setShowIntervals(true);
      setStage(3);
    } else if (stage === 3) {
      setShowOverlap(true);
      setStage(4);
    } else if (stage === 4) {
      setShowNewHeadline(true);
      setStage(5);
    }
  };
  
  const reset = () => {
    setStage(0);
    setShowCalculation(false);
    setShowIntervals(false);
    setShowOverlap(false);
    setShowNewHeadline(false);
  };
  
  // MathJax rendering
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && mathContentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([mathContentRef.current]);
        }
        window.MathJax.typesetPromise([mathContentRef.current]).catch((err) => {
          // Silent error
        });
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [showCalculation]);
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
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
    
    // Create scale
    const xScale = d3.scaleLinear()
      .domain([0.44, 0.56])
      .range([0, innerWidth]);
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => `${(d * 100).toFixed(0)}%`));
    
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
      .text("Vote Share");
    
    // Poll results bars (shown from stage 1)
    if (stage >= 1) {
      const barY = innerHeight * 0.5;
      const barHeight = 40;
      
      // Candidate A bar
      const barA = g.append("g");
      
      barA.append("rect")
        .attr("x", xScale(0.5))
        .attr("y", barY - barHeight/2)
        .attr("width", 0)
        .attr("height", barHeight)
        .attr("fill", "#3b82f6")
        .attr("opacity", 0.8)
        .transition()
        .duration(800)
        .attr("width", xScale(CANDIDATE_A) - xScale(0.5));
      
      barA.append("text")
        .attr("x", xScale(CANDIDATE_A) + 5)
        .attr("y", barY + 5)
        .attr("fill", "#3b82f6")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("font-family", "monospace")
        .text("52%")
        .attr("opacity", 0)
        .transition()
        .delay(400)
        .duration(400)
        .attr("opacity", 1);
      
      barA.append("text")
        .attr("x", xScale(CANDIDATE_A) + 5)
        .attr("y", barY - 20)
        .attr("fill", "#3b82f6")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .text("Candidate A")
        .attr("opacity", 0)
        .transition()
        .delay(400)
        .duration(400)
        .attr("opacity", 1);
      
      // Candidate B bar
      const barB = g.append("g");
      
      barB.append("rect")
        .attr("x", xScale(CANDIDATE_B))
        .attr("y", barY - barHeight/2)
        .attr("width", 0)
        .attr("height", barHeight)
        .attr("fill", "#ef4444")
        .attr("opacity", 0.8)
        .transition()
        .duration(800)
        .attr("x", xScale(0.5) - (xScale(0.5) - xScale(CANDIDATE_B)))
        .attr("width", xScale(0.5) - xScale(CANDIDATE_B));
      
      barB.append("text")
        .attr("x", xScale(CANDIDATE_B) - 5)
        .attr("y", barY + 5)
        .attr("text-anchor", "end")
        .attr("fill", "#ef4444")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("font-family", "monospace")
        .text("48%")
        .attr("opacity", 0)
        .transition()
        .delay(400)
        .duration(400)
        .attr("opacity", 1);
      
      barB.append("text")
        .attr("x", xScale(CANDIDATE_B) - 5)
        .attr("y", barY - 20)
        .attr("text-anchor", "end")
        .attr("fill", "#ef4444")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .text("Candidate B")
        .attr("opacity", 0)
        .transition()
        .delay(400)
        .duration(400)
        .attr("opacity", 1);
    }
    
    // Confidence intervals (shown from stage 3)
    if (showIntervals) {
      const ciY = innerHeight * 0.5;
      
      // CI for Candidate A
      const ciA = g.append("g")
        .attr("opacity", 0);
      
      ciA.append("line")
        .attr("x1", xScale(lowerBoundA))
        .attr("x2", xScale(upperBoundA))
        .attr("y1", ciY - 30)
        .attr("y2", ciY - 30)
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 3);
      
      // Brackets for CI A
      [lowerBoundA, upperBoundA].forEach(bound => {
        ciA.append("line")
          .attr("x1", xScale(bound))
          .attr("x2", xScale(bound))
          .attr("y1", ciY - 35)
          .attr("y2", ciY - 25)
          .attr("stroke", "#3b82f6")
          .attr("stroke-width", 2);
      });
      
      // CI for Candidate B
      const ciB = g.append("g")
        .attr("opacity", 0);
      
      ciB.append("line")
        .attr("x1", xScale(lowerBoundB))
        .attr("x2", xScale(upperBoundB))
        .attr("y1", ciY + 30)
        .attr("y2", ciY + 30)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 3);
      
      // Brackets for CI B
      [lowerBoundB, upperBoundB].forEach(bound => {
        ciB.append("line")
          .attr("x1", xScale(bound))
          .attr("x2", xScale(bound))
          .attr("y1", ciY + 25)
          .attr("y2", ciY + 35)
          .attr("stroke", "#ef4444")
          .attr("stroke-width", 2);
      });
      
      // Animate CIs appearing
      ciA.transition()
        .delay(100)
        .duration(800)
        .attr("opacity", 1);
      
      ciB.transition()
        .delay(100)
        .duration(800)
        .attr("opacity", 1);
      
      // Show overlap area when appropriate
      if (showOverlap) {
        const overlapStart = Math.max(lowerBoundA, lowerBoundB);
        const overlapEnd = Math.min(upperBoundA, upperBoundB);
        
        if (overlapStart < overlapEnd) {
          g.append("rect")
            .attr("x", xScale(overlapStart))
            .attr("y", 0)
            .attr("width", xScale(overlapEnd) - xScale(overlapStart))
            .attr("height", innerHeight)
            .attr("fill", "#8b5cf6")
            .attr("opacity", 0)
            .transition()
            .delay(500)
            .duration(800)
            .attr("opacity", 0.2);
          
          // Overlap annotation
          g.append("text")
            .attr("x", xScale((overlapStart + overlapEnd) / 2))
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("fill", "#8b5cf6")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("OVERLAP!")
            .attr("opacity", 0)
            .transition()
            .delay(800)
            .duration(400)
            .attr("opacity", 1);
        }
      }
    }
    
  }, [stage, showIntervals, showOverlap]);
  
  return (
    <VisualizationContainer 
      title="The Election Polling Story"
      tutorialSteps={tutorial_5_5_1}
      className="p-6"
    >
      <div className="space-y-6">
        {/* Newspaper Header */}
        <div className="bg-neutral-900 p-6 rounded-lg border-2 border-neutral-700">
          <div className="text-center mb-4">
            <h2 className="text-4xl font-serif text-neutral-200 mb-2">THE DAILY STATISTICS</h2>
            <div className="h-px bg-neutral-600 w-3/4 mx-auto mb-2"></div>
            <p className="text-sm text-neutral-500 font-mono">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          {/* Dynamic Headline */}
          <div className="text-center py-4">
            <h1 className={cn(
              "text-5xl font-bold transition-all duration-1000",
              showNewHeadline ? "text-yellow-400" : "text-cyan-400"
            )}>
              {showNewHeadline ? "Too Close to Call!" : "Candidate A Leads Candidate B!"}
            </h1>
            <p className="text-lg text-neutral-400 mt-2">
              {showNewHeadline 
                ? "Statistical analysis reveals overlapping confidence intervals"
                : "Latest poll shows 4-point lead in presidential race"}
            </p>
          </div>
        </div>
        
        {/* Story Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Story Text */}
          <div className="space-y-4">
            {/* Stage 0: Introduction */}
            <VisualizationSection className={cn("p-4 transition-opacity duration-500", stage >= 0 ? "opacity-100" : "opacity-30")}>
              <h3 className="text-lg font-bold text-white mb-2">Breaking News: Election Poll Results</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                A new poll of 1,000 likely voters shows Candidate A with 52% support 
                and Candidate B with 48% support. The race appears to have a clear leader...
              </p>
              <p className="text-sm text-neutral-400 mt-2 italic">
                But wait - let's look deeper at what these numbers really mean.
              </p>
            </VisualizationSection>
            
            {/* Stage 1: Poll Results */}
            {stage >= 1 && (
              <VisualizationSection className="p-4 animate-fadeIn">
                <h3 className="text-lg font-bold text-white mb-2">The Poll Results</h3>
                <div className="bg-neutral-900 p-4 rounded-lg">
                  <p className="text-sm text-neutral-300 mb-3">We surveyed 1,000 likely voters:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400 font-semibold">Candidate A</span>
                      <span className="font-mono text-lg">520 voters (52%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-400 font-semibold">Candidate B</span>
                      <span className="font-mono text-lg">480 voters (48%)</span>
                    </div>
                  </div>
                </div>
              </VisualizationSection>
            )}
            
            {/* Stage 2: Margin of Error Calculation */}
            {showCalculation && (
              <VisualizationSection className="p-4 animate-fadeIn">
                <h3 className="text-lg font-bold text-white mb-2">Calculating the Margin of Error</h3>
                <div ref={mathContentRef} className="bg-neutral-900 p-4 rounded-lg text-sm">
                  <p className="text-neutral-300 mb-2">For proportions, we calculate:</p>
                  <div className="space-y-2">
                    <div dangerouslySetInnerHTML={{ __html: `\\[\\text{MOE} = z_{\\alpha/2} \\times \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}\\]` }} />
                    <p className="text-neutral-400">For 95% confidence: z = 1.96</p>
                    <div dangerouslySetInnerHTML={{ __html: `\\[\\text{MOE}_A = 1.96 \\times \\sqrt{\\frac{0.52 \\times 0.48}{1000}} = ${(marginOfErrorA * 100).toFixed(1)}\\%\\]` }} />
                    <div dangerouslySetInnerHTML={{ __html: `\\[\\text{MOE}_B = 1.96 \\times \\sqrt{\\frac{0.48 \\times 0.52}{1000}} = ${(marginOfErrorB * 100).toFixed(1)}\\%\\]` }} />
                  </div>
                  <p className="text-yellow-400 mt-3 font-semibold">Both have approximately ±3.1% margin of error!</p>
                </div>
              </VisualizationSection>
            )}
            
            {/* Stage 3: Confidence Intervals */}
            {showIntervals && (
              <VisualizationSection className="p-4 animate-fadeIn">
                <h3 className="text-lg font-bold text-white mb-2">The Confidence Intervals</h3>
                <div className="space-y-3">
                  <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
                    <p className="text-blue-400 font-semibold">Candidate A: 52% ± 3.1%</p>
                    <p className="text-sm text-neutral-400">Range: {(lowerBoundA * 100).toFixed(1)}% to {(upperBoundA * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
                    <p className="text-red-400 font-semibold">Candidate B: 48% ± 3.1%</p>
                    <p className="text-sm text-neutral-400">Range: {(lowerBoundB * 100).toFixed(1)}% to {(upperBoundB * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </VisualizationSection>
            )}
            
            {/* Stage 4: The Overlap */}
            {showOverlap && (
              <VisualizationSection className="p-4 animate-fadeIn border-2 border-purple-500/50">
                <h3 className="text-lg font-bold text-purple-400 mb-2">The Critical Discovery!</h3>
                <p className="text-sm text-neutral-300 mb-3">
                  The confidence intervals overlap! This means we cannot be 95% confident 
                  that Candidate A is actually ahead.
                </p>
                <div className="bg-purple-900/20 p-3 rounded border border-purple-500/50">
                  <p className="text-purple-300 font-semibold">Statistical Reality:</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    When intervals overlap, the difference is not statistically significant. 
                    The true winner could be either candidate!
                  </p>
                </div>
              </VisualizationSection>
            )}
            
            {/* Stage 5: New Understanding */}
            {showNewHeadline && (
              <VisualizationSection className="p-4 animate-fadeIn bg-yellow-900/10 border border-yellow-500/30">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">The Lesson Learned</h3>
                <p className="text-sm text-neutral-300">
                  Headlines should reflect uncertainty! A 4-point lead in a poll doesn't 
                  mean a candidate is actually ahead when we account for sampling error.
                </p>
                <div className="mt-3 p-3 bg-neutral-800 rounded">
                  <p className="text-sm font-semibold text-green-400 mb-1">Remember:</p>
                  <ul className="text-xs text-neutral-400 space-y-1">
                    <li>• Polls are estimates, not exact measurements</li>
                    <li>• Margin of error applies to BOTH candidates</li>
                    <li>• Overlapping intervals = statistical tie</li>
                  </ul>
                </div>
              </VisualizationSection>
            )}
          </div>
          
          {/* Right Column - Visualization */}
          <div className="space-y-4">
            <GraphContainer height="300px">
              <svg ref={svgRef} style={{ width: "100%", height: 300 }} />
            </GraphContainer>
            
            {/* Story Controls */}
            <VisualizationSection className="p-4">
              <div className="flex gap-3">
                {stage < 5 && (
                  <button
                    onClick={nextStage}
                    className={cn(
                      "flex-1 px-4 py-3 rounded text-sm font-medium transition-all",
                      "bg-purple-600 hover:bg-purple-700 text-white",
                      "transform hover:scale-105"
                    )}
                  >
                    {stage === 0 && "See Poll Results"}
                    {stage === 1 && "Calculate Margin of Error"}
                    {stage === 2 && "Show Confidence Intervals"}
                    {stage === 3 && "Check for Overlap"}
                    {stage === 4 && "Update the Headline"}
                  </button>
                )}
                {stage === 5 && (
                  <button
                    onClick={reset}
                    className={cn(
                      "flex-1 px-4 py-3 rounded text-sm font-medium transition-all",
                      "bg-neutral-600 hover:bg-neutral-700 text-white"
                    )}
                  >
                    Start Over
                  </button>
                )}
              </div>
              
              {/* Progress indicator */}
              <div className="mt-4">
                <ProgressBar 
                  current={stage + 1} 
                  total={6} 
                  label="Story Progress"
                  variant="purple"
                />
              </div>
            </VisualizationSection>
            
            {/* Key Takeaway */}
            {stage === 5 && (
              <VisualizationSection className="p-4 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border border-purple-500/30">
                <h4 className="text-base font-bold text-white mb-2">Key Statistical Insight</h4>
                <p className="text-sm text-neutral-300">
                  A confidence interval gives us a range of plausible values for the true 
                  population proportion. When two candidates' intervals overlap, we cannot 
                  confidently declare a winner - it's a statistical tie!
                </p>
                <div className="mt-3 text-xs text-neutral-400">
                  <p>• Sample size: n = 1,000</p>
                  <p>• Confidence level: 95%</p>
                  <p>• Margin of error: ±3.1%</p>
                </div>
              </VisualizationSection>
            )}
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default ProportionConfidenceIntervals;