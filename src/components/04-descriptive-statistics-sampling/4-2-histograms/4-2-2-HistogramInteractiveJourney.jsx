"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  GraphContainer, 
  VisualizationSection,
  ControlGroup,
  StatsDisplay
} from "@/components/ui/VisualizationContainer";
import { createColorScheme, cn, typography, colors, formatNumber } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AlertCircle, CheckCircle, TrendingUp, Award, Info, Lightbulb } from "lucide-react";
import { useAnimationCleanup } from "@/hooks/useAnimationCleanup";

const colorScheme = createColorScheme('sampling');

// Achievement notification component
const Achievement = ({ title, description, icon: Icon }) => (
  <div className="fixed top-4 right-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in z-50">
    <Icon className="w-6 h-6" />
    <div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm opacity-90">{description}</p>
    </div>
  </div>
);

// Visual quality indicator for bin count
const BinQualityIndicator = ({ binCount, optimalBins }) => {
  const difference = Math.abs(binCount - optimalBins);
  const quality = difference === 0 ? 'perfect' : 
                  difference <= 2 ? 'good' : 
                  difference <= 5 ? 'okay' : 'poor';
  
  const colors = {
    perfect: 'text-green-400 bg-green-900/30',
    good: 'text-blue-400 bg-blue-900/30',
    okay: 'text-yellow-400 bg-yellow-900/30',
    poor: 'text-red-400 bg-red-900/30'
  };
  
  const messages = {
    perfect: 'Perfect! Optimal bin count!',
    good: 'Good! Very close to optimal.',
    okay: 'Okay, but could be better.',
    poor: binCount < optimalBins ? 'Too few bins - losing detail!' : 'Too many bins - creating noise!'
  };
  
  return (
    <div className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300", colors[quality])}>
      {messages[quality]}
    </div>
  );
};

