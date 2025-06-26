"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '@/components/ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { Button } from '@/components/ui/button';
import { Card } from '../ui/card';

// Use sampling color scheme
const colorScheme = createColorScheme('sampling');

// Binning algorithms with their mathematical foundations
const binningMethods = {
  sturges: {
    name: "Sturges' Rule",
    formula: "k = ⌈log₂(n) + 1⌉",
    description: "Assumes normal distribution. Simple but often inadequate for large datasets.",
    calculate: (data) => Math.ceil(Math.log2(data.length) + 1),
    pros: ["Simple to compute", "Works well for small datasets", "Good for normal distributions"],
    cons: ["Tends to oversmooth", "Poor for skewed distributions", "Inadequate for n > 200"]
  },
  scott: {
    name: "Scott's Rule",
    formula: "h = 3.5σ/n^(1/3), k = ⌈(max-min)/h⌉",
    description: "Minimizes integrated mean squared error. Assumes normal distribution.",
    calculate: (data) => {
      const std = jStat.stdev(data, true);
      const h = 3.5 * std / Math.pow(data.length, 1/3);
      const range = Math.max(...data) - Math.min(...data);
      return Math.max(1, Math.ceil(range / h));
    },
    pros: ["Theoretically optimal for normal data", "Accounts for data spread", "Good for smooth densities"],
    cons: ["Assumes normality", "Can oversmooth multimodal data", "Sensitive to outliers"]
  },
  freedmanDiaconis: {
    name: "Freedman-Diaconis Rule",
    formula: "h = 2×IQR/n^(1/3), k = ⌈(max-min)/h⌉",
    description: "Robust to outliers. Uses interquartile range instead of standard deviation.",
    calculate: (data) => {
      const sorted = [...data].sort((a, b) => a - b);
      const q1 = jStat.percentile(sorted, 0.25);
      const q3 = jStat.percentile(sorted, 0.75);
      const iqr = q3 - q1;
      const h = 2 * iqr / Math.pow(data.length, 1/3);
      const range = Math.max(...data) - Math.min(...data);
      return Math.max(1, Math.ceil(range / h));
    },
    pros: ["Robust to outliers", "Works well for skewed data", "Less sensitive to tail behavior"],
    cons: ["Can create too many bins for heavy-tailed distributions", "May oversmooth for small samples"]
  },
  squareRoot: {
    name: "Square-root Rule",
    formula: "k = ⌈√n⌉",
    description: "Simple heuristic. Often used as a quick approximation.",
    calculate: (data) => Math.ceil(Math.sqrt(data.length)),
    pros: ["Very simple", "Computationally efficient", "Reasonable for many cases"],
    cons: ["No theoretical justification", "Ignores data distribution", "Can be very wrong"]
  },
  rice: {
    name: "Rice's Rule",
    formula: "k = ⌈2n^(1/3)⌉",
    description: "Alternative to Sturges' rule for larger datasets.",
    calculate: (data) => Math.ceil(2 * Math.pow(data.length, 1/3)),
    pros: ["Better than Sturges for large n", "Simple calculation", "Often reasonable"],
    cons: ["Still ignores data distribution", "Can overbin for small datasets", "No adaptation to data spread"]
  }
};

// Helper function to validate and clean data
const cleanData = (data) => {
  return data
    .filter(x => !isNaN(x) && isFinite(x))
    .map(x => Math.max(-10, Math.min(10, x)));
};

