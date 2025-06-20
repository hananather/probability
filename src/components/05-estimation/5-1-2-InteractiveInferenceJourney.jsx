'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';
import { 
  VisualizationContainer, 
  VisualizationSection,
  ControlPanel,
  ControlGroup,
  GraphContainer
} from '@/components/ui/VisualizationContainer';
import { RangeSlider, SliderPresets } from '@/components/ui/RangeSlider';
import { cn } from '@/lib/utils';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

// Estimation color theme with beautiful gradients
const estimationTheme = {
  colors: {
    population: '#8b5cf6',    // Purple for true values
    sample: '#f97316',        // Orange for estimates
    variation: '#ec4899',     // Pink for uncertainty
    background: '#1f2937',
    grid: '#374151',
    text: '#ffffff',
    textSecondary: '#9ca3af'
  },
  gradients: {
    primary: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
    secondary: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    highlight: 'linear-gradient(135deg, #f97316 0%, #8b5cf6 100%)',
    population: 'radial-gradient(circle at 30% 30%, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
    sample: 'radial-gradient(circle at 70% 30%, #fdba74 0%, #f97316 50%, #ea580c 100%)'
  },
  shadows: {
    glow: '0 0 40px rgba(249, 115, 22, 0.3)',
    depth: '0 10px 30px rgba(0, 0, 0, 0.3)',
    inner: 'inset 0 2px 10px rgba(0, 0, 0, 0.2)'
  }
};

// Button styles with gradients
const buttonStyles = {
  sample: cn(
    "px-6 py-3 rounded-lg font-medium transition-all duration-300 transform",
    "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600",
    "text-white shadow-lg hover:shadow-xl hover:scale-[1.02]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
  ),
  play: cn(
    "px-4 py-2 rounded-lg font-medium transition-all duration-300",
    "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
    "text-white shadow-md hover:shadow-lg"
  ),
  reset: cn(
    "px-4 py-2 rounded-lg font-medium transition-all duration-300",
    "bg-neutral-700 hover:bg-neutral-600 text-white shadow-md"
  )
};

