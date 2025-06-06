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
import { Button } from '../ui/button';
import { ProgressTracker } from '../ui/ProgressTracker';

// Use probability color scheme for set theory
const colorScheme = createColorScheme('probability');

function SampleSpacesEvents() {
  const [selectedSet, setSelectedSet] = useState("");
  const [currentSet, setCurrentSet] = useState([]);
  const [inputSet, setInputSet] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [operationsCount, setOperationsCount] = useState(0);
  const [dragEnabled, setDragEnabled] = useState(false);
  
  const svgRef = useRef(null);
  
  // Set data for circles
  const [setData, setSetData] = useState([
    {name: 'A', cx: 0.5 - 0.1*Math.sqrt(3), cy: 0.4, r: 0.25},
    {name: 'B', cx: 0.5 + 0.1*Math.sqrt(3), cy: 0.4, r: 0.25},
    {name: 'C', cx: 0.5, cy: 0.7, r: 0.25},
    {name: 'U', cx: 0.5, cy: 0.5, r: 0.5}
  ]);

  // Update intersection highlighting
  function updateIntersection() {
    if (!svgRef.current) return;
    
    for (let i = 1; i <= 8; i++) {
      const section = d3.select(`#set${i}`);
      if (section.node()) {
        const fill = currentSet.includes(i) ? colorScheme.chart.tertiary : 'transparent';
        section.style('fill', fill).style('opacity', 0.3);
      }
    }
  }

  // Main visualization effect
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 550;
    const padding = 15;
    const size = Math.min(width * 0.9, height);
    
    // Clear and setup SVG
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Dark background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
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
    
    // Create sections for highlighting
    containerSet.append("rect")
      .attr("clip-path", "url(#U)")
      .attr("class", "section")
      .attr("id", "set8")
      .attr('width', size)
      .attr('height', size);

    containerSet.append("rect")
      .attr("clip-path", "url(#A)")
      .attr("class", "section")
      .attr("id", "set1")
      .attr('width', size)
      .attr('height', size);

    containerSet.append("rect")
      .attr("clip-path", "url(#B)")
      .attr("class", "section")
      .attr("id", "set2")
      .attr('width', size)
      .attr('height', size);

    containerSet.append("rect")
      .attr("clip-path", "url(#C)")
      .attr("class", "section")
      .attr("id", "set3")
      .attr('width', size)
      .attr('height', size);

    containerSet.append("g")
      .attr("clip-path", "url(#A)")
      .append("rect")
      .attr("clip-path", "url(#C)")
      .attr("class", "section")
      .attr("id", "set4")
      .attr('width', size)
      .attr('height', size);

    containerSet.append("g")
      .attr("clip-path", "url(#A)")
      .append("rect")
      .attr("clip-path", "url(#B)")
      .attr("class", "section")
      .attr("id", "set5")
      .attr('width', size)
      .attr('height', size);

    containerSet.append("g")
      .attr("clip-path", "url(#B)")
      .append("rect")
      .attr("clip-path", "url(#C)")
      .attr("class", "section")
      .attr("id", "set6")
      .attr('width', size)
      .attr('height', size);

    containerSet.append("g")
      .attr("clip-path", "url(#A)")
      .append("g")
      .attr("clip-path", "url(#B)")
      .append("rect")
      .attr("clip-path", "url(#C)")
      .attr("class", "section")
      .attr("id", "set7")
      .attr('width', size)
      .attr('height', size);
    
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
        if (i === 3) return colors.chart.grid; // Universe
        return [colorScheme.chart.primary, colorScheme.chart.secondary, colorScheme.chart.tertiary][i];
      })
      .attr('stroke-width', d => d.name === 'U' ? 2 : 3)
      .attr('stroke-dasharray', d => d.name === 'U' ? '5,5' : 'none');
    
    // Labels
    eventsSet.append('text')
      .attr('x', d => xScale(d.cx))
      .attr('y', d => yScale(d.cy))
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', colors.chart.text)
      .style('font-size', '18px')
      .style('font-weight', '600')
      .text(d => d.name);
    
    // Clip paths
    eventsSet.append("clipPath")
      .attr("id", d => d.name)
      .append("circle")
      .attr('cx', d => xScale(d.cx))
      .attr('cy', d => yScale(d.cy))
      .attr('r', d => rScale(d.r));
    
    // Update intersection highlighting
    updateIntersection();
    
    // Drag functionality
    if (dragEnabled) {
      const drag = d3.drag()
        .on('drag', function(event, d) {
          const index = setData.findIndex(s => s.name === d.name);
          if (index === 3) return; // Don't drag universe
          
          const x = xScale.invert(event.x);
          const y = yScale.invert(event.y);
          const [cx, cy] = withinBounds(x, y, d.r);
          
          const newSetData = [...setData];
          newSetData[index] = { ...d, cx, cy };
          setSetData(newSetData);
        });
      
      eventsSet.selectAll('circle').call(drag);
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
  }, [setData, currentSet, dragEnabled]);
  
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
    try {
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
      
      let index = -1;
      
      // Parse the expression using recursive descent
      function parse(expr) {
        index = -1;
        const iter = expr[Symbol.iterator]();
        const result = parseEvent(iter);
        return result.evaluate();
      }
    
    // Parse an event (A, B, C, U, ∅, or parentheses)
    function parseEvent(iter) {
      const next = iter.next();
      index++;
      
      if (next.done) {
        throw new Error('Unexpected end of expression');
      }
      
      const char = next.value;
      
      if (char === 'A') return new SetEvent('A', sets['A'], parseOperator(iter));
      else if (char === 'B') return new SetEvent('B', sets['B'], parseOperator(iter));
      else if (char === 'C') return new SetEvent('C', sets['C'], parseOperator(iter));
      else if (char === '∅') return new SetEvent('∅', sets['∅'], parseOperator(iter));
      else if (char === 'U') return new SetEvent('U', sets['U'], parseOperator(iter));
      else if (char === '(') {
        const innerEvent = parseEvent(iter);
        // Consume closing parenthesis
        const closeParen = iter.next();
        index++;
        if (closeParen.done || closeParen.value !== ')') {
          throw new Error(`Expected ')' but found ${closeParen.value || 'end of expression'}`);
        }
        return new ParenthesesEvent(innerEvent, parseOperator(iter));
      }
      else throw new Error(`Expected A, B, C, ∅, U, or '(' but found '${char}'`);
    }
    
    // Parse an operator (∪, ∩, ', or end of expression)
    function parseOperator(iter) {
      const next = iter.next();
      index++;
      
      if (next.done) {
        return new IdentityOperator();
      }
      
      const char = next.value;
      
      if (char === '∪') return new UnionOperator(parseEvent(iter));
      else if (char === '∩') return new IntersectOperator(parseEvent(iter));
      else if (char === "'") return new ComplementOperator(parseOperator(iter));
      else if (char === ')') {
        // Put the parenthesis back for the caller to handle
        index--;
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
        return parse(notation);
      } catch (e) {
        console.error('Parse error:', e);
        return []; // Return empty set on error instead of throwing
      }
    } catch (e) {
      console.error('Parser setup error:', e);
      return [];
    }
  }
  
  // Handle submit
  function handleSubmit() {
    try {
      const result = parseSetNotation(inputSet);
      setCurrentSet(result);
      setSelectedSet(inputSet);
      setErrorMessage('');
      setOperationsCount(prev => prev + 1);
      setInputSet('');
      updateIntersection();
    } catch (e) {
      setErrorMessage(`Invalid set notation: ${e.message}`);
    }
  }
  
  // Handle reset
  function handleReset() {
    setCurrentSet([]);
    setSelectedSet('');
    setInputSet('');
    setErrorMessage('');
    setOperationsCount(0);
    updateIntersection();
  }
  
  // Add set notation button
  function addNotation(notation) {
    setInputSet(prev => prev + notation);
  }

  return (
    <VisualizationContainer title="Sample Spaces and Set Operations" className="p-2">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Explore set operations and Venn diagrams. Sets A, B, and C are subsets of the 
              universal set U. Build set expressions using union (∪), intersection (∩), 
              and complement (') operations.
            </p>
          </VisualizationSection>

          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Set Builder</h4>
            
            {/* Input display */}
            <div className="bg-neutral-900 rounded p-3 mb-3 min-h-[50px] font-mono text-lg text-white">
              {inputSet || <span className="text-neutral-500">Enter set notation...</span>}
            </div>
            
            {/* Error message */}
            {errorMessage && (
              <div className="text-red-400 text-sm mb-3">{errorMessage}</div>
            )}
            
            {/* Notation buttons */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {['A', 'B', 'C', 'U', '∅', '∪', '∩', "'", '(', ')'].map(symbol => (
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
                onClick={() => setInputSet(prev => prev.slice(0, -1))}
                className={cn(
                  "px-3 py-2 rounded text-sm font-medium transition-colors",
                  "bg-neutral-700 hover:bg-neutral-600 text-white"
                )}
              >
                Delete
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

          {/* Current Set Display */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Current Expression</h4>
            <div className="bg-neutral-800 rounded-lg p-3">
              <div className="text-lg font-mono text-yellow-400 mb-2">
                {selectedSet || '—'}
              </div>
              <div className="text-sm text-neutral-300">
                Elements: {currentSet.length > 0 ? `{${currentSet.join(', ')}}` : '∅'}
              </div>
            </div>
          </VisualizationSection>

          {/* Progress */}
          <VisualizationSection className="p-3">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Learning Progress</h4>
            
            <ProgressTracker 
              current={operationsCount} 
              goal={20} 
              label="Set Operations Evaluated"
              color="purple"
            />
            
            <div className="space-y-2 text-xs text-neutral-300 mt-3">
              {operationsCount === 0 && (
                <div>
                  <p>🎯 Ready to explore set operations?</p>
                  <p className="text-purple-300 mt-1">
                    Try building expressions like A∪B or A'∩C to see how sets combine!
                  </p>
                </div>
              )}
              {operationsCount > 0 && operationsCount < 5 && (
                <p>📊 Great start! Try more complex operations like (A∪B)∩C.</p>
              )}
              {operationsCount >= 5 && operationsCount < 10 && (
                <div>
                  <p>🎓 You're getting the hang of it! Notice how:</p>
                  <ul className="ml-3 mt-1 space-y-1">
                    <li>• Union (∪) combines elements from both sets</li>
                    <li>• Intersection (∩) finds common elements</li>
                    <li>• Complement (') finds elements NOT in the set</li>
                  </ul>
                </div>
              )}
              {operationsCount >= 10 && operationsCount < 20 && (
                <div>
                  <p>🔥 Excellent progress! Try these advanced patterns:</p>
                  <ul className="ml-3 mt-1 space-y-1">
                    <li>• De Morgan's Laws: (A∪B)' = A'∩B'</li>
                    <li>• Distributive: A∩(B∪C) = (A∩B)∪(A∩C)</li>
                  </ul>
                </div>
              )}
              {operationsCount >= 20 && (
                <div>
                  <p className="text-green-400 font-semibold mb-1">
                    ✨ Set Theory Master! You've performed {operationsCount} operations.
                  </p>
                  <p>Challenge: Can you find a set expression that results in exactly 3 elements?</p>
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>

        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3">
          <GraphContainer height="600px">
            <svg ref={svgRef} style={{ width: "100%", height: 600 }} />
          </GraphContainer>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default SampleSpacesEvents;