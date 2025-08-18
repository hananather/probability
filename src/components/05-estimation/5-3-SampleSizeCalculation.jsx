"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import * as d3 from '@/utils/d3-utils';
import { 
  Compass, 
  Calculator, 
  Briefcase,
  Heart,
  Factory,
  TrendingUp,
  Check,
  ArrowLeft,
  Info,
  Play,
  Pause,
  CheckCircle
} from 'lucide-react';
import BackToHub from '../ui/BackToHub';
import SectionComplete from '@/components/ui/SectionComplete';
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { Chapter5ReferenceSheet } from '../reference-sheets/Chapter5ReferenceSheet';
import { colors, typography, createColorScheme } from '@/lib/design-system';

// Learning modes
const LEARNING_MODES = {
  FOUNDATIONS: 'foundations',
  PRACTICE: 'practice',
  APPLICATIONS: 'applications'
};

// Mode colors
const MODE_COLORS = {
  [LEARNING_MODES.FOUNDATIONS]: '#10b981', // emerald
  [LEARNING_MODES.PRACTICE]: '#3b82f6',   // blue
  [LEARNING_MODES.APPLICATIONS]: '#8b5cf6' // purple
};

// Chapter 7 Design Patterns - Consistent Colors
const chapterColors = {
  primary: '#3b82f6',    // Blue
  secondary: '#14b8a6',  // Teal  
  tertiary: '#10b981',   // Emerald
  warning: '#fbbf24',    // Yellow
  error: '#ef4444',      // Red
  chart: {
    primary: '#14b8a6',    // Teal
    secondary: '#fbbf24',  // Yellow
    tertiary: '#3b82f6'    // Blue
  }
};

// Stage configuration
const SampleSizeJourney = {
  DISCOVER: {
    id: 'DISCOVER',
    title: 'Discover the Relationships',
    subtitle: <>How do n, E, <span dangerouslySetInnerHTML={{ __html: '\\(\\sigma\\)' }} />, and confidence interact?</>,
    icon: Compass,
    color: '#14b8a6',  // Teal
    gradient: 'from-teal-600 to-teal-700',
    sections: ['VisualExploration', 'InteractiveRelationships', 'FirstInsights']
  },
  CALCULATE: {
    id: 'CALCULATE',
    title: 'Calculation Practice',
    subtitle: 'Apply the formula with confidence',
    icon: Calculator,
    color: '#fbbf24',  // Yellow
    gradient: 'from-yellow-600 to-yellow-700',
    sections: ['FormulaDerivation', 'GuidedExamples', 'PracticeMode']
  },
  APPLY: {
    id: 'APPLY',
    title: 'Real-World Applications',
    subtitle: 'Balance precision, confidence, and cost',
    icon: Briefcase,
    color: '#3b82f6',  // Blue
    gradient: 'from-blue-600 to-blue-700',
    sections: ['CostAnalysis', 'ScenarioPlanning', 'OptimizationTool']
  }
};

