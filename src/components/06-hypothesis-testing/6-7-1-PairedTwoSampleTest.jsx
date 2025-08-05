'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  VisualizationContainer,
  VisualizationSection,
  GraphContainer 
} from '@/components/ui/VisualizationContainer';
import { Button } from '@/components/ui/button';
import BackToHub from '@/components/ui/BackToHub';
import { MathematicalDiscoveries } from '@/components/ui/MathematicalDiscoveries';
import { useDiscoveries } from '@/hooks/useDiscoveries';
import { createColorScheme, cn } from '@/lib/design-system';
import { 
  Users, TrendingUp, GitBranch, Calculator, 
  ChevronRight, ChevronLeft, Sparkles, Activity, Target
} from 'lucide-react';

const colors = createColorScheme('hypothesis');

// Sample data for the engineers
const engineersData = [
  { id: 1, name: "Alex", before: 43, after: 51, avatar: "👨‍💻" },
  { id: 2, name: "Blake", before: 82, after: 84, avatar: "👩‍💻" },
  { id: 3, name: "Casey", before: 77, after: 74, avatar: "👨‍💼" },
  { id: 4, name: "Drew", before: 39, after: 48, avatar: "👩‍💼" },
  { id: 5, name: "Ellis", before: 51, after: 53, avatar: "👨‍🔬" },
  { id: 6, name: "Finn", before: 66, after: 61, avatar: "👩‍🔬" },
  { id: 7, name: "Gray", before: 55, after: 59, avatar: "👨‍🏫" },
  { id: 8, name: "Harper", before: 61, after: 75, avatar: "👩‍🏫" },
  { id: 9, name: "Ivy", before: 79, after: 82, avatar: "👨‍🎓" },
  { id: 10, name: "Jordan", before: 43, after: 48, avatar: "👩‍🎓" }
];

// Calculate differences (Before - After)
const dataWithDifferences = engineersData.map(d => ({
  ...d,
  difference: d.before - d.after,
  improved: d.after > d.before
}));

// Learning journey with single flow
const LEARNING_JOURNEY = [
  { 
    id: 'challenge', 
    title: 'Problem Setup', 
    icon: Target,
    color: 'from-purple-500 to-pink-500'
  },
  { 
    id: 'explore', 
    title: 'Data Exploration', 
    icon: Activity,
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 'discover', 
    title: 'Pattern Analysis', 
    icon: Sparkles,
    color: 'from-green-500 to-emerald-500'
  },
  { 
    id: 'transform', 
    title: 'Transformation to Differences', 
    icon: GitBranch,
    color: 'from-orange-500 to-red-500'
  },
  { 
    id: 'results', 
    title: 'Statistical Results', 
    icon: TrendingUp,
    color: 'from-indigo-500 to-purple-500'
  }
];

