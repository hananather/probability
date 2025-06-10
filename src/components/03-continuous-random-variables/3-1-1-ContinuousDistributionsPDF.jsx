"use client";
import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup,
  ControlPanel,
  StatsDisplay
} from '../ui/VisualizationContainer';
import { RangeSlider } from '../ui/RangeSlider';
import { ProgressTracker } from '../ui/ProgressTracker';
import { Button } from '../ui/button';
import { createColorScheme, typography, formatNumber } from '../../lib/design-system';
import { IntegralWorkedExample } from "./3-1-2-IntegralWorkedExample";
import { Lock, Unlock, Info, Sparkles, RotateCcw } from "lucide-react";

// Distribution configurations with real-world context
const distributionOptions = [
  { 
    value: "uniform", 
    label: "Uniform", 
    locked: false,
    params: [
      {name: "a (Min)", min: -5, max: 5, step: 0.1, default: 0}, 
      {name: "b (Max)", min: -4, max: 6, step: 0.1, default: 1}
    ], 
    pdfTex: "\\frac{1}{b-a}, \\quad a \\le x \\le b",
    realWorld: {
      title: "Random Number Generation & Rounding Errors",
      description: "The uniform distribution models situations where all outcomes in a range are equally likely.",
      examples: [
        "Computer random number generators produce uniform values between 0 and 1",
        "Rounding errors in measurements uniformly distributed within ±0.5 units",
        "Arrival times within a scheduled window (e.g., 8-9 AM appointments)"
      ]
    }
  },
  { 
    value: "normal", 
    label: "Normal", 
    locked: true,
    unlockAt: 10,
    params: [
      {name: "μ (Mean)", min: -5, max: 5, step: 0.1, default: 0}, 
      {name: "σ (Std Dev)", min: 0.1, max: 5, step: 0.1, default: 1}
    ], 
    pdfTex: "\\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}",
    realWorld: {
      title: "Quality Control & Natural Measurements",
      description: "The normal distribution appears everywhere due to the Central Limit Theorem.",
      examples: [
        "Manufacturing tolerances: part dimensions cluster around target values",
        "Human measurements: heights, weights, IQ scores follow bell curves",
        "Measurement errors: aggregate of many small random errors"
      ]
    }
  },
  { 
    value: "exponential", 
    label: "Exponential", 
    locked: true,
    unlockAt: 20,
    params: [
      {name: "λ (Rate)", min: 0.1, max: 5, step: 0.1, default: 1}
    ], 
    pdfTex: "\\lambda e^{-\\lambda x}, \\quad x \\ge 0",
    realWorld: {
      title: "Wait Times & Component Lifetimes",
      description: "The exponential distribution models time until the next random event.",
      examples: [
        "Time between customer arrivals at a service counter",
        "Lifetime of electronic components before failure",
        "Time between radioactive decay events"
      ]
    }
  },
  { 
    value: "gamma", 
    label: "Gamma", 
    locked: true,
    unlockAt: 20,
    params: [
      {name: "k (Shape)", min: 0.1, max: 10, step: 0.1, default: 2}, 
      {name: "θ (Scale)", min: 0.1, max: 5, step: 0.1, default: 1}
    ], 
    pdfTex: "\\frac{1}{\\Gamma(k)\\theta^k} x^{k-1} e^{-x/\\theta}, \\quad x > 0",
    realWorld: {
      title: "Insurance Claims & Rainfall",
      description: "The gamma distribution models the sum of exponential waiting times.",
      examples: [
        "Total rainfall in a season (sum of storm amounts)",
        "Insurance claim sizes (many small, few large)",
        "Time to complete multiple sequential tasks"
      ]
    }
  },
  { 
    value: "beta", 
    label: "Beta", 
    locked: true,
    unlockAt: 20,
    params: [
      {name: "α (Alpha)", min: 0.1, max: 10, step: 0.1, default: 2}, 
      {name: "β (Beta)", min: 0.1, max: 10, step: 0.1, default: 2}
    ], 
    pdfTex: "\\frac{x^{\\alpha-1}(1-x)^{\\beta-1}}{B(\\alpha, \\beta)}, \\quad 0 < x < 1",
    realWorld: {
      title: "Project Completion & Success Rates",
      description: "The beta distribution models proportions and probabilities.",
      examples: [
        "Project completion percentage at any given time",
        "Success rate of a manufacturing process",
        "Prior probabilities in Bayesian inference"
      ]
    }
  }
];

