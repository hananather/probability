// src/components/DistributionSimulation.jsx
// Combined expectation and variance simulation for a discrete distribution (die)
"use client";

import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import WorkedExample from './WorkedExample';

export default function DistributionSimulation() {
  // probabilities for faces 1–6
  const [probs, setProbs] = useState(Array(6).fill(1 / 6));
  // debounce probs for worked example to avoid flicker during drag
  const [displayProbs, setDisplayProbs] = useState(probs);
  useEffect(() => {
    const handler = setTimeout(() => setDisplayProbs(probs), 300);
    return () => clearTimeout(handler);
  }, [probs]);
  // observed counts for each face
  const [counts, setCounts] = useState(Array(6).fill(0));
  // batch roll controls
  const [sampleCount, setSampleCount] = useState(1);
  const [inputValue, setInputValue] = useState("1");

  // refs for D3-managed SVGs and data arrays
  const barSvgRef = useRef(null);
  const plotSvgRef = useRef(null);
  const expectedDataRef = useRef([]);
  const varianceDataRef = useRef([]);

  // derived true stats
  const trueExpectation = probs.reduce((sum, p, i) => sum + p * (i + 1), 0);
  const trueVariance = probs.reduce((sum, p, i) => {
    const x = i + 1;
    return sum + p * Math.pow(x - trueExpectation, 2);
  }, 0);
  const trueE2 = probs.reduce((sum, p, i) => sum + p * Math.pow(i + 1, 2), 0);

  const e1 = trueExpectation.toFixed(1);
  const e2 = trueE2.toFixed(1);
  const varVal = trueVariance.toFixed(1);
  const terms = probs.map((p, i) => `${i+1}\\cdot${p.toFixed(1)}`).join(' + ');
  const squaredTerms = probs.map((p, i) => `${(i+1)*(i+1)}\\cdot${p.toFixed(1)}`).join(' + ');
  const meanLatex = `\\mu = \\mathbb{E}[X] = \\sum_{i=1}^{6} ${terms} = ${e1}`;
  const ex2Latex = `\\mathbb{E}[X^2] = \\sum_{i=1}^{6} ${squaredTerms} = ${e2}`;
  const varLatex = `\\operatorname{Var}(X) = ${e2} - (${e1})^2 = ${varVal}`;
  const finalLatex = `\\mu = ${e1}, \\quad \\sigma^2 = ${varVal}`;

  // sample distribution stats
  const sampleTotal = counts.reduce((a, b) => a + b, 0);
  const sampleMean = sampleTotal > 0 ? counts.reduce((sum, c, i) => sum + (i + 1) * c, 0) / sampleTotal : 0;
  const sampleVariance = sampleTotal > 0 ? counts.reduce((sum, c, i) => sum + Math.pow((i + 1) - sampleMean, 2) * c, 0) / sampleTotal : 0;

  // draw bar chart: true probabilities only
  useEffect(() => {
    const svg = d3.select(barSvgRef.current);
    const { width } = barSvgRef.current.getBoundingClientRect();
    const height = 200;
    const marginBottom = 30; // space for tick labels
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height + marginBottom}`);

    // data: only true distribution
    const data = probs.map((p, i) => ({ face: i + 1, value: p }));

    const x = d3.scaleBand().domain(data.map(d => d.face)).range([0, width]).padding(0.1);
    const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);

    // axis
    const xAxisGroup = svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => d));
    xAxisGroup.selectAll("path, line").attr("stroke", "#fff");
    xAxisGroup.selectAll("text").attr("fill", "#fff");
    xAxisGroup.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("fill", "#fff")
      .style("font-size", "14px")
      .style("text-anchor", "middle")
      .text("Die Face");

    // bars with hover
    const barFill = '#14b8a6';
    const barHoverFill = '#38a169';
    svg.selectAll("rect").data(data).join("rect")
       .attr("x", d => x(d.face))
       .attr("y", d => y(d.value))
       .attr("width", x.bandwidth())
       .attr("height", d => height - y(d.value))
       .attr("fill", barFill)
       .style("cursor", "ns-resize")
       .style("transition", "fill 0.2s")
       .on("mouseover", function(event, d) { d3.select(this).transition().duration(150).attr("fill", barHoverFill); })
       .on("mouseout", function(event, d) { d3.select(this).transition().duration(150).attr("fill", barFill); })
       .call(
         d3.drag()
            .on("drag", (event, d) => {
               const newVal = Math.max(0, Math.min(1, y.invert(event.y)));
               const oldVal = probs[d.face - 1];
               const updated = probs.map((p, idx) =>
                 idx === d.face - 1 ? newVal : (oldVal === 1 ? (1 - newVal) / 5 : p * (1 - newVal) / (1 - oldVal))
               );
               setProbs(updated);
               expectedDataRef.current = [];
               varianceDataRef.current = [];
            })
       )
       .append("title")
         .text(d => `Face ${d.face}: ${(d.value * 100).toFixed(1)}%`);

    // percentage labels
    svg.selectAll("text.bar-label").data(data).join("text")
      .attr("class", "bar-label")
      .attr("x", d => x(d.face) + x.bandwidth() / 2)
      .attr("y", d => y(d.value) - 8)
      .attr("text-anchor", "middle")
      .attr("fill", '#fff')
      .text(d => `${(d.value * 100).toFixed(1)}%`);
  }, [probs]);

  // draw convergence plot for mean & variance
  useEffect(() => {
    const svg = d3.select(plotSvgRef.current);
    const { width } = plotSvgRef.current.getBoundingClientRect();
    const height = 250;
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const n = expectedDataRef.current.length || 1;
    const xScale = d3.scaleLinear().domain([1, n]).range([40, width - 20]);
    // y domain covers both series and true lines
    const maxY = d3.max([trueExpectation, trueVariance, d3.max(expectedDataRef.current) || 0, d3.max(varianceDataRef.current) || 0]);
    const yScale = d3.scaleLinear().domain([0, maxY]).range([height - 30, 10]);

    // axes
    const xAxis = svg.append('g').attr('class','x-axis').attr('transform', `translate(0,${height-30})`).call(d3.axisBottom(xScale).ticks(5));
    const yAxis = svg.append('g').attr('class','y-axis').attr('transform', `translate(40,0)`).call(d3.axisLeft(yScale).ticks(5));
    xAxis.selectAll('path, line').attr('stroke', '#fff');
    xAxis.selectAll('text').attr('fill', '#fff');
    yAxis.selectAll('path, line').attr('stroke', '#fff');
    yAxis.selectAll('text').attr('fill', '#fff');

    // true lines
    svg.append("line")
      .attr("x1", xScale(1)).attr("x2", xScale(n))
      .attr("y1", yScale(trueExpectation)).attr("y2", yScale(trueExpectation))
      .attr("stroke", "#4f46e5").attr("stroke-dasharray", "4 2")
      .append("title").text(`True Mean: ${trueExpectation.toFixed(2)}`);
    svg.append("line")
      .attr("x1", xScale(1)).attr("x2", xScale(n))
      .attr("y1", yScale(trueVariance)).attr("y2", yScale(trueVariance))
      .attr("stroke", "#14b8a6").attr("stroke-dasharray", "4 2")
      .append("title").text(`True Variance: ${trueVariance.toFixed(2)}`);

    // sample lines
    const linePlot = d3.line()
      .x((_, i) => xScale(i + 1))
      .y(d => yScale(d));
    svg.append("path").datum(expectedDataRef.current).attr("fill", "none").attr("stroke", "#4f46e5").attr("stroke-width", 2).attr("d", linePlot);
    svg.append("path").datum(varianceDataRef.current).attr("fill", "none").attr("stroke", "#14b8a6").attr("stroke-width", 2).attr("d", linePlot);

    // legend
    svg.append("circle").attr("cx", width - 100).attr("cy", 15).attr("r", 5).attr("fill", "#4f46e5");
    svg.append("text").attr("x", width - 90).attr("y", 20).text("Mean").attr("font-size", "12px").attr("fill", "#fff");
    svg.append("circle").attr("cx", width - 100).attr("cy", 35).attr("r", 5).attr("fill", "#14b8a6");
    svg.append("text").attr("x", width - 90).attr("y", 40).text("Variance").attr("font-size", "12px").attr("fill", "#fff");

    // tooltip points
    svg.selectAll('.mean-point').data(expectedDataRef.current).join('circle')
      .attr('class','mean-point').attr('cx', (_,i) => xScale(i+1)).attr('cy', d => yScale(d)).attr('r', 4).attr('fill', '#4f46e5')
      .append('title').text((d,i) => `Roll ${i+1}: mean=${d.toFixed(2)}`);
    svg.selectAll('.variance-point').data(varianceDataRef.current).join('circle')
      .attr('class','variance-point').attr('cx', (_,i) => xScale(i+1)).attr('cy', d => yScale(d)).attr('r', 4).attr('fill', '#14b8a6')
      .append('title').text((d,i) => `Roll ${i+1}: var=${d.toFixed(2)}`);
  }, [counts, probs]);

  // handle one roll
  function rollOnce() {
    const r = Math.random();
    const cum = probs.reduce((arr, p, i) => { arr.push((arr[i - 1] || 0) + p); return arr; }, []);
    const face = cum.findIndex(c => r < c);
    const updated = [...counts];
    updated[face]++;
    setCounts(updated);
    const total = updated.reduce((a, b) => a + b, 0);
    const mean = updated.reduce((a, c, i) => a + (i + 1) * c, 0) / total;
    expectedDataRef.current.push(mean);
    const variance = updated.reduce((a, c, i) => a + Math.pow((i + 1) - mean, 2) * c, 0) / total;
    varianceDataRef.current.push(variance);
  }

  // handle multiple rolls
  function rollMultiple() {
    expectedDataRef.current = [];
    varianceDataRef.current = [];
    const animate = (i = 0, current = [...counts]) => {
      if (i >= sampleCount) {
        setCounts(current);
        return;
      }
      const r = Math.random();
      const cum = probs.reduce((arr, p, idx) => { arr.push((arr[idx - 1] || 0) + p); return arr; }, []);
      const face = cum.findIndex(c => r < c);
      current[face]++;
      const total = current.reduce((a, b) => a + b, 0);
      const mean = current.reduce((a, c, idx) => a + (idx + 1) * c, 0) / total;
      expectedDataRef.current.push(mean);
      const variance = current.reduce((a, c, idx) => a + Math.pow((idx + 1) - mean, 2) * c, 0) / total;
      varianceDataRef.current.push(variance);
      setCounts([...current]);
      setTimeout(() => animate(i + 1, current), 100);
    };
    animate(0, [...counts]);
  }

  // reset all
  function handleReset() {
    setProbs(Array(6).fill(1 / 6));
    setCounts(Array(6).fill(0));
    setSampleCount(1);
    setInputValue("1");
    expectedDataRef.current = [];
    varianceDataRef.current = [];
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '700px', margin: '0 auto' }}>
      {/* controls */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Sample Size:
          <input
            type="number"
            min="1"
            max="200"
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
              const n = parseInt(e.target.value, 10);
              if (!isNaN(n)) setSampleCount(Math.min(200, Math.max(1, n)));
            }}
            style={{ marginLeft: '0.5rem', width: '60px' }}
          />
        </label>
        <button onClick={rollOnce} style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>Roll once</button>
        <button onClick={rollMultiple} style={{ backgroundColor: '#14b8a6', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>Roll {sampleCount} times</button>
        <button onClick={handleReset} style={{ backgroundColor: '#e53e3e', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>Reset</button>
      </div>
      {/* stats summary */}
      <div style={{ display: 'flex', justifyContent: 'space-around', gap: '1rem', margin: '1rem 0', color: '#fff', width: '100%', maxWidth: '500px' }}>
        <div><strong>Rolls:</strong> {sampleTotal}</div>
        <div><strong>Sample Mean:</strong> {sampleMean.toFixed(2)}</div>
        <div><strong>Sample Variance:</strong> {sampleVariance.toFixed(2)}</div>
        <div><strong>True Mean:</strong> {trueExpectation.toFixed(2)}</div>
        <div><strong>True Variance:</strong> {trueVariance.toFixed(2)}</div>
      </div>
      {/* bar chart */}
      <svg ref={barSvgRef} style={{ width: "500px", height: "230px" }} />
      {/* convergence plot */}
      <svg ref={plotSvgRef} style={{ width: "500px", height: "250px", marginTop: "1rem" }} />
      {/* worked example (debounced) */}
      <WorkedExample probs={displayProbs} />
    </div>
  );
}