const HistogramInteractiveJourney = () => {
  // State management
  const [stage, setStage] = useState(0);
  const [sampleSize, setSampleSize] = useState(100);
  const [manualBins, setManualBins] = useState(10);
  const [showOptimal, setShowOptimal] = useState(false);
  const [data, setData] = useState([]);
  const [achievements, setAchievements] = useState(new Set());
  const [showAchievement, setShowAchievement] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  useAnimationCleanup(animationRef);
  
  // Calculate optimal bins using square root rule
  const optimalBins = Math.ceil(Math.sqrt(sampleSize));
  
  // Generate data based on sample size
  const generateData = useCallback(() => {
    const newData = [];
    for (let i = 0; i < sampleSize; i++) {
      newData.push(jStat.normal.sample(0, 1));
    }
    setData(newData);
  }, [sampleSize]);
  
  // Initialize data on mount and when sample size changes
  useEffect(() => {
    generateData();
  }, [generateData]);
  
  // Achievement system
  const unlockAchievement = useCallback((id, title, description, icon) => {
    if (!achievements.has(id)) {
      setAchievements(prev => new Set([...prev, id]));
      setShowAchievement({ title, description, icon });
      setTimeout(() => setShowAchievement(null), 3000);
    }
  }, [achievements]);
  
  // Check for achievements
  useEffect(() => {
    if (hasInteracted && Math.abs(manualBins - optimalBins) === 0) {
      unlockAchievement('perfect-bins', 'Perfect Bins!', 'You found the optimal bin count!', CheckCircle);
    }
    
    if (stage >= 2) {
      unlockAchievement('formula-learned', 'Formula Master!', 'You learned the square root rule!', Lightbulb);
    }
    
    if (achievements.size >= 3) {
      unlockAchievement('histogram-expert', 'Histogram Expert!', 'You\'ve mastered histogram creation!', Award);
    }
  }, [manualBins, optimalBins, stage, hasInteracted, unlockAchievement, achievements.size]);
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 400;
    const margin = { top: 40, right: 40, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    console.log('HistogramInteractiveJourney - dimensions:', { width, height });
    
    // Clear previous content
    svg.selectAll("*").remove();
    
    // Add background for visibility
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("stroke", "#374151")
      .attr("stroke-width", 1);
    
    // Create container
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xExtent = d3.extent(data);
    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - 0.5, xExtent[1] + 0.5])
      .range([0, innerWidth]);
    
    // Create histogram
    const histogram = d3.histogram()
      .domain(xScale.domain())
      .thresholds(xScale.ticks(manualBins));
    
    const bins = histogram(data);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([innerHeight, 0]);
    
    // Add gradient for bars
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "bar-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", innerHeight)
      .attr("x2", 0).attr("y2", 0);
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScheme.chart.primary)
      .attr("stop-opacity", 0.6);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScheme.chart.secondary)
      .attr("stop-opacity", 0.9);
    
    // Draw histogram bars
    const bars = g.selectAll(".bar")
      .data(bins)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.x0))
      .attr("y", innerHeight)
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr("height", 0)
      .attr("fill", "url(#bar-gradient)")
      .attr("rx", 2);
    
    // Animate bars
    bars.transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr("y", d => yScale(d.length))
      .attr("height", d => innerHeight - yScale(d.length));
    
    // Add hover effects
    bars.on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("filter", "brightness(1.2)");
        
        // Tooltip
        const tooltip = g.append("g")
          .attr("id", "tooltip");
        
        const x = xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2;
        const y = yScale(d.length) - 10;
        
        const rect = tooltip.append("rect")
          .attr("x", x - 30)
          .attr("y", y - 25)
          .attr("width", 60)
          .attr("height", 20)
          .attr("fill", colors.background.tertiary)
          .attr("stroke", colors.border.subtle)
          .attr("rx", 4);
        
        tooltip.append("text")
          .attr("x", x)
          .attr("y", y - 10)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "#ffffff")
          .text(`Count: ${d.length}`);
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.9)
          .attr("filter", "none");
        
        g.select("#tooltip").remove();
      });
    
    // Draw axes
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(6));
    
    xAxis.selectAll("path, line").attr("stroke", "#6b7280");
    xAxis.selectAll("text")
      .attr("fill", "#d1d5db")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");
    
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(5));
    
    yAxis.selectAll("path, line").attr("stroke", "#6b7280");
    yAxis.selectAll("text").attr("fill", "#d1d5db");
    
    // Axis labels
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 65})`)
      .style("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .text("Value");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (innerHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .text("Frequency");
    
    // Show optimal bins indicator if enabled
    if (showOptimal && stage >= 2) {
      // Optimal bins overlay
      const optimalHistogram = d3.histogram()
        .domain(xScale.domain())
        .thresholds(xScale.ticks(optimalBins));
      
      const optimalBinsData = optimalHistogram(data);
      
      g.selectAll(".optimal-bar")
        .data(optimalBinsData)
        .enter().append("rect")
        .attr("class", "optimal-bar")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.length))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("height", d => innerHeight - yScale(d.length))
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.accent)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.5);
    }
    
  }, [data, manualBins, showOptimal, stage, optimalBins]);
  
  // Stage content
  const stages = [
    {
      title: "Stage 1: The Problem with Too Few or Too Many Bins",
      description: "Experiment with different bin counts to see how it affects the histogram shape.",
      task: "Try adjusting the bin count slider. What happens with very few bins? What about too many?",
      hint: "With too few bins, you lose detail. With too many, the pattern becomes noisy!"
    },
    {
      title: "Stage 2: Finding the Sweet Spot",
      description: "There's an optimal number of bins that best reveals the data's pattern.",
      task: `For ${sampleSize} data points, try to find the best number of bins.`,
      hint: `The optimal number is around ${optimalBins} bins. Can you see why?`
    },
    {
      title: "Stage 3: The Square Root Rule",
      description: "Mathematicians discovered a simple rule for choosing the number of bins.",
      task: "The square root rule says: Number of bins ≈ √(sample size)",
      formula: true
    },
    {
      title: "Stage 4: Practice Makes Perfect",
      description: "Test the square root rule with different sample sizes.",
      task: "Change the sample size and see how the optimal bin count changes.",
      practice: true
    }
  ];
  
  const currentStage = stages[stage];
  
  return (
    <VisualizationContainer
      title="4.2 Histogram Interactive Journey"
      description="Learn how the square root rule helps create optimal histograms"
    >
      {/* Progress bar */}
      <div className="mb-6">
        <ProgressBar 
          progress={(stage + 1) / stages.length * 100} 
          label={`Stage ${stage + 1} of ${stages.length}`}
        />
      </div>
      
      {/* Stage information */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-600/30">
        <h3 className="text-lg font-semibold text-blue-400 mb-2">{currentStage.title}</h3>
        <p className="text-gray-300 mb-3">{currentStage.description}</p>
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-cyan-400 mt-0.5" />
          <p className="text-sm text-cyan-300">{currentStage.task}</p>
        </div>
        {currentStage.hint && stage < 2 && (
          <div className="mt-2 text-sm text-gray-400 italic">
            Hint: {currentStage.hint}
          </div>
        )}
      </div>
      
      {/* Controls */}
      <VisualizationSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ControlGroup>
            <RangeSlider
              label={`Number of Bins: ${manualBins}`}
              value={manualBins}
              onChange={(value) => {
                setManualBins(value);
                setHasInteracted(true);
              }}
              min={5}
              max={50}
              step={1}
            />
            <BinQualityIndicator binCount={manualBins} optimalBins={optimalBins} />
          </ControlGroup>
          
          <ControlGroup>
            {stage >= 3 ? (
              <>
                <RangeSlider
                  label={`Sample Size: ${sampleSize}`}
                  value={sampleSize}
                  onChange={setSampleSize}
                  min={50}
                  max={500}
                  step={50}
                />
                <div className="text-sm text-gray-400">
                  Optimal bins (√{sampleSize}) = {optimalBins}
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <p className="text-sm text-gray-400">
                  Sample size: {sampleSize} data points
                </p>
              </div>
            )}
          </ControlGroup>
        </div>
        
        {/* Formula display for stage 3 */}
        {stage >= 2 && (
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg text-center">
            <h4 className="text-lg font-semibold text-cyan-400 mb-2">The Square Root Rule</h4>
            <div className="text-2xl font-mono text-white">
              k = √n
            </div>
            <p className="text-sm text-gray-400 mt-2">
              where k = number of bins, n = sample size
            </p>
            {stage >= 2 && (
              <Button
                onClick={() => setShowOptimal(!showOptimal)}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                {showOptimal ? 'Hide' : 'Show'} Optimal Bins Overlay
              </Button>
            )}
          </div>
        )}
      </VisualizationSection>
      
      {/* Main visualization */}
      <GraphContainer height="400px" className="overflow-hidden">
        <svg 
          ref={svgRef} 
          className="w-full h-full" 
          style={{ 
            background: 'transparent',
            minHeight: '400px',
            display: 'block'
          }} 
        />
      </GraphContainer>
      
      {/* Statistics display */}
      <StatsDisplay
        stats={[
          { label: "Data Points", value: sampleSize },
          { label: "Current Bins", value: manualBins },
          { label: "Optimal Bins (√n)", value: optimalBins, highlight: true },
          { label: "Difference", value: Math.abs(manualBins - optimalBins) }
        ]}
      />
      
      {/* Navigation */}
      <div className="mt-6 flex justify-between items-center">
        <Button
          onClick={() => setStage(Math.max(0, stage - 1))}
          variant="outline"
          disabled={stage === 0}
        >
          Previous Stage
        </Button>
        
        <div className="text-sm text-gray-400">
          Achievements: {achievements.size} unlocked
        </div>
        
        <Button
          onClick={() => {
            if (stage < stages.length - 1) {
              setStage(stage + 1);
              if (stage === 1) {
                unlockAchievement('learned-rule', 'Rule Learned!', 'You discovered the square root rule!', TrendingUp);
              }
            }
          }}
          disabled={stage === stages.length - 1}
        >
          Next Stage
        </Button>
      </div>
      
      {/* Learning summary for final stage */}
      {stage === 3 && (
        <div className="mt-6 p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
          <h4 className="font-semibold text-green-400 mb-2">Congratulations!</h4>
          <p className="text-gray-300 mb-3">
            You've mastered the square root rule for creating optimal histograms!
          </p>
          <ul className="space-y-1 text-sm text-gray-300">
            <li>Too few bins hide important patterns</li>
            <li>Too many bins create visual noise</li>
            <li>The square root rule (k = √n) provides a good starting point</li>
            <li>Always adjust based on your specific data and goals</li>
          </ul>
        </div>
      )}
      
      {/* Achievement notification */}
      {showAchievement && (
        <Achievement
          title={showAchievement.title}
          description={showAchievement.description}
          icon={showAchievement.icon}
        />
      )}
    </VisualizationContainer>
  );
};

export default HistogramInteractiveJourney;