"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { ProgressTracker } from '../ui/ProgressTracker';
import { RangeSlider, SliderPresets } from "../ui/RangeSlider";

// Use sampling color scheme to match ExpectationVariance
const colorScheme = createColorScheme('sampling');

// Helper function to validate and clean data
const cleanData = (data) => {
  return data
    .filter(x => !isNaN(x) && isFinite(x))
    .map(x => Math.max(-10, Math.min(10, x))); // Bound data to reasonable range
};

// Bin selection algorithms
const binAlgorithms = {
  sturges: (n) => Math.ceil(Math.log2(n) + 1),
  scott: (data) => {
    const n = data.length;
    const std = jStat.stdev(data);
    const range = Math.max(...data) - Math.min(...data);
    if (std === 0 || range === 0) return 10;
    const binWidth = 3.5 * std / Math.pow(n, 1/3);
    return Math.max(5, Math.min(50, Math.ceil(range / binWidth)));
  },
  freedmanDiaconis: (data) => {
    const n = data.length;
    const q1 = jStat.percentile(data.sort((a, b) => a - b), 0.25);
    const q3 = jStat.percentile(data.sort((a, b) => a - b), 0.75);
    const iqr = q3 - q1;
    const range = Math.max(...data) - Math.min(...data);
    if (iqr === 0 || range === 0) return 10;
    const binWidth = 2 * iqr / Math.pow(n, 1/3);
    return Math.max(5, Math.min(50, Math.ceil(range / binWidth)));
  }
};

// Worked Example Component
const HistogramWorkedExample = React.memo(function HistogramWorkedExample({ 
  data, 
  numBins, 
  mean, 
  median, 
  skewness 
}) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    // MathJax timeout pattern
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          console.error('MathJax error:', err);
        });
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [data, numBins, mean, median, skewness]);
  
  return (
    <div ref={contentRef} style={{
      backgroundColor: '#2A303C',
      padding: '1.5rem',
      borderRadius: '8px',
      color: '#e0e0e0',
      width: '100%',
      maxWidth: '768px',
      marginTop: '1.5rem',
      overflowX: 'auto',
      fontFamily: 'var(--font-sans)',
    }}
    className="text-sm"
    >
      <h4 style={{ fontSize: '1.125rem', fontWeight: '600', borderBottom: '1px solid #4A5568', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        Histogram Construction & Skewness Analysis
      </h4>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>1. Current Histogram Settings:</p>
        <p style={{ fontSize: '0.875rem', marginLeft: '1rem' }}>
          Number of bins: {numBins}<br/>
          Bin width: {((Math.max(...data) - Math.min(...data)) / numBins).toFixed(2)}<br/>
          Sample size: n = {data.length}
        </p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>2. Measures of Central Tendency:</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[\\text{Mean} = \\bar{x} = ${mean.toFixed(3)}\\]` }} />
        <div dangerouslySetInnerHTML={{ __html: `\\[\\text{Median} = M = ${median.toFixed(3)}\\]` }} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>3. Skewness Analysis:</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[\\text{Skewness} = \\frac{n}{(n-1)(n-2)} \\sum_{i=1}^{n} \\left(\\frac{x_i - \\bar{x}}{s}\\right)^3 = ${skewness.toFixed(3)}\\]` }} />
        <p style={{ fontSize: '0.875rem', marginLeft: '1rem', marginTop: '0.5rem' }}>
          Interpretation: {
            Math.abs(skewness) < 0.5 ? 'Approximately symmetric' :
            skewness > 0 ? `Right-skewed (positive skew = ${skewness.toFixed(2)})` :
            `Left-skewed (negative skew = ${skewness.toFixed(2)})`
          }
        </p>
      </div>
      
      <div style={{ backgroundColor: '#1F2937', padding: '0.75rem', borderRadius: '4px', fontSize: '0.875rem' }}>
        <strong style={{ color: '#10B981' }}>Key Relationships:</strong>
        <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem', fontSize: '0.8rem' }}>
          <li>Right-skewed: Mean &gt; Median (tail pulls mean right)</li>
          <li>Left-skewed: Mean &lt; Median (tail pulls mean left)</li>
          <li>Symmetric: Mean ≈ Median</li>
          <li>Current: Mean {mean > median + 0.1 ? '>' : mean < median - 0.1 ? '<' : '≈'} Median</li>
        </ul>
      </div>
    </div>
  );
});

