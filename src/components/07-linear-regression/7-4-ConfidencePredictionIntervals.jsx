"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import jStat from "jstat";
import { motion, AnimatePresence } from "framer-motion";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, createColorScheme, cn } from '../../lib/design-system';
import BackToHub from '../ui/BackToHub';
import { TrendingUp, AlertCircle, Target, BarChart3, Settings, Eye, EyeOff } from 'lucide-react';

// Get Chapter 7 color scheme
const chapterColors = createColorScheme('inference');

// Sample data for demonstration
const generateData = () => {
  const n = 20;
  const data = [];
  for (let i = 0; i < n; i++) {
    const x = 0.5 + i * 0.1 + (Math.random() - 0.5) * 0.2;
    const y = 2 + 1.5 * x + (Math.random() - 0.5) * 0.5;
    data.push({ x, y });
  }
  return data;
};

// Calculate regression statistics
const calculateRegression = (data) => {
  const n = data.length;
  const sumX = d3.sum(data, d => d.x);
  const sumY = d3.sum(data, d => d.y);
  const sumXY = d3.sum(data, d => d.x * d.y);
  const sumX2 = d3.sum(data, d => d.x * d.x);
  const sumY2 = d3.sum(data, d => d.y * d.y);
  
  const xMean = sumX / n;
  const yMean = sumY / n;
  
  const sxx = sumX2 - (sumX * sumX) / n;
  const syy = sumY2 - (sumY * sumY) / n;
  const sxy = sumXY - (sumX * sumY) / n;
  
  const b1 = sxy / sxx;
  const b0 = yMean - b1 * xMean;
  
  const ssr = b1 * b1 * sxx;
  const sse = syy - ssr;
  const mse = sse / (n - 2);
  
  return { b0, b1, mse, xMean, sxx, n };
};

// Calculate confidence and prediction intervals
const calculateIntervals = (x0, regressionResults, alpha) => {
  const { b0, b1, mse, xMean, sxx, n } = regressionResults;
  
  // Point estimate
  const y0 = b0 + b1 * x0;
  
  // Standard errors
  const se_mean = Math.sqrt(mse * (1/n + Math.pow(x0 - xMean, 2) / sxx));
  const se_pred = Math.sqrt(mse * (1 + 1/n + Math.pow(x0 - xMean, 2) / sxx));
  
  // Critical value
  const t_crit = jStat.studentt.inv(1 - alpha/2, n - 2);
  
  return {
    y0,
    ci: { 
      lower: y0 - t_crit * se_mean, 
      upper: y0 + t_crit * se_mean,
      se: se_mean
    },
    pi: { 
      lower: y0 - t_crit * se_pred, 
      upper: y0 + t_crit * se_pred,
      se: se_pred
    },
    t_crit
  };
};

