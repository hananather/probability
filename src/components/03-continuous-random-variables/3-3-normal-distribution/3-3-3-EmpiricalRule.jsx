"use client";
import React, { useState, useEffect, useRef, useMemo, memo } from "react";
import { useMathJax } from '@/hooks/useMathJax';
import * as d3 from "@/utils/d3-utils";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { createColorScheme, typography } from "../../../lib/design-system";
import { Button } from "../../ui/button";
import { Play, Pause, RotateCcw, BarChart } from "lucide-react";
import * as jStat from "jstat";
import { VisualizationContainer } from "../../ui/VisualizationContainer";
import { tutorial_3_3_3 } from '@/tutorials/chapter3';
import BackToHub from '../../ui/BackToHub';

const InlineFormula = memo(function InlineFormula({ latex }) {
  const formulaRef = useMathJax([latex]);
  return <span ref={formulaRef} dangerouslySetInnerHTML={{ __html: `\\(${latex}\\)` }} />;
});

const ParameterLabel = memo(function ParameterLabel({ label, symbol }) {
  
  return (
    <span>
      {label} <InlineFormula latex={symbol} />:
    </span>
  );
});

const SigmaButton = memo(function SigmaButton({ sd, isSelected, onSelect }) {
  
  return (
    <Button
      onClick={() => onSelect(sd)}
      aria-label={`Highlight within ${sd} standard deviation${sd === 1 ? '' : 's'} of the mean`}
      aria-pressed={isSelected}
      variant={isSelected ? "default" : "outline"}
      size="sm"
      className="flex-1"
    >
      <InlineFormula latex={`\\pm${sd}\\sigma`} />
    </Button>
  );
});

const StatisticRow = memo(function StatisticRow({ label, sigmaRange, count, percentage, color }) {
  return (
    <div className="flex justify-between">
      <span>Within <InlineFormula latex={`\\pm ${sigmaRange}\\sigma`} />:</span>
      <span className={`font-mono ${color}`}>
        {count} ({percentage}%)
      </span>
    </div>
  );
});

const RuleExplanation = memo(function RuleExplanation({ rule, sigmaRange, percentage, color, isSelected, range }) {
  return (
    <div 
      className={`p-2 rounded transition-all duration-200 cursor-pointer hover:scale-105 ${
        isSelected ? `${color}/20 border border-${color}/30` : 'opacity-50'
      }`}
    >
      <p className={`font-semibold ${color}`}>
        {percentage}% Rule <InlineFormula latex={`(\\pm ${sigmaRange}\\sigma)`} />
      </p>
      <p>≈{percentage}% of data within {rule} standard deviation{sigmaRange > 1 ? 's' : ''}</p>
      <p className="text-xs opacity-80 mt-1 font-mono">
        [{range[0].toFixed(1)}, {range[1].toFixed(1)}]
      </p>
    </div>
  );
});

