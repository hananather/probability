"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { ProgressBar } from '../ui/ProgressBar';
import { tutorial_1_1_1 } from '@/tutorials/chapter1';
// Removed KeyboardSetBuilder - using simple input instead

// Use probability color scheme for set theory
const colorScheme = createColorScheme('probability');

function SampleSpacesEvents() {
  const [selectedSet, setSelectedSet] = useState("");
  const [currentSet, setCurrentSet] = useState([]);
  const [inputSet, setInputSet] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [dragEnabled, setDragEnabled] = useState(false);
  const [highlightExpression, setHighlightExpression] = useState("");
  const [challengeMode, setChallengeMode] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [challengeProgress, setChallengeProgress] = useState(new Set());
  const [feedback, setFeedback] = useState("");
  
  const svgRef = useRef(null);
  const scalesRef = useRef(null);
  const containerRef = useRef(null);
  
  // Minimal set of educational challenges
  const CHALLENGES = [
    {
      id: 'union-intro',
      instruction: 'Create the union of sets A and B',
      target: 'A∪B',
      hint: 'Union (∪) includes elements in A OR B',
      concept: 'Union combines all elements from both sets'
    },
    {
      id: 'intersection-intro',
      instruction: 'Create the intersection of sets A and B',
      target: 'A∩B',
      hint: 'Intersection (∩) includes elements in A AND B',
      concept: 'Intersection finds common elements'
    },
    {
      id: 'complement-intro',
      instruction: 'Create the complement of set A',
      target: "A'",
      hint: "Complement (') includes everything NOT in A",
      concept: 'Complement finds elements outside the set'
    },
    {
      id: 'demorgan-1',
      instruction: "Prove De Morgan's First Law: (A∪B)' = A'∩B'",
      target: "(A∪B)'",
      alternative: "A'∩B'",
      hint: 'Try both expressions and compare the results',
      concept: "De Morgan's laws show how complement distributes"
    },
    {
      id: 'demorgan-2',
      instruction: "Prove De Morgan's Second Law: (A∩B)' = A'∪B'",
      target: "(A∩B)'",
      alternative: "A'∪B'",
      hint: 'Build both sides and verify they highlight the same regions',
      concept: 'Complement turns AND into OR (and vice versa)'
    },
    {
      id: 'distributive',
      instruction: 'Verify: A∩(B∪C) = (A∩B)∪(A∩C)',
      target: 'A∩(B∪C)',
      alternative: '(A∩B)∪(A∩C)',
      hint: 'Intersection distributes over union',
      concept: 'Set operations follow distributive laws'
    },
    {
      id: 'complex',
      instruction: 'Find elements in A or C, but not in B',
      target: '(A∪C)∩B\'',
      alternatives: ['(A∪C)-B', 'A∩B\'∪C∩B\''],
      hint: 'Think about combining union with complement of B',
      concept: 'Complex expressions combine multiple operations'
    }
  ];
  
  // Set data for circles - positioned to avoid label overlap
  const [setData, setSetData] = useState([
    {name: 'A', cx: 0.3, cy: 0.35, r: 0.28},  // Slightly larger circles
    {name: 'B', cx: 0.7, cy: 0.35, r: 0.28},
    {name: 'C', cx: 0.5, cy: 0.7, r: 0.28}
  ]);

  // Create highlight shapes based on set operations
  function createHighlightShapes(expression, setData, containerSet, size) {
    const xScale = d3.scaleLinear().domain([0, 1]).range([0, size]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([0, size]);
    const rScale = d3.scaleLinear().domain([0, 0.5]).range([0, size/2]);
    
    const A = setData.find(s => s.name === 'A');
    const B = setData.find(s => s.name === 'B');
    const C = setData.find(s => s.name === 'C');
    
    // Clear existing highlights
    containerSet.selectAll('.highlight').remove();
    
    if (!expression || expression === '∅') return;
    
    // Create highlight group and defs
    const highlightGroup = containerSet.append('g')
      .attr('class', 'highlight')
      .style('pointer-events', 'none');
    
    const defs = highlightGroup.append('defs');
    
    // Helper function to create set path for complex operations
    function createSetHighlight(expr) {
      const timestamp = Date.now();
      
      // Handle single sets
      if (expr === 'A' || expr === 'B' || expr === 'C') {
        const set = setData.find(s => s.name === expr);
        highlightGroup.append('circle')
          .attr('cx', xScale(set.cx))
          .attr('cy', yScale(set.cy))
          .attr('r', rScale(set.r))
          .attr('fill', '#fbbf24')
          .attr('opacity', 0.6);
        return;
      }
      
      // Handle universal set
      if (expr === 'U') {
        highlightGroup.append('rect')
          .attr('width', size)
          .attr('height', size)
          .attr('fill', '#fbbf24')
          .attr('opacity', 0.6);
        return;
      }
      
      // Handle intersections
      if (expr.includes('∩')) {
        const parts = expr.split('∩').map(p => p.trim());
        if (parts.length === 2) {
          const [left, right] = parts;
          
          // Special case for simple intersections
          if ((left === 'A' || left === 'B' || left === 'C') && 
              (right === 'A' || right === 'B' || right === 'C')) {
            const set1 = setData.find(s => s.name === left);
            const set2 = setData.find(s => s.name === right);
            
            const maskId = `intersect-${timestamp}`;
            const mask = defs.append('mask').attr('id', maskId);
            
            // Black background
            mask.append('rect')
              .attr('width', size)
              .attr('height', size)
              .attr('fill', 'black');
            
            // First set in white
            mask.append('circle')
              .attr('cx', xScale(set1.cx))
              .attr('cy', yScale(set1.cy))
              .attr('r', rScale(set1.r))
              .attr('fill', 'white');
            
            // Apply second set with mask
            highlightGroup.append('circle')
              .attr('cx', xScale(set2.cx))
              .attr('cy', yScale(set2.cy))
              .attr('r', rScale(set2.r))
              .attr('fill', '#fbbf24')
              .attr('opacity', 0.6)
              .attr('mask', `url(#${maskId})`);
            return;
          }
        }
      }
      
      // Handle unions
      if (expr.includes('∪')) {
        const parts = expr.split('∪').map(p => p.trim());
        parts.forEach(part => {
          if (part === 'A' || part === 'B' || part === 'C') {
            const set = setData.find(s => s.name === part);
            highlightGroup.append('circle')
              .attr('cx', xScale(set.cx))
              .attr('cy', yScale(set.cy))
              .attr('r', rScale(set.r))
              .attr('fill', '#fbbf24')
              .attr('opacity', 0.6);
          }
        });
        return;
      }
      
      // Handle complements
      if (expr.endsWith("'")) {
        const baseSet = expr.slice(0, -1);
        if (baseSet === 'A' || baseSet === 'B' || baseSet === 'C') {
          const set = setData.find(s => s.name === baseSet);
          
          const maskId = `complement-${timestamp}`;
          const mask = defs.append('mask').attr('id', maskId);
          
          // White background
          mask.append('rect')
            .attr('width', size)
            .attr('height', size)
            .attr('fill', 'white');
          
          // Set in black (to exclude)
          mask.append('circle')
            .attr('cx', xScale(set.cx))
            .attr('cy', yScale(set.cy))
            .attr('r', rScale(set.r))
            .attr('fill', 'black');
          
          // Universal set with mask
          highlightGroup.append('rect')
            .attr('width', size)
            .attr('height', size)
            .attr('fill', '#fbbf24')
            .attr('opacity', 0.6)
            .attr('mask', `url(#${maskId})`);
        }
        return;
      }
      
      // Handle parentheses and complex expressions
      if (expr.includes('(')) {
        // For now, use the parsed result to highlight
        // This is a simplified approach - for full support we'd need
        // to properly parse and evaluate the expression visually
        return;
      }
    }
    
    // Process the expression
    createSetHighlight(expression);
  }

  // Helper function to keep circles within rectangular bounds
  function withinBounds(x, y, r) {
    // Ensure circles stay within rectangular bounds with padding
    const padding = 0.05;
    const minX = padding + r;
    const maxX = 1 - padding - r;
    const minY = padding + r;
    const maxY = 1 - padding - r;
    
    return [
      Math.max(minX, Math.min(maxX, x)),
      Math.max(minY, Math.min(maxY, y))
    ];
  }

  // Main visualization effect
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Small delay to ensure DOM is ready
    requestAnimationFrame(() => {
      const svg = d3.select(svgRef.current);
      const rect = svgRef.current.getBoundingClientRect();
      if (!rect.width) return; // Exit if width is 0
      
      const { width } = rect;
    const height = 650; // Increased to match container
    const padding = 20; // Slightly more padding for better visual balance
    const size = Math.min(width * 0.9, height);
    
    // Clear and setup SVG
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Dark background representing Universal Set
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // Add Universal Set label with better positioning
    svg.append("text")
      .attr("x", (width - size) / 2 + 10)
      .attr("y", 25)
      .attr("fill", colors.chart.text)
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .attr("opacity", 0.8)
      .text("Universal Set U");
    
    const containerSet = svg.append('g')
      .attr("transform", `translate(${(width - size) / 2}, ${(height - size) / 2})`);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([padding/2, size - padding/2]);
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([padding/2, size - padding/2]);
    const rScale = d3.scaleLinear()
      .domain([0, 0.5])
      .range([0, size/2 - padding/2]);
    
    // Create highlight group
    const highlightGroup = containerSet.append('g')
      .attr('class', 'highlight-group')
      .style('pointer-events', 'none');
    
    // Create set elements
    const eventsSet = containerSet.selectAll('g.event')
      .data(setData)
      .enter()
      .append('g')
      .attr('class', 'event');
    
    // Circles
    eventsSet.append('circle')
      .attr('class', d => `${d.name} circle`)
      .attr('cx', d => xScale(d.cx))
      .attr('cy', d => yScale(d.cy))
      .attr('r', d => rScale(d.r))
      .attr('fill', 'none')
      .attr('stroke', (d, i) => {
        return [colorScheme.chart.primary, colorScheme.chart.secondary, colorScheme.chart.tertiary][i];
      })
      .attr('stroke-width', 4)  // Thicker borders for better visibility
      .attr('stroke-dasharray', 'none')
      .attr('opacity', 0.9);
    
    // Labels
    eventsSet.append('text')
      .attr('x', d => xScale(d.cx))
      .attr('y', d => yScale(d.cy))
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', colors.chart.text)
      .style('font-size', '20px')  // Larger labels
      .style('font-weight', '700')
      .text(d => d.name);
    
    // Clip paths
    eventsSet.append("clipPath")
      .attr("id", d => d.name)
      .append("circle")
      .attr('cx', d => xScale(d.cx))
      .attr('cy', d => yScale(d.cy))
      .attr('r', d => rScale(d.r));
    
    // Create highlight shapes based on current expression
    createHighlightShapes(highlightExpression, setData, containerSet, size);
    
    // Store scales and container for drag functionality
    scalesRef.current = { xScale, yScale, rScale };
    containerRef.current = containerSet;
    
    // Drag functionality
    if (dragEnabled) {
      const drag = d3.drag()
        .on('start', function(event, d) {
          d3.select(this).style('cursor', 'grabbing');
        })
        .on('drag', function(event, d) {
          const x = xScale.invert(event.x);
          const y = yScale.invert(event.y);
          const [cx, cy] = withinBounds(x, y, d.r);
          
          // Update D3 elements directly without React state
          d3.select(this)
            .attr('cx', xScale(cx))
            .attr('cy', yScale(cy));
          
          // Update corresponding text label
          containerSet.selectAll('text')
            .filter(t => t.name === d.name)
            .attr('x', xScale(cx))
            .attr('y', yScale(cy));
          
          // Update clip path
          containerSet.select(`clipPath#${d.name} circle`)
            .attr('cx', xScale(cx))
            .attr('cy', yScale(cy));
        })
        .on('end', function(event, d) {
          d3.select(this).style('cursor', 'grab');
          
          // Only update React state on drag end
          const x = xScale.invert(event.x);
          const y = yScale.invert(event.y);
          const [cx, cy] = withinBounds(x, y, d.r);
          
          setSetData(prev => prev.map(s => 
            s.name === d.name ? { ...s, cx, cy } : s
          ));
        });
      
      eventsSet.selectAll('circle')
        .style('cursor', 'grab')
        .call(drag);
    }
    });
  }, [setData, highlightExpression]); // Removed dragEnabled to avoid recreation
  
  // Separate effect for drag enable/disable
  useEffect(() => {
    if (!containerRef.current || !scalesRef.current) return;
    
    const container = containerRef.current;
    const { xScale, yScale, rScale } = scalesRef.current;
    
    if (dragEnabled) {
      const drag = d3.drag()
        .on('start', function(event, d) {
          d3.select(this).style('cursor', 'grabbing');
        })
        .on('drag', function(event, d) {
          const x = xScale.invert(event.x);
          const y = yScale.invert(event.y);
          const [cx, cy] = withinBounds(x, y, d.r);
          
          // Update D3 elements directly
          d3.select(this)
            .attr('cx', xScale(cx))
            .attr('cy', yScale(cy));
          
          container.selectAll('text')
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
          
          setSetData(prev => prev.map(s => 
            s.name === d.name ? { ...s, cx, cy } : s
          ));
        });
      
      container.selectAll('circle')
        .filter(d => d)
        .style('cursor', 'grab')
        .call(drag);
    } else {
      // Remove drag behavior
      container.selectAll('circle')
        .style('cursor', 'default')
        .on('.drag', null);
    }
    
    // Helper function to keep circles within universe
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
  }, [dragEnabled]);
  
  // Set operation parser functions
  function union(set1, set2) {
    return [...new Set([...set1, ...set2])];
  }
  
  function intersect(set1, set2) {
    return set1.filter(x => set2.includes(x));
  }
  
  function complement(set1) {
    const universe = [1, 2, 3, 4, 5, 6, 7, 8];
    return universe.filter(x => !set1.includes(x));
  }
  
  // Parse set notation with proper recursive descent parser
  function parseSetNotation(notation) {
    // Validate input
    if (!notation || typeof notation !== 'string') {
      return [];
    }
    
    // Define set mappings
    const sets = {
      'A': [1, 4, 5, 7],
      'B': [2, 5, 6, 7],
      'C': [3, 4, 6, 7],
      'U': [1, 2, 3, 4, 5, 6, 7, 8],
      '∅': []
    };
    
    let index = 0;
    let tokens = [];
    
    // Parse the expression using recursive descent
    function parse(expr) {
      // Tokenize the expression first
      tokens = expr.split('').filter(char => char !== ' ');
      index = 0;
      const result = parseEvent();
      return result.evaluate();
    }
  
    // Parse an event (A, B, C, U, ∅, or parentheses)
    function parseEvent() {
      if (index >= tokens.length) {
        throw new Error('Unexpected end of expression');
      }
      
      const char = tokens[index];
      index++;
      
      if (char === 'A') return new SetEvent('A', sets['A'], parseOperator());
      else if (char === 'B') return new SetEvent('B', sets['B'], parseOperator());
      else if (char === 'C') return new SetEvent('C', sets['C'], parseOperator());
      else if (char === '∅') return new SetEvent('∅', sets['∅'], parseOperator());
      else if (char === 'U') return new SetEvent('U', sets['U'], parseOperator());
      else if (char === '(') {
        const innerEvent = parseEvent();
        // Consume closing parenthesis
        if (index >= tokens.length || tokens[index] !== ')') {
          throw new Error(`Expected ')' but found ${tokens[index] || 'end of expression'}`);
        }
        index++;
        return new ParenthesesEvent(innerEvent, parseOperator());
      }
      else throw new Error(`Expected A, B, C, ∅, U, or '(' but found '${char}'`);
    }
    
    // Parse an operator (∪, ∩, ', or end of expression)
    function parseOperator() {
      if (index >= tokens.length) {
        return new IdentityOperator();
      }
      
      const char = tokens[index];
      
      if (char === '∪') {
        index++;
        return new UnionOperator(parseEvent());
      }
      else if (char === '∩') {
        index++;
        return new IntersectOperator(parseEvent());
      }
      else if (char === "'") {
        index++;
        return new ComplementOperator(parseOperator());
      }
      else if (char === ')') {
        // Don't consume - let the parentheses handler deal with it
        return new IdentityOperator();
      }
      else throw new Error(`Expected ∪, ∩, ', or end of expression but found '${char}'`);
    }
    
    // Event classes
    class SetEvent {
      constructor(name, array, operator) {
        this.name = name;
        this.array = array;
        this.operator = operator;
      }
      
      evaluate() {
        return this.operator.evaluate(this.array);
      }
    }
    
    class ParenthesesEvent {
      constructor(innerEvent, operator) {
        this.innerEvent = innerEvent;
        this.operator = operator;
      }
      
      evaluate() {
        return this.operator.evaluate(this.innerEvent.evaluate());
      }
    }
    
    // Operator classes
    class IdentityOperator {
      evaluate(array) {
        return array;
      }
    }
    
    class UnionOperator {
      constructor(event) {
        this.event = event;
      }
      
      evaluate(array) {
        return union(array, this.event.evaluate());
      }
    }
    
    class IntersectOperator {
      constructor(event) {
        this.event = event;
      }
      
      evaluate(array) {
        return intersect(array, this.event.evaluate());
      }
    }
    
    class ComplementOperator {
      constructor(operator) {
        this.operator = operator;
      }
      
      evaluate(array) {
        return this.operator.evaluate(complement(array));
      }
    }
    
    try {
      // Remove whitespace
      const cleanNotation = notation.replace(/\s/g, '');
      if (!cleanNotation) return [];
      return parse(cleanNotation);
    } catch (e) {
      // Return empty set on error to maintain backward compatibility
      // In production, you might want to show the error to the user
      console.error('Parse error:', e.message);
      return [];
    }
  }
  
  // Handle submit
  function handleSubmit() {
    if (!inputSet.trim()) {
      setErrorMessage('Please enter a set expression');
      return;
    }
    
    try {
      const result = parseSetNotation(inputSet);
      setCurrentSet(result);
      setHighlightExpression(inputSet);
      setSelectedSet(inputSet);
      setErrorMessage('');
      
      // Check challenge answer if in challenge mode
      if (challengeMode && currentChallenge < CHALLENGES.length) {
        const challenge = CHALLENGES[currentChallenge];
        const isCorrect = inputSet === challenge.target || 
                         inputSet === challenge.alternative ||
                         (challenge.alternatives && challenge.alternatives.includes(inputSet));
        
        if (isCorrect) {
          setChallengeProgress(prev => new Set([...prev, challenge.id]));
          setFeedback(`✓ Correct! ${challenge.visual || 'Well done!'}`);
          
          // Auto-advance after 2 seconds
          setTimeout(() => {
            setFeedback('');
            if (currentChallenge < CHALLENGES.length - 1) {
              setCurrentChallenge(prev => prev + 1);
              handleReset();
            }
          }, 2500);
        } else {
          setFeedback(`Not quite. ${challenge.hint}`);
        }
      }
      
      setInputSet('');
    } catch (e) {
      setErrorMessage(`Invalid set notation: ${e.message}`);
    }
  }
  
  // Handle reset
  function handleReset() {
    setCurrentSet([]);
    setHighlightExpression('');
    setSelectedSet('');
    setInputSet('');
    setErrorMessage('');
    setFeedback('');
  }
  
  // Add set notation button
  function addNotation(notation) {
    setInputSet(prev => prev + notation);
  }

  return (
    <VisualizationContainer 
      title="Sample Spaces and Set Operations" 
      className="p-2"
      tutorialSteps={tutorial_1_1_1}
      tutorialKey="sample-spaces-1-1-1"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Simplified Left Panel - Only 3 sections */}
        <div className="lg:w-1/4 space-y-4">
          {/* Challenge Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={challengeMode ? 'neutral' : 'primary'}
              size="sm"
              onClick={() => {
                setChallengeMode(false);
                setFeedback('');
              }}
              className="flex-1"
            >
              Free Mode
            </Button>
            <Button
              variant={challengeMode ? 'primary' : 'neutral'}
              size="sm"
              onClick={() => {
                setChallengeMode(true);
                setCurrentChallenge(0);
                handleReset();
              }}
              className="flex-1"
            >
              Challenges
            </Button>
          </div>
          
          {/* Combined Guide Section */}
          <VisualizationSection className="p-4">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Explore set operations with the Venn diagram. The circles represent sets A, B, and C.
            </p>
          </VisualizationSection>
          
          {/* Challenge Display or Instructions */}
          {!challengeMode ? (
            <VisualizationSection className="p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Quick Reference</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono bg-neutral-800 px-2 py-1 rounded">∪</span>
                  <span className="text-neutral-300">Union (OR) - elements in either set</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono bg-neutral-800 px-2 py-1 rounded">∩</span>
                  <span className="text-neutral-300">Intersection (AND) - elements in both sets</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono bg-neutral-800 px-2 py-1 rounded">'</span>
                  <span className="text-neutral-300">Complement (NOT) - elements outside the set</span>
                </div>
              </div>
            </VisualizationSection>
          ) : (
            /* Challenge Display */
            <VisualizationSection className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-bold text-white">
                  Challenge {currentChallenge + 1}
                </h4>
                <span className="text-sm text-neutral-400">
                  {challengeProgress.size} / {CHALLENGES.length} completed
                </span>
              </div>
              
              <div className="space-y-3">
                {/* Current challenge */}
                <div className="bg-gradient-to-r from-purple-900/20 to-transparent border-l-4 border-purple-500 p-3 rounded">
                  <p className="text-sm font-medium text-white mb-1">
                    {CHALLENGES[currentChallenge]?.instruction}
                  </p>
                  <p className="text-xs text-neutral-400">
                    Hint: {CHALLENGES[currentChallenge]?.hint}
                  </p>
                </div>
                
                {/* Expected result for current challenge */}
                <div className="bg-neutral-800 rounded p-2 text-xs text-neutral-400">
                  <span className="text-neutral-500">Expected: </span>
                  <span className="font-mono text-yellow-400">{CHALLENGES[currentChallenge]?.target}</span>
                  {CHALLENGES[currentChallenge]?.alternative && (
                    <span className="text-neutral-500"> or </span>
                  )}
                  {CHALLENGES[currentChallenge]?.alternative && (
                    <span className="font-mono text-yellow-400">{CHALLENGES[currentChallenge].alternative}</span>
                  )}
                </div>
                
                {/* Feedback */}
                {feedback && (
                  <div className={cn(
                    "rounded p-2 text-sm transition-all",
                    feedback.startsWith('✓') 
                      ? "bg-green-900/30 text-green-400 border border-green-800" 
                      : "bg-amber-900/30 text-amber-400 border border-amber-800"
                  )}>
                    {feedback}
                  </div>
                )}
                
                {/* Progress bar */}
                <div className="pt-2">
                  <ProgressBar
                    current={challengeProgress.size}
                    total={CHALLENGES.length}
                    label="Overall Progress"
                    variant="teal"
                  />
                </div>
              </div>
            </VisualizationSection>
          )}

          {/* Set Builder with integrated keyboard shortcuts */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-semibold text-white mb-3">Set Builder</h4>
            
            {/* Simple input that actually works */}
            <div className="bg-neutral-900 rounded p-3 mb-3 font-mono text-lg text-white">
              <input
                type="text"
                value={inputSet}
                onChange={(e) => {
                  // Simple character replacement as you type
                  let val = e.target.value;
                  val = val.replace(/u/g, '∪').replace(/U/g, '∪');
                  val = val.replace(/i/g, '∩').replace(/I/g, '∩');
                  val = val.replace(/n/g, '∩').replace(/N/g, '∩');
                  setInputSet(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Type expression (u=∪, i=∩, '=complement)"
                className="w-full bg-transparent outline-none placeholder-neutral-500"
                autoFocus
              />
            </div>
            
            {/* Error message */}
            {errorMessage && (
              <div className="text-red-400 text-sm mb-3">{errorMessage}</div>
            )}
            
            {/* Notation buttons - always visible */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {['A', 'B', 'C', '∅', '∪', '∩', "'", '(', ')'].map(symbol => (
                <button
                  key={symbol}
                  onClick={() => addNotation(symbol)}
                  className={cn(
                    "px-3 py-2 rounded text-sm font-medium transition-colors",
                    "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  {symbol}
                </button>
              ))}
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className={cn(
                  "flex-1 px-3 py-2 rounded text-sm font-medium transition-colors",
                  "bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                Evaluate
              </button>
              <button
                onClick={() => setInputSet('')}
                className={cn(
                  "px-3 py-2 rounded text-sm font-medium transition-colors",
                  "bg-neutral-700 hover:bg-neutral-600 text-white"
                )}
              >
                Clear
              </button>
              <button
                onClick={handleReset}
                className={cn(
                  "px-3 py-2 rounded text-sm font-medium transition-colors",
                  "bg-neutral-700 hover:bg-neutral-600 text-white"
                )}
              >
                Reset
              </button>
            </div>
            
            {/* Toggle drag */}
            <label className="flex items-center gap-2 text-sm mt-3">
              <input 
                type="checkbox" 
                checked={dragEnabled} 
                onChange={e => setDragEnabled(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-neutral-300">Enable dragging sets</span>
            </label>
          </VisualizationSection>

        </div>

        {/* Expanded Visualization - Takes up more space */}
        <div className="lg:w-3/4">
          <GraphContainer height="650px" className="bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800">
            <svg ref={svgRef} style={{ width: "100%", height: 650 }} />
          </GraphContainer>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default SampleSpacesEvents;