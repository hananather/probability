"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { VisualizationContainer, GraphContainer, VisualizationSection } from "../ui/VisualizationContainer";
import { createColorScheme, cn, typography, colors } from "../../lib/design-system";
import { Button } from "../ui/button";
import { RangeSlider } from "../ui/RangeSlider";
import { FlaskConical, TrendingUp, Calculator, Download, Eye, EyeOff, Info } from "lucide-react";
import { useAnimationCleanup } from "@/hooks/useAnimationCleanup";

// Real-world scenarios
const scenarios = [
  {
    id: 'anova',
    name: 'ANOVA Testing',
    description: 'Compare variance between multiple treatment groups',
    icon: FlaskConical,
    color: 'from-blue-500 to-cyan-500',
    example: {
      context: 'Drug efficacy study with 3 treatment groups',
      groups: 3,
      n1: 15,
      n2: 45,
      hypothesis: 'Testing if treatment effects have equal variance'
    }
  },
  {
    id: 'regression',
    name: 'Regression Diagnostics',
    description: 'Test homoscedasticity assumption in regression',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-500',
    example: {
      context: 'Linear regression residual analysis',
      groups: 2,
      n1: 10,
      n2: 50,
      hypothesis: 'Testing if residual variance is constant'
    }
  },
  {
    id: 'quality',
    name: 'Quality Control',
    description: 'Compare process variability between production lines',
    icon: Calculator,
    color: 'from-emerald-500 to-teal-500',
    example: {
      context: 'Manufacturing consistency across two factories',
      groups: 2,
      n1: 25,
      n2: 25,
      hypothesis: 'Testing if production variance is equal'
    }
  }
];

// Power analysis visualization
const PowerAnalysisChart = ({ df1, df2, alpha = 0.05 }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const width = 400;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Calculate power for different effect sizes
    const effectSizes = d3.range(1, 4, 0.1);
    const powerData = effectSizes.map(effect => {
      const criticalValue = jStat.centralF.inv(1 - alpha, df1, df2);
      const ncp = effect * Math.min(df1, df2); // Non-centrality parameter approximation
      
      // Approximate power calculation
      let power = 0;
      if (ncp > 0) {
        // Using normal approximation for simplicity
        const z = (Math.sqrt(2 * ncp) - Math.sqrt(2 * criticalValue)) / Math.sqrt(2);
        power = jStat.normal.cdf(z, 0, 1);
      }
      
      return { effect, power };
    });
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([1, 4])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", "currentColor")
      .style("text-anchor", "middle")
      .text("Effect Size (Variance Ratio)");
    
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(".0%")))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("x", -innerHeight / 2)
      .attr("fill", "currentColor")
      .style("text-anchor", "middle")
      .text("Statistical Power");
    
    // Add grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    // Draw power curve
    const line = d3.line()
      .x(d => xScale(d.effect))
      .y(d => yScale(d.power))
      .curve(d3.curveMonotoneX);
    
    g.append("path")
      .datum(powerData)
      .attr("fill", "none")
      .attr("stroke", "#a78bfa")
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Add 80% power line
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", yScale(0.8))
      .attr("y2", yScale(0.8))
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");
    
    g.append("text")
      .attr("x", innerWidth - 5)
      .attr("y", yScale(0.8) - 5)
      .attr("text-anchor", "end")
      .attr("fill", "#ef4444")
      .attr("font-size", "12px")
      .text("80% Power");
    
  }, [df1, df2, alpha]);
  
  return <svg ref={svgRef} className="w-full" />;
};

// Hypothesis test visualization
const HypothesisTestVisual = ({ fValue, df1, df2, alpha = 0.05 }) => {
  const criticalValue = jStat.centralF.inv(1 - alpha, df1, df2);
  const isRejected = fValue > criticalValue;
  const pValue = 1 - jStat.centralF.cdf(fValue, df1, df2);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
        <span className="text-sm">F-statistic:</span>
        <span className="font-mono text-lg font-bold">{fValue.toFixed(3)}</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
        <span className="text-sm">Critical value (α={alpha}):</span>
        <span className="font-mono">{criticalValue.toFixed(3)}</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
        <span className="text-sm">p-value:</span>
        <span className={cn(
          "font-mono",
          pValue < alpha ? "text-red-400" : "text-green-400"
        )}>
          {pValue.toFixed(4)}
        </span>
      </div>
      <div className={cn(
        "p-4 rounded-lg text-center",
        isRejected 
          ? "bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-600/30"
          : "bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-600/30"
      )}>
        <p className="font-semibold text-lg">
          {isRejected ? "Reject H₀" : "Fail to Reject H₀"}
        </p>
        <p className="text-sm mt-1">
          {isRejected 
            ? "Evidence suggests variances are different"
            : "No evidence that variances differ"
          }
        </p>
      </div>
    </div>
  );
};

