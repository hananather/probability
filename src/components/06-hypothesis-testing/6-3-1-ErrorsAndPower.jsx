"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import jStat from "jstat";
import { motion, AnimatePresence } from "framer-motion";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import BackToHub from '../ui/BackToHub';
import { AlertTriangle, Shield, Target } from 'lucide-react';
import { useMathJax } from '../../hooks/useMathJax';
import { SemanticGradientCard, SemanticGradientGrid } from '../ui/patterns/SemanticGradientCard';
import { InterpretationBox } from '../ui/patterns/InterpretationBox';

// Get vibrant Chapter 6 color scheme
const chapterColors = createColorScheme('hypothesis');

// Worked Example Component
const WorkedExample = React.memo(function WorkedExample() {
  const contentRef = useMathJax();
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-6 border border-neutral-700/50">
      <h3 className="text-xl font-bold text-purple-400 mb-6">
        Step-by-Step Computation of α, β, and Power
      </h3>
      
      <div ref={contentRef} className="space-y-6">
        {/* Setup */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Given Information</h4>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li>• Null hypothesis: <span dangerouslySetInnerHTML={{ __html: `\\(H_0: \\mu = 5000\\)` }} /> kg/cm²</li>
            <li>• Alternative hypothesis: <span dangerouslySetInnerHTML={{ __html: `\\(H_1: \\mu < 5000\\)` }} /> (left-sided test)</li>
            <li>• Population standard deviation: <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma = 120\\)` }} /> kg/cm²</li>
            <li>• Sample size: <span dangerouslySetInnerHTML={{ __html: `\\(n = 49\\)` }} /></li>
            <li>• Critical value: <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{X}_c = 4970\\)` }} /> kg/cm²</li>
            <li>• Decision rule: Reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> if <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{X} < 4970\\)` }} /></li>
          </ul>
        </div>

        {/* Step 1: Calculate SE */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 1: Calculate Standard Error</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>The standard error of the sample mean is:</p>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[SE = \\frac{\\sigma}{\\sqrt{n}} = \\frac{120}{\\sqrt{49}} = \\frac{120}{7} = 17.14\\]` }} />
            </div>
          </div>
        </div>

        {/* Step 2: Calculate Type I Error */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 2: Calculate Type I Error (α)</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>Type I error is the probability of rejecting <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> when it's true:</p>
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\alpha = P(\\text{reject } H_0 | H_0 \\text{ is true}) = P(\\bar{X} < 4970 | \\mu = 5000)\\]` }} />
            </div>
            <p>Standardizing using the Z-score:</p>
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\alpha = P\\left(\\frac{\\bar{X} - \\mu}{\\sigma/\\sqrt{n}} < \\frac{4970 - 5000}{120/\\sqrt{49}}\\right) = P\\left(Z < \\frac{-30}{17.14}\\right)\\]` }} />
            </div>
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\alpha = P(Z < -1.75) \\approx 0.0401 = 4.01\\%\\]` }} />
            </div>
          </div>
        </div>

        {/* Step 3: Calculate Type II Error */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 3: Calculate Type II Error (β)</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>Type II error depends on the true mean. Let's calculate for <span dangerouslySetInnerHTML={{ __html: `\\(\\mu_1 = 4980\\)` }} />:</p>
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\beta = P(\\text{fail to reject } H_0 | H_0 \\text{ is false}) = P(\\bar{X} \\geq 4970 | \\mu = 4980)\\]` }} />
            </div>
            <p>Standardizing:</p>
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\beta = P\\left(\\frac{\\bar{X} - \\mu_1}{\\sigma/\\sqrt{n}} \\geq \\frac{4970 - 4980}{120/\\sqrt{49}}\\right) = P\\left(Z \\geq \\frac{-10}{17.14}\\right)\\]` }} />
            </div>
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\beta = P(Z \\geq -0.58) = 1 - P(Z < -0.58) \\approx 1 - 0.281 = 0.719 = 71.9\\%\\]` }} />
            </div>
          </div>
        </div>

        {/* Step 4: Calculate Power */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 4: Calculate Statistical Power</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>Power is the probability of correctly rejecting <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> when it's false:</p>
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\text{Power} = 1 - \\beta = 1 - 0.719 = 0.281 = 28.1\\%\\]` }} />
            </div>
            <p className="text-yellow-400 mt-3">
              <strong>Interpretation:</strong> With this test design, we have only a 28.1% chance of detecting 
              weak cement when the true mean is 4980 kg/cm². This is quite low!
            </p>
          </div>
        </div>

        {/* Example with different true mean */}
        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4">
          <h4 className="font-bold text-purple-400 mb-3">Example: Larger Effect Size</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>Let's see what happens when <span dangerouslySetInnerHTML={{ __html: `\\(\\mu_1 = 4950\\)` }} /> (larger deviation from <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />):</p>
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\beta = P\\left(Z \\geq \\frac{4970 - 4950}{17.14}\\right) = P(Z \\geq 1.17) \\approx 0.121\\]` }} />
            </div>
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\text{Power} = 1 - 0.121 = 0.879 = 87.9\\%\\]` }} />
            </div>
            <p className="text-green-400 mt-3">
              <strong>Much better!</strong> When the cement is significantly weaker (μ = 4950), 
              we have an 87.9% chance of detecting it.
            </p>
          </div>
        </div>

        {/* General Formulas */}
        <div className="bg-gradient-to-br from-teal-900/20 to-teal-800/20 border border-teal-500/30 rounded-lg p-4">
          <h4 className="font-bold text-teal-400 mb-3">General Formulas</h4>
          <div className="text-sm text-neutral-300 space-y-3">
            <p>For a left-sided test with known variance:</p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="font-bold text-blue-400 mb-2">Type I Error:</p>
                <div dangerouslySetInnerHTML={{ __html: `\\[\\alpha = \\Phi\\left(\\frac{c - \\mu_0}{\\sigma/\\sqrt{n}}\\right)\\]` }} />
              </div>
              <div>
                <p className="font-bold text-red-400 mb-2">Type II Error:</p>
                <div dangerouslySetInnerHTML={{ __html: `\\[\\beta = 1 - \\Phi\\left(\\frac{c - \\mu_1}{\\sigma/\\sqrt{n}}\\right)\\]` }} />
              </div>
            </div>
            <p className="text-xs text-neutral-400 mt-3">
              where <span dangerouslySetInnerHTML={{ __html: `\\(c\\)` }} /> is the critical value, 
              <span dangerouslySetInnerHTML={{ __html: `\\(\\Phi\\)` }} /> is the standard normal CDF
            </p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

export default function ErrorsAndPower() {
  // Scenario parameters
  const SCENARIO = {
    h0Mean: 5000,
    h1MeanDefault: 4980,
    sigma: 120,
    n: 49,
    criticalValueDefault: 4970,
    name: "Cement Strength Testing"
  };
  
  // State management
  const [criticalValue, setCriticalValue] = useState(SCENARIO.criticalValueDefault);
  const [trueMean, setTrueMean] = useState(SCENARIO.h1MeanDefault);
  const [sampleSize, setSampleSize] = useState(SCENARIO.n);
  const [showPowerCurve, setShowPowerCurve] = useState(false);
  
  // Refs for D3 elements
  const distributionRef = useRef(null);
  const powerCurveRef = useRef(null);
  
  // Calculations
  const getSE = (n) => SCENARIO.sigma / Math.sqrt(n);
  
  const calculateErrors = () => {
    const se = getSE(sampleSize);
    // Type I Error: P(reject H0 | H0 true) = P(X̄ < critical | μ = 5000)
    const alpha = jStat.normal.cdf(criticalValue, SCENARIO.h0Mean, se);
    // Type II Error: P(fail to reject H0 | H0 false) = P(X̄ ≥ critical | μ = trueMean)
    const beta = 1 - jStat.normal.cdf(criticalValue, trueMean, se);
    const power = 1 - beta;
    return { alpha, beta, power };
  };
  
  const errors = calculateErrors();
  
  // Distribution visualization
  useEffect(() => {
    if (!distributionRef.current) return;
    
    const svg = d3.select(distributionRef.current);
    svg.selectAll("*").remove();
    
    const width = distributionRef.current.clientWidth;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Calculate scales
    const se = getSE(sampleSize);
    const xMin = Math.min(SCENARIO.h0Mean - 4*se, trueMean - 4*se, 4900);
    const xMax = Math.max(SCENARIO.h0Mean + 4*se, trueMean + 4*se, 5100);
    
    const x = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, innerWidth]);
    
    const maxPDF = Math.max(
      jStat.normal.pdf(SCENARIO.h0Mean, SCENARIO.h0Mean, se),
      jStat.normal.pdf(trueMean, trueMean, se)
    ) * 1.1;
    
    const y = d3.scaleLinear()
      .domain([0, maxPDF])
      .range([innerHeight, 0]);
    
    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x)
        .tickSize(-innerHeight)
        .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#64748b")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5);

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#64748b")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(d => d.toFixed(0)))
      .style("color", "#9ca3af")
      .style("font-size", "12px")
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => d.toFixed(3)))
      .style("color", "#9ca3af")
      .style("font-size", "12px")
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Add axis labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 45)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "14px")
      .text("Sample Mean (kg/cm²)");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "14px")
      .text("Probability Density");
    
    // Generate curve data
    const generateCurve = (mean, std) => {
      const step = (xMax - xMin) / 200;
      return d3.range(xMin, xMax, step).map(val => ({
        x: val,
        y: jStat.normal.pdf(val, mean, std)
      }));
    };
    
    const h0Data = generateCurve(SCENARIO.h0Mean, se);
    const h1Data = generateCurve(trueMean, se);
    
    // Line generator
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    // Area generator
    const area = d3.area()
      .x(d => x(d.x))
      .y0(innerHeight)
      .y1(d => y(d.y))
      .curve(d3.curveBasis);
    
    // Add gradients
    const defs = svg.append("defs");
    
    const alphaGradient = defs.append("linearGradient")
      .attr("id", "alpha-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    
    alphaGradient.selectAll("stop")
      .data([
        {offset: "0%", color: "#3b82f6", opacity: 0.7},
        {offset: "100%", color: "#3b82f6", opacity: 0.3}
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color)
      .attr("stop-opacity", d => d.opacity);
    
    const betaGradient = defs.append("linearGradient")
      .attr("id", "beta-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    
    betaGradient.selectAll("stop")
      .data([
        {offset: "0%", color: "#ef4444", opacity: 0.7},
        {offset: "100%", color: "#ef4444", opacity: 0.3}
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color)
      .attr("stop-opacity", d => d.opacity);
    
    // Draw error areas with animation
    const typeIData = h0Data.filter(d => d.x <= criticalValue);
    g.append("path")
      .datum(typeIData)
      .attr("d", area)
      .attr("fill", "url(#alpha-gradient)")
      .attr("opacity", 0)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr("opacity", 0.8);
    
    const typeIIData = h1Data.filter(d => d.x >= criticalValue);
    g.append("path")
      .datum(typeIIData)
      .attr("d", area)
      .attr("fill", "url(#beta-gradient)")
      .attr("opacity", 0)
      .transition()
      .duration(1200)
      .delay(200)
      .ease(d3.easeCubicOut)
      .attr("opacity", 0.8);
    
    // Draw curves with animation and shadows
    g.append("path")
      .datum(h0Data)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))")
      .attr("opacity", 0)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr("opacity", 1);
    
    g.append("path")
      .datum(h1Data)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0 0 4px rgba(239, 68, 68, 0.3))")
      .attr("opacity", 0)
      .transition()
      .duration(1200)
      .delay(400)
      .ease(d3.easeCubicOut)
      .attr("opacity", 1);
    
    // Add critical value line with animation
    g.append("line")
      .attr("x1", x(criticalValue))
      .attr("x2", x(criticalValue))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#fbbf24")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5")
      .style("filter", "drop-shadow(0 0 4px rgba(251, 191, 36, 0.4))")
      .attr("opacity", 0)
      .transition()
      .duration(1200)
      .delay(600)
      .ease(d3.easeCubicOut)
      .attr("opacity", 1);
    
    // Add labels
    g.append("text")
      .attr("x", x(SCENARIO.h0Mean))
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#3b82f6")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("H₀: μ = 5000");
    
    g.append("text")
      .attr("x", x(trueMean))
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#ef4444")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(`H₁: μ = ${trueMean}`);
    
    // Add error labels in the shaded regions
    if (errors.alpha > 0.01) {
      const alphaX = x(criticalValue - se/2);
      const alphaY = y(jStat.normal.pdf(criticalValue - se/2, SCENARIO.h0Mean, se)) / 2;
      
      g.append("text")
        .attr("x", alphaX)
        .attr("y", alphaY)
        .attr("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(`α = ${(errors.alpha * 100).toFixed(1)}%`);
    }
    
    if (errors.beta > 0.01) {
      const betaX = x(criticalValue + se/2);
      const betaY = y(jStat.normal.pdf(criticalValue + se/2, trueMean, se)) / 2;
      
      g.append("text")
        .attr("x", betaX)
        .attr("y", betaY)
        .attr("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(`β = ${(errors.beta * 100).toFixed(1)}%`);
    }
    
  }, [criticalValue, trueMean, sampleSize, errors]);
  
  // Power curve visualization
  useEffect(() => {
    if (!powerCurveRef.current || !showPowerCurve) return;
    
    const svg = d3.select(powerCurveRef.current);
    svg.selectAll("*").remove();
    
    const width = powerCurveRef.current.clientWidth;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Generate power curve data
    const generatePowerCurve = (n) => {
      const means = d3.range(4900, 5000, 2);
      return means.map(mean => {
        const se = SCENARIO.sigma / Math.sqrt(n);
        const beta = 1 - jStat.normal.cdf(criticalValue, mean, se);
        return { mean, power: 1 - beta };
      });
    };
    
    const sampleSizes = [25, 49, 100];
    const powerData = sampleSizes.map(n => ({
      n,
      data: generatePowerCurve(n)
    }));
    
    // Scales
    const x = d3.scaleLinear()
      .domain([4900, 5000])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);
    
    const colorScale = d3.scaleOrdinal()
      .domain(sampleSizes)
      .range(['#ef4444', '#f59e0b', '#10b981']);
    
    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x)
        .tickSize(-innerHeight)
        .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#64748b")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5);

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#64748b")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .style("color", "#9ca3af")
      .style("font-size", "12px")
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => (d * 100).toFixed(0) + "%"))
      .style("color", "#9ca3af")
      .style("font-size", "12px")
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Add axis labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 45)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "14px")
      .text("True Mean μ₁ (kg/cm²)");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "14px")
      .text("Power (1 - β)");
    
    // Add reference lines
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", y(0.8))
      .attr("y2", y(0.8))
      .attr("stroke", "#10b981")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.5);
    
    g.append("text")
      .attr("x", innerWidth - 5)
      .attr("y", y(0.8) - 5)
      .attr("text-anchor", "end")
      .attr("fill", "#10b981")
      .style("font-size", "12px")
      .text("80% (Target)");
    
    // Line generator
    const line = d3.line()
      .x(d => x(d.mean))
      .y(d => y(d.power))
      .curve(d3.curveBasis);
    
    // Draw power curves with animation
    powerData.forEach((series, index) => {
      g.append("path")
        .datum(series.data)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", colorScale(series.n))
        .attr("stroke-width", 3)
        .style("filter", `drop-shadow(0 0 4px ${colorScale(series.n)}30)`)
        .attr("opacity", 0)
        .transition()
        .duration(1200)
        .delay(index * 200)
        .ease(d3.easeCubicOut)
        .attr("opacity", 1);
      
      // Add label with animation
      const lastPoint = series.data[series.data.length - 1];
      g.append("text")
        .attr("x", x(lastPoint.mean) + 10)
        .attr("y", y(lastPoint.power))
        .attr("fill", colorScale(series.n))
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(800 + index * 200)
        .ease(d3.easeCubicOut)
        .attr("opacity", 1)
        .text(`n = ${series.n}`);
    });
    
    // Add current point with animation
    const currentPower = errors.power;
    g.append("circle")
      .attr("cx", x(trueMean))
      .attr("cy", y(currentPower))
      .attr("r", 0)
      .attr("fill", colorScale(sampleSize))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .style("filter", `drop-shadow(0 0 6px ${colorScale(sampleSize)}50)`)
      .transition()
      .duration(800)
      .delay(1600)
      .ease(d3.easeBounceOut)
      .attr("r", 8);
    
  }, [criticalValue, trueMean, sampleSize, showPowerCurve, errors]);
  
  return (
    <VisualizationContainer
      title="Type I & II Errors and Statistical Power"
      description="Explore the fundamental trade-offs in hypothesis testing through the cement strength scenario."
    >
      <div className="space-y-8">
        {/* Back to Hub Button */}
        <BackToHub chapter={6} />

        {/* Learning Context Section */}
        <VisualizationSection>
          <InterpretationBox title="Learning Context" theme="blue">
            <p className="text-sm">
              This module examines the inherent trade-offs in hypothesis testing. Every statistical decision carries 
              risk—we might reject a true null hypothesis (Type I error) or fail to detect a false null hypothesis 
              (Type II error). Understanding these errors is essential for designing effective studies.
            </p>
            <p className="text-sm mt-2">
              <strong>Connection to Practice:</strong> In quality control, medical testing, and scientific research, 
              the consequences of these errors differ dramatically. A false positive in cancer screening causes anxiety; 
              a false negative could be fatal.
            </p>
            <p className="text-sm mt-2">
              <strong>Key Insight:</strong> We can control Type I error directly (α), but Type II error (β) depends on 
              the true parameter value, sample size, and effect magnitude.
            </p>
          </InterpretationBox>
          
          <SemanticGradientGrid title="Core Concepts" theme="purple">
            <SemanticGradientCard
              title="Type I Error (α)"
              description="Rejecting a true null hypothesis"
              formula={`\\[\\alpha = P(\\text{Reject } H_0 | H_0 \\text{ true})\\]`}
              note="Set by researcher before testing (typically 0.05)"
              theme="red"
            />
            <SemanticGradientCard
              title="Type II Error (β)"
              description="Failing to reject a false null"
              formula={`\\[\\beta = P(\\text{Fail to reject } H_0 | H_1 \\text{ true})\\]`}
              note="Depends on true parameter value and sample size"
              theme="yellow"
            />
            <SemanticGradientCard
              title="Statistical Power"
              description="Probability of detecting a true effect"
              formula={`\\[\\text{Power} = 1 - \\beta\\]`}
              note="Increases with larger n, larger effect size, or higher α"
              theme="green"
            />
            <SemanticGradientCard
              title="Trade-off Principle"
              description="α and β are inversely related"
              formula={`\\[\\alpha \\downarrow \\Rightarrow \\beta \\uparrow\\]`}
              note="Reducing one error increases the other (for fixed n)"
              theme="blue"
            />
          </SemanticGradientGrid>
        </VisualizationSection>

        {/* Enhanced Introduction with Analogies */}
        <VisualizationSection>
          <div className="space-y-6">
            {/* Intuitive Analogies */}
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-xl p-6 border border-purple-700/30">
              <h3 className="text-lg font-bold text-purple-300 mb-4">Understanding Type I & II Errors Through Analogies</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-400 mb-3">🎯 Medical Testing Analogy</h4>
                  <ul className="space-y-2 text-xs text-neutral-300">
                    <li>• <span className="text-blue-300">Type I Error:</span> False positive - telling a healthy person they're sick</li>
                    <li>• <span className="text-red-300">Type II Error:</span> False negative - telling a sick person they're healthy</li>
                    <li>• <span className="text-green-300">Power:</span> Test's ability to detect illness when present</li>
                  </ul>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-yellow-400 mb-3">⚖️ Legal System Analogy</h4>
                  <ul className="space-y-2 text-xs text-neutral-300">
                    <li>• <span className="text-blue-300">Type I Error:</span> Convicting an innocent person</li>
                    <li>• <span className="text-red-300">Type II Error:</span> Acquitting a guilty person</li>
                    <li>• <span className="text-green-300">Power:</span> System's ability to convict the guilty</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-700/30">
                <p className="text-xs text-neutral-300">
                  <span className="font-semibold text-blue-400">Key Insight:</span> In both cases, we start by assuming 
                  "innocence" (null hypothesis) and require strong evidence to reject it. Different contexts have different 
                  consequences for each type of error!
                </p>
              </div>
            </div>
            
            {/* The Scenario */}
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-white">The Cement Quality Testing Scenario</h3>
              <p className="text-neutral-300 max-w-3xl mx-auto">
                A cement manufacturer claims their process produces cement with mean strength μ = 5000 kg/cm². 
                We test batches to verify this claim. What errors can we make, and how do we balance them?
              </p>
              <div className="bg-neutral-800 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-sm text-neutral-300">
                  <strong>H₀:</strong> μ = 5000 (process meets specifications)<br/>
                  <strong>H₁:</strong> μ &lt; 5000 (process produces weaker cement)<br/>
                  <strong>Given:</strong> σ = 120, initial n = 49, critical region: X̄ &lt; 4970
                </p>
              </div>
            </div>
            
            {/* Why This Matters */}
            <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 rounded-xl p-4 border border-yellow-700/30">
              <h4 className="text-sm font-bold text-yellow-300 mb-2">Real-World Consequences</h4>
              <div className="grid md:grid-cols-2 gap-3 text-xs text-neutral-300">
                <div>
                  <p className="font-semibold text-blue-300 mb-1">🚨 Type I Error (False Alarm):</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Reject good batches of cement</li>
                    <li>• Economic loss, production delays</li>
                    <li>• Damaged supplier relationships</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-red-300 mb-1">⚠️ Type II Error (Missed Defect):</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Accept weak cement</li>
                    <li>• Building safety compromised</li>
                    <li>• Potential structural failures</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </VisualizationSection>

        {/* Main Visualization */}
        <GraphContainer title="Sampling Distributions Under H₀ and H₁">
          <svg ref={distributionRef} className="w-full"></svg>
        </GraphContainer>

        {/* Error Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-blue-400 mt-1" />
              <div>
                <h4 className="text-lg font-bold text-blue-400 mb-2">Type I Error (α)</h4>
                <p className="text-sm text-neutral-300 mb-3">
                  Rejecting H₀ when it's true - declaring good cement as defective
                </p>
                <div className="text-3xl font-mono font-bold text-blue-400">
                  {(errors.alpha * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  <strong>Consequence:</strong> Economic loss, wasted good batches
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-500/30 rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-400 mt-1" />
              <div>
                <h4 className="text-lg font-bold text-red-400 mb-2">Type II Error (β)</h4>
                <p className="text-sm text-neutral-300 mb-3">
                  Failing to reject H₀ when it's false - accepting weak cement
                </p>
                <div className="text-3xl font-mono font-bold text-red-400">
                  {(errors.beta * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  <strong>Consequence:</strong> Safety risk, potential structural failure
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Power Display */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-500/30 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Target className="w-8 h-8 text-green-400" />
              <div>
                <h4 className="text-lg font-bold text-green-400">Statistical Power</h4>
                <p className="text-sm text-neutral-300">
                  Probability of correctly detecting weak cement when μ = {trueMean}
                </p>
              </div>
            </div>
            <div className="text-4xl font-mono font-bold text-green-400">
              {(errors.power * 100).toFixed(1)}%
            </div>
          </div>
        </motion.div>

        {/* Interactive Controls */}
        <VisualizationSection className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-6 border border-neutral-700/50">
          <h4 className="text-lg font-bold text-white mb-6">Experiment with the Trade-offs</h4>
          
          <div className="grid md:grid-cols-3 gap-6">
            <ControlGroup label="Critical Value (kg/cm²)">
              <input
                type="range"
                min={4960}
                max={4990}
                step={1}
                value={criticalValue}
                onChange={(e) => setCriticalValue(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-neutral-400 mt-2">
                <span>4960</span>
                <span className="font-mono text-white">{criticalValue}</span>
                <span>4990</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Move left: ↓α, ↑β | Move right: ↑α, ↓β
              </p>
            </ControlGroup>

            <ControlGroup label="True Mean μ₁ (kg/cm²)">
              <input
                type="range"
                min={4950}
                max={5000}
                step={1}
                value={trueMean}
                onChange={(e) => setTrueMean(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-neutral-400 mt-2">
                <span>4950</span>
                <span className="font-mono text-white">{trueMean}</span>
                <span>5000</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Effect size: {Math.abs(trueMean - SCENARIO.h0Mean)} kg/cm²
              </p>
            </ControlGroup>

            <ControlGroup label="Sample Size (n)">
              <input
                type="range"
                min={25}
                max={100}
                step={5}
                value={sampleSize}
                onChange={(e) => setSampleSize(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-neutral-400 mt-2">
                <span>25</span>
                <span className="font-mono text-white">{sampleSize}</span>
                <span>100</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                SE = σ/√n = {getSE(sampleSize).toFixed(1)}
              </p>
            </ControlGroup>
          </div>
        </VisualizationSection>

        {/* Power Curves */}
        <div className="space-y-4">
          <button
            onClick={() => setShowPowerCurve(!showPowerCurve)}
            className={`w-full px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
              showPowerCurve
                ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-500/50'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
            }`}
          >
            {showPowerCurve ? "Hide" : "Show"} Power Curves
          </button>
          
          {showPowerCurve && (
            <GraphContainer title="Power Curves for Different Sample Sizes">
              <svg ref={powerCurveRef} className="w-full"></svg>
            </GraphContainer>
          )}
        </div>

        {/* Worked Example Section */}
        <WorkedExample />

        {/* Enhanced Key Insights */}
        <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-teal-400 mb-6">Key Insights & Understanding</h3>
          
          <div className="space-y-6">
            {/* The Fundamental Trade-off */}
            <div className="bg-gradient-to-br from-blue-900/20 to-red-900/20 rounded-lg p-5 border border-purple-700/30">
              <h4 className="font-bold text-white mb-3 text-lg">The Fundamental Trade-off: You Can't Have It All</h4>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-800/50 rounded p-3 text-center">
                  <p className="text-xs font-semibold text-blue-400 mb-2">Decrease α</p>
                  <p className="text-xs text-neutral-300">Stricter evidence required</p>
                  <p className="text-lg font-bold text-red-400 mt-1">↑ β increases</p>
                </div>
                <div className="bg-gray-800/50 rounded p-3 text-center">
                  <p className="text-xs font-semibold text-red-400 mb-2">Decrease β</p>
                  <p className="text-xs text-neutral-300">More sensitive test</p>
                  <p className="text-lg font-bold text-blue-400 mt-1">↑ α increases</p>
                </div>
                <div className="bg-gray-800/50 rounded p-3 text-center">
                  <p className="text-xs font-semibold text-green-400 mb-2">Decrease both?</p>
                  <p className="text-xs text-neutral-300">Only one way:</p>
                  <p className="text-lg font-bold text-green-400 mt-1">↑ n (sample size)</p>
                </div>
              </div>
              <p className="text-xs text-neutral-400">
                <span className="font-semibold">Think of it like a seesaw:</span> When one error goes down, the other goes up — unless you change the fulcrum (sample size)!
              </p>
            </div>
            
            {/* Power Factors */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neutral-800/50 rounded p-4">
                <h4 className="font-bold text-white mb-3">What Makes a Test Powerful?</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 text-lg mt-0.5">↑</span>
                    <div>
                      <p className="font-semibold text-green-400">Effect Size (δ)</p>
                      <p className="text-xs text-neutral-400">Bigger differences are easier to detect</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 text-lg mt-0.5">↑</span>
                    <div>
                      <p className="font-semibold text-green-400">Sample Size (n)</p>
                      <p className="text-xs text-neutral-400">More data = clearer picture</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 text-lg mt-0.5">↑</span>
                    <div>
                      <p className="font-semibold text-green-400">Significance Level (α)</p>
                      <p className="text-xs text-neutral-400">Easier to reject when less strict</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 text-lg mt-0.5">↓</span>
                    <div>
                      <p className="font-semibold text-red-400">Variance (σ²)</p>
                      <p className="text-xs text-neutral-400">Less noise = clearer signal</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-neutral-800/50 rounded p-4">
                <h4 className="font-bold text-white mb-3">Sample Size Planning</h4>
                <div className="bg-gray-900/50 rounded p-3 mb-3">
                  <p className="text-xs font-mono text-neutral-300 mb-2">
                    n ≈ ((z_α + z_β)σ / δ)²
                  </p>
                  <p className="text-xs text-neutral-400">
                    where δ = |μ₀ - μ₁| is the effect you want to detect
                  </p>
                </div>
                <div className="text-xs space-y-1 text-neutral-300">
                  <p>• Want 80% power? Use z_β = 0.84</p>
                  <p>• Want 90% power? Use z_β = 1.28</p>
                  <p>• Smaller effects need larger samples!</p>
                </div>
              </div>
            </div>
            
            {/* Context Matters */}
            <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-lg p-5 border border-yellow-700/30">
              <h4 className="font-bold text-yellow-400 mb-3">Context Determines Error Priority</h4>
              <div className="grid md:grid-cols-3 gap-3 text-xs">
                <div className="bg-gray-800/50 rounded p-3">
                  <p className="font-semibold text-blue-300 mb-2">Minimize Type I (α)</p>
                  <p className="text-neutral-300 mb-2">When false positives are costly:</p>
                  <ul className="space-y-1 text-neutral-400">
                    <li>• Criminal trials</li>
                    <li>• Scientific publications</li>
                    <li>• FDA drug approval</li>
                  </ul>
                </div>
                <div className="bg-gray-800/50 rounded p-3">
                  <p className="font-semibold text-red-300 mb-2">Minimize Type II (β)</p>
                  <p className="text-neutral-300 mb-2">When false negatives are dangerous:</p>
                  <ul className="space-y-1 text-neutral-400">
                    <li>• Cancer screening</li>
                    <li>• Airport security</li>
                    <li>• Quality control</li>
                  </ul>
                </div>
                <div className="bg-gray-800/50 rounded p-3">
                  <p className="font-semibold text-green-300 mb-2">Balance Both</p>
                  <p className="text-neutral-300 mb-2">When both errors matter:</p>
                  <ul className="space-y-1 text-neutral-400">
                    <li>• A/B testing</li>
                    <li>• Medical diagnosis</li>
                    <li>• Manufacturing QC</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </VisualizationSection>

        {/* Decision Matrix */}
        <VisualizationSection>
          <h3 className="text-xl font-bold text-white mb-4">Decision Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-3 px-4 text-neutral-400">Reality</th>
                  <th className="text-center py-3 px-4 text-neutral-400">
                    Reject H₀<br/>
                    <span className="text-xs font-normal">(X̄ &lt; {criticalValue})</span>
                  </th>
                  <th className="text-center py-3 px-4 text-neutral-400">
                    Fail to Reject H₀<br/>
                    <span className="text-xs font-normal">(X̄ ≥ {criticalValue})</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-700/50">
                  <td className="py-3 px-4 text-neutral-300">
                    H₀ True (μ = 5000)
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-blue-400 font-bold">Type I Error</span><br/>
                    <span className="text-neutral-500">α = {(errors.alpha * 100).toFixed(1)}%</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-green-400">✓ Correct</span><br/>
                    <span className="text-neutral-500">{((1 - errors.alpha) * 100).toFixed(1)}%</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-neutral-300">
                    H₀ False (μ = {trueMean})
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-green-400">✓ Correct</span><br/>
                    <span className="text-neutral-500">Power = {(errors.power * 100).toFixed(1)}%</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-red-400 font-bold">Type II Error</span><br/>
                    <span className="text-neutral-500">β = {(errors.beta * 100).toFixed(1)}%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </VisualizationSection>
      </div>
    </VisualizationContainer>
  );
}