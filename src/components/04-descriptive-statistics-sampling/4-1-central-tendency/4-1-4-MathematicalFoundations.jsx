"use client";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup,
  StatsDisplay
} from '@/components/ui/VisualizationContainer';
import { colors, typography, formatNumber, cn } from '@/lib/design-system';
import { WorkedExample, ExampleSection, Formula, InsightBox, CalculationSteps } from '../../ui/WorkedExample';
import { Button } from '@/components/ui/button';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { InteractiveJourneyNavigation } from '@/components/ui/InteractiveJourneyNavigation';
import BackToHub from '@/components/ui/BackToHub';
import { ChevronLeft, ChevronRight, Calculator, BarChart3, TrendingUp, Database } from 'lucide-react';
// import CentralTendencyJourney from './4-1-1-CentralTendencyJourney'; // Component archived

// Color scheme for statistics - matching introduction
const measureColors = {
  mean: '#3b82f6',      // Blue
  median: '#10b981',    // Green
  mode: '#f59e0b',      // Amber
  data: '#6b7280',      // Gray
  highlight: '#8b5cf6', // Purple
  grid: '#333',         // Grid lines
  background: '#0a0a0a' // Dark background
};

// Section definitions
const SECTIONS = [
  { id: 'foundations', title: 'Mathematical Foundations', icon: Calculator },
  { id: 'mean', title: 'Arithmetic Mean', icon: Calculator },
  { id: 'median', title: 'Median', icon: BarChart3 },
  { id: 'mode', title: 'Mode', icon: TrendingUp },
  { id: 'comparison', title: 'Comparative Analysis', icon: BarChart3 },
  { id: 'other-means', title: 'Other Means', icon: Calculator },
  { id: 'properties', title: 'Minimization Properties', icon: TrendingUp },
  { id: 'data-types', title: 'Data Type Appropriateness', icon: Database }
  // { id: 'physics-model', title: 'Physics Model (Optional)', icon: Calculator } // Removed - component archived
];

// LaTeX formula component with MathJax - removed, will use direct dangerouslySetInnerHTML

