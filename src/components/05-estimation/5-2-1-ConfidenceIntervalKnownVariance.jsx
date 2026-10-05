"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, createColorScheme } from '../../lib/design-system';
import BackToHub from '@/components/ui/BackToHub';
import SectionComplete from '@/components/ui/SectionComplete';
import { Target, Activity, BarChart, RefreshCw, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { CIHypothesisTestingBridge } from './5-6-CIHypothesisTestingBridge';
import { CIInterpretationTrainer } from './5-7-CIInterpretationTrainer';
import { Chapter5ReferenceSheet } from '../reference-sheets/Chapter5ReferenceSheet';
import { useMathJax } from '@/hooks/useMathJax';

// Helper function for inverse normal CDF (quantileNormal approximation)
const quantileNormal = (p) => {
  // Approximation of the inverse normal CDF
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

// Get Chapter 5 color scheme
const chapterColors = createColorScheme('estimation');

// Learning modes
const LEARNING_MODES = {
  INTUITIVE: 'intuitive',
  FORMAL: 'formal',
  EXPLORATION: 'exploration'
};

// Mode colors
const MODE_COLORS = {
  [LEARNING_MODES.INTUITIVE]: '#3b82f6', // blue
  [LEARNING_MODES.FORMAL]: '#8b5cf6', // purple
  [LEARNING_MODES.EXPLORATION]: '#10b981' // emerald
};

// Isolated LaTeX Formula Component (Following LaTeX Guide Pattern)
const FormulaSection = React.memo(function FormulaSection() {
  const formulaRef = useRef(null);
  
  useMathJax(formulaRef, []);
  
  return (
    <div 
      className="bg-gradient-to-r from-gray-900/20 to-gray-800/20 rounded-lg p-4 my-4 border border-gray-700/30"
    >
      <h4 className="font-semibold text-emerald-400 mb-2">The Formula</h4>
      <div ref={formulaRef} className="text-center">
        <span dangerouslySetInnerHTML={{ 
          __html: `\\[CI = \\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]` 
        }} />
      </div>
      <div className="mt-3 text-xs space-y-1 grid grid-cols-3 gap-2">
        <p className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x}\\)` }} /> = sample mean
        </p>
        <p className="flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
          <span dangerouslySetInnerHTML={{ __html: `\\(z_{\\alpha/2}\\)` }} /> = critical value
        </p>
        <p className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
          <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma/\\sqrt{n}\\)` }} /> = standard error
        </p>
      </div>
    </div>
  );
});

