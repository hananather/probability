'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { VisualizationContainer } from '../../ui/VisualizationContainer';
import { StepByStepCalculation, CalculationStep, FormulaDisplay } from '../../ui/patterns/StepByStepCalculation';
import { InterpretationBox } from '../../ui/patterns/InterpretationBox';
import { SemanticGradientCard } from '../../ui/patterns/SemanticGradientCard';
import * as d3 from "@/utils/d3-utils";
import { useMathJax } from '../../../hooks/useMathJax';
import { Play, Pause, RotateCcw, Grid, Eye, EyeOff, Calculator, BookOpen, Lightbulb } from 'lucide-react';
import BackToHub from '../../ui/BackToHub';

// LaTeX formula component with proper MathJax handling
const LaTeXFormula = React.memo(function LaTeXFormula({ formula, isBlock = false, className = "" }) {
  const contentRef = useMathJax([formula]);
  
  if (isBlock) {
    return (
      <div ref={contentRef} className={`text-center my-2 ${className}`}>
        <div dangerouslySetInnerHTML={{ __html: `\\[${formula}\\]` }} />
      </div>
    );
  }
  
  return (
    <span ref={contentRef} className={className}>
      <span dangerouslySetInnerHTML={{ __html: `\\(${formula}\\)` }} />
    </span>
  );
});

