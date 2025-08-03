"use client";

import React, { useState, useRef, useEffect } from 'react';
import * as d3 from "@/utils/d3-utils";
import { Button } from '@/components/ui/button';
import { GraphContainer, ControlGroup, VisualizationContainer, VisualizationSection } from '@/components/ui/VisualizationContainer';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';
import { InterpretationBox } from '@/components/ui/patterns/InterpretationBox';
import MathErrorBoundary from '@/components/ui/error-handling/MathErrorBoundary';
import { useMathJax } from '@/hooks/useMathJax';
import SharedNavigation from '../shared/SharedNavigation';

// Simplified Venn diagram for probability foundations
export default function Tab4InteractiveTab({ onComplete }) {
  const [selectedOperation, setSelectedOperation] = useState("");
  const [highlightedRegions, setHighlightedRegions] = useState([]);
  const [showProbabilities, setShowProbabilities] = useState(true);
  const svgRef = useRef(null);
  
  // MathJax hook for LaTeX rendering
  const contentRef = useMathJax([selectedOperation, showProbabilities]);
  
  // Set data for two circles (Red and Blue pebbles)
  const setData = [
    {name: 'R', label: 'Red Pebbles', cx: 0.35, cy: 0.5, r: 0.25},
    {name: 'B', label: 'Blue Pebbles', cx: 0.65, cy: 0.5, r: 0.25}
  ];

  // Probability operations for two-set foundations
  const operations = [
    { 
      label: "P(R)", 
      value: "R", 
      hint: "Probability of picking a red pebble", 
      regions: [1], 
      probability: "\\(\\frac{3}{6} = 0.5\\)",
      latexFormula: "\\(P(R) = \\frac{|R|}{|S|} = \\frac{3}{6}\\)",
      description: "Only red pebbles"
    },
    { 
      label: "P(B)", 
      value: "B", 
      hint: "Probability of picking a blue pebble", 
      regions: [2], 
      probability: "\\(\\frac{2}{6} \\approx 0.33\\)",
      latexFormula: "\\(P(B) = \\frac{|B|}{|S|} = \\frac{2}{6}\\)",
      description: "Only blue pebbles"
    },
    { 
      label: "P(R ∪ B)", 
      value: "R∪B", 
      hint: "Probability of picking red OR blue", 
      regions: [1, 2], 
      probability: "\\(\\frac{5}{6} \\approx 0.83\\)",
      latexFormula: "\\(P(R \\cup B) = \\frac{|R \\cup B|}{|S|} = \\frac{5}{6}\\)",
      description: "Red OR blue pebbles"
    },
    { 
      label: "P((R ∪ B)')", 
      value: "(R∪B)'", 
      hint: "Probability of picking neither red nor blue", 
      regions: [3], 
      probability: "\\(\\frac{1}{6} \\approx 0.17\\)",
      latexFormula: "\\(P((R \\cup B)') = 1 - P(R \\cup B) = \\frac{1}{6}\\)",
      description: "Green pebbles (neither red nor blue)"
    },
    { 
      label: "P(∅)", 
      value: "∅", 
      hint: "Impossible event - no overlapping region", 
      regions: [], 
      probability: "\\(0\\)",
      latexFormula: "\\(P(\\emptyset) = 0\\)",
      description: "Impossible event"
    },
    { 
      label: "P(S)", 
      value: "S", 
      hint: "Certain event - entire sample space", 
      regions: [1, 2, 3], 
      probability: "\\(1\\)",
      latexFormula: "\\(P(S) = \\frac{|S|}{|S|} = 1\\)",
      description: "All possible outcomes"
    }
  ];

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = 400;
    const height = 300;
    
    // Clear existing elements with proper selection
    svg.select("rect.venn-background").remove();
    svg.select("rect.universal-set").remove();
    svg.select("defs").remove();
    svg.select("g.venn-regions").remove();
    svg.select("g.venn-circles").remove();
    svg.select("g.venn-labels").remove();
    svg.select("text.universe-label").remove();
    
    // Background
    svg.append("rect")
      .attr("class", "venn-background")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // Universal set (sample space)
    svg.append("rect")
      .attr("class", "universal-set")
      .attr("x", 20)
      .attr("y", 20)
      .attr("width", width - 40)
      .attr("height", height - 40)
      .attr("fill", "none")
      .attr("stroke", "#666")
      .attr("stroke-width", 2)
      .attr("rx", 8);
    
    // Sample space label
    svg.append("text")
      .attr("class", "universe-label")
      .attr("x", 30)
      .attr("y", 35)
      .attr("fill", "#888")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("S (Sample Space)");
    
    // Create clip paths and masks
    const defs = svg.append("defs");
    
    setData.forEach(set => {
      defs.append("clipPath")
        .attr("id", `clip-${set.name}`)
        .append("circle")
        .attr("cx", set.cx * width)
        .attr("cy", set.cy * height)
        .attr("r", set.r * Math.min(width, height));
    });
    
    // Create mask for R only (R but not B)
    defs.append("mask")
      .attr("id", "mask-R-only")
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white");
    
    defs.select("#mask-R-only")
      .append("circle")
      .attr("cx", setData[1].cx * width)
      .attr("cy", setData[1].cy * height)
      .attr("r", setData[1].r * Math.min(width, height))
      .attr("fill", "black");
    
    // Create mask for B only (B but not R)
    defs.append("mask")
      .attr("id", "mask-B-only")
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white");
    
    defs.select("#mask-B-only")
      .append("circle")
      .attr("cx", setData[0].cx * width)
      .attr("cy", setData[0].cy * height)
      .attr("r", setData[0].r * Math.min(width, height))
      .attr("fill", "black");
    
    // Create mask for universe excluding all circles
    defs.append("mask")
      .attr("id", "mask-universe")
      .append("rect")
      .attr("x", 20)
      .attr("y", 20)
      .attr("width", width - 40)
      .attr("height", height - 40)
      .attr("fill", "white");
    
    setData.forEach(set => {
      defs.select("#mask-universe")
        .append("circle")
        .attr("cx", set.cx * width)
        .attr("cy", set.cy * height)
        .attr("r", set.r * Math.min(width, height))
        .attr("fill", "black");
    });
    
    // Create highlighting regions
    const g = svg.append("g").attr("class", "venn-regions");
    
    // Region 1: Only R (Red pebbles only)
    g.append("rect")
      .attr("class", "region region-1")
      .attr("clip-path", "url(#clip-R)")
      .attr("mask", "url(#mask-R-only)")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("data-region", "1")
      .style("cursor", "pointer")
      .on("click", function(event) {
        event.stopPropagation();
        handleRegionClick([1]);
      });
    
    // Region 2: Only B (Blue pebbles only)
    g.append("rect")
      .attr("class", "region region-2")
      .attr("clip-path", "url(#clip-B)")
      .attr("mask", "url(#mask-B-only)")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("data-region", "2")
      .style("cursor", "pointer")
      .on("click", function(event) {
        event.stopPropagation();
        handleRegionClick([2]);
      });
    
    // Region 3: Outside all sets (Green pebbles)
    g.append("rect")
      .attr("class", "region region-3")
      .attr("x", 20)
      .attr("y", 20)
      .attr("width", width - 40)
      .attr("height", height - 40)
      .attr("mask", "url(#mask-universe)")
      .attr("fill", "transparent")
      .attr("data-region", "3")
      .style("cursor", "pointer")
      .on("click", function(event) {
        event.stopPropagation();
        handleRegionClick([3]);
      })
      .lower();
    
    // Draw circles
    const circlesContainer = svg.append("g").attr("class", "venn-circles");
    
    setData.forEach((set, index) => {
      // Circle
      circlesContainer.append("circle")
        .attr("cx", set.cx * width)
        .attr("cy", set.cy * height)
        .attr("r", set.r * Math.min(width, height))
        .attr("fill", "none")
        .attr("stroke", index === 0 ? "#ef4444" : "#3b82f6")
        .attr("stroke-width", 3)
        .attr("opacity", 0.8);
      
      // Label
      circlesContainer.append("text")
        .attr("x", set.cx * width)
        .attr("y", set.cy * height - set.r * Math.min(width, height) - 10)
        .attr("text-anchor", "middle")
        .attr("fill", index === 0 ? "#ef4444" : "#3b82f6")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(set.label);
    });
    
    // Add probability labels if enabled
    if (showProbabilities) {
      const labelsContainer = svg.append("g").attr("class", "venn-labels");
      
      // Red region probability
      labelsContainer.append("text")
        .attr("x", setData[0].cx * width - 20)
        .attr("y", setData[0].cy * height)
        .attr("text-anchor", "middle")
        .attr("fill", "#ef4444")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text("3/6");
      
      // Blue region probability
      labelsContainer.append("text")
        .attr("x", setData[1].cx * width + 20)
        .attr("y", setData[1].cy * height)
        .attr("text-anchor", "middle")
        .attr("fill", "#3b82f6")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text("2/6");
      
      // Green region probability (outside circles)
      labelsContainer.append("text")
        .attr("x", width - 40)
        .attr("y", height - 30)
        .attr("text-anchor", "middle")
        .attr("fill", "#10b981")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text("1/6");
    }
    
    // Highlight regions based on selected operation
    svg.selectAll('.region')
      .attr('fill', function() {
        const region = parseInt(this.getAttribute('data-region'));
        return highlightedRegions.includes(region) ? 'rgba(139, 92, 246, 0.4)' : 'transparent';
      });
    
    // Click handler for clearing selection
    svg.on("click", function() {
      setSelectedOperation("");
      setHighlightedRegions([]);
    });
    
    // Cleanup function for D3
    return () => {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").interrupt();
      }
    };
  }, [selectedOperation, highlightedRegions, showProbabilities]);

  const handleOperation = (operation) => {
    setSelectedOperation(operation.value);
    setHighlightedRegions(operation.regions);
  };

  const handleRegionClick = (regions) => {
    // Find operation that matches these regions
    const matchingOp = operations.find(op => 
      op.regions.length === regions.length && 
      op.regions.every(r => regions.includes(r))
    );
    
    if (matchingOp) {
      handleOperation(matchingOp);
    } else {
      setSelectedOperation("");
      setHighlightedRegions(regions);
    }
  };

  const currentOperation = operations.find(op => op.value === selectedOperation);

  return (
    <MathErrorBoundary 
      fallbackMessage="The Venn diagram visualization encountered an error. This may be due to D3 rendering issues. Please try refreshing."
      showRetry={true}
    >
      <div ref={contentRef}>
        <VisualizationContainer title="Probability Venn Diagram" className="p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:w-1/3 space-y-4">
            <VisualizationSection className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-white">Probability Operations</h4>
                <Button
                  variant="neutral"
                  size="sm"
                  onClick={() => setShowProbabilities(!showProbabilities)}
                >
                  {showProbabilities ? "Hide" : "Show"} Values
                </Button>
              </div>
              
              <div className="space-y-3">
                {operations.map((op) => (
                  <button
                    key={op.value}
                    onClick={() => handleOperation(op)}
                    className={`
                      w-full p-3 rounded-lg text-left transition-all duration-200
                      ${selectedOperation === op.value 
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 border-2 border-green-500' 
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-2 border-neutral-700'
                      }
                    `}
                  >
                    <div>
                      <div className="font-mono text-sm font-semibold">{op.label}</div>
                      <div className="text-xs mt-1 opacity-90">
                        <span dangerouslySetInnerHTML={{ __html: op.probability }} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {currentOperation && (
                <div className="mt-3 p-3 bg-purple-900/20 rounded text-sm text-purple-300">
                  <div className="font-semibold">{currentOperation.description}</div>
                  <div className="text-xs mt-1 opacity-80">{currentOperation.hint}</div>
                </div>
              )}
            </VisualizationSection>

            <VisualizationSection className="p-4">
              <h4 className="font-bold text-white mb-3">Bag Contents</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    Red pebbles:
                  </span>
                  <span>3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Blue pebbles:
                  </span>
                  <span>2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Green pebbles:
                  </span>
                  <span>1</span>
                </div>
                <hr className="border-neutral-700" />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>6</span>
                </div>
              </div>
            </VisualizationSection>
          </div>

          {/* Right Panel - Visualization */}
          <div className="lg:w-2/3">
            <GraphContainer height="300px" className="bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800">
              <svg ref={svgRef} style={{ width: "100%", height: 300 }} viewBox="0 0 400 300" />
            </GraphContainer>
            
            <div className="mt-4 space-y-4">
              <SimpleInsightBox title="Interactive Venn Diagram" theme="teal">
                <p>
                  Click on regions in the diagram or use the buttons to explore different probability concepts. 
                  This diagram shows how sets represent different colored pebbles in our bag.
                </p>
                <p className="mt-2 text-sm opacity-80">
                  • Red circle = red pebbles • Blue circle = blue pebbles • Outside = green pebbles
                </p>
              </SimpleInsightBox>

              {currentOperation && (
                <InterpretationBox theme="blue" title={`Selected: ${currentOperation.label}`}>
                  <p>
                    <strong>{currentOperation.description}</strong>
                  </p>
                  <p className="mt-2">
                    Formula: <span className="font-mono text-blue-300">
                      <span dangerouslySetInnerHTML={{ __html: currentOperation.latexFormula }} />
                    </span>
                  </p>
                  <p className="mt-2">
                    Result: <span className="font-mono text-blue-300">
                      <span dangerouslySetInnerHTML={{ __html: currentOperation.probability }} />
                    </span>
                  </p>
                  <p className="mt-1 text-sm opacity-80">
                    {currentOperation.hint}
                  </p>
                </InterpretationBox>
              )}

              <SimpleInsightBox title="Key Concepts" theme="purple">
                <ul className="space-y-1 text-sm">
                  <li>• <strong>Sample Space (S):</strong> All possible outcomes (the rectangle)</li>
                  <li>• <strong>Union (∪):</strong> Events that occur in either set or both</li>
                  <li>• <strong>Complement ('):</strong> Events that do NOT occur in the set</li>
                  <li>• <strong>Empty Set (∅):</strong> Impossible events (probability = 0)</li>
                </ul>
              </SimpleInsightBox>
            </div>
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <SharedNavigation
          currentStep={selectedOperation ? operations.findIndex(op => op.value === selectedOperation) : 0}
          totalSteps={operations.length}
          onNavigate={(index) => {
            if (index >= 0 && index < operations.length) {
              handleOperation(operations[index]);
            }
          }}
          onComplete={onComplete}
          showProgress={true}
          nextLabel="Next Operation"
          previousLabel="Previous Operation"
        />
        </VisualizationContainer>
      </div>
    </MathErrorBoundary>
  );
}