// Introduction Section
const IntervalsIntroduction = React.memo(function IntervalsIntroduction() {
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
    <VisualizationSection>
      <div ref={contentRef} className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-white">How Precise Are Our Predictions?</h3>
        <p className="text-neutral-300 max-w-3xl mx-auto">
          When we make predictions using regression, we need to quantify our uncertainty. 
          There are two types of intervals we can construct:
        </p>
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto mt-6">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-bold text-blue-400 mb-2">Confidence Interval (CI)</h4>
            <p className="text-sm text-neutral-300">
              Captures uncertainty about the <strong>mean response</strong> at a given <span dangerouslySetInnerHTML={{ __html: `\\(x\\)` }} /> value.
              Answers: "Where is the average <span dangerouslySetInnerHTML={{ __html: `\\(y\\)` }} /> for this <span dangerouslySetInnerHTML={{ __html: `\\(x\\)` }} />?"
            </p>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="font-bold text-green-400 mb-2">Prediction Interval (PI)</h4>
            <p className="text-sm text-neutral-300">
              Captures uncertainty about an <strong>individual observation</strong> at a given <span dangerouslySetInnerHTML={{ __html: `\\(x\\)` }} /> value.
              Answers: "Where will a new <span dangerouslySetInnerHTML={{ __html: `\\(y\\)` }} /> value likely fall?"
            </p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Mathematical Framework
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
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-blue-400 mb-3">Confidence Interval Formula</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>For the mean response at <span dangerouslySetInnerHTML={{ __html: `\\(x_0\\)` }} />:</p>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\hat{y}_0 \\pm t_{\\alpha/2,n-2} \\times SE(\\hat{y}_0)\\]` }} />
            </div>
            <p>where:</p>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[SE(\\hat{y}_0) = \\sqrt{MSE \\left(\\frac{1}{n} + \\frac{(x_0 - \\bar{x})^2}{S_{xx}}\\right)}\\]` }} />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-green-400 mb-3">Prediction Interval Formula</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>For a new observation at <span dangerouslySetInnerHTML={{ __html: `\\(x_0\\)` }} />:</p>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\hat{y}_0 \\pm t_{\\alpha/2,n-2} \\times SE(pred)\\]` }} />
            </div>
            <p>where:</p>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[SE(pred) = \\sqrt{MSE \\left(1 + \\frac{1}{n} + \\frac{(x_0 - \\bar{x})^2}{S_{xx}}\\right)}\\]` }} />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-purple-400 mb-3">Why PI &gt; CI Always?</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>The extra "1" in the PI formula accounts for:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>CI: Only uncertainty about the mean</li>
              <li>PI: Mean uncertainty + individual variation</li>
            </ul>
            <p className="mt-2">
              <span dangerouslySetInnerHTML={{ __html: `\\(SE(pred)^2 = SE(\\hat{y}_0)^2 + \\sigma^2\\)` }} />
            </p>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-yellow-400 mb-3">Interpretation Differences</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p><strong>CI:</strong> "We are 95% confident the true mean response lies in this interval"</p>
            <p><strong>PI:</strong> "We are 95% confident a new observation will fall in this interval"</p>
            <p className="text-xs text-neutral-400 mt-2">PI captures more sources of variation</p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Worked Example Component
const WorkedExample = React.memo(function WorkedExample({ data, regressionResults, xValue, alpha }) {
  const contentRef = useRef(null);
  const intervals = calculateIntervals(xValue, regressionResults, alpha);
  
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
  }, [xValue, alpha]);
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-6 border border-neutral-700/50">
      <h3 className="text-xl font-bold text-purple-400 mb-6">
        Step-by-Step Calculation for x₀ = {xValue.toFixed(2)}
      </h3>
      
      <div ref={contentRef} className="space-y-6">
        {/* Given Information */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Given Information</h4>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li>• Regression equation: <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{y} = ${regressionResults.b0.toFixed(3)} + ${regressionResults.b1.toFixed(3)}x\\)` }} /></li>
            <li>• Sample size: <span dangerouslySetInnerHTML={{ __html: `\\(n = ${regressionResults.n}\\)` }} /></li>
            <li>• MSE = {regressionResults.mse.toFixed(4)}</li>
            <li>• <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x} = ${regressionResults.xMean.toFixed(3)}\\)` }} />, <span dangerouslySetInnerHTML={{ __html: `\\(S_{xx} = ${regressionResults.sxx.toFixed(4)}\\)` }} /></li>
            <li>• Confidence level: {((1 - alpha) * 100).toFixed(0)}%</li>
          </ul>
        </div>

        {/* Step 1: Calculate point estimate */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 1: Calculate Point Estimate</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\hat{y}_0 = ${regressionResults.b0.toFixed(3)} + ${regressionResults.b1.toFixed(3)} \\times ${xValue.toFixed(2)} = ${intervals.y0.toFixed(3)}\\]` }} />
            </div>
          </div>
        </div>

        {/* Step 2: Calculate SE for CI */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 2: Calculate SE for Confidence Interval</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[SE(\\hat{y}_0) = \\sqrt{${regressionResults.mse.toFixed(4)} \\left(\\frac{1}{${regressionResults.n}} + \\frac{(${xValue.toFixed(2)} - ${regressionResults.xMean.toFixed(3)})^2}{${regressionResults.sxx.toFixed(4)}}\\right)}\\]` }} />
            </div>
            <div className="text-center">
              <span dangerouslySetInnerHTML={{ __html: `\\[SE(\\hat{y}_0) = ${intervals.ci.se.toFixed(4)}\\]` }} />
            </div>
          </div>
        </div>

        {/* Step 3: Calculate SE for PI */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 3: Calculate SE for Prediction Interval</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <div className="my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[SE(pred) = \\sqrt{${regressionResults.mse.toFixed(4)} \\left(1 + \\frac{1}{${regressionResults.n}} + \\frac{(${xValue.toFixed(2)} - ${regressionResults.xMean.toFixed(3)})^2}{${regressionResults.sxx.toFixed(4)}}\\right)}\\]` }} />
            </div>
            <div className="text-center">
              <span dangerouslySetInnerHTML={{ __html: `\\[SE(pred) = ${intervals.pi.se.toFixed(4)}\\]` }} />
            </div>
          </div>
        </div>

        {/* Step 4: Find critical value */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 4: Find Critical t-value</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>Degrees of freedom: <span dangerouslySetInnerHTML={{ __html: `\\(df = n - 2 = ${regressionResults.n - 2}\\)` }} /></p>
            <p>For {((1 - alpha) * 100).toFixed(0)}% confidence: <span dangerouslySetInnerHTML={{ __html: `\\(t_{${(alpha/2).toFixed(3)},${regressionResults.n - 2}} = ${intervals.t_crit.toFixed(3)}\\)` }} /></p>
          </div>
        </div>

        {/* Step 5: Construct intervals */}
        <div className="bg-gradient-to-br from-teal-900/20 to-teal-800/20 border border-teal-500/30 rounded-lg p-4">
          <h4 className="font-bold text-teal-400 mb-3">Step 5: Construct Both Intervals</h4>
          <div className="text-sm text-neutral-300 space-y-3">
            <div>
              <p className="font-bold text-blue-400 mb-2">Confidence Interval:</p>
              <div className="text-center">
                <span dangerouslySetInnerHTML={{ __html: `\\[CI = ${intervals.y0.toFixed(3)} \\pm ${intervals.t_crit.toFixed(3)} \\times ${intervals.ci.se.toFixed(4)} = [${intervals.ci.lower.toFixed(3)}, ${intervals.ci.upper.toFixed(3)}]\\]` }} />
              </div>
            </div>
            <div>
              <p className="font-bold text-green-400 mb-2">Prediction Interval:</p>
              <div className="text-center">
                <span dangerouslySetInnerHTML={{ __html: `\\[PI = ${intervals.y0.toFixed(3)} \\pm ${intervals.t_crit.toFixed(3)} \\times ${intervals.pi.se.toFixed(4)} = [${intervals.pi.lower.toFixed(3)}, ${intervals.pi.upper.toFixed(3)}]\\]` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Enhanced Comparison Table with LaTeX
const ComparisonTable = React.memo(function ComparisonTable() {
  const tableRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && tableRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([tableRef.current]);
        }
        window.MathJax.typesetPromise([tableRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">Comprehensive CI vs PI Comparison</h3>
      <div ref={tableRef} className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="text-left py-3 px-4 text-neutral-400">Aspect</th>
              <th className="text-center py-3 px-4 text-blue-400">Confidence Interval (CI)</th>
              <th className="text-center py-3 px-4 text-green-400">Prediction Interval (PI)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-neutral-700/50">
              <td className="py-3 px-4 text-neutral-300 font-semibold">What it estimates</td>
              <td className="text-center py-3 px-4">
                <span dangerouslySetInnerHTML={{ __html: `Mean response \\(E[Y|X=x_0]\\)` }} />
              </td>
              <td className="text-center py-3 px-4">
                <span dangerouslySetInnerHTML={{ __html: `Individual observation \\(Y|X=x_0\\)` }} />
              </td>
            </tr>
            <tr className="border-b border-neutral-700/50">
              <td className="py-3 px-4 text-neutral-300 font-semibold">Mathematical Formula</td>
              <td className="text-center py-3 px-4">
                <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{y}_0 \\pm t_{\\alpha/2,n-2} \\cdot SE(\\hat{y}_0)\\)` }} />
              </td>
              <td className="text-center py-3 px-4">
                <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{y}_0 \\pm t_{\\alpha/2,n-2} \\cdot SE(pred)\\)` }} />
              </td>
            </tr>
            <tr className="border-b border-neutral-700/50">
              <td className="py-3 px-4 text-neutral-300 font-semibold">Standard Error</td>
              <td className="text-center py-3 px-4">
                <span dangerouslySetInnerHTML={{ __html: `\\(SE(\\hat{y}_0) = \\sqrt{MSE\\left(\\frac{1}{n} + \\frac{(x_0-\\bar{x})^2}{S_{xx}}\\right)}\\)` }} />
              </td>
              <td className="text-center py-3 px-4">
                <span dangerouslySetInnerHTML={{ __html: `\\(SE(pred) = \\sqrt{MSE\\left(1 + \\frac{1}{n} + \\frac{(x_0-\\bar{x})^2}{S_{xx}}\\right)}\\)` }} />
              </td>
            </tr>
            <tr className="border-b border-neutral-700/50">
              <td className="py-3 px-4 text-neutral-300 font-semibold">Variance Components</td>
              <td className="text-center py-3 px-4">
                <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(\\hat{y}_0) = \\sigma^2\\left(\\frac{1}{n} + \\frac{(x_0-\\bar{x})^2}{S_{xx}}\\right)\\)` }} />
              </td>
              <td className="text-center py-3 px-4">
                <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(Y_0 - \\hat{y}_0) = \\sigma^2 + \\text{Var}(\\hat{y}_0)\\)` }} />
              </td>
            </tr>
            <tr className="border-b border-neutral-700/50">
              <td className="py-3 px-4 text-neutral-300 font-semibold">Width Relationship</td>
              <td className="text-center py-3 px-4">Always narrower</td>
              <td className="text-center py-3 px-4">
                <span dangerouslySetInnerHTML={{ __html: `Always wider: \\(\\text{Width}_{PI} = \\text{Width}_{CI} \\cdot \\sqrt{1 + \\frac{n \\cdot S_{xx}}{n \\cdot S_{xx} + (x_0-\\bar{x})^2}}\\)` }} />
              </td>
            </tr>
            <tr className="border-b border-neutral-700/50">
              <td className="py-3 px-4 text-neutral-300 font-semibold">Interpretation</td>
              <td className="text-center py-3 px-4">
                <span dangerouslySetInnerHTML={{ __html: `\\((1-\\alpha)100\\%\\)` }} /> confident the true mean response lies in this interval
              </td>
              <td className="text-center py-3 px-4">
                <span dangerouslySetInnerHTML={{ __html: `\\((1-\\alpha)100\\%\\)` }} /> confident a new observation will fall in this interval
              </td>
            </tr>
            <tr className="border-b border-neutral-700/50">
              <td className="py-3 px-4 text-neutral-300 font-semibold">As <span dangerouslySetInnerHTML={{ __html: `\\(n \\to \\infty\\)` }} /></td>
              <td className="text-center py-3 px-4">
                <span dangerouslySetInnerHTML={{ __html: `Width \\(\\to 0\\)` }} />
              </td>
              <td className="text-center py-3 px-4">
                <span dangerouslySetInnerHTML={{ __html: `Width \\(\\to 2t_{\\alpha/2} \\cdot \\sigma\\)` }} />
              </td>
            </tr>
            <tr className="border-b border-neutral-700/50">
              <td className="py-3 px-4 text-neutral-300 font-semibold">At <span dangerouslySetInnerHTML={{ __html: `\\(x_0 = \\bar{x}\\)` }} /></td>
              <td className="text-center py-3 px-4">
                <span dangerouslySetInnerHTML={{ __html: `Width = \\(2t_{\\alpha/2,n-2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\)` }} />
              </td>
              <td className="text-center py-3 px-4">
                <span dangerouslySetInnerHTML={{ __html: `Width = \\(2t_{\\alpha/2,n-2} \\cdot \\sigma\\sqrt{1 + \\frac{1}{n}}\\)` }} />
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-neutral-300 font-semibold">Practical Use Cases</td>
              <td className="text-center py-3 px-4">
                • Average performance<br/>
                • Process control<br/>
                • Policy decisions<br/>
                • Group comparisons
              </td>
              <td className="text-center py-3 px-4">
                • Individual forecasts<br/>
                • Quality assurance<br/>
                • Risk assessment<br/>
                • Warranty limits
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VisualizationSection>
  );
});

