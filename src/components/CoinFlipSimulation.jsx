// src/components/CoinFlipSimulation.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

// Interactive coin flip simulation component
export default function CoinFlipSimulation() {
  // heads/tails counts
  const [counts, setCounts] = useState([0, 0]);
  // true probability of heads (slider-controlled)
  const [trueProb, setTrueProb] = useState(0.5);
  // batch flip size and displayed input value
  const [sampleCount, setSampleCount] = useState(1);
  const [inputValue, setInputValue] = useState("1");
  // ref to SVG element for D3 rendering
  const svgRef = useRef(null);

  // Single flip handler
  function handleFlip() {
    const head = Math.random() < trueProb ? 1 : 0;
    setCounts(([h, t]) => [h + head, t + 1 - head]);
  }

  // Batch flip handler
  function handleMultipleFlip() {
    let headCount = 0;
    for (let i = 0; i < sampleCount; i++) {
      headCount += Math.random() < trueProb ? 1 : 0;
    }
    setCounts(([h, t]) => [h + headCount, t + (sampleCount - headCount)]);
  }

  // Reset simulation state
  function handleReset() {
    setCounts([0, 0]);
    setTrueProb(0.5);
    setSampleCount(1);
    setInputValue("1");
  }

  // D3 effect: draws two bars (observed vs true probabilities)
  useEffect(() => {
    const [heads, tails] = counts;
    const sampleTotal = heads + tails;
    const total = Math.max(1, sampleTotal);
    const data = [
      {
        state: "Observed outcomes",
        values: [
          { side: "Heads", value: heads / total, count: heads },
          { side: "Tails", value: tails / total, count: tails }
        ]
      },
      {
        state: "True probabilities",
        values: [
          { side: "Heads", value: trueProb },
          { side: "Tails", value: 1 - trueProb }
        ]
      }
    ];

    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 200;

    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const x0 = d3.scaleBand().domain(data.map(d => d.state)).range([0, width]).padding(0.2);
    const x1 = d3.scaleBand()
      .domain(data[0].values.map(d => d.side))
      .range([0, x0.bandwidth()])
      .padding(0.05);
    const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);

    const groups = svg.selectAll("g.state").data(data).join("g")
      .attr("transform", d => `translate(${x0(d.state)},0)`);

    const bars = groups.selectAll("rect")
      .data(d => d.values.map(v => ({ ...v, state: d.state })))
      .join("rect")
        .attr("x", d => x1(d.side))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("rx", 4)
        .attr("fill", d => (d.state === "Observed outcomes" ? "#4f46e5" : "#14b8a6"));

    bars.append("title")
      .text(d =>
        d.state === "Observed outcomes"
          ? `${d.side}: ${(d.value * 100).toFixed(1)}% (${d.count}/${sampleTotal})`
          : `${d.side}: ${(d.value * 100).toFixed(1)}%`
      );

    bars.on("mouseover", function(event, d) {
      d3.select(this.parentNode)
        .append("text")
        .attr("class", "hover-label")
        .attr("x", x1(d.side) + x1.bandwidth() / 2)
        .attr("y", y(d.value) - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .style("font-size", "12px")
        .text(`${(d.value * 100).toFixed(1)}%`);
    })
    .on("mouseout", function() {
      d3.select(this.parentNode).selectAll(".hover-label").remove();
    });

    const xAxisGroup = svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x0));
    xAxisGroup.selectAll("path, line").attr("stroke", "#fff");
    xAxisGroup.selectAll("text")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .attr("dy", "1em")
      .style("fill", "#fff");

    const yAxisGroup = svg.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%")));
    yAxisGroup.selectAll("path, line").attr("stroke", "#fff");
    yAxisGroup.selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#fff");
  }, [counts, trueProb]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* True probability slider */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          True Heads Probability:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={trueProb}
            onChange={e => setTrueProb(+e.target.value)}
            style={{ margin: "0 0.5rem", cursor: "pointer" }}
          />
          {Math.round(trueProb * 100)}%
        </label>
      </div>
      {/* Batch flip controls */}
      <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center" }}>
        <label style={{ marginRight: "0.5rem" }}>
          Sample Size:
          <input
            type="number"
            min="1"
            max="100"
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
              const num = parseInt(e.target.value, 10);
              if (!isNaN(num)) setSampleCount(Math.min(100, Math.max(1, num)));
            }}
            onBlur={() => inputValue === "" && setInputValue(String(sampleCount))}
            style={{ marginLeft: "0.5rem", width: "60px" }}
          />
        </label>
        <button
          onClick={handleMultipleFlip}
          className="btn btn-primary"
        >
          Flip {sampleCount} times
        </button>
      </div>
      {/* Summary & legend */}
      <p style={{ margin: "0.5rem 0", fontSize: "1.1rem", fontWeight: "500" }}>
        Total flips: {counts[0] + counts[1]}
      </p>
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
        <span style={{ display: "flex", alignItems: "center" }}>
          <span style={{ width: "16px", height: "16px", backgroundColor: "#4f46e5", borderRadius: "3px", marginRight: "0.5rem" }} />
          Observed outcomes
        </span>
        <span style={{ display: "flex", alignItems: "center" }}>
          <span style={{ width: "16px", height: "16px", backgroundColor: "#14b8a6", borderRadius: "3px", marginRight: "0.5rem" }} />
          True probabilities
        </span>
      </div>
      {/* D3 chart */}
      <div style={{ width: "400px" }}>
        <svg ref={svgRef} style={{ width: "100%", height: "200px" }} />
      </div>
      {/* Action buttons */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button
          onClick={handleFlip}
          className="btn btn-primary"
        >
          Flip once
        </button>
        <button
          onClick={handleReset}
          className="btn btn-danger"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