// Learning Path Navigation Component
const LearningPathNavigation = React.memo(function LearningPathNavigation({ mode, onModeChange }) {
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
  }, [mode]);
  
  return (
    <div className="mb-8">
      <VisualizationSection className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-2xl font-bold text-white mb-4">Learning Path</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(LEARNING_MODES).map(([key, value]) => {
            const isActive = mode === value;
            const color = MODE_COLORS[value];
            
            return (
              <button
                key={key}
                onClick={() => onModeChange(value)}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  isActive 
                    ? `bg-gradient-to-br from-${color}/20 to-${color}/10 border-${color}` 
                    : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                }`}
                style={isActive ? { borderColor: color, background: `linear-gradient(to bottom right, ${color}20, ${color}10)` } : {}}
              >
                {isActive && (
                  <CheckCircle className="absolute top-2 right-2 w-4 h-4" style={{ color }} />
                )}
                
                <h3 className="font-semibold text-lg mb-1" style={{ color: isActive ? color : '#fff' }}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </h3>
                <p className="text-sm text-gray-400">
                  {value === LEARNING_MODES.FOUNDATIONS && "Core concepts and theory"}
                  {value === LEARNING_MODES.PRACTICE && "Calculators and examples"}
                  {value === LEARNING_MODES.APPLICATIONS && "Real-world scenarios"}
                </p>
              </button>
            );
          })}
        </div>
      </VisualizationSection>
      
      <div 
        ref={contentRef} 
        className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mt-4"
      >
        <div className="text-sm text-neutral-300 space-y-3">
          <p className="text-lg font-semibold text-white mb-3">
            Sample Size Determination: Balancing Precision, Confidence, and Cost
          </p>
          <p>
            Before collecting data, determine the optimal sample size using the relationship between 
            <strong className="text-emerald-400"> margin of error (E)</strong>, 
            <strong className="text-blue-400"> confidence level (1-α)</strong>, 
            and <strong className="text-purple-400"> population variance (σ²)</strong>.
          </p>
          
          <div className="bg-gray-800/50 rounded p-3 text-center">
            <span dangerouslySetInnerHTML={{ __html: `\\[n = \\left(\\frac{z_{\\alpha/2} \\cdot \\sigma}{E}\\right)^2\\]` }} />
          </div>
          
          <p className="text-xs text-neutral-400">
            Progress through the learning modes to master sample size calculations.
          </p>
        </div>
      </div>
    </div>
  );
});

// Journey Progress Component
const JourneyProgress = React.memo(function JourneyProgress({ 
  stages, 
  currentStage, 
  completedActivities, 
  onStageSelect 
}) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        {Object.entries(stages).map(([key, stage], index) => {
          const Icon = stage.icon;
          const isActive = currentStage === key;
          const isCompleted = completedActivities.has(key);
          
          return (
            <div
              key={key}
              className="flex-1 mx-2"
            >
              <button
                onClick={() => onStageSelect(key)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  isActive 
                    ? 'shadow-lg' 
                    : 'hover:border-neutral-600'
                }`}
                style={{
                  borderColor: isActive ? stage.color : '#525252',
                  backgroundColor: isActive ? `${stage.color}20` : 'transparent'
                }}
              >
                <Icon 
                  className="w-8 h-8 mx-auto mb-2" 
                  style={{ color: isActive ? stage.color : '#e5e5e5' }}
                />
                <p className="font-semibold text-sm">{stage.title}</p>
                <p className="text-xs text-neutral-400 mt-1">{stage.subtitle}</p>
                {isCompleted && (
                  <div className="mt-2">
                    <Check className="w-5 h-5 mx-auto text-green-500" />
                  </div>
                )}
              </button>
              
              {index < Object.keys(stages).length - 1 && (
                <div className="absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowLeft className="w-4 h-4 text-neutral-600 rotate-180" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: '0%' }}
          animate={{ 
            width: `${(completedActivities.size / Object.keys(stages).length) * 100}%` 
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
});

// Mathematical Foundation Component
const MathematicalFoundation = React.memo(function MathematicalFoundation() {
  const contentRef = useRef(null);
  const [showDerivation, setShowDerivation] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
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
  }, [showDerivation, currentStep]);
  
  const derivationSteps = [
    {
      title: "Start with the confidence interval formula",
      content: `\\[\\bar{X} \\pm z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}}\\]`,
      explanation: "This is our standard CI formula for known σ"
    },
    {
      title: "The margin of error E is half the CI width",
      content: `\\[E = z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}}\\]`,
      explanation: "We want to control this maximum error"
    },
    {
      title: "Solve for n by rearranging",
      content: `\\[\\sqrt{n} = \\frac{z_{\\alpha/2} \\times \\sigma}{E}\\]`,
      explanation: "Multiply both sides by √n, divide by E"
    },
    {
      title: "Square both sides to get n",
      content: `\\[n = \\left(\\frac{z_{\\alpha/2} \\times \\sigma}{E}\\right)^2\\]`,
      explanation: "This is our sample size formula!"
    }
  ];
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-700/50">
      <div ref={contentRef}>
        <h3 className={`${typography.h2} mb-4`}>
          Why Does the Formula Work?
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Key Insight Card */}
          <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
            <h4 className={`${typography.h3} mb-3`}>Key Insight</h4>
            <p className="text-sm text-neutral-300 mb-3">
              The margin of error E represents the maximum distance between our sample mean and the true population mean (with specified confidence). 
              <span className="text-yellow-400 font-semibold"> Think of it as the "plus-or-minus" in poll results.</span>
            </p>
            <div className="bg-purple-900/20 rounded p-3 text-center">
              <p className="text-sm text-purple-300">If we want E = 2 with 95% confidence:</p>
              <p className="text-xs text-neutral-400 mt-1">
                We're 95% sure the true mean is within ±2 of our sample mean
              </p>
              <p className="text-xs text-yellow-400 mt-2 italic">
                Smaller E = More precision = Larger sample needed
              </p>
            </div>
          </div>
          
          {/* CLT Connection Card */}
          <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
            <h4 className={`${typography.h3} mb-3`}>Central Limit Theorem Connection</h4>
            <p className="text-sm text-neutral-300 mb-3">
              By the CLT, <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{X} \\sim N(\\mu, \\sigma^2/n)\\)` }} />
            </p>
            <p className="text-sm text-neutral-300">
              As n increases:
            </p>
            <ul className="text-sm text-neutral-400 mt-2 space-y-1">
              <li>• Standard error decreases: <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma/\\sqrt{n} \\downarrow\\)` }} /></li>
              <li>• Confidence interval narrows</li>
              <li>• Estimates become more precise</li>
            </ul>
          </div>
        </div>
        
        {/* Interactive Derivation */}
        <div className="mt-6">
          <button
            onClick={() => setShowDerivation(!showDerivation)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-all"
          >
            {showDerivation ? 'Hide' : 'Show'} Step-by-Step Derivation
          </button>
          
          <div>
            {showDerivation && (
              <div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="bg-neutral-800/50 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-semibold text-purple-400">Derivation Steps</h5>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-sm"
                        disabled={currentStep === 0}
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm">
                        Step {currentStep + 1} of {derivationSteps.length}
                      </span>
                      <button
                        onClick={() => setCurrentStep(Math.min(derivationSteps.length - 1, currentStep + 1))}
                        className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-sm"
                        disabled={currentStep === derivationSteps.length - 1}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                  
                  <div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h6 className="font-medium text-white">
                      {derivationSteps[currentStep].title}
                    </h6>
                    <div className="text-2xl text-center text-purple-300 py-4 bg-neutral-900/50 rounded">
                      <span dangerouslySetInnerHTML={{ 
                        __html: derivationSteps[currentStep].content 
                      }} />
                    </div>
                    <p className="text-sm text-neutral-400">
                      {derivationSteps[currentStep].explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Visual Exploration Component
const VisualExploration = React.memo(function VisualExploration({ onComplete }) {
  const [activeRelationship, setActiveRelationship] = useState('n-E');
  const svgRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [animating, setAnimating] = useState(false);
  
  const relationships = {
    'n-E': {
      title: 'Sample Size vs. Margin of Error',
      description: 'Smaller margins require larger samples',
      formula: 'n ∝ 1/E²',
      color: '#3b82f6',
      xLabel: 'Margin of Error (E)',
      yLabel: 'Sample Size (n)'
    },
    'n-sigma': {
      title: 'Sample Size vs. Population Variability',
      description: 'More variable populations need larger samples',
      formula: 'n ∝ σ²',
      color: '#14b8a6',  // Chapter 7 teal
      xLabel: 'Standard Deviation (σ)',
      yLabel: 'Sample Size (n)'
    },
    'n-confidence': {
      title: 'Sample Size vs. Confidence Level',
      description: 'Higher confidence requires larger samples',
      formula: 'n ∝ z²',
      color: '#10b981',
      xLabel: 'Confidence Level (%)',
      yLabel: 'Sample Size (n)'
    }
  };
  
  // Calculate z-value based on confidence
  const getZ = (confidence) => {
    const zValues = {
      90: 1.645,
      95: 1.960,
      98: 2.326,
      99: 2.576
    };
    return zValues[confidence] || 1.960;
  };
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 700;
    const height = 450;
    const margin = { top: 60, right: 120, bottom: 90, left: 100 }; // Improved spacing for readability
    
    // Clear previous
    svg.selectAll("*").remove();
    
    // Add gradient definitions
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", `gradient-${activeRelationship}`)
      .attr("gradientUnits", "userSpaceOnUse");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", relationships[activeRelationship].color)
      .attr("stop-opacity", 0.8);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", relationships[activeRelationship].color)
      .attr("stop-opacity", 0.3);
    
    // Scales and data based on relationship
    let xScale, yScale, data;
    
    if (activeRelationship === 'n-E') {
      // n vs E (inverse square relationship)
      // Adjust x-axis to more practical margin of error values (1% to 5%)
      xScale = d3.scaleLinear()
        .domain([1, 5])
        .range([margin.left, width - margin.right]);
      
      // Calculate max sample size for the minimum margin of error to set proper y-axis scale
      const maxSampleSize = Math.pow((1.96 * 15) / 1, 2); // ~864 when E = 1
      
      yScale = d3.scaleLinear()
        .domain([0, Math.ceil(maxSampleSize * 1.1)]) // Add 10% padding
        .range([height - margin.bottom, margin.top]);
      
      // Generate curve: n = (1.96 * 15 / E)²
      // Start from E = 1 instead of 0.5 for more practical values
      data = d3.range(1, 5.1, 0.1).map(E => ({
        x: E,
        y: Math.pow((1.96 * 15) / E, 2)
      }));
    } else if (activeRelationship === 'n-sigma') {
      // n vs σ
      xScale = d3.scaleLinear()
        .domain([5, 30])
        .range([margin.left, width - margin.right]);
      
      yScale = d3.scaleLinear()
        .domain([0, 1000])
        .range([height - margin.bottom, margin.top]);
      
      // Generate curve: n = (1.96 * σ / 2)²
      data = d3.range(5, 30.5, 0.5).map(sigma => ({
        x: sigma,
        y: Math.pow((1.96 * sigma) / 2, 2)
      }));
    } else {
      // n vs confidence
      xScale = d3.scaleLinear()
        .domain([90, 99])
        .range([margin.left, width - margin.right]);
      
      yScale = d3.scaleLinear()
        .domain([0, 1000])
        .range([height - margin.bottom, margin.top]);
      
      // Generate curve for different confidence levels
      data = [90, 92, 94, 95, 96, 97, 98, 99].map(conf => ({
        x: conf,
        y: Math.pow((getZ(conf) * 15) / 2, 2)
      }));
    }
    
    // Create main group
    const g = svg.append("g");
    
    // Add clip path to prevent overflow
    const clipPath = defs.append("clipPath")
      .attr("id", "chart-area-clip");
    
    clipPath.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom);
    
    // Draw axes with grid lines
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickSize(-height + margin.top + margin.bottom).tickPadding(10));
    
    xAxis.selectAll("text")
      .attr("fill", "#f3f4f6");
    
    xAxis.selectAll(".tick line")
      .attr("stroke", "#374151")
      .attr("stroke-opacity", 0.2);
    
    xAxis.append("text")
      .attr("x", width / 2)
      .attr("y", 50)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text(relationships[activeRelationship].xLabel);
    
    const yAxis = g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickSize(-width + margin.left + margin.right).tickPadding(10));
    
    yAxis.selectAll("text")
      .attr("fill", "#f3f4f6");
    
    yAxis.selectAll(".tick line")
      .attr("stroke", "#374151")
      .attr("stroke-opacity", 0.2);
    
    yAxis.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -70)
      .attr("x", -height / 2)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text(relationships[activeRelationship].yLabel);
    
    // Draw relationship curve with animation
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    const path = g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", relationships[activeRelationship].color)
      .attr("stroke-width", 3)
      .attr("d", line)
      .attr("clip-path", "url(#chart-area-clip)");
    
    // Animate path drawing
    setAnimating(true);
    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1500)
      .attr("stroke-dashoffset", 0)
      .on("end", () => setAnimating(false));
    
    // Add data points with clipping
    const pointsGroup = g.append("g")
      .attr("clip-path", "url(#chart-area-clip)");
    
    pointsGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", 4)
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("fill", relationships[activeRelationship].color)
      .attr("stroke", "#f3f4f6")
      .attr("stroke-width", 1)
      .attr("opacity", 0)
      .transition()
      .delay((d, i) => 1500 + i * 50)
      .duration(300)
      .attr("opacity", 0.8);
    
    // Add interactive hover effects
    const focus = g.append("g")
      .attr("opacity", 0);
    
    focus.append("circle")
      .attr("r", 6)
      .attr("fill", relationships[activeRelationship].color)
      .attr("stroke", "white")
      .attr("stroke-width", 2);
    
    const tooltip = focus.append("g");
    
    tooltip.append("rect")
      .attr("x", -50)
      .attr("y", -35)
      .attr("width", 100)
      .attr("height", 30)
      .attr("fill", "rgba(0,0,0,0.9)")
      .attr("rx", 5);
    
    tooltip.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -20)
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("class", "font-mono");
    
    tooltip.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -8)
      .attr("fill", relationships[activeRelationship].color)
      .attr("font-size", "10px");
    
    // Create invisible overlay for mouse tracking
    g.append("rect")
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("fill", "transparent")
      .on("mousemove", mousemove)
      .on("mouseout", () => {
        focus.attr("opacity", 0);
        setHoveredPoint(null);
      });
    
    function mousemove(event) {
      const [mouseX] = d3.pointer(event);
      // Fix: don't add margin.left when inverting - mouseX is already relative to the SVG
      let x = xScale.invert(mouseX);
      
      // Clamp x to the domain bounds for each relationship type
      if (activeRelationship === 'n-E') {
        x = Math.max(1, Math.min(5, x)); // Domain: [1, 5]
      } else if (activeRelationship === 'n-sigma') {
        x = Math.max(5, Math.min(30, x)); // Domain: [5, 30]
      } else {
        x = Math.max(90, Math.min(99, x)); // Domain: [90, 99]
      }
      
      let y;
      if (activeRelationship === 'n-E') {
        y = Math.pow((1.96 * 15) / x, 2);
      } else if (activeRelationship === 'n-sigma') {
        y = Math.pow((1.96 * x) / 2, 2);
      } else {
        y = Math.pow((getZ(Math.round(x)) * 15) / 2, 2);
      }
      
      // Get the actual y-axis domain max from the current scale
      const yDomainMax = yScale.domain()[1];
      
      // Only show hover if y is within the valid range
      if (y > 0 && y <= yDomainMax) {
        focus.attr("opacity", 1)
          .attr("transform", `translate(${xScale(x)},${yScale(y)})`);
        
        focus.select("text:first-of-type")
          .text(`n = ${Math.round(y)}`);
        
        focus.select("text:last-of-type")
          .text(`${relationships[activeRelationship].xLabel.split(' ')[0]} = ${x.toFixed(1)}`);
        
        setHoveredPoint({ x, y });
      } else {
        // Hide the hover if outside bounds
        focus.attr("opacity", 0);
        setHoveredPoint(null);
      }
    }
    
  }, [activeRelationship]);
  
  // Mark as complete after exploring all relationships
  useEffect(() => {
    const explored = new Set(['n-E', 'n-sigma', 'n-confidence']);
    if (explored.has(activeRelationship)) {
      explored.delete(activeRelationship);
    }
    if (explored.size === 0 && onComplete) {
      onComplete('visual-exploration');
    }
  }, [activeRelationship, onComplete]);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">
          How Sample Size Depends on Your Requirements
        </h3>
        <p className="text-neutral-400">
          Explore the fundamental relationships that drive sample size
        </p>
      </div>
      
      {/* Relationship Selector */}
      <div className="flex gap-3 justify-center">
        {Object.entries(relationships).map(([key, rel]) => (
          <button
            key={key}
            onClick={() => setActiveRelationship(key)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeRelationship === key
                ? 'text-white shadow-lg'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
            style={{
              backgroundColor: activeRelationship === key ? rel.color : undefined
            }}
            disabled={animating}
          >
            {rel.title.split(' vs. ')[1]}
          </button>
        ))}
      </div>
      
      {/* Visualization */}
      <div className="rounded-xl p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h4 className="text-lg font-semibold text-white">
              {relationships[activeRelationship].title}
            </h4>
            <p className="text-sm text-neutral-400 mt-1">
              {relationships[activeRelationship].description}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-400">Relationship</p>
            <p className="font-mono text-lg" style={{ 
              color: relationships[activeRelationship].color 
            }}>
              {relationships[activeRelationship].formula}
            </p>
          </div>
        </div>
        
        <GraphContainer height="450px">
          <svg ref={svgRef} width="100%" height="100%" />
        </GraphContainer>
        
        {/* Key Insights */}
        <div 
          className="mt-4 p-4 bg-neutral-900/50 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {activeRelationship === 'n-E' && (
            <div className="space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Halving the margin of error quadruples the sample size</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>E = 2 → n ≈ 217, but E = 1 → n ≈ 865</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Diminishing returns: precision gets expensive!</span>
              </p>
            </div>
          )}
          {activeRelationship === 'n-sigma' && (
            <div className="space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>Doubling σ quadruples the required sample size</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>More homogeneous populations are easier to study</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>Consider stratification for highly variable populations</span>
              </p>
            </div>
          )}
          {activeRelationship === 'n-confidence' && (
            <div className="space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>90% → 95% confidence: n increases by 35%</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>95% → 99% confidence: n increases by 73%</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>Common choice: 95% balances confidence and cost</span>
              </p>
            </div>
          )}
        </div>
        
        {/* Current hover information */}
        {hoveredPoint && (
          <div
            className="mt-4 p-3 bg-neutral-900 rounded-lg text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-neutral-400">
              At this point: Sample size n = {Math.round(hoveredPoint.y)} 
              {activeRelationship === 'n-E' && ` for E = ${hoveredPoint.x.toFixed(1)}`}
              {activeRelationship === 'n-sigma' && ` for σ = ${hoveredPoint.x.toFixed(1)}`}
              {activeRelationship === 'n-confidence' && ` for ${Math.round(hoveredPoint.x)}% confidence`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

// Quick Reference Card Component
const QuickReferenceCard = React.memo(function QuickReferenceCard() {
  const contentRef = useRef(null);
  const [activeTab, setActiveTab] = useState('z-values');
  
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
  }, [activeTab]);
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-700/50">
      <h3 className={`${typography.h2} mb-4`}>
        Quick Reference Guide
      </h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('z-values')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'z-values'
              ? 'bg-purple-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
        >
          Common z-values
        </button>
        <button
          onClick={() => setActiveTab('formulas')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'formulas'
              ? 'bg-purple-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
        >
          Formula Variations
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'checklist'
              ? 'bg-purple-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
        >
          Decision Checklist
        </button>
      </div>
      
      <div ref={contentRef}>
        {activeTab === 'z-values' && (
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3">Common Critical Values</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-2 text-neutral-400">Confidence Level</th>
                  <th className="text-center py-2 text-neutral-400">α</th>
                  <th className="text-center py-2 text-neutral-400">z<sub>α/2</sub></th>
                  <th className="text-right py-2 text-neutral-400">Memorize?</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-b border-neutral-800">
                  <td className="py-2">90%</td>
                  <td className="text-center">0.10</td>
                  <td className="text-center text-teal-400">1.645</td>
                  <td className="text-right text-green-400">✓</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="py-2">95%</td>
                  <td className="text-center">0.05</td>
                  <td className="text-center text-teal-400">1.960</td>
                  <td className="text-right text-green-400">✓✓</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="py-2">98%</td>
                  <td className="text-center">0.02</td>
                  <td className="text-center text-teal-400">2.326</td>
                  <td className="text-right">-</td>
                </tr>
                <tr>
                  <td className="py-2">99%</td>
                  <td className="text-center">0.01</td>
                  <td className="text-center text-teal-400">2.576</td>
                  <td className="text-right text-green-400">✓</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-neutral-500 mt-3">
              Tip: Remember 1.96 ≈ 2 for quick estimates
            </p>
          </div>
        )}
        
        {activeTab === 'formulas' && (
          <div className="space-y-4">
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <h5 className="font-semibold text-white mb-2">For Population Mean (σ known)</h5>
              <div className="text-center text-teal-300 py-2">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[n = \\left(\\frac{z_{\\alpha/2} \\times \\sigma}{E}\\right)^2\\]` 
                }} />
              </div>
            </div>
            
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <h5 className="font-semibold text-white mb-2">For Population Proportion</h5>
              <div className="text-center text-teal-300 py-2">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[n = \\left(\\frac{z_{\\alpha/2}}{E}\\right)^2 \\times p(1-p)\\]` 
                }} />
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Use p = 0.5 if unknown (conservative approach)
              </p>
            </div>
            
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <h5 className="font-semibold text-white mb-2">Finite Population Correction</h5>
              <div className="text-center text-teal-300 py-2">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[n_{\\text{adjusted}} = \\frac{n}{1 + \\frac{n-1}{N}}\\]` 
                }} />
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Use when n/N {'>'} 0.05
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'checklist' && (
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3">Sample Size Decision Flowchart</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center flex-shrink-0">1</div>
                <div>
                  <p className="font-medium text-white">Identify the parameter</p>
                  <p className="text-neutral-400">Mean? Proportion? Difference?</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center flex-shrink-0">2</div>
                <div>
                  <p className="font-medium text-white">Is σ known?</p>
                  <p className="text-neutral-400">Yes → Use z | No → Use t (need pilot study)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center flex-shrink-0">3</div>
                <div>
                  <p className="font-medium text-white">Set requirements</p>
                  <p className="text-neutral-400">E (precision), confidence level, σ estimate</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center flex-shrink-0">4</div>
                <div>
                  <p className="font-medium text-white">Calculate n</p>
                  <p className="text-neutral-400">ALWAYS round UP!</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center flex-shrink-0">5</div>
                <div>
                  <p className="font-medium text-white">Check feasibility</p>
                  <p className="text-neutral-400">Budget? Time? Add 10-20% for dropouts</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </VisualizationSection>
  );
});

// Interactive Formula Builder Component
const InteractiveFormulaBuilder = React.memo(function InteractiveFormulaBuilder({ onComplete }) {
  const contentRef = useRef(null);
  const [selectedParts, setSelectedParts] = useState({
    numerator: false,
    denominator: false,
    squared: false
  });
  const [understanding, setUnderstanding] = useState({
    z: false,
    sigma: false,
    E: false,
    squared: false
  });
  
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
  }, [selectedParts]);
  
  const allUnderstood = Object.values(understanding).every(v => v);
  
  useEffect(() => {
    if (allUnderstood && onComplete) {
      onComplete('formula-builder');
    }
  }, [allUnderstood, onComplete]);
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-6 border border-purple-700/50">
      <div ref={contentRef}>
        <h3 className="text-xl font-bold text-purple-400 mb-6">
          Build the Formula Step by Step
        </h3>
        
        <div className="text-center mb-8">
          <p className="text-neutral-300 mb-4">
            Click on each part to understand why it's in the formula
          </p>
          
          {/* Interactive Formula Display */}
          <div className="text-4xl font-mono inline-flex items-center gap-2">
            <span className="text-neutral-500">n =</span>
            
            {/* Opening parenthesis */}
            <span
              className={`cursor-pointer transition-all hover:scale-125 hover:text-white active:scale-90 transform ${
                selectedParts.squared ? 'text-purple-400' : 'text-neutral-500'
              }`}
              onClick={() => setSelectedParts({...selectedParts, squared: !selectedParts.squared})}
            >
              (
            </span>
            
            {/* Fraction */}
            <div className="inline-flex flex-col items-center">
              {/* Numerator */}
              <div className="flex items-center gap-1">
                <span 
                  className={`cursor-pointer transition-all hover:scale-125 hover:text-white active:scale-90 transform ${
                    understanding.z ? 'text-green-400' : 
                    selectedParts.numerator ? 'text-blue-400' : 'text-neutral-400'
                  }`}
                  onClick={() => {
                    setSelectedParts({...selectedParts, numerator: !selectedParts.numerator});
                    setUnderstanding({...understanding, z: true});
                  }}
                >
                  z
                </span>
                <span 
                  className={`cursor-pointer transition-all hover:scale-125 hover:text-white active:scale-90 transform text-xs ${
                    understanding.z ? 'text-green-400' : 
                    selectedParts.numerator ? 'text-blue-400' : 'text-neutral-400'
                  }`}
                  onClick={() => {
                    setSelectedParts({...selectedParts, numerator: !selectedParts.numerator});
                    setUnderstanding({...understanding, z: true});
                  }}
                >
                  α/2
                </span>
                <span className="text-neutral-400">×</span>
                <span 
                  className={`cursor-pointer transition-all hover:scale-125 hover:text-white active:scale-90 transform ${
                    understanding.sigma ? 'text-green-400' : 
                    selectedParts.numerator ? 'text-blue-400' : 'text-neutral-400'
                  }`}
                  onClick={() => {
                    setSelectedParts({...selectedParts, numerator: !selectedParts.numerator});
                    setUnderstanding({...understanding, sigma: true});
                  }}
                >
                  σ
                </span>
              </div>
              
              {/* Fraction bar */}
              <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
              
              {/* Denominator */}
              <div>
                <span 
                  className={`cursor-pointer transition-all hover:scale-125 hover:text-white active:scale-90 transform ${
                    understanding.E ? 'text-green-400' : 
                    selectedParts.denominator ? 'text-yellow-400' : 'text-neutral-400'
                  }`}
                  onClick={() => {
                    setSelectedParts({...selectedParts, denominator: !selectedParts.denominator});
                    setUnderstanding({...understanding, E: true});
                  }}
                >
                  E
                </span>
              </div>
            </div>
            
            {/* Closing parenthesis and square */}
            <span
              className={`cursor-pointer transition-all hover:scale-125 hover:text-white active:scale-90 transform ${
                selectedParts.squared ? 'text-purple-400' : 'text-neutral-500'
              }`}
              onClick={() => {
                setSelectedParts({...selectedParts, squared: !selectedParts.squared});
                setUnderstanding({...understanding, squared: true});
              }}
            >
              )²
            </span>
          </div>
        </div>
        
        {/* Explanations */}
        <div>
          {selectedParts.numerator && (
            <div
              key="numerator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-blue-900/20 rounded-lg p-4 mb-4 border border-blue-500/30"
            >
              <h5 className="font-semibold text-blue-400 mb-2">Why z × σ?</h5>
              <p className="text-sm text-neutral-300">
                This represents how many standard errors we need to capture for our confidence level. 
                The z-value (like 1.96 for 95%) tells us how many standard deviations, and σ is the population 
                standard deviation. Together they give us the "margin" we need.
              </p>
              <div className="mt-3 text-center">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[\\text{Margin} = z_{\\alpha/2} \\times \\text{Standard Error}\\]` 
                }} />
              </div>
            </div>
          )}
          
          {selectedParts.denominator && (
            <div
              key="denominator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-yellow-900/20 rounded-lg p-4 mb-4 border border-yellow-500/30"
            >
              <h5 className="font-semibold text-yellow-400 mb-2">Why divide by E?</h5>
              <p className="text-sm text-neutral-300">
                E is our desired margin of error - how close we want to be to the true value. 
                Smaller E means we need more precision, which requires a larger sample size. 
                Think of it like zoom: to see finer details (smaller E), you need more data points.
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                If E = 1, we're okay being ±1 unit off. If E = 0.1, we want to be ±0.1 units off (10× more precise!).
              </p>
            </div>
          )}
          
          {selectedParts.squared && (
            <div
              key="squared"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-purple-900/20 rounded-lg p-4 mb-4 border border-purple-500/30"
            >
              <h5 className="font-semibold text-purple-400 mb-2">Why squared?</h5>
              <p className="text-sm text-neutral-300">
                Remember that standard error = σ/√n. When we solve for n, we need to square both sides 
                to eliminate the square root. This creates the quadratic relationship: halving the error 
                quadruples the sample size!
              </p>
              <div className="mt-3 text-center text-sm">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[E = \\frac{z \\times \\sigma}{\\sqrt{n}} \\Rightarrow \\sqrt{n} = \\frac{z \\times \\sigma}{E} \\Rightarrow n = \\left(\\frac{z \\times \\sigma}{E}\\right)^2\\]` 
                }} />
              </div>
            </div>
          )}
        </div>
        
        {/* Understanding Progress */}
        <div className="mt-6 bg-neutral-800/50 rounded-lg p-4">
          <h5 className="font-semibold text-white mb-3">Your Understanding</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(understanding).map(([key, understood]) => (
              <div 
                key={key}
                className={`p-3 rounded-lg text-center transition-all ${
                  understood 
                    ? 'bg-green-900/30 border border-green-500/50' 
                    : 'bg-neutral-700/50 border border-neutral-600'
                }`}
              >
                <p className="text-sm font-medium">
                  {key === 'z' && 'Critical Value (z)'}
                  {key === 'sigma' && 'Std Dev (σ)'}
                  {key === 'E' && 'Margin of Error (E)'}
                  {key === 'squared' && 'Why Squared'}
                </p>
                {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
              </div>
            ))}
          </div>
          
          {allUnderstood && (
            <p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-green-400 mt-4 font-medium"
            >
              Great! You understand all parts of the formula! 🎉
            </p>
          )}
        </div>
        
        {/* Quick tip */}
        <div className="mt-4 p-3 bg-purple-900/10 rounded-lg border border-purple-700/30">
          <p className="text-sm text-purple-300">
            <strong>Exam Tip:</strong> Remember this as "confidence × variability ÷ precision, all squared"
          </p>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Exam Practice Problems Component
const ExamPracticeProblems = React.memo(function ExamPracticeProblems({ onComplete }) {
  const contentRef = useRef(null);
  const [selectedProblem, setSelectedProblem] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  
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
  }, [selectedProblem, showSolution]);
  
  const problems = [
    {
      id: 1,
      title: "Quality Control Problem",
      question: "A manufacturer wants to estimate the mean weight of gear wheels with a margin of error of 0.5 grams at 95% confidence. From past data, σ = 2.3 grams. What sample size is needed?",
      answer: 82,
      solution: {
        steps: [
          "Given: E = 0.5, σ = 2.3, confidence = 95%",
          "For 95% confidence: z₀.₀₂₅ = 1.96",
          "n = (z × σ / E)² = (1.96 × 2.3 / 0.5)²",
          "n = (9.016)² = 81.29",
          "Round up: n = 82"
        ],
        trap: "Always round UP for sample size!"
      }
    },
    {
      id: 2,
      title: "Clinical Trial Problem",
      question: "A researcher needs to detect a 2 mmHg change in blood pressure with 99% confidence. Previous studies show σ = 8 mmHg. Find the required sample size.",
      answer: 107,
      solution: {
        steps: [
          "Given: E = 2, σ = 8, confidence = 99%",
          "For 99% confidence: z₀.₀₀₅ = 2.576",
          "n = (2.576 × 8 / 2)²",
          "n = (10.304)² = 106.17",
          "Round up: n = 107"
        ],
        trap: "99% confidence uses z = 2.576, not 2.58!"
      }
    },
    {
      id: 3,
      title: "Budget Constraint Problem",
      question: "You have budget for n = 100 subjects. With σ = 15 and 95% confidence, what margin of error can you achieve?",
      answer: 2.94,
      solution: {
        steps: [
          "Rearrange formula to solve for E",
          "E = z × σ / √n",
          "E = 1.96 × 15 / √100",
          "E = 29.4 / 10 = 2.94",
          "You can achieve ±2.94 margin of error"
        ],
        trap: "This is a 'reverse' problem - solve for E, not n"
      }
    }
  ];
  
  const currentProblem = problems[selectedProblem];
  
  const checkAnswer = () => {
    const userNum = parseFloat(userAnswer);
    const correct = Math.abs(userNum - currentProblem.answer) < 0.01;
    setFeedback({
      correct,
      message: correct 
        ? "Correct! Well done." 
        : `Not quite. The answer is ${currentProblem.answer}. ${currentProblem.solution.trap}`
    });
    if (correct && onComplete) {
      onComplete('exam-practice');
    }
  };
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-purple-400 mb-6">
        Exam-Style Practice Problems
      </h3>
      
      {/* Problem Selector */}
      <div className="flex gap-2 mb-6">
        {problems.map((prob, idx) => (
          <button
            key={prob.id}
            onClick={() => {
              setSelectedProblem(idx);
              setShowSolution(false);
              setUserAnswer('');
              setFeedback(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedProblem === idx
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            Problem {prob.id}
          </button>
        ))}
      </div>
      
      <div ref={contentRef} className="space-y-6">
        {/* Problem Statement */}
        <div className="bg-neutral-800/50 rounded-lg p-6">
          <h4 className="font-semibold text-white mb-3">
            {currentProblem.title}
          </h4>
          <p className="text-neutral-300 mb-4">
            {currentProblem.question}
          </p>
          
          {/* Answer Input */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm text-neutral-400 mb-2">
                Your Answer:
              </label>
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-700 rounded-lg text-white font-mono"
                placeholder="Enter your answer"
                step="0.01"
              />
            </div>
            <button
              onClick={checkAnswer}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium"
              disabled={!userAnswer}
            >
              Check Answer
            </button>
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white"
            >
              {showSolution ? 'Hide' : 'Show'} Solution
            </button>
          </div>
          
          {/* Feedback */}
          {feedback && (
            <div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-lg ${
                feedback.correct
                  ? 'bg-green-900/30 border border-green-500/50 text-green-400'
                  : 'bg-red-900/30 border border-red-500/50 text-red-400'
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>
        
        {/* Solution */}
        <div>
          {showSolution && (
            <div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-purple-900/20 rounded-lg p-6 border border-purple-500/30"
            >
              <h5 className="font-semibold text-purple-400 mb-4">
                Step-by-Step Solution
              </h5>
              <div className="space-y-2">
                {currentProblem.solution.steps.map((step, idx) => (
                  <div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-3"
                  >
                    <span className="text-purple-400 font-mono">{idx + 1}.</span>
                    <span className="text-neutral-300 font-mono text-sm">{step}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-yellow-900/20 rounded border border-yellow-600/30">
                <p className="text-sm text-yellow-400">
                  <strong>Common Trap:</strong> {currentProblem.solution.trap}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </VisualizationSection>
  );
});

// Sample Size Calculator Component
const SampleSizeCalculator = React.memo(function SampleSizeCalculator({ onComplete, onSaveCalculation }) {
  const [mode, setMode] = useState('calculate'); // calculate, explore
  const [inputs, setInputs] = useState({
    sigma: 15,
    E: 2,
    confidence: 95
  });
  
  const [showDerivation, setShowDerivation] = useState(false);
  const [compareExamples, setCompareExamples] = useState(false);
  const [savedResults, setSavedResults] = useState([]);
  
  // Example cases
  const exampleCases = [
    { id: 1, sigma: 15, E: 2, confidence: 95, n: 217, description: "Standard case" },
    { id: 2, sigma: 3, E: 0.5, confidence: 95, n: 139, description: "Low variability" },
    { id: 3, sigma: 15, E: 2, confidence: 90, n: 153, description: "Lower confidence" },
    { id: 4, sigma: 15, E: 1, confidence: 95, n: 865, description: "High precision" }
  ];
  
  // Calculate z-value based on confidence
  const getZ = (confidence) => {
    const zValues = {
      90: 1.645,
      95: 1.960,
      98: 2.326,
      99: 2.576
    };
    return zValues[confidence] || 1.960;
  };
  
  // Calculate sample size
  const calculateN = useCallback((sigma, E, confidence) => {
    const z = getZ(confidence);
    return Math.ceil(Math.pow((z * sigma) / E, 2));
  }, []);
  
  const n = useMemo(() => 
    calculateN(inputs.sigma, inputs.E, inputs.confidence), 
    [inputs, calculateN]
  );
  
  // Save calculation
  const handleSaveCalculation = () => {
    const newCalc = {
      ...inputs,
      n,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    setSavedResults([...savedResults, newCalc]);
    if (onSaveCalculation) {
      onSaveCalculation(newCalc);
    }
    if (onComplete && savedResults.length === 0) {
      onComplete('calculator-used');
    }
  };
  
  return (
    <VisualizationSection>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">
          Sample Size Calculator
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('calculate')}
            className={`px-4 py-2 rounded transition-all ${
              mode === 'calculate' 
                ? 'bg-purple-600 text-white' 
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            Calculate
          </button>
          <button
            onClick={() => setMode('explore')}
            className={`px-4 py-2 rounded transition-all ${
              mode === 'explore' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            Explore
          </button>
        </div>
      </div>
      
      {mode === 'calculate' ? (
        <div className="space-y-6">
          {/* Input Controls */}
          <div className="grid md:grid-cols-3 gap-6">
            <ControlGroup label="Population SD (σ)">
              <input
                type="number"
                value={inputs.sigma}
                onChange={(e) => setInputs({...inputs, sigma: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white font-mono"
                min="0.1"
                step="0.1"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Known or estimated from pilot study
              </p>
            </ControlGroup>
            
            <ControlGroup label="Margin of Error (E)">
              <input
                type="number"
                value={inputs.E}
                onChange={(e) => setInputs({...inputs, E: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white font-mono"
                min="0.1"
                step="0.1"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Maximum acceptable error
              </p>
            </ControlGroup>
            
            <ControlGroup label="Confidence Level">
              <select
                value={inputs.confidence}
                onChange={(e) => setInputs({...inputs, confidence: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white font-mono"
              >
                <option value={90}>90%</option>
                <option value={95}>95%</option>
                <option value={98}>98%</option>
                <option value={99}>99%</option>
              </select>
              <p className="text-xs text-neutral-500 mt-1">
                Typically 95%
              </p>
            </ControlGroup>
          </div>
          
          {/* Results */}
          <div
            className="bg-gradient-to-br from-purple-900/20 to-neutral-800 
                       rounded-xl p-6 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={n} // Re-animate on change
          >
            <p className="text-sm text-neutral-400 mb-2">Required Sample Size</p>
            <p className="text-5xl font-bold text-purple-400 mb-4 font-mono">n = {n}</p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDerivation(!showDerivation)}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                {showDerivation ? 'Hide' : 'Show'} Calculation
              </button>
              <button
                onClick={handleSaveCalculation}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Save Result
              </button>
            </div>
            
            <div>
              {showDerivation && (
                <div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 text-left bg-neutral-900/50 rounded-lg p-4"
                >
                  <p className="text-sm mb-3 text-neutral-300">Step-by-step calculation:</p>
                  <div className="space-y-2 font-mono text-sm">
                    <p className="flex items-center gap-2">
                      <span className="text-neutral-500">1.</span>
                      <span dangerouslySetInnerHTML={{ 
                        __html: '\\(z_{' + inputs.confidence + '\\%} = ' + getZ(inputs.confidence) + '\\)' 
                      }} />
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-neutral-500">2.</span>
                      <span dangerouslySetInnerHTML={{ 
                        __html: '\\(n = \\left(\\frac{z \\times \\sigma}{E}\\right)^2\\)' 
                      }} />
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-neutral-500">3.</span>
                      <span dangerouslySetInnerHTML={{ 
                        __html: '\\(n = \\left(\\frac{' + getZ(inputs.confidence) + ' \\times ' + inputs.sigma + '}{' + inputs.E + '}\\right)^2\\)' 
                      }} />
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-neutral-500">4.</span>
                      <span dangerouslySetInnerHTML={{ 
                        __html: '\\(n = \\left(\\frac{' + (getZ(inputs.confidence) * inputs.sigma).toFixed(2) + '}{' + inputs.E + '}\\right)^2\\)' 
                      }} />
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-neutral-500">5.</span>
                      <span>{`n = ${Math.pow((getZ(inputs.confidence) * inputs.sigma) / inputs.E, 2).toFixed(2)}`}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-neutral-500">6.</span>
                      <span className="text-purple-400">{`n = ${n} (rounded up)`}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Compare with Course Examples */}
          <div>
            <button
              onClick={() => setCompareExamples(!compareExamples)}
              className="mb-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              {compareExamples ? 'Hide' : 'Compare with'} Course Examples
            </button>
            
            <div>
              {compareExamples && (
                <div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid md:grid-cols-2 gap-4"
                >
                  {exampleCases.map((ex, index) => (
                    <div
                      key={ex.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-neutral-800 rounded-lg p-4 cursor-pointer
                                 hover:bg-neutral-700 transition-all hover:scale-[1.02]"
                      onClick={() => setInputs({
                        sigma: ex.sigma,
                        E: ex.E,
                        confidence: ex.confidence
                      })}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-neutral-400">Example {ex.id}: {ex.description}</p>
                          <p className="text-xs mt-1 font-mono">
                            σ = {ex.sigma}, E = {ex.E}, {ex.confidence}% CI
                          </p>
                        </div>
                        <p className="text-xl font-mono text-emerald-400">
                          n = {ex.n}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Saved Results */}
          {savedResults.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-neutral-400 mb-3">Saved Calculations</h4>
              <div className="space-y-2">
                {savedResults.map((result, index) => (
                  <div
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-neutral-800/50 rounded p-3 flex justify-between items-center"
                  >
                    <span className="text-sm font-mono">
                      σ={result.sigma}, E={result.E}, {result.confidence}% → n={result.n}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <ExplorationMode 
          inputs={inputs} 
          setInputs={setInputs} 
          calculateN={calculateN}
          getZ={getZ}
        />
      )}
    </VisualizationSection>
  );
});

// Exploration Mode Component
const ExplorationMode = React.memo(function ExplorationMode({ inputs, setInputs, calculateN, getZ }) {
  const [parameter, setParameter] = useState('E'); // E, sigma, confidence
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 600;
    const height = 300;
    const margin = { top: 40, right: 60, bottom: 60, left: 80 }; // Better margins for chart visibility
    
    svg.selectAll("*").remove();
    
    // Generate data based on parameter
    let data = [];
    let xScale, yScale, xLabel;
    
    if (parameter === 'E') {
      data = d3.range(0.5, 5.1, 0.1).map(E => ({
        x: E,
        y: calculateN(inputs.sigma, E, inputs.confidence)
      }));
      xScale = d3.scaleLinear()
        .domain([0.5, 5])
        .range([margin.left, width - margin.right]);
      xLabel = "Margin of Error (E)";
    } else if (parameter === 'sigma') {
      data = d3.range(5, 30.5, 0.5).map(sigma => ({
        x: sigma,
        y: calculateN(sigma, inputs.E, inputs.confidence)
      }));
      xScale = d3.scaleLinear()
        .domain([5, 30])
        .range([margin.left, width - margin.right]);
      xLabel = "Standard Deviation (σ)";
    } else {
      data = [90, 92, 94, 95, 96, 97, 98, 99].map(conf => ({
        x: conf,
        y: calculateN(inputs.sigma, inputs.E, conf)
      }));
      xScale = d3.scaleLinear()
        .domain([90, 99])
        .range([margin.left, width - margin.right]);
      xLabel = "Confidence Level (%)";
    }
    
    yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y) * 1.1])
      .range([height - margin.bottom, margin.top]);
    
    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Add axis labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text(xLabel);
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text("Sample Size (n)");
    
    // Draw line
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#14b8a6")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Add current point
    const currentX = parameter === 'E' ? inputs.E : 
                    parameter === 'sigma' ? inputs.sigma : 
                    inputs.confidence;
    const currentY = calculateN(inputs.sigma, inputs.E, inputs.confidence);
    
    svg.append("circle")
      .attr("cx", xScale(currentX))
      .attr("cy", yScale(currentY))
      .attr("r", 6)
      .attr("fill", "#10b981")
      .attr("stroke", "white")
      .attr("stroke-width", 2);
    
  }, [parameter, inputs, calculateN]);
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center mb-4">
        {['E', 'sigma', 'confidence'].map(param => (
          <button
            key={param}
            onClick={() => setParameter(param)}
            className={`px-4 py-2 rounded transition-all ${
              parameter === param
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            Vary {param === 'E' ? 'Error' : param === 'sigma' ? 'Std Dev' : 'Confidence'}
          </button>
        ))}
      </div>
      
      <GraphContainer height="300px">
        <svg ref={svgRef} width="100%" height="100%" />
      </GraphContainer>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-neutral-800 rounded p-3">
          <p className="text-xs text-neutral-400">Current σ</p>
          <p className="font-mono text-lg">{inputs.sigma}</p>
        </div>
        <div className="bg-neutral-800 rounded p-3">
          <p className="text-xs text-neutral-400">Current E</p>
          <p className="font-mono text-lg">{inputs.E}</p>
        </div>
        <div className="bg-neutral-800 rounded p-3">
          <p className="text-xs text-neutral-400">Current CI</p>
          <p className="font-mono text-lg">{inputs.confidence}%</p>
        </div>
      </div>
    </div>
  );
});

