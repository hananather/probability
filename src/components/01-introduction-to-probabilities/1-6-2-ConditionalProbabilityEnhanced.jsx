"use client";
import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import * as d3 from "d3";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { ProgressTracker } from '../ui/ProgressTracker';
import { Button } from '../ui/button';
import { WorkedExampleContainer } from '../ui/WorkedExampleContainer';

// Use probability color scheme
const colorScheme = createColorScheme('probability');

// Learning modes
const LEARNING_MODES = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate', 
  ADVANCED: 'advanced'
};

// Engineering examples data
const ENGINEERING_EXAMPLES = {
  qualityControl: {
    title: "Quality Control in Manufacturing",
    events: {
      A: { name: "Defective", prob: 0.05, desc: "Product has defect" },
      B: { name: "Test Positive", prob: 0.06, desc: "Test detects defect" }
    },
    scenario: "A factory test has 95% accuracy. What's the probability a product is actually defective given a positive test?",
    key: "P(Defective|Test+) ≠ P(Test+|Defective)"
  },
  medicalDiagnosis: {
    title: "Medical Screening Tests",
    events: {
      A: { name: "Disease", prob: 0.01, desc: "Patient has disease" },
      B: { name: "Test Positive", prob: 0.099, desc: "Test is positive" }
    },
    scenario: "A disease affects 1% of population. Test is 99% accurate. What's the probability of having the disease given a positive test?",
    key: "Base rate matters: even accurate tests can have many false positives"
  },
  networkSecurity: {
    title: "Network Intrusion Detection",
    events: {
      A: { name: "Attack", prob: 0.001, desc: "Actual cyber attack" },
      B: { name: "Alert", prob: 0.01, desc: "System raises alert" }
    },
    scenario: "Security system detects 99% of attacks but has 1% false positive rate. Given an alert, what's the probability of an actual attack?",
    key: "Rare events + imperfect detection = many false alarms"
  },
  reliabilityEngineering: {
    title: "System Reliability Analysis",
    events: {
      A: { name: "Component A Fails", prob: 0.1, desc: "Primary component failure" },
      B: { name: "System Fails", prob: 0.15, desc: "Overall system failure" }
    },
    scenario: "System can fail from multiple causes. If component A fails 10% of the time, what's P(System Fail|A Fail)?",
    key: "Component failures may not guarantee system failure"
  }
};

// Misconception alerts
const COMMON_MISCONCEPTIONS = [
  {
    id: 'symmetry',
    check: (pAgivenB, pBgivenA) => Math.abs(pAgivenB - pBgivenA) < 0.01 && pAgivenB > 0.1,
    title: "Symmetry Misconception Alert!",
    message: "P(A|B) ≈ P(B|A) only when P(A) ≈ P(B). In general, these are different!",
    example: "P(Disease|Test+) is usually much lower than P(Test+|Disease)"
  },
  {
    id: 'baseRate',
    check: (pA, pB, pAB) => pA < 0.05 && pB > 0.1 && pAB > 0,
    title: "Base Rate Neglect Warning!",
    message: "When event A is rare, P(A|B) can be surprisingly low even if B strongly indicates A.",
    example: "Rare diseases remain unlikely even with positive tests"
  },
  {
    id: 'independence',
    check: (pA, pB, pAB) => Math.abs(pAB - pA * pB) < 0.01,
    title: "Independence Detected!",
    message: "Events are independent: P(A∩B) = P(A)×P(B), so P(A|B) = P(A)",
    example: "Knowing B doesn't change the probability of A"
  }
];

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

