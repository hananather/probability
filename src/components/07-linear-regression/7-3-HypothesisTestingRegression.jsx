"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { motion, AnimatePresence } from "framer-motion";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, createColorScheme } from '../../lib/design-system';
import BackToHub from '../ui/BackToHub';
import { Target, Calculator, ChartLine, TrendingUp, Database, BarChart3, Eye, EyeOff, TestTube } from 'lucide-react';

// Get vibrant Chapter 7 color scheme - use probability for regression topics
const chapterColors = createColorScheme('probability');

// Hypothesis Display Component
const HypothesisDisplay = React.memo(function HypothesisDisplay() {
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
        <p>
          <strong className="text-white"><span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(\\beta_1 = 0\\)` }} /> (no linear relationship)
        </p>
        <p>
          <strong className="text-white"><span dangerouslySetInnerHTML={{ __html: `\\(H_1\\)` }} />:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(\\beta_1 \\neq 0\\)` }} /> (significant linear relationship)
        </p>
        <p>
          <strong className="text-white">Question:</strong> Is the relationship real or just random noise?
        </p>
      </div>
    </div>
  );
});

// Mathematical Framework Component
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
      
      <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Test Statistic</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">Testing if slope is significantly different from zero:</p>
            <div className="text-center text-teal-400 my-4 overflow-x-auto">
              <span dangerouslySetInnerHTML={{ __html: `\\[t = \\frac{b_1}{SE(b_1)} \\sim t_{n-2}\\]` }} />
            </div>
            <p className="mt-2">where <span dangerouslySetInnerHTML={{ __html: `\\(b_1\\)` }} /> is the sample slope</p>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Standard Error</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">Standard error of the slope:</p>
            <div className="text-center text-blue-400 my-4 overflow-x-auto">
              <span dangerouslySetInnerHTML={{ __html: `\\[SE(b_1) = \\frac{s}{\\sqrt{S_{xx}}}\\]` }} />
            </div>
            <p className="mt-2">where <span dangerouslySetInnerHTML={{ __html: `\\(s\\)` }} /> is residual standard error</p>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Degrees of Freedom</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">Lost 2 parameters (slope and intercept):</p>
            <div className="text-center text-amber-400 my-4 overflow-x-auto">
              <span dangerouslySetInnerHTML={{ __html: `\\[df = n - 2\\]` }} />
            </div>
            <p className="mt-2">Critical value: <span dangerouslySetInnerHTML={{ __html: `\\(t_{\\alpha/2, n-2}\\)` }} /></p>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Decision Rule</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">Reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> if:</p>
            <div className="text-center text-red-400 my-4 overflow-x-auto">
              <span dangerouslySetInnerHTML={{ __html: `\\[|t| > t_{\\alpha/2, n-2}\\]` }} />
            </div>
            <p className="mt-2">Or if p-value &lt; <span dangerouslySetInnerHTML={{ __html: `\\(\\alpha\\)` }} /></p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Worked Example Component
