"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { ProgressTracker } from '../ui/ProgressTracker';
import { RangeSlider, SliderPresets } from "../ui/RangeSlider";

// Use estimation color scheme for statistics
const colorScheme = createColorScheme('estimation');

// Worked Example Component
const DescriptiveStatsWorkedExample = React.memo(function DescriptiveStatsWorkedExample({ data, mean, median, mode }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    // MathJax timeout pattern
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          // Silent error: MathJax error
        });
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [data, mean, median, mode]);
  
  // Calculate variance and standard deviation
  const variance = data.length > 0 
    ? data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length 
    : 0;
  const stdDev = Math.sqrt(variance);
  
  return (
    <div ref={contentRef} style={{
      backgroundColor: '#2A303C',
      padding: '1.5rem',
      borderRadius: '8px',
      color: '#e0e0e0',
      border: '1px solid #4A5568'
    }}>
      <h4 style={{ fontSize: '1.125rem', fontWeight: '600', borderBottom: '1px solid #4A5568', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        Descriptive Statistics Calculations
      </h4>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>1. Mean (Average):</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[\\bar{x} = \\frac{\\sum_{i=1}^{n} x_i}{n} = \\frac{${data.reduce((a,b) => a+b, 0)}}{${data.length}} = ${mean.toFixed(2)}\\]` }} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>2. Median (Middle Value):</p>
        <p style={{ fontSize: '0.875rem', marginLeft: '1rem' }}>
          Sorted data: [{[...data].sort((a, b) => a - b).join(', ')}]<br/>
          {data.length % 2 === 1 
            ? `Middle value at position ${Math.floor(data.length/2) + 1}: ${median}`
            : `Average of positions ${data.length/2} and ${data.length/2 + 1}: ${median}`}
        </p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>3. Mode (Most Frequent):</p>
        <p style={{ fontSize: '0.875rem', marginLeft: '1rem' }}>
          {mode.length === 0 ? 'No mode (all values unique)' : 
           mode.length === 1 ? `Mode: ${mode[0]}` : 
           `Modes: ${mode.join(', ')} (multimodal)`}
        </p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>4. Variance and Standard Deviation:</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[\\sigma^2 = \\frac{\\sum_{i=1}^{n} (x_i - \\bar{x})^2}{n} = ${variance.toFixed(2)}\\]` }} />
        <div dangerouslySetInnerHTML={{ __html: `\\[\\sigma = \\sqrt{\\sigma^2} = ${stdDev.toFixed(2)}\\]` }} />
      </div>
      
      <div style={{ backgroundColor: '#1F2937', padding: '0.75rem', borderRadius: '4px', fontSize: '0.875rem' }}>
        <strong style={{ color: '#10B981' }}>Interpretation:</strong>
        <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem', fontSize: '0.8rem' }}>
          <li>Mean &gt; Median: Right-skewed distribution (tail on right)</li>
          <li>Mean &lt; Median: Left-skewed distribution (tail on left)</li>
          <li>Mean ≈ Median: Approximately symmetric distribution</li>
        </ul>
      </div>
    </div>
  );
});

function MeanMedianMode() {
  const [dataPoints, setDataPoints] = useState([3, 5, 5, 7, 8, 9, 9, 9, 10, 12]);
  const [newValue, setNewValue] = useState(5);
  const [distribution, setDistribution] = useState('custom'); // custom, normal, skewed-right, skewed-left
  const [interactionCount, setInteractionCount] = useState(0);
  const [highlightMeasure, setHighlightMeasure] = useState('all'); // all, mean, median, mode
  
  const svgRef = useRef(null);
  const histogramRef = useRef(null);
  
  // Calculate descriptive statistics
  const calculateStats = (data) => {
    if (data.length === 0) return { mean: 0, median: 0, mode: [] };
    
    // Mean
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    
    // Median
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
    
    // Mode
    const frequency = {};
    data.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(frequency));
    const mode = Object.keys(frequency)
      .filter(key => frequency[key] === maxFreq)
      .map(Number);
    
    return { mean, median, mode };
  };
  
  const { mean, median, mode } = calculateStats(dataPoints);
  
  // Add a new data point
  const addDataPoint = () => {
    setDataPoints([...dataPoints, newValue]);
    setInteractionCount(prev => prev + 1);
  };
  
  // Remove last data point
  const removeLastPoint = () => {
    if (dataPoints.length > 0) {
      setDataPoints(dataPoints.slice(0, -1));
      setInteractionCount(prev => prev + 1);
    }
  };
  
  // Clear all data
  const clearData = () => {
    setDataPoints([]);
    setInteractionCount(0);
  };
  
  // Generate distribution data
  const generateDistribution = (type) => {
    let data = [];
    const size = 50;
    
    switch (type) {
      case 'normal':
        // Box-Muller transform for normal distribution
        for (let i = 0; i < size; i++) {
          const u1 = Math.random();
          const u2 = Math.random();
          const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          data.push(Math.round(10 + z0 * 3)); // mean=10, std=3
        }
        break;
        
      case 'skewed-right':
        // Exponential-like distribution
        for (let i = 0; i < size; i++) {
          data.push(Math.round(Math.min(20, -Math.log(Math.random()) * 4)));
        }
        break;
        
      case 'skewed-left':
        // Reverse exponential
        for (let i = 0; i < size; i++) {
          data.push(Math.round(Math.max(1, 20 + Math.log(Math.random()) * 4)));
        }
        break;
        
      default:
        return;
    }
    
    setDataPoints(data.filter(x => x >= 1 && x <= 20));
    setDistribution(type);
    setInteractionCount(prev => prev + 1);
  };
  
  // Main visualization (dot plot)
  useEffect(() => {
    if (!svgRef.current || dataPoints.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xExtent = d3.extent(dataPoints);
    const xScale = d3.scaleLinear()
      .domain([Math.min(0, xExtent[0] - 1), Math.max(20, xExtent[1] + 1)])
      .range([0, innerWidth]);
    
    // Count occurrences for y scale
    const valueCounts = d3.rollup(dataPoints, v => v.length, d => d);
    const maxCount = Math.max(...valueCounts.values());
    
    const yScale = d3.scaleLinear()
      .domain([0, maxCount + 1])
      .range([innerHeight, 0]);
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    // Draw vertical lines for mean, median, mode
    const measures = [
      { value: mean, color: colorScheme.chart.primary, label: 'Mean', show: ['all', 'mean'].includes(highlightMeasure) },
      { value: median, color: colorScheme.chart.secondary, label: 'Median', show: ['all', 'median'].includes(highlightMeasure) }
    ];
    
    if (mode.length === 1) {
      measures.push({ value: mode[0], color: colorScheme.chart.tertiary, label: 'Mode', show: ['all', 'mode'].includes(highlightMeasure) });
    }
    
    measures.forEach(measure => {
      if (!measure.show) return;
      
      g.append("line")
        .attr("x1", xScale(measure.value))
        .attr("x2", xScale(measure.value))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", measure.color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.8);
      
      g.append("text")
        .attr("x", xScale(measure.value))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", measure.color)
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(`${measure.label}: ${measure.value.toFixed(1)}`);
    });
    
    // Draw dots
    const dotGroups = Array.from(valueCounts.entries()).map(([value, count]) => {
      return Array.from({ length: count }, (_, i) => ({ value, index: i }));
    }).flat();
    
    g.selectAll("circle")
      .data(dotGroups)
      .enter().append("circle")
      .attr("cx", d => xScale(d.value))
      .attr("cy", d => yScale(d.index + 1))
      .attr("r", 0)
      .attr("fill", d => {
        if (highlightMeasure === 'mean') return colorScheme.chart.primary;
        if (highlightMeasure === 'median') {
          const sorted = [...dataPoints].sort((a, b) => a - b);
          const medianIndices = dataPoints.length % 2 === 0 
            ? [Math.floor(dataPoints.length/2) - 1, Math.floor(dataPoints.length/2)]
            : [Math.floor(dataPoints.length/2)];
          return medianIndices.some(i => sorted[i] === d.value) 
            ? colorScheme.chart.secondary 
            : colorScheme.chart.secondary + "40";
        }
        if (highlightMeasure === 'mode') {
          return mode.includes(d.value) 
            ? colorScheme.chart.tertiary 
            : colorScheme.chart.tertiary + "40";
        }
        return colorScheme.chart.primary;
      })
      .attr("opacity", 0.8)
      .transition()
      .duration(300)
      .attr("r", 4);
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .attr("fill", colors.chart.text);
    
    // Y axis
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(maxCount));
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text")
      .style("font-size", "12px")
      .attr("fill", colors.chart.text);
    
    // Axis labels
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 40})`)
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
      .text("Count");
    
  }, [dataPoints, highlightMeasure, mean, median, mode]);
  
  // Histogram visualization
  useEffect(() => {
    if (!histogramRef.current || dataPoints.length === 0) return;
    
    const svg = d3.select(histogramRef.current);
    const { width } = histogramRef.current.getBoundingClientRect();
    const height = 200;
    const margin = { top: 20, right: 40, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create histogram bins
    const xExtent = d3.extent(dataPoints);
    const xScale = d3.scaleLinear()
      .domain([Math.min(0, xExtent[0] - 1), Math.max(20, xExtent[1] + 1)])
      .range([0, innerWidth]);
    
    const histogram = d3.histogram()
      .domain(xScale.domain())
      .thresholds(xScale.ticks(10));
    
    const bins = histogram(dataPoints);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([innerHeight, 0]);
    
    // Draw bars
    g.selectAll("rect")
      .data(bins)
      .enter().append("rect")
      .attr("x", d => xScale(d.x0))
      .attr("y", innerHeight)
      .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
      .attr("height", 0)
      .attr("fill", colorScheme.chart.primary)
      .attr("opacity", 0.7)
      .transition()
      .duration(300)
      .attr("y", d => yScale(d.length))
      .attr("height", d => innerHeight - yScale(d.length));
    
    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", "12px")
      .attr("fill", colors.chart.text);
    
    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "12px")
      .attr("fill", colors.chart.text);
    
  }, [dataPoints]);
  
  return (
    <VisualizationContainer title="Measures of Central Tendency" className="p-2">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Explore the three main measures of central tendency: mean, median, and mode. 
              See how different data distributions affect these statistics.
            </p>
          </VisualizationSection>
          
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Data Controls</h4>
            
            <ControlGroup label="Add Data Point">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newValue}
                  onChange={(e) => setNewValue(Number(e.target.value))}
                  className={cn(components.input, "w-20")}
                />
                <button
                  onClick={addDataPoint}
                  className={cn(components.button.base, components.button.primary, "flex-1")}
                >
                  Add Point
                </button>
              </div>
            </ControlGroup>
            
            <ControlGroup label="Quick Distributions">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => generateDistribution('normal')}
                  className={cn(components.button.base, components.button.secondary, "text-xs")}
                >
                  Normal
                </button>
                <button
                  onClick={() => generateDistribution('skewed-right')}
                  className={cn(components.button.base, components.button.secondary, "text-xs")}
                >
                  Right Skew
                </button>
                <button
                  onClick={() => generateDistribution('skewed-left')}
                  className={cn(components.button.base, components.button.secondary, "text-xs")}
                >
                  Left Skew
                </button>
                <button
                  onClick={clearData}
                  className={cn(components.button.base, components.button.danger, "text-xs")}
                >
                  Clear All
                </button>
              </div>
            </ControlGroup>
            
            <ControlGroup label="Highlight Measure">
              <select
                value={highlightMeasure}
                onChange={(e) => setHighlightMeasure(e.target.value)}
                className={cn(components.select, "w-full")}
              >
                <option value="all">All Measures</option>
                <option value="mean">Mean Only</option>
                <option value="median">Median Only</option>
                <option value="mode">Mode Only</option>
              </select>
            </ControlGroup>
            
            {dataPoints.length > 0 && (
              <button
                onClick={removeLastPoint}
                className={cn(components.button.base, components.button.secondary, "w-full")}
              >
                Remove Last Point
              </button>
            )}
          </VisualizationSection>
          
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Current Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Data Points:</span>
                <span className="font-mono text-white">{dataPoints.length}</span>
              </div>
              <div className="border-t border-neutral-700 pt-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-neutral-400 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorScheme.chart.primary }}></span>
                    Mean:
                  </span>
                  <span className="font-mono text-white">{mean.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-neutral-400 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorScheme.chart.secondary }}></span>
                    Median:
                  </span>
                  <span className="font-mono text-white">{median.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-neutral-400 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorScheme.chart.tertiary }}></span>
                    Mode:
                  </span>
                  <span className="font-mono text-white">
                    {mode.length === 0 ? 'None' : mode.join(', ')}
                  </span>
                </div>
              </div>
              <div className="border-t border-neutral-700 pt-2 text-xs">
                <div className="text-neutral-400">Distribution Type:</div>
                <div className="text-white">
                  {Math.abs(mean - median) < 0.5 ? 'Approximately Symmetric' :
                   mean > median ? 'Right-Skewed (Positive)' : 'Left-Skewed (Negative)'}
                </div>
              </div>
            </div>
          </VisualizationSection>
          
          <VisualizationSection className="p-3">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Learning Progress</h4>
            
            <ProgressTracker 
              current={interactionCount} 
              goal={20} 
              label="Data Explorations"
              color="purple"
            />
            
            <div className="space-y-2 text-xs text-neutral-300 mt-3">
              {interactionCount === 0 && (
                <div>
                  <p>🎯 Ready to explore descriptive statistics?</p>
                  <p className="text-purple-300 mt-1">
                    Start by adding data points or generating a distribution!
                  </p>
                </div>
              )}
              {interactionCount > 0 && interactionCount < 5 && (
                <div>
                  <p>📊 Great start! Notice how the measures change.</p>
                  <p className="text-purple-300 mt-1">
                    Try adding outliers (very high or low values) to see their effect on the mean vs median.
                  </p>
                </div>
              )}
              {interactionCount >= 5 && interactionCount < 10 && (
                <div>
                  <p>🎓 Key insight: The median is robust to outliers!</p>
                  <p className="text-purple-300 mt-1">
                    While the mean shifts with extreme values, the median stays stable. This makes it useful for skewed data.
                  </p>
                </div>
              )}
              {interactionCount >= 10 && interactionCount < 20 && (
                <div>
                  <p>🔍 Explore different distributions!</p>
                  <p className="text-purple-300 mt-1">
                    Notice: Right-skewed → mean &gt; median<br/>
                    Left-skewed → mean &lt; median<br/>
                    Symmetric → mean ≈ median
                  </p>
                </div>
              )}
              {interactionCount >= 20 && (
                <div>
                  <p className="text-green-400 font-semibold mb-1">
                    ✨ Statistics Expert! {interactionCount} explorations completed.
                  </p>
                  <p>You've mastered the relationship between mean, median, and mode!</p>
                  <p className="text-purple-300 mt-1">
                    Challenge: Can you create a perfectly symmetric distribution where all three measures are equal?
                  </p>
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>
        
        {/* Right Panel - Visualizations */}
        <div className="lg:w-2/3 space-y-4">
          <GraphContainer height="350px" title="Dot Plot">
            <svg ref={svgRef} style={{ width: "100%", height: 300 }} />
          </GraphContainer>
          
          <GraphContainer height="250px" title="Histogram">
            <svg ref={histogramRef} style={{ width: "100%", height: 200 }} />
          </GraphContainer>
          
          {dataPoints.length > 0 && (
            <DescriptiveStatsWorkedExample 
              data={dataPoints}
              mean={mean}
              median={median}
              mode={mode}
            />
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default MeanMedianMode;