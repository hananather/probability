"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";
import { 
  BarChart3, Vote, BookOpen, Wrench, Calculator, 
  CheckCircle, XCircle, TrendingUp, Heart, AlertCircle 
} from "lucide-react";
import { 
  VisualizationContainer, 
  VisualizationSection, 
  GraphContainer, 
  ControlGroup 
} from "../ui/VisualizationContainer";
import BackToHub from "../ui/BackToHub";
import SectionComplete from '@/components/ui/SectionComplete';
import { createColorScheme, typography } from "@/lib/design-system";

// Helper function to get z-critical value
const getZCritical = (confidence) => {
  const zTable = {
    90: 1.645,
    95: 1.96,
    98: 2.326,
    99: 2.576
  };
  return zTable[confidence] || 1.96;
};

// Introduction section with LaTeX formulas
const ProportionIntroduction = React.memo(function ProportionIntroduction() {
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
    <div ref={contentRef} className="bg-neutral-800 rounded-lg p-6 max-w-4xl mx-auto">
      <div className="text-sm text-neutral-300 space-y-4">
        <p className="text-lg font-semibold text-white mb-4">
          Confidence Intervals for Proportions
        </p>
        
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <p className="text-sm mb-3">
            If X ~ B(n, p) (number of successes in n trials), then the point estimator 
            for p is:
          </p>
          <div className="text-center text-lg">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\hat{P} = \\frac{X}{n}\\]` 
            }} />
          </div>
        </div>
        
        <p>
          Recall that E[X] = np and Var[X] = np(1-p). We can standardize:
        </p>
        
        <div className="bg-neutral-700/50 rounded-lg p-4">
          <div className="text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[Z = \\frac{\\hat{P} - p}{\\sqrt{\\frac{p(1-p)}{n}}} \\text{ is approximately } N(0,1)\\]` 
            }} />
          </div>
        </div>
        
        <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
          <p className="text-sm">
            <strong className="text-yellow-400">Key Point:</strong> We don't know p (that's what we're estimating!), 
            so we use <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{P}\\)` }} /> in the standard error calculation.
          </p>
        </div>
      </div>
    </div>
  );
});

// Confidence Interval Display Component
const ConfidenceIntervalDisplay = React.memo(function ConfidenceIntervalDisplay({ 
  se_A, se_B, moe_A, moe_B, ci_A, ci_B, onComplete 
}) {
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
  }, [se_A, se_B, moe_A, moe_B, ci_A, ci_B]);
  
  return (
    <motion.div
      ref={contentRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="bg-neutral-800 rounded-xl p-6">
        <h4 className="font-semibold text-white mb-4">
          95% Confidence Intervals
        </h4>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <p className="font-semibold text-purple-400 mb-3">Candidate A</p>
            <div className="space-y-2 text-sm">
              <p><span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p}_A = 0.52\\)` }} /></p>
              <p><span dangerouslySetInnerHTML={{ __html: `\\(SE_A = \\sqrt{\\frac{0.52 \\times 0.48}{1000}} = ${se_A.toFixed(4)}\\)` }} /></p>
              <p><span dangerouslySetInnerHTML={{ __html: `\\(\\text{Margin} = 1.96 \\times ${se_A.toFixed(4)} = ${moe_A.toFixed(4)}\\)` }} /></p>
              <p className="font-semibold text-purple-400 mt-2">
                CI: [{(ci_A.lower * 100).toFixed(1)}%, {(ci_A.upper * 100).toFixed(1)}%]
              </p>
            </div>
          </div>
          
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <p className="font-semibold text-blue-400 mb-3">Candidate B</p>
            <div className="space-y-2 text-sm">
              <p><span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p}_B = 0.48\\)` }} /></p>
              <p><span dangerouslySetInnerHTML={{ __html: `\\(SE_B = \\sqrt{\\frac{0.48 \\times 0.52}{1000}} = ${se_B.toFixed(4)}\\)` }} /></p>
              <p><span dangerouslySetInnerHTML={{ __html: `\\(\\text{Margin} = 1.96 \\times ${se_B.toFixed(4)} = ${moe_B.toFixed(4)}\\)` }} /></p>
              <p className="font-semibold text-blue-400 mt-2">
                CI: [{(ci_B.lower * 100).toFixed(1)}%, {(ci_B.upper * 100).toFixed(1)}%]
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
          <p className="text-sm">
            <strong className="text-yellow-400">Statistical Dead Heat!</strong> The confidence intervals overlap
            ([{(ci_A.lower * 100).toFixed(1)}%, {(ci_A.upper * 100).toFixed(1)}%] vs [{(ci_B.lower * 100).toFixed(1)}%, {(ci_B.upper * 100).toFixed(1)}%]),
            meaning we cannot confidently predict a winner.
          </p>
        </div>
      </div>
      
      <button
        onClick={onComplete}
        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
      >
        Continue to Theory
      </button>
    </motion.div>
  );
});

// Election Story Section
const ElectionStory = React.memo(function ElectionStory({ onComplete }) {
  const [stage, setStage] = useState('intro');
  const [pollData, setPollData] = useState(null);
  const [showCalculation, setShowCalculation] = useState(false);
  const contentRef = useRef(null);
  
  // Fixed values from course
  const n = 1000;
  const supportA = 0.52;
  const supportB = 0.48;
  const z_alpha2 = 1.96; // 95% confidence
  
  // Calculate CIs
  const se_A = Math.sqrt((supportA * (1 - supportA)) / n);
  const se_B = Math.sqrt((supportB * (1 - supportB)) / n);
  const moe_A = z_alpha2 * se_A;
  const moe_B = z_alpha2 * se_B;
  
  const ci_A = {
    lower: supportA - moe_A,
    upper: supportA + moe_A
  };
  
  const ci_B = {
    lower: supportB - moe_B,
    upper: supportB + moe_B
  };
  
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
  }, [stage]);
  
  return (
    <VisualizationSection className="space-y-6">
      <h3 className="text-xl font-bold text-white">The Election Story</h3>
      
      {stage === 'intro' && (
        <motion.div
          className="bg-gradient-to-br from-purple-900/20 to-neutral-800 
                     rounded-xl p-6 border border-purple-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="text-lg font-bold text-purple-400 mb-4">
            The Election Dilemma
          </h4>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-neutral-300">
              It's one week before a major election. A news organization wants to know:
              <span className="text-purple-400 font-semibold"> Will Candidate A win?</span>
            </p>
            <p className="text-neutral-300 mt-3">
              They can't ask all 10 million voters, so they poll a random sample of 1,000 voters...
            </p>
          </div>
          
          <button
            onClick={() => setStage('poll')}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Conduct the Poll
          </button>
        </motion.div>
      )}
      
      {stage === 'poll' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-neutral-800 rounded-xl p-6">
            <h4 className="font-semibold text-white mb-4">Poll Results</h4>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-sm text-neutral-400 mb-2">Candidate A</p>
                <div className="text-3xl font-mono text-purple-400">52%</div>
                <p className="text-sm text-neutral-500">(520 votes)</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-neutral-400 mb-2">Candidate B</p>
                <div className="text-3xl font-mono text-blue-400">48%</div>
                <p className="text-sm text-neutral-500">(480 votes)</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-neutral-900/50 rounded-lg">
              <p className="text-sm text-neutral-400">
                With n = 1,000 voters polled, can we confidently say Candidate A will win?
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setStage('confidence')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Calculate Confidence Intervals
          </button>
        </motion.div>
      )}
      
      {stage === 'confidence' && (
        <ConfidenceIntervalDisplay 
          se_A={se_A}
          se_B={se_B}
          moe_A={moe_A}
          moe_B={moe_B}
          ci_A={ci_A}
          ci_B={ci_B}
          onComplete={onComplete}
        />
      )}
    </VisualizationSection>
  );
});

// Normal Approximation Validator
const NormalApproximationValidator = React.memo(function NormalApproximationValidator() {
  const [n, setN] = useState(100);
  const [p, setP] = useState(0.5);
  const svgRef = useRef(null);
  
  // Check conditions
  const np = n * p;
  const nq = n * (1 - p);
  const conditionsMet = np >= 10 && nq >= 10;
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, 0.15])
      .range([innerHeight, 0]);
    
    // Normal approximation parameters
    const mean = p;
    const stdDev = Math.sqrt(p * (1 - p) / n);
    
    // Generate normal curve data
    const normalData = d3.range(0, 1.01, 0.01).map(x => {
      const z = (x - mean) / stdDev;
      const pdf = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
      return { x, y: pdf };
    });
    
    // Area under curve gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", innerHeight)
      .attr("x2", 0).attr("y2", 0);
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", conditionsMet ? "#10b981" : "#ef4444")
      .attr("stop-opacity", 0);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", conditionsMet ? "#10b981" : "#ef4444")
      .attr("stop-opacity", 0.3);
    
    // Area path
    const area = d3.area()
      .x(d => x(d.x))
      .y0(innerHeight)
      .y1(d => y(d.y))
      .curve(d3.curveBasis);
    
    g.append("path")
      .datum(normalData)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area);
    
    // Line
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    g.append("path")
      .datum(normalData)
      .attr("fill", "none")
      .attr("stroke", conditionsMet ? "#10b981" : "#ef4444")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", "#e5e5e5")
      .style("text-anchor", "middle")
      .text("Proportion");
    
    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#e5e5e5")
      .style("text-anchor", "middle")
      .text("Density");
    
    // Add mean line
    g.append("line")
      .attr("x1", x(mean))
      .attr("x2", x(mean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#fbbf24")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    // Mean label
    g.append("text")
      .attr("x", x(mean))
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("fill", "#fbbf24")
      .text(`p = ${p.toFixed(2)}`);
    
  }, [n, p, conditionsMet]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">
        When Can We Use Normal Approximation?
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ControlGroup>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sample Size (n): {n}
              </label>
              <input
                type="range"
                min="10"
                max="500"
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                True Proportion (p): {p.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.01"
                max="0.99"
                step="0.01"
                value={p}
                onChange={(e) => setP(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>Rare event</span>
                <span>p = {p.toFixed(2)}</span>
                <span>Common event</span>
              </div>
            </div>
          </ControlGroup>
          
          <motion.div
            className={`p-4 rounded-lg border-2 ${
              conditionsMet
                ? 'bg-green-900/20 border-green-500/50'
                : 'bg-red-900/20 border-red-500/50'
            }`}
            animate={{
              borderColor: conditionsMet ? '#22c55e50' : '#ef444450'
            }}
          >
            <h4 className={`font-semibold mb-3 flex items-center gap-2 ${
              conditionsMet ? 'text-green-400' : 'text-red-400'
            }`}>
              {conditionsMet ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {conditionsMet ? 'Conditions Met' : 'Conditions Not Met'}
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between ${
                np >= 10 ? 'text-green-400' : 'text-red-400'
              }`}>
                <span>np = {n} × {p.toFixed(2)} = {np.toFixed(1)}</span>
                <span>{np >= 10 ? '≥' : '<'} 10 {np >= 10 ? '✓' : '✗'}</span>
              </div>
              <div className={`flex justify-between ${
                nq >= 10 ? 'text-green-400' : 'text-red-400'
              }`}>
                <span>n(1-p) = {n} × {(1-p).toFixed(2)} = {nq.toFixed(1)}</span>
                <span>{nq >= 10 ? '≥' : '<'} 10 {nq >= 10 ? '✓' : '✗'}</span>
              </div>
            </div>
            
            {!conditionsMet && (
              <p className="text-xs text-neutral-400 mt-3">
                When conditions fail, use exact binomial methods instead.
              </p>
            )}
          </motion.div>
        </div>
        
        <div>
          <GraphContainer height="300px">
            <svg ref={svgRef} className="w-full h-full" />
          </GraphContainer>
          
          <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg">
            <p className="text-sm text-neutral-400 mb-2">Key Insights:</p>
            <ul className="space-y-1 text-sm text-neutral-300">
              <li>• Extreme p values (near 0 or 1) need larger n</li>
              <li>• p = 0.5 needs smallest sample size</li>
              <li>• SE = √(p(1-p)/n) is largest when p = 0.5</li>
            </ul>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Interactive CI Builder
