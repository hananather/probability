"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { VisualizationContainer, GraphContainer } from "@/components/ui/VisualizationContainer";
import { createColorScheme, cn } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, RotateCcw, ChevronRight } from "lucide-react";
import { useAnimationCleanup } from "@/hooks/useAnimationCleanup";

const colorScheme = createColorScheme('sampling');

const LineChartAnimation = () => {
  const [stage, setStage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [temperatureData, setTemperatureData] = useState([]);
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  useAnimationCleanup(animationRef);
  
  // Generate temperature data over a year
  const generateTemperatureData = useCallback(() => {
    const data = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Base temperatures for seasonal variation
    const baseTemps = [5, 7, 12, 18, 23, 28, 32, 31, 26, 19, 12, 6];
    
    months.forEach((month, i) => {
      const baseTemp = baseTemps[i];
      const variation = (Math.random() - 0.5) * 4;
      data.push({
        month: month,
        monthIndex: i,
        temperature: baseTemp + variation,
        date: new Date(2024, i, 15)
      });
    });
    
    return data;
  }, []);
  
  // Stage 1: Show data as disconnected points
  const stage1Animation = useCallback(() => {
    if (!svgRef.current) return;
    setIsAnimating(true);
    
    const svg = d3.select(svgRef.current);
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;
    
    svg.selectAll("*").remove();
    
    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("class", "text-xl font-semibold")
      .attr("fill", "#ffffff")
      .text("Monthly Temperature Records");
    
    // Generate data
    const data = generateTemperatureData();
    setTemperatureData(data);
    
    const margin = { top: 80, right: 60, bottom: 80, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, 35])
      .range([innerHeight, 0]);
    
    // Draw axes
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("line").attr("stroke", "#9ca3af");
    xAxis.selectAll("path").attr("stroke", "#9ca3af");
    xAxis.selectAll("text").attr("fill", "#e5e7eb");
    
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => d + "°C"));
    
    yAxis.selectAll("line").attr("stroke", "#9ca3af");
    yAxis.selectAll("path").attr("stroke", "#9ca3af");
    yAxis.selectAll("text").attr("fill", "#e5e7eb");
    
    // Add individual data points
    const dots = g.selectAll("circle")
      .data(data)
      .enter().append("circle")
      .attr("cx", d => xScale(d.month) + xScale.bandwidth() / 2)
      .attr("cy", d => yScale(d.temperature))
      .attr("r", 0)
      .attr("fill", "#14b8a6");
    
    dots.transition()
      .duration(500)
      .delay((d, i) => i * 100)
      .attr("r", 6);
    
    // Add values above points
    g.selectAll(".temp-label")
      .data(data)
      .enter().append("text")
      .attr("class", "temp-label")
      .attr("x", d => xScale(d.month) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.temperature) - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#fbbf24")
      .attr("opacity", 0)
      .text(d => Math.round(d.temperature) + "°")
      .transition()
      .delay((d, i) => i * 100 + 200)
      .duration(300)
      .attr("opacity", 1);
    
    // Add question
    setTimeout(() => {
      const messageGroup = svg.append("g");
      
      messageGroup.append("rect")
        .attr("x", width / 2 - 200)
        .attr("y", height - 40)
        .attr("width", 400)
        .attr("height", 35)
        .attr("rx", 8)
        .attr("fill", "rgba(0, 0, 0, 0.8)")
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 1);
      
      messageGroup.append("text")
        .attr("x", width / 2)
        .attr("y", height - 18)
        .attr("text-anchor", "middle")
        .attr("class", "text-md")
        .attr("fill", "white")
        .attr("opacity", 0)
        .text("Can we see the temperature trend over time?")
        .transition()
        .duration(500)
        .attr("opacity", 1);
      
      setIsAnimating(false);
    }, 2000);
  }, [generateTemperatureData]);
  
  // Stage 2: Connect the dots
  const stage2Animation = useCallback(() => {
    if (!svgRef.current || temperatureData.length === 0) return;
    setIsAnimating(true);
    
    const svg = d3.select(svgRef.current);
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;
    
    // Update title
    svg.select("text")
      .transition()
      .duration(500)
      .text("Connecting Points Shows the Trend");
    
    const margin = { top: 80, right: 60, bottom: 80, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.select("g");
    
    const xScale = d3.scaleBand()
      .domain(temperatureData.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, 35])
      .range([innerHeight, 0]);
    
    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.month) + xScale.bandwidth() / 2)
      .y(d => yScale(d.temperature))
      .curve(d3.curveMonotoneX);
    
    // Add the line path
    const path = g.append("path")
      .datum(temperatureData)
      .attr("fill", "none")
      .attr("stroke", "#14b8a6")
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Animate the line drawing
    const totalLength = path.node().getTotalLength();
    
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
    
    // Highlight the pattern
    setTimeout(() => {
      // Add seasonal annotations
      const summerGroup = g.append("g");
      summerGroup.append("rect")
        .attr("x", xScale('Jun'))
        .attr("y", 10)
        .attr("width", xScale.bandwidth() * 3)
        .attr("height", innerHeight - 10)
        .attr("fill", "#fbbf24")
        .attr("opacity", 0.05);
      
      summerGroup.append("text")
        .attr("x", xScale('Jul') + xScale.bandwidth() / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#fbbf24")
        .text("Summer Peak");
      
      const winterGroup = g.append("g");
      winterGroup.append("rect")
        .attr("x", xScale('Dec'))
        .attr("y", 10)
        .attr("width", xScale.bandwidth() * 2)
        .attr("height", innerHeight - 10)
        .attr("fill", "#60a5fa")
        .attr("opacity", 0.05);
      
      winterGroup.append("text")
        .attr("x", xScale('Jan'))
        .attr("y", innerHeight - 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#60a5fa")
        .text("Winter Low");
      
      setIsAnimating(false);
    }, 2500);
  }, [temperatureData]);
  
  // Stage 3: Show area under curve and trend analysis
  const stage3Animation = useCallback(() => {
    if (!svgRef.current || temperatureData.length === 0) return;
    setIsAnimating(true);
    
    const svg = d3.select(svgRef.current);
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;
    
    // Update title
    svg.select("text")
      .transition()
      .duration(500)
      .text("Line Charts Reveal Patterns Over Time!");
    
    const margin = { top: 80, right: 60, bottom: 80, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.select("g");
    
    const xScale = d3.scaleBand()
      .domain(temperatureData.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, 35])
      .range([innerHeight, 0]);
    
    // Create area generator
    const area = d3.area()
      .x(d => xScale(d.month) + xScale.bandwidth() / 2)
      .y0(innerHeight)
      .y1(d => yScale(d.temperature))
      .curve(d3.curveMonotoneX);
    
    // Add area fill
    g.insert("path", ":first-child")
      .datum(temperatureData)
      .attr("fill", "#14b8a6")
      .attr("opacity", 0)
      .attr("d", area)
      .transition()
      .duration(1000)
      .attr("opacity", 0.1);
    
    // Add average line
    const avgTemp = d3.mean(temperatureData, d => d.temperature);
    
    const avgLine = g.append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", yScale(avgTemp))
      .attr("y2", yScale(avgTemp))
      .attr("stroke", "#f97316")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    avgLine.transition()
      .duration(1000)
      .attr("x2", innerWidth);
    
    // Add average label
    g.append("text")
      .attr("x", innerWidth - 10)
      .attr("y", yScale(avgTemp) - 5)
      .attr("text-anchor", "end")
      .attr("font-size", "12px")
      .attr("fill", "#f97316")
      .attr("opacity", 0)
      .text(`Average: ${avgTemp.toFixed(1)}°C`)
      .transition()
      .delay(1000)
      .duration(500)
      .attr("opacity", 1);
    
    // Add insights box
    setTimeout(() => {
      const insightGroup = g.append("g");
      
      insightGroup.append("rect")
        .attr("x", 20)
        .attr("y", 20)
        .attr("width", 200)
        .attr("height", 80)
        .attr("rx", 8)
        .attr("fill", "rgba(20, 184, 166, 0.1)")
        .attr("stroke", "#14b8a6")
        .attr("stroke-width", 2);
      
      insightGroup.append("text")
        .attr("x", 30)
        .attr("y", 45)
        .attr("font-size", "14px")
        .attr("fill", "#14b8a6")
        .text("Seasonal Pattern:");
      
      insightGroup.append("text")
        .attr("x", 30)
        .attr("y", 65)
        .attr("font-size", "12px")
        .attr("fill", "#d1d5db")
        .text("• Warm summers");
      
      insightGroup.append("text")
        .attr("x", 30)
        .attr("y", 85)
        .attr("font-size", "12px")
        .attr("fill", "#d1d5db")
        .text("• Cold winters");
      
      setIsAnimating(false);
    }, 1500);
  }, [temperatureData]);
  
  const handleNextStage = () => {
    if (isAnimating) return;
    
    const newStage = stage + 1;
    setStage(newStage);
    
    requestAnimationFrame(() => {
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
    });
  };
  
  const resetAnimation = () => {
    setStage(0);
    setTemperatureData([]);
    setIsAnimating(false);
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll("*").remove();
    }
  };
  
  const stageDescriptions = [
    {
      title: "Welcome to Line Charts!",
      description: "Learn how line charts show changes and trends over time.",
      action: "Begin"
    },
    {
      title: "Data Points in Time",
      description: "Each point represents a measurement at a specific time.",
      action: "Connect the Dots"
    },
    {
      title: "Lines Show Trends",
      description: "Connecting points reveals how values change over time.",
      action: "Analyze Patterns"
    },
    {
      title: "Patterns and Insights",
      description: "Line charts help identify trends, cycles, and averages.",
      action: "Continue Learning"
    }
  ];
  
  return (
    <VisualizationContainer
      title="Line Chart Fundamentals"
      description="Discover how line charts reveal trends and patterns over time"
    >
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
      
      <GraphContainer height="500px" className="relative overflow-hidden">
        <svg 
          ref={svgRef} 
          className="w-full h-full" 
          style={{ background: 'transparent', minHeight: '500px', display: 'block' }} 
        />
        
        {stage === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md">
              <Calendar className="w-16 h-16 mx-auto text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">
                Tracking Changes Over Time
              </h2>
              <p className="text-gray-300">
                How do temperatures change throughout the year? 
                Line charts help us visualize trends and patterns in time-series data!
              </p>
            </div>
          </div>
        )}
      </GraphContainer>
      
      {stage === 3 && (
        <div className="mt-4 text-center">
          <p className="text-lg text-yellow-400 font-medium animate-fadeIn">
            Line charts are perfect for showing trends over time!
          </p>
        </div>
      )}
      
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
                {stageDescriptions[stage].action}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {stage === 3 && (
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
          <h4 className="font-semibold text-blue-400 mb-2">Key Takeaways</h4>
          <ul className="space-y-1 text-sm text-gray-300">
            <li>• Line charts connect data points to show trends over time</li>
            <li>• The slope of the line shows the rate of change</li>
            <li>• Patterns like cycles and seasonal variations become visible</li>
            <li>• Average lines help identify if values are above or below normal</li>
          </ul>
        </div>
      )}
    </VisualizationContainer>
  );
};

export default LineChartAnimation;