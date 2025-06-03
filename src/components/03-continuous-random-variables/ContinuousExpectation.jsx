"use client";
import { useState, useEffect, useRef, memo, useCallback } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";
import ExpectationWorkedExample from "./ExpectationWorkedExample";

const margin = { top: 60, right: 40, bottom: 70, left: 60 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const distributionOptions = [
  { value: "normal", label: "Normal", params: [{name: "μ (Mean)", min: -5, max:5, step:0.1, default: 0}, {name: "σ (Std Dev)", min: 0.1, max: 5, step:0.1, default: 1}], pdfTex: "\\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}" },
  { value: "exponential", label: "Exponential", params: [{name: "λ (Rate)", min: 0.1, max: 5, step:0.1, default: 1}], pdfTex: "\\lambda e^{-\\lambda x}, \\quad x \\ge 0" },
  { value: "gamma", label: "Gamma", params: [{name: "k (Shape)", min: 0.1, max:10, step:0.1, default: 2}, {name: "θ (Scale)", min: 0.1, max: 5, step:0.1, default: 1}], pdfTex: "\\frac{1}{\\Gamma(k)\\theta^k} x^{k-1} e^{-x/\\theta}, \\quad x > 0" },
  { value: "uniform", label: "Uniform", params: [{name: "a (Min)", min: -5, max:5, step:0.1, default: 0}, {name: "b (Max)", min: -4, max: 6, step:0.1, default: 1}], pdfTex: "\\frac{1}{b_0-a_0}, \\quad a_0 \\le x \\le b_0" },
  { value: "beta", label: "Beta", params: [{name: "α (Alpha)", min: 0.1, max: 10, step:0.1, default: 2}, {name: "β (Beta)", min: 0.1, max: 10, step:0.1, default: 2}], pdfTex: "\\frac{x^{\\alpha-1}(1-x)^{\\beta-1}}{B(\\alpha, \\beta)}, \\quad 0 < x < 1" },
];

function ContinuousExpectation() {
  const [selectedDist, setSelectedDist] = useState(distributionOptions[0]);
  const [params, setParams] = useState(selectedDist.params.map(p => p.default));
  const svgRef = useRef();
  const [meanValue, setMeanValue] = useState(0);

  const calculatePlotData = useCallback(() => {
    let domain, data = [], meanVal;
    const numPoints = 500;
    try {
      switch (selectedDist.value) {
        case "normal":
          domain = [params[0] - 4 * params[1], params[0] + 4 * params[1]];
          data = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / numPoints).map(xVal => ({ x: xVal, y: jStat.normal.pdf(xVal, params[0], params[1]) }));
          meanVal = jStat.normal.mean(params[0], params[1]);
          break;
        case "exponential":
          domain = [0, Math.max(5 / params[0], 5)];
          data = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / numPoints).map(xVal => ({ x: xVal, y: jStat.exponential.pdf(xVal, params[0]) }));
          meanVal = jStat.exponential.mean(params[0]);
          break;
        case "gamma":
          const gammaMean = params[0] * params[1];
          const gammaStdDev = Math.sqrt(params[0]) * params[1];
          domain = [Math.max(0.0001, gammaMean - 4 * gammaStdDev), Math.max(gammaMean + 4 * gammaStdDev, 5)];
          if(domain[0] >= domain[1]) domain = [0.0001, domain[0]+1];
          data = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / numPoints).map(xVal => ({ x: xVal, y: jStat.gamma.pdf(xVal, params[0], params[1]) }));
          meanVal = jStat.gamma.mean(params[0], params[1]);
          break;
        case "uniform":
          let [ua, ub] = params;
          if (ua >= ub) { ub = ua + 0.1; }
          domain = [ua - (ub-ua)*0.2 - 0.5, ub + (ub-ua)*0.2 + 0.5];
          data = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / numPoints).map(xVal => ({ x: xVal, y: jStat.uniform.pdf(xVal, ua, ub) }));
          meanVal = jStat.uniform.mean(ua, ub);
          break;
        case "beta":
          domain = [0, 1];
          if (params[0] <=0 || params[1] <=0) {
            data = []; meanVal = 0.5;
          } else {
            data = d3.range(0.001, 0.999, (0.999 - 0.001) / numPoints).map(xVal => ({ x: xVal, y: jStat.beta.pdf(xVal, params[0], params[1]) }));
            meanVal = jStat.beta.mean(params[0], params[1]);
          }
          break;
        default:
          domain = [-5, 5]; data = []; meanVal = 0;
      }
      return { domain, data, meanVal };
    } catch (error) {
      console.error("Error calculating distribution data:", error);
      return { domain: [-5,5], data: [], meanVal: 0 };
    }
  }, [selectedDist.value, params]);

  useEffect(() => {
    const { domain, data: plotData, meanVal } = calculatePlotData();
    setMeanValue(meanVal);

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain(domain).range([0, width]);
    const maxYValue = d3.max(plotData, d => d.y) || 1;
    const yScale = d3.scaleLinear().domain([0, maxYValue * 1.1]).range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .selectAll("text").attr("fill", "#fff").attr("font-size", "12px");
    svg.append("text").attr("text-anchor", "middle").attr("x", width / 2).attr("y", height + margin.bottom - 20).attr("fill", "#fff").style("font-size", "14px").text("x");

    svg.append("g").call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text").attr("fill", "#fff").attr("font-size", "12px");
    svg.append("text").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -margin.left + 20).attr("fill", "#fff").style("font-size", "14px").text("Density f(x)");

    const line = d3.line().x(d => xScale(d.x)).y(d => yScale(d.y)).curve(d3.curveBasis);
    const areaGenerator = d3.area().x(d => xScale(d.x)).y0(height).y1(d => yScale(d.y)).curve(d3.curveBasis);

    svg.append("path").datum(plotData).attr("fill", "rgba(20, 184, 166, 0.3)").attr("d", areaGenerator);
    svg.append("path").datum(plotData).attr("fill", "none").attr("stroke", "#14b8a6").attr("stroke-width", 2.5).attr("d", line);

    if (meanVal !== undefined && xScale(meanVal) >= 0 && xScale(meanVal) <= width) {
      svg.append("line").attr("x1", xScale(meanVal)).attr("x2", xScale(meanVal)).attr("y1", yScale(0)).attr("y2", yScale(maxYValue * 1.1)).attr("stroke", "#eab308").attr("stroke-width", 2).attr("stroke-dasharray", "4,4");
      svg.append("text").attr("x", xScale(meanVal) + 5).attr("y", yScale(maxYValue*1.05)).attr("fill", "#eab308").style("font-size", "12px").text(`μ = ${meanVal.toFixed(2)}`);
    }

    svg.append("text").attr("x", width / 2).attr("y", -margin.top / 2 - 10).attr("text-anchor", "middle").attr("fill", "#fff").style("font-size", "18px").style("font-weight", "bold").text(`${selectedDist.label} Distribution`);
    selectedDist.params.forEach((paramInfo, index) => {
      svg.append("text").attr("x", 10).attr("y", -margin.top / 2 + 15 + (index * 18)).attr("fill", "#fff").style("font-size", "12px").text(`${paramInfo.name}: ${params[index].toFixed(2)}`);
    });

    svg.append("text").attr("x", width - 10).attr("y", -margin.top / 2 + 15).attr("text-anchor", "end").attr("fill", "#fde047").style("font-size", "14px").style("font-weight", "bold").text(`E[X] = ${meanVal.toFixed(4)}`);

    return () => d3.select(svgRef.current).selectAll("*").remove();
  }, [selectedDist, params, calculatePlotData]);

  const handleDistChange = (e) => {
    const newDist = distributionOptions.find(opt => opt.value === e.target.value);
    setSelectedDist(newDist);
    setParams(newDist.params.map(p => p.default));
  };

  const handleParamChange = (index, value) => {
    const newParams = [...params];
    newParams[index] = parseFloat(value);
    if (selectedDist.value === "uniform") {
      if (index === 0 && newParams[0] >= newParams[1]) newParams[1] = newParams[0] + 0.1;
      else if (index === 1 && newParams[1] <= newParams[0]) newParams[0] = newParams[1] - 0.1;
    }
    if (selectedDist.value === "beta") {
      if (newParams[0] <= 0) newParams[0] = 0.1;
      if (newParams[1] <= 0) newParams[1] = 0.1;
    }
    setParams(newParams);
  };

  return (
    <section id="expectation-demo" className="space-y-4 my-8 p-6 bg-neutral-800 rounded-lg shadow-xl">
      <h3 className="text-xl font-semibold text-teal-400 border-b border-neutral-700 pb-2 mb-6">
        Expectation of a Continuous Random Variable
      </h3>
      <div className="controls grid md:grid-cols-2 gap-6 items-start">
        <div className="space-y-2">
          <label htmlFor="dist-select-exp" className="block text-sm font-medium text-neutral-300">Select Distribution:</label>
          <select id="dist-select-exp" value={selectedDist.value} onChange={handleDistChange} className="w-full p-2 rounded bg-neutral-700 text-white border border-neutral-600 focus:ring-teal-500 focus:border-teal-500">
            {distributionOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </div>
        <div className="space-y-4">
          {selectedDist.params.map((paramInfo, index) => (
            <div key={paramInfo.name} className="space-y-1">
              <label htmlFor={`param-exp-${index}`} className="block text-sm font-medium text-neutral-300">
                {paramInfo.name}: <span className="font-mono text-teal-400">{Number(params[index]).toFixed(2)}</span>
              </label>
              <input type="range" id={`param-exp-${index}`} min={paramInfo.min} max={paramInfo.max} step={paramInfo.step} value={params[index]} onChange={(e) => handleParamChange(index, e.target.value)} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-teal-500"/>
            </div>
          ))}
        </div>
      </div>

      <div id="expectation-graph-container" className="mt-6 bg-neutral-900 p-4 rounded-md shadow-inner" style={{width:"100%",maxWidth:"800px", margin:"auto"}}>
        <svg ref={svgRef} style={{width:"100%", height:"auto", display:"block"}} />
      </div>
      <div className="flex justify-center">
        <ExpectationWorkedExample distName={selectedDist.value} distLabel={selectedDist.label} params={params} pdfFormula={selectedDist.pdfTex} meanValue={meanValue} />
      </div>
    </section>
  );
}

export default memo(ContinuousExpectation);

