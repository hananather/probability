"use client";
import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

export default function DistributionNoTransform() {
  const [probs, setProbs] = useState(Array(6).fill(1 / 6));
  const barSvgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(barSvgRef.current);
    const width = 600;
    const height = 400;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");

    const data = probs.map((p, i) => ({ face: i + 1, value: p }));

    // NO TRANSFORM - bars directly on SVG like your working code
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleBand()
      .domain(data.map(d => d.face))
      .range([margin.left, width - margin.right])  // Include margins in scale
      .padding(0.2);
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top]);  // Include margins in scale

    // X axis - positioned absolutely
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "white");

    // Bars - NO PARENT G ELEMENT
    const bars = svg.selectAll("rect.bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.face))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.value))
      .attr("fill", "#e11d48")
      .style("cursor", "ns-resize");

    // Drag directly on bars
    bars.call(
      d3.drag()
        .on("drag", (event, d) => {
          const newVal = Math.max(0, Math.min(1, y.invert(event.y)));
          const oldVal = probs[d.face - 1];
          const updated = probs.map((p, idx) =>
            idx === d.face - 1 ? newVal : (oldVal === 1 ? (1 - newVal) / 5 : p * (1 - newVal) / (1 - oldVal))
          );
          setProbs(updated);
        })
    );

    // Labels
    svg.selectAll("text.label")
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
      <h2 style={{ color: 'white', marginBottom: '1rem' }}>🎯 NO TRANSFORM - Bars directly on SVG</h2>
      <svg ref={barSvgRef} style={{ width: "600px", height: "400px" }} />
      <div style={{ color: '#f59e0b', marginTop: '1rem' }}>
        ⚠️ This version has NO g element with transform - bars are positioned absolutely on SVG
      </div>
    </div>
  );
}