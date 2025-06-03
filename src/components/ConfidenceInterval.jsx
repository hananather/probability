// src/components/ConfidenceInterval.jsx
// React translation of the confidence interval simulation
"use client";

import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";
import { Button } from "./ui/button";

const margin = { top: 15, right: 5, bottom: 15, left: 5 };
const width = 800;
const height = 600;
const w_ci = 350, h_ci = 200, p_ci = 30;

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

  // Utility
  function round(x, d = 2) {
    return Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
  }

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
    const x_scale = d3.scaleBand().domain(label).range([0, w_ci - 2 * p_ci]).padding(0.5);
    const y_scale = d3.scaleLinear().domain([0, 1]).range([h_ci - 2 * p_ci, 0]);
    const rects = container.selectAll("rect").data(countsArr);
    rects
      .join(
        enter =>
          enter
            .append("rect")
            .attr("x", (d, i) => x_scale(label[i]))
            .attr("width", x_scale.bandwidth())
            .attr("fill", (d, i) => (i ? "#FF8686" : "#46C8B2"))
            .attr("opacity", 0.75),
        update => update,
        exit => exit.remove()
      )
      .attr("y", (d, i) => y_scale(d / nTotal))
      .attr("height", (d, i) => y_scale(0) - y_scale(d / nTotal));
  }

  // Main D3 effect
  useEffect(() => {
    // Set up SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x_scale = d3.scaleLinear().domain(currView).range([0, width]);
    const y1 = height / 4;
    const y2 = height / 5;
    const y_scale = d3.scaleLinear().domain([0, 1]).range([0, y1]);

    // Draw bars
    function drawBar(dy, label) {
      const axis = g.append("g").attr("class", "axis");
      axis
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", dy)
        .attr("y2", dy)
        .attr("stroke", "#fff");
      axis
        .append("text")
        .attr("x", 0)
        .attr("y", dy)
        .attr("dy", "1em")
        .attr("fill", "#fff")
        .style("font-size", "1.1em")
        .text(label);
    }
    drawBar(y1, "sample");
    drawBar(y1 + y2, "estimate");

    // PDF path
    const pdfPath = g.append("path").attr("class", "pdf").attr("stroke", "#14b8a6").attr("fill", "none").attr("stroke-width", 2);
    const pdfArea = g.append("path").attr("class", "pdf_area").attr("fill", "rgba(20,184,166,0.2)").attr("opacity", 0.2);
    const muGroup = g.append("g").attr("opacity", 0);
    muGroup
      .append("line")
      .attr("class", "mu")
      .attr("y1", 10)
      .attr("y2", height)
      .attr("stroke", "#facc15")
      .attr("stroke-width", 2);
    muGroup
      .append("text")
      .text("μ")
      .attr("x", -4)
      .attr("y", 20)
      .attr("fill", "#facc15")
      .attr("font-size", "1.2em");

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
    svg.append("g").attr("class", "rect-container").attr("transform", `translate(${p_ci},${p_ci})`);
    // Axes
    const label = ["Contains μ", "Excludes μ"];
    const x_scale = d3.scaleBand().domain(label).range([0, w_ci - 2 * p_ci]).padding(0.5);
    const y_scale = d3.scaleLinear().domain([0, 1]).range([h_ci - 2 * p_ci, 0]);
    const xAxis = d3.axisBottom(x_scale).tickSize(0);
    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(${p_ci},${h_ci - p_ci})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", "#fff");
    const yAxis = d3.axisLeft(y_scale).ticks(3);
    svg
      .append("g")
      .attr("class", "y axis")
      .attr("transform", `translate(${p_ci},${p_ci})`)
      .call(yAxis)
      .selectAll("text")
      .attr("fill", "#fff");
    updateRectCI(counts);
  }, [counts]);

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
    const y1 = height / 4;
    const y2 = height / 5;
    let i = 0;
    const balls = svg.selectAll(".ball").data(data).enter()
      .append("circle")
      .attr("class", "ball")
      .attr("cx", d => x_scale(d))
      .attr("cy", y1)
      .attr("r", 5)
      .style("fill", "#FF8B22")
      .transition()
      .duration(300)
      .attr("cy", y1 + y2 - 5)
      .on("end", function () {
        ++i;
        if (i === n) {
          // Draw CI line
          svg.append("line")
            .attr("class", "ci")
            .attr("x1", x_scale(mean))
            .attr("x2", x_scale(mean))
            .attr("y1", y1 + y2 - 5)
            .attr("y2", y1 + y2 - 5)
            .attr("stroke", (ci[0] <= muRef.current && muRef.current <= ci[1]) ? "#46C8B2" : "#FF8686")
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
            .style("fill", (ci[0] <= muRef.current && muRef.current <= ci[1]) ? "#46C8B2" : "#FF8686")
            .transition()
            .duration(800)
            .attr("cy", height)
            .on("end", function () {
              d3.select(this).remove();
            });
          // Update counts
          setCounts(prev => {
            const idx = (ci[0] <= muRef.current && muRef.current <= ci[1]) ? 0 : 1;
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
    // eslint-disable-next-line
  }, [running, dist, n, alpha, param]);

  // Distribution change
  function handleDistChange(e) {
    const v = e.target.value;
    setDist(v);
    setParam(initial_parameters[v]);
    resetCI();
  }

  // Parameter controls (for normal only, for now)
  function handleParamChange(idx, val) {
    setParam(prev => prev.map((p, i) => (i === idx ? val : p)));
    resetCI();
  }

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Confidence Interval Simulation</h3>
      <div className="flex flex-wrap gap-4 items-center bg-gray-800 rounded-lg p-4">
        <label className="text-white">
          Distribution:
          <select value={dist} onChange={handleDistChange} className="ml-2 px-2 py-1 rounded bg-gray-900 text-white">
            {distOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label className="text-white">
          Sample Size:
          <input
            type="range"
            min="2"
            max="50"
            value={n}
            onChange={e => { setN(+e.target.value); resetCI(); }}
            className="mx-2 w-32 accent-orange-500"
          />
          <span className="ml-1">{n}</span>
        </label>
        <label className="text-white">
          Alpha (1 - Confidence):
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            value={alpha}
            onChange={e => { setAlpha(+e.target.value); resetCI(); }}
            className="mx-2 w-32 accent-orange-500"
          />
          <span className="ml-1">{round(alpha, 2)}</span>
        </label>
        {/* Normal params example */}
        {dist === "normal" && (
          <label className="text-white">
            μ:
            <input
              type="number"
              value={param[0]}
              onChange={e => handleParamChange(0, +e.target.value)}
              className="mx-2 w-16 rounded bg-gray-900 text-white border border-gray-700 px-2"
            />
            σ:
            <input
              type="number"
              value={param[1]}
              min="0.01"
              onChange={e => handleParamChange(1, +e.target.value)}
              className="mx-2 w-16 rounded bg-gray-900 text-white border border-gray-700 px-2"
            />
          </label>
        )}
        <Button
          className={running ? "bg-red-600 hover:bg-red-600/90" : "bg-blue-600 hover:bg-blue-600/90"}
          onClick={() => setRunning(r => !r)}
        >
          {running ? "Stop" : "Start"}
        </Button>
        <Button
          className="bg-gray-600 hover:bg-gray-600/90"
          onClick={resetCI}
        >
          Reset
        </Button>
      </div>
      <div className="w-full" style={{ maxWidth: 820, margin: "auto" }}>
        <svg ref={svgRef} style={{ width: "100%", height: 600 }} />
      </div>
      <div className="w-full" style={{ maxWidth: 370, margin: "auto" }}>
        <svg ref={svgSampleRef} style={{ width: "100%", height: 200 }} />
      </div>
      <div className="text-white text-sm text-center">
        <span className="inline-block bg-teal-500 rounded px-2 py-1 mr-2">Contains μ</span>
        <span className="inline-block bg-red-400 rounded px-2 py-1">Excludes μ</span>
      </div>
    </section>
  );
}