// Mathematical Framework Component for Budget Constraints
const MathematicalFramework = React.memo(function MathematicalFramework() {
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
    <div ref={contentRef} className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 mb-6 border border-blue-700/30">
      <h4 className="text-lg font-bold text-white mb-4">Mathematical Framework: Cost-Constrained Optimization</h4>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h5 className="text-emerald-400 font-semibold mb-2">The Optimization Problem</h5>
          <div className="bg-neutral-900/50 rounded p-3 space-y-2">
            <p className="text-sm text-neutral-300 mb-2">Minimize margin of error E subject to:</p>
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[n = \\left(\\frac{z_{\\alpha/2} \\cdot \\sigma}{E}\\right)^2\\]` 
            }} />
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[TC(n) = F + cn \\leq B\\]` 
            }} />
            <div className="text-xs text-neutral-400 mt-2">
              where F = fixed costs, c = cost per subject, B = budget
            </div>
          </div>
        </div>
        
        <div>
          <h5 className="text-purple-400 font-semibold mb-2">The Solution</h5>
          <div className="bg-neutral-900/50 rounded p-3 space-y-2">
            <p className="text-sm text-neutral-300 mb-2">Maximum affordable sample size:</p>
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[n_{max} = \\frac{B - F}{c}\\]` 
            }} />
            <p className="text-sm text-neutral-300 mt-2 mb-1">Minimum achievable error:</p>
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[E_{min} = \\frac{z_{\\alpha/2} \\cdot \\sigma}{\\sqrt{n_{max}}}\\]` 
            }} />
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-yellow-900/20 rounded p-3 border border-yellow-700/30">
        <p className="text-sm text-yellow-300">
          <strong>Key Insight:</strong> The relationship E ∝ 1/√n means doubling precision (halving E) requires 4× the sample size and roughly 4× the variable costs.
        </p>
      </div>
    </div>
  );
});

