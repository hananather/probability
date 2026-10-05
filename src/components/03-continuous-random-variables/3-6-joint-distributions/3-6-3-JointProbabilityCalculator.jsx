'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { VisualizationContainer } from '../../ui/VisualizationContainer';
import * as d3 from "@/utils/d3-utils";
import { useMathJax } from '@/hooks/useMathJax';
import BackToHub from '../../ui/BackToHub';
import { calculateJointIntegral, createJointPDF, formatCalculationNumber, formatProbabilityResult } from './calculatorMath';

// LaTeX formula component
const LaTeXFormula = React.memo(function LaTeXFormula({ formula, isBlock = false }) {
  const contentRef = useMathJax([formula]);
  
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
  const [integrationSteps, setIntegrationSteps] = useState(20);
  const [showIntegration, setShowIntegration] = useState(false);
  
  const svgRef = useRef(null);
  
  const parameters = useMemo(() => ({ correlation, lambda1, lambda2, a: 2, b: 2 }), [correlation, lambda1, lambda2]);
  const density = useMemo(() => {
    try {
      return { pdf: createJointPDF(distribution, parameters), error: null };
    } catch (error) {
      return { pdf: () => 0, error: error.message };
    }
  }, [distribution, parameters]);
  const getJointPDF = density.pdf;
  const calculation = useMemo(() => {
    if (!region || density.error) return { results: null, error: density.error };
    try {
      return { results: calculateJointIntegral({ distribution, parameters, region, subdivisions: integrationSteps }), error: null };
    } catch (error) {
      return { results: null, error: error.message };
    }
  }, [distribution, parameters, region, integrationSteps, density.error]);
  const results = calculation.results;
  const contentRef = useMathJax([distribution, results]);

  // Get bounds based on distribution
  const bounds = useMemo(() => {
    if (distribution === 'uniform') {
      return { xMin: -0.5, xMax: 2.5, yMin: -0.5, yMax: 2.5 };
    } else if (distribution === 'exponential') {
      return { xMin: 0, xMax: 4, yMin: 0, yMax: 4 };
    } else {
      return { xMin: -3, xMax: 3, yMin: -3, yMax: 3 };
    }
  }, [distribution]);

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
    if (density.error) return;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

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
      .attr("y", 40)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .text("X");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", "#f3f4f6");

    g.select("g:last-of-type")
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
        const [x, y] = d3.pointer(event, g.node());
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
        
        const [x, y] = d3.pointer(event, g.node());
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
        
        const [x, y] = d3.pointer(event, g.node());
        const x1 = xScale.invert(Math.min(startPoint.x, x));
        const x2 = xScale.invert(Math.max(startPoint.x, x));
        const y1 = yScale.invert(Math.max(startPoint.y, y));
        const y2 = yScale.invert(Math.min(startPoint.y, y));
        
        setRegion({ x1, x2, y1, y2 });
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

  }, [bounds, getJointPDF, density.error, region, showIntegration, integrationSteps]);

  return (
    <VisualizationContainer
      title="Interactive Probability Calculator"
      description="Click and drag to select a region and calculate P(X∈A, Y∈B)"
    >
      <BackToHub />
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
                <label htmlFor="joint-correlation" className="text-sm font-medium">Correlation (ρ):</label>
                <input
                  id="joint-correlation"
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
                  <label htmlFor="joint-lambda1" className="text-sm font-medium">λ₁:</label>
                  <input
                    id="joint-lambda1"
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
                  <label htmlFor="joint-lambda2" className="text-sm font-medium">λ₂:</label>
                  <input
                    id="joint-lambda2"
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
              <label htmlFor="joint-integration-steps" className="text-sm font-medium">Integration Steps:</label>
              <input
                id="joint-integration-steps"
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
          <svg ref={svgRef} width={600} height={600} aria-label="Select a rectangular probability region" />
          <div className="mt-2 text-sm text-neutral-400">
            Click and drag to select a rectangular region
          </div>
        </div>

        {/* Results */}
        {calculation.error && <p role="alert" className="text-sm text-red-300">{calculation.error}</p>}
        {region && results && (
          <Card className="p-4 bg-neutral-900 border-neutral-700">
            <h4 className="text-sm font-semibold mb-2">Probability Calculation</h4>
            <div className="space-y-2">
              <output aria-label="Grid estimate">
                <LaTeXFormula 
                  formula={`\\text{Midpoint estimate} = ${formatProbabilityResult(results.estimate, true, 4)}`}
                  isBlock={true}
                />
              </output>
              {results.exactProbability !== null && (
                <p className="text-sm text-neutral-300">Closed-form probability: <output aria-label="Closed-form probability">{formatProbabilityResult(results.exactProbability, false, 4)}</output></p>
              )}
              {results.outsideProbabilityRange && (
                <p role="status" className="text-sm text-amber-300">This coarse sum exceeds 1. Refine the grid before interpreting it as a probability.</p>
              )}
              <div className="text-sm text-neutral-400">
                Calculated using {integrationSteps}×{integrationSteps} subdivisions and {results.subdivisions.total} rectangles
              </div>
              <p className="text-xs text-neutral-400">The grid gives an approximation for [{formatCalculationNumber(region.x1)}, {formatCalculationNumber(region.x2)}] × [{formatCalculationNumber(region.y1)}, {formatCalculationNumber(region.y2)}]. The uniform and exponential models use independent coordinates; the normal model has standard normal marginals with correlation ρ.</p>
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
            <li>A grid approximation to P(X∈A, Y∈B) will be calculated automatically</li>
            <li>Enable &quot;Show Integration Grid&quot; to see the numerical integration process</li>
            <li>Increase integration steps for more accurate results</li>
          </ol>
        </Card>
      </div>
    </VisualizationContainer>
  );
};

export default JointProbabilityCalculator;
