"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { VisualizationContainer, GraphContainer } from "@/components/ui/VisualizationContainer";
import { createColorScheme, cn } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { BarChart3, RotateCcw, ChevronRight } from "lucide-react";
import { useAnimationCleanup } from "@/hooks/useAnimationCleanup";

const colorScheme = createColorScheme('sampling');

const BarChartAnimation = () => {
  const [stage, setStage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [subjectData, setSubjectData] = useState([]);
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  useAnimationCleanup(animationRef);
  
  // Generate subject enrollment data
  const generateSubjectData = useCallback(() => {
    return [
      { subject: "Math", students: 120, color: "#14b8a6" },
      { subject: "Science", students: 95, color: "#60a5fa" },
      { subject: "English", students: 110, color: "#fbbf24" },
      { subject: "History", students: 75, color: "#a78bfa" },
      { subject: "Art", students: 60, color: "#f87171" },
      { subject: "Music", students: 45, color: "#34d399" }
    ];
  }, []);
  
  // Stage 1: Show data as numbers
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
      .text("Student Enrollment by Subject");
    
    // Generate data
    const data = generateSubjectData();
    setSubjectData(data);
    
    // Show as a table-like display
    const tableGroup = svg.append("g");
    
    data.forEach((d, i) => {
      const yPos = 100 + i * 60;
      
      // Subject name
      tableGroup.append("text")
        .attr("x", width / 3)
        .attr("y", yPos)
        .attr("text-anchor", "end")
        .attr("font-size", "16px")
        .attr("fill", d.color)
        .attr("opacity", 0)
        .text(d.subject + ":")
        .transition()
        .delay(i * 200)
        .duration(500)
        .attr("opacity", 1);
      
      // Student count
      tableGroup.append("text")
        .attr("x", width / 3 + 20)
        .attr("y", yPos)
        .attr("font-family", "monospace")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .attr("fill", "#ffffff")
        .attr("opacity", 0)
        .text(d.students + " students")
        .transition()
        .delay(i * 200 + 100)
        .duration(500)
        .attr("opacity", 1);
      
      // Visual representation with repeating icons
      const iconCount = Math.min(12, Math.floor(d.students / 10));
      for (let j = 0; j < iconCount; j++) {
        tableGroup.append("circle")
          .attr("cx", width / 2 + 50 + j * 15)
          .attr("cy", yPos - 5)
          .attr("r", 0)
          .attr("fill", d.color)
          .attr("opacity", 0.6)
          .transition()
          .delay(i * 200 + j * 30)
          .duration(300)
          .attr("r", 5);
      }
    });
    
    // Add question
    setTimeout(() => {
      const messageGroup = svg.append("g");
      
      messageGroup.append("rect")
        .attr("x", width / 2 - 200)
        .attr("y", height - 50)
        .attr("width", 400)
        .attr("height", 40)
        .attr("rx", 8)
        .attr("fill", "rgba(0, 0, 0, 0.8)")
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 1);
      
      messageGroup.append("text")
        .attr("x", width / 2)
        .attr("y", height - 25)
        .attr("text-anchor", "middle")
        .attr("class", "text-md")
        .attr("fill", "white")
        .attr("opacity", 0)
        .text("Which subject has the most students? It's hard to compare!")
        .transition()
        .duration(500)
        .attr("opacity", 1);
      
      setIsAnimating(false);
    }, 2000);
  }, [generateSubjectData]);
  
  // Stage 2: Transform to bar chart
  const stage2Animation = useCallback(() => {
    if (!svgRef.current || subjectData.length === 0) return;
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
      // Title
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .attr("class", "text-xl font-semibold")
        .attr("fill", "#ffffff")
        .text("Bar Charts Make Comparisons Easy!");
      
      const margin = { top: 80, right: 60, bottom: 100, left: 80 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Scales
      const xScale = d3.scaleBand()
        .domain(subjectData.map(d => d.subject))
        .range([0, innerWidth])
        .padding(0.2);
      
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(subjectData, d => d.students)])
        .nice()
        .range([innerHeight, 0]);
      
      // Draw axes
      const xAxis = g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));
      
      xAxis.selectAll("line").attr("stroke", "#9ca3af");
      xAxis.selectAll("path").attr("stroke", "#9ca3af");
      xAxis.selectAll("text")
        .attr("fill", "#e5e7eb")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");
      
      const yAxis = g.append("g")
        .call(d3.axisLeft(yScale));
      
      yAxis.selectAll("line").attr("stroke", "#9ca3af");
      yAxis.selectAll("path").attr("stroke", "#9ca3af");
      yAxis.selectAll("text").attr("fill", "#e5e7eb");
      
      // Grid lines
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
      
      // Animate bars growing
      const bars = g.selectAll(".bar")
        .data(subjectData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.subject))
        .attr("y", innerHeight)
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .attr("fill", d => d.color)
        .attr("opacity", 0.8);
      
      bars.transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr("y", d => yScale(d.students))
        .attr("height", d => innerHeight - yScale(d.students));
      
      // Add value labels on top of bars
      g.selectAll(".value-label")
        .data(subjectData)
        .enter().append("text")
        .attr("class", "value-label")
        .attr("x", d => xScale(d.subject) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.students) - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "#ffffff")
        .attr("opacity", 0)
        .text(d => d.students)
        .transition()
        .delay((d, i) => i * 100 + 400)
        .duration(300)
        .attr("opacity", 1);
      
      // Axis labels
      g.append("text")
        .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 80})`)
        .style("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .text("Subject");
      
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (innerHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .text("Number of Students");
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
    }, 600);
  }, [subjectData]);
  
  // Stage 3: Sort and highlight insights
  const stage3Animation = useCallback(() => {
    if (!svgRef.current || subjectData.length === 0) return;
    setIsAnimating(true);
    
    const svg = d3.select(svgRef.current);
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;
    
    // Update title
    svg.select("text")
      .transition()
      .duration(500)
      .text("Sorting Reveals Rankings Instantly!");
    
    const margin = { top: 80, right: 60, bottom: 100, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.select("g");
    
    // Sort data
    const sortedData = [...subjectData].sort((a, b) => b.students - a.students);
    
    // Update scales with sorted data
    const xScale = d3.scaleBand()
      .domain(sortedData.map(d => d.subject))
      .range([0, innerWidth])
      .padding(0.2);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(subjectData, d => d.students)])
      .nice()
      .range([innerHeight, 0]);
    
    // Transition bars to new positions
    g.selectAll(".bar")
      .transition()
      .duration(1000)
      .attr("x", d => xScale(d.subject));
    
    g.selectAll(".value-label")
      .transition()
      .duration(1000)
      .attr("x", d => xScale(d.subject) + xScale.bandwidth() / 2);
    
    // Update x-axis
    g.select(".axis--x")
      .transition()
      .duration(1000)
      .call(d3.axisBottom(xScale));
    
    // Highlight the highest and lowest
    setTimeout(() => {
      // Highlight highest
      g.append("rect")
        .attr("x", xScale(sortedData[0].subject) - 5)
        .attr("y", yScale(sortedData[0].students) - 5)
        .attr("width", xScale.bandwidth() + 10)
        .attr("height", innerHeight - yScale(sortedData[0].students) + 5)
        .attr("fill", "none")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 1);
      
      g.append("text")
        .attr("x", xScale(sortedData[0].subject) + xScale.bandwidth() / 2)
        .attr("y", yScale(sortedData[0].students) - 25)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#10b981")
        .attr("font-weight", "bold")
        .attr("opacity", 0)
        .text("Most Popular!")
        .transition()
        .duration(500)
        .attr("opacity", 1);
      
      // Add comparison insight
      const diff = sortedData[0].students - sortedData[sortedData.length - 1].students;
      
      const insightGroup = g.append("g");
      
      insightGroup.append("rect")
        .attr("x", innerWidth - 250)
        .attr("y", 20)
        .attr("width", 230)
        .attr("height", 80)
        .attr("rx", 8)
        .attr("fill", "rgba(20, 184, 166, 0.1)")
        .attr("stroke", "#14b8a6")
        .attr("stroke-width", 2);
      
      insightGroup.append("text")
        .attr("x", innerWidth - 135)
        .attr("y", 45)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#14b8a6")
        .text("Quick Insights:");
      
      insightGroup.append("text")
        .attr("x", innerWidth - 240)
        .attr("y", 70)
        .attr("font-size", "12px")
        .attr("fill", "#d1d5db")
        .text(`Range: ${diff} students`);
      
      insightGroup.append("text")
        .attr("x", innerWidth - 240)
        .attr("y", 90)
        .attr("font-size", "12px")
        .attr("fill", "#d1d5db")
        .text(`Top 3 have 65% of students`);
      
      setIsAnimating(false);
    }, 1200);
  }, [subjectData]);
  
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
    setSubjectData([]);
    setIsAnimating(false);
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll("*").remove();
    }
  };
  
  const stageDescriptions = [
    {
      title: "Welcome to Bar Charts!",
      description: "Learn how bar charts compare categories visually.",
      action: "Start Learning"
    },
    {
      title: "Comparing Categories",
      description: "When we have different groups, comparing numbers is challenging.",
      action: "Visualize as Bars"
    },
    {
      title: "Bars Make Comparisons Clear",
      description: "Height represents value - taller bars mean bigger numbers!",
      action: "Sort and Analyze"
    },
    {
      title: "Insights at a Glance",
      description: "Sorting and highlighting reveals patterns instantly.",
      action: "Continue Learning"
    }
  ];
  
  return (
    <VisualizationContainer
      title="Bar Chart Fundamentals"
      description="Discover how bar charts make categorical comparisons easy"
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
              <BarChart3 className="w-16 h-16 mx-auto text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">
                Comparing Different Categories
              </h2>
              <p className="text-gray-300">
                Which subject is most popular? Which has fewer students? 
                Bar charts make these comparisons visual and instant!
              </p>
            </div>
          </div>
        )}
      </GraphContainer>
      
      {stage === 3 && (
        <div className="mt-4 text-center">
          <p className="text-lg text-yellow-400 font-medium animate-fadeIn">
            Bar charts turn numbers into visual comparisons!
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
            <li>• Bar charts compare categorical (non-numeric) data</li>
            <li>• Bar height represents the value for each category</li>
            <li>• Sorting bars makes rankings immediately visible</li>
            <li>• Colors help distinguish between categories</li>
          </ul>
        </div>
      )}
    </VisualizationContainer>
  );
};

export default BarChartAnimation;