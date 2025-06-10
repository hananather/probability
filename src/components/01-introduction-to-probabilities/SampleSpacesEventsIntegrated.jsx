"use client";
import React, { useState, useEffect, useRef, useReducer, useMemo } from "react";
import * as d3 from "d3";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { ProgressTracker } from '../ui/ProgressTracker';
import { MathJaxContent } from '../MathJaxProvider';

// Enhanced color scheme for conditional/unconditional states
const enhancedColorScheme = {
  unconditional: createColorScheme('probability'),
  conditional: {
    chart: {
      primary: '#8b5cf6',   // Violet for conditional
      secondary: '#06b6d4', // Cyan
      tertiary: '#f59e0b',  // Amber
      grid: '#374151'
    }
  },
  intersection: {
    highlight: '#fbbf24',  // Bright amber for active intersections
    inactive: 'transparent'
  }
};

// Learning modes configuration
const LEARNING_MODES = {
  beginner: {
    allowedOperations: ['∪', '∩'],
    showHints: true,
    guidedSteps: true,
    maxComplexity: 2
  },
  intermediate: {
    allowedOperations: ['∪', '∩', "'"],
    showHints: true,
    guidedSteps: false,
    maxComplexity: 3
  },
  advanced: {
    allowedOperations: ['∪', '∩', "'", '(', ')'],
    showHints: false,
    guidedSteps: false,
    maxComplexity: 5
  }
};

// Action types for state management
const ACTIONS = {
  UPDATE_SET_POSITION: 'UPDATE_SET_POSITION',
  EVALUATE_EXPRESSION: 'EVALUATE_EXPRESSION',
  SET_LEARNING_MODE: 'SET_LEARNING_MODE',
  SHOW_HINT: 'SHOW_HINT',
  RECORD_MISCONCEPTION: 'RECORD_MISCONCEPTION',
  TOGGLE_PANEL: 'TOGGLE_PANEL',
  UPDATE_INPUT: 'UPDATE_INPUT',
  RESET: 'RESET'
};

// Initial state
const initialState = {
  // Core set data
  sets: [
    {name: 'A', cx: 0.5 - 0.1*Math.sqrt(3), cy: 0.4, r: 0.25},
    {name: 'B', cx: 0.5 + 0.1*Math.sqrt(3), cy: 0.4, r: 0.25},
    {name: 'C', cx: 0.5, cy: 0.7, r: 0.25},
    {name: 'U', cx: 0.5, cy: 0.5, r: 0.5}
  ],
  
  // User interaction
  currentExpression: "",
  inputExpression: "",
  evaluatedSet: [],
  selectedSections: [],
  
  // Learning mode
  learningMode: 'intermediate',
  tutorialStep: 0,
  hintsShown: {},
  
  // Progress tracking
  operationsCount: 0,
  uniqueOperations: new Set(),
  misconceptions: [],
  
  // UI state
  dragEnabled: true,
  showFormula: true,
  showEngineering: false,
  errorMessage: ""
};

// Reducer for state management
function componentReducer(state, action) {
  switch (action.type) {
    case ACTIONS.UPDATE_SET_POSITION:
      return {
        ...state,
        sets: state.sets.map(s => 
          s.name === action.payload.setName 
            ? { ...s, ...action.payload.position }
            : s
        )
      };
      
    case ACTIONS.EVALUATE_EXPRESSION:
      return {
        ...state,
        currentExpression: action.payload.expression,
        evaluatedSet: action.payload.result,
        operationsCount: state.operationsCount + 1,
        errorMessage: "",
        inputExpression: ""
      };
      
    case ACTIONS.SET_LEARNING_MODE:
      return {
        ...state,
        learningMode: action.payload
      };
      
    case ACTIONS.UPDATE_INPUT:
      return {
        ...state,
        inputExpression: action.payload
      };
      
    case ACTIONS.RESET:
      return {
        ...initialState,
        learningMode: state.learningMode
      };
      
    default:
      return state;
  }
}

