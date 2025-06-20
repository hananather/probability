'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { VisualizationContainer } from '../ui/VisualizationContainer';
import * as d3 from "@/utils/d3-utils";
import { useSafeMathJax } from '../../utils/mathJaxFix';

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

export const JointProbabilityCalculator = () => {
  const [distribution, setDistribution] = useState('bivariate-normal');
  const [correlation, setCorrelation] = useState(0.5);
  const [lambda1, setLambda1] = useState(1);
  const [lambda2, setLambda2] = useState(1.5);
  const [region, setRegion] = useState(null);
  const [probability, setProbability] = useState(null);
  const [integrationSteps, setIntegrationSteps] = useState(20);
  const [showIntegration, setShowIntegration] = useState(false);
  
  const svgRef = useRef(null);
  const contentRef = useRef(null);
  
  useSafeMathJax(contentRef, [distribution, probability]);

  // PDF functions
  const bivariateNormalPDF = (x, y, rho) => {
    const factor = 1 / (2 * Math.PI * Math.sqrt(1 - rho * rho));
    const exponent = -1 / (2 * (1 - rho * rho)) * (x * x - 2 * rho * x * y + y * y);
    return factor * Math.exp(exponent);
  };

  const uniformPDF = (x, y) => {
    if (x >= 0 && x <= 2 && y >= 0 && y <= 2) {
      return 0.25;
    }
    return 0;
  };

  const exponentialPDF = (x, y, l1, l2) => {
    if (x >= 0 && y >= 0) {
      return l1 * l2 * Math.exp(-l1 * x - l2 * y);
    }
    return 0;
  };

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

  // Calculate probability for a rectangular region
  const calculateProbability = (x1, x2, y1, y2) => {
    const dx = (x2 - x1) / integrationSteps;
    const dy = (y2 - y1) / integrationSteps;
    let sum = 0;
    
    for (let i = 0; i < integrationSteps; i++) {
      for (let j = 0; j < integrationSteps; j++) {
        const x = x1 + (i + 0.5) * dx;
        const y = y1 + (j + 0.5) * dy;
        sum += getJointPDF(x, y);
      }
    }
    
    return sum * dx * dy;
  };

  // Get bounds based on distribution
  const getBounds = () => {
    if (distribution === 'uniform') {
      return { xMin: -0.5, xMax: 2.5, yMin: -0.5, yMax: 2.5 };
    } else if (distribution === 'exponential') {
      return { xMin: 0, xMax: 4, yMin: 0, yMax: 4 };
    } else {
      return { xMin: -3, xMax: 3, yMin: -3, yMax: 3 };
    }
  };

  // Visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const width = 600;
    const height = 600;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const bounds = getBounds();
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

    // Add contour plot background
    const resolution = 50;
    const contourData = [];
    
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = bounds.xMin + (bounds.xMax - bounds.xMin) * i / resolution;
        const y = bounds.yMin + (bounds.yMax - bounds.yMin) * j / resolution;
        contourData.push(getJointPDF(x, y));
      }
    }

    const contourGenerator = d3.contours()
      .size([resolution + 1, resolution + 1])
      .thresholds(10);

    const contours = contourGenerator(contourData);

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(contourData)]);

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
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.6);

    // Selection interaction
    let startPoint = null;
    let selectionRect = null;

    const dragBehavior = d3.drag()
      .on("start", function(event) {
        const [x, y] = d3.pointer(event);
        startPoint = { x, y };
        
        if (selectionRect) selectionRect.remove();
        
        selectionRect = g.append("rect")
          .attr("class", "selection")
          .attr("x", x)
          .attr("y", y)
          .attr("width", 0)
          .attr("height", 0)
          .attr("fill", "yellow")
          .attr("opacity", 0.3)
          .attr("stroke", "yellow")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
      })
      .on("drag", function(event) {
        if (!startPoint || !selectionRect) return;
        
        const [x, y] = d3.pointer(event);
        const x1 = Math.min(startPoint.x, x);
        const y1 = Math.min(startPoint.y, y);
        const width = Math.abs(x - startPoint.x);
        const height = Math.abs(y - startPoint.y);
        
        selectionRect
          .attr("x", x1)
          .attr("y", y1)
          .attr("width", width)
          .attr("height", height);
      })
      .on("end", function(event) {
        if (!startPoint || !selectionRect) return;
        
        const [x, y] = d3.pointer(event);
        const x1 = xScale.invert(Math.min(startPoint.x, x));
        const x2 = xScale.invert(Math.max(startPoint.x, x));
        const y1 = yScale.invert(Math.max(startPoint.y, y));
        const y2 = yScale.invert(Math.min(startPoint.y, y));
        
        setRegion({ x1, x2, y1, y2 });
        const prob = calculateProbability(x1, x2, y1, y2);
        setProbability(prob);
      });

    // Add invisible rect for drag interaction
    g.append("rect")
      .attr("width", plotWidth)
      .attr("height", plotHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .call(dragBehavior);

    // Show selected region
    if (region) {
      g.append("rect")
        .attr("x", xScale(region.x1))
        .attr("y", yScale(region.y2))
        .attr("width", xScale(region.x2) - xScale(region.x1))
        .attr("height", yScale(region.y1) - yScale(region.y2))
        .attr("fill", "yellow")
        .attr("opacity", 0.3)
        .attr("stroke", "yellow")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");

      // Show integration grid if enabled
      if (showIntegration) {
        const dx = (region.x2 - region.x1) / integrationSteps;
        const dy = (region.y2 - region.y1) / integrationSteps;
        
        for (let i = 0; i < integrationSteps; i++) {
          for (let j = 0; j < integrationSteps; j++) {
            const x = region.x1 + (i + 0.5) * dx;
            const y = region.y1 + (j + 0.5) * dy;
            const value = getJointPDF(x, y);
            
            g.append("rect")
              .attr("x", xScale(region.x1 + i * dx))
              .attr("y", yScale(region.y1 + (j + 1) * dy))
              .attr("width", (xScale(region.x1 + dx) - xScale(region.x1)))
              .attr("height", Math.abs(yScale(region.y1 + dy) - yScale(region.y1)))
              .attr("fill", colorScale(value))
              .attr("opacity", 0.8)
              .attr("stroke", "white")
              .attr("stroke-width", 0.5);
          }
        }
      }
    }

  }, [distribution, correlation, lambda1, lambda2, region, showIntegration, integrationSteps]);

  return (
    <VisualizationContainer
      title="Interactive Probability Calculator"
      description="Click and drag to select a region and calculate P(X∈A, Y∈B)"
    >
      <div className="space-y-6" ref={contentRef}>
        {/* Controls */}
        <div className="space-y-4">
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

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Integration Steps:</label>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={integrationSteps}
                onChange={(e) => setIntegrationSteps(parseInt(e.target.value))}
                className="w-32"
              />
              <span className="text-sm font-mono w-12">{integrationSteps}</span>
            </div>

            <Button
              onClick={() => setShowIntegration(!showIntegration)}
              variant={showIntegration ? "default" : "outline"}
              size="sm"
            >
              {showIntegration ? "Hide" : "Show"} Integration Grid
            </Button>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex flex-col items-center">
          <svg ref={svgRef} width={600} height={600} />
          <div className="mt-2 text-sm text-neutral-400">
            Click and drag to select a rectangular region
          </div>
        </div>

        {/* Results */}
        {region && probability !== null && (
          <Card className="p-4 bg-neutral-900 border-neutral-700">
            <h4 className="text-sm font-semibold mb-2">Probability Calculation</h4>
            <div className="space-y-2">
              <div>
                <LaTeXFormula 
                  formula={`P(${region.x1.toFixed(2)} \\leq X \\leq ${region.x2.toFixed(2)}, ${region.y1.toFixed(2)} \\leq Y \\leq ${region.y2.toFixed(2)}) = ${probability.toFixed(4)}`}
                  isBlock={true}
                />
              </div>
              <div className="text-sm text-neutral-400">
                Calculated using {integrationSteps}×{integrationSteps} = {integrationSteps * integrationSteps} rectangles
              </div>
              <div className="text-sm text-neutral-400">
                Integration formula:
                <LaTeXFormula 
                  formula={`\\iint_R f_{X,Y}(x,y) \\, dx \\, dy \\approx \\sum_{i,j} f_{X,Y}(x_i, y_j) \\Delta x \\Delta y`}
                  isBlock={true}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-4 bg-neutral-900 border-neutral-700">
          <h4 className="text-sm font-semibold mb-2">How to Use</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Select a distribution type and adjust parameters</li>
            <li>Click and drag on the visualization to select a rectangular region</li>
            <li>The probability P(X∈A, Y∈B) will be calculated automatically</li>
            <li>Enable "Show Integration Grid" to see the numerical integration process</li>
            <li>Increase integration steps for more accurate results</li>
          </ol>
        </Card>
      </div>
    </VisualizationContainer>
  );
};

export default JointProbabilityCalculator;