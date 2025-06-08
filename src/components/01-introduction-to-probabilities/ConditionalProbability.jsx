"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import * as d3 from "d3";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { ProgressTracker } from '../ui/ProgressTracker';

// Use probability color scheme
const colorScheme = createColorScheme('probability');

// Calculate overlap between two specific events
function calcEventOverlap(event1, event2) {
  const a1 = event1.x;
  const a2 = a1 + event1.width;
  const b1 = event2.x;
  const b2 = b1 + event2.width;
  
  let overlap = 0;
  if (a1 <= b1 && b1 <= a2) {
    overlap = b2 <= a2 ? (b2 - b1) : (a2 - b1);
  } else if (a1 <= b2 && b2 <= a2) {
    overlap = b1 <= a1 ? (b2 - a1) : (b2 - b1);
  } else if (b1 <= a1 && a2 <= b2) {
    overlap = a2 - a1;
  }
  
  return Math.max(0, overlap);
}

// Bayes' Theorem Component
const BayesTheoremExample = memo(function BayesTheoremExample({ eventsData }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    // MathJax timeout pattern
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          console.error('MathJax error:', err);
        });
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [eventsData]);
  
  // Calculate all necessary probabilities with safe division
  const pA = Math.max(0, eventsData[0].width);
  const pB = Math.max(0, eventsData[1].width);
  const pAB = Math.max(0, calcEventOverlap(eventsData[0], eventsData[1]));
  
  // Safe division with epsilon comparison for floating point precision
  const EPSILON = 1e-10;
  const pBgivenA = pA > EPSILON ? pAB / pA : 0;
  const pAgivenB = pB > EPSILON ? pAB / pB : 0;
  
  return (
    <div ref={contentRef} style={{
      backgroundColor: '#1e293b',
      padding: '1.5rem',
      borderRadius: '8px',
      color: '#e0e0e0',
      border: '1px solid #334155'
    }}>
      <h4 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#60a5fa', marginBottom: '1rem' }}>
        Bayes' Theorem
      </h4>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#94a3b8' }}>General Form:</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}\\]` }} />
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#94a3b8' }}>Applied to Current Events:</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)} = \\frac{${pBgivenA.toFixed(3)} \\times ${pA.toFixed(3)}}{${pB.toFixed(3)}} = ${pAgivenB.toFixed(3)}\\]` }} />
      </div>
      
      <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '4px', fontSize: '0.875rem' }}>
        <strong style={{ color: '#10b981' }}>Engineering Application:</strong>
        <p style={{ marginTop: '0.5rem', lineHeight: '1.5' }}>
          In signal detection: If A = "signal present" and B = "detector activates",<br/>
          then P(A|B) tells us the probability of an actual signal given that our detector triggered.
        </p>
        <p style={{ marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.75rem' }}>
          This is crucial for calculating false positive rates in radar systems, medical diagnostics, and quality control.
        </p>
      </div>
    </div>
  );
});

