"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../../ui/VisualizationContainer';
import { colors, typography, cn, createColorScheme } from '../../../lib/design-system';
import { Button } from '../../ui/button';
import { useMathJax } from '@/hooks/useMathJax';
import { ChevronRight } from 'lucide-react';
import { tutorial_1_7_2 } from '@/tutorials/chapter1';

// Animation timing constants
const ANIMATION_CONSTANTS = {
  BAR_ANIMATION_DURATION: 800, // Duration for bar chart animations
  BAR_ANIMATION_DELAY: 100, // Delay between bar animations
};

// Color scheme for Bayesian inference
const colorScheme = createColorScheme('inference');

// LaTeX content wrapper
const LatexContent = memo(function LatexContent({ children }) {
  const contentRef = useMathJax([children]);
  return <span ref={contentRef}>{children}</span>;
});

// Tree Diagram Component
const BayesianTree = memo(function BayesianTree({ selectedDoor, revealedDoor, highlightPath }) {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    
    // Clear existing elements with proper selection
    svg.select("rect.bayes-background").remove();
    svg.select("g.bayes-tree").remove();
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("class", "bayes-background")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("class", "bayes-tree")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Define tree structure
    const levels = [
      { y: 0, label: "Initial State" },
      { y: innerHeight * 0.25, label: "Car Position" },
      { y: innerHeight * 0.5, label: "Your Choice" },
      { y: innerHeight * 0.75, label: "Monty Opens" },
      { y: innerHeight, label: "Final Outcome" }
    ];
    
    // Create nodes
    const nodes = [
      // Root
      { id: 'root', x: innerWidth / 2, y: levels[0].y, label: 'Start' },
      
      // Car positions
      { id: 'car1', x: innerWidth * 0.2, y: levels[1].y, label: 'Car in 1', prob: '1/3' },
      { id: 'car2', x: innerWidth * 0.5, y: levels[1].y, label: 'Car in 2', prob: '1/3' },
      { id: 'car3', x: innerWidth * 0.8, y: levels[1].y, label: 'Car in 3', prob: '1/3' },
      
      // Player choices (showing only selected path if specified)
      ...(selectedDoor !== null ? [
        { id: `choose${selectedDoor + 1}`, x: innerWidth * (0.2 + selectedDoor * 0.3), y: levels[2].y, 
          label: `You pick ${selectedDoor + 1}`, highlight: true }
      ] : [
        { id: 'choose1', x: innerWidth * 0.2, y: levels[2].y, label: 'You pick 1' },
        { id: 'choose2', x: innerWidth * 0.5, y: levels[2].y, label: 'You pick 2' },
        { id: 'choose3', x: innerWidth * 0.8, y: levels[2].y, label: 'You pick 3' }
      ])
    ];
    
    // Add edges
    const edges = [];
    
    // Root to car positions
    ['car1', 'car2', 'car3'].forEach(carId => {
      const sourceNode = (nodes || []).find(n => n.id === 'root');
      const targetNode = (nodes || []).find(n => n.id === carId);
      if (sourceNode && targetNode) {
        edges.push({
          source: sourceNode,
          target: targetNode,
          prob: '1/3'
        });
      }
    });
    
    // Draw edges
    const line = d3.line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveBasis);
    
    g.selectAll(".edge")
      .data(edges)
      .enter().append("path")
      .attr("class", "edge")
      .attr("d", d => line([d.source, d.target]))
      .attr("stroke", d => d.highlight ? colorScheme.chart.primary : "#9ca3af")
      .attr("stroke-width", d => d.highlight ? 3 : 1.5)
      .attr("fill", "none")
      .attr("opacity", d => d.highlight ? 1 : 0.6);
    
    // Draw probability labels on edges
    g.selectAll(".edge-prob")
      .data(edges)
      .enter().append("text")
      .attr("class", "edge-prob")
      .attr("x", d => (d.source.x + d.target.x) / 2)
      .attr("y", d => (d.source.y + d.target.y) / 2 - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#f3f4f6")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .text(d => d.prob || '');
    
    // Draw nodes
    const nodeGroups = g.selectAll(".node")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);
    
    nodeGroups.append("circle")
      .attr("r", d => d.id === 'root' ? 8 : 20)
      .attr("fill", d => {
        if (d.highlight) return colorScheme.chart.primary;
        if (d.id.startsWith('car')) return colorScheme.chart.secondary;
        return "#374151";
      })
      .attr("stroke", d => d.highlight ? colorScheme.chart.primaryLight : "#6b7280")
      .attr("stroke-width", 2);
    
    nodeGroups.append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", d => d.id === 'root' ? "10px" : "11px")
      .style("font-weight", "500")
      .text(d => d.label);
    
    // Draw level labels
    levels.forEach(level => {
      g.append("text")
        .attr("x", -20)
        .attr("y", level.y)
        .attr("text-anchor", "end")
        .attr("fill", "#9ca3af")
        .style("font-size", "11px")
        .text(level.label);
    });
    
    // Add detailed calculation area if door is selected
    if (selectedDoor !== null && revealedDoor !== null) {
      const calcX = innerWidth * 0.1;
      const calcY = innerHeight * 0.85;
      
      const calcGroup = g.append("g")
        .attr("transform", `translate(${calcX},${calcY})`);
      
      calcGroup.append("rect")
        .attr("x", -10)
        .attr("y", -10)
        .attr("width", innerWidth * 0.8)
        .attr("height", 60)
        .attr("fill", "#1e293b")
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 1)
        .attr("rx", 4);
      
      // Show key insight
      calcGroup.append("text")
        .attr("x", innerWidth * 0.4)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("fill", "#f3f4f6")
        .style("font-size", "13px")
        .style("font-weight", "600")
        .text(`Key Insight: Monty's action gives you information!`);
      
      calcGroup.append("text")
        .attr("x", innerWidth * 0.4)
        .attr("y", 35)
        .attr("text-anchor", "middle")
        .attr("fill", "#fbbf24")
        .style("font-size", "12px")
        .text(`By revealing door ${revealedDoor + 1}, the probability shifts to the remaining door`);
    }
    
    // Cleanup function for D3
    return () => {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").interrupt();
        svg.select("rect.bayes-background").remove();
        svg.select("g.bayes-tree").remove();
      }
    };
  }, [selectedDoor, revealedDoor, highlightPath]);
  
  return <svg ref={svgRef} style={{ width: "100%", height: "400px" }} />;
});

