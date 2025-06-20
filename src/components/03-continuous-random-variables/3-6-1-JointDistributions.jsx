'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { VisualizationContainer } from '../ui/VisualizationContainer';
import { ProgressBar, ProgressNavigation } from '@/components/ui/ProgressBar';
import * as d3 from "@/utils/d3-utils";
import { cn } from '../../lib/utils';
import { useSafeMathJax } from '../../utils/mathJaxFix';
import { tutorial_3_6_1 } from '@/tutorials/chapter3';

// LaTeX formula component
const LaTeXFormula = React.memo(function LaTeXFormula({ formula, isBlock = false }) {
  const contentRef = useRef(null);
  useSafeMathJax(contentRef, [formula]);
  
  if (isBlock) {
    return (
      <div ref={contentRef} className="text-center my-2">
        <div dangerouslySetInnerHTML={{ __html: `\\[${formula}\\]` }} />
      </div>
    );
  }
  
  return (
    <span ref={contentRef}>
      <span dangerouslySetInnerHTML={{ __html: `\\(${formula}\\)` }} />
    </span>
  );
});

const JointDistributions = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [distribution, setDistribution] = useState('bivariate-normal');
  const [correlation, setCorrelation] = useState(0.5);
  const [showMarginals, setShowMarginals] = useState(true);
  const [showContours, setShowContours] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'
  const [lambda1, setLambda1] = useState(1); // For exponential
  const [lambda2, setLambda2] = useState(1.5); // For exponential
  
  const contentRef = useRef(null);
  const svgRef = useRef(null);
  
  // Use safe MathJax processing
  useSafeMathJax(contentRef, [currentStep, distribution]);

  // Generate bivariate normal data
  const generateBivariateNormal = (n, rho) => {
    const points = [];
    for (let i = 0; i < n; i++) {
      // Box-Muller transform
      const u1 = Math.random();
      const u2 = Math.random();
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
      
      // Apply correlation
      const x = z1;
      const y = rho * z1 + Math.sqrt(1 - rho * rho) * z2;
      
      points.push({ x, y });
    }
    return points;
  };

  // Calculate joint PDF for bivariate normal
  const bivariateNormalPDF = (x, y, rho) => {
    const factor = 1 / (2 * Math.PI * Math.sqrt(1 - rho * rho));
    const exponent = -1 / (2 * (1 - rho * rho)) * (x * x - 2 * rho * x * y + y * y);
    return factor * Math.exp(exponent);
  };

  // Calculate joint PDF for independent uniform distribution
  const uniformPDF = (x, y) => {
    // Uniform on [0, 2] × [0, 2]
    if (x >= 0 && x <= 2 && y >= 0 && y <= 2) {
      return 0.25; // 1/(2*2)
    }
    return 0;
  };

  // Calculate joint PDF for independent exponential distribution
  const exponentialPDF = (x, y, lambda1, lambda2) => {
    if (x >= 0 && y >= 0) {
      return lambda1 * lambda2 * Math.exp(-lambda1 * x - lambda2 * y);
    }
    return 0;
  };

  // Get the appropriate PDF based on distribution type
  const getJointPDF = (x, y) => {
    switch (distribution) {
      case 'bivariate-normal':
        return bivariateNormalPDF(x, y, correlation);
      case 'uniform':
        return uniformPDF(x, y);
      case 'exponential':
        return exponentialPDF(x, y, lambda1, lambda2);
      default:
        return 0;
    }
  };

  // Generate contour data
  const contourData = useMemo(() => {
    let xMin, xMax, yMin, yMax;
    
    // Set bounds based on distribution
    if (distribution === 'uniform') {
      xMin = -0.5; xMax = 2.5; yMin = -0.5; yMax = 2.5;
    } else if (distribution === 'exponential') {
      xMin = 0; xMax = 4; yMin = 0; yMax = 4;
    } else {
      xMin = -3; xMax = 3; yMin = -3; yMax = 3;
    }
    
    const resolution = 50;
    const values = [];
    
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = xMin + (xMax - xMin) * i / resolution;
        const y = yMin + (yMax - yMin) * j / resolution;
        const z = getJointPDF(x, y);
        values.push({ x, y, z });
      }
    }
    
    // Generate contour levels based on distribution
    let thresholds;
    if (distribution === 'uniform') {
      thresholds = [0.05, 0.1, 0.15, 0.2, 0.24];
    } else if (distribution === 'exponential') {
      const maxZ = lambda1 * lambda2;
      thresholds = d3.range(maxZ * 0.1, maxZ * 0.9, maxZ * 0.1);
    } else {
      thresholds = d3.range(0.01, 0.16, 0.02);
    }
    
    return { values, thresholds, resolution, bounds: { xMin, xMax, yMin, yMax } };
  }, [correlation, distribution, lambda1, lambda2]);

  const steps = [
    {
      title: "Joint Probability Distributions",
      description: "Explore how two continuous random variables relate to each other"
    },
    {
      title: "Marginal Distributions",
      description: "See how joint distributions project onto individual axes"
    },
    {
      title: "Conditional Distributions",
      description: "Understand P(Y|X) by slicing through the joint distribution"
    },
    {
      title: "Independence and Correlation",
      description: "Visualize how correlation affects the joint distribution shape"
    }
  ];

  // Main visualization component
  const JointVisualization = () => {
    const width = 600;
    const height = 600;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    useEffect(() => {
      if (!svgRef.current) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Scales
      const xScale = d3.scaleLinear()
        .domain([contourData.bounds.xMin, contourData.bounds.xMax])
        .range([0, plotWidth]);

      const yScale = d3.scaleLinear()
        .domain([contourData.bounds.yMin, contourData.bounds.yMax])
        .range([plotHeight, 0]);

      // Add axes
      g.append("g")
        .attr("transform", `translate(0,${plotHeight})`)
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", plotWidth / 2)
        .attr("y", 40)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .text("X");

      g.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", -plotHeight / 2)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .text("Y");

      // Add contours
      if (showContours) {
        const contourGenerator = d3.contours()
          .size([contourData.resolution + 1, contourData.resolution + 1])
          .thresholds(contourData.thresholds);

        const contours = contourGenerator(contourData.values.map(d => d.z));

        const colorScale = d3.scaleSequential(d3.interpolateBlues)
          .domain([0, d3.max(contourData.thresholds)]);

        g.append("g")
          .selectAll("path")
          .data(contours)
          .enter().append("path")
          .attr("d", d3.geoPath()
            .projection(d3.geoTransform({
              point: function(x, y) {
                const { xMin, xMax, yMin, yMax } = contourData.bounds;
                this.stream.point(
                  xScale(xMin + (xMax - xMin) * x / contourData.resolution),
                  yScale(yMin + (yMax - yMin) * y / contourData.resolution)
                );
              }
            })))
          .attr("fill", d => colorScale(d.value))
          .attr("stroke", "white")
          .attr("stroke-width", 0.5)
          .attr("opacity", 0.8);
      }

      // Add marginal distributions if enabled
      if (showMarginals) {
        const { xMin, xMax, yMin, yMax } = contourData.bounds;
        
        // X marginal (top)
        const xMarginalHeight = 60;
        const xMarginal = svg.append("g")
          .attr("transform", `translate(${margin.left},${5})`);

        const xValues = d3.range(xMin, xMax + 0.1, 0.1);
        const xMarginalData = xValues.map(x => {
          let y;
          if (distribution === 'bivariate-normal') {
            y = Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
          } else if (distribution === 'uniform') {
            y = (x >= 0 && x <= 2) ? 0.5 : 0;
          } else if (distribution === 'exponential') {
            y = x >= 0 ? lambda1 * Math.exp(-lambda1 * x) : 0;
          }
          return { x, y };
        });

        const xMarginalScale = d3.scaleLinear()
          .domain([0, d3.max(xMarginalData, d => d.y) * 1.1])
          .range([xMarginalHeight, 0]);

        const xMarginalArea = d3.area()
          .x(d => xScale(d.x))
          .y0(xMarginalHeight)
          .y1(d => xMarginalScale(d.y))
          .curve(d3.curveBasis);

        xMarginal.append("path")
          .datum(xMarginalData)
          .attr("d", xMarginalArea)
          .attr("fill", "#3b82f6")
          .attr("opacity", 0.6);

        // Y marginal (right)
        const yMarginalWidth = 60;
        const yMarginal = svg.append("g")
          .attr("transform", `translate(${width - margin.right + 5},${margin.top})`);

        const yValues = d3.range(yMin, yMax + 0.1, 0.1);
        const yMarginalData = yValues.map(y => {
          let x;
          if (distribution === 'bivariate-normal') {
            x = Math.exp(-y * y / 2) / Math.sqrt(2 * Math.PI);
          } else if (distribution === 'uniform') {
            x = (y >= 0 && y <= 2) ? 0.5 : 0;
          } else if (distribution === 'exponential') {
            x = y >= 0 ? lambda2 * Math.exp(-lambda2 * y) : 0;
          }
          return { y, x };
        });

        const yMarginalScale = d3.scaleLinear()
          .domain([0, d3.max(yMarginalData, d => d.x) * 1.1])
          .range([0, yMarginalWidth]);

        const yMarginalArea = d3.area()
          .y(d => yScale(d.y))
          .x0(0)
          .x1(d => yMarginalScale(d.x))
          .curve(d3.curveBasis);

        yMarginal.append("path")
          .datum(yMarginalData)
          .attr("d", yMarginalArea)
          .attr("fill", "#10b981")
          .attr("opacity", 0.6);
      }

      // Add click interaction
      g.append("rect")
        .attr("width", plotWidth)
        .attr("height", plotHeight)
        .attr("fill", "transparent")
        .style("cursor", "crosshair")
        .on("click", function(event) {
          const [mouseX, mouseY] = d3.pointer(event);
          const x = xScale.invert(mouseX);
          const y = yScale.invert(mouseY);
          setSelectedPoint({ x, y });
        });

      // Show selected point
      if (selectedPoint) {
        g.append("circle")
          .attr("cx", xScale(selectedPoint.x))
          .attr("cy", yScale(selectedPoint.y))
          .attr("r", 5)
          .attr("fill", "#ef4444")
          .attr("stroke", "white")
          .attr("stroke-width", 2);

        // Show conditional distribution slice
        if (currentStep >= 2) {
          const { yMin, yMax } = contourData.bounds;
          const conditionalY = d3.range(yMin, yMax + 0.1, 0.1).map(y => ({
            y: y,
            prob: getJointPDF(selectedPoint.x, y)
          }));

          const maxProb = d3.max(conditionalY, d => d.prob);
          const conditionalScale = d3.scaleLinear()
            .domain([0, maxProb])
            .range([0, 100]);

          g.append("g")
            .selectAll("line")
            .data(conditionalY)
            .enter().append("line")
            .attr("x1", xScale(selectedPoint.x))
            .attr("y1", d => yScale(d.y))
            .attr("x2", d => xScale(selectedPoint.x) + conditionalScale(d.prob))
            .attr("y2", d => yScale(d.y))
            .attr("stroke", "#ef4444")
            .attr("stroke-width", 2)
            .attr("opacity", 0.8);
        }
      }

    }, [showContours, showMarginals, correlation, selectedPoint, currentStep, distribution, lambda1, lambda2, contourData]);

    return (
      <div className="flex flex-col items-center">
        <svg ref={svgRef} width={width} height={height} />
        {selectedPoint && (
          <div className="mt-4 text-sm text-neutral-300">
            Selected point: X = {selectedPoint.x.toFixed(2)}, Y = {selectedPoint.y.toFixed(2)}
            <br />
            Joint density: {getJointPDF(selectedPoint.x, selectedPoint.y).toFixed(4)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4" ref={contentRef}>
      <ProgressBar 
        sections={tutorial_3_6_1} 
        currentSection={currentStep}
        onSectionChange={setCurrentStep}
      />

      <VisualizationContainer
        title="Joint Continuous Distributions"
        description="Explore how two continuous random variables interact through their joint probability density function"
      >
        <div className="space-y-6">
          {/* Controls */}
          <div className="space-y-4">
            {/* Distribution selector */}
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
            
            {/* Distribution-specific parameters */}
            <div className="flex flex-wrap gap-4 justify-center">
              {distribution === 'bivariate-normal' && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Correlation (ρ):</label>
                  <input
                    type="range"
                    min="-0.9"
                    max="0.9"
                    step="0.1"
                    value={correlation}
                    onChange={(e) => setCorrelation(parseFloat(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-sm font-mono w-12">{correlation.toFixed(1)}</span>
                </div>
              )}
              
              {distribution === 'exponential' && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">λ₁:</label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={lambda1}
                      onChange={(e) => setLambda1(parseFloat(e.target.value))}
                      className="w-32"
                    />
                    <span className="text-sm font-mono w-12">{lambda1.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">λ₂:</label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={lambda2}
                      onChange={(e) => setLambda2(parseFloat(e.target.value))}
                      className="w-32"
                    />
                    <span className="text-sm font-mono w-12">{lambda2.toFixed(1)}</span>
                  </div>
                </>
              )}

              <Button
                onClick={() => setShowContours(!showContours)}
                variant={showContours ? "default" : "outline"}
                size="sm"
              >
                {showContours ? "Hide" : "Show"} Contours
              </Button>

              <Button
                onClick={() => setShowMarginals(!showMarginals)}
                variant={showMarginals ? "default" : "outline"}
                size="sm"
              >
                {showMarginals ? "Hide" : "Show"} Marginals
              </Button>
            </div>
          </div>

          {/* Main visualization */}
          <JointVisualization />

          {/* Mathematical formulas */}
          <Card className="p-4 bg-neutral-900 border-neutral-700">
            <h4 className="text-sm font-semibold mb-2">
              {distribution === 'bivariate-normal' && 'Bivariate Normal Distribution'}
              {distribution === 'uniform' && 'Joint Uniform Distribution'}
              {distribution === 'exponential' && 'Joint Exponential Distribution'}
            </h4>
            {distribution === 'bivariate-normal' && (
              <>
                <LaTeXFormula 
                  formula={`f_{X,Y}(x,y) = \\frac{1}{2\\pi\\sqrt{1-\\rho^2}} \\exp\\left(-\\frac{1}{2(1-\\rho^2)}[x^2 - 2\\rho xy + y^2]\\right)`}
                  isBlock={true}
                />
                <div className="mt-2 text-sm text-neutral-400">
                  where ρ = {correlation.toFixed(1)} is the correlation coefficient
                </div>
              </>
            )}
            {distribution === 'uniform' && (
              <>
                <LaTeXFormula 
                  formula={`f_{X,Y}(x,y) = \\begin{cases} \\frac{1}{4} & \\text{if } 0 \\leq x \\leq 2, 0 \\leq y \\leq 2 \\\\ 0 & \\text{otherwise} \\end{cases}`}
                  isBlock={true}
                />
                <div className="mt-2 text-sm text-neutral-400">
                  Independent uniform random variables on [0,2] × [0,2]
                </div>
              </>
            )}
            {distribution === 'exponential' && (
              <>
                <LaTeXFormula 
                  formula={`f_{X,Y}(x,y) = \\lambda_1 \\lambda_2 e^{-\\lambda_1 x - \\lambda_2 y}, \\quad x \\geq 0, y \\geq 0`}
                  isBlock={true}
                />
                <div className="mt-2 text-sm text-neutral-400">
                  where λ₁ = {lambda1.toFixed(1)} and λ₂ = {lambda2.toFixed(1)}
                </div>
              </>
            )}
          </Card>

          {/* Key concepts */}
          {currentStep >= 1 && (
            <Card className="p-4 bg-neutral-900 border-neutral-700">
              <h4 className="text-sm font-semibold mb-2">Key Concepts</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-blue-400">Marginal distributions:</span> 
                  <LaTeXFormula formula={`f_X(x) = \\int_{-\\infty}^{\\infty} f_{X,Y}(x,y) dy`} />
                </div>
                <div>
                  <span className="text-green-400">Conditional distribution:</span> 
                  <LaTeXFormula formula={`f_{Y|X}(y|x) = \\frac{f_{X,Y}(x,y)}{f_X(x)}`} />
                </div>
                {currentStep >= 3 && (
                  <div>
                    <span className="text-purple-400">Independence:</span> 
                    <LaTeXFormula formula={`f_{X,Y}(x,y) = f_X(x)f_Y(y)`} /> when ρ = 0
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </VisualizationContainer>

      <ProgressNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        onNext={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
        onPrevious={() => setCurrentStep(Math.max(currentStep - 1, 0))}
      />
    </div>
  );
};

export default JointDistributions;