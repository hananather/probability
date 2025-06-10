"use client";
import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import ExpectationVarianceWorkedExample from './2-2-2-ExpectationVarianceWorkedExample';
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { RangeSlider } from '../ui/RangeSlider';

// Use probability color scheme for discrete distributions
const colorScheme = createColorScheme('probability');

export default function ExpectationVariance() {
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
  const scalesRef = useRef({ x: null, y: null });
  const barsRef = useRef(null);
  const labelsRef = useRef(null);

  // derived true stats
  const trueExpectation = probs.reduce((sum, p, i) => sum + p * (i + 1), 0);
  const trueVariance = probs.reduce((sum, p, i) => {
    const x = i + 1;
    return sum + p * Math.pow(x - trueExpectation, 2);
  }, 0);
  const trueE2 = probs.reduce((sum, p, i) => sum + p * Math.pow(i + 1, 2), 0);

  // sample distribution stats
  const sampleTotal = counts.reduce((a, b) => a + b, 0);
  const sampleMean = sampleTotal > 0 ? counts.reduce((sum, c, i) => sum + (i + 1) * c, 0) / sampleTotal : 0;
  const sampleVariance = sampleTotal > 0 ? counts.reduce((sum, c, i) => sum + Math.pow((i + 1) - sampleMean, 2) * c, 0) / sampleTotal : 0;

  // Initialize bar chart once
  useEffect(() => {
    const svg = d3.select(barSvgRef.current);
    const { width } = barSvgRef.current.getBoundingClientRect();
    const height = 240;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Dark background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");

    const data = probs.map((p, i) => ({ face: i + 1, value: p }));

    // Scales include margins directly
    const x = d3.scaleBand()
      .domain(data.map(d => d.face))
      .range([margin.left, width - margin.right])
      .padding(0.2);
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top]);

    // Store scales for later use
    scalesRef.current = { x, y };

    // Grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);

    // X axis
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(0));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text").attr("fill", colors.chart.text);

    // Y axis
    const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat(d => `${(d * 100).toFixed(0)}%`));

    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "11px");

    // Bars - directly on SVG
    const bars = svg.selectAll("rect.bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.face))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.value))
      .attr("fill", colorScheme.chart.primary)
      .attr("opacity", 0.8)
      .attr("rx", 4)
      .style("cursor", "ns-resize");

    barsRef.current = bars;

    // Hover effects
    bars
      .on("mouseover", function(_, d) { 
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 1)
          .attr("fill", colorScheme.chart.primaryLight); 
      })
      .on("mouseout", function(_, d) { 
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 0.8)
          .attr("fill", colorScheme.chart.primary); 
      });

    // Helper function to update bars directly
    const updateBarsDirectly = (newProbs) => {
      const y = scalesRef.current.y;
      
      bars.each(function(d, i) {
        d3.select(this)
          .attr("y", y(newProbs[i]))
          .attr("height", y(0) - y(newProbs[i]));
      });
      
      // Update labels
      labelsRef.current.each(function(d, i) {
        d3.select(this).text(`${(newProbs[i] * 100).toFixed(0)}%`);
      });
    };

    // Drag behavior
    bars.call(
      d3.drag()
        .on("drag", (event, d) => {
          const newVal = Math.max(0, Math.min(1, y.invert(event.y)));
          const oldVal = probs[d.face - 1];
          
          // Redistribute probabilities
          let updated = probs.map((p, idx) =>
            idx === d.face - 1 ? newVal : (oldVal === 1 ? (1 - newVal) / 5 : p * (1 - newVal) / (1 - oldVal))
          );
          
          // Ensure all values are non-negative and normalize to sum = 1
          updated = updated.map(p => Math.max(0, p));
          const sum = updated.reduce((a, b) => a + b, 0);
          if (sum > 0) {
            updated = updated.map(p => p / sum);
          }
          
          // Update bars directly without re-rendering
          updateBarsDirectly(updated);
          
          // Update React state (for other components)
          setProbs(updated);
          expectedDataRef.current = [];
          varianceDataRef.current = [];
        })
    );

    // Percentage labels
    const labels = svg.selectAll("text.bar-label")
      .data(data)
      .join("text")
      .attr("class", "bar-label")
      .attr("x", d => x(d.face) + x.bandwidth() / 2)
      .attr("y", d => y(d.value) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .attr("font-size", "12px")
      .text(d => `${(d.value * 100).toFixed(0)}%`);

    labelsRef.current = labels;

    // Die face icons with background
    const dieGroups = svg.selectAll("g.die-face")
      .data(data)
      .join("g")
      .attr("class", "die-face");

    // Die background
    dieGroups.append("rect")
      .attr("x", d => x(d.face) + x.bandwidth() / 2 - 15)
      .attr("y", height - 28)
      .attr("width", 30)
      .attr("height", 25)
      .attr("rx", 4)
      .attr("fill", "#1a1a1a")
      .attr("stroke", colors.chart.grid)
      .attr("stroke-width", 1);

    // Die icons
    dieGroups.append("text")
      .attr("x", d => x(d.face) + x.bandwidth() / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .attr("font-size", "20px")
      .text(d => ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][d.face - 1]);

  }, []); // Only run once on mount

  // Update bars when probs change externally (e.g., reset)
  useEffect(() => {
    if (barsRef.current && scalesRef.current.y) {
      const y = scalesRef.current.y;
      
      barsRef.current.each(function(d, i) {
        d3.select(this)
          .transition()
          .duration(300)
          .attr("y", y(probs[i]))
          .attr("height", y(0) - y(probs[i]));
      });
      
      if (labelsRef.current) {
        labelsRef.current.each(function(d, i) {
          d3.select(this)
            .transition()
            .duration(300)
            .attr("y", y(probs[i]) - 5)
            .text(`${(probs[i] * 100).toFixed(0)}%`);
        });
      }
    }
  }, [probs]);

  // draw convergence plot
  useEffect(() => {
    const svg = d3.select(plotSvgRef.current);
    const { width } = plotSvgRef.current.getBoundingClientRect();
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Dark background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");

    const n = Math.max(expectedDataRef.current.length, 1);
    const xScale = d3.scaleLinear()
      .domain([0, n])
      .range([margin.left, width - margin.right]);
    
    const maxY = Math.max(6, d3.max(expectedDataRef.current) || 6, d3.max(varianceDataRef.current) || 6);
    const yScale = d3.scaleLinear()
      .domain([0, maxY])
      .range([height - margin.bottom, margin.top]);

    // Axes
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(5));
    
    const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5));

    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text").attr("fill", colors.chart.text);
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text").attr("fill", colors.chart.text);

    // True lines
    svg.append("line")
      .attr("x1", xScale(0))
      .attr("x2", xScale(n))
      .attr("y1", yScale(trueExpectation))
      .attr("y2", yScale(trueExpectation))
      .attr("stroke", colorScheme.chart.primary)
      .attr("stroke-dasharray", "4 2")
      .attr("opacity", 0.5);

    svg.append("line")
      .attr("x1", xScale(0))
      .attr("x2", xScale(n))
      .attr("y1", yScale(trueVariance))
      .attr("y2", yScale(trueVariance))
      .attr("stroke", colorScheme.chart.secondary)
      .attr("stroke-dasharray", "4 2")
      .attr("opacity", 0.5);

    // Sample lines
    const linePlot = d3.line()
      .x((_, i) => xScale(i + 1))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);

    if (expectedDataRef.current.length > 0) {
      svg.append("path")
        .datum(expectedDataRef.current)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 2)
        .attr("d", linePlot);
    }

    if (varianceDataRef.current.length > 0) {
      svg.append("path")
        .datum(varianceDataRef.current)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 2)
        .attr("d", linePlot);
    }

    // Labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .attr("font-size", "12px")
      .text("Number of Rolls");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .attr("font-size", "12px")
      .text("Value");

  }, [counts, probs]);

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
    // Don't reset the data - keep existing history!
    
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
    setSampleCount(10);
    expectedDataRef.current = [];
    varianceDataRef.current = [];
  }

  return (
    <VisualizationContainer
      title="🎲 Expectation & Variance Explorer"
      description={
        <>
          <p className={typography.description}>
            <strong>Can you make a loaded die?</strong> Drag the probability bars to design your own unfair die, 
            then watch how it affects the expected value (mean) and variance (spread).
          </p>
          <p className={cn(typography.description, "mt-2")}>
            <span className="text-emerald-400">Expected value</span> tells you the average outcome over many rolls, while 
            <span className="text-purple-400"> variance</span> measures how spread out your results will be. 
            Watch them converge as you collect more data!
          </p>
        </>
      }
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left side - Controls and Stats */}
        <div className="lg:w-1/3 space-y-4">
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Sampling Controls</h4>
            <ControlGroup>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    Batch Size: {sampleCount}
                  </label>
                  <RangeSlider
                    value={sampleCount}
                    onChange={(v) => setSampleCount(v)}
                    min={1}
                    max={100}
                    step={1}
                    className="mb-2"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={rollOnce}
                    disabled={isRolling}
                    className={cn(
                      components.button.base,
                      components.button.secondary,
                      "flex-1"
                    )}
                  >
                    Roll Once
                  </button>
                  <button
                    onClick={rollMultiple}
                    disabled={isRolling}
                    className={cn(
                      components.button.base,
                      components.button.primary,
                      "flex-1"
                    )}
                  >
                    {isRolling ? 'Rolling...' : `Roll ${sampleCount}x`}
                  </button>
                </div>
                <button
                  onClick={handleReset}
                  className={cn(
                    components.button.base,
                    components.button.destructive,
                    "w-full"
                  )}
                >
                  Reset All
                </button>
              </div>
            </ControlGroup>
          </VisualizationSection>

          {/* Stats Display */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Statistics</h4>
            <div className="space-y-4">
              {/* True statistics */}
              <div className="bg-gray-800/30 rounded-lg p-3 space-y-2">
                <h5 className="text-sm font-semibold text-gray-300">True Distribution</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Expected Value:</span>
                    <span className="font-mono text-emerald-400 font-medium">
                      {formatNumber(trueExpectation)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Variance:</span>
                    <span className="font-mono text-purple-400 font-medium">
                      {formatNumber(trueVariance)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">E[X²]:</span>
                    <span className="font-mono text-gray-300 font-medium">
                      {formatNumber(trueE2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample statistics */}
              <div className="bg-gray-800/30 rounded-lg p-3 space-y-2">
                <h5 className="text-sm font-semibold text-gray-300">
                  Sample Distribution ({sampleTotal} rolls)
                </h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Sample Mean:</span>
                    <span className="font-mono text-emerald-400 font-medium">
                      {sampleTotal > 0 ? formatNumber(sampleMean) : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Sample Variance:</span>
                    <span className="font-mono text-purple-400 font-medium">
                      {sampleTotal > 0 ? formatNumber(sampleVariance) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Counts */}
              <div className="bg-gray-800/30 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-gray-300 mb-2">Roll Counts</h5>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {counts.map((count, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-2xl mr-1">
                        {["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][i]}
                      </span>
                      <span className="font-mono text-gray-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </VisualizationSection>
        </div>

        {/* Right side - Visualizations */}
        <div className="lg:flex-1 space-y-4">
          <GraphContainer title="Probability Distribution (Drag to adjust!)">
            <svg ref={barSvgRef} className="w-full" style={{ height: 240 }} />
          </GraphContainer>

          <GraphContainer title="Convergence to True Values">
            <svg ref={plotSvgRef} className="w-full" style={{ height: 300 }} />
            <div className="mt-2 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${colorScheme.chipColors.primary}`} />
                <span className="text-gray-400">Expected Value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${colorScheme.chipColors.secondary}`} />
                <span className="text-gray-400">Variance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 border-t-2 border-dashed border-gray-500" />
                <span className="text-gray-400">True Values</span>
              </div>
            </div>
          </GraphContainer>
        </div>
      </div>

      {/* Worked Example */}
      <div className="mt-6">
        <ExpectationVarianceWorkedExample probs={displayProbs} />
      </div>
    </VisualizationContainer>
  );
}