const FDistributionMastery = () => {
  // State
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const [sampleSizeN1, setSampleSizeN1] = useState(25);
  const [sampleSizeN2, setSampleSizeN2] = useState(25);
  const [trueVarianceRatio, setTrueVarianceRatio] = useState(1.0);
  const [alpha, setAlpha] = useState(0.05);
  const [simulationRuns, setSimulationRuns] = useState(0);
  const [rejectionCount, setRejectionCount] = useState(0);
  const [fValues, setFValues] = useState([]);
  const [currentFValue, setCurrentFValue] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Refs
  const svgRef = useRef(null);
  const { setCleanInterval, setCleanTimeout } = useAnimationCleanup();
  
  // Calculate degrees of freedom
  const df1 = sampleSizeN1 - 1;
  const df2 = sampleSizeN2 - 1;
  
  // Color scheme
  const colorScheme = createColorScheme('estimation');
  
  // Run single simulation
  const runSimulation = useCallback(() => {
    // Generate samples with specified variance ratio
    const variance1 = trueVarianceRatio;
    const variance2 = 1;
    
    const sample1 = Array.from({ length: sampleSizeN1 }, () => 
      jStat.normal.sample(0, Math.sqrt(variance1))
    );
    const sample2 = Array.from({ length: sampleSizeN2 }, () => 
      jStat.normal.sample(0, Math.sqrt(variance2))
    );
    
    const s1_squared = jStat.variance(sample1, true);
    const s2_squared = jStat.variance(sample2, true);
    const f = s1_squared / s2_squared;
    
    setCurrentFValue(f);
    setFValues(prev => [...prev.slice(-99), f]);
    setSimulationRuns(prev => prev + 1);
    
    // Check if rejected
    const criticalValue = jStat.centralF.inv(1 - alpha, df1, df2);
    if (f > criticalValue) {
      setRejectionCount(prev => prev + 1);
    }
    
    return f;
  }, [sampleSizeN1, sampleSizeN2, trueVarianceRatio, alpha, df1, df2]);
  
  // Run power simulation
  const runPowerSimulation = useCallback(() => {
    setIsSimulating(true);
    setSimulationRuns(0);
    setRejectionCount(0);
    setFValues([]);
    
    let runs = 0;
    let rejections = 0;
    const values = [];
    
    const simulate = () => {
      if (runs < 100) {
        const f = runSimulation();
        values.push(f);
        runs++;
        
        const criticalValue = jStat.centralF.inv(1 - alpha, df1, df2);
        if (f > criticalValue) {
          rejections++;
        }
        
        setSimulationRuns(runs);
        setRejectionCount(rejections);
        setFValues(values);
        
        setCleanTimeout(simulate, 50);
      } else {
        setIsSimulating(false);
      }
    };
    
    simulate();
  }, [runSimulation, alpha, df1, df2, setCleanTimeout]);
  
  // Calculate statistics
  const empiricalPower = simulationRuns > 0 ? rejectionCount / simulationRuns : 0;
  const typeIErrorRate = trueVarianceRatio === 1 ? empiricalPower : null;
  
  // Export results
  const exportResults = () => {
    const results = {
      scenario: selectedScenario.name,
      parameters: {
        n1: sampleSizeN1,
        n2: sampleSizeN2,
        df1,
        df2,
        trueVarianceRatio,
        alpha
      },
      results: {
        simulationRuns,
        rejectionCount,
        empiricalPower,
        typeIErrorRate,
        fValues: fValues.slice(-20) // Last 20 values
      },
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `f-distribution-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 800;
    const height = 400;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    // Gradient background
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "mastery-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#1a0f2e");
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#2d1b4e");
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#mastery-gradient)")
      .attr("opacity", 0.5);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xMax = Math.max(6, d3.max(fValues) || 6, jStat.centralF.inv(0.99, df1, df2));
    const xScale = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, innerWidth]);
    
    let yMax = 0.5;
    if (df1 > 2) {
      const mode = ((df1 - 2) / df1) * (df2 / (df2 + 2));
      yMax = Math.min(2, jStat.centralF.pdf(mode, df1, df2) * 1.2);
    }
    
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0]);
    
    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "currentColor")
      .style("text-anchor", "middle")
      .style("font-weight", "600")
      .text("F-value");
    
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(8))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", "currentColor")
      .style("text-anchor", "middle")
      .style("font-weight", "600")
      .text("Density");
    
    // Add grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.2);
    
    // Draw theoretical F-distribution
    const xValues = d3.range(0.01, xScale.domain()[1], 0.01);
    const curveData = xValues.map(x => ({
      x: x,
      y: jStat.centralF.pdf(x, df1, df2)
    }));
    
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);
    
    // Fill under curve for rejection region
    const criticalValue = jStat.centralF.inv(1 - alpha, df1, df2);
    const rejectionData = curveData.filter(d => d.x >= criticalValue);
    
    if (rejectionData.length > 0) {
      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(innerHeight)
        .y1(d => yScale(d.y))
        .curve(d3.curveMonotoneX);
      
      g.append("path")
        .datum(rejectionData)
        .attr("fill", "#ef4444")
        .attr("opacity", 0.2)
        .attr("d", area);
    }
    
    g.append("path")
      .datum(curveData)
      .attr("fill", "none")
      .attr("stroke", colorScheme.primary)
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Draw critical value line
    if (criticalValue <= xScale.domain()[1]) {
      g.append("line")
        .attr("x1", xScale(criticalValue))
        .attr("x2", xScale(criticalValue))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
      
      g.append("text")
        .attr("x", xScale(criticalValue))
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("fill", "#ef4444")
        .attr("font-size", "12px")
        .attr("font-weight", "600")
        .text(`Critical Value (${criticalValue.toFixed(2)})`);
    }
    
    // Draw histogram if we have data
    if (fValues.length > 0) {
      const histogram = d3.histogram()
        .domain(xScale.domain())
        .thresholds(20);
      
      const bins = histogram(fValues);
      const binWidth = bins.length > 0 && bins[0].x1 !== undefined ? bins[0].x1 - bins[0].x0 : 1;
      const totalArea = fValues.length * binWidth;
      
      g.selectAll(".bar")
        .data(bins)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("y", d => yScale(d.length / totalArea))
        .attr("height", d => innerHeight - yScale(d.length / totalArea))
        .attr("fill", colorScheme.secondary)
        .attr("opacity", 0.6);
    }
    
    // Highlight current F-value
    if (currentFValue) {
      g.append("circle")
        .attr("cx", xScale(currentFValue))
        .attr("cy", innerHeight - 10)
        .attr("r", 6)
        .attr("fill", colorScheme.accent)
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .attr("opacity", 1)
        .transition()
        .delay(1000)
        .duration(500)
        .attr("opacity", 0.5);
    }
    
    // Add annotations
    if (trueVarianceRatio !== 1) {
      g.append("text")
        .attr("x", innerWidth - 10)
        .attr("y", 30)
        .attr("text-anchor", "end")
        .attr("fill", colorScheme.text.secondary)
        .attr("font-size", "14px")
        .text(`True variance ratio: ${trueVarianceRatio.toFixed(1)}`);
    }
    
  }, [fValues, currentFValue, df1, df2, alpha, trueVarianceRatio, colorScheme]);
  
  return (
    <VisualizationContainer
      title="F-Distribution Mastery"
      description="Apply F-distribution to real-world scenarios"
    >
      {/* Scenario selector */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select a Scenario</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map(scenario => {
            const Icon = scenario.icon;
            return (
              <button
                key={scenario.id}
                onClick={() => {
                  setSelectedScenario(scenario);
                  setSampleSizeN1(scenario.example.n1);
                  setSampleSizeN2(scenario.example.n2);
                }}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  selectedScenario.id === scenario.id
                    ? "border-violet-500 bg-gradient-to-br from-violet-900/30 to-purple-900/30"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                )}
              >
                <div className={cn("w-12 h-12 rounded-lg bg-gradient-to-br mb-3 flex items-center justify-center", scenario.color)}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-left">{scenario.name}</h4>
                <p className="text-sm text-gray-400 text-left mt-1">{scenario.description}</p>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Scenario details */}
      <VisualizationSection className="p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <selectedScenario.icon className="w-5 h-5" />
          {selectedScenario.name} Scenario
        </h3>
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Context:</strong> {selectedScenario.example.context}
          </p>
          <p className="text-sm">
            <strong>Hypothesis:</strong> {selectedScenario.example.hypothesis}
          </p>
          <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
            <p className="text-sm font-mono">
              H₀: σ₁² = σ₂² (variances are equal)
            </p>
            <p className="text-sm font-mono">
              H₁: σ₁² ≠ σ₂² (variances are different)
            </p>
          </div>
        </div>
      </VisualizationSection>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main visualization */}
        <div className="lg:col-span-2">
          <GraphContainer height="400px">
            <svg ref={svgRef} className="w-full h-full" />
          </GraphContainer>
          
          {/* Power analysis */}
          {showAdvanced && (
            <VisualizationSection className="p-4 mt-4">
              <h3 className="text-base font-semibold mb-3">Power Analysis</h3>
              <PowerAnalysisChart df1={df1} df2={df2} alpha={alpha} />
              <p className="text-sm text-gray-400 mt-2">
                Shows probability of detecting different variance ratios
              </p>
            </VisualizationSection>
          )}
        </div>
        
        {/* Controls and results */}
        <div className="space-y-4">
          {/* Parameters */}
          <VisualizationSection className="p-4">
            <h3 className="text-base font-semibold mb-3">Test Parameters</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Group 1 Size (n₁ = {sampleSizeN1})
                </label>
                <RangeSlider
                  value={sampleSizeN1}
                  onChange={setSampleSizeN1}
                  min={5}
                  max={50}
                  step={1}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Group 2 Size (n₂ = {sampleSizeN2})
                </label>
                <RangeSlider
                  value={sampleSizeN2}
                  onChange={setSampleSizeN2}
                  min={5}
                  max={50}
                  step={1}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Significance Level (α = {alpha})
                </label>
                <RangeSlider
                  value={alpha}
                  onChange={setAlpha}
                  min={0.01}
                  max={0.1}
                  step={0.01}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  True Variance Ratio ({trueVarianceRatio.toFixed(1)})
                </label>
                <RangeSlider
                  value={trueVarianceRatio}
                  onChange={setTrueVarianceRatio}
                  min={0.5}
                  max={3}
                  step={0.1}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set to 1.0 for equal variances
                </p>
              </div>
            </div>
          </VisualizationSection>
          
          {/* Actions */}
          <VisualizationSection className="p-4">
            <h3 className="text-base font-semibold mb-3">Run Simulation</h3>
            <div className="space-y-2">
              <Button
                onClick={runSimulation}
                disabled={isSimulating}
                className="w-full"
                variant="default"
              >
                Run Single Test
              </Button>
              <Button
                onClick={runPowerSimulation}
                disabled={isSimulating}
                className="w-full"
                variant="secondary"
              >
                Run Power Simulation (100 tests)
              </Button>
              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full"
                variant="outline"
              >
                {showAdvanced ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showAdvanced ? 'Hide' : 'Show'} Advanced Analysis
              </Button>
            </div>
          </VisualizationSection>
          
          {/* Hypothesis test results */}
          {currentFValue && (
            <VisualizationSection className="p-4">
              <h3 className="text-base font-semibold mb-3">Test Results</h3>
              <HypothesisTestVisual
                fValue={currentFValue}
                df1={df1}
                df2={df2}
                alpha={alpha}
              />
            </VisualizationSection>
          )}
          
          {/* Simulation summary */}
          {simulationRuns > 0 && (
            <VisualizationSection className="p-4">
              <h3 className="text-base font-semibold mb-3">Simulation Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tests run:</span>
                  <span className="font-mono">{simulationRuns}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rejections:</span>
                  <span className="font-mono">{rejectionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Empirical power:</span>
                  <span className="font-mono">{(empiricalPower * 100).toFixed(1)}%</span>
                </div>
                {typeIErrorRate !== null && (
                  <div className="flex justify-between">
                    <span>Type I error rate:</span>
                    <span className={cn(
                      "font-mono",
                      Math.abs(typeIErrorRate - alpha) > 0.02 ? "text-yellow-400" : "text-green-400"
                    )}>
                      {(typeIErrorRate * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              
              <Button
                onClick={exportResults}
                className="w-full mt-3"
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            </VisualizationSection>
          )}
          
          {/* Educational insights */}
          <VisualizationSection className="p-4">
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Key Insights
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Larger sample sizes increase test power</p>
              <p>• The F-test is sensitive to non-normality</p>
              <p>• Consider Levene's test for non-normal data</p>
              <p>• Power increases with effect size</p>
            </div>
          </VisualizationSection>
        </div>
      </div>
    </VisualizationContainer>
  );
};

export { FDistributionMastery };