"use client";
import { useState, useEffect, useRef, memo, useCallback } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";
import { IntegralWorkedExample } from "./IntegralWorkedExample"; // Assuming it's in the same folder or adjust path

// Canvas settings
const margin = { top: 60, right: 40, bottom: 70, left: 60 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const distributionOptions = [
  { value: "normal", label: "Normal", params: [{name: "μ (Mean)", min: -5, max: 5, step:0.1, default: 0}, {name: "σ (Std Dev)", min: 0.1, max: 5, step:0.1, default: 1}], pdfTex: "\\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}" },
  { value: "exponential", label: "Exponential", params: [{name: "λ (Rate)", min: 0.1, max: 5, step:0.1, default: 1}], pdfTex: "\\lambda e^{-\\lambda x}, \\quad x \\ge 0" },
  { value: "gamma", label: "Gamma", params: [{name: "k (Shape)", min: 0.1, max: 10, step:0.1, default: 2}, {name: "θ (Scale)", min: 0.1, max: 5, step:0.1, default: 1}], pdfTex: "\\frac{1}{\\Gamma(k)\\theta^k} x^{k-1} e^{-x/\\theta}, \\quad x > 0" },
  { value: "uniform", label: "Uniform", params: [{name: "a (Min)", min: -5, max: 5, step:0.1, default: 0}, {name: "b (Max)", min: -4, max: 6, step:0.1, default: 1}], pdfTex: "\\frac{1}{b_0-a_0}, \\quad a_0 \\le x \\le b_0" }, // Use a_0, b_0 for clarity in formula
  { value: "beta", label: "Beta", params: [{name: "α (Alpha)", min: 0.1, max: 10, step:0.1, default: 2}, {name: "β (Beta)", min: 0.1, max: 10, step:0.1, default: 2}], pdfTex: "\\frac{x^{\\alpha-1}(1-x)^{\\beta-1}}{B(\\alpha, \\beta)}, \\quad 0 < x < 1" },
];

function ContinuousDistributionsPDF() {
  const [selectedDist, setSelectedDist] = useState(distributionOptions[0]);
  const [params, setParams] = useState(selectedDist.params.map(p => p.default));
  const svgRef = useRef();
  const componentRef = useRef();

  const [xDomain, setXDomain] = useState([-5, 5]); // For managing slider ranges
  const [intervalA, setIntervalA] = useState(xDomain[0]);
  const [intervalB, setIntervalB] = useState(xDomain[1]);
  const [calculatedIntegralProb, setCalculatedIntegralProb] = useState(0);
  const [cdfAValue, setCdfAValue] = useState(0);
  const [cdfBValue, setCdfBValue] = useState(0);


  const calculatePlotDataAndStats = useCallback(() => {
    let domain, data = [], meanVal, cdfA, cdfB, integralProb;
    const numPoints = 500;

    try {
      switch (selectedDist.value) {
        case "normal":
          domain = [params[0] - 4 * params[1], params[0] + 4 * params[1]];
          data = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / numPoints).map(xVal => ({
            x: xVal, y: jStat.normal.pdf(xVal, params[0], params[1])
          }));
          meanVal = jStat.normal.mean(params[0], params[1]);
          cdfA = jStat.normal.cdf(intervalA, params[0], params[1]);
          cdfB = jStat.normal.cdf(intervalB, params[0], params[1]);
          break;
        case "exponential":
          domain = [0, Math.max(5 / params[0], 5)];
          data = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / numPoints).map(xVal => ({
            x: xVal, y: jStat.exponential.pdf(xVal, params[0])
          }));
          meanVal = jStat.exponential.mean(params[0]);
          cdfA = jStat.exponential.cdf(intervalA, params[0]);
          cdfB = jStat.exponential.cdf(intervalB, params[0]);
          break;
        case "gamma":
          const gammaMean = params[0] * params[1];
          const gammaStdDev = Math.sqrt(params[0]) * params[1];
          domain = [Math.max(0.0001, gammaMean - 4*gammaStdDev), Math.max(gammaMean + 4 * gammaStdDev, 5)];
           if(domain[0] >= domain[1]) domain = [0.0001, domain[0]+1]; // ensure valid domain
          data = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / numPoints).map(xVal => ({
            x: xVal, y: jStat.gamma.pdf(xVal, params[0], params[1])
          }));
          meanVal = jStat.gamma.mean(params[0], params[1]);
          cdfA = jStat.gamma.cdf(intervalA, params[0], params[1]);
          cdfB = jStat.gamma.cdf(intervalB, params[0], params[1]);
          break;
        case "uniform":
          let [ua, ub] = params;
          if (ua >= ub) { ub = ua + 0.1; } // Ensure ua < ub
          domain = [ua - (ub-ua)*0.2 - 0.5, ub + (ub-ua)*0.2 + 0.5];
          data = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / numPoints).map(xVal => ({
            x: xVal, y: jStat.uniform.pdf(xVal, ua, ub)
          }));
          meanVal = jStat.uniform.mean(ua, ub);
          cdfA = jStat.uniform.cdf(intervalA, ua, ub);
          cdfB = jStat.uniform.cdf(intervalB, ua, ub);
          break;
        case "beta":
          domain = [0, 1];
           if (params[0] <=0 || params[1] <=0) { // Guard against invalid beta params for jStat
              data = []; meanVal = 0.5; cdfA = 0; cdfB = 0;
           } else {
            data = d3.range(0.001, 0.999, (0.999 - 0.001) / numPoints).map(xVal => ({
              x: xVal, y: jStat.beta.pdf(xVal, params[0], params[1])
            }));
            meanVal = jStat.beta.mean(params[0], params[1]);
            cdfA = jStat.beta.cdf(intervalA, params[0], params[1]);
            cdfB = jStat.beta.cdf(intervalB, params[0], params[1]);
           }
          break;
        default:
          domain = [-5, 5]; data = []; meanVal = 0; cdfA = 0; cdfB = 0;
      }
      integralProb = Math.max(0, cdfB - cdfA); // Probability can't be negative
      return { domain, data, meanVal, cdfA, cdfB, integralProb };

    } catch (error) {
      console.error("Error calculating distribution data:", error);
      return { domain: [-5,5], data: [], meanVal: 0, cdfA:0, cdfB:0, integralProb:0 };
    }
  }, [selectedDist.value, params, intervalA, intervalB]);


  useEffect(() => {
    const { domain } = calculatePlotDataAndStats();
    setXDomain(domain);
    // Reset sliders to be within the new domain if they fall outside
    setIntervalA(prevA => Math.max(domain[0], Math.min(domain[1], prevA)));
    setIntervalB(prevB => Math.max(domain[0], Math.min(domain[1], prevB)));
  }, [selectedDist, params, calculatePlotDataAndStats]);


  useEffect(() => {
    const { domain, data: plotData, meanVal, cdfA, cdfB, integralProb } = calculatePlotDataAndStats();
    
    setCalculatedIntegralProb(integralProb);
    setCdfAValue(cdfA);
    setCdfBValue(cdfB);

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

    // Highlighted integral area
    const integralAreaData = plotData.filter(d => d.x >= intervalA && d.x <= intervalB);
    if (integralAreaData.length > 0) {
        // Ensure the area polygon is closed by adding points at intervalA and intervalB on the x-axis
        const firstPoint = { x: intervalA, y: yScale.invert(height) }; // y=0 on plot
        const lastPoint = { x: intervalB, y: yScale.invert(height) };  // y=0 on plot
        
        let integralPathData = [];
        if (xScale(intervalA) < xScale(integralAreaData[0].x)) {
             integralPathData.push({x: intervalA, y: jStat[selectedDist.value]?.pdf(intervalA, ...params) || 0 });
        }
        integralPathData.push(...integralAreaData);
        if (xScale(intervalB) > xScale(integralAreaData[integralAreaData.length - 1].x)) {
             integralPathData.push({x: intervalB, y: jStat[selectedDist.value]?.pdf(intervalB, ...params) || 0});
        }

       if (integralPathData.length > 1) {
            svg.append("path")
            .datum(integralPathData)
            .attr("fill", "rgba(250, 204, 21, 0.5)") // Yellow for integral, distinct
            .attr("stroke", "#facc15")
            .attr("stroke-width", 1)
            .attr("d", areaGenerator);
       }
    }


    if (meanVal !== undefined && xScale(meanVal) >=0 && xScale(meanVal) <= width) {
        svg.append("line").attr("x1", xScale(meanVal)).attr("x2", xScale(meanVal)).attr("y1", yScale(0)).attr("y2", yScale(maxYValue * 1.1)).attr("stroke", "#eab308").attr("stroke-width", 2).attr("stroke-dasharray", "4,4");
        svg.append("text").attr("x", xScale(meanVal) + 5).attr("y", yScale(maxYValue*1.05) + 0).attr("fill", "#eab308").style("font-size", "12px").text(`μ = ${meanVal.toFixed(2)}`);
    }

    svg.append("text").attr("x", width / 2).attr("y", -margin.top / 2 - 10).attr("text-anchor", "middle").attr("fill", "#fff").style("font-size", "18px").style("font-weight", "bold").text(`${selectedDist.label} Distribution PDF`);
    selectedDist.params.forEach((paramInfo, index) => {
        svg.append("text").attr("x", 10).attr("y", -margin.top / 2 + 15 + (index * 18)).attr("fill", "#fff").style("font-size", "12px").text(`${paramInfo.name}: ${params[index].toFixed(2)}`);
    });
    
    // Display P(a <= X <= b)
    svg.append("text")
      .attr("x", width -10)
      .attr("y", -margin.top / 2 + 15)
      .attr("text-anchor", "end")
      .attr("fill", "#fde047") // yellow-400 for visibility
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(`P(${intervalA.toFixed(1)} ≤ X ≤ ${intervalB.toFixed(1)}) = ${calculatedIntegralProb.toFixed(4)}`);


    return () => d3.select(svgRef.current).selectAll("*").remove();
  }, [selectedDist, params, intervalA, intervalB, calculatePlotDataAndStats, calculatedIntegralProb]);

  const handleDistChange = (e) => {
    const newDist = distributionOptions.find(opt => opt.value === e.target.value);
    setSelectedDist(newDist);
    setParams(newDist.params.map(p => p.default));
    // xDomain will be updated by the useEffect watching selectedDist/params
  };

  const handleParamChange = (index, value) => {
    const newParams = [...params];
    newParams[index] = parseFloat(value);
    if (selectedDist.value === "uniform") {
        if (index === 0 && newParams[0] >= newParams[1]) newParams[1] = newParams[0] + 0.1;
        else if (index === 1 && newParams[1] <= newParams[0]) newParams[0] = newParams[1] - 0.1;
    }
    if (selectedDist.value === "beta"){
        if (newParams[0] <= 0) newParams[0] = 0.1;
        if (newParams[1] <= 0) newParams[1] = 0.1;
    }
    setParams(newParams);
  };
  
  const handleIntervalAChange = (value) => {
    const valA = parseFloat(value);
    if (valA < intervalB) {
      setIntervalA(valA);
    } else {
      setIntervalA(intervalB - 0.01); // Ensure A is less than B
    }
  };

  const handleIntervalBChange = (value) => {
    const valB = parseFloat(value);
    if (valB > intervalA) {
      setIntervalB(valB);
    } else {
      setIntervalB(intervalA + 0.01); // Ensure B is greater than A
    }
  };
  
  // Enhanced MathJax processing with retry for initial render
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20;
    
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && componentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([componentRef.current]);
        }
        window.MathJax.typesetPromise([componentRef.current])
          .then(() => {})
          .catch((err) => {
            if (attempts < maxAttempts) {
              attempts++;
              setTimeout(processMathJax, 200 * Math.min(attempts, 5)); // Cap delay at 1 second
            }
          });
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(processMathJax, 200 * Math.min(attempts, 5));
      }
    };
    
    processMathJax();
  }, []); // Run once on mount

  return (
    <section ref={componentRef} id="pdf-demo" className="space-y-4 my-8 p-6 bg-neutral-800 rounded-lg shadow-xl">
      <h3 className="text-xl font-semibold text-teal-400 border-b border-neutral-700 pb-2 mb-6">
        Probability Density Functions & Integrals
      </h3>
      <div className="controls grid md:grid-cols-2 gap-6 items-start">
        <div className="space-y-2">
            <label htmlFor="dist-select" className="block text-sm font-medium text-neutral-300">Select Distribution:</label>
            <select id="dist-select" value={selectedDist.value} onChange={handleDistChange}
                className="w-full p-2 rounded bg-neutral-700 text-white border border-neutral-600 focus:ring-teal-500 focus:border-teal-500">
            {distributionOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
        </div>
        <div className="space-y-4">
            {selectedDist.params.map((paramInfo, index) => (
            <div key={paramInfo.name} className="space-y-1">
                <label htmlFor={`param-${index}`} className="block text-sm font-medium text-neutral-300">
                {paramInfo.name}: <span className="font-mono text-teal-400">{Number(params[index]).toFixed(2)}</span>
                </label>
                <input type="range" id={`param-${index}`} min={paramInfo.min} max={paramInfo.max} step={paramInfo.step} value={params[index]}
                onChange={(e) => handleParamChange(index, e.target.value)}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-teal-500"/>
            </div>
            ))}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 items-center mt-6 pt-6 border-t border-neutral-700">
        <div className="space-y-1">
            <label htmlFor="intervalA-slider" className="block text-sm font-medium text-neutral-300">
            Interval Start (a): <span className="font-mono text-yellow-400">{intervalA.toFixed(2)}</span>
            </label>
            <input type="range" id="intervalA-slider" min={xDomain[0]} max={xDomain[1]} step={(xDomain[1]-xDomain[0])/200} value={intervalA}
            onChange={(e) => handleIntervalAChange(e.target.value)}
            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"/>
        </div>
        <div className="space-y-1">
            <label htmlFor="intervalB-slider" className="block text-sm font-medium text-neutral-300">
            Interval End (b): <span className="font-mono text-yellow-400">{intervalB.toFixed(2)}</span>
            </label>
            <input type="range" id="intervalB-slider" min={xDomain[0]} max={xDomain[1]} step={(xDomain[1]-xDomain[0])/200} value={intervalB}
            onChange={(e) => handleIntervalBChange(e.target.value)}
            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"/>
        </div>
      </div>

      <div id="pdf-graph-container" className="mt-6 bg-neutral-900 p-4 rounded-md shadow-inner" style={{width:"100%",maxWidth:"800px", margin:"auto"}}>
        <svg ref={svgRef} style={{width:"100%", height:"auto", display: "block"}} />
      </div>
       <p className="text-sm text-neutral-400 mt-4 text-center">
        The <span style={{color: 'rgba(20, 184, 166, 0.7)'}}>teal area</span> is the PDF. The <span style={{color: 'rgba(250, 204, 21, 0.7)'}}>yellow area</span> highlights <span dangerouslySetInnerHTML={{ __html: `\\(P(a \\le X \\le b)\\).` }} />
      </p>
      <div className="flex justify-center">
        <IntegralWorkedExample
            distName={selectedDist.label}
            params={params}
            intervalA={intervalA}
            intervalB={intervalB}
            probValue={calculatedIntegralProb}
            pdfFormula={selectedDist.pdfTex}
            cdfAValue={cdfAValue}
            cdfBValue={cdfBValue}
        />
      </div>
    </section>
  );
}

export default memo(ContinuousDistributionsPDF);