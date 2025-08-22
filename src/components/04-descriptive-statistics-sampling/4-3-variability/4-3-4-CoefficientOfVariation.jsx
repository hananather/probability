"use client";
import React, { useState, useRef, useEffect } from "react";
import { VisualizationContainer, VisualizationSection } from "@/components/ui/VisualizationContainer";
import { Button } from "@/components/ui/button";
import { createColorScheme } from '@/lib/design-system';
import { TrendingUp, ChevronDown, ChevronUp, AlertTriangle, Scale, DollarSign, Activity } from 'lucide-react';
import { useMathJax } from "@/hooks/useMathJax";
import * as d3 from 'd3';

// Chapter 4 color scheme
const colorScheme = createColorScheme('descriptive');

// Example datasets for comparison
const DATASETS = {
  salaries: {
    companyA: { name: "Tech Startup", data: [45, 48, 50, 52, 55], units: "$k", label: "Salary" },
    companyB: { name: "Big Corp", data: [180, 190, 200, 210, 220], units: "$k", label: "Salary" }
  },
  measurements: {
    mice: { name: "Mice", data: [18, 20, 22, 24, 26], units: "g", label: "Weight" },
    elephants: { name: "Elephants", data: [4800, 5000, 5200, 5400, 5600], units: "kg", label: "Weight" }
  },
  temperatures: {
    celsius: { name: "Celsius", data: [18, 20, 22, 24, 26], units: "°C", label: "Temperature" },
    fahrenheit: { name: "Fahrenheit", data: [64.4, 68, 71.6, 75.2, 78.8], units: "°F", label: "Temperature" }
  }
};

