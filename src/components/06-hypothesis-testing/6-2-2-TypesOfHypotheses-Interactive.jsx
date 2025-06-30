"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { motion, AnimatePresence } from "framer-motion";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { ChevronRight, ChevronDown, Sparkles, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

const colorScheme = createColorScheme('hypothesis');

// Memoized LaTeX component to prevent re-renders
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

// Z-Score Calculation Component with proper LaTeX rendering
const ZScoreCalculation = React.memo(({ sampleMean, mu0, sigma = 2.5, n = 30 }) => {
  const ref = useRef(null);
  const zScore = (sampleMean - mu0) / (sigma / Math.sqrt(n));
  
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
  }, [sampleMean, mu0, sigma, n, zScore]);
  
  return (
    <motion.div 
      ref={ref}
      className="bg-gradient-to-r from-neutral-900/80 to-neutral-800/80 backdrop-blur-md p-6 rounded-xl border border-purple-500/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h4 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
        Calculating the Test Statistic
      </h4>
      <div className="space-y-3">
        <div className="text-white">
          <span>Formula: </span>
          <span dangerouslySetInnerHTML={{ __html: `\\(z = \\frac{\\bar{x} - \\mu_0}{\\sigma / \\sqrt{n}}\\)` }} />
        </div>
        <div className="text-white">
          <span>Substituting values: </span>
          <span dangerouslySetInnerHTML={{ 
            __html: `\\(z = \\frac{${formatNumber(sampleMean, 1)} - ${mu0}}{${sigma} / \\sqrt{${n}}}\\)` 
          }} />
        </div>
        <motion.div 
          className="text-white"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.5 }}
          key={zScore}
        >
          <span>Result: </span>
          <span className="text-xl font-mono text-green-400">z = {formatNumber(zScore, 2)}</span>
        </motion.div>
      </div>
    </motion.div>
  );
});

ZScoreCalculation.displayName = 'ZScoreCalculation';

// Progressive Insight Reveal Component
const ProgressiveInsight = React.memo(({ step, investigator, testStatistic, pValue, alpha, onNext, onBack }) => {
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
  }, [step]);
  
  const steps = [
    {
      title: "Step 1: Calculate the p-value",
      content: (
        <div className="space-y-4">
          <p className="text-white">
            The p-value is the probability of observing a test statistic as extreme as {formatNumber(testStatistic, 2)} 
            under the null hypothesis.
          </p>
          <div className="bg-neutral-900/50 p-4 rounded-lg">
            {investigator.hypothesis.type === 'right-tailed' && (
              <div>
                <span dangerouslySetInnerHTML={{ __html: `\\(p = P(Z \\geq ${formatNumber(testStatistic, 2)}) = ${formatNumber(pValue, 4)}\\)` }} />
              </div>
            )}
            {investigator.hypothesis.type === 'left-tailed' && (
              <div>
                <span dangerouslySetInnerHTML={{ __html: `\\(p = P(Z \\leq ${formatNumber(testStatistic, 2)}) = ${formatNumber(pValue, 4)}\\)` }} />
              </div>
            )}
            {investigator.hypothesis.type === 'two-tailed' && (
              <div>
                <span dangerouslySetInnerHTML={{ __html: `\\(p = 2 \\times P(Z \\geq |${formatNumber(testStatistic, 2)}|) = ${formatNumber(pValue, 4)}\\)` }} />
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Compare to significance level",
      content: (
        <div className="space-y-4">
          <p className="text-white">
            We compare our p-value to the significance level α = {alpha}:
          </p>
          <motion.div 
            className="flex items-center justify-center space-x-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center">
              <p className="text-sm text-neutral-400">p-value</p>
              <p className={cn(
                "text-3xl font-mono",
                pValue < alpha ? "text-red-400" : "text-green-400"
              )}>
                {formatNumber(pValue, 4)}
              </p>
            </div>
            <div className="text-2xl text-neutral-400">
              {pValue < alpha ? '<' : '≥'}
            </div>
            <div className="text-center">
              <p className="text-sm text-neutral-400">α</p>
              <p className="text-3xl font-mono text-purple-400">
                {alpha}
              </p>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      title: "Step 3: Make a decision",
      content: (
        <div className="space-y-4">
          <p className="text-white">
            Based on our comparison:
          </p>
          <motion.div 
            className={cn(
              "p-6 rounded-lg text-center",
              pValue < alpha ? "bg-red-900/30 border-2 border-red-500/50" : "bg-green-900/30 border-2 border-green-500/50"
            )}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <p className="text-2xl font-bold mb-2">
              {pValue < alpha ? "Reject H₀" : "Fail to reject H₀"}
            </p>
            <p className="text-neutral-300">
              {pValue < alpha 
                ? `We have sufficient evidence to support ${investigator.belief.toLowerCase()}`
                : `We do not have sufficient evidence to support ${investigator.belief.toLowerCase()}`
              }
            </p>
          </motion.div>
        </div>
      )
    },
    {
      title: "Step 4: The key insight",
      content: (
        <div className="space-y-4">
          <p className="text-white text-lg mb-4">
            The same data (z = 1.8) leads to different conclusions based on the hypothesis type:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-lg bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/30"
            >
              <h5 className="font-semibold text-emerald-400 mb-2">Right-tailed</h5>
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: "p = 0.036 < 0.05" }} />
              <p className="text-sm font-semibold text-emerald-300">Reject H₀</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-lg bg-gradient-to-br from-rose-900/30 to-pink-900/30 border border-rose-500/30"
            >
              <h5 className="font-semibold text-rose-400 mb-2">Left-tailed</h5>
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: "p = 0.964 > 0.05" }} />
              <p className="text-sm font-semibold text-rose-300">Fail to reject H₀</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-lg bg-gradient-to-br from-violet-900/30 to-purple-900/30 border border-violet-500/30"
            >
              <h5 className="font-semibold text-violet-400 mb-2">Two-tailed</h5>
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: "p = 0.072 > 0.05" }} />
              <p className="text-sm font-semibold text-violet-300">Fail to reject H₀</p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-lg"
          >
            <p className="text-yellow-400 font-semibold text-center">
              ⚠️ The hypothesis type must be chosen BEFORE collecting data!
            </p>
          </motion.div>
        </div>
      )
    }
  ];
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8"
    >
      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
        {steps[step].title}
      </h3>
      {steps[step].content}
      
      <div className="flex justify-between items-center mt-8">
        <Button
          onClick={onBack}
          disabled={step === 0}
          variant="secondary"
          className="bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </Button>
        
        <div className="flex space-x-2">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                idx === step ? "w-8 bg-purple-500" : "bg-neutral-600"
              )}
            />
          ))}
        </div>
        
        {step < steps.length - 1 ? (
          <Button
            onClick={onNext}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            Start Over
          </Button>
        )}
      </div>
    </motion.div>
  );
});

