"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../../ui/VisualizationContainer';
import { colors, createColorScheme } from '../../../lib/design-system';
import BackToHub from '@/components/ui/BackToHub';

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
import { Target, Activity, BarChart, Sparkles, RefreshCw, ChevronRight, AlertCircle } from 'lucide-react';

// Get Chapter 5 color scheme
const chapterColors = createColorScheme('estimation');

// Introduction Component
const CIIntroduction = React.memo(function CIIntroduction() {
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
          Confidence Intervals: Quantifying Uncertainty
        </p>
        <p>
          A <strong className="text-emerald-400">confidence interval</strong> provides a range of plausible values 
          for a population parameter. When σ is known, we use the normal distribution to construct intervals.
        </p>
        
        <div className="bg-neutral-700/50 rounded-lg p-3 my-4">
          <h4 className="font-semibold text-emerald-400 mb-2">The Formula</h4>
          <div className="text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[CI = \\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]` 
            }} />
          </div>
          <div className="mt-2 text-xs space-y-1">
            <p>• <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x}\\)` }} /> = sample mean</p>
            <p>• <span dangerouslySetInnerHTML={{ __html: `\\(z_{\\alpha/2}\\)` }} /> = critical value</p>
            <p>• <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma/\\sqrt{n}\\)` }} /> = standard error</p>
          </div>
        </div>
        
        <p className="text-xs text-neutral-400">
          This section explores the 68-95-99.7 rule, critical values, and long-run coverage properties.
        </p>
      </div>
    </div>
  );
});

