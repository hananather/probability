"use client";
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup,
  StatsDisplay
} from '../ui/VisualizationContainer';
import { RangeSlider, SliderPresets } from '../ui/RangeSlider';
import { cn } from '../../lib/design-system';
import {
  distributionConfig,
  getSupportRange,
  calculatePMFData,
  calculateCDFData,
  calculateRangeProbability
} from '../../utils/distributions';

// Distribution types with enhanced visual configuration
const DISTRIBUTIONS = {
  binomial: { 
    name: 'Binomial',
    color: '#06b6d4', // cyan-500
    colorDark: '#0891b2', // cyan-600
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    params: { n: 10, p: 0.5 }
  },
  geometric: { 
    name: 'Geometric',
    color: '#f97316', // orange-500
    colorDark: '#ea580c', // orange-600
    gradient: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
    params: { p: 0.3 }
  },
  negativeBinomial: { 
    name: 'Negative Binomial',
    color: '#8b5cf6', // violet-600
    colorDark: '#7c3aed', // violet-700
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    params: { r: 3, p: 0.3 }
  },
  poisson: { 
    name: 'Poisson',
    color: '#10b981', // emerald-500
    colorDark: '#059669', // emerald-600
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    params: { lambda: 3 }
  }
};

// Distribution selector component
const DistributionSelector = React.memo(({ value, onChange, label, position }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Object.entries(DISTRIBUTIONS).map(([key, dist]) => (
          <option key={key} value={key}>{dist.name}</option>
        ))}
      </select>
    </div>
  );
});

DistributionSelector.displayName = 'DistributionSelector';

// Parameter controls for each distribution
const ParameterControls = React.memo(({ type, params, onChange, color }) => {
  const handleParamChange = useCallback((param, value) => {
    onChange({ ...params, [param]: value });
  }, [params, onChange]);
  
  switch (type) {
    case 'binomial':
      return (
        <>
          <ControlGroup>
            <RangeSlider
              label="Number of trials (n)"
              value={params.n}
              onChange={(v) => handleParamChange('n', v)}
              min={1}
              max={50}
              step={1}
              formatValue={v => v}
            />
          </ControlGroup>
          <ControlGroup>
            <RangeSlider
              label="Success probability (p)"
              value={params.p}
              onChange={(v) => handleParamChange('p', v)}
              {...SliderPresets.probability}
            />
          </ControlGroup>
        </>
      );
      
    case 'geometric':
      return (
        <ControlGroup>
          <RangeSlider
            label="Success probability (p)"
            value={params.p}
            onChange={(v) => handleParamChange('p', v)}
            {...SliderPresets.probability}
          />
        </ControlGroup>
      );
      
    case 'negativeBinomial':
      return (
        <>
          <ControlGroup>
            <RangeSlider
              label="Number of successes (r)"
              value={params.r}
              onChange={(v) => handleParamChange('r', v)}
              min={1}
              max={10}
              step={1}
              formatValue={v => v}
            />
          </ControlGroup>
          <ControlGroup>
            <RangeSlider
              label="Success probability (p)"
              value={params.p}
              onChange={(v) => handleParamChange('p', v)}
              {...SliderPresets.probability}
            />
          </ControlGroup>
        </>
      );
      
    case 'poisson':
      return (
        <ControlGroup>
          <RangeSlider
            label="Rate parameter (λ)"
            value={params.lambda}
            onChange={(v) => handleParamChange('lambda', v)}
            min={0.1}
            max={10}
            step={0.1}
            formatValue={v => v.toFixed(1)}
          />
        </ControlGroup>
      );
      
    default:
      return null;
  }
});

ParameterControls.displayName = 'ParameterControls';