export default function ConfidencePredictionIntervals() {
  // State management
  const [data] = useState(generateData());
  const [xValue, setXValue] = useState(1.2);
  const [showCI, setShowCI] = useState(true);
  const [showPI, setShowPI] = useState(true);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [showExtrapolation, setShowExtrapolation] = useState(false);
  
  const alpha = 1 - confidenceLevel;
  const regressionResults = calculateRegression(data);
  const intervals = calculateIntervals(xValue, regressionResults, alpha);
  
  // Refs for D3 visualizations
  const mainVizRef = useRef(null);
  
  // Main visualization
  useEffect(() => {
    if (!mainVizRef.current) return;
    
    const svg = d3.select(mainVizRef.current);
    svg.selectAll("*").remove();
    
    const width = mainVizRef.current.clientWidth;
    const height = 500;
    const margin = { top: 40, right: 80, bottom: 60, left: 80 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Scales
    const xExtent = d3.extent(data, d => d.x);
    const yExtent = d3.extent(data, d => d.y);
    const xPadding = (xExtent[1] - xExtent[0]) * 0.1;
    const yPadding = (yExtent[1] - yExtent[0]) * 0.2;
    
    const x = d3.scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([innerHeight, 0]);
    
    // Add axes with white/light gray styling
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .style("font-size", "12px")
      .style("color", "#e5e7eb"); // Light gray for tick labels
    
    g.append("g")
      .call(d3.axisLeft(y))
      .style("font-size", "12px")
      .style("color", "#e5e7eb"); // Light gray for tick labels
    
    // Add axis labels with white color
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 45)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#ffffff") // White text
      .text("X Variable");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#ffffff") // White text
      .text("Y Variable");
    
    // Generate interval bands
    const generateBands = () => {
      const xRange = x.domain();
      const step = (xRange[1] - xRange[0]) / 100;
      const points = [];
      
      for (let xi = xRange[0]; xi <= xRange[1]; xi += step) {
        const intervalsAtX = calculateIntervals(xi, regressionResults, alpha);
        points.push({
          x: xi,
          y: intervalsAtX.y0,
          ciLower: intervalsAtX.ci.lower,
          ciUpper: intervalsAtX.ci.upper,
          piLower: intervalsAtX.pi.lower,
          piUpper: intervalsAtX.pi.upper
        });
      }
      
      return points;
    };
    
    const bands = generateBands();
    
    // Area generators
    const ciArea = d3.area()
      .x(d => x(d.x))
      .y0(d => y(d.ciLower))
      .y1(d => y(d.ciUpper))
      .curve(d3.curveBasis);
    
    const piArea = d3.area()
      .x(d => x(d.x))
      .y0(d => y(d.piLower))
      .y1(d => y(d.piUpper))
      .curve(d3.curveBasis);
    
    // Draw PI band (wider, so draw first)
    if (showPI) {
      g.append("path")
        .datum(bands)
        .attr("d", piArea)
        .attr("fill", "#10b981")
        .attr("opacity", 0.2);
    }
    
    // Draw CI band
    if (showCI) {
      g.append("path")
        .datum(bands)
        .attr("d", ciArea)
        .attr("fill", "#3b82f6")
        .attr("opacity", 0.3);
    }
    
    // Draw regression line
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    g.append("path")
      .datum(bands)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#fbbf24")
      .attr("stroke-width", 2);
    
    // Draw data points
    g.selectAll(".point")
      .data(data)
      .enter().append("circle")
      .attr("class", "point")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 4)
      .attr("fill", "#ffffff")
      .attr("stroke", "#374151")
      .attr("stroke-width", 1);
    
    // Draw selected x value
    if (xValue >= x.domain()[0] && xValue <= x.domain()[1]) {
      // Vertical line
      g.append("line")
        .attr("x1", x(xValue))
        .attr("x2", x(xValue))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
      
      // Point estimate
      g.append("circle")
        .attr("cx", x(xValue))
        .attr("cy", y(intervals.y0))
        .attr("r", 6)
        .attr("fill", "#ef4444")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2);
      
      // CI endpoints
      if (showCI) {
        [intervals.ci.lower, intervals.ci.upper].forEach(val => {
          g.append("line")
            .attr("x1", x(xValue) - 10)
            .attr("x2", x(xValue) + 10)
            .attr("y1", y(val))
            .attr("y2", y(val))
            .attr("stroke", "#3b82f6")
            .attr("stroke-width", 3);
        });
      }
      
      // PI endpoints
      if (showPI) {
        [intervals.pi.lower, intervals.pi.upper].forEach(val => {
          g.append("line")
            .attr("x1", x(xValue) - 10)
            .attr("x2", x(xValue) + 10)
            .attr("y1", y(val))
            .attr("y2", y(val))
            .attr("stroke", "#10b981")
            .attr("stroke-width", 3);
        });
      }
    }
    
    // Add legend
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 120}, 20)`);
    
    const legendItems = [
      { label: "Data Points", color: "#ffffff", type: "circle" },
      { label: "Regression Line", color: "#fbbf24", type: "line" },
      ...(showCI ? [{ label: "CI Band", color: "#3b82f6", type: "rect" }] : []),
      ...(showPI ? [{ label: "PI Band", color: "#10b981", type: "rect" }] : [])
    ];
    
    legendItems.forEach((item, i) => {
      const itemG = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);
      
      if (item.type === "circle") {
        itemG.append("circle")
          .attr("cx", 10)
          .attr("cy", 10)
          .attr("r", 4)
          .attr("fill", item.color)
          .attr("stroke", "#374151");
      } else if (item.type === "line") {
        itemG.append("line")
          .attr("x1", 0)
          .attr("x2", 20)
          .attr("y1", 10)
          .attr("y2", 10)
          .attr("stroke", item.color)
          .attr("stroke-width", 2);
      } else {
        itemG.append("rect")
          .attr("x", 0)
          .attr("y", 5)
          .attr("width", 20)
          .attr("height", 10)
          .attr("fill", item.color)
          .attr("opacity", 0.5);
      }
      
      itemG.append("text")
        .attr("x", 25)
        .attr("y", 14)
        .style("font-size", "12px")
        .style("fill", "#e5e7eb") // Light gray text for legend
        .text(item.label);
    });
    
    // Extrapolation warning
    if (showExtrapolation) {
      const dataXExtent = d3.extent(data, d => d.x);
      
      // Left extrapolation zone
      g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", x(dataXExtent[0]))
        .attr("height", innerHeight)
        .attr("fill", "#ef4444")
        .attr("opacity", 0.1);
      
      // Right extrapolation zone
      g.append("rect")
        .attr("x", x(dataXExtent[1]))
        .attr("y", 0)
        .attr("width", innerWidth - x(dataXExtent[1]))
        .attr("height", innerHeight)
        .attr("fill", "#ef4444")
        .attr("opacity", 0.1);
      
      // Warning text
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#ef4444")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("⚠️ Red zones indicate extrapolation beyond data range");
    }
    
  }, [data, xValue, showCI, showPI, alpha, showExtrapolation, intervals]);
  
  return (
    <VisualizationContainer
      title="Confidence and Prediction Intervals"
      description="Understand the difference between predicting mean responses and individual observations."
    >
      <div className="space-y-8">
        {/* Back to Hub Button */}
        <BackToHub chapter={7} />

        {/* Introduction */}
        <IntervalsIntroduction />

        {/* Mathematical Framework */}
        <MathematicalFramework />

        {/* Main Visualization */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Interactive Interval Visualization</h3>
          <div className="relative" style={{ height: '500px' }}>
            <svg ref={mainVizRef} className="w-full"></svg>
          </div>
        </div>

        {/* Interactive Controls */}
        <VisualizationSection className="bg-neutral-800/50 rounded-lg p-6">
          <h4 className="text-lg font-bold text-white mb-6">Explore the Intervals</h4>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <ControlGroup label="X-Value for Prediction">
                <input
                  type="range"
                  min={0.5}
                  max={2.5}
                  step={0.01}
                  value={xValue}
                  onChange={(e) => setXValue(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-2">
                  <span>0.5</span>
                  <span className="font-mono text-white">{xValue.toFixed(2)}</span>
                  <span>2.5</span>
                </div>
              </ControlGroup>

              <ControlGroup label="Confidence Level">
                <div className="bg-neutral-700/50 rounded-lg p-1 flex gap-1">
                  {[0.90, 0.95, 0.99].map(level => (
                    <button
                      key={level}
                      onClick={() => setConfidenceLevel(level)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                        confidenceLevel === level
                          ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-500/50'
                          : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      {(level * 100).toFixed(0)}%
                    </button>
                  ))}
                </div>
              </ControlGroup>
            </div>

            <div className="space-y-4">
              <ControlGroup label="Display Options">
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCI(!showCI)}
                    className={`px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                      showCI
                        ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-500/50'
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                    }`}
                  >
                    {showCI ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    Show Confidence Interval
                  </button>
                  <button
                    onClick={() => setShowPI(!showPI)}
                    className={`px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                      showPI
                        ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-500/50'
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                    }`}
                  >
                    {showPI ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    Show Prediction Interval
                  </button>
                  <button
                    onClick={() => setShowExtrapolation(!showExtrapolation)}
                    className={`px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                      showExtrapolation
                        ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-500/50'
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                    }`}
                  >
                    {showExtrapolation ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    Show Extrapolation Warning
                  </button>
                </div>
              </ControlGroup>
            </div>
          </div>
        </VisualizationSection>

        {/* Current Intervals Display */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-blue-400" />
              <h4 className="text-lg font-bold text-blue-400">Confidence Interval</h4>
              <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
                {(confidenceLevel * 100).toFixed(0)}% CI
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-neutral-300">
                For x = {xValue.toFixed(2)}, we are {(confidenceLevel * 100).toFixed(0)}% confident the mean response is:
              </p>
              <div className="text-2xl font-mono font-bold text-blue-400">
                [{intervals.ci.lower.toFixed(3)}, {intervals.ci.upper.toFixed(3)}]
              </div>
              <p className="text-xs text-neutral-400">
                Width: {(intervals.ci.upper - intervals.ci.lower).toFixed(3)}
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-green-400" />
              <h4 className="text-lg font-bold text-green-400">Prediction Interval</h4>
              <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                {(confidenceLevel * 100).toFixed(0)}% PI
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-neutral-300">
                For x = {xValue.toFixed(2)}, we are {(confidenceLevel * 100).toFixed(0)}% confident a new observation will be:
              </p>
              <div className="text-2xl font-mono font-bold text-green-400">
                [{intervals.pi.lower.toFixed(3)}, {intervals.pi.upper.toFixed(3)}]
              </div>
              <p className="text-xs text-neutral-400">
                Width: {(intervals.pi.upper - intervals.pi.lower).toFixed(3)} | 
                <span className="text-yellow-400 ml-1">
                  {(intervals.pi.upper - intervals.pi.lower) / (intervals.ci.upper - intervals.ci.lower) > 0 
                    ? ` ${((intervals.pi.upper - intervals.pi.lower) / (intervals.ci.upper - intervals.ci.lower)).toFixed(2)}× wider than CI`
                    : ''}
                </span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Worked Example */}
        <WorkedExample 
          data={data} 
          regressionResults={regressionResults} 
          xValue={xValue} 
          alpha={alpha} 
        />

        {/* Key Insights */}
        <VisualizationSection className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-700/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">Key Insights</h3>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-neutral-800/50 rounded p-4">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                Why PI &gt; CI Always
              </h4>
              <p className="text-neutral-300">
                PI accounts for two sources of uncertainty: estimation error (like CI) 
                plus the inherent variability in individual observations. The extra σ² 
                term makes PI wider.
              </p>
            </div>
            
            <div className="bg-neutral-800/50 rounded p-4">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                Interval Width Factors
              </h4>
              <p className="text-neutral-300">
                Both intervals get wider: farther from x̄, smaller sample size, 
                higher confidence level, or larger MSE. The effect is more pronounced 
                at the extremes of the data range.
              </p>
            </div>
            
            <div className="bg-neutral-800/50 rounded p-4">
              <h4 className="font-bold text-white mb-2">Practical Applications</h4>
              <p className="text-neutral-300">
                Use CI for: average performance, process control, comparing groups. 
                Use PI for: individual predictions, quality assurance, forecasting 
                specific outcomes.
              </p>
            </div>
            
            <div className="bg-neutral-800/50 rounded p-4">
              <h4 className="font-bold text-white mb-2">Extrapolation Danger</h4>
              <p className="text-neutral-300">
                Intervals widen dramatically outside the data range. The model 
                assumptions may not hold, making predictions unreliable. Always 
                be cautious when extrapolating!
              </p>
            </div>
          </div>
        </VisualizationSection>

        {/* Summary Comparison Table */}
        <ComparisonTable />
      </div>
    </VisualizationContainer>
  );
}