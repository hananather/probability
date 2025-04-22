import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";

function round(val, digits = 2) {
  return Math.round(val * Math.pow(10, digits)) / Math.pow(10, digits);
}

const LikelihoodPlot = () => {
  const svgRef = useRef(null);
  const [distribution, setDistribution] = useState("normal");
  const [param, setParam] = useState([0, 1]);
  const [sampleSize, setSampleSize] = useState(1);
  const [samples, setSamples] = useState([]);
  const [view, setView] = useState([-5, 5]);

  const margin = { top: 60, right: 20, bottom: 100, left: 20 };
  const width = 700 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Distribution options
  const view_parameters = {
    uniform: [-2, 8],
    normal: [-5, 5],
    exponential: [-2, 8],
    '': [-2, 8],
    bernoulli: [-1, 2],
    binomialDiscrete: [-1, 4],
    poisson: [-2, 8],
  };
  const initial_parameters = {
    uniform: [0, 6],
    normal: [0, 1],
    exponential: [1],
    '': [],
    bernoulli: [0.5],
    binomialDiscrete: [3, 0.5],
    poisson: [3],
  };

  useEffect(() => {
    setParam(initial_parameters[distribution]);
    setView(view_parameters[distribution]);
    setSamples([]);
    draw();
    // eslint-disable-next-line
  }, [distribution]);

  useEffect(() => {
    draw();
    // eslint-disable-next-line
  }, [param, samples, view]);

  function density(distribution, parameters, range) {
    if (!distribution) return [];
    return d3.range(range[0], range[1], 0.01).map(x => {
      const params = [x].concat(parameters);
      return [x, Math.max(Math.min(jStat[distribution].pdf.apply(null, params), 100), 0)];
    });
  }

  function sampleDist() {
    if (!distribution) return [];
    let data = [];
    for (let i = 0; i < sampleSize; i++) {
      data.push(jStat[distribution].sample.apply(null, param));
    }
    setSamples(data);
    return data;
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

    const x = d3.scaleLinear().domain(view).range([0, width]);
    const y1 = d3.scaleLinear().domain([0, 1]).range([height / 3, 15]);
    const y2 = d3.scaleLinear().domain([0, 1]).range([2 * height / 3, height / 3 + 15]);
    const y3 = d3.scaleLinear().domain([0, 1]).range([height, 2 * height / 3 + 15]);

    // Draw axes and bars
    function draw_bar(dy, label) {
      const axis = g.append("g").attr("class", "axis");
      axis.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", dy)
        .attr("y2", dy)
        .attr("stroke", "#222");
      axis.append("text")
        .attr("x", 0)
        .attr("y", dy)
        .attr("dy", "1em")
        .text(label);
    }
    draw_bar(height / 3, "sampling distribution");
    draw_bar(2 * height / 3, "density p(x|θ)");
    draw_bar(height, "likelihood L(θ|x)");

    // Draw density
    const densityData = density(distribution, param, view);
    const line = d3.line()
      .x(d => x(d[0]))
      .y(d => y2(d[1]))
      .curve(d3.curveBasis);
    g.append("path")
      .datum(densityData)
      .attr("class", "distribution density")
      .attr("fill", "none")
      .attr("stroke", "#0074D9")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Draw samples
    g.selectAll("circle.sample")
      .data(samples)
      .join("circle")
      .attr("class", "sample")
      .attr("r", 5)
      .attr("cx", d => x(d))
      .attr("cy", y1(1))
      .attr("fill", "#FF4136");
  }

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Likelihood Visualization</h3>
      <div className="flex flex-wrap gap-4 items-center bg-gray-100 rounded-lg p-4">
        <label>
          Distribution:
          <select
            value={distribution}
            onChange={e => setDistribution(e.target.value)}
            className="mx-2"
          >
            <option value="normal">Normal</option>
            <option value="uniform">Uniform</option>
            <option value="exponential">Exponential</option>
            <option value="bernoulli">Bernoulli</option>
            <option value="binomialDiscrete">Binomial</option>
            <option value="poisson">Poisson</option>
          </select>
        </label>
        <label>
          Parameter 1:
          <input
            type="number"
            value={param[0] ?? 0}
            onChange={e => setParam([+e.target.value, param[1]])}
            className="mx-2 w-16"
          />
        </label>
        {param[1] !== undefined && (
          <label>
            Parameter 2:
            <input
              type="number"
              value={param[1]}
              onChange={e => setParam([param[0], +e.target.value])}
              className="mx-2 w-16"
            />
          </label>
        )}
        <label>
          Sample Size:
          <input
            type="number"
            min="1"
            value={sampleSize}
            onChange={e => setSampleSize(+e.target.value)}
            className="mx-2 w-16"
          />
        </label>
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white"
          onClick={sampleDist}
        >
          Sample
        </button>
      </div>
      <div className="w-full" style={{ maxWidth: 800, margin: "auto" }}>
        <svg ref={svgRef} style={{ width: "100%", height: 500 }} />
      </div>
    </section>
  );
};

export default LikelihoodPlot;
