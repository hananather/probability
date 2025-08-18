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
import { GitBranch, BarChart3, Calculator, Target, Activity, Eye, EyeOff, Layers, TrendingUp, AlertTriangle } from 'lucide-react';

// Get vibrant Chapter 7 color scheme
const chapterColors = createColorScheme('regression');

// ANOVA color scheme - using more vibrant colors
const anovaColors = {
  total: '#9ca3af',      // Lighter gray for total
  regression: '#60a5fa', // Vibrant blue for explained
  error: '#f87171',      // Softer red for unexplained
  fStat: '#fbbf24'       // Bright yellow/orange for F-statistic
};

// Introduction Component
const ANOVAIntroduction = React.memo(function ANOVAIntroduction() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-700/50">
      <h3 className="text-2xl font-bold text-white mb-4">Where Does the Variation Come From?</h3>
      
      <div ref={contentRef} className="space-y-4 text-gray-300">
        <p>
          Analysis of Variance (ANOVA) answers a fundamental question: How much of the variation in our 
          outcome variable can be explained by our regression model?
        </p>
        
        <div className="bg-gray-800/50 rounded-lg p-4 my-4">
          <p className="text-center text-lg text-blue-400 font-mono">
            <span dangerouslySetInnerHTML={{ __html: `\\[\\text{Total Variation} = \\text{Explained by Model} + \\text{Unexplained (Error)}\\]` }} />
          </p>
          <p className="text-center text-xl text-white mt-2 font-bold">
            <span dangerouslySetInnerHTML={{ __html: `\\[SST = SSR + SSE\\]` }} />
          </p>
        </div>
        
        <p>
          This decomposition allows us to measure how well our model fits the data and test 
          whether the relationship is statistically significant.
        </p>
      </div>
    </VisualizationSection>
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
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <VisualizationSection className="bg-gray-800/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-purple-400 mb-6">Key Concepts</h3>
      
      <div ref={contentRef} className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            SST - Total Sum of Squares
          </h4>
          <div className="text-sm text-gray-300">
            <p className="mb-2">Total variation in Y around its mean:</p>
            <div className="text-center text-gray-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[SST = \\sum_{i=1}^{n}(y_i - \\bar{y})^2\\]` }} />
            </div>
            <p className="text-xs">Measures total spread of data</p>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            SSR - Regression Sum of Squares
          </h4>
          <div className="text-sm text-gray-300">
            <p className="mb-2">Variation explained by the model:</p>
            <div className="text-center text-blue-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[SSR = \\sum_{i=1}^{n}(\\hat{y}_i - \\bar{y})^2\\]` }} />
            </div>
            <p className="text-xs">How well regression line explains Y</p>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            SSE - Error Sum of Squares
          </h4>
          <div className="text-sm text-gray-300">
            <p className="mb-2">Unexplained variation (residuals):</p>
            <div className="text-center text-red-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[SSE = \\sum_{i=1}^{n}(y_i - \\hat{y}_i)^2\\]` }} />
            </div>
            <p className="text-xs">Prediction errors</p>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            F-test
          </h4>
          <div className="text-sm text-gray-300">
            <p className="mb-2">Tests overall model significance:</p>
            <div className="text-center text-orange-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[F = \\frac{MSR}{MSE} = \\frac{SSR/1}{SSE/(n-2)}\\]` }} />
            </div>
            <p className="text-xs">Large F → significant relationship</p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Variance Decomposition Visualization
const VarianceDecomposition = React.memo(({ data, regression }) => {
  const svgRef = useRef(null);
  const elementsRef = useRef({});
  const isInitialized = useRef(false);
  const [showDecomposition, setShowDecomposition] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState({
    total: false,
    regression: false,
    error: false
  });
  
  // Initialize SVG structure once
  useEffect(() => {
    if (!data || !regression || !svgRef.current || isInitialized.current) return;
    
    const svg = d3.select(svgRef.current);
    
    const width = 700;
    const height = 400;
    const margin = { top: 20, right: 120, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.attr("width", width).attr("height", height);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Store references
    elementsRef.current.g = g;
    elementsRef.current.width = innerWidth;
    elementsRef.current.height = innerHeight;
    
    // Calculate statistics
    const yMean = d3.mean(data, d => d.y);
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x))
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([
        d3.min(data, d => Math.min(d.y, d.yHat)) - 10,
        d3.max(data, d => Math.max(d.y, d.yHat)) + 10
      ])
      .range([innerHeight, 0]);
    
    elementsRef.current.xScale = xScale;
    elementsRef.current.yScale = yScale;
    elementsRef.current.yMean = yMean;
    
    // Add axes with proper styling
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));
    
    // Style x-axis
    xAxis.selectAll("text")
      .attr("fill", "#e5e7eb")  // Light gray for tick labels
      .style("font-size", "12px");
    xAxis.selectAll("line")
      .attr("stroke", "#6b7280");  // Gray for tick marks
    xAxis.select(".domain")
      .attr("stroke", "#6b7280");  // Gray for axis line
    
    xAxis.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "#e5e7eb")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Engine Size (L)");
    
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale));
    
    // Style y-axis
    yAxis.selectAll("text")
      .attr("fill", "#e5e7eb")  // Light gray for tick labels
      .style("font-size", "12px");
    yAxis.selectAll("line")
      .attr("stroke", "#6b7280");  // Gray for tick marks
    yAxis.select(".domain")
      .attr("stroke", "#6b7280");  // Gray for axis line
    
    yAxis.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#e5e7eb")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Fuel Economy (mpg)");
    
    // Add mean line
    elementsRef.current.meanLine = g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", yScale(yMean))
      .attr("y2", yScale(yMean))
      .attr("stroke", anovaColors.total)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .style("opacity", 0.8);
    
    // Add regression line
    const xMin = d3.min(data, d => d.x);
    const xMax = d3.max(data, d => d.x);
    const yMin = regression.intercept + regression.slope * xMin;
    const yMax = regression.intercept + regression.slope * xMax;
    
    elementsRef.current.regressionLine = g.append("line")
      .attr("x1", xScale(xMin))
      .attr("y1", yScale(yMin))
      .attr("x2", xScale(xMax))
      .attr("y2", yScale(yMax))
      .attr("stroke", anovaColors.regression)
      .attr("stroke-width", 3);
    
    // Create groups for decomposition lines
    elementsRef.current.decompositionGroup = g.append("g")
      .attr("class", "decomposition-lines");
    
    // Add data points
    elementsRef.current.dotsGroup = g.append("g")
      .attr("class", "dots-group");
    
    elementsRef.current.dotsGroup.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 5)
      .attr("fill", "white")
      .attr("stroke", anovaColors.regression)
      .attr("stroke-width", 2);
    
    // Add legend group
    elementsRef.current.legendGroup = g.append("g")
      .attr("transform", `translate(${innerWidth + 20}, 20)`);
    
    isInitialized.current = true;
  }, [data, regression]);
  
  // Update decomposition lines
  useEffect(() => {
    if (!isInitialized.current || !elementsRef.current.decompositionGroup) return;
    
    const { g, xScale, yScale, yMean, decompositionGroup } = elementsRef.current;
    
    // Clear existing decomposition lines
    decompositionGroup.selectAll("*").remove();
    
    if (showDecomposition && data) {
      data.forEach((d, i) => {
        // Total deviation (y - yMean)
        if (selectedComponents.total) {
          decompositionGroup.append("line")
            .attr("x1", xScale(d.x))
            .attr("y1", yScale(d.y))
            .attr("x2", xScale(d.x))
            .attr("y2", yScale(yMean))
            .attr("stroke", anovaColors.total)
            .attr("stroke-width", 2)
            .style("opacity", 0)
            .transition()
            .delay(i * 50)
            .duration(500)
            .style("opacity", 0.6);
        }
        
        // Regression deviation (yHat - yMean)
        if (selectedComponents.regression) {
          decompositionGroup.append("line")
            .attr("x1", xScale(d.x) + 2)
            .attr("y1", yScale(d.yHat))
            .attr("x2", xScale(d.x) + 2)
            .attr("y2", yScale(yMean))
            .attr("stroke", anovaColors.regression)
            .attr("stroke-width", 2)
            .style("opacity", 0)
            .transition()
            .delay(i * 50 + 200)
            .duration(500)
            .style("opacity", 0.8);
        }
        
        // Error deviation (y - yHat)
        if (selectedComponents.error) {
          decompositionGroup.append("line")
            .attr("x1", xScale(d.x) - 2)
            .attr("y1", yScale(d.y))
            .attr("x2", xScale(d.x) - 2)
            .attr("y2", yScale(d.yHat))
            .attr("stroke", anovaColors.error)
            .attr("stroke-width", 2)
            .style("opacity", 0)
            .transition()
            .delay(i * 50 + 400)
            .duration(500)
            .style("opacity", 0.8);
        }
      });
    }
  }, [showDecomposition, selectedComponents, data]);
  
  // Update legend
  useEffect(() => {
    if (!isInitialized.current || !elementsRef.current.legendGroup) return;
    
    const { legendGroup } = elementsRef.current;
    
    // Clear existing legend
    legendGroup.selectAll("*").remove();
    
    const legendItems = [
      { label: "Data Points", color: "white" },
      { label: "Mean", color: anovaColors.total },
      { label: "Regression", color: anovaColors.regression },
    ];
    
    if (showDecomposition) {
      if (selectedComponents.total) {
        legendItems.push({ label: "Total (SST)", color: anovaColors.total });
      }
      if (selectedComponents.regression) {
        legendItems.push({ label: "Explained (SSR)", color: anovaColors.regression });
      }
      if (selectedComponents.error) {
        legendItems.push({ label: "Error (SSE)", color: anovaColors.error });
      }
    }
    
    legendItems.forEach((item, i) => {
      const legendRow = legendGroup.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      if (item.label === "Data Points") {
        legendRow.append("circle")
          .attr("r", 4)
          .attr("fill", item.color)
          .attr("stroke", anovaColors.regression)
          .attr("stroke-width", 2);
      } else {
        legendRow.append("rect")
          .attr("width", 15)
          .attr("height", 3)
          .attr("y", -1.5)
          .attr("fill", item.color);
      }
      
      legendRow.append("text")
        .attr("x", 20)
        .attr("y", 0)
        .attr("dy", "0.32em")
        .attr("fill", "#e5e7eb")  // Light gray for better visibility
        .style("font-size", "12px")
        .text(item.label);
    });
  }, [showDecomposition, selectedComponents]);
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => setShowDecomposition(!showDecomposition)}
          className={`px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
            showDecomposition
              ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-500/50'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
          }`}
        >
          {showDecomposition ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showDecomposition ? "Hide" : "Show"} Decomposition
        </button>
        
        {showDecomposition && (
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedComponents(prev => ({ ...prev, total: !prev.total }))}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                selectedComponents.total
                  ? 'bg-gray-500 text-white shadow-md ring-2 ring-gray-500/50'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              Total (SST)
            </button>
            <button
              onClick={() => setSelectedComponents(prev => ({ ...prev, regression: !prev.regression }))}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                selectedComponents.regression
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-500/50'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Regression (SSR)
            </button>
            <button
              onClick={() => setSelectedComponents(prev => ({ ...prev, error: !prev.error }))}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                selectedComponents.error
                  ? 'bg-red-600 text-white shadow-md ring-2 ring-red-500/50'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Error (SSE)
            </button>
          </div>
        )}
      </div>
      
      <svg ref={svgRef}></svg>
    </div>
  );
});

// ANOVA Table Component
const ANOVATable = React.memo(({ sst, ssr, sse, n }) => {
  const df_regression = 1;
  const df_error = n - 2;
  const df_total = n - 1;
  
  const msr = ssr / df_regression;
  const mse = sse / df_error;
  const f = msr / mse;
  const pValue = 1 - jStat.centralF.cdf(f, df_regression, df_error);
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-2 px-3 text-gray-400">Source</th>
            <th className="text-right py-2 px-3 text-gray-400">SS</th>
            <th className="text-right py-2 px-3 text-gray-400">df</th>
            <th className="text-right py-2 px-3 text-gray-400">MS</th>
            <th className="text-right py-2 px-3 text-gray-400">F</th>
            <th className="text-right py-2 px-3 text-gray-400">p-value</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer">
            <td className="py-2 px-3 text-white font-medium">Regression</td>
            <td className="text-right py-2 px-3 font-mono" style={{ color: anovaColors.regression }}>{ssr.toFixed(2)}</td>
            <td className="text-right py-2 px-3 text-gray-300 font-mono">{df_regression}</td>
            <td className="text-right py-2 px-3 text-gray-300 font-mono">{msr.toFixed(2)}</td>
            <td className="text-right py-2 px-3 font-mono font-bold" style={{ color: anovaColors.fStat }}>{f.toFixed(2)}</td>
            <td className="text-right py-2 px-3 text-green-400 font-mono">{pValue < 0.0001 ? "< 0.0001" : pValue.toFixed(4)}</td>
          </tr>
          <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer">
            <td className="py-2 px-3 text-white font-medium">Error</td>
            <td className="text-right py-2 px-3 font-mono" style={{ color: anovaColors.error }}>{sse.toFixed(2)}</td>
            <td className="text-right py-2 px-3 text-gray-300 font-mono">{df_error}</td>
            <td className="text-right py-2 px-3 text-gray-300 font-mono">{mse.toFixed(2)}</td>
            <td className="text-right py-2 px-3 text-gray-500">—</td>
            <td className="text-right py-2 px-3 text-gray-500">—</td>
          </tr>
          <tr className="hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer">
            <td className="py-2 px-3 text-white font-medium">Total</td>
            <td className="text-right py-2 px-3 text-gray-400 font-mono">{sst.toFixed(2)}</td>
            <td className="text-right py-2 px-3 text-gray-300 font-mono">{df_total}</td>
            <td className="text-right py-2 px-3 text-gray-500">—</td>
            <td className="text-right py-2 px-3 text-gray-500">—</td>
            <td className="text-right py-2 px-3 text-gray-500">—</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

// Variation Bars Component
const VariationBars = React.memo(({ sst, ssr, sse }) => {
  const ssrPercent = (ssr / sst * 100).toFixed(1);
  const ssePercent = (sse / sst * 100).toFixed(1);
  
  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-400">Total Variation (SST)</span>
          <span className="text-sm font-mono text-white">{sst.toFixed(2)}</span>
        </div>
        <div className="w-full h-8 bg-gray-700 rounded overflow-hidden">
          <div className="h-full w-full bg-gray-500"></div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-400">Decomposition</span>
          <span className="text-sm font-mono text-white">100%</span>
        </div>
        <div className="w-full h-8 bg-gray-700 rounded overflow-hidden flex">
          <motion.div 
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${ssrPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <motion.div 
            className="h-full bg-red-500"
            initial={{ width: 0 }}
            animate={{ width: `${ssePercent}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-blue-400">Explained: {ssrPercent}%</span>
          <span className="text-red-400">Unexplained: {ssePercent}%</span>
        </div>
      </div>
    </div>
  );
});

// Worked Example Component
const WorkedExample = React.memo(function WorkedExample({ data, regression }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  if (!data || !regression) return null;
  
  // Calculate all statistics
  const n = data.length;
  const yMean = d3.mean(data, d => d.y);
  const sst = d3.sum(data, d => Math.pow(d.y - yMean, 2));
  const ssr = d3.sum(data, d => Math.pow(d.yHat - yMean, 2));
  const sse = d3.sum(data, d => Math.pow(d.y - d.yHat, 2));
  
  const df_regression = 1;
  const df_error = n - 2;
  const msr = ssr / df_regression;
  const mse = sse / df_error;
  const f = msr / mse;
  const tStat = Math.sqrt(f); // For simple regression, F = t²
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 border border-gray-700/50">
      <h3 className="text-xl font-bold text-purple-400 mb-6">
        Worked Example: Fuel Economy Dataset
      </h3>
      
      <div ref={contentRef} className="space-y-6">
        {/* Given Information */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Dataset Summary</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Sample size: <span className="font-mono text-white">n = {n}</span></li>
            <li>• Mean fuel economy: <span className="font-mono text-white">{yMean.toFixed(2)} mpg</span></li>
            <li>• Regression equation: <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{y} = ${regression.intercept.toFixed(2)} ${regression.slope > 0 ? '+' : ''} ${regression.slope.toFixed(2)}x\\)` }} /></li>
          </ul>
        </div>

        {/* Step 1: Calculate Sums of Squares */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 1: Calculate Sums of Squares</h4>
          <div className="text-sm text-gray-300 space-y-3">
            <div>
              <p className="mb-1">Total Sum of Squares:</p>
              <div className="text-center">
                <span dangerouslySetInnerHTML={{ __html: `\\[SST = \\sum(y_i - \\bar{y})^2 = ${sst.toFixed(2)}\\]` }} />
              </div>
            </div>
            <div>
              <p className="mb-1">Regression Sum of Squares:</p>
              <div className="text-center">
                <span dangerouslySetInnerHTML={{ __html: `\\[SSR = \\sum(\\hat{y}_i - \\bar{y})^2 = ${ssr.toFixed(2)}\\]` }} />
              </div>
            </div>
            <div>
              <p className="mb-1">Error Sum of Squares:</p>
              <div className="text-center">
                <span dangerouslySetInnerHTML={{ __html: `\\[SSE = \\sum(y_i - \\hat{y}_i)^2 = ${sse.toFixed(2)}\\]` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: ANOVA Table */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 2: ANOVA Table</h4>
          <ANOVATable sst={sst} ssr={ssr} sse={sse} n={n} />
        </div>

        {/* Step 3: Interpretation */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 3: Interpretation</h4>
          <div className="text-sm text-gray-300 space-y-2">
            <p>• F-statistic: <span className="font-mono text-orange-400 font-bold">F = {f.toFixed(2)}</span></p>
            <p>• This equals <span dangerouslySetInnerHTML={{ __html: `\\(t^2 = (${tStat.toFixed(2)})^2\\)` }} /> from our t-test</p>
            <p>• With p-value {"< 0.0001"}, we reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /></p>
            <p className="text-green-400 font-semibold mt-3">
              Conclusion: There is a statistically significant linear relationship between engine size and fuel economy.
            </p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// F-test Connection Component
const FTestConnection = React.memo(function FTestConnection({ f, t }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <div ref={contentRef} className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg p-6 border border-orange-700/50">
      <h4 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5" />
        Connection: F-test and t-test
      </h4>
      
      <div className="space-y-4 text-sm text-gray-300">
        <p>
          For simple linear regression with one predictor, the F-test and t-test for the slope are equivalent:
        </p>
        
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <p className="text-lg text-orange-400 font-mono mb-2">
            <span dangerouslySetInnerHTML={{ __html: `\\[F = t^2\\]` }} />
          </p>
          <p className="text-white">
            <span dangerouslySetInnerHTML={{ __html: `\\[${f.toFixed(2)} = (${t.toFixed(2)})^2\\]` }} />
          </p>
        </div>
        
        <p>
          Both tests answer the same question: Is there a significant linear relationship?
          The F-test becomes more useful when we have multiple predictors.
        </p>
      </div>
    </div>
  );
});

// Main Component
export default function AnalysisOfVariance() {
  const [animationStep, setAnimationStep] = useState('initial');
  const [showCalculations, setShowCalculations] = useState(false);
  const [highlightedSS, setHighlightedSS] = useState(null);
  
  // Generate sample data (fuel economy dataset)
  const generateData = () => {
    const n = 20;
    const data = [];
    
    for (let i = 0; i < n; i++) {
      const x = 1.5 + Math.random() * 3.5; // Engine size between 1.5 and 5.0 L
      const noise = (Math.random() - 0.5) * 8;
      const y = 35 - 4 * x + noise; // Negative relationship with noise
      data.push({ x, y });
    }
    
    return data;
  };
  
  const [data] = useState(generateData);
  
  // Calculate regression
  const calculateRegression = (data) => {
    const n = data.length;
    const sumX = d3.sum(data, d => d.x);
    const sumY = d3.sum(data, d => d.y);
    const sumXY = d3.sum(data, d => d.x * d.y);
    const sumX2 = d3.sum(data, d => d.x * d.x);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Add predicted values to data
    data.forEach(d => {
      d.yHat = intercept + slope * d.x;
    });
    
    return { slope, intercept };
  };
  
  const regression = calculateRegression(data);
  
  // Calculate statistics for display
  const yMean = d3.mean(data, d => d.y);
  const sst = d3.sum(data, d => Math.pow(d.y - yMean, 2));
  const ssr = d3.sum(data, d => Math.pow(d.yHat - yMean, 2));
  const sse = d3.sum(data, d => Math.pow(d.y - d.yHat, 2));
  const r2 = ssr / sst;
  
  const df_regression = 1;
  const df_error = data.length - 2;
  const msr = ssr / df_regression;
  const mse = sse / df_error;
  const f = msr / mse;
  const t = Math.sqrt(f);
  
  return (
    <div className="min-h-screen bg-gray-950">
      <BackToHub chapter={7} />
      
      <VisualizationContainer
        title="7.5 Analysis of Variance (ANOVA)"
        subtitle="Decomposing variation in regression"
      >
        {/* Introduction */}
        <ANOVAIntroduction />
        
        {/* Mathematical Framework */}
        <MathematicalFramework />
        
        {/* Main Visualization */}
        <VisualizationSection className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Variance Decomposition Visualization</h3>
          <div className="w-full flex justify-center">
            <VarianceDecomposition 
              data={data} 
              regression={regression}
            />
          </div>
        </VisualizationSection>
        
        {/* ANOVA Table */}
        <VisualizationSection className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">ANOVA Table</h3>
          <div className="bg-gray-800 rounded-lg p-6">
            <ANOVATable sst={sst} ssr={ssr} sse={sse} n={data.length} />
            
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">R-squared</h4>
                <p className="text-2xl font-mono" style={{ color: anovaColors.regression }}>{(r2 * 100).toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">of variation explained</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Standard Error</h4>
                <p className="text-2xl font-mono text-purple-400">{Math.sqrt(mse).toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">typical prediction error</p>
              </div>
            </div>
          </div>
        </VisualizationSection>
        
        {/* Variation Bars */}
        <VisualizationSection className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Visual Representation of Variance</h3>
          <VariationBars sst={sst} ssr={ssr} sse={sse} />
        </VisualizationSection>
        
        {/* Worked Example */}
        <WorkedExample data={data} regression={regression} />
        
        {/* Key Insights */}
        <VisualizationSection>
          <h3 className="text-xl font-bold text-white mb-6">Key Insights</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Variance Proof */}
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-700/50">
              <h4 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Why SST = SSR + SSE?
              </h4>
              <div className="space-y-4 text-sm text-gray-300">
                <p>
                  This fundamental equation reveals the elegant decomposition of variation in our data:
                </p>
                
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-white">The Mathematical Magic:</p>
                  <p>For each data point, we have three key deviations:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li><span className="text-gray-400">(y - ȳ)</span> = Total deviation from mean</li>
                    <li><span className="text-blue-400">(ŷ - ȳ)</span> = Explained by regression</li>
                    <li><span className="text-red-400">(y - ŷ)</span> = Unexplained error</li>
                  </ul>
                </div>
                
                <p>
                  <strong>The Key Insight:</strong> These deviations form a right triangle! 
                  The regression line is chosen specifically to minimize SSE, which makes 
                  the explained and unexplained components perpendicular.
                </p>
                
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-center font-mono text-sm">
                    (y - ȳ) = (y - ŷ) + (ŷ - ȳ)
                  </p>
                  <p className="text-center text-xs text-gray-400 mt-1">
                    Square both sides and sum over all points...
                  </p>
                  <p className="text-center font-mono text-sm mt-2 text-yellow-400">
                    SST = SSE + SSR
                  </p>
                </div>
                
                <p className="text-xs italic">
                  This orthogonality is why least squares regression is so powerful - it naturally 
                  partitions variation into independent components!
                </p>
              </div>
            </div>
            
            {/* F-test Connection */}
            <FTestConnection f={f} t={t} />
          </div>
          
          <div className="mt-6 bg-gray-800/50 rounded-lg p-6">
            <h4 className="text-lg font-bold text-green-400 mb-3">Next Steps</h4>
            <p className="text-gray-300">
              Now that we've decomposed the variation, we can use the ratio SSR/SST to measure 
              how well our model fits. This leads us to the coefficient of determination (R²) 
              in the next section!
            </p>
          </div>
        </VisualizationSection>
      </VisualizationContainer>
    </div>
  );
}