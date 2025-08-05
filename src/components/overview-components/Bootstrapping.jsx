"use client";
import { useState, useEffect, useRef } from "react";
import * as d3 from "../../utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup,
  StatsDisplay
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { RangeSlider } from '../ui/RangeSlider';

// Use inference color scheme for bootstrapping
const colorScheme = createColorScheme('inference');

const margin = { top: 20, right: 30, bottom: 50, left: 60 };
const width = 700 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
const bins = 30;
const dt = 500; // Animation duration in milliseconds

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

export default function Bootstrapping() {
  const [dist, setDist] = useState("normal");
  const [n, setN] = useState(10);
  const [param, setParam] = useState(initial_parameters["normal"]);
  const [samples, setSamples] = useState([]); // original sample
  const [counts, setCounts] = useState([]); // means from resamples
  const [running, setRunning] = useState(false);
  const svgRef = useRef(null);
  const intervalRef = useRef(null);
  const currView = view_parameters[dist];

  // --- Cancellation ref for batch resample and reset ---
  const cancelledRef = useRef(false);

  // --- Reset: clears everything and cancels running batch ---
  function reset() {
    setSamples([]);
    setCounts([]);
    setRunning(false);
    cancelledRef.current = true;
    d3.select(svgRef.current).selectAll("*").remove();
  }

  // --- Draw static axes and PDF (runs on dist/param change only) ---
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const x = d3.scaleLinear().domain(currView).range([0, width]);
    const y1 = height / 3;
    const y2 = height / 2;
    const y3 = (2 * height) / 3;
    const y4 = height;
    const y = d3.scaleLinear().domain([0, 1]).range([y1, 0]);
    drawStatic(g, x, y1, y2, y3, y4, n);
    drawPDF(g, x, y, y1, param, dist);
    // Histogram will be drawn in its own effect
  }, [dist, param, n]);

  // --- Animate sample balls only when samples changes ---
  useEffect(() => {
    if (!samples.length) return;
    const svg = d3.select(svgRef.current).select("g");
    const x = d3.scaleLinear().domain(currView).range([0, width]);
    const y1 = height / 3;
    const y2 = height / 2;
    svg.selectAll("circle.sample").remove();
    animateSample(samples, x, y1, y2, svg);
  }, [samples, currView]);

  // --- Draw histogram only when counts changes ---
  useEffect(() => {
    const svg = d3.select(svgRef.current).select("g");
    const x = d3.scaleLinear().domain(currView).range([0, width]);
    const y3 = (2 * height) / 3;
    const y4 = height;
    const z = d3.scaleLinear().domain([0, 1]).range([y4, y3 + 10]);
    drawHistogram(svg, x, z, y4, y3, counts);
  }, [counts, currView]);

  // --- Draw the static SVG (distribution, axes, etc.)
  function drawStatic(svg, x, y1, y2, y3, y4, sampleSize) {
    function drawBar(dy, label, bgColor) {
      const axis = svg.append("g").attr("class", "axis");
      
      // Add subtle background for section
      if (bgColor) {
        axis.append("rect")
          .attr("x", x(currView[0]) - 10)
          .attr("y", dy - 5)
          .attr("width", x(currView[1]) - x(currView[0]) + 20)
          .attr("height", 30)
          .attr("fill", bgColor)
          .attr("rx", 4);
      }
      
      axis.append("line")
        .attr("x1", x(currView[0]))
        .attr("x2", x(currView[1]))
        .attr("y1", dy)
        .attr("y2", dy)
        .attr("stroke", "#fff");
      
      // Add arrow indicator
      axis.append("text")
        .attr("x", x(currView[0]) - 25)
        .attr("y", dy)
        .attr("dy", "0.35em")
        .attr("fill", "#9ca3af")
        .style("font-size", "0.9em")
        .text("▸");
      
      axis.append("text")
        .attr("x", x(currView[0]) - 10)
        .attr("y", dy)
        .attr("dy", "1.2em")
        .attr("fill", "#e5e7eb")
        .style("font-size", "0.95em")
        .style("font-weight", "500")
        .text(label);
    }
    
    drawBar(y1, "Population Distribution", "rgba(20,184,166,0.05)");
    drawBar(y2, `Your Sample (n=${sampleSize})`, "rgba(255,139,34,0.05)");
    drawBar(y3, "Current Resample", "rgba(56,161,105,0.05)");
    drawBar(y4, "Bootstrap Distribution", "rgba(253,230,138,0.05)");
  }

  // --- Draw PDF and mean line
  function drawPDF(svg, x, y, y1, param, dist) {
    const mu = jStat[dist].mean.apply(null, param);
    const pdfData = d3.range(currView[0], currView[1], 0.01).map(xVal => {
      const paramArr = [xVal].concat(param);
      return [xVal, jStat[dist].pdf.apply(null, paramArr)];
    });
    const line = d3.line()
      .x(d => x(d[0]))
      .y(d => y(d[1]))
      .curve(d3.curveBasis);
    const area = d3.area()
      .x(d => x(d[0]))
      .y0(y1)
      .y1(d => y(d[1]))
      .curve(d3.curveBasis);
    svg.append("path").attr("class", "pdf").attr("stroke", "#14b8a6").attr("fill", "none").attr("stroke-width", 2).datum(pdfData).attr("d", line);
    svg.append("path").attr("class", "pdf_area").attr("fill", "rgba(20,184,166,0.2)").attr("opacity", 0.2).datum(pdfData).attr("d", area);
    // Mu line
    svg.append("g").attr("opacity", 1)
      .append("line")
      .attr("class", "mu")
      .attr("y1", 10)
      .attr("y2", height)
      .attr("x1", x(mu))
      .attr("x2", x(mu))
      .attr("stroke", "#facc15")
      .attr("stroke-width", 2);
    svg.append("text")
      .text("μ")
      .attr("x", x(mu) - 4)
      .attr("y", 20)
      .attr("fill", "#facc15")
      .attr("font-size", "1.2em");
  }

  // --- Draw histogram of means (with smooth D3 transitions, matching jQuery logic)
  function drawHistogram(svg, x, z, y4, y3, counts) {
    let barsGroup = svg.select("g.histogram");
    if (barsGroup.empty()) {
      barsGroup = svg.append("g").attr("class", "histogram");
    }
    const histogram = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(bins));
    const histData = histogram(counts);
    // Find max bin count for scaling (always scale so tallest bar is near the top)
    const maxCount = d3.max(histData, d => d.length) || 1;
    // Scale so tallest bar is at y3+10 (top of histogram area)
    z.domain([0, maxCount]);

    // Data join
    const bars = barsGroup.selectAll("g.bar").data(histData, d => d.x0);
    // Enter
    const barEnter = bars.enter().append("g").attr("class", "bar");
    barEnter.append("rect")
      .attr("x", d => x(d.x0) + 1)
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("y", y4)
      .attr("height", 0)
      .attr("fill", "#fde68a");
    // No numbers/text in histogram bars
    bars.merge(barEnter).select("rect")
      .transition().duration(300)
      .attr("x", d => x(d.x0) + 1)
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("y", d => z(d.length))
      .attr("height", d => y4 - z(d.length));
    bars.exit().remove();
  }

  // --- Animate initial sample with staggered delays and easing
  function animateSample(data, x, y1, y2, svg) {
    svg.selectAll("circle.sample").remove();
    const balls = svg.selectAll("circle.sample").data(data).enter()
      .append("circle").attr("class","sample")
      .attr("cx", d=>x(d)).attr("cy", y1).attr("r",5).attr("fill","#FF8B22");
    balls.transition()
      .delay((d,i)=>i*(dt/n))
      .duration(dt)
      .ease(d3.easeQuad)
      .attr("cy", y2 - 5);
  }

  // --- Animate one resample group: fall, collapse, mean drop
  function animateResampleSequence(samplesArr, n, x, y2, y3, y4, svg, onComplete) {
    const resampled = Array.from({ length: n }, ()=>samplesArr[Math.floor(Math.random()*n)]);
    const mean = d3.mean(resampled);
    svg.selectAll("g.ball-group").remove();
    const group = svg.append("g").attr("class","ball-group");
    const balls = group.selectAll("circle.resample").data(resampled).enter()
      .append("circle").attr("class","resample")
      .attr("cx", d=>x(d)).attr("cy", y2).attr("r",5).attr("fill","#38a169");
    balls.transition()
      .delay((d,i)=>i*(dt/n))
      .duration(dt)
      .ease(d3.easeQuad)
      .attr("cy", y3 - 3)
      .on("end", (_,i) => {
        if (i === n - 1) {
          balls.transition()
            .delay((d,i)=>i*(dt/n))
            .duration(dt)
            .ease(d3.easeQuad)
            .attr("cx", ()=>x(mean))
            .attr("fill","#F5D800")
            .on("end", (_,j) => {
              if (j === n - 1) {
                group.append("circle").attr("class","mean")
                  .attr("cx", x(mean)).attr("cy", y3 - 3).attr("r",5).attr("fill","#F5D800")
                  .transition().duration(dt).ease(d3.easeQuad)
                  .attr("cy", y4 - 3).attr("r",3)
                  .on("end", ()=>{ group.remove(); if(onComplete) onComplete(mean); });
              }
            });
        }
      });
  }

  // --- Draw Sample button ---
  function handleSample() {
    if (!dist) return;
    cancelledRef.current = true; // stop any running batch
    const data = Array.from({ length: n }, () => jStat[dist].sample.apply(null, param));
    setSamples(data);
    setCounts([]);
  }

  // --- Resample (single) ---
  function handleResample() {
    if (!samples.length || running) return;
    setRunning(true);
    cancelledRef.current = false;
    const svg = d3.select(svgRef.current).select("g");
    const x = d3.scaleLinear().domain(currView).range([0, width]);
    const y2 = height / 2;
    const y3 = (2 * height) / 3;
    const y4 = height;
    // Take a resample from the persistent orange sample balls
    const resampled = Array.from({ length: n }, () => samples[Math.floor(Math.random() * n)]);
    const mean = d3.mean(resampled);
    svg.selectAll("g.ball-group").remove();
    const group = svg.append("g").attr("class", "ball-group");
    const balls = group.selectAll("circle.resample").data(resampled).enter()
      .append("circle").attr("class", "resample")
      .attr("cx", d => x(d)).attr("cy", y2 - 5).attr("r", 5).attr("fill", "#38a169");
    balls.transition()
      .delay((d, i) => i * (dt / n))
      .duration(dt)
      .ease(d3.easeQuad)
      .attr("cy", y3 - 3)
      .on("end", (_, i) => {
        if (i === n - 1) {
          balls.transition()
            .delay((d, i) => i * (dt / n))
            .duration(dt)
            .ease(d3.easeQuad)
            .attr("cx", () => x(mean))
            .attr("fill", "#F5D800")
            .on("end", (_, j) => {
              if (j === n - 1) {
                group.append("circle").attr("class", "mean")
                  .attr("cx", x(mean)).attr("cy", y3 - 3).attr("r", 5).attr("fill", "#F5D800")
                  .transition().duration(dt).ease(d3.easeQuad)
                  .attr("cy", y4 - 3).attr("r", 3)
                  .on("end", () => { group.remove(); setCounts(prev => [...prev, mean]); setRunning(false); });
              }
            });
        }
      });
  }

  // --- Batch resample (100x) ---
  function handleResample100() {
    if (!samples.length || running) return;
    setRunning(true);
    cancelledRef.current = false;
    const svg = d3.select(svgRef.current).select("g");
    const x = d3.scaleLinear().domain(currView).range([0, width]);
    const y2 = height / 2, y3 = (2 * height) / 3, y4 = height;
    const zScale = d3.scaleLinear().domain([0, 1]).range([y4, y3 + 10]);
    const intervalTime = dt / 20; // faster batch
    let count = 0;
    function tick() {
      if (count >= 100 || cancelledRef.current) { setRunning(false); return; }
      // Resample from persistent orange sample row
      const resampled = Array.from({ length: n }, () => samples[Math.floor(Math.random() * n)]);
      const mean = d3.mean(resampled);
      svg.selectAll("g.ball-group").remove();
      const group = svg.append("g").attr("class", "ball-group");
      const balls = group.selectAll("circle.resample").data(resampled).enter()
        .append("circle").attr("class", "resample")
        .attr("cx", d => x(d)).attr("cy", y2 - 5).attr("r", 5).attr("fill", "#38a169");
      balls.transition()
        .delay((d, i) => i * (dt / n))
        .duration(dt / 2)
        .ease(d3.easeQuad)
        .attr("cy", y3 - 3)
        .on("end", (_, i) => {
          if (i === n - 1) {
            balls.transition()
              .delay((d, i) => i * (dt / n))
              .duration(dt / 2)
              .ease(d3.easeQuad)
              .attr("cx", () => x(mean))
              .attr("fill", "#F5D800")
              .on("end", (_, j) => {
                if (j === n - 1) {
                  group.append("circle").attr("class", "mean")
                    .attr("cx", x(mean)).attr("cy", y3 - 3).attr("r", 5).attr("fill", "#F5D800")
                    .transition().duration(dt / 2).ease(d3.easeQuad)
                    .attr("cy", y4 - 3).attr("r", 3)
                    .on("end", () => { group.remove(); setCounts(prev => [...prev, mean]); });
                }
              });
          }
        });
      count++;
      setTimeout(tick, intervalTime);
    }
    tick();
  }

  // --- Distribution/param controls
  function handleDistChange(e) {
    const v = e.target.value;
    setDist(v);
    setParam(initial_parameters[v]);
    reset();
  }
  function handleParamChange(idx, val) {
    setParam(prev => prev.map((p, i) => (i === idx ? val : p)));
    reset();
  }

  // Calculate statistics
  const theoreticalMean = dist && param ? jStat[dist].mean.apply(null, param) : null;
  const sampleMean = samples.length > 0 ? d3.mean(samples) : null;
  const bootstrapMean = counts.length > 0 ? d3.mean(counts) : null;
  const bootstrapSE = counts.length > 1 ? d3.deviation(counts) : null;

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Bootstrapping Simulation</h3>
      
      {/* Enhanced control layout with better spacing and grouping */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-6">
          {/* Distribution Settings Group */}
          <div className="flex flex-wrap items-center gap-4 pr-6 border-r border-gray-700">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Distribution:</label>
              <select 
                value={dist} 
                onChange={handleDistChange} 
                className="px-3 py-1.5 rounded bg-gray-900 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                {distOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            {dist === "normal" && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-300">μ:</label>
                  <input
                    type="number"
                    value={param[0]}
                    onChange={e => handleParamChange(0, +e.target.value)}
                    className="w-20 px-2 py-1.5 rounded bg-gray-900 text-white border border-gray-700 font-mono text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-300">σ:</label>
                  <input
                    type="number"
                    value={param[1]}
                    min="0.01"
                    onChange={e => handleParamChange(1, +e.target.value)}
                    className="w-20 px-2 py-1.5 rounded bg-gray-900 text-white border border-gray-700 font-mono text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </>
            )}
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Sample Size:</label>
              <input
                type="range"
                min="2"
                max="50"
                value={n}
                onChange={e => { setN(+e.target.value); reset(); }}
                className="w-32 accent-orange-500"
              />
              <span className="font-mono text-sm text-white w-8">{n}</span>
            </div>
          </div>
          
          {/* Actions Group */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSample}
              disabled={running}
            >
              Draw Sample
            </button>
            <button
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleResample}
              disabled={!samples.length || running}
            >
              Resample
            </button>
            <button
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleResample100}
              disabled={!samples.length || running}
            >
              Resample ×100
            </button>
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={reset}
              disabled={running}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Visualization */}
      <div className="w-full" style={{ maxWidth: 800, margin: "auto" }}>
        <svg ref={svgRef} style={{ width: "100%", height: 500 }} />
      </div>
      
      {/* Statistics Panel */}
      {(samples.length > 0 || counts.length > 0) && (
        <div className="bg-gray-800 rounded-lg p-4" style={{ maxWidth: 800, margin: "auto" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-300">📊 Statistics:</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Population μ:</span>
              <span className="ml-2 font-mono text-white">
                {theoreticalMean !== null ? theoreticalMean.toFixed(3) : '--'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Sample x̄:</span>
              <span className="ml-2 font-mono text-white">
                {sampleMean !== null ? sampleMean.toFixed(3) : '--'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Bootstrap μ̂:</span>
              <span className="ml-2 font-mono text-white">
                {bootstrapMean !== null ? bootstrapMean.toFixed(3) : '--'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Bootstrap SE:</span>
              <span className="ml-2 font-mono text-white">
                {bootstrapSE !== null ? bootstrapSE.toFixed(3) : '--'}
              </span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-gray-400 text-sm">Resamples:</span>
            <span className="ml-2 font-mono text-white text-sm">{counts.length}</span>
          </div>
        </div>
      )}
    </section>
  );
}