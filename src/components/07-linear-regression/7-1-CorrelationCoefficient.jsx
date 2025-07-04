"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, createColorScheme } from '../../lib/design-system';
import BackToHub from '../ui/BackToHub';
import { TrendingUp, TrendingDown, Activity, Info } from 'lucide-react';

// Get Chapter 7 color scheme
const chapterColors = createColorScheme('regression');

// Correlation Introduction Component
const CorrelationIntroduction = React.memo(function CorrelationIntroduction() {
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
    <div ref={contentRef} className="bg-neutral-800 rounded-lg p-4 max-w-2xl mx-auto">
      <div className="text-sm text-neutral-300 space-y-2">
        <p className="text-lg font-semibold text-white mb-3">
          How strong is the linear relationship between X and Y?
        </p>
        <p>
          The <strong className="text-teal-400">correlation coefficient</strong> measures the strength and direction of a linear relationship:
        </p>
        <div className="text-center my-4">
          <span dangerouslySetInnerHTML={{ __html: `\\[r = \\frac{\\sum_{i=1}^{n}(x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum_{i=1}^{n}(x_i - \\bar{x})^2 \\sum_{i=1}^{n}(y_i - \\bar{y})^2}}\\]` }} />
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          where <span dangerouslySetInnerHTML={{ __html: `\\(-1 \\leq r \\leq 1\\)` }} />
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
      
      <div ref={contentRef} className="grid md:grid-cols-3 gap-6">
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Population Correlation</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">Theoretical correlation:</p>
            <div className="text-center text-teal-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\rho = \\frac{\\text{Cov}(X,Y)}{\\sigma_X \\cdot \\sigma_Y}\\]` }} />
            </div>
            <p className="text-xs text-neutral-400">Population parameter</p>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Sample Correlation</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">Calculated from data:</p>
            <div className="text-center text-blue-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[r = \\frac{S_{xy}}{\\sqrt{S_{xx} \\cdot S_{yy}}}\\]` }} />
            </div>
            <p className="text-xs text-neutral-400">Sample statistic</p>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Interpretation Scale</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <div className="flex justify-between">
              <span>Perfect negative:</span>
              <span className="font-mono">-1.0</span>
            </div>
            <div className="flex justify-between">
              <span>No linear relation:</span>
              <span className="font-mono">0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Perfect positive:</span>
              <span className="font-mono">+1.0</span>
            </div>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Mathematical Properties Component
const MathematicalProperties = React.memo(function MathematicalProperties() {
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
      <h3 className="text-xl font-bold text-teal-400 mb-6">Mathematical Properties of Correlation</h3>
      
      <div ref={contentRef} className="grid md:grid-cols-2 gap-6">
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">1. Symmetry Property</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">Correlation is symmetric:</p>
            <div className="text-center text-teal-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\rho_{XY} = \\rho_{YX}\\]` }} />
            </div>
            <p className="text-xs text-neutral-400">
              The correlation between X and Y equals the correlation between Y and X
            </p>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">2. Bounded Values</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">Correlation is always bounded:</p>
            <div className="text-center text-blue-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[-1 \\leq \\rho \\leq 1\\]` }} />
            </div>
            <p className="text-xs text-neutral-400">
              By Cauchy-Schwarz inequality: <span dangerouslySetInnerHTML={{ __html: `\\(|\\text{Cov}(X,Y)| \\leq \\sigma_X \\sigma_Y\\)` }} />
            </p>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">3. Scale Invariance</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">Linear transformations preserve correlation:</p>
            <div className="text-center text-yellow-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\rho(aX+b, cY+d) = \\text{sign}(ac) \\cdot \\rho(X,Y)\\]` }} />
            </div>
            <p className="text-xs text-neutral-400">
              for constants <span dangerouslySetInnerHTML={{ __html: `\\(a, b, c, d\\)` }} /> where <span dangerouslySetInnerHTML={{ __html: `\\(a \\neq 0, c \\neq 0\\)` }} />
            </p>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">4. Perfect Correlation</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-2">When <span dangerouslySetInnerHTML={{ __html: `\\(|\\rho| = 1\\)` }} />:</p>
            <div className="text-center text-green-400 my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[Y = aX + b\\]` }} />
            </div>
            <p className="text-xs text-neutral-400">
              Perfect linear relationship: <span dangerouslySetInnerHTML={{ __html: `\\(\\rho = 1\\)` }} /> if <span dangerouslySetInnerHTML={{ __html: `\\(a > 0\\)` }} />, 
              <span dangerouslySetInnerHTML={{ __html: `\\(\\rho = -1\\)` }} /> if <span dangerouslySetInnerHTML={{ __html: `\\(a < 0\\)` }} />
            </p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Relationship to Regression Component
const RelationshipToRegression = React.memo(function RelationshipToRegression({ correlation, data }) {
  const contentRef = useRef(null);
  
  // Calculate standard deviations
  const n = data.length;
  const meanX = data.reduce((sum, d) => sum + d.x, 0) / n;
  const meanY = data.reduce((sum, d) => sum + d.y, 0) / n;
  const Sx = Math.sqrt(data.reduce((sum, d) => sum + Math.pow(d.x - meanX, 2), 0) / (n - 1));
  const Sy = Math.sqrt(data.reduce((sum, d) => sum + Math.pow(d.y - meanY, 2), 0) / (n - 1));
  const slope = correlation * (Sy / Sx);
  
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
  }, [correlation]);
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-purple-400 mb-6">Connection to Linear Regression</h3>
      
      <div ref={contentRef} className="grid md:grid-cols-2 gap-6">
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Regression Slope Formula</h4>
          <div className="text-sm text-neutral-300">
            <p className="mb-3">The slope of the least squares regression line is:</p>
            <div className="text-center text-purple-400 my-4">
              <span dangerouslySetInnerHTML={{ __html: `\\[b_1 = r \\cdot \\frac{S_y}{S_x}\\]` }} />
            </div>
            <p className="text-xs text-neutral-400 mb-2">where:</p>
            <ul className="text-xs text-neutral-400 space-y-1">
              <li>• <span dangerouslySetInnerHTML={{ __html: `\\(r\\)` }} /> = correlation coefficient</li>
              <li>• <span dangerouslySetInnerHTML={{ __html: `\\(S_x\\)` }} /> = standard deviation of X</li>
              <li>• <span dangerouslySetInnerHTML={{ __html: `\\(S_y\\)` }} /> = standard deviation of Y</li>
            </ul>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Current Data Values</h4>
          <div className="text-sm text-neutral-300 space-y-3">
            <div className="grid grid-cols-2 gap-4 font-mono">
              <div>
                <p className="text-xs text-neutral-400 mb-1">Correlation (r)</p>
                <p className={`text-lg font-bold ${correlation > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  {correlation.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Std Dev Ratio</p>
                <p className="text-lg font-bold text-yellow-400">
                  {(Sy / Sx).toFixed(3)}
                </p>
              </div>
            </div>
            <div className="border-t border-neutral-700 pt-3">
              <p className="text-xs text-neutral-400 mb-1">Regression Slope (b₁)</p>
              <p className="text-xl font-bold text-purple-400">
                {slope.toFixed(3)}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                = {correlation.toFixed(3)} × {(Sy / Sx).toFixed(3)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-neutral-900/50 rounded-lg p-4">
        <h4 className="font-bold text-white mb-3">Key Insights</h4>
        <div ref={contentRef} className="text-sm text-neutral-300 space-y-2">
          <p>• When <span dangerouslySetInnerHTML={{ __html: `\\(r = 0\\)` }} />, then <span dangerouslySetInnerHTML={{ __html: `\\(b_1 = 0\\)` }} /> (horizontal regression line)</p>
          <p>• The sign of the slope matches the sign of the correlation</p>
          <p>• Standardizing both variables (z-scores) makes <span dangerouslySetInnerHTML={{ __html: `\\(S_x = S_y = 1\\)` }} />, so <span dangerouslySetInnerHTML={{ __html: `\\(b_1 = r\\)` }} /></p>
          <p>• Correlation explains the strength, while regression gives the rate of change</p>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Correlation Strength Bar Component
const CorrelationStrengthBar = ({ value }) => {
  const getStrengthLabel = (r) => {
    const absR = Math.abs(r);
    if (absR >= 0.9) return "Very Strong";
    if (absR >= 0.7) return "Strong";
    if (absR >= 0.5) return "Moderate";
    if (absR >= 0.3) return "Weak";
    return "Very Weak";
  };

  const getBarColor = (r) => {
    if (r > 0) return "#3b82f6"; // Blue for positive
    return "#ef4444"; // Red for negative
  };

  const strengthLabel = getStrengthLabel(value);
  const barColor = getBarColor(value);
  const barWidth = Math.abs(value) * 50; // Scale to percentage

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-400">Correlation Strength:</span>
        <span className="font-bold" style={{ color: barColor }}>{strengthLabel}</span>
      </div>
      <div className="relative h-8 bg-neutral-700 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-px h-full bg-neutral-500"></div>
        </div>
        <motion.div
          className="absolute h-full rounded-full"
          style={{
            backgroundColor: barColor,
            left: value < 0 ? `${50 - barWidth}%` : '50%',
            width: `${barWidth}%`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-mono font-bold text-sm">{value.toFixed(3)}</span>
        </div>
      </div>
      <div className="flex justify-between text-xs text-neutral-500">
        <span>-1.0</span>
        <span>0.0</span>
        <span>+1.0</span>
      </div>
    </div>
  );
};

// Worked Example Component
const WorkedExample = React.memo(function WorkedExample() {
  const contentRef = useRef(null);
  
  const fuelData = [
    { x: 0.99, y: 90.01 },
    { x: 1.02, y: 89.05 },
    { x: 1.15, y: 91.43 },
    { x: 1.29, y: 93.74 },
    { x: 1.46, y: 96.73 },
    { x: 1.36, y: 94.45 },
    { x: 0.87, y: 87.59 },
    { x: 1.23, y: 91.77 },
    { x: 1.55, y: 99.42 },
    { x: 1.40, y: 93.65 },
    { x: 1.19, y: 93.54 },
    { x: 1.15, y: 92.52 },
    { x: 0.98, y: 90.56 },
    { x: 1.01, y: 89.54 },
    { x: 1.11, y: 89.85 },
    { x: 1.20, y: 90.39 },
    { x: 1.26, y: 93.25 },
    { x: 1.32, y: 93.41 },
    { x: 1.43, y: 94.98 },
    { x: 0.95, y: 87.33 }
  ];
  
  // Calculate statistics
  const n = fuelData.length;
  const sumX = fuelData.reduce((sum, d) => sum + d.x, 0);
  const sumY = fuelData.reduce((sum, d) => sum + d.y, 0);
  const sumX2 = fuelData.reduce((sum, d) => sum + d.x * d.x, 0);
  const sumY2 = fuelData.reduce((sum, d) => sum + d.y * d.y, 0);
  const sumXY = fuelData.reduce((sum, d) => sum + d.x * d.y, 0);
  
  const meanX = sumX / n;
  const meanY = sumY / n;
  
  const Sxx = fuelData.reduce((sum, d) => sum + Math.pow(d.x - meanX, 2), 0);
  const Syy = fuelData.reduce((sum, d) => sum + Math.pow(d.y - meanY, 2), 0);
  const Sxy = fuelData.reduce((sum, d) => sum + (d.x - meanX) * (d.y - meanY), 0);
  
  // Alternative computational formula values
  const SxxAlt = sumX2 - (sumX * sumX) / n;
  const SyyAlt = sumY2 - (sumY * sumY) / n;
  const SxyAlt = sumXY - (sumX * sumY) / n;
  
  const r = Sxy / Math.sqrt(Sxx * Syy);
  
  // Standard deviations
  const sx = Math.sqrt(Sxx / (n - 1));
  const sy = Math.sqrt(Syy / (n - 1));
  
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
    <VisualizationSection className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-6 border border-neutral-700/50">
      <h3 className="text-xl font-bold text-purple-400 mb-6">
        Step-by-Step Calculation: Fuel Quality Example
      </h3>
      
      <div ref={contentRef} className="space-y-6">
        {/* Given Information */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Given Information</h4>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li>• Sample size: <span dangerouslySetInnerHTML={{ __html: `\\(n = 20\\)` }} /> fuel samples</li>
            <li>• X = Specific gravity of fuel</li>
            <li>• Y = Heating value (Btu)</li>
            <li>• Question: Is there a linear relationship between specific gravity and heating value?</li>
          </ul>
        </div>

        {/* Step 1: Calculate Basic Sums */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 1: Calculate Basic Sums</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2">Sum of X values:</p>
                <div className="text-center">
                  <span dangerouslySetInnerHTML={{ __html: `\\[\\sum x_i = ${sumX.toFixed(2)}\\]` }} />
                </div>
              </div>
              <div>
                <p className="mb-2">Sum of Y values:</p>
                <div className="text-center">
                  <span dangerouslySetInnerHTML={{ __html: `\\[\\sum y_i = ${sumY.toFixed(2)}\\]` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Calculate Means */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 2: Calculate Sample Means</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i = \\frac{${sumX.toFixed(2)}}{20} = ${meanX.toFixed(4)}\\]` }} />
            </div>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\bar{y} = \\frac{1}{n}\\sum_{i=1}^{n} y_i = \\frac{${sumY.toFixed(2)}}{20} = ${meanY.toFixed(4)}\\]` }} />
            </div>
          </div>
        </div>

        {/* Step 3: Calculate Sums of Squares */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 3: Calculate Sums of Squares</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p className="mb-3">Using the computational formula:</p>
            
            <div className="bg-neutral-800/50 rounded p-3 mb-4">
              <p className="font-semibold mb-2">For X:</p>
              <div className="text-center my-2">
                <span dangerouslySetInnerHTML={{ __html: `\\[S_{xx} = \\sum x_i^2 - \\frac{(\\sum x_i)^2}{n} = ${sumX2.toFixed(4)} - \\frac{(${sumX.toFixed(2)})^2}{20}\\]` }} />
              </div>
              <div className="text-center">
                <span dangerouslySetInnerHTML={{ __html: `\\[S_{xx} = ${sumX2.toFixed(4)} - ${((sumX * sumX) / n).toFixed(4)} = ${Sxx.toFixed(4)}\\]` }} />
              </div>
            </div>
            
            <div className="bg-neutral-800/50 rounded p-3 mb-4">
              <p className="font-semibold mb-2">For Y:</p>
              <div className="text-center my-2">
                <span dangerouslySetInnerHTML={{ __html: `\\[S_{yy} = \\sum y_i^2 - \\frac{(\\sum y_i)^2}{n} = ${sumY2.toFixed(2)} - \\frac{(${sumY.toFixed(2)})^2}{20}\\]` }} />
              </div>
              <div className="text-center">
                <span dangerouslySetInnerHTML={{ __html: `\\[S_{yy} = ${sumY2.toFixed(2)} - ${((sumY * sumY) / n).toFixed(2)} = ${Syy.toFixed(4)}\\]` }} />
              </div>
            </div>
            
            <div className="bg-neutral-800/50 rounded p-3">
              <p className="font-semibold mb-2">Cross Product:</p>
              <div className="text-center my-2">
                <span dangerouslySetInnerHTML={{ __html: `\\[S_{xy} = \\sum x_i y_i - \\frac{(\\sum x_i)(\\sum y_i)}{n} = ${sumXY.toFixed(2)} - \\frac{(${sumX.toFixed(2)})(${sumY.toFixed(2)})}{20}\\]` }} />
              </div>
              <div className="text-center">
                <span dangerouslySetInnerHTML={{ __html: `\\[S_{xy} = ${sumXY.toFixed(2)} - ${((sumX * sumY) / n).toFixed(2)} = ${Sxy.toFixed(4)}\\]` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Calculate Correlation */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 4: Calculate Correlation Coefficient</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>Apply the formula:</p>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[r = \\frac{S_{xy}}{\\sqrt{S_{xx} \\cdot S_{yy}}} = \\frac{${Sxy.toFixed(4)}}{\\sqrt{${Sxx.toFixed(4)} \\times ${Syy.toFixed(4)}}}\\]` }} />
            </div>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[r = \\frac{${Sxy.toFixed(4)}}{${(Math.sqrt(Sxx * Syy)).toFixed(4)}} = ${r.toFixed(4)}\\]` }} />
            </div>
          </div>
        </div>

        {/* Step 5: Alternative Using Standard Deviations */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 5: Alternative Calculation Using Standard Deviations</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>We can also express correlation using standard deviations:</p>
            <div className="grid md:grid-cols-2 gap-4 my-3">
              <div>
                <p className="text-xs text-neutral-400 mb-1">Standard deviation of X:</p>
                <div className="text-center">
                  <span dangerouslySetInnerHTML={{ __html: `\\[s_x = \\sqrt{\\frac{S_{xx}}{n-1}} = \\sqrt{\\frac{${Sxx.toFixed(4)}}{19}} = ${sx.toFixed(4)}\\]` }} />
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Standard deviation of Y:</p>
                <div className="text-center">
                  <span dangerouslySetInnerHTML={{ __html: `\\[s_y = \\sqrt{\\frac{S_{yy}}{n-1}} = \\sqrt{\\frac{${Syy.toFixed(4)}}{19}} = ${sy.toFixed(4)}\\]` }} />
                </div>
              </div>
            </div>
            <p>Sample covariance:</p>
            <div className="text-center my-2">
              <span dangerouslySetInnerHTML={{ __html: `\\[s_{xy} = \\frac{S_{xy}}{n-1} = \\frac{${Sxy.toFixed(4)}}{19} = ${(Sxy/(n-1)).toFixed(4)}\\]` }} />
            </div>
            <p>Therefore:</p>
            <div className="text-center my-2">
              <span dangerouslySetInnerHTML={{ __html: `\\[r = \\frac{s_{xy}}{s_x \\cdot s_y} = \\frac{${(Sxy/(n-1)).toFixed(4)}}{${sx.toFixed(4)} \\times ${sy.toFixed(4)}} = ${r.toFixed(4)}\\]` }} />
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="bg-gradient-to-br from-teal-900/20 to-teal-800/20 border border-teal-500/30 rounded-lg p-4">
          <h4 className="font-bold text-teal-400 mb-3">Interpretation</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>
              With <span dangerouslySetInnerHTML={{ __html: `\\(r = ${r.toFixed(4)}\\)` }} />, we have a <strong className="text-teal-400">very strong positive</strong> linear relationship.
            </p>
            <p className="mt-2">
              This means: As specific gravity increases, the heating value tends to increase in a nearly linear fashion.
            </p>
            <p className="text-xs text-neutral-400 mt-3">
              <strong>Coefficient of Determination:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(r^2 = ${(r*r).toFixed(4)}\\)` }} /> means {(r*r*100).toFixed(1)}% of the variation in heating value can be explained by specific gravity.
            </p>
            <p className="text-yellow-400 mt-3">
              <strong>Note:</strong> This strong correlation does not imply causation!
            </p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Statistical Significance Testing Component
