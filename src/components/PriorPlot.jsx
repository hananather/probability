import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { beta } from "jstat";
import { RangeSlider, SliderPresets } from "./ui/RangeSlider";

function round(val, digits = 2) {
  return Math.round(val * Math.pow(10, digits)) / Math.pow(10, digits);
}

const PriorPlot = () => {
  const svgRef = useRef(null);
  const [p, setP] = useState(0.5);
  const [alpha, setAlpha] = useState(1);
  const [betaVal, setBetaVal] = useState(1);
  const [count, setCount] = useState(0);
  const [n, setN] = useState(0);
  const [data, setData] = useState([[]]);

  const margin = { top: 60, right: 20, bottom: 60, left: 20 };
  const width = 700 - margin.left - margin.right;
  const height = 550 - margin.top - margin.bottom;

  useEffect(() => {
    // When alpha/beta change, reset to initial state with just the prior
    setData([posterior(alpha, betaVal)]);
    setCount(0);
    setN(0);
  }, [alpha, betaVal]);

  useEffect(() => {
    draw();
  }, [data, p]);

  function posterior(a, b) {
    return d3.range(0, 1.01, 0.01).map(x => [x, Math.min(beta.pdf(x, a, b), 100)]);
  }

  function draw() {
    const svg = d3.select(svgRef.current);
    
    // Initialize SVG dimensions only if not already set
    if (svg.select("g.main-group").empty()) {
      svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
      
      svg.append("g")
        .attr("class", "main-group")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    }
    
    const g = svg.select("g.main-group");

    const x = d3.scaleLinear().domain([0, 1]).range([0, width]);
    
    // Calculate dynamic y-domain based on current posterior
    let maxY = 3;
    if (data.length > 0) {
      const currentPosterior = data[data.length - 1];
      const currentAlpha = alpha + count;
      const currentBeta = betaVal + n - count;
      
      // Calculate mode of beta distribution (where PDF is maximum)
      if (currentAlpha > 1 && currentBeta > 1) {
        const mode = (currentAlpha - 1) / (currentAlpha + currentBeta - 2);
        const maxPDF = beta.pdf(mode, currentAlpha, currentBeta);
        maxY = Math.min(Math.max(maxPDF * 1.1, 3), 100); // Add 10% padding, min 3, max 100
      }
    }
    
    const y = d3.scaleLinear().domain([0, maxY]).range([height, 0]);
    
    // Create axes only if they don't exist
    if (g.select(".x.axis").empty()) {
      const xAxis = d3.axisBottom(x).ticks(3);
      g.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);
      
      g.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${width / 2},${height + margin.bottom / 2})`)
        .text("p");
      
      // Create y-axis
      g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y).ticks(5));
      
      g.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90) translate(${-height/2},${-margin.left + 15})`)
        .text("Density");
      
      g.append("clipPath")
        .attr("id", "display")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height);
    } else {
      // Update y-axis with transition
      const yAxis = d3.axisLeft(y).ticks(5);
      g.select(".y.axis")
        .transition()
        .duration(300)
        .call(yAxis);
    }

    const line = d3.line()
      .x(d => x(d[0]))
      .y(d => y(d[1]))
      .curve(d3.curveBasis);

    // Draw all posterior curves with decreasing opacity and smooth transitions
    const paths = g.selectAll("path.beta")
      .data(data);
    
    // Enter new paths
    paths.enter()
      .append("path")
      .attr("class", "beta")
      .attr("clip-path", "url(#display)")
      .attr("fill", "none")
      .attr("d", d => line(d))
      .attr("stroke", "#0074D9")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0)
      .transition()
      .duration(300)
      .attr("stroke-opacity", (d, i) => Math.max(1 / (data.length - i), 0.2));
    
    // Update existing paths
    paths
      .transition()
      .duration(300)
      .attr("d", d => line(d))
      .attr("stroke", (d, i) => {
        // Latest curve is green, older ones are blue
        return i === data.length - 1 ? "#10b981" : "#0074D9";
      })
      .attr("stroke-width", (d, i) => {
        // Latest curve is thicker
        return i === data.length - 1 ? 3 : 1;
      })
      .attr("stroke-opacity", (d, i) => {
        // Decreasing opacity for older curves
        return Math.max(1 / (data.length - i), 0.2);
      });
    
    // Remove old paths (shouldn't happen in our case)
    paths.exit().remove();

    // Update true value line with transition
    g.selectAll("line.true")
      .data([p])
      .join(
        enter => enter.append("line")
          .attr("class", "true")
          .attr("clip-path", "url(#display)")
          .attr("x1", d => x(d))
          .attr("y1", y.range()[0])
          .attr("x2", d => x(d))
          .attr("y2", y(2 * y.domain()[1]))
          .attr("stroke", "#FF4136")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5"),
        update => update
          .transition()
          .duration(300)
          .attr("x1", d => x(d))
          .attr("x2", d => x(d))
      );
  }

  function flipCoin(times = 1) {
    let c = count;
    let total = n;
    let d = [...data];
    for (let i = 0; i < times; i++) {
      const num = Math.random();
      total += 1;
      c += num < p ? 1 : 0;
      d.push(posterior(alpha + c, betaVal + total - c));
    }
    setCount(c);
    setN(total);
    setData(d);
  }

  function reset() {
    setCount(0);
    setN(0);
    setData([posterior(alpha, betaVal)]);
  }

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Prior (Beta Distribution)</h3>
      <div className="flex flex-wrap gap-4 items-center bg-neutral-800 rounded-lg p-4">
        <div className="w-48">
          <RangeSlider
            label="p"
            value={p}
            onChange={setP}
            {...SliderPresets.probability}
            formatValue={(v) => round(v)}
          />
        </div>
        <label>
          alpha:
          <input
            type="number"
            min="1"
            step="1"
            value={alpha}
            onChange={e => setAlpha(+e.target.value)}
            className="mx-2 w-16"
          />
        </label>
        <label>
          beta:
          <input
            type="number"
            min="1"
            step="1"
            value={betaVal}
            onChange={e => setBetaVal(+e.target.value)}
            className="mx-2 w-16"
          />
        </label>
        <button
          className="btn btn-primary"
          onClick={() => flipCoin(1)}
        >
          Flip 1
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => flipCoin(10)}
        >
          Flip 10
        </button>
        <button
          className="btn btn-danger"
          onClick={reset}
        >
          Reset
        </button>
      </div>
      <div className="w-full" style={{ maxWidth: 800, margin: "auto" }}>
        <svg ref={svgRef} style={{ width: "100%", height: 400 }} />
      </div>
      <div className="flex gap-4">
        <span>Heads: {count}</span>
        <span>Tails: {n - count}</span>
      </div>
    </section>
  );
};

export default PriorPlot;
