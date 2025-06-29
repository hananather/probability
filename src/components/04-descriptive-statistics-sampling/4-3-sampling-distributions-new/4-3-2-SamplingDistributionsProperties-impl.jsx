"use client";
import { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup,
  StatsDisplay
} from '@/components/ui/VisualizationContainer';
import { RangeSlider } from "@/components/ui/RangeSlider";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, TrendingDown, Activity, Zap } from "lucide-react";

export default function SamplingDistributionsProperties() {
  // Sample sizes for comparison
  const [sampleSize1, setSampleSize1] = useState(5);
  const [sampleSize2, setSampleSize2] = useState(30);
  const [populationMean] = useState(50);
  const [populationSD] = useState(15);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const svgRef1 = useRef(null);
  const svgRef2 = useRef(null);
  const animationRef = useRef(null);

  // Calculate standard errors
  const se1 = populationSD / Math.sqrt(sampleSize1);
  const se2 = populationSD / Math.sqrt(sampleSize2);

  // Generate sampling distribution data
  const generateSamplingData = (n, numSamples = 1000) => {
    const means = [];
    for (let i = 0; i < numSamples; i++) {
      let sum = 0;
      // Generate sample from normal distribution
      for (let j = 0; j < n; j++) {
        sum += jStat.normal.sample(populationMean, populationSD);
      }
      means.push(sum / n);
    }
    return means;
  };

  // Visualization effect
  useEffect(() => {
    if (!svgRef1.current || !svgRef2.current) return;

    const drawDistribution = (svgElement, sampleSize, sampleData, color) => {
      const svg = d3.select(svgElement);
      const { width } = svgElement.getBoundingClientRect();
      const height = 300;
      const margin = { top: 20, right: 30, bottom: 50, left: 50 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      svg.selectAll("*").remove();
      svg.attr("viewBox", `0 0 ${width} ${height}`);

      // Dark background
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#0a0a0a");

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Calculate histogram
      const extent = [populationMean - 4 * populationSD, populationMean + 4 * populationSD];
      const x = d3.scaleLinear()
        .domain(extent)
        .range([0, innerWidth]);

      const histogram = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(30));

      const bins = histogram(sampleData);
      
      const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([innerHeight, 0]);

      // Grid lines
      g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat("")
        )
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3)
        .selectAll("line")
        .style("stroke", "#404040");

      // X axis
      const xAxis = g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(8));

      xAxis.selectAll("path, line").attr("stroke", "#666");
      xAxis.selectAll("text")
        .attr("fill", "#ccc")
        .style("font-size", "11px");

      // Histogram bars
      g.selectAll(".bar")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.x0) + 1)
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 2))
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("fill", color)
        .attr("opacity", 0.7)
        .transition()
        .duration(800)
        .delay((d, i) => i * 10)
        .attr("y", d => y(d.length))
        .attr("height", d => innerHeight - y(d.length));

      // Normal curve overlay
      const se = populationSD / Math.sqrt(sampleSize);
      const normalData = d3.range(extent[0], extent[1], 1).map(x => ({
        x: x,
        y: jStat.normal.pdf(x, populationMean, se) * sampleData.length * (extent[1] - extent[0]) / 30
      }));

      const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y))
        .curve(d3.curveBasis);

      // Animated normal curve
      const path = g.append("path")
        .datum(normalData)
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .attr("d", line);

      const totalLength = path.node().getTotalLength();
      
      path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .delay(1000)
        .duration(1500)
        .attr("opacity", 1)
        .attr("stroke-dashoffset", 0);

      // Mean line
      g.append("line")
        .attr("x1", x(populationMean))
        .attr("x2", x(populationMean))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#ff0")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0)
        .transition()
        .delay(1500)
        .duration(500)
        .attr("opacity", 0.8);

      // Standard error visualization
      const seLeft = populationMean - se;
      const seRight = populationMean + se;
      
      g.append("rect")
        .attr("x", x(seLeft))
        .attr("width", x(seRight) - x(seLeft))
        .attr("y", 0)
        .attr("height", innerHeight)
        .attr("fill", color)
        .attr("opacity", 0)
        .transition()
        .delay(2000)
        .duration(500)
        .attr("opacity", 0.1);

      // Labels
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(`n = ${sampleSize}`);

      g.append("text")
        .attr("x", x(populationMean))
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("fill", "#ff0")
        .style("font-size", "12px")
        .attr("opacity", 0)
        .transition()
        .delay(1500)
        .duration(500)
        .attr("opacity", 1)
        .text(`μ = ${populationMean}`);
    };

    // Generate data and draw
    const data1 = generateSamplingData(sampleSize1);
    const data2 = generateSamplingData(sampleSize2);
    
    drawDistribution(svgRef1.current, sampleSize1, data1, "#f59e0b");
    drawDistribution(svgRef2.current, sampleSize2, data2, "#3b82f6");

  }, [sampleSize1, sampleSize2, populationMean, populationSD]);

  // Animation for shape transformation
  const startAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimationProgress(0);

    let progress = 0;
    const animate = () => {
      progress += 2;
      setAnimationProgress(progress);
      
      if (progress < 100) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <VisualizationContainer title="Properties of Sampling Distributions">
      <div className="space-y-6">
        {/* Introduction */}
        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-3">
              How Sample Size Affects the Sampling Distribution
            </h3>
            <p className="text-neutral-300 text-sm leading-relaxed">
              The sampling distribution of the mean has remarkable properties that depend on sample size. 
              As n increases, the distribution becomes more normal and less variable, regardless of the 
              population's shape. This is the foundation of statistical inference.
            </p>
          </CardContent>
        </Card>

        {/* Side-by-side visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <GraphContainer height="300px">
              <svg ref={svgRef1} style={{ width: "100%", height: 300 }} />
            </GraphContainer>
            <VisualizationSection className="bg-neutral-900 p-4 rounded-lg border border-amber-600/30">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Sample Size (n)</span>
                  <span className="text-lg font-mono font-bold text-amber-400">{sampleSize1}</span>
                </div>
                <RangeSlider
                  value={sampleSize1}
                  onChange={setSampleSize1}
                  min={5}
                  max={100}
                  step={5}
                  className="accent-amber-500"
                />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-400">Standard Error:</span>
                    <div className="font-mono text-white mt-1">
                      SE = {populationSD}/√{sampleSize1} = <span className="text-amber-400 font-bold">{se1.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-neutral-400">Shape:</span>
                    <div className="text-white mt-1">
                      {sampleSize1 < 30 ? "Approaching Normal" : "Approximately Normal"}
                    </div>
                  </div>
                </div>
              </div>
            </VisualizationSection>
          </div>

          <div className="space-y-4">
            <GraphContainer height="300px">
              <svg ref={svgRef2} style={{ width: "100%", height: 300 }} />
            </GraphContainer>
            <VisualizationSection className="bg-neutral-900 p-4 rounded-lg border border-blue-600/30">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Sample Size (n)</span>
                  <span className="text-lg font-mono font-bold text-blue-400">{sampleSize2}</span>
                </div>
                <RangeSlider
                  value={sampleSize2}
                  onChange={setSampleSize2}
                  min={5}
                  max={100}
                  step={5}
                  className="accent-blue-500"
                />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-400">Standard Error:</span>
                    <div className="font-mono text-white mt-1">
                      SE = {populationSD}/√{sampleSize2} = <span className="text-blue-400 font-bold">{se2.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-neutral-400">Shape:</span>
                    <div className="text-white mt-1">
                      {sampleSize2 < 30 ? "Approaching Normal" : "Approximately Normal"}
                    </div>
                  </div>
                </div>
              </div>
            </VisualizationSection>
          </div>
        </div>

        {/* Key Properties */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-neutral-900 border-green-600/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-green-400" />
                <h4 className="text-sm font-bold text-green-400">Shape Normalization</h4>
              </div>
              <p className="text-xs text-neutral-300 mb-3">
                As n increases, the sampling distribution becomes increasingly normal, 
                even if the population is skewed.
              </p>
              <div className="p-3 bg-neutral-800 rounded">
                <div className="text-xs font-mono text-neutral-400 mb-1">Rule of Thumb:</div>
                <div className="text-sm font-bold text-white">n ≥ 30 → Normal</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-purple-600/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-bold text-purple-400">Variance Reduction</h4>
              </div>
              <p className="text-xs text-neutral-300 mb-3">
                The spread decreases with the square root of sample size. Larger samples 
                give more precise estimates.
              </p>
              <div className="p-3 bg-neutral-800 rounded">
                <div className="text-xs font-mono text-neutral-400 mb-1">Standard Error:</div>
                <div className="text-sm font-bold text-white">SE = σ/√n</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-blue-600/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-bold text-blue-400">√n Relationship</h4>
              </div>
              <p className="text-xs text-neutral-300 mb-3">
                To cut the standard error in half, you need 4× the sample size. 
                This is the law of diminishing returns.
              </p>
              <div className="p-3 bg-neutral-800 rounded">
                <div className="text-xs font-mono text-neutral-400 mb-1">Example:</div>
                <div className="text-sm font-bold text-white">n: 25→100, SE: ÷2</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Demonstration */}
        <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Interactive Exploration</h3>
            
            <div className="space-y-4">
              <div className="bg-neutral-900/50 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-purple-300 mb-3">
                  Observe the Square Root Effect
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-neutral-300 mb-2">
                      Compare the standard errors:
                    </p>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">n = {sampleSize1}:</span>
                        <span className="text-amber-400 font-bold">SE = {se1.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">n = {sampleSize2}:</span>
                        <span className="text-blue-400 font-bold">SE = {se2.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-neutral-700 pt-2">
                        <span className="text-neutral-400">Ratio:</span>
                        <span className="text-green-400 font-bold">
                          {(se1 / se2).toFixed(2)}× = √({sampleSize2}/{sampleSize1})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-neutral-300 mb-2">
                      Shape transformation progress:
                    </p>
                    <button
                      onClick={startAnimation}
                      className={cn(
                        "w-full px-4 py-2 rounded text-sm font-medium transition-colors mb-3",
                        isAnimating 
                          ? "bg-neutral-600 text-neutral-400 cursor-not-allowed" 
                          : "bg-purple-600 hover:bg-purple-700 text-white"
                      )}
                      disabled={isAnimating}
                    >
                      {isAnimating ? "Animating..." : "Visualize Transformation"}
                    </button>
                    {animationProgress > 0 && (
                      <div className="space-y-2">
                        <div className="w-full bg-neutral-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-amber-500 to-blue-500 h-2 rounded-full transition-all duration-100"
                            style={{ width: `${animationProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-center text-neutral-400">
                          From skewed to normal: {animationProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900/50 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-blue-300 mb-2">Try These Experiments</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex gap-2">
                    <span className="text-blue-400">1.</span>
                    <p className="text-neutral-300">
                      Set both sliders to n=10, then increase one to n=40. Notice how the distribution 
                      becomes narrower and more bell-shaped.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-400">2.</span>
                    <p className="text-neutral-300">
                      Compare n=25 vs n=100. The standard error is exactly half, demonstrating 
                      the √n relationship.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mathematical Foundation */}
        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Mathematical Foundation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-green-400 mb-3">Key Formulas</h4>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-neutral-800 rounded">
                    <div className="text-neutral-400 mb-1">Mean of sampling distribution:</div>
                    <div className="font-mono text-white">μx̄ = μ</div>
                  </div>
                  <div className="p-3 bg-neutral-800 rounded">
                    <div className="text-neutral-400 mb-1">Standard error of the mean:</div>
                    <div className="font-mono text-white">σx̄ = σ/√n</div>
                  </div>
                  <div className="p-3 bg-neutral-800 rounded">
                    <div className="text-neutral-400 mb-1">Distribution shape (CLT):</div>
                    <div className="font-mono text-white">X̄ ~ N(μ, σ²/n)</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-purple-400 mb-3">Practical Implications</h4>
                <div className="space-y-2 text-sm text-neutral-300">
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <p>
                      <span className="font-semibold text-white">Precision:</span> Quadrupling 
                      sample size only doubles precision
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <p>
                      <span className="font-semibold text-white">Normality:</span> CLT works 
                      faster for symmetric populations
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <p>
                      <span className="font-semibold text-white">Cost-Benefit:</span> Balance 
                      precision needs with sampling costs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizationContainer>
  );
}