// PMF comparison chart
const ComparisonChart = React.memo(({ leftDist, rightDist, leftParams, rightParams, showCDF }) => {
  const svgRef = useRef(null);
  
  // Memoize data calculation
  const chartData = useMemo(() => {
    const leftRange = getSupportRange(leftDist, leftParams);
    const rightRange = getSupportRange(rightDist, rightParams);
    const xMin = Math.min(leftRange.min, rightRange.min);
    const xMax = Math.max(leftRange.max, rightRange.max);
    
    const pmfData = [];
    const cdfData = [];
    
    for (let k = xMin; k <= xMax; k++) {
      const leftPMF = distributionConfig[leftDist].pmf(k, ...distributionConfig[leftDist].paramNames.map(p => leftParams[p]));
      const rightPMF = distributionConfig[rightDist].pmf(k, ...distributionConfig[rightDist].paramNames.map(p => rightParams[p]));
      
      pmfData.push({
        k,
        left: leftPMF,
        right: rightPMF
      });
      
      if (showCDF) {
        const leftCDF = distributionConfig[leftDist].cdf(k, ...distributionConfig[leftDist].paramNames.map(p => leftParams[p]));
        const rightCDF = distributionConfig[rightDist].cdf(k, ...distributionConfig[rightDist].paramNames.map(p => rightParams[p]));
        
        cdfData.push({
          k,
          left: leftCDF,
          right: rightCDF
        });
      }
    }
    
    return { pmfData, cdfData, xMin, xMax };
  }, [leftDist, rightDist, leftParams, rightParams, showCDF]);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 400;
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
    
    const { pmfData, cdfData } = chartData;
    
    // Scales
    const x = d3.scaleBand()
      .domain(pmfData.map(d => d.k))
      .range([0, innerWidth])
      .padding(0.1);
    
    const yPMF = d3.scaleLinear()
      .domain([0, Math.max(d3.max(pmfData, d => Math.max(d.left, d.right))) * 1.1])
      .range([innerHeight, 0])
      .nice();
    
    const yCDF = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(showCDF ? yCDF : yPMF)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", "#374151");
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x)
        .tickValues(x.domain().filter((d, i) => 
          i % Math.ceil(pmfData.length / 20) === 0
        ))
      );
    
    xAxis.selectAll("path, line").attr("stroke", "#374151");
    xAxis.selectAll("text")
      .attr("fill", "#ffffff")
      .style("font-size", "12px");
    
    // X axis label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + margin.bottom - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .attr("fill", "#ffffff")
      .text("k");
    
    // Y axis
    const yAxis = g.append("g")
      .call(d3.axisLeft(showCDF ? yCDF : yPMF)
        .tickFormat(d => d.toFixed(showCDF ? 2 : 3)));
    
    yAxis.selectAll("path, line").attr("stroke", "#374151");
    yAxis.selectAll("text")
      .attr("fill", "#ffffff")
      .style("font-size", "12px");
    
    // Y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .attr("fill", "#ffffff")
      .text(showCDF ? "P(X ≤ k)" : "P(X = k)");
    
    // Bar width for side-by-side bars
    const barWidth = x.bandwidth() / 2;
    
    if (!showCDF) {
      // PMF bars
      g.selectAll(".left-bar")
        .data(pmfData)
        .enter().append("rect")
        .attr("class", "left-bar")
        .attr("x", d => x(d.k))
        .attr("y", d => yPMF(d.left))
        .attr("width", barWidth - 1)
        .attr("height", d => innerHeight - yPMF(d.left))
        .attr("fill", DISTRIBUTIONS[leftDist].color)
        .attr("opacity", 0.85)
        .attr("rx", 3)
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
      
      g.selectAll(".right-bar")
        .data(pmfData)
        .enter().append("rect")
        .attr("class", "right-bar")
        .attr("x", d => x(d.k) + barWidth + 1)
        .attr("y", d => yPMF(d.right))
        .attr("width", barWidth - 1)
        .attr("height", d => innerHeight - yPMF(d.right))
        .attr("fill", DISTRIBUTIONS[rightDist].color)
        .attr("opacity", 0.85)
        .attr("rx", 3)
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
    } else {
      // CDF step functions
      const lineLeft = d3.line()
        .x(d => x(d.k) + x.bandwidth() / 4)
        .y(d => yCDF(d.left))
        .curve(d3.curveStepAfter);
      
      const lineRight = d3.line()
        .x(d => x(d.k) + 3 * x.bandwidth() / 4)
        .y(d => yCDF(d.right))
        .curve(d3.curveStepAfter);
      
      g.append("path")
        .datum(cdfData)
        .attr("fill", "none")
        .attr("stroke", DISTRIBUTIONS[leftDist].color)
        .attr("stroke-width", 2.5)
        .attr("d", lineLeft);
      
      g.append("path")
        .datum(cdfData)
        .attr("fill", "none")
        .attr("stroke", DISTRIBUTIONS[rightDist].color)
        .attr("stroke-width", 2.5)
        .attr("d", lineRight);
    }
    
    // Add hover effects
    const tooltip = g.append("g")
      .attr("class", "tooltip")
      .style("display", "none");
    
    const tooltipRect = tooltip.append("rect")
      .attr("fill", "#1f2937")
      .attr("stroke", "#374151")
      .attr("rx", 4);
    
    const tooltipText = tooltip.append("text")
      .attr("fill", "white")
      .style("font-size", "12px")
      .style("text-anchor", "middle");
    
    // Enhanced hover interactions
    g.selectAll(".hover-area")
      .data(pmfData)
      .enter().append("rect")
      .attr("class", "hover-area")
      .attr("x", d => x(d.k))
      .attr("y", 0)
      .attr("width", x.bandwidth())
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        // Highlight bars
        g.selectAll(".left-bar")
          .filter(bar => bar.k === d.k)
          .transition()
          .duration(150)
          .attr("opacity", 1)
          .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.5)) brightness(1.1)");
        
        g.selectAll(".right-bar")
          .filter(bar => bar.k === d.k)
          .transition()
          .duration(150)
          .attr("opacity", 1)
          .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.5)) brightness(1.1)");
        tooltip.style("display", null);
        
        let text;
        if (showCDF) {
          const leftCDF = cdfData.find(cd => cd.k === d.k).left;
          const rightCDF = cdfData.find(cd => cd.k === d.k).right;
          text = `k=${d.k}\n${DISTRIBUTIONS[leftDist].name} CDF: ${leftCDF.toFixed(4)}\n${DISTRIBUTIONS[rightDist].name} CDF: ${rightCDF.toFixed(4)}`;
        } else {
          text = `k=${d.k}\n${DISTRIBUTIONS[leftDist].name}: ${d.left.toFixed(4)}\n${DISTRIBUTIONS[rightDist].name}: ${d.right.toFixed(4)}`;
        }
        
        tooltipText.text("");
        
        const lines = text.split('\n');
        lines.forEach((line, i) => {
          tooltipText.append("tspan")
            .attr("x", 0)
            .attr("dy", i === 0 ? 0 : "1.2em")
            .text(line);
        });
        
        const bbox = tooltipText.node().getBBox();
        tooltipRect
          .attr("x", bbox.x - 10)
          .attr("y", bbox.y - 5)
          .attr("width", bbox.width + 20)
          .attr("height", bbox.height + 10);
        
        const yPos = showCDF ? 
          Math.min(yCDF(cdfData.find(cd => cd.k === d.k).left), yCDF(cdfData.find(cd => cd.k === d.k).right)) - 40 :
          Math.max(yPMF(d.left), yPMF(d.right)) - 40;
        
        tooltip.attr("transform", `translate(${x(d.k) + x.bandwidth() / 2}, ${Math.max(yPos, 20)})`);
      })
      .on("mouseout", function() {
        // Restore bar opacity
        g.selectAll(".left-bar")
          .transition()
          .duration(150)
          .attr("opacity", 0.85)
          .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
        
        g.selectAll(".right-bar")
          .transition()
          .duration(150)
          .attr("opacity", 0.85)
          .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
        
        tooltip.style("display", "none");
      });
    
    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 150}, 10)`);
    
    // Enhanced legend with gradient fills
    const legendBg = legend.append("rect")
      .attr("x", -10)
      .attr("y", -5)
      .attr("width", 160)
      .attr("height", 45)
      .attr("rx", 4)
      .attr("fill", "#1f2937")
      .attr("opacity", 0.9);
    
    // Left distribution legend
    legend.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", DISTRIBUTIONS[leftDist].color)
      .attr("opacity", 0.9)
      .attr("rx", 3)
      .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.3))");
    
    legend.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .attr("fill", "#ffffff")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text(DISTRIBUTIONS[leftDist].name);
    
    // Right distribution legend
    legend.append("rect")
      .attr("y", 20)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", DISTRIBUTIONS[rightDist].color)
      .attr("opacity", 0.9)
      .attr("rx", 3)
      .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.3))");
    
    legend.append("text")
      .attr("x", 20)
      .attr("y", 32)
      .attr("fill", "#ffffff")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text(DISTRIBUTIONS[rightDist].name);
    
  }, [leftDist, rightDist, chartData, showCDF]);
  
  return <svg ref={svgRef} className="w-full" style={{ height: 400 }} />;
});

ComparisonChart.displayName = 'ComparisonChart';

// Probability calculator component
const ProbabilityCalculator = React.memo(({ leftDist, rightDist, leftParams, rightParams }) => {
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(5);
  
  // Calculate range probabilities
  const leftProb = useMemo(() => 
    calculateRangeProbability(leftDist, leftParams, rangeStart, rangeEnd),
    [leftDist, leftParams, rangeStart, rangeEnd]
  );
  
  const rightProb = useMemo(() => 
    calculateRangeProbability(rightDist, rightParams, rangeStart, rangeEnd),
    [rightDist, rightParams, rangeStart, rangeEnd]
  );
  
  return (
    <VisualizationSection className="p-4">
      <h3 className="text-lg font-semibold mb-4">Probability Calculator</h3>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <ControlGroup>
          <RangeSlider
            label="Range Start"
            value={rangeStart}
            onChange={setRangeStart}
            min={0}
            max={20}
            step={1}
            formatValue={v => v}
          />
        </ControlGroup>
        <ControlGroup>
          <RangeSlider
            label="Range End"
            value={rangeEnd}
            onChange={setRangeEnd}
            min={0}
            max={20}
            step={1}
            formatValue={v => v}
          />
        </ControlGroup>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-400 mb-3">
          P({rangeStart} ≤ X ≤ {rangeEnd})
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: DISTRIBUTIONS[leftDist].color }}>
              {DISTRIBUTIONS[leftDist].name}
            </p>
            <p className="text-2xl font-mono">{leftProb.toFixed(4)}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: DISTRIBUTIONS[rightDist].color }}>
              {DISTRIBUTIONS[rightDist].name}
            </p>
            <p className="text-2xl font-mono">{rightProb.toFixed(4)}</p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

ProbabilityCalculator.displayName = 'ProbabilityCalculator';

// Main component
const DistributionComparison = React.memo(function DistributionComparison() {
  const [leftDist, setLeftDist] = useState('binomial');
  const [rightDist, setRightDist] = useState('poisson');
  const [leftParams, setLeftParams] = useState(DISTRIBUTIONS.binomial.params);
  const [rightParams, setRightParams] = useState(DISTRIBUTIONS.poisson.params);
  const [showCDF, setShowCDF] = useState(false);
  
  // Calculate statistics using memoization
  const leftStats = useMemo(() => 
    distributionConfig[leftDist].stats(...distributionConfig[leftDist].paramNames.map(p => leftParams[p])),
    [leftDist, leftParams]
  );
  
  const rightStats = useMemo(() => 
    distributionConfig[rightDist].stats(...distributionConfig[rightDist].paramNames.map(p => rightParams[p])),
    [rightDist, rightParams]
  );
  
  // Check for special relationships
  const isGeometricCase = 
    (leftDist === 'negativeBinomial' && leftParams.r === 1) ||
    (rightDist === 'negativeBinomial' && rightParams.r === 1);
  
  const isPoissonApproximation = 
    ((leftDist === 'binomial' && rightDist === 'poisson') ||
     (leftDist === 'poisson' && rightDist === 'binomial')) &&
    ((leftDist === 'binomial' && leftParams.n > 20 && leftParams.p < 0.1) ||
     (rightDist === 'binomial' && rightParams.n > 20 && rightParams.p < 0.1));
  
  // Update parameters when distribution changes
  useEffect(() => {
    setLeftParams(DISTRIBUTIONS[leftDist].params);
  }, [leftDist]);
  
  useEffect(() => {
    setRightParams(DISTRIBUTIONS[rightDist].params);
  }, [rightDist]);
  
  return (
    <VisualizationContainer 
      title="Distribution Comparison"
      className="max-w-7xl"
    >
      {/* Special relationship alerts */}
      {isGeometricCase && (
        <div className="mb-4 p-3 bg-purple-900/30 border border-purple-700 rounded-lg">
          <p className="text-sm text-purple-300">
            <span className="font-semibold">Special Case:</span> Negative Binomial with r=1 is equivalent to the Geometric distribution
          </p>
        </div>
      )}
      
      {isPoissonApproximation && (
        <div className="mb-4 p-3 bg-emerald-900/30 border border-emerald-700 rounded-lg">
          <p className="text-sm text-emerald-300">
            <span className="font-semibold">Approximation:</span> For large n and small p, Binomial(n,p) ≈ Poisson(np)
          </p>
        </div>
      )}
      
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Left Distribution Controls */}
        <VisualizationSection 
          className="p-4"
          style={{ borderTop: `3px solid ${DISTRIBUTIONS[leftDist].color}` }}
        >
          <DistributionSelector
            value={leftDist}
            onChange={setLeftDist}
            label="Left Distribution"
            position="left"
          />
          
          <div className="mt-4 space-y-3">
            <ParameterControls
              type={leftDist}
              params={leftParams}
              onChange={setLeftParams}
              color={DISTRIBUTIONS[leftDist].color}
            />
          </div>
          
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <h4 className="text-sm font-semibold mb-2" style={{ color: DISTRIBUTIONS[leftDist].color }}>
              Statistics
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">E[X]:</span>
                <span className="font-mono text-white">{leftStats.mean.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Var[X]:</span>
                <span className="font-mono text-white">{leftStats.variance.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mode:</span>
                <span className="font-mono text-white">{leftStats.mode}</span>
              </div>
            </div>
          </div>
        </VisualizationSection>
        
        {/* Right Distribution Controls */}
        <VisualizationSection 
          className="p-4"
          style={{ borderTop: `3px solid ${DISTRIBUTIONS[rightDist].color}` }}
        >
          <DistributionSelector
            value={rightDist}
            onChange={setRightDist}
            label="Right Distribution"
            position="right"
          />
          
          <div className="mt-4 space-y-3">
            <ParameterControls
              type={rightDist}
              params={rightParams}
              onChange={setRightParams}
              color={DISTRIBUTIONS[rightDist].color}
            />
          </div>
          
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <h4 className="text-sm font-semibold mb-2" style={{ color: DISTRIBUTIONS[rightDist].color }}>
              Statistics
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">E[X]:</span>
                <span className="font-mono text-white">{rightStats.mean.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Var[X]:</span>
                <span className="font-mono text-white">{rightStats.variance.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mode:</span>
                <span className="font-mono text-white">{rightStats.mode}</span>
              </div>
            </div>
          </div>
        </VisualizationSection>
      </div>
      
      {/* Enhanced View Toggle */}
      <div className="mb-4 flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-700 p-1 bg-gradient-to-r from-gray-800 to-gray-900 shadow-md">
          <button
            className={cn(
              "px-5 py-2.5 text-sm font-medium rounded-md transition-all duration-300",
              !showCDF 
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            )}
            onClick={() => setShowCDF(false)}
          >
            PMF
          </button>
          <button
            className={cn(
              "px-5 py-2.5 text-sm font-medium rounded-md transition-all duration-300",
              showCDF 
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            )}
            onClick={() => setShowCDF(true)}
          >
            CDF
          </button>
        </div>
      </div>
      
      {/* Comparison Visualization */}
      <GraphContainer 
        title={showCDF ? "Cumulative Distribution Functions" : "Probability Mass Functions"}
        height="400px"
      >
        <ComparisonChart
          leftDist={leftDist}
          rightDist={rightDist}
          leftParams={leftParams}
          rightParams={rightParams}
          showCDF={showCDF}
        />
      </GraphContainer>
      
      {/* Probability Calculator */}
      <div className="mt-6">
        <ProbabilityCalculator
          leftDist={leftDist}
          rightDist={rightDist}
          leftParams={leftParams}
          rightParams={rightParams}
        />
      </div>
      
      {/* Statistics Comparison Table */}
      <VisualizationSection className="mt-6 p-4">
        <h3 className="text-lg font-semibold mb-4">Statistics Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-4 text-gray-400">Statistic</th>
                <th className="text-center py-2 px-4" style={{ color: DISTRIBUTIONS[leftDist].color }}>
                  {DISTRIBUTIONS[leftDist].name}
                </th>
                <th className="text-center py-2 px-4" style={{ color: DISTRIBUTIONS[rightDist].color }}>
                  {DISTRIBUTIONS[rightDist].name}
                </th>
                <th className="text-center py-2 px-4 text-gray-400">Ratio</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-4 text-gray-400">Expected Value</td>
                <td className="py-2 px-4 text-center font-mono">{leftStats.mean.toFixed(3)}</td>
                <td className="py-2 px-4 text-center font-mono">{rightStats.mean.toFixed(3)}</td>
                <td className="py-2 px-4 text-center font-mono text-gray-500">
                  {rightStats.mean !== 0 ? (leftStats.mean / rightStats.mean).toFixed(2) : '-'}
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-4 text-gray-400">Variance</td>
                <td className="py-2 px-4 text-center font-mono">{leftStats.variance.toFixed(3)}</td>
                <td className="py-2 px-4 text-center font-mono">{rightStats.variance.toFixed(3)}</td>
                <td className="py-2 px-4 text-center font-mono text-gray-500">
                  {rightStats.variance !== 0 ? (leftStats.variance / rightStats.variance).toFixed(2) : '-'}
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-4 text-gray-400">Standard Deviation</td>
                <td className="py-2 px-4 text-center font-mono">{Math.sqrt(leftStats.variance).toFixed(3)}</td>
                <td className="py-2 px-4 text-center font-mono">{Math.sqrt(rightStats.variance).toFixed(3)}</td>
                <td className="py-2 px-4 text-center font-mono text-gray-500">
                  {rightStats.variance !== 0 ? (Math.sqrt(leftStats.variance) / Math.sqrt(rightStats.variance)).toFixed(2) : '-'}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-gray-400">Mode</td>
                <td className="py-2 px-4 text-center font-mono">{leftStats.mode}</td>
                <td className="py-2 px-4 text-center font-mono">{rightStats.mode}</td>
                <td className="py-2 px-4 text-center font-mono text-gray-500">
                  {rightStats.mode !== 0 ? (leftStats.mode / rightStats.mode).toFixed(2) : '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </VisualizationSection>
      
      {/* Mobile optimization note */}
      <div className="mt-4 text-xs text-gray-500 text-center lg:hidden">
        Tip: For better comparison on mobile, try landscape orientation
      </div>
    </VisualizationContainer>
  );
});

export default DistributionComparison;