// src/components/BayesSimulation.jsx
// Modern React + D3 translation of Bayesian Inference simulation (from jQuery/D3 code)
"use client";

import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

function round(val, digits = 2) {
  return Math.round(val * Math.pow(10, digits)) / Math.pow(10, digits);
}

const HEALTHY_COLOR = "#84DEFF"; // blue
const DISEASE_COLOR = "#FF8686"; // pink/red

export default function BayesSimulation() {
  // State for priors and likelihoods
  const [p, setP] = useState(0.10); // P(Disease)
  const [p_d, setPd] = useState(0.75); // P(+|Disease)
  const [p_h, setPh] = useState(0.25); // P(+|Healthy)
  const [patients, setPatients] = useState([]); // patient array
  const [m, setM] = useState(0); // number of tested patients
  const [sorted, setSorted] = useState(false);
  const svgRef = useRef();
  const priorRef = useRef();
  const likelihoodRef = useRef();

  // --- Generate patients array deterministically by prior ---
  function generatePatients(num, p, p_d, p_h) {
    // Deterministically assign exact number of healthy/diseased
    const numDisease = Math.round(num * p);
    const numHealthy = num - numDisease;
    // Shuffle the order for visual randomness
    let healthArr = Array(numDisease).fill(true).concat(Array(numHealthy).fill(false));
    for (let i = healthArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [healthArr[i], healthArr[j]] = [healthArr[j], healthArr[i]];
    }
    let arr = [];
    for (let i = 0; i < num; i++) {
      const hasDisease = healthArr[i];
      let positiveTest = hasDisease ? Math.random() < p_d : Math.random() < p_h;
      arr.push({
        hasDisease,
        positiveTest,
        order: i,
        index: i,
      });
    }
    return arr;
  }

  // --- Regenerate patients when prior or likelihoods change ---
  useEffect(() => {
    setPatients(generatePatients(200, p, p_d, p_h));
    setM(0);
    setSorted(false);
  }, [p, p_d, p_h]);

  // --- Main Bayes Visualization ---
  useEffect(() => {
    const margin = { top: 100, right: 20, bottom: 20, left: 20 };
    const width = 700 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear().domain([0, 1]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 1]).range([0, height]);
    const z = d3.scaleLinear().domain([0, 1]).range([x(0.25), x(0.75)]);
    const w = 0.25;
    const h0 = 0.35;  // top of test bar
    const h1 = 0.45;  // bottom of test bar
    const h2 = 0.50;  // slider
    // const h0 = 0.15;  // top of test bar
    // const h1 = 0.25;  // bottom of test bar
    // const h2 = 0.30;  // slider
    const col = 20;
    const r = (w * width) / (2 * col);

    // --- Draw horizontal bars ---
    function draw_bar(selection, x1, x2, y1, y2, label) {
      const axis = selection.append("g").attr("class", "bar");
      axis.append("line")
        .attr("x1", x(x1))
        .attr("x2", x(x2))
        .attr("y1", y(y1))
        .attr("y2", y(y2))
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);
      if (label) {
        let dy;
        let yLabel = y((y1 + y2) / 2);
        if (label === "Test") {
          dy = "-0.5em";
        } else {
          dy = "1em";
        }
        axis.append("text")
          .attr("x", x((x1 + x2) / 2))
          .attr("y", yLabel)
          .attr("dy", dy)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("fill", "#fff")
          .text(label);
      }
    }
    draw_bar(g, 0.5, 0.5, 0, 0, "P");
    draw_bar(g, 0.25, 0.5, h1, h0, "");
    draw_bar(g, 0.5, 0.75, h0, h1, "");
    draw_bar(g, 0.25, 0.25, h1, h2, "");
    draw_bar(g, 0.75, 0.75, h1, h2, "");
    draw_bar(g, 0.5, 0.5, (h1 + h0) / 2, (h1 + h0) / 2, "Test");
    draw_bar(g, (0.5 - w) / 2, (0.5 + w) / 2, 1, 1, "Negative");
    draw_bar(g, (1.5 - w) / 2, (1.5 + w) / 2, 1, 1, "Positive");

    // conditional slider axis & handles
    const sliderAxis = d3.axisBottom(z).ticks(5);
    g.append("g")
      .attr("class", "slider-axis")
      .attr("transform", `translate(0,${y(h2)})`)
      .call(sliderAxis);

    // We'll use refs for the handles so we can update them from the likelihood drag handler
    let sliderHandles;
    const wSlider = 10;
    function updateSliderHandles(ph, pd) {
      const sliderData = [ph, pd];
      sliderHandles = g.selectAll("rect.conditional-slider").data(sliderData);
      sliderHandles.enter().append("rect")
        .attr("class", (d,i) => `conditional-slider ${i===0?"healthy":"disease"}`)
        .attr("y", y(h2) - wSlider/2)
        .attr("width", wSlider/2)
        .attr("height", wSlider)
        .style("cursor", "pointer")
        .attr("fill", (d,i) => i === 0 ? HEALTHY_COLOR : DISEASE_COLOR)
        .merge(sliderHandles)
        .attr("x", (d,i) => z(d) - wSlider/4)
        .attr("fill", (d,i) => i === 0 ? HEALTHY_COLOR : DISEASE_COLOR);
      sliderHandles.exit().remove();
    }
    updateSliderHandles(p_h, p_d);

    // --- Population dots ---
    // Fixed grid layout
    const gridCols = 14;
    const gridRows = Math.ceil(patients.length / gridCols);
    const spacing = r * 2 + 2;
    const centerX = x(0.5);
    // restore original grid position
    const centerY = y(0.05) + 30;
    // Animate population dots
    const circle = g.selectAll("circle.population").data(patients, d => d.index);
    circle.enter().append("circle")
      .attr("class", "population")
      .attr("r", r - 1)
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("fill", d => d.hasDisease ? DISEASE_COLOR : HEALTHY_COLOR)
      .attr("opacity", 0.85)
      .transition()
      .duration(600)
      .attr("cx", (d, i) => centerX + ((i % gridCols) - gridCols / 2) * spacing)
      .attr("cy", (d, i) => centerY + (Math.floor(i / gridCols) - gridRows / 2) * spacing);
    circle.transition()
      .duration(600)
      .attr("fill", d => d.hasDisease ? DISEASE_COLOR : HEALTHY_COLOR)
      .attr("cx", (d, i) => centerX + ((i % gridCols) - gridCols / 2) * spacing)
      .attr("cy", (d, i) => centerY + (Math.floor(i / gridCols) - gridRows / 2) * spacing);
    circle.exit().transition().duration(400).attr("opacity", 0).remove();
  }, [patients]);

  // --- Sampling & test animation ---
  useEffect(() => {
    const margin = { top: 100, right: 20, bottom: 20, left: 20 };
    const width = 700 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    const x = d3.scaleLinear().domain([0, 1]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 1]).range([0, height]);
    const w = 0.25, h0 = 0.35, h1 = 0.45, h2 = 0.50, col = 20;
    const r = (w * width) / (2 * col);
    const g = d3.select(svgRef.current).select("g");

    // slice and sort patients
    let sample = patients.slice(0, m);
    let positive = [], negative = [];
    sample.forEach(d => {
      if (d.positiveTest) positive.push(d);
      else negative.push(d);
    });
    if (sorted) {
      positive = positive.filter(d => d.hasDisease).concat(positive.filter(d => !d.hasDisease));
      negative = negative.filter(d => d.hasDisease).concat(negative.filter(d => !d.hasDisease));
    }
    // assign new orders for contiguous packing
    positive.forEach((d, i) => d.order = i);
    negative.forEach((d, i) => d.order = i);
    const data = positive.concat(negative);

    // timing
    const dt = m < patients.length ? 400 : 10000 / patients.length;
    const delay = m < patients.length ? 0 : 10000 / patients.length;

    // bind data
    const circles = g.selectAll("circle.patient").data(data, d => d.index);

    // update existing
    circles.transition().duration(dt)
      .attr("fill", d => d.hasDisease ? DISEASE_COLOR : HEALTHY_COLOR)
      .attr("cx", d => x(0.5 * (d.positiveTest ? 1 : 0) + (0.5 - w) / 2) + r + 2 * r * (d.order % col))
      .attr("cy", d => y(1) - r - 2 * r * Math.floor(d.order / col) - 1);

    // enter new
    const enter = circles.enter().append("circle")
      .attr("class", d => "patient" + (d.hasDisease ? " disease" : " healthy") + (d.positiveTest ? " positive" : " negative"))
      .attr("r", r - 1)
      .attr("cx", x(0.5))
      .attr("cy", -height / 6)
      .attr("fill", d => d.hasDisease ? DISEASE_COLOR : HEALTHY_COLOR);

    enter.transition().delay((d, i) => i * delay)
      .attr("cy", y(h0) - r)
      .transition().duration(dt)
        .attr("cx", d => x(0.5 + (2 * (d.positiveTest ? 1 : 0) - 1) * 0.25))
        .attr("cy", y(h1) - r)
      .transition()
        .attr("cy", y(h2))
      .transition().duration(dt)
        .attr("cx", d => x(0.5 * (d.positiveTest ? 1 : 0) + (0.5 - w) / 2) + r + 2 * r * (d.order % col))
        .attr("cy", d => y(1) - r - 2 * r * Math.floor(d.order / col) - 1);

    circles.exit().remove();
  }, [m, sorted, patients]);

  // --- Likelihood bar plot (drag to set p_d, p_h) ---
  useEffect(() => {
    // Main chart slider scales for syncing handles
    const mainMargin = { top: 100, right: 20, bottom: 20, left: 20 };
    const mainWidth = 700 - mainMargin.left - mainMargin.right;
    const xMain = d3.scaleLinear().domain([0, 1]).range([0, mainWidth]);
    const zMain = d3.scaleLinear().domain([0, 1]).range([xMain(0.25), xMain(0.75)]);
    const wSliderMain = 10;
    const margin = { top: 10, right: 10, bottom: 20, left: 10 };
    const width = 300 - margin.left - margin.right;
    const height = 150 - margin.top - margin.bottom;
    const svg = d3.select(likelihoodRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const labels = ["P(-|H)", "P(+|H)", "P(-|D)", "P(+|D)"];
    let probs = [1 - p_h, p_h, 1 - p_d, p_d];
    const x = d3.scaleBand().domain([0, 1, 2, 3]).range([0, width]).padding(0.5);
    const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);
    // Axis
    const xAxis = d3.axisBottom(x).tickFormat(d => labels[d]);
    g.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);
    // Helper: update bar positions & labels without re-rendering SVG
    function updateBars(data) {
      g.selectAll("rect")
        .data(data)
        .attr("y", d => y(d))
        .attr("height", d => y(0) - y(d));
      g.selectAll("text.bar-label")
        .data(data)
        .attr("y", d => y(d) - 5)
        .text(d => round(d, 2));
    }
    // Bars
    g.selectAll("rect")
      .data(probs)
      .enter()
      .append("rect")
      .attr("x", (d, i) => x(i))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d))
      .attr("height", d => y(0) - y(d))
      .attr("fill", (d, i) => i < 2 ? HEALTHY_COLOR : DISEASE_COLOR)
      .attr("data-index", (d, i) => i)
      .style("cursor", "row-resize")
      .call(
        d3.drag()
          .on("drag", function(event, d) {
            const i = +d3.select(this).attr("data-index");
            const [, my] = d3.pointer(event, g.node());
            // DRAG LOGIC: always direct, no inversion
            const newVal = Math.max(0, Math.min(y.invert(my), 1));
            probs[i] = newVal;
            probs[i % 2 === 0 ? i + 1 : i - 1] = 1 - newVal;
            // Update small chart bars
            updateBars(probs);
            // Sync main chart slider handles instantly
            d3.select(svgRef.current)
              .selectAll('rect.conditional-slider')
              .data([probs[1], probs[3]])
              .attr('x', d => zMain(d) - wSliderMain / 4)
              .attr('fill', (d, i) => i === 0 ? HEALTHY_COLOR : DISEASE_COLOR);
          })
          .on("end", function() {
            setPh(probs[1]);
            setPd(probs[3]);
          })
      );
    // Labels
    g.selectAll("text.bar-label")
      .data(probs)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d, i) => x(i) + x.bandwidth() / 2)
      .attr("y", d => y(d) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#18181b")
      .text(d => round(d, 2));
  }, [p_d, p_h]);

  // --- Prior bar plot (drag to set P(Disease)) ---
  useEffect(() => {
    const margin = { top: 10, right: 10, bottom: 20, left: 10 };
    const width = 300 - margin.left - margin.right;
    const height = 150 - margin.top - margin.bottom;
    const svg = d3.select(priorRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const labelsArr = ["P(Healthy)", "P(Disease)"];
    let probs = [1 - p, p];
    const x = d3.scaleBand().domain([0, 1]).range([0, width]).padding(0.5);
    const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);
    // Axis
    g.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(i => labelsArr[i]));
    // Drag handler
    const drag = d3.drag()
      .on("drag", function(event, d, i) {
        const val = Math.max(0, Math.min(y.invert(event.y), 1));
        const newP = i === 1 ? val : 1 - val;
        probs = [1 - newP, newP];
        updatePrior(probs, 0);
        setP(newP);
        setM(0);
        setPatients(generatePatients(200, newP, p_d, p_h));
      });
    // Update function
    function updatePrior(data, time) {
      // Bars
      const rects = g.selectAll("rect.prior-bar").data(data);
      rects.enter()
        .append("rect")
        .attr("class", "prior-bar")
        .attr("x", (d, i) => x(i))
        .attr("width", x.bandwidth())
        .attr("y", y(0))
        .attr("height", 0)
        .attr("fill", (d, i) => (i === 1 ? DISEASE_COLOR : HEALTHY_COLOR))
        .style("cursor", "row-resize")
        .call(drag)
        .merge(rects)
        .transition().duration(time)
          .attr("y", d => y(d))
          .attr("height", d => y(0) - y(d));
      rects.exit().remove();
      // Labels
      const labelsSel = g.selectAll("text.prior-label").data(data);
      labelsSel.enter()
        .append("text")
        .attr("class", "prior-label")
        .attr("x", (d, i) => x(i) + x.bandwidth() / 2)
        .attr("y", y(0) - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#18181b")
        .merge(labelsSel)
        .transition().duration(time)
          .attr("y", d => y(d) - 5)
          .text(d => round(d, 2));
      labelsSel.exit().remove();
    }
    // Initial draw
    updatePrior(probs, 0);
  }, []);

  // --- Marginal and Posterior Table ---
  function marginalAndPosterior() {
    const pos = (1 - p) * p_h + p * p_d;
    const neg = 1 - pos;
    return (
      <div className="flex flex-wrap gap-8 mt-4 justify-center">
        <table id="marginal" className="table-auto border-collapse border border-neutral-600 rounded overflow-hidden shadow-lg text-white text-sm">
          <thead className="bg-neutral-700">
            <tr>
              <th className="px-6 py-2 text-xs font-medium text-gray-300">Negative</th>
              <th className="px-6 py-2 text-xs font-medium text-gray-300">Positive</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td id="neg" className="px-6 py-3 hover:bg-neutral-600/50 cursor-pointer transition-colors">{round(neg, 2)}</td>
              <td id="pos" className="px-6 py-3 hover:bg-neutral-600/50 cursor-pointer transition-colors">{round(pos, 2)}</td>
            </tr>
          </tbody>
        </table>
        <table id="posterior" className="table-auto border-collapse border border-neutral-600 rounded overflow-hidden shadow-lg text-white text-sm">
          <thead className="bg-neutral-700">
            <tr>
              <th className="px-6 py-2"></th>
              <th className="px-6 py-2 text-xs font-medium text-gray-300">Negative</th>
              <th className="px-6 py-2 text-xs font-medium text-gray-300">Positive</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="px-6 py-3 bg-neutral-700">Healthy</th>
              <td id="h_n" className="px-6 py-3 hover:bg-neutral-600/50 cursor-pointer transition-colors">{neg > 0 ? round((1 - p) * (1 - p_h) / neg, 2) : 0}</td>
              <td id="h_p" className="px-6 py-3 hover:bg-neutral-600/50 cursor-pointer transition-colors">{pos > 0 ? round((1 - p) * p_h / pos, 2) : 0}</td>
            </tr>
            <tr>
              <th className="px-6 py-3 bg-neutral-700">Disease</th>
              <td id="d_n" className="px-6 py-3 hover:bg-neutral-600/50 cursor-pointer transition-colors">{neg > 0 ? round(p * (1 - p_d) / neg, 2) : 0}</td>
              <td id="d_p" className="px-6 py-3 hover:bg-neutral-600/50 cursor-pointer transition-colors">{pos > 0 ? round(p * p_d / pos, 2) : 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // --- Highlight & table interactivity ---
  function highlight(opacityClass, strokeClass) {
    const rootG = d3.select(svgRef.current).select("g");
    // reset all patients
    rootG.selectAll("circle.patient")
      .style("fill-opacity", 1)
      .style("stroke-width", 0);
    // opacity highlight
    if (opacityClass) {
      rootG.selectAll(`circle.patient.${opacityClass}`)
        .style("fill-opacity", 0.2);
    }
    // stroke highlight
    if (strokeClass) {
      rootG.selectAll(`circle.patient.${strokeClass}`)
        .style("stroke-width", 2)
        .style("stroke", "#fff");
    }
  }

  useEffect(() => {
    // Marginal cell hover
    d3.selectAll("#marginal td[id]")
      .on("mouseenter", function(event) {
        const cell = event.currentTarget.id;
        if (cell === "neg") highlight("negative", null);
        else if (cell === "pos") highlight("positive", null);
      })
      .on("mouseleave", () => highlight(null, null));

    // Posterior cell hover
    d3.selectAll("#posterior td[id]")
      .on("mouseenter", function(event) {
        const cell = event.currentTarget.id;
        if (cell === "h_n")   highlight("positive", "negative.healthy");
        else if (cell === "h_p") highlight("negative", "positive.healthy");
        else if (cell === "d_n") highlight("positive", "negative.disease");
        else if (cell === "d_p") highlight("negative", "positive.disease");
      })
      .on("mouseleave", () => highlight(null, null));
  }, [patients, m, p, p_d, p_h]);

  // --- Controls ---
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Bayesian Inference Simulation</h3>
      <div className="flex flex-wrap gap-4 items-center bg-neutral-900 rounded-lg p-4">
        <button className="px-3 py-1 rounded bg-pink-600 text-white" onClick={() => setM(m => Math.min(m + 1, patients.length))}>Test one</button>
        <button className="px-3 py-1 rounded bg-cyan-600 text-white" onClick={() => setM(patients.length)}>Test rest</button>
        <button className="px-3 py-1 rounded bg-gray-600 text-white" onClick={() => setM(0)}>Reset</button>
        <button className="px-3 py-1 rounded bg-yellow-500 text-white" onClick={() => setSorted(true)}>Sort</button>
        <button className="px-3 py-1 rounded bg-gray-400 text-white" onClick={() => setSorted(false)}>Unsort</button>
      </div>
      <div className="flex flex-wrap gap-8">
        <div>
          <h4 className="text-white mb-1">Prior</h4>
          <svg ref={priorRef} style={{ width: 300, height: 150 }} />
        </div>
        <div>
          <h4 className="text-white mb-1">Likelihood</h4>
          <svg ref={likelihoodRef} style={{ width: 300, height: 150 }} />
        </div>
      </div>
      {marginalAndPosterior()}
      <div className="w-full" style={{ maxWidth: 800, margin: "auto" }}>
        <svg ref={svgRef} style={{ width: "100%", height: 500 }} />
      </div>
    </section>
  );
}
