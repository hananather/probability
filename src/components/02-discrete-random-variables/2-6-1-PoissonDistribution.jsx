"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { 
  VisualizationContainer, 
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, cn, createColorScheme, formatNumber } from '../../lib/design-system';
import { Button } from '../ui/button';
import { RangeSlider } from '../ui/RangeSlider';
import { Play, Pause, Timer, Calculator } from 'lucide-react';

// Import separated components
import { PoissonTimeline } from './components/PoissonTimeline';
import { PoissonPMF } from './components/PoissonPMF';
import { BinomialApproximation } from './components/BinomialApproximation';
import { Chapter2ReferenceSheet } from '../reference-sheets/Chapter2ReferenceSheet';

// Enhanced color scheme for Poisson distribution
const poissonColors = {
  primary: '#60A5FA', // bright blue-400
  primaryLight: '#93c5fd', // blue-300
  primaryDark: '#3b82f6', // blue-600
  secondary: '#facc15', // bright yellow
  tertiary: '#10b981', // bright emerald-500
  accent: '#f59e0b', // amber-500
  area: 'rgba(96, 165, 250, 0.4)', // blue with higher opacity
  grid: '#6b7280', // brighter gray-500 for better visibility
  gradients: {
    primary: 'linear-gradient(135deg, #60A5FA 0%, #3b82f6 100%)',
    secondary: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
    event: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  }
};

// Tab configuration
const TABS = [
  { id: 'timeline', label: 'Timeline View', icon: <Timer className="w-3 h-3" /> },
  { id: 'approximation', label: 'Binomial Approximation', icon: <Calculator className="w-3 h-3" /> }
];

// Key Concepts Card with LaTeX (using LinearRegressionHub scaffolding)
const PoissonConceptsCard = React.memo(() => {
  const contentRef = useRef(null);
  const concepts = [
    { term: "PMF Formula", definition: "Probability mass function", latex: "P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}" },
    { term: "Expected Value", definition: "Average number of events", latex: "E[X] = \\lambda" },
    { term: "Variance", definition: "Equal to the mean", latex: "\\text{Var}(X) = \\lambda" },
    { term: "Unique Property", definition: "Mean equals variance", latex: "E[X] = \\text{Var}(X) = \\lambda" },
  ];

  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax(); // Try immediately
    const timeoutId = setTimeout(processMathJax, 100); // CRITICAL: Retry after 100ms
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <Card ref={contentRef} className="mb-8 p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Poisson Distribution Concepts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concepts.map((concept, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-white">{concept.term}</h4>
                <p className="text-sm text-gray-400 mt-1">{concept.definition}</p>
              </div>
              <div className="text-lg font-mono text-blue-400">
                <span dangerouslySetInnerHTML={{ __html: `\\(${concept.latex}\\)` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
});

// Main Component
const PoissonDistribution = React.memo(function PoissonDistribution() {
  const [lambda, setLambda] = useState(3);
  const [windowSize, setWindowSize] = useState(2);
  const [activeTab, setActiveTab] = useState('timeline');
  const [isAnimating, setIsAnimating] = useState(false);
  const [singleEventMode, setSingleEventMode] = useState(false);
  const [eventAnimation, setEventAnimation] = useState(null);
  
  // Calculate statistics
  const mean = lambda;
  const variance = lambda;
  const stdDev = Math.sqrt(variance);
  
  // Handle edge cases for performance
  const effectiveLambda = lambda > 5 ? 5 : lambda; // Limit visual elements for performance

  return (
    <>
      <Chapter2ReferenceSheet mode="floating" />
      <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Poisson Distribution Explorer
          </h1>
          <p className="text-xl text-gray-400">
            Model the number of events occurring in a fixed interval
          </p>
        </motion.div>

        {/* Key Concepts Card */}
        <PoissonConceptsCard />

        {/* Introduction Text */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-700/50">
          <h2 className="text-2xl font-bold text-white mb-3">What is the Poisson Distribution?</h2>
          <p className="text-gray-300">
            The Poisson distribution models the number of events occurring in a fixed interval of time or space. 
            From phone calls per hour to defects per product, it's essential for modeling rare events. 
            Its unique property is that the mean equals the variance, making it particularly elegant for analysis.
          </p>
        </Card>

        {/* Interactive Component */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
      
      {/* Parameter Controls */}
      <ControlGroup>
        <RangeSlider
          label="Rate parameter (λ)"
          value={lambda}
          onChange={setLambda}
          min={0}
          max={10}
          step={0.1}
          formatValue={v => formatNumber(v, 1)}
          className="flex-1"
        />
        
        {activeTab === 'timeline' && (
          <>
            <RangeSlider
              label="Window size"
              value={windowSize}
              onChange={setWindowSize}
              min={0.5}
              max={5}
              step={0.5}
              formatValue={v => `${v} units`}
              className="flex-1"
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsAnimating(!isAnimating)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform flex items-center gap-2",
                  "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                  "text-white shadow-md hover:shadow-lg hover:scale-[1.02]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                )}
                disabled={lambda <= 0}
              >
                {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isAnimating ? 'Pause' : 'Animate'}
              </button>
              
              <button
                onClick={() => setSingleEventMode(!singleEventMode)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  singleEventMode
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                    : "bg-gradient-to-r from-neutral-600 to-neutral-700 text-white",
                  "shadow-md hover:shadow-lg",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                disabled={lambda <= 0}
              >
                {singleEventMode ? 'Batch Mode' : 'Single Event'}
              </button>
            </div>
          </>
        )}
      </ControlGroup>
      
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-800/50 rounded-lg p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200",
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            )}
          >
            {tab.icon}
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Main Content Area */}
      <div className="grid gap-6">
        {/* Timeline View */}
        {activeTab === 'timeline' && (
          <>
            <PoissonTimeline
              lambda={effectiveLambda}
              windowSize={windowSize}
              isAnimating={isAnimating}
            />
            
            <PoissonPMF lambda={lambda} />
          </>
        )}
        
        {/* Binomial Approximation View */}
        {activeTab === 'approximation' && (
          <BinomialApproximation lambda={lambda} />
        )}
      </div>
      
      {/* Statistics Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Mean (E[X])</div>
          <div className="text-2xl font-mono text-blue-400">{formatNumber(mean, 2)}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Variance (Var[X])</div>
          <div className="text-2xl font-mono text-blue-400">{formatNumber(variance, 2)}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Std Dev (σ)</div>
          <div className="text-2xl font-mono text-gray-300">{formatNumber(stdDev, 2)}</div>
        </div>
      </div>
        </Card>
      </div>
    </div>
    </>
  );
});

export default PoissonDistribution;
