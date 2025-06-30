"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { 
  PlayCircle, ChevronRight, AlertTriangle, Shield, 
  Target, TrendingUp, Lightbulb, RefreshCw, Eye, EyeOff 
} from 'lucide-react';

// Get vibrant Chapter 6 color scheme
const chapterColors = createColorScheme('hypothesis');

// Animation variants for consistent motion
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Enhanced styled slider with micro-interactions
const StyledSlider = ({ value, onChange, min, max, step, label, color = "#10b981", description }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const sliderId = `slider-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  return (
    <motion.div 
      className="relative"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style jsx>{`
        #${sliderId} {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: #2a2a2a;
          outline: none;
          cursor: pointer;
          position: relative;
          overflow: visible;
        }
        
        #${sliderId}::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: ${percentage}%;
          background: linear-gradient(90deg, ${color}88 0%, ${color} 50%, ${color}dd 100%);
          border-radius: 4px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: ${isDragging ? `0 0 20px ${color}66` : 'none'};
        }
        
        #${sliderId}::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: ${isDragging ? '24px' : '20px'};
          height: ${isDragging ? '24px' : '20px'};
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff 0%, ${color} 100%);
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 ${isDragging ? '12px' : '0px'} ${color}20;
          transition: all 0.2s ease;
          position: relative;
          z-index: 2;
        }
        
        #${sliderId}::-moz-range-thumb {
          width: ${isDragging ? '24px' : '20px'};
          height: ${isDragging ? '24px' : '20px'};
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff 0%, ${color} 100%);
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 ${isDragging ? '12px' : '0px'} ${color}20;
          transition: all 0.2s ease;
          position: relative;
          z-index: 2;
        }
        
        #${sliderId}::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 8px ${color}30, 0 4px 12px rgba(0, 0, 0, 0.4);
        }
        
        #${sliderId}::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 8px ${color}30, 0 4px 12px rgba(0, 0, 0, 0.4);
        }
      `}</style>
      
      {/* Track fill animation */}
      <div className="relative">
        <div className="absolute inset-0 h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${color}88 0%, ${color} 50%, ${color}dd 100%)`,
              boxShadow: `0 0 20px ${color}66`
            }}
            animate={{
              opacity: isDragging ? 1 : 0.8
            }}
            transition={{ duration: 0.2 }}
          />
        </div>
        
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="w-full relative z-10"
        />
      </div>
      
      {/* Value display with animation */}
      <div className="flex justify-between text-xs text-neutral-400 mt-3">
        <span>{min}</span>
        <motion.div 
          className="relative"
          animate={{ scale: isDragging ? 1.1 : 1 }}
        >
          <motion.span 
            className="font-mono text-white font-bold text-sm px-3 py-1 rounded-md"
            style={{
              background: isDragging ? `${color}33` : 'transparent',
              border: isDragging ? `1px solid ${color}66` : '1px solid transparent'
            }}
            key={value}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {value}
          </motion.span>
        </motion.div>
        <span>{max}</span>
      </div>
      
      {description && (
        <motion.p 
          className="text-xs text-neutral-500 mt-2 text-center"
          animate={{ opacity: isHovered ? 1 : 0.7 }}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
};

// Animated progress indicator with glow
const ProgressIndicator = ({ phase, totalPhases }) => {
  return (
    <div className="flex items-center gap-3 mb-8">
      {Array.from({ length: totalPhases }, (_, i) => (
        <motion.div
          key={i}
          className={cn(
            "h-3 rounded-full transition-all duration-500 relative",
            i < phase ? "bg-gradient-to-r from-teal-400 to-cyan-400" : "bg-neutral-700",
            i === phase - 1 ? "w-20" : "w-10"
          )}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            boxShadow: i === phase - 1 ? '0 0 20px rgba(34, 211, 238, 0.5)' : 'none'
          }}
          transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
        >
          {i === phase - 1 && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Enhanced opening scenario with floating elements
const OpeningScenario = ({ onStart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();
  
  useEffect(() => {
    controls.start({
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    });
  }, [controls]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="text-center space-y-8 py-16 relative"
    >
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-orange-400/10 to-red-500/10"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-gradient-to-br from-teal-400/10 to-cyan-500/10"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -60, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Main content */}
      <motion.div
        animate={controls}
        className="relative inline-block"
      >
        <motion.div
          whileHover={{ 
            scale: 1.05,
            rotate: [0, -5, 5, 0],
            transition: { duration: 0.5 }
          }}
          className="inline-block"
        >
          <div className="w-36 h-36 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-2xl relative">
            <AlertTriangle className="w-20 h-20 text-white" />
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-red-500"
              animate={{
                opacity: [0.5, 0, 0.5],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="max-w-2xl mx-auto space-y-6 relative z-10"
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 
          className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500"
          variants={fadeInUp}
          style={{
            backgroundSize: '200% 200%',
            animation: 'gradient 3s ease infinite'
          }}
        >
          The Cement Quality Crisis
        </motion.h2>
        
        <motion.p 
          className="text-lg text-neutral-300 leading-relaxed"
          variants={fadeInUp}
        >
          You're the quality control manager at a cement factory. Your new production process 
          claims to produce cement with strength μ = 5000 kg/cm². But recent complaints suggest 
          the cement might be weaker.
        </motion.p>
        
        <motion.p 
          className="text-lg text-neutral-300"
          variants={fadeInUp}
        >
          How can you test this claim? What errors might you make? 
          And what are the consequences of being wrong?
        </motion.p>
      </motion.div>
      
      <motion.button
        onClick={onStart}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="inline-flex items-center gap-3 px-10 py-5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        variants={fadeInUp}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400"
          initial={{ x: "-100%" }}
          animate={{ x: isHovered ? "0%" : "-100%" }}
          transition={{ duration: 0.3 }}
        />
        <PlayCircle className="w-6 h-6 relative z-10" />
        <span className="relative z-10 text-lg">Begin Investigation</span>
        <ChevronRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
      </motion.button>
      
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </motion.div>
  );
};

// Enhanced error card with better animations
const ErrorCard = ({ type, title, icon: Icon, color, description, probability, consequence, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: type === "I" ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        delay: type === "I" ? 0.2 : 0.4,
        duration: 0.6,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.05, 
        y: -8,
        transition: { duration: 0.2 }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative p-6 rounded-xl border-2 transition-all duration-300",
        "backdrop-blur-sm",
        type === "I" 
          ? "bg-gradient-to-br from-blue-500/15 to-blue-600/15 border-blue-500/40" 
          : "bg-gradient-to-br from-red-500/15 to-red-600/15 border-red-500/40"
      )}
      style={{
        boxShadow: isHovered 
          ? `0 20px 40px -10px ${type === "I" ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` 
          : '0 10px 20px -5px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: type === "I" 
            ? 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.15) 0%, transparent 70%)'
        }}
        animate={{
          opacity: isHovered ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative z-10 flex items-start gap-4">
        <motion.div 
          className={cn(
            "p-3 rounded-lg",
            type === "I" ? "bg-blue-500/20" : "bg-red-500/20"
          )}
          animate={{
            rotate: isHovered ? 360 : 0
          }}
          transition={{ duration: 0.6 }}
        >
          <Icon className={cn(
            "w-6 h-6",
            type === "I" ? "text-blue-400" : "text-red-400"
          )} />
        </motion.div>
        
        <div className="flex-1">
          <h4 className={cn(
            "font-bold text-lg mb-1",
            type === "I" ? "text-blue-400" : "text-red-400"
          )}>
            {title}
          </h4>
          <p className="text-sm text-neutral-300 mb-3">{description}</p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Probability:</span>
              <motion.span 
                className={cn(
                  "text-3xl font-mono font-bold",
                  type === "I" ? "text-blue-400" : "text-red-400"
                )}
                key={probability}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {probability}%
              </motion.span>
            </div>
            
            <motion.div 
              className="text-xs text-neutral-400"
              animate={{ opacity: isHovered ? 1 : 0.8 }}
            >
              <span className="font-medium text-neutral-300">Impact:</span> {consequence}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function ErrorsAndPower() {
  // Scenario parameters
  const SCENARIO = {
    h0Mean: 5000,
    sigma: 120,
    n: 49,
    criticalValue: 4970,
    name: "Cement Strength Testing"
  };
  
  // State management
  const [phase, setPhase] = useState(0);
  const [criticalValue, setCriticalValue] = useState(SCENARIO.criticalValue);
  const [trueMean, setTrueMean] = useState(4990);
  const [sampleSize, setSampleSize] = useState(SCENARIO.n);
  const [showAreas, setShowAreas] = useState(true);
  const [selectedView, setSelectedView] = useState('distributions');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Refs for D3 elements
  const distributionRef = useRef(null);
  const powerCurveRef = useRef(null);
  const svgRef = useRef(null);
  const h0PathRef = useRef(null);
  const h1PathRef = useRef(null);
  const criticalLineRef = useRef(null);
  const typeIAreaRef = useRef(null);
  const typeIIAreaRef = useRef(null);
  const alphaLabelRef = useRef(null);
  const betaLabelRef = useRef(null);
  
  // Refs for LaTeX content
  const contentRef = useRef(null);
  
  // LaTeX processing
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
  }, [phase]);
  
  // Calculations
  const getSE = useCallback((n) => SCENARIO.sigma / Math.sqrt(n), []);
  
  const calculateErrors = useCallback((critical, h1Mean, n) => {
    const se = getSE(n);
    const alpha = jStat.normal.cdf(critical, SCENARIO.h0Mean, se);
    const beta = 1 - jStat.normal.cdf(critical, h1Mean, se);
    const power = 1 - beta;
    return { alpha, beta, power };
  }, [getSE]);
  
  const errors = calculateErrors(criticalValue, trueMean, sampleSize);
  
  // Get dynamic insight
  const getInsight = () => {
    if (errors.alpha < 0.01) {
      return {
        title: "Ultra Conservative",
        content: "You're being too cautious - missing many defective batches!",
        color: "text-orange-400",
        bg: "bg-orange-500/20"
      };
    }
    if (errors.alpha < 0.05 && errors.beta < 0.2) {
      return {
        title: "Well Balanced ✨",
        content: "Excellent trade-off between both types of errors!",
        color: "text-green-400",
        bg: "bg-green-500/20"
      };
    }
    if (errors.alpha > 0.1) {
      return {
        title: "Too Risky",
        content: "You're rejecting too many good batches!",
        color: "text-red-400",
        bg: "bg-red-500/20"
      };
    }
    if (errors.beta > 0.5) {
      return {
        title: "Low Power",
        content: "Missing most defective batches - dangerous!",
        color: "text-red-400",
        bg: "bg-red-500/20"
      };
    }
    return {
      title: "Reasonable",
      content: "Conventional error rates, but can we do better?",
      color: "text-blue-400",
      bg: "bg-blue-500/20"
    };
  };
  
  const insight = getInsight();
  
  // Initialize distribution visualization once
  useEffect(() => {
    if (!distributionRef.current || selectedView !== 'distributions' || phase < 1 || isInitialized) return;
    
    const svg = d3.select(distributionRef.current);
    svgRef.current = svg;
    
    const width = distributionRef.current.clientWidth;
    const height = 400;
    const margin = { top: 40, right: 80, bottom: 60, left: 80 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Store dimensions for updates
    svg.node().__dimensions = { innerWidth, innerHeight, margin };
    
    // Create static elements
    const defs = svg.append("defs");
    
    // Enhanced gradients
    const typeIGradient = defs.append("linearGradient")
      .attr("id", "typeI-gradient-enhanced")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    
    typeIGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0.9);
    
    typeIGradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#60a5fa")
      .attr("stop-opacity", 0.6);
    
    typeIGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#93c5fd")
      .attr("stop-opacity", 0.2);
    
    const typeIIGradient = defs.append("linearGradient")
      .attr("id", "typeII-gradient-enhanced")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    
    typeIIGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ef4444")
      .attr("stop-opacity", 0.9);
    
    typeIIGradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#f87171")
      .attr("stop-opacity", 0.6);
    
    typeIIGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#fca5a5")
      .attr("stop-opacity", 0.2);
    
    // Create grid group
    g.append("g").attr("class", "x-grid");
    g.append("g").attr("class", "y-grid");
    
    // Create axes groups
    g.append("g").attr("class", "x-axis");
    g.append("g").attr("class", "y-axis");
    
    // Create error areas
    typeIAreaRef.current = g.append("path").attr("class", "type-i-area");
    typeIIAreaRef.current = g.append("path").attr("class", "type-ii-area");
    
    // Create distribution curves
    h0PathRef.current = g.append("path").attr("class", "h0-curve");
    h1PathRef.current = g.append("path").attr("class", "h1-curve");
    
    // Create critical line
    criticalLineRef.current = g.append("line").attr("class", "critical-line");
    
    // Create labels group
    const labelsGroup = g.append("g").attr("class", "labels");
    labelsGroup.append("g").attr("class", "h0-label");
    labelsGroup.append("g").attr("class", "h1-label");
    labelsGroup.append("text").attr("class", "critical-label");
    
    // Create error labels
    alphaLabelRef.current = g.append("text").attr("class", "alpha-label");
    betaLabelRef.current = g.append("text").attr("class", "beta-label");
    
    setIsInitialized(true);
  }, [distributionRef, selectedView, phase, isInitialized]);
  
  // Update distribution visualization
  useEffect(() => {
    if (!isInitialized || !svgRef.current || selectedView !== 'distributions') return;
    
    const svg = svgRef.current;
    const { innerWidth, innerHeight, margin } = svg.node().__dimensions;
    const g = svg.select("g");
    
    // Calculate scales
    const se = getSE(sampleSize);
    const xMin = Math.min(SCENARIO.h0Mean - 5*se, trueMean - 5*se, 4900);
    const xMax = Math.max(SCENARIO.h0Mean + 5*se, trueMean + 5*se, 5100);
    
    const x = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, innerWidth])
      .nice();
    
    const maxPDF = Math.max(
      jStat.normal.pdf(SCENARIO.h0Mean, SCENARIO.h0Mean, se),
      jStat.normal.pdf(trueMean, trueMean, se)
    );
    
    const y = d3.scaleLinear()
      .domain([0, maxPDF * 1.2])
      .range([innerHeight, 0]);
    
    // Update axes with transitions
    g.select(".x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .transition()
      .duration(300)
      .call(d3.axisBottom(x).tickFormat(d => d.toFixed(0)));
    
    g.select(".y-axis")
      .transition()
      .duration(300)
      .call(d3.axisLeft(y).tickFormat(d => d.toFixed(3)));
    
    // Generate curve data
    const generateCurve = (mean, std) => {
      const step = (xMax - xMin) / 500;
      return d3.range(xMin, xMax, step).map(val => ({
        x: val,
        y: jStat.normal.pdf(val, mean, std)
      }));
    };
    
    const h0Data = generateCurve(SCENARIO.h0Mean, se);
    const h1Data = generateCurve(trueMean, se);
    
    // Line generator
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    // Area generator
    const area = d3.area()
      .x(d => x(d.x))
      .y0(innerHeight)
      .y1(d => y(d.y))
      .curve(d3.curveBasis);
    
    // Update error areas
    if (showAreas && phase >= 2) {
      const typeIData = h0Data.filter(d => d.x <= criticalValue);
      typeIAreaRef.current
        .datum(typeIData)
        .transition()
        .duration(500)
        .attr("d", area)
        .attr("fill", "url(#typeI-gradient-enhanced)")
        .attr("opacity", 1);
      
      const typeIIData = h1Data.filter(d => d.x >= criticalValue);
      typeIIAreaRef.current
        .datum(typeIIData)
        .transition()
        .duration(500)
        .attr("d", area)
        .attr("fill", "url(#typeII-gradient-enhanced)")
        .attr("opacity", 1);
    } else {
      typeIAreaRef.current.attr("opacity", 0);
      typeIIAreaRef.current.attr("opacity", 0);
    }
    
    // Update curves
    h0PathRef.current
      .datum(h0Data)
      .transition()
      .duration(500)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#60a5fa")
      .attr("stroke-width", 3)
      .attr("opacity", 0.9)
      .style("filter", "drop-shadow(0 0 12px rgba(96, 165, 250, 0.6))");
    
    h1PathRef.current
      .datum(h1Data)
      .transition()
      .duration(500)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#f87171")
      .attr("stroke-width", 3)
      .attr("opacity", 0.9)
      .style("filter", "drop-shadow(0 0 12px rgba(248, 113, 113, 0.6))");
    
    // Update critical line
    criticalLineRef.current
      .transition()
      .duration(300)
      .attr("x1", x(criticalValue))
      .attr("x2", x(criticalValue))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#fbbf24")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "8,4")
      .style("filter", "drop-shadow(0 0 12px rgba(251, 191, 36, 0.6))")
      .attr("opacity", 1);
    
    // Update error labels
    if (showAreas && errors.alpha > 0.001 && phase >= 2) {
      const alphaX = x(criticalValue - se/2);
      const alphaY = y(jStat.normal.pdf(criticalValue - se/2, SCENARIO.h0Mean, se)) / 2;
      
      alphaLabelRef.current
        .transition()
        .duration(300)
        .attr("x", alphaX)
        .attr("y", alphaY)
        .attr("text-anchor", "middle")
        .attr("fill", "#60a5fa")
        .style("font-size", "18px")
        .style("font-weight", "700")
        .text(`α = ${(errors.alpha * 100).toFixed(1)}%`)
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.8))")
        .attr("opacity", 1);
    } else {
      alphaLabelRef.current.attr("opacity", 0);
    }
    
    if (showAreas && errors.beta > 0.001 && phase >= 2) {
      const betaX = x(criticalValue + se/2);
      const betaY = y(jStat.normal.pdf(criticalValue + se/2, trueMean, se)) / 2;
      
      betaLabelRef.current
        .transition()
        .duration(300)
        .attr("x", betaX)
        .attr("y", betaY)
        .attr("text-anchor", "middle")
        .attr("fill", "#f87171")
        .style("font-size", "18px")
        .style("font-weight", "700")
        .text(`β = ${(errors.beta * 100).toFixed(1)}%`)
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.8))")
        .attr("opacity", 1);
    } else {
      betaLabelRef.current.attr("opacity", 0);
    }
    
  }, [criticalValue, trueMean, sampleSize, showAreas, phase, errors, getSE, isInitialized, selectedView]);
  
  // Power curve visualization (keeping original implementation)
  useEffect(() => {
    if (!powerCurveRef.current || selectedView !== 'power' || phase < 3) return;
    
    const svg = d3.select(powerCurveRef.current);
    svg.selectAll("*").remove();
    
    const width = powerCurveRef.current.clientWidth;
    const height = 400;
    const margin = { top: 40, right: 100, bottom: 60, left: 80 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Generate power curve data
    const generatePowerCurve = (n) => {
      const means = d3.range(4900, 5100, 2);
      return means.map(mean => {
        const errors = calculateErrors(criticalValue, mean, n);
        return { mean, power: errors.power };
      });
    };
    
    const sampleSizes = [25, 49, 100];
    const powerData = sampleSizes.map(n => ({
      n,
      data: generatePowerCurve(n)
    }));
    
    // Scales
    const x = d3.scaleLinear()
      .domain([4900, 5100])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);
    
    // Vibrant color scale
    const colorScale = d3.scaleOrdinal()
      .domain(sampleSizes)
      .range(['#ef4444', '#f59e0b', '#10b981']);
    
    // Grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x)
        .tickSize(-innerHeight)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.1);
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.1);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .style("font-size", "12px")
      .style("color", "#e5e7eb")
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 45)
      .attr("fill", "#ffffff")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("True Mean μ₁ (kg/cm²)");
    
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => (d * 100).toFixed(0) + "%"))
      .style("font-size", "12px")
      .style("color", "#e5e7eb")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#ffffff")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Power (1 - β)");
    
    // Reference lines
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", y(0.8))
      .attr("y2", y(0.8))
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.5);
    
    g.append("text")
      .attr("x", innerWidth - 5)
      .attr("y", y(0.8) - 8)
      .attr("text-anchor", "end")
      .attr("fill", "#10b981")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text("80% (Target Power)");
    
    // H0 mean line
    g.append("line")
      .attr("x1", x(SCENARIO.h0Mean))
      .attr("x2", x(SCENARIO.h0Mean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#60a5fa")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.5);
    
    // Line generator
    const line = d3.line()
      .x(d => x(d.mean))
      .y(d => y(d.power))
      .curve(d3.curveBasis);
    
    // Draw power curves with enhanced glow
    powerData.forEach((series, i) => {
      const path = g.append("path")
        .datum(series.data)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", colorScale(series.n))
        .attr("stroke-width", 3)
        .style("filter", `drop-shadow(0 0 12px ${colorScale(series.n)}88)`);
      
      // Animate
      const totalLength = path.node().getTotalLength();
      path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1500)
        .delay(i * 300)
        .ease(d3.easeCubicInOut)
        .attr("stroke-dashoffset", 0);
      
      // Labels
      const lastPoint = series.data[series.data.length - 1];
      const label = g.append("g")
        .attr("transform", `translate(${x(lastPoint.mean) + 10}, ${y(lastPoint.power)})`);
      
      label.append("rect")
        .attr("x", -5)
        .attr("y", -12)
        .attr("width", 45)
        .attr("height", 24)
        .attr("rx", 4)
        .attr("fill", "#1f2937")
        .attr("stroke", colorScale(series.n))
        .attr("stroke-width", 1)
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .delay(1500 + i * 300)
        .attr("opacity", 0.9);
      
      label.append("text")
        .attr("x", 17)
        .attr("y", 4)
        .attr("text-anchor", "middle")
        .attr("fill", colorScale(series.n))
        .style("font-size", "12px")
        .style("font-weight", "700")
        .text(`n=${series.n}`)
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .delay(1500 + i * 300)
        .attr("opacity", 1);
    });
    
    // Current point with enhanced pulse
    const currentPower = calculateErrors(criticalValue, trueMean, sampleSize).power;
    const currentPoint = g.append("g")
      .attr("transform", `translate(${x(trueMean)}, ${y(currentPower)})`);
    
    // Multiple pulse rings
    for (let i = 0; i < 3; i++) {
      currentPoint.append("circle")
        .attr("r", 15)
        .attr("fill", "none")
        .attr("stroke", colorScale(sampleSize))
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .transition()
        .duration(2000)
        .delay(2000 + i * 200)
        .attr("opacity", 0.8 - i * 0.2)
        .attr("r", 25 + i * 10)
        .transition()
        .duration(1000)
        .attr("opacity", 0)
        .attr("r", 35 + i * 10)
        .on("end", function repeat() {
          d3.select(this)
            .attr("r", 15)
            .transition()
            .duration(2000)
            .attr("opacity", 0.8 - i * 0.2)
            .attr("r", 25 + i * 10)
            .transition()
            .duration(1000)
            .attr("opacity", 0)
            .attr("r", 35 + i * 10)
            .on("end", repeat);
        });
    }
    
    currentPoint.append("circle")
      .attr("r", 8)
      .attr("fill", colorScale(sampleSize))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 3)
      .style("filter", `drop-shadow(0 0 12px ${colorScale(sampleSize)}cc)`)
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .delay(2000)
      .attr("opacity", 1);
    
  }, [criticalValue, trueMean, sampleSize, selectedView, phase, calculateErrors]);
  
  // Phase progression
  const handleStart = () => {
    setPhase(1);
  };
  
  const handleNextPhase = () => {
    if (phase < 3) {
      setPhase(phase + 1);
    }
  };
  
  const reset = () => {
    setCriticalValue(SCENARIO.criticalValue);
    setTrueMean(4990);
    setSampleSize(SCENARIO.n);
    setShowAreas(true);
  };
  
  return (
    <VisualizationContainer
      title="Type I & II Errors and Statistical Power"
      description="Master the fundamental trade-offs in hypothesis testing through interactive exploration."
    >
      <div ref={contentRef}>
        <AnimatePresence mode="wait">
          {phase === 0 ? (
            <OpeningScenario key="intro" onStart={handleStart} />
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Progress indicator */}
              <ProgressIndicator phase={phase} totalPhases={3} />
              
              {/* Phase 1: Understanding the Distributions */}
              {phase >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <motion.h3 
                      className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 mb-3"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{
                        backgroundSize: "200% 200%"
                      }}
                    >
                      Phase 1: Understanding the Distributions
                    </motion.h3>
                    <p className="text-neutral-300 max-w-2xl mx-auto text-lg">
                      These curves show the sampling distributions under two scenarios: 
                      when the cement is good (H₀) and when it's weak (H₁).
                    </p>
                  </div>
                  
                  {/* Tab selector with enhanced styling */}
                  <div className="flex gap-3 justify-center mb-6">
                    <motion.button
                      onClick={() => setSelectedView('distributions')}
                      className={cn(
                        "px-8 py-3 rounded-lg font-bold transition-all duration-300 relative overflow-hidden",
                        selectedView === 'distributions' 
                          ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg" 
                          : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {selectedView === 'distributions' && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400"
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 3
                          }}
                          style={{ opacity: 0.3 }}
                        />
                      )}
                      <span className="relative z-10">Error Distributions</span>
                    </motion.button>
                    
                    {phase >= 3 && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setSelectedView('power')}
                        className={cn(
                          "px-8 py-3 rounded-lg font-bold transition-all duration-300 relative overflow-hidden",
                          selectedView === 'power' 
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" 
                            : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {selectedView === 'power' && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400"
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatDelay: 3
                            }}
                            style={{ opacity: 0.3 }}
                          />
                        )}
                        <span className="relative z-10">Power Curves</span>
                      </motion.button>
                    )}
                  </div>
                  
                  {/* Main visualization with gradient background */}
                  <GraphContainer 
                    title={selectedView === 'distributions' ? 
                      "Sampling Distributions Under H₀ and H₁" : 
                      "Power Curves for Different Sample Sizes"
                    }
                    className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden"
                  >
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 opacity-20">
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background: "radial-gradient(circle at 20% 50%, rgba(34, 211, 238, 0.2) 0%, transparent 50%)"
                        }}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.2, 0.3, 0.2]
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background: "radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)"
                        }}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.2, 0.3, 0.2]
                        }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1
                        }}
                      />
                    </div>
                    
                    {selectedView === 'distributions' ? (
                      <svg ref={distributionRef} className="w-full relative z-10"></svg>
                    ) : (
                      <svg ref={powerCurveRef} className="w-full relative z-10"></svg>
                    )}
                    
                    {/* Dynamic insight bar */}
                    <motion.div 
                      className="mt-6 flex items-center justify-between border-t border-neutral-700 pt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="text-sm text-neutral-400">
                        <span className="text-neutral-300 font-medium">Scenario:</span> Testing cement strength requirements
                      </div>
                      <motion.div 
                        key={insight.title}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn(
                          "px-5 py-2 rounded-full text-sm font-bold shadow-lg",
                          insight.bg, insight.color
                        )}
                        style={{
                          boxShadow: `0 0 20px ${insight.color === 'text-green-400' ? 'rgba(34, 197, 94, 0.3)' : 
                                      insight.color === 'text-orange-400' ? 'rgba(251, 146, 60, 0.3)' :
                                      insight.color === 'text-red-400' ? 'rgba(239, 68, 68, 0.3)' :
                                      'rgba(59, 130, 246, 0.3)'}`
                        }}
                      >
                        {insight.title}
                      </motion.div>
                    </motion.div>
                  </GraphContainer>
                </motion.div>
              )}
              
              {/* Phase 2: Understanding the Errors */}
              {phase >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <motion.h3 
                      className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 mb-3"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{
                        backgroundSize: "200% 200%"
                      }}
                    >
                      Phase 2: The Two Types of Errors
                    </motion.h3>
                    <p className="text-neutral-300 max-w-2xl mx-auto text-lg">
                      Every decision carries risk. Let's explore what happens when we're wrong.
                    </p>
                  </div>
                  
                  <motion.div 
                    className="grid md:grid-cols-2 gap-6"
                    variants={staggerChildren}
                    initial="hidden"
                    animate="visible"
                  >
                    <ErrorCard
                      type="I"
                      title="Type I Error (α)"
                      icon={Shield}
                      color="blue"
                      description="Rejecting good cement batches"
                      probability={(errors.alpha * 100).toFixed(1)}
                      consequence="Economic loss, wasted materials"
                      isActive={phase >= 2}
                    />
                    <ErrorCard
                      type="II"
                      title="Type II Error (β)"
                      icon={AlertTriangle}
                      color="red"
                      description="Accepting weak cement batches"
                      probability={(errors.beta * 100).toFixed(1)}
                      consequence="Safety risk, structural failure"
                      isActive={phase >= 2}
                    />
                  </motion.div>
                  
                  {/* Interactive controls with enhanced design */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm rounded-xl p-10 space-y-10 border border-neutral-700/50"
                  >
                    <h4 className="text-xl font-bold text-white mb-8 text-center">
                      Experiment with the Trade-offs
                    </h4>
                    
                    <div className="grid lg:grid-cols-3 gap-10">
                      <ControlGroup label="Critical Value">
                        <StyledSlider
                          value={criticalValue}
                          onChange={setCriticalValue}
                          min={4960}
                          max={4990}
                          step={1}
                          color="#fbbf24"
                          description="Move left: ↓α, ↑β | Move right: ↑α, ↓β"
                        />
                      </ControlGroup>
                      
                      <ControlGroup label="True Mean (μ₁)">
                        <StyledSlider
                          value={trueMean}
                          onChange={setTrueMean}
                          min={4950}
                          max={5000}
                          step={1}
                          color="#f87171"
                          description={`Effect size: ${Math.abs(trueMean - SCENARIO.h0Mean)} kg/cm²`}
                        />
                      </ControlGroup>
                      
                      <ControlGroup label="Sample Size (n)">
                        <StyledSlider
                          value={sampleSize}
                          onChange={setSampleSize}
                          min={25}
                          max={100}
                          step={5}
                          color="#10b981"
                          description={
                            <span>
                              SE = σ/√n = {getSE(sampleSize).toFixed(1)}
                            </span>
                          }
                        />
                      </ControlGroup>
                    </div>
                    
                    <div className="flex gap-4 justify-center pt-6">
                      <motion.button
                        onClick={() => setShowAreas(!showAreas)}
                        className={cn(
                          "flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all relative overflow-hidden",
                          showAreas 
                            ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-400 border-2 border-teal-500/50" 
                            : "bg-neutral-700 text-neutral-400 border-2 border-neutral-600"
                        )}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: showAreas ? "0 0 20px rgba(34, 211, 238, 0.3)" : "0 0 10px rgba(255, 255, 255, 0.1)"
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {showAreas ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        {showAreas ? "Hide" : "Show"} Error Areas
                      </motion.button>
                      
                      <motion.button
                        onClick={reset}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-neutral-700 to-neutral-600 text-white font-bold hover:from-neutral-600 hover:to-neutral-500 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <RefreshCw className="w-5 h-5" />
                        Reset
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
              
              {/* Phase 3: Power and Advanced Concepts */}
              {phase >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <motion.h3 
                      className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 mb-3"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{
                        backgroundSize: "200% 200%"
                      }}
                    >
                      Phase 3: Statistical Power
                    </motion.h3>
                    <p className="text-neutral-300 max-w-2xl mx-auto text-lg">
                      Power is the probability of correctly detecting a problem when it exists. 
                      Higher power means better test performance.
                    </p>
                  </div>
                  
                  {/* Power card with animation */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-green-500/15 to-emerald-600/15 border-2 border-green-500/40 rounded-xl p-8 text-center relative overflow-hidden"
                    style={{
                      boxShadow: "0 0 40px rgba(34, 197, 94, 0.2)"
                    }}
                  >
                    {/* Animated background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        >
                          <Target className="w-10 h-10 text-green-400" />
                        </motion.div>
                        <h4 className="text-3xl font-bold text-green-400">Statistical Power</h4>
                      </div>
                      
                      <motion.div 
                        className="text-6xl font-mono font-bold text-green-400 mb-3"
                        key={errors.power}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        {(errors.power * 100).toFixed(1)}%
                      </motion.div>
                      
                      <p className="text-neutral-300 text-lg">
                        Probability of detecting weak cement when{" "}
                        <span dangerouslySetInnerHTML={{ __html: `\\(\\mu = ${trueMean}\\)` }} />
                      </p>
                    </div>
                  </motion.div>
                  
                  {/* Key insights with LaTeX */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm rounded-xl p-8 border border-neutral-700/50"
                  >
                    <h3 className="text-xl font-bold text-teal-400 mb-6 flex items-center gap-3">
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1.1, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                      >
                        <Lightbulb className="w-6 h-6" />
                      </motion.div>
                      Key Insights
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-8 text-sm">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-lg bg-neutral-800/30 border border-neutral-700/30"
                      >
                        <h4 className="font-bold text-white mb-3">The Fundamental Trade-off</h4>
                        <p className="text-neutral-300 leading-relaxed">
                          For fixed sample size, reducing Type I error (<span dangerouslySetInnerHTML={{ __html: `\\(\\alpha\\)` }} />) 
                          increases Type II error (<span dangerouslySetInnerHTML={{ __html: `\\(\\beta\\)` }} />). 
                          You can't minimize both simultaneously without increasing <span dangerouslySetInnerHTML={{ __html: `\\(n\\)` }} />.
                        </p>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-lg bg-neutral-800/30 border border-neutral-700/30"
                      >
                        <h4 className="font-bold text-white mb-3">Power Factors</h4>
                        <p className="text-neutral-300 leading-relaxed">
                          Power increases with: larger effect size <span dangerouslySetInnerHTML={{ __html: `\\(|\\mu_1 - \\mu_0|\\)` }} />, 
                          larger sample size <span dangerouslySetInnerHTML={{ __html: `\\(n\\)` }} />, 
                          higher <span dangerouslySetInnerHTML={{ __html: `\\(\\alpha\\)` }} /> level, 
                          and lower population variance <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma^2\\)` }} />.
                        </p>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-lg bg-neutral-800/30 border border-neutral-700/30"
                      >
                        <h4 className="font-bold text-white mb-3">Practical Implications</h4>
                        <p className="text-neutral-300 leading-relaxed">
                          {insight.content} Consider consequences: rejecting good cement (cost) vs. 
                          accepting weak cement (safety).
                        </p>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-lg bg-neutral-800/30 border border-neutral-700/30"
                      >
                        <h4 className="font-bold text-white mb-3">Sample Size Planning</h4>
                        <p className="text-neutral-300 leading-relaxed">
                          To achieve <span dangerouslySetInnerHTML={{ __html: `\\(\\alpha = 0.05\\)` }} /> and Power = 0.80:
                          <span className="block mt-2 text-center">
                            <span dangerouslySetInnerHTML={{ __html: `\\[n \\approx \\left(\\frac{(z_\\alpha + z_\\beta)\\sigma}{\\delta}\\right)^2\\]` }} />
                          </span>
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  {/* Decision matrix with animations */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm rounded-xl p-8 border border-neutral-700/50"
                  >
                    <h3 className="text-xl font-bold text-teal-400 mb-6">
                      Decision Matrix
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-neutral-700">
                            <th className="text-left py-4 px-6 text-neutral-400">Reality</th>
                            <th className="text-center py-4 px-6 text-neutral-400">
                              Reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /><br/>
                              <span className="text-xs font-normal">
                                (<span dangerouslySetInnerHTML={{ __html: `\\(\\bar{X} < ${criticalValue}\\)` }} />)
                              </span>
                            </th>
                            <th className="text-center py-4 px-6 text-neutral-400">
                              Fail to Reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /><br/>
                              <span className="text-xs font-normal">
                                (<span dangerouslySetInnerHTML={{ __html: `\\(\\bar{X} \\geq ${criticalValue}\\)` }} />)
                              </span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-neutral-700/50 hover:bg-neutral-800/30 transition-colors">
                            <td className="py-4 px-6 text-neutral-300 font-medium">
                              <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> True 
                              (<span dangerouslySetInnerHTML={{ __html: `\\(\\mu = 5000\\)` }} />)
                            </td>
                            <td className="text-center py-4 px-6">
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="inline-block"
                              >
                                <span className="text-blue-400 font-bold">Type I Error</span>
                                <br/>
                                <span className="text-neutral-500">
                                  <span dangerouslySetInnerHTML={{ __html: `\\(\\alpha = ${(errors.alpha * 100).toFixed(1)}\\%\\)` }} />
                                </span>
                              </motion.div>
                            </td>
                            <td className="text-center py-4 px-6">
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="inline-block"
                              >
                                <span className="text-green-400">✓ Correct</span>
                                <br/>
                                <span className="text-neutral-500">{((1 - errors.alpha) * 100).toFixed(1)}%</span>
                              </motion.div>
                            </td>
                          </tr>
                          <tr className="hover:bg-neutral-800/30 transition-colors">
                            <td className="py-4 px-6 text-neutral-300 font-medium">
                              <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> False 
                              (<span dangerouslySetInnerHTML={{ __html: `\\(\\mu = ${trueMean}\\)` }} />)
                            </td>
                            <td className="text-center py-4 px-6">
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="inline-block"
                              >
                                <span className="text-green-400">✓ Correct</span>
                                <br/>
                                <span className="text-neutral-500">Power = {(errors.power * 100).toFixed(1)}%</span>
                              </motion.div>
                            </td>
                            <td className="text-center py-4 px-6">
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="inline-block"
                              >
                                <span className="text-red-400 font-bold">Type II Error</span>
                                <br/>
                                <span className="text-neutral-500">
                                  <span dangerouslySetInnerHTML={{ __html: `\\(\\beta = ${(errors.beta * 100).toFixed(1)}\\%\\)` }} />
                                </span>
                              </motion.div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                </motion.div>
              )}
              
              {/* Navigation button with enhanced style */}
              {phase < 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center pt-8"
                >
                  <motion.button
                    onClick={handleNextPhase}
                    className="group flex items-center gap-4 px-10 py-4 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold shadow-xl hover:shadow-2xl transition-all relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      boxShadow: "0 10px 30px -10px rgba(34, 211, 238, 0.5)"
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400"
                      initial={{ x: "-100%" }}
                      animate={{ x: "-100%" }}
                      whileHover={{ x: "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10 text-lg">
                      Continue to {phase === 1 ? "Understanding Errors" : "Statistical Power"}
                    </span>
                    <ChevronRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </VisualizationContainer>
  );
}