"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { motion } from "framer-motion";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, createColorScheme } from '../../lib/design-system';
import BackToHub from '@/components/ui/BackToHub';
import SectionComplete from '@/components/ui/SectionComplete';
import { Target, Activity, BarChart, Sparkles, RefreshCw, ChevronRight, AlertCircle, Lock, CheckCircle } from 'lucide-react';

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
    <motion.div 
      className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 my-4 border border-blue-700/30"
      whileHover={{ scale: 1.01 }}
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
    </motion.div>
  );
});

// Introduction Component with Visual Flow
const CIIntroduction = React.memo(function CIIntroduction({ mode, onModeChange, unlockedModes }) {
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
  }, [mode, unlockedModes]); // Add dependencies that affect rendering
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-2xl font-bold text-white mb-4">Learning Path</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(LEARNING_MODES).map(([key, value]) => {
            const isUnlocked = unlockedModes.includes(value);
            const isActive = mode === value;
            const color = MODE_COLORS[value];
            
            return (
              <motion.button
                key={key}
                onClick={() => isUnlocked && onModeChange(value)}
                disabled={!isUnlocked}
                whileHover={isUnlocked ? { scale: 1.02 } : {}}
                whileTap={isUnlocked ? { scale: 0.98 } : {}}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  isActive 
                    ? `bg-gradient-to-br from-${color}/20 to-${color}/10 border-${color}` 
                    : isUnlocked
                    ? 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                    : 'bg-gray-900/50 border-gray-700 opacity-50 cursor-not-allowed'
                }`}
                style={isActive ? { borderColor: color, background: `linear-gradient(to bottom right, ${color}20, ${color}10)` } : {}}
              >
                {!isUnlocked && (
                  <Lock className="absolute top-2 right-2 w-4 h-4 text-gray-500" />
                )}
                {isUnlocked && isActive && (
                  <CheckCircle className="absolute top-2 right-2 w-4 h-4" style={{ color }} />
                )}
                
                <h3 className="font-semibold text-lg mb-1" style={{ color: isActive ? color : '#fff' }}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </h3>
                <p className="text-sm text-gray-400">
                  {value === LEARNING_MODES.INTUITIVE && "Start with the 68-95-99.7 rule"}
                  {value === LEARNING_MODES.FORMAL && "Dive into critical values"}
                  {value === LEARNING_MODES.EXPLORATION && "Explore parameter effects"}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
      
      <motion.div 
        ref={contentRef} 
        className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
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
      </motion.div>
    </motion.div>
  );
});

// Enhanced 68-95-99.7 Rule Explorer with animations
const EmpiricalRuleExplorer = React.memo(({ isActive, onComplete }) => {
  const [stage, setStage] = useState(0); // 0: 68%, 1: 95%, 2: 99.7%
  const [sampleSize, setSampleSize] = useState(30);
  const [discoveries, setDiscoveries] = useState([]);
  const svgRef = useRef(null);
  
  const stages = [
    { level: 68, z: 1, color: '#3b82f6' },
    { level: 95, z: 1.96, color: '#8b5cf6' },
    { level: 99.7, z: 3, color: '#10b981' }
  ];
  
  const currentStage = stages[stage];
  const sampleMean = 100;
  const populationSD = 15;
  const standardError = populationSD / Math.sqrt(sampleSize);
  const marginOfError = currentStage.z * standardError;
  
  useEffect(() => {
    if (!isActive) return;
    
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
      .call(d3.axisBottom(xScale))
      .style("color", "#999");
    
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
      .attr("d", line)
      .style("opacity", 0)
      .transition()
      .duration(1500)
      .style("opacity", 1);
    
    // Draw confidence regions with staggered animations
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
        .delay(500 + i * 300)
        .duration(800)
        .style("opacity", 0.3 - i * 0.05);
      
      // Add labels with bounce animation
      svg.append("text")
        .attr("x", xScale(sampleMean))
        .attr("y", yScale(normalPdf(sampleMean - s.z * populationSD / 2, sampleMean, populationSD)))
        .attr("text-anchor", "middle")
        .attr("fill", s.color)
        .attr("font-weight", "bold")
        .attr("font-size", "14px")
        .text(`${s.level}%`)
        .style("opacity", 0)
        .attr("transform", `translate(0, -20)`)
        .transition()
        .delay(800 + i * 300)
        .duration(600)
        .style("opacity", 1)
        .attr("transform", `translate(0, 0)`)
        .ease(d3.easeBackOut);
      
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
          .delay(1000 + i * 300)
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
      .attr("stroke-dasharray", "5,5")
      .style("opacity", 0)
      .transition()
      .delay(200)
      .duration(500)
      .style("opacity", 0.8);
    
    // Add CI for sample mean with animation
    const ciLower = sampleMean - marginOfError;
    const ciUpper = sampleMean + marginOfError;
    
    const ciGroup = svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom + 40})`)
      .style("opacity", 0);
    
    ciGroup.append("line")
      .attr("x1", xScale(sampleMean))
      .attr("x2", xScale(sampleMean))
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", currentStage.color)
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .transition()
      .delay(1200)
      .duration(800)
      .attr("x1", xScale(ciLower))
      .attr("x2", xScale(ciUpper));
    
    // CI endpoints
    [ciLower, ciUpper].forEach((x, i) => {
      ciGroup.append("circle")
        .attr("cx", xScale(sampleMean))
        .attr("cy", 0)
        .attr("r", 0)
        .attr("fill", currentStage.color)
        .transition()
        .delay(1400 + i * 100)
        .duration(400)
        .attr("cx", xScale(x))
        .attr("r", 4);
    });
    
    ciGroup.transition()
      .delay(1200)
      .duration(400)
      .style("opacity", 1);
    
  }, [stage, sampleSize, isActive]);
  
  const unlockNextStage = () => {
    if (stage < 2) {
      setStage(stage + 1);
      const nextStage = stages[stage + 1];
      setDiscoveries(prev => [...prev, `Unlocked ${nextStage.level}% confidence level!`]);
      
      if (stage === 1) {
        // Complete this mode when reaching 99.7%
        setTimeout(() => onComplete(), 1000);
      }
    }
  };
  
  if (!isActive) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <VisualizationSection>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          The 68-95-99.7 Rule
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {stages.map((s, i) => (
            <motion.div
              key={i}
              className={`rounded-lg p-4 border-2 transition-all ${
                i === stage 
                  ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/30 shadow-lg' 
                  : i < stage
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-gray-900/50 border-gray-800 opacity-50'
              }`}
              style={{
                borderColor: i <= stage ? s.color : '#374151',
                boxShadow: i === stage ? `0 0 20px ${s.color}40` : 'none'
              }}
              animate={{ scale: i === stage ? 1.02 : 1 }}
              whileHover={i <= stage ? { scale: 1.05 } : {}}
            >
              <h4 className="font-semibold mb-1" style={{ color: i <= stage ? s.color : '#666' }}>
                {s.level}% Confidence
              </h4>
              <p className="text-sm text-gray-400">z = ±{s.z}</p>
              {i <= stage && (
                <motion.p 
                  className="text-xs mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  ME = {(s.z * standardError).toFixed(2)}
                </motion.p>
              )}
            </motion.div>
          ))}
        </div>
        
        <GraphContainer>
          <svg ref={svgRef} width="100%" height="350" viewBox="0 0 600 350" />
        </GraphContainer>
        
        <motion.div 
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-4 border border-gray-700/50"
          whileHover={{ scale: 1.01 }}
        >
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
        </motion.div>
        
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
              <motion.button
                onClick={unlockNextStage}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
              >
                <ChevronRight size={16} />
                Unlock {stages[stage + 1].level}% Level
              </motion.button>
            )}
          </div>
        </ControlGroup>
        
        {discoveries.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-gray-300">Discoveries</h4>
            {discoveries.map((discovery, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-r from-emerald-900/20 to-blue-900/20 rounded p-2 text-sm border border-emerald-700/50 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                {discovery}
              </motion.div>
            ))}
          </div>
        )}
      </VisualizationSection>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if isActive changes
  return prevProps.isActive === nextProps.isActive;
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
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
          <motion.div 
            className="bg-gradient-to-br from-purple-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-purple-700/30"
            whileHover={{ scale: 1.02 }}
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
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
            whileHover={{ scale: 1.02 }}
          >
            <h4 className="font-semibold text-gray-300 mb-2">Common Critical Values</h4>
            <div className="space-y-1 text-sm">
              {commonLevels.map(({ level, z }) => (
                <motion.div 
                  key={level} 
                  className="flex justify-between items-center p-1 rounded"
                  whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                >
                  <span>{level}%:</span>
                  <span className="font-mono text-purple-400">±{z}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
                <motion.button
                  key={level}
                  onClick={() => {
                    setConfidence(level);
                    setHasInteracted(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1 rounded transition-all ${
                    confidence === level 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {level}%
                </motion.button>
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
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <VisualizationSection>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
          Interactive CI Builder
        </h3>
        
        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <motion.div 
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
              whileHover={{ scale: 1.01 }}
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
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-700/30"
              whileHover={{ scale: 1.01 }}
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
            </motion.div>
          </div>
          
          <div className="space-y-4">
            <motion.div 
              className="bg-gradient-to-br from-emerald-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-emerald-700/30"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
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
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 rounded-xl p-4 border border-purple-700/50"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="font-semibold text-purple-400 mb-2">Final Result</h4>
              <p className="text-2xl font-bold text-center text-white">
                [{ciLower.toFixed(2)}, {ciUpper.toFixed(2)}]
              </p>
              <p className="text-sm text-gray-400 text-center mt-2">
                We are {confidence}% confident that μ lies in this interval
              </p>
            </motion.div>
          </div>
        </div>
      </VisualizationSection>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if isActive changes
  return prevProps.isActive === nextProps.isActive;
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <VisualizationSection>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
          Parameter Effects Explorer
        </h3>
        
        <div className="flex gap-2 mb-4">
          {['n', 'sigma', 'confidence'].map(param => (
            <motion.button
              key={param}
              onClick={() => setComparison(param)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg transition-all ${
                comparison === param 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Compare {param === 'n' ? 'Sample Size' : param === 'sigma' ? 'Std Dev' : 'Confidence'}
            </motion.button>
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
                  <motion.g 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
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
                  </motion.g>
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
            <motion.div 
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
              whileHover={{ scale: 1.01 }}
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
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-700/30"
              whileHover={{ scale: 1.01 }}
            >
              <h4 className="font-semibold text-blue-400 mb-2">Width Comparison</h4>
              <div className="space-y-2">
                {comparisons[comparison].map((comp, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm">{comp.label}:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(comp.value.width / 20) * 100}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                        />
                      </div>
                      <span className="text-sm font-mono text-gray-400 w-12 text-right">
                        {comp.value.width.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </VisualizationSection>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if isActive changes
  return prevProps.isActive === nextProps.isActive;
});

// Main Component with Progressive Learning
export default function ConfidenceIntervalKnownVariance() {
  const [mode, setMode] = useState(LEARNING_MODES.INTUITIVE);
  const [unlockedModes, setUnlockedModes] = useState([LEARNING_MODES.INTUITIVE]);
  const [completedSections, setCompletedSections] = useState([]);
  
  const unlockMode = (newMode) => {
    if (!unlockedModes.includes(newMode)) {
      setUnlockedModes(prev => [...prev, newMode]);
    }
  };
  
  const handleSectionComplete = (section) => {
    if (!completedSections.includes(section)) {
      setCompletedSections(prev => [...prev, section]);
      
      // Unlock next mode based on completion
      if (section === LEARNING_MODES.INTUITIVE) {
        unlockMode(LEARNING_MODES.FORMAL);
      } else if (section === LEARNING_MODES.FORMAL) {
        unlockMode(LEARNING_MODES.EXPLORATION);
      }
    }
  };
  
  return (
    <VisualizationContainer
      title="5.2 Confidence Intervals (σ Known)"
      description="Master confidence interval construction when population variance is known"
    >
      <BackToHub chapter={5} />
      
      <CIIntroduction 
        mode={mode} 
        onModeChange={setMode}
        unlockedModes={unlockedModes}
      />
      
      {/* INTUITIVE Mode */}
      <div style={{ display: mode === LEARNING_MODES.INTUITIVE ? 'block' : 'none' }}>
        <EmpiricalRuleExplorer 
          isActive={mode === LEARNING_MODES.INTUITIVE}
          onComplete={() => handleSectionComplete(LEARNING_MODES.INTUITIVE)}
        />
        <InteractiveCIBuilder isActive={mode === LEARNING_MODES.INTUITIVE} />
      </div>
      
      {/* FORMAL Mode */}
      <div style={{ display: mode === LEARNING_MODES.FORMAL ? 'block' : 'none' }}>
        <CriticalValuesExplorer 
          isActive={mode === LEARNING_MODES.FORMAL}
          onComplete={() => handleSectionComplete(LEARNING_MODES.FORMAL)}
        />
        <InteractiveCIBuilder isActive={mode === LEARNING_MODES.FORMAL} />
      </div>
      
      {/* EXPLORATION Mode */}
      <div style={{ display: mode === LEARNING_MODES.EXPLORATION ? 'block' : 'none' }}>
        <ParameterEffectsExplorer isActive={mode === LEARNING_MODES.EXPLORATION} />
        <InteractiveCIBuilder isActive={mode === LEARNING_MODES.EXPLORATION} />
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <VisualizationSection>
          <h3 className="text-xl font-bold text-white mb-4">Key Takeaways</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div 
              className="bg-gradient-to-br from-emerald-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-emerald-700/30"
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="font-semibold text-emerald-400 mb-2">Essential Concepts</h4>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• CI = x̄ ± z(σ/√n)</li>
                <li>• Width depends on confidence level, σ, and n</li>
                <li>• 68-95-99.7 rule for quick estimates</li>
                <li>• Critical values determine interval width</li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-700/30"
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="font-semibold text-blue-400 mb-2">Common Misconceptions</h4>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• CI is NOT about individual values</li>
                <li>• 95% refers to long-run coverage</li>
                <li>• Wider intervals = more confidence</li>
                <li>• True parameter is fixed, not random</li>
              </ul>
            </motion.div>
          </div>
          
          {completedSections.length === 3 && (
            <motion.div 
              className="mt-4 bg-gradient-to-r from-emerald-900/30 to-blue-900/30 rounded-xl p-4 border border-emerald-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">All Learning Modes Completed!</span>
              </div>
              <p className="text-sm text-gray-300 mt-1">
                You've mastered confidence interval construction with known variance.
              </p>
            </motion.div>
          )}
        </VisualizationSection>
        
        {/* Section Complete - Standardized Component */}
        <SectionComplete chapter={5} />
      </motion.div>
    </VisualizationContainer>
  );
}