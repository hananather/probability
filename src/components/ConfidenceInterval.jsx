"use client";
import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup,
  StatsDisplay
} from './ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../lib/design-system';
import { RangeSlider } from './ui/RangeSlider';

const margin = { top: 5, right: 5, bottom: 5, left: 5 };
const width = 800;
const height = 700;
const w_ci = 400, h_ci = 450, p_ci = 5;

// Use inference color scheme
const colorScheme = createColorScheme('inference');

const distOptions = [
  { value: "normal", label: "Normal" },
  { value: "uniform", label: "Uniform" },
  { value: "studentt", label: "Student t" },
  { value: "chisquare", label: "Chi-Square" },
  { value: "exponential", label: "Exponential" },
  { value: "centralF", label: "Central F" },
];

const view_parameters = {
  uniform: [-6, 6],
  normal: [-6, 6],
  studentt: [-6, 6],
  chisquare: [-1, 11],
  exponential: [-1, 5],
  centralF: [-1, 5],
  "": [],
};
const initial_parameters = {
  uniform: [-5, 5],
  normal: [0, 1],
  studentt: [5],
  chisquare: [5],
  exponential: [1],
  centralF: [5, 5],
  "": [],
};

export default function ConfidenceInterval() {
  const [dist, setDist] = useState("normal");
  const [n, setN] = useState(5);
  const [alpha, setAlpha] = useState(0.10);
  const [interval, setIntervalId] = useState(null);
  const [counts, setCounts] = useState([0, 0]);
  const [running, setRunning] = useState(false);
  const [param, setParam] = useState(initial_parameters["normal"]);
  const svgRef = useRef(null);
  const svgSampleRef = useRef(null);
  const muRef = useRef(0);
  const currView = view_parameters[dist];

  // Reset function
  function resetCI() {
    setCounts([0, 0]);
    d3.select(svgRef.current).selectAll("g.ball-group").remove();
    updateRectCI([0, 0]);
  }

  // Update rectangles for CI summary
  function updateRectCI(countsArr) {
    const label = ["Contains μ", "Excludes μ"];
    const svg = d3.select(svgSampleRef.current);
    const container = svg.select("g.rect-container");
    const nTotal = Math.max(countsArr[0] + countsArr[1], 1);
    const x_scale = d3.scaleBand().domain(label).range([0, w_ci - 2 * p_ci]).padding(0.2);
    const y_scale = d3.scaleLinear().domain([0, 1]).range([h_ci - 2 * p_ci - 40, 0]);
    const rects = container.selectAll("rect").data(countsArr);
    rects
      .join(
        enter =>
          enter
            .append("rect")
            .attr("x", (d, i) => x_scale(label[i]))
            .attr("width", x_scale.bandwidth())
            .attr("fill", (d, i) => (i ? "#FF8686" : "#46C8B2"))
            .attr("opacity", 0.85)
            .attr("rx", 4)
            .attr("ry", 4),
        update => update,
        exit => exit.remove()
      )
      .attr("y", (d, i) => y_scale(d / nTotal))
      .attr("height", (d, i) => y_scale(0) - y_scale(d / nTotal));
  }

  // Main D3 effect
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // Add dark background
    svg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "#0a0a0a");
    svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x_scale = d3.scaleLinear().domain(currView).range([0, width]);
    const y1 = height * 0.35; // More space for PDF
    const y2 = height * 0.15; // Gap between sample and estimate
    const y_scale = d3.scaleLinear().domain([0, 1]).range([0, y1]);
    
    // Add grid lines
    const xAxisGrid = d3.axisBottom(x_scale)
      .tickSize(height)
      .tickFormat('')
      .ticks(10);
    
    g.append('g')
      .attr('class', 'x-grid')
      .attr('transform', `translate(0,0)`)
      .call(xAxisGrid)
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3)
      .selectAll('line')
      .style('stroke', colors.chart.grid);
    
    // Add x-axis with labels
    const xAxisLabels = d3.axisBottom(x_scale)
      .ticks(10);
    
    const xAxisGroup = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxisLabels);
    
    xAxisGroup.selectAll('text')
      .style('fill', colors.chart.text)
      .style('font-size', '10px');
    
    xAxisGroup.selectAll('path, line')
      .style('stroke', colors.chart.grid);

    // Draw bars with better styling
    function drawBar(dy, label, color) {
      const axis = g.append("g").attr("class", "axis");
      
      // Background rect for label
      const textBg = axis.append("rect")
        .attr("x", -5)
        .attr("y", dy - 18)
        .attr("width", 80)
        .attr("height", 22)
        .attr("fill", "#0a0a0a")
        .attr("opacity", 0.9)
        .attr("rx", 3);
      
      // Divider line
      axis
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", dy)
        .attr("y2", dy)
        .attr("stroke", colors.chart.grid)
        .attr("stroke-width", 1)
        .attr("opacity", 0.5)
        .attr("stroke-dasharray", "5,5");
      
      // Label text
      axis
        .append("text")
        .attr("x", 5)
        .attr("y", dy - 3)
        .attr("fill", color || colors.chart.text)
        .style("font-size", "0.9em")
        .style("font-weight", "600")
        .style("text-transform", "uppercase")
        .text(label);
    }
    drawBar(y1, "Sample", "#facc15");
    drawBar(y1 + y2, "Estimate", "#46C8B2");

    // PDF path
    const pdfPath = g.append("path")
      .attr("class", "pdf")
      .attr("stroke", "#14b8a6")
      .attr("fill", "none")
      .attr("stroke-width", 3);
    const pdfArea = g.append("path")
      .attr("class", "pdf_area")
      .attr("fill", "rgba(20, 184, 166, 0.2)")
      .attr("opacity", 0.2);
    const muGroup = g.append("g").attr("opacity", 0);
    muGroup
      .append("line")
      .attr("class", "mu")
      .attr("y1", 10)
      .attr("y2", height)
      .attr("stroke", colors.chart.secondary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    muGroup
      .append("text")
      .text("μ")
      .attr("x", -4)
      .attr("y", 20)
      .attr("fill", colors.chart.secondary)
      .attr("font-size", "1.3em")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle");

    // PDF data
    function pdfData(start, end) {
      const mu = jStat[dist].mean.apply(null, param);
      muRef.current = mu;
      return d3.range(start, end, 0.01).map(x => {
        const paramArr = [x].concat(param);
        return [x, jStat[dist].pdf.apply(null, paramArr)];
      });
    }
    const data = pdfData(currView[0], currView[1]);
    const line = d3.line()
      .x(d => x_scale(d[0]))
      .y(d => y1 - y_scale(d[1]))
      .curve(d3.curveBasis);
    const area = d3.area()
      .x(d => x_scale(d[0]))
      .y0(y1)
      .y1(d => y1 - y_scale(d[1]))
      .curve(d3.curveBasis);
    pdfPath.datum(data).attr("d", line);
    pdfArea.datum(data).attr("d", area);
    muGroup
      .attr("transform", `translate(${x_scale(muRef.current)})`)
      .attr("opacity", 1);
  }, [dist, param]);

  // CI summary SVG
  useEffect(() => {
    const svg = d3.select(svgSampleRef.current);
    svg.selectAll("*").remove();
    
    svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${w_ci} ${h_ci}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    // Container for bars
    svg.append("g").attr("class", "rect-container").attr("transform", `translate(${p_ci},${p_ci + 40})`);
    
    // Add expected coverage line
    const expectedCoverage = (1 - alpha);
    const y_pos = (h_ci - 2 * p_ci - 40) * (1 - expectedCoverage) + p_ci + 40;
    
    svg.append("line")
      .attr("x1", p_ci)
      .attr("x2", w_ci - p_ci)
      .attr("y1", y_pos)
      .attr("y2", y_pos)
      .attr("stroke", "#facc15")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "8,4")
      .attr("opacity", 0.8);
    
    svg.append("text")
      .attr("x", w_ci - p_ci - 5)
      .attr("y", y_pos - 5)
      .attr("text-anchor", "end")
      .attr("fill", "#facc15")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(`Expected: ${(expectedCoverage * 100).toFixed(0)}%`);
    
    // Axes
    const label = ["Contains μ", "Excludes μ"];
    const x_scale = d3.scaleBand().domain(label).range([0, w_ci - 2 * p_ci]).padding(0.2);
    const y_scale = d3.scaleLinear().domain([0, 1]).range([h_ci - 2 * p_ci - 40, 0]);
    const xAxis = d3.axisBottom(x_scale).tickSize(0);
    const xAxisGroup = svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(${p_ci},${h_ci - p_ci})`)
      .call(xAxis);
    
    // Remove the domain line
    xAxisGroup.select(".domain").remove();
    
    xAxisGroup.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "14px")
      .style("font-weight", "600");
    
    const yAxis = d3.axisLeft(y_scale).ticks(5).tickFormat(d3.format(".0%"));
    const yAxisGroup = svg
      .append("g")
      .attr("class", "y axis")
      .attr("transform", `translate(${p_ci},${p_ci + 40})`)
      .call(yAxis);
    
    yAxisGroup.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "13px")
      .style("font-weight", "500");
    
    // Remove y-axis domain line
    yAxisGroup.select(".domain").remove();
    
    // Style axes
    svg.selectAll(".axis path, .axis line")
      .attr("stroke", colors.chart.grid);
    
    // Add grid lines
    const yGridAxis = d3.axisLeft(y_scale)
      .ticks(5)
      .tickSize(-w_ci + 2 * p_ci)
      .tickFormat("");
    
    const gridGroup = svg.append("g")
      .attr("class", "y-grid")
      .attr("transform", `translate(${p_ci},${p_ci + 40})`)
      .call(yGridAxis);
    
    gridGroup.select(".domain").remove();
    gridGroup.selectAll("line")
      .style("stroke", colors.chart.grid)
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    // Add title
    svg.append("text")
      .attr("x", w_ci / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Coverage Results");
    
    updateRectCI(counts);
  }, [counts, alpha]);

  // Tick (sample + CI)
  function tick() {
    if (!dist) return;
    // Take n samples
    const data = Array.from({ length: n }, () => jStat[dist].sample.apply(null, param));
    const mean = d3.mean(data);
    const sd = d3.deviation(data);
    const ci = jStat.tci(mean, alpha, sd, n);
    
    // Animate balls
    const svg = d3.select(svgRef.current).append("g").attr("class", "ball-group");
    const x_scale = d3.scaleLinear().domain(currView).range([0, width]);
    const y1 = height * 0.35; // Match the main effect
    const y2 = height * 0.15; // Match the main effect
    let i = 0;
    const balls = svg.selectAll(".ball").data(data).enter()
      .append("circle")
      .attr("class", "ball")
      .attr("cx", d => x_scale(d))
      .attr("cy", y1)
      .attr("r", 7)
      .style("fill", colors.chart.secondary)
      .transition()
      .duration(300)
      .attr("cy", y1 + y2 - 5)
      .on("end", function () {
        ++i;
        if (i === n) {
          const contains = ci[0] <= muRef.current && muRef.current <= ci[1];
          // Draw CI line
          svg.append("line")
            .attr("class", "ci")
            .attr("x1", x_scale(mean))
            .attr("x2", x_scale(mean))
            .attr("y1", y1 + y2 - 5)
            .attr("y2", y1 + y2 - 5)
            .attr("stroke", contains ? "#46C8B2" : "#FF8686")
            .attr("stroke-width", 5)
            .transition()
            .duration(300)
            .attr("x1", x_scale(ci[0]))
            .attr("x2", x_scale(ci[1]))
            .transition()
            .duration(800)
            .attr("y1", height)
            .attr("y2", height)
            .on("end", function () {
              d3.select(this).remove();
            });
          // Animate balls to mean
          svg.selectAll(".ball")
            .transition()
            .duration(300)
            .attr("cx", x_scale(mean))
            .style("fill", contains ? "#46C8B2" : "#FF8686")
            .transition()
            .duration(800)
            .attr("cy", height)
            .on("end", function () {
              d3.select(this).remove();
            });
          // Update counts
          setCounts(prev => {
            const idx = contains ? 0 : 1;
            const updated = [...prev];
            updated[idx] += 1;
            return updated;
          });
        }
      });
  }

  // Interval controls
  useEffect(() => {
    if (running) {
      const id = setInterval(() => tick(), 600);
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (interval) {
      clearInterval(interval);
      setIntervalId(null);
    }
  }, [running, dist, n, alpha, param]);

  // Distribution change
  function handleDistChange(e) {
    const v = e.target.value;
    setDist(v);
    setParam(initial_parameters[v]);
    resetCI();
  }

  // Parameter controls
  function handleParamChange(idx, val) {
    setParam(prev => prev.map((p, i) => (i === idx ? val : p)));
    resetCI();
  }

  // Calculate statistics
  const total = counts[0] + counts[1];
  const confidenceLevel = ((1 - alpha) * 100).toFixed(0);
  const empiricalCoverage = total > 0 ? ((counts[0] / total) * 100).toFixed(1) : '—';

  return (
    <VisualizationContainer title="Confidence Interval Simulation" className="p-2">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left side - Controls and Results */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Repeatedly sample from a distribution and construct confidence intervals. 
              The proportion containing μ should approach the confidence level.
            </p>
          </VisualizationSection>

          <VisualizationSection className="p-3">
            <ControlGroup>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <label className="text-xs text-neutral-400 min-w-[60px]">Distribution</label>
                  <select 
                    value={dist} 
                    onChange={handleDistChange} 
                    className="flex-1 bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    {distOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                {param.length > 0 && (
                  <div className="flex items-center gap-1">
                    <label className="text-xs text-neutral-400 min-w-[60px]">Parameters</label>
                    <div className="flex gap-1 flex-1">
                      {param.map((p, idx) => (
                        <input
                          key={idx}
                          type="number"
                          value={p}
                          onChange={e => handleParamChange(idx, +e.target.value)}
                          placeholder={idx === 0 ? (dist === "normal" ? "μ" : "p1") : "σ"}
                          min={dist === "normal" && idx === 1 ? 0.01 : undefined}
                          className="w-16 bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-teal-500"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-neutral-400">Sample Size</label>
                      <span className="text-sm text-teal-400 font-mono">{n}</span>
                    </div>
                    <RangeSlider
                      value={n}
                      onChange={(v) => { setN(v); resetCI(); }}
                      min={2}
                      max={50}
                      step={1}
                      showValue={false}
                      className="mt-0"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-neutral-400">Confidence Level</label>
                      <span className="text-sm text-yellow-400 font-mono">{confidenceLevel}%</span>
                    </div>
                    <RangeSlider
                      value={alpha}
                      onChange={(v) => { setAlpha(v); resetCI(); }}
                      min={0.01}
                      max={0.2}
                      step={0.01}
                      showValue={false}
                      className="mt-0"
                    />
                  </div>
                </div>
                
                <div className="flex gap-1 pt-0.5">
                  <button
                    className={cn(
                      "px-3 py-1 rounded text-sm font-medium transition-colors",
                      running ? "bg-neutral-700 hover:bg-neutral-600 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"
                    )}
                    onClick={() => setRunning(r => !r)}
                  >
                    {running ? "Stop" : "Start"}
                  </button>
                  <button
                    className="px-3 py-1 rounded text-sm font-medium bg-neutral-700 hover:bg-neutral-600 text-white transition-colors"
                    onClick={resetCI}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </ControlGroup>
          </VisualizationSection>

          {/* Results Summary */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Results Summary</h4>
            
            <div className="mb-3">
              <svg ref={svgSampleRef} style={{ width: "100%", height: 450 }} />
            </div>
            
            {/* Key comparison - highlighted for teaching */}
            <div className="bg-neutral-800 rounded-lg p-3 mb-3 border border-neutral-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-neutral-300">Empirical Coverage:</span>
                <span className="text-xl font-bold text-yellow-400">{empiricalCoverage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-300">Expected Coverage:</span>
                <span className="text-xl font-bold text-yellow-400">{confidenceLevel}%</span>
              </div>
              {total >= 20 && (
                <div className="mt-2 text-xs text-neutral-400 text-center">
                  {Math.abs(parseFloat(empiricalCoverage) - parseFloat(confidenceLevel)) < 5 ? 
                    "✓ Coverage is converging to expected value" : 
                    "Keep sampling - coverage will approach expected value"}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-neutral-800 rounded p-2">
                <div className="text-neutral-400 text-xs">Total Intervals</div>
                <div className="font-mono text-lg font-bold text-white">{total}</div>
              </div>
              <div className="bg-neutral-800 rounded p-2">
                <div className="text-neutral-400 text-xs">Contains μ</div>
                <div className="font-mono text-lg font-bold text-teal-400">{counts[0]}</div>
              </div>
            </div>
            
            <div className="space-y-1 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#46C8B2" }}></div>
                <span className="text-xs text-neutral-300">Contains μ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#FF8686" }}></div>
                <span className="text-xs text-neutral-300">Excludes μ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#14b8a6" }}></div>
                <span className="text-xs text-neutral-300">Population</span>
              </div>
            </div>
          </VisualizationSection>
        </div>
        
        {/* Right side - Main Visualization */}
        <div className="lg:w-2/3">
          <GraphContainer height="720px">
            <svg ref={svgRef} style={{ width: "100%", height: 700 }} />
          </GraphContainer>
        </div>
      </div>
    </VisualizationContainer>
  );
}