const EmpiricalRule = () => {
  // Use vibrant custom colors to reduce blue dominance
  const colors = useMemo(() => {
    const baseColors = createColorScheme('inference');
    return {
      ...baseColors,
      primary: '#10b981', // Emerald for 68%
      secondary: '#f59e0b', // Amber for 95%
      accent: '#ef4444', // Red for 99.7%
      curve: '#8b5cf6', // Violet for the normal curve
      histogram: '#06b6d4', // Cyan for histogram
      text: '#f3f4f6',
      background: baseColors.background
    };
  }, []);
  
  const svgRef = useRef(null);
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 500 });
  
  // State
  const [mu, setMu] = useState(100);
  const [sigma, setSigma] = useState(15);
  const [samples, setSamples] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistogram, setShowHistogram] = useState(false);
  const [selectedRule, setSelectedRule] = useState(1); // 1, 2, or 3 for σ ranges
  const counts = useMemo(() => ({
    within1SD: samples.filter(x => Math.abs(x - mu) <= sigma).length,
    within2SD: samples.filter(x => Math.abs(x - mu) <= 2 * sigma).length,
    within3SD: samples.filter(x => Math.abs(x - mu) <= 3 * sigma).length,
    total: samples.length
  }), [samples, mu, sigma]);
  const ruleRanges = useMemo(() => [1, 2, 3].map(sd => [mu - sd * sigma, mu + sd * sigma]), [mu, sigma]);
  
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      const newSample = jStat.normal.sample(mu, sigma);
      setSamples(previous => [...previous, newSample].slice(-1000));
    }, 50);
    return () => clearInterval(interval);
  }, [isGenerating, mu, sigma]);

  const toggleGeneration = () => setIsGenerating(previous => !previous);
  const handleReset = () => { setSamples([]); setIsGenerating(false); };
  const changeMean = value => { setMu(value); setSamples([]); };
  const changeSigma = value => { setSigma(value); setSamples([]); };

  // Handle responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.min(width - 32, 1200),
          height: Math.min(500, window.innerHeight * 0.6)
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // D3 Visualization
  useEffect(() => {
    if (!svgRef.current || typeof window === 'undefined') return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = dimensions.width;
    const height = dimensions.height;
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    
    const g = svg.append("g");
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([mu - 4 * sigma, mu + 4 * sigma])
      .range([margin.left, width - margin.right]);
      
    const yScale = d3.scaleLinear()
      .domain([0, 0.4 / sigma])
      .range([height - margin.bottom, margin.top]);
    
    // Normal PDF
    const normalPDF = (x) => {
      const exp = -0.5 * Math.pow((x - mu) / sigma, 2);
      return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(exp);
    };
    
    // Generate curve data
    const curveData = d3.range(mu - 4 * sigma, mu + 4 * sigma, sigma / 50)
      .map(x => ({ x, y: normalPDF(x) }));
    
    // Subtle gradient background
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "bgGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("style", "stop-color:#1e293b;stop-opacity:0.1");
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("style", "stop-color:#334155;stop-opacity:0.05");
    
    g.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "url(#bgGradient)")
      .attr("rx", 8);
    
    // Empirical Rule regions with improved visibility
    const regions = [
      { sd: 3, color: colors.accent, opacity: 0.2, label: "99.7%" },
      { sd: 2, color: colors.secondary, opacity: 0.25, label: "95%" },
      { sd: 1, color: colors.primary, opacity: 0.3, label: "68%" }
    ];
    
    regions.forEach((region) => {
      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(height - margin.bottom)
        .y1(d => yScale(d.y))
        .curve(d3.curveBasis);
        
      const regionData = curveData.filter(d => 
        d.x >= mu - region.sd * sigma && d.x <= mu + region.sd * sigma
      );
      
      const regionGroup = g.append("g")
        .attr("class", `region-${region.sd}`);
      
      regionGroup.append("path")
        .datum(regionData)
        .attr('class', 'density-region')
        .attr("d", area)
        .attr("fill", region.color)
        .attr("opacity", region.opacity * (selectedRule >= region.sd ? 1 : 0.3));
      
      // Boundary lines
      [-1, 1].forEach(side => {
        const x = mu + side * region.sd * sigma;
        regionGroup.append("line")
          .attr("x1", xScale(x))
          .attr("y1", margin.top)
          .attr("x2", xScale(x))
          .attr("y2", height - margin.bottom)
          .attr("stroke", region.color)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5")
          .attr("opacity", selectedRule >= region.sd ? 0.7 : 0.35);
          
        // Labels
        regionGroup.append("text")
          .attr("x", xScale(x))
          .attr("y", height - margin.bottom + 20)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("fill", region.color)
          .text(`${side > 0 ? '+' : ''}${region.sd}σ`);
      });
      
      // Percentage label with better positioning
      regionGroup.append("text")
        .attr("x", xScale(mu))
        .attr("y", margin.top + region.sd * 28)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "700")
        .style("fill", region.sd === 3 ? '#fca5a5' : region.color)
        .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.5))")
        .text(region.label);
    });
    
    // Draw PDF curve with improved styling
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
      
    // Add glow effect for the curve
    const curveGlow = defs.append("filter")
      .attr("id", "curveGlow");
    
    curveGlow.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
    
    const feMerge = curveGlow.append("feMerge");
    feMerge.append("feMergeNode")
      .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");
      
    g.append("path")
      .datum(curveData)
      .attr('class', 'density-curve')
      .attr("d", line)
      .attr("stroke", colors.curve)
      .attr("stroke-width", 4)
      .attr("fill", "none")
      .attr("filter", "url(#curveGlow)");
    
    // Axes
    const xAxis = d3.axisBottom(xScale)
      .tickValues([
        mu - 3*sigma, mu - 2*sigma, mu - sigma, 
        mu, 
        mu + sigma, mu + 2*sigma, mu + 3*sigma
      ])
      .tickFormat(d => d.toFixed(0));
      
    const yAxis = d3.axisLeft(yScale).ticks(5);
    
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", "#f3f4f6");
      
    const densityAxis = g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);
    densityAxis.selectAll('text').attr('fill', '#f3f4f6');
    g.append('text')
      .attr('transform', `translate(12,${(margin.top + height - margin.bottom) / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.text)
      .attr('font-size', 12)
      .text('Probability density');
    
    // Distribution info in top corner
    g.append("text")
      .attr("x", margin.left + 10)
      .attr("y", margin.top + 20)
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("fill", colors.text)
      .style("opacity", 0.8)
      .text(`μ = ${mu}, σ = ${sigma}`);
    
    // Mean line
    g.append("line")
      .attr("x1", xScale(mu))
      .attr("y1", margin.top)
      .attr("x2", xScale(mu))
      .attr("y2", height - margin.bottom)
      .attr("stroke", colors.text)
      .attr("stroke-width", 2)
      .attr("opacity", 0.5);
    
    g.append('g').attr('class', 'sample-layer');
    chartRef.current = { g, xScale, yScale, densityAxis, curveData, margin, height };
    // Create gradient for histogram bars
    const histGradient = defs.append("linearGradient")
      .attr("id", "histGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    histGradient.append("stop")
      .attr("offset", "0%")
      .attr("style", `stop-color:${colors.histogram};stop-opacity:0.9`);

    histGradient.append("stop")
      .attr("offset", "100%")
      .attr("style", `stop-color:${colors.histogram};stop-opacity:0.6`);

  }, [mu, sigma, selectedRule, colors, dimensions]);

  useEffect(() => {
    if (!svgRef.current) return;
    const chart = chartRef.current;
    if (!chart) return;
    const g = chart.g.select('.sample-layer');
    if (g.empty()) return;
    const { height, margin, xScale, yScale } = chart;
    const [domainLow, domainHigh] = xScale.domain();
    // Interior thresholds keep both domain endpoints in positive-width bins.
    const thresholds = xScale.ticks(25).filter(value => value > domainLow && value < domainHigh);
    const bins = showHistogram && samples.length > 0
      ? d3.histogram().domain([domainLow, domainHigh]).thresholds(thresholds)(samples)
        .map(bin => ({ x0: bin.x0, x1: bin.x1, density: bin.length / (samples.length * (bin.x1 - bin.x0)) }))
      : [];
    const curveCeiling = 0.4 / sigma;
    const step = curveCeiling / 2;
    // A sparse sample can have a taller density than the theoretical curve.
    // Coarse ceiling steps fit both without rescaling at every new draw.
    const peak = d3.max(bins, bin => bin.density) || 0;
    const ceiling = peak > curveCeiling ? Math.ceil(peak / step + 0.05) * step : curveCeiling;
    if (yScale.domain()[1] !== ceiling) {
      yScale.domain([0, ceiling]);
      chart.densityAxis.call(d3.axisLeft(yScale).ticks(5));
      chart.densityAxis.selectAll('text').attr('fill', colors.text);
      const area = d3.area().x(d => xScale(d.x)).y0(height - margin.bottom).y1(d => yScale(d.y)).curve(d3.curveBasis);
      chart.g.selectAll('.density-region').attr('d', area);
      chart.g.select('.density-curve').attr('d', d3.line().x(d => xScale(d.x)).y(d => yScale(d.y)).curve(d3.curveBasis));
    }
    if (samples.length === 0) { g.selectAll('*').remove(); return; }
    g.selectAll(showHistogram ? '.sample-point' : '.bar').remove();
    // Update only the sample overlay; the density curve and axes stay mounted.
    if (showHistogram && samples.length > 0) {
      g.selectAll(".bar")
        .data(bins)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.density))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0)))
        .attr("height", d => height - margin.bottom - yScale(d.density))
        .attr("fill", "url(#histGradient)")
        .attr("stroke", colors.histogram)
        .attr("stroke-width", 0.5)
        .attr("rx", 0);
    }
    
    // Sample points (last 100)
    if (samples.length > 0 && !showHistogram) {
      const recentSamples = samples.slice(-100);
      
      g.selectAll(".sample-point")
        .data(recentSamples)
        .join("circle")
        .attr("class", "sample-point")
        .attr("cx", d => xScale(d))
        .attr("cy", height - margin.bottom - 5)
        .attr("r", 2)
        .attr("fill", d => {
          const deviation = Math.abs(d - mu) / sigma;
          if (deviation <= 1) return colors.primary;
          if (deviation <= 2) return colors.secondary;
          if (deviation <= 3) return colors.accent;
          return colors.text;
        })
        .attr("stroke", "#f3f4f6")
        .attr("stroke-width", 1)
        .attr("opacity", 0.6);
    }
    
  }, [mu, sigma, samples, showHistogram, selectedRule, colors, dimensions]);
  
  // Calculate percentages
  const getPercentages = () => {
    if (counts.total === 0) {
      return {
        actual1SD: 0,
        actual2SD: 0,
        actual3SD: 0
      };
    }
    
    return {
      actual1SD: (counts.within1SD / counts.total * 100).toFixed(1),
      actual2SD: (counts.within2SD / counts.total * 100).toFixed(1),
      actual3SD: (counts.within3SD / counts.total * 100).toFixed(1)
    };
  };
  
  const percentages = getPercentages();
  
  return (
    <VisualizationContainer 
      title="The Empirical Rule (68-95-99.7 Rule)"
      tutorialSteps={tutorial_3_3_3}
      tutorialKey="empirical-rule-3-3-3"
    >
      <BackToHub />
      <div className="w-full" ref={containerRef}>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 space-y-0 gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <CardTitle className="min-w-0 text-xl leading-tight">Interactive Visualization</CardTitle>
            <div className="flex min-w-0 flex-wrap gap-2">
              <Button
                onClick={() => setShowHistogram(!showHistogram)}
                variant="outline"
                size="sm"
                className="gap-2 min-h-11 sm:min-h-8"
              >
                <BarChart className="w-4 h-4" />
                {showHistogram ? 'Hide' : 'Show'} Histogram
              </Button>
              <Button
                onClick={toggleGeneration}
                variant={isGenerating ? "destructive" : "default"}
                size="sm"
                className="gap-2 min-h-11 sm:min-h-8"
              >
                {isGenerating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isGenerating ? 'Pause' : 'Generate'}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="gap-2 min-h-11 sm:min-h-8"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardHeader>
        <CardContent className="p-3">
          {/* Main visualization area */}
          <div className="w-full mb-4">
            <svg 
              ref={svgRef} 
              role="img"
              aria-label={`Normal probability density with mean ${mu} and standard deviation ${sigma}${showHistogram ? ', with the sample density histogram' : ''}`}
              width={dimensions.width} 
              height={dimensions.height}
              className="w-full"
            />
          </div>
          {showHistogram && (
            <p className="mb-4 text-sm leading-relaxed text-neutral-300">
              Bar height is count ÷ (total samples × bin width), so bar area gives the sample proportion.
              The bars and curve share the density axis; small samples can make tall bars.
              All retained samples, including points outside the plot, contribute to the total.
            </p>
          )}
          
          {/* Controls in a horizontal layout below */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Parameters */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Distribution Parameters</h4>
              <div className="space-y-2">
                <div>
                  <label className="flex items-center justify-between text-sm">
                    <ParameterLabel label="Mean" symbol={'\\mu'} />
                    <span className="font-mono text-sm">{mu}</span>
                  </label>
                  <input
                    type="range"
                    aria-label="Mean"
                    min="50"
                    max="150"
                    value={mu}
                    onChange={(e) => changeMean(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer transition-all duration-200 hover:bg-gray-600"
                  />
                </div>
                
                <div>
                  <label className="flex items-center justify-between text-sm">
                    <ParameterLabel label="Std Dev" symbol={'\\sigma'} />
                    <span className="font-mono text-sm">{sigma}</span>
                  </label>
                  <input
                    type="range"
                    aria-label="Standard deviation"
                    min="5"
                    max="30"
                    value={sigma}
                    onChange={(e) => changeSigma(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer transition-all duration-200 hover:bg-gray-600"
                  />
                </div>
              </div>
              
              <p className="text-xs text-neutral-400">Changing either parameter starts a new sample set.</p>

              <div className="flex gap-2">
                {[1, 2, 3].map(sd => (
                  <SigmaButton
                    key={sd}
                    sd={sd}
                    isSelected={selectedRule === sd}
                    onSelect={setSelectedRule}
                  />
                ))}
              </div>
            </div>
            
            {/* Sample Statistics */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Sample Statistics</h4>
              <div className="space-y-1 text-sm bg-gray-800/50 p-3 rounded-lg">
                <p>Total Samples: <span className="font-mono">{counts.total}</span></p>
                <div className="mt-2 space-y-1">
                  <StatisticRow
                    label="Within"
                    sigmaRange="1"
                    count={counts.within1SD}
                    percentage={percentages.actual1SD}
                    color="text-emerald-400"
                  />
                  <StatisticRow
                    label="Within"
                    sigmaRange="2"
                    count={counts.within2SD}
                    percentage={percentages.actual2SD}
                    color="text-amber-400"
                  />
                  <StatisticRow
                    label="Within"
                    sigmaRange="3"
                    count={counts.within3SD}
                    percentage={percentages.actual3SD}
                    color="text-red-400"
                  />
                </div>
              </div>
              
              {counts.total >= 100 && (
                <div className="p-3 bg-emerald-900/20 border border-emerald-600/30 rounded-lg">
                  <p className="text-xs font-semibold mb-1">Convergence</p>
                  <div className="space-y-1 text-xs">
                    <p>68% → {percentages.actual1SD}% {Math.abs(68 - percentages.actual1SD) < 2 ? '✓' : ''}</p>
                    <p>95% → {percentages.actual2SD}% {Math.abs(95 - percentages.actual2SD) < 2 ? '✓' : ''}</p>
                    <p>99.7% → {percentages.actual3SD}% {Math.abs(99.7 - percentages.actual3SD) < 1 ? '✓' : ''}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Empirical Rule Explanation */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">The Empirical Rule</h4>
              <div className="space-y-2 text-xs">
                <RuleExplanation
                  rule="one"
                  sigmaRange="1"
                  percentage="68"
                  color="bg-emerald-500"
                  isSelected={selectedRule >= 1}
                  range={ruleRanges[0]}
                />
                
                <RuleExplanation
                  rule="two"
                  sigmaRange="2"
                  percentage="95"
                  color="bg-amber-500"
                  isSelected={selectedRule >= 2}
                  range={ruleRanges[1]}
                />
                
                <RuleExplanation
                  rule="three"
                  sigmaRange="3"
                  percentage="99.7"
                  color="bg-red-500"
                  isSelected={selectedRule >= 3}
                  range={ruleRanges[2]}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </VisualizationContainer>
  );
};

export default EmpiricalRule;