// Introduction Component with Visual Flow
const CIIntroduction = React.memo(function CIIntroduction({ mode, onModeChange }) {
  const contentRef = useRef(null);
  
  useMathJax(contentRef, [mode]); // Add dependencies that affect rendering
  
  return (
    <div 
      className="mb-8"
    >
      <VisualizationSection className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-2xl font-bold text-white mb-4">Learning Path</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(LEARNING_MODES).map(([key, value]) => {
            const isActive = mode === value;
            const color = MODE_COLORS[value];
            
            return (
              <button
                key={key}
                onClick={() => onModeChange(value)}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  isActive 
                    ? `bg-gradient-to-br from-${color}/20 to-${color}/10 border-${color}` 
                    : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                }`}
                style={isActive ? { borderColor: color, background: `linear-gradient(to bottom right, ${color}20, ${color}10)` } : {}}
              >
                {isActive && (
                  <CheckCircle className="absolute top-2 right-2 w-4 h-4" style={{ color }} />
                )}
                
                <h3 className="font-semibold text-lg mb-1" style={{ color: isActive ? color : '#fff' }}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </h3>
                <p className="text-sm text-gray-400">
                  {value === LEARNING_MODES.INTUITIVE && "Intuitive understanding"}
                  {value === LEARNING_MODES.FORMAL && "Dive into critical values"}
                  {value === LEARNING_MODES.EXPLORATION && "Explore parameter effects"}
                </p>
              </button>
            );
          })}
        </div>
      </VisualizationSection>
      
      <div 
        ref={contentRef} 
        className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mt-4"
      >
        <div className="text-sm text-neutral-300 space-y-3">
          <p className="text-lg font-semibold text-white mb-3">
            Confidence Intervals: Quantifying Uncertainty
          </p>
          <p>
            A <strong className="text-emerald-400">confidence interval</strong> provides a range of plausible values 
            for a population parameter. When σ is known, we use the normal distribution to construct intervals.
          </p>
          
          <FormulaSection />
          
          <p className="text-xs text-neutral-400">
            Progress through the learning modes to master confidence interval construction.
          </p>
        </div>
      </div>
    </div>
  );
});

// Enhanced Critical Values Explorer
const CriticalValuesExplorer = React.memo(({ isActive, onComplete }) => {
  const [confidence, setConfidence] = useState(95);
  const [showAreas, setShowAreas] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const svgRef = useRef(null);
  
  const alpha = 1 - confidence / 100;
  const criticalValue = Math.abs(quantileNormal(alpha / 2));
  
  const commonLevels = [
    { level: 90, z: 1.645 },
    { level: 95, z: 1.96 },
    { level: 99, z: 2.576 },
    { level: 99.9, z: 3.291 }
  ];
  
  useEffect(() => {
    if (!isActive) return;
    
    // Use a timeout to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      if (!svgRef.current) return;
      
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      
      const width = 600;
      const height = 300;
      const margin = { top: 20, right: 20, bottom: 40, left: 40 };
      
      if (!hasInitialized && isActive) {
        setHasInitialized(true);
      }
    
    const xScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.4])
      .range([height - margin.bottom, margin.top]);
    
    // Grid
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickSize(-height + margin.top + margin.bottom).tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Normal distribution
    const normalPdf = (x) => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
    
    const lineData = d3.range(-4, 4.1, 0.1).map(x => ({
      x: x,
      y: normalPdf(x)
    }));
    
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    svg.append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "#8b5cf6")
      .attr("stroke-width", 2)
      .attr("d", line)
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .style("opacity", 1);
    
    // Shaded areas with animation
    if (showAreas) {
      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(height - margin.bottom)
        .y1(d => yScale(d.y))
        .curve(d3.curveBasis);
      
      // Left tail
      const leftTailData = lineData.filter(d => d.x <= -criticalValue);
      svg.append("path")
        .datum(leftTailData)
        .attr("fill", "#ef4444")
        .attr("opacity", 0)
        .attr("d", area)
        .transition()
        .delay(500)
        .duration(800)
        .attr("opacity", 0.3);
      
      // Right tail
      const rightTailData = lineData.filter(d => d.x >= criticalValue);
      svg.append("path")
        .datum(rightTailData)
        .attr("fill", "#ef4444")
        .attr("opacity", 0)
        .attr("d", area)
        .transition()
        .delay(500)
        .duration(800)
        .attr("opacity", 0.3);
      
      // Center area
      const centerData = lineData.filter(d => d.x >= -criticalValue && d.x <= criticalValue);
      svg.append("path")
        .datum(centerData)
        .attr("fill", "#10b981")
        .attr("opacity", 0)
        .attr("d", area)
        .transition()
        .delay(300)
        .duration(800)
        .attr("opacity", 0.2);
    }
    
    // Critical value lines with animation
    [-criticalValue, criticalValue].forEach((cv, i) => {
      svg.append("line")
        .attr("x1", xScale(cv))
        .attr("x2", xScale(cv))
        .attr("y1", height - margin.bottom)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .transition()
        .delay(800 + i * 200)
        .duration(600)
        .attr("y1", margin.top);
      
      svg.append("text")
        .attr("x", xScale(cv))
        .attr("y", margin.top - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#ef4444")
        .attr("font-weight", "bold")
        .text(`${cv > 0 ? '+' : ''}${cv.toFixed(3)}`)
        .style("opacity", 0)
        .transition()
        .delay(1200 + i * 200)
        .duration(400)
        .style("opacity", 1);
    });
    
    // Probability labels
    if (showAreas) {
      svg.append("text")
        .attr("x", xScale(0))
        .attr("y", yScale(0.2))
        .attr("text-anchor", "middle")
        .attr("fill", "#10b981")
        .attr("font-weight", "bold")
        .attr("font-size", "18px")
        .text(`${confidence}%`)
        .style("opacity", 0)
        .transition()
        .delay(1000)
        .duration(500)
        .style("opacity", 1);
      
      [-3, 3].forEach((x, i) => {
        svg.append("text")
          .attr("x", xScale(x))
          .attr("y", yScale(0.05))
          .attr("text-anchor", "middle")
          .attr("fill", "#ef4444")
          .attr("font-size", "12px")
          .text(`${(alpha / 2 * 100).toFixed(1)}%`)
          .style("opacity", 0)
          .transition()
          .delay(1200 + i * 100)
          .duration(400)
          .style("opacity", 1);
      });
    }
    }, 100); // Small delay to ensure DOM is ready
    
    return () => clearTimeout(initTimeout);
  }, [confidence, criticalValue, showAreas, isActive, hasInitialized]);
  
  useEffect(() => {
    if (hasInteracted && isActive) {
      const timer = setTimeout(() => onComplete?.(), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasInteracted, isActive, onComplete]);
  
  if (!isActive) return null;
  
  return (
    <div
    >
      <VisualizationSection>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
          Critical Values Explorer
        </h3>
        
        <GraphContainer>
          <svg ref={svgRef} width="100%" height="300" viewBox="0 0 600 300" />
        </GraphContainer>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <div 
            className="bg-gradient-to-br from-purple-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-purple-700/30"
          >
            <h4 className="font-semibold text-purple-400 mb-2">Understanding Critical Values</h4>
            <div className="space-y-2 text-sm">
              <p>Confidence Level: <span className="font-mono text-white">{confidence}%</span></p>
              <p>Significance Level (α): <span className="font-mono text-white">{(alpha * 100).toFixed(1)}%</span></p>
              <p>Critical Value: <span className="font-mono text-white">±{criticalValue.toFixed(3)}</span></p>
              <p className="text-emerald-400 font-semibold mt-2">
                P(-{criticalValue.toFixed(3)} &lt; Z &lt; {criticalValue.toFixed(3)}) = {confidence}%
              </p>
            </div>
          </div>
          
          <div 
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
          >
            <h4 className="font-semibold text-gray-300 mb-2">Common Critical Values</h4>
            <div className="space-y-1 text-sm">
              {commonLevels.map(({ level, z }) => (
                <div 
                  key={level} 
                  className="flex justify-between items-center p-1 rounded"
                >
                  <span>{level}%:</span>
                  <span className="font-mono text-purple-400">±{z}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <ControlGroup>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confidence Level: {confidence}%
              </label>
              <input
                type="range"
                min="80"
                max="99.9"
                step="0.1"
                value={confidence}
                onChange={(e) => {
                  setConfidence(Number(e.target.value));
                  setHasInteracted(true);
                }}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              {[90, 95, 99].map(level => (
                <button
                  key={level}
                  onClick={() => {
                    setConfidence(level);
                    setHasInteracted(true);
                  }}
                  className={`px-3 py-1 rounded transition-all ${
                    confidence === level 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {level}%
                </button>
              ))}
            </div>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showAreas}
                onChange={(e) => setShowAreas(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Areas</span>
            </label>
          </div>
        </ControlGroup>
      </VisualizationSection>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if isActive changes
  return prevProps.isActive === nextProps.isActive;
});
CriticalValuesExplorer.displayName = 'CriticalValuesExplorer';

