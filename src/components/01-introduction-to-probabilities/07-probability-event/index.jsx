"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../../lib/design-system';
import { tutorial_1_5_1 } from '@/tutorials/chapter1';
import { useMathJax } from '@/hooks/useMathJax';

// Use probability color scheme
const colorScheme = createColorScheme('probability');

// Animation timing constants
const ANIMATION_CONSTANTS = {
  HOVER_TRANSITION_DURATION: 150, // Duration for hover animations
};

// Worked Example Component for Dice
const DiceWorkedExample = memo(function DiceWorkedExample({ event }) {
  const contentRef = useMathJax([event]);
  
  const examples = {
    even: {
      title: "Even Number",
      event: "A = \\{2, 4, 6\\}",
      favorable: 3,
      fraction: "\\frac{3}{6}",
      simplified: "\\frac{1}{2}"
    },
    prime: {
      title: "Prime Number",
      event: "B = \\{2, 3, 5\\}",
      favorable: 3,
      fraction: "\\frac{3}{6}",
      simplified: "\\frac{1}{2}"
    },
    greater: {
      title: "Greater Than 4",
      event: "C = \\{5, 6\\}",
      favorable: 2,
      fraction: "\\frac{2}{6}",
      simplified: "\\frac{1}{3}"
    },
    multiple3: {
      title: "Multiple of 3",
      event: "D = \\{3, 6\\}",
      favorable: 2,
      fraction: "\\frac{2}{6}",
      simplified: "\\frac{1}{3}"
    }
  };
  
  const example = examples[event] || examples.even;
  
  return (
    <div ref={contentRef} style={{
      backgroundColor: '#2A303C',
      padding: '1rem',
      borderRadius: '8px',
      color: '#e0e0e0',
      marginTop: '0.5rem',
      fontSize: '0.75rem' // Smaller base font size
    }}>
      <h4 style={{ fontSize: '0.875rem', fontWeight: '600', borderBottom: '1px solid #4A5568', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
        Example: {example.title}
      </h4>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <p style={{ marginBottom: '0.125rem', fontWeight: '500' }}>Sample Space:</p>
        <div style={{ fontSize: '0.875rem' }} dangerouslySetInnerHTML={{ __html: `\\( S = \\{1, 2, 3, 4, 5, 6\\} \\)` }} />
      </div>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <p style={{ marginBottom: '0.125rem', fontWeight: '500' }}>Event:</p>
        <div style={{ fontSize: '0.875rem' }} dangerouslySetInnerHTML={{ __html: `\\( ${example.event} \\)` }} />
      </div>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <p style={{ marginBottom: '0.125rem', fontWeight: '500' }}>Probability:</p>
        <div style={{ fontSize: '0.875rem' }} dangerouslySetInnerHTML={{ __html: 
          `\\( P(\\text{Event}) = ${example.fraction} = ${example.simplified} \\)` 
        }} />
      </div>
      
      <div style={{ backgroundColor: '#1A202C', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>
        <strong>Key:</strong> Favorable outcomes ÷ Total outcomes
      </div>
    </div>
  );
});


function ProbabilityEvent() {
  const [eventType, setEventType] = useState('even'); // for dice
  const [trials, setTrials] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [history, setHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDiceExample, setShowDiceExample] = useState(true);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [targetTrials, setTargetTrials] = useState(1000);
  const [hasRunTrials, setHasRunTrials] = useState(false);
  const [hasObservedConvergence, setHasObservedConvergence] = useState(false);
  const [eventTypesExplored, setEventTypesExplored] = useState(new Set());
  
  const svgRef = useRef(null);
  const intervalRef = useRef(null);
  const autoRunRef = useRef(null);
  const trialsRef = useRef(0);
  
  // Define dice events
  const diceEvents = {
    even: { name: "Even Number", check: (n) => n % 2 === 0, theoretical: 1/2, values: [2, 4, 6] },
    prime: { name: "Prime Number", check: (n) => [2, 3, 5].includes(n), theoretical: 1/2, values: [2, 3, 5] },
    greater: { name: "Greater than 4", check: (n) => n > 4, theoretical: 1/3, values: [5, 6] },
    multiple3: { name: "Multiple of 3", check: (n) => n % 3 === 0, theoretical: 1/3, values: [3, 6] }
  };
  
  // Get current event configuration
  function getCurrentEvent() {
    return diceEvents[eventType];
  }
  
  // Run single trial
  function runTrial() {
    const outcome = Math.floor(Math.random() * 6) + 1;
    const event = getCurrentEvent();
    const success = event.check(outcome);
    
    setTrials(prev => {
      trialsRef.current = prev + 1;
      if (prev + 1 >= 1) setHasRunTrials(true);
      if (prev + 1 >= 50) setHasObservedConvergence(true);
      return prev + 1;
    });
    if (success) setSuccesses(prev => prev + 1);
    
    setHistory(prev => [...(prev || []).slice(-99), { outcome, success }]);
    
    return { outcome, success };
  }
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Store the bounding rect immediately to prevent race conditions
    let width = 800; // Default width
    let height = 500; // Default height
    
    try {
      const boundingRect = svgRef.current.getBoundingClientRect();
      // Validate dimensions and ensure they are valid numbers
      if (boundingRect && 
          typeof boundingRect.width === 'number' && 
          boundingRect.width > 0 && 
          !isNaN(boundingRect.width) &&
          isFinite(boundingRect.width)) {
        width = boundingRect.width;
      }
      if (boundingRect && 
          typeof boundingRect.height === 'number' && 
          boundingRect.height > 0 && 
          !isNaN(boundingRect.height) &&
          isFinite(boundingRect.height)) {
        height = boundingRect.height;
      }
    } catch (error) {
      // Use proper error handling instead of console.warn
      if (process.env.NODE_ENV === 'development') {
        console.error('SVG dimension error in ProbabilityEvent:', error);
      }
      // Dimensions already set to safe defaults above
    }
    
    // Final validation to ensure dimensions are safe for SVG
    width = Math.max(300, Math.min(width, 2000)); // Clamp between 300-2000px
    height = Math.max(200, Math.min(height, 1200)); // Clamp between 200-1200px
    
    const svg = d3.select(svgRef.current);
    const margin = { top: 120, right: 40, bottom: 60, left: 60 }; // Increased top margin from 80 to 120
    
    // Clear existing elements with proper selection
    svg.select("rect.probability-background").remove();
    svg.select("g.probability-chart").remove();
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("class", "probability-background")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("class", "probability-chart")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Ensure inner dimensions are positive
    const innerWidth = Math.max(100, width - margin.left - margin.right);
    const innerHeight = Math.max(100, height - margin.top - margin.bottom);
    
    // Create probability visualization for dice
    const event = getCurrentEvent();
    const theoretical = event.theoretical;
    const experimental = trials > 0 ? successes / trials : 0;
      
      // Scales for bar chart
      const xScale = d3.scaleBand()
        .domain(['Theoretical', 'Experimental'])
        .range([0, innerWidth])
        .padding(0.5);
      
      const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);
      
      // Draw bars
      const data = [
        { label: 'Theoretical', value: theoretical, color: colorScheme.chart.secondary },
        { label: 'Experimental', value: experimental, color: colorScheme.chart.primary }
      ];
      
      g.selectAll('.bar')
        .data(data)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.label))
        .attr('y', d => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .attr('height', d => innerHeight - yScale(d.value))
        .attr('fill', d => d.color)
        .attr('opacity', 0.8);
      
      // Add value labels with proper formatting
      g.selectAll('.label')
        .data(data)
        .join('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('font-family', 'monospace')
        .style('font-size', '16px')
        .style('font-weight', '600')
        .text(d => d.value.toFixed(3));
      
      // Add axes
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('fill', colors.chart.text)
        .style('font-size', '14px');
      
      // Add y-axis
      g.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format('.0%')))
        .selectAll('text')
        .attr('fill', colors.chart.text)
        .style('font-size', '12px');
      
      // Add y-axis label
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (innerHeight / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .attr('fill', colors.chart.text)
        .text('Probability');
      
      // Show all dice faces with highlighting for favorable outcomes
      const dieSize = 40;
      const diceSpacing = 10;
      const totalDiceWidth = 6 * dieSize + 5 * diceSpacing;
      const diceStartX = (innerWidth - totalDiceWidth) / 2;
      const diceY = -70; // Moved dice higher to create more space
      
      // Draw all 6 dice
      for (let i = 1; i <= 6; i++) {
        const x = diceStartX + (i - 1) * (dieSize + diceSpacing);
        const isFavorable = event.values.includes(i);
        
        // Create a group for each die
        const dieGroup = g.append('g')
          .attr('transform', `translate(${x}, ${diceY})`)
          .style('cursor', 'pointer')
          .on('mouseover', function() {
            d3.select(this)
              .transition()
              .duration(ANIMATION_CONSTANTS.HOVER_TRANSITION_DURATION)
              .attr('transform', `translate(${x}, ${diceY}) scale(1.1)`);
          })
          .on('mouseout', function() {
            d3.select(this)
              .transition()
              .duration(ANIMATION_CONSTANTS.HOVER_TRANSITION_DURATION)
              .attr('transform', `translate(${x}, ${diceY}) scale(1)`);
          });
        
        // Die background
        dieGroup.append('rect')
          .attr('x', -dieSize/2)
          .attr('y', -dieSize/2)
          .attr('width', dieSize)
          .attr('height', dieSize)
          .attr('fill', isFavorable ? colorScheme.chart.primary : '#1a1a1a')
          .attr('stroke', isFavorable ? 'white' : colors.chart.grid)
          .attr('stroke-width', isFavorable ? 2 : 1)
          .attr('rx', 6)
          .attr('opacity', isFavorable ? 1 : 0.5);
        
        // Die dots pattern
        const dots = [
          [[0.5, 0.5]], // 1
          [[0.25, 0.25], [0.75, 0.75]], // 2
          [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]], // 3
          [[0.25, 0.25], [0.25, 0.75], [0.75, 0.25], [0.75, 0.75]], // 4
          [[0.25, 0.25], [0.25, 0.75], [0.5, 0.5], [0.75, 0.25], [0.75, 0.75]], // 5
          [[0.25, 0.25], [0.25, 0.5], [0.25, 0.75], [0.75, 0.25], [0.75, 0.5], [0.75, 0.75]] // 6
        ];
        
        dots[i - 1].forEach(([dx, dy]) => {
          dieGroup.append('circle')
            .attr('cx', (dx - 0.5) * dieSize)
            .attr('cy', (dy - 0.5) * dieSize)
            .attr('r', 3)
            .attr('fill', isFavorable ? 'white' : colors.chart.text)
            .attr('opacity', isFavorable ? 1 : 0.6);
        });
        
        // Number below die (for clarity)
        g.append('text')
          .attr('x', x)
          .attr('y', diceY + dieSize/2 + 12)
          .attr('text-anchor', 'middle')
          .attr('fill', isFavorable ? colorScheme.chart.primary : colors.chart.text)
          .style('font-size', '12px')
          .style('font-weight', isFavorable ? 'bold' : 'normal')
          .text(i);
      }
      
      // Add event description above dice
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', diceY - 55)
        .attr('text-anchor', 'middle')
        .attr('fill', colorScheme.chart.primary)
        .style('font-size', '15px')
        .style('font-weight', '600')
        .text(`Event: ${event.name}`);
      
      // Add favorable outcomes indicator
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', diceY + dieSize + 30)
        .attr('text-anchor', 'middle')
        .attr('fill', colorScheme.chart.tertiary)
        .style('font-size', '14px')
        .style('font-weight', '600')
        .text(`Favorable: {${event.values.join(', ')}}`);
    
    // Cleanup function for D3
    return () => {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").interrupt();
        svg.select("rect.probability-background").remove();
        svg.select("g.probability-chart").remove();
      }
    };
  }, [eventType, trials, successes]);
  
  // Run multiple trials
  function runMultipleTrials(count) {
    setIsRunning(true);
    let completed = 0;
    
    intervalRef.current = setInterval(() => {
      runTrial();
      completed++;
      
      if (completed >= count) {
        clearInterval(intervalRef.current);
        setIsRunning(false);
      }
    }, 50);
  }
  
  // Stop running
  function stop() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    }
  }
  
  // Reset
  function reset() {
    stop();
    stopAutoRun();
    setTrials(0);
    setSuccesses(0);
    setHistory([]);
    trialsRef.current = 0;
  }
  
  // Track event type changes
  useEffect(() => {
    setEventTypesExplored(prev => new Set([...prev, eventType]));
  }, [eventType]);
  
  // Auto-run functions
  function startAutoRun() {
    if (autoRunRef.current) return;
    
    setIsAutoRunning(true);
    const runSpeed = 50; // ms between trials
    
    autoRunRef.current = setInterval(() => {
      if (trialsRef.current >= targetTrials) {
        stopAutoRun();
        return;
      }
      runTrial();
    }, runSpeed);
  }
  
  function stopAutoRun() {
    if (autoRunRef.current) {
      clearInterval(autoRunRef.current);
      autoRunRef.current = null;
    }
    setIsAutoRunning(false);
  }
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (autoRunRef.current) {
        clearInterval(autoRunRef.current);
      }
    };
  }, []);

  return (
    <VisualizationContainer 
      title="Probability of an Event" 
      className="p-2"
      tutorialSteps={tutorial_1_5_1}
      tutorialKey="probability-event-1-5-1"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              For equally likely outcomes, the probability of an event A is:
            </p>
            <div className="mt-2 p-2 bg-neutral-800 rounded text-center">
              <div className="text-sm text-neutral-300">P(A) = |A| / |S|</div>
              <div className="text-xs text-neutral-400 mt-1">
                (favorable outcomes) / (total outcomes)
              </div>
            </div>
          </VisualizationSection>

          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Dice Event Selection</h4>
            
            {/* Event selection for dice */}
            <div className="mb-3">
              <label className="text-sm text-neutral-300 mb-2 block">Choose an Event</label>
              <select
                value={eventType}
                onChange={(e) => {
                  setEventType(e.target.value);
                  reset();
                  stopAutoRun();
                }}
                className={cn(components.select, "w-full")}
              >
                <option value="even">Even Number {'{2, 4, 6}'}</option>
                <option value="prime">Prime Number {'{2, 3, 5}'}</option>
                <option value="greater">Greater than 4 {'{5, 6}'}</option>
                <option value="multiple3">Multiple of 3 {'{3, 6}'}</option>
              </select>
            </div>
            
            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={() => runTrial()}
                disabled={isRunning}
                className={cn(
                  "w-full px-3 py-2 rounded text-sm font-medium transition-colors",
                  isRunning
                    ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                Run Single Trial
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => runMultipleTrials(10)}
                  disabled={isRunning}
                  className={cn(
                    "px-3 py-2 rounded text-sm font-medium transition-colors",
                    isRunning
                      ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  )}
                >
                  Run 10
                </button>
                <button
                  onClick={() => runMultipleTrials(100)}
                  disabled={isRunning}
                  className={cn(
                    "px-3 py-2 rounded text-sm font-medium transition-colors",
                    isRunning
                      ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  )}
                >
                  Run 100
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={stop}
                  disabled={!isRunning}
                  className={cn(
                    "flex-1 px-3 py-2 rounded text-sm font-medium transition-colors",
                    !isRunning
                      ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  )}
                >
                  Stop
                </button>
                <button
                  onClick={reset}
                  className={cn(
                    "flex-1 px-3 py-2 rounded text-sm font-medium transition-colors",
                    "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  Reset
                </button>
              </div>
            </div>
            
            {/* Show example */}
            <label className="flex items-center gap-2 text-sm mt-3">
              <input 
                type="checkbox" 
                checked={showDiceExample} 
                onChange={e => setShowDiceExample(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-neutral-300">Show worked example</span>
            </label>
          </VisualizationSection>

          {/* Results */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Results</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-300">Total Trials:</span>
                <span className="font-mono text-white">{trials}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Successes:</span>
                <span className="font-mono text-green-400">{successes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Experimental P:</span>
                <span className="font-mono text-yellow-400">
                  {trials > 0 ? (successes / trials).toFixed(4) : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Theoretical P:</span>
                <span className="font-mono text-blue-400">
                  {getCurrentEvent().theoretical.toFixed(4)}
                </span>
              </div>
              {trials > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-300">Difference:</span>
                  <span className="font-mono text-red-400">
                    {Math.abs(successes / trials - getCurrentEvent().theoretical).toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </VisualizationSection>

          {/* Auto-Run Section */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Auto-Run Experiment</h4>
            
            <div className="mb-3">
              <label className="text-sm text-neutral-300 mb-1 block">Target Trials</label>
              <select
                value={targetTrials}
                onChange={(e) => setTargetTrials(Number(e.target.value))}
                className={cn(components.select, "w-full")}
              >
                <option value={100}>100 trials</option>
                <option value={500}>500 trials</option>
                <option value={1000}>1,000 trials</option>
                <option value={5000}>5,000 trials</option>
              </select>
            </div>
            
            <button
              onClick={isAutoRunning ? stopAutoRun : startAutoRun}
              disabled={isRunning}
              className={cn(
                "w-full px-3 py-2 rounded text-sm font-medium transition-colors",
                isAutoRunning
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : isRunning
                  ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              {isAutoRunning ? "Stop" : "Start"} Auto-Run
            </button>
            
            {isAutoRunning && (
              <div className="mt-3">
                <div className="text-xs text-neutral-300 mb-1">
                  Progress: {trials} / {targetTrials}
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((trials / targetTrials) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </VisualizationSection>

          {/* Mathematical Discoveries */}
          <VisualizationSection className="p-3">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Probability Discoveries</h4>
            
            <div className="space-y-3 text-xs text-neutral-300">
              {!hasRunTrials && (
                <div>
                  <p className="text-neutral-400">Run trials to discover how experimental probability relates to theoretical probability.</p>
                  <p className="text-purple-300 mt-1">
                    Try different events to explore various probability values.
                  </p>
                </div>
              )}
              
              {hasRunTrials && trials > 0 && (
                <div className="p-2 bg-neutral-800 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-neutral-400">Theoretical:</span>
                    <span className="font-mono text-yellow-400">{getCurrentEvent().theoretical.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Experimental:</span>
                    <span className="font-mono text-cyan-400">{trials > 0 ? (successes / trials).toFixed(3) : '0.000'}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-neutral-700">
                    <span className="text-neutral-400">Difference:</span>
                    <span className="font-mono text-sm">{trials > 0 ? Math.abs(successes / trials - getCurrentEvent().theoretical).toFixed(4) : '0.0000'}</span>
                  </div>
                </div>
              )}
              
              {hasObservedConvergence && (
                <div className="p-2 bg-purple-900/20 border border-purple-600/30 rounded">
                  <p className="font-medium text-purple-400">Law of Large Numbers Discovered!</p>
                  <p className="mt-1">As trials increase, experimental probability converges to theoretical probability.</p>
                </div>
              )}
              
              {eventTypesExplored.size > 1 && (
                <div className="p-2 bg-blue-900/20 border border-blue-600/30 rounded">
                  <p className="font-medium text-blue-400">Events Explored: {eventTypesExplored.size}/4</p>
                  <div className="mt-1 space-y-0.5">
                    {Array.from(eventTypesExplored).map(type => (
                      <div key={type} className="text-xs">
                        • {diceEvents[type].name}: {diceEvents[type].theoretical.toFixed(3)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {trials >= 1000 && (
                <div className="text-green-400">
                  <p className="font-medium">Statistical Insight:</p>
                  <p className="text-xs mt-1">With {trials} trials, the error margin is consistently below 0.01!</p>
                </div>
              )}
              
              {isAutoRunning && (
                <div className="text-xs text-neutral-400 italic">
                  Auto-running to {targetTrials} trials...
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
          
          {showDiceExample && (
            <DiceWorkedExample event={eventType} />
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default ProbabilityEvent;