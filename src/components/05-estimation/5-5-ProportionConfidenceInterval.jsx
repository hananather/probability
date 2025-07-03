"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, createColorScheme } from '../../lib/design-system';
import BackToHub from '@/components/ui/BackToHub';
import { Vote, Package, FlaskConical, BarChart3, AlertCircle, TrendingUp, Users, ChevronRight, Sparkles } from 'lucide-react';

// Get Chapter 5 color scheme
const chapterColors = createColorScheme('estimation');

// Introduction Component
const ProportionIntroduction = React.memo(function ProportionIntroduction() {
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
  }, []);
  
  return (
    <div ref={contentRef} className="bg-neutral-800 rounded-lg p-4 max-w-2xl mx-auto">
      <div className="text-sm text-neutral-300 space-y-2">
        <p className="text-lg font-semibold text-white mb-3">
          Confidence Intervals for Proportions
        </p>
        <p>
          When estimating <strong className="text-emerald-400">proportions</strong> (like poll results or defect rates), 
          we face unique challenges. The sampling distribution follows a binomial pattern, but we can use normal 
          approximation under certain conditions.
        </p>
        
        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="bg-neutral-700/50 rounded-lg p-3">
            <h4 className="font-semibold text-emerald-400 mb-1">Key Applications</h4>
            <ul className="text-xs space-y-1">
              <li>• Election polling</li>
              <li>• Quality control</li>
              <li>• A/B testing</li>
              <li>• Medical trials</li>
            </ul>
          </div>
          <div className="bg-neutral-700/50 rounded-lg p-3">
            <h4 className="font-semibold text-blue-400 mb-1">Methods</h4>
            <ul className="text-xs space-y-1">
              <li>• Wald (simple)</li>
              <li>• Wilson (recommended)</li>
              <li>• Agresti-Coull</li>
              <li>• Exact binomial</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 mt-4">
          <p className="text-xs">
            <strong className="text-yellow-400">Normal Approximation:</strong> Valid when 
            both \(np \geq 10\) and \(n(1-p) \geq 10\)
          </p>
        </div>
      </div>
    </div>
  );
});