const WorkedExample = React.memo(function WorkedExample({ data, regressionResults }) {
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
  }, [regressionResults]); // Only re-process when results change, not data
  
  if (!regressionResults) return null;
  
  const { b0, b1, se_b1, s, sxx, n, r2 } = regressionResults;
  const t = b1 / se_b1;
  const df = n - 2;
  const criticalValue = jStat.studentt.inv(0.975, df); // Two-tailed at α = 0.05
  const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-6 border border-neutral-700/50">
      <h3 className="text-xl font-bold text-purple-400 mb-6">
        Step-by-Step Hypothesis Test Computation
      </h3>
      
      <div ref={contentRef} className="space-y-6">
        {/* Given Information */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Given Information</h4>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li>• Sample size: <span dangerouslySetInnerHTML={{ __html: `\\(n = ${n}\\)` }} /></li>
            <li>• Regression equation: <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{y} = ${b0.toFixed(3)} + ${b1.toFixed(3)}x\\)` }} /></li>
            <li>• Residual standard error: <span dangerouslySetInnerHTML={{ __html: `\\(s = ${s.toFixed(3)}\\)` }} /></li>
            <li>• Sum of squares: <span dangerouslySetInnerHTML={{ __html: `\\(S_{xx} = ${sxx.toFixed(3)}\\)` }} /></li>
            <li>• Significance level: <span dangerouslySetInnerHTML={{ __html: `\\(\\alpha = 0.05\\)` }} /></li>
          </ul>
        </div>

        {/* Step 1: Calculate Standard Error */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 1: Calculate Standard Error of Slope</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>The standard error of the slope coefficient is:</p>
            <div className="text-center my-4 overflow-x-auto">
              <span dangerouslySetInnerHTML={{ __html: `\\[SE(b_1) = \\frac{s}{\\sqrt{S_{xx}}} = \\frac{${s.toFixed(3)}}{\\sqrt{${sxx.toFixed(3)}}} = ${se_b1.toFixed(4)}\\]` }} />
            </div>
          </div>
        </div>

        {/* Step 2: Calculate t-statistic */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 2: Calculate t-statistic</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>Test statistic under <span dangerouslySetInnerHTML={{ __html: `\\(H_0: \\beta_1 = 0\\)` }} />:</p>
            <div className="text-center my-4 overflow-x-auto">
              <span dangerouslySetInnerHTML={{ __html: `\\[t = \\frac{b_1 - 0}{SE(b_1)} = \\frac{${b1.toFixed(3)}}{${se_b1.toFixed(4)}} = ${t.toFixed(3)}\\]` }} />
            </div>
            <p>Degrees of freedom: <span dangerouslySetInnerHTML={{ __html: `\\(df = n - 2 = ${n} - 2 = ${df}\\)` }} /></p>
          </div>
        </div>

        {/* Step 3: Find critical value */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 3: Find Critical Value</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>For two-tailed test at <span dangerouslySetInnerHTML={{ __html: `\\(\\alpha = 0.05\\)` }} />:</p>
            <div className="text-center my-4 overflow-x-auto">
              <span dangerouslySetInnerHTML={{ __html: `\\[t_{\\alpha/2, n-2} = t_{0.025, ${df}} = \\pm ${criticalValue.toFixed(3)}\\]` }} />
            </div>
            <p>p-value = <span dangerouslySetInnerHTML={{ __html: `\\(${pValue.toFixed(4)}\\)` }} /></p>
          </div>
        </div>

        {/* Step 4: Make decision */}
        <div className={`rounded-lg p-4 ${Math.abs(t) > criticalValue ? 'bg-red-900/30 border border-red-700/50' : 'bg-green-900/30 border border-green-700/50'}`}>
          <h4 className="font-bold text-white mb-3">Step 4: Make Decision</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>Since <span dangerouslySetInnerHTML={{ __html: `\\(|t| = ${Math.abs(t).toFixed(3)}\\)` }} /> 
               {Math.abs(t) > criticalValue ? ' > ' : ' < '} 
               <span dangerouslySetInnerHTML={{ __html: `\\(${criticalValue.toFixed(3)}\\)` }} />:</p>
            <p className="font-bold text-white">
              {Math.abs(t) > criticalValue ? 
                'Reject H₀: There is significant evidence of a linear relationship.' : 
                'Fail to reject H₀: Insufficient evidence of a linear relationship.'}
            </p>
            <p>The slope is {Math.abs(t) > criticalValue ? '' : 'not '}statistically significant at α = 0.05.</p>
          </div>
        </div>

        {/* Confidence Interval */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">95% Confidence Interval for Slope</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>The confidence interval is:</p>
            <div className="text-center my-4 overflow-x-auto">
              <span dangerouslySetInnerHTML={{ __html: `\\[b_1 \\pm t_{\\alpha/2, n-2} \\times SE(b_1)\\]` }} />
            </div>
            <div className="text-center my-4 overflow-x-auto">
              <span dangerouslySetInnerHTML={{ __html: `\\[${b1.toFixed(3)} \\pm ${criticalValue.toFixed(3)} \\times ${se_b1.toFixed(4)}\\]` }} />
            </div>
            <div className="text-center my-4 overflow-x-auto">
              <span dangerouslySetInnerHTML={{ __html: `\\[CI: (${(b1 - criticalValue * se_b1).toFixed(3)}, ${(b1 + criticalValue * se_b1).toFixed(3)})\\]` }} />
            </div>
            <p className="mt-2">
              {(b1 - criticalValue * se_b1) * (b1 + criticalValue * se_b1) > 0 ? 
                'The interval does not contain 0, confirming significance.' : 
                'The interval contains 0, indicating no significant relationship.'}
            </p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Test Statistic Visualization Component
const TestStatisticVisualization = ({ tValue, df, alpha = 0.05 }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current || !tValue || !df) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create x scale
    const xMin = -4;
    const xMax = 4;
    const x = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([0, 0.4])
      .range([height, 0]);
    
    // Generate t-distribution data
    const tData = [];
    for (let i = xMin; i <= xMax; i += 0.01) {
      tData.push({
        x: i,
        y: jStat.studentt.pdf(i, df)
      });
    }
    
    // Create area generator
    const area = d3.area()
      .x(d => x(d.x))
      .y0(height)
      .y1(d => y(d.y))
      .curve(d3.curveBasis);
    
    // Draw main distribution
    g.append("path")
      .datum(tData)
      .attr("fill", chapterColors.chart.primary)
      .attr("fill-opacity", 0.3)
      .attr("stroke", chapterColors.chart.primary)
      .attr("stroke-width", 2)
      .attr("d", area);
    
    // Critical values
    const criticalValue = jStat.studentt.inv(1 - alpha/2, df);
    
    // Shade rejection regions
    const leftRejection = tData.filter(d => d.x <= -criticalValue);
    const rightRejection = tData.filter(d => d.x >= criticalValue);
    
    // Left rejection region
    g.append("path")
      .datum(leftRejection)
      .attr("fill", "#ef4444")
      .attr("fill-opacity", 0.5)
      .attr("d", area);
    
    // Right rejection region
    g.append("path")
      .datum(rightRejection)
      .attr("fill", "#ef4444")
      .attr("fill-opacity", 0.5)
      .attr("d", area);
    
    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(8))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .text("t-value");
    
    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("x", -height / 2)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .text("Density");
    
    // Add critical value lines
    [-criticalValue, criticalValue].forEach((cv, i) => {
      g.append("line")
        .attr("x1", x(cv))
        .attr("x2", x(cv))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
      
      g.append("text")
        .attr("x", x(cv))
        .attr("y", -5)
        .attr("fill", "#ef4444")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text(cv.toFixed(2));
    });
    
    // Add observed t-value
    g.append("line")
      .attr("x1", x(tValue))
      .attr("x2", x(tValue))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 3);
    
    g.append("circle")
      .attr("cx", x(tValue))
      .attr("cy", height)
      .attr("r", 5)
      .attr("fill", "#f59e0b");
    
    g.append("text")
      .attr("x", x(tValue))
      .attr("y", height + 20)
      .attr("fill", "#f59e0b")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text(`t = ${tValue.toFixed(3)}`);
    
    // Add title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text(`t-Distribution (df = ${df})`);
    
  }, [tValue, df, alpha]);
  
  return <svg ref={svgRef}></svg>;
};

// Main Regression Test Visualization
const RegressionTestVisualization = ({ onDataChange, onResultsChange }) => {
  const [data, setData] = useState([]);
  const [regressionResults, setRegressionResults] = useState(null);
  const [showNullDistribution, setShowNullDistribution] = useState(false);
  const [showTestStatistic, setShowTestStatistic] = useState(false);
  const [showPValue, setShowPValue] = useState(false);
  const [animationStep, setAnimationStep] = useState('initial');
  const [testType, setTestType] = useState('two-tailed');
  const [alpha, setAlpha] = useState(0.05);
  
  const scatterRef = useRef(null);
  
  // Generate initial data with relationship
  useEffect(() => {
    generateData(true);
  }, []);
  
  const generateData = (withRelationship) => {
    const n = 30;
    const newData = [];
    
    for (let i = 0; i < n; i++) {
      const x = Math.random() * 10 + 5; // X between 5 and 15
      const trueY = 20 + 2 * x; // True relationship: y = 20 + 2x
      const noise = jStat.normal.sample(0, 5); // Random error
      const y = withRelationship ? trueY + noise : 20 + Math.random() * 20 + noise;
      
      newData.push({ x, y });
    }
    
    setData(newData);
    calculateRegression(newData);
    setAnimationStep('dataGenerated');
    
    // Pass data up to parent
    if (onDataChange) {
      onDataChange(newData);
    }
  };
  
  const calculateRegression = (data) => {
    if (data.length < 2) return;
    
    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.x, 0);
    const sumY = data.reduce((sum, d) => sum + d.y, 0);
    const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
    const sumX2 = data.reduce((sum, d) => sum + d.x * d.x, 0);
    const sumY2 = data.reduce((sum, d) => sum + d.y * d.y, 0);
    
    const meanX = sumX / n;
    const meanY = sumY / n;
    
    const sxx = sumX2 - (sumX * sumX) / n;
    const syy = sumY2 - (sumY * sumY) / n;
    const sxy = sumXY - (sumX * sumY) / n;
    
    const b1 = sxy / sxx;
    const b0 = meanY - b1 * meanX;
    
    // Calculate residual sum of squares
    const sse = data.reduce((sum, d) => {
      const predicted = b0 + b1 * d.x;
      return sum + Math.pow(d.y - predicted, 2);
    }, 0);
    
    const s = Math.sqrt(sse / (n - 2)); // Residual standard error
    const se_b1 = s / Math.sqrt(sxx); // Standard error of slope
    
    // Calculate R-squared
    const ssr = data.reduce((sum, d) => {
      const predicted = b0 + b1 * d.x;
      return sum + Math.pow(predicted - meanY, 2);
    }, 0);
    const sst = syy;
    const r2 = ssr / sst;
    
    const results = {
      b0,
      b1,
      se_b1,
      s,
      sxx,
      syy,
      sxy,
      n,
      r2,
      meanX,
      meanY
    };
    
    setRegressionResults(results);
    
    // Pass results up to parent
    if (onResultsChange) {
      onResultsChange(results);
    }
  };
  
  // Draw scatter plot with regression line
  useEffect(() => {
    if (!scatterRef.current || !data.length || !regressionResults) return;
    
    const svg = d3.select(scatterRef.current);
    svg.selectAll("*").remove();
    
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xExtent = d3.extent(data, d => d.x);
    const yExtent = d3.extent(data, d => d.y);
    
    const x = d3.scaleLinear()
      .domain([xExtent[0] - 1, xExtent[1] + 1])
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([yExtent[0] - 5, yExtent[1] + 5])
      .range([height, 0]);
    
    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .text("X");
    
    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("x", -height / 2)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .text("Y");
    
    // Add scatter points
    g.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 0)
      .attr("fill", chapterColors.chart.primary)
      .attr("fill-opacity", 0.6)
      .transition()
      .duration(500)
      .delay((d, i) => i * 20)
      .attr("r", 5);
    
    // Add regression line
    if (showTestStatistic) {
      const { b0, b1 } = regressionResults;
      const lineData = [
        { x: xExtent[0] - 1, y: b0 + b1 * (xExtent[0] - 1) },
        { x: xExtent[1] + 1, y: b0 + b1 * (xExtent[1] + 1) }
      ];
      
      const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y));
      
      g.append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", chapterColors.chart.secondary)
        .attr("stroke-width", 3)
        .attr("opacity", 0)
        .attr("d", line)
        .transition()
        .duration(1000)
        .attr("opacity", 1);
      
      // Add equation
      g.append("text")
        .attr("x", width - 10)
        .attr("y", 20)
        .attr("text-anchor", "end")
        .attr("fill", chapterColors.chart.secondary)
        .attr("font-size", "14px")
        .attr("opacity", 0)
        .text(`ŷ = ${b0.toFixed(2)} + ${b1.toFixed(2)}x`)
        .transition()
        .duration(1000)
        .attr("opacity", 1);
    }
    
  }, [data, regressionResults, showTestStatistic]);
  
  return (
    <div className="space-y-6">
      {/* Controls */}
      <ControlGroup>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => generateData(true)}
            className="px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 bg-blue-600 text-white shadow-md ring-2 ring-blue-500/50 hover:bg-blue-700"
          >
            <Database className="w-4 h-4" />
            Generate Data (With Relationship)
          </button>
          <button
            onClick={() => generateData(false)}
            className="px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white"
          >
            <BarChart3 className="w-4 h-4" />
            Generate Data (No Relationship)
          </button>
          <button
            onClick={() => setShowTestStatistic(!showTestStatistic)}
            className={`px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
              showTestStatistic
                ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-500/50'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
            }`}
          >
            {showTestStatistic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showTestStatistic ? 'Hide' : 'Show'} Regression Line
          </button>
        </div>
      </ControlGroup>
      
      {/* Visualizations */}
      <div className="space-y-6">
        {/* Scatter Plot */}
        <GraphContainer title="Data and Regression Line">
          <div className="flex justify-center">
            <svg ref={scatterRef}></svg>
          </div>
        </GraphContainer>
        
        {/* T-Distribution */}
        {regressionResults && (
          <GraphContainer title="Hypothesis Test">
            <div className="flex justify-center">
              <TestStatisticVisualization 
                tValue={regressionResults.b1 / regressionResults.se_b1}
                df={regressionResults.n - 2}
                alpha={alpha}
              />
            </div>
            <div className="mt-4 text-sm text-neutral-300 text-center">
              <p>t-statistic: {(regressionResults.b1 / regressionResults.se_b1).toFixed(3)}</p>
              <p>p-value: {(2 * (1 - jStat.studentt.cdf(Math.abs(regressionResults.b1 / regressionResults.se_b1), regressionResults.n - 2))).toFixed(4)}</p>
            </div>
          </GraphContainer>
        )}
      </div>
      
      {/* Statistics Display */}
      {regressionResults && (
        <div className="bg-neutral-800 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Regression Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-neutral-400">Slope (b₁)</p>
              <p className="font-mono text-teal-400">{regressionResults.b1.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-neutral-400">SE(b₁)</p>
              <p className="font-mono text-amber-400">{regressionResults.se_b1.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-neutral-400">R²</p>
              <p className="font-mono text-blue-400">{regressionResults.r2.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-neutral-400">Sample Size</p>
              <p className="font-mono text-purple-400">{regressionResults.n}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Key Insights Section
const KeyInsights = React.memo(function KeyInsights() {
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
    <VisualizationSection className="bg-gradient-to-br from-neutral-800/30 to-neutral-900/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-purple-400 mb-6">Key Insights</h3>
      
      <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="bg-neutral-900/50 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-teal-400" />
            <h4 className="font-bold text-white">Connection to Correlation</h4>
          </div>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">The t-test for slope is equivalent to testing correlation:</p>
            <div className="text-center text-teal-400 my-4 overflow-x-auto">
              <span dangerouslySetInnerHTML={{ __html: `\\[t_{slope} = t_{correlation}\\]` }} />
            </div>
            <p>Both test if there's a linear relationship.</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-neutral-900/50 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-white">Why df = n - 2?</h4>
          </div>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">We lose 2 degrees of freedom:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>One for estimating the intercept <span dangerouslySetInnerHTML={{ __html: `\\(b_0\\)` }} /></li>
              <li>One for estimating the slope <span dangerouslySetInnerHTML={{ __html: `\\(b_1\\)` }} /></li>
            </ul>
            <p className="mt-2">This affects our t-distribution shape.</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-neutral-900/50 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <ChartLine className="w-5 h-5 text-blue-400" />
            <h4 className="font-bold text-white">F-test Equivalence</h4>
          </div>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">For simple linear regression:</p>
            <div className="text-center text-blue-400 my-4 overflow-x-auto">
              <span dangerouslySetInnerHTML={{ __html: `\\[F = t^2\\]` }} />
            </div>
            <p>The F-test for overall model significance equals the squared t-test for slope.</p>
          </div>
        </motion.div>
      </div>
    </VisualizationSection>
  );
});

// Main Component
export default function HypothesisTestingRegression() {
  const [showWorkedExample, setShowWorkedExample] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [currentResults, setCurrentResults] = useState(null);
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <BackToHub chapter={7} />
      
      <VisualizationContainer 
        title="Hypothesis Testing for Linear Regression"
        subtitle="Test whether the relationship between variables is statistically significant"
      >
        {/* Hypothesis Display */}
        <VisualizationSection>
          <HypothesisDisplay />
        </VisualizationSection>
        
        {/* Mathematical Framework */}
        <MathematicalFramework />
        
        {/* Main Visualization */}
        <VisualizationSection>
          <h3 className="text-xl font-bold text-teal-400 mb-6">Interactive Hypothesis Test</h3>
          <RegressionTestVisualization 
            onDataChange={setCurrentData}
            onResultsChange={setCurrentResults}
          />
        </VisualizationSection>
        
        {/* Worked Example Toggle */}
        <VisualizationSection>
          <button
            onClick={() => setShowWorkedExample(!showWorkedExample)}
            className={`w-full px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
              showWorkedExample
                ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-500/50'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
            }`}
          >
            {showWorkedExample ? <EyeOff className="w-4 h-4" /> : <TestTube className="w-4 h-4" />}
            {showWorkedExample ? 'Hide' : 'Show'} Worked Example
          </button>
        </VisualizationSection>
        
        {/* Worked Example */}
        <AnimatePresence>
          {showWorkedExample && currentResults && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <WorkedExample data={currentData} regressionResults={currentResults} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Key Insights */}
        <KeyInsights />
      </VisualizationContainer>
    </div>
  );
}