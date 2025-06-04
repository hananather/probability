"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';

// Use probability color scheme
const colorScheme = createColorScheme('probability');

function ConditionalProbability() {
  const [currentPerspective, setCurrentPerspective] = useState('universe');
  const [isAnimating, setIsAnimating] = useState(false);
  const [samplesDropped, setSamplesDropped] = useState(0);
  const [showProbabilities, setShowProbabilities] = useState(true);
  const [eventsData, setEventsData] = useState([
    { x: 1/6, y: 0.2, width: 1/3, height: 0.05, name: 'A' },
    { x: 1/3, y: 0.4, width: 1/3, height: 0.05, name: 'B' },
    { x: 1/2, y: 0.6, width: 1/3, height: 0.05, name: 'C' }
  ]);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [targetSamples, setTargetSamples] = useState(1000);
  
  const svgBallRef = useRef(null);
  const svgProbRef = useRef(null);
  const intervalRef = useRef(null);
  const ballsRef = useRef([]);
  const autoRunRef = useRef(null);
  
  // Calculate overlap between events
  function calcOverlap(index, perspective) {
    let a1, a2;
    if (perspective === 'a') {
      a1 = eventsData[0].x;
      a2 = a1 + eventsData[0].width;
    } else if (perspective === 'b') {
      a1 = eventsData[1].x;
      a2 = a1 + eventsData[1].width;
    } else if (perspective === 'c') {
      a1 = eventsData[2].x;
      a2 = a1 + eventsData[2].width;
    } else {
      a1 = 0;
      a2 = 1;
    }
    
    const b1 = eventsData[index].x;
    const b2 = b1 + eventsData[index].width;
    
    let overlap = 0;
    // Calculate intersection
    if (a1 <= b1 && b1 <= a2) {
      overlap = b2 <= a2 ? (b2 - b1) : (a2 - b1);
    } else if (a1 <= b2 && b2 <= a2) {
      overlap = b1 <= a1 ? (b2 - a1) : (b2 - b1);
    } else if (b1 <= a1 && a2 <= b2) {
      overlap = a2 - a1;
    }
    
    return Math.max(0, overlap);
  }
  
  // Get domain width based on perspective
  function getDomainWidth() {
    if (currentPerspective === 'a') return eventsData[0].width;
    if (currentPerspective === 'b') return eventsData[1].width;
    if (currentPerspective === 'c') return eventsData[2].width;
    return 1;
  }
  
  // Main ball visualization
  useEffect(() => {
    if (!svgBallRef.current) return;
    
    const svg = d3.select(svgBallRef.current);
    const { width } = svgBallRef.current.getBoundingClientRect();
    const height = 500;
    const padding = 25;
    
    // Clear and setup
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // Create clip path
    const clipPath = svg.append("clipPath")
      .attr("id", "viewCP")
      .append("rect")
      .attr("x", padding)
      .attr("y", padding)
      .attr("width", width - 2 * padding)
      .attr("height", height - 2 * padding);
    
    const container = svg.append("g")
      .attr("clip-path", "url(#viewCP)");
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain(currentPerspective === 'universe' ? [0, 1] : 
               currentPerspective === 'a' ? [eventsData[0].x, eventsData[0].x + eventsData[0].width] :
               currentPerspective === 'b' ? [eventsData[1].x, eventsData[1].x + eventsData[1].width] :
               [eventsData[2].x, eventsData[2].x + eventsData[2].width])
      .range([padding, width - padding]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([padding, height - padding]);
    
    const xWidthScale = d3.scaleLinear()
      .domain([0, getDomainWidth()])
      .range([0, width - 2 * padding]);
    
    // Draw events
    const events = container.selectAll("g.event")
      .data(eventsData)
      .enter()
      .append("g")
      .attr("class", "event");
    
    // Event rectangles
    const rects = events.append("rect")
      .attr("class", d => `${d.name} shelf`)
      .attr("x", d => xScale(d.x))
      .attr("y", d => yScale(d.y))
      .attr("width", d => xWidthScale(d.width))
      .attr("height", d => yScale(d.height))
      .attr("fill", (d, i) => [colorScheme.chart.primary, colorScheme.chart.secondary, colorScheme.chart.tertiary][i])
      .attr("opacity", 0.7)
      .attr("stroke", "white")
      .attr("stroke-width", 2);
    
    // Borders for dragging
    const leftBorders = events.append("line")
      .attr("class", d => `${d.name} border`)
      .attr("x1", d => xScale(d.x))
      .attr("y1", d => yScale(d.y))
      .attr("x2", d => xScale(d.x))
      .attr("y2", d => yScale(d.y + d.height))
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .attr("cursor", "ew-resize")
      .attr("opacity", 0);
    
    const rightBorders = events.append("line")
      .attr("class", d => `${d.name} border`)
      .attr("x1", d => xScale(d.x + d.width))
      .attr("y1", d => yScale(d.y))
      .attr("x2", d => xScale(d.x + d.width))
      .attr("y2", d => yScale(d.y + d.height))
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .attr("cursor", "ew-resize")
      .attr("opacity", 0);
    
    // Labels
    events.append("text")
      .attr("x", d => xScale(d.x + d.width / 2))
      .attr("y", d => yScale(d.y + d.height + 0.05))
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "16px")
      .style("font-weight", "600")
      .text(d => d.name);
    
    // Drag behaviors
    const dragRect = d3.drag()
      .on("drag", function(event, d) {
        const i = eventsData.findIndex(e => e.name === d.name);
        const x = Math.max(0, Math.min(xScale.invert(event.x), 1 - d.width));
        const newData = [...eventsData];
        newData[i] = { ...d, x };
        setEventsData(newData);
      });
    
    const dragLeft = d3.drag()
      .on("drag", function(event, d) {
        const i = eventsData.findIndex(e => e.name === d.name);
        const x = Math.max(0, Math.min(xScale.invert(event.x), d.x + d.width, 1));
        const change = d.x - x;
        const newData = [...eventsData];
        newData[i] = { ...d, x, width: Math.max(0.05, d.width + change) };
        setEventsData(newData);
      });
    
    const dragRight = d3.drag()
      .on("drag", function(event, d) {
        const i = eventsData.findIndex(e => e.name === d.name);
        const w = Math.max(0.05, Math.min(xScale.invert(event.x) - d.x, 1 - d.x));
        const newData = [...eventsData];
        newData[i] = { ...d, width: w };
        setEventsData(newData);
      });
    
    rects.call(dragRect);
    leftBorders.call(dragLeft);
    rightBorders.call(dragRight);
    
    // Show borders on hover
    events.on("mouseenter", function() {
      d3.select(this).selectAll(".border").attr("opacity", 1);
    }).on("mouseleave", function() {
      d3.select(this).selectAll(".border").attr("opacity", 0);
    });
    
    // Ball container
    const ballContainer = container.append("g").attr("class", "balls");
    
    // Drop ball function
    function dropBall() {
      const p = Math.random();
      const duration = 2000;
      
      // Determine which events the ball passes through
      const eventsHit = [];
      eventsData.forEach(event => {
        if (event.x <= p && p <= event.x + event.width) {
          eventsHit.push(event);
        }
      });
      
      // Create ball
      const ball = ballContainer.append("circle")
        .attr("cx", xScale(p))
        .attr("cy", yScale(0))
        .attr("r", 5)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 1);
      
      // Animate through events
      let currentY = 0;
      eventsHit.forEach((event, i) => {
        ball.transition()
          .delay(i * duration / eventsHit.length)
          .duration(duration / eventsHit.length)
          .ease(d3.easeBounceOut)
          .attr("cy", yScale(event.y))
          .attr("fill", () => {
            if (event.name === 'A') return colorScheme.chart.primary;
            if (event.name === 'B') return colorScheme.chart.secondary;
            return colorScheme.chart.tertiary;
          });
      });
      
      // Final position
      ball.transition()
        .delay(duration)
        .duration(500)
        .attr("cy", yScale(1))
        .on("end", function() {
          d3.select(this).remove();
          setSamplesDropped(prev => prev + 1);
        });
      
      // Store ball data
      ballsRef.current.push({ p, events: eventsHit });
    }
    
    // Store dropBall function for interval
    svgBallRef.current.dropBall = dropBall;
    
  }, [eventsData, currentPerspective]);
  
  // Probability bar chart
  useEffect(() => {
    if (!svgProbRef.current || !showProbabilities) return;
    
    const svg = d3.select(svgProbRef.current);
    const { width } = svgProbRef.current.getBoundingClientRect();
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 20 };
    
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleBand()
      .domain([0, 1, 2])
      .range([0, width - margin.left - margin.right])
      .padding(0.3);
    
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin.top - margin.bottom, 0]);
    
    // Calculate probabilities
    const domainWidth = getDomainWidth();
    const probs = eventsData.map((_, i) => calcOverlap(i, currentPerspective) / domainWidth);
    
    // Bars
    g.selectAll(".bar")
      .data(probs)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => xScale(i))
      .attr("y", d => yScale(d))
      .attr("width", xScale.bandwidth())
      .attr("height", d => yScale(0) - yScale(d))
      .attr("fill", (d, i) => [colorScheme.chart.primary, colorScheme.chart.secondary, colorScheme.chart.tertiary][i])
      .attr("opacity", 0.7);
    
    // Values on bars
    g.selectAll(".value")
      .data(probs)
      .enter()
      .append("text")
      .attr("class", "value")
      .attr("x", (d, i) => xScale(i) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text(d => d.toFixed(3));
    
    // X axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(i => {
        const labels = currentPerspective === 'universe' ? 
          ['P(A)', 'P(B)', 'P(C)'] :
          currentPerspective === 'a' ?
          ['P(A|A)', 'P(B|A)', 'P(C|A)'] :
          currentPerspective === 'b' ?
          ['P(A|B)', 'P(B|B)', 'P(C|B)'] :
          ['P(A|C)', 'P(B|C)', 'P(C|C)'];
        return labels[i];
      });
    
    g.append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px");
    
    g.select(".domain").attr("stroke", colors.chart.grid);
    g.selectAll(".tick line").attr("stroke", colors.chart.grid);
    
  }, [eventsData, currentPerspective, showProbabilities]);
  
  // Start/stop animation
  function startAnimation() {
    if (intervalRef.current) return;
    setIsAnimating(true);
    
    intervalRef.current = setInterval(() => {
      if (svgBallRef.current && svgBallRef.current.dropBall) {
        svgBallRef.current.dropBall();
      }
    }, 100);
  }
  
  function stopAnimation() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAnimating(false);
  }
  
  // Auto-run functions
  function startAutoRun() {
    if (autoRunRef.current) return;
    
    setIsAutoRunning(true);
    const runSpeed = 50; // ms between samples
    
    autoRunRef.current = setInterval(() => {
      setSamplesDropped(currentSamples => {
        if (currentSamples >= targetSamples) {
          stopAutoRun();
          return currentSamples;
        }
        if (svgBallRef.current && svgBallRef.current.dropBall) {
          svgBallRef.current.dropBall();
        }
        return currentSamples;
      });
    }, runSpeed);
  }
  
  function stopAutoRun() {
    if (autoRunRef.current) {
      clearInterval(autoRunRef.current);
      autoRunRef.current = null;
    }
    setIsAutoRunning(false);
  }
  
  // Cleanup on unmount
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
  
  // Check independence
  function checkIndependence(event1, event2) {
    const i1 = eventsData.findIndex(e => e.name === event1);
    const i2 = eventsData.findIndex(e => e.name === event2);
    
    const p1 = eventsData[i1].width;
    const p2 = eventsData[i2].width;
    const pIntersect = calcOverlap(i1, 'universe');
    const p2Given1 = eventsData[i1].width > 0 ? calcOverlap(i2, event1.toLowerCase()) / eventsData[i1].width : 0;
    
    return Math.abs(p2Given1 - p2) < 0.01;
  }

  return (
    <VisualizationContainer title="Conditional Probability and Independence" className="p-2">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Explore conditional probability by changing perspectives. See how P(B|A) differs 
              from P(B) and understand when events are independent.
            </p>
            <div className="mt-2 p-2 bg-neutral-800 rounded text-xs text-neutral-300">
              <strong>P(B|A) = P(A∩B) / P(A)</strong>
            </div>
          </VisualizationSection>

          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Perspective</h4>
            
            <div className="space-y-2">
              {[
                { id: 'universe', label: 'Universe', desc: 'P(A), P(B), P(C)' },
                { id: 'a', label: 'Given A', desc: 'P(B|A), P(C|A)' },
                { id: 'b', label: 'Given B', desc: 'P(A|B), P(C|B)' },
                { id: 'c', label: 'Given C', desc: 'P(A|C), P(B|C)' }
              ].map(({ id, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setCurrentPerspective(id)}
                  className={cn(
                    "w-full px-3 py-2 rounded text-left transition-colors",
                    currentPerspective === id
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  <div className="font-medium">{label}</div>
                  <div className="text-xs opacity-80">{desc}</div>
                </button>
              ))}
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={isAnimating ? stopAnimation : startAnimation}
                className={cn(
                  "flex-1 px-3 py-2 rounded text-sm font-medium transition-colors",
                  isAnimating
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                {isAnimating ? "Stop" : "Start"} Sampling
              </button>
            </div>
            
            <label className="flex items-center gap-2 text-sm mt-3">
              <input 
                type="checkbox" 
                checked={showProbabilities} 
                onChange={e => setShowProbabilities(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-neutral-300">Show probability chart</span>
            </label>
          </VisualizationSection>

          {/* Auto-Run Section */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Auto-Run Experiment</h4>
            
            <div className="mb-3">
              <label className="text-sm text-neutral-300 mb-1 block">Target Samples</label>
              <select
                value={targetSamples}
                onChange={(e) => setTargetSamples(Number(e.target.value))}
                className={cn(components.select, "w-full")}
              >
                <option value={100}>100 samples</option>
                <option value={500}>500 samples</option>
                <option value={1000}>1,000 samples</option>
                <option value={5000}>5,000 samples</option>
              </select>
            </div>
            
            <button
              onClick={isAutoRunning ? stopAutoRun : startAutoRun}
              disabled={isAnimating}
              className={cn(
                "w-full px-3 py-2 rounded text-sm font-medium transition-colors",
                isAutoRunning
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : isAnimating
                  ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              {isAutoRunning ? "Stop" : "Start"} Auto-Run
            </button>
            
            {isAutoRunning && (
              <div className="mt-3">
                <div className="text-xs text-neutral-300 mb-1">
                  Progress: {samplesDropped} / {targetSamples}
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((samplesDropped / targetSamples) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </VisualizationSection>

          {/* Independence Check */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Independence Check</h4>
            
            <div className="space-y-2 text-sm">
              {[
                ['A', 'B'],
                ['B', 'C'],
                ['A', 'C']
              ].map(([e1, e2]) => {
                const isIndep = checkIndependence(e1, e2);
                return (
                  <div key={`${e1}${e2}`} className="flex justify-between items-center">
                    <span className="text-neutral-300">{e1} and {e2}:</span>
                    <span className={cn(
                      "font-medium",
                      isIndep ? "text-green-400" : "text-yellow-400"
                    )}>
                      {isIndep ? "Independent" : "Dependent"}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-3 p-2 bg-neutral-800 rounded text-xs text-neutral-300">
              <p>Events are independent when:</p>
              <p className="font-mono mt-1">P(B|A) = P(B)</p>
            </div>
          </VisualizationSection>

          {/* Learning Progress */}
          <VisualizationSection className="p-3">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Probability Insights</h4>
            <div className="space-y-2 text-xs text-neutral-300">
              {samplesDropped === 0 && (
                <div>
                  <p>🎯 Ready to explore conditional probability?</p>
                  <p className="text-purple-300 mt-1">
                    Start sampling and try different perspectives to see how probabilities change!
                  </p>
                </div>
              )}
              {samplesDropped > 0 && samplesDropped < 50 && (
                <div>
                  <p>📊Notice how the probability bars change with perspective:</p>
                  <ul className="ml-3 mt-1 space-y-1">
                    <li>• Universe view shows unconditional probabilities</li>
                    <li>• "Given A" shows probabilities within event A</li>
                  </ul>
                </div>
              )}
              {samplesDropped >= 50 && samplesDropped < 100 && (
                <div>
                  <p>🎓 Try dragging the events to overlap differently:</p>
                  <ul className="ml-3 mt-1 space-y-1">
                    <li>• More overlap = higher conditional probability</li>
                    <li>• No overlap = P(B|A) = 0</li>
                    <li>• A inside B = P(B|A) = 1</li>
                  </ul>
                </div>
              )}
              {samplesDropped >= 100 && (
                <div>
                  <p className="text-green-400 font-semibold mb-1">
                    ✨ Probability Expert! {samplesDropped} samples dropped.
                  </p>
                  <p>Challenge: Can you arrange the events so all pairs are independent?</p>
                </div>
              )}
              
              {currentPerspective !== 'universe' && (
                <p className="text-blue-400 mt-2">
                  💡 In perspective "{currentPerspective.toUpperCase()}", we only consider 
                  outcomes within event {currentPerspective.toUpperCase()}.
                </p>
              )}
            </div>
          </VisualizationSection>
        </div>

        {/* Right Panel - Visualizations */}
        <div className="lg:w-2/3 space-y-4">
          <GraphContainer height="500px">
            <svg ref={svgBallRef} style={{ width: "100%", height: 500 }} />
          </GraphContainer>
          
          {showProbabilities && (
            <GraphContainer height="200px">
              <svg ref={svgProbRef} style={{ width: "100%", height: 200 }} />
            </GraphContainer>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default ConditionalProbability;