function HistogramShapeExplorer() {
  const [distributionType, setDistributionType] = useState('normal');
  const [numBins, setNumBins] = useState(15);
  const [sampleSize, setSampleSize] = useState(200);
  const [data, setData] = useState([]);
  const [interactionCount, setInteractionCount] = useState(0);
  const [showOverlays, setShowOverlays] = useState({
    pdf: true,
    boxplot: true,
    meanMedian: true
  });
  const [binAlgorithm, setBinAlgorithm] = useState('manual'); // manual, sturges, scott, fd
  const [highlightOutliers, setHighlightOutliers] = useState(false);
  
  // Distribution parameters
  const [normalParams, setNormalParams] = useState({ mean: 0, std: 1 });
  const [exponentialParams, setExponentialParams] = useState({ rate: 1 });
  const [skewParams, setSkewParams] = useState({ degree: 0 });
  
  const svgRef = useRef(null);
  const boxplotRef = useRef(null);
  
  // Generate data based on distribution type
  const generateData = useCallback(() => {
    let newData = [];
    
    try {
      switch (distributionType) {
        case 'normal':
          for (let i = 0; i < sampleSize; i++) {
            const value = jStat.normal.sample(normalParams.mean, normalParams.std);
            newData.push(value);
          }
          break;
          
        case 'uniform':
          for (let i = 0; i < sampleSize; i++) {
            newData.push(jStat.uniform.sample(-3, 3));
          }
          break;
          
        case 'exponential':
          for (let i = 0; i < sampleSize; i++) {
            const value = jStat.exponential.sample(exponentialParams.rate);
            // Exponential can generate very large values, cap them
            newData.push(Math.min(value, 10));
          }
          break;
          
        case 'skewed':
          // Generate skewed data using a mixture approach
          for (let i = 0; i < sampleSize; i++) {
            if (Math.abs(skewParams.degree) < 0.1) {
              // Near zero skew, just normal
              newData.push(jStat.normal.sample(0, 1));
            } else if (skewParams.degree > 0) {
              // Right skew: beta distribution approach
              const alpha = 2;
              const beta = 2 + skewParams.degree * 3;
              const value = jStat.beta.sample(alpha, beta) * 6 - 1; // Scale to roughly -1 to 5
              newData.push(value);
            } else {
              // Left skew: mirrored beta
              const alpha = 2 + Math.abs(skewParams.degree) * 3;
              const beta = 2;
              const value = -jStat.beta.sample(alpha, beta) * 6 + 5; // Scale and flip
              newData.push(value);
            }
          }
          break;
      }
      
      // Clean and validate data
      const cleanedData = cleanData(newData);
      setData(cleanedData);
      setInteractionCount(prev => prev + 1);
      
    } catch (error) {
      console.error('Error generating data:', error);
      // Fallback to simple normal distribution
      const fallbackData = Array.from({ length: sampleSize }, () => 
        jStat.normal.sample(0, 1)
      );
      setData(cleanData(fallbackData));
    }
  }, [distributionType, sampleSize, normalParams, exponentialParams, skewParams]);
  
  // Initialize with data
  useEffect(() => {
    generateData();
  }, []); // Only run once on mount
  
  // Calculate statistics with better error handling
  const calculateStats = (data) => {
    if (data.length === 0) return { mean: 0, median: 0, std: 0, skewness: 0, q1: 0, q3: 0, pearsonSkew: 0 };
    
    const cleanedData = cleanData(data);
    if (cleanedData.length === 0) return { mean: 0, median: 0, std: 0, skewness: 0, q1: 0, q3: 0, pearsonSkew: 0 };
    
    const mean = jStat.mean(cleanedData);
    const median = jStat.median(cleanedData);
    const std = jStat.stdev(cleanedData);
    
    // Calculate moment-based skewness (Fisher-Pearson coefficient)
    const n = cleanedData.length;
    let skewness = 0;
    let pearsonSkew = 0;
    
    if (n >= 3 && std > 0) {
      // Adjusted Fisher-Pearson for sample skewness
      const m3 = cleanedData.reduce((sum, x) => sum + Math.pow(x - mean, 3), 0) / n;
      const m2 = cleanedData.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
      
      if (m2 > 0) {
        const g1 = m3 / Math.pow(m2, 1.5);
        // Apply finite sample correction
        skewness = Math.sqrt(n * (n - 1)) / (n - 2) * g1;
        
        // Pearson's second skewness coefficient
        pearsonSkew = 3 * (mean - median) / std;
      }
    }
    
    // Quartiles for boxplot
    const sorted = [...cleanedData].sort((a, b) => a - b);
    const q1 = jStat.percentile(sorted, 0.25);
    const q3 = jStat.percentile(sorted, 0.75);
    
    return { mean, median, std, skewness, q1, q3, pearsonSkew };
  };
  
  const stats = calculateStats(data);
  
  // Main histogram visualization
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 500;
    const margin = { top: 40, right: 40, bottom: showOverlays.boxplot ? 120 : 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Dark background - matching ExpectationVariance
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
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
      .thresholds(xScale.ticks(numBins));
    
    const bins = histogram(data);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([innerHeight, 0]);
    
    // Grid lines - matching ExpectationVariance style
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
    
    // Draw histogram bars with hover effects
    const barGroup = g.append("g");
    
    const bars = barGroup.selectAll("rect")
      .data(bins)
      .enter().append("rect")
      .attr("x", d => xScale(d.x0))
      .attr("y", innerHeight)
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr("height", 0)
      .attr("fill", colorScheme.chart.primary)
      .attr("opacity", 0.8)
      .attr("rx", 4) // Rounded corners
      .style("cursor", "pointer")
      .transition()
      .duration(300)
      .attr("y", d => yScale(d.length))
      .attr("height", d => innerHeight - yScale(d.length));
    
    // Hover effects
    barGroup.selectAll("rect")
      .on("mouseover", function(event, d) { 
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 1)
          .attr("fill", colorScheme.chart.primaryLight);
          
        // Show tooltip with bin info
        const tooltip = g.append("g")
          .attr("class", "tooltip");
          
        const x = xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2;
        const y = yScale(d.length) - 10;
        
        const rect = tooltip.append("rect")
          .attr("x", x - 30)
          .attr("y", y - 20)
          .attr("width", 60)
          .attr("height", 20)
          .attr("fill", "#1a1a1a")
          .attr("stroke", colors.chart.grid)
          .attr("rx", 3);
          
        tooltip.append("text")
          .attr("x", x)
          .attr("y", y - 5)
          .attr("text-anchor", "middle")
          .attr("fill", colors.chart.text)
          .attr("font-size", "11px")
          .text(`n=${d.length}`);
      })
      .on("mouseout", function(event, d) { 
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 0.8)
          .attr("fill", colorScheme.chart.primary);
          
        g.selectAll(".tooltip").remove();
      });
    
    // Draw theoretical PDF overlay if enabled
    if (showOverlays.pdf && distributionType !== 'skewed') {
      const pdfPoints = [];
      const step = (xScale.domain()[1] - xScale.domain()[0]) / 200;
      
      for (let x = xScale.domain()[0]; x <= xScale.domain()[1]; x += step) {
        let y = 0;
        switch (distributionType) {
          case 'normal':
            y = jStat.normal.pdf(x, normalParams.mean, normalParams.std);
            break;
          case 'uniform':
            y = (x >= -3 && x <= 3) ? 1/6 : 0;
            break;
          case 'exponential':
            y = x >= 0 ? jStat.exponential.pdf(x, exponentialParams.rate) : 0;
            break;
        }
        pdfPoints.push({ x, y });
      }
      
      // Correctly scale PDF to match histogram area
      // The histogram shows counts, so we need to scale the PDF by:
      // (number of observations) * (bin width)
      const actualBinWidth = bins.length > 0 ? bins[0].x1 - bins[0].x0 : 1;
      const totalArea = data.length * actualBinWidth;
      
      // Find max PDF value for scaling
      const maxPDF = d3.max(pdfPoints, d => d.y);
      const maxBinHeight = d3.max(bins, d => d.length);
      
      if (maxPDF > 0) {
        const line = d3.line()
          .x(d => xScale(d.x))
          .y(d => {
            // Scale PDF to match histogram height
            const scaledY = (d.y * totalArea) / numBins;
            return yScale(scaledY);
          })
          .curve(d3.curveMonotoneX);
        
        g.append("path")
          .datum(pdfPoints)
          .attr("fill", "none")
          .attr("stroke", colorScheme.chart.tertiary)
          .attr("stroke-width", 2)
          .attr("d", line)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .attr("opacity", 0.8);
      }
    }
    
    // Draw mean and median lines if enabled
    if (showOverlays.meanMedian) {
      // Mean line
      g.append("line")
        .attr("x1", xScale(stats.mean))
        .attr("x2", xScale(stats.mean))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .attr("opacity", 0.8);
      
      // Median line
      g.append("line")
        .attr("x1", xScale(stats.median))
        .attr("x2", xScale(stats.median))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .attr("opacity", 0.8);
      
      // Labels with overlap prevention
      const meanX = xScale(stats.mean);
      const medianX = xScale(stats.median);
      const labelDistance = Math.abs(meanX - medianX);
      
      if (labelDistance < 80) {
        // Labels would overlap, stagger them
        const avgX = (meanX + medianX) / 2;
        g.append("text")
          .attr("x", avgX)
          .attr("y", -10)
          .attr("text-anchor", "middle")
          .attr("fill", colorScheme.chart.primary)
          .style("font-size", "11px")
          .style("font-weight", "600")
          .text(`Mean: ${stats.mean.toFixed(2)}, Median: ${stats.median.toFixed(2)}`);
      } else {
        // Labels won't overlap, show normally
        g.append("text")
          .attr("x", meanX)
          .attr("y", -10)
          .attr("text-anchor", "middle")
          .attr("fill", colorScheme.chart.primary)
          .style("font-size", "12px")
          .style("font-weight", "600")
          .text(`Mean: ${stats.mean.toFixed(2)}`);
        
        g.append("text")
          .attr("x", medianX)
          .attr("y", -10)
          .attr("text-anchor", "middle")
          .attr("fill", colorScheme.chart.secondary)
          .style("font-size", "12px")
          .style("font-weight", "600")
          .text(`Median: ${stats.median.toFixed(2)}`);
      }
    }
    
    // Draw boxplot if enabled
    if (showOverlays.boxplot) {
      const boxplotY = innerHeight + 40;
      const boxHeight = 30;
      
      const boxplotG = g.append("g")
        .attr("transform", `translate(0, ${boxplotY})`);
      
      // Calculate IQR and outlier boundaries
      const iqr = stats.q3 - stats.q1;
      const lowerFence = stats.q1 - 1.5 * iqr;
      const upperFence = stats.q3 + 1.5 * iqr;
      
      // Separate outliers from whisker data
      const outliers = cleanData(data).filter(d => d < lowerFence || d > upperFence);
      const whiskerData = cleanData(data).filter(d => d >= lowerFence && d <= upperFence);
      const whiskerMin = whiskerData.length > 0 ? Math.min(...whiskerData) : stats.q1;
      const whiskerMax = whiskerData.length > 0 ? Math.max(...whiskerData) : stats.q3;
      
      // Box
      boxplotG.append("rect")
        .attr("x", xScale(stats.q1))
        .attr("y", 0)
        .attr("width", xScale(stats.q3) - xScale(stats.q1))
        .attr("height", boxHeight)
        .attr("fill", colorScheme.chart.secondary)
        .attr("opacity", 0.3)
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 2);
      
      // Median line in box
      boxplotG.append("line")
        .attr("x1", xScale(stats.median))
        .attr("x2", xScale(stats.median))
        .attr("y1", 0)
        .attr("y2", boxHeight)
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 3);
      
      // Left whisker (to lower fence or min non-outlier)
      boxplotG.append("line")
        .attr("x1", xScale(whiskerMin))
        .attr("x2", xScale(stats.q1))
        .attr("y1", boxHeight / 2)
        .attr("y2", boxHeight / 2)
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 2);
      
      // Right whisker (to upper fence or max non-outlier)
      boxplotG.append("line")
        .attr("x1", xScale(stats.q3))
        .attr("x2", xScale(whiskerMax))
        .attr("y1", boxHeight / 2)
        .attr("y2", boxHeight / 2)
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 2);
      
      // Whisker ends
      [whiskerMin, whiskerMax].forEach(val => {
        boxplotG.append("line")
          .attr("x1", xScale(val))
          .attr("x2", xScale(val))
          .attr("y1", boxHeight * 0.25)
          .attr("y2", boxHeight * 0.75)
          .attr("stroke", colorScheme.chart.secondary)
          .attr("stroke-width", 2);
      });
      
      // Draw outliers
      if (outliers.length > 0 && highlightOutliers) {
        boxplotG.selectAll("circle.outlier")
          .data(outliers)
          .enter()
          .append("circle")
          .attr("class", "outlier")
          .attr("cx", d => xScale(d))
          .attr("cy", boxHeight / 2)
          .attr("r", 3)
          .attr("fill", "none")
          .attr("stroke", colorScheme.chart.tertiary)
          .attr("stroke-width", 1.5);
      }
    }
    
    // X axis - matching ExpectationVariance style
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "11px");
    
    // Y axis - matching ExpectationVariance style
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(5));
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "11px");
    
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
      .text("Frequency");
    
  }, [data, numBins, showOverlays, distributionType, normalParams, exponentialParams, stats]);
  
  // Enhanced Skewness visual indicator
  const SkewnessIndicator = () => {
    const skew = stats.skewness;
    const maxSkew = 3;
    const normalizedSkew = Math.max(-1, Math.min(1, skew / maxSkew));
    
    return (
      <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
        <h5 className="text-sm font-semibold mb-3" style={{ color: colorScheme.chart.secondary }}>
          Distribution Shape Analysis
        </h5>
        
        {/* Visual skewness meter */}
        <div className="relative h-10 rounded-full overflow-hidden" style={{ backgroundColor: '#0a0a0a' }}>
          {/* Background gradient */}
          <div className="absolute inset-0 opacity-30">
            <div className="h-full w-full bg-gradient-to-r from-blue-600 via-green-500 to-orange-600"></div>
          </div>
          
          {/* Center line */}
          <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white opacity-50"></div>
          
          {/* Skewness indicator */}
          <div 
            className="absolute top-2 bottom-2 rounded-full transition-all duration-500 shadow-lg"
            style={{
              left: `${50 + normalizedSkew * 35}%`,
              width: '20px',
              transform: 'translateX(-50%)',
              backgroundColor: Math.abs(skew) < 0.5 ? '#10B981' : 
                             skew > 0 ? '#F97316' : '#3B82F6',
              boxShadow: '0 0 10px rgba(255,255,255,0.3)'
            }}
          >
            <div className="absolute inset-0 rounded-full animate-pulse opacity-50"
                 style={{ backgroundColor: 'currentColor' }}></div>
          </div>
        </div>
        
        {/* Labels */}
        <div className="flex justify-between text-xs mt-2" style={{ color: colors.chart.text }}>
          <span style={{ color: '#3B82F6' }}>◄ Left</span>
          <span style={{ color: '#10B981' }}>Symmetric</span>
          <span style={{ color: '#F97316' }}>Right ►</span>
        </div>
        
        {/* Current value display */}
        <div className="mt-4 p-2 rounded" style={{ backgroundColor: '#0a0a0a' }}>
          <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: colors.chart.text }}>
              Skewness (γ₁):
            </span>
            <span className={cn(
              "text-sm font-mono font-semibold",
              Math.abs(skew) < 0.5 ? "text-green-400" :
              skew > 0 ? "text-orange-400" : "text-blue-400"
            )}>
              {skew.toFixed(3)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs" style={{ color: colors.chart.text }}>
              Classification:
            </span>
            <span className={cn(
              "text-xs font-semibold",
              Math.abs(skew) < 0.5 ? "text-green-400" :
              skew > 0 ? "text-orange-400" : "text-blue-400"
            )}>
              {Math.abs(skew) < 0.5 ? "Symmetric" :
               skew > 0 ? "Right-Skewed" : "Left-Skewed"}
            </span>
          </div>
          {stats.pearsonSkew !== undefined && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs" style={{ color: colors.chart.text }}>
                Pearson's 2nd:
              </span>
              <span className="text-xs font-mono" style={{ color: colors.chart.text }}>
                {stats.pearsonSkew.toFixed(3)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <VisualizationContainer title="Histogram and Skewness Explorer" className="p-2">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Explore how histograms represent data distributions and learn to identify 
              different shapes: symmetric, right-skewed, and left-skewed. Observe how 
              bin width and sample size affect visualization.
            </p>
          </VisualizationSection>
          
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Distribution Controls</h4>
            
            <ControlGroup label="Distribution Type">
              <select
                value={distributionType}
                onChange={(e) => {
                  setDistributionType(e.target.value);
                  setInteractionCount(prev => prev + 1);
                }}
                className={cn(components.select, "w-full")}
              >
                <option value="normal">Normal</option>
                <option value="uniform">Uniform</option>
                <option value="exponential">Exponential</option>
                <option value="skewed">Custom Skewed</option>
              </select>
            </ControlGroup>
            
            {distributionType === 'normal' && (
              <>
                <ControlGroup label="Mean">
                  <RangeSlider
                    min={-3}
                    max={3}
                    step={0.1}
                    value={normalParams.mean}
                    onChange={(value) => setNormalParams({...normalParams, mean: value})}
                  />
                </ControlGroup>
                <ControlGroup label="Standard Deviation">
                  <RangeSlider
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={normalParams.std}
                    onChange={(value) => setNormalParams({...normalParams, std: value})}
                  />
                </ControlGroup>
              </>
            )}
            
            {distributionType === 'exponential' && (
              <ControlGroup label="Rate (λ)">
                <RangeSlider
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={exponentialParams.rate}
                  onChange={(value) => setExponentialParams({...exponentialParams, rate: value})}
                />
              </ControlGroup>
            )}
            
            {distributionType === 'skewed' && (
              <ControlGroup label="Skewness Degree">
                <RangeSlider
                  min={-2}
                  max={2}
                  step={0.1}
                  value={skewParams.degree}
                  onChange={(value) => setSkewParams({...skewParams, degree: value})}
                />
                <div className="text-xs text-neutral-400 mt-1">
                  {skewParams.degree < -0.5 ? "Left-skewed" :
                   skewParams.degree > 0.5 ? "Right-skewed" : "Approximately symmetric"}
                </div>
              </ControlGroup>
            )}
            
            <ControlGroup label="Bin Selection Method">
              <select
                value={binAlgorithm}
                onChange={(e) => {
                  setBinAlgorithm(e.target.value);
                  if (e.target.value !== 'manual' && data.length > 0) {
                    // Auto-calculate bins
                    const newBins = binAlgorithms[e.target.value](data);
                    setNumBins(newBins);
                  }
                  setInteractionCount(prev => prev + 1);
                }}
                className={cn(components.select, "w-full mb-2")}
              >
                <option value="manual">Manual</option>
                <option value="sturges">Sturges' Rule</option>
                <option value="scott">Scott's Rule</option>
                <option value="freedmanDiaconis">Freedman-Diaconis</option>
              </select>
            </ControlGroup>
            
            <ControlGroup label={`Number of Bins${binAlgorithm !== 'manual' ? ' (Auto)' : ''}`}>
              <RangeSlider
                min={5}
                max={50}
                step={1}
                value={numBins}
                onChange={(value) => {
                  setNumBins(value);
                  setBinAlgorithm('manual'); // Switch to manual when user adjusts
                  setInteractionCount(prev => prev + 1);
                }}
                disabled={binAlgorithm !== 'manual'}
              />
            </ControlGroup>
            
            <ControlGroup label="Sample Size">
              <RangeSlider
                min={50}
                max={1000}
                step={50}
                value={sampleSize}
                onChange={(value) => setSampleSize(value)}
              />
            </ControlGroup>
            
            <button
              onClick={generateData}
              className={cn(components.button.base, components.button.primary, "w-full")}
            >
              Generate New Data
            </button>
          </VisualizationSection>
          
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Preset Scenarios</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setDistributionType('normal');
                  setNormalParams({ mean: 0, std: 1 });
                  setNumBins(20);
                  generateData();
                }}
                className={cn(components.button.base, components.button.secondary, "w-full text-xs")}
              >
                Standard Normal (Symmetric)
              </button>
              <button
                onClick={() => {
                  setDistributionType('skewed');
                  setSkewParams({ degree: 1.5 });
                  setNumBins(25);
                  generateData();
                }}
                className={cn(components.button.base, components.button.secondary, "w-full text-xs")}
              >
                Income Distribution (Right-Skewed)
              </button>
              <button
                onClick={() => {
                  setDistributionType('skewed');
                  setSkewParams({ degree: -1.5 });
                  setNumBins(25);
                  generateData();
                }}
                className={cn(components.button.base, components.button.secondary, "w-full text-xs")}
              >
                Test Scores (Left-Skewed)
              </button>
              <button
                onClick={() => {
                  setDistributionType('exponential');
                  setExponentialParams({ rate: 2 });
                  setNumBins(30);
                  generateData();
                }}
                className={cn(components.button.base, components.button.secondary, "w-full text-xs")}
              >
                Wait Times (Exponential)
              </button>
            </div>
          </VisualizationSection>
          
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Overlay Options</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showOverlays.pdf}
                  onChange={(e) => setShowOverlays({...showOverlays, pdf: e.target.checked})}
                  className="rounded"
                />
                <span className="text-neutral-300">Theoretical PDF/PMF</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showOverlays.boxplot}
                  onChange={(e) => setShowOverlays({...showOverlays, boxplot: e.target.checked})}
                  className="rounded"
                />
                <span className="text-neutral-300">Boxplot</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showOverlays.meanMedian}
                  onChange={(e) => setShowOverlays({...showOverlays, meanMedian: e.target.checked})}
                  className="rounded"
                />
                <span className="text-neutral-300">Mean & Median Lines</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={highlightOutliers}
                  onChange={(e) => setHighlightOutliers(e.target.checked)}
                  className="rounded"
                />
                <span className="text-neutral-300">Highlight Outliers</span>
              </label>
            </div>
          </VisualizationSection>
          
          {/* Current Statistics - Enhanced styling */}
          <VisualizationSection className="p-3" style={{ backgroundColor: '#1a1a1a' }}>
            <h4 className="text-base font-bold mb-3" style={{ color: colorScheme.chart.secondary }}>
              Distribution Statistics
            </h4>
            <div className="space-y-3">
              {/* Sample info box */}
              <div className="p-2 rounded" style={{ backgroundColor: '#0a0a0a' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: colors.chart.text }}>Sample Size</span>
                  <span className="font-mono text-sm font-semibold" style={{ color: colorScheme.chart.primary }}>
                    n = {data.length}
                  </span>
                </div>
              </div>
              
              {/* Central tendency measures */}
              <div className="p-2 rounded space-y-2" style={{ backgroundColor: '#0a0a0a' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: colorScheme.chart.tertiary }}>
                  Central Tendency
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorScheme.chart.primary }}></span>
                    <span style={{ color: colors.chart.text }}>Mean (μ)</span>
                  </span>
                  <span className="font-mono text-sm" style={{ color: colorScheme.chart.primary }}>
                    {stats.mean.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorScheme.chart.secondary }}></span>
                    <span style={{ color: colors.chart.text }}>Median (M)</span>
                  </span>
                  <span className="font-mono text-sm" style={{ color: colorScheme.chart.secondary }}>
                    {stats.median.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t" style={{ borderColor: '#2a2a2a' }}>
                  <span className="text-xs" style={{ color: colors.chart.text }}>Difference</span>
                  <span className={cn(
                    "font-mono text-xs",
                    Math.abs(stats.mean - stats.median) < 0.1 ? "text-green-400" : "text-yellow-400"
                  )}>
                    Δ = {Math.abs(stats.mean - stats.median).toFixed(3)}
                  </span>
                </div>
              </div>
              
              {/* Spread measures */}
              <div className="p-2 rounded space-y-2" style={{ backgroundColor: '#0a0a0a' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: colorScheme.chart.tertiary }}>
                  Spread
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: colors.chart.text }}>Std Dev (σ)</span>
                  <span className="font-mono text-sm" style={{ color: colors.chart.text }}>
                    {stats.std.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: colors.chart.text }}>IQR</span>
                  <span className="font-mono text-sm" style={{ color: colors.chart.text }}>
                    {(stats.q3 - stats.q1).toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
            
            <SkewnessIndicator />
          </VisualizationSection>
          
          {/* Learning Progress */}
          <VisualizationSection className="p-3">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Learning Progress</h4>
            
            <ProgressTracker 
              current={interactionCount} 
              goal={30} 
              label="Distribution Explorations"
              color="purple"
            />
            
            <div className="space-y-2 text-xs text-neutral-300 mt-3">
              {interactionCount === 0 && (
                <div>
                  <p>🎯 Ready to explore histograms and data shapes?</p>
                  <p className="text-purple-300 mt-1">
                    Start by generating different distributions and adjusting the number of bins!
                  </p>
                </div>
              )}
              {interactionCount > 0 && interactionCount < 5 && (
                <div>
                  <p>📊 Great start! Notice how the histogram shape changes.</p>
                  <p className="text-purple-300 mt-1">
                    Try different bin numbers to see how it affects the apparent shape. Too few bins hide details, too many create noise!
                  </p>
                </div>
              )}
              {interactionCount >= 5 && interactionCount < 15 && (
                <div>
                  <p>🎓 Key insight: Bin selection matters!</p>
                  <p className="text-purple-300 mt-1">
                    Compare mean vs median positions:<br/>
                    • Right-skewed: mean &gt; median<br/>
                    • Left-skewed: mean &lt; median<br/>
                    • Symmetric: mean ≈ median
                  </p>
                </div>
              )}
              {interactionCount >= 15 && interactionCount < 30 && (
                <div>
                  <p>🔍 Explore the effect of sample size!</p>
                  <p className="text-purple-300 mt-1">
                    Small samples may not reveal the true distribution shape. Increase sample size to see clearer patterns emerge.
                  </p>
                  <div className="mt-2 p-2 bg-purple-900/20 border border-purple-600/30 rounded">
                    <div className="text-xs text-purple-300">
                      🎯 Goal: Reach {30 - interactionCount} more exploration{30 - interactionCount !== 1 ? 's' : ''} to master histogram interpretation!
                    </div>
                    <div className="mt-1.5">
                      <div className="w-full bg-purple-900/30 rounded-full h-1.5">
                        <div 
                          className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${(interactionCount / 30) * 100}%` }}
                        />
                      </div>
                      <div className="text-center mt-1 text-purple-400 font-mono" style={{ fontSize: '10px' }}>
                        {interactionCount}/30
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {interactionCount >= 30 && (
                <div>
                  <p className="text-green-400 font-semibold mb-1">
                    ✨ Histogram Expert! {interactionCount} explorations completed.
                  </p>
                  <p>You've mastered histogram interpretation and skewness detection!</p>
                  <p className="text-purple-300 mt-1">
                    Challenge: Can you create a distribution where changing bins dramatically changes the apparent skewness?
                  </p>
                </div>
              )}
            </div>
          </VisualizationSection>
          
          {/* Error/Variability Zone */}
          <VisualizationSection className="p-3 border-2 border-yellow-600/30 bg-yellow-900/10">
            <h4 className="text-sm font-semibold text-yellow-400 mb-2">⚠️ Visualization Pitfalls</h4>
            <div className="space-y-2 text-xs text-yellow-300">
              <p>
                <strong>Bin Width Effect:</strong> {numBins < 10 ? 
                  "Too few bins! Details are hidden." : 
                  numBins > 30 ? "Too many bins! Creating artificial patterns." : 
                  "Good bin choice for this data size."}
              </p>
              <p>
                <strong>Sample Size Effect:</strong> {sampleSize < 100 ? 
                  "Small sample may not represent true distribution." : 
                  sampleSize < 500 ? "Moderate sample size. Shape becoming clearer." : 
                  "Large sample reveals true distribution shape."}
              </p>
              <p className="text-yellow-200 font-semibold mt-2">
                Remember: Always consider both bin width and sample size when interpreting histograms!
              </p>
            </div>
          </VisualizationSection>
        </div>
        
        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3 space-y-4">
          <GraphContainer height={showOverlays.boxplot ? "600px" : "550px"} title="Histogram Visualization">
            <svg ref={svgRef} style={{ width: "100%", height: showOverlays.boxplot ? 550 : 500 }} />
          </GraphContainer>
          
          {data.length > 0 && (
            <HistogramWorkedExample 
              data={data}
              numBins={numBins}
              mean={stats.mean}
              median={stats.median}
              skewness={stats.skewness}
            />
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default HistogramShapeExplorer;