'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';
import { VisualizationContainer, VisualizationSection, ControlPanel, ControlGroup, GraphContainer } from '@/components/ui/VisualizationContainer';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { cn } from '@/lib/utils';
import { Calculator, TrendingUp, DollarSign, Target, Trophy, Zap } from 'lucide-react';

// Beautiful gradient theme
const sampleSizeTheme = {
  colors: {
    sample: '#f97316',        // Orange
    error: '#ec4899',         // Pink  
    confidence: '#8b5cf6',    // Purple
    cost: '#10b981',          // Green
    optimal: '#3b82f6',       // Blue
    background: '#1f2937',
    grid: '#374151',
    text: '#ffffff'
  },
  gradients: {
    surface: ['#f97316', '#ec4899', '#8b5cf6'], // Orange → Pink → Purple
    cost: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    optimal: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  }
};

// Critical z-values for common confidence levels
const zValues = {
  0.90: 1.645,
  0.95: 1.96,
  0.99: 2.576
};

// Button styles
const buttonStyles = {
  scenario: cn(
    "w-full px-4 py-3 rounded-lg text-left transition-all duration-300",
    "bg-neutral-700 hover:bg-neutral-600",
    "border-2 border-transparent hover:border-orange-500/50"
  ),
  calculate: cn(
    "px-6 py-3 rounded-lg font-medium transition-all duration-300 transform",
    "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600",
    "text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
  )
};

