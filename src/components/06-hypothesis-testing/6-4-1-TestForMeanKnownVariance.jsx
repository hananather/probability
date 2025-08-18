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
import { colors, createColorScheme } from '@/lib/design-system';
import { Button } from '../ui/button';
import BackToHub from '../ui/BackToHub';
import { Calculator, Shield, Target, BarChart3, Info, TrendingUp, AlertCircle, Play, Pause, RotateCcw, Eye, EyeOff, Settings } from 'lucide-react';
import { SemanticGradientCard, SemanticGradientGrid } from '../ui/patterns/SemanticGradientCard';
import { InterpretationBox } from '../ui/patterns/InterpretationBox';

// Get vibrant Chapter 6 color scheme
const chapterColors = createColorScheme('hypothesis');

// Sample data from manufacturing process
const SAMPLE_DATA = [
  42.5, 39.8, 40.3, 43.1, 39.6, 41.0,
  39.9, 42.1, 40.7, 41.6, 42.1, 40.8
];

// Hypothesis Display Component
const HypothesisDisplay = React.memo(function HypothesisDisplay({ hypothesisType }) {
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
  }, [hypothesisType]);
  
  const getAlternative = () => {
    switch(hypothesisType) {
      case 'left': return '<';
      case 'right': return '>';
      default: return '\\neq';
    }
  };
  
  return (
    <div ref={contentRef} className="bg-neutral-800 rounded-lg p-4 max-w-3xl mx-auto">
      <div className="text-sm text-neutral-300 space-y-2">
        <p>
          <strong className="text-white"><span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />:</strong>{' '}
          <span dangerouslySetInnerHTML={{ __html: `\\(\\mu = 40\\)` }} /> kg/cm² (process meets specifications)
        </p>
        <p>
          <strong className="text-white"><span dangerouslySetInnerHTML={{ __html: `\\(H_1\\)` }} />:</strong>{' '}
          <span dangerouslySetInnerHTML={{ __html: `\\(\\mu ${getAlternative()} 40\\)` }} /> kg/cm²{' '}
          {hypothesisType === 'right' ? '(process improved)' : hypothesisType === 'left' ? '(process degraded)' : '(process changed)'}
        </p>
        <p>
          <strong className="text-white">Known:</strong>{' '}
          <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma = 1.2\\)` }} /> kg/cm²,{' '}
          <span dangerouslySetInnerHTML={{ __html: `\\(n = 12\\)` }} /> components
        </p>
        <p>
          <strong className="text-white">Question:</strong> Has the manufacturing process mean strength changed?
        </p>
      </div>
    </div>
  );
});

// Mathematical Framework Component
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
    <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-teal-400 mb-6">Mathematical Framework</h3>
      
      {/* Why We Standardize - Conceptual Foundation */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg p-5 mb-6 border border-indigo-500/20">
        <h4 className="font-bold text-indigo-300 mb-3">Why Do We Standardize? The Key Insight</h4>
        <div className="text-sm text-neutral-300 space-y-3">
          <p className="leading-relaxed">
            <span className="font-semibold text-indigo-300">The Problem:</span> Sample means vary from sample to sample, 
            even when the null hypothesis is true. But how much variation is "normal" vs "surprising"? This depends on 
            both the population variance (σ) and sample size (n).
          </p>
          
          <p className="leading-relaxed">
            <span className="font-semibold text-indigo-300">The Solution:</span> Standardization converts our sample mean 
            to a Z-score - measuring <em>"how many standard errors away from the hypothesized mean"</em>. This transforms 
            our problem from any scale (kg, cm, $) to a universal scale where we know the probabilities.
          </p>
          
          <div className="bg-indigo-900/30 rounded p-3">
            <p className="text-xs leading-relaxed">
              <span className="font-semibold">Analogy:</span> It's like converting temperatures from Celsius to a 
              "standard deviation scale" - instead of asking "is 25°C hot?", we ask "is this temperature 2 standard 
              deviations above normal?" The second question has the same answer everywhere!
            </p>
          </div>
        </div>
      </div>
      
      <div ref={contentRef} className="grid md:grid-cols-2 gap-6">
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Test Statistic</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">When <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} /> is known:</p>
            <div className="text-center text-teal-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[Z = \\frac{\\bar{X} - \\mu_0}{\\sigma/\\sqrt{n}} \\sim N(0, 1)\\]` }} />
            </div>
            
            <div className="mt-3 text-xs space-y-1">
              <p><span className="text-teal-300">• Numerator:</span> How far our sample mean is from the hypothesized value</p>
              <p><span className="text-teal-300">• Denominator:</span> Standard error = <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma/\\sqrt{n}\\)` }} /></p>
              <p className="pl-4 text-neutral-400">→ Measures typical variation in sample means</p>
              <p className="pl-4 text-neutral-400">→ Gets smaller as n increases (more precision)</p>
            </div>
            
            <p className="mt-3">Under <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />, Z follows standard normal</p>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Critical Values</h4>
          <div className="text-sm text-neutral-300">
            <table className="w-full mt-2">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-1 text-xs"><span dangerouslySetInnerHTML={{ __html: `\\(\\alpha\\)` }} /></th>
                  <th className="text-center py-1 text-xs">One-tailed</th>
                  <th className="text-center py-1 text-xs">Two-tailed</th>
                </tr>
              </thead>
              <tbody className="font-mono text-blue-400">
                <tr>
                  <td className="py-1">0.01</td>
                  <td className="text-center">2.327</td>
                  <td className="text-center">2.576</td>
                </tr>
                <tr>
                  <td className="py-1">0.05</td>
                  <td className="text-center">1.645</td>
                  <td className="text-center">1.960</td>
                </tr>
                <tr>
                  <td className="py-1">0.10</td>
                  <td className="text-center">1.282</td>
                  <td className="text-center">1.645</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Decision Rules</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">Alternative hypothesis determines rejection region:</p>
            <ul className="space-y-1 mt-2">
              <li>• <span dangerouslySetInnerHTML={{ __html: `\\(H_1: \\mu > \\mu_0\\)` }} />: Reject if <span dangerouslySetInnerHTML={{ __html: `\\(Z > z_\\alpha\\)` }} /></li>
              <li>• <span dangerouslySetInnerHTML={{ __html: `\\(H_1: \\mu < \\mu_0\\)` }} />: Reject if <span dangerouslySetInnerHTML={{ __html: `\\(Z < -z_\\alpha\\)` }} /></li>
              <li>• <span dangerouslySetInnerHTML={{ __html: `\\(H_1: \\mu \\neq \\mu_0\\)` }} />: Reject if <span dangerouslySetInnerHTML={{ __html: `\\(|Z| > z_{\\alpha/2}\\)` }} /></li>
            </ul>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Confidence Interval</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">For two-sided test at level <span dangerouslySetInnerHTML={{ __html: `\\(\\alpha\\)` }} />:</p>
            <div className="text-center text-green-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\bar{X} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]` }} />
            </div>
            <p className="mt-2 text-yellow-400">Reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> if <span dangerouslySetInnerHTML={{ __html: `\\(\\mu_0\\)` }} /> not in CI</p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Worked Example Component
const WorkedExample = React.memo(function WorkedExample({ 
  sampleData, 
  mu0, 
  sigma, 
  alpha, 
  hypothesisType 
}) {
  const contentRef = useRef(null);
  
  // Calculations
  const n = sampleData.length;
  const sampleMean = sampleData.reduce((sum, x) => sum + x, 0) / n;
  const se = sigma / Math.sqrt(n);
  const zStat = (sampleMean - mu0) / se;
  
  // Critical values
  const getCriticalValue = () => {
    if (hypothesisType === 'two') {
      return jStat.normal.inv(1 - alpha/2, 0, 1);
    } else {
      return jStat.normal.inv(1 - alpha, 0, 1);
    }
  };
  
  const criticalValue = getCriticalValue();
  
  // P-value calculation
  const getPValue = () => {
    if (hypothesisType === 'left') {
      return jStat.normal.cdf(zStat, 0, 1);
    } else if (hypothesisType === 'right') {
      return 1 - jStat.normal.cdf(zStat, 0, 1);
    } else {
      return 2 * (1 - jStat.normal.cdf(Math.abs(zStat), 0, 1));
    }
  };
  
  const pValue = getPValue();
  
  // Decision
  const makeDecision = () => {
    if (hypothesisType === 'two') {
      return Math.abs(zStat) > criticalValue;
    } else if (hypothesisType === 'right') {
      return zStat > criticalValue;
    } else {
      return zStat < -criticalValue;
    }
  };
  
  const rejectH0 = makeDecision();
  
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
  }, [alpha, hypothesisType]);
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-6 border border-neutral-700/50">
      <h3 className="text-xl font-bold text-purple-400 mb-6">
        Step-by-Step Hypothesis Test
      </h3>
      
      <div ref={contentRef} className="space-y-6">
        {/* Step 1: Sample Statistics */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 1: Calculate Sample Statistics</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>Sample data (n = {n} components):</p>
            <div className="font-mono text-xs bg-neutral-800 p-2 rounded overflow-x-auto">
              {sampleData.map((x, i) => x.toFixed(1)).join(', ')}
            </div>
            <div className="mt-3">
              <p>Sample mean:</p>
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i = \\frac{${(sampleData.reduce((sum, x) => sum + x, 0)).toFixed(1)}}{${n}} = ${sampleMean.toFixed(3)}\\]` 
              }} />
            </div>
          </div>
        </div>

        {/* Step 2: Standard Error */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 2: Calculate Standard Error</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[SE = \\frac{\\sigma}{\\sqrt{n}} = \\frac{${sigma}}{\\sqrt{${n}}} = \\frac{${sigma}}{${Math.sqrt(n).toFixed(3)}} = ${se.toFixed(3)}\\]` 
              }} />
            </div>
          </div>
        </div>

        {/* Step 3: Test Statistic */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 3: Calculate Test Statistic</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[Z = \\frac{\\bar{x} - \\mu_0}{SE} = \\frac{${sampleMean.toFixed(3)} - ${mu0}}{${se.toFixed(3)}} = \\frac{${(sampleMean - mu0).toFixed(3)}}{${se.toFixed(3)}} = ${zStat.toFixed(3)}\\]` 
              }} />
            </div>
          </div>
        </div>

        {/* Step 4: Critical Value Method */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 4: Critical Value Method</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>For <span dangerouslySetInnerHTML={{ __html: `\\(\\alpha = ${alpha}\\)` }} /> 
               {hypothesisType === 'two' ? ' (two-tailed)' : ' (one-tailed)'}:</p>
            <p className="mt-2">Critical value: <span dangerouslySetInnerHTML={{ 
              __html: `\\(z_{${hypothesisType === 'two' ? '\\alpha/2' : '\\alpha'}} = ${criticalValue.toFixed(3)}\\)` 
            }} /></p>
            <p className="mt-2">
              Decision rule: Reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> if{' '}
              {hypothesisType === 'two' && <span dangerouslySetInnerHTML={{ __html: `\\(|Z| > ${criticalValue.toFixed(3)}\\)` }} />}
              {hypothesisType === 'right' && <span dangerouslySetInnerHTML={{ __html: `\\(Z > ${criticalValue.toFixed(3)}\\)` }} />}
              {hypothesisType === 'left' && <span dangerouslySetInnerHTML={{ __html: `\\(Z < ${(-criticalValue).toFixed(3)}\\)` }} />}
            </p>
            <p className="mt-2">
              Since{' '}
              {hypothesisType === 'two' && <span dangerouslySetInnerHTML={{ __html: `\\(|${zStat.toFixed(3)}| = ${Math.abs(zStat).toFixed(3)}\\)` }} />}
              {hypothesisType !== 'two' && <span dangerouslySetInnerHTML={{ __html: `\\(Z = ${zStat.toFixed(3)}\\)` }} />}
              {' '}
              {rejectH0 ? '>' : '<'}
              {' '}
              {hypothesisType === 'left' ? (-criticalValue).toFixed(3) : criticalValue.toFixed(3)},
              we <span className={rejectH0 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                {rejectH0 ? 'reject' : 'fail to reject'}
              </span> <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />
            </p>
          </div>
        </div>

        {/* Step 5: P-Value Method */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 5: P-Value Method</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>P-value calculation:</p>
            {hypothesisType === 'two' && (
              <p className="mt-2">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\(p = 2 \\times P(Z > |${zStat.toFixed(3)}|) = 2 \\times ${(pValue/2).toFixed(4)} = ${pValue.toFixed(4)}\\)` 
                }} />
              </p>
            )}
            {hypothesisType === 'right' && (
              <p className="mt-2">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\(p = P(Z > ${zStat.toFixed(3)}) = ${pValue.toFixed(4)}\\)` 
                }} />
              </p>
            )}
            {hypothesisType === 'left' && (
              <p className="mt-2">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\(p = P(Z < ${zStat.toFixed(3)}) = ${pValue.toFixed(4)}\\)` 
                }} />
              </p>
            )}
            <p className="mt-3">
              Since p-value = {pValue.toFixed(4)} {pValue < alpha ? '<' : '>'} <span dangerouslySetInnerHTML={{ __html: `\\(\\alpha = ${alpha}\\)` }} />,
              we <span className={pValue < alpha ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                {pValue < alpha ? 'reject' : 'fail to reject'}
              </span> <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />
            </p>
          </div>
        </div>

        {/* Conclusion */}
        <div className={`rounded-lg p-4 ${rejectH0 ? 'bg-red-900/20 border border-red-500/30' : 'bg-green-900/20 border border-green-500/30'}`}>
          <h4 className="font-bold text-white mb-3">Conclusion</h4>
          <div className="text-sm text-neutral-300">
            <p>
              {rejectH0 ? (
                <>
                  There is sufficient evidence at the {(alpha * 100)}% significance level to conclude that 
                  the mean strength has {hypothesisType === 'right' ? 'increased' : hypothesisType === 'left' ? 'decreased' : 'changed'} 
                  {' '}from {mu0} kg/cm².
                </>
              ) : (
                <>
                  There is insufficient evidence at the {(alpha * 100)}% significance level to conclude that 
                  the mean strength differs from {mu0} kg/cm².
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Main Component
export default function TestForMeanKnownVariance() {
  // State management
  const [hypothesisType, setHypothesisType] = useState('right'); // 'left', 'right', 'two'
  const [significanceLevel, setSignificanceLevel] = useState(0.05);
  const [showCriticalValue, setShowCriticalValue] = useState(true);
  const [showPValue, setShowPValue] = useState(true);
  const [showCI, setShowCI] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [customCritical, setCustomCritical] = useState(1.645);
  
  // Refs for visualizations
  const mainVizRef = useRef(null);
  const powerCurveRef = useRef(null);
  
  // Known parameters
  const mu0 = 40;
  const sigma = 1.2;
  const n = SAMPLE_DATA.length;
  const sampleMean = useMemo(() => 
    SAMPLE_DATA.reduce((sum, x) => sum + x, 0) / n, []
  );
  
  // Calculate test statistic
  const testStatistic = useMemo(() => 
    (sampleMean - mu0) / (sigma / Math.sqrt(n)), [sampleMean]
  );
  
  // Calculate critical values based on hypothesis type
  const criticalValues = useMemo(() => {
    const z = jStat.normal.inv(1 - significanceLevel, 0, 1);
    
    switch (hypothesisType) {
      case 'left':
        return { lower: -z, upper: null };
      case 'right':
        return { lower: null, upper: z };
      case 'two':
        const z2 = jStat.normal.inv(1 - significanceLevel/2, 0, 1);
        return { lower: -z2, upper: z2 };
    }
  }, [hypothesisType, significanceLevel]);
  
  // Calculate p-value
  const pValue = useMemo(() => {
    switch (hypothesisType) {
      case 'left':
        return jStat.normal.cdf(testStatistic, 0, 1);
      case 'right':
        return 1 - jStat.normal.cdf(testStatistic, 0, 1);
      case 'two':
        return 2 * (1 - jStat.normal.cdf(Math.abs(testStatistic), 0, 1));
    }
  }, [testStatistic, hypothesisType]);
  
  // Main visualization effect
  useEffect(() => {
    if (!mainVizRef.current) return;
    
    const svg = d3.select(mainVizRef.current);
    svg.selectAll("*").remove();
    
    const width = mainVizRef.current.clientWidth || 800;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create gradients
    const defs = svg.append("defs");
    
    // Blue gradient for normal distribution
    const blueGradient = defs.append("linearGradient")
      .attr("id", "blue-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    blueGradient.append("stop")
      .attr("offset", "0%")
      .attr("style", "stop-color:#3b82f6;stop-opacity:0.6");
    blueGradient.append("stop")
      .attr("offset", "100%")
      .attr("style", "stop-color:#1e40af;stop-opacity:0.1");
    
    // Red gradient for rejection region
    const redGradient = defs.append("linearGradient")
      .attr("id", "red-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    redGradient.append("stop")
      .attr("offset", "0%")
      .attr("style", "stop-color:#ef4444;stop-opacity:0.7");
    redGradient.append("stop")
      .attr("offset", "100%")
      .attr("style", "stop-color:#dc2626;stop-opacity:0.2");
    
    // Green gradient for acceptance region
    const greenGradient = defs.append("linearGradient")
      .attr("id", "green-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    greenGradient.append("stop")
      .attr("offset", "0%")
      .attr("style", "stop-color:#10b981;stop-opacity:0.5");
    greenGradient.append("stop")
      .attr("offset", "100%")
      .attr("style", "stop-color:#059669;stop-opacity:0.1");
    
    // Purple gradient for p-value area
    const purpleGradient = defs.append("linearGradient")
      .attr("id", "purple-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    purpleGradient.append("stop")
      .attr("offset", "0%")
      .attr("style", "stop-color:#a855f7;stop-opacity:0.8");
    purpleGradient.append("stop")
      .attr("offset", "100%")
      .attr("style", "stop-color:#7c3aed;stop-opacity:0.3");
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.45])
      .range([innerHeight, 0]);
    
    // Normal curve data
    const normalCurve = d3.range(-4, 4.01, 0.01).map(z => ({
      x: z,
      y: jStat.normal.pdf(z, 0, 1)
    }));
    
    // Line generator
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Area generator
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(innerHeight)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Draw axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(9))
      .style("font-size", "12px")
      .style("color", "#9ca3af")
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => d.toFixed(2)))
      .style("font-size", "12px")
      .style("color", "#9ca3af")
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Axis labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 45)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "white")
      .text("Standard Normal (Z)");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "white")
      .text("Probability Density");
    
    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat("")
      )
      .style("stroke", "#64748b")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5);
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .style("stroke", "#64748b")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5);

    // Fill area under normal curve with gradient
    const normalArea = g.append("path")
      .datum(normalCurve)
      .attr("fill", "url(#blue-gradient)")
      .attr("d", area)
      .style("opacity", 0);
    
    normalArea.transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .style("opacity", 1);
    
    // Draw normal curve with animation
    const normalPath = g.append("path")
      .datum(normalCurve)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("d", line)
      .style("opacity", 0)
      .style("filter", "drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))");
    
    normalPath.transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .style("opacity", 1);
    
    // Draw rejection regions based on hypothesis type with animation
    if (showCriticalValue && criticalValues.upper !== null) {
      const upperReject = normalCurve.filter(d => d.x >= criticalValues.upper);
      const upperRejectArea = g.append("path")
        .datum(upperReject)
        .attr("fill", "url(#red-gradient)")
        .attr("d", area)
        .style("opacity", 0);
      
      upperRejectArea.transition()
        .duration(800)
        .delay(400)
        .ease(d3.easeCubicOut)
        .style("opacity", 1);
      
      // Critical value line
      const upperLine = g.append("line")
        .attr("x1", xScale(criticalValues.upper))
        .attr("x2", xScale(criticalValues.upper))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5")
        .style("opacity", 0)
        .style("filter", "drop-shadow(0 0 4px rgba(239, 68, 68, 0.4))");
      
      upperLine.transition()
        .duration(600)
        .delay(600)
        .ease(d3.easeCubicOut)
        .style("opacity", 1);
      
      // Label
      const upperLabel = g.append("text")
        .attr("x", xScale(criticalValues.upper))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", "#ef4444")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(`z = ${criticalValues.upper.toFixed(3)}`)
        .style("opacity", 0);
      
      upperLabel.transition()
        .duration(400)
        .delay(800)
        .ease(d3.easeCubicOut)
        .style("opacity", 1);
    }
    
    if (showCriticalValue && criticalValues.lower !== null) {
      const lowerReject = normalCurve.filter(d => d.x <= criticalValues.lower);
      const lowerRejectArea = g.append("path")
        .datum(lowerReject)
        .attr("fill", "url(#red-gradient)")
        .attr("d", area)
        .style("opacity", 0);
      
      lowerRejectArea.transition()
        .duration(800)
        .delay(400)
        .ease(d3.easeCubicOut)
        .style("opacity", 1);
      
      // Critical value line
      const lowerLine = g.append("line")
        .attr("x1", xScale(criticalValues.lower))
        .attr("x2", xScale(criticalValues.lower))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5")
        .style("opacity", 0)
        .style("filter", "drop-shadow(0 0 4px rgba(239, 68, 68, 0.4))");
      
      lowerLine.transition()
        .duration(600)
        .delay(600)
        .ease(d3.easeCubicOut)
        .style("opacity", 1);
      
      // Label
      const lowerLabel = g.append("text")
        .attr("x", xScale(criticalValues.lower))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", "#ef4444")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(`z = ${criticalValues.lower.toFixed(3)}`)
        .style("opacity", 0);
      
      lowerLabel.transition()
        .duration(400)
        .delay(800)
        .ease(d3.easeCubicOut)
        .style("opacity", 1);
    }
    
    // Draw p-value area if enabled with animation
    if (showPValue) {
      let pValueData;
      if (hypothesisType === 'right') {
        pValueData = normalCurve.filter(d => d.x >= testStatistic);
      } else if (hypothesisType === 'left') {
        pValueData = normalCurve.filter(d => d.x <= testStatistic);
      } else {
        // Two-tailed: show both tails
        pValueData = normalCurve.filter(d => Math.abs(d.x) >= Math.abs(testStatistic));
      }
      
      const pValueArea = g.append("path")
        .datum(pValueData)
        .attr("fill", "url(#purple-gradient)")
        .attr("d", area)
        .style("opacity", 0);
      
      pValueArea.transition()
        .duration(800)
        .delay(1000)
        .ease(d3.easeCubicOut)
        .style("opacity", 0.7);
    }
    
    // Draw test statistic line with animation
    const testStatLine = g.append("line")
      .attr("x1", xScale(testStatistic))
      .attr("x2", xScale(testStatistic))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 4)
      .style("filter", "drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))")
      .style("opacity", 0);
    
    testStatLine.transition()
      .duration(800)
      .delay(1200)
      .ease(d3.easeCubicOut)
      .style("opacity", 1);
    
    // Animated test statistic marker
    const testStatMarker = g.append("circle")
      .attr("cx", xScale(testStatistic))
      .attr("cy", yScale(jStat.normal.pdf(testStatistic, 0, 1)))
      .attr("r", 0)
      .attr("fill", "#3b82f6")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))");
    
    testStatMarker.transition()
      .duration(600)
      .delay(1400)
      .ease(d3.easeCubicOut)
      .attr("r", 8);
    
    // Test statistic label
    const testStatLabel = g.append("text")
      .attr("x", xScale(testStatistic))
      .attr("y", yScale(0.4))
      .attr("text-anchor", "middle")
      .attr("fill", "#3b82f6")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("text-shadow", "0 0 8px rgba(59, 130, 246, 0.8)")
      .text(`Z = ${testStatistic.toFixed(3)}`)
      .style("opacity", 0);
    
    testStatLabel.transition()
      .duration(400)
      .delay(1600)
      .ease(d3.easeCubicOut)
      .style("opacity", 1);
    
    // Add professional labels panel
    const labelsGroup = g.append("g")
      .attr("class", "labels-panel")
      .style("opacity", 0);
    
    let labelY = 20;
    
    if (showCriticalValue) {
      labelsGroup.append("rect")
        .attr("x", innerWidth - 120)
        .attr("y", labelY - 15)
        .attr("width", 110)
        .attr("height", 20)
        .attr("fill", "rgba(239, 68, 68, 0.1)")
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 1)
        .attr("rx", 4);
      
      labelsGroup.append("text")
        .attr("x", innerWidth - 65)
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("fill", "#ef4444")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(`α = ${significanceLevel}`);
      
      labelY += 30;
    }
    
    if (showPValue) {
      labelsGroup.append("rect")
        .attr("x", innerWidth - 140)
        .attr("y", labelY - 15)
        .attr("width", 130)
        .attr("height", 20)
        .attr("fill", "rgba(168, 85, 247, 0.1)")
        .attr("stroke", "#a855f7")
        .attr("stroke-width", 1)
        .attr("rx", 4);
      
      labelsGroup.append("text")
        .attr("x", innerWidth - 75)
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("fill", "#a855f7")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(`p = ${pValue.toFixed(4)}`);
    }
    
    labelsGroup.transition()
      .duration(600)
      .delay(1800)
      .ease(d3.easeCubicOut)
      .style("opacity", 1);
    
  }, [testStatistic, criticalValues, significanceLevel, hypothesisType, showCriticalValue, showPValue]);
  
  // Confidence interval calculations
  const confidenceInterval = useMemo(() => {
    const z = jStat.normal.inv(1 - significanceLevel/2, 0, 1);
    const margin = z * sigma / Math.sqrt(n);
    return {
      lower: sampleMean - margin,
      upper: sampleMean + margin,
      contains: mu0 >= sampleMean - margin && mu0 <= sampleMean + margin
    };
  }, [sampleMean, significanceLevel]);
  
  return (
    <VisualizationContainer
      title="Test for a Mean with Known Variance"
      description="Learn how to test hypotheses about population means when variance is known using the z-test."
    >
      <div className="space-y-8">
        {/* Back to Hub Button */}
        <BackToHub chapter={6} />

        {/* Learning Context Section */}
        <VisualizationSection>
          <InterpretationBox title="Learning Context" theme="blue">
            <p className="text-sm">
              The z-test for a mean represents the simplest hypothesis testing scenario—when population variance is known. 
              While rare in practice, this case provides the clearest introduction to test construction and the relationship 
              between test statistics, critical values, and p-values.
            </p>
            <p className="text-sm mt-2">
              <strong>Practical Context:</strong> This test applies in manufacturing with established processes, 
              standardized testing with known precision, or when using measurement instruments with documented variability.
            </p>
            <p className="text-sm mt-2">
              <strong>Bridge to t-test:</strong> Once you master the z-test logic, transitioning to the t-test 
              (unknown variance) requires only adjusting for the additional uncertainty through degrees of freedom.
            </p>
          </InterpretationBox>
          
          <SemanticGradientGrid title="Key Components" theme="blue">
            <SemanticGradientCard
              title="Test Statistic"
              description="Standardized distance from null"
              formula={`\\[Z = \\frac{\\bar{X} - \\mu_0}{\\sigma/\\sqrt{n}}\\]`}
              note="Follows standard normal distribution under H₀"
              theme="purple"
            />
            <SemanticGradientCard
              title="Critical Value Method"
              description="Compare Z to threshold"
              formula={`\\[|Z| > z_{\\alpha/2}\\]`}
              note="Reject H₀ if test statistic exceeds critical value"
              theme="blue"
            />
            <SemanticGradientCard
              title="P-Value Method"
              description="Probability of extreme data"
              formula={`\\[p = P(|Z| > |z_{obs}|)\\]`}
              note="Reject H₀ if p-value < significance level α"
              theme="teal"
            />
            <SemanticGradientCard
              title="Confidence Interval"
              description="Range of plausible values"
              formula={`\\[\\bar{X} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]`}
              note="Reject H₀ if μ₀ outside interval"
              theme="green"
            />
          </SemanticGradientGrid>
        </VisualizationSection>

        {/* Introduction */}
        <VisualizationSection>
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">Manufacturing Quality Control</h3>
                <p className="text-teal-400 font-medium">Z-Test for Known Variance</p>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-neutral-300 text-lg leading-relaxed">
                A cement manufacturer has modified their production process. Components are supposed to have 
                a mean strength of <span className="text-blue-400 font-semibold">μ = 40 kg/cm²</span> with known standard deviation 
                <span className="text-teal-400 font-semibold">σ = 1.2 kg/cm²</span>. 
                We test a sample of <span className="text-purple-400 font-semibold">12 components</span> to determine if the process mean has changed.
              </p>
            </div>
            
            <HypothesisDisplay hypothesisType={hypothesisType} />
          </div>
        </VisualizationSection>

        {/* When is Variance Known? */}
        <VisualizationSection className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg p-6 border border-amber-500/20">
          <h3 className="text-xl font-bold text-amber-400 mb-4">When is Variance Actually Known?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-neutral-200 mb-3">Real Scenarios with Known σ</h4>
              <ul className="text-sm text-neutral-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  <span><strong>Manufacturing:</strong> Years of historical data from stable processes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  <span><strong>Measurement instruments:</strong> Calibrated devices with known precision</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  <span><strong>Quality control:</strong> Long-term process monitoring data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  <span><strong>Simulations:</strong> When we control the data generation process</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-200 mb-3">Z-test vs T-test: When to Use Which?</h4>
              <div className="text-sm text-neutral-300 space-y-3">
                <div className="bg-amber-900/20 rounded p-3">
                  <p className="font-semibold text-amber-300">Use Z-test when:</p>
                  <ul className="text-xs mt-1 space-y-1">
                    <li>• Population variance is truly known</li>
                    <li>• Sample size is large (n {'>'} 30) - CLT applies</li>
                    <li>• Historical data provides reliable σ estimate</li>
                  </ul>
                </div>
                
                <div className="bg-orange-900/20 rounded p-3">
                  <p className="font-semibold text-orange-300">Use T-test when:</p>
                  <ul className="text-xs mt-1 space-y-1">
                    <li>• Population variance is unknown (most common)</li>
                    <li>• Small sample size (n {'<'} 30)</li>
                    <li>• Estimating σ from the sample itself</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-900/30 rounded">
            <p className="text-sm text-amber-300">
              <span className="font-semibold">Note:</span> In practice, σ is rarely truly known. The z-test is often taught first 
              because it's simpler mathematically, but the t-test is more commonly used in real applications.
            </p>
          </div>
        </VisualizationSection>

        {/* Mathematical Framework */}
        <MathematicalFramework />

        {/* Interactive Controls */}
        <VisualizationSection className="bg-neutral-800/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-teal-400" />
            <h4 className="text-lg font-bold text-white">Test Configuration</h4>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <ControlGroup label="Alternative Hypothesis">
              <div className="space-y-2">
                {[
                  { value: 'two', label: 'μ ≠ 40', desc: 'Two-sided', icon: TrendingUp },
                  { value: 'right', label: 'μ > 40', desc: 'Right-sided', icon: TrendingUp },
                  { value: 'left', label: 'μ < 40', desc: 'Left-sided', icon: TrendingUp }
                ].map(({ value, label, desc, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setHypothesisType(value)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                      hypothesisType === value
                        ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-500/50'
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="text-left">
                      <div className="font-semibold">{label}</div>
                      <div className="text-xs opacity-75">{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </ControlGroup>

            <ControlGroup label="Significance Level (α)">
              <div className="space-y-2">
                {[0.01, 0.05, 0.10].map(alpha => (
                  <button
                    key={alpha}
                    onClick={() => setSignificanceLevel(alpha)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                      significanceLevel === alpha
                        ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-500/50'
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                    }`}
                  >
                    <span>α = {alpha}</span>
                    <span className="text-xs opacity-75">{(alpha * 100)}%</span>
                  </button>
                ))}
              </div>
            </ControlGroup>

            <ControlGroup label="Display Options">
              <div className="space-y-3">
                <button
                  onClick={() => setShowCriticalValue(!showCriticalValue)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    showCriticalValue
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                  }`}
                >
                  {showCriticalValue ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>Critical Values</span>
                </button>
                
                <button
                  onClick={() => setShowPValue(!showPValue)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    showPValue
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                  }`}
                >
                  {showPValue ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>P-Value Area</span>
                </button>
              </div>
            </ControlGroup>
          </div>
        </VisualizationSection>

        {/* Main Visualization */}
        <GraphContainer title="Hypothesis Test Visualization">
          <svg ref={mainVizRef} className="w-full"></svg>
        </GraphContainer>

        {/* Test Results Summary */}
        <div className="grid md:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-teal-500/10 to-teal-600/10 border border-teal-500/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Calculator className="w-6 h-6 text-teal-400" />
              <h4 className="text-lg font-bold text-teal-400">Sample Mean</h4>
            </div>
            <div className="text-3xl font-mono font-bold text-teal-400">
              {sampleMean.toFixed(3)}
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              n = {n} components
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-6 h-6 text-blue-400" />
              <h4 className="text-lg font-bold text-blue-400">Test Statistic</h4>
            </div>
            <div className="text-3xl font-mono font-bold text-blue-400">
              Z = {testStatistic.toFixed(3)}
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              Standardized difference
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`bg-gradient-to-br rounded-lg p-6 border ${
              pValue < significanceLevel
                ? 'from-red-500/10 to-red-600/10 border-red-500/30'
                : 'from-green-500/10 to-green-600/10 border-green-500/30'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              {pValue < significanceLevel ? (
                <AlertCircle className="w-6 h-6 text-red-400" />
              ) : (
                <Shield className="w-6 h-6 text-green-400" />
              )}
              <h4 className={`text-lg font-bold ${
                pValue < significanceLevel ? 'text-red-400' : 'text-green-400'
              }`}>P-value</h4>
            </div>
            <div className={`text-3xl font-mono font-bold ${
              pValue < significanceLevel ? 'text-red-400' : 'text-green-400'
            }`}>
              {pValue < 0.001 ? '< 0.001' : pValue.toFixed(4)}
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              {pValue < significanceLevel ? 'Reject H₀' : 'Fail to reject H₀'}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <h4 className="text-lg font-bold text-purple-400">{((1 - significanceLevel) * 100)}% CI</h4>
            </div>
            <div className="text-sm font-mono font-bold text-purple-400">
              ({confidenceInterval.lower.toFixed(3)}, {confidenceInterval.upper.toFixed(3)})
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              {confidenceInterval.contains ? 'Contains μ₀' : 'Excludes μ₀'}
            </p>
          </motion.div>
        </div>

        {/* Three Methods Comparison */}
        <VisualizationSection className="bg-gradient-to-br from-teal-900/20 to-teal-800/20 border border-teal-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-teal-400" />
            <h3 className="text-xl font-bold text-teal-400">Three Equivalent Approaches</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div 
              className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-400" />
                Critical Value Method
              </h4>
              <div className="text-sm text-neutral-300 space-y-3">
                <p>Compare test statistic to critical value:</p>
                <div className="bg-neutral-800/50 rounded p-3">
                  <p className="font-mono text-center text-blue-400">
                    {hypothesisType === 'two' && `|${testStatistic.toFixed(3)}| ${Math.abs(testStatistic) > criticalValues.upper ? '>' : '<'} ${criticalValues.upper?.toFixed(3)}`}
                    {hypothesisType === 'right' && `${testStatistic.toFixed(3)} ${testStatistic > criticalValues.upper ? '>' : '<'} ${criticalValues.upper?.toFixed(3)}`}
                    {hypothesisType === 'left' && `${testStatistic.toFixed(3)} ${testStatistic < criticalValues.lower ? '<' : '>'} ${criticalValues.lower?.toFixed(3)}`}
                  </p>
                </div>
                <p className={`text-center font-bold text-lg ${
                  (hypothesisType === 'two' && Math.abs(testStatistic) > criticalValues.upper) ||
                  (hypothesisType === 'right' && testStatistic > criticalValues.upper) ||
                  (hypothesisType === 'left' && testStatistic < criticalValues.lower)
                    ? 'text-red-400' : 'text-green-400'
                }`}>
                  {(hypothesisType === 'two' && Math.abs(testStatistic) > criticalValues.upper) ||
                   (hypothesisType === 'right' && testStatistic > criticalValues.upper) ||
                   (hypothesisType === 'left' && testStatistic < criticalValues.lower)
                    ? 'Reject H₀' : 'Fail to reject H₀'}
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                P-Value Method
              </h4>
              <div className="text-sm text-neutral-300 space-y-3">
                <p>Compare p-value to significance level:</p>
                <div className="bg-neutral-800/50 rounded p-3">
                  <p className="font-mono text-center text-purple-400">
                    {pValue.toFixed(4)} {pValue < significanceLevel ? '<' : '>'} {significanceLevel}
                  </p>
                </div>
                <p className={`text-center font-bold text-lg ${
                  pValue < significanceLevel ? 'text-red-400' : 'text-green-400'
                }`}>
                  {pValue < significanceLevel ? 'Reject H₀' : 'Fail to reject H₀'}
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-400" />
                Confidence Interval
              </h4>
              <div className="text-sm text-neutral-300 space-y-3">
                <p>Check if μ₀ is in the CI:</p>
                <div className="bg-neutral-800/50 rounded p-3">
                  <p className="font-mono text-center text-teal-400 text-xs">
                    {mu0} {confidenceInterval.contains ? '∈' : '∉'} ({confidenceInterval.lower.toFixed(2)}, {confidenceInterval.upper.toFixed(2)})
                  </p>
                </div>
                <p className={`text-center font-bold text-lg ${
                  !confidenceInterval.contains ? 'text-red-400' : 'text-green-400'
                }`}>
                  {!confidenceInterval.contains ? 'Reject H₀' : 'Fail to reject H₀'}
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="mt-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <p className="text-sm text-neutral-300 text-center">
              <Info className="w-4 h-4 inline mr-2 text-yellow-400" />
              <strong className="text-yellow-400">Key Insight:</strong> All three methods always give the same conclusion!
            </p>
          </motion.div>
        </VisualizationSection>

        {/* Worked Example */}
        <WorkedExample 
          sampleData={SAMPLE_DATA}
          mu0={mu0}
          sigma={sigma}
          alpha={significanceLevel}
          hypothesisType={hypothesisType}
        />

        {/* Key Insights */}
        <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-4">Key Insights</h3>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-neutral-800/50 rounded p-4">
              <h4 className="font-bold text-white mb-2">When to Use Z-Test</h4>
              <ul className="text-neutral-300 space-y-1">
                <li>• Population standard deviation σ is known</li>
                <li>• Population is normal OR n ≥ 30 (CLT)</li>
                <li>• Testing hypothesis about population mean μ</li>
                <li>• If σ unknown, use t-test instead</li>
              </ul>
            </div>
            
            <div className="bg-neutral-800/50 rounded p-4">
              <h4 className="font-bold text-white mb-2">Sample Size Effects</h4>
              <ul className="text-neutral-300 space-y-1">
                <li>• Larger n → Smaller standard error</li>
                <li>• Smaller SE → Larger test statistic</li>
                <li>• More likely to detect true differences</li>
                <li>• Power increases with sample size</li>
              </ul>
            </div>
            
            <div className="bg-neutral-800/50 rounded p-4">
              <h4 className="font-bold text-white mb-2">Interpreting Results</h4>
              <ul className="text-neutral-300 space-y-1">
                <li>• Reject H₀: Evidence of change</li>
                <li>• Fail to reject: Insufficient evidence</li>
                <li>• Never "accept" the null hypothesis</li>
                <li>• Consider practical significance too</li>
              </ul>
            </div>
            
            <div className="bg-neutral-800/50 rounded p-4">
              <h4 className="font-bold text-white mb-2">Common Mistakes</h4>
              <ul className="text-neutral-300 space-y-1">
                <li>• Using z-test when σ is unknown</li>
                <li>• Ignoring normality assumptions</li>
                <li>• Confusing statistical/practical significance</li>
                <li>• Misinterpreting p-values</li>
              </ul>
            </div>
          </div>
        </VisualizationSection>
      </div>
    </VisualizationContainer>
  );
}