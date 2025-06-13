"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer
} from '../ui/VisualizationContainer';
import { Button } from '../ui/button';
import { cn } from '../../lib/design-system';

export function SizingPatterns() {
  const svgRef1 = useRef(null);
  const svgRef2 = useRef(null);
  const svgRef3 = useRef(null);
  const [boxSize, setBoxSize] = useState('w-64');
  const [containerHeight, setContainerHeight] = useState('400px');
  
  // Pattern 1: Fixed ViewBox with getBoundingClientRect
  useEffect(() => {
    if (!svgRef1.current) return;
    
    const svg = d3.select(svgRef1.current);
    const { width } = svgRef1.current.getBoundingClientRect();
    const height = 300;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#1e293b")
      .attr("stroke", "#60a5fa")
      .attr("stroke-width", 2);
      
    svg.append("text")
      .attr("x", width/2)
      .attr("y", height/2)
      .attr("text-anchor", "middle")
      .attr("fill", "#60a5fa")
      .style("font-size", "16px")
      .text(`ViewBox: ${width} x ${height}`);
      
  }, []);
  
  // Pattern 2: Responsive with window resize
  useEffect(() => {
    if (!svgRef2.current) return;
    
    const drawChart = () => {
      const svg = d3.select(svgRef2.current);
      const { width } = svgRef2.current.getBoundingClientRect();
      const height = 300;
      const margin = { top: 20, right: 20, bottom: 40, left: 40 };
      
      svg.selectAll("*").remove();
      svg.attr("viewBox", `0 0 ${width} ${height}`);
      
      // Background
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#0f172a");
      
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      // Create a simple bar chart
      const data = [
        { label: 'A', value: 30 },
        { label: 'B', value: 50 },
        { label: 'C', value: 80 },
        { label: 'D', value: 40 }
      ];
      
      const xScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, innerWidth])
        .padding(0.3);
        
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([innerHeight, 0]);
      
      // Bars
      g.selectAll('.bar')
        .data(data)
        .join('rect')
        .attr('x', d => xScale(d.label))
        .attr('y', d => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .attr('height', d => innerHeight - yScale(d.value))
        .attr('fill', '#60a5fa')
        .attr('rx', 4);
        
      // Info text
      svg.append("text")
        .attr("x", width/2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("fill", "#94a3b8")
        .style("font-size", "14px")
        .text(`Responsive: ${width}px wide (resize window!)`);
    };
    
    drawChart();
    window.addEventListener('resize', drawChart);
    return () => window.removeEventListener('resize', drawChart);
  }, []);
  
  // Pattern 3: D3 without viewBox (direct pixel sizing)
  useEffect(() => {
    if (!svgRef3.current) return;
    
    const svg = d3.select(svgRef3.current);
    const width = 600;
    const height = parseInt(containerHeight);
    
    svg.selectAll("*").remove();
    
    // No viewBox - direct pixel sizing
    svg.style("width", `${width}px`)
       .style("height", `${height}px`);
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#1e1e2e")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 3);
      
    // Draw grid pattern
    const gridSize = 50;
    for (let x = 0; x <= width; x += gridSize) {
      svg.append("line")
        .attr("x1", x)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", height)
        .attr("stroke", "#374151")
        .attr("stroke-width", 1);
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", y)
        .attr("x2", width)
        .attr("y2", y)
        .attr("stroke", "#374151")
        .attr("stroke-width", 1);
    }
    
    svg.append("text")
      .attr("x", width/2)
      .attr("y", height/2)
      .attr("text-anchor", "middle")
      .attr("fill", "#10b981")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text(`Direct: ${width} x ${height}px`);
      
  }, [containerHeight]);
  
  return (
    <VisualizationContainer title="SVG Sizing Patterns in Your App">
      <div className="space-y-8">
        
        {/* Pattern 1: ViewBox with getBoundingClientRect */}
        <VisualizationSection title="Pattern 1: ViewBox + getBoundingClientRect">
          <div className="space-y-4">
            <div className="text-sm text-neutral-300">
              <p className="mb-2">Most common pattern in your app. The SVG adapts to container width:</p>
              <pre className="bg-neutral-800 p-3 rounded text-xs overflow-x-auto">
{`const svg = d3.select(svgRef.current);
const { width } = svgRef.current.getBoundingClientRect();
const height = 300; // Fixed height
svg.attr("viewBox", \`0 0 \${width} \${height}\`);`}
              </pre>
            </div>
            <GraphContainer height="300px">
              <svg ref={svgRef1} className="w-full h-full" />
            </GraphContainer>
          </div>
        </VisualizationSection>
        
        {/* Pattern 2: Responsive with Resize */}
        <VisualizationSection title="Pattern 2: Responsive Chart">
          <div className="space-y-4">
            <div className="text-sm text-neutral-300">
              <p className="mb-2">Redraws on window resize. Used in complex visualizations:</p>
              <pre className="bg-neutral-800 p-3 rounded text-xs overflow-x-auto">
{`// In useEffect:
window.addEventListener('resize', drawChart);
// Chart redraws with new dimensions`}
              </pre>
            </div>
            <GraphContainer height="300px">
              <svg ref={svgRef2} className="w-full h-full" />
            </GraphContainer>
          </div>
        </VisualizationSection>
        
        {/* Pattern 3: Direct Pixel Sizing */}
        <VisualizationSection title="Pattern 3: Direct Pixel Control">
          <div className="space-y-4">
            <div className="text-sm text-neutral-300">
              <p className="mb-2">No viewBox - direct pixel sizing. Less common but gives precise control:</p>
              <pre className="bg-neutral-800 p-3 rounded text-xs overflow-x-auto">
{`svg.style("width", \`\${width}px\`)
   .style("height", \`\${height}px\`);
// No viewBox attribute`}
              </pre>
            </div>
            
            <div className="flex gap-4 mb-4">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setContainerHeight('200px')}
                className={containerHeight === '200px' ? 'ring-2 ring-teal-400' : ''}
              >
                Small (200px)
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setContainerHeight('400px')}
                className={containerHeight === '400px' ? 'ring-2 ring-teal-400' : ''}
              >
                Medium (400px)
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setContainerHeight('600px')}
                className={containerHeight === '600px' ? 'ring-2 ring-teal-400' : ''}
              >
                Large (600px)
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <svg ref={svgRef3} />
            </div>
          </div>
        </VisualizationSection>
        
        {/* Tailwind Box Sizing */}
        <VisualizationSection title="Tailwind Container Sizing">
          <div className="space-y-4">
            <div className="text-sm text-neutral-300 mb-4">
              <p>Click buttons to see how Tailwind classes affect container sizes:</p>
            </div>
            
            <div className="flex gap-2 flex-wrap mb-4">
              <Button
                variant="info"
                size="sm"
                onClick={() => setBoxSize('w-32')}
              >
                w-32 (8rem)
              </Button>
              <Button
                variant="info"
                size="sm"
                onClick={() => setBoxSize('w-64')}
              >
                w-64 (16rem)
              </Button>
              <Button
                variant="info"
                size="sm"
                onClick={() => setBoxSize('w-96')}
              >
                w-96 (24rem)
              </Button>
              <Button
                variant="info"
                size="sm"
                onClick={() => setBoxSize('w-full')}
              >
                w-full (100%)
              </Button>
              <Button
                variant="info"
                size="sm"
                onClick={() => setBoxSize('w-1/2')}
              >
                w-1/2 (50%)
              </Button>
            </div>
            
            <div className="flex justify-center">
              <div className={cn(
                boxSize,
                "h-32 bg-blue-600/20 border-2 border-blue-400 rounded-lg flex items-center justify-center transition-all duration-300"
              )}>
                <span className="text-blue-300 font-mono text-sm">{boxSize}</span>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-neutral-800 rounded">
              <h4 className="text-sm font-semibold text-neutral-200 mb-2">Common Patterns in Your App:</h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li>• <code className="text-blue-400">GraphContainer height="400px"</code> - Sets container height</li>
                <li>• <code className="text-green-400">lg:w-2/3</code> - 66% width on large screens</li>
                <li>• <code className="text-purple-400">flex flex-col lg:flex-row</code> - Responsive layout</li>
                <li>• <code className="text-yellow-400">p-4 space-y-4</code> - Padding and vertical spacing</li>
              </ul>
            </div>
          </div>
        </VisualizationSection>
        
        {/* Key Insights */}
        <VisualizationSection className="bg-purple-900/20 border border-purple-600/30 p-4 rounded">
          <h3 className="text-lg font-bold text-purple-300 mb-3">🎯 Key Insights</h3>
          <div className="space-y-2 text-sm text-neutral-300">
            <p><strong>1. Most charts use Pattern 1:</strong> ViewBox with container width</p>
            <p><strong>2. Height is usually fixed:</strong> 400px, 300px, or passed as prop</p>
            <p><strong>3. Margins are consistent:</strong> top: 40, right: 30, bottom: 40, left: 40</p>
            <p><strong>4. Tailwind controls containers:</strong> SVG fills the Tailwind-sized container</p>
            <p><strong>5. GraphContainer component:</strong> Wraps SVGs with consistent styling</p>
          </div>
        </VisualizationSection>
        
      </div>
    </VisualizationContainer>
  );
}