"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { motion, AnimatePresence } from "framer-motion";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, createColorScheme } from '../../lib/design-system';
import BackToHub from '@/components/ui/BackToHub';
import SectionComplete from '@/components/ui/SectionComplete';
import { 
  FlaskConical, TrendingUp, AlertTriangle, Lightbulb, 
  ChevronRight, RefreshCw, Activity, HelpCircle, BarChart,
  Check, X, Calculator
} from 'lucide-react';

// Get Chapter 5 color scheme
const chapterColors = createColorScheme('estimation');

// Journey Navigator Component
const JourneyNavigator = ({ journey, currentSection, userInsights, onNavigate }) => {
  const sections = Object.values(journey);
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-4">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          const isActive = currentSection === section.id;
          const isCompleted = userInsights[`${section.id}Completed`];
          
          return (
            <motion.button
              key={section.id}
              onClick={() => onNavigate(section.id)}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                isActive 
                  ? `bg-${section.color}-900/30 border-${section.color}-500` 
                  : isCompleted
                  ? 'bg-neutral-800 border-emerald-500/50'
                  : 'bg-neutral-900 border-neutral-700 hover:border-neutral-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={20} className={`text-${section.color}-400`} />
                {isCompleted && <Check size={16} className="text-emerald-400" />}
              </div>
              <h4 className="font-semibold text-white text-sm">{section.title}</h4>
              <p className="text-xs text-neutral-400 mt-1">{section.subtitle}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// Problem Section: Why We Can't Just Use Z
const ProblemStatement = ({ onInsight }) => {
  const [showNaiveApproach, setShowNaiveApproach] = useState(false);
  const [showWhyItFails, setShowWhyItFails] = useState(false);
  
  return (
    <div className="space-y-6">
      <motion.div
        className="bg-gradient-to-br from-yellow-900/20 to-neutral-800 
                   rounded-xl p-6 border border-yellow-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl font-bold text-yellow-400 mb-4">
          The Reality of Data Analysis
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-sm">In practice, we rarely know <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} />. We only have:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Sample data: x₁, x₂, ..., xₙ</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Sample mean: <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x}\\)` }} /></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Sample standard deviation: s</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-400" />
                <span className="text-neutral-500">Population <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} />: Unknown!</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-neutral-900/50 rounded-lg p-4">
            <p className="text-sm text-neutral-400 mb-2">The Question:</p>
            <p className="text-lg text-yellow-400">
              Can we just replace <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} /> with s in our confidence interval formula?
            </p>
          </div>
        </div>
      </motion.div>
      
      <motion.button
        onClick={() => {
          setShowNaiveApproach(!showNaiveApproach);
          if (!showNaiveApproach) onInsight('understoodProblem');
        }}
        className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg
                   text-white font-medium transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {showNaiveApproach ? 'Hide' : 'Explore'} the Naive Approach
      </motion.button>
      
      <AnimatePresence>
        {showNaiveApproach && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-neutral-800 rounded-lg p-4"
          >
            <h4 className="font-semibold text-neutral-300 mb-3">
              The Naive Approach: Just Use s Instead of <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} />
            </h4>
            <div className="space-y-3 text-sm">
              <p>Let's see what happens if we just substitute s for <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} />:</p>
              <div className="bg-neutral-900 rounded p-3 font-mono text-center">
                CI = <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x} \\pm z_{0.025} \\times \\frac{s}{\\sqrt{n}}\\)` }} />
              </div>
              <p className="text-neutral-400">
                This seems reasonable, but there's a hidden problem...
              </p>
              <button
                onClick={() => setShowWhyItFails(true)}
                className="text-yellow-400 hover:text-yellow-300 underline"
              >
                See why this fails →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showWhyItFails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-900/20 rounded-xl p-6 border border-red-500/30"
          >
            <h4 className="font-semibold text-red-400 mb-3">
              Why the Naive Approach Fails
            </h4>
            <div className="space-y-3 text-sm">
              <p>Using s instead of <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} /> introduces additional uncertainty:</p>
              <ul className="space-y-2 ml-4">
                <li>• s is just an estimate of <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} /></li>
                <li>• s varies from sample to sample</li>
                <li>• Small samples → s is less reliable</li>
                <li>• Result: Coverage probability &lt; claimed confidence level!</li>
              </ul>
              <motion.p
                className="mt-4 text-red-400 font-semibold text-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                We need a distribution that accounts for this extra uncertainty!
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Ozone Example Component
const OzoneExample = React.memo(function OzoneExample({ onInsight }) {
  const contentRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCalculation, setShowCalculation] = useState(false);
  
  // Course data from pages 32-33
  const data = [5.4, 4.7, 4.7, 4.5, 4.5, 4.9];
  const n = 6;
  const xBar = 4.783333; // Exact calculation
  const s = 0.370;
  const df = n - 1;
  const tCrit = 2.571; // <span dangerouslySetInnerHTML={{ __html: `\\(t_{0.025,5}\\)` }} />
  const se = s / Math.sqrt(n);
  const margin = tCrit * se;
  const ciLower = xBar - margin;
  const ciUpper = xBar + margin;
  
  const steps = [
    {
      title: "1. Collect Data",
      content: "Ozone concentrations (ppm) from 6 measurements",
      detail: "Environmental scientists measure ozone levels to assess air quality"
    },
    {
      title: "2. Calculate Statistics",
      content: "Find <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x}\\)` }} /> and s from the sample",
              detail: `x̄ = ${xBar.toFixed(3)} ppm, s = ${s} ppm`
    },
    {
      title: "3. Find Critical Value",
      content: `For 95% CI with df = ${df}, t₀.₀₂₅,₅ = ${tCrit}`,
      detail: "Note: This is larger than z₀.₀₂₅ = 1.96"
    },
    {
      title: "4. Build Interval",
      content: `CI = x̄ ± t × (s/√n)`,
      detail: `[${ciLower.toFixed(2)}, ${ciUpper.toFixed(2)}] ppm`
    }
  ];
  
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
  }, [currentStep]);
  
  // Visual component for data points
  const DataPointsVisualization = () => {
    const svgRef = useRef(null);
    
    useEffect(() => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      
      const width = 400;
      const height = 100;
      const margin = { top: 20, right: 20, bottom: 20, left: 20 };
      
      const xScale = d3.scaleLinear()
        .domain([4.3, 5.6])
        .range([margin.left, width - margin.right]);
      
      // Draw points
      svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => xScale(d))
        .attr("cy", height / 2)
        .attr("r", 6)
        .attr("fill", chapterColors.primary)
        .attr("opacity", 0)
        .transition()
        .delay((d, i) => i * 100)
        .duration(500)
        .attr("opacity", 0.8);
      
      // Draw mean line
      const meanLine = svg.append("line")
        .attr("x1", xScale(xBar))
        .attr("x2", xScale(xBar))
        .attr("y1", 10)
        .attr("y2", height - 10)
        .attr("stroke", chapterColors.secondary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0);
      
      meanLine.transition()
        .delay(600)
        .duration(500)
        .attr("opacity", 1);
      
      // X-axis
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(5));
        
    }, []);
    
    return <svg ref={svgRef} width="100%" height="100" viewBox="0 0 400 100" />;
  };
  
  return (
    <div ref={contentRef} className="space-y-6">
      <motion.div
        className="bg-gradient-to-br from-emerald-900/20 to-neutral-800 
                   rounded-xl p-6 border border-emerald-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl font-bold text-emerald-400 mb-4">
          Real Example: Ozone Concentrations
        </h3>
        
        <p className="text-sm text-neutral-300 mb-4">
          Environmental scientists measure ozone levels to assess air quality.
          With only 6 measurements, can we estimate the true mean concentration?
        </p>
        
        {/* Step Navigator */}
        <div className="flex gap-2 mb-6">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentStep(idx);
                if (idx === steps.length - 1) onInsight('completedExample');
              }}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${
                currentStep === idx
                  ? 'bg-emerald-600 text-white'
                  : currentStep > idx
                  ? 'bg-emerald-900/30 text-emerald-400'
                  : 'bg-neutral-700 text-neutral-400'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        
        {/* Current Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-white">
              {steps[currentStep].title}
            </h4>
            <p className="text-sm text-neutral-300">
              {steps[currentStep].content}
            </p>
            
            {/* Step-specific visualizations */}
            {currentStep === 0 && (
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <DataPointsVisualization />
                <p className="text-xs text-neutral-400 mt-2 text-center">
                  Data: {data.join(', ')} ppm
                </p>
              </div>
            )}
            
            {currentStep === 1 && (
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-neutral-400">Sample Mean</p>
                    <p className="text-2xl font-mono text-emerald-400">
                      {xBar.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Sample SD</p>
                    <p className="text-2xl font-mono text-blue-400">{s}</p>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-neutral-400 mb-2">
                    t-critical value (df = {df})
                  </p>
                  <p className="text-3xl font-mono text-purple-400">{tCrit}</p>
                  <p className="text-xs text-neutral-500 mt-2">
                    Compare to z₀.₀₂₅ = 1.96
                  </p>
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="bg-emerald-900/30 rounded-lg p-4 border border-emerald-500/50">
                <p className="text-sm text-neutral-400 mb-2">95% Confidence Interval:</p>
                <p className="text-2xl font-mono text-emerald-400 text-center">
                  [{ciLower.toFixed(2)}, {ciUpper.toFixed(2)}] ppm
                </p>
                <p className="text-sm text-neutral-300 mt-3 text-center">
                  We are 95% confident the true mean ozone concentration 
                  is between {ciLower.toFixed(2)} and {ciUpper.toFixed(2)} ppm.
                </p>
              </div>
            )}
            
            <p className="text-sm text-neutral-400">{steps[currentStep].detail}</p>
          </motion.div>
        </AnimatePresence>
        
        {/* Detailed Calculation */}
        <button
          onClick={() => setShowCalculation(!showCalculation)}
          className="mt-4 text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
        >
          <Calculator size={16} />
          {showCalculation ? 'Hide' : 'Show'} Detailed Calculation
        </button>
        
        <AnimatePresence>
          {showCalculation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2 text-sm font-mono bg-neutral-900/50 rounded p-3"
            >
              <p>Data: {data.join(', ')}</p>
              <p>n = {n}, df = {df}</p>
              <p>x̄ = {xBar.toFixed(3)}</p>
              <p>s = {s}</p>
              <p>SE = s/√n = {s}/√{n} = {se.toFixed(3)}</p>
              <p>t₀.₀₂₅,₅ = {tCrit}</p>
              <p>Margin = {tCrit} × {se.toFixed(3)} = {margin.toFixed(3)}</p>
              <p>CI = {xBar.toFixed(3)} ± {margin.toFixed(3)}</p>
              <p>CI = [{ciLower.toFixed(3)}, {ciUpper.toFixed(3)}]</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

// Section Content Component
const SectionContent = ({ section, onInsight }) => {
  switch (section.id) {
    case 'problem':
      return <ProblemStatement onInsight={onInsight} />;
    case 'solution':
      return (
        <>
          <TDistributionExplorer onInsight={onInsight} />
          <TvsZComparison />
        </>
      );
    case 'application':
      return (
        <>
          <OzoneExample onInsight={onInsight} />
          <InteractiveCIBuilder />
        </>
      );
    default:
      return null;
  }
};

// Interactive CI Builder
const InteractiveCIBuilder = () => {
  const [params, setParams] = useState({
    n: 10,
    xBar: 50,
    s: 10,
    confidence: 95,
    sigmaKnown: false,
    sigma: 10
  });
  
  const [showBoth, setShowBoth] = useState(true);
  
  const calculateCI = (useT) => {
    const alpha = 1 - params.confidence / 100;
    const df = params.n - 1;
    
    if (useT) {
      const t = jStat.studentt.inv(1 - alpha/2, df);
      const se = params.s / Math.sqrt(params.n);
      const margin = t * se;
      return {
        lower: params.xBar - margin,
        upper: params.xBar + margin,
        critical: t,
        se,
        margin,
        type: 't'
      };
    } else {
      const z = jStat.normal.inv(1 - alpha/2, 0, 1);
      const se = params.sigma / Math.sqrt(params.n);
      const margin = z * se;
      return {
        lower: params.xBar - margin,
        upper: params.xBar + margin,
        critical: z,
        se,
        margin,
        type: 'z'
      };
    }
  };
  
  const tCI = calculateCI(true);
  const zCI = calculateCI(false);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">
        Build and Compare Confidence Intervals
      </h3>
      
      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-emerald-400">Sample Information</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Size (n): {params.n}
            </label>
            <input
              type="range"
              min="3"
              max="50"
              value={params.n}
              onChange={(e) => setParams({...params, n: Number(e.target.value)})}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Mean (x̄): {params.xBar}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={params.xBar}
              onChange={(e) => setParams({...params, xBar: Number(e.target.value)})}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample SD (s): {params.s}
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={params.s}
              onChange={(e) => setParams({...params, s: Number(e.target.value)})}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-semibold text-blue-400">Comparison Settings</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confidence Level: {params.confidence}%
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[90, 95, 98, 99].map(level => (
                <button
                  key={level}
                  onClick={() => setParams({...params, confidence: level})}
                  className={`py-1 rounded text-sm ${
                    params.confidence === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-700 text-neutral-300'
                  }`}
                >
                  {level}%
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showBoth"
              checked={showBoth}
              onChange={(e) => setShowBoth(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="showBoth" className="text-sm">
              Compare with known σ case (σ = {params.sigma})
            </label>
          </div>
        </div>
      </div>
      
      {/* Results Comparison */}
      <div className={`grid ${showBoth ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
        {/* t-based CI */}
        <motion.div
          className="bg-gradient-to-br from-emerald-900/20 to-neutral-800 
                     rounded-xl p-6 border border-emerald-500/30"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h5 className="font-semibold text-emerald-400 mb-4">
            σ Unknown (t-distribution)
          </h5>
          
          <div className="space-y-3">
            <div className="text-center p-4 bg-neutral-900/50 rounded-lg">
              <p className="text-sm text-neutral-400 mb-1">
                {params.confidence}% Confidence Interval
              </p>
              <p className="text-2xl font-mono text-emerald-400">
                [{tCI.lower.toFixed(2)}, {tCI.upper.toFixed(2)}]
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                Width: {(tCI.upper - tCI.lower).toFixed(2)}
              </p>
            </div>
            
            <div className="text-sm space-y-1">
              <p>Critical value: t₀.₀₂₅,{params.n-1} = {tCI.critical.toFixed(3)}</p>
              <p>Standard error: {tCI.se.toFixed(3)}</p>
              <p>Margin of error: {tCI.margin.toFixed(3)}</p>
            </div>
          </div>
        </motion.div>
        
        {/* z-based CI for comparison */}
        {showBoth && (
          <motion.div
            className="bg-gradient-to-br from-blue-900/20 to-neutral-800 
                       rounded-xl p-6 border border-blue-500/30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h5 className="font-semibold text-blue-400 mb-4">
              σ Known (z-distribution)
            </h5>
            
            <div className="space-y-3">
              <div className="text-center p-4 bg-neutral-900/50 rounded-lg">
                <p className="text-sm text-neutral-400 mb-1">
                  {params.confidence}% Confidence Interval
                </p>
                <p className="text-2xl font-mono text-blue-400">
                  [{zCI.lower.toFixed(2)}, {zCI.upper.toFixed(2)}]
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Width: {(zCI.upper - zCI.lower).toFixed(2)}
                </p>
              </div>
              
              <div className="text-sm space-y-1">
                <p>Critical value: z₀.₀₂₅ = {zCI.critical.toFixed(3)}</p>
                <p>Standard error: {zCI.se.toFixed(3)}</p>
                <p>Margin of error: {zCI.margin.toFixed(3)}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Key Insight */}
      <motion.div
        className="mt-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-yellow-400">
          <strong>Key Insight:</strong> The t-based interval is always wider than 
          the z-based interval because it accounts for the additional uncertainty 
          of estimating σ with s. This difference is most pronounced for small samples 
          (n &lt; 30).
        </p>
      </motion.div>
    </VisualizationSection>
  );
};

// T-Distribution Explorer
const TDistributionExplorer = ({ onInsight }) => {
  const [df, setDf] = useState(5);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationDf, setAnimationDf] = useState(1);
  const animationRef = useRef(null);
  const svgRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 350;
    const margin = { top: 20, right: 120, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleLinear()
      .domain([-5, 5])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, 0.45])
      .range([innerHeight, 0]);
    
    // Generate data
    const xValues = d3.range(-5, 5.01, 0.01);
    const currentDf = showAnimation ? animationDf : df;
    
    const normalData = xValues.map(val => ({
      x: val,
      y: jStat.normal.pdf(val, 0, 1)
    }));
    
    const tData = xValues.map(val => ({
      x: val,
      y: jStat.studentt.pdf(val, currentDf)
    }));
    
    // Line generator
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    // Grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(-innerHeight).tickFormat(""))
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.2);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));
    
    g.append("g")
      .call(d3.axisLeft(y).ticks(5));
    
    // Axis labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "14px")
      .text("Standardized Value");
    
    // Normal curve
    g.append("path")
      .datum(normalData)
      .attr("fill", "none")
      .attr("stroke", chapterColors.secondary)
      .attr("stroke-width", 2)
      .attr("d", line)
      .style("opacity", 0.8);
    
    // T curve
    g.append("path")
      .datum(tData)
      .attr("fill", "none")
      .attr("stroke", chapterColors.primary)
      .attr("stroke-width", 2.5)
      .attr("d", line);
    
    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 100}, 20)`);
    
    // Normal legend
    legend.append("line")
      .attr("x1", 0).attr("x2", 20)
      .attr("y1", 0).attr("y2", 0)
      .attr("stroke", chapterColors.secondary)
      .attr("stroke-width", 2);
    legend.append("text")
      .attr("x", 25).attr("y", 4)
      .attr("fill", colors.chart.text)
      .style("font-size", "12px")
      .text("Normal(0,1)");
    
    // T legend
    legend.append("line")
      .attr("x1", 0).attr("x2", 20)
      .attr("y1", 20).attr("y2", 20)
      .attr("stroke", chapterColors.primary)
      .attr("stroke-width", 2);
    legend.append("text")
      .attr("x", 25).attr("y", 24)
      .attr("fill", colors.chart.text)
      .style("font-size", "12px")
      .text(`t(${currentDf})`);
    
    // Annotation for heavier tails
    if (currentDf <= 5) {
      const annotation = g.append("g")
        .attr("transform", `translate(${x(2.5)}, ${y(0.05)})`);
      
      annotation.append("path")
        .attr("d", "M0,0 L-30,-30")
        .attr("stroke", chapterColors.warning)
        .attr("stroke-width", 1)
        .attr("marker-end", "url(#arrow)");
      
      annotation.append("text")
        .attr("x", -35)
        .attr("y", -35)
        .attr("fill", chapterColors.warning)
        .style("font-size", "12px")
        .text("Heavier tails");
      
      // Arrow marker
      const defs = svg.append("defs");
      const marker = defs.append("marker")
        .attr("id", "arrow")
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("refX", 8)
        .attr("refY", 4)
        .attr("orient", "auto");
      
      marker.append("path")
        .attr("d", "M0,0 L8,4 L0,8")
        .attr("fill", chapterColors.warning);
    }
    
  }, [df, showAnimation, animationDf]);
  
  // Animation effect
  useEffect(() => {
    if (showAnimation) {
      let currentDf = 1;
      const animate = () => {
        setAnimationDf(currentDf);
        currentDf += 0.5;
        
        if (currentDf <= 100) {
          animationRef.current = setTimeout(animate, 50);
        } else {
          setTimeout(() => {
            setAnimationDf(Infinity);
            onInsight('sawTConvergence');
            setTimeout(() => {
              setShowAnimation(false);
              setAnimationDf(df);
            }, 1000);
          }, 500);
        }
      };
      
      animate();
      
      return () => {
        if (animationRef.current) {
          clearTimeout(animationRef.current);
        }
      };
    }
  }, [showAnimation, df, onInsight]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">The t-Distribution</h3>
      
      <GraphContainer>
        <svg ref={svgRef} width="100%" height="350" viewBox="0 0 600 350" />
      </GraphContainer>
      
      <ControlGroup>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Degrees of Freedom: {df}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={df}
              onChange={(e) => setDf(Number(e.target.value))}
              className="w-full"
              disabled={showAnimation}
            />
          </div>
          
          <button
            onClick={() => setShowAnimation(true)}
            disabled={showAnimation}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <TrendingUp size={16} />
            {showAnimation ? "Animating..." : "Animate df → ∞"}
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">Key Insight</h4>
          <p className="text-sm text-neutral-300">
            As degrees of freedom increase, the t-distribution approaches the normal distribution. 
            By df ≈ 30, they're nearly identical. This is why we use z for large samples!
          </p>
        </div>
      </ControlGroup>
    </VisualizationSection>
  );
};

// T vs Z Interval Comparison
const TvsZComparison = () => {
  const [sampleSize, setSampleSize] = useState(10);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const svgRef = useRef(null);
  
  // Sample parameters
  const xbar = 100;
  const s = 15;
  const sigma = 15; // True σ for comparison
  
  // Calculate critical values and intervals
  const calculations = useMemo(() => {
    const df = sampleSize - 1;
    const alpha = 1 - confidenceLevel;
    const tCritical = jStat.studentt.inv(1 - alpha/2, df);
    const zCritical = jStat.normal.inv(1 - alpha/2, 0, 1);
    
    const tSE = s / Math.sqrt(sampleSize);
    const tMOE = tCritical * tSE;
    const tLower = xbar - tMOE;
    const tUpper = xbar + tMOE;
    
    const zSE = sigma / Math.sqrt(sampleSize);
    const zMOE = zCritical * zSE;
    const zLower = xbar - zMOE;
    const zUpper = xbar + zMOE;
    
    const widthRatio = tMOE / zMOE;
    const percentWider = ((widthRatio - 1) * 100).toFixed(1);
    
    return {
      tCritical,
      zCritical,
      tInterval: { lower: tLower, upper: tUpper, moe: tMOE },
      zInterval: { lower: zLower, upper: zUpper, moe: zMOE },
      percentWider,
      df
    };
  }, [sampleSize, confidenceLevel]);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scale
    const extent = Math.max(calculations.tInterval.moe, calculations.zInterval.moe) * 1.5;
    const xScale = d3.scaleLinear()
      .domain([xbar - extent, xbar + extent])
      .range([0, innerWidth]);
    
    // Title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text(`${confidenceLevel * 100}% Confidence Intervals (n = ${sampleSize})`);
    
    // Center line (sample mean)
    g.append("line")
      .attr("x1", xScale(xbar))
      .attr("x2", xScale(xbar))
      .attr("y1", 20)
      .attr("y2", innerHeight - 20)
      .attr("stroke", chapterColors.secondary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3");
    
    g.append("text")
      .attr("x", xScale(xbar))
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .attr("fill", chapterColors.secondary)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(`x̄ = ${xbar}`);
    
    // Interval positions
    const tY = innerHeight * 0.35;
    const zY = innerHeight * 0.65;
    const barHeight = 12;
    const bracketHeight = 20;
    
    // T-interval visualization
    const tInterval = g.append("g");
    
    // T-interval bar
    tInterval.append("rect")
      .attr("x", xScale(calculations.tInterval.lower))
      .attr("y", tY - barHeight/2)
      .attr("width", xScale(calculations.tInterval.upper) - xScale(calculations.tInterval.lower))
      .attr("height", barHeight)
      .attr("fill", chapterColors.primary)
      .attr("rx", 2)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .attr("opacity", 1);
    
    // T-interval brackets
    [calculations.tInterval.lower, calculations.tInterval.upper].forEach(x => {
      tInterval.append("line")
        .attr("x1", xScale(x))
        .attr("x2", xScale(x))
        .attr("y1", tY - bracketHeight/2)
        .attr("y2", tY + bracketHeight/2)
        .attr("stroke", chapterColors.primary)
        .attr("stroke-width", 3);
    });
    
    // T-interval labels
    tInterval.append("text")
      .attr("x", xScale(xbar))
      .attr("y", tY - 25)
      .attr("text-anchor", "middle")
      .attr("fill", chapterColors.primary)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("t-interval (σ unknown, use s)");
    
    // Z-interval visualization
    const zInterval = g.append("g");
    
    // Z-interval bar
    zInterval.append("rect")
      .attr("x", xScale(calculations.zInterval.lower))
      .attr("y", zY - barHeight/2)
      .attr("width", xScale(calculations.zInterval.upper) - xScale(calculations.zInterval.lower))
      .attr("height", barHeight)
      .attr("fill", chapterColors.secondary)
      .attr("rx", 2)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay(400)
      .attr("opacity", 1);
    
    // Z-interval brackets
    [calculations.zInterval.lower, calculations.zInterval.upper].forEach(x => {
      zInterval.append("line")
        .attr("x1", xScale(x))
        .attr("x2", xScale(x))
        .attr("y1", zY - bracketHeight/2)
        .attr("y2", zY + bracketHeight/2)
        .attr("stroke", chapterColors.secondary)
        .attr("stroke-width", 3);
    });
    
    // Z-interval labels
    zInterval.append("text")
      .attr("x", xScale(xbar))
      .attr("y", zY - 25)
      .attr("text-anchor", "middle")
      .attr("fill", chapterColors.secondary)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("z-interval (σ known)");
    
    // Width difference annotation
    if (calculations.percentWider !== "0.0") {
      const diffY = innerHeight - 10;
      
      g.append("text")
        .attr("x", xScale(xbar))
        .attr("y", diffY)
        .attr("text-anchor", "middle")
        .attr("fill", chapterColors.warning)
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(`t-interval is ${calculations.percentWider}% wider`);
    }
    
    // X-axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(7));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "11px")
      .attr("fill", colors.chart.text);
    
  }, [sampleSize, confidenceLevel, calculations]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">t-Interval vs z-Interval Comparison</h3>
      
      <GraphContainer>
        <svg ref={svgRef} width="100%" height="300" viewBox="0 0 600 300" />
      </GraphContainer>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-neutral-800 rounded-lg p-3">
          <h5 className="text-xs font-semibold text-blue-400 mb-1">z-critical</h5>
          <p className="font-mono text-lg">{calculations.zCritical.toFixed(3)}</p>
          <p className="text-xs text-neutral-500">σ known</p>
        </div>
        <div className="bg-neutral-800 rounded-lg p-3">
          <h5 className="text-xs font-semibold text-purple-400 mb-1">t-critical</h5>
          <p className="font-mono text-lg">{calculations.tCritical.toFixed(3)}</p>
          <p className="text-xs text-neutral-500">df = {calculations.df}</p>
        </div>
        <div className="col-span-2 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
          <p className="text-sm text-center">
            t-critical is <span className="font-mono text-yellow-400">{((calculations.tCritical - calculations.zCritical) / calculations.zCritical * 100).toFixed(1)}%</span> larger
          </p>
        </div>
      </div>
      
      <ControlGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Sample Size: {sampleSize}
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Confidence Level
            </label>
            <select
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(Number(e.target.value))}
              className="w-full bg-neutral-700 rounded px-3 py-2 text-white"
            >
              <option value={0.90}>90%</option>
              <option value={0.95}>95%</option>
              <option value={0.99}>99%</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
          <p>As sample size increases, the t-distribution approaches the normal distribution. 
          By n ≈ 30, the difference is usually negligible in practice.</p>
        </div>
      </ControlGroup>
    </VisualizationSection>
  );
};

// Summary Comparison
const SummaryComparison = () => {
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
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">When to Use Each Method</h3>
      
      <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
          <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
            <ChevronRight size={16} />
            Z-Interval
          </h4>
          <ul className="space-y-1 text-sm text-neutral-300">
            <li>• σ is known</li>
            <li>• Large sample (n ≥ 30)</li>
            <li>• Population is normal</li>
          </ul>
          <div className="mt-3 text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]` 
            }} />
          </div>
        </div>
        
        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/50">
          <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
            <ChevronRight size={16} />
            t-Interval
          </h4>
          <ul className="space-y-1 text-sm text-neutral-300">
            <li>• σ is unknown (use s)</li>
            <li>• Small sample (n &lt; 30)</li>
            <li>• Population approximately normal</li>
          </ul>
          <div className="mt-3 text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\bar{x} \\pm t_{\\alpha/2,df} \\cdot \\frac{s}{\\sqrt{n}}\\]` 
            }} />
          </div>
        </div>
        
        <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/50">
          <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
            <ChevronRight size={16} />
            Bootstrap
          </h4>
          <ul className="space-y-1 text-sm text-neutral-300">
            <li>• No distribution assumptions</li>
            <li>• Complex statistics</li>
            <li>• Non-normal data</li>
          </ul>
          <div className="mt-3 text-center text-sm">
            <p>Resample data with replacement</p>
            <p>Use percentile method</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-yellow-900/20 rounded-lg p-4 border border-yellow-700/50">
        <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
          <AlertTriangle size={16} />
          Important Notes
        </h4>
        <ul className="space-y-1 text-sm text-neutral-300">
          <li>• t-intervals are always wider than z-intervals for the same data</li>
          <li>• The difference is most dramatic for small samples</li>
          <li>• Bootstrap requires many resamples (typically 1000+) for accuracy</li>
          <li>• When in doubt, use t-intervals (more conservative)</li>
        </ul>
      </div>
    </VisualizationSection>
  );
};