// Calculation Steps Component - Memoized to prevent LaTeX re-rendering
const CalculationSteps = React.memo(function CalculationSteps({ sigma, n, xBar, standardError, criticalValue, marginOfError, alpha }) {
  const contentRef = useRef(null);
  
  useMathJax(contentRef, [sigma, n, standardError, criticalValue, marginOfError, alpha, xBar]);
  
  return (
    <div ref={contentRef} className="space-y-3 text-sm">
      <div>
        <p className="text-gray-400">Step 1: Calculate Standard Error</p>
        <div className="text-center my-2">
          <span dangerouslySetInnerHTML={{ 
            __html: `\\[SE = \\frac{\\sigma}{\\sqrt{n}} = \\frac{${sigma}}{\\sqrt{${n}}} = ${standardError.toFixed(4)}\\]` 
          }} />
        </div>
      </div>
      
      <div>
        <p className="text-gray-400">Step 2: Find Critical Value</p>
        <div className="text-center my-2">
          <span dangerouslySetInnerHTML={{ 
            __html: `\\[z_{\\alpha/2} = z_{${(alpha/2).toFixed(3)}} = ${criticalValue.toFixed(3)}\\]` 
          }} />
        </div>
      </div>
      
      <div>
        <p className="text-gray-400">Step 3: Calculate Margin of Error</p>
        <div className="text-center my-2">
          <span dangerouslySetInnerHTML={{ 
            __html: `\\[ME = z_{\\alpha/2} \\times SE = ${criticalValue.toFixed(3)} \\times ${standardError.toFixed(4)} = ${marginOfError.toFixed(4)}\\]` 
          }} />
        </div>
      </div>
      
      <div>
        <p className="text-gray-400">Step 4: Construct Confidence Interval</p>
        <div className="text-center my-2">
          <span dangerouslySetInnerHTML={{ 
            __html: `\\[CI = \\bar{x} \\pm ME = ${xBar} \\pm ${marginOfError.toFixed(4)}\\]` 
          }} />
        </div>
      </div>
    </div>
  );
});

// Interactive CI Builder
const InteractiveCIBuilder = React.memo(({ isActive }) => {
  const contentRef = useRef(null);
  const [n, setN] = useState(64);
  const [sigma, setSigma] = useState(72);
  const [xBar, setXBar] = useState(375.2);
  const [confidence, setConfidence] = useState(95);
  
  const alpha = 1 - confidence / 100;
  const criticalValue = Math.abs(quantileNormal(alpha / 2));
  const standardError = sigma / Math.sqrt(n);
  const marginOfError = criticalValue * standardError;
  const ciLower = xBar - marginOfError;
  const ciUpper = xBar + marginOfError;
  
  useMathJax(contentRef, [isActive, sigma, n, standardError, criticalValue, marginOfError, alpha, xBar, confidence]);
  
  if (!isActive) return null;
  
  return (
    <div
    >
      <VisualizationSection>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
          Interactive CI Builder
        </h3>
        
        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div 
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
            >
              <h4 className="font-semibold text-emerald-400 mb-3">Parameters</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Sample Mean (x̄): {xBar}
                  </label>
                  <input
                    type="range"
                    min="300"
                    max="450"
                    step="0.1"
                    value={xBar}
                    onChange={(e) => setXBar(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Population SD (σ): {sigma}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={sigma}
                    onChange={(e) => setSigma(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Sample Size (n): {n}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    value={n}
                    onChange={(e) => setN(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Confidence Level: {confidence}%
                  </label>
                  <input
                    type="range"
                    min="80"
                    max="99"
                    value={confidence}
                    onChange={(e) => setConfidence(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div 
              className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-700/30"
            >
              <h4 className="font-semibold text-blue-400 mb-2">Quick Examples</h4>
              <div className="space-y-2">
                <button
                  onClick={() => { setN(64); setSigma(72); setXBar(375.2); setConfidence(95); }}
                  className="w-full text-left p-2 rounded hover:bg-gray-700/50 transition-colors text-sm"
                >
                  Example 1: n=64, σ=72, x̄=375.2
                </button>
                <button
                  onClick={() => { setN(9); setSigma(5); setXBar(19.93); setConfidence(95); }}
                  className="w-full text-left p-2 rounded hover:bg-gray-700/50 transition-colors text-sm"
                >
                  Example 2: n=9, σ=5, x̄=19.93
                </button>
                <button
                  onClick={() => { setN(25); setSigma(5); setXBar(19.93); setConfidence(95); }}
                  className="w-full text-left p-2 rounded hover:bg-gray-700/50 transition-colors text-sm"
                >
                  Example 3: n=25, σ=5, x̄=19.93
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div 
              className="bg-gradient-to-br from-emerald-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-emerald-700/30"
            >
              <h4 className="font-semibold text-emerald-400 mb-3">Calculation Steps</h4>
              
              <CalculationSteps 
                sigma={sigma}
                n={n}
                xBar={xBar}
                standardError={standardError}
                criticalValue={criticalValue}
                marginOfError={marginOfError}
                alpha={alpha}
              />
            </div>
            
            <div 
              className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 rounded-xl p-4 border border-purple-700/50"
            >
              <h4 className="font-semibold text-purple-400 mb-2">Final Result</h4>
              <p className="text-2xl font-bold text-center text-white">
                [{ciLower.toFixed(2)}, {ciUpper.toFixed(2)}]
              </p>
              <p className="text-sm text-gray-400 text-center mt-2">
                We are {confidence}% confident that μ lies in this interval
              </p>
            </div>
          </div>
        </div>
      </VisualizationSection>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if isActive changes
  return prevProps.isActive === nextProps.isActive;
});
InteractiveCIBuilder.displayName = 'InteractiveCIBuilder';

// Real-World Interpretation Module
const RealWorldInterpretationModule = React.memo(function RealWorldInterpretationModule({ isActive }) {
  const contentRef = useRef(null);
  const [scenario, setScenario] = useState(0);
  const [selectedInterpretation, setSelectedInterpretation] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const scenarios = [
    {
      id: 1,
      title: 'Political Polling',
      context: 'A poll of 1000 voters shows 52% support for Candidate A with a margin of error of ±3.1% at 95% confidence.',
      ci: '[48.9%, 55.1%]',
      question: 'What does this confidence interval mean?',
      options: [
        {
          text: 'We are 95% sure that exactly 52% of all voters support Candidate A.',
          correct: false,
          feedback: 'Incorrect. The 52% is just our sample estimate, not a certainty about the population.'
        },
        {
          text: 'There is a 95% probability that the true support is between 48.9% and 55.1%.',
          correct: false,
          feedback: 'Common misconception! The true parameter is fixed - it\'s either in the interval or not.'
        },
        {
          text: 'If we repeated this poll many times, about 95% of the intervals would contain the true support level.',
          correct: true,
          feedback: 'Correct! This is the proper frequentist interpretation of confidence intervals.'
        },
        {
          text: '95% of voters have opinions between 48.9% and 55.1%.',
          correct: false,
          feedback: 'Incorrect. The interval is about the population parameter, not individual voters.'
        }
      ],
      insight: 'Since the interval includes 50%, we cannot conclusively say Candidate A is ahead.'
    },
    {
      id: 2,
      title: 'Quality Control',
      context: 'A factory produces widgets with target weight 100g. A sample of 25 widgets gives 95% CI: [98.5g, 101.5g].',
      ci: '[98.5g, 101.5g]',
      question: 'Should the factory adjust its machinery?',
      options: [
        {
          text: '95% of widgets weigh between 98.5g and 101.5g.',
          correct: false,
          feedback: 'No - this interval estimates the mean weight, not the range of individual widgets.'
        },
        {
          text: 'The process mean is likely close to the target since 100g is in the interval.',
          correct: true,
          feedback: 'Correct! The target value being in the CI suggests the process is on target.'
        },
        {
          text: 'We need exactly 100g average, so adjustments are needed.',
          correct: false,
          feedback: 'Statistical variation is normal. Being exactly at 100g is unrealistic.'
        },
        {
          text: 'The interval is too wide, so the process has too much variation.',
          correct: false,
          feedback: 'The interval width reflects sample size and population variance, not process control.'
        }
      ],
      insight: 'The interval includes the target, suggesting the process is under control.'
    },
    {
      id: 3,
      title: 'Medical Testing',
      context: 'A drug trial estimates mean reduction in blood pressure: 95% CI is [8.2, 11.8] mmHg.',
      ci: '[8.2, 11.8] mmHg',
      question: 'What can we conclude about the drug\'s effectiveness?',
      options: [
        {
          text: 'Every patient will see a reduction between 8.2 and 11.8 mmHg.',
          correct: false,
          feedback: 'Incorrect. This is about the average effect, individual responses vary.'
        },
        {
          text: 'The drug has no effect since the interval doesn\'t include 0.',
          correct: false,
          feedback: 'Actually the opposite! Not including 0 suggests a significant effect.'
        },
        {
          text: 'The average reduction in the population is likely between 8.2 and 11.8 mmHg.',
          correct: true,
          feedback: 'Correct! The interval estimates the population mean effect.'
        },
        {
          text: '95% of patients will benefit from the drug.',
          correct: false,
          feedback: 'The 95% refers to confidence in the interval, not the proportion who benefit.'
        }
      ],
      insight: 'Since the entire interval is positive, we have strong evidence the drug reduces blood pressure on average.'
    }
  ];
  
  const currentScenario = scenarios[scenario];
  
  useMathJax(contentRef, [isActive, scenario]);
  
  const handleSelection = (index) => {
    setSelectedInterpretation(index);
    setShowFeedback(true);
  };
  
  if (!isActive) return null;
  
  return (
    <div
    >
      <VisualizationSection>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
          Real-World Interpretation
        </h3>
        
        <div className="flex gap-2 mb-4">
          {scenarios.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setScenario(i);
                setSelectedInterpretation(null);
                setShowFeedback(false);
              }}
              className={`px-3 py-1 rounded-lg text-sm ${
                i === scenario 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
        
        <div ref={contentRef} className="space-y-4">
          <div 
            className="bg-gradient-to-br from-emerald-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30"
            key={scenario}
          >
            <h4 className="font-bold text-white mb-2">{currentScenario.title}</h4>
            <p className="text-gray-300 mb-3">{currentScenario.context}</p>
            <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
              <p className="text-center text-xl font-mono text-emerald-400">
                95% CI: {currentScenario.ci}
              </p>
            </div>
            <p className="font-semibold text-white mb-4">{currentScenario.question}</p>
            
            <div className="space-y-2">
              {currentScenario.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleSelection(i)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedInterpretation === i
                      ? option.correct
                        ? 'bg-green-900/30 border-green-600'
                        : 'bg-red-900/30 border-red-600'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-gray-400">{String.fromCharCode(65 + i)}.</span>
                    <span className="text-gray-300">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            {showFeedback && selectedInterpretation !== null && (
              <div
                className={`rounded-lg p-4 ${
                  currentScenario.options[selectedInterpretation].correct
                    ? 'bg-green-900/20 border border-green-700/50'
                    : 'bg-red-900/20 border border-red-700/50'
                }`}
              >
                <p className={`font-semibold mb-2 ${
                  currentScenario.options[selectedInterpretation].correct
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {currentScenario.options[selectedInterpretation].correct ? '✓ Correct!' : '✗ Not quite'}
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  {currentScenario.options[selectedInterpretation].feedback}
                </p>
                <div className="mt-3 p-3 bg-blue-900/20 rounded border border-blue-700/50">
                  <p className="text-sm text-blue-400 font-semibold mb-1">Key Insight:</p>
                  <p className="text-sm text-gray-300">{currentScenario.insight}</p>
                </div>
              </div>
            )}
          </div>
          
          <div 
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
          >
            <h5 className="font-semibold text-purple-400 mb-2">Remember:</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• A confidence interval estimates a population parameter, not individual values</li>
              <li>• The confidence level describes long-run coverage, not probability for this specific interval</li>
              <li>• Wider intervals give more confidence but less precision</li>
              <li>• Context matters - consider practical significance, not just statistical</li>
            </ul>
          </div>
        </div>
      </VisualizationSection>
    </div>
  );
});

// Parameter Effects Explorer
const ParameterEffectsExplorer = React.memo(({ isActive }) => {
  const [baseN, setBaseN] = useState(25);
  const [baseSigma, setBaseSigma] = useState(10);
  const [baseConfidence, setBaseConfidence] = useState(95);
  const [comparison, setComparison] = useState('n'); // 'n', 'sigma', 'confidence'
  
  const xBar = 100;
  
  const calculateCI = (n, sigma, conf) => {
    const alpha = 1 - conf / 100;
    const z = Math.abs(quantileNormal(alpha / 2));
    const se = sigma / Math.sqrt(n);
    const me = z * se;
    return {
      lower: xBar - me,
      upper: xBar + me,
      width: 2 * me,
      z,
      se,
      me
    };
  };
  
  const baseCI = calculateCI(baseN, baseSigma, baseConfidence);
  
  const comparisons = {
    n: [
      { label: 'n = 10', value: calculateCI(10, baseSigma, baseConfidence), n: 10 },
      { label: 'n = 25', value: calculateCI(25, baseSigma, baseConfidence), n: 25 },
      { label: 'n = 50', value: calculateCI(50, baseSigma, baseConfidence), n: 50 },
      { label: 'n = 100', value: calculateCI(100, baseSigma, baseConfidence), n: 100 }
    ],
    sigma: [
      { label: 'σ = 5', value: calculateCI(baseN, 5, baseConfidence), sigma: 5 },
      { label: 'σ = 10', value: calculateCI(baseN, 10, baseConfidence), sigma: 10 },
      { label: 'σ = 15', value: calculateCI(baseN, 15, baseConfidence), sigma: 15 },
      { label: 'σ = 20', value: calculateCI(baseN, 20, baseConfidence), sigma: 20 }
    ],
    confidence: [
      { label: '90%', value: calculateCI(baseN, baseSigma, 90), conf: 90 },
      { label: '95%', value: calculateCI(baseN, baseSigma, 95), conf: 95 },
      { label: '99%', value: calculateCI(baseN, baseSigma, 99), conf: 99 },
      { label: '99.9%', value: calculateCI(baseN, baseSigma, 99.9), conf: 99.9 }
    ]
  };
  
  if (!isActive) return null;
  
  return (
    <div
    >
      <VisualizationSection>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
          Parameter Effects Explorer
        </h3>
        
        <div className="flex gap-2 mb-4">
          {['n', 'sigma', 'confidence'].map(param => (
            <button
              key={param}
              onClick={() => setComparison(param)}
              className={`px-4 py-2 rounded-lg transition-all ${
                comparison === param 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Compare {param === 'n' ? 'Sample Size' : param === 'sigma' ? 'Std Dev' : 'Confidence'}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraphContainer>
            <svg width="100%" height="300" viewBox="0 0 400 300">
              <text x="200" y="20" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">
                Confidence Interval Comparison
              </text>
              
              {comparisons[comparison].map((comp, i) => {
                const y = 60 + i * 60;
                const scale = d3.scaleLinear()
                  .domain([80, 120])
                  .range([50, 350]);
                
                const color = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][i];
                
                return (
                  <g 
                    key={i}
                  >
                    <text x="40" y={y + 5} textAnchor="end" fill="#999" fontSize="12">
                      {comp.label}
                    </text>
                    
                    <line
                      x1={scale(comp.value.lower)}
                      x2={scale(comp.value.upper)}
                      y1={y}
                      y2={y}
                      stroke={color}
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                    
                    <circle cx={scale(xBar)} cy={y} r={4} fill={color} />
                    
                    <text x="360" y={y + 5} textAnchor="start" fill="#999" fontSize="10">
                      ±{comp.value.me.toFixed(2)}
                    </text>
                  </g>
                );
              })}
              
              <line
                x1={200}
                y1={40}
                x2={200}
                y2={280}
                stroke="#ef4444"
                strokeWidth={1}
                strokeDasharray="5,5"
              />
              
              <text x={200} y={290} textAnchor="middle" fill="#ef4444" fontSize="11">
                μ = {xBar}
              </text>
            </svg>
          </GraphContainer>
          
          <div className="space-y-4">
            <div 
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
            >
              <h4 className="font-semibold text-emerald-400 mb-2">Key Insights</h4>
              <div className="space-y-2 text-sm">
                {comparison === 'n' && (
                  <>
                    <p>• Larger sample sizes → narrower intervals</p>
                    <p>• Width decreases with √n (not linearly)</p>
                    <p>• Doubling n reduces width by √2 ≈ 1.41</p>
                  </>
                )}
                {comparison === 'sigma' && (
                  <>
                    <p>• Larger σ → wider intervals</p>
                    <p>• Width increases linearly with σ</p>
                    <p>• Doubling σ doubles the interval width</p>
                  </>
                )}
                {comparison === 'confidence' && (
                  <>
                    <p>• Higher confidence → wider intervals</p>
                    <p>• 95% uses z = 1.96, 99% uses z = 2.576</p>
                    <p>• Trade-off: precision vs. confidence</p>
                  </>
                )}
              </div>
            </div>
            
            <div 
              className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-700/30"
            >
              <h4 className="font-semibold text-blue-400 mb-2">Width Comparison</h4>
              <div className="space-y-2">
                {comparisons[comparison].map((comp, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm">{comp.label}:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        />
                      </div>
                      <span className="text-sm font-mono text-gray-400 w-12 text-right">
                        {comp.value.width.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </VisualizationSection>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if isActive changes
  return prevProps.isActive === nextProps.isActive;
});
ParameterEffectsExplorer.displayName = 'ParameterEffectsExplorer';

// Main Component with Progressive Learning
export default function ConfidenceIntervalKnownVariance() {
  const [mode, setMode] = useState(LEARNING_MODES.INTUITIVE);
  
  return (
    <>
      <Chapter5ReferenceSheet mode="floating" />
      <VisualizationContainer
        title="5.2 Confidence Intervals (σ Known)"
        description="Master confidence interval construction when population variance is known"
      >
      <BackToHub chapter={5} />
      
      <CIIntroduction 
        mode={mode} 
        onModeChange={setMode}
      />
      
      {/* INTUITIVE Mode */}
      <div style={{ display: mode === LEARNING_MODES.INTUITIVE ? 'block' : 'none' }}>
        {/* Intuitive mode content removed per request */}
        <InteractiveCIBuilder isActive={mode === LEARNING_MODES.INTUITIVE} />
      </div>
      
      {/* FORMAL Mode */}
      <div style={{ display: mode === LEARNING_MODES.FORMAL ? 'block' : 'none' }}>
        <CriticalValuesExplorer 
          isActive={mode === LEARNING_MODES.FORMAL}
        />
        <InteractiveCIBuilder isActive={mode === LEARNING_MODES.FORMAL} />
      </div>
      
      {/* EXPLORATION Mode */}
      <div style={{ display: mode === LEARNING_MODES.EXPLORATION ? 'block' : 'none' }}>
        <ParameterEffectsExplorer isActive={mode === LEARNING_MODES.EXPLORATION} />
        <CIHypothesisTestingBridge 
          xBar={100} 
          sigma={15} 
          n={30} 
          confidenceLevel={0.95}
          isActive={mode === LEARNING_MODES.EXPLORATION} 
        />
        <InteractiveCIBuilder isActive={mode === LEARNING_MODES.EXPLORATION} />
      </div>
      
      {/* Practice Component Navigation */}
      <VisualizationSection className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-600/30 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-amber-400 mb-2">Practice Before Moving On</h3>
            <p className="text-neutral-300 text-sm">
              Solidify your understanding with practice problems, quizzes, and interactive exercises.
            </p>
          </div>
          <a 
            href="/chapter5/confidence-intervals-practice"
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
          >
            Start Practice Session →
          </a>
        </div>
      </VisualizationSection>
      
      <div
      >
        <VisualizationSection>
          <h3 className="text-xl font-bold text-white mb-4">Key Takeaways</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className="bg-gradient-to-br from-emerald-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-emerald-700/30"
            >
              <h4 className="font-semibold text-emerald-400 mb-2">Essential Concepts</h4>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• CI = x̄ ± z(σ/√n)</li>
                <li>• Width depends on confidence level, σ, and n</li>
                <li>• Critical values determine interval width</li>
              </ul>
            </div>
            
            <div 
              className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-700/30"
            >
              <h4 className="font-semibold text-blue-400 mb-2">Common Misconceptions</h4>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• CI is NOT about individual values</li>
                <li>• 95% refers to long-run coverage</li>
                <li>• Wider intervals = more confidence</li>
                <li>• True parameter is fixed, not random</li>
              </ul>
            </div>
          </div>
        </VisualizationSection>
        
        {/* Section Complete - Standardized Component */}
        <SectionComplete chapter={5} />
      </div>
      </VisualizationContainer>
    </>
  );
}
