"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  GraphContainer, 
  VisualizationSection,
  ControlGroup
} from "@/components/ui/VisualizationContainer";
import { createColorScheme, cn, typography, colors, formatNumber } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ArrowRight, CheckCircle, TrendingUp, TrendingDown, Activity } from "lucide-react";

const colorScheme = createColorScheme('sampling');

// Shape pattern card component
const ShapeCard = ({ shape, isActive, isCompleted, onClick }) => {
  const icons = {
    normal: Activity,
    skewedRight: TrendingUp,
    skewedLeft: TrendingDown,
    bimodal: Activity,
    uniform: Activity
  };
  
  const Icon = icons[shape.id];
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-lg border-2 transition-all duration-300",
        "hover:transform hover:scale-105",
        isActive ? "border-cyan-500 bg-cyan-900/30" : "border-gray-700 bg-gray-800/50",
        isCompleted && "ring-2 ring-green-500 ring-offset-2 ring-offset-gray-900"
      )}
    >
      {isCompleted && (
        <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-green-400" />
      )}
      
      <div className="flex items-center gap-3 mb-2">
        <Icon className={cn("w-6 h-6", isActive ? "text-cyan-400" : "text-gray-400")} />
        <h4 className={cn("font-semibold", isActive ? "text-white" : "text-gray-300")}>
          {shape.name}
        </h4>
      </div>
      
      <p className="text-sm text-gray-400 text-left">{shape.description}</p>
      
      {/* Mini preview */}
      <div className="mt-3 h-16 bg-gray-900/50 rounded flex items-end justify-center gap-1 p-2">
        {shape.preview.map((height, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-t transition-all duration-300",
              isActive ? "bg-cyan-500" : "bg-gray-600"
            )}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </button>
  );
};