export default function SampleSizeLaboratory() {
  // Parameters for means
  const [marginError, setMarginError] = useState(5);
  const [sigma, setSigma] = useState(15);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  
  // Parameters for proportions
  const [proportionError, setProportionError] = useState(0.03);
  const [estimatedP, setEstimatedP] = useState(0.5);
  
  // Cost analysis
  const [costPerUnit, setCostPerUnit] = useState(10);
  const [fixedCost, setFixedCost] = useState(1000);
  
  // State
  const [calculationType, setCalculationType] = useState('mean'); // 'mean' or 'proportion'
  const [showCostAnalysis, setShowCostAnalysis] = useState(true);
  const [achievements, setAchievements] = useState([]);
  
  // Refs
  const marginErrorRef = useRef(null);
  const costAnalysisRef = useRef(null);
  const tradeoffRef = useRef(null);
  
  // Calculate sample sizes
  const calculations = useMemo(() => {
    const z = zValues[confidenceLevel] || 1.96;
    
    if (calculationType === 'mean') {
      const n = Math.ceil(Math.pow(z * sigma / marginError, 2));
      const totalCost = fixedCost + n * costPerUnit;
      
      // Calculate for different scenarios
      const scenarios = [];
      for (let e = 1; e <= 20; e += 0.5) {
        const sampleSize = Math.ceil(Math.pow(z * sigma / e, 2));
        scenarios.push({
          error: e,
          n: sampleSize,
          cost: fixedCost + sampleSize * costPerUnit
        });
      }
      
      return {
        n,
        z,
        formula: `n = \\left(\\frac{z \\cdot \\sigma}{E}\\right)^2`,
        totalCost,
        scenarios
      };
    } else {
      // Proportion calculation
      const p = estimatedP;
      const n = Math.ceil(z * z * p * (1 - p) / (proportionError * proportionError));
      const totalCost = fixedCost + n * costPerUnit;
      
      // Calculate for different scenarios
      const scenarios = [];
      for (let e = 0.01; e <= 0.10; e += 0.005) {
        const sampleSize = Math.ceil(z * z * p * (1 - p) / (e * e));
        scenarios.push({
          error: e,
          n: sampleSize,
          cost: fixedCost + sampleSize * costPerUnit
        });
      }
      
      return {
        n,
        z,
        formula: `n = \\frac{z^2 \\cdot p(1-p)}{E^2}`,
        totalCost,
        scenarios
      };
    }
  }, [marginError, sigma, confidenceLevel, proportionError, estimatedP, calculationType, costPerUnit, fixedCost]);
  
  // Initialize margin of error visualization
  useEffect(() => {
    const svg = d3.select(marginErrorRef.current);
    svg.selectAll("*").remove();
    
    const width = marginErrorRef.current.clientWidth;
    const height = 250;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create gradient
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "error-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");
    
    gradient.append("stop").attr("offset", "0%").attr("stop-color", sampleSizeTheme.colors.sample);
    gradient.append("stop").attr("offset", "50%").attr("stop-color", sampleSizeTheme.colors.error);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", sampleSizeTheme.colors.confidence);
    
    // Scales
    const x = d3.scaleLinear().range([0, innerWidth]);
    const y = d3.scaleLinear().range([innerHeight, 0]);
    
    // Axes groups
    g.append("g").attr("class", "x-axis").attr("transform", `translate(0,${innerHeight})`);
    g.append("g").attr("class", "y-axis");
    
    // Path group
    g.append("path").attr("class", "error-curve");
    
    // Current point
    g.append("circle").attr("class", "current-point");
    
    // Store scales
    marginErrorRef.current.scales = { x, y, g, innerWidth, innerHeight };
    
  }, []);
  
  // Update margin of error visualization
  useEffect(() => {
    if (!marginErrorRef.current.scales) return;
    
    const { x, y, g, innerHeight } = marginErrorRef.current.scales;
    const { scenarios } = calculations;
    
    // Update scales
    x.domain(d3.extent(scenarios, d => d.error));
    y.domain([0, d3.max(scenarios, d => d.n) * 1.1]);
    
    // Update axes
    g.select(".x-axis")
      .transition()
      .duration(300)
      .call(d3.axisBottom(x).ticks(8))
      .append("text")
      .attr("x", innerHeight / 2)
      .attr("y", 40)
      .attr("fill", sampleSizeTheme.colors.text)
      .style("text-anchor", "middle")
      .text(calculationType === 'mean' ? "Margin of Error" : "Margin of Error (%)");
    
    g.select(".y-axis")
      .transition()
      .duration(300)
      .call(d3.axisLeft(y).ticks(6))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -innerHeight / 2)
      .attr("fill", sampleSizeTheme.colors.text)
      .style("text-anchor", "middle")
      .text("Required Sample Size");
    
    // Update curve
    const line = d3.line()
      .x(d => x(d.error))
      .y(d => y(d.n))
      .curve(d3.curveBasis);
    
    g.select(".error-curve")
      .datum(scenarios)
      .transition()
      .duration(500)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "url(#error-gradient)")
      .attr("stroke-width", 3);
    
    // Update current point
    const currentError = calculationType === 'mean' ? marginError : proportionError * 100;
    g.select(".current-point")
      .transition()
      .duration(300)
      .attr("cx", x(currentError))
      .attr("cy", y(calculations.n))
      .attr("r", 8)
      .attr("fill", sampleSizeTheme.colors.sample)
      .attr("stroke", sampleSizeTheme.colors.background)
      .attr("stroke-width", 3);
    
  }, [calculations, calculationType, marginError, proportionError]);
  
  // Initialize cost analysis
  useEffect(() => {
    if (!showCostAnalysis) return;
    
    const svg = d3.select(costAnalysisRef.current);
    svg.selectAll("*").remove();
    
    const width = costAnalysisRef.current.clientWidth;
    const height = 200;
    const margin = { top: 30, right: 80, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleLinear().range([0, innerWidth]);
    const y1 = d3.scaleLinear().range([innerHeight, 0]);
    const y2 = d3.scaleLinear().range([innerHeight, 0]);
    
    // Axes groups
    g.append("g").attr("class", "x-axis").attr("transform", `translate(0,${innerHeight})`);
    g.append("g").attr("class", "y1-axis");
    g.append("g").attr("class", "y2-axis").attr("transform", `translate(${innerWidth},0)`);
    
    // Lines
    g.append("path").attr("class", "cost-line");
    g.append("path").attr("class", "precision-line");
    
    // Store scales
    costAnalysisRef.current.scales = { x, y1, y2, g, innerWidth, innerHeight };
    
  }, [showCostAnalysis]);
  
  // Update cost analysis
  useEffect(() => {
    if (!showCostAnalysis || !costAnalysisRef.current.scales) return;
    
    const { x, y1, y2, g, innerWidth, innerHeight } = costAnalysisRef.current.scales;
    const { scenarios } = calculations;
    
    // Update scales
    x.domain([0, d3.max(scenarios, d => d.n)]);
    y1.domain([0, d3.max(scenarios, d => d.cost)]);
    y2.domain([0, d3.max(scenarios, d => d.error)]);
    
    // Update axes
    g.select(".x-axis")
      .call(d3.axisBottom(x).ticks(6));
    
    g.select(".y1-axis")
      .call(d3.axisLeft(y1).ticks(5).tickFormat(d => `$${d3.format(",.0f")(d)}`))
      .selectAll("text")
      .style("fill", sampleSizeTheme.colors.cost);
    
    g.select(".y2-axis")
      .call(d3.axisRight(y2).ticks(5))
      .selectAll("text")
      .style("fill", sampleSizeTheme.colors.error);
    
    // Update lines
    const costLine = d3.line()
      .x(d => x(d.n))
      .y(d => y1(d.cost))
      .curve(d3.curveBasis);
    
    const precisionLine = d3.line()
      .x(d => x(d.n))
      .y(d => y2(d.error))
      .curve(d3.curveBasis);
    
    g.select(".cost-line")
      .datum(scenarios)
      .attr("d", costLine)
      .attr("fill", "none")
      .attr("stroke", sampleSizeTheme.colors.cost)
      .attr("stroke-width", 2);
    
    g.select(".precision-line")
      .datum(scenarios)
      .attr("d", precisionLine)
      .attr("fill", "none")
      .attr("stroke", sampleSizeTheme.colors.error)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,3");
    
  }, [calculations, showCostAnalysis]);
  
  // Check for achievements
  useEffect(() => {
    const newAchievements = [];
    
    if (calculations.n === 384 && !achievements.includes('classic')) {
      newAchievements.push('classic');
    }
    
    if (calculations.n > 1000 && !achievements.includes('large')) {
      newAchievements.push('large');
    }
    
    if (Math.abs(calculations.n - 100) < 5 && !achievements.includes('century')) {
      newAchievements.push('century');
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  }, [calculations.n, achievements]);
  
  // Apply scenario
  const applyScenario = useCallback((scenario) => {
    switch (scenario) {
      case 'election':
        setCalculationType('proportion');
        setEstimatedP(0.5);
        setProportionError(0.03);
        setConfidenceLevel(0.95);
        setCostPerUnit(5);
        setFixedCost(5000);
        break;
      case 'quality':
        setCalculationType('mean');
        setSigma(0.1);
        setMarginError(0.02);
        setConfidenceLevel(0.99);
        setCostPerUnit(20);
        setFixedCost(500);
        break;
      case 'clinical':
        setCalculationType('mean');
        setSigma(20);
        setMarginError(5);
        setConfidenceLevel(0.95);
        setCostPerUnit(100);
        setFixedCost(10000);
        break;
    }
  }, []);
  
  return (
    <VisualizationContainer
      title="Sample Size Laboratory"
      description="Calculate optimal sample sizes and explore the trade-offs between precision and cost"
      className="bg-neutral-900"
    >
      <div className="space-y-6">
        {/* Main calculation area */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Margin of Error vs Sample Size */}
          <div className="lg:col-span-2">
            <VisualizationSection 
              title="Margin of Error vs. Sample Size"
              className="bg-neutral-800"
            >
              <GraphContainer height="250px">
                <svg ref={marginErrorRef} className="w-full h-full" />
              </GraphContainer>
              
              {/* Formula display */}
              <div className="mt-4 p-4 bg-neutral-900 rounded-lg">
                <div className="text-center">
                  {`\\[${calculations.formula} = \\frac{(${calculations.z.toFixed(3)})^2 \\times ${
                    calculationType === 'mean' 
                      ? `(${sigma})^2` 
                      : `${estimatedP} \\times ${(1-estimatedP).toFixed(2)}`
                  }}{${
                    calculationType === 'mean' 
                      ? `(${marginError})^2` 
                      : `(${proportionError})^2`
                  }} = ${calculations.n}\\]`}
                </div>
              </div>
              
              {/* Results display */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-900/20 to-pink-900/20 rounded-lg p-4 border border-orange-500/30">
                  <div className="text-sm text-neutral-400 mb-1">Required n</div>
                  <div className="text-2xl font-mono text-orange-400 font-bold">
                    {calculations.n.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-500/30">
                  <div className="text-sm text-neutral-400 mb-1">Total Cost</div>
                  <div className="text-2xl font-mono text-purple-400 font-bold">
                    ${calculations.totalCost.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-500/30">
                  <div className="text-sm text-neutral-400 mb-1">Cost per Unit</div>
                  <div className="text-2xl font-mono text-green-400 font-bold">
                    ${costPerUnit}
                  </div>
                </div>
              </div>
            </VisualizationSection>
            
            {/* Cost Analysis */}
            {showCostAnalysis && (
              <VisualizationSection 
                title="Cost vs. Precision Trade-off"
                className="bg-neutral-800 mt-6"
              >
                <GraphContainer height="200px">
                  <svg ref={costAnalysisRef} className="w-full h-full" />
                </GraphContainer>
                
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-green-500" />
                      <span className="text-neutral-400">Total Cost</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-pink-500" style={{ borderTop: '2px dashed' }} />
                      <span className="text-neutral-400">Margin of Error</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCostAnalysis(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    Hide
                  </button>
                </div>
              </VisualizationSection>
            )}
          </div>
          
          {/* Controls and scenarios */}
          <div className="space-y-4">
            {/* Calculation type toggle */}
            <div className="bg-neutral-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Calculation Type</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCalculationType('mean')}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all",
                    calculationType === 'mean'
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                      : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                  )}
                >
                  <Calculator className="w-4 h-4 inline mr-2" />
                  Means
                </button>
                <button
                  onClick={() => setCalculationType('proportion')}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all",
                    calculationType === 'proportion'
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                      : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                  )}
                >
                  <Target className="w-4 h-4 inline mr-2" />
                  Proportions
                </button>
              </div>
            </div>
            
            {/* Parameters */}
            <ControlPanel className="bg-neutral-800">
              <h3 className="text-lg font-semibold text-white mb-4">Parameters</h3>
              
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
              
              {calculationType === 'mean' ? (
                <>
                  <ControlGroup label="Margin of Error (E)">
                    <RangeSlider
                      value={marginError}
                      onChange={setMarginError}
                      min={1}
                      max={20}
                      step={0.5}
                      gradient="from-orange-500 to-pink-500"
                    />
                  </ControlGroup>
                  
                  <ControlGroup label="Population SD (σ)">
                    <RangeSlider
                      value={sigma}
                      onChange={setSigma}
                      min={1}
                      max={50}
                      step={1}
                      gradient="from-purple-500 to-pink-500"
                    />
                  </ControlGroup>
                </>
              ) : (
                <>
                  <ControlGroup label="Margin of Error">
                    <RangeSlider
                      value={proportionError}
                      onChange={setProportionError}
                      min={0.01}
                      max={0.10}
                      step={0.005}
                      gradient="from-orange-500 to-pink-500"
                    />
                    <span className="text-sm text-orange-400 font-mono">
                      {(proportionError * 100).toFixed(1)}%
                    </span>
                  </ControlGroup>
                  
                  <ControlGroup label="Estimated p">
                    <RangeSlider
                      value={estimatedP}
                      onChange={setEstimatedP}
                      min={0.1}
                      max={0.9}
                      step={0.05}
                      gradient="from-purple-500 to-pink-500"
                    />
                  </ControlGroup>
                </>
              )}
              
              {/* Cost parameters */}
              <div className="mt-4 pt-4 border-t border-neutral-700">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  Cost Analysis
                </h4>
                
                <ControlGroup label="Cost per Unit">
                  <RangeSlider
                    value={costPerUnit}
                    onChange={setCostPerUnit}
                    min={1}
                    max={200}
                    step={5}
                    gradient="from-green-500 to-emerald-500"
                  />
                </ControlGroup>
                
                <ControlGroup label="Fixed Cost">
                  <RangeSlider
                    value={fixedCost}
                    onChange={setFixedCost}
                    min={0}
                    max={20000}
                    step={500}
                    gradient="from-green-500 to-emerald-500"
                  />
                </ControlGroup>
              </div>
            </ControlPanel>
            
            {/* Practical scenarios */}
            <div className="bg-neutral-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Practical Scenarios
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => applyScenario('election')}
                  className={buttonStyles.scenario}
                >
                  <div className="font-medium text-white">Election Polling</div>
                  <div className="text-sm text-neutral-400">±3% margin, 95% confidence</div>
                </button>
                
                <button
                  onClick={() => applyScenario('quality')}
                  className={buttonStyles.scenario}
                >
                  <div className="font-medium text-white">Quality Control</div>
                  <div className="text-sm text-neutral-400">Tight tolerances, 99% confidence</div>
                </button>
                
                <button
                  onClick={() => applyScenario('clinical')}
                  className={buttonStyles.scenario}
                >
                  <div className="font-medium text-white">Clinical Trial</div>
                  <div className="text-sm text-neutral-400">Medical study requirements</div>
                </button>
              </div>
            </div>
            
            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-lg p-4 border border-yellow-500/30">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Discoveries
                </h3>
                
                <div className="space-y-2 text-sm">
                  {achievements.includes('classic') && (
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">🎯</span>
                      <span className="text-neutral-300">Found the classic n=384!</span>
                    </div>
                  )}
                  {achievements.includes('large') && (
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">📊</span>
                      <span className="text-neutral-300">Large sample advocate (n&gt;1000)</span>
                    </div>
                  )}
                  {achievements.includes('century') && (
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">💯</span>
                      <span className="text-neutral-300">Century sample (n≈100)</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Key insights */}
        <div className="bg-gradient-to-br from-orange-900/20 to-purple-900/20 rounded-lg p-6 border border-orange-500/30">
          <h3 className="text-xl font-semibold text-orange-400 mb-4">The Square Root Law</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-white mb-2">Key Insight</h4>
              <p className="text-neutral-300">
                To cut the margin of error in half, you need <span className="text-pink-400 font-bold">4 times</span> as many observations! 
                This is because n is proportional to 1/E².
              </p>
            </div>
            <div>
              <h4 className="text-lg font-medium text-white mb-2">Example</h4>
              <div className="text-sm text-neutral-300 space-y-1">
                <div>• E = 10 → n = 96</div>
                <div>• E = 5 → n = 384 (4× larger)</div>
                <div>• E = 2.5 → n = 1,536 (16× larger)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}