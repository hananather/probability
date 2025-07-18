"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { tutorial_1_3_1 } from '@/tutorials/chapter1';

// Use probability color scheme
const colorScheme = createColorScheme('probability');

// Worked Example Component
const OrderedSamplesWorkedExample = memo(function OrderedSamplesWorkedExample({ n, r, withReplacement }) {
  const contentRef = useRef(null);
  
  // Calculate values
  const withReplacementCount = Math.pow(n, r);
  const withoutReplacementCount = r > n ? 0 : Array.from({length: r}, (_, i) => n - i).reduce((a, b) => a * b, 1);
  
  useEffect(() => {
    // MathJax timeout pattern
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          // Silent error: MathJax error
        });
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [n, r, withReplacement]);
  
  return (
    <div ref={contentRef} style={{
      backgroundColor: '#2A303C',
      padding: '1.5rem',
      borderRadius: '8px',
      color: '#e0e0e0',
      marginTop: '1rem'
    }}>
      <h4 style={{ fontSize: '1.125rem', fontWeight: '600', borderBottom: '1px solid #4A5568', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        Example: Drawing {r} Balls from {n} Numbered Balls
      </h4>
      
      {withReplacement ? (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>With Replacement:</p>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
              After each draw, the ball is returned to the bag.
            </p>
            <div dangerouslySetInnerHTML={{ __html: `\\[
              \\text{Number of ways} = n^r = ${n}^${r} = ${withReplacementCount}
            \\]` }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>Calculation:</p>
            <div dangerouslySetInnerHTML={{ __html: `\\[
              \\underbrace{${n} \\times ${n} \\times \\cdots \\times ${n}}_{${r} \\text{ times}} = ${withReplacementCount}
            \\]` }} />
          </div>
          
          <div style={{ backgroundColor: '#1A202C', padding: '1rem', borderRadius: '4px', fontSize: '0.875rem' }}>
            <strong>Example sequences:</strong>
            <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
              <li>1-1-1{r > 3 ? '-...' : ''} (same ball multiple times)</li>
              <li>1-2-3{r > 3 ? '-...' : ''} (different balls)</li>
              <li>{n}-{n-1 > 0 ? n-1 : 1}-{n-2 > 0 ? n-2 : 2}{r > 3 ? '-...' : ''} (any valid sequence)</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>Without Replacement:</p>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
              Once drawn, a ball cannot be selected again.
            </p>
            <div dangerouslySetInnerHTML={{ __html: `\\[
              P_${n}^${r} = \\frac{${n}!}{(${n}-${r})!} = ${withoutReplacementCount}
            \\]` }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>Calculation:</p>
            <div dangerouslySetInnerHTML={{ __html: `\\[
              ${n} \\times ${n-1} \\times ${n-2} ${r > 3 ? '\\times \\cdots' : ''} = ${withoutReplacementCount}
            \\]` }} />
          </div>
          
          {r > n && (
            <div style={{ backgroundColor: '#742a2a', padding: '1rem', borderRadius: '4px', fontSize: '0.875rem' }}>
              <strong>Note:</strong> Cannot draw {r} balls from only {n} balls without replacement!
            </div>
          )}
          
          {r <= n && (
            <div style={{ backgroundColor: '#1A202C', padding: '1rem', borderRadius: '4px', fontSize: '0.875rem' }}>
              <strong>Key insight:</strong> Each draw has one fewer option than the previous.
              <div style={{ marginTop: '0.5rem' }}>
                • 1st draw: {n} choices<br/>
                • 2nd draw: {n-1} choices<br/>
                {r > 2 && `• 3rd draw: ${n-2} choices`}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

function OrderedSamples() {
  const [n, setN] = useState(5); // Total balls
  const [r, setR] = useState(3); // Balls to draw
  const [withReplacement, setWithReplacement] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [allSequences, setAllSequences] = useState([]);
  const [sequenceCount, setSequenceCount] = useState(0);
  const [showWorkedExample, setShowWorkedExample] = useState(true);
  const [hasTriedWithReplacement, setHasTriedWithReplacement] = useState(false);
  const [hasTriedWithoutReplacement, setHasTriedWithoutReplacement] = useState(false);
  const [hasComparedModes, setHasComparedModes] = useState(false);
  
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  // Track when both modes have been tried
  useEffect(() => {
    if (hasTriedWithReplacement && hasTriedWithoutReplacement) {
      setHasComparedModes(true);
    }
  }, [hasTriedWithReplacement, hasTriedWithoutReplacement]);
  
  // Calculate total possible sequences
  function calculateTotal() {
    if (withReplacement) {
      return Math.pow(n, r);
    } else {
      if (r > n) return 0;
      let result = 1;
      for (let i = 0; i < r; i++) {
        result *= (n - i);
      }
      return result;
    }
  }
  
  // Generate a random sequence
  function generateSequence() {
    const sequence = [];
    const available = Array.from({length: n}, (_, i) => i + 1);
    
    for (let i = 0; i < r; i++) {
      if (withReplacement) {
        sequence.push(Math.floor(Math.random() * n) + 1);
      } else {
        if (available.length === 0) break;
        const index = Math.floor(Math.random() * available.length);
        sequence.push(available[index]);
        available.splice(index, 1);
      }
    }
    
    return sequence;
  }
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    
    let width = 600; // Default width
    const height = 500;
    
    try {
      const rect = svgRef.current.getBoundingClientRect();
      if (rect && rect.width > 0) {
        width = rect.width;
      }
    } catch (error) {
      console.warn('Failed to get SVG dimensions, using default:', error);
    }
    
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    
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
    
    // Draw bag
    const bagCx = innerWidth * 0.2;
    const bagCy = innerHeight * 0.5;
    const bagRadius = Math.min(innerWidth * 0.15, 80);
    
    g.append("circle")
      .attr("cx", bagCx)
      .attr("cy", bagCy)
      .attr("r", bagRadius)
      .attr("fill", "#1a1a1a")
      .attr("stroke", colorScheme.chart.primary)
      .attr("stroke-width", 3);
    
    g.append("text")
      .attr("x", bagCx)
      .attr("y", bagCy - bagRadius - 10)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "16px")
      .style("font-weight", "600")
      .text(`Bag with ${n} balls`);
    
    // Draw balls in bag
    const ballRadius = Math.min(bagRadius / 4, 15);
    const ballColors = d3.schemeCategory10;
    
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const ballR = bagRadius * 0.6;
      const ballX = bagCx + ballR * Math.cos(angle);
      const ballY = bagCy + ballR * Math.sin(angle);
      
      const ballGroup = g.append("g")
        .attr("class", `bag-ball bag-ball-${i + 1}`);
      
      ballGroup.append("circle")
        .attr("cx", ballX)
        .attr("cy", ballY)
        .attr("r", ballRadius)
        .attr("fill", ballColors[i % 10])
        .attr("stroke", "white")
        .attr("stroke-width", 2);
      
      ballGroup.append("text")
        .attr("x", ballX)
        .attr("y", ballY)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "white")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(i + 1);
    }
    
    // Draw slots for sequence
    const slotStartX = innerWidth * 0.5;
    const slotY = innerHeight * 0.5;
    const slotWidth = Math.min((innerWidth * 0.4) / r, 60);
    const slotSpacing = r >= 4 ? slotWidth * 1.2 : slotWidth * 1.3;
    
    // Determine label format based on number of positions
    const useCompactLabels = r >= 4;
    const labelFontSize = useCompactLabels ? "11px" : "14px";
    const labelOffset = useCompactLabels ? 15 : 20;
    
    for (let i = 0; i < r; i++) {
      const slotX = slotStartX + i * slotSpacing;
      
      g.append("rect")
        .attr("x", slotX - slotWidth / 2)
        .attr("y", slotY - slotWidth / 2)
        .attr("width", slotWidth)
        .attr("height", slotWidth)
        .attr("fill", "#1a1a1a")
        .attr("stroke", colors.chart.grid)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
      
      // Add position number inside slot (always visible)
      g.append("text")
        .attr("x", slotX)
        .attr("y", slotY - slotWidth / 2 - 5)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.grid)
        .style("font-size", "10px")
        .style("font-weight", "600")
        .text(i + 1);
      
      // Add label below with smart positioning
      if (useCompactLabels) {
        // For many positions, use staggered layout
        const stagger = i % 2 === 0;
        const yPos = slotY + slotWidth / 2 + (stagger ? labelOffset : labelOffset + 15);
        
        g.append("text")
          .attr("x", slotX)
          .attr("y", yPos)
          .attr("text-anchor", "middle")
          .attr("fill", colors.chart.text)
          .style("font-size", labelFontSize)
          .text(`P${i + 1}`);
      } else {
        // For few positions, use normal layout
        g.append("text")
          .attr("x", slotX)
          .attr("y", slotY + slotWidth / 2 + labelOffset)
          .attr("text-anchor", "middle")
          .attr("fill", colors.chart.text)
          .style("font-size", labelFontSize)
          .text(`Position ${i + 1}`);
      }
    }
    
    // Animation function
    function animateSequence(sequence) {
      const animationGroup = g.append("g").attr("class", "animation-group");
      
      // Track used balls for without replacement mode
      const usedBalls = new Set();
      
      sequence.forEach((ballNumber, index) => {
        const stepDelay = withReplacement ? index * 1200 : index * 800;
        const slotX = slotStartX + index * slotSpacing;
        const ballIndex = ballNumber - 1;
        const color = ballColors[ballIndex % 10];
        
        // Add to used balls set
        usedBalls.add(ballNumber);
        
        // Create ball for this draw
        const ball = animationGroup.append("g");
        
        const circle = ball.append("circle")
          .attr("cx", bagCx)
          .attr("cy", bagCy)
          .attr("r", 0)
          .attr("fill", color)
          .attr("stroke", "white")
          .attr("stroke-width", 2);
        
        const text = ball.append("text")
          .attr("x", bagCx)
          .attr("y", bagCy)
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", "white")
          .style("font-size", "12px")
          .style("font-weight", "600")
          .text(ballNumber)
          .attr("opacity", 0);
        
        // Step 1: Ball appears
        circle.transition()
          .delay(stepDelay)
          .duration(300)
          .attr("r", ballRadius);
        
        text.transition()
          .delay(stepDelay)
          .duration(300)
          .attr("opacity", 1);
        
        // Step 2: Ball moves to slot
        circle.transition()
          .delay(stepDelay + 300)
          .duration(500)
          .attr("cx", slotX)
          .attr("cy", slotY);
        
        text.transition()
          .delay(stepDelay + 300)
          .duration(500)
          .attr("x", slotX)
          .attr("y", slotY);
        
        // Different behavior based on replacement mode
        if (withReplacement && index < sequence.length - 1) {
          // For WITH replacement: show a visual return indicator
          // Create a dashed line showing the return path
          const returnPath = animationGroup.append("path")
            .attr("d", `M ${slotX} ${slotY} L ${bagCx} ${bagCy}`)
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5")
            .attr("fill", "none")
            .attr("opacity", 0);
          
          // Animate the return path
          returnPath.transition()
            .delay(stepDelay + 800)
            .duration(200)
            .attr("opacity", 0.5)
            .transition()
            .duration(200)
            .attr("opacity", 0);
          
          // Add a small "returns" indicator text
          const returnText = animationGroup.append("text")
            .attr("x", (slotX + bagCx) / 2)
            .attr("y", (slotY + bagCy) / 2 - 10)
            .attr("text-anchor", "middle")
            .attr("fill", colors.chart.text)
            .style("font-size", "10px")
            .style("font-style", "italic")
            .text("returns")
            .attr("opacity", 0);
          
          returnText.transition()
            .delay(stepDelay + 800)
            .duration(200)
            .attr("opacity", 0.7)
            .transition()
            .duration(200)
            .attr("opacity", 0);
        } else if (!withReplacement) {
          // For WITHOUT replacement: fade out the used ball in the bag
          // Select the actual ball group in the bag and fade it
          g.select(`.bag-ball-${ballNumber}`)
            .transition()
            .delay(stepDelay + 800)
            .duration(300)
            .select("circle")
            .attr("fill", "#4a5568")
            .attr("opacity", 0.3);
          
          g.select(`.bag-ball-${ballNumber}`)
            .select("text")
            .transition()
            .delay(stepDelay + 800)
            .duration(300)
            .attr("fill", "#9ca3af")
            .attr("opacity", 0.3);
        }
      });
      
      // Store animation group reference
      animationRef.current = animationGroup;
    }
    
    // Animate current sequence if exists
    if (currentSequence.length > 0) {
      animateSequence(currentSequence);
    }
    
  }, [n, r, currentSequence, withReplacement]);
  
  // Cleanup animation on unmount and parameter changes
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        // Interrupt all transitions
        if (svgRef.current) {
          d3.select(svgRef.current).selectAll("*").interrupt();
        }
        animationRef.current.remove();
        animationRef.current = null;
      }
    };
  }, [n, r, withReplacement]);
  
  // Draw one sequence
  function drawSequence() {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const sequence = generateSequence();
    setCurrentSequence(sequence);
    
    // Add to history
    setAllSequences(prev => [...prev.slice(-9), sequence]);
    setSequenceCount(prev => prev + 1);
    
    // Track which modes have been tried
    if (withReplacement) {
      setHasTriedWithReplacement(true);
    } else {
      setHasTriedWithoutReplacement(true);
    }
    
    // Animation duration
    const stepDuration = withReplacement ? 1200 : 800;
    const duration = r * stepDuration + 500;
    setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  }
  
  // Reset with proper cleanup
  function reset() {
    setCurrentSequence([]);
    setAllSequences([]);
    setSequenceCount(0);
    setIsAnimating(false);
    if (animationRef.current) {
      // Interrupt all transitions
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").interrupt();
      }
      animationRef.current.remove();
      animationRef.current = null;
    }
    // Reset ball appearances
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const ballColors = d3.schemeCategory10;
      
      // Reset all bag balls to original state
      for (let i = 0; i < n; i++) {
        svg.select(`.bag-ball-${i + 1} circle`)
          .transition()
          .duration(300)
          .attr("fill", ballColors[i % 10])
          .attr("opacity", 1);
        
        svg.select(`.bag-ball-${i + 1} text`)
          .transition()
          .duration(300)
          .attr("fill", "white")
          .attr("opacity", 1);
      }
    }
  }

  return (
    <VisualizationContainer 
      title="Ordered Samples (Permutations)" 
      className="p-2"
      tutorialSteps={tutorial_1_3_1}
      tutorialKey="ordered-samples-1-3-1"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Explore how ordered sampling works with and without replacement. 
              When order matters, we count permutations. Watch how the number of 
              possibilities changes based on whether items can be reused.
            </p>
          </VisualizationSection>

          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Sampling Mode</h4>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setWithReplacement(true)}
                className={cn(
                  "flex-1 px-3 py-2 rounded text-sm font-medium transition-colors",
                  withReplacement
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-700 hover:bg-neutral-600 text-white"
                )}
              >
                With Replacement
              </button>
              <button
                onClick={() => setWithReplacement(false)}
                className={cn(
                  "flex-1 px-3 py-2 rounded text-sm font-medium transition-colors",
                  !withReplacement
                    ? "bg-green-600 text-white"
                    : "bg-neutral-700 hover:bg-neutral-600 text-white"
                )}
              >
                Without Replacement
              </button>
            </div>
            
            {/* Controls */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-neutral-300">Total balls (n)</label>
                  <span className="text-sm font-mono text-yellow-400">{n}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={n}
                  onChange={(e) => {
                    setN(Number(e.target.value));
                    setR(Math.min(r, Number(e.target.value)));
                    reset();
                  }}
                  className="w-full"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-neutral-300">Balls to draw (r)</label>
                  <span className="text-sm font-mono text-purple-400">{r}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={withReplacement ? 6 : n}
                  value={r}
                  onChange={(e) => {
                    setR(Number(e.target.value));
                    reset();
                  }}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={drawSequence}
                disabled={isAnimating}
                className={cn(
                  "flex-1 px-3 py-2 rounded text-sm font-medium transition-colors",
                  isAnimating
                    ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                {isAnimating ? "Drawing..." : "Draw Sequence"}
              </button>
              <button
                onClick={reset}
                className={cn(
                  "px-3 py-2 rounded text-sm font-medium transition-colors",
                  "bg-neutral-700 hover:bg-neutral-600 text-white"
                )}
              >
                Reset
              </button>
            </div>
            
            <label className="flex items-center gap-2 text-sm mt-3">
              <input 
                type="checkbox" 
                checked={showWorkedExample} 
                onChange={e => setShowWorkedExample(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-neutral-300">Show worked example</span>
            </label>
          </VisualizationSection>

          {/* Statistics */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Counting Statistics</h4>
            
            <div className="bg-neutral-800 rounded-lg p-3 border border-yellow-600/50">
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-yellow-400 mb-1">
                  {calculateTotal()} possible sequences
                </div>
                <div className="text-sm text-neutral-300">
                  {withReplacement ? (
                    <span>{n}<sup>{r}</sup> = {calculateTotal()}</span>
                  ) : (
                    <span>P({n},{r}) = {n}!/({n}-{r})! = {calculateTotal()}</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Recent sequences */}
            {allSequences.length > 0 && (
              <div className="mt-3">
                <h5 className="text-sm font-semibold text-neutral-300 mb-2">
                  Recent Sequences ({sequenceCount} drawn)
                </h5>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {allSequences.slice().reverse().map((seq, i) => (
                    <div key={i} className="text-xs font-mono text-neutral-400">
                      {seq.join('-')}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </VisualizationSection>

          {/* Mathematical Discoveries */}
          <VisualizationSection className="p-3">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Sampling Discoveries</h4>
            
            <div className="space-y-3 text-xs text-neutral-300">
              {sequenceCount === 0 && (
                <div>
                  <p className="text-neutral-400">Draw sequences to explore ordered sampling.</p>
                  <p className="text-purple-300 mt-1">
                    Try both "with replacement" and "without replacement" modes.
                  </p>
                </div>
              )}
              
              {hasTriedWithReplacement && !hasTriedWithoutReplacement && (
                <div className="p-2 bg-blue-900/20 border border-blue-600/30 rounded">
                  <p className="font-medium text-blue-400">With Replacement Discovered!</p>
                  <p className="mt-1">Each position has {n} choices (balls return to bag)</p>
                  <p className="mt-1">Total sequences: n^r = {n}^{r} = {Math.pow(n, r)}</p>
                </div>
              )}
              
              {hasTriedWithoutReplacement && !hasTriedWithReplacement && (
                <div className="p-2 bg-green-900/20 border border-green-600/30 rounded">
                  <p className="font-medium text-green-400">Without Replacement Discovered!</p>
                  <p className="mt-1">Choices decrease: {n}, {n-1}, {n-2}...</p>
                  <p className="mt-1">Total: P({n},{r}) = {calculateTotal()}</p>
                </div>
              )}
              
              {hasComparedModes && (
                <>
                  <div className="p-2 bg-purple-900/20 border border-purple-600/30 rounded">
                    <p className="font-medium text-purple-400">Key Comparison Found!</p>
                    <p className="mt-1 space-y-1">
                      <span className="block">With replacement: {Math.pow(n, r)} sequences</span>
                      <span className="block">Without replacement: {calculateTotal()} sequences</span>
                    </p>
                    <p className="mt-2 text-yellow-400">
                      Ratio: {(Math.pow(n, r) / calculateTotal()).toFixed(2)}x more with replacement
                    </p>
                  </div>
                </>
              )}
              
              {sequenceCount > 0 && (
                <div className="p-2 bg-neutral-800 rounded">
                  <p className="text-neutral-400">Current Mode: {withReplacement ? 'With' : 'Without'} Replacement</p>
                  <p className="font-mono text-sm mt-1">
                    {sequenceCount} sequence{sequenceCount > 1 ? 's' : ''} drawn
                  </p>
                  {allSequences.length > 0 && (
                    <div className="mt-2 text-xs">
                      <p className="text-neutral-500">Recent sequences:</p>
                      {allSequences.slice(-3).map((seq, i) => (
                        <div key={i} className="font-mono text-cyan-400">
                          {seq.join('-')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {(r > n && !withReplacement) && (
                <div className="text-yellow-400 italic">
                  <p>Note: r {'>'} n without replacement</p>
                  <p>No valid sequences possible!</p>
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>

        {/* Right Panel */}
        <div className="lg:w-2/3 space-y-4">
          <GraphContainer height="550px">
            <svg ref={svgRef} style={{ width: "100%", height: 550 }} />
          </GraphContainer>
          
          {showWorkedExample && (
            <OrderedSamplesWorkedExample 
              n={n} 
              r={r} 
              withReplacement={withReplacement} 
            />
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default OrderedSamples;