// Election Story Component
const ElectionStory = React.memo(function ElectionStory() {
  const [stage, setStage] = useState(0);
  const [showCalculation, setShowCalculation] = useState(false);
  const [showIntervals, setShowIntervals] = useState(false);
  const [showOverlap, setShowOverlap] = useState(false);
  const [showNewHeadline, setShowNewHeadline] = useState(false);
  
  const svgRef = useRef(null);
  const mathContentRef = useRef(null);
  
  // Fixed values from the course
  const SAMPLE_SIZE = 1000;
  const CANDIDATE_A = 0.52;
  const CANDIDATE_B = 0.48;
  const CONFIDENCE_LEVEL = 0.95;
  
  // Calculate confidence intervals
  const zCritical = 1.96; // For 95% confidence
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
        window.MathJax.typesetPromise([mathContentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [showCalculation]);
  
  // Visualization
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
      .attr("fill", colors.neutral[900]);
    
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
    
    xAxis.selectAll("path, line").attr("stroke", colors.neutral[700]);
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.neutral[300]);
    
    // X axis label
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .attr("fill", colors.neutral[200])
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
        .attr("fill", chapterColors.primary)
        .attr("opacity", 0.8)
        .transition()
        .duration(800)
        .attr("width", xScale(CANDIDATE_A) - xScale(0.5));
      
      barA.append("text")
        .attr("x", xScale(CANDIDATE_A) + 5)
        .attr("y", barY + 5)
        .attr("fill", chapterColors.primary)
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
        .attr("fill", chapterColors.primary)
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
        .attr("fill", chapterColors.secondary)
        .attr("opacity", 0.8)
        .transition()
        .duration(800)
        .attr("x", xScale(0.5) - (xScale(0.5) - xScale(CANDIDATE_B)))
        .attr("width", xScale(0.5) - xScale(CANDIDATE_B));
      
      barB.append("text")
        .attr("x", xScale(CANDIDATE_B) - 5)
        .attr("y", barY + 5)
        .attr("text-anchor", "end")
        .attr("fill", chapterColors.secondary)
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
        .attr("fill", chapterColors.secondary)
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
        .attr("stroke", chapterColors.tertiary)
        .attr("stroke-width", 3);
      
      // Brackets for CI A
      [lowerBoundA, upperBoundA].forEach(bound => {
        ciA.append("line")
          .attr("x1", xScale(bound))
          .attr("x2", xScale(bound))
          .attr("y1", ciY - 35)
          .attr("y2", ciY - 25)
          .attr("stroke", chapterColors.tertiary)
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
        .attr("stroke", chapterColors.tertiary)
        .attr("stroke-width", 3);
      
      // Brackets for CI B
      [lowerBoundB, upperBoundB].forEach(bound => {
        ciB.append("line")
          .attr("x1", xScale(bound))
          .attr("x2", xScale(bound))
          .attr("y1", ciY + 25)
          .attr("y2", ciY + 35)
          .attr("stroke", chapterColors.tertiary)
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
            .attr("fill", chapterColors.highlight)
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
            .attr("fill", chapterColors.highlight)
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
          <h1 className={`text-5xl font-bold transition-all duration-1000 ${
            showNewHeadline ? "text-yellow-400" : "text-cyan-400"
          }`}>
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
          <VisualizationSection className={`p-4 transition-opacity duration-500 ${
            stage >= 0 ? "opacity-100" : "opacity-30"
          }`}>
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
          <AnimatePresence>
            {stage >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <VisualizationSection className="p-4">
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
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Stage 2: Margin of Error Calculation */}
          <AnimatePresence>
            {showCalculation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <VisualizationSection className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2">Calculating the Margin of Error</h3>
                  <div ref={mathContentRef} className="bg-neutral-900 p-4 rounded-lg text-sm">
                    <p className="text-neutral-300 mb-2">For proportions, we calculate:</p>
                    <div className="space-y-2">
                      <div className="text-center">
                        <span dangerouslySetInnerHTML={{ __html: `\\[\\text{MOE} = z_{\\alpha/2} \\times \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}\\]` }} />
                      </div>
                      <p className="text-neutral-400">For 95% confidence: z = 1.96</p>
                      <div className="text-center">
                        <span dangerouslySetInnerHTML={{ __html: `\\[\\text{MOE}_A = 1.96 \\times \\sqrt{\\frac{0.52 \\times 0.48}{1000}} = ${(marginOfErrorA * 100).toFixed(1)}\\%\\]` }} />
                      </div>
                      <div className="text-center">
                        <span dangerouslySetInnerHTML={{ __html: `\\[\\text{MOE}_B = 1.96 \\times \\sqrt{\\frac{0.48 \\times 0.52}{1000}} = ${(marginOfErrorB * 100).toFixed(1)}\\%\\]` }} />
                      </div>
                    </div>
                    <p className="text-yellow-400 mt-3 font-semibold">Both have approximately ±3.1% margin of error!</p>
                  </div>
                </VisualizationSection>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Stage 3: Confidence Intervals */}
          <AnimatePresence>
            {showIntervals && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <VisualizationSection className="p-4">
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
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Stage 4: The Overlap */}
          <AnimatePresence>
            {showOverlap && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <VisualizationSection className="p-4 border-2 border-purple-500/50">
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
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Stage 5: New Understanding */}
          <AnimatePresence>
            {showNewHeadline && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <VisualizationSection className="p-4 bg-yellow-900/10 border border-yellow-500/30">
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
              </motion.div>
            )}
          </AnimatePresence>
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
                  className="flex-1 px-4 py-3 rounded text-sm font-medium transition-all bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-105"
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
                  className="flex-1 px-4 py-3 rounded text-sm font-medium transition-all bg-neutral-600 hover:bg-neutral-700 text-white"
                >
                  Start Over
                </button>
              )}
            </div>
            
            {/* Progress indicator */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-neutral-500 mb-1">
                <span>Story Progress</span>
                <span>{stage + 1} / 6</span>
              </div>
              <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${((stage + 1) / 6) * 100}%` }}
                />
              </div>
            </div>
          </VisualizationSection>
          
          {/* Key Takeaway */}
          <AnimatePresence>
            {stage === 5 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});

// CI Methods Comparison Component
const CIMethodsComparison = React.memo(function CIMethodsComparison({ p, n, confidenceLevel }) {
  const methodComparisonRef = useRef(null);
  const contentRef = useRef(null);
  
  const z = confidenceLevel === 0.90 ? 1.645 : confidenceLevel === 0.95 ? 1.96 : 2.576;
  
  // Calculate CIs using different methods
  const methods = useMemo(() => {
    // Wald method
    const waldSE = Math.sqrt(p * (1 - p) / n);
    const waldCI = {
      lower: Math.max(0, p - z * waldSE),
      upper: Math.min(1, p + z * waldSE),
      se: waldSE
    };
    
    // Wilson method
    const wilsonDenominator = 1 + z * z / n;
    const wilsonCenter = (p + z * z / (2 * n)) / wilsonDenominator;
    const wilsonHalfWidth = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / wilsonDenominator;
    const wilsonCI = {
      lower: Math.max(0, wilsonCenter - wilsonHalfWidth),
      upper: Math.min(1, wilsonCenter + wilsonHalfWidth),
      se: wilsonHalfWidth / z
    };
    
    // Agresti-Coull method
    const nTilde = n + 4;
    const pTilde = (p * n + 2) / nTilde;
    const agrestiSE = Math.sqrt(pTilde * (1 - pTilde) / nTilde);
    const agrestiCI = {
      lower: Math.max(0, pTilde - z * agrestiSE),
      upper: Math.min(1, pTilde + z * agrestiSE),
      se: agrestiSE
    };
    
    return [
      { name: 'Wald', ci: waldCI, color: chapterColors.primary },
      { name: 'Wilson', ci: wilsonCI, color: chapterColors.secondary },
      { name: 'Agresti-Coull', ci: agrestiCI, color: chapterColors.tertiary }
    ];
  }, [p, n, z]);
  
  // MathJax rendering
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Draw comparison chart
  useEffect(() => {
    if (!methodComparisonRef.current) return;
    
    const svg = d3.select(methodComparisonRef.current);
    const { width } = methodComparisonRef.current.getBoundingClientRect();
    const height = 150;
    const margin = { top: 20, right: 30, bottom: 40, left: 110 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const allBounds = methods.flatMap(m => [m.ci.lower, m.ci.upper]);
    const xScale = d3.scaleLinear()
      .domain([Math.min(...allBounds) - 0.02, Math.max(...allBounds) + 0.02])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleBand()
      .domain(methods.map(m => m.name))
      .range([0, innerHeight])
      .padding(0.3);
    
    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${(d * 100).toFixed(0)}%`))
      .selectAll("text")
      .style("font-family", "monospace")
      .attr("fill", colors.neutral[300]);
    
    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", colors.neutral[300]);
    
    // Draw intervals
    methods.forEach(method => {
      const y = yScale(method.name) + yScale.bandwidth() / 2;
      
      // CI line
      g.append("line")
        .attr("x1", xScale(method.ci.lower))
        .attr("x2", xScale(method.ci.upper))
        .attr("y1", y)
        .attr("y2", y)
        .attr("stroke", method.color)
        .attr("stroke-width", 3)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 0.8);
      
      // End caps
      [method.ci.lower, method.ci.upper].forEach(bound => {
        g.append("line")
          .attr("x1", xScale(bound))
          .attr("x2", xScale(bound))
          .attr("y1", y - 5)
          .attr("y2", y + 5)
          .attr("stroke", method.color)
          .attr("stroke-width", 2)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .attr("opacity", 0.8);
      });
      
      // Point estimate
      g.append("circle")
        .attr("cx", xScale(p))
        .attr("cy", y)
        .attr("r", 4)
        .attr("fill", method.color)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 1);
    });
    
    // Vertical line at p
    g.append("line")
      .attr("x1", xScale(p))
      .attr("x2", xScale(p))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", colors.neutral[600])
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.5);
    
  }, [methods, p]);
  
  return (
    <div className="space-y-4">
      <GraphContainer height="150px">
        <svg ref={methodComparisonRef} style={{ width: "100%", height: "100%" }} />
      </GraphContainer>
      
      <div ref={contentRef} className="bg-neutral-900 rounded-lg p-4 text-sm text-neutral-300">
        <h4 className="font-semibold text-white mb-2">Method Formulas:</h4>
        <div className="space-y-3">
          <div>
            <span className="text-emerald-400">Wald:</span>
            <div className="text-center mt-1">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\hat{p} \\pm z_{\\alpha/2} \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}\\]` }} />
            </div>
          </div>
          <div>
            <span className="text-blue-400">Wilson:</span>
            <div className="text-center mt-1">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\frac{\\hat{p} + \\frac{z^2}{2n} \\pm z\\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n} + \\frac{z^2}{4n^2}}}{1 + \\frac{z^2}{n}}\\]` }} />
            </div>
          </div>
          <div>
            <span className="text-purple-400">Agresti-Coull:</span>
            <div className="text-center mt-1">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\tilde{p} \\pm z_{\\alpha/2} \\sqrt{\\frac{\\tilde{p}(1-\\tilde{p})}{\\tilde{n}}}\\]` }} />
            </div>
            <p className="text-xs text-neutral-500 mt-1">where <span dangerouslySetInnerHTML={{ __html: `\\(\\tilde{n} = n + 4\\)` }} /> and <span dangerouslySetInnerHTML={{ __html: `\\(\\tilde{p} = \\frac{X + 2}{n + 4}\\)` }} /></p>
          </div>
        </div>
      </div>
    </div>
  );
});

// Main Application Studio Component
const ApplicationStudio = React.memo(function ApplicationStudio() {
  const [scenario, setScenario] = useState('election');
  const [sampleSize, setSampleSize] = useState(1000);
  const [observedCount, setObservedCount] = useState(520);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [showMethodComparison, setShowMethodComparison] = useState(false);
  
  const mainVizRef = useRef(null);
  
  // Calculate proportion
  const p = observedCount / sampleSize;
  
  // Check normal approximation
  const np = sampleSize * p;
  const nq = sampleSize * (1 - p);
  const normalApproxValid = np >= 10 && nq >= 10;
  
  // Calculate confidence interval (Wilson method)
  const z = confidenceLevel === 0.90 ? 1.645 : confidenceLevel === 0.95 ? 1.96 : 2.576;
  const wilsonDenominator = 1 + z * z / sampleSize;
  const wilsonCenter = (p + z * z / (2 * sampleSize)) / wilsonDenominator;
  const wilsonHalfWidth = z * Math.sqrt(p * (1 - p) / sampleSize + z * z / (4 * sampleSize * sampleSize)) / wilsonDenominator;
  const ci = {
    lower: Math.max(0, wilsonCenter - wilsonHalfWidth),
    upper: Math.min(1, wilsonCenter + wilsonHalfWidth)
  };
  const marginOfError = wilsonHalfWidth;
  
  // Draw main visualization
  useEffect(() => {
    if (!mainVizRef.current) return;
    
    const svg = d3.select(mainVizRef.current);
    const { width } = mainVizRef.current.getBoundingClientRect();
    const height = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    if (scenario === 'election') {
      // Election visualization
      const xScale = d3.scaleLinear()
        .domain([0.4, 0.6])
        .range([0, innerWidth]);
      
      const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);
      
      // X axis
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d => `${(d * 100).toFixed(0)}%`))
        .selectAll("text")
        .style("font-family", "monospace")
        .attr("fill", colors.neutral[300]);
      
      // Draw proportion bar
      const barWidth = innerWidth * 0.6;
      const barX = (innerWidth - barWidth) / 2;
      
      g.append("rect")
        .attr("x", barX)
        .attr("y", innerHeight * 0.3)
        .attr("width", barWidth)
        .attr("height", innerHeight * 0.4)
        .attr("fill", colors.neutral[700])
        .attr("rx", 4);
      
      g.append("rect")
        .attr("x", barX)
        .attr("y", innerHeight * 0.3)
        .attr("width", barWidth * p)
        .attr("height", innerHeight * 0.4)
        .attr("fill", chapterColors.primary)
        .attr("rx", 4)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .attr("opacity", 0.8);
      
      // CI visualization
      const ciY = innerHeight * 0.2;
      
      g.append("line")
        .attr("x1", xScale(ci.lower))
        .attr("x2", xScale(ci.upper))
        .attr("y1", ciY)
        .attr("y2", ciY)
        .attr("stroke", chapterColors.tertiary)
        .attr("stroke-width", 4)
        .attr("opacity", 0)
        .transition()
        .delay(400)
        .duration(500)
        .attr("opacity", 1);
      
      // CI brackets
      [ci.lower, ci.upper].forEach(bound => {
        g.append("line")
          .attr("x1", xScale(bound))
          .attr("x2", xScale(bound))
          .attr("y1", ciY - 10)
          .attr("y2", ciY + 10)
          .attr("stroke", chapterColors.tertiary)
          .attr("stroke-width", 2)
          .attr("opacity", 0)
          .transition()
          .delay(400)
          .duration(500)
          .attr("opacity", 1);
      });
      
      // Point estimate
      g.append("circle")
        .attr("cx", xScale(p))
        .attr("cy", ciY)
        .attr("r", 6)
        .attr("fill", chapterColors.primary)
        .attr("opacity", 0)
        .transition()
        .delay(600)
        .duration(300)
        .attr("opacity", 1);
      
      // Labels
      g.append("text")
        .attr("x", xScale(p))
        .attr("y", ciY - 20)
        .attr("text-anchor", "middle")
        .attr("fill", chapterColors.primary)
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("font-family", "monospace")
        .text(`${(p * 100).toFixed(1)}%`)
        .attr("opacity", 0)
        .transition()
        .delay(800)
        .duration(300)
        .attr("opacity", 1);
        
    } else if (scenario === 'quality') {
      // Quality control gauge
      const passRate = 1 - p;
      const centerX = innerWidth / 2;
      const centerY = innerHeight / 2;
      const radius = Math.min(innerWidth, innerHeight) * 0.35;
      
      // Background circle
      g.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", colors.neutral[700])
        .attr("stroke-width", 20);
      
      // Pass rate arc
      const arc = d3.arc()
        .innerRadius(radius - 20)
        .outerRadius(radius)
        .startAngle(0)
        .endAngle(passRate * 2 * Math.PI);
      
      g.append("path")
        .attr("d", arc)
        .attr("transform", `translate(${centerX},${centerY})`)
        .attr("fill", passRate > 0.95 ? chapterColors.success : chapterColors.error)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .attr("opacity", 0.8);
      
      // Center text
      g.append("text")
        .attr("x", centerX)
        .attr("y", centerY - 10)
        .attr("text-anchor", "middle")
        .attr("fill", colors.neutral[100])
        .style("font-size", "36px")
        .style("font-weight", "bold")
        .style("font-family", "monospace")
        .text(`${(passRate * 100).toFixed(1)}%`);
      
      g.append("text")
        .attr("x", centerX)
        .attr("y", centerY + 15)
        .attr("text-anchor", "middle")
        .attr("fill", colors.neutral[400])
        .style("font-size", "16px")
        .text("Pass Rate");
      
      g.append("text")
        .attr("x", centerX)
        .attr("y", centerY + 35)
        .attr("text-anchor", "middle")
        .attr("fill", chapterColors.error)
        .style("font-size", "14px")
        .text(`${observedCount} defects / ${sampleSize} items`);
        
    } else if (scenario === 'testing') {
      // A/B testing visualization
      const groupA = { name: "Version A", rate: 0.10, n: Math.floor(sampleSize / 2) };
      const groupB = { name: "Version B", rate: p, n: Math.floor(sampleSize / 2) };
      const groups = [groupA, groupB];
      
      const xScale = d3.scaleBand()
        .domain(groups.map(d => d.name))
        .range([0, innerWidth])
        .padding(0.3);
      
      const yScale = d3.scaleLinear()
        .domain([0, Math.max(groupA.rate, groupB.rate) * 1.3])
        .range([innerHeight, 0]);
      
      // Y axis
      g.append("g")
        .call(d3.axisLeft(yScale).tickFormat(d => `${(d * 100).toFixed(0)}%`))
        .selectAll("text")
        .style("font-family", "monospace")
        .attr("fill", colors.neutral[300]);
      
      // Bars
      groups.forEach((group, i) => {
        g.append("rect")
          .attr("x", xScale(group.name))
          .attr("width", xScale.bandwidth())
          .attr("y", innerHeight)
          .attr("height", 0)
          .attr("fill", i === 0 ? chapterColors.primary : chapterColors.secondary)
          .attr("rx", 4)
          .attr("opacity", 0.8)
          .transition()
          .duration(500)
          .attr("y", yScale(group.rate))
          .attr("height", innerHeight - yScale(group.rate));
        
        // Labels
        g.append("text")
          .attr("x", xScale(group.name) + xScale.bandwidth() / 2)
          .attr("y", yScale(group.rate) - 10)
          .attr("text-anchor", "middle")
          .attr("fill", colors.neutral[100])
          .style("font-size", "18px")
          .style("font-weight", "bold")
          .style("font-family", "monospace")
          .text(`${(group.rate * 100).toFixed(1)}%`)
          .attr("opacity", 0)
          .transition()
          .delay(300)
          .duration(300)
          .attr("opacity", 1);
      });
    }
    
  }, [scenario, p, ci, sampleSize, observedCount]);
  
  // Apply scenario presets
  const applyScenarioPreset = (scenarioType) => {
    setScenario(scenarioType);
    
    switch (scenarioType) {
      case 'election':
        setSampleSize(1000);
        setObservedCount(520);
        setConfidenceLevel(0.95);
        break;
      case 'quality':
        setSampleSize(500);
        setObservedCount(10); // 10 defects
        setConfidenceLevel(0.99);
        break;
      case 'testing':
        setSampleSize(2000);
        setObservedCount(240); // 12% conversion
        setConfidenceLevel(0.95);
        break;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Scenario selector */}
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => applyScenarioPreset('election')}
          className={`p-4 rounded-lg text-left transition-all duration-300 ${
            scenario === 'election' 
              ? "bg-gradient-to-br from-blue-900/30 to-neutral-800 border-2 border-blue-500/50" 
              : "bg-neutral-800 border-2 border-neutral-700 hover:border-neutral-600"
          }`}
        >
          <div className="flex items-start gap-3">
            <Vote className={`w-8 h-8 mt-1 transition-colors ${
              scenario === 'election' ? "text-blue-400" : "text-neutral-400"
            }`} />
            <div>
              <h3 className="font-semibold text-white mb-1">Election Polling</h3>
              <p className="text-sm text-neutral-400">
                Estimate candidate support with margin of error
              </p>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => applyScenarioPreset('quality')}
          className={`p-4 rounded-lg text-left transition-all duration-300 ${
            scenario === 'quality' 
              ? "bg-gradient-to-br from-green-900/30 to-neutral-800 border-2 border-green-500/50" 
              : "bg-neutral-800 border-2 border-neutral-700 hover:border-neutral-600"
          }`}
        >
          <div className="flex items-start gap-3">
            <Package className={`w-8 h-8 mt-1 transition-colors ${
              scenario === 'quality' ? "text-green-400" : "text-neutral-400"
            }`} />
            <div>
              <h3 className="font-semibold text-white mb-1">Quality Control</h3>
              <p className="text-sm text-neutral-400">
                Monitor defect rates in production
              </p>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => applyScenarioPreset('testing')}
          className={`p-4 rounded-lg text-left transition-all duration-300 ${
            scenario === 'testing' 
              ? "bg-gradient-to-br from-purple-900/30 to-neutral-800 border-2 border-purple-500/50" 
              : "bg-neutral-800 border-2 border-neutral-700 hover:border-neutral-600"
          }`}
        >
          <div className="flex items-start gap-3">
            <FlaskConical className={`w-8 h-8 mt-1 transition-colors ${
              scenario === 'testing' ? "text-purple-400" : "text-neutral-400"
            }`} />
            <div>
              <h3 className="font-semibold text-white mb-1">A/B Testing</h3>
              <p className="text-sm text-neutral-400">
                Compare conversion rates between versions
              </p>
            </div>
          </div>
        </button>
      </div>
      
      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VisualizationSection 
            title="Interactive Proportion Estimation"
            className="bg-neutral-800"
          >
            <GraphContainer height="300px">
              <svg ref={mainVizRef} style={{ width: "100%", height: "100%" }} />
            </GraphContainer>
            
            {/* Results summary */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-900/20 to-neutral-900 rounded-lg p-3 border border-blue-500/30">
                <div className="text-xs text-neutral-400 mb-1">Point Estimate</div>
                <div className="text-xl font-mono text-blue-400 font-bold">
                  {(p * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/20 to-neutral-900 rounded-lg p-3 border border-purple-500/30">
                <div className="text-xs text-neutral-400 mb-1">Margin of Error</div>
                <div className="text-xl font-mono text-purple-400 font-bold">
                  ±{(marginOfError * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-900/20 to-neutral-900 rounded-lg p-3 border border-emerald-500/30">
                <div className="text-xs text-neutral-400 mb-1">{confidenceLevel * 100}% CI</div>
                <div className="text-xl font-mono text-emerald-400 font-bold">
                  [{(ci.lower * 100).toFixed(1)}, {(ci.upper * 100).toFixed(1)}]%
                </div>
              </div>
            </div>
            
            {/* Normal approximation check */}
            <div className="mt-4">
              <div className={`px-3 py-2 rounded-lg text-sm ${
                normalApproxValid
                  ? "bg-green-900/20 border border-green-500/30 text-green-400"
                  : "bg-red-900/20 border border-red-500/30 text-red-400"
              }`}>
                {normalApproxValid ? (
                  <>✓ Normal approximation valid (np={np.toFixed(0)}, nq={nq.toFixed(0)})</>
                ) : (
                  <>⚠ Normal approximation invalid (np={np.toFixed(0)}, nq={nq.toFixed(0)})</>
                )}
              </div>
            </div>
            
            {/* Show methods comparison */}
            <div className="mt-4">
              <button
                onClick={() => setShowMethodComparison(!showMethodComparison)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${showMethodComparison ? "rotate-90" : ""}`} />
                <span>Compare CI Methods</span>
              </button>
            </div>
          </VisualizationSection>
          
          {/* Methods comparison */}
          <AnimatePresence>
            {showMethodComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <VisualizationSection 
                  title="Confidence Interval Methods"
                  className="bg-neutral-800 mt-6"
                >
                  <CIMethodsComparison p={p} n={sampleSize} confidenceLevel={confidenceLevel} />
                </VisualizationSection>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Controls */}
        <div className="space-y-4">
          <VisualizationSection className="bg-neutral-800">
            <h3 className="text-lg font-semibold text-white mb-4">Parameters</h3>
            
            <ControlGroup label="Sample Size">
              <input
                type="range"
                value={sampleSize}
                onChange={(e) => setSampleSize(Number(e.target.value))}
                min={50}
                max={5000}
                step={50}
                className="w-full"
              />
              <div className="text-right text-sm font-mono text-neutral-400 mt-1">
                n = {sampleSize}
              </div>
            </ControlGroup>
            
            <ControlGroup label={scenario === 'quality' ? 'Defects Found' : 'Successes'}>
              <input
                type="range"
                value={observedCount}
                onChange={(e) => setObservedCount(Number(e.target.value))}
                min={0}
                max={sampleSize}
                step={1}
                className="w-full"
              />
              <div className="text-right text-sm font-mono text-neutral-400 mt-1">
                x = {observedCount}
              </div>
            </ControlGroup>
            
            <ControlGroup label="Confidence Level">
              <select
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(parseFloat(e.target.value))}
                className="w-full bg-neutral-700 rounded px-3 py-2 text-white"
              >
                <option value={0.90}>90%</option>
                <option value={0.95}>95%</option>
                <option value={0.99}>99%</option>
              </select>
            </ControlGroup>
          </VisualizationSection>
          
          {/* Insights */}
          <VisualizationSection className="bg-gradient-to-br from-purple-900/20 to-neutral-800 border border-purple-500/30">
            <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {scenario === 'election' ? 'Polling Insights' :
               scenario === 'quality' ? 'Quality Insights' :
               'Testing Insights'}
            </h3>
            
            <div className="space-y-2 text-sm text-neutral-300">
              {scenario === 'election' && (
                <>
                  <p>• A 3% margin of error requires n ≈ 1,067 (95% CI)</p>
                  <p>• Polls near 50/50 have the largest margin of error</p>
                  <p>• Multiple polls can be combined for better precision</p>
                </>
              )}
              {scenario === 'quality' && (
                <>
                  <p>• Zero defects doesn't mean perfect quality</p>
                  <p>• Use "Rule of 3": If 0 defects in n items, true rate ≤ 3/n</p>
                  <p>• Consider acceptance sampling standards</p>
                </>
              )}
              {scenario === 'testing' && (
                <>
                  <p>• Check if CIs overlap before claiming significance</p>
                  <p>• Consider practical vs statistical significance</p>
                  <p>• Account for multiple testing if running many tests</p>
                </>
              )}
            </div>
          </VisualizationSection>
          
          {/* Sample size calculator */}
          <VisualizationSection className="bg-neutral-800">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Sample Size Guide
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-neutral-700">
                <span className="text-neutral-400">±1% margin:</span>
                <span className="font-mono text-orange-400">n ≈ 9,604</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-700">
                <span className="text-neutral-400">±2% margin:</span>
                <span className="font-mono text-orange-400">n ≈ 2,401</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-700">
                <span className="text-neutral-400">±3% margin:</span>
                <span className="font-mono text-orange-400">n ≈ 1,067</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-400">±5% margin:</span>
                <span className="font-mono text-orange-400">n ≈ 384</span>
              </div>
            </div>
            
            <p className="text-xs text-neutral-500 mt-3">
              *Assumes 95% confidence and p = 0.5
            </p>
          </VisualizationSection>
        </div>
      </div>
      
      {/* Common mistakes */}
      <VisualizationSection className="bg-red-900/20 border border-red-500/30">
        <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          Common Mistakes to Avoid
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6 text-sm text-neutral-300">
          <div>
            <h4 className="font-medium text-white mb-2">In Polling</h4>
            <ul className="space-y-1">
              <li>• Ignoring non-response bias</li>
              <li>• Not accounting for undecided voters</li>
              <li>• Misinterpreting margin of error as maximum error</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">In Quality Control</h4>
            <ul className="space-y-1">
              <li>• Using normal approximation for rare events</li>
              <li>• Not considering lot-to-lot variation</li>
              <li>• Ignoring inspection errors</li>
            </ul>
          </div>
        </div>
      </VisualizationSection>
    </div>
  );
});

// Main Component
export default function ProportionConfidenceInterval() {
  const [activeView, setActiveView] = useState('introduction');
  
  return (
    <VisualizationContainer
      title="Confidence Intervals for Proportions"
      description="Master the art of estimating proportions with confidence intervals"
      className="bg-neutral-950"
    >
      <BackToHub href="/chapter5-new" />
      
      {/* Navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveView('introduction')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeView === 'introduction'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          Introduction
        </button>
        <button
          onClick={() => setActiveView('election')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeView === 'election'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          Election Story
        </button>
        <button
          onClick={() => setActiveView('studio')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeView === 'studio'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          Application Studio
        </button>
      </div>
      
      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'introduction' && <ProportionIntroduction />}
          {activeView === 'election' && <ElectionStory />}
          {activeView === 'studio' && <ApplicationStudio />}
        </motion.div>
      </AnimatePresence>
    </VisualizationContainer>
  );
}