// Section 1: Mathematical Foundations
const FoundationsSection = React.memo(function FoundationsSection() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <div ref={contentRef}>
      {/* Opening Hook */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-lg mb-6">
        <p className="text-lg font-semibold text-white mb-2">🎯 Quick Scenario:</p>
        <p className="text-neutral-300">
          Your study group asks: "What was the typical exam score?" Three different students give three different answers - 
          and they're all correct! How is this possible?
        </p>
      </div>
      
      <WorkedExample title="What is Central Tendency?" variant="default">
        <ExampleSection title="Definition">
          <p className="mb-4 text-neutral-300 leading-relaxed">
            Central tendency is a single value that attempts to describe a dataset by identifying the central position within that dataset.
          </p>
          <Formula>
            <div className="text-center my-4">
              <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Central Tendency} = f(\\{x_1, x_2, ..., x_n\\})\\)` }} />
            </div>
          </Formula>
        </ExampleSection>
      
        <ExampleSection title="Why Multiple Measures?">
          <p className="mb-4 text-neutral-300">Different measures capture different aspects of "center":</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-900/20 border border-blue-600/30 p-3 rounded-lg">
              <div className="text-2xl mb-2 text-center">⚖️</div>
              <p className="text-sm font-semibold text-blue-400 text-center">Mean</p>
              <p className="text-xs text-neutral-300 text-center mt-1">The balance point</p>
              <p className="text-xs text-neutral-400 mt-2">Best for: Symmetric data</p>
            </div>
            <div className="bg-green-900/20 border border-green-600/30 p-3 rounded-lg">
              <div className="text-2xl mb-2 text-center">🚶</div>
              <p className="text-sm font-semibold text-green-400 text-center">Median</p>
              <p className="text-xs text-neutral-300 text-center mt-1">The middle value</p>
              <p className="text-xs text-neutral-400 mt-2">Best for: Skewed data</p>
            </div>
            <div className="bg-amber-900/20 border border-amber-600/30 p-3 rounded-lg">
              <div className="text-2xl mb-2 text-center">👑</div>
              <p className="text-sm font-semibold text-amber-400 text-center">Mode</p>
              <p className="text-xs text-neutral-300 text-center mt-1">Most frequent</p>
              <p className="text-xs text-neutral-400 mt-2">Best for: Categories</p>
            </div>
          </div>
          
          {/* Exam Alert */}
          <div className="mt-4 bg-red-900/20 border border-red-600/30 p-3 rounded-lg">
            <p className="text-xs font-semibold text-red-400">⚠️ Exam Alert:</p>
            <p className="text-xs text-neutral-300">
              Questions often ask you to choose the "most appropriate" measure. Remember: it depends on your data type and distribution!
            </p>
          </div>
        </ExampleSection>
        
        <InsightBox variant="info">
          Each measure has unique properties that make it suitable for different types of data and analysis goals.
        </InsightBox>
      </WorkedExample>
    </div>
  );
});

// Section 2: Arithmetic Mean
const MeanSection = React.memo(function MeanSection() {
  const [data, setData] = useState([3, 5, 7, 9, 11]);
  const [newValue, setNewValue] = useState(6);
  const contentRef = useRef(null);
  
  const mean = useMemo(() => 
    data.length > 0 ? data.reduce((a, b) => a + b, 0) / data.length : 0,
    [data]
  );
  
  // MathJax processing
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [data]);
  
  // D3 visualization for running mean
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width: w } = svgRef.current.getBoundingClientRect();
    const h = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = w - margin.left - margin.right;
    const innerHeight = h - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${w} ${h}`);
    
    // Background
    svg.append("rect")
      .attr("width", w)
      .attr("height", h)
      .attr("fill", measureColors.background);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, Math.max(20, ...data, newValue)])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleBand()
      .domain(['Data Points', 'Mean'])
      .range([0, innerHeight])
      .padding(0.3);
    
    // Grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", measureColors.grid);
    
    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-family", "monospace")
      .attr("fill", "#999");
    
    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-family", "monospace")
      .attr("fill", "#999");
    
    // Data points
    g.selectAll(".data-point")
      .data(data)
      .enter().append("circle")
      .attr("class", "data-point")
      .attr("cx", d => xScale(d))
      .attr("cy", yScale('Data Points') + yScale.bandwidth() / 2)
      .attr("r", 8)
      .attr("fill", measureColors.data)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
    
    // Mean line
    g.append("line")
      .attr("x1", xScale(mean))
      .attr("x2", xScale(mean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", measureColors.mean)
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5");
    
    // Mean point
    g.append("circle")
      .attr("cx", xScale(mean))
      .attr("cy", yScale('Mean') + yScale.bandwidth() / 2)
      .attr("r", 10)
      .attr("fill", measureColors.mean)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
    
    // Mean label
    g.append("text")
      .attr("x", xScale(mean))
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", measureColors.mean)
      .style("font-family", "monospace")
      .style("font-weight", "bold")
      .text(`μ = ${mean.toFixed(2)}`);
    
  }, [data, mean, newValue]);
  
  const addDataPoint = () => {
    if (newValue >= 0 && newValue <= 20) {
      setData([...data, newValue]);
    }
  };
  
  const clearData = () => {
    setData([]);
  };
  
  return (
    <div className="space-y-6" ref={contentRef}>
      <WorkedExample title="The Arithmetic Mean">
        <ExampleSection title="Population Mean (Continuous)">
          <Formula>
            <div className="text-center my-4">
              <span dangerouslySetInnerHTML={{ __html: `\\(\\mu = E[X] = \\int_{-\\infty}^{\\infty} x f(x) \\, dx\\)` }} />
            </div>
          </Formula>
        </ExampleSection>
        
        <ExampleSection title="Sample Mean">
          <Formula>
            <div className="text-center my-4">
              <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i\\)` }} />
            </div>
          </Formula>
        </ExampleSection>
        
        <ExampleSection title="Properties">
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Linear: <span dangerouslySetInnerHTML={{ __html: `\\(E[aX + b] = aE[X] + b\\)` }} /></li>
            <li>Minimum variance unbiased estimator (MVUE)</li>
            <li>Sensitive to outliers</li>
            <li>Balance point: <span dangerouslySetInnerHTML={{ __html: `\\(\\sum(x_i - \\bar{x}) = 0\\)` }} /></li>
          </ul>
        </ExampleSection>
      </WorkedExample>
      
      <VisualizationSection title="Interactive Mean Calculator" className="bg-neutral-900/50 rounded-lg p-4">
        <GraphContainer height="350px" className="bg-black/50 rounded-lg overflow-hidden">
          <svg ref={svgRef} className="w-full" />
        </GraphContainer>
        
        <ControlGroup>
          <div className="flex items-center gap-4">
            <RangeSlider
              label="New Value"
              value={newValue}
              onChange={setNewValue}
              min={0}
              max={20}
              step={0.1}
              className="flex-1"
            />
            <Button variant="primary" size="sm" onClick={addDataPoint}>
              Add Point
            </Button>
            <Button variant="secondary" size="sm" onClick={clearData}>
              Clear
            </Button>
          </div>
          <div className="mt-2 text-sm text-neutral-400">
            Current data: [{data.join(', ')}]
          </div>
        </ControlGroup>
      </VisualizationSection>
    </div>
  );
});

// Section 3: Median
const MedianSection = React.memo(function MedianSection() {
  const [data, setData] = useState([3, 1, 4, 1, 5, 9, 2, 6, 5]);
  const [animating, setAnimating] = useState(false);
  const contentRef = useRef(null);
  const sortedData = useMemo(() => [...data].sort((a, b) => a - b), [data]);
  
  const median = useMemo(() => {
    if (sortedData.length === 0) return 0;
    const mid = Math.floor(sortedData.length / 2);
    return sortedData.length % 2 === 0
      ? (sortedData[mid - 1] + sortedData[mid]) / 2
      : sortedData[mid];
  }, [sortedData]);
  
  // MathJax processing
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [data]);
  
  // D3 visualization for sorting animation
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width: w } = svgRef.current.getBoundingClientRect();
    const h = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = w - margin.left - margin.right;
    const innerHeight = h - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${w} ${h}`);
    
    // Background
    svg.append("rect")
      .attr("width", w)
      .attr("height", h)
      .attr("fill", measureColors.background);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleBand()
      .domain(d3.range(data.length))
      .range([0, innerWidth])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, 10])
      .range([innerHeight, 0]);
    
    // Draw bars
    const displayData = animating ? sortedData : data;
    const midIndex = Math.floor(displayData.length / 2);
    
    g.selectAll(".bar")
      .data(displayData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => xScale(i))
      .attr("y", d => yScale(d))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d))
      .attr("fill", (d, i) => {
        if (displayData.length % 2 === 1 && i === midIndex) {
          return measureColors.mean;
        } else if (displayData.length % 2 === 0 && (i === midIndex - 1 || i === midIndex)) {
          return measureColors.mean;
        }
        return measureColors.data;
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
    
    // Value labels
    g.selectAll(".value-label")
      .data(displayData)
      .enter().append("text")
      .attr("x", (d, i) => xScale(i) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-family", "monospace")
      .style("font-weight", "bold")
      .text(d => d);
    
    // Median line
    if (animating) {
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", yScale(median))
        .attr("y2", yScale(median))
        .attr("stroke", measureColors.mean)
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5");
      
      g.append("text")
        .attr("x", innerWidth + 5)
        .attr("y", yScale(median) + 5)
        .attr("fill", measureColors.mean)
        .style("font-family", "monospace")
        .style("font-weight", "bold")
        .text(`Median = ${median}`);
    }
    
  }, [data, sortedData, animating, median]);
  
  const animateSort = () => {
    setAnimating(!animating);
  };
  
  const addRandomData = () => {
    setData([...data, Math.floor(Math.random() * 10) + 1]);
  };
  
  return (
    <div className="space-y-6" ref={contentRef}>
      <WorkedExample title="The Median">
        <ExampleSection title="Formal Definition">
          <p className="mb-2">The median divides the probability distribution in half:</p>
          <Formula>
            <div className="text-center my-4">
              <span dangerouslySetInnerHTML={{ __html: `\\(P(X \\leq \\text{median}) = P(X \\geq \\text{median}) = 0.5\\)` }} />
            </div>
          </Formula>
        </ExampleSection>
        
        <ExampleSection title="Sample Median Algorithm">
          <ol className="list-decimal list-inside space-y-2 ml-6 text-neutral-300">
            <li>Sort the data: <span dangerouslySetInnerHTML={{ __html: `\\(x_{(1)} \\leq x_{(2)} \\leq ... \\leq x_{(n)}\\)` }} /></li>
            <li>If n is odd: <span dangerouslySetInnerHTML={{ __html: `\\(\\text{median} = x_{((n+1)/2)}\\)` }} /></li>
            <li>If n is even: <span dangerouslySetInnerHTML={{ __html: `\\(\\text{median} = \\frac{x_{(n/2)} + x_{(n/2+1)}}{2}\\)` }} /></li>
          </ol>
        </ExampleSection>
        
        <ExampleSection title="Properties">
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Robust to outliers (50% breakdown point)</li>
            <li>Minimizes: <span dangerouslySetInnerHTML={{ __html: `\\(\\sum_{i=1}^{n}|x_i - c|\\)` }} /></li>
            <li>Order statistic (depends only on ranking)</li>
          </ul>
        </ExampleSection>
      </WorkedExample>
      
      <VisualizationSection title="Interactive Median Finder" className="bg-neutral-900/50 rounded-lg p-4">
        <GraphContainer height="350px" className="bg-black/50 rounded-lg overflow-hidden">
          <svg ref={svgRef} className="w-full" />
        </GraphContainer>
        
        <ControlGroup>
          <div className="flex gap-4">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={animateSort}
            >
              {animating ? 'Show Original' : 'Sort & Find Median'}
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={addRandomData}
            >
              Add Random Value
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setData([3, 1, 4, 1, 5, 9, 2, 6, 5])}
            >
              Reset
            </Button>
          </div>
        </ControlGroup>
      </VisualizationSection>
    </div>
  );
});