// Main integrated component
function SampleSpacesEventsIntegrated({
  defaultLearningMode = 'intermediate',
  showFormulaVisualizer = true,
  showEngineeringContext = false,
  enableDragging = true,
  onMilestone,
  colorScheme = 'probability'
}) {
  const [state, dispatch] = useReducer(componentReducer, {
    ...initialState,
    learningMode: defaultLearningMode,
    showFormula: showFormulaVisualizer,
    showEngineering: showEngineeringContext,
    dragEnabled: enableDragging
  });
  
  const svgRef = useRef(null);
  const d3Container = useRef(null);
  const scalesRef = useRef(null);
  
  // Memoized calculations
  const currentMode = useMemo(() => 
    LEARNING_MODES[state.learningMode], 
    [state.learningMode]
  );
  
  const activeColorScheme = useMemo(() => 
    state.currentExpression.includes('|') 
      ? enhancedColorScheme.conditional 
      : enhancedColorScheme.unconditional,
    [state.currentExpression]
  );
  
  // SVG initialization (once)
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 550;
    const padding = 15;
    const size = Math.min(width * 0.9, height);
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Dark background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const containerSet = svg.append('g')
      .attr("transform", `translate(${(width - size) / 2}, ${(height - size) / 2})`);
    
    d3Container.current = containerSet;
    
    // Store scales
    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([padding/2, size - padding/2]);
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([padding/2, size - padding/2]);
    const rScale = d3.scaleLinear()
      .domain([0, 0.5])
      .range([0, size/2 - padding/2]);
    
    scalesRef.current = { xScale, yScale, rScale, size };
    
    // Create static elements
    createStaticElements(containerSet, size);
    
    // Initial render
    updateDynamicElements();
  }, []);
  
  // Create static intersection sections
  function createStaticElements(container, size) {
    // Create sections for highlighting with semantic IDs
    const sections = [
      { id: "set-universe", clipPath: "url(#U)", name: "U" },
      { id: "set-a", clipPath: "url(#A)", name: "A" },
      { id: "set-b", clipPath: "url(#B)", name: "B" },
      { id: "set-c", clipPath: "url(#C)", name: "C" },
    ];
    
    sections.forEach(section => {
      container.append("rect")
        .attr("clip-path", section.clipPath)
        .attr("class", "section")
        .attr("id", section.id)
        .attr('width', size)
        .attr('height', size)
        .attr('fill', 'transparent')
        .attr('data-section', section.name);
    });
    
    // Create compound intersections
    const compounds = [
      { parent: "A", child: "C", id: "set-ac" },
      { parent: "A", child: "B", id: "set-ab" },
      { parent: "B", child: "C", id: "set-bc" },
    ];
    
    compounds.forEach(comp => {
      container.append("g")
        .attr("clip-path", `url(#${comp.parent})`)
        .append("rect")
        .attr("clip-path", `url(#${comp.child})`)
        .attr("class", "section compound")
        .attr("id", comp.id)
        .attr('width', size)
        .attr('height', size)
        .attr('fill', 'transparent');
    });
    
    // Triple intersection
    container.append("g")
      .attr("clip-path", "url(#A)")
      .append("g")
      .attr("clip-path", "url(#B)")
      .append("rect")
      .attr("clip-path", "url(#C)")
      .attr("class", "section compound")
      .attr("id", "set-abc")
      .attr('width', size)
      .attr('height', size)
      .attr('fill', 'transparent');
  }
  
  // Update dynamic elements
  function updateDynamicElements() {
    if (!d3Container.current || !scalesRef.current) return;
    
    const container = d3Container.current;
    const { xScale, yScale, rScale } = scalesRef.current;
    
    // Update clip paths
    const clipPaths = container.selectAll("clipPath")
      .data(state.sets, d => d.name);
    
    clipPaths.enter()
      .append("clipPath")
      .attr("id", d => d.name)
      .append("circle");
    
    clipPaths.select("circle")
      .attr('cx', d => xScale(d.cx))
      .attr('cy', d => yScale(d.cy))
      .attr('r', d => rScale(d.r));
    
    // Update circles
    const circles = container.selectAll('circle.set-circle')
      .data(state.sets, d => d.name);
    
    const circlesEnter = circles.enter()
      .append('circle')
      .attr('class', 'set-circle')
      .attr('fill', 'none')
      .attr('stroke-width', d => d.name === 'U' ? 2 : 3)
      .attr('stroke-dasharray', d => d.name === 'U' ? '5,5' : 'none');
    
    circles.merge(circlesEnter)
      .attr('cx', d => xScale(d.cx))
      .attr('cy', d => yScale(d.cy))
      .attr('r', d => rScale(d.r))
      .attr('stroke', (d, i) => {
        if (i === 3) return colors.chart.grid;
        return [
          activeColorScheme.chart.primary, 
          activeColorScheme.chart.secondary, 
          activeColorScheme.chart.tertiary
        ][i];
      })
      .attr('opacity', d => d.name === 'U' ? 0.5 : 1);
    
    // Update labels
    const labels = container.selectAll('text.set-label')
      .data(state.sets.filter(s => s.name !== 'U'), d => d.name);
    
    const labelsEnter = labels.enter()
      .append('text')
      .attr('class', 'set-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', colors.chart.text)
      .style('font-size', '18px')
      .style('font-weight', '600');
    
    labels.merge(labelsEnter)
      .attr('x', d => xScale(d.cx))
      .attr('y', d => yScale(d.cy))
      .text(d => d.name);
    
    // Setup drag if enabled
    if (state.dragEnabled) {
      setupDragBehavior();
    }
  }
  
  // Smooth drag behavior
  function setupDragBehavior() {
    if (!d3Container.current || !scalesRef.current) return;
    
    const container = d3Container.current;
    const { xScale, yScale } = scalesRef.current;
    
    const drag = d3.drag()
      .on('start', function(event, d) {
        d3.select(this).style('cursor', 'grabbing');
      })
      .on('drag', function(event, d) {
        if (d.name === 'U') return;
        
        const x = xScale.invert(event.x);
        const y = yScale.invert(event.y);
        const [cx, cy] = withinBounds(x, y, d.r);
        
        // Update visuals immediately
        d3.select(this)
          .attr('cx', xScale(cx))
          .attr('cy', yScale(cy));
        
        container.select(`text.set-label`)
          .filter(t => t.name === d.name)
          .attr('x', xScale(cx))
          .attr('y', yScale(cy));
        
        container.select(`clipPath#${d.name} circle`)
          .attr('cx', xScale(cx))
          .attr('cy', yScale(cy));
      })
      .on('end', function(event, d) {
        d3.select(this).style('cursor', 'grab');
        
        const x = xScale.invert(event.x);
        const y = yScale.invert(event.y);
        const [cx, cy] = withinBounds(x, y, d.r);
        
        dispatch({
          type: ACTIONS.UPDATE_SET_POSITION,
          payload: { setName: d.name, position: { cx, cy } }
        });
      });
    
    container.selectAll('circle.set-circle')
      .filter(d => d.name !== 'U')
      .style('cursor', 'grab')
      .call(drag);
  }
  
  // Keep circles within bounds
  function withinBounds(x, y, r) {
    const distCenter = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2);
    if (distCenter + r <= 0.5) {
      return [x, y];
    } else {
      const ratio = (0.5 - r) / distCenter;
      return [
        ratio * (x - 0.5) + 0.5,
        ratio * (y - 0.5) + 0.5
      ];
    }
  }
  
  // Update highlighting
  function updateIntersectionHighlighting() {
    if (!d3Container.current) return;
    
    const container = d3Container.current;
    const mapping = {
      1: 'set-a',
      2: 'set-b', 
      3: 'set-c',
      4: 'set-ac',
      5: 'set-ab',
      6: 'set-bc',
      7: 'set-abc',
      8: 'set-universe'
    };
    
    Object.entries(mapping).forEach(([num, id]) => {
      const section = container.select(`#${id}`);
      if (section.node()) {
        const isActive = state.evaluatedSet.includes(parseInt(num));
        section.transition()
          .duration(200)
          .style('fill', isActive ? enhancedColorScheme.intersection.highlight : 'transparent')
          .style('opacity', isActive ? 0.4 : 0);
      }
    });
  }
  
  // Update when sets change
  useEffect(() => {
    updateDynamicElements();
  }, [state.sets, state.dragEnabled]);
  
  // Update highlighting
  useEffect(() => {
    updateIntersectionHighlighting();
  }, [state.evaluatedSet]);
  
  // Set operations (same as before)
  function parseSetNotation(notation) {
    // ... (same parser implementation as optimized version)
    // Simplified for scaffolding - would use the full parser
    const sets = {
      'A': [1, 4, 5, 7],
      'B': [2, 5, 6, 7],
      'C': [3, 4, 6, 7],
      'U': [1, 2, 3, 4, 5, 6, 7, 8],
      '∅': []
    };
    
    // Basic implementation for demo
    if (notation === 'A') return sets.A;
    if (notation === 'B') return sets.B;
    if (notation === 'C') return sets.C;
    if (notation === 'A∪B') return [...new Set([...sets.A, ...sets.B])];
    if (notation === 'A∩B') return sets.A.filter(x => sets.B.includes(x));
    
    return [];
  }
  
  // Handle expression submission
  function handleSubmit() {
    if (!state.inputExpression.trim()) {
      return;
    }
    
    try {
      const result = parseSetNotation(state.inputExpression);
      
      dispatch({
        type: ACTIONS.EVALUATE_EXPRESSION,
        payload: {
          expression: state.inputExpression,
          result
        }
      });
      
      // Check milestones
      if (onMilestone && state.operationsCount === 10) {
        onMilestone('first_ten_operations');
      }
    } catch (e) {
      // Handle error
    }
  }
  
  return (
    <VisualizationContainer 
      title="Sample Spaces and Set Operations - Integrated" 
      className="p-4"
    >
      {/* Learning Mode Selector */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-2">
          {Object.keys(LEARNING_MODES).map(mode => (
            <button
              key={mode}
              onClick={() => dispatch({ type: ACTIONS.SET_LEARNING_MODE, payload: mode })}
              className={cn(
                "px-4 py-2 rounded text-sm font-medium transition-colors capitalize",
                state.learningMode === mode 
                  ? "bg-purple-600 text-white" 
                  : "bg-neutral-700 hover:bg-neutral-600 text-white"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => dispatch({ type: ACTIONS.TOGGLE_PANEL, payload: 'formula' })}
            className={cn(
              "px-3 py-1 rounded text-sm",
              state.showFormula ? "bg-blue-600" : "bg-neutral-700"
            )}
          >
            Formula
          </button>
          <button
            onClick={() => dispatch({ type: ACTIONS.TOGGLE_PANEL, payload: 'engineering' })}
            className={cn(
              "px-3 py-1 rounded text-sm",
              state.showEngineering ? "bg-green-600" : "bg-neutral-700"
            )}
          >
            Engineering
          </button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel - Controls */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Explore set operations with {state.learningMode} mode active. 
              {currentMode.showHints && " Hints are enabled to guide your learning."}
            </p>
          </VisualizationSection>
          
          {/* Set Builder */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Set Builder</h4>
            
            <div className="bg-neutral-900 rounded p-3 mb-3 min-h-[50px] font-mono text-lg text-white">
              {state.inputExpression || <span className="text-neutral-500">Enter set notation...</span>}
            </div>
            
            {state.errorMessage && (
              <div className="text-red-400 text-sm mb-3">{state.errorMessage}</div>
            )}
            
            <div className="grid grid-cols-4 gap-2 mb-3">
              {['A', 'B', 'C', '∅', ...currentMode.allowedOperations].map(symbol => (
                <button
                  key={symbol}
                  onClick={() => dispatch({ 
                    type: ACTIONS.UPDATE_INPUT, 
                    payload: state.inputExpression + symbol 
                  })}
                  className={cn(
                    "px-3 py-2 rounded text-sm font-medium transition-colors",
                    "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  {symbol}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="flex-1 px-3 py-2 rounded text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
              >
                Evaluate
              </button>
              <button
                onClick={() => dispatch({ type: ACTIONS.RESET })}
                className="px-3 py-2 rounded text-sm font-medium bg-neutral-700 hover:bg-neutral-600 text-white"
              >
                Reset
              </button>
            </div>
          </VisualizationSection>
          
          {/* Current Expression */}
          {state.currentExpression && (
            <VisualizationSection className="p-3">
              <h4 className="text-base font-bold text-white mb-3">Current Expression</h4>
              <div className="bg-neutral-800 rounded-lg p-3">
                <div className="text-lg font-mono text-yellow-400 mb-2">
                  {state.currentExpression}
                </div>
                <div className="text-sm text-neutral-300">
                  Elements: {state.evaluatedSet.length > 0 
                    ? `{${state.evaluatedSet.join(', ')}}` 
                    : '∅'}
                </div>
              </div>
            </VisualizationSection>
          )}
          
          {/* Formula Visualizer */}
          {state.showFormula && state.currentExpression && (
            <VisualizationSection className="p-3">
              <h4 className="text-base font-bold text-white mb-3">Formula Breakdown</h4>
              <div className="bg-neutral-800 rounded-lg p-3">
                <MathJaxContent
                  content={`$$${state.currentExpression} = \\{${state.evaluatedSet.join(', ')}\\}$$`}
                  className="text-white"
                />
              </div>
            </VisualizationSection>
          )}
          
          {/* Progress */}
          <VisualizationSection className="p-3">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Learning Progress</h4>
            <ProgressTracker 
              current={state.operationsCount} 
              goal={20} 
              label="Set Operations"
              color="purple"
            />
          </VisualizationSection>
        </div>
        
        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3">
          <GraphContainer height="600px">
            <svg ref={svgRef} style={{ width: "100%", height: 600 }} />
          </GraphContainer>
          
          {/* Engineering Context Panel */}
          {state.showEngineering && (
            <VisualizationSection className="mt-4 p-3">
              <h4 className="text-base font-bold text-white mb-3">Engineering Applications</h4>
              <div className="grid gap-3">
                <div className="bg-neutral-800 rounded p-3">
                  <h5 className="font-semibold text-yellow-400 mb-1">Quality Control</h5>
                  <p className="text-sm text-neutral-300">
                    Sets represent product defect categories. Intersections show products 
                    with multiple defects, helping identify common failure modes.
                  </p>
                </div>
                <div className="bg-neutral-800 rounded p-3">
                  <h5 className="font-semibold text-blue-400 mb-1">System Reliability</h5>
                  <p className="text-sm text-neutral-300">
                    Sets represent component failures. Use set operations to calculate 
                    system failure probabilities in redundant systems.
                  </p>
                </div>
              </div>
            </VisualizationSection>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default SampleSpacesEventsIntegrated;