// 68-95-99.7 Rule Explorer (based on 5-2-1)
const EmpiricalRuleExplorer = () => {
  const [stage, setStage] = useState(0); // 0: 68%, 1: 95%, 2: 99.7%
  const [sampleSize, setSampleSize] = useState(30);
  const [discoveries, setDiscoveries] = useState([]);
  const svgRef = useRef(null);
  
  const stages = [
    { level: 68, z: 1, color: '#10b981' },
    { level: 95, z: 1.96, color: '#3b82f6' },
    { level: 99.7, z: 3, color: '#8b5cf6' }
  ];
  
  const currentStage = stages[stage];
  const sampleMean = 100;
  const populationSD = 15;
  const standardError = populationSD / Math.sqrt(sampleSize);
  const marginOfError = currentStage.z * standardError;
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 350;
    const margin = { top: 20, right: 20, bottom: 60, left: 40 };
    
    const xScale = d3.scaleLinear()
      .domain([sampleMean - 4 * populationSD, sampleMean + 4 * populationSD])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.03])
      .range([height - margin.bottom, margin.top]);
    
    // Draw axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
    
    // Normal distribution
    const normalPdf = (x, mean, sd) => {
      const variance = sd * sd;
      return (1 / Math.sqrt(2 * Math.PI * variance)) * 
             Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
    };
    
    // Draw normal curve
    const lineData = d3.range(xScale.domain()[0], xScale.domain()[1], 0.5).map(x => ({
      x: x,
      y: normalPdf(x, sampleMean, populationSD)
    }));
    
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    svg.append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "#666")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Draw confidence regions
    stages.forEach((s, i) => {
      if (i > stage) return;
      
      const lower = sampleMean - s.z * populationSD;
      const upper = sampleMean + s.z * populationSD;
      
      const areaData = lineData.filter(d => d.x >= lower && d.x <= upper);
      
      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(height - margin.bottom)
        .y1(d => yScale(d.y))
        .curve(d3.curveBasis);
      
      svg.append("path")
        .datum(areaData)
        .attr("fill", s.color)
        .attr("opacity", 0.3 - i * 0.05)
        .attr("d", area)
        .attr("class", "confidence-area")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", 0.3 - i * 0.05);
      
      // Add labels
      svg.append("text")
        .attr("x", xScale(sampleMean))
        .attr("y", yScale(normalPdf(sampleMean - s.z * populationSD / 2, sampleMean, populationSD)))
        .attr("text-anchor", "middle")
        .attr("fill", s.color)
        .attr("font-weight", "bold")
        .text(`${s.level}%`)
        .style("opacity", 0)
        .transition()
        .delay(400)
        .duration(400)
        .style("opacity", 1);
      
      // Add z-score labels
      [-s.z, s.z].forEach(z => {
        svg.append("text")
          .attr("x", xScale(sampleMean + z * populationSD))
          .attr("y", height - margin.bottom + 20)
          .attr("text-anchor", "middle")
          .attr("fill", s.color)
          .attr("font-size", "12px")
          .text(`${z > 0 ? '+' : ''}${z}σ`)
          .style("opacity", 0)
          .transition()
          .delay(600)
          .duration(400)
          .style("opacity", 1);
      });
    });
    
    // Add mean line
    svg.append("line")
      .attr("x1", xScale(sampleMean))
      .attr("x2", xScale(sampleMean))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    // Add CI for sample mean
    const ciLower = sampleMean - marginOfError;
    const ciUpper = sampleMean + marginOfError;
    
    svg.append("line")
      .attr("x1", xScale(ciLower))
      .attr("x2", xScale(ciUpper))
      .attr("y1", height - margin.bottom + 40)
      .attr("y2", height - margin.bottom + 40)
      .attr("stroke", currentStage.color)
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round");
    
    // CI endpoints
    [ciLower, ciUpper].forEach(x => {
      svg.append("circle")
        .attr("cx", xScale(x))
        .attr("cy", height - margin.bottom + 40)
        .attr("r", 4)
        .attr("fill", currentStage.color);
    });
    
  }, [stage, sampleSize]);
  
  const unlockNextStage = () => {
    if (stage < 2) {
      setStage(stage + 1);
      const nextStage = stages[stage + 1];
      setDiscoveries(prev => [...prev, `Unlocked ${nextStage.level}% confidence level!`]);
    }
  };
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">The 68-95-99.7 Rule</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {stages.map((s, i) => (
          <motion.div
            key={i}
            className={`rounded-lg p-4 border-2 transition-all ${
              i === stage 
                ? `bg-${s.color}/20 border-${s.color}` 
                : i < stage
                ? 'bg-neutral-800 border-gray-700'
                : 'bg-neutral-900 border-gray-800 opacity-50'
            }`}
            animate={{ scale: i === stage ? 1.02 : 1 }}
          >
            <h4 className="font-semibold mb-1" style={{ color: i <= stage ? s.color : '#666' }}>
              {s.level}% Confidence
            </h4>
            <p className="text-sm text-gray-400">z = ±{s.z}</p>
            {i <= stage && (
              <p className="text-xs mt-2">
                ME = {(s.z * standardError).toFixed(2)}
              </p>
            )}
          </motion.div>
        ))}
      </div>
      
      <GraphContainer>
        <svg ref={svgRef} width="100%" height="350" viewBox="0 0 600 350" />
      </GraphContainer>
      
      <div className="bg-neutral-800 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-300 mb-2">Current Confidence Interval</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p>Sample Mean: {sampleMean}</p>
            <p>Population SD: {populationSD}</p>
            <p>Sample Size: {sampleSize}</p>
          </div>
          <div>
            <p>Standard Error: {standardError.toFixed(2)}</p>
            <p>Critical Value: ±{currentStage.z}</p>
            <p className="font-semibold" style={{ color: currentStage.color }}>
              CI: [{(sampleMean - marginOfError).toFixed(2)}, {(sampleMean + marginOfError).toFixed(2)}]
            </p>
          </div>
        </div>
      </div>
      
      <ControlGroup>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Sample Size: {sampleSize}
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          {stage < 2 && (
            <button
              onClick={unlockNextStage}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <ChevronRight size={16} />
              Unlock {stages[stage + 1].level}% Level
            </button>
          )}
        </div>
      </ControlGroup>
      
      {discoveries.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold text-gray-300">Discoveries</h4>
          <AnimatePresence>
            {discoveries.map((discovery, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-emerald-900/20 rounded p-2 text-sm border border-emerald-700/50 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                {discovery}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </VisualizationSection>
  );
};

// Critical Values Explorer (based on 5-2-3)
const CriticalValuesExplorer = () => {
  const [confidence, setConfidence] = useState(95);
  const [showAreas, setShowAreas] = useState(true);
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
      .call(d3.axisBottom(xScale));
    
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5));
    
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
      .attr("stroke", "#666")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Shaded areas
    if (showAreas) {
      // Left tail
      const leftTailData = lineData.filter(d => d.x <= -criticalValue);
      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(height - margin.bottom)
        .y1(d => yScale(d.y))
        .curve(d3.curveBasis);
      
      svg.append("path")
        .datum(leftTailData)
        .attr("fill", "#ef4444")
        .attr("opacity", 0.3)
        .attr("d", area);
      
      // Right tail
      const rightTailData = lineData.filter(d => d.x >= criticalValue);
      svg.append("path")
        .datum(rightTailData)
        .attr("fill", "#ef4444")
        .attr("opacity", 0.3)
        .attr("d", area);
      
      // Center area
      const centerData = lineData.filter(d => d.x >= -criticalValue && d.x <= criticalValue);
      svg.append("path")
        .datum(centerData)
        .attr("fill", "#10b981")
        .attr("opacity", 0.2)
        .attr("d", area);
    }
    
    // Critical value lines
    [-criticalValue, criticalValue].forEach(cv => {
      svg.append("line")
        .attr("x1", xScale(cv))
        .attr("x2", xScale(cv))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .style("opacity", 0)
        .transition()
        .duration(500)
        .style("opacity", 1);
      
      svg.append("text")
        .attr("x", xScale(cv))
        .attr("y", margin.top - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#ef4444")
        .attr("font-weight", "bold")
        .text(`${cv > 0 ? '+' : ''}${criticalValue.toFixed(3)}`)
        .style("opacity", 0)
        .transition()
        .delay(300)
        .duration(300)
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
        .text(`${confidence}%`);
      
      [-3, 3].forEach(x => {
        svg.append("text")
          .attr("x", xScale(x))
          .attr("y", yScale(0.05))
          .attr("text-anchor", "middle")
          .attr("fill", "#ef4444")
          .attr("font-size", "12px")
          .text(`${(alpha / 2 * 100).toFixed(1)}%`);
      });
    }
  }, [confidence, criticalValue, showAreas]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">Critical Values Explorer</h3>
      
      <GraphContainer>
        <svg ref={svgRef} width="100%" height="300" viewBox="0 0 600 300" />
      </GraphContainer>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="bg-neutral-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-300 mb-2">Understanding Critical Values</h4>
          <div className="space-y-2 text-sm">
            <p>Confidence Level: {confidence}%</p>
            <p>Significance Level (α): {(alpha * 100).toFixed(1)}%</p>
            <p>Critical Value: ±{criticalValue.toFixed(3)}</p>
            <p className="text-emerald-400">
              P(-{criticalValue.toFixed(3)} &lt; Z &lt; {criticalValue.toFixed(3)}) = {confidence}%
            </p>
          </div>
        </div>
        
        <div className="bg-neutral-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-300 mb-2">Common Critical Values</h4>
          <div className="space-y-1 text-sm">
            {commonLevels.map(({ level, z }) => (
              <div key={level} className="flex justify-between">
                <span>{level}%:</span>
                <span className="font-mono">±{z}</span>
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
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2">
            {[90, 95, 99].map(level => (
              <button
                key={level}
                onClick={() => setConfidence(level)}
                className={`px-3 py-1 rounded transition-colors ${
                  confidence === level 
                    ? 'bg-emerald-600 text-white' 
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
  );
};

// Coverage Simulation (based on 5-2-4)
const CoverageSimulation = () => {
  const [confidence, setConfidence] = useState(95);
  const [sampleSize, setSampleSize] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [intervals, setIntervals] = useState([]);
  const animationRef = useRef(null);
  
  const trueMean = 100;
  const trueSD = 15;
  const criticalValue = Math.abs(quantileNormal((1 - confidence / 100) / 2));
  
  const generateInterval = useCallback(() => {
    const sample = Array.from({ length: sampleSize }, () => 
      d3.randomNormal(trueMean, trueSD)()
    );
    const sampleMean = d3.mean(sample);
    const standardError = trueSD / Math.sqrt(sampleSize);
    const marginOfError = criticalValue * standardError;
    
    return {
      mean: sampleMean,
      lower: sampleMean - marginOfError,
      upper: sampleMean + marginOfError,
      contains: sampleMean - marginOfError <= trueMean && trueMean <= sampleMean + marginOfError
    };
  }, [sampleSize, criticalValue, trueMean, trueSD]);
  
  const runSimulation = () => {
    setIsRunning(true);
    setIntervals([]);
    let count = 0;
    
    const addInterval = () => {
      if (count >= 100) {
        setIsRunning(false);
        return;
      }
      
      setIntervals(prev => [...prev, generateInterval()]);
      count++;
      animationRef.current = setTimeout(addInterval, 50);
    };
    
    addInterval();
  };
  
  const reset = () => {
    setIsRunning(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIntervals([]);
  };
  
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);
  
  const coverage = intervals.length > 0 
    ? intervals.filter(i => i.contains).length / intervals.length * 100 
    : 0;
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">Long-Run Coverage Simulation</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <GraphContainer>
            <svg width="100%" height="400" viewBox="0 0 400 400">
              <line x1={200} y1={20} x2={200} y2={380} stroke="#ef4444" strokeWidth={2} />
              <text x={200} y={10} textAnchor="middle" fill="#ef4444" fontSize="12">
                True μ = {trueMean}
              </text>
              
              {intervals.slice(-20).map((interval, i) => {
                const y = 30 + i * 18;
                const scale = d3.scaleLinear()
                  .domain([trueMean - 30, trueMean + 30])
                  .range([50, 350]);
                
                return (
                  <g key={i}>
                    <line
                      x1={scale(interval.lower)}
                      x2={scale(interval.upper)}
                      y1={y}
                      y2={y}
                      stroke={interval.contains ? '#10b981' : '#ef4444'}
                      strokeWidth={2}
                      opacity={0.8}
                    />
                    <circle
                      cx={scale(interval.mean)}
                      cy={y}
                      r={2}
                      fill={interval.contains ? '#10b981' : '#ef4444'}
                    />
                  </g>
                );
              })}
            </svg>
          </GraphContainer>
          
          <div className="mt-4 text-sm text-gray-400">
            <p>Each horizontal line represents a confidence interval.</p>
            <p className="text-emerald-400">Green intervals contain the true mean.</p>
            <p className="text-red-400">Red intervals miss the true mean.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-300 mb-2">Coverage Results</h4>
            <div className="space-y-2">
              <p>Intervals generated: {intervals.length}</p>
              <p>Intervals containing μ: {intervals.filter(i => i.contains).length}</p>
              <p className="text-lg font-semibold">
                Coverage: <span className={Math.abs(coverage - confidence) < 5 ? 'text-emerald-400' : 'text-yellow-400'}>
                  {coverage.toFixed(1)}%
                </span>
              </p>
              <p className="text-sm text-gray-400">
                Expected: {confidence}%
              </p>
            </div>
          </div>
          
          {intervals.length >= 30 && (
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
              <h4 className="font-semibold text-blue-400 mb-2">
                <AlertCircle className="inline w-4 h-4 mr-1" />
                Key Insight
              </h4>
              <p className="text-sm">
                {Math.abs(coverage - confidence) < 5 
                  ? `Coverage is close to the expected ${confidence}%. This demonstrates that confidence intervals work as intended in the long run!`
                  : `Coverage is ${coverage.toFixed(1)}%, ${coverage > confidence ? 'higher' : 'lower'} than expected. With more intervals, it will converge to ${confidence}%.`
                }
              </p>
            </div>
          )}
          
          <ControlGroup>
            <div className="space-y-3">
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
                  disabled={isRunning}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Sample Size: {sampleSize}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Number(e.target.value))}
                  className="w-full"
                  disabled={isRunning}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={runSimulation}
                  disabled={isRunning}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  Run Simulation
                </button>
                
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </ControlGroup>
        </div>
      </div>
    </VisualizationSection>
  );
};

// Real-World Scenarios
const RealWorldScenarios = React.memo(function RealWorldScenarios() {
  const [scenario, setScenario] = useState('manufacturing');
  const contentRef = useRef(null);
  
  const scenarios = {
    manufacturing: {
      title: 'Quality Control',
      mean: 50,
      sd: 0.5,
      n: 25,
      unit: 'mm',
      context: 'A factory produces bolts with target length 50mm. They measure 25 bolts to ensure quality.'
    },
    medical: {
      title: 'Clinical Trial',
      mean: 120,
      sd: 12,
      n: 100,
      unit: 'mg/dL',
      context: 'Testing a new drug\'s effect on blood glucose levels in 100 patients.'
    },
    survey: {
      title: 'Opinion Poll',
      mean: 0.52,
      sd: 0.05,
      n: 1000,
      unit: '',
      context: 'Estimating support for a candidate based on a sample of 1000 voters.'
    }
  };
  
  const current = scenarios[scenario];
  const se = current.sd / Math.sqrt(current.n);
  const me95 = 1.96 * se;
  
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
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">Real-World Applications</h3>
      
      <div className="flex gap-2 mb-4">
        {Object.entries(scenarios).map(([key, s]) => (
          <button
            key={key}
            onClick={() => setScenario(key)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              scenario === key 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>
      
      <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-neutral-800 rounded-lg p-4">
          <h4 className="font-semibold text-emerald-400 mb-2">{current.title}</h4>
          <p className="text-sm text-gray-300 mb-4">{current.context}</p>
          
          <div className="space-y-2 text-sm">
            <p>Sample mean: {current.mean}{current.unit}</p>
            <p>Known σ: {current.sd}{current.unit}</p>
            <p>Sample size: {current.n}</p>
            <p>Standard error: {se.toFixed(4)}{current.unit}</p>
          </div>
        </div>
        
        <div className="bg-neutral-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-400 mb-2">95% Confidence Interval</h4>
          
          <div className="text-center my-4">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[CI = ${current.mean} \\pm 1.96 \\times ${se.toFixed(4)}\\]` 
            }} />
          </div>
          
          <p className="text-lg font-semibold text-center text-emerald-400">
            [{(current.mean - me95).toFixed(3)}, {(current.mean + me95).toFixed(3)}]{current.unit}
          </p>
          
          <p className="text-sm text-gray-400 mt-4">
            We are 95% confident that the true population {scenario === 'survey' ? 'proportion' : 'mean'} 
            lies within this interval.
          </p>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Main Component
export default function ConfidenceIntervalKnownVariance() {
  return (
    <VisualizationContainer
      title="5.2 Confidence Intervals (σ Known)"
      description="Master confidence interval construction when population variance is known"
    >
      <BackToHub chapter={5} />
      
      <CIIntroduction />
      
      <EmpiricalRuleExplorer />
      
      <CriticalValuesExplorer />
      
      <CoverageSimulation />
      
      <RealWorldScenarios />
      
      <VisualizationSection>
        <h3 className="text-xl font-bold text-white mb-4">Key Takeaways</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-400 mb-2">Essential Concepts</h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• CI = x̄ ± z(σ/√n)</li>
              <li>• Width depends on confidence level, σ, and n</li>
              <li>• 68-95-99.7 rule for quick estimates</li>
              <li>• Critical values determine interval width</li>
            </ul>
          </div>
          
          <div className="bg-neutral-800 rounded-lg p-4">
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
    </VisualizationContainer>
  );
}