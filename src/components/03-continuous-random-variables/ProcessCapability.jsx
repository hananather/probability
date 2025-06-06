"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { createColorScheme, typography } from "../../lib/design-system";
import { Button } from "../ui/button";
import { Info, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import * as jStat from "jstat";

const ProcessCapability = () => {
  const colors = createColorScheme('hypothesis');
  const svgRef = useRef(null);
  
  // Process parameters
  const [processParams, setProcessParams] = useState({
    mean: 100,
    stdDev: 2,
    lsl: 94,  // Lower Specification Limit
    usl: 106, // Upper Specification Limit
    target: 100
  });
  
  // Calculated values
  const [capabilities, setCapabilities] = useState({
    cp: 0,
    cpk: 0,
    cpu: 0,
    cpl: 0,
    ppm: 0,
    yield: 0,
    sigma: 0
  });
  
  const [showSixSigma, setShowSixSigma] = useState(false);
  const [animateSamples, setAnimateSamples] = useState(false);
  
  // Calculate process capabilities
  useEffect(() => {
    const { mean, stdDev, lsl, usl, target } = processParams;
    
    // Cp: Process capability (potential)
    const cp = (usl - lsl) / (6 * stdDev);
    
    // Cpu: Upper capability index
    const cpu = (usl - mean) / (3 * stdDev);
    
    // Cpl: Lower capability index
    const cpl = (mean - lsl) / (3 * stdDev);
    
    // Cpk: Process capability index (actual)
    const cpk = Math.min(cpu, cpl);
    
    // Calculate defects per million
    const zLower = (lsl - mean) / stdDev;
    const zUpper = (usl - mean) / stdDev;
    const pLower = jStat.normal.cdf(zLower, 0, 1);
    const pUpper = 1 - jStat.normal.cdf(zUpper, 0, 1);
    const pDefect = pLower + pUpper;
    const ppm = pDefect * 1000000;
    const processYield = (1 - pDefect) * 100;
    
    // Calculate sigma level (simplified)
    const sigmaLevel = 3 * cpk;
    
    setCapabilities({
      cp: cp,
      cpk: cpk,
      cpu: cpu,
      cpl: cpl,
      ppm: ppm,
      yield: processYield,
      sigma: sigmaLevel
    });
  }, [processParams]);
  
  // D3 Visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 700;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    const g = svg.append("g");
    
    const { mean, stdDev, lsl, usl, target } = processParams;
    
    // Scales
    const xExtent = Math.max(Math.abs(mean - lsl), Math.abs(usl - mean)) + 4 * stdDev;
    const xScale = d3.scaleLinear()
      .domain([mean - xExtent, mean + xExtent])
      .range([margin.left, width - margin.right]);
      
    const yScale = d3.scaleLinear()
      .domain([0, 0.4 / stdDev])
      .range([height - margin.bottom, margin.top]);
    
    // Normal PDF
    const normalPDF = (x) => {
      const exp = -0.5 * Math.pow((x - mean) / stdDev, 2);
      return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exp);
    };
    
    // Generate curve data
    const curveData = d3.range(mean - xExtent, mean + xExtent, stdDev / 50)
      .map(x => ({ x, y: normalPDF(x) }));
    
    // Background
    g.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", colors.background)
      .attr("opacity", 0.05);
    
    // Specification limits region
    g.append("rect")
      .attr("x", xScale(lsl))
      .attr("y", margin.top)
      .attr("width", xScale(usl) - xScale(lsl))
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", colors.primary)
      .attr("opacity", 0.1)
      .attr("stroke", colors.primary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    // Out-of-spec regions
    const areaGen = d3.area()
      .x(d => xScale(d.x))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Lower out-of-spec
    const lowerDefectData = curveData.filter(d => d.x < lsl);
    if (lowerDefectData.length > 0) {
      g.append("path")
        .datum(lowerDefectData)
        .attr("d", areaGen)
        .attr("fill", "red")
        .attr("opacity", 0.3);
    }
    
    // Upper out-of-spec
    const upperDefectData = curveData.filter(d => d.x > usl);
    if (upperDefectData.length > 0) {
      g.append("path")
        .datum(upperDefectData)
        .attr("d", areaGen)
        .attr("fill", "red")
        .attr("opacity", 0.3);
    }
    
    // Within-spec area
    const withinSpecData = curveData.filter(d => d.x >= lsl && d.x <= usl);
    g.append("path")
      .datum(withinSpecData)
      .attr("d", areaGen)
      .attr("fill", colors.primary)
      .attr("opacity", 0.2);
    
    // Draw PDF curve
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
      
    g.append("path")
      .datum(curveData)
      .attr("d", line)
      .attr("stroke", colors.text)
      .attr("stroke-width", 3)
      .attr("fill", "none");
    
    // Specification limit lines
    [
      { x: lsl, label: 'LSL', color: 'red' },
      { x: usl, label: 'USL', color: 'red' },
      { x: target, label: 'Target', color: colors.accent },
      { x: mean, label: 'Mean', color: colors.primary }
    ].forEach(spec => {
      // Vertical line
      g.append("line")
        .attr("x1", xScale(spec.x))
        .attr("y1", margin.top)
        .attr("x2", xScale(spec.x))
        .attr("y2", height - margin.bottom)
        .attr("stroke", spec.color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", spec.label === 'Mean' ? "none" : "5,5");
      
      // Label
      g.append("text")
        .attr("x", xScale(spec.x))
        .attr("y", margin.top - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .style("fill", spec.color)
        .text(`${spec.label}: ${spec.x}`);
    });
    
    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(5);
    
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .style("color", colors.secondary);
      
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .style("color", colors.secondary);
    
    // Title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", colors.text)
      .text("Process Capability Analysis");
    
    // Six Sigma visualization
    if (showSixSigma) {
      [-6, -3, 3, 6].forEach(sigma => {
        const x = mean + sigma * stdDev;
        if (x >= xScale.domain()[0] && x <= xScale.domain()[1]) {
          g.append("line")
            .attr("x1", xScale(x))
            .attr("y1", margin.top)
            .attr("x2", xScale(x))
            .attr("y2", height - margin.bottom)
            .attr("stroke", colors.secondary)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "2,2")
            .attr("opacity", 0.5);
            
          g.append("text")
            .attr("x", xScale(x))
            .attr("y", height - margin.bottom + 20)
            .attr("text-anchor", "middle")
            .style("font-size", "10px")
            .style("fill", colors.secondary)
            .text(`${sigma > 0 ? '+' : ''}${sigma}σ`);
        }
      });
    }
    
  }, [processParams, showSixSigma, colors]);
  
  // Get capability interpretation
  const getCapabilityInterpretation = (cpk) => {
    if (cpk < 0.67) return { status: 'Poor', color: 'red', icon: AlertTriangle };
    if (cpk < 1.0) return { status: 'Marginal', color: 'orange', icon: AlertTriangle };
    if (cpk < 1.33) return { status: 'Capable', color: 'yellow', icon: Info };
    if (cpk < 1.67) return { status: 'Good', color: 'lightgreen', icon: CheckCircle };
    return { status: 'Excellent', color: 'green', icon: TrendingUp };
  };
  
  const interpretation = getCapabilityInterpretation(capabilities.cpk);
  const InterpretationIcon = interpretation.icon;
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Process Capability Analysis (Cp/Cpk)</span>
            <Button
              onClick={() => setShowSixSigma(!showSixSigma)}
              variant="outline"
              size="sm"
            >
              {showSixSigma ? 'Hide' : 'Show'} 6σ
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {/* Controls */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Process Parameters</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Process Mean: {processParams.mean}
                    </label>
                    <input
                      type="range"
                      min="90"
                      max="110"
                      step="0.1"
                      value={processParams.mean}
                      onChange={(e) => setProcessParams(prev => ({ ...prev, mean: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Process Std Dev: {processParams.stdDev.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.1"
                      value={processParams.stdDev}
                      onChange={(e) => setProcessParams(prev => ({ ...prev, stdDev: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      LSL (Lower Spec): {processParams.lsl}
                    </label>
                    <input
                      type="range"
                      min="85"
                      max="99"
                      step="0.5"
                      value={processParams.lsl}
                      onChange={(e) => setProcessParams(prev => ({ ...prev, lsl: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      USL (Upper Spec): {processParams.usl}
                    </label>
                    <input
                      type="range"
                      min="101"
                      max="115"
                      step="0.5"
                      value={processParams.usl}
                      onChange={(e) => setProcessParams(prev => ({ ...prev, usl: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Capability Indices */}
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                <h4 className="font-semibold">Capability Indices</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cp (Potential):</span>
                    <span className="font-mono font-semibold">{capabilities.cp.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cpk (Actual):</span>
                    <span className="font-mono font-semibold">{capabilities.cpk.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cpu (Upper):</span>
                    <span className="font-mono">{capabilities.cpu.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cpl (Lower):</span>
                    <span className="font-mono">{capabilities.cpl.toFixed(3)}</span>
                  </div>
                </div>
              </div>
              
              {/* Process Performance */}
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                <h4 className="font-semibold">Process Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>PPM (Defects):</span>
                    <span className="font-mono font-semibold">{capabilities.ppm.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yield:</span>
                    <span className="font-mono font-semibold">{capabilities.yield.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sigma Level:</span>
                    <span className="font-mono">{capabilities.sigma.toFixed(1)}σ</span>
                  </div>
                </div>
              </div>
              
              {/* Interpretation */}
              <div className={`p-3 rounded-lg border`} style={{ 
                backgroundColor: `${interpretation.color}20`,
                borderColor: `${interpretation.color}60`
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <InterpretationIcon className="w-5 h-5" style={{ color: interpretation.color }} />
                  <h4 className="font-semibold">Process Status: {interpretation.status}</h4>
                </div>
                <div className="text-xs space-y-1">
                  {capabilities.cpk < 1.0 && (
                    <p>⚠️ Process is not capable of meeting specifications consistently.</p>
                  )}
                  {capabilities.cpk >= 1.0 && capabilities.cpk < 1.33 && (
                    <p>✓ Process meets specifications but has limited safety margin.</p>
                  )}
                  {capabilities.cpk >= 1.33 && (
                    <p>✨ Process has good capability with safety margin.</p>
                  )}
                  {capabilities.cp > capabilities.cpk + 0.2 && (
                    <p>💡 Process is off-center. Centering could improve Cpk.</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Visualization */}
            <div className="col-span-2">
              <svg 
                ref={svgRef} 
                width={700} 
                height={400}
                className="w-full h-full"
              />
              
              {/* Engineering Context */}
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Engineering Applications</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-semibold">Manufacturing Example:</p>
                    <p>A shaft diameter spec: 100±6mm</p>
                    <p>Current: μ={processParams.mean}mm, σ={processParams.stdDev}mm</p>
                    <p>Cpk={capabilities.cpk.toFixed(2)} → {interpretation.status}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Industry Standards:</p>
                    <p>• Cpk ≥ 1.33: Automotive</p>
                    <p>• Cpk ≥ 1.67: Medical devices</p>
                    <p>• Cpk ≥ 2.00: Aerospace critical</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessCapability;