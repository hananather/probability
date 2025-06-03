// src/components/CoinFlipSimulation.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Button } from "./ui/button";

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
    <div className="flex flex-col items-center">
      {/* True probability slider */}
      <div className="mb-4">
        <label className="flex items-center gap-2">
          <span>True Heads Probability:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={trueProb}
            onChange={e => setTrueProb(+e.target.value)}
            className="cursor-pointer"
          />
          {Math.round(trueProb * 100)}%
        </label>
      </div>
      {/* Batch flip controls */}
      <div className="mb-4 flex items-center">
        <label className="mr-2 flex items-center gap-2">
          <span>Sample Size:</span>
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
            className="ml-1 w-16 rounded bg-neutral-700 px-2 py-1 text-white"
          />
        </label>
        <Button onClick={handleMultipleFlip} className="ml-2">Flip {sampleCount} times</Button>
      </div>
      {/* Summary & legend */}
      <p className="my-2 text-lg font-medium">Total flips: {counts[0] + counts[1]}</p>
      <div className="mb-4 flex gap-6">
        <span className="flex items-center">
          <span className="mr-2 h-4 w-4 rounded bg-indigo-600" />
          Observed outcomes
        </span>
        <span className="flex items-center">
          <span className="mr-2 h-4 w-4 rounded bg-teal-500" />
          True probabilities
        </span>
      </div>
      {/* D3 chart */}
      <div className="w-[400px]">
        <svg ref={svgRef} className="h-[200px] w-full" />
      </div>
      {/* Action buttons */}
      <div className="mt-4 flex gap-4">
        <Button onClick={handleFlip}>Flip once</Button>
        <Button className="bg-red-600 hover:bg-red-600/90" onClick={handleReset}>Reset</Button>
      </div>
    </div>
  );
}
