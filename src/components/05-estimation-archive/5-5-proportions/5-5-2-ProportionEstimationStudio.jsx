'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';
import { VisualizationContainer, VisualizationSection, ControlPanel, ControlGroup, GraphContainer } from '@/components/ui/VisualizationContainer';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { cn } from '@/lib/utils';
import { Vote, Package, FlaskConical, BarChart3, AlertCircle, TrendingUp, Users } from 'lucide-react';

// Beautiful gradient theme
const proportionTheme = {
  colors: {
    primary: '#f97316',      // Orange
    secondary: '#8b5cf6',    // Purple
    success: '#10b981',      // Green
    error: '#ef4444',        // Red
    variation: '#ec4899',    // Pink
    neutral: '#6b7280',      // Gray
    background: '#1f2937',
    grid: '#374151',
    text: '#ffffff'
  },
  gradients: {
    poll: 'linear-gradient(135deg, #f97316 0%, #ef4444 50%, #3b82f6 100%)',
    quality: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    testing: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    confidence: 'linear-gradient(90deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)'
  }
};

// Critical z-values
const zValues = {
  0.90: 1.645,
  0.95: 1.96,
  0.99: 2.576
};

// Button styles
const buttonStyles = {
  primary: cn(
    "px-4 py-2 rounded-lg font-medium transition-all duration-300 transform",
    "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600",
    "text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
  ),
  scenario: cn(
    "w-full p-4 rounded-lg text-left transition-all duration-300",
    "bg-neutral-700 hover:bg-neutral-600",
    "border-2 border-transparent hover:border-orange-500/50",
    "group"
  )
};

// Confidence interval methods
const ciMethods = {
  wald: (p, n, z) => {
    const se = Math.sqrt(p * (1 - p) / n);
    return {
      lower: Math.max(0, p - z * se),
      upper: Math.min(1, p + z * se),
      se: se
    };
  },
  wilson: (p, n, z) => {
    const denominator = 1 + z * z / n;
    const center = (p + z * z / (2 * n)) / denominator;
    const halfWidth = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / denominator;
    return {
      lower: Math.max(0, center - halfWidth),
      upper: Math.min(1, center + halfWidth),
      se: halfWidth / z
    };
  },
  agresti: (p, n, z) => {
    // Agresti-Coull: Add 2 successes and 2 failures
    const nTilde = n + 4;
    const pTilde = (p * n + 2) / nTilde;
    const se = Math.sqrt(pTilde * (1 - pTilde) / nTilde);
    return {
      lower: Math.max(0, pTilde - z * se),
      upper: Math.min(1, pTilde + z * se),
      se: se
    };
  }
};

