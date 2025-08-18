"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { VisualizationContainer, GraphContainer } from "@/components/ui/VisualizationContainer";
import { createColorScheme, cn } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { TrendingUp, Play, RotateCcw, ChevronRight } from "lucide-react";
import { useAnimationCleanup } from "@/hooks/useAnimationCleanup";

const colorScheme = createColorScheme('sampling');

const ScatterPlotAnimation = () => {
  const [stage, setStage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dataPoints, setDataPoints] = useState([]);
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  useAnimationCleanup(animationRef);
  
  // Generate correlated data (study hours vs test scores)
  const generateStudyData = useCallback(() => {
    const data = [];
    for (let i = 0; i < 50; i++) {
      const studyHours = Math.random() * 10; // 0-10 hours
      // Test score correlated with study hours + some noise
      const baseScore = 50 + studyHours * 4;
      const noise = (Math.random() - 0.5) * 15;
      const testScore = Math.max(40, Math.min(100, baseScore + noise));
      
      data.push({
        id: i,
        x: studyHours,
        y: testScore,
        label: `Student ${i + 1}`
      });
    }
    return data;
  }, []);
  
  // Stage 1: Show individual data as table
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
      .text("Study Hours vs Test Scores");
    
    // Generate data
    const data = generateStudyData();
    setDataPoints(data);
    
    // Show as table format first
    const tableGroup = svg.append("g");
    
    // Table headers
    tableGroup.append("text")
      .attr("x", width / 3)
      .attr("y", 100)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("fill", "#14b8a6")
      .text("Study Hours");
    
    tableGroup.append("text")
      .attr("x", 2 * width / 3)
      .attr("y", 100)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("fill", "#14b8a6")
      .text("Test Score");
    
    // Show first 10 rows
    data.slice(0, 10).forEach((d, i) => {
      tableGroup.append("text")
        .attr("x", width / 3)
        .attr("y", 130 + i * 25)
        .attr("text-anchor", "middle")
        .attr("font-family", "monospace")
        .attr("font-size", "14px")
        .attr("fill", "#d1d5db")
        .attr("opacity", 0)
        .text(d.x.toFixed(1) + " hrs")
        .transition()
        .delay(i * 100)
        .duration(300)
        .attr("opacity", 1);
      
      tableGroup.append("text")
        .attr("x", 2 * width / 3)
        .attr("y", 130 + i * 25)
        .attr("text-anchor", "middle")
        .attr("font-family", "monospace")
        .attr("font-size", "14px")
        .attr("fill", "#d1d5db")
        .attr("opacity", 0)
        .text(d.y.toFixed(0) + "%")
        .transition()
        .delay(i * 100)
        .duration(300)
        .attr("opacity", 1);
    });
    
    // Add "more data" indicator
    setTimeout(() => {
      tableGroup.append("text")
        .attr("x", width / 2)
        .attr("y", 380)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", "#d1d5db")
        .attr("opacity", 0)
        .text("...and 40 more students")
        .transition()
        .duration(500)
        .attr("opacity", 1);
    }, 1200);
    
    // Add question
    setTimeout(() => {
      const messageGroup = svg.append("g");
      
      messageGroup.append("rect")
        .attr("x", width / 2 - 250)
        .attr("y", 410)
        .attr("width", 500)
        .attr("height", 50)
        .attr("rx", 8)
        .attr("fill", "rgba(0, 0, 0, 0.8)")
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 1);
      
      messageGroup.append("text")
        .attr("x", width / 2)
        .attr("y", 440)
        .attr("text-anchor", "middle")
        .attr("class", "text-lg")
        .attr("fill", "white")
        .attr("opacity", 0)
        .text("Is there a relationship between study time and scores?")
        .transition()
        .duration(500)
        .attr("opacity", 1);
      
      setIsAnimating(false);
    }, 2000);
  }, [generateStudyData]);
  
  // Stage 2: Plot points on axes
  const stage2Animation = useCallback(() => {
    if (!svgRef.current) return;
    setIsAnimating(true);
    
    const svg = d3.select(svgRef.current);
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;
    
    svg.selectAll("*")
      .transition()
      .duration(500)
      .attr("opacity", 0)
      .remove();
    
    setTimeout(() => {
      const margin = { top: 80, right: 60, bottom: 80, left: 80 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Title
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("class", "text-xl font-semibold")
        .attr("fill", "#ffffff")
        .text("Let's Plot Each Student as a Point");
      
      // Scales
      const xScale = d3.scaleLinear()
        .domain([0, 10])
        .range([0, innerWidth]);
      
      const yScale = d3.scaleLinear()
        .domain([40, 100])
        .range([innerHeight, 0]);
      
      // Draw axes first
      const xAxis = g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));
      
      xAxis.selectAll("line").attr("stroke", "#9ca3af");
      xAxis.selectAll("path").attr("stroke", "#9ca3af");
      xAxis.selectAll("text").attr("fill", "#e5e7eb");
      
      const yAxis = g.append("g")
        .call(d3.axisLeft(yScale));
      
      yAxis.selectAll("line").attr("stroke", "#9ca3af");
      yAxis.selectAll("path").attr("stroke", "#9ca3af");
      yAxis.selectAll("text").attr("fill", "#e5e7eb");
      
      // Grid lines
      g.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale)
          .tickSize(-innerHeight)
          .tickFormat("")
        )
        .style("stroke-dasharray", ("3,3"))
        .style("opacity", 0.3)
        .selectAll("line")
        .attr("stroke", "#4b5563");
      
      g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat("")
        )
        .style("stroke-dasharray", ("3,3"))
        .style("opacity", 0.3)
        .selectAll("line")
        .attr("stroke", "#4b5563");
      
      // Animate points appearing
      const points = g.selectAll("circle")
        .data(dataPoints)
        .enter().append("circle")
        .attr("cx", d => xScale(d.x))
        .attr("cy", innerHeight / 2)
        .attr("r", 0)
        .attr("fill", "#14b8a6")
        .attr("stroke", "#f3f4f6")
        .attr("stroke-width", 1)
        .attr("opacity", 0.7);
      
      points.transition()
        .duration(800)
        .delay((d, i) => i * 20)
        .attr("cy", d => yScale(d.y))
        .attr("r", 5);
      
      // Axis labels
      g.append("text")
        .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 60})`)
        .style("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .text("Study Hours");
      
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (innerHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .text("Test Score (%)");
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
    }, 600);
  }, [dataPoints]);
  
  // Stage 3: Show correlation with trend line
  const stage3Animation = useCallback(() => {
    if (!svgRef.current || dataPoints.length === 0) return;
    setIsAnimating(true);
    
    const svg = d3.select(svgRef.current);
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;
    
    // Update title
    svg.select("text")
      .transition()
      .duration(500)
      .text("The Pattern Reveals a Relationship!");
    
    const margin = { top: 80, right: 60, bottom: 80, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.select("g");
    
    // Calculate trend line using simple linear regression
    const xMean = d3.mean(dataPoints, d => d.x);
    const yMean = d3.mean(dataPoints, d => d.y);
    
    let num = 0, den = 0;
    dataPoints.forEach(d => {
      num += (d.x - xMean) * (d.y - yMean);
      den += (d.x - xMean) * (d.x - xMean);
    });
    
    const slope = num / den;
    const intercept = yMean - slope * xMean;
    
    const xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([40, 100])
      .range([innerHeight, 0]);
    
    // Draw trend line
    const trendLine = g.append("line")
      .attr("x1", xScale(0))
      .attr("y1", yScale(intercept))
      .attr("x2", xScale(0))
      .attr("y2", yScale(intercept))
      .attr("stroke", "#fbbf24")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.8);
    
    trendLine.transition()
      .duration(1500)
      .attr("x2", xScale(10))
      .attr("y2", yScale(slope * 10 + intercept));
    
    // Highlight correlation
    setTimeout(() => {
      // Add correlation annotation
      g.append("rect")
        .attr("x", innerWidth - 200)
        .attr("y", 20)
        .attr("width", 180)
        .attr("height", 60)
        .attr("rx", 8)
        .attr("fill", "rgba(20, 184, 166, 0.1)")
        .attr("stroke", "#14b8a6")
        .attr("stroke-width", 2);
      
      g.append("text")
        .attr("x", innerWidth - 110)
        .attr("y", 45)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#14b8a6")
        .text("Positive Correlation!");
      
      g.append("text")
        .attr("x", innerWidth - 110)
        .attr("y", 65)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#d1d5db")
        .text("More study = Higher scores");
      
      setIsAnimating(false);
    }, 1800);
  }, [dataPoints]);
  
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
    setDataPoints([]);
    setIsAnimating(false);
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll("*").remove();
    }
  };
  
  const stageDescriptions = [
    {
      title: "Welcome to Scatter Plots!",
      description: "Learn how scatter plots reveal relationships between two variables.",
      action: "Begin"
    },
    {
      title: "Two Variables, Many Questions",
      description: "When we have two measurements per item, how can we see if they're related?",
      action: "Visualize the Data"
    },
    {
      title: "Each Point Tells a Story",
      description: "By plotting points on two axes, patterns become visible!",
      action: "Find the Pattern"
    },
    {
      title: "Correlation Revealed",
      description: "The trend line shows the relationship between variables.",
      action: "Continue Learning"
    }
  ];
  
  return (
    <VisualizationContainer
      title="Scatter Plot Fundamentals"
      description="Discover how scatter plots reveal relationships in data"
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
              <TrendingUp className="w-16 h-16 mx-auto text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">
                Finding Relationships in Data
              </h2>
              <p className="text-gray-300">
                How can we tell if studying more leads to better test scores? 
                Scatter plots help us see connections between different measurements!
              </p>
            </div>
          </div>
        )}
      </GraphContainer>
      
      {stage === 3 && (
        <div className="mt-4 text-center">
          <p className="text-lg text-yellow-400 font-medium animate-fadeIn">
            Scatter plots reveal correlations between variables!
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
            <li>• Scatter plots show relationships between two continuous variables</li>
            <li>• Each point represents one observation with two measurements</li>
            <li>• Patterns in the cloud of points reveal correlations</li>
            <li>• Trend lines help visualize the overall relationship</li>
          </ul>
        </div>
      )}
    </VisualizationContainer>
  );
};

export default ScatterPlotAnimation;