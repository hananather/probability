"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { VisualizationContainer, GraphContainer } from "@/components/ui/VisualizationContainer";
import { createColorScheme, cn } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { PieChart, RotateCcw, ChevronRight } from "lucide-react";
import { useAnimationCleanup } from "@/hooks/useAnimationCleanup";

const colorScheme = createColorScheme('sampling');

const PieChartAnimation = () => {
  const [stage, setStage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [budgetData, setBudgetData] = useState([]);
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  useAnimationCleanup(animationRef);
  
  // Generate budget data
  const generateBudgetData = useCallback(() => {
    return [
      { category: "Education", amount: 35, color: "#14b8a6" },
      { category: "Healthcare", amount: 25, color: "#60a5fa" },
      { category: "Infrastructure", amount: 20, color: "#fbbf24" },
      { category: "Defense", amount: 12, color: "#a78bfa" },
      { category: "Social Services", amount: 8, color: "#f87171" }
    ];
  }, []);
  
  // Stage 1: Show as percentages
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
      .text("City Budget Allocation (Total: $100M)");
    
    // Generate data
    const data = generateBudgetData();
    setBudgetData(data);
    
    // Show percentages as text
    const listGroup = svg.append("g");
    
    data.forEach((d, i) => {
      const yPos = 120 + i * 50;
      
      // Category
      listGroup.append("text")
        .attr("x", width / 3)
        .attr("y", yPos)
        .attr("text-anchor", "end")
        .attr("font-size", "16px")
        .attr("fill", d.color)
        .attr("opacity", 0)
        .text(d.category + ":")
        .transition()
        .delay(i * 200)
        .duration(500)
        .attr("opacity", 1);
      
      // Amount
      listGroup.append("text")
        .attr("x", width / 3 + 20)
        .attr("y", yPos)
        .attr("font-family", "monospace")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .attr("fill", "#ffffff")
        .attr("opacity", 0)
        .text(d.amount + "%")
        .transition()
        .delay(i * 200 + 100)
        .duration(500)
        .attr("opacity", 1);
      
      // Visual bar representation
      const barWidth = (d.amount / 100) * 200;
      listGroup.append("rect")
        .attr("x", width / 2 + 50)
        .attr("y", yPos - 15)
        .attr("width", 0)
        .attr("height", 20)
        .attr("fill", d.color)
        .attr("opacity", 0.6)
        .transition()
        .delay(i * 200 + 200)
        .duration(500)
        .attr("width", barWidth);
    });
    
    // Show total
    setTimeout(() => {
      listGroup.append("line")
        .attr("x1", width / 3 - 100)
        .attr("x2", width / 2 + 250)
        .attr("y1", 370)
        .attr("y2", 370)
        .attr("stroke", "#9ca3af")
        .attr("stroke-width", 1);
      
      listGroup.append("text")
        .attr("x", width / 3)
        .attr("y", 400)
        .attr("text-anchor", "end")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", "#10b981")
        .text("Total:");
      
      listGroup.append("text")
        .attr("x", width / 3 + 20)
        .attr("y", 400)
        .attr("font-family", "monospace")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .attr("fill", "#10b981")
        .text("100%");
    }, 1500);
    
    // Add question
    setTimeout(() => {
      const messageGroup = svg.append("g");
      
      messageGroup.append("rect")
        .attr("x", width / 2 - 250)
        .attr("y", height - 50)
        .attr("width", 500)
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
        .text("How can we visualize these parts of the whole budget?")
        .transition()
        .duration(500)
        .attr("opacity", 1);
      
      setIsAnimating(false);
    }, 2000);
  }, [generateBudgetData]);
  
  // Stage 2: Create slices
  const stage2Animation = useCallback(() => {
    if (!svgRef.current || budgetData.length === 0) return;
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
        .text("Building a Pie Chart: Each Slice Shows a Percentage");
      
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 3;
      
      const g = svg.append("g")
        .attr("transform", `translate(${centerX},${centerY})`);
      
      // Create pie layout
      const pie = d3.pie()
        .value(d => d.amount)
        .sort(null);
      
      const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(0); // Start with 0 radius
      
      const finalArc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);
      
      // Create slices
      const slices = g.selectAll(".slice")
        .data(pie(budgetData))
        .enter().append("g")
        .attr("class", "slice");
      
      // Add paths (slices)
      const paths = slices.append("path")
        .attr("d", arc)
        .attr("fill", d => d.data.color)
        .attr("stroke", "#f3f4f6")
        .attr("stroke-width", 2)
        .attr("opacity", 0.8);
      
      // Animate slices growing
      paths.transition()
        .duration(1000)
        .delay((d, i) => i * 200)
        .attrTween("d", function(d) {
          const interpolate = d3.interpolate(
            { startAngle: 0, endAngle: 0 },
            { startAngle: d.startAngle, endAngle: d.endAngle }
          );
          return function(t) {
            return finalArc(interpolate(t));
          };
        });
      
      // Add percentage labels
      setTimeout(() => {
        const labelArc = d3.arc()
          .innerRadius(radius * 0.6)
          .outerRadius(radius * 0.6);
        
        slices.append("text")
          .attr("transform", d => `translate(${labelArc.centroid(d)})`)
          .attr("text-anchor", "middle")
          .attr("font-size", "16px")
          .attr("font-weight", "bold")
          .attr("fill", "#ffffff")
          .attr("opacity", 0)
          .text(d => d.data.amount + "%")
          .transition()
          .duration(500)
          .attr("opacity", 1);
      }, 1500);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 2500);
    }, 600);
  }, [budgetData]);
  
  // Stage 3: Add labels and insights
  const stage3Animation = useCallback(() => {
    if (!svgRef.current || budgetData.length === 0) return;
    setIsAnimating(true);
    
    const svg = d3.select(svgRef.current);
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;
    
    // Update title
    svg.select("text")
      .transition()
      .duration(500)
      .text("Pie Charts Show Parts of a Whole!");
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    const g = svg.select("g");
    
    // Create legend
    const legendGroup = svg.append("g")
      .attr("transform", `translate(${width - 200}, 100)`);
    
    budgetData.forEach((d, i) => {
      const legendItem = legendGroup.append("g")
        .attr("transform", `translate(0, ${i * 30})`)
        .attr("opacity", 0);
      
      legendItem.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", d.color)
        .attr("opacity", 0.8);
      
      legendItem.append("text")
        .attr("x", 30)
        .attr("y", 15)
        .attr("font-size", "14px")
        .attr("fill", "#e5e7eb")
        .text(d.category);
      
      legendItem.transition()
        .delay(i * 100)
        .duration(500)
        .attr("opacity", 1);
    });
    
    // Highlight largest slice
    setTimeout(() => {
      const largestSlice = budgetData.reduce((max, d) => d.amount > max.amount ? d : max);
      
      // Find and explode the largest slice
      const pie = d3.pie()
        .value(d => d.amount)
        .sort(null);
      
      const pieData = pie(budgetData);
      const largestIndex = pieData.findIndex(d => d.data.category === largestSlice.category);
      
      const explodeArc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius + 10);
      
      const centroid = explodeArc.centroid(pieData[largestIndex]);
      const explodeX = centroid[0] * 0.1;
      const explodeY = centroid[1] * 0.1;
      
      g.selectAll(".slice")
        .filter((d, i) => i === largestIndex)
        .transition()
        .duration(500)
        .attr("transform", `translate(${explodeX},${explodeY})`);
      
      // Add annotation
      const annotationGroup = svg.append("g");
      
      annotationGroup.append("line")
        .attr("x1", centerX + centroid[0] * 0.8)
        .attr("y1", centerY + centroid[1] * 0.8)
        .attr("x2", centerX - 150)
        .attr("y2", 100)
        .attr("stroke", "#14b8a6")
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 1);
      
      annotationGroup.append("rect")
        .attr("x", 50)
        .attr("y", 80)
        .attr("width", 200)
        .attr("height", 60)
        .attr("rx", 8)
        .attr("fill", "rgba(20, 184, 166, 0.1)")
        .attr("stroke", "#14b8a6")
        .attr("stroke-width", 2);
      
      annotationGroup.append("text")
        .attr("x", 150)
        .attr("y", 105)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#14b8a6")
        .text("Largest allocation:");
      
      annotationGroup.append("text")
        .attr("x", 150)
        .attr("y", 125)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#d1d5db")
        .text(`${largestSlice.category} (${largestSlice.amount}%)`);
      
      setIsAnimating(false);
    }, 800);
    
    // Add insights
    setTimeout(() => {
      const insightGroup = svg.append("g");
      
      insightGroup.append("rect")
        .attr("x", width / 2 - 150)
        .attr("y", height - 60)
        .attr("width", 300)
        .attr("height", 40)
        .attr("rx", 8)
        .attr("fill", "rgba(0, 0, 0, 0.8)");
      
      insightGroup.append("text")
        .attr("x", width / 2)
        .attr("y", height - 35)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#fbbf24")
        .text("60% of budget goes to Education & Healthcare!");
    }, 1200);
  }, [budgetData]);
  
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
    setBudgetData([]);
    setIsAnimating(false);
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll("*").remove();
    }
  };
  
  const stageDescriptions = [
    {
      title: "Welcome to Pie Charts!",
      description: "Learn how pie charts show parts of a whole.",
      action: "Begin"
    },
    {
      title: "Parts of the Whole",
      description: "When we have percentages that add up to 100%, we need a special visualization.",
      action: "Create Slices"
    },
    {
      title: "Slices Represent Proportions",
      description: "Each slice's size shows its percentage of the total.",
      action: "Add Details"
    },
    {
      title: "Complete Picture at a Glance",
      description: "Pie charts make it easy to see which parts are largest.",
      action: "Continue Learning"
    }
  ];
  
  return (
    <VisualizationContainer
      title="Pie Chart Fundamentals"
      description="Discover how pie charts visualize parts of a whole"
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
              <PieChart className="w-16 h-16 mx-auto text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">
                Visualizing Parts of a Whole
              </h2>
              <p className="text-gray-300">
                How is the city budget divided? What gets the most funding? 
                Pie charts show proportions as slices of a circle!
              </p>
            </div>
          </div>
        )}
      </GraphContainer>
      
      {stage === 3 && (
        <div className="mt-4 text-center">
          <p className="text-lg text-yellow-400 font-medium animate-fadeIn">
            Pie charts make proportions instantly visible!
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
            <li>• Pie charts show parts of a whole (must add up to 100%)</li>
            <li>• Slice size represents the proportion of each category</li>
            <li>• Best for showing 2-7 categories (too many becomes confusing)</li>
            <li>• Colors and labels help identify each category</li>
          </ul>
        </div>
      )}
    </VisualizationContainer>
  );
};

export default PieChartAnimation;