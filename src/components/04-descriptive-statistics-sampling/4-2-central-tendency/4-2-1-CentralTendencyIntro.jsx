"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '@/components/ui/VisualizationContainer';
import { colors, typography, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { InteractiveJourneyNavigation } from '@/components/ui/InteractiveJourneyNavigation';
import BackToHub from '@/components/ui/BackToHub';
import { Calculator, Target, BarChart3, TrendingUp, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { QuizBreak } from '@/components/mdx/QuizBreak';

// Color scheme for central tendency
const measureColors = {
  mean: '#3b82f6',      // Blue
  median: '#10b981',    // Green
  mode: '#f59e0b',      // Amber
  data: '#6b7280',      // Gray
  highlight: '#8b5cf6', // Purple
};

// Practice Problems Component with Multiple Choice
const PracticeProblems = React.memo(function PracticeProblems({ mathRef }) {
  const [quizCompleted, setQuizCompleted] = useState({});
  
  const problems = [
    {
      question: 'A quality control engineer measures 6 components: 12.1, 11.9, 12.3, 12.0, 12.2, 13.5 mm. What is the mean?',
      options: ['12.00 mm', '12.15 mm', '12.33 mm', '12.50 mm'],
      correctIndex: 2,
      explanation: 'Mean = (12.1 + 11.9 + 12.3 + 12.0 + 12.2 + 13.5) / 6 = 74.0 / 6 = 12.33 mm'
    },
    {
      question: 'For the same data (sorted: 11.9, 12.0, 12.1, 12.2, 12.3, 13.5), what is the median?',
      options: ['12.0 mm', '12.1 mm', '12.15 mm', '12.2 mm'],
      correctIndex: 2,
      explanation: 'With 6 values (even count), median = (12.1 + 12.2) / 2 = 12.15 mm (average of the two middle values)'
    },
    {
      question: 'House prices: 250k, 280k, 300k, 320k, 350k, 850k. Which measure best represents a typical house price?',
      options: ['Mean (391.67k)', 'Median (310k)', 'Mode', 'Range'],
      correctIndex: 1,
      explanation: 'The median (310k) is best because the 850k outlier pulls the mean (391.67k) much higher than most houses.'
    },
    {
      question: 'Exam scores have mean = 68, median = 72, mode = 78. What is the shape of the distribution?',
      options: ['Symmetric', 'Right-skewed (positive skew)', 'Left-skewed (negative skew)', 'Uniform'],
      correctIndex: 2,
      explanation: 'When mean < median < mode, the distribution is left-skewed. The tail extends to the left (lower scores).'
    }
  ];
  
  return (
    <div className="space-y-6" ref={mathRef}>
      <div className="bg-neutral-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Practice Problems</h3>
          <div className="text-sm text-neutral-400">
            Test your understanding
          </div>
        </div>
        
        <QuizBreak
          questions={problems}
          onComplete={() => setQuizCompleted({ practice: true })}
        />
        
        {quizCompleted.practice && (
          <div className="mt-6 p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
            <p className="text-sm text-green-400">
              Well done! You've learned the concepts of central tendency.
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-amber-900/20 border border-amber-600/30 p-4 rounded-lg">
        <p className="text-sm font-semibold text-amber-400 mb-2">Study Tips:</p>
        <ul className="text-sm text-neutral-300 space-y-1">
          <li>• Always sort data before finding the median</li>
          <li>• Check for outliers - they affect the mean most</li>
          <li>• Remember: mean is pulled toward the tail in skewed distributions</li>
          <li>• For categorical data, only mode makes sense</li>
        </ul>
      </div>
    </div>
  );
});

// Learning sections
const SECTIONS = [
  {
    id: 'introduction',
    title: 'What is Central Tendency?',
    icon: Target,
    description: 'Understanding the concept of a "typical" value'
  },
  {
    id: 'mean',
    title: 'Arithmetic Mean',
    icon: Calculator,
    description: 'The balance point of data'
  },
  {
    id: 'median',
    title: 'Median',
    icon: Target,
    description: 'The middle value'
  },
  {
    id: 'mode',
    title: 'Mode',
    icon: BarChart3,
    description: 'The most frequent value'
  },
  {
    id: 'comparison',
    title: 'Comparing Measures',
    icon: TrendingUp,
    description: 'When to use each measure'
  },
  {
    id: 'practice',
    title: 'Practice Problems',
    icon: Calculator,
    description: 'Test your understanding'
  }
];

// Sample dataset for demonstrations - designed to show clear differences
const DEMO_DATA = [1, 2, 2, 2, 3, 4, 5, 6, 7, 8, 20, 25];

// Engineering example data - measurement errors
const ENGINEERING_DATA = {
  title: "Component Thickness Measurements (mm)",
  data: [9.8, 9.9, 10.0, 10.0, 10.1, 10.1, 10.2, 10.3, 10.4, 11.5],
  context: "Quality control measurements with one potentially defective component"
};

// Exam score data
const EXAM_DATA = {
  title: "Statistics Midterm Scores",
  data: [45, 52, 58, 62, 65, 68, 70, 72, 75, 78, 82, 85, 88, 92, 98],
  context: "Class performance on recent midterm exam"
};

function CentralTendencyIntuitiveIntro({ onComplete }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [data] = useState(DEMO_DATA);
  const [microQuizAnswers, setMicroQuizAnswers] = useState({});
  const [showQuizFeedback, setShowQuizFeedback] = useState({});
  const svgRef = useRef(null);
  const mathRef = useRef(null);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  // Calculate measures
  const measures = useMemo(() => {
    const sorted = [...data].sort((a, b) => a - b);
    const n = data.length;
    
    // Mean
    const mean = data.reduce((sum, x) => sum + x, 0) / n;
    
    // Median
    const mid = Math.floor(n / 2);
    const median = n % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
    
    // Mode
    const frequency = {};
    data.forEach(x => {
      frequency[x] = (frequency[x] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(frequency));
    const modes = Object.keys(frequency)
      .filter(key => frequency[key] === maxFreq)
      .map(Number);
    
    return { mean, median, modes, frequency, sorted };
  }, [data]);
  
  // Render LaTeX
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && mathRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([mathRef.current]);
        }
        window.MathJax.typesetPromise([mathRef.current]).catch(() => {});
      }
    };
    
    processMathJax(); // Try immediately
    const timeoutId1 = setTimeout(processMathJax, 100); // CRITICAL: Retry after 100ms
    const timeoutId2 = setTimeout(processMathJax, 500); // Additional retry after 500ms
    const timeoutId3 = setTimeout(processMathJax, 1000); // Final retry after 1s
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, [currentSection]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft' && currentSection > 0) {
        setCurrentSection(currentSection - 1);
      } else if (e.key === 'ArrowRight' && currentSection < SECTIONS.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSection]);
  
  // Render visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width, height } = svgRef.current.getBoundingClientRect();
    const margin = { top: 50, right: 40, bottom: 50, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    if (currentSection === 0) {
      // Introduction visualization
      renderIntroduction(g, innerWidth, innerHeight);
    } else if (currentSection === 1) {
      // Mean visualization
      renderMean(g, innerWidth, innerHeight);
    } else if (currentSection === 2) {
      // Median visualization
      renderMedian(g, innerWidth, innerHeight);
    } else if (currentSection === 3) {
      // Mode visualization
      renderMode(g, innerWidth, innerHeight);
    } else if (currentSection === 4) {
      // Comparison visualization
      renderComparison(g, innerWidth, innerHeight);
    }
  }, [currentSection, data, measures]);
  
  const renderIntroduction = (g, width, height) => {
    // Simple dot plot showing the data
    const xScale = d3.scaleLinear()
      .domain([-2, 27])
      .range([0, width]);
    
    const y = height * 0.7;
    
    // Grid lines
    g.selectAll(".grid-line")
      .data(xScale.ticks(10))
      .enter().append("line")
      .attr("class", "grid-line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#333")
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.5);
    
    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Axis label
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#999")
      .attr("font-size", "12px")
      .text("Value");
    
    // Data points with tooltips
    const dots = g.selectAll(".dot")
      .data(data)
      .enter().append("g")
      .attr("class", "dot-group");
    
    dots.append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d))
      .attr("cy", y)
      .attr("r", 0)
      .attr("fill", d => d >= 20 ? "#ef4444" : measureColors.data)
      .attr("opacity", 0.7)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr("r", 8);
    
    // Value labels on hover
    dots.append("text")
      .attr("x", d => xScale(d))
      .attr("y", y - 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .attr("opacity", 0)
      .text(d => d);
    
    // Hover interaction
    dots.on("mouseover", function() {
      d3.select(this).select("text").attr("opacity", 1);
      d3.select(this).select("circle").attr("r", 10);
    }).on("mouseout", function() {
      d3.select(this).select("text").attr("opacity", 0);
      d3.select(this).select("circle").attr("r", 8);
    });
    
    // Question mark at center
    g.append("text")
      .attr("x", width / 2)
      .attr("y", y - 90)
      .attr("text-anchor", "middle")
      .attr("font-size", "56px")
      .attr("fill", measureColors.highlight)
      .attr("opacity", 0)
      .text("?")
      .transition()
      .duration(1000)
      .delay(800)
      .attr("opacity", 1);
  };
  
  const renderMean = (g, width, height) => {
    const xScale = d3.scaleLinear()
      .domain([-2, 27])
      .range([0, width]);
    
    const y = height * 0.7;
    
    // Grid lines
    g.selectAll(".grid-line")
      .data(xScale.ticks(10))
      .enter().append("line")
      .attr("class", "grid-line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#333")
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.5);
    
    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Data points
    g.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("cx", d => xScale(d))
      .attr("cy", y)
      .attr("r", 6)
      .attr("fill", measureColors.data)
      .attr("opacity", 0.6);
    
    // Mean line
    const meanX = xScale(measures.mean);
    g.append("line")
      .attr("x1", meanX)
      .attr("x2", meanX)
      .attr("y1", 20)
      .attr("y2", height)
      .attr("stroke", measureColors.mean)
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1);
    
    // Mean label
    g.append("text")
      .attr("x", meanX)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("fill", measureColors.mean)
      .attr("font-weight", "bold")
      .text(`Mean = ${formatNumber(measures.mean, 2)}`)
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1);
    
    // Balance visualization
    const beam = g.append("line")
      .attr("x1", xScale(0))
      .attr("x2", xScale(20))
      .attr("y1", y + 35)
      .attr("y2", y + 35)
      .attr("stroke", "#fff")
      .attr("stroke-width", 4);
    
    // Triangle fulcrum using path
    const fulcrum = g.append("path")
      .attr("d", "M -15 0 L 15 0 L 0 -20 Z")
      .attr("transform", `translate(${meanX},${y + 50})`)
      .attr("fill", measureColors.mean);
  };
  
  const renderMedian = (g, width, height) => {
    const xScale = d3.scaleLinear()
      .domain([-2, 27])
      .range([0, width]);
    
    const y = height * 0.7;
    
    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Sorted data with positions
    const sorted = [...data].sort((a, b) => a - b);
    
    // Group by value to handle duplicates
    const valueGroups = {};
    sorted.forEach((val, i) => {
      if (!valueGroups[val]) valueGroups[val] = [];
      valueGroups[val].push(i);
    });
    
    // Calculate positions with horizontal spreading for duplicates
    const positions = sorted.map((val, i) => {
      const group = valueGroups[val];
      const groupSize = group.length;
      const indexInGroup = group.indexOf(i);
      
      // Horizontal offset for multiple points with same value
      let xOffset = 0;
      if (groupSize > 1) {
        const spacing = 20; // pixels between points
        xOffset = (indexInGroup - (groupSize - 1) / 2) * spacing;
      }
      
      return {
        value: val,
        index: i,
        x: xScale(val) + xOffset,
        y: y - (i % 2 === 0 ? 35 : -35)
      };
    });
    
    // Connect sorted values
    positions.forEach((pos, i) => {
      if (i > 0) {
        g.append("line")
          .attr("x1", positions[i-1].x)
          .attr("y1", positions[i-1].y)
          .attr("x2", pos.x)
          .attr("y2", pos.y)
          .attr("stroke", "#444")
          .attr("stroke-width", 1)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .delay(i * 50)
          .attr("opacity", 0.5);
      }
    });
    
    // Data points with indices
    positions.forEach((pos, i) => {
      // Circle
      g.append("circle")
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .attr("r", 0)
        .attr("fill", i === 5 || i === 6 ? measureColors.median : measureColors.data)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("opacity", 0.9)
        .transition()
        .duration(500)
        .delay(i * 50)
        .attr("r", 10);
      
      // Index label
      g.append("text")
        .attr("x", pos.x)
        .attr("y", pos.y)
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .attr("fill", "#fff")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("opacity", 0)
        .text(i + 1)
        .transition()
        .duration(500)
        .delay(i * 50)
        .attr("opacity", 1);
    });
    
    // Median line
    const medianX = xScale(measures.median);
    g.append("line")
      .attr("x1", medianX)
      .attr("x2", medianX)
      .attr("y1", 20)
      .attr("y2", height)
      .attr("stroke", measureColors.median)
      .attr("stroke-width", 3)
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .delay(600)
      .attr("opacity", 1);
    
    // Median label
    g.append("text")
      .attr("x", medianX)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("fill", measureColors.median)
      .attr("font-weight", "bold")
      .text(`Median = ${formatNumber(measures.median, 1)}`)
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .delay(600)
      .attr("opacity", 1);
  };
  
  const renderMode = (g, width, height) => {
    const xScale = d3.scaleLinear()
      .domain([-2, 27])
      .range([0, width]);
    
    const maxFreq = Math.max(...Object.values(measures.frequency));
    const yScale = d3.scaleLinear()
      .domain([0, maxFreq + 1])
      .range([height, 20]);
    
    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Y-axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(maxFreq))
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Frequency bars
    Object.entries(measures.frequency).forEach(([value, freq]) => {
      const x = xScale(Number(value));
      const barWidth = Math.min(40, width / 25);
      const isMode = measures.modes.includes(Number(value));
      
      g.append("rect")
        .attr("x", x - barWidth/2)
        .attr("y", height)
        .attr("width", barWidth)
        .attr("height", 0)
        .attr("fill", isMode ? measureColors.mode : measureColors.data)
        .attr("opacity", 0.8)
        .transition()
        .duration(800)
        .delay(Number(value) * 30)
        .attr("y", yScale(freq))
        .attr("height", height - yScale(freq));
      
      // Frequency label
      g.append("text")
        .attr("x", x)
        .attr("y", yScale(freq) - 5)
        .attr("text-anchor", "middle")
        .attr("fill", isMode ? measureColors.mode : "#666")
        .attr("font-weight", isMode ? "bold" : "normal")
        .attr("opacity", 0)
        .text(freq)
        .transition()
        .duration(800)
        .delay(Number(value) * 30)
        .attr("opacity", 1);
    });
    
    // Mode label
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("fill", measureColors.mode)
      .attr("font-weight", "bold")
      .text(`Mode = ${measures.modes.join(', ')}`)
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .delay(500)
      .attr("opacity", 1);
  };
  
  const renderComparison = (g, width, height) => {
    const xScale = d3.scaleLinear()
      .domain([-2, 27])
      .range([0, width]);
    
    const y = height * 0.7;
    
    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Data points
    g.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("cx", d => xScale(d))
      .attr("cy", y)
      .attr("r", 5)
      .attr("fill", measureColors.data)
      .attr("opacity", 0.4);
    
    // All three measures with smart positioning to avoid overlaps
    const measuresData = [
      { name: 'Mode', value: measures.modes[0], color: measureColors.mode },
      { name: 'Median', value: measures.median, color: measureColors.median },
      { name: 'Mean', value: measures.mean, color: measureColors.mean }
    ].sort((a, b) => a.value - b.value); // Sort by value
    
    // Calculate positions with overlap detection
    const labelPositions = [];
    const minLabelDistance = 60; // Minimum pixels between labels
    
    measuresData.forEach((measure, i) => {
      let x = xScale(measure.value);
      let yOffset = 0;
      
      // Check for overlaps with previous labels
      for (let j = 0; j < i; j++) {
        const prevX = labelPositions[j].x;
        const distance = Math.abs(x - prevX);
        
        if (distance < minLabelDistance) {
          // Offset vertically if too close
          yOffset = labelPositions[j].yOffset === 0 ? -30 : 0;
        }
      }
      
      labelPositions.push({ x, yOffset, ...measure });
    });
    
    labelPositions.forEach((measure, i) => {
      const x = measure.x;
      const labelY = 30 + measure.yOffset;
      
      // Vertical line
      g.append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", 60)
        .attr("y2", height)
        .attr("stroke", measure.color)
        .attr("stroke-width", 3)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(i * 200)
        .attr("opacity", 0.6);
      
      // Arrow pointing to line with adjusted position
      const arrowY = labelY + 25;
      g.append("path")
        .attr("d", `M ${x - 10} ${arrowY + 10} L ${x} ${arrowY} L ${x + 10} ${arrowY + 10}`)
        .attr("fill", measure.color)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(i * 200)
        .attr("opacity", 1);
      
      // Label at top with adjusted position
      g.append("text")
        .attr("x", x)
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("fill", measure.color)
        .attr("font-weight", "bold")
        .attr("font-size", "16px")
        .attr("opacity", 0)
        .text(`${measure.name}`)
        .transition()
        .duration(800)
        .delay(i * 200)
        .attr("opacity", 1);
      
      // Value below name with background
      const valueGroup = g.append("g");
      const valueText = formatNumber(measure.value, 1);
      const textWidth = valueText.length * 10 + 10;
      
      valueGroup.append("rect")
        .attr("x", x - textWidth/2)
        .attr("y", labelY + 5)
        .attr("width", textWidth)
        .attr("height", 18)
        .attr("fill", "#1a1a1a")
        .attr("rx", 4)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(i * 200)
        .attr("opacity", 0.9);
      
      valueGroup.append("text")
        .attr("x", x)
        .attr("y", labelY + 17)
        .attr("text-anchor", "middle")
        .attr("fill", measure.color)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("opacity", 0)
        .text(valueText)
        .transition()
        .duration(800)
        .delay(i * 200)
        .attr("opacity", 1);
    });
  };
  
  const renderSectionContent = () => {
    switch(currentSection) {
      case 0:
        return (
          <div className="space-y-4" ref={mathRef}>
            {/* Attention-Grabbing Opening */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-bold text-white mb-2">Real Scenario:</h3>
              <p className="text-neutral-300">
                Your professor announces: "The class average was 72% on the midterm." 
                But wait... <strong className="text-amber-400">half the class failed!</strong> How is this possible?
              </p>
              <p className="text-sm text-neutral-400 mt-2">
                Understanding central tendency will help you decode what statistics really mean - and ace your exams!
              </p>
            </div>
            
            <h3 className="text-xl font-bold text-white">What is a Measure of Central Tendency?</h3>
            <p className="text-neutral-300">
              A measure of central tendency is a single value that represents the center or typical value of a dataset. 
              It provides a summary of where the data tends to cluster.
            </p>
            {/* Learning Objectives */}
            <div className="bg-purple-900/20 border border-purple-600/30 p-4 rounded-lg">
              <p className="text-sm font-semibold text-purple-400 mb-2">Learning Objectives:</p>
              <ul className="list-disc list-inside text-neutral-300 space-y-1 text-sm">
                <li>Calculate and interpret mean, median, and mode</li>
                <li>Choose the appropriate measure for different data types</li>
                <li>Understand the effect of outliers on each measure</li>
                <li>Apply these concepts to exam-style problems</li>
              </ul>
            </div>
            
            {/* Visual Memory Aid */}
            <div className="bg-neutral-900 p-4 rounded-lg">
              <p className="text-sm text-neutral-400 mb-3">Quick Visual Memory Aid:</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-blue-900/20 p-3 rounded">
                  <p className="text-2xl mb-1">⚖️</p>
                  <p className="text-xs font-semibold text-blue-400">Mean</p>
                  <p className="text-xs text-neutral-400">Balance point</p>
                </div>
                <div className="bg-green-900/20 p-3 rounded">
                  <p className="text-2xl mb-1">|</p>
                  <p className="text-xs font-semibold text-green-400">Median</p>
                  <p className="text-xs text-neutral-400">Middle person</p>
                </div>
                <div className="bg-amber-900/20 p-3 rounded">
                  <p className="text-2xl mb-1">▲</p>
                  <p className="text-xs font-semibold text-amber-400">Mode</p>
                  <p className="text-xs text-neutral-400">Most popular</p>
                </div>
              </div>
            </div>
            
            {/* Real-world Context */}
            <div className="bg-neutral-800/50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-400 mb-2">Why This Matters:</p>
              <p className="text-sm text-neutral-300">
                In engineering: Summarizing measurement data, quality control<br/>
                In research: Describing experimental results<br/>
                In exams: <strong>~15% of statistics exam questions</strong> involve central tendency
              </p>
            </div>
            
            <p className="text-neutral-300">
              Our sample dataset: <span className="font-mono text-blue-400">{data.slice(0, -2).join(', ')}, <span className="text-amber-400">{data[data.length - 2]}</span>, <span className="text-red-400">{data[data.length - 1]}</span></span>
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Note: The values <span className="text-amber-400">20</span> and <span className="text-red-400">25</span> are potential outliers that will affect our measures differently.
            </p>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-4" ref={mathRef}>
            <h3 className="text-xl font-bold text-white mb-2">Arithmetic Mean</h3>
            <p className="text-neutral-300">
              The arithmetic mean is the sum of all values divided by the number of values.
            </p>
            
            {/* Formula with Step-by-Step */}
            <div className="bg-neutral-900 p-4 rounded-lg">
              <p className="text-center text-lg">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\(\\bar{x} = \\frac{\\sum_{i=1}^{n} x_i}{n} = \\frac{${data.join(' + ')}}{${data.length}} = ${formatNumber(measures.mean, 2)}\\)` 
                }} />
              </p>
              <p className="text-sm text-neutral-400 mt-3 text-center">
                Key property: <span dangerouslySetInnerHTML={{ __html: `\\(\\sum_{i=1}^{n} (x_i - \\bar{x}) = 0\\)` }} />
              </p>
            </div>
            
            {/* Exam-Style Example */}
            <div className="bg-amber-900/20 border border-amber-600/30 p-4 rounded-lg">
              <p className="text-sm font-semibold text-amber-400 mb-2">Exam Example:</p>
              <p className="text-sm text-neutral-300 mb-2">
                A quality control engineer measures 5 components: 10.1, 9.9, 10.2, 10.0, 10.3 mm.
                Calculate the mean and interpret.
              </p>
              <div className="bg-neutral-900/50 p-3 rounded mt-2">
                <p className="text-xs text-neutral-400">Solution:</p>
                <p className="text-sm font-mono text-blue-300">
                  x̄ = (10.1 + 9.9 + 10.2 + 10.0 + 10.3) / 5 = 50.5 / 5 = 10.1 mm
                </p>
                <p className="text-xs text-neutral-300 mt-1">
                  The average thickness is 10.1 mm, suggesting the manufacturing process is centered slightly above the 10.0 mm target.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-900 p-3 rounded">
                <p className="text-sm font-semibold text-blue-400">Properties</p>
                <ul className="text-sm text-neutral-300 mt-1 space-y-1">
                  <li>• Minimizes Σ(x - x̄)²</li>
                  <li>• Sensitive to outliers</li>
                  <li>• Balance point of data</li>
                  <li>• Always exists & unique</li>
                </ul>
              </div>
              <div className="bg-neutral-900 p-3 rounded">
                <p className="text-sm font-semibold text-blue-400">Use When</p>
                <ul className="text-sm text-neutral-300 mt-1 space-y-1">
                  <li>• Data is symmetric</li>
                  <li>• No extreme outliers</li>
                  <li>• All values matter equally</li>
                  <li>• Need further calculations</li>
                </ul>
              </div>
            </div>
            
            {/* Standard Error Preview */}
            <div className="mt-4 p-3 bg-purple-900/20 border border-purple-600/30 rounded">
              <p className="text-xs font-semibold text-purple-400 mb-2">Preview: Standard Error</p>
              <p className="text-xs text-neutral-300">
                When we take a sample, the sample mean x̄ estimates the population mean μ.
                The standard error <span dangerouslySetInnerHTML={{ __html: `\\(SE = \\frac{s}{\\sqrt{n}}\\)` }} /> tells us how precise this estimate is.
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-neutral-800 rounded">
              <p className="text-xs font-semibold text-purple-400 mb-2">Other Types of Means</p>
              <div className="space-y-1 text-xs text-neutral-300">
                <div>• <strong>Weighted Mean:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x}_w = \\frac{\\sum w_i x_i}{\\sum w_i}\\)` }} /> (for rates)</div>
                <div>• <strong>Geometric Mean:</strong> <span dangerouslySetInnerHTML={{ __html: `\\((\\prod x_i)^{1/n}\\)` }} /> (for growth)</div>
                <div>• <strong>Harmonic Mean:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(\\frac{n}{\\sum 1/x_i}\\)` }} /> (for speeds)</div>
              </div>
            </div>
            
            {/* Micro Quiz */}
            <div className="bg-purple-900/20 border border-purple-600/30 p-4 rounded-lg mt-4">
              <p className="text-sm font-semibold text-purple-400 mb-2">Quick Check:</p>
              <p className="text-sm text-neutral-300 mb-2">
                Data: 2, 4, 6, 8, 10. What is the mean?
              </p>
              <div className="flex gap-2">
                {[4, 5, 6, 7].map(answer => (
                  <button
                    key={answer}
                    onClick={() => {
                      setMicroQuizAnswers({...microQuizAnswers, mean: answer});
                      setShowQuizFeedback({...showQuizFeedback, mean: true});
                    }}
                    className={cn(
                      "px-3 py-1 rounded",
                      microQuizAnswers.mean === answer
                        ? answer === 6 
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                        : "bg-neutral-700 text-white hover:bg-neutral-600"
                    )}
                  >
                    {answer}
                  </button>
                ))}
              </div>
              {showQuizFeedback.mean && (
                <p className="text-xs mt-2 text-neutral-300">
                  {microQuizAnswers.mean === 6 
                    ? "Correct! (2+4+6+8+10)/5 = 30/5 = 6"
                    : "Incorrect. Try again! Add all values, then divide by count (5)"}
                </p>
              )}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4" ref={mathRef}>
            <h3 className="text-xl font-bold text-white mb-2">Median</h3>
            <p className="text-neutral-300">
              The median is the middle value when data is ordered from smallest to largest.
            </p>
            <div className="bg-neutral-900 p-4 rounded-lg">
              <p className="text-sm text-neutral-400">Sorted data:</p>
              <p className="font-mono text-center text-blue-400">{measures.sorted.join(', ')}</p>
              <div className="text-center mt-2">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[\\text{Median} = \\frac{x_{(6)} + x_{(7)}}{2} = \\frac{${measures.sorted[5]} + ${measures.sorted[6]}}{2} = ${measures.median}\\]` 
                }} />
              </div>
              <p className="text-sm text-neutral-400 mt-3">
                For even n: median = average of two middle values<br/>
                For odd n: median = middle value
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-900 p-3 rounded">
                <p className="text-sm font-semibold text-green-400">Properties</p>
                <ul className="text-sm text-neutral-300 mt-1 space-y-1">
                  <li>• Minimizes absolute deviations</li>
                  <li>• Robust to outliers</li>
                  <li>• 50th percentile</li>
                </ul>
              </div>
              <div className="bg-neutral-900 p-3 rounded">
                <p className="text-sm font-semibold text-green-400">Use When</p>
                <ul className="text-sm text-neutral-300 mt-1 space-y-1">
                  <li>• Data is skewed</li>
                  <li>• Outliers present</li>
                  <li>• Income/house prices</li>
                </ul>
              </div>
            </div>
            
            {/* Common Mistake Alert */}
            <div className="bg-red-900/20 border border-red-600/30 p-3 rounded-lg">
              <p className="text-xs font-semibold text-red-400">Common Exam Mistake:</p>
              <p className="text-xs text-neutral-300">
                Always SORT the data first! Forgetting this step costs easy marks.
              </p>
            </div>
            
            {/* Micro Quiz */}
            <div className="bg-purple-900/20 border border-purple-600/30 p-4 rounded-lg mt-4">
              <p className="text-sm font-semibold text-purple-400 mb-2">Quick Check:</p>
              <p className="text-sm text-neutral-300 mb-2">
                Data: 3, 7, 2, 9, 5. What is the median?
              </p>
              <div className="flex gap-2">
                {[3, 5, 7, 9].map(answer => (
                  <button
                    key={answer}
                    onClick={() => {
                      setMicroQuizAnswers({...microQuizAnswers, median: answer});
                      setShowQuizFeedback({...showQuizFeedback, median: true});
                    }}
                    className={cn(
                      "px-3 py-1 rounded",
                      microQuizAnswers.median === answer
                        ? answer === 5 
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                        : "bg-neutral-700 text-white hover:bg-neutral-600"
                    )}
                  >
                    {answer}
                  </button>
                ))}
              </div>
              {showQuizFeedback.median && (
                <p className="text-xs mt-2 text-neutral-300">
                  {microQuizAnswers.median === 5 
                    ? "Correct! Sorted: 2, 3, 5, 7, 9. Middle value is 5."
                    : "Incorrect. Remember to SORT first! Then find the middle value."}
                </p>
              )}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4" ref={mathRef}>
            <h3 className="text-xl font-bold text-white mb-2">Mode</h3>
            <p className="text-neutral-300">
              The mode is the value that appears most frequently in the dataset.
            </p>
            <div className="bg-neutral-900 p-4 rounded-lg">
              <p className="text-sm text-neutral-400">Frequency table:</p>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {Object.entries(measures.frequency).map(([val, freq]) => (
                  <div key={val} className={cn(
                    "text-center p-2 rounded",
                    measures.modes.includes(Number(val)) ? "bg-amber-900/50" : "bg-neutral-800"
                  )}>
                    <p className="font-mono text-sm">{val}</p>
                    <p className="text-xs text-neutral-400">{freq}×</p>
                  </div>
                ))}
              </div>
              <p className="text-center mt-2 text-amber-400">
                Mode = {measures.modes.join(', ')} (appears {measures.frequency[measures.modes[0]]} times)
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-900 p-3 rounded">
                <p className="text-sm font-semibold text-amber-400">Properties</p>
                <ul className="text-sm text-neutral-300 mt-1 space-y-1">
                  <li>• Can have multiple modes</li>
                  <li>• Works with categorical data</li>
                  <li>• Most probable value</li>
                </ul>
              </div>
              <div className="bg-neutral-900 p-3 rounded">
                <p className="text-sm font-semibold text-amber-400">Use When</p>
                <ul className="text-sm text-neutral-300 mt-1 space-y-1">
                  <li>• Categorical data</li>
                  <li>• Finding typical value</li>
                  <li>• Discrete distributions</li>
                </ul>
              </div>
            </div>
            
            {/* Real-World Example */}
            <div className="bg-blue-900/20 border border-blue-600/30 p-3 rounded-lg">
              <p className="text-xs font-semibold text-blue-400">Real Example:</p>
              <p className="text-xs text-neutral-300">
                Survey: "What's your major?" Engineering (45), Business (45), Science (20), Arts (10).<br/>
                Mode = Engineering and Business (bimodal)
              </p>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4" ref={mathRef}>
            <h3 className="text-xl font-bold text-white">Comparing Measures</h3>
            <p className="text-neutral-300">
              Different measures of central tendency can give different values, especially with skewed data.
            </p>
            <div className="bg-neutral-900 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-blue-400 font-semibold">Mean</span>
                  <span className="font-mono">{formatNumber(measures.mean, 2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-400 font-semibold">Median</span>
                  <span className="font-mono">{formatNumber(measures.median, 1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-400 font-semibold">Mode</span>
                  <span className="font-mono">{measures.modes.join(', ')}</span>
                </div>
              </div>
            </div>
            
            {/* Decision Tree */}
            <div className="bg-purple-900/20 border border-purple-600/30 p-4 rounded-lg">
              <p className="text-sm font-semibold text-purple-400 mb-3">Which Measure to Use?</p>
              <div className="space-y-2 text-sm">
                <div className="bg-neutral-900/50 p-3 rounded">
                  <p className="text-blue-400 font-semibold">Use Mean when:</p>
                  <ul className="text-neutral-300 mt-1 space-y-1">
                    <li>• Data is roughly symmetric</li>
                    <li>• Need to do further calculations</li>
                    <li>• Working with interval/ratio data</li>
                  </ul>
                </div>
                <div className="bg-neutral-900/50 p-3 rounded">
                  <p className="text-green-400 font-semibold">Use Median when:</p>
                  <ul className="text-neutral-300 mt-1 space-y-1">
                    <li>• Data contains outliers</li>
                    <li>• Data is skewed</li>
                    <li>• Working with ordinal data</li>
                  </ul>
                </div>
                <div className="bg-neutral-900/50 p-3 rounded">
                  <p className="text-amber-400 font-semibold">Use Mode when:</p>
                  <ul className="text-neutral-300 mt-1 space-y-1">
                    <li>• Data is categorical</li>
                    <li>• Looking for most common value</li>
                    <li>• Working with nominal data</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-purple-400 mb-2">Distribution Shape</p>
              <p className="text-sm text-neutral-300">
                When mean {'>'} median {'>'} mode, the distribution is <strong>right-skewed</strong> (positively skewed).
              </p>
              <p className="text-sm text-neutral-300 mt-2">
                Our data shows this pattern due to the outliers (20, 25).
              </p>
              <div className="mt-3 pt-3 border-t border-neutral-700">
                <p className="text-xs text-neutral-400">Quick reference:</p>
                <ul className="text-xs text-neutral-300 mt-1 space-y-1">
                  <li>• Right-skewed: Mean {'>'} Median {'>'} Mode (tail on right)</li>
                  <li>• Symmetric: Mean ≈ Median ≈ Mode</li>
                  <li>• Left-skewed: Mean {'<'} Median {'<'} Mode (tail on left)</li>
                </ul>
              </div>
            </div>
            
            {/* Exam Tip */}
            <div className="bg-amber-900/20 border border-amber-600/30 p-3 rounded-lg">
              <p className="text-xs font-semibold text-amber-400">Exam Tip:</p>
              <p className="text-xs text-neutral-300">
                Questions often ask you to identify distribution shape based on the relationship between mean, median, and mode. 
                Remember: the mean is "pulled" toward the tail!
              </p>
            </div>
          </div>
        );
      
      case 5:
        return (
          <PracticeProblems mathRef={mathRef} />
        );
      
      default:
        return null;
    }
  };
  
  return (
    <VisualizationContainer 
      title="4.1 Central Tendency: An Intuitive Journey"
      className="min-h-screen max-w-7xl mx-auto"
    >
      {/* Section Header */}
      <motion.div 
        key={currentSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          {React.createElement(SECTIONS[currentSection].icon, { 
            size: 24, 
            className: "text-purple-400" 
          })}
          <h2 className="text-2xl font-bold text-white">
            {SECTIONS[currentSection].title}
          </h2>
        </div>
        <p className="text-neutral-400">{SECTIONS[currentSection].description}</p>
      </motion.div>
      
      {/* Summary Card - Always visible */}
      <AnimatePresence>
        {currentSection > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-neutral-900 p-4 rounded-lg mb-4"
          >
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-xs text-neutral-400">Mean</p>
                <p className="text-lg font-mono text-blue-400">{formatNumber(measures.mean, 2)}</p>
              </div>
              {currentSection >= 2 && (
                <div className="text-center">
                  <p className="text-xs text-neutral-400">Median</p>
                  <p className="text-lg font-mono text-green-400">{formatNumber(measures.median, 1)}</p>
                </div>
              )}
              {currentSection >= 3 && (
                <div className="text-center">
                  <p className="text-xs text-neutral-400">Mode</p>
                  <p className="text-lg font-mono text-amber-400">{measures.modes.join(', ')}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content - Full Width Visualization First */}
      <div className="space-y-6">
        {/* Visualization - Full Width */}
        <VisualizationSection className="w-full">
          <GraphContainer height="320px" className="w-full">
            <svg ref={svgRef} className="w-full h-full" />
          </GraphContainer>
        </VisualizationSection>
        
        {/* Text Content Below */}
        <VisualizationSection className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSectionContent()}
            </motion.div>
          </AnimatePresence>
        </VisualizationSection>
      </div>
      
      {/* Navigation */}
      <InteractiveJourneyNavigation
        currentSection={currentSection}
        totalSections={SECTIONS.length}
        onNavigate={setCurrentSection}
        onComplete={() => {
          if (!hasCompleted) {
            setHasCompleted(true);
            if (onComplete) onComplete();
          }
        }}
        sectionTitles={SECTIONS.map(s => s.title)}
        showProgress={true} // Show integrated progress bar
        progressVariant="purple"
        isCompleted={hasCompleted}
        className="mt-8"
      />
      
      {/* Back to Hub Button */}
      <BackToHub chapter={4} bottom />
    </VisualizationContainer>
  );
}

export default CentralTendencyIntuitiveIntro;