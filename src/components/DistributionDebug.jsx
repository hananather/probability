"use client";
import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

export default function DistributionDebug() {
  const [probs, setProbs] = useState(Array(6).fill(1 / 6));
  const [dragInfo, setDragInfo] = useState({ active: false, face: 0, oldVal: 0, newVal: 0 });
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

    // SIMPLIFIED drag - let's debug what's happening
    bars.call(
      d3.drag()
        .on("start", (event, d) => {
          const currentProb = probs[d.face - 1];
          setDragInfo({ active: true, face: d.face, oldVal: currentProb, newVal: currentProb });
        })
        .on("drag", (event, d) => {
          // Get the new value from mouse position
          const newVal = Math.max(0, Math.min(1, y.invert(event.y)));
          
          // For debugging - just update THIS bar, don't redistribute yet
          const updated = [...probs];
          updated[d.face - 1] = newVal;
          
          setProbs(updated);
          setDragInfo(prev => ({ ...prev, newVal: newVal }));
        })
        .on("end", () => {
          setDragInfo({ active: false, face: 0, oldVal: 0, newVal: 0 });
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

  const sum = probs.reduce((a, b) => a + b, 0);

  return (
    <div style={{ padding: '2rem', backgroundColor: '#0a0a0a' }}>
      <h2 style={{ color: 'white', marginBottom: '1rem' }}>Debug: Multi-bar WITHOUT redistribution</h2>
      <svg ref={barSvgRef} style={{ width: "600px", height: "400px" }} />
      
      <div style={{ color: 'white', marginTop: '1rem', fontFamily: 'monospace' }}>
        <p>Sum of all probabilities: {sum.toFixed(4)} (should be 1.0)</p>
        {dragInfo.active && (
          <div style={{ backgroundColor: '#333', padding: '1rem', borderRadius: '4px' }}>
            <p>Dragging bar {dragInfo.face}:</p>
            <p>Old value: {(dragInfo.oldVal * 100).toFixed(1)}%</p>
            <p>New value: {(dragInfo.newVal * 100).toFixed(1)}%</p>
            <p>Change: {((dragInfo.newVal - dragInfo.oldVal) * 100).toFixed(1)}%</p>
          </div>
        )}
        <p style={{ marginTop: '1rem', color: '#ff6b6b' }}>
          ⚠️ This version updates ONLY the dragged bar - no redistribution
        </p>
      </div>
    </div>
  );
}