export default function InteractiveInferenceJourney() {
  // Population parameters
  const [populationMean, setPopulationMean] = useState(100);
  const [populationSD, setPopulationSD] = useState(15);
  const [sampleSize, setSampleSize] = useState(30);
  
  // Animation and sampling state
  const [samples, setSamples] = useState([]);
  const [currentSample, setCurrentSample] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isContinuousSampling, setIsContinuousSampling] = useState(false);
  const [particles, setParticles] = useState([]);
  
  // Tutorial state
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showInsight, setShowInsight] = useState(false);
  
  // D3 refs
  const mainSvgRef = useRef(null);
  const samplingDistRef = useRef(null);
  const animationRef = useRef(null);
  const scalesRef = useRef({});
  
  // Calculate statistics
  const statistics = useMemo(() => {
    if (samples.length === 0) return null;
    
    const sampleMeans = samples.map(s => s.mean);
    const mean = d3.mean(sampleMeans);
    const sd = d3.deviation(sampleMeans);
    const se = populationSD / Math.sqrt(sampleSize);
    
    return {
      meanOfMeans: mean,
      sdOfMeans: sd,
      theoreticalSE: se,
      empiricalSE: sd,
      samples: samples.length
    };
  }, [samples, populationSD, sampleSize]);
  
  // Initialize main visualization
  useEffect(() => {
    const svg = d3.select(mainSvgRef.current);
    svg.selectAll("*").remove();
    
    const width = mainSvgRef.current.clientWidth;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create gradients
    const defs = svg.append("defs");
    
    // Population gradient
    const popGradient = defs.append("radialGradient")
      .attr("id", "population-gradient")
      .attr("cx", "30%")
      .attr("cy", "30%");
    popGradient.append("stop").attr("offset", "0%").attr("stop-color", "#a78bfa");
    popGradient.append("stop").attr("offset", "50%").attr("stop-color", "#8b5cf6");
    popGradient.append("stop").attr("offset", "100%").attr("stop-color", "#7c3aed");
    
    // Sample gradient
    const sampleGradient = defs.append("radialGradient")
      .attr("id", "sample-gradient")
      .attr("cx", "70%")
      .attr("cy", "30%");
    sampleGradient.append("stop").attr("offset", "0%").attr("stop-color", "#fdba74");
    sampleGradient.append("stop").attr("offset", "50%").attr("stop-color", "#f97316");
    sampleGradient.append("stop").attr("offset", "100%").attr("stop-color", "#ea580c");
    
    // Glow filter
    const filter = defs.append("filter")
      .attr("id", "glow");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Population circle
    const populationGroup = g.append("g")
      .attr("class", "population-group")
      .attr("transform", `translate(${innerWidth * 0.25}, ${innerHeight * 0.5})`);
    
    populationGroup.append("circle")
      .attr("class", "population-circle")
      .attr("r", 80)
      .attr("fill", "url(#population-gradient)")
      .attr("stroke", estimationTheme.colors.population)
      .attr("stroke-width", 2)
      .style("filter", "url(#glow)")
      .style("cursor", "pointer");
    
    populationGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -100)
      .attr("fill", estimationTheme.colors.text)
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Population");
    
    populationGroup.append("text")
      .attr("class", "population-params")
      .attr("text-anchor", "middle")
      .attr("y", 5)
      .attr("fill", estimationTheme.colors.text)
      .style("font-size", "14px");
    
    // Sample area
    const sampleGroup = g.append("g")
      .attr("class", "sample-group")
      .attr("transform", `translate(${innerWidth * 0.75}, ${innerHeight * 0.5})`);
    
    sampleGroup.append("rect")
      .attr("class", "sample-area")
      .attr("x", -60)
      .attr("y", -60)
      .attr("width", 120)
      .attr("height", 120)
      .attr("rx", 10)
      .attr("fill", "none")
      .attr("stroke", estimationTheme.colors.sample)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .style("opacity", 0.5);
    
    sampleGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -80)
      .attr("fill", estimationTheme.colors.text)
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Sample");
    
    // Arrow from population to sample
    const arrow = g.append("g")
      .attr("class", "arrow-group");
    
    arrow.append("path")
      .attr("class", "arrow-path")
      .attr("d", `M${innerWidth * 0.25 + 90},${innerHeight * 0.5} L${innerWidth * 0.75 - 70},${innerHeight * 0.5}`)
      .attr("fill", "none")
      .attr("stroke", estimationTheme.colors.variation)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)")
      .style("opacity", 0.5);
    
    // Arrowhead marker
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("refX", 6)
      .attr("refY", 3)
      .attr("markerWidth", 10)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 6 3 L 0 6 z")
      .attr("fill", estimationTheme.colors.variation);
    
    // Particle container
    g.append("g").attr("class", "particles");
    
    // Store refs
    scalesRef.current = {
      width: innerWidth,
      height: innerHeight,
      g: g
    };
    
  }, []);
  
  // Update population display
  useEffect(() => {
    const svg = d3.select(mainSvgRef.current);
    svg.select(".population-params")
      .text(`μ = ${populationMean}, σ = ${populationSD}`);
  }, [populationMean, populationSD]);
  
  // Initialize sampling distribution
  useEffect(() => {
    const svg = d3.select(samplingDistRef.current);
    svg.selectAll("*").remove();
    
    const width = samplingDistRef.current.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xExtent = [populationMean - 4 * populationSD / Math.sqrt(sampleSize), 
                     populationMean + 4 * populationSD / Math.sqrt(sampleSize)];
    
    const x = d3.scaleLinear()
      .domain(xExtent)
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, 0.5])
      .range([innerHeight, 0]);
    
    // Grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(-innerHeight).tickFormat(""))
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.3);
    
    // Axes
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(6))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", estimationTheme.colors.text)
      .style("text-anchor", "middle")
      .text("Sample Mean");
    
    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).ticks(5))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("x", -innerHeight / 2)
      .attr("fill", estimationTheme.colors.text)
      .style("text-anchor", "middle")
      .text("Density");
    
    // Theoretical distribution line
    const se = populationSD / Math.sqrt(sampleSize);
    const normalData = d3.range(xExtent[0], xExtent[1], (xExtent[1] - xExtent[0]) / 100)
      .map(x => ({
        x: x,
        y: (1 / (se * Math.sqrt(2 * Math.PI))) * 
           Math.exp(-0.5 * Math.pow((x - populationMean) / se, 2))
      }));
    
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    g.append("path")
      .attr("class", "theoretical-line")
      .datum(normalData)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", estimationTheme.colors.population)
      .attr("stroke-width", 2)
      .style("opacity", 0.6);
    
    // Histogram group
    g.append("g").attr("class", "histogram");
    
    // Store scales
    scalesRef.current.samplingDist = { x, y, innerWidth, innerHeight, g };
    
  }, [populationMean, populationSD, sampleSize]);
  
  // Update sampling distribution
  useEffect(() => {
    if (!scalesRef.current.samplingDist || samples.length === 0) return;
    
    const { x, y, innerWidth, innerHeight, g } = scalesRef.current.samplingDist;
    
    // Create histogram
    const sampleMeans = samples.map(s => s.mean);
    const histogram = d3.histogram()
      .domain(x.domain())
      .thresholds(20);
    
    const bins = histogram(sampleMeans);
    const maxCount = d3.max(bins, d => d.length);
    
    y.domain([0, maxCount / (samples.length * (bins[0].x1 - bins[0].x0))]);
    
    // Update y-axis
    g.select(".y-axis")
      .transition()
      .duration(300)
      .call(d3.axisLeft(y).ticks(5));
    
    // Update histogram
    const bars = g.select(".histogram")
      .selectAll(".bar")
      .data(bins);
    
    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.x0))
      .attr("width", d => x(d.x1) - x(d.x0) - 1)
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("fill", estimationTheme.colors.sample)
      .style("opacity", 0.7)
      .merge(bars)
      .transition()
      .duration(300)
      .attr("y", d => y(d.length / (samples.length * (d.x1 - d.x0))))
      .attr("height", d => innerHeight - y(d.length / (samples.length * (d.x1 - d.x0))));
    
    bars.exit().remove();
    
  }, [samples, populationMean, populationSD, sampleSize]);
  
  // Particle animation for sampling
  const animateParticles = useCallback((sampleData) => {
    const { g, width, height } = scalesRef.current;
    const particleGroup = g.select(".particles");
    
    const particles = sampleData.map((value, i) => ({
      id: `particle-${Date.now()}-${i}`,
      value: value,
      startX: width * 0.25 + (Math.random() - 0.5) * 80,
      startY: height * 0.5 + (Math.random() - 0.5) * 80,
      endX: width * 0.75 + (Math.random() - 0.5) * 100,
      endY: height * 0.5 + (Math.random() - 0.5) * 100
    }));
    
    const particleElements = particleGroup.selectAll(".particle")
      .data(particles, d => d.id);
    
    particleElements.enter()
      .append("circle")
      .attr("class", "particle")
      .attr("r", 3)
      .attr("cx", d => d.startX)
      .attr("cy", d => d.startY)
      .attr("fill", estimationTheme.colors.sample)
      .style("opacity", 0.8)
      .transition()
      .duration(1000)
      .ease(d3.easeCubicInOut)
      .attr("cx", d => d.endX)
      .attr("cy", d => d.endY)
      .transition()
      .duration(300)
      .style("opacity", 0)
      .remove();
    
  }, []);
  
  // Take a sample
  const takeSample = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Generate sample data
    const sampleData = Array.from({ length: sampleSize }, () => 
      d3.randomNormal(populationMean, populationSD)()
    );
    
    const sampleMean = d3.mean(sampleData);
    const sampleSD = d3.deviation(sampleData);
    
    const newSample = {
      id: Date.now(),
      data: sampleData,
      mean: sampleMean,
      sd: sampleSD
    };
    
    // Animate particles
    animateParticles(sampleData.slice(0, Math.min(20, sampleSize)));
    
    // Update current sample display
    setCurrentSample(newSample);
    
    // Add to samples after animation
    setTimeout(() => {
      setSamples(prev => [...prev, newSample]);
      setIsAnimating(false);
      
      // Show insight after certain milestones
      if (samples.length === 9) {
        setShowInsight('clt');
        setTimeout(() => setShowInsight(false), 5000);
      }
    }, 1200);
    
  }, [isAnimating, sampleSize, populationMean, populationSD, samples.length, animateParticles]);
  
  // Continuous sampling
  useEffect(() => {
    if (isContinuousSampling && !isAnimating) {
      const timeout = setTimeout(takeSample, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isContinuousSampling, isAnimating, takeSample]);
  
  // Reset
  const handleReset = useCallback(() => {
    setSamples([]);
    setCurrentSample(null);
    setIsContinuousSampling(false);
    setIsAnimating(false);
    setShowInsight(false);
  }, []);
  
  return (
    <VisualizationContainer
      title="Interactive Statistical Inference Journey"
      description="Explore how samples from a population create a sampling distribution"
      className="bg-neutral-900"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main visualization */}
        <div className="lg:col-span-2 space-y-4">
          <VisualizationSection 
            title="Population → Sample → Statistic"
            className="bg-neutral-800"
          >
            <GraphContainer height="400px">
              <svg ref={mainSvgRef} className="w-full h-full" />
            </GraphContainer>
            
            {currentSample && (
              <div className="mt-4 p-4 bg-gradient-to-r from-orange-900/20 to-pink-900/20 rounded-lg border border-orange-500/30">
                <h4 className="text-sm font-medium text-orange-400 mb-2">Current Sample</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-400">Size:</span>
                    <span className="ml-2 font-mono text-white">{sampleSize}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Mean:</span>
                    <span className="ml-2 font-mono text-orange-400">
                      {currentSample.mean.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400">SD:</span>
                    <span className="ml-2 font-mono text-pink-400">
                      {currentSample.sd.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </VisualizationSection>
          
          <VisualizationSection 
            title="Sampling Distribution of X̄"
            className="bg-neutral-800"
          >
            <GraphContainer height="300px">
              <svg ref={samplingDistRef} className="w-full h-full" />
            </GraphContainer>
            
            {statistics && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/30">
                <h4 className="text-sm font-medium text-purple-400 mb-2">Sampling Statistics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-400">Mean of sample means:</span>
                    <span className="ml-2 font-mono text-purple-400">
                      {statistics.meanOfMeans.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400">SD of sample means:</span>
                    <span className="ml-2 font-mono text-pink-400">
                      {statistics.sdOfMeans.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Theoretical SE:</span>
                    <span className="ml-2 font-mono text-purple-400">
                      {statistics.theoreticalSE.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Total samples:</span>
                    <span className="ml-2 font-mono text-white">
                      {statistics.samples}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </VisualizationSection>
        </div>
        
        {/* Controls */}
        <div className="space-y-4">
          <ControlPanel className="bg-neutral-800">
            <h3 className="text-lg font-semibold text-white mb-4">Population Parameters</h3>
            
            <ControlGroup label="Population Mean (μ)">
              <RangeSlider
                value={populationMean}
                onChange={setPopulationMean}
                min={50}
                max={150}
                step={5}
                gradient="from-purple-500 to-pink-500"
              />
            </ControlGroup>
            
            <ControlGroup label="Population SD (σ)">
              <RangeSlider
                value={populationSD}
                onChange={setPopulationSD}
                min={5}
                max={30}
                step={1}
                gradient="from-purple-500 to-pink-500"
              />
            </ControlGroup>
            
            <ControlGroup label="Sample Size (n)">
              <RangeSlider
                value={sampleSize}
                onChange={setSampleSize}
                min={5}
                max={100}
                step={5}
                gradient="from-orange-500 to-pink-500"
              />
            </ControlGroup>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={takeSample}
                disabled={isAnimating || isContinuousSampling}
                className={buttonStyles.sample}
              >
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Take One Sample
              </button>
              
              <button
                onClick={() => setIsContinuousSampling(!isContinuousSampling)}
                disabled={isAnimating}
                className={buttonStyles.play}
              >
                {isContinuousSampling ? (
                  <>
                    <Pause className="w-4 h-4 mr-2 inline" />
                    Pause Sampling
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2 inline" />
                    Continuous Sampling
                  </>
                )}
              </button>
              
              <button
                onClick={handleReset}
                disabled={isAnimating}
                className={buttonStyles.reset}
              >
                <RotateCcw className="w-4 h-4 mr-2 inline" />
                Reset
              </button>
            </div>
          </ControlPanel>
          
          {/* Insights */}
          <div className="bg-gradient-to-br from-orange-900/20 to-purple-900/20 rounded-lg p-4 border border-orange-500/30">
            <h3 className="text-lg font-semibold text-orange-400 mb-3">Key Insights</h3>
            <div className="space-y-3 text-sm text-neutral-300">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                <p>The <span className="text-orange-400 font-medium">sampling distribution</span> shows where sample means tend to fall</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                <p>The <span className="text-purple-400 font-medium">standard error</span> (SE = σ/√n) measures the typical distance between x̄ and μ</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5 flex-shrink-0" />
                <p>Larger samples (higher n) lead to <span className="text-pink-400 font-medium">more precise estimates</span> with smaller SE</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating insight */}
      {showInsight === 'clt' && (
        <div className="fixed bottom-8 right-8 max-w-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-2xl p-6 animate-slideIn">
          <h4 className="text-lg font-bold mb-2">🎉 Central Limit Theorem in Action!</h4>
          <p className="text-sm">
            Notice how the sample means are forming a normal distribution centered at μ, 
            even if the population isn't normal. This is the magic of the CLT!
          </p>
        </div>
      )}
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </VisualizationContainer>
  );
}