"use client";
import React, { useState, useRef, useEffect } from "react";
import * as d3 from "@/utils/d3-utils";

// Helper function for inverse normal CDF
const quantileNormal = (p) => {
  const a1 = -39.69683028665376;
  const a2 = 220.9460984245205;
  const a3 = -275.9285104469687;
  const a4 = 138.3577518672690;
  const a5 = -30.66479806614716;
  const a6 = 2.506628277459239;
  const b1 = -54.47609879822406;
  const b2 = 161.5858368580409;
  const b3 = -155.6989798598866;
  const b4 = 66.80131188771972;
  const b5 = -13.28068155288572;
  const c1 = -0.007784894002430293;
  const c2 = -0.3223964580411365;
  const c3 = -2.400758277161838;
  const c4 = -2.549732539343734;
  const c5 = 4.374664141464968;
  const c6 = 2.938163982698783;
  const d1 = 0.007784695709041462;
  const d2 = 0.3224671290700398;
  const d3 = 2.445134137142996;
  const d4 = 3.754408661907416;
  
  const p_low = 0.02425;
  const p_high = 1 - p_low;
  
  let q, r;
  if (p < p_low) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  } else if (p <= p_high) {
    q = p - 0.5;
    r = q * q;
    return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }
};
import { GraphContainer } from '../ui/VisualizationContainer';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useMathJax } from '../../hooks/useMathJax';

/**
 * CIInterpretationTrainer - Interactive component to teach correct CI interpretation
 * Shows multiple samples and their CIs to demonstrate frequency interpretation
 */
