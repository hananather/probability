"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { Button } from '../ui/button';
import { RangeSlider } from '../ui/RangeSlider';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';

const colorScheme = createColorScheme('hypothesis');

export default function HypothesisTestingFundamentals() {
  // Ref for MathJax processing
  const contentRef = useRef(null);
  
  // Part A: Small Sample State
  const [smallSampleFlips, setSmallSampleFlips] = useState([]);
  const [isFlippingSmall, setIsFlippingSmall] = useState(false);
  const [currentFlipSmall, setCurrentFlipSmall] = useState(null);
  
  // Part B: Large Sample State
  const [largeSampleFlips, setLargeSampleFlips] = useState([]);
  const [isFlippingLarge, setIsFlippingLarge] = useState(false);
  const [hasRunLargeSample, setHasRunLargeSample] = useState(false);
  
  // Part C: p-value Explorer State
  const [explorerHeads, setExplorerHeads] = useState(50);
  const [showPValueExplorer, setShowPValueExplorer] = useState(false);
  
  // MathJax processing
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [smallSampleFlips, largeSampleFlips, explorerHeads]);
  
  // Learning progression
  const [revealedSections, setRevealedSections] = useState({
    partA: true,
    partB: false,
    partC: false,
    mathExplanation: false
  });
  
  // Refs for D3 visualizations
  const smallDistRef = useRef(null);
  const largeDistRef = useRef(null);
  const pValueRef = useRef(null);
  
  // Calculate binomial probability
  const binomialProbability = (n, k, p) => {
    const nCk = factorial(n) / (factorial(k) * factorial(n - k));
    return nCk * Math.pow(p, k) * Math.pow(1 - p, n - k);
  };
  
  const factorial = (n) => {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  };
  
  // Calculate p-value for one-sided test (H1: p < 0.5)
  const calculatePValue = (n, k) => {
    let pValue = 0;
    for (let i = 0; i <= k; i++) {
      pValue += binomialProbability(n, i, 0.5);
    }
    return pValue;
  };
  
  // Normal approximation for large samples
  const normalApproximation = (x, mean, sd) => {
    const z = (x - mean) / sd;
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) / sd;
  };
  
  // Flip a single coin for small sample
  const flipSmallSample = async () => {
    if (isFlippingSmall || smallSampleFlips.length >= 10) return;
    
    setIsFlippingSmall(true);
    setCurrentFlipSmall('flipping');
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const result = Math.random() < 0.5 ? 1 : 0;
    setCurrentFlipSmall(result);
    
    const newFlips = [...smallSampleFlips, result];
    setSmallSampleFlips(newFlips);
    
    if (newFlips.length === 10) {
      setRevealedSections(prev => ({ ...prev, partB: true, mathExplanation: true }));
    }
    
    setTimeout(() => {
      setCurrentFlipSmall(null);
      setIsFlippingSmall(false);
    }, 800);
  };
  
  // Auto-flip remaining coins for small sample
  const autoFlipSmall = async () => {
    if (isFlippingSmall) return;
    
    setIsFlippingSmall(true);
    const remaining = 10 - smallSampleFlips.length;
    const newFlips = [...smallSampleFlips];
    
    for (let i = 0; i < remaining; i++) {
      setCurrentFlipSmall('flipping');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const result = Math.random() < 0.5 ? 1 : 0;
      setCurrentFlipSmall(result);
      newFlips.push(result);
      setSmallSampleFlips([...newFlips]);
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setCurrentFlipSmall(null);
    setIsFlippingSmall(false);
    setRevealedSections(prev => ({ ...prev, partB: true, mathExplanation: true }));
  };
  
  // Run large sample simulation
  const runLargeSample = async () => {
    if (isFlippingLarge) return;
    
    setIsFlippingLarge(true);
    setLargeSampleFlips([]);
    
    // Simulate 100 flips with animation
    const flips = [];
    for (let i = 0; i < 100; i++) {
      flips.push(Math.random() < 0.5 ? 1 : 0);
    }
    
    // Animate the results gradually
    for (let i = 0; i <= 100; i += 5) {
      setLargeSampleFlips(flips.slice(0, i));
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    setLargeSampleFlips(flips);
    setIsFlippingLarge(false);
    setHasRunLargeSample(true);
    setRevealedSections(prev => ({ ...prev, partC: true }));
    setShowPValueExplorer(true);
  };
  
  // Reset the entire component
  const reset = () => {
    setSmallSampleFlips([]);
    setLargeSampleFlips([]);
    setCurrentFlipSmall(null);
    setIsFlippingSmall(false);
    setIsFlippingLarge(false);
    setHasRunLargeSample(false);
    setExplorerHeads(50);
    setShowPValueExplorer(false);
    setRevealedSections({
      partA: true,
      partB: false,
      partC: false,
      mathExplanation: false
    });
  };
  
  // Calculate statistics
  const smallStats = {
    n: smallSampleFlips.length,
    heads: smallSampleFlips.filter(f => f === 1).length,
    proportion: smallSampleFlips.length > 0 ? smallSampleFlips.filter(f => f === 1).length / smallSampleFlips.length : 0.5,
    pValue: smallSampleFlips.length > 0 ? calculatePValue(smallSampleFlips.length, smallSampleFlips.filter(f => f === 1).length) : 1
  };
  
  const largeStats = {
    n: largeSampleFlips.length,
    heads: largeSampleFlips.filter(f => f === 1).length,
    proportion: largeSampleFlips.length > 0 ? largeSampleFlips.filter(f => f === 1).length / largeSampleFlips.length : 0.5,
    pValue: largeSampleFlips.length > 0 ? calculatePValue(largeSampleFlips.length, largeSampleFlips.filter(f => f === 1).length) : 1
  };
  
  // Update small sample distribution
  useEffect(() => {
    if (!smallDistRef.current) return;
    
    const svg = d3.select(smallDistRef.current);
    svg.selectAll("*").remove();
    
    const width = 800;
    const height = 400;
    const margin = { top: 30, right: 40, bottom: 70, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Calculate binomial distribution for n=10, p=0.5
    const data = [];
    for (let k = 0; k <= 10; k++) {
      data.push({
        k: k,
        probability: binomialProbability(10, k, 0.5)
      });
    }
    
    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.k))
      .range([0, innerWidth])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.probability) * 1.1])
      .range([innerHeight, 0]);
    
    // Draw bars with improved colors
    const bars = g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.k))
      .attr("y", innerHeight)
      .attr("width", xScale.bandwidth())
      .attr("height", 0)
      .attr("rx", 3)
      .attr("fill", d => {
        if (smallSampleFlips.length === 10 && d.k === smallStats.heads) {
          return "#10b981"; // Green for observed
        }
        return d.k <= smallStats.heads ? "#10b981" : "#6b7280";
      })
      .attr("opacity", d => {
        if (smallSampleFlips.length === 10 && d.k === smallStats.heads) {
          return 1;
        }
        return d.k <= smallStats.heads ? 0.6 : 0.3;
      });
    
    // Animate bars
    bars.transition()
      .duration(500)
      .delay((d, i) => i * 50)
      .attr("y", d => yScale(d.probability))
      .attr("height", d => innerHeight - yScale(d.probability));
    
    // Add probability labels
    g.selectAll(".prob-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "prob-label")
      .attr("x", d => xScale(d.k) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.probability) - 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("opacity", 0)
      .text(d => (d.probability * 100).toFixed(1) + "%")
      .transition()
      .duration(500)
      .delay((d, i) => i * 50 + 200)
      .attr("opacity", 1);
    
    // Add expected value line
    const expectedValue = 5;
    g.append("line")
      .attr("x1", xScale(expectedValue) + xScale.bandwidth() / 2)
      .attr("x2", xScale(expectedValue) + xScale.bandwidth() / 2)
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#eab308")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .delay(600)
      .attr("opacity", 1);
    
    // Add expected value label with LaTeX
    const expectedLabel = g.append("foreignObject")
      .attr("x", xScale(expectedValue) + xScale.bandwidth() / 2 - 30)
      .attr("y", -20)
      .attr("width", 60)
      .attr("height", 20);
    
    expectedLabel.append("xhtml:div")
      .style("text-align", "center")
      .style("color", "#eab308")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .html(`<span>\\(E[X] = 5\\)</span>`);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr("color", "#9ca3af")
      .style("font-size", "14px");
    
    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => (d * 100).toFixed(0) + "%"))
      .attr("color", "#9ca3af")
      .style("font-size", "14px");
    
    // Labels
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 50})`)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .text("Number of Heads");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .text("Probability");
    
    // Add p-value annotation with animation
    if (smallSampleFlips.length === 10) {
      // Shade p-value region
      g.selectAll(".p-value-bar")
        .data(data.filter(d => d.k <= smallStats.heads))
        .enter()
        .append("rect")
        .attr("class", "p-value-bar")
        .attr("x", d => xScale(d.k))
        .attr("y", 0)
        .attr("width", xScale.bandwidth())
        .attr("height", innerHeight)
        .attr("fill", "#10b981")
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(800)
        .attr("opacity", 0.1);
      
      const pValueText = g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", "#10b981")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .attr("opacity", 0)
        .text(`p-value = ${(smallStats.pValue * 100).toFixed(1)}%`)
        .transition()
        .duration(500)
        .delay(1000)
        .attr("opacity", 1);
    }
    
  }, [smallSampleFlips]);
  
  // Update large sample distribution
  useEffect(() => {
    if (!largeDistRef.current || largeSampleFlips.length === 0) return;
    
    const svg = d3.select(largeDistRef.current);
    svg.selectAll("*").remove();
    
    const width = 800;
    const height = 400;
    const margin = { top: 30, right: 40, bottom: 70, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Calculate binomial distribution for n=100, p=0.5
    const data = [];
    for (let k = 30; k <= 70; k++) {
      data.push({
        k: k,
        probability: binomialProbability(100, k, 0.5)
      });
    }
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([30, 70])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.probability) * 1.1])
      .range([innerHeight, 0]);
    
    // Draw bars
    const barWidth = innerWidth / data.length;
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.k) - barWidth/2)
      .attr("y", d => yScale(d.probability))
      .attr("width", barWidth)
      .attr("height", d => innerHeight - yScale(d.probability))
      .attr("fill", d => {
        if (d.k === largeStats.heads) {
          return "#10b981";
        }
        return d.k <= largeStats.heads ? "#10b981" : "#6b7280";
      })
      .attr("opacity", d => {
        if (d.k === largeStats.heads) {
          return 1;
        }
        return d.k <= largeStats.heads ? 0.6 : 0.3;
      });
    
    // Add normal approximation curve
    const mean = 50;
    const sd = Math.sqrt(25); // sqrt(n*p*(1-p))
    
    const curveData = [];
    for (let x = 30; x <= 70; x += 0.5) {
      curveData.push({
        x: x,
        y: normalApproximation(x, mean, sd)
      });
    }
    
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);
    
    g.append("path")
      .datum(curveData)
      .attr("fill", "none")
      .attr("stroke", "#eab308")
      .attr("stroke-width", 3)
      .attr("d", line)
      .attr("opacity", 0.8);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr("color", "#9ca3af")
      .style("font-size", "14px");
    
    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => (d * 100).toFixed(1) + "%"))
      .attr("color", "#9ca3af")
      .style("font-size", "14px");
    
    // Labels
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 50})`)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .text("Number of Heads");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .text("Probability");
    
    // Add p-value annotation
    const pValueText = g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#10b981")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text(`p-value = ${(largeStats.pValue * 100).toFixed(1)}%`);
    
  }, [largeSampleFlips]);
  
  // Update p-value explorer
  useEffect(() => {
    if (!pValueRef.current || !showPValueExplorer) return;
    
    const svg = d3.select(pValueRef.current);
    svg.selectAll("*").remove();
    
    const width = 800;
    const height = 400;
    const margin = { top: 30, right: 40, bottom: 70, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Calculate binomial distribution
    const data = [];
    for (let k = 30; k <= 70; k++) {
      data.push({
        k: k,
        probability: binomialProbability(100, k, 0.5)
      });
    }
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([30, 70])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.probability) * 1.1])
      .range([innerHeight, 0]);
    
    // Draw bars
    const barWidth = innerWidth / data.length;
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.k) - barWidth/2)
      .attr("y", d => yScale(d.probability))
      .attr("width", barWidth)
      .attr("height", d => innerHeight - yScale(d.probability))
      .attr("fill", d => d.k <= explorerHeads ? "#10b981" : "#6b7280")
      .attr("opacity", d => d.k <= explorerHeads ? 0.8 : 0.3);
    
    // Add normal curve
    const mean = 50;
    const sd = Math.sqrt(25);
    
    const curveData = [];
    for (let x = 30; x <= 70; x += 0.5) {
      curveData.push({
        x: x,
        y: normalApproximation(x, mean, sd)
      });
    }
    
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);
    
    g.append("path")
      .datum(curveData)
      .attr("fill", "none")
      .attr("stroke", "#eab308")
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Shade p-value area
    const areaData = curveData.filter(d => d.x <= explorerHeads);
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(innerHeight)
      .y1(d => yScale(d.y))
      .curve(d3.curveMonotoneX);
    
    g.append("path")
      .datum(areaData)
      .attr("fill", "#10b981")
      .attr("opacity", 0.2)
      .attr("d", area);
    
    // Vertical line at observed value
    g.append("line")
      .attr("x1", xScale(explorerHeads))
      .attr("x2", xScale(explorerHeads))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "4,4");
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr("color", "#9ca3af")
      .style("font-size", "14px");
    
    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => (d * 100).toFixed(1) + "%"))
      .attr("color", "#9ca3af")
      .style("font-size", "14px");
    
    // Labels
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 50})`)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .text("Number of Heads");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .text("Probability");
    
    // p-value label
    const pValue = calculatePValue(100, explorerHeads);
    g.append("text")
      .attr("x", xScale(explorerHeads))
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#ef4444")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text(`p-value = ${(pValue * 100).toFixed(1)}%`);
    
  }, [explorerHeads, showPValueExplorer]);
  
  return (
    <VisualizationContainer
      title="Hypothesis Testing Fundamentals"
      description="Explore how sample size affects evidence strength in hypothesis testing"
    >
      <div ref={contentRef} className="space-y-8">
        {/* Introduction */}
        <VisualizationSection>
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-white">The Coin Fairness Test</h3>
            <p className="text-gray-300 max-w-3xl mx-auto text-sm">
              Person A claims they have a fair coin (50% heads), but Person B is suspicious that 
              it's biased against heads. How can we use data to evaluate this claim scientifically?
            </p>
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-6 max-w-2xl mx-auto border border-gray-700">
              <div className="space-y-3">
                <p className="text-sm font-bold text-blue-400">Hypotheses:</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">
                    <span className="font-mono text-white bg-gray-700 px-2 py-1 rounded" dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />
                    <span className="ml-2">The coin is fair (<span dangerouslySetInnerHTML={{ __html: `\\(p = 0.5\\)` }} />)</span>
                  </p>
                  <p className="text-sm text-gray-300">
                    <span className="font-mono text-white bg-gray-700 px-2 py-1 rounded" dangerouslySetInnerHTML={{ __html: `\\(H_1\\)` }} />
                    <span className="ml-2">The coin is biased against heads (<span dangerouslySetInnerHTML={{ __html: `\\(p < 0.5\\)` }} />)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </VisualizationSection>
        
        {/* Part A: Small Sample */}
        <VisualizationSection
          title="Part A: Small Sample Experiment (n = 10)"
          className={cn(
            "transition-all duration-500",
            revealedSections.partA ? "opacity-100" : "opacity-50"
          )}
        >
          <div className="space-y-6">
            {/* Controls and Statistics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coin Flip Controls */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h4 className="text-base font-bold text-gray-200 mb-4">Flip the Coin</h4>
                  
                  {/* Coin visualization */}
                  <div className="flex justify-center mb-6">
                    <div 
                      className={cn(
                        "w-32 h-32 rounded-full flex items-center justify-center",
                        "text-5xl font-bold transition-colors duration-300",
                        "shadow-2xl border-4",
                        currentFlipSmall === 'flipping' && "animate-spin",
                        currentFlipSmall === 1 ? "bg-gradient-to-br from-green-400 to-green-600 text-white border-green-700 animate-flash" : 
                        currentFlipSmall === 0 ? "bg-gradient-to-br from-gray-400 to-gray-600 text-white border-gray-700 animate-flash" : 
                        "bg-gradient-to-br from-gray-600 to-gray-700 text-gray-400 border-gray-600 cursor-pointer"
                      )}
                      style={{ 
                        width: '128px', 
                        height: '128px',
                        minWidth: '128px',
                        minHeight: '128px',
                        maxWidth: '128px',
                        maxHeight: '128px',
                        transform: 'scale(1)'
                      }}
                    >
                      {currentFlipSmall === 'flipping' ? '?' : 
                       currentFlipSmall === 1 ? 'H' : 
                       currentFlipSmall === 0 ? 'T' : '?'}
                    </div>
                  </div>
                  
                  {/* Flip buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={flipSmallSample}
                      disabled={isFlippingSmall || smallSampleFlips.length >= 10}
                      size="lg"
                      className={cn(
                        "flex-1 bg-gradient-to-r from-green-500 to-green-600",
                        "hover:from-green-600 hover:to-green-700",
                        "disabled:from-gray-600 disabled:to-gray-700",
                        "text-white font-bold shadow-lg",
                        "transform transition-all duration-200 hover:scale-105"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Flip Once
                      </span>
                    </Button>
                    <Button
                      onClick={autoFlipSmall}
                      disabled={isFlippingSmall || smallSampleFlips.length >= 10}
                      size="lg"
                      variant="secondary"
                      className={cn(
                        "flex-1",
                        "transform transition-all duration-200 hover:scale-105"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                        Complete All 10
                      </span>
                    </Button>
                  </div>
                  
                  {/* Progress */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Flips: {smallSampleFlips.length}/10</span>
                      <span>Heads: {smallStats.heads} ({(smallStats.proportion * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(smallSampleFlips.length / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Flip history */}
                  {smallSampleFlips.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm text-gray-400 mb-3">Results:</p>
                      <div className="flex gap-2 flex-wrap">
                        {smallSampleFlips.map((flip, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              "text-sm font-bold transition-all duration-200",
                              flip === 1 ? "bg-green-500/20 text-green-400 border border-green-500/30" : 
                                          "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                            )}
                          >
                            {flip === 1 ? 'H' : 'T'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Statistics */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h4 className="text-base font-bold text-gray-200 mb-4">Live Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Sample Size:</span>
                      <span className="font-mono text-white text-base">{smallStats.n}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Heads Count:</span>
                      <span className="font-mono text-white text-base">{smallStats.heads}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Proportion:</span>
                      <span className="font-mono text-white text-base">{(smallStats.proportion * 100).toFixed(1)}%</span>
                    </div>
                    {smallSampleFlips.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-gray-700">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">p-value:</span>
                          <span className="font-mono text-lg font-bold text-green-400">
                            {(smallStats.pValue * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {smallSampleFlips.length === 10 && (
                  <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border border-yellow-700/30 rounded-xl p-4">
                    <p className="text-sm text-yellow-300">
                      <span className="font-bold">Initial Result:</span> With {smallStats.heads} heads in 10 flips, 
                      the p-value is {(smallStats.pValue * 100).toFixed(1)}%. 
                      {smallStats.pValue > 0.05 ? 
                        " This is not strong evidence against the fair coin hypothesis." :
                        " This suggests some evidence against the fair coin hypothesis."}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Full-width Distribution Chart */}
            <GraphContainer height={450}>
              <svg ref={smallDistRef} className="w-full h-full" />
            </GraphContainer>
            
            {/* Mathematical Explanation */}
            {revealedSections.mathExplanation && smallSampleFlips.length === 10 && (
              <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/30 rounded-xl p-6 space-y-4">
                <h4 className="text-base font-bold text-blue-300 mb-4">Understanding the p-value Calculation</h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-blue-400">Step 1:</span> We use the binomial distribution 
                      because coin flips are independent Bernoulli trials.
                    </p>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="font-mono text-sm text-white" dangerouslySetInnerHTML={{ __html: `\\[P(X = k) = \\binom{n}{k} \\times p^k \\times (1-p)^{n-k}\\]` }} />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-blue-400">Step 2:</span> Under <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> (fair coin), <span dangerouslySetInnerHTML={{ __html: `\\(p = 0.5\\)` }} />
                    </p>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="font-mono text-sm text-white" dangerouslySetInnerHTML={{ __html: `\\[P(X = ${smallStats.heads} | H_0) = \\binom{10}{${smallStats.heads}} \\times 0.5^{10}\\]` }} />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-blue-400">Step 3:</span> The p-value is the probability 
                    of observing {smallStats.heads} or fewer heads if <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> is true:
                  </p>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="font-mono text-sm text-white mb-2" dangerouslySetInnerHTML={{ __html: `\\[\\text{p-value} = P(X \\leq ${smallStats.heads} | H_0) = \\sum_{i=0}^{${smallStats.heads}} P(X = i)\\]` }} />
                    <p className="font-mono text-xs text-gray-400">
                      = {Array.from({length: smallStats.heads + 1}, (_, i) => 
                        `P(X=${i})`
                      ).join(' + ')}
                    </p>
                    <p className="font-mono text-sm text-green-400 mt-2">
                      = {(smallStats.pValue * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </VisualizationSection>
        
        {/* Part B: Large Sample */}
        {revealedSections.partB && (
          <VisualizationSection
            title="Part B: Large Sample Experiment (n = 100)"
            className="animate-fadeIn"
          >
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-300 mb-6 text-sm">
                  What if we flip the same coin 100 times and get the same proportion of heads?
                </p>
                <Button
                  onClick={runLargeSample}
                  disabled={isFlippingLarge || hasRunLargeSample}
                  size="lg"
                  className={cn(
                    "bg-gradient-to-r from-blue-500 to-blue-600",
                    "hover:from-blue-600 hover:to-blue-700",
                    "disabled:from-gray-600 disabled:to-gray-700",
                    "text-white font-bold shadow-lg px-8 py-4",
                    "transform transition-all duration-200 hover:scale-105"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    {isFlippingLarge ? "Running Simulation..." : "Run 100 Flips"}
                  </span>
                </Button>
              </div>
              
              {largeSampleFlips.length > 0 && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Statistics */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700">
                        <h4 className="text-base font-bold text-gray-200 mb-4">Results</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Sample Size:</span>
                            <span className="font-mono text-white text-base">{largeStats.n}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Heads Count:</span>
                            <span className="font-mono text-white text-base">{largeStats.heads}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Proportion:</span>
                            <span className="font-mono text-white text-base">{(largeStats.proportion * 100).toFixed(1)}%</span>
                          </div>
                          <div className="pt-3 mt-3 border-t border-gray-700">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">p-value:</span>
                              <span className="font-mono text-lg font-bold text-green-400">
                                {(largeStats.pValue * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Comparison */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-xl p-6 border border-purple-700/30">
                        <h4 className="text-base font-bold text-purple-300 mb-4">Sample Size Effect</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Small sample (n=10):</span>
                            <span className="font-mono text-white">p = {(smallStats.pValue * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Large sample (n=100):</span>
                            <span className="font-mono text-white font-bold text-base">p = {(largeStats.pValue * 100).toFixed(1)}%</span>
                          </div>
                          <div className="pt-3 mt-3 border-t border-purple-700/30">
                            <p className="text-sm text-purple-200">
                              The same proportion ({(largeStats.proportion * 100).toFixed(0)}%) gives very different p-values!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Full-width chart */}
                  <GraphContainer height={450}>
                    <svg ref={largeDistRef} className="w-full h-full" />
                  </GraphContainer>
                  
                  {/* Key Insight */}
                  <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/30 rounded-xl p-6">
                    <p className="text-sm text-blue-300">
                      <span className="font-bold text-blue-400">Key Insight:</span> The same proportion of heads 
                      ({(largeStats.proportion * 100).toFixed(0)}%) gives very different p-values depending on sample size! 
                      With more data, we have stronger evidence to detect deviations from the null hypothesis.
                    </p>
                  </div>
                </>
              )}
            </div>
          </VisualizationSection>
        )}
        
        {/* Part C: p-value Explorer */}
        {revealedSections.partC && showPValueExplorer && (
          <VisualizationSection
            title="Part C: Interactive p-value Explorer"
            className="animate-fadeIn"
          >
            <div className="space-y-6">
              <p className="text-gray-300 text-center text-sm">
                Explore how the p-value changes as you observe different numbers of heads in 100 flips
              </p>
              
              <GraphContainer height={500}>
                <div className="px-8 pt-6">
                  <ControlGroup label="Number of Heads (out of 100)">
                    <RangeSlider
                      value={explorerHeads}
                      onChange={setExplorerHeads}
                      min={30}
                      max={70}
                      step={1}
                      className="accent-red-500"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                      <span>30</span>
                      <span className="font-mono text-white text-base">{explorerHeads}</span>
                      <span>70</span>
                    </div>
                  </ControlGroup>
                </div>
                <svg ref={pValueRef} className="w-full h-full" />
              </GraphContainer>
              
              {/* p-value interpretation */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700">
                <h4 className="text-base font-bold text-gray-200 mb-4">Interpretation</h4>
                <div className="space-y-3">
                  <p className="text-sm text-gray-300">
                    With {explorerHeads} heads in 100 flips:
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-400">p-value = </span>
                    <span className="font-mono text-lg text-white font-bold">
                      {(calculatePValue(100, explorerHeads) * 100).toFixed(2)}%
                    </span>
                  </p>
                  <p className="text-sm font-semibold">
                    <span className={cn(
                      calculatePValue(100, explorerHeads) < 0.001 ? "text-red-400" :
                      calculatePValue(100, explorerHeads) < 0.01 ? "text-orange-400" :
                      calculatePValue(100, explorerHeads) < 0.05 ? "text-yellow-400" :
                      calculatePValue(100, explorerHeads) < 0.10 ? "text-blue-400" :
                      "text-gray-400"
                    )}>
                      {calculatePValue(100, explorerHeads) < 0.001 ? "Extremely strong" :
                       calculatePValue(100, explorerHeads) < 0.01 ? "Very strong" :
                       calculatePValue(100, explorerHeads) < 0.05 ? "Strong" :
                       calculatePValue(100, explorerHeads) < 0.10 ? "Moderate" :
                       "Weak"} evidence against the null hypothesis
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </VisualizationSection>
        )}
        
        {/* Summary */}
        {revealedSections.partC && (
          <VisualizationSection className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-700/30">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-purple-300">Key Takeaways</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <span className="text-purple-400 text-lg">1.</span>
                  <p className="text-sm text-gray-300">
                    The p-value measures how likely we'd see our data (or more extreme) if <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> were true
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="text-purple-400 text-lg">2.</span>
                  <p className="text-sm text-gray-300">
                    Sample size dramatically affects our ability to detect deviations from <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="text-purple-400 text-lg">3.</span>
                  <p className="text-sm text-gray-300">
                    Small p-values provide evidence against <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />, but don't prove <span dangerouslySetInnerHTML={{ __html: `\\(H_1\\)` }} /> is true
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="text-purple-400 text-lg">4.</span>
                  <p className="text-sm text-gray-300">
                    Failing to reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> doesn't mean <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> is true - we might just lack sufficient data
                  </p>
                </div>
              </div>
            </div>
          </VisualizationSection>
        )}
        
        {/* Reset button */}
        <div className="flex justify-center">
          <Button 
            onClick={reset} 
            variant="outline"
            size="lg"
            className="border-gray-600 hover:border-gray-500"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Start Over
            </span>
          </Button>
        </div>
      </div>
    </VisualizationContainer>
  );
}