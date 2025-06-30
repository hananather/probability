"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { MathematicalDiscoveries } from '@/components/ui/MathematicalDiscoveries';
import { ChevronRight, Sparkles, TrendingUp, AlertCircle, CheckCircle, Play, Pause } from 'lucide-react';

const colorScheme = createColorScheme('hypothesis');

// Enhanced vibrant color palette matching landing page
const vibrantColors = {
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  secondary: '#8b5cf6',
  secondaryLight: '#a78bfa',
  accent: '#14b8a6',
  accentLight: '#2dd4bf',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  danger: '#ef4444',
  dangerLight: '#f87171',
  success: '#10b981',
  successLight: '#34d399',
  info: '#06b6d4',
  infoLight: '#22d3ee',
  pink: '#ec4899',
  pinkLight: '#f472b6',
  teal: '#14b8a6',
  tealLight: '#2dd4bf',
};

// Optimized animation presets - matching landing page timing
const animationConfig = {
  fast: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
  normal: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
  smooth: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  spring: { type: "spring", stiffness: 300, damping: 25 }
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

// Memoized LaTeX component with proper rendering
const LaTeXDisplay = React.memo(({ formula, className = "" }) => {
  const ref = useRef(null);
  
  useEffect(() => {
    const renderMath = async () => {
      if (window.MathJax && ref.current) {
        try {
          await window.MathJax.typesetClear([ref.current]);
          await window.MathJax.typesetPromise([ref.current]);
        } catch (error) {
          console.error('MathJax error:', error);
        }
      }
    };
    
    renderMath();
    // Multiple retry attempts
    const timeouts = [100, 300, 500].map(delay => 
      setTimeout(renderMath, delay)
    );
    
    return () => timeouts.forEach(clearTimeout);
  }, [formula]);
  
  return (
    <div 
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: formula }}
    />
  );
});

LaTeXDisplay.displayName = 'LaTeXDisplay';

// Enhanced button with landing page styling
const ActionButton = ({ children, onClick, variant = "primary", disabled = false, className = "", icon: Icon }) => {
  const variants = {
    primary: {
      base: "from-blue-600 to-purple-600 text-white",
      hover: "hover:from-blue-500 hover:to-purple-500 hover:shadow-2xl hover:shadow-purple-500/25",
      glow: "shadow-lg shadow-purple-600/25"
    },
    secondary: {
      base: "from-gray-700 to-gray-800 text-white",
      hover: "hover:from-gray-600 hover:to-gray-700 hover:shadow-xl",
      glow: ""
    },
    success: {
      base: "from-emerald-600 to-teal-600 text-white",
      hover: "hover:from-emerald-500 hover:to-teal-500 hover:shadow-2xl hover:shadow-teal-500/25",
      glow: "shadow-lg shadow-teal-600/25"
    },
    danger: {
      base: "from-red-600 to-pink-600 text-white",
      hover: "hover:from-red-500 hover:to-pink-500 hover:shadow-2xl hover:shadow-pink-500/25",
      glow: "shadow-lg shadow-pink-600/25"
    }
  };

  const v = variants[variant];

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative px-6 py-3 rounded-xl font-semibold bg-gradient-to-r transition-all duration-300",
        "transform-gpu will-change-transform",
        v.base,
        v.hover,
        v.glow,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5" />}
        {children}
      </div>
    </motion.button>
  );
};

// Enhanced info card with better visual hierarchy
const InfoCard = ({ title, value, subtitle, color = "primary", icon: Icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ ...animationConfig.normal, delay }}
    className="relative group"
  >
    {/* Gradient background with higher opacity */}
    <div 
      className="absolute inset-0 bg-gradient-to-br rounded-xl opacity-90 group-hover:opacity-100 transition-opacity duration-300"
      style={{
        backgroundImage: `linear-gradient(135deg, ${vibrantColors[color]} 0%, ${vibrantColors[color + 'Light'] || vibrantColors.pink} 100%)`
      }}
    />
    
    {/* Glass effect overlay */}
    <div className="relative bg-gray-900/70 backdrop-blur-md rounded-xl p-6 border border-white/10 
                    group-hover:bg-gray-900/60 transition-all duration-300">
      {Icon && (
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ ...animationConfig.spring, delay: delay + 0.1 }}
        >
          <Icon className="w-8 h-8 mb-3" style={{ color: vibrantColors[color + 'Light'] }} />
        </motion.div>
      )}
      <p className="text-sm text-gray-300 mb-1">{title}</p>
      <p className="text-3xl font-bold font-mono text-white">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
      )}
    </div>
    
    {/* Hover glow effect */}
    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
         style={{
           background: `radial-gradient(circle at center, ${vibrantColors[color]}20 0%, transparent 70%)`,
           filter: 'blur(20px)'
         }}
    />
  </motion.div>
);

