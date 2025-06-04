"use client";
import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

export default function DistributionComparison() {
  // Single value (works)
  const [singleValue, setSingleValue] = useState(0.5);
  
  // Array of values (doesn't work?)
  const [multiValues, setMultiValues] = useState([0.5, 0.5, 0.5]);
  
  const singleRef = useRef(null);
  const multiRef = useRef(null);

  // Single bar - WORKS
  useEffect(() => {
    const svg = d3.select(singleRef.current);
    const width = 200;
    const height = 300;
    const margin = 40;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    svg.append("rect").attr("width", width).attr("height", height).attr("fill", "#0a0a0a");
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin, margin]);
    
    const bar = svg.append("rect")
      .attr("x", 70)
      .attr("y", y(singleValue))
      .attr("width", 60)
      .attr("height", y(0) - y(singleValue))
      .attr("fill", "#4f46e5")
      .style("cursor", "ns-resize");
    
    bar.call(
      d3.drag()
        .on("drag", (event) => {
          console.log("Single bar drag - event.y:", event.y);
          const newVal = Math.max(0, Math.min(1, y.invert(event.y)));
          setSingleValue(newVal);
        })
    );
    
    svg.append("text")
      .attr("x", 100)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(`Single: ${(singleValue * 100).toFixed(0)}%`);
    
  }, [singleValue]);

  // Multi bars - ISSUE?
  useEffect(() => {
    const svg = d3.select(multiRef.current);
    const width = 400;
    const height = 300;
    const margin = 40;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    svg.append("rect").attr("width", width).attr("height", height).attr("fill", "#0a0a0a");
    
    const g = svg.append("g");
    
    const data = multiValues.map((v, i) => ({ index: i, value: v }));
    
    const x = d3.scaleBand()
      .domain(data.map(d => d.index))
      .range([margin, width - margin])
      .padding(0.2);
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin, margin]);
    
    const bars = g.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d.index))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.value))
      .attr("fill", "#14b8a6")
      .style("cursor", "ns-resize");
    
    bars.call(
      d3.drag()
        .on("drag", (event, d) => {
          console.log("Multi bar drag - event.y:", event.y, "for bar:", d.index);
          const newVal = Math.max(0, Math.min(1, y.invert(event.y)));
          const updated = [...multiValues];
          updated[d.index] = newVal;
          setMultiValues(updated);
        })
    );
    
    g.selectAll("text")
      .data(data)
      .join("text")
      .attr("x", d => x(d.index) + x.bandwidth() / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(d => `${(d.value * 100).toFixed(0)}%`);
    
  }, [multiValues]);

  return (
    <div style={{ padding: '2rem', backgroundColor: '#0a0a0a', color: 'white' }}>
      <h2 style={{ marginBottom: '1rem' }}>🔍 Single vs Multi-bar Comparison</h2>
      
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div>
          <h3>Single Bar (Works)</h3>
          <svg ref={singleRef} />
        </div>
        
        <div>
          <h3>Multi Bars (Same code structure)</h3>
          <svg ref={multiRef} />
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', backgroundColor: '#333', padding: '1rem', borderRadius: '4px' }}>
        <p>📊 Both use identical drag code: <code>y.invert(event.y)</code></p>
        <p>🔍 Check console for event.y values while dragging</p>
        <p>❓ Is event.y different between single and multi-element scenarios?</p>
      </div>
    </div>
  );
}