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

const colorScheme = createColorScheme('probability');

// Optimized version based on test results
function SampleSpacesEventsOptimized() {
  const [selectedSet, setSelectedSet] = useState("");
  const [currentSet, setCurrentSet] = useState([]);
  const [inputSet, setInputSet] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [operationsCount, setOperationsCount] = useState(0);
  const [dragEnabled, setDragEnabled] = useState(false);
  
  const svgRef = useRef(null);
  const d3Container = useRef(null);
  const scalesRef = useRef(null);
  
  // Set data for circles
  const [setData, setSetData] = useState([
    {name: 'A', cx: 0.5 - 0.1*Math.sqrt(3), cy: 0.4, r: 0.25},
    {name: 'B', cx: 0.5 + 0.1*Math.sqrt(3), cy: 0.4, r: 0.25},
    {name: 'C', cx: 0.5, cy: 0.7, r: 0.25},
    {name: 'U', cx: 0.5, cy: 0.5, r: 0.5}
  ]);

  // One-time setup effect
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 550;
    const padding = 15;
    const size = Math.min(width * 0.9, height);
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
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
    
    // Create static elements that don't change
    createStaticElements(containerSet, size);
    
    // Initial render of dynamic elements
    updateDynamicElements();
  }, []); // Only run once
  
  // Create static elements (sections for highlighting)
  function createStaticElements(container, size) {
    // Create sections for highlighting
    container.append("rect")
      .attr("clip-path", "url(#U)")
      .attr("class", "section")
      .attr("id", "set8")
      .attr('width', size)
      .attr('height', size);

    container.append("rect")
      .attr("clip-path", "url(#A)")
      .attr("class", "section")
      .attr("id", "set1")
      .attr('width', size)
      .attr('height', size);

    container.append("rect")
      .attr("clip-path", "url(#B)")
      .attr("class", "section")
      .attr("id", "set2")
      .attr('width', size)
      .attr('height', size);

    container.append("rect")
      .attr("clip-path", "url(#C)")
      .attr("class", "section")
      .attr("id", "set3")
      .attr('width', size)
      .attr('height', size);

    container.append("g")
      .attr("clip-path", "url(#A)")
      .append("rect")
      .attr("clip-path", "url(#C)")
      .attr("class", "section")
      .attr("id", "set4")
      .attr('width', size)
      .attr('height', size);

    container.append("g")
      .attr("clip-path", "url(#A)")
      .append("rect")
      .attr("clip-path", "url(#B)")
      .attr("class", "section")
      .attr("id", "set5")
      .attr('width', size)
      .attr('height', size);

    container.append("g")
      .attr("clip-path", "url(#B)")
      .append("rect")
      .attr("clip-path", "url(#C)")
      .attr("class", "section")
      .attr("id", "set6")
      .attr('width', size)
      .attr('height', size);

    container.append("g")
      .attr("clip-path", "url(#A)")
      .append("g")
      .attr("clip-path", "url(#B)")
      .append("rect")
      .attr("clip-path", "url(#C)")
      .attr("class", "section")
      .attr("id", "set7")
      .attr('width', size)
      .attr('height', size);
  }
  
  // Update only dynamic elements (circles, labels, clip paths)
  function updateDynamicElements() {
    if (!d3Container.current || !scalesRef.current) return;
    
    const container = d3Container.current;
    const { xScale, yScale, rScale } = scalesRef.current;
    
    // Update clip paths
    const clipPaths = container.selectAll("clipPath")
      .data(setData, d => d.name);
    
    clipPaths.enter()
      .append("clipPath")
      .attr("id", d => d.name)
      .append("circle");
    
    clipPaths.select("circle")
      .attr('cx', d => xScale(d.cx))
      .attr('cy', d => yScale(d.cy))
      .attr('r', d => rScale(d.r));
    
    // Update circles using data join
    const circles = container.selectAll('circle.set-circle')
      .data(setData, d => d.name);
    
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
        return [colorScheme.chart.primary, colorScheme.chart.secondary, colorScheme.chart.tertiary][i];
      });
    
    // Update labels
    const labels = container.selectAll('text.set-label')
      .data(setData, d => d.name);
    
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
    
    // Update drag behavior if enabled
    if (dragEnabled) {
      setupDragBehavior();
    } else {
      container.selectAll('circle.set-circle').on('.drag', null);
    }
  }
  
  // Setup optimized drag behavior
  function setupDragBehavior() {
    if (!d3Container.current || !scalesRef.current) return;
    
    const container = d3Container.current;
    const { xScale, yScale, rScale } = scalesRef.current;
    
    const drag = d3.drag()
      .on('start', function(event, d) {
        d3.select(this).style('cursor', 'grabbing');
      })
      .on('drag', function(event, d) {
        if (d.name === 'U') return;
        
        const x = xScale.invert(event.x);
        const y = yScale.invert(event.y);
        const [cx, cy] = withinBounds(x, y, d.r);
        
        // Update D3 elements directly during drag
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
        
        // Only update React state on drag end
        const x = xScale.invert(event.x);
        const y = yScale.invert(event.y);
        const [cx, cy] = withinBounds(x, y, d.r);
        
        setSetData(prev => prev.map(s => 
          s.name === d.name ? { ...s, cx, cy } : s
        ));
      });
    
    container.selectAll('circle.set-circle')
      .filter(d => d.name !== 'U')
      .style('cursor', 'grab')
      .call(drag);
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
  
  // Update intersection highlighting
  function updateIntersectionHighlighting() {
    if (!d3Container.current) return;
    
    const container = d3Container.current;
    
    for (let i = 1; i <= 8; i++) {
      const section = container.select(`#set${i}`);
      if (section.node()) {
        const fill = currentSet.includes(i) ? colorScheme.chart.tertiary : 'transparent';
        section.transition()
          .duration(200)
          .style('fill', fill)
          .style('opacity', 0.3);
      }
    }
  }
  
  // Update dynamic elements when setData changes (only on dragend)
  useEffect(() => {
    updateDynamicElements();
  }, [setData, dragEnabled]);
  
  // Update highlighting when currentSet changes
  useEffect(() => {
    updateIntersectionHighlighting();
  }, [currentSet]);
  
  // Parse set notation functions (same as before)
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
  
  // Parse set notation (same as optimized version from earlier)
  function parseSetNotation(notation) {
    try {
      if (!notation || typeof notation !== 'string') {
        return [];
      }
      
      const sets = {
        'A': [1, 4, 5, 7],
        'B': [2, 5, 6, 7],
        'C': [3, 4, 6, 7],
        'U': [1, 2, 3, 4, 5, 6, 7, 8],
        '∅': []
      };
      
      let index = -1;
      
      function parse(expr) {
        index = -1;
        const iter = expr[Symbol.iterator]();
        const result = parseEvent(iter);
        return result.evaluate();
      }
    
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
      else if (char === 'U') {
        return new SetEvent('U', sets['U'], parseOperator(iter));
      }
      else if (char === '(') {
        const innerEvent = parseEvent(iter);
        const closeParen = iter.next();
        index++;
        if (closeParen.done || closeParen.value !== ')') {
          throw new Error(`Expected ')' but found ${closeParen.value || 'end of expression'}`);
        }
        return new ParenthesesEvent(innerEvent, parseOperator(iter));
      }
      else throw new Error(`Expected A, B, C, ∅, U, or '(' but found '${char}'`);
    }
    
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
        index--;
        return new IdentityOperator();
      }
      else throw new Error(`Expected ∪, ∩, ', or end of expression but found '${char}'`);
    }
    
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
        const cleanNotation = notation.replace(/\\s/g, '');
        if (!cleanNotation) return [];
        return parse(cleanNotation);
      } catch (e) {
        console.error('Parse error:', e);
        throw e;
      }
    } catch (e) {
      console.error('Parser setup error:', e);
      throw e;
    }
  }
  
  function handleSubmit() {
    if (!inputSet.trim()) {
      setErrorMessage('Please enter a set expression');
      return;
    }
    
    try {
      const result = parseSetNotation(inputSet);
      if (result === null || result === undefined) {
        setErrorMessage('Invalid set notation');
        return;
      }
      setCurrentSet(result);
      setSelectedSet(inputSet);
      setErrorMessage('');
      setOperationsCount(prev => prev + 1);
      setInputSet('');
    } catch (e) {
      setErrorMessage(`Invalid set notation: ${e.message}`);
    }
  }
  
  function handleReset() {
    setCurrentSet([]);
    setSelectedSet('');
    setInputSet('');
    setErrorMessage('');
    setOperationsCount(0);
  }
  
  function addNotation(notation) {
    setInputSet(prev => prev + notation);
  }

  return (
    <VisualizationContainer title="Sample Spaces and Set Operations (Optimized)" className="p-2">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel - Same as original */}
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
            
            <div className="bg-neutral-900 rounded p-3 mb-3 min-h-[50px] font-mono text-lg text-white">
              {inputSet || <span className="text-neutral-500">Enter set notation...</span>}
            </div>
            
            {errorMessage && (
              <div className="text-red-400 text-sm mb-3">{errorMessage}</div>
            )}
            
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
            
            <label className="flex items-center gap-2 text-sm mt-3">
              <input 
                type="checkbox" 
                checked={dragEnabled} 
                onChange={e => setDragEnabled(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-neutral-300">Enable smooth dragging</span>
            </label>
          </VisualizationSection>

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

export default SampleSpacesEventsOptimized;