export default function PairedTwoSampleTest() {
  const [currentStep, setCurrentStep] = useState(0);
  const [revealedEngineers, setRevealedEngineers] = useState(new Set());
  const [showDifferences, setShowDifferences] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('idle');
  const [showScatterInsight, setShowScatterInsight] = useState(true);
  const [transformationComplete, setTransformationComplete] = useState(false);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [scatterLoading, setScatterLoading] = useState(false);
  const [scatterAnimationPhase, setScatterAnimationPhase] = useState('idle');
  const { discoveries, addDiscovery } = useDiscoveries();

  // Refs for visualizations
  const scatterRef = useRef(null);
  const transformRef = useRef(null);
  const distributionRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  // Calculate statistics
  const stats = useMemo(() => {
    const beforeMean = d3.mean(dataWithDifferences, d => d.before);
    const afterMean = d3.mean(dataWithDifferences, d => d.after);
    const beforeVar = d3.variance(dataWithDifferences, d => d.before);
    const afterVar = d3.variance(dataWithDifferences, d => d.after);
    
    const differences = dataWithDifferences.map(d => d.difference);
    const diffMean = d3.mean(differences);
    const diffVar = d3.variance(differences);
    const diffStd = Math.sqrt(diffVar);
    
    const n = dataWithDifferences.length;
    const testStatistic = diffMean / (diffStd / Math.sqrt(n));
    const df = n - 1;
    
    // Calculate correlation
    const correlation = d3.sum(dataWithDifferences, d => 
      (d.before - beforeMean) * (d.after - afterMean)
    ) / (Math.sqrt(beforeVar) * Math.sqrt(afterVar) * (n - 1));
    
    const criticalValue = 1.833; // t(9, 0.05)
    const pValue = 0.027; // For t = -2.21 with df = 9
    
    // Unpaired test statistics
    const pooledVar = ((n - 1) * beforeVar + (n - 1) * afterVar) / (2 * n - 2);
    const unpairedTestStat = (beforeMean - afterMean) / Math.sqrt(pooledVar * (2/n));
    const unpairedPValue = 0.107;
    
    return {
      beforeMean,
      afterMean,
      beforeVar,
      afterVar,
      diffMean,
      diffVar,
      diffStd,
      testStatistic,
      df,
      correlation,
      criticalValue,
      pValue,
      unpairedTestStat,
      unpairedPValue,
      improvedCount: dataWithDifferences.filter(d => d.improved).length
    };
  }, []);

  // Handle step progression
  const handleNextStep = useCallback(() => {
    if (currentStep < LEARNING_JOURNEY.length - 1) {
      // Reset scatter animation when leaving step 2
      if (currentStep === 2) {
        setScatterAnimationPhase('idle');
      }
      setCurrentStep(prev => prev + 1);
      
      // Add discoveries at key moments
      if (currentStep === 1) {
        addDiscovery({
          title: "Paired Design Power",
          description: "Each person serves as their own control, eliminating individual differences",
          mathConcept: "D_i = X_{after,i} - X_{before,i}",
          category: "concept"
        });
      } else if (currentStep === 2) {
        addDiscovery({
          title: "Correlation Reduces Variance",
          description: "High correlation between paired measurements dramatically reduces variance of differences",
          mathConcept: "\\text{Var}(D) = \\text{Var}(X_1) + \\text{Var}(X_2) - 2\\text{Cov}(X_1, X_2)",
          category: "formula"
        });
      } else if (currentStep === 3) {
        addDiscovery({
          title: "Two-Sample to One-Sample",
          description: "Paired t-test transforms a complex two-sample problem into a simple one-sample test",
          mathConcept: "T = \\frac{\\bar{D}}{S_D/\\sqrt{n}} \\sim t(n-1)",
          category: "pattern"
        });
      }
    }
  }, [currentStep, addDiscovery]);

  // Reset scatter state when changing steps
  useEffect(() => {
    if (currentStep !== 2) {
      setScatterLoading(false);
      setScatterAnimationPhase('idle');
    }
  }, [currentStep]);

  // Combined scatter plot initialization and data rendering
  useEffect(() => {
    
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    // Only run for step 2 when button is clicked
    if (currentStep !== 2 || scatterAnimationPhase !== 'show') {
      return;
    }
    
    // Check if ref is available
    if (!scatterRef.current) {
      return;
    }
    
    // Set loading state
    setScatterLoading(true);
    
    // Initialize and render scatter plot
    animationTimeoutRef.current = setTimeout(() => {
      try {
        const svg = d3.select(scatterRef.current);
        
        // Check if SVG element exists and has dimensions
        const svgNode = svg.node();
        if (!svgNode) {
          console.error('[Scatter] SVG node not found');
          return;
        }
        
        const rect = svgNode.getBoundingClientRect();
        
        // Clear any existing content
        svg.selectAll("*").remove();
    
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create gradient for visual appeal
    const defs = svg.append("defs");
    
    const gradient = defs.append("linearGradient")
      .attr("id", "scatter-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0.8);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#8b5cf6")
      .attr("stop-opacity", 0.8);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([30, 90])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([30, 90])
      .range([height, 0]);

    // Grid with proper dash patterns
    const gridGroup = g.append("g").attr("class", "grid");
    
    gridGroup.selectAll(".grid-line-x")
      .data(xScale.ticks(8))
      .enter()
      .append("line")
      .attr("class", "grid-line-x")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#9ca3af")
      .attr("stroke-width", 0.5)
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.4);

    gridGroup.selectAll(".grid-line-y")
      .data(yScale.ticks(8))
      .enter()
      .append("line")
      .attr("class", "grid-line-y")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#9ca3af")
      .attr("stroke-width", 0.5)
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.4);

    // Axes with consistent styling
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(8))
      .style("font-size", "12px")
      .style("color", "#9ca3af")
      .append("text")
      .attr("x", width / 2)
      .attr("y", 45)
      .attr("fill", "#9ca3af")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Before Training Score");

    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale).ticks(8))
      .style("font-size", "12px")
      .style("color", "#9ca3af")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -height / 2)
      .attr("fill", "#9ca3af")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("After Training Score");

    // Diagonal reference line with proper styling
    g.append("line")
      .attr("class", "diagonal-line")
      .attr("x1", xScale(30))
      .attr("y1", yScale(30))
      .attr("x2", xScale(90))
      .attr("y2", yScale(90))
      .attr("stroke", "#9ca3af")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "8,4")
      .attr("opacity", 0);

    // Groups for data elements
    g.append("g").attr("class", "connections");
    g.append("g").attr("class", "points");
    g.append("g").attr("class", "labels");
    
    // Set viewBox to ensure proper sizing
    svg.attr("viewBox", "0 0 500 400")
       .attr("preserveAspectRatio", "xMidYMid meet")
       .attr("width", "100%")
       .attr("height", "100%");
        
        // Now add the data and animations
        // Add data visualizations
    // Show diagonal line
    g.select(".diagonal-line")
      .transition()
      .duration(1000)
      .attr("opacity", 0.5);

    // Connection lines with improved animation
    const connections = g.select(".connections")
      .selectAll(".connection")
      .data(dataWithDifferences);

    connections.enter()
      .append("line")
      .attr("class", "connection")
      .attr("x1", d => xScale(d.before))
      .attr("y1", d => yScale(d.before))
      .attr("x2", d => xScale(d.before))
      .attr("y2", d => yScale(d.before))
      .attr("stroke", d => d.improved ? "#10b981" : "#a855f7")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "3,2")
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 80)
      .attr("x2", d => xScale(d.after))
      .attr("y2", d => yScale(d.after))
      .attr("opacity", 0.7);

    // Points with gradient fill
    const pointsGroup = g.select(".points");
    
    // Before points with updated color scheme
    const beforePoints = pointsGroup.selectAll(".before-point")
      .data(dataWithDifferences);

    beforePoints.enter()
      .append("circle")
      .attr("class", "before-point")
      .attr("cx", d => xScale(d.before))
      .attr("cy", d => yScale(d.before))
      .attr("r", 0)
      .attr("fill", "#3b82f6")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 10);
        
        // Show tooltip
        const tooltip = g.append("g")
          .attr("class", "tooltip");
        
        const rect = tooltip.append("rect")
          .attr("x", xScale(d.before) + 15)
          .attr("y", yScale(d.before) - 25)
          .attr("width", 120)
          .attr("height", 40)
          .attr("fill", "rgba(0,0,0,0.8)")
          .attr("rx", 4);
        
        tooltip.append("text")
          .attr("x", xScale(d.before) + 75)
          .attr("y", yScale(d.before) - 5)
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .style("font-size", "12px")
          .text(`${d.name}: ${d.before} → ${d.after}`);
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 6);
        
        g.select(".tooltip").remove();
      })
      .transition()
      .duration(500)
      .delay((d, i) => i * 50)
      .attr("r", 6);

    // After points
    const afterPoints = pointsGroup.selectAll(".after-point")
      .data(dataWithDifferences);

    afterPoints.enter()
      .append("circle")
      .attr("class", "after-point")
      .attr("cx", d => xScale(d.after))
      .attr("cy", d => yScale(d.after))
      .attr("r", 0)
      .attr("fill", "#10b981")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .transition()
      .duration(500)
      .delay((d, i) => i * 50 + 500)
      .attr("r", 6);

    // Add correlation text with animation
    if (showScatterInsight) {
      g.append("text")
        .attr("class", "correlation-text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", "#9ca3af")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(`Strong Correlation: r = ${stats.correlation.toFixed(3)}`)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 1);

      // Add insight box in top-left quadrant where no data points exist
      const insightBox = g.append("g")
        .attr("class", "insight-box")
        .attr("transform", `translate(${50}, ${10})`);

      insightBox.append("rect")
        .attr("width", 200)
        .attr("height", 45)
        .attr("fill", "rgba(16, 185, 129, 0.1)")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 2)
        .attr("rx", 8)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 1);

      insightBox.append("text")
        .attr("x", 100)
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .attr("fill", "#10b981")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Statistical Insight")
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 1);

      insightBox.append("text")
        .attr("x", 100)
        .attr("y", 33)
        .attr("text-anchor", "middle")
        .attr("fill", "#9ca3af")
        .style("font-size", "10px")
        .text("High correlation enables paired analysis")
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(200)
        .attr("opacity", 1);
    }
    
    // Mark as complete
        setScatterLoading(false);
        
      } catch (error) {
        console.error('[Scatter] Error in visualization:', error);
        console.error('[Scatter] Error stack:', error.stack);
        setScatterLoading(false);
      }
    }, 100); // Reduced delay for faster rendering
    
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, [currentStep, scatterAnimationPhase, stats.correlation]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && currentStep > 0) {
        // Reset scatter animation when navigating
        setScatterAnimationPhase('idle');
        setCurrentStep(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentStep < LEARNING_JOURNEY.length - 1) {
        handleNextStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, handleNextStep]);

  // Transformation animation with updated margins
  useEffect(() => {
    if (!transformRef.current || currentStep < 3) return;
    if (animationPhase !== 'transform') return;

    const svg = d3.select(transformRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text("From Two Samples to One")
      .attr("opacity", 0)
      .transition()
      .duration(300)
      .attr("opacity", 1);

    // Show the transformation directly without complex animations
    const columnWidth = 100;
    const columnHeight = 180;
    const spacing = 40;
    const centerX = width / 2;
    const startY = 50;

    // Sample values
    const sampleValues = dataWithDifferences.slice(0, 5);

    // Create three columns with updated color scheme
    const columns = [
      { label: "Before", x: centerX - columnWidth - spacing, color: "#3b82f6", data: sampleValues.map(d => d.before) },
      { label: "After", x: centerX, color: "#10b981", data: sampleValues.map(d => d.after) },
      { label: "Differences", x: centerX + columnWidth + spacing, color: "#a855f7", data: sampleValues.map(d => d.difference) }
    ];

    // Draw all columns at once
    columns.forEach((col, colIndex) => {
      const colGroup = g.append("g")
        .attr("transform", `translate(${col.x - columnWidth/2}, ${startY})`);

      // Column background
      colGroup.append("rect")
        .attr("width", columnWidth)
        .attr("height", columnHeight)
        .attr("fill", col.color)
        .attr("fill-opacity", 0.2)
        .attr("stroke", col.color)
        .attr("stroke-width", 2)
        .attr("rx", 8)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(colIndex * 200)
        .attr("opacity", 1);

      // Column label
      colGroup.append("text")
        .attr("x", columnWidth / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .attr("fill", col.color)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(col.label)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(colIndex * 200)
        .attr("opacity", 1);

      // Data values
      col.data.forEach((value, i) => {
        colGroup.append("text")
          .attr("x", columnWidth / 2)
          .attr("y", 25 + i * 30)
          .attr("text-anchor", "middle")
          .attr("fill", colIndex === 2 ? (value < 0 ? "#10b981" : "#a855f7") : "white")
          .style("font-size", "14px")
          .style("font-family", "monospace")
          .style("font-weight", colIndex === 2 ? "bold" : "normal")
          .text(colIndex === 2 && value > 0 ? `+${value}` : value)
          .attr("opacity", 0)
          .transition()
          .duration(300)
          .delay(colIndex * 200 + 300 + i * 50)
          .attr("opacity", 1);
      });
    });

    // Add arrows showing the transformation
    const arrowY = startY + columnHeight / 2;
    
    // Arrow from Before to After
    g.append("path")
      .attr("d", `M ${centerX - spacing - 5} ${arrowY} L ${centerX - columnWidth/2 - 5} ${arrowY}`)
      .attr("stroke", "#6b7280")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)")
      .attr("opacity", 0)
      .transition()
      .duration(300)
      .delay(600)
      .attr("opacity", 0.5);

    // Arrow from After to Differences
    g.append("path")
      .attr("d", `M ${centerX + columnWidth/2 + 5} ${arrowY} L ${centerX + spacing - 5} ${arrowY}`)
      .attr("stroke", "#6b7280")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)")
      .attr("opacity", 0)
      .transition()
      .duration(300)
      .delay(800)
      .attr("opacity", 0.5);

    // Define arrowhead marker
    const marker = svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto");

    marker.append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#6b7280");

    // Add explanation text with consistent styling
    g.append("text")
      .attr("x", width / 2)
      .attr("y", columnHeight + 100)
      .attr("text-anchor", "middle")
      .attr("fill", "#9ca3af")
      .style("font-size", "16px")
      .text("By taking differences, we convert a two-sample test into a one-sample test!")
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .delay(1200)
      .attr("opacity", 1);

    // Mark transformation as complete after a short delay
    setTimeout(() => {
      setTransformationComplete(true);
    }, 1500);

  }, [animationPhase, currentStep]);

  // Render content based on current step
  const renderStepContent = () => {
    const step = LEARNING_JOURNEY[currentStep];
    
    switch (step.id) {
      case 'challenge':
        return <ChallengeSection onNext={handleNextStep} />;
      
      case 'explore':
        return (
          <ExploreSection 
            data={dataWithDifferences}
            revealedEngineers={revealedEngineers}
            setRevealedEngineers={setRevealedEngineers}
            showDifferences={showDifferences}
            setShowDifferences={setShowDifferences}
            stats={stats}
            onNext={handleNextStep}
          />
        );
      
      case 'discover':
        return (
          <DiscoverSection
            scatterRef={scatterRef}
            showScatterInsight={showScatterInsight}
            setShowScatterInsight={setShowScatterInsight}
            stats={stats}
            onNext={handleNextStep}
            loading={scatterLoading}
            scatterAnimationPhase={scatterAnimationPhase}
            setScatterAnimationPhase={setScatterAnimationPhase}
          />
        );
      
      case 'transform':
        return (
          <TransformSection
            transformRef={transformRef}
            animationPhase={animationPhase}
            setAnimationPhase={setAnimationPhase}
            transformationComplete={transformationComplete}
            onNext={handleNextStep}
          />
        );
      
      case 'results':
        return (
          <ResultsSection
            stats={stats}
            showFinalResult={showFinalResult}
            setShowFinalResult={setShowFinalResult}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <VisualizationContainer
      title="6.7 - Paired Two-Sample Test"
      description="Discover the hidden power of pairing through an engaging journey"
    >
      {/* Back to Hub Button */}
      <BackToHub chapter={6} />
      
      {/* Journey Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {LEARNING_JOURNEY.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <motion.div
                key={step.id}
                className={cn(
                  "flex flex-col items-center relative",
                  index < LEARNING_JOURNEY.length - 1 && "flex-1"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Connection line */}
                {index < LEARNING_JOURNEY.length - 1 && (
                  <div className={cn(
                    "absolute top-8 left-1/2 w-full h-0.5",
                    isCompleted ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-neutral-700"
                  )} />
                )}
                
                {/* Icon circle */}
                <motion.div
                  className={cn(
                    "relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                    isActive && `bg-gradient-to-br ${step.color} shadow-lg shadow-${step.color.split('-')[1]}-500/50`,
                    isCompleted && "bg-gradient-to-br from-green-500 to-emerald-500",
                    !isActive && !isCompleted && "bg-neutral-800 border-2 border-neutral-700"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className={cn(
                    "w-8 h-8",
                    (isActive || isCompleted) ? "text-white" : "text-neutral-500"
                  )} />
                </motion.div>
                
                {/* Label */}
                <span className={cn(
                  "mt-2 text-xs font-medium text-center max-w-[100px]",
                  isActive ? "text-white" : "text-neutral-400"
                )}>
                  {step.title}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <VisualizationSection>
            {renderStepContent()}
          </VisualizationSection>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex justify-between items-center"
      >
        <Button
          onClick={() => {
            // Reset scatter animation when navigating
            setScatterAnimationPhase('idle');
            setCurrentStep(prev => Math.max(0, prev - 1));
          }}
          disabled={currentStep === 0}
          variant="outline"
          size="lg"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          {LEARNING_JOURNEY.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentStep 
                  ? "bg-blue-500 w-8" 
                  : index < currentStep 
                    ? "bg-green-500" 
                    : "bg-neutral-600"
              )}
            />
          ))}
        </div>
        
        <Button
          onClick={handleNextStep}
          disabled={currentStep === LEARNING_JOURNEY.length - 1}
          variant="primary"
          size="lg"
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Mathematical Discoveries */}
      {discoveries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <MathematicalDiscoveries 
            discoveries={discoveries}
            title="Your Statistical Insights"
            className="mt-8"
          />
        </motion.div>
      )}
    </VisualizationContainer>
  );
}