// Live Calculations Component
const LiveCalculations = React.memo(function LiveCalculations({ scenario, optimalPoint }) {
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
  }, [scenario, optimalPoint]);
  
  const maxN = Math.floor((scenario.budgetLimit - scenario.fixedCosts) / scenario.costPerSubject);
  const minE = maxN > 0 ? (1.96 * scenario.sigma) / Math.sqrt(maxN) : Infinity;
  
  return (
    <div ref={contentRef} className="bg-neutral-800/50 rounded-lg p-4">
      <h5 className="font-semibold text-amber-400 mb-3">Live Calculations</h5>
      
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <p className="text-neutral-400">Available for subjects:</p>
          <div className="font-mono text-white bg-neutral-900/50 rounded p-2">
            ${scenario.budgetLimit.toLocaleString()} - ${scenario.fixedCosts.toLocaleString()} = ${(scenario.budgetLimit - scenario.fixedCosts).toLocaleString()}
          </div>
          
          <p className="text-neutral-400 mt-3">Maximum sample size:</p>
          <div className="bg-neutral-900/50 rounded p-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\(n_{max} = \\frac{${(scenario.budgetLimit - scenario.fixedCosts).toLocaleString()}}{${scenario.costPerSubject}} = ${maxN}\\)` 
            }} />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-neutral-400">Minimum achievable error:</p>
          <div className="bg-neutral-900/50 rounded p-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\(E_{min} = \\frac{1.96 \\times ${scenario.sigma}}{\\sqrt{${maxN}}} = ${minE.toFixed(2)}\\)` 
            }} />
          </div>
          
          {optimalPoint && (
            <>
              <p className="text-neutral-400 mt-3">Cost efficiency:</p>
              <div className="font-mono text-emerald-400 bg-neutral-900/50 rounded p-2">
                ${(optimalPoint.cost / optimalPoint.n).toFixed(2)} per unit precision
              </div>
            </>
          )}
        </div>
      </div>
      
      {maxN < 30 && (
        <div className="mt-3 bg-red-900/20 rounded p-2 border border-red-700/30">
          <p className="text-xs text-red-300">
            ⚠️ Sample size {maxN} may be too small for reliable estimates (typically need n ≥ 30)
          </p>
        </div>
      )}
    </div>
  );
});

