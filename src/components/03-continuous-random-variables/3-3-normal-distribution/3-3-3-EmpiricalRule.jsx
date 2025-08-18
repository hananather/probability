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

// LaTeX-containing components wrapped in React.memo to prevent re-renders
const ParameterLabel = memo(function ParameterLabel({ label, symbol }) {
  const labelRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && labelRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([labelRef.current]);
        }
        window.MathJax.typesetPromise([labelRef.current]).catch(() => {});
      }
    };
    
    // Process immediately
    processMathJax();
    // Process again after a delay to catch any timing issues
    const timeoutId = setTimeout(processMathJax, 500);
    
    return () => clearTimeout(timeoutId);
  }, [symbol]);
  
  return (
    <span ref={labelRef}>
      {label} <span dangerouslySetInnerHTML={{ __html: `\\(${symbol}\\)` }} />:
    </span>
  );
});

const SigmaButton = memo(function SigmaButton({ sd, isSelected, onClick }) {
  const buttonRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && buttonRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([buttonRef.current]);
        }
        window.MathJax.typesetPromise([buttonRef.current]).catch(() => {});
      }
    };
    
    // Process immediately
    processMathJax();
    // Process again after a delay to catch any timing issues
    const timeoutId = setTimeout(processMathJax, 500);
    
    return () => clearTimeout(timeoutId);
  }, [sd]);
  
  return (
    <Button
      onClick={onClick}
      variant={isSelected ? "default" : "outline"}
      size="sm"
      className="flex-1"
    >
      <span ref={buttonRef} dangerouslySetInnerHTML={{ __html: `\\(\\pm${sd}\\sigma\\)` }} />
    </Button>
  );
});

const StatisticRow = memo(function StatisticRow({ label, sigmaRange, count, percentage, color }) {
  const rowRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && rowRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([rowRef.current]);
        }
        window.MathJax.typesetPromise([rowRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [sigmaRange]);
  
  return (
    <div className="flex justify-between" ref={rowRef}>
      <span>Within <span dangerouslySetInnerHTML={{ __html: `\\(\\pm ${sigmaRange}\\sigma\\)` }} />:</span>
      <span className={`font-mono ${color}`}>
        {count} ({percentage}%)
      </span>
    </div>
  );
});

const RuleExplanation = memo(function RuleExplanation({ rule, sigmaRange, percentage, color, isSelected, range }) {
  const ruleRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && ruleRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([ruleRef.current]);
        }
        window.MathJax.typesetPromise([ruleRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [sigmaRange]);
  
  return (
    <div 
      ref={ruleRef}
      className={`p-2 rounded transition-all duration-200 cursor-pointer hover:scale-105 ${
        isSelected ? `${color}/20 border border-${color}/30` : 'opacity-50'
      }`}
    >
      <p className={`font-semibold ${color}`}>
        {percentage}% Rule <span dangerouslySetInnerHTML={{ __html: `\\((\\pm ${sigmaRange}\\sigma)\\)` }} />
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
      text: baseColors.text,
      background: baseColors.background
    };
  }, []);
  
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 500 });
  
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
      // Force MathJax re-render when starting simulation
      setTimeout(() => {
        if (typeof window !== "undefined" && window.MathJax?.typesetPromise) {
          window.MathJax.typesetPromise().catch(() => {});
        }
      }, 100);
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

  // Ensure MathJax is processed on key state changes
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise().catch(() => {});
      }
    };
    
    // Process after a short delay to ensure DOM is updated
    const timeoutId = setTimeout(processMathJax, 100);
    
    return () => clearTimeout(timeoutId);
  }, [isGenerating, selectedRule, showHistogram]);

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
      
      // Percentage label with better positioning
      regionGroup.append("text")
        .attr("x", xScale(mu))
        .attr("y", yScale(normalPDF(mu)) + (region.sd * 40))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "700")
        .style("fill", region.color)
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
      
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
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
    
    // If showing histogram, overlay sample data with vibrant colors
    if (showHistogram && samples.length > 0) {
      const bins = d3.histogram()
        .domain(xScale.domain())
        .thresholds(xScale.ticks(25))
        (samples);
      
      const yHistScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height - margin.bottom, margin.top]);
      
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
      
      g.selectAll(".bar")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0) + 1)
        .attr("y", d => yHistScale(d.length))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 2))
        .attr("height", d => height - margin.bottom - yHistScale(d.length))
        .attr("fill", "url(#histGradient)")
        .attr("stroke", colors.histogram)
        .attr("stroke-width", 0.5)
        .attr("rx", 2);
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
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl">Interactive Visualization</span>
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
        <CardContent className="p-3">
          {/* Main visualization area */}
          <div className="w-full mb-4">
            <svg 
              ref={svgRef} 
              width={dimensions.width} 
              height={dimensions.height}
              className="w-full"
            />
          </div>
          
          {/* Controls in a horizontal layout below */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Parameters */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Distribution Parameters</h4>
              <div className="space-y-2">
                <div>
                  <label className="flex items-center justify-between text-sm">
                    <ParameterLabel label="Mean" symbol="\\mu" />
                    <span className="font-mono text-sm">{mu}</span>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={mu}
                    onChange={(e) => setMu(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer transition-all duration-200 hover:bg-gray-600"
                  />
                </div>
                
                <div>
                  <label className="flex items-center justify-between text-sm">
                    <ParameterLabel label="Std Dev" symbol="\\sigma" />
                    <span className="font-mono text-sm">{sigma}</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={sigma}
                    onChange={(e) => setSigma(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer transition-all duration-200 hover:bg-gray-600"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {[1, 2, 3].map(sd => (
                  <SigmaButton
                    key={sd}
                    sd={sd}
                    isSelected={selectedRule === sd}
                    onClick={() => setSelectedRule(sd)}
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
                  range={[mu - sigma, mu + sigma]}
                />
                
                <RuleExplanation
                  rule="two"
                  sigmaRange="2"
                  percentage="95"
                  color="bg-amber-500"
                  isSelected={selectedRule >= 2}
                  range={[mu - 2*sigma, mu + 2*sigma]}
                />
                
                <RuleExplanation
                  rule="three"
                  sigmaRange="3"
                  percentage="99.7"
                  color="bg-red-500"
                  isSelected={selectedRule >= 3}
                  range={[mu - 3*sigma, mu + 3*sigma]}
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