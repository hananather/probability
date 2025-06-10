"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { RangeSlider } from '../ui/RangeSlider';
import { RotateCcw } from "lucide-react";
import * as jStat from "jstat";

const ContinuousExpectationVariance = () => {
  const colorScheme = createColorScheme('probability');
  const discreteSvgRef = useRef(null);
  const continuousSvgRef = useRef(null);
  const transitionSvgRef = useRef(null);
  
  // Stage control (1-4)
  const [stage, setStage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Distribution parameters
  const [distributionType, setDistributionType] = useState('uniform'); // uniform, exponential, normal
  const [param1, setParam1] = useState(2); // a for uniform, λ for exponential, μ for normal
  const [param2, setParam2] = useState(8); // b for uniform, unused for exponential, σ for normal
  
  // Track refs for D3 cleanup
  const d3Refs = useRef({ 
    transitions: [],
    timers: [] 
  });
  
  // Riemann sum parameters
  const [numRectangles, setNumRectangles] = useState(5);
  const [showRiemannSum, setShowRiemannSum] = useState(true);
  
  // Interaction tracking
  const [interactionCount, setInteractionCount] = useState(0);
  
  // Calculate true expectation and variance based on distribution
  const getTrueValues = useCallback(() => {
    // Validate parameters first
    if (distributionType === 'uniform' && param1 >= param2) {
      return { expectation: 0, variance: 0 };
    }
    if (distributionType === 'exponential' && param1 <= 0) {
      return { expectation: 0, variance: 0 };
    }
    if (distributionType === 'normal' && param2 <= 0) {
      return { expectation: param1, variance: 0 };
    }
    
    switch(distributionType) {
      case 'uniform':
        const a = param1;
        const b = param2;
        const expectation = (a + b) / 2;
        const variance = Math.pow(b - a, 2) / 12;
        return { expectation, variance };
      
      case 'exponential':
        const lambda = param1;
        return { expectation: 1/lambda, variance: 1/Math.pow(lambda, 2) };
      
      case 'normal':
        return { expectation: param1, variance: Math.pow(param2, 2) };
      
      default:
        return { expectation: 0, variance: 0 };
    }
  }, [distributionType, param1, param2]);
  
  const { expectation: trueExpectation, variance: trueVariance } = useMemo(() => getTrueValues(), [getTrueValues]);
  
  // PDF functions
  const getPDF = (x) => {
    switch(distributionType) {
      case 'uniform':
        return (x >= param1 && x <= param2) ? 1/(param2 - param1) : 0;
      
      case 'exponential':
        return x >= 0 ? param1 * Math.exp(-param1 * x) : 0;
      
      case 'normal':
        return jStat.normal.pdf(x, param1, param2);
      
      default:
        return 0;
    }
  };
  
  // Get appropriate x-domain for visualization
  const getXDomain = () => {
    switch(distributionType) {
      case 'uniform':
        return [param1 - 1, param2 + 1];
      
      case 'exponential':
        return [0, Math.max(5/param1, 10)];
      
      case 'normal':
        return [param1 - 4*param2, param1 + 4*param2];
      
      default:
        return [0, 10];
    }
  };
  
  // Reset function
  const handleReset = () => {
    setStage(1);
    setDistributionType('uniform');
    setParam1(2);
    setParam2(8);
    setNumRectangles(5);
    setShowRiemannSum(true);
    setInteractionCount(0);
    setIsAnimating(false);
  };
  
  // Stage progression
  const handleNextStage = () => {
    if (stage < 4) {
      setStage(stage + 1);
      setInteractionCount(prev => prev + 1);
    }
  };
  
  // Draw discrete visualization (Stage 1)
  useEffect(() => {
    if (!discreteSvgRef.current || stage !== 1) return;
    
    const svg = d3.select(discreteSvgRef.current);
    const { width } = discreteSvgRef.current.getBoundingClientRect();
    const height = 280;
    const margin = { top: 20, right: 30, bottom: 60, left: 50 };
    
    // Clean up any existing content and transitions
    svg.selectAll("*").interrupt().remove();
    d3Refs.current.transitions.forEach(t => t.interrupt());
    d3Refs.current.transitions = [];
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // Example: 6-sided die
    const data = Array(6).fill(0).map((_, i) => ({
      x: i + 1,
      p: 1/6
    }));
    
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.x))
      .range([margin.left, width - margin.right])
      .padding(0.2);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.3])
      .range([height - margin.bottom, margin.top]);
    
    // Grid
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);
    
    // Axes
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text").attr("fill", colors.chart.text);
    
    const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => d.toFixed(2)));
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text").attr("fill", colors.chart.text);
    
    // Bars
    svg.selectAll("rect.bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.x))
      .attr("y", d => yScale(d.p))
      .attr("width", xScale.bandwidth())
      .attr("height", d => yScale(0) - yScale(d.p))
      .attr("fill", colorScheme.chart.primary)
      .attr("opacity", 0.8)
      .attr("rx", 4);
    
    // Labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .attr("font-size", "12px")
      .text("x");
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .attr("font-size", "12px")
      .text("P(X = x)");
    
    // Formula
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top + 20)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.primaryLight)
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .text("E[X] = Σ x · P(X = x) = 3.5");
    
    return () => {
      // Cleanup on unmount
      svg.selectAll("*").interrupt().remove();
    };
  }, [stage, colorScheme]);
  
  // Draw continuous visualization (Stage 2-4)
  useEffect(() => {
    if (!continuousSvgRef.current || stage === 1) return;
    
    const svg = d3.select(continuousSvgRef.current);
    const { width } = continuousSvgRef.current.getBoundingClientRect();
    const height = 280;
    const margin = { top: 20, right: 30, bottom: 60, left: 50 };
    
    // Clean up any existing content and transitions
    svg.selectAll("*").interrupt().remove();
    d3Refs.current.transitions.forEach(t => t.interrupt());
    d3Refs.current.transitions = [];
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const [xMin, xMax] = getXDomain();
    
    const xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([margin.left, width - margin.right]);
    
    const yMax = distributionType === 'uniform' ? 1/(param2 - param1) * 1.2 : 
                 distributionType === 'exponential' ? param1 * 1.2 :
                 0.45;
    
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([height - margin.bottom, margin.top]);
    
    // Grid
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);
    
    // Generate PDF data
    const step = (xMax - xMin) / 200;
    const pdfData = d3.range(xMin, xMax, step).map(x => ({
      x: x,
      y: getPDF(x)
    }));
    
    // Line generator
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Draw PDF
    svg.append("path")
      .datum(pdfData)
      .attr("d", line)
      .attr("stroke", colorScheme.chart.primaryLight)
      .attr("stroke-width", 2)
      .attr("fill", "none");
    
    // Riemann sum visualization (Stage 2)
    if (stage === 2 && showRiemannSum) {
      const rectWidth = (xMax - xMin) / numRectangles;
      
      for (let i = 0; i < numRectangles; i++) {
        const x = xMin + i * rectWidth;
        const midX = x + rectWidth / 2;
        const height = getPDF(midX);
        
        // Rectangle
        svg.append("rect")
          .attr("x", xScale(x))
          .attr("y", yScale(height))
          .attr("width", xScale(x + rectWidth) - xScale(x))
          .attr("height", yScale(0) - yScale(height))
          .attr("fill", colorScheme.chart.secondary)
          .attr("opacity", 0.3)
          .attr("stroke", colorScheme.chart.secondaryLight)
          .attr("stroke-width", 1);
        
        // Show x·f(x) contribution
        if (numRectangles <= 10) {
          svg.append("text")
            .attr("x", xScale(midX))
            .attr("y", yScale(height) - 5)
            .attr("text-anchor", "middle")
            .attr("fill", colorScheme.chart.text)
            .attr("font-size", "10px")
            .attr("opacity", 0.8)
            .text(`${formatNumber(midX * height * rectWidth)}`);
        }
      }
      
      // Show approximation with proper Riemann sum calculation
      let approxExpectation = 0;
      for (let i = 0; i < numRectangles; i++) {
        const x = xMin + (i + 0.5) * rectWidth;
        const pdfValue = getPDF(x);
        if (isFinite(pdfValue)) {
          approxExpectation += x * pdfValue * rectWidth;
        }
      }
      
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 5)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.secondary)
        .attr("font-size", "12px")
        .text(`Riemann Sum ≈ ${formatNumber(approxExpectation)}`);
    }
    
    // Area shading for Stage 3-4
    if (stage >= 3) {
      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(yScale(0))
        .y1(d => yScale(d.y))
        .curve(d3.curveBasis);
      
      svg.append("path")
        .datum(pdfData)
        .attr("d", area)
        .attr("fill", colorScheme.chart.primary)
        .attr("opacity", 0.2);
    }
    
    // Axes
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(8));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text").attr("fill", colors.chart.text);
    
    const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => d.toFixed(2)));
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text").attr("fill", colors.chart.text);
    
    // Labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 35)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .attr("font-size", "12px")
      .text("x");
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .attr("font-size", "12px")
      .text("f(x)");
    
    // Formula
    const formulaText = stage === 2 ? 
      `E[X] ≈ Σ x · f(x) · Δx` :
      `E[X] = ∫ x · f(x) dx = ${formatNumber(trueExpectation)}`;
    
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top + 20)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.primaryLight)
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .text(formulaText);
    
    return () => {
      // Cleanup on unmount
      svg.selectAll("*").interrupt().remove();
    };
  }, [stage, distributionType, param1, param2, numRectangles, showRiemannSum, colorScheme]);
  
  // Draw transition animation (Stage 2)
  useEffect(() => {
    if (!transitionSvgRef.current || stage !== 2) return;
    
    const svg = d3.select(transitionSvgRef.current);
    const { width } = transitionSvgRef.current.getBoundingClientRect();
    const height = 100;
    
    // Clean up any existing content
    svg.selectAll("*").interrupt().remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // Animated arrow
    const arrowPath = `M${width/2 - 100} ${height/2} L${width/2 + 100} ${height/2}`;
    
    svg.append("path")
      .attr("d", arrowPath)
      .attr("stroke", colorScheme.chart.secondary)
      .attr("stroke-width", 3)
      .attr("fill", "none")
      .attr("marker-end", "url(#arrowhead)");
    
    // Arrowhead
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", colorScheme.chart.secondary);
    
    // Labels
    svg.append("text")
      .attr("x", width/2 - 120)
      .attr("y", height/2 - 20)
      .attr("text-anchor", "end")
      .attr("fill", colors.chart.text)
      .attr("font-size", "18px")
      .attr("font-weight", "600")
      .text("Σ");
    
    svg.append("text")
      .attr("x", width/2 + 120)
      .attr("y", height/2 - 20)
      .attr("text-anchor", "start")
      .attr("fill", colors.chart.text)
      .attr("font-size", "18px")
      .attr("font-weight", "600")
      .text("∫");
    
    svg.append("text")
      .attr("x", width/2)
      .attr("y", height/2 + 30)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.secondary)
      .attr("font-size", "14px")
      .text(`As n → ∞, the sum becomes an integral`);
    
    return () => {
      // Cleanup on unmount
      svg.selectAll("*").interrupt().remove();
    };
  }, [stage, colorScheme]);
  
  // Get stage-specific content
  const getStageContent = () => {
    switch(stage) {
      case 1:
        return {
          title: "Stage 1: Review Discrete Expectation",
          description: "For discrete random variables, expectation is the weighted average of all possible values.",
          insight: "The expected value of a fair die is E[X] = 1·(1/6) + 2·(1/6) + ... + 6·(1/6) = 3.5"
        };
      
      case 2:
        return {
          title: "Stage 2: From Sum to Integral",
          description: "As we make our intervals smaller (more rectangles), the Riemann sum approaches the integral.",
          insight: (() => {
            const [xMin, xMax] = getXDomain();
            const rectWidth = (xMax - xMin) / numRectangles;
            let approx = 0;
            for (let i = 0; i < numRectangles; i++) {
              const x = xMin + (i + 0.5) * rectWidth;
              const pdfValue = getPDF(x);
              if (isFinite(pdfValue)) {
                approx += x * pdfValue * rectWidth;
              }
            }
            return `With ${numRectangles} rectangles: E[X] ≈ ${formatNumber(approx)}. True value: ${formatNumber(trueExpectation)}`;
          })()
        };
      
      case 3:
        return {
          title: "Stage 3: Continuous Expectation & Variance",
          description: "For continuous random variables, we integrate instead of summing.",
          insight: `E[X] = ∫ x·f(x)dx = ${formatNumber(trueExpectation)}, Var(X) = ∫ (x-E[X])²·f(x)dx = ${formatNumber(trueVariance)}`
        };
      
      case 4:
        return {
          title: "Stage 4: Real-World Applications",
          description: "Continuous distributions model real-world measurements and phenomena.",
          insight: distributionType === 'uniform' ? 
            "Uniform: Processing time in a queue with fixed bounds" :
            distributionType === 'exponential' ?
            "Exponential: Time between arrivals, component lifetime" :
            "Normal: Manufacturing tolerances, measurement errors"
        };
    }
  };
  
  const stageContent = getStageContent();
  
  // Real-world examples
  const realWorldExamples = {
    uniform: {
      title: "Uniform Distribution",
      example: "Bus arrival: If a bus arrives every 10 minutes and you arrive randomly, your wait time is uniformly distributed between 0 and 10 minutes.",
      expectation: "Expected wait time = 5 minutes",
      variance: "Variance = 100/12 ≈ 8.33 min²"
    },
    exponential: {
      title: "Exponential Distribution",
      example: "Component lifetime: Electronic components often have exponentially distributed lifetimes with rate λ.",
      expectation: "Expected lifetime = 1/λ",
      variance: "Variance = 1/λ²"
    },
    normal: {
      title: "Normal Distribution",
      example: "Manufacturing: Bolt diameters might be N(10mm, 0.1²mm²) due to natural variation.",
      expectation: "Expected diameter = 10mm",
      variance: "Variance = 0.01mm²"
    }
  };
  
  return (
    <VisualizationContainer
      title="📊 Continuous Expectation & Variance"
      description={
        <>
          <p className={typography.description}>
            <strong>From discrete sums to continuous integrals!</strong> See how expectation and variance 
            extend from discrete to continuous random variables through the magic of calculus.
          </p>
          <p className={cn(typography.description, "mt-2")}>
            Watch the transition from <span className="text-emerald-400">Σ to ∫</span> as we move from 
            counting individual outcomes to integrating over continuous ranges.
          </p>
        </>
      }
    >
      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Learning Progress</span>
          <span className="text-sm font-mono text-gray-300">{stage}/4</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(stage / 4) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left side - Controls and Info */}
        <div className="lg:w-1/3 space-y-4">
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">{stageContent.title}</h4>
            <p className="text-sm text-gray-300 mb-3">{stageContent.description}</p>
            
            <ControlGroup>
              <div className="space-y-3">
                {/* Stage controls */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setStage(Math.max(1, stage - 1))}
                    disabled={stage === 1}
                    className={cn(
                      "flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                      stage === 1 
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
                        : "bg-neutral-700 hover:bg-neutral-600 text-white"
                    )}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextStage}
                    disabled={stage === 4}
                    className={cn(
                      "flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                      stage === 4 
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    )}
                  >
                    {stage === 4 ? "Complete!" : "Next"}
                  </button>
                </div>
                
                {/* Distribution controls (Stage 2-4) */}
                {stage >= 2 && (
                  <>
                    <div>
                      <label className="text-sm text-gray-300 mb-1 block">
                        Distribution Type
                      </label>
                      <select
                        value={distributionType}
                        onChange={(e) => setDistributionType(e.target.value)}
                        className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                      >
                        <option value="uniform">Uniform</option>
                        <option value="exponential">Exponential</option>
                        <option value="normal">Normal</option>
                      </select>
                    </div>
                    
                    {distributionType === 'uniform' && (
                      <>
                        <div>
                          <label className="text-sm text-gray-300 mb-1 block">
                            Lower bound (a): {param1}
                          </label>
                          <RangeSlider
                            value={param1}
                            onChange={(v) => setParam1(Math.min(v, param2 - 0.5))}
                            min={0}
                            max={5}
                            step={0.5}
                            className="mb-2"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-300 mb-1 block">
                            Upper bound (b): {param2}
                          </label>
                          <RangeSlider
                            value={param2}
                            onChange={(v) => setParam2(Math.max(param1 + 1, v))}
                            min={param1 + 1}
                            max={10}
                            step={0.5}
                            className="mb-2"
                          />
                        </div>
                      </>
                    )}
                    
                    {distributionType === 'exponential' && (
                      <div>
                        <label className="text-sm text-gray-300 mb-1 block">
                          Rate (λ): {param1}
                        </label>
                        <RangeSlider
                          value={param1}
                          onChange={(v) => setParam1(Math.max(0.1, v))}
                          min={0.1}
                          max={3}
                          step={0.1}
                          className="mb-2"
                        />
                      </div>
                    )}
                    
                    {distributionType === 'normal' && (
                      <>
                        <div>
                          <label className="text-sm text-gray-300 mb-1 block">
                            Mean (μ): {param1}
                          </label>
                          <RangeSlider
                            value={param1}
                            onChange={(v) => setParam1(v)}
                            min={0}
                            max={10}
                            step={0.5}
                            className="mb-2"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-300 mb-1 block">
                            Std Dev (σ): {param2}
                          </label>
                          <RangeSlider
                            value={param2}
                            onChange={(v) => setParam2(Math.max(0.1, v))}
                            min={0.5}
                            max={3}
                            step={0.1}
                            className="mb-2"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
                
                {/* Riemann sum controls (Stage 2) */}
                {stage === 2 && (
                  <>
                    <div>
                      <label className="text-sm text-gray-300 mb-1 block">
                        Number of Rectangles: {numRectangles}
                      </label>
                      <RangeSlider
                        value={numRectangles}
                        onChange={(v) => setNumRectangles(v)}
                        min={5}
                        max={50}
                        step={5}
                        className="mb-2"
                      />
                    </div>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={showRiemannSum}
                        onChange={(e) => setShowRiemannSum(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-gray-300">Show Riemann Sum</span>
                    </label>
                  </>
                )}
                
                <button
                  onClick={handleReset}
                  className="w-full px-3 py-1.5 rounded text-sm font-medium transition-colors bg-neutral-700 hover:bg-neutral-600 text-white"
                >
                  <RotateCcw className="w-4 h-4 inline mr-2" />
                  Reset All
                </button>
              </div>
            </ControlGroup>
          </VisualizationSection>
          
          {/* Statistics Display */}
          {stage >= 2 && (
            <VisualizationSection className="p-3">
              <h4 className="text-base font-bold text-white mb-3">Calculated Values</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">E[X]:</span>
                  <span className="text-emerald-400 font-mono font-medium">
                    {formatNumber(trueExpectation)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Var(X):</span>
                  <span className="text-purple-400 font-mono font-medium">
                    {formatNumber(trueVariance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">SD(X):</span>
                  <span className="text-blue-400 font-mono font-medium">
                    {formatNumber(Math.sqrt(trueVariance))}
                  </span>
                </div>
              </div>
            </VisualizationSection>
          )}
          
          {/* Learning Insights */}
          <VisualizationSection className="p-3 bg-gradient-to-br from-emerald-900/20 to-green-900/20 border-emerald-600/30">
            <h4 className="text-base font-bold text-emerald-300 mb-3">Key Insight</h4>
            <p className="text-sm text-emerald-200">{stageContent.insight}</p>
          </VisualizationSection>
        </div>
        
        {/* Right side - Visualizations */}
        <div className="lg:flex-1 space-y-4">
          {/* Stage 1: Discrete visualization */}
          {stage === 1 && (
            <GraphContainer title="Discrete Random Variable (Die Roll)">
              <svg ref={discreteSvgRef} className="w-full" style={{ height: 280 }} />
            </GraphContainer>
          )}
          
          {/* Stage 2: Transition animation */}
          {stage === 2 && (
            <>
              <GraphContainer title="Continuous Random Variable">
                <svg ref={continuousSvgRef} className="w-full" style={{ height: 280 }} />
              </GraphContainer>
              <div className="relative">
                <svg ref={transitionSvgRef} className="w-full" style={{ height: 100 }} />
              </div>
            </>
          )}
          
          {/* Stage 3-4: Continuous only */}
          {stage >= 3 && (
            <GraphContainer title="Continuous Random Variable">
              <svg ref={continuousSvgRef} className="w-full" style={{ height: 280 }} />
            </GraphContainer>
          )}
          
          {/* Stage 4: Real-world application */}
          {stage === 4 && (
            <VisualizationSection className="p-4 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-600/30">
              <h4 className="text-base font-bold text-blue-300 mb-3">
                🏭 {realWorldExamples[distributionType].title} in Practice
              </h4>
              <p className="text-sm text-blue-200 mb-2">
                {realWorldExamples[distributionType].example}
              </p>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-blue-300">• {realWorldExamples[distributionType].expectation}</p>
                <p className="text-blue-300">• {realWorldExamples[distributionType].variance}</p>
              </div>
            </VisualizationSection>
          )}
        </div>
      </div>
      
      {/* Formula Reference */}
      <VisualizationSection divider className="mt-4 p-4">
        <h4 className="text-base font-bold text-white mb-3">📐 Formula Reference</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-800/50 rounded p-3">
            <h5 className="font-semibold text-emerald-400 mb-2">Discrete</h5>
            <p className="font-mono text-xs mb-1">E[X] = Σ x · P(X = x)</p>
            <p className="font-mono text-xs">Var(X) = Σ (x - E[X])² · P(X = x)</p>
          </div>
          <div className="bg-gray-800/50 rounded p-3">
            <h5 className="font-semibold text-emerald-400 mb-2">Continuous</h5>
            <p className="font-mono text-xs mb-1">E[X] = ∫ x · f(x) dx</p>
            <p className="font-mono text-xs">Var(X) = ∫ (x - E[X])² · f(x) dx</p>
          </div>
        </div>
      </VisualizationSection>
    </VisualizationContainer>
  );
};

export default ContinuousExpectationVariance;