const ProportionCIBuilder = React.memo(function ProportionCIBuilder() {
  const [inputs, setInputs] = useState({
    n: 1000,
    x: 493,
    confidence: 95
  });
  
  const [mode, setMode] = useState('count'); // count or proportion
  const [showSteps, setShowSteps] = useState(false);
  const contentRef = useRef(null);
  
  // Calculations
  const pHat = inputs.x / inputs.n;
  const q = 1 - pHat;
  const z = getZCritical(inputs.confidence);
  const se = Math.sqrt(pHat * q / inputs.n);
  const margin = z * se;
  
  // Wald interval (standard)
  const waldLower = Math.max(0, pHat - margin);
  const waldUpper = Math.min(1, pHat + margin);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    if (showSteps) {
      processMathJax();
      const timeoutId = setTimeout(processMathJax, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [showSteps, inputs]);
  
  return (
    <VisualizationSection>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">
          Proportion Confidence Interval Calculator
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('count')}
            className={`px-4 py-2 rounded ${
              mode === 'count' 
                ? 'bg-purple-600 text-white' 
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Count Input
          </button>
          <button
            onClick={() => setMode('proportion')}
            className={`px-4 py-2 rounded ${
              mode === 'proportion' 
                ? 'bg-purple-600 text-white' 
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Proportion Input
          </button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sample Size (n)
          </label>
          <input
            type="number"
            value={inputs.n}
            onChange={(e) => setInputs({...inputs, n: Math.max(1, Number(e.target.value))})}
            className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white"
            min="1"
          />
        </div>
        
        {mode === 'count' ? (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Success Count (x)
            </label>
            <input
              type="number"
              value={inputs.x}
              onChange={(e) => setInputs({
                ...inputs, 
                x: Math.max(0, Math.min(inputs.n, Number(e.target.value)))
              })}
              className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white"
              min="0"
              max={inputs.n}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Proportion (p̂)
            </label>
            <input
              type="number"
              value={pHat.toFixed(3)}
              onChange={(e) => {
                const newP = Math.max(0, Math.min(1, Number(e.target.value)));
                setInputs({...inputs, x: Math.round(newP * inputs.n)});
              }}
              className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white"
              min="0"
              max="1"
              step="0.001"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confidence Level
          </label>
          <select
            value={inputs.confidence}
            onChange={(e) => setInputs({...inputs, confidence: Number(e.target.value)})}
            className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white"
          >
            <option value={90}>90%</option>
            <option value={95}>95%</option>
            <option value={98}>98%</option>
            <option value={99}>99%</option>
          </select>
        </div>
      </div>
      
      {/* Condition Check */}
      <div className="mb-6">
        <ConditionCheckPanel n={inputs.n} pHat={pHat} />
      </div>
      
      {/* Results */}
      <motion.div
        className="bg-gradient-to-br from-purple-900/20 to-neutral-800 
                   rounded-xl p-6 border border-purple-500/30"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        key={`${inputs.n}-${inputs.x}-${inputs.confidence}`}
      >
        <div className="text-center mb-4">
          <p className="text-sm text-neutral-400 mb-2">
            {inputs.confidence}% Confidence Interval for p
          </p>
          <p className="text-3xl font-mono text-purple-400">
            [{(waldLower * 100).toFixed(1)}%, {(waldUpper * 100).toFixed(1)}%]
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            Point estimate: p̂ = {(pHat * 100).toFixed(1)}%
          </p>
        </div>
        
        <button
          onClick={() => setShowSteps(!showSteps)}
          className="w-full py-2 text-sm text-purple-400 hover:text-purple-300"
        >
          {showSteps ? 'Hide' : 'Show'} Calculation Steps
        </button>
        
        <AnimatePresence>
          {showSteps && (
            <motion.div
              ref={contentRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2 text-sm"
            >
              <p>1. <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p} = \\frac{x}{n} = \\frac{${inputs.x}}{${inputs.n}} = ${pHat.toFixed(4)}\\)` }} /></p>
              <p>2. <span dangerouslySetInnerHTML={{ __html: `\\(SE = \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}} = \\sqrt{\\frac{${pHat.toFixed(3)} \\times ${q.toFixed(3)}}{${inputs.n}}}\\)` }} /></p>
              <p>   <span dangerouslySetInnerHTML={{ __html: `\\(SE = ${se.toFixed(4)}\\)` }} /></p>
              <p>3. <span dangerouslySetInnerHTML={{ __html: `\\(z_{${inputs.confidence}\\%} = ${z.toFixed(3)}\\)` }} /></p>
              <p>4. <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Margin} = z \\times SE = ${z.toFixed(3)} \\times ${se.toFixed(4)} = ${margin.toFixed(4)}\\)` }} /></p>
              <p>5. <span dangerouslySetInnerHTML={{ __html: `\\(\\text{CI} = \\hat{p} \\pm \\text{margin} = ${pHat.toFixed(4)} \\pm ${margin.toFixed(4)}\\)` }} /></p>
              <p>6. <span dangerouslySetInnerHTML={{ __html: `\\(\\text{CI} = [${waldLower.toFixed(4)}, ${waldUpper.toFixed(4)}]\\)` }} /></p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </VisualizationSection>
  );
});

// Condition Check Panel
const ConditionCheckPanel = ({ n, pHat }) => {
  const np = n * pHat;
  const nq = n * (1 - pHat);
  const conditionsMet = np >= 10 && nq >= 10;
  
  return (
    <motion.div
      className={`p-4 rounded-lg border-2 ${
        conditionsMet
          ? 'bg-green-900/20 border-green-500/50'
          : 'bg-red-900/20 border-red-500/50'
      }`}
      animate={{
        borderColor: conditionsMet ? '#22c55e50' : '#ef444450'
      }}
    >
      <h4 className={`font-semibold mb-2 flex items-center gap-2 ${
        conditionsMet ? 'text-green-400' : 'text-red-400'
      }`}>
        {conditionsMet ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        Normal Approximation Check
      </h4>
      
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className={np >= 10 ? 'text-green-400' : 'text-red-400'}>
          np̂ = {n} × {pHat.toFixed(3)} = {np.toFixed(1)} {np >= 10 ? '≥' : '<'} 10
        </div>
        <div className={nq >= 10 ? 'text-green-400' : 'text-red-400'}>
          n(1-p̂) = {n} × {(1-pHat).toFixed(3)} = {nq.toFixed(1)} {nq >= 10 ? '≥' : '<'} 10
        </div>
      </div>
    </motion.div>
  );
};

// Scenario Explorer
const ScenarioExplorer = React.memo(function ScenarioExplorer() {
  const [selectedScenario, setSelectedScenario] = useState('election');
  
  const scenarios = {
    election: {
      title: 'Political Polling',
      icon: Vote,
      color: '#a855f7',
      description: 'Predicting election outcomes',
      examples: [
        { name: 'Presidential Race', n: 2000, p: 0.52, context: 'National poll' },
        { name: 'Local Election', n: 500, p: 0.48, context: 'City council' },
        { name: 'Exit Poll', n: 1500, p: 0.55, context: 'Election day' }
      ],
      insights: [
        'Margin of error typically ±3% for n=1000',
        'Watch for "statistical ties"',
        'Consider likely voter screens'
      ]
    },
    quality: {
      title: 'Quality Control',
      icon: CheckCircle,
      color: '#10b981',
      description: 'Manufacturing defect rates',
      examples: [
        { name: 'Electronics', n: 1000, p: 0.02, context: 'Defect rate' },
        { name: 'Pharmaceuticals', n: 10000, p: 0.001, context: 'Critical defects' },
        { name: 'Food Safety', n: 500, p: 0.05, context: 'Contamination' }
      ],
      insights: [
        'Small p requires large n',
        'Zero defects ≠ zero defect rate',
        'Consider sequential sampling'
      ]
    },
    medical: {
      title: 'Medical Studies',
      icon: Heart,
      color: '#ef4444',
      description: 'Treatment success rates',
      examples: [
        { name: 'Drug Efficacy', n: 300, p: 0.75, context: 'Response rate' },
        { name: 'Side Effects', n: 1000, p: 0.15, context: 'Adverse events' },
        { name: 'Vaccine Trial', n: 5000, p: 0.95, context: 'Protection rate' }
      ],
      insights: [
        'Clinical vs. statistical significance',
        'Number needed to treat (NNT)',
        'Consider confidence level carefully'
      ]
    },
    marketing: {
      title: 'A/B Testing',
      icon: TrendingUp,
      color: '#3b82f6',
      description: 'Conversion rate optimization',
      examples: [
        { name: 'Email Campaign', n: 5000, p: 0.23, context: 'Click rate' },
        { name: 'Landing Page', n: 2000, p: 0.08, context: 'Conversion' },
        { name: 'App Feature', n: 10000, p: 0.45, context: 'Adoption rate' }
      ],
      insights: [
        'Effect size matters more than p-value',
        'Consider practical significance',
        'Account for multiple comparisons'
      ]
    }
  };
  
  const scenario = scenarios[selectedScenario];
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-6">
        Real-World Applications
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(scenarios).map(([key, scen]) => {
          const Icon = scen.icon;
          return (
            <motion.button
              key={key}
              onClick={() => setSelectedScenario(key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedScenario === key
                  ? 'border-current'
                  : 'border-neutral-700 hover:border-neutral-600'
              }`}
              style={{
                borderColor: selectedScenario === key ? scen.color : undefined,
                backgroundColor: selectedScenario === key 
                  ? `${scen.color}15` 
                  : 'rgb(38 38 38)'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-6 h-6 mx-auto mb-2" style={{
                color: selectedScenario === key ? scen.color : '#e5e5e5'
              }} />
              <p className="text-xs font-medium">{scen.title}</p>
            </motion.button>
          );
        })}
      </div>
      
      <motion.div
        key={selectedScenario}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="bg-neutral-800 rounded-xl p-6">
          <h4 className="font-semibold text-white mb-2" style={{ color: scenario.color }}>
            {scenario.title}: {scenario.description}
          </h4>
          
          <div className="mt-4 space-y-3">
            {scenario.examples.map((example, idx) => (
              <div 
                key={idx} 
                className="bg-neutral-900/50 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{example.name}</p>
                  <p className="text-sm text-neutral-400">{example.context}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono">n = {example.n.toLocaleString()}</p>
                  <p className="font-mono text-sm" style={{ color: scenario.color }}>
                    p = {(example.p * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-neutral-800/50 rounded-lg p-4">
          <h5 className="font-semibold text-white mb-3">
            Important Considerations
          </h5>
          <ul className="space-y-2">
            {scenario.insights.map((insight, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 text-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full mt-1.5"
                     style={{ backgroundColor: scenario.color }} />
                <span>{insight}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </VisualizationSection>
  );
});

// Common Mistakes Section
const CommonMistakes = React.memo(function CommonMistakes() {
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">
        Common Mistakes to Avoid
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
          <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Using p instead of p̂
          </h4>
          <p className="text-sm text-neutral-300 mb-2">
            We don't know the true proportion p! Always use the sample proportion p̂ 
            in the standard error calculation.
          </p>
          <div className="bg-neutral-900 rounded p-2 text-center font-mono text-sm">
            <span className="text-red-400 line-through">√(p(1-p)/n)</span>
            <span className="text-green-400 ml-3">√(p̂(1-p̂)/n)</span>
          </div>
        </div>
        
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
          <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Ignoring np ≥ 10 rule
          </h4>
          <p className="text-sm text-neutral-300">
            The normal approximation requires both np ≥ 10 AND n(1-p) ≥ 10. 
            For small samples or extreme proportions, use exact binomial methods.
          </p>
        </div>
        
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
          <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Misinterpreting overlapping CIs
          </h4>
          <p className="text-sm text-neutral-300">
            Overlapping confidence intervals suggest no significant difference, 
            but formal hypothesis testing is needed for conclusions.
          </p>
        </div>
        
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
          <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            CI extending beyond [0,1]
          </h4>
          <p className="text-sm text-neutral-300">
            Proportions must be between 0 and 1. If your CI extends beyond these 
            bounds, truncate at 0 or 1, or use better methods (Wilson).
          </p>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Key Takeaways
const KeyTakeaways = React.memo(function KeyTakeaways() {
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
    <div ref={contentRef} className="mt-8 bg-gradient-to-br from-emerald-900/20 to-neutral-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-emerald-400 mb-4">
        Key Takeaways
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            The Formula
          </h4>
          <div className="bg-neutral-900 rounded p-4 text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\hat{P} \\pm z_{\\alpha/2} \\sqrt{\\frac{\\hat{P}(1-\\hat{P})}{n}}\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-400 mt-2">
            Remember: Use <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p}\\)` }} />, not p, in the SE calculation!
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            When to Use
          </h4>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Binary outcomes (success/failure)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Large enough sample (np ≥ 10, n(1-p) ≥ 10)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Independent observations</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-900/20 rounded border border-yellow-500/30">
        <p className="text-sm text-yellow-300">
          <strong>Remember the Election Example:</strong> A 4-point lead in polls 
          doesn't guarantee victory if the confidence intervals overlap!
        </p>
      </div>
    </div>
  );
});

// Main Component
export default function ProportionConfidenceInterval() {
  const [currentSection, setCurrentSection] = useState('intro');
  const [userProgress, setUserProgress] = useState({
    introCompleted: false,
    electionCompleted: false,
    theoryCompleted: false,
    practiceCompleted: false
  });
  
  return (
    <VisualizationContainer
      title="5.5 Proportion Confidence Intervals"
      description="From polls to population proportions"
    >
      <BackToHub chapter={5} />
      
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-neutral-400">Your Progress</span>
          <span className="text-sm text-neutral-400">
            {Object.values(userProgress).filter(Boolean).length} / 4 sections
          </span>
        </div>
        <div className="w-full bg-neutral-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.values(userProgress).filter(Boolean).length / 4) * 100}%` 
            }}
          />
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setCurrentSection('intro')}
          className={`px-4 py-2 rounded-lg transition-all ${
            currentSection === 'intro' 
              ? 'bg-purple-600 text-white' 
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          Introduction
        </button>
        <button
          onClick={() => setCurrentSection('election')}
          className={`px-4 py-2 rounded-lg transition-all ${
            currentSection === 'election' 
              ? 'bg-purple-600 text-white' 
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          Election Story
        </button>
        <button
          onClick={() => setCurrentSection('theory')}
          className={`px-4 py-2 rounded-lg transition-all ${
            currentSection === 'theory' 
              ? 'bg-blue-600 text-white' 
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
          disabled={!userProgress.electionCompleted}
        >
          Theory & Validation
        </button>
        <button
          onClick={() => setCurrentSection('practice')}
          className={`px-4 py-2 rounded-lg transition-all ${
            currentSection === 'practice' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
          disabled={!userProgress.theoryCompleted}
        >
          Practice & Apply
        </button>
      </div>
      
      {/* Content Sections */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentSection === 'intro' && (
            <div className="space-y-8">
              <ProportionIntroduction />
              <div className="text-center">
                <button
                  onClick={() => {
                    setUserProgress({...userProgress, introCompleted: true});
                    setCurrentSection('election');
                  }}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Continue to Election Story
                </button>
              </div>
            </div>
          )}
          
          {currentSection === 'election' && (
            <ElectionStory 
              onComplete={() => {
                setUserProgress({...userProgress, electionCompleted: true});
                setCurrentSection('theory');
              }}
            />
          )}
          
          {currentSection === 'theory' && (
            <div className="space-y-8">
              <NormalApproximationValidator />
              <div className="text-center">
                <button
                  onClick={() => {
                    setUserProgress({...userProgress, theoryCompleted: true});
                    setCurrentSection('practice');
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Continue to Practice
                </button>
              </div>
            </div>
          )}
          
          {currentSection === 'practice' && (
            <div className="space-y-8">
              <ProportionCIBuilder />
              <ScenarioExplorer />
              <CommonMistakes />
              <KeyTakeaways />
              
              {/* Section Complete - Standardized Component */}
              <SectionComplete chapter={5} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </VisualizationContainer>
  );
}