"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';
import { RangeSlider } from "../ui/RangeSlider";

// Use vibrant color scheme for boxplot
const colorScheme = createColorScheme('descriptive');
const vibrantColors = {
  primary: 'from-violet-500 to-purple-500',
  secondary: 'from-cyan-500 to-blue-500',
  tertiary: 'from-orange-500 to-red-500',
  success: 'from-emerald-500 to-green-500',
  warning: 'from-yellow-500 to-orange-500'
};

function BoxplotQuartilesExplorer() {
  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to Boxplot Explorer!",
      content: "Boxplots are powerful tools for visualizing data distribution and identifying outliers. Let's explore how they work!",
      target: ".visualization-title"
    },
    {
      title: "The Five-Number Summary",
      content: "A boxplot displays five key values: minimum, Q1 (25th percentile), median (Q2), Q3 (75th percentile), and maximum.",
      target: "[data-tutorial='statistics']"
    },
    {
      title: "Understanding the Box",
      content: "The box shows the interquartile range (IQR = Q3 - Q1), containing the middle 50% of the data. The line inside is the median.",
      target: "[data-tutorial='boxplot']"
    },
    {
      title: "Whiskers and Outliers",
      content: "Whiskers extend to the furthest points within 1.5×IQR from the box. Points beyond are outliers, shown as individual dots.",
      target: "[data-tutorial='boxplot']"
    },
    {
      title: "Interactive Data Points",
      content: "Drag data points on the dot plot to see how changes affect the boxplot and quartiles in real-time!",
      target: "[data-tutorial='dotplot']"
    },
    {
      title: "Generate Different Distributions",
      content: "Try different data distributions to see how skewness affects the boxplot's shape and outlier patterns.",
      target: "[data-tutorial='generate-data']"
    }
  ];

  // State management
  const [data, setData] = useState([]);
  const [quartiles, setQuartiles] = useState({ q1: 0, q2: 0, q3: 0, iqr: 0 });
  const [outliers, setOutliers] = useState([]);
  const [distribution, setDistribution] = useState('normal');
  const [sampleSize, setSampleSize] = useState(30);
  const [draggedPoint, setDraggedPoint] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [showValues, setShowValues] = useState(true);
  
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  
  // Calculate quartiles
  const calculateQuartiles = useCallback((values) => {
    if (values.length === 0) return { q1: 0, q2: 0, q3: 0, iqr: 0 };
    
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    // Calculate quartiles using method from course
    const q1Index = Math.floor(n / 4);
    const q1 = q1Index + 1 <= n ? 
      (sorted[q1Index] + sorted[Math.min(q1Index + 1, n - 1)]) / 2 : 
      sorted[q1Index];
    
    const q2 = jStat.median(sorted);
    
    const q3Index = Math.floor(3 * n / 4);
    const q3 = q3Index + 1 <= n ? 
      (sorted[q3Index] + sorted[Math.min(q3Index + 1, n - 1)]) / 2 : 
      sorted[q3Index];
    
    return {
      q1: q1,
      q2: q2,
      q3: q3,
      iqr: q3 - q1
    };
  }, []);
  
  // Identify outliers
  const identifyOutliers = useCallback((values, quartiles) => {
    const lowerFence = quartiles.q1 - 1.5 * quartiles.iqr;
    const upperFence = quartiles.q3 + 1.5 * quartiles.iqr;
    
    return values.map((value, index) => ({
      value,
      index,
      isOutlier: value < lowerFence || value > upperFence,
      isLower: value < lowerFence,
      isUpper: value > upperFence
    }));
  }, []);
  
  // Generate data based on distribution
  const generateData = useCallback(() => {
    let newData = [];
    
    switch(distribution) {
      case 'normal':
        // Normal distribution
        for (let i = 0; i < sampleSize; i++) {
          newData.push(jStat.normal.sample(100, 15));
        }
        break;
        
      case 'rightSkewed':
        // Right-skewed (exponential-like)
        for (let i = 0; i < sampleSize; i++) {
          newData.push(80 + jStat.exponential.sample(1/20));
        }
        break;
        
      case 'leftSkewed':
        // Left-skewed
        for (let i = 0; i < sampleSize; i++) {
          newData.push(120 - jStat.exponential.sample(1/20));
        }
        break;
        
      case 'bimodal':
        // Bimodal
        for (let i = 0; i < sampleSize; i++) {
          if (Math.random() < 0.5) {
            newData.push(jStat.normal.sample(85, 10));
          } else {
            newData.push(jStat.normal.sample(115, 10));
          }
        }
        break;
        
      case 'uniform':
        // Uniform distribution
        for (let i = 0; i < sampleSize; i++) {
          newData.push(60 + Math.random() * 80);
        }
        break;
    }
    
    // Add a few potential outliers for demonstration
    if (Math.random() < 0.3 && sampleSize > 10) {
      newData[0] = jStat.normal.sample(100, 50); // Potential outlier
    }
    if (Math.random() < 0.2 && sampleSize > 20) {
      newData[1] = jStat.normal.sample(100, 45); // Another potential outlier
    }
    
    setData(newData);
  }, [distribution, sampleSize]);
  
  // Update statistics when data changes
  useEffect(() => {
    const q = calculateQuartiles(data);
    setQuartiles(q);
    setOutliers(identifyOutliers(data, q));
  }, [data, calculateQuartiles, identifyOutliers]);
  
  // Generate initial data
  useEffect(() => {
    generateData();
  }, []);
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 600;
    const margin = { top: 60, right: 60, bottom: 120, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Vibrant gradient background
    const bgGradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "boxplot-bg-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    
    bgGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#0a0a2e");
    
    bgGradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#1a0a3e");
    
    bgGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#2a0a4e");
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#boxplot-bg-gradient)");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Boxplot and Quartiles Explorer");
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([
        Math.min(...data) - 10,
        Math.max(...data) + 10
      ])
      .range([0, innerWidth]);
    
    // Boxplot group
    const boxplotHeight = 150;
    const boxplotY = 100;
    const boxplotG = g.append("g")
      .attr("data-tutorial", "boxplot");
    
    // Calculate fence values
    const lowerFence = quartiles.q1 - 1.5 * quartiles.iqr;
    const upperFence = quartiles.q3 + 1.5 * quartiles.iqr;
    
    // Find min/max within fences
    const dataWithinFences = data.filter(d => d >= lowerFence && d <= upperFence);
    const whiskerMin = Math.min(...dataWithinFences);
    const whiskerMax = Math.max(...dataWithinFences);
    
    // Draw box
    const box = boxplotG.append("rect")
      .attr("x", xScale(quartiles.q1))
      .attr("y", boxplotY - boxplotHeight/2)
      .attr("width", Math.max(0, xScale(quartiles.q3) - xScale(quartiles.q1)))
      .attr("height", boxplotHeight)
      .attr("fill", colorScheme.chart.primary)
      .attr("fill-opacity", 0.3)
      .attr("stroke", colorScheme.chart.primary)
      .attr("stroke-width", 2)
      .attr("rx", 4);
    
    // Draw median line
    boxplotG.append("line")
      .attr("x1", xScale(quartiles.q2))
      .attr("x2", xScale(quartiles.q2))
      .attr("y1", boxplotY - boxplotHeight/2)
      .attr("y2", boxplotY + boxplotHeight/2)
      .attr("stroke", colorScheme.chart.secondary)
      .attr("stroke-width", 3);
    
    // Draw whiskers
    // Lower whisker
    boxplotG.append("line")
      .attr("x1", xScale(whiskerMin))
      .attr("x2", xScale(quartiles.q1))
      .attr("y1", boxplotY)
      .attr("y2", boxplotY)
      .attr("stroke", colors.chart.text)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3");
    
    boxplotG.append("line")
      .attr("x1", xScale(whiskerMin))
      .attr("x2", xScale(whiskerMin))
      .attr("y1", boxplotY - boxplotHeight/4)
      .attr("y2", boxplotY + boxplotHeight/4)
      .attr("stroke", colors.chart.text)
      .attr("stroke-width", 2);
    
    // Upper whisker
    boxplotG.append("line")
      .attr("x1", xScale(quartiles.q3))
      .attr("x2", xScale(whiskerMax))
      .attr("y1", boxplotY)
      .attr("y2", boxplotY)
      .attr("stroke", colors.chart.text)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3");
    
    boxplotG.append("line")
      .attr("x1", xScale(whiskerMax))
      .attr("x2", xScale(whiskerMax))
      .attr("y1", boxplotY - boxplotHeight/4)
      .attr("y2", boxplotY + boxplotHeight/4)
      .attr("stroke", colors.chart.text)
      .attr("stroke-width", 2);
    
    // Draw outliers
    const outlierData = outliers.filter(d => d.isOutlier);
    boxplotG.selectAll("circle.outlier")
      .data(outlierData)
      .enter().append("circle")
      .attr("class", "outlier")
      .attr("cx", d => xScale(d.value))
      .attr("cy", boxplotY)
      .attr("r", 6)
      .attr("fill", "none")
      .attr("stroke", colorScheme.chart.tertiary)
      .attr("stroke-width", 2);
    
    // Draw fence lines (subtle)
    boxplotG.append("line")
      .attr("x1", xScale(lowerFence))
      .attr("x2", xScale(lowerFence))
      .attr("y1", boxplotY - boxplotHeight/2 - 20)
      .attr("y2", boxplotY + boxplotHeight/2 + 20)
      .attr("stroke", colorScheme.chart.tertiary)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,4")
      .attr("opacity", 0.3);
    
    boxplotG.append("line")
      .attr("x1", xScale(upperFence))
      .attr("x2", xScale(upperFence))
      .attr("y1", boxplotY - boxplotHeight/2 - 20)
      .attr("y2", boxplotY + boxplotHeight/2 + 20)
      .attr("stroke", colorScheme.chart.tertiary)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,4")
      .attr("opacity", 0.3);
    
    // Labels for quartiles
    if (showValues) {
      const labelY = boxplotY + boxplotHeight/2 + 20;
      
      // Q1 label
      boxplotG.append("text")
        .attr("x", xScale(quartiles.q1))
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-family", "monospace")
        .attr("fill", colorScheme.chart.primary)
        .text(`Q1: ${quartiles.q1.toFixed(1)}`);
      
      // Median label
      boxplotG.append("text")
        .attr("x", xScale(quartiles.q2))
        .attr("y", labelY + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-family", "monospace")
        .attr("fill", colorScheme.chart.secondary)
        .text(`Median: ${quartiles.q2.toFixed(1)}`);
      
      // Q3 label
      boxplotG.append("text")
        .attr("x", xScale(quartiles.q3))
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-family", "monospace")
        .attr("fill", colorScheme.chart.primary)
        .text(`Q3: ${quartiles.q3.toFixed(1)}`);
      
      // IQR label
      const iqrX = xScale((quartiles.q1 + quartiles.q3) / 2);
      boxplotG.append("text")
        .attr("x", iqrX)
        .attr("y", boxplotY - boxplotHeight/2 - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-family", "monospace")
        .attr("fill", colors.chart.text)
        .attr("opacity", 0.7)
        .text(`IQR: ${quartiles.iqr.toFixed(1)}`);
    }
    
    // Dot plot
    const dotPlotY = 350;
    const dotPlotG = g.append("g")
      .attr("data-tutorial", "dotplot");
    
    // Create simple jittered dot plot
    const dotData = data.map((d, i) => ({
      value: d,
      index: i,
      x: xScale(d),
      y: dotPlotY + (Math.random() - 0.5) * 30 // Random jitter for visibility
    }));
    
    // Draw dots
    const dots = dotPlotG.selectAll("circle.datapoint")
      .data(dotData)
      .enter().append("circle")
      .attr("class", "datapoint")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 4)
      .attr("fill", (d) => {
        const outlier = outliers.find(o => o.index === d.index);
        return outlier && outlier.isOutlier ? colorScheme.chart.tertiary : colorScheme.chart.primary;
      })
      .attr("stroke", colors.chart.text)
      .attr("stroke-width", 1)
      .attr("cursor", "grab")
      .attr("opacity", 0.8);
    
    // Drag behavior
    const drag = d3.drag()
      .on("start", function(event, d) {
        d3.select(this).attr("cursor", "grabbing");
        setDraggedPoint(d.index);
      })
      .on("drag", function(event, d) {
        const newX = Math.max(0, Math.min(innerWidth, event.x));
        const newValue = xScale.invert(newX);
        
        // Update data
        const newData = [...data];
        newData[d.index] = newValue;
        setData(newData);
      })
      .on("end", function(event, d) {
        d3.select(this).attr("cursor", "grab");
        setDraggedPoint(null);
      });
    
    dots.call(drag);
    
    // Hover behavior
    dots.on("mouseover", function(event, d) {
      setHoveredPoint(d.index);
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 6);
    })
    .on("mouseout", function(event, d) {
      setHoveredPoint(null);
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 4);
    });
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight - 50})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    // Axis label
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight})`)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Value");
    
    // Legend for outliers
    const legendG = g.append("g")
      .attr("transform", `translate(${innerWidth - 150}, 20)`);
    
    legendG.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 6)
      .attr("fill", "none")
      .attr("stroke", colorScheme.chart.tertiary)
      .attr("stroke-width", 2);
    
    legendG.append("text")
      .attr("x", 15)
      .attr("y", 5)
      .style("font-size", "12px")
      .attr("fill", colors.chart.text)
      .text("Outlier");
    
  }, [data, outliers, quartiles, showValues]);
  
  // Get statistics summary
  const getStatsSummary = () => {
    if (data.length === 0) return {};
    
    const sorted = [...data].sort((a, b) => a - b);
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: jStat.mean(data),
      median: quartiles.q2,
      q1: quartiles.q1,
      q3: quartiles.q3,
      iqr: quartiles.iqr,
      outlierCount: outliers.filter(o => o.isOutlier).length
    };
  };
  
  const stats = getStatsSummary();
  
  return (
    <VisualizationContainer 
      title="Boxplot and Quartiles Explorer"
      tutorialSteps={tutorialSteps}
      tutorialKey="boxplot-quartiles"
      showTutorialOnMount={true}
    >
      <div className="flex flex-col gap-6">
        {/* Main Visualization */}
        <GraphContainer height="600px">
          <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        </GraphContainer>
        
        {/* Controls and Stats */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Controls */}
          <div className="flex-1">
            <ControlGroup label="Data Distribution" data-tutorial="generate-data">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'normal', label: 'Normal' },
                  { value: 'rightSkewed', label: 'Right Skewed' },
                  { value: 'leftSkewed', label: 'Left Skewed' },
                  { value: 'bimodal', label: 'Bimodal' },
                  { value: 'uniform', label: 'Uniform' }
                ].map(dist => (
                  <Button
                    key={dist.value}
                    variant={distribution === dist.value ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setDistribution(dist.value)}
                  >
                    {dist.label}
                  </Button>
                ))}
              </div>
            </ControlGroup>
            
            <ControlGroup label={`Sample Size (n = ${sampleSize})`}>
              <RangeSlider
                min={10}
                max={100}
                step={5}
                value={sampleSize}
                onChange={setSampleSize}
                label={`n = ${sampleSize}`}
              />
            </ControlGroup>
            
            <div className="flex gap-2 mt-4">
              <Button 
                variant="primary" 
                size="sm"
                onClick={generateData}
              >
                Generate New Data
              </Button>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showValues}
                  onChange={(e) => setShowValues(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-neutral-300">Show values</span>
              </label>
            </div>
          </div>
          
          {/* Statistics Display */}
          <div className="flex gap-6" data-tutorial="statistics">
            <div>
              <h4 className="text-sm font-semibold text-neutral-400 mb-2">Five-Number Summary</h4>
              <div className="space-y-1">
                <div>
                  <span className="text-xs text-neutral-500">Minimum</span>
                  <div className="font-mono text-lg text-white">{stats.min?.toFixed(1)}</div>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">Q1 (25th percentile)</span>
                  <div className="font-mono text-lg text-white">{stats.q1?.toFixed(1)}</div>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">Median (Q2)</span>
                  <div className="font-mono text-lg text-white">{stats.median?.toFixed(1)}</div>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">Q3 (75th percentile)</span>
                  <div className="font-mono text-lg text-white">{stats.q3?.toFixed(1)}</div>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">Maximum</span>
                  <div className="font-mono text-lg text-white">{stats.max?.toFixed(1)}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-neutral-400 mb-2">Additional Stats</h4>
              <div className="space-y-1">
                <div>
                  <span className="text-xs text-neutral-500">Mean</span>
                  <div className="font-mono text-lg text-white">{stats.mean?.toFixed(1)}</div>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">IQR (Q3 - Q1)</span>
                  <div className="font-mono text-lg text-white">{stats.iqr?.toFixed(1)}</div>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">Lower Fence</span>
                  <div className="font-mono text-lg text-white">{(quartiles.q1 - 1.5 * quartiles.iqr).toFixed(1)}</div>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">Upper Fence</span>
                  <div className="font-mono text-lg text-white">{(quartiles.q3 + 1.5 * quartiles.iqr).toFixed(1)}</div>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">Outliers</span>
                  <div className="font-mono text-lg text-white">{stats.outlierCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Educational Content */}
        <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-600/50 rounded-lg p-4 hover:from-blue-900/40 hover:to-indigo-900/40 transition-all duration-300">
          <h4 className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">📊 Understanding Boxplots</h4>
          <div className="space-y-2 text-sm text-neutral-300">
            <p>
              <strong>The Box:</strong> Shows the interquartile range (IQR), containing the middle 50% of the data. 
              The bottom is Q1, the top is Q3, and the line inside is the median.
            </p>
            <p>
              <strong>The Whiskers:</strong> Extend to the furthest data points within 1.5×IQR from the box edges. 
              This captures most "normal" variation in the data.
            </p>
            <p>
              <strong>Outliers:</strong> Points beyond the whiskers are potential outliers. They're unusual but not necessarily wrong - 
              they might represent important extreme cases!
            </p>
          </div>
        </div>
        
        {/* Interpretation Guide */}
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-600/50 rounded-lg p-4 hover:from-purple-900/40 hover:to-pink-900/40 transition-all duration-300">
          <h4 className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">🎯 Interpreting Boxplot Shapes</h4>
          <div className="space-y-2 text-sm text-neutral-300">
            <p>
              <strong>Symmetric:</strong> Box is centered on the median, whiskers are similar length. Mean ≈ Median.
            </p>
            <p>
              <strong>Right-skewed:</strong> Longer upper whisker, median closer to Q1. Mean &gt; Median.
            </p>
            <p>
              <strong>Left-skewed:</strong> Longer lower whisker, median closer to Q3. Mean &lt; Median.
            </p>
            {stats.mean && stats.median && (
              <p className="text-xs italic">
                Current data: Mean = {stats.mean.toFixed(1)}, Median = {stats.median.toFixed(1)} 
                {Math.abs(stats.mean - stats.median) < 2 ? " (roughly symmetric)" : 
                 stats.mean > stats.median ? " (right-skewed)" : " (left-skewed)"}
              </p>
            )}
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default BoxplotQuartilesExplorer;