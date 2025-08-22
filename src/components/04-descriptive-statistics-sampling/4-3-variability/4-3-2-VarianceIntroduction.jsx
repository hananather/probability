"use client";
import React, { useState, useRef, useEffect } from "react";
import { VisualizationContainer, VisualizationSection } from "@/components/ui/VisualizationContainer";
import { Button } from "@/components/ui/button";
import { createColorScheme } from '@/lib/design-system';
import { ArrowRight, AlertCircle, TrendingUp, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useMathJax } from "@/hooks/useMathJax";
import * as d3 from 'd3';

// Chapter 4 color scheme
const colorScheme = createColorScheme('descriptive');

// Simple datasets for learning
const DATASET_A = [4, 6, 6, 6, 8]; // Low variance
const DATASET_B = [2, 4, 6, 8, 10]; // Higher variance
const MAIN_DATA = [3, 7, 7, 9, 14]; // Our main teaching dataset

const VarianceIntroduction = () => {
  const [stage, setStage] = useState('problem');
  const [showDeviations, setShowDeviations] = useState(false);
  const [showSquared, setShowSquared] = useState(false);
  const [showAverage, setShowAverage] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState('main');
  const [showComparison, setShowComparison] = useState(false);
  const [showWorkedExample, setShowWorkedExample] = useState(false);
  const [understanding, setUnderstanding] = useState({
    deviations: false,
    squaring: false,
    averaging: false,
    formula: false
  });
  
  const svgRef = useRef(null);
  
  // Get current dataset
  const currentData = selectedDataset === 'A' ? DATASET_A : 
                      selectedDataset === 'B' ? DATASET_B : MAIN_DATA;
  
  // Calculate statistics
  const mean = currentData.reduce((sum, x) => sum + x, 0) / currentData.length;
  const deviations = currentData.map(x => x - mean);
  const squaredDeviations = deviations.map(d => d * d);
  const sumSquaredDev = squaredDeviations.reduce((sum, d) => sum + d, 0);
  const populationVariance = sumSquaredDev / currentData.length;
  const sampleVariance = sumSquaredDev / (currentData.length - 1);

  // Process MathJax with retry logic
  const mathRef = useMathJax([stage, showSquared, showAverage, showWorkedExample]);

  // D3 Visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 16])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([-8, 8])
      .range([innerHeight, 0]);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight / 2})`)
      .call(d3.axisBottom(xScale))
      .style("color", "#9ca3af")
      .selectAll("text")
      .attr("fill", "#f3f4f6");

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(8))
      .style("color", "#9ca3af")
      .selectAll("text")
      .attr("fill", "#f3f4f6");

    // Add axis labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .style("fill", "#e5e7eb")
      .style("font-size", "12px")
      .text("Value");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .style("fill", "#e5e7eb")
      .style("font-size", "12px")
      .text(showSquared ? "Squared Deviation" : "Deviation from Mean");

    // Draw mean line
    g.append("line")
      .attr("x1", xScale(mean))
      .attr("x2", xScale(mean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .style("stroke", "#fbbf24")
      .style("stroke-width", 2)
      .style("stroke-dasharray", "5,5")
      .style("opacity", 0.7);

    // Mean label
    g.append("text")
      .attr("x", xScale(mean))
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("fill", "#fbbf24")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(`Mean = ${mean.toFixed(1)}`);

    // Draw data points on x-axis
    currentData.forEach((value, i) => {
      g.append("circle")
        .attr("cx", xScale(value))
        .attr("cy", yScale(0))
        .attr("r", 0)
        .style("fill", colorScheme.chart.primary)
        .style("stroke", "#fff")
        .style("stroke-width", 2)
        .transition()
        .duration(500)
        .delay(i * 100)
        .attr("r", 6);

      g.append("text")
        .attr("x", xScale(value))
        .attr("y", yScale(0) + 20)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .text(value)
        .style("opacity", 0)
        .transition()
        .duration(500)
        .delay(i * 100)
        .style("opacity", 1);
    });

    // Show deviations
    if (showDeviations && !showSquared) {
      deviations.forEach((dev, i) => {
        // Deviation lines
        g.append("line")
          .attr("x1", xScale(currentData[i]))
          .attr("x2", xScale(mean))
          .attr("y1", yScale(0))
          .attr("y2", yScale(0))
          .style("stroke", dev > 0 ? "#10b981" : "#ef4444")
          .style("stroke-width", 2)
          .style("opacity", 0)
          .transition()
          .duration(500)
          .delay(i * 100)
          .style("opacity", 0.7);

        // Deviation dots
        g.append("circle")
          .attr("cx", xScale(currentData[i]))
          .attr("cy", yScale(0))
          .attr("r", 0)
          .style("fill", dev > 0 ? "#10b981" : "#ef4444")
          .transition()
          .duration(500)
          .delay(i * 100 + 200)
          .attr("cy", yScale(dev))
          .attr("r", 5);

        // Deviation values
        g.append("text")
          .attr("x", xScale(currentData[i]))
          .attr("y", yScale(dev) + (dev > 0 ? -10 : 20))
          .attr("text-anchor", "middle")
          .style("fill", dev > 0 ? "#10b981" : "#ef4444")
          .style("font-size", "11px")
          .style("font-weight", "bold")
          .text(dev.toFixed(1))
          .style("opacity", 0)
          .transition()
          .duration(500)
          .delay(i * 100 + 200)
          .style("opacity", 1);
      });

      // Show sum of deviations (should be ~0)
      const sumDev = deviations.reduce((sum, d) => sum + d, 0);
      g.append("text")
        .attr("x", innerWidth - 20)
        .attr("y", 30)
        .attr("text-anchor", "end")
        .style("fill", "#fff")
        .style("font-size", "14px")
        .text(`Sum of deviations = ${sumDev.toFixed(1)} ≈ 0`)
        .style("opacity", 0)
        .transition()
        .duration(500)
        .delay(500)
        .style("opacity", 1);
    }

    // Show squared deviations
    if (showSquared) {
      squaredDeviations.forEach((sqDev, i) => {
        // Draw rectangles representing squared deviations
        const rectSize = Math.sqrt(sqDev) * 15; // Scale for visibility
        
        g.append("rect")
          .attr("x", xScale(currentData[i]) - rectSize/2)
          .attr("y", yScale(0) - rectSize)
          .attr("width", rectSize)
          .attr("height", rectSize)
          .style("fill", "#60a5fa")
          .style("opacity", 0.3)
          .style("stroke", "#60a5fa")
          .style("stroke-width", 2)
          .transition()
          .duration(500)
          .delay(i * 100);

        // Squared deviation values
        g.append("text")
          .attr("x", xScale(currentData[i]))
          .attr("y", yScale(0) - rectSize - 10)
          .attr("text-anchor", "middle")
          .style("fill", "#60a5fa")
          .style("font-size", "11px")
          .style("font-weight", "bold")
          .text(sqDev.toFixed(1))
          .style("opacity", 0)
          .transition()
          .duration(500)
          .delay(i * 100)
          .style("opacity", 1);
      });

      // Show sum and average
      if (showAverage) {
        g.append("text")
          .attr("x", innerWidth - 20)
          .attr("y", 30)
          .attr("text-anchor", "end")
          .style("fill", "#fff")
          .style("font-size", "14px")
          .text(`Sum = ${sumSquaredDev.toFixed(1)}`)
          .style("opacity", 0)
          .transition()
          .duration(500)
          .style("opacity", 1);

        g.append("text")
          .attr("x", innerWidth - 20)
          .attr("y", 50)
          .attr("text-anchor", "end")
          .style("fill", "#60a5fa")
          .style("font-size", "14px")
          .style("font-weight", "bold")
          .text(`Variance = ${populationVariance.toFixed(1)}`)
          .style("opacity", 0)
          .transition()
          .duration(500)
          .delay(300)
          .style("opacity", 1);
      }
    }
  }, [currentData, showDeviations, showSquared, showAverage]);

  return (
    <VisualizationContainer
      title="Understanding Variance"
      description="Learning how variance uses all data points to measure spread"
    >
      <div className="space-y-8">
        {/* The Problem Section */}
        <VisualizationSection className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-4">The Problem with Range</h3>
          <div className="text-neutral-300 space-y-4">
            <p>
              We learned that range only uses two numbers: the minimum and maximum. But what about all the values in between?
            </p>
            
            {/* Comparison of datasets */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Dataset A: [4, 6, 6, 6, 8]</h4>
                <p className="text-sm">Range = 8 - 4 = 4</p>
                <p className="text-sm text-neutral-400">Most values cluster around 6</p>
              </div>
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Dataset B: [2, 4, 6, 8, 10]</h4>
                <p className="text-sm">Range = 10 - 2 = 8</p>
                <p className="text-sm text-neutral-400">Values are evenly spread out</p>
              </div>
            </div>
            
            <p className="text-yellow-400">
              Both datasets have different ranges, but is that the whole story? We need a measure that considers <strong>every single value</strong> and how far each one is from the center.
            </p>
          </div>
        </VisualizationSection>

        {/* Building the Concept */}
        <VisualizationSection>
          <h3 className="text-lg font-bold text-white mb-4">Building the Concept Step by Step</h3>
          
          <div className="space-y-6">
            {/* Dataset selector */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setSelectedDataset('main')}
                variant={selectedDataset === 'main' ? 'default' : 'neutral'}
                size="sm"
              >
                Main Example: [3, 7, 7, 9, 14]
              </Button>
              <Button
                onClick={() => setSelectedDataset('A')}
                variant={selectedDataset === 'A' ? 'default' : 'neutral'}
                size="sm"
              >
                Dataset A: [4, 6, 6, 6, 8]
              </Button>
              <Button
                onClick={() => setSelectedDataset('B')}
                variant={selectedDataset === 'B' ? 'default' : 'neutral'}
                size="sm"
              >
                Dataset B: [2, 4, 6, 8, 10]
              </Button>
            </div>

            {/* Interactive journey */}
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    understanding.deviations ? 'bg-green-500' : 'bg-neutral-600'
                  }`}>
                    {understanding.deviations ? <Check className="w-5 h-5 text-white" /> : '1'}
                  </div>
                  <Button
                    onClick={() => {
                      setShowDeviations(true);
                      setUnderstanding(prev => ({ ...prev, deviations: true }));
                    }}
                    variant={showDeviations ? 'default' : 'neutral'}
                    size="sm"
                    className="flex-1"
                  >
                    Step 1: Find deviations from the mean
                  </Button>
                </div>

                {showDeviations && (
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      understanding.squaring ? 'bg-green-500' : 'bg-neutral-600'
                    }`}>
                      {understanding.squaring ? <Check className="w-5 h-5 text-white" /> : '2'}
                    </div>
                    <Button
                      onClick={() => {
                        setShowSquared(true);
                        setUnderstanding(prev => ({ ...prev, squaring: true }));
                      }}
                      variant={showSquared ? 'default' : 'neutral'}
                      size="sm"
                      className="flex-1"
                    >
                      Step 2: Square each deviation
                    </Button>
                  </div>
                )}

                {showSquared && (
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      understanding.averaging ? 'bg-green-500' : 'bg-neutral-600'
                    }`}>
                      {understanding.averaging ? <Check className="w-5 h-5 text-white" /> : '3'}
                    </div>
                    <Button
                      onClick={() => {
                        setShowAverage(true);
                        setUnderstanding(prev => ({ ...prev, averaging: true }));
                      }}
                      variant={showAverage ? 'default' : 'neutral'}
                      size="sm"
                      className="flex-1"
                    >
                      Step 3: Find the average of squared deviations
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Visualization */}
            <svg ref={svgRef} className="w-full"></svg>

            {/* Explanations for each step */}
            {showDeviations && !showSquared && (
              <div ref={mathRef} className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Step 1: Measuring Distances from the Mean</h4>
                <div className="text-sm text-neutral-300 space-y-2">
                  <p>The mean of our data is {mean.toFixed(1)}. Each deviation tells us how far a value is from this center:</p>
                  <ul className="space-y-1 ml-4">
                    {currentData.map((val, i) => (
                      <li key={i}>
                        {val} - {mean.toFixed(1)} = <span className={deviations[i] > 0 ? "text-green-400" : "text-red-400"}>
                          {deviations[i].toFixed(1)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-yellow-400 mt-2">
                    Problem: If we add these up, positive and negative cancel out to (almost) zero!
                  </p>
                </div>
              </div>
            )}

            {showSquared && !showAverage && (
              <div ref={mathRef} className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Step 2: Why Square?</h4>
                <div className="text-sm text-neutral-300 space-y-2">
                  <p>Squaring does two important things:</p>
                  <ol className="space-y-2 ml-4">
                    <li>
                      <strong>1. Makes everything positive:</strong> (-3)² = 9 and (3)² = 9
                    </li>
                    <li>
                      <strong>2. Emphasizes larger deviations:</strong> A deviation of 4 becomes 16, while a deviation of 2 becomes 4. 
                      The outlier gets 4× the weight!
                    </li>
                  </ol>
                  <p className="mt-2">Our squared deviations:</p>
                  <ul className="space-y-1 ml-4">
                    {deviations.map((dev, i) => (
                      <li key={i}>
                        ({dev.toFixed(1)})² = <span className="text-blue-400">{squaredDeviations[i].toFixed(1)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {showAverage && (
              <div ref={mathRef} className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Step 3: The Variance</h4>
                <div className="text-sm text-neutral-300 space-y-2">
                  <p>Variance is the average of the squared deviations:</p>
                  <div className="text-center my-3">
                    <span dangerouslySetInnerHTML={{ 
                      __html: `\\[\\text{Variance} = \\frac{\\sum(x_i - \\bar{x})^2}{n} = \\frac{${sumSquaredDev.toFixed(1)}}{${currentData.length}} = ${populationVariance.toFixed(1)}\\]` 
                    }} />
                  </div>
                  <p>This tells us the average "squared distance" from the mean.</p>
                  
                  <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
                    <p className="text-yellow-400 font-semibold mb-1">Sample vs Population Variance</p>
                    <p className="text-sm">
                      For samples, we divide by (n-1) instead of n. This is called Bessel's correction:
                    </p>
                    <div className="text-center my-2">
                      <span dangerouslySetInnerHTML={{ 
                        __html: `\\[s^2 = \\frac{${sumSquaredDev.toFixed(1)}}{${currentData.length - 1}} = ${sampleVariance.toFixed(1)}\\]` 
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </VisualizationSection>

        {/* Interactive Formula Builder */}
        <VisualizationSection className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-indigo-400 mb-4">Interactive Formula Builder</h3>
          
          <div ref={mathRef} className="space-y-4">
            <p className="text-neutral-300 text-center">
              Click each part to understand the variance formula:
            </p>
            
            <div className="text-2xl md:text-3xl font-mono text-center">
              <span className="text-neutral-500">s² = </span>
              
              <div className="inline-flex flex-col items-center">
                {/* Numerator */}
                <div className="flex items-center gap-1">
                  <span 
                    className={`cursor-pointer transition-all hover:scale-110 px-1 ${
                      understanding.formula ? 'text-green-400' : 'text-neutral-400'
                    }`}
                    onClick={() => setUnderstanding(prev => ({ ...prev, formula: true }))}
                  >
                    Σ(xᵢ - x̄)²
                  </span>
                </div>
                
                {/* Fraction bar */}
                <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
                
                {/* Denominator */}
                <span className="text-amber-400">n - 1</span>
              </div>
            </div>
            
            {understanding.formula && (
              <div className="bg-neutral-900/50 rounded-lg p-4 mt-4">
                <h4 className="font-bold text-white mb-2">Formula Breakdown:</h4>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li>• <strong>Σ</strong> - Sum up all the values</li>
                  <li>• <strong>(xᵢ - x̄)</strong> - Each value minus the mean (deviation)</li>
                  <li>• <strong>²</strong> - Square to make positive and emphasize outliers</li>
                  <li>• <strong>n - 1</strong> - Degrees of freedom for sample variance</li>
                </ul>
              </div>
            )}
          </div>
        </VisualizationSection>

        {/* Real Understanding */}
        <VisualizationSection className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            What Variance Really Tells Us
          </h3>
          
          <div className="text-neutral-300 space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Low Variance</h4>
                <p className="text-sm mb-3">
                  Values cluster tightly around the mean. Think of a well-tuned machine producing consistent results.
                </p>
                <div className="text-xs space-y-1">
                  <p>Examples:</p>
                  <p>• Professional dart player's throws</p>
                  <p>• Daily temperature in tropical regions</p>
                  <p>• Heights of same-age children</p>
                </div>
              </div>
              
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">High Variance</h4>
                <p className="text-sm mb-3">
                  Values are spread far from the mean. Think of unpredictable, volatile situations.
                </p>
                <div className="text-xs space-y-1">
                  <p>Examples:</p>
                  <p>• Stock prices during market crash</p>
                  <p>• Income in a diverse population</p>
                  <p>• Test scores without studying</p>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <h4 className="font-bold text-yellow-400 mb-2">The Power of Variance</h4>
              <p className="text-sm">
                Unlike range, variance uses <strong>every single data point</strong>. It tells us not just the extremes, 
                but how the entire dataset behaves around its center. This makes it much more informative for understanding 
                the true nature of your data's spread.
              </p>
            </div>
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
            {showWorkedExample ? "Hide" : "Show"} Worked Example: Daily Sales Analysis
          </Button>

          {showWorkedExample && (
            <div ref={mathRef} className="mt-6 space-y-4">
              <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-6">
                <h4 className="font-bold text-purple-400 mb-4">Calculating Variance Step by Step</h4>
                
                <div className="space-y-4 text-sm text-neutral-300">
                  <div className="bg-neutral-900/50 rounded-lg p-4">
                    <p className="font-semibold text-white mb-2">Scenario:</p>
                    <p>A small coffee shop tracks daily sales (in hundreds) for a week:</p>
                    <p className="font-mono mt-2">Monday: $12, Tuesday: $15, Wednesday: $11, Thursday: $14, Friday: $18</p>
                  </div>

                  <div className="bg-neutral-900/50 rounded-lg p-4">
                    <p className="font-semibold text-white mb-2">Step 1: Find the Mean</p>
                    <div className="text-center my-3">
                      <span dangerouslySetInnerHTML={{ 
                        __html: `\\[\\bar{x} = \\frac{12 + 15 + 11 + 14 + 18}{5} = \\frac{70}{5} = 14\\]` 
                      }} />
                    </div>
                    <p>Average daily sales: $1,400</p>
                  </div>

                  <div className="bg-neutral-900/50 rounded-lg p-4">
                    <p className="font-semibold text-white mb-2">Step 2: Calculate Deviations</p>
                    <ul className="space-y-1">
                      <li>Monday: 12 - 14 = -2</li>
                      <li>Tuesday: 15 - 14 = 1</li>
                      <li>Wednesday: 11 - 14 = -3</li>
                      <li>Thursday: 14 - 14 = 0</li>
                      <li>Friday: 18 - 14 = 4</li>
                    </ul>
                    <p className="mt-2 text-yellow-400">Sum = -2 + 1 + (-3) + 0 + 4 = 0 ✓</p>
                  </div>

                  <div className="bg-neutral-900/50 rounded-lg p-4">
                    <p className="font-semibold text-white mb-2">Step 3: Square the Deviations</p>
                    <ul className="space-y-1">
                      <li>(-2)² = 4</li>
                      <li>(1)² = 1</li>
                      <li>(-3)² = 9</li>
                      <li>(0)² = 0</li>
                      <li>(4)² = 16</li>
                    </ul>
                    <p className="mt-2">Sum of squares = 4 + 1 + 9 + 0 + 16 = 30</p>
                  </div>

                  <div className="bg-neutral-900/50 rounded-lg p-4">
                    <p className="font-semibold text-white mb-2">Step 4: Calculate Variance</p>
                    <p className="mb-2">For a sample (using n-1):</p>
                    <div className="text-center my-3">
                      <span dangerouslySetInnerHTML={{ 
                        __html: `\\[s^2 = \\frac{30}{5-1} = \\frac{30}{4} = 7.5\\]` 
                      }} />
                    </div>
                  </div>

                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <p className="font-semibold text-green-400 mb-2">Interpretation:</p>
                    <p>
                      The variance of 7.5 (hundred dollars)² tells us there's moderate variability in daily sales.
                    </p>
                    <p className="mt-2">
                      To get back to dollars, we'd take the square root to get the standard deviation: 
                      √7.5 ≈ $274 typical deviation from the mean.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </VisualizationSection>

        {/* Links to Related Content */}
        <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Continue Learning</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <a 
              href="/learn/4/3/3"
              className="block p-4 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors"
            >
              <h4 className="font-semibold text-blue-400 mb-2">Standard Deviation</h4>
              <p className="text-sm text-neutral-300">
                Learn how to convert variance back to meaningful units by taking the square root
              </p>
            </a>
            <a 
              href="/learn/formula-builders/sample-variance"
              className="block p-4 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors"
            >
              <h4 className="font-semibold text-purple-400 mb-2">Interactive Variance Builder</h4>
              <p className="text-sm text-neutral-300">
                Practice building the variance formula step-by-step with our interactive tool
              </p>
            </a>
          </div>
        </VisualizationSection>
      </div>
    </VisualizationContainer>
  );
};

export default VarianceIntroduction;