function HistogramShapeExplorer() {
  const [distributionType, setDistributionType] = useState('normal');
  const [sampleSize, setSampleSize] = useState(100);
  const [selectedMethod, setSelectedMethod] = useState('sturges');
  const [manualBins, setManualBins] = useState(20);
  const [showManual, setShowManual] = useState(false);
  const [data, setData] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  
  // Distribution parameters
  const [normalParams, setNormalParams] = useState({ mean: 0, std: 1 });
  const [uniformParams, setUniformParams] = useState({ min: -3, max: 3 });
  const [exponentialParams, setExponentialParams] = useState({ rate: 1 });
  const [bimodalParams, setBimodalParams] = useState({ mean1: -2, mean2: 2, std: 0.7, mix: 0.5 });
  
  const svgRef = useRef(null);
  const comparisonRef = useRef(null);

  // Calculate optimal bins for all methods
  const calculateAllBins = useCallback(() => {
    if (data.length === 0) return {};
    
    const results = {};
    Object.entries(binningMethods).forEach(([key, method]) => {
      try {
        results[key] = method.calculate(data);
      } catch (e) {
        results[key] = 20; // fallback
      }
    });
    return results;
  }, [data]);

  // Generate data based on distribution type
  const generateData = useCallback(() => {
    let newData = [];
    
    try {
      switch (distributionType) {
        case 'normal':
          for (let i = 0; i < sampleSize; i++) {
            newData.push(jStat.normal.sample(normalParams.mean, normalParams.std));
          }
          break;
          
        case 'uniform':
          for (let i = 0; i < sampleSize; i++) {
            newData.push(uniformParams.min + Math.random() * (uniformParams.max - uniformParams.min));
          }
          break;
          
        case 'exponential':
          for (let i = 0; i < sampleSize; i++) {
            newData.push(jStat.exponential.sample(exponentialParams.rate));
          }
          break;
          
        case 'bimodal':
          for (let i = 0; i < sampleSize; i++) {
            if (Math.random() < bimodalParams.mix) {
              newData.push(jStat.normal.sample(bimodalParams.mean1, bimodalParams.std));
            } else {
              newData.push(jStat.normal.sample(bimodalParams.mean2, bimodalParams.std));
            }
          }
          break;
      }
      
      const cleanedData = cleanData(newData);
      setData(cleanedData);
      
    } catch (error) {
      console.error('Error generating distribution:', error);
      const fallbackData = Array.from({ length: sampleSize }, () => 
        jStat.normal.sample(0, 1)
      );
      setData(cleanData(fallbackData));
    }
  }, [distributionType, sampleSize, normalParams, uniformParams, exponentialParams, bimodalParams]);

  // Get current bin count
  const getCurrentBinCount = () => {
    if (showManual) return manualBins;
    const allBins = calculateAllBins();
    return allBins[selectedMethod] || 20;
  };

  // Initialize with data
  useEffect(() => {
    generateData();
  }, [generateData]);

  // Calculate statistics
  const calculateStats = (data) => {
    if (data.length === 0) return { mean: 0, median: 0, std: 0, skewness: 0, q1: 0, q3: 0, iqr: 0 };
    
    const cleanedData = cleanData(data);
    if (cleanedData.length === 0) return { mean: 0, median: 0, std: 0, skewness: 0, q1: 0, q3: 0, iqr: 0 };
    
    const sorted = [...cleanedData].sort((a, b) => a - b);
    const mean = jStat.mean(cleanedData);
    const median = jStat.median(sorted);
    const std = jStat.stdev(cleanedData, true);
    const q1 = jStat.percentile(sorted, 0.25);
    const q3 = jStat.percentile(sorted, 0.75);
    const iqr = q3 - q1;
    
    // Calculate skewness using Pearson's second coefficient
    const skewness = std > 0 ? 3 * (mean - median) / std : 0;
    
    return { mean, median, std, skewness, q1, q3, iqr };
  };
  
  const stats = calculateStats(data);

  // Main histogram visualization
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const currentBins = getCurrentBinCount();
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xExtent = d3.extent(data);
    const xPadding = (xExtent[1] - xExtent[0]) * 0.1;
    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([0, innerWidth]);
    
    // Create histogram
    const histogram = d3.histogram()
      .domain(xScale.domain())
      .thresholds(xScale.ticks(currentBins));
    
    const bins = histogram(data);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
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
      .style("stroke", colors.chart.grid);
    
    // Draw histogram bars
    const barGroup = g.append("g");
    
    const bars = barGroup.selectAll("rect")
      .data(bins)
      .enter().append("rect")
      .attr("x", d => xScale(d.x0))
      .attr("y", d => yScale(d.length))
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr("height", d => innerHeight - yScale(d.length))
      .attr("fill", colorScheme.chart.primary)
      .attr("opacity", 0.8)
      .attr("rx", 2);
    
    // Hover effects
    bars.on("mouseover", function(event, d) { 
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 1)
          .attr("fill", colorScheme.chart.primaryLight);
      })
      .on("mouseout", function(event, d) { 
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 0.8)
          .attr("fill", colorScheme.chart.primary);
      });
    
    // Add title with bin count
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text(`${distributionType.charAt(0).toUpperCase() + distributionType.slice(1)} Distribution (${currentBins} bins)`);
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px");
    
    // Y axis
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(5));
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px");
    
    // Axis labels
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 45})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .attr("fill", colors.chart.text)
      .text("Value");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (innerHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .attr("fill", colors.chart.text)
      .text("Frequency");
    
  }, [data, distributionType, showManual, selectedMethod, manualBins]);

  // Comparison visualization
  useEffect(() => {
    if (!comparisonRef.current || !showComparison || data.length === 0) return;
    
    const svg = d3.select(comparisonRef.current);
    const { width } = comparisonRef.current.getBoundingClientRect();
    const methodCount = Object.keys(binningMethods).length;
    const height = 150 * Math.ceil(methodCount / 3);
    const cellWidth = width / 3;
    const cellHeight = 150;
    const margin = { top: 30, right: 10, bottom: 30, left: 40 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const xExtent = d3.extent(data);
    const xPadding = (xExtent[1] - xExtent[0]) * 0.1;
    
    Object.entries(binningMethods).forEach(([key, method], index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const xOffset = col * cellWidth;
      const yOffset = row * cellHeight;
      
      const g = svg.append("g")
        .attr("transform", `translate(${xOffset + margin.left},${yOffset + margin.top})`);
      
      const innerWidth = cellWidth - margin.left - margin.right;
      const innerHeight = cellHeight - margin.top - margin.bottom;
      
      const xScale = d3.scaleLinear()
        .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
        .range([0, innerWidth]);
      
      const binCount = method.calculate(data);
      const histogram = d3.histogram()
        .domain(xScale.domain())
        .thresholds(xScale.ticks(binCount));
      
      const bins = histogram(data);
      
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([innerHeight, 0]);
      
      // Draw bars
      g.selectAll("rect")
        .data(bins)
        .enter().append("rect")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.length))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("height", d => innerHeight - yScale(d.length))
        .attr("fill", colorScheme.chart.primary)
        .attr("opacity", 0.7)
        .attr("rx", 1);
      
      // Title
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .attr("fill", colors.chart.text)
        .text(`${method.name} (${binCount} bins)`);
      
      // Simple axes
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", innerHeight)
        .attr("y2", innerHeight)
        .attr("stroke", colors.chart.grid);
      
      g.append("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colors.chart.grid);
    });
    
  }, [data, showComparison]);

  const allBins = calculateAllBins();

  return (
    <VisualizationContainer title="4.2 Histogram Shape Explorer (OLD)">
      <div className="space-y-6">
        
        {/* Introduction */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">The Binning Problem</h3>
          <p className="text-neutral-300 text-sm">
            Choosing the right number of bins is crucial for revealing the true structure of your data. 
            Too few bins oversimplify; too many create noise. Different algorithms make different assumptions 
            about your data's distribution.
          </p>
        </div>

        {/* Distribution Controls */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="text-md font-semibold text-white mb-3">Data Generation</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-neutral-400 block mb-1">Distribution</label>
              <select 
                className="w-full bg-neutral-800 text-white rounded px-3 py-2 text-sm"
                value={distributionType}
                onChange={(e) => setDistributionType(e.target.value)}
              >
                <option value="normal">Normal</option>
                <option value="uniform">Uniform</option>
                <option value="exponential">Exponential</option>
                <option value="bimodal">Bimodal</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-neutral-400 block mb-1">Sample Size</label>
              <select 
                className="w-full bg-neutral-800 text-white rounded px-3 py-2 text-sm"
                value={sampleSize}
                onChange={(e) => setSampleSize(Number(e.target.value))}
              >
                <option value="50">n = 50</option>
                <option value="100">n = 100</option>
                <option value="200">n = 200</option>
                <option value="500">n = 500</option>
                <option value="1000">n = 1000</option>
              </select>
            </div>
            
            {distributionType === 'normal' && (
              <>
                <div>
                  <label className="text-sm text-neutral-400 block mb-1">Mean (μ)</label>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    step="0.1"
                    value={normalParams.mean}
                    onChange={(e) => setNormalParams({...normalParams, mean: Number(e.target.value)})}
                    className="w-full"
                  />
                  <span className="text-xs text-neutral-500 font-mono">{normalParams.mean.toFixed(1)}</span>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 block mb-1">Std Dev (σ)</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={normalParams.std}
                    onChange={(e) => setNormalParams({...normalParams, std: Number(e.target.value)})}
                    className="w-full"
                  />
                  <span className="text-xs text-neutral-500 font-mono">{normalParams.std.toFixed(1)}</span>
                </div>
              </>
            )}
            
            <div className="col-span-2 md:col-span-4">
              <Button
                variant="primary"
                size="sm"
                onClick={generateData}
                className="mt-2"
              >
                Generate New Data
              </Button>
            </div>
          </div>
        </div>

        {/* Main Histogram */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-white">Histogram Visualization</h4>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-neutral-400">
                <input
                  type="checkbox"
                  checked={showManual}
                  onChange={(e) => setShowManual(e.target.checked)}
                  className="rounded"
                />
                Manual Bins
              </label>
              {showManual ? (
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={manualBins}
                    onChange={(e) => setManualBins(Number(e.target.value))}
                    className="w-32"
                  />
                  <span className="font-mono text-sm text-white w-10">{manualBins}</span>
                </div>
              ) : (
                <select 
                  className="bg-neutral-800 text-white rounded px-3 py-1 text-sm"
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                >
                  {Object.entries(binningMethods).map(([key, method]) => (
                    <option key={key} value={key}>{method.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          <GraphContainer height="400px">
            <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
          </GraphContainer>
          
          {/* Statistics */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
            <div className="text-center">
              <div className="text-xs text-neutral-400">n</div>
              <div className="font-mono text-sm text-white">{data.length}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-neutral-400">Mean</div>
              <div className="font-mono text-sm text-white">{stats.mean.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-neutral-400">Median</div>
              <div className="font-mono text-sm text-white">{stats.median.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-neutral-400">Std Dev</div>
              <div className="font-mono text-sm text-white">{stats.std.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-neutral-400">IQR</div>
              <div className="font-mono text-sm text-white">{stats.iqr.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-neutral-400">Skewness</div>
              <div className="font-mono text-sm text-white">{stats.skewness.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Method Details */}
        {!showManual && (
          <div className="bg-neutral-900/50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-white mb-3">
              {binningMethods[selectedMethod].name} Details
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-300 mb-2">
                  <span className="font-semibold">Formula:</span>{' '}
                  <span className="font-mono bg-neutral-800 px-2 py-1 rounded">
                    {binningMethods[selectedMethod].formula}
                  </span>
                </p>
                <p className="text-sm text-neutral-300">
                  {binningMethods[selectedMethod].description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h5 className="text-sm font-semibold text-green-400 mb-1">Advantages</h5>
                  <ul className="text-xs text-neutral-300 space-y-1">
                    {binningMethods[selectedMethod].pros.map((pro, i) => (
                      <li key={i}>• {pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-red-400 mb-1">Limitations</h5>
                  <ul className="text-xs text-neutral-300 space-y-1">
                    {binningMethods[selectedMethod].cons.map((con, i) => (
                      <li key={i}>• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Methods Comparison */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="text-md font-semibold text-white mb-3">Binning Methods Comparison</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-2 px-3 text-neutral-400">Method</th>
                  <th className="text-center py-2 px-3 text-neutral-400">Bins</th>
                  <th className="text-left py-2 px-3 text-neutral-400">Best For</th>
                  <th className="text-left py-2 px-3 text-neutral-400">Avoid When</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(binningMethods).map(([key, method]) => (
                  <tr key={key} className="border-b border-neutral-800">
                    <td className="py-2 px-3 text-white font-medium">{method.name}</td>
                    <td className="py-2 px-3 text-center font-mono text-white">
                      {allBins[key] || '-'}
                    </td>
                    <td className="py-2 px-3 text-neutral-300 text-xs">{method.pros[0]}</td>
                    <td className="py-2 px-3 text-neutral-300 text-xs">{method.cons[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <Button
            variant="neutral"
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
            className="mt-4"
          >
            {showComparison ? 'Hide' : 'Show'} Visual Comparison
          </Button>
        </div>

        {/* Visual Comparison */}
        {showComparison && (
          <div className="bg-neutral-900/50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-white mb-3">Side-by-Side Comparison</h4>
            <GraphContainer height={`${150 * Math.ceil(Object.keys(binningMethods).length / 3)}px`}>
              <svg ref={comparisonRef} style={{ width: "100%", height: "100%" }} />
            </GraphContainer>
          </div>
        )}

        {/* Key Insights */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4">
          <h4 className="text-md font-semibold text-white mb-3">Key Insights</h4>
          <div className="space-y-2 text-sm text-neutral-300">
            <p>
              <span className="font-semibold text-blue-400">For normal data:</span> Scott's rule is theoretically optimal, 
              minimizing the integrated mean squared error between the histogram and true density.
            </p>
            <p>
              <span className="font-semibold text-purple-400">For skewed or outlier-prone data:</span> Freedman-Diaconis 
              rule's use of IQR makes it more robust than methods based on standard deviation.
            </p>
            <p>
              <span className="font-semibold text-green-400">For quick exploration:</span> Sturges' or square-root rules 
              provide reasonable starting points, but always validate visually.
            </p>
            <p>
              <span className="font-semibold text-orange-400">Sample size matters:</span> As n increases, you need more 
              bins to capture detail. Most methods scale with n^(1/3).
            </p>
          </div>
        </div>

      </div>
    </VisualizationContainer>
  );
}

export default HistogramShapeExplorer;