const CoefficientOfVariation = () => {
  const [selectedComparison, setSelectedComparison] = useState('salaries');
  const [showFormula, setShowFormula] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showWorkedExample, setShowWorkedExample] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);
  
  const svgRef = useRef(null);
  
  // Get current datasets
  const currentComparison = DATASETS[selectedComparison];
  const datasetA = currentComparison.companyA || currentComparison.mice || currentComparison.celsius;
  const datasetB = currentComparison.companyB || currentComparison.elephants || currentComparison.fahrenheit;
  
  // Calculate statistics for both datasets
  const calculateStats = (data) => {
    const n = data.length;
    const mean = data.reduce((sum, x) => sum + x, 0) / n;
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1);
    const sd = Math.sqrt(variance);
    const cv = (sd / mean) * 100;
    return { mean, sd, cv };
  };
  
  const statsA = calculateStats(datasetA.data);
  const statsB = calculateStats(datasetB.data);
  
  // Process MathJax with retry logic
  const mathRef = useMathJax([showFormula, showWorkedExample]);

  // D3 Visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 80, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Prepare data for grouped bar chart
    const metrics = [
      { category: "Mean", A: statsA.mean, B: statsB.mean, showUnits: true },
      { category: "SD", A: statsA.sd, B: statsB.sd, showUnits: true },
      { category: "CV (%)", A: statsA.cv, B: statsB.cv, showUnits: false }
    ];

    // Scales
    const x0Scale = d3.scaleBand()
      .domain(metrics.map(d => d.category))
      .rangeRound([0, innerWidth])
      .paddingInner(0.2);

    const x1Scale = d3.scaleBand()
      .domain(["A", "B"])
      .rangeRound([0, x0Scale.bandwidth()])
      .padding(0.05);

    const yScale = d3.scaleLinear()
      .domain([0, Math.max(...metrics.flatMap(d => [d.A, d.B])) * 1.2])
      .range([innerHeight, 0]);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x0Scale))
      .style("color", "#9ca3af")
      .style("font-size", "14px")
      .selectAll("text")
      .attr("fill", "#f3f4f6");

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(6))
      .style("color", "#9ca3af")
      .selectAll("text")
      .attr("fill", "#f3f4f6");

    // Add y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .style("fill", "#e5e7eb")
      .style("font-size", "12px")
      .text("Value");

    // Draw grouped bars
    const groups = g.selectAll(".metric-group")
      .data(metrics)
      .enter().append("g")
      .attr("class", "metric-group")
      .attr("transform", d => `translate(${x0Scale(d.category)},0)`);

    // Dataset A bars
    groups.append("rect")
      .attr("x", x1Scale("A"))
      .attr("y", innerHeight)
      .attr("width", x1Scale.bandwidth())
      .attr("height", 0)
      .style("fill", "#60a5fa")
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        setHoveredBar({ dataset: "A", metric: d.category, value: d.A });
      })
      .on("mouseout", () => setHoveredBar(null))
      .transition()
      .duration(500)
      .delay((d, i) => i * 100)
      .attr("y", d => yScale(d.A))
      .attr("height", d => innerHeight - yScale(d.A));

    // Dataset B bars
    groups.append("rect")
      .attr("x", x1Scale("B"))
      .attr("y", innerHeight)
      .attr("width", x1Scale.bandwidth())
      .attr("height", 0)
      .style("fill", "#10b981")
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        setHoveredBar({ dataset: "B", metric: d.category, value: d.B });
      })
      .on("mouseout", () => setHoveredBar(null))
      .transition()
      .duration(500)
      .delay((d, i) => i * 100 + 50)
      .attr("y", d => yScale(d.B))
      .attr("height", d => innerHeight - yScale(d.B));

    // Value labels
    groups.selectAll(".value-label")
      .data(d => [
        { x: x1Scale("A"), y: d.A, value: d.A, showUnits: d.showUnits, color: "#60a5fa" },
        { x: x1Scale("B"), y: d.B, value: d.B, showUnits: d.showUnits, color: "#10b981" }
      ])
      .enter().append("text")
      .attr("class", "value-label")
      .attr("x", d => d.x + x1Scale.bandwidth() / 2)
      .attr("y", d => yScale(d.y) - 5)
      .attr("text-anchor", "middle")
      .style("fill", d => d.color)
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .text(d => d.value.toFixed(1) + (d.showUnits && d.value === statsA.mean ? ` ${datasetA.units}` : 
                                       d.showUnits && d.value === statsB.mean ? ` ${datasetB.units}` : 
                                       !d.showUnits ? "%" : ""))
      .style("opacity", 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 100 + 200)
      .style("opacity", 1);

    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 150}, 20)`);

    const legendData = [
      { name: datasetA.name, color: "#60a5fa" },
      { name: datasetB.name, color: "#10b981" }
    ];

    legendData.forEach((item, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);

      legendRow.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", item.color);

      legendRow.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .style("fill", "#e5e7eb")
        .style("font-size", "12px")
        .text(item.name);
    });

    // Highlight CV comparison
    if (statsA.cv && statsB.cv) {
      const cvGroup = g.append("g")
        .attr("transform", `translate(${x0Scale("CV (%)")}, ${innerHeight + 50})`);

      cvGroup.append("text")
        .attr("x", x0Scale.bandwidth() / 2)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("fill", statsA.cv > statsB.cv ? "#60a5fa" : "#10b981")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(statsA.cv > statsB.cv 
          ? `${datasetA.name} has ${(statsA.cv / statsB.cv).toFixed(1)}× more relative variation`
          : `${datasetB.name} has ${(statsB.cv / statsA.cv).toFixed(1)}× more relative variation`)
        .style("opacity", 0)
        .transition()
        .duration(500)
        .delay(800)
        .style("opacity", 1);
    }
  }, [selectedComparison, statsA, statsB]);

  return (
    <VisualizationContainer
      title="Coefficient of Variation"
      description="Comparing variation across different scales"
    >
      <div className="space-y-8">
        {/* The Comparison Problem */}
        <VisualizationSection className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-4">The Comparison Problem</h3>
          <div className="text-neutral-300 space-y-4">
            <p>
              Imagine you're comparing two companies:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Tech Startup</h4>
                <p className="text-sm">Average salary: $50,000</p>
                <p className="text-sm">Standard deviation: $5,000</p>
                <p className="text-xs text-neutral-400 mt-2">Lower salaries, smaller SD</p>
              </div>
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Big Corporation</h4>
                <p className="text-sm">Average salary: $200,000</p>
                <p className="text-sm">Standard deviation: $10,000</p>
                <p className="text-xs text-neutral-400 mt-2">Higher salaries, larger SD</p>
              </div>
            </div>
            
            <p className="text-yellow-400">
              Which company has more variation in salaries? The corporation has a larger SD ($10k vs $5k), 
              but is that the whole story? We need to consider the variation <strong>relative to the mean!</strong>
            </p>
          </div>
        </VisualizationSection>

        {/* Building Intuition */}
        <VisualizationSection>
          <h3 className="text-lg font-bold text-white mb-4">Relative Variation: The Key Insight</h3>
          
          <div className="space-y-6">
            {/* Comparison selector */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setSelectedComparison('salaries')}
                variant={selectedComparison === 'salaries' ? 'default' : 'neutral'}
                size="sm"
                className="flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Company Salaries
              </Button>
              <Button
                onClick={() => setSelectedComparison('measurements')}
                variant={selectedComparison === 'measurements' ? 'default' : 'neutral'}
                size="sm"
                className="flex items-center gap-2"
              >
                <Scale className="w-4 h-4" />
                Animal Weights
              </Button>
              <Button
                onClick={() => setSelectedComparison('temperatures')}
                variant={selectedComparison === 'temperatures' ? 'default' : 'neutral'}
                size="sm"
                className="flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Temperature Scales
              </Button>
            </div>

            {/* Visualization */}
            <svg ref={svgRef} className="w-full"></svg>

            {/* Hover information */}
            {hoveredBar && (
              <div className="bg-neutral-800/50 rounded-lg p-3 text-center">
                <p className="text-sm text-neutral-300">
                  {hoveredBar.dataset === "A" ? datasetA.name : datasetB.name} - {hoveredBar.metric}: 
                  <span className="font-bold text-white ml-2">
                    {hoveredBar.value.toFixed(1)}
                    {hoveredBar.metric === "CV (%)" ? "%" : 
                     hoveredBar.metric === "Mean" ? ` ${hoveredBar.dataset === "A" ? datasetA.units : datasetB.units}` : ""}
                  </span>
                </p>
              </div>
            )}

            {/* Interpretation */}
            <div className="bg-neutral-900/50 rounded-lg p-4 space-y-3">
              <h4 className="font-bold text-white">Understanding the Numbers:</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="font-semibold text-blue-400">{datasetA.name}:</p>
                  <ul className="space-y-1 text-neutral-300">
                    <li>• Mean: {statsA.mean.toFixed(1)} {datasetA.units}</li>
                    <li>• SD: {statsA.sd.toFixed(1)} {datasetA.units}</li>
                    <li>• Variation is {statsA.sd.toFixed(1)} out of {statsA.mean.toFixed(1)}</li>
                    <li className="text-yellow-400">• That's {statsA.cv.toFixed(1)}% relative variation</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-green-400">{datasetB.name}:</p>
                  <ul className="space-y-1 text-neutral-300">
                    <li>• Mean: {statsB.mean.toFixed(1)} {datasetB.units}</li>
                    <li>• SD: {statsB.sd.toFixed(1)} {datasetB.units}</li>
                    <li>• Variation is {statsB.sd.toFixed(1)} out of {statsB.mean.toFixed(1)}</li>
                    <li className="text-yellow-400">• That's {statsB.cv.toFixed(1)}% relative variation</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-3 bg-green-900/20 border border-green-500/30 rounded mt-4">
                <p className="text-sm text-green-400">
                  <strong>Key Insight:</strong> Even though {datasetB.name} has {datasetB.name === "Big Corp" ? "larger" : "much larger"} absolute 
                  variation (SD), {statsA.cv > statsB.cv ? datasetA.name : datasetB.name} actually has more relative 
                  variation when we account for the scale!
                </p>
              </div>
            </div>
          </div>
        </VisualizationSection>

        {/* The Formula */}
        <VisualizationSection className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-indigo-400 mb-4">The Simple Formula</h3>
          
          <div ref={mathRef} className="space-y-4">
            {!showFormula && (
              <Button
                onClick={() => setShowFormula(true)}
                variant="neutral"
                size="sm"
                className="w-full"
              >
                Show Formula
              </Button>
            )}
            
            {showFormula && (
              <>
                <div className="text-center space-y-3">
                  <p className="text-neutral-300">The coefficient of variation is simply:</p>
                  <div className="text-3xl text-blue-400">
                    <span dangerouslySetInnerHTML={{ 
                      __html: `\\[\\text{CV} = \\frac{\\text{Standard Deviation}}{\\text{Mean}} \\times 100\\%\\]` 
                    }} />
                  </div>
                  <p className="text-sm text-neutral-400">
                    It's just the percentage that the SD is of the mean!
                  </p>
                </div>
                
                <div className="bg-neutral-900/50 rounded-lg p-4">
                  <h4 className="font-bold text-white mb-2">Interactive Calculator:</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-neutral-400 mb-1">Enter SD:</p>
                      <input 
                        type="number" 
                        className="w-full px-2 py-1 bg-neutral-800 text-white rounded"
                        placeholder="10"
                        id="sd-input"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-neutral-400 mb-1">Enter Mean:</p>
                      <input 
                        type="number" 
                        className="w-full px-2 py-1 bg-neutral-800 text-white rounded"
                        placeholder="100"
                        id="mean-input"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-neutral-400 mb-1">CV Result:</p>
                      <div className="text-2xl font-mono text-yellow-400">
                        10%
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 text-center mt-3">
                    Try different values to see how CV changes!
                  </p>
                </div>
                
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-sm text-yellow-400">
                    <strong>Rule of Thumb:</strong> CV &lt; 10% = low variation, CV &gt; 30% = high variation
                  </p>
                </div>
              </>
            )}
          </div>
        </VisualizationSection>

        {/* When to Use CV */}
        <VisualizationSection className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            When to Use Coefficient of Variation
          </h3>
          
          <div className="text-neutral-300 space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">✅ Good Uses of CV</h4>
                <ul className="text-sm space-y-2">
                  <li className="text-green-400">
                    • Comparing groups with different scales
                    <p className="text-xs text-neutral-400 ml-4">
                      e.g., Income in different countries with different currencies
                    </p>
                  </li>
                  <li className="text-green-400">
                    • Quality control across product lines
                    <p className="text-xs text-neutral-400 ml-4">
                      e.g., Consistency of 1mm screws vs 100mm bolts
                    </p>
                  </li>
                  <li className="text-green-400">
                    • Financial risk assessment
                    <p className="text-xs text-neutral-400 ml-4">
                      e.g., Volatility relative to returns
                    </p>
                  </li>
                  <li className="text-green-400">
                    • Biological measurements
                    <p className="text-xs text-neutral-400 ml-4">
                      e.g., Heart rate variability across species
                    </p>
                  </li>
                </ul>
              </div>
              
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">❌ When NOT to Use CV</h4>
                <ul className="text-sm space-y-2">
                  <li className="text-red-400">
                    • Mean is near zero
                    <p className="text-xs text-neutral-400 ml-4">
                      CV becomes unstable or infinite
                    </p>
                  </li>
                  <li className="text-red-400">
                    • Data contains negative values
                    <p className="text-xs text-neutral-400 ml-4">
                      Negative mean makes CV misleading
                    </p>
                  </li>
                  <li className="text-red-400">
                    • Interval scales (like temperature)
                    <p className="text-xs text-neutral-400 ml-4">
                      0°C doesn't mean "no temperature"
                    </p>
                  </li>
                  <li className="text-red-400">
                    • When absolute variation matters more
                    <p className="text-xs text-neutral-400 ml-4">
                      e.g., Drug dosage precision
                    </p>
                  </li>
                </ul>
              </div>
            </div>
            
            {!showWarning && (
              <Button
                onClick={() => setShowWarning(true)}
                variant="neutral"
                size="sm"
                className="w-full flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Show Important Warning
              </Button>
            )}
            
            {showWarning && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Warning: Near-Zero Means
                </h4>
                <div className="text-sm space-y-2">
                  <p>
                    When the mean approaches zero, CV becomes extremely unreliable:
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li>• Mean = 0.1, SD = 0.01 → CV = 10%</li>
                    <li>• Mean = 0.01, SD = 0.01 → CV = 100%</li>
                    <li>• Mean = 0.001, SD = 0.01 → CV = 1000%!</li>
                  </ul>
                  <p className="text-yellow-400 mt-2">
                    Same SD, but CV explodes as mean approaches zero. Always check if CV makes sense for your data!
                  </p>
                </div>
              </div>
            )}
          </div>
        </VisualizationSection>

        {/* Worked Example */}
        <VisualizationSection>
          <Button
            onClick={() => setShowWorkedExample(!showWorkedExample)}
            variant="neutral"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
          >
            {showWorkedExample ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showWorkedExample ? "Hide" : "Show"} Worked Example: Manufacturing Quality
          </Button>

          {showWorkedExample && (
            <div ref={mathRef} className="mt-6 space-y-4">
              <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-6">
                <h4 className="font-bold text-purple-400 mb-4">Comparing Quality Across Product Lines</h4>
                
                <div className="space-y-4 text-sm text-neutral-300">
                  <div className="bg-neutral-900/50 rounded-lg p-4">
                    <p className="font-semibold text-white mb-2">Scenario:</p>
                    <p>A factory produces two types of parts:</p>
                    <ul className="mt-2 space-y-1">
                      <li>• <strong>Small screws:</strong> Target = 5mm, measurements: 4.9, 4.95, 5.0, 5.05, 5.1 mm</li>
                      <li>• <strong>Large bolts:</strong> Target = 50mm, measurements: 49, 49.5, 50, 50.5, 51 mm</li>
                    </ul>
                    <p className="mt-2 text-yellow-400">Which production line has better quality control?</p>
                  </div>

                  <div className="bg-neutral-900/50 rounded-lg p-4">
                    <p className="font-semibold text-white mb-2">Small Screws Analysis:</p>
                    <div className="space-y-2">
                      <p>Mean = (4.9 + 4.95 + 5.0 + 5.05 + 5.1) ÷ 5 = 5.0 mm</p>
                      <p>Variance = [(−0.1)² + (−0.05)² + 0² + 0.05² + 0.1²] ÷ 4 = 0.00625</p>
                      <p>SD = √0.00625 = 0.079 mm</p>
                      <div className="text-center my-3">
                        <span dangerouslySetInnerHTML={{ 
                          __html: `\\[\\text{CV} = \\frac{0.079}{5.0} \\times 100\\% = 1.58\\%\\]` 
                        }} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-900/50 rounded-lg p-4">
                    <p className="font-semibold text-white mb-2">Large Bolts Analysis:</p>
                    <div className="space-y-2">
                      <p>Mean = (49 + 49.5 + 50 + 50.5 + 51) ÷ 5 = 50.0 mm</p>
                      <p>Variance = [(−1)² + (−0.5)² + 0² + 0.5² + 1²] ÷ 4 = 0.625</p>
                      <p>SD = √0.625 = 0.79 mm</p>
                      <div className="text-center my-3">
                        <span dangerouslySetInnerHTML={{ 
                          __html: `\\[\\text{CV} = \\frac{0.79}{50.0} \\times 100\\% = 1.58\\%\\]` 
                        }} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <p className="font-semibold text-green-400 mb-2">Interpretation:</p>
                    <ul className="space-y-2">
                      <li>
                        • <strong>Absolute variation:</strong> Bolts vary by ±0.79mm, screws by ±0.079mm
                      </li>
                      <li>
                        • <strong>Relative variation:</strong> Both have CV = 1.58%
                      </li>
                      <li>
                        • <strong>Conclusion:</strong> Both production lines have equally good quality control 
                        relative to their target sizes
                      </li>
                    </ul>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <p className="font-semibold text-yellow-400 mb-2">Business Impact:</p>
                    <p>
                      Using CV shows that both lines meet the same quality standard (CV &lt; 2%). 
                      Without CV, we might incorrectly think the screw line is better just because 
                      its absolute variation is smaller. This ensures fair quality assessment across 
                      all product sizes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </VisualizationSection>

        {/* Real-World Applications */}
        <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Real-World Applications</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-neutral-700/50 rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-2">Finance</h4>
              <p className="text-xs text-neutral-300">
                Sharpe Ratio uses CV concept: comparing return volatility to average returns
              </p>
            </div>
            <div className="p-4 bg-neutral-700/50 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">Medicine</h4>
              <p className="text-xs text-neutral-300">
                Comparing test reliability across different measurement ranges
              </p>
            </div>
            <div className="p-4 bg-neutral-700/50 rounded-lg">
              <h4 className="font-semibold text-purple-400 mb-2">Agriculture</h4>
              <p className="text-xs text-neutral-300">
                Crop yield consistency across different regions and scales
              </p>
            </div>
          </div>
        </VisualizationSection>

        {/* Summary */}
        <VisualizationSection className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-400 mb-4">Key Takeaways</h3>
          <div className="text-neutral-300 space-y-3">
            <p>
              <strong>1. CV makes comparisons fair:</strong> It levels the playing field when comparing 
              variation across different scales or units.
            </p>
            <p>
              <strong>2. It's unit-free:</strong> CV is always a percentage, making it easy to interpret 
              and compare across different measurements.
            </p>
            <p>
              <strong>3. Use with caution:</strong> Always check that your mean is positive and not too 
              close to zero before using CV.
            </p>
            <p>
              <strong>4. Context matters:</strong> Sometimes absolute variation (SD) is more important 
              than relative variation (CV). Choose based on your specific needs.
            </p>
          </div>
        </VisualizationSection>
      </div>
    </VisualizationContainer>
  );
};

export default CoefficientOfVariation;