// Cost-Benefit Analysis Component
const CostBenefitAnalysis = React.memo(function CostBenefitAnalysis({ onComplete }) {
  const [scenario, setScenario] = useState({
    costPerSubject: 100,
    fixedCosts: 5000,
    sigma: 15,
    budgetLimit: 55000,
    minPrecision: 0.5,
    maxPrecision: 3
  });
  
  const [optimalPoint, setOptimalPoint] = useState(null);
  const svgRef = useRef(null);
  
  // Calculate total cost for given n
  const calculateCost = useCallback((n) => {
    return scenario.fixedCosts + (n * scenario.costPerSubject);
  }, [scenario]);
  
  // Calculate precision (E) for given n
  const calculatePrecision = useCallback((n) => {
    const z = 1.96; // 95% confidence
    return (z * scenario.sigma) / Math.sqrt(n);
  }, [scenario.sigma]);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 800;
    const height = 500;
    const margin = { top: 60, right: 140, bottom: 100, left: 120 }; // Enhanced spacing for cost analysis
    
    svg.selectAll("*").remove();
    
    // Generate data points with finer granularity for smooth curve
    const data = [];
    const step = (scenario.maxPrecision - scenario.minPrecision) / 50; // 50 points for smooth curve
    for (let E = scenario.minPrecision; E <= scenario.maxPrecision; E += step) {
      const n = Math.ceil(Math.pow((1.96 * scenario.sigma) / E, 2));
      const cost = calculateCost(n);
      if (cost <= scenario.budgetLimit * 1.5) { // Only include reasonable costs
        data.push({ E, n, cost });
      }
    }
    
    // Filter data within budget
    const affordableData = data.filter(d => d.cost <= scenario.budgetLimit);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([scenario.minPrecision, scenario.maxPrecision])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0, scenario.budgetLimit * 1.1])
      .range([height - margin.bottom, margin.top]);
    
    // Create main group
    const g = svg.append("g");
    
    // Add gradient and clipPath
    const defs = svg.append("defs");
    
    // Add clipPath to constrain chart within axes
    const clipPath = defs.append("clipPath")
      .attr("id", "cost-chart-clip");
    
    clipPath.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom);
    
    const gradient = defs.append("linearGradient")
      .attr("id", "cost-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", margin.left)
      .attr("y1", yScale(0))
      .attr("x2", margin.left)
      .attr("y2", yScale(scenario.budgetLimit));
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0.2);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ef4444")
      .attr("stop-opacity", 0.2);
    
    // Axes
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickSize(-height + margin.top + margin.bottom).tickPadding(10));
    
    xAxis.selectAll("text")
      .attr("fill", "#f3f4f6");
    
    xAxis.selectAll(".tick line")
      .attr("stroke", "#374151")
      .attr("stroke-opacity", 0.3);
    
    xAxis.append("text")
      .attr("x", width / 2)
      .attr("y", 50)
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Margin of Error (E)");
    
    const yAxis = g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => `$${d/1000}k`).tickSize(-width + margin.left + margin.right).tickPadding(10));
    
    yAxis.selectAll("text")
      .attr("fill", "#f3f4f6");
    
    yAxis.selectAll(".tick line")
      .attr("stroke", "#374151")
      .attr("stroke-opacity", 0.3);
    
    yAxis.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -70)
      .attr("x", -height / 2)
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Total Cost ($)");
    
    // Budget limit line
    g.append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", yScale(scenario.budgetLimit))
      .attr("y2", yScale(scenario.budgetLimit))
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2.5)
      .attr("stroke-dasharray", "8,4");
    
    g.append("text")
      .attr("x", width - margin.right + 10)
      .attr("y", yScale(scenario.budgetLimit))
      .attr("fill", "#ef4444")
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .attr("dominant-baseline", "middle")
      .text("Budget Limit");
    
    // Area under curve
    const area = d3.area()
      .x(d => xScale(d.E))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.cost))
      .curve(d3.curveBasis);
    
    g.append("path")
      .datum(data)
      .attr("fill", "url(#cost-gradient)")
      .attr("d", area)
      .attr("clip-path", "url(#cost-chart-clip)");
    
    // Cost curve
    const line = d3.line()
      .x(d => xScale(d.E))
      .y(d => yScale(d.cost))
      .curve(d3.curveBasis);
    
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 3)
      .attr("d", line)
      .attr("clip-path", "url(#cost-chart-clip)");
    
    // Find optimal point (smallest E within budget)
    if (affordableData.length > 0) {
      const optimal = affordableData[0]; // Smallest E is first
      setOptimalPoint(optimal);
      
      // Highlight optimal point
      g.append("circle")
        .attr("cx", xScale(optimal.E))
        .attr("cy", yScale(optimal.cost))
        .attr("r", 0)
        .attr("fill", "#10b981")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .transition()
        .duration(1000)
        .delay(500)
        .attr("r", 8);
      
      // Annotation with background
      const annotationGroup = g.append("g")
        .attr("transform", `translate(${xScale(optimal.E)}, ${yScale(optimal.cost)})`)
        .attr("opacity", 0);
      
      const annotationText = `Optimal: E=$${optimal.E.toFixed(1)}, n=${optimal.n}`;
      const textElement = annotationGroup.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("fill", "white")
        .attr("font-size", "14px")
        .attr("font-weight", "500")
        .text(annotationText);
      
      const bbox = textElement.node().getBBox();
      
      annotationGroup.insert("rect", "text")
        .attr("x", bbox.x - 8)
        .attr("y", bbox.y - 4)
        .attr("width", bbox.width + 16)
        .attr("height", bbox.height + 8)
        .attr("fill", "rgba(0,0,0,0.8)")
        .attr("rx", 4);
      
      // Position annotation to avoid overlap
      const annotationX = xScale(optimal.E) + 20;
      const annotationY = yScale(optimal.cost) - 20;
      
      annotationGroup
        .attr("transform", `translate(${annotationX}, ${annotationY})`)
        .transition()
        .duration(500)
        .delay(1500)
        .attr("opacity", 1);
    }
    
  }, [scenario, calculateCost]);
  
  // Mark complete after adjusting parameters
  useEffect(() => {
    if (scenario.costPerSubject !== 50 || scenario.budgetLimit !== 25000) {
      if (onComplete) onComplete('cost-benefit-explored');
    }
  }, [scenario, onComplete]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-6">
        Cost-Benefit Analysis: Optimizing Precision Within Budget
      </h3>
      
      {/* Mathematical Framework */}
      <MathematicalFramework />
      
      {/* Controls in a horizontal layout */}
      <div className="mb-6 bg-neutral-800/50 rounded-lg p-4">
        <h4 className="font-semibold text-emerald-400 mb-4">Scenario Parameters</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">
              Cost per Subject
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={scenario.costPerSubject}
                onChange={(e) => setScenario({
                  ...scenario, 
                  costPerSubject: Number(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-sm font-mono text-white w-16">${scenario.costPerSubject}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-neutral-400 mb-2">
              Fixed Costs
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="20000"
                step="1000"
                value={scenario.fixedCosts}
                onChange={(e) => setScenario({
                  ...scenario, 
                  fixedCosts: Number(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-sm font-mono text-white w-16">${(scenario.fixedCosts/1000).toFixed(0)}k</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-neutral-400 mb-2">
              Budget Limit
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10000"
                max="200000"
                step="5000"
                value={scenario.budgetLimit}
                onChange={(e) => setScenario({
                  ...scenario, 
                  budgetLimit: Number(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-sm font-mono text-white w-20">${(scenario.budgetLimit/1000).toFixed(0)}k</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-neutral-400 mb-2">
              Population SD (σ)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="5"
                max="30"
                value={scenario.sigma}
                onChange={(e) => setScenario({
                  ...scenario, 
                  sigma: Number(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-sm font-mono text-white w-8">{scenario.sigma}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Live Calculations Panel */}
      <LiveCalculations scenario={scenario} optimalPoint={optimalPoint} />
      
      {/* Main visualization with full width */}
      <div className="space-y-4 mt-6">
        <GraphContainer height="500px">
          <svg ref={svgRef} width="100%" height="100%" />
        </GraphContainer>
        
        {/* Results and insights in a row below */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Optimal Solution */}
          {optimalPoint && (
            <div
              className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h5 className="font-semibold text-emerald-400 mb-3">
                Optimal Solution
              </h5>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-neutral-400">Sample Size:</span>
                  <span className="font-mono text-white ml-2">n = {optimalPoint.n}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Margin of Error:</span>
                  <span className="font-mono text-white ml-2">E = ±{optimalPoint.E.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Total Cost:</span>
                  <span className="font-mono text-white ml-2">${optimalPoint.cost.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Budget Used:</span>
                  <span className="font-mono text-white ml-2">{((optimalPoint.cost / scenario.budgetLimit) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Key Insights with Mathematical Context */}
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <p className="text-neutral-400 mb-2 font-semibold">Understanding the Trade-offs:</p>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <div>
                  <span className="font-semibold">Hyperbolic relationship:</span> Cost increases as 1/E²
                  <div className="text-xs text-neutral-400 mt-1">
                    Halving error from 2 to 1 quadruples sample size (and variable costs)
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <div>
                  <span className="font-semibold">Fixed cost impact:</span> ${scenario.fixedCosts.toLocaleString()} reduces available funds
                  <div className="text-xs text-neutral-400 mt-1">
                    Higher fixed costs = fewer subjects = less precision achievable
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <div>
                  <span className="font-semibold">Diminishing returns:</span> Each $ buys less precision as E decreases
                  <div className="text-xs text-neutral-400 mt-1">
                    The curve flattens at high cost, showing inefficient precision gains
                  </div>
                </div>
              </li>
              {optimalPoint && (
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <div>
                    <span className="font-semibold">Current efficiency:</span> {((1 / optimalPoint.E) / (optimalPoint.cost / 1000)).toFixed(2)} precision per $1K
                    <div className="text-xs text-neutral-400 mt-1">
                      This measures how much precision you get per thousand dollars spent
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Real-World Scenarios Component
const RealWorldScenarios = React.memo(function RealWorldScenarios({ onComplete }) {
  const [selectedScenario, setSelectedScenario] = useState('medical');
  const [exploreCount, setExploreCount] = useState(0);
  
  const scenarios = {
    medical: {
      title: 'Clinical Trial',
      description: 'Testing a new drug\'s effect on blood pressure',
      icon: Heart,
      color: '#ef4444',
      parameters: {
        sigma: 12, // mmHg
        E: 2, // clinically significant difference
        confidence: 95,
        context: 'FDA requires 95% confidence, 2 mmHg is clinically meaningful'
      },
      considerations: [
        'Patient safety is paramount',
        'Recruitment costs are high (~$500/patient)',
        'Dropout rate must be considered (add 15-20%)',
        'Ethical review adds fixed costs'
      ]
    },
    manufacturing: {
      title: 'Quality Control',
      description: 'Monitoring product dimensions',
      icon: Factory,
      color: '#3b82f6',
      parameters: {
        sigma: 0.05, // mm
        E: 0.01, // tolerance
        confidence: 99,
        context: 'Six Sigma requires tight tolerances'
      },
      considerations: [
        'Automated measurement is cheap (~$1/unit)',
        'High volume production (1000s/day)',
        'Cost of defects is very high',
        'Real-time monitoring preferred'
      ]
    },
    market: {
      title: 'Market Research',
      description: 'Estimating customer satisfaction',
      icon: TrendingUp,
      color: '#10b981',
      parameters: {
        sigma: 1.2, // satisfaction scale SD
        E: 0.1, // desired precision
        confidence: 90,
        context: 'Business decisions need reasonable confidence'
      },
      considerations: [
        'Survey fatigue affects response rate',
        'Online surveys are cost-effective (~$10/response)',
        'Seasonal variations exist',
        'Demographic stratification important'
      ]
    }
  };
  
  const scenario = scenarios[selectedScenario];
  
  // Calculate z-value
  const getZ = (confidence) => {
    const zValues = { 90: 1.645, 95: 1.960, 99: 2.576 };
    return zValues[confidence] || 1.960;
  };
  
  const n = Math.ceil(Math.pow((getZ(scenario.parameters.confidence) * 
    scenario.parameters.sigma) / scenario.parameters.E, 2));
  
  // Track exploration
  useEffect(() => {
    setExploreCount(prev => prev + 1);
    if (exploreCount >= 2 && onComplete) {
      onComplete('scenarios-explored');
    }
  }, [selectedScenario]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-6">
        Real-World Applications
      </h3>
      
      {/* Scenario Selector */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {Object.entries(scenarios).map(([key, scen]) => {
          const Icon = scen.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedScenario(key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedScenario === key
                  ? 'border-current shadow-lg'
                  : 'border-neutral-700 hover:border-neutral-600'
              }`}
              style={{
                borderColor: selectedScenario === key ? scen.color : undefined,
                backgroundColor: selectedScenario === key 
                  ? `${scen.color}20` 
                  : 'rgb(38 38 38)'
              }}
            >
              <Icon className="w-8 h-8 mx-auto mb-2" style={{
                color: selectedScenario === key ? scen.color : '#e5e5e5'
              }} />
              <p className="font-semibold">{scen.title}</p>
              <p className="text-xs text-neutral-400 mt-1">{scen.description}</p>
            </button>
          );
        })}
      </div>
      
      {/* Scenario Details */}
      <div
        key={selectedScenario}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-800 rounded-xl p-6"
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Parameters */}
          <div>
            <h4 className="font-semibold text-white mb-4">Study Parameters</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-neutral-700">
                <span className="text-neutral-400">Population SD (σ)</span>
                <span className="font-mono">{scenario.parameters.sigma}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-700">
                <span className="text-neutral-400">Margin of Error (E)</span>
                <span className="font-mono">±{scenario.parameters.E}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-700">
                <span className="text-neutral-400">Confidence Level</span>
                <span className="font-mono">{scenario.parameters.confidence}%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-400">Required Sample Size</span>
                <span className="font-mono text-2xl" style={{ color: scenario.color }}>
                  n = {n}
                </span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-neutral-900/50 rounded text-sm">
              <p className="text-neutral-400 mb-1">Context:</p>
              <p>{scenario.parameters.context}</p>
            </div>
          </div>
          
          {/* Considerations */}
          <div>
            <h4 className="font-semibold text-white mb-4">
              Practical Considerations
            </h4>
            
            <div className="space-y-3">
              {scenario.considerations.map((consideration, idx) => (
                <div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ backgroundColor: `${scenario.color}30` }}>
                    <Check className="w-4 h-4" style={{ color: scenario.color }} />
                  </div>
                  <p className="text-sm">{consideration}</p>
                </div>
              ))}
            </div>
            
            <div
              className="mt-6 p-4 rounded-lg hover:scale-[1.02] transition-transform"
              style={{ backgroundColor: `${scenario.color}10` }}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: scenario.color }}>
                Sample Size Recommendation
              </p>
              <p className="text-sm">
                Plan for n = {Math.ceil(n * 1.15)} ({n} + 15% buffer for dropouts/errors)
              </p>
              {selectedScenario === 'medical' && (
                <p className="text-xs mt-2 text-neutral-400">
                  Estimated cost: ${Math.ceil(n * 1.15 * 500).toLocaleString()} + fixed costs
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Stage Content Renderer
const StageContent = React.memo(function StageContent({ 
  stage, 
  onActivityComplete, 
  savedCalculations, 
  onSaveCalculation 
}) {
  const contentRef = useRef(null);
  
  // Process MathJax
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
  }, [stage]);
  
  return (
    <div ref={contentRef} className="space-y-8">
      {stage.id === 'DISCOVER' && (
        <>
          <MathematicalFoundation />
          <VisualExploration onComplete={onActivityComplete} />
          
          <div
            className="bg-blue-900/20 rounded-lg p-6 border border-blue-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="font-semibold text-blue-400 mb-3">
              Discovery Summary
            </h4>
            <div className="space-y-2 text-sm">
              <p>• Sample size has an inverse square relationship with margin of error</p>
              <p>• Doubling precision (halving E) quadruples the required sample size</p>
              <p>• Higher confidence levels require larger samples, but the effect is less dramatic</p>
              <p>• Population variability (σ) has a direct square relationship with sample size</p>
            </div>
          </div>
        </>
      )}
      
      {stage.id === 'CALCULATE' && (
        <>
          <QuickReferenceCard />
          <InteractiveFormulaBuilder onComplete={onActivityComplete} />
          <ExamPracticeProblems onComplete={onActivityComplete} />
          <SampleSizeCalculator 
            onComplete={onActivityComplete} 
            onSaveCalculation={onSaveCalculation}
          />
        </>
      )}
      
      {stage.id === 'APPLY' && (
        <>
          <CostBenefitAnalysis onComplete={onActivityComplete} />
          <RealWorldScenarios onComplete={onActivityComplete} />
          
          {savedCalculations.length > 0 && (
            <div
              className="bg-emerald-900/20 rounded-lg p-6 border border-emerald-500/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h4 className="font-semibold text-emerald-400 mb-3">
                Your Saved Calculations
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {savedCalculations.map((calc, index) => (
                  <div key={calc.id} className="bg-neutral-800 rounded p-3 text-sm">
                    <p className="font-mono">
                      σ={calc.sigma}, E={calc.E}, {calc.confidence}% → n={calc.n}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(calc.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

// Main Component
export default function SampleSizeCalculation() {
  const [mode, setMode] = useState(LEARNING_MODES.FOUNDATIONS);
  const [currentStage, setCurrentStage] = useState('DISCOVER');
  const [completedActivities, setCompletedActivities] = useState(new Set());
  const [savedCalculations, setSavedCalculations] = useState([]);
  
  const handleActivityComplete = useCallback((activity) => {
    setCompletedActivities(prev => new Set([...prev, activity]));
  }, []);
  
  const handleSaveCalculation = useCallback((calc) => {
    setSavedCalculations(prev => [...prev, calc]);
  }, []);
  
  return (
    <>
      <Chapter5ReferenceSheet mode="floating" />
      <VisualizationContainer
        title="5.3 Sample Size Determination"
        description="Find the perfect balance between precision, confidence, and cost"
      >
      <BackToHub chapter={5} />
      
      <LearningPathNavigation 
        mode={mode} 
        onModeChange={setMode}
      />
      
      {/* FOUNDATIONS Mode */}
      <div style={{ display: mode === LEARNING_MODES.FOUNDATIONS ? 'block' : 'none' }}>
        {/* Conceptual Introduction */}
        <div className="mb-8 p-6 bg-gradient-to-br from-teal-900/20 to-blue-900/20 rounded-lg border border-teal-700/50">
        <h2 className="text-2xl font-bold text-teal-400 mb-4">The Fundamental Question</h2>
        <div className="space-y-4 text-neutral-300">
          <p>
            Before collecting any data, researchers face a critical question: 
            <span className="text-teal-400 font-semibold"> "How many observations do we need?"</span> 
            Too few and your results are unreliable. Too many and you waste time and money.
          </p>
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-400 mb-2">The Three-Way Trade-off</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-teal-400">1.</span>
                <div>
                  <span className="font-semibold">Precision (E):</span> How close do we need to be to the truth? 
                  A political poll with ±10% is less useful than one with ±3%.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400">2.</span>
                <div>
                  <span className="font-semibold">Confidence (1-α):</span> How sure do we want to be? 
                  95% confidence is standard, but critical decisions might need 99%.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400">3.</span>
                <div>
                  <span className="font-semibold">Cost/Time:</span> What resources are available? 
                  Each additional subject costs money and time.
                </div>
              </li>
            </ul>
          </div>
          <p className="text-sm italic text-neutral-400">
            This section teaches you to optimize this trade-off using mathematical precision.
          </p>
        </div>
      </div>
        
        {/* Additional Foundations Content */}
        <MathematicalFoundation />
        <VisualExploration onComplete={handleActivityComplete} />
      </div>
      
      {/* PRACTICE Mode */}
      <div style={{ display: mode === LEARNING_MODES.PRACTICE ? 'block' : 'none' }}>
        <InteractiveFormulaBuilder onComplete={handleActivityComplete} />
        <SampleSizeCalculator 
          onComplete={handleActivityComplete} 
          onSaveCalculation={handleSaveCalculation} 
        />
        <ExamPracticeProblems onComplete={handleActivityComplete} />
      </div>
      
      {/* APPLICATIONS Mode */}
      <div style={{ display: mode === LEARNING_MODES.APPLICATIONS ? 'block' : 'none' }}>
        <CostBenefitAnalysis onComplete={handleActivityComplete} />
        <RealWorldScenarios onComplete={handleActivityComplete} />
      </div>
      
      {/* Section Complete - Standardized Component */}
      <SectionComplete chapter={5} />
      </VisualizationContainer>
    </>
  );
}