// Joint Probability Table Component
const JointProbabilityTable = memo(function JointProbabilityTable({ eventsData }) {
  // Calculate all joint probabilities
  const pA = eventsData[0].width;
  const pB = eventsData[1].width;
  const pAB = calcEventOverlap(eventsData[0], eventsData[1]);
  const pAnotB = pA - pAB;
  const pBnotA = pB - pAB;
  const pNotAnotB = 1 - pA - pB + pAB;
  
  return (
    <div style={{
      backgroundColor: '#1e293b',
      padding: '1.5rem',
      borderRadius: '8px',
      border: '1px solid #334155'
    }}>
      <h4 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#60a5fa', marginBottom: '1rem' }}>
        Joint Probability Table
      </h4>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #475569', padding: '0.5rem', backgroundColor: '#334155' }}></th>
            <th style={{ border: '1px solid #475569', padding: '0.5rem', backgroundColor: '#334155', color: '#60a5fa' }}>B</th>
            <th style={{ border: '1px solid #475569', padding: '0.5rem', backgroundColor: '#334155', color: '#60a5fa' }}>B'</th>
            <th style={{ border: '1px solid #475569', padding: '0.5rem', backgroundColor: '#334155', color: '#94a3b8' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #475569', padding: '0.5rem', backgroundColor: '#334155', color: '#60a5fa', fontWeight: '600' }}>A</td>
            <td style={{ border: '1px solid #475569', padding: '0.5rem', textAlign: 'center' }}>{pAB.toFixed(3)}</td>
            <td style={{ border: '1px solid #475569', padding: '0.5rem', textAlign: 'center' }}>{pAnotB.toFixed(3)}</td>
            <td style={{ border: '1px solid #475569', padding: '0.5rem', textAlign: 'center', fontWeight: '600' }}>{pA.toFixed(3)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #475569', padding: '0.5rem', backgroundColor: '#334155', color: '#60a5fa', fontWeight: '600' }}>A'</td>
            <td style={{ border: '1px solid #475569', padding: '0.5rem', textAlign: 'center' }}>{pBnotA.toFixed(3)}</td>
            <td style={{ border: '1px solid #475569', padding: '0.5rem', textAlign: 'center' }}>{pNotAnotB.toFixed(3)}</td>
            <td style={{ border: '1px solid #475569', padding: '0.5rem', textAlign: 'center', fontWeight: '600' }}>{(1 - pA).toFixed(3)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #475569', padding: '0.5rem', backgroundColor: '#334155', color: '#94a3b8', fontWeight: '600' }}>Total</td>
            <td style={{ border: '1px solid #475569', padding: '0.5rem', textAlign: 'center', fontWeight: '600' }}>{pB.toFixed(3)}</td>
            <td style={{ border: '1px solid #475569', padding: '0.5rem', textAlign: 'center', fontWeight: '600' }}>{(1 - pB).toFixed(3)}</td>
            <td style={{ border: '1px solid #475569', padding: '0.5rem', textAlign: 'center', backgroundColor: '#0f172a', fontWeight: '700' }}>1.000</td>
          </tr>
        </tbody>
      </table>
      
      <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
        <p><strong>Key insight:</strong> Each row and column sums to its marginal probability.</p>
        <p style={{ marginTop: '0.25rem' }}>This table is fundamental for reliability analysis in engineering systems.</p>
      </div>
    </div>
  );
});

// Worked Example Component for Conditional Probability
const ConditionalProbWorkedExample = memo(function ConditionalProbWorkedExample({ eventA, eventB, overlap, perspective }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    // MathJax timeout pattern
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          console.error('MathJax error:', err);
        });
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [eventA, eventB, overlap, perspective]);
  
  const pA = eventA.width;
  const pB = eventB.width;
  const pAB = overlap;
  const pBgivenA = pA > 0 ? pAB / pA : 0;
  const pAgivenB = pB > 0 ? pAB / pB : 0;
  
  return (
    <div ref={contentRef} style={{
      backgroundColor: '#2A303C',
      padding: '1.5rem',
      borderRadius: '8px',
      color: '#e0e0e0',
      marginTop: '1rem'
    }}>
      <h4 style={{ fontSize: '1.125rem', fontWeight: '600', borderBottom: '1px solid #4A5568', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        Conditional Probability: P({eventB.name}|{eventA.name})
      </h4>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>1. Formula:</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[P(${eventB.name}|${eventA.name}) = \\frac{P(${eventA.name} \\cap ${eventB.name})}{P(${eventA.name})}\\]` }} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>2. Current values:</p>
        <div style={{ marginLeft: '1rem', fontSize: '0.875rem' }}>
          <div>• P({eventA.name}) = {pA.toFixed(3)}</div>
          <div>• P({eventB.name}) = {pB.toFixed(3)}</div>
          <div>• P({eventA.name} ∩ {eventB.name}) = {pAB.toFixed(3)}</div>
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>3. Calculation:</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[P(${eventB.name}|${eventA.name}) = \\frac{${pAB.toFixed(3)}}{${pA.toFixed(3)}} = ${pBgivenA.toFixed(3)}\\]` }} />
      </div>
      
      <div style={{ backgroundColor: '#1A202C', padding: '1rem', borderRadius: '4px', fontSize: '0.875rem' }}>
        <strong>💡 Intuition:</strong> "Of all the outcomes in {eventA.name}, what fraction are also in {eventB.name}?"
        <div style={{ marginTop: '0.5rem' }}>
          {Math.abs(pBgivenA - pB) < 0.01 ? (
            <span style={{ color: '#10b981' }}>✓ Events are independent! P({eventB.name}|{eventA.name}) ≈ P({eventB.name})</span>
          ) : (
            <span style={{ color: '#f59e0b' }}>✗ Events are dependent. Knowing {eventA.name} changes the probability of {eventB.name}.</span>
          )}
        </div>
      </div>
    </div>
  );
});

// Law of Total Probability Component
const TotalProbabilityExample = memo(function TotalProbabilityExample({ eventsData, eventHistory }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    // MathJax timeout pattern
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          console.error('MathJax error:', err);
        });
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [eventsData, eventHistory]);
  
  const pA = eventsData[0].width;
  const pB = eventsData[1].width;
  const pC = eventsData[2].width;
  const pAB = calcEventOverlap(eventsData[0], eventsData[1]);
  const pAC = calcEventOverlap(eventsData[0], eventsData[2]);
  const pBC = calcEventOverlap(eventsData[1], eventsData[2]);
  
  // Total samples for empirical calculation
  const totalSamples = Object.values(eventHistory).reduce((a, b) => a + b, 0) || 1;
  const empiricalB = (eventHistory.B + eventHistory.AB + eventHistory.BC + eventHistory.ABC) / totalSamples;
  
  return (
    <div ref={contentRef} style={{
      backgroundColor: '#1e293b',
      padding: '1.5rem',
      borderRadius: '8px',
      color: '#e0e0e0',
      border: '1px solid #334155'
    }}>
      <h4 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#60a5fa', marginBottom: '1rem' }}>
        Law of Total Probability
      </h4>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#94a3b8' }}>Partition of Sample Space:</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[P(B) = P(B|A)P(A) + P(B|A')P(A')\\]` }} />
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#94a3b8' }}>Current Calculation:</p>
        <div style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
          <div>P(B|A) = {(pA > 0 ? pAB / pA : 0).toFixed(3)}</div>
          <div>P(B|A') = {((1 - pA) > 0 ? (pB - pAB) / (1 - pA) : 0).toFixed(3)}</div>
          <div>P(A) = {pA.toFixed(3)}, P(A') = {(1 - pA).toFixed(3)}</div>
        </div>
        <div style={{ marginTop: '0.5rem' }} dangerouslySetInnerHTML={{ __html: 
          `\\[P(B) = ${(pA > 0 ? pAB / pA : 0).toFixed(3)} \\times ${pA.toFixed(3)} + ${((1 - pA) > 0 ? (pB - pAB) / (1 - pA) : 0).toFixed(3)} \\times ${(1 - pA).toFixed(3)} = ${pB.toFixed(3)}\\]` 
        }} />
      </div>
      
      <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '4px', fontSize: '0.875rem' }}>
        <strong style={{ color: '#10b981' }}>Engineering Application:</strong>
        <p style={{ marginTop: '0.5rem' }}>
          System Reliability: If a system can fail via multiple pathways (A or A'), 
          the total failure probability must account for all paths weighted by their likelihood.
        </p>
        {totalSamples > 10 && (
          <p style={{ marginTop: '0.5rem', color: '#fbbf24' }}>
            Empirical P(B) = {empiricalB.toFixed(3)} (from {totalSamples} samples)
          </p>
        )}
      </div>
    </div>
  );
});

