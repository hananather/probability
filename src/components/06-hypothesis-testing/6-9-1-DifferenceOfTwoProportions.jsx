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
} from '@/components/ui/VisualizationContainer';
import { colors, createColorScheme } from '@/lib/design-system';
import { Button } from '@/components/ui/button';
import BackToHub from '@/components/ui/BackToHub';
import { Bug, Merge, Calculator, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';

// Get vibrant Chapter 6 color scheme
const chapterColors = createColorScheme('hypothesis');

// Hypothesis Display Component
const HypothesisDisplay = React.memo(function HypothesisDisplay() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <div ref={contentRef} className="bg-neutral-800 rounded-lg p-4 max-w-2xl mx-auto">
      <div className="text-sm text-neutral-300 space-y-2">
        <p>
          <strong className="text-white"><span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(p_1 = p_2\\)` }} /> (same recapture rate for both types)
        </p>
        <p>
          <strong className="text-white"><span dangerouslySetInnerHTML={{ __html: `\\(H_1\\)` }} />:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(p_1 \\neq p_2\\)` }} /> (different recapture rates)
        </p>
        <p>
          <strong className="text-white">Question:</strong> Do environmental factors affect moth types differently?
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
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-teal-400 mb-6">Mathematical Framework</h3>
      
      <div ref={contentRef} className="grid md:grid-cols-2 gap-6">
        <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/30 hover:border-blue-500/30 transition-colors duration-200">
          <h4 className="font-bold text-white mb-3">Test Statistic</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">Under <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />, the test statistic follows:</p>
            <div className="text-center text-blue-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[z = \\frac{\\hat{p}_1 - \\hat{p}_2}{SE} \\sim N(0, 1)\\]` }} />
            </div>
            <p className="mt-2">where SE uses the pooled proportion <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p}\\)` }} /></p>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/30 hover:border-green-500/30 transition-colors duration-200">
          <h4 className="font-bold text-white mb-3">Pooled Proportion</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">Best estimate under <span dangerouslySetInnerHTML={{ __html: `\\(H_0: p_1 = p_2 = p\\)` }} /></p>
            <div className="text-center text-green-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\hat{p} = \\frac{y_1 + y_2}{n_1 + n_2}\\]` }} />
            </div>
            <p className="mt-2">Combines data from both groups</p>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/30 hover:border-purple-500/30 transition-colors duration-200">
          <h4 className="font-bold text-white mb-3">Standard Error (Test)</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">For hypothesis testing:</p>
            <div className="text-center text-purple-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[SE = \\sqrt{\\hat{p}(1-\\hat{p})\\left(\\frac{1}{n_1} + \\frac{1}{n_2}\\right)}\\]` }} />
            </div>
            <p className="mt-2">Uses pooled <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p}\\)` }} /> under <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /></p>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/30 hover:border-teal-500/30 transition-colors duration-200">
          <h4 className="font-bold text-white mb-3">Confidence Interval</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">For CI, use unpooled SE:</p>
            <div className="text-center text-teal-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[SE = \\sqrt{\\frac{\\hat{p}_1(1-\\hat{p}_1)}{n_1} + \\frac{\\hat{p}_2(1-\\hat{p}_2)}{n_2}}\\]` }} />
            </div>
            <p className="mt-2">Don't assume <span dangerouslySetInnerHTML={{ __html: `\\(p_1 = p_2\\)` }} /> for CI</p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Key Insights Component
