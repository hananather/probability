"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { VisualizationContainer } from "../ui/VisualizationContainer";
import { Button } from "../ui/button";
import { ProgressBar, ProgressNavigation } from "../ui/ProgressBar";
import { useSafeMathJax } from '../../utils/mathJaxFix';
import { createColorScheme, typography } from "../../lib/design-system";
import { jStat } from "jstat";
import { GammaDistributionWorkedExample } from "./3-5-2-GammaDistributionWorkedExample";
import { Tutorial } from "../ui/Tutorial";
import { ChevronDown, ChevronRight, AlertCircle, TrendingUp, Package, Heart, Cloud, Clock, Zap, ChartBar, Info, Lightbulb, Target, HelpCircle } from "lucide-react";

// LaTeX content component to prevent re-renders
const LatexFormula = React.memo(({ formula }) => {
  const ref = useRef(null);
  
  // Use safe MathJax processing with error handling
  useSafeMathJax(ref, [formula]);
  
  return <span ref={ref} dangerouslySetInnerHTML={{ __html: formula }} />;
});

const GammaDistribution = React.memo(function GammaDistribution() {
  // Guided walkthrough stages
  const [stage, setStage] = useState(1);
  const totalStages = 5;
  
  // Core parameter states
  const [shape, setShape] = useState(1); // Start with exponential
  const [rate, setRate] = useState(1); // λ parameter
  const [showPDF, setShowPDF] = useState(true);
  const [showCDF, setShowCDF] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showRealExample, setShowRealExample] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Real-world example states
  const [exampleType, setExampleType] = useState('waiting'); // 'waiting', 'reliability', 'weather'
  const [simulationData, setSimulationData] = useState([]);
  
  // Refs for D3
  const mainSvgRef = useRef(null);
  const exampleSvgRef = useRef(null);
  const buildSvgRef = useRef(null);
  const contentRef = useRef(null);
  
  // Color scheme - using warm colors for main visualization
  const colors = {
    primary: '#ff6b6b',      // Warm red
    secondary: '#ffa502',    // Orange
    tertiary: '#ff4757',     // Pink red
    accent: '#5f27cd',       // Purple for contrast
    grid: '#e0e0e0',         // Light gray
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
      light: '#95a5a6'
    },
    background: '#ffffff',
    backgroundAlt: '#f8f9fa'
  };
  
  // Ensure rate is positive
  const safeRate = Math.max(0.1, rate);
  const scale = 1 / safeRate; // θ = 1/λ
  
  // Calculate distribution properties
  const mean = shape * scale;
  const variance = shape * scale * scale;
  const mode = shape > 1 ? (shape - 1) * scale : 0;
  const stdDev = Math.sqrt(variance);
  
  // Tutorial steps
  const tutorialSteps = [
    {
      target: '.gamma-main-viz',
      title: 'Welcome to the Gamma Distribution',
      content: (
        <div className="space-y-2">
          <p>The Gamma distribution helps us model waiting times for multiple events.</p>
          <p className="text-xs">Think of it as: "How long until the 3rd customer arrives?" or "When will we see the 5th system failure?"</p>
        </div>
      ),
      position: 'left'
    },
    {
      target: '.stage-navigation',
      title: 'Progressive Learning Journey',
      content: 'Follow these stages to build your understanding step by step. We\'ll start simple and gradually add complexity.',
      position: 'top'
    },
    {
      target: '.parameter-controls',
      title: 'Interactive Parameters',
      content: 'Adjust the shape (k) and rate (λ) parameters to see how they affect the distribution. The visualization updates in real-time!',
      position: 'bottom'
    }
  ];
  
  // Stage-specific parameter constraints
  useEffect(() => {
    if (stage === 1) {
      setShape(1);
      setRate(1);
    } else if (stage === 2 && shape === 1) {
      setShape(2);
    }
  }, [stage, shape]);
  
  // Use safe MathJax processing with error handling
  useSafeMathJax(contentRef, [shape, rate, stage, showAdvanced]);
  
  // Building intuition visualization (Stage 2)
  useEffect(() => {
    if (!buildSvgRef.current || stage !== 2) return;
    
    const margin = { top: 40, right: 60, bottom: 60, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(buildSvgRef.current).selectAll("*").remove();
    
    const svg = d3.select(buildSvgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("fill", colors.text.primary)
      .style("font-size", "16px")
      .style("font-weight", "600")
      .text(`Visualizing ${Math.floor(shape)} Exponential Wait Times`);
    
    // Simulate and visualize individual exponentials
    const numExponentials = Math.floor(shape);
    const data = [];
    const xMax = mean + 3 * stdDev;
    
    // Generate individual exponential curves
    for (let i = 0; i < numExponentials; i++) {
      const expData = [];
      for (let x = 0; x <= xMax; x += xMax / 100) {
        expData.push({
          x: x,
          y: rate * Math.exp(-rate * x),
          index: i
        });
      }
      data.push(expData);
    }
    
    const x = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([0, rate * 1.2])
      .range([height, 0]);
    
    // Draw axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .style("font-size", "12px");
    
    g.append("g")
      .call(d3.axisLeft(y).tickSizeOuter(0))
      .style("font-size", "12px");
    
    // Draw individual exponential curves with warm gradient
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX);
    
    const colorScale = d3.scaleSequential()
      .domain([0, numExponentials - 1])
      .interpolator(d3.interpolateWarm);
    
    data.forEach((curveData, i) => {
      g.append("path")
        .datum(curveData)
        .attr("fill", "none")
        .attr("stroke", colorScale(i))
        .attr("stroke-width", 2.5)
        .attr("opacity", 0.8)
        .attr("d", line)
        .attr("stroke-dasharray", function() {
          return this.getTotalLength();
        })
        .attr("stroke-dashoffset", function() {
          return this.getTotalLength();
        })
        .transition()
        .duration(1000)
        .delay(i * 200)
        .attr("stroke-dashoffset", 0);
      
      // Add label
      g.append("text")
        .attr("x", width - 10)
        .attr("y", y(rate * Math.exp(-rate * xMax)) + i * 15)
        .attr("text-anchor", "end")
        .attr("fill", colorScale(i))
        .style("font-size", "12px")
        .style("font-weight", "500")
        .text(`Event ${i + 1}`)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(i * 200 + 800)
        .attr("opacity", 1);
    });
    
    // Add arrow and sum label
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("text-anchor", "middle")
      .attr("fill", colors.text.secondary)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Sum of these wait times → Gamma distribution")
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .delay(numExponentials * 200 + 1000)
      .attr("opacity", 1);
    
  }, [stage, shape, rate, mean, stdDev, colors]);
  
  // Main visualization effect with clean styling
  useEffect(() => {
    if (!mainSvgRef.current) return;
    
    const margin = { top: 40, right: 60, bottom: 70, left: 80 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(mainSvgRef.current).selectAll("*").remove();
    
    const svg = d3.select(mainSvgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // X scale - adjust based on distribution parameters
    const xMax = Math.min(20, mean + 3.5 * stdDev);
    const x = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, width]);
    
    // Generate data points
    const data = [];
    const step = xMax / 500;
    let yMax = 0;
    
    try {
      for (let i = 0; i <= xMax; i += step) {
        let yValue;
        if (showCDF) {
          yValue = jStat.gamma.cdf(i, shape, scale);
        } else {
          yValue = jStat.gamma.pdf(i, shape, scale);
        }
        if (!isNaN(yValue) && isFinite(yValue) && yValue >= 0) {
          data.push({ x: i, y: yValue });
          if (!showCDF) yMax = Math.max(yMax, yValue);
        }
      }
    } catch (error) {
      return;
    }
    
    // Y scale
    const y = d3.scaleLinear()
      .domain([0, showCDF ? 1.05 : yMax * 1.1])
      .range([height, 0]);
    
    // Grid lines - clean and subtle
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat("")
      )
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.2)
      .style("stroke", colors.grid);
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.2)
      .style("stroke", colors.grid);
    
    // Axes with modern styling
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSizeOuter(0)
        .ticks(8))
      .style("font-size", "13px")
      .style("color", colors.text.secondary);
    
    xAxis.append("text")
      .attr("x", width / 2)
      .attr("y", 50)
      .attr("fill", colors.text.primary)
      .style("text-anchor", "middle")
      .style("font-size", "15px")
      .style("font-weight", "500")
      .text(stage === 5 && showRealExample ? getXAxisLabel() : "Value (x)");
    
    const yAxis = g.append("g")
      .call(d3.axisLeft(y)
        .tickSizeOuter(0)
        .ticks(6))
      .style("font-size", "13px")
      .style("color", colors.text.secondary);
    
    yAxis.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -55)
      .attr("x", -height / 2)
      .attr("fill", colors.text.primary)
      .style("text-anchor", "middle")
      .style("font-size", "15px")
      .style("font-weight", "500")
      .text(showCDF ? "Cumulative Probability F(x)" : "Probability Density f(x)");
    
    // Area under curve with gradient (for PDF only)
    if (!showCDF && showPDF) {
      const gradientId = "gamma-gradient-warm";
      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colors.primary)
        .attr("stop-opacity", 0.4);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colors.secondary)
        .attr("stop-opacity", 0.1);
      
      const area = d3.area()
        .x(d => x(d.x))
        .y0(height)
        .y1(d => y(d.y))
        .curve(d3.curveMonotoneX);
      
      g.append("path")
        .datum(data)
        .attr("fill", `url(#${gradientId})`)
        .attr("d", area);
    }
    
    // Draw the main curve with warm colors
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX);
    
    const path = g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", showCDF ? colors.secondary : colors.primary)
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Smooth animation
    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);
    
    // Add mean line with label
    if (mean <= xMax && stage >= 2) {
      const meanGroup = g.append("g")
        .attr("opacity", 0);
      
      meanGroup.append("line")
        .attr("x1", x(mean))
        .attr("x2", x(mean))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", colors.accent)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "6,3");
      
      // Mean label with background
      const meanLabel = meanGroup.append("g");
      
      const meanText = meanLabel.append("text")
        .attr("x", x(mean))
        .attr("y", -8)
        .attr("text-anchor", "middle")
        .attr("fill", colors.accent)
        .style("font-size", "13px")
        .style("font-weight", "600")
        .text(`μ = ${mean.toFixed(1)}`);
      
      // Add background to text
      const bbox = meanText.node().getBBox();
      meanLabel.insert("rect", "text")
        .attr("x", bbox.x - 4)
        .attr("y", bbox.y - 2)
        .attr("width", bbox.width + 8)
        .attr("height", bbox.height + 4)
        .attr("fill", "white")
        .attr("rx", 3);
      
      meanGroup.transition()
        .delay(800)
        .duration(500)
        .attr("opacity", 1);
    }
    
    // Add mode line for shape > 1
    if (shape > 1 && mode <= xMax && stage >= 3) {
      const modeGroup = g.append("g")
        .attr("opacity", 0);
      
      modeGroup.append("line")
        .attr("x1", x(mode))
        .attr("x2", x(mode))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", colors.tertiary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3");
      
      // Mode label with background
      const modeLabel = modeGroup.append("g");
      
      const modeText = modeLabel.append("text")
        .attr("x", x(mode))
        .attr("y", -8)
        .attr("text-anchor", "middle")
        .attr("fill", colors.tertiary)
        .style("font-size", "13px")
        .style("font-weight", "600")
        .text(`mode = ${mode.toFixed(1)}`);
      
      const bbox = modeText.node().getBBox();
      modeLabel.insert("rect", "text")
        .attr("x", bbox.x - 4)
        .attr("y", bbox.y - 2)
        .attr("width", bbox.width + 8)
        .attr("height", bbox.height + 4)
        .attr("fill", "white")
        .attr("rx", 3);
      
      modeGroup.transition()
        .delay(1000)
        .duration(500)
        .attr("opacity", 1);
    }
    
  }, [shape, rate, scale, showCDF, showPDF, mean, mode, stdDev, colors, stage, showRealExample]);
  
  // Helper function for x-axis label
  const getXAxisLabel = () => {
    switch(exampleType) {
      case 'waiting': return 'Time (minutes)';
      case 'reliability': return 'Time to failure (hours)';
      case 'weather': return 'Rainfall amount (inches)';
      default: return 'Value (x)';
    }
  };
  
  // Real-world example visualization (Stage 5)
  useEffect(() => {
    if (!exampleSvgRef.current || !showRealExample || stage !== 5) return;
    
    const margin = { top: 40, right: 60, bottom: 60, left: 70 };
    const width = 700 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(exampleSvgRef.current).selectAll("*").remove();
    
    const svg = d3.select(exampleSvgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Title based on example type
    const getExampleTitle = () => {
      switch(exampleType) {
        case 'waiting': return 'Customer Service Wait Times';
        case 'reliability': return 'Component Reliability Testing';
        case 'weather': return 'Rainfall Amount Distribution';
        default: return 'Real-World Application';
      }
    };
    
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("fill", colors.text.primary)
      .style("font-size", "16px")
      .style("font-weight", "600")
      .text(getExampleTitle());
    
    // Simulate real-world data
    const simulateExample = () => {
      setIsAnimating(true);
      const data = [];
      
      // Generate appropriate data based on example type
      if (exampleType === 'waiting') {
        // Customer service wait times (sum of processing stages)
        for (let i = 0; i < 500; i++) {
          let totalWait = 0;
          for (let j = 0; j < 3; j++) { // 3 stages: queue, service, payment
            totalWait += -Math.log(1 - Math.random()) / 0.5; // Rate = 0.5 per minute
          }
          data.push({ value: totalWait, label: `${totalWait.toFixed(1)} min` });
        }
      } else if (exampleType === 'reliability') {
        // Component reliability (time to k-th failure)
        for (let i = 0; i < 500; i++) {
          let failureTime = 0;
          for (let j = 0; j < 5; j++) { // 5 components
            failureTime += -Math.log(1 - Math.random()) / 0.02; // Rate = 0.02 per hour
          }
          data.push({ value: failureTime, label: `${failureTime.toFixed(0)} hrs` });
        }
      } else if (exampleType === 'weather') {
        // Rainfall amounts
        for (let i = 0; i < 500; i++) {
          const amount = jStat.gamma.sample(2.5, 1.5); // Shape=2.5, Scale=1.5
          data.push({ value: amount, label: `${amount.toFixed(1)} in` });
        }
      }
      
      setSimulationData(data);
      
      // Visualize the data
      const xMax = d3.max(data, d => d.value) * 1.1;
      const xScale = d3.scaleLinear()
        .domain([0, xMax])
        .range([0, width]);
      
      // Create histogram
      const bins = d3.histogram()
        .domain([0, xMax])
        .thresholds(30)
        .value(d => d.value)(data);
      
      const yMax = d3.max(bins, d => d.length);
      const yScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([height, 0]);
      
      // Clear and draw
      g.selectAll("*").remove();
      
      // Draw histogram bars with warm colors
      g.selectAll(".bar")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0))
        .attr("y", height)
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("height", 0)
        .attr("fill", colors.primary)
        .attr("opacity", 0.6)
        .transition()
        .duration(800)
        .delay((d, i) => i * 20)
        .attr("y", d => yScale(d.length))
        .attr("height", d => height - yScale(d.length));
      
      // Overlay fitted Gamma curve
      setTimeout(() => {
        const gammaParams = getExampleParams();
        const gammaData = [];
        const step = xMax / 200;
        
        for (let x = 0; x <= xMax; x += step) {
          const binWidth = xMax / 30;
          const scaledPdf = jStat.gamma.pdf(x, gammaParams.shape, gammaParams.scale) * data.length * binWidth;
          gammaData.push({ x: x, y: scaledPdf });
        }
        
        const line = d3.line()
          .x(d => xScale(d.x))
          .y(d => yScale(d.y))
          .curve(d3.curveMonotoneX);
        
        g.append("path")
          .datum(gammaData)
          .attr("fill", "none")
          .attr("stroke", colors.accent)
          .attr("stroke-width", 3)
          .attr("d", line)
          .attr("opacity", 0)
          .transition()
          .duration(1000)
          .attr("opacity", 1);
        
        // Add axes
        g.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(xScale).tickSizeOuter(0))
          .style("font-size", "12px");
        
        g.append("g")
          .call(d3.axisLeft(yScale).tickSizeOuter(0))
          .style("font-size", "12px");
        
        // Add legend
        const legend = g.append("g")
          .attr("transform", `translate(${width - 180}, 20)`);
        
        legend.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", colors.primary)
          .attr("opacity", 0.6);
        
        legend.append("text")
          .attr("x", 20)
          .attr("y", 12)
          .attr("fill", colors.text.primary)
          .style("font-size", "12px")
          .text("Observed Data");
        
        legend.append("line")
          .attr("x1", 0)
          .attr("x2", 15)
          .attr("y1", 30)
          .attr("y2", 30)
          .attr("stroke", colors.accent)
          .attr("stroke-width", 3);
        
        legend.append("text")
          .attr("x", 20)
          .attr("y", 34)
          .attr("fill", colors.text.primary)
          .style("font-size", "12px")
          .text(`Gamma(${gammaParams.shape}, ${gammaParams.scale})`);
        
        setIsAnimating(false);
      }, bins.length * 20 + 1000);
    };
    
    // Get parameters for each example
    const getExampleParams = () => {
      switch(exampleType) {
        case 'waiting': return { shape: 3, scale: 2 };
        case 'reliability': return { shape: 5, scale: 50 };
        case 'weather': return { shape: 2.5, scale: 1.5 };
        default: return { shape: shape, scale: scale };
      }
    };
    
    simulateExample();
    
  }, [showRealExample, exampleType, stage, shape, scale, colors]);
  
  // Stage-specific content
  const getStageContent = () => {
    switch(stage) {
      case 1:
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-xl border border-orange-200 shadow-sm">
              <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                What is the Gamma Distribution?
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                Imagine you're waiting for something to happen multiple times - like waiting for your 3rd customer of the day, 
                or the 5th machine failure in a factory. The Gamma distribution tells us how long we'll likely wait.
              </p>
              <div className="bg-white/70 p-3 rounded-lg">
                <p className="text-sm text-gray-600 font-medium mb-2">Real-world examples:</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    Time until the 3rd customer arrives at a store
                  </li>
                  <li className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-orange-500" />
                    Time until 5 components fail in a system
                  </li>
                  <li className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-orange-500" />
                    Total rainfall from multiple storm systems
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-900 font-medium">Starting Simple</p>
                <p className="text-sm text-yellow-800 mt-1">
                  We'll begin with the exponential distribution (Gamma with k=1), which models the time between single events.
                </p>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-200 shadow-sm">
              <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Building Intuition: From One to Many
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                The key insight: When you sum up multiple exponential wait times, you get a Gamma distribution! 
                Watch how the shape changes as we wait for more events:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant={shape === 1 ? "primary" : "neutral"}
                  size="sm"
                  onClick={() => setShape(1)}
                  className="justify-start"
                >
                  <span className="font-mono mr-2">k=1</span>
                  <span className="text-xs">First event</span>
                </Button>
                <Button 
                  variant={shape === 2 ? "primary" : "neutral"}
                  size="sm"
                  onClick={() => setShape(2)}
                  className="justify-start"
                >
                  <span className="font-mono mr-2">k=2</span>
                  <span className="text-xs">Second event</span>
                </Button>
                <Button 
                  variant={shape === 3 ? "primary" : "neutral"}
                  size="sm"
                  onClick={() => setShape(3)}
                  className="justify-start"
                >
                  <span className="font-mono mr-2">k=3</span>
                  <span className="text-xs">Third event</span>
                </Button>
                <Button 
                  variant={shape === 5 ? "primary" : "neutral"}
                  size="sm"
                  onClick={() => setShape(5)}
                  className="justify-start"
                >
                  <span className="font-mono mr-2">k=5</span>
                  <span className="text-xs">Fifth event</span>
                </Button>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-900">
                <strong className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4" />
                  Key Pattern:
                </strong>
                As k increases, the distribution becomes more bell-shaped and shifts right. 
                This makes intuitive sense - waiting for more events takes longer!
              </p>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-5 rounded-xl border border-teal-200 shadow-sm parameter-controls">
              <h3 className="text-lg font-bold text-teal-900 mb-3 flex items-center gap-2">
                <ChartBar className="w-5 h-5" />
                Understanding the Parameters
              </h3>
              <div className="space-y-4">
                <div className="bg-white/70 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-teal-800">
                      Shape (k) = {shape.toFixed(1)}
                    </label>
                    <span className="text-xs text-gray-600">Number of events</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={shape}
                    onChange={(e) => setShape(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Higher k → More events to wait for → Bell-shaped curve
                  </p>
                </div>
                
                <div className="bg-white/70 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-teal-800">
                      Rate (λ) = {rate.toFixed(1)}
                    </label>
                    <span className="text-xs text-gray-600">Events per unit time</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Higher λ → Events happen faster → Distribution shifts left
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200 text-center">
                <p className="text-xs text-cyan-700 font-medium">Mean</p>
                <p className="text-lg font-mono text-cyan-900">{mean.toFixed(2)}</p>
              </div>
              <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200 text-center">
                <p className="text-xs text-cyan-700 font-medium">Variance</p>
                <p className="text-lg font-mono text-cyan-900">{variance.toFixed(2)}</p>
              </div>
              <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200 text-center">
                <p className="text-xs text-cyan-700 font-medium">Mode</p>
                <p className="text-lg font-mono text-cyan-900">
                  {shape > 1 ? mode.toFixed(2) : "0"}
                </p>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-200 shadow-sm">
              <h3 className="text-lg font-bold text-indigo-900 mb-3">
                Mathematical Deep Dive
              </h3>
              <div className="space-y-3 text-sm" ref={contentRef}>
                <div className="bg-white/70 p-3 rounded-lg">
                  <p className="font-semibold text-indigo-800 mb-2">Probability Density Function:</p>
                  <div className="text-center py-2">
                    <LatexFormula formula={`$$f(x; k, \\theta) = \\frac{1}{\\Gamma(k)\\theta^k} x^{k-1} e^{-x/\\theta}$$`} />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    where k = shape, θ = scale = 1/λ, and Γ(k) is the gamma function
                  </p>
                </div>
                
                <div className="bg-white/70 p-3 rounded-lg">
                  <p className="font-semibold text-indigo-800 mb-2">Key Properties:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <LatexFormula formula={`Mean: $\\mu = k\\theta = \\frac{k}{\\lambda}$`} />
                    </div>
                    <div>
                      <LatexFormula formula={`Variance: $\\sigma^2 = k\\theta^2 = \\frac{k}{\\lambda^2}$`} />
                    </div>
                    <div>
                      <LatexFormula formula={`Mode: $(k-1)\\theta$ if $k > 1$`} />
                    </div>
                    <div>
                      <LatexFormula formula={`Skewness: $\\frac{2}{\\sqrt{k}}$`} />
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="neutral"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full"
                >
                  {showAdvanced ? "Hide" : "Show"} Advanced Properties
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                </Button>
                
                {showAdvanced && (
                  <div className="bg-white/70 p-3 rounded-lg space-y-2 animate-fadeIn">
                    <p className="font-semibold text-indigo-800">Special Cases:</p>
                    <ul className="space-y-1 text-xs text-gray-700">
                      <li>• k = 1: Exponential distribution</li>
                      <li>• k = n/2, θ = 2: Chi-squared distribution with n degrees of freedom</li>
                      <li>• Integer k: Erlang distribution</li>
                    </ul>
                    <p className="font-semibold text-indigo-800 mt-3">Moment Generating Function:</p>
                    <div className="text-center">
                      <LatexFormula formula={`$$M(t) = (1 - \\theta t)^{-k}$$`} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200 shadow-sm">
              <h3 className="text-lg font-bold text-green-900 mb-3">
                Real-World Applications
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                See how the Gamma distribution models real phenomena. Choose an example to explore:
              </p>
              <div className="space-y-2">
                <Button
                  variant={exampleType === 'waiting' ? 'success' : 'neutral'}
                  size="sm"
                  onClick={() => {
                    setExampleType('waiting');
                    setShowRealExample(true);
                  }}
                  className="w-full justify-start"
                >
                  <Clock className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Customer Service Wait Times</p>
                    <p className="text-xs opacity-80">Queue + Service + Payment</p>
                  </div>
                </Button>
                <Button
                  variant={exampleType === 'reliability' ? 'success' : 'neutral'}
                  size="sm"
                  onClick={() => {
                    setExampleType('reliability');
                    setShowRealExample(true);
                  }}
                  className="w-full justify-start"
                >
                  <Package className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Component Reliability</p>
                    <p className="text-xs opacity-80">Time to 5th failure</p>
                  </div>
                </Button>
                <Button
                  variant={exampleType === 'weather' ? 'success' : 'neutral'}
                  size="sm"
                  onClick={() => {
                    setExampleType('weather');
                    setShowRealExample(true);
                  }}
                  className="w-full justify-start"
                >
                  <Cloud className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Rainfall Analysis</p>
                    <p className="text-xs opacity-80">Storm system accumulation</p>
                  </div>
                </Button>
              </div>
            </div>
            
            {showRealExample && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 animate-fadeIn">
                <p className="text-sm text-green-900">
                  <strong>Understanding the model:</strong>
                  {exampleType === 'waiting' && 
                    " Each stage (queue, service, payment) follows an exponential distribution. The total time is their sum - a Gamma distribution!"}
                  {exampleType === 'reliability' && 
                    " Each component has an exponential lifetime. The time until the 5th failure follows a Gamma distribution."}
                  {exampleType === 'weather' && 
                    " Multiple weather factors contribute to total rainfall, resulting in a Gamma-distributed accumulation."}
                </p>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const leftPanel = (
    <div className="space-y-5" ref={contentRef}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          The Gamma Distribution
        </h2>
        <p className="text-sm text-gray-600">
          From waiting times to real-world applications - a progressive learning journey
        </p>
      </div>
      
      {/* Tutorial Component */}
      <Tutorial
        steps={tutorialSteps}
        onComplete={() => console.log('Tutorial completed')}
        onSkip={() => console.log('Tutorial skipped')}
        showOnMount={stage === 1}
        persistKey="gamma-distribution"
        mode="tooltip"
      />
      
      {/* Progress Bar */}
      <div className="stage-navigation">
        <ProgressBar
          current={stage}
          total={totalStages}
          label="Learning Progress"
          variant="orange"
        />
      </div>
      
      {/* Stage Content */}
      {getStageContent()}
      
      {/* Stage 2: Building Intuition Visualization */}
      {stage === 2 && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
          <svg ref={buildSvgRef}></svg>
        </div>
      )}
      
      {/* View Options - Only show after Stage 1 */}
      {stage > 1 && (
        <div className="flex items-center gap-4 text-sm bg-gray-50 p-3 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPDF}
              onChange={(e) => setShowPDF(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-gray-700">Show PDF</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCDF}
              onChange={(e) => setShowCDF(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-gray-700">Show CDF</span>
          </label>
        </div>
      )}
      
      {/* Navigation */}
      <ProgressNavigation
        current={stage}
        total={totalStages}
        onPrevious={() => setStage(Math.max(1, stage - 1))}
        onNext={() => setStage(Math.min(totalStages, stage + 1))}
        variant="orange"
      />
      
      {/* Help Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Button
          variant="neutral"
          size="sm"
          onClick={() => {
            const tutorial = document.querySelector('.tutorial-component');
            if (tutorial) tutorial.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Show Tutorial Again
        </Button>
      </div>
      
      {/* Worked Example - Show on Stage 3+ */}
      {stage >= 3 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <GammaDistributionWorkedExample
            initialShape={shape}
            initialRate={rate}
          />
        </div>
      )}
    </div>
  );
  
  const rightPanel = (
    <div className="space-y-4">
      {/* Main Visualization - Clean white background */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 gamma-main-viz" style={{ minHeight: '600px' }}>
        <svg ref={mainSvgRef}></svg>
      </div>
      
      {/* Real-World Example Visualization */}
      {showRealExample && stage === 5 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Real Data vs. Gamma Model
            </h3>
            {isAnimating && (
              <span className="text-sm text-orange-600 animate-pulse flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"></div>
                Simulating data...
              </span>
            )}
          </div>
          <svg ref={exampleSvgRef}></svg>
        </div>
      )}
    </div>
  );
  
  return <VisualizationContainer leftPanel={leftPanel} rightPanel={rightPanel} />;
});

export { GammaDistribution };