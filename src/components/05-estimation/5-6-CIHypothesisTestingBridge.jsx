"use client";
import React, { useState, useRef, useEffect } from "react";
import * as d3 from "@/utils/d3-utils";

// Helper function for inverse normal CDF (from the main component)
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
import { AlertCircle, GitBranch } from 'lucide-react';
import { useMathJax } from '../../hooks/useMathJax';

/**
 * CIHypothesisTestingBridge - Shows the connection between confidence intervals and hypothesis testing
 * Demonstrates the duality: CI excludes μ₀ ⟺ Reject H₀: μ = μ₀
 */
const CIHypothesisTestingBridge = React.memo(function CIHypothesisTestingBridge({ 
  xBar = 100, 
  sigma = 15, 
  n = 30, 
  confidenceLevel = 0.95,
  isActive = true 
}) {
  const svgRef = useRef(null);
  const [hypothesizedMean, setHypothesizedMean] = useState(95);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const contentRef = useMathJax([hypothesizedMean, showExplanation]);
  
  // Calculate CI bounds
  const alpha = 1 - confidenceLevel;
  const zCritical = quantileNormal(1 - alpha / 2);
  const standardError = sigma / Math.sqrt(n);
  const marginOfError = zCritical * standardError;
  const lowerBound = xBar - marginOfError;
  const upperBound = xBar + marginOfError;
  
  // Determine if we reject H₀
  const rejectNull = hypothesizedMean < lowerBound || hypothesizedMean > upperBound;
  
  // Calculate test statistic
  const zStatistic = (xBar - hypothesizedMean) / standardError;
  // Simple normal CDF approximation
  const normalCDF = (z) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return z > 0 ? 1 - p : p;
  };
  const pValue = 2 * (1 - normalCDF(Math.abs(zStatistic)));
  
  useEffect(() => {
    if (!isActive) return;
    if (!svgRef.current) return;
    
    // Use a timeout to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      if (!svgRef.current) return;
      
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      
      const width = svgRef.current.clientWidth || 800;
      const height = 300;
      const margin = { top: 40, right: 40, bottom: 60, left: 40 };
      
      if (!hasInitialized && isActive) {
        setHasInitialized(true);
      }
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // X scale - centered around sample mean
    const xScale = d3.scaleLinear()
      .domain([xBar - 4 * standardError, xBar + 4 * standardError])
      .range([0, innerWidth]);
    
    // Add gradient definitions
    const defs = svg.append("defs");
    
    // CI gradient
    const ciGradient = defs.append("linearGradient")
      .attr("id", "ci-gradient")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%");
    
    ciGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0.3);
    
    ciGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0.1);
    
    // Draw confidence interval
    g.append("rect")
      .attr("x", xScale(lowerBound))
      .attr("y", 0)
      .attr("width", xScale(upperBound) - xScale(lowerBound))
      .attr("height", innerHeight)
      .attr("fill", "url(#ci-gradient)")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,3");
    
    // Add CI bounds labels
    g.append("text")
      .attr("x", xScale(lowerBound))
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#10b981")
      .style("font-size", "12px")
      .text(lowerBound.toFixed(2));
    
    g.append("text")
      .attr("x", xScale(upperBound))
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#10b981")
      .style("font-size", "12px")
      .text(upperBound.toFixed(2));
    
    // Draw sample mean
    g.append("line")
      .attr("x1", xScale(xBar))
      .attr("x2", xScale(xBar))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3);
    
    g.append("text")
      .attr("x", xScale(xBar))
      .attr("y", innerHeight + 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#3b82f6")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(`x̄ = ${xBar}`);
    
    // Draw hypothesized mean
    g.append("line")
      .attr("x1", xScale(hypothesizedMean))
      .attr("x2", xScale(hypothesizedMean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", rejectNull ? "#ef4444" : "#10b981")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "8,4");
    
    g.append("text")
      .attr("x", xScale(hypothesizedMean))
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .attr("fill", rejectNull ? "#ef4444" : "#10b981")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(`μ₀ = ${hypothesizedMean}`);
    
    // Add decision region label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#10b981")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("opacity", 0.6)
      .text(`${(confidenceLevel * 100).toFixed(0)}% Confidence Interval`);
    
    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .style("font-size", "12px");
    
    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat("")
        .ticks(5)
      )
      .style("stroke", "#374151")
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.3);
    
    }, 100); // Small delay to ensure DOM is ready
    
    return () => clearTimeout(initTimeout);
  }, [xBar, sigma, n, confidenceLevel, hypothesizedMean, isActive, hasInitialized]);
  
  if (!isActive) return null;
  
  return (
    <div ref={contentRef} className="bg-neutral-800/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
        <GitBranch className="w-5 h-5" />
        The CI-Hypothesis Testing Connection
      </h3>
      
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-emerald-900/20 to-blue-900/20 rounded-lg p-4 border border-emerald-700/50">
          <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            The Duality Principle
          </h4>
          <p className="text-sm text-neutral-300">
            A confidence interval and hypothesis test are two sides of the same coin:
          </p>
          <div className="mt-3 bg-neutral-900/50 rounded p-3 text-center">
            <p className="text-emerald-400 font-mono text-sm">
              μ₀ not in {(confidenceLevel * 100).toFixed(0)}% CI ⟺ Reject H₀: μ = μ₀ at α = {(alpha).toFixed(2)}
            </p>
          </div>
        </div>
        
        <GraphContainer title="Interactive Visualization">
          <svg ref={svgRef} className="w-full" />
        </GraphContainer>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-neutral-300 mb-2 block">
              Hypothesized Mean (μ₀): {hypothesizedMean}
            </label>
            <input
              type="range"
              min={xBar - 3 * standardError}
              max={xBar + 3 * standardError}
              step={0.5}
              value={hypothesizedMean}
              onChange={(e) => setHypothesizedMean(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className={`rounded-lg p-4 border ${
            rejectNull 
              ? 'bg-red-900/20 border-red-700/50' 
              : 'bg-green-900/20 border-green-700/50'
          }`}>
            <h5 className={`font-semibold mb-2 ${
              rejectNull ? 'text-red-400' : 'text-green-400'
            }`}>
              Decision: {rejectNull ? 'Reject' : 'Fail to Reject'} H₀
            </h5>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-400">Test Statistic:</p>
                <p className="font-mono text-neutral-200">z = {zStatistic.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-neutral-400">p-value:</p>
                <p className="font-mono text-neutral-200">{pValue.toFixed(4)}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-sm text-emerald-400 hover:text-emerald-300 underline"
          >
            {showExplanation ? 'Hide' : 'Show'} Mathematical Connection
          </button>
          
          {showExplanation && (
            <div className="bg-neutral-900/50 rounded-lg p-4 space-y-3">
              <p className="text-sm text-neutral-300">
                The confidence interval approach and hypothesis testing are mathematically equivalent:
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-neutral-400">CI Approach:</p>
                  <div className="font-mono text-neutral-200 ml-4">
                    <span dangerouslySetInnerHTML={{ __html: `\\(${lowerBound.toFixed(2)} < \\mu < ${upperBound.toFixed(2)}\\)` }} />
                  </div>
                </div>
                <div>
                  <p className="text-neutral-400">Hypothesis Test:</p>
                  <div className="font-mono text-neutral-200 ml-4">
                    <span dangerouslySetInnerHTML={{ __html: `\\(H_0: \\mu = ${hypothesizedMean}\\)` }} />
                    <br />
                    <span dangerouslySetInnerHTML={{ __html: `\\(|z| = ${Math.abs(zStatistic).toFixed(3)} ${Math.abs(zStatistic) > zCritical ? '>' : '<'} ${zCritical.toFixed(3)} = z_{\\alpha/2}\\)` }} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-neutral-400 italic">
                Both methods lead to the same conclusion!
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
          <h5 className="font-semibold text-blue-400 mb-2">Key Insights</h5>
          <ul className="text-sm text-neutral-300 space-y-1">
            <li>• A {(confidenceLevel * 100).toFixed(0)}% CI contains all μ₀ values we wouldn't reject at α = {alpha.toFixed(2)}</li>
            <li>• Values outside the CI are "implausible" given our data</li>
            <li>• The CI gives us a range of hypothesis tests all at once</li>
            <li>• This only works for two-tailed tests (H₁: μ ≠ μ₀)</li>
          </ul>
        </div>
      </div>
    </div>
  );
});

export { CIHypothesisTestingBridge };