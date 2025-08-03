"use client";

import React, { useState, useEffect, useRef } from 'react';
import * as d3 from "@/utils/d3-utils";
import { motion, AnimatePresence } from "framer-motion";
import { VisualizationContainer, GraphContainer, VisualizationSection } from '@/components/ui/VisualizationContainer';
import { Button } from '@/components/ui/button';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';
import { InterpretationBox } from '@/components/ui/patterns/InterpretationBox';
import { createColorScheme } from '@/lib/design-system';

// Use Chapter 7 consistent colors
const chapterColors = createColorScheme('probability');

// Animation timing constants
const ANIMATION_CONSTANTS = {
  TRANSITION_DURATION: 300, // Duration for D3 transitions
};

export default function Tab4InteractiveTab({ onComplete }) {
  const [pebbles, setPebbles] = useState([
    { id: 1, color: 'red', mass: 1, x: 0, y: 0 },
    { id: 2, color: 'red', mass: 1, x: 0, y: 0 },
    { id: 3, color: 'red', mass: 1, x: 0, y: 0 },
    { id: 4, color: 'blue', mass: 1, x: 0, y: 0 },
    { id: 5, color: 'blue', mass: 1, x: 0, y: 0 },
    { id: 6, color: 'green', mass: 1, x: 0, y: 0 }
  ]);
  const [selectedPebble, setSelectedPebble] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState({ red: 0, blue: 0, green: 0, total: 0 });
  const [equalMass, setEqualMass] = useState(true);
  
  const svgRef = useRef(null);
  const timeoutRef = useRef(null);

  // Initialize pebble positions only once
  useEffect(() => {
    if (!svgRef.current) return;
    
    const width = 600;
    const height = 400;
    const bagCenterX = width / 2;
    const bagCenterY = height / 2;
    const bagRadius = 150;
    
    // Arrange pebbles in a circle inside the bag
    setPebbles(prev => prev.map((pebble, index) => {
      // Only update position if not already set
      if (pebble.x === 0 && pebble.y === 0) {
        const angle = (index / prev.length) * 2 * Math.PI;
        const radius = bagRadius * 0.6;
        return {
          ...pebble,
          x: bagCenterX + Math.cos(angle) * radius + (Math.random() - 0.5) * 30,
          y: bagCenterY + Math.sin(angle) * radius + (Math.random() - 0.5) * 30
        };
      }
      return pebble;
    }));
  }, []); // Empty dependency array - run only once

  // D3 visualization
  useEffect(() => {
    if (!svgRef.current || pebbles.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 400;
    
    // Clear existing elements with proper selection
    svg.select("rect.pebble-background").remove();
    svg.select("circle.bag-outline").remove();
    svg.select("text.bag-label").remove();
    svg.select("text.selected-info").remove();
    svg.select("g.pebbles-container").remove();
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("class", "pebble-background")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // Draw bag outline
    const bagCenterX = width / 2;
    const bagCenterY = height / 2;
    const bagRadius = 150;
    
    svg.append("circle")
      .attr("class", "bag-outline")
      .attr("cx", bagCenterX)
      .attr("cy", bagCenterY)
      .attr("r", bagRadius)
      .attr("fill", "none")
      .attr("stroke", "#666")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "10,5");
    
    svg.append("text")
      .attr("class", "bag-label")
      .attr("x", bagCenterX)
      .attr("y", bagCenterY - bagRadius - 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#ccc")
      .attr("font-size", "16px")
      .text("Probability Bag");
    
    // Create pebbles container
    const pebblesContainer = svg.append("g").attr("class", "pebbles-container");
    
    // Draw pebbles using proper D3 data join
    const pebbleRadius = equalMass ? 12 : undefined;
    
    const pebbleSelection = pebblesContainer.selectAll(".pebble")
      .data(pebbles, d => d.id);
    
    // Remove exiting pebbles
    pebbleSelection.exit()
      .transition()
      .duration(ANIMATION_CONSTANTS.TRANSITION_DURATION)
      .attr("r", 0)
      .style("opacity", 0)
      .remove();
    
    // Enter new pebbles
    const pebblesEnter = pebbleSelection.enter()
      .append("circle")
      .attr("class", "pebble")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 0)
      .style("opacity", 0)
      .style("cursor", "pointer");
    
    // Update all pebbles (enter + existing)
    pebbleSelection.merge(pebblesEnter)
      .transition()
      .duration(ANIMATION_CONSTANTS.TRANSITION_DURATION)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => equalMass ? pebbleRadius : 8 + d.mass * 6)
      .attr("fill", d => {
        switch(d.color) {
          case 'red': return '#ef4444';
          case 'blue': return '#3b82f6';
          case 'green': return '#10b981';
          default: return '#666';
        }
      })
      .attr("stroke", d => selectedPebble?.id === d.id ? "#fbbf24" : "none")
      .attr("stroke-width", 3)
      .attr("opacity", 0.8);
    
    // Add click handlers to all pebbles (enter + update)
    pebblesContainer.selectAll(".pebble")
      .on("click", function(event, d) {
        event.stopPropagation();
        setSelectedPebble(d);
        
        // Highlight selected pebble
        pebblesContainer.selectAll(".pebble")
          .attr("stroke", p => p.id === d.id ? "#fbbf24" : "none");
      });
    
    // Show selected pebble info with proper cleanup
    svg.select("text.selected-info").remove(); // Remove any existing text
    if (selectedPebble) {
      svg.append("text")
        .attr("class", "selected-info")
        .attr("x", 20)
        .attr("y", height - 60)
        .attr("fill", "#fbbf24")
        .attr("font-size", "14px")
        .text(`Selected: ${selectedPebble.color} pebble (mass: ${selectedPebble.mass})`);
    }
    
    // Cleanup function for D3
    return () => {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").interrupt();
        svg.select("rect.pebble-background").remove();
        svg.select("circle.bag-outline").remove();
        svg.select("text.bag-label").remove();
        svg.select("text.selected-info").remove();
        svg.select("g.pebbles-container").remove();
      }
    };
  }, [pebbles, selectedPebble, equalMass]);

  // Cleanup effect for timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const pickRandomPebble = () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    
    // Calculate probabilities based on mass
    const totalMass = pebbles.reduce((sum, p) => sum + p.mass, 0);
    const random = Math.random() * totalMass;
    
    let cumulativeMass = 0;
    let pickedPebble = null;
    
    for (const pebble of pebbles) {
      cumulativeMass += pebble.mass;
      if (random <= cumulativeMass) {
        pickedPebble = pebble;
        break;
      }
    }
    
    if (pickedPebble) {
      setSelectedPebble(pickedPebble);
      setResults(prev => ({
        ...prev,
        [pickedPebble.color]: prev[pickedPebble.color] + 1,
        total: prev.total + 1
      }));
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsSimulating(false);
      timeoutRef.current = null;
    }, 500);
  };

  const resetSimulation = () => {
    setResults({ red: 0, blue: 0, green: 0, total: 0 });
    setSelectedPebble(null);
  };

  const toggleMassMode = () => {
    setEqualMass(!equalMass);
    if (!equalMass) {
      // Reset to equal mass
      setPebbles(prev => prev.map(p => ({ ...p, mass: 1 })));
    } else {
      // Set unequal masses
      setPebbles(prev => prev.map(p => ({
        ...p,
        mass: p.color === 'red' ? 2 : p.color === 'blue' ? 1 : 0.5
      })));
    }
    resetSimulation();
  };

  const redCount = pebbles.filter(p => p.color === 'red').length;
  const blueCount = pebbles.filter(p => p.color === 'blue').length;
  const greenCount = pebbles.filter(p => p.color === 'green').length;
  const totalCount = pebbles.length;

  const redMass = pebbles.filter(p => p.color === 'red').reduce((sum, p) => sum + p.mass, 0);
  const blueMass = pebbles.filter(p => p.color === 'blue').reduce((sum, p) => sum + p.mass, 0);
  const greenMass = pebbles.filter(p => p.color === 'green').reduce((sum, p) => sum + p.mass, 0);
  const totalMass = pebbles.reduce((sum, p) => sum + p.mass, 0);

  return (
    <VisualizationContainer title="Interactive Explorer" className="p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:w-1/3 space-y-4">
          <VisualizationSection className="p-4">
            <h4 className="font-bold text-white mb-3">Experiment Controls</h4>
            
            <div className="space-y-3">
              <Button
                onClick={pickRandomPebble}
                disabled={isSimulating}
                className="w-full"
                variant="primary"
              >
                {isSimulating ? "Picking..." : "Pick Random Pebble"}
              </Button>
              
              <Button
                onClick={toggleMassMode}
                variant="neutral"
                className="w-full"
              >
                {equalMass ? "Switch to Unequal Mass" : "Switch to Equal Mass"}
              </Button>
              
              <Button
                onClick={resetSimulation}
                variant="neutral"
                className="w-full"
              >
                Reset Results
              </Button>
            </div>
          </VisualizationSection>

          <VisualizationSection className="p-4">
            <h4 className="font-bold text-white mb-3">Current Setup</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-red-400">Red pebbles:</span>
                <span>{redCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-400">Blue pebbles:</span>
                <span>{blueCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">Green pebbles:</span>
                <span>{greenCount}</span>
              </div>
              <hr className="border-neutral-700" />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>{totalCount}</span>
              </div>
            </div>
          </VisualizationSection>

          <VisualizationSection className="p-4">
            <h4 className="font-bold text-white mb-3">Theoretical Probabilities</h4>
            <div className="space-y-2 text-sm">
              {equalMass ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-red-400">P(Red):</span>
                    <span>{totalCount > 0 ? (redCount/totalCount).toFixed(3) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-400">P(Blue):</span>
                    <span>{totalCount > 0 ? (blueCount/totalCount).toFixed(3) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">P(Green):</span>
                    <span>{totalCount > 0 ? (greenCount/totalCount).toFixed(3) : 'N/A'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-red-400">P(Red):</span>
                    <span>{totalMass > 0 ? (redMass/totalMass).toFixed(3) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-400">P(Blue):</span>
                    <span>{totalMass > 0 ? (blueMass/totalMass).toFixed(3) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">P(Green):</span>
                    <span>{totalMass > 0 ? (greenMass/totalMass).toFixed(3) : 'N/A'}</span>
                  </div>
                </>
              )}
            </div>
          </VisualizationSection>

          {results.total > 0 && (
            <VisualizationSection className="p-4">
              <h4 className="font-bold text-white mb-3">Experimental Results</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-400">Red picked:</span>
                  <span>{results.red} ({results.total > 0 ? ((results.red/results.total)*100).toFixed(1) : 0}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Blue picked:</span>
                  <span>{results.blue} ({results.total > 0 ? ((results.blue/results.total)*100).toFixed(1) : 0}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-400">Green picked:</span>
                  <span>{results.green} ({results.total > 0 ? ((results.green/results.total)*100).toFixed(1) : 0}%)</span>
                </div>
                <hr className="border-neutral-700" />
                <div className="flex justify-between font-bold">
                  <span>Total picks:</span>
                  <span>{results.total}</span>
                </div>
              </div>
            </VisualizationSection>
          )}
        </div>

        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3">
          <GraphContainer height="400px" className="bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800">
            <svg ref={svgRef} style={{ width: "100%", height: 400 }} />
          </GraphContainer>
          
          <div className="mt-4 space-y-4">
            <SimpleInsightBox title="What You're Seeing" theme="teal">
              <p>
                {equalMass 
                  ? "All pebbles have equal mass (size) - each is equally likely to be picked."
                  : "Pebbles have different masses (sizes) - larger pebbles are more likely to be picked."
                }
              </p>
            </SimpleInsightBox>

            {results.total >= 10 && (
              <InterpretationBox theme="blue" title="Convergence to Theory">
                <p>
                  Notice how your experimental percentages get closer to the theoretical probabilities 
                  as you pick more pebbles. This demonstrates the Law of Large Numbers!
                </p>
              </InterpretationBox>
            )}
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}