const KeyInsights = React.memo(function KeyInsights({ calculations }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [calculations]);
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-700/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-400 mb-4">Key Insights: Sample Size Impact</h3>
      
      <div ref={contentRef} className="space-y-4">
        <p className="text-neutral-300">
          With the same observed difference ({(Math.abs(calculations.difference) * 100).toFixed(1)}%), 
          different sample sizes lead to different conclusions:
        </p>
        
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left py-2 text-neutral-400">Sample Size</th>
                <th className="text-center py-2 text-neutral-400">z-statistic</th>
                <th className="text-center py-2 text-neutral-400">p-value</th>
                <th className="text-center py-2 text-neutral-400">Decision <span dangerouslySetInnerHTML={{ __html: `\\(\\alpha=0.05\\)` }} /></th>
              </tr>
            </thead>
            <tbody>
              {[0.25, 0.5, 1, 2].map(multiplier => {
                const n1 = Math.round(MOTH_DATA.light.n * multiplier);
                const n2 = Math.round(MOTH_DATA.dark.n * multiplier);
                const y1 = Math.round(MOTH_DATA.light.recaptured * multiplier);
                const y2 = Math.round(MOTH_DATA.dark.recaptured * multiplier);
                const p1 = y1 / n1;
                const p2 = y2 / n2;
                const pooledP = (y1 + y2) / (n1 + n2);
                const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
                const z = (p1 - p2) / se;
                const p = 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1));
                
                return (
                  <tr key={multiplier} className="border-b border-neutral-700/50">
                    <td className="py-2 text-neutral-300">{multiplier * 100}% (n1={n1})</td>
                    <td className="text-center py-2 font-mono text-white">{z.toFixed(3)}</td>
                    <td className="text-center py-2 font-mono text-white">
                      {p < 0.001 ? '< 0.001' : p.toFixed(3)}
                    </td>
                    <td className="text-center py-2">
                      <span className={`font-semibold ${p < 0.05 ? 'text-red-400' : 'text-green-400'}`}>
                        {p < 0.05 ? (
                          <span dangerouslySetInnerHTML={{ __html: `Reject \\(H_0\\)` }} />
                        ) : (
                          'Fail to reject'
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <p className="text-sm text-neutral-400">
          <strong>Lesson:</strong> Statistical significance depends on both effect size AND sample size. 
          A real difference might not be detected with small samples, while tiny differences can be 
          "statistically significant" with large samples.
        </p>
      </div>
    </VisualizationSection>
  );
});

// Important Distinctions Component
const ImportantDistinctions = React.memo(function ImportantDistinctions() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <div ref={contentRef} className="grid md:grid-cols-2 gap-6">
      <div className="bg-neutral-900/50 rounded-lg p-4">
        <h4 className="font-bold text-white mb-3">Hypothesis Test vs Confidence Interval</h4>
        <div className="space-y-2 text-sm text-neutral-300">
          <p><strong>Test:</strong> Uses pooled SE assuming <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> is true</p>
          <p><strong>CI:</strong> Uses unpooled SE, doesn't assume <span dangerouslySetInnerHTML={{ __html: `\\(p_1 = p_2\\)` }} /></p>
          <p className="text-yellow-400">Always use the right SE for your purpose!</p>
        </div>
      </div>
      
      <div className="bg-neutral-900/50 rounded-lg p-4">
        <h4 className="font-bold text-white mb-3">Large Counts Condition</h4>
        <div className="space-y-2 text-sm text-neutral-300">
          <p>Check using <strong>pooled <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p}\\)` }} /></strong>, not individual proportions</p>
          <p>All four counts must be ≥ 10:</p>
          <p className="font-mono text-center mt-2">
            <span dangerouslySetInnerHTML={{ __html: `\\(n_1\\hat{p},\\quad n_1(1-\\hat{p}),\\quad n_2\\hat{p},\\quad n_2(1-\\hat{p})\\)` }} />
          </p>
        </div>
      </div>
    </div>
  );
});

// Moth data from the task
const MOTH_DATA = {
  light: { n: 137, recaptured: 18, name: 'Light-colored moths', color: '#fbbf24' },
  dark: { n: 493, recaptured: 131, name: 'Dark-colored moths', color: '#6b7280' }
};

// Worked Example Component
const WorkedExample = React.memo(function WorkedExample({ sampleSize, significanceLevel }) {
  const contentRef = useRef(null);
  
  // Calculate values based on sample size
  const n1 = Math.round(MOTH_DATA.light.n * sampleSize);
  const n2 = Math.round(MOTH_DATA.dark.n * sampleSize);
  const y1 = Math.round(MOTH_DATA.light.recaptured * sampleSize);
  const y2 = Math.round(MOTH_DATA.dark.recaptured * sampleSize);
  const p1 = y1 / n1;
  const p2 = y2 / n2;
  const pooledP = (y1 + y2) / (n1 + n2);
  const difference = p1 - p2;
  const sePooled = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
  const zStat = difference / sePooled;
  const pValue = 2 * (1 - jStat.normal.cdf(Math.abs(zStat), 0, 1));
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [sampleSize, significanceLevel]);
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-6 border border-neutral-700/50">
      <h3 className="text-xl font-bold text-purple-400 mb-6">
        Step-by-Step Computation
      </h3>
      
      <div ref={contentRef} className="space-y-6">
        {/* Step 1: Data Setup */}
        <motion.div 
          className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/30 hover:border-blue-500/30 transition-colors duration-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="font-bold text-white mb-3">Step 1: Observed Data</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-neutral-300">
            <div>
              <p className="font-semibold text-blue-400">Light Moths (Group 1):</p>
              <ul className="mt-2 space-y-1">
                <li>• Released: <span className="font-mono text-white">{n1}</span></li>
                <li>• Recaptured: <span className="font-mono text-white">{y1}</span></li>
                <li>• Proportion: <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p}_1 = \\frac{${y1}}{${n1}} = ${p1.toFixed(4)}\\)` }} /></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-green-400">Dark Moths (Group 2):</p>
              <ul className="mt-2 space-y-1">
                <li>• Released: <span className="font-mono text-white">{n2}</span></li>
                <li>• Recaptured: <span className="font-mono text-white">{y2}</span></li>
                <li>• Proportion: <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p}_2 = \\frac{${y2}}{${n2}} = ${p2.toFixed(4)}\\)` }} /></li>
              </ul>
            </div>
          </div>
          <p className="mt-3 text-center text-neutral-400">
            Observed difference: <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p}_1 - \\hat{p}_2 = ${difference.toFixed(4)}\\)` }} />
          </p>
        </motion.div>

        {/* Step 2: Pooled Proportion */}
        <motion.div 
          className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/30 hover:border-green-500/30 transition-colors duration-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="font-bold text-white mb-3">Step 2: Calculate Pooled Proportion</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>Under <span dangerouslySetInnerHTML={{ __html: `\\(H_0: p_1 = p_2\\)` }} />, we estimate the common proportion:</p>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\hat{p} = \\frac{y_1 + y_2}{n_1 + n_2} = \\frac{${y1} + ${y2}}{${n1} + ${n2}} = \\frac{${y1 + y2}}{${n1 + n2}} = ${pooledP.toFixed(4)}\\]` }} />
            </div>
            <p className="text-blue-400">
              This represents our best estimate of the common recapture rate if <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> is true.
            </p>
          </div>
        </motion.div>

        {/* Step 3: Standard Error */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 3: Calculate Standard Error</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>Using the pooled proportion for the hypothesis test:</p>
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[SE = \\sqrt{\\hat{p}(1-\\hat{p})\\left(\\frac{1}{n_1} + \\frac{1}{n_2}\\right)}\\]` }} />
            </div>
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[SE = \\sqrt{${pooledP.toFixed(4)} \\times ${(1-pooledP).toFixed(4)} \\times \\left(\\frac{1}{${n1}} + \\frac{1}{${n2}}\\right)}\\]` }} />
            </div>
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[SE = ${sePooled.toFixed(4)}\\]` }} />
            </div>
          </div>
        </div>

        {/* Step 4: Test Statistic */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 4: Calculate Test Statistic</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[z = \\frac{\\hat{p}_1 - \\hat{p}_2}{SE} = \\frac{${difference.toFixed(4)}}{${sePooled.toFixed(4)}} = ${zStat.toFixed(3)}\\]` }} />
            </div>
            <p>For a two-sided test:</p>
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[p\\text{-value} = 2 \\times P(|Z| > ${Math.abs(zStat).toFixed(3)}) = ${pValue < 0.001 ? '< 0.001' : pValue.toFixed(4)}\\]` }} />
            </div>
          </div>
        </div>

        {/* Step 5: Large Counts Check */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 5: Verify Large Counts Condition</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>For the normal approximation to be valid, all counts must be ≥ 10:</p>
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div>
                <p className="font-semibold text-blue-400">Light Moths:</p>
                <ul className="mt-2 space-y-1">
                  <li><span dangerouslySetInnerHTML={{ __html: `\\(n_1\\hat{p} = ${n1} \\times ${pooledP.toFixed(3)} = ${(n1 * pooledP).toFixed(1)}\\)` }} /> 
                    <span className={n1 * pooledP >= 10 ? "text-green-400" : "text-red-400"}> {n1 * pooledP >= 10 ? "✓" : "✗"}</span>
                  </li>
                  <li><span dangerouslySetInnerHTML={{ __html: `\\(n_1(1-\\hat{p}) = ${n1} \\times ${(1-pooledP).toFixed(3)} = ${(n1 * (1-pooledP)).toFixed(1)}\\)` }} />
                    <span className={n1 * (1-pooledP) >= 10 ? "text-green-400" : "text-red-400"}> {n1 * (1-pooledP) >= 10 ? "✓" : "✗"}</span>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-green-400">Dark Moths:</p>
                <ul className="mt-2 space-y-1">
                  <li><span dangerouslySetInnerHTML={{ __html: `\\(n_2\\hat{p} = ${n2} \\times ${pooledP.toFixed(3)} = ${(n2 * pooledP).toFixed(1)}\\)` }} />
                    <span className={n2 * pooledP >= 10 ? "text-green-400" : "text-red-400"}> {n2 * pooledP >= 10 ? "✓" : "✗"}</span>
                  </li>
                  <li><span dangerouslySetInnerHTML={{ __html: `\\(n_2(1-\\hat{p}) = ${n2} \\times ${(1-pooledP).toFixed(3)} = ${(n2 * (1-pooledP)).toFixed(1)}\\)` }} />
                    <span className={n2 * (1-pooledP) >= 10 ? "text-green-400" : "text-red-400"}> {n2 * (1-pooledP) >= 10 ? "✓" : "✗"}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className={`rounded-lg p-4 shadow-lg transition-all duration-200 ${pValue < significanceLevel ? 'bg-red-900/20 border border-red-500/30 hover:shadow-red-500/10' : 'bg-green-900/20 border border-green-500/30 hover:shadow-green-500/10'}`}>
          <h4 className="font-bold text-white mb-3">Conclusion</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>
              With p-value = {pValue < 0.001 ? '< 0.001' : pValue.toFixed(4)} {pValue < significanceLevel ? '<' : '>'} <span dangerouslySetInnerHTML={{ __html: `\\(\\alpha = ${significanceLevel}\\)` }} />:
            </p>
            <motion.p 
              className={`font-bold ${pValue < significanceLevel ? 'text-red-400' : 'text-green-400'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {pValue < significanceLevel ? (
                <>Reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />: There is significant evidence of a difference in recapture rates.</>
              ) : (
                <>Fail to reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />: Insufficient evidence of a difference in recapture rates.</>
              )}
            </motion.p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

export default function DifferenceOfTwoProportions() {
  // State management
  const [sampleSizeMultiplier, setSampleSizeMultiplier] = useState(1);
  const [significanceLevel, setSignificanceLevel] = useState(0.05);
  const [hypothesisType, setHypothesisType] = useState('two'); // 'two', 'left', 'right'
  const [showDistributions, setShowDistributions] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 });
  
  // Memoized event handlers
  const handleSampleSizeChange = React.useCallback((e) => {
    setSampleSizeMultiplier(Number(e.target.value));
  }, []);
  
  const handleSignificanceLevelChange = React.useCallback((level) => {
    setSignificanceLevel(level);
  }, []);
  
  const handleHypothesisTypeChange = React.useCallback((e) => {
    setHypothesisType(e.target.value);
  }, []);
  
  const toggleDistributions = React.useCallback(() => {
    setShowDistributions(prev => !prev);
  }, []);
  
  // Refs for visualizations
  const barChartRef = useRef(null);
  const distributionRef = useRef(null);
  const resizeObserverRef = useRef(null);
  
  // Calculations with edge case handling
  const calculations = React.useMemo(() => {
    // Ensure minimum sample sizes
    const n1 = Math.max(1, Math.round(MOTH_DATA.light.n * sampleSizeMultiplier));
    const n2 = Math.max(1, Math.round(MOTH_DATA.dark.n * sampleSizeMultiplier));
    
    // Ensure counts don't exceed sample size
    const y1 = Math.min(n1, Math.max(0, Math.round(MOTH_DATA.light.recaptured * sampleSizeMultiplier)));
    const y2 = Math.min(n2, Math.max(0, Math.round(MOTH_DATA.dark.recaptured * sampleSizeMultiplier)));
    
    const p1 = y1 / n1;
    const p2 = y2 / n2;
    const pooledP = (y1 + y2) / (n1 + n2);
    const difference = p1 - p2;
    
    // Standard errors with edge case handling
    // Ensure pooledP is valid (between 0 and 1)
    const safePooledP = Math.max(0.0001, Math.min(0.9999, pooledP));
    const sePooled = Math.sqrt(safePooledP * (1 - safePooledP) * (1/n1 + 1/n2));
    
    // For unpooled SE, handle edge cases where p1 or p2 might be 0 or 1
    const safep1 = Math.max(0.0001, Math.min(0.9999, p1));
    const safep2 = Math.max(0.0001, Math.min(0.9999, p2));
    const seUnpooled = Math.sqrt(safep1 * (1 - safep1) / n1 + safep2 * (1 - safep2) / n2);
    
    // Test statistic with edge case handling
    const zStat = sePooled > 0 ? difference / sePooled : 0;
    
    // P-value based on hypothesis type
    let pValue;
    if (!isFinite(zStat) || isNaN(zStat)) {
      pValue = 1; // Conservative approach for invalid test statistic
    } else if (hypothesisType === 'two') {
      pValue = 2 * (1 - jStat.normal.cdf(Math.abs(zStat), 0, 1));
    } else if (hypothesisType === 'left') {
      pValue = jStat.normal.cdf(zStat, 0, 1);
    } else {
      pValue = 1 - jStat.normal.cdf(zStat, 0, 1);
    }
    
    // Ensure p-value is between 0 and 1
    pValue = Math.max(0, Math.min(1, pValue));
    
    // Confidence interval
    const zCrit = jStat.normal.inv(1 - significanceLevel / 2, 0, 1);
    const ciLower = difference - zCrit * seUnpooled;
    const ciUpper = difference + zCrit * seUnpooled;
    
    // Large counts check using safe pooled proportion
    const largeCountsCheck = {
      light: {
        np: n1 * safePooledP,
        n1p: n1 * (1 - safePooledP),
        valid: n1 * safePooledP >= 10 && n1 * (1 - safePooledP) >= 10
      },
      dark: {
        np: n2 * safePooledP,
        n1p: n2 * (1 - safePooledP),
        valid: n2 * safePooledP >= 10 && n2 * (1 - safePooledP) >= 10
      }
    };
    
    return {
      n1, n2, y1, y2, p1, p2, pooledP, difference,
      sePooled, seUnpooled, zStat, pValue,
      largeCountsCheck, ciLower, ciUpper
    };
  }, [sampleSizeMultiplier, hypothesisType, significanceLevel]);
  
  // Resize observer for responsive visualizations
  useEffect(() => {
    if (!barChartRef.current) return;
    
    const handleResize = () => {
      if (barChartRef.current) {
        const width = barChartRef.current.clientWidth || 600;
        setDimensions({ width, height: 300 });
      }
    };
    
    // Initial size
    handleResize();
    
    // Create resize observer
    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(barChartRef.current);
    
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);
  
  // Bar chart initialization
  const barChartInitialized = useRef(false);
  const barChartG = useRef(null);
  const barChartBars = useRef(null);
  const barChartTexts = useRef(null);
  
  // Bar chart visualization
  useEffect(() => {
    if (!barChartRef.current) return;
    
    const svg = d3.select(barChartRef.current);
    const { width, height } = dimensions;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Initialize only once
    if (!barChartInitialized.current) {
      // Clear any existing content first
      svg.selectAll("*").remove();
      
      barChartG.current = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      barChartInitialized.current = true;
    }
    
    // Always update SVG dimensions
    svg.attr("width", width).attr("height", height);
    
    const g = barChartG.current;
    
    // Add glow filter and gradients only once
    if (!svg.select("defs").node()) {
      const defs = svg.append("defs");
    
    const filter = defs.append("filter")
      .attr("id", "glow");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
      .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");
    
    // Group 1 (Light moths) gradient - Blue
    const group1Gradient = defs.append("linearGradient")
      .attr("id", "group1-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    group1Gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#60a5fa")
      .attr("stop-opacity", 1);
    group1Gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 1);
    
    // Group 2 (Dark moths) gradient - Green
    const group2Gradient = defs.append("linearGradient")
      .attr("id", "group2-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    group2Gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#34d399")
      .attr("stop-opacity", 1);
    group2Gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 1);
    }
    
    // Data
    const data = [
      { group: 'Light moths', proportion: calculations.p1, color: 'url(#group1-gradient)' },
      { group: 'Dark moths', proportion: calculations.p2, color: 'url(#group2-gradient)' }
    ];
    
    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.group))
      .range([0, innerWidth])
      .padding(0.4);
    
    const y = d3.scaleLinear()
      .domain([0, 0.3])
      .range([innerHeight, 0]);
    
    // Axes - create or update
    let xAxis = g.select(".x-axis");
    if (xAxis.empty()) {
      xAxis = g.append("g")
        .attr("class", "x-axis");
    }
    xAxis
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));
    
    xAxis.style("font-size", "12px")
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    xAxis.selectAll("path, line")
      .style("stroke", "#9ca3af");
    
    let yAxis = g.select(".y-axis");
    if (yAxis.empty()) {
      yAxis = g.append("g")
        .attr("class", "y-axis");
    }
    yAxis
      .call(d3.axisLeft(y).tickFormat(d => (d * 100).toFixed(0) + "%"));
    
    yAxis.style("font-size", "12px")
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    yAxis.selectAll("path, line")
      .style("stroke", "#9ca3af");
    
    // Labels - create only once
    if (g.select(".x-label").empty()) {
      g.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#c084fc")
        .text("Moth Type");
    }
    g.select(".x-label")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 45);
    
    if (g.select(".y-label").empty()) {
      g.append("text")
        .attr("class", "y-label")
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#60a5fa")
        .text("Recapture Rate");
    }
    g.select(".y-label")
      .attr("y", -40)
      .attr("x", -innerHeight / 2);
    
    // Bars - proper enter/update/exit pattern
    const bars = g.selectAll(".bar")
      .data(data, d => d.group);
    
    // Enter new bars
    const barsEnter = bars.enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.group))
      .attr("width", x.bandwidth())
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("fill", d => d.color)
      .style("filter", "url(#glow)");
    
    // Update all bars (enter + update)
    bars.merge(barsEnter)
      .transition()
      .duration(1200)
      .delay((d, i) => i * 200)
      .ease(d3.easeCubicOut)
      .attr("x", d => x(d.group))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.proportion))
      .attr("height", d => innerHeight - y(d.proportion))
      .attr("fill", d => d.color);
    
    // Remove old bars
    bars.exit().remove();
    
    // Value labels - proper enter/update/exit pattern
    const labels = g.selectAll(".label")
      .data(data, d => d.group);
    
    // Enter new labels
    const labelsEnter = labels.enter().append("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("text-shadow", "0 0 10px rgba(0,0,0,0.5)")
      .style("opacity", 0);
    
    // Update all labels (enter + update)
    labels.merge(labelsEnter)
      .attr("x", d => x(d.group) + x.bandwidth() / 2)
      .attr("y", d => y(d.proportion) - 10)
      .style("fill", d => d.group.includes('Light') ? "#60a5fa" : "#10b981")
      .text(d => `${(d.proportion * 100).toFixed(1)}%`)
      .transition()
      .duration(1200)
      .delay(600)
      .ease(d3.easeCubicOut)
      .style("opacity", 1);
    
    // Remove old labels
    labels.exit().remove();
    
    // Difference line - create or update
    let diffLine = g.select(".diff-line");
    if (diffLine.empty()) {
      diffLine = g.append("line")
        .attr("class", "diff-line")
        .style("stroke", "#a855f7")
        .style("stroke-width", 3)
        .style("stroke-dasharray", "5,5")
        .style("filter", "drop-shadow(0 0 4px #a855f7)")
        .style("opacity", 0);
    }
    
    diffLine
      .attr("x1", x('Light moths') + x.bandwidth() / 2)
      .attr("x2", x('Dark moths') + x.bandwidth() / 2)
      .attr("y1", y(calculations.p1))
      .attr("y2", y(calculations.p2))
      .transition()
      .duration(1200)
      .delay(800)
      .ease(d3.easeCubicOut)
      .style("opacity", 1);
    
    // Difference text - create or update
    let diffText = g.select(".diff-text");
    if (diffText.empty()) {
      diffText = g.append("text")
        .attr("class", "diff-text")
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#a855f7")
        .style("text-shadow", "0 0 10px rgba(168, 85, 247, 0.6)")
        .style("opacity", 0);
    }
    
    diffText
      .attr("x", innerWidth / 2)
      .attr("y", (y(calculations.p1) + y(calculations.p2)) / 2)
      .text(`Δ = ${(calculations.difference * 100).toFixed(1)}%`)
      .transition()
      .duration(1200)
      .delay(1000)
      .ease(d3.easeCubicOut)
      .style("opacity", 1);
    
  }, [calculations, dimensions]);
  
  // Distribution visualization
  useEffect(() => {
    if (!distributionRef.current || !showDistributions) return;
    
    const svg = d3.select(distributionRef.current);
    svg.selectAll("*").remove();
    
    const width = distributionRef.current.clientWidth || 600;
    const height = Math.min(400, width * 0.67); // Maintain aspect ratio
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create defs for gradients
    const defs = svg.append("defs");
    
    // Critical region gradient
    const criticalGradient = defs.append("linearGradient")
      .attr("id", "critical-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    criticalGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ef4444")
      .attr("stop-opacity", 0.8);
    criticalGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#dc2626")
      .attr("stop-opacity", 0.3);
    
    // Calculate distribution parameters
    const se = calculations.sePooled;
    const xMin = -4 * se;
    const xMax = 4 * se;
    
    const x = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, innerWidth]);
    
    const maxPDF = jStat.normal.pdf(0, 0, se) * 1.1;
    
    const y = d3.scaleLinear()
      .domain([0, maxPDF])
      .range([innerHeight, 0]);
    
    // Axes
    const xAxis2 = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(d => d.toFixed(3)));
    
    xAxis2.style("font-size", "12px")
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    xAxis2.selectAll("path, line")
      .style("stroke", "#9ca3af");
    
    const yAxis2 = g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => d.toFixed(3)));
    
    yAxis2.style("font-size", "12px")
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    yAxis2.selectAll("path, line")
      .style("stroke", "#9ca3af");
    
    // Labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 45)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#a855f7")
      .text("Difference in Proportions");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#3b82f6")
      .text("Probability Density");
    
    // Generate curve data
    const curveData = d3.range(xMin, xMax, (xMax - xMin) / 200).map(val => ({
      x: val,
      y: jStat.normal.pdf(val, 0, se)
    }));
    
    // Curve
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    // Add gradient for the curve
    const curveGradient = defs.append("linearGradient")
      .attr("id", "curve-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    curveGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#8b5cf6");
    curveGradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#3b82f6");
    curveGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#06b6d4");
    
    const curvePath = g.append("path")
      .datum(curveData)
      .attr("fill", "none")
      .attr("stroke", "url(#curve-gradient)")
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0 0 4px rgba(59, 130, 246, 0.6))")
      .attr("d", line);
    
    // Animate curve drawing
    const totalLength = curvePath.node().getTotalLength();
    curvePath
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);
    
    // Critical regions
    let criticalValues;
    if (hypothesisType === 'two') {
      const zCrit = jStat.normal.inv(1 - significanceLevel / 2, 0, 1);
      criticalValues = [-zCrit * se, zCrit * se];
    } else if (hypothesisType === 'left') {
      const zCrit = jStat.normal.inv(significanceLevel, 0, 1);
      criticalValues = [xMin, zCrit * se];
    } else {
      const zCrit = jStat.normal.inv(1 - significanceLevel, 0, 1);
      criticalValues = [zCrit * se, xMax];
    }
    
    // Shade critical regions
    const area = d3.area()
      .x(d => x(d.x))
      .y0(innerHeight)
      .y1(d => y(d.y))
      .curve(d3.curveBasis);
    
    if (hypothesisType === 'two') {
      // Left tail
      const leftData = curveData.filter(d => d.x <= criticalValues[0]);
      g.append("path")
        .datum(leftData)
        .attr("fill", "url(#critical-gradient)")
        .attr("opacity", 0)
        .attr("d", area)
        .transition()
        .duration(1200)
        .delay(600)
        .ease(d3.easeCubicOut)
        .attr("opacity", 0.4);
      
      // Right tail
      const rightData = curveData.filter(d => d.x >= criticalValues[1]);
      g.append("path")
        .datum(rightData)
        .attr("fill", "url(#critical-gradient)")
        .attr("opacity", 0)
        .attr("d", area)
        .transition()
        .duration(1200)
        .delay(600)
        .ease(d3.easeCubicOut)
        .attr("opacity", 0.4);
    } else {
      const criticalData = curveData.filter(d => 
        hypothesisType === 'left' ? d.x <= criticalValues[1] : d.x >= criticalValues[0]
      );
      g.append("path")
        .datum(criticalData)
        .attr("fill", "url(#critical-gradient)")
        .attr("opacity", 0)
        .attr("d", area)
        .transition()
        .duration(1200)
        .delay(600)
        .ease(d3.easeCubicOut)
        .attr("opacity", 0.4);
    }
    
    // Observed difference line
    const observedX = x(calculations.difference);
    g.append("line")
      .attr("x1", observedX)
      .attr("x2", observedX)
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#a855f7")
      .attr("stroke-width", 4)
      .attr("stroke-dasharray", "8,4")
      .style("filter", "drop-shadow(0 0 6px #a855f7)")
      .style("opacity", 0)
      .transition()
      .duration(1200)
      .delay(800)
      .ease(d3.easeCubicOut)
      .style("opacity", 1);
    
    g.append("text")
      .attr("x", observedX)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#a855f7")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("text-shadow", "0 0 8px rgba(168, 85, 247, 0.8)")
      .style("opacity", 0)
      .text("Observed")
      .transition()
      .duration(1200)
      .delay(1000)
      .ease(d3.easeCubicOut)
      .style("opacity", 1);
    
  }, [calculations, showDistributions, hypothesisType, significanceLevel]);
  
  return (
    <VisualizationContainer
      title="Difference of Two Proportions Test"
      description="Learn how to test for differences between two population proportions using the moth recapture study."
    >
      <div className="space-y-8">
        {/* Back to Hub Button */}
        <BackToHub chapter={6} />

        {/* Introduction */}
        <VisualizationSection>
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-white">The Moth Recapture Study</h3>
            <p className="text-neutral-300 max-w-3xl mx-auto">
              Scientists study moth populations to understand natural selection. They release and recapture 
              moths to estimate survival rates. Is there a significant difference in recapture rates 
              between light and dark moths?
            </p>
            <HypothesisDisplay />
          </div>
        </VisualizationSection>

        {/* Data Display */}
        <VisualizationSection>
          <h3 className="text-xl font-bold text-white mb-4">Observed Data</h3>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Bug className="w-6 h-6 text-blue-400" />
                <h4 className="text-lg font-bold text-blue-400">Light-colored Moths (Group 1)</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-300">Released:</span>
                  <span className="font-mono text-white">{calculations.n1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">Recaptured:</span>
                  <span className="font-mono text-white">{calculations.y1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">Proportion:</span>
                  <span className="font-mono text-blue-400">{(calculations.p1 * 100).toFixed(1)}%</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Bug className="w-6 h-6 text-green-400" />
                <h4 className="text-lg font-bold text-green-400">Dark-colored Moths (Group 2)</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-300">Released:</span>
                  <span className="font-mono text-white">{calculations.n2}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">Recaptured:</span>
                  <span className="font-mono text-white">{calculations.y2}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">Proportion:</span>
                  <span className="font-mono text-green-400">{(calculations.p2 * 100).toFixed(1)}%</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bar Chart */}
          <GraphContainer title="Recapture Rates Comparison">
            <svg 
              ref={barChartRef} 
              className="w-full"
              role="img"
              aria-label="Bar chart comparing recapture rates between light and dark moths"
            >
              <title>Moth Recapture Rates Comparison</title>
              <desc>A bar chart showing the recapture rates for light-colored moths ({(calculations.p1 * 100).toFixed(1)}%) and dark-colored moths ({(calculations.p2 * 100).toFixed(1)}%)</desc>
            </svg>
          </GraphContainer>
        </VisualizationSection>

        {/* Mathematical Framework */}
        <MathematicalFramework />

        {/* Interactive Controls */}
        <VisualizationSection className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-6 border border-neutral-700/50">
          <h4 className="text-lg font-bold text-white mb-6">Explore the Impact of Sample Size and Significance</h4>
          
          <div className="grid md:grid-cols-3 gap-6">
            <ControlGroup label="Sample Size Multiplier">
              <div className="space-y-3">
                <input
                  type="range"
                  min={0.25}
                  max={2}
                  step={0.25}
                  value={sampleSizeMultiplier}
                  onChange={handleSampleSizeChange}
                  className="w-full"
                  aria-label="Sample size multiplier slider"
                  aria-valuemin={0.25}
                  aria-valuemax={2}
                  aria-valuenow={sampleSizeMultiplier}
                  aria-valuetext={`${(sampleSizeMultiplier * 100).toFixed(0)} percent`}
                />
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>25%</span>
                  <span className="font-mono text-white">{(sampleSizeMultiplier * 100).toFixed(0)}%</span>
                  <span>200%</span>
                </div>
                <p className="text-xs text-neutral-500">
                  n1 = {calculations.n1}, n2 = {calculations.n2}
                </p>
              </div>
            </ControlGroup>

            <ControlGroup label={<>Significance Level <span dangerouslySetInnerHTML={{ __html: `\\(\\alpha\\)` }} /></>}>
              <div className="space-y-3">
                <div className="flex gap-2">
                  {[0.01, 0.05, 0.10].map(alpha => (
                    <motion.button
                      key={alpha}
                      onClick={() => handleSignificanceLevelChange(alpha)}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                        significanceLevel === alpha
                          ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-500/50'
                          : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                      }`}
                      aria-label={`Set significance level to ${(alpha * 100)} percent`}
                      aria-pressed={significanceLevel === alpha}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {(alpha * 100)}%
                    </motion.button>
                  ))}
                </div>
              </div>
            </ControlGroup>

            <ControlGroup label="Alternative Hypothesis">
              <div className="space-y-3">
                <select
                  value={hypothesisType}
                  onChange={handleHypothesisTypeChange}
                  className="w-full bg-neutral-700 text-white rounded-md px-3 py-2 text-sm border border-neutral-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  aria-label="Select alternative hypothesis type"
                >
                  <option value="two">p1 ≠ p2 (Two-sided)</option>
                  <option value="left">p1 &lt; p2 (Left-sided)</option>
                  <option value="right">p1 &gt; p2 (Right-sided)</option>
                </select>
              </div>
            </ControlGroup>
          </div>
        </VisualizationSection>

        {/* Test Results */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-6 shadow-lg hover:shadow-blue-500/20 transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <Calculator className="w-6 h-6 text-blue-400" />
              <h4 className="text-lg font-bold text-blue-400">Test Statistic</h4>
            </div>
            <div className="text-3xl font-mono font-bold text-blue-400">
              z = {calculations.zStat.toFixed(3)}
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              Measures difference in SE units
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-br rounded-lg p-6 border shadow-lg transition-all duration-200 ${
              calculations.pValue < significanceLevel
                ? 'from-red-500/10 to-red-600/10 border-red-500/30 hover:shadow-red-500/20'
                : 'from-green-500/10 to-green-600/10 border-green-500/30 hover:shadow-green-500/20'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              {calculations.pValue < significanceLevel ? (
                <AlertCircle className="w-6 h-6 text-red-400" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-400" />
              )}
              <h4 className={`text-lg font-bold ${
                calculations.pValue < significanceLevel ? 'text-red-400' : 'text-green-400'
              }`}>P-value</h4>
            </div>
            <div className={`text-3xl font-mono font-bold ${
              calculations.pValue < significanceLevel ? 'text-red-400' : 'text-green-400'
            }`}>
              {calculations.pValue < 0.001 ? '< 0.001' : calculations.pValue.toFixed(4)}
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              {calculations.pValue < significanceLevel ? (
                <>Reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /></>
              ) : (
                <>Fail to reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /></>
              )}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-6 shadow-lg hover:shadow-purple-500/20 transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <h4 className="text-lg font-bold text-purple-400">95% CI</h4>
            </div>
            <div className="text-lg font-mono font-bold text-purple-400">
              ({calculations.ciLower.toFixed(3)}, {calculations.ciUpper.toFixed(3)})
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              {calculations.ciLower > 0 || calculations.ciUpper < 0 ? 'Excludes 0' : 'Includes 0'}
            </p>
          </motion.div>
        </div>

        {/* Distribution Visualization */}
        <div className="space-y-4">
          <motion.button
            onClick={toggleDistributions}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showDistributions ? "Hide" : "Show"} Sampling Distribution
          </motion.button>
          
          {showDistributions && (
            <GraphContainer title="Sampling Distribution Under Null Hypothesis">
              <svg 
                ref={distributionRef} 
                className="w-full"
                role="img"
                aria-label="Sampling distribution curve under null hypothesis"
              >
                <title>Sampling Distribution Under H_0</title>
                <desc>A normal distribution curve showing the sampling distribution of the difference in proportions under the null hypothesis, with critical regions highlighted</desc>
              </svg>
            </GraphContainer>
          )}
        </div>

        {/* Worked Example */}
        <WorkedExample 
          sampleSize={sampleSizeMultiplier} 
          significanceLevel={significanceLevel} 
        />

        {/* Key Insights */}
        <KeyInsights calculations={calculations} />

        {/* Important Distinctions */}
        <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-4">Important Distinctions</h3>
          
          <ImportantDistinctions />
        </VisualizationSection>
      </div>
    </VisualizationContainer>
  );
}