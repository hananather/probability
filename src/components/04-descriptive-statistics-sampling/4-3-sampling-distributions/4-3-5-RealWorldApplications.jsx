"use client";

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { GraphContainer } from "@/components/ui/VisualizationContainer";
import { Button } from "@/components/ui/button";
import { useSafeMathJax } from "@/utils/mathJaxFix";
import { colorSchemes } from "@/lib/design-system";
import { Globe, BarChart3, TestTube, Award, TrendingUp } from "lucide-react";
import { RangeSlider } from "@/components/ui/RangeSlider";

const RealWorldApplications = () => {
  const [scenario, setScenario] = useState('polling');
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Polling scenario state
  const [pollSize, setPollSize] = useState(1000);
  const [trueSupport, setTrueSupport] = useState(0.52);
  const [pollResults, setPollResults] = useState([]);
  
  // Quality control state
  const [batchSize, setBatchSize] = useState(50);
  const [defectRate, setDefectRate] = useState(0.02);
  const [qualityResults, setQualityResults] = useState([]);
  
  // A/B testing state
  const [testGroupSize, setTestGroupSize] = useState(1000);
  const [conversionA, setConversionA] = useState(0.10);
  const [conversionB, setConversionB] = useState(0.12);
  const [abResults, setAbResults] = useState([]);
  
  const pollingRef = useRef(null);
  const qualityRef = useRef(null);
  const abTestRef = useRef(null);

  // Simulate polling
  const runPollSimulation = async () => {
    setIsSimulating(true);
    const newResults = [];
    
    for (let i = 0; i < 20; i++) {
      // Simulate a poll
      let supportCount = 0;
      for (let j = 0; j < pollSize; j++) {
        if (Math.random() < trueSupport) supportCount++;
      }
      const proportion = supportCount / pollSize;
      newResults.push(proportion);
      setPollResults([...newResults]);
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsSimulating(false);
  };

  // Visualize polling results
  useEffect(() => {
    if (!pollingRef.current || scenario !== 'polling') return;

    const svg = d3.select(pollingRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 60, bottom: 60, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate theoretical margin of error
    const marginOfError = 1.96 * Math.sqrt(trueSupport * (1 - trueSupport) / pollSize);

    // Set up scales
    const x = d3.scaleLinear()
      .domain([trueSupport - 0.1, trueSupport + 0.1])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 10])
      .range([height, 0]);

    // Draw confidence interval
    const ciRect = g.append("rect")
      .attr("x", x(trueSupport - marginOfError))
      .attr("y", 0)
      .attr("width", x(trueSupport + marginOfError) - x(trueSupport - marginOfError))
      .attr("height", height)
      .attr("fill", colorSchemes.inference.primary)
      .attr("opacity", 0.2);

    // Draw true value line
    g.append("line")
      .attr("x1", x(trueSupport))
      .attr("x2", x(trueSupport))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", colorSchemes.inference.secondary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Create histogram if we have results
    if (pollResults.length > 0) {
      const bins = d3.histogram()
        .domain(x.domain())
        .thresholds(20)(pollResults);

      y.domain([0, d3.max(bins, d => d.length)]);

      g.selectAll(".bar")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.x0))
        .attr("y", d => y(d.length))
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("height", d => height - y(d.length))
        .attr("fill", colorSchemes.probability.primary)
        .attr("opacity", 0.7);
    }

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => `${(d * 100).toFixed(0)}%`))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .text("Poll Result (% Support)");

    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .text("Frequency");

    // Add labels
    g.append("text")
      .attr("x", x(trueSupport))
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", colorSchemes.inference.secondary)
      .text("True Support");

    // Add margin of error label
    g.append("text")
      .attr("x", width)
      .attr("y", 20)
      .attr("text-anchor", "end")
      .attr("font-size", "12px")
      .attr("fill", colorSchemes.inference.primary)
      .text(`MOE: ±${(marginOfError * 100).toFixed(1)}%`);

    // Results summary
    if (pollResults.length > 0) {
      const withinMOE = pollResults.filter(p => 
        Math.abs(p - trueSupport) <= marginOfError
      ).length;
      const percentage = (withinMOE / pollResults.length * 100).toFixed(0);
      
      g.append("text")
        .attr("x", width)
        .attr("y", 40)
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .attr("fill", "white")
        .text(`${percentage}% within MOE`);
    }
  }, [scenario, pollResults, pollSize, trueSupport]);

  // Quality Control Visualization
  useEffect(() => {
    if (!qualityRef.current || scenario !== 'quality') return;

    const svg = d3.select(qualityRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;

    // Control chart setup
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate control limits
    const centerLine = defectRate;
    const se = Math.sqrt(defectRate * (1 - defectRate) / batchSize);
    const ucl = centerLine + 3 * se; // Upper control limit
    const lcl = Math.max(0, centerLine - 3 * se); // Lower control limit

    // Scales
    const x = d3.scaleLinear()
      .domain([0, qualityResults.length || 20])
      .range([0, chartWidth]);

    const y = d3.scaleLinear()
      .domain([0, Math.max(0.1, ucl * 1.2)])
      .range([chartHeight, 0]);

    // Draw control limits
    g.append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", y(centerLine))
      .attr("y2", y(centerLine))
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    g.append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", y(ucl))
      .attr("y2", y(ucl))
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    g.append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", y(lcl))
      .attr("y2", y(lcl))
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Plot quality results
    if (qualityResults.length > 0) {
      const line = d3.line()
        .x((d, i) => x(i))
        .y(d => y(d))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(qualityResults)
        .attr("fill", "none")
        .attr("stroke", colorSchemes.descriptive.primary)
        .attr("stroke-width", 2)
        .attr("d", line);

      // Points
      g.selectAll(".quality-point")
        .data(qualityResults)
        .enter().append("circle")
        .attr("class", "quality-point")
        .attr("cx", (d, i) => x(i))
        .attr("cy", d => y(d))
        .attr("r", 4)
        .attr("fill", d => (d > ucl || d < lcl) ? "red" : colorSchemes.descriptive.primary);
    }

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", 40)
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .text("Batch Number");

    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `${(d * 100).toFixed(1)}%`))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -chartHeight / 2)
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .text("Defect Rate");

    // Labels
    g.append("text")
      .attr("x", chartWidth - 5)
      .attr("y", y(ucl))
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("fill", "red")
      .text("UCL");

    g.append("text")
      .attr("x", chartWidth - 5)
      .attr("y", y(centerLine))
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("fill", "white")
      .text("Center");

    g.append("text")
      .attr("x", chartWidth - 5)
      .attr("y", y(lcl))
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("fill", "red")
      .text("LCL");
  }, [scenario, qualityResults, batchSize, defectRate]);

  // A/B Test Visualization
  useEffect(() => {
    if (!abTestRef.current || scenario !== 'abtest') return;

    const svg = d3.select(abTestRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate standard errors
    const seA = Math.sqrt(conversionA * (1 - conversionA) / testGroupSize);
    const seB = Math.sqrt(conversionB * (1 - conversionB) / testGroupSize);
    const seDiff = Math.sqrt(seA * seA + seB * seB);

    // Set up scales
    const x = d3.scaleLinear()
      .domain([-0.05, 0.05])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 50])
      .range([height, 0]);

    // Draw significance region
    const sigRegion = g.append("rect")
      .attr("x", x(-1.96 * seDiff))
      .attr("y", 0)
      .attr("width", x(1.96 * seDiff) - x(-1.96 * seDiff))
      .attr("height", height)
      .attr("fill", "gray")
      .attr("opacity", 0.2);

    // Draw zero line
    g.append("line")
      .attr("x1", x(0))
      .attr("x2", x(0))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // True difference line
    const trueDiff = conversionB - conversionA;
    g.append("line")
      .attr("x1", x(trueDiff))
      .attr("x2", x(trueDiff))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", colorSchemes.inference.secondary)
      .attr("stroke-width", 2);

    // Plot A/B test results
    if (abResults.length > 0) {
      const bins = d3.histogram()
        .domain(x.domain())
        .thresholds(30)(abResults);

      y.domain([0, d3.max(bins, d => d.length)]);

      g.selectAll(".bar")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.x0))
        .attr("y", d => y(d.length))
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("height", d => height - y(d.length))
        .attr("fill", d => {
          const mid = (d.x0 + d.x1) / 2;
          return Math.abs(mid) > 1.96 * seDiff ? 
            colorSchemes.probability.primary : 
            colorSchemes.probability.secondary;
        })
        .attr("opacity", 0.7);
    }

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => `${(d * 100).toFixed(1)}%`))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .text("Difference in Conversion Rates (B - A)");

    g.append("g")
      .call(d3.axisLeft(y));

    // Labels
    g.append("text")
      .attr("x", x(trueDiff))
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", colorSchemes.inference.secondary)
      .text("True Diff");

    // Power calculation
    if (abResults.length > 0) {
      const significant = abResults.filter(d => Math.abs(d) > 1.96 * seDiff).length;
      const power = (significant / abResults.length * 100).toFixed(0);
      
      g.append("text")
        .attr("x", width)
        .attr("y", 20)
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .attr("fill", "white")
        .text(`Power: ${power}%`);
    }
  }, [scenario, abResults, testGroupSize, conversionA, conversionB]);

  // Simulation functions
  const runQualitySimulation = async () => {
    setIsSimulating(true);
    const newResults = [];
    
    for (let i = 0; i < 20; i++) {
      let defects = 0;
      for (let j = 0; j < batchSize; j++) {
        if (Math.random() < defectRate) defects++;
      }
      const proportion = defects / batchSize;
      newResults.push(proportion);
      setQualityResults([...newResults]);
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsSimulating(false);
  };

  const runABTestSimulation = async () => {
    setIsSimulating(true);
    const newResults = [];
    
    for (let i = 0; i < 50; i++) {
      // Simulate group A
      let conversionsA = 0;
      for (let j = 0; j < testGroupSize; j++) {
        if (Math.random() < conversionA) conversionsA++;
      }
      const rateA = conversionsA / testGroupSize;
      
      // Simulate group B
      let conversionsB = 0;
      for (let j = 0; j < testGroupSize; j++) {
        if (Math.random() < conversionB) conversionsB++;
      }
      const rateB = conversionsB / testGroupSize;
      
      newResults.push(rateB - rateA);
      setAbResults([...newResults]);
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    setIsSimulating(false);
  };

  const mathJaxRef = useRef(null);
  useSafeMathJax(mathJaxRef, [scenario]);

  const scenarios = [
    { id: 'polling', name: 'Political Polling', icon: Globe },
    { id: 'quality', name: 'Quality Control', icon: TestTube },
    { id: 'abtest', name: 'A/B Testing', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Real-World Applications</h2>
        
        {/* Scenario selector */}
        <div className="flex gap-2 mb-6">
          {scenarios.map(({ id, name, icon: Icon }) => (
            <Button
              key={id}
              onClick={() => setScenario(id)}
              variant={scenario === id ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {name}
            </Button>
          ))}
        </div>

        {/* Polling Scenario */}
        {scenario === 'polling' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-8 h-8 text-blue-400" />
              <h3 className="text-lg font-semibold">Political Polling: Predicting Elections</h3>
            </div>
            
            <p className="text-gray-300">
              See how polling works and why margins of error exist. Each poll is a sample 
              from the entire voting population.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Poll Size: {pollSize} voters
                </label>
                <RangeSlider
                  value={[pollSize]}
                  onValueChange={(value) => {
                    setPollSize(value[0]);
                    setPollResults([]);
                  }}
                  min={100}
                  max={5000}
                  step={100}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  True Support: {(trueSupport * 100).toFixed(0)}%
                </label>
                <RangeSlider
                  value={[trueSupport]}
                  onValueChange={(value) => {
                    setTrueSupport(value[0]);
                    setPollResults([]);
                  }}
                  min={0.3}
                  max={0.7}
                  step={0.01}
                  className="w-full"
                />
              </div>
            </div>

            <GraphContainer height="450px">
              <svg ref={pollingRef} className="w-full h-full" />
            </GraphContainer>

            <div className="flex gap-4 items-center">
              <Button 
                onClick={runPollSimulation}
                disabled={isSimulating}
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Run 20 Polls
              </Button>
              <Button 
                onClick={() => setPollResults([])}
                variant="outline"
              >
                Reset
              </Button>
            </div>

            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mt-4" ref={mathJaxRef}>
              <p className="text-sm text-blue-300">
                <strong className="text-blue-400">How it works:</strong> The margin of error is 
                {` \\(\\pm 1.96 \\times \\sqrt{\\frac{p(1-p)}{n}}\\)`}. With n = {pollSize} and 
                p ≈ 0.5, that's about ±{(1.96 * Math.sqrt(0.25 / pollSize) * 100).toFixed(1)}%. 
                This is why most political polls use n ≈ 1000 (giving ±3%).
              </p>
            </div>
          </div>
        )}

        {/* Quality Control Scenario */}
        {scenario === 'quality' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <TestTube className="w-8 h-8 text-green-400" />
              <h3 className="text-lg font-semibold">Quality Control: Monitoring Production</h3>
            </div>
            
            <p className="text-gray-300">
              Monitor a production line using control charts. When points fall outside control 
              limits, the process may be out of control.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Batch Size: {batchSize} items
                </label>
                <RangeSlider
                  value={[batchSize]}
                  onValueChange={(value) => {
                    setBatchSize(value[0]);
                    setQualityResults([]);
                  }}
                  min={20}
                  max={200}
                  step={10}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Target Defect Rate: {(defectRate * 100).toFixed(1)}%
                </label>
                <RangeSlider
                  value={[defectRate]}
                  onValueChange={(value) => {
                    setDefectRate(value[0]);
                    setQualityResults([]);
                  }}
                  min={0.001}
                  max={0.1}
                  step={0.001}
                  className="w-full"
                />
              </div>
            </div>

            <GraphContainer height="450px">
              <svg ref={qualityRef} className="w-full h-full" />
            </GraphContainer>

            <div className="flex gap-4 items-center">
              <Button 
                onClick={runQualitySimulation}
                disabled={isSimulating}
                className="flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                Simulate 20 Batches
              </Button>
              <Button 
                onClick={() => setQualityResults([])}
                variant="outline"
              >
                Reset
              </Button>
            </div>

            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 mt-4">
              <p className="text-sm text-green-300">
                <strong className="text-green-400">Control Limits:</strong> Set at ±3 standard 
                errors from the center line. Points outside these limits suggest special cause 
                variation - time to investigate!
              </p>
            </div>
          </div>
        )}

        {/* A/B Testing Scenario */}
        {scenario === 'abtest' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <h3 className="text-lg font-semibold">A/B Testing: Comparing Conversions</h3>
            </div>
            
            <p className="text-gray-300">
              Test whether version B truly performs better than version A, or if the 
              difference is just random variation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Users per Group: {testGroupSize}
                </label>
                <RangeSlider
                  value={[testGroupSize]}
                  onValueChange={(value) => {
                    setTestGroupSize(value[0]);
                    setAbResults([]);
                  }}
                  min={100}
                  max={5000}
                  step={100}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Version A: {(conversionA * 100).toFixed(1)}%
                </label>
                <RangeSlider
                  value={[conversionA]}
                  onValueChange={(value) => {
                    setConversionA(value[0]);
                    setAbResults([]);
                  }}
                  min={0.01}
                  max={0.3}
                  step={0.01}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Version B: {(conversionB * 100).toFixed(1)}%
                </label>
                <RangeSlider
                  value={[conversionB]}
                  onValueChange={(value) => {
                    setConversionB(value[0]);
                    setAbResults([]);
                  }}
                  min={0.01}
                  max={0.3}
                  step={0.01}
                  className="w-full"
                />
              </div>
            </div>

            <GraphContainer height="450px">
              <svg ref={abTestRef} className="w-full h-full" />
            </GraphContainer>

            <div className="flex gap-4 items-center">
              <Button 
                onClick={runABTestSimulation}
                disabled={isSimulating}
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Run 50 Tests
              </Button>
              <Button 
                onClick={() => setAbResults([])}
                variant="outline"
              >
                Reset
              </Button>
            </div>

            <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4 mt-4">
              <p className="text-sm text-purple-300">
                <strong className="text-purple-400">Statistical Significance:</strong> If the 
                difference consistently falls outside the gray "no effect" zone, B is 
                significantly different from A. The true difference is {((conversionB - conversionA) * 100).toFixed(1)}%.
              </p>
            </div>
          </div>
        )}

        {/* Final insights */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-600/30">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-400" />
            Key Takeaways
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-cyan-400">Sampling Distributions Enable:</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Quantifying uncertainty with confidence intervals</li>
                <li>• Making decisions with hypothesis testing</li>
                <li>• Determining required sample sizes</li>
                <li>• Detecting when processes change</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-400">Remember:</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Larger samples → More precision</li>
                <li>• CLT works for any population shape</li>
                <li>• Standard error decreases with √n</li>
                <li>• Real decisions require understanding uncertainty</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealWorldApplications;