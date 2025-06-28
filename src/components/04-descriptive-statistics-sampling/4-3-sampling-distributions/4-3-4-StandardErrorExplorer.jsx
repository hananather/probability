"use client";

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { GraphContainer } from "@/components/ui/VisualizationContainer";
import { Button } from "@/components/ui/button";
import { useSafeMathJax } from "@/utils/mathJaxFix";
import { colorSchemes } from "@/lib/design-system";
import { Calculator, Target, DollarSign, AlertCircle } from "lucide-react";
import { RangeSlider } from "@/components/ui/RangeSlider";

const StandardErrorExplorer = () => {
  const [stage, setStage] = useState(1);
  const [populationSigma, setPopulationSigma] = useState(10);
  const [sampleSize, setSampleSize] = useState(10);
  const [targetPrecision, setTargetPrecision] = useState(2);
  const [showCostAnalysis, setShowCostAnalysis] = useState(false);
  const [costPerSample, setCostPerSample] = useState(10);
  
  const formulaRef = useRef(null);
  const visualizationRef = useRef(null);
  const precisionRef = useRef(null);
  const comparisonRef = useRef(null);

  // Calculate standard error
  const standardError = populationSigma / Math.sqrt(sampleSize);
  
  // Calculate required sample size for target precision
  const requiredSampleSize = Math.ceil(Math.pow(populationSigma / targetPrecision, 2));
  
  // Calculate cost
  const totalCost = sampleSize * costPerSample;

  // Animate formula breakdown
  useEffect(() => {
    if (!formulaRef.current || stage < 1) return;

    const svg = d3.select(formulaRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 200;

    // Components of the formula
    const components = [
      { id: 'se', x: 50, y: 100, text: 'SE', color: colorSchemes.inference.primary },
      { id: 'equals', x: 120, y: 100, text: '=', color: 'white' },
      { id: 'sigma', x: 200, y: 80, text: 'σ', color: colorSchemes.probability.primary },
      { id: 'fraction', x: 200, y: 100, text: '—', color: 'white' },
      { id: 'sqrt', x: 170, y: 120, text: '√', color: colorSchemes.descriptive.primary },
      { id: 'n', x: 200, y: 120, text: 'n', color: colorSchemes.descriptive.primary }
    ];

    const g = svg.append("g");

    // Draw formula components with animation
    components.forEach((comp, i) => {
      const elem = g.append("text")
        .attr("x", comp.x)
        .attr("y", comp.y)
        .attr("font-size", comp.id === 'sigma' ? "24px" : "20px")
        .attr("font-weight", "bold")
        .attr("fill", comp.color)
        .attr("text-anchor", "middle")
        .text(comp.text)
        .attr("opacity", 0);

      elem.transition()
        .delay(i * 200)
        .duration(500)
        .attr("opacity", 1);
    });

    // Add interactive highlights on hover
    if (stage >= 2) {
      // Sigma highlight
      g.append("rect")
        .attr("x", 180)
        .attr("y", 60)
        .attr("width", 40)
        .attr("height", 30)
        .attr("fill", "transparent")
        .attr("cursor", "pointer")
        .on("mouseenter", function() {
          d3.select(this).attr("fill", colorSchemes.probability.primary)
            .attr("opacity", 0.2);
          showTooltip("Population standard deviation", 200, 50);
        })
        .on("mouseleave", function() {
          d3.select(this).attr("fill", "transparent");
          hideTooltip();
        });

      // n highlight
      g.append("rect")
        .attr("x", 180)
        .attr("y", 105)
        .attr("width", 40)
        .attr("height", 30)
        .attr("fill", "transparent")
        .attr("cursor", "pointer")
        .on("mouseenter", function() {
          d3.select(this).attr("fill", colorSchemes.descriptive.primary)
            .attr("opacity", 0.2);
          showTooltip("Sample size", 200, 140);
        })
        .on("mouseleave", function() {
          d3.select(this).attr("fill", "transparent");
          hideTooltip();
        });
    }

    // Tooltip functions
    const tooltip = g.append("g").attr("id", "tooltip").style("display", "none");
    
    function showTooltip(text, x, y) {
      tooltip.style("display", null);
      tooltip.selectAll("*").remove();
      
      const rect = tooltip.append("rect")
        .attr("x", x - 5)
        .attr("y", y - 20)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("fill", "rgba(0,0,0,0.8)")
        .attr("stroke", "white")
        .attr("stroke-width", 1);
      
      const label = tooltip.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("fill", "white")
        .attr("font-size", "12px")
        .text(text);
      
      const bbox = label.node().getBBox();
      rect.attr("width", bbox.width + 10)
        .attr("height", bbox.height + 10)
        .attr("x", bbox.x - 5)
        .attr("y", bbox.y - 5);
    }
    
    function hideTooltip() {
      tooltip.style("display", "none");
    }

    // Add calculated values
    if (stage >= 3) {
      g.append("text")
        .attr("x", 350)
        .attr("y", 100)
        .attr("font-size", "20px")
        .attr("fill", colorSchemes.inference.secondary)
        .attr("text-anchor", "middle")
        .text(`= ${standardError.toFixed(2)}`)
        .attr("opacity", 0)
        .transition()
        .delay(1000)
        .duration(500)
        .attr("opacity", 1);
    }
  }, [stage, populationSigma, sampleSize, standardError]);

  // Visualize sampling distributions for different n
  useEffect(() => {
    if (!visualizationRef.current || stage < 2) return;

    const svg = d3.select(visualizationRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    const xMin = 100 - 4 * populationSigma;
    const xMax = 100 + 4 * populationSigma;
    const x = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, width]);

    // Y scale
    const y = d3.scaleLinear()
      .domain([0, 0.15])
      .range([height, 0]);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .call(d3.axisLeft(y).ticks(5));

    // Draw normal curves for different sample sizes
    const sampleSizes = [1, sampleSize];
    const colors = [colorSchemes.probability.secondary, colorSchemes.inference.primary];

    sampleSizes.forEach((n, i) => {
      const se = populationSigma / Math.sqrt(n);
      
      const normalCurve = d3.range(xMin, xMax, 0.5).map(x => ({
        x: x,
        y: (1 / (se * Math.sqrt(2 * Math.PI))) * 
           Math.exp(-0.5 * Math.pow((x - 100) / se, 2))
      }));

      const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y))
        .curve(d3.curveBasis);

      const path = g.append("path")
        .datum(normalCurve)
        .attr("fill", "none")
        .attr("stroke", colors[i])
        .attr("stroke-width", 3)
        .attr("d", line)
        .attr("opacity", 0);

      path.transition()
        .delay(i * 500)
        .duration(1000)
        .attr("opacity", 0.8);

      // Add label
      g.append("text")
        .attr("x", width - 100)
        .attr("y", 20 + i * 20)
        .attr("font-size", "12px")
        .attr("fill", colors[i])
        .text(`n = ${n}, SE = ${se.toFixed(2)}`)
        .attr("opacity", 0)
        .transition()
        .delay(i * 500 + 500)
        .duration(500)
        .attr("opacity", 1);
    });

    // Add vertical line at mean
    g.append("line")
      .attr("x1", x(100))
      .attr("x2", x(100))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.5);
  }, [stage, populationSigma, sampleSize]);

  // Precision calculator visualization
  useEffect(() => {
    if (!precisionRef.current || stage < 4) return;

    const svg = d3.select(precisionRef.current);
    svg.selectAll("*").remove();

    const width = 500;
    const height = 200;

    const g = svg.append("g");

    // Draw confidence interval visualization
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 100;

    // Draw scale
    const scaleG = g.append("g")
      .attr("transform", `translate(0, ${centerY})`);

    // Main line
    scaleG.append("line")
      .attr("x1", 50)
      .attr("x2", width - 50)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Tick marks
    const ticks = [-3, -2, -1, 0, 1, 2, 3];
    ticks.forEach(tick => {
      const x = centerX + tick * scale;
      scaleG.append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", -5)
        .attr("y2", 5)
        .attr("stroke", "white")
        .attr("stroke-width", 1);
      
      scaleG.append("text")
        .attr("x", x)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "white")
        .text(100 + tick * targetPrecision);
    });

    // Draw confidence interval
    const intervalG = g.append("g")
      .attr("transform", `translate(0, ${centerY})`);

    const margin = 1.96 * standardError * scale / targetPrecision;

    intervalG.append("rect")
      .attr("x", centerX - margin)
      .attr("y", -30)
      .attr("width", 2 * margin)
      .attr("height", 60)
      .attr("fill", colorSchemes.inference.primary)
      .attr("opacity", 0.3)
      .attr("stroke", colorSchemes.inference.primary)
      .attr("stroke-width", 2);

    // Add labels
    intervalG.append("text")
      .attr("x", centerX)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", colorSchemes.inference.primary)
      .text(`95% CI: ±${(1.96 * standardError).toFixed(2)}`);

    // Add center point
    intervalG.append("circle")
      .attr("cx", centerX)
      .attr("cy", 0)
      .attr("r", 5)
      .attr("fill", "white");
  }, [stage, standardError, targetPrecision]);

  // Cost-benefit comparison
  useEffect(() => {
    if (!comparisonRef.current || stage < 5) return;

    const svg = d3.select(comparisonRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Data for visualization
    const sampleSizes = d3.range(10, 500, 10);
    const data = sampleSizes.map(n => ({
      n: n,
      se: populationSigma / Math.sqrt(n),
      cost: n * costPerSample
    }));

    // Scales
    const x = d3.scaleLinear()
      .domain([0, 500])
      .range([0, width]);

    const ySE = d3.scaleLinear()
      .domain([0, populationSigma])
      .range([height, 0]);

    const yCost = d3.scaleLinear()
      .domain([0, 5000])
      .range([height, 0]);

    // SE line
    const seLine = d3.line()
      .x(d => x(d.n))
      .y(d => ySE(d.se))
      .curve(d3.curveBasis);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", colorSchemes.inference.primary)
      .attr("stroke-width", 3)
      .attr("d", seLine);

    // Cost line (if enabled)
    if (showCostAnalysis) {
      const costLine = d3.line()
        .x(d => x(d.n))
        .y(d => yCost(d.cost))
        .curve(d3.curveBasis);

      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colorSchemes.probability.secondary)
        .attr("stroke-width", 3)
        .attr("d", costLine);
    }

    // Current position marker
    g.append("circle")
      .attr("cx", x(sampleSize))
      .attr("cy", ySE(standardError))
      .attr("r", 6)
      .attr("fill", "white")
      .attr("stroke", colorSchemes.inference.primary)
      .attr("stroke-width", 2);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .text("Sample Size (n)");

    g.append("g")
      .call(d3.axisLeft(ySE))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", colorSchemes.inference.primary)
      .attr("text-anchor", "middle")
      .text("Standard Error");

    if (showCostAnalysis) {
      g.append("g")
        .attr("transform", `translate(${width}, 0)`)
        .call(d3.axisRight(yCost))
        .append("text")
        .attr("transform", "rotate(90)")
        .attr("y", -40)
        .attr("x", height / 2)
        .attr("fill", colorSchemes.probability.secondary)
        .attr("text-anchor", "middle")
        .text("Cost ($)");
    }
  }, [stage, populationSigma, sampleSize, standardError, costPerSample, showCostAnalysis]);

  const mathJaxRef = useRef(null);
  useSafeMathJax(mathJaxRef, [stage]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Mastering Standard Error</h2>
        
        {/* Stage-based content */}
        <div className="space-y-6">
          {stage >= 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Calculator className="w-8 h-8 text-emerald-400" />
                <h3 className="text-lg font-semibold">Stage 1: The Formula Breakdown</h3>
              </div>
              
              <p className="text-gray-300">
                The standard error (SE) tells us how much sample means vary. Let's break down 
                this powerful formula piece by piece:
              </p>

              <GraphContainer height="200px">
                <svg ref={formulaRef} className="w-full h-full" />
              </GraphContainer>

              <div className="bg-gray-700/50 rounded-lg p-4 mt-4" ref={mathJaxRef}>
                <p className="text-sm text-gray-300">
                  The formula {`\\(SE = \\frac{\\sigma}{\\sqrt{n}}\\)`} shows that:
                </p>
                <ul className="text-sm text-gray-400 mt-2 space-y-1">
                  <li>• Larger population spread (σ) → Larger SE</li>
                  <li>• Larger sample size (n) → Smaller SE</li>
                  <li>• The √n in the denominator is why we need 4× the data for 2× precision</li>
                </ul>
              </div>
            </div>
          )}

          {stage >= 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Stage 2: Visualizing the Effect</h3>
              
              <p className="text-gray-300">
                Adjust the parameters to see how population variability and sample size 
                affect the standard error:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">
                    Population Standard Deviation (σ): {populationSigma}
                  </label>
                  <RangeSlider
                    value={[populationSigma]}
                    onValueChange={(value) => setPopulationSigma(value[0])}
                    min={5}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">
                    Sample Size (n): {sampleSize}
                  </label>
                  <RangeSlider
                    value={[sampleSize]}
                    onValueChange={(value) => setSampleSize(value[0])}
                    min={5}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              <GraphContainer height="350px">
                <svg ref={visualizationRef} className="w-full h-full" />
              </GraphContainer>

              <div className="bg-emerald-900/20 border border-emerald-600/30 rounded-lg p-4">
                <p className="text-sm text-emerald-300">
                  <strong className="text-emerald-400">Current SE = {standardError.toFixed(3)}</strong>
                  <br />
                  With σ = {populationSigma} and n = {sampleSize}, sample means will typically 
                  fall within ±{(2 * standardError).toFixed(2)} of the true mean (95% of the time).
                </p>
              </div>
            </div>
          )}

          {stage >= 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Stage 3: The Power of Sample Size</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{sampleSize}</div>
                  <div className="text-sm text-gray-400">Current n</div>
                  <div className="text-lg mt-2">SE = {standardError.toFixed(3)}</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{sampleSize * 4}</div>
                  <div className="text-sm text-gray-400">4× samples</div>
                  <div className="text-lg mt-2">SE = {(standardError / 2).toFixed(3)}</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{sampleSize * 9}</div>
                  <div className="text-sm text-gray-400">9× samples</div>
                  <div className="text-lg mt-2">SE = {(standardError / 3).toFixed(3)}</div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  <strong className="text-blue-400">💡 Key Insight:</strong> To cut the standard 
                  error in half, you need 4 times as many samples. To cut it to one-third, 
                  you need 9 times as many. This is the square root law of precision!
                </p>
              </div>
            </div>
          )}

          {stage >= 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-yellow-400" />
                <h3 className="text-lg font-semibold">Stage 4: Precision Calculator</h3>
              </div>
              
              <p className="text-gray-300">
                How many samples do you need to achieve your desired precision? 
                Set your target and find out:
              </p>

              <div className="mb-4">
                <label className="text-sm text-gray-400 block mb-2">
                  Desired Margin of Error: ±{targetPrecision}
                </label>
                <RangeSlider
                  value={[targetPrecision]}
                  onValueChange={(value) => setTargetPrecision(value[0])}
                  min={0.5}
                  max={10}
                  step={0.5}
                  className="w-64"
                />
              </div>

              <GraphContainer height="200px">
                <svg ref={precisionRef} className="w-full h-full" />
              </GraphContainer>

              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <p className="text-sm text-yellow-300">
                  <strong className="text-yellow-400">Required Sample Size:</strong> n = {requiredSampleSize}
                  <br />
                  To achieve a margin of error of ±{targetPrecision} with σ = {populationSigma}, 
                  you need at least {requiredSampleSize} samples.
                </p>
              </div>
            </div>
          )}

          {stage >= 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-8 h-8 text-rose-400" />
                <h3 className="text-lg font-semibold">Stage 5: Cost vs. Precision Trade-off</h3>
              </div>
              
              <p className="text-gray-300">
                In the real world, each sample costs money. Let's explore the trade-off 
                between precision and cost:
              </p>

              <div className="flex items-center gap-4 mb-4">
                <Button
                  onClick={() => setShowCostAnalysis(!showCostAnalysis)}
                  variant={showCostAnalysis ? "default" : "outline"}
                  size="sm"
                >
                  {showCostAnalysis ? "Hide" : "Show"} Cost Analysis
                </Button>
                {showCostAnalysis && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">Cost per sample: $</label>
                    <input
                      type="number"
                      value={costPerSample}
                      onChange={(e) => setCostPerSample(Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-gray-700 rounded text-white"
                    />
                  </div>
                )}
              </div>

              <GraphContainer height="350px">
                <svg ref={comparisonRef} className="w-full h-full" />
              </GraphContainer>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-600/30">
                  <h4 className="font-semibold text-blue-400 mb-2">
                    <AlertCircle className="inline w-4 h-4 mr-1" />
                    Diminishing Returns
                  </h4>
                  <p className="text-sm text-gray-300">
                    The first samples give the biggest reduction in SE. After a 
                    certain point, adding more samples gives minimal improvement.
                  </p>
                </div>
                
                {showCostAnalysis && (
                  <div className="bg-gradient-to-br from-rose-900/20 to-orange-900/20 rounded-lg p-4 border border-rose-600/30">
                    <h4 className="font-semibold text-rose-400 mb-2">
                      <DollarSign className="inline w-4 h-4 mr-1" />
                      Current Analysis
                    </h4>
                    <p className="text-sm text-gray-300">
                      n = {sampleSize}: Total cost = ${totalCost}
                      <br />
                      SE = {standardError.toFixed(3)}
                      <br />
                      Cost per unit of precision: ${(totalCost / (1/standardError)).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-300">
                  <strong className="text-gray-200">Real-World Applications:</strong>
                </p>
                <ul className="text-sm text-gray-400 mt-2 space-y-1">
                  <li>• <strong>Polling:</strong> Why political polls typically use n ≈ 1000</li>
                  <li>• <strong>A/B Testing:</strong> Balancing test duration with confidence</li>
                  <li>• <strong>Quality Control:</strong> Sampling enough products without waste</li>
                  <li>• <strong>Medical Trials:</strong> Ensuring safety while minimizing costs</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-gray-400">
            Stage {stage} of 5
          </div>
          <div className="flex gap-4">
            {stage > 1 && (
              <Button 
                onClick={() => setStage(stage - 1)}
                variant="outline"
              >
                Previous
              </Button>
            )}
            {stage < 5 && (
              <Button 
                onClick={() => setStage(stage + 1)}
              >
                Next Stage
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardErrorExplorer;