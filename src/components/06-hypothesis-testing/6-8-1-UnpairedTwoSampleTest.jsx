"use client";
import React, { useState, useEffect, useRef } from "react";
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
import BackToHub from '../ui/BackToHub';
import { Calculator, Info, BarChart3 } from 'lucide-react';

// Get vibrant Chapter 6 color scheme
const chapterColors = createColorScheme('hypothesis');

// Overview Component - Introduction to the concept
const ConceptOverview = React.memo(function ConceptOverview() {
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
      <h3 className="text-xl font-bold text-teal-400 mb-6">
        Comparing Two Independent Samples
      </h3>
      
      <div ref={contentRef} className="space-y-4 text-sm text-neutral-300">
        <p>
          When comparing means from two independent groups, we test whether the difference 
          between sample means is statistically significant or due to random variation.
        </p>
        
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-2">Key Question</h4>
          <p>
            Is the observed difference <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{X}_1 - \\bar{X}_2\\)` }} /> large enough to conclude 
            that the population means <span dangerouslySetInnerHTML={{ __html: `\\(\\mu_1\\)` }} /> and <span dangerouslySetInnerHTML={{ __html: `\\(\\mu_2\\)` }} /> are different?
          </p>
        </div>
        
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-2">Hypotheses</h4>
          <ul className="space-y-2">
            <li>• <span dangerouslySetInnerHTML={{ __html: `\\(H_0: \\mu_1 = \\mu_2\\)` }} /> (no difference between groups)</li>
            <li>• <span dangerouslySetInnerHTML={{ __html: `\\(H_1: \\mu_1 \\neq \\mu_2\\)` }} /> (two-sided alternative)</li>
            <li>• <span dangerouslySetInnerHTML={{ __html: `\\(H_1: \\mu_1 < \\mu_2\\)` }} /> or <span dangerouslySetInnerHTML={{ __html: `\\(\\mu_1 > \\mu_2\\)` }} /> (one-sided alternatives)</li>
          </ul>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Test Selection Framework
const TestSelectionFramework = React.memo(function TestSelectionFramework() {
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
      <h3 className="text-xl font-bold text-teal-400 mb-6">
        Choosing the Right Test
      </h3>
      
      <div ref={contentRef}>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Z-test */}
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-lg p-4 border border-blue-700/30">
            <h4 className="font-bold text-blue-400 mb-3">Z-Test</h4>
            <div className="text-sm text-neutral-300 space-y-2">
              <p className="font-semibold">When to use:</p>
              <ul className="space-y-1">
                <li>• Population variances <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma_1^2, \\sigma_2^2\\)` }} /> are known</li>
                <li>• Large samples (n ≥ 30)</li>
              </ul>
              <div className="mt-3 text-center">
                <span dangerouslySetInnerHTML={{ __html: `\\[Z = \\frac{\\bar{X}_1 - \\bar{X}_2}{\\sqrt{\\frac{\\sigma_1^2}{n_1} + \\frac{\\sigma_2^2}{n_2}}}\\]` }} />
              </div>
            </div>
          </div>
          
          {/* Pooled t-test */}
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-lg p-4 border border-blue-700/30">
            <h4 className="font-bold text-blue-400 mb-3">Pooled t-Test</h4>
            <div className="text-sm text-neutral-300 space-y-2">
              <p className="font-semibold">When to use:</p>
              <ul className="space-y-1">
                <li>• Variances unknown but equal</li>
                <li>• <span dangerouslySetInnerHTML={{ __html: `\\(\\frac{S_1^2}{S_2^2} < 3\\)` }} /></li>
              </ul>
              <div className="mt-3 text-center">
                <span dangerouslySetInnerHTML={{ __html: `\\[t = \\frac{\\bar{X}_1 - \\bar{X}_2}{S_p\\sqrt{\\frac{1}{n_1} + \\frac{1}{n_2}}}\\]` }} />
              </div>
            </div>
          </div>
          
          {/* Welch's t-test */}
          <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-lg p-4 border border-green-700/30">
            <h4 className="font-bold text-green-400 mb-3">Welch's t-Test</h4>
            <div className="text-sm text-neutral-300 space-y-2">
              <p className="font-semibold">When to use:</p>
              <ul className="space-y-1">
                <li>• Variances unknown and unequal</li>
                <li>• Default choice when unsure</li>
              </ul>
              <div className="mt-3 text-center">
                <span dangerouslySetInnerHTML={{ __html: `\\[t = \\frac{\\bar{X}_1 - \\bar{X}_2}{\\sqrt{\\frac{S_1^2}{n_1} + \\frac{S_2^2}{n_2}}}\\]` }} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-yellow-400 mb-2">
            <Info className="inline-block w-4 h-4 mr-2" />
            Decision Rule
          </h4>
          <p className="text-sm text-neutral-300">
            If the variance ratio <span dangerouslySetInnerHTML={{ __html: `\\(\\frac{S_1^2}{S_2^2} > 3\\)` }} /> or <span dangerouslySetInnerHTML={{ __html: `\\(\\frac{S_2^2}{S_1^2} > 3\\)` }} />, 
            use Welch's t-test. Otherwise, the pooled t-test is appropriate.
          </p>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Worked Example Component
