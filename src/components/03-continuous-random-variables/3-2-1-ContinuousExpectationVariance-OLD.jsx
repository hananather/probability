"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { RangeSlider } from '../ui/RangeSlider';
import { ProgressBar, ProgressNavigation } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/button';
import { jStat } from "jstat";
import { useSafeMathJax } from '../../utils/mathJaxFix';

// Memoized LaTeX components to prevent re-rendering
const FormulaDisplay = React.memo(function FormulaDisplay({ formula, color = "text-white" }) {
  const contentRef = useRef(null);
  
  // Use safe MathJax processing with error handling
  useSafeMathJax(contentRef, [formula]);
  
  return (
    <div ref={contentRef} className={cn("text-center", color)}>
      <span dangerouslySetInnerHTML={{ __html: formula }} />
    </div>
  );
});

const ContinuousExpectationVariance = () => {
  const colorScheme = createColorScheme('probability');
  
  // Refs for D3 visualizations
  const discreteSvgRef = useRef(null);
  const continuousSvgRef = useRef(null);
  const comparisonSvgRef = useRef(null);
  const integralSvgRef = useRef(null);
  
  // Learning progression state
  const [stage, setStage] = useState(1);
  const [substage, setSubstage] = useState(0);
  
  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDiscreteBars, setShowDiscreteBars] = useState(true);
  const [numBars, setNumBars] = useState(6);
  const [showContinuousCurve, setShowContinuousCurve] = useState(false);
  const [showIntegralArea, setShowIntegralArea] = useState(false);
  const [showCalculationSteps, setShowCalculationSteps] = useState(false);
  
  // Example parameters - using uniform distribution as primary example
  const [lowerBound, setLowerBound] = useState(2);
  const [upperBound, setUpperBound] = useState(8);
  
  // Calculated values
  const expectation = (lowerBound + upperBound) / 2;
  const variance = Math.pow(upperBound - lowerBound, 2) / 12;
  const stdDev = Math.sqrt(variance);
  
  // Stage content configuration
  const stages = [
    {
      title: "Why Do We Need Continuous Expectation?",
      substages: [
        {
          subtitle: "The Limitation of Discrete",
          description: "Imagine measuring the exact arrival time of a bus that arrives between 2:00 and 2:10. How many possible times are there?",
          showDiscrete: true,
          showContinuous: false,
          numBars: 6
        },
        {
          subtitle: "Infinite Possibilities",
          description: "As we get more precise (minutes → seconds → milliseconds), we need more and more bars. Eventually, we need infinitely many!",
          showDiscrete: true,
          showContinuous: false,
          numBars: 20
        },
        {
          subtitle: "Enter the Continuous",
          description: "When we have infinite possibilities, we replace bars with a smooth curve and sums with integrals.",
          showDiscrete: true,
          showContinuous: true,
          numBars: 50
        }
      ]
    },
    {
      title: "From Sum to Integral",
      substages: [
        {
          subtitle: "The Discrete Formula",
          description: "For discrete variables, we multiply each value by its probability and sum them up.",
          formula: "\\(E[X] = \\sum_{i} x_i \\cdot P(X = x_i)\\)",
          showComparison: true,
          highlightDiscrete: true
        },
        {
          subtitle: "The Continuous Analog",
          description: "For continuous variables, we multiply each value by its probability density and integrate.",
          formula: "\\(E[X] = \\int_{-\\infty}^{\\infty} x \\cdot f(x) \\, dx\\)",
          showComparison: true,
          highlightContinuous: true
        },
        {
          subtitle: "The Connection",
          description: "The integral is just the limit of the sum as we make our intervals infinitely small!",
          formula: "\\(\\sum \\Delta x \\cdot f(x) \\to \\int f(x) \\, dx\\)",
          showComparison: true,
          showTransition: true
        }
      ]
    },
    {
      title: "Calculating Step by Step",
      substages: [
        {
          subtitle: "Step 1: Identify the PDF",
          description: "For a uniform distribution between a and b, the probability density is constant.",
          formula: "\\(f(x) = \\frac{1}{b-a} \\text{ for } a \\leq x \\leq b\\)",
          showPDF: true
        },
        {
          subtitle: "Step 2: Set Up the Integral",
          description: "We multiply x by the PDF and integrate over the range.",
          formula: "\\(E[X] = \\int_{a}^{b} x \\cdot \\frac{1}{b-a} \\, dx\\)",
          showIntegralSetup: true
        },
        {
          subtitle: "Step 3: Evaluate",
          description: "Pull out the constant and integrate x.",
          formula: "\\(E[X] = \\frac{1}{b-a} \\cdot \\frac{x^2}{2} \\Big|_a^b = \\frac{a+b}{2}\\)",
          showIntegralSteps: true
        },
        {
          subtitle: "Step 4: Interpret",
          description: "The expected value is simply the midpoint! This makes intuitive sense for a uniform distribution.",
          showResult: true
        }
      ]
    },
    {
      title: "Variance: Measuring Spread",
      substages: [
        {
          subtitle: "What is Variance?",
          description: "Variance measures how spread out values are from the mean. It's the average squared deviation.",
          formula: "\\(\\text{Var}(X) = E[(X - E[X])^2] = E[X^2] - (E[X])^2\\)",
          showVarianceConcept: true
        },
        {
          subtitle: "Calculating E[X²]",
          description: "First, we need the expected value of X².",
          formula: "\\(E[X^2] = \\int_{a}^{b} x^2 \\cdot \\frac{1}{b-a} \\, dx = \\frac{a^2 + ab + b^2}{3}\\)",
          showE2Calculation: true
        },
        {
          subtitle: "Final Variance",
          description: "Using the formula Var(X) = E[X²] - (E[X])²",
          formula: "\\(\\text{Var}(X) = \\frac{(b-a)^2}{12}\\)",
          showVarianceResult: true
        }
      ]
    },
    {
      title: "Real-World Application",
      substages: [
        {
          subtitle: "Bus Arrival Example",
          description: "A bus arrives uniformly between 2:00 PM and 2:10 PM. When should you expect it?",
          showApplication: true,
          applicationData: {
            context: "Bus arrival time",
            a: 0,
            b: 10,
            unit: "minutes after 2:00 PM"
          }
        },
        {
          subtitle: "Quality Control",
          description: "A machine cuts rods to 100mm ± 2mm uniformly. What's the average length and variance?",
          showApplication: true,
          applicationData: {
            context: "Rod length",
            a: 98,
            b: 102,
            unit: "mm"
          }
        }
      ]
    }
  ];
  
  const currentStage = stages[stage - 1];
  const currentSubstage = currentStage.substages[substage];
  
  // Helper function to animate transition
  const animateTransition = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  }, []);
  
  // Navigation functions
  const canGoNext = substage < currentStage.substages.length - 1 || stage < stages.length;
  const canGoPrevious = substage > 0 || stage > 1;
  
  const handleNext = () => {
    if (substage < currentStage.substages.length - 1) {
      setSubstage(substage + 1);
    } else if (stage < stages.length) {
      setStage(stage + 1);
      setSubstage(0);
    }
    animateTransition();
  };
  
  const handlePrevious = () => {
    if (substage > 0) {
      setSubstage(substage - 1);
    } else if (stage > 1) {
      setStage(stage - 1);
      setSubstage(stages[stage - 2].substages.length - 1);
    }
    animateTransition();
  };
  
  // Draw discrete to continuous transition (Stage 1)
  useEffect(() => {
    if (!discreteSvgRef.current || stage !== 1) return;
    
    const svg = d3.select(discreteSvgRef.current);
    const { width } = discreteSvgRef.current.getBoundingClientRect();
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    svg.selectAll("*").interrupt().remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const xScale = d3.scaleLinear()
      .domain([lowerBound - 0.5, upperBound + 0.5])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.4])
      .range([height - margin.bottom, margin.top]);
    
    // Grid
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.2)
      .selectAll("line")
      .style("stroke", colors.chart.grid);
    
    // Axes
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text").attr("fill", colors.chart.text);
    
    const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => d.toFixed(1)));
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text").attr("fill", colors.chart.text);
    
    // Labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .attr("font-size", "14px")
      .text("Time (minutes after 2:00 PM)");
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .attr("font-size", "14px")
      .text("Probability");
    
    // Draw discrete bars
    if (currentSubstage.showDiscrete) {
      const barWidth = (upperBound - lowerBound) / currentSubstage.numBars;
      const barData = d3.range(currentSubstage.numBars).map(i => ({
        x: lowerBound + i * barWidth + barWidth / 2,
        height: 1 / (upperBound - lowerBound)
      }));
      
      svg.selectAll("rect.bar")
        .data(barData)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x - barWidth / 2))
        .attr("y", d => yScale(d.height))
        .attr("width", xScale(lowerBound + barWidth) - xScale(lowerBound))
        .attr("height", d => yScale(0) - yScale(d.height))
        .attr("fill", colorScheme.chart.primary)
        .attr("opacity", 0.6)
        .attr("stroke", colorScheme.chart.primaryLight)
        .attr("stroke-width", 1)
        .transition()
        .duration(isAnimating ? 500 : 0)
        .attr("opacity", currentSubstage.showContinuous ? 0.3 : 0.6);
    }
    
    // Draw continuous curve
    if (currentSubstage.showContinuous) {
      const lineData = d3.range(lowerBound, upperBound + 0.01, 0.01).map(x => ({
        x: x,
        y: 1 / (upperBound - lowerBound)
      }));
      
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveLinear);
      
      const path = svg.append("path")
        .datum(lineData)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.primaryLight)
        .attr("stroke-width", 3)
        .attr("opacity", 0);
      
      if (isAnimating) {
        path.transition()
          .duration(1000)
          .attr("opacity", 1);
      } else {
        path.attr("opacity", 1);
      }
      
      // Add shaded area under curve
      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(yScale(0))
        .y1(d => yScale(d.y))
        .curve(d3.curveLinear);
      
      svg.append("path")
        .datum(lineData)
        .attr("d", area)
        .attr("fill", colorScheme.chart.primary)
        .attr("opacity", 0)
        .transition()
        .duration(isAnimating ? 1000 : 0)
        .attr("opacity", 0.2);
    }
    
  }, [stage, substage, lowerBound, upperBound, isAnimating, colorScheme]);
  
  // Draw comparison visualization (Stage 2)
  useEffect(() => {
    if (!comparisonSvgRef.current || stage !== 2) return;
    
    const svg = d3.select(comparisonSvgRef.current);
    const { width } = comparisonSvgRef.current.getBoundingClientRect();
    const height = 350;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    svg.selectAll("*").interrupt().remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Split visualization into two halves
    const halfWidth = (width - margin.left - margin.right) / 2 - 20;
    
    // Discrete visualization (left)
    const discreteG = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Continuous visualization (right)
    const continuousG = svg.append("g")
      .attr("transform", `translate(${margin.left + halfWidth + 40}, ${margin.top})`);
    
    const plotHeight = height - margin.top - margin.bottom;
    
    // Discrete bars
    if (currentSubstage.highlightDiscrete || currentSubstage.showTransition) {
      const barData = [
        { x: 1, p: 0.1 },
        { x: 2, p: 0.2 },
        { x: 3, p: 0.3 },
        { x: 4, p: 0.25 },
        { x: 5, p: 0.15 }
      ];
      
      const xScale = d3.scaleBand()
        .domain(barData.map(d => d.x))
        .range([0, halfWidth])
        .padding(0.2);
      
      const yScale = d3.scaleLinear()
        .domain([0, 0.4])
        .range([plotHeight, 0]);
      
      // Grid
      discreteG.append("g")
        .call(d3.axisLeft(yScale)
          .ticks(4)
          .tickSize(-halfWidth)
          .tickFormat("")
        )
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.2)
        .selectAll("line")
        .style("stroke", colors.chart.grid);
      
      // Bars
      discreteG.selectAll("rect")
        .data(barData)
        .join("rect")
        .attr("x", d => xScale(d.x))
        .attr("y", d => yScale(d.p))
        .attr("width", xScale.bandwidth())
        .attr("height", d => plotHeight - yScale(d.p))
        .attr("fill", colorScheme.chart.primary)
        .attr("opacity", currentSubstage.highlightDiscrete ? 0.8 : 0.3)
        .attr("rx", 4);
      
      // Labels
      discreteG.selectAll("text.value")
        .data(barData)
        .join("text")
        .attr("class", "value")
        .attr("x", d => xScale(d.x) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.p) - 5)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.text)
        .attr("font-size", "12px")
        .text(d => `${d.x} × ${d.p}`);
      
      // Axes
      discreteG.append("g")
        .attr("transform", `translate(0,${plotHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("path, line")
        .attr("stroke", colors.chart.grid);
      
      discreteG.append("text")
        .attr("x", halfWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.primary)
        .attr("font-weight", "bold")
        .text("Discrete: Sum");
    }
    
    // Continuous curve
    if (currentSubstage.highlightContinuous || currentSubstage.showTransition) {
      const xScale = d3.scaleLinear()
        .domain([0, 6])
        .range([0, halfWidth]);
      
      const yScale = d3.scaleLinear()
        .domain([0, 0.4])
        .range([plotHeight, 0]);
      
      // Grid
      continuousG.append("g")
        .call(d3.axisLeft(yScale)
          .ticks(4)
          .tickSize(-halfWidth)
          .tickFormat("")
        )
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.2)
        .selectAll("line")
        .style("stroke", colors.chart.grid);
      
      // Normal-like curve
      const curveData = d3.range(0, 6, 0.1).map(x => ({
        x: x,
        y: 0.3 * Math.exp(-0.5 * Math.pow((x - 3) / 1.5, 2))
      }));
      
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveBasis);
      
      continuousG.append("path")
        .datum(curveData)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 3)
        .attr("opacity", currentSubstage.highlightContinuous ? 1 : 0.3);
      
      // Shaded area
      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(plotHeight)
        .y1(d => yScale(d.y))
        .curve(d3.curveBasis);
      
      continuousG.append("path")
        .datum(curveData)
        .attr("d", area)
        .attr("fill", colorScheme.chart.secondary)
        .attr("opacity", 0.2);
      
      // Axes
      continuousG.append("g")
        .attr("transform", `translate(0,${plotHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("path, line")
        .attr("stroke", colors.chart.grid);
      
      continuousG.append("text")
        .attr("x", halfWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.secondary)
        .attr("font-weight", "bold")
        .text("Continuous: Integral");
    }
    
    // Transition arrow
    if (currentSubstage.showTransition) {
      const arrowG = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);
      
      arrowG.append("path")
        .attr("d", "M-20,0 L20,0")
        .attr("stroke", colors.chart.text)
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead)")
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .attr("opacity", 1);
      
      svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 8)
        .attr("refY", 0)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", colors.chart.text);
    }
    
  }, [stage, substage, isAnimating, colorScheme]);
  
  // Draw step-by-step calculation (Stage 3)
  useEffect(() => {
    if (!integralSvgRef.current || stage !== 3) return;
    
    const svg = d3.select(integralSvgRef.current);
    const { width } = integralSvgRef.current.getBoundingClientRect();
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    svg.selectAll("*").interrupt().remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.3])
      .range([height - margin.bottom, margin.top]);
    
    // Grid
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.2)
      .selectAll("line")
      .style("stroke", colors.chart.grid);
    
    // Axes
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text").attr("fill", colors.chart.text);
    
    const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => d.toFixed(2)));
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text").attr("fill", colors.chart.text);
    
    // PDF visualization
    if (currentSubstage.showPDF || currentSubstage.showIntegralSetup || currentSubstage.showIntegralSteps) {
      const pdfHeight = 1 / (upperBound - lowerBound);
      
      // PDF rectangle
      svg.append("rect")
        .attr("x", xScale(lowerBound))
        .attr("y", yScale(pdfHeight))
        .attr("width", xScale(upperBound) - xScale(lowerBound))
        .attr("height", yScale(0) - yScale(pdfHeight))
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .transition()
        .duration(isAnimating ? 500 : 0)
        .attr("opacity", 1);
      
      // PDF label
      svg.append("text")
        .attr("x", (xScale(lowerBound) + xScale(upperBound)) / 2)
        .attr("y", yScale(pdfHeight) - 10)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.primary)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(`f(x) = 1/${upperBound - lowerBound} = ${(pdfHeight).toFixed(3)}`);
    }
    
    // Integral visualization
    if (currentSubstage.showIntegralSetup || currentSubstage.showIntegralSteps) {
      const pdfHeight = 1 / (upperBound - lowerBound);
      
      // Show x * f(x) curve
      const curveData = d3.range(lowerBound, upperBound + 0.1, 0.1).map(x => ({
        x: x,
        y: x * pdfHeight / 10 // Scale down for visualization
      }));
      
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveLinear);
      
      svg.append("path")
        .datum(curveData)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0)
        .transition()
        .duration(isAnimating ? 500 : 0)
        .attr("opacity", 1);
      
      // Shaded area under x * f(x)
      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(yScale(0))
        .y1(d => yScale(d.y))
        .curve(d3.curveLinear);
      
      svg.append("path")
        .datum(curveData)
        .attr("d", area)
        .attr("fill", colorScheme.chart.secondary)
        .attr("opacity", 0)
        .transition()
        .duration(isAnimating ? 500 : 0)
        .attr("opacity", 0.2);
      
      // Label
      svg.append("text")
        .attr("x", (xScale(lowerBound) + xScale(upperBound)) / 2)
        .attr("y", yScale(0.15))
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.secondary)
        .attr("font-size", "14px")
        .text("x · f(x) (scaled for visibility)");
    }
    
    // Result visualization
    if (currentSubstage.showResult) {
      // Vertical line at expectation
      svg.append("line")
        .attr("x1", xScale(expectation))
        .attr("x2", xScale(expectation))
        .attr("y1", yScale(0))
        .attr("y2", yScale(0.25))
        .attr("stroke", colorScheme.chart.highlight)
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0)
        .transition()
        .duration(isAnimating ? 500 : 0)
        .attr("opacity", 1);
      
      // Expectation label
      svg.append("text")
        .attr("x", xScale(expectation))
        .attr("y", yScale(0.27))
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.highlight)
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(`E[X] = ${expectation}`);
    }
    
  }, [stage, substage, lowerBound, upperBound, expectation, isAnimating, colorScheme]);
  
  // Draw variance visualization (Stage 4)
  useEffect(() => {
    if (!continuousSvgRef.current || stage !== 4) return;
    
    const svg = d3.select(continuousSvgRef.current);
    const { width } = continuousSvgRef.current.getBoundingClientRect();
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    svg.selectAll("*").interrupt().remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.5])
      .range([height - margin.bottom, margin.top]);
    
    // Grid
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.2)
      .selectAll("line")
      .style("stroke", colors.chart.grid);
    
    // Axes
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text").attr("fill", colors.chart.text);
    
    const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => d.toFixed(2)));
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text").attr("fill", colors.chart.text);
    
    if (currentSubstage.showVarianceConcept) {
      // Show uniform distribution
      const pdfHeight = 1 / (upperBound - lowerBound);
      
      svg.append("rect")
        .attr("x", xScale(lowerBound))
        .attr("y", yScale(pdfHeight))
        .attr("width", xScale(upperBound) - xScale(lowerBound))
        .attr("height", yScale(0) - yScale(pdfHeight))
        .attr("fill", colorScheme.chart.primary)
        .attr("opacity", 0.3)
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 2);
      
      // Show mean
      svg.append("line")
        .attr("x1", xScale(expectation))
        .attr("x2", xScale(expectation))
        .attr("y1", yScale(0))
        .attr("y2", yScale(0.4))
        .attr("stroke", colorScheme.chart.highlight)
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5");
      
      // Show deviations
      const deviationPoints = d3.range(lowerBound, upperBound + 0.5, 0.5);
      
      svg.selectAll("line.deviation")
        .data(deviationPoints)
        .join("line")
        .attr("class", "deviation")
        .attr("x1", d => xScale(d))
        .attr("x2", d => xScale(expectation))
        .attr("y1", yScale(pdfHeight / 2))
        .attr("y2", yScale(pdfHeight / 2))
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 1)
        .attr("opacity", 0.5);
      
      // Labels
      svg.append("text")
        .attr("x", xScale(expectation))
        .attr("y", yScale(0.45))
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.highlight)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(`Mean = ${expectation}`);
    }
    
    if (currentSubstage.showE2Calculation || currentSubstage.showVarianceResult) {
      // Show (x - mean)² curve
      const curveData = d3.range(lowerBound, upperBound + 0.1, 0.1).map(x => ({
        x: x,
        y: Math.pow(x - expectation, 2) * (1 / (upperBound - lowerBound)) / 20 // Scale for visibility
      }));
      
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveBasis);
      
      svg.append("path")
        .datum(curveData)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .transition()
        .duration(isAnimating ? 500 : 0)
        .attr("opacity", 1);
      
      // Shaded area
      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(yScale(0))
        .y1(d => yScale(d.y))
        .curve(d3.curveBasis);
      
      svg.append("path")
        .datum(curveData)
        .attr("d", area)
        .attr("fill", colorScheme.chart.secondary)
        .attr("opacity", 0)
        .transition()
        .duration(isAnimating ? 500 : 0)
        .attr("opacity", 0.2);
      
      // Label
      svg.append("text")
        .attr("x", (xScale(lowerBound) + xScale(upperBound)) / 2)
        .attr("y", yScale(0.35))
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.secondary)
        .attr("font-size", "14px")
        .text("(x - E[X])² · f(x) (scaled)");
    }
    
    if (currentSubstage.showVarianceResult) {
      // Show variance value
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top + 20)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.secondary)
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text(`Var(X) = ${variance.toFixed(3)}, SD(X) = ${stdDev.toFixed(3)}`);
    }
    
  }, [stage, substage, lowerBound, upperBound, expectation, variance, stdDev, isAnimating, colorScheme]);
  
  // Draw application examples (Stage 5)
  useEffect(() => {
    if (!continuousSvgRef.current || stage !== 5) return;
    
    const svg = d3.select(continuousSvgRef.current);
    const { width } = continuousSvgRef.current.getBoundingClientRect();
    const height = 400;
    
    svg.selectAll("*").interrupt().remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    if (currentSubstage.showApplication) {
      const app = currentSubstage.applicationData;
      const margin = { top: 60, right: 40, bottom: 80, left: 60 };
      
      const xScale = d3.scaleLinear()
        .domain([app.a - (app.b - app.a) * 0.2, app.b + (app.b - app.a) * 0.2])
        .range([margin.left, width - margin.right]);
      
      const yScale = d3.scaleLinear()
        .domain([0, 1.5 / (app.b - app.a)])
        .range([height - margin.bottom, margin.top]);
      
      // Grid
      svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-(width - margin.left - margin.right))
          .tickFormat("")
        )
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.2)
        .selectAll("line")
        .style("stroke", colors.chart.grid);
      
      // Axes
      const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));
      
      xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
      xAxis.selectAll("text").attr("fill", colors.chart.text);
      
      xAxis.append("text")
        .attr("x", width / 2)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.text)
        .attr("font-size", "14px")
        .text(app.unit);
      
      const yAxis = svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).tickFormat(d => d.toFixed(3)));
      
      yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
      yAxis.selectAll("text").attr("fill", colors.chart.text);
      
      // Title
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.text)
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text(app.context);
      
      // Uniform distribution
      const pdfHeight = 1 / (app.b - app.a);
      
      svg.append("rect")
        .attr("x", xScale(app.a))
        .attr("y", yScale(pdfHeight))
        .attr("width", xScale(app.b) - xScale(app.a))
        .attr("height", yScale(0) - yScale(pdfHeight))
        .attr("fill", colorScheme.chart.primary)
        .attr("opacity", 0.3)
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 2);
      
      // Expected value line
      const mean = (app.a + app.b) / 2;
      svg.append("line")
        .attr("x1", xScale(mean))
        .attr("x2", xScale(mean))
        .attr("y1", yScale(0))
        .attr("y2", yScale(pdfHeight * 1.2))
        .attr("stroke", colorScheme.chart.highlight)
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5");
      
      // Labels
      svg.append("text")
        .attr("x", xScale(mean))
        .attr("y", yScale(pdfHeight * 1.3))
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.highlight)
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(`E[X] = ${mean} ${app.unit}`);
      
      // Variance annotation
      const appVariance = Math.pow(app.b - app.a, 2) / 12;
      const appStdDev = Math.sqrt(appVariance);
      
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.secondary)
        .attr("font-size", "14px")
        .text(`Standard Deviation = ${appStdDev.toFixed(2)} ${app.unit}`);
    }
    
  }, [stage, substage, isAnimating, colorScheme]);
  
  return (
    <VisualizationContainer
      title="📊 From Discrete to Continuous: Expectation & Variance"
      description={
        <>
          <p className={typography.description}>
            <strong>Journey from counting to measuring!</strong> Discover how expectation and variance 
            extend from discrete sums to continuous integrals.
          </p>
          <p className={cn(typography.description, "mt-2")}>
            Follow this guided walkthrough to build intuition step by step, starting with familiar 
            discrete concepts and smoothly transitioning to the continuous world.
          </p>
        </>
      }
    >
      {/* Progress indicator */}
      <ProgressBar 
        current={stage}
        total={stages.length}
        label={`Chapter ${stage}: ${currentStage.title}`}
        variant="emerald"
      />
      
      {/* Main content area */}
      <div className="space-y-6">
        {/* Current stage header */}
        <VisualizationSection className="p-4 bg-gradient-to-r from-emerald-900/20 to-green-900/20 border-emerald-600/30">
          <h3 className="text-lg font-bold text-emerald-300 mb-2">
            {currentSubstage.subtitle}
          </h3>
          <p className="text-base text-gray-200">
            {currentSubstage.description}
          </p>
          
          {/* Formula display if present */}
          {currentSubstage.formula && (
            <div className="mt-4">
              <FormulaDisplay 
                formula={currentSubstage.formula} 
                color="text-emerald-200 text-lg"
              />
            </div>
          )}
        </VisualizationSection>
        
        {/* Visualization area */}
        <GraphContainer title="">
          {stage === 1 && (
            <svg ref={discreteSvgRef} className="w-full" style={{ height: 400 }} />
          )}
          {stage === 2 && (
            <svg ref={comparisonSvgRef} className="w-full" style={{ height: 350 }} />
          )}
          {stage === 3 && (
            <svg ref={integralSvgRef} className="w-full" style={{ height: 400 }} />
          )}
          {stage === 4 && (
            <svg ref={continuousSvgRef} className="w-full" style={{ height: 400 }} />
          )}
          {stage === 5 && (
            <svg ref={continuousSvgRef} className="w-full" style={{ height: 400 }} />
          )}
        </GraphContainer>
        
        {/* Interactive controls for Stage 1 */}
        {stage === 1 && (
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Explore the Parameters</h4>
            <ControlGroup>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    Lower Bound: {lowerBound} minutes
                  </label>
                  <RangeSlider
                    value={lowerBound}
                    onChange={(v) => setLowerBound(Math.min(v, upperBound - 1))}
                    min={0}
                    max={9}
                    step={1}
                    className="mb-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    Upper Bound: {upperBound} minutes
                  </label>
                  <RangeSlider
                    value={upperBound}
                    onChange={(v) => setUpperBound(Math.max(v, lowerBound + 1))}
                    min={lowerBound + 1}
                    max={15}
                    step={1}
                    className="mb-2"
                  />
                </div>
              </div>
            </ControlGroup>
          </VisualizationSection>
        )}
        
        {/* Key values display */}
        {(stage >= 3) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <VisualizationSection className="p-4 text-center">
              <h5 className="text-sm font-semibold text-gray-400 mb-2">Expected Value</h5>
              <p className="text-2xl font-mono text-emerald-400 font-bold">
                {formatNumber(expectation)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                = (a + b) / 2
              </p>
            </VisualizationSection>
            
            <VisualizationSection className="p-4 text-center">
              <h5 className="text-sm font-semibold text-gray-400 mb-2">Variance</h5>
              <p className="text-2xl font-mono text-purple-400 font-bold">
                {formatNumber(variance)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                = (b - a)² / 12
              </p>
            </VisualizationSection>
            
            <VisualizationSection className="p-4 text-center">
              <h5 className="text-sm font-semibold text-gray-400 mb-2">Standard Deviation</h5>
              <p className="text-2xl font-mono text-blue-400 font-bold">
                {formatNumber(stdDev)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                = √variance
              </p>
            </VisualizationSection>
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="neutral"
            size="sm"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
          >
            ← Previous
          </Button>
          
          <div className="text-sm text-gray-400">
            Step {substage + 1} of {currentStage.substages.length}
          </div>
          
          <Button
            variant="primary"
            size="sm"
            onClick={handleNext}
            disabled={!canGoNext}
          >
            Next →
          </Button>
        </div>
        
        {/* Summary at the end */}
        {stage === stages.length && substage === currentStage.substages.length - 1 && (
          <VisualizationSection className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-600/30 mt-6">
            <h3 className="text-lg font-bold text-indigo-300 mb-4">
              🎯 Key Takeaways
            </h3>
            <div className="space-y-3 text-sm text-indigo-200">
              <p>• <strong>Continuous expectation</strong> uses integration instead of summation</p>
              <p>• <strong>The integral</strong> is the limit of the Riemann sum as intervals → 0</p>
              <p>• <strong>For uniform distributions</strong>, E[X] is simply the midpoint</p>
              <p>• <strong>Variance</strong> measures spread using the same integral approach</p>
              <p>• <strong>Real applications</strong> include timing, measurements, and quality control</p>
            </div>
          </VisualizationSection>
        )}
      </div>
    </VisualizationContainer>
  );
};

export default ContinuousExpectationVariance;