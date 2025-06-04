"use client";
import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import WorkedExample from './WorkedExample';
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from './ui/VisualizationContainer';
import { colors, typography, formatNumber, cn, createColorScheme } from '../lib/design-system';
import { RangeSlider } from './ui/RangeSlider';

// Use sampling color scheme
const colorScheme = createColorScheme('sampling');

export default function DistributionSimulation() {
  // probabilities for faces 1–6
  const [probs, setProbs] = useState(Array(6).fill(1 / 6));
  // debounce probs for worked example to avoid flicker during drag
  const [displayProbs, setDisplayProbs] = useState(probs);
  useEffect(() => {
    const handler = setTimeout(() => setDisplayProbs(probs), 300);
    return () => clearTimeout(handler);
  }, [probs]);
  // observed counts for each face
  const [counts, setCounts] = useState(Array(6).fill(0));
  // batch roll controls
  const [sampleCount, setSampleCount] = useState(10);
  const [isRolling, setIsRolling] = useState(false);

  // refs for D3-managed SVGs and data arrays
  const barSvgRef = useRef(null);
  const plotSvgRef = useRef(null);
  const expectedDataRef = useRef([]);
  const varianceDataRef = useRef([]);

  // derived true stats
  const trueExpectation = probs.reduce((sum, p, i) => sum + p * (i + 1), 0);
  const trueVariance = probs.reduce((sum, p, i) => {
    const x = i + 1;
    return sum + p * Math.pow(x - trueExpectation, 2);
  }, 0);
  const trueE2 = probs.reduce((sum, p, i) => sum + p * Math.pow(i + 1, 2), 0);
  
  // Tooltip state for drag feedback
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, value: 0 });


  // sample distribution stats
  const sampleTotal = counts.reduce((a, b) => a + b, 0);
  const sampleMean = sampleTotal > 0 ? counts.reduce((sum, c, i) => sum + (i + 1) * c, 0) / sampleTotal : 0;
  const sampleVariance = sampleTotal > 0 ? counts.reduce((sum, c, i) => sum + Math.pow((i + 1) - sampleMean, 2) * c, 0) / sampleTotal : 0;

  // draw bar chart: true probabilities only
  useEffect(() => {
    const svg = d3.select(barSvgRef.current);
    if (!barSvgRef.current) return;
    
    const { width } = barSvgRef.current.getBoundingClientRect();
    const height = 240;
    const margin = { top: 10, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Add dark background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // data: only true distribution
    const data = probs.map((p, i) => ({ face: i + 1, value: p }));

    const x = d3.scaleBand()
      .domain(data.map(d => d.face))
      .range([0, innerWidth])
      .padding(0.2);
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);

    // X axis
    const xAxisGroup = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));
    
    xAxisGroup.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxisGroup.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px");
    
    xAxisGroup.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", colors.chart.text)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("text-anchor", "middle")
      .text("Die Face");

    // Y axis
    const yAxisGroup = g.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));
    
    yAxisGroup.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxisGroup.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "11px");

    // Create invisible hit areas for better drag interaction
    const hitAreas = g.selectAll("rect.hit-area").data(data).join("rect")
      .attr("class", "hit-area")
      .attr("x", d => x(d.face))
      .attr("y", 0)
      .attr("width", x.bandwidth())
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("cursor", "ns-resize");

    // Visible bars
    const bars = g.selectAll("rect.bar").data(data).join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.face))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => innerHeight - y(d.value))
      .attr("fill", colorScheme.chart.primary)
      .attr("opacity", 0.8)
      .attr("rx", 4)
      .style("pointer-events", "none"); // Disable pointer events on visible bars

    // Hover effects on hit areas
    hitAreas
      .on("mouseover", function(_, d) { 
        bars.filter(b => b.face === d.face)
          .transition()
          .duration(150)
          .attr("opacity", 1)
          .attr("fill", colorScheme.chart.primaryLight); 
      })
      .on("mouseout", function(_, d) { 
        bars.filter(b => b.face === d.face)
          .transition()
          .duration(150)
          .attr("opacity", 0.8)
          .attr("fill", colorScheme.chart.primary); 
      });

    // Simple drag behavior that works
    const dragBehavior = d3.drag()
      .on("start", function(_, d) {
        // Highlight the bar being dragged
        bars.filter(b => b.face === d.face)
          .attr("opacity", 1)
          .attr("fill", colorScheme.chart.primaryLight);
        
        // Show tooltip
        const rect = this.getBoundingClientRect();
        setTooltip({ 
          show: true, 
          x: rect.left + rect.width / 2, 
          y: rect.top - 40,
          value: probs[d.face - 1]
        });
      })
      .on("drag", function(event, d) {
        // Direct conversion from mouse position to probability - simple and effective!
        const newVal = Math.max(0, Math.min(1, y.invert(event.y)));
        const oldVal = probs[d.face - 1];
        
        // Update tooltip
        const rect = this.getBoundingClientRect();
        setTooltip({ 
          show: true, 
          x: rect.left + rect.width / 2, 
          y: rect.top - 40,
          value: newVal
        });
        
        // Redistribute probabilities using the exact formula from your working code
        let updated = probs.map((p, idx) =>
          idx === d.face - 1 ? newVal : (oldVal === 1 ? (1 - newVal) / 5 : p * (1 - newVal) / (1 - oldVal))
        );
        
        // Ensure all values are non-negative and normalize to sum = 1
        updated = updated.map(p => Math.max(0, p));
        const sum = updated.reduce((a, b) => a + b, 0);
        if (sum > 0) {
          updated = updated.map(p => p / sum);
        }
        
        setProbs(updated);
        expectedDataRef.current = [];
        varianceDataRef.current = [];
      })
      .on("end", function(_, d) {
        // Reset bar appearance
        bars.filter(b => b.face === d.face)
          .attr("opacity", 0.8)
          .attr("fill", colorScheme.chart.primary);
        
        // Hide tooltip
        setTooltip({ show: false, x: 0, y: 0, value: 0 });
      });
    
    // Apply drag behavior to hit areas
    hitAreas.call(dragBehavior);

    // Percentage labels (non-interactive to not interfere with drag)
    g.selectAll("text.bar-label").data(data).join("text")
      .attr("class", "bar-label")
      .attr("x", d => x(d.face) + x.bandwidth() / 2)
      .attr("y", d => Math.max(20, y(d.value) - 8))
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "13px")
      .style("font-weight", "600")
      .style("pointer-events", "none")
      .text(d => `${(d.value * 100).toFixed(1)}%`);
  }, [probs]);

  // draw convergence plot for mean & variance
  useEffect(() => {
    const svg = d3.select(plotSvgRef.current);
    if (!plotSvgRef.current) return;
    
    const { width } = plotSvgRef.current.getBoundingClientRect();
    const height = 310;
    const margin = { top: 10, right: 120, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Add dark background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const n = Math.max(expectedDataRef.current.length, 1);
    const xScale = d3.scaleLinear().domain([1, Math.max(n, 10)]).range([0, innerWidth]);
    
    // y domain covers both series and true lines
    const maxY = d3.max([
      trueExpectation, 
      trueVariance, 
      d3.max(expectedDataRef.current) || 0, 
      d3.max(varianceDataRef.current) || 0
    ]) * 1.1;
    const yScale = d3.scaleLinear().domain([0, maxY]).range([innerHeight, 0]);

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);

    // axes
    const xAxis = g.append('g')
      .attr('class','x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5));
    
    xAxis.selectAll('path, line').attr('stroke', colors.chart.grid);
    xAxis.selectAll('text')
      .attr('fill', colors.chart.text)
      .style('font-size', '11px');
    
    xAxis.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", colors.chart.text)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("text-anchor", "middle")
      .text("Number of Rolls");

    const yAxis = g.append('g')
      .attr('class','y-axis')
      .call(d3.axisLeft(yScale).ticks(5));
    
    yAxis.selectAll('path, line').attr('stroke', colors.chart.grid);
    yAxis.selectAll('text')
      .attr('fill', colors.chart.text)
      .style('font-size', '11px');

    // true lines
    g.append("line")
      .attr("x1", xScale(1))
      .attr("x2", xScale(Math.max(n, 10)))
      .attr("y1", yScale(trueExpectation))
      .attr("y2", yScale(trueExpectation))
      .attr("stroke", colorScheme.chart.secondary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "8 4")
      .attr("opacity", 0.8);
    
    g.append("line")
      .attr("x1", xScale(1))
      .attr("x2", xScale(Math.max(n, 10)))
      .attr("y1", yScale(trueVariance))
      .attr("y2", yScale(trueVariance))
      .attr("stroke", colorScheme.chart.tertiary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "8 4")
      .attr("opacity", 0.8);

    // sample lines
    if (expectedDataRef.current.length > 0) {
      const linePlot = d3.line()
        .x((_, i) => xScale(i + 1))
        .y(d => yScale(d))
        .curve(d3.curveMonotoneX);
      
      g.append("path")
        .datum(expectedDataRef.current)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 3)
        .attr("d", linePlot);
      
      g.append("path")
        .datum(varianceDataRef.current)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 3)
        .attr("opacity", 0.6)
        .attr("d", linePlot);
    }

    // Enhanced legend
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth + 10}, 20)`);
    
    const legendItems = [
      { color: colorScheme.chart.primary, label: "Sample Mean", y: 0 },
      { color: colorScheme.chart.secondary, label: "True Mean", y: 25, dashed: true },
      { color: colorScheme.chart.primary, label: "Sample Var", y: 50, opacity: 0.6 },
      { color: colorScheme.chart.tertiary, label: "True Var", y: 75, dashed: true }
    ];
    
    legendItems.forEach(item => {
      if (item.dashed) {
        legend.append("line")
          .attr("x1", 0)
          .attr("x2", 20)
          .attr("y1", item.y + 5)
          .attr("y2", item.y + 5)
          .attr("stroke", item.color)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4 2");
      } else {
        legend.append("rect")
          .attr("x", 0)
          .attr("y", item.y)
          .attr("width", 20)
          .attr("height", 10)
          .attr("fill", item.color)
          .attr("opacity", item.opacity || 1);
      }
      
      legend.append("text")
        .attr("x", 25)
        .attr("y", item.y + 8)
        .text(item.label)
        .attr("font-size", "12px")
        .attr("fill", colors.chart.text);
    });

    // Add latest value labels if data exists
    if (expectedDataRef.current.length > 0) {
      const lastMean = expectedDataRef.current[expectedDataRef.current.length - 1];
      const lastVar = varianceDataRef.current[varianceDataRef.current.length - 1];
      
      g.append("text")
        .attr("x", xScale(n) + 5)
        .attr("y", yScale(lastMean))
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "11px")
        .style("font-weight", "600")
        .text(lastMean.toFixed(2));
      
      g.append("text")
        .attr("x", xScale(n) + 5)
        .attr("y", yScale(lastVar))
        .attr("fill", colorScheme.chart.primary)
        .attr("opacity", 0.6)
        .style("font-size", "11px")
        .style("font-weight", "600")
        .text(lastVar.toFixed(2));
    }
  }, [counts, probs, trueExpectation, trueVariance]);

  // handle one roll
  function rollOnce() {
    const r = Math.random();
    const cum = probs.reduce((arr, p, i) => { arr.push((arr[i - 1] || 0) + p); return arr; }, []);
    const face = cum.findIndex(c => r < c);
    const updated = [...counts];
    updated[face]++;
    setCounts(updated);
    const total = updated.reduce((a, b) => a + b, 0);
    const mean = updated.reduce((a, c, i) => a + (i + 1) * c, 0) / total;
    expectedDataRef.current.push(mean);
    const variance = updated.reduce((a, c, i) => a + Math.pow((i + 1) - mean, 2) * c, 0) / total;
    varianceDataRef.current.push(variance);
  }

  // handle multiple rolls
  function rollMultiple() {
    if (isRolling) return;
    setIsRolling(true);
    expectedDataRef.current = [];
    varianceDataRef.current = [];
    
    const animate = (i = 0, current = [...counts]) => {
      if (i >= sampleCount) {
        setCounts(current);
        setIsRolling(false);
        return;
      }
      const r = Math.random();
      const cum = probs.reduce((arr, p, idx) => { arr.push((arr[idx - 1] || 0) + p); return arr; }, []);
      const face = cum.findIndex(c => r < c);
      current[face]++;
      const total = current.reduce((a, b) => a + b, 0);
      const mean = current.reduce((a, c, idx) => a + (idx + 1) * c, 0) / total;
      expectedDataRef.current.push(mean);
      const variance = current.reduce((a, c, idx) => a + Math.pow((idx + 1) - mean, 2) * c, 0) / total;
      varianceDataRef.current.push(variance);
      setCounts([...current]);
      
      // Faster animation for larger sample sizes
      const delay = sampleCount > 50 ? 20 : sampleCount > 20 ? 50 : 100;
      setTimeout(() => animate(i + 1, current), delay);
    };
    animate(0, [...counts]);
  }

  // reset all
  function handleReset() {
    setProbs(Array(6).fill(1 / 6));
    setCounts(Array(6).fill(0));
    setSampleCount(1);
    setInputValue("1");
    expectedDataRef.current = [];
    varianceDataRef.current = [];
  }

  return (
    <VisualizationContainer title="Distribution Simulation: Expectation & Variance" className="p-2">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left side - Controls and Stats */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Explore how sample mean and variance converge to their true values as sample size increases. 
              Drag the bars to adjust probabilities and see how it affects the distribution's properties.
            </p>
          </VisualizationSection>

          <VisualizationSection className="p-3">
            <ControlGroup>
              <div className="space-y-3">
                {/* Sample size control */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-neutral-300">Sample Size</label>
                    <span className="text-sm font-mono text-cyan-400">{sampleCount}</span>
                  </div>
                  <RangeSlider
                    value={sampleCount}
                    onChange={setSampleCount}
                    min={1}
                    max={100}
                    step={1}
                    showValue={false}
                    className="accent-cyan-500"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    className={cn(
                      "flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                      "bg-cyan-600 hover:bg-cyan-700 text-white"
                    )}
                    onClick={rollOnce}
                    disabled={isRolling}
                  >
                    Roll Once
                  </button>
                  <button
                    className={cn(
                      "flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                      "bg-purple-600 hover:bg-purple-700 text-white"
                    )}
                    onClick={rollMultiple}
                    disabled={isRolling}
                  >
                    Roll {sampleCount}×
                  </button>
                </div>
                
                <button
                  className={cn(
                    "w-full px-3 py-1.5 rounded text-sm font-medium transition-colors",
                    "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                  onClick={handleReset}
                >
                  Reset All
                </button>
              </div>
            </ControlGroup>
          </VisualizationSection>

          {/* Statistics Display */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Statistics Comparison</h4>
            
            <div className="space-y-3">
              {/* Sample stats */}
              <div className="bg-neutral-800 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-cyan-400 mb-2">Sample ({sampleTotal} rolls)</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-300">Mean:</span>
                    <span className="text-sm font-mono font-bold text-white">{formatNumber(sampleMean)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-300">Variance:</span>
                    <span className="text-sm font-mono font-bold text-white">{formatNumber(sampleVariance)}</span>
                  </div>
                </div>
              </div>

              {/* True stats */}
              <div className="bg-neutral-800 rounded-lg p-3 border border-purple-600/50">
                <h5 className="text-sm font-semibold text-purple-400 mb-2">True Distribution</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-300">Expected Value:</span>
                    <span className="text-sm font-mono font-bold text-white">{formatNumber(trueExpectation)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-300">Variance:</span>
                    <span className="text-sm font-mono font-bold text-white">{formatNumber(trueVariance)}</span>
                  </div>
                </div>
              </div>

              {/* Convergence indicator */}
              {sampleTotal >= 50 && (
                <div className="text-xs text-neutral-400 text-center p-2 bg-neutral-800 rounded">
                  {Math.abs(sampleMean - trueExpectation) < 0.1 ? 
                    "✓ Sample mean is converging to expected value" : 
                    "Keep rolling - statistics will converge with more samples"}
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>

        {/* Right side - Visualizations */}
        <div className="lg:w-2/3 space-y-4">
          {/* Probability Distribution */}
          <GraphContainer height="300px">
            <h4 className="text-sm font-semibold text-white mb-2 px-4 pt-3">
              Probability Distribution 
              <span className="text-xs font-normal text-gray-400 ml-2">(drag bars up/down to adjust)</span>
            </h4>
            <svg ref={barSvgRef} style={{ width: "100%", height: 280 }} />
          </GraphContainer>

          {/* Convergence Plot */}
          <GraphContainer height="350px">
            <h4 className="text-sm font-semibold text-white mb-2 px-4 pt-3">Convergence of Mean & Variance</h4>
            <svg ref={plotSvgRef} style={{ width: "100%", height: 330 }} />
          </GraphContainer>
        </div>
      </div>

      {/* Worked Example */}
      <VisualizationSection divider className="mt-4">
        <WorkedExample key={displayProbs.join(',')} probs={displayProbs} />
      </VisualizationSection>
      
      {/* Tooltip for drag feedback */}
      {tooltip.show && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          {(tooltip.value * 100).toFixed(1)}%
        </div>
      )}
    </VisualizationContainer>
  );
}
