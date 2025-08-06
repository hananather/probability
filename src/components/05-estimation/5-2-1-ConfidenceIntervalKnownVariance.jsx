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
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && formulaRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([formulaRef.current]);
        }
        window.MathJax.typesetPromise([formulaRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
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
  }, [mode]); // Add dependencies that affect rendering
  
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
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    
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
      .style("opacity", 0.3);
    
    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .style("color", "#999");
    
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .style("color", "#999");
    
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
        .text(`${cv > 0 ? '+' : ''}${criticalValue.toFixed(3)}`)
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
  }, [confidence, criticalValue, showAreas, isActive]);
  
  useEffect(() => {
    if (hasInteracted && isActive) {
      const timer = setTimeout(() => onComplete(), 2000);
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

// Calculation Steps Component - Memoized to prevent LaTeX re-rendering
const CalculationSteps = React.memo(function CalculationSteps({ sigma, n, xBar, standardError, criticalValue, marginOfError, alpha }) {
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
  }, [sigma, n, standardError, criticalValue, marginOfError, alpha, xBar]);
  
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
  }, [sigma, n, standardError, criticalValue, marginOfError, alpha, xBar, confidence]);
  
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

// REMOVED: Practice Problems Module - Moved to 5-2-2-ConfidenceIntervalPractice.jsx
/* const PracticeProblemModule = React.memo(function PracticeProblemModule({ isActive }) {
  const contentRef = useRef(null);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [userAnswer, setUserAnswer] = useState({ lower: '', upper: '' });
  const [feedback, setFeedback] = useState('');
  
  const problems = [
    {
      id: 1,
      difficulty: 'Easy',
      scenario: 'A sample of 9 observations from a normal population with known standard deviation σ = 5 yields a sample mean x̄ = 19.93.',
      question: 'Construct a 95% confidence interval for the population mean μ.',
      data: { n: 9, sigma: 5, xBar: 19.93, confidence: 95 },
      hints: [
        'Start by finding the critical value z₀.₀₂₅ for 95% confidence',
        'Calculate the standard error: SE = σ/√n = 5/√9',
        'The margin of error is ME = z × SE'
      ],
      solution: {
        steps: [
          'Critical value: z₀.₀₂₅ = 1.96',
          'Standard error: SE = 5/√9 = 5/3 = 1.667',
          'Margin of error: ME = 1.96 × 1.667 = 3.27',
          'CI = 19.93 ± 3.27 = [16.66, 23.20]'
        ],
        lower: 16.66,
        upper: 23.20
      }
    },
    {
      id: 2,
      difficulty: 'Medium',
      scenario: 'A quality control engineer measures the diameter of ball bearings. From 25 measurements with σ = 0.05 mm, the sample mean is 10.02 mm.',
      question: 'Find a 99% confidence interval for the true mean diameter.',
      data: { n: 25, sigma: 0.05, xBar: 10.02, confidence: 99 },
      hints: [
        'For 99% confidence, you need z₀.₀₀₅',
        'Remember: larger confidence level means wider interval',
        'Check your calculations: SE = 0.05/√25 = 0.01'
      ],
      solution: {
        steps: [
          'Critical value: z₀.₀₀₅ = 2.576',
          'Standard error: SE = 0.05/√25 = 0.05/5 = 0.01',
          'Margin of error: ME = 2.576 × 0.01 = 0.02576',
          'CI = 10.02 ± 0.02576 = [9.994, 10.046]'
        ],
        lower: 9.994,
        upper: 10.046
      }
    },
    {
      id: 3,
      difficulty: 'Medium',
      scenario: 'Poll results show 520 out of 1000 voters support candidate A. Use normal approximation.',
      question: 'Construct a 95% confidence interval for the true proportion of support.',
      data: { n: 1000, pHat: 0.52, confidence: 95 },
      hints: [
        'This uses the proportion formula: p̂ ± z√(p̂(1-p̂)/n)',
        'Standard error for proportion: SE = √(0.52×0.48/1000)',
        'Same critical value as before for 95%: z = 1.96'
      ],
      solution: {
        steps: [
          'Sample proportion: p̂ = 520/1000 = 0.52',
          'Standard error: SE = √(0.52×0.48/1000) = 0.0158',
          'Margin of error: ME = 1.96 × 0.0158 = 0.031',
          'CI = 0.52 ± 0.031 = [0.489, 0.551]'
        ],
        lower: 0.489,
        upper: 0.551
      }
    },
    {
      id: 4,
      difficulty: 'Hard',
      scenario: 'A researcher wants to estimate average reaction time with margin of error at most 10 ms at 95% confidence. Previous studies suggest σ = 50 ms.',
      question: 'What sample size is needed?',
      data: { sigma: 50, E: 10, confidence: 95 },
      hints: [
        'Use the sample size formula: n ≥ (z×σ/E)²',
        'For 95% confidence: z = 1.96',
        'Square the entire fraction, not just the numerator'
      ],
      solution: {
        steps: [
          'Required: E ≤ 10, so z×σ/√n ≤ 10',
          'Rearranging: n ≥ (z×σ/E)²',
          'n ≥ (1.96×50/10)² = (9.8)² = 96.04',
          'Need n ≥ 97 observations'
        ],
        answer: 97
      }
    },
    {
      id: 5,
      difficulty: 'Hard',
      scenario: 'Two methods give 95% CIs for the same parameter: Method A: [45.2, 54.8], Method B: [47.1, 52.9].',
      question: 'Which method likely had a larger sample size? Explain.',
      data: { ciA: { lower: 45.2, upper: 54.8 }, ciB: { lower: 47.1, upper: 52.9 } },
      hints: [
        'Compare the widths of the two intervals',
        'Narrower CI suggests larger sample size (assuming same σ)',
        'Width = 2 × margin of error'
      ],
      solution: {
        steps: [
          'Width A = 54.8 - 45.2 = 9.6',
          'Width B = 52.9 - 47.1 = 5.8',
          'Method B has narrower CI',
          'Since ME = z×σ/√n, smaller ME implies larger n',
          'Method B likely had larger sample size'
        ],
        answer: 'Method B'
      }
    }
  ];
  
  const problem = problems[currentProblem];
  
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
  }, [currentProblem, showHint, showSolution]);
  
  const checkAnswer = () => {
    if (problem.id <= 3) {
      const userLower = parseFloat(userAnswer.lower);
      const userUpper = parseFloat(userAnswer.upper);
      const tolerance = 0.01;
      
      if (Math.abs(userLower - problem.solution.lower) < tolerance && 
          Math.abs(userUpper - problem.solution.upper) < tolerance) {
        setFeedback('Correct! Well done!');
      } else {
        setFeedback('Not quite. Check your calculations and try again.');
      }
    } else if (problem.id === 4) {
      const userN = parseInt(userAnswer.lower);
      if (userN === problem.solution.answer) {
        setFeedback('Correct! You found the required sample size.');
      } else {
        setFeedback('Check your calculation. Remember to round up.');
      }
    } else {
      // For explanation questions
      setFeedback('Compare your reasoning with the solution.');
    }
  };
  
  if (!isActive) return null;
  
  return (
    <div
    >
      <VisualizationSection>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          Practice Problems
        </h3>
        
        <div className="flex gap-2 mb-4 flex-wrap">
          {problems.map((p, i) => (
            <button
              key={p.id}
              onClick={() => {
                setCurrentProblem(i);
                setShowHint(false);
                setShowSolution(false);
                setUserAnswer({ lower: '', upper: '' });
                setFeedback('');
              }}
              className={`px-3 py-1 rounded-lg text-sm ${
                i === currentProblem 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Problem {p.id} ({p.difficulty})
            </button>
          ))}
        </div>
        
        <div ref={contentRef} className="space-y-4">
          <div 
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
            key={currentProblem}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                problem.difficulty === 'Easy' ? 'bg-green-900/50 text-green-400' :
                problem.difficulty === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' :
                'bg-red-900/50 text-red-400'
              }`}>
                {problem.difficulty}
              </span>
              <h4 className="font-semibold text-white">Problem {problem.id}</h4>
            </div>
            
            <p className="text-gray-300 mb-3">{problem.scenario}</p>
            <p className="font-semibold text-emerald-400">{problem.question}</p>
            
            {problem.id <= 3 && (
              <div className="mt-4 flex gap-3 items-center">
                <span className="text-sm text-gray-400">Your answer:</span>
                <input
                  type="number"
                  step="0.001"
                  placeholder="Lower bound"
                  value={userAnswer.lower}
                  onChange={(e) => setUserAnswer({ ...userAnswer, lower: e.target.value })}
                  className="px-3 py-1 bg-gray-800 rounded border border-gray-600 text-white w-32"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="number"
                  step="0.001"
                  placeholder="Upper bound"
                  value={userAnswer.upper}
                  onChange={(e) => setUserAnswer({ ...userAnswer, upper: e.target.value })}
                  className="px-3 py-1 bg-gray-800 rounded border border-gray-600 text-white w-32"
                />
                <button
                  onClick={checkAnswer}
                  className="px-4 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg"
                >
                  Check
                </button>
              </div>
            )}
            
            {problem.id === 4 && (
              <div className="mt-4 flex gap-3 items-center">
                <span className="text-sm text-gray-400">Required n ≥</span>
                <input
                  type="number"
                  placeholder="Sample size"
                  value={userAnswer.lower}
                  onChange={(e) => setUserAnswer({ ...userAnswer, lower: e.target.value })}
                  className="px-3 py-1 bg-gray-800 rounded border border-gray-600 text-white w-32"
                />
                <button
                  onClick={checkAnswer}
                  className="px-4 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg"
                >
                  Check
                </button>
              </div>
            )}
            
            {feedback && (
              <p
                className={`mt-3 text-sm ${
                  feedback.includes('Correct') ? 'text-green-400' : 'text-yellow-400'
                }`}
              >
                {feedback}
              </p>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
            >
              {showHint ? 'Hide Hints' : 'Show Hints'}
            </button>
            
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg"
            >
              {showSolution ? 'Hide Solution' : 'Show Solution'}
            </button>
          </div>
          
          <div>
            {showHint && (
              <div
                className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50"
              >
                <h5 className="font-semibold text-blue-400 mb-2">Hints:</h5>
                <ul className="space-y-1 text-sm text-gray-300">
                  {problem.hints.map((hint, i) => (
                    <li key={i}>• {hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div>
            {showSolution && (
              <div
                className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/50"
              >
                <h5 className="font-semibold text-purple-400 mb-2">Solution:</h5>
                <ol className="space-y-2 text-sm text-gray-300">
                  {problem.solution.steps.map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-purple-400">{i + 1}.</span>
                      <span dangerouslySetInnerHTML={{ __html: step }} />
                    </li>
                  ))}
                </ol>
                {problem.solution.answer && (
                  <p className="mt-3 font-semibold text-emerald-400">
                    Answer: {problem.solution.answer}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </VisualizationSection>
    </div>
  );
}); */

// REMOVED: Theoretical Foundations Module - Moved to 5-2-2-ConfidenceIntervalPractice.jsx
/* const TheoreticalFoundationsModule = React.memo(function TheoreticalFoundationsModule({ isActive }) {
  const contentRef = useRef(null);
  const [selectedTopic, setSelectedTopic] = useState('business');
  const [animationKey, setAnimationKey] = useState(0);
  
  const majorExamples = {
    business: {
      title: 'Business & Marketing',
      icon: '📊',
      examples: [
        {
          scenario: 'Market Research',
          description: 'A streaming service surveys 1,000 users about a new feature.',
          result: '62% like it, 95% CI: [59%, 65%]',
          insight: 'With CI not including 50%, you can confidently recommend launching the feature.',
          realWorld: 'Netflix uses this to decide which shows to produce.'
        },
        {
          scenario: 'Sales Forecasting',
          description: 'Q4 sales averaged $2.3M from 36 stores.',
          result: '95% CI: [$2.1M, $2.5M]',
          insight: 'Budget planning can count on at least $2.1M in revenue.',
          realWorld: 'Target uses CIs for inventory planning.'
        }
      ]
    },
    psychology: {
      title: 'Psychology & Social Sciences',
      icon: '🧠',
      examples: [
        {
          scenario: 'Therapy Effectiveness',
          description: 'Depression scores improved by average 8.5 points in 50 patients.',
          result: '95% CI: [6.2, 10.8] points',
          insight: 'Since CI excludes 0, the therapy shows significant improvement.',
          realWorld: 'Insurance companies use this to approve treatments.'
        },
        {
          scenario: 'Memory Study',
          description: 'Students recalled 72% of words after new technique.',
          result: '95% CI: [68%, 76%]',
          insight: 'Can publish that technique improves recall by at least 68%.',
          realWorld: 'Educational apps use this to validate methods.'
        }
      ]
    },
    premed: {
      title: 'Pre-Med & Healthcare',
      icon: '⚕️',
      examples: [
        {
          scenario: 'Drug Trial',
          description: 'Blood pressure reduced by avg 12 mmHg in 100 patients.',
          result: '95% CI: [10, 14] mmHg',
          insight: 'FDA approval likely since entire CI shows meaningful reduction.',
          realWorld: 'This is how Pfizer presents drug effectiveness.'
        },
        {
          scenario: 'Diagnostic Accuracy',
          description: 'New COVID test: 94% accurate in 500 samples.',
          result: '95% CI: [92%, 96%]',
          insight: 'Can market as "over 90% accurate" with confidence.',
          realWorld: 'Abbott Labs used this for rapid test approval.'
        }
      ]
    },
    engineering: {
      title: 'Engineering & Tech',
      icon: '⚙️',
      examples: [
        {
          scenario: 'Quality Control',
          description: 'Circuit boards: avg failure rate 0.8% from 1000 units.',
          result: '95% CI: [0.6%, 1.0%]',
          insight: 'Below 2% spec limit - production continues.',
          realWorld: 'Apple uses this for iPhone quality standards.'
        },
        {
          scenario: 'Load Testing',
          description: 'Server response time: avg 145ms under stress.',
          result: '95% CI: [142ms, 148ms]',
          insight: 'Stays under 150ms SLA - system passes.',
          realWorld: 'Amazon uses this for AWS guarantees.'
        }
      ]
    },
    other: {
      title: 'General Applications',
      icon: '🎯',
      examples: [
        {
          scenario: 'Sports Analytics',
          description: 'Basketball player shoots 38% from 3-point line.',
          result: '95% CI: [35%, 41%]',
          insight: 'Above league average of 34% - worth the max contract.',
          realWorld: 'NBA teams use this for player valuation.'
        },
        {
          scenario: 'Social Media',
          description: 'Instagram poll: 55% prefer new logo design.',
          result: '95% CI: [52%, 58%]',
          insight: 'Majority preference is statistically confirmed.',
          realWorld: 'Companies A/B test everything this way.'
        }
      ]
    }
  };
  
  const currentExamples = majorExamples[selectedTopic];
  
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
  }, [selectedTopic]);
  
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [selectedTopic]);
  
  if (!isActive) return null;
  
  return (
    <div
    >
      <VisualizationSection>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
          Theoretical Foundations
        </h3>
        
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-3">Select a topic:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(majorExamples).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedTopic(key)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  selectedTopic === key 
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="text-lg">{value.icon}</span>
                <span className="text-sm font-medium">{value.title}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div ref={contentRef} className="space-y-4">
          <div>
            <div
              key={animationKey}
            >
              {currentExamples?.examples?.map((example, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 mb-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-400 font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <h4 className="font-bold text-white">{example.scenario}</h4>
                      <p className="text-sm text-gray-300">{example.description}</p>
                      
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-center text-lg font-mono text-amber-400">
                          {example.result}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-emerald-400">
                          <strong>What this means:</strong> {example.insight}
                        </p>
                        <p className="text-xs text-gray-400 italic">
                          Significance: {example.significance}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div 
            className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-xl p-4 border border-amber-700/50"
          >
            <h5 className="font-semibold text-amber-400 mb-2">Key Insight</h5>
            <p className="text-sm text-gray-300">
              Confidence intervals provide a rigorous mathematical framework for quantifying uncertainty,
              forming the foundation of modern statistical inference and scientific reasoning.
            </p>
          </div>
        </div>
      </VisualizationSection>
    </div>
  );
}); */

// REMOVED: Exam Success Module - Moved to 5-2-2-ConfidenceIntervalPractice.jsx  
/* const ExamSuccessModule = React.memo(function ExamSuccessModule({ isActive }) {
  const contentRef = useRef(null);
  const [mode, setMode] = useState('mistakes'); // 'mistakes', 'speed', 'formula', 'ready'
  const [currentMistake, setCurrentMistake] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [readinessScore, setReadinessScore] = useState(null);
  
  const commonMistakes = [
    {
      question: 'A 95% CI for μ is [45, 55]. What does this mean?',
      wrong: '95% of the data falls between 45 and 55',
      correct: 'If we repeated sampling many times, 95% of CIs would contain the true μ',
      explanation: 'CIs are about the parameter (μ), not individual data points!',
      tip: 'Remember: CI = confidence about WHERE the parameter is, not WHERE the data are'
    },
    {
      question: 'Sample mean = 100, σ = 15, n = 9. Find 95% CI.',
      wrong: 'CI = 100 ± 1.96(15) = [70.6, 129.4]',
      correct: 'CI = 100 ± 1.96(15/√9) = 100 ± 9.8 = [90.2, 109.8]',
      explanation: 'Must divide σ by √n to get standard error!',
      tip: 'ALWAYS use σ/√n, never just σ'
    },
    {
      question: 'Width of 99% CI vs 95% CI?',
      wrong: '99% CI is 4% wider than 95% CI',
      correct: '99% CI is about 31% wider (2.576/1.96 ≈ 1.31)',
      explanation: 'Width ratio = critical value ratio',
      tip: 'Memorize: 90% → 1.645, 95% → 1.96, 99% → 2.576'
    }
  ];
  
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
  }, [mode, currentMistake]);
  
  const checkReadiness = () => {
    // Simple readiness assessment
    const scores = {
      formula: Math.random() > 0.3 ? 1 : 0,
      interpretation: Math.random() > 0.4 ? 1 : 0,
      calculation: Math.random() > 0.2 ? 1 : 0,
      assumptions: Math.random() > 0.5 ? 1 : 0
    };
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    setReadinessScore({ scores, total, percentage: (total / 4) * 100 });
  };
  
  if (!isActive) return null;
  
  return (
    <div
    >
      <VisualizationSection>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
          Exam Success Accelerator
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setMode('mistakes')}
            className={`px-4 py-2 rounded-lg transition-all ${
              mode === 'mistakes' 
                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🚨 Common Mistakes
          </button>
          
          <button
            onClick={() => setMode('speed')}
            className={`px-4 py-2 rounded-lg transition-all ${
              mode === 'speed' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ⚡ 10-Min Summary
          </button>
          
          <button
            onClick={() => setMode('formula')}
            className={`px-4 py-2 rounded-lg transition-all ${
              mode === 'formula' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📝 Formula Card
          </button>
          
          <button
            onClick={() => {
              setMode('ready');
              checkReadiness();
            }}
            className={`px-4 py-2 rounded-lg transition-all ${
              mode === 'ready' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ✅ Am I Ready?
          </button>
        </div>
        
        <div ref={contentRef}>
          {mode === 'mistakes' && (
            <div
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-red-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-red-700/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-white">Mistake #{currentMistake + 1}</h4>
                  <div className="flex gap-2">
                    {commonMistakes.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setCurrentMistake(i);
                          setShowAnswer(false);
                        }}
                        className={`w-8 h-8 rounded-full ${
                          i === currentMistake 
                            ? 'bg-red-600 text-white' 
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-white font-medium">{commonMistakes[currentMistake].question}</p>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-red-900/30 rounded-lg border border-red-600/50">
                      <p className="text-sm text-red-400">❌ Common Wrong Answer:</p>
                      <p className="text-white">{commonMistakes[currentMistake].wrong}</p>
                    </div>
                    
                    {showAnswer && (
                      <div
                        className="space-y-2"
                      >
                        <div className="p-3 bg-green-900/30 rounded-lg border border-green-600/50">
                          <p className="text-sm text-green-400">✓ Correct Answer:</p>
                          <p className="text-white">{commonMistakes[currentMistake].correct}</p>
                        </div>
                        
                        <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-600/50">
                          <p className="text-sm text-blue-400">💡 Why:</p>
                          <p className="text-white">{commonMistakes[currentMistake].explanation}</p>
                        </div>
                        
                        <div className="p-3 bg-amber-900/30 rounded-lg border border-amber-600/50">
                          <p className="text-sm text-amber-400">🎯 Remember:</p>
                          <p className="text-white font-semibold">{commonMistakes[currentMistake].tip}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!showAnswer && (
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="w-full py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg"
                    >
                      Show Correct Answer
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {mode === 'speed' && (
            <div
              className="bg-gradient-to-br from-blue-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-700/30"
            >
              <h4 className="font-bold text-blue-400 mb-4">⚡ 10-Minute Crash Course</h4>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-semibold text-white mb-1">1. The Formula (2 min)</h5>
                  <div className="bg-gray-800/50 rounded p-3 text-center">
                    <span dangerouslySetInnerHTML={{ __html: `\\[CI = \\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]` }} />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">That's it. Everything else is just plugging in numbers.</p>
                </div>
                
                <div className="border-l-4 border-cyan-500 pl-4">
                  <h5 className="font-semibold text-white mb-1">2. Critical Values (1 min)</h5>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-800/50 rounded p-2">
                      <p className="text-xs text-gray-400">90%</p>
                      <p className="font-mono text-cyan-400">1.645</p>
                    </div>
                    <div className="bg-gray-800/50 rounded p-2">
                      <p className="text-xs text-gray-400">95%</p>
                      <p className="font-mono text-cyan-400">1.96</p>
                    </div>
                    <div className="bg-gray-800/50 rounded p-2">
                      <p className="text-xs text-gray-400">99%</p>
                      <p className="font-mono text-cyan-400">2.576</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-l-4 border-teal-500 pl-4">
                  <h5 className="font-semibold text-white mb-1">3. Quick Steps (2 min)</h5>
                  <ol className="text-sm space-y-1 text-gray-300">
                    <li>1️⃣ Calculate SE = σ/√n</li>
                    <li>2️⃣ Find z (use table above)</li>
                    <li>3️⃣ ME = z × SE</li>
                    <li>4️⃣ CI = x̄ ± ME</li>
                  </ol>
                </div>
                
                <div className="border-l-4 border-emerald-500 pl-4">
                  <h5 className="font-semibold text-white mb-1">4. Interpretation (3 min)</h5>
                  <p className="text-sm text-gray-300">
                    "We are [confidence]% confident that the true population mean lies between [lower] and [upper]."
                  </p>
                  <p className="text-sm text-red-400 mt-2">
                    NOT: "95% of data is in this interval" ❌
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h5 className="font-semibold text-white mb-1">5. Sample Size (2 min)</h5>
                  <div className="bg-gray-800/50 rounded p-3 text-center">
                    <span dangerouslySetInnerHTML={{ __html: `\\[n \\geq \\left(\\frac{z \\cdot \\sigma}{E}\\right)^2\\]` }} />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">E = desired margin of error</p>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg border border-blue-600/50">
                <p className="text-sm text-blue-400 font-semibold">
                  ⏱️ Total: 10 minutes to understand 90% of what you need!
                </p>
              </div>
            </div>
          )}
          
          {mode === 'formula' && (
            <div
              className="bg-gradient-to-br from-purple-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-700/30"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-purple-400">Formula Card (Print-Ready)</h4>
                <button className="text-sm px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">
                  📥 Download
                </button>
              </div>
              
              <div className="bg-gray-900/90 text-white p-6 rounded-lg space-y-4 border border-gray-700">
                <h5 className="font-bold text-center text-lg border-b-2 border-gray-600 pb-2">
                  Confidence Intervals (σ Known)
                </h5>
                
                <div className="space-y-3">
                  <div className="border-2 border-gray-600 rounded p-3">
                    <p className="font-semibold mb-2">Main Formula:</p>
                    <div className="text-center text-xl">
                      <span dangerouslySetInnerHTML={{ __html: `\\[CI = \\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]` }} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-gray-600 rounded p-2">
                      <p className="font-semibold text-sm">Standard Error:</p>
                      <div className="text-center">
                        <span dangerouslySetInnerHTML={{ __html: `\\[SE = \\frac{\\sigma}{\\sqrt{n}}\\]` }} />
                      </div>
                    </div>
                    
                    <div className="border border-gray-600 rounded p-2">
                      <p className="font-semibold text-sm">Margin of Error:</p>
                      <div className="text-center">
                        <span dangerouslySetInnerHTML={{ __html: `\\[ME = z_{\\alpha/2} \\times SE\\]` }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-300 rounded p-2">
                    <p className="font-semibold text-sm mb-1">Critical Values:</p>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th>Confidence</th>
                          <th>α</th>
                          <th>z<sub>α/2</sub></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td>90%</td><td>0.10</td><td className="font-mono">1.645</td></tr>
                        <tr><td>95%</td><td>0.05</td><td className="font-mono">1.96</td></tr>
                        <tr><td>99%</td><td>0.01</td><td className="font-mono">2.576</td></tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="border border-gray-300 rounded p-2">
                    <p className="font-semibold text-sm">Sample Size:</p>
                    <div className="text-center">
                      <span dangerouslySetInnerHTML={{ __html: `\\[n \\geq \\left(\\frac{z_{\\alpha/2} \\cdot \\sigma}{E}\\right)^2\\]` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {mode === 'ready' && readinessScore && (
            <div
              className="bg-gradient-to-br from-emerald-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30"
            >
              <h4 className="font-bold text-emerald-400 mb-4">Exam Readiness Assessment</h4>
              
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-white mb-2">
                    {readinessScore.percentage}%
                  </div>
                  <p className="text-gray-400">Overall Readiness</p>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(readinessScore.scores).map(([category, score]) => (
                    <div key={category} className="flex items-center gap-3">
                      <span className="w-32 text-sm capitalize">{category}:</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full ${
                            score === 1 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                      <span className={`text-sm ${score === 1 ? 'text-green-400' : 'text-red-400'}`}>
                        {score === 1 ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className={`p-4 rounded-lg border ${
                  readinessScore.percentage >= 75 
                    ? 'bg-green-900/30 border-green-600/50' 
                    : 'bg-yellow-900/30 border-yellow-600/50'
                }`}>
                  <p className="font-semibold mb-2">
                    {readinessScore.percentage >= 75 
                      ? '🎉 You\'re ready for the exam!' 
                      : '📚 Keep practicing these areas:'}
                  </p>
                  {readinessScore.percentage < 75 && (
                    <ul className="text-sm space-y-1">
                      {Object.entries(readinessScore.scores).map(([category, score]) => 
                        score === 0 && (
                          <li key={category} className="text-yellow-400">
                            • Review {category}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </VisualizationSection>
    </div>
  );
}); */

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
  }, [scenario]);
  
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
        />
        <InteractiveCIBuilder isActive={mode === LEARNING_MODES.EXPLORATION} />
      </div>
      
      {/* Practice Component Navigation */}
      <VisualizationSection className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-600/30 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-amber-400 mb-2">📝 Practice Before Moving On</h3>
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