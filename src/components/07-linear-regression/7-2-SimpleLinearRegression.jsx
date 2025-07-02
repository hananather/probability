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
import { Button } from '../ui/button';
import BackToHub from '../ui/BackToHub';
import { ChartLine, TrendingUp, Activity, Target } from 'lucide-react';

// Get Chapter 7 color scheme
const chapterColors = createColorScheme('regression');

// Fuel efficiency dataset from the task
const fuelData = [
  { x: 0.99, y: 90.01 }, { x: 0.995, y: 89.05 }, { x: 1.01, y: 91.43 }, { x: 1.01, y: 93.74 },
  { x: 1.02, y: 96.73 }, { x: 1.03, y: 94.45 }, { x: 1.035, y: 87.59 }, { x: 1.04, y: 91.77 },
  { x: 1.05, y: 99.42 }, { x: 1.05, y: 93.65 }, { x: 1.08, y: 93.54 }, { x: 1.09, y: 92.52 },
  { x: 1.10, y: 90.56 }, { x: 1.11, y: 89.54 }, { x: 1.12, y: 89.85 }, { x: 1.12, y: 90.39 },
  { x: 1.14, y: 93.25 }, { x: 1.14, y: 93.41 }, { x: 1.16, y: 94.98 }, { x: 1.20, y: 87.33 }
];

// Calculate regression statistics
const calculateRegression = (data) => {
  const n = data.length;
  const xMean = data.reduce((sum, d) => sum + d.x, 0) / n;
  const yMean = data.reduce((sum, d) => sum + d.y, 0) / n;
  
  const sxx = data.reduce((sum, d) => sum + Math.pow(d.x - xMean, 2), 0);
  const syy = data.reduce((sum, d) => sum + Math.pow(d.y - yMean, 2), 0);
  const sxy = data.reduce((sum, d) => sum + (d.x - xMean) * (d.y - yMean), 0);
  
  const b1 = sxy / sxx;
  const b0 = yMean - b1 * xMean;
  
  // Calculate SSE for the optimal line
  const sse = data.reduce((sum, d) => {
    const predicted = b0 + b1 * d.x;
    return sum + Math.pow(d.y - predicted, 2);
  }, 0);
  
  return { b0, b1, xMean, yMean, sxx, syy, sxy, sse, n };
};

// Calculate SSE for any line
const calculateSSE = (data, b0, b1) => {
  return data.reduce((sum, d) => {
    const predicted = b0 + b1 * d.x;
    return sum + Math.pow(d.y - predicted, 2);
  }, 0);
};

// Pre-calculated regression lines
const optimalRegression = calculateRegression(fuelData);
const regressionLines = {
  'too-flat': { 
    b0: 80, 
    b1: 10, 
    sse: calculateSSE(fuelData, 80, 10)
  },
  'optimal': { 
    b0: optimalRegression.b0, 
    b1: optimalRegression.b1, 
    sse: optimalRegression.sse
  },
  'too-steep': { 
    b0: 70, 
    b1: 20, 
    sse: calculateSSE(fuelData, 70, 20)
  }
};

// Introduction Section with LaTeX
const RegressionIntroduction = React.memo(function RegressionIntroduction() {
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
    <VisualizationSection className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg p-6 border border-blue-700/50">
      <div ref={contentRef}>
        <h2 className="text-2xl font-bold text-blue-400 mb-4">
          What makes one line through our data 'better' than another?
        </h2>
        <p className="text-gray-300 mb-4">
          In simple linear regression, we model the relationship between two variables using a straight line. 
          The regression model is:
        </p>
        <div className="text-center text-xl text-blue-300 my-4">
          <span dangerouslySetInnerHTML={{ __html: `\\[Y = \\beta_0 + \\beta_1 X + \\varepsilon\\]` }} />
        </div>
        <p className="text-gray-300">
          Where <span dangerouslySetInnerHTML={{ __html: `\\(\\beta_0\\)` }} /> is the intercept, 
          <span dangerouslySetInnerHTML={{ __html: `\\(\\beta_1\\)` }} /> is the slope, 
          and <span dangerouslySetInnerHTML={{ __html: `\\(\\varepsilon\\)` }} /> represents random error. 
          But how do we find the "best" values for these parameters? Enter the <strong>least squares criterion</strong>.
        </p>
      </div>
    </VisualizationSection>
  );
});

