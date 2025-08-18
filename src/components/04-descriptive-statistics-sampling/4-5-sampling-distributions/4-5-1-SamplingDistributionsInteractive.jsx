"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { variance } from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  GraphContainer, 
  VisualizationSection,
  ControlGroup,
  StatsDisplay
} from "@/components/ui/VisualizationContainer";
import { Button } from "@/components/ui/button";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { colors, cn, typography } from "@/lib/design-system";
import { Chapter4ReferenceSheet } from '../../reference-sheets/Chapter4ReferenceSheet';
import { RefreshCw, Play, Pause, TrendingUp, Users, BarChart3 } from "lucide-react";
import { useAnimationCleanup } from "@/hooks/useAnimationCleanup";

// Dice faces for intuitive values
const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const DICE_VALUES = {
  "⚀": 1,
  "⚁": 2,
  "⚂": 3,
  "⚃": 4,
  "⚄": 5,
  "⚅": 6
};

const SamplingDistributionsInteractive = ({ onComplete }) => {
  // State management
  const [populationSize] = useState(64);
  const [sampleSize, setSampleSize] = useState(4);
  const [samplesCollected, setSamplesCollected] = useState(0);
  const [currentSample, setCurrentSample] = useState([]);
  const [sampleMeans, setSampleMeans] = useState([]);
  const [isAutoSampling, setIsAutoSampling] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [showTheory, setShowTheory] = useState(false);
  const [animatingMean, setAnimatingMean] = useState(false);
  
  // Refs
  const populationRef = useRef(null);
  const histogramRef = useRef(null);
  const autoSampleInterval = useRef(null);
  
  const animationCleanup = useAnimationCleanup();

  // Generate population with mixed dice distribution
  const population = useRef([]);
  useEffect(() => {
    const pop = [];
    // Create a more interesting distribution (not uniform)
    const distribution = [
      { face: "⚀", count: 15 }, // More 1s
      { face: "⚁", count: 12 },
      { face: "⚂", count: 10 },
      { face: "⚃", count: 10 },
      { face: "⚄", count: 12 },
      { face: "⚅", count: 5 }  // Fewer 6s
    ];
    
    let id = 0;
    distribution.forEach(({ face, count }) => {
      for (let i = 0; i < count; i++) {
        pop.push({
          id: id++,
          emoji: face,
          value: DICE_VALUES[face]
        });
      }
    });
    
    // Shuffle the population for random placement
    for (let i = pop.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pop[i], pop[j]] = [pop[j], pop[i]];
    }
    
    population.current = pop;
  }, [populationSize]);

  // Calculate population statistics
  const populationMean = d3.mean(population.current, d => d.value) || 0;
  const populationStd = Math.sqrt(variance(population.current, d => d.value) || 0);

  // Take a random sample
  const takeSample = useCallback(() => {
    if (currentSample.length > 0) return; // Prevent taking new sample while one is active
    
    // Generate random indices
    const indices = new Set();
    while (indices.size < sampleSize) {
      indices.add(Math.floor(Math.random() * populationSize));
    }
    
    setSelectedIndices(indices);
    const sample = Array.from(indices).map(index => population.current[index]);
    setCurrentSample(sample);
    
    // Animate the mean calculation
    setAnimatingMean(true);
    setTimeout(() => {
      const mean = d3.mean(sample, d => d.value);
      setSampleMeans(prev => [...prev, mean]);
      setSamplesCollected(prev => prev + 1);
      setAnimatingMean(false);
    }, 1000);
  }, [sampleSize, populationSize, currentSample.length]);

  // Clear current sample
  const clearSample = () => {
    setCurrentSample([]);
    setSelectedIndices(new Set());
  };

  // Reset everything
  const reset = () => {
    setSamplesCollected(0);
    setSampleMeans([]);
    setCurrentSample([]);
    setSelectedIndices(new Set());
    setIsAutoSampling(false);
    if (autoSampleInterval.current) {
      clearInterval(autoSampleInterval.current);
    }
  };

  // Auto sampling
  // Auto-sampling with progressive speed
  useEffect(() => {
    if (isAutoSampling) {
      // Faster sampling at the beginning, slower as we collect more
      const delay = samplesCollected < 5 ? 1500 : samplesCollected < 15 ? 2000 : 2500;
      const showDuration = samplesCollected < 5 ? 1000 : 1500;
      
      autoSampleInterval.current = setInterval(() => {
        takeSample();
        setTimeout(clearSample, showDuration);
      }, delay);
    } else if (autoSampleInterval.current) {
      clearInterval(autoSampleInterval.current);
    }
    
    return () => {
      if (autoSampleInterval.current) {
        clearInterval(autoSampleInterval.current);
      }
    };
  }, [isAutoSampling, takeSample, samplesCollected]);

  // Draw histogram of sample means
  useEffect(() => {
    if (!histogramRef.current || sampleMeans.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = histogramRef.current.clientWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    // Clear previous
    d3.select(histogramRef.current).selectAll("*").remove();

    const svg = d3.select(histogramRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create bins
    const binGenerator = d3.histogram()
      .domain([0, 18])
      .thresholds(15);
    
    const bins = binGenerator(sampleMeans);

    // Scales
    const x = d3.scaleLinear()
      .domain([0, 18])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height, 0]);

    // Add axes
    const xAxisGroup = g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
    
    xAxisGroup.selectAll("text")
      .attr("fill", "#f3f4f6");
    
    xAxisGroup.append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", colors.text.secondary)
      .style("text-anchor", "middle")
      .text("Sample Mean");

    const yAxisGroup = g.append("g")
      .call(d3.axisLeft(y).ticks(5));
    
    yAxisGroup.selectAll("text")
      .attr("fill", "#f3f4f6");
    
    yAxisGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("x", -height / 2)
      .attr("fill", colors.text.secondary)
      .style("text-anchor", "middle")
      .text("Frequency");

    // Add bars
    const bars = g.selectAll(".bar")
      .data(bins)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.x0) + 1)
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 2))
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", colors.chart.primary)
      .attr("opacity", 0.8);

    // Animate bars
    bars.transition()
      .duration(300)
      .attr("y", d => y(d.length))
      .attr("height", d => height - y(d.length));

    // Add population mean line
    g.append("line")
      .attr("x1", x(populationMean))
      .attr("x2", x(populationMean))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", colors.chart.secondary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0)
      .transition()
      .delay(300)
      .duration(300)
      .attr("opacity", 1);

    // Add label for population mean
    g.append("text")
      .attr("x", x(populationMean))
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.secondary)
      .attr("font-size", "12px")
      .text(`μ = ${populationMean.toFixed(1)}`)
      .attr("opacity", 0)
      .transition()
      .delay(300)
      .duration(300)
      .attr("opacity", 1);

  }, [sampleMeans, populationMean]);

  // Calculate current sample mean
  const currentSampleMean = currentSample.length > 0 
    ? d3.mean(currentSample, d => d.value)
    : null;

  // Progress calculation
  const progress = Math.min((samplesCollected / 30) * 100, 100);

  return (
    <>
      <Chapter4ReferenceSheet mode="floating" />
      <VisualizationContainer 
      title="Sampling Distribution Basics: Rolling Dice"
      className="max-w-6xl mx-auto"
    >
      {/* Introduction and Mathematical Context */}
      <VisualizationSection>
        <div className="space-y-6">
          {/* Core Concept */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-600/30">
            <h3 className={cn(typography.h3, "mb-3 text-blue-400")}>What Are We Exploring?</h3>
            <p className={cn(typography.description, "mb-3")}>
              We have a <span className="text-blue-400 font-semibold">population</span> of 64 dice. Each die shows a value from 1 to 6, 
              but they're not evenly distributed—we have more low values (1s and 2s) and some high values (5s), 
              but fewer middle values and 6s.
            </p>
            <p className={cn(typography.description)}>
              We'll repeatedly take <span className="text-teal-400 font-semibold">random samples</span> of dice, 
              calculate their <span className="text-yellow-400 font-semibold">mean (average)</span>, 
              and observe how these sample means form their own distribution.
            </p>
          </div>

          {/* Mathematical Foundation */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-neutral-800 rounded-lg p-4">
              <h4 className={cn(typography.h4, "mb-2 text-teal-400")}>Key Terms</h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-semibold text-neutral-300">Population Mean (μ)</dt>
                  <dd className={typography.description}>The true average of ALL dice in our population</dd>
                </div>
                <div>
                  <dt className="font-semibold text-neutral-300">Sample Mean (x̄)</dt>
                  <dd className={typography.description}>The average of a subset of dice we randomly select</dd>
                </div>
                <div>
                  <dt className="font-semibold text-neutral-300">Sampling Distribution</dt>
                  <dd className={typography.description}>The pattern formed by many sample means</dd>
                </div>
              </dl>
            </div>
            
            <div className="bg-neutral-800 rounded-lg p-4">
              <h4 className={cn(typography.h4, "mb-2 text-yellow-400")}>What to Expect</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">→</span>
                  <span className={typography.description}>
                    Individual samples will vary, but their means will cluster around the population mean
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">→</span>
                  <span className={typography.description}>
                    The distribution of sample means will be approximately normal (bell-shaped)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">→</span>
                  <span className={typography.description}>
                    Larger sample sizes lead to less variability in the sample means
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </VisualizationSection>

      {/* Main visualization area */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Population and sampling */}
        <VisualizationSection>
          <h3 className={cn(typography.h3, "mb-4 flex items-center gap-2")}>
            <Users className="w-5 h-5" />
            Population & Sampling
          </h3>
          
          {/* Population info */}
          <div className="bg-blue-900/20 rounded-lg p-3 mb-4 border border-blue-600/30">
            <p className={cn(typography.label, "text-blue-400 mb-1")}>Population Distribution</p>
            <p className={cn(typography.description, "text-xs")}>
              64 dice with non-uniform distribution: More low values (⚀⚁) and high values (⚄), fewer middle values
            </p>
          </div>
          
          {/* Population grid */}
          <div 
            ref={populationRef}
            className="bg-neutral-900 rounded-lg p-4 mb-4"
          >
            <div className="grid grid-cols-8 gap-2 mb-4">
              {population.current.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "relative text-3xl p-2 rounded-lg transition-all duration-300",
                    "bg-gradient-to-br from-neutral-800 to-neutral-900",
                    "border border-neutral-700",
                    selectedIndices.has(item.id)
                      ? "ring-2 ring-teal-500 scale-110 shadow-lg shadow-teal-500/20"
                      : "",
                    isAutoSampling && "opacity-70"
                  )}
                >
                  <span className="block">
                    {item.emoji}
                  </span>
                  {selectedIndices.has(item.id) && (
                    <div className="absolute inset-0 bg-teal-500 opacity-20 rounded-lg animate-pulse" />
                  )}
                </div>
              ))}
            </div>
            
            {/* Sample display */}
            {currentSample.length > 0 && (
              <div className="bg-neutral-800 rounded-lg p-4">
                <p className={typography.label}>Current Sample:</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex gap-3">
                    {currentSample.map((item, i) => (
                      <div key={i} className="text-center">
                        <div className="text-3xl p-2 bg-neutral-900 rounded-lg border border-neutral-700">
                          {item.emoji}
                        </div>
                        <div className={cn(typography.value, "text-sm mt-1 text-teal-400")}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  {currentSampleMean !== null && (
                    <div className={cn(
                      "ml-auto p-3 rounded-lg bg-neutral-700",
                      animatingMean ? "animate-pulse ring-2 ring-teal-500" : ""
                    )}>
                      <div className="text-left space-y-1">
                        <p className="text-xs text-neutral-400">Sample Mean (x̄):</p>
                        <p className={cn(typography.valueAlt, "text-2xl text-teal-400")}>
                          {currentSampleMean.toFixed(3)}
                        </p>
                        <p className="text-xs font-mono text-neutral-400">
                          = {currentSample.map(d => d.value).join(" + ")} / {sampleSize}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <ControlGroup label="Sample Size">
              <RangeSlider
                value={sampleSize}
                onChange={setSampleSize}
                min={2}
                max={16}
                step={1}
                disabled={isAutoSampling}
              />
              <div className="flex justify-between text-xs text-neutral-400 mt-1">
                <span>2</span>
                <span className={typography.value}>{sampleSize} items</span>
                <span>16</span>
              </div>
            </ControlGroup>

            <div className="flex gap-2">
              {currentSample.length === 0 && (
                <Button
                  onClick={() => setIsAutoSampling(!isAutoSampling)}
                  variant={isAutoSampling ? "danger" : "success"}
                  className="flex-1"
                >
                  {isAutoSampling ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Sampling
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {samplesCollected === 0 ? "Start Sampling" : "Resume Sampling"}
                    </>
                  )}
                </Button>
              )}
              {currentSample.length > 0 && (
                <div className="flex-1 flex items-center justify-center text-sm text-neutral-400">
                  Recording sample mean...
                </div>
              )}
              <Button
                onClick={reset}
                variant="outline"
                size="icon"
                title="Reset"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Population stats */}
          <div className="mt-4 bg-neutral-900 rounded-lg p-4">
            <h4 className={cn(typography.h4, "mb-2")}>Population Statistics</h4>
            <StatsDisplay
              stats={[
                { label: "Population Mean (μ)", value: populationMean.toFixed(2), highlight: true },
                { label: "Population Std Dev (σ)", value: populationStd.toFixed(2) },
                { label: "Population Size", value: populationSize },
                { label: "Samples Collected", value: samplesCollected }
              ]}
            />
          </div>
        </VisualizationSection>

        {/* Right: Sampling distribution */}
        <VisualizationSection>
          <h3 className={cn(typography.h3, "mb-4 flex items-center gap-2")}>
            <BarChart3 className="w-5 h-5" />
            Distribution of Sample Means
          </h3>
          
          <GraphContainer height="300px">
            <div ref={histogramRef} className="w-full h-full" />
            {sampleMeans.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className={typography.description}>
                  Sample means will appear here...
                </p>
              </div>
            )}
          </GraphContainer>

          {/* Progress and insights */}
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className={typography.label}>Progress to Pattern</span>
                <span className={typography.value}>{samplesCollected}/30 samples</span>
              </div>
              <ProgressBar value={progress} className="mb-2" />
            </div>

            {/* Progressive Mathematical Insights */}
            {samplesCollected >= 5 && (
              <div className="bg-gradient-to-br from-teal-900/20 to-blue-900/20 rounded-lg p-4 space-y-3 animate-fade-in border border-teal-600/30">
                <p className={cn(typography.label, "flex items-center gap-2 text-teal-400")}>
                  <TrendingUp className="w-4 h-4" />
                  Pattern Emerging! (5+ samples)
                </p>
                <p className={typography.description}>
                  Notice how the sample means are clustering? Even though individual dice vary widely (1-6), 
                  their <span className="text-teal-400 font-semibold">averages</span> are much more predictable.
                </p>
                <div className="bg-neutral-800/50 rounded p-3 text-sm">
                  <p className="font-mono text-neutral-300">
                    Sample Mean = (die₁ + die₂ + ... + dieₙ) / n
                  </p>
                  <p className={cn(typography.description, "text-xs mt-2")}>
                    Each sample mean is less extreme than individual dice values
                  </p>
                </div>
              </div>
            )}

            {samplesCollected >= 15 && (
              <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-lg p-4 space-y-3 animate-fade-in border border-yellow-600/30">
                <p className={cn(typography.label, "text-yellow-400")}>
                  The Central Limit Theorem at Work! (15+ samples)
                </p>
                <div className="space-y-2">
                  <p className={typography.description}>
                    The sample means are forming a <span className="text-yellow-400 font-semibold">normal distribution</span> 
                    centered at μ = {populationMean.toFixed(2)}, even though our population is non-uniform!
                  </p>
                  <div className="bg-neutral-800/50 rounded p-3 space-y-2">
                    <p className="text-sm font-semibold text-neutral-300">Why is this happening?</p>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span className={typography.description}>
                          Random sampling gives each die equal chance of selection
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span className={typography.description}>
                          Averaging reduces variability (extremes cancel out)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span className={typography.description}>
                          More samples → clearer bell curve pattern
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {samplesCollected >= 30 && (
              <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-4 space-y-3 animate-fade-in border border-purple-600/30">
                <p className={cn(typography.label, "text-purple-400")}>
                  Mathematical Foundation (30+ samples)
                </p>
                <div className="space-y-3">
                  <div className="bg-neutral-800/50 rounded p-3">
                    <p className="text-sm font-semibold text-neutral-300 mb-2">The Sampling Distribution:</p>
                    <p className="font-mono text-sm text-neutral-300">
                      X̄ ~ N(μ, σ²/n)
                    </p>
                    <p className={cn(typography.description, "text-xs mt-2")}>
                      Sample means follow a normal distribution with mean μ and variance σ²/n
                    </p>
                  </div>
                  <div className="bg-neutral-800/50 rounded p-3">
                    <p className="text-sm font-semibold text-neutral-300 mb-2">Standard Error:</p>
                    <p className="font-mono text-sm text-neutral-300">
                      SE = σ/√n = {(populationStd / Math.sqrt(sampleSize)).toFixed(3)}
                    </p>
                    <p className={cn(typography.description, "text-xs mt-2")}>
                      This measures the typical deviation of sample means from μ
                    </p>
                  </div>
                  <p className={cn(typography.description, "text-sm")}>
                    With n={sampleSize}, we expect 95% of sample means to fall within 
                    <span className="text-purple-400 font-mono"> {(populationMean - 2 * populationStd / Math.sqrt(sampleSize)).toFixed(2)}</span> to 
                    <span className="text-purple-400 font-mono"> {(populationMean + 2 * populationStd / Math.sqrt(sampleSize)).toFixed(2)}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </VisualizationSection>
      </div>

      {/* Summary and Complete */}
      {samplesCollected >= 30 && (
        <VisualizationSection className="mt-6">
          <div className="bg-gradient-to-r from-green-900/20 to-teal-900/20 rounded-lg p-6 border border-green-600/30 space-y-4">
            <h3 className={cn(typography.h3, "text-green-400")}>
              What We've Discovered
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-neutral-300">The Big Picture:</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1"></span>
                    <span className={typography.description}>
                      Individual dice values vary from 1-6, but sample means cluster much more tightly
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1"></span>
                    <span className={typography.description}>
                      The sampling distribution is approximately normal, even from a non-uniform population
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1"></span>
                    <span className={typography.description}>
                      Sample means center around μ = {populationMean.toFixed(2)} with SE = {(populationStd / Math.sqrt(sampleSize)).toFixed(3)}
                    </span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-neutral-300">Why This Matters:</h4>
                <p className={cn(typography.description, "text-sm")}>
                  This is the foundation for all statistical inference! Because sample means follow predictable patterns:
                </p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">→</span>
                    <span className={typography.description}>We can estimate population parameters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">→</span>
                    <span className={typography.description}>We can quantify our uncertainty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">→</span>
                    <span className={typography.description}>We can make statistical decisions</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button onClick={onComplete} variant="primary" size="lg">
                Complete Lesson
              </Button>
            </div>
          </div>
        </VisualizationSection>
      )}
    </VisualizationContainer>
    </>
  );
};

export default SamplingDistributionsInteractive;