const HistogramShapeAnalysis = () => {
  // Shape patterns to explore
  const shapePatterns = [
    {
      id: 'normal',
      name: 'Normal (Bell Curve)',
      description: 'Symmetric, peak in center',
      realWorld: 'Heights, test scores, measurement errors',
      preview: [20, 40, 70, 90, 70, 40, 20],
      generate: () => {
        const data = [];
        for (let i = 0; i < 300; i++) {
          data.push(jStat.normal.sample(0, 1));
        }
        return data;
      },
      insights: [
        'Most common pattern in nature',
        'Mean = Median = Mode',
        'About 68% of data within 1 standard deviation',
        'Results from many small random factors'
      ]
    },
    {
      id: 'skewedRight',
      name: 'Right-Skewed',
      description: 'Long tail to the right',
      realWorld: 'Income, house prices, city populations',
      preview: [80, 60, 40, 25, 15, 10, 5],
      generate: () => {
        const data = [];
        for (let i = 0; i < 300; i++) {
          data.push(Math.abs(jStat.normal.sample(0, 1)) * 2);
        }
        return data;
      },
      insights: [
        'Also called "positively skewed"',
        'Mean > Median > Mode',
        'Few extremely high values pull mean up',
        'Common in economic data'
      ]
    },
    {
      id: 'skewedLeft',
      name: 'Left-Skewed',
      description: 'Long tail to the left',
      realWorld: 'Age at retirement, exam scores (easy test)',
      preview: [5, 10, 15, 25, 40, 60, 80],
      generate: () => {
        const data = [];
        for (let i = 0; i < 300; i++) {
          data.push(5 - Math.abs(jStat.normal.sample(0, 1)) * 2);
        }
        return data;
      },
      insights: [
        'Also called "negatively skewed"',
        'Mean < Median < Mode',
        'Few extremely low values pull mean down',
        'Often seen in age-related data'
      ]
    },
    {
      id: 'bimodal',
      name: 'Bimodal',
      description: 'Two distinct peaks',
      realWorld: 'Combined groups (male/female heights), peak hours',
      preview: [40, 70, 40, 20, 40, 70, 40],
      generate: () => {
        const data = [];
        for (let i = 0; i < 300; i++) {
          if (Math.random() < 0.5) {
            data.push(jStat.normal.sample(-2, 0.7));
          } else {
            data.push(jStat.normal.sample(2, 0.7));
          }
        }
        return data;
      },
      insights: [
        'Suggests two different groups in data',
        'May need separate analysis for each peak',
        'Common when mixing populations',
        'Check if data should be separated'
      ]
    },
    {
      id: 'uniform',
      name: 'Uniform',
      description: 'All values equally likely',
      realWorld: 'Random number generators, birth dates in a year',
      preview: [50, 50, 50, 50, 50, 50, 50],
      generate: () => {
        const data = [];
        for (let i = 0; i < 300; i++) {
          data.push(Math.random() * 6 - 3);
        }
        return data;
      },
      insights: [
        'No preferred value',
        'All outcomes equally probable',
        'Often artificial or constrained',
        'Mean = Median = Center of range'
      ]
    }
  ];
  
  // State management
  const [activeShape, setActiveShape] = useState(shapePatterns[0]);
  const [data, setData] = useState([]);
  const [completedShapes, setCompletedShapes] = useState(new Set());
  const [showInsights, setShowInsights] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState(null);
  
  const svgRef = useRef(null);
  
  // Generate data for active shape
  useEffect(() => {
    const newData = activeShape.generate();
    setData(newData);
    setShowInsights(false);
  }, [activeShape]);
  
  // Draw histogram
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 400;
    const margin = { top: 40, right: 40, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    
    // Clear previous
    svg.selectAll("*").remove();
    
    // Add background for visibility
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("stroke", "#374151")
      .attr("stroke-width", 1);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xExtent = d3.extent(data);
    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - 0.5, xExtent[1] + 0.5])
      .range([0, innerWidth]);
    
    // Use optimal bin count
    const binCount = Math.ceil(Math.sqrt(data.length));
    const histogram = d3.histogram()
      .domain(xScale.domain())
      .thresholds(xScale.ticks(binCount));
    
    const bins = histogram(data);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([innerHeight, 0]);
    
    // Create gradient based on shape type
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", `gradient-${activeShape.id}`)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", innerHeight)
      .attr("x2", 0).attr("y2", 0);
    
    const gradientColors = {
      normal: [colorScheme.chart.primary, colorScheme.chart.secondary],
      skewedRight: ['#f59e0b', '#dc2626'],
      skewedLeft: ['#3b82f6', '#8b5cf6'],
      bimodal: ['#10b981', '#06b6d4'],
      uniform: ['#6366f1', '#ec4899']
    };
    
    const [startColor, endColor] = gradientColors[activeShape.id] || gradientColors.normal;
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", startColor)
      .attr("stop-opacity", 0.8);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", endColor)
      .attr("stop-opacity", 0.9);
    
    // Draw bars
    const bars = g.selectAll(".bar")
      .data(bins)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.x0))
      .attr("y", innerHeight)
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr("height", 0)
      .attr("fill", `url(#gradient-${activeShape.id})`)
      .attr("rx", 2);
    
    // Animate bars
    bars.transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr("y", d => yScale(d.length))
      .attr("height", d => innerHeight - yScale(d.length));
    
    // Add curve overlay for shape visualization
    if (showInsights) {
      const curve = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveNatural);
      
      // Generate smooth curve points
      const curveData = [];
      const step = (xExtent[1] - xExtent[0]) / 100;
      for (let x = xExtent[0]; x <= xExtent[1]; x += step) {
        const count = bins.reduce((sum, bin) => {
          if (x >= bin.x0 && x < bin.x1) {
            return sum + bin.length;
          }
          return sum;
        }, 0);
        curveData.push({ x, y: count });
      }
      
      g.append("path")
        .datum(curveData)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.accent)
        .attr("stroke-width", 3)
        .attr("opacity", 0)
        .attr("d", curve)
        .transition()
        .delay(800)
        .duration(500)
        .attr("opacity", 0.7);
    }
    
    // Axes
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(6));
    
    xAxis.selectAll("path, line").attr("stroke", "#6b7280");
    xAxis.selectAll("text")
      .attr("fill", "#d1d5db")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");
    
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(5));
    
    yAxis.selectAll("path, line").attr("stroke", "#6b7280");
    yAxis.selectAll("text").attr("fill", "#d1d5db");
    
    // Labels
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 65})`)
      .style("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .text("Value");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (innerHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .text("Frequency");
    
    // Title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("class", "text-lg font-semibold")
      .attr("fill", "#ffffff")
      .text(activeShape.name);
    
  }, [data, activeShape, showInsights]);
  
  // Handle shape completion
  const markShapeComplete = () => {
    setCompletedShapes(prev => new Set([...prev, activeShape.id]));
    setShowInsights(true);
  };
  
  // Quiz functionality
  const startQuiz = () => {
    const randomShape = shapePatterns[Math.floor(Math.random() * shapePatterns.length)];
    const quizDataSet = randomShape.generate();
    setQuizData({ shape: randomShape, data: quizDataSet });
    setData(quizDataSet);
    setQuizMode(true);
    setQuizAnswer(null);
  };
  
  const checkQuizAnswer = (shapeId) => {
    const isCorrect = shapeId === quizData.shape.id;
    setQuizAnswer({ shapeId, isCorrect });
    if (isCorrect) {
      setTimeout(() => {
        setQuizMode(false);
        setQuizAnswer(null);
        setActiveShape(shapePatterns[0]);
      }, 2000);
    }
  };
  
  const progress = (completedShapes.size / shapePatterns.length) * 100;
  
  return (
    <VisualizationContainer
      title="4.2 Histogram Shape Analysis"
      description="Learn to identify different distribution patterns and what they tell us about data"
    >
      {/* Progress tracking */}
      <div className="mb-6">
        <ProgressBar 
          progress={progress} 
          label={`${completedShapes.size} of ${shapePatterns.length} shapes mastered`}
        />
      </div>
      
      {!quizMode ? (
        <>
          {/* Shape selector */}
          <VisualizationSection title="Choose a Distribution Shape">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {shapePatterns.map(shape => (
                <ShapeCard
                  key={shape.id}
                  shape={shape}
                  isActive={activeShape.id === shape.id}
                  isCompleted={completedShapes.has(shape.id)}
                  onClick={() => setActiveShape(shape)}
                />
              ))}
            </div>
          </VisualizationSection>
          
          {/* Main visualization */}
          <GraphContainer height="400px" className="overflow-hidden">
            <svg 
              ref={svgRef} 
              className="w-full h-full" 
              style={{ 
                background: 'transparent',
                minHeight: '400px',
                display: 'block'
              }} 
            />
          </GraphContainer>
          
          {/* Real-world examples */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg">
            <h4 className="font-semibold text-purple-400 mb-2">Real-World Examples</h4>
            <p className="text-gray-300">{activeShape.realWorld}</p>
          </div>
          
          {/* Action buttons */}
          <div className="mt-6 flex gap-3 justify-center">
            <Button
              onClick={markShapeComplete}
              disabled={completedShapes.has(activeShape.id)}
            >
              {completedShapes.has(activeShape.id) ? 'Shape Mastered!' : 'I Understand This Shape'}
            </Button>
            
            <Button
              onClick={() => setShowInsights(!showInsights)}
              variant="outline"
            >
              {showInsights ? 'Hide' : 'Show'} Key Insights
            </Button>
            
            {completedShapes.size >= 3 && (
              <Button
                onClick={startQuiz}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Test Your Knowledge!
              </Button>
            )}
          </div>
          
          {/* Insights panel */}
          {showInsights && (
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-semibold text-cyan-400 mb-3">
                Key Insights: {activeShape.name}
              </h4>
              <ul className="space-y-2">
                {activeShape.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        /* Quiz mode */
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Quiz: Identify the Distribution Shape!
            </h3>
            <p className="text-gray-300">
              Look at the histogram below and identify which type of distribution it shows.
            </p>
          </div>
          
          <GraphContainer height="400px" className="overflow-hidden">
            <svg 
              ref={svgRef} 
              className="w-full h-full" 
              style={{ 
                background: 'transparent',
                minHeight: '400px',
                display: 'block'
              }} 
            />
          </GraphContainer>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {shapePatterns.map(shape => (
              <button
                key={shape.id}
                onClick={() => checkQuizAnswer(shape.id)}
                disabled={quizAnswer !== null}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-300",
                  "hover:transform hover:scale-105",
                  quizAnswer?.shapeId === shape.id && quizAnswer.isCorrect && 
                    "border-green-500 bg-green-900/30",
                  quizAnswer?.shapeId === shape.id && !quizAnswer.isCorrect && 
                    "border-red-500 bg-red-900/30",
                  !quizAnswer && "border-gray-700 bg-gray-800/50 hover:border-cyan-500"
                )}
              >
                <h4 className="font-semibold text-white">{shape.name}</h4>
              </button>
            ))}
          </div>
          
          {quizAnswer && (
            <div className={cn(
              "p-4 rounded-lg text-center",
              quizAnswer.isCorrect ? "bg-green-900/30" : "bg-red-900/30"
            )}>
              <p className={cn(
                "text-lg font-semibold",
                quizAnswer.isCorrect ? "text-green-400" : "text-red-400"
              )}>
                {quizAnswer.isCorrect ? '✅ Correct!' : '❌ Not quite...'}
              </p>
              {!quizAnswer.isCorrect && (
                <p className="text-gray-300 mt-2">
                  Try again! Look at where the peak is and how the tails behave.
                </p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Completion celebration */}
      {completedShapes.size === shapePatterns.length && !quizMode && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg border border-green-600/30 text-center">
          <h3 className="text-xl font-bold text-green-400 mb-2">
            Complete!
          </h3>
          <p className="text-gray-300 mb-4">
            You've learned all histogram shapes! You can now identify distribution patterns 
            and understand what they reveal about data.
          </p>
          <Button
            onClick={startQuiz}
            className="bg-gradient-to-r from-green-600 to-emerald-600"
          >
            Take the Final Challenge!
          </Button>
        </div>
      )}
    </VisualizationContainer>
  );
};

export default HistogramShapeAnalysis;