// Steps configuration
const stepsConfig = [
  { id: 'problem', title: 'The Problem', iconName: 'AlertCircle' },
  { id: 'comparison', title: 'Z vs T', iconName: 'TrendingUp' },
  { id: 'distribution', title: 'T-Distribution', iconName: 'Sparkles' },
  { id: 'calculation', title: 'Calculate', iconName: 'CheckCircle' }
];

// Icon mapping
const iconMap = {
  AlertCircle,
  TrendingUp,
  Sparkles,
  CheckCircle
};

// Main component with all fixes applied
export function TestForMeanUnknownVariance() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedDf, setSelectedDf] = useState(15);
  const [showNormal, setShowNormal] = useState(false);
  const [animateDistribution, setAnimateDistribution] = useState(false);
  const [highlightCritical, setHighlightCritical] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);

  const contentRef = useRef(null);
  const distributionRef = useRef(null);
  const comparisonRef = useRef(null);
  const cleanupRef = useRef(null);

  // Mark step as completed when moving forward
  const goToStep = useCallback((stepIndex) => {
    if (stepIndex > currentStep) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }
    setCurrentStep(stepIndex);
  }, [currentStep]);

  // Cleanup function for D3
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  const discoveries = [
    {
      id: 'unknown-variance',
      title: 'The Unknown σ Problem',
      description: 'When σ is unknown, we estimate it with S',
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
      title: 'Heavier Tails',
      description: 'T-distribution has heavier tails than normal',
      discovered: showNormal && currentStep >= 2,
      category: 'insight'
    },
    {
      id: 'critical-values',
      title: 'Conservative Testing',
      description: 't-critical > z-critical for same confidence',
      formula: 't_{\\alpha}(df) > z_{\\alpha}',
      discovered: highlightCritical,
      category: 'relationship'
    }
  ];

  // Step 1: Problem Introduction with enhanced visuals
  const renderProblemStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={animationConfig.normal}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={animationConfig.normal}
          className="text-4xl font-bold"
        >
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent 
                         bg-300% animate-gradient">
            Testing Reaction Times
          </span>
        </motion.h2>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...animationConfig.normal, delay: 0.1 }}
          className="text-lg text-gray-300 mt-4 max-w-2xl mx-auto leading-relaxed"
        >
          A psychologist claims the mean reaction time is 16.6 seconds. 
          We collected data to test this claim, but there's a catch...
        </motion.p>
      </div>

      {/* Enhanced data visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...animationConfig.smooth, delay: 0.2 }}
        className="relative overflow-hidden"
      >
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-75" />
        
        <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 m-[2px]">
          <h3 className="text-xl font-semibold text-white mb-6">Our Sample Data</h3>
          
          {/* Responsive grid with staggered animations */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-8">
            {sampleData.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  ...animationConfig.spring,
                  delay: 0.3 + idx * 0.02 // Faster stagger
                }}
                whileHover={{ 
                  scale: 1.15, 
                  y: -8,
                  rotate: 5,
                  transition: { duration: 0.2 }
                }}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg opacity-80 
                              group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-gray-900/80 backdrop-blur rounded-lg p-3 text-center m-[1px]">
                  <span className="text-sm font-mono text-white font-bold">
                    {value.toFixed(1)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Statistics cards with better spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <InfoCard 
              title="Sample Size" 
              value={`n = ${n}`}
              color="info"
              icon={TrendingUp}
              delay={0.5}
            />
            <InfoCard 
              title="Sample Mean" 
              value={`x̄ = ${sampleMean.toFixed(1)}`}
              subtitle="vs claimed μ₀ = 16.6"
              color="primary"
              icon={TrendingUp}
              delay={0.6}
            />
            <InfoCard 
              title="Sample SD" 
              value={`s = ${sampleSD.toFixed(3)}`}
              subtitle="Unknown σ!"
              color="warning"
              icon={AlertCircle}
              delay={0.7}
            />
          </div>

          {/* The revelation with animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...animationConfig.smooth, delay: 0.9 }}
            className="mt-8 flex justify-center"
          >
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(251, 191, 36, 0.3)",
                  "0 0 40px rgba(251, 191, 36, 0.5)",
                  "0 0 20px rgba(251, 191, 36, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-500/30 to-orange-500/30 
                       rounded-full border-2 border-amber-500/70 backdrop-blur-sm"
            >
              <AlertCircle className="w-6 h-6 text-amber-400" />
              <p className="text-amber-300 font-bold text-lg">
                We don't know the population variance σ!
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...animationConfig.normal, delay: 1 }}
        className="flex justify-center"
      >
        <ActionButton onClick={() => goToStep(1)} variant="primary" icon={Sparkles}>
          Discover the Solution
        </ActionButton>
      </motion.div>
    </motion.div>
  );

  // Step 2: Visual Comparison with responsive SVG
  const renderComparisonStep = () => {
    useEffect(() => {
      if (!comparisonRef.current || currentStep !== 1) return;

      const container = comparisonRef.current;
      const { width: containerWidth } = container.getBoundingClientRect();
      
      // Responsive dimensions
      const margin = { top: 40, right: 20, bottom: 60, left: 20 };
      const width = Math.min(containerWidth, 800);
      const height = Math.min(width * 0.5, 400);
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Clear previous content
      const svg = d3.select(container)
        .select('svg')
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      svg.selectAll("*").remove();

      // Create gradient definitions
      const defs = svg.append("defs");
      
      // Glow filter
      const filter = defs.append("filter")
        .attr("id", "comparison-glow");
      
      filter.append("feGaussianBlur")
        .attr("stdDeviation", "4")
        .attr("result", "coloredBlur");
      
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "coloredBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");

      // Gradients
      const createGradient = (id, color1, color2) => {
        const gradient = defs.append("linearGradient")
          .attr("id", id)
          .attr("x1", "0%").attr("y1", "0%")
          .attr("x2", "100%").attr("y2", "100%");
        
        gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", color1)
          .attr("stop-opacity", 0.9);
        
        gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", color2)
          .attr("stop-opacity", 0.9);
        
        return gradient;
      };

      createGradient("z-gradient", vibrantColors.info, vibrantColors.primary);
      createGradient("t-gradient", vibrantColors.secondary, vibrantColors.pink);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const boxWidth = (innerWidth - 40) / 2;
      const boxHeight = innerHeight;

      // Create comparison boxes with animations
      const boxes = [
        { 
          x: 0, 
          title: "If σ known (Z-test)", 
          gradient: "url(#z-gradient)",
          data: [
            { label: "Test Statistic", value: "Z = (X̄ - μ₀)/(σ/√n)", math: true },
            { label: "Distribution", value: "Z ~ N(0,1)" },
            { label: "Uses", value: "σ (parameter)", highlight: true }
          ]
        },
        { 
          x: boxWidth + 40, 
          title: "σ unknown (t-test)", 
          gradient: "url(#t-gradient)",
          data: [
            { label: "Test Statistic", value: "T = (X̄ - μ₀)/(S/√n)", math: true },
            { label: "Distribution", value: "T ~ t(n-1)" },
            { label: "Uses", value: "S (statistic)", highlight: true }
          ]
        }
      ];

      if (showComparison) {
        boxes.forEach((box, idx) => {
          const boxG = g.append("g")
            .attr("transform", `translate(${box.x},0)`);

          // Box with gradient and glow
          boxG.append("rect")
            .attr("width", boxWidth)
            .attr("height", boxHeight)
            .attr("fill", box.gradient)
            .attr("rx", 16)
            .style("filter", "url(#comparison-glow)")
            .style("opacity", 0)
            .transition()
            .duration(300)
            .delay(idx * 150)
            .style("opacity", 1);

          // Glass overlay
          boxG.append("rect")
            .attr("width", boxWidth)
            .attr("height", boxHeight)
            .attr("fill", "url(#glass-overlay)")
            .attr("rx", 16)
            .style("opacity", 0.1);

          // Title with animation
          boxG.append("text")
            .attr("x", boxWidth / 2)
            .attr("y", 35)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("font-size", `${Math.min(18, width / 40)}px`)
            .style("font-weight", "bold")
            .style("opacity", 0)
            .text(box.title)
            .transition()
            .duration(300)
            .delay(idx * 150 + 100)
            .style("opacity", 1);

          // Content with responsive sizing
          box.data.forEach((item, i) => {
            const y = 80 + i * 60;
            const fontSize = Math.min(16, width / 50);
            const labelSize = Math.min(12, width / 60);
            
            boxG.append("text")
              .attr("x", boxWidth / 2)
              .attr("y", y)
              .attr("text-anchor", "middle")
              .attr("fill", "rgba(255,255,255,0.8)")
              .style("font-size", `${labelSize}px`)
              .style("opacity", 0)
              .text(item.label)
              .transition()
              .duration(300)
              .delay(idx * 150 + 200 + i * 50)
              .style("opacity", 1);

            const textY = y + 25;
            if (item.math) {
              boxG.append("foreignObject")
                .attr("x", 10)
                .attr("y", textY - 20)
                .attr("width", boxWidth - 20)
                .attr("height", 40)
                .style("opacity", 0)
                .append("xhtml:div")
                .style("text-align", "center")
                .style("color", item.highlight ? vibrantColors.warningLight : "white")
                .style("font-size", `${fontSize}px`)
                .style("font-family", "monospace")
                .style("font-weight", item.highlight ? "bold" : "normal")
                .html(`<div>${item.value}</div>`)
                .transition()
                .duration(300)
                .delay(idx * 150 + 250 + i * 50)
                .style("opacity", 1);
            } else {
              boxG.append("text")
                .attr("x", boxWidth / 2)
                .attr("y", textY)
                .attr("text-anchor", "middle")
                .attr("fill", item.highlight ? vibrantColors.warningLight : "white")
                .style("font-size", `${fontSize}px`)
                .style("font-family", "monospace")
                .style("font-weight", item.highlight ? "bold" : "normal")
                .style("opacity", 0)
                .text(item.value)
                .transition()
                .duration(300)
                .delay(idx * 150 + 250 + i * 50)
                .style("opacity", 1);
            }
          });
        });

        // Key insight with pulsing animation
        setTimeout(() => {
          const insight = g.append("g")
            .attr("transform", `translate(${innerWidth / 2}, ${innerHeight - 30})`);

          const insightRect = insight.append("rect")
            .attr("x", -200)
            .attr("y", -25)
            .attr("width", 400)
            .attr("height", 50)
            .attr("fill", "url(#t-gradient)")
            .attr("rx", 25)
            .style("filter", "url(#comparison-glow)")
            .style("opacity", 0);

          insightRect.transition()
            .duration(500)
            .style("opacity", 0.3)
            .on("end", function() {
              d3.select(this)
                .transition()
                .duration(1500)
                .ease(d3.easeSinInOut)
                .style("opacity", 0.5)
                .transition()
                .duration(1500)
                .ease(d3.easeSinInOut)
                .style("opacity", 0.3)
                .on("end", function repeat() {
                  d3.select(this)
                    .transition()
                    .duration(1500)
                    .ease(d3.easeSinInOut)
                    .style("opacity", 0.5)
                    .transition()
                    .duration(1500)
                    .ease(d3.easeSinInOut)
                    .style("opacity", 0.3)
                    .on("end", repeat);
                });
            });

          insight.append("text")
            .attr("text-anchor", "middle")
            .attr("fill", vibrantColors.warningLight)
            .style("font-size", `${Math.min(16, width / 45)}px`)
            .style("font-weight", "bold")
            .style("opacity", 0)
            .text("S varies sample to sample → Extra uncertainty!")
            .transition()
            .duration(500)
            .style("opacity", 1);
        }, 800);
      }

      // Cleanup
      cleanupRef.current = () => {
        svg.selectAll("*").interrupt();
      };
    }, [showComparison, currentStep]);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={animationConfig.normal}
        className="space-y-8"
      >
        <motion.h3 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold text-center"
        >
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Why We Need the t-Distribution
          </span>
        </motion.h3>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl" />
          <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50">
            <div ref={comparisonRef} className="w-full overflow-x-auto">
              <svg style={{ width: "100%", minWidth: "600px", height: "400px" }} />
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {!showComparison ? (
            <ActionButton onClick={() => setShowComparison(true)} variant="primary" icon={Sparkles}>
              Reveal Comparison
            </ActionButton>
          ) : (
            <>
              <ActionButton onClick={() => goToStep(0)} variant="secondary">
                Back
              </ActionButton>
              <ActionButton onClick={() => goToStep(2)} variant="success" icon={TrendingUp}>
                Explore Distributions
              </ActionButton>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  // Step 3: Interactive T-Distribution with optimized D3
  const renderDistributionStep = () => {
    // Memoize expensive calculations
    const distributionData = useMemo(() => {
      const xValues = d3.range(-4, 4.1, 0.05);
      return {
        t: xValues.map(x => ({
          x,
          y: jStat.studentt.pdf(x, selectedDf)
        })),
        normal: showNormal ? xValues.map(x => ({
          x,
          y: jStat.normal.pdf(x, 0, 1)
        })) : []
      };
    }, [selectedDf, showNormal]);

    const criticalValue = useMemo(() => 
      highlightCritical ? jStat.studentt.inv(0.975, selectedDf) : null,
      [highlightCritical, selectedDf]
    );

    useEffect(() => {
      if (!distributionRef.current || currentStep !== 2) return;

      const container = distributionRef.current;
      const { width: containerWidth } = container.getBoundingClientRect();
      
      const margin = { top: 40, right: 60, bottom: 80, left: 60 };
      const width = Math.min(containerWidth, 700);
      const height = Math.min(width * 0.6, 400);
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Initialize or get existing SVG
      let svg = d3.select(container).select('svg');
      if (svg.empty()) {
        svg = d3.select(container)
          .append('svg')
          .attr("viewBox", `0 0 ${width} ${height}`)
          .attr("preserveAspectRatio", "xMidYMid meet");
      }

      // Create persistent groups
      let defs = svg.select('defs');
      if (defs.empty()) {
        defs = svg.append('defs');
        
        // Gradient definitions
        const tGradient = defs.append("linearGradient")
          .attr("id", "t-dist-gradient")
          .attr("x1", "0%").attr("y1", "0%")
          .attr("x2", "100%").attr("y2", "0%");
        
        tGradient.selectAll("stop").data([
          { offset: "0%", color: vibrantColors.primary },
          { offset: "50%", color: vibrantColors.secondary },
          { offset: "100%", color: vibrantColors.pink }
        ]).enter().append("stop")
          .attr("offset", d => d.offset)
          .attr("stop-color", d => d.color)
          .attr("stop-opacity", 1);

        // Glow filter
        const filter = defs.append("filter")
          .attr("id", "dist-glow");
        
        filter.append("feGaussianBlur")
          .attr("stdDeviation", "3")
          .attr("result", "coloredBlur");
        
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");
      }

      // Main group
      let g = svg.select('.main-group');
      if (g.empty()) {
        g = svg.append("g")
          .attr("class", "main-group")
          .attr("transform", `translate(${margin.left},${margin.top})`);
        
        // Background
        svg.insert("rect", ":first-child")
          .attr("width", width)
          .attr("height", height)
          .attr("fill", "#030712");
      }

      // Scales
      const xScale = d3.scaleLinear()
        .domain([-4, 4])
        .range([0, innerWidth]);

      const yScale = d3.scaleLinear()
        .domain([0, 0.45])
        .range([innerHeight, 0]);

      // Update axes
      let xAxisG = g.select('.x-axis');
      if (xAxisG.empty()) {
        xAxisG = g.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0, ${innerHeight})`);
        
        xAxisG.append("text")
          .attr("x", innerWidth / 2)
          .attr("y", 50)
          .attr("text-anchor", "middle")
          .attr("fill", "#e5e7eb")
          .style("font-size", "14px")
          .text("Standard Deviations from Mean");
      }
      
      xAxisG.transition().duration(300)
        .call(d3.axisBottom(xScale).ticks(9))
        .selectAll("text")
        .attr("fill", "#9ca3af");

      let yAxisG = g.select('.y-axis');
      if (yAxisG.empty()) {
        yAxisG = g.append("g")
          .attr("class", "y-axis");
        
        yAxisG.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -40)
          .attr("x", -innerHeight / 2)
          .attr("text-anchor", "middle")
          .attr("fill", "#e5e7eb")
          .style("font-size", "14px")
          .text("Probability Density");
      }
      
      yAxisG.transition().duration(300)
        .call(d3.axisLeft(yScale).ticks(6))
        .selectAll("text")
        .attr("fill", "#9ca3af");

      // Line generator
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveMonotoneX);

      // Update critical regions
      if (highlightCritical && criticalValue) {
        const criticalData = {
          left: distributionData.t.filter(d => d.x <= -criticalValue),
          right: distributionData.t.filter(d => d.x >= criticalValue)
        };

        const area = d3.area()
          .x(d => xScale(d.x))
          .y0(innerHeight)
          .y1(d => yScale(d.y))
          .curve(d3.curveMonotoneX);

        // Update or create critical regions
        ['left', 'right'].forEach(side => {
          let region = g.select(`.critical-${side}`);
          if (region.empty()) {
            region = g.append("path")
              .attr("class", `critical-${side}`)
              .attr("fill", vibrantColors.danger)
              .attr("fill-opacity", 0.3)
              .style("filter", "url(#dist-glow)");
          }
          
          region.datum(criticalData[side])
            .transition().duration(300)
            .attr("d", area);
        });

        // Critical value lines
        [-criticalValue, criticalValue].forEach((cv, i) => {
          let line = g.select(`.critical-line-${i}`);
          if (line.empty()) {
            line = g.append("line")
              .attr("class", `critical-line-${i}`)
              .attr("stroke", vibrantColors.danger)
              .attr("stroke-width", 2)
              .attr("stroke-dasharray", "5,3")
              .style("filter", "url(#dist-glow)");
          }
          
          line.transition().duration(300)
            .attr("x1", xScale(cv))
            .attr("x2", xScale(cv))
            .attr("y1", 0)
            .attr("y2", innerHeight);

          let label = g.select(`.critical-label-${i}`);
          if (label.empty()) {
            label = g.append("text")
              .attr("class", `critical-label-${i}`)
              .attr("text-anchor", "middle")
              .attr("fill", vibrantColors.danger)
              .style("font-size", "12px")
              .style("font-weight", "bold");
          }
          
          label.transition().duration(300)
            .attr("x", xScale(cv))
            .attr("y", innerHeight + 20)
            .text(cv.toFixed(3));
        });
      } else {
        // Remove critical regions if not shown
        g.selectAll('[class^="critical-"]').remove();
      }

      // Update distributions
      if (animateDistribution) {
        // T-distribution
        let tPath = g.select('.t-distribution');
        if (tPath.empty()) {
          tPath = g.append("path")
            .attr("class", "t-distribution")
            .attr("fill", "none")
            .attr("stroke", "url(#t-dist-gradient)")
            .attr("stroke-width", 3)
            .style("filter", "url(#dist-glow)");
        }
        
        tPath.datum(distributionData.t)
          .transition().duration(500)
          .attr("d", line);

        // Normal distribution
        if (showNormal) {
          let normalPath = g.select('.normal-distribution');
          if (normalPath.empty()) {
            normalPath = g.append("path")
              .attr("class", "normal-distribution")
              .attr("fill", "none")
              .attr("stroke", vibrantColors.teal)
              .attr("stroke-width", 2)
              .attr("stroke-dasharray", "5,3");
          }
          
          normalPath.datum(distributionData.normal)
            .style("opacity", 0)
            .transition().duration(500)
            .style("opacity", 0.7)
            .attr("d", line);
        } else {
          g.select('.normal-distribution').remove();
        }

        // Interactive overlay
        let overlay = g.select('.hover-overlay');
        if (overlay.empty()) {
          overlay = g.append("rect")
            .attr("class", "hover-overlay")
            .attr("width", innerWidth)
            .attr("height", innerHeight)
            .attr("fill", "none")
            .style("pointer-events", "all");

          const hoverGroup = g.append("g")
            .attr("class", "hover-group")
            .style("pointer-events", "none");

          hoverGroup.append("line")
            .attr("class", "hover-line")
            .attr("stroke", vibrantColors.warning)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3");

          const hoverInfo = hoverGroup.append("g")
            .attr("class", "hover-info");

          hoverInfo.append("rect")
            .attr("class", "hover-bg")
            .attr("fill", "#1f2937")
            .attr("stroke", vibrantColors.warning)
            .attr("stroke-width", 1)
            .attr("rx", 4);

          hoverInfo.append("text")
            .attr("class", "hover-text")
            .attr("fill", "white")
            .style("font-size", "12px");
        }

        overlay.on("mousemove", function(event) {
          const [mouseX] = d3.pointer(event);
          const x = xScale.invert(mouseX);
          
          if (x >= -4 && x <= 4) {
            const tY = jStat.studentt.pdf(x, selectedDf);
            const hoverGroup = g.select('.hover-group');
            
            hoverGroup.select('.hover-line')
              .attr("x1", mouseX)
              .attr("x2", mouseX)
              .attr("y1", 0)
              .attr("y2", innerHeight)
              .style("opacity", 0.7);

            const text = `x: ${x.toFixed(2)}, p: ${tY.toFixed(4)}`;
            const bbox = { width: text.length * 7, height: 20 };
            
            hoverGroup.select('.hover-bg')
              .attr("x", mouseX - bbox.width / 2 - 5)
              .attr("y", Math.max(5, yScale(tY) - 25))
              .attr("width", bbox.width + 10)
              .attr("height", bbox.height)
              .style("opacity", 0.9);

            hoverGroup.select('.hover-text')
              .attr("x", mouseX)
              .attr("y", Math.max(17, yScale(tY) - 10))
              .attr("text-anchor", "middle")
              .text(text)
              .style("opacity", 1);

            setHoveredPoint({ x: x.toFixed(2), y: tY.toFixed(4) });
          }
        })
        .on("mouseleave", function() {
          g.select('.hover-group').selectAll('*').style("opacity", 0);
          setHoveredPoint(null);
        });
      }

      cleanupRef.current = () => {
        g.selectAll("path").interrupt();
        g.selectAll("line").interrupt();
      };
    }, [selectedDf, showNormal, animateDistribution, highlightCritical, currentStep, distributionData, criticalValue]);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={animationConfig.normal}
        className="space-y-8"
      >
        <motion.h3 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold text-center"
        >
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            The t-Distribution Family
          </span>
        </motion.h3>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Controls with better organization */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ...animationConfig.normal, delay: 0.1 }}
            className="lg:w-1/3 space-y-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-xl" />
              <VisualizationSection className="relative p-6 bg-gray-900/90 backdrop-blur-xl border-gray-700/50">
                <h4 className="text-lg font-bold text-white mb-4">Interactive Controls</h4>
                <ControlGroup>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-2 flex items-center justify-between">
                        <span>Degrees of Freedom</span>
                        <span className="text-purple-400 font-bold text-lg">{selectedDf}</span>
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

                    {!animateDistribution ? (
                      <ActionButton 
                        onClick={() => setAnimateDistribution(true)} 
                        variant="primary"
                        className="w-full"
                        icon={Play}
                      >
                        Show Distribution
                      </ActionButton>
                    ) : (
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={showNormal}
                            onChange={(e) => setShowNormal(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-teal-500 
                                     focus:ring-2 focus:ring-teal-500 focus:ring-offset-0 focus:ring-offset-gray-900"
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
                            className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-red-500 
                                     focus:ring-2 focus:ring-red-500 focus:ring-offset-0 focus:ring-offset-gray-900"
                          />
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                            Show Critical Regions (α=0.05)
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </ControlGroup>
              </VisualizationSection>
            </div>

            {/* Dynamic insights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <VisualizationSection className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border-purple-700/50">
                <h4 className="text-lg font-bold text-white mb-3">Key Insights</h4>
                <div className="space-y-3 text-sm">
                  <AnimatePresence mode="wait">
                    {selectedDf <= 5 && (
                      <motion.div
                        key="very-heavy"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-start gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0 animate-pulse" />
                        <p className="text-red-300">
                          Very heavy tails - extreme values much more likely than normal
                        </p>
                      </motion.div>
                    )}
                    {selectedDf > 5 && selectedDf <= 15 && (
                      <motion.div
                        key="moderate"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
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
                        key="approaching"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
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
                        key="converged"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-start gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0 animate-pulse" />
                        <p className="text-green-300">
                          Nearly identical to normal - can use z-test approximation!
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </VisualizationSection>
            </motion.div>

            {hoveredPoint && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-xl border border-amber-500/50 backdrop-blur-sm"
              >
                <p className="text-xs text-amber-400 font-mono">
                  x = {hoveredPoint.x}, p(x) = {hoveredPoint.y}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Visualization with enhanced styling */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ...animationConfig.normal, delay: 0.2 }}
            className="lg:w-2/3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-2xl" />
              <GraphContainer 
                height="450px" 
                className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl p-2 border border-gray-800/50 shadow-2xl"
              >
                <div ref={distributionRef} className="w-full h-full" />
              </GraphContainer>
            </div>
          </motion.div>
        </div>

        <div className="flex justify-center gap-4">
          <ActionButton onClick={() => goToStep(1)} variant="secondary">
            Back
          </ActionButton>
          <ActionButton onClick={() => goToStep(3)} variant="success" icon={CheckCircle}>
            Perform the Test
          </ActionButton>
        </div>
      </motion.div>
    );
  };

  // Step 4: Test Calculation with cleaner UI
  const renderCalculationStep = () => {
    const testSteps = [
      {
        title: "Calculate Test Statistic",
        formula: `t_0 = \\frac{\\bar{x} - \\mu_0}{s/\\sqrt{n}} = \\frac{${sampleMean.toFixed(1)} - 16.6}{${sampleSD.toFixed(3)}/\\sqrt{16}}`,
        result: "t₀ = 2.968",
        explanation: "This measures how many standard errors our sample mean is from the claimed value."
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
        explanation: "The probability of seeing data this extreme if H₀ is true."
      },
      {
        title: "Make Decision",
        formula: "p\\text{-value} < \\alpha = 0.05",
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
        transition={animationConfig.normal}
        className="space-y-8"
      >
        <motion.h3 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold text-center"
        >
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Performing the t-Test
          </span>
        </motion.h3>

        <div className="max-w-3xl mx-auto">
          {/* Simplified progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center gap-2">
              {testSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ...animationConfig.spring, delay: idx * 0.05 }}
                  className="flex-1"
                >
                  <div className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    idx < currentTestStep ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                    idx === currentTestStep ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" :
                    "bg-gray-800"
                  )} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Current step display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={animationConfig.fast}
            >
              <div className="relative">
                <div className={cn(
                  "absolute inset-0 rounded-2xl blur-2xl transition-all duration-500",
                  testSteps[currentTestStep].isConclusion
                    ? "bg-gradient-to-br from-emerald-500/30 to-teal-500/30"
                    : "bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                )} />
                
                <VisualizationSection 
                  className={cn(
                    "relative p-8 backdrop-blur-xl",
                    testSteps[currentTestStep].isConclusion
                      ? "bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-emerald-700/50"
                      : "bg-gray-900/90 border-gray-700/50"
                  )}
                >
                  <h4 className="text-xl font-bold text-white mb-6">
                    Step {currentTestStep + 1}: {testSteps[currentTestStep].title}
                  </h4>
                  
                  <div className="bg-gray-900/70 rounded-xl p-6 mb-6 border border-gray-700/50">
                    <LaTeXDisplay 
                      formula={testSteps[currentTestStep].formula}
                      className="text-center text-xl text-white"
                    />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={cn(
                      "text-center text-3xl font-bold mb-4",
                      testSteps[currentTestStep].isConclusion ? "text-emerald-400" : "text-purple-400"
                    )}
                  >
                    {testSteps[currentTestStep].result}
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-300 text-center leading-relaxed"
                  >
                    {testSteps[currentTestStep].explanation}
                  </motion.p>

                  {!testSteps[currentTestStep].isConclusion && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex justify-center mt-6"
                    >
                      <ActionButton onClick={completeStep} variant="primary" icon={ChevronRight}>
                        Continue
                      </ActionButton>
                    </motion.div>
                  )}
                </VisualizationSection>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {testSteps[currentTestStep].isConclusion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-4"
          >
            <ActionButton onClick={() => goToStep(2)} variant="secondary">
              Review Distributions
            </ActionButton>
            <ActionButton 
              onClick={() => {
                setCurrentStep(0);
                setCompletedSteps(new Set([0, 1, 2, 3]));
                setCurrentTestStep(0);
                setStepResults([]);
              }} 
              variant="success"
              icon={Sparkles}
            >
              Start Over
            </ActionButton>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Simplified progress indicator
  const renderProgressIndicator = () => {
    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2 p-1 bg-gray-900/50 backdrop-blur rounded-full">
          {stepsConfig.map((step, idx) => {
            const Icon = iconMap[step.iconName];
            const isActive = idx === currentStep;
            const isCompleted = completedSteps.has(idx);
          
          return (
            <motion.button
              key={step?.id || idx}
              onClick={() => idx <= currentStep || isCompleted ? goToStep(idx) : null}
              disabled={idx > currentStep && !isCompleted}
              whileHover={{ scale: (idx <= currentStep || isCompleted) ? 1.05 : 1 }}
              whileTap={{ scale: (idx <= currentStep || isCompleted) ? 0.95 : 1 }}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                isActive 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/25" 
                  : isCompleted
                  ? "bg-gradient-to-r from-emerald-600/30 to-teal-600/30 text-emerald-400"
                  : "bg-transparent text-gray-500",
                (idx > currentStep && !isCompleted) && "cursor-not-allowed opacity-50"
              )}
            >
              {Icon && <Icon className="w-5 h-5" />}
              <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-20"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
          })}
        </div>
      </div>
    );
  };

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
      <div className="space-y-8">
        {renderProgressIndicator()}
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
        
        {/* Mathematical Discoveries with fade-in */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
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

export default TestForMeanUnknownVariance;