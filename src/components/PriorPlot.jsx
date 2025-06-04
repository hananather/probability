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
    setData([posterior(alpha, betaVal)]);
  }, [alpha, betaVal]);

  useEffect(() => {
    draw();
  }, [data, p]);

  function posterior(a, b) {
    return d3.range(0, 1.01, 0.01).map(x => [x, Math.min(beta.pdf(x, a, b), 100)]);
  }

  function draw() {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 1]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 3]).range([height, 0]);
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
    g.append("clipPath")
      .attr("id", "display")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height);

    const line = d3.line()
      .x(d => x(d[0]))
      .y(d => y(d[1]))
      .curve(d3.curveBasis);

    g.selectAll("path.beta")
      .data(data)
      .join("path")
      .attr("class", "beta")
      .attr("clip-path", "url(#display)")
      .attr("d", d => line(d))
      .attr("stroke", "#0074D9")
      .attr("fill", "none");

    g.selectAll("line.true")
      .data([p])
      .join("line")
      .attr("class", "true")
      .attr("clip-path", "url(#display)")
      .attr("x1", d => x(d))
      .attr("y1", y.range()[0])
      .attr("x2", d => x(d))
      .attr("y2", y(2 * y.domain()[1]))
      .attr("stroke", "#FF4136");
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
