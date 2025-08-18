"use client";
import React, { useState, useRef, useEffect } from "react";
import { VisualizationContainer, VisualizationSection } from "@/components/ui/VisualizationContainer";
import { Button } from "@/components/ui/button";
import { createColorScheme } from '@/lib/design-system';
import { ArrowRight, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import * as d3 from 'd3';

// Chapter 4 color scheme
const colorScheme = createColorScheme('descriptive');

// Simple dataset for learning
const INITIAL_DATA = [65, 72, 78, 85, 92];
const EXTENDED_DATA = [20, 65, 72, 78, 85, 92]; // With outlier

const RangeAndIQR = () => {
  const [stage, setStage] = useState('intro');
  const [selectedValues, setSelectedValues] = useState({ min: false, max: false });
  const [showIQR, setShowIQR] = useState(false);
  const [showOutlier, setShowOutlier] = useState(false);
  const [showWorkedExample, setShowWorkedExample] = useState(false);
  const svgRef = useRef(null);
  const mathRef = useRef(null);

  // Current dataset based on outlier state
  const currentData = showOutlier ? EXTENDED_DATA : INITIAL_DATA;
  const sortedData = [...currentData].sort((a, b) => a - b);
  
  // Calculate statistics
  const min = Math.min(...currentData);
  const max = Math.max(...currentData);
  const range = max - min;
  
  // Calculate quartiles
  const n = sortedData.length;
  const q1Index = Math.floor(n * 0.25);
  const q2Index = Math.floor(n * 0.5);
  const q3Index = Math.floor(n * 0.75);
  const q1 = sortedData[q1Index];
  const q2 = sortedData[q2Index];
  const q3 = sortedData[q3Index];
  const iqr = q3 - q1;

  // Process MathJax
  useEffect(() => {
    if (typeof window !== "undefined" && window.MathJax?.typesetPromise && mathRef.current) {
      window.MathJax.typesetPromise([mathRef.current]).catch(console.error);
    }
  }, [stage, showIQR, showWorkedExample]);

  // D3 Visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = 200;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scale
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);

    // Add axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight / 2})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .style("color", "#9ca3af")
      .selectAll("text")
      .attr("fill", "#f3f4f6");

    // Add axis label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight - 10)
      .attr("text-anchor", "middle")
      .style("fill", "#e5e7eb")
      .style("font-size", "12px")
      .text("Test Scores");

    // Draw data points
    const dots = g.selectAll(".dot")
      .data(currentData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d))
      .attr("cy", innerHeight / 2)
      .attr("r", 0)
      .style("fill", d => {
        if (selectedValues.min && d === min) return "#ef4444";
        if (selectedValues.max && d === max) return "#10b981";
        if (d === 20 && showOutlier) return "#fbbf24";
        return colorScheme.chart.primary;
      })
      .style("stroke", "#fff")
      .style("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        if (d === min) setSelectedValues(prev => ({ ...prev, min: true }));
        if (d === max) setSelectedValues(prev => ({ ...prev, max: true }));
      });

    // Animate dots
    dots.transition()
      .duration(500)
      .delay((d, i) => i * 100)
      .attr("r", 8);

    // Add value labels
    g.selectAll(".label")
      .data(currentData)
      .enter().append("text")
      .attr("class", "label")
      .attr("x", d => xScale(d))
      .attr("y", innerHeight / 2 - 15)
      .attr("text-anchor", "middle")
      .style("fill", "#fff")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(d => d)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 100)
      .style("opacity", 1);

    // Draw range line if both min and max selected
    if (selectedValues.min && selectedValues.max) {
      g.append("line")
        .attr("x1", xScale(min))
        .attr("x2", xScale(min))
        .attr("y1", innerHeight / 2 + 20)
        .attr("y2", innerHeight / 2 + 20)
        .style("stroke", "#fbbf24")
        .style("stroke-width", 3)
        .transition()
        .duration(500)
        .attr("x2", xScale(max));

      g.append("text")
        .attr("x", xScale((min + max) / 2))
        .attr("y", innerHeight / 2 + 35)
        .attr("text-anchor", "middle")
        .style("fill", "#fbbf24")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(`Range = ${range}`)
        .style("opacity", 0)
        .transition()
        .duration(500)
        .delay(500)
        .style("opacity", 1);
    }

    // Draw IQR box if enabled
    if (showIQR) {
      // IQR box
      g.append("rect")
        .attr("x", xScale(q1))
        .attr("y", innerHeight / 2 - 25)
        .attr("width", 0)
        .attr("height", 50)
        .style("fill", "#60a5fa")
        .style("opacity", 0.3)
        .transition()
        .duration(500)
        .attr("width", xScale(q3) - xScale(q1));

      // Quartile lines
      [q1, q2, q3].forEach((q, i) => {
        g.append("line")
          .attr("x1", xScale(q))
          .attr("x2", xScale(q))
          .attr("y1", innerHeight / 2 - 25)
          .attr("y2", innerHeight / 2 + 25)
          .style("stroke", "#60a5fa")
          .style("stroke-width", 2)
          .style("opacity", 0)
          .transition()
          .duration(500)
          .delay(i * 200)
          .style("opacity", 1);

        g.append("text")
          .attr("x", xScale(q))
          .attr("y", innerHeight / 2 - 30)
          .attr("text-anchor", "middle")
          .style("fill", "#60a5fa")
          .style("font-size", "11px")
          .style("font-weight", "bold")
          .text(`Q${i + 1}`)
          .style("opacity", 0)
          .transition()
          .duration(500)
          .delay(i * 200)
          .style("opacity", 1);
      });

      // IQR label
      g.append("text")
        .attr("x", xScale((q1 + q3) / 2))
        .attr("y", innerHeight / 2 + 45)
        .attr("text-anchor", "middle")
        .style("fill", "#60a5fa")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(`IQR = ${iqr}`)
        .style("opacity", 0)
        .transition()
        .duration(500)
        .delay(600)
        .style("opacity", 1);
    }
  }, [currentData, selectedValues, showIQR]);

  return (
    <VisualizationContainer
      title="Range and Interquartile Range"
      description="Understanding how to measure the spread of your data"
    >
      <div className="space-y-8">
        {/* Introduction Section */}
        <VisualizationSection className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-4">Let's Start Simple</h3>
          <div className="text-neutral-300 space-y-4">
            <p>
              Imagine you're a teacher looking at test scores from 5 students: <strong>65, 72, 78, 85, 92</strong>
            </p>
            <p>
              One of the first questions you might ask is: "How spread out are these scores?" Are they all bunched together, or are they scattered across a wide range?
            </p>
            <p className="text-sm text-neutral-400">
              This is exactly what measures of spread (or variability) help us understand. Let's explore two fundamental ways to measure this spread.
            </p>
          </div>
        </VisualizationSection>

        {/* Interactive Visualization */}
        <VisualizationSection>
          <h3 className="text-lg font-bold text-white mb-4">Building Understanding: The Range</h3>
          
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <p className="text-sm text-neutral-300">
                {!selectedValues.min && !selectedValues.max && "👆 Click on the dots below to identify the minimum and maximum values"}
                {selectedValues.min && !selectedValues.max && "Great! You found the minimum. Now find the maximum value."}
                {selectedValues.min && selectedValues.max && !showIQR && "Perfect! The range shows the total spread from minimum to maximum."}
                {showIQR && "The blue box shows the IQR - where the middle 50% of the data lies."}
              </p>
            </div>

            {/* SVG Visualization */}
            <svg ref={svgRef} className="w-full"></svg>

            {/* Controls */}
            <div className="flex gap-4 flex-wrap">
              {selectedValues.min && selectedValues.max && (
                <Button
                  onClick={() => setShowIQR(!showIQR)}
                  variant="neutral"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {showIQR ? "Hide" : "Show"} IQR
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              
              {selectedValues.min && selectedValues.max && (
                <Button
                  onClick={() => setShowOutlier(!showOutlier)}
                  variant={showOutlier ? "destructive" : "neutral"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  {showOutlier ? "Remove" : "Add"} Outlier (20)
                </Button>
              )}

              {(selectedValues.min || selectedValues.max || showIQR) && (
                <Button
                  onClick={() => {
                    setSelectedValues({ min: false, max: false });
                    setShowIQR(false);
                    setShowOutlier(false);
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Reset
                </Button>
              )}
            </div>

            {/* Explanation based on state */}
            {selectedValues.min && selectedValues.max && (
              <div ref={mathRef} className="bg-neutral-900/50 rounded-lg p-4 space-y-3">
                <h4 className="font-bold text-white">Understanding the Range</h4>
                <div className="text-sm text-neutral-300 space-y-2">
                  <p>
                    The <strong className="text-yellow-400">range</strong> is the simplest measure of spread:
                  </p>
                  <div className="text-center my-3">
                    <span dangerouslySetInnerHTML={{ 
                      __html: `\\[\\text{Range} = \\text{Maximum} - \\text{Minimum} = ${max} - ${min} = ${range}\\]` 
                    }} />
                  </div>
                  <p>
                    This tells us the scores span {range} points from lowest to highest.
                    {showOutlier && (
                      <span className="text-yellow-400">
                        {" "}Notice how adding one outlier (20) changed the range from 27 to {range}!
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {showIQR && (
              <div ref={mathRef} className="bg-neutral-900/50 rounded-lg p-4 space-y-3">
                <h4 className="font-bold text-white">The Interquartile Range (IQR)</h4>
                <div className="text-sm text-neutral-300 space-y-2">
                  <p>
                    The <strong className="text-blue-400">IQR</strong> focuses on the middle 50% of the data:
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li>• <strong>Q1 (First Quartile):</strong> {q1} - 25% of data is below this</li>
                    <li>• <strong>Q2 (Median):</strong> {q2} - 50% of data is below this</li>
                    <li>• <strong>Q3 (Third Quartile):</strong> {q3} - 75% of data is below this</li>
                  </ul>
                  <div className="text-center my-3">
                    <span dangerouslySetInnerHTML={{ 
                      __html: `\\[\\text{IQR} = Q_3 - Q_1 = ${q3} - ${q1} = ${iqr}\\]` 
                    }} />
                  </div>
                  <p className={showOutlier ? "text-green-400" : ""}>
                    {showOutlier 
                      ? `Notice: The IQR stayed at ${iqr} even with the outlier! It's resistant to extreme values.`
                      : `The IQR of ${iqr} tells us the middle 50% of scores span ${iqr} points.`
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </VisualizationSection>

        {/* Real Understanding Section */}
        <VisualizationSection className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Real Understanding
          </h3>
          <div className="text-neutral-300 space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Range: The Full Picture</h4>
                <p className="text-sm mb-3">
                  Think of range like measuring a room from wall to wall. It tells you the maximum space available, but doesn't tell you how the furniture is arranged.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="text-green-400">✓ Simple to calculate and understand</p>
                  <p className="text-green-400">✓ Uses actual data values</p>
                  <p className="text-red-400">✗ Heavily influenced by outliers</p>
                  <p className="text-red-400">✗ Only uses two data points</p>
                </div>
              </div>

              <div className="bg-neutral-900/50 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">IQR: The Typical Spread</h4>
                <p className="text-sm mb-3">
                  IQR is like measuring where most of the furniture actually sits in the room, ignoring that one chair pushed into the corner.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="text-green-400">✓ Resistant to outliers</p>
                  <p className="text-green-400">✓ Shows typical variability</p>
                  <p className="text-green-400">✓ Used in box plots</p>
                  <p className="text-yellow-400">△ Ignores some data</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800/50 rounded-lg p-4 mt-4">
              <h4 className="font-bold text-yellow-400 mb-2">When to Use Each?</h4>
              <div className="text-sm space-y-2">
                <p>
                  <strong>Use Range when:</strong> You need to know the full extent of your data, like determining 
                  the capacity needed for a system or the absolute limits of variation.
                </p>
                <p>
                  <strong>Use IQR when:</strong> You want to understand typical variation without being misled by 
                  outliers, like comparing the consistency of different manufacturing processes.
                </p>
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
            {showWorkedExample ? "Hide" : "Show"} Worked Example: Employee Salaries
          </Button>

          {showWorkedExample && (
            <div ref={mathRef} className="mt-6 space-y-4">
              <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-6">
                <h4 className="font-bold text-purple-400 mb-4">Step-by-Step: Analyzing Salary Data</h4>
                
                <div className="space-y-4 text-sm text-neutral-300">
                  <div className="bg-neutral-900/50 rounded-lg p-4">
                    <p className="font-semibold text-white mb-2">Given Data:</p>
                    <p>Annual salaries (in thousands): 42, 45, 48, 52, 55, 58, 62, 68, 75, 120</p>
                  </div>

                  <div className="bg-neutral-900/50 rounded-lg p-4">
                    <p className="font-semibold text-white mb-2">Step 1: Calculate Range</p>
                    <p>First, identify the minimum and maximum:</p>
                    <p className="ml-4">• Minimum = $42k</p>
                    <p className="ml-4">• Maximum = $120k</p>
                    <div className="text-center my-3">
                      <span dangerouslySetInnerHTML={{ 
                        __html: `\\[\\text{Range} = 120 - 42 = 78 \\text{ thousand dollars}\\]` 
                      }} />
                    </div>
                    <p className="text-yellow-400">
                      This large range suggests high variability, but is it typical?
                    </p>
                  </div>

                  <div className="bg-neutral-900/50 rounded-lg p-4">
                    <p className="font-semibold text-white mb-2">Step 2: Find Quartiles</p>
                    <p>With n = 10 employees:</p>
                    <p className="ml-4">• Q1 position: 0.25 × 10 = 2.5 → 3rd value = $48k</p>
                    <p className="ml-4">• Q2 position: 0.50 × 10 = 5.0 → 5th/6th avg = $56.5k</p>
                    <p className="ml-4">• Q3 position: 0.75 × 10 = 7.5 → 8th value = $68k</p>
                  </div>

                  <div className="bg-neutral-900/50 rounded-lg p-4">
                    <p className="font-semibold text-white mb-2">Step 3: Calculate IQR</p>
                    <div className="text-center my-3">
                      <span dangerouslySetInnerHTML={{ 
                        __html: `\\[\\text{IQR} = Q_3 - Q_1 = 68 - 48 = 20 \\text{ thousand dollars}\\]` 
                      }} />
                    </div>
                  </div>

                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <p className="font-semibold text-green-400 mb-2">Interpretation:</p>
                    <p>
                      • The range of $78k is heavily influenced by the $120k outlier (likely a manager)
                    </p>
                    <p>
                      • The IQR of $20k better represents typical salary variation among most employees
                    </p>
                    <p>
                      • The middle 50% of employees earn between $48k and $68k
                    </p>
                    <p className="mt-2 text-yellow-400">
                      This is why IQR is often preferred for skewed data with outliers!
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
              href="/learn/4/4/6"
              className="block p-4 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors"
            >
              <h4 className="font-semibold text-blue-400 mb-2">Box Plots & Quartiles Journey</h4>
              <p className="text-sm text-neutral-300">
                Dive deeper into quartiles and learn how box plots visualize the five-number summary
              </p>
            </a>
            <a 
              href="/learn/4/3/2"
              className="block p-4 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors"
            >
              <h4 className="font-semibold text-purple-400 mb-2">Understanding Variance</h4>
              <p className="text-sm text-neutral-300">
                Learn how variance uses all data points to measure spread, not just the extremes
              </p>
            </a>
          </div>
        </VisualizationSection>
      </div>
    </VisualizationContainer>
  );
};

export default RangeAndIQR;