const StatisticalSignificance = React.memo(function StatisticalSignificance({ correlation, sampleSize }) {
  const contentRef = useRef(null);
  
  // Calculate test statistic
  const tStat = correlation * Math.sqrt((sampleSize - 2) / (1 - correlation * correlation));
  const df = sampleSize - 2;
  
  // Critical values for common significance levels
  const criticalValues = {
    0.10: 1.734,  // t(18, 0.05) for two-tailed
    0.05: 2.101,  // t(18, 0.025) for two-tailed
    0.01: 2.878   // t(18, 0.005) for two-tailed
  };
  
  // Determine significance
  const isSignificant = {
    0.10: Math.abs(tStat) > criticalValues[0.10],
    0.05: Math.abs(tStat) > criticalValues[0.05],
    0.01: Math.abs(tStat) > criticalValues[0.01]
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
  }, [correlation, sampleSize]);
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-400 mb-6">Testing Statistical Significance</h3>
      
      <div ref={contentRef} className="space-y-6">
        {/* Hypothesis Test Setup */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Hypothesis Test for Correlation</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p className="mb-3">Testing whether the population correlation is significantly different from zero:</p>
            <div className="bg-neutral-800/50 rounded p-3 space-y-2">
              <p><strong className="text-blue-400">Null hypothesis:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(H_0: \\rho = 0\\)` }} /> (no linear relationship)</p>
              <p><strong className="text-blue-400">Alternative hypothesis:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(H_1: \\rho \\neq 0\\)` }} /> (linear relationship exists)</p>
            </div>
          </div>
        </div>

        {/* Test Statistic */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Test Statistic</h4>
          <div className="text-sm text-neutral-300 space-y-3">
            <p>Under <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />, the test statistic follows a t-distribution:</p>
            <div className="text-center text-blue-400 my-4">
              <span dangerouslySetInnerHTML={{ __html: `\\[t = \\frac{r\\sqrt{n-2}}{\\sqrt{1-r^2}} \\sim t(n-2)\\]` }} />
            </div>
            <p>For our data:</p>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[t = \\frac{${correlation.toFixed(4)}\\sqrt{${sampleSize}-2}}{\\sqrt{1-${correlation.toFixed(4)}^2}} = \\frac{${correlation.toFixed(4)} \\times ${Math.sqrt(sampleSize-2).toFixed(4)}}{${Math.sqrt(1-correlation*correlation).toFixed(4)}} = ${tStat.toFixed(3)}\\]` }} />
            </div>
            <p className="text-xs text-neutral-400">
              with df = n - 2 = {df} degrees of freedom
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Test Results</h4>
          <div className="text-sm text-neutral-300">
            <div className="space-y-3">
              {Object.entries(criticalValues).map(([alpha, critical]) => (
                <div key={alpha} className={`p-3 rounded ${isSignificant[alpha] ? 'bg-green-900/30 border border-green-500/30' : 'bg-neutral-800/50'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">α = {alpha}</p>
                      <p className="text-xs text-neutral-400">Critical value: ±{critical.toFixed(3)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isSignificant[alpha] ? 'text-green-400' : 'text-neutral-500'}`}>
                        {isSignificant[alpha] ? '✓ Significant' : 'Not Significant'}
                      </p>
                      <p className="text-xs text-neutral-400">
                        |t| = {Math.abs(tStat).toFixed(3)} {isSignificant[alpha] ? '>' : '<'} {critical.toFixed(3)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border border-yellow-500/30 rounded-lg p-4">
          <h4 className="font-bold text-yellow-400 mb-3">Conclusion</h4>
          <div className="text-sm text-neutral-300">
            {isSignificant[0.01] ? (
              <p>
                We reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> at the 0.01 significance level. 
                There is <strong className="text-yellow-400">very strong evidence</strong> of a linear relationship 
                between the variables (p {'<'} 0.01).
              </p>
            ) : isSignificant[0.05] ? (
              <p>
                We reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> at the 0.05 significance level. 
                There is <strong className="text-yellow-400">significant evidence</strong> of a linear relationship 
                between the variables (p {'<'} 0.05).
              </p>
            ) : isSignificant[0.10] ? (
              <p>
                We reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> at the 0.10 significance level. 
                There is <strong className="text-yellow-400">weak evidence</strong> of a linear relationship 
                between the variables (p {'<'} 0.10).
              </p>
            ) : (
              <p>
                We fail to reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} /> at the 0.10 significance level. 
                There is <strong className="text-yellow-400">insufficient evidence</strong> of a linear relationship 
                between the variables (p {'>'} 0.10).
              </p>
            )}
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Enhanced Formula Display Component
const EnhancedFormulaDisplay = React.memo(function EnhancedFormulaDisplay() {
  const contentRef = useRef(null);
  const [activeFormula, setActiveFormula] = useState('definition');
  
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
  }, [activeFormula]);
  
  const formulas = {
    definition: {
      name: 'Definition Formula',
      description: 'The original mathematical definition',
      formula: `\\[r = \\frac{\\sum_{i=1}^{n}(x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum_{i=1}^{n}(x_i - \\bar{x})^2 \\sum_{i=1}^{n}(y_i - \\bar{y})^2}}\\]`,
      notes: 'Measures covariation relative to individual variations'
    },
    computational: {
      name: 'Computational Formula',
      description: 'More efficient for calculations',
      formula: `\\[r = \\frac{n\\sum x_i y_i - \\sum x_i \\sum y_i}{\\sqrt{[n\\sum x_i^2 - (\\sum x_i)^2][n\\sum y_i^2 - (\\sum y_i)^2]}}\\]`,
      notes: 'Avoids computing means explicitly'
    },
    zscore: {
      name: 'Z-Score Formula',
      description: 'Shows correlation as average product of z-scores',
      formula: `\\[r = \\frac{1}{n-1}\\sum_{i=1}^{n}\\left(\\frac{x_i - \\bar{x}}{s_x}\\right)\\left(\\frac{y_i - \\bar{y}}{s_y}\\right) = \\frac{1}{n-1}\\sum_{i=1}^{n}z_{x_i}z_{y_i}\\]`,
      notes: 'Emphasizes that r is dimensionless'
    },
    covariance: {
      name: 'Covariance Form',
      description: 'Normalized covariance',
      formula: `\\[r = \\frac{\\text{Cov}(X,Y)}{\\sigma_X \\cdot \\sigma_Y} = \\frac{S_{xy}}{\\sqrt{S_{xx} \\cdot S_{yy}}}\\]`,
      notes: 'Shows r as standardized covariance'
    }
  };
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-purple-400 mb-6">Multiple Formula Representations</h3>
      
      <div className="space-y-4">
        {/* Formula Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(formulas).map(([key, { name }]) => (
            <button
              key={key}
              onClick={() => setActiveFormula(key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeFormula === key
                  ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-500/50'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        
        {/* Formula Display */}
        <div ref={contentRef} className="bg-neutral-900/50 rounded-lg p-6">
          <h4 className="font-bold text-white mb-2">{formulas[activeFormula].name}</h4>
          <p className="text-sm text-neutral-400 mb-4">{formulas[activeFormula].description}</p>
          
          <div className="my-6 text-center">
            <span dangerouslySetInnerHTML={{ __html: formulas[activeFormula].formula }} />
          </div>
          
          <p className="text-sm text-purple-300 mt-4">
            <strong>Key insight:</strong> {formulas[activeFormula].notes}
          </p>
        </div>
        
        {/* Equivalence Note */}
        <div className="bg-neutral-800/50 rounded-lg p-4">
          <p className="text-sm text-neutral-300">
            <span className="text-yellow-400 font-semibold">Note:</span> All these formulas are mathematically equivalent 
            and will give the same result. Choose based on your computational needs or conceptual understanding.
          </p>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Correlation Patterns Gallery Component
const CorrelationPatternsGallery = React.memo(function CorrelationPatternsGallery() {
  const [selectedPattern, setSelectedPattern] = useState('perfect-positive');
  const svgRef = useRef(null);
  
  const patterns = {
    'perfect-positive': {
      name: 'Perfect Positive (r = 1.0)',
      data: Array.from({ length: 20 }, (_, i) => ({ x: i, y: 2 * i + 5 })),
      description: 'All points lie exactly on an upward sloping line',
      color: '#10b981'
    },
    'strong-positive': {
      name: 'Strong Positive (r ≈ 0.9)',
      data: Array.from({ length: 20 }, (_, i) => ({ 
        x: i, 
        y: 2 * i + 5 + (Math.random() - 0.5) * 4 
      })),
      description: 'Points cluster tightly around an upward trend',
      color: '#3b82f6'
    },
    'moderate-positive': {
      name: 'Moderate Positive (r ≈ 0.5)',
      data: Array.from({ length: 20 }, (_, i) => ({ 
        x: i, 
        y: i + 15 + (Math.random() - 0.5) * 15 
      })),
      description: 'General upward trend with more scatter',
      color: '#06b6d4'
    },
    'no-correlation': {
      name: 'No Correlation (r ≈ 0.0)',
      data: Array.from({ length: 20 }, () => ({ 
        x: Math.random() * 20, 
        y: Math.random() * 40 + 10 
      })),
      description: 'No linear relationship between variables',
      color: '#9ca3af'
    },
    'strong-negative': {
      name: 'Strong Negative (r ≈ -0.9)',
      data: Array.from({ length: 20 }, (_, i) => ({ 
        x: i, 
        y: -2 * i + 45 + (Math.random() - 0.5) * 4 
      })),
      description: 'Points cluster tightly around a downward trend',
      color: '#ef4444'
    },
    'non-linear': {
      name: 'Non-linear (r ≈ 0.0)',
      data: Array.from({ length: 20 }, (_, i) => ({ 
        x: i - 10, 
        y: Math.pow(i - 10, 2) / 10 + 10 + (Math.random() - 0.5) * 2 
      })),
      description: 'Strong pattern but not linear (parabola)',
      color: '#a855f7'
    }
  };
  
  // Calculate correlation for pattern
  const calculateR = (data) => {
    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.x, 0);
    const sumY = data.reduce((sum, d) => sum + d.y, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;
    
    const Sxx = data.reduce((sum, d) => sum + Math.pow(d.x - meanX, 2), 0);
    const Syy = data.reduce((sum, d) => sum + Math.pow(d.y - meanY, 2), 0);
    const Sxy = data.reduce((sum, d) => sum + (d.x - meanX) * (d.y - meanY), 0);
    
    return Sxy / Math.sqrt(Sxx * Syy);
  };
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = svgRef.current.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const pattern = patterns[selectedPattern];
    const data = pattern.data;
    
    // Scales
    const xExtent = d3.extent(data, d => d.x);
    const yExtent = d3.extent(data, d => d.y);
    
    const x = d3.scaleLinear()
      .domain([xExtent[0] - 2, xExtent[1] + 2])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([yExtent[0] - 5, yExtent[1] + 5])
      .range([innerHeight, 0]);
    
    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5))
      .style("font-size", "10px")
      .style("color", "#9ca3af");
    
    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .style("font-size", "10px")
      .style("color", "#9ca3af");
    
    // Add grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x)
        .tickSize(-innerHeight)
        .tickFormat("")
      )
      .style("stroke", "#374151")
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.3);
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .style("stroke", "#374151")
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.3);
    
    // Calculate and draw regression line (except for non-linear)
    if (selectedPattern !== 'non-linear') {
      const r = calculateR(data);
      const meanX = data.reduce((sum, d) => sum + d.x, 0) / data.length;
      const meanY = data.reduce((sum, d) => sum + d.y, 0) / data.length;
      const Sxx = data.reduce((sum, d) => sum + Math.pow(d.x - meanX, 2), 0);
      const Sxy = data.reduce((sum, d) => sum + (d.x - meanX) * (d.y - meanY), 0);
      
      const slope = Sxy / Sxx;
      const intercept = meanY - slope * meanX;
      
      const lineData = [
        { x: xExtent[0] - 2, y: slope * (xExtent[0] - 2) + intercept },
        { x: xExtent[1] + 2, y: slope * (xExtent[1] + 2) + intercept }
      ];
      
      g.append("line")
        .attr("x1", x(lineData[0].x))
        .attr("y1", y(lineData[0].y))
        .attr("x2", x(lineData[1].x))
        .attr("y2", y(lineData[1].y))
        .attr("stroke", pattern.color)
        .attr("stroke-width", 2)
        .attr("opacity", 0.6)
        .attr("stroke-dasharray", selectedPattern === 'no-correlation' ? "5,5" : "none");
    }
    
    // Add scatter points
    g.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 0)
      .attr("fill", pattern.color)
      .attr("opacity", 0.8)
      .transition()
      .duration(500)
      .delay((d, i) => i * 30)
      .attr("r", 4);
    
    // Add correlation value
    const r = calculateR(data);
    g.append("text")
      .attr("x", innerWidth - 10)
      .attr("y", 15)
      .attr("text-anchor", "end")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", pattern.color)
      .text(`r = ${r.toFixed(3)}`);
    
  }, [selectedPattern]);
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/20 border border-indigo-500/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-indigo-400 mb-6">Correlation Patterns Gallery</h3>
      
      <div className="space-y-6">
        {/* Pattern Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(patterns).map(([key, { name }]) => (
            <button
              key={key}
              onClick={() => setSelectedPattern(key)}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                selectedPattern === key
                  ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-500/50'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        
        {/* Visualization */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <svg ref={svgRef} className="w-full"></svg>
          <p className="text-sm text-neutral-300 mt-4">
            <strong className="text-indigo-400">Pattern:</strong> {patterns[selectedPattern].description}
          </p>
        </div>
        
        {/* Important Note */}
        {selectedPattern === 'non-linear' && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-sm text-yellow-300">
              <strong>Important:</strong> This parabolic pattern has a strong relationship, 
              but correlation only measures <em>linear</em> relationships. Always visualize your data!
            </p>
          </div>
        )}
      </div>
    </VisualizationSection>
  );
});

// Key Insights Component
const KeyInsights = () => {
  const [activeTab, setActiveTab] = useState('causation');
  
  const TabContent = React.memo(function TabContent({ tab }) {
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
    }, [tab]);
    
    return (
      <div ref={contentRef} className="p-4">
        {tab === 'causation' && (
          <div className="space-y-4">
            <h4 className="font-bold text-yellow-400">Correlation ≠ Causation</h4>
            <p className="text-sm text-neutral-300">
              Even a perfect correlation doesn't imply one variable causes the other!
            </p>
            <div className="bg-neutral-900/50 rounded p-3 space-y-2">
              <p className="text-sm font-semibold text-white">Classic Examples:</p>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Ice cream sales ↔ Drowning incidents (r ≈ 0.8)</li>
                <li className="text-xs text-neutral-400 ml-4">Hidden variable: Temperature/Summer</li>
                <li>• Number of firefighters ↔ Fire damage (r ≈ 0.9)</li>
                <li className="text-xs text-neutral-400 ml-4">Reverse causation: Bigger fires → More firefighters</li>
              </ul>
            </div>
          </div>
        )}
        
        {tab === 'linearity' && (
          <div className="space-y-4">
            <h4 className="font-bold text-blue-400">Linear Relationships Only</h4>
            <p className="text-sm text-neutral-300">
              Correlation measures <strong>linear</strong> relationships. It can miss curved patterns!
            </p>
            <div className="bg-neutral-900/50 rounded p-3 space-y-2">
              <p className="text-sm font-semibold text-white">Non-linear Examples:</p>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• <span dangerouslySetInnerHTML={{ __html: `\\(y = x^2\\)` }} /> (parabola): r ≈ 0 near origin</li>
                <li>• <span dangerouslySetInnerHTML={{ __html: `\\(y = \\sin(x)\\)` }} /> over full period: r = 0</li>
                <li>• U-shaped relationships: Often r ≈ 0</li>
              </ul>
              <p className="text-xs text-yellow-400 mt-2">
                Always plot your data! Visual inspection reveals patterns correlation might miss.
              </p>
            </div>
          </div>
        )}
        
        {tab === 'scale' && (
          <div className="space-y-4">
            <h4 className="font-bold text-green-400">Scale Invariance</h4>
            <p className="text-sm text-neutral-300">
              Correlation is unaffected by linear transformations of the data.
            </p>
            <div className="bg-neutral-900/50 rounded p-3 space-y-2">
              <p className="text-sm font-semibold text-white">Properties:</p>
              <ul className="text-sm text-neutral-300 space-y-2">
                <li>• Converting units doesn't change r</li>
                <li className="text-xs text-neutral-400 ml-4">
                  Temperature: °C → °F, correlation stays same
                </li>
                <li>• Linear transformations: <span dangerouslySetInnerHTML={{ __html: `\\(r(aX+b, cY+d) = r(X,Y)\\)` }} /></li>
                <li>• Standardized measure: -1 to +1 regardless of units</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  });
  
  return (
    <VisualizationSection className="bg-neutral-800/30 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4 px-6 pt-6">Key Insights</h3>
      
      <div className="border-b border-neutral-700">
        <div className="flex space-x-1 px-6">
          {[
            { id: 'causation', label: 'Correlation ≠ Causation', icon: Info },
            { id: 'linearity', label: 'Linear Only', icon: Activity },
            { id: 'scale', label: 'Scale Invariant', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === id
                  ? 'bg-neutral-700 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <TabContent tab={activeTab} />
    </VisualizationSection>
  );
};

// Main Component
export default function CorrelationCoefficient() {
  // Pre-defined scenarios
  const scenarios = {
    'perfect-positive': {
      name: 'Perfect Positive',
      data: Array.from({ length: 20 }, (_, i) => ({ 
        x: i, 
        y: 2 * i + 10 
      })),
      rho: 1.0
    },
    'strong-positive': {
      name: 'Strong Positive',
      data: Array.from({ length: 20 }, (_, i) => ({ 
        x: i + (Math.random() - 0.5) * 2, 
        y: 2 * i + 10 + (Math.random() - 0.5) * 4 
      })),
      rho: 0.85
    },
    'moderate': {
      name: 'Moderate Positive',
      data: Array.from({ length: 20 }, (_, i) => ({ 
        x: i + (Math.random() - 0.5) * 4, 
        y: 1.5 * i + 10 + (Math.random() - 0.5) * 8 
      })),
      rho: 0.50
    },
    'none': {
      name: 'No Correlation',
      data: Array.from({ length: 20 }, () => ({ 
        x: Math.random() * 20, 
        y: Math.random() * 30 + 10 
      })),
      rho: 0.0
    },
    'strong-negative': {
      name: 'Strong Negative',
      data: Array.from({ length: 20 }, (_, i) => ({ 
        x: i + (Math.random() - 0.5) * 2, 
        y: -2 * i + 40 + (Math.random() - 0.5) * 4 
      })),
      rho: -0.85
    }
  };
  
  // State
  const [scenario, setScenario] = useState('strong-positive');
  const [showCalculation, setShowCalculation] = useState(false);
  const [showDeviations, setShowDeviations] = useState(false);
  const [showWorkedExample, setShowWorkedExample] = useState(false);
  
  const svgRef = useRef(null);
  
  // Get current data
  const currentData = scenarios[scenario].data;
  
  // Calculate correlation
  const calculateCorrelation = (data) => {
    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.x, 0);
    const sumY = data.reduce((sum, d) => sum + d.y, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;
    
    const Sxx = data.reduce((sum, d) => sum + Math.pow(d.x - meanX, 2), 0);
    const Syy = data.reduce((sum, d) => sum + Math.pow(d.y - meanY, 2), 0);
    const Sxy = data.reduce((sum, d) => sum + (d.x - meanX) * (d.y - meanY), 0);
    
    const r = Sxy / Math.sqrt(Sxx * Syy);
    
    return { r, meanX, meanY, Sxx, Syy, Sxy };
  };
  
  const stats = calculateCorrelation(currentData);
  
  // Visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = svgRef.current.clientWidth;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Scales
    const xExtent = d3.extent(currentData, d => d.x);
    const yExtent = d3.extent(currentData, d => d.y);
    
    const x = d3.scaleLinear()
      .domain([xExtent[0] - 2, xExtent[1] + 2])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([yExtent[0] - 5, yExtent[1] + 5])
      .range([innerHeight, 0]);
    
    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .style("font-size", "12px")
      .style("color", "#9ca3af");
    
    g.append("g")
      .call(d3.axisLeft(y))
      .style("font-size", "12px")
      .style("color", "#9ca3af");
    
    // Add axis labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 45)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#e5e7eb")
      .text("X Variable");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#e5e7eb")
      .text("Y Variable");
    
    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x)
        .tickSize(-innerHeight)
        .tickFormat("")
      )
      .style("stroke", "#374151")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5);
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .style("stroke", "#374151")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5);
    
    // Add mean lines if showing deviations
    if (showDeviations) {
      g.append("line")
        .attr("x1", x(stats.meanX))
        .attr("x2", x(stats.meanX))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#fbbf24")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.5);
      
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", y(stats.meanY))
        .attr("y2", y(stats.meanY))
        .attr("stroke", "#fbbf24")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.5);
      
      // Add deviation rectangles
      currentData.forEach((d, i) => {
        const devX = d.x - stats.meanX;
        const devY = d.y - stats.meanY;
        const color = (devX * devY > 0) ? "#10b981" : "#ef4444";
        
        g.append("rect")
          .attr("x", Math.min(x(d.x), x(stats.meanX)))
          .attr("y", Math.min(y(d.y), y(stats.meanY)))
          .attr("width", Math.abs(x(d.x) - x(stats.meanX)))
          .attr("height", Math.abs(y(d.y) - y(stats.meanY)))
          .attr("fill", color)
          .attr("opacity", 0.1)
          .attr("stroke", color)
          .attr("stroke-width", 0.5)
          .attr("stroke-opacity", 0.3);
      });
    }
    
    // Calculate and draw regression line
    const slope = stats.Sxy / stats.Sxx;
    const intercept = stats.meanY - slope * stats.meanX;
    
    const lineData = [
      { x: xExtent[0] - 2, y: slope * (xExtent[0] - 2) + intercept },
      { x: xExtent[1] + 2, y: slope * (xExtent[1] + 2) + intercept }
    ];
    
    g.append("line")
      .attr("x1", x(lineData[0].x))
      .attr("y1", y(lineData[0].y))
      .attr("x2", x(lineData[1].x))
      .attr("y2", y(lineData[1].y))
      .attr("stroke", "#14b8a6")
      .attr("stroke-width", 2)
      .attr("opacity", 0.8);
    
    // Add scatter points
    g.selectAll(".dot")
      .data(currentData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 0)
      .attr("fill", "#3b82f6")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.5)
      .transition()
      .duration(500)
      .delay((d, i) => i * 50)
      .attr("r", 6);
    
    // Add correlation value display
    g.append("text")
      .attr("x", innerWidth - 10)
      .attr("y", 20)
      .attr("text-anchor", "end")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("fill", stats.r > 0 ? "#3b82f6" : "#ef4444")
      .text(`r = ${stats.r.toFixed(3)}`);
    
  }, [currentData, showDeviations, stats]);
  
  return (
    <VisualizationContainer
      title="Correlation Coefficient"
      description="Explore the strength and direction of linear relationships between variables."
    >
      <div className="space-y-8">
        {/* Back to Hub Button */}
        <BackToHub chapter={7} />

        {/* Introduction */}
        <VisualizationSection>
          <div className="text-center space-y-4">
            <CorrelationIntroduction />
          </div>
        </VisualizationSection>

        {/* Mathematical Framework */}
        <MathematicalFramework />

        {/* Mathematical Properties */}
        <MathematicalProperties />

        {/* Main Visualization with Controls */}
        <GraphContainer title="Interactive Correlation Explorer" className="!bg-transparent">
          {/* Interactive Controls - Moved above the chart */}
          <div className="mb-6 space-y-6">
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Explore Different Scenarios</h4>
              <ControlGroup label="Correlation Pattern">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.entries(scenarios).map(([key, { name }]) => (
                    <button
                      key={key}
                      onClick={() => setScenario(key)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        scenario === key
                          ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-500/50'
                          : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </ControlGroup>

              <ControlGroup label="Visualization Options">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showDeviations}
                      onChange={(e) => setShowDeviations(e.target.checked)}
                      className="rounded"
                    />
                    <span>Show deviations from means</span>
                  </label>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Green rectangles: positive contribution to correlation<br/>
                  Red rectangles: negative contribution to correlation
                </p>
              </ControlGroup>
            </div>
          </div>

          {/* Chart */}
          <svg ref={svgRef} className="w-full"></svg>
        </GraphContainer>

        {/* Correlation Strength Indicator */}
        <VisualizationSection className="bg-neutral-800/50 rounded-lg p-6">
          <CorrelationStrengthBar value={stats.r} />
        </VisualizationSection>

        {/* Relationship to Regression */}
        <RelationshipToRegression correlation={stats.r} data={currentData} />

        {/* Worked Example */}
        <div className="space-y-4">
          <button
            onClick={() => setShowWorkedExample(!showWorkedExample)}
            className="w-full px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white"
          >
            {showWorkedExample ? "Hide" : "Show"} Worked Example: Fuel Quality Analysis
          </button>
          
          {showWorkedExample && <WorkedExample />}
        </div>

        {/* Statistical Significance Testing */}
        <StatisticalSignificance correlation={stats.r} sampleSize={currentData.length} />

        {/* Enhanced Formula Display */}
        <EnhancedFormulaDisplay />

        {/* Correlation Patterns Gallery */}
        <CorrelationPatternsGallery />

        {/* Key Insights */}
        <KeyInsights />

        {/* Summary Statistics */}
        <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Current Data Summary</h3>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="bg-neutral-900/50 rounded p-4">
              <h4 className="font-bold text-white mb-3">Basic Statistics</h4>
              <div className="space-y-2 font-mono text-neutral-300">
                <div className="flex justify-between">
                  <span>n:</span>
                  <span>{currentData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mean X:</span>
                  <span>{stats.meanX.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mean Y:</span>
                  <span>{stats.meanY.toFixed(3)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-900/50 rounded p-4">
              <h4 className="font-bold text-white mb-3">Correlation Components</h4>
              <div className="space-y-2 font-mono text-neutral-300">
                <div className="flex justify-between">
                  <span>Sxx:</span>
                  <span>{stats.Sxx.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Syy:</span>
                  <span>{stats.Syy.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sxy:</span>
                  <span className={stats.Sxy > 0 ? "text-green-400" : "text-red-400"}>
                    {stats.Sxy.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </VisualizationSection>
      </div>
    </VisualizationContainer>
  );
}