// Section 4: Mode
const ModeSection = React.memo(function ModeSection() {
  const [data, setData] = useState([1, 2, 2, 3, 3, 3, 4, 4, 5]);
  const contentRef = useRef(null);
  
  const frequency = useMemo(() => {
    const freq = {};
    data.forEach(val => {
      freq[val] = (freq[val] || 0) + 1;
    });
    return freq;
  }, [data]);
  
  const modes = useMemo(() => {
    const maxFreq = Math.max(...Object.values(frequency));
    return Object.keys(frequency)
      .filter(key => frequency[key] === maxFreq)
      .map(Number);
  }, [frequency]);
  
  // MathJax processing
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [data]);
  
  // D3 visualization for frequency histogram
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width: w } = svgRef.current.getBoundingClientRect();
    const h = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = w - margin.left - margin.right;
    const innerHeight = h - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${w} ${h}`);
    
    // Background
    svg.append("rect")
      .attr("width", w)
      .attr("height", h)
      .attr("fill", measureColors.background);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Prepare frequency data
    const freqData = Object.entries(frequency).map(([value, count]) => ({
      value: Number(value),
      count
    })).sort((a, b) => a.value - b.value);
    
    // Scales
    const xScale = d3.scaleBand()
      .domain(freqData.map(d => d.value))
      .range([0, innerWidth])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(...Object.values(frequency))])
      .range([innerHeight, 0]);
    
    // Grid
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", measureColors.grid);
    
    // Bars
    g.selectAll(".bar")
      .data(freqData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.value))
      .attr("y", d => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d.count))
      .attr("fill", d => modes.includes(d.value) ? measureColors.mode : measureColors.data)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
    
    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-family", "monospace")
      .attr("fill", "#999");
    
    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-family", "monospace")
      .attr("fill", "#999");
    
    // Mode label
    if (modes.length > 0) {
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", measureColors.mode)
        .style("font-family", "monospace")
        .style("font-weight", "bold")
        .text(`Mode(s): ${modes.join(', ')}`);
    }
    
  }, [frequency, modes]);
  
  const addValue = (value) => {
    setData([...data, value]);
  };
  
  return (
    <div className="space-y-6" ref={contentRef}>
      <WorkedExample title="The Mode">
        <ExampleSection title="Discrete Data">
          <Formula>
            <div className="text-center my-4">
              <span dangerouslySetInnerHTML={{ __html: `\\(\\text{mode} = \\arg\\max_x P(X = x)\\)` }} />
            </div>
          </Formula>
          <p className="mt-3 text-sm text-neutral-400">The value(s) with highest frequency</p>
        </ExampleSection>
        
        <ExampleSection title="Continuous Data">
          <Formula>
            <div className="text-center my-4">
              <span dangerouslySetInnerHTML={{ __html: `\\(\\text{mode} = \\arg\\max_x f(x)\\)` }} />
            </div>
          </Formula>
          <p className="mt-3 text-sm text-neutral-400">The peak(s) of the probability density function</p>
        </ExampleSection>
        
        <ExampleSection title="Properties">
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Can be non-unique (multimodal distributions)</li>
            <li>Only measure for nominal data</li>
            <li>Not affected by extreme values</li>
            <li>May not exist if all values are unique</li>
          </ul>
        </ExampleSection>
      </WorkedExample>
      
      <VisualizationSection title="Interactive Frequency Histogram" className="bg-neutral-900/50 rounded-lg p-4">
        <GraphContainer height="350px" className="bg-black/50 rounded-lg overflow-hidden">
          <svg ref={svgRef} className="w-full" />
        </GraphContainer>
        
        <ControlGroup>
          <label className="text-sm text-neutral-400">Click to add values:</label>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map(val => (
              <Button
                key={val}
                variant="secondary"
                size="sm"
                onClick={() => addValue(val)}
              >
                Add {val}
              </Button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setData([1, 2, 2, 3, 3, 3, 4, 4, 5])}
            >
              Reset
            </Button>
          </div>
        </ControlGroup>
      </VisualizationSection>
    </div>
  );
});

// Section 5: Comparative Analysis
const ComparisonSection = React.memo(function ComparisonSection() {
  const [skewness, setSkewness] = useState(0); // -1 to 1
  const contentRef = useRef(null);
  
  // MathJax processing
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [skewness]);
  
  // Generate distribution based on skewness
  const generateData = useCallback((skew) => {
    const n = 1000;
    const data = [];
    
    for (let i = 0; i < n; i++) {
      let value;
      if (Math.abs(skew) < 0.1) {
        // Symmetric: normal distribution
        value = d3.randomNormal(50, 10)();
      } else if (skew > 0) {
        // Right-skewed: use exponential-like
        value = -Math.log(Math.random()) * 15 + 30;
      } else {
        // Left-skewed: mirror of right-skewed
        value = 70 - (-Math.log(Math.random()) * 15);
      }
      
      // Constrain to [0, 100]
      value = Math.max(0, Math.min(100, value));
      data.push(value);
    }
    
    return data;
  }, []);
  
  const data = useMemo(() => generateData(skewness), [skewness, generateData]);
  
  // Calculate statistics
  const stats = useMemo(() => {
    const sorted = [...data].sort((a, b) => a - b);
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    
    // For mode, create bins
    const binSize = 2;
    const bins = {};
    data.forEach(val => {
      const bin = Math.floor(val / binSize) * binSize;
      bins[bin] = (bins[bin] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(bins));
    const mode = Number(Object.keys(bins).find(key => bins[key] === maxCount)) + binSize / 2;
    
    return { mean, median, mode };
  }, [data]);
  
  // D3 visualization
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width: w } = svgRef.current.getBoundingClientRect();
    const h = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = w - margin.left - margin.right;
    const innerHeight = h - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${w} ${h}`);
    
    // Background
    svg.append("rect")
      .attr("width", w)
      .attr("height", h)
      .attr("fill", measureColors.background);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create histogram
    const bins = d3.histogram()
      .domain([0, 100])
      .thresholds(40)(data);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([innerHeight, 0]);
    
    // Draw histogram
    g.selectAll(".bar")
      .data(bins)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.x0))
      .attr("y", d => yScale(d.length))
      .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
      .attr("height", d => innerHeight - yScale(d.length))
      .attr("fill", measureColors.data)
      .attr("opacity", 0.7);
    
    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-family", "monospace")
      .attr("fill", "#999");
    
    // Measure lines
    const measures = [
      { value: stats.mean, color: measureColors.mean, label: 'Mean' },
      { value: stats.median, color: measureColors.median, label: 'Median' },
      { value: stats.mode, color: '#f59e0b', label: 'Mode' }
    ];
    
    measures.forEach((measure, i) => {
      g.append("line")
        .attr("x1", xScale(measure.value))
        .attr("x2", xScale(measure.value))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", measure.color)
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5");
      
      g.append("text")
        .attr("x", xScale(measure.value))
        .attr("y", -20 + i * 15)
        .attr("text-anchor", "middle")
        .attr("fill", measure.color)
        .style("font-family", "monospace")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(`${measure.label}: ${measure.value.toFixed(1)}`);
    });
    
  }, [data, stats]);
  
  return (
    <div className="space-y-6" ref={contentRef}>
      <WorkedExample title="When Measures Diverge">
        <ExampleSection title="Distribution Shapes">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-neutral-800 rounded-lg">
              <span className="w-32 text-neutral-400">Symmetric:</span>
              <span dangerouslySetInnerHTML={{ __html: `\\(\\text{mean} \\approx \\text{median} \\approx \\text{mode}\\)` }} />
            </div>
            <div className="flex items-center gap-4 p-3 bg-neutral-800 rounded-lg">
              <span className="w-32 text-neutral-400">Right-skewed:</span>
              <span dangerouslySetInnerHTML={{ __html: `\\(\\text{mode} < \\text{median} < \\text{mean}\\)` }} />
            </div>
            <div className="flex items-center gap-4 p-3 bg-neutral-800 rounded-lg">
              <span className="w-32 text-neutral-400">Left-skewed:</span>
              <span dangerouslySetInnerHTML={{ __html: `\\(\\text{mean} < \\text{median} < \\text{mode}\\)` }} />
            </div>
          </div>
        </ExampleSection>
        
        <InsightBox variant="info">
          The relationship between measures reveals the shape of your distribution. 
          In skewed distributions, the mean is "pulled" toward the tail.
        </InsightBox>
      </WorkedExample>
      
      <VisualizationSection title="Interactive Distribution Explorer" className="bg-neutral-900/50 rounded-lg p-4">
        <GraphContainer height="450px" className="bg-black/50 rounded-lg overflow-hidden">
          <svg ref={svgRef} className="w-full" />
        </GraphContainer>
        
        <ControlGroup>
          <RangeSlider
            label="Distribution Skewness"
            value={skewness}
            onChange={setSkewness}
            min={-1}
            max={1}
            step={0.1}
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>Left-skewed</span>
            <span>Symmetric</span>
            <span>Right-skewed</span>
          </div>
        </ControlGroup>
      </VisualizationSection>
    </div>
  );
});