// Probability Update Visualization
const ProbabilityUpdate = memo(function ProbabilityUpdate({ stage, selectedDoor, revealedDoor }) {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    
    // Clear existing elements with proper selection
    svg.select("g.probability-chart").remove();
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("class", "probability-chart")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Data based on stage
    let data;
    if (stage === 'initial') {
      data = [
        { door: 1, prob: 1/3, label: 'Door 1' },
        { door: 2, prob: 1/3, label: 'Door 2' },
        { door: 3, prob: 1/3, label: 'Door 3' }
      ];
    } else if (stage === 'selected' && selectedDoor !== null) {
      data = [
        { door: 1, prob: 1/3, label: 'Door 1', selected: selectedDoor === 0 },
        { door: 2, prob: 1/3, label: 'Door 2', selected: selectedDoor === 1 },
        { door: 3, prob: 1/3, label: 'Door 3', selected: selectedDoor === 2 }
      ];
    } else if (stage === 'revealed' && selectedDoor !== null && revealedDoor !== null) {
      data = [
        { door: 1, prob: 0 === revealedDoor ? 0 : (0 === selectedDoor ? 1/3 : 2/3), 
          label: 'Door 1', selected: selectedDoor === 0, revealed: revealedDoor === 0 },
        { door: 2, prob: 1 === revealedDoor ? 0 : (1 === selectedDoor ? 1/3 : 2/3), 
          label: 'Door 2', selected: selectedDoor === 1, revealed: revealedDoor === 1 },
        { door: 3, prob: 2 === revealedDoor ? 0 : (2 === selectedDoor ? 1/3 : 2/3), 
          label: 'Door 3', selected: selectedDoor === 2, revealed: revealedDoor === 2 }
      ];
    }
    
    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.3);
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);
    
    // Grid
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat("")
        .ticks(5)
      )
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.2);
    
    // Bars
    const bars = g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.label))
      .attr("width", x.bandwidth())
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("fill", d => {
        if (d.revealed) return "#6b7280";
        if (d.selected) return colorScheme.chart.primary;
        return colorScheme.chart.secondary;
      })
      .attr("opacity", d => d.revealed ? 0.3 : 0.8);
    
    // Animate bars
    bars.transition()
      .duration(ANIMATION_CONSTANTS.BAR_ANIMATION_DURATION)
      .delay((d, i) => i * ANIMATION_CONSTANTS.BAR_ANIMATION_DELAY)
      .attr("y", d => y(d.prob))
      .attr("height", d => innerHeight - y(d.prob));
    
    // Value labels
    g.selectAll(".value")
      .data(data)
      .enter().append("text")
      .attr("class", "value")
      .attr("x", d => x(d.label) + x.bandwidth() / 2)
      .attr("y", d => y(d.prob) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("font-family", "monospace")
      .text(d => d.prob === 0 ? '0' : d.prob === 1/3 ? '1/3' : '2/3')
      .attr("opacity", 0)
      .transition()
      .delay(1000)
      .attr("opacity", 1);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `${(d * 100).toFixed(0)}%`))
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Styling
    g.selectAll(".domain, .tick line")
      .attr("stroke", "#6b7280");
    g.selectAll(".tick text")
      .attr("fill", "#f3f4f6");
    
    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text(
        stage === 'initial' ? 'Initial Probabilities (Prior)' :
        stage === 'selected' ? 'After Your Selection' :
        'Updated Probabilities (Posterior)'
      );
      
    // Cleanup function for D3
    return () => {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").interrupt();
        svg.select("g.probability-chart").remove();
      }
    };
  }, [stage, selectedDoor, revealedDoor]);
  
  return <svg ref={svgRef} style={{ width: "100%", height: "300px" }} />;
});