const ContinuousDistributionsPDF = () => {
  const colorScheme = createColorScheme('probability');
  const svgRef = useRef();
  const componentRef = useRef();
  const dragRef = useRef(null);
  
  // Start with only uniform distribution unlocked
  const [unlockedDistributions, setUnlockedDistributions] = useState(["uniform"]);
  const [selectedDist, setSelectedDist] = useState(distributionOptions[0]);
  const [params, setParams] = useState(selectedDist.params.map(p => p.default));
  const [interactionCount, setInteractionCount] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [milestoneReached, setMilestoneReached] = useState(false);
  
  // Interval selection
  const [intervalA, setIntervalA] = useState(-0.5);
  const [intervalB, setIntervalB] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null); // 'a', 'b', or 'interval'
  
  // Calculated values
  const [calculatedIntegralProb, setCalculatedIntegralProb] = useState(0);
  const [cdfAValue, setCdfAValue] = useState(0);
  const [cdfBValue, setCdfBValue] = useState(0);
  const [meanVal, setMeanVal] = useState(0);

  // Track meaningful interactions
  const lastInteraction = useRef({ params: [...params], intervalA, intervalB });
  
  // Check for milestone achievements
  useEffect(() => {
    let timeoutId;
    
    if (interactionCount === 10 && !unlockedDistributions.includes("normal")) {
      setUnlockedDistributions(prev => [...prev, "normal"]);
      setMilestoneReached(true);
      timeoutId = setTimeout(() => setMilestoneReached(false), 4000);
    } else if (interactionCount === 20 && unlockedDistributions.length < distributionOptions.length) {
      setUnlockedDistributions(distributionOptions.map(d => d.value));
      setMilestoneReached(true);
      timeoutId = setTimeout(() => setMilestoneReached(false), 4000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [interactionCount, unlockedDistributions]);

  // Count interactions on meaningful changes
  useEffect(() => {
    const paramsChanged = params.some((p, i) => 
      Math.abs(p - lastInteraction.current.params[i]) > 0.05
    );
    const intervalChanged = 
      Math.abs(intervalA - lastInteraction.current.intervalA) > 0.05 ||
      Math.abs(intervalB - lastInteraction.current.intervalB) > 0.05;
    
    if ((paramsChanged || intervalChanged) && interactionCount > 0) {
      setInteractionCount(prev => prev + 1);
      lastInteraction.current = { params: [...params], intervalA, intervalB };
    }
  }, [params, intervalA, intervalB]);

  // Calculate plot data and statistics
  const calculatePlotDataAndStats = useCallback(() => {
    let domain, data = [], mean, cdfA, cdfB, integralProb;
    const numPoints = 500;

    try {
      // Validate interval parameters
      if (intervalA >= intervalB) {
        console.warn('Invalid interval: intervalA >= intervalB');
        return { domain: [-5, 5], data: [], mean: 0, cdfA: 0, cdfB: 0, integralProb: 0 };
      }

      switch (selectedDist.value) {
        case "normal":
          domain = [params[0] - 4 * params[1], params[0] + 4 * params[1]];
          data = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / numPoints).map(xVal => ({
            x: xVal, y: jStat.normal.pdf(xVal, params[0], params[1])
          }));
          mean = jStat.normal.mean(params[0], params[1]);
          cdfA = jStat.normal.cdf(intervalA, params[0], params[1]);
          cdfB = jStat.normal.cdf(intervalB, params[0], params[1]);
          break;
          
        case "exponential":
          domain = [0, Math.max(5 / params[0], 5)];
          data = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / numPoints).map(xVal => ({
            x: xVal, y: jStat.exponential.pdf(xVal, params[0])
          }));
          mean = jStat.exponential.mean(params[0]);
          cdfA = jStat.exponential.cdf(intervalA, params[0]);
          cdfB = jStat.exponential.cdf(intervalB, params[0]);
          break;
          
        case "gamma":
          // Validate gamma parameters
          if (params[0] <= 0 || params[1] <= 0) {
            console.warn('Invalid gamma parameters: shape or scale <= 0');
            return { domain: [0, 10], data: [], mean: 0, cdfA: 0, cdfB: 0, integralProb: 0 };
          }
          
          const gammaMean = params[0] * params[1];
          const gammaStdDev = Math.sqrt(params[0]) * params[1];
          domain = [Math.max(0.0001, gammaMean - 4*gammaStdDev), Math.max(gammaMean + 4 * gammaStdDev, 5)];
          if(domain[0] >= domain[1]) domain = [0.0001, domain[0]+1];
          
          data = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / numPoints).map(xVal => {
            try {
              const pdfVal = jStat.gamma.pdf(xVal, params[0], params[1]);
              return { x: xVal, y: isFinite(pdfVal) ? pdfVal : 0 };
            } catch (e) {
              return { x: xVal, y: 0 };
            }
          });
          
          try {
            mean = jStat.gamma.mean(params[0], params[1]);
            cdfA = Math.max(0, jStat.gamma.cdf(Math.max(0, intervalA), params[0], params[1]));
            cdfB = Math.max(0, jStat.gamma.cdf(Math.max(0, intervalB), params[0], params[1]));
          } catch (e) {
            mean = gammaMean;
            cdfA = 0;
            cdfB = 1;
          }
          break;
          
        case "uniform":
          let [ua, ub] = params;
          // Ensure valid uniform parameters
          if (ua >= ub) { 
            ub = ua + 0.1;
            // Update params to reflect the correction
            params[1] = ub;
          }
          domain = [ua - (ub-ua)*0.2, ub + (ub-ua)*0.2];
          data = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / numPoints).map(xVal => ({
            x: xVal, y: jStat.uniform.pdf(xVal, ua, ub)
          }));
          mean = jStat.uniform.mean(ua, ub);
          cdfA = jStat.uniform.cdf(intervalA, ua, ub);
          cdfB = jStat.uniform.cdf(intervalB, ua, ub);
          break;
          
        case "beta":
          domain = [0, 1];
          if (params[0] <= 0 || params[1] <= 0) {
            console.warn('Invalid beta parameters: alpha or beta <= 0');
            return { domain: [0, 1], data: [], mean: 0.5, cdfA: 0, cdfB: 0, integralProb: 0 };
          }
          
          data = d3.range(0.001, 0.999, (0.999 - 0.001) / numPoints).map(xVal => {
            try {
              const pdfVal = jStat.beta.pdf(xVal, params[0], params[1]);
              return { x: xVal, y: isFinite(pdfVal) ? pdfVal : 0 };
            } catch (e) {
              return { x: xVal, y: 0 };
            }
          });
          
          try {
            mean = jStat.beta.mean(params[0], params[1]);
            cdfA = jStat.beta.cdf(Math.max(0, Math.min(1, intervalA)), params[0], params[1]);
            cdfB = jStat.beta.cdf(Math.max(0, Math.min(1, intervalB)), params[0], params[1]);
          } catch (e) {
            mean = 0.5;
            cdfA = 0;
            cdfB = 1;
          }
          break;
          
        default:
          domain = [-5, 5]; data = []; mean = 0; cdfA = 0; cdfB = 0;
      }
      
      integralProb = Math.max(0, cdfB - cdfA);
      return { domain, data, mean, cdfA, cdfB, integralProb };

    } catch (error) {
      console.error("Error calculating distribution data:", error);
      return { domain: [-5,5], data: [], mean: 0, cdfA:0, cdfB:0, integralProb:0 };
    }
  }, [selectedDist.value, params, intervalA, intervalB]);

  // Update calculated values
  useEffect(() => {
    const { mean, cdfA, cdfB, integralProb } = calculatePlotDataAndStats();
    setMeanVal(mean);
    setCdfAValue(cdfA);
    setCdfBValue(cdfB);
    setCalculatedIntegralProb(integralProb);
  }, [calculatePlotDataAndStats]);

  // D3 Visualization with drag functionality
  useEffect(() => {
    if (!svgRef.current || typeof window === 'undefined') return;
    
    const { domain, data: plotData } = calculatePlotDataAndStats();
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 400;
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0f172a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain(domain)
      .range([0, innerWidth]);
    
    const maxYValue = d3.max(plotData, d => d.y) || 1;
    const yScale = d3.scaleLinear()
      .domain([0, maxYValue * 1.1])
      .range([innerHeight, 0]);
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .selectAll("text")
      .attr("fill", "#e2e8f0")
      .style("font-size", "12px");
    
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("fill", "#e2e8f0")
      .style("font-size", "14px")
      .text("x");
    
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text")
      .attr("fill", "#e2e8f0")
      .style("font-size", "12px");
    
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -35)
      .attr("fill", "#e2e8f0")
      .style("font-size", "14px")
      .text("f(x)");
    
    // Area and line generators
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    const areaGenerator = d3.area()
      .x(d => xScale(d.x))
      .y0(innerHeight)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Full distribution area
    g.append("path")
      .datum(plotData)
      .attr("fill", colorScheme.primary + "30")
      .attr("d", areaGenerator);
    
    // Distribution line
    g.append("path")
      .datum(plotData)
      .attr("fill", "none")
      .attr("stroke", colorScheme.primary)
      .attr("stroke-width", 2.5)
      .attr("d", line);
    
    // Highlighted integral area
    const integralAreaData = plotData.filter(d => d.x >= intervalA && d.x <= intervalB);
    if (integralAreaData.length > 0) {
      g.append("path")
        .datum(integralAreaData)
        .attr("fill", colorScheme.secondary + "60")
        .attr("stroke", colorScheme.secondary)
        .attr("stroke-width", 1.5)
        .attr("d", areaGenerator);
    }
    
    // Mean line
    if (meanVal !== undefined && xScale(meanVal) >= 0 && xScale(meanVal) <= innerWidth) {
      g.append("line")
        .attr("x1", xScale(meanVal))
        .attr("x2", xScale(meanVal))
        .attr("y1", yScale(0))
        .attr("y2", yScale(maxYValue * 1.1))
        .attr("stroke", colorScheme.accent)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4");
      
      g.append("text")
        .attr("x", xScale(meanVal) + 5)
        .attr("y", 20)
        .attr("fill", colorScheme.accent)
        .style("font-size", "12px")
        .style("font-family", "monospace")
        .text(`μ = ${meanVal.toFixed(2)}`);
    }
    
    // Draggable interval markers
    const createDragBehavior = (type) => {
      return d3.drag()
        .on("start", () => {
          setIsDragging(true);
          setDragType(type);
          if (interactionCount === 0) setInteractionCount(1);
        })
        .on("drag", (event) => {
          const newX = Math.max(0, Math.min(innerWidth, event.x));
          const newValue = xScale.invert(newX);
          
          if (type === 'a') {
            setIntervalA(Math.min(newValue, intervalB - 0.01));
          } else if (type === 'b') {
            setIntervalB(Math.max(newValue, intervalA + 0.01));
          } else if (type === 'interval') {
            const dx = xScale.invert(event.dx) - xScale.invert(0);
            const newA = intervalA + dx;
            const newB = intervalB + dx;
            if (newA >= domain[0] && newB <= domain[1]) {
              setIntervalA(newA);
              setIntervalB(newB);
            }
          }
        })
        .on("end", () => {
          setIsDragging(false);
          setDragType(null);
        });
    };
    
    // Interval A marker
    const markerA = g.append("g")
      .attr("class", "marker-a")
      .attr("cursor", "ew-resize")
      .call(createDragBehavior('a'));
    
    markerA.append("line")
      .attr("x1", xScale(intervalA))
      .attr("x2", xScale(intervalA))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", colorScheme.secondary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "2,2");
    
    markerA.append("rect")
      .attr("x", xScale(intervalA) - 10)
      .attr("y", innerHeight - 30)
      .attr("width", 20)
      .attr("height", 30)
      .attr("fill", colorScheme.secondary)
      .attr("opacity", 0.8);
    
    markerA.append("text")
      .attr("x", xScale(intervalA))
      .attr("y", innerHeight - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("a");
    
    // Interval B marker
    const markerB = g.append("g")
      .attr("class", "marker-b")
      .attr("cursor", "ew-resize")
      .call(createDragBehavior('b'));
    
    markerB.append("line")
      .attr("x1", xScale(intervalB))
      .attr("x2", xScale(intervalB))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", colorScheme.secondary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "2,2");
    
    markerB.append("rect")
      .attr("x", xScale(intervalB) - 10)
      .attr("y", innerHeight - 30)
      .attr("width", 20)
      .attr("height", 30)
      .attr("fill", colorScheme.secondary)
      .attr("opacity", 0.8);
    
    markerB.append("text")
      .attr("x", xScale(intervalB))
      .attr("y", innerHeight - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("b");
    
    // Draggable interval area (for moving both)
    if (integralAreaData.length > 0) {
      const intervalRect = g.append("rect")
        .attr("x", xScale(intervalA))
        .attr("y", 0)
        .attr("width", Math.max(0, xScale(intervalB) - xScale(intervalA)))
        .attr("height", innerHeight)
        .attr("fill", "transparent")
        .attr("cursor", "move")
        .call(createDragBehavior('interval'));
    }
    
    // Probability display
    g.append("text")
      .attr("x", innerWidth - 10)
      .attr("y", 20)
      .attr("text-anchor", "end")
      .attr("fill", colorScheme.secondary)
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("font-family", "monospace")
      .text(`P(${intervalA.toFixed(2)} ≤ X ≤ ${intervalB.toFixed(2)}) = ${calculatedIntegralProb.toFixed(4)}`);
    
  }, [calculatePlotDataAndStats, intervalA, intervalB, calculatedIntegralProb, colorScheme, interactionCount]);

  // Handle distribution change
  const handleDistChange = (value) => {
    const newDist = distributionOptions.find(opt => opt.value === value);
    if (newDist && unlockedDistributions.includes(value)) {
      setSelectedDist(newDist);
      setParams(newDist.params.map(p => p.default));
      
      // Reset interval to reasonable defaults for the distribution
      const { domain } = calculatePlotDataAndStats();
      const range = domain[1] - domain[0];
      setIntervalA(domain[0] + range * 0.3);
      setIntervalB(domain[0] + range * 0.7);
    }
  };

  // Handle parameter change
  const handleParamChange = (index, value) => {
    const newParams = [...params];
    const parsedValue = parseFloat(value);
    
    // Validate parsed value
    if (isNaN(parsedValue)) return;
    
    newParams[index] = parsedValue;
    
    // Distribution-specific validation
    switch (selectedDist.value) {
      case "uniform":
        if (index === 0 && newParams[0] >= newParams[1]) {
          newParams[1] = newParams[0] + 0.1;
        } else if (index === 1 && newParams[1] <= newParams[0]) {
          newParams[0] = newParams[1] - 0.1;
        }
        break;
        
      case "exponential":
        if (newParams[0] <= 0) newParams[0] = 0.1;
        break;
        
      case "gamma":
        if (newParams[index] <= 0) newParams[index] = 0.1;
        break;
        
      case "beta":
        if (newParams[index] <= 0) newParams[index] = 0.1;
        break;
        
      case "normal":
        if (index === 1 && newParams[1] <= 0) newParams[1] = 0.1;
        break;
    }
    
    setParams(newParams);
  };

  // Reset function
  const handleReset = () => {
    setSelectedDist(distributionOptions[0]);
    setParams(distributionOptions[0].params.map(p => p.default));
    setIntervalA(-0.5);
    setIntervalB(0.5);
    setInteractionCount(0);
    setUnlockedDistributions(["uniform"]);
    setShowIntro(true);
    lastInteraction.current = { 
      params: distributionOptions[0].params.map(p => p.default), 
      intervalA: -0.5, 
      intervalB: 0.5 
    };
  };

  // MathJax processing
  useEffect(() => {
    if (typeof window !== "undefined" && window.MathJax?.typesetPromise && componentRef.current) {
      window.MathJax.typesetPromise([componentRef.current]).catch(console.error);
    }
  }, [selectedDist]);

  return (
    <VisualizationContainer 
      ref={componentRef}
      title="Continuous Probability Distributions"
      className="min-h-screen"
    >
      {/* Introduction */}
      {showIntro && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 to-emerald-900/30 rounded-lg border border-blue-700/50">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-blue-300">
                Why Continuous Distributions Matter
              </h3>
              <p className="text-sm text-gray-300">
                Unlike discrete distributions that count individual outcomes, continuous distributions model 
                measurements that can take any value within a range. They're essential for engineering 
                because most real-world measurements are continuous.
              </p>
              <p className="text-sm text-gray-400">
                Start exploring with the Uniform distribution below. Drag the interval markers to see how 
                probability is calculated as the area under the curve!
              </p>
              <Button
                onClick={() => setShowIntro(false)}
                className="mt-2 text-xs"
                variant="outline"
              >
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone notification */}
      {milestoneReached && (
        <div className="mb-4 p-3 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg border border-amber-700/50 animate-pulse">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">
              {interactionCount === 10 
                ? "Great exploration! Normal distribution unlocked!" 
                : "Amazing progress! All distributions unlocked!"}
            </span>
          </div>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid lg:grid-cols-[1fr,300px] gap-4">
        {/* Visualization */}
        <GraphContainer className="relative">
          <svg ref={svgRef} className="w-full" />
          {isDragging && (
            <div className="absolute top-2 left-2 px-3 py-1 bg-black/80 rounded-md">
              <span className="text-xs text-gray-300">
                {dragType === 'interval' ? 'Moving interval' : `Adjusting ${dragType}`}
              </span>
            </div>
          )}
        </GraphContainer>

        {/* Controls */}
        <ControlPanel className="space-y-4">
          {/* Progress tracker */}
          <ProgressTracker 
            current={interactionCount}
            milestones={[
              { value: 10, label: "Unlock Normal", icon: Unlock },
              { value: 20, label: "Unlock All", icon: Sparkles }
            ]}
          />

          {/* Distribution selector */}
          <ControlGroup title="Distribution">
            <select 
              value={selectedDist.value} 
              onChange={(e) => handleDistChange(e.target.value)}
              className="w-full p-2 rounded bg-neutral-700 text-white border border-neutral-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {distributionOptions.map(opt => (
                <option 
                  key={opt.value} 
                  value={opt.value}
                  disabled={!unlockedDistributions.includes(opt.value)}
                >
                  {opt.label} {!unlockedDistributions.includes(opt.value) && `🔒 (Unlock at ${opt.unlockAt} interactions)`}
                </option>
              ))}
            </select>
          </ControlGroup>

          {/* Real-world context */}
          <div className="p-3 bg-neutral-800/50 rounded-lg space-y-2">
            <h4 className="text-sm font-semibold text-gray-300">
              {selectedDist.realWorld.title}
            </h4>
            <p className="text-xs text-gray-400">
              {selectedDist.realWorld.description}
            </p>
            <ul className="space-y-1">
              {selectedDist.realWorld.examples.map((example, i) => (
                <li key={i} className="text-xs text-gray-500 flex items-start gap-1">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Parameters */}
          <div className="space-y-3">
            {selectedDist.params.map((paramInfo, index) => (
              <ControlGroup key={paramInfo.name} title={paramInfo.name}>
                <RangeSlider
                  value={params[index]}
                  onChange={(value) => handleParamChange(index, value)}
                  min={paramInfo.min}
                  max={paramInfo.max}
                  step={paramInfo.step}
                  className="mb-1"
                />
                <span className="font-mono text-sm text-blue-400">
                  {formatNumber(params[index])}
                </span>
              </ControlGroup>
            ))}
          </div>

          {/* PDF Formula */}
          <div className="p-3 bg-neutral-800/50 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">PDF Formula:</div>
            <div className="text-center my-2" dangerouslySetInnerHTML={{ 
              __html: `\\[f(x) = ${selectedDist.pdfTex}\\]` 
            }} />
          </div>

          {/* Stats */}
          <StatsDisplay
            stats={[
              { label: "Mean (μ)", value: formatNumber(meanVal), color: colorScheme.accent },
              { label: "P(a ≤ X ≤ b)", value: formatNumber(calculatedIntegralProb, 4), color: colorScheme.secondary }
            ]}
          />

          {/* Reset button */}
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full text-sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </Button>
        </ControlPanel>
      </div>

      {/* Worked example */}
      <VisualizationSection className="mt-6">
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
      </VisualizationSection>
    </VisualizationContainer>
  );
};

export default memo(ContinuousDistributionsPDF);