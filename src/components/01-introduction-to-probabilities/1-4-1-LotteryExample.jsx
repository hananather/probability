"use client";
import React, { useState, useRef, useEffect } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer
} from '../ui/VisualizationContainer';
import { colors, typography, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';

const colorScheme = createColorScheme('probability');

export function LotteryExample() {
  const [step, setStep] = useState(0);
  const [selectedBalls, setSelectedBalls] = useState([]);
  const svgRef = useRef(null);

  // Animation steps for the derivation
  const steps = [
    {
      title: "Step 1: First Choice",
      description: "For the first ball, we have 49 choices",
      formula: "49",
      visual: "show-all"
    },
    {
      title: "Step 2: Second Choice", 
      description: "For the second ball, we have 48 remaining choices",
      formula: "49 × 48",
      visual: "show-two"
    },
    {
      title: "Step 3: Continue Pattern",
      description: "This continues for all 6 balls",
      formula: "49 × 48 × 47 × 46 × 45 × 44",
      visual: "show-six"
    },
    {
      title: "Step 4: Order Doesn't Matter!",
      description: "But wait! These 6 balls can be arranged in 6! = 720 different ways",
      formula: "\\frac{49 × 48 × 47 × 46 × 45 × 44}{6!}",
      visual: "show-permutations"
    },
    {
      title: "Final Result",
      description: "This gives us the combination formula",
      formula: "\\binom{49}{6} = \\frac{49!}{6!(49-6)!} = 13,983,816",
      visual: "show-result"
    }
  ];

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 400;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${width/2}, ${height/2})`);
    
    const currentStep = steps[step];
    
    if (currentStep.visual === "show-all") {
      // Show all 49 balls in a grid
      const cols = 7;
      const rows = 7;
      const ballRadius = 15;
      const spacing = 35;
      
      for (let i = 0; i < 49; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = (col - cols/2 + 0.5) * spacing;
        const y = (row - rows/2 + 0.5) * spacing;
        
        const ballGroup = g.append("g")
          .attr("transform", `translate(${x}, ${y})`);
        
        ballGroup.append("circle")
          .attr("r", ballRadius)
          .attr("fill", "#1a1a1a")
          .attr("stroke", colorScheme.chart.primary)
          .attr("stroke-width", 1)
          .style("opacity", 0)
          .transition()
          .delay(i * 10)
          .duration(300)
          .style("opacity", 1);
        
        ballGroup.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", colors.chart.text)
          .style("font-size", "10px")
          .style("font-family", "monospace")
          .style("opacity", 0)
          .text(i + 1)
          .transition()
          .delay(i * 10)
          .duration(300)
          .style("opacity", 1);
      }
      
    } else if (currentStep.visual === "show-two") {
      // Show selection process for first two balls
      const selectedNums = [7, 23]; // Example selections
      const ballRadius = 30;
      const spacing = 80;
      
      selectedNums.forEach((num, i) => {
        const x = (i - 0.5) * spacing;
        
        const ballGroup = g.append("g")
          .attr("transform", `translate(${x}, 0)`);
        
        // Ball
        ballGroup.append("circle")
          .attr("r", ballRadius)
          .attr("fill", colorScheme.chart.primary)
          .attr("stroke", colorScheme.chart.primary)
          .attr("stroke-width", 2)
          .style("opacity", 0)
          .transition()
          .delay(i * 500)
          .duration(500)
          .style("opacity", 1);
        
        // Number
        ballGroup.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", "white")
          .style("font-size", "20px")
          .style("font-weight", "600")
          .style("font-family", "monospace")
          .style("opacity", 0)
          .text(num)
          .transition()
          .delay(i * 500)
          .duration(500)
          .style("opacity", 1);
        
        // Position label
        ballGroup.append("text")
          .attr("text-anchor", "middle")
          .attr("y", ballRadius + 25)
          .attr("fill", colors.chart.text)
          .style("font-size", "14px")
          .style("opacity", 0)
          .text(`Ball ${i + 1}`)
          .transition()
          .delay(i * 500)
          .duration(500)
          .style("opacity", 1);
      });
      
    } else if (currentStep.visual === "show-six") {
      // Show all 6 selected balls
      const selectedNums = [7, 23, 14, 31, 42, 3];
      const ballRadius = 25;
      const cols = 3;
      const spacing = 70;
      
      selectedNums.forEach((num, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = (col - 1) * spacing;
        const y = (row - 0.5) * spacing;
        
        const ballGroup = g.append("g")
          .attr("transform", `translate(${x}, ${y})`);
        
        ballGroup.append("circle")
          .attr("r", ballRadius)
          .attr("fill", colorScheme.chart.primary)
          .style("opacity", 0)
          .transition()
          .delay(i * 100)
          .duration(300)
          .style("opacity", 1);
        
        ballGroup.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", "white")
          .style("font-size", "18px")
          .style("font-weight", "600")
          .style("font-family", "monospace")
          .style("opacity", 0)
          .text(num)
          .transition()
          .delay(i * 100)
          .duration(300)
          .style("opacity", 1);
      });
      
    } else if (currentStep.visual === "show-permutations") {
      // Show different arrangements of the same 6 balls
      const arrangements = [
        [3, 7, 14, 23, 31, 42],
        [7, 3, 23, 14, 42, 31],
        [14, 23, 3, 42, 7, 31],
        [31, 42, 7, 3, 23, 14]
      ];
      
      const ballRadius = 12;
      const ballSpacing = 30;
      const rowSpacing = 50;
      
      arrangements.forEach((arr, row) => {
        const y = (row - 1.5) * rowSpacing;
        
        arr.forEach((num, col) => {
          const x = (col - 2.5) * ballSpacing;
          
          const ballGroup = g.append("g")
            .attr("transform", `translate(${x}, ${y})`);
          
          ballGroup.append("circle")
            .attr("r", ballRadius)
            .attr("fill", row === 0 ? colorScheme.chart.primary : "#1a1a1a")
            .attr("stroke", colorScheme.chart.primary)
            .attr("stroke-width", 1)
            .style("opacity", 0)
            .transition()
            .delay(row * 200 + col * 30)
            .duration(300)
            .style("opacity", row === 0 ? 1 : 0.6);
          
          ballGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", row === 0 ? "white" : colors.chart.text)
            .style("font-size", "10px")
            .style("font-family", "monospace")
            .style("opacity", 0)
            .text(num)
            .transition()
            .delay(row * 200 + col * 30)
            .duration(300)
            .style("opacity", row === 0 ? 1 : 0.6);
        });
        
        if (row < arrangements.length - 1) {
          g.append("text")
            .attr("x", ballSpacing * 3.5)
            .attr("y", y)
            .attr("text-anchor", "start")
            .attr("dy", "0.35em")
            .attr("fill", colorScheme.chart.secondary)
            .style("font-size", "16px")
            .style("opacity", 0)
            .text("=")
            .transition()
            .delay((row + 1) * 200)
            .duration(300)
            .style("opacity", 1);
        }
      });
      
      // Add "... and 716 more!" text
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 120)
        .attr("fill", colors.chart.text)
        .style("font-size", "14px")
        .style("opacity", 0)
        .text("... and 716 more arrangements!")
        .transition()
        .delay(1000)
        .duration(500)
        .style("opacity", 1);
        
    } else if (currentStep.visual === "show-result") {
      // Show final result with comparison
      const comparisons = [
        { label: "Lottery combinations", value: "13,983,816", highlight: true },
        { label: "Seconds in a year", value: "31,536,000", highlight: false },
        { label: "People in NYC", value: "8,336,000", highlight: false }
      ];
      
      const spacing = 60;
      
      comparisons.forEach((comp, i) => {
        const y = (i - 1) * spacing;
        
        const group = g.append("g")
          .attr("transform", `translate(0, ${y})`);
        
        // Background rect
        if (comp.highlight) {
          group.append("rect")
            .attr("x", -150)
            .attr("y", -25)
            .attr("width", 300)
            .attr("height", 50)
            .attr("rx", 8)
            .attr("fill", colorScheme.chart.primary)
            .attr("fill-opacity", 0.2)
            .style("opacity", 0)
            .transition()
            .delay(i * 200)
            .duration(500)
            .style("opacity", 1);
        }
        
        // Label
        group.append("text")
          .attr("text-anchor", "end")
          .attr("x", -20)
          .attr("dy", "0.35em")
          .attr("fill", colors.chart.text)
          .style("font-size", "14px")
          .style("opacity", 0)
          .text(comp.label)
          .transition()
          .delay(i * 200)
          .duration(500)
          .style("opacity", 1);
        
        // Value
        group.append("text")
          .attr("text-anchor", "start")
          .attr("x", 20)
          .attr("dy", "0.35em")
          .attr("fill", comp.highlight ? colorScheme.chart.primary : colors.chart.text)
          .style("font-size", "18px")
          .style("font-weight", comp.highlight ? "600" : "400")
          .style("font-family", "monospace")
          .style("opacity", 0)
          .text(comp.value)
          .transition()
          .delay(i * 200)
          .duration(500)
          .style("opacity", 1);
      });
    }
    
  }, [step]);

  return (
    <VisualizationContainer 
      title="Lottery Example: Deriving the Combination Formula"
      className="p-2"
    >
      <div className="flex flex-col gap-4">
        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                i === step 
                  ? "bg-blue-500 w-8" 
                  : i < step 
                  ? "bg-blue-600" 
                  : "bg-neutral-700"
              )}
            />
          ))}
        </div>
        
        {/* Current step info */}
        <VisualizationSection className="p-4 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            {steps[step].title}
          </h3>
          <p className="text-sm text-neutral-300 mb-3">
            {steps[step].description}
          </p>
          <div className="text-2xl font-mono text-yellow-400">
            <span dangerouslySetInnerHTML={{ __html: steps[step].formula }} />
          </div>
        </VisualizationSection>
        
        {/* Visualization */}
        <GraphContainer height="400px">
          <svg ref={svgRef} style={{ width: "100%", height: 400 }} />
        </GraphContainer>
        
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="neutral"
            size="sm"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            Previous
          </Button>
          
          <span className="text-sm text-neutral-400">
            Step {step + 1} of {steps.length}
          </span>
          
          <Button
            variant="primary"
            size="sm"
            onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
            disabled={step === steps.length - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </VisualizationContainer>
  );
}