"use client";
import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

export default function DistributionSimulationLarge() {
  const [probs, setProbs] = useState(Array(6).fill(1 / 6));
  const barSvgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(barSvgRef.current);
    const width = 600;  // Much larger!
    const height = 400; // Much larger!
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Dark background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Data
    const data = probs.map((p, i) => ({ face: i + 1, value: p }));

    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.face))
      .range([0, innerWidth])
      .padding(0.2);
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "white");

    // Bars
    const bars = g.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d.face))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => innerHeight - y(d.value))
      .attr("fill", "#4f46e5")
      .style("cursor", "ns-resize");

    // Direct drag on bars - exactly like the working code
    bars.call(
      d3.drag()
        .on("drag", (event, d) => {
          const newVal = Math.max(0, Math.min(1, y.invert(event.y)));
          const oldVal = probs[d.face - 1];
          let updated = probs.map((p, idx) =>
            idx === d.face - 1 ? newVal : (oldVal === 1 ? (1 - newVal) / 5 : p * (1 - newVal) / (1 - oldVal))
          );
          // Normalize
          updated = updated.map(p => Math.max(0, p));
          const sum = updated.reduce((a, b) => a + b, 0);
          if (sum > 0) {
            updated = updated.map(p => p / sum);
          }
          setProbs(updated);
        })
    );

    // Labels
    g.selectAll("text.label")
      .data(data)
      .join("text")
      .attr("class", "label")
      .attr("x", d => x(d.face) + x.bandwidth() / 2)
      .attr("y", d => y(d.value) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(d => `${(d.value * 100).toFixed(1)}%`);

  }, [probs]);

  return (
    <div style={{ padding: '2rem', backgroundColor: '#0a0a0a' }}>
      <h2 style={{ color: 'white', marginBottom: '1rem' }}>Large Canvas Test (600x400)</h2>
      <svg ref={barSvgRef} style={{ width: "600px", height: "400px" }} />
      <div style={{ color: 'white', marginTop: '1rem' }}>
        <p>Canvas size: 600x400 (vs 300x240 in current implementation)</p>
        <p>Inner chart area: ~510x330 (vs ~210x170)</p>
      </div>
    </div>
  );
}