"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { VisualizationContainer, GraphContainer } from "@/components/ui/VisualizationContainer";
import { createColorScheme, cn } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { Box, RotateCcw, ChevronRight } from "lucide-react";
import { useAnimationCleanup } from "@/hooks/useAnimationCleanup";

const colorScheme = createColorScheme('sampling');

const BoxPlotAnimation = () => {
  const [stage, setStage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [examScores, setExamScores] = useState([]);
  const [quartiles, setQuartiles] = useState({});
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  useAnimationCleanup(animationRef);
  
  // Generate exam score data with some outliers
  const generateExamScores = useCallback(() => {
    const scores = [];
    
    // Main distribution (most students)
    for (let i = 0; i < 45; i++) {
      const score = 60 + Math.random() * 30; // Scores between 60-90
      scores.push(Math.round(score));
    }
    
    // Some low performers
    for (let i = 0; i < 3; i++) {
      scores.push(Math.round(35 + Math.random() * 15));
    }
    
    // Some high performers
    for (let i = 0; i < 2; i++) {
      scores.push(Math.round(92 + Math.random() * 8));
    }
    
    return scores.sort((a, b) => a - b);
  }, []);
  
  // Calculate quartiles
  const calculateQuartiles = (data) => {
    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    
    const q1 = d3.quantile(sorted, 0.25);
    const median = d3.quantile(sorted, 0.5);
    const q3 = d3.quantile(sorted, 0.75);
    const iqr = q3 - q1;
    
    const min = d3.min(sorted);
    const max = d3.max(sorted);
    
    // Whisker ends (1.5 * IQR rule)
    const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
    const upperWhisker = Math.min(max, q3 + 1.5 * iqr);
    
    // Outliers
    const outliers = sorted.filter(d => d < lowerWhisker || d > upperWhisker);
    
    return { q1, median, q3, iqr, min, max, lowerWhisker, upperWhisker, outliers };
  };
  
  // Stage 1: Show all data points
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
      .text("Class Exam Scores (50 Students)");
    
    // Generate and sort data
    const scores = generateExamScores();
    setExamScores(scores);
    
    const stats = calculateQuartiles(scores);
    setQuartiles(stats);
    
    // Create visualization area
    const margin = { top: 100, right: 60, bottom: 100, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scale
    const xScale = d3.scaleLinear()
      .domain([30, 100])
      .range([0, innerWidth]);
    
    // Draw axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight / 2})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("line").attr("stroke", "#9ca3af");
    xAxis.selectAll("path").attr("stroke", "#9ca3af");
    xAxis.selectAll("text").attr("fill", "#e5e7eb");
    
    // Show all data points as dots
    const dots = g.selectAll("circle")
      .data(scores)
      .enter().append("circle")
      .attr("cx", d => xScale(d))
      .attr("cy", innerHeight / 2)
      .attr("r", 0)
      .attr("fill", "#14b8a6")
      .attr("opacity", 0.6);
    
    // Animate dots appearing with jitter for visibility
    dots.transition()
      .duration(800)
      .delay((d, i) => i * 20)
      .attr("cy", (d, i) => innerHeight / 2 + (Math.random() - 0.5) * 100)
      .attr("r", 4);
    
    // Add score label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .text("Exam Score (%)");
    
    // Show statistics
    setTimeout(() => {
      const statsGroup = svg.append("g");
      
      statsGroup.append("rect")
        .attr("x", width / 2 - 150)
        .attr("y", height - 60)
        .attr("width", 300)
        .attr("height", 40)
        .attr("rx", 8)
        .attr("fill", "rgba(0, 0, 0, 0.8)");
      
      statsGroup.append("text")
        .attr("x", width / 2)
        .attr("y", height - 35)
        .attr("text-anchor", "middle")
        .attr("fill", "#d1d5db")
        .text(`Range: ${stats.min} - ${stats.max} | Average: ${d3.mean(scores).toFixed(1)}`);
      
      setIsAnimating(false);
    }, 2000);
  }, [generateExamScores]);
  
  // Stage 2: Highlight quartiles
  const stage2Animation = useCallback(() => {
    if (!svgRef.current || examScores.length === 0) return;
    setIsAnimating(true);
    
    const svg = d3.select(svgRef.current);
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;
    
    // Update title
    svg.select("text")
      .transition()
      .duration(500)
      .text("Finding the Five Key Numbers");
    
    const margin = { top: 100, right: 60, bottom: 100, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.select("g");
    
    const xScale = d3.scaleLinear()
      .domain([30, 100])
      .range([0, innerWidth]);
    
    // Fade out some dots
    g.selectAll("circle")
      .transition()
      .duration(500)
      .attr("opacity", 0.2)
      .attr("cy", innerHeight / 2);
    
    // Highlight quartile values
    const keyValues = [quartiles.min, quartiles.q1, quartiles.median, quartiles.q3, quartiles.max];
    const keyLabels = ["Min", "Q1", "Median", "Q3", "Max"];
    const keyColors = ["#60a5fa", "#14b8a6", "#fbbf24", "#14b8a6", "#60a5fa"];
    
    keyValues.forEach((val, i) => {
      // Vertical line
      g.append("line")
        .attr("x1", xScale(val))
        .attr("x2", xScale(val))
        .attr("y1", innerHeight / 2 - 60)
        .attr("y2", innerHeight / 2 - 60)
        .attr("stroke", keyColors[i])
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .transition()
        .delay(i * 300)
        .duration(500)
        .attr("y2", innerHeight / 2 + 60)
        .attr("opacity", 1);
      
      // Label
      g.append("text")
        .attr("x", xScale(val))
        .attr("y", innerHeight / 2 - 70)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", keyColors[i])
        .attr("opacity", 0)
        .text(keyLabels[i])
        .transition()
        .delay(i * 300 + 200)
        .duration(300)
        .attr("opacity", 1);
      
      // Value
      g.append("text")
        .attr("x", xScale(val))
        .attr("y", innerHeight / 2 + 80)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#d1d5db")
        .attr("opacity", 0)
        .text(val)
        .transition()
        .delay(i * 300 + 200)
        .duration(300)
        .attr("opacity", 1);
    });
    
    // Show quartile explanation
    setTimeout(() => {
      const explanationGroup = svg.append("g");
      
      explanationGroup.append("rect")
        .attr("x", 50)
        .attr("y", 80)
        .attr("width", 200)
        .attr("height", 100)
        .attr("rx", 8)
        .attr("fill", "rgba(20, 184, 166, 0.1)")
        .attr("stroke", "#14b8a6")
        .attr("stroke-width", 2);
      
      explanationGroup.append("text")
        .attr("x", 60)
        .attr("y", 105)
        .attr("font-size", "14px")
        .attr("fill", "#14b8a6")
        .text("Quartiles divide data:");
      
      const explanations = [
        "25% below Q1",
        "50% below Median",
        "75% below Q3"
      ];
      
      explanations.forEach((text, i) => {
        explanationGroup.append("text")
          .attr("x", 60)
          .attr("y", 130 + i * 20)
          .attr("font-size", "12px")
          .attr("fill", "#d1d5db")
          .text(`• ${text}`);
      });
      
      setIsAnimating(false);
    }, 2000);
  }, [examScores, quartiles]);
  
  // Stage 3: Transform to box plot
  const stage3Animation = useCallback(() => {
    if (!svgRef.current || examScores.length === 0) return;
    setIsAnimating(true);
    
    const svg = d3.select(svgRef.current);
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;
    
    // Clear previous content
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
        .attr("fill", "#ffffff")
        .text("The Box Plot: A Five-Number Summary");
      
      const margin = { top: 100, right: 60, bottom: 100, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      const xScale = d3.scaleLinear()
        .domain([30, 100])
        .range([0, innerWidth]);
      
      const boxHeight = 60;
      const boxY = innerHeight / 2 - boxHeight / 2;
      
      // Draw axis
      const xAxis = g.append("g")
        .attr("transform", `translate(0,${innerHeight / 2 + boxHeight})`)
        .call(d3.axisBottom(xScale));
      
      xAxis.selectAll("line").attr("stroke", "#9ca3af");
      xAxis.selectAll("path").attr("stroke", "#9ca3af");
      xAxis.selectAll("text").attr("fill", "#e5e7eb");
      
      // Draw box plot components with animation
      
      // Center line (for whiskers)
      g.append("line")
        .attr("x1", xScale(quartiles.lowerWhisker))
        .attr("x2", xScale(quartiles.lowerWhisker))
        .attr("y1", innerHeight / 2)
        .attr("y2", innerHeight / 2)
        .attr("stroke", "#9ca3af")
        .attr("stroke-width", 1)
        .transition()
        .duration(800)
        .attr("x2", xScale(quartiles.upperWhisker));
      
      // Box
      const box = g.append("rect")
        .attr("x", xScale(quartiles.q1))
        .attr("y", boxY)
        .attr("width", 0)
        .attr("height", boxHeight)
        .attr("fill", "#14b8a6")
        .attr("fill-opacity", 0.3)
        .attr("stroke", "#14b8a6")
        .attr("stroke-width", 2);
      
      box.transition()
        .delay(400)
        .duration(800)
        .attr("width", xScale(quartiles.q3) - xScale(quartiles.q1));
      
      // Median line
      g.append("line")
        .attr("x1", xScale(quartiles.median))
        .attr("x2", xScale(quartiles.median))
        .attr("y1", boxY)
        .attr("y2", boxY)
        .attr("stroke", "#fbbf24")
        .attr("stroke-width", 3)
        .attr("opacity", 0)
        .transition()
        .delay(1200)
        .duration(500)
        .attr("y2", boxY + boxHeight)
        .attr("opacity", 1);
      
      // Whiskers
      setTimeout(() => {
        // Lower whisker end
        g.append("line")
          .attr("x1", xScale(quartiles.lowerWhisker))
          .attr("x2", xScale(quartiles.lowerWhisker))
          .attr("y1", innerHeight / 2 - 15)
          .attr("y2", innerHeight / 2 + 15)
          .attr("stroke", "#9ca3af")
          .attr("stroke-width", 2);
        
        // Upper whisker end
        g.append("line")
          .attr("x1", xScale(quartiles.upperWhisker))
          .attr("x2", xScale(quartiles.upperWhisker))
          .attr("y1", innerHeight / 2 - 15)
          .attr("y2", innerHeight / 2 + 15)
          .attr("stroke", "#9ca3af")
          .attr("stroke-width", 2);
      }, 800);
      
      // Outliers
      setTimeout(() => {
        g.selectAll(".outlier")
          .data(quartiles.outliers)
          .enter().append("circle")
          .attr("class", "outlier")
          .attr("cx", d => xScale(d))
          .attr("cy", innerHeight / 2)
          .attr("r", 0)
          .attr("fill", "none")
          .attr("stroke", "#ef4444")
          .attr("stroke-width", 2)
          .transition()
          .duration(500)
          .attr("r", 5);
      }, 1600);
      
      // Add labels
      setTimeout(() => {
        // IQR label
        g.append("text")
          .attr("x", xScale((quartiles.q1 + quartiles.q3) / 2))
          .attr("y", boxY - 10)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "#14b8a6")
          .text("IQR (Middle 50%)");
        
        // Outlier label if exists
        if (quartiles.outliers.length > 0) {
          g.append("text")
            .attr("x", xScale(quartiles.outliers[0]) + 10)
            .attr("y", innerHeight / 2 - 20)
            .attr("font-size", "12px")
            .attr("fill", "#ef4444")
            .text("Outliers");
        }
        
        setIsAnimating(false);
      }, 2000);
      
      // Add score label
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 60)
        .attr("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .text("Exam Score (%)");
    }, 600);
  }, [examScores, quartiles]);
  
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
    setExamScores([]);
    setQuartiles({});
    setIsAnimating(false);
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll("*").remove();
    }
  };
  
  const stageDescriptions = [
    {
      title: "Welcome to Box Plots!",
      description: "Learn how box plots summarize data distributions.",
      action: "Begin"
    },
    {
      title: "Visualizing All the Data",
      description: "Each dot represents one student's exam score.",
      action: "Find Key Values"
    },
    {
      title: "The Five-Number Summary",
      description: "Min, Q1, Median, Q3, and Max divide the data into quarters.",
      action: "Create Box Plot"
    },
    {
      title: "The Complete Box Plot",
      description: "A compact way to show distribution, spread, and outliers.",
      action: "Continue Learning"
    }
  ];
  
  return (
    <VisualizationContainer
      title="Box Plot Fundamentals"
      description="Discover how box plots summarize data distributions"
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
              <Box className="w-16 h-16 mx-auto text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">
                Summarizing Data Distributions
              </h2>
              <p className="text-gray-300">
                How can we quickly understand the spread and center of exam scores? 
                Box plots provide a five-number summary at a glance!
              </p>
            </div>
          </div>
        )}
      </GraphContainer>
      
      {stage === 3 && (
        <div className="mt-4 text-center">
          <p className="text-lg text-yellow-400 font-medium animate-fadeIn">
            Box plots show distribution, spread, and outliers at a glance!
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
            <li>• Box plots show the five-number summary: Min, Q1, Median, Q3, Max</li>
            <li>• The box contains the middle 50% of data (IQR)</li>
            <li>• Whiskers extend to the furthest non-outlier points</li>
            <li>• Outliers are shown as individual points beyond the whiskers</li>
          </ul>
        </div>
      )}
    </VisualizationContainer>
  );
};

export default BoxPlotAnimation;