// Component sections with improved design
function ChallengeSection({ onNext }) {
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
    <motion.div 
      ref={contentRef}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Mathematical Introduction */}
      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl p-8 border border-blue-700/30">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Understanding Paired Two-Sample Tests
          </h3>
        </motion.div>
        
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg text-neutral-300 leading-relaxed">
            A paired two-sample test is used when we have two related measurements on the same subjects. 
            Instead of comparing two independent groups, we analyze the <span className="text-blue-400 font-semibold">differences</span> within pairs.
          </p>
          
          <div className="bg-neutral-800/50 rounded-xl p-6 space-y-3">
            <h4 className="text-lg font-semibold text-white mb-3">The Mathematical Insight</h4>
            <div className="space-y-2 text-neutral-300">
              <p className="flex items-start gap-2">
                <span className="text-green-400">→</span>
                <span>For each subject i: <span dangerouslySetInnerHTML={{ __html: `\\(D_i = X_{\\text{after},i} - X_{\\text{before},i}\\)` }} /></span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-400">→</span>
                <span>We transform a two-sample problem into a one-sample test on differences</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-400">→</span>
                <span>Test whether <span dangerouslySetInnerHTML={{ __html: `\\(\\mu_D = 0\\)` }} /> (no change) vs <span dangerouslySetInnerHTML={{ __html: `\\(\\mu_D \\neq 0\\)` }} /> (change exists)</span>
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-700/30">
            <p className="text-sm text-green-300">
              <span className="font-semibold">Why paired design is effective:</span> It eliminates individual variation. 
              When subjects serve as their own control, we can detect smaller effects with the same sample size.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Practical Example */}
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-700/30">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Let's Build Intuition Through an Example
          </h3>
        </motion.div>
        
        <motion.p 
          className="text-lg text-neutral-300 mb-6 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          We'll explore a hypothetical scenario: A tech company invested in a statistical quality control 
          training program for their engineers. Did the training improve their skills?
        </motion.p>
        
        <motion.div 
          className="bg-neutral-800/50 rounded-xl p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-neutral-400 italic mb-3">
            Note: This is a hypothetical example designed for educational purposes
          </p>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Investment</p>
              <p className="text-white font-semibold">$50,000 training program</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Participants</p>
              <p className="text-white font-semibold">10 Senior Engineers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Your Mission</p>
              <p className="text-white font-semibold">Use paired t-test to analyze the results.</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Button 
          onClick={onNext} 
          variant="primary"
          size="lg"
          className="w-full"
        >
          Begin the Analysis
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

