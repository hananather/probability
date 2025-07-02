"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';
import BackToHub from '../ui/BackToHub';
import { MathematicalDiscoveries, useDiscoveries } from '@/components/ui/MathematicalDiscoveries';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Info, Calculator, BarChart, BookOpen } from 'lucide-react';

const colorScheme = createColorScheme('hypothesis');

// Discovery definitions
const discoveryDefinitions = [
  {
    id: 'hypothesis-setup',
    title: 'Hypothesis Framework',
    description: 'H₀: μ = 40 (old process) vs H₁: μ > 40 (improvement)',
    category: 'concept'
  },
  {
    id: 'test-statistic',
    title: 'Test Statistic Formula',
    description: 'Standardizing the sample mean to make decisions',
    formula: 'Z = \\frac{\\bar{X} - \\mu_0}{\\sigma/\\sqrt{n}}',
    category: 'formula'
  },
  {
    id: 'critical-region',
    title: 'Critical Region',
    description: 'Values of Z that lead to rejecting H₀',
    category: 'concept'
  },
  {
    id: 'p-value',
    title: 'P-Value Interpretation',
    description: 'Probability of observing data as extreme if H₀ is true',
    category: 'concept'
  },
  {
    id: 'decision-rule',
    title: 'Decision Rule',
    description: 'Reject H₀ if |Z| > critical value or p-value < α',
    category: 'pattern'
  },
  {
    id: 'type-errors',
    title: 'Type I and II Errors',
    description: 'Understanding the risks in hypothesis testing',
    category: 'concept'
  }
];

// 6-step hypothesis testing framework
const HYPOTHESIS_STEPS = [
  { id: 'state', title: 'State Hypotheses', icon: '📝' },
  { id: 'level', title: 'Set α Level', icon: '🎯' },
  { id: 'statistic', title: 'Choose Test Statistic', icon: '📊' },
  { id: 'critical', title: 'Find Critical Value', icon: '🔍' },
  { id: 'calculate', title: 'Calculate Test Statistic', icon: '🧮' },
  { id: 'decide', title: 'Make Decision', icon: '⚖️' }
];

