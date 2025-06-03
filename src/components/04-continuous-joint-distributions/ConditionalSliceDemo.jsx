"use client";
import { useState, useEffect, useRef, memo } from "react";
import * as d3 from "d3";
import Script from "next/script";

const margin = { top: 60, right: 60, bottom: 60, left: 60 };
const width = 500;
const height = 300;

function ConditionalSliceDemo() {
  const [x0, setX0] = useState(0);
  const [muX, setMuX] = useState(0);
  const [muY, setMuY] = useState(0);
  const [sigmaX, setSigmaX] = useState(1);
  const [sigmaY, setSigmaY] = useState(1);
  const [rho, setRho] = useState(0);
  const svgRef = useRef(null);
  const domain = [-4, 4];

  function condParams(x) {
    const mean = muY + rho * (sigmaY / sigmaX) * (x - muX);
    const variance = (1 - rho * rho) * sigmaY * sigmaY;
    return { mean, variance };
  }

  function pdfYgivenX(y, x) {
    const { mean, variance } = condParams(x);
    const sd = Math.sqrt(variance);
    return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((y - mean) / sd) ** 2);
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const yScale = d3.scaleLinear().domain(domain).range([height, 0]);
    const xScale = d3.scaleLinear().domain(domain).range([0, width]);

    const yAxis = d3.axisLeft(yScale).ticks(5);
    const xAxis = d3.axisBottom(xScale).ticks(5);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", "#fff");

    g.append("g")
      .call(yAxis)
      .selectAll("text")
      .attr("fill", "#fff");

    const cond = condParams(x0);
    const sd = Math.sqrt(cond.variance);
    const yVals = d3.range(domain[0], domain[1], 0.1);
    const lineData = yVals.map((y) => ({ x: y, y: pdfYgivenX(y, x0) }));
    const maxY = d3.max(lineData, (d) => d.y) || 1;
    const pdfScale = d3.scaleLinear().domain([0, maxY * 1.1]).range([0, width / 2]);

    const line = d3.line()
      .x((d) => pdfScale(d.y))
      .y((d) => yScale(d.x));

    g.append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "#38a169")
      .attr("stroke-width", 2)
      .attr("d", line);

    g.append("line")
      .attr("x1", pdfScale(0))
      .attr("x2", pdfScale(maxY * 1.1))
      .attr("y1", yScale(cond.mean))
      .attr("y2", yScale(cond.mean))
      .attr("stroke", "#eab308")
      .attr("stroke-dasharray", "4,4");

    g.append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Conditional PDF f(y|x)");

    g.append("text")
      .attr("x", pdfScale(maxY * 1.1))
      .attr("y", -5)
      .attr("text-anchor", "end")
      .attr("fill", "#fde047")
      .style("font-size", "14px")
      .text(`x_0=${x0.toFixed(1)}`);

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .text("y");

    g.append("text")
      .attr("x", width / 4)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .text("Density");
  }, [x0, muX, muY, sigmaX, sigmaY, rho]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, [x0, muX, muY, sigmaX, sigmaY, rho]);

  const { mean, variance } = condParams(x0);
  const formula = `f(y|x_0) = \\mathcal{N}(y; \\mu_y + \\rho \\frac{\\sigma_y}{\\sigma_x}(x_0-\\mu_x), (1-\\rho^2)\\sigma_y^2)`;
  const meanDisplay = `\\mu_{Y|X=x_0} = ${mean.toFixed(2)}, \\; \text{Var}_{Y|X=x_0} = ${variance.toFixed(2)}`;

  return (
    <section className="space-y-4 my-8 p-6 bg-neutral-800 rounded-lg shadow-xl">
      <Script id="mathjax-cond" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" strategy="afterInteractive" />
      <h3 className="text-lg font-semibold text-teal-400 border-b border-neutral-700 pb-2 mb-6">
        Conditional Distribution Slice
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2 md:col-span-1">
          <label className="block text-sm text-neutral-300">x_0: {x0.toFixed(1)}</label>
          <input type="range" min="-3" max="3" step="0.1" value={x0} onChange={(e)=>setX0(parseFloat(e.target.value))} className="w-full" />
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
        <div className="md:col-span-2" style={{width:"100%",height:"300px"}}>
          <svg ref={svgRef} style={{width:"100%",height:"100%"}} />
        </div>
      </div>
      <div className="mt-4 text-neutral-300 text-sm" dangerouslySetInnerHTML={{__html:`\\[${formula}\\]\\[${meanDisplay}\\]`}} />
    </section>
  );
}

export default memo(ConditionalSliceDemo);
