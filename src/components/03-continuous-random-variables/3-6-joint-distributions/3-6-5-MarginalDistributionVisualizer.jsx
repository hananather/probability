'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { VisualizationContainer } from '../../ui/VisualizationContainer';
import * as d3 from "@/utils/d3-utils";
import { cn } from '../../../lib/utils';
import { useSafeMathJax } from '../../../utils/mathJaxFix';

// LaTeX formula component following existing patterns
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

const MarginalDistributionVisualizer = () => {
  const [distribution, setDistribution] = useState('bivariate-normal');
  const [correlation, setCorrelation] = useState(0.5);
  const [lambda1, setLambda1] = useState(1);
  const [lambda2, setLambda2] = useState(1.5);
  const [highlightDimension, setHighlightDimension] = useState('none'); // 'x', 'y', or 'none'
  const [mousePosition, setMousePosition] = useState(null);
  const [cursorDensity, setCursorDensity] = useState(null)
  
  const contentRef = useRef(null);
  const svgRef = useRef(null);
  
  // Use safe MathJax processing
  useSafeMathJax(contentRef, [distribution, correlation, lambda1, lambda2]);

  // PDF calculation functions
  const bivariateNormalPDF = (x, y, rho) => {
    const factor = 1 / (2 * Math.PI * Math.sqrt(1 - rho * rho));
    const exponent = -1 / (2 * (1 - rho * rho)) * (x * x - 2 * rho * x * y + y * y);
    return factor * Math.exp(exponent);
  };

  const uniformPDF = (x, y) => {
    if (x >= 0 && x <= 2 && y >= 0 && y <= 2) {
      return 0.25; // 1/(2*2)
    }
    return 0;
  };

  const exponentialPDF = (x, y, lambda1, lambda2) => {
    if (x >= 0 && y >= 0) {
      return lambda1 * lambda2 * Math.exp(-lambda1 * x - lambda2 * y);
    }
    return 0;
  };

  // Get the appropriate PDF based on distribution type
  const getJointPDF = useCallback((x, y) => {
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
  }, [distribution, correlation, lambda1, lambda2]);

  // Calculate marginal PDFs
  const getMarginalX = useCallback((x) => {
    switch (distribution) {
      case 'bivariate-normal':
        return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
      case 'uniform':
        return (x >= 0 && x <= 2) ? 0.5 : 0;
      case 'exponential':
        return x >= 0 ? lambda1 * Math.exp(-lambda1 * x) : 0;
      default:
        return 0;
    }
  }, [distribution, lambda1]);

  const getMarginalY = useCallback((y) => {
    switch (distribution) {
      case 'bivariate-normal':
        return Math.exp(-y * y / 2) / Math.sqrt(2 * Math.PI);
      case 'uniform':
        return (y >= 0 && y <= 2) ? 0.5 : 0;
      case 'exponential':
        return y >= 0 ? lambda2 * Math.exp(-lambda2 * y) : 0;
      default:
        return 0;
    }
  }, [distribution, lambda2]);

  // Generate contour and marginal data
  const { contourData, xMarginalData, yMarginalData, bounds } = useMemo(() => {
    let xMin, xMax, yMin, yMax;
    
    // Set bounds based on distribution
    if (distribution === 'uniform') {
      xMin = -0.5; xMax = 2.5; yMin = -0.5; yMax = 2.5;
    } else if (distribution === 'exponential') {
      xMin = 0; xMax = 4; yMin = 0; yMax = 4;
    } else {
      xMin = -3; xMax = 3; yMin = -3; yMax = 3;
    }
    
    const resolution = 40;
    const values = [];
    
    // Generate joint distribution contour data
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = xMin + (xMax - xMin) * i / resolution;
        const y = yMin + (yMax - yMin) * j / resolution;
        const z = getJointPDF(x, y);
        values.push({ x, y, z });
      }
    }
    
    // Generate contour levels
    let thresholds;
    if (distribution === 'uniform') {
      thresholds = [0.05, 0.1, 0.15, 0.2, 0.24];
    } else if (distribution === 'exponential') {
      const maxZ = lambda1 * lambda2;
      thresholds = d3.range(maxZ * 0.1, maxZ * 0.9, maxZ * 0.1);
    } else {
      thresholds = d3.range(0.01, 0.16, 0.02);
    }
    
    // Generate marginal distribution data
    const step = (xMax - xMin) / 100;
    const xValues = d3.range(xMin, xMax + step, step);
    const yValues = d3.range(yMin, yMax + step, step);
    
    const xMarginal = xValues.map(x => ({ x, y: getMarginalX(x) }));
    const yMarginal = yValues.map(y => ({ y, x: getMarginalY(y) }));
    
    return {
      contourData: { values, thresholds, resolution, bounds: { xMin, xMax, yMin, yMax } },
      xMarginalData: xMarginal,
      yMarginalData: yMarginal,
      bounds: { xMin, xMax, yMin, yMax }
    };
  }, [distribution, correlation, lambda1, lambda2, getJointPDF, getMarginalX, getMarginalY]);

  // Main visualization component
  const MarginalVisualization = () => {
    // Increase dimensions to accommodate marginal distributions
    const jointWidth = 360;
    const jointHeight = 360;
    const marginalHeight = 60;
    const marginalWidth = 60;
    const gap = 15; // Space between joint and marginal distributions
    
    // Calculate total SVG dimensions to fit everything
    const margin = { 
      top: marginalHeight + gap + 20,  // Space for top marginal + gap + padding
      right: marginalWidth + gap + 20, // Space for right marginal + gap + padding
      bottom: 60, 
      left: 60 
    };
    
    const totalWidth = margin.left + jointWidth + margin.right;
    const totalHeight = margin.top + jointHeight + margin.bottom;

    useEffect(() => {
      if (!svgRef.current) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      // Create main group
      const g = svg.append("g");

      // Scales for joint distribution
      const xScale = d3.scaleLinear()
        .domain([bounds.xMin, bounds.xMax])
        .range([0, jointWidth]);

      const yScale = d3.scaleLinear()
        .domain([bounds.yMin, bounds.yMax])
        .range([jointHeight, 0]);

      // Joint distribution group
      const jointGroup = g.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Add contours for joint distribution
      const contourGenerator = d3.contours()
        .size([contourData.resolution + 1, contourData.resolution + 1])
        .thresholds(contourData.thresholds);

      const contours = contourGenerator(contourData.values.map(d => d.z));

      const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(contourData.thresholds)]);

      // Add grid lines
      jointGroup.append("g")
        .attr("class", "grid")
        .attr("opacity", 0.15)
        .call(d3.axisBottom(xScale)
          .tickSize(jointHeight)
          .tickFormat("")
        )
        .style("stroke-dasharray", "2,2");

      jointGroup.append("g")
        .attr("class", "grid")
        .attr("opacity", 0.15)
        .call(d3.axisLeft(yScale)
          .tickSize(-jointWidth)
          .tickFormat("")
        )
        .style("stroke-dasharray", "2,2");

      // Add contour paths with highlighting
      const contourGroup = jointGroup.append("g")
        .attr("class", "contours");
        
      contourGroup.selectAll("path")
        .data(contours)
        .enter().append("path")
        .attr("d", d3.geoPath()
          .projection(d3.geoTransform({
            point: function(x, y) {
              const { xMin, xMax, yMin, yMax } = bounds;
              this.stream.point(
                xScale(xMin + (xMax - xMin) * x / contourData.resolution),
                yScale(yMin + (yMax - yMin) * y / contourData.resolution)
              );
            }
          })))
        .attr("fill", d => colorScale(d.value))
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        .attr("opacity", () => {
          if (highlightDimension === 'none') return 0.8;
          return 0.2; // Dim more when highlighting marginals
        })
        .style("transition", "opacity 0.3s ease");

      // Add projection lines when highlighting marginals
      if (highlightDimension === 'x') {
        // Add vertical projection lines from joint to X marginal
        const numLines = 20;
        for (let i = 0; i <= numLines; i++) {
          const x = bounds.xMin + (bounds.xMax - bounds.xMin) * i / numLines;
          jointGroup.append("line")
            .attr("x1", xScale(x))
            .attr("y1", 0)
            .attr("x2", xScale(x))
            .attr("y2", jointHeight)
            .attr("stroke", "#ff6b6b")
            .attr("stroke-width", 0.5)
            .attr("opacity", 0.3)
            .attr("stroke-dasharray", "2,2");
        }
      } else if (highlightDimension === 'y') {
        // Add horizontal projection lines from joint to Y marginal
        const numLines = 20;
        for (let i = 0; i <= numLines; i++) {
          const y = bounds.yMin + (bounds.yMax - bounds.yMin) * i / numLines;
          jointGroup.append("line")
            .attr("x1", 0)
            .attr("y1", yScale(y))
            .attr("x2", jointWidth)
            .attr("y2", yScale(y))
            .attr("stroke", "#4ecdc4")
            .attr("stroke-width", 0.5)
            .attr("opacity", 0.3)
            .attr("stroke-dasharray", "2,2");
        }
      }


      // Add axes for joint distribution
      const xAxis = jointGroup.append("g")
        .attr("transform", `translate(0,${jointHeight})`)
        .call(d3.axisBottom(xScale));
        
      xAxis.selectAll("text")
        .attr("fill", "#f3f4f6");
      xAxis.selectAll("line")
        .style("stroke", "white");
      xAxis.select(".domain")
        .style("stroke", "white");
        
      xAxis.append("text")
        .attr("x", jointWidth / 2)
        .attr("y", 40)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .text("X Variable");

      const yAxis = jointGroup.append("g")
        .call(d3.axisLeft(yScale));
        
      yAxis.selectAll("text")
        .attr("fill", "#f3f4f6");
      yAxis.selectAll("line")
        .style("stroke", "white");
      yAxis.select(".domain")
        .style("stroke", "white");
        
      yAxis.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -jointHeight / 2)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .text("Y Variable");

      // X Marginal Distribution (top)
      const xMarginalGroup = g.append("g")
        .attr("transform", `translate(${margin.left},${20})`); // Position at top with padding

      const xMarginalScale = d3.scaleLinear()
        .domain([0, d3.max(xMarginalData, d => d.y) * 1.1])
        .range([marginalHeight, 0]);

      const xMarginalArea = d3.area()
        .x(d => xScale(d.x))
        .y0(marginalHeight)
        .y1(d => xMarginalScale(d.y))
        .curve(d3.curveBasis);

      xMarginalGroup.append("path")
        .datum(xMarginalData)
        .attr("d", xMarginalArea)
        .attr("fill", "#ff6b6b")
        .attr("opacity", highlightDimension === 'x' ? 1 : 0.3)
        .attr("stroke", "#ff4757")
        .attr("stroke-width", highlightDimension === 'x' ? 3 : 1);

      // Add X marginal axis
      xMarginalGroup.append("g")
        .attr("transform", `translate(0,${marginalHeight})`)
        .call(d3.axisBottom(xScale).ticks(5))
        .selectAll("text")
        .attr("fill", "#f3f4f6")
        .style("font-size", "10px");

      xMarginalGroup.append("g")
        .call(d3.axisLeft(xMarginalScale).ticks(3))
        .selectAll("text")
        .attr("fill", "#f3f4f6")
        .style("font-size", "10px");

      // X marginal title
      xMarginalGroup.append("text")
        .attr("x", jointWidth / 2)
        .attr("y", -10)
        .attr("fill", "#ff6b6b")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Marginal of X");

      // Y Marginal Distribution (right)
      const yMarginalGroup = g.append("g")
        .attr("transform", `translate(${margin.left + jointWidth + gap},${margin.top})`);

      const yMarginalScale = d3.scaleLinear()
        .domain([0, d3.max(yMarginalData, d => d.x) * 1.1])
        .range([0, marginalWidth]);

      const yMarginalArea = d3.area()
        .y(d => yScale(d.y))
        .x0(0)
        .x1(d => yMarginalScale(d.x))
        .curve(d3.curveBasis);

      yMarginalGroup.append("path")
        .datum(yMarginalData)
        .attr("d", yMarginalArea)
        .attr("fill", "#4ecdc4")
        .attr("opacity", highlightDimension === 'y' ? 1 : 0.3)
        .attr("stroke", "#26d0ce")
        .attr("stroke-width", highlightDimension === 'y' ? 3 : 1);

      // Add Y marginal axes
      yMarginalGroup.append("g")
        .call(d3.axisLeft(yScale).ticks(5))
        .selectAll("text")
        .attr("fill", "#f3f4f6")
        .style("font-size", "10px");

      yMarginalGroup.append("g")
        .attr("transform", `translate(0,${jointHeight})`)
        .call(d3.axisBottom(yMarginalScale).ticks(3))
        .selectAll("text")
        .attr("fill", "#f3f4f6")
        .style("font-size", "10px");

      // Y marginal title
      yMarginalGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -15)
        .attr("x", -jointHeight / 2)
        .attr("fill", "#4ecdc4")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Marginal of Y");

      // Joint distribution title
      jointGroup.append("text")
        .attr("x", jointWidth / 2)
        .attr("y", -20)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Joint Distribution f(x,y)");

      // Add color scale legend
      const legendWidth = 20;
      const legendHeight = 200;
      const legendGroup = g.append("g")
        .attr("transform", `translate(${margin.left + jointWidth + gap + marginalWidth + 20}, ${margin.top + 50})`);

      // Create gradient for legend
      const gradientId = "contour-gradient";
      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

      const nStops = 10;
      for (let i = 0; i <= nStops; i++) {
        const value = (i / nStops) * d3.max(contourData.thresholds);
        gradient.append("stop")
          .attr("offset", `${(i / nStops) * 100}%`)
          .attr("stop-color", colorScale(value));
      }

      legendGroup.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", `url(#${gradientId})`);

      const legendScale = d3.scaleLinear()
        .domain([0, d3.max(contourData.thresholds)])
        .range([legendHeight, 0]);

      legendGroup.append("g")
        .attr("transform", `translate(${legendWidth}, 0)`)
        .call(d3.axisRight(legendScale).ticks(5))
        .selectAll("text")
        .style("font-size", "10px")
        .attr("fill", "#f3f4f6");

      legendGroup.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", "white")
        .text("Density");

      // Add interactive overlay for crosshair
      const overlay = jointGroup.append("rect")
        .attr("width", jointWidth)
        .attr("height", jointHeight)
        .attr("fill", "none")
        .attr("pointer-events", "all");

      const crosshairGroup = jointGroup.append("g")
        .attr("class", "crosshair")
        .style("display", "none");

      const verticalLine = crosshairGroup.append("line")
        .attr("y1", 0)
        .attr("y2", jointHeight)
        .attr("stroke", "yellow")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0.7);

      const horizontalLine = crosshairGroup.append("line")
        .attr("x1", 0)
        .attr("x2", jointWidth)
        .attr("stroke", "yellow")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0.7);

      const coordText = crosshairGroup.append("text")
        .attr("fill", "yellow")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)");

      overlay
        .on("mousemove", function(event) {
          const [mx, my] = d3.pointer(event);
          const x = xScale.invert(mx);
          const y = yScale.invert(my);
          const density = getJointPDF(x, y);

          crosshairGroup.style("display", null);
          verticalLine.attr("x1", mx).attr("x2", mx);
          horizontalLine.attr("y1", my).attr("y2", my);
          
          coordText
            .attr("x", mx + 5)
            .attr("y", my - 5)
            .text(`(${x.toFixed(2)}, ${y.toFixed(2)}) = ${density.toFixed(4)}`);

          setMousePosition({ x, y });
          setCursorDensity(density);
        })
        .on("mouseout", function() {
          crosshairGroup.style("display", "none");
          setMousePosition(null);
          setCursorDensity(null);
        });

    }, [
      contourData, 
      xMarginalData, 
      yMarginalData, 
      bounds, 
      highlightDimension,
      getJointPDF,
      setMousePosition,
      setCursorDensity
    ]);

    return (
      <div className="flex flex-col items-center" style={{ width: '100%', minWidth: `${totalWidth}px` }}>
        <svg ref={svgRef} width={totalWidth} height={totalHeight} style={{ overflow: 'visible' }} />
      </div>
    );
  };

  return (
    <div className="space-y-4" ref={contentRef}>
      <VisualizationContainer
        title="Marginal Distribution Visualization"
        description="See how joint distributions project onto their marginal distributions through integration"
      >
        <div className="space-y-6">
          {/* Controls */}
          <Card className="p-4 bg-neutral-900 border-neutral-700">
            <div className="space-y-4">
              {/* Distribution selector */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={() => setDistribution('bivariate-normal')}
                  variant={distribution === 'bivariate-normal' ? "default" : "outline"}
                  size="sm"
                  className="transition-all duration-300"
                >
                  Bivariate Normal
                </Button>
                <Button
                  onClick={() => setDistribution('uniform')}
                  variant={distribution === 'uniform' ? "default" : "outline"}
                  size="sm"
                  className="transition-all duration-300"
                >
                  Uniform
                </Button>
                <Button
                  onClick={() => setDistribution('exponential')}
                  variant={distribution === 'exponential' ? "default" : "outline"}
                  size="sm"
                  className="transition-all duration-300"
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
              </div>

              {/* Highlighting controls */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={() => setHighlightDimension('x')}
                  variant={highlightDimension === 'x' ? "default" : "outline"}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
                >
                  Highlight X Marginal
                </Button>
                
                <Button
                  onClick={() => setHighlightDimension('y')}
                  variant={highlightDimension === 'y' ? "default" : "outline"}
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white transition-all duration-200"
                >
                  Highlight Y Marginal
                </Button>

                <Button
                  onClick={() => setHighlightDimension('none')}
                  variant={highlightDimension === 'none' ? "default" : "outline"}
                  size="sm"
                  className="transition-all duration-200"
                >
                  Show Both Marginals
                </Button>
              </div>
              
              {/* Quick Presets */}
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                <span className="text-xs text-neutral-400 self-center">Quick Presets:</span>
                {distribution === 'bivariate-normal' && (
                  <>
                    <Button
                      onClick={() => setCorrelation(0)}
                      size="sm"
                      variant="outline"
                      className="text-xs py-1 px-2"
                    >
                      Independent (ρ=0)
                    </Button>
                    <Button
                      onClick={() => setCorrelation(0.7)}
                      size="sm"
                      variant="outline"
                      className="text-xs py-1 px-2"
                    >
                      Strong Positive (ρ=0.7)
                    </Button>
                    <Button
                      onClick={() => setCorrelation(-0.7)}
                      size="sm"
                      variant="outline"
                      className="text-xs py-1 px-2"
                    >
                      Strong Negative (ρ=-0.7)
                    </Button>
                  </>
                )}
                {distribution === 'exponential' && (
                  <>
                    <Button
                      onClick={() => { setLambda1(1); setLambda2(1); }}
                      size="sm"
                      variant="outline"
                      className="text-xs py-1 px-2"
                    >
                      Equal Rates (λ=1)
                    </Button>
                    <Button
                      onClick={() => { setLambda1(0.5); setLambda2(2); }}
                      size="sm"
                      variant="outline"
                      className="text-xs py-1 px-2"
                    >
                      Different Rates
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Main visualization */}
          <div className="flex justify-center" style={{ marginTop: '20px', marginBottom: '40px' }}>
            <div style={{ minHeight: '600px', overflow: 'visible' }}>
              <MarginalVisualization />
              {/* Statistical Info Overlay */}
              {cursorDensity !== null && (
                <div className="mt-4 p-3 bg-neutral-800/90 rounded-lg border border-neutral-600">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-400">Cursor Position:</span>
                      <div className="font-mono text-yellow-400">
                        ({mousePosition?.x.toFixed(2)}, {mousePosition?.y.toFixed(2)})
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Density at Cursor:</span>
                      <div className="font-mono text-yellow-400">
                        {cursorDensity.toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Distribution Parameters:</span>
                      <div className="font-mono text-blue-400">
                        {distribution === 'bivariate-normal' && `ρ = ${correlation.toFixed(2)}`}
                        {distribution === 'exponential' && `λ₁ = ${lambda1.toFixed(1)}, λ₂ = ${lambda2.toFixed(1)}`}
                        {distribution === 'uniform' && `[0,2] × [0,2]`}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mathematical formulas */}
          <Card className="p-6 bg-neutral-900 border-neutral-700">
            <h4 className="text-sm font-semibold mb-4">Integration Formulas for Marginal Distributions</h4>
            
            <div className="space-y-4">
              {/* X Marginal */}
              <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                <h5 className="text-red-400 font-semibold mb-3">X Marginal Distribution</h5>
                <LaTeXFormula 
                  formula={`f_X(x) = \\int_{-\\infty}^{\\infty} f_{X,Y}(x,y) \\, dy`}
                  isBlock={true}
                />
                <p className="text-sm text-neutral-400 mt-2">
                  Integrate over all values of Y to get the marginal distribution of X
                </p>
              </div>

              {/* Y Marginal */}
              <div className="p-4 bg-teal-900/20 rounded-lg border border-teal-500/30">
                <h5 className="text-teal-400 font-semibold mb-3">Y Marginal Distribution</h5>
                <LaTeXFormula 
                  formula={`f_Y(y) = \\int_{-\\infty}^{\\infty} f_{X,Y}(x,y) \\, dx`}
                  isBlock={true}
                />
                <p className="text-sm text-neutral-400 mt-2">
                  Integrate over all values of X to get the marginal distribution of Y
                </p>
              </div>

              {/* Joint distribution formula */}
              <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-600">
                <h5 className="text-white font-semibold mb-3">
                  {distribution === 'bivariate-normal' && 'Bivariate Normal Distribution'}
                  {distribution === 'uniform' && 'Joint Uniform Distribution'}
                  {distribution === 'exponential' && 'Joint Exponential Distribution'}
                </h5>
                
                {distribution === 'bivariate-normal' && (
                  <>
                    <LaTeXFormula 
                      formula={`f_{X,Y}(x,y) = \\frac{1}{2\\pi\\sqrt{1-\\rho^2}} \\exp\\left(-\\frac{1}{2(1-\\rho^2)}[x^2 - 2\\rho xy + y^2]\\right)`}
                      isBlock={true}
                    />
                    <p className="text-sm text-neutral-400 mt-2">
                      with correlation ρ = {correlation.toFixed(1)}
                    </p>
                    <div className="mt-3 p-2 bg-yellow-900/20 rounded border border-yellow-600/30">
                      <p className="text-xs text-yellow-400">
                        <strong>Note:</strong> For standard bivariate normal, the marginals are always N(0,1) regardless of ρ.
                        The correlation affects how X and Y relate to each other, not their individual distributions.
                      </p>
                    </div>
                  </>
                )}
                
                {distribution === 'uniform' && (
                  <>
                    <LaTeXFormula 
                      formula={`f_{X,Y}(x,y) = \\begin{cases} \\frac{1}{4} & \\text{if } 0 \\leq x \\leq 2, 0 \\leq y \\leq 2 \\\\ 0 & \\text{otherwise} \\end{cases}`}
                      isBlock={true}
                    />
                    <p className="text-sm text-neutral-400 mt-2">
                      Independent uniform random variables on [0,2] × [0,2]
                    </p>
                  </>
                )}
                
                {distribution === 'exponential' && (
                  <>
                    <LaTeXFormula 
                      formula={`f_{X,Y}(x,y) = \\lambda_1 \\lambda_2 e^{-\\lambda_1 x - \\lambda_2 y}, \\quad x \\geq 0, y \\geq 0`}
                      isBlock={true}
                    />
                    <p className="text-sm text-neutral-400 mt-2">
                      with λ₁ = {lambda1.toFixed(1)} and λ₂ = {lambda2.toFixed(1)}
                    </p>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Educational explanations */}
          <Card className="p-4 bg-neutral-900 border-neutral-700">
            <h4 className="text-sm font-semibold mb-3">Understanding Marginal Distributions</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-red-400">X Marginal (Red):</span> Shows the distribution of X values regardless of Y. 
                  It's what you get by "projecting" the joint distribution onto the X-axis.
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-teal-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-teal-400">Y Marginal (Teal):</span> Shows the distribution of Y values regardless of X. 
                  It's what you get by "projecting" the joint distribution onto the Y-axis.
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-blue-400">Joint Distribution (Blue):</span> Shows the combined behavior of both X and Y together. 
                  Higher contour levels indicate regions where both X and Y are more likely to occur together.
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-yellow-400">Interactive Crosshair:</span> Hover over the joint distribution to see exact coordinates and probability density values.
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                <p className="text-yellow-400 font-medium">💡 Key Insights:</p>
                <ul className="text-neutral-300 text-sm mt-2 space-y-1">
                  <li>• <strong>Integration:</strong> Marginals are obtained by integrating the joint distribution over the other variable</li>
                  <li>• <strong>Projection:</strong> The dashed lines show how the joint distribution "projects" onto each axis</li>
                  <li>• <strong>Independence:</strong> For independent variables (uniform, exponential), the joint PDF equals the product of marginals</li>
                  <li>• <strong>Correlation:</strong> For bivariate normal, ρ affects the joint shape but not the marginal distributions</li>
                </ul>
              </div>
              
              <div className="mt-3 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                <p className="text-green-400 font-medium text-sm">✨ New Interactive Features:</p>
                <ul className="text-neutral-300 text-xs mt-2 space-y-1">
                  <li>• <strong>Hover over the plot</strong> to see coordinates and density values with yellow crosshair</li>
                  <li>• <strong>Color scale legend</strong> on the right shows density levels</li>
                  <li>• <strong>Grid lines</strong> for better readability</li>
                  <li>• <strong>Quick presets</strong> for common parameter values</li>
                  <li>• <strong>Live statistics</strong> displayed below the plot when hovering</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </VisualizationContainer>
    </div>
  );
};

export default MarginalDistributionVisualizer;