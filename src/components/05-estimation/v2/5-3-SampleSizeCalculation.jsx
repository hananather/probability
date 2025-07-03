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
import { Calculator, TrendingUp, DollarSign, Target, Trophy, Zap, Sparkles, BarChart } from 'lucide-react';
import { jStat } from "jstat";

// Get Chapter 5 color scheme
const chapterColors = createColorScheme('estimation');

// Introduction Component
const SampleSizeIntroduction = React.memo(function SampleSizeIntroduction() {
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
          Sample Size Determination: Balancing Precision and Resources
        </p>
        <p>
          How many observations do we need? This fundamental question balances 
          <strong className="text-emerald-400"> statistical precision</strong> with 
          <strong className="text-blue-400"> practical constraints</strong> like cost and time.
        </p>
        
        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="bg-neutral-700/50 rounded-lg p-3">
            <h4 className="font-semibold text-emerald-400 mb-1">For Means (σ known)</h4>
            <div className="text-center mt-2">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[n \\geq \\left(\\frac{z_{\\alpha/2} \\cdot \\sigma}{E}\\right)^2\\]` 
              }} />
            </div>
          </div>
          <div className="bg-neutral-700/50 rounded-lg p-3">
            <h4 className="font-semibold text-blue-400 mb-1">For Proportions</h4>
            <div className="text-center mt-2">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[n \\geq \\frac{z_{\\alpha/2}^2 \\cdot p(1-p)}{E^2}\\]` 
              }} />
            </div>
          </div>
        </div>
        
        <p className="text-xs text-neutral-400">
          This section explores the trade-off curves, cost analysis, and practical scenarios for determining optimal sample sizes.
        </p>
      </div>
    </div>
  );
});

