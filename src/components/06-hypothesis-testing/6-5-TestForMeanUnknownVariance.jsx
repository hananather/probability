"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { motion, AnimatePresence } from "framer-motion";
import { cn, createColorScheme, typography, colors } from "@/lib/design-system";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '@/components/ui/VisualizationContainer';
import { RangeSlider } from "@/components/ui/RangeSlider";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MathematicalDiscoveries } from '@/components/ui/MathematicalDiscoveries';
import { ChevronRight, Sparkles, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const colorScheme = createColorScheme('hypothesis');

// Vibrant color palette inspired by landing page
const vibrantColors = {
  primary: '#3b82f6', // Bright blue
  secondary: '#8b5cf6', // Vibrant purple
  accent: '#10b981', // Emerald green
  warning: '#f59e0b', // Amber
  danger: '#ef4444', // Red
  success: '#10b981', // Green
  info: '#06b6d4', // Cyan
  pink: '#ec4899', // Pink
  teal: '#14b8a6', // Teal
};

// Animation presets for consistency
const animationConfig = {
  fast: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  medium: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  slow: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
  spring: { type: "spring", stiffness: 200, damping: 20 }
};

// Sample data
const sampleData = [
  18.0, 17.4, 15.5, 16.8, 19.0, 17.8, 17.4, 15.8,
  17.9, 16.3, 16.9, 18.6, 17.7, 16.4, 18.2, 18.7
];

const calculateStats = (data) => {
  const n = data.length;
  const mean = data.reduce((sum, x) => sum + x, 0) / n;
  const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1);
  const sd = Math.sqrt(variance);
  return { n, mean, sd, variance };
};

const { n, mean: sampleMean, sd: sampleSD } = calculateStats(sampleData);

// Enhanced button component with hover effects
const ActionButton = ({ children, onClick, variant = "primary", disabled = false, className = "" }) => {
  const variants = {
    primary: "from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl",
    secondary: "from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white",
    success: "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl",
    danger: "from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-6 py-3 rounded-lg font-semibold bg-gradient-to-r transition-all duration-300 transform",
        variants[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </motion.button>
  );
};

// Card component with enhanced styling
const InfoCard = ({ title, value, subtitle, color = "blue", icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -2 }}
    transition={animationConfig.fast}
    className="relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br opacity-10"
      style={{
        backgroundImage: `linear-gradient(135deg, ${vibrantColors[color]} 0%, ${vibrantColors.pink} 100%)`
      }}
    />
    <div className="relative bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
      {Icon && (
        <Icon className="w-6 h-6 mb-3" style={{ color: vibrantColors[color] }} />
      )}
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className="text-3xl font-bold font-mono" style={{ color: vibrantColors[color] }}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  </motion.div>
);

// Steps with progressive disclosure - defined outside component for SSR compatibility
const steps = [
  { id: 'problem', title: 'The Problem', icon: AlertCircle },
  { id: 'comparison', title: 'Z-test vs T-test', icon: TrendingUp },
  { id: 'distribution', title: 'T-Distribution Family', icon: Sparkles },
  { id: 'calculation', title: 'Perform the Test', icon: CheckCircle }
];