export default function ProportionEstimationStudio() {
  // Scenario state
  const [scenario, setScenario] = useState('election');
  const [sampleSize, setSampleSize] = useState(1000);
  const [observedCount, setObservedCount] = useState(520);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [ciMethod, setCiMethod] = useState('wilson');
  
  // Animation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState([]);
  const [currentSample, setCurrentSample] = useState(null);
  
  // Scenario-specific state
  const [candidate1, setCandidate1] = useState(0.52);
  const [candidate2, setCandidate2] = useState(0.48);
  const [defectRate, setDefectRate] = useState(0.02);
  const [conversionA, setConversionA] = useState(0.10);
  const [conversionB, setConversionB] = useState(0.12);
  
  // D3 refs
  const pollRef = useRef(null);
  const methodComparisonRef = useRef(null);
  const sampleSizeRef = useRef(null);
  const scalesRef = useRef({});
  
  // Calculate proportions and CIs
  const calculations = useMemo(() => {
    const p = observedCount / sampleSize;
    const z = zValues[confidenceLevel] || 1.96;
    
    // Calculate CIs using different methods
    const waldCI = ciMethods.wald(p, sampleSize, z);
    const wilsonCI = ciMethods.wilson(p, sampleSize, z);
    const agrestiCI = ciMethods.agresti(p, sampleSize, z);
    
    // Select current method
    const currentCI = ciMethod === 'wald' ? waldCI : 
                     ciMethod === 'wilson' ? wilsonCI : agrestiCI;
    
    // Check normal approximation conditions
    const np = sampleSize * p;
    const nq = sampleSize * (1 - p);
    const normalApproxValid = np >= 10 && nq >= 10;
    
    // Margin of error (for display)
    const marginOfError = z * currentCI.se;
    
    return {
      p,
      z,
      waldCI,
      wilsonCI,
      agrestiCI,
      currentCI,
      marginOfError,
      normalApproxValid,
      np,
      nq
    };
  }, [observedCount, sampleSize, confidenceLevel, ciMethod]);
  
  // Initialize poll visualization
  useEffect(() => {
    if (!pollRef.current) return;
    
    const timer = setTimeout(() => {
      const svg = d3.select(pollRef.current);
      svg.selectAll("*").remove();
      
      const container = pollRef.current.parentElement;
      const width = Math.max(container ? container.offsetWidth : 800, 400);
      const height = 400;
      const margin = { top: 40, right: 40, bottom: 60, left: 70 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      // Set SVG dimensions explicitly
      svg.attr("width", width)
         .attr("height", height)
         .attr("viewBox", `0 0 ${width} ${height}`)
         .attr("preserveAspectRatio", "xMidYMid meet")
         .style("display", "block");
      
      // Create gradients
    const defs = svg.append("defs");
    
    // Candidate gradients
    const candidate1Gradient = defs.append("linearGradient")
      .attr("id", "candidate1-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");
    candidate1Gradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6");
    candidate1Gradient.append("stop").attr("offset", "100%").attr("stop-color", "#2563eb");
    
    const candidate2Gradient = defs.append("linearGradient")
      .attr("id", "candidate2-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");
    candidate2Gradient.append("stop").attr("offset", "0%").attr("stop-color", "#ef4444");
    candidate2Gradient.append("stop").attr("offset", "100%").attr("stop-color", "#dc2626");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add title based on scenario
    g.append("text")
      .attr("class", "viz-title")
      .attr("x", innerWidth / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("fill", proportionTheme.colors.text)
      .style("font-size", "16px")
      .style("font-weight", "bold");
    
    // Groups for different elements
    g.append("g").attr("class", "bars");
    g.append("g").attr("class", "confidence-intervals");
    g.append("g").attr("class", "labels");
    g.append("g").attr("class", "axis");
    g.append("g").attr("class", "annotations");
    
    // Store dimensions
    scalesRef.current.poll = { g, innerWidth, innerHeight };
    
    }, 100); // 100ms delay
    
    return () => clearTimeout(timer);
  }, []);
  
  // Update poll visualization based on scenario
  useEffect(() => {
    if (!scalesRef.current.poll) return;
    
    // Small delay to ensure initialization completes first
    const timer = setTimeout(() => {
      const { g, innerWidth, innerHeight } = scalesRef.current.poll;
    
    // Update title
    const titles = {
      election: "Election Poll Results",
      quality: "Quality Control Inspection",
      testing: "A/B Test Results"
    };
    g.select(".viz-title").text(titles[scenario]);
    
    if (scenario === 'election') {
      // Election visualization
      const data = [
        { candidate: "Candidate A", proportion: calculations.p, ci: calculations.currentCI, color: "url(#candidate1-gradient)" },
        { candidate: "Candidate B", proportion: 1 - calculations.p, ci: null, color: "url(#candidate2-gradient)" }
      ];
      
      const x = d3.scaleBand()
        .domain(data.map(d => d.candidate))
        .range([0, innerWidth])
        .padding(0.3);
      
      const y = d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);
      
      // Clear previous elements
      g.selectAll(".bars > *").remove();
      g.selectAll(".confidence-intervals > *").remove();
      g.selectAll(".labels > *").remove();
      
      // Draw bars
      const bars = g.select(".bars").selectAll("rect").data(data);
      
      bars.enter()
        .append("rect")
        .attr("x", d => x(d.candidate))
        .attr("width", x.bandwidth())
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("fill", d => d.color)
        .attr("rx", 4)
        .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.3))")
        .transition()
        .duration(500)
        .attr("y", d => y(d.proportion))
        .attr("height", d => innerHeight - y(d.proportion));
      
      // Add percentage labels
      const labels = g.select(".labels").selectAll("text").data(data);
      
      labels.enter()
        .append("text")
        .attr("x", d => x(d.candidate) + x.bandwidth() / 2)
        .attr("y", d => y(d.proportion) - 10)
        .attr("text-anchor", "middle")
        .attr("fill", proportionTheme.colors.text)
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("opacity", 0)
        .text(d => `${(d.proportion * 100).toFixed(1)}%`)
        .transition()
        .delay(300)
        .duration(300)
        .style("opacity", 1);
      
      // Add confidence interval for candidate A
      if (data[0].ci) {
        const ciGroup = g.select(".confidence-intervals");
        
        // CI bar
        ciGroup.append("line")
          .attr("x1", x(data[0].candidate) + x.bandwidth() / 2)
          .attr("x2", x(data[0].candidate) + x.bandwidth() / 2)
          .attr("y1", y(data[0].ci.upper))
          .attr("y2", y(data[0].ci.lower))
          .attr("stroke", proportionTheme.colors.variation)
          .attr("stroke-width", 3)
          .style("opacity", 0)
          .transition()
          .delay(500)
          .duration(300)
          .style("opacity", 1);
        
        // CI caps
        [data[0].ci.upper, data[0].ci.lower].forEach(bound => {
          ciGroup.append("line")
            .attr("x1", x(data[0].candidate) + x.bandwidth() / 2 - 10)
            .attr("x2", x(data[0].candidate) + x.bandwidth() / 2 + 10)
            .attr("y1", y(bound))
            .attr("y2", y(bound))
            .attr("stroke", proportionTheme.colors.variation)
            .attr("stroke-width", 3)
            .style("opacity", 0)
            .transition()
            .delay(500)
            .duration(300)
            .style("opacity", 1);
        });
        
        // Margin of error annotation
        ciGroup.append("text")
          .attr("x", x(data[0].candidate) + x.bandwidth() / 2 + 20)
          .attr("y", y(data[0].proportion))
          .attr("fill", proportionTheme.colors.variation)
          .style("font-size", "14px")
          .style("opacity", 0)
          .text(`±${(calculations.marginOfError * 100).toFixed(1)}%`)
          .transition()
          .delay(600)
          .duration(300)
          .style("opacity", 1);
      }
      
      // 50% line
      g.select(".annotations").selectAll("*").remove();
      g.select(".annotations").append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", y(0.5))
        .attr("y2", y(0.5))
        .attr("stroke", proportionTheme.colors.neutral)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "5,3")
        .style("opacity", 0.5);
      
    } else if (scenario === 'quality') {
      // Quality control visualization
      const passRate = 1 - calculations.p;
      
      // Circular gauge
      g.selectAll(".bars > *").remove();
      g.selectAll(".confidence-intervals > *").remove();
      
      const centerX = innerWidth / 2;
      const centerY = innerHeight / 2;
      const radius = Math.min(innerWidth, innerHeight) * 0.35;
      
      // Background circle
      g.select(".bars").append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", proportionTheme.colors.neutral)
        .attr("stroke-width", 20)
        .style("opacity", 0.2);
      
      // Pass rate arc
      const arc = d3.arc()
        .innerRadius(radius - 20)
        .outerRadius(radius)
        .startAngle(0)
        .endAngle(passRate * 2 * Math.PI);
      
      g.select(".bars").append("path")
        .attr("d", arc)
        .attr("transform", `translate(${centerX},${centerY})`)
        .attr("fill", passRate > 0.95 ? proportionTheme.colors.success : proportionTheme.colors.error)
        .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.3))");
      
      // Center text
      g.select(".labels").selectAll("*").remove();
      const centerText = g.select(".labels").append("g")
        .attr("transform", `translate(${centerX},${centerY})`);
      
      centerText.append("text")
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", proportionTheme.colors.text)
        .style("font-size", "36px")
        .style("font-weight", "bold")
        .text(`${(passRate * 100).toFixed(1)}%`);
      
      centerText.append("text")
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("fill", proportionTheme.colors.textSecondary)
        .style("font-size", "16px")
        .text("Pass Rate");
      
      centerText.append("text")
        .attr("y", 35)
        .attr("text-anchor", "middle")
        .attr("fill", proportionTheme.colors.error)
        .style("font-size", "14px")
        .text(`${observedCount} defects / ${sampleSize} items`);
      
    } else if (scenario === 'testing') {
      // A/B testing visualization
      const dataA = { group: "Version A", rate: conversionA, n: Math.floor(sampleSize / 2) };
      const dataB = { group: "Version B", rate: conversionB, n: Math.floor(sampleSize / 2) };
      const data = [dataA, dataB];
      
      const x = d3.scaleBand()
        .domain(data.map(d => d.group))
        .range([0, innerWidth])
        .padding(0.3);
      
      const y = d3.scaleLinear()
        .domain([0, Math.max(conversionA, conversionB) * 1.3])
        .range([innerHeight, 0]);
      
      // Clear and draw
      g.selectAll(".bars > *").remove();
      g.selectAll(".confidence-intervals > *").remove();
      g.selectAll(".labels > *").remove();
      
      // Bars
      const bars = g.select(".bars").selectAll("rect").data(data);
      
      bars.enter()
        .append("rect")
        .attr("x", d => x(d.group))
        .attr("width", x.bandwidth())
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("fill", (d, i) => i === 0 ? proportionTheme.colors.primary : proportionTheme.colors.secondary)
        .attr("rx", 4)
        .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.3))")
        .transition()
        .duration(500)
        .attr("y", d => y(d.rate))
        .attr("height", d => innerHeight - y(d.rate));
      
      // Labels
      data.forEach((d, i) => {
        const labelGroup = g.select(".labels").append("g")
          .attr("transform", `translate(${x(d.group) + x.bandwidth() / 2}, ${y(d.rate) - 10})`);
        
        labelGroup.append("text")
          .attr("text-anchor", "middle")
          .attr("fill", proportionTheme.colors.text)
          .style("font-size", "18px")
          .style("font-weight", "bold")
          .text(`${(d.rate * 100).toFixed(1)}%`);
        
        // CI for each version
        const z = calculations.z;
        const ci = ciMethods[ciMethod](d.rate, d.n, z);
        
        const ciGroup = g.select(".confidence-intervals").append("g");
        
        ciGroup.append("line")
          .attr("x1", x(d.group) + x.bandwidth() / 2)
          .attr("x2", x(d.group) + x.bandwidth() / 2)
          .attr("y1", y(ci.upper))
          .attr("y2", y(ci.lower))
          .attr("stroke", proportionTheme.colors.variation)
          .attr("stroke-width", 2);
        
        [ci.upper, ci.lower].forEach(bound => {
          ciGroup.append("line")
            .attr("x1", x(d.group) + x.bandwidth() / 2 - 8)
            .attr("x2", x(d.group) + x.bandwidth() / 2 + 8)
            .attr("y1", y(bound))
            .attr("y2", y(bound))
            .attr("stroke", proportionTheme.colors.variation)
            .attr("stroke-width", 2);
        });
      });
    }
    
    }, 150); // Small delay for initial render
    
    return () => clearTimeout(timer);
  }, [scenario, calculations, observedCount, sampleSize, conversionA, conversionB, ciMethod]);
  
  // Initialize method comparison
  useEffect(() => {
    if (!methodComparisonRef.current) return;
    
    const timer = setTimeout(() => {
      const svg = d3.select(methodComparisonRef.current);
      svg.selectAll("*").remove();
      
      const container = methodComparisonRef.current.parentElement;
      const width = Math.max(container ? container.offsetWidth : 800, 400);
      const height = 150;
      const margin = { top: 20, right: 30, bottom: 40, left: 110 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      // Set SVG dimensions explicitly
      svg.attr("width", width)
         .attr("height", height)
         .attr("viewBox", `0 0 ${width} ${height}`)
         .attr("preserveAspectRatio", "xMidYMid meet")
         .style("display", "block");
      
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Scales
    const x = d3.scaleLinear()
      .range([0, innerWidth]);
    
    const y = d3.scaleBand()
      .domain(['Wald', 'Wilson', 'Agresti-Coull'])
      .range([0, innerHeight])
      .padding(0.3);
    
    // Axes
    g.append("g").attr("class", "x-axis").attr("transform", `translate(0,${innerHeight})`);
    g.append("g").attr("class", "y-axis");
    
    // Interval groups
    g.append("g").attr("class", "intervals");
    
    scalesRef.current.methodComparison = { g, x, y, innerWidth, innerHeight };
    
    }, 100); // 100ms delay
    
    return () => clearTimeout(timer);
  }, []);
  
  // Update method comparison
  useEffect(() => {
    if (!scalesRef.current.methodComparison) return;
    
    // Small delay to ensure initialization completes first
    const timer = setTimeout(() => {
      const { g, x, y } = scalesRef.current.methodComparison;
      const { waldCI, wilsonCI, agrestiCI, p } = calculations;
    
    const data = [
      { method: 'Wald', ci: waldCI, color: proportionTheme.colors.primary },
      { method: 'Wilson', ci: wilsonCI, color: proportionTheme.colors.secondary },
      { method: 'Agresti-Coull', ci: agrestiCI, color: proportionTheme.colors.variation }
    ];
    
    // Update scale
    const allBounds = data.flatMap(d => [d.ci.lower, d.ci.upper]);
    x.domain([Math.min(...allBounds) - 0.02, Math.max(...allBounds) + 0.02]);
    
    // Update axes
    g.select(".x-axis")
      .transition()
      .duration(300)
      .call(d3.axisBottom(x).tickFormat(d => `${(d * 100).toFixed(0)}%`));
    
    g.select(".y-axis")
      .call(d3.axisLeft(y));
    
    // Update intervals
    const intervals = g.select(".intervals").selectAll("g.interval").data(data);
    
    const intervalEnter = intervals.enter().append("g").attr("class", "interval");
    
    // CI lines
    intervalEnter.append("line").attr("class", "ci-line");
    intervalEnter.append("circle").attr("class", "point-estimate");
    
    // Update all
    intervals.merge(intervalEnter).each(function(d) {
      const group = d3.select(this);
      
      group.select(".ci-line")
        .transition()
        .duration(300)
        .attr("x1", x(d.ci.lower))
        .attr("x2", x(d.ci.upper))
        .attr("y1", y(d.method) + y.bandwidth() / 2)
        .attr("y2", y(d.method) + y.bandwidth() / 2)
        .attr("stroke", d.color)
        .attr("stroke-width", 3)
        .style("opacity", d.method === (ciMethod === 'wald' ? 'Wald' : ciMethod === 'wilson' ? 'Wilson' : 'Agresti-Coull') ? 1 : 0.3);
      
      group.select(".point-estimate")
        .transition()
        .duration(300)
        .attr("cx", x(p))
        .attr("cy", y(d.method) + y.bandwidth() / 2)
        .attr("r", 4)
        .attr("fill", d.color)
        .style("opacity", d.method === (ciMethod === 'wald' ? 'Wald' : ciMethod === 'wilson' ? 'Wilson' : 'Agresti-Coull') ? 1 : 0.3);
    });
    
    intervals.exit().remove();
    
    }, 150); // Small delay for initial render
    
    return () => clearTimeout(timer);
  }, [calculations, ciMethod]);
  
  // Simulate sampling
  const runSimulation = useCallback(() => {
    setIsSimulating(true);
    const samples = [];
    let currentIndex = 0;
    
    const simulate = () => {
      if (currentIndex >= 20) {
        setIsSimulating(false);
        return;
      }
      
      // Generate sample based on scenario
      let successes;
      if (scenario === 'election') {
        successes = d3.randomBinomial(sampleSize, calculations.p)();
      } else if (scenario === 'quality') {
        successes = d3.randomBinomial(sampleSize, calculations.p)();
      } else {
        successes = d3.randomBinomial(sampleSize, calculations.p)();
      }
      
      const sample = {
        id: currentIndex,
        successes,
        p: successes / sampleSize,
        ci: ciMethods[ciMethod](successes / sampleSize, sampleSize, calculations.z)
      };
      
      samples.push(sample);
      setSimulationData([...samples]);
      setCurrentSample(sample);
      
      currentIndex++;
      setTimeout(simulate, 200);
    };
    
    simulate();
  }, [scenario, sampleSize, calculations, ciMethod]);
  
  // Apply scenario presets
  const applyScenarioPreset = useCallback((scenarioType) => {
    setScenario(scenarioType);
    
    switch (scenarioType) {
      case 'election':
        setSampleSize(1000);
        setObservedCount(520);
        setConfidenceLevel(0.95);
        setCiMethod('wilson');
        break;
      case 'quality':
        setSampleSize(500);
        setObservedCount(10); // 10 defects
        setConfidenceLevel(0.99);
        setCiMethod('wilson');
        break;
      case 'testing':
        setSampleSize(2000);
        setObservedCount(220); // 11% conversion
        setConfidenceLevel(0.95);
        setCiMethod('agresti');
        setConversionA(0.10);
        setConversionB(0.12);
        break;
    }
  }, []);
  
  return (
    <VisualizationContainer
      title="Proportion Estimation Studio"
      description="Apply confidence intervals to real-world proportion problems"
      className="bg-neutral-900"
    >
      <div className="space-y-6">
        {/* Scenario selector */}
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => applyScenarioPreset('election')}
            className={cn(
              buttonStyles.scenario,
              scenario === 'election' && "border-orange-500 bg-gradient-to-br from-orange-900/20 to-neutral-700"
            )}
          >
            <div className="flex items-start gap-3">
              <Vote className={cn(
                "w-8 h-8 mt-1 transition-colors",
                scenario === 'election' ? "text-orange-400" : "text-neutral-400"
              )} />
              <div>
                <h3 className="font-semibold text-white mb-1">Election Polling</h3>
                <p className="text-sm text-neutral-400">
                  Estimate candidate support with margin of error
                </p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => applyScenarioPreset('quality')}
            className={cn(
              buttonStyles.scenario,
              scenario === 'quality' && "border-green-500 bg-gradient-to-br from-green-900/20 to-neutral-700"
            )}
          >
            <div className="flex items-start gap-3">
              <Package className={cn(
                "w-8 h-8 mt-1 transition-colors",
                scenario === 'quality' ? "text-green-400" : "text-neutral-400"
              )} />
              <div>
                <h3 className="font-semibold text-white mb-1">Quality Control</h3>
                <p className="text-sm text-neutral-400">
                  Monitor defect rates in production
                </p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => applyScenarioPreset('testing')}
            className={cn(
              buttonStyles.scenario,
              scenario === 'testing' && "border-purple-500 bg-gradient-to-br from-purple-900/20 to-neutral-700"
            )}
          >
            <div className="flex items-start gap-3">
              <FlaskConical className={cn(
                "w-8 h-8 mt-1 transition-colors",
                scenario === 'testing' ? "text-purple-400" : "text-neutral-400"
              )} />
              <div>
                <h3 className="font-semibold text-white mb-1">A/B Testing</h3>
                <p className="text-sm text-neutral-400">
                  Compare conversion rates between versions
                </p>
              </div>
            </div>
          </button>
        </div>
        
        {/* Main visualization */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VisualizationSection 
              title="Interactive Proportion Estimation"
              className="bg-neutral-800"
            >
              <GraphContainer height="400px">
                <svg ref={pollRef} style={{ width: "100%", height: "100%", display: "block" }} />
              </GraphContainer>
              
              {/* Results summary */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-900/20 to-pink-900/20 rounded-lg p-3 border border-orange-500/30">
                  <div className="text-xs text-neutral-400 mb-1">Point Estimate</div>
                  <div className="text-xl font-mono text-orange-400 font-bold">
                    {(calculations.p * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-3 border border-purple-500/30">
                  <div className="text-xs text-neutral-400 mb-1">Margin of Error</div>
                  <div className="text-xl font-mono text-purple-400 font-bold">
                    ±{(calculations.marginOfError * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 rounded-lg p-3 border border-pink-500/30">
                  <div className="text-xs text-neutral-400 mb-1">{confidenceLevel * 100}% CI</div>
                  <div className="text-xl font-mono text-pink-400 font-bold">
                    [{(calculations.currentCI.lower * 100).toFixed(1)}, {(calculations.currentCI.upper * 100).toFixed(1)}]%
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className={buttonStyles.primary}
                >
                  <BarChart3 className="w-4 h-4 mr-2 inline" />
                  {isSimulating ? "Simulating..." : "Simulate Sampling"}
                </button>
                
                {/* Normal approximation check */}
                <div className={cn(
                  "px-3 py-2 rounded-lg text-sm",
                  calculations.normalApproxValid
                    ? "bg-green-900/20 border border-green-500/30 text-green-400"
                    : "bg-red-900/20 border border-red-500/30 text-red-400"
                )}>
                  {calculations.normalApproxValid ? (
                    <>✓ Normal approx valid (np={calculations.np.toFixed(0)}, nq={calculations.nq.toFixed(0)})</>
                  ) : (
                    <>⚠ Normal approx invalid (np={calculations.np.toFixed(0)}, nq={calculations.nq.toFixed(0)})</>
                  )}
                </div>
              </div>
            </VisualizationSection>
            
            {/* CI Method Comparison */}
            <VisualizationSection 
              title="Confidence Interval Methods"
              className="bg-neutral-800 mt-6"
            >
              <GraphContainer height="150px">
                <svg ref={methodComparisonRef} style={{ width: "100%", height: "100%", display: "block" }} />
              </GraphContainer>
              
              <div className="mt-4 grid grid-cols-3 gap-3">
                {['wald', 'wilson', 'agresti'].map(method => (
                  <button
                    key={method}
                    onClick={() => setCiMethod(method)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      ciMethod === method
                        ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                        : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                    )}
                  >
                    {method === 'wald' ? 'Wald (Simple)' : 
                     method === 'wilson' ? 'Wilson (Recommended)' : 
                     'Agresti-Coull'}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-neutral-900 rounded-lg text-sm text-neutral-300">
                <p className="font-medium text-white mb-1">Method Selection Guide:</p>
                <ul className="space-y-1">
                  <li>• <span className="text-orange-400">Wald</span>: Simple but can give impossible values near 0 or 1</li>
                  <li>• <span className="text-purple-400">Wilson</span>: Best overall performance, especially for small n or extreme p</li>
                  <li>• <span className="text-pink-400">Agresti-Coull</span>: Good alternative, adds pseudo-observations</li>
                </ul>
              </div>
            </VisualizationSection>
          </div>
          
          <div className="space-y-4">
            {/* Controls */}
            <ControlPanel className="bg-neutral-800">
              <h3 className="text-lg font-semibold text-white mb-4">Parameters</h3>
              
              <ControlGroup label="Sample Size">
                <RangeSlider
                  value={sampleSize}
                  onChange={setSampleSize}
                  min={50}
                  max={5000}
                  step={50}
                  gradient="from-orange-500 to-purple-500"
                />
              </ControlGroup>
              
              <ControlGroup label={scenario === 'quality' ? 'Defects Found' : 'Successes'}>
                <RangeSlider
                  value={observedCount}
                  onChange={setObservedCount}
                  min={0}
                  max={sampleSize}
                  step={1}
                  gradient="from-purple-500 to-pink-500"
                />
              </ControlGroup>
              
              <ControlGroup label="Confidence Level">
                <select
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(parseFloat(e.target.value))}
                  className="w-full bg-neutral-700 rounded px-3 py-2 text-white"
                >
                  <option value={0.90}>90%</option>
                  <option value={0.95}>95%</option>
                  <option value={0.99}>99%</option>
                </select>
              </ControlGroup>
              
              {/* Scenario-specific controls */}
              {scenario === 'testing' && (
                <div className="mt-4 pt-4 border-t border-neutral-700">
                  <h4 className="text-sm font-medium text-white mb-3">A/B Test Rates</h4>
                  <ControlGroup label="Version A Rate">
                    <RangeSlider
                      value={conversionA}
                      onChange={setConversionA}
                      min={0.01}
                      max={0.30}
                      step={0.01}
                      gradient="from-orange-500 to-pink-500"
                    />
                  </ControlGroup>
                  <ControlGroup label="Version B Rate">
                    <RangeSlider
                      value={conversionB}
                      onChange={setConversionB}
                      min={0.01}
                      max={0.30}
                      step={0.01}
                      gradient="from-purple-500 to-pink-500"
                    />
                  </ControlGroup>
                </div>
              )}
            </ControlPanel>
            
            {/* Formula display */}
            <div className="bg-neutral-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Current Formula</h3>
              <div className="bg-neutral-900 rounded-lg p-3">
                <div className="text-center">
                  {ciMethod === 'wald' 
                    ? `\\[\\hat{p} \\pm z_{\\alpha/2} \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}\\]`
                    : ciMethod === 'wilson'
                    ? `\\[\\frac{\\hat{p} + \\frac{z^2}{2n} \\pm z\\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n} + \\frac{z^2}{4n^2}}}{1 + \\frac{z^2}{n}}\\]`
                    : `\\[\\tilde{p} \\pm z_{\\alpha/2} \\sqrt{\\frac{\\tilde{p}(1-\\tilde{p})}{\\tilde{n}}}\\]`}
                </div>
              </div>
            </div>
            
            {/* Insights */}
            <div className="bg-gradient-to-br from-orange-900/20 to-purple-900/20 rounded-lg p-4 border border-orange-500/30">
              <h3 className="text-lg font-semibold text-orange-400 mb-3">
                {scenario === 'election' ? 'Polling Insights' :
                 scenario === 'quality' ? 'Quality Insights' :
                 'Testing Insights'}
              </h3>
              
              <div className="space-y-2 text-sm text-neutral-300">
                {scenario === 'election' && (
                  <>
                    <p>• A 3% margin of error requires n ≈ 1,067 (95% CI)</p>
                    <p>• Polls near 50/50 have the largest margin of error</p>
                    <p>• Multiple polls can be combined for better precision</p>
                  </>
                )}
                {scenario === 'quality' && (
                  <>
                    <p>• Zero defects doesn't mean perfect quality</p>
                    <p>• Use "Rule of 3": If 0 defects in n items, true rate ≤ 3/n</p>
                    <p>• Consider acceptance sampling standards</p>
                  </>
                )}
                {scenario === 'testing' && (
                  <>
                    <p>• Check if CIs overlap before claiming significance</p>
                    <p>• Consider practical vs statistical significance</p>
                    <p>• Account for multiple testing if running many tests</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Sample size guidance */}
        <div className="bg-neutral-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-400" />
            Sample Size Requirements for Proportions
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Quick Reference (95% CI)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-neutral-700">
                  <span className="text-neutral-400">±1% margin:</span>
                  <span className="font-mono text-orange-400">n ≈ 9,604</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-700">
                  <span className="text-neutral-400">±2% margin:</span>
                  <span className="font-mono text-orange-400">n ≈ 2,401</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-700">
                  <span className="text-neutral-400">±3% margin:</span>
                  <span className="font-mono text-orange-400">n ≈ 1,067</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-700">
                  <span className="text-neutral-400">±5% margin:</span>
                  <span className="font-mono text-orange-400">n ≈ 384</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Formula</h4>
              <div className="bg-neutral-900 rounded-lg p-4">
                <div className="text-center">
                  {`\\[n = \\frac{z^2 \\cdot p(1-p)}{E^2}\\]`}
                </div>
                <p className="text-sm text-neutral-400 mt-3">
                  Where E is the desired margin of error. Use p = 0.5 for maximum n when proportion is unknown.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Common mistakes */}
        <div className="bg-red-900/20 rounded-lg p-6 border border-red-500/30">
          <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Common Mistakes to Avoid
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm text-neutral-300">
            <div>
              <h4 className="font-medium text-white mb-2">In Polling</h4>
              <ul className="space-y-1">
                <li>• Ignoring non-response bias</li>
                <li>• Not accounting for undecided voters</li>
                <li>• Misinterpreting margin of error as maximum error</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">In Quality Control</h4>
              <ul className="space-y-1">
                <li>• Using normal approximation for rare events</li>
                <li>• Not considering lot-to-lot variation</li>
                <li>• Ignoring inspection errors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}