// Sample Size Calculator Component (based on 5-3-1)
const SampleSizeCalculator = () => {
  // State management
  const [mode, setMode] = useState('mean'); // 'mean' or 'proportion'
  const [sigma, setSigma] = useState(15);
  const [marginOfError, setMarginOfError] = useState(2);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [estimatedP, setEstimatedP] = useState(0.5);
  const [costPerUnit, setCostPerUnit] = useState(10);
  const [fixedCost, setFixedCost] = useState(1000);
  const [showCostAnalysis, setShowCostAnalysis] = useState(true);
  
  const svgRef = useRef(null);
  
  // Calculate required sample size
  const alpha = 1 - confidenceLevel;
  const zCritical = jStat.normal.inv(1 - alpha/2, 0, 1);
  
  const requiredN = mode === 'mean' 
    ? Math.ceil(Math.pow((zCritical * sigma) / marginOfError, 2))
    : Math.ceil(Math.pow(zCritical, 2) * estimatedP * (1 - estimatedP) / Math.pow(marginOfError, 2));
  
  const totalCost = fixedCost + (requiredN * costPerUnit);
  
  // Apply scenario preset
  const applyScenario = useCallback((scenario) => {
    switch(scenario.id) {
      case 'poll':
        setMode('proportion');
        setEstimatedP(0.5);
        setMarginOfError(0.03);
        setConfidenceLevel(0.95);
        setCostPerUnit(5);
        setFixedCost(1000);
        break;
      case 'quality':
        setMode('mean');
        setSigma(2.5);
        setMarginOfError(0.5);
        setConfidenceLevel(0.99);
        setCostPerUnit(50);
        setFixedCost(5000);
        break;
      case 'medical':
        setMode('mean');
        setSigma(15);
        setMarginOfError(2);
        setConfidenceLevel(0.95);
        setCostPerUnit(200);
        setFixedCost(10000);
        break;
    }
  }, []);
  
  // Visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 80, left: 80 };
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
      .attr("fill", colors.text.primary)
      .text("Sample Size vs. Margin of Error Trade-off");
    
    // Generate data for the curve
    const errorValues = mode === 'mean'
      ? d3.range(0.1, sigma/2, sigma/100)
      : d3.range(0.005, 0.2, 0.001);
    
    const curveData = errorValues.map(e => ({
      error: e,
      n: mode === 'mean'
        ? Math.pow((zCritical * sigma) / e, 2)
        : Math.pow(zCritical, 2) * estimatedP * (1 - estimatedP) / Math.pow(e, 2)
    }));
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(curveData, d => d.error) * 1.1])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, Math.min(5000, d3.max(curveData, d => d.n) * 1.1)])
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
      .style("stroke", colors.border.DEFAULT);
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.border.DEFAULT);
    
    // Draw the trade-off curve
    const line = d3.line()
      .x(d => xScale(d.error))
      .y(d => yScale(d.n))
      .curve(d3.curveMonotoneX);
    
    // Gradient for the curve
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "curve-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", innerHeight)
      .attr("x2", 0).attr("y2", 0);
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#10b981"); // Emerald green
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ef4444"); // Red
    
    const path = g.append("path")
      .datum(curveData)
      .attr("fill", "none")
      .attr("stroke", "url(#curve-gradient)")
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Animate the curve drawing
    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", 0);
    
    // Draw current point
    const currentPoint = {
      error: mode === 'mean' ? marginOfError : marginOfError,
      n: requiredN
    };
    
    // Vertical line from x-axis to point
    g.append("line")
      .attr("x1", xScale(currentPoint.error))
      .attr("x2", xScale(currentPoint.error))
      .attr("y1", innerHeight)
      .attr("y2", yScale(currentPoint.n))
      .attr("stroke", chapterColors.primary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    // Horizontal line from y-axis to point
    g.append("line")
      .attr("x1", 0)
      .attr("x2", xScale(currentPoint.error))
      .attr("y1", yScale(currentPoint.n))
      .attr("y2", yScale(currentPoint.n))
      .attr("stroke", chapterColors.primary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    // Current point with animation
    const circle = g.append("circle")
      .attr("cx", xScale(currentPoint.error))
      .attr("cy", yScale(currentPoint.n))
      .attr("r", 0)
      .attr("fill", chapterColors.primary)
      .attr("stroke", colors.background.DEFAULT)
      .attr("stroke-width", 2);
    
    // Animate the point appearing
    circle.transition()
      .delay(1500)
      .duration(500)
      .ease(d3.easeBounceOut)
      .attr("r", 8);
    
    // Add pulsing effect
    const pulseCircle = g.append("circle")
      .attr("cx", xScale(currentPoint.error))
      .attr("cy", yScale(currentPoint.n))
      .attr("r", 8)
      .attr("fill", "none")
      .attr("stroke", chapterColors.primary)
      .attr("stroke-width", 2)
      .attr("opacity", 0);
    
    pulseCircle
      .transition()
      .delay(2000)
      .duration(1500)
      .ease(d3.easeSinInOut)
      .attr("r", 20)
      .attr("opacity", 0)
      .on("end", function repeat() {
        d3.select(this)
          .attr("r", 8)
          .attr("opacity", 1)
          .transition()
          .duration(1500)
          .ease(d3.easeSinInOut)
          .attr("r", 20)
          .attr("opacity", 0)
          .on("end", repeat);
      });
    
    // Annotations
    g.append("text")
      .attr("x", xScale(currentPoint.error))
      .attr("y", innerHeight + 20)
      .attr("text-anchor", "middle")
      .attr("fill", chapterColors.primary)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("font-family", "monospace")
      .text(mode === 'mean' ? `E = ${marginOfError}` : `E = ${(marginOfError * 100).toFixed(1)}%`);
    
    g.append("text")
      .attr("x", -10)
      .attr("y", yScale(currentPoint.n) + 5)
      .attr("text-anchor", "end")
      .attr("fill", chapterColors.primary)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("font-family", "monospace")
      .text(`n = ${requiredN}`);
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => mode === 'mean' ? d : `${(d * 100).toFixed(0)}%`));
    
    xAxis.selectAll("path, line").attr("stroke", colors.border.DEFAULT);
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.text.secondary);
    
    // Y axis
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale));
    
    yAxis.selectAll("path, line").attr("stroke", colors.border.DEFAULT);
    yAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.text.secondary);
    
    // Axis labels
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 60})`)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.text.primary)
      .text(`Margin of Error (E)${mode === 'proportion' ? ' as %' : ''}`);
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x", 0 - (innerHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.text.primary)
      .text("Required Sample Size (n)");
    
  }, [mode, sigma, marginOfError, confidenceLevel, estimatedP, zCritical, requiredN]);
  
  const scenarios = [
    {
      id: 'poll',
      name: 'Political Poll',
      description: 'Standard election poll with ±3% margin',
      icon: <Target className="w-4 h-4" />,
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/50'
    },
    {
      id: 'quality',
      name: 'Quality Control',
      description: 'Manufacturing quality assessment',
      icon: <BarChart className="w-4 h-4" />,
      color: 'from-emerald-500/20 to-green-500/20',
      borderColor: 'border-emerald-500/50'
    },
    {
      id: 'medical',
      name: 'Medical Study',
      description: 'Clinical trial measurements',
      icon: <Sparkles className="w-4 h-4" />,
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/50'
    }
  ];
  
  return (
    <VisualizationSection>
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-neutral-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Estimation Type</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('mean')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  mode === 'mean'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
                }`}
              >
                Population Mean
              </button>
              <button
                onClick={() => setMode('proportion')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  mode === 'proportion'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
                }`}
              >
                Population Proportion
              </button>
            </div>
          </div>
          
          <div className="bg-neutral-800 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Parameters</h3>
            
            {mode === 'mean' ? (
              <>
                <ControlGroup label={`Population Std Dev (σ = ${sigma})`}>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    step={0.5}
                    value={sigma}
                    onChange={(e) => setSigma(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </ControlGroup>
                
                <ControlGroup label={`Margin of Error (E = ${marginOfError})`}>
                  <input
                    type="range"
                    min={0.1}
                    max={Math.min(10, sigma/2)}
                    step={0.1}
                    value={marginOfError}
                    onChange={(e) => setMarginOfError(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </ControlGroup>
              </>
            ) : (
              <>
                <ControlGroup label={`Estimated p (${(estimatedP * 100).toFixed(0)}%)`}>
                  <input
                    type="range"
                    min={0.1}
                    max={0.9}
                    step={0.05}
                    value={estimatedP}
                    onChange={(e) => setEstimatedP(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Use 0.5 for maximum variability (conservative)
                  </p>
                </ControlGroup>
                
                <ControlGroup label={`Margin of Error (${(marginOfError * 100).toFixed(1)}%)`}>
                  <input
                    type="range"
                    min={0.005}
                    max={0.1}
                    step={0.001}
                    value={marginOfError}
                    onChange={(e) => setMarginOfError(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </ControlGroup>
              </>
            )}
            
            <ControlGroup label="Confidence Level">
              <div className="flex gap-2">
                {[0.90, 0.95, 0.99].map(level => (
                  <button
                    key={level}
                    onClick={() => setConfidenceLevel(level)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      confidenceLevel === level
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
                    }`}
                  >
                    {(level * 100).toFixed(0)}%
                  </button>
                ))}
              </div>
            </ControlGroup>
            
            {showCostAnalysis && (
              <div className="pt-3 border-t border-neutral-700 space-y-3">
                <ControlGroup label={`Cost per Unit ($${costPerUnit})`}>
                  <input
                    type="range"
                    min={1}
                    max={500}
                    step={5}
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(Number(e.target.value))}
                    className="w-full accent-yellow-500"
                  />
                </ControlGroup>
                
                <ControlGroup label={`Fixed Cost ($${fixedCost})`}>
                  <input
                    type="range"
                    min={0}
                    max={20000}
                    step={100}
                    value={fixedCost}
                    onChange={(e) => setFixedCost(Number(e.target.value))}
                    className="w-full accent-yellow-500"
                  />
                </ControlGroup>
              </div>
            )}
          </div>
          
          <motion.div 
            className="bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-emerald-600/30 rounded-lg p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-center">
              <p className="text-sm text-neutral-300 mb-2">Required Sample Size</p>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={requiredN}
                  className="text-4xl font-bold font-mono text-emerald-400"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  n ≥ {requiredN}
                </motion.p>
              </AnimatePresence>
              {showCostAnalysis && (
                <motion.p 
                  className="text-sm text-blue-400 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Total Cost: ${totalCost.toLocaleString()}
                </motion.p>
              )}
            </div>
          </motion.div>
          
          <div className="bg-neutral-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Example Scenarios</h3>
            <div className="space-y-2">
              {scenarios.map((scenario, index) => (
                <motion.button
                  key={scenario.id}
                  onClick={() => applyScenario(scenario)}
                  className={`w-full p-3 rounded-lg text-left transition-all group bg-gradient-to-r ${scenario.color} border-2 ${scenario.borderColor}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <motion.span 
                      className="text-emerald-400"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                    >
                      {scenario.icon}
                    </motion.span>
                    <div>
                      <div className="text-sm font-medium text-white">{scenario.name}</div>
                      <div className="text-xs text-neutral-400">{scenario.description}</div>
                    </div>
                  </motion.div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Panel - Visualization */}
        <div className="lg:col-span-3">
          <GraphContainer height="400px">
            <svg ref={svgRef} style={{ width: "100%", height: 400 }} />
          </GraphContainer>
        </div>
      </div>
    </VisualizationSection>
  );
};

// Sample Size Laboratory Component (based on 5-3-2)
const SampleSizeLaboratory = () => {
  const [marginError, setMarginError] = useState(5);
  const [sigma, setSigma] = useState(15);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [proportionError, setProportionError] = useState(0.03);
  const [estimatedP, setEstimatedP] = useState(0.5);
  const [costPerUnit, setCostPerUnit] = useState(10);
  const [fixedCost, setFixedCost] = useState(1000);
  const [calculationType, setCalculationType] = useState('mean');
  const [achievements, setAchievements] = useState([]);
  
  const marginErrorRef = useRef(null);
  const costAnalysisRef = useRef(null);
  const tradeoffRef = useRef(null);
  
  // Critical z-values
  const zValues = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576
  };
  
  // Calculate sample sizes
  const calculations = useMemo(() => {
    const z = zValues[confidenceLevel] || 1.96;
    
    if (calculationType === 'mean') {
      const n = Math.ceil(Math.pow(z * sigma / marginError, 2));
      const totalCost = fixedCost + n * costPerUnit;
      
      const scenarios = [];
      for (let e = 1; e <= 20; e += 0.5) {
        const sampleSize = Math.ceil(Math.pow(z * sigma / e, 2));
        scenarios.push({
          error: e,
          n: sampleSize,
          cost: fixedCost + sampleSize * costPerUnit
        });
      }
      
      return { n, z, totalCost, scenarios };
    } else {
      const p = estimatedP;
      const n = Math.ceil(z * z * p * (1 - p) / (proportionError * proportionError));
      const totalCost = fixedCost + n * costPerUnit;
      
      const scenarios = [];
      for (let e = 0.01; e <= 0.10; e += 0.005) {
        const sampleSize = Math.ceil(z * z * p * (1 - p) / (e * e));
        scenarios.push({
          error: e,
          n: sampleSize,
          cost: fixedCost + sampleSize * costPerUnit
        });
      }
      
      return { n, z, totalCost, scenarios };
    }
  }, [marginError, sigma, confidenceLevel, proportionError, estimatedP, calculationType, costPerUnit, fixedCost]);
  
  // 3D Visualization Effect
  useEffect(() => {
    if (!tradeoffRef.current) return;
    
    const container = tradeoffRef.current;
    const width = container.offsetWidth;
    const height = 400;
    
    // Clear previous content
    d3.select(container).selectAll("*").remove();
    
    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)");
    
    // Create 3D-like perspective effect
    const g = svg.append("g")
      .attr("transform", `translate(${width/2}, ${height/2})`);
    
    // Create rotating planes
    const planes = [
      { angle: 0, color: chapterColors.primary, label: "Sample Size" },
      { angle: 120, color: "#3b82f6", label: "Precision" },
      { angle: 240, color: "#eab308", label: "Cost" }
    ];
    
    planes.forEach((plane, i) => {
      const planeG = g.append("g")
        .attr("class", `plane-${i}`);
      
      // Draw plane
      const size = 120;
      const points = [
        [-size, -size],
        [size, -size],
        [size, size],
        [-size, size]
      ];
      
      planeG.append("polygon")
        .attr("points", points.map(p => p.join(",")).join(" "))
        .attr("fill", plane.color)
        .attr("fill-opacity", 0.2)
        .attr("stroke", plane.color)
        .attr("stroke-width", 2);
      
      // Add label
      planeG.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("fill", plane.color)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(plane.label);
      
      // Animate rotation
      const rotateAnimation = () => {
        planeG
          .transition()
          .duration(20000)
          .ease(d3.easeLinear)
          .attrTween("transform", () => {
            return (t) => {
              const angle = plane.angle + t * 360;
              const scale = 0.5 + 0.5 * Math.sin((angle * Math.PI) / 180);
              return `rotate(${angle}) scale(${scale})`;
            };
          })
          .on("end", rotateAnimation);
      };
      
      rotateAnimation();
    });
    
    // Add central value
    g.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .attr("fill", colors.text.primary)
      .style("font-size", "48px")
      .style("font-weight", "bold")
      .style("font-family", "monospace")
      .text(calculations.n);
    
    g.append("text")
      .attr("x", 0)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("fill", colors.text.secondary)
      .style("font-size", "14px")
      .text("Required n");
    
  }, [calculations.n]);
  
  // Check achievements
  useEffect(() => {
    const newAchievements = [];
    
    if (calculations.n === 384 && !achievements.includes('classic')) {
      newAchievements.push('classic');
    }
    
    if (calculations.n > 1000 && !achievements.includes('large')) {
      newAchievements.push('large');
    }
    
    if (Math.abs(calculations.n - 100) < 5 && !achievements.includes('century')) {
      newAchievements.push('century');
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  }, [calculations.n, achievements]);
  
  const applyScenario = useCallback((scenario) => {
    switch (scenario) {
      case 'election':
        setCalculationType('proportion');
        setEstimatedP(0.5);
        setProportionError(0.03);
        setConfidenceLevel(0.95);
        setCostPerUnit(5);
        setFixedCost(5000);
        break;
      case 'quality':
        setCalculationType('mean');
        setSigma(0.1);
        setMarginError(0.02);
        setConfidenceLevel(0.99);
        setCostPerUnit(20);
        setFixedCost(500);
        break;
      case 'clinical':
        setCalculationType('mean');
        setSigma(20);
        setMarginError(5);
        setConfidenceLevel(0.95);
        setCostPerUnit(100);
        setFixedCost(10000);
        break;
    }
  }, []);
  
  return (
    <VisualizationSection>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 3D Visualization */}
        <div className="lg:col-span-2">
          <div className="bg-neutral-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Trade-off Visualization</h3>
            <div ref={tradeoffRef} style={{ height: '400px' }} />
          </div>
          
          {/* Formula display */}
          <div className="mt-4 p-4 bg-neutral-900 rounded-lg">
            <div className="text-center font-mono text-sm text-neutral-300">
              {calculationType === 'mean' ? (
                <div>
                  n = ({calculations.z.toFixed(3)} × {sigma} / {marginError})² = {calculations.n}
                </div>
              ) : (
                <div>
                  n = {calculations.z.toFixed(3)}² × {estimatedP} × {(1-estimatedP).toFixed(2)} / {proportionError}² = {calculations.n}
                </div>
              )}
            </div>
          </div>
          
          {/* Results cards */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <motion.div 
              className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 rounded-lg p-4 border border-emerald-500/30"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-sm text-neutral-400 mb-1">Required n</div>
              <div className="text-2xl font-mono text-emerald-400 font-bold">
                {calculations.n.toLocaleString()}
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg p-4 border border-blue-500/30"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-sm text-neutral-400 mb-1">Total Cost</div>
              <div className="text-2xl font-mono text-blue-400 font-bold">
                ${calculations.totalCost.toLocaleString()}
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-lg p-4 border border-yellow-500/30"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-sm text-neutral-400 mb-1">Cost/Unit</div>
              <div className="text-2xl font-mono text-yellow-400 font-bold">
                ${costPerUnit}
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="space-y-4">
          <div className="bg-neutral-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Calculation Type</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCalculationType('mean')}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                  calculationType === 'mean'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                <Calculator className="w-4 h-4 inline mr-2" />
                Means
              </button>
              <button
                onClick={() => setCalculationType('proportion')}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                  calculationType === 'proportion'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                <Target className="w-4 h-4 inline mr-2" />
                Proportions
              </button>
            </div>
          </div>
          
          <div className="bg-neutral-800 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Parameters</h3>
            
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
            
            {calculationType === 'mean' ? (
              <>
                <ControlGroup label={`Margin of Error (E = ${marginError})`}>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={0.5}
                    value={marginError}
                    onChange={(e) => setMarginError(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </ControlGroup>
                
                <ControlGroup label={`Population SD (σ = ${sigma})`}>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={sigma}
                    onChange={(e) => setSigma(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </ControlGroup>
              </>
            ) : (
              <>
                <ControlGroup label={`Margin of Error (${(proportionError * 100).toFixed(1)}%)`}>
                  <input
                    type="range"
                    min={0.01}
                    max={0.10}
                    step={0.005}
                    value={proportionError}
                    onChange={(e) => setProportionError(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </ControlGroup>
                
                <ControlGroup label={`Estimated p (${(estimatedP * 100).toFixed(0)}%)`}>
                  <input
                    type="range"
                    min={0.1}
                    max={0.9}
                    step={0.05}
                    value={estimatedP}
                    onChange={(e) => setEstimatedP(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </ControlGroup>
              </>
            )}
            
            <div className="pt-3 border-t border-neutral-700">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                Cost Analysis
              </h4>
              
              <ControlGroup label={`Cost per Unit ($${costPerUnit})`}>
                <input
                  type="range"
                  min={1}
                  max={200}
                  step={5}
                  value={costPerUnit}
                  onChange={(e) => setCostPerUnit(Number(e.target.value))}
                  className="w-full accent-yellow-500"
                />
              </ControlGroup>
              
              <ControlGroup label={`Fixed Cost ($${fixedCost})`}>
                <input
                  type="range"
                  min={0}
                  max={20000}
                  step={500}
                  value={fixedCost}
                  onChange={(e) => setFixedCost(Number(e.target.value))}
                  className="w-full accent-yellow-500"
                />
              </ControlGroup>
            </div>
          </div>
          
          <div className="bg-neutral-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Practical Scenarios
            </h3>
            
            <div className="space-y-2">
              <button
                onClick={() => applyScenario('election')}
                className="w-full px-4 py-3 rounded-lg text-left transition-all duration-300 bg-neutral-700 hover:bg-neutral-600 border-2 border-transparent hover:border-emerald-500/50"
              >
                <div className="font-medium text-white">Election Polling</div>
                <div className="text-sm text-neutral-400">±3% margin, 95% confidence</div>
              </button>
              
              <button
                onClick={() => applyScenario('quality')}
                className="w-full px-4 py-3 rounded-lg text-left transition-all duration-300 bg-neutral-700 hover:bg-neutral-600 border-2 border-transparent hover:border-emerald-500/50"
              >
                <div className="font-medium text-white">Quality Control</div>
                <div className="text-sm text-neutral-400">Tight tolerances, 99% confidence</div>
              </button>
              
              <button
                onClick={() => applyScenario('clinical')}
                className="w-full px-4 py-3 rounded-lg text-left transition-all duration-300 bg-neutral-700 hover:bg-neutral-600 border-2 border-transparent hover:border-emerald-500/50"
              >
                <div className="font-medium text-white">Clinical Trial</div>
                <div className="text-sm text-neutral-400">Medical study requirements</div>
              </button>
            </div>
          </div>
          
          {achievements.length > 0 && (
            <motion.div 
              className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-lg p-4 border border-yellow-500/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Discoveries
              </h3>
              
              <div className="space-y-2 text-sm">
                {achievements.includes('classic') && (
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">🎯</span>
                    <span className="text-neutral-300">Found the classic n=384!</span>
                  </div>
                )}
                {achievements.includes('large') && (
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">📊</span>
                    <span className="text-neutral-300">Large sample advocate (n&gt;1000)</span>
                  </div>
                )}
                {achievements.includes('century') && (
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">💯</span>
                    <span className="text-neutral-300">Century sample (n≈100)</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Key Insights */}
      <div className="bg-gradient-to-br from-emerald-900/20 to-blue-900/20 rounded-lg p-6 border border-emerald-500/30 mt-6">
        <h3 className="text-xl font-semibold text-emerald-400 mb-4">The Square Root Law</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-white mb-2">Key Insight</h4>
            <p className="text-neutral-300">
              To cut the margin of error in half, you need <span className="text-blue-400 font-bold">4 times</span> as many observations! 
              This is because n is proportional to 1/E².
            </p>
          </div>
          <div>
            <h4 className="text-lg font-medium text-white mb-2">Example</h4>
            <div className="text-sm text-neutral-300 space-y-1 font-mono">
              <div>• E = 10 → n = 96</div>
              <div>• E = 5 → n = 384 (4× larger)</div>
              <div>• E = 2.5 → n = 1,536 (16× larger)</div>
            </div>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
};

// Main Component
export default function SampleSizeCalculation() {
  return (
    <VisualizationContainer
      title="Sample Size Determination"
      description="Calculate optimal sample sizes and explore the trade-offs between precision and cost"
    >
      <BackToHub chapter={5} />
      
      <div className="space-y-8">
        <SampleSizeIntroduction />
        <SampleSizeCalculator />
        <SampleSizeLaboratory />
      </div>
    </VisualizationContainer>
  );
}