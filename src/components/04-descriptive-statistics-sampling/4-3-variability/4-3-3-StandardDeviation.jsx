"use client";
import React, { useState, useRef, useEffect } from "react";
import { VisualizationContainer, VisualizationSection } from "@/components/ui/VisualizationContainer";
import { Button } from "@/components/ui/button";
import { createColorScheme } from '@/lib/design-system';
import { TrendingUp, ChevronDown, ChevronUp, Ruler, Bell } from 'lucide-react';
import { useMathJax } from "@/hooks/useMathJax";
import * as d3 from 'd3';

// Chapter 4 color scheme
const colorScheme = createColorScheme('descriptive');

// Dataset for teaching
const HEIGHTS_DATA = [160, 165, 168, 170, 172, 173, 175, 177, 178, 180, 182, 185]; // Heights in cm
const TEST_SCORES = [65, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95]; // Test scores

const StandardDeviation = () => {
  const [selectedDataset, setSelectedDataset] = useState('heights');
  const [showEmpiricalRule, setShowEmpiricalRule] = useState(false);
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [showWorkedExample, setShowWorkedExample] = useState(false);
  const [sdMultiplier, setSdMultiplier] = useState(1);
  
  const svgRef = useRef(null);
  
  // Get current dataset
  const currentData = selectedDataset === 'heights' ? HEIGHTS_DATA : TEST_SCORES;
  const dataLabel = selectedDataset === 'heights' ? 'Height (cm)' : 'Test Score';
  const units = selectedDataset === 'heights' ? 'cm' : 'points';
  
  // Calculate statistics
  const n = currentData.length;
  const mean = currentData.reduce((sum, x) => sum + x, 0) / n;
  const variance = currentData.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1);
  const standardDeviation = Math.sqrt(variance);
  
  // Process MathJax with retry logic
  const mathRef = useMathJax([showEmpiricalRule, showWorkedExample, showInterpretation]);
  const bellRef = useMathJax([showEmpiricalRule, showWorkedExample, showInterpretation]);

  // Main visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = 300;
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
      .domain([mean - 4 * standardDeviation, mean + 4 * standardDeviation])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 0.4])
      .range([innerHeight, 0]);

    // Add x-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(7))
      .style("color", "#9ca3af")
      .selectAll("text")
      .attr("fill", "#f3f4f6");

    // Add axis label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .style("fill", "#e5e7eb")
      .style("font-size", "12px")
      .text(dataLabel);

    // Draw normal curve (approximation)
    const normalCurve = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);

    const curveData = [];
    for (let x = mean - 4 * standardDeviation; x <= mean + 4 * standardDeviation; x += standardDeviation / 10) {
      const z = (x - mean) / standardDeviation;
      const y = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) / standardDeviation;
      curveData.push({ x, y });
    }

    g.append("path")
      .datum(curveData)
      .attr("d", normalCurve)
      .style("fill", "none")
      .style("stroke", colorScheme.chart.primary)
      .style("stroke-width", 2)
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .style("opacity", 1);

    // Draw mean line
    g.append("line")
      .attr("x1", xScale(mean))
      .attr("x2", xScale(mean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .style("stroke", "#fbbf24")
      .style("stroke-width", 2)
      .style("stroke-dasharray", "5,5");

    // Mean label
    g.append("text")
      .attr("x", xScale(mean))
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("fill", "#fbbf24")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(`μ = ${mean.toFixed(1)}`);

    // Draw SD ranges
    const sdColors = ["#10b981", "#60a5fa", "#a78bfa"];
    const sdRanges = [1, 2, 3];
    
    sdRanges.forEach((multiplier, i) => {
      if (multiplier <= sdMultiplier) {
        // Draw range rectangle
        g.append("rect")
          .attr("x", xScale(mean - multiplier * standardDeviation))
          .attr("y", 0)
          .attr("width", 0)
          .attr("height", innerHeight)
          .style("fill", sdColors[i])
          .style("opacity", 0.1)
          .transition()
          .duration(500)
          .delay(i * 200)
          .attr("width", xScale(mean + multiplier * standardDeviation) - xScale(mean - multiplier * standardDeviation));

        // SD markers
        [-multiplier, multiplier].forEach(sign => {
          const x = mean + sign * standardDeviation;
          
          g.append("line")
            .attr("x1", xScale(x))
            .attr("x2", xScale(x))
            .attr("y1", innerHeight - 20)
            .attr("y2", innerHeight + 5)
            .style("stroke", sdColors[i])
            .style("stroke-width", 2)
            .style("opacity", 0)
            .transition()
            .duration(500)
            .delay(i * 200)
            .style("opacity", 1);

          g.append("text")
            .attr("x", xScale(x))
            .attr("y", innerHeight + 20)
            .attr("text-anchor", "middle")
            .style("fill", sdColors[i])
            .style("font-size", "11px")
            .style("font-weight", "bold")
            .text(`${sign > 0 ? '+' : ''}${sign}σ`)
            .style("opacity", 0)
            .transition()
            .duration(500)
            .delay(i * 200)
            .style("opacity", 1);
        });
      }
    });

    // Draw data points
    currentData.forEach((value, i) => {
      g.append("circle")
        .attr("cx", xScale(value))
        .attr("cy", innerHeight - 5)
        .attr("r", 0)
        .style("fill", "#fff")
        .style("stroke", colorScheme.chart.primary)
        .style("stroke-width", 2)
        .transition()
        .duration(500)
        .delay(i * 50)
        .attr("r", 4);
    });

    // Show percentage labels for empirical rule
    if (showEmpiricalRule && sdMultiplier >= 1) {
      const percentages = [
        { mult: 1, pct: "68%", y: innerHeight * 0.5 },
        { mult: 2, pct: "95%", y: innerHeight * 0.3 },
        { mult: 3, pct: "99.7%", y: innerHeight * 0.1 }
      ];

      percentages.forEach(({ mult, pct, y }, i) => {
        if (mult <= sdMultiplier) {
          g.append("text")
            .attr("x", xScale(mean))
            .attr("y", y)
            .attr("text-anchor", "middle")
            .style("fill", sdColors[i])
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text(pct)
            .style("opacity", 0)
            .transition()
            .duration(500)
            .delay(500 + i * 200)
            .style("opacity", 1);
        }
      });
    }
  }, [currentData, sdMultiplier, showEmpiricalRule]);

  return (
    <VisualizationContainer
      title="Standard Deviation"
      description="Converting variance back to meaningful units"
    >
      <div className="space-y-8">
        {/* The Problem with Variance */}
        <VisualizationSection className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-4">The Problem with Variance</h3>
          <div className="text-neutral-300 space-y-4">
            <p>
              We learned that variance measures spread, but there's a problem: <strong>variance is in squared units!</strong>
            </p>
            
            <div className="bg-neutral-900/50 rounded-lg p-4">
              <p className="text-sm mb-3">For example, if we're measuring heights in centimeters:</p>
              <ul className="space-y-2 text-sm">
                <li>• Original data: Heights in <strong>cm</strong></li>
                <li>• Deviations: Still in <strong>cm</strong></li>
                <li>• Variance: In <strong>cm²</strong> (square centimeters?!)</li>
              </ul>
              <p className="text-yellow-400 mt-3">
                What does "64 square centimeters" of height variation even mean? We need to get back to regular centimeters!
              </p>
            </div>
          </div>
        </VisualizationSection>

        {/* The Simple Solution */}
        <VisualizationSection>
          <h3 className="text-lg font-bold text-white mb-4">The Simple Solution: Take the Square Root!</h3>
          
          <div ref={mathRef} className="space-y-6">
            <div className="bg-neutral-900/50 rounded-lg p-4">
              <div className="text-center space-y-3">
                <p className="text-neutral-300">If variance is:</p>
                <div className="text-xl">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[s^2 = \\text{average of squared deviations}\\]` 
                  }} />
                </div>
                <p className="text-neutral-300">Then standard deviation is simply:</p>
                <div className="text-2xl text-blue-400">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[s = \\sqrt{s^2} = \\sqrt{\\text{variance}}\\]` 
                  }} />
                </div>
                <p className="text-green-400 mt-3">
                  Now we're back to the original units! If variance = 64 cm², then SD = 8 cm
                </p>
              </div>
            </div>

            {/* Dataset selector */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setSelectedDataset('heights')}
                variant={selectedDataset === 'heights' ? 'default' : 'neutral'}
                size="sm"
                className="flex items-center gap-2"
              >
                <Ruler className="w-4 h-4" />
                Human Heights Example
              </Button>
              <Button
                onClick={() => setSelectedDataset('scores')}
                variant={selectedDataset === 'scores' ? 'default' : 'neutral'}
                size="sm"
                className="flex items-center gap-2"
              >
                Test Scores Example
              </Button>
            </div>

            {/* Current statistics */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
                <p className="text-xs text-neutral-400 mb-1">Mean</p>
                <p className="text-2xl font-mono text-yellow-400">{mean.toFixed(1)} {units}</p>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
                <p className="text-xs text-neutral-400 mb-1">Variance</p>
                <p className="text-2xl font-mono text-red-400">{variance.toFixed(1)} {units}²</p>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
                <p className="text-xs text-neutral-400 mb-1">Standard Deviation</p>
                <p className="text-2xl font-mono text-green-400">{standardDeviation.toFixed(1)} {units}</p>
              </div>
            </div>
          </div>
        </VisualizationSection>

        {/* What Does SD Really Mean? */}
        <VisualizationSection>
          <h3 className="text-lg font-bold text-white mb-4">What Does Standard Deviation Really Mean?</h3>
          
          <div className="space-y-6">
            {/* Interactive SD visualization */}
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <p className="text-sm text-neutral-300 mb-3">
                Standard deviation tells you the typical distance from the mean. Use the slider to explore:
              </p>
              <div className="flex items-center gap-4">
                <label className="text-sm text-neutral-400">Show range:</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map(n => (
                    <Button
                      key={n}
                      onClick={() => setSdMultiplier(n)}
                      variant={sdMultiplier === n ? 'default' : 'neutral'}
                      size="sm"
                    >
                      ±{n}σ
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={() => setShowEmpiricalRule(!showEmpiricalRule)}
                  variant={showEmpiricalRule ? 'default' : 'neutral'}
                  size="sm"
                  className="ml-auto flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  {showEmpiricalRule ? 'Hide' : 'Show'} Percentages
                </Button>
              </div>
            </div>

            {/* Visualization */}
            <svg ref={svgRef} className="w-full"></svg>

            {/* Interpretation based on multiplier */}
            {!showInterpretation && (
              <Button
                onClick={() => setShowInterpretation(true)}
                variant="neutral"
                size="sm"
                className="w-full"
              >
                Show Interpretation
              </Button>
            )}

            {showInterpretation && (
              <div className="bg-neutral-900/50 rounded-lg p-4 space-y-3">
                <h4 className="font-bold text-white">Understanding the Ranges:</h4>
                <div className="text-sm text-neutral-300 space-y-2">
                  {sdMultiplier >= 1 && (
                    <div className="p-3 bg-green-900/20 border border-green-500/30 rounded">
                      <p className="font-semibold text-green-400">Within ±1 SD ({(mean - standardDeviation).toFixed(1)} to {(mean + standardDeviation).toFixed(1)} {units}):</p>
                      <p>About <strong>68%</strong> of values fall here. This is the "typical" range.</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {selectedDataset === 'heights' 
                          ? "Most people's heights are within this range."
                          : "Most students score within this range."}
                      </p>
                    </div>
                  )}
                  
                  {sdMultiplier >= 2 && (
                    <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                      <p className="font-semibold text-blue-400">Within ±2 SD ({(mean - 2*standardDeviation).toFixed(1)} to {(mean + 2*standardDeviation).toFixed(1)} {units}):</p>
                      <p>About <strong>95%</strong> of values fall here. Values outside are uncommon.</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {selectedDataset === 'heights' 
                          ? "Very tall or very short people are outside this range."
                          : "Exceptionally high or low scores are outside this range."}
                      </p>
                    </div>
                  )}
                  
                  {sdMultiplier >= 3 && (
                    <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded">
                      <p className="font-semibold text-purple-400">Within ±3 SD ({(mean - 3*standardDeviation).toFixed(1)} to {(mean + 3*standardDeviation).toFixed(1)} {units}):</p>
                      <p>About <strong>99.7%</strong> of values fall here. Values outside are very rare.</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {selectedDataset === 'heights' 
                          ? "Professional basketball players or people with dwarfism might be outside."
                          : "These would be truly exceptional performances."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </VisualizationSection>

        {/* The Empirical Rule */}
        {showEmpiricalRule && (
          <VisualizationSection ref={bellRef} className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              The 68-95-99.7 Rule (Empirical Rule)
            </h3>
            
            <div className="text-neutral-300 space-y-4">
              <p>
                For bell-shaped (normal) distributions, the standard deviation gives us a powerful rule of thumb:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-neutral-900/50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">68%</div>
                  <p className="text-sm">of data falls within</p>
                  <p className="text-lg font-mono text-green-400">μ ± 1σ</p>
                  <p className="text-xs text-neutral-400 mt-2">The "normal" range</p>
                </div>
                
                <div className="bg-neutral-900/50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">95%</div>
                  <p className="text-sm">of data falls within</p>
                  <p className="text-lg font-mono text-blue-400">μ ± 2σ</p>
                  <p className="text-xs text-neutral-400 mt-2">The "expected" range</p>
                </div>
                
                <div className="bg-neutral-900/50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">99.7%</div>
                  <p className="text-sm">of data falls within</p>
                  <p className="text-lg font-mono text-purple-400">μ ± 3σ</p>
                  <p className="text-xs text-neutral-400 mt-2">Nearly everything</p>
                </div>
              </div>
              
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-400">
                  <strong>Quick mental math:</strong> If you know the mean and SD, you can instantly estimate where any value stands. 
                  Is it typical (within 1 SD)? Unusual (beyond 2 SD)? Or extremely rare (beyond 3 SD)?
                </p>
              </div>
            </div>
          </VisualizationSection>
        )}

        {/* Real-World Intuition */}
        <VisualizationSection className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Real-World Intuition
          </h3>
          
          <div className="text-neutral-300 space-y-4">
            <p>Standard deviation is everywhere in daily life:</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Manufacturing Quality</h4>
                <p className="text-sm mb-2">
                  A factory produces bolts with mean length 50mm, SD = 0.1mm
                </p>
                <ul className="text-xs space-y-1">
                  <li>• 68% of bolts: 49.9 - 50.1 mm (acceptable)</li>
                  <li>• 95% of bolts: 49.8 - 50.2 mm (still usable)</li>
                  <li>• Beyond ±3 SD: Defective, need investigation</li>
                </ul>
              </div>
              
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Test Scores</h4>
                <p className="text-sm mb-2">
                  Class average = 75, SD = 10 points
                </p>
                <ul className="text-xs space-y-1">
                  <li>• Score of 85: 1 SD above (better than ~84% of class)</li>
                  <li>• Score of 95: 2 SD above (top 2.5%)</li>
                  <li>• Score of 55: 2 SD below (bottom 2.5%)</li>
                </ul>
              </div>
              
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Stock Market</h4>
                <p className="text-sm mb-2">
                  Daily returns: mean = 0.1%, SD = 2%
                </p>
                <ul className="text-xs space-y-1">
                  <li>• Normal day: -1.9% to +2.1% (within 1 SD)</li>
                  <li>• Volatile day: Beyond ±2 SD (±4%)</li>
                  <li>• Market crash/boom: Beyond ±3 SD (very rare)</li>
                </ul>
              </div>
              
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Human Heights</h4>
                <p className="text-sm mb-2">
                  Adult males: mean = 175cm, SD = 7cm
                </p>
                <ul className="text-xs space-y-1">
                  <li>• 168-182 cm: Normal range (68%)</li>
                  <li>• 161-189 cm: Common range (95%)</li>
                  <li>• NBA players: Often beyond +3 SD</li>
                </ul>
              </div>
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
            {showWorkedExample ? "Hide" : "Show"} Worked Example: Restaurant Wait Times
          </Button>

          {showWorkedExample && (
            <div ref={mathRef} className="mt-6 space-y-4">
              <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-6">
                <h4 className="font-bold text-purple-400 mb-4">Interpreting Standard Deviation</h4>
                
                <div className="space-y-4 text-sm text-neutral-300">
                  <div className="bg-neutral-900/50 rounded-lg p-4">
                    <p className="font-semibold text-white mb-2">Scenario:</p>
                    <p>A restaurant tracks wait times (in minutes) for 10 customers:</p>
                    <p className="font-mono mt-2">8, 10, 12, 14, 15, 15, 16, 18, 20, 22</p>
                  </div>

                  <div className="bg-neutral-900/50 rounded-lg p-4">
                    <p className="font-semibold text-white mb-2">Step 1: Calculate Mean</p>
                    <div className="text-center my-3">
                      <span dangerouslySetInnerHTML={{ 
                        __html: `\\[\\bar{x} = \\frac{8+10+12+14+15+15+16+18+20+22}{10} = \\frac{150}{10} = 15 \\text{ minutes}\\]` 
                      }} />
                    </div>
                  </div>

                  <div className="bg-neutral-900/50 rounded-lg p-4">
                    <p className="font-semibold text-white mb-2">Step 2: Calculate Variance</p>
                    <p>Sum of squared deviations:</p>
                    <ul className="text-xs space-y-1 mt-2">
                      <li>(8-15)² = 49</li>
                      <li>(10-15)² = 25</li>
                      <li>(12-15)² = 9</li>
                      <li>... (continuing for all values)</li>
                    </ul>
                    <p className="mt-2">Sum = 140</p>
                    <div className="text-center my-3">
                      <span dangerouslySetInnerHTML={{ 
                        __html: `\\[s^2 = \\frac{140}{10-1} = \\frac{140}{9} = 15.56\\]` 
                      }} />
                    </div>
                  </div>

                  <div className="bg-neutral-900/50 rounded-lg p-4">
                    <p className="font-semibold text-white mb-2">Step 3: Calculate Standard Deviation</p>
                    <div className="text-center my-3">
                      <span dangerouslySetInnerHTML={{ 
                        __html: `\\[s = \\sqrt{15.56} = 3.94 \\approx 4 \\text{ minutes}\\]` 
                      }} />
                    </div>
                  </div>

                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <p className="font-semibold text-green-400 mb-2">What This Tells Us:</p>
                    <ul className="space-y-2">
                      <li>
                        • <strong>Typical wait:</strong> 15 ± 4 minutes (11-19 minutes)
                      </li>
                      <li>
                        • <strong>68% of customers</strong> wait between 11-19 minutes
                      </li>
                      <li>
                        • <strong>95% of customers</strong> wait between 7-23 minutes
                      </li>
                      <li>
                        • A 25-minute wait would be unusual (beyond 2 SD)
                      </li>
                      <li>
                        • A 30-minute wait would be very rare (beyond 3 SD) - investigate!
                      </li>
                    </ul>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <p className="font-semibold text-yellow-400 mb-2">Business Decision:</p>
                    <p>
                      The restaurant can advertise "Most customers served within 20 minutes" because 
                      that covers about 84% of cases (mean + 1 SD). They should investigate any 
                      wait times beyond 23 minutes as these are statistical outliers.
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
              href="/learn/4/3/4"
              className="block p-4 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors"
            >
              <h4 className="font-semibold text-blue-400 mb-2">Coefficient of Variation</h4>
              <p className="text-sm text-neutral-300">
                Learn how to compare variation across different scales using CV
              </p>
            </a>
            <a 
              href="/learn/3/3/3"
              className="block p-4 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors"
            >
              <h4 className="font-semibold text-purple-400 mb-2">The Empirical Rule</h4>
              <p className="text-sm text-neutral-300">
                Deep dive into the 68-95-99.7 rule and normal distributions
              </p>
            </a>
          </div>
        </VisualizationSection>
      </div>
    </VisualizationContainer>
  );
};

export default StandardDeviation;