// Main Component with Journey Framework
export default function ConfidenceIntervalUnknownVariance() {
  const [currentSection, setCurrentSection] = useState('problem');
  const [userInsights, setUserInsights] = useState({
    understoodProblem: false,
    sawTConvergence: false,
    completedExample: false,
    problemCompleted: false,
    solutionCompleted: false,
    applicationCompleted: false
  });
  
  // Journey definition
  const TDistributionJourney = {
    problem: {
      id: 'problem',
      title: 'The Unknown σ Problem',
      subtitle: 'Why we need a new approach',
      icon: HelpCircle,
      color: 'yellow',
      sections: ['ProblemStatement', 'NaiveApproach', 'WhyItFails']
    },
    solution: {
      id: 'solution',
      title: 'Enter the t-Distribution',
      subtitle: 'A distribution that accounts for uncertainty',
      icon: Lightbulb,
      color: 'blue',
      sections: ['TDistributionIntro', 'DegreesOfFreedom', 'TvsNormal']
    },
    application: {
      id: 'application',
      title: 'Apply to Real Data',
      subtitle: 'Build confidence intervals with t',
      icon: BarChart,
      color: 'emerald',
      sections: ['OzoneExample', 'InteractiveBuilder', 'Comparison']
    }
  };
  
  const handleInsight = (insight) => {
    setUserInsights(prev => ({
      ...prev,
      [insight]: true
    }));
    
    // Check for section completion
    if (insight === 'understoodProblem') {
      setUserInsights(prev => ({ ...prev, problemCompleted: true }));
    } else if (insight === 'sawTConvergence') {
      setUserInsights(prev => ({ ...prev, solutionCompleted: true }));
    } else if (insight === 'completedExample') {
      setUserInsights(prev => ({ ...prev, applicationCompleted: true }));
    }
  };
  
  return (
    <VisualizationContainer
      title="5.4 Confidence Intervals: Unknown Variance"
      description="When uncertainty has uncertainty - mastering the t-distribution"
    >
      <BackToHub chapter={5} />
      
      <JourneyNavigator
        journey={TDistributionJourney}
        currentSection={currentSection}
        userInsights={userInsights}
        onNavigate={setCurrentSection}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <SectionContent
            section={TDistributionJourney[currentSection]}
            onInsight={handleInsight}
          />
        </motion.div>
      </AnimatePresence>
      
      <SummaryComparison />
      
      <VisualizationSection>
        <h3 className="text-xl font-bold text-white mb-4">Key Takeaways</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Lightbulb size={16} />
              Conceptual Understanding
            </h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Using s instead of σ adds uncertainty</li>
              <li>• t-distribution accounts for this extra variability</li>
              <li>• Degrees of freedom measure available information</li>
              <li>• Bootstrap provides distribution-free alternative</li>
            </ul>
          </div>
          
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
              <Activity size={16} />
              Practical Guidelines
            </h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Always use t for small samples (n &lt; 30)</li>
              <li>• Check normality assumption for small n</li>
              <li>• Bootstrap for non-normal or complex cases</li>
              <li>• Report method and assumptions clearly</li>
            </ul>
          </div>
        </div>
      </VisualizationSection>
      
      {/* Section Complete - Standardized Component */}
      <SectionComplete chapter={5} />
    </VisualizationContainer>
  );
}