export const DoubleIntegralCalculator = () => {
  // State management
  const [distribution, setDistribution] = useState('bivariate-normal');
  const [parameters, setParameters] = useState({
    correlation: 0.5,
    lambda1: 1.2,
    lambda2: 1.5,
    a: 1, // uniform bounds
    b: 2
  });
  
  // Integration settings
  const [integrationSettings, setIntegrationSettings] = useState({
    method: 'midpoint', // left, right, midpoint
    nSubdivisions: 15,
    showGrid: true,
    showAnimation: false,
    animationSpeed: 100 // ms between steps
  });
  
  // Region selection and results
  const [region, setRegion] = useState(null);
  const [integrationResults, setIntegrationResults] = useState(null);
  
  // Animation state
  const [animationState, setAnimationState] = useState({
    isRunning: false,
    currentStep: 0,
    partialSums: [],
    rectangles: []
  });
  
  // Input bounds state
  const [manualBounds, setManualBounds] = useState({
    x1: -1, x2: 1, y1: -1, y2: 1
  });
  
  const svgRef = useRef(null);
  const contentRef = useMathJax([distribution, region, integrationResults, animationState.currentStep]);
  const animationIntervalRef = useRef(null);
  
  // PDF functions for different distributions
  const pdfFunctions = useMemo(() => {
    const bivariateNormalPDF = (x, y, rho) => {
      const factor = 1 / (2 * Math.PI * Math.sqrt(1 - rho * rho));
      const exponent = -1 / (2 * (1 - rho * rho)) * (x * x - 2 * rho * x * y + y * y);
      return factor * Math.exp(exponent);
    };

    const uniformPDF = (x, y, a, b) => {
      if (x >= 0 && x <= a && y >= 0 && y <= b) {
        return 1 / (a * b);
      }
      return 0;
    };

    const exponentialPDF = (x, y, l1, l2) => {
      if (x >= 0 && y >= 0) {
        return l1 * l2 * Math.exp(-l1 * x - l2 * y);
      }
      return 0;
    };

    return { bivariateNormalPDF, uniformPDF, exponentialPDF };
  }, []);

  // Get current PDF function
  const getJointPDF = useMemo(() => {
    return (x, y) => {
      switch (distribution) {
        case 'bivariate-normal':
          return pdfFunctions.bivariateNormalPDF(x, y, parameters.correlation);
        case 'uniform':
          return pdfFunctions.uniformPDF(x, y, parameters.a, parameters.b);
        case 'exponential':
          return pdfFunctions.exponentialPDF(x, y, parameters.lambda1, parameters.lambda2);
        default:
          return 0;
      }
    };
  }, [distribution, parameters, pdfFunctions]);

  // Get visualization bounds based on distribution
  const getBounds = useMemo(() => {
    switch (distribution) {
      case 'uniform':
        return { xMin: -0.5, xMax: parameters.a + 0.5, yMin: -0.5, yMax: parameters.b + 0.5 };
      case 'exponential':
        return { xMin: 0, xMax: 4, yMin: 0, yMax: 4 };
      default: // bivariate-normal
        return { xMin: -3, xMax: 3, yMin: -3, yMax: 3 };
    }
  }, [distribution, parameters]);

  // Calculate probability using different integration methods
  const calculateProbability = useMemo(() => {
    return (x1, x2, y1, y2, method = 'midpoint', n = 20) => {
      const dx = (x2 - x1) / n;
      const dy = (y2 - y1) / n;
      let sum = 0;
      const rectangles = [];
      const partialSums = [];
      
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          let x, y;
          
          // Different integration methods
          switch (method) {
            case 'left':
              x = x1 + i * dx;
              y = y1 + j * dy;
              break;
            case 'right':
              x = x1 + (i + 1) * dx;
              y = y1 + (j + 1) * dy;
              break;
            case 'midpoint':
            default:
              x = x1 + (i + 0.5) * dx;
              y = y1 + (j + 0.5) * dy;
              break;
          }
          
          const value = getJointPDF(x, y);
          sum += value;
          
          // Store rectangle data for animation
          rectangles.push({
            x: x1 + i * dx,
            y: y1 + j * dy,
            width: dx,
            height: dy,
            value: value,
            samplePoint: { x, y },
            step: i * n + j
          });
          
          // Store running sum for visualization
          partialSums.push(sum * dx * dy);
        }
      }
      
      return {
        probability: sum * dx * dy,
        rectangles,
        partialSums,
        method,
        subdivisions: { nx: n, ny: n, total: n * n },
        stepSize: { dx, dy, area: dx * dy }
      };
    };
  }, [getJointPDF]);

  // Handle region selection and calculation
  const handleRegionUpdate = (newRegion) => {
    setRegion(newRegion);
    
    if (newRegion) {
      const results = calculateProbability(
        newRegion.x1, newRegion.x2, newRegion.y1, newRegion.y2,
        integrationSettings.method,
        integrationSettings.nSubdivisions
      );
      setIntegrationResults(results);
      
      // Reset animation
      setAnimationState({
        isRunning: false,
        currentStep: 0,
        partialSums: results.partialSums,
        rectangles: results.rectangles
      });
    }
  };

  // Animation control
  const toggleAnimation = () => {
    if (!integrationResults) return;
    
    if (animationState.isRunning) {
      // Stop animation
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      setAnimationState(prev => ({ ...prev, isRunning: false }));
    } else {
      // Start animation
      setAnimationState(prev => ({ ...prev, isRunning: true, currentStep: 0 }));
    }
  };

  const resetAnimation = () => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }
    setAnimationState(prev => ({
      ...prev,
      isRunning: false,
      currentStep: 0
    }));
  };

  // Animation effect
  useEffect(() => {
    if (animationState.isRunning && integrationResults) {
      const totalSteps = integrationResults.rectangles.length;
      
      animationIntervalRef.current = setInterval(() => {
        setAnimationState(prev => {
          const nextStep = prev.currentStep + 1;
          if (nextStep >= totalSteps) {
            if (animationIntervalRef.current) {
              clearInterval(animationIntervalRef.current);
              animationIntervalRef.current = null;
            }
            return { ...prev, isRunning: false, currentStep: totalSteps - 1 };
          }
          return { ...prev, currentStep: nextStep };
        });
      }, integrationSettings.animationSpeed);
      
      return () => {
        if (animationIntervalRef.current) {
          clearInterval(animationIntervalRef.current);
          animationIntervalRef.current = null;
        }
      };
    }
  }, [animationState.isRunning, integrationResults, integrationSettings.animationSpeed]);

  // Handle manual bounds input
  const handleManualBoundsSubmit = () => {
    handleRegionUpdate(manualBounds);
  };

  // D3 Visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const width = 700;
    const height = 700;
    const margin = { top: 40, right: 60, bottom: 60, left: 60 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const bounds = getBounds;
    const xScale = d3.scaleLinear()
      .domain([bounds.xMin, bounds.xMax])
      .range([0, plotWidth]);

    const yScale = d3.scaleLinear()
      .domain([bounds.yMin, bounds.yMax])
      .range([plotHeight, 0]);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${plotHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "#f3f4f6");

    g.select("g:last-of-type")
      .append("text")
      .attr("x", plotWidth / 2)
      .attr("y", 45)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .text("X");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", "#f3f4f6");

    g.select("g:last-of-type")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -plotHeight / 2)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Y");

    // Add contour plot background
    const resolution = 60;
    const contourData = [];
    
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = bounds.xMin + (bounds.xMax - bounds.xMin) * i / resolution;
        const y = bounds.yMin + (bounds.yMax - bounds.yMin) * j / resolution;
        contourData.push(getJointPDF(x, y));
      }
    }

    const maxValue = d3.max(contourData) || 1;
    const contourGenerator = d3.contours()
      .size([resolution + 1, resolution + 1])
      .thresholds(12);

    const contours = contourGenerator(contourData);
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, maxValue]);

    g.append("g")
      .selectAll("path")
      .data(contours)
      .enter().append("path")
      .attr("d", d3.geoPath()
        .projection(d3.geoTransform({
          point: function(x, y) {
            this.stream.point(
              xScale(bounds.xMin + (bounds.xMax - bounds.xMin) * x / resolution),
              yScale(bounds.yMin + (bounds.yMax - bounds.yMin) * y / resolution)
            );
          }
        })))
      .attr("fill", d => colorScale(d.value))
      .attr("stroke", "white")
      .attr("stroke-width", 0.3)
      .attr("opacity", 0.7);

    // Selection interaction using delta-based dragging
    let startPoint = null;
    let selectionRect = null;
    let dragStartX = null;
    let dragStartY = null;

    const dragBehavior = d3.drag()
      .on("start", function(event) {
        const [x, y] = d3.pointer(event);
        startPoint = { x, y };
        dragStartX = event.x;
        dragStartY = event.y;
        
        if (selectionRect) selectionRect.remove();
        
        selectionRect = g.append("rect")
          .attr("class", "selection")
          .attr("x", x)
          .attr("y", y)
          .attr("width", 0)
          .attr("height", 0)
          .attr("fill", "rgba(255, 215, 0, 0.3)")
          .attr("stroke", "gold")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "8,4");
      })
      .on("drag", function(event) {
        if (!startPoint || !selectionRect) return;
        
        // Use delta-based movement for smooth dragging
        const deltaX = event.x - dragStartX;
        const deltaY = event.y - dragStartY;
        
        const currentX = startPoint.x + deltaX;
        const currentY = startPoint.y + deltaY;
        
        const x1 = Math.min(startPoint.x, currentX);
        const y1 = Math.min(startPoint.y, currentY);
        const width = Math.abs(currentX - startPoint.x);
        const height = Math.abs(currentY - startPoint.y);
        
        selectionRect
          .attr("x", x1)
          .attr("y", y1)
          .attr("width", width)
          .attr("height", height);
      })
      .on("end", function(event) {
        if (!startPoint || !selectionRect) return;
        
        const deltaX = event.x - dragStartX;
        const deltaY = event.y - dragStartY;
        
        const currentX = startPoint.x + deltaX;
        const currentY = startPoint.y + deltaY;
        
        const x1 = xScale.invert(Math.min(startPoint.x, currentX));
        const x2 = xScale.invert(Math.max(startPoint.x, currentX));
        const y1 = yScale.invert(Math.max(startPoint.y, currentY));
        const y2 = yScale.invert(Math.min(startPoint.y, currentY));
        
        // Only update if region has meaningful size
        if (Math.abs(x2 - x1) > 0.1 && Math.abs(y2 - y1) > 0.1) {
          const newRegion = { x1, x2, y1, y2 };
          setManualBounds(newRegion);
          handleRegionUpdate(newRegion);
        }
      });

    // Add invisible rect for drag interaction
    g.append("rect")
      .attr("width", plotWidth)
      .attr("height", plotHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .call(dragBehavior);

    // Show selected region and integration rectangles
    if (region && integrationResults) {
      const regionGroup = g.append("g").attr("class", "integration-region");

      // Highlight the selected region
      regionGroup.append("rect")
        .attr("x", xScale(region.x1))
        .attr("y", yScale(region.y2))
        .attr("width", xScale(region.x2) - xScale(region.x1))
        .attr("height", yScale(region.y1) - yScale(region.y2))
        .attr("fill", "rgba(255, 215, 0, 0.2)")
        .attr("stroke", "gold")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "8,4");

      // Show integration grid if enabled
      if (integrationSettings.showGrid) {
        const visibleRectangles = integrationSettings.showAnimation 
          ? integrationResults.rectangles.slice(0, animationState.currentStep + 1)
          : integrationResults.rectangles;

        const rectangles = regionGroup.selectAll(".integration-rect")
          .data(visibleRectangles)
          .enter()
          .append("g")
          .attr("class", "integration-rect");

        // Rectangle backgrounds based on PDF value
        rectangles.append("rect")
          .attr("x", d => xScale(d.x))
          .attr("y", d => yScale(d.y + d.height))
          .attr("width", d => Math.abs(xScale(d.x + d.width) - xScale(d.x)))
          .attr("height", d => Math.abs(yScale(d.y) - yScale(d.y + d.height)))
          .attr("fill", d => {
            const intensity = Math.min(d.value / maxValue, 1);
            return `rgba(255, 165, 0, ${0.3 + 0.5 * intensity})`;
          })
          .attr("stroke", "#ffa500")
          .attr("stroke-width", 0.5)
          .attr("opacity", integrationSettings.showAnimation ? 0.9 : 0.6);

        // Sample points
        rectangles.append("circle")
          .attr("cx", d => xScale(d.samplePoint.x))
          .attr("cy", d => yScale(d.samplePoint.y))
          .attr("r", 2)
          .attr("fill", "red")
          .attr("stroke", "white")
          .attr("stroke-width", 1)
          .attr("opacity", integrationSettings.showAnimation ? 1 : 0.7);
      }
    }

  }, [distribution, parameters, region, integrationResults, integrationSettings, animationState.currentStep, getBounds, getJointPDF]);

  // Get distribution formula
  const getDistributionFormula = () => {
    switch (distribution) {
      case 'bivariate-normal':
        return `f_{X,Y}(x,y) = \\frac{1}{2\\pi\\sqrt{1-\\rho^2}} \\exp\\left(-\\frac{1}{2(1-\\rho^2)}(x^2 - 2\\rho xy + y^2)\\right)`;
      case 'uniform':
        return `f_{X,Y}(x,y) = \\begin{cases} \\frac{1}{ab} & \\text{if } 0 \\leq x \\leq a, 0 \\leq y \\leq b \\\\ 0 & \\text{otherwise} \\end{cases}`;
      case 'exponential':
        return `f_{X,Y}(x,y) = \\begin{cases} \\lambda_1 \\lambda_2 e^{-\\lambda_1 x - \\lambda_2 y} & \\text{if } x \\geq 0, y \\geq 0 \\\\ 0 & \\text{otherwise} \\end{cases}`;
      default:
        return '';
    }
  };

  return (
    <VisualizationContainer
      title="Interactive Double Integral Calculator"
      description="Explore how double integrals calculate probabilities over regions with step-by-step visualization"
    >
      <BackToHub />
      
      <div className="space-y-8" ref={contentRef} style={{ marginTop: '60px' }}>
        {/* Distribution Selection and Controls */}
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Calculator className="w-5 h-5" />
              Distribution & Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Distribution Selection */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={() => setDistribution('bivariate-normal')}
                  variant={distribution === 'bivariate-normal' ? "default" : "outline"}
                  size="sm"
                >
                  Bivariate Normal
                </Button>
                <Button
                  onClick={() => setDistribution('uniform')}
                  variant={distribution === 'uniform' ? "default" : "outline"}
                  size="sm"
                >
                  Uniform
                </Button>
                <Button
                  onClick={() => setDistribution('exponential')}
                  variant={distribution === 'exponential' ? "default" : "outline"}
                  size="sm"
                >
                  Exponential
                </Button>
              </div>

              {/* Parameters */}
              <div className="flex flex-wrap gap-6 justify-center">
                {distribution === 'bivariate-normal' && (
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium">Correlation (ρ):</label>
                    <input
                      type="range"
                      min="-0.8"
                      max="0.8"
                      step="0.1"
                      value={parameters.correlation}
                      onChange={(e) => setParameters(prev => ({ ...prev, correlation: parseFloat(e.target.value) }))}
                      className="w-32"
                    />
                    <span className="text-sm font-mono w-12">{parameters.correlation.toFixed(1)}</span>
                  </div>
                )}
                
                {distribution === 'uniform' && (
                  <>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium">a:</label>
                      <input
                        type="range"
                        min="1"
                        max="4"
                        step="0.5"
                        value={parameters.a}
                        onChange={(e) => setParameters(prev => ({ ...prev, a: parseFloat(e.target.value) }))}
                        className="w-32"
                      />
                      <span className="text-sm font-mono w-12">{parameters.a.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium">b:</label>
                      <input
                        type="range"
                        min="1"
                        max="4"
                        step="0.5"
                        value={parameters.b}
                        onChange={(e) => setParameters(prev => ({ ...prev, b: parseFloat(e.target.value) }))}
                        className="w-32"
                      />
                      <span className="text-sm font-mono w-12">{parameters.b.toFixed(1)}</span>
                    </div>
                  </>
                )}
                
                {distribution === 'exponential' && (
                  <>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium">λ₁:</label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={parameters.lambda1}
                        onChange={(e) => setParameters(prev => ({ ...prev, lambda1: parseFloat(e.target.value) }))}
                        className="w-32"
                      />
                      <span className="text-sm font-mono w-12">{parameters.lambda1.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium">λ₂:</label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={parameters.lambda2}
                        onChange={(e) => setParameters(prev => ({ ...prev, lambda2: parseFloat(e.target.value) }))}
                        className="w-32"
                      />
                      <span className="text-sm font-mono w-12">{parameters.lambda2.toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Distribution Formula */}
              <div className="bg-neutral-800 rounded-lg p-4">
                <LaTeXFormula 
                  formula={getDistributionFormula()}
                  isBlock={true}
                  className="text-blue-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Settings */}
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Grid className="w-5 h-5" />
              Integration Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-6 justify-center items-center">
                {/* Integration Method */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium">Method:</label>
                  <select
                    value={integrationSettings.method}
                    onChange={(e) => setIntegrationSettings(prev => ({ ...prev, method: e.target.value }))}
                    className="bg-neutral-800 border border-neutral-600 rounded px-3 py-1 text-sm"
                  >
                    <option value="left">Left Riemann</option>
                    <option value="right">Right Riemann</option>
                    <option value="midpoint">Midpoint Rule</option>
                  </select>
                </div>

                {/* Number of Subdivisions */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium">Subdivisions:</label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={integrationSettings.nSubdivisions}
                    onChange={(e) => setIntegrationSettings(prev => ({ ...prev, nSubdivisions: parseInt(e.target.value) }))}
                    className="w-32"
                  />
                  <span className="text-sm font-mono w-16">
                    {integrationSettings.nSubdivisions}×{integrationSettings.nSubdivisions}
                  </span>
                </div>

                {/* Animation Speed */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium">Speed:</label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="50"
                    value={integrationSettings.animationSpeed}
                    onChange={(e) => setIntegrationSettings(prev => ({ ...prev, animationSpeed: parseInt(e.target.value) }))}
                    className="w-32"
                  />
                  <span className="text-sm font-mono w-12">{integrationSettings.animationSpeed}ms</span>
                </div>

                {/* Toggle Grid */}
                <Button
                  onClick={() => setIntegrationSettings(prev => ({ ...prev, showGrid: !prev.showGrid }))}
                  variant={integrationSettings.showGrid ? "default" : "outline"}
                  size="sm"
                >
                  {integrationSettings.showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Grid
                </Button>
              </div>

              {/* Manual Region Input */}
              <div className="border-t border-neutral-700 pt-4">
                <h5 className="text-sm font-semibold mb-3">Manual Region Input</h5>
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  <div className="flex items-center gap-2">
                    <label className="text-xs">x₁:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualBounds.x1}
                      onChange={(e) => setManualBounds(prev => ({ ...prev, x1: parseFloat(e.target.value) || 0 }))}
                      className="w-20 bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs">x₂:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualBounds.x2}
                      onChange={(e) => setManualBounds(prev => ({ ...prev, x2: parseFloat(e.target.value) || 0 }))}
                      className="w-20 bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs">y₁:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualBounds.y1}
                      onChange={(e) => setManualBounds(prev => ({ ...prev, y1: parseFloat(e.target.value) || 0 }))}
                      className="w-20 bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs">y₂:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualBounds.y2}
                      onChange={(e) => setManualBounds(prev => ({ ...prev, y2: parseFloat(e.target.value) || 0 }))}
                      className="w-20 bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <Button onClick={handleManualBoundsSubmit} size="sm">
                    Calculate
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visualization */}
        <div className="flex flex-col items-center space-y-4" style={{ marginTop: '40px' }}>
          <svg ref={svgRef} style={{ background: '#f3f4f6', borderRadius: '8px' }} />
          <div className="text-center text-sm text-neutral-400 max-w-2xl">
            <p><strong>Instructions:</strong> Click and drag to select a rectangular region for integration.</p>
            <p>Red dots show sample points, colored rectangles show PDF values at those points.</p>
          </div>

          {/* Animation Controls */}
          {region && integrationResults && (
            <div className="flex items-center gap-3" style={{ marginTop: '30px' }}>
              <Button onClick={toggleAnimation} size="sm" variant="outline">
                {animationState.isRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Animate
                  </>
                )}
              </Button>
              <Button onClick={resetAnimation} size="sm" variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              {integrationSettings.showAnimation && (
                <div className="text-sm">
                  Step {animationState.currentStep + 1} of {integrationResults?.rectangles.length || 0}
                  {animationState.partialSums[animationState.currentStep] && (
                    <span className="ml-3 text-blue-400">
                      Running Sum: {animationState.partialSums[animationState.currentStep].toFixed(6)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {region && integrationResults && (
          <div className="space-y-6" style={{ marginTop: '60px' }}>
            {/* Main Result */}
            <InterpretationBox title="Integration Result" theme="green">
              <div className="space-y-4">
                <LaTeXFormula 
                  formula={`P(${region.x1.toFixed(2)} \\leq X \\leq ${region.x2.toFixed(2)}, ${region.y1.toFixed(2)} \\leq Y \\leq ${region.y2.toFixed(2)}) = ${integrationResults.probability.toFixed(6)}`}
                  isBlock={true}
                  className="text-2xl font-bold text-green-400"
                />
                <p className="text-sm text-neutral-300">
                  Calculated using <span className="text-green-400 font-semibold">{integrationResults.method}</span> method with{' '}
                  <span className="text-blue-400 font-semibold">{integrationResults.subdivisions.total}</span> rectangles.
                </p>
              </div>
            </InterpretationBox>

            {/* Step-by-Step Explanation */}
            <StepByStepCalculation title="Double Integration Process" theme="purple">
              <CalculationStep title="Step 1: Set up the double integral">
                <LaTeXFormula 
                  formula={`P(${region.x1.toFixed(2)} \\leq X \\leq ${region.x2.toFixed(2)}, ${region.y1.toFixed(2)} \\leq Y \\leq ${region.y2.toFixed(2)}) = \\iint_R f_{X,Y}(x,y) \\, dx \\, dy`}
                  isBlock={true}
                />
                <p className="text-sm text-neutral-300 mt-2">
                  where R is the rectangular region [{region.x1.toFixed(2)}, {region.x2.toFixed(2)}] × [{region.y1.toFixed(2)}, {region.y2.toFixed(2)}]
                </p>
              </CalculationStep>

              <CalculationStep title="Step 2: Apply numerical integration">
                <LaTeXFormula 
                  formula={`\\iint_R f_{X,Y}(x,y) \\, dx \\, dy \\approx \\sum_{i=0}^{n-1} \\sum_{j=0}^{n-1} f_{X,Y}(x_i, y_j) \\Delta x \\Delta y`}
                  isBlock={true}
                />
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <p><LaTeXFormula formula={`\\Delta x = \\frac{${(region.x2 - region.x1).toFixed(2)}}{${integrationResults.subdivisions.nx}} = ${integrationResults.stepSize.dx.toFixed(4)}`} /></p>
                  </div>
                  <div>
                    <p><LaTeXFormula formula={`\\Delta y = \\frac{${(region.y2 - region.y1).toFixed(2)}}{${integrationResults.subdivisions.ny}} = ${integrationResults.stepSize.dy.toFixed(4)}`} /></p>
                  </div>
                </div>
              </CalculationStep>

              <CalculationStep title="Step 3: Sample point selection">
                <p className="text-sm text-neutral-300">
                  Using <strong className="text-purple-400">{integrationResults.method}</strong> rule:
                </p>
                <div className="mt-2">
                  {integrationResults.method === 'midpoint' && (
                    <LaTeXFormula 
                      formula={`(x_i, y_j) = \\left(x_1 + (i + 0.5)\\Delta x, y_1 + (j + 0.5)\\Delta y\\right)`}
                      isBlock={true}
                    />
                  )}
                  {integrationResults.method === 'left' && (
                    <LaTeXFormula 
                      formula={`(x_i, y_j) = \\left(x_1 + i \\cdot \\Delta x, y_1 + j \\cdot \\Delta y\\right)`}
                      isBlock={true}
                    />
                  )}
                  {integrationResults.method === 'right' && (
                    <LaTeXFormula 
                      formula={`(x_i, y_j) = \\left(x_1 + (i+1) \\cdot \\Delta x, y_1 + (j+1) \\cdot \\Delta y\\right)`}
                      isBlock={true}
                    />
                  )}
                </div>
              </CalculationStep>

              <CalculationStep title="Step 4: Final calculation">
                <LaTeXFormula 
                  formula={`\\text{Probability} = \\sum_{i,j} f_{X,Y}(x_i, y_j) \\cdot ${integrationResults.stepSize.area.toFixed(6)} = ${integrationResults.probability.toFixed(6)}`}
                  isBlock={true}
                />
                <p className="text-sm text-neutral-400 mt-2">
                  Each rectangle contributes its PDF value multiplied by the area <LaTeXFormula formula={`\\Delta x \\Delta y`} />
                </p>
              </CalculationStep>
            </StepByStepCalculation>

            {/* Method Comparison */}
            <SemanticGradientCard
              title="Understanding Integration Methods"
              theme="blue"
              formula={`\\text{Accuracy: Midpoint} > \\text{Left/Right Riemann}`}
              description="Different sampling methods affect accuracy"
              note="Midpoint rule typically provides better approximations for smooth functions"
            />

            {/* Educational Insights */}
            <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-800/20 border-yellow-600/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                  <Lightbulb className="w-5 h-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Geometric Interpretation:</strong> The double integral represents the volume under the surface z = f(x,y) over the region R.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Grid className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Mesh Refinement:</strong> Increasing subdivisions generally improves accuracy, but with diminishing returns and computational cost.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calculator className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Method Selection:</strong> Midpoint rule is often most accurate for smooth functions, while left/right rules show the bounds of the true value.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        <Card className="bg-neutral-900 border-neutral-700" style={{ marginTop: '60px' }}>
          <CardHeader>
            <CardTitle className="text-neutral-300">How to Use This Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-300">
              <li>Select a distribution type and adjust parameters to see how the joint PDF changes</li>
              <li>Choose integration method (midpoint rule typically gives best accuracy)</li>
              <li>Set number of subdivisions (more rectangles = higher accuracy but slower animation)</li>
              <li>Either drag to select a region on the visualization OR input bounds manually</li>
              <li>Use animation controls to see step-by-step how the integration builds up the probability</li>
              <li>Compare results with different methods and subdivision counts to understand convergence</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </VisualizationContainer>
  );
};

export default DoubleIntegralCalculator;