function ExploreSection({ data, revealedEngineers, setRevealedEngineers, showDifferences, setShowDifferences, stats, onNext }) {
  const handleRevealEngineer = (id) => {
    setRevealedEngineers(prev => new Set([...prev, id]));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3"
      >
        <h3 className="text-xl font-semibold text-white">
          Meet the Engineers
        </h3>
        <p className="text-neutral-400">
          Click on each engineer below to explore their before and after training scores
        </p>
      </motion.div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {data.map((engineer, index) => (
          <motion.div
            key={engineer.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <motion.button
              onClick={() => handleRevealEngineer(engineer.id)}
              className={cn(
                "relative w-full p-4 rounded-xl transition-all duration-300",
                revealedEngineers.has(engineer.id) 
                  ? "bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-2 border-blue-500/50"
                  : "bg-neutral-800/50 border-2 border-neutral-700 hover:border-neutral-600"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-3xl mb-2">{engineer.avatar}</div>
              <p className="text-sm font-medium text-white">{engineer.name}</p>
              
              {revealedEngineers.has(engineer.id) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 space-y-1"
                >
                  <div className="text-xs text-neutral-400">Before</div>
                  <div className="font-mono text-blue-400">{engineer.before}</div>
                  <div className="text-xs text-neutral-400">After</div>
                  <div className="font-mono text-green-400">{engineer.after}</div>
                  
                  {showDifferences && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-2 border-t border-neutral-700"
                    >
                      <div className="text-xs text-neutral-400">Change</div>
                      <div className={cn(
                        "font-mono font-bold",
                        engineer.improved ? "text-green-400" : "text-red-400"
                      )}>
                        {engineer.improved ? "+" : ""}{engineer.after - engineer.before}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {revealedEngineers.size >= 5 && !showDifferences && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-700/30"
        >
          <p className="text-sm text-neutral-300 mb-3">
            Observed scores. Examine the pattern in the data. Calculate the differences to proceed.
          </p>
          <Button
            onClick={() => setShowDifferences(true)}
            variant="primary"
          >
            Calculate Differences
            <Calculator className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {showDifferences && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="py-2 px-4 text-left">Engineer</th>
                  <th className="py-2 px-4 text-center">Before (X₁ᵢ)</th>
                  <th className="py-2 px-4 text-center">After (X₂ᵢ)</th>
                  <th className="py-2 px-4 text-center">Difference (Dᵢ)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((eng, i) => (
                  <motion.tr
                    key={eng.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-neutral-800"
                  >
                    <td className="py-2 px-4">{eng.name}</td>
                    <td className="py-2 px-4 text-center font-mono text-blue-400">{eng.before}</td>
                    <td className="py-2 px-4 text-center font-mono text-green-400">{eng.after}</td>
                    <td className={cn(
                      "py-2 px-4 text-center font-mono font-bold",
                      eng.difference < 0 ? "text-green-400" : "text-purple-400"
                    )}>
                      {eng.difference < 0 ? eng.difference : `+${eng.difference}`}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-4 bg-neutral-800/50 rounded-lg"
          >
            <p className="text-sm">
              <span className="text-blue-400">Key Formula:</span> Dᵢ = X₁ᵢ - X₂ᵢ (Before - After)
            </p>
            <p className="text-sm text-green-400 mt-2">
              Negative differences indicate improvement!
            </p>
          </motion.div>

          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-700/30">
            <h4 className="font-semibold text-green-400 mb-3">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-400">Improved</p>
                <p className="text-2xl font-bold text-green-400">{stats.improvedCount} engineers</p>
              </div>
              <div>
                <p className="text-neutral-400">Average Change</p>
                <p className="text-2xl font-bold text-purple-400">
                  {Math.abs(stats.diffMean).toFixed(1)} points
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={onNext} 
            variant="success"
            size="lg"
            className="w-full"
          >
            Discover the Hidden Pattern
            <Sparkles className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function DiscoverSection({ scatterRef, showScatterInsight, setShowScatterInsight, stats, onNext, loading, scatterAnimationPhase, setScatterAnimationPhase }) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3 className="text-xl font-semibold text-white mb-2">The Hidden Pattern</h3>
        <p className="text-neutral-400">
          Let's plot before vs. after scores. What do you notice?
        </p>
      </motion.div>
      
      {scatterAnimationPhase === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <Button
            onClick={() => setScatterAnimationPhase('show')}
            variant="warning"
            size="lg"
          >
            Reveal the Pattern
            <Activity className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      )}

      {scatterAnimationPhase === 'show' && (
        <>
          {/* Compact Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h4 className="text-sm text-neutral-400 mb-3">The Data</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="py-1 px-3 text-left">Engineer</th>
                    <th className="py-1 px-3 text-center">Before</th>
                    <th className="py-1 px-3 text-center">After</th>
                    <th className="py-1 px-3 text-center">Diff</th>
                  </tr>
                </thead>
                <tbody>
                  {dataWithDifferences.slice(0, 5).map((eng, i) => (
                    <tr key={eng.id} className="border-b border-neutral-800">
                      <td className="py-1 px-3 text-xs">{eng.name}</td>
                      <td className="py-1 px-3 text-center font-mono text-blue-400">{eng.before}</td>
                      <td className="py-1 px-3 text-center font-mono text-green-400">{eng.after}</td>
                      <td className={cn(
                        "py-1 px-3 text-center font-mono text-xs",
                        eng.difference < 0 ? "text-green-400" : "text-purple-400"
                      )}>
                        {eng.difference}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-neutral-600">
                    <td colSpan="4" className="py-1 px-3 text-center text-xs text-neutral-500">
                      ... and 5 more engineers
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          <GraphContainer height="400px" className="relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/80 z-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
                />
              </div>
            )}
            <svg
              ref={scatterRef}
              viewBox="0 0 500 400"
              className="w-full h-full"
              style={{ display: 'block', width: '100%', height: '100%', minHeight: '400px' }}
            />
          </GraphContainer>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-700/30">
              <h4 className="font-semibold text-purple-400 mb-3">Paired Design Advantage</h4>
              <p className="text-sm text-neutral-300 mb-3">
                Engineers who scored high before training tend to score high after. 
                This strong correlation (r = {stats.correlation.toFixed(3)}) is the key advantage of paired design.
              </p>
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <p className="text-xs text-neutral-400 mb-2">Why this matters:</p>
                <ul className="text-sm text-neutral-300 space-y-1">
                  <li>• Individual variation is huge (some score 40, others 80)</li>
                  <li>• But each person's improvement is what we care about</li>
                  <li>• Pairing removes the noise of individual differences!</li>
                </ul>
              </div>
            </div>
            
            <Button 
              onClick={onNext} 
              variant="primary"
              size="lg"
              className="w-full"
            >
              See the Transformation
              <GitBranch className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </>
      )}
    </div>
  );
}

function TransformSection({ transformRef, animationPhase, setAnimationPhase, transformationComplete, onNext }) {
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
  }, [transformationComplete]);
  
  return (
    <div ref={contentRef} className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3 className="text-xl font-semibold text-white mb-2">The Statistical Magic</h3>
        <p className="text-neutral-400">
          Watch how we transform a complex two-sample problem into something simple!
        </p>
      </motion.div>

      {animationPhase === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Button
            onClick={() => setAnimationPhase('transform')}
            variant="warning"
            size="lg"
          >
            Start Transformation
            <GitBranch className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      )}

      {animationPhase === 'transform' && (
        <GraphContainer height={350}>
          <svg
            ref={transformRef}
            viewBox="0 0 600 350"
            className="w-full h-full"
          />
        </GraphContainer>
      )}

      {transformationComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-700/30">
            <h4 className="font-semibold text-green-400 mb-3">Transformation Complete!</h4>
            <p className="text-sm text-neutral-300 mb-3">
              By focusing on the differences, we've eliminated individual variation and can now use a simple one-sample t-test!
            </p>
            <div className="bg-neutral-800/50 rounded-lg p-4 font-mono text-sm">
              <p className="text-green-400"><span dangerouslySetInnerHTML={{ __html: `\\(H_0: \\mu_{\\text{difference}} = 0\\)` }} /> (no improvement)</p>
              <p className="text-red-400"><span dangerouslySetInnerHTML={{ __html: `\\(H_1: \\mu_{\\text{difference}} \\neq 0\\)` }} /> (there is a change)</p>
            </div>
          </div>
          
          <Button 
            onClick={onNext} 
            variant="primary"
            size="lg"
            className="w-full"
          >
            See the Final Results
            <TrendingUp className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function ResultsSection({ stats, showFinalResult, setShowFinalResult }) {
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
  }, [showFinalResult]);
  
  return (
    <div ref={contentRef} className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3 className="text-xl font-semibold text-white mb-2">Test Results</h3>
        <p className="text-neutral-400">
          Did the $50,000 training program work? Examine the statistical evidence.
        </p>
      </motion.div>

      {!showFinalResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <Button
            onClick={() => setShowFinalResult(true)}
            variant="primary"
            size="lg"
          >
            Reveal the Results
            <Target className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      )}

      {showFinalResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Test Results */}
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-700/30">
            <h4 className="text-2xl font-bold text-green-400 mb-4">Statistical Evidence of Improvement</h4>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-semibold text-white">Test Statistics</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Average Improvement:</span>
                    <span className="font-mono text-green-400">{Math.abs(stats.diffMean).toFixed(1)} points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">t-statistic:</span>
                    <span className="font-mono text-purple-400">{Math.abs(stats.testStatistic).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">p-value:</span>
                    <span className="font-mono text-red-400">{stats.pValue.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Decision (α = 0.05):</span>
                    <span className="font-semibold text-green-400">Reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /></span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h5 className="font-semibold text-white">The Power of Pairing</h5>
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <p className="text-xs text-neutral-400 mb-2">What if we ignored pairing?</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Unpaired p-value:</span>
                      <span className="font-mono text-yellow-400">{stats.unpairedPValue.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Decision:</span>
                      <span className="text-neutral-400">Fail to reject</span>
                    </div>
                  </div>
                  <p className="text-xs text-yellow-300 mt-3">
                    Without pairing, we would have missed the effect entirely!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-700/30">
            <h4 className="font-semibold text-blue-400 mb-4">Key Takeaways</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h5 className="font-medium text-white mb-2">Natural Pairing</h5>
                <p className="text-xs text-neutral-400">
                  When the same subjects are measured twice, pairing captures their individual characteristics
                </p>
              </div>
              
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h5 className="font-medium text-white mb-2">Increased Power</h5>
                <p className="text-xs text-neutral-400">
                  Pairing removes individual variation, making it easier to detect true effects
                </p>
              </div>
              
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <h5 className="font-medium text-white mb-2">Simple Analysis</h5>
                <p className="text-xs text-neutral-400">
                  Transform two samples into one by focusing on differences - an elegant statistical approach
                </p>
              </div>
            </div>
          </div>

          {/* When to Use */}
          <div className="bg-neutral-800/50 rounded-xl p-6">
            <h4 className="font-semibold text-white mb-4">When to Use Paired Tests</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                  <span className="text-xl">✓</span> Perfect For:
                </h5>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li>• Before/after measurements</li>
                  <li>• Twin studies</li>
                  <li>• Matched case-control studies</li>
                  <li>• Repeated measures on same subject</li>
                  <li>• Split-plot experiments</li>
                </ul>
              </div>
              
              <div>
                <h5 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                  <span className="text-xl">✗</span> Not Suitable For:
                </h5>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li>• Independent groups</li>
                  <li>• Different subjects in each group</li>
                  <li>• No logical pairing exists</li>
                  <li>• Groups of different sizes</li>
                  <li>• Cross-sectional studies</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}