const WorkedExample = React.memo(function WorkedExample({ example }) {
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
  }, [example]);
  
  // Calculate statistics
  const calculateStats = (data) => {
    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    const sd = Math.sqrt(variance);
    return { n, mean, variance, sd };
  };
  
  const group1Stats = calculateStats(example.group1.data);
  const group2Stats = calculateStats(example.group2.data);
  
  // Determine appropriate test
  const varianceRatio = Math.max(group1Stats.variance / group2Stats.variance, 
                                group2Stats.variance / group1Stats.variance);
  const usePooled = varianceRatio < 3 && !example.group1.knownSigma;
  const useZTest = example.group1.knownSigma && example.group2.knownSigma;
  
  // Calculate test statistic
  let testStat, se, df, testType;
  
  if (useZTest) {
    testType = "Z-test";
    se = Math.sqrt(Math.pow(example.group1.knownSigma, 2) / group1Stats.n + 
                   Math.pow(example.group2.knownSigma, 2) / group2Stats.n);
    testStat = (group1Stats.mean - group2Stats.mean) / se;
    df = null;
  } else if (usePooled) {
    testType = "Pooled t-test";
    const pooledVar = ((group1Stats.n - 1) * group1Stats.variance + 
                       (group2Stats.n - 1) * group2Stats.variance) / 
                      (group1Stats.n + group2Stats.n - 2);
    const pooledSd = Math.sqrt(pooledVar);
    se = pooledSd * Math.sqrt(1/group1Stats.n + 1/group2Stats.n);
    testStat = (group1Stats.mean - group2Stats.mean) / se;
    df = group1Stats.n + group2Stats.n - 2;
  } else {
    testType = "Welch's t-test";
    se = Math.sqrt(group1Stats.variance / group1Stats.n + 
                   group2Stats.variance / group2Stats.n);
    testStat = (group1Stats.mean - group2Stats.mean) / se;
    // Welch-Satterthwaite approximation
    const dfNum = Math.pow(se, 4);
    const dfDenom = Math.pow(group1Stats.variance / group1Stats.n, 2) / (group1Stats.n - 1) +
                    Math.pow(group2Stats.variance / group2Stats.n, 2) / (group2Stats.n - 1);
    df = Math.floor(dfNum / dfDenom);
  }
  
  // Calculate p-value (two-tailed)
  const pValue = useZTest 
    ? 2 * (1 - jStat.normal.cdf(Math.abs(testStat), 0, 1))
    : 2 * (1 - jStat.studentt.cdf(Math.abs(testStat), df));
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-6 border border-neutral-700/50">
      <h3 className="text-xl font-bold text-teal-400 mb-6">
        Worked Example: {example.title}
      </h3>
      
      <div ref={contentRef} className="space-y-6">
        {/* Data Summary */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-neutral-900/50 rounded-lg p-4 border border-blue-500/30">
            <h4 className="font-bold text-blue-400 mb-3">{example.group1.label}</h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• Sample size: <span className="font-mono">n₁ = {group1Stats.n}</span></li>
              <li>• Mean: <span className="font-mono">x̄₁ = {group1Stats.mean.toFixed(2)}</span></li>
              <li>• Std Dev: <span className="font-mono">s₁ = {group1Stats.sd.toFixed(2)}</span></li>
              <li>• Variance: <span className="font-mono">s₁² = {group1Stats.variance.toFixed(2)}</span></li>
            </ul>
          </div>
          
          <div className="bg-neutral-900/50 rounded-lg p-4 border border-green-500/30">
            <h4 className="font-bold text-green-400 mb-3">{example.group2.label}</h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• Sample size: <span className="font-mono">n₂ = {group2Stats.n}</span></li>
              <li>• Mean: <span className="font-mono">x̄₂ = {group2Stats.mean.toFixed(2)}</span></li>
              <li>• Std Dev: <span className="font-mono">s₂ = {group2Stats.sd.toFixed(2)}</span></li>
              <li>• Variance: <span className="font-mono">s₂² = {group2Stats.variance.toFixed(2)}</span></li>
            </ul>
          </div>
        </div>
        
        {/* Test Selection */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 1: Select Appropriate Test</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>Variance ratio: <span className="font-mono">{varianceRatio.toFixed(2)}</span></p>
            <p>
              {useZTest && "Population variances are known → Use Z-test"}
              {usePooled && !useZTest && `Variance ratio < 3 → Use pooled t-test`}
              {!usePooled && !useZTest && `Variance ratio ≥ 3 → Use Welch's t-test`}
            </p>
          </div>
        </div>
        
        {/* Calculations */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 2: Calculate Test Statistic</h4>
          <div className="text-sm text-neutral-300 space-y-3">
            <p>Standard Error: <span className="font-mono">SE = {se.toFixed(4)}</span></p>
            <p>Test Statistic: <span className="font-mono">{testType === "Z-test" ? "Z" : "t"} = {testStat.toFixed(4)}</span></p>
            {df && <p>Degrees of Freedom: <span className="font-mono">df = {df}</span></p>}
            
            <div className="mt-3 text-center">
              <span dangerouslySetInnerHTML={{ 
                __html: testType === "Z-test" 
                  ? `\\[Z = \\frac{${group1Stats.mean.toFixed(2)} - ${group2Stats.mean.toFixed(2)}}{${se.toFixed(4)}} = ${testStat.toFixed(4)}\\]`
                  : `\\[t = \\frac{${group1Stats.mean.toFixed(2)} - ${group2Stats.mean.toFixed(2)}}{${se.toFixed(4)}} = ${testStat.toFixed(4)}\\]`
              }} />
            </div>
          </div>
        </div>
        
        {/* Decision */}
        <div className={`rounded-lg p-4 ${pValue < 0.05 ? 'bg-red-900/20 border border-red-700/30' : 'bg-green-900/20 border border-green-700/30'}`}>
          <h4 className="font-bold text-white mb-3">Step 3: Make Decision</h4>
          <div className="text-sm space-y-2">
            <p>P-value: <span className="font-mono">{pValue.toFixed(4)}</span></p>
            <p className="font-semibold">
              {pValue < 0.05 
                ? `Reject H₀: There is significant evidence that the means differ (p < 0.05)`
                : `Fail to reject H₀: There is insufficient evidence that the means differ (p ≥ 0.05)`
              }
            </p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Data Comparison Table Component
const DataComparisonTable = React.memo(function DataComparisonTable({ group1Data, group2Data, group1Label, group2Label, example }) {
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
  }, [group1Data, group2Data]);
  
  // Calculate statistics
  const calculateStats = (data) => {
    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    const sd = Math.sqrt(variance);
    const se = sd / Math.sqrt(n);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const q1 = jStat.percentile(data, 0.25);
    const median = jStat.percentile(data, 0.5);
    const q3 = jStat.percentile(data, 0.75);
    return { n, mean, variance, sd, se, min, max, q1, median, q3 };
  };
  
  const stats1 = calculateStats(group1Data);
  const stats2 = calculateStats(group2Data);
  
  // Calculate test statistics
  const pooledVar = ((stats1.n - 1) * stats1.variance + (stats2.n - 1) * stats2.variance) / 
                    (stats1.n + stats2.n - 2);
  const pooledSd = Math.sqrt(pooledVar);
  const cohensD = (stats1.mean - stats2.mean) / pooledSd;
  
  return (
    <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-400 mb-6">
        <BarChart3 className="inline-block w-5 h-5 mr-2" />
        Data Summary and Comparison
      </h3>
      
      <div ref={contentRef} className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="text-left py-3 px-4 text-neutral-400 font-semibold">Statistic</th>
              <th className="text-center py-3 px-4 text-blue-400 font-semibold">{group1Label}</th>
              <th className="text-center py-3 px-4 text-green-400 font-semibold">{group2Label}</th>
              <th className="text-center py-3 px-4 text-teal-400 font-semibold">Difference</th>
            </tr>
          </thead>
          <tbody>
            {/* Sample Size */}
            <tr className="border-b border-neutral-700/50 hover:bg-neutral-800/50 transition-colors">
              <td className="py-3 px-4 text-neutral-300">Sample Size (<span dangerouslySetInnerHTML={{ __html: `\\(n\\)` }} />)</td>
              <td className="text-center py-3 px-4 font-mono text-white">{stats1.n}</td>
              <td className="text-center py-3 px-4 font-mono text-white">{stats2.n}</td>
              <td className="text-center py-3 px-4 text-neutral-400">—</td>
            </tr>
            
            {/* Mean */}
            <tr className="border-b border-neutral-700/50 hover:bg-neutral-800/50 transition-colors">
              <td className="py-3 px-4 text-neutral-300">Mean (<span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x}\\)` }} />)</td>
              <td className="text-center py-3 px-4 font-mono text-white">{stats1.mean.toFixed(2)}</td>
              <td className="text-center py-3 px-4 font-mono text-white">{stats2.mean.toFixed(2)}</td>
              <td className="text-center py-3 px-4 font-mono text-teal-300">{(stats1.mean - stats2.mean).toFixed(2)}</td>
            </tr>
            
            {/* Standard Deviation */}
            <tr className="border-b border-neutral-700/50 hover:bg-neutral-800/50 transition-colors">
              <td className="py-3 px-4 text-neutral-300">Std Dev (<span dangerouslySetInnerHTML={{ __html: `\\(s\\)` }} />)</td>
              <td className="text-center py-3 px-4 font-mono text-white">{stats1.sd.toFixed(2)}</td>
              <td className="text-center py-3 px-4 font-mono text-white">{stats2.sd.toFixed(2)}</td>
              <td className="text-center py-3 px-4 text-neutral-400">—</td>
            </tr>
            
            {/* Variance */}
            <tr className="border-b border-neutral-700/50 hover:bg-neutral-800/50 transition-colors">
              <td className="py-3 px-4 text-neutral-300">Variance (<span dangerouslySetInnerHTML={{ __html: `\\(s^2\\)` }} />)</td>
              <td className="text-center py-3 px-4 font-mono text-white">{stats1.variance.toFixed(2)}</td>
              <td className="text-center py-3 px-4 font-mono text-white">{stats2.variance.toFixed(2)}</td>
              <td className="text-center py-3 px-4 font-mono text-teal-300">
                Ratio: {Math.max(stats1.variance/stats2.variance, stats2.variance/stats1.variance).toFixed(2)}
              </td>
            </tr>
            
            {/* Standard Error */}
            <tr className="border-b border-neutral-700/50 hover:bg-neutral-800/50 transition-colors">
              <td className="py-3 px-4 text-neutral-300">Standard Error (<span dangerouslySetInnerHTML={{ __html: `\\(SE\\)` }} />)</td>
              <td className="text-center py-3 px-4 font-mono text-white">{stats1.se.toFixed(3)}</td>
              <td className="text-center py-3 px-4 font-mono text-white">{stats2.se.toFixed(3)}</td>
              <td className="text-center py-3 px-4 text-neutral-400">—</td>
            </tr>
            
            {/* Min/Max */}
            <tr className="border-b border-neutral-700/50 hover:bg-neutral-800/50 transition-colors">
              <td className="py-3 px-4 text-neutral-300">Range</td>
              <td className="text-center py-3 px-4 font-mono text-white text-xs">
                {stats1.min.toFixed(0)} – {stats1.max.toFixed(0)}
              </td>
              <td className="text-center py-3 px-4 font-mono text-white text-xs">
                {stats2.min.toFixed(0)} – {stats2.max.toFixed(0)}
              </td>
              <td className="text-center py-3 px-4 text-neutral-400">—</td>
            </tr>
            
            {/* Quartiles */}
            <tr className="border-b border-neutral-700/50 hover:bg-neutral-800/50 transition-colors">
              <td className="py-3 px-4 text-neutral-300">Quartiles (Q1, Med, Q3)</td>
              <td className="text-center py-3 px-4 font-mono text-white text-xs">
                {stats1.q1.toFixed(0)}, {stats1.median.toFixed(0)}, {stats1.q3.toFixed(0)}
              </td>
              <td className="text-center py-3 px-4 font-mono text-white text-xs">
                {stats2.q1.toFixed(0)}, {stats2.median.toFixed(0)}, {stats2.q3.toFixed(0)}
              </td>
              <td className="text-center py-3 px-4 text-neutral-400">—</td>
            </tr>
            
            {/* Effect Size */}
            <tr className="hover:bg-neutral-800/50 transition-colors">
              <td className="py-3 px-4 text-neutral-300">Cohen's d (Effect Size)</td>
              <td colSpan="3" className="text-center py-3 px-4">
                <span className="font-mono text-white">{cohensD.toFixed(3)}</span>
                <span className="ml-2 text-xs text-neutral-400">
                  ({Math.abs(cohensD) < 0.2 ? 'negligible' : 
                    Math.abs(cohensD) < 0.5 ? 'small' : 
                    Math.abs(cohensD) < 0.8 ? 'medium' : 'large'})
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-yellow-400 mb-2 text-sm">
            <Info className="inline-block w-4 h-4 mr-1" />
            Pooled Standard Deviation
          </h4>
          <p className="text-sm text-neutral-300">
            <span dangerouslySetInnerHTML={{ __html: `\\(S_p = ${pooledSd.toFixed(3)}\\)` }} />
            {example.group1.knownSigma && example.group2.knownSigma && (
              <span className="block mt-1 text-xs text-neutral-400">
                (Note: Using sample SDs for display, but Z-test uses known σ values)
              </span>
            )}
          </p>
        </div>
        
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-yellow-400 mb-2 text-sm">
            <Info className="inline-block w-4 h-4 mr-1" />
            Variance Ratio Test
          </h4>
          <p className="text-sm text-neutral-300">
            Ratio = {Math.max(stats1.variance/stats2.variance, stats2.variance/stats1.variance).toFixed(2)}
            {Math.max(stats1.variance/stats2.variance, stats2.variance/stats1.variance) >= 3 ? (
              <span className="block mt-1 text-xs text-yellow-400">
                → Use Welch's t-test (unequal variances)
              </span>
            ) : (
              <span className="block mt-1 text-xs text-green-400">
                → Can use pooled t-test (equal variances)
              </span>
            )}
          </p>
        </div>
      </div>
    </VisualizationSection>
  );
});


// Interactive Calculator Component
const InteractiveCalculator = React.memo(function InteractiveCalculator() {
  const contentRef = useRef(null);
  const [n1, setN1] = useState(30);
  const [mean1, setMean1] = useState(100);
  const [sd1, setSd1] = useState(15);
  const [n2, setN2] = useState(25);
  const [mean2, setMean2] = useState(95);
  const [sd2, setSd2] = useState(12);
  const [testType, setTestType] = useState('auto');
  const [alpha, setAlpha] = useState(0.05);
  
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
  }, [n1, mean1, sd1, n2, mean2, sd2, testType]);
  
  // Calculate test results
  const varianceRatio = Math.max(sd1*sd1/(sd2*sd2), sd2*sd2/(sd1*sd1));
  const autoTest = varianceRatio >= 3 ? 'welch' : 'pooled';
  const selectedTest = testType === 'auto' ? autoTest : testType;
  
  let testStat, se, df;
  
  if (selectedTest === 'pooled') {
    const pooledVar = ((n1 - 1) * sd1 * sd1 + (n2 - 1) * sd2 * sd2) / (n1 + n2 - 2);
    const pooledSd = Math.sqrt(pooledVar);
    se = pooledSd * Math.sqrt(1/n1 + 1/n2);
    testStat = (mean1 - mean2) / se;
    df = n1 + n2 - 2;
  } else {
    se = Math.sqrt(sd1*sd1/n1 + sd2*sd2/n2);
    testStat = (mean1 - mean2) / se;
    const dfNum = Math.pow(se, 4);
    const dfDenom = Math.pow(sd1*sd1/n1, 2)/(n1-1) + Math.pow(sd2*sd2/n2, 2)/(n2-1);
    df = Math.floor(dfNum / dfDenom);
  }
  
  const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(testStat), df));
  const criticalValue = jStat.studentt.inv(1 - alpha/2, df);
  
  return (
    <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-400 mb-6">
        <Calculator className="inline-block w-5 h-5 mr-2" />
        Interactive Two-Sample Test Calculator
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Controls */}
        <div className="space-y-4">
          <div className="bg-neutral-900/50 rounded-lg p-4 border border-blue-500/30">
            <h4 className="font-bold text-blue-400 mb-3">Group 1</h4>
            <ControlGroup>
              <label className="text-sm text-neutral-300">
                Sample Size (n₁): <span className="font-mono">{n1}</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={n1}
                onChange={(e) => setN1(Number(e.target.value))}
                className="w-full h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </ControlGroup>
            <ControlGroup>
              <label className="text-sm text-neutral-300">
                Mean (x̄₁): <span className="font-mono">{mean1}</span>
              </label>
              <input
                type="range"
                min="50"
                max="150"
                value={mean1}
                onChange={(e) => setMean1(Number(e.target.value))}
                className="w-full h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </ControlGroup>
            <ControlGroup>
              <label className="text-sm text-neutral-300">
                Std Dev (s₁): <span className="font-mono">{sd1}</span>
              </label>
              <input
                type="range"
                min="5"
                max="30"
                value={sd1}
                onChange={(e) => setSd1(Number(e.target.value))}
                className="w-full h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </ControlGroup>
          </div>
          
          <div className="bg-neutral-900/50 rounded-lg p-4 border border-green-500/30">
            <h4 className="font-bold text-green-400 mb-3">Group 2</h4>
            <ControlGroup>
              <label className="text-sm text-neutral-300">
                Sample Size (n₂): <span className="font-mono">{n2}</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={n2}
                onChange={(e) => setN2(Number(e.target.value))}
                className="w-full h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </ControlGroup>
            <ControlGroup>
              <label className="text-sm text-neutral-300">
                Mean (x̄₂): <span className="font-mono">{mean2}</span>
              </label>
              <input
                type="range"
                min="50"
                max="150"
                value={mean2}
                onChange={(e) => setMean2(Number(e.target.value))}
                className="w-full h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </ControlGroup>
            <ControlGroup>
              <label className="text-sm text-neutral-300">
                Std Dev (s₂): <span className="font-mono">{sd2}</span>
              </label>
              <input
                type="range"
                min="5"
                max="30"
                value={sd2}
                onChange={(e) => setSd2(Number(e.target.value))}
                className="w-full h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </ControlGroup>
          </div>
          
          <div className="bg-neutral-900/50 rounded-lg p-4 border border-teal-500/30">
            <h4 className="font-bold text-teal-400 mb-3">Test Options</h4>
            <ControlGroup>
              <label className="text-sm text-neutral-300">Test Type</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                <option value="auto">Auto-select (recommended)</option>
                <option value="pooled">Pooled t-test</option>
                <option value="welch">Welch's t-test</option>
              </select>
            </ControlGroup>
            <ControlGroup>
              <label className="text-sm text-neutral-300">
                Significance Level (α): <span className="font-mono">{alpha}</span>
              </label>
              <select
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                className="w-full bg-neutral-800 border border-neutral-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                <option value={0.01}>0.01</option>
                <option value={0.05}>0.05</option>
                <option value={0.10}>0.10</option>
              </select>
            </ControlGroup>
          </div>
        </div>
        
        {/* Results */}
        <div ref={contentRef} className="space-y-4">
          <div className="bg-neutral-900/50 rounded-lg p-4">
            <h4 className="font-bold text-white mb-3">Test Selection</h4>
            <div className="text-sm text-neutral-300 space-y-2">
              <p>Variance ratio: <span className="font-mono">{varianceRatio.toFixed(2)}</span></p>
              <p className="font-semibold">
                {selectedTest === 'pooled' ? 'Using Pooled t-test' : "Using Welch's t-test"}
                {testType === 'auto' && ` (auto-selected)`}
              </p>
            </div>
          </div>
          
          <div className="bg-neutral-900/50 rounded-lg p-4">
            <h4 className="font-bold text-white mb-3">Calculations</h4>
            <div className="text-sm text-neutral-300 space-y-2">
              <p>Difference in means: <span className="font-mono">{(mean1 - mean2).toFixed(2)}</span></p>
              <p>Standard error: <span className="font-mono">{se.toFixed(4)}</span></p>
              <p>Test statistic: <span className="font-mono">t = {testStat.toFixed(4)}</span></p>
              <p>Degrees of freedom: <span className="font-mono">df = {df}</span></p>
              
              <div className="mt-3 text-center">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[t = \\frac{${mean1} - ${mean2}}{${se.toFixed(4)}} = ${testStat.toFixed(4)}\\]`
                }} />
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg p-4 ${pValue < alpha ? 'bg-red-900/20 border border-red-700/30' : 'bg-green-900/20 border border-green-700/30'}`}>
            <h4 className="font-bold text-white mb-3">Decision</h4>
            <div className="text-sm space-y-2">
              <p>Critical value: <span className="font-mono">±{criticalValue.toFixed(4)}</span></p>
              <p>P-value: <span className="font-mono">{pValue.toFixed(4)}</span></p>
              <p className="font-semibold mt-3">
                {pValue < alpha 
                  ? `Reject H₀: Significant difference at α = ${alpha}`
                  : `Fail to reject H₀: No significant difference at α = ${alpha}`
                }
              </p>
              <p className="text-xs text-neutral-400 mt-2">
                {Math.abs(testStat) > criticalValue 
                  ? `|t| = ${Math.abs(testStat).toFixed(2)} > ${criticalValue.toFixed(2)}`
                  : `|t| = ${Math.abs(testStat).toFixed(2)} < ${criticalValue.toFixed(2)}`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Key Insights Component
const KeyInsights = React.memo(function KeyInsights() {
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
      <h3 className="text-xl font-bold text-yellow-400 mb-6">Key Insights</h3>
      
      <div ref={contentRef} className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-2">Assumptions</h4>
          <ul className="space-y-2 text-neutral-300">
            <li>• Independent random samples</li>
            <li>• Approximately normal distributions (or large samples)</li>
            <li>• For pooled test: equal population variances</li>
          </ul>
        </div>
        
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-2">Sample Size Impact</h4>
          <p className="text-neutral-300">
            Larger samples provide more power to detect smaller differences. 
            With n ≥ 30 per group, the Central Limit Theorem ensures approximate normality.
          </p>
        </div>
        
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-2">Effect Size</h4>
          <p className="text-neutral-300">
            Cohen's d: <span dangerouslySetInnerHTML={{ __html: `\\(d = \\frac{\\bar{X}_1 - \\bar{X}_2}{S_p}\\)` }} />
            <br />
            Guidelines: Small (0.2), Medium (0.5), Large (0.8)
          </p>
        </div>
        
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-2">Practical vs Statistical Significance</h4>
          <p className="text-neutral-300">
            A statistically significant result may not be practically important. 
            Always consider the magnitude of the difference in context.
          </p>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Main Component
export default function UnpairedTwoSampleTest() {
  const [selectedExample, setSelectedExample] = useState('income');
  
  // Example datasets
  const examples = {
    income: {
      title: "Income Comparison",
      group1: {
        label: "Alberta",
        data: [62000, 58000, 65000, 71000, 59000, 63000, 68000, 57000, 66000, 64000],
        knownSigma: 8000
      },
      group2: {
        label: "Ontario", 
        data: [48000, 45000, 50000, 52000, 46000, 49000, 51000, 44000, 53000, 47000],
        knownSigma: 7000
      }
    },
    fertilizer: {
      title: "Fertilizer Effectiveness",
      group1: {
        label: "Control",
        data: [12.5, 11.8, 13.2, 12.0, 11.5, 12.8, 11.9, 12.3, 13.0, 12.1]
      },
      group2: {
        label: "New Fertilizer",
        data: [14.2, 13.8, 15.1, 14.5, 13.9, 14.8, 15.3, 14.0, 14.6, 15.0]
      }
    }
  };
  
  const currentExample = examples[selectedExample];
  
  return (
    <VisualizationContainer
      title={`Unpaired Two-Sample Test: ${currentExample.title}`}
      description="Compare means from two independent groups"
    >
      <BackToHub chapter={6} />
      
      {/* Example Selection with 7-1 button styling */}
      <div className="mb-6">
        <h4 className="text-lg font-bold text-white mb-4">Select Dataset Example</h4>
        <div className="flex gap-3">
          {Object.entries(examples).map(([key, ex]) => (
            <button
              key={key}
              onClick={() => setSelectedExample(key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                selectedExample === key
                  ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-500/50'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
              }`}
            >
              {ex.title}
            </button>
          ))}
        </div>
      </div>
      
      {/* Core Educational Content */}
      <div className="space-y-6">
        <ConceptOverview />
        <TestSelectionFramework />
        <DataComparisonTable
          group1Data={currentExample.group1.data}
          group2Data={currentExample.group2.data}
          group1Label={currentExample.group1.label}
          group2Label={currentExample.group2.label}
          example={currentExample}
        />
        <WorkedExample example={currentExample} />
        <InteractiveCalculator />
        <KeyInsights />
      </div>
    </VisualizationContainer>
  );
}