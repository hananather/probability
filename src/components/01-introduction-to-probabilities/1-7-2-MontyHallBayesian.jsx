"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { useSafeMathJax } from '../../utils/mathJaxFix';
import { ChevronRight, Eye, EyeOff } from 'lucide-react';
import { tutorial_1_7_2 } from '@/tutorials/chapter1';

// Color scheme for Bayesian inference
const colorScheme = createColorScheme('inference');

// LaTeX content wrapper
const LatexContent = memo(function LatexContent({ children }) {
  const contentRef = useRef(null);
  useSafeMathJax(contentRef, [children]);
  return <span ref={contentRef}>{children}</span>;
});

// Tree Diagram Component
const BayesianTree = memo(function BayesianTree({ selectedDoor, revealedDoor, highlightPath }) {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
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
      edges.push({
        source: nodes.find(n => n.id === 'root'),
        target: nodes.find(n => n.id === carId),
        prob: '1/3'
      });
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
      .attr("stroke", d => d.highlight ? colorScheme.chart.primary : "#4b5563")
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
      .attr("fill", colorScheme.chart.text)
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
        .attr("fill", colorScheme.chart.text)
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
    
  }, [selectedDoor, revealedDoor, highlightPath]);
  
  return <svg ref={svgRef} style={{ width: "100%", height: "500px" }} />;
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
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
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
      .duration(800)
      .delay((d, i) => i * 100)
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
      .call(d3.axisBottom(x));
    
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `${(d * 100).toFixed(0)}%`));
    
    // Styling
    g.selectAll(".domain, .tick line")
      .attr("stroke", "#6b7280");
    g.selectAll(".tick text")
      .attr("fill", "#e5e7eb");
    
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
      
  }, [stage, selectedDoor, revealedDoor]);
  
  return <svg ref={svgRef} style={{ width: "100%", height: "300px" }} />;
});