function ConditionalProbability() {
  const [currentPerspective, setCurrentPerspective] = useState('universe');
  const [isAnimating, setIsAnimating] = useState(false);
  const [samplesDropped, setSamplesDropped] = useState(0);
  const [showProbabilities, setShowProbabilities] = useState(true);
  const [showWorkedExample, setShowWorkedExample] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(100); // ms between drops
  const [eventsData, setEventsData] = useState([
    { x: 1/6, y: 0.2, width: 1/3, height: 0.05, name: 'A' },
    { x: 1/3, y: 0.4, width: 1/3, height: 0.05, name: 'B' },
    { x: 1/2, y: 0.6, width: 1/3, height: 0.05, name: 'C' }
  ]);
  const [highlightOverlaps, setHighlightOverlaps] = useState(false);
  const [eventHistory, setEventHistory] = useState({ A: 0, B: 0, C: 0, AB: 0, AC: 0, BC: 0, ABC: 0, none: 0 });
  const [targetSamples, setTargetSamples] = useState(1000);
  const [activeTab, setActiveTab] = useState('visualization'); // New state for tabs
  
  const svgBallRef = useRef(null);
  const svgProbRef = useRef(null);
  const intervalRef = useRef(null);
  const ballsRef = useRef([]);
  const dropBallRef = useRef(null);
  
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
  
  // Main ball visualization with enhanced educational features
  useEffect(() => {
    if (!svgBallRef.current) return;
    
    try {
      const svg = d3.select(svgBallRef.current);
      const { width } = svgBallRef.current.getBoundingClientRect();
      const height = 400; // Reduced to fit better
      const margin = { top: 40, right: 30, bottom: 40, left: 30 };
    
    // Clear and setup
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g");
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Title based on perspective
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text(currentPerspective === 'universe' ? 'Sample Space' : `Conditional View: Given ${currentPerspective.toUpperCase()}`);
    
    // Scales - bake margins into range
    const xScale = d3.scaleLinear()
      .domain(currentPerspective === 'universe' ? [0, 1] : 
               currentPerspective === 'a' ? [eventsData[0].x, eventsData[0].x + eventsData[0].width] :
               currentPerspective === 'b' ? [eventsData[1].x, eventsData[1].x + eventsData[1].width] :
               [eventsData[2].x, eventsData[2].x + eventsData[2].width])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([margin.top, height - margin.bottom]);
    
    const xWidthScale = d3.scaleLinear()
      .domain([0, getDomainWidth()])
      .range([0, innerWidth]);
    
    // Create gradient for perspective highlighting
    if (currentPerspective !== 'universe') {
      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "perspectiveGradient")
        .attr("x1", "0%")
        .attr("x2", "100%");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#ffffff")
        .attr("stop-opacity", 0.1);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#ffffff")
        .attr("stop-opacity", 0.3);
    }
    
    // Draw perspective boundary if not universe
    if (currentPerspective !== 'universe') {
      const perspectiveEvent = eventsData.find(e => e.name.toLowerCase() === currentPerspective);
      g.append("rect")
        .attr("x", xScale(perspectiveEvent.x))
        .attr("y", 0)
        .attr("width", xWidthScale(perspectiveEvent.width))
        .attr("height", innerHeight)
        .attr("fill", "url(#perspectiveGradient)")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.3)
        .attr("pointer-events", "none");
    }
    
    // Draw events
    const events = g.selectAll("g.event")
      .data(eventsData)
      .enter()
      .append("g")
      .attr("class", "event");
    
    // Event rectangles with better sizing
    const eventHeight = 60; // Fixed height for better visibility
    const rects = events.append("rect")
      .attr("class", d => `${d.name} shelf`)
      .attr("x", d => xScale(d.x))
      .attr("y", d => yScale(d.y))
      .attr("width", d => xWidthScale(d.width))
      .attr("height", eventHeight)
      .attr("fill", (d, i) => [colorScheme.chart.primary, colorScheme.chart.secondary, colorScheme.chart.tertiary][i])
      .attr("opacity", highlightOverlaps ? 0.5 : 0.7)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("rx", 4);
    
    // Drag handles with better visibility
    const handleSize = 8;
    
    // Left handles
    const leftHandles = events.append("rect")
      .attr("class", d => `${d.name} handle left`)
      .attr("x", d => xScale(d.x) - handleSize/2)
      .attr("y", d => yScale(d.y) + eventHeight/2 - handleSize)
      .attr("width", handleSize)
      .attr("height", handleSize * 2)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("cursor", "ew-resize")
      .attr("rx", 2)
      .attr("opacity", 0.8);
    
    // Right handles
    const rightHandles = events.append("rect")
      .attr("class", d => `${d.name} handle right`)
      .attr("x", d => xScale(d.x + d.width) - handleSize/2)
      .attr("y", d => yScale(d.y) + eventHeight/2 - handleSize)
      .attr("width", handleSize)
      .attr("height", handleSize * 2)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("cursor", "ew-resize")
      .attr("rx", 2)
      .attr("opacity", 0.8);
    
    // Labels inside rectangles
    events.append("text")
      .attr("x", d => xScale(d.x + d.width / 2))
      .attr("y", d => yScale(d.y) + eventHeight / 2)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "white")
      .style("font-size", "18px")
      .style("font-weight", "700")
      .text(d => d.name)
      .attr("pointer-events", "none");
    
    // Probability labels below events
    events.append("text")
      .attr("x", d => xScale(d.x + d.width / 2))
      .attr("y", d => yScale(d.y) + eventHeight + 15)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text(d => `P(${d.name}) = ${d.width.toFixed(3)}`)
      .attr("pointer-events", "none");
    
    // Draw overlap areas if enabled
    if (highlightOverlaps) {
      // Draw AB overlap
      const overlapAB = calcEventOverlap(eventsData[0], eventsData[1]);
      if (overlapAB > 0) {
        const startX = Math.max(eventsData[0].x, eventsData[1].x);
        g.append("rect")
          .attr("x", xScale(startX))
          .attr("y", yScale(Math.max(eventsData[0].y, eventsData[1].y)))
          .attr("width", xWidthScale(overlapAB))
          .attr("height", eventHeight)
          .attr("fill", "#facc15")
          .attr("opacity", 0.5)
          .attr("stroke", "#facc15")
          .attr("stroke-width", 2)
          .attr("pointer-events", "none");
      }
    }
    
    // Simplified drag behaviors without transforms
    const dragRect = d3.drag()
      .on("drag", function(event, d) {
        const i = eventsData.findIndex(e => e.name === d.name);
        // Use mouse position directly with scale invert
        const newX = Math.max(0, Math.min(xScale.invert(event.x), 1 - d.width));
        const newData = [...eventsData];
        newData[i] = { ...d, x: newX };
        setEventsData(newData);
      });
    
    const dragLeft = d3.drag()
      .on("drag", function(event, d) {
        const i = eventsData.findIndex(e => e.name === d.name);
        // Use mouse position directly with scale invert
        const newX = Math.max(0, Math.min(xScale.invert(event.x), d.x + d.width - 0.05));
        const widthChange = d.x - newX;
        const newData = [...eventsData];
        newData[i] = { ...d, x: newX, width: Math.max(0.05, d.width + widthChange) };
        setEventsData(newData);
      });
    
    const dragRight = d3.drag()
      .on("drag", function(event, d) {
        const i = eventsData.findIndex(e => e.name === d.name);
        // Use mouse position directly with scale invert
        const newWidth = Math.max(0.05, Math.min(xScale.invert(event.x) - d.x, 1 - d.x));
        const newData = [...eventsData];
        newData[i] = { ...d, width: newWidth };
        setEventsData(newData);
      });
    
    rects.call(dragRect);
    leftHandles.call(dragLeft);
    rightHandles.call(dragRight);
    
    // X-axis for reference
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => d.toFixed(2));
    
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom + 5})`)
      .attr("class", "x-axis")
      .call(xAxis)
      .selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "10px");
    
    g.select(".x-axis .domain").attr("stroke", colors.chart.grid);
    g.selectAll(".x-axis .tick line").attr("stroke", colors.chart.grid);
    
    // Ball container
    const ballContainer = g.append("g").attr("class", "balls");
    
    // Drop ball function with enhanced visualization
    function dropBall() {
      const p = Math.random();
      const baseDuration = samplesDropped < 10 ? 2000 : (samplesDropped < 50 ? 1500 : 1000);
      
      // Determine which events the ball passes through
      const eventsHit = [];
      eventsData.forEach(event => {
        if (event.x <= p && p <= event.x + event.width) {
          eventsHit.push(event);
        }
      });
      
      // Update event history
      const hitNames = eventsHit.map(e => e.name).sort().join('');
      setEventHistory(prev => {
        const newHistory = { ...prev };
        if (hitNames === '') newHistory.none++;
        else if (hitNames === 'A') newHistory.A++;
        else if (hitNames === 'B') newHistory.B++;
        else if (hitNames === 'C') newHistory.C++;
        else if (hitNames === 'AB') newHistory.AB++;
        else if (hitNames === 'AC') newHistory.AC++;
        else if (hitNames === 'BC') newHistory.BC++;
        else if (hitNames === 'ABC') newHistory.ABC++;
        return newHistory;
      });
      
      // Create ball with trail
      const ballGroup = ballContainer.append("g");
      
      // Trail line
      const trail = ballGroup.append("line")
        .attr("x1", xScale(p))
        .attr("y1", yScale(0))
        .attr("x2", xScale(p))
        .attr("y2", yScale(0))
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("opacity", 0.3)
        .attr("stroke-dasharray", "2,2");
      
      // Ball
      const ball = ballGroup.append("circle")
        .attr("cx", xScale(p))
        .attr("cy", yScale(0))
        .attr("r", 6)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5);
      
      // Animate through events with smoother transitions
      let currentY = 0;
      let totalDelay = 0;
      
      eventsHit.forEach((event, i) => {
        const stepDuration = baseDuration / (eventsHit.length + 1);
        
        ball.transition()
          .delay(totalDelay)
          .duration(stepDuration)
          .ease(d3.easeQuadInOut)
          .attr("cy", yScale(event.y) + eventHeight/2)
          .attr("fill", () => {
            if (event.name === 'A') return colorScheme.chart.primary;
            if (event.name === 'B') return colorScheme.chart.secondary;
            return colorScheme.chart.tertiary;
          })
          .attr("r", 8);
        
        trail.transition()
          .delay(totalDelay)
          .duration(stepDuration)
          .attr("y2", yScale(event.y) + eventHeight/2);
        
        totalDelay += stepDuration;
      });
      
      // Final position
      ball.transition()
        .delay(totalDelay)
        .duration(baseDuration / 3)
        .ease(d3.easeQuadIn)
        .attr("cy", yScale(1))
        .attr("r", 4)
        .attr("opacity", 0);
      
      trail.transition()
        .delay(totalDelay)
        .duration(baseDuration / 3)
        .attr("y2", yScale(1))
        .attr("opacity", 0);
      
      ballGroup.transition()
        .delay(totalDelay + baseDuration / 3)
        .remove()
        .on("end", function() {
          setSamplesDropped(prev => prev + 1);
        });
      
      // Store ball data
      ballsRef.current.push({ p, events: eventsHit });
    }
    
    // Store dropBall function for interval
    dropBallRef.current = dropBall;
    
    } catch (error) {
      console.error('Error in ConditionalProbability ball animation:', error);
      if (svgBallRef.current) {
        d3.select(svgBallRef.current)
          .selectAll("*").remove()
          .append("text")
          .attr("x", "50%")
          .attr("y", "50%")
          .attr("text-anchor", "middle")
          .attr("fill", "red")
          .text("Animation error occurred");
      }
    }
  }, [eventsData, currentPerspective, highlightOverlaps, samplesDropped]);
  
  // Enhanced probability bar chart with better scaling
  useEffect(() => {
    if (!svgProbRef.current || !showProbabilities) return;
    
    try {
      const svg = d3.select(svgProbRef.current);
      const { width } = svgProbRef.current.getBoundingClientRect();
      const height = 180; // Reduced height to fit better
      const margin = { top: 30, right: 40, bottom: 50, left: 60 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(currentPerspective === 'universe' ? 'Unconditional Probabilities' : `Conditional Probabilities Given ${currentPerspective.toUpperCase()}`);
    
    const g = svg.append("g");
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Calculate probabilities
    const domainWidth = getDomainWidth();
    const probs = eventsData.map((_, i) => ({
      value: calcOverlap(i, currentPerspective) / domainWidth,
      name: eventsData[i].name
    }));
    
    // Scales
    const xScale = d3.scaleBand()
      .domain(probs.map((_, i) => i))
      .range([margin.left, width - margin.right])
      .padding(0.4);
    
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top]);
    
    // Grid lines
    const yGrid = d3.axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat("")
      .ticks(5);
    
    g.append("g")
      .attr("class", "grid")
      .call(yGrid)
      .selectAll("line")
      .attr("stroke", colors.chart.grid)
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.3);
    
    // Bars with animation
    const bars = g.selectAll(".bar")
      .data(probs)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => xScale(i))
      .attr("y", height - margin.bottom)
      .attr("width", xScale.bandwidth())
      .attr("height", 0)
      .attr("fill", (d, i) => [colorScheme.chart.primary, colorScheme.chart.secondary, colorScheme.chart.tertiary][i])
      .attr("opacity", 0.8)
      .attr("rx", 2);
    
    bars.transition()
      .duration(500)
      .attr("y", d => yScale(d.value))
      .attr("height", d => (height - margin.bottom) - yScale(d.value));
    
    // Values on bars
    g.selectAll(".value")
      .data(probs)
      .enter()
      .append("text")
      .attr("class", "value")
      .attr("x", (d, i) => xScale(i) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.value) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "13px")
      .style("font-weight", "600")
      .text(d => d.value.toFixed(3))
      .attr("opacity", 0)
      .transition()
      .delay(300)
      .attr("opacity", 1);
    
    // X axis with conditional labels
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
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .attr("class", "x-axis")
      .call(xAxis)
      .selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "11px")
      .style("font-weight", "500");
    
    // Y axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => d.toFixed(1));
    
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .attr("class", "y-axis")
      .call(yAxis)
      .selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "10px");
    
    g.select(".x-axis .domain").attr("stroke", colors.chart.grid);
    g.selectAll(".x-axis .tick line").attr("stroke", colors.chart.grid);
    g.select(".y-axis .domain").attr("stroke", colors.chart.grid);
    g.selectAll(".y-axis .tick line").attr("stroke", colors.chart.grid);
    
    } catch (error) {
      console.error('Error in ConditionalProbability D3 visualization:', error);
      // Optionally show error message to user
      if (svgBallRef.current) {
        d3.select(svgBallRef.current)
          .selectAll("*").remove()
          .append("text")
          .attr("x", "50%")
          .attr("y", "50%")
          .attr("text-anchor", "middle")
          .attr("fill", "red")
          .text("Visualization error occurred");
      }
    }
  }, [eventsData, currentPerspective, showProbabilities]);
  
  // Start/stop animation
  function startAnimation() {
    if (intervalRef.current) return;
    
    // Ensure dropBallRef is ready before starting animation
    if (!dropBallRef.current) {
      return;
    }
    
    setIsAnimating(true);
    
    try {
      intervalRef.current = setInterval(() => {
        if (dropBallRef.current && typeof dropBallRef.current === 'function') {
          dropBallRef.current();
        } else {
          // Stop animation if ref becomes invalid
          stopAnimation();
        }
      }, animationSpeed);
    } catch (error) {
      console.error('Error starting animation:', error);
      stopAnimation();
    }
  }
  
  function stopAnimation() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAnimating(false);
  }
  
  // Reset visualization
  function reset() {
    stopAnimation();
    setSamplesDropped(0);
    setEventHistory({ A: 0, B: 0, C: 0, AB: 0, AC: 0, BC: 0, ABC: 0, none: 0 });
    ballsRef.current = [];
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Check independence with better calculation
  function checkIndependence(event1, event2) {
    const i1 = eventsData.findIndex(e => e.name === event1);
    const i2 = eventsData.findIndex(e => e.name === event2);
    
    const p1 = eventsData[i1].width;
    const p2 = eventsData[i2].width;
    const pIntersect = calcEventOverlap(eventsData[i1], eventsData[i2]);
    const p2Given1 = p1 > 0 ? pIntersect / p1 : 0;
    
    return Math.abs(p2Given1 - p2) < 0.01;
  }
  
  // Get educational insight based on current state - 4-stage progressive learning
  function getEducationalInsight() {
    const totalSamples = Object.values(eventHistory).reduce((a, b) => a + b, 0);
    
    if (samplesDropped === 0) {
      return {
        title: "🎯 Ready to Master Conditional Probability?",
        content: "Click 'Start Sampling' to begin your journey to 30 samples — where the magic of independence reveals itself!",
        hint: "💡 Pro tip: Drag event rectangles to explore different probability relationships.",
        stage: "initial"
      };
    } else if (samplesDropped < 10) {
      const independentPairs = [];
      [['A', 'B'], ['A', 'C'], ['B', 'C']].forEach(([e1, e2]) => {
        if (checkIndependence(e1, e2)) independentPairs.push(`${e1}-${e2}`);
      });
      
      return {
        title: "🌱 Building Intuition...",
        content: `You've collected ${samplesDropped} sample${samplesDropped !== 1 ? 's' : ''}. Watch how balls fall through overlapping events!`,
        hint: currentPerspective === 'universe' ? 
          "Switch to 'Given A' perspective to see how probabilities change when we condition on event A." :
          `In '${currentPerspective.toUpperCase()}' view, we only consider outcomes that fall within event ${currentPerspective.toUpperCase()}.`,
        progress: `${independentPairs.length > 0 ? `✓ Found independent events: ${independentPairs.join(', ')}` : '🔍 No independent events yet - try adjusting rectangles!'}`,
        stage: "early"
      };
    } else if (samplesDropped < 30) {
      const independentPairs = [];
      [['A', 'B'], ['A', 'C'], ['B', 'C']].forEach(([e1, e2]) => {
        if (checkIndependence(e1, e2)) independentPairs.push(`${e1}-${e2}`);
      });
      
      // Calculate empirical probabilities
      const empiricalProbs = totalSamples > 0 ? {
        A: (eventHistory.A + eventHistory.AB + eventHistory.AC + eventHistory.ABC) / totalSamples,
        B: (eventHistory.B + eventHistory.AB + eventHistory.BC + eventHistory.ABC) / totalSamples,
        C: (eventHistory.C + eventHistory.AC + eventHistory.BC + eventHistory.ABC) / totalSamples
      } : { A: 0, B: 0, C: 0 };
      
      return {
        title: "📊 Patterns Emerging!",
        content: `With ${samplesDropped} samples, the Law of Large Numbers is taking effect. Keep going to reach the 30-sample milestone!`,
        hint: independentPairs.length > 0 ?
          `✨ Independence discovered! For ${independentPairs.join(', ')}: P(B|A) ≈ P(B)` :
          "🎯 Challenge: Arrange events so that P(B|A) = P(B) to create independence!",
        progress: `Empirical vs Theoretical: P(A) = ${empiricalProbs.A.toFixed(3)} vs ${eventsData[0].width.toFixed(3)}`,
        stage: "developing"
      };
    } else {
      const independentPairs = [];
      [['A', 'B'], ['A', 'C'], ['B', 'C']].forEach(([e1, e2]) => {
        if (checkIndependence(e1, e2)) independentPairs.push(`${e1}-${e2}`);
      });
      
      const empiricalProbs = {
        A: (eventHistory.A + eventHistory.AB + eventHistory.AC + eventHistory.ABC) / totalSamples,
        B: (eventHistory.B + eventHistory.AB + eventHistory.BC + eventHistory.ABC) / totalSamples,
        C: (eventHistory.C + eventHistory.AC + eventHistory.BC + eventHistory.ABC) / totalSamples
      };
      
      // Calculate convergence errors
      const errors = {
        A: Math.abs(empiricalProbs.A - eventsData[0].width),
        B: Math.abs(empiricalProbs.B - eventsData[1].width),
        C: Math.abs(empiricalProbs.C - eventsData[2].width)
      };
      const avgError = (errors.A + errors.B + errors.C) / 3;
      
      return {
        title: "🎉 Conditional Probability Master!",
        content: `Incredible! With ${samplesDropped} samples, you've unlocked deep insights into probability relationships.`,
        hint: avgError < 0.01 ? 
          "🏆 Near-perfect convergence achieved! The empirical probabilities match theory beautifully." :
          `📈 Average error: ${avgError.toFixed(3)} — keep sampling for even better convergence!`,
        progress: independentPairs.length > 0 ?
          `✅ Independent pairs: ${independentPairs.join(', ')} | 🎯 Try different arrangements!` :
          "🔬 No independent events — this shows how most real-world events are dependent!",
        stage: "expert"
      };
    }
  }

  const educationalInsight = getEducationalInsight();

  return (
    <VisualizationContainer title="Conditional Probability and Independence">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Left Panel */}
        <div className="lg:w-1/3 flex flex-col gap-3">
          {/* Description */}
          <VisualizationSection className="p-4">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Master conditional probability through interactive visualization. Drag events, change perspectives, and discover when events are independent.
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-2 text-xs">
                <span className="text-blue-400">▸</span>
                <div className="text-neutral-300">
                  <strong>Drag rectangles</strong> to reposition and resize events
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="text-green-400">▸</span>
                <div className="text-neutral-300">
                  <strong>Change perspective</strong> to see conditional probabilities
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="text-purple-400">▸</span>
                <div className="text-neutral-300">
                  <strong>Watch patterns</strong> emerge as samples accumulate
                </div>
              </div>
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

          {/* Independence Analysis */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Independence Analysis</h4>
            
            <div className="space-y-2">
              {[
                ['A', 'B'],
                ['A', 'C'],
                ['B', 'C']
              ].map(([e1, e2]) => {
                const isIndep = checkIndependence(e1, e2);
                const i1 = eventsData.findIndex(e => e.name === e1);
                const i2 = eventsData.findIndex(e => e.name === e2);
                const overlap = calcEventOverlap(eventsData[i1], eventsData[i2]);
                
                return (
                  <div key={`${e1}${e2}`} className="p-2 bg-neutral-800 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-neutral-300">{e1} and {e2}</span>
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded",
                        isIndep ? "bg-green-600/20 text-green-400" : "bg-yellow-600/20 text-yellow-400"
                      )}>
                        {isIndep ? "Independent" : "Dependent"}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 font-mono">
                      P({e1}∩{e2}) = {overlap.toFixed(3)}
                    </div>
                  </div>
                );
              })}
            </div>
          </VisualizationSection>

          {/* Learning Progress - Takes remaining space */}
          <VisualizationSection className="p-4 flex-1 flex flex-col">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Learning Progress</h4>
            
            <ProgressTracker 
              current={samplesDropped} 
              goal={100} 
              label="Sample Goal"
              color="purple"
            />
            
            <div className="mt-3 p-3 bg-purple-900/20 border border-purple-600/30 rounded flex-1">
              <div className="text-sm font-semibold text-purple-300 mb-1">
                {educationalInsight.title}
              </div>
              <div className="text-xs text-neutral-300 space-y-1">
                <p>{educationalInsight.content}</p>
                {educationalInsight.hint && (
                  <p className="text-purple-400 mt-2">💡 {educationalInsight.hint}</p>
                )}
              </div>
            </div>
          </VisualizationSection>
        </div>

        {/* Right Panel - Visualizations */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          {/* Tab Navigation */}
          <div className="flex gap-2 bg-neutral-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('visualization')}
              className={cn(
                "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === 'visualization'
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-neutral-300 hover:text-white hover:bg-neutral-700"
              )}
            >
              Interactive Visualization
            </button>
            <button
              onClick={() => setActiveTab('mathematical')}
              className={cn(
                "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === 'mathematical'
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-neutral-300 hover:text-white hover:bg-neutral-700"
              )}
            >
              Mathematical Analysis
            </button>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'visualization' ? (
            <>
              <GraphContainer height="400px">
                <svg ref={svgBallRef} style={{ width: "100%", height: 400 }} />
              </GraphContainer>
              
              {showProbabilities && (
                <GraphContainer height="180px">
                  <svg ref={svgProbRef} style={{ width: "100%", height: 180 }} />
                </GraphContainer>
              )}
              
              {/* Worked Example */}
              {showWorkedExample && samplesDropped > 0 && (
                <ConditionalProbWorkedExample 
                  eventA={eventsData[currentPerspective === 'a' ? 0 : currentPerspective === 'b' ? 1 : currentPerspective === 'c' ? 2 : 0]}
                  eventB={eventsData[1]}
                  overlap={currentPerspective === 'universe' ? calcEventOverlap(eventsData[0], eventsData[1]) : calcOverlap(1, currentPerspective)}
                  perspective={currentPerspective}
                />
              )}
            </>
          ) : (
            <div className="space-y-4 max-h-[800px] overflow-y-auto">
              {/* Bayes' Theorem */}
              <BayesTheoremExample eventsData={eventsData} />
              
              {/* Joint Probability Table */}
              <JointProbabilityTable eventsData={eventsData} />
              
              {/* Law of Total Probability */}
              <TotalProbabilityExample eventsData={eventsData} eventHistory={eventHistory} />
              
              {/* Chain Rule and Multiple Events */}
              <div style={{
                backgroundColor: '#1e293b',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#60a5fa', marginBottom: '1rem' }}>
                  Chain Rule for Multiple Events
                </h4>
                
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#94a3b8' }}>Three Events:</p>
                  <div style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                    P(A∩B∩C) = P(A) × P(B|A) × P(C|A∩B)
                  </div>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#94a3b8' }}>Current Values:</p>
                  <div style={{ fontSize: '0.875rem', lineHeight: '1.5', fontFamily: 'monospace' }}>
                    <div>P(A) = {eventsData[0].width.toFixed(3)}</div>
                    <div>P(B|A) = {(eventsData[0].width > 0 ? calcEventOverlap(eventsData[0], eventsData[1]) / eventsData[0].width : 0).toFixed(3)}</div>
                    <div>P(C|A∩B) calculation requires 3-way intersection</div>
                  </div>
                </div>
                
                <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                  <strong style={{ color: '#10b981' }}>Engineering Application:</strong>
                  <p style={{ marginTop: '0.5rem' }}>
                    Sequential failure analysis: When system components fail in sequence,
                    each subsequent failure probability depends on all previous failures.
                  </p>
                </div>
              </div>
              
              {/* Convergence Analysis */}
              {samplesDropped > 20 && (
                <div style={{
                  backgroundColor: '#1e293b',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#60a5fa', marginBottom: '1rem' }}>
                    Empirical vs Theoretical Convergence
                  </h4>
                  
                  <div style={{ fontSize: '0.875rem', lineHeight: '1.8' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>Samples collected:</strong> {samplesDropped}
                    </div>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #475569' }}>Event</th>
                          <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid #475569' }}>Theoretical</th>
                          <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid #475569' }}>Empirical</th>
                          <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid #475569' }}>|Error|</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '0.5rem' }}>P(A)</td>
                          <td style={{ textAlign: 'center', padding: '0.5rem' }}>{eventsData[0].width.toFixed(3)}</td>
                          <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                            {((eventHistory.A + eventHistory.AB + eventHistory.AC + eventHistory.ABC) / samplesDropped).toFixed(3)}
                          </td>
                          <td style={{ textAlign: 'center', padding: '0.5rem', color: '#fbbf24' }}>
                            {Math.abs(eventsData[0].width - (eventHistory.A + eventHistory.AB + eventHistory.AC + eventHistory.ABC) / samplesDropped).toFixed(3)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '0.5rem' }}>P(B)</td>
                          <td style={{ textAlign: 'center', padding: '0.5rem' }}>{eventsData[1].width.toFixed(3)}</td>
                          <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                            {((eventHistory.B + eventHistory.AB + eventHistory.BC + eventHistory.ABC) / samplesDropped).toFixed(3)}
                          </td>
                          <td style={{ textAlign: 'center', padding: '0.5rem', color: '#fbbf24' }}>
                            {Math.abs(eventsData[1].width - (eventHistory.B + eventHistory.AB + eventHistory.BC + eventHistory.ABC) / samplesDropped).toFixed(3)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    
                    <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                      <p>As n → ∞, empirical probabilities converge to theoretical values (Law of Large Numbers)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default ConditionalProbability;