"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { RangeSlider } from '../ui/RangeSlider';
import { NormalZScoreWorkedExample } from "./NormalZScoreWorkedExample";
import { RotateCcw } from "lucide-react";
import * as jStat from "jstat";

const NormalZScoreExplorer = () => {
  const colorScheme = createColorScheme('inference');
  const svgRef = useRef(null);
  const dragLineRef = useRef(null);
  
  // Parameters
  const [mu, setMu] = useState(100);
  const [sigma, setSigma] = useState(15);
  const [xValue, setXValue] = useState(115);
  const [interactionCount, setInteractionCount] = useState(0);
  
  // Calculated values
  const zScore = (xValue - mu) / sigma;
  const probability = jStat.normal.cdf(zScore, 0, 1);
  
  // Track if user has dragged
  const hasDragged = useRef(false);
  
  // Increment interaction count when parameters change
  useEffect(() => {
    if (interactionCount > 0 || hasDragged.current) {
      setInteractionCount(prev => prev + 1);
    }
  }, [mu, sigma, xValue]);
  
  // Reset function
  const handleReset = () => {
    setMu(100);
    setSigma(15);
    setXValue(115);
    setInteractionCount(0);
    hasDragged.current = false;
  };
  
  // D3 Visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 680;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const plotHeight = (height - margin.top - margin.bottom) / 2 - 40;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Dark background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // Create main group
    const g = svg.append("g");
    
    // X scales
    const xRange = 4.5;
    const xScaleTop = d3.scaleLinear()
      .domain([mu - xRange * sigma, mu + xRange * sigma])
      .range([margin.left, width - margin.right]);
      
    const xScaleBottom = d3.scaleLinear()
      .domain([-xRange, xRange])
      .range([margin.left, width - margin.right]);
    
    // Y scales
    const yScaleTop = d3.scaleLinear()
      .domain([0, 0.4 / sigma])
      .range([margin.top + plotHeight, margin.top]);
      
    const yScaleBottom = d3.scaleLinear()
      .domain([0, 0.4])
      .range([margin.top + plotHeight + 80 + plotHeight, margin.top + plotHeight + 80]);
    
    // Normal PDF functions
    const normalPDF = (x, mean, sd) => {
      const exp = -0.5 * Math.pow((x - mean) / sd, 2);
      return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(exp);
    };
    
    // Generate data points
    const topData = d3.range(mu - xRange * sigma, mu + xRange * sigma, sigma / 50)
      .map(x => ({ x, y: normalPDF(x, mu, sigma) }));
      
    const bottomData = d3.range(-xRange, xRange, 0.1)
      .map(z => ({ x: z, y: normalPDF(z, 0, 1) }));
    
    // Line generators
    const lineTop = d3.line()
      .x(d => xScaleTop(d.x))
      .y(d => yScaleTop(d.y))
      .curve(d3.curveBasis);
      
    const lineBottom = d3.line()
      .x(d => xScaleBottom(d.x))
      .y(d => yScaleBottom(d.y))
      .curve(d3.curveBasis);
    
    // Top plot background
    g.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", plotHeight)
      .attr("fill", "#1a1a1a")
      .attr("stroke", colors.chart.grid)
      .attr("stroke-width", 1)
      .attr("rx", 4);
    
    // Bottom plot background
    g.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top + plotHeight + 80)
      .attr("width", width - margin.left - margin.right)
      .attr("height", plotHeight)
      .attr("fill", "#1a1a1a")
      .attr("stroke", colors.chart.grid)
      .attr("stroke-width", 1)
      .attr("rx", 4);
    
    // Titles
    g.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", colors.chart.text)
      .text(`Original Distribution: X ~ N(μ=${mu}, σ=${sigma})`);
      
    g.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top + plotHeight + 70)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", colors.chart.text)
      .text("Standard Normal: Z ~ N(0, 1)");
    
    // X axes
    const xAxisTop = d3.axisBottom(xScaleTop)
      .tickValues([mu - 3*sigma, mu - 2*sigma, mu - sigma, mu, mu + sigma, mu + 2*sigma, mu + 3*sigma])
      .tickFormat(d => d.toFixed(0));
      
    const xAxisBottom = d3.axisBottom(xScaleBottom)
      .tickValues([-3, -2, -1, 0, 1, 2, 3]);
    
    const xAxisTopG = g.append("g")
      .attr("transform", `translate(0,${margin.top + plotHeight})`)
      .call(xAxisTop);
      
    xAxisTopG.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxisTopG.selectAll("text").attr("fill", colors.chart.text);
      
    const xAxisBottomG = g.append("g")
      .attr("transform", `translate(0,${margin.top + plotHeight + 80 + plotHeight})`)
      .call(xAxisBottom);
      
    xAxisBottomG.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxisBottomG.selectAll("text").attr("fill", colors.chart.text);
    
    // Y axes
    const yAxisTop = d3.axisLeft(yScaleTop).ticks(5);
    const yAxisBottom = d3.axisLeft(yScaleBottom).ticks(5);
    
    const yAxisTopG = g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxisTop);
      
    yAxisTopG.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxisTopG.selectAll("text").attr("fill", colors.chart.text).style("font-size", "11px");
      
    const yAxisBottomG = g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxisBottom);
      
    yAxisBottomG.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxisBottomG.selectAll("text").attr("fill", colors.chart.text).style("font-size", "11px");
    
    // Axis labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top + plotHeight + 35)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", colors.chart.text)
      .text("x");
      
    g.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top + plotHeight + 80 + plotHeight + 35)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", colors.chart.text)
      .text("z");
    
    // Area under curve for top plot
    const areaTop = d3.area()
      .x(d => xScaleTop(d.x))
      .y0(margin.top + plotHeight)
      .y1(d => yScaleTop(d.y))
      .curve(d3.curveBasis);
      
    const areaDataTop = topData.filter(d => d.x <= xValue);
    
    g.append("path")
      .datum(areaDataTop)
      .attr("d", areaTop)
      .attr("fill", colorScheme.chart.primary)
      .attr("opacity", 0.3);
    
    // Area under curve for bottom plot
    const areaBottom = d3.area()
      .x(d => xScaleBottom(d.x))
      .y0(margin.top + plotHeight + 80 + plotHeight)
      .y1(d => yScaleBottom(d.y))
      .curve(d3.curveBasis);
      
    const areaDataBottom = bottomData.filter(d => d.x <= zScore);
    
    g.append("path")
      .datum(areaDataBottom)
      .attr("d", areaBottom)
      .attr("fill", colorScheme.chart.primary)
      .attr("opacity", 0.3);
    
    // Draw PDFs
    g.append("path")
      .datum(topData)
      .attr("d", lineTop)
      .attr("stroke", colorScheme.chart.primaryLight)
      .attr("stroke-width", 2)
      .attr("fill", "none");
      
    g.append("path")
      .datum(bottomData)
      .attr("d", lineBottom)
      .attr("stroke", colorScheme.chart.primaryLight)
      .attr("stroke-width", 2)
      .attr("fill", "none");
    
    // Vertical lines for current x and z
    const xLine = g.append("line")
      .attr("x1", xScaleTop(xValue))
      .attr("y1", margin.top)
      .attr("x2", xScaleTop(xValue))
      .attr("y2", margin.top + plotHeight)
      .attr("stroke", colorScheme.chart.secondary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
      
    const zLine = g.append("line")
      .attr("x1", xScaleBottom(zScore))
      .attr("y1", margin.top + plotHeight + 80)
      .attr("x2", xScaleBottom(zScore))
      .attr("y2", margin.top + plotHeight + 80 + plotHeight)
      .attr("stroke", colorScheme.chart.secondary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    // Draggable circle on top plot
    const dragCircle = g.append("circle")
      .attr("cx", xScaleTop(xValue))
      .attr("cy", margin.top + plotHeight)
      .attr("r", 8)
      .attr("fill", colorScheme.chart.secondary)
      .attr("stroke", colorScheme.chart.secondaryLight)
      .attr("stroke-width", 2)
      .attr("cursor", "ew-resize");
    
    // Value labels
    const xLabel = g.append("text")
      .attr("x", xScaleTop(xValue))
      .attr("y", margin.top - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", colorScheme.chart.secondary)
      .text(`x = ${xValue.toFixed(1)}`);
      
    const zLabel = g.append("text")
      .attr("x", xScaleBottom(zScore))
      .attr("y", margin.top + plotHeight + 75)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", colorScheme.chart.secondary)
      .text(`z = ${zScore.toFixed(3)}`);
    
    // Drag behavior
    const drag = d3.drag()
      .on("start", () => {
        if (!hasDragged.current) {
          hasDragged.current = true;
          setInteractionCount(1);
        }
      })
      .on("drag", (event) => {
        const newX = xScaleTop.invert(event.x);
        const clampedX = Math.max(mu - 4*sigma, Math.min(mu + 4*sigma, newX));
        setXValue(clampedX);
      });
    
    dragCircle.call(drag);
    
    // Add connection line between plots
    g.append("line")
      .attr("x1", xScaleTop(xValue))
      .attr("y1", margin.top + plotHeight)
      .attr("x2", xScaleBottom(zScore))
      .attr("y2", margin.top + plotHeight + 80)
      .attr("stroke", colors.chart.grid)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.5);
    
    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScaleTop)
        .ticks(5)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);
      
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScaleBottom)
        .ticks(5)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);
    
  }, [mu, sigma, xValue, zScore, colorScheme]);
  
  // Educational insights
  const getInsight = () => {
    if (interactionCount === 0) {
      return {
        message: "Welcome! Let's see how any Normal distribution N(μ,σ²) can be 'standardized' to the N(0,1) Z-distribution. Change μ, σ, and x to see the magic.",
        stage: 0
      };
    } else if (interactionCount <= 5) {
      return {
        message: "Play with μ and σ. Notice the top curve changes shape and position, but the bottom Z-curve is fixed. The x-value you pick on top has a corresponding z-value on the bottom.",
        stage: 1
      };
    } else if (interactionCount <= 14) {
      const specialCases = [];
      if (Math.abs(xValue - mu) < 0.5) {
        specialCases.push(`Try setting x=μ. What is the z-score? What is the probability Φ(z)? (Should be z=0, Φ(0)=0.5)`);
      }
      specialCases.push("What happens to z if you increase σ while keeping x and μ the same distance apart? (Z gets smaller)");
      
      return {
        message: `The shaded areas represent P(X≤x) and P(Z≤z). Observe that these probabilities (areas) are always equal! The z-score tells you how many 'standard units' x is away from its mean. ${specialCases.join(" ")}`,
        stage: 2
      };
    } else {
      return {
        message: "✨ Standardization Mastered! You've seen that P(X≤x)=Φ((x-μ)/σ). This is powerful because we only need one table (or function) for the Standard Normal CDF, Φ(z), to find probabilities for any Normal distribution.",
        stage: 3,
        application: "Engineering Application: Imagine testing steel rods. Spec: length = 500±2mm. Your process gives μ=500mm, σ=0.5mm. A rod at 501mm has z=(501-500)/0.5=+2. A rod at 498.5mm has z=(498.5-500)/0.5=-3. This tells you immediately how 'typical' or 'extreme' these rods are relative to your process variation, without needing a new probability curve for every spec!"
      };
    }
  };
  
  const insight = getInsight();
  const progressPercent = Math.min((interactionCount / 15) * 100, 100);
  
  return (
    <VisualizationContainer
      title="📊 Normal Distribution & Z-Score Explorer"
      description={
        <>
          <p className={typography.description}>
            <strong>How do we standardize any normal distribution?</strong> The Z-score transformation 
            converts any Normal distribution N(μ,σ²) to the Standard Normal N(0,1).
          </p>
          <p className={cn(typography.description, "mt-2")}>
            <span className="text-teal-400">Z-scores</span> tell us how many standard deviations 
            a value is from the mean. Watch how the <span className="text-orange-400">transformation preserves probabilities</span>!
          </p>
        </>
      }
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left side - Controls and Stats */}
        <div className="lg:w-1/3 space-y-4">
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Distribution Parameters</h4>
            <ControlGroup>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    Mean (μ): {mu}
                  </label>
                  <RangeSlider
                    value={mu}
                    onChange={(v) => setMu(v)}
                    min={50}
                    max={150}
                    step={1}
                    className="mb-2"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    Standard Deviation (σ): {sigma}
                  </label>
                  <RangeSlider
                    value={sigma}
                    onChange={(v) => setSigma(v)}
                    min={5}
                    max={30}
                    step={1}
                    className="mb-2"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    x-value: {xValue.toFixed(1)}
                  </label>
                  <RangeSlider
                    value={xValue}
                    onChange={(v) => setXValue(v)}
                    min={mu - 4 * sigma}
                    max={mu + 4 * sigma}
                    step={0.1}
                    className="mb-2"
                  />
                  <p className="text-xs text-gray-400">
                    Or drag the orange point on the visualization
                  </p>
                </div>
                
                <button
                  className={cn(
                    "w-full px-3 py-1.5 rounded text-sm font-medium transition-colors",
                    "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                  onClick={handleReset}
                >
                  <RotateCcw className="w-4 h-4 inline mr-2" />
                  Reset All
                </button>
              </div>
            </ControlGroup>
          </VisualizationSection>
          {/* Statistics Display */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Calculated Values</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Current x:</span>
                <span className="text-white font-medium">{xValue.toFixed(1)}</span>
              </div>
              <div className="border-t border-gray-700 pt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Z-Score:</span>
                  <span className="text-teal-400 font-mono font-medium">{zScore.toFixed(4)}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  z = (x - μ) / σ = ({xValue.toFixed(1)} - {mu}) / {sigma}
                </div>
              </div>
              <div className="border-t border-gray-700 pt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">P(X ≤ {xValue.toFixed(1)}):</span>
                  <span className="text-orange-400 font-mono font-medium">{probability.toFixed(4)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  = P(Z ≤ {zScore.toFixed(4)}) = Φ({zScore.toFixed(4)})
                </div>
              </div>
            </div>
          </VisualizationSection>
          {/* Educational Insights - 4 Stage System */}
          <VisualizationSection className="p-3 bg-gradient-to-br from-teal-900/20 to-cyan-900/20 border-teal-600/30">
            <h4 className="text-base font-bold text-teal-300 mb-3">🎓 Learning Insights</h4>
            <div className="space-y-2 text-sm">
              {insight.stage === 0 && (
                <div>
                  <p className="text-teal-200">{insight.message}</p>
                  <div className="mt-2 p-2 bg-cyan-900/30 rounded text-xs">
                    <p className="text-cyan-300">💡 <strong>Tip:</strong> Try dragging the orange dot on the top plot!</p>
                  </div>
                </div>
              )}
              
              {insight.stage === 1 && (
                <div>
                  <p className="text-teal-200">{insight.message}</p>
                </div>
              )}
              
              {insight.stage === 2 && (
                <div>
                  <p className="text-teal-200">{insight.message}</p>
                  {interactionCount > 0 && interactionCount < 15 && (
                    <div className="mt-2 p-2 bg-teal-900/20 border border-teal-600/30 rounded">
                      <div className="text-xs text-teal-300">
                        🎯 Goal: {15 - interactionCount} more interactions to master standardization!
                      </div>
                      <div className="mt-1.5">
                        <div className="w-full bg-teal-900/30 rounded-full h-1.5">
                          <div 
                            className="bg-teal-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="text-center mt-1 text-teal-400 font-mono" style={{ fontSize: '10px' }}>
                          {interactionCount}/15
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {insight.stage === 3 && (
                <div>
                  <p className="text-green-400 font-semibold mb-1">
                    ✨ {insight.message}
                  </p>
                  {insight.application && (
                    <div className="mt-2 p-2 bg-emerald-900/30 border border-emerald-600/30 rounded">
                      <p className="text-emerald-200 text-xs">{insight.application}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>
        {/* Right side - Visualization */}
        <div className="lg:w-2/3">
          <GraphContainer height="700px">
            <h4 className="text-sm font-semibold text-white mb-2 px-4 pt-3">
              Normal Distribution Standardization
              <span className="text-xs font-normal text-gray-400 ml-2">(drag the orange point to explore)</span>
            </h4>
            <svg ref={svgRef} style={{ width: "100%", height: 680 }} />
          </GraphContainer>
        </div>
      </div>

      {/* Worked Example */}
      <VisualizationSection divider className="mt-4">
        <NormalZScoreWorkedExample 
          mu={mu}
          sigma={sigma}
          xValue={xValue}
          zScore={zScore}
          probability={probability}
        />
      </VisualizationSection>
    </VisualizationContainer>
  );
};

export default NormalZScoreExplorer;