const CIInterpretationTrainer = React.memo(function CIInterpretationTrainer() {
  const svgRef = useRef(null);
  const [samples, setSamples] = useState([]);
  const [showTrueMean, setShowTrueMean] = useState(false);
  const [selectedInterpretation, setSelectedInterpretation] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const contentRef = useMathJax([samples.length, selectedInterpretation]);
  
  // True population parameters
  const TRUE_MEAN = 100;
  const TRUE_SIGMA = 15;
  const SAMPLE_SIZE = 30;
  const CONFIDENCE_LEVEL = 0.95;
  
  // Generate multiple samples and their CIs
  const generateSamples = async () => {
    setIsGenerating(true);
    const newSamples = [];
    const zCritical = quantileNormal((1 + CONFIDENCE_LEVEL) / 2);
    
    // Generate 100 samples with animation delay
    for (let i = 0; i < 100; i++) {
      // Generate sample
      const sampleData = Array.from({ length: SAMPLE_SIZE }, () => 
        d3.randomNormal(TRUE_MEAN, TRUE_SIGMA)()
      );
      const sampleMean = d3.mean(sampleData);
      const standardError = TRUE_SIGMA / Math.sqrt(SAMPLE_SIZE);
      const marginOfError = zCritical * standardError;
      
      const ci = {
        id: i,
        mean: sampleMean,
        lower: sampleMean - marginOfError,
        upper: sampleMean + marginOfError,
        containsTrueMean: TRUE_MEAN >= sampleMean - marginOfError && TRUE_MEAN <= sampleMean + marginOfError
      };
      
      newSamples.push(ci);
      
      // Add animation delay every 10 samples
      if (i % 10 === 9) {
        setSamples([...newSamples]);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    setSamples(newSamples);
    setIsGenerating(false);
  };
  
  // Calculate coverage
  const coverage = samples.filter(s => s.containsTrueMean).length;
  const coveragePercentage = samples.length > 0 ? (coverage / samples.length * 100).toFixed(1) : 0;
  
  // Interpretation options
  const interpretations = [
    {
      id: 'correct',
      text: `If we repeated this sampling process many times, about ${CONFIDENCE_LEVEL * 100}% of the intervals would contain the true population mean.`,
      isCorrect: true,
      feedback: "Correct! This is the frequency interpretation - it's about the long-run behavior of the method."
    },
    {
      id: 'incorrect1',
      text: `There is a ${CONFIDENCE_LEVEL * 100}% probability that the true mean lies within any specific interval.`,
      isCorrect: false,
      feedback: "Incorrect. Once an interval is calculated, it either contains the true mean or it doesn't - there's no probability involved for a specific interval."
    },
    {
      id: 'incorrect2',
      text: `${CONFIDENCE_LEVEL * 100}% of the data values fall within the confidence interval.`,
      isCorrect: false,
      feedback: "Incorrect. The CI is about the population mean, not individual data values. Don't confuse this with prediction intervals."
    },
    {
      id: 'incorrect3',
      text: `We are ${CONFIDENCE_LEVEL * 100}% confident that future sample means will fall in this interval.`,
      isCorrect: false,
      feedback: "Incorrect. The CI estimates the population mean, not where future sample means will fall. That would require a different type of interval."
    }
  ];
  
  useEffect(() => {
    if (!svgRef.current || samples.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = svgRef.current.clientWidth;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([85, 115])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleBand()
      .domain(samples.map((_, i) => i))
      .range([0, innerHeight])
      .padding(0.1);
    
    // Only show a subset of intervals for clarity
    const displaySamples = samples.filter((_, i) => i % 5 === 0);
    
    // Draw confidence intervals
    const intervals = g.selectAll(".interval")
      .data(displaySamples)
      .join("g")
      .attr("class", "interval");
    
    // CI lines
    intervals.append("line")
      .attr("x1", d => xScale(d.lower))
      .attr("x2", d => xScale(d.upper))
      .attr("y1", d => yScale(d.id) + yScale.bandwidth() / 2)
      .attr("y2", d => yScale(d.id) + yScale.bandwidth() / 2)
      .attr("stroke", d => d.containsTrueMean ? "#10b981" : "#ef4444")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 0.8);
    
    // Sample means
    intervals.append("circle")
      .attr("cx", d => xScale(d.mean))
      .attr("cy", d => yScale(d.id) + yScale.bandwidth() / 2)
      .attr("r", 3)
      .attr("fill", d => d.containsTrueMean ? "#10b981" : "#ef4444")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);
    
    // True mean line (if shown)
    if (showTrueMean) {
      g.append("line")
        .attr("x1", xScale(TRUE_MEAN))
        .attr("x2", xScale(TRUE_MEAN))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5")
        .style("opacity", 0)
        .transition()
        .duration(500)
        .style("opacity", 1);
      
      g.append("text")
        .attr("x", xScale(TRUE_MEAN))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", "#3b82f6")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(`μ = ${TRUE_MEAN}`);
    }
    
    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .style("font-size", "12px")
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .style("font-size", "14px")
      .text("Value");
    
    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 150}, 0)`);
    
    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 10)
      .attr("y2", 10)
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2);
    
    legend.append("text")
      .attr("x", 25)
      .attr("y", 10)
      .attr("dy", "0.35em")
      .attr("fill", "#10b981")
      .style("font-size", "12px")
      .text("Contains μ");
    
    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 30)
      .attr("y2", 30)
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2);
    
    legend.append("text")
      .attr("x", 25)
      .attr("y", 30)
      .attr("dy", "0.35em")
      .attr("fill", "#ef4444")
      .style("font-size", "12px")
      .text("Misses μ");
    
  }, [samples, showTrueMean]);
  
  return (
    <div ref={contentRef} className="bg-neutral-800/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Understanding Correct Interpretation
      </h3>
      
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-700/50">
          <p className="text-sm text-neutral-300">
            Watch how confidence intervals behave across many samples. This demonstrates the 
            <span className="text-blue-400 font-semibold"> frequency interpretation</span> of confidence intervals.
          </p>
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={generateSamples}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              isGenerating 
                ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate 100 Samples'}
          </button>
          
          <button
            onClick={() => setShowTrueMean(!showTrueMean)}
            className="px-4 py-2 rounded-lg bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-all"
            disabled={samples.length === 0}
          >
            {showTrueMean ? 'Hide' : 'Show'} True Mean
          </button>
        </div>
        
        {samples.length > 0 && (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
                <p className="text-xs text-neutral-400 mb-1">Total Intervals</p>
                <p className="text-2xl font-mono text-neutral-200">{samples.length}</p>
              </div>
              <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/50">
                <p className="text-xs text-green-400 mb-1">Contain True Mean</p>
                <p className="text-2xl font-mono text-green-400">{coverage}</p>
              </div>
              <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
                <p className="text-xs text-blue-400 mb-1">Coverage Rate</p>
                <p className="text-2xl font-mono text-blue-400">{coveragePercentage}%</p>
              </div>
            </div>
            
            <GraphContainer title="Confidence Intervals from 100 Samples (showing every 5th)">
              <svg ref={svgRef} className="w-full" />
            </GraphContainer>
            
            <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-700/50">
              <h4 className="font-semibold text-amber-400 mb-3">
                What does "{CONFIDENCE_LEVEL * 100}% confidence" really mean?
              </h4>
              <div className="space-y-2">
                {interpretations.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedInterpretation(option.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedInterpretation === option.id
                        ? option.isCorrect
                          ? 'bg-green-900/20 border-green-700/50'
                          : 'bg-red-900/20 border-red-700/50'
                        : 'bg-neutral-800/50 border-neutral-700/50 hover:border-neutral-600/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {selectedInterpretation === option.id && (
                        option.isCorrect 
                          ? <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                          : <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-neutral-200">{option.text}</p>
                        {selectedInterpretation === option.id && (
                          <p className={`text-xs mt-2 ${
                            option.isCorrect ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {option.feedback}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {coverage > 0 && (
              <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-lg p-4 border border-emerald-700/50">
                <h4 className="font-semibold text-emerald-400 mb-2">Key Observation</h4>
                <p className="text-sm text-neutral-300">
                  Notice that approximately {CONFIDENCE_LEVEL * 100}% of the intervals contain the true mean. 
                  As we generate more samples, the coverage rate converges to {CONFIDENCE_LEVEL * 100}%. 
                  This is what "{CONFIDENCE_LEVEL * 100}% confidence" actually means!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export { CIInterpretationTrainer };