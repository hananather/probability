"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { VisualizationContainer, GraphContainer, VisualizationSection } from "../ui/VisualizationContainer";
import { createColorScheme, cn, typography, colors } from "../../lib/design-system";
import { Button } from "../ui/button";
import { Sparkles, Play, Pause, RotateCcw, ChevronRight } from "lucide-react";
import { useAnimationCleanup } from "@/hooks/useAnimationCleanup";

const colorScheme = createColorScheme('sampling');

// Particle system for animated data points
const DataParticle = ({ x, y, targetBin, delay, onComplete }) => {
  const ref = useRef(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const particle = d3.select(ref.current);
    
    // Initial position (falling from top)
    particle
      .attr("cx", x)
      .attr("cy", -20)
      .attr("opacity", 0);
    
    // Animate falling and sorting
    particle
      .transition()
      .delay(delay)
      .duration(800)
      .ease(d3.easeCubicInOut)
      .attr("cy", y)
      .attr("opacity", 1)
      .transition()
      .duration(600)
      .attr("cx", targetBin.x)
      .attr("cy", targetBin.y)
      .on("end", onComplete);
  }, [x, y, targetBin, delay, onComplete]);
  
  return <circle ref={ref} r="3" fill={colorScheme.chart.primary} />;
};

const HistogramIntuitiveIntro = () => {
  const [stage, setStage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dataPoints, setDataPoints] = useState([]);
  const [showBins, setShowBins] = useState(false);
  const [binCount, setBinCount] = useState(0);
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  // Clean up animations on unmount
  useAnimationCleanup(animationRef);
  
  // Generate sample data (heights in cm)
  const generateHeightData = useCallback(() => {
    const data = [];
    const mean = 170; // Average height
    const std = 10;   // Standard deviation
    
    for (let i = 0; i < 100; i++) {
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const height = mean + z0 * std;
      data.push({
        id: i,
        value: Math.max(140, Math.min(200, height)), // Clamp to reasonable range
        x: 50 + Math.random() * 700, // Random x position for falling effect
      });
    }
    return data;
  }, []);
  
  // Stage 1: The Problem - Individual Heights
  const stage1Animation = useCallback(() => {
    if (!svgRef.current) return;
    setIsAnimating(true);
    
    const svg = d3.select(svgRef.current);
    const { width, height } = svgRef.current.getBoundingClientRect();
    
    // Clear previous content
    svg.selectAll("*").remove();
    
    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("class", "text-xl font-semibold")
      .attr("fill", colors.text.primary)
      .text("Measuring Heights of 100 Students");
    
    // Generate and show individual measurements
    const data = generateHeightData();
    setDataPoints(data);
    
    const yScale = d3.scaleLinear()
      .domain([140, 200])
      .range([height - 100, 100]);
    
    // Animate numbers appearing
    const textGroup = svg.append("g");
    
    data.forEach((d, i) => {
      textGroup.append("text")
        .attr("x", 100 + (i % 10) * 65)
        .attr("y", 100 + Math.floor(i / 10) * 30)
        .attr("text-anchor", "middle")
        .attr("font-family", "monospace")
        .attr("font-size", "12px")
        .attr("fill", colorScheme.chart.primary)
        .attr("opacity", 0)
        .text(`${d.value.toFixed(1)}cm`)
        .transition()
        .delay(i * 30)
        .duration(300)
        .attr("opacity", 1);
    });
    
    // Add overwhelming message after animation
    setTimeout(() => {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 40)
        .attr("text-anchor", "middle")
        .attr("class", "text-lg")
        .attr("fill", colors.text.secondary)
        .attr("opacity", 0)
        .text("This is overwhelming! Can we organize this data better?")
        .transition()
        .duration(800)
        .attr("opacity", 1);
      
      setIsAnimating(false);
    }, 3500);
  }, [generateHeightData]);
  
  // Stage 2: Sorting into Buckets
  const stage2Animation = useCallback(() => {
    if (!svgRef.current) return;
    setIsAnimating(true);
    
    const svg = d3.select(svgRef.current);
    const { width, height } = svgRef.current.getBoundingClientRect();
    
    // Clear previous content with fade
    svg.selectAll("*")
      .transition()
      .duration(500)
      .attr("opacity", 0)
      .remove();
    
    setTimeout(() => {
      // Title
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .attr("class", "text-xl font-semibold")
        .attr("fill", colors.text.primary)
        .text("Let's Sort Heights into Buckets!");
      
      // Create bins/buckets
      const numBins = 10;
      const binWidth = (width - 200) / numBins;
      const binHeight = height - 200;
      
      const bins = d3.range(numBins).map(i => ({
        id: i,
        x: 100 + i * binWidth,
        width: binWidth - 5,
        label: `${150 + i * 5}-${155 + i * 5}`,
        min: 150 + i * 5,
        max: 155 + i * 5,
        count: 0
      }));
      
      // Draw buckets
      const buckets = svg.append("g").attr("class", "buckets");
      
      bins.forEach((bin, i) => {
        // Bucket outline
        buckets.append("rect")
          .attr("x", bin.x)
          .attr("y", 100)
          .attr("width", bin.width)
          .attr("height", binHeight)
          .attr("fill", "none")
          .attr("stroke", colors.border.subtle)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5")
          .attr("opacity", 0)
          .transition()
          .delay(i * 100)
          .duration(500)
          .attr("opacity", 1);
        
        // Bucket label
        buckets.append("text")
          .attr("x", bin.x + bin.width / 2)
          .attr("y", height - 50)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", colors.text.secondary)
          .attr("opacity", 0)
          .text(bin.label + " cm")
          .transition()
          .delay(i * 100 + 200)
          .duration(500)
          .attr("opacity", 1);
      });
      
      // Animate data points falling into buckets
      const particles = svg.append("g").attr("class", "particles");
      
      dataPoints.forEach((d, i) => {
        // Find which bin this height belongs to
        const binIndex = Math.floor((d.value - 150) / 5);
        const bin = bins[Math.max(0, Math.min(numBins - 1, binIndex))];
        bin.count++;
        
        const targetX = bin.x + bin.width / 2 + (Math.random() - 0.5) * bin.width * 0.8;
        const targetY = height - 70 - bin.count * 4;
        
        particles.append("circle")
          .attr("cx", d.x)
          .attr("cy", -20)
          .attr("r", 3)
          .attr("fill", colorScheme.chart.primary)
          .attr("opacity", 0)
          .transition()
          .delay(2000 + i * 20)
          .duration(800)
          .attr("cy", 200 + Math.random() * 100)
          .attr("opacity", 1)
          .transition()
          .duration(600)
          .ease(d3.easeCubicInOut)
          .attr("cx", targetX)
          .attr("cy", targetY);
      });
      
      // Show insight after animation
      setTimeout(() => {
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", 80)
          .attr("text-anchor", "middle")
          .attr("class", "text-lg")
          .attr("fill", colorScheme.chart.accent)
          .attr("opacity", 0)
          .text("Now we can see the pattern! Most students are around 170cm tall.")
          .transition()
          .duration(800)
          .attr("opacity", 1);
        
        setIsAnimating(false);
        setBinCount(numBins);
      }, 5000);
    }, 600);
  }, [dataPoints]);
  
  // Stage 3: Transform to Histogram
  const stage3Animation = useCallback(() => {
    if (!svgRef.current || binCount === 0) return;
    setIsAnimating(true);
    
    const svg = d3.select(svgRef.current);
    const { width, height } = svgRef.current.getBoundingClientRect();
    
    // Fade out particles and buckets
    svg.selectAll(".particles, .buckets")
      .transition()
      .duration(800)
      .attr("opacity", 0)
      .remove();
    
    // Create histogram
    setTimeout(() => {
      const margin = { top: 80, right: 60, bottom: 80, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Create histogram bins
      const xScale = d3.scaleLinear()
        .domain([150, 200])
        .range([0, innerWidth]);
      
      const histogram = d3.histogram()
        .domain(xScale.domain())
        .thresholds(xScale.ticks(binCount));
      
      const bins = histogram(dataPoints.map(d => d.value));
      
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([innerHeight, 0]);
      
      // Draw bars with animation
      g.selectAll("rect")
        .data(bins)
        .enter().append("rect")
        .attr("x", d => xScale(d.x0))
        .attr("y", innerHeight)
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("height", 0)
        .attr("fill", colorScheme.chart.primary)
        .attr("opacity", 0.8)
        .transition()
        .duration(1000)
        .delay((d, i) => i * 100)
        .attr("y", d => yScale(d.length))
        .attr("height", d => innerHeight - yScale(d.length));
      
      // Add axes
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .attr("opacity", 0)
        .call(d3.axisBottom(xScale).ticks(10))
        .transition()
        .delay(1500)
        .duration(500)
        .attr("opacity", 1);
      
      g.append("g")
        .attr("opacity", 0)
        .call(d3.axisLeft(yScale).ticks(5))
        .transition()
        .delay(1500)
        .duration(500)
        .attr("opacity", 1);
      
      // Labels
      g.append("text")
        .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 50})`)
        .style("text-anchor", "middle")
        .attr("fill", colors.text.primary)
        .attr("opacity", 0)
        .text("Height (cm)")
        .transition()
        .delay(2000)
        .duration(500)
        .attr("opacity", 1);
      
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (innerHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("fill", colors.text.primary)
        .attr("opacity", 0)
        .text("Number of Students")
        .transition()
        .delay(2000)
        .duration(500)
        .attr("opacity", 1);
      
      // Update title
      svg.select("text")
        .transition()
        .duration(800)
        .text("This is a Histogram!");
      
      // Final message
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .attr("class", "text-lg")
        .attr("fill", colorScheme.chart.accent)
        .attr("opacity", 0)
        .text("Histograms help us see patterns in continuous data!")
        .transition()
        .delay(2500)
        .duration(800)
        .attr("opacity", 1);
      
      setIsAnimating(false);
    }, 1000);
  }, [dataPoints, binCount]);
  
  // Handle stage progression
  const handleNextStage = () => {
    if (isAnimating) return;
    
    const newStage = stage + 1;
    setStage(newStage);
    
    switch (newStage) {
      case 1:
        stage1Animation();
        break;
      case 2:
        stage2Animation();
        break;
      case 3:
        stage3Animation();
        break;
    }
  };
  
  const resetAnimation = () => {
    setStage(0);
    setDataPoints([]);
    setShowBins(false);
    setBinCount(0);
    setIsAnimating(false);
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll("*").remove();
    }
  };
  
  const stageDescriptions = [
    {
      title: "Welcome to Histograms!",
      description: "Let's discover why histograms are useful for understanding data.",
      action: "Start Learning"
    },
    {
      title: "The Problem: Too Many Numbers",
      description: "When we have lots of measurements, it's hard to see patterns.",
      action: "Organize the Data"
    },
    {
      title: "The Solution: Sort into Buckets",
      description: "By grouping similar values together, patterns emerge!",
      action: "Create Histogram"
    },
    {
      title: "The Histogram",
      description: "A visual representation that shows how data is distributed.",
      action: "Continue to Next Lesson"
    }
  ];
  
  return (
    <VisualizationContainer
      title="Understanding Histograms: An Intuitive Introduction"
      description="Discover how histograms help us see patterns in continuous data"
    >
      {/* Stage indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i <= stage ? "w-8 bg-gradient-to-r from-cyan-500 to-blue-500" : "w-2 bg-gray-600"
            )}
          />
        ))}
      </div>
      
      {/* Main visualization area */}
      <GraphContainer height="500px" className="relative">
        <svg ref={svgRef} className="w-full h-full" />
        
        {/* Welcome overlay for stage 0 */}
        {stage === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md">
              <Sparkles className="w-16 h-16 mx-auto text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">
                Why Do We Need Histograms?
              </h2>
              <p className="text-gray-300">
                Imagine you're a teacher with 100 students' height measurements. 
                How can you quickly understand if your students are tall, short, 
                or average? Let's find out!
              </p>
            </div>
          </div>
        )}
      </GraphContainer>
      
      {/* Stage description and controls */}
      <div className="mt-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              {stageDescriptions[stage].title}
            </h3>
            <p className="text-gray-300">
              {stageDescriptions[stage].description}
            </p>
          </div>
          
          <div className="flex items-center gap-3 ml-6">
            {stage > 0 && stage < 3 && (
              <Button
                onClick={resetAnimation}
                variant="outline"
                size="sm"
                disabled={isAnimating}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
            
            {stage < 3 && (
              <Button
                onClick={handleNextStage}
                disabled={isAnimating}
                className="flex items-center gap-2"
              >
                {isAnimating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    {stageDescriptions[stage].action}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
            
            {stage === 3 && (
              <p className="text-sm text-gray-400">
                Ready to learn about optimal bin sizes? Continue to the next lesson!
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Learning tips */}
      {stage === 3 && (
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
          <h4 className="font-semibold text-blue-400 mb-2">💡 Key Takeaways</h4>
          <ul className="space-y-1 text-sm text-gray-300">
            <li>• Histograms organize continuous data into "bins" or "buckets"</li>
            <li>• The height of each bar shows how many values fall in that range</li>
            <li>• They help us see the overall shape and pattern of our data</li>
            <li>• Most students in our example were around 170cm tall - the distribution has a peak there!</li>
          </ul>
        </div>
      )}
    </VisualizationContainer>
  );
};

export default HistogramIntuitiveIntro;