// Step-by-step Calculation Component
const BayesianCalculation = memo(function BayesianCalculation({ selectedDoor, revealedDoor, showSteps }) {
  const [expandedStep, setExpandedStep] = useState(null);
  
  if (selectedDoor === null || revealedDoor === null) return null;
  
  const switchDoor = [0, 1, 2].find(d => d !== selectedDoor && d !== revealedDoor);
  
  const steps = [
    {
      id: 1,
      title: "Prior Probabilities",
      color: "blue",
      content: (
        <div className="text-blue-200 overflow-x-auto">
          <p><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Car in door 1}) = P(\\text{Car in door 2}) = P(\\text{Car in door 3}) = \\frac{1}{3}\\)` }} /></p>
        </div>
      )
    },
    {
      id: 2,
      title: "Likelihood (Monty's Strategy)",
      color: "emerald",
      content: (
        <div className="text-emerald-200 space-y-1 overflow-x-auto">
          <p>If car is behind your door ({selectedDoor + 1}):</p>
          <p className="ml-4"><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Monty opens ${revealedDoor + 1}}) = \\frac{1}{2}\\)` }} /></p>
          <p>If car is behind door {switchDoor + 1}:</p>
          <p className="ml-4"><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Monty opens ${revealedDoor + 1}}) = 1\\)` }} /></p>
        </div>
      )
    },
    {
      id: 3,
      title: "Posterior (Bayes' Theorem)",
      color: "amber",
      content: (
        <div className="text-amber-200 space-y-3 overflow-x-auto">
          <div>
            <p className="text-xs text-amber-300 mb-1">Probability car is in your door {selectedDoor + 1}:</p>
            <p className="overflow-x-auto"><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Car in ${selectedDoor + 1}}|\\text{Monty opens ${revealedDoor + 1}}) = \\frac{\\frac{1}{3} \\cdot \\frac{1}{2}}{\\frac{1}{3} \\cdot \\frac{1}{2} + \\frac{1}{3} \\cdot 1} = \\frac{1}{3}\\)` }} /></p>
          </div>
          <div>
            <p className="text-xs text-amber-300 mb-1">Probability car is in door {switchDoor + 1}:</p>
            <p className="overflow-x-auto"><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Car in ${switchDoor + 1}}|\\text{Monty opens ${revealedDoor + 1}}) = \\frac{\\frac{1}{3} \\cdot 1}{\\frac{1}{3} \\cdot \\frac{1}{2} + \\frac{1}{3} \\cdot 1} = \\frac{2}{3}\\)` }} /></p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Conclusion",
      color: "green",
      content: (
        <p className="text-green-200 overflow-x-auto">
          Switching to door {switchDoor + 1} doubles your probability of winning from <span dangerouslySetInnerHTML={{ __html: `\\(\\frac{1}{3}\\)` }} /> to <span dangerouslySetInnerHTML={{ __html: `\\(\\frac{2}{3}\\)` }} />!
        </p>
      )
    }
  ];
  
  return (
    <div className="space-y-3 p-4 bg-neutral-900 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-bold text-white">Bayesian Update Calculation</h4>
        {/* Step indicator dots */}
        <div className="flex gap-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                showSteps >= step.id ? "bg-blue-500" : "bg-neutral-600"
              )}
            />
          ))}
        </div>
      </div>
      
      <LatexContent>
        <div className="space-y-3 text-sm max-w-full">
          {/* Setup - Always visible */}
          <div className="p-3 bg-neutral-800 rounded">
            <p className="text-neutral-300 mb-2">Given:</p>
            <ul className="space-y-1 text-neutral-400 ml-4">
              <li>• You selected door {selectedDoor + 1}</li>
              <li>• Monty revealed door {revealedDoor + 1} (has a goat)</li>
              <li>• Should you switch to door {switchDoor + 1}?</li>
            </ul>
          </div>
          
          {/* Progressive steps */}
          {steps.map((step) => {
            const isActive = showSteps === step.id;
            const isCompleted = showSteps > step.id;
            const isVisible = showSteps >= step.id;
            const isExpanded = isActive || expandedStep === step.id;
            
            if (!isVisible) return null;
            
            const bgColorClass = isActive ? (
              step.color === 'blue' ? 'bg-blue-900/20 border-blue-600/30' :
              step.color === 'emerald' ? 'bg-emerald-900/20 border-emerald-600/30' :
              step.color === 'amber' ? 'bg-amber-900/20 border-amber-600/30' :
              'bg-green-900/20 border-green-600/30'
            ) : isCompleted ? 'bg-neutral-800/50 border-neutral-700/50' : '';
            
            const textColorClass = isActive ? (
              step.color === 'blue' ? 'text-blue-300' :
              step.color === 'emerald' ? 'text-emerald-300' :
              step.color === 'amber' ? 'text-amber-300' :
              'text-green-300'
            ) : 'text-neutral-300';
            
            return (
              <div
                key={step.id}
                className={cn(
                  "rounded border transition-all duration-300 overflow-hidden",
                  bgColorClass,
                  !isActive && !isCompleted && "opacity-0"
                )}
              >
                <button
                  onClick={() => isCompleted && setExpandedStep(isExpanded ? null : step.id)}
                  disabled={!isCompleted}
                  className={cn(
                    "w-full p-3 text-left flex items-center justify-between transition-all",
                    isCompleted && "cursor-pointer hover:bg-neutral-700/20"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-semibold",
                      textColorClass
                    )}>
                      Step {step.id}: {step.title}
                    </span>
                    {isCompleted && (
                      <span className="text-xs text-green-400">✓</span>
                    )}
                  </div>
                  {isCompleted && (
                    <ChevronRight className={cn(
                      "w-4 h-4 text-neutral-400 transition-transform",
                      isExpanded && "rotate-90"
                    )} />
                  )}
                </button>
                
                <div
                  className={cn(
                    "transition-all duration-300",
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                  style={{
                    transition: "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out"
                  }}
                >
                  <div className="px-3 pb-3">
                    {step.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </LatexContent>
    </div>
  );
});

// Main Component
function MontyHallBayesian() {
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [revealedDoor, setRevealedDoor] = useState(null);
  const [showSteps, setShowSteps] = useState(4);
  const [stage, setStage] = useState('initial'); // initial, selected, revealed
  const [userDecision, setUserDecision] = useState(null); // 'switch' | 'stay' | null
  const [showResult, setShowResult] = useState(false);
  
  // Ref for cleanup
  const revealTimeoutRef = useRef(null);
  
  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);
  
  // Reset function
  const reset = () => {
    // Clear timeout on reset
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    
    setSelectedDoor(null);
    setRevealedDoor(null);
    setShowSteps(4);
    setStage('initial');
    setUserDecision(null);
    setShowResult(false);
  };
  
  // Select door
  const selectDoor = (doorIndex) => {
    setSelectedDoor(doorIndex);
    setStage('selected');
    
    // Clear any existing timeout
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
    }
    
    // Auto-reveal after delay
    revealTimeoutRef.current = setTimeout(() => {
      // Monty reveals a random goat door
      const carPosition = Math.floor(Math.random() * 3);
      const availableDoors = [0, 1, 2].filter(d => d !== doorIndex && d !== carPosition);
      const doorToReveal = availableDoors[Math.floor(Math.random() * availableDoors.length)];
      setRevealedDoor(doorToReveal);
      setStage('revealed');
      revealTimeoutRef.current = null;
    }, 1000);
  };
  
  
  // Handle user decision
  const makeDecision = (decision) => {
    setUserDecision(decision);
    setShowResult(true);
  };
  
  // Calculate which door to switch to
  const switchDoor = selectedDoor !== null && revealedDoor !== null
    ? [0, 1, 2].find(d => d !== selectedDoor && d !== revealedDoor)
    : null;
  
  return (
    <VisualizationContainer
      title="Monty Hall Problem: Bayesian Analysis"
      description={
        <p className={typography.description}>
          Understanding the Monty Hall problem through <span className="text-blue-400">Bayes' theorem</span>. 
          See how Monty's action of revealing a goat <span className="text-emerald-400">updates the probabilities</span> and 
          why switching doors <span className="text-amber-400">doubles your chances</span> of winning.
        </p>
      }
      tutorialSteps={tutorial_1_7_2}
      tutorialKey="monty-hall-bayesian"
    >
      <div className="flex flex-col gap-4">
        {/* Controls */}
        <VisualizationSection className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-white mb-2">Interactive Demonstration</h4>
              <p className="text-sm text-neutral-400">
                Select a door to see how Bayesian reasoning explains the optimal strategy
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={reset} variant="neutral">
                Reset
              </Button>
            </div>
          </div>
        </VisualizationSection>
        
        {/* Main Content - Changed to better layout */}
        <div className="flex flex-col gap-4">
          {/* Door Selection and Probability Update - Side by side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Door Selection */}
            <VisualizationSection className="p-4">
              <h4 className="text-sm font-bold text-white mb-3">1. Choose Your Door</h4>
              <div className="flex justify-center gap-4">
                {[0, 1, 2].map(i => (
                  <button
                    key={i}
                    onClick={() => selectDoor(i)}
                    disabled={selectedDoor !== null}
                    className={cn(
                      "w-20 h-24 rounded-lg border-2 transition-all",
                      "flex flex-col items-center justify-center gap-2",
                      selectedDoor === i ? "border-blue-500 bg-blue-500/20" : 
                      revealedDoor === i ? "border-gray-600 bg-gray-600/20 opacity-50" :
                      "border-neutral-600 hover:border-neutral-500",
                      selectedDoor !== null && "cursor-not-allowed"
                    )}
                  >
                    <span className="text-2xl font-bold">{i + 1}</span>
                    {selectedDoor === i && (
                      <span className="text-xs text-blue-400">Selected</span>
                    )}
                    {revealedDoor === i && (
                      <span className="text-xs">🐐</span>
                    )}
                  </button>
                ))}
              </div>
              
              {stage === 'revealed' && (
                <div className="mt-4 p-3 bg-amber-900/20 rounded border border-amber-600/30">
                  <p className="text-sm text-amber-300">
                    Monty revealed door {revealedDoor + 1} has a goat. 
                    Now the question: should you switch to door {[0, 1, 2].find(d => d !== selectedDoor && d !== revealedDoor) + 1}?
                  </p>
                </div>
              )}
            </VisualizationSection>
            
            {/* Probability Update Visualization */}
            <GraphContainer height="300px">
              <h4 className="text-sm font-bold text-white mb-2 px-4 pt-3">
                2. Probability Evolution
              </h4>
              <ProbabilityUpdate 
                stage={stage}
                selectedDoor={selectedDoor}
                revealedDoor={revealedDoor}
              />
            </GraphContainer>
          </div>
          
          {/* Bayesian Calculation - Full width */}
          <div className="space-y-4">
            {/* Step Controls - Always visible when doors are revealed */}
            {stage === 'revealed' && (
              <VisualizationSection className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white">3. Bayesian Analysis</h4>
                  <div className="flex gap-2">
                    {[
                      { step: 1, color: 'blue' },
                      { step: 2, color: 'emerald' },
                      { step: 3, color: 'amber' },
                      { step: 4, color: 'green' }
                    ].map(({ step, color }) => (
                      <button
                        key={step}
                        onClick={() => setShowSteps(step)}
                        className={cn(
                          "w-8 h-8 rounded-full text-xs font-bold transition-all border",
                          showSteps >= step 
                            ? color === 'blue' ? "bg-blue-600 text-white border-blue-500" :
                              color === 'emerald' ? "bg-emerald-600 text-white border-emerald-500" :
                              color === 'amber' ? "bg-amber-600 text-white border-amber-500" :
                              "bg-green-600 text-white border-green-500"
                            : color === 'blue' ? "bg-blue-900/20 text-blue-300 border-blue-600/30 hover:bg-blue-900/40" :
                              color === 'emerald' ? "bg-emerald-900/20 text-emerald-300 border-emerald-600/30 hover:bg-emerald-900/40" :
                              color === 'amber' ? "bg-amber-900/20 text-amber-300 border-amber-600/30 hover:bg-amber-900/40" :
                              "bg-green-900/20 text-green-300 border-green-600/30 hover:bg-green-900/40"
                        )}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </div>
                
                <BayesianCalculation 
                  selectedDoor={selectedDoor}
                  revealedDoor={revealedDoor}
                  showSteps={showSteps}
                />
              </VisualizationSection>
            )}
            
            {/* Interactive Decision Making */}
            {showSteps === 4 && !userDecision && (
              <VisualizationSection className="p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-600/30">
                <h4 className="text-base font-bold text-purple-300 mb-3">Now It's Your Turn to Decide!</h4>
                <p className="text-sm text-neutral-300 mb-4">
                  Based on the Bayesian analysis, what will you do?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => makeDecision('stay')}
                    variant="secondary"
                    className="px-6 py-3 text-base font-semibold bg-blue-600/20 hover:bg-blue-600/30 border-blue-500"
                  >
                    Stay with Door {selectedDoor + 1}
                  </Button>
                  <Button
                    onClick={() => makeDecision('switch')}
                    variant="primary"
                    className="px-6 py-3 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
                  >
                    Switch to Door {switchDoor + 1}
                  </Button>
                </div>
              </VisualizationSection>
            )}
            
            {/* Decision Result */}
            {userDecision && showResult && (
              <VisualizationSection 
                className={cn(
                  "p-4 transition-all duration-500",
                  userDecision === 'switch' 
                    ? "bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-600/30" 
                    : "bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-600/30"
                )}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      userDecision === 'switch' ? "bg-green-600" : "bg-amber-600"
                    )}>
                      {userDecision === 'switch' ? (
                        <span className="text-white text-xl">✓</span>
                      ) : (
                        <span className="text-white text-xl">!</span>
                      )}
                    </div>
                    <div>
                      <h4 className={cn(
                        "text-lg font-bold",
                        userDecision === 'switch' ? "text-green-300" : "text-amber-300"
                      )}>
                        You chose to {userDecision === 'switch' ? 'switch' : 'stay'}!
                      </h4>
                      <p className={cn(
                        "text-sm",
                        userDecision === 'switch' ? "text-green-200" : "text-amber-200"
                      )}>
                        {userDecision === 'switch' 
                          ? "Optimal choice! You maximized your winning probability."
                          : "Suboptimal choice. You could have doubled your chances by switching."}
                      </p>
                    </div>
                  </div>
                  
                  {/* Probability Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className={cn(
                      "p-3 rounded-lg",
                      userDecision === 'stay' ? "bg-blue-900/30 border border-blue-600/50" : "bg-neutral-800/50"
                    )}>
                      <p className="text-xs text-neutral-400 mb-1">Staying with Door {selectedDoor + 1}</p>
                      <p className="text-2xl font-bold font-mono text-blue-300">1/3</p>
                      <p className="text-xs text-neutral-400">33.33% chance</p>
                    </div>
                    <div className={cn(
                      "p-3 rounded-lg",
                      userDecision === 'switch' ? "bg-emerald-900/30 border border-emerald-600/50" : "bg-neutral-800/50"
                    )}>
                      <p className="text-xs text-neutral-400 mb-1">Switching to Door {switchDoor + 1}</p>
                      <p className="text-2xl font-bold font-mono text-emerald-300">2/3</p>
                      <p className="text-xs text-neutral-400">66.67% chance</p>
                    </div>
                  </div>
                  
                  {/* Educational Feedback */}
                  <div className="p-3 bg-neutral-900/50 rounded-lg">
                    <p className="text-sm text-neutral-300">
                      {userDecision === 'switch' 
                        ? "Great intuition! The Bayesian analysis shows that Monty's action of revealing a goat door concentrates the probability on the remaining unopened door. By switching, you take advantage of this information update."
                        : "It's counterintuitive, but the math is clear: switching doubles your chances. Remember, your initial choice had only a 1/3 chance of being correct, and Monty's reveal doesn't change that - it just tells you where the car ISN'T."}
                    </p>
                  </div>
                  
                  {/* Try Again Button */}
                  <div className="flex justify-center mt-4">
                    <Button 
                      onClick={reset} 
                      variant="neutral"
                      className="flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Try Another Scenario
                    </Button>
                  </div>
                </div>
              </VisualizationSection>
            )}
            
            {/* Key Insights - Now side by side with calculation on larger screens */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Key Insights */}
              <VisualizationSection className="p-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-600/30">
                <h4 className="text-base font-bold text-blue-300 mb-3">Key Insights</h4>
                <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-blue-200 font-medium">Information Update</p>
                    <p className="text-neutral-400">
                      Monty's action isn't random - he always reveals a goat, never the car. 
                      This constraint provides information.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-emerald-200 font-medium">Asymmetric Information</p>
                    <p className="text-neutral-400">
                      If you initially picked the car (1/3 chance), Monty has 2 goats to choose from. 
                      If you picked a goat (2/3 chance), Monty must reveal the other goat.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-600/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-amber-200 font-medium">The 2/3 Advantage</p>
                    <p className="text-neutral-400">
                      Switching wins whenever your initial pick was wrong (2/3 of the time). 
                      Staying wins only when your initial pick was right (1/3 of the time).
                    </p>
                  </div>
                </div>
              </div>
            </VisualizationSection>
            
            {/* Mathematical Deep Dive - Moved here */}
            <VisualizationSection className="p-4">
              <h4 className="text-base font-bold text-white mb-3">Mathematical Framework</h4>
              <LatexContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-neutral-900 rounded-lg">
                    <h5 className="text-blue-400 font-semibold mb-2">Bayes' Theorem</h5>
                    <div className="space-y-2 text-neutral-300 overflow-x-auto">
                      <p><span dangerouslySetInnerHTML={{ __html: `\\(P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}\\)` }} /></p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-neutral-900 rounded-lg">
                    <h5 className="text-emerald-400 font-semibold mb-2">Applied to Monty Hall</h5>
                    <div className="space-y-1 text-neutral-300 text-xs overflow-x-auto">
                      <p>Let C_i = "Car is behind door i"</p>
                      <p>Let M_j = "Monty opens door j"</p>
                      <p className="mt-2"><span dangerouslySetInnerHTML={{ __html: `\\(P(C_i|M_j) = \\frac{P(M_j|C_i) \\cdot P(C_i)}{P(M_j)}\\)` }} /></p>
                    </div>
                  </div>
                </div>
              </LatexContent>
            </VisualizationSection>
          </div>
          </div>
        </div>
        
        {/* Decision Tree Visualization - Now collapsible */}
        <VisualizationSection className="p-4">
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between">
              <h4 className="text-base font-bold text-white">Decision Tree Analysis</h4>
              <ChevronRight className="w-5 h-5 text-neutral-400 transition-transform group-open:rotate-90" />
            </summary>
            <div className="mt-4">
              <GraphContainer height="400px">
                <BayesianTree 
                  selectedDoor={selectedDoor}
                  revealedDoor={revealedDoor}
                  highlightPath={stage === 'revealed'}
                />
              </GraphContainer>
            </div>
          </details>
        </VisualizationSection>
      </div>
    </VisualizationContainer>
  );
}

export default MontyHallBayesian;