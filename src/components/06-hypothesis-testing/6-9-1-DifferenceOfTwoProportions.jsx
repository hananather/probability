'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { jStat } from 'jstat';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  VisualizationContainer,
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '@/components/ui/VisualizationContainer';
import { Button } from '@/components/ui/button';
import { MathematicalDiscoveries } from '@/components/ui/MathematicalDiscoveries';
import { useDiscoveries } from '@/hooks/useDiscoveries';
import { createColorScheme, cn } from '@/lib/design-system';
import { 
  Bug, BarChart3, Calculator, ChevronRight, Sparkles, 
  Activity, Target, AlertCircle, CheckCircle, Merge
} from 'lucide-react';

const colors = createColorScheme('hypothesis');

// Moth data from the task
const MOTH_DATA = {
  light: { n: 137, recaptured: 18, name: 'Light-colored moths', color: '#fbbf24' },
  dark: { n: 493, recaptured: 131, name: 'Dark-colored moths', color: '#6b7280' }
};

// Learning journey stages
const LEARNING_JOURNEY = [
  { 
    id: 'data', 
    title: 'The Moth Recapture Data', 
    icon: Bug,
    color: 'from-amber-500 to-yellow-500'
  },
  { 
    id: 'pooled', 
    title: 'The Pooled Proportion', 
    icon: Merge,
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 'se', 
    title: 'Standard Error Explorer', 
    icon: Activity,
    color: 'from-green-500 to-emerald-500'
  },
  { 
    id: 'validation', 
    title: 'Large Counts Validator', 
    icon: CheckCircle,
    color: 'from-purple-500 to-pink-500'
  },
  { 
    id: 'test', 
    title: 'Hypothesis Test & Results', 
    icon: Target,
    color: 'from-red-500 to-orange-500'
  }
];

// LaTeX component
const LaTeXContent = React.memo(({ content }) => {
  const ref = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && ref.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([ref.current]);
        }
        window.MathJax.typesetPromise([ref.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [content]);
  
  return <span ref={ref} dangerouslySetInnerHTML={{ __html: content }} />;
});

LaTeXContent.displayName = 'LaTeXContent';

