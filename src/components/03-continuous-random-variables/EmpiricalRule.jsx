"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { createColorScheme, typography } from "../../lib/design-system";
import { Button } from "../ui/button";
import { Play, Pause, RotateCcw, BarChart } from "lucide-react";
import * as jStat from "jstat";

const EmpiricalRule = () => {
  const colors = createColorScheme('hypothesis');
  const svgRef = useRef(null);
  const intervalRef = useRef(null);
  
  // State
  const [mu, setMu] = useState(100);
  const [sigma, setSigma] = useState(15);
  const [samples, setSamples] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistogram, setShowHistogram] = useState(false);
  const [selectedRule, setSelectedRule] = useState(1); // 1, 2, or 3 for σ ranges
  const [counts, setCounts] = useState({
    within1SD: 0,
    within2SD: 0,
    within3SD: 0,
    total: 0
  });
  
  // Generate samples
  const generateSample = () => {
    const newSample = jStat.normal.sample(mu, sigma);
    setSamples(prev => {
      const updated = [...prev, newSample];
      // Keep only last 1000 samples
      return updated.slice(-1000);
    });
  };
  
  // Start/stop generation
  const toggleGeneration = () => {
    if (isGenerating) {
      clearInterval(intervalRef.current);
    } else {
      intervalRef.current = setInterval(generateSample, 50);
    }
    setIsGenerating(!isGenerating);
  };
  
  // Reset
  const handleReset = () => {
    setSamples([]);
    setIsGenerating(false);
    clearInterval(intervalRef.current);
  };
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Calculate counts when samples change
  useEffect(() => {
    const within1SD = samples.filter(x => Math.abs(x - mu) <= sigma).length;
    const within2SD = samples.filter(x => Math.abs(x - mu) <= 2 * sigma).length;
    const within3SD = samples.filter(x => Math.abs(x - mu) <= 3 * sigma).length;
    
    setCounts({
      within1SD,
      within2SD,
      within3SD,
      total: samples.length
    });
  }, [samples, mu, sigma]);
  
  // D3 Visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 700;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
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
    
    // Background
    g.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", colors.background)
      .attr("opacity", 0.05);
    
    // Empirical Rule regions
    const regions = [
      { sd: 3, color: colors.accent, opacity: 0.15, label: "99.7%" },
      { sd: 2, color: colors.secondary, opacity: 0.2, label: "95%" },
      { sd: 1, color: colors.primary, opacity: 0.25, label: "68%" }
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
        .attr("class", `region-${region.sd}`)
        .style("opacity", selectedRule >= region.sd ? 1 : 0.3);
      
      regionGroup.append("path")
        .datum(regionData)
        .attr("d", area)
        .attr("fill", region.color)
        .attr("opacity", region.opacity);
      
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
          .attr("opacity", 0.7);
          
        // Labels
        regionGroup.append("text")
          .attr("x", xScale(x))
          .attr("y", height - margin.bottom + 20)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("fill", region.color)
          .text(`${side > 0 ? '+' : ''}${region.sd}σ`);
      });
      
      // Percentage label
      regionGroup.append("text")
        .attr("x", xScale(mu))
        .attr("y", height - margin.bottom - (region.sd * 30) - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("fill", region.color)
        .text(region.label);
    });
    
    // Draw PDF curve
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
      
    g.append("path")
      .datum(curveData)
      .attr("d", line)
      .attr("stroke", colors.text)
      .attr("stroke-width", 3)
      .attr("fill", "none");
    
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
      .style("color", colors.secondary);
      
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .style("color", colors.secondary);
    
    // Title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", colors.text)
      .text(`Normal Distribution: μ = ${mu}, σ = ${sigma}`);
    
    // Mean line
    g.append("line")
      .attr("x1", xScale(mu))
      .attr("y1", margin.top)
      .attr("x2", xScale(mu))
      .attr("y2", height - margin.bottom)
      .attr("stroke", colors.text)
      .attr("stroke-width", 2)
      .attr("opacity", 0.5);
    
    // If showing histogram, overlay sample data
    if (showHistogram && samples.length > 0) {
      const bins = d3.histogram()
        .domain(xScale.domain())
        .thresholds(xScale.ticks(30))
        (samples);
      
      const yHistScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height - margin.bottom, margin.top]);
      
      g.selectAll(".bar")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yHistScale(d.length))
        .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
        .attr("height", d => height - margin.bottom - yHistScale(d.length))
        .attr("fill", colors.primary)
        .attr("opacity", 0.5);
    }
    
    // Sample points (last 100)
    if (samples.length > 0 && !showHistogram) {
      const recentSamples = samples.slice(-100);
      
      g.selectAll(".sample-point")
        .data(recentSamples)
        .enter().append("circle")
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
        .attr("opacity", 0.6);
    }
    
  }, [mu, sigma, samples, showHistogram, selectedRule, colors]);
  
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
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>The Empirical Rule (68-95-99.7 Rule)</span>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowHistogram(!showHistogram)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <BarChart className="w-4 h-4" />
                {showHistogram ? 'Hide' : 'Show'} Histogram
              </Button>
              <Button
                onClick={toggleGeneration}
                variant={isGenerating ? "destructive" : "default"}
                size="sm"
                className="gap-2"
              >
                {isGenerating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isGenerating ? 'Pause' : 'Generate'}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Distribution Parameters</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mean (μ): {mu}
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={mu}
                      onChange={(e) => setMu(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Standard Deviation (σ): {sigma}
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={sigma}
                      onChange={(e) => setSigma(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Select Range</h4>
                <div className="space-y-2">
                  {[1, 2, 3].map(sd => (
                    <Button
                      key={sd}
                      onClick={() => setSelectedRule(sd)}
                      variant={selectedRule === sd ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                    >
                      ±{sd}σ Range
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                <h4 className="font-semibold">Sample Statistics</h4>
                <div className="space-y-1 text-sm">
                  <p>Total Samples: {counts.total}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span>Within ±1σ:</span>
                      <span className="font-mono">
                        {counts.within1SD} ({percentages.actual1SD}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Within ±2σ:</span>
                      <span className="font-mono">
                        {counts.within2SD} ({percentages.actual2SD}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Within ±3σ:</span>
                      <span className="font-mono">
                        {counts.within3SD} ({percentages.actual3SD}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <h4 className="font-semibold text-sm">The Empirical Rule</h4>
                <div className="space-y-2 text-xs">
                  <div className={`p-2 rounded transition-all ${
                    selectedRule >= 1 ? 'bg-primary/20' : 'opacity-50'
                  }`}>
                    <p className="font-semibold">68% Rule (±1σ)</p>
                    <p>Approximately 68% of data falls within one standard deviation of the mean</p>
                    <p className="text-xs opacity-80 mt-1">
                      Range: [{(mu - sigma).toFixed(1)}, {(mu + sigma).toFixed(1)}]
                    </p>
                  </div>
                  
                  <div className={`p-2 rounded transition-all ${
                    selectedRule >= 2 ? 'bg-secondary/20' : 'opacity-50'
                  }`}>
                    <p className="font-semibold">95% Rule (±2σ)</p>
                    <p>Approximately 95% of data falls within two standard deviations</p>
                    <p className="text-xs opacity-80 mt-1">
                      Range: [{(mu - 2*sigma).toFixed(1)}, {(mu + 2*sigma).toFixed(1)}]
                    </p>
                  </div>
                  
                  <div className={`p-2 rounded transition-all ${
                    selectedRule >= 3 ? 'bg-accent/20' : 'opacity-50'
                  }`}>
                    <p className="font-semibold">99.7% Rule (±3σ)</p>
                    <p>Approximately 99.7% of data falls within three standard deviations</p>
                    <p className="text-xs opacity-80 mt-1">
                      Range: [{(mu - 3*sigma).toFixed(1)}, {(mu + 3*sigma).toFixed(1)}]
                    </p>
                  </div>
                </div>
              </div>
              
              {counts.total >= 100 && (
                <div className="p-3 bg-emerald-900/20 border border-emerald-600/30 rounded-lg">
                  <p className="text-sm font-semibold mb-1">Convergence Check</p>
                  <p className="text-xs">
                    As you collect more samples, the observed percentages converge to the theoretical values:
                  </p>
                  <div className="mt-2 space-y-1 text-xs">
                    <p>68% → {percentages.actual1SD}% {Math.abs(68 - percentages.actual1SD) < 2 ? '✓' : ''}</p>
                    <p>95% → {percentages.actual2SD}% {Math.abs(95 - percentages.actual2SD) < 2 ? '✓' : ''}</p>
                    <p>99.7% → {percentages.actual3SD}% {Math.abs(99.7 - percentages.actual3SD) < 1 ? '✓' : ''}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="col-span-2">
              <svg 
                ref={svgRef} 
                width={700} 
                height={500}
                className="w-full h-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmpiricalRule;