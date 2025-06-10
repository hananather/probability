// src/components/BayesianInference.jsx
// Modern React + D3 translation of Bayesian Inference simulation (from jQuery/D3 code)
"use client";

import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import PriorPlot from "../shared/PriorPlot";

function round(val, digits = 2) {
  return Math.round(val * Math.pow(10, digits)) / Math.pow(10, digits);
}

const HEALTHY_COLOR = "#60A5FA"; // blue-400 for better contrast
const DISEASE_COLOR = "#F87171"; // red-400 for better contrast

// Vibrant button colors using color theory
const BUTTON_PRIMARY = "#06B6D4"; // cyan-500 - vibrant, action-oriented
const BUTTON_SECONDARY = "#8B5CF6"; // violet-500 - comprehensive action
const BUTTON_RESET = "#6B7280"; // gray-500 - neutral destructive action

export function BayesianInference() {
  // State for priors and likelihoods
  const [p, setP] = useState(0.10); // P(Disease)
  const [p_d, setPd] = useState(0.75); // P(+|Disease)
  const [p_h, setPh] = useState(0.25); // P(+|Healthy)
  const [patients, setPatients] = useState([]); // patient array
  const [m, setM] = useState(0); // number of tested patients
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
    const h0 = 0.25;  // top of test bar (moved up)
    const h1 = 0.35;  // bottom of test bar (moved up)
    const h2 = 0.40;  // slider (moved up)
    // const h0 = 0.15;  // top of test bar
    // const h1 = 0.25;  // bottom of test bar
    // const h2 = 0.30;  // slider
    const col = 20;
    const r = (w * width) / (2 * col);

    // --- Draw flow diagram elements ---
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
    
    // Draw flow lines
    draw_bar(g, 0.25, 0.5, h1, h0, "");
    draw_bar(g, 0.5, 0.75, h0, h1, "");
    draw_bar(g, 0.25, 0.25, h1, h2, "");
    draw_bar(g, 0.75, 0.75, h1, h2, "");
    // Result area labels with colored accents
    const negX = (0.5 - w) / 2 + w/2;
    const posX = (1.5 - w) / 2 + w/2;
    
    g.append("text")
      .attr("x", x(negX))
      .attr("y", y(0.88))
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .attr("font-weight", 500)
      .attr("fill", "#a1a1aa")
      .text("Test Negative (−)");
      
    g.append("text")
      .attr("x", x(posX))
      .attr("y", y(0.88))
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .attr("font-weight", 500)
      .attr("fill", "#a1a1aa")
      .text("Test Positive (+)");
    
    // Population label is now outside the SVG, so we don't need it here
    
    // Add "Test" label in a better position (to the side of the funnel)
    g.append("text")
      .attr("x", x(0.75) + 30)
      .attr("y", y((h0 + h1) / 2))
      .attr("text-anchor", "start")
      .attr("font-size", 14)
      .attr("font-weight", 500)
      .attr("fill", "#71717a")
      .text("Diagnostic Test");

    // conditional slider axis & handles
    const sliderAxis = d3.axisBottom(z).ticks(5).tickFormat(d => d3.format(".0%")(d));
    g.append("g")
      .attr("class", "slider-axis")
      .attr("transform", `translate(0,${y(h2)})`)
      .call(sliderAxis)
      .append("text")
      .attr("x", x(0.5))
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", "#a1a1aa")
      .text("Test Result Probability");

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
    // Fixed grid layout with better centering
    const gridCols = 14;
    const gridRows = Math.ceil(patients.length / gridCols);
    const actualRows = Math.ceil(patients.length / gridCols);
    const spacing = r * 2.2; // Slightly more spacing for clarity
    const centerX = x(0.5);
    const centerY = y(0.08); // Position dots higher since label is now outside
    // Animate population dots
    const circle = g.selectAll("circle.population").data(patients, d => d.index);
    circle.enter().append("circle")
      .attr("class", "population")
      .attr("r", r - 1)
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("fill", d => d.hasDisease ? DISEASE_COLOR : HEALTHY_COLOR)
      .attr("opacity", 0.9)
      .attr("stroke", "#27272a")
      .attr("stroke-width", 0.5)
      .transition()
      .duration(600)
      .attr("cx", (d, i) => centerX + ((i % gridCols) - (gridCols - 1) / 2) * spacing)
      .attr("cy", (d, i) => centerY + (Math.floor(i / gridCols) - (actualRows - 1) / 2) * spacing);
    circle.transition()
      .duration(600)
      .attr("fill", d => d.hasDisease ? DISEASE_COLOR : HEALTHY_COLOR)
      .attr("cx", (d, i) => centerX + ((i % gridCols) - (gridCols - 1) / 2) * spacing)
      .attr("cy", (d, i) => centerY + (Math.floor(i / gridCols) - (actualRows - 1) / 2) * spacing);
    circle.exit().transition().duration(400).attr("opacity", 0).remove();
  }, [patients]);

  // --- Sampling & test animation ---
  useEffect(() => {
    const margin = { top: 100, right: 20, bottom: 20, left: 20 };
    const width = 700 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    const x = d3.scaleLinear().domain([0, 1]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 1]).range([0, height]);
    const w = 0.25, h0 = 0.25, h1 = 0.35, h2 = 0.40, col = 20;
    const r = (w * width) / (2 * col);
    const g = d3.select(svgRef.current).select("g");

    // slice and sort patients
    let sample = patients.slice(0, m);
    let positive = [], negative = [];
    sample.forEach(d => {
      if (d.positiveTest) positive.push(d);
      else negative.push(d);
    });
    // assign new orders for contiguous packing
    positive.forEach((d, i) => d.order = i);
    negative.forEach((d, i) => d.order = i);
    const data = positive.concat(negative);

    // timing - smoother animations
    const dt = m < patients.length ? 500 : Math.max(50, 8000 / patients.length);
    const delay = m < patients.length ? 0 : Math.max(20, 8000 / patients.length);

    // bind data
    const circles = g.selectAll("circle.patient").data(data, d => d.index);

    // update existing
    circles.transition().duration(dt)
      .attr("fill", d => d.hasDisease ? DISEASE_COLOR : HEALTHY_COLOR)
      .attr("cx", d => x(0.5 * (d.positiveTest ? 1 : 0) + (0.5 - w) / 2) + r + 2 * r * (d.order % col))
      .attr("cy", d => y(0.75) - r - 2 * r * Math.floor(d.order / col) - 1);

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
        .attr("cy", d => y(0.75) - r - 2 * r * Math.floor(d.order / col) - 1);

    circles.exit().remove();
  }, [m, patients]);

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
        <table id="marginal" className="table-auto border-collapse border border-neutral-600 rounded-lg overflow-hidden shadow-lg text-white text-sm">
          <caption className="text-xs text-neutral-400 mb-2">Marginal Probabilities</caption>
          <thead className="bg-neutral-700">
            <tr>
              <th className="px-6 py-2 text-xs font-medium text-gray-300">Test Negative (−)</th>
              <th className="px-6 py-2 text-xs font-medium text-gray-300">Test Positive (+)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td id="neg" className="px-6 py-3 hover:bg-neutral-600/50 cursor-pointer transition-colors font-mono">{round(neg, 3)}</td>
              <td id="pos" className="px-6 py-3 hover:bg-neutral-600/50 cursor-pointer transition-colors font-mono">{round(pos, 3)}</td>
            </tr>
          </tbody>
        </table>
        <table id="posterior" className="table-auto border-collapse border border-neutral-600 rounded-lg overflow-hidden shadow-lg text-white text-sm">
          <caption className="text-xs text-neutral-400 mb-2">Posterior Probabilities</caption>
          <thead className="bg-neutral-700">
            <tr>
              <th className="px-6 py-2 text-xs font-medium text-gray-300">Health Status</th>
              <th className="px-6 py-2 text-xs font-medium text-gray-300">Given Test (−)</th>
              <th className="px-6 py-2 text-xs font-medium text-gray-300">Given Test (+)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="px-6 py-3 bg-neutral-700">Healthy</th>
              <td id="h_n" className="px-6 py-3 hover:bg-neutral-600/50 cursor-pointer transition-colors font-mono">{neg > 0 ? round((1 - p) * (1 - p_h) / neg, 3) : "0.000"}</td>
              <td id="h_p" className="px-6 py-3 hover:bg-neutral-600/50 cursor-pointer transition-colors font-mono">{pos > 0 ? round((1 - p) * p_h / pos, 3) : "0.000"}</td>
            </tr>
            <tr>
              <th className="px-6 py-3 bg-neutral-700">Disease</th>
              <td id="d_n" className="px-6 py-3 hover:bg-neutral-600/50 cursor-pointer transition-colors font-mono">{neg > 0 ? round(p * (1 - p_d) / neg, 3) : "0.000"}</td>
              <td id="d_p" className="px-6 py-3 hover:bg-neutral-600/50 cursor-pointer transition-colors font-mono">{pos > 0 ? round(p * p_d / pos, 3) : "0.000"}</td>
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
    <section className="space-y-8"> {/* Changed to space-y-8 to match original wrapper, or adjust as needed */}
      <PriorPlot />
      <div className="mb-4">
        <p className="text-sm text-neutral-400">
          Explore how prior beliefs and test accuracy combine to determine the probability of disease given a test result.
          Hover over the probability tables to see which patients contribute to each outcome.
        </p>
      </div>
      <h3 className="text-lg font-semibold text-white">Bayesian Inference Simulation</h3>
      <div className="flex flex-wrap gap-8">
        <div className="bg-neutral-900 rounded-lg p-4">
          <h4 className="text-white mb-1 font-medium text-sm">Prior Probabilities</h4>
          <p className="text-xs text-neutral-500 mb-2">Drag bars to adjust disease prevalence</p>
          <svg ref={priorRef} style={{ width: 300, height: 150 }} />
        </div>
        <div className="bg-neutral-900 rounded-lg p-4">
          <h4 className="text-white mb-1 font-medium text-sm">Test Characteristics</h4>
          <p className="text-xs text-neutral-500 mb-2">Drag bars to adjust test accuracy</p>
          <svg ref={likelihoodRef} style={{ width: 300, height: 150 }} />
        </div>
      </div>
      <div className="w-full" style={{ maxWidth: 800, margin: "auto" }}>
        <h4 className="text-center text-white font-semibold mb-2">Population</h4>
        <div className="border border-neutral-800 rounded-lg p-2 bg-neutral-900/30">
          <svg ref={svgRef} style={{ width: "100%", height: 500 }} />
        </div>
      </div>
      <div className="flex gap-3 items-center justify-center mt-4 mb-2">
        <button 
          className="px-4 py-2 text-sm font-semibold text-white rounded-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          style={{ 
            backgroundColor: BUTTON_PRIMARY,
            boxShadow: `0 4px 14px 0 ${BUTTON_PRIMARY}40`
          }}
          onMouseEnter={(e) => e.target.style.boxShadow = `0 6px 20px 0 ${BUTTON_PRIMARY}60`}
          onMouseLeave={(e) => e.target.style.boxShadow = `0 4px 14px 0 ${BUTTON_PRIMARY}40`}
          onClick={() => setM(m => Math.min(m + 1, patients.length))}
          disabled={m >= patients.length}
        >
          Test One
        </button>
        <button 
          className="px-4 py-2 text-sm font-semibold text-white rounded-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          style={{ 
            backgroundColor: BUTTON_SECONDARY,
            boxShadow: `0 4px 14px 0 ${BUTTON_SECONDARY}40`
          }}
          onMouseEnter={(e) => e.target.style.boxShadow = `0 6px 20px 0 ${BUTTON_SECONDARY}60`}
          onMouseLeave={(e) => e.target.style.boxShadow = `0 4px 14px 0 ${BUTTON_SECONDARY}40`}
          onClick={() => setM(patients.length)}
          disabled={m >= patients.length}
        >
          Test All
        </button>
        <button 
          className="px-4 py-2 text-sm font-medium text-white rounded-md transition-all duration-200 hover:bg-gray-600"
          style={{ backgroundColor: BUTTON_RESET }}
          onClick={() => setM(0)}
        >
          Reset
        </button>
      </div>
      {marginalAndPosterior()}
    </section>
  );
}