export function TestForMeanUnknownVariance() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedDf, setSelectedDf] = useState(15);
  const [showNormal, setShowNormal] = useState(false);
  const [animateDistribution, setAnimateDistribution] = useState(false);
  const [highlightCritical, setHighlightCritical] = useState(false);
  const [mathRendered, setMathRendered] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Log to verify correct component is loaded
  useEffect(() => {
    console.log('TestForMeanUnknownVariance (6-5) component loaded');
  }, []);

  const contentRef = useRef(null);
  const distributionRef = useRef(null);
  const comparisonRef = useRef(null);
  const animationCleanupRef = useRef(null);

  // Mark step as completed when moving forward
  const goToStep = (stepIndex) => {
    if (stepIndex > currentStep) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }
    setCurrentStep(stepIndex);
  };

  // Enhanced MathJax rendering with retry
  useEffect(() => {
    const processMathJax = () => {
      if (window.MathJax?.typesetPromise && contentRef.current) {
        window.MathJax.typesetPromise([contentRef.current])
          .then(() => setMathRendered(true))
          .catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    
    return () => clearTimeout(timeoutId);
  }, [currentStep]);

  // Cleanup D3 animations on unmount
  useEffect(() => {
    return () => {
      if (animationCleanupRef.current) {
        animationCleanupRef.current();
      }
    };
  }, []);

  const discoveries = [
    {
      id: 'unknown-variance',
      title: 'The Unknown σ Problem',
      description: 'When population variance is unknown, we estimate it with S',
      formula: 'S = \\sqrt{\\frac{\\sum(X_i - \\bar{X})^2}{n-1}}',
      discovered: currentStep >= 1,
      category: 'concept'
    },
    {
      id: 't-statistic',
      title: 'The T-Statistic',
      description: 'Replace σ with S, creating a new distribution',
      formula: 'T = \\frac{\\bar{X} - \\mu_0}{S/\\sqrt{n}} \\sim t(n-1)',
      discovered: currentStep >= 2,
      category: 'formula'
    },
    {
      id: 'heavier-tails',
      title: 'Heavier Tails = More Uncertainty',
      description: 'T-distribution accounts for the extra variability from estimating σ',
      discovered: showNormal && currentStep >= 2,
      category: 'insight'
    },
    {
      id: 'critical-values',
      title: 'Conservative Critical Values',
      description: 't-critical values > z-critical values for finite samples',
      formula: 't_{\\alpha}(df) > z_{\\alpha}',
      discovered: highlightCritical,
      category: 'relationship'
    }
  ];

  // Step 1: Problem Introduction with Visual Appeal
  const renderProblemStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={animationConfig.medium}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={animationConfig.fast}
          className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
        >
          Testing Reaction Times
        </motion.h2>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...animationConfig.fast, delay: 0.1 }}
          className="text-lg text-gray-300 mt-4 max-w-2xl mx-auto"
        >
          A psychologist claims the mean reaction time is 16.6 seconds. 
          We collected data to test this claim, but there's a catch...
        </motion.p>
      </div>

      {/* Data visualization with staggered animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...animationConfig.medium, delay: 0.2 }}
        className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Our Sample Data</h3>
        
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3 mb-8">
          {sampleData.map((value, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                ...animationConfig.spring,
                delay: 0.3 + idx * 0.03 
              }}
              whileHover={{ scale: 1.1, y: -4 }}
              className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg p-2 sm:p-3 text-center border border-cyan-500/30 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
            >
              <span className="text-xs sm:text-sm font-mono text-white font-semibold">
                {value.toFixed(1)}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Statistics cards */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...animationConfig.medium, delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
        >
          <InfoCard 
            title="Sample Size" 
            value={`n = ${n}`}
            color="info"
            icon={TrendingUp}
          />
          <InfoCard 
            title="Sample Mean" 
            value={`x̄ = ${sampleMean.toFixed(1)}`}
            subtitle="vs claimed μ₀ = 16.6"
            color="primary"
            icon={TrendingUp}
          />
          <InfoCard 
            title="Sample SD" 
            value={`s = ${sampleSD.toFixed(3)}`}
            subtitle="Unknown σ!"
            color="warning"
            icon={AlertCircle}
          />
        </motion.div>

        {/* The revelation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...animationConfig.medium, delay: 1.2 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/50">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <p className="text-amber-300 font-semibold">
              We don't know the population variance σ!
            </p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...animationConfig.fast, delay: 1.5 }}
        className="flex justify-center"
      >
        <ActionButton onClick={() => goToStep(1)} variant="primary">
          Discover the Solution
          <ChevronRight className="inline-block ml-2 w-5 h-5" />
        </ActionButton>
      </motion.div>
    </motion.div>
  );

  // Step 2: Visual Comparison with Enhanced Graphics
  const renderComparisonStep = () => {
    useEffect(() => {
      if (!comparisonRef.current || currentStep !== 1) return;

      const margin = { top: 40, right: 40, bottom: 60, left: 40 };
      const width = 800;
      const height = 350;
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      d3.select(comparisonRef.current).selectAll("*").remove();

      const svg = d3.select(comparisonRef.current)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      // Add gradient definitions
      const defs = svg.append("defs");
      
      const blueGradient = defs.append("linearGradient")
        .attr("id", "blue-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "100%");
      
      blueGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", vibrantColors.info)
        .attr("stop-opacity", 0.8);
      
      blueGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", vibrantColors.primary)
        .attr("stop-opacity", 0.8);

      const purpleGradient = defs.append("linearGradient")
        .attr("id", "purple-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "100%");
      
      purpleGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", vibrantColors.secondary)
        .attr("stop-opacity", 0.8);
      
      purpleGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", vibrantColors.pink)
        .attr("stop-opacity", 0.8);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const boxWidth = innerWidth / 2 - 30;
      const boxHeight = innerHeight;

      // Create comparison boxes with animations
      const boxes = [
        { x: 0, title: "If σ known (Z-test)", gradient: "url(#blue-gradient)", data: [
          { label: "Test Statistic", value: "Z = (X̄ - μ₀)/(σ/√n)" },
          { label: "Distribution", value: "Z ~ N(0,1)" },
          { label: "Uses", value: "σ (parameter)", highlight: true }
        ]},
        { x: innerWidth / 2 + 10, title: "σ unknown (t-test)", gradient: "url(#purple-gradient)", data: [
          { label: "Test Statistic", value: "T = (X̄ - μ₀)/(S/√n)" },
          { label: "Distribution", value: "T ~ t(n-1)" },
          { label: "Uses", value: "S (statistic)", highlight: true }
        ]}
      ];

      if (showComparison) {
        boxes.forEach((box, idx) => {
          const boxG = g.append("g")
            .attr("transform", `translate(${box.x},0)`);

          // Box background with gradient
          boxG.append("rect")
            .attr("width", boxWidth)
            .attr("height", boxHeight)
            .attr("fill", box.gradient)
            .attr("rx", 16)
            .style("opacity", 0)
            .transition()
            .duration(300)
            .delay(idx * 200)
            .style("opacity", 1);

          // Title
          boxG.append("text")
            .attr("x", boxWidth / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .style("opacity", 0)
            .text(box.title)
            .transition()
            .duration(300)
            .delay(idx * 200 + 100)
            .style("opacity", 1);

          // Content
          box.data.forEach((item, i) => {
            const y = 80 + i * 60;
            
            boxG.append("text")
              .attr("x", boxWidth / 2)
              .attr("y", y)
              .attr("text-anchor", "middle")
              .attr("fill", "rgba(255,255,255,0.7)")
              .style("font-size", "12px")
              .style("opacity", 0)
              .text(item.label)
              .transition()
              .duration(300)
              .delay(idx * 200 + 200 + i * 100)
              .style("opacity", 1);

            boxG.append("text")
              .attr("x", boxWidth / 2)
              .attr("y", y + 20)
              .attr("text-anchor", "middle")
              .attr("fill", item.highlight ? "#fbbf24" : "white")
              .style("font-size", "16px")
              .style("font-family", "monospace")
              .style("font-weight", item.highlight ? "bold" : "normal")
              .style("opacity", 0)
              .text(item.value)
              .transition()
              .duration(300)
              .delay(idx * 200 + 250 + i * 100)
              .style("opacity", 1);
          });
        });

        // Key insight animation
        setTimeout(() => {
          const insight = g.append("g")
            .attr("transform", `translate(${innerWidth / 2}, ${innerHeight - 30})`);

          insight.append("rect")
            .attr("x", -200)
            .attr("y", -20)
            .attr("width", 400)
            .attr("height", 40)
            .attr("fill", "url(#purple-gradient)")
            .attr("rx", 20)
            .style("opacity", 0)
            .transition()
            .duration(500)
            .style("opacity", 0.3);

          insight.append("text")
            .attr("text-anchor", "middle")
            .attr("fill", vibrantColors.warning)
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("opacity", 0)
            .text("S varies sample to sample → Extra uncertainty!")
            .transition()
            .duration(500)
            .style("opacity", 1);
        }, 1200);
      }

      // Cleanup
      animationCleanupRef.current = () => {
        g.selectAll("*").interrupt();
      };
    }, [showComparison, currentStep]);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={animationConfig.medium}
        className="space-y-8"
      >
        <motion.h3 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          Why We Need the t-Distribution
        </motion.h3>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-700/50 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <svg ref={comparisonRef} style={{ width: "100%", minWidth: "600px", height: "350px" }} />
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {!showComparison ? (
            <ActionButton onClick={() => setShowComparison(true)} variant="primary">
              <Sparkles className="inline-block mr-2 w-5 h-5" />
              Reveal Comparison
            </ActionButton>
          ) : (
            <>
              <ActionButton onClick={() => goToStep(0)} variant="secondary">
                Back
              </ActionButton>
              <ActionButton onClick={() => goToStep(2)} variant="success">
                Explore Distributions
                <ChevronRight className="inline-block ml-2 w-5 h-5" />
              </ActionButton>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  // Step 3: Interactive T-Distribution with Vibrant Visuals
  const renderDistributionStep = () => {
    useEffect(() => {
      if (!distributionRef.current || currentStep !== 2) return;

      const margin = { top: 40, right: 60, bottom: 80, left: 60 };
      const width = 700;
      const height = 400;
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      d3.select(distributionRef.current).selectAll("*").remove();

      const svg = d3.select(distributionRef.current)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      // Background
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#030712");

      // Gradient definitions
      const defs = svg.append("defs");
      
      // Glow filter
      const filter = defs.append("filter")
        .attr("id", "glow");
      
      filter.append("feGaussianBlur")
        .attr("stdDeviation", "3")
        .attr("result", "coloredBlur");
      
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "coloredBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");

      // T-distribution gradient
      const tGradient = defs.append("linearGradient")
        .attr("id", "t-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%");
      
      tGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", vibrantColors.primary)
        .attr("stop-opacity", 1);
      
      tGradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", vibrantColors.secondary)
        .attr("stop-opacity", 1);
      
      tGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", vibrantColors.pink)
        .attr("stop-opacity", 1);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Scales
      const xScale = d3.scaleLinear()
        .domain([-4, 4])
        .range([0, innerWidth]);

      const yScale = d3.scaleLinear()
        .domain([0, 0.45])
        .range([innerHeight, 0]);

      // Grid lines with subtle styling
      const gridLines = g.append("g").attr("class", "grid");

      // Vertical grid lines
      xScale.ticks(8).forEach(tick => {
        gridLines.append("line")
          .attr("x1", xScale(tick))
          .attr("x2", xScale(tick))
          .attr("y1", 0)
          .attr("y2", innerHeight)
          .attr("stroke", "#1f2937")
          .attr("stroke-dasharray", "2,2")
          .style("opacity", 0.5);
      });

      // Horizontal grid lines
      yScale.ticks(5).forEach(tick => {
        gridLines.append("line")
          .attr("x1", 0)
          .attr("x2", innerWidth)
          .attr("y1", yScale(tick))
          .attr("y2", yScale(tick))
          .attr("stroke", "#1f2937")
          .attr("stroke-dasharray", "2,2")
          .style("opacity", 0.5);
      });

      // Axes
      const xAxis = d3.axisBottom(xScale).ticks(9);
      const yAxis = d3.axisLeft(yScale).ticks(6);

      g.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxis)
        .selectAll("text")
        .attr("fill", "#9ca3af")
        .style("font-size", "12px");

      g.append("g")
        .call(yAxis)
        .selectAll("text")
        .attr("fill", "#9ca3af")
        .style("font-size", "12px");

      // Axis labels
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 50)
        .attr("text-anchor", "middle")
        .attr("fill", "#e5e7eb")
        .style("font-size", "14px")
        .text("Standard Deviations from Mean");

      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", -innerHeight / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#e5e7eb")
        .style("font-size", "14px")
        .text("Probability Density");

      // Generate data
      const xValues = d3.range(-4, 4.1, 0.05);
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveMonotoneX);

      // Critical region highlighting
      if (highlightCritical) {
        const criticalValue = jStat.studentt.inv(0.975, selectedDf);
        
        // Left tail
        const leftTailData = xValues
          .filter(x => x <= -criticalValue)
          .map(x => ({ x, y: jStat.studentt.pdf(x, selectedDf) }));

        const leftArea = d3.area()
          .x(d => xScale(d.x))
          .y0(innerHeight)
          .y1(d => yScale(d.y))
          .curve(d3.curveMonotoneX);

        g.append("path")
          .datum(leftTailData)
          .attr("fill", vibrantColors.danger)
          .attr("fill-opacity", 0.3)
          .attr("d", leftArea)
          .style("filter", "url(#glow)");

        // Right tail
        const rightTailData = xValues
          .filter(x => x >= criticalValue)
          .map(x => ({ x, y: jStat.studentt.pdf(x, selectedDf) }));

        g.append("path")
          .datum(rightTailData)
          .attr("fill", vibrantColors.danger)
          .attr("fill-opacity", 0.3)
          .attr("d", rightArea)
          .style("filter", "url(#glow)");

        const rightArea = d3.area()
          .x(d => xScale(d.x))
          .y0(innerHeight)
          .y1(d => yScale(d.y))
          .curve(d3.curveMonotoneX);

        // Critical value lines
        [-criticalValue, criticalValue].forEach(cv => {
          g.append("line")
            .attr("x1", xScale(cv))
            .attr("x2", xScale(cv))
            .attr("y1", 0)
            .attr("y2", innerHeight)
            .attr("stroke", vibrantColors.danger)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,3")
            .style("filter", "url(#glow)");

          g.append("text")
            .attr("x", xScale(cv))
            .attr("y", innerHeight + 20)
            .attr("text-anchor", "middle")
            .attr("fill", vibrantColors.danger)
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text(cv.toFixed(3));
        });
      }

      // Draw distributions
      if (animateDistribution) {
        // T-distribution
        const tData = xValues.map(x => ({
          x: x,
          y: jStat.studentt.pdf(x, selectedDf)
        }));

        const tPath = g.append("path")
          .datum(tData)
          .attr("fill", "none")
          .attr("stroke", "url(#t-gradient)")
          .attr("stroke-width", 3)
          .attr("d", line)
          .style("filter", "url(#glow)")
          .style("opacity", 0);

        tPath.transition()
          .duration(500)
          .style("opacity", 1);

        // Normal distribution if enabled
        if (showNormal) {
          const normalData = xValues.map(x => ({
            x: x,
            y: jStat.normal.pdf(x, 0, 1)
          }));

          const normalPath = g.append("path")
            .datum(normalData)
            .attr("fill", "none")
            .attr("stroke", vibrantColors.teal)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,3")
            .attr("d", line)
            .style("opacity", 0);

          normalPath.transition()
            .duration(500)
            .delay(300)
            .style("opacity", 0.7);
        }

        // Interactive hover area
        const hoverGroup = g.append("g").style("pointer-events", "none");
        
        const verticalLine = hoverGroup.append("line")
          .attr("stroke", vibrantColors.warning)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "3,3")
          .style("opacity", 0);

        const hoverInfo = hoverGroup.append("g");

        const hoverRect = hoverInfo.append("rect")
          .attr("fill", "#1f2937")
          .attr("stroke", vibrantColors.warning)
          .attr("stroke-width", 1)
          .attr("rx", 4)
          .style("opacity", 0);

        const hoverText = hoverInfo.append("text")
          .attr("fill", "white")
          .style("font-size", "12px")
          .style("opacity", 0);

        const overlay = g.append("rect")
          .attr("width", innerWidth)
          .attr("height", innerHeight)
          .attr("fill", "none")
          .style("pointer-events", "all")
          .on("mousemove", function(event) {
            const [mouseX] = d3.pointer(event);
            const x = xScale.invert(mouseX);
            
            if (x >= -4 && x <= 4) {
              const tY = jStat.studentt.pdf(x, selectedDf);
              
              verticalLine
                .attr("x1", mouseX)
                .attr("x2", mouseX)
                .attr("y1", 0)
                .attr("y2", innerHeight)
                .style("opacity", 0.7);

              const text = `x: ${x.toFixed(2)}, p: ${tY.toFixed(4)}`;
              const bbox = { width: text.length * 7, height: 20 };
              
              hoverRect
                .attr("x", mouseX - bbox.width / 2 - 5)
                .attr("y", yScale(tY) - 25)
                .attr("width", bbox.width + 10)
                .attr("height", bbox.height)
                .style("opacity", 0.9);

              hoverText
                .attr("x", mouseX)
                .attr("y", yScale(tY) - 10)
                .attr("text-anchor", "middle")
                .text(text)
                .style("opacity", 1);

              setHoveredPoint({ x: x.toFixed(2), y: tY.toFixed(4) });
            }
          })
          .on("mouseleave", function() {
            verticalLine.style("opacity", 0);
            hoverRect.style("opacity", 0);
            hoverText.style("opacity", 0);
            setHoveredPoint(null);
          });
      }

      // Legend
      const legend = g.append("g")
        .attr("transform", `translate(${innerWidth - 120}, 20)`);

      const legendItems = [
        { label: `t(${selectedDf})`, color: "url(#t-gradient)", dash: false },
        ...(showNormal ? [{ label: "N(0,1)", color: vibrantColors.teal, dash: true }] : [])
      ];

      legendItems.forEach((item, i) => {
        const y = i * 25;
        
        legend.append("line")
          .attr("x1", 0)
          .attr("x2", 25)
          .attr("y1", y + 10)
          .attr("y2", y + 10)
          .attr("stroke", item.color)
          .attr("stroke-width", 2.5)
          .attr("stroke-dasharray", item.dash ? "5,3" : null)
          .style("filter", !item.dash ? "url(#glow)" : null);

        legend.append("text")
          .attr("x", 30)
          .attr("y", y + 14)
          .attr("fill", "#e5e7eb")
          .style("font-size", "14px")
          .text(item.label);
      });

      animationCleanupRef.current = () => {
        g.selectAll("*").interrupt();
      };
    }, [selectedDf, showNormal, animateDistribution, highlightCritical, currentStep]);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={animationConfig.medium}
        className="space-y-8"
      >
        <motion.h3 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          The t-Distribution Family
        </motion.h3>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Controls */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ...animationConfig.fast, delay: 0.2 }}
            className="lg:w-1/3 space-y-4"
          >
            <VisualizationSection className="p-6 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border-gray-700/50">
              <h4 className="text-lg font-bold text-white mb-4">Interactive Controls</h4>
              <ControlGroup>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">
                      Degrees of Freedom: <span className="text-purple-400 font-bold">{selectedDf}</span>
                    </label>
                    <RangeSlider
                      value={selectedDf}
                      onChange={setSelectedDf}
                      min={1}
                      max={50}
                      step={1}
                      className="mb-2"
                    />
                    <div className="text-xs text-gray-500">
                      n = {selectedDf + 1} observations
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={showNormal}
                        onChange={(e) => setShowNormal(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-teal-500 focus:ring-teal-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        Compare with Normal
                      </span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={highlightCritical}
                        onChange={(e) => setHighlightCritical(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-red-500 focus:ring-red-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        Show Critical Regions (α=0.05)
                      </span>
                    </label>
                  </div>

                  {!animateDistribution && (
                    <ActionButton 
                      onClick={() => setAnimateDistribution(true)} 
                      variant="primary"
                      className="w-full"
                    >
                      <Sparkles className="inline-block mr-2 w-5 h-5" />
                      Animate Distribution
                    </ActionButton>
                  )}
                </div>
              </ControlGroup>
            </VisualizationSection>

            {/* Insights */}
            <VisualizationSection className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border-purple-700/50">
              <h4 className="text-lg font-bold text-white mb-3">Key Insights</h4>
              <div className="space-y-3 text-sm">
                {selectedDf <= 5 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <p className="text-red-300">
                      Very heavy tails - extreme values more likely than normal
                    </p>
                  </motion.div>
                )}
                {selectedDf > 5 && selectedDf <= 15 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <p className="text-amber-300">
                      Moderate tails - still noticeably different from normal
                    </p>
                  </motion.div>
                )}
                {selectedDf > 15 && selectedDf < 30 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <p className="text-blue-300">
                      Getting closer - approaching normal distribution
                    </p>
                  </motion.div>
                )}
                {selectedDf >= 30 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <p className="text-green-300">
                      Nearly identical to normal - can use z-test approximation
                    </p>
                  </motion.div>
                )}
              </div>
            </VisualizationSection>

            {hoveredPoint && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-500/50"
              >
                <p className="text-xs text-amber-400 font-mono">
                  x = {hoveredPoint.x}, p(x) = {hoveredPoint.y}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Visualization */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ...animationConfig.fast, delay: 0.3 }}
            className="lg:w-2/3"
          >
            <GraphContainer 
              height="450px" 
              className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-2 border border-gray-800/50"
            >
              <svg ref={distributionRef} style={{ width: "100%", height: "100%" }} />
            </GraphContainer>
          </motion.div>
        </div>

        <div className="flex justify-center gap-4">
          <ActionButton onClick={() => goToStep(1)} variant="secondary">
            Back
          </ActionButton>
          <ActionButton onClick={() => goToStep(3)} variant="success">
            Perform the Test
            <ChevronRight className="inline-block ml-2 w-5 h-5" />
          </ActionButton>
        </div>
      </motion.div>
    );
  };

  // Step 4: Test Calculation with Visual Feedback
  const renderCalculationStep = () => {
    const testSteps = [
      {
        title: "Calculate Test Statistic",
        formula: `t_0 = \\frac{\\bar{x} - \\mu_0}{s/\\sqrt{n}} = \\frac{${sampleMean.toFixed(1)} - 16.6}{${sampleSD.toFixed(3)}/\\sqrt{16}} = 2.968`,
        result: "t₀ = 2.968",
        explanation: "This tells us how many standard errors our sample mean is from the claimed value."
      },
      {
        title: "Find Degrees of Freedom",
        formula: "df = n - 1 = 16 - 1 = 15",
        result: "df = 15",
        explanation: "We lose one degree of freedom because we estimated μ with x̄."
      },
      {
        title: "Determine p-value",
        formula: "P(T_{15} > 2.968)",
        result: "0.0025 < p-value < 0.005",
        explanation: "The probability of seeing a test statistic this extreme if H₀ is true."
      },
      {
        title: "Make Decision",
        formula: "p-value < \\alpha = 0.05",
        result: "Reject H₀",
        explanation: "Strong evidence that the true mean reaction time exceeds 16.6 seconds.",
        isConclusion: true
      }
    ];

    const [currentTestStep, setCurrentTestStep] = useState(0);
    const [stepResults, setStepResults] = useState([]);

    const completeStep = () => {
      if (currentTestStep < testSteps.length - 1) {
        setStepResults([...stepResults, currentTestStep]);
        setCurrentTestStep(currentTestStep + 1);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={animationConfig.medium}
        className="space-y-8"
      >
        <motion.h3 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-bold text-center bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
        >
          Performing the t-Test
        </motion.h3>

        <div className="max-w-3xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              {testSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ...animationConfig.spring, delay: idx * 0.1 }}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300",
                    idx < currentTestStep ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white" :
                    idx === currentTestStep ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse" :
                    "bg-gray-800 text-gray-500"
                  )}
                >
                  {idx < currentTestStep ? <CheckCircle className="w-6 h-6" /> : idx + 1}
                </motion.div>
              ))}
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentTestStep / (testSteps.length - 1)) * 100}%` }}
                transition={animationConfig.medium}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
              />
            </div>
          </div>

          {/* Current step display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={animationConfig.fast}
            >
              <VisualizationSection 
                className={cn(
                  "p-8 backdrop-blur-sm",
                  testSteps[currentTestStep].isConclusion
                    ? "bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-700/50"
                    : "bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50"
                )}
              >
                <h4 className="text-xl font-bold text-white mb-4">
                  Step {currentTestStep + 1}: {testSteps[currentTestStep].title}
                </h4>
                
                <div className="bg-gray-900/50 rounded-xl p-6 mb-4 border border-gray-700/50">
                  <div 
                    ref={contentRef}
                    className="text-center text-xl font-mono text-white"
                    dangerouslySetInnerHTML={{ 
                      __html: testSteps[currentTestStep].formula 
                    }}
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={cn(
                    "text-center text-2xl font-bold mb-4",
                    testSteps[currentTestStep].isConclusion ? "text-emerald-400" : "text-purple-400"
                  )}
                >
                  {testSteps[currentTestStep].result}
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-300 text-center"
                >
                  {testSteps[currentTestStep].explanation}
                </motion.p>

                {!testSteps[currentTestStep].isConclusion && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex justify-center mt-6"
                  >
                    <ActionButton onClick={completeStep} variant="primary">
                      Continue
                      <ChevronRight className="inline-block ml-2 w-5 h-5" />
                    </ActionButton>
                  </motion.div>
                )}
              </VisualizationSection>
            </motion.div>
          </AnimatePresence>

          {/* Completed steps summary */}
          {stepResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 space-y-2"
            >
              {stepResults.map(idx => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 text-sm text-gray-400"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Step {idx + 1}: {testSteps[idx].result}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {testSteps[currentTestStep].isConclusion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex justify-center gap-4"
          >
            <ActionButton onClick={() => goToStep(2)} variant="secondary">
              Review Distributions
            </ActionButton>
            <ActionButton 
              onClick={() => {
                setCurrentStep(0);
                setCompletedSteps(new Set([0, 1, 2, 3]));
              }} 
              variant="success"
            >
              Start Over
              <Sparkles className="inline-block ml-2 w-5 h-5" />
            </ActionButton>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Progress indicator at the top
  const renderProgressIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentStep;
          const isCompleted = completedSteps.has(idx);
          
          return (
            <motion.button
              key={step.id}
              onClick={() => goToStep(idx)}
              disabled={idx > currentStep && !isCompleted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                isActive 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" 
                  : isCompleted
                  ? "bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-400 border border-emerald-600/50"
                  : "bg-gray-800/50 text-gray-500 border border-gray-700/50",
                (idx > currentStep && !isCompleted) && "cursor-not-allowed opacity-50"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // Main render
  const renderContent = () => {
    switch (currentStep) {
      case 0: return renderProblemStep();
      case 1: return renderComparisonStep();
      case 2: return renderDistributionStep();
      case 3: return renderCalculationStep();
      default: return renderProblemStep();
    }
  };

  return (
    <VisualizationContainer
      title="6.5 Test for a Mean (Unknown Variance)"
      description={
        <>
          <p className={typography.description}>
            <strong>The Reality:</strong> In practice, we rarely know the population variance σ. 
            This creates a fundamental challenge in hypothesis testing.
          </p>
          <p className={cn(typography.description, "mt-2")}>
            Discover how <span className="text-purple-400 font-semibold">Student's t-distribution</span> elegantly 
            solves this problem by accounting for the extra uncertainty when estimating σ from our sample.
          </p>
        </>
      }
    >
      <div ref={contentRef} className="space-y-8">
        {renderProgressIndicator()}
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
        
        {/* Mathematical Discoveries */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <MathematicalDiscoveries 
            discoveries={discoveries}
            title="Concepts You've Discovered"
          />
        </motion.div>
      </div>
    </VisualizationContainer>
  );
}