export default function TestForMeanKnownVariance() {
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [sampleData, setSampleData] = useState([
    42.5, 39.8, 40.3, 43.1, 39.6, 41.0,
    39.9, 42.1, 40.7, 41.6, 42.1, 40.8
  ]);
  const [hypothesisType, setHypothesisType] = useState('right');
  const [significanceLevel, setSignificanceLevel] = useState(0.05);
  const [mu0] = useState(40);
  const [sigma] = useState(1.2);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showDecisionTable, setShowDecisionTable] = useState(false);
  const [manualProgression, setManualProgression] = useState(true);
  
  // Discovery tracking
  const { discoveries, markDiscovered } = useDiscoveries(discoveryDefinitions);
  
  // Calculations
  const n = sampleData.length;
  const sampleMean = useMemo(() => 
    sampleData.reduce((sum, x) => sum + x, 0) / n, [sampleData]
  );
  
  const testStatistic = useMemo(() => 
    (sampleMean - mu0) / (sigma / Math.sqrt(n)), [sampleMean, mu0, sigma, n]
  );
  
  const criticalValues = useMemo(() => {
    switch (hypothesisType) {
      case 'left':
        return { 
          lower: jStat.normal.inv(significanceLevel, 0, 1), 
          upper: null 
        };
      case 'right':
        return { 
          lower: null, 
          upper: jStat.normal.inv(1 - significanceLevel, 0, 1) 
        };
      case 'two':
        const z = jStat.normal.inv(1 - significanceLevel/2, 0, 1);
        return { lower: -z, upper: z };
    }
  }, [hypothesisType, significanceLevel]);
  
  const pValue = useMemo(() => {
    switch (hypothesisType) {
      case 'left':
        return jStat.normal.cdf(testStatistic, 0, 1);
      case 'right':
        return 1 - jStat.normal.cdf(testStatistic, 0, 1);
      case 'two':
        return 2 * (1 - jStat.normal.cdf(Math.abs(testStatistic), 0, 1));
    }
  }, [testStatistic, hypothesisType]);
  
  const decision = useMemo(() => {
    if (hypothesisType === 'left' && criticalValues.lower && testStatistic < criticalValues.lower) {
      return 'reject';
    } else if (hypothesisType === 'right' && criticalValues.upper && testStatistic > criticalValues.upper) {
      return 'reject';
    } else if (hypothesisType === 'two' && criticalValues.upper && Math.abs(testStatistic) > criticalValues.upper) {
      return 'reject';
    }
    return 'fail to reject';
  }, [testStatistic, criticalValues, hypothesisType]);
  
  // Progress calculation
  const progress = (currentStep / (HYPOTHESIS_STEPS.length - 1)) * 100;
  
  // Auto-discover on step change
  useEffect(() => {
    if (currentStep === 0 && !discoveries.find(d => d.id === 'hypothesis-setup')?.discovered) {
      markDiscovered('hypothesis-setup');
    } else if (currentStep === 4 && !discoveries.find(d => d.id === 'test-statistic')?.discovered) {
      markDiscovered('test-statistic');
    } else if (currentStep === 5 && !discoveries.find(d => d.id === 'decision-rule')?.discovered) {
      markDiscovered('decision-rule');
    }
  }, [currentStep, discoveries, markDiscovered]);

  return (
    <VisualizationContainer
      title="Hypothesis Testing: Mean with Known Variance"
    >
      {/* Back to Hub Button */}
      <BackToHub chapter={6} />
      
      {/* Progress and Controls */}
      <div className="mb-6 space-y-4">
        {/* 6-Step Framework Progress */}
        <div className="bg-neutral-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-neutral-300">Hypothesis Testing Framework</h3>
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-400">Manual progression</label>
              <input
                type="checkbox"
                checked={manualProgression}
                onChange={(e) => setManualProgression(e.target.checked)}
                className="w-4 h-4 rounded"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {HYPOTHESIS_STEPS.map((step, idx) => (
              <div
                key={step.id}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-center cursor-pointer transition-all duration-300",
                  idx === currentStep 
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" 
                    : idx < currentStep
                      ? "bg-green-600/20 text-green-400 border border-green-600/30"
                      : "bg-neutral-700 text-neutral-400"
                )}
                onClick={() => manualProgression && setCurrentStep(idx)}
              >
                <div className="text-lg mb-1">{step.icon}</div>
                <div className="text-xs font-medium">{step.title}</div>
              </div>
            ))}
          </div>
          <ProgressBar value={progress} className="mt-3" />
        </div>
        
        {/* Quick Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ControlGroup label="Hypothesis Type">
            <select
              value={hypothesisType}
              onChange={(e) => setHypothesisType(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="left">Left-tailed (μ {"<"} μ₀)</option>
              <option value="right">Right-tailed (μ {">"} μ₀)</option>
              <option value="two">Two-tailed (μ ≠ μ₀)</option>
            </select>
          </ControlGroup>
          
          <ControlGroup label="Significance Level (α)">
            <select
              value={significanceLevel.toString()}
              onChange={(e) => setSignificanceLevel(parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="0.01">0.01</option>
              <option value="0.05">0.05</option>
              <option value="0.10">0.10</option>
            </select>
          </ControlGroup>
          
          <div className="flex items-end gap-2">
            <Button
              onClick={() => setShowCalculator(!showCalculator)}
              variant="outline"
              className="flex-1"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculator
            </Button>
            <Button
              onClick={() => setShowDecisionTable(!showDecisionTable)}
              variant="outline"
              className="flex-1"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Decision Rules
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Step Content */}
        {currentStep === 0 && <StepStateHypotheses />}
        {currentStep === 1 && <StepSetAlpha />}
        {currentStep === 2 && <StepChooseStatistic />}
        {currentStep === 3 && <StepFindCritical />}
        {currentStep === 4 && <StepCalculateStatistic />}
        {currentStep === 5 && <StepMakeDecision />}
        
        {/* Calculator Panel */}
        {showCalculator && (
          <Card className="bg-neutral-800/50 border-purple-600/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Step-by-Step Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CalculatorPanel 
                sampleData={sampleData}
                mu0={mu0}
                sigma={sigma}
                sampleMean={sampleMean}
                testStatistic={testStatistic}
                n={n}
              />
            </CardContent>
          </Card>
        )}
        
        {/* Decision Rules Table */}
        {showDecisionTable && (
          <Card className="bg-neutral-800/50 border-purple-600/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Decision Rules Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DecisionRulesTable />
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Mathematical Discoveries */}
      {discoveries.filter(d => d.discovered).length > 0 && (
        <MathematicalDiscoveries 
          discoveries={discoveries}
          title="Concepts Discovered"
          className="mt-6"
        />
      )}
    </VisualizationContainer>
  );
  
  // Step 1: State Hypotheses
  function StepStateHypotheses() {
    return (
      <GraphContainer>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">
              Step 1: State the Hypotheses
            </h3>
            <p className="text-neutral-300 mb-6">
              We want to test if our new manufacturing process produces stronger components than the old process (μ₀ = 40 units).
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-blue-900/20 border-blue-600/30">
              <CardHeader>
                <CardTitle className="text-lg text-blue-400">Null Hypothesis (H₀)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono text-center text-white mb-2">
                  μ = {mu0}
                </div>
                <p className="text-sm text-neutral-300">
                  The new process has the same mean strength as the old process.
                  This is what we assume to be true until proven otherwise.
                </p>
              </CardContent>
            </Card>
            
            <Card className={cn(
              "border-green-600/30",
              hypothesisType === 'right' ? "bg-green-900/20" : 
              hypothesisType === 'left' ? "bg-red-900/20" : "bg-purple-900/20"
            )}>
              <CardHeader>
                <CardTitle className="text-lg text-green-400">Alternative Hypothesis (H₁)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono text-center text-white mb-2">
                  {hypothesisType === 'right' && `μ > ${mu0}`}
                  {hypothesisType === 'left' && `μ < ${mu0}`}
                  {hypothesisType === 'two' && `μ ≠ ${mu0}`}
                </div>
                <p className="text-sm text-neutral-300">
                  {hypothesisType === 'right' && "The new process produces stronger components (improvement)."}
                  {hypothesisType === 'left' && "The new process produces weaker components (deterioration)."}
                  {hypothesisType === 'two' && "The new process is different (could be better or worse)."}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-neutral-800/50 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-neutral-300">
              <p className="font-semibold mb-1">Why start with the null?</p>
              <p>We always assume no effect (null) until we have strong evidence against it. This protects us from making false claims.</p>
            </div>
          </div>
          
          {!manualProgression && (
            <div className="flex justify-center">
              <Button 
                onClick={() => setCurrentStep(1)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Continue to Step 2 →
              </Button>
            </div>
          )}
        </div>
      </GraphContainer>
    );
  }
  
  // Step 2: Set Alpha Level
  function StepSetAlpha() {
    const svgRef = useRef(null);
    
    useEffect(() => {
      if (!svgRef.current) return;
      
      const svg = d3.select(svgRef.current);
      const { width } = svgRef.current.getBoundingClientRect();
      const height = 300;
      const margin = { top: 40, right: 40, bottom: 60, left: 60 };
      
      svg.selectAll("*").remove();
      svg.attr("viewBox", `0 0 ${width} ${height}`);
      
      // Scales
      const xScale = d3.scaleLinear()
        .domain([-4, 4])
        .range([margin.left, width - margin.right]);
        
      const yScale = d3.scaleLinear()
        .domain([0, 0.45])
        .range([height - margin.bottom, margin.top]);
      
      // Normal curve
      const normalCurve = d3.range(-4, 4.01, 0.01).map(z => ({
        x: z,
        y: jStat.normal.pdf(z, 0, 1)
      }));
      
      // Draw axes
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(9))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .text("Standard Normal Distribution");
      
      // Draw curve
      svg.append("path")
        .datum(normalCurve)
        .attr("fill", "none")
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(d => xScale(d.x))
          .y(d => yScale(d.y))
          .curve(d3.curveNatural)
        );
      
      // Shade rejection regions based on hypothesis type
      const rejectRegion = normalCurve.filter(d => {
        if (hypothesisType === 'right') return d.x >= criticalValues.upper;
        if (hypothesisType === 'left') return d.x <= criticalValues.lower;
        if (hypothesisType === 'two') return Math.abs(d.x) >= criticalValues.upper;
        return false;
      });
      
      svg.append("path")
        .datum(rejectRegion)
        .attr("fill", "#ef4444")
        .attr("fill-opacity", 0.3)
        .attr("d", d3.area()
          .x(d => xScale(d.x))
          .y0(yScale(0))
          .y1(d => yScale(d.y))
          .curve(d3.curveNatural)
        );
      
      // Label alpha regions
      if (hypothesisType === 'right' && criticalValues.upper) {
        svg.append("text")
          .attr("x", xScale(criticalValues.upper + 0.5))
          .attr("y", yScale(0.1))
          .attr("text-anchor", "middle")
          .attr("fill", "#ef4444")
          .style("font-size", "14px")
          .style("font-weight", "bold")
          .text(`α = ${significanceLevel}`);
      }
      
    }, [significanceLevel, hypothesisType, criticalValues]);
    
    return (
      <GraphContainer>
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-white mb-2">
              Step 2: Set the Significance Level (α)
            </h3>
            <p className="text-neutral-300">
              How much risk of Type I error (false positive) are we willing to accept?
            </p>
          </div>
          
          <svg ref={svgRef} style={{ width: "100%", height: 300 }} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className={cn(
              "cursor-pointer transition-all duration-300",
              significanceLevel === 0.01 ? "bg-purple-900/30 border-purple-600" : "bg-neutral-800/50"
            )}
            onClick={() => setSignificanceLevel(0.01)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-mono text-purple-400">α = 0.01</div>
                <div className="text-sm text-neutral-300 mt-2">Very Conservative</div>
                <div className="text-xs text-neutral-400 mt-1">1% chance of false positive</div>
              </CardContent>
            </Card>
            
            <Card className={cn(
              "cursor-pointer transition-all duration-300",
              significanceLevel === 0.05 ? "bg-purple-900/30 border-purple-600" : "bg-neutral-800/50"
            )}
            onClick={() => setSignificanceLevel(0.05)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-mono text-purple-400">α = 0.05</div>
                <div className="text-sm text-neutral-300 mt-2">Standard Choice</div>
                <div className="text-xs text-neutral-400 mt-1">5% chance of false positive</div>
              </CardContent>
            </Card>
            
            <Card className={cn(
              "cursor-pointer transition-all duration-300",
              significanceLevel === 0.10 ? "bg-purple-900/30 border-purple-600" : "bg-neutral-800/50"
            )}
            onClick={() => setSignificanceLevel(0.10)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-mono text-purple-400">α = 0.10</div>
                <div className="text-sm text-neutral-300 mt-2">Less Conservative</div>
                <div className="text-xs text-neutral-400 mt-1">10% chance of false positive</div>
              </CardContent>
            </Card>
          </div>
          
          {!manualProgression && (
            <div className="flex justify-center mt-6">
              <Button 
                onClick={() => setCurrentStep(2)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Continue to Step 3 →
              </Button>
            </div>
          )}
        </div>
      </GraphContainer>
    );
  }
  
  // Step 3: Choose Test Statistic
  function StepChooseStatistic() {
    useEffect(() => {
      if (!discoveries.find(d => d.id === 'test-statistic')?.discovered) {
        markDiscovered('test-statistic');
      }
    }, []);
    
    return (
      <GraphContainer>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">
              Step 3: Choose the Test Statistic
            </h3>
            <p className="text-neutral-300 mb-6">
              Since we know the population standard deviation (σ = {sigma}), we use the Z-statistic.
            </p>
          </div>
          
          <Card className="bg-blue-900/20 border-blue-600/30 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-mono text-blue-400 mb-4">
                  Z = (X̄ - μ₀) / (σ/√n)
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-neutral-700">
                  <span className="text-neutral-400">X̄ (sample mean)</span>
                  <span className="font-mono text-white">The average of our sample data</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-700">
                  <span className="text-neutral-400">μ₀ (null hypothesis mean)</span>
                  <span className="font-mono text-white">{mu0} units</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-700">
                  <span className="text-neutral-400">σ (population std dev)</span>
                  <span className="font-mono text-white">{sigma} units</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-neutral-400">n (sample size)</span>
                  <span className="font-mono text-white">{n} observations</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-neutral-800/50 rounded-lg">
                <p className="text-sm text-neutral-300">
                  <span className="font-semibold text-white">Why Z?</span> The Z-statistic converts our sample mean 
                  to a standard scale, allowing us to use the standard normal distribution for decision making.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {!manualProgression && (
            <div className="flex justify-center mt-6">
              <Button 
                onClick={() => setCurrentStep(3)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Continue to Step 4 →
              </Button>
            </div>
          )}
        </div>
      </GraphContainer>
    );
  }
  
  // Step 4: Find Critical Value
  function StepFindCritical() {
    useEffect(() => {
      if (!discoveries.find(d => d.id === 'critical-region')?.discovered) {
        markDiscovered('critical-region');
      }
    }, []);
    
    return (
      <GraphContainer>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">
              Step 4: Find the Critical Value(s)
            </h3>
            <p className="text-neutral-300 mb-6">
              Based on our significance level and hypothesis type, we determine the rejection boundary.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="bg-purple-900/20 border-purple-600/30">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-sm text-neutral-400 mb-2">For α = {significanceLevel} and {hypothesisType}-tailed test:</div>
                  <div className="text-3xl font-mono text-purple-400">
                    {hypothesisType === 'right' && `Z > ${criticalValues.upper?.toFixed(3)}`}
                    {hypothesisType === 'left' && `Z < ${criticalValues.lower?.toFixed(3)}`}
                    {hypothesisType === 'two' && `|Z| > ${criticalValues.upper?.toFixed(3)}`}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-xs text-neutral-400 mb-1">Left-tailed</div>
                    <div className="p-3 bg-neutral-800/50 rounded">
                      <div className="text-2xl mb-1">👈</div>
                      <div className="text-xs font-mono">Z {"<"} -z_α</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-neutral-400 mb-1">Two-tailed</div>
                    <div className="p-3 bg-neutral-800/50 rounded">
                      <div className="text-2xl mb-1">👈👉</div>
                      <div className="text-xs font-mono">|Z| {">"} z_α/2</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-neutral-400 mb-1">Right-tailed</div>
                    <div className="p-3 bg-neutral-800/50 rounded">
                      <div className="text-2xl mb-1">👉</div>
                      <div className="text-xs font-mono">Z {">"} z_α</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-neutral-300">
                <p>Critical values come from the standard normal table. They mark the boundary between 
                the "likely under H₀" region and the "unlikely under H₀" (rejection) region.</p>
              </div>
            </div>
          </div>
          
          {!manualProgression && (
            <div className="flex justify-center mt-6">
              <Button 
                onClick={() => setCurrentStep(4)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Continue to Step 5 →
              </Button>
            </div>
          )}
        </div>
      </GraphContainer>
    );
  }
  
  // Step 5: Calculate Test Statistic
  function StepCalculateStatistic() {
    return (
      <GraphContainer>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">
              Step 5: Calculate the Test Statistic
            </h3>
            <p className="text-neutral-300 mb-6">
              Now we compute the Z-statistic using our sample data.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {/* Sample Data Display */}
            <Card className="bg-neutral-800/50 mb-6">
              <CardHeader>
                <CardTitle className="text-base">Sample Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {sampleData.map((value, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-xs text-neutral-400 mb-1">x_{idx+1}</div>
                      <div className="font-mono text-sm bg-neutral-700 rounded px-2 py-1">
                        {value.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center pt-4 border-t border-neutral-700">
                  <span className="text-neutral-400">Sample mean: </span>
                  <span className="font-mono text-green-400 text-lg">X̄ = {sampleMean.toFixed(3)}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Calculation Steps */}
            <Card className="bg-blue-900/20 border-blue-600/30">
              <CardHeader>
                <CardTitle className="text-base">Calculation Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-neutral-800/50 rounded">
                  <div className="text-sm text-neutral-400 mb-1">Step 1: Calculate standard error</div>
                  <div className="font-mono text-white">SE = σ/√n = {sigma}/√{n} = {(sigma/Math.sqrt(n)).toFixed(3)}</div>
                </div>
                
                <div className="p-3 bg-neutral-800/50 rounded">
                  <div className="text-sm text-neutral-400 mb-1">Step 2: Calculate difference from null</div>
                  <div className="font-mono text-white">X̄ - μ₀ = {sampleMean.toFixed(3)} - {mu0} = {(sampleMean - mu0).toFixed(3)}</div>
                </div>
                
                <div className="p-3 bg-neutral-800/50 rounded">
                  <div className="text-sm text-neutral-400 mb-1">Step 3: Compute Z-statistic</div>
                  <div className="font-mono text-white">
                    Z = {(sampleMean - mu0).toFixed(3)} / {(sigma/Math.sqrt(n)).toFixed(3)} = 
                    <span className="text-green-400 text-lg ml-2">{testStatistic.toFixed(3)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {!manualProgression && (
            <div className="flex justify-center mt-6">
              <Button 
                onClick={() => setCurrentStep(5)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Continue to Final Step →
              </Button>
            </div>
          )}
        </div>
      </GraphContainer>
    );
  }
  
  // Step 6: Make Decision
  function StepMakeDecision() {
    const svgRef = useRef(null);
    
    useEffect(() => {
      if (!svgRef.current) return;
      
      const svg = d3.select(svgRef.current);
      const { width } = svgRef.current.getBoundingClientRect();
      const height = 350;
      const margin = { top: 40, right: 40, bottom: 80, left: 60 };
      
      svg.selectAll("*").remove();
      svg.attr("viewBox", `0 0 ${width} ${height}`);
      
      // Scales
      const xScale = d3.scaleLinear()
        .domain([-4, 4])
        .range([margin.left, width - margin.right]);
        
      const yScale = d3.scaleLinear()
        .domain([0, 0.45])
        .range([height - margin.bottom, margin.top]);
      
      // Normal curve
      const normalCurve = d3.range(-4, 4.01, 0.01).map(z => ({
        x: z,
        y: jStat.normal.pdf(z, 0, 1)
      }));
      
      // Draw axes
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(9))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 50)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .text("Z-score");
      
      // Draw curve
      svg.append("path")
        .datum(normalCurve)
        .attr("fill", "#3b82f6")
        .attr("fill-opacity", 0.2)
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(d => xScale(d.x))
          .y(d => yScale(d.y))
          .curve(d3.curveNatural)
        );
      
      // Shade rejection region
      const rejectRegion = normalCurve.filter(d => {
        if (hypothesisType === 'right') return d.x >= criticalValues.upper;
        if (hypothesisType === 'left') return d.x <= criticalValues.lower;
        if (hypothesisType === 'two') return Math.abs(d.x) >= criticalValues.upper;
        return false;
      });
      
      svg.append("path")
        .datum(rejectRegion)
        .attr("fill", "#ef4444")
        .attr("fill-opacity", 0.4)
        .attr("d", d3.area()
          .x(d => xScale(d.x))
          .y0(yScale(0))
          .y1(d => yScale(d.y))
          .curve(d3.curveNatural)
        );
      
      // Critical value line(s)
      if (criticalValues.upper) {
        svg.append("line")
          .attr("x1", xScale(criticalValues.upper))
          .attr("x2", xScale(criticalValues.upper))
          .attr("y1", yScale(0))
          .attr("y2", yScale(0.4))
          .attr("stroke", "#ef4444")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
          
        svg.append("text")
          .attr("x", xScale(criticalValues.upper))
          .attr("y", margin.top - 10)
          .attr("text-anchor", "middle")
          .attr("fill", "#ef4444")
          .style("font-size", "12px")
          .text(`z = ${criticalValues.upper.toFixed(3)}`);
      }
      
      if (criticalValues.lower) {
        svg.append("line")
          .attr("x1", xScale(criticalValues.lower))
          .attr("x2", xScale(criticalValues.lower))
          .attr("y1", yScale(0))
          .attr("y2", yScale(0.4))
          .attr("stroke", "#ef4444")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
      }
      
      // Test statistic line
      svg.append("line")
        .attr("x1", xScale(testStatistic))
        .attr("x2", xScale(testStatistic))
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("stroke", "#10b981")
        .attr("stroke-width", 4)
        .style("filter", "drop-shadow(0 0 8px #10b981)")
        .transition()
        .duration(1000)
        .attr("y2", yScale(0.35));
        
      svg.append("text")
        .attr("x", xScale(testStatistic))
        .attr("y", yScale(0.38))
        .attr("text-anchor", "middle")
        .attr("fill", "#10b981")
        .style("font-weight", "bold")
        .style("opacity", 0)
        .text(`Z = ${testStatistic.toFixed(3)}`)
        .transition()
        .delay(1000)
        .duration(500)
        .style("opacity", 1);
      
      // Decision text
      const decisionText = decision === 'reject' ? 'REJECT H₀' : 'FAIL TO REJECT H₀';
      const decisionColor = decision === 'reject' ? '#ef4444' : '#3b82f6';
      
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", decisionColor)
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .style("opacity", 0)
        .text(decisionText)
        .transition()
        .delay(1500)
        .duration(800)
        .style("opacity", 1);
        
    }, [testStatistic, criticalValues, hypothesisType, decision]);
    
    useEffect(() => {
      if (!discoveries.find(d => d.id === 'p-value')?.discovered) {
        markDiscovered('p-value');
      }
    }, []);
    
    return (
      <GraphContainer>
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">
              Step 6: Make a Decision
            </h3>
            <p className="text-neutral-300 mb-6">
              Compare the test statistic to the critical value(s) and make your decision.
            </p>
          </div>
          
          <svg ref={svgRef} style={{ width: "100%", height: 350 }} />
          
          {/* Decision Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-purple-900/20 border-purple-600/30">
              <CardHeader>
                <CardTitle className="text-base">Critical Value Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Test Statistic:</span>
                    <span className="font-mono text-green-400">Z = {testStatistic.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Critical Value:</span>
                    <span className="font-mono text-red-400">
                      {hypothesisType === 'right' && `z = ${criticalValues.upper?.toFixed(3)}`}
                      {hypothesisType === 'left' && `z = ${criticalValues.lower?.toFixed(3)}`}
                      {hypothesisType === 'two' && `±z = ±${criticalValues.upper?.toFixed(3)}`}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-neutral-700">
                    <p className="text-sm">
                      {decision === 'reject' ? (
                        <span className="text-red-400 font-semibold">
                          Test statistic falls in rejection region → Reject H₀
                        </span>
                      ) : (
                        <span className="text-blue-400 font-semibold">
                          Test statistic does not fall in rejection region → Fail to reject H₀
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-900/20 border-purple-600/30">
              <CardHeader>
                <CardTitle className="text-base">P-Value Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">P-value:</span>
                    <span className="font-mono text-purple-400">{pValue.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Significance Level:</span>
                    <span className="font-mono text-purple-400">α = {significanceLevel}</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-700">
                    <p className="text-sm">
                      {pValue < significanceLevel ? (
                        <span className="text-red-400 font-semibold">
                          p-value {"<"} α → Reject H₀
                        </span>
                      ) : (
                        <span className="text-blue-400 font-semibold">
                          p-value {">"} α → Fail to reject H₀
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Conclusion */}
          <Card className={cn(
            "border",
            decision === 'reject' ? "bg-green-900/20 border-green-600/30" : "bg-blue-900/20 border-blue-600/30"
          )}>
            <CardContent className="p-6 text-center">
              <h4 className="text-lg font-semibold text-white mb-3">
                {decision === 'reject' ? '✅ Evidence Supports Change!' : '❌ Insufficient Evidence'}
              </h4>
              <p className="text-neutral-300">
                {decision === 'reject' 
                  ? `With ${(1-significanceLevel)*100}% confidence, we conclude that the new manufacturing process produces stronger components than the old process (μ > ${mu0}).`
                  : `We do not have sufficient evidence to conclude that the new process is different from the old process. The observed difference could be due to random chance.`
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </GraphContainer>
    );
  }
}

// Calculator Panel Component
function CalculatorPanel({ sampleData, mu0, sigma, sampleMean, testStatistic, n }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-neutral-400">Sample Mean (X̄)</label>
          <div className="font-mono text-lg text-green-400">{sampleMean.toFixed(4)}</div>
        </div>
        <div>
          <label className="text-sm text-neutral-400">Null Mean (μ₀)</label>
          <div className="font-mono text-lg text-blue-400">{mu0}</div>
        </div>
        <div>
          <label className="text-sm text-neutral-400">Population Std Dev (σ)</label>
          <div className="font-mono text-lg text-purple-400">{sigma}</div>
        </div>
        <div>
          <label className="text-sm text-neutral-400">Sample Size (n)</label>
          <div className="font-mono text-lg text-purple-400">{n}</div>
        </div>
      </div>
      
      <div className="border-t border-neutral-700 pt-4">
        <h4 className="text-sm font-semibold text-neutral-300 mb-3">Calculation Steps:</h4>
        <div className="space-y-2 text-sm font-mono">
          <div className="p-2 bg-neutral-800 rounded">
            1. SE = σ/√n = {sigma}/√{n} = {(sigma/Math.sqrt(n)).toFixed(4)}
          </div>
          <div className="p-2 bg-neutral-800 rounded">
            2. X̄ - μ₀ = {sampleMean.toFixed(4)} - {mu0} = {(sampleMean - mu0).toFixed(4)}
          </div>
          <div className="p-2 bg-neutral-800 rounded">
            3. Z = {(sampleMean - mu0).toFixed(4)} / {(sigma/Math.sqrt(n)).toFixed(4)} = 
            <span className="text-green-400 font-bold ml-2">{testStatistic.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Decision Rules Table Component
function DecisionRulesTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-700">
            <th className="text-left py-2 px-4 text-neutral-300">Test Type</th>
            <th className="text-left py-2 px-4 text-neutral-300">H₀</th>
            <th className="text-left py-2 px-4 text-neutral-300">H₁</th>
            <th className="text-left py-2 px-4 text-neutral-300">Reject H₀ if:</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-neutral-800">
            <td className="py-3 px-4 text-neutral-100">Right-tailed</td>
            <td className="py-3 px-4 font-mono">μ = μ₀</td>
            <td className="py-3 px-4 font-mono text-green-400">μ {">"} μ₀</td>
            <td className="py-3 px-4 font-mono">Z {">"} z_α</td>
          </tr>
          <tr className="border-b border-neutral-800">
            <td className="py-3 px-4 text-neutral-100">Left-tailed</td>
            <td className="py-3 px-4 font-mono">μ = μ₀</td>
            <td className="py-3 px-4 font-mono text-red-400">μ {"<"} μ₀</td>
            <td className="py-3 px-4 font-mono">Z {"<"} -z_α</td>
          </tr>
          <tr className="border-b border-neutral-800">
            <td className="py-3 px-4 text-neutral-100">Two-tailed</td>
            <td className="py-3 px-4 font-mono">μ = μ₀</td>
            <td className="py-3 px-4 font-mono text-purple-400">μ ≠ μ₀</td>
            <td className="py-3 px-4 font-mono">|Z| {">"} z_{"{α/2}"}</td>
          </tr>
        </tbody>
      </table>
      
      <div className="mt-4 p-3 bg-neutral-800/50 rounded text-sm text-neutral-300">
        <p className="font-semibold mb-1">Remember:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use right-tailed when testing for increase/improvement</li>
          <li>Use left-tailed when testing for decrease/deterioration</li>
          <li>Use two-tailed when testing for any difference</li>
        </ul>
      </div>
    </div>
  );
}