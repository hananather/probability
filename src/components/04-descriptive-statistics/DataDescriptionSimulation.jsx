"use client";
import { useState, useEffect, useRef } from "react";
import React from "react";
import * as d3 from "d3";
import { jStat } from "jstat";
import DataDescriptionWorkedExample from "./DataDescriptionWorkedExample.jsx";

const margin = { top: 40, right: 30, bottom: 50, left: 30 };
const width = 700;
const height = 300;

function DataDescriptionSimulation() {
  const [n, setN] = useState(15);
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [data, setData] = useState([]);
  const svgRef = useRef(null);

  function generateSample() {
    const arr = Array.from({ length: n }, () => jStat.normal.sample(mu, sigma));
    arr.sort((a, b) => a - b);
    setData(arr);
  }

  useEffect(() => {
    generateSample();
  }, [n, mu, sigma]);

  useEffect(() => {
    if (!data.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data))
      .nice()
      .range([0, innerWidth]);

    const q1 = d3.quantile(data, 0.25);
    const median = d3.quantile(data, 0.5);
    const q3 = d3.quantile(data, 0.75);
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const whiskerMin = d3.min(data.filter(d => d >= lowerFence));
    const whiskerMax = d3.max(data.filter(d => d <= upperFence));
    const mean = d3.mean(data);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    // Box
    g.append("rect")
      .attr("x", x(q1))
      .attr("y", innerHeight / 2 - 20)
      .attr("width", x(q3) - x(q1))
      .attr("height", 40)
      .attr("fill", "rgba(20,184,166,0.3)")
      .attr("stroke", "#14b8a6");

    // Median line
    g.append("line")
      .attr("x1", x(median))
      .attr("x2", x(median))
      .attr("y1", innerHeight / 2 - 20)
      .attr("y2", innerHeight / 2 + 20)
      .attr("stroke", "#38a169")
      .attr("stroke-width", 2);

    // Mean line
    g.append("line")
      .attr("x1", x(mean))
      .attr("x2", x(mean))
      .attr("y1", innerHeight / 2 - 25)
      .attr("y2", innerHeight / 2 + 25)
      .attr("stroke", "#facc15")
      .attr("stroke-dasharray", "4 2")
      .attr("stroke-width", 2);

    // Whiskers
    g.append("line")
      .attr("x1", x(whiskerMin))
      .attr("x2", x(whiskerMax))
      .attr("y1", innerHeight / 2)
      .attr("y2", innerHeight / 2)
      .attr("stroke", "#fff");
    g.append("line")
      .attr("x1", x(whiskerMin))
      .attr("x2", x(whiskerMin))
      .attr("y1", innerHeight / 2 - 10)
      .attr("y2", innerHeight / 2 + 10)
      .attr("stroke", "#fff");
    g.append("line")
      .attr("x1", x(whiskerMax))
      .attr("x2", x(whiskerMax))
      .attr("y1", innerHeight / 2 - 10)
      .attr("y2", innerHeight / 2 + 10)
      .attr("stroke", "#fff");

    // Points with jitter
    g.selectAll("circle.point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", d => x(d))
      .attr("cy", () => innerHeight - 30 + Math.random() * 20)
      .attr("r", 3)
      .attr("fill", "#fff")
      .attr("opacity", 0.7);

    // Outliers
    const outliers = data.filter(d => d < lowerFence || d > upperFence);
    g.selectAll("circle.outlier")
      .data(outliers)
      .enter()
      .append("circle")
      .attr("class", "outlier")
      .attr("cx", d => x(d))
      .attr("cy", innerHeight / 2)
      .attr("r", 4)
      .attr("fill", "#ef4444");
  }, [data]);

  const q1 = data.length ? d3.quantile(data, 0.25) : 0;
  const q3 = data.length ? d3.quantile(data, 0.75) : 0;
  const median = data.length ? d3.quantile(data, 0.5) : 0;
  const mean = data.length ? d3.mean(data) : 0;
  const iqr = q3 - q1;
  const outliers = data.filter(d => d < q1 - 1.5 * iqr || d > q3 + 1.5 * iqr);

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Data Descriptions</h3>
      <div className="flex flex-wrap gap-4 items-center bg-gray-800 rounded-lg p-4">
        <label className="text-white">
          Sample Size:
          <input
            type="range"
            min="5"
            max="50"
            value={n}
            onChange={e => setN(+e.target.value)}
            className="mx-2 w-32 accent-orange-500"
          />
          <span className="ml-1">{n}</span>
        </label>
        <label className="text-white">
          μ:
          <input
            type="number"
            value={mu}
            onChange={e => setMu(+e.target.value)}
            className="ml-2 w-20 rounded bg-gray-900 text-white border border-gray-700 px-2"
          />
        </label>
        <label className="text-white">
          σ:
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={sigma}
            onChange={e => setSigma(+e.target.value)}
            className="ml-2 w-20 rounded bg-gray-900 text-white border border-gray-700 px-2"
          />
        </label>
        <button
          className="px-3 py-1 rounded bg-teal-600 text-white"
          onClick={generateSample}
        >
          Draw Sample
        </button>
      </div>
      <div className="w-full" style={{ maxWidth: 700, margin: "auto" }}>
        <svg ref={svgRef} style={{ width: "100%", height: 300 }} />
      </div>
      <DataDescriptionWorkedExample
        data={data}
        mean={mean}
        median={median}
        q1={q1}
        q3={q3}
        iqr={iqr}
        outliers={outliers}
      />
    </section>
  );
}

export default React.memo(DataDescriptionSimulation);