// Section 6: Other Means
const OtherMeansSection = React.memo(function OtherMeansSection() {
  const [values, setValues] = useState([2, 4, 8, 16, 32]);
  const contentRef = useRef(null);
  
  const means = useMemo(() => {
    const n = values.length;
    
    // Arithmetic mean
    const arithmetic = values.reduce((a, b) => a + b, 0) / n;
    
    // Geometric mean
    const product = values.reduce((a, b) => a * b, 1);
    const geometric = Math.pow(product, 1/n);
    
    // Harmonic mean
    const reciprocalSum = values.reduce((sum, val) => sum + 1/val, 0);
    const harmonic = n / reciprocalSum;
    
    // Quadratic mean (RMS)
    const squareSum = values.reduce((sum, val) => sum + val*val, 0);
    const quadratic = Math.sqrt(squareSum / n);
    
    return { arithmetic, geometric, harmonic, quadratic };
  }, [values]);
  
  // MathJax processing
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <div ref={contentRef}>
      <WorkedExample title="Other Types of Means">
        <ExampleSection title="Geometric Mean">
          <p className="mb-2">For multiplicative processes (e.g., growth rates):</p>
          <Formula>
            <div className="text-center my-4">
              <span dangerouslySetInnerHTML={{ __html: `\\(GM = \\sqrt[n]{\\prod_{i=1}^{n} x_i} = (x_1 \\cdot x_2 \\cdot ... \\cdot x_n)^{1/n}\\)` }} />
            </div>
          </Formula>
        <p className="mt-2 text-sm">
          Example: Annual returns of 10%, 20%, -5% → GM = {((1.1 * 1.2 * 0.95) ** (1/3) - 1).toFixed(3)}
        </p>
      </ExampleSection>
      
        <ExampleSection title="Harmonic Mean">
          <p className="mb-2">For rates and ratios (e.g., average speed):</p>
          <Formula>
            <div className="text-center my-4">
              <span dangerouslySetInnerHTML={{ __html: `\\(HM = \\frac{n}{\\sum_{i=1}^{n} \\frac{1}{x_i}}\\)` }} />
            </div>
          </Formula>
          <p className="mt-2 text-sm">
            Example: Travel 60 mph one way, 40 mph return → Average speed = HM = {(2/(1/60 + 1/40)).toFixed(1)} mph
          </p>
        </ExampleSection>
        
        <ExampleSection title="Weighted Mean">
          <p className="mb-2">When observations have different importance:</p>
          <Formula>
            <div className="text-center my-4">
              <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x}_w = \\frac{\\sum_{i=1}^{n} w_i x_i}{\\sum_{i=1}^{n} w_i}\\)` }} />
            </div>
          </Formula>
          <p className="mt-2 text-sm">
            Example: Course grades with different credit weights
          </p>
        </ExampleSection>
        
        <ExampleSection title="Relationship Between Means">
          <p className="mb-2">For positive values:</p>
          <Formula>
            <div className="text-center my-4">
              <span dangerouslySetInnerHTML={{ __html: `\\(HM \\leq GM \\leq AM \\leq QM\\)` }} />
            </div>
          </Formula>
          <div className="mt-3 p-3 bg-neutral-900 rounded">
            <p className="text-sm font-mono">
              Current values: [{values.join(', ')}]
            </p>
            <div className="mt-2 space-y-1 text-sm">
              <div>Harmonic Mean: {means.harmonic.toFixed(3)}</div>
              <div>Geometric Mean: {means.geometric.toFixed(3)}</div>
              <div>Arithmetic Mean: {means.arithmetic.toFixed(3)}</div>
              <div>Quadratic Mean: {means.quadratic.toFixed(3)}</div>
            </div>
          </div>
        </ExampleSection>
      </WorkedExample>
    </div>
  );
});

// Section 7: Minimization Properties
const PropertiesSection = React.memo(function PropertiesSection() {
  const [data] = useState([2, 4, 5, 7, 9, 12]);
  const [c, setC] = useState(6);
  const contentRef = useRef(null);
  
  const calculations = useMemo(() => {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const sorted = [...data].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    // Calculate sum of squared deviations
    const sumSquared = data.reduce((sum, x) => sum + Math.pow(x - c, 2), 0);
    const sumSquaredFromMean = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0);
    
    // Calculate sum of absolute deviations
    const sumAbsolute = data.reduce((sum, x) => sum + Math.abs(x - c), 0);
    const sumAbsoluteFromMedian = data.reduce((sum, x) => sum + Math.abs(x - median), 0);
    
    return { mean, median, sumSquared, sumSquaredFromMean, sumAbsolute, sumAbsoluteFromMedian };
  }, [data, c]);
  
  // MathJax processing
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [c]);
  
  // D3 visualization
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width: w } = svgRef.current.getBoundingClientRect();
    const h = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = w - margin.left - margin.right;
    const innerHeight = h - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${w} ${h}`);
    
    // Background
    svg.append("rect")
      .attr("width", w)
      .attr("height", h)
      .attr("fill", measureColors.background);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 15])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(calculations.sumSquared, calculations.sumAbsolute) * 1.2])
      .range([innerHeight, 0]);
    
    // Grid
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", measureColors.grid);
    
    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-family", "monospace")
      .attr("fill", "#999");
    
    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-family", "monospace")
      .attr("fill", "#999");
    
    // Data points
    data.forEach(x => {
      g.append("circle")
        .attr("cx", xScale(x))
        .attr("cy", innerHeight + 20)
        .attr("r", 5)
        .attr("fill", measureColors.data);
    });
    
    // Current c value
    g.append("line")
      .attr("x1", xScale(c))
      .attr("x2", xScale(c))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
    
    // Mean line
    g.append("line")
      .attr("x1", xScale(calculations.mean))
      .attr("x2", xScale(calculations.mean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", measureColors.mean)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    // Median line
    g.append("line")
      .attr("x1", xScale(calculations.median))
      .attr("x2", xScale(calculations.median))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", measureColors.median)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    // Labels
    g.append("text")
      .attr("x", xScale(c))
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .style("font-family", "monospace")
      .style("font-weight", "bold")
      .text(`c = ${c.toFixed(1)}`);
    
  }, [data, c, calculations]);
  
  return (
    <div className="space-y-6" ref={contentRef}>
      <WorkedExample title="Minimization Properties">
        <ExampleSection title="Mean Minimizes Sum of Squared Deviations">
          <Formula>
            <div className="text-center my-4">
              <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x} = \\arg\\min_c \\sum_{i=1}^{n}(x_i - c)^2\\)` }} />
            </div>
          </Formula>
          <div className="mt-2 p-2 bg-neutral-900 rounded text-sm">
            <div>Current: Σ(xᵢ - {c})² = {calculations.sumSquared.toFixed(2)}</div>
            <div>Minimum: Σ(xᵢ - {calculations.mean.toFixed(2)})² = {calculations.sumSquaredFromMean.toFixed(2)}</div>
          </div>
        </ExampleSection>
        
        <ExampleSection title="Median Minimizes Sum of Absolute Deviations">
          <Formula>
            <div className="text-center my-4">
              <span dangerouslySetInnerHTML={{ __html: `\\(\\text{median} = \\arg\\min_c \\sum_{i=1}^{n}|x_i - c|\\)` }} />
            </div>
          </Formula>
          <div className="mt-2 p-2 bg-neutral-900 rounded text-sm">
            <div>Current: Σ|xᵢ - {c}| = {calculations.sumAbsolute.toFixed(2)}</div>
            <div>Minimum: Σ|xᵢ - {calculations.median}| = {calculations.sumAbsoluteFromMedian.toFixed(2)}</div>
          </div>
        </ExampleSection>
        
        <ExampleSection title="Mode Maximizes Likelihood">
          <p className="text-sm">
            For discrete data, the mode maximizes the likelihood function.
            It represents the most probable value under the empirical distribution.
          </p>
        </ExampleSection>
      </WorkedExample>
      
      <VisualizationSection title="Visual Proof" className="bg-neutral-900/50 rounded-lg p-4">
        <GraphContainer height="350px" className="bg-black/50 rounded-lg overflow-hidden">
          <svg ref={svgRef} className="w-full" />
        </GraphContainer>
        
        <ControlGroup>
          <RangeSlider
            label="Test value (c)"
            value={c}
            onChange={setC}
            min={0}
            max={15}
            step={0.1}
          />
          <div className="mt-2 text-xs text-neutral-500">
            Data points: [{data.join(', ')}] | 
            <span className="text-yellow-400"> Mean: {calculations.mean.toFixed(2)}</span> | 
            <span className="text-teal-400"> Median: {calculations.median}</span>
          </div>
        </ControlGroup>
      </VisualizationSection>
    </div>
  );
});

// Focused Learning Component
const FocusedContent = React.memo(function FocusedContent({ section }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [section]);
  
  const essentials = {
    'mean': {
      formula: `\\(\\bar{x} = \\frac{\\sum x_i}{n}\\)`,
      when: 'Symmetric data, no outliers',
      example: 'Test scores: 70, 75, 80, 85, 90 → Mean = 80',
      tip: 'Sensitive to outliers!'
    },
    'median': {
      formula: 'Middle value when sorted',
      when: 'Skewed data or outliers present',
      example: 'Income: 30k, 35k, 40k, 45k, 200k → Median = 40k',
      tip: 'Always SORT first!'
    },
    'mode': {
      formula: 'Most frequent value',
      when: 'Categorical data',
      example: 'Majors: Eng, Eng, Bus, Eng, Sci → Mode = Engineering',
      tip: 'Can have multiple modes!'
    }
  };
  
  return (
    <div ref={contentRef} className="space-y-4">
      <div className="bg-amber-900/20 p-4 rounded-lg">
        <h3 className="text-lg font-bold text-amber-400 mb-3">{section} - Key Concepts</h3>
        
        {Object.entries(essentials).map(([measure, info]) => (
          <div key={measure} className="bg-neutral-900 p-3 rounded mb-3">
            <h4 className="font-semibold text-white capitalize mb-2">{measure}</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-neutral-400">Formula:</p>
                <p className="text-neutral-300">
                  {info.formula.includes('\\(') ? 
                    <span dangerouslySetInnerHTML={{ __html: info.formula }} /> : 
                    info.formula
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">When to use:</p>
                <p className="text-neutral-300">{info.when}</p>
              </div>
            </div>
            <div className="mt-2 p-2 bg-neutral-800 rounded">
              <p className="text-xs text-neutral-400">Example:</p>
              <p className="text-xs text-neutral-300">{info.example}</p>
            </div>
            <p className="text-xs text-amber-400 mt-1">💡 {info.tip}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-red-900/20 border border-red-600/30 p-3 rounded">
        <p className="text-sm font-semibold text-red-400">🎯 Common Exam Pattern:</p>
        <p className="text-xs text-neutral-300">
          Mean {'>'} Median = Right-skewed (outliers on right)<br/>
          Mean {'<'} Median = Left-skewed (outliers on left)<br/>
          Mean = Median = Symmetric
        </p>
      </div>
    </div>
  );
});

// Section 8: Data Type Appropriateness
const DataTypesSection = React.memo(function DataTypesSection() {
  return (
    <WorkedExample title="Choosing the Right Measure">
      <ExampleSection title="Data Type Matrix">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-600">
                <th className="text-left p-2">Data Type</th>
                <th className="text-center p-2">Mode</th>
                <th className="text-center p-2">Median</th>
                <th className="text-center p-2">Mean</th>
                <th className="text-left p-2">Example</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              <tr className="border-b border-neutral-800">
                <td className="p-2 font-sans">Nominal</td>
                <td className="text-center p-2 text-green-400">✓</td>
                <td className="text-center p-2 text-red-400">✗</td>
                <td className="text-center p-2 text-red-400">✗</td>
                <td className="p-2 font-sans text-neutral-400">Eye color, gender</td>
              </tr>
              <tr className="border-b border-neutral-800">
                <td className="p-2 font-sans">Ordinal</td>
                <td className="text-center p-2 text-green-400">✓</td>
                <td className="text-center p-2 text-green-400">✓</td>
                <td className="text-center p-2 text-red-400">✗</td>
                <td className="p-2 font-sans text-neutral-400">Rankings, ratings</td>
              </tr>
              <tr className="border-b border-neutral-800">
                <td className="p-2 font-sans">Interval</td>
                <td className="text-center p-2 text-green-400">✓</td>
                <td className="text-center p-2 text-green-400">✓</td>
                <td className="text-center p-2 text-green-400">✓</td>
                <td className="p-2 font-sans text-neutral-400">Temperature (°C)</td>
              </tr>
              <tr>
                <td className="p-2 font-sans">Ratio</td>
                <td className="text-center p-2 text-green-400">✓</td>
                <td className="text-center p-2 text-green-400">✓</td>
                <td className="text-center p-2 text-green-400">✓</td>
                <td className="p-2 font-sans text-neutral-400">Height, income</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ExampleSection>
      
      <ExampleSection title="Decision Flowchart">
        <div className="space-y-3 ml-4">
          <div className="flex items-start gap-2">
            <span className="text-yellow-400">→</span>
            <div>
              <strong>Is your data categorical?</strong>
              <p className="text-sm text-neutral-400 ml-4">Yes → Use Mode only</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400">→</span>
            <div>
              <strong>Does your data have outliers?</strong>
              <p className="text-sm text-neutral-400 ml-4">Yes → Consider Median (robust)</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400">→</span>
            <div>
              <strong>Is your distribution skewed?</strong>
              <p className="text-sm text-neutral-400 ml-4">Yes → Median often more representative</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400">→</span>
            <div>
              <strong>Do you need mathematical properties?</strong>
              <p className="text-sm text-neutral-400 ml-4">Yes → Mean (for further calculations)</p>
            </div>
          </div>
        </div>
      </ExampleSection>
      
      <InsightBox variant="warning" icon="⚠️">
        Always report multiple measures when possible. A single number rarely tells the complete story about your data's center.
      </InsightBox>
    </WorkedExample>
  );
});

// Main component
function MathematicalFoundations({ onComplete }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  
  const renderSection = () => {
    switch (SECTIONS[currentSection].id) {
      case 'foundations':
        return <FoundationsSection />;
      case 'mean':
        return <MeanSection />;
      case 'median':
        return <MedianSection />;
      case 'mode':
        return <ModeSection />;
      case 'comparison':
        return <ComparisonSection />;
      case 'other-means':
        return <OtherMeansSection />;
      case 'properties':
        return <PropertiesSection />;
      case 'data-types':
        return <DataTypesSection />;
      // Physics model section removed - component archived
      // case 'physics-model':
      //   return (
      //     <div className="space-y-4">
      //       <InsightBox variant="info" icon="🔬">
      //         This optional section demonstrates the mean as a physical balance point using a seesaw model.
      //         It provides an intuitive understanding through physics analogies.
      //       </InsightBox>
      //       <CentralTendencyJourney />
      //     </div>
      //   );
      default:
        return null;
    }
  };
  
  return (
    <VisualizationContainer title="4.1 Central Tendency: Mathematical Foundations" className="max-w-7xl mx-auto">
      <div className="space-y-8">
        {/* Focused Learning Mode Toggle */}
        <div className="bg-neutral-900 border border-neutral-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Focused Learning Mode</p>
              <p className="text-xs text-neutral-400">Concentrate on essential concepts</p>
            </div>
            <Button
              variant={focusMode ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSpeedMode(!focusMode)}
            >
              {focusMode ? "Exit Focus Mode" : "Enable Focus"}
            </Button>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="bg-neutral-900 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">
                {SECTIONS[currentSection].title}
              </h3>
              <p className="text-sm text-neutral-400 mt-1">
                Section {currentSection + 1} of {SECTIONS.length}
                {focusMode && <span className="text-blue-400 ml-2">Focus Mode</span>}
              </p>
            </div>
          </div>
          
        </div>
        
        {/* Content */}
        <div className="min-h-[600px] bg-neutral-950 rounded-lg p-6">
          {focusMode ? (
            <FocusedContent section={SECTIONS[currentSection].id} />
          ) : (
            renderSection()
          )}
        </div>
        
        {/* Summary Stats */}
        <div className="mt-8">
          <StatsDisplay
            stats={[
              { label: "Total Sections", value: SECTIONS.length },
              { label: "Current Section", value: currentSection + 1, highlight: true },
              { label: "Progress", value: `${Math.round((currentSection + 1) / SECTIONS.length * 100)}%` }
            ]}
          />
        </div>
        
        {/* Navigation at the Bottom */}
        <InteractiveJourneyNavigation
          currentSection={currentSection}
          totalSections={SECTIONS.length}
          onNavigate={setCurrentSection}
          onComplete={() => {
            if (!hasCompleted) {
              setHasCompleted(true);
              if (onComplete) {
                onComplete();
              }
            }
          }}
          sectionTitles={SECTIONS.map(s => s.title)}
          showProgress={true}
          progressVariant="purple"
          isCompleted={hasCompleted}
          allowKeyboardNav={true}
          className="mt-8"
        />
      </div>
      
      {/* Back to Hub Button */}
      <BackToHub chapter={4} bottom />
    </VisualizationContainer>
  );
}

export default MathematicalFoundations;