// Live Formula Display Component
const LiveFormulaDisplay = memo(function LiveFormulaDisplay({ eventA, eventB, overlap, perspective, animateChanges }) {
  const contentRef = useRef(null);
  const [highlightedPart, setHighlightedPart] = useState(null);
  
  useEffect(() => {
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
  // Use proper epsilon for division to avoid floating point errors
  const EPSILON = 0.0001;
  const pAgivenB = pB > EPSILON ? pAB / pB : 0;
  const pBgivenA = pA > EPSILON ? pAB / pA : 0;
  
  // Detect changes for animation
  const [prevValues, setPrevValues] = useState({ pA, pB, pAB, pAgivenB, pBgivenA });
  const changes = {
    pA: Math.abs(pA - prevValues.pA) > 0.001,
    pB: Math.abs(pB - prevValues.pB) > 0.001,
    pAB: Math.abs(pAB - prevValues.pAB) > 0.001,
    pAgivenB: Math.abs(pAgivenB - prevValues.pAgivenB) > 0.001,
    pBgivenA: Math.abs(pBgivenA - prevValues.pBgivenA) > 0.001
  };
  
  useEffect(() => {
    setPrevValues({ pA, pB, pAB, pAgivenB, pBgivenA });
  }, [pA, pB, pAB, pAgivenB, pBgivenA]);
  
  return (
    <div ref={contentRef} className="space-y-4">
      {/* Main conditional probability formulas */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-blue-600/30">
        <h4 className="text-sm font-semibold text-blue-400 mb-3">Live Formula Updates</h4>
        
        {/* P(A|B) */}
        <div className="mb-4">
          <div className="text-xs text-neutral-400 mb-1">Probability of {eventA.name} given {eventB.name}:</div>
          <div className={cn(
            "transition-all duration-300",
            animateChanges && (changes.pAB || changes.pB) ? "scale-105 text-yellow-300" : "text-white"
          )}>
            <div style={{ fontSize: '0.875rem', overflowX: 'auto' }} 
                 dangerouslySetInnerHTML={{ 
              __html: `\\[P(${eventA.name}|${eventB.name}) = \\frac{P(${eventA.name} \\cap ${eventB.name})}{P(${eventB.name})} = \\frac{${pAB.toFixed(3)}}{${pB.toFixed(3)}} = ${pAgivenB.toFixed(3)}\\]` 
            }} />
          </div>
        </div>
        
        {/* P(B|A) */}
        <div>
          <div className="text-xs text-neutral-400 mb-1">Probability of {eventB.name} given {eventA.name}:</div>
          <div className={cn(
            "transition-all duration-300",
            animateChanges && (changes.pAB || changes.pA) ? "scale-105 text-yellow-300" : "text-white"
          )}>
            <div style={{ fontSize: '0.875rem', overflowX: 'auto' }} 
                 dangerouslySetInnerHTML={{ 
              __html: `\\[P(${eventB.name}|${eventA.name}) = \\frac{P(${eventA.name} \\cap ${eventB.name})}{P(${eventA.name})} = \\frac{${pAB.toFixed(3)}}{${pA.toFixed(3)}} = ${pBgivenA.toFixed(3)}\\]` 
            }} />
          </div>
        </div>
      </div>
      
      {/* Visual hint about non-symmetry */}
      {Math.abs(pAgivenB - pBgivenA) > 0.05 && (
        <div className="bg-yellow-900/20 border border-yellow-600/30 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 text-lg">⚠️</span>
            <div className="text-xs">
              <div className="font-semibold text-yellow-300 mb-1">These are different!</div>
              <div className="text-neutral-300">
                P({eventA.name}|{eventB.name}) = {pAgivenB.toFixed(3)} ≠ {pBgivenA.toFixed(3)} = P({eventB.name}|{eventA.name})
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bayes' theorem connection */}
      <div className="bg-purple-900/20 border border-purple-600/30 p-3 rounded-lg">
        <div className="text-xs">
          <div className="font-semibold text-purple-300 mb-1">Bayes' Theorem:</div>
          <div style={{ fontSize: '0.75rem', overflowX: 'auto' }} 
               dangerouslySetInnerHTML={{ 
            __html: `\\[P(${eventA.name}|${eventB.name}) = \\frac{P(${eventB.name}|${eventA.name}) \\cdot P(${eventA.name})}{P(${eventB.name})}\\]` 
          }} />
        </div>
      </div>
    </div>
  );
});

// Tutorial Overlay Component
const TutorialOverlay = ({ step, onNext, onSkip }) => {
  const tutorials = [
    {
      target: '.event-rectangles',
      title: "Interactive Events",
      content: "Drag the rectangles to change event probabilities. Drag edges to resize, centers to move.",
      position: 'bottom'
    },
    {
      target: '.perspective-buttons',
      title: "Change Your View",
      content: "Switch between Universe and conditional views to see how probabilities change when you know an event occurred.",
      position: 'right'
    },
    {
      target: '.formula-display',
      title: "Live Mathematics",
      content: "Watch formulas update in real-time as you interact. Values that change are highlighted.",
      position: 'left'
    },
    {
      target: '.example-selector',
      title: "Real-World Context",
      content: "Load engineering examples to see conditional probability in action.",
      position: 'top'
    }
  ];
  
  if (step >= tutorials.length) return null;
  
  const tutorial = tutorials[step];
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-neutral-800 p-6 rounded-lg max-w-md mx-4 shadow-2xl border border-neutral-600">
        <h3 className="text-lg font-bold text-white mb-2">{tutorial.title}</h3>
        <p className="text-sm text-neutral-300 mb-4">{tutorial.content}</p>
        <div className="flex gap-3">
          <Button onClick={onNext} className="flex-1 bg-blue-600 hover:bg-blue-700">
            {step === tutorials.length - 1 ? "Start Learning" : "Next"}
          </Button>
          <Button onClick={onSkip} variant="outline" className="text-neutral-300">
            Skip Tutorial
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Component
function ConditionalProbabilityEnhanced() {
  // State
  const [learningMode, setLearningMode] = useState(LEARNING_MODES.BEGINNER);
  const [currentPerspective, setCurrentPerspective] = useState('universe');
  const [isAnimating, setIsAnimating] = useState(false);
  const [samplesDropped, setSamplesDropped] = useState(0);
  const [showFormulas, setShowFormulas] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [selectedExample, setSelectedExample] = useState(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [detectedMisconceptions, setDetectedMisconceptions] = useState([]);
  
  // Initial events based on learning mode - ensure proper separation for clarity
  const getInitialEvents = (mode) => {
    switch(mode) {
      case LEARNING_MODES.BEGINNER:
        return [
          { x: 0.2, y: 0.3, width: 0.3, height: 0.05, name: 'A' },
          { x: 0.4, y: 0.5, width: 0.3, height: 0.05, name: 'B' }
        ];
      case LEARNING_MODES.INTERMEDIATE:
        return [
          { x: 0.1, y: 0.2, width: 0.25, height: 0.05, name: 'A' },
          { x: 0.3, y: 0.4, width: 0.3, height: 0.05, name: 'B' },
          { x: 0.55, y: 0.6, width: 0.2, height: 0.05, name: 'C' }
        ];
      case LEARNING_MODES.ADVANCED:
        return [
          { x: 0.05, y: 0.15, width: 0.2, height: 0.05, name: 'A' },
          { x: 0.2, y: 0.35, width: 0.25, height: 0.05, name: 'B' },
          { x: 0.4, y: 0.55, width: 0.2, height: 0.05, name: 'C' },
          { x: 0.65, y: 0.75, width: 0.15, height: 0.05, name: 'D' }
        ];
      default:
        return [
          { x: 0.2, y: 0.3, width: 0.3, height: 0.05, name: 'A' },
          { x: 0.4, y: 0.5, width: 0.3, height: 0.05, name: 'B' }
        ];
    }
  };
  
  const [eventsData, setEventsData] = useState(getInitialEvents(learningMode));
  const [eventHistory, setEventHistory] = useState({});
  
  const svgRef = useRef(null);
  const intervalRef = useRef(null);
  const dropBallRef = useRef(null);
  
  // Update events when learning mode changes
  useEffect(() => {
    setEventsData(getInitialEvents(learningMode));
    reset();
  }, [learningMode]);
  
  // Check for misconceptions
  useEffect(() => {
    if (eventsData.length < 2) return;
    
    const pA = eventsData[0].width;
    const pB = eventsData[1].width;
    const pAB = calcEventOverlap(eventsData[0], eventsData[1]);
    const pAgivenB = pB > 0.001 ? pAB / pB : 0;
    const pBgivenA = pA > 0.001 ? pAB / pA : 0;
    
    const detected = COMMON_MISCONCEPTIONS.filter(m => {
      switch(m.id) {
        case 'symmetry':
          return m.check(pAgivenB, pBgivenA);
        case 'baseRate':
          return m.check(pA, pB, pAB);
        case 'independence':
          return m.check(pA, pB, pAB);
        default:
          return false;
      }
    });
    
    setDetectedMisconceptions(detected);
  }, [eventsData]);
  
  // Load example
  const loadExample = (exampleKey) => {
    const example = ENGINEERING_EXAMPLES[exampleKey];
    if (!example) return;
    
    setSelectedExample(exampleKey);
    setEventsData([
      { 
        x: 0.2, 
        y: 0.3, 
        width: example.events.A.prob, 
        height: 0.05, 
        name: example.events.A.name 
      },
      { 
        x: 0.2 + example.events.A.prob * 0.8, 
        y: 0.5, 
        width: example.events.B.prob, 
        height: 0.05, 
        name: example.events.B.name 
      }
    ]);
    setLearningMode(LEARNING_MODES.BEGINNER);
  };
  
  // Main visualization effect
  useEffect(() => {
    if (!svgRef.current) return;
    
    try {
      const svg = d3.select(svgRef.current);
      const { width } = svgRef.current.getBoundingClientRect();
      const height = 450;
      const margin = { top: 50, right: 40, bottom: 60, left: 40 };
      
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
      
      // Title without mode indicator (mode is shown in the left panel)
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.text)
        .style("font-size", "16px")
        .style("font-weight", "600")
        .text(currentPerspective === 'universe' ? 'Sample Space Ω' : `Conditional View: Given ${currentPerspective.toUpperCase()}`);
      
      // Scales
      const xScale = d3.scaleLinear()
        .domain(currentPerspective === 'universe' ? [0, 1] : 
                 (() => {
                   const event = eventsData.find(e => e.name.toLowerCase() === currentPerspective);
                   return event ? [event.x, event.x + event.width] : [0, 1];
                 })())
        .range([margin.left, width - margin.right]);
      
      const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([margin.top, height - margin.bottom]);
      
      const xWidthScale = d3.scaleLinear()
        .domain([0, currentPerspective === 'universe' ? 1 : 
                 eventsData.find(e => e.name.toLowerCase() === currentPerspective)?.width || 1])
        .range([0, innerWidth]);
      
      // Perspective highlight
      if (currentPerspective !== 'universe') {
        const perspectiveEvent = eventsData.find(e => e.name.toLowerCase() === currentPerspective);
        if (perspectiveEvent) {
          g.append("rect")
            .attr("x", xScale(perspectiveEvent.x))
            .attr("y", margin.top)
            .attr("width", xWidthScale(perspectiveEvent.width))
            .attr("height", innerHeight)
            .attr("fill", "white")
            .attr("opacity", 0.05)
            .attr("stroke", colorScheme.chart.secondary)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");
        }
      }
      
      // Draw events with educational enhancements
      const events = g.selectAll("g.event")
        .data(eventsData)
        .enter()
        .append("g")
        .attr("class", "event event-rectangles");
      
      const eventHeight = 80;
      
      // Event rectangles
      const rects = events.append("rect")
        .attr("x", d => xScale(d.x))
        .attr("y", d => yScale(d.y))
        .attr("width", d => xWidthScale(d.width))
        .attr("height", eventHeight)
        .attr("fill", (d, i) => {
          const colors = [colorScheme.chart.primary, colorScheme.chart.secondary, 
                         colorScheme.chart.tertiary, '#a855f7'];
          return colors[i % colors.length];
        })
        .attr("opacity", 0.7)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("rx", 4)
        .style("cursor", "move");
      
      // Event labels
      events.append("text")
        .attr("x", d => xScale(d.x + d.width / 2))
        .attr("y", d => yScale(d.y) + eventHeight / 2)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "white")
        .style("font-size", "20px")
        .style("font-weight", "700")
        .text(d => d.name)
        .attr("pointer-events", "none");
      
      // Probability labels with animation
      const probLabels = events.append("text")
        .attr("x", d => xScale(d.x + d.width / 2))
        .attr("y", d => yScale(d.y) + eventHeight + 20)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.text)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .text(d => `P(${d.name}) = ${d.width.toFixed(3)}`);
      
      // Highlight overlaps
      const overlaps = [];
      for (let i = 0; i < eventsData.length - 1; i++) {
        for (let j = i + 1; j < eventsData.length; j++) {
          const overlap = calcEventOverlap(eventsData[i], eventsData[j]);
          if (overlap > 0.001) {
            overlaps.push({
              events: [eventsData[i], eventsData[j]],
              value: overlap,
              x: Math.max(eventsData[i].x, eventsData[j].x),
              y: Math.max(eventsData[i].y, eventsData[j].y),
              width: overlap
            });
          }
        }
      }
      
      // Draw overlap areas with labels
      g.selectAll("g.overlap")
        .data(overlaps)
        .enter()
        .append("g")
        .attr("class", "overlap")
        .each(function(d) {
          const group = d3.select(this);
          
          // Overlap rectangle
          group.append("rect")
            .attr("x", xScale(d.x))
            .attr("y", yScale(d.y))
            .attr("width", xWidthScale(d.width))
            .attr("height", eventHeight)
            .attr("fill", "#facc15")
            .attr("opacity", 0.5)
            .attr("stroke", "#facc15")
            .attr("stroke-width", 2)
            .attr("pointer-events", "none");
          
          // Overlap label
          group.append("text")
            .attr("x", xScale(d.x + d.width / 2))
            .attr("y", yScale(d.y) + eventHeight + 40)
            .attr("text-anchor", "middle")
            .attr("fill", "#facc15")
            .style("font-size", "12px")
            .style("font-weight", "600")
            .style("font-family", "monospace")
            .text(`P(${d.events[0].name}∩${d.events[1].name}) = ${d.value.toFixed(3)}`);
        });
      
      // Enhanced drag behaviors with overlap constraints
      const dragRect = d3.drag()
        .on("start", function() {
          d3.select(this).attr("opacity", 1).raise();
        })
        .on("drag", function(event, d) {
          const i = eventsData.findIndex(e => e.name === d.name);
          // Get the transformed coordinates
          const pt = d3.pointer(event, svg.node());
          const newX = xScale.invert(pt[0]);
          
          // Constrain position
          let constrainedX = Math.max(0, Math.min(newX, 1 - d.width));
          
          // Check overlap constraints with other events
          eventsData.forEach((otherEvent, j) => {
            if (i !== j) {
              const overlap = calcEventOverlap(
                { ...d, x: constrainedX },
                otherEvent
              );
              const maxAllowedOverlap = Math.min(d.width, otherEvent.width) * 0.5;
              
              if (overlap > maxAllowedOverlap) {
                // Snap to edge if too much overlap
                if (constrainedX < otherEvent.x) {
                  constrainedX = otherEvent.x - (d.width - maxAllowedOverlap);
                } else {
                  constrainedX = otherEvent.x + otherEvent.width - maxAllowedOverlap;
                }
              }
            }
          });
          
          const newData = [...eventsData];
          newData[i] = { ...d, x: Math.max(0, Math.min(constrainedX, 1 - d.width)) };
          setEventsData(newData);
        })
        .on("end", function() {
          d3.select(this).attr("opacity", 0.7);
        });
      
      // Resize handles
      const handleSize = 10;
      
      // Left handles
      events.append("rect")
        .attr("x", d => xScale(d.x) - handleSize/2)
        .attr("y", d => yScale(d.y) + eventHeight/2 - handleSize)
        .attr("width", handleSize)
        .attr("height", handleSize * 2)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("cursor", "ew-resize")
        .attr("rx", 2)
        .call(d3.drag()
          .on("drag", function(event, d) {
            const i = eventsData.findIndex(e => e.name === d.name);
            const pt = d3.pointer(event, svg.node());
            const newX = xScale.invert(pt[0]);
            
            // Ensure minimum width
            const maxX = d.x + d.width - 0.05;
            const constrainedX = Math.max(0, Math.min(newX, maxX));
            const widthChange = d.x - constrainedX;
            
            const newData = [...eventsData];
            newData[i] = { 
              ...d, 
              x: constrainedX, 
              width: Math.max(0.05, d.width + widthChange) 
            };
            setEventsData(newData);
          }));
      
      // Right handles
      events.append("rect")
        .attr("x", d => xScale(d.x + d.width) - handleSize/2)
        .attr("y", d => yScale(d.y) + eventHeight/2 - handleSize)
        .attr("width", handleSize)
        .attr("height", handleSize * 2)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("cursor", "ew-resize")
        .attr("rx", 2)
        .call(d3.drag()
          .on("drag", function(event, d) {
            const i = eventsData.findIndex(e => e.name === d.name);
            const pt = d3.pointer(event, svg.node());
            const newRightEdge = xScale.invert(pt[0]);
            
            // Calculate new width
            const newWidth = Math.max(0.05, Math.min(newRightEdge - d.x, 1 - d.x));
            
            const newData = [...eventsData];
            newData[i] = { ...d, width: newWidth };
            setEventsData(newData);
          }));
      
      rects.call(dragRect);
      
      // X-axis with conditional labeling
      const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => d.toFixed(2));
      
      g.append("g")
        .attr("transform", `translate(0,${height - margin.bottom + 10})`)
        .attr("class", "x-axis")
        .call(xAxis)
        .selectAll("text")
        .attr("fill", colors.chart.text)
        .style("font-size", "12px");
      
      // Axis label
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.text)
        .style("font-size", "12px")
        .text(currentPerspective === 'universe' ? 'Probability Space [0, 1]' : `Conditional Space within ${currentPerspective.toUpperCase()}`);
      
      // Ball drop animation function
      function dropBall() {
        const p = Math.random();
        const duration = 2000;
        
        const ball = g.append("circle")
          .attr("cx", xScale(p))
          .attr("cy", yScale(0))
          .attr("r", 8)
          .attr("fill", "white")
          .attr("stroke", "black")
          .attr("stroke-width", 2);
        
        // Vertical drop line
        const dropLine = g.append("line")
          .attr("x1", xScale(p))
          .attr("y1", yScale(0))
          .attr("x2", xScale(p))
          .attr("y2", yScale(0))
          .attr("stroke", "white")
          .attr("stroke-width", 1)
          .attr("opacity", 0.5)
          .attr("stroke-dasharray", "3,3");
        
        // Check which events the ball hits
        const hits = eventsData.filter(event => 
          event.x <= p && p <= event.x + event.width
        );
        
        // Animate through each hit
        let delay = 0;
        hits.forEach((event, i) => {
          ball.transition()
            .delay(delay)
            .duration(duration / (hits.length + 1))
            .attr("cy", yScale(event.y) + eventHeight/2)
            .attr("fill", () => {
              const colors = [colorScheme.chart.primary, colorScheme.chart.secondary, 
                             colorScheme.chart.tertiary, '#a855f7'];
              const eventIndex = eventsData.findIndex(e => e.name === event.name);
              return colors[eventIndex % colors.length];
            });
          
          dropLine.transition()
            .delay(delay)
            .duration(duration / (hits.length + 1))
            .attr("y2", yScale(event.y) + eventHeight/2);
          
          delay += duration / (hits.length + 1);
        });
        
        // Final drop
        ball.transition()
          .delay(delay)
          .duration(duration / (hits.length + 1))
          .attr("cy", yScale(1))
          .attr("opacity", 0)
          .remove();
        
        dropLine.transition()
          .delay(delay)
          .duration(duration / (hits.length + 1))
          .attr("y2", yScale(1))
          .attr("opacity", 0)
          .remove();
        
        // Update history
        const hitKey = hits.map(e => e.name).sort().join('') || 'none';
        setEventHistory(prev => ({
          ...prev,
          [hitKey]: (prev[hitKey] || 0) + 1
        }));
        setSamplesDropped(prev => prev + 1);
      }
      
      dropBallRef.current = dropBall;
      
    } catch (error) {
      console.error('Error in visualization:', error);
    }
  }, [eventsData, currentPerspective, learningMode]);
  
  // Animation control
  function startAnimation() {
    if (intervalRef.current) return;
    setIsAnimating(true);
    intervalRef.current = setInterval(() => {
      if (dropBallRef.current) dropBallRef.current();
    }, animationSpeed);
  }
  
  function stopAnimation() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAnimating(false);
  }
  
  function reset() {
    stopAnimation();
    setSamplesDropped(0);
    setEventHistory({});
  }
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
  
  // Learning insights based on mode and progress
  const getLearningInsight = () => {
    const milestones = {
      [LEARNING_MODES.BEGINNER]: [10, 30, 50],
      [LEARNING_MODES.INTERMEDIATE]: [20, 50, 100],
      [LEARNING_MODES.ADVANCED]: [30, 100, 200]
    };
    
    const currentMilestones = milestones[learningMode];
    const nextMilestone = currentMilestones.find(m => samplesDropped < m) || currentMilestones[currentMilestones.length - 1];
    
    if (samplesDropped === 0) {
      return {
        title: "🎯 Ready to Begin?",
        content: `In ${learningMode} mode, you'll work with ${eventsData.length} events. Start sampling to see patterns emerge!`,
        milestone: `Next milestone: ${nextMilestone} samples`
      };
    } else if (samplesDropped < currentMilestones[0]) {
      return {
        title: "🌱 Building Intuition",
        content: "Watch how balls fall through events. Overlapping regions show joint probabilities.",
        milestone: `${currentMilestones[0] - samplesDropped} samples to first milestone`
      };
    } else if (samplesDropped < currentMilestones[1]) {
      return {
        title: "📊 Patterns Emerging",
        content: "Compare empirical frequencies with theoretical probabilities. Are they converging?",
        milestone: `${currentMilestones[1] - samplesDropped} samples to next milestone`
      };
    } else {
      return {
        title: "🎓 Mastery Level",
        content: "You've seen how conditional probability works! Try different arrangements or advance to the next mode.",
        milestone: "All milestones reached!"
      };
    }
  };
  
  const insight = getLearningInsight();
  const currentExample = selectedExample ? ENGINEERING_EXAMPLES[selectedExample] : null;
  
  return (
    <VisualizationContainer title="Conditional Probability: Enhanced Learning Experience">
      {/* Tutorial Overlay */}
      {showTutorial && (
        <TutorialOverlay 
          step={tutorialStep}
          onNext={() => {
            if (tutorialStep < 3) {
              setTutorialStep(tutorialStep + 1);
            } else {
              setShowTutorial(false);
            }
          }}
          onSkip={() => setShowTutorial(false)}
        />
      )}
      
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Left Panel - Controls and Info */}
        <div className="lg:w-1/3 flex flex-col gap-4">
          {/* Learning Mode Selector */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Learning Mode</h4>
            <div className="text-xs text-neutral-400 mb-2">Choose your complexity level:</div>
            <div className="space-y-2">
              {Object.values(LEARNING_MODES).map(mode => (
                <button
                  key={mode}
                  onClick={() => setLearningMode(mode)}
                  className={cn(
                    "w-full px-3 py-2 rounded text-left transition-all",
                    learningMode === mode
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  <div className="font-medium capitalize">{mode}</div>
                  <div className="text-xs opacity-80">
                    {mode === LEARNING_MODES.BEGINNER && "2 events - Master the basics"}
                    {mode === LEARNING_MODES.INTERMEDIATE && "3 events - Explore interactions"}
                    {mode === LEARNING_MODES.ADVANCED && "4 events - Complex relationships"}
                  </div>
                </button>
              ))}
            </div>
          </VisualizationSection>
          
          {/* Perspective Control */}
          <VisualizationSection className="p-4 perspective-buttons">
            <h4 className="text-base font-bold text-white mb-3">Perspective</h4>
            <div className="space-y-2">
              <button
                onClick={() => setCurrentPerspective('universe')}
                className={cn(
                  "w-full px-3 py-2 rounded text-left transition-all",
                  currentPerspective === 'universe'
                    ? "bg-purple-600 text-white"
                    : "bg-neutral-700 hover:bg-neutral-600 text-white"
                )}
              >
                <div className="font-medium">Universe Ω</div>
                <div className="text-xs opacity-80">See all possibilities</div>
              </button>
              {eventsData.map(event => (
                <button
                  key={event.name}
                  onClick={() => setCurrentPerspective(event.name.toLowerCase())}
                  className={cn(
                    "w-full px-3 py-2 rounded text-left transition-all",
                    currentPerspective === event.name.toLowerCase()
                      ? "bg-purple-600 text-white"
                      : "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  <div className="font-medium">Given {event.name}</div>
                  <div className="text-xs opacity-80">P(·|{event.name})</div>
                </button>
              ))}
            </div>
          </VisualizationSection>
          
          {/* Animation Controls */}
          <VisualizationSection className="p-4">
            <div className="flex gap-2 mb-3">
              <Button
                onClick={isAnimating ? stopAnimation : startAnimation}
                className={cn(
                  "flex-1",
                  isAnimating ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                )}
              >
                {isAnimating ? "Stop" : "Start"} Sampling
              </Button>
              <Button onClick={reset} variant="outline">
                Reset
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-neutral-400">Animation Speed</label>
              <input
                type="range"
                min="50"
                max="500"
                step="50"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </VisualizationSection>
          
          {/* Progress Tracker */}
          <VisualizationSection className="p-4">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Learning Progress</h4>
            <ProgressTracker 
              current={samplesDropped} 
              goal={learningMode === LEARNING_MODES.BEGINNER ? 50 : 
                    learningMode === LEARNING_MODES.INTERMEDIATE ? 100 : 200} 
              label="Sample Goal"
              color="purple"
            />
            <div className="mt-3 p-3 bg-purple-900/20 border border-purple-600/30 rounded">
              <div className="text-sm font-semibold text-purple-300">{insight.title}</div>
              <div className="text-xs text-neutral-300 mt-1">{insight.content}</div>
              <div className="text-xs text-purple-400 mt-2">{insight.milestone}</div>
            </div>
          </VisualizationSection>
        </div>
        
        {/* Right Panel - Visualizations and Formulas */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          {/* Engineering Examples */}
          <VisualizationSection className="p-3 example-selector">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white">Real-World Examples</h4>
              {selectedExample && (
                <Button 
                  onClick={() => {
                    setSelectedExample(null);
                    setEventsData(getInitialEvents(learningMode));
                  }}
                  variant="outline"
                  className="text-xs"
                >
                  Clear Example
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ENGINEERING_EXAMPLES).map(([key, example]) => (
                <button
                  key={key}
                  onClick={() => loadExample(key)}
                  className={cn(
                    "p-2 rounded text-left transition-all text-xs",
                    selectedExample === key
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  <div className="font-medium">{example.title}</div>
                </button>
              ))}
            </div>
            {currentExample && (
              <div className="mt-3 p-3 bg-blue-900/20 border border-blue-600/30 rounded">
                <div className="text-xs text-neutral-300">{currentExample.scenario}</div>
                <div className="text-xs text-blue-400 mt-2">💡 {currentExample.key}</div>
              </div>
            )}
          </VisualizationSection>
          
          {/* Main Visualization */}
          <GraphContainer height="450px">
            <svg ref={svgRef} style={{ width: "100%", height: 450 }} />
          </GraphContainer>
          
          {/* Live Formula Display */}
          {showFormulas && eventsData.length >= 2 && (
            <VisualizationSection className="p-4 formula-display">
              <LiveFormulaDisplay
                eventA={eventsData[0]}
                eventB={eventsData[1]}
                overlap={calcEventOverlap(eventsData[0], eventsData[1])}
                perspective={currentPerspective}
                animateChanges={true}
              />
            </VisualizationSection>
          )}
          
          {/* Key Insight: P(A|B) ≠ P(B|A) in general */}
          {eventsData.length >= 2 && (
            <VisualizationSection className="p-3">
              <h4 className="text-sm font-bold text-blue-400 mb-2">Key Insight</h4>
              <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded">
                <div className="text-xs text-neutral-300">
                  <div className="font-semibold mb-1">Remember: P(A|B) ≠ P(B|A) in general!</div>
                  <div>P(A|B) = "Probability of A given that B occurred"</div>
                  <div>P(B|A) = "Probability of B given that A occurred"</div>
                  <div className="mt-2 text-blue-400">These are only equal when P(A) = P(B)</div>
                </div>
              </div>
            </VisualizationSection>
          )}
          
          {/* Misconception Alerts */}
          {detectedMisconceptions.length > 0 && (
            <VisualizationSection className="p-4">
              <h4 className="text-sm font-bold text-yellow-400 mb-3">⚠️ Important Insights</h4>
              <div className="space-y-2">
                {detectedMisconceptions.map(misconception => (
                  <div 
                    key={misconception.id}
                    className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded"
                  >
                    <div className="text-sm font-semibold text-yellow-300">
                      {misconception.title}
                    </div>
                    <div className="text-xs text-neutral-300 mt-1">
                      {misconception.message}
                    </div>
                    <div className="text-xs text-yellow-400 mt-2">
                      Example: {misconception.example}
                    </div>
                  </div>
                ))}
              </div>
            </VisualizationSection>
          )}
          
          {/* Empirical vs Theoretical */}
          {samplesDropped > 20 && (
            <WorkedExampleContainer title="Convergence Analysis">
              <div className="space-y-3">
                <div className="text-sm text-neutral-300">
                  Comparing empirical frequencies (from {samplesDropped} samples) with theoretical probabilities:
                </div>
                <div className="space-y-2">
                  {eventsData.map(event => {
                    const theoretical = event.width;
                    const empiricalCount = Object.entries(eventHistory)
                      .filter(([key]) => key.includes(event.name))
                      .reduce((sum, [_, count]) => sum + count, 0);
                    const empirical = samplesDropped > 0 ? empiricalCount / samplesDropped : 0;
                    const error = Math.abs(theoretical - empirical);
                    
                    return (
                      <div key={event.name} className="flex items-center justify-between p-2 bg-neutral-800 rounded">
                        <span className="text-sm font-medium">P({event.name})</span>
                        <div className="flex gap-4 text-xs font-mono">
                          <span>Theoretical: {theoretical.toFixed(3)}</span>
                          <span>Empirical: {empirical.toFixed(3)}</span>
                          <span className={cn(
                            "font-semibold",
                            error < 0.05 ? "text-green-400" : "text-yellow-400"
                          )}>
                            ε = {error.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </WorkedExampleContainer>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default ConditionalProbabilityEnhanced;