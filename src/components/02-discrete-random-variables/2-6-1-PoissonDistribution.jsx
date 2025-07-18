"use client";
import React, { useState, useEffect, useRef } from "react";
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

// Main Component
const PoissonDistribution = React.memo(function PoissonDistribution() {
  const [lambda, setLambda] = useState(3);
  const [windowSize, setWindowSize] = useState(2);
  const [activeTab, setActiveTab] = useState('timeline');
  const [isAnimating, setIsAnimating] = useState(false);
  const [singleEventMode, setSingleEventMode] = useState(false);
  const [eventAnimation, setEventAnimation] = useState(null);
  const contentRef = useRef(null);
  
  // Calculate statistics
  const mean = lambda;
  const variance = lambda;
  const stdDev = Math.sqrt(variance);
  
  // Handle edge cases for performance
  const effectiveLambda = lambda > 5 ? 5 : lambda; // Limit visual elements for performance

  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax(); // Try immediately
    const timeoutId = setTimeout(processMathJax, 100); // CRITICAL: Retry after 100ms
    return () => clearTimeout(timeoutId);
  }, [lambda]);
  
  return (
    <VisualizationContainer
      title="Poisson Distribution"
      description="Explore the Poisson distribution - modeling the number of events occurring in a fixed interval"
    >
      {/* Enhanced header with gradient background */}
      <div className="relative bg-gradient-to-r from-blue-900/50 to-blue-800/40 rounded-xl p-5 mb-6 border border-blue-600/60 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-amber-500/10" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <span className="p-1.5 bg-blue-500/20 rounded-lg">
                <span className="block w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              </span>
              Unique Property
            </h3>
            <p className="text-sm text-gray-300">
              The Poisson distribution is the only discrete distribution where:
            </p>
            <div className="mt-2 font-mono text-yellow-400 text-lg bg-yellow-500/10 px-3 py-1 rounded-lg inline-block">
              <span dangerouslySetInnerHTML={{ __html: `E[X] = \text{Var}(X) = \lambda` }} />
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Current λ</div>
            <div className="text-4xl font-mono font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              {formatNumber(lambda, 1)}
            </div>
          </div>
        </div>
      </div>
      
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
      
      {/* Mathematical Formula */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Probability Mass Function</h3>
        <div ref={contentRef} className="text-center py-2">
          <span className="text-lg" dangerouslySetInnerHTML={{ __html: `\(P(X = k) = \frac{\lambda^k e^{-\lambda}}{k!}\)` }} />
        </div>
        <div className="text-xs text-gray-400 text-center mt-2">
          where k = 0, 1, 2, ... (number of events)
        </div>
      </div>
      
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
    </VisualizationContainer>
  );
});

export default PoissonDistribution;
