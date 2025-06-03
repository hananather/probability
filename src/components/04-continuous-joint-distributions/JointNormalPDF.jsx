"use client";
import { useState, useEffect, useRef, memo } from "react";
import * as d3 from "d3";
import Script from "next/script";

const margin = { top: 60, right: 60, bottom: 60, left: 60 };
const width = 500;
const height = 500;

function bivariateNormalPDF(x, y, muX, muY, sigmaX, sigmaY, rho) {
  const norm = 1 / (2 * Math.PI * sigmaX * sigmaY * Math.sqrt(1 - rho * rho));
  const dx = (x - muX) / sigmaX;
  const dy = (y - muY) / sigmaY;
  const exponent = -1 / (2 * (1 - rho * rho)) * (dx * dx - 2 * rho * dx * dy + dy * dy);
  return norm * Math.exp(exponent);
}

function JointNormalPDF() {
  const [muX, setMuX] = useState(0);
  const [muY, setMuY] = useState(0);
  const [sigmaX, setSigmaX] = useState(1);
  const [sigmaY, setSigmaY] = useState(1);
  const [rho, setRho] = useState(0);
  const svgRef = useRef(null);
  const domain = [-4, 4];

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const xScale = d3.scaleLinear().domain(domain).range([0, width]);
    const yScale = d3.scaleLinear().domain(domain).range([height, 0]);

    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", "#fff");

    g.append("g")
      .call(yAxis)
      .selectAll("text")
      .attr("fill", "#fff");

    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .text("x");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .text("y");

    const gridSize = 60;
    const xVals = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / gridSize);
    const yVals = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / gridSize);
    const values = [];
    let maxPDF = 0;
    yVals.forEach((y) => {
      xVals.forEach((x) => {
        const v = bivariateNormalPDF(x, y, muX, muY, sigmaX, sigmaY, rho);
        values.push({ x, y, v });
        if (v > maxPDF) maxPDF = v;
      });
    });

    const color = d3.scaleSequential(d3.interpolateViridis).domain([0, maxPDF]);

    g.selectAll("rect")
      .data(values)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.x))
      .attr("y", (d) => yScale(d.y + (domain[1] - domain[0]) / gridSize))
      .attr("width", width / gridSize)
      .attr("height", height / gridSize)
      .attr("fill", (d) => color(d.v));

    g.append("line")
      .attr("x1", xScale(muX))
      .attr("x2", xScale(muX))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#eab308")
      .attr("stroke-dasharray", "4,4");

    g.append("line")
      .attr("y1", yScale(muY))
      .attr("y2", yScale(muY))
      .attr("x1", 0)
      .attr("x2", width)
      .attr("stroke", "#eab308")
      .attr("stroke-dasharray", "4,4");

    g.append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Bivariate Normal PDF");

    g.append("text")
      .attr("x", width - 10)
      .attr("y", -5)
      .attr("text-anchor", "end")
      .attr("fill", "#fde047")
      .style("font-size", "14px")
      .text(`\u03BC_x=${muX.toFixed(1)}, \u03BC_y=${muY.toFixed(1)}, \u03C3_x=${sigmaX.toFixed(1)}, \u03C3_y=${sigmaY.toFixed(1)}, \u03C1=${rho.toFixed(2)}`);
  }, [muX, muY, sigmaX, sigmaY, rho]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, [muX, muY, sigmaX, sigmaY, rho]);

  const pdfFormula = `f(x,y) = \\frac{1}{2\\pi\\sigma_x\\sigma_y\\sqrt{1-\\rho^2}} \\exp\\left(-\\frac{1}{2(1-\\rho^2)}[(\\frac{x-\\mu_x}{\\sigma_x})^2 - 2\\rho(\\frac{x-\\mu_x}{\\sigma_x})(\\frac{y-\\mu_y}{\\sigma_y}) + (\\frac{y-\\mu_y}{\\sigma_y})^2]\\right)`;

  return (
    <section className="space-y-4 my-8 p-6 bg-neutral-800 rounded-lg shadow-xl">
      <Script id="mathjax-joint" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" strategy="afterInteractive" />
      <h3 className="text-xl font-semibold text-teal-400 border-b border-neutral-700 pb-2 mb-6">
        Joint Continuous Distribution
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2 md:col-span-1">
          <label className="block text-sm text-neutral-300">\u03BC_x: {muX.toFixed(1)}</label>
          <input type="range" min="-3" max="3" step="0.1" value={muX} onChange={(e)=>setMuX(parseFloat(e.target.value))} className="w-full" />
          <label className="block text-sm text-neutral-300">\u03BC_y: {muY.toFixed(1)}</label>
          <input type="range" min="-3" max="3" step="0.1" value={muY} onChange={(e)=>setMuY(parseFloat(e.target.value))} className="w-full" />
          <label className="block text-sm text-neutral-300">\u03C3_x: {sigmaX.toFixed(1)}</label>
          <input type="range" min="0.5" max="4" step="0.1" value={sigmaX} onChange={(e)=>setSigmaX(parseFloat(e.target.value))} className="w-full" />
          <label className="block text-sm text-neutral-300">\u03C3_y: {sigmaY.toFixed(1)}</label>
          <input type="range" min="0.5" max="4" step="0.1" value={sigmaY} onChange={(e)=>setSigmaY(parseFloat(e.target.value))} className="w-full" />
          <label className="block text-sm text-neutral-300">\u03C1: {rho.toFixed(2)}</label>
          <input type="range" min="-0.9" max="0.9" step="0.05" value={rho} onChange={(e)=>setRho(parseFloat(e.target.value))} className="w-full" />
        </div>
        <div className="md:col-span-2" style={{width:"100%",height:"500px"}}>
          <svg ref={svgRef} style={{width:"100%",height:"100%"}} />
        </div>
      </div>
      <div className="mt-4 text-neutral-300 text-sm" dangerouslySetInnerHTML={{__html:`\\[${pdfFormula}\\]`}} />
    </section>
  );
}

export default memo(JointNormalPDF);
