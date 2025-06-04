"use client";
import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

export default function DistributionFixed() {
  const [probs, setProbs] = useState(Array(6).fill(1 / 6));
  const barSvgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(barSvgRef.current);
    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const data = probs.map((p, i) => ({ face: i + 1, value: p }));

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

    // Bars - EXACTLY like your working code
    const bars = g.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d.face))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => innerHeight - y(d.value))
      .attr("fill", "#14b8a6")
      .style("cursor", "ns-resize")
      .style("transition", "fill 0.2s")
      .on("mouseover", function() { d3.select(this).attr("fill", "#38a169"); })
      .on("mouseout", function() { d3.select(this).attr("fill", "#14b8a6"); });

    // Apply drag DIRECTLY to bars - EXACTLY like your working code
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
      <h2 style={{ color: 'white', marginBottom: '1rem' }}>Fixed: Drag directly on bars (like working code)</h2>
      <svg ref={barSvgRef} style={{ width: "600px", height: "400px" }} />
      <div style={{ color: '#4ade80', marginTop: '1rem' }}>
        ✅ This version applies drag DIRECTLY to the visible bars, not to invisible hit areas
      </div>
    </div>
  );
}