export default function DifferenceOfTwoProportions() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPoolingAnimation, setShowPoolingAnimation] = useState(false);
  const [selectedSampleSize, setSelectedSampleSize] = useState('original');
  const [showTestResults, setShowTestResults] = useState(false);
  const [hypothesisType, setHypothesisType] = useState('two');
  const [significanceLevel, setSignificanceLevel] = useState(0.05);
  
  const { discoveries, addDiscovery } = useDiscoveries();
  
  // Refs for visualizations
  const barChartRef = useRef(null);
  const poolingRef = useRef(null);
  const seExplorerRef = useRef(null);
  
  // Calculate proportions
  const calculations = useMemo(() => {
    const sampleSizeMultipliers = {
      original: 1,
      halved: 0.5,
      quartered: 0.25
    };
    
    const multiplier = sampleSizeMultipliers[selectedSampleSize];
    const n1 = Math.round(MOTH_DATA.light.n * multiplier);
    const n2 = Math.round(MOTH_DATA.dark.n * multiplier);
    const y1 = Math.round(MOTH_DATA.light.recaptured * multiplier);
    const y2 = Math.round(MOTH_DATA.dark.recaptured * multiplier);
    
    const p1 = y1 / n1;
    const p2 = y2 / n2;
    const pooledP = (y1 + y2) / (n1 + n2);
    const difference = p1 - p2;
    
    // Standard error (using pooled proportion for test)
    const sePooled = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
    
    // Test statistic
    const zStat = difference / sePooled;
    
    // P-value
    let pValue;
    if (hypothesisType === 'two') {
      pValue = 2 * (1 - jStat.normal.cdf(Math.abs(zStat), 0, 1));
    } else if (hypothesisType === 'left') {
      pValue = jStat.normal.cdf(zStat, 0, 1);
    } else {
      pValue = 1 - jStat.normal.cdf(zStat, 0, 1);
    }
    
    // Large counts check
    const largeCountsCheck = {
      light: {
        np: n1 * pooledP,
        n1p: n1 * (1 - pooledP),
        valid: n1 * pooledP >= 10 && n1 * (1 - pooledP) >= 10
      },
      dark: {
        np: n2 * pooledP,
        n1p: n2 * (1 - pooledP),
        valid: n2 * pooledP >= 10 && n2 * (1 - pooledP) >= 10
      }
    };
    
    // Confidence interval (using unpooled SE)
    const seUnpooled = Math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2);
    const zCrit = jStat.normal.inv(1 - significanceLevel / 2, 0, 1);
    const ciLower = difference - zCrit * seUnpooled;
    const ciUpper = difference + zCrit * seUnpooled;
    
    return {
      n1, n2, y1, y2, p1, p2, pooledP, difference,
      sePooled, seUnpooled, zStat, pValue,
      largeCountsCheck, ciLower, ciUpper
    };
  }, [selectedSampleSize, hypothesisType, significanceLevel]);
  
  // Draw bar chart
  useEffect(() => {
    if (!barChartRef.current || currentStep < 0) return;
    
    const svg = d3.select(barChartRef.current);
    const width = barChartRef.current.clientWidth;
    const height = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Data for bar chart
    const data = [
      { group: 'Light moths', proportion: calculations.p1, color: MOTH_DATA.light.color },
      { group: 'Dark moths', proportion: calculations.p2, color: MOTH_DATA.dark.color }
    ];
    
    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.group))
      .range([0, innerWidth])
      .padding(0.4);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.3])
      .range([innerHeight, 0]);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .style("color", "#9ca3af");
    
    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")))
      .style("color", "#9ca3af");
    
    // Y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - innerHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "#d4d4d8")
      .text("Recapture Rate");
    
    // Bars
    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.group))
      .attr("width", xScale.bandwidth())
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("fill", d => d.color)
      .transition()
      .duration(1000)
      .attr("y", d => yScale(d.proportion))
      .attr("height", d => innerHeight - yScale(d.proportion));
    
    // Value labels
    g.selectAll(".label")
      .data(data)
      .enter().append("text")
      .attr("class", "label")
      .attr("x", d => xScale(d.group) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.proportion) - 10)
      .attr("text-anchor", "middle")
      .style("fill", "#ffffff")
      .style("font-weight", "bold")
      .style("opacity", 0)
      .text(d => `${(d.proportion * 100).toFixed(1)}%`)
      .transition()
      .duration(1000)
      .delay(500)
      .style("opacity", 1);
    
    // Difference annotation
    if (currentStep >= 1) {
      const diffGroup = g.append("g")
        .attr("class", "difference-annotation")
        .style("opacity", 0);
      
      // Connecting line
      const y1 = yScale(calculations.p1);
      const y2 = yScale(calculations.p2);
      const x1 = xScale('Light moths') + xScale.bandwidth() / 2;
      const x2 = xScale('Dark moths') + xScale.bandwidth() / 2;
      
      diffGroup.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .style("stroke", "#e11d48")
        .style("stroke-width", 2)
        .style("stroke-dasharray", "5,5");
      
      // Difference text
      diffGroup.append("text")
        .attr("x", (x1 + x2) / 2)
        .attr("y", Math.min(y1, y2) - 30)
        .attr("text-anchor", "middle")
        .style("fill", "#e11d48")
        .style("font-weight", "bold")
        .text(`Difference: ${(calculations.difference * 100).toFixed(1)}%`);
      
      diffGroup.transition()
        .duration(800)
        .delay(200)
        .style("opacity", 1);
    }
    
  }, [currentStep, calculations]);
  
  // Draw pooling animation
  useEffect(() => {
    if (!poolingRef.current || currentStep !== 1 || !showPoolingAnimation) return;
    
    const svg = d3.select(poolingRef.current);
    const width = poolingRef.current.clientWidth;
    const height = 200;
    
    svg.selectAll("*").remove();
    
    const g = svg.append("g")
      .attr("transform", "translate(20, 20)");
    
    // Initial separate groups
    const group1 = g.append("g").attr("transform", "translate(0, 0)");
    const group2 = g.append("g").attr("transform", "translate(300, 0)");
    
    // Light moths group
    group1.append("rect")
      .attr("width", 200)
      .attr("height", 80)
      .attr("fill", MOTH_DATA.light.color)
      .attr("opacity", 0.3)
      .attr("rx", 8);
    
    group1.append("text")
      .attr("x", 100)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .style("fill", "#171717")
      .style("font-weight", "bold")
      .text(`${calculations.y1} / ${calculations.n1}`);
    
    // Dark moths group
    group2.append("rect")
      .attr("width", 200)
      .attr("height", 80)
      .attr("fill", MOTH_DATA.dark.color)
      .attr("opacity", 0.3)
      .attr("rx", 8);
    
    group2.append("text")
      .attr("x", 100)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .style("fill", "#ffffff")
      .style("font-weight", "bold")
      .text(`${calculations.y2} / ${calculations.n2}`);
    
    // Animate merging
    setTimeout(() => {
      group1.transition()
        .duration(1500)
        .attr("transform", "translate(150, 0)");
      
      group2.transition()
        .duration(1500)
        .attr("transform", "translate(150, 0)");
      
      // Add pooled result
      setTimeout(() => {
        const pooledGroup = g.append("g")
          .attr("transform", "translate(150, 100)")
          .style("opacity", 0);
        
        pooledGroup.append("rect")
          .attr("width", 200)
          .attr("height", 80)
          .attr("fill", colors.chart.primary)
          .attr("opacity", 0.3)
          .attr("rx", 8);
        
        pooledGroup.append("text")
          .attr("x", 100)
          .attr("y", 40)
          .attr("text-anchor", "middle")
          .style("fill", "#ffffff")
          .style("font-weight", "bold")
          .text(`p̂ = ${(calculations.pooledP * 100).toFixed(1)}%`);
        
        pooledGroup.transition()
          .duration(800)
          .style("opacity", 1);
      }, 1600);
    }, 500);
    
  }, [currentStep, showPoolingAnimation, calculations]);
  
  // SE Explorer visualization
  useEffect(() => {
    if (!seExplorerRef.current || currentStep !== 2) return;
    
    const svg = d3.select(seExplorerRef.current);
    const width = seExplorerRef.current.clientWidth;
    const height = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Generate SE curve data
    const seData = d3.range(0.01, 0.99, 0.01).map(p => ({
      p: p,
      se: Math.sqrt(p * (1 - p) * (1/calculations.n1 + 1/calculations.n2))
    }));
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(seData, d => d.se) * 1.1])
      .range([innerHeight, 0]);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format(".0%")))
      .style("color", "#9ca3af");
    
    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d3.format(".3f")))
      .style("color", "#9ca3af");
    
    // Axis labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 45)
      .style("text-anchor", "middle")
      .style("fill", "#d4d4d8")
      .text("Pooled Proportion (p̂)");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - innerHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "#d4d4d8")
      .text("Standard Error");
    
    // SE curve
    const line = d3.line()
      .x(d => xScale(d.p))
      .y(d => yScale(d.se))
      .curve(d3.curveBasis);
    
    const path = g.append("path")
      .datum(seData)
      .attr("fill", "none")
      .attr("stroke", colors.chart.primary)
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Animate drawing
    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .attr("stroke-dashoffset", 0);
    
    // Mark current pooled p
    g.append("line")
      .attr("x1", xScale(calculations.pooledP))
      .attr("x2", xScale(calculations.pooledP))
      .attr("y1", innerHeight)
      .attr("y2", yScale(calculations.sePooled))
      .style("stroke", colors.chart.secondary)
      .style("stroke-width", 2)
      .style("stroke-dasharray", "5,5")
      .style("opacity", 0)
      .transition()
      .duration(800)
      .delay(1500)
      .style("opacity", 1);
    
    g.append("circle")
      .attr("cx", xScale(calculations.pooledP))
      .attr("cy", yScale(calculations.sePooled))
      .attr("r", 6)
      .style("fill", colors.chart.secondary)
      .style("opacity", 0)
      .transition()
      .duration(800)
      .delay(1500)
      .style("opacity", 1);
    
    // Label
    g.append("text")
      .attr("x", xScale(calculations.pooledP) + 10)
      .attr("y", yScale(calculations.sePooled) - 10)
      .style("fill", colors.chart.secondary)
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(`SE = ${calculations.sePooled.toFixed(3)}`)
      .style("opacity", 0)
      .transition()
      .duration(800)
      .delay(1800)
      .style("opacity", 1);
    
  }, [currentStep, calculations]);
  
  const handleStepChange = (newStep) => {
    setCurrentStep(newStep);
    
    // Add discoveries
    if (newStep === 1 && !discoveries.some(d => d.id === 'pooled-proportion')) {
      addDiscovery({
        id: 'pooled-proportion',
        title: 'Pooled Proportion',
        description: 'Under H₀, we combine both groups to estimate the common proportion',
        category: 'hypothesis-testing'
      });
    }
    
    if (newStep === 4 && !discoveries.some(d => d.id === 'two-proportion-test')) {
      addDiscovery({
        id: 'two-proportion-test',
        title: 'Two-Proportion Z-Test',
        description: 'Compare proportions from two independent groups',
        category: 'hypothesis-testing'
      });
    }
  };
  
  return (
    <VisualizationContainer 
      title="Difference of Two Proportions - Moth Recapture Study"
      className="max-w-7xl mx-auto"
    >
      <div className="mb-6 p-4 bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-xl border border-neutral-700">
        <p className="text-lg text-white text-center">
          Scientists study moth populations to understand natural selection. 
          Is there a significant difference in recapture rates between light and dark moths?
        </p>
      </div>
      
      {/* Learning Journey Navigation */}
      <div className="flex justify-between items-center mb-8 overflow-x-auto pb-2">
        {LEARNING_JOURNEY.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <motion.button
              key={stage.id}
              onClick={() => handleStepChange(index)}
              className={cn(
                "flex flex-col items-center p-3 rounded-lg transition-all duration-300 min-w-[120px]",
                isActive && "bg-gradient-to-br " + stage.color + " shadow-lg scale-105",
                isCompleted && "bg-neutral-700",
                !isActive && !isCompleted && "bg-neutral-800"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={cn(
                "p-2 rounded-full mb-2",
                isActive ? "bg-white/20" : "bg-white/10"
              )}>
                <Icon className={cn(
                  "h-6 w-6",
                  isActive ? "text-white" : "text-neutral-400"
                )} />
              </div>
              <span className={cn(
                "text-xs font-medium text-center",
                isActive ? "text-white" : "text-neutral-400"
              )}>
                {stage.title}
              </span>
            </motion.button>
          );
        })}
      </div>
      
      <AnimatePresence mode="wait">
        {/* Stage 1: Data Visualization */}
        {currentStep === 0 && (
          <motion.div
            key="data"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <VisualizationSection>
              <h3 className="text-xl font-bold text-white mb-4">The Moth Recapture Data</h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-400 mb-3">Light-colored Moths</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-neutral-300">Released: <span className="font-mono text-white">{MOTH_DATA.light.n}</span></p>
                    <p className="text-neutral-300">Recaptured: <span className="font-mono text-white">{MOTH_DATA.light.recaptured}</span></p>
                    <p className="text-neutral-300">Proportion: <span className="font-mono text-amber-400">{(calculations.p1 * 100).toFixed(1)}%</span></p>
                  </div>
                </div>
                
                <div className="bg-neutral-600/10 border border-neutral-600/30 rounded-lg p-4">
                  <h4 className="font-semibold text-neutral-400 mb-3">Dark-colored Moths</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-neutral-300">Released: <span className="font-mono text-white">{MOTH_DATA.dark.n}</span></p>
                    <p className="text-neutral-300">Recaptured: <span className="font-mono text-white">{MOTH_DATA.dark.recaptured}</span></p>
                    <p className="text-neutral-300">Proportion: <span className="font-mono text-neutral-400">{(calculations.p2 * 100).toFixed(1)}%</span></p>
                  </div>
                </div>
              </div>
              
              <GraphContainer height="350px">
                <svg ref={barChartRef} className="w-full h-full" />
              </GraphContainer>
              
              <div className="mt-4 p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
                <p className="text-red-400 text-center font-semibold">
                  Dark moths are {(calculations.p2 / calculations.p1).toFixed(1)}x more likely to be recaptured!
                </p>
              </div>
            </VisualizationSection>
          </motion.div>
        )}
        
        {/* Stage 2: Pooled Proportion */}
        {currentStep === 1 && (
          <motion.div
            key="pooled"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <VisualizationSection>
              <h3 className="text-xl font-bold text-white mb-4">The Pooled Proportion Concept</h3>
              
              <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-700/30 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-blue-400 mb-3">Why Pool Under H₀?</h4>
                <ul className="space-y-2 text-neutral-300">
                  <li>• H₀ claims p₁ = p₂ = p (common proportion)</li>
                  <li>• Best estimate: combine all data from both groups</li>
                  <li>• Under H₀, we treat all moths as one population</li>
                </ul>
              </div>
              
              <Button
                onClick={() => setShowPoolingAnimation(true)}
                className="mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                disabled={showPoolingAnimation}
              >
                <Merge className="mr-2 h-4 w-4" />
                Show Pooling Animation
              </Button>
              
              {showPoolingAnimation && (
                <GraphContainer height="250px">
                  <svg ref={poolingRef} className="w-full h-full" />
                </GraphContainer>
              )}
              
              <div className="bg-black/30 p-6 rounded-lg">
                <h4 className="text-teal-400 font-semibold mb-3">Pooled Proportion Calculation</h4>
                <div className="text-center">
                  <div className="text-xl text-white mb-3">
                    <LaTeXContent content={`\\(\\hat{p} = \\frac{y_1 + y_2}{n_1 + n_2} = \\frac{${calculations.y1} + ${calculations.y2}}{${calculations.n1} + ${calculations.n2}} = \\frac{${calculations.y1 + calculations.y2}}{${calculations.n1 + calculations.n2}} = ${calculations.pooledP.toFixed(4)}\\)`} />
                  </div>
                  <p className="text-neutral-400">
                    This gives us p̂ = {(calculations.pooledP * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </VisualizationSection>
          </motion.div>
        )}
        
        {/* Stage 3: Standard Error Explorer */}
        {currentStep === 2 && (
          <motion.div
            key="se"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <VisualizationSection>
              <h3 className="text-xl font-bold text-white mb-4">Standard Error Explorer</h3>
              
              <div className="bg-black/30 p-6 rounded-lg mb-6">
                <h4 className="text-green-400 font-semibold mb-3">SE Formula Breakdown</h4>
                <div className="text-center space-y-3">
                  <div className="text-lg">
                    <LaTeXContent content={`\\(SE = \\sqrt{\\hat{p}(1-\\hat{p})\\left(\\frac{1}{n_1} + \\frac{1}{n_2}\\right)}\\)`} />
                  </div>
                  <div className="text-base text-neutral-300">
                    <LaTeXContent content={`\\(SE = \\sqrt{${calculations.pooledP.toFixed(4)} \\times ${(1 - calculations.pooledP).toFixed(4)} \\times \\left(\\frac{1}{${calculations.n1}} + \\frac{1}{${calculations.n2}}\\right)}\\)`} />
                  </div>
                  <div className="text-xl text-green-400 font-mono">
                    SE = {calculations.sePooled.toFixed(4)}
                  </div>
                </div>
              </div>
              
              <GraphContainer height="350px">
                <svg ref={seExplorerRef} className="w-full h-full" />
              </GraphContainer>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-neutral-400 mb-2">Key Insight 1</h5>
                  <p className="text-neutral-300 text-sm">
                    SE is maximized when p = 0.5
                  </p>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-neutral-400 mb-2">Key Insight 2</h5>
                  <p className="text-neutral-300 text-sm">
                    Larger n → Smaller SE → More power
                  </p>
                </div>
              </div>
            </VisualizationSection>
          </motion.div>
        )}
        
        {/* Stage 4: Large Counts Validation */}
        {currentStep === 3 && (
          <motion.div
            key="validation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <VisualizationSection>
              <h3 className="text-xl font-bold text-white mb-4">Large Counts Validator</h3>
              
              <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-6 mb-6">
                <p className="text-purple-300 mb-4">
                  For the normal approximation to be valid, we need all counts ≥ 10
                </p>
                <p className="text-purple-400 font-semibold">
                  Important: Use the pooled p̂ for checking!
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "p-6 rounded-lg border-2",
                    calculations.largeCountsCheck.light.valid
                      ? "bg-green-900/20 border-green-500/50"
                      : "bg-red-900/20 border-red-500/50"
                  )}
                >
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    Light Moths
                    {calculations.largeCountsCheck.light.valid ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-neutral-300">
                      np̂ = {calculations.n1} × {calculations.pooledP.toFixed(3)} = 
                      <span className={cn(
                        "font-mono ml-2",
                        calculations.largeCountsCheck.light.np >= 10 ? "text-green-400" : "text-red-400"
                      )}>
                        {calculations.largeCountsCheck.light.np.toFixed(1)}
                      </span>
                    </p>
                    <p className="text-neutral-300">
                      n(1-p̂) = {calculations.n1} × {(1 - calculations.pooledP).toFixed(3)} = 
                      <span className={cn(
                        "font-mono ml-2",
                        calculations.largeCountsCheck.light.n1p >= 10 ? "text-green-400" : "text-red-400"
                      )}>
                        {calculations.largeCountsCheck.light.n1p.toFixed(1)}
                      </span>
                    </p>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "p-6 rounded-lg border-2",
                    calculations.largeCountsCheck.dark.valid
                      ? "bg-green-900/20 border-green-500/50"
                      : "bg-red-900/20 border-red-500/50"
                  )}
                >
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    Dark Moths
                    {calculations.largeCountsCheck.dark.valid ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-neutral-300">
                      np̂ = {calculations.n2} × {calculations.pooledP.toFixed(3)} = 
                      <span className={cn(
                        "font-mono ml-2",
                        calculations.largeCountsCheck.dark.np >= 10 ? "text-green-400" : "text-red-400"
                      )}>
                        {calculations.largeCountsCheck.dark.np.toFixed(1)}
                      </span>
                    </p>
                    <p className="text-neutral-300">
                      n(1-p̂) = {calculations.n2} × {(1 - calculations.pooledP).toFixed(3)} = 
                      <span className={cn(
                        "font-mono ml-2",
                        calculations.largeCountsCheck.dark.n1p >= 10 ? "text-green-400" : "text-red-400"
                      )}>
                        {calculations.largeCountsCheck.dark.n1p.toFixed(1)}
                      </span>
                    </p>
                  </div>
                </motion.div>
              </div>
              
              <div className={cn(
                "mt-6 p-4 rounded-lg text-center",
                calculations.largeCountsCheck.light.valid && calculations.largeCountsCheck.dark.valid
                  ? "bg-green-900/20 border border-green-500/30"
                  : "bg-red-900/20 border border-red-500/30"
              )}>
                <p className={cn(
                  "font-semibold",
                  calculations.largeCountsCheck.light.valid && calculations.largeCountsCheck.dark.valid
                    ? "text-green-400"
                    : "text-red-400"
                )}>
                  {calculations.largeCountsCheck.light.valid && calculations.largeCountsCheck.dark.valid
                    ? "✓ All conditions satisfied - we can use the normal approximation!"
                    : "✗ Conditions not met - normal approximation may not be valid"}
                </p>
              </div>
            </VisualizationSection>
          </motion.div>
        )}
        
        {/* Stage 5: Hypothesis Test */}
        {currentStep === 4 && (
          <motion.div
            key="test"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <VisualizationSection>
              <h3 className="text-xl font-bold text-white mb-4">Hypothesis Test & Results</h3>
              
              {/* Hypothesis Type Selection */}
              <div className="bg-neutral-800/50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-neutral-400 mb-3">Select Alternative Hypothesis</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'two', label: 'p₁ ≠ p₂', desc: 'Two-tailed' },
                    { value: 'left', label: 'p₁ < p₂', desc: 'Left-tailed' },
                    { value: 'right', label: 'p₁ > p₂', desc: 'Right-tailed' }
                  ].map(type => (
                    <button
                      key={type.value}
                      onClick={() => setHypothesisType(type.value)}
                      className={cn(
                        "p-3 rounded-lg transition-all duration-300",
                        hypothesisType === type.value
                          ? "bg-purple-600 text-white"
                          : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                      )}
                    >
                      <div className="font-semibold">{type.label}</div>
                      <div className="text-xs">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Test Calculation */}
              <div className="bg-black/30 p-6 rounded-lg mb-6">
                <h4 className="text-orange-400 font-semibold mb-4">Test Calculation</h4>
                <div className="text-center space-y-3">
                  <div className="text-lg">
                    <LaTeXContent content={`\\(z = \\frac{\\hat{p}_1 - \\hat{p}_2}{SE} = \\frac{${calculations.p1.toFixed(4)} - ${calculations.p2.toFixed(4)}}{${calculations.sePooled.toFixed(4)}} = \\frac{${calculations.difference.toFixed(4)}}{${calculations.sePooled.toFixed(4)}} = ${calculations.zStat.toFixed(3)}\\)`} />
                  </div>
                  <div className="text-xl">
                    <span className="text-neutral-400">p-value = </span>
                    <span className={cn(
                      "font-mono font-bold",
                      calculations.pValue < 0.05 ? "text-red-400" : "text-green-400"
                    )}>
                      {calculations.pValue < 0.001 ? "< 0.001" : calculations.pValue.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Sample Size Impact */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-neutral-400 mb-3">Sample Size Impact</h4>
                <div className="flex gap-3">
                  {['original', 'halved', 'quartered'].map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSampleSize(size)}
                      className={cn(
                        "flex-1 p-3 rounded-lg transition-all duration-300",
                        selectedSampleSize === size
                          ? "bg-orange-600 text-white"
                          : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                      )}
                    >
                      <div className="font-semibold capitalize">{size}</div>
                      <div className="text-xs">
                        n₁={Math.round(MOTH_DATA.light.n * (size === 'halved' ? 0.5 : size === 'quartered' ? 0.25 : 1))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Results Display */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className={cn(
                  "p-6 rounded-lg",
                  calculations.pValue < significanceLevel
                    ? "bg-red-900/20 border border-red-700/30"
                    : "bg-green-900/20 border border-green-700/30"
                )}>
                  <h5 className="font-semibold text-white mb-3">Test Decision</h5>
                  <p className={cn(
                    "text-2xl font-bold",
                    calculations.pValue < significanceLevel ? "text-red-400" : "text-green-400"
                  )}>
                    {calculations.pValue < significanceLevel ? "Reject H₀" : "Fail to Reject H₀"}
                  </p>
                  <p className="text-sm text-neutral-300 mt-2">
                    {calculations.pValue < significanceLevel 
                      ? "Strong evidence of difference in recapture rates"
                      : "Insufficient evidence of difference"}
                  </p>
                </div>
                
                <div className="p-6 rounded-lg bg-purple-900/20 border border-purple-700/30">
                  <h5 className="font-semibold text-white mb-3">Confidence Interval</h5>
                  <p className="text-lg font-mono text-purple-400">
                    ({calculations.ciLower.toFixed(3)}, {calculations.ciUpper.toFixed(3)})
                  </p>
                  <p className="text-sm text-neutral-300 mt-2">
                    95% CI for p₁ - p₂
                    {calculations.ciLower > 0 || calculations.ciUpper < 0 
                      ? " (excludes 0)" 
                      : " (includes 0)"}
                  </p>
                </div>
              </div>
              
              {/* Key Insight */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-6 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-700/30 rounded-lg"
              >
                <h4 className="text-lg font-bold text-yellow-400 mb-3">
                  <Sparkles className="inline h-5 w-5 mr-2" />
                  Key Insight: Same Effect, Different Conclusions!
                </h4>
                <p className="text-neutral-300 mb-3">
                  With the same observed difference ({(Math.abs(calculations.difference) * 100).toFixed(1)}%), 
                  sample size dramatically affects our conclusion:
                </p>
                <div className="space-y-2 text-sm">
                  <p className="text-neutral-400">
                    • Original sample: z = -3.29, p {"<"} 0.001 → <span className="text-red-400 font-semibold">Significant!</span>
                  </p>
                  <p className="text-neutral-400">
                    • Halved sample: z ≈ -2.33, p ≈ 0.020 → <span className="text-yellow-400 font-semibold">Still significant</span>
                  </p>
                  <p className="text-neutral-400">
                    • Quartered sample: z ≈ -1.64, p ≈ 0.101 → <span className="text-green-400 font-semibold">Not significant</span>
                  </p>
                </div>
              </motion.div>
            </VisualizationSection>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          onClick={() => handleStepChange(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          variant="secondary"
          className="bg-neutral-700 hover:bg-neutral-600"
        >
          Previous
        </Button>
        <Button
          onClick={() => handleStepChange(Math.min(LEARNING_JOURNEY.length - 1, currentStep + 1))}
          disabled={currentStep === LEARNING_JOURNEY.length - 1}
          className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <MathematicalDiscoveries discoveries={discoveries} />
    </VisualizationContainer>
  );
}