// Mathematical Framework Section
const MathematicalFramework = React.memo(function MathematicalFramework() {
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
    <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-teal-400 mb-6">Mathematical Framework</h3>
      
      <div ref={contentRef} className="grid md:grid-cols-2 gap-6">
        {/* Card 1: Least Squares Criterion */}
        <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-400" />
            Least Squares Criterion
          </h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">We minimize the sum of squared residuals:</p>
            <div className="text-center text-teal-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\text{SSE} = \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2\\]` }} />
            </div>
            <p>where <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{y}_i = b_0 + b_1 x_i\\)` }} /> is the predicted value.</p>
          </div>
        </div>
        
        {/* Card 2: Normal Equations */}
        <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <ChartLine className="w-5 h-5 text-teal-400" />
            Normal Equations
          </h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">The least squares estimates are:</p>
            <div className="text-center text-teal-400 my-3 space-y-2">
              <div dangerouslySetInnerHTML={{ __html: `\\[b_1 = \\frac{S_{xy}}{S_{xx}} = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sum(x_i - \\bar{x})^2}\\]` }} />
              <div dangerouslySetInnerHTML={{ __html: `\\[b_0 = \\bar{y} - b_1\\bar{x}\\]` }} />
            </div>
          </div>
        </div>
        
        {/* Card 3: Standard Errors */}
        <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            Standard Errors
          </h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">Measures of uncertainty:</p>
            <div className="text-center text-teal-400 my-3 space-y-2">
              <div dangerouslySetInnerHTML={{ __html: `\\[\\text{SE}(b_1) = \\frac{\\hat{\\sigma}}{\\sqrt{S_{xx}}}\\]` }} />
              <div dangerouslySetInnerHTML={{ __html: `\\[\\text{SE}(b_0) = \\hat{\\sigma}\\sqrt{\\frac{1}{n} + \\frac{\\bar{x}^2}{S_{xx}}}\\]` }} />
            </div>
          </div>
        </div>
        
        {/* Card 4: Model Assumptions */}
        <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            Model Assumptions
          </h4>
          <div className="text-sm text-neutral-300">
            <ul className="space-y-1">
              <li>• <strong>Linearity:</strong> True relationship is linear</li>
              <li>• <strong>Independence:</strong> Errors are independent</li>
              <li>• <strong>Constant variance:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(\\varepsilon_i) = \\sigma^2\\)` }} /></li>
              <li>• <strong>Normality:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(\\varepsilon_i \\sim N(0, \\sigma^2)\\)` }} /></li>
            </ul>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Main Line Comparison Visualization
const LineComparisonDemo = ({ lineType, showResiduals }) => {
  const vizRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  
  // Set up dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (vizRef.current) {
        const { width } = vizRef.current.getBoundingClientRect();
        setDimensions({ width, height: Math.min(400, width * 0.6) });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // D3 Visualization
  useEffect(() => {
    if (!vizRef.current || dimensions.width === 0) return;
    
    const margin = { top: 20, right: 80, bottom: 50, left: 60 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;
    
    // Clear previous
    d3.select(vizRef.current).selectAll("*").remove();
    
    const svg = d3.select(vizRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0.95, 1.25])
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain([85, 100])
      .range([height, 0]);
    
    // Gradients
    const defs = svg.append("defs");
    
    // Create gradient based on line type
    const gradient = defs.append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", width).attr("y2", 0);
    
    const colors = {
      'too-flat': ["#f97316", "#ea580c"],     // Orange gradient
      'optimal': ["#10b981", "#059669"],       // Emerald gradient
      'too-steep': ["#8b5cf6", "#7c3aed"]      // Purple gradient
    };
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colors[lineType][0]);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colors[lineType][1]);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "#fff")
      .style("text-anchor", "middle")
      .text("Specific Gravity (X)");
    
    g.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "#fff")
      .style("text-anchor", "middle")
      .text("Heating Value (Y)");
    
    // Get current line parameters
    const currentLine = regressionLines[lineType];
    
    // Draw regression line
    const lineData = [
      { x: 0.95, y: currentLine.b0 + currentLine.b1 * 0.95 },
      { x: 1.25, y: currentLine.b0 + currentLine.b1 * 1.25 }
    ];
    
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y));
    
    g.append("path")
      .datum(lineData)
      .attr("class", "regression-line")
      .attr("fill", "none")
      .attr("stroke", "url(#line-gradient)")
      .attr("stroke-width", 4)
      .attr("stroke-linecap", "round")
      .attr("d", line)
      .style("opacity", 0)
      .style("filter", "drop-shadow(0 0 4px rgba(0, 0, 0, 0.3))")
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .style("opacity", 1);
    
    // Draw residuals if enabled
    if (showResiduals) {
      const residuals = g.selectAll(".residual")
        .data(fuelData)
        .enter()
        .append("line")
        .attr("class", "residual")
        .attr("x1", d => xScale(d.x))
        .attr("y1", d => yScale(d.y))
        .attr("x2", d => xScale(d.x))
        .attr("y2", d => yScale(currentLine.b0 + currentLine.b1 * d.x))
        .attr("stroke", d => {
          const predicted = currentLine.b0 + currentLine.b1 * d.x;
          return d.y > predicted ? "#3b82f6" : "#ef4444";
        })
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3")
        .style("opacity", 0);
      
      residuals.transition()
        .duration(1000)
        .delay((d, i) => i * 50)
        .ease(d3.easeCubicOut)
        .style("opacity", 0.8);
    }
    
    // Draw data points
    const points = g.selectAll(".point")
      .data(fuelData)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 0)
      .attr("fill", d => {
        // Different colors for different line types
        if (lineType === 'too-flat') return "#f97316"; // Orange
        if (lineType === 'optimal') return "#10b981"; // Emerald
        if (lineType === 'too-steep') return "#8b5cf6"; // Purple
        return chapterColors.primary;
      })
      .attr("opacity", 0.9)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);
    
    points.transition()
      .duration(1200)
      .delay((d, i) => i * 40)
      .attr("r", 5)
      .attr("opacity", 1);
    
    // Highlight centroid
    const centroid = g.append("circle")
      .attr("cx", xScale(optimalRegression.xMean))
      .attr("cy", yScale(optimalRegression.yMean))
      .attr("r", 8)
      .attr("fill", "none")
      .attr("stroke", chapterColors.accent)
      .attr("stroke-width", 2)
      .style("opacity", 0);
    
    centroid.transition()
      .duration(1200)
      .delay(1200)
      .ease(d3.easeCubicOut)
      .style("opacity", 1);
    
    // Add centroid label
    g.append("text")
      .attr("x", xScale(optimalRegression.xMean) + 10)
      .attr("y", yScale(optimalRegression.yMean) - 10)
      .attr("fill", chapterColors.accent)
      .style("font-size", "12px")
      .text("(x̄, ȳ)")
      .style("opacity", 0)
      .transition()
      .duration(1200)
      .delay(1200)
      .ease(d3.easeCubicOut)
      .style("opacity", 1);
    
    // SSE display
    const sseText = g.append("text")
      .attr("x", width - 10)
      .attr("y", 20)
      .attr("text-anchor", "end")
      .attr("fill", "#fff")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`SSE = ${currentLine.sse.toFixed(2)}`)
      .style("opacity", 0);
    
    sseText.transition()
      .duration(1200)
      .delay(600)
      .ease(d3.easeCubicOut)
      .style("opacity", 1);
    
  }, [lineType, showResiduals, dimensions]);
  
  return (
    <div className="p-4 rounded-lg border border-neutral-700/30">
      <h3 className="text-lg font-bold text-teal-400 mb-4">Regression Line Comparison</h3>
      <svg ref={vizRef} className="w-full" />
    </div>
  );
};

// Why Squared Errors Visualization
const WhySquaredErrors = React.memo(function WhySquaredErrors() {
  const contentRef = useRef(null);
  const vizRef = useRef(null);
  
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
  
  // Sample data for demonstration
  const demoData = [
    { x: 1, y: 3, predicted: 2.5 },
    { x: 2, y: 4, predicted: 3.5 },
    { x: 3, y: 3.5, predicted: 4.5 },
    { x: 4, y: 5.5, predicted: 5.5 },
    { x: 5, y: 6, predicted: 6.5 }
  ];
  
  return (
    <div ref={contentRef} className="grid md:grid-cols-3 gap-4 mt-4">
      {/* Method 1: Sum of Errors */}
      <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
        <h4 className="font-bold text-white mb-3">Sum of Errors</h4>
        <div className="text-sm text-neutral-300">
          <div className="text-center text-red-400 my-3">
            <span dangerouslySetInnerHTML={{ __html: `\\[\\sum_{i=1}^{n} (y_i - \\hat{y}_i)\\]` }} />
          </div>
          <p className="text-red-300 mb-2">❌ Problem: Positive and negative errors cancel out!</p>
          <div className="bg-neutral-800/50 rounded p-2 text-xs">
            Example: +2 + (-2) = 0 (misleading!)
          </div>
        </div>
      </div>
      
      {/* Method 2: Sum of Absolute Errors */}
      <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
        <h4 className="font-bold text-white mb-3">Sum of Absolute Errors</h4>
        <div className="text-sm text-neutral-300">
          <div className="text-center text-yellow-400 my-3">
            <span dangerouslySetInnerHTML={{ __html: `\\[\\sum_{i=1}^{n} |y_i - \\hat{y}_i|\\]` }} />
          </div>
          <p className="text-yellow-300 mb-2">⚠️ Problem: Not differentiable at zero!</p>
          <div className="bg-neutral-800/50 rounded p-2 text-xs">
            Hard to optimize mathematically
          </div>
        </div>
      </div>
      
      {/* Method 3: Sum of Squared Errors */}
      <div className="bg-neutral-900/50 rounded-lg p-4 border border-green-700/50">
        <h4 className="font-bold text-white mb-3">Sum of Squared Errors</h4>
        <div className="text-sm text-neutral-300">
          <div className="text-center text-green-400 my-3">
            <span dangerouslySetInnerHTML={{ __html: `\\[\\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2\\]` }} />
          </div>
          <p className="text-green-300 mb-2">✓ Differentiable everywhere</p>
          <p className="text-green-300 mb-2">✓ Penalizes large errors more</p>
          <p className="text-green-300">✓ Unique optimal solution</p>
        </div>
      </div>
    </div>
  );
});

// Worked Example Component
const WorkedExample = React.memo(function WorkedExample() {
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
  
  const stats = optimalRegression;
  
  return (
    <div ref={contentRef} className="space-y-6 mt-4">
      {/* Given Information */}
      <div className="bg-neutral-900/50 rounded-lg p-4">
        <h4 className="font-bold text-white mb-3">Given Information</h4>
        <ul className="space-y-2 text-sm text-neutral-300">
          <li>• Sample size: <span dangerouslySetInnerHTML={{ __html: `\\(n = ${stats.n}\\)` }} /></li>
          <li>• Mean of X: <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x} = ${stats.xMean.toFixed(3)}\\)` }} /></li>
          <li>• Mean of Y: <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{y} = ${stats.yMean.toFixed(3)}\\)` }} /></li>
          <li>• <span dangerouslySetInnerHTML={{ __html: `\\(S_{xx} = ${stats.sxx.toFixed(3)}\\)` }} /></li>
          <li>• <span dangerouslySetInnerHTML={{ __html: `\\(S_{xy} = ${stats.sxy.toFixed(3)}\\)` }} /></li>
        </ul>
      </div>
      
      {/* Step 1: Calculate Slope */}
      <div className="bg-neutral-900/50 rounded-lg p-4">
        <h4 className="font-bold text-white mb-3">Step 1: Calculate Slope (b₁)</h4>
        <div className="text-sm text-neutral-300 space-y-2">
          <p>Using the formula:</p>
          <div className="text-center my-3">
            <span dangerouslySetInnerHTML={{ __html: `\\[b_1 = \\frac{S_{xy}}{S_{xx}} = \\frac{${stats.sxy.toFixed(3)}}{${stats.sxx.toFixed(3)}} = ${stats.b1.toFixed(3)}\\]` }} />
          </div>
          <p>This means: For each unit increase in specific gravity, heating value increases by {stats.b1.toFixed(2)} Btu.</p>
        </div>
      </div>
      
      {/* Step 2: Calculate Intercept */}
      <div className="bg-neutral-900/50 rounded-lg p-4">
        <h4 className="font-bold text-white mb-3">Step 2: Calculate Intercept (b₀)</h4>
        <div className="text-sm text-neutral-300 space-y-2">
          <p>Using the formula:</p>
          <div className="text-center my-3">
            <span dangerouslySetInnerHTML={{ __html: `\\[b_0 = \\bar{y} - b_1\\bar{x} = ${stats.yMean.toFixed(3)} - (${stats.b1.toFixed(3)})(${stats.xMean.toFixed(3)}) = ${stats.b0.toFixed(3)}\\]` }} />
          </div>
        </div>
      </div>
      
      {/* Final Equation */}
      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-lg p-4 border border-blue-700/50">
        <h4 className="font-bold text-white mb-3">Regression Equation</h4>
        <div className="text-center text-xl text-blue-300">
          <span dangerouslySetInnerHTML={{ __html: `\\[\\hat{y} = ${stats.b0.toFixed(2)} + ${stats.b1.toFixed(2)}x\\]` }} />
        </div>
        <p className="text-sm text-gray-300 mt-3 text-center">
          Heating Value = {stats.b0.toFixed(2)} + {stats.b1.toFixed(2)} × (Specific Gravity)
        </p>
      </div>
    </div>
  );
});

// Centroid Property Demo
const CentroidProperty = React.memo(function CentroidProperty() {
  const vizRef = useRef(null);
  const lineRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize the visualization once
  useEffect(() => {
    if (!vizRef.current || isInitialized) return;
    
    const width = 300;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select(vizRef.current)
      .attr("width", width)
      .attr("height", height);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0.95, 1.25])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([85, 100])
      .range([innerHeight, 0]);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .style("color", "#666");
    
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .style("color", "#666");
    
    // Centroid
    const cx = xScale(optimalRegression.xMean);
    const cy = yScale(optimalRegression.yMean);
    
    // Draw centroid
    g.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 6)
      .attr("fill", chapterColors.accent)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
    
    // Create rotating line
    const lineLength = 100;
    lineRef.current = g.append("line")
      .attr("class", "rotating-line")
      .attr("stroke", chapterColors.primary)
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .style("filter", "drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))");
    
    // Store centroid position for later use
    lineRef.current.cx = cx;
    lineRef.current.cy = cy;
    lineRef.current.lineLength = lineLength;
    
    // Label
    g.append("text")
      .attr("x", cx + 10)
      .attr("y", cy - 10)
      .attr("fill", chapterColors.accent)
      .style("font-size", "12px")
      .text("(x̄, ȳ)");
    
    // Add some sample points for context
    const samplePoints = fuelData.slice(0, 8);
    g.selectAll(".sample-point")
      .data(samplePoints)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 3)
      .attr("fill", chapterColors.primary)
      .attr("opacity", 0.3);
    
    setIsInitialized(true);
  }, [isInitialized]);
  
  // Update rotation
  useEffect(() => {
    if (!lineRef.current) return;
    
    const angle = (rotation * Math.PI) / 180;
    const { cx, cy, lineLength } = lineRef.current;
    
    lineRef.current
      .transition()
      .duration(800)
      .ease(d3.easeCubicInOut)
      .attr("x1", cx - lineLength * Math.cos(angle))
      .attr("y1", cy + lineLength * Math.sin(angle))
      .attr("x2", cx + lineLength * Math.cos(angle))
      .attr("y2", cy - lineLength * Math.sin(angle));
  }, [rotation]);
  
  return (
    <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
      <h3 className="text-lg font-bold text-teal-400 mb-4">Centroid Property</h3>
      <p className="text-sm text-gray-300 mb-4">
        The regression line always passes through the centroid (x̄, ȳ) of the data!
      </p>
      <svg ref={vizRef} className="w-full" />
      <div className="mt-4 flex items-center gap-4">
        <Button
          onClick={() => setRotation((r) => (r + 30) % 360)}
          variant="secondary"
          size="sm"
          className="transition-all duration-200 hover:scale-105 hover:brightness-110"
        >
          Rotate Line
        </Button>
        <span className="text-sm text-gray-400">Angle: {rotation}°</span>
      </div>
    </VisualizationSection>
  );
});

// Residual Analysis
const ResidualAnalysis = React.memo(function ResidualAnalysis({ data, regression }) {
  const vizRef = useRef(null);
  
  useEffect(() => {
    if (!vizRef.current) return;
    
    const width = 300;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Clear previous
    d3.select(vizRef.current).selectAll("*").remove();
    
    const svg = d3.select(vizRef.current)
      .attr("width", width)
      .attr("height", height);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Calculate residuals
    const residuals = data.map(d => ({
      x: d.x,
      residual: d.y - (regression.b0 + regression.b1 * d.x)
    }));
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x))
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([innerHeight, 0]);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .style("color", "#666");
    
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .style("color", "#666");
    
    // Zero line
    g.append("line")
      .attr("x1", 0)
      .attr("y1", yScale(0))
      .attr("x2", innerWidth)
      .attr("y2", yScale(0))
      .attr("stroke", "#666")
      .attr("stroke-dasharray", "3,3");
    
    // Plot residuals
    g.selectAll(".residual-point")
      .data(residuals)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.residual))
      .attr("r", 3)
      .attr("fill", d => d.residual > 0 ? "#3b82f6" : "#ef4444")
      .style("opacity", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 30)
      .style("opacity", 0.8);
    
  }, [data, regression]);
  
  return (
    <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
      <h3 className="text-lg font-bold text-teal-400 mb-4">Residual Plot</h3>
      <p className="text-sm text-gray-300 mb-4">
        Good fit: residuals randomly scattered around zero with no pattern.
      </p>
      <svg ref={vizRef} className="w-full" />
      <div className="mt-2 text-xs text-gray-400">
        Sum of residuals = 0 (always true for least squares)
      </div>
    </VisualizationSection>
  );
});

// Main Component
export default function SimpleLinearRegression() {
  const [lineType, setLineType] = useState('optimal');
  const [showResiduals, setShowResiduals] = useState(true);
  const [showWorkedExample, setShowWorkedExample] = useState(false);
  const [showWhySquared, setShowWhySquared] = useState(false);
  
  return (
    <VisualizationContainer
      title="7.2 Simple Linear Regression"
      description="Learn how to find the line that best fits your data using the least squares method"
    >
      <div className="space-y-8">
        <BackToHub chapter={7} />
        
        {/* Introduction */}
        <RegressionIntroduction />
        
        {/* Mathematical Framework */}
        <MathematicalFramework />
        
        {/* Main Visualization */}
        <VisualizationSection>
          <LineComparisonDemo lineType={lineType} showResiduals={showResiduals} />
          
          {/* Controls */}
          <div className="mt-6 space-y-4">
            <ControlGroup label="Choose a regression line">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setLineType('too-flat')}
                  variant={lineType === 'too-flat' ? 'default' : 'secondary'}
                  className={`min-w-[120px] transition-all duration-200 ${
                    lineType === 'too-flat' 
                      ? 'bg-orange-600 hover:bg-orange-500 border-2 border-orange-400 shadow-lg scale-105' 
                      : 'hover:scale-105 hover:brightness-110'
                  }`}
                >
                  Too Flat
                </Button>
                <Button
                  onClick={() => setLineType('optimal')}
                  variant={lineType === 'optimal' ? 'default' : 'secondary'}
                  className={`min-w-[120px] transition-all duration-200 ${
                    lineType === 'optimal' 
                      ? 'bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-400 shadow-lg scale-105' 
                      : 'hover:scale-105 hover:brightness-110'
                  }`}
                >
                  Optimal (Least Squares)
                </Button>
                <Button
                  onClick={() => setLineType('too-steep')}
                  variant={lineType === 'too-steep' ? 'default' : 'secondary'}
                  className={`min-w-[120px] transition-all duration-200 ${
                    lineType === 'too-steep' 
                      ? 'bg-purple-600 hover:bg-purple-500 border-2 border-purple-400 shadow-lg scale-105' 
                      : 'hover:scale-105 hover:brightness-110'
                  }`}
                >
                  Too Steep
                </Button>
              </div>
            </ControlGroup>
            
            <ControlGroup label="Display options">
              <Button
                onClick={() => setShowResiduals(!showResiduals)}
                variant={showResiduals ? 'default' : 'secondary'}
                className={`transition-all duration-200 ${
                  showResiduals 
                    ? 'border-2 border-blue-400 shadow-md' 
                    : 'hover:scale-105 hover:brightness-110'
                }`}
              >
                {showResiduals ? 'Hide' : 'Show'} Residuals
              </Button>
            </ControlGroup>
          </div>
          
          {/* Line comparison info */}
          <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg">
            <p className="text-sm text-gray-300">
              {lineType === 'too-flat' && "This line is too flat - it misses the trend in the data. Notice the large SSE value."}
              {lineType === 'optimal' && "This is the least squares line - it minimizes the sum of squared errors (SSE). All residuals sum to zero!"}
              {lineType === 'too-steep' && "This line is too steep - it overestimates the relationship. The SSE is larger than optimal."}
            </p>
          </div>
        </VisualizationSection>
        
        {/* Why Squared Errors Section */}
        <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-4">
            Why Use Squared Errors?
          </h3>
          <Button
            onClick={() => setShowWhySquared(!showWhySquared)}
            variant="secondary"
            className="mb-4"
          >
            {showWhySquared ? 'Hide' : 'Show'} Comparison
          </Button>
          
          <AnimatePresence>
            {showWhySquared && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <WhySquaredErrors />
              </motion.div>
            )}
          </AnimatePresence>
        </VisualizationSection>
        
        {/* Worked Example Section */}
        <VisualizationSection className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-6 border border-neutral-700/50">
          <h3 className="text-xl font-bold text-purple-400 mb-4">
            Worked Example: Fuel Efficiency Data
          </h3>
          <Button
            onClick={() => setShowWorkedExample(!showWorkedExample)}
            variant="secondary"
            className="mb-4"
          >
            {showWorkedExample ? 'Hide' : 'Show'} Calculations
          </Button>
          
          <AnimatePresence>
            {showWorkedExample && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <WorkedExample />
              </motion.div>
            )}
          </AnimatePresence>
        </VisualizationSection>
        
        {/* Key Insights Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <CentroidProperty />
          <ResidualAnalysis data={fuelData} regression={optimalRegression} />
        </div>
      </div>
    </VisualizationContainer>
  );
}