ProgressiveInsight.displayName = 'ProgressiveInsight';

// Mathematical Details Panel Component
const MathematicalDetails = React.memo(({ investigator, alpha }) => {
  const ref = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
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
  }, [isExpanded]);
  
  return (
    <motion.div 
      className="bg-gradient-to-r from-neutral-900/80 to-neutral-800/80 backdrop-blur-md rounded-xl border border-purple-500/20 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
      >
        <h4 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Mathematical Details
        </h4>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-5 w-5 text-purple-400" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            ref={ref}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4"
          >
            <div className="space-y-4 pt-2">
              <div>
                <h5 className="text-sm font-semibold text-purple-300 mb-2">Hypothesis Formulation</h5>
                <div className="bg-neutral-900/50 p-3 rounded-lg space-y-2">
                  <div className="text-white">
                    Null: <span dangerouslySetInnerHTML={{ __html: investigator.hypothesis.null }} />
                  </div>
                  <div className="text-white">
                    Alternative: <span dangerouslySetInnerHTML={{ __html: investigator.hypothesis.alternative }} />
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-semibold text-purple-300 mb-2">Critical Value Calculation</h5>
                <div className="bg-neutral-900/50 p-3 rounded-lg">
                  {investigator.hypothesis.type === 'right-tailed' && (
                    <div className="text-white">
                      <span dangerouslySetInnerHTML={{ __html: `For \\(\\alpha = ${alpha}\\), critical value \\(z_{\\alpha} = ${investigator.hypothesis.criticalValue}\\)` }} />
                    </div>
                  )}
                  {investigator.hypothesis.type === 'left-tailed' && (
                    <div className="text-white">
                      <span dangerouslySetInnerHTML={{ __html: `For \\(\\alpha = ${alpha}\\), critical value \\(z_{\\alpha} = ${investigator.hypothesis.criticalValue}\\)` }} />
                    </div>
                  )}
                  {investigator.hypothesis.type === 'two-tailed' && (
                    <div className="text-white">
                      <span dangerouslySetInnerHTML={{ __html: `For \\(\\alpha = ${alpha}\\), critical value \\(z_{\\alpha/2} = \\pm${investigator.hypothesis.criticalValue}\\)` }} />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-semibold text-purple-300 mb-2">Rejection Region</h5>
                <div className="bg-neutral-900/50 p-3 rounded-lg">
                  <p className="font-mono text-yellow-400">{investigator.hypothesis.rejectRegion}</p>
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-semibold text-purple-300 mb-2">Common Critical Values</h5>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-purple-500/30">
                      <th className="text-left py-2 text-purple-300">α</th>
                      <th className="text-center py-2 text-purple-300">One-tailed</th>
                      <th className="text-center py-2 text-purple-300">Two-tailed</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    <tr className="border-b border-neutral-700">
                      <td className="py-2">0.10</td>
                      <td className="text-center font-mono">1.282</td>
                      <td className="text-center font-mono">±1.645</td>
                    </tr>
                    <tr className="border-b border-neutral-700">
                      <td className="py-2">0.05</td>
                      <td className="text-center font-mono">1.645</td>
                      <td className="text-center font-mono">±1.960</td>
                    </tr>
                    <tr>
                      <td className="py-2">0.01</td>
                      <td className="text-center font-mono">2.326</td>
                      <td className="text-center font-mono">±2.576</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

MathematicalDetails.displayName = 'MathematicalDetails';

// Custom D3 Draggable Slider Component
const D3Slider = React.memo(({ value, onChange, min, max, step }) => {
  const svgRef = useRef(null);
  const isDraggingRef = useRef(false);
  const [isHovering, setIsHovering] = useState(false);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = 40;
    
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    svg.selectAll("*").remove();
    
    const margin = { left: 20, right: 20 };
    const sliderWidth = width - margin.left - margin.right;
    
    const scale = d3.scaleLinear()
      .domain([min, max])
      .range([margin.left, width - margin.right])
      .clamp(true);
    
    // Background gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "slider-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0.3);
    
    gradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#8b5cf6")
      .attr("stop-opacity", 0.5);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ec4899")
      .attr("stop-opacity", 0.3);
    
    // Track
    const track = svg.append("rect")
      .attr("x", margin.left)
      .attr("y", height / 2 - 2)
      .attr("width", sliderWidth)
      .attr("height", 4)
      .attr("rx", 2)
      .attr("fill", "url(#slider-gradient)");
    
    // Active track
    const activeTrack = svg.append("rect")
      .attr("x", margin.left)
      .attr("y", height / 2 - 2)
      .attr("width", scale(value) - margin.left)
      .attr("height", 4)
      .attr("rx", 2)
      .attr("fill", "#8b5cf6")
      .attr("opacity", 0.8);
    
    // Handle group
    const handleGroup = svg.append("g")
      .attr("transform", `translate(${scale(value)}, ${height / 2})`);
    
    // Glow effect
    const glowFilter = svg.select("defs").append("filter")
      .attr("id", "handle-glow");
    
    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
    
    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    
    // Handle
    const handle = handleGroup.append("circle")
      .attr("r", isHovering ? 10 : 8)
      .attr("fill", "#8b5cf6")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("cursor", "grab")
      .style("filter", isHovering ? "url(#handle-glow)" : "none")
      .style("transition", "all 0.2s ease");
    
    // Hover ripple
    const ripple = handleGroup.append("circle")
      .attr("r", 8)
      .attr("fill", "none")
      .attr("stroke", "#8b5cf6")
      .attr("stroke-width", 2)
      .attr("opacity", 0);
    
    // Drag behavior
    const drag = d3.drag()
      .on("start", function(event) {
        isDraggingRef.current = true;
        handle.attr("cursor", "grabbing");
        
        // Animate ripple
        ripple
          .attr("r", 8)
          .attr("opacity", 0.5)
          .transition()
          .duration(400)
          .attr("r", 20)
          .attr("opacity", 0);
      })
      .on("drag", function(event) {
        const newValue = scale.invert(event.x);
        const snappedValue = Math.round(newValue / step) * step;
        const clampedValue = Math.max(min, Math.min(max, snappedValue));
        
        handleGroup.attr("transform", `translate(${scale(clampedValue)}, ${height / 2})`);
        activeTrack.attr("width", scale(clampedValue) - margin.left);
        onChange(clampedValue);
      })
      .on("end", function() {
        isDraggingRef.current = false;
        handle.attr("cursor", "grab");
      });
    
    handleGroup.call(drag);
    
    // Hover effects
    handleGroup
      .on("mouseenter", () => {
        setIsHovering(true);
        handle
          .transition()
          .duration(200)
          .attr("r", 10);
      })
      .on("mouseleave", () => {
        if (!isDraggingRef.current) {
          setIsHovering(false);
          handle
            .transition()
            .duration(200)
            .attr("r", 8);
        }
      });
    
    // Click on track to jump
    svg.on("click", function(event) {
      const [x] = d3.pointer(event);
      if (x >= margin.left && x <= width - margin.right) {
        const newValue = scale.invert(x);
        const snappedValue = Math.round(newValue / step) * step;
        const clampedValue = Math.max(min, Math.min(max, snappedValue));
        
        handleGroup
          .transition()
          .duration(200)
          .attr("transform", `translate(${scale(clampedValue)}, ${height / 2})`);
        
        activeTrack
          .transition()
          .duration(200)
          .attr("width", scale(clampedValue) - margin.left);
        
        onChange(clampedValue);
      }
    });
    
  }, [value, min, max, step, isHovering]);
  
  return (
    <div className="w-full">
      <svg ref={svgRef} className="w-full h-10 cursor-pointer" />
    </div>
  );
});

D3Slider.displayName = 'D3Slider';

// Animated particles background
const ParticleField = React.memo(() => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    updateCanvasSize();
    
    // Initialize particles
    const particleCount = 50;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.1
    }));
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`;
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none opacity-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
});

ParticleField.displayName = 'ParticleField';

export default function TypesOfHypotheses() {
  const [stage, setStage] = useState('intro');
  const [selectedInvestigator, setSelectedInvestigator] = useState(null);
  const [testStatistic, setTestStatistic] = useState(1.8);
  const [sampleMean, setSampleMean] = useState(21.5);
  const [showInsight, setShowInsight] = useState(false);
  const [insightStep, setInsightStep] = useState(0);
  const [hoveredInvestigator, setHoveredInvestigator] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [waveOffset, setWaveOffset] = useState(0);
  
  const svgRef = useRef(null);
  const animationFrameRef = useRef(null);
  const progressRef = useRef(0);
  const waveRef = useRef(0);
  const criticalRegionRefs = useRef({});
  const isInitializedRef = useRef(false);
  
  const alpha = 0.05;
  const mu0 = 20;
  const sigma = 2.5;
  const n = 30;
  
  // Calculate test statistic from sample mean
  useEffect(() => {
    const z = (sampleMean - mu0) / (sigma / Math.sqrt(n));
    setTestStatistic(z);
  }, [sampleMean, mu0, sigma, n]);
  
  const investigators = [
    {
      id: 'A',
      name: 'Investigator A',
      belief: 'The new soil produces taller plants',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-500',
      primaryColor: '#10b981',
      secondaryColor: '#14b8a6',
      shadowColor: 'shadow-emerald-500/50',
      hypothesis: {
        null: `\\(H_0: \\mu = ${mu0}\\)`,
        alternative: `\\(H_1: \\mu > ${mu0}\\)`,
        type: 'right-tailed',
        criticalValue: 1.645,
        rejectRegion: 'z > 1.645'
      }
    },
    {
      id: 'B', 
      name: 'Investigator B',
      belief: 'The new soil stunts growth',
      icon: TrendingDown,
      gradient: 'from-rose-500 to-pink-500',
      primaryColor: '#f43f5e',
      secondaryColor: '#ec4899',
      shadowColor: 'shadow-rose-500/50',
      hypothesis: {
        null: `\\(H_0: \\mu = ${mu0}\\)`,
        alternative: `\\(H_1: \\mu < ${mu0}\\)`,
        type: 'left-tailed',
        criticalValue: -1.645,
        rejectRegion: 'z < -1.645'
      }
    },
    {
      id: 'C',
      name: 'Investigator C',
      belief: "I want to know if there's any difference at all",
      icon: Activity,
      gradient: 'from-violet-500 to-purple-500',
      primaryColor: '#8b5cf6',
      secondaryColor: '#a855f7',
      shadowColor: 'shadow-violet-500/50',
      hypothesis: {
        null: `\\(H_0: \\mu = ${mu0}\\)`,
        alternative: `\\(H_1: \\mu \\neq ${mu0}\\)`,
        type: 'two-tailed',
        criticalValue: 1.96,
        rejectRegion: '|z| > 1.96'
      }
    }
  ];
  
  const currentInvestigator = selectedInvestigator !== null ? investigators[selectedInvestigator] : null;
  
  const pValue = useMemo(() => {
    if (!currentInvestigator) return null;
    const type = currentInvestigator.hypothesis.type;
    if (type === 'right-tailed') {
      return 1 - jStat.normal.cdf(testStatistic, 0, 1);
    } else if (type === 'left-tailed') {
      return jStat.normal.cdf(testStatistic, 0, 1);
    } else {
      const tailProb = 1 - jStat.normal.cdf(Math.abs(testStatistic), 0, 1);
      return 2 * tailProb;
    }
  }, [testStatistic, currentInvestigator]);
  
  const decision = pValue !== null && pValue < alpha ? 'Reject H₀' : 'Fail to reject H₀';
  
  // Continuous animation loop for smooth effects
  useEffect(() => {
    if (stage === 'explore' && currentInvestigator) {
      const animate = () => {
        // Progress animation
        progressRef.current = Math.min(progressRef.current + 0.015, 1);
        setAnimationProgress(progressRef.current);
        
        // Wave animation
        waveRef.current += 0.02;
        setWaveOffset(waveRef.current);
        
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [stage, currentInvestigator]);
  
  // Optimized D3 Visualization
  useEffect(() => {
    if (!svgRef.current || stage !== 'explore' || !currentInvestigator) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Initialize only once
    if (!isInitializedRef.current) {
      svg.selectAll("*").remove();
      
      // Create gradient definitions
      const defs = svg.append("defs");
      
      // Animated gradient for distribution
      const distGradient = defs.append("linearGradient")
        .attr("id", "dist-gradient-animated")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
      
      distGradient.append("stop")
        .attr("id", "stop1")
        .attr("offset", "0%")
        .attr("stop-color", "#8b5cf6")
        .attr("stop-opacity", 0.9);
      
      distGradient.append("stop")
        .attr("id", "stop2")
        .attr("offset", "100%")
        .attr("stop-color", "#3b82f6")
        .attr("stop-opacity", 0.1);
      
      // Enhanced glow filter
      const glowFilter = defs.append("filter")
        .attr("id", "enhanced-glow")
        .attr("width", "300%")
        .attr("height", "300%")
        .attr("x", "-100%")
        .attr("y", "-100%");
      
      glowFilter.append("feGaussianBlur")
        .attr("stdDeviation", "4")
        .attr("result", "coloredBlur");
      
      glowFilter.append("feColorMatrix")
        .attr("in", "coloredBlur")
        .attr("type", "matrix")
        .attr("values", "0 0 0 0 0.5  0 0 0 0 0.35  0 0 0 0 0.96  0 0 0 1 0")
        .attr("result", "purpleBlur");
      
      const feMerge = glowFilter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "purpleBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
      
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Store references
      svg.node().__data__ = { g, innerWidth, innerHeight };
      isInitializedRef.current = true;
    }
    
    const { g, innerWidth: iWidth, innerHeight: iHeight } = svg.node().__data__;
    
    const xScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([0, iWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.45])
      .range([iHeight, 0]);
    
    // Update gradient colors based on wave
    svg.select("#stop1")
      .attr("stop-color", d3.interpolateRgb("#8b5cf6", "#ec4899")(Math.sin(waveOffset) * 0.5 + 0.5));
    
    svg.select("#stop2")
      .attr("stop-color", d3.interpolateRgb("#3b82f6", "#8b5cf6")(Math.sin(waveOffset + Math.PI) * 0.5 + 0.5));
    
    // Draw axes only once
    if (!g.select(".x-axis").node()) {
      const xAxis = d3.axisBottom(xScale)
        .tickValues([-3, -2, -1, 0, 1, 2, 3])
        .tickFormat(d => d.toString());
      
      g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${iHeight})`)
        .call(xAxis)
        .style("color", "#9ca3af");
      
      g.append("text")
        .attr("x", iWidth / 2)
        .attr("y", iHeight + 45)
        .style("text-anchor", "middle")
        .style("fill", "#d4d4d8")
        .style("font-size", "14px")
        .text("z-score");
    }
    
    // Generate distribution data with wave effect
    const data = d3.range(-4, 4.1, 0.05).map(x => {
      const baseY = jStat.normal.pdf(x, 0, 1);
      const wave = Math.sin(x * 2 + waveOffset) * 0.01 * animationProgress;
      return { x, y: baseY + wave };
    });
    
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(innerHeight)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Update or create main distribution
    let mainArea = g.select(".main-area");
    if (mainArea.empty()) {
      mainArea = g.append("path")
        .attr("class", "main-area")
        .attr("fill", "url(#dist-gradient-animated)")
        .attr("opacity", 0);
      
      mainArea.transition()
        .duration(1000)
        .attr("opacity", 1);
    }
    mainArea.attr("d", area(data));
    
    // Update or create curve
    let curvePath = g.select(".curve-path");
    if (curvePath.empty()) {
      curvePath = g.append("path")
        .attr("class", "curve-path")
        .attr("fill", "none")
        .attr("stroke", "#8b5cf6")
        .attr("stroke-width", 3)
        .attr("opacity", 0)
        .style("filter", "url(#enhanced-glow)");
      
      curvePath.transition()
        .duration(1000)
        .attr("opacity", 1);
    }
    curvePath.attr("d", line(data));
    
    // Update critical regions smoothly
    const type = currentInvestigator.hypothesis.type;
    const criticalValue = currentInvestigator.hypothesis.criticalValue;
    const critColor = currentInvestigator.primaryColor;
    
    // Create gradient for critical regions
    let critGradient = svg.select("#crit-gradient-dynamic");
    if (critGradient.empty()) {
      critGradient = svg.select("defs").append("linearGradient")
        .attr("id", "crit-gradient-dynamic")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
      
      critGradient.append("stop")
        .attr("class", "crit-stop1")
        .attr("offset", "0%");
      
      critGradient.append("stop")
        .attr("class", "crit-stop2")
        .attr("offset", "100%");
    }
    
    // Update critical gradient colors
    critGradient.select(".crit-stop1")
      .attr("stop-color", critColor)
      .attr("stop-opacity", 0.6 * animationProgress);
    
    critGradient.select(".crit-stop2")
      .attr("stop-color", critColor)
      .attr("stop-opacity", 0.1 * animationProgress);
    
    // Draw critical regions
    if (type === 'right-tailed') {
      const rejectionData = data.filter(d => d.x >= criticalValue);
      let rightCrit = g.select(".crit-right");
      if (rightCrit.empty()) {
        rightCrit = g.append("path")
          .attr("class", "crit-right")
          .attr("fill", "url(#crit-gradient-dynamic)");
      }
      rightCrit.attr("d", area(rejectionData));
      
      g.selectAll(".crit-left").remove();
      
    } else if (type === 'left-tailed') {
      const rejectionData = data.filter(d => d.x <= criticalValue);
      let leftCrit = g.select(".crit-left");
      if (leftCrit.empty()) {
        leftCrit = g.append("path")
          .attr("class", "crit-left")
          .attr("fill", "url(#crit-gradient-dynamic)");
      }
      leftCrit.attr("d", area(rejectionData));
      
      g.selectAll(".crit-right").remove();
      
    } else {
      const leftRejection = data.filter(d => d.x <= -criticalValue);
      const rightRejection = data.filter(d => d.x >= criticalValue);
      
      let leftCrit = g.select(".crit-left");
      if (leftCrit.empty()) {
        leftCrit = g.append("path")
          .attr("class", "crit-left")
          .attr("fill", "url(#crit-gradient-dynamic)");
      }
      leftCrit.attr("d", area(leftRejection));
      
      let rightCrit = g.select(".crit-right");
      if (rightCrit.empty()) {
        rightCrit = g.append("path")
          .attr("class", "crit-right")
          .attr("fill", "url(#crit-gradient-dynamic)");
      }
      rightCrit.attr("d", area(rightRejection));
    }
    
    // Update test statistic smoothly
    let testStatGroup = g.select(".test-stat-group");
    if (testStatGroup.empty()) {
      testStatGroup = g.append("g")
        .attr("class", "test-stat-group")
        .attr("opacity", 0);
      
      testStatGroup.transition()
        .duration(800)
        .delay(1500)
        .attr("opacity", 1);
      
      testStatGroup.append("line")
        .attr("class", "test-stat-line")
        .style("stroke", "#10b981")
        .style("stroke-width", 3)
        .style("filter", "url(#enhanced-glow)");
      
      testStatGroup.append("circle")
        .attr("class", "test-stat-circle")
        .attr("r", 8)
        .style("fill", "#10b981")
        .style("stroke", "#171717")
        .style("stroke-width", 2)
        .style("filter", "url(#enhanced-glow)");
      
      testStatGroup.append("text")
        .attr("class", "test-stat-text")
        .style("text-anchor", "middle")
        .style("fill", "#10b981")
        .style("font-size", "16px")
        .style("font-weight", "bold");
    }
    
    const testY = yScale(jStat.normal.pdf(testStatistic, 0, 1));
    
    testStatGroup.select(".test-stat-line")
      .attr("x1", xScale(testStatistic))
      .attr("x2", xScale(testStatistic))
      .attr("y1", innerHeight)
      .attr("y2", testY);
    
    testStatGroup.select(".test-stat-circle")
      .attr("cx", xScale(testStatistic))
      .attr("cy", testY);
    
    testStatGroup.select(".test-stat-text")
      .attr("x", xScale(testStatistic))
      .attr("y", testY - 20)
      .text(`z = ${testStatistic.toFixed(2)}`);
    
  }, [stage, currentInvestigator, testStatistic, animationProgress, waveOffset]);
  
  const handleInvestigatorSelect = (index) => {
    setSelectedInvestigator(index);
    progressRef.current = 0;
    waveRef.current = 0;
    setAnimationProgress(0);
    setWaveOffset(0);
    isInitializedRef.current = false;
    setTimeout(() => setStage('explore'), 300);
  };
  
  const handleBegin = () => {
    setStage('investigators');
  };
  
  const handleRevealInsight = () => {
    setShowInsight(true);
    setStage('insight');
  };
  
  return (
    <VisualizationContainer 
      title="Types of Hypotheses - One-Tailed vs Two-Tailed Tests"
      className="max-w-7xl mx-auto relative overflow-hidden"
    >
      <ParticleField />
      
      <AnimatePresence mode="wait">
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6 py-12 relative z-10"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.02, 1],
                rotate: [0, 1, -1, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                The Plant Growth Mystery
              </h2>
            </motion.div>
            <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
              Traditional soil produces plants with mean height μ = 20 cm. 
              A new soil type is being tested. We collected data and found a sample mean of 21.5 cm.
            </p>
            <motion.p 
              className="text-xl text-purple-400 font-semibold"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              We need to test if this difference is statistically significant. There are three types of hypotheses we can test:
            </motion.p>
            <Button
              onClick={handleBegin}
              size="lg"
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center">
                Walk Through Each Type
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                animate={{ x: [-200, 200] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              />
            </Button>
          </motion.div>
        )}
        
        {stage === 'investigators' && (
          <motion.div
            key="investigators"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 relative z-10"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Choose an Investigator
              </h3>
              <p className="text-neutral-300">
                Each investigator has a different hypothesis about the new soil
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {investigators.map((investigator, index) => {
                const Icon = investigator.icon;
                return (
                  <motion.button
                    key={investigator.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.2,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: 5,
                      rotateX: -5
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleInvestigatorSelect(index)}
                    onMouseEnter={() => setHoveredInvestigator(index)}
                    onMouseLeave={() => setHoveredInvestigator(null)}
                    className={cn(
                      "relative p-6 rounded-xl border-2 transition-all duration-300",
                      "bg-gradient-to-br backdrop-blur-sm",
                      investigator.gradient,
                      "border-transparent",
                      "shadow-xl hover:shadow-2xl",
                      investigator.shadowColor,
                      "group"
                    )}
                    style={{
                      transformStyle: "preserve-3d",
                      perspective: "1000px"
                    }}
                  >
                    <div className="absolute inset-0 bg-black/30 rounded-xl" />
                    <div className="relative z-10 space-y-4">
                      <motion.div 
                        className="flex items-center justify-center"
                        animate={hoveredInvestigator === index ? {
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                      </motion.div>
                      <h4 className="text-xl font-bold text-white">
                        {investigator.name}
                      </h4>
                      <p className="text-white/90">
                        "{investigator.belief}"
                      </p>
                      <div className="flex items-center justify-center text-white/80 text-sm group-hover:text-white transition-colors">
                        <Sparkles className="h-4 w-4 mr-1" />
                        <span>Click to explore</span>
                        <Zap className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    
                    {/* Animated border glow */}
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: `linear-gradient(45deg, ${investigator.primaryColor}, ${investigator.secondaryColor})`,
                        opacity: hoveredInvestigator === index ? 0.3 : 0,
                        filter: "blur(20px)",
                        transform: "scale(1.1)"
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
        
        {stage === 'explore' && currentInvestigator && (
          <motion.div
            key="explore"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-neutral-900/80 to-neutral-800/80 backdrop-blur-md p-6 rounded-xl border border-purple-500/20"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                    {currentInvestigator.name}'s Hypothesis
                  </h4>
                  <div className="space-y-2">
                    <p className="text-white">
                      Null: <LaTeXContent content={currentInvestigator.hypothesis.null} />
                    </p>
                    <p className="text-white">
                      Alternative: <LaTeXContent content={currentInvestigator.hypothesis.alternative} />
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                    Test Details
                  </h4>
                  <div className="space-y-2">
                    <p className="text-white">
                      Type: <span className="text-purple-400 font-semibold">{currentInvestigator.hypothesis.type}</span>
                    </p>
                    <p className="text-white">
                      Critical region: <span className="font-mono text-sm text-yellow-400">{currentInvestigator.hypothesis.rejectRegion}</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <ZScoreCalculation 
              sampleMean={sampleMean} 
              mu0={mu0} 
              sigma={sigma} 
              n={n} 
            />
            
            <GraphContainer height="450px" className="relative overflow-hidden bg-gradient-to-br from-neutral-900/50 to-black/50 backdrop-blur-sm rounded-xl border border-purple-500/20">
              <svg ref={svgRef} className="w-full h-full" />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.5, type: "spring" }}
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-3 border border-purple-500/30"
              >
                <div className="text-sm space-y-1">
                  <p className="text-purple-300">Test Statistic</p>
                  <p className="text-2xl font-mono bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    z = {testStatistic.toFixed(2)}
                  </p>
                </div>
              </motion.div>
            </GraphContainer>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid md:grid-cols-3 gap-4"
            >
              <motion.div 
                className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 backdrop-blur-md p-6 rounded-xl border border-purple-500/20 text-center"
                whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.4)" }}
              >
                <h4 className="text-sm font-semibold text-purple-300 mb-2">Significance Level</h4>
                <p className="text-3xl font-mono text-white">α = {alpha}</p>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 backdrop-blur-md p-6 rounded-xl border border-purple-500/20 text-center"
                whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.4)" }}
              >
                <h4 className="text-sm font-semibold text-purple-300 mb-2">p-value</h4>
                <motion.p 
                  className={cn(
                    "text-3xl font-mono",
                    pValue < 0.05 ? "text-red-400" : "text-green-400"
                  )}
                  animate={pValue < 0.05 ? {
                    textShadow: ["0 0 10px rgba(239, 68, 68, 0.5)", "0 0 20px rgba(239, 68, 68, 0.8)", "0 0 10px rgba(239, 68, 68, 0.5)"]
                  } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {pValue?.toFixed(4) || '—'}
                </motion.p>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 backdrop-blur-md p-6 rounded-xl border border-purple-500/20 text-center"
                whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.4)" }}
              >
                <h4 className="text-sm font-semibold text-purple-300 mb-2">Decision</h4>
                <p className={cn(
                  "text-xl font-semibold",
                  decision === 'Reject H₀' ? "text-red-400" : "text-green-400"
                )}>
                  {decision}
                </p>
              </motion.div>
            </motion.div>
            
            <ControlGroup className="bg-gradient-to-r from-neutral-900/80 to-neutral-800/80 backdrop-blur-md p-6 rounded-xl border border-purple-500/20">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-purple-300 mb-3 block">
                    What if our sample mean was different? (drag to explore):
                  </label>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white">Sample Mean: <span className="font-mono text-teal-400">{formatNumber(sampleMean, 1)} cm</span></span>
                    <span className="text-white">z-score: <span className="font-mono text-green-400">{formatNumber(testStatistic, 2)}</span></span>
                  </div>
                  <D3Slider
                    value={sampleMean}
                    onChange={setSampleMean}
                    min={17}
                    max={23}
                    step={0.1}
                  />
                  <div className="flex justify-between text-xs text-purple-400 mt-2">
                    <span>17 cm</span>
                    <span className="text-yellow-400">μ₀ = 20 cm</span>
                    <span>23 cm</span>
                  </div>
                </div>
              </div>
            </ControlGroup>
            
            <MathematicalDetails 
              investigator={currentInvestigator} 
              alpha={alpha} 
            />
            
            <div className="text-center">
              <Button
                onClick={handleRevealInsight}
                size="lg"
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  Analyze Results
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  animate={{ x: [-200, 200] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                />
              </Button>
            </div>
          </motion.div>
        )}
        
        {stage === 'insight' && showInsight && currentInvestigator && (
          <ProgressiveInsight
            step={insightStep}
            investigator={currentInvestigator}
            testStatistic={testStatistic}
            pValue={pValue}
            alpha={alpha}
            onNext={() => setInsightStep(prev => Math.min(prev + 1, 3))}
            onBack={() => setInsightStep(prev => Math.max(prev - 1, 0))}
          />
        )}
      </AnimatePresence>
    </VisualizationContainer>
  );
}