// Step-by-step Calculation Component
const BayesianCalculation = memo(function BayesianCalculation({ selectedDoor, revealedDoor, showSteps }) {
  if (selectedDoor === null || revealedDoor === null) return null;
  
  const switchDoor = [0, 1, 2].find(d => d !== selectedDoor && d !== revealedDoor);
  
  return (
    <div className="space-y-4 p-4 bg-neutral-900 rounded-lg">
      <h4 className="text-base font-bold text-white mb-3">Bayesian Update Calculation</h4>
      
      <LatexContent>
        <div className="space-y-3 text-sm">
          {/* Setup */}
          <div className="p-3 bg-neutral-800 rounded">
            <p className="text-neutral-300 mb-2">Given:</p>
            <ul className="space-y-1 text-neutral-400 ml-4">
              <li>• You selected door {selectedDoor + 1}</li>
              <li>• Monty revealed door {revealedDoor + 1} (has a goat)</li>
              <li>• Should you switch to door {switchDoor + 1}?</li>
            </ul>
          </div>
          
          {/* Prior Probabilities */}
          <div className={cn(
            "p-3 bg-blue-900/20 rounded border border-blue-600/30 transition-all",
            showSteps >= 1 ? "opacity-100" : "opacity-30"
          )}>
            <p className="text-blue-300 font-semibold mb-1">Step 1: Prior Probabilities</p>
            <div className="text-blue-200">
              <p><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Car in door 1}) = P(\\text{Car in door 2}) = P(\\text{Car in door 3}) = \\frac{1}{3}\\)` }} /></p>
            </div>
          </div>
          
          {/* Likelihood */}
          <div className={cn(
            "p-3 bg-emerald-900/20 rounded border border-emerald-600/30 transition-all",
            showSteps >= 2 ? "opacity-100" : "opacity-30"
          )}>
            <p className="text-emerald-300 font-semibold mb-1">Step 2: Likelihood (Monty's Strategy)</p>
            <div className="text-emerald-200 space-y-1">
              <p>If car is behind your door ({selectedDoor + 1}):</p>
              <p className="ml-4"><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Monty opens ${revealedDoor + 1}}) = \\frac{1}{2}\\)` }} /></p>
              <p>If car is behind door {switchDoor + 1}:</p>
              <p className="ml-4"><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Monty opens ${revealedDoor + 1}}) = 1\\)` }} /></p>
            </div>
          </div>
          
          {/* Posterior */}
          <div className={cn(
            "p-3 bg-amber-900/20 rounded border border-amber-600/30 transition-all",
            showSteps >= 3 ? "opacity-100" : "opacity-30"
          )}>
            <p className="text-amber-300 font-semibold mb-1">Step 3: Posterior (Bayes' Theorem)</p>
            <div className="text-amber-200 space-y-2">
              <p><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Car in ${selectedDoor + 1}}|\\text{Monty opens ${revealedDoor + 1}}) = \\frac{\\frac{1}{3} \\times \\frac{1}{2}}{\\frac{1}{3} \\times \\frac{1}{2} + \\frac{1}{3} \\times 1} = \\frac{1}{3}\\)` }} /></p>
              <p><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Car in ${switchDoor + 1}}|\\text{Monty opens ${revealedDoor + 1}}) = \\frac{\\frac{1}{3} \\times 1}{\\frac{1}{3} \\times \\frac{1}{2} + \\frac{1}{3} \\times 1} = \\frac{2}{3}\\)` }} /></p>
            </div>
          </div>
          
          {/* Conclusion */}
          <div className={cn(
            "p-3 bg-green-900/20 rounded border border-green-600/30 transition-all",
            showSteps >= 4 ? "opacity-100" : "opacity-30"
          )}>
            <p className="text-green-300 font-semibold mb-1">Conclusion</p>
            <p className="text-green-200">
              Switching to door {switchDoor + 1} doubles your probability of winning from <span dangerouslySetInnerHTML={{ __html: `\\(\\frac{1}{3}\\)` }} /> to <span dangerouslySetInnerHTML={{ __html: `\\(\\frac{2}{3}\\)` }} />!
            </p>
          </div>
        </div>
      </LatexContent>
    </div>
  );
});

// Main Component
function MontyHallBayesian() {
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [revealedDoor, setRevealedDoor] = useState(null);
  const [showSteps, setShowSteps] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [stage, setStage] = useState('initial'); // initial, selected, revealed
  
  // Reset function
  const reset = () => {
    setSelectedDoor(null);
    setRevealedDoor(null);
    setShowSteps(0);
    setStage('initial');
    setAutoAdvance(false);
  };
  
  // Select door
  const selectDoor = (doorIndex) => {
    setSelectedDoor(doorIndex);
    setStage('selected');
    
    // Auto-reveal after delay
    setTimeout(() => {
      // Monty reveals a random goat door
      const carPosition = Math.floor(Math.random() * 3);
      const availableDoors = [0, 1, 2].filter(d => d !== doorIndex && d !== carPosition);
      const doorToReveal = availableDoors[Math.floor(Math.random() * availableDoors.length)];
      setRevealedDoor(doorToReveal);
      setStage('revealed');
    }, 1000);
  };
  
  // Auto advance through steps
  useEffect(() => {
    if (autoAdvance && stage === 'revealed' && showSteps < 4) {
      const timer = setTimeout(() => {
        setShowSteps(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoAdvance, showSteps, stage]);
  
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
      <div className="flex flex-col gap-6">
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
              <Button
                onClick={() => setAutoAdvance(!autoAdvance)}
                variant={autoAdvance ? "primary" : "secondary"}
                disabled={stage !== 'revealed'}
              >
                {autoAdvance ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Auto Steps On
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Auto Steps Off
                  </>
                )}
              </Button>
              <Button onClick={reset} variant="neutral">
                Reset
              </Button>
            </div>
          </div>
        </VisualizationSection>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Door Selection and Tree */}
          <div className="space-y-4">
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
          
          {/* Right: Bayesian Calculation */}
          <div className="space-y-4">
            {/* Step Controls */}
            {stage === 'revealed' && (
              <VisualizationSection className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white">3. Bayesian Analysis</h4>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(step => (
                      <button
                        key={step}
                        onClick={() => setShowSteps(step)}
                        className={cn(
                          "w-8 h-8 rounded-full text-xs font-bold transition-all",
                          showSteps >= step 
                            ? "bg-blue-600 text-white" 
                            : "bg-neutral-700 text-neutral-400 hover:bg-neutral-600"
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
          </div>
        </div>
        
        {/* Decision Tree Visualization */}
        <GraphContainer height="500px">
          <h4 className="text-base font-bold text-white mb-2 px-4 pt-3">
            Decision Tree Analysis
          </h4>
          <BayesianTree 
            selectedDoor={selectedDoor}
            revealedDoor={revealedDoor}
            highlightPath={stage === 'revealed'}
          />
        </GraphContainer>
        
        {/* Mathematical Deep Dive */}
        <VisualizationSection className="p-4" divider>
          <h4 className="text-base font-bold text-white mb-3">Mathematical Deep Dive</h4>
          <LatexContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-neutral-900 rounded-lg">
                <h5 className="text-blue-400 font-semibold mb-2">General Bayes' Theorem</h5>
                <div className="space-y-2 text-neutral-300">
                  <p><span dangerouslySetInnerHTML={{ __html: `\\(P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}\\)` }} /></p>
                  <p className="text-xs text-neutral-400 mt-2">Where:</p>
                  <ul className="text-xs text-neutral-400 space-y-1 ml-4">
                    <li>• P(A|B) = Posterior probability</li>
                    <li>• P(A) = Prior probability</li>
                    <li>• P(B|A) = Likelihood</li>
                    <li>• P(B) = Evidence</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-neutral-900 rounded-lg">
                <h5 className="text-emerald-400 font-semibold mb-2">Applied to Monty Hall</h5>
                <div className="space-y-2 text-neutral-300">
                  <p>Let C_i = "Car is behind door i"</p>
                  <p>Let M_j = "Monty opens door j"</p>
                  <p className="text-xs mt-2"><span dangerouslySetInnerHTML={{ __html: `\\(P(C_i|M_j) = \\frac{P(M_j|C_i) \\cdot P(C_i)}{P(M_j)}\\)` }} /></p>
                  <p className="text-xs text-neutral-400 mt-2">
                    The key: P(M_j|C_i) depends on your initial choice!
                  </p>
                </div>
              </div>
            </div>
          </LatexContent>
        </VisualizationSection>
      </div>
    </VisualizationContainer>
  );
}

export default MontyHallBayesian;